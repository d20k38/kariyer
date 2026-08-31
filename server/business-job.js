import {rateLimitResponse} from '../api/_lib/rate-limit.js';
import {db,json,body,safeText,jobFromRow} from '../api/_lib/db.js';
export async function POST(request){
  const blocked=rateLimitResponse(json,request,{name:'business-job',limit:8,windowMs:60*60*1000});
  if(blocked)return blocked;
  try{
    const b=await body(request); if(!b.business)return json({ok:false,error:'İşletme adı gerekli'},400);
    if(b.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.mail)))return json({ok:false,error:'E-posta adresi geçersiz'},400);
    if(Number(b.quota)<1||Number(b.quota)>99)return json({ok:false,error:'Kontenjan 1-99 arasında olmalı'},400);
    const id='ILAN-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
    const row={id,title:safeText(b.business,180),person:safeText(b.auth,120),phone:safeText(b.phone,60),email:safeText(b.mail,180),address:safeText(b.district,500),sector:safeText(b.type,120)||'Stajyer Öğrenci',quota:Math.max(1,Math.min(99,Number(b.quota)||1)),days:b.days?[safeText(b.days,120)]:[],features:Object.entries(b.skillLevels||{}).map(([k,v])=>`${safeText(k,80)}:${Number(v)||0}`),skill_levels:b.skillLevels||{},note:safeText(b.note,3000),status:'Aktif'};
    const {data,error}=await db().from('workplace_requests').insert(row).select('*').single(); if(error)throw error;
    return json({ok:true,job:jobFromRow(data)});
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
