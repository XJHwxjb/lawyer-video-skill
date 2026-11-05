import React from 'react';
import {C,F,clamp} from '../theme';

export const A={ink:'#0C1725',skin:'#E9B79A',skin2:'#D18F73',hair:'#263246',cream:'#F1DFBB',coral:'#EA8F78',teal:'#6AAEAE',blue:'#8FBEDA',paper:'#E4E9E7',gold:'#E5BE78'};
export const move=(f:number,start:number,duration:number)=>{const p=clamp((f-start)/duration);return p*p*(3-2*p)};
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const pop=(f:number,start=0,duration=20)=>{const p=clamp((f-start)/duration);return 1+2.2*Math.pow(p-1,3)+1.2*Math.pow(p-1,2)};
type Point=[number,number];
function elbow(s:Point,h:Point,side:number):Point {
 const dx=h[0]-s[0],dy=h[1]-s[1],raw=Math.hypot(dx,dy),d=Math.min(126,Math.max(2,raw)),len=66;
 const mid:Point=[s[0]+dx*.5,s[1]+dy*.5],off=Math.sqrt(Math.max(0,len*len-d*d/4));
 return [mid[0]-(-dy/(raw||1))*off*side,mid[1]-dx/(raw||1)*off*side];
}
type HandGesture='open'|'point'|'stop'|'grip';
const Hand:React.FC<{p:Point;e:Point;side:number;gesture?:HandGesture}>=({p,e,side,gesture='open'})=>{
 const angle=Math.atan2(p[1]-e[1],p[0]-e[0])*180/Math.PI;
 const flip=side<0?-1:1;
 const openPath='M-4-8 C1-13 10-13 16-8 L22-3 C25 0 24 6 20 9 C15 12 7 10 1 7 L-5 3 C-9 0 -8-5 -4-8Z';
 const pointPath='M-4-8 C1-13 9-13 15-8 L30-7 Q37-7 37-2 Q37 3 30 3 L15 4 C12 10 5 11 -1 7 L-6 3 C-9 0 -8-5 -4-8Z';
 const stopPath='M-5 8 L-5-9 Q-5-14 0-14 Q5-14 5-9 V-22 Q5-27 10-27 Q15-27 15-22 V-9 H18 V-25 Q18-30 23-30 Q28-30 28-25 V-7 H31 V-19 Q31-24 36-24 Q41-24 41-19 V-4 Q41 12 25 13 H7 Q-2 13 -5 8Z';
 const path=gesture==='point'?pointPath:gesture==='stop'?stopPath:openPath;
 return <g transform={`translate(${p[0]} ${p[1]}) rotate(${angle}) scale(1 ${flip})`}>
   <path d={path} fill={A.skin} stroke={A.skin2} strokeWidth="1.6" strokeLinejoin="round"/>
   {gesture==='open'&&<><path d="M4-7l9 3M8-1l11 3M6 4l8 3" stroke={A.skin2} strokeWidth="1.8" strokeLinecap="round" opacity=".82"/></>}
   {gesture==='grip'&&<path d="M3-5q8 8 16 1M2 1q8 7 15 1" fill="none" stroke={A.skin2} strokeWidth="2" strokeLinecap="round"/>}
   {gesture==='stop'&&<path d="M9-19v11M22-22v14M35-17v11" stroke={A.skin2} strokeWidth="1.7" strokeLinecap="round" opacity=".72"/>}
 </g>;
};
export type Act='idle'|'walk'|'talk'|'phone'|'give'|'receive'|'worry'|'point'|'stop'|'carry'|'inspect'|'type'|'celebrate';
export const Person:React.FC<{x:number;y:number;s?:number;f:number;kind?:'woman'|'man'|'officer';face?:number;act?:Act;intensity?:number;emotion?:'calm'|'sad'|'alarm'|'smile';prop?:'phone'|'folder'|'money';opacity?:number;walkWeight?:number;poseWeight?:number}>=({x,y,s=1,f,kind='woman',face=1,act='idle',intensity=1,emotion='calm',prop,opacity=1,walkWeight=1,poseWeight=1})=>{
 const walking=act==='walk',w=Math.sin(f*2*Math.PI/48),step=walking?w*intensity*walkWeight:0;
 const bodyBob=walking?Math.sin(f*4*Math.PI/48)*1.8*walkWeight:0;
 const breathe=Math.sin(f*.055)*1.2;
 let left:Point=[-57,-83],right:Point=[59,-83];
 if(walking){left=[-54-step*12,-91+step*4];right=[54+step*12,-91-step*4]}
 if(act==='talk'){right=[82+Math.sin(f*.1)*10,-178+Math.sin(f*.13)*12];left=[-56,-99]}
 if(act==='phone'||act==='type'){right=[57,-157];left=[26+Math.sin(f*.17)*3,-146+Math.sin(f*.17)*3]}
 if(act==='give'){right=[103,-132];left=[-48,-100]}
 if(act==='receive'){right=[102,-142];left=[12,-114]}
 if(act==='worry'){right=[43,-246];left=[-57,-83]}
 if(act==='point'){right=[112,-179];left=[-57,-83]}
 if(act==='stop'){right=[85,-214];left=[-51,-100]}
 if(act==='carry'){right=[44,-83];left=[-37,-122]}
 if(act==='inspect'){right=[84,-194];left=[-43,-97]}
 if(act==='celebrate'){right=[85,-278];left=[-82,-260]}
 if(!walking){left=[mix(-57,left[0],poseWeight),mix(-83,left[1],poseWeight)];right=[mix(59,right[0],poseWeight),mix(-83,right[1],poseWeight)]}
 const torso=kind==='woman'?A.coral:kind==='officer'?'#6486A1':A.teal;
 const hair=kind==='woman'?'#483742':A.hair;
 const headTilt=act==='worry'?-9:act==='talk'?Math.sin(f*.085)*3:act==='inspect'?5:0;
 const blinkCycle=f%137;
 const blink=blinkCycle>129?0.08:blinkCycle>126?0.35:1;
 const gazeX=act==='give'||act==='receive'||act==='talk'?3:act==='inspect'?5:act==='phone'||act==='type'?-3:act==='worry'?-2:0;
 const gazeY=act==='phone'||act==='type'||act==='worry'?3:act==='inspect'?1:0;
 const gesture:HandGesture=act==='point'?'point':act==='stop'?'stop':act==='carry'?'grip':'open';
 const arm=(side:number,hand:Point)=>{
   const shoulder:Point=[side*36,-177];
   const relaxed:Point=[side*46,-130];
   let target:Point=relaxed;
   if(walking) target=[side*46+step*5,-130];
   else if(side===1&&act==='worry') target=[72,-187];
   else if(side===1&&act==='talk') target=[69,-133];
   else if(side===1&&act==='point') target=[72,-142];
   else if(side===1&&act==='stop') target=[75,-150];
   else if(side===1&&act==='inspect') target=[69,-139];
   const e:Point=walking?target:[mix(relaxed[0],target[0],poseWeight),mix(relaxed[1],target[1],poseWeight)];
   const armGesture=(act==='point'||act==='stop')&&side<0?'open':gesture;return <g>
   <path d={`M${shoulder} L${e}`} fill="none" stroke={torso} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
   <path d={`M${e} L${hand}`} fill="none" stroke={A.skin} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round"/>
   <path d={`M${e[0]-side*8} ${e[1]-4}L${e[0]+side*9} ${e[1]+4}`} stroke={torso} strokeWidth="4" strokeLinecap="round" opacity=".9"/>
   <Hand p={hand} e={e} side={side} gesture={armGesture}/>
 </g>};
 const leg=(side:number)=>{
  const phase=((f/48+(side===1?.5:0))%1+1)%1;
  const swing=phase>=.5;
  const u=swing?(phase-.5)*2:phase*2;
  const travel=(swing?mix(-30,30,u):mix(30,-30,u))*(walking?walkWeight:0);
  const footLift=swing?Math.sin(Math.PI*u)*18*(walking?walkWeight:0):0;
  const hip:Point=[side*19,-95+bodyBob],foot:Point=[side*22+travel,-footLift];
  const knee:Point=[mix(hip[0],foot[0],.48)+6*(walking?walkWeight:0),-48+bodyBob*.5-footLift*.25];
  return <g><path d={`M${hip} Q${knee} ${foot}`} stroke="#26374C" strokeWidth="25" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d={`M${foot[0]-12} ${foot[1]-4}q7 -7 20 -2l16 8q3 8-7 9h-27q-9 0-2-15`} fill={kind==='woman'?'#DED9CC':'#172332'}/><path d={`M${foot[0]-10} ${foot[1]+10}h38`} stroke="#F1DFBB" strokeWidth="2"/></g>
 };
 return <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`}>
 <ellipse cx="0" cy="12" rx={walking?67:61} ry="10" fill="#020A12" opacity=".48"/>
 <g transform={`scale(${face} 1)`}>
 {leg(-1)}{leg(1)}
 <g transform={`translate(0 ${breathe+bodyBob})`}>
 {arm(-1,left)}
 <path d="M-36-183 Q-48-172-43-148L-40-91 Q0-80 40-91L43-148Q48-172 36-183Z" fill={torso}/>
 <path d="M-35-174L-11-151 0-170 12-151 35-174" fill={kind==='woman'?'#F8E8D4':'#D6E8E3'}/>
 <path d="M0-166v76" stroke={kind==='woman'?'#B9685B':'#4B8086'} strokeWidth="2"/>
 <path d="M-33-105h24M13-105h23" stroke={A.ink} strokeOpacity=".2" strokeWidth="2"/>
 {kind==='officer'&&<><path d="M-36-170h20M16-170h20" stroke={A.gold} strokeWidth="5"/><path d="M20-145l9 6v12l-9 7-9-7v-12z" fill={A.gold}/><path d="M-4-164l8 0 4 31-8 10-8-10z" fill="#26374C"/></>}
 <path d="M-12-202v24q12 14 24 0v-24" fill={A.skin2}/>
 <g transform={`rotate(${headTilt} 0 -208)`}>
 {kind==='woman'&&<path d="M-39-233q-17-74 33-70 53-12 51 65l7 57q-28 22-50-1-33 23-57-2z" fill={hair}/>}
 <ellipse cx="0" cy="-243" rx="37" ry="45" fill={A.skin}/>
 <ellipse cx="-36" cy="-242" rx="7" ry="11" fill={A.skin}/><ellipse cx="36" cy="-242" rx="7" ry="11" fill={A.skin}/>
 <path d={kind==='woman'?'M-36-240Q-49-291-7-294 44-302 39-238 10-257 2-276-11-252-36-240':'M-36-242q-14-43 11-50l-5-7q29-15 44 0 32-3 29 32l-9 29-9-35q-33 13-58 1z'} fill={hair}/>
 <path d="M4-245l6 15-8 2" fill="none" stroke={A.skin2} strokeWidth="2.5" strokeLinecap="round"/>
  <g transform={`translate(0 -245) scale(1 ${blink}) translate(0 245)`}>
   <ellipse cx="-13" cy="-245" rx="7.5" ry="5.5" fill="#FFF8EE" opacity=".92"/>
   <ellipse cx="19" cy="-245" rx="7.5" ry="5.5" fill="#FFF8EE" opacity=".92"/>
   <ellipse cx={-13+gazeX} cy={-245+gazeY} rx={emotion==='alarm'?3.8:3.2} ry={emotion==='alarm'?4.5:3.2} fill={A.ink}/>
   <ellipse cx={19+gazeX} cy={-245+gazeY} rx={emotion==='alarm'?3.8:3.2} ry={emotion==='alarm'?4.5:3.2} fill={A.ink}/>
   <circle cx={-12+gazeX} cy={-246+gazeY} r="1.05" fill="#FFF8EE"/><circle cx={20+gazeX} cy={-246+gazeY} r="1.05" fill="#FFF8EE"/>
  </g>
  <path d={emotion==='sad'?'M-21-252q8-5 15-1M11-253q8-4 16 1':emotion==='alarm'?'M-21-258q8-5 15-2M11-260q8-3 16 3':act==='phone'||act==='type'?'M-21-256q8-1 15 2M11-254q8-2 16 0':'M-21-257q8-3 15-1M11-258q8-2 16 2'} fill="none" stroke={hair} strokeWidth="3" strokeLinecap="round"/>
  <path d={emotion==='sad'?'M-7-214q10-10 20 0':emotion==='alarm'?'M-3-218q10-12 16 0q-7 10-16 0':emotion==='smile'||act==='talk'&&Math.sin(f*.5)>.2?'M-10-220q12 16 24-2q-12 7-24 2':'M-10-217q10 5 21 0'} fill={emotion==='alarm'||(act==='talk'&&Math.sin(f*.5)>.2)?A.ink:'none'} stroke={A.ink} strokeWidth="2.3" strokeLinecap="round"/>
 <ellipse cx="-24" cy="-230" rx="7" ry="4" fill="#D78676" opacity=".3"/>
 {kind==='officer'&&<><path d="M-43-278q43-33 86 0l-8 18h-70z" fill="#2F4C67"/><path d="M-38-261q39 8 76 0l5 10q-42 12-83 0z" fill="#21354D"/><path d="M0-283l11 7-3 13H-8l-3-13z" fill={A.gold}/></>}
 </g>
 {arm(1,right)}
 {(act==='phone'||prop==='phone'||act==='type')&&<g transform={`translate(${right[0]-12} ${right[1]-47}) rotate(10)`}><rect width="31" height="58" rx="5" fill="#152236" stroke="#92AFC1" strokeWidth="2"/><rect x="4" y="6" width="23" height="41" rx="2" fill="#9BCCDD"/><path d="M8 15h15M8 23h11M8 31h14" stroke="#4E859D" strokeWidth="2.5"/><circle cx="16" cy="52" r="2" fill={A.paper}/></g>}
 {prop==='folder'&&<g transform={`translate(${left[0]-29} ${left[1]-5}) rotate(-8)`}><Folder w={85}/></g>}
 {prop==='money'&&<g transform={`translate(${right[0]-5} ${right[1]-28}) rotate(-8)`}><Banknote w={73}/></g>}
 {act==='inspect'&&<g transform={`translate(${right[0]+16} ${right[1]-39})`}><circle r="26" fill="#94D8ED33" stroke={A.gold} strokeWidth="8"/><path d="M-18 20l-24 28" stroke={A.gold} strokeWidth="10" strokeLinecap="round"/><path d="M-13-9q7-9 16-8" stroke="#F4F5ED" strokeWidth="3" fill="none"/></g>}
 </g></g></g>;
};

export const Banknote:React.FC<{w?:number;color?:string}>=({w=110,color=A.gold})=><g transform={`scale(${w/110})`}><rect width="110" height="63" rx="7" fill={color}/><rect x="8" y="8" width="94" height="47" rx="4" fill="none" stroke="#8C7044" strokeWidth="2"/><circle cx="55" cy="31.5" r="19" fill="#F5D798"/><text x="55" y="41" textAnchor="middle" fontFamily={F.sans} fontWeight="700" fontSize="28" fill="#8C7044">¥</text><path d="M15 24v16M95 24v16" stroke="#8C7044" strokeWidth="3"/></g>;
export const Folder:React.FC<{w?:number;color?:string;label?:string}>=({w=220,color=A.gold,label})=><g transform={`scale(${w/220})`}><path d="M0 16q0-12 12-12h67l17 19h110q14 0 14 15v116H0z" fill={color}/><rect x="8" y="43" width="204" height="112" rx="8" fill="#CFA86A"/><path d="M4 61h209l-14 98H16z" fill={color}/><rect x="75" y="88" width="81" height="34" rx="4" fill="#F1E5CC"/>{label&&<text x="115" y="111" textAnchor="middle" fontFamily={F.sans} fontSize="18" fill="#635238">{label}</text>}</g>;
export const Paper:React.FC<{x?:number;y?:number;w?:number;type?:string;color?:string;label?:string;lines?:number;checked?:boolean}>=({x=0,y=0,w=160,type='text',color=A.paper,label,lines=4,checked=false})=><g transform={`translate(${x} ${y}) scale(${w/160})`}><path d="M0 8q0-8 8-8h111l41 41v171q0 8-8 8H8q-8 0-8-8Z" fill={color}/><path d="M119 0v33q0 8 9 8h32" fill="#BACACC"/>
 {type==='id'?<><circle cx="41" cy="81" r="20" fill="#8CA5B1"/><path d="M12 124q1-38 59 0" fill="#8CA5B1"/><path d="M87 76h44M87 94h35M87 113h40" stroke="#7895A5" strokeWidth="6"/></>:type==='money'?<g transform="translate(22 61)"><Banknote w={115}/></g>:type==='chat'?<><rect x="20" y="60" width="100" height="38" rx="10" fill="#8EBBC6"/><path d="M32 98l-3 13 19-13" fill="#8EBBC6"/><rect x="49" y="122" width="90" height="30" rx="8" fill="#B3C7CF"/></>:<>{Array.from({length:lines},(_,i)=><path key={i} d={`M22 ${69+i*25}h${i%2?84:112}`} stroke="#91A8B1" strokeWidth="6" strokeLinecap="round"/>)}</>}
 {label&&<text x="22" y="191" fontSize="22" fontWeight="600" fontFamily={F.sans} fill="#314C60">{label}</text>}{checked&&<g transform="translate(135 180)"><circle r="28" fill="#7DB5A0"/><path d="M-14 0l10 11 19-24" stroke="#F4F3DE" strokeWidth="5" fill="none" strokeLinecap="round"/></g>}</g>;
export const Phone:React.FC<{x:number;y:number;s?:number;mode?:'chat'|'blocked'|'transfer'|'empty'|'delete';f?:number;tilt?:number}>=({x,y,s=1,mode='chat',f=0,tilt=0})=>{
 const p=move(f,15,25);
 return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}><rect x="-10" y="8" width="180" height="328" rx="29" fill="#020B14" opacity=".5"/><rect width="170" height="320" rx="26" fill="#273F54" stroke="#59798E" strokeWidth="2"/><rect x="10" y="13" width="150" height="289" rx="18" fill="#DCE7E7"/><path d="M57 14h56l-4 10H61z" fill="#273F54"/><circle cx="85" cy="60" r="20" fill="#9DBFC5"/><path d="M71 66q14-18 28 0" stroke="#567B8D" strokeWidth="5" fill="none"/>
 {(mode==='chat'||mode==='delete')&&<><g transform={`translate(0 ${-p*5})`}><rect x="23" y="105" width="105" height="48" rx="12" fill="#8EBDC4"/><path d="M35 121h75M35 134h55" stroke="#476F81" strokeWidth="4"/><rect x="49" y="171" width="98" height="41" rx="11" fill="#B7D2CE"/><path d="M63 185h70M63 198h48" stroke="#557F82" strokeWidth="4"/></g><g opacity={move(f,25,15)}><rect x="24" y="231" width="95" height="38" rx="10" fill="#8EBDC4"/><path d="M38 245h61M38 257h40" stroke="#476F81" strokeWidth="4"/></g></>}
 {mode==='transfer'&&<><g transform="translate(29 119)"><Banknote w={112}/></g><g transform={`translate(85 232) scale(${pop(f,30,22)})`}><circle r="30" fill="#6DA48E"/><path d="M-15 0l10 11 22-25" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round"/></g></>}
 {mode==='blocked'&&<><circle cx="85" cy="181" r="44" fill="#E4C3B8"/><circle cx="85" cy="181" r="32" fill="none" stroke={C.red} strokeWidth="7"/><path d="M61 205l48-48" stroke={C.red} strokeWidth="7"/><text x="85" y="254" textAnchor="middle" fill="#995B55" fontSize="21" fontFamily={F.sans}>消息被拒收</text></>}
 {mode==='delete'&&<g transform="translate(85 195)"><circle r="50" fill="#EC9D89"/><path d="M-24-19h48M-15-19v47h30v-47M-8-30h16M-6-7v22M6-7v22" stroke="#6E3838" strokeWidth="4" fill="none" strokeLinecap="round"/></g>}
 <rect x="62" y="289" width="47" height="4" rx="2" fill="#829CA8"/></g>;
};
export const Speech:React.FC<{x:number;y:number;w?:number;text?:string;icon?:'heart'|'money'|'cross'|'project'|'ring'|'clock';color?:string;p?:number}>=({x,y,w=240,text,icon,color=A.paper,p=1})=><g transform={`translate(${x} ${y}) scale(${p})`}><rect width={w} height={icon?112:76} rx="22" fill={color}/><path d={`M${w*.22} ${icon?108:72}l-18 28 51-28`} fill={color}/>{text&&<text x={w/2} y={icon?87:48} fontFamily={F.sans} fontSize="28" fontWeight="600" fill="#254157" textAnchor="middle">{text}</text>}{icon&&<g transform={`translate(${w/2-25} 14)`}><PropIcon type={icon} size={50}/></g>}</g>;
export const PropIcon:React.FC<{type:string;size?:number;color?:string}>=({type,size=60,color='#365E74'})=><g transform={`scale(${size/60})`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
 {type==='heart'?<path d="M30 51S1 34 5 18C9 5 27 7 30 20 33 7 51 5 55 18 59 34 30 51 30 51Z" fill="#E4A198" stroke="none"/>:type==='cross'?<path d="M23 3h14v20h20v14H37v20H23V37H3V23h20z" fill="#D98F83" stroke="none"/>:type==='ring'?<><circle cx="30" cy="36" r="17" stroke="#BC935C" strokeWidth="6"/><path d="M21 14l9-11 9 11-9 10z" fill="#8FC4D5" stroke="none"/></>:type==='project'?<><path d="M6 53V17h17V6h30v47M16 53V30h25v23M3 53h54"/><path d="M32 15h9M32 23h9"/></>:type==='money'?<><rect x="3" y="13" width="54" height="34" rx="4" fill="#E7C987" stroke="#AC8B50"/><circle cx="30" cy="30" r="11" stroke="#AC8B50"/></>:type==='clock'?<><circle cx="30" cy="30" r="26"/><path d="M30 12v18l13 8"/></>:type==='lock'?<><rect x="10" y="26" width="40" height="30" rx="5"/><path d="M19 26V16a11 11 0 0122 0v10M30 37v9"/></>:type==='voice'?<><rect x="22" y="4" width="16" height="33" rx="8"/><path d="M12 27v4a18 18 0 0036 0v-4M30 49v9M20 58h20"/></>:type==='check'?<path d="M8 31l15 15L53 13"/>:type==='link'?<><path d="M25 18l8-7a13 13 0 0118 18l-9 8M35 42l-8 7A13 13 0 019 31l9-8M20 40l20-20"/></>:<><path d="M10 4h28l13 13v39H10zM38 4v14h13M18 30h23M18 40h23"/></>}
 </g>;
export const City:React.FC<{x?:number;y?:number;w?:number;opacity?:number}>=({x=370,y=355,w=1420,opacity=.24})=><g transform={`translate(${x} ${y}) scale(${w/1420})`} opacity={opacity}><path d="M0 410V125h140v285M160 410V40h175v370M362 410V165h186v245M580 410V90h126v320M740 410V0h195v410M965 410V130h181v280M1180 410V65h150v345M1350 410V190h70v220" fill="#1C354A" stroke="#38576C" strokeWidth="2"/>{Array.from({length:30},(_,i)=><rect key={i} x={28+(i%10)*142} y={205+Math.floor(i/10)*57} width="32" height="18" rx="2" fill="#406479"/>)}<path d="M-100 411H1490" stroke="#4D6D7D" strokeWidth="3"/></g>;
export const Ground:React.FC<{x?:number;y?:number;w?:number}>=({x=1080,y=805,w=1300})=><><ellipse cx={x} cy={y+17} rx={w/2} ry="59" fill="#152A3C"/><path d={`M${x-w/2} ${y+17}h${w}`} stroke="#3F6073" strokeWidth="2" opacity=".5"/></>;
export const Desk:React.FC<{x:number;y:number;w?:number;h?:number}>=({x,y,w=520,h=155})=><g transform={`translate(${x} ${y})`}><path d={`M0 10l42-30h${w-62}l20 30`} fill="#386077"/><rect width={w} height="26" rx="6" fill="#52798B"/><path d={`M30 26v${h}M${w-30} 26v${h}`} stroke="#2A455D" strokeWidth="18"/><path d={`M30 ${26+h*.55}H${w-30}`} stroke="#29465D" strokeWidth="9"/></g>;
export const Plant:React.FC<{x:number;y:number;s?:number}>=({x,y,s=1})=><g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-27-60h54L20 0h-40z" fill="#BF8E72"/><path d="M0-57v-100M0-110q-50-4-47-50 44 0 47 50M0-137q4-45 43-47 6 45-43 47M0-80q-40-3-39-38 37 0 39 38M0-99q4-35 40-35-2 31-40 35" fill="#557D73" stroke="#729B88" strokeWidth="3"/></g>;
export const Burst:React.FC<{x:number;y:number;f:number;at:number;color?:string}>=({x,y,f,at,color=A.gold})=>{const p=clamp((f-at)/22);return <g opacity={1-p}>{Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <path key={i} d={`M${x+Math.cos(a)*(20+p*40)} ${y+Math.sin(a)*(20+p*40)}l${Math.cos(a)*15} ${Math.sin(a)*15}`} stroke={color} strokeWidth="4" strokeLinecap="round" opacity={f>=at?1:0}/>})}</g>};
export const Traveling:React.FC<{f:number;at:number;duration?:number;from:Point;to:Point;children:React.ReactNode;arc?:number;stay?:boolean}>=({f,at,duration=35,from,to,children,arc=85,stay=true})=>{const p=move(f,at,duration);if(f<at||(!stay&&p>=1))return null;return <g transform={`translate(${mix(from[0],to[0],p)} ${mix(from[1],to[1],p)-Math.sin(p*Math.PI)*arc}) rotate(${Math.sin(p*Math.PI)*-10})`}>{children}</g>};
