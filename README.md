# Global Voice Input

Windows 全局语音输入小工具，使用 Electron + TypeScript 实现。

## 功能

- 托盘常驻。
- 全局语音快捷键，默认 `F8`。
- 全局确认/回车快捷键，默认 `F9`。
- 两种录音模式：
  - 切换模式：按一下开始录音，再按一下结束并识别。
  - 按住模式：按住录入，抬起结束并识别。
- 录音完成后调用 OpenAI Audio Transcriptions API。
- 识别文字写入剪贴板，模拟 `Ctrl+V` 粘贴到当前光标位置。
- 可选识别后自动回车。

## 运行

```powershell
npm install
npm run start
```

第一次运行后，在托盘菜单打开“设置”，填写 OpenAI API Key。也可以提前设置环境变量：

```powershell
$env:OPENAI_API_KEY="你的 API Key"
npm run start
```

## 默认按键

- `F8`：语音键。
- `F9`：确认/回车键。

## 说明

- 这是全电脑级别的桌面工具，不依赖浏览器扩展。
- 目前 ASR 使用录完再识别，不是实时流式字幕。
- 按住模式最适合 `F1` 到 `F12`、`Space`、`Enter` 这类单键。
- API Key 会保存在 Electron 的 `userData/settings.json`，属于本机明文配置。
- 粘贴依赖 Windows 当前活动窗口能接收 `Ctrl+V`。

## 参考

OpenAI 官方文档说明音频转写使用 `POST /v1/audio/transcriptions`，文件输入可使用 `gpt-4o-mini-transcribe` 等模型。
