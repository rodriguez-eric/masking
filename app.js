'use strict';
const $=id=>document.getElementById(id);
let ctx,master,sources=[],busy=false,audioToken=0;
const status=text=>$('globalStatus').textContent=text;
function rng(seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function shuffled(seed){const r=rng(seed),a=Array.from({length:5},(_,i)=>i+1);for(let i=4;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
async function audio(){if(!$('consent').checked)throw Error('Confirm your low device volume in the setup panel first.');if(!ctx){ctx=new AudioContext();master=ctx.createGain();master.connect(ctx.destination)}await ctx.resume();master.gain.value=+$('volume').value/100;return ctx}
function stop(){audioToken++;for(const source of sources){try{source.stop()}catch{}}sources=[];busy=false;status('Audio stopped');if(current&&!current.finished){current.finished=true;$('speechStatus').textContent='Playback stopped. You can listen again at any SNR.'}detectPending=null;$('answer1').disabled=$('answer2').disabled=true;controlsLock(false)}
$('stop').onclick=stop;document.addEventListener('keydown',e=>{if(e.key==='Escape')stop()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&busy)stop()});
$('volume').oninput=()=>{$('volumeValue').textContent=$('volume').value+'%';if(master&&ctx)master.gain.setTargetAtTime(+$('volume').value/100,ctx.currentTime,.02)};
function bufferSound(buffer,at,route='both',gain=1,offset=0,duration){let s=ctx.createBufferSource();s.buffer=buffer;let g=ctx.createGain();g.gain.value=gain;s.connect(g);if(route==='both')g.connect(master);else{const merger=ctx.createChannelMerger(2);g.connect(merger,0,route==='left'?0:1);merger.connect(master)}s.start(at,offset,duration??buffer.duration-offset);sources.push(s);return s}
function generated(kind,duration,amplitude,freq=1000,seed='noise',ramp=.01){const b=ctx.createBuffer(1,Math.round(duration*ctx.sampleRate),ctx.sampleRate),a=b.getChannelData(0),r=rng(seed);for(let i=0;i<a.length;i++){const t=i/ctx.sampleRate,env=Math.max(0,Math.min(1,t/ramp,(duration-t)/ramp));a[i]=(kind==='tone'?Math.sin(2*Math.PI*freq*t)*Math.SQRT2:(r()*2-1)*Math.sqrt(3))*amplitude*env}let power=0;for(const x of a)power+=x*x;const rms=Math.sqrt(power/a.length);if(rms>0)for(let i=0;i<a.length;i++)a[i]*=amplitude/rms;return b}
async function run(fn){if(busy){status('Stop the current sound before starting another.');return}let token=audioToken;busy=true;try{await audio();if(token!==audioToken){busy=false;return}await fn(token)}catch(e){busy=false;status(e.message);controlsLock(false)}}
function done(at,token){setTimeout(()=>{if(token===audioToken){busy=false;sources=[];status('Playback complete')}},Math.max(0,(at-ctx.currentTime)*1000)+30)}
for(const b of document.querySelectorAll('[data-check]'))b.onclick=()=>run(token=>{const at=ctx.currentTime+.1;bufferSound(generated('tone',.6,.035),at,b.dataset.check);status('Channel check: '+b.dataset.check);done(at+.6,token)});
function crossUpdate(){const level=+$('level').value,ia=+$('ia').value,thr=+$('threshold').value,x=level-ia;$('crossReadout').innerHTML=`<span class="big">${x} dB HL</span><p>Estimated level at the non-test cochlea: ${level} − ${ia}.</p><strong>${x>=thr?'Cross-hearing is possible':'Below the hypothetical non-test threshold'}</strong><p>Compare with the non-test cochlear threshold of ${thr} dB HL. This estimate does not determine a safe or sufficient masking level.</p>`}
for(const id of ['level','ia','threshold'])$(id).oninput=crossUpdate;crossUpdate();
for(const [id,mode] of [['crossBoth','both'],['crossTest','test'],['crossOther','other']])$(id).onclick=()=>run(token=>{const ia=+$('ia').value;if(!Number.isFinite(ia)||ia<0||ia>80)throw Error('IA must be between 0 and 80 dB.');const ear=$('ear').value,other=ear==='left'?'right':'left',at=ctx.currentTime+.1,b=generated('tone',1.5,.035);if(mode!=='other')bufferSound(b,at,ear);if(mode!=='test')bufferSound(b,at,other,10**(-ia/20));if($('ntemask').checked)bufferSound(generated('noise',1.5,.035,1000,'cross'),at,other);status('Digital routing illustration playing');done(at+1.5,token)});
$('snr').oninput=()=>{$('snrValue').textContent=$('snr').value+' dB'};
for(const id of ['energyPlay','toneAlone'])$(id).onclick=()=>run(token=>{const at=ctx.currentTime+.1,amp=.008;bufferSound(generated('tone',2,amp,+$('freq').value),at);if(id==='energyPlay')bufferSound(generated('noise',2,amp/10**(+$('snr').value/20),1000,'energy'),at);status('Energetic masking example playing');done(at+2,token)});
function timePlan(type,gap){if(type==='forward')return{noise:0,tone:.3+gap,end:.32+gap};if(type==='backward')return{tone:0,noise:.02+gap,end:.32+gap};return{noise:0,tone:.14,end:.3}}
function updateTimeline(){const type=$('timing').value,gap=+$('gap').value;$('gapValue').textContent=gap+' ms';$('gap').disabled=type==='simultaneous';const p=timePlan(type,gap/1000);$('timeline').innerHTML=`<strong>${type[0].toUpperCase()+type.slice(1)}</strong><p>Noise: ${Math.round(p.noise*1000)}–${Math.round((p.noise+.3)*1000)} ms<br>Tone: ${Math.round(p.tone*1000)}–${Math.round((p.tone+.02)*1000)} ms</p><p class="small">Times are relative to the scheduled start, including ramps.</p>`}
$('timing').onchange=$('gap').oninput=updateTimeline;updateTimeline();
for(const id of ['timePlay','timeTone'])$(id).onclick=()=>run(token=>{const p=timePlan($('timing').value,+$('gap').value/1000),at=ctx.currentTime+.1;bufferSound(generated('tone',.02,.006,1000,'t',.005),at+p.tone);if(id==='timePlay')bufferSound(generated('noise',.3,.09,1000,'temporal',.005),at+p.noise);status('Temporal example playing');done(at+p.end,token)});
let detectPending=null,detectN=0,detectCorrect=0;const detectLog=[];
$('detectPlay').onclick=()=>run(token=>{if(detectPending!==null)throw Error('Answer the current pair first.');const seed=$('detectSeed').value,n=detectN++,r=rng(seed+':'+n),target=r()<.5?1:2,snr=+$('detectSnr').value,at=ctx.currentTime+.1;for(let i=1;i<=2;i++){const t=at+(i-1)*1.1;bufferSound(generated('noise',.6,.045,1000,seed+':'+n+':'+i),t);if(i===target)bufferSound(generated('tone',.6,.045*10**(snr/20)),t)}status('Two-interval trial playing');setTimeout(()=>{if(token!==audioToken)return;detectPending={target,snr,seed,n};$('answer1').disabled=$('answer2').disabled=false;$('detectResult').textContent='Which interval contained the tone?'},(at+1.7-ctx.currentTime)*1000);done(at+1.7,token)});
for(const i of [1,2])$('answer'+i).onclick=()=>{if(!detectPending)return;const ok=i===detectPending.target;detectCorrect+=+ok;detectLog.push({...detectPending,response:i,correct:ok});$('detectResult').textContent=`${ok?'Correct':'The tone was in interval '+detectPending.target}. Score: ${detectCorrect}/${detectLog.length}. SNR: ${detectPending.snr} dB. Compare results at the same SNR before pooling conditions.`;detectPending=null;$('answer1').disabled=$('answer2').disabled=true};
const snrs=['-9','-6','-3','0','3','6'];
for(const value of snrs){const option=document.createElement('option');option.value=value;option.textContent=(+value>0?'+':'')+value+' dB SNR';$('exploreSnr').append(option)}
$('exploreSnr').value='6';
const cache=new Map();let current=null,speechIndex=0,sessionSeed=$('speechSeed').value,deck=shuffled(sessionSeed);
function updateSentence(){ $('sentenceStatus').textContent='Sentence '+(speechIndex+1)+' of 5 · recording '+deck[speechIndex];$('nextSentence').disabled=speechIndex===4 }
function noiseFile(snr){return 'babble-'+(+snr===0?'zero':+snr<0?'neg'+String(-snr).padStart(2,'0'):'pos'+String(snr).padStart(2,'0'))+'.wav'}
async function load(file){if(!cache.has(file)){const promise=fetch('media/'+file).then(response=>{if(!response.ok)throw Error('Could not load '+file+'. Check media files and serve over HTTP.');return response.arrayBuffer()}).then(data=>ctx.decodeAudioData(data));cache.set(file,promise);try{return await promise}catch(error){cache.delete(file);throw error}}return cache.get(file)}
function controlsLock(locked){for(const id of ['speechSeed','explore','exploreSnr','nextSentence','restartSpeech'])$(id).disabled=locked;if(!locked)updateSentence()}
async function speechTrial(){await run(async token=>{controlsLock(true);const id=deck[speechIndex],snr=$('exploreSnr').value;
status('Loading sentence and supplied babble…');
const [sentence,noise]=await Promise.all([load('bel_sent'+String(id).padStart(2,'0')+'.wav'),load(noiseFile(snr))]);if(token!==audioToken)return;
const duration=sentence.duration+.5,random=rng(sessionSeed+':offset:'+id),offset=random()*Math.max(0,noise.duration-duration),at=ctx.currentTime+.15;
current={id,snr,finished:false};
// Preserve the calibrated source levels: unit gain for both streams, one shared master.
bufferSound(sentence,at+.25);bufferSound(noise,at,'both',1,offset,duration);
$('speechStatus').textContent='Listening to recording '+id+' at '+(+snr>0?'+':'')+snr+' dB SNR…';status('Speech playback');
setTimeout(()=>{if(token!==audioToken)return;busy=false;sources=[];current.finished=true;controlsLock(false);$('speechStatus').textContent='Finished. Change SNR and listen to this sentence again, or choose Next sentence.';status('Playback complete')},(at+duration-ctx.currentTime)*1000)
})}
$('explore').onclick=speechTrial;
$('nextSentence').onclick=()=>{if(busy||speechIndex===4)return;speechIndex++;updateSentence();$('speechStatus').textContent='New sentence selected. Choose an SNR and press Play selected SNR.'};
$('restartSpeech').onclick=()=>{if(busy)return;sessionSeed=$('speechSeed').value||'hearing-lab-01';deck=shuffled(sessionSeed);speechIndex=0;current=null;updateSentence();$('speechStatus').textContent='Listening set restarted. Previously heard sentences may repeat.'};
$('speechSeed').onchange=()=>{$('restartSpeech').onclick()};
$('consent').onchange=()=>{if(!$('consent').checked)stop()};
updateSentence();
