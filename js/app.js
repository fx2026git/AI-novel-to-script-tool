/**
 * SceneForge 主应用模块
 */

const App = (() => {
    let titleInput, contentEditor, saveStatusEl, wordCountEl;
    let autoSaveTimer = null;
    const AUTO_SAVE_DELAY = 1500;

    function init() {
        cacheDomElements();
        loadSavedData();
        bindEvents();
        updateWordCount();

        Characters.init(() => { scheduleAutoSave(); });
        Scenes.init(() => { scheduleAutoSave(); });
        Timeline.init(() => { scheduleAutoSave(); });
    }

    function cacheDomElements() {
        titleInput = document.getElementById('screenplay-title');
        contentEditor = document.getElementById('screenplay-content');
        saveStatusEl = document.getElementById('save-status');
        wordCountEl = document.getElementById('word-count');
    }

    function loadSavedData() {
        const savedTitle = Storage.load(Storage.KEYS.SCREENPLAY_TITLE);
        const savedContent = Storage.load(Storage.KEYS.SCREENPLAY_CONTENT);
        if (savedTitle) titleInput.value = savedTitle;
        if (savedContent) contentEditor.value = savedContent;
    }

    function bindEvents() {
        titleInput.addEventListener('input', () => { scheduleAutoSave(); updateWordCount(); });
        contentEditor.addEventListener('input', () => { scheduleAutoSave(); updateWordCount(); });
        window.addEventListener('beforeunload', () => { saveNow(); });

        document.querySelectorAll('.panel-tab:not([disabled])').forEach(tab => {
            tab.addEventListener('click', () => {
                const panelName = tab.dataset.panel;
                switchPanel(panelName);
                if (panelName === 'timeline') {
                    Timeline.render();
                }
            });
        });

        // 时间线刷新按钮
        const refreshBtn = document.getElementById('btn-refresh-timeline');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => { Timeline.render(); });
        }
    }

    function switchPanel(name) {
        document.querySelectorAll('.panel-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.panel === name);
        });
        document.querySelectorAll('.panel-page').forEach(p => {
            p.classList.toggle('active', p.id === `panel-${name}`);
        });
    }

    function scheduleAutoSave() {
        clearTimeout(autoSaveTimer);
        setSavingStatus(true);
        autoSaveTimer = setTimeout(() => { saveNow(); }, AUTO_SAVE_DELAY);
    }

    function saveNow() {
        const titleSaved = Storage.save(Storage.KEYS.SCREENPLAY_TITLE, titleInput.value);
        const contentSaved = Storage.save(Storage.KEYS.SCREENPLAY_CONTENT, contentEditor.value);
        if (titleSaved && contentSaved) { setSavingStatus(false); }
    }

    function setSavingStatus(isSaving) {
        if (isSaving) {
            saveStatusEl.textContent = '保存中...';
            saveStatusEl.classList.add('saving');
        } else {
            saveStatusEl.textContent = '已保存';
            saveStatusEl.classList.remove('saving');
        }
    }

    function updateWordCount() {
        wordCountEl.textContent = `字符: ${contentEditor.value.trim().length}`;
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => { App.init(); });
