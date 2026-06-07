/**
 * SceneForge 时间线模块
 * 负责场景排序、幕结构管理和可视化时间线
 */

const Timeline = (() => {
    let timelineEl;
    let scenesSource;  // 缓存场景数据引用
    let onDataChange = null;

    function init(changeCallback) {
        onDataChange = changeCallback;
        cacheDomElements();
        bindEvents();
        render();
    }

    function cacheDomElements() {
        timelineEl = document.getElementById('timeline-view');
    }

    function bindEvents() {
        timelineEl.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;

            if (btn.classList.contains('btn-move-up')) {
                moveSceneUp(id);
            } else if (btn.classList.contains('btn-move-down')) {
                moveSceneDown(id);
            } else if (btn.classList.contains('btn-set-act')) {
                const act = btn.dataset.act;
                setSceneAct(id, act);
            }
        });
    }

    function moveSceneUp(id) {
        const scenes = Scenes.getAll();
        const index = scenes.findIndex(s => s.id === id);
        if (index <= 0) return;

        // 交换 order
        const temp = scenes[index].order;
        scenes[index].order = scenes[index - 1].order;
        scenes[index - 1].order = temp;

        saveScenesFromMemory();
        render();
        // 同步更新场景面板列表
        if (typeof Scenes.renderList === 'function') {
            Scenes.renderList();
        }
    }

    function moveSceneDown(id) {
        const scenes = Scenes.getAll();
        const index = scenes.findIndex(s => s.id === id);
        if (index < 0 || index >= scenes.length - 1) return;

        const temp = scenes[index].order;
        scenes[index].order = scenes[index + 1].order;
        scenes[index + 1].order = temp;

        saveScenesFromMemory();
        render();
        if (typeof Scenes.renderList === 'function') {
            Scenes.renderList();
        }
    }

    function setSceneAct(id, act) {
        const scenes = Scenes.getAll();
        const scene = scenes.find(s => s.id === id);
        if (!scene) return;

        scene.act = act;
        saveScenesFromMemory();
        render();
    }

    function saveScenesFromMemory() {
        const scenes = Scenes.getAll();
        Storage.save(Storage.KEYS.SCENES, JSON.stringify(scenes));
        if (onDataChange) onDataChange();
    }

    function render() {
        const scenes = Scenes.getAll();

        if (scenes.length === 0) {
            timelineEl.innerHTML = '<p class="empty-hint">暂无场景，请先在「场景」面板中添加场景</p>';
            return;
        }

        // 按幕分组
        const actNames = ['', '第一幕', '第二幕', '第三幕'];
        const actSymbols = ['', 'Ⅰ', 'Ⅱ', 'Ⅲ'];

        // 构建幕分组数据
        const acts = {};
        scenes.forEach(s => {
            const act = s.act || '1';
            if (!acts[act]) acts[act] = [];
            acts[act].push(s);
        });

        // 排序幕
        const sortedActs = Object.keys(acts).sort((a, b) => Number(a) - Number(b));

        let html = '';

        sortedActs.forEach(actNum => {
            const actIdx = Number(actNum);
            const actName = actNames[actIdx] || `第${actIdx}幕`;

            html += `
                <div class="timeline-act">
                    <div class="timeline-act-header">
                        <span class="act-label">${actName}</span>
                        <span class="act-line"></span>
                    </div>
                    <div class="timeline-scenes">
            `;

            acts[actNum].forEach((s, index) => {
                const characterNames = s.characterIds
                    .map(cid => Characters.getById(cid))
                    .filter(Boolean)
                    .map(c => c.name);

                const totalScenes = scenes.length;

                html += `
                    <div class="timeline-scene" data-id="${s.id}">
                        <div class="timeline-connector">
                            <div class="timeline-dot"></div>
                            ${index < acts[actNum].length - 1 ? '<div class="timeline-line"></div>' : ''}
                        </div>
                        <div class="timeline-scene-body">
                            <div class="timeline-scene-header">
                                <span class="timeline-scene-title">${escapeHtml(s.title)}</span>
                                <div class="timeline-scene-actions">
                                    <select class="act-select" data-id="${s.id}">
                                        ${actNames.map((name, i) => i === 0 ? '' : `<option value="${i}" ${(s.act || '1') === String(i) ? 'selected' : ''}>${name}</option>`).join('')}
                                    </select>
                                    <button class="btn-icon btn-move-up" data-id="${s.id}" title="上移">▲</button>
                                    <button class="btn-icon btn-move-down" data-id="${s.id}" title="下移">▼</button>
                                </div>
                            </div>
                            <div class="timeline-scene-meta">
                                ${s.location ? `<span>📍 ${escapeHtml(s.location)}</span>` : ''}
                                ${s.time ? `<span>🕐 ${escapeHtml(s.time)}</span>` : ''}
                            </div>
                            ${s.summary ? `<p class="timeline-scene-summary">${escapeHtml(s.summary)}</p>` : ''}
                            ${characterNames.length > 0 ? `<div class="timeline-characters">👤 ${characterNames.map(n => escapeHtml(n)).join(', ')}</div>` : ''}
                        </div>
                    </div>
                `;
            });

            html += '</div></div>';
        });

        // Act select change handling - after rendering
        timelineEl.innerHTML = html;

        // Bind act select change
        timelineEl.querySelectorAll('.act-select').forEach(select => {
            select.addEventListener('change', (e) => {
                e.stopPropagation();
                setSceneAct(e.target.dataset.id, e.target.value);
            });
        });

        // 添加统计信息
        const actCounts = {};
        scenes.forEach(s => { const a = s.act || '1'; actCounts[a] = (actCounts[a] || 0) + 1; });

        const statsHtml = `
            <div class="timeline-stats">
                <span>共 ${scenes.length} 个场景</span>
                ${Object.entries(actCounts).sort().map(([a, c]) =>
                    `<span>${actNames[Number(a)] || `第${a}幕`}: ${c}场</span>`
                ).join('')}
            </div>
        `;

        timelineEl.insertAdjacentHTML('afterbegin', statsHtml);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { init, render };
})();
