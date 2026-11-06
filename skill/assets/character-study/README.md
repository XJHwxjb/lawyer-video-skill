# 人物动作测试模板

这是独立的 10 秒静音 Remotion 样片，用于验证人物走路、停步、表情和手势；它不是完整律师视频生成器，也不含任何真实客户的音视频或头像。人物和舞台使用代码绘制，可复制到新项目进行改造。未经重新检查，不应直接将所有预设动作套进整片。

需要 Node.js 20 或更新版本，以及可用的 Chrome / Chromium 浏览器。Remotion 首次运行可能需要下载浏览器；在 Linux 上可能还需要系统浏览器依赖。画面中的中文需要系统安装支持中文的字体，模板使用 `Microsoft YaHei` 和系统回退字体。

先将此模板目录完整复制到用户授权的新项目目录，再在新目录打开终端。运行前用 `node --version`、`npm --version` 检查工具；不要在 Skill 安装目录内直接写入客户素材或输出成片。以下四条命令各自的作用是：`npm ci` 按锁定版本安装依赖；`typecheck` 检查 TypeScript；`dev` 打开可交互预览；`render` 导出 MP4。预览服务会持续运行，需要先按 `Ctrl+C` 退出才能在同一终端执行后续命令。Windows PowerShell 中如果 `npm` 不能执行，尝试 `npm.cmd`。

```bash
npm ci
npm run typecheck
npm run dev
npm run render
```

在浏览器打不开或需要指定本机浏览器时，可用 Remotion CLI 的 `--browser-executable` 参数指定浏览器，例如 `npx remotion render src/index.tsx CharacterStudy out/character-study.mp4 --browser-executable="你的浏览器路径"`。输出为 1920×1080、30 fps、300 帧、10 秒，无音轨。检查结果需实际播放，并抽帧审查脚底接地、肘部弯曲、手部穿模、人物神情和动作过渡。

`src/lib/actors.tsx` 是人物、道具与场景 SVG 组件；`src/index.tsx` 是 10 秒测试编排。走路时支持脚先有支撑期，再进入摆动期；人物横向位移与脚步同步，躯干起伏不作用于落地脚。重点测试的是当前展示的走路、担忧、交流和指向四种动作；其他预设手势是可调整的起点，不承诺均已验收。人物与道具素材为项目原创绘制，依赖项按各自许可证使用。

运行 `npm run render` 后，文件是项目目录中的 `out/character-study.mp4`。如果文件未生成，查看上面的命令报错、检查 Chrome/Chromium，再重试；不要把代码存在当作渲染成功。要进一步接入律师真人口播、字幕和完整分镜，阅读 [口播视频与 SRT 合成配方](../../references/remotion-assembly.md)；该链接从 Skill 安装目录中的模板打开时有效，复制出的独立项目不一定还保有参考文档，此时回到 Skill 目录查阅。
