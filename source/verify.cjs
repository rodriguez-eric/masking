const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
vm.runInThisContext(fs.readFileSync(__dirname+'/engine.js','utf8'));
const E=globalThis.MaskingEngine,C=E.config;
let t=E.createTrack();t=E.advance(t,true);assert.equal(t.level,-24);t=E.advance(t,true);assert.equal(t.level,-28);t=E.advance(t,false);assert.equal(t.level,-24);assert.equal(t.reversals.length,1);
t=E.createTrack();for(let i=0;i<100;i++)t=E.advance(t,false);assert.equal(t.level,C.maxDb);assert.equal(E.summarize(t).threshold,null);assert(E.summarize(t).done);assert(t.boundHits>0);
t=E.createTrack();for(let i=0;i<100;i++)t=E.advance(t,true);assert.equal(t.level,C.minDb);
t=E.createTrack();let n=0;while(!E.summarize(t).done){t=E.advance(t, n++%3!==2);}assert.equal(E.summarize(t).reversals,6);assert.notEqual(E.summarize(t).threshold,null);assert(t.trials<=36);
for(const sr of [44100,48000])for(const center of [500,1000,2000]){
 const a=E.noise(sr,center),rms=Math.sqrt(a.reduce((s,x)=>s+x*x,0)/a.length);assert(Math.abs(rms-C.maskerRms)<1e-7);
 const re=Float64Array.from(a),im=new Float64Array(a.length);E.fft(re,im,false);let inside=0,outside=0;
 for(let k=1;k<a.length/2;k++){const f=k*sr/a.length,p=re[k]**2+im[k]**2;if(Math.abs(f-center)<=C.bandwidthHz/2)inside+=p;else outside+=p;}
 assert(outside/inside<1e-10);assert(a.every(Number.isFinite));
}
console.log('PASS: staircase, reversals, bounds, incomplete runs, noise RMS and spectral bands at 44.1/48 kHz');
