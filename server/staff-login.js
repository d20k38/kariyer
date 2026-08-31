import crypto from 'node:crypto';
import {db,json,body,safeText} from '../api/_lib/db.js';
import {makeSession,sessionCookie,sha256} from '../api/_lib/auth.js';
import {rateLimitResponse} from '../api/_lib/rate-limit.js';
function equal(a,b){try{const A=Buffer.from(String(a));const B=Buffer.from(String(b));return A.length===B.length&&crypto.timingSafeEqual(A,B)}catch{return false}}
export async function POST(request){
  const blocked=rateLimitResponse(json,request,{name:'staff-login',limit:8,windowMs:15*60*1000});
  if(blocked)return blocked;
  try{
    const b=await body(request),name=safeText(b.name,120),password=String(b.password??''),want=b.role==='admin'?'admin':'teacher';
    if(!name||!password)return json({ok:false,error:'Ad ve şifre gerekli'},400);
    const {data,error}=await db().from('teachers').select('name,password,role').eq('name',name).limit(1);
    if(error)throw error;
    const r=data?.[0]; if(!r)return json({ok:false,error:'Kullanıcı bulunamadı'},401);
    const isAdmin=r.role==='admin'||/yönetici/i.test(r.name||'');
    if((want==='admin')!==isAdmin)return json({ok:false,error:'Yetki türü uyuşmuyor'},403);
    const stored=String(r.password??'');
    const passOk=stored.startsWith('sha256:')?equal(stored.slice(7),sha256(password)):equal(stored,password);
    if(!passOk)return json({ok:false,error:'Şifre hatalı'},401);
    const token=makeSession({name:r.name,role:isAdmin?'admin':'teacher'});
    return json({ok:true,name:r.name,role:isAdmin?'admin':'teacher'},200,{'Set-Cookie':sessionCookie(token)});
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
