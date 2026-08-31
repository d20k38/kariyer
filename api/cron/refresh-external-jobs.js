import {db,json,safeText} from '../_lib/db.js';
function allow(request){const secret=process.env.CRON_SECRET;if(!secret)return false;return request.headers.get('authorization')===`Bearer ${secret}`}
export async function GET(request){
  if(!allow(request))return json({ok:false,error:'Yetkisiz'},401);
  try{
    const s=db();
    const cutoff=new Date(Date.now()-15*24*60*60*1000).toISOString();
    await s.from('external_jobs').update({is_active:false}).lt('published_at',cutoff);
    let imported=0;
    const feed=process.env.EXTERNAL_JOBS_FEED_URL;
    if(feed){
      const r=await fetch(feed,{headers:{'User-Agent':'Kayseri-Ticaret-Kariyer-Portal/3.0'}});if(!r.ok)throw new Error('Dış ilan beslemesi HTTP '+r.status);
      const arr=await r.json();
      if(Array.isArray(arr)){
        for(const x of arr.slice(0,200)){
          if(!x?.title||!x?.url)continue;
          const row={id:x.id||('EXT-'+Buffer.from(String(x.url)).toString('base64url').slice(0,40)),title:safeText(x.title,220),company:safeText(x.company,180),district:safeText(x.district||'Kayseri',120),source:safeText(x.source||'Dış Kaynak',80),url:safeText(x.url,1000),kind:safeText(x.kind||'muhasebe',80),description:safeText(x.description,2000),published_at:x.published_at||new Date().toISOString(),is_active:true};
          const {error}=await s.from('external_jobs').upsert(row,{onConflict:'id'});if(!error)imported++;
        }
      }
    }
    return json({ok:true,imported,feedConfigured:!!feed});
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
