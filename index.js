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

/**
 * Get the value of a specific query parameter from the URL.
 * 获取 URL 中指定参数的值。
 * @param {string} paramName - The name of the query parameter. 参数名称。
 * @return {string|null} The value of the query parameter, or null if not found. 参数值，如果没有找到则返回 null。
 */
function getQueryVariable(paramName) {
  paramName = decodeURIComponent(paramName);
  let queryString = window.location.search.substring(1); // 去掉开头的 '?'
  let paramPairs = queryString.split("&"); // 分割成键值对数组，如 ["name=John", "age=20"]
  
  for (let i = 0; i < paramPairs.length; i++) {
    let keyValue = paramPairs[i].split("="); // 分割单个键值对，如 ["name", "John"]
    let key = decodeURIComponent(keyValue[0]);
    let value = keyValue[1] || '';  // 获取 value，若不存在则返回空字符串

    if (key === paramName) {
      return decodeURIComponent(value);
    }
  }
  return null; // 未找到对应参数
}

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

let markdownParseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
// 替换默认显示的内容
let patternMarkdown = `
\`\`\`plaintext
https://xkk1.github.io/MarkdownViewer/?md=Markdown文件URL&title=标题&target=_self&icon=网页图标URL&theme=默认主题
\`\`\`
`
let replacementMarkdown = `
\`${markdownParseUrl}?md=\`<input id="md-input" type="text" placeholder="Markdown文件URL" size="25" />\`&title=\`<input id="title-input" type="text" placeholder="标题" size="14" />\`&target=\`<input id="target-input" type="text" placeholder="_self" size="8" />\`&icon=\`<input id="icon-input" type="text" placeholder="https://xkk1.github.io/favicon.ico" size="25" />\`&theme=\`<input id="theme-input" type="text" placeholder="auto" size="5" />

<button type="button" onclick="changeMarkdownParseUrl();">生成 URL</button> <a id="markdown-parse-url" href="#" target="_blank"></a>
`;

// 出错时显示的内容
let errorMarkdown = `# [错误]：获取 Markdown 失败

\`\`\`plaintext
{errorInfo}
\`\`\`

---

## 使用方法
` + replacementMarkdown;

function replaceMarkdownPaths(markdown, baseUrl = 'https://xkk1.github.io/MarkdownViewer/') {
  // 处理普通链接 [text](path)
  let result = markdown.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (match, text, path) => {
    if (shouldSkipConversion(path)) {
      return match;
    }
    return `[${text}](${buildFullUrl(baseUrl, path, text)})`;
  });

  // 处理图片链接 ![alt](path)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, path) => {
    if (shouldSkipConversion(path)) {
      return match;
    }
    return `![${alt}](${buildFullUrl(baseUrl, path, alt)})`;
  });

  // 处理引用链接 [ref]: path
  result = result.replace(/^\[([^\]]+)\]:\s*(\S+)/gm, (match, ref, path) => {
    if (shouldSkipConversion(path)) {
      return match;
    }
    return `[${ref}]: ${buildFullUrl(baseUrl, path, ref)}`;
  });

  // 处理尖括号 <path>
  result = result.replace(/<([^>\s]+)>/g, (match, path) => {
    if (!path.includes('.') || shouldSkipConversion(path)) {
      return match;
    }
    return `<${buildFullUrl(baseUrl, path)}>`;
  });

  return result;
}

// 修改判断逻辑：只跳过真正的外部链接，不跳过以/开头的路径
function shouldSkipConversion(path) {
  return /^(https?:)?\/\//.test(path) ||  // http://, https://, //
    /^[a-z]+:/.test(path) || // mailto:, tel:, etc.
    path.startsWith('#');    // 页面锚点
  // 移除了：path.startsWith('/') && !path.startsWith('//')
  // 这样以/开头的路径也会被替换
}

function buildFullUrl(baseUrl, relativePath, title = null) {
  let fullUrl = buildFullUrlNormal(baseUrl, relativePath);
  // 判断链接类型是 markdown 文件
  let clearRelativePath = relativePath.split('#')[0].split('?')[0];
  if (clearRelativePath.endsWith('.md')) {
    fullUrl = `${markdownParseUrl}?md=${encodeURIComponent(fullUrl)}`
    // 添加标题参数
    if (title) {
      fullUrl += `&title=${encodeURIComponent(title)}`;
    }
  }
  return fullUrl;
}

function buildFullUrlNormal(baseUrl, relativePath) {
  if (!baseUrl) return relativePath;
  if (baseUrl.startsWith('https://') || baseUrl.startsWith('http://')) {
    try {
      let url = new URL(relativePath, baseUrl);
      return url.toString();
    } catch (error) {}
  }
  let clearRelativePath = relativePath;
  if (relativePath.startsWith('/')) {
    return relativePath;
  } else if (clearRelativePath.startsWith('./')) {
    clearRelativePath = clearRelativePath.substring(2);
  }
  
  return baseUrl + clearRelativePath;
}

// 渲染前
function beforeRenderMarkdown(markdown) {
  let markdownURL = getQueryVariable("md") || "README.md";
  if (markdownURL === "README.md") {
    markdown = markdown.replace(patternMarkdown, replacementMarkdown);
  } else if (markdownURL.includes("/")) {
    let baseUrl = markdownURL.substring(0, markdownURL.lastIndexOf("/")) + "/";
    if (baseUrl.startsWith("//")) {
      baseUrl = window.location.protocol + baseUrl;
    }
    markdown = replaceMarkdownPaths(markdown, baseUrl);
  } else {
    markdown = replaceMarkdownPaths(markdown, "");
  }
  return markdown;
}

// 渲染完成后
function afterRenderMarkdown() {
  // 代码高亮、显示行号、添加按钮
  xkk1.highlightAll();
  // or
  // markdownElement.querySelectorAll('pre>code').forEach((el) => {
  //   xkk1.highlight(el);
  // });
}

// 渲染 Markdown
function renderMarkdown(markdown) {
  markdown = beforeRenderMarkdown(markdown);
  let markdownElement = document.getElementById("markdown");
  markdownElement.style.whiteSpace = 'initial';
  markdownElement.innerHTML = marked.parse(markdown);
  // 渲染完成后
  afterRenderMarkdown(markdownElement);
}

document.addEventListener('DOMContentLoaded', (event) => {
  let markdownURL = getQueryVariable("md") || "README.md";
  fetch(markdownURL)
    .then(response => response.text())
    .then(markdown => renderMarkdown(markdown))
    .catch(error => renderMarkdown(errorMarkdown.replace("{errorInfo}", error)));
});

// 生成 Markdown 解析显示 URL
function generateMarkdownParseUrl() {
  let markdownParseUrlSearchStrings = ["md", "title", "target", "icon", "theme"];
  // "https://xkk1.github.io/MarkdownViewer/";
  let markdownParseUrlSearchs = [];
  for (let i = 0; i < markdownParseUrlSearchStrings.length; i++) {
    let markdownParseUrlSearch = markdownParseUrlSearchStrings[i];
    let markdownParseUrlSearchElement = document.getElementById(markdownParseUrlSearch + "-input");
    if (markdownParseUrlSearchElement.value) {
      markdownParseUrlSearchs.push(markdownParseUrlSearch + "=" + encodeURIComponent(markdownParseUrlSearchElement.value));
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