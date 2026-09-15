import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';

// PRISM does not use a service-worker media cache. Remove caches left by older builds once.
if(typeof window!=='undefined'&&'serviceWorker' in navigator){
  const key='prism-media-cache-cleanup-v2';
  if(localStorage.getItem(key)!=='done'){
    Promise.all([
      navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))).catch(()=>{}),
      'caches' in window?caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).catch(()=>{}):Promise.resolve()
    ]).finally(()=>localStorage.setItem(key,'done'));
  }
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
