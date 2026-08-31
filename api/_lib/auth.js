import crypto from 'node:crypto';

function secret(){return process.env.SESSION_SECRET||''}
function sign(s){return crypto.createHmac('sha256',secret()).update(s).digest('base64url')}
export function makeSession(user){
  if(!secret()) throw new Error('SESSION_SECRET eksik');
  const payload=Buffer.from(JSON.stringify({name:user.name,role:user.role,exp:Date.now()+8*60*60*1000})).toString('base64url');
  return payload+'.'+sign(payload);
}
export function readSession(request){
  try{
    const cookie=request.headers.get('cookie')||'';
    const token=cookie.split(/;\s*/).find(x=>x.startsWith('kt_session='))?.slice(11);
    if(!token)return null;
    const [p,s]=token.split('.');
    if(!p||!s||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(sign(p))))return null;
    const obj=JSON.parse(Buffer.from(p,'base64url').toString());
    if(!obj.exp||obj.exp<Date.now())return null;
    return obj;
  }catch{return null}
}
export function requireStaff(request,role=null){
  const s=readSession(request);
  if(!s)return null;
  if(role && s.role!==role)return null;
  return s;
}
export function sessionCookie(token){return `kt_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${8*60*60}`}
export function clearCookie(){return 'kt_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'}
export function sha256(s){return crypto.createHash('sha256').update(String(s)).digest('hex')}
