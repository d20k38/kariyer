import {json} from './_lib/db.js';
import {clearCookie} from './_lib/auth.js';
export function POST(){return json({ok:true},200,{'Set-Cookie':clearCookie()})}
