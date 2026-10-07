/* ======================================================
   CONFIGURAÇÃO - edite aqui com os dados reais
   ====================================================== */
const CONFIG = {
  herName: "Isabella",              // nome ou apelido dela
  question: "quer sair comigo?",   // pergunta principal
  finalMessage: "Mal posso esperar! Vai ser incrível 💕", // mensagem da tela final
  whatsappNumber: "5563999717378", // número que recebe a mensagem (DDI 55 + DDD 63 + número)
};

const TEASES = [
  "Tenta de novo 😏",
  "Quase! Mas não foi 😅",
  "Esse botão não quer ser clicado...",
  "Pensa bem, hein 👀",
  "Vai, clica no Sim 🙈",
  "O Não tá fugindo de propósito 😂",
  "Impossível clicar nisso!",
];

/* ======================================================
   Estado
   ====================================================== */
const state = {
  selectedDate: null,
  selectedOption: null,
  calendarMonth: new Date().getMonth(),
  calendarYear: new Date().getFullYear(),
  teaseIndex: 0,
  noAttempts: 0,
};

const DATE_OPTIONS = [
  { id: "restaurante", label: "Restaurante", emoji: "🍽️" },
  { id: "barzinho", label: "Barzinho", emoji: "🍻" },
  { id: "sushi", label: "Sushi", emoji: "🍣" },
  { id: "pizzaria", label: "Pizzaria", emoji: "🍕" },
  { id: "cinema", label: "Cinema", emoji: "🎬" },
  { id: "cafe", label: "Café", emoji: "☕" },
  { id: "sorveteria", label: "Sorveteria", emoji: "🍦" },
  { id: "passeio", label: "Passeio ao ar livre", emoji: "🌳" },
  { id: "surpresa", label: "Surpresa (você escolhe)", emoji: "🎁" },
];

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/* ======================================================
   Inicialização
   ====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("questionTitle").textContent = `${CONFIG.herName}, ${CONFIG.question}`;
  document.getElementById("questionSubtitle").textContent = "É só responder com sinceridade... só tem uma opção certa 😉";

  buildHeartsBackground();
  setupQuestionScreen();
  setupCalendar();
  setupOptions();
  setupShare();
  setupRestart();
});

/* ======================================================
   Fundo de corações flutuando
   ====================================================== */
function buildHeartsBackground() {
  const container = document.getElementById("heartsBg");
  const symbols = ["❤️", "💕", "💖", "💗"];
  const count = 18;
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    span.style.left = `${Math.random() * 100}%`;
    span.style.fontSize = `${1 + Math.random() * 1.6}rem`;
    const duration = 8 + Math.random() * 10;
    span.style.animationDuration = `${duration}s`;
    span.style.animationDelay = `${Math.random() * duration}s`;
    container.appendChild(span);
  }
}

/* ======================================================
   Tela 1: Sim / Não
   ====================================================== */
function setupQuestionScreen() {
  const btnYes = document.getElementById("btnYes");
  const btnNo = document.getElementById("btnNo");
  const teaseEl = document.getElementById("teaseText");

  btnYes.addEventListener("click", () => {
    showScreen("screen-calendar");
  });

  // ---- lógica de fuga do botão "Não" ----
  const FLEE_DISTANCE = 110; // raio em px que ativa a fuga
  const HOP_MIN = 90; // distância mínima do "salto" de fuga
  const HOP_MAX = 160; // distância máxima do "salto" de fuga
  const MARGIN = 20; // distância mínima da borda da tela

  function moveButtonAwayFrom(pointerX, pointerY) {
    const rect = btnNo.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (!btnNo.classList.contains("fleeing")) {
      btnNo.classList.add("fleeing");
      btnNo.style.left = `${rect.left}px`;
      btnNo.style.top = `${rect.top}px`;
    }

    const curCx = rect.left + w / 2;
    const curCy = rect.top + h / 2;

    const minCx = MARGIN + w / 2;
    const maxCx = window.innerWidth - MARGIN - w / 2;
    const minCy = MARGIN + h / 2;
    const maxCy = window.innerHeight - MARGIN - h / 2;

    const hop = HOP_MIN + Math.random() * (HOP_MAX - HOP_MIN);
    const baseAngle = Math.atan2(curCy - pointerY, curCx - pointerX);

    // testa várias direções (não só a oposta ao mouse) e fica com a que
    // deixa o botão mais longe do ponteiro depois de ajustado pras bordas,
    // assim ele não fica preso em cantos
    let best = null;
    const candidateCount = 14;
    for (let i = 0; i < candidateCount; i++) {
      const angle = baseAngle + (i / candidateCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      let cx = curCx + Math.cos(angle) * hop;
      let cy = curCy + Math.sin(angle) * hop;
      cx = Math.min(Math.max(cx, minCx), maxCx);
      cy = Math.min(Math.max(cy, minCy), maxCy);

      const d = distance(cx, cy, pointerX, pointerY);
      if (!best || d > best.d) {
        best = { cx, cy, d };
      }
    }

    btnNo.style.left = `${best.cx - w / 2}px`;
    btnNo.style.top = `${best.cy - h / 2}px`;

    state.noAttempts++;
    showTease();
    growYesButton();
  }

  function checkPointer(x, y) {
    const rect = btnNo.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (distance(x, y, cx, cy) < FLEE_DISTANCE) {
      moveButtonAwayFrom(x, y);
    }
  }

  document.addEventListener("mousemove", (e) => {
    if (!isScreenActive("screen-question")) return;
    checkPointer(e.clientX, e.clientY);
  });

  document.addEventListener(
    "touchstart",
    (e) => {
      if (!isScreenActive("screen-question")) return;
      const t = e.touches[0];
      checkPointer(t.clientX, t.clientY);
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!isScreenActive("screen-question")) return;
      const t = e.touches[0];
      checkPointer(t.clientX, t.clientY);
    },
    { passive: true }
  );

  function showTease() {
    teaseEl.style.opacity = 0;
    setTimeout(() => {
      teaseEl.textContent = TEASES[state.teaseIndex % TEASES.length];
      state.teaseIndex++;
      teaseEl.style.opacity = 1;
    }, 120);
  }

  function growYesButton() {
    const scale = Math.min(1.5, 1 + state.noAttempts * 0.04);
    btnYes.style.transform = `scale(${scale})`;
  }
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

/* ======================================================
   Tela 2: Calendário
   ====================================================== */
function setupCalendar() {
  document.getElementById("prevMonth").addEventListener("click", () => {
    changeMonth(-1);
  });
  document.getElementById("nextMonth").addEventListener("click", () => {
    changeMonth(1);
  });

  const weekdaysEl = document.getElementById("calWeekdays");
  WEEKDAYS.forEach((d) => {
    const el = document.createElement("span");
    el.textContent = d;
    weekdaysEl.appendChild(el);
  });

  renderCalendar();
}

function changeMonth(delta) {
  state.calendarMonth += delta;
  if (state.calendarMonth > 11) {
    state.calendarMonth = 0;
    state.calendarYear++;
  } else if (state.calendarMonth < 0) {
    state.calendarMonth = 11;
    state.calendarYear--;
  }
  renderCalendar();
}

function renderCalendar() {
  const label = document.getElementById("calMonthLabel");
  label.textContent = `${MONTH_NAMES[state.calendarMonth]} ${state.calendarYear}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCurrentMonth =
    state.calendarYear === today.getFullYear() && state.calendarMonth === today.getMonth();
  document.getElementById("prevMonth").disabled = isCurrentMonth;

  const grid = document.getElementById("calGrid");
  grid.innerHTML = "";

  const firstDay = new Date(state.calendarYear, state.calendarMonth, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(state.calendarYear, state.calendarMonth + 1, 0).getDate();

  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "cal-day";
    cell.textContent = day;

    const cellDate = new Date(state.calendarYear, state.calendarMonth, day);
    cellDate.setHours(0, 0, 0, 0);

    if (cellDate < today) {
      cell.classList.add("disabled");
    } else {
      cell.addEventListener("click", () => selectDate(cellDate, cell));
    }

    if (
      state.selectedDate &&
      cellDate.getTime() === state.selectedDate.getTime()
    ) {
      cell.classList.add("selected");
    }

    grid.appendChild(cell);
  }
}

function selectDate(date, cellEl) {
  document.querySelectorAll(".cal-day.selected").forEach((c) => c.classList.remove("selected"));
  cellEl.classList.add("selected");
  state.selectedDate = date;

  setTimeout(() => {
    showScreen("screen-type");
  }, 450);
}

/* ======================================================
   Tela 3: Tipo de date
   ====================================================== */
function setupOptions() {
  const grid = document.getElementById("optionsGrid");
  DATE_OPTIONS.forEach((opt) => {
    const card = document.createElement("div");
    card.className = "option-card";
    card.innerHTML = `<span class="option-emoji">${opt.emoji}</span><span class="option-label">${opt.label}</span>`;
    card.addEventListener("click", () => selectOption(opt, card));
    grid.appendChild(card);
  });
}

function selectOption(opt, cardEl) {
  document.querySelectorAll(".option-card.selected").forEach((c) => c.classList.remove("selected"));
  cardEl.classList.add("selected");
  state.selectedOption = opt;

  setTimeout(() => {
    showFinalScreen();
    showScreen("screen-final");
  }, 450);
}

/* ======================================================
   Tela 4: Final
   ====================================================== */
function showFinalScreen() {
  const dateStr = state.selectedDate
    ? state.selectedDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  document.getElementById("summaryText").textContent =
    `📅 ${capitalize(dateStr)}  —  ${state.selectedOption.emoji} ${state.selectedOption.label}`;
  document.getElementById("finalMessage").textContent = CONFIG.finalMessage;

  launchConfetti();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ======================================================
   Compartilhar no WhatsApp
   ====================================================== */
function setupShare() {
  document.getElementById("btnShare").addEventListener("click", () => {
    const dateStr = state.selectedDate
      ? state.selectedDate.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      : "";

    const text =
      `Combinado! 🎉💕 Vou sair com você dia ${dateStr}` +
      (state.selectedOption ? ` — ${state.selectedOption.emoji} ${state.selectedOption.label}` : "") +
      `. Mal posso esperar!`;

    const encoded = encodeURIComponent(text);
    const base = CONFIG.whatsappNumber
      ? `https://wa.me/${CONFIG.whatsappNumber}`
      : `https://api.whatsapp.com/send`;
    const url = `${base}?text=${encoded}`;

    window.open(url, "_blank");
  });
}

/* ======================================================
   Reiniciar
   ====================================================== */
function setupRestart() {
  document.getElementById("btnRestart").addEventListener("click", () => {
    state.selectedDate = null;
    state.selectedOption = null;
    state.noAttempts = 0;

    const btnNo = document.getElementById("btnNo");
    btnNo.classList.remove("fleeing");
    btnNo.style.left = "";
    btnNo.style.top = "";
    document.getElementById("teaseText").textContent = "";
    document.getElementById("btnYes").style.transform = "";

    document.querySelectorAll(".option-card.selected").forEach((c) => c.classList.remove("selected"));

    renderCalendar();
    showScreen("screen-question");
  });
}

/* ======================================================
   Utilidades de tela
   ====================================================== */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function isScreenActive(id) {
  return document.getElementById(id).classList.contains("active");
}

/* ======================================================
   Confete (canvas, sem dependências externas)
   ====================================================== */
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#ff6f91", "#ff9a9e", "#ff4d6d", "#ffd166", "#06d6a0", "#4fdc8c"];
  const pieces = [];
  const count = 140;

  for (let i = 0; i < count; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 2 + Math.random() * 3,
      speedX: -1.5 + Math.random() * 3,
      rotation: Math.random() * 360,
      rotationSpeed: -6 + Math.random() * 12,
    });
  }

  let frame = 0;
  const maxFrames = 220;

  function tick() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });

    if (frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  tick();
}

window.addEventListener("resize", () => {
  const canvas = document.getElementById("confettiCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
