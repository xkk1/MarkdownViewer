# Web Markdown Viewer

[Web Markdown Viewer](https://github.com/xkk1/web-markdown-viewer) 是一个纯前端项目，能够解析并显示给定 URL 上的 Markdown 文件内容。该项目自适应系统的深色或浅色模式，并且支持代码高亮显示。

## 功能特点

- **Markdown 解析**：使用 [Marked](https://github.com/markedjs/marked) 库解析 Markdown 文件。
- **代码高亮**：使用 [highlight.js](https://github.com/highlightjs/highlight.js) 进行代码高亮显示。
- **深浅主题**：根据系统设置自动切换深色和浅色模式，也可手动指定深浅模式。
- **智能替换URL路径**：自动替换 Markdown 中的图片、链接等路径为正确的 URL。

## 使用方法

你可以通过以下 URL 结构来使用该项目：

```plaintext
https://xkk1.github.io/web-markdown-viewer/?md=Markdown文件URL&title=标题&target=_self&icon=网页图标URL&theme=默认主题
```

### 参数

| 参数名 | 是否必须 | 说明 | 示例 | 默认值 |
| :-- | :-: | --- | --- | --- |
| md | 必须 | Markdown 文件 URL | `https://xkk1.github.io/web-markdown-viewer/README.md` | 无 |
| title | 可选 | 标题 | `示例标题` | `Markdown Viewer` |
| target | 可选 | 超链接打开方式 | `_blank` | `_self` |
| icon | 可选 | 网页图标 | `https://xkk1.github.io/favicon.ico` | 无 |
| theme | 可选 | 默认主题 | `auto` \| `light` \| `dark` | 无 |

## 示例

这是一个示例链接：<https://xkk1.github.io/web-markdown-viewer/?md=https://xkk1.github.io/MarkdownViewer/README.md&title=Markdown%20Viewer>

## 开始使用

1.  克隆该项目到本地：
    
    ```sh
    git clone https://github.com/xkk1/web-markdown-viewer.git
    ```

2.  进入项目目录：
      
    ```sh
    cd web-markdown-viewer
    ```
    
3.  启动一个 HTTP 服务器（或将项目部署到 GitHub Pages 等静态网站托管服务上）  
    这里使用 Python 启动一个简单的 HTTP 服务器：
    
    ```sh
    # 对于 Python 3.x
    python -m http.server 8000
    ```

    ```sh
    # 对于 Python 2.x
    python -m SimpleHTTPServer 8000
    ```

4.  在浏览器中打开以下 URL：  
    <http://localhost:8000/>

### 方案二：使用 npm build 构建并预览

本项目也支持通过 npm 脚本将 Markdown 文件预渲染为静态 HTML，适合部署到 GitHub Pages、Cloudflare Pages 等静态托管平台。

1. 安装依赖：

   ```sh
   npm install
   ```

2. 构建静态文件：

   ```sh
   npm run build
   ```

   构建完成后会生成 `dist/` 目录：

   * 自动复制项目中的所有文件
   * 将 `dist` 目录下**没有同名 `.html` 的 `.md` 文件**渲染为 `.html`

3. 本地预览构建结果：

   ```sh
   npm run preview
   ```

   然后在浏览器中访问：

   [http://localhost:4173/](http://localhost:4173/)

该方式适合将 Markdown 文档作为**静态站点**发布，无需运行时解析 Markdown。


## 贡献

欢迎任何形式的贡献！请 fork 本项目并提交 Pull Request。

## 许可证

该项目基于 GPL-3.0 许可证进行发布。