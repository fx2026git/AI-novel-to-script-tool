/**
 * SceneForge 角色管理模块
 */
const Characters = (() => {
    let characters = [], editId = null;
    let formEl, nameInput, roleSelect, descInput, listEl;
    let onDataChange = null;

    function init(cb) { onDataChange = cb; cache(); loadCharacters(); bindEvents(); renderList(); }
    function cache() { formEl = document.getElementById('character-form'); nameInput = document.getElementById('char-name'); roleSelect = document.getElementById('char-role'); descInput = document.getElementById('char-desc'); listEl = document.getElementById('character-list'); }
    function loadCharacters() { try { characters = JSON.parse(Storage.load(Storage.KEYS.CHARACTERS, '[]')); } catch (e) { characters = []; } }
    function saveCharacters() { Storage.save(Storage.KEYS.CHARACTERS, JSON.stringify(characters)); if (onDataChange) onDataChange(); }
    function bindEvents() {
        document.getElementById('btn-add-character').addEventListener('click', () => { resetForm(); showForm(); });
        document.getElementById('btn-save-character').addEventListener('click', saveCharacter);
        document.getElementById('btn-cancel-character').addEventListener('click', hideForm);
        listEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.classList.contains('btn-edit')) editCharacter(b.dataset.id); else if (b.classList.contains('btn-delete')) deleteCharacter(b.dataset.id); });
    }
    function showForm() { formEl.classList.remove('hidden'); }
    function hideForm() { formEl.classList.add('hidden'); resetForm(); }
    function resetForm() { nameInput.value = ''; roleSelect.value = ''; descInput.value = ''; editId = null; }
    function saveCharacter() {
        const name = nameInput.value.trim(); if (!name) { alert('请输入角色名称'); return; }
        const c = { id: editId || Date.now().toString(36) + Math.random().toString(36).substr(2, 5), name, role: roleSelect.value, description: descInput.value.trim() };
        if (editId) { const i = characters.findIndex(ch => ch.id === editId); if (i !== -1) characters[i] = c; } else { characters.push(c); }
        saveCharacters(); hideForm(); renderList();
    }
    function editCharacter(id) { const c = characters.find(ch => ch.id === id); if (!c) return; editId = c.id; nameInput.value = c.name; roleSelect.value = c.role; descInput.value = c.description; showForm(); }
    function deleteCharacter(id) { if (!confirm('确定要删除该角色吗？')) return; characters = characters.filter(c => c.id !== id); saveCharacters(); renderList(); }
    function renderList() {
        if (characters.length === 0) { listEl.innerHTML = '<p class="empty-hint">暂无角色，点击上方按钮添加</p>'; return; }
        const labels = { protagonist: '主角', antagonist: '反派', supporting: '配角', minor: '次要角色' };
        listEl.innerHTML = characters.map(c => `<div class="character-card" data-id="${c.id}"><div class="character-info"><span class="character-name">${esc(c.name)}</span>${c.role ? `<span class="character-role tag">${labels[c.role] || c.role}</span>` : ''}${c.description ? `<p class="character-desc">${esc(c.description)}</p>` : ''}</div><div class="character-actions"><button class="btn-icon btn-edit" data-id="${c.id}" title="编辑">&#9998;</button><button class="btn-icon btn-delete" data-id="${c.id}" title="删除">&#10005;</button></div></div>`).join('');
    }
    function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
    function getAll() { return [...characters]; }
    function getById(id) { return characters.find(c => c.id === id) || null; }
    return { init, getAll, getById, renderList };
})();
