// Lightweight per-instance rate limiter. Vercel instances are ephemeral;
// use it as a first layer, not as a replacement for WAF/Upstash/etc.
const buckets = new Map();
function clientKey(request){
  return (request.headers.get('x-forwarded-for')||request.headers.get('x-real-ip')||'unknown').split(',')[0].trim().slice(0,80);
}
export function rateLimit(request,{name='default',limit=20,windowMs=60_000}={}){
  const key=`${name}:${clientKey(request)}`;
  const now=Date.now();
  let b=buckets.get(key);
  if(!b||now-b.start>=windowMs){b={start:now,count:0};buckets.set(key,b)}
  b.count++;
  // Prevent unbounded growth in long-lived instances.
  if(buckets.size>5000){for(const [k,v] of buckets)if(now-v.start>=windowMs)buckets.delete(k)}
  return {ok:b.count<=limit,retryAfter:Math.max(1,Math.ceil((b.start+windowMs-now)/1000))};
}
export function rateLimitResponse(jsonFn,request,opts){
  const r=rateLimit(request,opts);
  return r.ok?null:jsonFn({ok:false,error:'Çok fazla istek. Lütfen biraz sonra tekrar deneyin.',retryAfter:r.retryAfter},429,{'Retry-After':String(r.retryAfter)});
}
