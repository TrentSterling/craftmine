'use strict';
const assert=require('node:assert/strict');
const {PNG}=require('pngjs');
// Identical-source WebKit no-JS captures reproduce 48 pixels with a one-level
// green-channel difference along the unmodified Play button gradient. Do not
// relax any source/geometry check or any other fixture/region/channel.
function compareTop(before,after,{javaScriptEnabled,width,playBox}){
  const a=PNG.sync.read(before),b=PNG.sync.read(after);
  assert.equal(a.width,b.width);assert.equal(a.height,b.height);
  let changedPixels=0;
  for(let i=0;i<a.data.length;i+=4){
    if(a.data.subarray(i,i+4).equals(b.data.subarray(i,i+4)))continue;
    changedPixels++;
    const x=(i/4)%a.width,y=Math.floor(i/4/a.width);
    assert.ok(!javaScriptEnabled&&width===320&&a.width===320&&a.height===844,'all other fixtures retain exact pixels');
    assert.ok(x>=playBox.x&&x<playBox.x+playBox.width&&y>=playBox.y&&y<playBox.y+playBox.height,'only the unchanged Play button gradient');
    assert.equal(a.data[i],b.data[i],'red remains exact');assert.equal(a.data[i+2],b.data[i+2],'blue remains exact');assert.equal(a.data[i+3],b.data[i+3],'alpha remains exact');
    assert.equal(Math.abs(a.data[i+1]-b.data[i+1]),1,'only one green level');
  }
  assert.ok(changedPixels<=64,'at most 64 renderer-rounding pixels (48 observed in identical-source control)');
  return{changedPixels,exact:changedPixels===0,roundingOnly:changedPixels>0};
}
module.exports={compareTop};
