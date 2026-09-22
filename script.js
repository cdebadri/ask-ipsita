(function () {
  "use strict";

  // ---------- Email notification (EmailJS) ----------
  const EMAILJS_PUBLIC_KEY = "qbfAuZtNEQ_c2fCXK";
  const EMAILJS_SERVICE_ID = "service_nftzi39";
  const EMAILJS_TEMPLATE_ID = "template_2pdx1xq";
  const NOTIFY_EMAIL = "delta.charlie7777@gmail.com";

  if (window.emailjs) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  function sendDateNotification(params) {
    if (!window.emailjs) return;
    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
      .catch((err) => console.error("EmailJS send failed:", err));
  }

  // ---------- Stage management ----------
  const stages = {
    ask: document.getElementById("stage-ask"),
    gauntlet: document.getElementById("stage-gauntlet"),
    final: document.getElementById("stage-final"),
    yes: document.getElementById("stage-yes"),
    plan: document.getElementById("stage-plan"),
    confirm: document.getElementById("stage-confirm"),
  };

  function showStage(name) {
    Object.values(stages).forEach((s) => s.classList.remove("active"));
    stages[name].classList.add("active");
  }

  // ---------- Floating hearts background ----------
  const heartEmojis = ["💗", "💖", "💕", "💘", "✨"];
  const bgHearts = document.getElementById("bgHearts");

  function spawnHeart() {
    const el = document.createElement("span");
    el.className = "heart";
    el.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
    const duration = 8 + Math.random() * 8;
    el.style.animationDuration = duration + "s";
    el.style.fontSize = (14 + Math.random() * 18) + "px";
    bgHearts.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000);
  }
  setInterval(spawnHeart, 700);
  for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 300);

  // ---------- Confetti ----------
  const confettiColors = ["#ff6fa5", "#a86bff", "#29c46f", "#ffd166", "#6fd4ff"];
  function burstConfetti(count, canvasId) {
    const canvas = document.getElementById(canvasId || "confettiCanvas");
    if (!canvas) return;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.width = 6 + Math.random() * 6 + "px";
      piece.style.height = 10 + Math.random() * 10 + "px";
      piece.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const duration = 2.5 + Math.random() * 2;
      piece.style.animationDuration = duration + "s";
      piece.style.animationDelay = Math.random() * 0.6 + "s";
      canvas.appendChild(piece);
      setTimeout(() => piece.remove(), (duration + 1) * 1000);
    }
  }

  function goToYesStage() {
    showStage("yes");
    stopRoaming(noBtn);
    stopRoaming(noBtn2);
    burstConfetti(120);
    setInterval(() => burstConfetti(20), 3000);
  }

  // ---------- Stage 1: the ask, with an evasive "No" ----------
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const buttonRow = document.getElementById("buttonRow");
  const dodgeCounter = document.getElementById("dodgeCounter");
  const taunt = document.getElementById("taunt");

  const taunts = [
    "Nope, try again 😏",
    "That button is shy.",
    "It ran away!",
    "You'll have to be quicker than that.",
    "The 'No' button doesn't believe in itself.",
    "Access denied. 🚫",
    "It's not you, it's the button.",
    "Statistically improbable.",
  ];

  let dodgeCount = 0;
  const DODGE_LIMIT = 5;
  let noSize = 1;
  const activeDecoys = [];

  function randomPointInViewport(margin) {
    const vv = window.visualViewport;
    const w = vv ? vv.width : window.innerWidth;
    const h = vv ? vv.height : window.innerHeight;
    const marginX = Math.min(margin, w / 2 - 10);
    const marginY = Math.min(margin, h / 2 - 10);
    const x = marginX + Math.random() * (w - marginX * 2);
    const y = marginY + Math.random() * (h - marginY * 2);
    return { x, y };
  }

  function fleeButton(btn) {
    btn.classList.add("fleeing");
    const rect = btn.getBoundingClientRect();
    const pt = randomPointInViewport(60);
    btn.style.left = (pt.x - rect.width / 2) + "px";
    btn.style.top = (pt.y - rect.height / 2) + "px";
    btn.classList.remove("dart");
    void btn.offsetWidth; // restart the dart animation on every flee
    btn.classList.add("dart");
    clearTimeout(btn._dartTimeout);
    btn._dartTimeout = setTimeout(() => btn.classList.remove("dart"), 420);
  }

  function startRoaming(btn, isStillActive) {
    if (btn._roamInterval) return;
    btn._roamInterval = setInterval(() => {
      if (!isStillActive()) {
        clearInterval(btn._roamInterval);
        btn._roamInterval = null;
        return;
      }
      fleeButton(btn);
    }, 1300);
  }

  function stopRoaming(btn) {
    if (btn._roamInterval) {
      clearInterval(btn._roamInterval);
      btn._roamInterval = null;
    }
  }

  function growYes() {
    const scale = Math.min(1 + dodgeCount * 0.16, 2.4);
    yesBtn.style.transform = `scale(${scale})`;
  }

  function shrinkNo() {
    noSize = Math.max(1 - dodgeCount * 0.12, 0.35);
    noBtn.style.fontSize = (1.15 * noSize) + "rem";
    noBtn.style.opacity = Math.max(1 - dodgeCount * 0.12, 0.4);
  }

  function updateTaunt() {
    taunt.textContent = taunts[Math.min(dodgeCount - 1, taunts.length - 1)];
  }

  function updateCounter() {
    dodgeCounter.textContent = dodgeCount > 0
      ? `"No" has escaped ${dodgeCount} time${dodgeCount > 1 ? "s" : ""}.`
      : "";
  }

  function spawnDecoy() {
    const decoy = document.createElement("button");
    decoy.className = "btn no decoy-no";
    decoy.textContent = ["Nah", "Nope", "Not really", "Meh"][Math.floor(Math.random() * 4)];
    decoy.style.fontSize = "0.85rem";
    decoy.style.padding = "10px 18px";
    const pt = randomPointInViewport(60);
    decoy.style.position = "fixed";
    decoy.style.left = pt.x + "px";
    decoy.style.top = pt.y + "px";
    decoy.style.zIndex = 45;
    document.body.appendChild(decoy);
    activeDecoys.push(decoy);

    const vanish = () => {
      taunt.textContent = "Nice try. That one was a decoy. 🎭";
      const i = activeDecoys.indexOf(decoy);
      if (i !== -1) activeDecoys.splice(i, 1);
      decoy.remove();
    };
    decoy._vanish = vanish;
    decoy.addEventListener("mouseenter", vanish);
    decoy.addEventListener("click", (e) => {
      e.preventDefault();
      vanish();
    });
    decoy.addEventListener("touchstart", (e) => {
      e.preventDefault();
      vanish();
    });

    setTimeout(() => {
      const i = activeDecoys.indexOf(decoy);
      if (i !== -1) activeDecoys.splice(i, 1);
      decoy.remove();
    }, 4000);
  }

  function registerDodge() {
    dodgeCount++;
    growYes();
    shrinkNo();
    updateTaunt();
    updateCounter();
    fleeButton(noBtn);
    startRoaming(noBtn, () => dodgeCount < DODGE_LIMIT && stages.ask.classList.contains("active"));

    if (dodgeCount === 2 || dodgeCount === 4) {
      spawnDecoy();
    }

    if (dodgeCount >= DODGE_LIMIT) {
      stopRoaming(noBtn);
      setTimeout(() => {
        showStage("gauntlet");
      }, 350);
    }
  }

  noBtn.addEventListener("mouseenter", (e) => {
    e.preventDefault();
    registerDodge();
  });
  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    registerDodge();
  });
  noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    registerDodge();
  });

  yesBtn.addEventListener("click", goToYesStage);

  // ---------- Stage 2: gauntlet (spin the wheel) ----------
  const wheel = document.getElementById("wheel");
  const spinBtn = document.getElementById("spinBtn");
  const wheelResult = document.getElementById("wheelResult");
  const wheelLabels = ["Yes", "Definitely", "Of course", "Absolutely", "100%", "Sure thing", "Heck yes", "Why not"];
  let spun = false;

  spinBtn.addEventListener("click", () => {
    if (spun) return;
    spun = true;
    spinBtn.disabled = true;

    const extraSpins = 6; // full rotations
    const landingIndex = Math.floor(Math.random() * wheelLabels.length);
    const sliceDeg = 360 / wheelLabels.length;
    const finalDeg = extraSpins * 360 + landingIndex * sliceDeg;

    wheel.style.transform = `rotate(${finalDeg}deg)`;

    setTimeout(() => {
      wheelResult.textContent = `The wheel says: "${wheelLabels[landingIndex]}" 🎯`;
      setTimeout(() => {
        showStage("final");
      }, 1400);
    }, 4100);
  });

  // ---------- Stage 3: final boss ----------
  const yesBtn2 = document.getElementById("yesBtn2");
  const noBtn2 = document.getElementById("noBtn2");
  const confidenceEl = document.getElementById("confidence");

  let finalDodges = 0;
  const confidenceLevels = ["2%", "1%", "0.4%", "0.1%", "0.02%", "statistically zero"];

  function fleeFinalNo() {
    finalDodges++;
    const shrink = Math.max(1 - finalDodges * 0.18, 0.15);
    noBtn2.style.fontSize = (0.55 * shrink) + "rem";
    confidenceEl.textContent = confidenceLevels[Math.min(finalDodges, confidenceLevels.length - 1)];
    fleeButton(noBtn2);
    startRoaming(noBtn2, () => stages.final.classList.contains("active"));
  }

  noBtn2.addEventListener("mouseenter", (e) => {
    e.preventDefault();
    fleeFinalNo();
  });
  noBtn2.addEventListener("touchstart", (e) => {
    e.preventDefault();
    fleeFinalNo();
  });
  noBtn2.addEventListener("click", (e) => {
    e.preventDefault();
    fleeFinalNo();
  });

  yesBtn2.addEventListener("click", goToYesStage);

  // Reposition fleeing buttons safely if window resizes
  window.addEventListener("resize", () => {
    if (noBtn.classList.contains("fleeing")) fleeButton(noBtn);
    if (noBtn2.classList.contains("fleeing")) fleeButton(noBtn2);
  });

  // ---------- Touch proximity dodge ----------
  // Touchscreens have no hover, so a finger only ever "arrives" via touchstart,
  // right on top of the button — that alone would make the No button feel static
  // until actually touched. This watches touchmove and flees as a finger gets
  // close, so the evasive feel matches desktop mouse-hover behavior.
  const PROXIMITY_RADIUS = 60;
  const PROXIMITY_COOLDOWN = 500;
  let lastProximityFlee = 0;

  function isTouchNear(el, x, y) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(x - cx, y - cy);
    return dist < PROXIMITY_RADIUS + Math.max(rect.width, rect.height) / 2;
  }

  document.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      const now = Date.now();
      if (now - lastProximityFlee < PROXIMITY_COOLDOWN) return;

      if (stages.ask.classList.contains("active") && isTouchNear(noBtn, touch.clientX, touch.clientY)) {
        e.preventDefault();
        lastProximityFlee = now;
        registerDodge();
        return;
      }

      if (stages.final.classList.contains("active") && isTouchNear(noBtn2, touch.clientX, touch.clientY)) {
        e.preventDefault();
        lastProximityFlee = now;
        fleeFinalNo();
        return;
      }

      for (const decoy of activeDecoys.slice()) {
        if (document.body.contains(decoy) && isTouchNear(decoy, touch.clientX, touch.clientY)) {
          e.preventDefault();
          lastProximityFlee = now;
          decoy._vanish();
          break;
        }
      }
    },
    { passive: false }
  );

  // ---------- Stage 5: plan the date ----------
  const planBtn = document.getElementById("planBtn");
  const dateOptions = document.getElementById("dateOptions");
  const typeOptions = document.getElementById("typeOptions");
  const confirmPlanBtn = document.getElementById("confirmPlanBtn");
  const confirmSummary = document.getElementById("confirmSummary");
  const confirmInstructions = document.getElementById("confirmInstructions");
  const specialInstructions = document.getElementById("specialInstructions");

  const dateTypeLabels = {
    asian: "an Asian cuisine date 🥢",
    cafe: "a cafe and chill date ☕",
    surprise: "a surprise date 🎁",
  };

  let selectedDateKey = null;
  let selectedDateLabel = null;
  let selectedType = null;

  function populateDateOptions() {
    const weekends = DateUtils.getUpcomingWeekends(new Date());
    dateOptions.querySelectorAll(".option-card").forEach((card) => {
      const key = card.dataset.key;
      const date = weekends[key];
      const label = DateUtils.formatDate(date);
      card.querySelector('[data-field="date"]').textContent = label;
      card._dateLabel = label;
    });
  }

  function updateConfirmEnabled() {
    confirmPlanBtn.disabled = !(selectedDateKey && selectedType);
  }

  dateOptions.querySelectorAll(".option-card").forEach((card) => {
    card.addEventListener("click", () => {
      dateOptions.querySelectorAll(".option-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedDateKey = card.dataset.key;
      selectedDateLabel = card._dateLabel;
      updateConfirmEnabled();
    });
  });

  typeOptions.querySelectorAll(".option-card").forEach((card) => {
    card.addEventListener("click", () => {
      typeOptions.querySelectorAll(".option-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedType = card.dataset.type;
      updateConfirmEnabled();
    });
  });

  planBtn.addEventListener("click", () => {
    populateDateOptions();
    showStage("plan");
  });

  confirmPlanBtn.addEventListener("click", () => {
    if (confirmPlanBtn.disabled) return;
    const instructions = specialInstructions.value.trim();
    const summaryText = `We're locked in for ${dateTypeLabels[selectedType]} on ${selectedDateLabel}!`;
    confirmSummary.textContent = summaryText;
    confirmInstructions.textContent = instructions ? `Special instructions: ${instructions}` : "";
    showStage("confirm");
    burstConfetti(100, "confettiCanvas2");

    sendDateNotification({
      date: selectedDateLabel,
      date_type: dateTypeLabels[selectedType],
      summary: summaryText,
      instructions: instructions || "None",
      to_email: NOTIFY_EMAIL,
    });
  });
})();
