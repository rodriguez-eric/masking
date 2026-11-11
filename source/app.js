/* All participant data remain in this browser. No external services. */
'use strict';
const E=window.MaskingEngine,C=E.config,$=id=>document.getElementById(id);
const KEY='slhs302-masking-v1';
let audio=null,master=null,sources=[],timers=[],busy=false,awaiting=false,pending=null,setupPlayed=false;
let session=null,saved=null,epoch=0;
const labels={quiet:'Quiet',500:'500-Hz masker',1000:'1000-Hz masker',2000:'2000-Hz masker'};
const initial=prediction=>({version:C.version,id:'ML-'+Math.random().toString(36).slice(2,8).toUpperCase(),
  created:new Date().toISOString(),prediction,order:['quiet',...E.shuffle([500,1000,2000])],block:0,
  practice:0,phase:'practice',track:E.createTrack(),results:[],trials:[],explain:'',limits:'',example:false});
function announce(s){$('message').textContent=s;}
function persist(){if(!session || session.example)return;try{localStorage.setItem(KEY,JSON.stringify(session));}catch{announce('Browser storage is unavailable. Keep this tab open and download your results when finished.');}}
try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.version===C.version&&Array.isArray(s.trials)&&Array.isArray(s.order)){saved=s;$('resume').hidden=false;}}catch{/* storage is optional */}
function stage(name){for(const id of ['setup','listen','results'])$(id).hidden=id!==name;['setup','listen','results'].forEach((id,i)=>{if(id===name)$('step'+i).setAttribute('aria-current','step');else $('step'+i).removeAttribute('aria-current');});}
function later(fn,ms){const t=setTimeout(fn,ms);timers.push(t);}
function clearSound(){for(const t of timers)clearTimeout(t);timers=[];for(const s of sources){try{s.stop();}catch{}try{s.disconnect();}catch{}}sources=[];for(const i of [1,2])$('interval'+i).classList.remove('active');}
function stop(message='Audio stopped. Press Play trial when you are ready to continue.'){
  epoch++;clearSound();busy=false;awaiting=false;pending=null;$('answer1').disabled=$('answer2').disabled=true;
  $('play').disabled=false;$('check').disabled=false;
  if(audio?.state==='running')audio.suspend().catch(()=>{});
  if(!$('listen').hidden)$('feedback').textContent=message;
}
async function ensureAudio(){
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)throw Error('This browser does not support Web Audio. Try a current browser, or use example results.');
  if(!audio){audio=new AC();master=audio.createGain();master.gain.value=C.masterGain;master.connect(audio.destination);}
  await audio.resume();if(audio.state!=='running')throw Error('Audio could not start. Tap the setup button again, or use example results.');
}
function ramp(g,t,duration,amp){g.setValueAtTime(0,t);g.linearRampToValueAtTime(amp,t+.020);g.setValueAtTime(amp,t+duration-.020);g.linearRampToValueAtTime(0,t+duration);}
function tone(t,db,duration=.35){const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=C.toneHz;
  ramp(g.gain,t,duration,Math.SQRT2*10**(db/20));o.connect(g);g.connect(master);o.start(t);o.stop(t+duration+.005);sources.push(o);
  o.onended=()=>{o.disconnect();g.disconnect();};
}
function masker(t,center){const data=E.noise(audio.sampleRate,Number(center)),buffer=audio.createBuffer(1,data.length,audio.sampleRate);buffer.copyToChannel(data,0);
  const s=audio.createBufferSource(),g=audio.createGain();s.buffer=buffer;ramp(g.gain,t,C.intervalSec,1);s.connect(g);g.connect(master);s.start(t);s.stop(t+C.intervalSec+.005);sources.push(s);
  s.onended=()=>{s.disconnect();g.disconnect();};
}
function error(e){stop();announce(e.message||'Something went wrong. Stop audio and try again.');}
$('stop').onclick=()=>stop();
$('check').onclick=async()=>{if(busy)return;const token=++epoch;busy=true;$('check').disabled=true;announce('');try{
  await ensureAudio();if(token!==epoch){audio.suspend().catch(()=>{});return;}const t=audio.currentTime+.08;masker(t,1000);tone(t+.15,C.maxDb);
  later(()=>{busy=false;$('check').disabled=false;setupPlayed=true;announce('Setup sound finished. If it was comfortably soft, check the box below. Keep system volume fixed after setup.');},900);
}catch(e){error(e);}};
function ready(){if(!setupPlayed||!$('ready').checked){announce('Play the setup sound first, set a comfortably soft volume, then check the box.');return false;}return true;}
$('begin').onclick=()=>{if(!ready())return;if(!$('prediction').value){announce('Choose a prediction before starting.');return;}stop();announce('');session=initial($('prediction').value);persist();stage('listen');renderTrial();$('listen').scrollIntoView({behavior:'smooth',block:'start'});};
$('resume').onclick=()=>{if(!ready())return;stop();session=JSON.parse(JSON.stringify(saved));stage(session.phase==='complete'?'results':'listen');if(session.phase==='complete')renderResults();else renderTrial();announce('Saved activity restored. Keep the same headphones and volume used originally. If they changed, start a new activity.');};
function renderTrial(){
  const practice=session.phase==='practice',condition=session.order[session.block];
  $('phase').textContent=practice?'PRACTICE · NOT INCLUDED IN RESULTS':'MEASUREMENT';
  $('condition').textContent=practice?'Find the tone':labels[condition];
  $('progress').textContent=practice?`Practice ${session.practice+1} of 3`:`Condition ${session.block+1} of 4 · Trial ${session.track.trials+1}`;
  $('progressbar').value=session.block;
  $('play').textContent='Play trial';$('play').disabled=false;$('answer1').disabled=$('answer2').disabled=true;
  $('feedback').textContent=practice?'Listen for a steady beep. Only one interval contains it.':'Keep volume fixed. Guess if uncertain; occasional errors are expected.';
}
$('play').onclick=async()=>{
  if(busy||awaiting||!session)return;
  clearSound();const token=++epoch;busy=true;$('play').disabled=true;announce('');
  try{await ensureAudio();if(token!==epoch){audio.suspend().catch(()=>{});return;}const practice=session.phase==='practice';const condition=practice?(session.practice===0?'quiet':1000):session.order[session.block];
    const db=practice?-18:session.track.level;const target=Math.random()<.5?1:2;
    pending={condition,db,target,practice,start:performance.now(),respondAt:0};
    const start=audio.currentTime+.1;
    for(let interval=1;interval<=2;interval++){
      const offset=(interval-1)*(C.intervalSec+C.gapSec),t=start+offset;
      if(condition!=='quiet')masker(t,condition);if(interval===target)tone(t+.15,db);
      later(()=>{for(const i of [1,2])$('interval'+i).classList.toggle('active',i===interval);$('feedback').textContent=`Listening: interval ${interval}`;},100+offset*1000);
      later(()=>$('interval'+interval).classList.remove('active'),100+(offset+C.intervalSec)*1000);
    }
    later(()=>{busy=false;awaiting=true;pending.respondAt=performance.now();$('answer1').disabled=$('answer2').disabled=false;$('feedback').textContent='Which interval contained the tone? Choose 1 or 2, even if unsure.';$('answer1').focus({preventScroll:true});},100+(C.intervalSec*2+C.gapSec)*1000+70);
  }catch(e){error(e);}
};
function answer(choice){
  if(!awaiting||!pending)return;
  awaiting=false;const p=pending;pending=null;const correct=choice===p.target;
  $('answer1').disabled=$('answer2').disabled=true;
  if(p.practice){session.practice++;if(session.practice>=3){session.phase='test';session.track=E.createTrack();}
    persist();renderTrial();$('feedback').textContent=(correct?'Correct. ':'The tone was in interval '+p.target+'. ')+(session.phase==='test'?'Practice complete. Your first measurement is quiet.':'Try another practice trial.');return;
  }
  const before=session.track,after=E.advance(before,correct);
  session.trials.push({condition:p.condition,trial:after.trials,toneDb:p.db,target:p.target,response:choice,correct,
    responseMs:Math.round(performance.now()-p.respondAt),reversal:after.reversals.length>before.reversals.length});
  session.track=after;const summary=E.summarize(after);
  if(summary.done){session.results.push({condition:p.condition,...summary});session.block++;
    if(session.block===4){session.phase='complete';persist();stage('results');renderResults();$('results').scrollIntoView({behavior:'smooth',block:'start'});return;}
    session.track=E.createTrack();persist();renderTrial();$('feedback').textContent='Condition complete. Take a short break, then start '+labels[session.order[session.block]]+'.';
  }else{persist();renderTrial();$('feedback').textContent='Response recorded. Press Play trial to continue.';}
}
$('answer1').onclick=()=>answer(1);$('answer2').onclick=()=>answer(2);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){stop();return;}if(['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement?.tagName)){
  if(document.activeElement?.tagName!=='BUTTON')return;
}
if(awaiting && (e.key==='1'||e.key==='2')){e.preventDefault();answer(Number(e.key));}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(busy||awaiting))stop('Paused because the tab was hidden. Press Play trial to restart the interrupted trial.');});
window.addEventListener('pagehide',()=>stop());
function fmt(n){return n===null||n===undefined?'—':Number(n).toFixed(1);}
function renderResults(){
  $('result-tag').textContent=session.example?'EXAMPLE DATA · NOT YOUR MEASUREMENTS':'YOUR OBSERVATIONS';
  const rows=['quiet',500,1000,2000].map(c=>session.results.find(r=>String(r.condition)===String(c))).filter(Boolean);
  const quiet=rows.find(r=>r.condition==='quiet')?.threshold;
  $('resultrows').replaceChildren();$('chart').replaceChildren();
  const heading=document.createElement('p');heading.className='chart-title';heading.textContent='Threshold elevation above quiet (relative dB). Zero is the quiet reference.';$('chart').append(heading);
  rows.forEach(r=>{
    const elevation=r.threshold!==null&&quiet!==null?r.threshold-quiet:null;
    const tr=document.createElement('tr');
    const quality=session.example?'Illustrative':r.threshold===null?'Incomplete: too few reversals':r.boundHits?'Estimate; hit level limit':'Estimate';
    for(const text of [labels[r.condition],fmt(r.threshold),fmt(elevation),quality]){const td=document.createElement('td');td.textContent=text;tr.append(td);}$('resultrows').append(tr);
    const barRow=document.createElement('div');barRow.className='bar-row';
    const label=document.createElement('span');label.textContent=labels[r.condition];
    const track=document.createElement('div');track.className='bar-track';const bar=document.createElement('div');bar.className='bar';bar.style.width=elevation===null?'0%':Math.max(0,Math.min(100,elevation/54*100))+'%';track.append(bar);
    const value=document.createElement('span');value.textContent=fmt(elevation)+(elevation===null?'':' dB');
    barRow.append(label,track,value);$('chart').append(barRow);
  });
  if(rows.some(r=>r.threshold===null)){const p=document.createElement('p');p.className='small';p.textContent='At least one block did not reach six reversals. No threshold is reported for that block. Use the trial CSV and discuss why estimation was difficult.';$('chart').append(p);}
  if(rows.some(r=>r.threshold!==null&&quiet!==null&&r.threshold<quiet)){const p=document.createElement('p');p.className='small';p.textContent='A negative elevation appears in the table. Bars show positive elevations only. Short estimates vary; do not force an expected pattern.';$('chart').append(p);}
  $('explain').value=session.explain||'';$('limits').value=session.limits||'';
}
$('explain').oninput=()=>{session.explain=$('explain').value;persist();};$('limits').oninput=()=>{session.limits=$('limits').value;persist();};
$('sample').onclick=()=>{stop();session=initial('unsure');session.example=true;session.phase='complete';session.block=4;
  session.results=[['quiet',-52],[500,-46],[1000,-28],[2000,-48]].map(([condition,threshold])=>({condition,threshold,status:'illustrative',trials:0,reversals:0,boundHits:0,done:true}));
  stage('results');renderResults();$('results').scrollIntoView({behavior:'smooth'});announce('These are invented teaching examples. They are not listening measurements. Your saved measured activity, if any, has been kept.');};
$('restart').onclick=()=>{stop();stage('setup');session=null;setupPlayed=false;$('ready').checked=false;$('prediction').value='';try{saved=JSON.parse(localStorage.getItem(KEY));$('resume').hidden=!saved;}catch{}announce('Ready for a new activity. Any saved measured session remains available until you start a new one.');$('setup').scrollIntoView({behavior:'smooth'});};
function csvCell(v){let s=String(v??'');if(/^[=+@\t\r]/.test(s)||(/^\-/.test(s)&&!/^\-?\d+(\.\d+)?$/.test(s)))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
$('download').onclick=()=>{
  const q=session.results.find(r=>r.condition==='quiet')?.threshold;
  const columns=['record_type','session_id','example_data','app_version','created_utc','prediction','condition','trial','tone_rms_db_re_1_pre_master','threshold_db','elevation_db','target_interval','response_interval','correct','response_ms','reversal','reversal_count','bound_hits','status','sample_rate_hz','master_gain','noise_rms_pre_master','noise_bandwidth_hz','reflection','limitations'];
  const base={session_id:session.id,example_data:session.example,app_version:C.version,created_utc:session.created,prediction:session.prediction,sample_rate_hz:audio?.sampleRate||'',master_gain:C.masterGain,noise_rms_pre_master:C.maskerRms,noise_bandwidth_hz:C.bandwidthHz};
  const records=session.results.map(r=>({...base,record_type:'summary',condition:r.condition,threshold_db:r.threshold,elevation_db:r.threshold!==null&&q!==null?r.threshold-q:'',reversal_count:r.reversals,bound_hits:r.boundHits,status:r.status,reflection:session.explain,limitations:session.limits}));
  for(const t of session.trials)records.push({...base,record_type:'trial',condition:t.condition,trial:t.trial,tone_rms_db_re_1_pre_master:t.toneDb,target_interval:t.target,response_interval:t.response,correct:t.correct,response_ms:t.responseMs,reversal:t.reversal});
  const csv='\ufeff'+[columns,...records.map(r=>columns.map(k=>r[k]))].map(row=>row.map(csvCell).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})),a=document.createElement('a');a.href=url;a.download=`masking-${session.example?'EXAMPLE':session.id}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
