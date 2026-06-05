/**
 * Obsidian → Firefly 同步脚本
 * 将 Obsidian 库中 _publish/ 文件夹的笔记复制到博客 posts 目录
 *
 * 用法：node scripts/sync-obsidian.js "你的Obsidian库路径"
 * 例如：node scripts/sync-obsidian.js "C:/Users/as/Documents/ObsidianVault"
 */

import fs from "node:fs";
import path from "node:path";

const BLOG_POSTS = "src/content/posts";
const OBSIDIAN_SOURCE_FOLDER = "_publish"; // Obsidian 库中存放待发布文章的文件夹

const obsidianVault = process.argv[2];

if (!obsidianVault) {
  console.error("请指定 Obsidian 库路径：node scripts/sync-obsidian.js <路径>");
  process.exit(1);
}

const sourceDir = path.join(obsidianVault, OBSIDIAN_SOURCE_FOLDER);
const targetDir = path.resolve(BLOG_POSTS);

if (!fs.existsSync(sourceDir)) {
  console.error(`源文件夹不存在：${sourceDir}`);
  console.error("请在 Obsidian 库中创建一个 _publish 文件夹，把想发布的笔记放进去");
  process.exit(1);
}

// 确保目标目录存在
fs.mkdirSync(targetDir, { recursive: true });

// 遍历复制 .md 文件
let count = 0;

function copyFiles(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // 跳过 .obsidian 等隐藏目录和附件目录
      if (entry.name.startsWith(".") || entry.name === "attachments") continue;
      fs.mkdirSync(destPath, { recursive: true });
      copyFiles(srcPath, destPath);
    } else {
      // 只复制 .md / .mdx 文件
      if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        let content = fs.readFileSync(srcPath, "utf-8");

        // 转换 Obsidian 双链 [[page]] → [page](page)
        content = content.replace(/\[\[([^\]|#]+?)\]\]/g, (_, p) => {
          const slug = p.trim().replace(/\s+/g, "-").toLowerCase();
          return `[${p.trim()}](/${slug}/)`;
        });

        // 转换 Obsidian 双链带别名 [[page|alias]]
        content = content.replace(/\[\[([^\]|#]+?)\|([^\]]+?)\]\]/g, (_, p, alias) => {
          const slug = p.trim().replace(/\s+/g, "-").toLowerCase();
          return `[${alias.trim()}](/${slug}/)`;
        });

        // 检查是否有 frontmatter，没有则自动添加
        if (!content.startsWith("---")) {
          const title = entry.name.replace(/\.mdx?$/, "");
          const date = new Date().toISOString().slice(0, 10);
          const frontmatter = `---\ntitle: "${title}"\npublished: ${date}\ndraft: false\n---\n\n`;
          content = frontmatter + content;
        }

        // 确保 draft 为 false（自动发布）
        content = content.replace(/draft:\s*true/, "draft: false");

        fs.writeFileSync(destPath, content, "utf-8");
        console.log(`  ✅ ${entry.name}`);
        count++;
      }
    }
  }
}

copyFiles(sourceDir, targetDir);

console.log(`\n同步完成！共 ${count} 篇文章 → ${targetDir}`);
console.log("运行 pnpm dev 预览，然后 git push 上线");
