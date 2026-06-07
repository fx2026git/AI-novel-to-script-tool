/**
 * SceneForge 存储模块
 */
const Storage = (() => {
    const KEYS = {
        SCREENPLAY_TITLE: 'sceneforge_title',
        SCREENPLAY_CONTENT: 'sceneforge_content',
        CHARACTERS: 'sceneforge_characters',
        SCENES: 'sceneforge_scenes',
    };
    function save(key, value) { try { localStorage.setItem(key, value); return true; } catch (e) { console.error(e); return false; } }
    function load(key, def = '') { try { const v = localStorage.getItem(key); return v !== null ? v : def; } catch (e) { return def; } }
    function clearAll() { Object.values(KEYS).forEach(k => localStorage.removeItem(k)); }
    return { KEYS, save, load, clearAll };
})();
