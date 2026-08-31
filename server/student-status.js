import {rateLimitResponse} from '../api/_lib/rate-limit.js';
import {db,json,body,safeText} from '../api/_lib/db.js';
import {sha256} from '../api/_lib/auth.js';

export async function POST(request){
  const blocked=rateLimitResponse(json,request,{name:'student-status',limit:10,windowMs:10*60*1000});
  if(blocked)return blocked;
  try{
    const b=await body(request), no=safeText(b.studentNo,60), pin=String(b.pin||'');
    if(!no||!/^[0-9]{4}$/.test(pin))return json({ok:false,error:'Öğrenci No/Kod ve 4 haneli PIN gerekli'},400);
    const s=db();
    const {data:cs,error:ce}=await s.from('students').select('id,name,class_name,pin_hash,status').eq('student_no',no).limit(1);
    if(ce)throw ce; const c=cs?.[0];
    if(!c||c.pin_hash!==sha256(pin))return json({ok:false,error:'Öğrenci No/Kod veya PIN hatalı'},401);
    const [ar,pr]=await Promise.all([
      s.from('student_applications').select('id,request_id,type,source,status,note,created_at').eq('student_id',c.id).order('created_at',{ascending:false}),
      s.from('student_placements').select('id,request_id,status,teacher,created_at').eq('student_id',c.id).order('created_at',{ascending:false})
    ]);
    if(ar.error)throw ar.error;if(pr.error)throw pr.error;
    const ids=[...(ar.data||[]).map(x=>x.request_id),...(pr.data||[]).map(x=>x.request_id)].filter(Boolean);
    let jobs=[];if(ids.length){const {data,error}=await s.from('workplace_requests').select('id,title,sector,address').in('id',[...new Set(ids)]);if(error)throw error;jobs=data||[]}
    const jm=new Map(jobs.map(j=>[j.id,j]));
    return json({ok:true,candidate:{name:c.name,className:c.class_name||'',status:c.status||'Aktif aday'},applications:(ar.data||[]).map(a=>{const j=jm.get(a.request_id)||{};return{id:a.id,jobId:a.request_id,business:j.title||'İşyeri',type:j.sector||'',district:j.address||'',applicationType:a.type||'Başvuru',source:a.source||'Aday',status:a.status||'Yeni',note:a.note||'',createdAt:a.created_at||''}}),placements:(pr.data||[]).map(p=>{const j=jm.get(p.request_id)||{};return{id:p.id,jobId:p.request_id,business:j.title||'İşyeri',district:j.address||'',status:p.status||'Yerleştirildi',teacher:p.teacher||'',createdAt:p.created_at||''}})});
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
