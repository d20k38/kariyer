import {rateLimitResponse} from './_lib/rate-limit.js';
import {db,json,body,safeText} from './_lib/db.js';
import {sha256} from './_lib/auth.js';
export async function POST(request){
  const blocked=rateLimitResponse(json,request,{name:'student-apply',limit:12,windowMs:60*60*1000});
  if(blocked)return blocked;
  try{
    const b=await body(request),no=safeText(b.studentNo,60),pin=String(b.pin||''),jobId=safeText(b.jobId,100); if(!no||!pin||!jobId)return json({ok:false,error:'Eksik bilgi'},400);
    const s=db();
    const {data:cs,error:ce}=await s.from('students').select('id,pin_hash,name,class_name,phone').eq('student_no',no).limit(1); if(ce)throw ce;
    const c=cs?.[0]; if(!c||c.pin_hash!==sha256(pin))return json({ok:false,error:'Öğrenci No/Kod veya PIN hatalı'},401);
    const {data:j,error:je}=await s.from('workplace_requests').select('id,quota,status').eq('id',jobId).single(); if(je||!j)return json({ok:false,error:'İşyeri bulunamadı'},404);
    if((j.status||'Aktif')==='Pasif')return json({ok:false,error:'İlan aktif değil'},409);
    const {count:placed}=await s.from('student_placements').select('id',{count:'exact',head:true}).eq('request_id',jobId).eq('status','Yerleştirildi');
    if((placed||0)>=Number(j.quota||1))return json({ok:false,error:'Kontenjan dolu'},409);
    const {count:alreadyPlaced}=await s.from('student_placements').select('id',{count:'exact',head:true}).eq('student_id',c.id).eq('status','Yerleştirildi');
    if((alreadyPlaced||0)>0)return json({ok:false,error:'Bu aday zaten kesin yerleştirilmiş'},409);
    const {count:dup}=await s.from('student_applications').select('id',{count:'exact',head:true}).eq('request_id',jobId).eq('student_id',c.id).eq('source','Aday');
    if((dup||0)>0)return json({ok:false,error:'Bu ilana daha önce başvurdunuz'},409);
    const row={id:'BAS-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),request_id:jobId,student_id:c.id,student_name:c.name,student_class:c.class_name||'',phone:c.phone||'',type:'Beni bu işe öner',source:'Aday',status:'Yeni',note:''};
    const {data,error}=await s.from('student_applications').insert(row).select('*').single(); if(error)throw error;
    return json({ok:true,application:{id:data.id,jobId:data.request_id,candidateId:data.student_id,type:data.type,source:data.source,status:data.status,note:data.note||'',date:data.created_at||''}});
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
