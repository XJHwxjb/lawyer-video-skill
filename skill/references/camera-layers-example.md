# 镜头推进与分层：Remotion 可运行示例

此示例帮助画面从固定正面讲解变为具有空间关系的镜头。它是一套二维分层方案，并非真实三维透视。组件在 `assets/character-study/src/examples/CameraRig.tsx`，完整演示在同目录的 `CameraExample.tsx` 和 `camera-entry.tsx`。复制整个 `assets/character-study` 到独立项目，按其 README 安装依赖；不要修改技能中的原始模板。

在复制后的项目目录执行：

```bash
npx tsc --noEmit
npx remotion render src/examples/camera-entry.tsx CameraExample out/camera-example.mp4
```

输出是无声的 6 秒演示，人物旁的文件从画外移动到桌面、镜头推进、停住。它不是案件事实或完整视频；正式内容须根据原话决定是否出现材料及其流向。测试时先抽查开头、运动中段和停止帧，并播放检查。字幕、头像和固定界面在镜头层之外，避免被放大或移动。

## 如何接到自己的镜头

```tsx
import {useCurrentFrame} from 'remotion';
import {CameraLayer, cameraAt, type CameraKey} from './examples/CameraRig';

const keys: CameraKey[] = [
  {frame: 0, x: 960, y: 540, scale: 1},
  {frame: 60, x: 1000, y: 520, scale: 1.12},
];
// 在组件内：f 是镜头局部帧，若没有 Sequence，先减去镜头起始帧。
const f = useCurrentFrame();
const camera = cameraAt(f, keys);
return <>
  <CameraLayer camera={camera} depth={0.2}><Background /></CameraLayer>
  <CameraLayer camera={camera} depth={1}><CharactersAndProps /></CameraLayer>
  <Captions />
</>;
```

上述 `Background`、`CharactersAndProps`、`Captions` 为你的组件，占位示意不能直接独立编译。完整可运行版本使用本目录的 `CameraExample.tsx`。

- `keys` 至少一项；`frame` 为同一时间坐标中的有限数字，严格递增；`x/y` 是希望出现在画面中心的画布坐标，`scale` 必须大于 0。默认画布 1920×1080；使用其他尺寸时将 `CameraLayer` 的 `width`、`height` 和中心坐标一并修改。关键帧之前和之后保持边界状态。
- `depth` 介于 0 和 1，越大越跟随镜头；超出范围会被限制。建议背景 0.1–0.3，人物和人物持有的道具共同为 1。不要把同一次交接的手和物品放到不同运动层，否则接触点会漂移。
- 片段开始的镜头状态应与上个镜头结束状态相同，除非明确设计切镜；缩放时要在最终视频中检查画面边缘，避免出现底色缝隙、人物被裁掉或字幕遮挡。字幕和头像尽量保留在画面安全区，实际平台安全区以用户要求为准。
- 有意义地移动：叙事变为核对材料时再推进，重要信息给足阅读时间；不要对所有句子持续缩放。人物、证据及文字不得暗示原稿没有的事实。为 25/60fps 项目按实际帧率重新计算帧号，不要直接沿用示例的 30fps 数值。

如需移动纸张并衔接到下一镜，下一镜必须继承纸张前一镜结束时的画面坐标、尺寸和朝向，或明确设计一次切镜；最后在真实成片检查镜头交界前后相邻帧和画面可读性。音效可对准纸张落下等动作，但不能盖过旁白。
