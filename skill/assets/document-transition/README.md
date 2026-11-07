# 一张材料贯穿镜头：桌面 → 近看 → 归档

这是可复制的 Remotion / React 示例。它用**同一个** SVG 纸张节点，从桌面移动并放大到近景，再缩小移到档案盒；档案盒前片在纸张前，表达被收纳的空间关系。没有绘制人物，不暗示材料已经由某人交给另一人。它是二维示意，不自动证明案件存在某证据；材料标签由本期原稿和事实确认决定。

## 如何在自己的镜头中使用

1. 把本目录 `DocumentTransition.tsx` 复制到项目 `src/DocumentTransition.tsx`，确保项目已有 React 和 Remotion。**不要在 Skill 目录直接安装依赖或修改模板。**
2. 新建一个用于验证的入口 `src/document-entry.tsx`：

```tsx
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, useVideoConfig} from 'remotion';
import {DocumentTransition} from './DocumentTransition';

const Demo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill><DocumentTransition frame={frame} fps={fps} /></AbsoluteFill>;
};
registerRoot(() => <Composition id="DocumentDemo" component={Demo}
  width={1920} height={1080} fps={30} durationInFrames={180} />);
```

3. 在项目目录运行 `npx remotion render src/document-entry.tsx DocumentDemo out/document-demo.mp4`。示例无声、无字幕，时长 6 秒；它只演示一个动作，不是完整成片。
4. 真正接入口播时，将 `frame` 设为当前镜头的局部帧。在 Remotion `Sequence` 内的子组件中 `useCurrentFrame()` 已是局部帧；如果组件直接放在整片时间线上，则用 `Math.max(0, 全片帧 - 镜头开始帧)`。用实际 `fps` 而不是写死 30。
5. 0–0.8 秒桌面停留，0.8–1.8 秒推进，1.8–3.2 秒近景停留，3.2–4.5 秒移向档案盒，约 4.3–4.9 秒前沿遮盖，之后保留结果。按口播句界修改时间，别靠加速口播去适应示例；有声音时可在实际放下、合拢时点放轻音效。

## 和人物、字幕一起用

这个组件绘制完整的 1920×1080 场景；可先用作一个独立镜头，再把人物和道具接力合成。若在人物递件后接入，先在前一镜末帧固定纸张的位置、大小、角度、颜色，再调整本例的初始参数与其一致；若纸张一直在手上，应先实现松手落桌，再进入本例。请避免同时显示两份相同纸张，不能只把另一张纸在转场时突然淡入。示例纸张位置在 `x/y/scale/rotation`，时间均以秒计算。

示例下方没有字幕；加入时需留出字幕安全区，必要时整体上移。只能给 `title` 传经口播/材料核对且短到不溢出的文字，默认不传。数额、证人、事实和判断不能为了装饰而杜撰。

## 验收

从最终视频密集抽查 0.8、1.8、3.2、4.3、4.9 秒前后几帧，确认纸张始终只有一份，移动、缩放和遮挡连续，档案盒不会突兀穿过纸；再正常速度播放并听检音效。按实际镜头起始时间加上上述秒数，调整后的时间以实际实现为准。抽帧不能代替实时播放；未完成播放或听检时如实说明。
