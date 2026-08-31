import {json} from '../api/_lib/db.js';
import {clearCookie} from '../api/_lib/auth.js';
export function POST(){return json({ok:true},200,{'Set-Cookie':clearCookie()})}
