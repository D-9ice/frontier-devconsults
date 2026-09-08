'use client';
import {useEffect} from 'react';
export default function ApplicationErrorMonitor(){
  useEffect(()=>{
    let reported=false;
    const report=()=>{if(reported||location.pathname.startsWith('/admin'))return;reported=true;void fetch('/api/monitoring/client-error',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'browser-error'})}).catch(()=>{});};
    window.addEventListener('error',report);window.addEventListener('unhandledrejection',report);
    return()=>{window.removeEventListener('error',report);window.removeEventListener('unhandledrejection',report);};
  },[]);
  return null;
}
