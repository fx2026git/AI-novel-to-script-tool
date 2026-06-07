/**
 * SceneForge 场景管理模块
 * 负责场景的增删改查以及与角色的关联
 */

const Scenes = (() => {
    let scenes = [];
    let editId = null;

    let formEl, titleInput, summaryInput, locationInput, timeInput, charCheckboxes;
    let listEl;
    let onDataChange = null;

    function init(changeCallback) {
        onDataChange = changeCallback;
        cacheDomElements();
        loadScenes();
        bindEvents();
        renderList();
    }

    function cacheDomElements() {
        formEl = document.getElementById('scene-form');
        titleInput = document.getElementById('scene-title');
        summaryInput = document.getElementById('scene-summary');
        locationInput = document.getElementById('scene-location');
        timeInput = document.getElementById('scene-time');
        charCheckboxes = document.getElementById('scene-characters');
        listEl = document.getElementById('scene-list');
    }

    function loadScenes() {
        const data = Storage.load(Storage.KEYS.SCENES, '[]');
        try {
            scenes = JSON.parse(data);
        } catch (e) {
            scenes = [];
        }
    }

    function saveScenes() {
        Storage.save(Storage.KEYS.SCENES, JSON.stringify(scenes));
        if (onDataChange) onDataChange();
    }

    function bindEvents() {
        document.getElementById('btn-add-scene').addEventListener('click', () => {
            resetForm();
            populateCharacterCheckboxes();
            showForm();
        });

        document.getElementById('btn-save-scene').addEventListener('click', saveScene);
        document.getElementById('btn-cancel-scene').addEventListener('click', hideForm);

        listEl.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;

            if (btn.classList.contains('btn-edit')) {
                editScene(id);
            } else if (btn.classList.contains('btn-delete')) {
                deleteScene(id);
            }
        });
    }

    function populateCharacterCheckboxes(checkedIds = []) {
        const characters = Characters.getAll();
        charCheckboxes.innerHTML = characters.length === 0
            ? '<p class="empty-hint" style="padding:8px">暂无角色，请先在角色面板创建</p>'
            : characters.map(c => `
                <label class="checkbox-label">
                    <input type="checkbox" value="${c.id}" ${checkedIds.includes(c.id) ? 'checked' : ''}>
                    <span>${escapeHtml(c.name)}</span>
                </label>
            `).join('');
    }

    function showForm() {
        formEl.classList.remove('hidden');
    }

    function hideForm() {
        formEl.classList.add('hidden');
        resetForm();
    }

    function resetForm() {
        titleInput.value = '';
        summaryInput.value = '';
        locationInput.value = '';
        timeInput.value = '';
        editId = null;
    }

    function saveScene() {
        const title = titleInput.value.trim();
        if (!title) {
            alert('请输入场景标题');
            return;
        }

        const checkedIds = Array.from(
            charCheckboxes.querySelectorAll('input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        const scene = {
            id: editId || Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            title: title,
            summary: summaryInput.value.trim(),
            location: locationInput.value.trim(),
            time: timeInput.value.trim(),
            characterIds: checkedIds,
            order: editId
                ? scenes.find(s => s.id === editId)?.order ?? scenes.length
                : scenes.length,
        };

        if (editId) {
            const index = scenes.findIndex(s => s.id === editId);
            if (index !== -1) scenes[index] = scene;
        } else {
            scenes.push(scene);
        }

        saveScenes();
        hideForm();
        renderList();
    }

    function editScene(id) {
        const scene = scenes.find(s => s.id === id);
        if (!scene) return;

        editId = scene.id;
        titleInput.value = scene.title;
        summaryInput.value = scene.summary;
        locationInput.value = scene.location;
        timeInput.value = scene.time;
        populateCharacterCheckboxes(scene.characterIds);
        showForm();
    }

    function deleteScene(id) {
        if (!confirm('确定要删除该场景吗？关联的出场角色信息也会被移除。')) return;

        scenes = scenes.filter(s => s.id !== id);
        saveScenes();
        renderList();
    }

    function renderList() {
        if (scenes.length === 0) {
            listEl.innerHTML = '<p class="empty-hint">暂无场景，点击上方按钮添加</p>';
            return;
        }

        // 按 order 排序
        const sorted = [...scenes].sort((a, b) => a.order - b.order);

        listEl.innerHTML = sorted
            .map((s, index) => {
                const characterNames = s.characterIds
                    .map(cid => Characters.getById(cid))
                    .filter(Boolean)
                    .map(c => c.name);

                return `
                <div class="scene-card" data-id="${s.id}">
                    <div class="scene-card-header">
                        <span class="scene-order">#${index + 1}</span>
                        <span class="scene-title-text">${escapeHtml(s.title)}</span>
                    </div>
                    ${s.summary ? `<p class="scene-summary">${escapeHtml(s.summary)}</p>` : ''}
                    <div class="scene-meta">
                        ${s.location ? `<span class="scene-meta-item">📍 ${escapeHtml(s.location)}</span>` : ''}
                        ${s.time ? `<span class="scene-meta-item">🕐 ${escapeHtml(s.time)}</span>` : ''}
                        ${characterNames.length > 0 ? `<span class="scene-meta-item">👤 ${characterNames.join(', ')}</span>` : ''}
                    </div>
                    <div class="scene-actions">
                        <button class="btn-icon btn-edit" data-id="${s.id}" title="编辑">&#9998;</button>
                        <button class="btn-icon btn-delete" data-id="${s.id}" title="删除">&#10005;</button>
                    </div>
                </div>
            `;
            })
            .join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getAll() {
        return [...scenes].sort((a, b) => a.order - b.order);
    }

    function getById(id) {
        return scenes.find(s => s.id === id) || null;
    }

    return { init, getAll, getById, renderList };
})();
