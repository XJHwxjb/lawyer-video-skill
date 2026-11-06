# 用口播视频和 SRT 合成：Remotion 起步配方

本配方帮助 Agent 从视频与带时间戳的字幕搭起**可运行的基底**。它只展示素材、字幕和场景如何同步，并不自动理解法律稿件或生成全部分镜。先复制 `assets/character-study/` 到用户授权的**新项目目录**，安装 Node.js 20+、Python 3、ffmpeg/ffprobe 和可用 Chromium；然后按实际分镜修改代码。例子使用本地数据；不要将客户素材放入公开仓库、模板目录或云端。

这份文档写给负责实际操作文件和命令的 Agent。下面的“项目目录”是复制出来的新文件夹，**不是** Skill 的安装目录。所有命令默认在项目目录执行；路径、素材名称和画幅以实际用户提供的信息为准。`source.mp4`、`input.srt` 和 `lawyer-film.mp4` 是演示名称，并不是必须要求用户这样命名。先复制并重命名副本，禁止覆盖原件。若用户只有普通稿件而没有 SRT，先采用本地可用工具对口播转写并生成带时间的字幕，对照录音校对；没有可用工具时如实说明，不能编造时间戳。

## 开始前：看懂目录和目标

将 Skill 中的 `assets/character-study` **整个目录复制**成新的项目文件夹后，期望结构如下：

```text
新项目/
├── package.json、package-lock.json、tsconfig.json  # 工具依赖及编译设置
├── src/
│   ├── index.tsx            # 原有 10 秒人物样片入口，供动作测试
│   ├── lib/actors.tsx       # 可以修改的人物、道具和地面组件
│   ├── timing.json          # 后续从字幕与素材生成；复制后起初没有
│   └── assembly.tsx         # 后续创建的真人口播合成入口；起初没有
├── public/media/source.mp4  # 律师口播视频副本，需自己创建目录并复制
├── input.srt                # 字幕副本，需自己复制
└── out/lawyer-film.mp4      # 渲染后才出现的输出文件
```

这里的 10 秒样片与 `assembly.tsx` 是两个不同入口：`index.tsx` 检验人物动作，`assembly.tsx` 制作视频基底。不要把 10 秒样片误当成用户的完整视频，也不要直接把示例中的单一说话动作循环至整片；后面须按口播建立分镜和相应动作。

开始时逐项执行 `node --version`、`npm --version`、`python --version`、`ffmpeg -version`、`ffprobe -version`；若任一命令无法找到，先解决相应依赖再继续，不要假装成功。Node.js 需要 20 或更新版本。运行 `npm ci` 需能读取项目中的 `package-lock.json`；在 Windows PowerShell 中，可将本指南中的 `npm`、`npx` 分别替换为 `npm.cmd`、`npx.cmd`。如果终端权限、网络或浏览器不可用，记录真实错误和已完成工作。

## 1. 安置和检查素材

进入复制后的新项目，用文件管理器或系统复制命令将视频和字幕分别放到 `public/media/source.mp4`、`input.srt`。路径含空格时加引号。原件保留；如果视频不是 MP4，将实际文件复制进 `public/media/` 并在下面代码中修改文件名。任何重编码、旋转与裁剪之前先对照源素材确认：

```bash
ffprobe -v error -show_streams -show_format -of json "public/media/source.mp4"
```

查看分辨率、旋转标记、时长、视频流与音轨；在素材播放器中确认画面方向、人脸位置、开头结尾及实际音画同步。手机竖拍、变帧率和含多个音轨的素材要特别检查；不要默认第一条音轨是目标声音。保留用户对画幅、时间线和剪辑的要求。

## 2. 将时间戳转成数据

本技能也提供 [时间轴生成脚本](../scripts/prepare_timing.py)。如果 Agent 能定位该文件，优先在项目目录执行下面的命令。将 `<技能目录>` 整体替换成实际安装的 `lawyer-video` 目录；尖括号只是提示，**不要原样输入**。脚本路径即使含空格也必须放在引号中；视频与字幕位置同样可按实际修改。

```bash
python "<技能目录>/scripts/prepare_timing.py" --video "public/media/source.mp4" --srt "input.srt" --output "src/timing.json" --fps 30
```

命令成功后应有 `src/timing.json`，其中包含输出帧率 `fps`、总帧数 `durationInFrames`、时长 `durationSeconds` 和字幕数组 `cues`。每条字幕有以秒为单位的 `start`、`end` 和原文 `text`。使用前确认结果和原始 SRT 一致。若脚本不可用，下面提供可独立保存、运行的简化实现，二者任选一种，不需要都运行。

以下简化实现假定字幕使用 UTF-8、每个片段有 `序号 / 时间 / 文本` 格式，时间为 `00:00:00,000 --> 00:00:01,200`。可多行文本；其他编码先转换或调整读取方式。在**项目根目录**创建名为 `prepare.py` 的 UTF-8 文件，把整个 Python 代码块写入文件：

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

代码逐段解释：`subprocess.check_output` 调用 ffprobe 获取源视频时长；`pattern` 和 `seconds()` 把 SRT 的小时、分钟、秒和毫秒换算为秒；循环依照空行拆分字幕，找到 `-->` 时间行，再把后面的文字合为一条；检查结束时间必须大于开始时间；最后写入 JSON 给视频组件读取。例如 `00:00:01,200 --> 00:00:02,000` 转为 `start: 1.2`、`end: 2.0`，30 fps 时会在第 36 帧开始显示，到第 60 帧之前结束。`fps = 30` 可根据用户要求修改，但生成 JSON 和渲染配置必须使用同一个数值。

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

### 这段代码每一部分负责什么

1. `import ... from 'remotion'` 引入合成组件：`AbsoluteFill` 是铺满画布的底层容器；`OffthreadVideo` 播放口播视频；`Sequence` 定义一段素材或动画出现的时间；`staticFile` 指向 `public` 下的本地文件。`timing.json` 是上一步生成的数据，`Person` 和 `Ground` 来自人物模板。
2. `Shot` 是**一个演示镜头**：用 SVG 画地面并放一个人物。`Person` 的 `x`、`y` 控制人物在 1920×1080 画布中的位置，`s` 是缩放比例，`f` 传入当前帧，`act="talk"` 是说话动作。这里仅证明接线方式，真实分镜应根据口播让人物走路、交接材料、查看手机等。动画动作不得改变用户原稿的事实。
3. `Film` 是整片画布。`frame / fps` 把当前帧换成秒；`filter` 查找这一时刻应显示的字幕。视频放在一个固定窗口，字幕放画面下方。代码中先绘制 `Shot`，再绘制视频，再绘制字幕；后绘制的层会盖住先绘制的层，调整位置时要检查遮挡。
4. `registerRoot` 注册可渲染作品；`id="LawyerFilm"` 必须与渲染命令中的 `LawyerFilm` 一致。`width`、`height` 分别是输出画布宽、高，`fps`、`durationInFrames` 从 JSON 读取。若改为竖屏，除更改输出画幅外，还必须重排人物、视频窗口和字幕，并检查是否越界，不能只改画布数字。

### 必须按实际项目调整的地方

| 项目 | 示例中的位置 | 实际处理 |
| --- | --- | --- |
| 视频文件名 | `staticFile('media/source.mp4')` | 对应新项目的 `public/media/` 下的文件；两处名称要完全一致。 |
| 真人窗口 | `left:70, top:120, width:520, height:690` | 根据源画幅与人物位置调整；检查全程人脸和手势。 |
| 字幕位置和大小 | `left/right/bottom`、`fontSize:42` | 避开真人、人物动画和平台遮挡区；长句分行，确认字不出框。 |
| 动画镜头 | `Shot` 和其外层的 `Sequence` | 根据逐句分镜替换为多个具体动作；每个镜头的起止必须覆盖整段叙事。 |
| 输出文件 | 渲染命令中的 `out/lawyer-film.mp4` | 改成用户指定的输出路径或项目内路径；不要覆盖输入素材。 |

例如在 30 fps 下，前 3 秒为第 0–89 帧，接下来的 2 秒为第 90–149 帧：动画层可用相邻的 `<Sequence from={0} durationInFrames={90}>` 和 `<Sequence from={90} durationInFrames={60}>` 包裹各自镜头。它们是解释时间计算的片段，实际使用时还需要补上完整子组件、后续镜头和闭合标签。音视频的连续播放应放在这些动画镜头之外，不要随着镜头反复重启。

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

## 常见问题：先看现象，再找原因

| 现象 | 检查和处理 |
| --- | --- |
| `ffprobe` 或 `node` 找不到 | 检查软件是否安装、终端 PATH 是否包含程序；修复后重新执行版本命令。不要直接跳过素材检查。 |
| `npm ci` 报没有 lock 文件 | 确认当前工作目录是复制出的项目根目录，且保留了模板的 `package.json` 和 `package-lock.json`。 |
| 找不到 `timing.json` | 先检查素材路径并成功运行时间轴生成脚本；确认文件真的写在当前项目 `src/` 下，再运行类型检查或渲染。 |
| 找不到视频或画面黑 | 核对 `public/media/` 下文件名和 `staticFile()` 路径大小写，检查编码和权限；先用播放器确认副本能播放。 |
| 找不到 `LawyerFilm` | 确认命令入口是 `src/assembly.tsx`，并且注册的 `<Composition id>` 与命令相同。`src/index.tsx` 只注册人物样片。 |
| 字幕乱码、错位或溢出 | 检查 SRT 编码和时间是否与口播一致；检查安装的中文字体、字幕安全区和句长；播放前、中、后并修正。 |
| 声音重叠、有回声或不同步 | 同源视频与 `<Audio>` 是否同时播放？视频应只用一条原声；有独立混音时静音视频层并对齐时间，检查首尾。 |
| 角色手臂向内折、脚滑动 | 检查肘部与肩腕相对位置、脚底支撑期以及人物的位移速度；连续播放或密集抽帧验证，不要只看静态姿势。 |
| 找不到浏览器或无法渲染 | 根据 Remotion 报错安装/指定可用 Chromium，或传入正确的 `--browser-executable`；不要在失败后声称成片已导出。 |

有错误时保留原始报错、检查路径和依赖，再小范围修改并重试。无法解决时交付实际已完成的文件和明确障碍，不能把代码示例描述成已经产生的成片。
