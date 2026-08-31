import { createClient } from '@supabase/supabase-js';

export function db(){
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY eksik');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export function json(data,status=200,headers={}){
  return Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
}
export async function body(request){
  try{return await request.json()}catch{return {}}
}
export function safeText(v,max=5000){return String(v??'').trim().slice(0,max)}
export function trLower(v){return String(v??'').toLocaleLowerCase('tr-TR')}
export function parseSkills(features=[],skillLevels=null){
  if(skillLevels && typeof skillLevels==='object' && !Array.isArray(skillLevels)) return skillLevels;
  const out={};
  for(const x of (features||[])){
    const m=String(x).match(/^(.+):(0|25|50|75|100)$/);
    if(m) out[m[1]]=Number(m[2]);
  }
  return out;
}
export function jobFromRow(r){
  const levels=parseSkills(r.features,r.skill_levels);
  return {id:r.id,business:r.title||'',auth:r.person||'',phone:r.phone||'',mail:r.email||'',type:r.sector||'Stajyer Öğrenci',district:r.address||'',quota:Number(r.quota||1),days:Array.isArray(r.days)?r.days.join(', '):(r.days||''),skillLevels:levels,skills:Object.keys(levels),note:r.note||'',date:r.created_at||'',status:r.status||'Aktif'};
}
export function candidateFromRow(r,{privateView=false}={}){
  const scales=(r.scales_json&&typeof r.scales_json==='object')?r.scales_json:parseSkills(r.features);
  const vals=Object.values(scales).map(Number).filter(Number.isFinite);
  const score=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
  const c={id:r.id,studentNo:privateView?(r.student_no||''):'',name:privateView?(r.name||''):'',kind:r.candidate_kind||'Öğrenci',cls:r.class_name||'',phone:privateView?(r.phone||''):'',district:r.address||'',targetArea:r.target_area||'Muhasebe',path:r.target_area||'Muhasebe',features:r.features||[],scales,score,kvkk_ok:true,consent:'Okul onayıyla işletmeye anonim gösterilebilir',status:r.status||'Aktif aday'};
  return c;
}
