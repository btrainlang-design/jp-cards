/* 일본어 카드 · offline worker. Bump V when the app shell changes. */
const V="jpcards-v2";
const SHELL=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{
  const c=await caches.open(V);
  await Promise.all(SHELL.map(f=>c.add(new Request(f,{cache:"reload"})).catch(()=>{})));
  try{const r=await fetch("decks/index.json",{cache:"no-store"});if(r.ok){await c.put("decks/index.json",r.clone());const idx=await r.json();
    const files=[];(idx.decks||[]).forEach(d=>["deck.json","voice-ai.json","voice-momo.json"].forEach(n=>files.push(`decks/${d.id}/${n}?v=${d.v||1}`)));
    await Promise.all(files.map(f=>c.add(f).catch(()=>{})));}}catch(err){}
  await self.skipWaiting();
})())});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{
  const keep=await caches.open(V);
  for(const k of await caches.keys())if(k!==V){const old=await caches.open(k);for(const req of await old.keys()){if(/\/decks\/.+\?v=/.test(req.url)&&!(await keep.match(req)))await keep.put(req,await old.match(req))}await caches.delete(k)}
  await self.clients.claim();
})())});
function timeout(ms){return new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")),ms))}
async function networkFirst(req,key){
  const c=await caches.open(V);
  const net=fetch(req,{cache:"no-store"}).then(r=>{if(r.ok)c.put(key||req,r.clone());return r});
  try{return await Promise.race([net,timeout(3500)])}
  catch(e){const hit=await c.match(key||req,{ignoreSearch:true});if(hit)return hit;return net}
}
async function cacheFirst(req){
  const c=await caches.open(V);const hit=await c.match(req);if(hit)return hit;
  const r=await fetch(req);if(r.ok)c.put(req,r.clone());return r;
}
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  if(req.mode==="navigate"||url.pathname.endsWith("/index.html"))return e.respondWith(networkFirst(req,"index.html"));
  if(url.pathname.endsWith("/decks/index.json"))return e.respondWith(networkFirst(req,"decks/index.json"));
  e.respondWith(cacheFirst(req).catch(()=>caches.match(req,{ignoreSearch:true})));
});
