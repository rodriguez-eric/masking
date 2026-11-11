/* Pure signal and staircase functions, shared with the verification script. */
(function (root) {
  'use strict';
  const config = Object.freeze({ version: '1.0.0', toneHz: 1000, bandwidthHz: 200,
    maskerRms: 0.04, masterGain: 0.18, minDb: -66, maxDb: -12,
    startDb: -24, reversals: 6, maxTrials: 36, intervalSec: 0.65, gapSec: 0.45 });
  function shuffle(a, rng = Math.random) { a = [...a]; for (let i=a.length-1;i>0;i--) { const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function createTrack() { return { level: config.startDb, streak: 0, direction: 0, reversals: [], trials: 0, boundHits: 0 }; }
  function advance(track, correct) {
    const t=JSON.parse(JSON.stringify(track)); t.trials++;
    t.streak=correct?t.streak+1:0;
    let direction=correct?(t.streak===2?-1:0):1;
    if(direction===-1)t.streak=0;
    const step=t.reversals.length<2?4:2;
    if(direction){
      const next=Math.max(config.minDb,Math.min(config.maxDb,t.level+direction*step));
      if(next===t.level)t.boundHits++;
      else { if(t.direction && t.direction!==direction)t.reversals.push(t.level); t.direction=direction; t.level=next; }
    }
    return t;
  }
  function summarize(t) {
    const done=t.reversals.length>=config.reversals || t.trials>=config.maxTrials;
    const stable=t.reversals.length>=config.reversals;
    const tail=t.reversals.slice(-4);
    return { done, threshold: stable?tail.reduce((a,b)=>a+b,0)/tail.length:null,
      status: stable?'estimate':'insufficient_reversals', reversals:t.reversals.length, trials:t.trials, boundHits:t.boundHits };
  }
  // Inverse FFT synthesis gives an explicit rectangular frequency band.
  function fft(re, im, inverse) {
    const n=re.length;
    for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];}}
    for(let len=2;len<=n;len<<=1){const angle=(inverse?2:-2)*Math.PI/len;const wr0=Math.cos(angle),wi0=Math.sin(angle);
      for(let i=0;i<n;i+=len){let wr=1,wi=0;for(let j=0;j<len/2;j++){
        const a=i+j,b=a+len/2,vr=re[b]*wr-im[b]*wi,vi=re[b]*wi+im[b]*wr;
        re[b]=re[a]-vr;im[b]=im[a]-vi;re[a]+=vr;im[a]+=vi;
        const nw=wr*wr0-wi*wi0;wi=wr*wi0+wi*wr0;wr=nw;
      }}
    }
    if(inverse)for(let i=0;i<n;i++){re[i]/=n;im[i]/=n;}
  }
  function noise(sr, center, rng = Math.random) {
    const n=2**Math.ceil(Math.log2(sr*1.0)),re=new Float64Array(n),im=new Float64Array(n);
    const lo=Math.ceil((center-config.bandwidthHz/2)*n/sr),hi=Math.floor((center+config.bandwidthHz/2)*n/sr);
    for(let k=lo;k<=hi;k++){
      // Complex Gaussian bins produce Gaussian band-limited noise.
      const u=Math.max(1e-12,rng()),v=rng(),r=Math.sqrt(-2*Math.log(u));
      re[k]=r*Math.cos(2*Math.PI*v);im[k]=r*Math.sin(2*Math.PI*v);re[n-k]=re[k];im[n-k]=-im[k];
    }
    fft(re,im,true);let power=0;for(const x of re)power+=x*x;
    const gain=config.maskerRms/Math.sqrt(power/n);
    return Float32Array.from(re,x=>x*gain);
  }
  root.MaskingEngine={config,shuffle,createTrack,advance,summarize,fft,noise};
})(typeof window==='undefined'?globalThis:window);
