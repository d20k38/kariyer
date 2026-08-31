import {db,json,body,safeText} from '../api/_lib/db.js';
import {requireStaff} from '../api/_lib/auth.js';
export async function POST(request){
  const session=requireStaff(request); if(!session)return json({ok:false,error:'Oturum gerekli'},401);
  try{
    const b=await body(request),action=safeText(b.action,40),s=db();
    if(action==='suggest'){
      const jobId=safeText(b.jobId,100),candidateId=safeText(b.candidateId,100);
      const {count}=await s.from('student_applications').select('id',{count:'exact',head:true}).eq('request_id',jobId).eq('student_id',candidateId);
      if((count||0)===0){
        const {data:c}=await s.from('students').select('name,class_name,phone').eq('id',candidateId).single(); if(!c)return json({ok:false,error:'Aday bulunamadı'},404);
        const row={id:'BAS-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),request_id:jobId,student_id:candidateId,student_name:c.name,student_class:c.class_name||'',phone:c.phone||'',type:'Koordinatör önerisi',source:'Koordinatör',status:'Yeni',note:'',teacher:session.name};
        const {error}=await s.from('student_applications').insert(row); if(error)throw error;
      }
      return json({ok:true});
    }
    if(action==='job-status'){
      const id=safeText(b.id,120),status=safeText(b.status,20);
      if(!['Aktif','Pasif'].includes(status))return json({ok:false,error:'Geçersiz ilan durumu'},400);
      const {error}=await s.from('workplace_requests').update({status}).eq('id',id); if(error)throw error;
      return json({ok:true});
    }
    if(action==='application-status'){
      const id=safeText(b.id,120),status=safeText(b.status,60);
      if(!['Yeni','Olumlu','Olumsuz','Görüşmede','Yerleştirildi'].includes(status))return json({ok:false,error:'Geçersiz başvuru durumu'},400);
      const {error}=await s.from('student_applications').update({status}).eq('id',id); if(error)throw error;
      return json({ok:true});
    }
    if(action==='place'){
      const appId=safeText(b.applicationId,120);
      const {data:a,error:ae}=await s.from('student_applications').select('*').eq('id',appId).single(); if(ae||!a)return json({ok:false,error:'Başvuru bulunamadı'},404);
      if(['Olumsuz','Yerleştirildi'].includes(a.status))return json({ok:false,error:'Bu başvuru yerleştirmeye uygun değil'},409);
      const {data:j,error:je}=await s.from('workplace_requests').select('quota').eq('id',a.request_id).single(); if(je||!j)return json({ok:false,error:'İşyeri bulunamadı'},404);
      const {count:placed}=await s.from('student_placements').select('id',{count:'exact',head:true}).eq('request_id',a.request_id).eq('status','Yerleştirildi');
      if((placed||0)>=Number(j.quota||1))return json({ok:false,error:'Kontenjan dolu'},409);
      const {count:already}=await s.from('student_placements').select('id',{count:'exact',head:true}).eq('student_id',a.student_id).eq('status','Yerleştirildi');
      if((already||0)>0)return json({ok:false,error:'Bu aday zaten başka bir işyerine kesin yerleştirilmiş'},409);
      const row={id:'YER-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),request_id:a.request_id,student_id:a.student_id,status:'Yerleştirildi',note:'',teacher:session.name};
      const {error:pe}=await s.from('student_placements').insert(row); if(pe)throw pe;
      const {error:ue}=await s.from('student_applications').update({status:'Yerleştirildi'}).eq('id',appId); if(ue)throw ue;
      return json({ok:true});
    }
    return json({ok:false,error:'Geçersiz işlem'},400);
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
