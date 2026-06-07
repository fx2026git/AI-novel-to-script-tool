/**
 * SceneForge 存储模块
 * 使用 localStorage 实现数据持久化
 */

const Storage = (() => {
    const KEYS = {
        SCREENPLAY_TITLE: 'sceneforge_title',
        SCREENPLAY_CONTENT: 'sceneforge_content',
    };

    /**
     * 保存数据到 localStorage
     * @param {string} key - 存储键
     * @param {string} value - 存储值
     */
    function save(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    }

    /**
     * 从 localStorage 读取数据
     * @param {string} key - 存储键
     * @param {string} defaultValue - 默认值
     * @returns {string}
     */
    function load(key, defaultValue = '') {
        try {
            const value = localStorage.getItem(key);
            return value !== null ? value : defaultValue;
        } catch (e) {
            console.error('Storage load error:', e);
            return defaultValue;
        }
    }

    /**
     * 清除所有剧本数据
     */
    function clearAll() {
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    }

    return { KEYS, save, load, clearAll };
})();
