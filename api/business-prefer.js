import {rateLimitResponse} from './_lib/rate-limit.js';
import {db,json,body,safeText} from './_lib/db.js';
export async function POST(request){
  const blocked=rateLimitResponse(json,request,{name:'business-prefer',limit:30,windowMs:60*60*1000});
  if(blocked)return blocked;
  try{
    const b=await body(request),jobId=safeText(b.jobId,100),candidateId=safeText(b.candidateId,100);if(!jobId||!candidateId)return json({ok:false,error:'Eksik bilgi'},400);
    const s=db();
    const {data:j}=await s.from('workplace_requests').select('id,status').eq('id',jobId).maybeSingle();
    if(!j)return json({ok:false,error:'İşyeri ilanı bulunamadı'},404);
    if((j.status||'Aktif')==='Pasif')return json({ok:false,error:'İlan aktif değil'},409);
    const {count}=await s.from('student_applications').select('id',{count:'exact',head:true}).eq('request_id',jobId).eq('student_id',candidateId).eq('source','İşletme');
    if((count||0)>0)return json({ok:false,error:'Bu aday zaten tercih edildi'},409);
    const {data:c}=await s.from('students').select('name,class_name,phone').eq('id',candidateId).single(); if(!c)return json({ok:false,error:'Aday bulunamadı'},404);
    const row={id:'BAS-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),request_id:jobId,student_id:candidateId,student_name:c.name,student_class:c.class_name||'',phone:c.phone||'',type:'İşletme tercihi',source:'İşletme',status:'Yeni',note:''};
    const {data,error}=await s.from('student_applications').insert(row).select('*').single(); if(error)throw error;
    return json({ok:true,application:{id:data.id,jobId:data.request_id,candidateId:data.student_id,type:data.type,source:data.source,status:data.status,note:data.note||'',date:data.created_at||''}});
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
