'use client';
import {useEffect,useState} from 'react';
export default function AnalyticsPreferences(){
  const [granted,setGranted]=useState(false);
  useEffect(()=>setGranted(localStorage.getItem('frontier-analytics-consent')==='granted'),[]);
  const change=(value:boolean)=>{localStorage.setItem('frontier-analytics-consent',value?'granted':'denied');if(!value)sessionStorage.removeItem('frontier-visitor-session');setGranted(value);window.dispatchEvent(new Event('frontier-consent-changed'));};
  return <div className="my-4 rounded border p-4"><p>Optional anonymous analytics are {granted?'enabled':'disabled'}. Allow page visits, traffic sources and approximate city/country to help us understand website usage. Do Not Track and Global Privacy Control override this choice.</p><button type="button" className="mr-4 underline" onClick={()=>change(true)}>Allow analytics</button><button type="button" className="underline" onClick={()=>change(false)}>Disable analytics</button></div>;
}
