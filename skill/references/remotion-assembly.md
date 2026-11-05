# 用口播视频和 SRT 合成：Remotion 起步配方

本配方帮助 Agent 从视频与带时间戳的字幕搭起**可运行的基底**。它只展示素材、字幕和场景如何同步，并不自动理解法律稿件或生成全部分镜。先复制 `assets/character-study/` 到用户授权的**新项目目录**，安装 Node.js 20+、Python 3、ffmpeg/ffprobe 和可用 Chromium；然后按实际分镜修改代码。例子使用本地数据；不要将客户素材放入公开仓库、模板目录或云端。

## 1. 安置和检查素材

进入复制后的新项目，用文件管理器或系统复制命令将视频和字幕分别放到 `public/media/source.mp4`、`input.srt`。路径含空格时加引号。原件保留；如果视频不是 MP4，将实际文件复制进 `public/media/` 并在下面代码中修改文件名。任何重编码、旋转与裁剪之前先对照源素材确认：

```bash
ffprobe -v error -show_streams -show_format -of json "public/media/source.mp4"
```

查看分辨率、旋转标记、时长、视频流与音轨；在素材播放器中确认画面方向、人脸位置、开头结尾及实际音画同步。手机竖拍、变帧率和含多个音轨的素材要特别检查；不要默认第一条音轨是目标声音。保留用户对画幅、时间线和剪辑的要求。

## 2. 将时间戳转成数据

以下示例假定字幕使用 UTF-8、每个片段有 `序号 / 时间 / 文本` 格式，时间为 `00:00:00,000 --> 00:00:01,200`。可多行文本；其他编码先转换或调整读取方式。创建 `prepare.py`：

```python
from pathlib import Path
import json, math, re, subprocess

source = Path('public/media/source.mp4')
probe = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'json', str(source)
], text=True, encoding='utf-8'))
duration = float(probe['format']['duration'])
fps = 30  # 输出帧率；如平台或用户要求不同则修改
pattern = re.compile(r'(\d{2}):(\d{2}):(\d{2})[,.](\d{3})')
def seconds(timestamp):
    match = pattern.fullmatch(timestamp.strip())
    if not match:
        raise ValueError('无效 SRT 时间: ' + timestamp)
    h, m, s, ms = map(int, match.groups())
    return 3600*h + 60*m + s + ms/1000

raw = Path('input.srt').read_text(encoding='utf-8-sig').replace('\r\n', '\n').replace('\r', '\n')
cues = []
for block in re.split(r'\n\s*\n', raw.strip()):
    lines = block.splitlines()
    timing_index = next(i for i, line in enumerate(lines) if ' --> ' in line)
    start, end = lines[timing_index].split(' --> ', 1)
    start, end = seconds(start), seconds(end)
    text = '\n'.join(lines[timing_index + 1:]).strip()
    if end <= start or not text:
        raise ValueError('字幕为空或时长无效: ' + block)
    cues.append({'start': start, 'end': end, 'text': text})
if not cues or any(c['start'] < 0 or c['end'] > duration + 0.1 for c in cues):
    raise ValueError('没有字幕或字幕超出视频时长，请检查源素材和时间轴')
result = {'fps': fps, 'durationInFrames': math.ceil(duration * fps), 'durationSeconds': duration, 'cues': cues}
Path('src/timing.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"{len(cues)} 条字幕；{duration:.3f} 秒；{result['durationInFrames']} 帧")
```

运行 `python prepare.py`；Windows 也可用 `py -3 prepare.py`。逐句对照输出数据、原 SRT 和实际口播：SRT 不保证准确。帧 `f` 的展示时间为 `f / fps` 秒；字幕在 `start <= f / fps < end` 时显示，避免一段的末尾与下一段首帧重复。由于帧离散化，字幕边界最多有不到一帧的量化误差；逐帧检查冲突。`ceil(时长 × fps)` 用于避免截断尾部，不应用它改变声音速度。片长应按实际音视频有效末尾复查；容器时长异常或音轨比画面长时，检查各流时长并按实际材料调整，不能盲信容器值。

## 3. 组装真人、字幕与动画

在已复制的测试项目中，将以下示例保存为 `src/assembly.tsx`，**保留并改造**测试模板的 `src/lib/actors.tsx`。该示例使用视频自带音轨一次，不额外添加同源 `<Audio>`，避免原声叠两遍。中文字体需本机有 CJK 字体；场景为占位演示，必须按逐句分镜替换或扩展。视频主体如果占满屏幕会遮挡动画，因此此例把真人放在侧边并保留主体画面：

```tsx
import React from 'react';
import {AbsoluteFill, Composition, OffthreadVideo, Sequence, registerRoot,
        staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './timing.json';
import {Person, Ground} from './lib/actors';

const Shot: React.FC = () => {
  const f = useCurrentFrame(); // 每个 Sequence 的局部帧
  return <svg width="1920" height="1080" viewBox="0 0 1920 1080">
    <Ground x={1180} y={770} w={1050}/>
    <Person x={1150} y={760} s={1.4} f={f} act="talk"/>
  </svg>;
};
const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const captions = timing.cues.filter(c => c.start <= time && time < c.end);
  return <AbsoluteFill style={{backgroundColor:'#0b1724', color:'white'}}>
    <Sequence from={0} durationInFrames={timing.durationInFrames}>
      <Shot/>
    </Sequence>
    <div style={{position:'absolute',left:70,top:120,width:520,height:690,
                 borderRadius:24,overflow:'hidden',background:'#16283b'}}>
      <OffthreadVideo src={staticFile('media/source.mp4')}
        style={{width:'100%',height:'100%',objectFit:'contain'}}/>
    </div>
    <div style={{position:'absolute',left:180,right:180,bottom:65,textAlign:'center',
                 fontFamily:'Microsoft YaHei, Noto Sans CJK SC, sans-serif',fontSize:42,
                 fontWeight:700,whiteSpace:'pre-line',lineHeight:1.35,
                 textShadow:'0 2px 8px #000, 0 0 4px #000'}}>
      {captions.map(c => c.text).join('\n')}
    </div>
  </AbsoluteFill>;
};
registerRoot(() => <Composition id="LawyerFilm" component={Film} width={1920} height={1080}
  fps={timing.fps} durationInFrames={timing.durationInFrames}/>);
```

`contain` 保留原始画面；若需要充满窗口而裁切，改用 `cover` 后依据**实际逐帧人脸位置**调整 `objectPosition`，核查头顶、下巴、手势和关键内容，不能只看第一帧。窗口、动画与字幕不得相互遮挡，也要考虑平台 UI 安全区。口播原音与画面必须来自同一持续播放的视频层；若确需单独提取、降噪或混音，必须静音视频层并只播放同步处理后的音轨，按素材起始时间对齐，检验无双声、重复或漂移。切割后的多个视频片段按相同源时间切音视频，不单独改变任何一方速度。

按分镜用 `<Sequence from={起始帧} durationInFrames={帧数}>` 在动画层替换 `Shot`：`from` 是全局输出帧，子组件 `useCurrentFrame()` 从该段起点重新计数。把人物动作、道具和事件与口播语义对齐；若从秒换算，明确统一的取整规则并避免重叠或空段。真人视频层应保持连续播放，除非用户要求剪辑；场景切换不应重新启动视频或音频。用户给的是头像或单独音频时，需要另行设计展示与音轨，不能声称静态头像是口播视频。

## 4. 渲染并复查

在新项目内执行（PowerShell 使用 `npm.cmd`/`npx.cmd`；macOS、Linux 使用 `npm`/`npx`）：

```bash
npm ci
npm run typecheck
npx remotion render src/assembly.tsx LawyerFilm out/lawyer-film.mp4 --codec=h264
ffprobe -v error -show_streams -show_format -of json "out/lawyer-film.mp4"
```

首次渲染可能需要 Remotion 支持的浏览器；按本机条件安装或使用 `--browser-executable="浏览器路径"`。若源视频的音轨类型或视频编码不能被浏览器正常解码，先在**新项目中**用 ffmpeg 创建兼容副本并检查同步、方向与质量；不要覆盖原件。变帧率素材须实播检查全程同步，必要时使用经验证的定帧率中间文件。按 [成片验收](delivery-qa.md) 实听、实看、对照字幕并记录结果；本示例只是起点，完整人物表演、分镜、数据核对和成片质量仍由 Agent 完成。
