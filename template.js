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

let markdownElement = document.getElementById("markdown");
markdownElement.style.whiteSpace = 'initial';

// 初始化右侧按钮
xkk1.initNavRightButtons(`${relativePath}/libs/xkk1/img/svg-icons.svg`);

/*
 * 智能替换URL路径 .md / .markdown -> .html
 */
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
  let newURL = url.replace(/\.(md|markdown)(\?.*|#.*)?$/, '.html$2');
  if (url === newURL) {
    return;
  }
  
  let absluteURLObject = new URL(newURL, currentURL);
  let absluteURL = absluteURLObject.href;
  const mdParams = new URLSearchParams(currentURLParams);
  mdParams.delete("title");
  for (const [key, value] of absluteURLObject.searchParams) {
    mdParams.set(key, value);
  }
  if (!mdParams.has('title') && element.tagName === 'A') {
    mdParams.set('title', element.textContent);
  }
  newURL = absluteURLObject.origin + absluteURLObject.pathname + '?' + mdParams.toString();
  if (absluteURLObject.hash) {
    newURL += absluteURLObject.hash;
  }
  
  element.setAttribute(attributeName, newURL);
}

// 代码高亮、显示行号、添加按钮
xkk1.highlightAll();
// or
// markdownElement.querySelectorAll('pre>code').forEach((el) => {
//   xkk1.highlight(el);
// });
