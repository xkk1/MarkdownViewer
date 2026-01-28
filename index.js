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

const currentUrl = window.location.href;
const params = new URLSearchParams(window.location.search);

/**
 * Get the value of a specific query parameter from the URL.
 * 获取 URL 中指定参数的值。
 * @param {string} paramName - The name of the query parameter. 参数名称。
 * @return {string|null} The value of the query parameter, or null if not found. 参数值，如果没有找到则返回 null。
 */
function getQueryVariable(paramName) {
  return params.get(paramName); // 自动处理解码，若不存在则返回 null
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
<div onkeyup="changeMarkdownParseUrl();">
${markdownParseUrl}?md=<input id="md-input" type="text" placeholder="Markdown文件URL" size="25" />&title=<input id="title-input" type="text" placeholder="标题" size="14" />&target=<input id="target-input" type="text" placeholder="_self" size="8" />&icon=<input id="icon-input" type="text" placeholder="https://xkk1.github.io/favicon.ico" size="25" />&theme=<input id="theme-input" type="text" placeholder="auto" size="5" />

<button type="button" onclick="changeMarkdownParseUrl();">生成 URL</button> <a id="markdown-parse-url" href="#" target="_blank"></a>
</div>
`;

// 出错时显示的内容
let errorMarkdown = `# [错误]：获取 Markdown 失败

\`\`\`plaintext
{errorInfo}
\`\`\`

---

## 使用方法
` + replacementMarkdown;

/*
 * 智能替换URL路径
 */
function replaceMarkdownUrl(markdownElement) {
  let markdownURL = new URL(getQueryVariable("md") || "README.md", currentUrl);
  // 获取所有需要处理的标签
  const links = markdownElement.querySelectorAll('a[href], img[src], script[src], iframe[src]');
  links.forEach(el => {
    let attrName = el.tagName === 'A' || el.tagName === 'AREA' ? 'href' : 'src';
    let url = el.getAttribute(attrName);

    // 跳过空值和外部链接
    if (
      !url                       // 空
      || url.startsWith('http')  // http:, https:
      || url.startsWith('//')    // //
      || url.startsWith('#')     // 页面锚点
      || /^[a-z]+:/.test(url)    // mailto:, tel:, etc.
      ) {
        return;
    }
    let absluteUrl = new URL(url, markdownURL).href;
    if (el[attrName] !== absluteUrl) {
      // 设置绝对路径替换原本错误的相对路径
      el.setAttribute(attrName, absluteUrl);
    }
  });
}

// 渲染前
function beforeRenderMarkdown(markdown) {
  let markdownURL = getQueryVariable("md") || "README.md";
  if (markdownURL === "README.md") {
    markdown = markdown.replace(patternMarkdown, replacementMarkdown);
  }
  return markdown;
}

// 渲染完成后
function afterRenderMarkdown(markdownElement) {
  replaceMarkdownUrl(markdownElement);
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
    return markdownParseUrl + "?" + markdownParseUrlSearchsString;
  };
  return markdownParseUrl;
}

function changeMarkdownParseUrl() {
  let markdownParseUrl = generateMarkdownParseUrl();
  let markdownParseUrlElement = document.getElementById("markdown-parse-url");
  markdownParseUrlElement.href = markdownParseUrl;
  markdownParseUrlElement.textContent = markdownParseUrl;
}

document.addEventListener('DOMContentLoaded', (event) => {
  let markdownURL = getQueryVariable("md") || "README.md";
  fetch(markdownURL)
    .then(response => response.text())
    .then(markdown => renderMarkdown(markdown))
    .catch(error => renderMarkdown(errorMarkdown.replace("{errorInfo}", error)));
});
