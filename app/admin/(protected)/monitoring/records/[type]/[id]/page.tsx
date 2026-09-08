'use client';
import {useEffect,useState,use} from 'react';
export default function MonitoringRecord({params}:{params:Promise<{type:string;id:string}>}) {
  const {type,id}=use(params); const [result,setResult]=useState<unknown>('Loading authenticated record…');
  useEffect(()=>{void fetch(`/api/monitoring/read?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`,{cache:'no-store'}).then(r=>r.json()).then(setResult).catch(()=>setResult('Record unavailable'));},[type,id]);
  return <section className="p-8"><h1 className="text-2xl font-bold">Enquiry record</h1><pre className="mt-6 whitespace-pre-wrap break-words">{JSON.stringify(result,null,2)}</pre></section>;
}
