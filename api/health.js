import {db,json} from './_lib/db.js';
export async function GET(){
  try{const {error}=await db().from('workplace_requests').select('id').limit(1);if(error)throw error;return json({ok:true,service:'Kayseri Ticaret Kariyer Portal v4'})}catch(e){return json({ok:false,error:String(e.message||e)},500)}
}
