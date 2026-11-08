const V="jpcards-v1";const FILES=["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "voice-ai.json", "voice-momo.json"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(V);
  await Promise.all(FILES.map(f=>c.add(f).catch(()=>{})));
  self.skipWaiting()})())});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==V)await caches.delete(k);await self.clients.claim();
  (await self.clients.matchAll()).forEach(c=>c.postMessage("cached"))})())});
self.addEventListener("message",e=>{if(e.data==="check")caches.open(V).then(c=>c.keys()).then(k=>{if(k.length>=FILES.length-2)e.source.postMessage("cached")})});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&new URL(e.request.url).origin===location.origin){const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp))}return res}).catch(()=>caches.match("index.html"))))});
