# 人物走路与交接：可运行示例

这两个例子是 `assets/character-study` 的配套代码，需先把整个模板复制到独立工作目录，并按模板 README 安装依赖。它们只用于二维正面示意；不能自动保证所有手型、遮挡与走路都自然。真实成片必须按情节设计并从最终视频验收。

## 手到手交接：一个道具，明确接收方

代码位于 `assets/character-study/src/examples/Handoff.tsx`，使用同一模板的 `Person` 和 `Banknote`。复制模板后在 `src/handoff-entry.tsx` 中写：

```tsx
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {HandoffExample} from './examples/Handoff';

registerRoot(() => <Composition id="Handoff" component={HandoffExample}
  durationInFrames={150} fps={30} width={1920} height={1080}/>);
```

安装依赖后在模板目录运行 `npx remotion render src/handoff-entry.tsx Handoff out/handoff.mp4`。这是无声的 5 秒动作示例，不是可直接交付的口播成片。根据本机浏览器配置，Remotion 可能需要指定已安装的浏览器。

示例在第 15–35 帧伸手，35–65 帧让**同一个**物件从左手移动到右手，65–83 帧左手回收，95–115 帧右手连同物件回收。物件全程只有一份，位置由双方手腕的画面坐标插值得到；不是给两个人各画一个物件。镜像右侧人物时，手腕的横坐标也必须镜像。示例没有使用 `Person` 的 `prop` 属性，因为这会额外画出绑定在人物身上的道具。

这些坐标依赖当前模板中 `give` 动作的手腕位置和呼吸偏移；修改角色动作、镜像、缩放或父级变换后，要同步更新位置计算，重新检查接触点、前后遮挡和物件大小。交接全过程中的手型只是简化示意，并非逐指抓握。不同手掌大小、道具或画面构图需要重新调试；不允许为展示动作虚构案件中未发生的支付或交接，参与者与流向必须与稿件一致。

## 行走从当前画面位置开始，停步后保留终点

`assets/character-study/src/examples/continuity.ts` 提供 `walkPosition`。该示例仅覆盖模板的**右向正面示意步态**，尚未覆盖左向、侧身及不同的角色步幅。调用时先导入：

```tsx
import {walkPosition} from './examples/continuity';
// f 是 useCurrentFrame() 得到的局部帧；start、x0、s 与 f 使用同一时间和画面坐标。
const step = walkPosition(f, 30, 700, 1.85);
<Person x={step.x} y={815} s={1.85} f={Math.max(0, f-30)}
  act={step.active ? 'walk' : 'idle'} walkWeight={step.weight}/>
```

第 30 帧从 `x=700` 开始而不是提前跳到别处，步行结束后 `step.x` 保持终点，后续镜头必须从这个终点接续；如果改成固定的 `x=700` 就会跳回原处。模板步态周期为 48 帧，函数按支撑期局部速度 `2.5 × 缩放` 计算位移并在末尾减速；如果修改步态、帧率、方向或缩放，必须同时重新检查速度与支撑脚。`Person` 应放在 `<svg>` 内；如需改变朝向，须重做并验证相应步态。

## 检查而不是猜测

从**最终渲染**抽取伸手前、接触、交接中点、松手和回收的连续帧；记录动作起止并播放观察。走路检查开始前后各一帧、完整步态周期、减速及站稳前后，确认人物没有瞬移、脚不明显滑动。看不清、接触点漂浮或发生穿模时要修改并重新渲染；没能实际播放时如实说明，不能把抽帧视为完整动态验收。
