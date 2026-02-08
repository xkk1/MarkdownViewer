import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 使用本地的 marked
// import { marked } from './libs/marked/marked.esm.js'
// import { gfmHeadingId } from './libs/marked-gfm-heading-id/index.js'

// 使用 npm 安装的 marked
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置 marked
marked.use(gfmHeadingId())

const distName = 'dist'
const root = process.cwd()
const dist = path.join(root, distName)
// web-markdown-viewer project root path
const webMarkdownViewerPath = path.join(root, distName, path.relative(root, __dirname))
console.log('web-markdown-viewer dist Path:', webMarkdownViewerPath)
const templatePath = path.join(webMarkdownViewerPath, 'template.html')

async function build() {
  console.log('📦 Building...')
  await fs.rm(dist, { recursive: true, force: true })
  await copyDir(root, dist)
  await renderMarkdownInDist()
  console.log('✅ Build finished')
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name === 'dist') continue
    if (entry.name === 'node_modules') continue
    if (entry.name === '.git') continue

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
  const template = await fs.readFile(templatePath, 'utf-8')
  await walk(dist, async (filePath) => {
    if (!filePath.endsWith('.md')) return

    const htmlPath = filePath.replace(/\.md$/, '.html')
    try {
      await fs.access(htmlPath)
      return // 已存在同名 html，跳过
    } catch { }

    const md = await fs.readFile(filePath, 'utf-8')
    const content = marked.parse(md)
    let relativePath = path.relative(path.dirname(filePath), webMarkdownViewerPath);
    if (relativePath) {
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath
      }
    } else {
      relativePath = '.'
    }
    const html = template.replaceAll('{{relativePath}}', relativePath).replace('{{content}}', content)

    await fs.writeFile(htmlPath, html)
    console.log(`📝 Rendered: ${path.relative(dist, htmlPath)}`)
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
