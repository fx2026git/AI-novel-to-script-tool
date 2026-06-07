/**
 * SceneForge 角色管理模块
 * 负责角色的增删改查操作
 */

const Characters = (() => {
    let characters = [];
    let editId = null;

    let formEl, nameInput, roleSelect, descInput;
    let listEl;
    let onDataChange = null;

    function init(changeCallback) {
        onDataChange = changeCallback;
        cacheDomElements();
        loadCharacters();
        bindEvents();
        renderList();
    }

    function cacheDomElements() {
        formEl = document.getElementById('character-form');
        nameInput = document.getElementById('char-name');
        roleSelect = document.getElementById('char-role');
        descInput = document.getElementById('char-desc');
        listEl = document.getElementById('character-list');
    }

    function loadCharacters() {
        const data = Storage.load(Storage.KEYS.CHARACTERS, '[]');
        try {
            characters = JSON.parse(data);
        } catch (e) {
            characters = [];
        }
    }

    function saveCharacters() {
        Storage.save(Storage.KEYS.CHARACTERS, JSON.stringify(characters));
        if (onDataChange) onDataChange();
    }

    function bindEvents() {
        document.getElementById('btn-add-character').addEventListener('click', () => {
            resetForm();
            showForm();
        });

        document.getElementById('btn-save-character').addEventListener('click', saveCharacter);
        document.getElementById('btn-cancel-character').addEventListener('click', hideForm);

        listEl.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;
            if (btn.classList.contains('btn-edit')) {
                editCharacter(id);
            } else if (btn.classList.contains('btn-delete')) {
                deleteCharacter(id);
            }
        });
    }

    function showForm() { formEl.classList.remove('hidden'); }
    function hideForm() { formEl.classList.add('hidden'); resetForm(); }

    function resetForm() {
        nameInput.value = '';
        roleSelect.value = '';
        descInput.value = '';
        editId = null;
    }

    function saveCharacter() {
        const name = nameInput.value.trim();
        if (!name) { alert('请输入角色名称'); return; }

        const character = {
            id: editId || Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            name: name,
            role: roleSelect.value,
            description: descInput.value.trim(),
        };

        if (editId) {
            const index = characters.findIndex(c => c.id === editId);
            if (index !== -1) characters[index] = character;
        } else {
            characters.push(character);
        }

        saveCharacters();
        hideForm();
        renderList();
    }

    function editCharacter(id) {
        const character = characters.find(c => c.id === id);
        if (!character) return;
        editId = character.id;
        nameInput.value = character.name;
        roleSelect.value = character.role;
        descInput.value = character.description;
        showForm();
    }

    function deleteCharacter(id) {
        if (!confirm('确定要删除该角色吗？')) return;
        characters = characters.filter(c => c.id !== id);
        saveCharacters();
        renderList();
    }

    function renderList() {
        if (characters.length === 0) {
            listEl.innerHTML = '<p class="empty-hint">暂无角色，点击上方按钮添加</p>';
            return;
        }

        const roleLabels = {
            protagonist: '主角',
            antagonist: '反派',
            supporting: '配角',
            minor: '次要角色',
        };

        listEl.innerHTML = characters
            .map(c => `
                <div class="character-card" data-id="${c.id}">
                    <div class="character-info">
                        <span class="character-name">${escapeHtml(c.name)}</span>
                        ${c.role ? `<span class="character-role tag">${roleLabels[c.role] || c.role}</span>` : ''}
                        ${c.description ? `<p class="character-desc">${escapeHtml(c.description)}</p>` : ''}
                    </div>
                    <div class="character-actions">
                        <button class="btn-icon btn-edit" data-id="${c.id}" title="编辑">&#9998;</button>
                        <button class="btn-icon btn-delete" data-id="${c.id}" title="删除">&#10005;</button>
                    </div>
                </div>
            `).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getAll() { return [...characters]; }
    function getById(id) { return characters.find(c => c.id === id) || null; }

    return { init, getAll, getById, renderList };
})();
