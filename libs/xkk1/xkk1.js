/*
xkk1 Theme core js
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

const xkk1 = function () {
};

/**
 * 复制文字 使用旧 API
 * 
 * @param {string} text 要复制的文字
 */
xkk1.copyToClipboardOld = function (text) {
    var dummy = document.createElement("textarea");
    // to avoid breaking orgain page when copying more words  
    // cant copy when adding below this code  
    // dummy.style.display = 'none'  
    document.body.appendChild(dummy);
    // Be careful if you use textarea. It uses html encoding instead of utf8.  
    // So if your text is in utf8 you might want to change it to be compatible with textarea.  
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

/**
 * 复制文字 Clipboard API，失败调用 xkk1.copyToClipboardOld
 * 
 * @param {string} text 要复制的文字
 */
xkk1.copyToClipboard = function (text) {
    // 判断 Clipboard API 是否可用
    if (!navigator.clipboard) {
        copyToClipboardOld(text);
        return;
    }
    // 使用 Clipboard API 复制文本  
    navigator.clipboard.writeText(text).then(function () {
        console.log('复制到剪贴板成功！');
    }, function (err) {
        console.error('无法复制文本: ', err);

        // 如果 Clipboard API 失败，使用 document.execCommand("copy")  
        copyToClipboardOld(text);
    });
}

/**
 * 代码高亮
 */
xkk1.highlight = function () {
    // 代码高亮
    document.querySelectorAll('pre>code').forEach((el) => {
        // 计算行号
        let line_split = el.innerText.split('\n');
        let line_num = line_split[line_split.length - 1] ? line_split.length : line_split.length - 1;
        // 高亮代码
        hljs.highlightElement(el);
        // 渲染行号
        let line_num_ul = document.createElement('ol');
        line_num_ul.classList.add('line-num');
        line_num_ul.innerHTML = `<li>${Array(line_num).fill(0).map((_, i) => i + 1).join('</li><li>')}<li>`;
        el.parentElement.appendChild(line_num_ul);
        el.parentElement.classList.add('show-line-num');

        // 鼠标悬浮工具 - [语言 全屏 复制]
        let tool_box = document.createElement('div');
        // 语言
        tool_box.classList.add('tool-box');
        let languageArray = [];
        for (let i = 0; i < el.classList.length; i++) {
            if (el.classList[i].indexOf('language-') !== -1) {
                languageArray.push(el.classList[i].replace('language-', '').toUpperCase());
            }
        }
        let languageBox = document.createElement('div');
        languageBox.classList.add('language');
        languageBox.innerText = languageArray.join(' ');
        languageBox.addEventListener('click', function (e) {
            xkk1.copyToClipboard(languageBox.textContent);
            languageBox.classList.add('copy-success');
            setTimeout(function () {
                languageBox.classList.remove('copy-success');
            }, 1000);
            e.stopPropagation();
        });
        tool_box.appendChild(languageBox);
        // 全屏
        let full_screen = document.createElement('div');
        full_screen.classList.add('full-screen');
        full_screen.innerText = '全屏';
        full_screen.addEventListener('click', function () {
            if (document.fullscreenElement) {
                el.parentElement.classList.remove('full-screen');
                document.exitFullscreen();
            } else {
                el.parentElement.classList.add('full-screen');
                el.parentElement.requestFullscreen();
            }
        });
        tool_box.appendChild(full_screen);
        // 复制
        let copy_btn = document.createElement('div');
        copy_btn.classList.add('copy-btn');
        copy_btn.innerText = '复制';
        copy_btn.addEventListener('click', function (e) {
            xkk1.copyToClipboard(el.textContent);
            copy_btn.classList.add('copy-success');
            setTimeout(function () {
                copy_btn.classList.remove('copy-success');
            }, 1000);
            e.stopPropagation();
        });
        tool_box.appendChild(copy_btn);

        el.parentElement.appendChild(tool_box);
        el.parentElement.addEventListener('mouseover', function () {
            tool_box.classList.add('show-tool-box');
        })
        el.parentElement.addEventListener('mouseout', function () {
            tool_box.classList.remove('show-tool-box');
        })

    });

};

/**
 * 侧栏按钮容器默认 HTML 内容
 */
xkk1.navRightButtonDivInnerHTML = `
<svg>
    <use></use>
</svg>
`;

/**
 * 初始化回到顶部按钮
 * 
 * @param {string} xkk1IconPath xkk1 主题图标路径
 */
xkk1.initBackToTopButton = function (xkk1IconPath) {
    xkk1IconPath = xkk1IconPath || 'img/svg-icons.svg';
    document.addEventListener('DOMContentLoaded', () => {
        let backToTopButtonElement = document.getElementById("back-to-top-button");
        if (backToTopButtonElement) {
            backToTopButtonElement.style.display = "none";
            backToTopButtonElement.innerHTML = xkk1.navRightButtonDivInnerHTML;
            let backToTopButtonElementSvgUseElement = document.querySelector("#back-to-top-button>svg>use");
            backToTopButtonElementSvgUseElement.setAttribute("href", xkk1IconPath + "#back-to-top-icon");
            backToTopButtonElement.setAttribute("title", "回到顶部");
            backToTopButtonElement.addEventListener("click", function () {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth' // 平滑滚动效果
                });
            });
            window.addEventListener("scroll", function () {
                if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                    backToTopButtonElement.style.display = "block";
                } else {
                    backToTopButtonElement.style.display = "none";
                }
            });
        }
    });
};


/**
 * 初始化深浅主题切换按钮
 * 
 * @param {string} xkk1IconPath xkk1 主题图标路径，默认img/svg-icons.svg
 * @param {string} defaultTheme 默认主题 auto(默认) | light | dark
 * @param {string} fallbackTheme 浏览器不支持获取主题时 auto 使用的主题 light(默认) | dark
 */
xkk1.initThemeToggleButton = function (xkk1IconPath = "img/svg-icons.svg", defaultTheme = "auto", fallbackTheme = "light") {
    document.addEventListener('DOMContentLoaded', () => {
        let themeToggleButtonElement = document.getElementById("theme-toggle-button");
        if (themeToggleButtonElement) {
            themeToggleButtonElement.innerHTML = xkk1.navRightButtonDivInnerHTML;
            themeToggleButtonElement.setAttribute("title", "切换深浅主题");
            let themeToggleButtonSvgUseElement = document.querySelector("#theme-toggle-button>svg>use");
            themeToggleButtonSvgUseElement.setAttribute("href", xkk1IconPath + "#theme-toggle-icon");

            // 获取上次设置的主题 auto | light | dark
            function getSettingAsThemeString() {
                const localStorageTheme = localStorage.getItem("theme");

                if (localStorageTheme !== null) {
                    return localStorageTheme;
                } else {
                    return defaultTheme;
                }
            }

            // 计算主题 dark | light
            function calculateSettingAsThemeDarkLightString(themeString) {
                if (themeString === "auto") {
                    const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");

                    if (systemSettingDark.matches) {
                        return "dark";
                    }
                    const systemSettingLight = window.matchMedia("(prefers-color-scheme: light)");

                    if (systemSettingLight.matches) {
                        return "light";
                    }
                    return fallbackTheme;
                } else {
                    return themeString;
                }
            }

            // 实时监测系统主题
            const themeMedia = window.matchMedia("(prefers-color-scheme: light)");
            themeMedia.addListener(e => {
                if (getSettingAsThemeString() === "auto") {
                    if (e.matches) {
                        document.querySelector("html").setAttribute("data-theme", "light");
                    } else {
                        document.querySelector("html").setAttribute("data-theme", "dark");
                    }
                }
            });

            const themes = ["auto", "dark", "light"];
            let themeString = getSettingAsThemeString();
            let themeDarkLightString = calculateSettingAsThemeDarkLightString(themeString);

            document.querySelector("html").setAttribute("data-theme", themeDarkLightString);
            // 设置切换按钮
            themeToggleButtonSvgUseElement.setAttribute("href", xkk1IconPath + "#" + themeString + "-icon");
            themeToggleButtonElement.setAttribute("title", themeString + " theme");

            themeToggleButtonElement.addEventListener("click", () => {
                let newTheme = themes[(themes.indexOf(themeToggleButtonSvgUseElement.getAttribute("href").slice(xkk1IconPath.length + 1, -5)) + 1) % themes.length];
                let newThemeDarkLightString = calculateSettingAsThemeDarkLightString(newTheme);
                // alert(newTheme);
                document.querySelector("html").setAttribute("data-theme", newThemeDarkLightString);
                themeToggleButtonSvgUseElement.setAttribute("href", xkk1IconPath + "#" + newTheme + "-icon");
                themeToggleButtonElement.setAttribute("title", newTheme + " theme");

                // update in local storage
                localStorage.setItem("theme", newTheme);
            });
        }
    });
};

/**
 * 初始化右侧按钮（深浅主题切换、回到顶部）
 * 
 * @param {string} xkk1IconPath xkk1 主题图标路径，默认img/svg-icons.svg
 */
xkk1.initNavRightButtons = function (xkk1IconPath = "img/svg-icons.svg") {
    // 初始化回到顶部按钮
    xkk1.initBackToTopButton(xkk1IconPath);
    // 初始化深浅主题切换按钮
    xkk1.initThemeToggleButton(xkk1IconPath);
};