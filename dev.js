/*
写一个 node.js dev.js，"type": "module"。并提供一个模板 template.html
目标：创建一个简单基于当前目录的 HTTP 服务器
功能：若遇到不存在的 html 尝试读取 同目录同文件名的.md 文件，调用 marked 把生成的内容填到模板里发出去
 */
import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 使用本地的 marked
// import { marked } from './libs/marked/marked.esm.js'
// import { gfmHeadingId } from './libs/marked-gfm-heading-id/index.js'

// 使用 npm 安装的 marked
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

// 配置 marked
marked.use(gfmHeadingId())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 当前工作目录作为站点根目录
const ROOT = process.cwd()
const PORT = 3000

const server = http.createServer(async (req, res) => {
  // log info
  console.log(`${req.method} ${req.url}`)
  try {
    const urlPath = decodeURIComponent(req.url.split('?')[0])
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
    let filePath = path.join(ROOT, safePath)

    // 目录默认 index.html
    if (filePath.endsWith(path.sep)) {
      filePath += 'index.html'
    }

    // 1️⃣ 如果 html 存在，直接返回
    if (filePath.endsWith('.html')) {
      try {
        const html = await fs.readFile(filePath, 'utf-8')
        sendHTML(res, html)
        return
      } catch {
        // html 不存在，继续尝试 md
      }

      // 2️⃣ 尝试同名 md
      const mdPath = filePath.replace(/\.html$/, '.md')
      try {
        const md = await fs.readFile(mdPath, 'utf-8')
        const content = marked.parse(md)

        const templatePath = path.join(ROOT, 'template.html')
        const template = await fs.readFile(templatePath, 'utf-8')

        const html = template.replace('{{content}}', content)
        sendHTML(res, html)
        return
      } catch {
        send404(res)
        return
      }
    }

    // 3️⃣ 普通静态文件
    const data = await fs.readFile(filePath)
    sendFile(res, data, getContentType(filePath))
  } catch (err) {
    console.error(err)
    send500(res)
  }
})

server.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`)
  console.log(`📂 Serving: ${ROOT}`)
})

function sendHTML(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(html)
}

function sendFile(res, data, type = 'application/octet-stream') {
  res.writeHead(200, { 'Content-Type': type })
  res.end(data)
}

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('404 Not Found')
}

function send500(res) {
  res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('500 Internal Server Error')
}

function getContentType(filePath) {
  const ext = path.extname(filePath)
  return {
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.yaml': 'application/yaml',
    '.yml': 'application/yaml',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.md': 'text/markdown',
    '.markdown': 'text/markdown',
    '.txt': 'text/plain',
  }[ext] || 'application/octet-stream'
}
