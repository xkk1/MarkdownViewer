import fs from 'node:fs/promises'
import path from 'node:path'

// 使用本地的 marked
// import { marked } from './libs/marked/marked.esm.js'
// import { gfmHeadingId } from './libs/marked-gfm-heading-id/index.js'

// 使用 npm 安装的 marked
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

// 配置 marked
marked.use(gfmHeadingId())

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const TEMPLATE_PATH = path.join(DIST, 'template.html')

async function build() {
  console.log('📦 Building...')
  await fs.rm(DIST, { recursive: true, force: true })
  await copyDir(ROOT, DIST)
  await renderMarkdownInDist()
  console.log('✅ Build finished')
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name === 'dist') continue
    if (entry.name === 'node_modules') continue

    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

async function renderMarkdownInDist() {
  const template = await fs.readFile(TEMPLATE_PATH, 'utf-8')
  await walk(DIST, async (filePath) => {
    if (!filePath.endsWith('.md')) return

    const htmlPath = filePath.replace(/\.md$/, '.html')
    try {
      await fs.access(htmlPath)
      return // 已存在同名 html，跳过
    } catch {}

    const md = await fs.readFile(filePath, 'utf-8')
    const content = marked.parse(md)
    const relativePath = path.relative(path.dirname(filePath), DIST) || '.';
    const html = template.replaceAll('{{relativePath}}', relativePath).replace('{{content}}', content)

    await fs.writeFile(htmlPath, html)
    console.log(`📝 Rendered: ${path.relative(DIST, htmlPath)}`)
  })
}

async function walk(dir, cb) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(fullPath, cb)
    } else {
      await cb(fullPath)
    }
  }
}

build().catch(err => {
  console.error(err)
  process.exit(1)
})
