export type OfflineState='preparing'|'ready'|'unavailable'|'development';
export function prepareOffline(report:(state:OfflineState)=>void):()=>void{
  if(import.meta.env.DEV){report('development');return()=>{};}
  if(!('serviceWorker'in navigator)||!window.isSecureContext){report('unavailable');return()=>{};}
  report('preparing');let cancelled=false;
  const onMessage=(event:MessageEvent)=>{if(event.data?.type==='OFFLINE_READY')report('ready');else if(event.data?.type==='OFFLINE_ERROR')report('unavailable');};
  navigator.serviceWorker.addEventListener('message',onMessage);
  const check=()=>navigator.serviceWorker.controller?.postMessage({type:'CHECK_CACHE'});
  navigator.serviceWorker.addEventListener('controllerchange',check);
  void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(()=>navigator.serviceWorker.ready).then(()=>{if(!cancelled)check();}).catch(()=>{if(!cancelled)report('unavailable');});
  return()=>{cancelled=true;navigator.serviceWorker.removeEventListener('message',onMessage);navigator.serviceWorker.removeEventListener('controllerchange',check);};
}
