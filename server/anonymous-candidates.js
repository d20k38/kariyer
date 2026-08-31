import {db,json,candidateFromRow} from '../api/_lib/db.js';
export async function GET(){
  try{
    const {data,error}=await db().from('students').select('id,class_name,address,candidate_kind,target_area,features,scales_json,status').order('class_name');
    if(error)throw error;
    const candidates=(data||[]).filter(r=>(r.status||'Aktif aday')!=='Pasif').map(r=>candidateFromRow(r,{privateView:false}));
    return json({ok:true,candidates});
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
