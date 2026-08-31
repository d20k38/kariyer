import {rateLimitResponse} from '../api/_lib/rate-limit.js';
import {db,json,body,safeText,candidateFromRow} from '../api/_lib/db.js';
import {sha256} from '../api/_lib/auth.js';
export async function POST(request){
  const blocked=rateLimitResponse(json,request,{name:'student-profile',limit:10,windowMs:60*60*1000});
  if(blocked)return blocked;
  try{
    const b=await body(request),no=safeText(b.studentNo,60),pin=String(b.pin||'');
    if(!no||!/^\d{4}$/.test(pin))return json({ok:false,error:'Numara/kod ve 4 haneli PIN gerekli'},400);
    if(!b.name||!b.cls)return json({ok:false,error:'Ad Soyad ve sınıf/mezuniyet gerekli'},400);
    const s=db();
    let {data:old,error:qe}=await s.from('students').select('id').eq('student_no',no).limit(1); if(qe)throw qe;
    const id=old?.[0]?.id||((b.kind==='Mezun'?'M-':'O-')+Date.now().toString(36).toUpperCase());
    const levels=b.scales||{};
    const features=Object.entries(levels).map(([k,v])=>`${safeText(k,80)}:${Number(v)||0}`);
    const row={id,student_no:no,pin_hash:sha256(pin),name:safeText(b.name,160),class_name:safeText(b.cls,80),phone:safeText(b.phone,60),address:safeText(b.district,400),candidate_kind:b.kind==='Mezun'?'Mezun':'Öğrenci',target_area:safeText(b.targetArea,120)||'Muhasebe',features,scales_json:levels,note:safeText(b.note,2000),status:'Aktif aday'};
    const {data,error}=await s.from('students').upsert(row,{onConflict:'id'}).select('*').single(); if(error)throw error;
    return json({ok:true,candidate:candidateFromRow(data,{privateView:true})});
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
