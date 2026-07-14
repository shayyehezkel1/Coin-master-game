(() => {
  "use strict";

  const STORAGE_KEY = "coinVillageState";
  const MAX_SPINS = 50;
  const REGEN_INTERVAL_MS = 60 * 1000; // 1 spin per minute
  const MAX_BUILDING_LEVEL = 4;

  const BUILDINGS = [
    { name: "בית", icon: "🏠", baseCost: 800 },
    { name: "מזרקה", icon: "⛲", baseCost: 2200 },
    { name: "גינה", icon: "🌳", baseCost: 5500 },
    { name: "חווה", icon: "🐔", baseCost: 14000 },
    { name: "מקדש", icon: "⛪", baseCost: 35000 },
    { name: "טירה", icon: "🏰", baseCost: 90000 },
  ];

  const OUTCOME_TYPES = [
    { type: "coins", symbol: "🪙", weight: 55 },
    { type: "coins_big", symbol: "💰", weight: 18 },
    { type: "attack", symbol: "🔨", weight: 11 },
    { type: "raid", symbol: "🐷", weight: 9 },
    { type: "shield", symbol: "🛡️", weight: 7 },
  ];
  const ALL_SYMBOLS = OUTCOME_TYPES.map((o) => o.symbol);
  const TOTAL_WEIGHT = OUTCOME_TYPES.reduce((s, o) => s + o.weight, 0);

  // ---------- DOM ----------
  const coinsValueEl = document.getElementById("coinsValue");
  const spinsValueEl = document.getElementById("spinsValue");
  const spinTimerEl = document.getElementById("spinTimer");
  const villageValueEl = document.getElementById("villageValue");
  const villageTitleNumEl = document.getElementById("villageTitleNum");
  const progressFillEl = document.getElementById("villageProgressFill");
  const progressTextEl = document.getElementById("villageProgressText");
  const buildingsGridEl = document.getElementById("buildingsGrid");
  const nextVillageBtn = document.getElementById("nextVillageBtn");
  const spinBtn = document.getElementById("spinBtn");
  const resultBanner = document.getElementById("resultBanner");
  const floatingLayer = document.getElementById("floatingLayer");
  const slotMachineEl = document.querySelector(".slot-machine");
  const resetBtn = document.getElementById("resetBtn");
  const reelEls = [
    document.getElementById("reel0"),
    document.getElementById("reel1"),
    document.getElementById("reel2"),
  ];

  // ---------- State ----------
  let state = loadState();
  let spinning = false;

  function defaultState() {
    return {
      coins: 500,
      spins: 25,
      village: 1,
      buildings: BUILDINGS.map(() => ({ level: 0 })),
      lastRegenTime: Date.now(),
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed.buildings || parsed.buildings.length !== BUILDINGS.length) {
        parsed.buildings = BUILDINGS.map(() => ({ level: 0 }));
      }
      return { ...defaultState(), ...parsed };
    } catch (e) {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ---------- Helpers ----------
  function villageScale(village) {
    return Math.pow(2.3, village - 1);
  }

  function randRange(min, max) {
    return Math.floor(min + Math.random() * (max - min));
  }

  function formatNumber(n) {
    n = Math.round(n);
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toString();
  }

  function pickOutcome() {
    let r = Math.random() * TOTAL_WEIGHT;
    for (const outcome of OUTCOME_TYPES) {
      if (r < outcome.weight) return outcome;
      r -= outcome.weight;
    }
    return OUTCOME_TYPES[0];
  }

  function computeReward(outcomeType, village) {
    const scale = villageScale(village);
    switch (outcomeType) {
      case "coins":
        return { coins: Math.round(randRange(40, 150) * scale) };
      case "coins_big":
        return { coins: Math.round(randRange(150, 400) * scale) };
      case "attack":
        return { coins: Math.round(randRange(200, 500) * scale) };
      case "raid":
        return { coins: Math.round(randRange(400, 900) * scale) };
      case "shield":
        return { coins: Math.round(randRange(30, 90) * scale), extraSpin: 1 };
      default:
        return { coins: 0 };
    }
  }

  function messageFor(outcomeType, reward) {
    const coinsStr = formatNumber(reward.coins);
    switch (outcomeType) {
      case "coins":
        return `+${coinsStr} מטבעות!`;
      case "coins_big":
        return `💰 שק מטבעות ענק! +${coinsStr}`;
      case "attack":
        return `🔨 תקפת את הכפר של השכן! +${coinsStr}`;
      case "raid":
        return `🐷 מצאת מטמון חבוי! +${coinsStr}`;
      case "shield":
        return `🛡️ מגן! סיבוב חינם +${coinsStr} מטבעות`;
      default:
        return "";
    }
  }

  function buildingCost(index, level) {
    const b = BUILDINGS[index];
    return Math.round(b.baseCost * Math.pow(1.8, level) * villageScale(state.village));
  }

  // ---------- Spin regen ----------
  function regenSpins() {
    if (state.spins >= MAX_SPINS) {
      state.lastRegenTime = Date.now();
      return;
    }
    const now = Date.now();
    const elapsed = now - state.lastRegenTime;
    const gained = Math.floor(elapsed / REGEN_INTERVAL_MS);
    if (gained > 0) {
      state.spins = Math.min(MAX_SPINS, state.spins + gained);
      state.lastRegenTime += gained * REGEN_INTERVAL_MS;
    }
  }

  function updateSpinTimer() {
    if (state.spins >= MAX_SPINS) {
      spinTimerEl.textContent = "";
      return;
    }
    const remaining = Math.max(0, REGEN_INTERVAL_MS - (Date.now() - state.lastRegenTime));
    const seconds = Math.ceil(remaining / 1000);
    const mm = Math.floor(seconds / 60);
    const ss = (seconds % 60).toString().padStart(2, "0");
    spinTimerEl.textContent = `סיבוב הבא בעוד ${mm}:${ss}`;
  }

  // ---------- Rendering ----------
  function updateStatsUI() {
    coinsValueEl.textContent = formatNumber(state.coins);
    spinsValueEl.textContent = `${state.spins}/${MAX_SPINS}`;
    villageValueEl.textContent = state.village;
    spinBtn.disabled = spinning || state.spins <= 0;
  }

  function renderBuildings() {
    buildingsGridEl.innerHTML = "";
    let totalLevels = 0;

    BUILDINGS.forEach((b, i) => {
      const lvl = state.buildings[i].level;
      totalLevels += lvl;
      const maxed = lvl >= MAX_BUILDING_LEVEL;
      const cost = maxed ? null : buildingCost(i, lvl);
      const affordable = !maxed && state.coins >= cost;

      const card = document.createElement("div");
      card.className = "building-card" + (maxed ? " maxed" : "");

      const icon = document.createElement("div");
      icon.className = "building-icon";
      icon.textContent = b.icon;

      const name = document.createElement("div");
      name.className = "building-name";
      name.textContent = b.name;

      const level = document.createElement("div");
      level.className = "building-level";
      level.textContent = `רמה ${lvl}/${MAX_BUILDING_LEVEL}`;

      const upgradeBtn = document.createElement("button");
      upgradeBtn.className = "building-upgrade-btn" + (affordable ? " affordable" : "");
      upgradeBtn.disabled = maxed;
      upgradeBtn.textContent = maxed ? "הושלם ✓" : `שדרג (${formatNumber(cost)} 🪙)`;
      upgradeBtn.addEventListener("click", () => upgradeBuilding(i));

      card.append(icon, name, level, upgradeBtn);
      buildingsGridEl.appendChild(card);
    });

    const totalMax = BUILDINGS.length * MAX_BUILDING_LEVEL;
    const pct = Math.round((totalLevels / totalMax) * 100);
    progressFillEl.style.width = pct + "%";
    progressTextEl.textContent = pct + "%";
    nextVillageBtn.disabled = pct < 100;
    villageTitleNumEl.textContent = state.village;
  }

  function render() {
    updateStatsUI();
    renderBuildings();
  }

  // ---------- Actions ----------
  function upgradeBuilding(index) {
    const lvl = state.buildings[index].level;
    if (lvl >= MAX_BUILDING_LEVEL) return;
    const cost = buildingCost(index, lvl);
    if (state.coins < cost) return;
    state.coins -= cost;
    state.buildings[index].level++;
    saveState();
    render();
  }

  function goToNextVillage() {
    const totalMax = BUILDINGS.length * MAX_BUILDING_LEVEL;
    const totalLevels = state.buildings.reduce((s, b) => s + b.level, 0);
    if (totalLevels < totalMax) return;
    state.village++;
    state.buildings = BUILDINGS.map(() => ({ level: 0 }));
    saveState();
    render();
    showFloatingText(`🏘️ כפר ${state.village}!`, "#3ddc84");
  }

  function showFloatingText(text, color) {
    const el = document.createElement("div");
    el.className = "floating-text";
    el.textContent = text;
    el.style.color = color || "#ffc93c";
    el.style.left = 45 + Math.random() * 10 + "%";
    floatingLayer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  function showResultBanner(message) {
    resultBanner.textContent = message;
    resultBanner.classList.add("show");
    setTimeout(() => resultBanner.classList.remove("show"), 1800);
  }

  function spin() {
    if (spinning || state.spins <= 0) return;
    spinning = true;
    state.spins--;
    saveState();
    updateStatsUI();
    resultBanner.classList.remove("show");

    const outcome = pickOutcome();
    reelEls.forEach((reel) => reel.classList.add("spinning"));

    const intervals = reelEls.map((reel) => {
      const strip = reel.querySelector(".reel-strip");
      const randomize = () => {
        const sym = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
        strip.innerHTML = `<div class="symbol">${sym}</div>`;
      };
      randomize();
      return setInterval(randomize, 70);
    });

    reelEls.forEach((reel, i) => {
      setTimeout(() => {
        clearInterval(intervals[i]);
        reel.classList.remove("spinning");
        const strip = reel.querySelector(".reel-strip");
        strip.innerHTML = `<div class="symbol">${outcome.symbol}</div>`;

        if (i === reelEls.length - 1) {
          setTimeout(() => resolveOutcome(outcome), 200);
        }
      }, 600 + i * 300);
    });
  }

  function resolveOutcome(outcome) {
    const reward = computeReward(outcome.type, state.village);
    state.coins += reward.coins;
    if (reward.extraSpin) {
      state.spins = Math.min(MAX_SPINS, state.spins + reward.extraSpin);
    }

    if (outcome.type === "attack" || outcome.type === "raid") {
      slotMachineEl.classList.add("shake");
      setTimeout(() => slotMachineEl.classList.remove("shake"), 400);
    }

    showFloatingText(`+${formatNumber(reward.coins)} 🪙`, "#ffc93c");
    showResultBanner(messageFor(outcome.type, reward));

    spinning = false;
    saveState();
    render();
  }

  function resetGame() {
    if (!confirm("לאפס את כל ההתקדמות במשחק?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    saveState();
    render();
  }

  // ---------- Init ----------
  spinBtn.addEventListener("click", spin);
  nextVillageBtn.addEventListener("click", goToNextVillage);
  resetBtn.addEventListener("click", resetGame);

  regenSpins();
  render();
  updateSpinTimer();
  saveState();

  setInterval(() => {
    regenSpins();
    updateStatsUI();
    updateSpinTimer();
    saveState();
  }, 1000);
})();
