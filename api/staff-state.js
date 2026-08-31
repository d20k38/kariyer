import {db,json,jobFromRow,candidateFromRow} from './_lib/db.js';
import {requireStaff} from './_lib/auth.js';
export async function GET(request){
  const session=requireStaff(request); if(!session)return json({ok:false,error:'Oturum gerekli'},401);
  try{
    const s=db();
    const [cr,jr,ar,pr]=await Promise.all([
      s.from('students').select('*').order('name'),
      s.from('workplace_requests').select('*').order('created_at',{ascending:false}),
      s.from('student_applications').select('*').order('created_at',{ascending:false}),
      s.from('student_placements').select('*').order('created_at',{ascending:false})
    ]);
    for(const x of [cr,jr,ar,pr])if(x.error)throw x.error;
    const candidates=(cr.data||[]).map(r=>candidateFromRow(r,{privateView:true}));
    const jobs=(jr.data||[]).map(jobFromRow);
    const applications=(ar.data||[]).map(r=>({id:r.id,jobId:r.request_id,candidateId:r.student_id||'',type:r.type||'Başvuru',source:r.source||'Aday',status:r.status||'Yeni',note:r.note||'',date:r.created_at||''}));
    const placements=(pr.data||[]).map(r=>({id:r.id,jobId:r.request_id,candidateId:r.student_id||'',status:r.status||'Yerleştirildi',date:r.created_at||'',teacher:r.teacher||''}));
    return json({ok:true,session,candidates,jobs,applications,placements});
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
