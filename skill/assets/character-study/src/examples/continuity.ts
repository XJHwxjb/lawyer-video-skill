import {move} from '../lib/actors';

/** 右向行走：始终从原地开始，结束之后返回最后位置，避免切入/切出时跳位。 */
export function walkPosition(frame:number, start:number, x0:number, scale:number,
  slowAt=72, slowDuration=24) {
  const local=Math.max(0,Math.floor(frame-start));
  const stop=slowAt+slowDuration;
  let distance=0;
  for(let i=0;i<Math.min(local,stop);i++) distance+=2.5*scale*(1-move(i,slowAt,slowDuration));
  const active=frame>=start&&local<stop;
  return {x:x0+distance, active, weight:active?1-move(local,slowAt,slowDuration):0};
}
