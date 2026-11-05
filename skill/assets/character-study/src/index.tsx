import React from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame} from 'remotion';
import {Person,Ground,move} from './lib/actors';

const walkingWeight=(f:number)=>1-move(f,88,20);
const travelled=(f:number)=>Array.from({length:Math.floor(f)},(_,i)=>walkingWeight(i)*2.5*1.85).reduce((a,b)=>a+b,0);

const Test=()=>{
 const f=useCurrentFrame();
 const walk=f<108;
 const worry=f>=108&&f<166;
 const talk=f>=166&&f<244;
 const pose=walk?1:worry?move(f,108,15)*(1-move(f,151,15)):talk?move(f,166,15)*(1-move(f,229,15)):move(f,244,14);
 const emotion=f<115?'calm':f<160?'sad':f<240?'calm':'smile';
 const act=walk?'walk':worry?'worry':talk?'talk':'point';
 const mf=Math.max(0,f-9);
 const mWalk=mf<108,mWorry=mf>=108&&mf<166,mTalk=mf>=166&&mf<244;
 const malePose=mWalk?1:mWorry?move(mf,108,15)*(1-move(mf,151,15)):mTalk?move(mf,166,15)*(1-move(mf,229,15)):move(mf,244,14);
 const maleEmotion=mf<115?'calm':mf<160?'sad':mf<240?'calm':'smile';
 const maleAct=mWalk?'walk':mWorry?'worry':mTalk?'talk':'point';
 const distance=travelled(Math.min(f,108));
 return <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 56%, #20374b 0%, #101e2d 48%, #080f1a 100%)'}}>
  <svg width="1920" height="1080" viewBox="0 0 1920 1080">
   <path d="M100 158H1820" stroke="#466174" strokeWidth="1" opacity=".5"/>
   <text x="104" y="115" fill="#b8cbd4" fontFamily="Microsoft YaHei, sans-serif" fontSize="30" letterSpacing="3">人物动作测试</text>
   <text x="1815" y="112" textAnchor="end" fill="#6e91a7" fontFamily="Arial, sans-serif" fontSize="21" letterSpacing="3">CHARACTER STUDY · 10 SEC</text>
   <Ground x={990} y={821} w={1550}/>
   <Person x={330+distance} y={815} s={1.85} f={f} act={act} walkWeight={walkingWeight(f)} poseWeight={pose} emotion={emotion}/>
   <Person x={1030+distance} y={815} s={1.85} f={f+2} kind="man" act={maleAct} walkWeight={walkingWeight(f)} poseWeight={malePose} emotion={maleEmotion}/>
   <text x="104" y="981" fill="#8eacbb" fontFamily="Microsoft YaHei, sans-serif" fontSize="24">{f<108?'行走与停步':f<166?'观察与情绪':f<244?'交流与手势':'表情与指向'}</text>
   <path d="M104 1007H1816" stroke="#2b475a" strokeWidth="3"/>
   <path d={`M104 1007H${104+1712*f/299}`} stroke="#83c2d4" strokeWidth="3"/>
  </svg>
 </AbsoluteFill>;
};
registerRoot(()=> <Composition id="CharacterStudy" component={Test} width={1920} height={1080} fps={30} durationInFrames={300}/>);
