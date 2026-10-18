'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { assertCandidate, normalize } = require('./contracts.cjs');
const manifest = require('./reviewed.json');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
test('four exact additions preserve every other landing byte against the real PR base', () => {
  assert.ok(process.env.LANDING_BASELINE_ROOT, 'LANDING_BASELINE_ROOT is required');
  assertCandidate(html);
  assert.equal(normalize(html), normalize(fs.readFileSync(path.join(process.env.LANDING_BASELINE_ROOT, 'index.html'),'utf8')));
});
test('one VideoGame retains its author, role, URL and existing project metadata', () => {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length,1);
  const game = JSON.parse(scripts[0][1]);
  assert.equal(game['@type'],'VideoGame');
  assert.deepEqual(game.author, {'@type':'Person','@id':'https://tront.xyz/#trent-sterling',name:'Trent Sterling',url:'https://tront.xyz'});
  assert.equal(game.url,'https://tront.xyz/craftmine/');
  assert.equal([...html.matchAll(/<link rel="canonical"/g)].length,1);
  assert.ok(html.includes('<link rel="canonical" href="'+game.url+'">'));
  assert.ok(fs.readFileSync(path.join(root,'play/index.html'),'utf8').includes('<link rel="canonical" href="'+game.url+'">'));
});
test('contextual links preserve music wording, primary actions and original credits', () => {
  assert.ok(html.includes('Seed-based <a href="https://tront.xyz/lofigen/">lofi music system</a>. Every world gets its own soundtrack generated from the world seed.'));
  assert.ok(html.includes('<a href="https://tront.xyz/blog/posts/craftmine/">CraftMine devlog</a>'));
  assert.equal([...html.matchAll(/href="play\/"/g)].length,2);
  assert.ok(html.includes('Built by <a href="https://tront.xyz">Trent Sterling</a>. One file. All vibes.'));
  assert.ok(html.includes('Zero build tools. AI-generated.'));
});
test('all existing non-landing files, including the complete runtime and images, retain frozen bytes', () => {
  for(const [file,digest] of Object.entries(manifest.protectedFiles)) assert.equal(hash(fs.readFileSync(path.join(root,file))),digest,file);
  const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
  for(const file of files) assert.ok(file==='index.html'||file in manifest.protectedFiles||file.startsWith('tools/landing/')||file==='.github/workflows/landing-checks.yml','no unrelated new production: '+file);
});
test('normalization supports an already-fixed base without hiding missing or duplicate additions', () => {
  const original=normalize(html); assert.equal(normalize(original),original); assert.equal(normalize(html),normalize(html));
  for(const change of manifest.changes) {
    assert.throws(()=>assertCandidate(html.replace(change.after,change.before)));
    assert.throws(()=>normalize(html+change.after));
    assert.throws(()=>assertCandidate(html+change.after));
  }
});
test('changed copy, canonical, credit, author role, target, play link and styles fail preservation', () => {
  const original=normalize(html);
  for(const [before,after] of [['CraftMine devlog','Different article'],['https://tront.xyz/lofigen/','https://example.com/'],['#trent-sterling','#someone-else'],['"Person"','"Organization"'],['Built by','Made by'],['href="play/"','href="wrong/"'],['One file. All vibes.','Changed credit.'],['animation: background-aurora 6s','animation: background-aurora 7s'],['rel="canonical" href="https://tront.xyz/craftmine/"','rel="canonical" href="https://tront.xyz/wrong/"']]) {
    const mutated=html.replace(before,after);assert.notEqual(mutated,html);
    let result; try { result=normalize(mutated); } catch(e) { assert.equal(e.code,'ERR_ASSERTION'); continue; }
    assert.notEqual(result,original);
  }
});
test('all inline style and script declarations are byte-identical to the actual base', () => {
  const base=fs.readFileSync(path.join(process.env.LANDING_BASELINE_ROOT,'index.html'),'utf8');
  const styles=value=>[...value.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(m=>m[0]);
  const scripts=value=>[...value.matchAll(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g)].map(m=>m[0]);
  assert.deepEqual(styles(html),styles(base));assert.deepEqual(scripts(html),scripts(base));
});
test('CI uses exact head/base, pinned shared source and the strict browser gate', () => {
  const workflow=fs.readFileSync(path.join(root,'.github/workflows/landing-checks.yml'),'utf8');
  for(const text of ['github.event.pull_request.head.sha','github.event.pull_request.base.sha',manifest.sharedSource,manifest.blogSource,'node --test tools/landing/test.cjs','node tools/landing/browser.cjs','contents: read','persist-credentials: false']) assert.ok(workflow.includes(text),text);
});

test('pixel diagnostic permits only the observed no-JS gradient rounding',()=>{
  const {PNG}=require('pngjs'),{compareTop}=require('./pixels.cjs');
  const a=new PNG({width:320,height:844});a.data.fill(40);
  const options={javaScriptEnabled:false,width:320,playBox:{x:10,y:10,width:20,height:20}};
  const before=PNG.sync.write(a);
  assert.deepEqual(compareTop(before,before,options),{changedPixels:0,exact:true,roundingOnly:false});
  const image=(x,y,channel,delta,count=1)=>{const b=PNG.sync.read(before);for(let k=0;k<count;k++)b.data[((y+Math.floor(k/20))*320+x+k%20)*4+channel]+=delta;return PNG.sync.write(b);};
  assert.equal(compareTop(before,image(10,10,1,1),options).changedPixels,1);
  for(const after of [image(9,10,1,1),image(10,10,0,1),image(10,10,2,1),image(10,10,3,1),image(10,10,1,2),image(10,10,1,1,65)])assert.throws(()=>compareTop(before,after,options));
  assert.throws(()=>compareTop(before,image(10,10,1,1),{...options,javaScriptEnabled:true}));
  assert.throws(()=>compareTop(before,image(10,10,1,1),{...options,width:375}));
});
