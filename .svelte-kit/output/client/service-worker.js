const e=self,s="cache1643292896148",t=["/_app/start-97cca617.js","/_app/assets/start-464e9d0a.css","/_app/pages/__layout.svelte-5f1c19d0.js","/_app/assets/pages/__layout.svelte-fb9c0026.css","/_app/error.svelte-6e465d37.js","/_app/pages/index.svelte-f34bb59b.js","/_app/pages/section1.svelte-e2e91444.js","/_app/pages/section2.svelte-d4ff7816.js","/_app/pages/section4.svelte-a18153c5.js","/_app/pages/governance/index.svelte-dd6675f1.js","/_app/pages/subsection.svelte-7528dd14.js","/_app/pages/protocol/index.svelte-495a5b77.js","/_app/pages/section3.svelte-c7feda01.js","/_app/chunks/vendor-c5ec5885.js","/_app/assets/vendor-a36399ba.css","/_app/chunks/singletons-12a22614.js","/_app/chunks/sbutton-2227e717.js","/_app/chunks/navigation-51f4a605.js"].concat(["/bg2.png","/city.png","/economy.png","/logosupa.svg","/manifest.json","/plutusbg.png"]),a=new Set(t);e.addEventListener("install",(a=>{a.waitUntil(caches.open(s).then((e=>e.addAll(t))).then((()=>{e.skipWaiting()})))})),e.addEventListener("activate",(t=>{t.waitUntil(caches.keys().then((async t=>{for(const e of t)e!==s&&await caches.delete(e);e.clients.claim()})))})),e.addEventListener("fetch",(e=>{if("GET"!==e.request.method||e.request.headers.has("range"))return;const s=new URL(e.request.url),t=s.protocol.startsWith("http"),n=s.hostname===self.location.hostname&&s.port!==self.location.port,c=s.host===self.location.host&&a.has(s.pathname),p="only-if-cached"===e.request.cache&&!c;!t||n||p||e.respondWith((async()=>c&&await caches.match(e.request)||async function(e){const s=await caches.open("offline1643292896148");try{const t=await fetch(e);return s.put(e,t.clone()),t}catch(t){const a=await s.match(e);if(a)return a;throw t}}(e.request))())}));
