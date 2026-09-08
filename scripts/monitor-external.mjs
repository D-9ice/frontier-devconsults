// Runs outside Vercel; only infrastructure status, never enquiry contents, enters runner state.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export function transition(previous,healthy,now,component='website',threshold=2){
  const state={...previous,pending:[...(previous.pending||[])]};
  if(!healthy){state.failures=(state.failures||0)+1;if(state.failures>=threshold&&!state.down){state.down=true;state.incident=now;state.pending.push({key:`${component}:down:${now}`,subject:`Frontier ${component} failed`,time:now});}}
  else {state.failures=0;if(state.down){state.down=false;state.pending.push({key:`${component}:recovery:${state.incident}`,subject:`Frontier ${component} recovered`,time:now});}}
  return state;
}
export async function deliver(pending,env,request=fetch){
  if(!env.RESEND_API_KEY||!env.EMAIL_FROM||!env.EMAIL_TO)throw Error('Configure RESEND_API_KEY, EMAIL_FROM and EMAIL_TO in repository Actions secrets');
  const r=await request('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`frontier-external/${pending.key}`},body:JSON.stringify({from:env.EMAIL_FROM,to:[env.EMAIL_TO],subject:pending.subject,text:`${pending.subject}\nDetected: ${pending.time}\nExternal monitoring: https://www.frontier-devconsults.com/api/health\nReview Vercel and the authenticated admin dashboard. This alert is sent independently of the website.`}),signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw Error(`Email provider HTTP ${r.status}`);
  const body=await r.json();if(!body.id)throw Error('Email acceptance missing ID');return body.id;
}
async function main(){
  await mkdir('.monitoring-state',{recursive:true});
  let state={};try{state=JSON.parse(await readFile('.monitoring-state/state.json','utf8'));}catch{}
  const now=new Date().toISOString();
  let healthy=false;
  try{const r=await fetch('https://www.frontier-devconsults.com/api/health',{headers:{'User-Agent':'Frontier-External-Monitor'},signal:AbortSignal.timeout(15000)});healthy=r.ok&&(await r.json()).status==='ok';}catch{}
  state.website=transition(state.website||{},healthy,now);
  let failed=!['RESEND_API_KEY','EMAIL_FROM','EMAIL_TO','MONITORING_JOB_TOKEN'].every(k=>process.env[k]);
  if(failed)console.error('External monitoring configuration incomplete: check RESEND_API_KEY, EMAIL_FROM, EMAIL_TO and MONITORING_JOB_TOKEN Actions secrets.');
  if(process.env.MONITORING_TEST==='true')state.test={pending:[{key:`test:${process.env.GITHUB_RUN_ID||now}`,subject:'[MONITORING TEST] Independent outage-alert delivery',time:now}]};
  if(healthy){
    try{const external=['website','worker','deployment'].flatMap(component=>(state[component]?.pending||[]).slice(-20).map(p=>({...p,component,resolved:!state[component].down})));const r=await fetch('https://www.frontier-devconsults.com/api/monitoring/run',{method:'POST',headers:{Authorization:`Bearer ${process.env.MONITORING_JOB_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({external}),signal:AbortSignal.timeout(55000)});state.worker=transition(state.worker||{},r.ok,now,'monitoring-worker');if(!r.ok)failed=true;}
    catch{state.worker=transition(state.worker||{},false,now,'monitoring-worker');failed=true;}
  }
  if(process.env.GITHUB_TOKEN&&process.env.GITHUB_REPOSITORY){
    try{
      const r=await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/commits/main/status`,{headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(10000)});
      if(!r.ok)throw Error('Deployment status access failed');
      const status=(await r.json()).statuses?.find(s=>/vercel/i.test(s.context));
      if(status&&status.state!=='pending')state.deployment=transition(state.deployment||{},status.state==='success',now,'deployment',1);
    }catch{failed=true;console.error('Deployment status unavailable');}
  }
  // Preserve pending attempts across runs; stable provider key prevents repeat sends after crashes.
  for(const name of ['website','worker','deployment','test'])for(const pending of state[name]?.pending||[]){
    if(['accepted','delivered','bounced','complained','failed'].includes(pending.status)||pending.nextAttempt>Date.now())continue;
    if((pending.attempts||0)>=6||(pending.firstAttempt&&Date.now()-pending.firstAttempt>23*3600000)){pending.status='failed';failed=true;continue;}
    pending.firstAttempt ||= Date.now();pending.attempts=(pending.attempts||0)+1;
    try{pending.id=await deliver(pending,process.env);pending.status='accepted';}
    catch(e){pending.nextAttempt=Date.now()+Math.min(3600000,60000*2**pending.attempts);failed=true;console.error(e.message);}
  }
  for(const name of ['website','worker','deployment','test']){
    for(const p of (state[name]?.pending||[]).filter(p=>p.status==='accepted').slice(-3)){
      try{const r=await fetch(`https://api.resend.com/emails/${p.id}`,{headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`},signal:AbortSignal.timeout(5000)});if(r.ok){const e=(await r.json()).last_event;if(['delivered','bounced','complained','failed'].includes(e))p.status=e;}}catch{}
    }
    if(state[name])state[name].pending=(state[name].pending||[]).filter((p,i,a)=>!['delivered'].includes(p.status)||i>=a.length-20);
  }
  await writeFile('.monitoring-state/state.json',JSON.stringify(state));
  console.log(JSON.stringify({healthy,consecutiveFailures:state.website.failures,statuses:Object.fromEntries(['website','worker','deployment','test'].map(n=>[n,(state[n]?.pending||[]).map(p=>p.status||'retry')]))}));
  if(failed)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
