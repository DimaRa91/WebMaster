# agent-reach

Multi-platform internet access tool for AI agents — search, read, and interact with 13+ platforms.

多平台互联网访问工具 — 搜索、阅读、交互 13+ 个平台。

## Install / 安装

```bash
npx skills add EdisonChenAI/agent-reach
```

---

## English

Upstream tools for 13+ platforms. Call them directly.

Run `agent-reach doctor` to check which channels are available.

### Workspace Rules

**Never create files in the agent workspace.** Use `/tmp/` for temporary output and `~/.agent-reach/` for persistent data.

### Supported Platforms

| Platform | Tool | Auth Required |
|----------|------|---------------|
| Web (any URL) | `curl -s "https://r.jina.ai/URL"` | No |
| Web Search | Exa (`mcporter`) | No |
| Twitter/X | `xreach` | Yes (cookies) |
| YouTube | `yt-dlp` | No |
| Bilibili | `yt-dlp` | Optional |
| Reddit | `curl` / Exa | No |
| GitHub | `gh` CLI | Yes |
| XiaoHongShu | `mcporter` | Yes (cookies) |
| Douyin | `mcporter` | No |
| WeChat Articles | Camoufox | No |
| LinkedIn | `mcporter` | Yes |
| Boss直聘 | `mcporter` | Yes |
| RSS | `feedparser` | No |

### Quick Examples

```bash
# Web search
mcporter call 'exa.web_search_exa(query: "query", numResults: 5)'

# Twitter/X
xreach search "query" -n 10 --json
xreach tweet URL_OR_ID --json
xreach tweets @username -n 20 --json

# YouTube
yt-dlp --dump-json "URL"
yt-dlp --write-sub --write-auto-sub --sub-lang "zh-Hans,zh,en" --skip-download -o "/tmp/%(id)s" "URL"

# GitHub
gh search repos "query" --sort stars --limit 10

# XiaoHongShu
mcporter call 'xiaohongshu.search_feeds(keyword: "query")'

# WeChat Articles
cd ~/.agent-reach/tools/wechat-article-for-ai && python3 main.py "URL"
```

### Troubleshooting

- **Channel not working?** Run `agent-reach doctor`
- **Twitter fetch failed?** Ensure `undici` is installed: `npm install -g undici`

---

## 中文

支持 13+ 个平台的上游工具，直接调用即可。

运行 `agent-reach doctor` 检查哪些通道可用。

### 工作区规则

**不要在 agent 工作区创建文件。** 临时输出用 `/tmp/`，持久数据用 `~/.agent-reach/`。

### 支持平台

| 平台 | 工具 | 需要认证 |
|------|------|----------|
| 任意网页 | `curl -s "https://r.jina.ai/URL"` | 否 |
| 网页搜索 | Exa (`mcporter`) | 否 |
| Twitter/X | `xreach` | 是（cookies） |
| YouTube | `yt-dlp` | 否 |
| B站 | `yt-dlp` | 可选 |
| Reddit | `curl` / Exa | 否 |
| GitHub | `gh` CLI | 是 |
| 小红书 | `mcporter` | 是（cookies） |
| 抖音 | `mcporter` | 否 |
| 微信公众号 | Camoufox | 否 |
| LinkedIn | `mcporter` | 是 |
| Boss直聘 | `mcporter` | 是 |
| RSS | `feedparser` | 否 |

### 快速示例

```bash
# 网页搜索
mcporter call 'exa.web_search_exa(query: "查询内容", numResults: 5)'

# Twitter/X
xreach search "关键词" -n 10 --json
xreach tweet URL_OR_ID --json

# YouTube
yt-dlp --dump-json "URL"

# 小红书
mcporter call 'xiaohongshu.search_feeds(keyword: "关键词")'

# 微信公众号
cd ~/.agent-reach/tools/wechat-article-for-ai && python3 main.py "URL"
```

### 故障排查

- **通道不工作？** 运行 `agent-reach doctor`
- **Twitter 抓取失败？** 确保安装了 `undici`：`npm install -g undici`

## License

MIT
