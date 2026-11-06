# Lawyer Video Skill · 律师口播视频制作

一个可供支持 `SKILL.md` 的 AI Agent 使用的技能：根据律师口播视频、稿件或带时间戳的字幕，制作带真人画面、逐句字幕、人物行为动画和说明图示的法律科普视频。

技能包含制作流程、[叙事与镜头节奏指南](skill/references/narrative-motion.md)、人物动作和成片验收方法，一个可编辑的 10 秒人物动作测试模板，以及 **51 个原创法律主题 SVG 图案**。模板是 **Remotion 动画起点**，不是一键把任意口播自动变成完整视频的程序；Agent 仍需根据素材分析、分镜、实现、渲染和验收成片。关键金额要区分约定、实付、主张与判决，人物和道具需要表现实际行为与交接；字幕和信息按口播语义推进。

## 安装和使用

将仓库中的 `skill/` 目录完整复制到 Agent 的技能目录，并命名为 `lawyer-video`。例如 Codex 默认位置为 `~/.codex/skills/lawyer-video/`；其他 Agent 请使用其支持 `SKILL.md` 的技能目录或把该目录作为上下文提供。保留其中的 `references/`、`scripts/` 和 `assets/` 目录。安装后若 Agent 未识别到新技能，可重启或重新加载技能列表。

例如在 Windows PowerShell 中，可先把仓库下载到 D 盘，再复制技能目录：

```powershell
git clone https://github.com/XJHwxjb/lawyer-video-skill.git D:\Codex\lawyer-video-skill
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item -Recurse -LiteralPath 'D:\Codex\lawyer-video-skill\skill' -Destination "$env:USERPROFILE\.codex\skills\lawyer-video"
```

上述示例假设目标技能目录尚不存在；若已存在同名技能，先检查并妥善备份，避免覆盖自己的改动。其他操作系统请将 `skill/` 复制到对应 Agent 的技能目录。

已经安装旧版时，先备份并检查本地技能是否有个人修改，再获取仓库最新版并按所用 Agent 的方式重新导入整个 `skill/` 目录（包括新增的 `references` 和 `assets`），然后重新加载技能。仅更新 `SKILL.md` 而漏掉示例代码，会导致链接和组件不可用。

然后向 Agent 提供口播视频、口播稿或 SRT，以及画幅、发布平台等要求，例如：

> 使用 lawyer-video 技能，根据我提供的口播视频和 SRT 制作法律科普视频。保留律师真人和原声，用人物行为动画说明内容，先做一段 10 秒的人物动作小样给我看。

Agent 先读 [SKILL.md](skill/SKILL.md)，再按任务读取[中文逐步执行指南](skill/references/workflow-zh.md)、[人物动作指南](skill/references/character-animation.md)、[法律 SVG 使用与绘制指南](skill/references/legal-svg.md)和[口播视频与字幕合成配方](skill/references/remotion-assembly.md)。人物样片运行方法与依赖见[模板说明](skill/assets/character-study/README.md)。完整视频的工具、算力、输入素材和审片方式由执行环境及用户需求决定。

法律 SVG 图案可从[图标目录](skill/assets/legal-svg/catalog.json)查找，覆盖天平、法槌、合同、家庭、劳动、债务、房产、证据和辅助元素；[分类预览图](skill/assets/legal-svg/previews/)可以直接查看。图案使用透明底和 `currentColor` 描边，颜色和动画需在具体作品中设置。

## 内容与隐私

本仓库不含律师的人像、口播、客户案件资料或原始视频。处理具体案例时，请在获得授权的位置使用素材，未经授权不向外部服务上传或公开。法律内容、数据口径与最终发布由使用者核对。

## 许可

本仓库原创内容采用 [MIT License](LICENSE)；依赖库遵循各自的许可。
