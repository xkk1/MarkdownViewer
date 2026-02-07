import path from 'node:path'
import { createServer } from './dev.js'

const PORT = 4173
const root = path.join(process.cwd(), 'dist')

const server = createServer({
  root,
  enableMarkdown: false, // 🚫 预览阶段不再动态渲染
})

server.listen(PORT, () => {
  console.log(`👀 Preview: http://localhost:${PORT}`)
  console.log(`📂 Serving: ${root}`)
})
