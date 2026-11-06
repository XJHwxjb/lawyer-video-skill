import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Banknote, Ground, Person, mix, move} from '../lib/actors';

/** 150 帧示例：一件道具从左侧人物的手转移到右侧人物的手。 */
export const HandoffExample:React.FC=()=>{
 const f=useCurrentFrame();
 const scale=1.4, y=815, leftX=700, rightX=1000;
 // 两人手腕同时伸向中间；交接后左手回收，右手稍后带着物件回收。
 const leftPose=move(f,15,20)*(1-move(f,65,18));
 const rightPose=move(f,15,20)*(1-move(f,95,20));
 // give 姿势右腕的放松与伸手目标，必须与 actors.tsx 对应。
 const wrist=(x:number,face:number,pose:number)=>({
  x:x+face*mix(59,103,pose)*scale,
  y:y+(mix(-83,-132,pose)+Math.sin(f*.055)*1.2)*scale,
 });
 const a=wrist(leftX,1,leftPose),b=wrist(rightX,-1,rightPose);
 const transfer=move(f,35,30);
 const px=mix(a.x,b.x,transfer),py=mix(a.y,b.y,transfer);
 return <AbsoluteFill style={{background:'#101e2d'}}>
  <svg width="1920" height="1080" viewBox="0 0 1920 1080">
   <Ground x={850} y={821} w={1200}/>
   <Person x={leftX} y={y} s={scale} f={f} act="give" poseWeight={leftPose}/>
   <Person x={rightX} y={y} s={scale} f={f} kind="man" face={-1} act="give" poseWeight={rightPose}/>
   {/* 单个道具；不使用 Person 的 prop，否则会出现两个物件。 */}
   <g transform={`translate(${px-37} ${py-22})`}><Banknote w={74}/></g>
  </svg>
 </AbsoluteFill>;
};
