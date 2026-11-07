import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Ground, Person, move} from '../lib/actors';
import {cameraAt, CameraLayer, type CameraKey} from './CameraRig';

// 6 秒示例：景别推进 → 桌面证据 → 停住；字幕与身份区不参与镜头运动。
const keys: CameraKey[]=[
 {frame:0,x:960,y:540,scale:1},
 {frame:55,x:1010,y:510,scale:1.16},
 {frame:110,x:1055,y:545,scale:1.24},
 {frame:179,x:1055,y:545,scale:1.24},
];
export const CameraExample: React.FC = () => {
 const f=useCurrentFrame(), camera=cameraAt(f,keys), paper=move(f,30,30);
 return <AbsoluteFill style={{background:'#101e2d',overflow:'hidden'}}>
  <CameraLayer camera={camera} depth={0.15}>
   <svg width="1920" height="1080"><rect x="120" y="115" width="1680" height="790" rx="70" fill="#1b3344"/><circle cx="1200" cy="440" r="350" fill="#294758" opacity=".3"/></svg>
  </CameraLayer>
  <CameraLayer camera={camera} depth={1}>
   <svg width="1920" height="1080" viewBox="0 0 1920 1080">
    <Ground x={950} y={817} w={1300}/>
    <Person x={570} y={790} s={1.5} f={f} act="inspect" poseWeight={move(f,0,18)} emotion="calm"/>
    <rect x="750" y="690" width="590" height="22" rx="10" fill="#77929f"/>
    <path d="M800 710v100M1290 710v100" stroke="#77929f" strokeWidth="12"/>
    <g transform={`translate(${mix(1420,1030,paper)} 645) rotate(-7)`}>
     <rect x="-110" y="-110" width="220" height="145" rx="8" fill="#f4e7c9"/>
     <path d="M-75 -75h145M-75 -44h120M-75 -13h130" stroke="#718a91" strokeWidth="5" strokeLinecap="round"/>
    </g>
   </svg>
  </CameraLayer>
  <div style={{position:'absolute',left:95,top:90,color:'#e4edf2',fontSize:28,fontFamily:'Microsoft YaHei, sans-serif'}}>场景示例 · 检查资料</div>
  <div style={{position:'absolute',left:180,right:180,bottom:80,textAlign:'center',color:'white',fontSize:42,fontFamily:'Microsoft YaHei, sans-serif'}}>人物与材料随镜头推进，字幕保持稳定</div>
 </AbsoluteFill>;
};
function mix(a:number,b:number,p:number){return a+(b-a)*p;}
