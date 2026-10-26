// ================== البيانات (شخصيات + صور) ==================
const CHARACTERS = [
  { name: "هاري بوتر", image: "images/harry-potter.jpg" },
  { name: "هيرميون جرينجر", image: "images/hermione-granger.jpg" },
  { name: "رون ويزلي", image: "images/ron-weasley.jpg" },
  { name: "ألبوس دامبلدور", image: "images/albus-dumbledore.jpg" },
  { name: "سيفيروس سنيب", image: "images/severus-snape.jpg" },
  { name: "دراكو مالفوي", image: "images/draco-malfoy.jpg" },
  { name: "فولدمورت", image: "images/voldemort.jpg" },
  { name: "روبيهاجريد", image: "images/rubeus-hagrid.jpg" },
  { name: "سيريوس بلاك", image: "images/sirius-black.jpg" },
  { name: "ريموس لوبين", image: "images/remus-lupin.jpg" },
  { name: "جيني ويزلي", image: "images/ginny-weasley.jpg" },
  { name: "نيفيل لونجبوتوم", image: "images/neville-longbottom.jpg" },
  { name: "لونا لوفجود", image: "images/luna-lovegood.jpg" },
  { name: "سيدريك ديجوري", image: "images/cedric-diggory.jpg" },
  { name: "بيلاتريكس لسترانج", image: "images/bellatrix-lestrange.jpg" },
  { name: "لوسيوس مالفوي", image: "images/lucius-malfoy.jpg" },
  { name: "مينيرفا ماكجوناجل", image: "images/minerva-mcgonagall.jpg" },
  { name: "دوبي", image: "images/dobby.jpg" },
  { name: "جورج وفريد ويزلي", image: "images/george-weasley.jpg" },
  { name: "أرثر ويزلي", image: "images/arthur-weasley.jpg" },
  { name: "مولي ويزلي", image: "images/molly-weasley.jpg" },
  { name: "توم ريدل", image: "images/tom-riddle.jpg" },
  { name: "بيتر بيتيجرو", image: "images/peter-pettigrew.jpg" },
  { name: "دولوريس أمبريدج", image: "images/dolores-umbridge.jpg" },
  { name: "تشو تشانج", image: "images/cho-chang.jpg" },
  { name: "كينجزلي شاكلبولت", image: "images/kingsley-shacklebolt.jpg" },
  { name: "ريتا سكيتر", image: "images/rita-skeeter.jpg" },
  { name: "هوراس سلجهورن", image: "images/Horace-Slughorn.jpg" },
  { name: "باتيلدا باجشوت", image: "images/Bathilda-Bagshot.jpg" },
  { name: "لافندر براون", image: "images/Lavender-Brown.jpg" },
  { name: "كولين كريفي", image: "images/Colin-Creevey.jpg" },
  { name: "اريانا دمبلدور", image: "images/Ariana-Dumbledore.jpg" },
  { name: "ابرفورث دمبلدور", image: "images/Aberforth-Dumbledore.jpg" },
  { name: "ارجوس فليتش", image: "images/Argus-Filch.jpg" },
  { name: "فيكتور كرام", image: "images/Viktor-Krum.jpg" },
  { name: "ألاستر مودي", image: "images/Alastor-Mad-Eye-Moody.jpg" },
  { name: "سكابيور", image: "images/Scabior.jpg" },
];

const WRONG_GUESS_PENALTY = 1;

// ================== الحالة ==================
const state = {
  playerNames: ["", ""],
  cards: [null, null],
  currentTurn: 0,
  questionsLeft: [10, 10],
  gameOver: false,
  revealIndex: 0,
  revealPhase: "cover",
};

// ================== أدوات ==================
const $ = (id) => document.getElementById(id);

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(str) {
  return str.trim().replace(/\s+/g, " ").toLowerCase();
}

// تعيين صورة مع fallback تلقائي
function setCardImage(imgId, initialId, card) {
  const img = $(imgId);
  const initial = $(initialId);

  initial.textContent = card.name.charAt(0);
  img.style.display = "block"; // إعادة إظهار في حال كانت مخفية
  img.onerror = () => {
    img.style.display = "none";
  }; // لو فشل التحميل
  img.src = card.image;
}

// ================== بدء اللعبة ==================
$("btn-start").addEventListener("click", startGame);

function startGame() {
  const p1 = $("input-p1").value.trim();
  const p2 = $("input-p2").value.trim();

  if (!p1 || !p2) {
    alert("اكتب أسماء اللاعبين الأول!");
    return;
  }
  if (p1 === p2) {
    alert("الأسماء لازم تكون مختلفة!");
    return;
  }

  state.playerNames = [p1, p2];

  const shuffled = shuffle(CHARACTERS);
  state.cards = [shuffled[0], shuffled[1]];

  state.revealIndex = 0;
  state.revealPhase = "cover";
  updateRevealScreen();
  showScreen("screen-reveal");
}

// ================== شاشة الكشف ==================
function updateRevealScreen() {
  const idx = state.revealIndex;
  $("reveal-player-name").textContent = state.playerNames[idx];

  if (state.revealPhase === "cover") {
    $("reveal-cover").hidden = false;
    $("reveal-card").hidden = true;
  } else {
    $("reveal-cover").hidden = true;
    $("reveal-card").hidden = false;
    const card = state.cards[idx];
    $("reveal-name").textContent = card.name;
    setCardImage("reveal-image", "reveal-initial", card);
  }

  const btn = $("btn-hide-card");
  btn.textContent = idx === 0 ? "حفظتها — التالي" : "حفظتها — ابدأ اللعب";
}

$("btn-show-card").addEventListener("click", () => {
  state.revealPhase = "card";
  updateRevealScreen();
});

$("btn-hide-card").addEventListener("click", () => {
  if (state.revealIndex === 0) {
    state.revealIndex = 1;
    state.revealPhase = "cover";
    updateRevealScreen();
  } else {
    startGameplay();
  }
});

// ================== بدء اللعب ==================
function startGameplay() {
  state.currentTurn = Math.floor(Math.random() * 2);
  state.questionsLeft = [10, 10];
  state.gameOver = false;
  updateGameScreen();
}

function updateGameScreen() {
  const turn = state.currentTurn;
  const other = 1 - turn;

  $("game-turn-name").textContent = state.playerNames[turn];
  $("game-other-name").textContent = state.playerNames[other];
  $("q-label-1").textContent = state.playerNames[0];
  $("q-label-2").textContent = state.playerNames[1];
  $("q-count-1").textContent = state.questionsLeft[0];
  $("q-count-2").textContent = state.questionsLeft[1];

  $("q-box-1").classList.toggle("active", turn === 0);
  $("q-box-2").classList.toggle("active", turn === 1);

  $("peek-overlay").hidden = true;

  if (state.questionsLeft[turn] === 0 && !state.gameOver) {
    openGuessScreen();
    return;
  }

  const btnAsked = $("btn-asked");
  btnAsked.disabled = false;
  btnAsked.textContent = "سألت سؤال";
  $("warning-text").hidden = true;

  showScreen("screen-game");
}

// ================== زر "سألت سؤال" ==================
$("btn-asked").addEventListener("click", () => {
  const turn = state.currentTurn;
  if (state.questionsLeft[turn] <= 0) return;

  state.questionsLeft[turn]--;
  state.currentTurn = 1 - turn;
  updateGameScreen();
});

// ================== فتح شاشة التخمين ==================
function openGuessScreen() {
  const turn = state.currentTurn;
  const other = 1 - turn;

  $("guess-title").textContent = `${state.playerNames[turn]} بيخمن`;
  $("guess-other-name").textContent = state.playerNames[other];
  $("guess-input").value = "";

  const options = $("guess-options");
  options.innerHTML = "";
  CHARACTERS.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.name;
    options.appendChild(opt);
  });

  $("btn-back-to-game").hidden = state.questionsLeft[turn] === 0;

  if (state.questionsLeft[turn] === 0) {
    $("guess-title").textContent = `${state.playerNames[turn]} — آخر فرصة!`;
  }

  showScreen("screen-guess");
}

$("btn-guess").addEventListener("click", openGuessScreen);

$("btn-back-to-game").addEventListener("click", () => {
  showScreen("screen-game");
});

// ================== التحقق من التخمين ==================
$("btn-submit-guess").addEventListener("click", () => {
  const guess = $("guess-input").value.trim();
  if (!guess) {
    alert("اكتب تخمينك الأول!");
    return;
  }

  const turn = state.currentTurn;
  const other = 1 - turn;
  const correctCard = state.cards[other];
  const isForced = state.questionsLeft[turn] === 0;

  if (normalize(guess) === normalize(correctCard.name)) {
    endGame(turn, "correct");
    return;
  }

  if (isForced) {
    endGame(other, "forced_wrong");
    return;
  }

  state.questionsLeft[turn] = Math.max(
    0,
    state.questionsLeft[turn] - WRONG_GUESS_PENALTY
  );

  alert(
    `غلط!\n` +
      `خسرت ${WRONG_GUESS_PENALTY} سؤال.\n` +
      `فاضلك ${state.questionsLeft[turn]} سؤال.`
  );

  state.currentTurn = other;
  updateGameScreen();
});

// ================== نهاية اللعبة ==================
function endGame(winnerIndex, reason) {
  state.gameOver = true;

  $("end-title").textContent = `${state.playerNames[winnerIndex]} كسب!`;

  if (reason === "correct") {
    $("end-subtitle").textContent = "عرف شخصية صاحبه صح!";
  } else if (reason === "forced_wrong") {
    $("end-subtitle").textContent = "خصمه خمّن غلط ومفيش عنده أسئلة تانية!";
  } else {
    $("end-subtitle").textContent = "التاني خمّن غلط، فكسب هو تلقائياً!";
  }

  // اللاعب الأول
  $("final-p1-name").textContent = state.playerNames[0];
  $("final-p1-card").textContent = state.cards[0].name;
  setCardImage("final-p1-image", "final-p1-initial", state.cards[0]);

  // اللاعب الثاني
  $("final-p2-name").textContent = state.playerNames[1];
  $("final-p2-card").textContent = state.cards[1].name;
  setCardImage("final-p2-image", "final-p2-initial", state.cards[1]);

  showScreen("screen-end");
}

$("btn-restart").addEventListener("click", () => {
  showScreen("screen-setup");
});

// ================== نظرة سريعة على البطاقة ==================
$("btn-peek").addEventListener("click", () => {
  const turn = state.currentTurn;
  const card = state.cards[turn];
  $("peek-name").textContent = card.name;
  setCardImage("peek-image", "peek-initial", card);
  $("peek-overlay").hidden = false;
});

$("btn-close-peek").addEventListener("click", () => {
  $("peek-overlay").hidden = true;
});
