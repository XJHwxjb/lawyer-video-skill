# 法律 SVG 帧动画组件（Remotion）

此目录提供三个可直接复制到 Remotion 项目 `src/` 的 React/TypeScript 组件：`AnimatedScales`（天平小幅摆动后平衡）、`AnimatedGavel`（法槌落下、轻微回弹）、`AnimatedChecklist`（清单三行逐项描绘）。天平和清单依据本 Skill 同名 SVG 分组改造，法槌为便于真实触及底座而重新绘制的同风格线稿；它们不是自动播放的 SVG 文件。组件只依赖 React，时间由传入帧驱动，支持指定时间点寻帧和离线渲染。

## 复制并使用

1. 复制 `LegalMotion.tsx` 到项目的 `src/LegalMotion.tsx`。确保项目已有 React 和 Remotion，不要直接修改 Skill 内文件。
2. 在镜头组件中导入，并将**镜头局部帧**传入；视频如果为 25 fps，请传 `fps={25}`。组件自身没有固定位置，放在已有的定位容器里。

```tsx
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {AnimatedScales, AnimatedGavel, AnimatedChecklist} from './LegalMotion';

export const EvidenceShot = () => {
  const frame = useCurrentFrame(); // 如果放在 Sequence 中，这是 Sequence 的局部帧
  const {fps} = useVideoConfig();
  return <div style={{display: 'flex', gap: 24, color: '#8ec6dd'}}>
    <AnimatedScales frame={frame} fps={fps} size={180} />
    <AnimatedGavel frame={frame} fps={fps} size={180} color="#e5be78" />
    <AnimatedChecklist frame={frame} fps={fps} size={180} rowStartSeconds={[0.3, 1.5, 2.8]} />
  </div>;
};
```

3. 在真实分镜中，一般按语义选一个或少数几个图案，不要把三个模板机械地同时摆满全片。清单的 `rowStartSeconds` 是三个数字组成的数组，每一项对应一行开始动画的时间，单位为秒；可按口播句子的实际时间调整。`size` 控制宽高，`color` 控制描边色。
4. `frame` 是局部帧：在没有 `Sequence` 的主场景中，先计算 `Math.max(0, 全片帧 - 镜头开始帧)`。不要使用 CSS 实时动画、计时器或随机数来驱动离线视频。
5. 天平在约 2.8 秒内逐渐停止摆动；法槌在约 0.65 秒接触底座，约 1.05 秒停稳；清单每行描绘约 0.4 秒。动作结束后保持最终状态。若镜头太短，调整调用时机或修改项目内副本，抽查起始、接触、停止画面并连续播放。

SVG 是示意：法槌不代表案件已开庭或胜诉，天平不自动代表事实成立；按口播和实际程序选择。独立使用图标库中的普通 `.svg` 仍可采用 `Img`，但对 `Img` 做缩放、擦入不会让其内部零件发生动作。
