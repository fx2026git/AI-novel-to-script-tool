/**
 * SceneForge 主应用模块
 * 负责剧本编辑器的基础功能：标题/内容编辑与自动保存
 */

const App = (() => {
    // DOM 元素缓存
    let titleInput;
    let contentEditor;
    let saveStatusEl;
    let wordCountEl;

    // 自动保存定时器
    let autoSaveTimer = null;
    const AUTO_SAVE_DELAY = 1500; // 1.5秒防抖

    /**
     * 初始化应用
     */
    function init() {
        cacheDomElements();
        loadSavedData();
        bindEvents();
        updateWordCount();
    }

    /**
     * 缓存 DOM 元素引用
     */
    function cacheDomElements() {
        titleInput = document.getElementById('screenplay-title');
        contentEditor = document.getElementById('screenplay-content');
        saveStatusEl = document.getElementById('save-status');
        wordCountEl = document.getElementById('word-count');
    }

    /**
     * 加载已保存的数据
     */
    function loadSavedData() {
        const savedTitle = Storage.load(Storage.KEYS.SCREENPLAY_TITLE);
        const savedContent = Storage.load(Storage.KEYS.SCREENPLAY_CONTENT);

        if (savedTitle) {
            titleInput.value = savedTitle;
        }
        if (savedContent) {
            contentEditor.value = savedContent;
        }
    }

    /**
     * 绑定事件监听
     */
    function bindEvents() {
        titleInput.addEventListener('input', () => {
            scheduleAutoSave();
            updateWordCount();
        });

        contentEditor.addEventListener('input', () => {
            scheduleAutoSave();
            updateWordCount();
        });

        // 页面关闭前确保保存
        window.addEventListener('beforeunload', () => {
            saveNow();
        });
    }

    /**
     * 调度自动保存（防抖处理）
     */
    function scheduleAutoSave() {
        clearTimeout(autoSaveTimer);
        setSavingStatus(true);
        autoSaveTimer = setTimeout(() => {
            saveNow();
        }, AUTO_SAVE_DELAY);
    }

    /**
     * 立即保存
     */
    function saveNow() {
        const titleSaved = Storage.save(Storage.KEYS.SCREENPLAY_TITLE, titleInput.value);
        const contentSaved = Storage.save(Storage.KEYS.SCREENPLAY_CONTENT, contentEditor.value);

        if (titleSaved && contentSaved) {
            setSavingStatus(false);
        }
    }

    /**
     * 更新保存状态显示
     * @param {boolean} isSaving - 是否正在保存中
     */
    function setSavingStatus(isSaving) {
        if (isSaving) {
            saveStatusEl.textContent = '保存中...';
            saveStatusEl.classList.add('saving');
        } else {
            saveStatusEl.textContent = '已保存';
            saveStatusEl.classList.remove('saving');
        }
    }

    /**
     * 更新字数统计
     */
    function updateWordCount() {
        const content = contentEditor.value.trim();
        const charCount = content.length;
        // 中文字数：去掉空格后计算
        const textWithoutSpaces = content.replace(/\s/g, '');
        wordCountEl.textContent = `字符: ${charCount}`;
    }

    return { init };
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
