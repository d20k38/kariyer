import {db,json,jobFromRow} from './_lib/db.js';
export async function GET(){
  try{
    const s=db();
    const [jr,ar,pr]=await Promise.all([
      s.from('workplace_requests').select('*').order('created_at',{ascending:false}),
      s.from('student_applications').select('id,request_id,status,source,created_at'),
      s.from('student_placements').select('id,request_id,status,created_at')
    ]);
    if(jr.error)throw jr.error;
    const jobs=(jr.data||[]).map(jobFromRow).filter(j=>j.status!=='Pasif');
    const applications=(ar.data||[]).map(r=>({id:r.id,jobId:r.request_id,status:r.status||'Yeni',source:r.source||'Aday',date:r.created_at||''}));
    const placements=(pr.data||[]).map(r=>({id:r.id,jobId:r.request_id,status:r.status||'Yerleştirildi',date:r.created_at||''}));
    return json({ok:true,jobs,applications,placements});
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
