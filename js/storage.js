/**
 * SceneForge 存储模块
 * 使用 localStorage 实现数据持久化
 */

const Storage = (() => {
    const KEYS = {
        SCREENPLAY_TITLE: 'sceneforge_title',
        SCREENPLAY_CONTENT: 'sceneforge_content',
        CHARACTERS: 'sceneforge_characters',
        SCENES: 'sceneforge_scenes',
    };

    function save(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    }

    function load(key, defaultValue = '') {
        try {
            const value = localStorage.getItem(key);
            return value !== null ? value : defaultValue;
        } catch (e) {
            console.error('Storage load error:', e);
            return defaultValue;
        }
    }

    function clearAll() {
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    }

    return { KEYS, save, load, clearAll };
})();
