import {db,json} from './_lib/db.js';
export async function GET(request){
  try{
    const role=new URL(request.url).searchParams.get('role')||'teacher';
    const {data,error}=await db().from('teachers').select('name,role').order('name');
    if(error)throw error;
    const rows=(data||[]).filter(x=>role==='admin'?(x.role==='admin'||/yönetici/i.test(x.name||'')):(x.role!=='admin'&&!/yönetici/i.test(x.name||'')));
    return json({ok:true,users:rows.map(x=>({name:x.name,role:x.role}))});
  }catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
