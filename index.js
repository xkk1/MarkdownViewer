/*
Markdown Viewer core code
Copyright (C) 2024  [xkk1](https://github.com/xkk1)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

//获取 URL get 参数
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return decodeURI(pair[1]);
        }
    }
    return null;
}
/*
使用实例
url 实例：

http://www.runoob.com/index.php?id=1&image=awesome.jpg
调用 getQueryVariable("id") 返回 1。

调用 getQueryVariable("image") 返回 "awesome.jpg"。
*/


// 修改标题
document.title = getQueryVariable("title") || document.title;

// 设置超链接默认打开方式 
let target = getQueryVariable("target") || "_self";
let baseElement = document.createElement("base");
baseElement.setAttribute("target", target);
document.head.appendChild(baseElement);

// 设置网页图标
let icon = getQueryVariable("icon");
if (icon) {
    let link = document.createElement("link");
    link.rel = "icon";
    link.href = icon;
    document.head.appendChild(link);
}

// 设置默认主题
let theme = getQueryVariable("theme");
if (theme && localStorage.getItem("theme") === null) {
    localStorage.setItem("theme", theme);
}

// 默认显示的内容
let introductionMarkdown = `# Markdown Viewer

[Markdown Viewer](https://github.com/xkk1/MarkdownViewer) 是一个纯前端项目，能够解析并显示给定 URL 上的 Markdown 文件内容。该项目自适应系统的深色或浅色模式，并且支持代码高亮显示。

## 功能特点

- **Markdown 解析**：使用 [Marked](https://github.com/markedjs/marked) 库解析 Markdown 文件。
- **代码高亮**：使用 [highlight.js](https://github.com/highlightjs/highlight.js) 进行代码高亮显示。
- **自适应模式**：根据系统设置自动切换深色和浅色模式。

## 使用方法

你可以通过以下 URL 结构来使用该项目：

\`${window.location.protocol + "//" + window.location.host + window.location.pathname}?\`<input id="md-input" type="text" placeholder="Markdown文件URL" size="25" />\`&title=\`<input id="title-input" type="text" placeholder="标题" size="14" />\`&target=\`<input id="target-input" type="text" placeholder="_self" size="8" />\`&icon=\`<input id="icon-input" type="text" placeholder="https://xkk1.github.io/favicon.ico" size="25" />\`&theme=\`<input id="theme-input" type="text" placeholder="auto" size="5" />

<button type="button" onclick="changeMarkdownParseUrl();">生成 URL</button> <a id="markdown-parse-url" href="#" target="_blank"></a>

### 参数

| 参数名 | 是否必须 | 说明 | 示例 | 默认值 |
| :-- | :-: | --- | --- | --- |
| md | 必须 | Markdown 文件 URL | \`https://xkk1.github.io/MarkdownViewer/README.md\` | 无 |
| title | 可选 | 标题 | \`示例标题\` | \`Markdown Viewer\` |
| target | 可选 | 超链接打开方式 | \`_blank\` | \`_self\` |
| icon | 可选 | 网页图标 | \`https://xkk1.github.io/favicon.ico\` | 无 |
| theme | 可选 | 默认主题 | \`auto\` \| \`light\` \| \`dark\` | 无 |

## 示例

这是一个示例链接：<https://xkk1.github.io/MarkdownViewer/?md=https://xkk1.github.io/MarkdownViewer/README.md&title=Markdown%20Viewer>

## 开始使用

1. 克隆该项目到本地： 
     
    \`\`\`sh
    git clone https://github.com/xkk1/MarkdownViewer.git
    \`\`\`

2. 进入项目目录：
      
    \`\`\`sh
    cd MarkdownViewer
    \`\`\`

3. 启动一个 HTTP 服务器（或将项目部署到 GitHub Pages 等静态网站托管服务上）  
    这里使用 Python 启动一个简单的 HTTP 服务器：  
    
    \`\`\`sh
    # 对于 Python 3.x
    python -m http.server 8000
    \`\`\`

    \`\`\`sh
    # 对于 Python 2.x
    python -m SimpleHTTPServer 8000
    \`\`\`

4. 在浏览器中打开以下 URL：  
    <http://localhost:8000/>


## 贡献

欢迎任何形式的贡献！请 fork 本项目并提交 Pull Request。

## 许可证

该项目基于 GPL-3.0 许可证进行发布。
`;

// 出错时显示的内容
let errorMarkdown = `# [错误]：获取 Markdown 失败

{errorInfo}

---

` + introductionMarkdown;

// 显示 Markdown
function showMarkdown(markdown) {
    let markdownElement = document.getElementById("markdown");
    markdownElement.style.whiteSpace = 'initial';
    markdownElement.innerHTML = marked.parse(markdown);
    // 代码高亮
    xkk1.highlight();
}

document.addEventListener('DOMContentLoaded', (event) => {
    let markdownURL = getQueryVariable("md");
    if (markdownURL) {
        fetch(markdownURL)
            .then(response => response.text())
            .then(markdown => showMarkdown(markdown))
            .catch(error => showMarkdown(errorMarkdown.replace("{errorInfo}", error)));
    } else {
        showMarkdown(introductionMarkdown);
    }

});

// 生成 Markdown 解析显示 URL
function generateMarkdownParseUrl() {
    let markdownParseUrlSearchStrings = ["md", "title", "target", "icon", "theme"];
    // "https://xkk1.github.io/MarkdownViewer/";
    let markdownParseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    let markdownParseUrlSearchs = [];
    for (let i = 0; i < markdownParseUrlSearchStrings.length; i++) {
        let markdownParseUrlSearch = markdownParseUrlSearchStrings[i];
        let markdownParseUrlSearchElement = document.getElementById(markdownParseUrlSearch + "-input");
        if (markdownParseUrlSearchElement.value) {
            markdownParseUrlSearchs.push(markdownParseUrlSearch + "=" + encodeURI(markdownParseUrlSearchElement.value));
        }
        
    }
    let markdownParseUrlSearchsString = markdownParseUrlSearchs.join("&");
    if (markdownParseUrlSearchsString) {
        markdownParseUrl += "?" + markdownParseUrlSearchsString;
    };
    return markdownParseUrl;
}

function changeMarkdownParseUrl() {
    let markdownParseUrl = generateMarkdownParseUrl();
    let markdownParseUrlElement = document.getElementById("markdown-parse-url");
    markdownParseUrlElement.href = markdownParseUrl;
    markdownParseUrlElement.textContent = markdownParseUrl;
}