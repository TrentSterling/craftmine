'use strict';
// Serve reviewed local landing bytes at the canonical route. Link destinations
// are inert fixtures; never load the game, lofigen runtime, analytics or downloads.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {chromium,webkit,request}=require('playwright');
const {compareTop}=require('./pixels.cjs');
const root=path.resolve(__dirname,'../..');
for(const name of ['LANDING_BASELINE_ROOT','LANDING_SHARED_ROOT','LANDING_BLOG_ROOT']) assert.ok(process.env[name],name+' is required');
const base=path.resolve(process.env.LANDING_BASELINE_ROOT),shared=path.resolve(process.env.LANDING_SHARED_ROOT),blog=path.resolve(process.env.LANDING_BLOG_ROOT);
const out=path.resolve(process.env.LANDING_SCREENSHOTS||'.local/landing-review');fs.mkdirSync(out,{recursive:true});
const origin='https://tront.xyz',routePath='/craftmine/',assets=new Map();
const destinations=['https://tront.xyz/lofigen/','https://tront.xyz/blog/posts/craftmine/'];
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const report={status:'running',cases:[],interceptedDestinations:[],runtimeRequests:0,downloads:0,assetHashes:[],zoomMethod:'CSS zoom:2 reflow stress, not native browser zoom',animationFixture:'Compare original declarations, then pause the same infinite animations at time zero.'},started=Date.now();
const hash=body=>createHash('sha256').update(body).digest('hex');
const measure=()=>{
  const box=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{x:r.x,y:r.y,width:r.width,height:r.height,color:s.color,background:s.background,font:s.font};};
  return{scrollWidth:document.documentElement.scrollWidth,heading:box(document.querySelector('h1')),nav:box(document.querySelector('nav')),actions:[...document.querySelectorAll('a[href="play/"]')].map(a=>({href:a.getAttribute('href'),...box(a)}))};
};
const animationDeclarations=()=>document.getAnimations().map(animation=>{
  const target=animation.effect.target,style=getComputedStyle(target),timing=animation.effect.getTiming();
  return{name:animation.animationName||animation.id,target:{tag:target.tagName,id:target.id,className:target.className},timing:{...timing,iterations:String(timing.iterations)},keyframes:animation.effect.getKeyframes(),css:{name:style.animationName,duration:style.animationDuration,delay:style.animationDelay,direction:style.animationDirection,fillMode:style.animationFillMode,iterations:style.animationIterationCount,timingFunction:style.animationTimingFunction,playState:style.animationPlayState}};
});
(async()=>{
  if(process.env.LANDING_FONT_CACHE)for(const [url,value]of Object.entries(JSON.parse(fs.readFileSync(process.env.LANDING_FONT_CACHE)))){
    const body=fs.readFileSync(value.file);assert.equal(hash(body),value.sha256);assets.set(url,{body,contentType:value.contentType});
  }
  const client=await request.newContext({timeout:20000});
  const cssUrl=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/href="(https:\/\/fonts.googleapis.com\/css2[^"]+)"/)[1];
  async function cache(url,contentType){if(assets.has(url))return;const response=await client.get(url);assert.equal(response.status(),200,url);assets.set(url,{body:await response.body(),contentType:contentType||response.headers()['content-type']});}
  await cache(cssUrl,'text/css');
  for(const match of assets.get(cssUrl).body.toString().matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))await cache(match[1]);
  assets.set(origin+'/blog/assets/img/tront.png',{body:fs.readFileSync(path.join(blog,'assets/img/tront.png')),contentType:'image/png'});
  for(const [url,value]of assets)report.assetHashes.push({url,sha256:hash(value.body)});
  for(const file of ['assets/css/tront-themes.css','assets/js/tront-theme.js'])report.assetHashes.push({url:origin+'/'+file,sha256:hash(fs.readFileSync(path.join(shared,file)))});
  await client.dispose();
  const browser=await(process.env.LANDING_BROWSER==='webkit'?webkit:chromium).launch({headless:true,executablePath:process.env.LANDING_BROWSER_EXECUTABLE||undefined});
  async function open(source,width,zoom,javaScriptEnabled,theme){
    const context=await browser.newContext({viewport:{width,height:width<500?844:900},colorScheme:'dark',reducedMotion:'reduce',javaScriptEnabled,serviceWorkers:'block',acceptDownloads:false});
    await context.addInitScript(value=>localStorage.setItem('tront-theme',value),theme);
    const errors=[],missing=[];
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(assets.has(url.href))return route.fulfill(assets.get(url.href));
      if(destinations.includes(url.href)){report.interceptedDestinations.push(url.href);return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Intercepted link</title><p>Inert destination fixture</p>'});}
      if(url.pathname.startsWith('/craftmine/play/')||url.pathname.startsWith('/lofigen/')){report.runtimeRequests++;return route.abort();}
      if(/\.(exe|zip|mp4)$/.test(url.pathname)){report.downloads++;return route.abort();}
      if(url.origin!==origin)return route.abort();
      const local=url.pathname.startsWith(routePath),sourceRoot=local?source:shared;
      let file=path.resolve(sourceRoot,local?'.'+url.pathname.slice('/craftmine'.length):'.'+url.pathname);
      assert.ok(file===sourceRoot||file.startsWith(sourceRoot+path.sep));
      if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      if(!fs.existsSync(file)){missing.push(url.pathname);return route.fulfill({status:404,body:'Missing local fixture'});}
      return route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});
    });
    const page=await context.newPage();page.__noScript=!javaScriptEnabled;page.on('pageerror',e=>errors.push(e.message));page.on('download',()=>report.downloads++);
    await page.goto(origin+routePath,{waitUntil:'networkidle'});
    if(zoom!==1)await page.evaluate(value=>document.documentElement.style.zoom=value,zoom);
    return{context,page,errors,missing};
  }
  async function settle(page){
    if(!page.__noScript)await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
    const states=await page.evaluate(()=>document.getAnimations().filter(animation=>animation.effect.getTiming().iterations===Infinity).map(animation=>{animation.pause();animation.currentTime=0;return{state:animation.playState,time:animation.currentTime};}));
    for(const animation of states){assert.equal(animation.state,'paused');assert.equal(animation.time,0);}
  }
  async function shot(page,name){await page.bringToFront();await settle(page);return page.screenshot({path:path.join(out,name+'.png'),animations:'allow'});}
  async function content(page){
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),origin+routePath);
    const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());assert.equal(schema['@type'],'VideoGame');assert.equal(schema.author['@id'],origin+'/#trent-sterling');
    assert.equal(await page.locator('a[href="play/"]').count(),2);
    assert.equal(await page.locator('.feature-card').filter({has:page.locator('h3',{hasText:'Procedural Music'})}).locator('p').textContent(),'Seed-based lofi music system. Every world gets its own soundtrack generated from the world seed.');
    assert.equal(await page.locator('.page-footer p').nth(1).textContent(),'Built by Trent Sterling. One file. All vibes.');
  }
  async function focusLink(page,url,previous,name,width){
    await page.bringToFront();
    const link=page.locator('a[href="'+url+'"]');assert.equal(await link.count(),1);assert.equal(await link.getAttribute('target'),null);
    await link.evaluate(a=>a.scrollIntoView({behavior:'instant',block:'center'}));
    // Position the viewport, then set the preceding tab stop without starting a
    // competing smooth-scroll animation. The next focus move is native Tab.
    await page.locator(previous).evaluate(a=>a.focus({preventScroll:true}));await page.keyboard.press('Tab');
    assert.equal(await link.evaluate(a=>document.activeElement===a),true,'native Tab reaches contextual link');
    await page.waitForFunction(url=>{const a=document.querySelector('a[href="'+url+'"]'),r=a.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;},url,{polling:50,timeout:5000});
    await shot(page,name);
    const state=await link.evaluate(a=>{const s=getComputedStyle(a),range=document.createRange();range.selectNodeContents(a);return{label:a.textContent,visible:a.matches(':focus-visible'),outline:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth),viewport:{width:innerWidth,height:innerHeight},rects:[...range.getClientRects()].map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}))};});
    report.lastFocus={url,...state};
    assert.ok(state.visible);assert.notEqual(state.outline,'none');assert.ok(state.outlineWidth>0);assert.ok(state.rects.length);
    for(const rect of state.rects){assert.ok(rect.width>0&&rect.height>0);assert.ok(rect.left>=-1&&rect.right<=width+1,'wrapped text stays horizontally visible');assert.ok(rect.top>=0&&rect.bottom<=state.viewport.height+1,'focused text stays in viewport');}
    await Promise.all([page.waitForURL(url),page.keyboard.press('Enter')]);
    await page.goBack({waitUntil:'networkidle'});return state;
  }
  try{
    const cases=[[1440,1,true,'dark'],[375,1,true,'dark'],[320,1,true,'dark'],[375,2,true,'dark'],[320,2,true,'dark'],[320,1,false,'dark'],[1440,1,true,'light'],[320,1,true,'light']];
    for(const [width,zoom,javaScriptEnabled,theme]of cases){
      const before=await open(base,width,zoom,javaScriptEnabled,theme),after=await open(root,width,zoom,javaScriptEnabled,theme),name=[width,zoom,javaScriptEnabled,theme].join('-');
      const animations=await before.page.evaluate(animationDeclarations);assert.deepEqual(await after.page.evaluate(animationDeclarations),animations,'original animation identities and declarations unchanged');
      const originalTop=await shot(before.page,name+'-top-before'),geometry=await before.page.evaluate(measure);
      const candidateTop=await shot(after.page,name+'-top-after');assert.deepEqual(await after.page.evaluate(measure),geometry,'original navigation, heading, play controls and page width unchanged');
      const pixels=compareTop(originalTop,candidateTop,{javaScriptEnabled,width,playBox:geometry.actions[0]});
      await content(after.page);
      await before.page.locator('.feature-card').nth(4).evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));await shot(before.page,name+'-music-before');
      await before.page.locator('.page-footer').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'end'}));await shot(before.page,name+'-footer-before');
      const music=await focusLink(after.page,destinations[0],'.hero a[href="https://github.com/TrentSterling/craftmine"]',name+'-music-after',width);
      // Reapply the reflow fixture after history traversal if the engine rebuilt it.
      if(zoom!==1)await after.page.evaluate(value=>document.documentElement.style.zoom=value,zoom);
      const article=await focusLink(after.page,destinations[1],'.page-footer a[href="https://tront.xyz/discord/"]',name+'-footer-after',width);
      await after.page.reload({waitUntil:'networkidle'});await content(after.page);
      for(const state of [before,after]){assert.deepEqual(state.errors,[]);assert.deepEqual(state.missing,[]);}
      report.cases.push({width,zoom,javaScriptEnabled,theme,animations,topPixels:pixels,originalGeometryIdentical:true,music,article,directRouteBackReload:true});
      await before.context.close();await after.context.close();console.log('PASS CraftMine author/discovery',name);
    }
    assert.equal(report.interceptedDestinations.length,16);assert.equal(report.runtimeRequests,0);assert.equal(report.downloads,0);report.status='passed';
  }catch(error){report.status='failed';report.error=error.stack;throw error;}
  finally{report.durationMs=Date.now()-started;fs.writeFileSync(path.join(out,'landing-report.json'),JSON.stringify(report,null,2));await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
