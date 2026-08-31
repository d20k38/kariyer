import * as health from '../server/health.js';
import * as logout from '../server/logout.js';
import * as externalJobs from '../server/external-jobs.js';
import * as publicState from '../server/public-state.js';
import * as anonymousCandidates from '../server/anonymous-candidates.js';
import * as businessJob from '../server/business-job.js';
import * as businessPrefer from '../server/business-prefer.js';
import * as staffLogin from '../server/staff-login.js';
import * as staffState from '../server/staff-state.js';
import * as staffUsers from '../server/staff-users.js';
import * as staffAction from '../server/staff-action.js';
import * as studentApply from '../server/student-apply.js';
import * as studentProfile from '../server/student-profile.js';
import * as studentStatus from '../server/student-status.js';
import * as cronRefresh from '../server/cron/refresh-external-jobs.js';

const routes = {
  '/api/health': health,
  '/api/logout': logout,
  '/api/external-jobs': externalJobs,
  '/api/public-state': publicState,
  '/api/anonymous-candidates': anonymousCandidates,
  '/api/business-job': businessJob,
  '/api/business-prefer': businessPrefer,
  '/api/staff-login': staffLogin,
  '/api/staff-state': staffState,
  '/api/staff-users': staffUsers,
  '/api/staff-action': staffAction,
  '/api/student-apply': studentApply,
  '/api/student-profile': studentProfile,
  '/api/student-status': studentStatus,
  '/api/cron/refresh-external-jobs': cronRefresh
};

export default async function handler(request) {
  const url = new URL(request.url);
  const route = routes[url.pathname];
  if (!route) return Response.json({ok:false,error:'API endpoint bulunamadı'}, {status:404});
  const fn = route[request.method] || route.default;
  if (!fn) return Response.json({ok:false,error:'Method Not Allowed'}, {status:405,headers:{Allow:Object.keys(route).filter(k=>k!=='default').join(', ')}});
  return fn(request);
}
