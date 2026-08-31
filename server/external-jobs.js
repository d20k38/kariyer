import {db,json} from '../api/_lib/db.js';
export async function GET(){
  try{
    const {data,error}=await db().from('external_jobs').select('*').eq('is_active',true).order('published_at',{ascending:false}).limit(100);
    if(error)throw error;
    const jobs=(data||[]).map(r=>({id:r.id,title:r.title,company:r.company||'',district:r.district||'Kayseri',source:r.source||'Dış Kaynak',url:r.url||'',kind:r.kind||'muhasebe',description:r.description||'',publishedAt:r.published_at||r.created_at||''}));
    return json({ok:true,jobs});
  }catch(e){return json({ok:false,jobs:[],error:String(e.message||e)},200)}
}
