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

import  { marked }  from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import xkk1 from './libs/xkk1/xkk1.js';

const currentURL = window.location.href;
const currentURLParams = new URLSearchParams(window.location.search);

// Markdown URL
const markdownURL = currentURLParams.get("md") || "README.md";

// 修改标题
document.title = currentURLParams.get("title") || document.title;

// 设置超链接默认打开方式 
const target = currentURLParams.get("target") || "_self";
const baseElement = document.createElement("base");
baseElement.setAttribute("target", target);
document.head.appendChild(baseElement);

// 设置网页图标
const icon = currentURLParams.get("icon");
if (icon) {
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = icon;
  document.head.appendChild(link);
}

// 设置默认主题
let theme = currentURLParams.get("theme");
if (theme && localStorage.getItem("theme") === null) {
  localStorage.setItem("theme", theme);
}

const markdownParseURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
// 替换默认显示的内容
const patternMarkdown = `
\`\`\`plaintext
https://xkk1.github.io/web-markdown-viewer/?md=Markdown文件URL&title=标题&target=_self&icon=网页图标URL&theme=默认主题
\`\`\`
`
const replacementMarkdown = `
<div onkeyup="changeMarkdownParseURL();">
${markdownParseURL}?md=<input id="md-input" type="text" placeholder="Markdown文件URL" size="25" />&title=<input id="title-input" type="text" placeholder="标题" size="14" />&target=<input id="target-input" type="text" placeholder="_self" size="8" />&icon=<input id="icon-input" type="text" placeholder="https://xkk1.github.io/favicon.ico" size="25" />&theme=<input id="theme-input" type="text" placeholder="auto" size="5" />

<button type="button" onclick="changeMarkdownParseURL();">生成 URL</button> <a id="markdown-parse-url" href="#" target="_blank"></a>
</div>
`;

// 出错时显示的内容
const errorMarkdown = `# [错误]：获取 Markdown 失败

\`\`\`plaintext
{errorInfo}
\`\`\`

---

## 使用方法
` + replacementMarkdown;

// 配置 marked
marked.use(gfmHeadingId());
// 初始化右侧按钮
xkk1.initNavRightButtons(new URL('./libs/xkk1/img/svg-icons.svg', import.meta.url).href);

/*
 * 智能替换URL路径
 */
function replaceMarkdownURL(markdownElement) {
  const markdownURLObject = new URL(markdownURL, currentURL);
  // 获取所有需要处理的标签
  const links = markdownElement.querySelectorAll('*[href], *[src]');
  links.forEach(element => {
    // 处理 href 属性
    if (element.hasAttribute('href')) {
      processReplaceMarkdownURLAttribute(element, 'href');
    }

    // 处理 src 属性
    if (element.hasAttribute('src')) {
      processReplaceMarkdownURLAttribute(element, 'src');
    }
  });

  function processReplaceMarkdownURLAttribute(element, attributeName) {
    let url = element.getAttribute(attributeName);

    // 跳过空值和页面锚点
    if (
      !url                       // 空
      || url.startsWith('#')     // 页面锚点
      || /^[a-z]+:/.test(url)    // mailto:, tel:, etc.
    ) {
      return;
    }
    let absluteURLObject = new URL(url, markdownURLObject);
    let absluteURL = absluteURLObject.href;
    let newURL = "";
    if (element[attributeName] !== absluteURL) {
      newURL = absluteURL;
    }

    let absluteURLPathname = absluteURLObject.pathname;
    if (absluteURLPathname.endsWith('.md') || absluteURLPathname.endsWith('.markdown')) {
      const mdParams = new URLSearchParams(currentURLParams);
      mdParams.delete("title");
      for (const [key, value] of absluteURLObject.searchParams) {
        mdParams.set(key, value);
      }
      mdParams.set("md", absluteURLObject.protocol + "//" + absluteURLObject.host + absluteURLObject.pathname);
      if (!mdParams.has('title') && element.tagName === 'A') {
        mdParams.set('title', element.textContent);
      }
      newURL = `${markdownParseURL}?${mdParams.toString()}`;
    }

    if (newURL) {
      element.setAttribute(attributeName, newURL);
    }
  }
}

// 渲染前
function beforeRenderMarkdown(markdown) {
  if (markdownURL === "README.md") {
    markdown = markdown.replace(patternMarkdown, replacementMarkdown);
  }
  return markdown;
}

// 渲染完成后
function afterRenderMarkdown(markdownElement) {
  replaceMarkdownURL(markdownElement);
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
function generateMarkdownParseURL() {
  // const markdownParseURL = "https://xkk1.github.io/web-markdown-viewer/";
  const searchParams = new URLSearchParams();

  const keys = ["md", "title", "target", "icon", "theme"];
  for (const key of keys) {
    const inputElement = document.getElementById(`${key}-input`);
    if (inputElement?.value) {
      searchParams.append(key, inputElement.value);
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${markdownParseURL}?${queryString}` : markdownParseURL;
}

function changeMarkdownParseURL() {
  let markdownParseURL = generateMarkdownParseURL();
  let markdownParseURLElement = document.getElementById("markdown-parse-url");
  markdownParseURLElement.href = markdownParseURL;
  markdownParseURLElement.textContent = decodeURIComponent(markdownParseURL);
}
window.changeMarkdownParseURL = changeMarkdownParseURL;

fetch(markdownURL)
  .then(response => response.text())
  .then(markdown => renderMarkdown(markdown))
  .catch(error => renderMarkdown(errorMarkdown.replace("{errorInfo}", error)));
