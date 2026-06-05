  # Fishtalk 博客项目记忆文件

> 最后更新：2026-06-05

## 项目概述

- **博客名称**：Fishtalk
- **域名**：`https://fishction.xyz`
- **模板**：Firefly v6.10.9（基于 Astro 6.4.2 的静态博客主题）
- **本地路径**：`C:\Users\as\Desktop\blog\Firefly`
- **包管理器**：pnpm（项目要求 pnpm ≥ 9，Node.js ≥ 22）

## GitHub 仓库

| 仓库 | 用途 | 分支 |
|------|------|------|
| `wyy2210397029-cmyk/Firefly` | 博客主仓库 | master |
| `wyy2210397029-cmyk/fishtalk-oauth` | Decap CMS OAuth 服务 | main |
| `wyy2210397029-cmyk/twikoo-vercel` | Twikoo 评论后端 | main |

## 部署架构

```
fishction.xyz (Cloudflare Pages)
  ← 自动部署自 wyy2210397029-cmyk/Firefly (master)
  ← /admin/ → Decap CMS → GitHub OAuth → fishtalk-oauth.vercel.app (Vercel)
  ← 评论区 → Twikoo → twikoo-vercel-omega-two.vercel.app (Vercel)
  ← Twikoo 数据库 → MongoDB Atlas (免费集群)
```

### Cloudflare Pages
- 从 GitHub `wyy2210397029-cmyk/Firefly` master 分支自动部署
- 构建命令：`pnpm run build`
- 输出目录：`dist`
- **已知问题**：曾经因 git 子模块导致构建失败（已修复），如再出现去 Dashboard 清除缓存

### Vercel（两个项目）

**`fishtalk-oauth`** — Decap CMS 的 GitHub OAuth 回调服务
- 地址：`https://fishtalk-oauth.vercel.app`
- 环境变量：`OAUTH_CLIENT_ID`、`OAUTH_CLIENT_SECRET`
- 本地源码：`C:\Users\as\Desktop\blog\Firefly\decap-oauth\`

**`twikoo-vercel-omega-two`** — Twikoo 评论后端
- 地址：`https://twikoo-vercel-omega-two.vercel.app`
- 环境变量：`MONGODB_URI`
- 本地源码：`C:\Users\as\Desktop\twikoo-vercel\`

### Twikoo 修复关键
- `twikoo-vercel` npm 包 `main` 是 `api/index.js`，直接导出处理函数
- `api/index.js` 只需 `module.exports = require("twikoo-vercel")`
- **不能用** `createServer()`，该方法不存在
- MongoDB URI：`mongodb+srv://wyy2210397029:wyy050717@cluster0.jktoxag.mongodb.net/?appName=Cluster0`

### MongoDB Atlas
- 免费 M0 集群，AWS Singapore 节点
- 用户：`wyy2210397029` / `wyy050717`
- 数据库：`twikoo`（由 Twikoo 自动创建）

## 博客配置文件修改记录

路径前缀：`src/config/`

### siteConfig.ts
- title → `"Fishtalk"`、subtitle → `"记录学习与生活的角落"`
- site_url → `"https://fishction.xyz"`
- description → `"写着玩的：）"`（用户自设）
- keywords → `["音乐", "博客", "随笔"]`（用户自设）
- themeColor.hue → `200`（蓝色系，用户自设）
- navbar.title → `"fishtalk"`（小写）
- navbar.logo.alt → `"🐟"`
- siteStartDate → `"2026-06-05"`
- **导航栏链接模块已删除**（navBarConfig.ts 中删除了"链接"菜单）

### profileConfig.ts
- name → `"fishtalk"`、bio → `"有个性的人不需要个性签名。"`（用户自设）
- avatar → `"assets/images/tou.jpg"`（用户自设）
- links → GitHub + RSS（占位链接，需用户自行填写真实地址）

### commentConfig.ts
- type → `"twikoo"`
- envId → `"https://twikoo-vercel-omega-two.vercel.app"`
- CDN → 国内 npmmirror

### backgroundWallpaper.ts
- 桌面壁纸：`ti81ai4bbtmd1 (1).jpg`、`realesrgan-output.png`（用户自设）
- 移动壁纸：`微信图片_20260605171030_139_18.jpg`、`微信图片_20260605171039_141_18.jpg`
- 横幅标题 → `"Lovely firefly!"`（用户未改）
- 横幅副标题 → 英文诗句数组（用户未改）
- 打字机效果 → 开启，speed: 100, deleteSpeed: 50, pauseTime: 2000

### friendsConfig.ts
- 示例友链已清空，仅保留注释模板

### announcementConfig.ts
- content → `"欢迎来到 Fishtalk！博客还在搭建中，敬请期待更多内容。"`

### footerConfig.ts + FooterConfig.html
- 已开启页脚，显示 `© 2026 Fishtalk · fishction.xyz`
- Powered by Firefly & Astro 链接

### musicConfig.ts
- mode → `"local"`（用户尝试过 meting API 搜索但失败，切回本地）
- 本地歌单：`何大河 - Crossing The Ocean.mp3`
- 封面：`/assets/music/cover/folder.jpg`
- **MP3 文件需用户自行放入 `public/` 目录**

### navBarConfig.ts
- 已删除"链接"菜单模块（包括 GitHub、Gitee、QQ 交流群子菜单）

## 页面内容修改

- `src/content/posts/` — 示例文章已全部清空
- `src/content/spec/about.md` — 改写为 Fishtalk 简介
- `src/content/spec/friends.mdx` — 站点信息改为 Fishtalk/fishction.xyz

## 在线编辑（Decap CMS）

访问 `https://fishction.xyz/admin/` 可以在线写文章。

### 相关文件
- 管理页面：`public/admin/index.html`
- CMS 配置：`public/admin/config.yml`
- OAuth 服务代码：`decap-oauth/`（独立仓库 `fishtalk-oauth`）

### OAuth 修复关键
- `api/callback.js` 中 `postMessage` 的 targetOrigin 从 `window.location.origin` 改为 `"*"`
- 因为 `fishtalk-oauth.vercel.app` 向 `fishction.xyz` 发送跨域消息
- GitHub OAuth App 回调 URL：`https://fishtalk-oauth.vercel.app/api/callback`

### 当前状态
- OAuth 显示"Authorization successful"但不跳转 → 需在 Vercel 手动 Redeploy `fishtalk-oauth` 项目
- 配置已正确（base_url → fishtalk-oauth.vercel.app）
- **待解决**：`fishtalk-oauth` Vercel 需要 Redeploy 才能生效

## Obsidian 同步

- Obsidian 库路径：`C:\Users\as\Desktop\F1`
- 同步脚本：`scripts/sync-obsidian.js`
- 用法：`pnpm sync "C:/Users/as/Desktop/F1"`
- 机制：将 `_publish/` 文件夹的 .md 复制到 `src/content/posts/`
- 自动转换 Obsidian 双链 `[[page]]`，自动补充 frontmatter

## Git 推送流程

```bash
cd C:/Users/as/Desktop/blog/Firefly
git add -A
git commit -m "说明"
git push origin master
```

推送后 Cloudflare Pages 自动部署。

## 常用命令

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 本地预览（localhost:4321）|
| `pnpm sync "C:/Users/as/Desktop/F1"` | 从 Obsidian 同步文章 |
| `pnpm new-post <文件名>` | 创建新文章 |
| `pnpm build` | 构建静态站点 |
| `git push origin master` | 推送并触发自动部署 |

## 待完成事项

1. ✗ Twikoo 评论仍有问题（`twikoo-vercel-omega-two` 修复代码已推送，等 Vercel 部署）
2. ✗ Decap CMS OAuth 跳转（`fishtalk-oauth` 需 Vercel Redeploy）
3. ✗ Cloudflare Pages 部署曾因子模块失败（已修复，4fa5cf0 提交）
4. ✗ 用户头像/社交链接仍是占位信息
5. ✗ Bangumi 用户 ID 仍是模板作者的 `1143164`
6. ✗ 音乐播放器 MP3 文件需放入 `public/` 目录
