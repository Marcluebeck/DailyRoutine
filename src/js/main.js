import {
  getState,
  onStateChange,
  setTasks,
  setSettings,
  updateState,
  getShopOverride,
  setShopOverride
} from './storage.js';
import {
  startTask,
  completeTask,
  evaluateRewards,
  buyItem,
  canPurchase,
  getMotivationMessage,
  nextTask
} from './gameLogic.js';
import { setVoiceEnabled, speak, stopSpeaking } from './voice.js';
import { downloadExport, importFromFile } from './exportImport.js';
import * as timer from './timer.js';

const refs = {
  childModeBtn: document.getElementById('childModeBtn'),
  parentModeBtn: document.getElementById('parentModeBtn'),
  childMode: document.getElementById('childMode'),
  parentMode: document.getElementById('parentMode'),
  taskList: document.getElementById('taskList'),
  parentTaskList: document.getElementById('parentTaskList'),
  shuffleTasksBtn: document.getElementById('shuffleTasksBtn'),
  startTimerBtn: document.getElementById('startTimerBtn'),
  pauseTimerBtn: document.getElementById('pauseTimerBtn'),
  resetTimerBtn: document.getElementById('resetTimerBtn'),
  timerDisplay: document.getElementById('timerDisplay'),
  motivationMessage: document.getElementById('motivationMessage'),
  taskTemplate: document.getElementById('taskTemplate'),
  rewardTemplate: document.getElementById('rewardTemplate'),
  rewardTrack: document.getElementById('rewardTrack'),
  openShopBtn: document.getElementById('openShopBtn'),
  shopDialog: document.getElementById('shopDialog'),
  shopItems: document.getElementById('shopItems'),
  shopPoints: document.getElementById('shopPoints'),
  pointTotal: document.getElementById('pointTotal'),
  avatarCanvas: document.getElementById('avatarCanvas'),
  taskForm: document.getElementById('taskForm'),
  taskName: document.getElementById('taskName'),
  taskDuration: document.getElementById('taskDuration'),
  autoAdvanceToggle: document.getElementById('autoAdvanceToggle'),
  voiceToggle: document.getElementById('voiceToggle'),
  motivationInput: document.getElementById('motivationInput'),
  parentTabs: document.querySelectorAll('.tabs__tab'),
  tabPanels: document.querySelectorAll('.tab-panel'),
  exportBtn: document.getElementById('exportBtn'),
  exportPreview: document.getElementById('exportPreview'),
  importInput: document.getElementById('importInput'),
  parentShopList: document.getElementById('parentShopList')
};

let shopItemsData = [];
let rewardDefinitions = [];
let activeTask = null;

async function loadStaticData() {
  try {
    const [shopRes, rewardRes] = await Promise.all([
      fetch('data/shopItems.json'),
      fetch('data/rewards.json')
    ]);
    shopItemsData = await shopRes.json();
    rewardDefinitions = await rewardRes.json();
  } catch (error) {
    console.warn('Konnte statische Daten nicht laden', error);
    shopItemsData = [];
    rewardDefinitions = [];
  }
}

function initEvents() {
  refs.childModeBtn?.addEventListener('click', () => toggleMode('child'));
  refs.parentModeBtn?.addEventListener('click', () => toggleMode('parent'));

  refs.shuffleTasksBtn?.addEventListener('click', () => {
    const state = getState();
    const shuffled = [...state.tasks].sort(() => Math.random() - 0.5);
    setTasks(shuffled);
  });

  refs.taskList?.addEventListener('click', (event) => {
    const button = event.target.closest('.task__button');
    if (!button) return;
    const taskId = button.closest('.task').dataset.taskId;
    handleTaskStart(taskId);
  });

  refs.startTimerBtn?.addEventListener('click', () => {
    if (!activeTask) {
      const state = getState();
      const next = nextTask(state.tasks);
      if (!next) {
        refs.motivationMessage.textContent = 'Alle Aufgaben geschafft!';
        return;
      }
      handleTaskStart(next.id);
      return;
    }
    timer.start(activeTask.duration * 60);
  });

  refs.pauseTimerBtn?.addEventListener('click', () => timer.pause());
  refs.resetTimerBtn?.addEventListener('click', () => {
    timer.reset();
    stopSpeaking();
    activeTask = null;
    updateState((draft) => {
      draft.progression.activeTaskId = null;
      return draft;
    });
    refs.motivationMessage.textContent = 'Lass uns losglitzern!';
    render(getState());
  });

  refs.taskForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = refs.taskName.value.trim();
    const duration = Number.parseInt(refs.taskDuration.value, 10) || 5;
    if (!name) return;
    const state = getState();
    const newTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
      name,
      duration
    };
    setTasks([...state.tasks, newTask]);
    refs.taskForm.reset();
    refs.taskDuration.value = '5';
  });

  refs.parentTaskList?.addEventListener('click', (event) => {
    if (event.target.matches('.task__delete')) {
      const li = event.target.closest('.task');
      const taskId = li.dataset.taskId;
      const state = getState();
      const nextTasks = state.tasks.filter((task) => task.id !== taskId);
      setTasks(nextTasks);
    }
  });

  refs.autoAdvanceToggle?.addEventListener('change', (event) => {
    setSettings({ autoAdvance: event.target.checked });
  });

  refs.voiceToggle?.addEventListener('change', (event) => {
    const enabled = event.target.checked;
    setSettings({ voiceEnabled: enabled });
    setVoiceEnabled(enabled);
  });

  refs.motivationInput?.addEventListener('blur', () => {
    const value = refs.motivationInput.value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    setSettings({ motivationMessages: value });
  });

  refs.parentTabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  refs.openShopBtn?.addEventListener('click', () => {
    if (typeof refs.shopDialog.showModal === 'function') {
      refs.shopDialog.showModal();
    }
  });

  refs.shopDialog?.addEventListener('close', () => stopSpeaking());

  refs.shopItems?.addEventListener('click', (event) => {
    const button = event.target.closest('.shop__buy');
    if (!button) return;
    const itemId = button.dataset.itemId;
    const item = shopItemsData.find((entry) => entry.id === itemId);
    if (!item) return;
    const cost = getItemCost(item);
    if (!buyItem({ ...item, cost })) {
      refs.motivationMessage.textContent = 'Noch etwas sparen!';
      return;
    }
    refs.motivationMessage.textContent = 'Neues Accessoire freigeschaltet!';
    render(getState());
  });

  refs.parentShopList?.addEventListener('change', (event) => {
    const input = event.target;
    if (!input.matches('.shop__cost-input')) return;
    const itemId = input.dataset.itemId;
    const value = Number.parseInt(input.value, 10);
    if (Number.isFinite(value) && value > 0) {
      setShopOverride(itemId, value);
    }
  });

  refs.exportBtn?.addEventListener('click', () => {
    const blob = downloadExport();
    refs.exportPreview.textContent = 'Exportiert ' + new Date().toLocaleString();
    setTimeout(() => {
      refs.exportPreview.textContent += `\nDateigröße: ${(blob.size / 1024).toFixed(1)} KB`;
    }, 0);
  });

  refs.importInput?.addEventListener('change', async () => {
    const [file] = refs.importInput.files;
    if (!file) return;
    try {
      await importFromFile(file);
      refs.exportPreview.textContent = 'Import erfolgreich ✅';
    } catch (error) {
      console.error(error);
      refs.exportPreview.textContent = 'Import fehlgeschlagen';
    }
  });
}

function handleTaskStart(taskId) {
  const startedTask = startTask(taskId);
  if (!startedTask) return;
  activeTask = startedTask;
  timer.start(startedTask.duration * 60);
  refs.motivationMessage.textContent = getMotivationMessage();
  speak(refs.motivationMessage.textContent);
  render(getState());
}

function handleTimerComplete() {
  if (!activeTask) return;
  const { pointsAwarded } = completeTask(activeTask.id);
  const state = getState();
  const message = `Funkelnd! +${pointsAwarded} Punkte`; 
  refs.motivationMessage.textContent = message;
  speak(message);
  activeTask = null;
  render(state);
  if (state.settings.autoAdvance) {
    const upcoming = nextTask(state.tasks);
    if (upcoming) {
      setTimeout(() => handleTaskStart(upcoming.id), 1200);
    }
  }
}

function toggleMode(mode) {
  const isChild = mode === 'child';
  refs.childMode.classList.toggle('mode--active', isChild);
  refs.parentMode.classList.toggle('mode--active', !isChild);
  refs.childModeBtn.classList.toggle('mode-toggle__btn--active', isChild);
  refs.parentModeBtn.classList.toggle('mode-toggle__btn--active', !isChild);
}

function switchTab(tabId) {
  refs.parentTabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabId;
    tab.classList.toggle('tabs__tab--active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  refs.tabPanels.forEach((panel) => {
    panel.classList.toggle('tab-panel--active', panel.dataset.panel === tabId);
  });
}

function render(state) {
  renderTasks(state);
  renderParentTasks(state);
  renderRewards(state);
  renderShop(state);
  renderSettings(state);
  renderAvatar(state);
  refs.pointTotal.textContent = state.points;
  refs.shopPoints.textContent = state.points;
}

function renderTasks(state) {
  refs.taskList.innerHTML = '';
  state.tasks.forEach((task) => {
    const clone = refs.taskTemplate.content.cloneNode(true);
    const li = clone.querySelector('.task');
    li.dataset.taskId = task.id;
    const button = clone.querySelector('.task__button');
    const deleteButton = clone.querySelector('.task__delete');
    if (deleteButton) {
      deleteButton.remove();
    }
    const name = clone.querySelector('.task__name');
    const duration = clone.querySelector('.task__duration');
    name.textContent = task.name;
    duration.textContent = `${task.duration} min`;
    if (state.progression.activeTaskId === task.id) {
      button.classList.add('is-active');
    }
    if (state.progression.completedTaskIds.includes(task.id)) {
      button.classList.add('is-done');
    }
    refs.taskList.appendChild(clone);
  });
}

function renderParentTasks(state) {
  refs.parentTaskList.innerHTML = '';
  state.tasks.forEach((task) => {
    const clone = refs.taskTemplate.content.cloneNode(true);
    const li = clone.querySelector('.task');
    li.dataset.taskId = task.id;
    const button = clone.querySelector('.task__button');
    const info = document.createElement('div');
    info.className = 'task__info';
    info.innerHTML = `<strong>${task.name}</strong><span>${task.duration} min</span>`;
    button.replaceWith(info);
    refs.parentTaskList.appendChild(clone);
  });
}

function renderRewards(state) {
  refs.rewardTrack.innerHTML = '';
  if (!rewardDefinitions.length) {
    const info = document.createElement('p');
    info.textContent = 'Belohnungen werden geladen...';
    info.className = 'muted';
    refs.rewardTrack.appendChild(info);
    return;
  }
  const rewards = evaluateRewards(rewardDefinitions);
  rewards.forEach((reward) => {
    const clone = refs.rewardTemplate.content.cloneNode(true);
    const container = clone.querySelector('.reward');
    container.dataset.rewardId = reward.id;
    container.classList.toggle('is-earned', reward.earned);
    clone.querySelector('.reward__name').textContent = reward.name;
    clone.querySelector('.reward__message').textContent = reward.message;
    refs.rewardTrack.appendChild(clone);
  });
}

function renderShop(state) {
  refs.shopItems.innerHTML = '';
  refs.parentShopList.innerHTML = '';
  if (!shopItemsData.length) {
    const placeholder = document.createElement('p');
    placeholder.textContent = 'Shop wird vorbereitet...';
    placeholder.className = 'muted';
    refs.shopItems.appendChild(placeholder.cloneNode(true));
    refs.parentShopList.appendChild(placeholder);
    return;
  }
  shopItemsData.forEach((item) => {
    const cost = getItemCost(item);
    const li = document.createElement('li');
    li.className = 'shop__item';
    li.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="shop__footer">
        <span class="shop__cost">${cost} Punkte</span>
        <button class="secondary shop__buy" data-item-id="${item.id}">Kaufen</button>
      </div>
    `;
    const buyButton = li.querySelector('.shop__buy');
    const isOwned = state.inventory.includes(item.id);
    if (isOwned) {
      li.classList.add('is-owned');
      buyButton.textContent = 'Freigeschaltet';
    }
    buyButton.disabled = isOwned || !canPurchase(cost);
    refs.shopItems.appendChild(li);

    const parentLi = li.cloneNode(true);
    const parentBuyButton = parentLi.querySelector('.shop__buy');
    parentBuyButton.remove();
    const costElement = parentLi.querySelector('.shop__cost');
    costElement.textContent = '';
    costElement.appendChild(createCostInput(item, cost));
    if (isOwned) {
      const status = document.createElement('span');
      status.className = 'shop__status';
      status.textContent = 'Bereits gekauft';
      costElement.appendChild(status);
    }
    refs.parentShopList.appendChild(parentLi);
  });
}

function createCostInput(item, cost) {
  const wrapper = document.createElement('label');
  wrapper.textContent = 'Preis:';
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '1';
  input.className = 'shop__cost-input';
  input.dataset.itemId = item.id;
  input.value = cost;
  wrapper.appendChild(input);
  return wrapper;
}

function renderSettings(state) {
  refs.autoAdvanceToggle.checked = state.settings.autoAdvance;
  refs.voiceToggle.checked = state.settings.voiceEnabled;
  setVoiceEnabled(state.settings.voiceEnabled);
  refs.motivationInput.value = state.settings.motivationMessages.join(', ');
}

function renderAvatar(state) {
  const progress = state.tasks.length ? state.progression.completedTaskIds.length / state.tasks.length : 0;
  refs.avatarCanvas.style.setProperty('--glow', progress);
  refs.avatarCanvas.style.boxShadow = `0 0 ${10 + progress * 30}px rgba(255, 224, 102, 0.7)`;
}

function getItemCost(item) {
  return getShopOverride(item.id) ?? item.cost;
}

function setupTimer() {
  timer.onTick(({ remainingSeconds, totalSeconds }) => {
    refs.timerDisplay.textContent = formatTime(remainingSeconds || totalSeconds || 0);
  });
  timer.onComplete(handleTimerComplete);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

async function init() {
  setupTimer();
  initEvents();
  await loadStaticData();
  render(getState());
  onStateChange(render);
  registerServiceWorker();
}

init().catch((error) => console.error('Initialisierung fehlgeschlagen', error));

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../service-worker.js').catch((error) => {
      console.warn('Service Worker Registrierung fehlgeschlagen', error);
    });
  }
}
