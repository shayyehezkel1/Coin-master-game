(() => {
  "use strict";

  const STORAGE_KEY = "coinVillageState";
  const MAX_SPINS = 50;
  const REGEN_INTERVAL_MS = 60 * 1000; // 1 spin per minute
  const MAX_BUILDING_LEVEL = 4;

  const BUILDINGS = [
    {
      name: "בית",
      baseCost: 800,
      svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <polygon points="32,10 8,30 56,30" fill="#c0453a" stroke="#7a2a20" stroke-width="2"/>
        <rect x="14" y="30" width="36" height="26" fill="#f2d9a8" stroke="#8a5a2a" stroke-width="2"/>
        <rect x="28" y="38" width="10" height="18" fill="#7a4a24"/>
        <rect x="18" y="36" width="10" height="10" fill="#bfe3f7" stroke="#6b4020" stroke-width="1.5"/>
        <line x1="23" y1="36" x2="23" y2="46" stroke="#6b4020" stroke-width="1.5"/>
        <line x1="18" y1="41" x2="28" y2="41" stroke="#6b4020" stroke-width="1.5"/>
        <rect x="40" y="14" width="6" height="10" fill="#8a8a8a"/>
      </svg>`,
    },
    {
      name: "מזרקה",
      baseCost: 2200,
      svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="52" rx="22" ry="7" fill="#9aa7ad" stroke="#6b7378" stroke-width="2"/>
        <rect x="26" y="30" width="12" height="20" fill="#c7d2d6" stroke="#6b7378" stroke-width="2"/>
        <ellipse cx="32" cy="30" rx="16" ry="5" fill="#bcd8ea" stroke="#6b7378" stroke-width="2"/>
        <circle cx="32" cy="18" r="4" fill="#eaf6fc"/>
        <path d="M32 18 C 28 24, 24 26, 22 30" stroke="#7ec8f4" stroke-width="2" fill="none"/>
        <path d="M32 18 C 36 24, 40 26, 42 30" stroke="#7ec8f4" stroke-width="2" fill="none"/>
      </svg>`,
    },
    {
      name: "גינה",
      baseCost: 5500,
      svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="38" width="8" height="18" fill="#7a4a24"/>
        <circle cx="24" cy="30" r="12" fill="#6fbf3d"/>
        <circle cx="40" cy="30" r="12" fill="#5aa832"/>
        <circle cx="32" cy="20" r="13" fill="#7fd24d"/>
        <circle cx="18" cy="54" r="3" fill="#e05a4e"/>
        <circle cx="46" cy="54" r="3" fill="#ffd23f"/>
      </svg>`,
    },
    {
      name: "חווה",
      baseCost: 14000,
      svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <polygon points="10,28 32,10 54,28" fill="#8a3c30" stroke="#5c2018" stroke-width="2"/>
        <rect x="12" y="28" width="40" height="24" fill="#c0453a" stroke="#5c2018" stroke-width="2"/>
        <rect x="27" y="34" width="10" height="18" fill="#f2e6c8" stroke="#5c2018" stroke-width="1.5"/>
        <line x1="27" y1="34" x2="37" y2="52" stroke="#5c2018" stroke-width="1.5"/>
        <line x1="37" y1="34" x2="27" y2="52" stroke="#5c2018" stroke-width="1.5"/>
        <circle cx="45" cy="38" r="4" fill="#f2e6c8" stroke="#5c2018" stroke-width="1.5"/>
      </svg>`,
    },
    {
      name: "מקדש",
      baseCost: 35000,
      svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="30" width="32" height="26" fill="#f7f0dc" stroke="#8a5a2a" stroke-width="2"/>
        <polygon points="16,30 32,16 48,30" fill="#8a97a3" stroke="#5c6672" stroke-width="2"/>
        <rect x="27" y="6" width="10" height="12" fill="#8a97a3" stroke="#5c6672" stroke-width="2"/>
        <polygon points="27,6 32,0 37,6" fill="#5c6672"/>
        <rect x="30" y="2" width="4" height="10" fill="#d99400"/>
        <rect x="27" y="5" width="10" height="4" fill="#d99400"/>
        <path d="M27,42 a5,5 0 0 1 10,0 v14 h-10 z" fill="#bcd8ea" stroke="#5c6672" stroke-width="1.5"/>
      </svg>`,
    },
    {
      name: "טירה",
      baseCost: 90000,
      svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="30" width="36" height="26" fill="#9aa7ad" stroke="#5c6672" stroke-width="2"/>
        <rect x="12" y="18" width="10" height="14" fill="#9aa7ad" stroke="#5c6672" stroke-width="2"/>
        <rect x="42" y="18" width="10" height="14" fill="#9aa7ad" stroke="#5c6672" stroke-width="2"/>
        <polygon points="12,18 17,8 22,18" fill="#c0453a" stroke="#5c6672" stroke-width="2"/>
        <polygon points="42,18 47,8 52,18" fill="#c0453a" stroke="#5c6672" stroke-width="2"/>
        <rect x="27" y="38" width="10" height="18" fill="#4a2c14"/>
        <rect x="27" y="24" width="6" height="6" fill="#5c6672"/>
        <rect x="37" y="24" width="6" height="6" fill="#5c6672"/>
        <rect x="30" y="4" width="3" height="10" fill="#7a4e00"/>
        <polygon points="33,4 42,7 33,10" fill="#e05a4e"/>
      </svg>`,
    },
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

  const RIVAL_NAMES = [
    "דני", "נועה", "יוסי", "מיכל", "אורי", "שירה",
    "רון", "טל", "גיא", "ליאור", "אביב", "הדר",
  ];

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
  const resetBtn = document.getElementById("resetBtn");
  const reelEls = [
    document.getElementById("reel0"),
    document.getElementById("reel1"),
    document.getElementById("reel2"),
  ];
  const visitOverlay = document.getElementById("visitOverlay");
  const visitTitle = document.getElementById("visitTitle");
  const visitBuildingIcon = document.getElementById("visitBuildingIcon");
  const visitBuildingName = document.getElementById("visitBuildingName");
  const visitResult = document.getElementById("visitResult");
  const visitActionBtn = document.getElementById("visitActionBtn");
  const visitReturnBtn = document.getElementById("visitReturnBtn");

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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // storage unavailable (e.g. private browsing / restricted preview) - game still playable in-session
    }
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

      const stars = document.createElement("div");
      stars.className = "card-stars";
      stars.textContent = "⭐".repeat(lvl) + "☆".repeat(MAX_BUILDING_LEVEL - lvl);

      const icon = document.createElement("div");
      icon.className = "building-icon";
      icon.innerHTML = b.svg;

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

      card.append(stars, icon, name, level, upgradeBtn);
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
          setTimeout(() => {
            if (outcome.type === "attack" || outcome.type === "raid") {
              openVisit(outcome);
            } else {
              resolveOutcome(outcome);
            }
          }, 200);
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

    showFloatingText(`+${formatNumber(reward.coins)} 🪙`, "#ffc93c");
    showResultBanner(messageFor(outcome.type, reward));

    spinning = false;
    saveState();
    render();
  }

  // ---------- Visiting another player's village ----------
  function randomRival() {
    const name = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];
    const villageNum = 1 + Math.floor(Math.random() * 6);
    const building = BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)];
    const fakeLevel = Math.floor(Math.random() * (MAX_BUILDING_LEVEL + 1));
    return { name, villageNum, building, fakeLevel };
  }

  function openVisit(outcome) {
    const rival = randomRival();
    const reward = computeReward(outcome.type, state.village);

    visitOverlay.dataset.mode = outcome.type;
    visitTitle.textContent = `מבקר/ת בכפר של ${rival.name} - כפר ${rival.villageNum}`;
    visitBuildingIcon.innerHTML = rival.building.svg;
    visitBuildingIcon.classList.remove("smashed");
    visitBuildingName.textContent = `${rival.building.name} (רמה ${rival.fakeLevel}/${MAX_BUILDING_LEVEL})`;
    visitResult.textContent = "";
    visitResult.classList.remove("show");
    visitActionBtn.hidden = false;
    visitActionBtn.disabled = false;
    visitActionBtn.textContent = outcome.type === "attack" ? "🔨 תקוף ושבור!" : "🐷 חפור אוצר!";
    visitReturnBtn.hidden = true;

    visitActionBtn.onclick = () => performVisitAction(outcome, rival, reward);

    visitOverlay.classList.add("show");
  }

  function performVisitAction(outcome, rival, reward) {
    visitActionBtn.disabled = true;
    visitBuildingIcon.classList.add("smashed");

    setTimeout(() => {
      state.coins += reward.coins;
      if (reward.extraSpin) {
        state.spins = Math.min(MAX_SPINS, state.spins + reward.extraSpin);
      }
      saveState();

      const message =
        outcome.type === "attack"
          ? `💥 שברת את ה${rival.building.name} של ${rival.name} וגנבת ${formatNumber(reward.coins)} מטבעות!`
          : `⛏️ מצאת מטמון חבוי בכפר של ${rival.name}! +${formatNumber(reward.coins)} מטבעות!`;
      visitResult.textContent = message;
      visitResult.classList.add("show");
      visitActionBtn.hidden = true;
      visitReturnBtn.hidden = false;
    }, 500);
  }

  function closeVisit() {
    visitOverlay.classList.remove("show");
    spinning = false;
    render();
  }

  function resetGame() {
    if (!confirm("לאפס את כל ההתקדמות במשחק?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // storage unavailable - ignore, in-memory state is reset below regardless
    }
    state = defaultState();
    saveState();
    render();
  }

  // ---------- Init ----------
  spinBtn.addEventListener("click", spin);
  nextVillageBtn.addEventListener("click", goToNextVillage);
  resetBtn.addEventListener("click", resetGame);
  visitReturnBtn.addEventListener("click", closeVisit);

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
