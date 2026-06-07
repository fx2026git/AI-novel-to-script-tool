/**
 * SceneForge 场景管理模块
 */
const Scenes = (() => {
    let scenes = [], editId = null;
    let formEl, titleInput, summaryInput, locationInput, timeInput, charCheckboxes, listEl;
    let onDataChange = null;

    function init(cb) { onDataChange = cb; cache(); loadScenes(); bindEvents(); renderList(); }
    function cache() { formEl = document.getElementById('scene-form'); titleInput = document.getElementById('scene-title'); summaryInput = document.getElementById('scene-summary'); locationInput = document.getElementById('scene-location'); timeInput = document.getElementById('scene-time'); charCheckboxes = document.getElementById('scene-characters'); listEl = document.getElementById('scene-list'); }
    function loadScenes() { try { scenes = JSON.parse(Storage.load(Storage.KEYS.SCENES, '[]')); } catch (e) { scenes = []; } }
    function saveScenes() { Storage.save(Storage.KEYS.SCENES, JSON.stringify(scenes)); if (onDataChange) onDataChange(); }
    function bindEvents() {
        document.getElementById('btn-add-scene').addEventListener('click', () => { resetForm(); populateCheckboxes(); showForm(); });
        document.getElementById('btn-save-scene').addEventListener('click', saveScene);
        document.getElementById('btn-cancel-scene').addEventListener('click', hideForm);
        listEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.classList.contains('btn-edit')) editScene(b.dataset.id); else if (b.classList.contains('btn-delete')) deleteScene(b.dataset.id); });
    }
    function populateCheckboxes(checkedIds = []) {
        const chars = Characters.getAll();
        charCheckboxes.innerHTML = chars.length === 0 ? '<p class="empty-hint" style="padding:8px">暂无角色，请先在角色面板创建</p>' : chars.map(c => `<label class="checkbox-label"><input type="checkbox" value="${c.id}" ${checkedIds.includes(c.id) ? 'checked' : ''}><span>${esc(c.name)}</span></label>`).join('');
    }
    function showForm() { formEl.classList.remove('hidden'); }
    function hideForm() { formEl.classList.add('hidden'); resetForm(); }
    function resetForm() { titleInput.value = ''; summaryInput.value = ''; locationInput.value = ''; timeInput.value = ''; editId = null; }
    function saveScene() {
        const title = titleInput.value.trim(); if (!title) { alert('请输入场景标题'); return; }
        const checkedIds = Array.from(charCheckboxes.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        const s = { id: editId || Date.now().toString(36) + Math.random().toString(36).substr(2, 5), title, summary: summaryInput.value.trim(), location: locationInput.value.trim(), time: timeInput.value.trim(), characterIds: checkedIds, order: editId ? scenes.find(sc => sc.id === editId)?.order ?? scenes.length : scenes.length, act: editId ? scenes.find(sc => sc.id === editId)?.act || '1' : '1' };
        if (editId) { const i = scenes.findIndex(sc => sc.id === editId); if (i !== -1) scenes[i] = s; } else { scenes.push(s); }
        saveScenes(); hideForm(); renderList();
    }
    function editScene(id) { const s = scenes.find(sc => sc.id === id); if (!s) return; editId = s.id; titleInput.value = s.title; summaryInput.value = s.summary; locationInput.value = s.location; timeInput.value = s.time; populateCheckboxes(s.characterIds); showForm(); }
    function deleteScene(id) { if (!confirm('确定要删除该场景吗？')) return; scenes = scenes.filter(s => s.id !== id); saveScenes(); renderList(); }
    function renderList() {
        if (scenes.length === 0) { listEl.innerHTML = '<p class="empty-hint">暂无场景，点击上方按钮添加</p>'; return; }
        const sorted = [...scenes].sort((a, b) => a.order - b.order);
        listEl.innerHTML = sorted.map((s, i) => {
            const names = s.characterIds.map(cid => Characters.getById(cid)).filter(Boolean).map(c => c.name);
            return `<div class="scene-card" data-id="${s.id}"><div class="scene-card-header"><span class="scene-order">#${i + 1}</span><span class="scene-title-text">${esc(s.title)}</span></div>${s.summary ? `<p class="scene-summary">${esc(s.summary)}</p>` : ''}<div class="scene-meta">${s.location ? `<span class="scene-meta-item">📍 ${esc(s.location)}</span>` : ''}${s.time ? `<span class="scene-meta-item">🕐 ${esc(s.time)}</span>` : ''}${names.length > 0 ? `<span class="scene-meta-item">👤 ${names.join(', ')}</span>` : ''}</div><div class="scene-actions"><button class="btn-icon btn-edit" data-id="${s.id}" title="编辑">&#9998;</button><button class="btn-icon btn-delete" data-id="${s.id}" title="删除">&#10005;</button></div></div>`;
        }).join('');
    }
    function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
    function getAll() { return [...scenes].sort((a, b) => a.order - b.order); }
    function getById(id) { return scenes.find(s => s.id === id) || null; }
    return { init, getAll, getById, renderList };
})();
