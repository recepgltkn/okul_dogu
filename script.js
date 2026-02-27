/* ================= FIREBASE ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  deleteUser as deleteAuthUser,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  increment,
  limit,
  serverTimestamp,
  where,
  getDocs,
  writeBatch,
  collectionGroup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdqw2UN55YmKT1AdkkrQ-QNZJ6qGdeP5k",
  authDomain: "okulportali.firebaseapp.com",
  projectId: "okulportali",
  storageBucket: "okulportali.firebasestorage.app",
  messagingSenderId: "375223980753",
  appId: "1:375223980753:web:67e2d4f6609ee4e7022bf0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);
const db = getFirestore(app);
const functions = getFunctions(app);
const deleteUserByAdmin = httpsCallable(functions, "deleteUserByAdmin");
const setUserPasswordByAdmin = httpsCallable(functions, "setUserPasswordByAdmin");
const isLocalDevHost = ["127.0.0.1", "localhost"].includes(String(window.location.hostname || "").toLowerCase());
const DEFAULT_BLOCK_LEVEL_COUNT = 32;
const DEFAULT_COMPUTE_LEVEL_COUNT = 60;
const MAX_QUESTION_XP = 9;
const MAX_APP_LEVEL_XP = 20;
const BLOCK_XP_EASY = 5;
const BLOCK_XP_MEDIUM = 12;
const BLOCK_XP_HARD = 21;
const MANUAL_TASK_APPROVAL_XP = 5;
const AVATAR_DEFAULT_ID = "spark";
const AVATAR_CATALOG = [
  { id: "spark", name: "Kıvılcım", cost: 0, gradient: "linear-gradient(135deg,#93c5fd,#2563eb)", tone: "#f6c28b", hair: "#3f2a1d", shirt: "#2563eb", hairStyle: "short", eye: "#1f2937" },
  { id: "leo", name: "Leo", cost: 120, gradient: "linear-gradient(135deg,#fde68a,#f59e0b)", tone: "#f3bc86", hair: "#4a2d1a", shirt: "#f59e0b", hairStyle: "spike", eye: "#111827" },
  { id: "nova", name: "Nova", cost: 220, gradient: "linear-gradient(135deg,#c4b5fd,#7c3aed)", tone: "#f2bd92", hair: "#2d1a57", shirt: "#7c3aed", hairStyle: "wave", eye: "#1f2937" },
  { id: "rio", name: "Rio", cost: 340, gradient: "linear-gradient(135deg,#86efac,#10b981)", tone: "#f0b98a", hair: "#0f172a", shirt: "#10b981", hairStyle: "tech", eye: "#111827" },
  { id: "luna", name: "Luna", cost: 460, gradient: "linear-gradient(135deg,#fbcfe8,#ec4899)", tone: "#f4c8a1", hair: "#7c2d5c", shirt: "#ec4899", hairStyle: "long", eye: "#1f2937" },
  { id: "max", name: "Max", cost: 580, gradient: "linear-gradient(135deg,#fdba74,#ea580c)", tone: "#efb587", hair: "#2f241e", shirt: "#ea580c", hairStyle: "crew", eye: "#111827" },
  { id: "zen", name: "Zen", cost: 720, gradient: "linear-gradient(135deg,#a7f3d0,#059669)", tone: "#f2c193", hair: "#1e293b", shirt: "#059669", hairStyle: "round", eye: "#111827" },
  { id: "aurora", name: "Aurora", cost: 900, gradient: "linear-gradient(135deg,#f9a8d4,#be185d)", tone: "#f5c8a5", hair: "#43216a", shirt: "#be185d", hairStyle: "hero", eye: "#1f2937" }
];

function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function clampQuestionXP(value) {
  return clampNumber(value, 0, MAX_QUESTION_XP);
}

function clampAppLevelXP(value) {
  return clampNumber(value, 0, MAX_APP_LEVEL_XP);
}

function normalizeBlockDifficultyToken(raw) {
  const v = String(raw || "").toLocaleLowerCase("tr-TR");
  if (!v) return "";
  if (v.includes("kolay") || v.includes("easy")) return "easy";
  if (v.includes("orta") || v.includes("medium")) return "medium";
  if (v.includes("zor") || v.includes("hard")) return "hard";
  return "";
}

function inferBlockDifficultyByIndex(levelNo, totalLevels) {
  const n = Math.max(0, Number(levelNo || 0));
  const total = Math.max(0, Number(totalLevels || 0));
  if (!n || !total) return "";
  const firstCut = Math.ceil(total / 3);
  const secondCut = Math.ceil((2 * total) / 3);
  if (n <= firstCut) return "easy";
  if (n <= secondCut) return "medium";
  return "hard";
}

function getBlockLevelXPByDifficulty(diffToken) {
  if (diffToken === "easy") return BLOCK_XP_EASY;
  if (diffToken === "hard") return BLOCK_XP_HARD;
  return BLOCK_XP_MEDIUM;
}

function resolveBlockLevelXP(level = {}, levelNo = 0, totalLevels = 0, extraText = "") {
  const direct = normalizeBlockDifficultyToken(level?.difficulty || level?.levelDifficulty || "");
  if (direct) return getBlockLevelXPByDifficulty(direct);
  const mixedText = [
    level?.name,
    level?.title,
    level?.label,
    level?.difficultyLabel,
    extraText
  ].map((v) => String(v || "")).join(" ");
  const fromText = normalizeBlockDifficultyToken(mixedText);
  if (fromText) return getBlockLevelXPByDifficulty(fromText);
  const fromIndex = inferBlockDifficultyByIndex(levelNo, totalLevels);
  if (fromIndex) return getBlockLevelXPByDifficulty(fromIndex);
  return BLOCK_XP_MEDIUM;
}

function computeBlockRangeTotalXPFromLevels({
  levels = [],
  levelStart = 1,
  levelEnd = 1,
  completedLevelIds = [],
  currentLevelIndex = -1,
  includeCurrentLevel = false
} = {}) {
  if (!Array.isArray(levels) || !levels.length) return 0;
  const start = Math.max(1, Number(levelStart || 1));
  const end = Math.max(start, Number(levelEnd || start));
  const completedSet = new Set(
    (Array.isArray(completedLevelIds) ? completedLevelIds : [])
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v))
  );
  let sum = 0;
  for (let i = start - 1; i <= end - 1 && i < levels.length; i++) {
    const lv = levels[i] || {};
    const lvId = Number(lv?.id);
    const isCurrent = i === Number(currentLevelIndex || -1);
    const done = !!lv?.completed || (Number.isFinite(lvId) && completedSet.has(lvId)) || (includeCurrentLevel && isCurrent);
    if (!done) continue;
    sum += resolveBlockLevelXP(lv, i + 1, levels.length, "");
  }
  return Math.max(0, sum);
}

function resolveLevelForBlockEvent(data = {}) {
  const levels = Array.isArray(data.levels) ? data.levels : [];
  const totalLevels = levels.length;
  const asNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const levelNoCandidate = asNum(data.levelNo) || asNum(data.levelId);
  let levelNo = levelNoCandidate || 0;
  if (!levelNo && Number.isFinite(Number(data.currentLevelIndex))) {
    levelNo = Number(data.currentLevelIndex) + 1;
  }
  let level = {};
  if (levels.length && levelNo > 0) {
    const byId = levels.find((lv) => Number(lv?.id) === Number(levelNo));
    const byIndex = levels[levelNo - 1];
    level = byId || byIndex || {};
  }
  return {
    level,
    levelNo: Math.max(0, Number(levelNo || 0)),
    totalLevels: Math.max(0, Number(totalLevels || 0))
  };
}

function computeRangeTotalXPFromLevels({
  levels = [],
  levelStart = 1,
  levelEnd = 1,
  completedLevelIds = [],
  currentLevelIndex = -1,
  includeCurrentLevel = false
} = {}) {
  if (!Array.isArray(levels) || !levels.length) return 0;
  const start = Math.max(1, Number(levelStart || 1));
  const end = Math.max(start, Number(levelEnd || start));
  const completedSet = new Set(
    (Array.isArray(completedLevelIds) ? completedLevelIds : [])
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v))
  );
  let sum = 0;
  for (let i = start - 1; i <= end - 1 && i < levels.length; i++) {
    const lv = levels[i] || {};
    const lvId = Number(lv?.id);
    const isCurrent = i === Number(currentLevelIndex || -1);
    const done = !!lv?.completed || (Number.isFinite(lvId) && completedSet.has(lvId)) || (includeCurrentLevel && isCurrent);
    if (!done) continue;
    sum += clampAppLevelXP(lv?.xp ?? MAX_APP_LEVEL_XP);
  }
  return Math.max(0, sum);
}

/* ================= GLOBAL DEĞİŞKENLER ================= */
let currentTaskId = null;
let taskQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let userRole = null;
let userData = null;
let currentUserId = null;
let completedTasks = new Map();
let taskStats = {};
let allTasks = [];
let allStudents = [];
let gameStartTime = null;
let gameTimerInterval = null;
let classChart = null;
let classTypeChart = null;
let studentChart = null;
let studentQuizDetailChart = null;
let myStatsChart = null;
let currentFilter = 'all';
let isTasksLoaded = false;
let isCompletionsLoaded = false;
let activeTaskId = null;
let currentStudentDetail = null;
let passwordChangeUserId = null;
let classCompletionCache = new Map();
let showAllTeacherTasks = false;
let currentQuestionImage = "";
let allContents = [];
let selectedContentId = null;
let contentItemsDraft = [];
let contentProgressMap = new Map();
let contentUnsub = null;
let progressUnsub = null;
let userProfileUnsub = null;
let logoutInProgress = false;
let contentAssignments = [];
let assignmentUnsub = null;
let activityProgressUnsub = null;
let activityProgressMap = new Map();
let currentActivityFilter = "all";
let currentBlockHomeworkFilter = "all";
let currentComputeHomeworkFilter = "all";
let currentAssignmentId = null;
let activeAppTimers = new Map();
let activeAppSession = null;
let appTimerInterval = null;
let lastAppItem = null;
let activitySession = null;
let activityTimerInterval = null;
let confirmResolve = null;
let infoResolve = null;
let sessionStart = null;
let systemTimerInterval = null;
let baseSystemSeconds = 0;
let currentUserKey = null;
let myActivityChart = null;
let myBlockChart = null;
let myComputeChart = null;
let statsPageLoading = false;
let statsPageQueued = false;
let lastTaskXP = 0;
let studentIdSet = new Set();
let allBooks = [];
let bookTaskProgressMap = new Map();
let activityFrameLoadTimer = null;
let contentFrameLoadTimer = null;
let currentTaskStudentsId = null;
let suppressStudentDetailModal = false;
let blockRunnerSession = null;
let block3DRunnerSession = null;
let blockRunnerTimerInterval = null;
let activeBlockRunnerUserId = null;
let activeComputeRunnerUserId = null;
let currentRunnerType = null; // "block" | "block3d" | "compute" | null
let blockAssignments = [];
let blockAssignmentsUnsub = null;
let blockAssignmentProgressUnsub = null;
let blockAssignmentProgressMap = new Map();
let blockTeacherProgressUnsub = null;
let blockTeacherCompletedCountMap = new Map();
let activeBlockAssignmentId = null;
let editingBlockHomeworkId = null;
let currentBlockAssignType = "block2d";
let computeAssignments = [];
let computeAssignmentsUnsub = null;
let computeAssignmentProgressUnsub = null;
let computeAssignmentProgressMap = new Map();
let computeTeacherProgressUnsub = null;
let computeTeacherCompletedCountMap = new Map();
let computeStateUnsub = null;
let studentComputeStateCompletedLevels = 0;
let computeReportLevelsUnsub = null;
let studentComputeReportCompletedLevels = 0;
let activeComputeAssignmentId = null;
let editingComputeHomeworkId = null;
let computeRunnerSession = null;
let computeRunnerTimerInterval = null;
let homeListCache = {
  tasks: { title: "Ödevler", pending: [], completed: [] },
  activities: { title: "Etkinlikler", pending: [], completed: [] },
  block: { title: "Blok Kodlama Ödevleri", pending: [], completed: [] },
  compute: { title: "Compute It Ödevleri", pending: [], completed: [] },
  lessons: { title: "Dersler", pending: [], completed: [] }
};
let studentCombinedListCache = {
  homework: { title: "Ödevlerim", pending: [], completed: [] },
  apps: { title: "Uygulamalar", pending: [], completed: [] }
};
let studentCombinedTabState = { homework: "pending", apps: "pending" };
let lessons = [];
let lessonsUnsub = null;
let lessonProgressUnsub = null;
let lessonProgressMap = new Map();
let editingLessonId = null;
let editingLessonIsPublished = false;
let lessonDraft = { slides: [] };
let selectedLessonSlideIndex = -1;
let lessonPlayerState = null;
let lessonCanvasElements = [];
let lessonCanvasDrag = null;
let selectedLessonCanvasElementId = null;
let lessonTextModalResolve = null;
let selectedLessonThemeId = "aurora";
let currentTeacherLessonListFilter = "all";
let activeHomePanelId = null;
let classManagerSelectedId = null;
let classManagerRows = [];
let classSectionCatalog = [];
let liveQuizItems = [];
let liveQuizSelectedQuestionIndex = -1;
let liveQuizEditingId = null;
let liveQuizUnsub = null;
let liveQuizHomeUnsub = null;
let liveQuizResultsHomeUnsub = null;
let currentLiveQuizImageDataUrl = "";
let liveSessionUnsub = null;
let liveSessionScoresUnsub = null;
let liveSessionAnswersUnsub = null;
let activeLiveSession = null;
let studentLiveSessionUnsub = null;
let activeStudentLiveSession = null;
let livePlayerTick = null;
let livePlayerScoresUnsub = null;
let liveTeacherTick = null;
let liveAutoProgressing = false;
let lastStudentLiveSessionId = "";
let lastLiveInviteSessionId = null;
let teacherHomeQuizResultsClosedSessionId = null;
let teacherHomeDisplayedResultsSessionId = null;
let teacherHomeLatestRankingRows = [];
let teacherHomeLatestResultsMeta = "";
let teacherQuizResultSessions = [];
let teacherSelectedQuizSessionId = "";
let studentLiveAnswerCache = new Map();
let livePlayerMatchingDragKey = "";
let liveQuizDragIndex = -1;
let leaderboardRowsCache = [];
let loginCardsStudentsCache = [];
let teacherLiveMonitorScores = [];
let teacherLiveMonitorAnswers = [];
let teacherLiveMonitorStudents = [];
let teacherOwnerAliasTokens = new Set();
let teacherLiveMonitorStudentKey = "";
let teacherLiveMonitorOpen = false;
let teacherCertificateStudents = [];
let teacherCertificateMetricsCache = new Map();
let flowNodes = [];
let flowEdges = [];
let flowSelectedTool = "start";
let flowSelectedNodeId = null;
let flowSelectedEdgeId = null;
let flowConnectSourceId = null;
let flowConnectMode = false;
let flowNodeSeq = 1;
let flowDragState = null;
let flowRunnerBusy = false;
let flowRunCancelled = false;
let flowNodeEditTargetId = null;
let flowRuntimeInputResolve = null;
let flowchartMode = "teacher";
let activeFlowchartAssignment = null;
let editingFlowchartAssignmentId = null;
let editingFlowchartAssignmentData = null;
let flowAssignmentTimerTick = null;
let flowAssignmentTimerStartMs = 0;
let flowAssignmentTimerBaseSec = 0;
let studentAiMessages = [];
let studentAiOpen = false;
let studentAiMsgSeq = 1;
let studentAiAssistantCallable = null;
const THEME_KEY = "uiThemeMode";
const LESSON_THEME_TEMPLATES = [
  {
    id: "aurora",
    name: "Aurora Gece",
    colors: ["#0f172a", "#1d4ed8", "#38bdf8"],
    style: { cardBg: "rgba(15,23,42,0.78)", text: "#e2e8f0", border: "rgba(148,163,184,0.4)" }
  },
  {
    id: "sunset",
    name: "Sunset Turuncu",
    colors: ["#7c2d12", "#ea580c", "#f59e0b"],
    style: { cardBg: "rgba(124,45,18,0.78)", text: "#fff7ed", border: "rgba(251,146,60,0.45)" }
  },
  {
    id: "mint",
    name: "Mint Akademi",
    colors: ["#064e3b", "#0f766e", "#34d399"],
    style: { cardBg: "rgba(6,78,59,0.78)", text: "#ecfdf5", border: "rgba(110,231,183,0.45)" }
  }
];

function ensureLoggedOutView() {
  const loginScreen = document.getElementById("login-screen");
  const appScreen = document.getElementById("app-screen");
  const menuBtn = document.getElementById("open-menu");
  const sideMenu = document.getElementById("side-menu");
  const userDropdown = document.getElementById("user-dropdown");
  const activityDetail = document.getElementById("activity-detail");
  const externalOverlay = document.getElementById("external-app-overlay");
  const liveInvite = document.getElementById("live-quiz-invite");
  const livePlayer = document.getElementById("live-quiz-player");
  if (loginScreen) {
    loginScreen.classList.remove("hidden");
    loginScreen.style.display = "flex";
    loginScreen.style.pointerEvents = "auto";
  }
  if (appScreen) appScreen.style.display = "none";
  if (menuBtn) menuBtn.style.display = "none";
  if (sideMenu) sideMenu.style.width = "0";
  if (userDropdown) userDropdown.style.display = "none";
  if (activityDetail) activityDetail.style.display = "none";
  if (externalOverlay) externalOverlay.style.display = "none";
  if (liveInvite) liveInvite.style.display = "none";
  if (livePlayer) livePlayer.style.display = "none";
  document.querySelectorAll(".modal").forEach((el) => {
    el.style.display = "none";
  });
}

function installImageFallbacks() {
  // Tek logo kaynagi logo.png: yuklenemeyen gorsellerde kirik ikon gostermemek icin gizle.
  document.addEventListener("error", (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLImageElement)) return;
    const src = String(target.getAttribute("src") || "");
    if (src.includes("logo.png")) {
      target.style.visibility = "hidden";
    }
  }, true);
}

function installZoomLock() {
  // Sayfa icinde klavye/mouse/pinch ile zoom'u engelle.
  const zoomKeys = new Set(["+", "-", "=", "_", "0"]);
  document.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && zoomKeys.has(String(ev.key || ""))) {
      ev.preventDefault();
    }
  }, { passive: false });

  document.addEventListener("wheel", (ev) => {
    if (ev.ctrlKey || ev.metaKey) {
      ev.preventDefault();
    }
  }, { passive: false });

  // iOS Safari pinch zoom
  document.addEventListener("gesturestart", (ev) => ev.preventDefault(), { passive: false });
  document.addEventListener("gesturechange", (ev) => ev.preventDefault(), { passive: false });
  document.addEventListener("gestureend", (ev) => ev.preventDefault(), { passive: false });

  let lastTouchEnd = 0;
  document.addEventListener("touchend", (ev) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) ev.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
}

window.addEventListener("DOMContentLoaded", () => {
  installZoomLock();
  installImageFallbacks();
  applyClassSectionDropdownBindings();
  if (!auth?.currentUser) ensureLoggedOutView();
});
const HOME_PANEL_IDS = [
  "teacher-analytics",
  "student-stats-bar",
  "tasks-section",
  "activities-section",
  "quiz-section",
  "block-homework-section",
  "compute-homework-section",
  "lessons-section",
  "top-students-card",
  "leaderboard-section"
];

function applyThemeMode(mode) {
  const normalized = mode === "dark" ? "dark" : "light";
  document.body.classList.toggle("dark-mode", normalized === "dark");
  const btns = [
    document.getElementById("theme-toggle-app"),
    document.getElementById("theme-toggle-login")
  ];
  btns.forEach((btn) => {
    if (!btn) return;
    btn.innerText = normalized === "dark" ? "☀️" : "🌙";
    btn.title = normalized === "dark" ? "Açık Mod" : "Karanlık Mod";
  });
  try {
    localStorage.setItem(THEME_KEY, normalized);
  } catch {}
}

function getAvailableBlockLevelCount() {
  try {
    const raw = localStorage.getItem("levels");
    if (!raw) return DEFAULT_BLOCK_LEVEL_COUNT;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return Math.max(parsed.length, DEFAULT_BLOCK_LEVEL_COUNT);
    return DEFAULT_BLOCK_LEVEL_COUNT;
  } catch (e) {
    return DEFAULT_BLOCK_LEVEL_COUNT;
  }
}

function getStoredBlockLevels() {
  try {
    const raw = localStorage.getItem("levels");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function getLevelNamesByRange(start, end) {
  const levels = getStoredBlockLevels();
  if (!levels.length) return [];
  const s = Math.max(1, Number(start || 1));
  const e = Math.max(s, Number(end || s));
  const out = [];
  for (let i = s - 1; i <= e - 1 && i < levels.length; i++) {
    const name = levels[i]?.name || `Seviye ${i + 1}`;
    out.push(name);
  }
  return out;
}

async function getAvailableComputeLevels() {
  try {
    const snap = await getDoc(doc(db, "computeLevels", "default"));
    const levels = snap.exists() ? (snap.data()?.payload?.levels || []) : [];
    if (Array.isArray(levels) && levels.length > 0) {
      if (levels.length >= DEFAULT_COMPUTE_LEVEL_COUNT) return levels;
      const filled = levels.slice();
      for (let i = levels.length; i < DEFAULT_COMPUTE_LEVEL_COUNT; i++) {
        filled.push({ id: i + 1, name: `Compute Seviye ${i + 1}` });
      }
      return filled;
    }
  } catch (e) {
    console.warn("getAvailableComputeLevels", e);
  }
  return Array.from({ length: DEFAULT_COMPUTE_LEVEL_COUNT }, (_, i) => ({
    id: i + 1,
    name: `Compute Seviye ${i + 1}`
  }));
}

async function getAvailableComputeLevelCount() {
  const levels = await getAvailableComputeLevels();
  return levels.length > 0 ? levels.length : DEFAULT_COMPUTE_LEVEL_COUNT;
}

function getComputeLevelNamesByRange(start, end, levels = []) {
  if (!Array.isArray(levels) || levels.length === 0) return [];
  const s = Math.max(1, Number(start || 1));
  const e = Math.max(s, Number(end || s));
  const out = [];
  for (let i = s - 1; i <= e - 1 && i < levels.length; i++) {
    const name = String(levels[i]?.name || `Seviye ${i + 1}`);
    out.push(name);
  }
  return out;
}

/* ================= BLOCK RUNNER INTEGRATION ================= */
// Open the block-grid-runner inside the existing activity modal and sync saved state
window.openBlockRunner = async function(userId, options = {}){
  userId = userId || currentUserId || 'guest';
  activeBlockRunnerUserId = userId;
  activeBlockAssignmentId = options?.assignmentId || null;
  currentRunnerType = "block";
  const modal = document.getElementById('activity-modal');
  const iframe = document.getElementById('activity-iframe');
  if(!modal || !iframe) return;
  if (activityTimerInterval) clearInterval(activityTimerInterval);
  activityTimerInterval = null;
  activitySession = null;
  setActivityStartButtons(false);
  setActivityPausedUI(false);
  const timerEl = document.getElementById("activity-timer");
  if (timerEl) timerEl.innerText = "⏱️ 0 dk 0 sn";
  modal.classList.add("block-runner-mode");
  modal.classList.toggle("teacher-block-runner", userRole === "teacher");
  setComputeTeacherHeaderMode(false);
  setBlockRunnerHeaderByRole();
  // set src to app path
  const runnerRole = userRole === "teacher" ? "teacher" : "student";
  iframe.src = `/block-grid-runner/index.html?role=${runnerRole}`;
  modal.style.display = 'flex';
  document.getElementById('activity-title').innerText = options?.title || 'Blok Kodlama - Grid Runner';
  document.getElementById('activity-link').innerText = '/block-grid-runner/index.html';
  const closeBtn = document.getElementById("btn-close-activity");
  if (closeBtn) closeBtn.innerText = "×";
  const topTitle = document.querySelector("#activity-modal .modal-header h2");
  if (topTitle) topTitle.innerText = "Blok Kodlama";
  let assignmentProgressData = null;
  if (userRole === "student" && options?.assignmentId && currentUserId) {
    try {
      const pId = `${options.assignmentId}_${currentUserId}`;
      const pSnap = await getDoc(doc(db, "blockAssignmentProgress", pId));
      assignmentProgressData = pSnap.exists() ? pSnap.data() : null;
    } catch (e) {
      assignmentProgressData = null;
    }
  }

  if (userRole === "teacher") {
    blockRunnerSession = null;
    const timerLabel = document.getElementById("block-runner-timer");
    if (timerLabel) timerLabel.innerText = "";
    setActivityPausedUI(false);
  } else {
    const rangeStart = Math.max(1, Number(options?.levelStart || 1));
    const rangeEnd = Math.max(rangeStart, Number(options?.levelEnd || rangeStart));
    blockRunnerSession = {
      userId: userId || currentUserId,
      assignmentTitle: String(options?.title || "Blok Kodlama Ödevi"),
      running: false,
      startAt: null,
      savedElapsedSeconds: 0,
      lastCommittedSeconds: 0,
      wasPausedByDialog: false,
      hasTriggeredRun: false,
      completionHandled: false,
      rangeStart,
      rangeEnd,
      completedLevelIds: Array.isArray(assignmentProgressData?.completedLevelIds)
        ? assignmentProgressData.completedLevelIds.map((v) => Number(v)).filter((v) => Number.isFinite(v))
        : []
    };
    setBlockRunnerStartButton(false);
    updateBlockRunnerTimerUI();
    setActivityPausedUI(true);
  }

  const sendRoleMenuState = () => {
    try {
      if (!iframe.contentWindow) return;
      if (userRole === "teacher") {
        iframe.contentWindow.postMessage({ type: "ENABLE_MENU" }, "*");
      } else {
        iframe.contentWindow.postMessage({ type: "DISABLE_MENU" }, "*");
      }
    } catch (e) {
      console.warn("runner role sync error", e);
    }
  };
  const sendBlockRunnerInitMessages = (payloadData) => {
    try {
      if (!iframe.contentWindow) return;
      if (Array.isArray(payloadData?.levels) && payloadData.levels.length > 0) {
        iframe.contentWindow.postMessage({
          type: 'LOAD_STATE',
          levels: payloadData.levels,
          currentLevelIndex: payloadData?.currentLevelIndex || 0
        }, '*');
      }
      if (options?.levelStart || options?.levelEnd) {
        iframe.contentWindow.postMessage({
          type: "SET_LEVEL_RANGE",
          levelStart: Math.max(1, Number(options?.levelStart || 1)),
          levelEnd: Math.max(1, Number(options?.levelEnd || options?.levelStart || 1))
        }, "*");
        iframe.contentWindow.postMessage({
          type: "SET_ASSIGNMENT_PROGRESS",
          completedLevelIds: Array.isArray(blockRunnerSession?.completedLevelIds) ? blockRunnerSession.completedLevelIds : []
        }, "*");
      }
      sendRoleMenuState();
    } catch (e) { /* ignore */ }
  };
  iframe.addEventListener("load", () => {
    sendBlockRunnerInitMessages(null);
  }, { once: true });

  // Try to load saved state from Firestore and send to iframe
  try{
    let payload = null;
    if (userRole === "teacher") {
      const lvlSnap = await getDoc(doc(db, "blockLevels", "default"));
      payload = lvlSnap.exists() ? (lvlSnap.data()?.payload || null) : null;
    } else {
      const docRef = doc(db, 'gameStates', String(userId));
      const snap = await getDoc(docRef);
      payload = (snap && snap.exists()) ? snap.data().payload : null;
      if (!payload?.levels || !payload.levels.length) {
        const lvlSnap = await getDoc(doc(db, "blockLevels", "default"));
        if (lvlSnap.exists()) payload = lvlSnap.data()?.payload || payload;
      }
    }
    // re-send init payload multiple times to avoid iframe load timing race
    [350, 700, 1200].forEach((delay) => {
      setTimeout(() => sendBlockRunnerInitMessages(payload), delay);
    });
  }catch(e){ console.warn('openBlockRunner load error', e); }
};

async function saveBlock3DAssignmentProgressFromEvent(data = {}) {
  if (userRole !== "student") return;
  const uid = activeBlockRunnerUserId || currentUserId || "guest";
  const assignmentId = String(data.assignmentId || activeBlockAssignmentId || "");
  if (!assignmentId) return;
  try {
    const assignmentRef = doc(db, "blockAssignments", assignmentId);
    const assignmentSnap = await getDoc(assignmentRef);
    if (!assignmentSnap.exists()) return;
    const assignment = assignmentSnap.data() || {};
    const levelStart = Math.max(1, Number(data.levelStart || assignment.levelStart || 1));
    const levelEnd = Math.max(levelStart, Number(data.levelEnd || assignment.levelEnd || levelStart));
    const levels = Array.isArray(data.levels) ? data.levels : [];
    const totalLevels = Math.max(0, levelEnd - levelStart + 1);
    const completedRaw = Array.isArray(data.completedLevelIds) ? data.completedLevelIds : [];
    const completedSet = new Set(
      completedRaw.map((v) => Number(v)).filter((v) => Number.isFinite(v) && v >= levelStart && v <= levelEnd)
    );
    for (let i = levelStart - 1; i <= levelEnd - 1 && i < levels.length; i++) {
      if (levels[i]?.completed) completedSet.add(i + 1);
    }
    const completedLevelIds = Array.from(completedSet).sort((a, b) => a - b);
    const completedLevels = completedLevelIds.length;
    const percent = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
    const completed = totalLevels > 0 && completedLevels >= totalLevels;
    const elapsedSeconds = Math.max(0, Number(data.elapsedSeconds ?? data.duration ?? 0));
    let totalXP = completedLevels * BLOCK_XP_MEDIUM;
    if (levels.length) {
      totalXP = 0;
      completedLevelIds.forEach((lvNo) => {
        const lv = levels[lvNo - 1] || {};
        totalXP += resolveBlockLevelXP(lv, lvNo, levels.length, lv?.name || "");
      });
    }

    const progressRef = doc(db, "blockAssignmentProgress", `${assignmentId}_${uid}`);
    const prevSnap = await getDoc(progressRef);
    const prev = prevSnap.exists() ? prevSnap.data() : {};
    const prevIds = Array.isArray(prev.completedLevelIds)
      ? prev.completedLevelIds.map((v) => Number(v)).filter((v) => Number.isFinite(v))
      : [];
    const mergedIds = Array.from(new Set([...prevIds, ...completedLevelIds])).sort((a, b) => a - b);
    const mergedCompleted = mergedIds.filter((v) => v >= levelStart && v <= levelEnd).length;
    const mergedPercent = totalLevels > 0 ? Math.round((mergedCompleted / totalLevels) * 100) : percent;
    const mergedDone = totalLevels > 0 && mergedCompleted >= totalLevels;

    await setDoc(progressRef, {
      assignmentId,
      assignmentTitle: String(assignment.title || data.assignmentTitle || "3D Blok Kodlama Ödevi"),
      levelStart,
      levelEnd,
      userId: uid,
      percent: Math.max(percent, mergedPercent),
      completed: completed || mergedDone,
      completedLevelIds: mergedIds,
      totalXP: Math.max(Number(prev.totalXP || 0), totalXP),
      completedLevels: Math.max(completedLevels, mergedCompleted),
      totalLevels,
      currentLevelIndex: Math.max(0, Number(data.currentLevelIndex || 0)),
      lastSessionSeconds: elapsedSeconds,
      lastSessionMinutes: Math.floor(elapsedSeconds / 60),
      updatedAt: serverTimestamp()
    }, { merge: true });

    if (!prev.completed && (completed || mergedDone)) {
      await updateDoc(assignmentRef, {
        completedCount: increment(1),
        updatedAt: serverTimestamp()
      });
    }

    const rptRef = doc(db, "studentReports", String(uid));
    const prevSec = Math.max(0, Number(prev.lastSessionSeconds || 0));
    const deltaSec = Math.max(0, elapsedSeconds - prevSec);
    await setDoc(rptRef, {
      block3DCompletedLevels: Math.max(completedLevels, mergedCompleted),
      block3DTotalLevels: totalLevels,
      block3DProgressPercent: Math.max(percent, mergedPercent),
      block3DLastSessionSeconds: elapsedSeconds,
      block3DLastSessionMinutes: Math.floor(elapsedSeconds / 60),
      updatedAt: serverTimestamp()
    }, { merge: true });
    if (deltaSec > 0) {
      await setDoc(rptRef, { totalDurationMs: increment(deltaSec * 1000) }, { merge: true });
    }
  } catch (e) {
    console.warn("block3d progress save error", e);
  }
}

// Listen for messages from block-runner iframe
window.addEventListener('message', async function(e){
  const data = e && e.data;
  if(!data || typeof data !== 'object') return;
  if (data.type === "CLOSE_ACTIVITY_MODAL" || data.type === "REQUEST_CLOSE_ACTIVITY") {
    if (currentRunnerType === "compute" || currentRunnerType === "block" || currentRunnerType === "block3d") {
      await requestRunnerExitWithPromptPolicy();
    } else {
      closeBlockRunnerView();
    }
    return;
  }
  if (data.type === "OPEN_BLOCK_HOMEWORK_ASSIGN" && String(data.source || "") === "block-3d") {
    if (userRole !== "teacher") return;
    const levelStart = Math.max(1, Number(data.levelStart || 1));
    const levelEnd = Math.max(levelStart, Number(data.levelEnd || levelStart));
    const currentLevelName = String(data.levelName || `3D Seviye ${levelStart}`);
    const title = String(data.title || `3D Blok Kodlama - ${currentLevelName}`);
    openBlockHomeworkModalWithDefaults({
      type: "block3d",
      title,
      levelStart,
      levelEnd
    });
    showNotice("3D ödev formu hazırlandı. Sınıf ve tarih seçip kaydedin.", "#2ecc71");
    return;
  }
  const isComputeSource = data.source === "compute-it";
  const isBlock3DSource = data.source === "block-3d";
  // Save/Update game state in Firestore
  if(data.type === 'GAME_UPDATE'){
    if (isComputeSource) {
      try {
        const uid = activeComputeRunnerUserId || currentUserId || 'guest';
        if (userRole === "teacher") {
          await setDoc(doc(db, "computeLevels", "default"), {
            updatedAt: serverTimestamp(),
            updatedBy: currentUserId || null,
            payload: {
              levels: Array.isArray(data.levels) ? data.levels : [],
              currentLevelIndex: Number(data.currentLevelIndex || 0)
            }
          }, { merge: true });
        } else {
          await setDoc(doc(db, "computeStates", String(uid)), {
            updatedAt: serverTimestamp(),
            payload: {
              levels: Array.isArray(data.levels) ? data.levels : [],
              currentLevelIndex: Number(data.currentLevelIndex || 0)
            }
          }, { merge: true });
        }
      } catch (err) {
        console.warn("COMPUTE GAME_UPDATE save error", err);
      }
      return;
    }
    if (isBlock3DSource) {
      try {
        const uid = activeBlockRunnerUserId || currentUserId || "guest";
        if (userRole === "student") {
          if (!block3DRunnerSession) {
            block3DRunnerSession = {
              userId: uid,
              assignmentId: data.assignmentId || activeBlockAssignmentId || null,
              assignmentTitle: data.assignmentTitle || "3D Blok Kodlama Ödevi",
              levelStart: Math.max(1, Number(data.levelStart || 1)),
              levelEnd: Math.max(1, Number(data.levelEnd || data.levelStart || 1)),
              completionHandled: false,
              latestData: null
            };
          }
          block3DRunnerSession.latestData = {
            assignmentId: data.assignmentId || block3DRunnerSession.assignmentId || activeBlockAssignmentId || null,
            assignmentTitle: data.assignmentTitle || block3DRunnerSession.assignmentTitle || "3D Blok Kodlama Ödevi",
            levelStart: Math.max(1, Number(data.levelStart || block3DRunnerSession.levelStart || 1)),
            levelEnd: Math.max(1, Number(data.levelEnd || block3DRunnerSession.levelEnd || data.levelStart || 1)),
            levels: Array.isArray(data.levels) ? data.levels : [],
            currentLevelIndex: Number(data.currentLevelIndex || 0),
            elapsedSeconds: Math.max(0, Number(data.elapsedSeconds || 0)),
            completedLevelIds: Array.isArray(data.completedLevelIds) ? data.completedLevelIds : []
          };
        }
        if (userRole === "teacher") {
          await setDoc(doc(db, "block3DLevels", "default"), {
            updatedAt: serverTimestamp(),
            updatedBy: currentUserId || null,
            payload: {
              levels: Array.isArray(data.levels) ? data.levels : [],
              currentLevelIndex: Number(data.currentLevelIndex || 0)
            }
          }, { merge: true });
        } else {
          await setDoc(doc(db, "block3DStates", String(uid)), {
            updatedAt: serverTimestamp(),
            payload: {
              levels: Array.isArray(data.levels) ? data.levels : [],
              currentLevelIndex: Number(data.currentLevelIndex || 0),
              elapsedSeconds: Math.max(0, Number(data.elapsedSeconds || 0))
            }
          }, { merge: true });
          await saveBlock3DAssignmentProgressFromEvent(data);
        }
      } catch (err) {
        console.warn("block3d GAME_UPDATE save error", err);
      }
      return;
    }
    if (userRole === "teacher") {
      try {
        await setDoc(doc(db, "blockLevels", "default"), {
          updatedAt: serverTimestamp(),
          updatedBy: currentUserId || null,
          payload: {
            levels: Array.isArray(data.levels) ? data.levels : [],
            currentLevelIndex: Number(data.currentLevelIndex || 0)
          }
        }, { merge: true });
      } catch (err) {
        console.warn("blockLevels save error", err);
      }
      return;
    }
    try{
      const uid = activeBlockRunnerUserId || currentUserId || 'guest';
      const ref = doc(db, 'gameStates', String(uid));
      await setDoc(ref, {
        updatedAt: serverTimestamp(),
        payload: {
          levels: data.levels,
          currentLevelIndex: Number(data.currentLevelIndex || 0)
        }
      }, { merge: true });
      const completedLevels = Array.isArray(data.levels) ? data.levels.filter((l) => l?.completed).length : 0;
      const totalLevels = Array.isArray(data.levels) ? data.levels.length : 0;
      await setDoc(doc(db, "studentReports", String(uid)), {
        completedLevels,
        totalLevels,
        progressPercent: totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0,
        currentLevelIndex: Number(data.currentLevelIndex || 0),
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log('GAME_UPDATE saved for', uid);
    }catch(err){ console.warn('GAME_UPDATE save error', err); }
  }
  else if(data.type === 'LEVEL_COMPLETED'){
    if (userRole === "teacher") return;
    try{
      if (isComputeSource) {
        const uid = activeComputeRunnerUserId || currentUserId || 'guest';
        const levelKey = String(data.levelId ?? "unknown");
        const levelRef = doc(db, "computeReports", String(uid), "levelCompletions", levelKey);
        await setDoc(doc(db, "computeStates", String(uid)), {
          updatedAt: serverTimestamp(),
          payload: {
            levels: Array.isArray(data.levels) ? data.levels : [],
            currentLevelIndex: Number(data.currentLevelIndex || 0)
          }
        }, { merge: true });
        await setDoc(levelRef, {
          levelId: data.levelId,
          xp: data.xp || 0,
          percent: 100,
          durationMs: data.duration || 0,
          updatedAt: serverTimestamp()
        }, { merge: true });
        await updateComputeAssignmentProgressFromLevelEvent({
          uid,
          levelId: data.levelId,
          levels: Array.isArray(data.levels) ? data.levels : [],
          durationMs: Number(data.duration || 0),
          currentLevelIndex: Number(data.currentLevelIndex || 0)
        });
        if(uid === currentUserId) updateUserXPDisplay();
        return;
      }
      if (isBlock3DSource) {
        const uid = activeBlockRunnerUserId || currentUserId || "guest";
        const resolved3D = resolveLevelForBlockEvent(data);
        const earnedXp = resolveBlockLevelXP(
          resolved3D.level,
          resolved3D.levelNo,
          resolved3D.totalLevels,
          String(data.levelName || "")
        );
        const elapsedSec = Math.max(0, Number(data.duration || data.elapsedSeconds || 0));
        const levelKey = `block3d_${String(data.levelNo || data.levelId || "unknown")}`;
        const levelRef = doc(db, "studentReports", String(uid), "levelCompletions", levelKey);
        const levelSnap = await getDoc(levelRef);
        await setDoc(doc(db, "block3DStates", String(uid)), {
          updatedAt: serverTimestamp(),
          payload: {
            levels: Array.isArray(data.levels) ? data.levels : [],
            currentLevelIndex: Number(data.currentLevelIndex || 0),
            elapsedSeconds: elapsedSec
          }
        }, { merge: true });
        await setDoc(levelRef, {
          levelId: data.levelId,
          levelNo: Number(data.levelNo || 0),
          xp: earnedXp,
          stars: Math.max(0, Number(data.stars || 0)),
          percent: 100,
          durationMs: elapsedSec * 1000,
          updatedAt: serverTimestamp()
        }, { merge: true });
        await setDoc(doc(db, "studentReports", String(uid)), {
          block3DLastXP: earnedXp,
          block3DLastStars: Math.max(0, Number(data.stars || 0)),
          block3DLastSessionSeconds: elapsedSec,
          block3DLastSessionMinutes: Math.floor(elapsedSec / 60),
          updatedAt: serverTimestamp()
        }, { merge: true });
        if (!levelSnap.exists()) {
          try { await updateDoc(doc(db, "users", uid), { xp: increment(earnedXp) }); } catch {}
          await setDoc(doc(db, "studentReports", String(uid)), {
            totalXP: increment(earnedXp),
            totalDurationMs: increment(elapsedSec * 1000)
          }, { merge: true });
        }
        await saveBlock3DAssignmentProgressFromEvent({
          ...data,
          elapsedSeconds: elapsedSec
        });
        if (block3DRunnerSession) {
          block3DRunnerSession.latestData = {
            ...(block3DRunnerSession.latestData || {}),
            assignmentId: data.assignmentId || block3DRunnerSession.assignmentId || activeBlockAssignmentId || null,
            assignmentTitle: data.assignmentTitle || block3DRunnerSession.assignmentTitle || "3D Blok Kodlama Ödevi",
            levelStart: Math.max(1, Number(data.levelStart || block3DRunnerSession.levelStart || 1)),
            levelEnd: Math.max(1, Number(data.levelEnd || block3DRunnerSession.levelEnd || data.levelStart || 1)),
            levels: Array.isArray(data.levels) ? data.levels : [],
            currentLevelIndex: Number(data.currentLevelIndex || 0),
            elapsedSeconds: elapsedSec,
            completedLevelIds: Array.isArray(data.completedLevelIds) ? data.completedLevelIds : []
          };
        }
        if(uid === currentUserId) updateUserXPDisplay();
        return;
      }
      if (blockRunnerSession && activeBlockAssignmentId) {
        if (!Array.isArray(blockRunnerSession.completedLevelIds)) blockRunnerSession.completedLevelIds = [];
        const lid = Number(data.levelId);
        if (Number.isFinite(lid) && !blockRunnerSession.completedLevelIds.includes(lid)) {
          blockRunnerSession.completedLevelIds.push(lid);
        }
      }
      const uid = activeBlockRunnerUserId || currentUserId || 'guest';
      const resolvedBlock = resolveLevelForBlockEvent(data);
      const earnedBlockXp = resolveBlockLevelXP(
        resolvedBlock.level,
        resolvedBlock.levelNo,
        resolvedBlock.totalLevels,
        String(data.levelName || "")
      );
      // update gameStates
      const gsRef = doc(db, 'gameStates', String(uid));
      await setDoc(gsRef, {
        updatedAt: serverTimestamp(),
        payload: {
          levels: data.levels,
          currentLevelIndex: Number(data.currentLevelIndex || 0)
        }
      }, { merge: true });

      // record a completion entry (append) under studentReports/<uid>/completions
      try{
        const completionsCol = collection(db, 'studentReports', String(uid), 'completions');
        await addDoc(completionsCol, {
          levelId: data.levelId,
          xp: earnedBlockXp,
          percent: data.percent || 0,
          stars: (typeof data.stars === 'number') ? data.stars : (data.starCollected ? 1 : 1),
          durationMs: data.duration || null,
          createdAt: serverTimestamp()
        });
      }catch(e){ console.warn('Could not add completion entry', e); }

      // update (or create) aggregated student report: last fields and increment totalXP
      const rptRef = doc(db, 'studentReports', String(uid));
      const completedLevels = Array.isArray(data.levels) ? data.levels.filter((l) => l?.completed).length : 0;
      const totalLevels = Array.isArray(data.levels) ? data.levels.length : 0;
      const levelKey = String(data.levelId ?? "unknown");
      const levelRef = doc(db, "studentReports", String(uid), "levelCompletions", levelKey);
      const levelSnap = await getDoc(levelRef);

      const reportPayload = {
        lastCompletedLevel: data.levelId,
        lastXP: earnedBlockXp,
        lastPercent: data.percent || 0,
        completedLevels,
        totalLevels,
        progressPercent: totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0,
        currentLevelIndex: Number(data.currentLevelIndex || 0),
        updatedAt: serverTimestamp()
      };
      await setDoc(rptRef, reportPayload, { merge: true });
      await setDoc(levelRef, {
        levelId: data.levelId,
        xp: earnedBlockXp,
        percent: data.percent || 0,
        durationMs: data.duration || 0,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // only first completion of a level increases total XP/duration and user XP
      if (!levelSnap.exists()) {
        try {
          await updateDoc(rptRef, {
            totalXP: increment(earnedBlockXp),
            totalDurationMs: increment(data.duration || 0)
          });
        } catch (e) {
          await setDoc(rptRef, {
            totalXP: earnedBlockXp,
            totalDurationMs: data.duration || 0
          }, { merge: true });
        }
        try {
          await updateDoc(doc(db, "users", uid), { xp: increment(earnedBlockXp) });
        } catch (e) {
          console.warn("user xp increment failed", e);
        }
      }

      console.log('LEVEL_COMPLETED saved for', uid);
      // update student UI XP display if current student
      if(uid === currentUserId) updateUserXPDisplay();

      if (
        userRole === "student"
        && blockRunnerSession
        && activeBlockAssignmentId
        && !blockRunnerSession.completionHandled
      ) {
        const start = Math.max(1, Number(blockRunnerSession.rangeStart || 1));
        const end = Math.max(start, Number(blockRunnerSession.rangeEnd || start));
        const totalInRange = Math.max(0, end - start + 1);
        const rangeIds = new Set(
          (Array.isArray(data.levels) ? data.levels.slice(start - 1, end) : [])
            .map((lv) => Number(lv?.id))
            .filter((v) => Number.isFinite(v))
        );
        const completedIds = Array.isArray(blockRunnerSession.completedLevelIds)
          ? blockRunnerSession.completedLevelIds.map((v) => Number(v)).filter((v) => Number.isFinite(v))
          : [];
        const doneInRange = completedIds.filter((id) => rangeIds.has(id)).length;
        if (totalInRange > 0 && doneInRange >= totalInRange) {
          blockRunnerSession.completionHandled = true;
          syncRunnerSaveButtons();
          try {
            const iframe = document.getElementById("activity-iframe");
            iframe?.contentWindow?.postMessage({ type: "FORCE_ASSIGNMENT_LOCK" }, "*");
          } catch (e) {}
          let blockXpTotal = 0;
          let blockDurationSec = getBlockRunnerElapsedSeconds();
          try {
            await saveBlockRunnerSession({ closeAfter: false, askContinue: false });
            const progressId = `${activeBlockAssignmentId}_${uid}`;
            const pSnap = await getDoc(doc(db, "blockAssignmentProgress", progressId));
            if (pSnap.exists()) {
              const pData = pSnap.data() || {};
              blockXpTotal = Math.max(0, Number(pData.totalXP || 0));
              blockDurationSec = Math.max(0, Number(pData.lastSessionSeconds || blockDurationSec || 0));
            }
          } catch (saveErr) {
            console.warn("block assignment final save error", saveErr);
          }
          showCompletionCelebration({
            title: "Blok Kodlama Tamamlandı!",
            message: "Harika iş! Ödev başarıyla tamamlandı ve kaydedildi.",
            accent: "#f59e0b",
            xp: blockXpTotal,
            durationSeconds: blockDurationSec,
            requireAction: true,
            actionText: "Kaydet ve Çık",
            onAction: async () => await saveAndExitCompletedRunner()
          });
        }
      }
    }catch(err){ console.warn('LEVEL_COMPLETED save error', err); }
  }
  else if (data.type === "ASSIGNMENT_RANGE_COMPLETED") {
    const source = String(data.source || "");
    if (source === "block-3d") {
      if (userRole !== "student") return;
      if (block3DRunnerSession) {
        block3DRunnerSession.completionHandled = true;
      }
      syncRunnerSaveButtons();
      // 3D runner kendi "tebrikler" panelini gosteriyor.
      // Burada ikinci bir overlay acmayarak cift modal sorununu onleriz.
      return;
    }
    if (source === "compute-it") {
      if (!(userRole === "student" && computeRunnerSession && activeComputeAssignmentId) || computeRunnerSession.completionHandled) return;
      computeRunnerSession.completionHandled = true;
      syncRunnerSaveButtons();
      try {
        const iframe = document.getElementById("activity-iframe");
        iframe?.contentWindow?.postMessage({ type: "FORCE_ASSIGNMENT_LOCK" }, "*");
      } catch (e) {}
      let xp = 0;
      let sec = getComputeRunnerElapsedSeconds();
      try {
        const start = Math.max(1, Number(computeRunnerSession?.rangeStart || 1));
        const end = Math.max(start, Number(computeRunnerSession?.rangeEnd || start));
        const computedXp = computeRangeTotalXPFromLevels({
          levels: Array.isArray(data.levels) ? data.levels : [],
          levelStart: start,
          levelEnd: end,
          currentLevelIndex: Number(data.currentLevelIndex || 0),
          includeCurrentLevel: true
        });
        xp = Math.max(0, computedXp);
        await saveComputeRunnerSession({
          closeAfter: false,
          askContinue: false,
          levelsOverride: Array.isArray(data.levels) ? data.levels : null,
          currentLevelIndexOverride: Number(data.currentLevelIndex || 0),
          forceComplete: true
        });
        const uid = computeRunnerSession?.userId || currentUserId;
        const pRef = doc(db, "computeAssignmentProgress", `${activeComputeAssignmentId}_${uid}`);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          const p = pSnap.data() || {};
          xp = Math.max(xp, Math.max(0, Number(p.totalXP || 0)));
          sec = Math.max(0, Number(p.lastSessionSeconds || sec || 0));
        }
      } catch (e) {
        console.warn("compute range complete finalize error", e);
      }
      showCompletionCelebration({
        title: "Compute It Tamamlandı!",
        message: "Ödevde verilen seviye aralığı tamamlandı.",
        accent: "#f59e0b",
        xp,
        durationSeconds: sec,
        requireAction: true,
        actionText: "Kaydet ve Çık",
        onAction: async () => await saveAndExitCompletedRunner()
      });
      return;
    }
    if (source === "block-runner") {
      if (!(userRole === "student" && blockRunnerSession && activeBlockAssignmentId) || blockRunnerSession.completionHandled) return;
      blockRunnerSession.completionHandled = true;
      syncRunnerSaveButtons();
      try {
        const iframe = document.getElementById("activity-iframe");
        iframe?.contentWindow?.postMessage({ type: "FORCE_ASSIGNMENT_LOCK" }, "*");
      } catch (e) {}
      let xp = 0;
      let sec = getBlockRunnerElapsedSeconds();
      try {
        const start = Math.max(1, Number(blockRunnerSession?.rangeStart || 1));
        const end = Math.max(start, Number(blockRunnerSession?.rangeEnd || start));
        const computedXp = computeBlockRangeTotalXPFromLevels({
          levels: Array.isArray(data.levels) ? data.levels : [],
          levelStart: start,
          levelEnd: end,
          completedLevelIds: blockRunnerSession?.completedLevelIds || [],
          currentLevelIndex: Number(data.currentLevelIndex || 0),
          includeCurrentLevel: true
        });
        xp = Math.max(0, computedXp);
        await saveBlockRunnerSession({ closeAfter: false, askContinue: false });
        const uid = blockRunnerSession?.userId || currentUserId;
        const pRef = doc(db, "blockAssignmentProgress", `${activeBlockAssignmentId}_${uid}`);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          const p = pSnap.data() || {};
          xp = Math.max(xp, Math.max(0, Number(p.totalXP || 0)));
          sec = Math.max(0, Number(p.lastSessionSeconds || sec || 0));
        }
      } catch (e) {
        console.warn("block range complete finalize error", e);
      }
      showCompletionCelebration({
        title: "Blok Kodlama Tamamlandı!",
        message: "Ödevde verilen seviye aralığı tamamlandı.",
        accent: "#f59e0b",
        xp,
        durationSeconds: sec,
        requireAction: true,
        actionText: "Kaydet ve Çık",
        onAction: async () => await saveAndExitCompletedRunner()
      });
      return;
    }
  }
  else if (data.type === "LOCKED_LEVEL_WARNING") {
    showNotice(data.message || "Bu seviye henüz kilitli.", "#f39c12");
  }
});

// Button hooks for opening block runner
document.addEventListener('DOMContentLoaded', function(){
  const btnStudent = document.getElementById('btn-open-block-runner-student');
  if(btnStudent){ btnStudent.addEventListener('click', ()=> openBlockRunner(currentUserId)); }
  const btnTeacher = document.getElementById('btn-open-block-reports');
  if(btnTeacher){ btnTeacher.addEventListener('click', ()=> loadBlockReportsForTeacher()); }
  const closeReports = document.getElementById('btn-close-block-reports');
  if(closeReports) closeReports.addEventListener('click', ()=>{ document.getElementById('block-reports-modal').style.display='none'; });
  
  const hubBlockBtn = document.getElementById('btn-apps-hub-open-block2d');
  if (hubBlockBtn) {
    hubBlockBtn.addEventListener('click', () => {
      closeAppsHubModal();
      openBlockRunner(currentUserId);
    });
  }
  const hubBlock3DBtn = document.getElementById('btn-apps-hub-open-block3d');
  if (hubBlock3DBtn) {
    hubBlock3DBtn.addEventListener('click', () => {
      closeAppsHubModal();
      openBlock3DRunner();
    });
  }
  const hubComputeBtn = document.getElementById('btn-apps-hub-open-compute');
  if (hubComputeBtn) {
    hubComputeBtn.addEventListener('click', () => {
      closeAppsHubModal();
      openComputeItRunner(currentUserId);
    });
  }
  const hubFlowchartBtn = document.getElementById('btn-apps-hub-open-flowchart');
  if (hubFlowchartBtn) {
    hubFlowchartBtn.addEventListener('click', () => {
      closeAppsHubModal();
      openFlowchartModal();
    });
  }
  const hubLineTraceBtn = document.getElementById('btn-apps-hub-open-line-trace');
  if (hubLineTraceBtn) {
    hubLineTraceBtn.addEventListener('click', () => {
      closeAppsHubModal();
      openLineTraceRunner();
    });
  }
});

// Load aggregated reports for teacher and show modal
async function loadBlockReportsForTeacher(){
  const modal = document.getElementById('block-reports-modal');
  const list = document.getElementById('block-reports-list');
  const loading = document.getElementById('block-reports-loading');
  if(!modal || !list || !loading) return;
  modal.style.display = 'flex'; list.style.display = 'none'; loading.style.display = 'block'; list.innerHTML = '';
  try{
    // get all users with role student
    const usersSnap = await getDocs(query(collection(db, 'users'), where('role','==','student')));
    const students = [];
    for(const u of usersSnap.docs){ students.push({ id: u.id, ...u.data() }); }
    // fetch reports in batch (studentReports)
    for(const s of students){
      try{
        const r = await getDoc(doc(db, 'studentReports', s.id));
        const gs = await getDoc(doc(db, 'gameStates', s.id));
        const rpt = r && r.exists() ? r.data() : {};
        const gsPayload = gs && gs.exists() ? gs.data().payload : null;
        const percent = rpt.lastPercent || computePercentFromGameStates(gsPayload);
        const xp = rpt.lastXP || computeXPFromGameStates(gsPayload);
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<div><strong>${s.name||s.displayName||s.email||s.id}</strong><br/><small>${s.class||''} ${s.section||''}</small></div><div style="text-align:right"><div style="font-weight:700">${xp} XP</div><div style="color:#6b7280">${percent}%</div><div style="margin-top:6px"><button class="btn" data-uid="${s.id}" style="padding:6px 8px;">Göster</button></div></div>`;
        const btn = item.querySelector('button');
        btn.addEventListener('click', ()=>{ openBlockRunner(s.id); });
        list.appendChild(item);
      }catch(e){ console.warn('report load student', s.id, e); }
    }
    loading.style.display = 'none'; list.style.display = 'block';
  }catch(e){ loading.innerText = 'Rapor yüklenemedi'; console.warn(e); }
}

function computePercentFromGameStates(payload){
  try{
    if(!payload || !Array.isArray(payload.levels)) return 0;
    const levels = payload.levels;
    const completed = levels.filter(l=>l.completed).length;
    return Math.round((completed / Math.max(1, levels.length)) * 100);
  }catch(e){ return 0; }
}

function computeXPFromGameStates(payload){
  try{
    if(!payload || !Array.isArray(payload.levels)) return 0;
    // sum xp property if present on levels
    return payload.levels.reduce((acc,l)=> acc + (l.xp||0), 0);
  }catch(e){ return 0; }
}


function getLiveSystemSeconds() {
  if (!currentUserId) return 0;
  const elapsed = sessionStart ? Math.max(0, Math.round((Date.now() - sessionStart) / 1000)) : 0;
  return (baseSystemSeconds || 0) + elapsed;
}

function setActivityFrameStatus(message = "", tone = "info") {
  const panel = document.getElementById("activity-frame-status");
  if (!panel) return;
  const text = String(message || "").trim();
  if (!text) {
    panel.style.display = "none";
    panel.innerText = "";
    panel.className = "activity-frame-status";
    return;
  }
  panel.innerText = text;
  panel.className = "activity-frame-status";
  if (tone === "warn") panel.classList.add("warn");
  if (tone === "error") panel.classList.add("error");
  panel.style.display = "block";
}

function setupIframeFallback(iframe, link, options = {}) {
  if (!iframe) return;
  if (activityFrameLoadTimer) clearTimeout(activityFrameLoadTimer);
  if (contentFrameLoadTimer) clearTimeout(contentFrameLoadTimer);
  const waitMs = Math.max(500, Number(options?.waitMs || 2500));
  const countdownSeconds = Math.max(0, Number(options?.fallbackCountdownSeconds || 0));
  const loadingText = String(options?.loadingText || "İçerik iframe penceresinde yükleniyor...");
  const redirectText = String(options?.redirectText || "Iframe açılmadı. Yeni pencereye yönlendiriliyorsunuz");
  const showLoadingNotice = !!options?.showLoadingNotice;
  if (showLoadingNotice && iframe.id === "activity-iframe") {
    setActivityFrameStatus(loadingText, "info");
  }
  let loaded = false;
  let fallbackOpened = false;
  const openInNewTabNow = () => {
    if (fallbackOpened || !link) return;
    fallbackOpened = true;
    if (iframe.id === "activity-iframe") {
      setActivityFrameStatus("Site iframe içinde açılamadı. Yeni sekmede açılıyor...", "warn");
    } else {
      showNotice("Site iframe içinde açılamadı. Yeni sekmede açılıyor...", "#f39c12");
    }
    try {
      const w = window.open(link, "_blank");
      if (!w) {
        if (iframe.id === "activity-iframe") setActivityFrameStatus("Tarayıcı yeni sekmeyi engelledi. Butona tıklayın.", "error");
        else showNotice("Tarayıcı yeni sekmeyi engelledi. Butona tıklayın.", "#f39c12");
      }
    } catch (e) {
      if (iframe.id === "activity-iframe") setActivityFrameStatus("Yeni sekme açılamadı. Butona tıklayın.", "error");
      else showNotice("Yeni sekme açılamadı. Butona tıklayın.", "#f39c12");
    }
    if (iframe.id === "activity-iframe") {
      const overlay = document.getElementById("external-app-overlay");
      if (overlay) overlay.style.display = "flex";
    }
  };
  const openInNewTab = () => {
    if (fallbackOpened || !link) return;
    if (countdownSeconds <= 0) {
      openInNewTabNow();
      return;
    }
    let remaining = countdownSeconds;
    const tick = () => {
      if (fallbackOpened) return;
      if (iframe.id === "activity-iframe") setActivityFrameStatus(`${redirectText} (${remaining} sn)`, "warn");
      else showNotice(`${redirectText} (${remaining} sn)`, "#f39c12");
      if (remaining <= 0) {
        openInNewTabNow();
        return;
      }
      remaining -= 1;
      setTimeout(tick, 1000);
    };
    tick();
  };
  const onLoad = () => {
    loaded = true;
    iframe.removeEventListener("load", onLoad);
    if (iframe.id === "activity-iframe") {
      setActivityFrameStatus("");
    }
  };
  iframe.addEventListener("load", onLoad, { once: true });
  const onError = () => {
    if (loaded) return;
    openInNewTab();
  };
  iframe.addEventListener("error", onError, { once: true });
  const timer = setTimeout(() => {
    if (loaded) return;
    if (link) {
      openInNewTab();
    } else {
      if (iframe.id === "activity-iframe") setActivityFrameStatus("Uygulama linki yok!", "error");
      else showNotice("Uygulama linki yok!", "#e74c3c");
    }
  }, waitMs);
  if (iframe.id === "activity-iframe") activityFrameLoadTimer = timer;
  if (iframe.id === "content-app-iframe") contentFrameLoadTimer = timer;
}

/* ================= BİLDİRİM SİSTEMİ ================= */
function showNotice(msg, color = "#4a90e2") {
  const n = document.createElement("div");
  n.innerText = msg;
  n.style.cssText = `
    position:fixed;
    bottom:20px;
    right:20px;
    background:${color};
    color:white;
    padding:12px 25px;
    border-radius:10px;
    z-index:50050;
    font-weight:bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

let completionCelebrationCleanup = null;
function showCompletionCelebration({
  title = "Tebrikler!",
  message = "Ödev tamamlandı.",
  accent = "#f59e0b",
  xp = null,
  durationSeconds = null,
  durationMs = 1800,
  onDone = null,
  requireAction = false,
  actionText = "Tamam",
  onAction = null
} = {}) {
  try {
    if (typeof completionCelebrationCleanup === "function") {
      completionCelebrationCleanup();
      completionCelebrationCleanup = null;
    }

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10020;
      background: rgba(2, 6, 23, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(3px);
    `;

    const card = document.createElement("div");
    card.style.cssText = `
      position: relative;
      width: min(92vw, 560px);
      border-radius: 18px;
      background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 24px 60px rgba(2, 6, 23, 0.55);
      color: #f8fafc;
      text-align: center;
      padding: 28px 22px 24px;
      overflow: hidden;
      animation: popIn .22s ease-out;
    `;

    const trophy = document.createElement("div");
    trophy.textContent = "🏆";
    trophy.style.cssText = `
      font-size: 46px;
      line-height: 1;
      margin-bottom: 10px;
      filter: drop-shadow(0 8px 18px rgba(245, 158, 11, 0.55));
    `;

    const titleEl = document.createElement("div");
    titleEl.textContent = title;
    titleEl.style.cssText = `
      font-size: 24px;
      font-weight: 800;
      letter-spacing: .3px;
      margin-bottom: 8px;
    `;

    const msgEl = document.createElement("div");
    msgEl.textContent = message;
    msgEl.style.cssText = `
      font-size: 15px;
      font-weight: 500;
      color: #cbd5e1;
      margin-bottom: 14px;
    `;

    const badge = document.createElement("div");
    badge.textContent = "Kayıt veritabanına işlendi";
    badge.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      background: ${accent};
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35);
    `;

    const infoRow = document.createElement("div");
    infoRow.style.cssText = `
      margin: 14px auto 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    `;
    const infoPill = (text) => {
      const el = document.createElement("div");
      el.textContent = text;
      el.style.cssText = `
        background: rgba(148, 163, 184, 0.16);
        color: #e2e8f0;
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 700;
      `;
      return el;
    };
    if (Number.isFinite(Number(xp))) {
      infoRow.appendChild(infoPill(`⭐ ${Math.max(0, Number(xp))} XP`));
    }
    if (Number.isFinite(Number(durationSeconds))) {
      const p = formatDurationParts(Number(durationSeconds));
      const txt = p.days > 0
        ? `${p.days}g ${p.hours}s ${p.mins}dk`
        : p.hours > 0
          ? `${p.hours}s ${p.mins}dk ${p.secs}sn`
          : `${p.mins} dk ${p.secs} sn`;
      infoRow.appendChild(infoPill(`🧭 ${txt}`));
    }

    const canvas = document.createElement("canvas");
    canvas.width = 560;
    canvas.height = 220;
    canvas.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;

    card.appendChild(canvas);
    card.appendChild(trophy);
    card.appendChild(titleEl);
    card.appendChild(msgEl);
    card.appendChild(badge);
    if (infoRow.childNodes.length > 0) card.appendChild(infoRow);

    const actionBtn = document.createElement("button");
    actionBtn.textContent = actionText || "Tamam";
    actionBtn.style.cssText = `
      margin-top: 16px;
      border: none;
      border-radius: 12px;
      background: ${accent};
      color: #0f172a;
      font-weight: 800;
      font-size: 14px;
      padding: 10px 18px;
      cursor: pointer;
      box-shadow: 0 10px 22px rgba(2, 6, 23, 0.35);
    `;
    actionBtn.onclick = async () => {
      try {
        if (typeof onAction === "function") {
          const res = await onAction();
          if (res === false) return;
        }
      } catch (e) {
        console.warn("completion action error", e);
      }
      finish();
    };
    if (requireAction) card.appendChild(actionBtn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const ctx = canvas.getContext("2d");
    const pieces = Array.from({ length: 90 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2.1,
      vy: 1.8 + Math.random() * 2.6,
      r: 3 + Math.random() * 3,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
      color: ["#f59e0b", "#22c55e", "#3b82f6", "#ef4444", "#eab308"][i % 5]
    }));
    let rafId = 0;
    let ended = false;

    const draw = () => {
      if (!ctx || ended) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > canvas.height + 12) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
        ctx.restore();
      });
      rafId = requestAnimationFrame(draw);
    };
    draw();

    const finish = () => {
      if (ended) return;
      ended = true;
      if (rafId) cancelAnimationFrame(rafId);
      overlay.remove();
      completionCelebrationCleanup = null;
      if (typeof onDone === "function") onDone();
    };
    completionCelebrationCleanup = finish;
    if (!requireAction) {
      setTimeout(finish, Math.max(900, Number(durationMs || 1800)));
    }
  } catch (e) {
    console.warn("showCompletionCelebration error", e);
    if (typeof onDone === "function") onDone();
  }
}

function isRunnerCompletionHandled() {
  if (currentRunnerType === "compute") return !!computeRunnerSession?.completionHandled;
  if (currentRunnerType === "block") return !!blockRunnerSession?.completionHandled;
  if (currentRunnerType === "block3d") return !!block3DRunnerSession?.completionHandled;
  return false;
}

function syncRunnerSaveButtons() {
  const done = isRunnerCompletionHandled();
  const text = done ? "Kaydet ve Çık" : "Kaydet";
  const ids = ["btn-activity-save", "btn-activity-head-save", "btn-activity-full-save"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  });
}

async function saveAndExitCompletedRunner() {
  if (currentRunnerType === "compute") {
    if (!computeRunnerSession) return true;
    pauseComputeRunnerTimer();
    return await saveComputeRunnerSession({ closeAfter: true, askContinue: false });
  }
  if (currentRunnerType === "block") {
    if (!blockRunnerSession) return true;
    pauseBlockRunnerTimer();
    return await saveBlockRunnerSession({ closeAfter: true, askContinue: false });
  }
  if (currentRunnerType === "block3d") {
    return await saveBlock3DRunnerSession({ closeAfter: true, askContinue: false });
  }
  closeBlockRunnerView();
  return true;
}

async function requestRunnerExitWithPromptPolicy() {
  const shouldCloseDirectly = isRunnerCompletionHandled();
  if (currentRunnerType === "compute") {
    if (!computeRunnerSession) {
      closeBlockRunnerView();
      return true;
    }
    pauseComputeRunnerTimer();
    return await saveComputeRunnerSession({ closeAfter: true, askContinue: !shouldCloseDirectly });
  }
  if (currentRunnerType === "block3d") {
    if (!block3DRunnerSession) {
      closeBlockRunnerView();
      return true;
    }
    return await saveBlock3DRunnerSession({ closeAfter: true, askContinue: !shouldCloseDirectly });
  }
  if (currentRunnerType === "block") {
    if (!blockRunnerSession) {
      closeBlockRunnerView();
      return true;
    }
    pauseBlockRunnerTimer();
    return await saveBlockRunnerSession({ closeAfter: true, askContinue: !shouldCloseDirectly });
  }
  closeBlockRunnerView();
  return true;
}

/* ================= SAYFA YÖNETİMİ ================= */
function getHomeTabsByRole(role) {
  if (role === "teacher") {
    return [
      { id: "teacher-analytics", label: "Özet Bilgiler" },
      { id: "tasks-section", label: "Ödevler" },
      { id: "activities-section", label: "Etkinlikler" },
      { id: "quiz-section", label: "Quizler" },
      { id: "block-homework-section", label: "Blok & 3D Blok Code" },
      { id: "compute-homework-section", label: "Compute It" },
      { id: "lessons-section", label: "Dersler" },
      { id: "top-students-card", label: "Öğrencilerim" }
    ];
  }
  return [
    { id: "tasks-section", label: "Ödevlerim" },
    { id: "activities-section", label: "Etkinliklerim" },
    { id: "block-homework-section", label: "Blok Kodlama" },
    { id: "compute-homework-section", label: "Compute It" },
    { id: "lessons-section", label: "Derslerim" },
    { id: "leaderboard-section", label: "Raporlar" }
  ];
}

function getHomePanelDisplay(panelId) {
  if (panelId === "teacher-analytics") return "flex";
  if (panelId === "student-stats-bar") return "block";
  return "flex";
}

function setHomePanel(panelId) {
  const defs = getHomeTabsByRole(userRole);
  const allowed = new Set(defs.map((d) => d.id));
  if (!allowed.has(panelId)) panelId = defs[0]?.id || null;
  if (!panelId) return;
  activeHomePanelId = panelId;

  HOME_PANEL_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!allowed.has(id)) {
      el.style.display = "none";
      return;
    }
    el.style.display = id === panelId ? getHomePanelDisplay(id) : "none";
  });

  const tabs = document.getElementById("home-tabs");
  if (tabs) {
    tabs.querySelectorAll(".home-tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.panel === panelId);
    });
  }
}

function renderHomeTabs() {
  const tabs = document.getElementById("home-tabs");
  if (!tabs || !userRole) return;
  const defs = getHomeTabsByRole(userRole);
  tabs.style.display = defs.length ? "flex" : "none";
  tabs.innerHTML = defs
    .map((d) => `<button class="home-tab-btn" data-panel="${d.id}">${d.label}</button>`)
    .join("");
  tabs.querySelectorAll(".home-tab-btn").forEach((btn) => {
    btn.onclick = () => setHomePanel(btn.dataset.panel);
  });
  setHomePanel(activeHomePanelId || defs[0].id);
}

window.showPage = function(page) {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.page === page) btn.classList.add("active");
  });
  if (page === "home") {
    const app = document.getElementById("app-screen");
    if (app) app.style.display = "grid";
  }
};

function getLiveQuizQuestionSummary(q, i) {
  const text = String(q?.question || `Soru ${i + 1}`);
  return text.length > 36 ? `${text.slice(0, 36)}...` : text;
}

function setLiveQuizImagePreview(dataUrl = "") {
  currentLiveQuizImageDataUrl = String(dataUrl || "").trim();
  const preview = document.getElementById("live-q-image-preview");
  if (!preview) return;
  if (!currentLiveQuizImageDataUrl) {
    preview.innerHTML = "Soruya görsel ekleyebilirsin.";
    return;
  }
  preview.innerHTML = `<img src="${currentLiveQuizImageDataUrl}" alt="Soru görseli">`;
}

async function readLiveQuizImageFile(file) {
  if (!file) return "";
  if (!String(file.type || "").startsWith("image/")) {
    showNotice("Sadece görsel dosyası yükleyin.", "#e74c3c");
    return "";
  }
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function cloneLiveQuizQuestion(q = {}) {
  const normalizedDurationSec = Math.max(
    5,
    Number(q?.durationSec ?? q?.duration ?? q?.timeSec ?? 0) || 30
  );
  return {
    type: q.type || "multiple",
    question: q.question || "",
    imageDataUrl: String(q.imageDataUrl || ""),
    options: Array.isArray(q.options) ? q.options.slice() : [],
    pairs: Array.isArray(q.pairs) ? q.pairs.map((p) => ({ left: p?.left || "", right: p?.right || "" })) : [],
    correct: q.correct || "",
    durationSec: normalizedDurationSec,
    xp: Math.max(0, Number(q.xp ?? MAX_QUESTION_XP))
  };
}

function fillLiveQuizEditorFromQuestion(q = {}) {
  document.getElementById("live-q-text").value = q.question || "";
  document.getElementById("live-q-type").value = q.type || "multiple";
  document.getElementById("live-q-a").value = q.options?.[0] || "";
  document.getElementById("live-q-b").value = q.options?.[1] || "";
  document.getElementById("live-q-c").value = q.options?.[2] || "";
  document.getElementById("live-q-d").value = q.options?.[3] || "";
  document.getElementById("live-q-correct").value = q.correct || "";
  document.getElementById("live-q-duration").value = Math.max(5, Number(q.durationSec ?? q.duration ?? 0) || 30);
  document.getElementById("live-q-xp").value = String(Math.max(0, Number(q.xp ?? MAX_QUESTION_XP)));
  setLiveQuizImagePreview(q.imageDataUrl || "");
  const imgInput = document.getElementById("live-q-image");
  if (imgInput) imgInput.value = "";
  const pairsInput = document.getElementById("live-q-match-pairs");
  if (pairsInput) {
    const pairs = Array.isArray(q.pairs) ? q.pairs : [];
    pairsInput.value = pairs.map((p) => `${p.left || ""} = ${p.right || ""}`).join("\n");
  }
  updateLiveQuizEditorForType();
  renderLiveQuizBuilderPreview();
}

function duplicateLiveQuizQuestion(index) {
  if (!Number.isInteger(index) || index < 0 || index >= liveQuizItems.length) return;
  const copied = cloneLiveQuizQuestion(liveQuizItems[index]);
  liveQuizItems.splice(index + 1, 0, copied);
  liveQuizSelectedQuestionIndex = index + 1;
  renderLiveQuizQuestionList();
  fillLiveQuizEditorFromQuestion(liveQuizItems[liveQuizSelectedQuestionIndex] || {});
  showNotice("Soru kopyalandı.", "#2ecc71");
}

function moveLiveQuizQuestion(fromIndex, toIndex) {
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) return;
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= liveQuizItems.length || toIndex >= liveQuizItems.length) return;
  if (fromIndex === toIndex) return;
  const [moved] = liveQuizItems.splice(fromIndex, 1);
  liveQuizItems.splice(toIndex, 0, moved);
  if (liveQuizSelectedQuestionIndex === fromIndex) {
    liveQuizSelectedQuestionIndex = toIndex;
  } else if (fromIndex < liveQuizSelectedQuestionIndex && toIndex >= liveQuizSelectedQuestionIndex) {
    liveQuizSelectedQuestionIndex -= 1;
  } else if (fromIndex > liveQuizSelectedQuestionIndex && toIndex <= liveQuizSelectedQuestionIndex) {
    liveQuizSelectedQuestionIndex += 1;
  }
  renderLiveQuizQuestionList();
}

function removeLiveQuizQuestion(index) {
  if (!Number.isInteger(index) || index < 0 || index >= liveQuizItems.length) return;
  liveQuizItems.splice(index, 1);
  if (!liveQuizItems.length) {
    liveQuizSelectedQuestionIndex = -1;
    ["live-q-text","live-q-a","live-q-b","live-q-c","live-q-d","live-q-correct","live-q-match-pairs"].forEach((id) => {
      const el = document.getElementById(id); if (el) el.value = "";
    });
    setLiveQuizImagePreview("");
    const imgInput = document.getElementById("live-q-image");
    if (imgInput) imgInput.value = "";
    const qDuration = document.getElementById("live-q-duration");
    if (qDuration) qDuration.value = "30";
    const qXp = document.getElementById("live-q-xp");
    if (qXp) qXp.value = String(MAX_QUESTION_XP);
  } else {
    liveQuizSelectedQuestionIndex = Math.max(0, Math.min(index, liveQuizItems.length - 1));
    fillLiveQuizEditorFromQuestion(liveQuizItems[liveQuizSelectedQuestionIndex] || {});
  }
  updateLiveQuizEditorForType();
  renderLiveQuizBuilderPreview();
  renderLiveQuizQuestionList();
}

function renderLiveQuizBuilderPreview() {
  const qText = document.getElementById("live-q-text")?.value?.trim() || "Soru önizlemesi burada görünecek.";
  const qType = document.getElementById("live-q-type")?.value || "multiple";
  const a = (document.getElementById("live-q-a")?.value || "").trim();
  const b = (document.getElementById("live-q-b")?.value || "").trim();
  const c = (document.getElementById("live-q-c")?.value || "").trim();
  const d = (document.getElementById("live-q-d")?.value || "").trim();
  const previewQ = document.getElementById("live-quiz-preview-q");
  const previewGrid = document.getElementById("live-quiz-preview-grid");
  if (!previewQ || !previewGrid) return;
  const hasImage = !!currentLiveQuizImageDataUrl;
  if (hasImage) {
    previewQ.innerHTML = `<div style="display:grid;gap:8px;"><img src="${currentLiveQuizImageDataUrl}" alt="Soru görseli" style="max-height:180px;max-width:100%;border-radius:8px;border:1px solid rgba(255,255,255,0.25);object-fit:cover;"><div>${escapeHtmlBasic(qText)}</div></div>`;
  } else {
    previewQ.innerText = qText;
  }
  if (qType === "matching") {
    const pairsText = document.getElementById("live-q-match-pairs")?.value || "";
    const pairs = parseLiveMatchingPairsFromText(pairsText);
    const leftHtml = pairs.length
      ? pairs.map((p, i) => `<div class="live-quiz-preview-item">${i + 1}. ${p.left}</div>`).join("")
      : `<div class="live-quiz-preview-item">1. Sol ifade</div><div class="live-quiz-preview-item">2. Sol ifade</div>`;
    const rightHtml = pairs.length
      ? pairs.map((p, i) => `<div class="live-quiz-preview-item">${String.fromCharCode(65 + i)}) ${p.right}</div>`).join("")
      : `<div class="live-quiz-preview-item">A) Sağ ifade</div><div class="live-quiz-preview-item">B) Sağ ifade</div>`;
    previewGrid.innerHTML = `
      <div style="display:grid;gap:8px;">${leftHtml}</div>
      <div style="display:grid;gap:8px;">${rightHtml}</div>
    `;
    return;
  }
  const options = qType === "truefalse"
    ? ["Doğru", "Yanlış"]
    : [a || "A seçeneği", b || "B seçeneği", c || "C seçeneği", d || "D seçeneği"];
  previewGrid.innerHTML = options.map((opt, i) => `
    <div class="live-quiz-preview-item">${qType === "truefalse" ? opt : `${String.fromCharCode(65 + i)}) ${opt}`}</div>
  `).join("");
}

function updateLiveQuizEditorForType() {
  const type = document.getElementById("live-q-type")?.value || "multiple";
  const optionIds = ["live-q-a", "live-q-b", "live-q-c", "live-q-d"];
  const pairsInput = document.getElementById("live-q-match-pairs");
  const isMatching = type === "matching";
  const isTrueFalse = type === "truefalse";
  optionIds.forEach((id, idx) => {
    const el = document.getElementById(id);
    if (!el) return;
    const enabled = !isTrueFalse && !isMatching;
    el.disabled = !enabled;
    if (isTrueFalse) {
      el.value = idx === 0 ? "Doğru" : idx === 1 ? "Yanlış" : "";
    } else if (isMatching) {
      el.value = "";
    }
  });
  const correct = document.getElementById("live-q-correct");
  if (correct) {
    correct.placeholder = isTrueFalse
      ? "Doğru cevap: doğru / yanlış"
      : isMatching
        ? "Eşleştirme tipinde otomatik kontrol edilir"
        : "Doğru seçenek (A/B/C/D)";
    correct.disabled = isMatching;
    if (isMatching) correct.value = "";
  }
  if (pairsInput) {
    pairsInput.style.display = isMatching ? "block" : "none";
    pairsInput.disabled = !isMatching;
  }
}

function renderLiveQuizQuestionList() {
  const list = document.getElementById("live-quiz-question-list");
  if (!list) return;
  list.innerHTML = "";
  if (!liveQuizItems.length) {
    list.innerHTML = `<div style="color:#94a3b8;padding:10px;">Soru yok</div>`;
    return;
  }
  liveQuizItems.forEach((q, i) => {
    const row = document.createElement("div");
    row.className = `live-quiz-question-row ${i===liveQuizSelectedQuestionIndex ? "active" : ""}`;
    row.draggable = true;
    const questionDuration = Math.max(5, Number(q?.durationSec ?? q?.duration ?? 0) || 30);
    const questionXP = Math.max(0, Number(q?.xp ?? MAX_QUESTION_XP));
    row.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="min-width:0;flex:1;">
          <div><strong>${i + 1}.</strong> ${getLiveQuizQuestionSummary(q, i)}</div>
          <div class="meta">${
            q?.type === "truefalse"
              ? "Doğru/Yanlış"
              : q?.type === "matching"
                ? "Sürükle-Bırak Eşleştirme"
                : "Çoktan Seçmeli"
          }${q?.imageDataUrl ? " • Görselli" : ""} • ${questionDuration} sn • ${questionXP} XP • Sürükle-bırak ile sırala</div>
        </div>
        <div style="display:flex;gap:4px;">
          <button class="btn" data-act="copy" style="padding:4px 7px;font-size:12px;background:#eef2ff;color:#1e3a8a;">Kopya</button>
          <button class="btn" data-act="del" style="padding:4px 7px;font-size:12px;background:#fee2e2;color:#991b1b;">Sil</button>
        </div>
      </div>
    `;
    row.addEventListener("dragstart", () => {
      liveQuizDragIndex = i;
      row.style.opacity = "0.55";
    });
    row.addEventListener("dragend", () => {
      row.style.opacity = "1";
      liveQuizDragIndex = -1;
    });
    row.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      row.style.borderColor = "#2563eb";
    });
    row.addEventListener("dragleave", () => {
      row.style.borderColor = "";
    });
    row.addEventListener("drop", (ev) => {
      ev.preventDefault();
      row.style.borderColor = "";
      if (liveQuizDragIndex < 0) return;
      moveLiveQuizQuestion(liveQuizDragIndex, i);
    });
    row.onclick = () => {
      liveQuizSelectedQuestionIndex = i;
      fillLiveQuizEditorFromQuestion(liveQuizItems[i] || {});
      renderLiveQuizQuestionList();
    };
    row.querySelector('[data-act="copy"]')?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      duplicateLiveQuizQuestion(i);
    });
    row.querySelector('[data-act="del"]')?.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      const ok = await showConfirm(`"${getLiveQuizQuestionSummary(q, i)}" sorusu silinsin mi?`);
      if (!ok) return;
      removeLiveQuizQuestion(i);
      showNotice("Soru silindi.", "#2ecc71");
    });
    list.appendChild(row);
  });
}

function resetLiveQuizEditor() {
  liveQuizItems = [];
  liveQuizSelectedQuestionIndex = -1;
  liveQuizEditingId = null;
  const ids = [
    "live-quiz-title","live-quiz-class","live-quiz-section","live-q-text","live-q-a","live-q-b","live-q-c","live-q-d","live-q-correct","live-q-match-pairs"
  ];
  ids.forEach((id) => { const el = document.getElementById(id); if (el) el.value = ""; });
  setLiveQuizImagePreview("");
  const imgInput = document.getElementById("live-q-image");
  if (imgInput) imgInput.value = "";
  const qDur = document.getElementById("live-q-duration");
  if (qDur) qDur.value = 30;
  const qXp = document.getElementById("live-q-xp");
  if (qXp) qXp.value = String(MAX_QUESTION_XP);
  const qType = document.getElementById("live-q-type");
  if (qType) qType.value = "multiple";
  updateLiveQuizEditorForType();
  renderLiveQuizQuestionList();
  renderLiveQuizBuilderPreview();
}

function openLiveQuizModal() {
  const modal = document.getElementById("live-quiz-modal");
  if (!modal) return;
  modal.style.display = "flex";
  setLiveQuizTab("create");
  resetLiveQuizEditor();
  loadTeacherLiveQuizList();
  listenTeacherLiveSession();
  setTeacherHomeResultsView(
    teacherHomeLatestRankingRows,
    teacherHomeLatestResultsMeta || "Son quiz sonuçları",
    teacherHomeDisplayedResultsSessionId || ""
  );
}

function closeLiveQuizModal() {
  const modal = document.getElementById("live-quiz-modal");
  if (modal) modal.style.display = "none";
}

function setLiveQuizTab(tab) {
  const next = String(tab || "create");
  const titleEl = document.getElementById("live-quiz-modal-title");
  const createBtn = document.getElementById("tab-live-quiz-create");
  const startBtn = document.getElementById("tab-live-quiz-start");
  const resultsBtn = document.getElementById("tab-live-quiz-results");
  const createPane = document.getElementById("live-quiz-create-pane");
  const startPane = document.getElementById("live-quiz-start-pane");
  const resultsPane = document.getElementById("live-quiz-results-pane");
  if (createBtn) createBtn.classList.toggle("active", next === "create");
  if (startBtn) startBtn.classList.toggle("active", next === "start");
  if (resultsBtn) resultsBtn.classList.toggle("active", next === "results");
  if (createPane) createPane.style.display = next === "create" ? "grid" : "none";
  if (startPane) startPane.style.display = next === "start" ? "block" : "none";
  if (resultsPane) resultsPane.style.display = next === "results" ? "block" : "none";
  if (titleEl) titleEl.innerText = next === "results" ? "Quiz Sonuçları" : "Canlı Quiz";
  if (next === "start") {
    loadTeacherLiveQuizList();
    listenTeacherLiveSession();
  }
}

async function loadTeacherLiveQuizList() {
  const list = document.getElementById("live-quiz-list");
  if (!list || userRole !== "teacher" || !currentUserId) return;
  list.innerHTML = `<div class="loading">Yükleniyor...</div>`;
  try {
    const qx = query(collection(db, "liveQuizzes"), where("teacherId", "==", currentUserId));
    const snap = await getDocs(qx);
    const rows = [];
    snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    const visibleRows = rows.filter((qz) => !qz?.isDeleted);
    if (!visibleRows.length) {
      list.innerHTML = `<div class="empty-state">Kayıtlı quiz yok.</div>`;
      return;
    }
    list.innerHTML = "";
    visibleRows.forEach((qz) => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div>
          <div style="font-weight:700;">${qz.title || "Quiz"}</div>
          <small>${(qz.questions || []).length} soru • ${qz.targetClass || "Tüm sınıflar"}${qz.targetSection ? "/" + qz.targetSection : ""}</small>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-primary">Düzenle</button>
          <button class="btn btn-success">Başlat</button>
          <button class="btn btn-danger">Sil</button>
        </div>
      `;
      const [btnEdit, btnStart, btnDelete] = div.querySelectorAll("button");
      btnEdit.onclick = () => {
        liveQuizEditingId = qz.id;
        liveQuizItems = Array.isArray(qz.questions) ? qz.questions.map((q) => cloneLiveQuizQuestion(q)) : [];
        liveQuizSelectedQuestionIndex = liveQuizItems.length ? 0 : -1;
        document.getElementById("live-quiz-title").value = qz.title || "";
        document.getElementById("live-quiz-class").value = qz.targetClass || "";
        document.getElementById("live-quiz-section").value = qz.targetSection || "";
        if (liveQuizItems.length > 0) fillLiveQuizEditorFromQuestion(liveQuizItems[0] || {});
        else setLiveQuizImagePreview("");
        document.getElementById("tab-live-quiz-create")?.click();
        renderLiveQuizQuestionList();
        renderLiveQuizBuilderPreview();
      };
      btnStart.onclick = () => startLiveSession(qz);
      btnDelete.onclick = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        deleteLiveQuizById(qz.id, qz.title || "Quiz");
      };
      list.appendChild(div);
    });
  } catch (e) {
    list.innerHTML = `<div style="color:#b91c1c;">Quizler yüklenemedi</div>`;
  }
}

function stopTeacherHomeQuizListener() {
  if (liveQuizHomeUnsub) {
    liveQuizHomeUnsub();
    liveQuizHomeUnsub = null;
  }
  if (liveQuizResultsHomeUnsub) {
    liveQuizResultsHomeUnsub();
    liveQuizResultsHomeUnsub = null;
  }
}

function setTeacherHomeResultsView(rows = [], metaText = "", sessionId = "") {
  teacherHomeDisplayedResultsSessionId = String(sessionId || "");
  teacherHomeLatestRankingRows = Array.isArray(rows) ? rows.slice() : [];
  teacherHomeLatestResultsMeta = String(metaText || "");
  const renderInto = (resultsList, resultsMeta) => {
    if (!resultsList) return;
    if (resultsMeta) resultsMeta.innerText = teacherHomeLatestResultsMeta;
    if (!teacherHomeLatestRankingRows.length) {
      resultsList.innerHTML = `<div class="empty-state" style="padding:10px;">Henüz tamamlanan quiz sonucu yok.</div>`;
      return;
    }
    resultsList.innerHTML = teacherHomeLatestRankingRows.slice(0, 24).map((r, i) => `
    <div class="list-item" style="cursor:default;padding:8px 10px;">
      <div>
        <strong>${i + 1}. ${r.studentName || r.name || r.userId || "-"}</strong><br>
        <small>${r.correct || 0}D / ${r.wrong || 0}Y • ${formatQuizDurationText(r.durationMs, r.durationMinutes)}</small>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700;color:#2563eb;">${r.xpEarned ?? r.xp ?? 0} XP</div>
        <small>%${r.successRate || 0}</small>
      </div>
    </div>
  `).join("");
  };
  renderInto(
    document.getElementById("teacher-quiz-results-list"),
    document.getElementById("teacher-quiz-results-meta")
  );
  renderInto(
    document.getElementById("teacher-quiz-results-list-modal"),
    document.getElementById("teacher-quiz-results-meta-modal")
  );
}

function getSortedQuizRanking(rows = []) {
  return rows.slice().sort((a, b) => {
    const xpDiff = Number((b.xpEarned ?? b.xp) || 0) - Number((a.xpEarned ?? a.xp) || 0);
    if (xpDiff !== 0) return xpDiff;
    const rateDiff = Number(b.successRate || 0) - Number(a.successRate || 0);
    if (rateDiff !== 0) return rateDiff;
    const aDuration = toDurationMs(a.durationMs, a.durationMinutes);
    const bDuration = toDurationMs(b.durationMs, b.durationMinutes);
    if (aDuration !== bDuration) return aDuration - bDuration;
    return Number(a.finishedAtMs || 0) - Number(b.finishedAtMs || 0);
  });
}

function openTeacherQuizResultsReport() {
  if (!teacherHomeLatestRankingRows.length) {
    showNotice("Rapor için quiz sonucu bulunamadı.", "#f39c12");
    return;
  }
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    showNotice("Rapor penceresi açılamadı.", "#e74c3c");
    return;
  }
  const rowsHtml = teacherHomeLatestRankingRows.map((r, i) => {
    const correct = Number(r.correct || 0);
    const wrong = Number(r.wrong || 0);
    const answered = Math.max(0, correct + wrong);
    const successRate = answered > 0
      ? Math.round((correct / answered) * 100)
      : Math.max(0, Math.min(100, Number(r.successRate || 0)));
    const barWidth = Math.max(0, Math.min(100, successRate));
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${r.studentName || r.name || r.userId || "-"}</td>
        <td>${correct}</td>
        <td>${wrong}</td>
        <td>${Number((r.xpEarned ?? r.xp) || 0)} XP</td>
        <td>%${successRate}</td>
        <td>${formatQuizDurationText(r.durationMs, r.durationMinutes)}</td>
        <td><div style="height:8px;border-radius:999px;background:#e5e7eb;"><div style="height:8px;border-radius:999px;background:#22c55e;width:${barWidth}%;"></div></div></td>
      </tr>
    `;
  }).join("");
  reportWindow.document.write(`
    <html lang="tr"><head><meta charset="UTF-8"><title>Quiz Sonuç Raporu</title>
    <style>
      body{font-family:Segoe UI,Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:16px;}
      .card{max-width:1100px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;}
      .top-actions{max-width:1100px;margin:0 auto 10px;display:flex;justify-content:flex-end;gap:8px;}
      .report-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px;}
      .report-head-left{display:flex;align-items:center;gap:10px;min-width:0;}
      .report-logo{width:52px;height:52px;object-fit:contain;border-radius:10px;border:1px solid #dbeafe;background:#fff;flex:0 0 auto;}
      h2{margin:0 0 8px;color:#1e3a8a;}
      .meta{color:#475569;font-size:13px;margin-bottom:10px;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      th,td{border:1px solid #e5e7eb;padding:7px;text-align:left;}
      th{background:#eff6ff;color:#1e3a8a;}
      .actions{margin-top:12px;display:flex;justify-content:flex-end;gap:8px;}
      button{border:none;border-radius:8px;padding:8px 12px;cursor:pointer;background:#2563eb;color:#fff;font-weight:600;}
      .btn-close{background:#e5e7eb;color:#0f172a;}
      @media print {.actions,.top-actions{display:none;} body{background:#fff;padding:0;}.card{border:none;}}
    </style></head><body>
      <div class="top-actions">
        <button class="btn-close" onclick="window.close()">Kapat</button>
        <button onclick="window.print()">Yazdırma Önizleme</button>
      </div>
      <div class="card">
        <div class="report-head">
          <div class="report-head-left">
            <img src="logo.png" alt="Logo" class="report-logo">
            <h2>Quiz Sonuç Raporu</h2>
          </div>
        </div>
        <div class="meta">${teacherHomeLatestResultsMeta || "Quiz sonuçları"} • ${new Date().toLocaleString("tr-TR")}</div>
        <table><thead><tr><th>#</th><th>Öğrenci</th><th>Doğru</th><th>Yanlış</th><th>XP</th><th>Başarı</th><th>Süre</th><th>Doğru Grafiği</th></tr></thead>
        <tbody>${rowsHtml}</tbody></table>
        <div class="actions"><button onclick="window.print()">PDF / Yazdır</button></div>
      </div>
    </body></html>
  `);
  reportWindow.document.close();
}

function startTeacherHomeQuizListener() {
  const list = document.getElementById("quiz-list");
  const countEl = document.getElementById("teacher-quiz-count");
  const resultsList = document.getElementById("teacher-quiz-results-list");
  const resultsMeta = document.getElementById("teacher-quiz-results-meta");
  const clearResultsBtn = document.getElementById("btn-clear-teacher-quiz-results");
  const resultsListModal = document.getElementById("teacher-quiz-results-list-modal");
  const resultsMetaModal = document.getElementById("teacher-quiz-results-meta-modal");
  const clearResultsBtnModal = document.getElementById("btn-clear-teacher-quiz-results-modal");
  if (!list || !countEl) return;
  stopTeacherHomeQuizListener();
  if (userRole !== "teacher" || !currentUserId) {
    countEl.innerText = "0";
    list.innerHTML = "";
    if (resultsList) resultsList.innerHTML = "";
    if (resultsListModal) resultsListModal.innerHTML = "";
    if (resultsMeta) resultsMeta.innerText = "";
    if (resultsMetaModal) resultsMetaModal.innerText = "";
    teacherHomeDisplayedResultsSessionId = null;
    teacherHomeLatestRankingRows = [];
    teacherHomeLatestResultsMeta = "";
    teacherQuizResultSessions = [];
    teacherSelectedQuizSessionId = "";
    renderTeacherQuizSessionSelector();
    return;
  }
  list.innerHTML = `<div class="loading">Quizler yükleniyor...</div>`;
  if (resultsList) resultsList.innerHTML = `<div class="loading">Sonuçlar yükleniyor...</div>`;
  if (resultsListModal) resultsListModal.innerHTML = `<div class="loading">Sonuçlar yükleniyor...</div>`;
  if (resultsMeta) resultsMeta.innerText = "Sonuçlar yükleniyor...";
  if (resultsMetaModal) resultsMetaModal.innerText = "Sonuçlar yükleniyor...";
  const qx = query(collection(db, "liveQuizzes"), where("teacherId", "==", currentUserId));
  liveQuizHomeUnsub = onSnapshot(qx, (snap) => {
    const rows = [];
    snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    const visibleRows = rows.filter((qz) => !qz?.isDeleted);
    countEl.innerText = String(visibleRows.length);
    if (!visibleRows.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🧠</div>Henüz quiz eklenmedi.</div>`;
      return;
    }
    list.innerHTML = "";
    visibleRows.slice(0, 8).forEach((qz) => {
      const created = qz.createdAt?.toDate ? qz.createdAt.toDate().toLocaleDateString("tr-TR") : "-";
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div>
          <div style="font-weight:700;">${qz.title || "Quiz"}</div>
          <small>${(qz.questions || []).length} soru • ${qz.targetClass || "Tüm sınıflar"}${qz.targetSection ? "/" + qz.targetSection : ""}</small>
          <div style="font-size:12px;color:#64748b;margin-top:3px;">Oluşturulma: ${created}</div>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-primary">Yönet</button>
          <button class="btn btn-danger">Sil</button>
        </div>
      `;
      const [openBtn, deleteBtn] = div.querySelectorAll("button");
      if (openBtn) {
        openBtn.onclick = () => {
          openLiveQuizModal();
          liveQuizEditingId = qz.id;
          liveQuizItems = Array.isArray(qz.questions) ? qz.questions.map((q) => cloneLiveQuizQuestion(q)) : [];
          liveQuizSelectedQuestionIndex = liveQuizItems.length ? 0 : -1;
          const titleEl = document.getElementById("live-quiz-title");
          const classEl = document.getElementById("live-quiz-class");
          const sectionEl = document.getElementById("live-quiz-section");
          if (titleEl) titleEl.value = qz.title || "";
          if (classEl) classEl.value = qz.targetClass || "";
          if (sectionEl) sectionEl.value = qz.targetSection || "";
          if (liveQuizItems.length > 0) fillLiveQuizEditorFromQuestion(liveQuizItems[0] || {});
          else setLiveQuizImagePreview("");
          renderLiveQuizQuestionList();
          renderLiveQuizBuilderPreview();
        };
      }
      if (deleteBtn) {
        deleteBtn.onclick = (ev) => {
          ev.stopPropagation();
          deleteLiveQuizById(qz.id, qz.title || "Quiz");
        };
      }
      list.appendChild(div);
    });
  }, () => {
    list.innerHTML = `<div style="color:#b91c1c;">Quiz listesi yüklenemedi.</div>`;
  });

  const qResults = query(collection(db, "studentQuizResults"), where("teacherId", "==", currentUserId));
  liveQuizResultsHomeUnsub = onSnapshot(qResults, (snap) => {
    const rows = [];
    snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
    rows.sort((a, b) => Number(b.finishedAtMs || 0) - Number(a.finishedAtMs || 0));
    const clearHandler = () => {
      teacherSelectedQuizSessionId = "";
      teacherHomeQuizResultsClosedSessionId = null;
      if (rows.length) {
        const bySessionTmp = new Map();
        rows.forEach((r) => {
          const sid = String(r.sessionId || "");
          if (!sid) return;
          if (!bySessionTmp.has(sid)) bySessionTmp.set(sid, []);
          bySessionTmp.get(sid).push(r);
        });
        teacherQuizResultSessions = Array.from(bySessionTmp.entries()).map(([sessionId, items]) => ({
          sessionId,
          quizTitle: String(items[0]?.quizTitle || "Quiz"),
          participantCount: items.length,
          latestFinishedAtMs: Math.max(...items.map((item) => Number(item.finishedAtMs || 0)))
        })).sort((a, b) => Number(b.latestFinishedAtMs || 0) - Number(a.latestFinishedAtMs || 0));
        teacherSelectedQuizSessionId = String(teacherQuizResultSessions[0]?.sessionId || "");
        const firstItems = bySessionTmp.get(teacherSelectedQuizSessionId) || [];
        const ranking = getSortedQuizRanking(firstItems);
        const headerQuizTitle = ranking[0]?.quizTitle || "Quiz";
        const metaText = `${headerQuizTitle} • ${ranking.length} öğrenci tamamladı • Sonuç listesi`;
        setTeacherHomeResultsView(ranking, metaText, teacherSelectedQuizSessionId);
        renderTeacherQuizSessionSelector();
      } else {
        teacherQuizResultSessions = [];
        setTeacherHomeResultsView([], "Tamamlanan quiz bulunmuyor.", "");
        renderTeacherQuizSessionSelector();
      }
    };
    if (clearResultsBtn) clearResultsBtn.onclick = clearHandler;
    if (clearResultsBtnModal) clearResultsBtnModal.onclick = clearHandler;
    if (!rows.length) {
      teacherQuizResultSessions = [];
      teacherSelectedQuizSessionId = "";
      renderTeacherQuizSessionSelector();
      setTeacherHomeResultsView([], "Tamamlanan quiz bulunmuyor.", "");
      return;
    }

    const bySession = new Map();
    rows.forEach((r) => {
      const sid = String(r.sessionId || "");
      if (!sid) return;
      if (!bySession.has(sid)) bySession.set(sid, []);
      bySession.get(sid).push(r);
    });
    const sessionRows = Array.from(bySession.entries()).map(([sessionId, items]) => ({
      sessionId,
      quizTitle: String(items[0]?.quizTitle || "Quiz"),
      participantCount: items.length,
      items,
      latestFinishedAtMs: Math.max(...items.map((item) => Number(item.finishedAtMs || 0)))
    })).sort((a, b) => b.latestFinishedAtMs - a.latestFinishedAtMs);
    teacherQuizResultSessions = sessionRows.map((s) => ({
      sessionId: s.sessionId,
      quizTitle: s.quizTitle,
      participantCount: s.participantCount,
      latestFinishedAtMs: s.latestFinishedAtMs
    }));

    if (!sessionRows.length) {
      teacherSelectedQuizSessionId = "";
      renderTeacherQuizSessionSelector();
      setTeacherHomeResultsView(getSortedQuizRanking(rows), "Quiz sonuçları", rows[0]?.sessionId || "");
      return;
    }
    const sessionMap = new Map(sessionRows.map((s) => [s.sessionId, s.items]));
    if (!teacherSelectedQuizSessionId || !sessionMap.has(String(teacherSelectedQuizSessionId))) {
      teacherSelectedQuizSessionId = String(sessionRows[0]?.sessionId || "");
    }
    renderTeacherQuizSessionSelector();
    bindTeacherQuizSessionSelectorHandlers(sessionMap);
  }, () => {
    setTeacherHomeResultsView([], "Sonuçlar alınamadı.", "");
    if (resultsList) resultsList.innerHTML = `<div style="color:#b91c1c;">Quiz sonuçları yüklenemedi.</div>`;
  });
}

async function saveLiveQuiz() {
  const title = (document.getElementById("live-quiz-title")?.value || "").trim();
  const targetClass = (document.getElementById("live-quiz-class")?.value || "").trim();
  const targetSection = (document.getElementById("live-quiz-section")?.value || "").trim();
  if (!title || !liveQuizItems.length) {
    showNotice("Quiz başlığı ve en az 1 soru gerekli.", "#e74c3c");
    return;
  }
  const payload = {
    title,
    targetClass,
    targetSection,
    teacherId: currentUserId,
    questions: liveQuizItems.map((q) => cloneLiveQuizQuestion(q)),
    isDeleted: false,
    updatedAt: serverTimestamp()
  };
  try {
    if (liveQuizEditingId) await setDoc(doc(db, "liveQuizzes", liveQuizEditingId), payload, { merge: true });
    else await addDoc(collection(db, "liveQuizzes"), { ...payload, createdAt: serverTimestamp() });
    showNotice("Quiz kaydedildi.", "#2ecc71");
    resetLiveQuizEditor();
    loadTeacherLiveQuizList();
  } catch (e) {
    showNotice("Quiz kaydedilemedi.", "#e74c3c");
  }
}

async function deleteLiveQuiz() {
  if (!liveQuizEditingId) {
    showNotice("Silmek için önce bir quiz seçin.", "#f39c12");
    return;
  }
  const ok = await showConfirm("Seçili quiz silinsin mi?");
  if (!ok) return;
  try {
    await deleteOrArchiveLiveQuiz(liveQuizEditingId);
    showNotice("Quiz silindi.", "#2ecc71");
    resetLiveQuizEditor();
    loadTeacherLiveQuizList();
  } catch (e) {
    showNotice("Quiz silinemedi.", "#e74c3c");
  }
}

async function deleteLiveQuizById(quizId, quizTitle = "Quiz") {
  if (!quizId) return;
  const ok = await showConfirm(`"${quizTitle}" quizi silinsin mi?`);
  if (!ok) return;
  try {
    await deleteOrArchiveLiveQuiz(quizId);
    if (liveQuizEditingId === quizId) resetLiveQuizEditor();
    showNotice("Quiz silindi.", "#2ecc71");
    loadTeacherLiveQuizList();
  } catch (e) {
    showNotice("Quiz silinemedi.", "#e74c3c");
  }
}

async function deleteOrArchiveLiveQuiz(quizId) {
  if (!quizId) throw new Error("missing-quiz-id");
  const ref = doc(db, "liveQuizzes", String(quizId));
  try {
    await deleteDoc(ref);
    return "deleted";
  } catch (e) {
    // Fallback for stricter rules: hide from UI via soft-delete.
    await setDoc(ref, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return "archived";
  }
}

async function startLiveSession(quiz) {
  if (activeLiveSession?.status === "live") {
    showNotice("Aktif canlı quiz var. Önce mevcut oturumu bitirin.", "#f39c12");
    return;
  }
  try {
    const fallbackDuration = 30;
    const firstQuestionDuration = Math.max(
      5,
      Number(quiz?.questions?.[0]?.durationSec ?? quiz?.questions?.[0]?.duration ?? 0) || fallbackDuration
    );
    const now = Date.now();
    const endsAtMs = now + (firstQuestionDuration * 1000);
    const ref = await addDoc(collection(db, "liveQuizSessions"), {
      teacherId: currentUserId,
      quizId: quiz.id || null,
      quizTitle: quiz.title || "Quiz",
      questions: (quiz.questions || []).map((q) => cloneLiveQuizQuestion(q)),
      questionDurationSec: fallbackDuration,
      currentIndex: 0,
      startedAtMs: now,
      endsAtMs,
      status: "live",
      isLocked: false,
      targetClass: quiz.targetClass || "",
      targetSection: quiz.targetSection || "",
      createdAt: serverTimestamp()
    });
    activeLiveSession = { id: ref.id, ...quiz, currentIndex: 0, endsAtMs, status: "live", questionDurationSec: fallbackDuration };
    showNotice("Canlı quiz başlatıldı.", "#f97316");
    listenTeacherLiveSession();
    openTeacherLiveMonitor();
  } catch (e) {
    showNotice("Canlı quiz başlatılamadı.", "#e74c3c");
  }
}

async function recalculateStudentQuizSummary(userId) {
  if (!userId) return;
  try {
    const uid = String(userId);
    const snap = await getDocs(collection(db, "studentReports", uid, "quizSessions"));
    const rows = [];
    snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
    const finishedRows = rows.filter((r) => String(r.status || "finished") !== "live");
    const totals = {
      quizzes: finishedRows.length,
      answered: finishedRows.reduce((sum, r) => sum + Math.max(0, Number(r.answered || 0)), 0),
      correct: finishedRows.reduce((sum, r) => sum + Math.max(0, Number(r.correct || 0)), 0),
      wrong: finishedRows.reduce((sum, r) => sum + Math.max(0, Number(r.wrong || 0)), 0),
      xp: finishedRows.reduce((sum, r) => sum + Math.max(0, Number(r.xpEarned || 0)), 0)
    };
    const latest = finishedRows
      .slice()
      .sort((a, b) => Number(b.finishedAtMs || 0) - Number(a.finishedAtMs || 0))[0] || null;
    const summaryPayload = {
      quizSessionsCompleted: totals.quizzes,
      quizAnswered: totals.answered,
      quizCorrect: totals.correct,
      quizWrong: totals.wrong,
      quizTotalXP: totals.xp,
      lastQuizTitle: latest?.quizTitle || "",
      lastQuizDurationMs: Math.max(0, Number(latest?.durationMs || 0)),
      updatedAt: serverTimestamp()
    };
    if (latest) summaryPayload.lastQuizAt = serverTimestamp();
    await setDoc(doc(db, "studentReports", uid), summaryPayload, { merge: true });
  } catch (e) {
    console.warn("recalculateStudentQuizSummary", e);
  }
}

async function syncStudentLiveQuizProgress(sessionId, finalize = false) {
  if (!sessionId || !currentUserId) return null;
  try {
    const uid = String(currentUserId);
    const [sessionSnap, scoreSnap] = await Promise.all([
      getDoc(doc(db, "liveQuizSessions", String(sessionId))),
      getDoc(doc(db, "liveQuizSessions", String(sessionId), "scores", uid))
    ]);
    if (!sessionSnap.exists()) return null;
    const sessionData = sessionSnap.data() || {};
    const score = scoreSnap.exists() ? (scoreSnap.data() || {}) : {};
    const answered = Math.max(0, Number(score.answered || 0));
    const correct = Math.max(0, Number(score.correct || 0));
    const wrong = Math.max(0, answered - correct);
    const xpEarned = Math.max(0, Number(score.xp || score.xpEarned || 0));
    const startedAtMs = Math.max(0, Number(sessionData.startedAtMs || 0));
    const isFinished = finalize || sessionData.status === "finished";
    const finishedAtMs = isFinished
      ? Math.max(0, Number(sessionData.finishedAtMs || 0), Number(score.updatedAtMs || 0), Date.now())
      : 0;
    const durationMs = startedAtMs > 0
      ? Math.max(0, (finishedAtMs || Date.now()) - startedAtMs)
      : 0;
    const durationMinutes = Math.round((durationMs / 60000) * 10) / 10;
    const totalQuestions = Math.max(0, Number(Array.isArray(sessionData.questions) ? sessionData.questions.length : 0));
    const successRate = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const payload = {
      sessionId: String(sessionId),
      quizId: sessionData.quizId || "",
      quizTitle: sessionData.quizTitle || "Quiz",
      teacherId: sessionData.teacherId || "",
      userId: uid,
      studentName: getUserDisplayName(userData || {}) || uid,
      totalQuestions,
      answered,
      correct,
      wrong,
      xpEarned,
      successRate,
      startedAtMs,
      durationMs,
      durationMinutes,
      finishReason: isFinished ? (sessionData.finishReason || "time") : "",
      finishedAtMs,
      status: isFinished ? "finished" : "live",
      updatedAt: serverTimestamp()
    };
    await setDoc(doc(db, "studentReports", uid, "quizSessions", String(sessionId)), payload, { merge: true });
    if (isFinished) {
      await setDoc(doc(db, "studentQuizResults", `${sessionId}_${uid}`), {
        ...payload,
        createdAt: serverTimestamp()
      }, { merge: true });
      await recalculateStudentQuizSummary(uid);
    }
    return payload;
  } catch (e) {
    console.warn("syncStudentLiveQuizProgress", e);
    return null;
  }
}

function normalizeLiveText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeTrueFalseValue(value) {
  const v = normalizeLiveText(value);
  if (v === "dogru" || v === "doğru") return "doğru";
  if (v === "yanlis" || v === "yanlış") return "yanlış";
  return v;
}

function parseLiveMatchingPairsFromText(text) {
  const rows = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const pairs = [];
  rows.forEach((row) => {
    const parts = row.split("=");
    if (parts.length < 2) return;
    const left = String(parts.shift() || "").trim();
    const right = String(parts.join("=") || "").trim();
    if (!left || !right) return;
    pairs.push({ left, right });
  });
  return pairs;
}

function normalizeLiveMatchingMap(inputMap = {}) {
  const out = {};
  Object.entries(inputMap || {}).forEach(([k, v]) => {
    const key = normalizeLiveText(k);
    const val = normalizeLiveText(v);
    if (!key) return;
    out[key] = val;
  });
  return out;
}

const BLOCK_3D_BASE_LEVEL_COUNT = 15;
const BLOCK_3D_CUSTOM_LEVELS_KEY = "block3d_custom_levels_v1";
const BLOCK_3D_DELETED_BASE_KEY = "block3d_deleted_base_levels_v1";

function getBlockHomeworkType(typeRaw) {
  const t = String(typeRaw || "block2d").toLowerCase();
  if (t === "block3d") return "block3d";
  if (t === "flowchart") return "flowchart";
  return "block2d";
}

function getBlockHomeworkTypeLabel(typeRaw) {
  const t = getBlockHomeworkType(typeRaw);
  if (t === "block3d") return "3D Blok Kodlama";
  if (t === "flowchart") return "Flowchart";
  return "Blok Kodlama";
}

function getBaseBlock3DLevels() {
  const out = [];
  const groups = ["Kolay", "Orta", "Zor"];
  let order = 1;
  groups.forEach((g) => {
    for (let i = 1; i <= 5; i++) {
      out.push({ id: `base_${order}`, name: `${g} ${i}`, order });
      order += 1;
    }
  });
  return out;
}

function getAvailableBlock3DLevels() {
  try {
    const base = getBaseBlock3DLevels();
    const deletedRaw = localStorage.getItem(BLOCK_3D_DELETED_BASE_KEY);
    const deletedParsed = JSON.parse(deletedRaw || "[]");
    const deleted = new Set(Array.isArray(deletedParsed) ? deletedParsed.map((v) => String(v)) : []);
    const customRaw = localStorage.getItem(BLOCK_3D_CUSTOM_LEVELS_KEY);
    const customParsed = JSON.parse(customRaw || "[]");
    const custom = Array.isArray(customParsed) ? customParsed : [];
    const customById = new Map(custom.map((lv, idx) => [String(lv?.id || `custom_${idx + 1}`), lv]));
    const mergedBase = base
      .filter((lv) => !deleted.has(String(lv.id)))
      .map((lv) => {
        const c = customById.get(String(lv.id));
        if (c) {
          return {
            id: String(c.id || lv.id),
            name: String(c.name || lv.name),
            order: Math.max(1, Number(c.order || lv.order))
          };
        }
        return lv;
      });
    const extraCustom = custom
      .filter((lv) => !base.some((b) => String(b.id) === String(lv?.id || "")))
      .map((lv, idx) => ({
        id: String(lv?.id || `custom_${idx + 1}`),
        name: String(lv?.name || `Ozel Seviye ${idx + 1}`),
        order: Math.max(1, Number(lv?.order || mergedBase.length + idx + 1))
      }));
    const merged = [...mergedBase, ...extraCustom].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    return merged.length ? merged : base;
  } catch (e) {
    return getBaseBlock3DLevels();
  }
}

function getAvailableBlockLevelCountByType(typeRaw) {
  const t = getBlockHomeworkType(typeRaw);
  if (t === "block3d") return Math.max(1, getAvailableBlock3DLevels().length);
  if (t === "flowchart") return 1;
  return getAvailableBlockLevelCount();
}

function getBlockLevelNamesByTypeAndRange(typeRaw, start, end) {
  const t = getBlockHomeworkType(typeRaw);
  if (t === "flowchart") return ["Flowchart Soru"];
  if (t === "block3d") {
    const levels = getAvailableBlock3DLevels();
    if (!levels.length) return [];
    const s = Math.max(1, Number(start || 1));
    const e = Math.max(s, Number(end || s));
    const out = [];
    for (let i = s - 1; i <= e - 1 && i < levels.length; i++) {
      const name = String(levels[i]?.name || `Seviye ${i + 1}`);
      out.push(name);
    }
    return out;
  }
  return getLevelNamesByRange(start, end);
}

function buildLiveMatchingCorrectMap(question) {
  const pairs = Array.isArray(question?.pairs) ? question.pairs : [];
  const map = {};
  pairs.forEach((p) => {
    const left = normalizeLiveText(p?.left);
    const right = normalizeLiveText(p?.right);
    if (!left) return;
    map[left] = right;
  });
  return map;
}

function serializeLiveMatchingMap(mapObj = {}) {
  const normalized = normalizeLiveMatchingMap(mapObj);
  const ordered = Object.entries(normalized).sort((a, b) => a[0].localeCompare(b[0], "tr"));
  return JSON.stringify(ordered);
}

function getLiveQuestionOptionEntries(question) {
  if (!question) return [];
  if (question.type === "matching") {
    return [];
  }
  if (question.type === "truefalse") {
    return [
      { key: "doğru", label: "Doğru" },
      { key: "yanlış", label: "Yanlış" }
    ];
  }
  const opts = Array.isArray(question.options) ? question.options : [];
  return opts.map((opt, i) => {
    const key = String.fromCharCode(65 + i);
    return { key, label: `${key}) ${opt}` };
  });
}

function getLiveSelectedKey(question, answer) {
  if (!question || !answer) return "";
  if (question.type === "matching") {
    const mapObj = (answer.selectedMap && typeof answer.selectedMap === "object")
      ? answer.selectedMap
      : (() => {
          try {
            const parsed = JSON.parse(String(answer.selectedKey || "{}"));
            return Array.isArray(parsed)
              ? Object.fromEntries(parsed)
              : (parsed && typeof parsed === "object" ? parsed : {});
          } catch {
            return {};
          }
        })();
    return serializeLiveMatchingMap(mapObj);
  }
  if (question.type === "truefalse") {
    return normalizeTrueFalseValue(answer.selectedKey || answer.selected);
  }
  const directKey = String(answer.selectedKey || "").trim().toUpperCase();
  if (["A", "B", "C", "D"].includes(directKey)) return directKey;
  const opts = Array.isArray(question.options) ? question.options : [];
  const selectedText = String(answer.selected || "").trim();
  const idx = opts.findIndex((opt) => String(opt || "").trim() === selectedText);
  return idx >= 0 ? String.fromCharCode(65 + idx) : "";
}

function isLiveAnswerCorrect(question, selectedKey) {
  if (!question) return false;
  if (question.type === "matching") {
    const expected = serializeLiveMatchingMap(buildLiveMatchingCorrectMap(question));
    let selected = "";
    if (typeof selectedKey === "string") {
      selected = selectedKey;
    } else if (selectedKey && typeof selectedKey === "object") {
      selected = serializeLiveMatchingMap(selectedKey);
    }
    return selected === expected;
  }
  if (question.type === "truefalse") {
    return normalizeTrueFalseValue(selectedKey) === normalizeTrueFalseValue(question.correct);
  }
  return String(selectedKey || "").toUpperCase() === String(question.correct || "").toUpperCase();
}

function updateTeacherLiveMetaText(live) {
  const titleEl = document.getElementById("live-session-title");
  const metaEl = document.getElementById("live-session-meta");
  if (titleEl) {
    titleEl.innerText = live
      ? `${live.quizTitle || "Quiz"} • Soru ${Number(live.currentIndex || 0) + 1}/${(live.questions || []).length}`
      : "Canlı oturum yok";
  }
  if (metaEl) {
    metaEl.innerText = live
      ? `Kalan: ${Math.max(0, Math.floor((Number(live.endsAtMs || 0) - Date.now()) / 1000))} sn • ${live.isLocked ? "🔒 Soru kilitli" : "🔓 Soru açık"}`
      : "";
  }
  const lockBtn = document.getElementById("btn-live-session-lock");
  if (lockBtn) {
    lockBtn.innerText = live?.isLocked ? "Kilidi Aç" : "Soruyu Kilitle";
    lockBtn.classList.toggle("btn-warning", !live?.isLocked);
    lockBtn.classList.toggle("btn-success", !!live?.isLocked);
    lockBtn.disabled = !live;
  }
}

function stopTeacherLiveTicker() {
  if (liveTeacherTick) clearInterval(liveTeacherTick);
  liveTeacherTick = null;
}

function startTeacherLiveTicker() {
  stopTeacherLiveTicker();
  liveTeacherTick = setInterval(async () => {
    updateTeacherLiveMetaText(activeLiveSession);
    const live = activeLiveSession;
    if (!live || live.status !== "live") return;
    if (Date.now() < Number(live.endsAtMs || 0) || liveAutoProgressing) return;
    liveAutoProgressing = true;
    try {
      const idx = Number(live.currentIndex || 0);
      const total = Array.isArray(live.questions) ? live.questions.length : 0;
      if (idx + 1 >= total) await teacherEndLiveSession("time");
      else await teacherNextLiveQuestion();
    } finally {
      setTimeout(() => { liveAutoProgressing = false; }, 500);
    }
  }, 500);
}

function renderLiveTeacherRank(rows = []) {
  const box = document.getElementById("live-session-rank");
  if (!box) return;
  const ranked = (Array.isArray(rows) ? rows : [])
    .slice()
    .sort((a, b) => Number(b?.xp || 0) - Number(a?.xp || 0))
    .slice(0, 7);
  if (!ranked.length) {
    box.innerHTML = `<div class="empty-state">Henüz katılım yok.</div>`;
    return;
  }
  box.innerHTML = ranked.map((r, i) => `
    <div class="list-item" style="cursor:default;">
      <div><strong>${i + 1}. ${r.name || r.userId || "-"}</strong><br><small>${r.correct || 0} doğru</small></div>
      <div style="font-weight:700;color:#2563eb;">${r.xp || 0} XP</div>
    </div>
  `).join("");
}

function renderTeacherAnswerStats(live, answers = []) {
  const statsBox = document.getElementById("live-session-answer-stats");
  const feedBox = document.getElementById("live-session-answer-feed");
  if (!statsBox || !feedBox) return;
  if (!live || live.status !== "live") {
    statsBox.innerHTML = `<div class="empty-state">Canlı soru yok.</div>`;
    feedBox.innerHTML = "";
    return;
  }
  const qIndex = Number(live.currentIndex || 0);
  const question = live.questions?.[qIndex];
  if (!question) {
    statsBox.innerHTML = `<div class="empty-state">Soru bulunamadı.</div>`;
    feedBox.innerHTML = "";
    return;
  }

  const options = getLiveQuestionOptionEntries(question);
  const counts = new Map(options.map((opt) => [opt.key, 0]));
  let correctCount = 0;
  answers.forEach((answer) => {
    const key = getLiveSelectedKey(question, answer);
    if (counts.has(key)) counts.set(key, Number(counts.get(key) || 0) + 1);
    if (isLiveAnswerCorrect(question, key)) correctCount += 1;
  });

  const totalAnswered = answers.length;
  if (question.type === "matching") {
    statsBox.innerHTML = `
      <div style="font-weight:700;margin-bottom:6px;">Soru ${qIndex + 1}: ${question.question || "Soru"}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;">
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:8px;background:#f8fafc;">
          <div style="font-weight:600;">Soru Tipi</div>
          <div style="font-size:14px;font-weight:700;color:#1e3a8a;">Sürükle-Bırak Eşleştirme</div>
        </div>
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:8px;background:#f8fafc;">
          <div style="font-weight:600;">Yanıtlayan</div>
          <div style="font-size:18px;font-weight:700;color:#1d4ed8;">${totalAnswered}</div>
        </div>
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:8px;background:#f8fafc;">
          <div style="font-weight:600;">Doğru</div>
          <div style="font-size:18px;font-weight:700;color:#16a34a;">${correctCount}</div>
        </div>
      </div>
    `;
  } else {
  statsBox.innerHTML = `
    <div style="font-weight:700;margin-bottom:6px;">Soru ${qIndex + 1}: ${question.question || "Soru"}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;">
      ${options.map((opt) => `
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:8px;background:#f8fafc;">
          <div style="font-weight:600;">${opt.label}</div>
          <div style="font-size:18px;font-weight:700;color:#1d4ed8;">${counts.get(opt.key) || 0}</div>
        </div>
      `).join("")}
    </div>
    <div style="margin-top:8px;color:#334155;font-size:13px;">
      Yanıtlayan: <strong>${totalAnswered}</strong> • Doğru: <strong>${correctCount}</strong>
    </div>
  `;
  }

  if (!answers.length) {
    feedBox.innerHTML = `<div class="empty-state">Henüz cevap gelmedi.</div>`;
    return;
  }
  const sorted = answers
    .slice()
    .sort((a, b) => Number(b.answeredAtMs || 0) - Number(a.answeredAtMs || 0))
    .slice(0, 30);
  feedBox.innerHTML = sorted.map((answer) => {
    const key = getLiveSelectedKey(question, answer);
    const option = options.find((opt) => opt.key === key);
    const who = answer.name || answer.userId || "-";
    const ok = isLiveAnswerCorrect(question, key);
    return `
      <div class="list-item" style="cursor:default;padding:8px 10px;">
        <div><strong>${who}</strong><br><small>${option?.label || answer.selected || "-"}</small></div>
        <div style="font-weight:700;color:${ok ? "#16a34a" : "#dc2626"};">${ok ? "Doğru" : "Yanlış"}</div>
      </div>
    `;
  }).join("");
}

async function ensureTeacherLiveMonitorStudents(live) {
  if (!live) {
    teacherLiveMonitorStudents = [];
    teacherLiveMonitorStudentKey = "";
    return;
  }
  const key = `${String(live.targetClass || "").trim().toLowerCase()}::${String(live.targetSection || "").trim().toLowerCase()}`;
  if (teacherLiveMonitorStudentKey === key && teacherLiveMonitorStudents.length) return;
  let source = Array.isArray(allStudents) ? allStudents.slice() : [];
  if (!source.length) {
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
    source = [];
    snap.forEach((d) => source.push({ id: d.id, ...d.data() }));
  }
  source = scopeStudentsForCurrentRole(source);
  const targetClass = String(live.targetClass || "").trim();
  const targetSection = String(live.targetSection || "").trim();
  const filtered = source.filter((s) => {
    const sClass = String(s.className || s.class || "").trim();
    const sSection = String(s.section || "").trim();
    if (targetClass && sClass !== targetClass) return false;
    if (targetSection && sSection !== targetSection) return false;
    return true;
  }).map((s) => ({
    id: s.id,
    name: s.name || s.displayName || s.fullName || s.username || s.email || s.id || "-",
    className: String(s.className || s.class || "").trim(),
    section: String(s.section || "").trim()
  }));
  filtered.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "tr"));
  teacherLiveMonitorStudents = filtered;
  teacherLiveMonitorStudentKey = key;
}

function openTeacherLiveMonitor() {
  const modal = document.getElementById("teacher-live-monitor-modal");
  if (!modal || userRole !== "teacher") return;
  modal.style.display = "flex";
  teacherLiveMonitorOpen = true;
  renderTeacherLiveMonitor(activeLiveSession);
}

function closeTeacherLiveMonitor() {
  const modal = document.getElementById("teacher-live-monitor-modal");
  if (modal) modal.style.display = "none";
  teacherLiveMonitorOpen = false;
}

function renderTeacherLiveMonitor(live = activeLiveSession) {
  const titleEl = document.getElementById("teacher-live-monitor-title");
  const subEl = document.getElementById("teacher-live-monitor-sub");
  const metricsEl = document.getElementById("teacher-live-monitor-metrics");
  const listEl = document.getElementById("teacher-live-monitor-list");
  if (!titleEl || !subEl || !metricsEl || !listEl) return;

  if (!live || live.status !== "live") {
    titleEl.innerText = "Canlı Quiz Takip";
    subEl.innerText = "Aktif canlı quiz bulunmuyor.";
    metricsEl.innerHTML = "";
    listEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">Canlı oturum başladığında tüm öğrenciler burada anlık listelenir.</div>`;
    return;
  }

  const qIndex = Number(live.currentIndex || 0);
  const totalQuestions = Math.max(0, Array.isArray(live.questions) ? live.questions.length : 0);
  const question = live.questions?.[qIndex] || null;
  const options = getLiveQuestionOptionEntries(question);
  const scores = Array.isArray(teacherLiveMonitorScores) ? teacherLiveMonitorScores : [];
  const answers = Array.isArray(teacherLiveMonitorAnswers) ? teacherLiveMonitorAnswers : [];
  const scoreMap = new Map();
  const rankMap = new Map();
  scores
    .slice()
    .sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0))
    .forEach((row, idx) => {
      const uid = String(row.userId || "");
      if (!uid) return;
      scoreMap.set(uid, row);
      rankMap.set(uid, idx + 1);
    });
  const answerMap = new Map();
  answers.forEach((row) => {
    const uid = String(row.userId || "");
    if (!uid) return;
    answerMap.set(uid, row);
  });

  const rows = [];
  (teacherLiveMonitorStudents || []).forEach((student) => {
    rows.push({
      userId: student.id,
      name: student.name || student.id || "-",
      className: student.className || "",
      section: student.section || "",
      score: scoreMap.get(String(student.id || "")) || null,
      answer: answerMap.get(String(student.id || "")) || null
    });
  });
  answerMap.forEach((answer, uid) => {
    if (rows.find((r) => String(r.userId) === uid)) return;
    const score = scoreMap.get(uid) || null;
    rows.push({
      userId: uid,
      name: answer.name || score?.name || uid,
      className: "",
      section: "",
      score,
      answer
    });
  });
  scoreMap.forEach((score, uid) => {
    if (rows.find((r) => String(r.userId) === uid)) return;
    rows.push({
      userId: uid,
      name: score.name || uid,
      className: "",
      section: "",
      score,
      answer: answerMap.get(uid) || null
    });
  });

  rows.sort((a, b) => {
    const aXP = Number(a.score?.xp || 0);
    const bXP = Number(b.score?.xp || 0);
    if (bXP !== aXP) return bXP - aXP;
    return String(a.name || "").localeCompare(String(b.name || ""), "tr");
  });

  const answeredCount = rows.filter((row) => !!row.answer).length;
  const correctCount = rows.filter((row) => {
    if (!row.answer || !question) return false;
    return isLiveAnswerCorrect(question, getLiveSelectedKey(question, row.answer));
  }).length;
  const totalXP = rows.reduce((sum, row) => sum + Number(row.score?.xp || 0), 0);
  const classLabel = live.targetClass ? `${live.targetClass}${live.targetSection ? "/" + live.targetSection : ""}` : "Tüm Sınıflar";

  titleEl.innerText = `${live.quizTitle || "Quiz"} • Canlı Takip`;
  subEl.innerText = `Soru ${Math.min(qIndex + 1, Math.max(totalQuestions, 1))}/${Math.max(totalQuestions, 1)} • ${classLabel} • Kalan ${Math.max(0, Math.floor((Number(live.endsAtMs || 0) - Date.now()) / 1000))} sn`;
  metricsEl.innerHTML = `
    <div class="teacher-live-metric"><div class="k">Öğrenci</div><div class="v">${rows.length}</div></div>
    <div class="teacher-live-metric"><div class="k">Yanıtlayan</div><div class="v">${answeredCount}</div></div>
    <div class="teacher-live-metric"><div class="k">Doğru</div><div class="v">${correctCount}</div></div>
    <div class="teacher-live-metric"><div class="k">Toplam XP</div><div class="v">${totalXP}</div></div>
  `;

  if (!rows.length) {
    listEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">Bu canlı quiz için öğrenci bulunamadı.</div>`;
    return;
  }
  listEl.innerHTML = rows.map((row) => {
    const rank = rankMap.get(String(row.userId || "")) || "-";
    const selectedKey = question && row.answer ? getLiveSelectedKey(question, row.answer) : "";
    const selectedLabel = options.find((opt) => opt.key === selectedKey)?.label || (row.answer?.selected || "-");
    const isCorrect = question && row.answer ? isLiveAnswerCorrect(question, selectedKey) : false;
    const statusClass = row.answer ? "answered" : "pending";
    const statusText = row.answer ? (isCorrect ? "Cevaplandı • Doğru" : "Cevaplandı • Yanlış") : "Cevap bekleniyor";
    const classText = row.className ? `${row.className}${row.section ? "/" + row.section : ""}` : "-";
    return `
      <div class="teacher-live-student-card ${statusClass}">
        <div class="teacher-live-student-top">
          <div class="teacher-live-student-name">${row.name || "-"}</div>
          <div class="teacher-live-student-rank">${rank}</div>
        </div>
        <div class="teacher-live-status ${statusClass}">${statusText}</div>
        <div class="teacher-live-student-meta">
          <div>Seçim: <strong>${selectedLabel || "-"}</strong></div>
          <div>XP: <strong>${Number(row.score?.xp || 0)}</strong> • Doğru: <strong>${Number(row.score?.correct || 0)}</strong></div>
          <div>Sınıf: <strong>${classText}</strong></div>
        </div>
      </div>
    `;
  }).join("");
}

function listenTeacherLiveSession() {
  if (liveSessionUnsub) liveSessionUnsub();
  liveSessionUnsub = null;
  if (liveSessionScoresUnsub) liveSessionScoresUnsub();
  liveSessionScoresUnsub = null;
  if (liveSessionAnswersUnsub) liveSessionAnswersUnsub();
  liveSessionAnswersUnsub = null;
  stopTeacherLiveTicker();
  if (userRole !== "teacher" || !currentUserId) return;
  startTeacherLiveTicker();
  const qx = query(collection(db, "liveQuizSessions"), where("teacherId", "==", currentUserId));
  liveSessionUnsub = onSnapshot(qx, (snap) => {
    const sessions = [];
    snap.forEach((d) => sessions.push({ id: d.id, ...d.data() }));
    sessions.sort((a, b) => (b.startedAtMs || 0) - (a.startedAtMs || 0));
    const live = sessions.find((s) => s.status === "live") || null;
    activeLiveSession = live;
    updateTeacherLiveMetaText(live);
    if (!live) {
      teacherLiveMonitorScores = [];
      teacherLiveMonitorAnswers = [];
      teacherLiveMonitorStudents = [];
      teacherLiveMonitorStudentKey = "";
      renderTeacherLiveMonitor(null);
    } else {
      ensureTeacherLiveMonitorStudents(live)
        .then(() => renderTeacherLiveMonitor(live))
        .catch(() => renderTeacherLiveMonitor(live));
    }
    if (live && Date.now() >= Number(live.endsAtMs || 0) && !liveAutoProgressing) {
      liveAutoProgressing = true;
      (async () => {
        try {
          const idx = Number(live.currentIndex || 0);
          const total = Array.isArray(live.questions) ? live.questions.length : 0;
          if (idx + 1 >= total) await teacherEndLiveSession("time");
          else await teacherNextLiveQuestion();
        } finally {
          setTimeout(() => { liveAutoProgressing = false; }, 500);
        }
      })();
    }

    if (liveSessionScoresUnsub) liveSessionScoresUnsub();
    liveSessionScoresUnsub = null;
    if (liveSessionAnswersUnsub) liveSessionAnswersUnsub();
    liveSessionAnswersUnsub = null;
    if (!live) {
      renderLiveTeacherRank([]);
      renderTeacherAnswerStats(null, []);
      return;
    }
    liveSessionScoresUnsub = onSnapshot(collection(db, "liveQuizSessions", live.id, "scores"), (sc) => {
      const rows = [];
      sc.forEach((d) => rows.push(d.data()));
      rows.sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));
      teacherLiveMonitorScores = rows;
      renderLiveTeacherRank(rows);
      renderTeacherLiveMonitor(live);
    });
    const answerQuery = query(
      collection(db, "liveQuizSessions", live.id, "answers"),
      where("qIndex", "==", Number(live.currentIndex || 0))
    );
    liveSessionAnswersUnsub = onSnapshot(answerQuery, (ansSnap) => {
      const answers = [];
      ansSnap.forEach((d) => answers.push(d.data()));
      teacherLiveMonitorAnswers = answers;
      renderTeacherAnswerStats(live, answers);
      renderTeacherLiveMonitor(live);
    });
  });
}

async function teacherNextLiveQuestion() {
  if (!activeLiveSession?.id) return;
  const ref = doc(db, "liveQuizSessions", activeLiveSession.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const s = snap.data();
  const idx = Number(s.currentIndex || 0);
  const total = Array.isArray(s.questions) ? s.questions.length : 0;
  if (idx + 1 >= total) return teacherEndLiveSession("questions-completed");
  const nextQuestion = s.questions?.[idx + 1] || null;
  const duration = Math.max(5, Number(nextQuestion?.durationSec ?? nextQuestion?.duration ?? 0) || Math.max(10, Number(s.questionDurationSec || 30)));
  await updateDoc(ref, {
    currentIndex: idx + 1,
    endsAtMs: Date.now() + duration * 1000,
    isLocked: false
  });
}

async function persistLiveQuizResultsAndAwardXP(sessionId, sessionData = {}) {
  if (!sessionId) return;
  try {
    const scoreSnap = await getDocs(collection(db, "liveQuizSessions", sessionId, "scores"));
    const totalQuestions = Math.max(0, Number(Array.isArray(sessionData.questions) ? sessionData.questions.length : 0));
    const startedAtMs = Math.max(0, Number(sessionData.startedAtMs || 0));
    const touchedUsers = new Set();
    for (const row of scoreSnap.docs) {
      const score = row.data() || {};
      const userId = String(score.userId || "");
      if (!userId) continue;
      touchedUsers.add(userId);
      const answered = Math.max(0, Number(score.answered || 0));
      const correct = Math.max(0, Number(score.correct || 0));
      const wrong = Math.max(0, answered - correct);
      const xpEarned = Math.max(0, Number(score.xp || 0));
      const xpAwardedInLive = Math.max(0, Number(score.xpAwarded || 0));
      const xpPendingGrant = Math.max(0, xpEarned - xpAwardedInLive);
      const successRate = answered > 0 ? Math.round((correct / answered) * 100) : 0;
      const studentFinishedAtMs = Math.max(
        0,
        Number(score.updatedAtMs || 0),
        Number(sessionData.finishedAtMs || 0),
        Date.now()
      );
      const durationMs = startedAtMs > 0
        ? Math.max(0, studentFinishedAtMs - startedAtMs)
        : 0;
      const durationMinutes = Math.round((durationMs / 60000) * 10) / 10;
      const resultId = `${sessionId}_${userId}`;
      const resultRef = doc(db, "studentQuizResults", resultId);
      const resultSnap = await getDoc(resultRef);
      const prevResult = resultSnap.exists() ? (resultSnap.data() || {}) : {};
      const xpWasGranted = !!prevResult.xpGranted;

      await setDoc(resultRef, {
        sessionId,
        quizId: sessionData.quizId || "",
        quizTitle: sessionData.quizTitle || "Quiz",
        teacherId: sessionData.teacherId || currentUserId || "",
        userId,
        studentName: score.name || userId,
        totalQuestions,
        answered,
        correct,
        wrong,
        xpEarned,
        successRate,
        startedAtMs,
        durationMs,
        durationMinutes,
        finishReason: sessionData.finishReason || "",
        finishedAtMs: studentFinishedAtMs,
        status: "finished",
        xpGranted: xpWasGranted || xpPendingGrant <= 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      await setDoc(doc(db, "studentReports", String(userId), "quizSessions", String(sessionId)), {
        sessionId,
        quizId: sessionData.quizId || "",
        quizTitle: sessionData.quizTitle || "Quiz",
        teacherId: sessionData.teacherId || currentUserId || "",
        userId,
        studentName: score.name || userId,
        totalQuestions,
        answered,
        correct,
        wrong,
        xpEarned,
        successRate,
        startedAtMs,
        durationMs,
        durationMinutes,
        finishReason: sessionData.finishReason || "",
        finishedAtMs: studentFinishedAtMs,
        status: "finished",
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (xpPendingGrant > 0 && !xpWasGranted) {
        try {
          await updateDoc(doc(db, "users", userId), { xp: increment(xpPendingGrant), updatedAt: serverTimestamp() });
        } catch (e) {
          await setDoc(doc(db, "users", userId), { xp: increment(xpPendingGrant), updatedAt: serverTimestamp() }, { merge: true });
        }
        await setDoc(resultRef, {
          xpGranted: true,
          xpGrantedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
    for (const uid of touchedUsers) {
      await recalculateStudentQuizSummary(uid);
    }
  } catch (e) {
    console.warn("persistLiveQuizResultsAndAwardXP", e);
  }
}

async function teacherEndLiveSession(reason = "manual") {
  if (!activeLiveSession?.id) return;
  const ref = doc(db, "liveQuizSessions", activeLiveSession.id);
  const sessionSnap = await getDoc(ref);
  if (!sessionSnap.exists()) return;
  const sessionData = sessionSnap.data() || {};
  const startedAtMs = Math.max(0, Number(sessionData.startedAtMs || 0));
  if (sessionData.status === "finished") return;
  const scoreSnap = await getDocs(collection(db, "liveQuizSessions", activeLiveSession.id, "scores"));
  const scores = [];
  scoreSnap.forEach((d) => scores.push(d.data()));
  scores.sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));
  const rankingRows = scores.map((s) => {
    const answered = Math.max(0, Number(s.answered || 0));
    const correct = Math.max(0, Number(s.correct || 0));
    const wrong = Math.max(0, answered - correct);
    const successRate = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    return {
      userId: s.userId || "",
      studentName: s.name || s.userId || "-",
      correct,
      wrong,
      answered,
      xpEarned: Math.max(0, Number(s.xp || 0)),
      successRate,
      durationMs: startedAtMs > 0 ? Math.max(0, Date.now() - startedAtMs) : 0,
      durationMinutes: startedAtMs > 0 ? Math.round(((Date.now() - startedAtMs) / 60000) * 10) / 10 : 0,
      finishedAtMs: Date.now()
    };
  });
  if (rankingRows.length) {
    const meta = `${sessionData.quizTitle || "Quiz"} • ${rankingRows.length} öğrenci tamamladı • Sonuç listesi`;
    setTeacherHomeResultsView(getSortedQuizRanking(rankingRows), meta, activeLiveSession.id);
  }
  const winner = scores[0] || null;
  const finishedAtMs = Date.now();
  await updateDoc(ref, {
    status: "finished",
    finishedAtMs,
    finishReason: reason,
    winnerId: winner?.userId || "",
    winnerName: winner?.name || "",
    winnerXP: winner?.xp || 0
  });
  await persistLiveQuizResultsAndAwardXP(activeLiveSession.id, {
    ...sessionData,
    finishReason: reason,
    finishedAtMs
  });
  showNotice(winner ? `Quiz bitti. Kazanan: ${winner.name} (${winner.xp} XP)` : "Quiz bitti.", "#2ecc71");
}

async function teacherToggleLiveLock() {
  if (!activeLiveSession?.id) {
    showNotice("Aktif canlı oturum yok.", "#f39c12");
    return;
  }
  try {
    const ref = doc(db, "liveQuizSessions", activeLiveSession.id);
    await updateDoc(ref, { isLocked: !activeLiveSession?.isLocked });
  } catch (e) {
    showNotice("Kilit durumu güncellenemedi.", "#e74c3c");
  }
}

function startStudentLiveQuizListener() {
  if (studentLiveSessionUnsub) studentLiveSessionUnsub();
  if (userRole !== "student" || !currentUserId) return;
  studentLiveSessionUnsub = onSnapshot(collection(db, "liveQuizSessions"), (snap) => {
    const all = [];
    snap.forEach((d) => all.push({ id: d.id, ...d.data() }));
    all.sort((a, b) => Number(b.startedAtMs || 0) - Number(a.startedAtMs || 0));
    const live = all.find((s) => {
      if (s.status !== "live") return false;
      if (!userData) return true;
      if (!s.targetClass) return true;
      if (s.targetClass !== (userData.className || "")) return false;
      if (s.targetSection && s.targetSection !== (userData.section || "")) return false;
      return true;
    }) || null;
    const previousSessionId = activeStudentLiveSession?.id || "";
    activeStudentLiveSession = live;
    if (previousSessionId && previousSessionId !== (live?.id || "")) {
      syncStudentLiveQuizProgress(previousSessionId, true);
    }
    if (live?.id && live.id !== previousSessionId && lastStudentLiveSessionId !== live.id) {
      lastStudentLiveSessionId = live.id;
      syncStudentLiveQuizProgress(live.id, false);
    }
    if (previousSessionId !== (live?.id || "")) studentLiveAnswerCache = new Map();
    const invite = document.getElementById("live-quiz-invite");
    const inviteText = document.getElementById("live-quiz-invite-text");
    if (!invite || !inviteText) return;
    if (live) {
      inviteText.innerText = `“${live.quizTitle || "Canlı Quiz"}” başladı. Katılmak için tıklayın.`;
      const playerOpen = document.getElementById("live-quiz-player")?.style.display === "flex";
      if (!playerOpen) {
        invite.style.display = "flex";
        if (lastLiveInviteSessionId !== live.id) {
          showNotice("🔔 Canlı quize katıl bildirimi", "#f97316");
        }
      }
      lastLiveInviteSessionId = live.id;
      if (playerOpen) renderStudentLiveQuestion();
    } else {
      lastLiveInviteSessionId = null;
      lastStudentLiveSessionId = "";
      studentLiveAnswerCache = new Map();
      invite.style.display = "none";
      closeLivePlayer();
    }
  });
}

async function resolveStudentLiveAnswer(sessionId, qIndex) {
  if (!sessionId || !currentUserId) return null;
  const key = `${sessionId}_${qIndex}_${currentUserId}`;
  if (studentLiveAnswerCache.has(key)) return studentLiveAnswerCache.get(key);
  try {
    const ansRef = doc(db, "liveQuizSessions", sessionId, "answers", `${currentUserId}_${qIndex}`);
    const snap = await getDoc(ansRef);
    const answer = snap.exists() ? snap.data() : null;
    studentLiveAnswerCache.set(key, answer);
    return answer;
  } catch (e) {
    return null;
  }
}

async function renderStudentLiveQuestion() {
  const session = activeStudentLiveSession;
  if (!session) return;
  const q = session.questions?.[Number(session.currentIndex || 0)] || null;
  const qIndex = Number(session.currentIndex || 0);
  const existingAnswer = await resolveStudentLiveAnswer(session.id, qIndex);
  const title = document.getElementById("live-player-title");
  const qBox = document.getElementById("live-player-question");
  const oBox = document.getElementById("live-player-options");
  const info = document.getElementById("live-player-info");
  if (title) title.innerText = `${session.quizTitle || "Canlı Quiz"} • ${Number(session.currentIndex || 0) + 1}/${(session.questions || []).length}`;
  if (!q) {
    if (qBox) qBox.innerText = "Soru bulunamadı.";
    if (oBox) oBox.innerHTML = "";
    return;
  }
  if (qBox) {
    qBox.innerHTML = "";
    if (q?.imageDataUrl) {
      const img = document.createElement("img");
      img.src = String(q.imageDataUrl);
      img.alt = "Soru görseli";
      img.style.maxWidth = "100%";
      img.style.maxHeight = "220px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "10px";
      img.style.border = "1px solid #cbd5e1";
      img.style.marginBottom = "10px";
      qBox.appendChild(img);
    }
    const text = document.createElement("div");
    text.innerText = q.question || "Soru";
    qBox.appendChild(text);
  }
  if (info) {
    const questionXP = Math.max(0, Number(q?.xp ?? MAX_QUESTION_XP));
    const statusText = existingAnswer
      ? `Bu soruyu cevapladın: ${existingAnswer.selectedKey || existingAnswer.selected || "Yanıt kaydedildi"}`
      : (session.isLocked ? "Bu soru öğretmen tarafından kilitlendi." : `Doğru cevap +${questionXP} XP`);
    info.innerText = statusText;
  }
  if (q.type === "matching") {
    if (info) {
      const statusText = existingAnswer
        ? "Bu eşleştirme sorusu cevaplandı."
        : (session.isLocked ? "Bu soru öğretmen tarafından kilitlendi." : "Eşleşmeleri sürükle-bırak ile tamamlayın.");
      info.innerText = statusText;
    }
    renderStudentMatchingQuestion(q, session, existingAnswer);
    return;
  }
  if (oBox) {
    const opts = q.type === "truefalse" ? ["doğru", "yanlış"] : (Array.isArray(q.options) ? q.options : []);
    oBox.innerHTML = "";
    opts.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "btn live-player-option";
      const selectedKey = q.type === "truefalse" ? normalizeTrueFalseValue(opt) : String.fromCharCode(65 + i);
      const answerKey = existingAnswer ? (q.type === "truefalse" ? normalizeTrueFalseValue(existingAnswer.selectedKey || existingAnswer.selected) : String(existingAnswer.selectedKey || "").toUpperCase()) : "";
      const isSelected = !!existingAnswer && selectedKey === answerKey;
      if (q.type === "truefalse") {
        btn.classList.add(selectedKey === "doğru" ? "tf-true" : "tf-false");
      } else {
        btn.classList.add(i === 0 ? "opt-a" : i === 1 ? "opt-b" : i === 2 ? "opt-c" : "opt-d");
      }
      if (isSelected) {
        btn.classList.add("selected");
        btn.classList.add(existingAnswer?.isCorrect ? "correct" : "wrong");
      }
      const keyText = q.type === "truefalse" ? (selectedKey === "doğru" ? "D" : "Y") : String.fromCharCode(65 + i);
      const optText = q.type === "truefalse" ? (selectedKey === "doğru" ? "Doğru" : "Yanlış") : `${opt}`;
      btn.innerHTML = `<span class="opt-key">${keyText}</span><span class="opt-text">${optText}</span>`;
      btn.disabled = !!session.isLocked || !!existingAnswer;
      btn.onclick = () => submitStudentLiveAnswer(opt, i);
      oBox.appendChild(btn);
    });
  }
}

function renderStudentMatchingQuestion(question, session, existingAnswer) {
  const oBox = document.getElementById("live-player-options");
  if (!oBox) return;
  const pairs = Array.isArray(question?.pairs) ? question.pairs : [];
  if (!pairs.length) {
    oBox.innerHTML = `<div class="empty-state">Eşleştirme verisi bulunamadı.</div>`;
    return;
  }
  const initialMap = (existingAnswer?.selectedMap && typeof existingAnswer.selectedMap === "object")
    ? { ...existingAnswer.selectedMap }
    : (() => {
        try {
          const parsed = JSON.parse(String(existingAnswer?.selectedKey || "{}"));
          return Array.isArray(parsed) ? Object.fromEntries(parsed) : {};
        } catch {
          return {};
        }
      })();
  const answeredPersisted = !!existingAnswer?.answeredAtMs;
  const usedValues = new Set(Object.values(initialMap).map((v) => String(v || "")));
  const chips = pairs.map((p) => String(p?.right || "")).filter(Boolean);
  oBox.innerHTML = `
    <div class="live-match-board">
      <div class="live-match-grid">
        <div>
          <div class="live-match-col-title">Sol İfadeler</div>
          ${pairs.map((p) => `<div class="live-match-left-item">${p.left || "-"}</div>`).join("")}
        </div>
        <div>
          <div class="live-match-col-title">Sağ Eşleşme</div>
          ${pairs.map((p, i) => `
            <div class="live-match-dropzone ${initialMap[p.left] ? "filled" : ""}" data-left="${encodeURIComponent(p.left || "")}">
              <span>${initialMap[p.left] || "Buraya bırak"}</span>
              <button class="btn" data-clear="${i}" style="display:${initialMap[p.left] && !answeredPersisted ? "inline-flex" : "none"};padding:4px 8px;background:#eef2ff;color:#1e3a8a;">Temizle</button>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="live-match-col-title" style="margin-top:8px;">Sağ Kartlar</div>
      <div class="live-match-chip-wrap" id="live-match-chip-wrap">
        ${chips.map((text, i) => `
          <div class="live-match-chip ${usedValues.has(text) ? "used" : ""}" draggable="${answeredPersisted ? "false" : "true"}" data-chip="${i}" data-value="${encodeURIComponent(text)}">${text}</div>
        `).join("")}
      </div>
      <button class="btn btn-primary live-match-submit" id="btn-submit-live-matching" ${answeredPersisted || session?.isLocked ? "disabled" : ""}>Eşleştirmeyi Gönder</button>
    </div>
  `;
  if (answeredPersisted || session?.isLocked) return;
  const localMap = { ...initialMap };
  const chipWrap = document.getElementById("live-match-chip-wrap");
  oBox.querySelectorAll(".live-match-chip").forEach((chip) => {
    chip.addEventListener("dragstart", () => {
      if (chip.classList.contains("used")) return;
      livePlayerMatchingDragKey = String(chip.dataset.value || "");
    });
    chip.addEventListener("dragend", () => {
      livePlayerMatchingDragKey = "";
    });
  });
  oBox.querySelectorAll(".live-match-dropzone").forEach((zone) => {
    zone.addEventListener("dragover", (ev) => ev.preventDefault());
    zone.addEventListener("drop", (ev) => {
      ev.preventDefault();
      const raw = decodeURIComponent(String(livePlayerMatchingDragKey || ""));
      if (!raw) return;
      const left = decodeURIComponent(String(zone.dataset.left || ""));
      if (!left) return;
      Object.keys(localMap).forEach((k) => {
        if (String(localMap[k] || "") === raw) delete localMap[k];
      });
      localMap[left] = raw;
      renderStudentMatchingQuestion(question, session, { selectedMap: localMap });
    });
  });
  oBox.querySelectorAll("[data-clear]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-clear"));
      const left = String(pairs[idx]?.left || "");
      if (!left) return;
      delete localMap[left];
      renderStudentMatchingQuestion(question, session, { selectedMap: localMap });
    });
  });
  const submitBtn = document.getElementById("btn-submit-live-matching");
  if (submitBtn) {
    submitBtn.onclick = async () => {
      const complete = pairs.every((p) => !!localMap[p.left]);
      if (!complete) {
        showNotice("Lütfen tüm eşleştirmeleri tamamlayın.", "#f39c12");
        return;
      }
      await submitStudentLiveMatchingAnswer(localMap);
    };
  }
  if (chipWrap) {
    chipWrap.querySelectorAll(".live-match-chip").forEach((chip) => {
      const val = decodeURIComponent(String(chip.dataset.value || ""));
      if (!val) return;
      const used = Object.values(localMap).includes(val);
      chip.classList.toggle("used", used);
      chip.setAttribute("draggable", used ? "false" : "true");
    });
  }
}

async function submitStudentLiveAnswer(opt, idx) {
  const session = activeStudentLiveSession;
  if (!session?.id) return;
  if (session?.isLocked) {
    showNotice("Bu soru kilitli. Öğretmenin açmasını bekleyin.", "#f39c12");
    return;
  }
  const sessionRef = doc(db, "liveQuizSessions", session.id);
  const sessionSnap = await getDoc(sessionRef);
  if (!sessionSnap.exists() || sessionSnap.data()?.isLocked) {
    showNotice("Bu soru şu anda kilitli.", "#f39c12");
    return;
  }
  const qIndex = Number(session.currentIndex || 0);
  const q = session.questions?.[qIndex];
  if (!q) return;
  const answerId = `${currentUserId}_${qIndex}`;
  const ansRef = doc(db, "liveQuizSessions", session.id, "answers", answerId);
  const already = await getDoc(ansRef);
  if (already.exists()) {
    showNotice("Bu soruyu zaten cevapladın.", "#f39c12");
    const key = `${session.id}_${qIndex}_${currentUserId}`;
    studentLiveAnswerCache.set(key, already.data());
    renderStudentLiveQuestion();
    return;
  }
  let isCorrect = false;
  if (q.type === "truefalse") {
    isCorrect = isLiveAnswerCorrect(q, opt);
  } else {
    const key = String.fromCharCode(65 + Number(idx || 0));
    isCorrect = isLiveAnswerCorrect(q, key);
  }
  const questionXP = Math.max(0, Number(q?.xp ?? MAX_QUESTION_XP));
  const xp = isCorrect ? questionXP : 0;
  const selectedKey = q.type === "truefalse"
    ? normalizeTrueFalseValue(opt)
    : String.fromCharCode(65 + Number(idx || 0));
  const answerPayload = {
    userId: currentUserId,
    name: getUserDisplayName(userData || {}),
    qIndex,
    selectedKey,
    selected: opt,
    isCorrect,
    xp,
    answeredAtMs: Date.now()
  };
  await setDoc(ansRef, answerPayload);
  studentLiveAnswerCache.set(`${session.id}_${qIndex}_${currentUserId}`, answerPayload);
  const scoreRef = doc(db, "liveQuizSessions", session.id, "scores", currentUserId);
  const scoreSnap = await getDoc(scoreRef);
  const prev = scoreSnap.exists() ? scoreSnap.data() : { xp: 0, correct: 0, answered: 0, xpAwarded: 0 };
  await setDoc(scoreRef, {
    userId: currentUserId,
    name: getUserDisplayName(userData || {}),
    xp: Number(prev.xp || 0) + xp,
    xpAwarded: Math.max(0, Number(prev.xpAwarded || 0)) + xp,
    correct: Number(prev.correct || 0) + (isCorrect ? 1 : 0),
    answered: Number(prev.answered || 0) + 1,
    updatedAtMs: Date.now()
  }, { merge: true });
  if (xp > 0) {
    try {
      await updateDoc(doc(db, "users", String(currentUserId)), { xp: increment(xp), updatedAt: serverTimestamp() });
    } catch {
      await setDoc(doc(db, "users", String(currentUserId)), { xp: increment(xp), updatedAt: serverTimestamp() }, { merge: true });
    }
    if (userData) userData.xp = Math.max(0, Number(userData.xp || 0)) + xp;
    updateUserXPDisplay();
  }
  await syncStudentLiveQuizProgress(session.id, false);
  showNotice(isCorrect ? `Doğru! +${questionXP} XP` : "Yanlış cevap.", isCorrect ? "#2ecc71" : "#e74c3c");
  renderStudentLiveQuestion();
}

async function submitStudentLiveMatchingAnswer(selectedMap = {}) {
  const session = activeStudentLiveSession;
  if (!session?.id) return;
  if (session?.isLocked) {
    showNotice("Bu soru kilitli. Öğretmenin açmasını bekleyin.", "#f39c12");
    return;
  }
  const sessionRef = doc(db, "liveQuizSessions", session.id);
  const sessionSnap = await getDoc(sessionRef);
  if (!sessionSnap.exists() || sessionSnap.data()?.isLocked) {
    showNotice("Bu soru şu anda kilitli.", "#f39c12");
    return;
  }
  const qIndex = Number(session.currentIndex || 0);
  const q = session.questions?.[qIndex];
  if (!q || q.type !== "matching") return;
  const answerId = `${currentUserId}_${qIndex}`;
  const ansRef = doc(db, "liveQuizSessions", session.id, "answers", answerId);
  const already = await getDoc(ansRef);
  if (already.exists()) {
    showNotice("Bu soruyu zaten cevapladın.", "#f39c12");
    const key = `${session.id}_${qIndex}_${currentUserId}`;
    studentLiveAnswerCache.set(key, already.data());
    renderStudentLiveQuestion();
    return;
  }
  const normalizedMap = normalizeLiveMatchingMap(selectedMap);
  const isCorrect = isLiveAnswerCorrect(q, normalizedMap);
  const questionXP = Math.max(0, Number(q?.xp ?? MAX_QUESTION_XP));
  const xp = isCorrect ? questionXP : 0;
  const answerPayload = {
    userId: currentUserId,
    name: getUserDisplayName(userData || {}),
    qIndex,
    selectedKey: serializeLiveMatchingMap(normalizedMap),
    selectedMap: normalizedMap,
    selected: "Eşleştirme",
    isCorrect,
    xp,
    answeredAtMs: Date.now()
  };
  await setDoc(ansRef, answerPayload);
  studentLiveAnswerCache.set(`${session.id}_${qIndex}_${currentUserId}`, answerPayload);
  const scoreRef = doc(db, "liveQuizSessions", session.id, "scores", currentUserId);
  const scoreSnap = await getDoc(scoreRef);
  const prev = scoreSnap.exists() ? scoreSnap.data() : { xp: 0, correct: 0, answered: 0, xpAwarded: 0 };
  await setDoc(scoreRef, {
    userId: currentUserId,
    name: getUserDisplayName(userData || {}),
    xp: Number(prev.xp || 0) + xp,
    xpAwarded: Math.max(0, Number(prev.xpAwarded || 0)) + xp,
    correct: Number(prev.correct || 0) + (isCorrect ? 1 : 0),
    answered: Number(prev.answered || 0) + 1,
    updatedAtMs: Date.now()
  }, { merge: true });
  if (xp > 0) {
    try {
      await updateDoc(doc(db, "users", String(currentUserId)), { xp: increment(xp), updatedAt: serverTimestamp() });
    } catch {
      await setDoc(doc(db, "users", String(currentUserId)), { xp: increment(xp), updatedAt: serverTimestamp() }, { merge: true });
    }
    if (userData) userData.xp = Math.max(0, Number(userData.xp || 0)) + xp;
    updateUserXPDisplay();
  }
  await syncStudentLiveQuizProgress(session.id, false);
  showNotice(isCorrect ? `Eşleştirme doğru! +${questionXP} XP` : "Eşleştirme yanlış.", isCorrect ? "#2ecc71" : "#e74c3c");
  renderStudentLiveQuestion();
}

function renderStudentLiveRank(rows = []) {
  const box = document.getElementById("live-player-rank");
  if (!box) return;
  if (!rows.length) {
    box.innerHTML = `<div class="empty-state">Henüz sıralama oluşmadı.</div>`;
    return;
  }
  box.innerHTML = rows.slice(0, 10).map((r, i) => {
    const mine = r.userId === currentUserId;
    return `
      <div class="list-item" style="cursor:default;padding:8px 10px;${mine ? "border-left-color:#16a34a;background:#f0fdf4;" : ""}">
        <div><strong>${i + 1}. ${r.name || r.userId || "-"}</strong></div>
        <div style="font-weight:700;color:#2563eb;">${r.xp || 0} XP</div>
      </div>
    `;
  }).join("");
}

function stopStudentLiveScoresListener() {
  if (livePlayerScoresUnsub) livePlayerScoresUnsub();
  livePlayerScoresUnsub = null;
}

function startStudentLiveScoresListener(sessionId) {
  stopStudentLiveScoresListener();
  if (!sessionId) return;
  livePlayerScoresUnsub = onSnapshot(collection(db, "liveQuizSessions", sessionId, "scores"), (snap) => {
    const rows = [];
    snap.forEach((d) => rows.push(d.data()));
    rows.sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));
    renderStudentLiveRank(rows);
  });
}

function updateLivePlayerTimer(leftSeconds) {
  const timer = document.getElementById("live-player-timer");
  if (!timer) return;
  const safe = Math.max(0, Number(leftSeconds || 0));
  timer.innerText = `${safe} sn`;
  timer.classList.toggle("warn", safe > 0 && safe <= 10);
  timer.classList.toggle("danger", safe > 0 && safe <= 5);
}

function openLivePlayer() {
  const modal = document.getElementById("live-quiz-player");
  if (!modal || !activeStudentLiveSession) return;
  modal.style.display = "flex";
  syncStudentLiveQuizProgress(activeStudentLiveSession.id, false);
  renderStudentLiveQuestion();
  const rankBox = document.getElementById("live-player-rank");
  if (rankBox) {
    const rankCard = rankBox.closest(".card");
    if (rankCard) rankCard.style.display = "none";
  }
  updateLivePlayerTimer(Math.max(0, Math.floor(((activeStudentLiveSession?.endsAtMs || 0) - Date.now()) / 1000)));
  if (livePlayerTick) clearInterval(livePlayerTick);
  livePlayerTick = setInterval(() => {
    const left = Math.max(0, Math.floor(((activeStudentLiveSession?.endsAtMs || 0) - Date.now()) / 1000));
    updateLivePlayerTimer(left);
    if (left <= 0) {
      renderStudentLiveQuestion();
    }
  }, 500);
}

function closeLivePlayer() {
  const modal = document.getElementById("live-quiz-player");
  if (modal) modal.style.display = "none";
  if (livePlayerTick) clearInterval(livePlayerTick);
  livePlayerTick = null;
  stopStudentLiveScoresListener();
  studentLiveAnswerCache = new Map();
}

document.getElementById("btn-download-student-pdf").onclick = async function () {
  await downloadStudentPdf();
};

async function downloadStudentPdf() {
  if (!currentStudentDetail) {
    showNotice("Öğrenci bilgisi yok!", "#e74c3c");
    return;
  }
  await openStudentReportWindow(currentStudentDetail);
}

window.closeStudentDetail = function() {
  document.getElementById("student-detail-modal").style.display = "none";
  currentStudentDetail = null;
  if (studentQuizDetailChart) {
    studentQuizDetailChart.destroy();
    studentQuizDetailChart = null;
  }
};

/* ================= ÇIKIŞ ================= */
async function handleUserLogout({ closeSideMenu = true, closeDropdown = true } = {}) {
  if (logoutInProgress) return;
  logoutInProgress = true;
  if (userProfileUnsub) {
    try { userProfileUnsub(); } catch (e) {}
    userProfileUnsub = null;
  }
  // Sign-out beklenirken arayuzde kalma hissini engellemek icin login ekranina hemen gec.
  ensureLoggedOutView();
  if (closeDropdown) {
    const dropdown = document.getElementById("user-dropdown");
    if (dropdown) dropdown.style.display = "none";
  }
  if (closeSideMenu) {
    const sideMenu = document.getElementById("side-menu");
    if (sideMenu) sideMenu.style.width = "0";
  }
  closeAvatarShopModal();
  closeAppsHubModal();
  try {
    await saveSessionTime();
  } catch (e) {
    console.warn("saveSessionTime failed during logout:", e);
  }
  try {
    await signOut(auth);
    showNotice("Çıkış yapıldı", "#4a90e2");
  } catch (e) {
    logoutInProgress = false;
    console.warn("logout failed:", e);
    showNotice("Çıkış yapılamadı. Tekrar deneyin.", "#e74c3c");
  }
}

const logoutSideBtn = document.getElementById("btn-logout-side");
if (logoutSideBtn) logoutSideBtn.onclick = async function () {
  document.getElementById("side-menu").style.width = "0";
  const createModal = document.getElementById("create-task-modal");
  if (createModal) createModal.style.display = "none";
  const studentsModalEl = document.getElementById("students-modal");
  if (studentsModalEl) studentsModalEl.style.display = "none";
  const reportsModalEl = document.getElementById("reports-modal");
  if (reportsModalEl) reportsModalEl.style.display = "none";
  const tasksModalEl = document.getElementById("tasks-modal");
  if (tasksModalEl) tasksModalEl.style.display = "none";
  const classesModalEl = document.getElementById("classes-modal");
  if (classesModalEl) classesModalEl.style.display = "none";
  const taskStudentsModalEl = document.getElementById("task-students-modal");
  if (taskStudentsModalEl) taskStudentsModalEl.style.display = "none";
  const allTasksModalEl = document.getElementById("all-tasks-modal");
  if (allTasksModalEl) allTasksModalEl.style.display = "none";
  const profileModalEl = document.getElementById("profile-modal");
  if (profileModalEl) profileModalEl.style.display = "none";
  const contentModalEl = document.getElementById("content-modal");
  if (contentModalEl) contentModalEl.style.display = "none";
  const myStatsModalEl = document.getElementById("my-stats-modal");
  if (myStatsModalEl) myStatsModalEl.style.display = "none";
  const certificatesModalEl = document.getElementById("certificates-modal");
  if (certificatesModalEl) certificatesModalEl.style.display = "none";
  const teacherCertificatesModalEl = document.getElementById("teacher-certificates-modal");
  if (teacherCertificatesModalEl) teacherCertificatesModalEl.style.display = "none";
  await handleUserLogout({ closeSideMenu: true, closeDropdown: true });
};

document.getElementById("task-modal").onclick = function(e) {
  if (e.target === this) closeModal();
};

document.getElementById("student-detail-modal").onclick = function(e) {
  if (e.target === this) closeStudentDetail();
};

document.getElementById("students-modal").onclick = function(e) {
  if (e.target === this && studentsModal) studentsModal.style.display = "none";
};

document.getElementById("password-modal").onclick = function(e) {
  if (e.target === this && passwordModal) passwordModal.style.display = "none";
};

document.getElementById("reports-modal").onclick = function(e) {
  if (e.target === this && reportsModal) reportsModal.style.display = "none";
};
document.getElementById("leaderboard-modal")?.addEventListener("click", function(e) {
  if (e.target === this) this.style.display = "none";
});

document.getElementById("tasks-modal").onclick = function(e) {
  if (e.target === this && tasksModal) tasksModal.style.display = "none";
};

document.getElementById("classes-modal")?.addEventListener("click", function(e) {
  if (e.target === this && classesModal) classesModal.style.display = "none";
});

document.getElementById("task-students-modal").onclick = function(e) {
  if (e.target === this && taskStudentsModal) taskStudentsModal.style.display = "none";
};

document.getElementById("all-tasks-modal").onclick = function(e) {
  if (e.target === this && allTasksModal) allTasksModal.style.display = "none";
};

document.getElementById("profile-modal").onclick = function(e) {
  if (e.target === this && profileModal) profileModal.style.display = "none";
};

document.getElementById("my-stats-modal").onclick = function(e) {
  if (e.target === this && myStatsModal) myStatsModal.style.display = "none";
};

document.getElementById("certificates-modal").onclick = function(e) {
  if (e.target === this && certificatesModal) certificatesModal.style.display = "none";
};
document.getElementById("teacher-certificates-modal").onclick = function(e) {
  if (e.target === this && teacherCertificatesModal) teacherCertificatesModal.style.display = "none";
};



/* ================= FİLTRELEME ================= */
window.filterTasks = function(filterType) {
  currentFilter = filterType;
  
  document.querySelectorAll('#teacher-filters .filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filterType) {
      btn.classList.add('active');
    }
  });
  
  updateTaskLists();
};

window.filterActivities = function(filterType) {
  currentActivityFilter = filterType;
  document.querySelectorAll('#activity-filters .filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filterType) {
      btn.classList.add('active');
    }
  });
  updateActivityLists();
};

window.filterBlockHomework = function(filterType) {
  currentBlockHomeworkFilter = filterType;
  document.querySelectorAll('#block-homework-filters .filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filterType) btn.classList.add('active');
  });
  renderBlockHomeworkList();
};

window.filterComputeHomework = function(filterType) {
  currentComputeHomeworkFilter = filterType;
  document.querySelectorAll('#compute-homework-filters .filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filterType) btn.classList.add('active');
  });
  renderComputeHomeworkList();
};

function matchesFilter(task) {
  const isArchived = !!task?.isDeleted;
  if (currentFilter === "archived") return isArchived;
  if (isArchived) return false;
  if (currentFilter === 'all') return true;
  
  const now = new Date();
  const taskDate = task.createdAt ? task.createdAt.toDate() : new Date(0);
  
  if (currentFilter === 'active') {
    const deadline = task.deadline ? new Date(task.deadline) : null;
    return !deadline || deadline > now;
  }
  
  if (currentFilter === 'expired') {
    const deadline = task.deadline ? new Date(task.deadline) : null;
    return deadline && deadline < now;
  }
  
  if (currentFilter === 'this-week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return taskDate >= weekAgo;
  }
  
  if (currentFilter === 'this-month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return taskDate >= monthAgo;
  }
  
  return true;
}

function matchesActivityFilter(assignment) {
  const isArchived = !!assignment?.isDeleted;
  if (currentActivityFilter === "archived") return isArchived;
  if (isArchived) return false;
  if (currentActivityFilter === "all") return true;
  const now = new Date();
  const createdDate = assignment.createdAtDate || (assignment.createdAt && typeof assignment.createdAt.toDate === "function" ? assignment.createdAt.toDate() : new Date(0));
  const deadlineDate = getAssignmentDeadlineDate(assignment);
  if (currentActivityFilter === "active") {
    return !deadlineDate || deadlineDate > now;
  }
  if (currentActivityFilter === "expired") {
    return deadlineDate && deadlineDate < now;
  }
  if (currentActivityFilter === "this-week") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return createdDate >= weekAgo;
  }
  if (currentActivityFilter === "this-month") {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return createdDate >= monthAgo;
  }
  return true;
}

function startContentProgressListener() {
  if (!currentUserId) return;
  if (progressUnsub) progressUnsub();
  const pq = query(collection(db, "contentProgress"), where("userId", "==", currentUserId));
  progressUnsub = onSnapshot(pq, (snap) => {
    contentProgressMap.clear();
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      contentProgressMap.set(data.contentId, data);
    });
    renderContentList();
    updateActivityLists();
    updateUserXPDisplay(lastTaskXP);
    if (myStatsModal && myStatsModal.style.display === "flex") {
      loadMyStatsModal();
    }
    if (selectedContentId) {
      const selected = allContents.find(c => c.id === selectedContentId);
      if (selected) selectContentForView(selected);
    }
  });
}

function startBookTaskProgressListener() {
  if (!currentUserId) return;
  if (window._bookTaskUnsub) window._bookTaskUnsub();
  const q = query(collection(db, "bookTaskProgress"), where("userId", "==", currentUserId));
  window._bookTaskUnsub = onSnapshot(q, (snap) => {
    bookTaskProgressMap.clear();
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data?.taskId) bookTaskProgressMap.set(data.taskId, data);
    });
    updateTaskLists();
  });
}

function startActivityProgressListener() {
  if (activityProgressUnsub) activityProgressUnsub();
  activityProgressMap.clear();
  getDocs(query(collection(db, "users"), where("role", "==", "student"))).then((snap) => {
    studentIdSet.clear();
    const rows = [];
    snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
    scopeStudentsForCurrentRole(rows).forEach((s) => studentIdSet.add(s.id));
  }).catch(() => {});
  const q = query(collection(db, "contentProgress"));
  activityProgressUnsub = onSnapshot(q, (snap) => {
    const map = new Map();
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const contentId = data.contentId;
      const userId = data.userId;
      if (!contentId || !userId) return;
      if (studentIdSet.size && !studentIdSet.has(userId)) return;
      const appUsage = data.appUsage || {};
      let best = 0;
      Object.values(appUsage).forEach((u) => {
        const p = u?.percent || 0;
        if (p > best) best = p;
      });
      const completed = best > 0 || (data.completedItemIds || []).length > 0;
      if (!completed) return;
      if (!map.has(contentId)) map.set(contentId, new Set());
      map.get(contentId).add(userId);
    });
    activityProgressMap.clear();
    map.forEach((set, key) => activityProgressMap.set(key, set.size));
    updateActivityLists();
  });
}

function formatDurationParts(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return { days, hours, mins, secs };
}

function toDurationMs(valueMs, valueMinutes) {
  const ms = Math.max(0, Number(valueMs || 0));
  if (ms > 0) return ms;
  const minutes = Math.max(0, Number(valueMinutes || 0));
  return minutes > 0 ? Math.round(minutes * 60000) : 0;
}

function formatQuizDurationText(valueMs, valueMinutes) {
  const ms = toDurationMs(valueMs, valueMinutes);
  if (ms <= 0) return "-";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes} dk ${seconds} sn`;
}

function updateSystemTimeUI() {
  const widget = document.getElementById("student-total-time");
  if (!widget || !userRole) return;
  const elapsed = sessionStart ? Math.max(0, Math.round((Date.now() - sessionStart) / 1000)) : 0;
  const total = (baseSystemSeconds || 0) + elapsed;
  const parts = formatDurationParts(total);
  const d = document.getElementById("time-days");
  const h = document.getElementById("time-hours");
  const m = document.getElementById("time-mins");
  const s = document.getElementById("time-secs");
  if (d) d.innerText = parts.days;
  if (h) h.innerText = parts.hours;
  if (m) m.innerText = parts.mins;
  if (s) s.innerText = parts.secs;
}

function getActivityXPFromProgressMap() {
  let total = 0;
  contentProgressMap.forEach((p) => {
    const appUsage = p.appUsage || {};
    Object.values(appUsage).forEach((u) => {
      total += u?.xp || 0;
    });
  });
  return total;
}

function getBlockXPFromProgressMap() {
  let total = 0;
  blockAssignmentProgressMap.forEach((p) => {
    total += Math.max(0, Number(p?.totalXP || 0));
  });
  return total;
}

function getComputeXPFromProgressMap() {
  let total = 0;
  computeAssignmentProgressMap.forEach((p) => {
    total += Math.max(0, Number(p?.totalXP || 0));
  });
  return total;
}

function getLessonXPFromProgressMap() {
  let total = 0;
  lessonProgressMap.forEach((p) => {
    total += Math.max(0, Number(p?.totalXP || 0));
  });
  return total;
}

function buildAvatarHairSvg(style, color) {
  const c = color || "#2f241e";
  if (style === "long") {
    return `<path d="M16 31c0-13 8-22 20-22s20 9 20 22c-2-5-8-9-20-9s-18 4-20 9z" fill="${c}"/>`;
  }
  if (style === "wave") {
    return `<path d="M15 30c1-12 9-21 21-21 9 0 15 4 20 11-5-3-9-4-14-3-4 1-8 4-12 4-6 0-10-3-15 9z" fill="${c}"/>`;
  }
  if (style === "spike") {
    return `<path d="M16 30l4-10 6 5 4-9 7 6 5-8 10 16z" fill="${c}"/>`;
  }
  if (style === "tech") {
    return `<rect x="16" y="12" width="40" height="18" rx="8" fill="${c}"/><rect x="21" y="16" width="30" height="3" fill="#38bdf8" opacity="0.7"/>`;
  }
  if (style === "hero") {
    return `<path d="M14 32c2-14 9-23 22-23 9 0 15 4 20 12-7-3-12-2-16 1-5 3-10 5-16 4-4-1-7 1-10 6z" fill="${c}"/>`;
  }
  if (style === "round") {
    return `<ellipse cx="36" cy="24" rx="22" ry="16" fill="${c}"/>`;
  }
  if (style === "crew") {
    return `<rect x="17" y="13" width="38" height="16" rx="6" fill="${c}"/>`;
  }
  return `<path d="M16 30c2-12 10-21 20-21s18 9 20 21z" fill="${c}"/>`;
}

function buildAvatarImageDataUri(avatar) {
  const tone = avatar?.tone || "#f6c28b";
  const eye = avatar?.eye || "#1f2937";
  const shirt = avatar?.shirt || "#2563eb";
  const bg = avatar?.gradient || "linear-gradient(135deg,#93c5fd,#2563eb)";
  const g = String(bg).match(/#(?:[0-9a-fA-F]{3}){1,2}/g) || ["#93c5fd", "#2563eb"];
  const bg1 = g[0] || "#93c5fd";
  const bg2 = g[1] || bg1;
  const hair = buildAvatarHairSvg(avatar?.hairStyle, avatar?.hair);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 72 72">
  <defs>
    <radialGradient id="bg" cx="30%" cy="22%" r="90%">
      <stop offset="0%" stop-color="${bg1}" />
      <stop offset="100%" stop-color="${bg2}" />
    </radialGradient>
    <radialGradient id="skin" cx="35%" cy="25%" r="80%">
      <stop offset="0%" stop-color="#ffd9b5" />
      <stop offset="100%" stop-color="${tone}" />
    </radialGradient>
  </defs>
  <rect width="72" height="72" rx="36" fill="url(#bg)"/>
  <ellipse cx="36" cy="61" rx="21" ry="16" fill="${shirt}" opacity="0.96"/>
  ${hair}
  <ellipse cx="36" cy="37" rx="16" ry="17" fill="url(#skin)"/>
  <ellipse cx="30" cy="36" rx="2.2" ry="2.4" fill="${eye}"/>
  <ellipse cx="42" cy="36" rx="2.2" ry="2.4" fill="${eye}"/>
  <path d="M31 45c3 3 7 3 10 0" stroke="#7c2d12" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <ellipse cx="25" cy="41" rx="2.8" ry="1.8" fill="#fca5a5" opacity="0.35"/>
  <ellipse cx="47" cy="41" rx="2.8" ry="1.8" fill="#fca5a5" opacity="0.35"/>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getAvatarById(avatarId) {
  return AVATAR_CATALOG.find((a) => a.id === avatarId) || AVATAR_CATALOG[0];
}

function normalizeOwnedAvatarIds(rawIds) {
  const owned = Array.isArray(rawIds) ? rawIds.map((v) => String(v || "")).filter(Boolean) : [];
  if (!owned.includes(AVATAR_DEFAULT_ID)) owned.unshift(AVATAR_DEFAULT_ID);
  return Array.from(new Set(owned));
}

function getEffectiveStudentXP() {
  const fromHeader = Number(String(document.getElementById("user-xp")?.innerText || "0").replace(/[^\d.-]/g, "")) || 0;
  const fromData = Math.max(0, Number(userData?.xp || 0));
  return Math.max(fromHeader, fromData);
}

function renderHeaderAvatar() {
  const slot = document.getElementById("user-header-avatar");
  if (!slot) return;
  if (userRole !== "student") {
    slot.classList.remove("visible");
    slot.innerHTML = "";
    return;
  }
  const selectedId = String(userData?.selectedAvatarId || AVATAR_DEFAULT_ID);
  const avatar = getAvatarById(selectedId);
  slot.classList.add("visible");
  slot.style.background = avatar.gradient;
  slot.innerHTML = `<img src="${buildAvatarImageDataUri(avatar)}" alt="${avatar.name}">`;
}

function renderAvatarShop() {
  const grid = document.getElementById("avatar-shop-grid");
  const xpLabel = document.getElementById("avatar-shop-current-xp");
  if (!grid || userRole !== "student") return;
  const selectedId = String(userData?.selectedAvatarId || AVATAR_DEFAULT_ID);
  const owned = normalizeOwnedAvatarIds(userData?.ownedAvatarIds);
  const currentXP = getEffectiveStudentXP();
  if (xpLabel) xpLabel.innerText = `XP: ${currentXP}`;
  grid.innerHTML = AVATAR_CATALOG.map((avatar) => {
    const isOwned = owned.includes(avatar.id);
    const isSelected = avatar.id === selectedId;
    const stateClass = `${isOwned ? "owned" : ""} ${isSelected ? "selected" : ""}`.trim();
    const buttonText = isSelected ? "Kullanılıyor" : isOwned ? "Seç" : `${avatar.cost} XP ile Al`;
    const buttonClass = isSelected ? "btn-success" : isOwned ? "btn-primary" : "btn-warning";
    const disabledAttr = isSelected ? "disabled" : "";
    return `
      <div class="avatar-card ${stateClass}">
        <div class="avatar-icon" style="background:${avatar.gradient};"><img src="${buildAvatarImageDataUri(avatar)}" alt="${avatar.name}"></div>
        <h4>${avatar.name}</h4>
        <div class="avatar-cost">${avatar.cost === 0 ? "Ücretsiz" : `${avatar.cost} XP`}</div>
        <button class="btn ${buttonClass}" data-avatar-action="${isOwned ? "select" : "buy"}" data-avatar-id="${avatar.id}" ${disabledAttr}>${buttonText}</button>
      </div>
    `;
  }).join("");
}

async function handleAvatarAction(avatarId, action) {
  if (!currentUserId || userRole !== "student") return;
  const avatar = getAvatarById(avatarId);
  const userRef = doc(db, "users", currentUserId);
  try {
    const snap = await getDoc(userRef);
    const src = snap.exists() ? snap.data() : (userData || {});
    const owned = normalizeOwnedAvatarIds(src?.ownedAvatarIds);
    const selectedId = String(src?.selectedAvatarId || AVATAR_DEFAULT_ID);
    const currentXP = Math.max(0, Number(src?.xp || 0));

    if (action === "select") {
      if (!owned.includes(avatar.id)) {
        showNotice("Bu avatar henüz satın alınmadı.", "#e74c3c");
        return;
      }
      if (selectedId === avatar.id) return;
      await setDoc(userRef, { selectedAvatarId: avatar.id, updatedAt: serverTimestamp() }, { merge: true });
      userData = { ...(userData || {}), selectedAvatarId: avatar.id };
      renderHeaderAvatar();
      renderAvatarShop();
      showNotice(`Profil avatarı: ${avatar.name}`, "#2ecc71");
      return;
    }

    if (owned.includes(avatar.id)) {
      await setDoc(userRef, { selectedAvatarId: avatar.id, updatedAt: serverTimestamp() }, { merge: true });
      userData = { ...(userData || {}), selectedAvatarId: avatar.id };
      renderHeaderAvatar();
      renderAvatarShop();
      return;
    }

    if (currentXP < avatar.cost) {
      const missing = Math.max(0, avatar.cost - currentXP);
      await infoDialog(`Yetersiz XP.\nGerekli: ${avatar.cost} XP\nSende: ${currentXP} XP\nEksik: ${missing} XP`, { okText: "Tamam" });
      return;
    }

    const ok = await confirmDialog(`"${avatar.name}" için ${avatar.cost} XP harcansın mı?`, {
      yesText: "Evet, Satın Al",
      noText: "Vazgeç",
      yesClass: "btn btn-success"
    });
    if (!ok) return;

    const nextXP = Math.max(0, currentXP - avatar.cost);
    const nextOwned = normalizeOwnedAvatarIds([...owned, avatar.id]);
    await setDoc(userRef, {
      xp: nextXP,
      ownedAvatarIds: nextOwned,
      selectedAvatarId: avatar.id,
      updatedAt: serverTimestamp()
    }, { merge: true });
    userData = { ...(userData || {}), xp: nextXP, ownedAvatarIds: nextOwned, selectedAvatarId: avatar.id };
    updateUserXPDisplay();
    renderHeaderAvatar();
    renderAvatarShop();
    showNotice(`"${avatar.name}" avatarı satın alındı.`, "#2ecc71");
  } catch (e) {
    showNotice("Avatar işlemi sırasında hata oluştu.", "#e74c3c");
    console.error("avatar action error:", e);
  }
}

function openAvatarShopModal() {
  if (userRole !== "student") return;
  const modal = document.getElementById("avatar-shop-modal");
  if (!modal) return;
  renderAvatarShop();
  modal.style.display = "flex";
}

function closeAvatarShopModal() {
  const modal = document.getElementById("avatar-shop-modal");
  if (modal) modal.style.display = "none";
}

function updateUserXPDisplay(taskXP) {
  if (typeof taskXP === "number" && Number.isFinite(taskXP)) {
    lastTaskXP = Math.max(0, taskXP);
  }
  const toSafeNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const computedTotal = (lastTaskXP || 0)
    + getActivityXPFromProgressMap()
    + getBlockXPFromProgressMap()
    + getComputeXPFromProgressMap()
    + getLessonXPFromProgressMap();
  const persistedTotal = Math.max(0, toSafeNum(userData?.xp));
  const total = Math.max(computedTotal, persistedTotal);
  const el = document.getElementById("user-xp");
  if (el) el.innerText = `${total} XP`;
  if (avatarShopModal && avatarShopModal.style.display === "flex") {
    renderAvatarShop();
  }
  if (userRole === "student" && certificatesModal && certificatesModal.style.display === "flex") {
    renderStudentCertificateCard();
  }
}

function buildMiniChartSvg(scores) {
  const w = 360;
  const h = 140;
  const pad = 18;
  if (!scores || scores.length === 0) {
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Grafik"><rect x="0" y="0" width="${w}" height="${h}" fill="#f8fafc" rx="10"/><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="#94a3b8" font-size="11">Veri yok</text></svg>`;
  }
  const max = Math.max(100, ...scores);
  const span = max || 1;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const step = innerW / Math.max(1, scores.length - 1);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const points = scores.map((s, i) => {
    const x = pad + i * step;
    const y = h - pad - ((s / span) * innerH);
    return { x, y, v: s };
  });
  const line = points.map(p => `${p.x},${p.y}`).join(" ");
  const avgY = h - pad - ((avg / span) * innerH);
  const dots = points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="2.6" fill="#2f6fed" stroke="#fff" stroke-width="1"/>`).join("");
  const last = points[points.length - 1];
  const barW = Math.min(18, Math.max(6, step * 0.6));
  const bars = points.map(p => {
    const barH = (p.v / span) * innerH;
    const x = p.x - barW / 2;
    const y = h - pad - barH;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="4" fill="rgba(47,111,237,0.25)"/>`;
  }).join("");
  return `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Grafik">
      <defs>
        <linearGradient id="comboGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2f6fed" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#22c55e" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${w}" height="${h}" fill="#f8fafc" rx="10"/>
      <line x1="${pad}" y1="${h - pad}" x2="${w - pad}" y2="${h - pad}" stroke="#e2e8f0" stroke-width="1"/>
      <line x1="${pad}" y1="${h - pad - innerH/2}" x2="${w - pad}" y2="${h - pad - innerH/2}" stroke="#eef2f7" stroke-width="1"/>
      <line x1="${pad}" y1="${pad}" x2="${w - pad}" y2="${pad}" stroke="#eef2f7" stroke-width="1"/>
      <text x="${pad - 6}" y="${pad + 4}" text-anchor="end" fill="#94a3b8" font-size="9">100</text>
      <text x="${pad - 6}" y="${h - pad - innerH/2 + 4}" text-anchor="end" fill="#94a3b8" font-size="9">50</text>
      <text x="${pad - 6}" y="${h - pad + 4}" text-anchor="end" fill="#94a3b8" font-size="9">0</text>
      ${bars}
      <polyline fill="none" stroke="#2f6fed" stroke-width="2" points="${line}" />
      <line x1="${pad}" y1="${avgY}" x2="${w - pad}" y2="${avgY}" stroke="#22c55e" stroke-dasharray="4 3" stroke-width="1.5"/>
      <text x="${w - pad}" y="${avgY - 4}" text-anchor="end" fill="#22c55e" font-size="9">Ort: ${avg}%</text>
      ${dots}
      <text x="${last.x}" y="${Math.max(pad + 10, last.y - 6)}" text-anchor="middle" fill="#1d4ed8" font-size="9">${last.v}%</text>
    </svg>
  `;
}

function buildPieSvg(completed, total, label, color) {
  const size = 92;
  const radius = 34;
  const cx = size / 2;
  const cy = size / 2;
  const safeTotal = Math.max(0, total || 0);
  const safeCompleted = Math.min(Math.max(0, completed || 0), safeTotal || 0);
  const pct = safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;
  const gap = circ - dash;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${label}">
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#e5e7eb" stroke-width="10"/>
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="10"
        stroke-linecap="round" stroke-dasharray="${dash} ${gap}" transform="rotate(-90 ${cx} ${cy})"/>
      <text x="${cx}" y="${cy - 3}" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">%${pct}</text>
      <text x="${cx}" y="${cy + 11}" text-anchor="middle" fill="#6b7280" font-size="8">${label}</text>
    </svg>
  `;
}

function startSystemTimer() {
  if (systemTimerInterval) clearInterval(systemTimerInterval);
  updateSystemTimeUI();
  systemTimerInterval = setInterval(() => {
    updateSystemTimeUI();
    if (currentUserKey) {
      const elapsed = sessionStart ? Math.max(0, Math.round((Date.now() - sessionStart) / 1000)) : 0;
      const total = (baseSystemSeconds || 0) + elapsed;
      localStorage.setItem(currentUserKey, String(total));
    }
  }, 1000);
}

function stopSystemTimer() {
  if (systemTimerInterval) clearInterval(systemTimerInterval);
  systemTimerInterval = null;
}

function flushSessionToLocal() {
  if (!currentUserKey) return;
  const elapsed = sessionStart ? Math.max(0, Math.round((Date.now() - sessionStart) / 1000)) : 0;
  const total = (baseSystemSeconds || 0) + elapsed;
  localStorage.setItem(currentUserKey, String(total));
}

function pauseActivityTimer() {
  if (blockRunnerSession?.running) {
    pauseBlockRunnerTimer();
  }
  if (computeRunnerSession?.running) {
    pauseComputeRunnerTimer();
  }
  if (!activitySession || !activitySession.running) return;
  const elapsedNow = getActivityElapsedSeconds();
  const base = activitySession.baseSeconds || 0;
  activitySession.elapsedBefore = Math.max(0, elapsedNow - base);
  activitySession.start = null;
  activitySession.running = false;
  if (activityTimerInterval) clearInterval(activityTimerInterval);
  activityTimerInterval = null;
  setActivityStartButtons(false);
  setActivityPausedUI(true);
  updateActivityTimerUI();
}

function resumeActivityTimer() {
  if (blockRunnerSession && !blockRunnerSession.running && blockRunnerSession.wasPausedByDialog) {
    resumeBlockRunnerTimer();
  }
  if (computeRunnerSession && !computeRunnerSession.running && computeRunnerSession.wasPausedByDialog) {
    resumeComputeRunnerTimer();
  }
  if (!activitySession || activitySession.running) return;
  activitySession.start = Date.now();
  activitySession.running = true;
  setActivityStartButtons(true);
  setActivityPausedUI(false);
  if (activityTimerInterval) clearInterval(activityTimerInterval);
  activityTimerInterval = setInterval(() => {
    if (!activitySession || !activitySession.running) return;
    updateActivityTimerUI();
  }, 1000);
}

function getBlockRunnerElapsedSeconds() {
  if (!blockRunnerSession) return 0;
  const base = blockRunnerSession.savedElapsedSeconds || 0;
  if (!blockRunnerSession.running || !blockRunnerSession.startAt) return base;
  return base + Math.max(0, Math.round((Date.now() - blockRunnerSession.startAt) / 1000));
}

function updateBlockRunnerTimerUI() {
  const sec = getBlockRunnerElapsedSeconds();
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  const el = document.getElementById("block-runner-timer");
  if (el) el.innerText = `⏱️ ${mins} dk ${secs} sn`;
}

function setBlockRunnerHeaderByRole() {
  const isTeacher = userRole === "teacher";
  const addBtn = document.getElementById("btn-activity-head-add-level");
  const editBtn = document.getElementById("btn-activity-head-edit-level");
  const moveUpBtn = document.getElementById("btn-activity-head-move-up");
  const moveDownBtn = document.getElementById("btn-activity-head-move-down");
  const delBtn = document.getElementById("btn-activity-head-delete-level");
  const startBtn = document.getElementById("btn-activity-head-start");
  const fullBtn = document.getElementById("btn-activity-head-fullscreen");
  const saveBtn = document.getElementById("btn-activity-head-save");
  const exitBtn = document.getElementById("btn-activity-head-exit");
  const timer = document.getElementById("block-runner-timer");
  if (addBtn) addBtn.style.display = isTeacher ? "inline-flex" : "none";
  if (editBtn) editBtn.style.display = isTeacher ? "inline-flex" : "none";
  if (moveUpBtn) moveUpBtn.style.display = isTeacher ? "inline-flex" : "none";
  if (moveDownBtn) moveDownBtn.style.display = isTeacher ? "inline-flex" : "none";
  if (delBtn) delBtn.style.display = isTeacher ? "inline-flex" : "none";
  if (startBtn) startBtn.style.display = isTeacher ? "none" : "inline-flex";
  if (fullBtn) fullBtn.style.display = isTeacher ? "none" : "inline-flex";
  if (saveBtn) saveBtn.style.display = isTeacher ? "none" : "inline-flex";
  if (exitBtn) exitBtn.style.display = isTeacher ? "none" : "inline-flex";
  if (timer) timer.style.display = isTeacher ? "none" : "inline-flex";
}

function setComputeTeacherHeaderMode(enabled) {
  const startBtn = document.getElementById("btn-activity-head-start");
  const saveBtn = document.getElementById("btn-activity-head-save");
  const exitBtn = document.getElementById("btn-activity-head-exit");
  const timer = document.getElementById("block-runner-timer");
  if (!enabled) {
    setBlockRunnerHeaderByRole();
    return;
  }
  if (startBtn) startBtn.style.display = "none";
  if (saveBtn) saveBtn.style.display = "none";
  if (exitBtn) exitBtn.style.display = "none";
  if (timer) timer.style.display = "none";
}

function setBlockRunnerStartButton(running) {
  const btn = document.getElementById("btn-activity-head-start");
  if (!btn) return;
  btn.innerText = running ? "Duraklat" : "Başlat";
  btn.classList.toggle("paused", running);
  const pauseTitle = document.getElementById("activity-pause-title");
  const pauseBtn = document.getElementById("btn-activity-resume");
  if (pauseTitle) pauseTitle.innerText = running ? "Çalışıyor" : "Hazır";
  if (pauseBtn) {
    pauseBtn.innerHTML = "▶";
    pauseBtn.classList.add("btn-play-resume");
    pauseBtn.title = "Devam Et";
    pauseBtn.setAttribute("aria-label", "Devam Et");
  }
}

function pauseBlockRunnerTimer() {
  if (!blockRunnerSession || !blockRunnerSession.running) return;
  blockRunnerSession.savedElapsedSeconds = getBlockRunnerElapsedSeconds();
  blockRunnerSession.startAt = null;
  blockRunnerSession.running = false;
  blockRunnerSession.wasPausedByDialog = true;
  if (blockRunnerTimerInterval) clearInterval(blockRunnerTimerInterval);
  blockRunnerTimerInterval = null;
  setBlockRunnerStartButton(false);
  setActivityPausedUI(true);
  updateBlockRunnerTimerUI();
}

function resumeBlockRunnerTimer() {
  if (!blockRunnerSession || blockRunnerSession.running) return;
  blockRunnerSession.startAt = Date.now();
  blockRunnerSession.running = true;
  blockRunnerSession.wasPausedByDialog = false;
  setBlockRunnerStartButton(true);
  setActivityPausedUI(false);
  if (blockRunnerTimerInterval) clearInterval(blockRunnerTimerInterval);
  blockRunnerTimerInterval = setInterval(() => {
    if (!blockRunnerSession?.running) return;
    updateBlockRunnerTimerUI();
  }, 1000);
}

function getComputeRunnerElapsedSeconds() {
  if (!computeRunnerSession) return 0;
  const base = computeRunnerSession.savedElapsedSeconds || 0;
  if (!computeRunnerSession.running || !computeRunnerSession.startAt) return base;
  return base + Math.max(0, Math.round((Date.now() - computeRunnerSession.startAt) / 1000));
}

function updateComputeRunnerTimerUI() {
  const sec = getComputeRunnerElapsedSeconds();
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  const el = document.getElementById("block-runner-timer");
  if (el) el.innerText = `⏱️ ${mins} dk ${secs} sn`;
}

function pauseComputeRunnerTimer() {
  if (!computeRunnerSession || !computeRunnerSession.running) return;
  computeRunnerSession.savedElapsedSeconds = getComputeRunnerElapsedSeconds();
  computeRunnerSession.startAt = null;
  computeRunnerSession.running = false;
  computeRunnerSession.wasPausedByDialog = true;
  if (computeRunnerTimerInterval) clearInterval(computeRunnerTimerInterval);
  computeRunnerTimerInterval = null;
  setBlockRunnerStartButton(false);
  setActivityPausedUI(true);
  updateComputeRunnerTimerUI();
}

function resumeComputeRunnerTimer() {
  if (!computeRunnerSession || computeRunnerSession.running) return;
  computeRunnerSession.startAt = Date.now();
  computeRunnerSession.running = true;
  computeRunnerSession.wasPausedByDialog = false;
  setBlockRunnerStartButton(true);
  setActivityPausedUI(false);
  if (computeRunnerTimerInterval) clearInterval(computeRunnerTimerInterval);
  computeRunnerTimerInterval = setInterval(() => {
    if (!computeRunnerSession?.running) return;
    updateComputeRunnerTimerUI();
  }, 1000);
}

async function getComputeRunnerCurrentState(uid) {
  try {
    const snap = await getDoc(doc(db, "computeStates", String(uid)));
    if (!snap.exists()) return { levels: [], currentLevelIndex: 0 };
    const payload = snap.data()?.payload || {};
    return {
      levels: Array.isArray(payload.levels) ? payload.levels : [],
      currentLevelIndex: Number(payload.currentLevelIndex || 0)
    };
  } catch (e) {
    return { levels: [], currentLevelIndex: 0 };
  }
}

async function saveComputeRunnerSession({
  closeAfter = false,
  askContinue = false,
  levelsOverride = null,
  currentLevelIndexOverride = null,
  forceComplete = false
} = {}) {
  if (!computeRunnerSession || userRole === "teacher") {
    if (closeAfter) closeBlockRunnerView();
    return true;
  }
  const uid = computeRunnerSession.userId || currentUserId;
  if (!uid) return false;
  const elapsed = getComputeRunnerElapsedSeconds();
  const hasOverrideLevels = Array.isArray(levelsOverride);
  const state = hasOverrideLevels
    ? {
        levels: levelsOverride,
        currentLevelIndex: Number.isFinite(Number(currentLevelIndexOverride))
          ? Number(currentLevelIndexOverride)
          : Number(computeRunnerSession?.currentLevelIndex || 0)
      }
    : await getComputeRunnerCurrentState(uid);
  const levels = Array.isArray(state.levels) ? state.levels : [];

  if (!activeComputeAssignmentId) {
    if (closeAfter) closeBlockRunnerView();
    return true;
  }
  const assignmentSnap = await getDoc(doc(db, "computeAssignments", activeComputeAssignmentId));
  if (!assignmentSnap.exists()) {
    if (closeAfter) closeBlockRunnerView();
    return true;
  }
  const assignment = assignmentSnap.data() || {};
  const levelStart = Math.max(1, Number(assignment.levelStart || 1));
  const levelEnd = Math.max(levelStart, Number(assignment.levelEnd || levelStart));
  const rangeLevels = levels.slice(levelStart - 1, levelEnd);
  const totalLevels = rangeLevels.length;
  const completedIds = rangeLevels.filter((l) => !!l?.completed).map((l) => Number(l?.id)).filter((v) => Number.isFinite(v));
  const completedLevels = completedIds.length;
  const percent = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
  const completed = forceComplete || (totalLevels > 0 && completedLevels >= totalLevels);

  const progressRef = doc(db, "computeAssignmentProgress", `${activeComputeAssignmentId}_${uid}`);
  const prevSnap = await getDoc(progressRef);
  const prev = prevSnap.exists() ? prevSnap.data() : {};
  const prevPercent = Math.max(0, Number(prev.percent || 0));
  const prevTotalLevels = Math.max(0, Number(prev.totalLevels || 0));
  const prevCompletedLevels = Math.max(0, Number(prev.completedLevels || 0));
  const wasCompleted = !!prev.completed;
  const prevIds = Array.isArray(prev.completedLevelIds) ? prev.completedLevelIds : [];
  const mergedSeed = Array.from(new Set([...prevIds, ...completedIds]));
  if (forceComplete) {
    rangeLevels.forEach((lv, idx) => {
      const lid = Number(lv?.id);
      if (Number.isFinite(lid)) {
        mergedSeed.push(lid);
      } else {
        mergedSeed.push(levelStart + idx);
      }
    });
  }
  const mergedIds = Array.from(new Set(mergedSeed));
  const mergedCompleted = Math.min(Math.max(totalLevels, prevTotalLevels), mergedIds.length);
  const mergedPercent = totalLevels > 0 ? Math.round((mergedCompleted / totalLevels) * 100) : 0;
  const mergedDone = forceComplete || (totalLevels > 0 && mergedCompleted >= totalLevels);
  const effectiveTotalLevels = Math.max(totalLevels, prevTotalLevels);
  const effectiveCompletedLevelsRaw = Math.max(completedLevels, mergedIds.length, prevCompletedLevels);
  const effectiveCompletedLevels = effectiveTotalLevels > 0
    ? Math.min(effectiveTotalLevels, effectiveCompletedLevelsRaw)
    : effectiveCompletedLevelsRaw;
  const computedPercent = effectiveTotalLevels > 0
    ? Math.round((effectiveCompletedLevels / effectiveTotalLevels) * 100)
    : Math.max(percent, mergedPercent);
  const effectivePercent = forceComplete ? 100 : Math.max(prevPercent, computedPercent);
  const effectiveCompleted = wasCompleted
    || forceComplete
    || completed
    || mergedDone
    || effectivePercent >= 100
    || (effectiveTotalLevels > 0 && effectiveCompletedLevels >= effectiveTotalLevels);
  const totalXP = rangeLevels.reduce((sum, lv) => {
    const lid = Number(lv?.id);
    const includeLevel = forceComplete || (Number.isFinite(lid) && mergedIds.includes(lid));
    if (!includeLevel) return sum;
    return sum + clampAppLevelXP(lv?.xp ?? MAX_APP_LEVEL_XP);
  }, 0);
  const prevAwardedXP = Math.max(0, Number(prev.awardedXP || 0));

  await setDoc(progressRef, {
    assignmentId: activeComputeAssignmentId,
    assignmentTitle: String(assignment.title || "Compute It Ödevi"),
    levelStart,
    levelEnd,
    userId: uid,
    percent: effectivePercent,
    completed: effectiveCompleted,
    completedLevelIds: mergedIds,
    totalXP: Math.max(Number(prev.totalXP || 0), totalXP),
    awardedXP: prevAwardedXP,
    completedLevels: Math.max(prevCompletedLevels, effectiveCompletedLevels),
    totalLevels: Math.max(effectiveTotalLevels, Math.max(prevCompletedLevels, effectiveCompletedLevels)),
    currentLevelIndex: Math.max(0, Number(state.currentLevelIndex || 0)),
    lastSessionSeconds: elapsed,
    lastSessionMinutes: Math.floor(elapsed / 60),
    updatedAt: serverTimestamp()
  }, { merge: true });

  const xpDelta = effectiveCompleted ? Math.max(0, totalXP - prevAwardedXP) : 0;
  if (xpDelta > 0 && userRole === "student") {
    try {
      await updateDoc(doc(db, "users", uid), { xp: increment(xpDelta), updatedAt: serverTimestamp() });
    } catch (e) {
      await setDoc(doc(db, "users", uid), { xp: increment(xpDelta), updatedAt: serverTimestamp() }, { merge: true });
    }
    await setDoc(progressRef, { awardedXP: prevAwardedXP + xpDelta, updatedAt: serverTimestamp() }, { merge: true });
    if (uid === currentUserId && userData) userData.xp = Math.max(0, Number(userData.xp || 0)) + xpDelta;
    if (uid === currentUserId) updateUserXPDisplay();
  }

  if (!wasCompleted && effectiveCompleted) {
    await updateDoc(doc(db, "computeAssignments", activeComputeAssignmentId), {
      completedCount: increment(1),
      updatedAt: serverTimestamp()
    });
  }

  const progressPercentForUi = effectiveCompleted ? Math.max(100, effectivePercent) : effectivePercent;
  const uiCompletedLevels = Math.max(prevCompletedLevels, effectiveCompletedLevels);
  const uiTotalLevels = Math.max(1, effectiveTotalLevels, uiCompletedLevels);
  if (askContinue) {
    const ok = await infoDialog(
      `%${progressPercentForUi} seviyesine ulaştın. Süre: ${Math.floor(elapsed / 60)} dk. Tamamlanan seviye: ${uiCompletedLevels}/${uiTotalLevels}. Devam etmek ister misin?`,
      { showContinue: true, okText: "Çık", continueText: "Devam Et" }
    );
    if (!ok) {
      resumeComputeRunnerTimer();
      return false;
    }
  } else {
    showNotice(`Verileriniz kaydedildi. Compute It ilerleme: %${progressPercentForUi}.`, "#2ecc71");
  }

  if (closeAfter) closeBlockRunnerView();
  return true;
}

function matchesDateFilterBase(item, filterType) {
  if (filterType === "all" || !filterType) return true;
  const now = new Date();
  const deadlineDate = item?.deadline ? new Date(`${item.deadline}T${item.deadlineTime || "23:59"}`) : null;
  const createdDate = item?.createdAtDate || new Date(0);
  if (filterType === "active") return !deadlineDate || deadlineDate > now;
  if (filterType === "expired") return !!deadlineDate && deadlineDate < now;
  if (filterType === "this-week") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return createdDate >= weekAgo;
  }
  if (filterType === "this-month") {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return createdDate >= monthAgo;
  }
  return true;
}

function matchesBlockHomeworkFilter(item) {
  const isArchived = !!item?.isDeleted;
  if (currentBlockHomeworkFilter === "archived") return isArchived;
  if (isArchived) return false;
  return matchesDateFilterBase(item, currentBlockHomeworkFilter);
}

function matchesTeacherBlockAssignType(item) {
  const type = getBlockHomeworkType(item?.assignmentType);
  const activeType = getBlockHomeworkType(currentBlockAssignType || "block2d");
  if (activeType === "block3d") return type === "block3d";
  return type === "block2d";
}

function matchesComputeHomeworkFilter(item) {
  const isArchived = !!item?.isDeleted;
  if (currentComputeHomeworkFilter === "archived") return isArchived;
  if (isArchived) return false;
  return matchesDateFilterBase(item, currentComputeHomeworkFilter);
}

async function getBlockRunnerCurrentState(uid) {
  try {
    const snap = await getDoc(doc(db, "gameStates", String(uid)));
    if (!snap.exists()) return { levels: [], currentLevelIndex: 0 };
    const payload = snap.data()?.payload || {};
    return {
      levels: Array.isArray(payload.levels) ? payload.levels : [],
      currentLevelIndex: Number(payload.currentLevelIndex || 0)
    };
  } catch (e) {
    return { levels: [], currentLevelIndex: 0 };
  }
}

async function saveBlockRunnerSession({ closeAfter = false, askContinue = false } = {}) {
  if (!blockRunnerSession) return false;
  const uid = blockRunnerSession.userId || currentUserId;
  if (!uid) return false;
  const elapsed = getBlockRunnerElapsedSeconds();
  const state = await getBlockRunnerCurrentState(uid);
  const deltaSeconds = Math.max(0, elapsed - (blockRunnerSession.lastCommittedSeconds || 0));
  let levelsForProgress = Array.isArray(state.levels) ? state.levels : [];
  let completedLevels = 0;
  let totalLevels = 0;
  let progressPercent = 0;
  if (blockRunnerSession?.rangeStart && blockRunnerSession?.rangeEnd) {
    const startIdx = Math.max(0, Number(blockRunnerSession.rangeStart) - 1);
    const endIdx = Math.max(startIdx, Number(blockRunnerSession.rangeEnd) - 1);
    levelsForProgress = levelsForProgress.slice(startIdx, endIdx + 1);
    totalLevels = levelsForProgress.length;
    const completedIds = new Set(
      (Array.isArray(blockRunnerSession.completedLevelIds) ? blockRunnerSession.completedLevelIds : [])
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v))
    );
    completedLevels = levelsForProgress.filter((l) => completedIds.has(Number(l?.id))).length;
    progressPercent = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
  } else {
    completedLevels = levelsForProgress.filter((l) => l?.completed).length;
    totalLevels = levelsForProgress.length;
    progressPercent = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
  }

  const elapsedMinutes = Math.floor(elapsed / 60);

  const rptRef = doc(db, "studentReports", String(uid));
  await setDoc(rptRef, {
    completedLevels,
    totalLevels,
    progressPercent,
    currentLevelIndex: Math.max(0, state.currentLevelIndex || 0),
    lastSessionSeconds: elapsed,
    lastSessionMinutes: Math.floor(elapsed / 60),
    updatedAt: serverTimestamp()
  }, { merge: true });

  if (deltaSeconds > 0) {
    await setDoc(rptRef, { totalDurationMs: increment(deltaSeconds * 1000) }, { merge: true });
    blockRunnerSession.lastCommittedSeconds = elapsed;
  }

  if (activeBlockAssignmentId && userRole === "student") {
    try {
      const progressId = `${activeBlockAssignmentId}_${uid}`;
      const progressRef = doc(db, "blockAssignmentProgress", progressId);
      const progressSnap = await getDoc(progressRef);
      const prev = progressSnap.exists() ? progressSnap.data() : {};
      const prevPercent = Number(prev.percent || 0);
      const prevCompletedIds = Array.isArray(prev.completedLevelIds)
        ? prev.completedLevelIds.map((v) => Number(v)).filter((v) => Number.isFinite(v))
        : [];
      const mergedCompletedIds = Array.from(new Set([
        ...prevCompletedIds,
        ...((Array.isArray(blockRunnerSession.completedLevelIds) ? blockRunnerSession.completedLevelIds : [])
          .map((v) => Number(v))
          .filter((v) => Number.isFinite(v)))
      ]));
      const nextCompletedLevels = totalLevels > 0
        ? levelsForProgress.filter((l) => mergedCompletedIds.includes(Number(l?.id))).length
        : 0;
      const nextPercent = totalLevels > 0 ? Math.round((nextCompletedLevels / totalLevels) * 100) : Math.max(prevPercent, progressPercent);
      const completedNow = totalLevels > 0 && nextCompletedLevels >= totalLevels;
      const wasCompleted = !!prev.completed;
      const assignmentXPNow = (totalLevels > 0 ? levelsForProgress : [])
        .reduce((sum, l) => {
          const lid = Number(l?.id);
          if (!Number.isFinite(lid) || !mergedCompletedIds.includes(lid)) return sum;
          return sum + resolveBlockLevelXP(l, lid, levelsForProgress.length, l?.name || "");
        }, 0);
      await setDoc(progressRef, {
        assignmentId: activeBlockAssignmentId,
        assignmentTitle: String(blockRunnerSession?.assignmentTitle || "Blok Kodlama Ödevi"),
        levelStart: Number(blockRunnerSession?.rangeStart || 1),
        levelEnd: Number(blockRunnerSession?.rangeEnd || Math.max(1, Number(blockRunnerSession?.rangeStart || 1))),
        userId: uid,
        percent: nextPercent,
        completed: completedNow,
        completedLevelIds: mergedCompletedIds,
        totalXP: Math.max(Number(prev.totalXP || 0), assignmentXPNow),
        lastSessionSeconds: elapsed,
        lastSessionMinutes: elapsedMinutes,
        completedLevels: nextCompletedLevels,
        totalLevels,
        currentLevelIndex: Math.max(0, state.currentLevelIndex || 0),
        updatedAt: serverTimestamp()
      }, { merge: true });
      if (!wasCompleted && completedNow) {
        await updateDoc(doc(db, "blockAssignments", activeBlockAssignmentId), {
          completedCount: increment(1),
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.warn("blockAssignmentProgress save error", e);
    }
  }

  if (askContinue) {
    const ok = await infoDialog(
      `%${progressPercent} seviyesine ulaştın. Süre: ${elapsedMinutes} dk. Tamamlanan seviye: ${completedLevels}/${totalLevels}. Devam etmek ister misin?`,
      { showContinue: true, okText: "Çık", continueText: "Devam Et" }
    );
    if (!ok) {
      resumeBlockRunnerTimer();
      return false;
    }
  } else {
    showNotice(`Verileriniz kaydedildi. Blok kodlama ilerleme: %${progressPercent}.`, "#2ecc71");
  }

  if (closeAfter) {
    closeBlockRunnerView();
  }
  return true;
}

async function saveBlock3DRunnerSession({ closeAfter = false, askContinue = false } = {}) {
  if (!block3DRunnerSession || userRole !== "student") {
    if (closeAfter) closeBlockRunnerView();
    return true;
  }
  const uid = block3DRunnerSession.userId || currentUserId || "guest";
  const payload = {
    ...(block3DRunnerSession.latestData || {}),
    source: "block-3d",
    assignmentId: String(block3DRunnerSession.assignmentId || activeBlockAssignmentId || ""),
    assignmentTitle: String(block3DRunnerSession.assignmentTitle || "3D Blok Kodlama Ödevi"),
    levelStart: Number(block3DRunnerSession.levelStart || 1),
    levelEnd: Number(block3DRunnerSession.levelEnd || block3DRunnerSession.levelStart || 1)
  };
  if (!payload.assignmentId) {
    if (closeAfter) closeBlockRunnerView();
    return true;
  }

  await saveBlock3DAssignmentProgressFromEvent(payload);

  let percent = 0;
  let elapsed = Math.max(0, Number(payload.elapsedSeconds || 0));
  let completedLevels = 0;
  let totalLevels = Math.max(1, Number(payload.levelEnd || 1) - Number(payload.levelStart || 1) + 1);
  try {
    const pRef = doc(db, "blockAssignmentProgress", `${payload.assignmentId}_${uid}`);
    const pSnap = await getDoc(pRef);
    if (pSnap.exists()) {
      const p = pSnap.data() || {};
      percent = Math.max(0, Number(p.percent || 0));
      elapsed = Math.max(0, Number(p.lastSessionSeconds || elapsed));
      completedLevels = Math.max(0, Number(p.completedLevels || 0));
      totalLevels = Math.max(1, Number(p.totalLevels || totalLevels));
    }
  } catch (e) {}

  if (askContinue) {
    const ok = await infoDialog(
      `%${percent} seviyesine ulaştın. Süre: ${Math.floor(elapsed / 60)} dk. Tamamlanan seviye: ${completedLevels}/${totalLevels}. Devam etmek ister misin?`,
      { showContinue: true, okText: "Çık", continueText: "Devam Et" }
    );
    if (!ok) return false;
  } else {
    showNotice(`3D ödev verileri kaydedildi. İlerleme: %${percent}.`, "#2ecc71");
  }

  if (closeAfter) closeBlockRunnerView();
  return true;
}

function closeBlockRunnerView() {
  const modal = document.getElementById("activity-modal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("block-runner-mode");
    modal.classList.remove("block-3d-mode");
    modal.classList.remove("teacher-block-runner");
    modal.classList.remove("fullscreen");
  }
  const iframe = document.getElementById("activity-iframe");
  if (iframe) iframe.src = "about:blank";
  const closeBtn = document.getElementById("btn-close-activity");
  if (closeBtn) closeBtn.innerText = "Kapat";
  const topTitle = document.querySelector("#activity-modal .modal-header h2");
  if (topTitle) topTitle.innerText = "Etkinlik";
  const fullBar = document.getElementById("activity-fullbar");
  if (fullBar) fullBar.style.display = "none";
  const fullStartBtn = document.getElementById("btn-activity-full-start");
  const fullSaveBtn = document.getElementById("btn-activity-full-save");
  const fullExitBtn = document.getElementById("btn-activity-full-exit");
  if (fullStartBtn) fullStartBtn.style.display = "";
  if (fullSaveBtn) fullSaveBtn.style.display = "";
  if (fullExitBtn) {
    fullExitBtn.innerText = "Tam Ekrandan Çık";
    fullExitBtn.title = "";
    fullExitBtn.classList.remove("line-trace-close-btn");
  }
  if (blockRunnerTimerInterval) clearInterval(blockRunnerTimerInterval);
  blockRunnerTimerInterval = null;
  if (computeRunnerTimerInterval) clearInterval(computeRunnerTimerInterval);
  computeRunnerTimerInterval = null;
  blockRunnerSession = null;
  block3DRunnerSession = null;
  computeRunnerSession = null;
  currentRunnerType = null;
  syncRunnerSaveButtons();
  activeBlockRunnerUserId = null;
  activeComputeRunnerUserId = null;
  activeComputeAssignmentId = null;
  activeBlockAssignmentId = null;
  setBlockRunnerStartButton(false);
  setActivityPausedUI(false);
  const timerLabel = document.getElementById("block-runner-timer");
  if (timerLabel) timerLabel.innerText = "⏱️ 0 dk 0 sn";
}

function taskMatchesStudent(task) {
  const ownerTeacherId = userData?.ownerTeacherId || userData?.createdBy || "";
  if (ownerTeacherId && task?.userId && String(task.userId) !== String(ownerTeacherId)) return false;
  // If a task has no explicit targetClass it was created as a "global" task.
  // Do not show global tasks to students who have no class assigned (newly created students).
  if (!task.targetClass) {
    if (!userData) return false;
    const studentClass = userData.className || "";
    return Boolean(studentClass);
  }
  if (!userData) return false;
  const studentClass = userData.className || "";
  const studentSection = userData.section || "";
  if (!studentClass) return false;
  if (task.targetSection) {
    return task.targetClass === studentClass && task.targetSection === studentSection;
  }
  return task.targetClass === studentClass;
}

/* ================= EMAIL DÜZELTME ================= */
function fixEmail(e) {
  if (!e) return "";
  if (e.includes("@")) return e.trim().toLowerCase();
  return e.trim().toLowerCase() + "@okul.com";
}

function normalizeUserRole(rawRole) {
  const role = String(rawRole || "").trim().toLowerCase();
  if (!role) return "student";
  if (role === "teacher" || role === "ogretmen" || role === "öğretmen" || role === "admin" || role === "administrator") {
    return "teacher";
  }
  if (role === "student" || role === "ogrenci" || role === "öğrenci") {
    return "student";
  }
  return role;
}

const FORCED_TEACHER_ALIASES = new Set(["dogu", "dogu2"]);

function isForcedTeacherAlias(authUser, profile = null) {
  const email = String(authUser?.email || "").trim().toLowerCase();
  const emailAlias = email.includes("@") ? email.split("@")[0] : email;
  const usernameAlias = String(profile?.username || "").trim().toLowerCase();
  return FORCED_TEACHER_ALIASES.has(emailAlias) || FORCED_TEACHER_ALIASES.has(usernameAlias);
}

async function resolveExistingUserProfileByAuth(authUser) {
  try {
    const email = String(authUser?.email || "").trim().toLowerCase();
    const usernameGuess = email.includes("@") ? email.split("@")[0] : email;
    const candidates = [email, usernameGuess].filter(Boolean);
    for (const candidate of candidates) {
      const [usernameSnap, emailSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), where("username", "==", candidate), limit(1))),
        getDocs(query(collection(db, "users"), where("email", "==", candidate), limit(1)))
      ]);
      if (!usernameSnap.empty) {
        const d = usernameSnap.docs[0];
        return { id: d.id, data: d.data() || {} };
      }
      if (!emailSnap.empty) {
        const d = emailSnap.docs[0];
        return { id: d.id, data: d.data() || {} };
      }
    }
  } catch (e) {
    console.warn("Kullanıcı profil fallback sorgusu başarısız:", e);
  }
  return null;
}

async function shouldPromoteToTeacherByAlias(authUser, currentRole) {
  if (normalizeUserRole(currentRole) === "teacher") return true;
  try {
    const email = String(authUser?.email || "").trim().toLowerCase();
    const usernameGuess = email.includes("@") ? email.split("@")[0] : email;
    const candidates = [email, usernameGuess].filter(Boolean);
    for (const candidate of candidates) {
      const snap = await getDocs(query(collection(db, "users"), where("username", "==", candidate)));
      if (snap.empty) continue;
      let hasTeacher = false;
      snap.forEach((d) => {
        const data = d.data() || {};
        if (normalizeUserRole(data.role) === "teacher") hasTeacher = true;
      });
      if (hasTeacher) return true;
    }
  } catch (e) {
    console.warn("teacher alias kontrolü başarısız:", e);
  }
  return false;
}

async function resolveLoginEmails(identifier) {
  const raw = String(identifier || "").trim().toLowerCase();
  if (!raw) return [];
  const out = [];
  const pushUnique = (v) => {
    const email = String(v || "").trim().toLowerCase();
    if (!email) return;
    if (!out.includes(email)) out.push(email);
  };
  const candidates = raw.includes("@")
    ? [raw]
    : [raw, `${raw}@okul.com`, `${raw}@gmail.com`];
  try {
    for (const candidate of candidates) {
      const [byUsername, byEmail] = await Promise.all([
        getDocs(query(collection(db, "users"), where("username", "==", candidate))),
        getDocs(query(collection(db, "users"), where("email", "==", candidate)))
      ]);
      const rows = [
        ...byUsername.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })),
        ...byEmail.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }))
      ];
      rows.sort((a, b) => {
        const ar = normalizeUserRole(a.role) === "teacher" ? 1 : 0;
        const br = normalizeUserRole(b.role) === "teacher" ? 1 : 0;
        return br - ar;
      });
      rows.forEach((data) => {
        pushUnique(data.email || fixEmail(String(data.username || "")));
      });
    }
  } catch (e) {
    console.warn("resolveLoginEmails", e);
  }
  return out;
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function generateTempPassword(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function getCallableErrorMessage(err) {
  const code = String(err?.code || "").toLowerCase();
  const message = String(err?.message || err?.details || "Bilinmeyen hata");
  if (code.includes("permission-denied")) return "Yetki hatası. Fonksiyon erişimi engellendi.";
  if (code.includes("unauthenticated")) return "Oturum doğrulanamadı. Lütfen tekrar giriş yapın.";
  if (code.includes("not-found")) return "Bulut fonksiyonu bulunamadı. Functions deploy gerekli olabilir.";
  if (code.includes("unavailable")) return "Şu anda sunucuya ulaşılamıyor.";
  return message;
}

async function setUserPasswordBySecondaryAuthFallback(student, newPassword, currentPasswordHints = []) {
  const username = String(student?.username || "").trim();
  const resolved = await resolveLoginEmails(username);
  const emailCandidates = [
    String(student?.email || "").trim().toLowerCase(),
    ...resolved,
    username ? `${username}@okul.com` : "",
    username ? `${username}@gmail.com` : ""
  ].filter(Boolean);
  const passHints = Array.from(new Set([
    ...((Array.isArray(currentPasswordHints) ? currentPasswordHints : []).map((v) => String(v || "").trim())),
    String(student?.loginCardPassword || "").trim(),
    "123456"
  ].filter(Boolean)));
  if (!emailCandidates.length || !passHints.length) {
    throw new Error("Öğrenci e-postası veya mevcut şifre bilgisi bulunamadı.");
  }
  let lastErr = null;
  for (const email of emailCandidates) {
    for (const currentPass of passHints) {
      try {
        const cred = await signInWithEmailAndPassword(secondaryAuth, email, currentPass);
        if (!cred?.user) throw new Error("İkincil oturum açılamadı.");
        await updatePassword(cred.user, newPassword);
        try { await signOut(secondaryAuth); } catch {}
        return true;
      } catch (e) {
        lastErr = e;
        try { await signOut(secondaryAuth); } catch {}
      }
    }
  }
  const detail = getCallableErrorMessage(lastErr);
  throw new Error(`Yedek şifre güncelleme başarısız: ${detail}`);
}

async function deleteUserBySecondaryAuthFallback(student, currentPasswordHints = []) {
  const username = String(student?.username || "").trim();
  const resolved = await resolveLoginEmails(username);
  const emailCandidates = [
    String(student?.email || "").trim().toLowerCase(),
    ...resolved,
    username ? `${username}@okul.com` : "",
    username ? `${username}@gmail.com` : ""
  ].filter(Boolean);
  const passHints = Array.from(new Set([
    ...((Array.isArray(currentPasswordHints) ? currentPasswordHints : []).map((v) => String(v || "").trim())),
    String(student?.loginCardPassword || "").trim(),
    "123456"
  ].filter(Boolean)));
  if (!emailCandidates.length || !passHints.length) {
    throw new Error("Öğrenci e-postası veya mevcut şifre bilgisi bulunamadı.");
  }
  let lastErr = null;
  for (const email of emailCandidates) {
    for (const currentPass of passHints) {
      try {
        const cred = await signInWithEmailAndPassword(secondaryAuth, email, currentPass);
        if (!cred?.user) throw new Error("İkincil oturum açılamadı.");
        await deleteAuthUser(cred.user);
        try { await signOut(secondaryAuth); } catch {}
        return true;
      } catch (e) {
        lastErr = e;
        try { await signOut(secondaryAuth); } catch {}
      }
    }
  }
  const detail = getCallableErrorMessage(lastErr);
  throw new Error(`Yedek kullanıcı silme başarısız: ${detail}`);
}

async function deleteStudentAccountWithFallback(student, options = {}) {
  const hintList = Array.isArray(options.currentPasswordHints) ? options.currentPasswordHints : [];
  const shouldSkipCallable = isLocalDevHost === true;
  if (!shouldSkipCallable) {
    try {
      await deleteUserByAdmin({ uid: student.id });
      return { authDeleted: true, usedFallback: false };
    } catch (authDeleteErr) {
      try {
        await deleteUserBySecondaryAuthFallback(student, hintList);
        console.warn("deleteUserByAdmin fallback kullanıldı:", authDeleteErr);
        return { authDeleted: true, usedFallback: true };
      } catch (fallbackErr) {
        const fnMsg = getCallableErrorMessage(authDeleteErr);
        const fbMsg = getCallableErrorMessage(fallbackErr);
        return { authDeleted: false, usedFallback: true, warning: `${fnMsg} | ${fbMsg}` };
      }
    }
  }
  try {
    await deleteUserBySecondaryAuthFallback(student, hintList);
    return { authDeleted: true, usedFallback: true };
  } catch (fallbackErr) {
    return { authDeleted: false, usedFallback: true, warning: getCallableErrorMessage(fallbackErr) };
  }
}

async function applyStudentPasswordUpdate(student, newPassword, options = {}) {
  const nextPass = String(newPassword || "").trim();
  if (!nextPass || nextPass.length < 6) {
    throw new Error("Şifre en az 6 karakter olmalı.");
  }
  const guessedEmail = String(student?.email || "").trim() || fixEmail(String(student?.username || "").trim());
  if (guessedEmail && !String(student?.email || "").trim()) {
    try {
      await updateDoc(doc(db, "users", student.id), { email: guessedEmail });
      student.email = guessedEmail;
    } catch {}
  }
  const hintList = Array.isArray(options.currentPasswordHints) ? options.currentPasswordHints : [];
  const shouldSkipCallable = isLocalDevHost === true;
  if (!shouldSkipCallable) {
    try {
      await setUserPasswordByAdmin({ uid: student.id, newPassword: nextPass });
    } catch (pwErr) {
      // Cloud Function çalışmıyorsa/erişilemiyorsa fallback ile güncelle.
      await setUserPasswordBySecondaryAuthFallback(student, nextPass, hintList);
      console.warn("setUserPasswordByAdmin fallback kullanıldı:", pwErr);
    }
  } else {
    await setUserPasswordBySecondaryAuthFallback(student, nextPass, hintList);
  }
  const newHash = await hashPassword(nextPass);
  await updateDoc(doc(db, "users", student.id), {
    passwordHash: newHash,
    loginCardPassword: nextPass
  });
  student.loginCardPassword = nextPass;
  return nextPass;
}

/* ================= SEKME DEĞİŞTİRME ================= */
window.switchTab = function(tabName) {
  document.querySelectorAll('#student-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase().includes(tabName === 'pending' ? 'bekleyen' : 'tamamlanan')) {
      btn.classList.add('active');
    }
  });
  const pending = document.getElementById('tab-pending');
  const completed = document.getElementById('tab-completed');
  if (pending) pending.classList.toggle('active', tabName === 'pending');
  if (completed) completed.classList.toggle('active', tabName === 'completed');
};

// Open the compute-it runner inside the existing activity modal and sync saved state
window.openComputeItRunner = async function(userId, options = {}){
  const runnerRole = (userRole === "teacher") ? "teacher" : "student";
  activeComputeRunnerUserId = userId || currentUserId;
  activeComputeAssignmentId = options?.assignmentId || null;
  currentRunnerType = "compute";
  const modal = document.getElementById('activity-modal');
  const iframe = document.getElementById('activity-iframe');
  if(!modal || !iframe) return;

  if (blockRunnerTimerInterval) clearInterval(blockRunnerTimerInterval);
  blockRunnerTimerInterval = null;

  modal.classList.add("block-runner-mode");
  modal.classList.toggle("teacher-block-runner", userRole === "teacher");
  setComputeTeacherHeaderMode(userRole === "teacher");
  modal.classList.remove("fullscreen");
  modal.style.display = "flex";
  iframe.src = `/compute-it-runner/index.html?role=${runnerRole}&uid=${encodeURIComponent(activeComputeRunnerUserId || "")}`;
  document.getElementById('activity-title').innerText = options?.title || 'Compute It';
  document.getElementById('activity-link').innerText = '/compute-it-runner/index.html';
  const topTitle = document.querySelector("#activity-modal .modal-header h2");
  if (topTitle) topTitle.innerText = "Compute It";
  const closeBtn = document.getElementById("btn-close-activity");
  if (closeBtn) closeBtn.innerText = "×";
  setBlockRunnerStartButton(false);
  if (userRole === "teacher") {
    setActivityPausedUI(false);
    computeRunnerSession = null;
    if (computeRunnerTimerInterval) clearInterval(computeRunnerTimerInterval);
    computeRunnerTimerInterval = null;
  } else {
    computeRunnerSession = {
      userId: activeComputeRunnerUserId || currentUserId,
      running: false,
      startAt: null,
      savedElapsedSeconds: 0,
      wasPausedByDialog: false,
      hasTriggeredRun: false,
      completionHandled: false
    };
    setActivityPausedUI(true);
  }
  const fullBar = document.getElementById("activity-fullbar");
  if (fullBar) fullBar.style.display = "none";
  const timerEl = document.getElementById("block-runner-timer");
  if (timerEl) timerEl.innerText = "⏱️ 0 dk 0 sn";
  const sendComputeRunnerRoleState = () => {
    try {
      if (!iframe.contentWindow) return;
      if (userRole === "teacher") {
        iframe.contentWindow.postMessage({ type: "ENABLE_MENU" }, "*");
      } else {
        iframe.contentWindow.postMessage({ type: "DISABLE_MENU" }, "*");
      }
    } catch (e) {
      console.warn("compute role sync error", e);
    }
  };
  const sendComputeRunnerInitMessages = (payloadData) => {
    try {
      if (!iframe.contentWindow) return;
      if (Array.isArray(payloadData?.levels) && payloadData.levels.length > 0) {
        iframe.contentWindow.postMessage({
          type: 'LOAD_STATE',
          source: 'compute-it',
          levels: payloadData.levels,
          currentLevelIndex: Number(payloadData?.currentLevelIndex || 0)
        }, '*');
      }
      if (options?.levelStart || options?.levelEnd) {
        iframe.contentWindow.postMessage({
          type: "SET_LEVEL_RANGE",
          levelStart: Math.max(1, Number(options?.levelStart || 1)),
          levelEnd: Math.max(1, Number(options?.levelEnd || options?.levelStart || 1))
        }, "*");
        iframe.contentWindow.postMessage({
          type: "SET_ASSIGNMENT_PROGRESS",
          completedLevelIds: Array.isArray(options?.completedLevelIds) ? options.completedLevelIds : []
        }, "*");
      }
      sendComputeRunnerRoleState();
    } catch (e) { /* ignore */ }
  };
  iframe.addEventListener("load", () => {
    sendComputeRunnerInitMessages(null);
  }, { once: true });
  sendComputeRunnerRoleState();

  try{
    let payload = null;
    if (userRole === "teacher") {
      const lvlSnap = await getDoc(doc(db, "computeLevels", "default"));
      if (lvlSnap.exists()) payload = lvlSnap.data()?.payload || null;
    } else {
      const stSnap = await getDoc(doc(db, "computeStates", String(activeComputeRunnerUserId || "")));
      if (stSnap.exists()) payload = stSnap.data()?.payload || null;
      if (!Array.isArray(payload?.levels) || payload.levels.length === 0) {
        const lvlSnap = await getDoc(doc(db, "computeLevels", "default"));
        if (lvlSnap.exists()) payload = lvlSnap.data()?.payload || payload;
      }
    }
    [350, 700, 1200].forEach((delay) => {
      setTimeout(() => sendComputeRunnerInitMessages(payload), delay);
    });
  }catch(e){ console.warn('openComputeItRunner load error', e); }
};

window.openBlock3DRunner = function(options = {}) {
  activeBlockRunnerUserId = currentUserId || null;
  activeBlockAssignmentId = options?.assignmentId || null;
  currentRunnerType = "block3d";
  block3DRunnerSession = userRole === "student"
    ? {
        userId: currentUserId || null,
        assignmentId: options?.assignmentId || null,
        assignmentTitle: options?.title || "3D Blok Kodlama Ödevi",
        levelStart: Math.max(1, Number(options?.levelStart || 1)),
        levelEnd: Math.max(1, Number(options?.levelEnd || options?.levelStart || 1)),
        completionHandled: false,
        latestData: null
      }
    : null;
  const modal = document.getElementById("activity-modal");
  const iframe = document.getElementById("activity-iframe");
  if (!modal || !iframe) return;
  const sideMenu = document.getElementById("side-menu");
  if (sideMenu) sideMenu.style.width = "0";
  setSidebarSubmenuState("submenu-add", "btn-toggle-add-menu", false);
  setSidebarSubmenuState("submenu-tasks", "btn-toggle-tasks-menu", false);
  setSidebarSubmenuState("submenu-apps", "btn-toggle-apps-menu", false);
  setSidebarSubmenuState("submenu-student-data", "btn-toggle-student-data-menu", false);
  if (activityTimerInterval) clearInterval(activityTimerInterval);
  activityTimerInterval = null;
  activitySession = null;
  setActivityStartButtons(false);
  setActivityPausedUI(false);
  setComputeTeacherHeaderMode(false);
  setBlockRunnerHeaderByRole();
  modal.classList.remove("teacher-block-runner");
  modal.classList.remove("block-runner-mode");
  modal.classList.add("block-3d-mode");
  modal.classList.add("fullscreen");
  modal.style.display = "flex";
  const runnerRole = userRole === "teacher" ? "teacher" : "student";
  const params = new URLSearchParams();
  params.set("role", runnerRole);
  const rangeStart = Number(options?.levelStart || 0);
  const rangeEnd = Number(options?.levelEnd || 0);
  if (Number.isFinite(rangeStart) && rangeStart > 0) params.set("levelStart", String(Math.floor(rangeStart)));
  if (Number.isFinite(rangeEnd) && rangeEnd > 0) params.set("levelEnd", String(Math.floor(rangeEnd)));
  if (options?.assignmentId) params.set("assignmentId", String(options.assignmentId));
  if (options?.title) params.set("assignmentTitle", String(options.title));
  iframe.src = `/block-3d-runner/index.html?${params.toString()}`;
  const titleEl = document.getElementById("activity-title");
  const linkEl = document.getElementById("activity-link");
  if (titleEl) titleEl.innerText = options?.title || "3D Blok Kodlama";
  if (linkEl) linkEl.innerText = `/block-3d-runner/index.html?${params.toString()}`;
  const closeBtn = document.getElementById("btn-close-activity");
  if (closeBtn) closeBtn.innerText = "Çık";
  const topTitle = document.querySelector("#activity-modal .modal-header h2");
  if (topTitle) topTitle.innerText = "3D Blok Kodlama";
  const fullBar = document.getElementById("activity-fullbar");
  if (fullBar) fullBar.style.display = "none";
};

window.openLineTraceRunner = function(options = {}) {
  currentRunnerType = "line-trace";
  activeBlockRunnerUserId = null;
  activeComputeRunnerUserId = null;
  const modal = document.getElementById("activity-modal");
  const iframe = document.getElementById("activity-iframe");
  if (!modal || !iframe) return;
  const sideMenu = document.getElementById("side-menu");
  if (sideMenu) sideMenu.style.width = "0";
  setSidebarSubmenuState("submenu-add", "btn-toggle-add-menu", false);
  setSidebarSubmenuState("submenu-tasks", "btn-toggle-tasks-menu", false);
  setSidebarSubmenuState("submenu-apps", "btn-toggle-apps-menu", false);
  setSidebarSubmenuState("submenu-student-data", "btn-toggle-student-data-menu", false);
  if (activityTimerInterval) clearInterval(activityTimerInterval);
  activityTimerInterval = null;
  activitySession = null;
  setActivityStartButtons(false);
  setActivityPausedUI(false);
  setComputeTeacherHeaderMode(false);
  setBlockRunnerHeaderByRole();
  modal.classList.remove("teacher-block-runner");
  modal.classList.remove("block-runner-mode");
  modal.classList.remove("block-3d-mode");
  modal.classList.add("fullscreen");
  modal.style.display = "flex";
  iframe.src = "/line-trace-runner/index.html";
  const titleEl = document.getElementById("activity-title");
  const linkEl = document.getElementById("activity-link");
  if (titleEl) titleEl.innerText = options?.title || "Çizgi Oyunu";
  if (linkEl) linkEl.innerText = "/line-trace-runner/index.html";
  const closeBtn = document.getElementById("btn-close-activity");
  if (closeBtn) closeBtn.innerText = "Çık";
  const topTitle = document.querySelector("#activity-modal .modal-header h2");
  if (topTitle) topTitle.innerText = "Çizgi Oyunu";
  const fullBar = document.getElementById("activity-fullbar");
  const fullTitle = document.getElementById("activity-full-title");
  const fullStartBtn = document.getElementById("btn-activity-full-start");
  const fullSaveBtn = document.getElementById("btn-activity-full-save");
  const fullExitBtn = document.getElementById("btn-activity-full-exit");
  if (fullBar) fullBar.style.display = "flex";
  if (fullTitle) fullTitle.innerText = options?.title || "Çizgi Oyunu";
  if (fullStartBtn) fullStartBtn.style.display = "none";
  if (fullSaveBtn) fullSaveBtn.style.display = "none";
  if (fullExitBtn) {
    fullExitBtn.innerText = "✕";
    fullExitBtn.title = "Çık";
    fullExitBtn.classList.add("line-trace-close-btn");
  }
};

window.switchBlockHomeworkTab = function(tabName) {
  document.querySelectorAll('#block-homework-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase().includes(tabName === 'pending' ? 'bekleyen' : 'tamamlanan')) {
      btn.classList.add('active');
    }
  });
  const pending = document.getElementById('block-homework-pending');
  const completed = document.getElementById('block-homework-completed');
  if (pending) pending.classList.toggle('active', tabName === 'pending');
  if (completed) completed.classList.toggle('active', tabName === 'completed');
};

function setBlockAssignCreateButton(typeRaw) {
  const type = getBlockHomeworkType(typeRaw);
  currentBlockAssignType = type;
  const createBtn = document.getElementById("btn-create-block-homework");
  if (createBtn) {
    createBtn.innerText = "Ödev Ver";
  }
}

window.switchBlockAssignTab = function(typeName) {
  const type = getBlockHomeworkType(typeName);
  document.querySelectorAll("#block-homework-assign-tabs .tab-btn").forEach((btn) => {
    btn.classList.remove("active");
    const txt = (btn.textContent || "").toLowerCase();
    if ((type === "block3d" && txt.includes("3d")) || (type !== "block3d" && !txt.includes("3d"))) {
      btn.classList.add("active");
    }
  });
  setBlockAssignCreateButton(type);
  renderBlockHomeworkList();
};

window.switchComputeHomeworkTab = function(tabName) {
  document.querySelectorAll('#compute-homework-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase().includes(tabName === 'pending' ? 'bekleyen' : 'tamamlanan')) {
      btn.classList.add('active');
    }
  });
  const pending = document.getElementById('compute-homework-pending');
  const completed = document.getElementById('compute-homework-completed');
  if (pending) pending.classList.toggle('active', tabName === 'pending');
  if (completed) completed.classList.toggle('active', tabName === 'completed');
};

function getFlowchartEls() {
  return {
    modal: document.getElementById("flowchart-modal"),
    palette: document.getElementById("flowchart-palette"),
    canvas: document.getElementById("flowchart-canvas"),
    svg: document.getElementById("flowchart-svg"),
    output: document.getElementById("flowchart-output")
  };
}

function getFlowNodeTextByType(type) {
  const t = String(type || "").toLowerCase();
  if (t === "start") return "başla";
  if (t === "end") return "dur";
  if (t === "input") return "deger|Bir değer girin";
  if (t === "output") return "|Hello World!";
  if (t === "decision") return "x > 0";
  return "x = 1";
}

function getFlowNodeSize(type) {
  const t = String(type || "").toLowerCase();
  if (t === "decision") return { width: 130, height: 130 };
  return { width: 150, height: 52 };
}

function parseFlowInputText(text) {
  const parts = String(text || "").split("|");
  return {
    varName: (parts[0] || "deger").trim() || "deger",
    message: (parts[1] || "Bir değer girin").trim() || "Bir değer girin"
  };
}

function parseFlowOutputText(text) {
  const raw = String(text || "");
  if (!raw.includes("|")) {
    return { varName: "", message: raw.trim() };
  }
  const parts = raw.split("|");
  return {
    varName: (parts[0] || "").trim(),
    message: (parts[1] || parts[0] || "").trim()
  };
}

function parseFlowProcessText(text) {
  const src = String(text || "").trim();
  const m = src.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([+\-*/])\s*([a-zA-Z_][a-zA-Z0-9_]*)$/);
  if (m) {
    return { result: m[1], left: m[2], op: m[3], right: m[4] };
  }
  return { result: "sonuc", left: "a", op: "+", right: "b" };
}

function parseFlowDecisionText(text) {
  const src = String(text || "").trim();
  const m = src.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (m) return { left: m[1], op: m[2], right: m[3].trim() };
  return { left: "x", op: "==", right: "0" };
}

function isFlowIdentifier(value) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(value || "").trim());
}

function getFlowKnownVariables() {
  const vars = new Set();
  flowNodes.forEach((node) => {
    if (!node) return;
    if (node.type === "input") {
      const p = parseFlowInputText(node.text);
      if (isFlowIdentifier(p.varName)) vars.add(p.varName);
      return;
    }
    if (node.type === "process") {
      const p = parseFlowProcessText(node.text);
      [p.result, p.left, p.right].forEach((v) => {
        if (isFlowIdentifier(v)) vars.add(String(v).trim());
      });
      return;
    }
    if (node.type === "decision") {
      const d = parseFlowDecisionText(node.text);
      if (isFlowIdentifier(d.left)) vars.add(d.left);
      const rhs = String(d.right || "").trim();
      if (isFlowIdentifier(rhs)) vars.add(rhs);
      return;
    }
    if (node.type === "output") {
      const o = parseFlowOutputText(node.text);
      if (isFlowIdentifier(o.varName)) vars.add(o.varName);
    }
  });
  return Array.from(vars).sort((a, b) => a.localeCompare(b, "tr"));
}

function populateFlowOutputVarSelect(selectedVar = "") {
  const sel = document.getElementById("flow-edit-output-var");
  if (!sel) return;
  const known = getFlowKnownVariables();
  const selected = String(selectedVar || "").trim();
  if (selected && !known.includes(selected)) known.unshift(selected);
  sel.innerHTML = `<option value="">(Değişken seçilmedi)</option>${known.map((v) => `<option value="${v}">${v}</option>`).join("")}`;
  sel.value = selected;
}

function escapeFlowValue(raw) {
  const src = String(raw || "").trim();
  if (!src) return "0";
  return src;
}

function coerceFlowInputValue(raw) {
  const src = String(raw ?? "").trim();
  if (!src) return "";
  const normalized = src.replace(",", ".");
  if (/^-?\d+(\.\d+)?$/.test(normalized)) {
    const n = Number(normalized);
    if (Number.isFinite(n)) return n;
  }
  return src;
}

function toFlowNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const src = String(value ?? "").trim().replace(",", ".");
  if (!src) return NaN;
  const n = Number(src);
  return Number.isFinite(n) ? n : NaN;
}

function getFlowNodeDisplayText(node) {
  if (!node) return "";
  if (node.type === "start") return "başla";
  if (node.type === "end") return "dur";
  if (node.type === "input") {
    const p = parseFlowInputText(node.text);
    return `in: ${p.varName}\n${p.message}`;
  }
  if (node.type === "output") {
    const p = parseFlowOutputText(node.text);
    return p.varName ? `out: ${p.varName}\n${p.message}` : `out\n${p.message}`;
  }
  return String(node.text || "");
}

function showFlowNodeEditor(nodeId) {
  const node = getFlowNodeById(nodeId);
  const modal = document.getElementById("flow-node-editor-modal");
  if (!node || !modal) return;
  flowNodeEditTargetId = node.id;
  const title = document.getElementById("flow-node-editor-title");
  if (title) title.innerText = `Düğüm Düzenle: ${node.type}`;
  const ro = document.getElementById("flow-node-editor-readonly");
  const inBox = document.getElementById("flow-node-editor-input");
  const outBox = document.getElementById("flow-node-editor-output");
  const pBox = document.getElementById("flow-node-editor-process");
  const dBox = document.getElementById("flow-node-editor-decision");
  [inBox, outBox, pBox, dBox].forEach((el) => { if (el) el.style.display = "none"; });
  if (ro) ro.style.display = "none";

  if (node.type === "start" || node.type === "end") {
    if (ro) {
      ro.style.display = "block";
      ro.innerText = node.type === "start" ? 'Başla düğümü sabittir, değeri değiştirilemez.' : 'Dur düğümü sabittir, değeri değiştirilemez.';
    }
  } else if (node.type === "input") {
    if (inBox) inBox.style.display = "block";
    const info = parseFlowInputText(node.text);
    const varEl = document.getElementById("flow-edit-input-var");
    const msgEl = document.getElementById("flow-edit-input-msg");
    if (varEl) varEl.value = info.varName;
    if (msgEl) msgEl.value = info.message;
  } else if (node.type === "output") {
    if (outBox) outBox.style.display = "block";
    const out = parseFlowOutputText(node.text);
    populateFlowOutputVarSelect(out.varName);
    const msgEl = document.getElementById("flow-edit-output-msg");
    if (msgEl) msgEl.value = out.message;
  } else if (node.type === "process") {
    if (pBox) pBox.style.display = "block";
    const p = parseFlowProcessText(node.text);
    const resultEl = document.getElementById("flow-edit-proc-result");
    const leftEl = document.getElementById("flow-edit-proc-left");
    const opEl = document.getElementById("flow-edit-proc-op");
    const rightEl = document.getElementById("flow-edit-proc-right");
    if (resultEl) resultEl.value = p.result;
    if (leftEl) leftEl.value = p.left;
    if (opEl) opEl.value = p.op;
    if (rightEl) rightEl.value = p.right;
  } else if (node.type === "decision") {
    if (dBox) dBox.style.display = "block";
    const d = parseFlowDecisionText(node.text);
    const leftEl = document.getElementById("flow-edit-if-left");
    const opEl = document.getElementById("flow-edit-if-op");
    const rightEl = document.getElementById("flow-edit-if-right");
    if (leftEl) leftEl.value = d.left;
    if (opEl) opEl.value = d.op;
    if (rightEl) rightEl.value = d.right;
  }
  modal.style.display = "flex";
}

function closeFlowNodeEditor() {
  const modal = document.getElementById("flow-node-editor-modal");
  if (modal) modal.style.display = "none";
  flowNodeEditTargetId = null;
}

function saveFlowNodeEditor() {
  if (!flowNodeEditTargetId) return;
  const node = getFlowNodeById(flowNodeEditTargetId);
  if (!node) return;
  if (node.type === "start" || node.type === "end") {
    closeFlowNodeEditor();
    return;
  }
  if (node.type === "input") {
    const varName = String(document.getElementById("flow-edit-input-var")?.value || "").trim() || "deger";
    const msg = String(document.getElementById("flow-edit-input-msg")?.value || "").trim() || "Bir değer girin";
    node.text = `${varName}|${msg}`;
  } else if (node.type === "output") {
    const varName = String(document.getElementById("flow-edit-output-var")?.value || "").trim();
    const msg = String(document.getElementById("flow-edit-output-msg")?.value || "").trim();
    node.text = `${varName}|${msg || "Çıktı"}`;
  } else if (node.type === "process") {
    const resultVar = String(document.getElementById("flow-edit-proc-result")?.value || "").trim() || "sonuc";
    const leftVar = String(document.getElementById("flow-edit-proc-left")?.value || "").trim() || "a";
    const op = String(document.getElementById("flow-edit-proc-op")?.value || "+").trim() || "+";
    const rightVar = String(document.getElementById("flow-edit-proc-right")?.value || "").trim() || "b";
    node.text = `${resultVar} = ${leftVar} ${op} ${rightVar}`;
  } else if (node.type === "decision") {
    const left = String(document.getElementById("flow-edit-if-left")?.value || "").trim() || "x";
    const op = String(document.getElementById("flow-edit-if-op")?.value || "==").trim() || "==";
    const right = escapeFlowValue(document.getElementById("flow-edit-if-right")?.value);
    node.text = `${left} ${op} ${right}`;
  }
  closeFlowNodeEditor();
  renderFlowchart();
}

function showFlowRuntimeInputModal(question, initialValue = "") {
  const modal = document.getElementById("flow-runtime-input-modal");
  const q = document.getElementById("flow-runtime-input-question");
  const input = document.getElementById("flow-runtime-input-value");
  if (!modal || !q || !input) return Promise.resolve(String(initialValue || ""));
  q.innerText = String(question || "Değer girin");
  input.value = String(initialValue ?? "");
  modal.style.display = "flex";
  setTimeout(() => input.focus(), 0);
  return new Promise((resolve) => {
    flowRuntimeInputResolve = resolve;
  });
}

function closeFlowRuntimeInputModal(nextValue) {
  const modal = document.getElementById("flow-runtime-input-modal");
  const input = document.getElementById("flow-runtime-input-value");
  if (modal) modal.style.display = "none";
  const resolver = flowRuntimeInputResolve;
  flowRuntimeInputResolve = null;
  if (typeof resolver === "function") {
    resolver(nextValue !== undefined ? String(nextValue) : String(input?.value || ""));
  }
}

function setFlowTool(tool) {
  flowSelectedTool = String(tool || "start");
  document.querySelectorAll("#flowchart-palette .flowchart-tool").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tool === flowSelectedTool);
  });
}

function createFlowNode(type, x, y) {
  const node = {
    id: `f_${Date.now()}_${flowNodeSeq++}`,
    type: String(type || "process"),
    text: getFlowNodeTextByType(type),
    x: Math.max(20, Math.floor(Number(x || 200))),
    y: Math.max(20, Math.floor(Number(y || 120)))
  };
  flowNodes.push(node);
  flowSelectedNodeId = node.id;
  renderFlowchart();
}

function getOrderedFlowNodes() {
  return flowNodes.slice().sort((a, b) => {
    const dy = Number(a.y || 0) - Number(b.y || 0);
    if (dy !== 0) return dy;
    return Number(a.x || 0) - Number(b.x || 0);
  });
}

function getFlowNodeById(id) {
  return flowNodes.find((n) => n.id === id) || null;
}

function getFlowOutgoingEdges(nodeId) {
  return flowEdges.filter((e) => e.from === nodeId);
}

function addFlowEdge(fromId, toId) {
  if (!fromId || !toId || fromId === toId) return false;
  if (!getFlowNodeById(fromId) || !getFlowNodeById(toId)) return false;
  const exists = flowEdges.some((e) => e.from === fromId && e.to === toId);
  if (exists) return false;
  const fromNode = getFlowNodeById(fromId);
  let label = "";
  if (fromNode?.type === "decision") {
    const outCount = getFlowOutgoingEdges(fromId).length;
    if (outCount >= 2) return false;
    label = outCount === 0 ? "Evet" : "Hayır";
  }
  flowEdges.push({
    id: `e_${Date.now()}_${Math.random().toString(16).slice(2, 7)}`,
    from: fromId,
    to: toId,
    label
  });
  flowSelectedEdgeId = flowEdges[flowEdges.length - 1]?.id || null;
  return true;
}

function deleteSelectedFlowEdge() {
  if (!flowSelectedEdgeId) {
    appendFlowOutput("Önce silmek için bir bağlantı çizgisi seçin.");
    return;
  }
  flowEdges = flowEdges.filter((e) => e.id !== flowSelectedEdgeId);
  flowSelectedEdgeId = null;
  renderFlowchart();
  appendFlowOutput("Bağlantı silindi.");
}

function getFlowNodeCenter(node) {
  const w = node.type === "decision" ? 130 : 150;
  const h = node.type === "decision" ? 130 : 52;
  return {
    x: Number(node.x || 0) + w / 2,
    y: Number(node.y || 0) + h / 2
  };
}

function normalizeFlowEdgeLabel(label) {
  const txt = String(label || "").trim().toLowerCase();
  if (txt === "t" || txt === "evet" || txt === "true") return "Evet";
  if (txt === "f" || txt === "hayır" || txt === "hayir" || txt === "false") return "Hayır";
  return "";
}

function exportFlowchartGraph(nodes = flowNodes, edges = flowEdges) {
  return {
    nodes: (Array.isArray(nodes) ? nodes : []).map((n) => ({
      id: String(n.id || ""),
      type: String(n.type || "process"),
      x: Number(n.x || 0),
      y: Number(n.y || 0)
    })),
    edges: (Array.isArray(edges) ? edges : []).map((e) => ({
      from: String(e.from || ""),
      to: String(e.to || ""),
      label: normalizeFlowEdgeLabel(e.label)
    }))
  };
}

function buildFlowGraphProps(graph) {
  const nodeList = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const edgeList = Array.isArray(graph?.edges) ? graph.edges : [];
  const nodeMap = new Map(nodeList.map((n) => [String(n.id), n]));
  const inMap = new Map();
  const outMap = new Map();
  const edgeMap = new Map();
  const addEdge = (from, to, label) => {
    const key = `${from}->${to}`;
    edgeMap.set(key, normalizeFlowEdgeLabel(label));
    outMap.set(from, (outMap.get(from) || 0) + 1);
    inMap.set(to, (inMap.get(to) || 0) + 1);
  };
  edgeList.forEach((e) => {
    const from = String(e.from || "");
    const to = String(e.to || "");
    if (!nodeMap.has(from) || !nodeMap.has(to)) return;
    addEdge(from, to, e.label);
  });
  const props = new Map();
  nodeList.forEach((n) => {
    const id = String(n.id || "");
    const type = String(n.type || "process");
    const out = outMap.get(id) || 0;
    const input = inMap.get(id) || 0;
    const outYes = edgeList.filter((e) => String(e.from) === id && normalizeFlowEdgeLabel(e.label) === "Evet").length;
    const outNo = edgeList.filter((e) => String(e.from) === id && normalizeFlowEdgeLabel(e.label) === "Hayır").length;
    props.set(id, `${type}|i${input}|o${out}|y${outYes}|n${outNo}`);
  });
  return { nodeList, edgeList, nodeMap, edgeMap, props };
}

function areFlowGraphsEquivalent(templateGraph, answerGraph) {
  const t = buildFlowGraphProps(templateGraph);
  const s = buildFlowGraphProps(answerGraph);
  if (t.nodeList.length !== s.nodeList.length) return false;
  if (t.edgeList.length !== s.edgeList.length) return false;
  const tTypes = t.nodeList.map((n) => String(n.type || "")).sort();
  const sTypes = s.nodeList.map((n) => String(n.type || "")).sort();
  if (tTypes.join("|") !== sTypes.join("|")) return false;

  const candidates = new Map();
  t.nodeList.forEach((tn) => {
    const key = t.props.get(String(tn.id));
    const pool = s.nodeList.filter((sn) => s.props.get(String(sn.id)) === key).map((sn) => String(sn.id));
    candidates.set(String(tn.id), pool);
  });
  for (const arr of candidates.values()) {
    if (!arr.length) return false;
  }

  const tIds = t.nodeList.map((n) => String(n.id)).sort((a, b) => {
    const al = candidates.get(a)?.length || 0;
    const bl = candidates.get(b)?.length || 0;
    return al - bl;
  });
  const used = new Set();
  const mapTS = new Map();

  const edgeLabel = (m, a, b) => m.get(`${a}->${b}`) || "";

  const backtrack = (idx) => {
    if (idx >= tIds.length) return true;
    const tid = tIds[idx];
    const pool = candidates.get(tid) || [];
    for (const sid of pool) {
      if (used.has(sid)) continue;
      let ok = true;
      for (const [pt, ps] of mapTS.entries()) {
        const tAB = edgeLabel(t.edgeMap, tid, pt);
        const sAB = edgeLabel(s.edgeMap, sid, ps);
        if (tAB !== sAB) { ok = false; break; }
        const tBA = edgeLabel(t.edgeMap, pt, tid);
        const sBA = edgeLabel(s.edgeMap, ps, sid);
        if (tBA !== sBA) { ok = false; break; }
      }
      if (!ok) continue;
      mapTS.set(tid, sid);
      used.add(sid);
      if (backtrack(idx + 1)) return true;
      used.delete(sid);
      mapTS.delete(tid);
    }
    return false;
  };

  return backtrack(0);
}

function buildFlowTemplatePreviewHtml(template) {
  const nodes = Array.isArray(template?.nodes) ? template.nodes : [];
  const edges = Array.isArray(template?.edges) ? template.edges : [];
  if (!nodes.length) return "<div>Hedef şema yok.</div>";
  const minX = Math.min(...nodes.map((n) => Number(n.x || 0)));
  const minY = Math.min(...nodes.map((n) => Number(n.y || 0)));
  const maxX = Math.max(...nodes.map((n) => Number(n.x || 0))) + 180;
  const maxY = Math.max(...nodes.map((n) => Number(n.y || 0))) + 160;
  const width = Math.max(420, maxX - minX + 40);
  const height = Math.max(260, maxY - minY + 40);
  const byId = new Map(nodes.map((n) => [String(n.id), n]));
  const nodeCenter = (n) => {
    const size = getFlowNodeSize(n.type);
    return {
      x: Number(n.x || 0) - minX + 20 + Math.floor(size.width / 2),
      y: Number(n.y || 0) - minY + 20 + Math.floor(size.height / 2)
    };
  };
  const edgeSvg = edges.map((e) => {
    const a = byId.get(String(e.from || ""));
    const b = byId.get(String(e.to || ""));
    if (!a || !b) return "";
    const ac = nodeCenter(a);
    const bc = nodeCenter(b);
    const lbl = normalizeFlowEdgeLabel(e.label);
    return `<line x1="${ac.x}" y1="${ac.y}" x2="${bc.x}" y2="${bc.y}" stroke="#ef4444" stroke-width="2.2"></line>${lbl ? `<text x="${(ac.x + bc.x) / 2 + 4}" y="${(ac.y + bc.y) / 2 - 4}" fill="#111827" font-size="11" font-weight="700">${lbl}</text>` : ""}`;
  }).join("");
  const nodeHtml = nodes.map((n) => {
    const t = String(n.type || "process");
    const text = t === "start" ? "başla" : t === "end" ? "dur" : t === "input" ? "in" : t === "output" ? "out" : t === "decision" ? "if" : "act";
    const left = Number(n.x || 0) - minX + 20;
    const top = Number(n.y || 0) - minY + 20;
    const cls = t === "decision" ? `flow-node ${t}` : `flow-node ${t}`;
    return `<div class="${cls}" style="left:${left}px; top:${top}px; pointer-events:none; transform:${t === "decision" ? "rotate(45deg)" : "none"};"><span style="${t === "decision" ? "transform:rotate(-45deg);display:inline-block;" : ""}">${text}</span></div>`;
  }).join("");
  return `<div class="flow-target-mini"><div style="position:relative; width:${width}px; height:${height}px; background:#f8fafc;"><svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" style="position:absolute; inset:0;">${edgeSvg}</svg>${nodeHtml}</div></div>`;
}

function getFlowAssignmentElapsedSeconds() {
  if (!flowAssignmentTimerStartMs) return Math.max(0, Math.floor(flowAssignmentTimerBaseSec || 0));
  return Math.max(0, Math.floor((flowAssignmentTimerBaseSec || 0) + ((Date.now() - flowAssignmentTimerStartMs) / 1000)));
}

function renderFlowAssignmentTimer() {
  const timerEl = document.getElementById("flow-assignment-timer");
  if (!timerEl) return;
  const sec = getFlowAssignmentElapsedSeconds();
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  timerEl.innerText = `⏱️ ${mins} dk ${secs} sn`;
}

function startFlowAssignmentTimer(initialSeconds = 0) {
  if (flowAssignmentTimerTick) clearInterval(flowAssignmentTimerTick);
  flowAssignmentTimerBaseSec = Math.max(0, Number(initialSeconds || 0));
  flowAssignmentTimerStartMs = Date.now();
  renderFlowAssignmentTimer();
  flowAssignmentTimerTick = setInterval(renderFlowAssignmentTimer, 1000);
}

function stopFlowAssignmentTimer(reset = true) {
  const elapsed = getFlowAssignmentElapsedSeconds();
  if (flowAssignmentTimerTick) {
    clearInterval(flowAssignmentTimerTick);
    flowAssignmentTimerTick = null;
  }
  if (reset) {
    flowAssignmentTimerStartMs = 0;
    flowAssignmentTimerBaseSec = 0;
    renderFlowAssignmentTimer();
  }
  return elapsed;
}

function setFlowchartMode(mode = "teacher", assignment = null) {
  flowchartMode = mode === "student-assignment" ? "student-assignment" : "teacher";
  activeFlowchartAssignment = flowchartMode === "student-assignment" ? assignment : null;
  const assignBtn = document.getElementById("flow-assign");
  const deleteAssignmentBtn = document.getElementById("flow-delete-assignment");
  const submitBtn = document.getElementById("flow-submit-assignment");
  const help = document.getElementById("flowchart-help-text");
  const preview = document.getElementById("flowchart-target-preview");
  const timerEl = document.getElementById("flow-assignment-timer");
  const editable = flowchartMode === "teacher";
  if (assignBtn) assignBtn.style.display = editable ? "inline-flex" : "none";
  if (deleteAssignmentBtn) deleteAssignmentBtn.style.display = editable && !!editingFlowchartAssignmentId ? "inline-flex" : "none";
  if (submitBtn) submitBtn.style.display = editable ? "none" : "inline-flex";
  if (timerEl) timerEl.style.display = editable ? "none" : "inline-flex";
  if (help) {
    if (editable) {
      help.innerText = 'İpucu: Soldan şekli sürükleyip bırak. "Bağla Modu" ile iki düğümü seçip bağlantı kur. Şekle çift tıklayıp metin düzenle.';
    } else {
      const q = String(assignment?.flowQuestion || assignment?.question || "Flowchart şablonunu doğru bağlantılarla oluştur.");
      help.innerText = `Soru: ${q}`;
    }
  }
  if (preview) {
    if (!editable && assignment?.flowTemplate) {
      preview.style.display = "block";
      preview.innerHTML = buildFlowTemplatePreviewHtml(assignment.flowTemplate);
    } else {
      preview.style.display = "none";
      preview.innerHTML = "";
    }
  }
  if (editable) stopFlowAssignmentTimer(true);
  if (!editable) renderFlowAssignmentTimer();
  if (editable) setFlowAssignButtonLabel();
}

function setFlowAssignButtonLabel() {
  const btn = document.getElementById("flow-assign");
  if (!btn) return;
  btn.innerText = editingFlowchartAssignmentId ? "Ödevi Güncelle" : "Ödev Ver";
  const deleteAssignmentBtn = document.getElementById("flow-delete-assignment");
  if (deleteAssignmentBtn) deleteAssignmentBtn.style.display = editingFlowchartAssignmentId ? "inline-flex" : "none";
}

function loadFlowchartFromTemplate(template) {
  const g = template || {};
  const nodes = Array.isArray(g.nodes) ? g.nodes : [];
  const edges = Array.isArray(g.edges) ? g.edges : [];
  flowNodes = nodes.map((n, idx) => ({
    id: String(n?.id || `f_tpl_${Date.now()}_${idx}`),
    type: String(n?.type || "process"),
    text: getFlowNodeTextByType(String(n?.type || "process")),
    x: Math.max(20, Number(n?.x || 120)),
    y: Math.max(20, Number(n?.y || 120))
  }));
  const nodeIdSet = new Set(flowNodes.map((n) => String(n.id)));
  flowEdges = edges
    .map((e, idx) => ({
      id: String(e?.id || `e_tpl_${Date.now()}_${idx}`),
      from: String(e?.from || ""),
      to: String(e?.to || ""),
      label: normalizeFlowEdgeLabel(e?.label)
    }))
    .filter((e) => nodeIdSet.has(e.from) && nodeIdSet.has(e.to) && e.from !== e.to);
  flowSelectedNodeId = null;
  flowSelectedEdgeId = null;
  flowConnectSourceId = null;
}

function renderFlowchartLines() {
  const { svg } = getFlowchartEls();
  if (!svg) return;
  svg.innerHTML = "";
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "flow-arrow");
  marker.setAttribute("viewBox", "0 0 10 10");
  marker.setAttribute("refX", "9");
  marker.setAttribute("refY", "5");
  marker.setAttribute("markerWidth", "8");
  marker.setAttribute("markerHeight", "8");
  marker.setAttribute("orient", "auto-start-reverse");
  const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arrowPath.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
  arrowPath.setAttribute("fill", "#ef4444");
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  svg.appendChild(defs);

  flowEdges.forEach((edge) => {
    const fromNode = getFlowNodeById(edge.from);
    const toNode = getFlowNodeById(edge.to);
    if (!fromNode || !toNode) return;
    const from = getFlowNodeCenter(fromNode);
    const to = getFlowNodeCenter(toNode);
    const isSelected = edge.id === flowSelectedEdgeId;
    const selectEdge = (ev) => {
      ev.stopPropagation();
      flowSelectedEdgeId = edge.id;
      flowSelectedNodeId = null;
      renderFlowchart();
    };
    const hit = document.createElementNS("http://www.w3.org/2000/svg", "line");
    hit.setAttribute("x1", String(from.x));
    hit.setAttribute("y1", String(from.y));
    hit.setAttribute("x2", String(to.x));
    hit.setAttribute("y2", String(to.y));
    hit.setAttribute("stroke", "transparent");
    hit.setAttribute("stroke-width", "20");
    hit.setAttribute("stroke-linecap", "round");
    hit.style.pointerEvents = "stroke";
    hit.style.cursor = "pointer";
    hit.addEventListener("click", selectEdge);
    svg.appendChild(hit);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(from.x));
    line.setAttribute("y1", String(from.y));
    line.setAttribute("x2", String(to.x));
    line.setAttribute("y2", String(to.y));
    line.setAttribute("stroke", isSelected ? "#2563eb" : "#ef4444");
    line.setAttribute("stroke-width", isSelected ? "4" : "2.6");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("marker-end", "url(#flow-arrow)");
    line.style.pointerEvents = "stroke";
    line.style.cursor = "pointer";
    line.addEventListener("click", selectEdge);
    svg.appendChild(line);
    if (edge.label) {
      const tx = (from.x + to.x) / 2;
      const ty = (from.y + to.y) / 2;
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String(tx + 6));
      label.setAttribute("y", String(ty - 6));
      label.setAttribute("fill", "#1f2937");
      label.setAttribute("font-size", "13");
      label.setAttribute("font-weight", "700");
      label.style.pointerEvents = "auto";
      label.style.cursor = "pointer";
      label.addEventListener("click", selectEdge);
      label.textContent = edge.label === "T" ? "Evet" : edge.label === "F" ? "Hayır" : edge.label;
      svg.appendChild(label);
    }
  });
}

function renderFlowchart() {
  const { canvas } = getFlowchartEls();
  if (!canvas) return;
  canvas.querySelectorAll(".flow-node").forEach((n) => n.remove());
  flowNodes.forEach((node) => {
    const el = document.createElement("div");
    el.className = `flow-node ${node.type}${flowSelectedNodeId === node.id ? " selected" : ""}${flowConnectSourceId === node.id ? " connect-source" : ""}`;
    el.dataset.id = node.id;
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    if (node.type === "decision") {
      const span = document.createElement("span");
      span.textContent = getFlowNodeDisplayText(node);
      el.appendChild(span);
    } else {
      el.textContent = getFlowNodeDisplayText(node);
    }
    el.addEventListener("mousedown", (ev) => {
      ev.stopPropagation();
      flowSelectedNodeId = node.id;
      flowSelectedEdgeId = null;
      const rect = canvas.getBoundingClientRect();
      const cursorX = ev.clientX - rect.left;
      const cursorY = ev.clientY - rect.top;
      flowDragState = {
        nodeId: node.id,
        dx: cursorX - Number(node.x || 0),
        dy: cursorY - Number(node.y || 0)
      };
    });
    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      flowSelectedEdgeId = null;
      if (flowConnectMode) {
        if (!flowConnectSourceId) {
          flowConnectSourceId = node.id;
          flowSelectedNodeId = node.id;
          appendFlowOutput("Bağla: 1. düğüm seçildi. Şimdi 2. düğümü tıklayın.");
        } else {
          if (flowConnectSourceId === node.id) {
            appendFlowOutput("Aynı düğüm seçildi. Farklı bir 2. düğüm seçin.");
          } else {
            const ok = addFlowEdge(flowConnectSourceId, node.id);
            appendFlowOutput(ok ? "Bağlantı eklendi." : "Bağlantı eklenemedi.");
            flowConnectSourceId = null;
          }
          flowSelectedNodeId = node.id;
        }
      } else {
        flowSelectedNodeId = node.id;
      }
      renderFlowchart();
    });
    el.addEventListener("dblclick", (ev) => {
      ev.stopPropagation();
      showFlowNodeEditor(node.id);
    });
    canvas.appendChild(el);
  });
  renderFlowchartLines();
}

function appendFlowOutput(text) {
  const { output } = getFlowchartEls();
  if (!output) return;
  const prev = String(output.textContent || "").trim();
  output.textContent = prev ? `${prev}\n${text}` : String(text);
  output.scrollTop = output.scrollHeight;
}

function flowSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function evalFlowExpr(expr, vars) {
  const src = String(expr || "").trim();
  if (!src) return 0;
  return Function("vars", "Math", `with(vars){ return (${src}); }`)(vars, Math);
}

function evalFlowCondition(expr, vars) {
  try {
    const parsed = parseFlowDecisionText(expr);
    const leftRaw = vars?.[parsed.left];
    const rightRaw = parsed.right;
    const leftNum = toFlowNumber(leftRaw);
    const rightNum = toFlowNumber(rightRaw);
    if ([">", "<", ">=", "<="].includes(parsed.op)) {
      if (!Number.isFinite(leftNum) || !Number.isFinite(rightNum)) return false;
      if (parsed.op === ">") return leftNum > rightNum;
      if (parsed.op === "<") return leftNum < rightNum;
      if (parsed.op === ">=") return leftNum >= rightNum;
      return leftNum <= rightNum;
    }
    const leftVal = Number.isFinite(leftNum) ? leftNum : String(leftRaw ?? "");
    const rightVal = Number.isFinite(rightNum) ? rightNum : String(rightRaw ?? "");
    return parsed.op === "==" ? leftVal === rightVal : leftVal !== rightVal;
  } catch (e) {
    return false;
  }
}

function formatFlowOutput(text, vars) {
  return String(text || "").replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (_, key) => {
    const val = vars[key];
    return val === undefined ? "" : String(val);
  });
}

function highlightFlowNode(nodeId) {
  document.querySelectorAll("#flowchart-canvas .flow-node").forEach((el) => {
    el.classList.toggle("running", el.dataset.id === nodeId);
  });
}

async function runFlowchart() {
  if (flowRunnerBusy) return;
  if (!flowNodes.length) {
    appendFlowOutput("Akış boş.");
    return;
  }
  let current = flowNodes.find((n) => n.type === "start") || getOrderedFlowNodes()[0];
  if (!current) {
    appendFlowOutput("Başlangıç düğümü bulunamadı.");
    return;
  }
  flowRunCancelled = false;
  flowRunnerBusy = true;
  const vars = {};
  const { output } = getFlowchartEls();
  if (output) output.textContent = "";
  let guard = 0;
  while (current && guard < 1000) {
    if (flowRunCancelled) break;
    const n = current;
    highlightFlowNode(n.id);
    await flowSleep(280);
    let nextNodeId = null;
    try {
      if (n.type === "output") {
        const out = parseFlowOutputText(n.text);
        const msg = formatFlowOutput(out.message || "", vars);
        if (out.varName) {
          const value = vars[out.varName];
          appendFlowOutput(`${msg}${msg ? " : " : ""}${value === undefined ? "" : String(value)}`);
        } else {
          appendFlowOutput(msg);
        }
      } else if (n.type === "input") {
        const parts = parseFlowInputText(n.text);
        const val = await showFlowRuntimeInputModal(parts.message, String(vars[parts.varName] ?? ""));
        vars[parts.varName] = coerceFlowInputValue(val);
      } else if (n.type === "process") {
        const src = String(n.text || "").trim();
        if (src.includes("=")) {
          const ix = src.indexOf("=");
          const key = src.slice(0, ix).trim();
          const rhs = src.slice(ix + 1).trim();
          if (key) vars[key] = evalFlowExpr(rhs, vars);
        } else {
          evalFlowExpr(src, vars);
        }
      } else if (n.type === "decision") {
        const ok = evalFlowCondition(n.text, vars);
        const outs = getFlowOutgoingEdges(n.id);
        const trueEdge = outs.find((e) => e.label === "Evet" || e.label === "T") || outs[0];
        const falseEdge = outs.find((e) => e.label === "Hayır" || e.label === "F") || outs[1] || outs[0];
        nextNodeId = (ok ? trueEdge : falseEdge)?.to || null;
      } else if (n.type === "end") {
        appendFlowOutput("Akış tamamlandı.");
        break;
      }
      if (!nextNodeId && n.type !== "decision") {
        nextNodeId = getFlowOutgoingEdges(n.id)[0]?.to || null;
      }
    } catch (e) {
      appendFlowOutput(`Hata (${n.type}): ${String(e?.message || e)}`);
      break;
    }
    if (!nextNodeId) {
      if (n.type !== "end") appendFlowOutput("Akış sonlandı (bağlantı yok).");
      break;
    }
    current = getFlowNodeById(nextNodeId);
    guard += 1;
  }
  highlightFlowNode("");
  flowRunnerBusy = false;
}

function stopFlowchart() {
  flowRunCancelled = true;
  flowRunnerBusy = false;
  highlightFlowNode("");
}

function autoLayoutFlowchart() {
  const ordered = getOrderedFlowNodes();
  const centerX = 500;
  ordered.forEach((n, idx) => {
    const isDecision = n.type === "decision";
    const w = isDecision ? 130 : 150;
    n.x = centerX - Math.floor(w / 2);
    n.y = 80 + (idx * 120);
  });
  renderFlowchart();
}

function toggleFlowConnectMode() {
  flowConnectMode = !flowConnectMode;
  flowConnectSourceId = null;
  const btn = document.getElementById("flow-auto");
  if (btn) btn.classList.toggle("active", flowConnectMode);
  appendFlowOutput(flowConnectMode ? "Bağla modu aktif: 2 düğüm seçerek bağla." : "Bağla modu kapalı.");
}

function editSelectedFlowNode() {
  const n = flowNodes.find((v) => v.id === flowSelectedNodeId);
  if (!n) return;
  showFlowNodeEditor(n.id);
}

function deleteSelectedFlowNode() {
  if (!flowSelectedNodeId) return;
  flowNodes = flowNodes.filter((n) => n.id !== flowSelectedNodeId);
  flowEdges = flowEdges.filter((e) => e.from !== flowSelectedNodeId && e.to !== flowSelectedNodeId);
  if (flowSelectedEdgeId && !flowEdges.some((e) => e.id === flowSelectedEdgeId)) {
    flowSelectedEdgeId = null;
  }
  flowSelectedNodeId = null;
  renderFlowchart();
}

function clearFlowchart() {
  flowNodes = [];
  flowEdges = [];
  flowSelectedNodeId = null;
  flowSelectedEdgeId = null;
  flowConnectSourceId = null;
  const a = {
    id: `f_${Date.now()}_${flowNodeSeq++}`,
    type: "start",
    text: getFlowNodeTextByType("start"),
    x: 520,
    y: 140
  };
  const b = {
    id: `f_${Date.now()}_${flowNodeSeq++}`,
    type: "end",
    text: getFlowNodeTextByType("end"),
    x: 520,
    y: 320
  };
  flowNodes.push(a, b);
  flowEdges.push({ id: `e_${Date.now()}_clear`, from: a.id, to: b.id, label: "" });
  renderFlowchart();
  const { output } = getFlowchartEls();
  if (output) output.textContent = "Flowchart çıktısı burada görünecek.";
}

function openFlowchartModal() {
  if (userRole !== "teacher") return;
  editingFlowchartAssignmentId = null;
  editingFlowchartAssignmentData = null;
  setFlowchartMode("teacher", null);
  setFlowAssignButtonLabel();
  const { modal } = getFlowchartEls();
  if (!modal) return;
  modal.style.display = "flex";
  if (!flowNodes.length) {
    const a = {
      id: `f_${Date.now()}_${flowNodeSeq++}`,
      type: "start",
      text: getFlowNodeTextByType("start"),
      x: 520,
      y: 80
    };
    const b = {
      id: `f_${Date.now()}_${flowNodeSeq++}`,
      type: "output",
      text: getFlowNodeTextByType("output"),
      x: 500,
      y: 220
    };
    const c = {
      id: `f_${Date.now()}_${flowNodeSeq++}`,
      type: "end",
      text: getFlowNodeTextByType("end"),
      x: 520,
      y: 360
    };
    flowNodes.push(a, b, c);
    flowEdges.push(
      { id: `e_${Date.now()}_a`, from: a.id, to: b.id, label: "" },
      { id: `e_${Date.now()}_b`, from: b.id, to: c.id, label: "" }
    );
  }
  renderFlowchart();
}

function openFlowchartAssignmentForStudent(assignment) {
  if (userRole !== "student" || !assignment) return;
  const { modal, output } = getFlowchartEls();
  if (!modal) return;
  setFlowchartMode("student-assignment", assignment);
  startFlowAssignmentTimer(0);
  modal.style.display = "flex";
  flowNodes = [
    { id: `f_${Date.now()}_${flowNodeSeq++}`, type: "start", text: "başla", x: 420, y: 120 },
    { id: `f_${Date.now()}_${flowNodeSeq++}`, type: "end", text: "dur", x: 420, y: 300 }
  ];
  flowEdges = [];
  flowSelectedNodeId = null;
  flowSelectedEdgeId = null;
  flowConnectSourceId = null;
  if (output) output.textContent = "Flowchart çıktısı burada görünecek.";
  renderFlowchart();
}

function getFlowchartAssignmentXPByShapeCount(shapeCount) {
  const n = Math.max(0, Number(shapeCount || 0));
  if (n >= 8) return 40;
  if (n >= 5) return 20;
  if (n >= 1) return 10;
  return 0;
}

async function submitFlowchartAssignmentAnswer() {
  if (userRole !== "student" || !activeFlowchartAssignment?.id || !currentUserId) return;
  const assignment = activeFlowchartAssignment;
  const template = assignment.flowTemplate || {};
  const answer = exportFlowchartGraph(flowNodes, flowEdges);
  const correct = areFlowGraphsEquivalent(template, answer);
  if (!correct) {
    showNotice("Şekil/bağlantı eşleşmedi. Tekrar deneyin.", "#e74c3c");
    return;
  }
  const aid = String(assignment.id);
  const uid = String(currentUserId);
  const shapeCount = Array.isArray(answer?.nodes) ? answer.nodes.length : 0;
  const xp = getFlowchartAssignmentXPByShapeCount(shapeCount);
  const elapsedSeconds = stopFlowAssignmentTimer(false);
  const progressRef = doc(db, "blockAssignmentProgress", `${aid}_${uid}`);
  try {
    const prevSnap = await getDoc(progressRef);
    const prev = prevSnap.exists() ? prevSnap.data() : {};
    const wasCompleted = !!prev.completed;
    const prevSeconds = Math.max(0, Number(prev.lastSessionSeconds || 0));
    const totalSeconds = Math.max(0, prevSeconds + elapsedSeconds);
    await setDoc(progressRef, {
      assignmentId: aid,
      assignmentType: "flowchart",
      assignmentTitle: assignment.title || "Flowchart Ödevi",
      userId: uid,
      completed: true,
      percent: 100,
      completedLevels: 1,
      totalLevels: 1,
      totalXP: xp,
      lastSessionSeconds: totalSeconds,
      updatedAt: serverTimestamp()
    }, { merge: true });
    if (!wasCompleted) {
      try {
        await updateDoc(doc(db, "users", uid), { xp: increment(xp), updatedAt: serverTimestamp() });
      } catch {}
      try {
        await updateDoc(doc(db, "blockAssignments", aid), { completedCount: increment(1), updatedAt: serverTimestamp() });
      } catch {}
    }
    blockAssignmentProgressMap.set(aid, {
      ...(blockAssignmentProgressMap.get(aid) || {}),
      assignmentId: aid,
      completed: true,
      percent: 100,
      completedLevels: 1,
      totalLevels: 1,
      totalXP: xp,
      lastSessionSeconds: totalSeconds
    });
    renderBlockHomeworkList();
    showCompletionCelebration({
      title: "Flowchart Tamamlandı!",
      message: `Doğru cevap! ${shapeCount} şekil ile ödev başarıyla tamamlandı.`,
      accent: "#f59e0b",
      xp,
      durationSeconds: totalSeconds,
      requireAction: true,
      actionText: "Kaydet ve Çık",
      onAction: async () => {
        closeFlowchartModal();
        return true;
      }
    });
  } catch (e) {
    startFlowAssignmentTimer(elapsedSeconds);
    showNotice("Flowchart ödevi kaydedilemedi: " + e.message, "#e74c3c");
  }
}

function closeFlowchartModal() {
  const { modal } = getFlowchartEls();
  if (!modal) return;
  stopFlowchart();
  flowConnectMode = false;
  flowConnectSourceId = null;
  flowSelectedEdgeId = null;
  closeFlowNodeEditor();
  closeFlowRuntimeInputModal("");
  closeFlowchartAssignmentModal();
  const btn = document.getElementById("flow-auto");
  if (btn) btn.classList.remove("active");
  modal.style.display = "none";
  setFlowchartMode("teacher", null);
  editingFlowchartAssignmentId = null;
  editingFlowchartAssignmentData = null;
  setFlowAssignButtonLabel();
}

function openFlowchartAssignmentModal() {
  if (userRole !== "teacher") return;
  if (!flowNodes.length || !flowEdges.length) {
    showNotice("Önce flowchart şemasını oluşturun.", "#f39c12");
    return;
  }
  const modal = document.getElementById("flowchart-assignment-modal");
  if (!modal) return;
  const titleEl = document.getElementById("flow-assignment-title");
  const qEl = document.getElementById("flow-assignment-question");
  const classEl = document.getElementById("flow-assignment-class");
  const secEl = document.getElementById("flow-assignment-section");
  const dlEl = document.getElementById("flow-assignment-deadline");
  const tmEl = document.getElementById("flow-assignment-time");
  const xpEl = document.getElementById("flow-assignment-xp");
  const saveBtn = document.getElementById("btn-save-flow-assignment");
  const deleteBtn = document.getElementById("btn-delete-flow-assignment");
  if (editingFlowchartAssignmentId && editingFlowchartAssignmentData) {
    if (titleEl) titleEl.value = String(editingFlowchartAssignmentData.title || "Flowchart Ödevi");
    if (qEl) qEl.value = String(editingFlowchartAssignmentData.flowQuestion || "");
    if (classEl) classEl.value = String(editingFlowchartAssignmentData.targetClass || "");
    if (secEl) secEl.value = String(editingFlowchartAssignmentData.targetSection || "");
    if (dlEl) dlEl.value = String(editingFlowchartAssignmentData.deadline || "");
    if (tmEl) tmEl.value = String(editingFlowchartAssignmentData.deadlineTime || "23:59");
    if (xpEl) xpEl.value = String(clampAppLevelXP(editingFlowchartAssignmentData.xp ?? MAX_APP_LEVEL_XP));
    if (saveBtn) saveBtn.innerText = "Ödevi Güncelle";
    if (deleteBtn) deleteBtn.style.display = "inline-flex";
  } else {
    if (titleEl) titleEl.value = titleEl.value || "Flowchart Ödevi";
    if (qEl) qEl.value = qEl.value || "";
    if (classEl) classEl.value = classEl.value || "";
    if (secEl) secEl.value = secEl.value || "";
    if (dlEl) dlEl.value = dlEl.value || "";
    if (tmEl) tmEl.value = tmEl.value || "23:59";
    if (xpEl) xpEl.value = xpEl.value || String(MAX_APP_LEVEL_XP);
    if (saveBtn) saveBtn.innerText = "Ödevi Yayınla";
    if (deleteBtn) deleteBtn.style.display = "none";
  }
  modal.style.display = "flex";
}

function closeFlowchartAssignmentModal() {
  const modal = document.getElementById("flowchart-assignment-modal");
  if (modal) modal.style.display = "none";
  const saveBtn = document.getElementById("btn-save-flow-assignment");
  const deleteBtn = document.getElementById("btn-delete-flow-assignment");
  if (saveBtn) saveBtn.innerText = "Ödevi Yayınla";
  if (deleteBtn) deleteBtn.style.display = "none";
}

async function deleteFlowchartAssignmentById(assignmentId, title = "Flowchart Ödevi") {
  const id = String(assignmentId || "").trim();
  if (!id || userRole !== "teacher") return false;
  const ok = await confirmDialog(`"${title}" silinsin mi?`);
  if (!ok) return false;
  try {
    await deleteDoc(doc(db, "blockAssignments", id));
    const pq = query(collection(db, "blockAssignmentProgress"), where("assignmentId", "==", id));
    const snap = await getDocs(pq);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    showNotice("Flowchart ödevi silindi.", "#2ecc71");
    return true;
  } catch (e) {
    showNotice("Flowchart ödevi silinemedi: " + e.message, "#e74c3c");
    return false;
  }
}

async function saveFlowchartAssignmentFromCurrent() {
  if (userRole !== "teacher") return;
  const title = String(document.getElementById("flow-assignment-title")?.value || "").trim();
  const question = String(document.getElementById("flow-assignment-question")?.value || "").trim();
  const targetClass = String(document.getElementById("flow-assignment-class")?.value || "").trim();
  const targetSection = String(document.getElementById("flow-assignment-section")?.value || "").trim();
  const deadline = String(document.getElementById("flow-assignment-deadline")?.value || "").trim();
  const deadlineTime = String(document.getElementById("flow-assignment-time")?.value || "23:59").trim() || "23:59";
  const xp = clampAppLevelXP(document.getElementById("flow-assignment-xp")?.value ?? MAX_APP_LEVEL_XP);
  if (!title) {
    showNotice("Ödev başlığı zorunlu.", "#e74c3c");
    return;
  }
  if (!question) {
    showNotice("Soru metni zorunlu.", "#e74c3c");
    return;
  }
  const template = exportFlowchartGraph(flowNodes, flowEdges);
  if (!template.nodes.length || !template.edges.length) {
    showNotice("Geçerli bir flowchart şeması oluşturun.", "#e74c3c");
    return;
  }
  try {
    if (editingFlowchartAssignmentId) {
      await updateDoc(doc(db, "blockAssignments", editingFlowchartAssignmentId), {
        assignmentType: "flowchart",
        title,
        flowQuestion: question,
        flowTemplate: template,
        targetClass,
        targetSection,
        deadline,
        deadlineTime,
        xp,
        levelStart: 1,
        levelEnd: 1,
        levelNames: ["Flowchart Soru"],
        updatedAt: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, "blockAssignments"), {
        assignmentType: "flowchart",
        title,
        flowQuestion: question,
        flowTemplate: template,
        targetClass,
        targetSection,
        deadline,
        deadlineTime,
        xp,
        levelStart: 1,
        levelEnd: 1,
        levelNames: ["Flowchart Soru"],
        completedCount: 0,
        userId: currentUserId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    closeFlowchartAssignmentModal();
    showNotice(editingFlowchartAssignmentId ? "Flowchart ödevi güncellendi." : "Flowchart ödevi yayınlandı.", "#2ecc71");
    editingFlowchartAssignmentId = null;
    editingFlowchartAssignmentData = null;
    setFlowAssignButtonLabel();
  } catch (e) {
    showNotice("Flowchart ödevi kaydedilemedi: " + e.message, "#e74c3c");
  }
}

function initFlowchartEditor() {
  const { palette, canvas } = getFlowchartEls();
  if (palette) {
    palette.querySelectorAll(".flowchart-tool").forEach((btn) => {
      btn.addEventListener("click", () => setFlowTool(btn.dataset.tool));
      btn.addEventListener("dragstart", (ev) => {
        const t = btn.dataset.tool || "process";
        ev.dataTransfer?.setData("text/flow-tool", t);
        ev.dataTransfer?.setData("text/plain", t);
        if (ev.dataTransfer) {
          ev.dataTransfer.effectAllowed = "copy";
          ev.dataTransfer.setDragImage(btn, Math.floor(btn.clientWidth / 2), Math.floor(btn.clientHeight / 2));
        }
      });
    });
  }
  if (canvas) {
    canvas.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      ev.dataTransfer && (ev.dataTransfer.dropEffect = "copy");
    });
    canvas.addEventListener("drop", (ev) => {
      ev.preventDefault();
      const t = ev.dataTransfer?.getData("text/flow-tool") || ev.dataTransfer?.getData("text/plain") || flowSelectedTool;
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const size = getFlowNodeSize(t);
      setFlowTool(t);
      createFlowNode(t, x - Math.floor(size.width / 2), y - Math.floor(size.height / 2));
    });
    canvas.addEventListener("click", (ev) => {
      const target = ev.target;
      if (target instanceof HTMLElement && target.closest(".flow-node")) return;
      flowSelectedNodeId = null;
      flowSelectedEdgeId = null;
      if (flowConnectMode) flowConnectSourceId = null;
      renderFlowchart();
    });
  }
  document.addEventListener("mousemove", (ev) => {
    if (!flowDragState) return;
    const n = flowNodes.find((v) => v.id === flowDragState.nodeId);
    const { canvas } = getFlowchartEls();
    if (!n || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    n.x = Math.max(0, Math.floor(ev.clientX - rect.left - flowDragState.dx));
    n.y = Math.max(0, Math.floor(ev.clientY - rect.top - flowDragState.dy));
    renderFlowchart();
  });
  document.addEventListener("mouseup", () => { flowDragState = null; });

  document.getElementById("btn-flow-node-cancel")?.addEventListener("click", closeFlowNodeEditor);
  document.getElementById("btn-flow-node-save")?.addEventListener("click", saveFlowNodeEditor);
  document.getElementById("flow-node-editor-modal")?.addEventListener("click", (ev) => {
    if (ev.target?.id === "flow-node-editor-modal") closeFlowNodeEditor();
  });
  document.getElementById("flow-node-editor-modal")?.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter" || ev.shiftKey) return;
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.tagName === "TEXTAREA") return;
    ev.preventDefault();
    saveFlowNodeEditor();
  });
  document.getElementById("btn-flow-runtime-input-ok")?.addEventListener("click", () => {
    const val = document.getElementById("flow-runtime-input-value")?.value || "";
    closeFlowRuntimeInputModal(val);
  });
  document.getElementById("btn-flow-runtime-input-cancel")?.addEventListener("click", () => {
    closeFlowRuntimeInputModal("");
  });
  document.getElementById("flow-runtime-input-value")?.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      const val = document.getElementById("flow-runtime-input-value")?.value || "";
      closeFlowRuntimeInputModal(val);
    }
  });
  document.getElementById("flow-runtime-input-modal")?.addEventListener("click", (ev) => {
    if (ev.target?.id === "flow-runtime-input-modal") closeFlowRuntimeInputModal("");
  });

  document.getElementById("flow-run")?.addEventListener("click", runFlowchart);
  document.getElementById("flow-stop")?.addEventListener("click", stopFlowchart);
  document.getElementById("flow-assign")?.addEventListener("click", openFlowchartAssignmentModal);
  document.getElementById("flow-delete-assignment")?.addEventListener("click", async () => {
    if (!editingFlowchartAssignmentId) return;
    const title = String(editingFlowchartAssignmentData?.title || "Flowchart Ödevi");
    const deleted = await deleteFlowchartAssignmentById(editingFlowchartAssignmentId, title);
    if (!deleted) return;
    editingFlowchartAssignmentId = null;
    editingFlowchartAssignmentData = null;
    closeFlowchartAssignmentModal();
    closeFlowchartModal();
    setFlowAssignButtonLabel();
  });
  document.getElementById("flow-submit-assignment")?.addEventListener("click", submitFlowchartAssignmentAnswer);
  document.getElementById("flow-auto")?.addEventListener("click", toggleFlowConnectMode);
  document.getElementById("flow-delete")?.addEventListener("click", deleteSelectedFlowNode);
  document.getElementById("flow-delete-edge")?.addEventListener("click", deleteSelectedFlowEdge);
  document.getElementById("flow-clear")?.addEventListener("click", clearFlowchart);
  document.getElementById("flow-close")?.addEventListener("click", closeFlowchartModal);
  document.getElementById("btn-close-flow-assignment")?.addEventListener("click", closeFlowchartAssignmentModal);
  document.getElementById("btn-save-flow-assignment")?.addEventListener("click", saveFlowchartAssignmentFromCurrent);
  document.getElementById("btn-delete-flow-assignment")?.addEventListener("click", async () => {
    if (!editingFlowchartAssignmentId) return;
    const title = String(editingFlowchartAssignmentData?.title || "Flowchart Ödevi");
    const deleted = await deleteFlowchartAssignmentById(editingFlowchartAssignmentId, title);
    if (!deleted) return;
    editingFlowchartAssignmentId = null;
    editingFlowchartAssignmentData = null;
    closeFlowchartAssignmentModal();
    closeFlowchartModal();
    setFlowAssignButtonLabel();
  });
  document.getElementById("flowchart-assignment-modal")?.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter" || ev.shiftKey) return;
    const target = ev.target;
    if (target instanceof HTMLElement && target.tagName === "TEXTAREA") return;
    ev.preventDefault();
    saveFlowchartAssignmentFromCurrent();
  });
  document.getElementById("flowchart-assignment-modal")?.addEventListener("click", (ev) => {
    if (ev.target?.id === "flowchart-assignment-modal") closeFlowchartAssignmentModal();
  });
  document.getElementById("flowchart-modal")?.addEventListener("click", (ev) => {
    if (ev.target?.id === "flowchart-modal") closeFlowchartModal();
  });
}

/* ================= MENÜ KONTROLÜ ================= */
document.getElementById("open-menu").onclick = function() {
  if (userRole === "student") applyStudentSidebarMinimalMode();
  closeOtherSidebarSubmenus("");
  document.getElementById("side-menu").style.width = "250px";
};

function setSidebarSubmenuState(menuId, toggleId, open) {
  const menu = document.getElementById(menuId);
  const toggle = document.getElementById(toggleId);
  if (!menu || !toggle) return;
  menu.classList.toggle("open", !!open);
  const arrow = toggle.querySelector(".arrow");
  if (arrow) arrow.innerText = open ? "▾" : "▸";
}

function closeOtherSidebarSubmenus(exceptMenuId = "") {
  const pairs = [
    ["submenu-add", "btn-toggle-add-menu"],
    ["submenu-tasks", "btn-toggle-tasks-menu"],
    ["submenu-apps", "btn-toggle-apps-menu"],
    ["submenu-student-data", "btn-toggle-student-data-menu"]
  ];
  pairs.forEach(([menuId, toggleId]) => {
    if (menuId === exceptMenuId) return;
    setSidebarSubmenuState(menuId, toggleId, false);
  });
}

function closeSidebarMenu() {
  const sideMenu = document.getElementById("side-menu");
  if (sideMenu) sideMenu.style.width = "0";
  closeOtherSidebarSubmenus("");
}

function toggleSidebarSubmenu(menuId, toggleId) {
  const menu = document.getElementById(menuId);
  if (!menu) return;
  const willOpen = !menu.classList.contains("open");
  if (willOpen) closeOtherSidebarSubmenus(menuId);
  setSidebarSubmenuState(menuId, toggleId, willOpen);
}

function openAppsHubModal() {
  const modal = document.getElementById("apps-hub-modal");
  if (!modal) return;
  closeSidebarMenu();
  modal.style.display = "flex";
}

function closeAppsHubModal() {
  const modal = document.getElementById("apps-hub-modal");
  if (!modal) return;
  modal.style.display = "none";
}

document.getElementById("btn-toggle-add-menu")?.addEventListener("click", () => {
  toggleSidebarSubmenu("submenu-add", "btn-toggle-add-menu");
});
document.getElementById("btn-toggle-tasks-menu")?.addEventListener("click", () => {
  toggleSidebarSubmenu("submenu-tasks", "btn-toggle-tasks-menu");
});
document.getElementById("btn-toggle-apps-menu")?.addEventListener("click", () => {
  closeOtherSidebarSubmenus("submenu-apps");
  openAppsHubModal();
});
document.getElementById("btn-toggle-student-data-menu")?.addEventListener("click", () => {
  toggleSidebarSubmenu("submenu-student-data", "btn-toggle-student-data-menu");
});
document.getElementById("btn-close-apps-hub")?.addEventListener("click", closeAppsHubModal);
document.getElementById("apps-hub-modal")?.addEventListener("click", (ev) => {
  if (ev.target?.id === "apps-hub-modal") closeAppsHubModal();
});

document.getElementById("close-menu").onclick = function() {
  closeSidebarMenu();
};

function applyStudentSidebarMinimalMode() {
  const sideMenu = document.getElementById("side-menu");
  if (!sideMenu) return;
  sideMenu.classList.add("student-minimal");
  sideMenu.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.style.display = "none";
  });
  ["btn-open-home", "btn-open-my-stats", "btn-open-certificates", "btn-open-avatar-shop", "btn-logout-side"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
  });
  setSidebarSubmenuState("submenu-add", "btn-toggle-add-menu", false);
  setSidebarSubmenuState("submenu-tasks", "btn-toggle-tasks-menu", false);
  setSidebarSubmenuState("submenu-apps", "btn-toggle-apps-menu", false);
  setSidebarSubmenuState("submenu-student-data", "btn-toggle-student-data-menu", false);
}

function applyUserDropdownMenuByRole(isTeacher) {
  const profileMenuItem = document.getElementById("btn-open-profile-menu");
  if (profileMenuItem) profileMenuItem.style.display = isTeacher ? "block" : "none";
  if (!isTeacher) {
    const dropdown = document.getElementById("user-dropdown");
    if (dropdown) dropdown.style.display = "none";
  }
}

/* ================= MODAL KONTROLÜ ================= */
const createModal = document.getElementById("create-task-modal");
const studentsModal = document.getElementById("students-modal");
const passwordModal = document.getElementById("password-modal");
const reportsModal = document.getElementById("reports-modal");
const tasksModal = document.getElementById("tasks-modal");
const taskStudentsModal = document.getElementById("task-students-modal");
const allTasksModal = document.getElementById("all-tasks-modal");
const classesModal = document.getElementById("classes-modal");
const profileModal = document.getElementById("profile-modal");
const myStatsModal = document.getElementById("my-stats-modal");
const certificatesModal = document.getElementById("certificates-modal");
const teacherCertificatesModal = document.getElementById("teacher-certificates-modal");
const contentModal = document.getElementById("content-modal");
const assignmentModal = document.getElementById("assignment-modal");
const addStudentModal = document.getElementById("add-student-modal");
const booksModal = document.getElementById("books-modal");
const approvalsModal = document.getElementById("approvals-modal");
const avatarShopModal = document.getElementById("avatar-shop-modal");

document.getElementById("btn-open-create").onclick = function() {
  if (userRole !== "teacher") return;
  populateTaskTargets();
  loadBooksForTeacher();
  if (createModal) createModal.style.display = "flex";
  document.getElementById("side-menu").style.width = "0";
};

window.switchActivityTab = function(tabName) {
  document.querySelectorAll('#activities-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase().includes(tabName === 'pending' ? 'bekleyen' : 'tamamlanan')) {
      btn.classList.add('active');
    }
  });
  document.getElementById('activity-pending').classList.toggle('active', tabName === 'pending');
  document.getElementById('activity-completed').classList.toggle('active', tabName === 'completed');
};

document.getElementById("btn-close-create").onclick = function() {
  if (createModal) createModal.style.display = "none";
};

document.getElementById("btn-open-students").onclick = function() {
  if (userRole !== "teacher") return;
  if (studentsModal) studentsModal.style.display = "flex";
  loadStudentsModal();
  document.getElementById("side-menu").style.width = "0";
};

document.getElementById("btn-close-students").onclick = function() {
  if (studentsModal) studentsModal.style.display = "none";
};

document.getElementById("btn-open-classes")?.addEventListener("click", async function() {
  if (userRole !== "teacher") return;
  if (classesModal) classesModal.style.display = "flex";
  await loadClassesModal();
  document.getElementById("side-menu").style.width = "0";
});

document.getElementById("btn-close-classes")?.addEventListener("click", function() {
  if (classesModal) classesModal.style.display = "none";
});

const resetAllStudentsPasswordsBtn = document.getElementById("btn-reset-all-students-passwords");
if (resetAllStudentsPasswordsBtn) {
  resetAllStudentsPasswordsBtn.onclick = async function() {
    if (userRole !== "teacher") return;
    const ok = await confirmDialog("Tüm öğrencilerin şifresi 123456 olarak sıfırlansın mı?");
    if (!ok) return;
    const btn = resetAllStudentsPasswordsBtn;
    const oldText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Sıfırlanıyor...";
    try {
      const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
      const allRows = [];
      studentsSnap.forEach((docSnap) => allRows.push({ id: docSnap.id, ...docSnap.data() }));
      const rows = getUniqueStudents(getTeacherManagedStudents(allRows));
      if (!rows.length) {
        showNotice("Sıfırlanacak öğrenci bulunamadı.", "#f39c12");
        return;
      }
      let success = 0;
      const failed = [];
      for (const student of rows) {
        try {
          await applyStudentPasswordUpdate(student, "123456", {
            currentPasswordHints: [String(student?.loginCardPassword || ""), "123456"]
          });
          success++;
        } catch (e) {
          const name = getUserDisplayName(student);
          failed.push(`${name}: ${getCallableErrorMessage(e)}`);
        }
      }
      await loadStudentsModal();
      if (failed.length === 0) {
        await infoDialog(`${success} öğrencinin şifresi 123456 olarak sıfırlandı.`, { okText: "Tamam" });
      } else {
        const sample = failed.slice(0, 8).join("\n");
        await infoDialog(
          `Toplu sıfırlama tamamlandı.\nBaşarılı: ${success}/${rows.length}\nBaşarısız: ${failed.length}\n\n${sample}`,
          { okText: "Tamam" }
        );
      }
    } catch (e) {
      showNotice("Toplu şifre sıfırlama başarısız: " + getCallableErrorMessage(e), "#e74c3c");
    } finally {
      btn.disabled = false;
      btn.innerText = oldText;
    }
  };
}

const deleteAllStudentsBtn = document.getElementById("btn-delete-all-students");
if (deleteAllStudentsBtn) {
  deleteAllStudentsBtn.onclick = async function() {
    if (userRole !== "teacher") return;
    const ok = await confirmDialog("Listendeki tüm öğrenciler silinsin mi? Bu işlem geri alınamaz.", {
      yesText: "Evet, Tümünü Sil",
      noText: "Vazgeç"
    });
    if (!ok) return;

    const btn = deleteAllStudentsBtn;
    const oldText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Siliniyor...";
    const hideOverlay = showBulkStudentsDeleteOverlay("Tüm öğrenciler siliniyor lütfen bekleyin...");

    try {
      const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
      const allRows = [];
      studentsSnap.forEach((docSnap) => allRows.push({ id: docSnap.id, ...docSnap.data() }));
      const rows = getUniqueStudents(getTeacherManagedStudents(allRows));
      if (!rows.length) {
        hideOverlay();
        await infoDialog("Silinecek öğrenci bulunamadı.", { okText: "Tamam" });
        return;
      }

      let success = 0;
      let authWarningCount = 0;
      const failed = [];
      for (const student of rows) {
        const shownPassword = String(student?.loginCardPassword || "").trim();
        try {
          const authDeleteResult = await deleteStudentAndLinkedData(student, {
            currentPasswordHints: [shownPassword, "123456"]
          });
          success++;
          if (!authDeleteResult?.authDeleted) authWarningCount++;
        } catch (e) {
          const name = getUserDisplayName(student);
          failed.push(`${name}: ${getCallableErrorMessage(e)}`);
        }
      }

      await loadStudentsModal();
      hideOverlay();
      if (failed.length === 0) {
        await infoDialog(
          `Toplu silme tamamlandı.\nSilinen öğrenci: ${success}\nAuth uyarısı: ${authWarningCount}`,
          { okText: "Tamam" }
        );
      } else {
        const sample = failed.slice(0, 8).join("\n");
        await infoDialog(
          `Toplu silme tamamlandı.\nBaşarılı: ${success}/${rows.length}\nBaşarısız: ${failed.length}\nAuth uyarısı: ${authWarningCount}\n\n${sample}`,
          { okText: "Tamam" }
        );
      }
    } catch (e) {
      hideOverlay();
      showNotice("Toplu silme başarısız: " + getCallableErrorMessage(e), "#e74c3c");
    } finally {
      btn.disabled = false;
      btn.innerText = oldText;
    }
  };
}

document.getElementById("btn-open-add-student").onclick = function() {
  if (userRole !== "teacher") return;
  if (addStudentModal) addStudentModal.style.display = "flex";
  document.getElementById("side-menu").style.width = "0";
};

document.getElementById("btn-close-add-student").onclick = function() {
  if (addStudentModal) addStudentModal.style.display = "none";
};

document.getElementById("btn-open-books").onclick = function() {
  if (userRole !== "teacher") return;
  if (booksModal) booksModal.style.display = "flex";
  loadBooksForTeacher();
  document.getElementById("side-menu").style.width = "0";
};

document.getElementById("btn-close-books").onclick = function() {
  if (booksModal) booksModal.style.display = "none";
};

document.getElementById("btn-open-approvals").onclick = function() {
  if (userRole !== "teacher") return;
  if (approvalsModal) approvalsModal.style.display = "flex";
  loadApprovalsModal();
  document.getElementById("side-menu").style.width = "0";
};

document.getElementById("btn-close-approvals").onclick = function() {
  if (approvalsModal) approvalsModal.style.display = "none";
};

document.getElementById("btn-open-tasks").onclick = function() {
  if (userRole !== "teacher") return;
  if (tasksModal) tasksModal.style.display = "flex";
  loadTasksModal();
  document.getElementById("side-menu").style.width = "0";
};

document.getElementById("btn-close-tasks").onclick = function() {
  if (tasksModal) tasksModal.style.display = "none";
};

document.getElementById("btn-close-task-students").onclick = function() {
  if (taskStudentsModal) taskStudentsModal.style.display = "none";
};

document.getElementById("btn-show-all-tasks").onclick = function() {
  openAllItemsModal(homeListCache.tasks.title, homeListCache.tasks.pending, homeListCache.tasks.completed);
};

document.getElementById("btn-close-all-tasks").onclick = function() {
  if (allTasksModal) allTasksModal.style.display = "none";
};

document.getElementById("btn-open-reports").onclick = function() {
  if (userRole !== "teacher") return;
  if (reportsModal) reportsModal.style.display = "flex";
  loadReportsModal();
  document.getElementById("side-menu").style.width = "0";
};

document.getElementById("btn-close-reports").onclick = function() {
  if (reportsModal) reportsModal.style.display = "none";
};
document.getElementById("btn-open-login-cards")?.addEventListener("click", async function() {
  if (userRole !== "teacher") return;
  const modal = document.getElementById("login-cards-modal");
  if (!modal) return;
  modal.style.display = "flex";
  await loadLoginCardsModal();
  document.getElementById("side-menu").style.width = "0";
});
document.getElementById("btn-close-login-cards")?.addEventListener("click", function() {
  const modal = document.getElementById("login-cards-modal");
  if (modal) modal.style.display = "none";
});
document.getElementById("btn-print-login-cards")?.addEventListener("click", function() {
  if (userRole !== "teacher") return;
  openLoginCardsPrintPreview();
});
document.getElementById("login-cards-modal")?.addEventListener("click", function(e) {
  if (e.target?.id === "login-cards-modal") {
    const modal = document.getElementById("login-cards-modal");
    if (modal) modal.style.display = "none";
  }
});
document.getElementById("btn-open-avatar-shop")?.addEventListener("click", function () {
  if (userRole !== "student") return;
  openAvatarShopModal();
  document.getElementById("side-menu").style.width = "0";
});
document.getElementById("user-header-avatar")?.addEventListener("click", function (e) {
  if (userRole !== "student") return;
  e.stopPropagation();
  const dropdown = document.getElementById("user-dropdown");
  if (dropdown) dropdown.style.display = "none";
  openAvatarShopModal();
});
document.getElementById("btn-close-avatar-shop")?.addEventListener("click", closeAvatarShopModal);
document.getElementById("avatar-shop-grid")?.addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const btn = target.closest("[data-avatar-id]");
  if (!(btn instanceof HTMLElement)) return;
  const avatarId = btn.getAttribute("data-avatar-id");
  const action = btn.getAttribute("data-avatar-action");
  if (!avatarId || !action) return;
  await handleAvatarAction(avatarId, action);
});
avatarShopModal?.addEventListener("click", (e) => {
  if (e.target?.id === "avatar-shop-modal") closeAvatarShopModal();
});
document.getElementById("student-ai-fab")?.addEventListener("click", () => {
  if (studentAiOpen) {
    closeStudentAiPanel();
  } else {
    openStudentAiPanel();
  }
});
document.getElementById("student-ai-close")?.addEventListener("click", closeStudentAiPanel);
document.getElementById("student-ai-send")?.addEventListener("click", () => {
  const input = document.getElementById("student-ai-input");
  const text = String(input?.value || "").trim();
  if (!text) return;
  askStudentAi(text);
  if (input) input.value = "";
});
document.getElementById("student-ai-input")?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.shiftKey) return;
  e.preventDefault();
  const input = document.getElementById("student-ai-input");
  const text = String(input?.value || "").trim();
  if (!text) return;
  askStudentAi(text);
  if (input) input.value = "";
});
document.getElementById("student-ai-panel")?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const quickBtn = target.closest("[data-ai-quick]");
  if (!(quickBtn instanceof HTMLElement)) return;
  const q = quickBtn.getAttribute("data-ai-quick") || "";
  if (!q) return;
  askStudentAi(q);
});
document.addEventListener("click", (e) => {
  if (!studentAiOpen) return;
  const { panel, fab } = getStudentAiEls();
  const target = e.target;
  if (!(target instanceof Node)) return;
  if (panel?.contains(target)) return;
  if (fab?.contains(target)) return;
  closeStudentAiPanel();
});

document.getElementById("btn-open-leaderboard-modal")?.addEventListener("click", function() {
  const modal = document.getElementById("leaderboard-modal");
  if (!modal) return;
  modal.style.display = "flex";
  populateLeaderboardFilters(leaderboardRowsCache);
  renderLeaderboardModalList();
});
document.getElementById("btn-close-leaderboard-modal")?.addEventListener("click", function() {
  const modal = document.getElementById("leaderboard-modal");
  if (modal) modal.style.display = "none";
});
document.getElementById("leaderboard-filter-class")?.addEventListener("change", () => {
  updateLeaderboardSectionFilterOptions();
  renderLeaderboardModalList();
});
document.getElementById("leaderboard-filter-section")?.addEventListener("change", renderLeaderboardModalList);

const legacyProfileBtn = document.getElementById("btn-open-profile");
if (legacyProfileBtn) {
  legacyProfileBtn.onclick = function() {
    if (userRole !== "teacher") return;
    if (profileModal) profileModal.style.display = "flex";
    const input = document.getElementById("profile-username");
    if (input) input.value = userData?.username || "";
    const firstInput = document.getElementById("profile-firstname");
    if (firstInput) firstInput.value = userData?.firstName || "";
    const lastInput = document.getElementById("profile-lastname");
    if (lastInput) lastInput.value = userData?.lastName || "";
  };
}
const profileMenuBtn = document.getElementById("btn-open-profile-menu");
if (profileMenuBtn) {
  profileMenuBtn.onclick = function() {
    if (userRole !== "teacher") return;
    if (profileModal) profileModal.style.display = "flex";
    const input = document.getElementById("profile-username");
    if (input) input.value = userData?.username || "";
    const firstInput = document.getElementById("profile-firstname");
    if (firstInput) firstInput.value = userData?.firstName || "";
    const lastInput = document.getElementById("profile-lastname");
    if (lastInput) lastInput.value = userData?.lastName || "";
    const dropdown = document.getElementById("user-dropdown");
    if (dropdown) dropdown.style.display = "none";
  };
}

document.getElementById("btn-open-content").onclick = function() {
  if (!contentModal) return;
  contentModal.style.display = "flex";
  const left = document.querySelector("#content-modal .content-left");
  if (left) left.style.display = "block";
  loadContents();
  document.getElementById("side-menu").style.width = "0";
};

const openFlowchartBtn = document.getElementById("btn-open-flowchart-app");
if (openFlowchartBtn) {
  openFlowchartBtn.onclick = function() {
    if (userRole !== "teacher") return;
    openFlowchartModal();
    document.getElementById("side-menu").style.width = "0";
  };
}
initFlowchartEditor();

function getStudentAiEls() {
  return {
    fab: document.getElementById("student-ai-fab"),
    panel: document.getElementById("student-ai-panel"),
    messages: document.getElementById("student-ai-messages"),
    input: document.getElementById("student-ai-input")
  };
}

function isStudentTaskCompleted(taskId) {
  const row = completedTasks.get(taskId);
  if (!row) return false;
  if (typeof row === "boolean") return row;
  if (typeof row === "number") return row > 0;
  if (typeof row === "object") {
    if (row.approved === true || row.completed === true || row.status === "approved") return true;
    if (Number(row.correctAnswers || 0) > 0 || Number(row.percent || 0) >= 100) return true;
  }
  return false;
}

function getStudentAiContext() {
  const tasks = (allTasks || []).filter((t) => !t?.isDeleted && taskMatchesStudent(t));
  const activities = (contentAssignments || []).filter((a) => !a?.isDeleted && assignmentMatchesStudent(a));
  const blockItems = (blockAssignments || []).filter((a) => !a?.isDeleted && blockAssignmentMatchesStudent(a));
  const computeItems = (computeAssignments || []).filter((a) => !a?.isDeleted && computeAssignmentMatchesStudent(a));
  const lessonItems = (lessons || []).filter((l) => !l?.isDeleted && lessonMatchesStudent(l));
  const taskCompleted = tasks.filter((t) => isStudentTaskCompleted(t.id)).length;
  const activityCompleted = activities.filter((a) => {
    const p = getAssignmentAppProgress(a);
    return Math.max(0, Number(p?.percent || 0)) >= 100;
  }).length;
  const blockCompleted = blockItems.filter((a) => {
    const p = blockAssignmentProgressMap.get(a.id) || {};
    return !!p.completed || Math.max(0, Number(p.percent || 0)) >= 100;
  }).length;
  const computeCompleted = computeItems.filter((a) => {
    const p = computeAssignmentProgressMap.get(a.id) || {};
    return isComputeProgressCompleted(p, a);
  }).length;
  const xpFromHeader = parseXPValue(String(document.getElementById("user-xp")?.innerText || "0"));
  const xp = Math.max(0, Number(userData?.xp || 0), xpFromHeader);
  return {
    tasks,
    activities,
    blockItems,
    computeItems,
    lessonItems,
    taskCompleted,
    activityCompleted,
    blockCompleted,
    computeCompleted,
    xp
  };
}

function findStudentAiMatches(question, ctx) {
  const tokens = String(question || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9ığüşöç\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  if (!tokens.length) return [];
  const rows = [];
  const pushRows = (arr, kind, titleKey = "title") => {
    arr.forEach((item) => {
      const title = String(item?.[titleKey] || "");
      const q = String(item?.question || item?.flowQuestion || "");
      const src = `${title} ${q}`.toLocaleLowerCase("tr-TR");
      const hit = tokens.some((t) => src.includes(t));
      if (hit) rows.push({ kind, title, q });
    });
  };
  pushRows(ctx.tasks, "Ödev");
  pushRows(ctx.activities, "Etkinlik");
  pushRows(ctx.blockItems, "Blok");
  pushRows(ctx.computeItems, "Compute");
  pushRows(ctx.lessonItems, "Ders");
  return rows.slice(0, 6);
}

function buildStudentAiReply(question) {
  const q = String(question || "").trim();
  const ql = q.toLocaleLowerCase("tr-TR");
  const ctx = getStudentAiContext();
  if (!q) return "Sorunu yazarsan bu platformdaki içeriklerine göre yardımcı olurum.";
  if (/(merhaba|selam|naber|iyi misin)/i.test(ql)) {
    return "Merhaba. Ödev, etkinlik, blok kodlama, compute it, ders içerikleri ve XP durumun hakkında yardımcı olabilirim.";
  }
  if (/(xp|puan|seviye puan)/i.test(ql)) {
    return `Toplam XP: ${ctx.xp}.\nİstersen hangi ödevlerden XP kazanabileceğini de listeleyebilirim.`;
  }
  if (/(ödev|odev|task)/i.test(ql) && !/(blok|compute|flow|3d)/i.test(ql)) {
    const pending = Math.max(0, ctx.tasks.length - ctx.taskCompleted);
    const titles = ctx.tasks.slice(0, 5).map((t) => `- ${t.title || "Ödev"}`).join("\n");
    return `Ödevlerin: ${ctx.tasks.length} adet.\nTamamlanan: ${ctx.taskCompleted}\nBekleyen: ${pending}\n${titles || "- Şu an atanmış ödev görünmüyor."}`;
  }
  if (/(etkinlik|icerik|içerik|uygulama)/i.test(ql)) {
    const pending = Math.max(0, ctx.activities.length - ctx.activityCompleted);
    const titles = ctx.activities.slice(0, 5).map((a) => `- ${a.title || "Etkinlik"}`).join("\n");
    return `Etkinliklerin: ${ctx.activities.length} adet.\nTamamlanan: ${ctx.activityCompleted}\nBekleyen: ${pending}\n${titles || "- Şu an atanmış etkinlik görünmüyor."}`;
  }
  if (/(blok|3d|flowchart|akis|akış)/i.test(ql)) {
    const block2D = ctx.blockItems.filter((a) => getBlockHomeworkType(a.assignmentType) === "block2d").length;
    const block3D = ctx.blockItems.filter((a) => getBlockHomeworkType(a.assignmentType) === "block3d").length;
    const flowchart = ctx.blockItems.filter((a) => getBlockHomeworkType(a.assignmentType) === "flowchart").length;
    return `Blok kodlama ödevlerin: ${ctx.blockItems.length} adet.\n2D: ${block2D}, 3D: ${block3D}, Flowchart: ${flowchart}\nTamamlanan toplam blok ödevi: ${ctx.blockCompleted}`;
  }
  if (/(compute|compute it)/i.test(ql)) {
    const pending = Math.max(0, ctx.computeItems.length - ctx.computeCompleted);
    const titles = ctx.computeItems.slice(0, 5).map((a) => `- ${a.title || "Compute It Ödevi"}`).join("\n");
    return `Compute It ödevlerin: ${ctx.computeItems.length} adet.\nTamamlanan: ${ctx.computeCompleted}\nBekleyen: ${pending}\n${titles || "- Şu an compute ödevi görünmüyor."}`;
  }
  if (/(ders|konu|slayt)/i.test(ql)) {
    const titles = ctx.lessonItems.slice(0, 7).map((l) => `- ${l.title || "Ders"}`).join("\n");
    return `Ders içeriklerin: ${ctx.lessonItems.length} adet.\n${titles || "- Henüz ders içeriği atanmadı."}`;
  }
  const matches = findStudentAiMatches(q, ctx);
  if (matches.length) {
    const list = matches.map((m) => `- [${m.kind}] ${m.title || m.q || "İçerik"}`).join("\n");
    return `Soruna yakın içerikler buldum:\n${list}`;
  }
  return "Bu asistan sadece platformdaki ödev, etkinlik, blok kodlama, compute it, flowchart, ders ve XP verilerine göre yanıt verir. Bu başlıklarda daha net bir soru yazabilirsin.";
}

function renderStudentAiMessages() {
  const { messages } = getStudentAiEls();
  if (!messages) return;
  messages.innerHTML = studentAiMessages.map((m) => {
    const cls = m.role === "user" ? "user" : "bot";
    return `<div class="edu-ai-msg ${cls}">${escapeHtml(m.text || "")}</div>`;
  }).join("");
  messages.scrollTop = messages.scrollHeight;
}

function addStudentAiMessage(role, text) {
  const id = `ai_${studentAiMsgSeq++}`;
  studentAiMessages.push({ id, role, text: String(text || "") });
  if (studentAiMessages.length > 60) {
    studentAiMessages = studentAiMessages.slice(studentAiMessages.length - 60);
  }
  renderStudentAiMessages();
  return id;
}

function updateStudentAiMessage(messageId, text) {
  const idx = studentAiMessages.findIndex((m) => String(m.id) === String(messageId));
  if (idx < 0) return;
  studentAiMessages[idx] = { ...studentAiMessages[idx], text: String(text || "") };
  renderStudentAiMessages();
}

function buildStudentAiRemoteContext() {
  const ctx = getStudentAiContext();
  return {
    user: {
      className: String(userData?.className || ""),
      section: String(userData?.section || ""),
      xp: Math.max(0, Number(ctx.xp || 0))
    },
    stats: {
      tasksTotal: ctx.tasks.length,
      tasksCompleted: ctx.taskCompleted,
      activitiesTotal: ctx.activities.length,
      activitiesCompleted: ctx.activityCompleted,
      blockTotal: ctx.blockItems.length,
      blockCompleted: ctx.blockCompleted,
      computeTotal: ctx.computeItems.length,
      computeCompleted: ctx.computeCompleted,
      lessonTotal: ctx.lessonItems.length
    },
    items: {
      tasks: ctx.tasks.slice(0, 12).map((v) => String(v?.title || "Ödev")),
      activities: ctx.activities.slice(0, 12).map((v) => String(v?.title || "Etkinlik")),
      block: ctx.blockItems.slice(0, 12).map((v) => String(v?.title || "Blok Kodlama")),
      compute: ctx.computeItems.slice(0, 12).map((v) => String(v?.title || "Compute It")),
      lessons: ctx.lessonItems.slice(0, 12).map((v) => String(v?.title || "Ders"))
    }
  };
}

async function fetchStudentAiRemoteReply(question) {
  if (!currentUserId || userRole !== "student") return "";
  try {
    if (!studentAiAssistantCallable) {
      studentAiAssistantCallable = httpsCallable(functions, "studentAiAssistant");
    }
    const payload = {
      question: String(question || "").slice(0, 1200),
      context: buildStudentAiRemoteContext()
    };
    const res = await studentAiAssistantCallable(payload);
    const answer = String(res?.data?.answer || res?.data?.text || "").trim();
    return answer;
  } catch (e) {
    return "";
  }
}

async function askStudentAi(question) {
  const q = String(question || "").trim();
  if (!q) return;
  addStudentAiMessage("user", q);
  const waitId = addStudentAiMessage("bot", "Düşünüyorum...");
  const remoteReply = await fetchStudentAiRemoteReply(q);
  const reply = remoteReply || buildStudentAiReply(q);
  updateStudentAiMessage(waitId, reply);
}

function openStudentAiPanel() {
  if (userRole !== "student") return;
  const { panel, input } = getStudentAiEls();
  if (!panel) return;
  studentAiOpen = true;
  panel.style.display = "flex";
  if (studentAiMessages.length === 0) {
    addStudentAiMessage("bot", "Merhaba, ben platform asistanın. İçeriklerinle ilgili sorularını sorabilirsin.");
  } else {
    renderStudentAiMessages();
  }
  if (input) input.focus();
}

function closeStudentAiPanel() {
  const { panel } = getStudentAiEls();
  studentAiOpen = false;
  if (panel) panel.style.display = "none";
}

function setStudentAiVisibility() {
  const { fab, panel } = getStudentAiEls();
  const visible = userRole === "student" && !!currentUserId;
  if (fab) fab.style.display = visible ? "inline-flex" : "none";
  if (!visible && panel) {
    panel.style.display = "none";
    studentAiOpen = false;
  }
}

const openLiveQuizMenuBtn = document.getElementById("btn-open-live-quiz");
if (openLiveQuizMenuBtn) {
  openLiveQuizMenuBtn.onclick = function() {
    if (userRole !== "teacher") return;
    openLiveQuizModal();
    document.getElementById("side-menu").style.width = "0";
  };
}
const openLiveQuizHomeBtn = document.getElementById("btn-open-live-quiz-home");
if (openLiveQuizHomeBtn) {
  openLiveQuizHomeBtn.onclick = function() {
    if (userRole !== "teacher") return;
    openLiveQuizModal();
  };
}
const closeLiveQuizBtn = document.getElementById("btn-close-live-quiz");
if (closeLiveQuizBtn) closeLiveQuizBtn.onclick = closeLiveQuizModal;

document.getElementById("tab-live-quiz-create")?.addEventListener("click", () => {
  setLiveQuizTab("create");
});
document.getElementById("tab-live-quiz-start")?.addEventListener("click", () => {
  setLiveQuizTab("start");
});
document.getElementById("tab-live-quiz-results")?.addEventListener("click", () => {
  setLiveQuizTab("results");
});

document.getElementById("btn-add-live-quiz-question")?.addEventListener("click", () => {
  liveQuizSelectedQuestionIndex = -1;
  ["live-q-text","live-q-a","live-q-b","live-q-c","live-q-d","live-q-correct","live-q-match-pairs"].forEach((id) => {
    const el = document.getElementById(id); if (el) el.value = "";
  });
  setLiveQuizImagePreview("");
  const imgInput = document.getElementById("live-q-image");
  if (imgInput) imgInput.value = "";
  const t = document.getElementById("live-q-type");
  if (t) t.value = "multiple";
  updateLiveQuizEditorForType();
  const qDuration = document.getElementById("live-q-duration");
  if (qDuration) qDuration.value = "30";
  const qXp = document.getElementById("live-q-xp");
  if (qXp) qXp.value = String(MAX_QUESTION_XP);
  renderLiveQuizBuilderPreview();
  renderLiveQuizQuestionList();
});

document.getElementById("btn-save-live-quiz-question")?.addEventListener("click", () => {
  const type = document.getElementById("live-q-type")?.value || "multiple";
  const question = (document.getElementById("live-q-text")?.value || "").trim();
  if (!question) return showNotice("Soru metni gerekli.", "#e74c3c");
  const rawDurationSec = Number(document.getElementById("live-q-duration")?.value || 30);
  const durationSec = Math.max(5, Number.isFinite(rawDurationSec) ? rawDurationSec : 30);
  const xp = Math.max(0, Number(document.getElementById("live-q-xp")?.value ?? MAX_QUESTION_XP));
  const payload = { type, question, imageDataUrl: currentLiveQuizImageDataUrl || "", options: [], pairs: [], correct: "", durationSec, xp };
  if (type === "truefalse") {
    payload.options = ["doğru", "yanlış"];
    payload.correct = (document.getElementById("live-q-correct")?.value || "").trim().toLowerCase();
    if (!["doğru","yanlış"].includes(payload.correct)) return showNotice("Doğru cevap doğru/yanlış olmalı.", "#e74c3c");
  } else if (type === "matching") {
    const pairsText = document.getElementById("live-q-match-pairs")?.value || "";
    const pairs = parseLiveMatchingPairsFromText(pairsText);
    if (pairs.length < 2) return showNotice("Eşleştirme için en az 2 satır girin (Sol = Sağ).", "#e74c3c");
    payload.pairs = pairs;
    payload.options = pairs.map((p) => p.right);
    payload.correct = "";
  } else {
    const opts = ["live-q-a","live-q-b","live-q-c","live-q-d"].map((id) => (document.getElementById(id)?.value || "").trim()).filter(Boolean);
    if (opts.length < 2) return showNotice("En az 2 seçenek gerekli.", "#e74c3c");
    const corr = (document.getElementById("live-q-correct")?.value || "").trim().toUpperCase();
    if (!["A","B","C","D"].includes(corr)) return showNotice("Doğru seçenek A/B/C/D olmalı.", "#e74c3c");
    payload.options = opts;
    payload.correct = corr;
  }
  if (liveQuizSelectedQuestionIndex >= 0) liveQuizItems[liveQuizSelectedQuestionIndex] = payload;
  else {
    liveQuizItems.push(payload);
    liveQuizSelectedQuestionIndex = liveQuizItems.length - 1;
  }
  renderLiveQuizBuilderPreview();
  renderLiveQuizQuestionList();
  showNotice("Soru kaydedildi.", "#2ecc71");
});

document.getElementById("live-q-image")?.addEventListener("change", async (ev) => {
  const input = ev.target;
  if (!(input instanceof HTMLInputElement)) return;
  const file = input.files && input.files[0];
  if (!file) {
    setLiveQuizImagePreview("");
    renderLiveQuizBuilderPreview();
    return;
  }
  const dataUrl = await readLiveQuizImageFile(file);
  if (!dataUrl) return;
  setLiveQuizImagePreview(dataUrl);
  renderLiveQuizBuilderPreview();
});

["live-q-text","live-q-type","live-q-a","live-q-b","live-q-c","live-q-d","live-q-correct","live-q-duration","live-q-xp","live-q-match-pairs"].forEach((id) => {
  document.getElementById(id)?.addEventListener("input", renderLiveQuizBuilderPreview);
});
document.getElementById("live-q-type")?.addEventListener("change", () => {
  updateLiveQuizEditorForType();
  renderLiveQuizBuilderPreview();
});

document.getElementById("btn-save-live-quiz")?.addEventListener("click", saveLiveQuiz);
document.getElementById("btn-delete-live-quiz")?.addEventListener("click", deleteLiveQuiz);
document.getElementById("btn-download-teacher-quiz-results")?.addEventListener("click", openTeacherQuizResultsReport);
document.getElementById("btn-download-teacher-quiz-results-modal")?.addEventListener("click", openTeacherQuizResultsReport);
document.getElementById("btn-open-teacher-live-monitor")?.addEventListener("click", openTeacherLiveMonitor);
document.getElementById("btn-close-teacher-live-monitor")?.addEventListener("click", closeTeacherLiveMonitor);
document.getElementById("btn-teacher-live-monitor-refresh")?.addEventListener("click", () => renderTeacherLiveMonitor(activeLiveSession));
document.getElementById("btn-live-session-lock")?.addEventListener("click", teacherToggleLiveLock);
document.getElementById("btn-live-session-next")?.addEventListener("click", teacherNextLiveQuestion);
document.getElementById("btn-live-session-end")?.addEventListener("click", teacherEndLiveSession);
document.getElementById("btn-join-live-quiz")?.addEventListener("click", () => {
  const invite = document.getElementById("live-quiz-invite");
  if (invite) invite.style.display = "none";
  openLivePlayer();
});
document.getElementById("btn-close-live-invite")?.addEventListener("click", () => {
  const invite = document.getElementById("live-quiz-invite");
  if (invite) invite.style.display = "none";
});
document.getElementById("btn-close-live-player")?.addEventListener("click", closeLivePlayer);

const closeLessonBuilderBtn = document.getElementById("btn-close-lesson-builder");
if (closeLessonBuilderBtn) closeLessonBuilderBtn.onclick = closeLessonBuilderModal;

const themeToggleAppBtn = document.getElementById("theme-toggle-app");
if (themeToggleAppBtn) {
  themeToggleAppBtn.onclick = function () {
    const isDark = document.body.classList.contains("dark-mode");
    applyThemeMode(isDark ? "light" : "dark");
  };
}
try {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyThemeMode(savedTheme);
} catch {
  applyThemeMode("light");
}

const addLessonSlideBtn = document.getElementById("btn-add-lesson-slide");
if (addLessonSlideBtn) {
  addLessonSlideBtn.onclick = function () {
    syncCurrentLessonSlideFromForm();
    lessonDraft.slides.push({ id: `s_${Date.now()}`, type: "content", title: "", content: "", imageUrl: "", layout: "text" });
    selectedLessonSlideIndex = lessonDraft.slides.length - 1;
    applyThemeToSlide(lessonDraft.slides[selectedLessonSlideIndex], selectedLessonThemeId || LESSON_THEME_TEMPLATES[0].id);
    renderLessonSlideList();
    fillLessonSlideForm();
  };
}

const slideTypeEl = document.getElementById("slide-type");
if (slideTypeEl) {
  slideTypeEl.onchange = function () {
    const qArea = document.getElementById("slide-question-area");
    const cArea = document.getElementById("slide-content-area");
    const isQuestion = this.value === "question" || this.value === "mixed";
    if (qArea) qArea.style.display = isQuestion ? "block" : "none";
    if (cArea) cArea.style.display = "block";
    updateLessonSlidePreview();
  };
}

document.querySelectorAll("[data-lesson-cmd]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cmd = btn.getAttribute("data-lesson-cmd");
    const editor = document.getElementById("slide-content-editor");
    if (!editor || !cmd) return;
    editor.focus();
    document.execCommand(cmd, false, null);
    updateLessonSlidePreview();
  });
});

const insertLessonImageBtn = document.getElementById("btn-lesson-insert-image");
if (insertLessonImageBtn) {
  insertLessonImageBtn.onclick = function () {
    const url = (document.getElementById("slide-image-url")?.value || "").trim() || prompt("Görsel URL girin:");
    if (!url) return;
    const editor = document.getElementById("slide-content-editor");
    if (!editor) return;
    editor.focus();
    document.execCommand("insertImage", false, url);
    updateLessonSlidePreview();
  };
}

["slide-title","slide-image-url","slide-video-url","slide-layout","slide-question","slide-question-type","slide-opt-1","slide-opt-2","slide-opt-3","slide-opt-4","slide-correct"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", updateLessonSlidePreview);
});
const slideLayoutEl = document.getElementById("slide-layout");
if (slideLayoutEl) {
  slideLayoutEl.addEventListener("change", () => {
    renderLessonCanvasEditor();
    updateLessonSlidePreview();
  });
}
const slideFillAnswersEl = document.getElementById("slide-fill-answers");
if (slideFillAnswersEl) slideFillAnswersEl.addEventListener("input", updateLessonSlidePreview);
const qTypeEl = document.getElementById("slide-question-type");
if (qTypeEl) {
  qTypeEl.addEventListener("change", () => {
    updateLessonQuestionTypeUI();
    updateLessonSlidePreview();
  });
}
const slideContentEditorEl = document.getElementById("slide-content-editor");
if (slideContentEditorEl) slideContentEditorEl.addEventListener("input", updateLessonSlidePreview);
const slideImageFileEl = document.getElementById("slide-image-file");
if (slideImageFileEl) {
  slideImageFileEl.addEventListener("change", async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      const urlInput = document.getElementById("slide-image-url");
      if (urlInput) urlInput.value = dataUrl;
      updateLessonSlidePreview();
    } catch (err) {
      showNotice("Görsel okunamadı.", "#e74c3c");
    }
  });
}
const lessonBgFileEl = document.getElementById("lesson-bg-file");
if (lessonBgFileEl) {
  lessonBgFileEl.addEventListener("change", async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      const bgInput = document.getElementById("lesson-bg");
      if (bgInput) bgInput.value = dataUrl;
    } catch (err) {
      showNotice("Arka plan görseli okunamadı.", "#e74c3c");
    }
  });
}
const addCanvasTextBtn = document.getElementById("btn-add-canvas-text");
if (addCanvasTextBtn) {
  addCanvasTextBtn.addEventListener("click", async () => {
    const text = await openLessonTextModal({
      title: "Metin Ekle",
      value: "Yeni metin",
      placeholder: "Ekrana eklenecek metni yazın"
    });
    if (text === null) return;
    lessonCanvasElements.push({
      id: `t_${Date.now()}_${Math.random().toString(16).slice(2, 5)}`,
      type: "text",
      text: String(text || "Yeni metin"),
      x: 12,
      y: 12,
      w: 220,
      h: 90
    });
    document.getElementById("slide-layout").value = "canvas";
    renderLessonCanvasEditor();
    updateLessonSlidePreview();
  });
}
const deleteSelectedCanvasTextBtn = document.getElementById("btn-delete-selected-canvas-text");
if (deleteSelectedCanvasTextBtn) {
  deleteSelectedCanvasTextBtn.addEventListener("click", () => {
    if (!selectedLessonCanvasElementId) return;
    const idx = lessonCanvasElements.findIndex((x) => x.id === selectedLessonCanvasElementId && x.type === "text");
    if (idx < 0) return;
    lessonCanvasElements.splice(idx, 1);
    selectedLessonCanvasElementId = null;
    renderLessonCanvasEditor();
    updateLessonSlidePreview();
  });
}
const deleteAllCanvasTextBtn = document.getElementById("btn-delete-all-canvas-text");
if (deleteAllCanvasTextBtn) {
  deleteAllCanvasTextBtn.addEventListener("click", () => {
    lessonCanvasElements = lessonCanvasElements.filter((x) => x.type !== "text");
    selectedLessonCanvasElementId = null;
    renderLessonCanvasEditor();
    updateLessonSlidePreview();
  });
}
const addCanvasImageBtn = document.getElementById("btn-add-canvas-image");
if (addCanvasImageBtn) {
  addCanvasImageBtn.addEventListener("click", async () => {
    let src = prompt("Görsel URL girin (boş bırakıp dosya seçebilirsiniz):", "") || "";
    src = src.trim();
    if (!src) {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      const file = await new Promise((resolve) => {
        fileInput.onchange = () => resolve(fileInput.files?.[0] || null);
        fileInput.click();
      });
      if (file) src = await readFileAsDataURL(file);
    }
    if (!src) return;
    lessonCanvasElements.push({
      id: `i_${Date.now()}_${Math.random().toString(16).slice(2, 5)}`,
      type: "image",
      src,
      x: 18,
      y: 18,
      w: 220,
      h: 140
    });
    document.getElementById("slide-layout").value = "canvas";
    renderLessonCanvasEditor();
    updateLessonSlidePreview();
  });
}
const lessonTextOkBtn = document.getElementById("btn-lesson-text-ok");
if (lessonTextOkBtn) {
  lessonTextOkBtn.addEventListener("click", () => {
    const input = document.getElementById("lesson-text-modal-input");
    closeLessonTextModal(input ? input.value : "");
  });
}
const lessonTextCancelBtn = document.getElementById("btn-lesson-text-cancel");
if (lessonTextCancelBtn) {
  lessonTextCancelBtn.addEventListener("click", () => closeLessonTextModal(null));
}
const lessonTextModal = document.getElementById("lesson-text-modal");
if (lessonTextModal) {
  lessonTextModal.addEventListener("click", (e) => {
    if (e.target === lessonTextModal) closeLessonTextModal(null);
  });
}
const applyThemeSlideBtn = document.getElementById("btn-apply-theme-slide");
if (applyThemeSlideBtn) {
  applyThemeSlideBtn.addEventListener("click", () => {
    if (selectedLessonSlideIndex < 0 || !lessonDraft.slides[selectedLessonSlideIndex]) return;
    syncCurrentLessonSlideFromForm();
    applyThemeToSlide(lessonDraft.slides[selectedLessonSlideIndex], selectedLessonThemeId || LESSON_THEME_TEMPLATES[0].id);
    renderLessonSlideList();
    fillLessonSlideForm();
  });
}
const applyThemeAllBtn = document.getElementById("btn-apply-theme-all");
if (applyThemeAllBtn) {
  applyThemeAllBtn.addEventListener("click", () => {
    if (!Array.isArray(lessonDraft.slides) || !lessonDraft.slides.length) return;
    syncCurrentLessonSlideFromForm();
    lessonDraft.slides = lessonDraft.slides.map((slide) => applyThemeToSlide(slide, selectedLessonThemeId || LESSON_THEME_TEMPLATES[0].id));
    renderLessonSlideList();
    fillLessonSlideForm();
  });
}

const saveSlideBtn = document.getElementById("btn-save-slide");
if (saveSlideBtn) {
  saveSlideBtn.onclick = function () {
    if (selectedLessonSlideIndex < 0) return;
    lessonDraft.slides[selectedLessonSlideIndex] = readLessonSlideForm();
    renderLessonSlideList();
    updateLessonSlidePreview();
    showNotice("Slide kaydedildi.", "#2ecc71");
  };
}

function setLessonEditorType(type, layout) {
  const typeEl = document.getElementById("slide-type");
  const layoutEl = document.getElementById("slide-layout");
  if (typeEl && type) {
    typeEl.value = type;
    typeEl.dispatchEvent(new Event("change"));
  }
  if (layoutEl && layout) {
    layoutEl.value = layout;
    layoutEl.dispatchEvent(new Event("change"));
  }
  if (typeof updateLessonQuestionTypeUI === "function") updateLessonQuestionTypeUI();
  updateLessonSlidePreview();
}

const quickTextBtn = document.getElementById("btn-lesson-quick-text");
if (quickTextBtn) {
  quickTextBtn.addEventListener("click", () => {
    setLessonEditorType("content", "text");
    const editor = document.getElementById("slide-content-editor");
    if (editor) editor.focus();
  });
}

const quickImageBtn = document.getElementById("btn-lesson-quick-image");
if (quickImageBtn) {
  quickImageBtn.addEventListener("click", () => {
    setLessonEditorType("content", "split");
    const imageInput = document.getElementById("slide-image-file");
    if (imageInput) imageInput.click();
  });
}

const quickQuestionBtn = document.getElementById("btn-lesson-quick-question");
if (quickQuestionBtn) {
  quickQuestionBtn.addEventListener("click", () => {
    setLessonEditorType("question", "text");
    const questionInput = document.getElementById("slide-question");
    if (questionInput) questionInput.focus();
  });
}

function setTeacherLessonFilterUI() {
  const map = [
    { id: "btn-teacher-lessons-filter-all", key: "all", activeBg: "#2563eb", activeColor: "#fff", idleBg: "#e2e8f0", idleColor: "#0f172a" },
    { id: "btn-teacher-lessons-filter-draft", key: "draft", activeBg: "#fb923c", activeColor: "#fff", idleBg: "#fff7ed", idleColor: "#9a3412" },
    { id: "btn-teacher-lessons-filter-published", key: "published", activeBg: "#22c55e", activeColor: "#fff", idleBg: "#dcfce7", idleColor: "#166534" }
  ];
  map.forEach((item) => {
    const btn = document.getElementById(item.id);
    if (!btn) return;
    const active = currentTeacherLessonListFilter === item.key;
    btn.style.background = active ? item.activeBg : item.idleBg;
    btn.style.color = active ? item.activeColor : item.idleColor;
    btn.style.border = active ? "1px solid transparent" : "1px solid #cbd5e1";
  });
}

function buildTeacherQuizSessionLabel(session = {}) {
  const title = String(session.quizTitle || "Quiz");
  const count = Number(session.participantCount || 0);
  const dt = Number(session.latestFinishedAtMs || 0) > 0
    ? new Date(Number(session.latestFinishedAtMs || 0)).toLocaleString("tr-TR")
    : "-";
  return `${title} • ${count} öğrenci • ${dt}`;
}

function renderTeacherQuizSessionSelector() {
  const selects = [
    document.getElementById("teacher-quiz-session-select"),
    document.getElementById("teacher-quiz-session-select-modal")
  ];
  selects.forEach((sel) => {
    if (!sel) return;
    const current = String(teacherSelectedQuizSessionId || "");
    sel.innerHTML = `<option value="">Yapılan quiz seçin</option>`;
    teacherQuizResultSessions.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = String(s.sessionId || "");
      opt.textContent = buildTeacherQuizSessionLabel(s);
      sel.appendChild(opt);
    });
    sel.value = current && teacherQuizResultSessions.some((s) => String(s.sessionId) === current) ? current : "";
  });
}

function bindTeacherQuizSessionSelectorHandlers(sessionMap = new Map()) {
  const syncAndRender = () => {
    const sessionId = String(teacherSelectedQuizSessionId || "");
    if (!sessionId || !sessionMap.has(sessionId)) {
      const fallback = teacherQuizResultSessions[0]?.sessionId || "";
      teacherSelectedQuizSessionId = String(fallback || "");
    }
    const active = String(teacherSelectedQuizSessionId || "");
    if (!active || !sessionMap.has(active)) {
      setTeacherHomeResultsView([], "Tamamlanan quiz bulunmuyor.", "");
      renderTeacherQuizSessionSelector();
      return;
    }
    const items = sessionMap.get(active) || [];
    const ranking = getSortedQuizRanking(items);
    const headerQuizTitle = ranking[0]?.quizTitle || "Quiz";
    const metaText = `${headerQuizTitle} • ${ranking.length} öğrenci tamamladı • Sonuç listesi`;
    setTeacherHomeResultsView(ranking, metaText, active);
    renderTeacherQuizSessionSelector();
  };
  const binds = [
    { selectId: "teacher-quiz-session-select", buttonId: "btn-view-teacher-quiz-session" },
    { selectId: "teacher-quiz-session-select-modal", buttonId: "btn-view-teacher-quiz-session-modal" }
  ];
  binds.forEach(({ selectId, buttonId }) => {
    const selectEl = document.getElementById(selectId);
    const btnEl = document.getElementById(buttonId);
    if (selectEl) {
      selectEl.onchange = () => {
        teacherSelectedQuizSessionId = String(selectEl.value || "");
      };
    }
    if (btnEl) {
      btnEl.onclick = () => {
        if (selectEl) teacherSelectedQuizSessionId = String(selectEl.value || "");
        syncAndRender();
      };
    }
  });
  syncAndRender();
}

["all", "draft", "published"].forEach((key) => {
  const btn = document.getElementById(`btn-teacher-lessons-filter-${key}`);
  if (!btn) return;
  btn.addEventListener("click", () => {
    currentTeacherLessonListFilter = key;
    setTeacherLessonFilterUI();
    renderTeacherLessonsModalList();
  });
});
setTeacherLessonFilterUI();

const deleteSlideBtn = document.getElementById("btn-delete-slide");
if (deleteSlideBtn) {
  deleteSlideBtn.onclick = function () {
    if (selectedLessonSlideIndex < 0) return;
    lessonDraft.slides.splice(selectedLessonSlideIndex, 1);
    selectedLessonSlideIndex = lessonDraft.slides.length ? Math.max(0, selectedLessonSlideIndex - 1) : -1;
    renderLessonSlideList();
    fillLessonSlideForm();
  };
}

const saveLessonBtn = document.getElementById("btn-save-lesson");
if (saveLessonBtn) {
  saveLessonBtn.onclick = async function () {
    if (userRole !== "teacher") return;
    syncCurrentLessonSlideFromForm();
    const title = (document.getElementById("lesson-title")?.value || "").trim();
    const description = (document.getElementById("lesson-desc")?.value || "").trim();
    const targetClass = (document.getElementById("lesson-class")?.value || "").trim();
    const targetSection = (document.getElementById("lesson-section")?.value || "").trim();
    const bgImage = (document.getElementById("lesson-bg")?.value || "").trim();
    if (!title) {
      showNotice("Ders başlığı zorunlu.", "#e74c3c");
      return;
    }
    if (!Array.isArray(lessonDraft.slides) || lessonDraft.slides.length === 0) {
      showNotice("En az bir slide ekleyin.", "#e74c3c");
      return;
    }
    try {
      const payload = {
        title,
        description,
        targetClass,
        targetSection,
        bgImage,
        slides: lessonDraft.slides,
        isPublished: editingLessonId ? !!editingLessonIsPublished : false,
        userId: currentUserId,
        updatedAt: serverTimestamp()
      };
      if (editingLessonId) {
        await updateDoc(doc(db, "lessons", editingLessonId), payload);
      } else {
        await addDoc(collection(db, "lessons"), { ...payload, createdAt: serverTimestamp() });
      }
      closeLessonBuilderModal();
      showNotice("Ders kaydedildi. Taslak listesine eklendi, 'Ödev Olarak Ver' ile yayınlayabilirsiniz.", "#2ecc71");
    } catch (e) {
      showNotice("Ders kaydedilemedi: " + e.message, "#e74c3c");
    }
  };
}
const deleteLessonBtn = document.getElementById("btn-delete-lesson");
if (deleteLessonBtn) {
  deleteLessonBtn.onclick = async function () {
    if (userRole !== "teacher" || !editingLessonId) {
      showNotice("Silmek için kayıtlı bir ders açın.", "#f39c12");
      return;
    }
    const ok = await confirmDialog("Bu dersi tamamen silmek istiyor musunuz?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "lessons", editingLessonId));
      // bağlı ilerlemeleri de temizle
      const progSnap = await getDocs(query(collection(db, "lessonProgress"), where("lessonId", "==", editingLessonId)));
      const batch = writeBatch(db);
      progSnap.forEach((d) => batch.delete(d.ref));
      if (!progSnap.empty) await batch.commit();
      editingLessonId = null;
      closeLessonBuilderModal();
      showNotice("Ders silindi.", "#e74c3c");
    } catch (e) {
      showNotice("Ders silinemedi: " + e.message, "#e74c3c");
    }
  };
}

const closeLessonPlayerBtn = document.getElementById("btn-close-lesson-player");
if (closeLessonPlayerBtn) closeLessonPlayerBtn.onclick = async () => { await persistLessonProgress(true); };

const lessonPrevBtn = document.getElementById("btn-lesson-prev");
if (lessonPrevBtn) lessonPrevBtn.onclick = async function () {
  if (!lessonPlayerState) return;
  lessonPlayerState.index = Math.max(0, lessonPlayerState.index - 1);
  renderLessonPlayer();
  await persistLessonProgress(false);
};

const lessonNextBtn = document.getElementById("btn-lesson-next");
if (lessonNextBtn) lessonNextBtn.onclick = async function () {
  if (!lessonPlayerState) return;
  const total = Array.isArray(lessonPlayerState.lesson?.slides) ? lessonPlayerState.lesson.slides.length : 0;
  if (lessonPlayerState.index < total - 1) {
    lessonPlayerState.index += 1;
    renderLessonPlayer();
    await persistLessonProgress(false);
    return;
  }
  await persistLessonProgress(true);
  showNotice("Ders ilerlemesi kaydedildi.", "#2ecc71");
};

const showAllLessonsBtn = document.getElementById("btn-show-all-lessons");
if (showAllLessonsBtn) {
  showAllLessonsBtn.onclick = function () {
    openAllItemsModal(homeListCache.lessons?.title || "Dersler", homeListCache.lessons?.pending || [], homeListCache.lessons?.completed || []);
  };
}

document.getElementById("btn-close-content").onclick = function() {
  if (contentModal) contentModal.style.display = "none";
  const left = document.querySelector("#content-modal .content-left");
  if (left) left.style.display = "block";
  stopActiveAppSession();
  if (contentModal) contentModal.classList.remove("fullscreen");
};
document.getElementById("btn-close-activity").onclick = async function() {
  const modal = document.getElementById("activity-modal");
  const isBlockRunner = modal?.classList.contains("block-runner-mode");
  if (isBlockRunner) {
    await requestRunnerExitWithPromptPolicy();
    return;
  }
  if (!activitySession) {
    closeBlockRunnerView();
    return;
  }
  await stopActivitySession({ action: "exit", showMessage: true, allowContinue: true, askContinue: true });
};

function exitActivityFullscreen() {
  const modal = document.getElementById("activity-modal");
  if (modal) modal.classList.remove("fullscreen");
  const bar = document.getElementById("activity-fullbar");
  if (bar) bar.style.display = "none";
}

document.getElementById("btn-app-stop").onclick = async function () {
  await stopActiveAppSession();
};
document.getElementById("btn-app-save").onclick = async function () {
  await stopActiveAppSession();
};
document.getElementById("btn-app-open").onclick = async function () {
  if (!lastAppItem) {
    showNotice("Uygulama seçilmedi!", "#e74c3c");
    return;
  }
  await startAppSession(lastAppItem.content, lastAppItem.item, lastAppItem.appUsage, lastAppItem.completedSet, lastAppItem.answers, lastAppItem.options);
};
document.getElementById("btn-app-fullscreen").onclick = function () {
  const panel = document.querySelector(".app-workspace");
  if (!panel) return;
  panel.classList.add("fullscreen");
};
document.getElementById("btn-app-exit").onclick = function () {
  const panel = document.querySelector(".app-workspace");
  if (!panel) return;
  panel.classList.remove("fullscreen");
  stopActiveAppSession();
};

document.getElementById("btn-close-assignment").onclick = function() {
  if (assignmentModal) assignmentModal.style.display = "none";
  currentAssignmentId = null;
};

document.getElementById("btn-confirm-yes").onclick = function () {
  if (confirmResolve) confirmResolve(true);
  confirmResolve = null;
  const yesBtn = document.getElementById("btn-confirm-yes");
  const noBtn = document.getElementById("btn-confirm-no");
  if (yesBtn) {
    yesBtn.innerText = "Evet, Sil";
    yesBtn.className = "btn btn-danger";
    yesBtn.style.flex = "1";
  }
  if (noBtn) {
    noBtn.innerText = "Vazgeç";
    noBtn.className = "btn";
    noBtn.style.flex = "1";
    noBtn.style.background = "#eee";
  }
  const modal = document.getElementById("confirm-modal");
  if (modal) modal.style.display = "none";
  resumeActivityTimer();
};
document.getElementById("btn-confirm-no").onclick = function () {
  if (confirmResolve) confirmResolve(false);
  confirmResolve = null;
  const yesBtn = document.getElementById("btn-confirm-yes");
  const noBtn = document.getElementById("btn-confirm-no");
  if (yesBtn) {
    yesBtn.innerText = "Evet, Sil";
    yesBtn.className = "btn btn-danger";
    yesBtn.style.flex = "1";
  }
  if (noBtn) {
    noBtn.innerText = "Vazgeç";
    noBtn.className = "btn";
    noBtn.style.flex = "1";
    noBtn.style.background = "#eee";
  }
  const modal = document.getElementById("confirm-modal");
  if (modal) modal.style.display = "none";
  resumeActivityTimer();
};

document.getElementById("btn-info-ok").onclick = function () {
  if (infoResolve) infoResolve(true);
  infoResolve = null;
  const modal = document.getElementById("info-modal");
  if (modal) modal.style.display = "none";
  resumeActivityTimer();
};
document.getElementById("btn-info-continue").onclick = function () {
  if (infoResolve) infoResolve(false);
  infoResolve = null;
  const modal = document.getElementById("info-modal");
  if (modal) modal.style.display = "none";
  resumeActivityTimer();
};

document.getElementById("btn-assign-content").onclick = async function () {
  if (userRole !== "teacher") return;
  if (!selectedContentId) {
    showNotice("Önce bir içerik kaydedin!", "#e74c3c");
    return;
  }
  const title = document.getElementById("content-title").value.trim();
  const description = document.getElementById("content-desc").value.trim();
  const targetClass = document.getElementById("content-target-class").value.trim();
  const targetSection = document.getElementById("content-target-section").value.trim();
  const deadline = document.getElementById("content-assign-deadline").value;
  const deadlineTime = document.getElementById("content-assign-deadline-time").value;
  try {
    const contentDoc = await getDoc(doc(db, "contents", selectedContentId));
    if (!contentDoc.exists()) {
      showNotice("İçerik bulunamadı!", "#e74c3c");
      return;
    }
    const contentData = contentDoc.data();
    await addDoc(collection(db, "contentAssignments"), {
      contentId: selectedContentId,
      title: title || contentData.title || "Etkinlik",
      description: description || contentData.description || "",
      targetClass,
      targetSection,
      deadline: deadline || "",
      deadlineTime: deadlineTime || "",
      totalItems: (contentData.items || []).length,
      userId: currentUserId,
      ownerTeacherId: currentUserId || "",
      createdBy: currentUserId || "",
      teacherEmail: String(userData?.email || auth?.currentUser?.email || "").trim().toLowerCase(),
      createdAt: serverTimestamp()
    });
    showNotice("Etkinlik olarak atandı!", "#2ecc71");
    loadContentAssignments();
  } catch (e) {
    showNotice("Etkinlik atanamadı: " + e.message, "#e74c3c");
  }
};

document.getElementById("btn-open-my-stats").onclick = async function() {
  if (userRole !== "student") return;
  if (myStatsModal) myStatsModal.style.display = "flex";
  try {
    await loadMyStatsModal();
  } catch (e) {
    console.error("İstatistik modal açma hatası:", e);
    showNotice("İstatistikler açılırken hata oluştu.", "#e74c3c");
  }
  document.getElementById("side-menu").style.width = "0";
};

const openCertificatesBtn = document.getElementById("btn-open-certificates");
if (openCertificatesBtn) {
  openCertificatesBtn.onclick = function() {
    if (userRole !== "student") return;
    renderStudentCertificateCard();
    if (certificatesModal) certificatesModal.style.display = "flex";
    document.getElementById("side-menu").style.width = "0";
  };
}

const openTeacherCertificatesBtn = document.getElementById("btn-open-teacher-certificates");
if (openTeacherCertificatesBtn) {
  openTeacherCertificatesBtn.onclick = async function() {
    if (userRole !== "teacher") return;
    await openTeacherCertificatesModal();
    document.getElementById("side-menu").style.width = "0";
  };
}

const closeCertificatesBtn = document.getElementById("btn-close-certificates");
if (closeCertificatesBtn) {
  closeCertificatesBtn.onclick = function() {
    if (certificatesModal) certificatesModal.style.display = "none";
  };
}

const closeTeacherCertificatesBtn = document.getElementById("btn-close-teacher-certificates");
if (closeTeacherCertificatesBtn) {
  closeTeacherCertificatesBtn.onclick = function() {
    if (teacherCertificatesModal) teacherCertificatesModal.style.display = "none";
    closeFlowchartModal();
  };
}

const openLessonsMenuBtn = document.getElementById("btn-open-lessons");
if (openLessonsMenuBtn) {
  openLessonsMenuBtn.onclick = function () {
    if (userRole !== "teacher") return;
    const modal = document.getElementById("teacher-lessons-modal");
    if (modal) modal.style.display = "flex";
    renderTeacherLessonsModalList();
    document.getElementById("side-menu").style.width = "0";
  };
}

const closeTeacherLessonsModalBtn = document.getElementById("btn-close-teacher-lessons-modal");
if (closeTeacherLessonsModalBtn) {
  closeTeacherLessonsModalBtn.onclick = function () {
    const modal = document.getElementById("teacher-lessons-modal");
    if (modal) modal.style.display = "none";
  };
}

const openLessonBuilderFromModalBtn = document.getElementById("btn-open-lesson-builder-from-modal");
if (openLessonBuilderFromModalBtn) {
  openLessonBuilderFromModalBtn.onclick = function () {
    if (userRole !== "teacher") return;
    const modal = document.getElementById("teacher-lessons-modal");
    if (modal) modal.style.display = "none";
    openLessonBuilderModal(null);
  };
}
const teacherLessonsModalEl = document.getElementById("teacher-lessons-modal");
if (teacherLessonsModalEl) {
  teacherLessonsModalEl.addEventListener("click", (e) => {
    if (e.target === teacherLessonsModalEl) teacherLessonsModalEl.style.display = "none";
  });
}

const downloadCertificateBtn = document.getElementById("btn-download-certificate");
if (downloadCertificateBtn) {
  downloadCertificateBtn.onclick = function() {
    if (userRole !== "student") return;
    renderStudentCertificateCard();
    downloadStudentCertificatePdf();
  };
}

document.getElementById("teacher-cert-class")?.addEventListener("change", async () => {
  updateTeacherCertificateSectionOptions();
  await updateTeacherCertificateStudentOptions();
});
document.getElementById("teacher-cert-section")?.addEventListener("change", async () => {
  await updateTeacherCertificateStudentOptions();
});
document.getElementById("teacher-cert-student")?.addEventListener("change", async () => {
  await renderTeacherCertificateCardBySelection();
});
document.getElementById("btn-download-selected-certificate")?.addEventListener("click", async () => {
  await downloadSelectedTeacherCertificatePdf();
});
document.getElementById("btn-download-class-certificates")?.addEventListener("click", async () => {
  await downloadFilteredTeacherCertificatesPdf();
});

function setBlockHomeworkModalType(typeRaw) {
  const type = getBlockHomeworkType(typeRaw);
  const typeInput = document.getElementById("block-hw-assignment-type");
  if (typeInput) typeInput.value = type;
  const titleEl = document.getElementById("block-homework-modal-title");
  if (titleEl) titleEl.innerText = type === "block3d" ? "3D Blok Kodlama Ödevi Ver" : "Blok Kodlama Ödevi Ver";
}

function openBlockHomeworkModalWithDefaults({
  type = "block2d",
  title = "",
  levelStart = 1,
  levelEnd = null
} = {}) {
  if (userRole !== "teacher") return;
  editingBlockHomeworkId = null;
  setBlockHomeworkModalType(type);
  const saveBtn = document.getElementById("btn-save-block-homework");
  const deleteBtn = document.getElementById("btn-delete-block-homework");
  if (saveBtn) saveBtn.innerText = "Kaydet";
  if (deleteBtn) deleteBtn.style.display = "none";
  const titleInput = document.getElementById("block-hw-title");
  const classInput = document.getElementById("block-hw-class");
  const sectionInput = document.getElementById("block-hw-section");
  const deadlineInput = document.getElementById("block-hw-deadline");
  const deadlineTimeInput = document.getElementById("block-hw-deadline-time");
  if (titleInput) titleInput.value = title;
  if (classInput) classInput.value = "";
  if (sectionInput) sectionInput.value = "";
  if (deadlineInput) deadlineInput.value = "";
  if (deadlineTimeInput) deadlineTimeInput.value = "23:59";
  const maxLevels = getAvailableBlockLevelCountByType(type);
  const safeStart = Math.max(1, Math.min(maxLevels, Number(levelStart || 1)));
  const safeEnd = Math.max(safeStart, Math.min(maxLevels, Number(levelEnd || levelStart || maxLevels)));
  const startInput = document.getElementById("block-hw-level-start");
  const endInput = document.getElementById("block-hw-level-end");
  if (startInput) {
    startInput.max = String(maxLevels);
    startInput.value = String(safeStart);
  }
  if (endInput) {
    endInput.max = String(maxLevels);
    endInput.value = String(safeEnd);
  }
  const modal = document.getElementById("block-homework-modal");
  if (modal) modal.style.display = "flex";
}

const createBlockHomeworkBtn = document.getElementById("btn-create-block-homework");
if (createBlockHomeworkBtn) {
  createBlockHomeworkBtn.onclick = function () {
    const type = getBlockHomeworkType(currentBlockAssignType || "block2d");
    openBlockHomeworkModalWithDefaults({
      type,
      title: "",
      levelStart: 1,
      levelEnd: getAvailableBlockLevelCountByType(type)
    });
  };
}

const closeBlockHomeworkModalBtn = document.getElementById("btn-close-block-homework-modal");
if (closeBlockHomeworkModalBtn) {
  closeBlockHomeworkModalBtn.onclick = function () {
    editingBlockHomeworkId = null;
    setBlockHomeworkModalType("block2d");
    const saveBtn = document.getElementById("btn-save-block-homework");
    const deleteBtn = document.getElementById("btn-delete-block-homework");
    if (saveBtn) saveBtn.innerText = "Kaydet";
    if (deleteBtn) deleteBtn.style.display = "none";
    const modal = document.getElementById("block-homework-modal");
    if (modal) modal.style.display = "none";
  };
}

const saveBlockHomeworkBtn = document.getElementById("btn-save-block-homework");
const blockHwLevelStartInput = document.getElementById("block-hw-level-start");
const blockHwLevelEndInput = document.getElementById("block-hw-level-end");
if (blockHwLevelStartInput && blockHwLevelEndInput) {
  const clampLevelRangeInputs = () => {
    const type = getBlockHomeworkType(document.getElementById("block-hw-assignment-type")?.value || "block2d");
    const maxLevels = getAvailableBlockLevelCountByType(type);
    const s = Math.max(1, Math.min(maxLevels, parseInt(blockHwLevelStartInput.value || "1") || 1));
    const e = Math.max(1, Math.min(maxLevels, parseInt(blockHwLevelEndInput.value || String(maxLevels)) || maxLevels));
    blockHwLevelStartInput.max = String(maxLevels);
    blockHwLevelEndInput.max = String(maxLevels);
    blockHwLevelStartInput.value = String(s);
    blockHwLevelEndInput.value = String(e);
  };
  blockHwLevelStartInput.addEventListener("input", clampLevelRangeInputs);
  blockHwLevelEndInput.addEventListener("input", clampLevelRangeInputs);
}
if (saveBlockHomeworkBtn) {
  saveBlockHomeworkBtn.onclick = async function () {
    if (userRole !== "teacher") return;
    const assignmentType = getBlockHomeworkType(document.getElementById("block-hw-assignment-type")?.value || "block2d");
    const title = (document.getElementById("block-hw-title")?.value || "").trim();
    const targetClass = (document.getElementById("block-hw-class")?.value || "").trim();
    const targetSection = (document.getElementById("block-hw-section")?.value || "").trim();
    const deadline = (document.getElementById("block-hw-deadline")?.value || "").trim();
    const deadlineTime = (document.getElementById("block-hw-deadline-time")?.value || "23:59").trim() || "23:59";
    const maxLevels = getAvailableBlockLevelCountByType(assignmentType);
    let levelStart = Math.max(1, Math.min(maxLevels, parseInt(document.getElementById("block-hw-level-start")?.value || "1")));
    let levelEnd = Math.max(1, Math.min(maxLevels, parseInt(document.getElementById("block-hw-level-end")?.value || "1")));
    if (!title) {
      showNotice("Ödev başlığı zorunlu.", "#e74c3c");
      return;
    }
    if (levelStart > levelEnd) {
      const t = levelStart;
      levelStart = levelEnd;
      levelEnd = t;
    }
    if (levelStart > maxLevels || levelEnd > maxLevels) {
      showNotice(`Seviye aralığı 1-${maxLevels} olmalı.`, "#e74c3c");
      return;
    }
    try {
      const levelNames = getBlockLevelNamesByTypeAndRange(assignmentType, levelStart, levelEnd);
      if (editingBlockHomeworkId) {
        await updateDoc(doc(db, "blockAssignments", editingBlockHomeworkId), {
          assignmentType,
          title,
          targetClass,
          targetSection,
          deadline,
          deadlineTime,
          levelStart,
          levelEnd,
          levelNames,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "blockAssignments"), {
          assignmentType,
          title,
          targetClass,
          targetSection,
          deadline,
          deadlineTime,
          levelStart,
          levelEnd,
          levelNames,
          completedCount: 0,
          userId: currentUserId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      const modal = document.getElementById("block-homework-modal");
      if (modal) modal.style.display = "none";
      showNotice(editingBlockHomeworkId ? "Blok kodlama ödevi güncellendi." : "Blok kodlama ödevi verildi.", "#2ecc71");
      editingBlockHomeworkId = null;
      setBlockHomeworkModalType("block2d");
      if (saveBlockHomeworkBtn) saveBlockHomeworkBtn.innerText = "Kaydet";
      const deleteBtn = document.getElementById("btn-delete-block-homework");
      if (deleteBtn) deleteBtn.style.display = "none";
    } catch (e) {
      showNotice("Blok kodlama ödevi kaydedilemedi: " + e.message, "#e74c3c");
    }
  };
}

const deleteBlockHomeworkBtn = document.getElementById("btn-delete-block-homework");
if (deleteBlockHomeworkBtn) {
  deleteBlockHomeworkBtn.onclick = async function () {
    if (userRole !== "teacher" || !editingBlockHomeworkId) return;
    const ok = await confirmDialog("Blok kodlama ödevini silmek istiyor musunuz?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "blockAssignments", editingBlockHomeworkId));
      const pq = query(collection(db, "blockAssignmentProgress"), where("assignmentId", "==", editingBlockHomeworkId));
      const snap = await getDocs(pq);
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      const modal = document.getElementById("block-homework-modal");
      if (modal) modal.style.display = "none";
      editingBlockHomeworkId = null;
      setBlockHomeworkModalType("block2d");
      const saveBtn = document.getElementById("btn-save-block-homework");
      if (saveBtn) saveBtn.innerText = "Kaydet";
      deleteBlockHomeworkBtn.style.display = "none";
      showNotice("Blok kodlama ödevi silindi.", "#2ecc71");
    } catch (e) {
      showNotice("Blok kodlama ödevi silinemedi: " + e.message, "#e74c3c");
    }
  };
}

const createComputeHomeworkBtn = document.getElementById("btn-create-compute-homework");
if (createComputeHomeworkBtn) {
  createComputeHomeworkBtn.onclick = async function () {
    if (userRole !== "teacher") return;
    editingComputeHomeworkId = null;
    const saveBtn = document.getElementById("btn-save-compute-homework");
    const deleteBtn = document.getElementById("btn-delete-compute-homework");
    if (saveBtn) saveBtn.innerText = "Kaydet";
    if (deleteBtn) deleteBtn.style.display = "none";
    const titleInput = document.getElementById("compute-hw-title");
    const classInput = document.getElementById("compute-hw-class");
    const sectionInput = document.getElementById("compute-hw-section");
    const deadlineInput = document.getElementById("compute-hw-deadline");
    const deadlineTimeInput = document.getElementById("compute-hw-deadline-time");
    if (titleInput) titleInput.value = "";
    if (classInput) classInput.value = "";
    if (sectionInput) sectionInput.value = "";
    if (deadlineInput) deadlineInput.value = "";
    if (deadlineTimeInput) deadlineTimeInput.value = "23:59";
    const maxLevels = await getAvailableComputeLevelCount();
    const startInput = document.getElementById("compute-hw-level-start");
    const endInput = document.getElementById("compute-hw-level-end");
    if (startInput) {
      startInput.max = String(maxLevels);
      startInput.value = "1";
    }
    if (endInput) {
      endInput.max = String(maxLevels);
      endInput.value = String(maxLevels);
    }
    const modal = document.getElementById("compute-homework-modal");
    if (modal) modal.style.display = "flex";
  };
}

const closeComputeHomeworkModalBtn = document.getElementById("btn-close-compute-homework-modal");
if (closeComputeHomeworkModalBtn) {
  closeComputeHomeworkModalBtn.onclick = function () {
    editingComputeHomeworkId = null;
    const saveBtn = document.getElementById("btn-save-compute-homework");
    const deleteBtn = document.getElementById("btn-delete-compute-homework");
    if (saveBtn) saveBtn.innerText = "Kaydet";
    if (deleteBtn) deleteBtn.style.display = "none";
    const modal = document.getElementById("compute-homework-modal");
    if (modal) modal.style.display = "none";
  };
}

const saveComputeHomeworkBtn = document.getElementById("btn-save-compute-homework");
const computeHwLevelStartInput = document.getElementById("compute-hw-level-start");
const computeHwLevelEndInput = document.getElementById("compute-hw-level-end");
if (computeHwLevelStartInput && computeHwLevelEndInput) {
  const clampComputeLevelRangeInputs = async () => {
    const maxLevels = await getAvailableComputeLevelCount();
    const s = Math.max(1, Math.min(maxLevels, parseInt(computeHwLevelStartInput.value || "1") || 1));
    const e = Math.max(1, Math.min(maxLevels, parseInt(computeHwLevelEndInput.value || String(maxLevels)) || maxLevels));
    computeHwLevelStartInput.max = String(maxLevels);
    computeHwLevelEndInput.max = String(maxLevels);
    computeHwLevelStartInput.value = String(s);
    computeHwLevelEndInput.value = String(e);
  };
  computeHwLevelStartInput.addEventListener("input", clampComputeLevelRangeInputs);
  computeHwLevelEndInput.addEventListener("input", clampComputeLevelRangeInputs);
}
if (saveComputeHomeworkBtn) {
  saveComputeHomeworkBtn.onclick = async function () {
    if (userRole !== "teacher") return;
    const title = (document.getElementById("compute-hw-title")?.value || "").trim();
    const targetClass = (document.getElementById("compute-hw-class")?.value || "").trim();
    const targetSection = (document.getElementById("compute-hw-section")?.value || "").trim();
    const deadline = (document.getElementById("compute-hw-deadline")?.value || "").trim();
    const deadlineTime = (document.getElementById("compute-hw-deadline-time")?.value || "23:59").trim() || "23:59";
    const levels = await getAvailableComputeLevels();
    const maxLevels = levels.length > 0 ? levels.length : DEFAULT_COMPUTE_LEVEL_COUNT;
    let levelStart = Math.max(1, Math.min(maxLevels, parseInt(document.getElementById("compute-hw-level-start")?.value || "1")));
    let levelEnd = Math.max(1, Math.min(maxLevels, parseInt(document.getElementById("compute-hw-level-end")?.value || "1")));
    if (!title) {
      showNotice("Ödev başlığı zorunlu.", "#e74c3c");
      return;
    }
    if (levelStart > levelEnd) {
      const t = levelStart;
      levelStart = levelEnd;
      levelEnd = t;
    }
    if (levelStart > maxLevels || levelEnd > maxLevels) {
      showNotice(`Seviye aralığı 1-${maxLevels} olmalı.`, "#e74c3c");
      return;
    }
    try {
      const levelNames = getComputeLevelNamesByRange(levelStart, levelEnd, levels);
      if (editingComputeHomeworkId) {
        await updateDoc(doc(db, "computeAssignments", editingComputeHomeworkId), {
          title,
          targetClass,
          targetSection,
          deadline,
          deadlineTime,
          levelStart,
          levelEnd,
          levelNames,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "computeAssignments"), {
          title,
          targetClass,
          targetSection,
          deadline,
          deadlineTime,
          levelStart,
          levelEnd,
          levelNames,
          completedCount: 0,
          userId: currentUserId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      const modal = document.getElementById("compute-homework-modal");
      if (modal) modal.style.display = "none";
      showNotice(editingComputeHomeworkId ? "Compute It ödevi güncellendi." : "Compute It ödevi verildi.", "#2ecc71");
      editingComputeHomeworkId = null;
      if (saveComputeHomeworkBtn) saveComputeHomeworkBtn.innerText = "Kaydet";
      const deleteBtn = document.getElementById("btn-delete-compute-homework");
      if (deleteBtn) deleteBtn.style.display = "none";
    } catch (e) {
      showNotice("Compute It ödevi kaydedilemedi: " + e.message, "#e74c3c");
    }
  };
}

const deleteComputeHomeworkBtn = document.getElementById("btn-delete-compute-homework");
if (deleteComputeHomeworkBtn) {
  deleteComputeHomeworkBtn.onclick = async function () {
    if (userRole !== "teacher" || !editingComputeHomeworkId) return;
    const ok = await confirmDialog("Compute It ödevini silmek istiyor musunuz?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "computeAssignments", editingComputeHomeworkId));
      const modal = document.getElementById("compute-homework-modal");
      if (modal) modal.style.display = "none";
      editingComputeHomeworkId = null;
      const saveBtn = document.getElementById("btn-save-compute-homework");
      if (saveBtn) saveBtn.innerText = "Kaydet";
      deleteComputeHomeworkBtn.style.display = "none";
      showNotice("Compute It ödevi silindi. Öğrenci ilerleme verileri korunur.", "#2ecc71");
    } catch (e) {
      showNotice("Compute It ödevi silinemedi: " + e.message, "#e74c3c");
    }
  };
}

document.getElementById("btn-close-my-stats").onclick = function() {
  if (myStatsModal) myStatsModal.style.display = "none";
};

document.getElementById("btn-my-stats-report").onclick = async function() {
  if (userRole !== "student") return;
  if (!currentStudentDetail) await loadMyStatsModal();
  if (!currentStudentDetail) {
    showNotice("Rapor verisi henüz hazır değil.", "#e74c3c");
    return;
  }
  if (currentStudentDetail.student && currentStudentDetail.student.id === currentUserId) {
    currentStudentDetail.student.totalTimeSeconds = getLiveSystemSeconds();
  }
  try {
    await openStudentReportWindow(currentStudentDetail);
  } catch (e) {
    console.error("Rapor açma hatası:", e);
    showNotice("Rapor açılamadı. Lütfen tekrar deneyin.", "#e74c3c");
  }
};

document.getElementById("btn-profile-cancel").onclick = function() {
  if (profileModal) profileModal.style.display = "none";
};

document.getElementById("btn-profile-save").onclick = async function() {
  const newFirstName = (document.getElementById("profile-firstname")?.value || "").trim();
  const newLastName = (document.getElementById("profile-lastname")?.value || "").trim();
  const newUsername = (document.getElementById("profile-username")?.value || "").trim();
  const newPassword = document.getElementById("profile-password").value;
  if (!currentUserId) return;
  try {
    const profileUpdate = {};
    if (newUsername) profileUpdate.username = newUsername;
    profileUpdate.firstName = newFirstName;
    profileUpdate.lastName = newLastName;
    await updateDoc(doc(db, "users", currentUserId), profileUpdate);
    if (userData) {
      userData.firstName = newFirstName;
      userData.lastName = newLastName;
      if (newUsername) userData.username = newUsername;
    }
    if (newPassword) {
      if (newPassword.length < 6) {
        showNotice("Şifre en az 6 karakter olmalı!", "#e74c3c");
        return;
      }
      await applyStudentPasswordUpdate(
        {
          id: currentUserId,
          username: String(userData?.username || ""),
          email: String(userData?.email || ""),
          loginCardPassword: String(userData?.loginCardPassword || "")
        },
        newPassword,
        { currentPasswordHints: [String(userData?.loginCardPassword || "")] }
      );
    }
    showNotice("Profil güncellendi!", "#2ecc71");
    document.getElementById("profile-password").value = "";
    if (profileModal) profileModal.style.display = "none";
  } catch (e) {
    showNotice("Güncelleme hatası: " + e.message, "#e74c3c");
  }
};

document.getElementById("btn-profile-delete").onclick = async function() {
  if (!currentUserId) return;
  if (!confirm("Hesabınızı silmek istediğinize emin misiniz?")) return;
  try {
    await deleteUserByAdmin({ uid: currentUserId });
    showNotice("Hesap silindi!", "#e74c3c");
    if (profileModal) profileModal.style.display = "none";
    await signOut(auth);
  } catch (e) {
    showNotice("Hesap silinemedi!", "#e74c3c");
  }
};

document.getElementById("btn-save-assignment").onclick = async function() {
  if (!currentAssignmentId) return;
  try {
    await updateDoc(doc(db, "contentAssignments", currentAssignmentId), {
      title: document.getElementById("assignment-title").value.trim(),
      description: document.getElementById("assignment-desc").value.trim(),
      targetClass: document.getElementById("assignment-class").value.trim(),
      targetSection: document.getElementById("assignment-section").value.trim(),
      deadline: document.getElementById("assignment-deadline").value,
      deadlineTime: document.getElementById("assignment-deadline-time").value
    });
    showNotice("Etkinlik güncellendi!", "#2ecc71");
    if (assignmentModal) assignmentModal.style.display = "none";
    currentAssignmentId = null;
  } catch (e) {
    showNotice("Etkinlik güncellenemedi: " + e.message, "#e74c3c");
  }
};

document.getElementById("btn-delete-assignment").onclick = async function() {
  if (!currentAssignmentId) return;
  const assignment = contentAssignments.find(a => a.id === currentAssignmentId);
  const ok = await confirmDialog("Etkinliği ve ilişkili verileri tamamen silmek istiyor musunuz?");
  if (!ok) return;
  await deleteAssignmentCompletely(assignment || { id: currentAssignmentId });
  if (assignmentModal) assignmentModal.style.display = "none";
  currentAssignmentId = null;
};

document.getElementById("btn-password-cancel").onclick = function() {
  if (passwordModal) passwordModal.style.display = "none";
  passwordChangeUserId = null;
  document.getElementById("password-new").value = "";
};

document.getElementById("btn-password-save").onclick = async function() {
  const newPassword = document.getElementById("password-new").value;
  if (!passwordChangeUserId) return;
  if (!newPassword || newPassword.length < 6) {
    showNotice("Şifre en az 6 karakter olmalı!", "#e74c3c");
    return;
  }
  try {
    const studentSnap = await getDoc(doc(db, "users", passwordChangeUserId));
    const studentData = studentSnap.exists() ? (studentSnap.data() || {}) : {};
    await applyStudentPasswordUpdate(
      {
        id: passwordChangeUserId,
        username: String(studentData.username || ""),
        email: String(studentData.email || ""),
        loginCardPassword: String(studentData.loginCardPassword || "")
      },
      newPassword,
      { currentPasswordHints: [String(studentData.loginCardPassword || "")] }
    );
    showNotice("Şifre güncellendi!", "#2ecc71");
    document.getElementById("password-new").value = "";
    if (passwordModal) passwordModal.style.display = "none";
    passwordChangeUserId = null;
  } catch (e) {
    showNotice("Şifre güncellenemedi: " + getCallableErrorMessage(e), "#e74c3c");
  }
};


document.getElementById("btn-new-content").onclick = function () {
  if (userRole !== "teacher") return;
  selectedContentId = null;
  contentItemsDraft = [];
  const editor = document.getElementById("content-editor");
  const viewer = document.getElementById("content-viewer");
  const empty = document.getElementById("content-empty");
  if (editor) editor.style.display = "block";
  if (viewer) viewer.style.display = "none";
  if (empty) empty.style.display = "none";
  document.getElementById("content-title").value = "";
  document.getElementById("content-desc").value = "";
  document.getElementById("content-target-class").value = "";
  document.getElementById("content-target-section").value = "";
  renderContentItemsEditor();
};

document.getElementById("btn-add-heading").onclick = function () {
  if (userRole !== "teacher") return;
  contentItemsDraft.push(newContentItem("heading"));
  renderContentItemsEditor();
};

async function createStudentAccount({ firstName, lastName, username, password, className, section }) {
  const email = fixEmail(username);
  const res = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const passwordHash = await hashPassword(password);
  const ownerTeacherId = currentUserId || "";
  await setDoc(doc(db, "users", res.user.uid), {
    username: username,
    email: email,
    firstName: firstName,
    lastName: lastName,
    passwordHash: passwordHash,
    loginCardPassword: password,
    role: "student",
    className: className,
    section: section,
    ownerTeacherId: ownerTeacherId,
    createdBy: ownerTeacherId,
    xp: 0,
    createdAt: serverTimestamp()
  });
  await signOut(secondaryAuth);
}

async function createTeacherAccount({ firstName, lastName, username, password }) {
  const email = fixEmail(username);
  const res = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const passwordHash = await hashPassword(password);
  await setDoc(doc(db, "users", res.user.uid), {
    username: username,
    email: email,
    firstName: firstName,
    lastName: lastName,
    passwordHash: passwordHash,
    role: "teacher",
    xp: 0,
    createdAt: serverTimestamp(),
    createdBy: currentUserId || ""
  });
  await signOut(secondaryAuth);
}

document.getElementById("btn-add-student-save").onclick = async function () {
  if (userRole !== "teacher") return;
  const firstName = document.getElementById("add-student-firstname").value.trim();
  const lastName = document.getElementById("add-student-lastname").value.trim();
  const username = document.getElementById("add-student-username").value.trim();
  const password = document.getElementById("add-student-password").value;
  const className = document.getElementById("add-student-class").value.trim();
  const section = document.getElementById("add-student-section").value.trim();

  if (!firstName || !lastName || !username || !password || !className || !section) {
    showNotice("Tüm alanlar zorunlu!", "#e74c3c");
    return;
  }
  if (password.length < 6) {
    showNotice("Şifre en az 6 karakter olmalı!", "#e74c3c");
    return;
  }
  try {
    await createStudentAccount({ firstName, lastName, username, password, className, section });
    showNotice("Öğrenci eklendi!", "#2ecc71");
    document.getElementById("add-student-firstname").value = "";
    document.getElementById("add-student-lastname").value = "";
    document.getElementById("add-student-username").value = "";
    document.getElementById("add-student-password").value = "";
    document.getElementById("add-student-class").value = "";
    document.getElementById("add-student-section").value = "";
  } catch (e) {
    showNotice("Kayıt hatası: " + e.message, "#e74c3c");
  }
};

document.getElementById("btn-bulk-student-save").onclick = async function () {
  if (userRole !== "teacher") return;
  const raw = document.getElementById("bulk-students-input").value.trim();
  const defaultPass = document.getElementById("bulk-default-password").value;
  if (!raw) {
    showNotice("Toplu kayıt için veri girin!", "#e74c3c");
    return;
  }
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let okCount = 0;
  let failCount = 0;
  for (const line of lines) {
    const parts = line.split(",").map(p => p.trim()).filter(Boolean);
    if (parts.length < 6) {
      failCount++;
      continue;
    }
    const [firstName, lastName, username, pass, className, section] = parts;
    const password = pass || defaultPass;
    if (!password || password.length < 6) {
      failCount++;
      continue;
    }
    try {
      await createStudentAccount({ firstName, lastName, username, password, className, section });
      okCount++;
    } catch (e) {
      failCount++;
    }
  }
  showNotice(`Toplu kayıt tamamlandı. Başarılı: ${okCount}, Hatalı: ${failCount}`, "#4a90e2");
};

document.getElementById("btn-add-teacher-save").onclick = async function () {
  if (userRole !== "teacher") return;
  const firstName = document.getElementById("add-teacher-firstname").value.trim();
  const lastName = document.getElementById("add-teacher-lastname").value.trim();
  const username = document.getElementById("add-teacher-username").value.trim();
  const password = document.getElementById("add-teacher-password").value;

  if (!firstName || !lastName || !username || !password) {
    showNotice("Öğretmen ekleme alanları zorunludur!", "#e74c3c");
    return;
  }
  if (password.length < 6) {
    showNotice("Şifre en az 6 karakter olmalı!", "#e74c3c");
    return;
  }
  try {
    await createTeacherAccount({ firstName, lastName, username, password });
    showNotice("Öğretmen eklendi!", "#2ecc71");
    document.getElementById("add-teacher-firstname").value = "";
    document.getElementById("add-teacher-lastname").value = "";
    document.getElementById("add-teacher-username").value = "";
    document.getElementById("add-teacher-password").value = "";
  } catch (e) {
    showNotice("Öğretmen kayıt hatası: " + e.message, "#e74c3c");
  }
};

document.getElementById("btn-bulk-teacher-save").onclick = async function () {
  if (userRole !== "teacher") return;
  const raw = document.getElementById("bulk-teachers-input").value.trim();
  const defaultPass = document.getElementById("bulk-teachers-default-password").value;
  if (!raw) {
    showNotice("Toplu öğretmen kaydı için veri girin!", "#e74c3c");
    return;
  }
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let okCount = 0;
  let failCount = 0;
  for (const line of lines) {
    const parts = line.split(",").map(p => p.trim()).filter(Boolean);
    if (parts.length < 4) {
      failCount++;
      continue;
    }
    const [firstName, lastName, username, pass] = parts;
    const password = pass || defaultPass;
    if (!password || password.length < 6) {
      failCount++;
      continue;
    }
    try {
      await createTeacherAccount({ firstName, lastName, username, password });
      okCount++;
    } catch (e) {
      failCount++;
    }
  }
  showNotice(`Toplu öğretmen kaydı tamamlandı. Başarılı: ${okCount}, Hatalı: ${failCount}`, "#4a90e2");
};

document.getElementById("btn-download-teacher-template").onclick = function () {
  const csv = [
    "Ad,Soyad,Kullanıcı Adı,Şifre",
    "Ali,Veli,ogretmen.ali,123456",
    "Ayşe,Yılmaz,ogretmen.ayse,123456"
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ogretmen_sablon.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

document.getElementById("btn-download-student-template").onclick = function () {
  const csv = [
    "Ad,Soyad,Kullanıcı Adı,Şifre,Sınıf,Şube",
    "Ali,Veli,ali,123456,9,A",
    "Ayşe,Yılmaz,ayse,123456,9,B"
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ogrenci_sablon.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && (ch === "," || ch === ";" || ch === "\t")) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.length) result.push(current.trim());
  return result;
}

function getUserDisplayName(user) {
  if (!user) return "İsimsiz";
  const first = user.firstName || "";
  const last = user.lastName || "";
  const full = `${first} ${last}`.trim();
  if (full) return full;
  return user.username ? user.username.split("@")[0] : "İsimsiz";
}

function parseXPValue(value) {
  if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
  }
  return 0;
}

function getStudentXPValue(student, externalXPMap = null) {
  if (!student) return 0;
  let xp = 0;
  xp = Math.max(xp, parseXPValue(student.xp));
  xp = Math.max(xp, parseXPValue(student.totalXP));
  xp = Math.max(xp, parseXPValue(student.totalXp));
  xp = Math.max(xp, parseXPValue(student.xpTotal));
  if (externalXPMap && student.id && externalXPMap.has(student.id)) {
    xp = Math.max(xp, parseXPValue(externalXPMap.get(student.id)));
  }
  return xp;
}

document.getElementById("bulk-students-file").onchange = async function (e) {
  if (userRole !== "teacher") return;
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const isExcel = /\.xlsx?$|\.xls$/i.test(file.name);
  const reader = new FileReader();
  reader.onload = async function () {
    let rows = [];
    if (isExcel && window.XLSX) {
      const data = new Uint8Array(reader.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).filter(r => r && r.length);
    } else {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      rows = lines.map(l => parseCsvLine(l));
    }
    if (!rows.length) {
      showNotice("Dosya boş.", "#e74c3c");
      return;
    }
    const header = rows[0].join(" ").toLowerCase();
    if (header.includes("ad") && header.includes("soyad") && header.includes("kullanıcı")) {
      rows.shift();
    }
    let okCount = 0;
    let failCount = 0;
    for (const r of rows) {
      const parts = r.map(p => (p ?? "").toString().trim()).filter(Boolean);
      if (parts.length < 6) {
        failCount++;
        continue;
      }
    const [firstName, lastName, username, pass, className, section] = parts;
    if (!pass || pass.length < 6) {
      failCount++;
      continue;
    }
    try {
      await createStudentAccount({ firstName, lastName, username, password: pass, className, section });
      okCount++;
    } catch (err) {
      failCount++;
      }
    }
    showNotice(`Dosyadan kayıt tamamlandı. Başarılı: ${okCount}, Hatalı: ${failCount}`, "#4a90e2");
    e.target.value = "";
  };
  if (isExcel) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file, "utf-8");
  }
};

document.getElementById("bulk-teachers-file").onchange = async function (e) {
  if (userRole !== "teacher") return;
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const isExcel = /\.xlsx?$|\.xls$/i.test(file.name);
  const reader = new FileReader();
  reader.onload = async function () {
    let rows = [];
    if (isExcel && window.XLSX) {
      const data = new Uint8Array(reader.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).filter(r => r && r.length);
    } else {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      rows = lines.map(l => parseCsvLine(l));
    }
    if (!rows.length) {
      showNotice("Dosya boş.", "#e74c3c");
      return;
    }
    const header = rows[0].join(" ").toLowerCase();
    if (header.includes("ad") && header.includes("soyad") && header.includes("kullanıcı")) {
      rows.shift();
    }
    let okCount = 0;
    let failCount = 0;
    const defaultPass = document.getElementById("bulk-teachers-default-password").value;
    for (const r of rows) {
      const parts = r.map(p => (p ?? "").toString().trim()).filter(Boolean);
      if (parts.length < 3) {
        failCount++;
        continue;
      }
      const [firstName, lastName, username, pass] = parts;
      const password = pass || defaultPass;
      if (!firstName || !lastName || !username || !password || password.length < 6) {
        failCount++;
        continue;
      }
      try {
        await createTeacherAccount({ firstName, lastName, username, password });
        okCount++;
      } catch (err) {
        failCount++;
      }
    }
    showNotice(`Dosyadan öğretmen kaydı tamamlandı. Başarılı: ${okCount}, Hatalı: ${failCount}`, "#4a90e2");
    e.target.value = "";
  };
  if (isExcel) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file, "utf-8");
  }
};
document.getElementById("btn-add-paragraph").onclick = function () {
  if (userRole !== "teacher") return;
  contentItemsDraft.push(newContentItem("paragraph"));
  renderContentItemsEditor();
};
document.getElementById("btn-add-image").onclick = function () {
  if (userRole !== "teacher") return;
  contentItemsDraft.push(newContentItem("image"));
  renderContentItemsEditor();
};

async function loadBooksForTeacher() {
  if (userRole !== "teacher") return;
  const bookSelect = document.getElementById("task-book");
  const testSelect = document.getElementById("task-book-test");
  const booksList = document.getElementById("books-list");
  const booksTests = document.getElementById("books-tests");
  if (bookSelect) {
    bookSelect.innerHTML = `<option value="">Kitap seçiniz</option>`;
  }
  if (testSelect) {
    testSelect.innerHTML = `<option value="">Test seçiniz</option>`;
    testSelect.disabled = true;
  }
  if (booksList) {
    booksList.innerHTML = `<option value="">Kitap seçiniz</option>`;
  }
  if (booksTests) {
    booksTests.innerHTML = `<option value="">Testler</option>`;
    booksTests.disabled = true;
  }
  const q = query(collection(db, "books"), where("userId", "==", currentUserId));
  const snap = await getDocs(q);
  allBooks = [];
  snap.forEach((docSnap) => {
    allBooks.push({ id: docSnap.id, ...docSnap.data() });
  });
  allBooks.sort((a, b) => (a.name || "").localeCompare(b.name || "", "tr"));
  if (bookSelect) {
    allBooks.forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = b.name || "Kitap";
      bookSelect.appendChild(opt);
    });
  }
  if (booksList) {
    allBooks.forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = b.name || "Kitap";
      booksList.appendChild(opt);
    });
  }
}

const taskBookSelect = document.getElementById("task-book");
if (taskBookSelect) {
  taskBookSelect.onchange = function () {
    const testSelect = document.getElementById("task-book-test");
    if (!testSelect) return;
    testSelect.innerHTML = `<option value="">Test seçiniz</option>`;
    const bookId = taskBookSelect.value;
    if (!bookId) {
      testSelect.disabled = true;
      return;
    }
    const book = allBooks.find(b => b.id === bookId);
    const tests = book?.tests || [];
    tests.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      testSelect.appendChild(opt);
    });
    testSelect.disabled = tests.length === 0;
  };
}

const booksListSelect = document.getElementById("books-list");
if (booksListSelect) {
  booksListSelect.onchange = function () {
    const booksTests = document.getElementById("books-tests");
    if (!booksTests) return;
    booksTests.innerHTML = `<option value="">Testler</option>`;
    const bookId = booksListSelect.value;
    if (!bookId) {
      booksTests.disabled = true;
      return;
    }
    const book = allBooks.find(b => b.id === bookId);
    const tests = book?.tests || [];
    tests.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      booksTests.appendChild(opt);
    });
    booksTests.disabled = tests.length === 0;
  };
}

const clearBookBtn = document.getElementById("btn-clear-book");
if (clearBookBtn) {
  clearBookBtn.onclick = async function () {
    const bookId = booksListSelect?.value;
    if (!bookId) {
      showNotice("Silmek için kitap seçin!", "#e74c3c");
      return;
    }
    const ok = await confirmDialog("Kitabı ve testlerini silmek istiyor musunuz?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "books", bookId));
      showNotice("Kitap silindi.", "#e74c3c");
      if (booksListSelect) booksListSelect.value = "";
      const booksTests = document.getElementById("books-tests");
      if (booksTests) {
        booksTests.innerHTML = `<option value="">Testler</option>`;
        booksTests.disabled = true;
      }
      loadBooksForTeacher();
    } catch (e) {
      showNotice("Kitap silinemedi: " + e.message, "#e74c3c");
    }
  };
}

document.getElementById("btn-save-book").onclick = async function () {
  if (userRole !== "teacher") return;
  const name = document.getElementById("book-name").value.trim();
  const testsRaw = document.getElementById("book-tests").value.trim();
  if (!name) {
    showNotice("Kitap adı zorunlu!", "#e74c3c");
    return;
  }
  const tests = testsRaw
    ? testsRaw.split(",").map(t => t.trim()).filter(Boolean)
    : [];
  try {
    await addDoc(collection(db, "books"), {
      name,
      tests,
      userId: currentUserId,
      createdAt: serverTimestamp()
    });
    showNotice("Kitap kaydedildi!", "#2ecc71");
    document.getElementById("book-name").value = "";
    document.getElementById("book-tests").value = "";
    loadBooksForTeacher();
  } catch (e) {
    showNotice("Kitap kaydı hatası: " + e.message, "#e74c3c");
  }
};

document.getElementById("btn-download-book-template").onclick = function () {
  const csv = [
    "Kitap Adı,Test1,Test2,Test3,Test4",
    "Matematik 9,Test1,Test2,Test3,",
    "Fizik 9,Test A,Test B,,"
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kitap_sablon.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

document.getElementById("bulk-books-file").onchange = async function (e) {
  if (userRole !== "teacher") return;
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const isExcel = /\.xlsx?$|\.xls$/i.test(file.name);
  const reader = new FileReader();
  reader.onload = async function () {
    let rows = [];
    if (isExcel && window.XLSX) {
      const data = new Uint8Array(reader.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).filter(r => r && r.length);
    } else {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      rows = lines.map(l => parseCsvLine(l));
    }
    if (!rows.length) {
      showNotice("Dosya boş.", "#e74c3c");
      return;
    }
    const header = rows[0].join(" ").toLowerCase();
    if (header.includes("kitap")) {
      rows.shift();
    }
    let okCount = 0;
    let failCount = 0;
    for (const r of rows) {
      const parts = r.map(p => (p ?? "").toString().trim()).filter(Boolean);
      if (parts.length < 1) {
        failCount++;
        continue;
      }
      const name = parts[0];
      const tests = parts.slice(1).map(t => t.trim()).filter(Boolean);
      if (!name) {
        failCount++;
        continue;
      }
      try {
        await addDoc(collection(db, "books"), { name, tests, userId: currentUserId, createdAt: serverTimestamp() });
        okCount++;
      } catch (err) {
        failCount++;
      }
    }
    showNotice(`Kitap yükleme tamamlandı. Başarılı: ${okCount}, Hatalı: ${failCount}`, "#4a90e2");
    e.target.value = "";
    loadBooksForTeacher();
  };
  if (isExcel) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file, "utf-8");
  }
};
document.getElementById("btn-add-video").onclick = function () {
  if (userRole !== "teacher") return;
  contentItemsDraft.push(newContentItem("video"));
  renderContentItemsEditor();
};
document.getElementById("btn-add-quiz").onclick = function () {
  if (userRole !== "teacher") return;
  contentItemsDraft.push(newContentItem("quiz"));
  renderContentItemsEditor();
};
document.getElementById("btn-add-truefalse").onclick = function () {
  if (userRole !== "teacher") return;
  contentItemsDraft.push(newContentItem("truefalse"));
  renderContentItemsEditor();
};
document.getElementById("btn-add-short").onclick = function () {
  if (userRole !== "teacher") return;
  contentItemsDraft.push(newContentItem("short"));
  renderContentItemsEditor();
};
document.getElementById("btn-add-app").onclick = function () {
  if (userRole !== "teacher") return;
  contentItemsDraft.push(newContentItem("app"));
  renderContentItemsEditor();
};
document.getElementById("btn-add-line-trace-app").onclick = function () {
  if (userRole !== "teacher") return;
  contentItemsDraft.push({
    ...newContentItem("app"),
    appTitle: "Çizgi Oyunu",
    appLink: "/line-trace-runner/index.html",
    requiredMinutes: 2
  });
  renderContentItemsEditor();
};
document.getElementById("btn-add-sample").onclick = function () {
  if (userRole !== "teacher") return;
  contentItemsDraft.push(
    { ...newContentItem("heading"), text: "Örnek Çalışma Başlığı" },
    { ...newContentItem("paragraph"), text: "Bu bölümde öğrenciler konuya giriş yapar ve temel kavramları öğrenir." },
    { ...newContentItem("image"), src: "" },
    { ...newContentItem("quiz"), question: "Örnek Soru?", options: ["A", "B", "C", "D"], correct: "A" },
    { ...newContentItem("app"), appTitle: "Örnek Uygulama", appLink: "https://example.com" }
  );
  renderContentItemsEditor();
};

document.getElementById("btn-save-content").onclick = async function () {
  if (userRole !== "teacher") return;
  const title = document.getElementById("content-title").value.trim();
  const description = document.getElementById("content-desc").value.trim();
  const targetClass = document.getElementById("content-target-class").value.trim();
  const targetSection = document.getElementById("content-target-section").value.trim();
  if (!title) {
    showNotice("İçerik başlığı zorunlu!", "#e74c3c");
    return;
  }
  const payload = {
    title,
    description,
    targetClass,
    targetSection,
    items: contentItemsDraft,
    userId: currentUserId,
    createdAt: serverTimestamp()
  };
  try {
    if (selectedContentId) {
      await updateDoc(doc(db, "contents", selectedContentId), payload);
    } else {
      const ref = await addDoc(collection(db, "contents"), payload);
      selectedContentId = ref.id;
    }
    showNotice("İçerik kaydedildi!", "#2ecc71");
    loadContents();
  } catch (e) {
    showNotice("İçerik kaydedilemedi: " + e.message, "#e74c3c");
  }
};

document.getElementById("btn-delete-content").onclick = async function () {
  if (userRole !== "teacher") return;
  if (!selectedContentId) {
    showNotice("Silinecek içerik seçin!", "#e74c3c");
    return;
  }
  const ok = await confirmDialog("İçeriği ve ilişkili verileri tamamen silmek istiyor musunuz?");
  if (!ok) return;
  try {
    // içerik dokümanı
    await deleteDoc(doc(db, "contents", selectedContentId));
    // içerik atamaları
    const aq = query(collection(db, "contentAssignments"), where("contentId", "==", selectedContentId));
    const asnap = await getDocs(aq);
    const batch = writeBatch(db);
    asnap.forEach((d) => batch.delete(d.ref));
    if (!asnap.empty) await batch.commit();
    // içerik progress kayıtları
    const pq = query(collection(db, "contentProgress"), where("contentId", "==", selectedContentId));
    const psnap = await getDocs(pq);
    const batch2 = writeBatch(db);
    psnap.forEach((d) => batch2.delete(d.ref));
    if (!psnap.empty) await batch2.commit();

    showNotice("İçerik tamamen silindi.", "#e74c3c");
    allContents = allContents.filter(c => c.id !== selectedContentId);
    selectedContentId = null;
    contentItemsDraft = [];
    renderContentList();
  } catch (e) {
    showNotice("İçerik silinemedi: " + e.message, "#e74c3c");
  }
};

document.getElementById("btn-preview-content").onclick = function () {
  const content = {
    id: selectedContentId || "preview",
    title: document.getElementById("content-title").value,
    description: document.getElementById("content-desc").value,
    items: contentItemsDraft
  };
  selectContentForView(content);
};

/* ================= AUTH DURUM İZLEME ================= */
onAuthStateChanged(auth, (user) => {
  const loginScreen = document.getElementById("login-screen");
  const appScreen = document.getElementById("app-screen");

  if (!user) {
    logoutInProgress = false;
    if (userProfileUnsub) {
      try { userProfileUnsub(); } catch (e) {}
      userProfileUnsub = null;
    }
    ensureLoggedOutView();
    currentUserId = null;
    userRole = null;
    userData = null;
    teacherOwnerAliasTokens = new Set();
    if (progressUnsub) progressUnsub();
    progressUnsub = null;
    if (contentUnsub) contentUnsub();
    contentUnsub = null;
    if (assignmentUnsub) assignmentUnsub();
    assignmentUnsub = null;
    if (blockAssignmentsUnsub) blockAssignmentsUnsub();
    blockAssignmentsUnsub = null;
    if (blockAssignmentProgressUnsub) blockAssignmentProgressUnsub();
    blockAssignmentProgressUnsub = null;
    if (blockTeacherProgressUnsub) blockTeacherProgressUnsub();
    blockTeacherProgressUnsub = null;
    if (computeAssignmentsUnsub) computeAssignmentsUnsub();
    computeAssignmentsUnsub = null;
    if (computeAssignmentProgressUnsub) computeAssignmentProgressUnsub();
    computeAssignmentProgressUnsub = null;
    if (computeStateUnsub) computeStateUnsub();
    computeStateUnsub = null;
    if (computeReportLevelsUnsub) computeReportLevelsUnsub();
    computeReportLevelsUnsub = null;
    if (computeTeacherProgressUnsub) computeTeacherProgressUnsub();
    computeTeacherProgressUnsub = null;
    if (lessonsUnsub) lessonsUnsub();
    lessonsUnsub = null;
    if (lessonProgressUnsub) lessonProgressUnsub();
    lessonProgressUnsub = null;
    if (liveQuizUnsub) liveQuizUnsub();
    liveQuizUnsub = null;
    stopTeacherHomeQuizListener();
    if (liveSessionUnsub) liveSessionUnsub();
    liveSessionUnsub = null;
    if (liveSessionScoresUnsub) liveSessionScoresUnsub();
    liveSessionScoresUnsub = null;
    if (liveSessionAnswersUnsub) liveSessionAnswersUnsub();
    liveSessionAnswersUnsub = null;
    stopTeacherLiveTicker();
    if (studentLiveSessionUnsub) studentLiveSessionUnsub();
    studentLiveSessionUnsub = null;
    stopStudentLiveScoresListener();
    lastLiveInviteSessionId = null;
    closeLivePlayer();
    const invite = document.getElementById("live-quiz-invite");
    if (invite) invite.style.display = "none";
    if (activityProgressUnsub) activityProgressUnsub();
    activityProgressUnsub = null;
    activityProgressMap.clear();
    blockAssignmentProgressMap.clear();
    blockTeacherCompletedCountMap.clear();
    computeAssignmentProgressMap.clear();
    computeTeacherCompletedCountMap.clear();
    studentComputeStateCompletedLevels = 0;
    studentComputeReportCompletedLevels = 0;
    lessonProgressMap.clear();
    lessons = [];
    blockAssignments = [];
    computeAssignments = [];
    contentProgressMap.clear();
    stopSystemTimer();
    sessionStart = null;
    baseSystemSeconds = 0;
    currentUserKey = null;
    const timeWidget = document.getElementById("student-total-time");
    if (timeWidget) timeWidget.style.display = "none";
    const createBtn = document.getElementById("btn-open-create");
    if (createBtn) createBtn.style.display = "none";
    const studentsBtn = document.getElementById("btn-open-students");
    if (studentsBtn) studentsBtn.style.display = "none";
    const classesBtn = document.getElementById("btn-open-classes");
    if (classesBtn) classesBtn.style.display = "none";
    const addStudentBtn = document.getElementById("btn-open-add-student");
    if (addStudentBtn) addStudentBtn.style.display = "none";
    const booksBtn = document.getElementById("btn-open-books");
    if (booksBtn) booksBtn.style.display = "none";
    const approvalsBtn = document.getElementById("btn-open-approvals");
    if (approvalsBtn) approvalsBtn.style.display = "none";
    const tasksBtn = document.getElementById("btn-open-tasks");
    if (tasksBtn) tasksBtn.style.display = "none";
    const reportsBtn = document.getElementById("btn-open-reports");
    if (reportsBtn) reportsBtn.style.display = "none";
    const loginCardsBtn = document.getElementById("btn-open-login-cards");
    if (loginCardsBtn) loginCardsBtn.style.display = "none";
    const studentDataToggleBtn = document.getElementById("btn-toggle-student-data-menu");
    if (studentDataToggleBtn) studentDataToggleBtn.style.display = "none";
    const contentBtn = document.getElementById("btn-open-content");
    if (contentBtn) contentBtn.style.display = "none";
    const profileBtn = document.getElementById("btn-open-profile");
    if (profileBtn) profileBtn.style.display = "none";
    const blockMenuBtn = document.getElementById("btn-open-block-runner-menu");
    if (blockMenuBtn) blockMenuBtn.style.display = "none";
    const block3DMenuBtn = document.getElementById("btn-open-block-3d-menu");
    if (block3DMenuBtn) block3DMenuBtn.style.display = "none";
    const computeMenuBtn = document.getElementById("btn-open-compute-it-menu");
    if (computeMenuBtn) computeMenuBtn.style.display = "none";
    const flowchartBtn = document.getElementById("btn-open-flowchart-app");
    if (flowchartBtn) flowchartBtn.style.display = "none";
    const lineTraceBtn = document.getElementById("btn-open-line-trace-menu");
    if (lineTraceBtn) lineTraceBtn.style.display = "none";
    const avatarShopBtn = document.getElementById("btn-open-avatar-shop");
    if (avatarShopBtn) avatarShopBtn.style.display = "none";
    const addMenuToggleBtn = document.getElementById("btn-toggle-add-menu");
    if (addMenuToggleBtn) addMenuToggleBtn.style.display = "none";
    const tasksMenuToggleBtn = document.getElementById("btn-toggle-tasks-menu");
    if (tasksMenuToggleBtn) tasksMenuToggleBtn.style.display = "none";
    const appsMenuToggleBtn = document.getElementById("btn-toggle-apps-menu");
    if (appsMenuToggleBtn) appsMenuToggleBtn.style.display = "none";
    setSidebarSubmenuState("submenu-add", "btn-toggle-add-menu", false);
    setSidebarSubmenuState("submenu-tasks", "btn-toggle-tasks-menu", false);
    setSidebarSubmenuState("submenu-apps", "btn-toggle-apps-menu", false);
    const profileMenuItem = document.getElementById("btn-open-profile-menu");
    if (profileMenuItem) profileMenuItem.style.display = "none";
    const lessonsListMenuBtn = document.getElementById("btn-open-lessons");
    if (lessonsListMenuBtn) lessonsListMenuBtn.style.display = "none";
    const myStatsBtn = document.getElementById("btn-open-my-stats");
    if (myStatsBtn) myStatsBtn.style.display = "none";
    const quizSection = document.getElementById("quiz-section");
    if (quizSection) quizSection.style.display = "none";
    const certificatesBtn = document.getElementById("btn-open-certificates");
    if (certificatesBtn) certificatesBtn.style.display = "none";
    const teacherCertificatesBtn = document.getElementById("btn-open-teacher-certificates");
    if (teacherCertificatesBtn) teacherCertificatesBtn.style.display = "none";
    setSidebarSubmenuState("submenu-student-data", "btn-toggle-student-data-menu", false);
    if (certificatesModal) certificatesModal.style.display = "none";
    if (teacherCertificatesModal) teacherCertificatesModal.style.display = "none";
    const loginCardsModal = document.getElementById("login-cards-modal");
    if (loginCardsModal) loginCardsModal.style.display = "none";
    closeAvatarShopModal();
    closeAppsHubModal();
    closeStudentAiPanel();
    studentAiMessages = [];
    setStudentAiVisibility();
    const homeOverviewStrip = document.getElementById("home-overview-strip");
    if (homeOverviewStrip) homeOverviewStrip.style.display = "none";
    const teacherAnalytics = document.getElementById("teacher-analytics");
    if (teacherAnalytics) teacherAnalytics.style.display = "none";
    const teacherLessonsModal = document.getElementById("teacher-lessons-modal");
    if (teacherLessonsModal) teacherLessonsModal.style.display = "none";
    classSectionCatalog = [];
    applyClassSectionDropdownBindings();
    return;
  }

  if (logoutInProgress) return;
  currentUserId = user.uid;
  contentProgressMap.clear();
  blockAssignmentProgressMap.clear();
  computeAssignmentProgressMap.clear();
  lessonProgressMap.clear();
  lessons = [];
  activeComputeAssignmentId = null;
  sessionStart = null;
  baseSystemSeconds = 0;
  currentUserKey = `sysTime_${user.uid}`;
  if (progressUnsub) progressUnsub();
  progressUnsub = null;

  if (userProfileUnsub) {
    try { userProfileUnsub(); } catch (e) {}
    userProfileUnsub = null;
  }
  userProfileUnsub = onSnapshot(doc(db, "users", user.uid), async (snap) => {
    if (logoutInProgress) return;
    if (!auth.currentUser || auth.currentUser.uid !== user.uid) return;
    if (!snap.exists()) {
      try {
        const deletedSnap = await getDoc(doc(db, "deletedAuthUsers", user.uid));
        if (deletedSnap.exists()) {
          showNotice("Bu kullanıcı hesabı silinmiştir. Giriş engellendi.", "#e74c3c");
          await signOut(auth);
          return;
        }
      } catch {}
      const fallbackProfile = await resolveExistingUserProfileByAuth(user);
      if (!fallbackProfile) {
        showNotice("Bu hesap için sistem profili bulunamadı. Yönetici ile iletişime geçin.", "#e74c3c");
        await signOut(auth);
        return;
      }
      const fallbackData = fallbackProfile?.data || {};
      const inferredRole = normalizeUserRole(
        fallbackData.role || (fallbackData.isTeacher ? "teacher" : "student")
      );
      userData = {
        username: fallbackData.username || user.email || "kullanici",
        firstName: fallbackData.firstName || "",
        lastName: fallbackData.lastName || "",
        className: fallbackData.className || "",
        section: fallbackData.section || "",
        role: inferredRole,
        xp: Math.max(0, Number(fallbackData.xp || 0)),
        ownedAvatarIds: normalizeOwnedAvatarIds(fallbackData.ownedAvatarIds),
        selectedAvatarId: String(fallbackData.selectedAvatarId || AVATAR_DEFAULT_ID)
      };
      if (!userData.ownedAvatarIds.includes(userData.selectedAvatarId)) {
        userData.ownedAvatarIds = normalizeOwnedAvatarIds([...userData.ownedAvatarIds, userData.selectedAvatarId]);
      }
      if (isForcedTeacherAlias(user, userData) || await shouldPromoteToTeacherByAlias(user, userData.role)) {
        userData.role = "teacher";
      }
      userData.id = user.uid;
      userRole = userData.role;
      try {
        await setDoc(doc(db, "users", user.uid), {
          ...userData,
          migratedFromUid: fallbackProfile?.id || "",
          createdAt: serverTimestamp()
        }, { merge: true });
        showNotice("Hesap profili yüklendi. Yönlendiriliyor...", "#2ecc71");
      } catch (e) {
        console.warn("Kullanıcı dokümanı yazılamadı, geçici profil ile devam ediliyor:", e);
        showNotice("Profil kaydı eksik, geçici profil ile devam ediliyor.", "#f39c12");
      }
    } else {
      userData = snap.data();
      userData.id = user.uid;
      userData.role = normalizeUserRole(userData.role);
      userData.ownedAvatarIds = normalizeOwnedAvatarIds(userData.ownedAvatarIds);
      userData.selectedAvatarId = String(userData.selectedAvatarId || AVATAR_DEFAULT_ID);
      if (!userData.ownedAvatarIds.includes(userData.selectedAvatarId)) {
        userData.ownedAvatarIds = normalizeOwnedAvatarIds([...userData.ownedAvatarIds, userData.selectedAvatarId]);
      }
      if (isForcedTeacherAlias(user, userData) || await shouldPromoteToTeacherByAlias(user, userData.role)) {
        userData.role = "teacher";
      }
      userRole = userData.role;
      if (snap.data()?.role !== userData.role) {
        try {
          await updateDoc(doc(db, "users", user.uid), { role: userData.role });
        } catch (e) {
          console.warn("Kullanıcı rolü normalize edilemedi:", e);
        }
      }
    }
    if (userRole === "teacher") {
      await refreshTeacherOwnerAliasTokens();
    } else {
      teacherOwnerAliasTokens = new Set();
    }
    
    loginScreen.classList.add("hidden");
    appScreen.style.display = "grid";
    document.getElementById("open-menu").style.display = "block";

    const displayFirst = userData.firstName || "";
    const displayLast = userData.lastName || "";
    const fallbackName = userData.username ? userData.username.split("@")[0] : "Kullanıcı";
    const fullName = (displayFirst || displayLast) ? `${displayFirst} ${displayLast}`.trim() : fallbackName;
    const welcomeLabel = document.getElementById("user-welcome");
    const fullNameEl = document.getElementById("user-fullname");
    const userMenuTrigger = document.getElementById("user-menu-trigger");
    if (fullNameEl) {
      fullNameEl.innerText = userRole === "student" ? `Hoş geldin, ${fullName}` : "";
    }
    if (welcomeLabel) {
      welcomeLabel.innerText = userRole === "teacher" ? "Hoş geldin, " + fullName + " Öğrt." : "";
    }
    if (userMenuTrigger) {
      userMenuTrigger.innerText = userRole === "teacher" ? `Hoş geldin, ${fullName}` : `Hoş geldin, ${fullName}`;
    }

    const isTeacher = userRole === "teacher";
    const sideMenu = document.getElementById("side-menu");
    if (sideMenu) sideMenu.classList.toggle("student-minimal", !isTeacher);
    if (appScreen) {
      appScreen.classList.toggle("teacher-view", isTeacher);
      appScreen.classList.toggle("student-view", !isTeacher);
    }

    document.getElementById("teacher-panel").style.display = isTeacher ? "block" : "none";
    const studentHomeworkShell = document.getElementById("student-homework-shell");
    if (studentHomeworkShell) studentHomeworkShell.style.display = isTeacher ? "" : "block";
    const studentAppsShell = document.getElementById("student-apps-shell");
    if (studentAppsShell) studentAppsShell.style.display = isTeacher ? "" : "block";
    document.getElementById("student-stats-bar").style.display = isTeacher ? "none" : "block";
    document.getElementById("student-tabs").style.display = isTeacher ? "none" : "flex";
    document.getElementById("teacher-stats").style.display = isTeacher ? "block" : "none";
    document.getElementById("teacher-filters").style.display = "none";
    document.getElementById("tasks-title").innerText = isTeacher ? "📚 Verilen Ödevler" : "📚 Ödevlerim";
    document.getElementById("leaderboard-section").style.display = isTeacher ? "none" : "block";
    document.getElementById("activities-title").innerText = isTeacher ? "🎯 Verilen Etkinlikler" : "🎯 Etkinliklerim";
    document.getElementById("activities-tabs").style.display = isTeacher ? "none" : "flex";
    document.getElementById("activities-teacher-stats").style.display = isTeacher ? "block" : "none";
    const blockTitle = document.getElementById("block-homework-title");
    if (blockTitle) blockTitle.innerText = isTeacher ? "🧩 3D & Blok Code Ödevleri" : "🧩 Blok Kodlama Ödevim";
    const blockAssignTabs = document.getElementById("block-homework-assign-tabs");
    if (blockAssignTabs) blockAssignTabs.style.display = isTeacher ? "flex" : "none";
    const blockTabs = document.getElementById("block-homework-tabs");
    if (blockTabs) blockTabs.style.display = isTeacher ? "none" : "flex";
    const blockTeacherStats = document.getElementById("block-homework-teacher-stats");
    if (blockTeacherStats) blockTeacherStats.style.display = isTeacher ? "block" : "none";
    const blockFilters = document.getElementById("block-homework-filters");
    if (blockFilters) blockFilters.style.display = "none";
    const blockCreateBtn = document.getElementById("btn-create-block-homework");
    if (blockCreateBtn) blockCreateBtn.style.display = isTeacher ? "inline-flex" : "none";
    if (isTeacher) {
      switchBlockAssignTab(currentBlockAssignType);
    } else {
      setBlockAssignCreateButton("block2d");
    }
    const computeTitle = document.getElementById("compute-homework-title");
    if (computeTitle) computeTitle.innerText = isTeacher ? "🧠 Verilen Compute It Ödevleri" : "🧠 Compute It Ödevim";
    const computeTabs = document.getElementById("compute-homework-tabs");
    if (computeTabs) computeTabs.style.display = isTeacher ? "none" : "flex";
    const computeTeacherStats = document.getElementById("compute-homework-teacher-stats");
    if (computeTeacherStats) computeTeacherStats.style.display = isTeacher ? "block" : "none";
    const computeFilters = document.getElementById("compute-homework-filters");
    if (computeFilters) computeFilters.style.display = "none";
    const computeCreateBtn = document.getElementById("btn-create-compute-homework");
    if (computeCreateBtn) computeCreateBtn.style.display = isTeacher ? "inline-flex" : "none";
    const activityFilters = document.getElementById("activity-filters");
    if (activityFilters) activityFilters.style.display = "none";
    const createBtn = document.getElementById("btn-open-create");
    if (createBtn) createBtn.style.display = isTeacher ? "block" : "none";
    const studentsBtn = document.getElementById("btn-open-students");
    if (studentsBtn) studentsBtn.style.display = isTeacher ? "block" : "none";
    const classesBtn = document.getElementById("btn-open-classes");
    if (classesBtn) classesBtn.style.display = isTeacher ? "block" : "none";
    const addStudentBtn = document.getElementById("btn-open-add-student");
    if (addStudentBtn) addStudentBtn.style.display = isTeacher ? "block" : "none";
    const booksBtn = document.getElementById("btn-open-books");
    if (booksBtn) booksBtn.style.display = isTeacher ? "block" : "none";
    const approvalsBtn = document.getElementById("btn-open-approvals");
    if (approvalsBtn) approvalsBtn.style.display = isTeacher ? "block" : "none";
    const tasksBtn = document.getElementById("btn-open-tasks");
    if (tasksBtn) tasksBtn.style.display = isTeacher ? "block" : "none";
    const tasksMenuToggleBtn = document.getElementById("btn-toggle-tasks-menu");
    if (tasksMenuToggleBtn) {
      const hasTaskItems = isTeacher && !!((createBtn && createBtn.style.display !== "none") || (tasksBtn && tasksBtn.style.display !== "none") || (approvalsBtn && approvalsBtn.style.display !== "none"));
      tasksMenuToggleBtn.style.display = hasTaskItems ? "block" : "none";
    }
    const reportsBtn = document.getElementById("btn-open-reports");
    if (reportsBtn) reportsBtn.style.display = isTeacher ? "block" : "none";
    const loginCardsBtn = document.getElementById("btn-open-login-cards");
    if (loginCardsBtn) loginCardsBtn.style.display = isTeacher ? "block" : "none";
    const contentBtn = document.getElementById("btn-open-content");
    if (contentBtn) {
      contentBtn.style.display = isTeacher ? "block" : "none";
      contentBtn.innerText = "🧩 Etkinlik Ekle";
    }
    const addMenuToggleBtn = document.getElementById("btn-toggle-add-menu");
    if (addMenuToggleBtn) {
      const hasAddItems = isTeacher && !!((contentBtn && contentBtn.style.display !== "none") || (booksBtn && booksBtn.style.display !== "none") || (addStudentBtn && addStudentBtn.style.display !== "none"));
      addMenuToggleBtn.style.display = hasAddItems ? "block" : "none";
    }
    const blockMenuBtn = document.getElementById("btn-open-block-runner-menu");
    if (blockMenuBtn) blockMenuBtn.style.display = isTeacher ? "block" : "none";
    const block3DMenuBtn = document.getElementById("btn-open-block-3d-menu");
    if (block3DMenuBtn) block3DMenuBtn.style.display = isTeacher ? "block" : "none";
    const computeMenuBtn = document.getElementById("btn-open-compute-it-menu");
    if (computeMenuBtn) computeMenuBtn.style.display = isTeacher ? "block" : "none";
    const flowchartBtn = document.getElementById("btn-open-flowchart-app");
    if (flowchartBtn) flowchartBtn.style.display = isTeacher ? "block" : "none";
    const lineTraceBtn = document.getElementById("btn-open-line-trace-menu");
    if (lineTraceBtn) lineTraceBtn.style.display = isTeacher ? "block" : "none";
    const avatarShopBtn = document.getElementById("btn-open-avatar-shop");
    if (avatarShopBtn) avatarShopBtn.style.display = isTeacher ? "none" : "block";
    const appsMenuToggleBtn = document.getElementById("btn-toggle-apps-menu");
    if (appsMenuToggleBtn) appsMenuToggleBtn.style.display = isTeacher ? "block" : "none";
    const lessonsListMenuBtn = document.getElementById("btn-open-lessons");
    if (lessonsListMenuBtn) lessonsListMenuBtn.style.display = isTeacher ? "block" : "none";
    const liveQuizMenuBtn = document.getElementById("btn-open-live-quiz");
    if (liveQuizMenuBtn) liveQuizMenuBtn.style.display = isTeacher ? "block" : "none";
    const homeBtn = document.getElementById("btn-open-home");
    if (homeBtn) homeBtn.style.display = "block";
    if (!isTeacher) {
      setSidebarSubmenuState("submenu-add", "btn-toggle-add-menu", false);
      setSidebarSubmenuState("submenu-tasks", "btn-toggle-tasks-menu", false);
      setSidebarSubmenuState("submenu-apps", "btn-toggle-apps-menu", false);
      setSidebarSubmenuState("submenu-student-data", "btn-toggle-student-data-menu", false);
    }
    const profileBtn = document.getElementById("btn-open-profile");
    if (profileBtn) profileBtn.style.display = "none";
    applyUserDropdownMenuByRole(isTeacher);
    const myStatsBtn = document.getElementById("btn-open-my-stats");
    if (myStatsBtn) myStatsBtn.style.display = isTeacher ? "none" : "block";
    const certificatesBtn = document.getElementById("btn-open-certificates");
    if (certificatesBtn) certificatesBtn.style.display = isTeacher ? "none" : "block";
    const teacherCertificatesBtn = document.getElementById("btn-open-teacher-certificates");
    if (teacherCertificatesBtn) teacherCertificatesBtn.style.display = isTeacher ? "block" : "none";
    const studentDataToggleBtn = document.getElementById("btn-toggle-student-data-menu");
    if (studentDataToggleBtn) {
      const hasStudentDataItems = isTeacher && !!(
        (classesBtn && classesBtn.style.display !== "none")
        || (studentsBtn && studentsBtn.style.display !== "none")
        || (reportsBtn && reportsBtn.style.display !== "none")
        || (loginCardsBtn && loginCardsBtn.style.display !== "none")
        || (teacherCertificatesBtn && teacherCertificatesBtn.style.display !== "none")
      );
      studentDataToggleBtn.style.display = hasStudentDataItems ? "block" : "none";
    }
    if (!isTeacher) {
      applyStudentSidebarMinimalMode();
      setSidebarSubmenuState("submenu-student-data", "btn-toggle-student-data-menu", false);
    }
    if (isTeacher && certificatesModal) certificatesModal.style.display = "none";
    if (!isTeacher && teacherCertificatesModal) teacherCertificatesModal.style.display = "none";
    if (!isTeacher) {
      closeFlowchartModal();
    }
    setStudentAiVisibility();
    const homeOverviewStrip = document.getElementById("home-overview-strip");
    if (homeOverviewStrip) homeOverviewStrip.style.display = "none";
    const teacherAnalytics = document.getElementById("teacher-analytics");
    if (teacherAnalytics) teacherAnalytics.style.display = isTeacher ? "flex" : "none";
    const quizSection = document.getElementById("quiz-section");
    if (quizSection) quizSection.style.display = isTeacher ? "flex" : "none";
    const topStudentsCard = document.getElementById("top-students-card");
    if (topStudentsCard) topStudentsCard.style.display = isTeacher ? "block" : "none";
    const lessonsTitle = document.getElementById("lessons-title");
    if (lessonsTitle) lessonsTitle.innerText = isTeacher ? "📑 Verilen Dersler" : "📑 Derslerim";
    const lessonsTabs = document.getElementById("lessons-tabs");
    if (lessonsTabs) lessonsTabs.style.display = isTeacher ? "none" : "flex";
    const lessonsTeacherStats = document.getElementById("lessons-teacher-stats");
    if (lessonsTeacherStats) lessonsTeacherStats.style.display = isTeacher ? "block" : "none";
    baseSystemSeconds = userData?.totalTimeSeconds || 0;
    if (currentUserKey) {
      const pending = Number(localStorage.getItem(currentUserKey) || "0");
      if (pending > baseSystemSeconds) {
        baseSystemSeconds = pending;
      }
    }
    const timeWidget = document.getElementById("student-total-time");
    if (timeWidget) timeWidget.style.display = "flex";
    startSystemTimer();
    if (!isTeacher) updateUserXPDisplay();
    renderHeaderAvatar();

    if (!isTeacher) {
      stopTeacherHomeQuizListener();
      if (liveSessionUnsub) liveSessionUnsub();
      liveSessionUnsub = null;
      if (liveSessionScoresUnsub) liveSessionScoresUnsub();
      liveSessionScoresUnsub = null;
      if (liveSessionAnswersUnsub) liveSessionAnswersUnsub();
      liveSessionAnswersUnsub = null;
      stopTeacherLiveTicker();
      loadStudentCompletions(user.uid);
      startContentProgressListener();
      startBookTaskProgressListener();
      startStudentLiveQuizListener();
    } else {
      if (studentLiveSessionUnsub) studentLiveSessionUnsub();
      studentLiveSessionUnsub = null;
      stopStudentLiveScoresListener();
      lastLiveInviteSessionId = null;
      loadTeacherStats(user.uid);
      startActivityProgressListener();
      startTeacherHomeQuizListener();
      listenTeacherLiveSession();
    }
    renderHomeOverviewStrip();

    if (!isTeacher) {
      switchTab("pending");
      switchActivityTab("pending");
      switchBlockHomeworkTab("pending");
      switchComputeHomeworkTab("pending");
      switchLessonTab("pending");
      setStudentCombinedTab("homework", "pending");
      setStudentCombinedTab("apps", "pending");
      renderStudentCombinedSections();
      currentBlockHomeworkFilter = "all";
      currentComputeHomeworkFilter = "all";
    } else {
      currentFilter = "all";
      currentActivityFilter = "all";
      currentBlockHomeworkFilter = "all";
      currentComputeHomeworkFilter = "all";
      filterTasks("all");
      filterActivities("all");
      filterBlockHomework("all");
      filterComputeHomework("all");
    }

    // sistemde kalma süresi sayacı
    sessionStart = Date.now();
    if (window._sessionTimer) clearInterval(window._sessionTimer);
    window._sessionTimer = setInterval(() => {
      // canlı sayaç gerekirse buradan UI güncellenebilir
    }, 1000);

    if (isTeacher) await ensureStudentsCache();
    if (isTeacher) await refreshAndApplyClassSectionDropdowns();
    else {
      classSectionCatalog = [];
      applyClassSectionDropdownBindings();
    }
    loadTasks();
    loadContentAssignments();
    loadBlockAssignments();
    loadComputeAssignments();
    loadLessons();
    if (!isTeacher) loadLeaderboard();
    if (isTeacher) loadStatsPage();
  });
});

/* ================= ÖĞRENCİ TAMAMLANAN ÖDEVLERİ ================= */
function loadStudentCompletions(userId) {
  console.log("Öğrenci completions dinleniyor:", userId);
  
  isCompletionsLoaded = false;
  const q = query(collection(db, "completions"), where("userId", "==", userId));
  
  onSnapshot(q, (snap) => {
    console.log("Completions güncellendi, sayı:", snap.size);
    
    completedTasks.clear();
    let totalXP = 0;
    
    snap.forEach((doc) => {
      const data = doc.data();
      completedTasks.set(data.taskId, {
        completionId: doc.id,
        correctAnswers: data.correctAnswers,
        totalQuestions: data.totalQuestions,
        xpEarned: data.xpEarned || 0,
        duration: data.duration,
        completedAt: data.completedAt
      });
      totalXP += data.xpEarned || 0;
    });
    
    document.getElementById("stat-completed").innerText = completedTasks.size;
    updateUserXPDisplay(totalXP);
    
    isCompletionsLoaded = true;
    
    if (isTasksLoaded) {
      console.log("Her iki veri hazır, liste güncelleniyor");
      updateTaskLists();
    }
    
  }, (error) => {
    console.error("Completions dinleme hatası:", error);
  });
}

/* ================= ÖDEVLERİ YÜKLE ================= */
function loadTasks() {
  console.log("Tasks yükleniyor...");
  
  isTasksLoaded = false;
  const q = query(collection(db, "activities"));

  onSnapshot(q, (snap) => {
    console.log("Tasks güncellendi, sayı:", snap.size);
    
    allTasks = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (userRole === "teacher" && !recordBelongsToCurrentTeacher(data)) return;
      allTasks.push({ 
        id: doc.id, 
        ...data,
        createdAtDate: data.createdAt ? data.createdAt.toDate() : new Date()
      });
    });
    
    allTasks.sort((a, b) => b.createdAtDate - a.createdAtDate);
    
    if (userRole === "teacher") {
      allTasks.forEach(task => {
        listenTaskStats(task.id);
      });
      const visibleTaskCount = allTasks.filter((t) => !t?.isDeleted).length;
      document.getElementById("teacher-task-count").innerText = visibleTaskCount;
    }
    
    isTasksLoaded = true;
    
    if (isCompletionsLoaded || userRole === "teacher") {
      console.log("Tasks hazır, liste güncelleniyor");
      updateTaskLists();
    }
    
    if (userRole === "teacher") {
      loadStatsPage();
    }
    
  }, (error) => {
    console.error("Tasks dinleme hatası:", error);
  });
}

/* ================= LİSTEYİ GÜNCELLE ================= */
function updateTaskLists() {
  console.log("=== LİSTE GÜNCELLENİYOR ===");
  console.log("Toplam task:", allTasks.length);
  console.log("Tamamlanan task ID'leri:", Array.from(completedTasks.keys()));
  
  const pendingList = document.getElementById("list-pending");
  const completedList = document.getElementById("list-completed");
  const noPending = document.getElementById("no-pending");
  const noCompleted = document.getElementById("no-completed");
  
  if (!pendingList || !completedList) {
    console.error("List elementleri bulunamadı!");
    return;
  }
  
  pendingList.innerHTML = "";
  completedList.innerHTML = "";
  
  let pendingCount = 0;
  let completedCount = 0;
  const pendingRows = [];
  const completedRows = [];
  
  let filteredTasks = userRole === "teacher" 
    ? allTasks.filter(task => matchesFilter(task))
    : allTasks
        .filter(task => taskMatchesStudent(task))
        .filter((task) => {
          if (!task?.isDeleted) return true;
          const hasCompletion = completedTasks.has(task.id);
          const hasManualProgress = !!bookTaskProgressMap.get(task.id);
          return hasCompletion || hasManualProgress;
        });

  console.log("Filtrelenmiş task sayısı:", filteredTasks.length);
  
  filteredTasks.forEach((task) => {
    const completion = completedTasks.get(task.id);
    const manualProgress = requiresTeacherApprovalTask(task) ? bookTaskProgressMap.get(task.id) : null;
    const isCompleted = completion !== undefined || (manualProgress && manualProgress.approved);
    
    console.log(`Task: ${task.title} (${task.id}) - Tamamlanmış: ${isCompleted}`);
    
    const li = createTaskElement(task, isCompleted, completion, manualProgress);
    
    if (userRole === "teacher") {
      pendingRows.push(li);
      pendingCount++;
      console.log("  -> Öğretmen listesine eklendi");
    } else {
      if (isCompleted) {
        completedRows.push(li);
        completedCount++;
        console.log("  -> Tamamlanan listesine eklendi");
      } else {
        pendingRows.push(li);
        pendingCount++;
        console.log("  -> Bekleyen listesine eklendi");
      }
    }
  });

  renderLimitedRows(pendingList, pendingRows, 3);
  renderLimitedRows(completedList, completedRows, 3);
  homeListCache.tasks = {
    title: userRole === "teacher" ? "Verilen Ödevler" : "Ödevlerim",
    pending: pendingRows.slice(),
    completed: completedRows.slice()
  };
  setShowMoreButton(
    "btn-show-all-tasks",
    pendingRows.length > 3 || completedRows.length > 3,
    () => openAllItemsModal(homeListCache.tasks.title, homeListCache.tasks.pending, homeListCache.tasks.completed)
  );
  
  console.log(`Sonuç: Bekleyen ${pendingCount}, Tamamlanan ${completedCount}`);
  
  if (noPending) noPending.style.display = pendingCount === 0 ? "block" : "none";
  if (noCompleted) noCompleted.style.display = completedCount === 0 ? "block" : "none";
  
  if (userRole !== "teacher") {
    const statCompleted = document.getElementById("stat-completed");
    if (statCompleted) statCompleted.innerText = completedCount;
  }
  
  // Otomatik sekme geçişi kaldırıldı: Bekleyen sekmesi varsayılan kalsın
  renderStudentCombinedSections();
  renderHomeOverviewStrip();
}

function createTaskElement(task, isCompleted, completionData, manualProgress) {
  const li = document.createElement("li");
  li.className = "list-item" + (isCompleted ? " completed" : "");
  
  const now = new Date();
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const isExpired = deadline && deadline < now;
  
  if (isExpired && !isCompleted) {
    li.classList.add('expired');
  }
  
  const stats = taskStats[task.id] || { completedCount: 0 };
  
  let badge = "";
  let timeInfo = "";
  let deadlineInfo = "";
  
  if (userRole === "student") {
    if (requiresTeacherApprovalTask(task)) {
      const status = manualProgress?.status || "none";
      if (manualProgress?.approved) {
        badge = `<span class="badge badge-success">Onaylandı</span>`;
      } else if (status === "finished") {
        badge = `<span class="badge badge-info">Onay Bekliyor</span>`;
      } else if (status === "started") {
        badge = `<span class="badge badge-warning">Başlandı</span>`;
      } else if (isExpired) {
        badge = `<span class="badge badge-danger">Süresi Doldu</span>`;
      } else {
        badge = `<span class="badge badge-pending">Bekliyor</span>`;
      }
    } else if (isCompleted) {
      const percentage = Math.round((completionData.correctAnswers / completionData.totalQuestions) * 100);
      badge = `<span class="badge badge-success">%${percentage}</span>`;
      if (completionData.duration) {
        const mins = Math.floor(completionData.duration / 60);
        const secs = completionData.duration % 60;
        timeInfo = `<small style="color:#666;display:block;margin-top:4px;">⏱️ ${mins}dk ${secs}sn</small>`;
      }
    } else {
      if (isExpired) {
        badge = `<span class="badge badge-danger">Süresi Doldu</span>`;
      } else {
        badge = `<span class="badge badge-pending">Bekliyor</span>`;
      }
      
      if (deadline) {
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0) {
          deadlineInfo = `<small style="color:${daysLeft <= 2 ? '#e74c3c' : '#f39c12'};display:block;margin-top:4px;">⏳ ${daysLeft} gün kaldı</small>`;
        } else if (daysLeft === 0) {
          deadlineInfo = `<small style="color:#e74c3c;display:block;margin-top:4px;">⚠️ Bugün son gün!</small>`;
        }
      }
    }
  } else {
    if (requiresTeacherApprovalTask(task)) {
      li.style.background = "linear-gradient(135deg, #fff7ed 0%, #fffbf5 100%)";
      li.style.borderLeft = "4px solid #f59e0b";
    }
    const stats = taskStats[task.id] || { completedCount: 0 };
    const comps = completedTasks.get(task.id) || [];
    const uniqueCount = requiresTeacherApprovalTask(task)
      ? (stats.completedCount || 0)
      : new Set(comps.map(c => c.userId)).size;
    const totalStudents = studentIdSet.size || allStudents.length || 0;
    const suffix = totalStudents ? `/${totalStudents}` : "";
    const controlBadge = requiresTeacherApprovalTask(task)
      ? `<span class="badge badge-danger">🟠 Kontrol Gerekli</span> `
      : "";
    const rewardXP = getTaskRewardXP(task);
    const xpInfo = requiresTeacherApprovalTask(task)
      ? `<small style="color:#7c2d12;display:block;margin-top:4px;">⭐ Onaylanınca +${rewardXP} XP</small>`
      : `<small style="color:#1e40af;display:block;margin-top:4px;">⭐ Tamamlayınca +${rewardXP} XP</small>`;
    badge = `${controlBadge}<span class="badge badge-info">${uniqueCount}${suffix} tamamlama</span>`;
    if (deadline) {
      const dateStr = deadline.toLocaleDateString('tr-TR');
      deadlineInfo = `<small style="color:#666;display:block;margin-top:4px;">📅 ${dateStr}</small>`;
    }
    timeInfo = xpInfo;
  }
  
  li.innerHTML = `
    <div style="flex:1;">
      <div style="font-weight:600;">${task.title}</div>
      ${timeInfo}
      ${deadlineInfo}
    </div>
    ${badge}
  `;
  
  li.onclick = () => {
    if (userRole === "student" && isCompleted) {
      const isManual = requiresTeacherApprovalTask(task);
      const scorePercent = !isManual && Number(completionData?.totalQuestions || 0) > 0
        ? Math.round((Number(completionData.correctAnswers || 0) / Number(completionData.totalQuestions || 1)) * 100)
        : 100;
      const earnedXP = isManual ? MANUAL_TASK_APPROVAL_XP : Math.max(0, Number(completionData?.xpEarned || 0));
      const spentSeconds = isManual ? 0 : Math.max(0, Number(completionData?.duration || 0));
      showCompletionInfoPopup({
        category: "Ödev",
        title: task.title || "Ödev",
        xp: earnedXP,
        seconds: spentSeconds,
        percent: scorePercent,
        message: `Bu ödevi tamamladınız.`
      });
      return;
    }
    openTaskModal(task.id, task, isCompleted);
  };
  return li;
}

/* ================= ÖĞRETMEN İSTATİSTİKLERİ ================= */
function loadTeacherStats(teacherId) {
  const q = query(collection(db, "completions"));
  
  onSnapshot(q, (snap) => {
    console.log("Öğretmen için completions güncellendi:", snap.size);
    
    completedTasks.clear();
    snap.forEach((doc) => {
      const data = doc.data();
      if (!completedTasks.has(data.taskId)) {
        completedTasks.set(data.taskId, []);
      }
      completedTasks.get(data.taskId).push(data);
    });
    
    isCompletionsLoaded = true;
    
    if (isTasksLoaded) {
      updateTaskLists();
    }
  });
  
  const taskQuery = query(collection(db, "activities"), where("userId", "==", teacherId));
  onSnapshot(taskQuery, (snap) => {
    document.getElementById("teacher-task-count").innerText = snap.size;
  });
}

function listenTaskStats(taskId) {
  const task = allTasks.find(t => t.id === taskId);
  if (requiresTeacherApprovalTask(task)) {
    const q = query(collection(db, "bookTaskProgress"), where("taskId", "==", taskId));
    onSnapshot(q, (snap) => {
      let count = 0;
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data?.approved) count++;
      });
      taskStats[taskId] = {
        completedCount: count,
        averageScore: 0,
        averageTime: 0,
        bestTime: 0
      };
      updateTaskLists();
      if (currentTaskId === taskId) updateModalStats(taskId);
    });
    return;
  }
  const q = query(collection(db, "completions"), where("taskId", "==", taskId));
  
  onSnapshot(q, (snap) => {
    let totalScore = 0;
    let count = 0;
    let totalTime = 0;
    let bestTime = Infinity;
    
    snap.forEach((doc) => {
      const data = doc.data();
      const score = (data.correctAnswers / data.totalQuestions) * 100;
      totalScore += score;
      count++;
      
      if (data.duration) {
        totalTime += data.duration;
        if (data.duration < bestTime) bestTime = data.duration;
      }
    });
    
    taskStats[taskId] = {
      completedCount: count,
      averageScore: count > 0 ? Math.round(totalScore / count) : 0,
      averageTime: count > 0 ? Math.round(totalTime / count / 60) : 0,
      bestTime: bestTime !== Infinity ? Math.round(bestTime / 60) : 0
    };
    
    updateTaskLists();
    
    if (currentTaskId === taskId) {
      updateModalStats(taskId);
    }
  });
}

function updateModalStats(taskId) {
  const stats = taskStats[taskId] || { completedCount: 0, averageScore: 0, averageTime: 0, bestTime: 0 };
  document.getElementById("modal-completed-count").innerText = stats.completedCount;
  document.getElementById("modal-avg-score").innerText = stats.averageScore + "%";
  document.getElementById("modal-avg-time").innerText = stats.averageTime + " dk";
  document.getElementById("modal-best-time").innerText = stats.bestTime > 0 ? stats.bestTime + " dk" : "-";
}

/* ================= GİRİŞ / KAYIT ================= */
document.getElementById("btn-login").onclick = async function () {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const loginBtn = document.getElementById("btn-login");

  if (!email || !pass) {
    showNotice("E-posta ve şifre girin!", "#e74c3c");
    return;
  }

  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.innerText = "Giriş yapılıyor...";
  }
  try {
    const candidates = await resolveLoginEmails(email);
    if (!candidates.length) {
      showNotice("Bu kullanıcı sistemde kayıtlı değil.", "#e74c3c");
      return;
    }
    let lastErr = null;
    for (const candidate of candidates) {
      try {
        await signInWithEmailAndPassword(auth, candidate, pass);
        showNotice("Giriş başarılı!", "#2ecc71");
        return;
      } catch (err) {
        lastErr = err;
      }
    }
    showNotice("Giriş Hatalı: " + (lastErr?.message || "Kullanıcı adı/şifre hatalı"), "#e74c3c");
  } finally {
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerText = "Giriş Yap";
    }
  }
};

/* ================= SORU EKLEME ================= */
document.getElementById("task-type").onchange = function (e) {
  document.getElementById("options-area").style.display = e.target.value === "quiz" ? "flex" : "none";
};

document.getElementById("question-image").onchange = function (e) {
  const file = e.target.files && e.target.files[0];
  if (!file) {
    currentQuestionImage = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = function () {
    currentQuestionImage = reader.result;
  };
  reader.readAsDataURL(file);
};

document.getElementById("btn-add-q").onclick = function () {
  const text = document.getElementById("main-question").value;
  const correct = document.getElementById("correct-answer").value;
  const type = document.getElementById("task-type").value;
  const count = parseInt(document.getElementById("q-count").value) || 1;

  if (!text || !correct) {
    showNotice("Soru ve cevap zorunlu!", "#e74c3c");
    return;
  }

  for (let i = 0; i < count; i++) {
    const q = {
      question: count > 1 ? text + " (" + (i + 1) + ")" : text,
      correct: correct.trim().toLowerCase(),
      type: type,
      id: Date.now() + i,
      image: currentQuestionImage || ""
    };

    if (type === "quiz") {
      q.options = [
        document.getElementById("opt-1").value || "A",
        document.getElementById("opt-2").value || "B",
        document.getElementById("opt-3").value || "C",
        document.getElementById("opt-4").value || "D"
      ];
    }

    taskQuestions.push(q);
  }

  document.getElementById("main-question").value = "";
  document.getElementById("correct-answer").value = "";
  const imgInput = document.getElementById("question-image");
  if (imgInput) imgInput.value = "";
  currentQuestionImage = "";
  updatePreview();
  showNotice(count + " soru eklendi!", "#2ecc71");
};

function updatePreview() {
  const preview = document.getElementById("added-questions-preview");
  const counter = document.getElementById("q-counter-display");
  preview.innerHTML = "";

  taskQuestions.forEach((q, i) => {
    const div = document.createElement("div");
    div.style.cssText = "background:#f9f9f9;padding:10px;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;border:1px solid #eee;font-size:0.9rem;";
    div.innerHTML = `
      <span><strong>${i + 1}.</strong> ${q.question} <small>(${q.type})</small></span>
      <button onclick="window.removeQuestion(${i})" style="background:#e74c3c;color:white;border:none;border-radius:5px;width:28px;height:28px;cursor:pointer;">?</button>
    `;
    if (q.image) {
      const img = document.createElement("img");
      img.src = q.image;
      img.style.cssText = "display:block;margin-top:6px;max-width:100%;height:auto;border-radius:6px;border:1px solid #eee;";
      div.appendChild(img);
    }
    preview.appendChild(div);
  });
  counter.innerText = taskQuestions.length;
}

window.removeQuestion = function (i) {
  taskQuestions.splice(i, 1);
  updatePreview();
  showNotice("Soru silindi", "#e74c3c");
};

/* ================= ÖDEV KAYDET ================= */
document.getElementById("btn-save-task").onclick = async function () {
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");
  const deadlineInput = document.getElementById("task-deadline");
  const deadlineTimeInput = document.getElementById("task-deadline-time");
  const bookSelect = document.getElementById("task-book");
  const testSelect = document.getElementById("task-book-test");
  const saveBtn = document.getElementById("btn-save-task");

  if (!titleInput.value) {
    showNotice("Lütfen ödev başlığı yazın!", "#e74c3c");
    return;
  }
  if (!deadlineInput.value) {
    showNotice("Son teslim tarihi zorunludur!", "#e74c3c");
    return;
  }

  let deadline = null;
  if (deadlineTimeInput.value) {
    deadline = new Date(deadlineInput.value + 'T' + deadlineTimeInput.value);
  } else {
    deadline = new Date(deadlineInput.value + 'T23:59');
  }

  try {
    saveBtn.disabled = true;
    saveBtn.innerText = "Yayınlanıyor...";

    const targetValue = document.getElementById("task-target")?.value || "all";
    let targetClass = null;
    let targetSection = null;
    if (targetValue !== "all" && targetValue.startsWith("class:")) {
      const parts = targetValue.split("|");
      targetClass = parts[0].replace("class:", "").trim();
      const sectionPart = parts.find(p => p.startsWith("section:"));
      if (sectionPart) targetSection = sectionPart.replace("section:", "").trim();
    }

    const selectedBookId = bookSelect?.value || "";
    const selectedBook = allBooks.find(b => b.id === selectedBookId);
    const selectedTest = testSelect?.value || "";
    const taskData = {
      title: titleInput.value,
      description: descInput.value || "",
      questions: taskQuestions,
      bookId: selectedBookId || null,
      bookName: selectedBook?.name || null,
      bookTest: selectedTest || null,
      createdAt: serverTimestamp(),
      userId: currentUserId,
      createdBy: auth.currentUser.email,
      targetClass: targetClass,
      targetSection: targetSection
    };

    taskData.deadline = deadline.toISOString();

    await addDoc(collection(db, "activities"), taskData);

    showNotice("Ödev başarıyla yayınlandı!", "#2ecc71");
    
    taskQuestions = [];
    titleInput.value = "";
    if(descInput) descInput.value = "";
    deadlineInput.value = "";
    deadlineTimeInput.value = "";
    if (bookSelect) bookSelect.value = "";
    if (testSelect) {
      testSelect.innerHTML = `<option value="">Test seçiniz</option>`;
      testSelect.disabled = true;
    }
    updatePreview();
    const createModal = document.getElementById("create-task-modal");
    if (createModal) createModal.style.display = "none";
    
    saveBtn.disabled = false;
    saveBtn.innerText = "ÖDEVİ YAYINLA";
  } catch (e) {
    console.error(e);
    showNotice("Hata: " + e.message, "#e74c3c");
    saveBtn.disabled = false;
    saveBtn.innerText = "ÖDEVİ YAYINLA";
  }
};

/* ================= MODAL AÇMA ================= */
async function openTaskModal(id, data, isCompleted = false) {
  currentTaskId = id;
  const modal = document.getElementById("task-modal");
  
  document.getElementById("modal-display-title").innerText = data.title || "Başlıksız";
  document.getElementById("modal-display-desc").innerText = data.description || "Açıklama yok.";
  document.getElementById("edit-section").style.display = "none";
  
  const deadlineDiv = document.getElementById("modal-deadline");
  const deadlineText = document.getElementById("modal-deadline-text");
  
  if (data.deadline) {
    const deadline = new Date(data.deadline);
    const now = new Date();
    const isExpired = deadline < now;
    
    deadlineText.innerText = deadline.toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + (isExpired ? ' (Süresi doldu)' : '');
    
    deadlineDiv.style.display = "block";
    deadlineDiv.className = isExpired ? "deadline-expired" : "";
  } else {
    deadlineDiv.style.display = "none";
  }
  
  if (userRole === "teacher") {
    updateModalStats(id);
    document.getElementById("modal-stats").style.display = "block";
    document.getElementById("teacher-actions").style.display = "flex";
    document.getElementById("student-actions").style.display = "none";
    const bookApproval = document.getElementById("book-approval-section");
    const bookApprovalTitle = document.getElementById("book-approval-title");
    if (requiresTeacherApprovalTask(data)) {
      if (bookApproval) bookApproval.style.display = "block";
      if (bookApprovalTitle) {
        bookApprovalTitle.innerText = isBookOnlyTask(data)
          ? "📘 Kitap/Test Ödevi Onayı"
          : "🗂️ Sorusuz Ödev Onayı";
      }
      await populateClassSectionFilters(
        document.getElementById("book-approve-class"),
        document.getElementById("book-approve-section")
      );
      await loadBookTaskApprovals(data);
    } else {
      if (bookApproval) bookApproval.style.display = "none";
    }
  } else {
    document.getElementById("modal-stats").style.display = "none";
    document.getElementById("teacher-actions").style.display = "none";
    document.getElementById("student-actions").style.display = "block";
    const bookApproval = document.getElementById("book-approval-section");
    if (bookApproval) bookApproval.style.display = "none";
    
    const completion = completedTasks.get(id);
    const completedInfo = document.getElementById("completed-info");
    const startBtn = document.getElementById("btn-start-activity");
    
    if (completion) {
      completedInfo.style.display = "block";
      startBtn.style.display = "none";
      
      const percentage = Math.round((completion.correctAnswers / completion.totalQuestions) * 100);
      document.getElementById("completed-score").innerText = `Başarı: %${percentage} | +${completion.xpEarned} XP`;
      
      if (completion.duration) {
        const mins = Math.floor(completion.duration / 60);
        const secs = completion.duration % 60;
        document.getElementById("completed-time").innerText = `Süre: ${mins} dakika ${secs} saniye`;
      }
    } else {
      completedInfo.style.display = "none";
      startBtn.style.display = "block";
    }

    const bookActions = document.getElementById("book-task-actions");
    const bookStatus = document.getElementById("book-task-status");
    const bookTaskTitle = document.getElementById("book-task-title");
    const bookTaskNote = document.getElementById("book-task-note");
    const btnStarted = document.getElementById("btn-book-started");
    const btnFinished = document.getElementById("btn-book-finished");
    if (requiresTeacherApprovalTask(data)) {
      const prog = await getBookTaskProgress(id, currentUserId);
      const approved = !!prog?.approved;
      startBtn.style.display = "none";
      if (bookTaskTitle) bookTaskTitle.innerText = isBookOnlyTask(data) ? "📗 Kitap/Test Ödevi" : "🗂️ Sorusuz Ödev";
      if (bookTaskNote) {
        bookTaskNote.innerText = isBookOnlyTask(data)
          ? "Not: Bitirdim dediğinizde öğretmen onayı gerekir."
          : "Not: Yaptım dediğinizde öğretmen onayı gerekir.";
      }
      if (btnStarted) btnStarted.style.display = isBookOnlyTask(data) ? "inline-flex" : "none";
      if (btnFinished) btnFinished.innerText = isBookOnlyTask(data) ? "Bitirdim" : "Yaptım";
      if (approved) {
        if (bookActions) bookActions.style.display = "none";
        if (completedInfo) {
          completedInfo.style.display = "block";
          document.getElementById("completed-score").innerText = `✅ Bu ödev tamamlandı ve onaylandı. +${MANUAL_TASK_APPROVAL_XP} XP`;
          document.getElementById("completed-time").innerText = "Ödül XP hesabına işlendi.";
        }
      } else {
        if (bookActions) bookActions.style.display = "block";
        if (completedInfo) completedInfo.style.display = "none";
        const doneText = isBookOnlyTask(data) ? "Bitirdi" : "Yaptı";
        const statusText = prog?.status === "finished"
          ? `Durum: ${doneText} (Onay Bekliyor)`
          : prog?.status === "started"
            ? "Durum: Başlandı"
            : "Durum: Başlanmadı";
        if (bookStatus) bookStatus.innerText = statusText;
      }
    } else {
      if (bookActions) bookActions.style.display = "none";
    }
  }
  
  modal.style.display = "flex";
}

document.getElementById("close-task-modal").onclick = closeModal;

function closeModal() {
  document.getElementById("task-modal").style.display = "none";
  currentTaskId = null;
  document.getElementById("edit-section").style.display = "none";
}

/* ================= ÖDEV DÜZENLEME ================= */
let editingQuestions = [];

document.getElementById("btn-edit-task").onclick = function() {
  const task = allTasks.find(t => t.id === currentTaskId);
  if (!task) return;
  
  document.getElementById("edit-title").value = task.title;
  document.getElementById("edit-desc").value = task.description || "";
  const editBook = document.getElementById("edit-book");
  const editBookTest = document.getElementById("edit-book-test");
  if (editBook) {
    editBook.innerHTML = `<option value="">Kitap seçiniz</option>`;
    allBooks.forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = b.name || "Kitap";
      editBook.appendChild(opt);
    });
    editBook.value = task.bookId || "";
  }
  if (editBookTest) {
    editBookTest.innerHTML = `<option value="">Test seçiniz</option>`;
    editBookTest.disabled = true;
    const book = allBooks.find(b => b.id === (task.bookId || ""));
    const tests = book?.tests || [];
    tests.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      editBookTest.appendChild(opt);
    });
    if (tests.length) editBookTest.disabled = false;
    editBookTest.value = task.bookTest || "";
  }
  
  if (task.deadline) {
    const deadline = new Date(task.deadline);
    document.getElementById("edit-deadline").value = deadline.toISOString().split('T')[0];
    document.getElementById("edit-deadline-time").value = 
      deadline.toISOString().split('T')[1].substring(0, 5);
  } else {
    document.getElementById("edit-deadline").value = "";
    document.getElementById("edit-deadline-time").value = "";
  }
  
  editingQuestions = JSON.parse(JSON.stringify(task.questions || []));
  renderEditQuestions();
  
  document.getElementById("edit-section").style.display = "block";
};

const editBookSelect = document.getElementById("edit-book");
if (editBookSelect) {
  editBookSelect.onchange = function () {
    const editBookTest = document.getElementById("edit-book-test");
    if (!editBookTest) return;
    editBookTest.innerHTML = `<option value="">Test seçiniz</option>`;
    const bookId = editBookSelect.value;
    if (!bookId) {
      editBookTest.disabled = true;
      return;
    }
    const book = allBooks.find(b => b.id === bookId);
    const tests = book?.tests || [];
    tests.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      editBookTest.appendChild(opt);
    });
    editBookTest.disabled = tests.length === 0;
  };
}

function renderEditQuestions() {
  const container = document.getElementById("edit-questions-list");
  container.innerHTML = "";
  
  editingQuestions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question-edit-item";
    
    div.innerHTML = `
      <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom:10px;">
        <strong>Soru ${index + 1}</strong>
        <button onclick="removeEditQuestion(${index})" style="background:#e74c3c;color:white;border:none;border-radius:5px;padding:5px 8px;cursor:pointer;">Sil</button>
      </div>
      <input type="text" value="${q.question}" onchange="updateEditQuestion(${index}, 'question', this.value)" class="form-control" placeholder="Soru metni">
      <input type="text" value="${q.correct}" onchange="updateEditQuestion(${index}, 'correct', this.value)" class="form-control" placeholder="Doğru cevap">
      <select onchange="updateEditQuestion(${index}, 'type', this.value)" class="form-control">
        <option value="quiz" ${q.type === 'quiz' ? 'selected' : ''}>Çoktan Seçmeli</option>
        <option value="truefalse" ${q.type === 'truefalse' ? 'selected' : ''}>Doğru/Yanlış</option>
        <option value="fill" ${q.type === 'fill' ? 'selected' : ''}>Boşluk Doldurma</option>
      </select>
      <input type="file" accept="image/*" class="form-control" onchange="updateEditQuestionImage(${index}, this.files[0])">
    `;
    if (q.image) {
      const img = document.createElement("img");
      img.src = q.image;
      img.style.cssText = "display:block;margin-top:6px;max-width:100%;height:auto;border-radius:6px;border:1px solid #eee;";
      div.appendChild(img);
    }
    
    if (q.type === "quiz" && q.options) {
      const optionsDiv = document.createElement("div");
      optionsDiv.style.marginTop = "10px";
      
      q.options.forEach((opt, optIndex) => {
        const optInput = document.createElement("input");
        optInput.type = "text";
        optInput.value = opt;
        optInput.className = "form-control";
        optInput.onchange = function() {
          q.options[optIndex] = this.value;
        };
        optionsDiv.appendChild(optInput);
      });
      
      div.appendChild(optionsDiv);
    }
    
    container.appendChild(div);
  });
}

window.updateEditQuestion = function(index, field, value) {
  editingQuestions[index][field] = value;
  renderEditQuestions();
};

window.updateEditQuestionImage = function(index, file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    editingQuestions[index].image = reader.result;
    renderEditQuestions();
  };
  reader.readAsDataURL(file);
};

window.removeEditQuestion = function(index) {
  editingQuestions.splice(index, 1);
  renderEditQuestions();
};

document.getElementById("btn-add-new-question").onclick = function() {
  editingQuestions.push({
    question: "",
    correct: "",
    type: "quiz",
    options: ["A", "B", "C", "D"],
    id: Date.now()
  });
  renderEditQuestions();
};

document.getElementById("btn-cancel-edit").onclick = function() {
  document.getElementById("edit-section").style.display = "none";
};

document.getElementById("btn-save-edit").onclick = async function() {
  if (!currentTaskId) return;
  
  const newTitle = document.getElementById("edit-title").value;
  const newDesc = document.getElementById("edit-desc").value;
  const newDeadline = document.getElementById("edit-deadline").value;
  const newDeadlineTime = document.getElementById("edit-deadline-time").value;
  const editBook = document.getElementById("edit-book");
  const editBookTest = document.getElementById("edit-book-test");
  
  if (!newTitle) {
    showNotice("Başlık zorunlu!", "#e74c3c");
    return;
  }
  
  try {
    let deadline = null;
    if (newDeadline) {
      if (newDeadlineTime) {
        deadline = new Date(newDeadline + 'T' + newDeadlineTime);
      } else {
        deadline = new Date(newDeadline + 'T23:59');
      }
    }
    
    const selectedBookId = editBook?.value || "";
    const selectedBook = allBooks.find(b => b.id === selectedBookId);
    const updateData = {
      title: newTitle,
      description: newDesc,
      questions: editingQuestions,
      updatedAt: serverTimestamp(),
      bookId: selectedBookId || null,
      bookName: selectedBook?.name || null,
      bookTest: editBookTest?.value || null
    };
    
    if (deadline) {
      updateData.deadline = deadline.toISOString();
    } else {
      updateData.deadline = null;
    }
    
    await updateDoc(doc(db, "activities", currentTaskId), updateData);
    
    showNotice("Ödev güncellendi!", "#2ecc71");
    document.getElementById("edit-section").style.display = "none";
    document.getElementById("modal-display-title").innerText = newTitle;
    document.getElementById("modal-display-desc").innerText = newDesc || "Açıklama yok.";
  } catch (e) {
    showNotice("Güncelleme hatası: " + e.message, "#e74c3c");
  }
};

/* ================= ÖDEV SİLME ================= */
document.getElementById("btn-delete-task").onclick = async function () {
  if (!currentTaskId) return;
  
  if (!confirm("Bu ödevi silmek istediğinize emin misiniz?")) return;
  
  try {
    // Geçmiş raporlar ve öğrenci puanları korunur: fiziksel silme yerine arşivleme.
    await updateDoc(doc(db, "activities", currentTaskId), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: currentUserId || null,
      updatedAt: serverTimestamp()
    });

    showNotice("Ödev arşivlendi. Öğrenci geçmişinde kalacak.", "#2ecc71");
    closeModal();
  } catch (e) {
    showNotice("Silme hatası: " + e.message, "#e74c3c");
  }
};
["email", "password"].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const btn = document.getElementById("btn-login");
      if (btn) btn.click();
    }
  });
});

/* ================= AKTİVİTE BAŞLATMA ================= */
document.getElementById("btn-start-activity").onclick = async function () {
  if (!currentTaskId) return;
  
  if (completedTasks.has(currentTaskId)) {
    showNotice("Bu ödevi zaten tamamladınız!", "#e74c3c");
    return;
  }
  
  try {
    const taskDoc = await getDoc(doc(db, "activities", currentTaskId));
    if (!taskDoc.exists()) {
      showNotice("Ödev bulunamadı!", "#e74c3c");
      return;
    }
    
    const data = taskDoc.data();
    if (!data.questions || data.questions.length === 0) {
      await saveBookTaskProgress({ id: currentTaskId, ...data }, "finished");
      showNotice("Yaptım olarak kaydedildi. Öğretmen onayı bekleniyor.", "#2ecc71");
      await openTaskModal(currentTaskId, data, false);
      return;
    }
    
    activeTaskId = currentTaskId;
    startGame(currentTaskId, data.title, data.questions);
    closeModal();
  } catch (e) {
    showNotice("Hata: " + e.message, "#e74c3c");
  }
};

/* ================= OYUN MOTORU ================= */
function startGame(taskId, title, questions) {
  activeTaskId = taskId;
  currentQuestions = questions;
  currentQuestionIndex = 0;
  correctAnswers = 0;
  gameStartTime = Date.now();
  
  if (gameTimerInterval) clearInterval(gameTimerInterval);
  gameTimerInterval = setInterval(updateGameTimer, 1000);
  
  document.getElementById("app-screen").style.display = "none";
  document.getElementById("activity-detail").style.display = "block";
  document.getElementById("detail-title").innerText = title;
  document.getElementById("game-results").style.display = "none";
  document.getElementById("btn-complete").style.display = "none";
  document.getElementById("btn-complete").disabled = true;
  
  showQuestion();
}

function updateGameTimer() {
  if (!gameStartTime) return;
  const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');
  document.getElementById("game-timer").innerText = `⏱️ ${mins}:${secs}`;
}

function showQuestion() {
  const container = document.getElementById("dynamic-game-container");
  container.innerHTML = "";
  
  const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;
  document.getElementById("game-progress").style.width = progress + "%";
  
  if (currentQuestionIndex >= currentQuestions.length) {
    showGameResults();
    return;
  }
  
  const q = currentQuestions[currentQuestionIndex];
  
  const qDiv = document.createElement("div");
  qDiv.className = "game-question";
  qDiv.innerHTML = `<h4>Soru ${currentQuestionIndex + 1}/${currentQuestions.length}</h4><p>${q.question}</p>`;
  container.appendChild(qDiv);
  
  if (q.image) {
    const img = document.createElement("img");
    img.src = q.image;
    img.style.cssText = "max-width:100%;height:auto;border-radius:8px;border:1px solid #eee;margin-bottom:10px;";
    container.appendChild(img);
  }
  
  if (q.type === "quiz" && q.options) {
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "game-option";
      btn.innerText = opt;
      btn.onclick = () => checkAnswer(opt, q.correct, btn);
      container.appendChild(btn);
    });
  } else if (q.type === "truefalse") {
    ["Doğru", "Yanlış"].forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "game-option";
      btn.innerText = opt;
      btn.onclick = () => checkAnswer(opt.toLowerCase(), q.correct, btn);
      container.appendChild(btn);
    });
  } else if (q.type === "fill") {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control";
    input.placeholder = "Cevabınızı yazın...";
    container.appendChild(input);
    
    const submitBtn = document.createElement("button");
    submitBtn.className = "btn btn-primary";
    submitBtn.innerText = "Cevapla";
    submitBtn.style.marginTop = "10px";
    submitBtn.onclick = () => {
      const val = input.value.trim().toLowerCase();
      checkFillAnswer(val, q.correct);
    };
    container.appendChild(submitBtn);
  }
}

function checkAnswer(selected, correct, btnElement) {
  const buttons = document.querySelectorAll(".game-option");
  buttons.forEach(b => b.disabled = true);
  
  const isCorrect = selected.toLowerCase() === correct.toLowerCase();
  
  if (isCorrect) {
    btnElement.classList.add("correct");
    correctAnswers++;
    showNotice("Doğru! ✅", "#2ecc71");
  } else {
    btnElement.classList.add("wrong");
    showNotice("Yanlış!", "#e74c3c");
  }
  
  setTimeout(() => {
    currentQuestionIndex++;
    showQuestion();
  }, 1000);
}

function checkFillAnswer(selected, correct) {
  const container = document.getElementById("dynamic-game-container");
  
  const isCorrect = selected.toLowerCase() === correct.toLowerCase();
  const resultDiv = document.createElement("div");
  resultDiv.style.marginTop = "15px";
  resultDiv.style.padding = "15px";
  resultDiv.style.borderRadius = "8px";
  resultDiv.style.fontWeight = "bold";
  
  if (isCorrect) {
    resultDiv.style.background = "#d4edda";
    resultDiv.style.color = "#155724";
    resultDiv.innerText = "✅ Doğru!";
    correctAnswers++;
  } else {
    resultDiv.style.background = "#f8d7da";
    resultDiv.style.color = "#721c24";
    resultDiv.innerText = "❌ Yanlış! Doğru: " + correct;
  }
  
  container.appendChild(resultDiv);
  
  setTimeout(() => {
    currentQuestionIndex++;
    showQuestion();
  }, 2000);
}

function showGameResults() {
  if (gameTimerInterval) {
    clearInterval(gameTimerInterval);
    gameTimerInterval = null;
  }
  
  const duration = Math.floor((Date.now() - gameStartTime) / 1000);
  
  document.getElementById("game-progress").style.width = "100%";
  const container = document.getElementById("dynamic-game-container");
  container.innerHTML = "";
  
  const percentage = Math.round((correctAnswers / currentQuestions.length) * 100);
  const xpEarned = correctAnswers * MAX_QUESTION_XP;
  
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  
  document.getElementById("game-results").style.display = "block";
  document.getElementById("result-text").innerHTML = `
    <p>Toplam Soru: ${currentQuestions.length}</p>
    <p>Doğru Cevap: ${correctAnswers}</p>
    <p>Başarı Oranı: %${percentage}</p>
    <p style="font-size: 1.2rem; color: var(--primary); font-weight: bold;">Kazanılan XP: +${xpEarned}</p>
  `;
  
  document.getElementById("time-result").innerHTML = `
    <strong>⏱️ Tamamlama Süresi:</strong> ${mins} dakika ${secs} saniye
  `;
  
  const saveBtn = document.getElementById("btn-complete");
  saveBtn.style.display = "block";
  saveBtn.disabled = false;
  saveBtn.onclick = () => saveGameResults(xpEarned, duration);
}

async function saveGameResults(xp, duration) {
  const saveBtn = document.getElementById("btn-complete");
  saveBtn.disabled = true;
  saveBtn.innerText = "Kaydediliyor...";
  
  try {
    if (!activeTaskId) {
      showNotice("Ödev bulunamadı!", "#e74c3c");
      saveBtn.disabled = false;
      saveBtn.innerText = "Kaydet ve Bitir";
      return;
    }
    
    if (completedTasks.has(activeTaskId)) {
      showNotice("Bu ödev zaten kaydedilmiş!", "#e74c3c");
      backToMain();
      return;
    }
    
    await updateDoc(doc(db, "users", currentUserId), {
      xp: increment(xp)
    });
    
    const completionRef = await addDoc(collection(db, "completions"), {
      userId: currentUserId,
      taskId: activeTaskId,
      correctAnswers: correctAnswers,
      totalQuestions: currentQuestions.length,
      xpEarned: xp,
      duration: duration,
      completedAt: serverTimestamp()
    });
    
    console.log("Kaydedildi, ID:", completionRef.id);
    
    // Yerel olarak hemen ekle
    completedTasks.set(activeTaskId, {
      completionId: completionRef.id,
      correctAnswers: correctAnswers,
      totalQuestions: currentQuestions.length,
      xpEarned: xp,
      duration: duration,
      completedAt: { toDate: () => new Date() }
    });
    
    // Listeyi hemen güncelle
    updateTaskLists();
    
    showNotice("Tebrikler! " + xp + " XP kazandın!", "#2ecc71");
    
    setTimeout(() => {
      backToMain();
    }, 1500);
    
  } catch (e) {
    console.error("Kaydetme hatası:", e);
    showNotice("Kaydetme hatası: " + e.message, "#e74c3c");
    saveBtn.disabled = false;
    saveBtn.innerText = "Kaydet ve Bitir";
  }
}

/* ================= GERİ DÖNÜŞ ================= */
document.getElementById("btn-back").onclick = backToMain;

function backToMain() {
  if (gameTimerInterval) {
    clearInterval(gameTimerInterval);
    gameTimerInterval = null;
  }
  
  document.getElementById("activity-detail").style.display = "none";
  document.getElementById("app-screen").style.display = "grid";
  document.getElementById("dynamic-game-container").innerHTML = "";
  document.getElementById("game-results").style.display = "none";
  document.getElementById("btn-complete").style.display = "none";
  document.getElementById("game-timer").innerText = "⏱️ 00:00";
  
  updateTaskLists();
  
  currentQuestions = [];
  currentQuestionIndex = 0;
  correctAnswers = 0;
  gameStartTime = null;
  currentTaskId = null;
  activeTaskId = null;
}

/* ================= LİDERLİK TABLOSU ================= */
function buildLeaderboardRankedRows(users = []) {
  const rows = (Array.isArray(users) ? users.slice() : []).sort((a, b) => {
    const xpDiff = Number(b.xp || 0) - Number(a.xp || 0);
    if (xpDiff !== 0) return xpDiff;
    return String(a.name || "").localeCompare(String(b.name || ""), "tr");
  });
  let lastXP = null;
  let rank = 0;
  return rows.map((u, idx) => {
    const xp = Number(u.xp || 0);
    if (lastXP === null || xp !== lastXP) rank = idx + 1;
    lastXP = xp;
    return { ...u, rank };
  });
}

function renderLeaderboardPreview(rows = []) {
  const list = document.getElementById("leaderboard-list");
  if (!list) return;
  list.innerHTML = "";
  if (!rows.length) {
    list.innerHTML = `<li class="list-item" style="cursor:default;">Sıralama verisi bulunamadı.</li>`;
    return;
  }
  const topRows = rows.slice(0, 6);
  topRows.forEach((u) => {
    const li = document.createElement("li");
    li.className = `top-student-row rank-${Math.min(3, Number(u.rank || 99))}`;
    const isMe = u.id === currentUserId;
    const rankBadge = String(Number(u.rank || 0));
    const rankNum = Number(u.rank || 0);
    const medal = rankNum === 1 ? "🥇" : rankNum === 2 ? "🥈" : rankNum === 3 ? "🥉" : "";
    const avatar = getAvatarById(u.selectedAvatarId || AVATAR_DEFAULT_ID);
    const avatarImg = buildAvatarImageDataUri(avatar);
    li.innerHTML = `
      <div class="top-rank-badge">${rankBadge}</div>
      <div class="top-student-avatar"><img src="${avatarImg}" alt="${u.name} avatar"></div>
      <div>
        <div class="top-student-name">${u.name}${isMe ? " (Sen)" : ""}${medal ? `<span class="top-student-medal">${medal}</span>` : ""}</div>
        <div class="top-student-meta">${u.className || "-"}${u.section ? "/" + u.section : ""}</div>
      </div>
      <div class="top-student-xp">${u.xp} XP</div>
    `;
    if (u.rank === 1) {
      li.style.borderColor = "#ffd700";
      li.style.background = "linear-gradient(135deg, #fffdf0 0%, #fff9e6 100%)";
    } else if (isMe) {
      li.style.borderColor = "#16a34a";
      li.style.background = "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)";
    }
    list.appendChild(li);
  });
}

function populateLeaderboardFilters(rows = []) {
  const classSelect = document.getElementById("leaderboard-filter-class");
  const sectionSelect = document.getElementById("leaderboard-filter-section");
  if (!classSelect || !sectionSelect) return;
  const classSet = new Set();
  const sectionSet = new Set();
  rows.forEach((r) => {
    if (r.className) classSet.add(r.className);
    if (r.section) sectionSet.add(r.section);
  });
  const oldClass = classSelect.value;
  const oldSection = sectionSelect.value;
  classSelect.innerHTML = `<option value="">Tüm Sınıflar</option>`;
  Array.from(classSet).sort((a, b) => String(a).localeCompare(String(b), "tr")).forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    classSelect.appendChild(opt);
  });
  sectionSelect.innerHTML = `<option value="">Tüm Şubeler</option>`;
  Array.from(sectionSet).sort((a, b) => String(a).localeCompare(String(b), "tr")).forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    sectionSelect.appendChild(opt);
  });
  if (oldClass && classSet.has(oldClass)) classSelect.value = oldClass;
  if (oldSection && sectionSet.has(oldSection)) sectionSelect.value = oldSection;
  updateLeaderboardSectionFilterOptions();
}

function updateLeaderboardSectionFilterOptions() {
  const classSelect = document.getElementById("leaderboard-filter-class");
  const sectionSelect = document.getElementById("leaderboard-filter-section");
  if (!classSelect || !sectionSelect) return;
  const selectedClass = classSelect.value || "";
  const oldValue = sectionSelect.value || "";
  const sectionSet = new Set();
  leaderboardRowsCache.forEach((r) => {
    if (selectedClass && String(r.className || "") !== selectedClass) return;
    if (r.section) sectionSet.add(String(r.section));
  });
  sectionSelect.innerHTML = `<option value="">Tüm Şubeler</option>`;
  Array.from(sectionSet).sort((a, b) => a.localeCompare(b, "tr")).forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    sectionSelect.appendChild(opt);
  });
  if (oldValue && sectionSet.has(oldValue)) sectionSelect.value = oldValue;
}

function renderLeaderboardModalList() {
  const box = document.getElementById("leaderboard-modal-list");
  const classFilter = document.getElementById("leaderboard-filter-class")?.value || "";
  const sectionFilter = document.getElementById("leaderboard-filter-section")?.value || "";
  if (!box) return;
  let rows = leaderboardRowsCache.slice();
  if (classFilter) rows = rows.filter((r) => String(r.className || "") === classFilter);
  if (sectionFilter) rows = rows.filter((r) => String(r.section || "") === sectionFilter);
  if (!rows.length) {
    box.innerHTML = `<div class="empty-state">Filtreye uygun öğrenci yok.</div>`;
    return;
  }
  box.innerHTML = rows.map((u) => {
    const rankBadge = u.rank <= 3 ? ["🥇", "🥈", "🥉"][u.rank - 1] : `#${u.rank}`;
    const isMe = u.id === currentUserId;
    return `
      <div class="list-item" style="cursor:default;${isMe ? "border-left-color:#16a34a;background:#f0fdf4;" : ""}">
        <div>
          <strong>${rankBadge} ${u.name}${isMe ? " (Sen)" : ""}</strong><br>
          <small>${u.className || "-"}${u.section ? "/" + u.section : ""}</small>
        </div>
        <div style="font-weight:700;color:#2563eb;">${u.xp} XP</div>
      </div>
    `;
  }).join("");
}

function loadLeaderboard() {
  const q = query(collection(db, "users"), where("role", "==", "student"));
  
  onSnapshot(q, async (snap) => {
    const list = document.getElementById("leaderboard-list");
    if (!list) return;
    const reportsXPMap = new Map();
    try {
      const rptSnap = await getDocs(collection(db, "studentReports"));
      rptSnap.forEach((d) => {
        reportsXPMap.set(d.id, parseXPValue(d.data()?.totalXP));
      });
    } catch (e) {
      console.warn("leaderboard reports xp fallback failed", e);
    }
    
    const users = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (userRole === "student") {
        const myOwner = String(userData?.ownerTeacherId || userData?.createdBy || "");
        const studentOwner = String(data?.ownerTeacherId || data?.createdBy || "");
        if (myOwner && myOwner !== studentOwner) return;
      }
      const fallbackXP = reportsXPMap.get(docSnap.id) || 0;
      users.push({
        id: docSnap.id,
        name: getUserDisplayName(data),
        className: String(data.className || "").trim(),
        section: String(data.section || "").trim(),
        selectedAvatarId: String(data.selectedAvatarId || AVATAR_DEFAULT_ID),
        xp: Math.max(getStudentXPValue({ id: docSnap.id, ...data }), fallbackXP)
      });
    });
    leaderboardRowsCache = buildLeaderboardRankedRows(users);
    renderLeaderboardPreview(leaderboardRowsCache);
    populateLeaderboardFilters(leaderboardRowsCache);
    if (document.getElementById("leaderboard-modal")?.style.display === "flex") {
      renderLeaderboardModalList();
    }
  });
}

/* ================= ÖĞRENCİLERİM MODALI ================= */
function getTeacherManagedStudents(students = []) {
  if (userRole !== "teacher") return [];
  if (!currentUserId && !userData?.username && !userData?.email) return [];
  return (Array.isArray(students) ? students : []).filter((s) => {
    // Öğretmen verileri kesin ayrılmalı: sahiplik bilgisi olmayan öğrenci başka hesaplara düşmemeli.
    return recordBelongsToCurrentTeacher(s);
  });
}

function scopeStudentsForCurrentRole(students = []) {
  const rows = Array.isArray(students) ? students : [];
  if (userRole === "teacher") return getUniqueStudents(getTeacherManagedStudents(rows));
  return getUniqueStudents(rows);
}

function normalizeClassSectionText(value) {
  return String(value || "").trim();
}

function buildClassSectionCatalogFromStudents(students = []) {
  const map = new Map();
  (Array.isArray(students) ? students : []).forEach((s) => {
    const className = normalizeClassSectionText(s?.className || s?.class || "");
    const section = normalizeClassSectionText(s?.section || "");
    if (!className || !section) return;
    const key = `${className}|${section}`;
    if (!map.has(key)) map.set(key, { className, section });
  });
  return Array.from(map.values()).sort((a, b) => {
    const classCmp = a.className.localeCompare(b.className, "tr");
    if (classCmp !== 0) return classCmp;
    return a.section.localeCompare(b.section, "tr");
  });
}

function ensureGlobalDatalist(listId) {
  let el = document.getElementById(listId);
  if (el) return el;
  el = document.createElement("datalist");
  el.id = listId;
  document.body.appendChild(el);
  return el;
}

function setDatalistValues(listId, values = []) {
  const el = ensureGlobalDatalist(listId);
  const unique = Array.from(new Set((Array.isArray(values) ? values : []).map((v) => String(v || "").trim()).filter(Boolean)));
  el.innerHTML = unique.map((v) => `<option value="${escapeHtmlBasic(v)}"></option>`).join("");
}

function updateSectionDatalistForPair(classInputEl, sectionListId) {
  const selectedClass = normalizeClassSectionText(classInputEl?.value || "");
  const sectionValues = classSectionCatalog
    .filter((row) => !selectedClass || row.className === selectedClass)
    .map((row) => row.section);
  setDatalistValues(sectionListId, sectionValues);
}

function applyClassSectionDropdownBindings() {
  const classValues = classSectionCatalog.map((row) => row.className);
  setDatalistValues("global-class-options", classValues);
  const pairs = [
    ["content-target-class", "content-target-section"],
    ["assignment-class", "assignment-section"],
    ["block-hw-class", "block-hw-section"],
    ["compute-hw-class", "compute-hw-section"],
    ["add-student-class", "add-student-section"],
    ["lesson-class", "lesson-section"],
    ["live-quiz-class", "live-quiz-section"],
    ["flow-assignment-class", "flow-assignment-section"],
    ["class-manager-class", "class-manager-section"]
  ];
  pairs.forEach(([classId, sectionId]) => {
    const classEl = document.getElementById(classId);
    const sectionEl = document.getElementById(sectionId);
    if (!(classEl instanceof HTMLInputElement) || !(sectionEl instanceof HTMLInputElement)) return;
    classEl.setAttribute("list", "global-class-options");
    const sectionListId = `global-section-options-${classId}`;
    sectionEl.setAttribute("list", sectionListId);
    updateSectionDatalistForPair(classEl, sectionListId);
    if (!classEl.dataset.classDropdownBound) {
      classEl.addEventListener("input", () => updateSectionDatalistForPair(classEl, sectionListId));
      classEl.addEventListener("change", () => updateSectionDatalistForPair(classEl, sectionListId));
      classEl.dataset.classDropdownBound = "1";
    }
  });
}

async function refreshAndApplyClassSectionDropdowns() {
  if (userRole !== "teacher" || !currentUserId) {
    classSectionCatalog = [];
    applyClassSectionDropdownBindings();
    return;
  }
  const fromClassSections = [];
  try {
    const classSnap = await getDocs(query(collection(db, "classSections"), where("userId", "==", currentUserId)));
    classSnap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      if (data?.isDeleted) return;
      const className = normalizeClassSectionText(data.className);
      const section = normalizeClassSectionText(data.section);
      if (!className || !section) return;
      fromClassSections.push({ className, section });
    });
  } catch (e) {
    console.warn("classSections load failed", e);
  }

  let fromStudents = [];
  try {
    const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
    const allRows = [];
    studentsSnap.forEach((docSnap) => allRows.push({ id: docSnap.id, ...docSnap.data() }));
    const managed = getUniqueStudents(getTeacherManagedStudents(allRows));
    fromStudents = buildClassSectionCatalogFromStudents(managed);
  } catch (e) {
    console.warn("students class-section fallback failed", e);
  }

  classSectionCatalog = buildClassSectionCatalogFromStudents([...(fromClassSections || []), ...(fromStudents || [])]);
  applyClassSectionDropdownBindings();
}

function normalizeOwnerToken(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const trMap = {
    "ç": "c",
    "ğ": "g",
    "ı": "i",
    "İ": "i",
    "ö": "o",
    "ş": "s",
    "ü": "u"
  };
  const folded = raw
    .split("")
    .map((ch) => trMap[ch] || ch)
    .join("");
  return folded
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@._-]/g, "");
}

function normalizeIdentityToken(value) {
  return normalizeOwnerToken(value).replace(/[@._-]/g, "");
}

function getCurrentTeacherOwnerTokens() {
  const tokens = new Set();
  const push = (v) => {
    const t = normalizeOwnerToken(v);
    if (t) tokens.add(t);
  };
  push(currentUserId);
  push(userData?.id);
  push(userData?.email);
  push(userData?.username);
  push(auth?.currentUser?.uid);
  push(auth?.currentUser?.email);
  const username = normalizeOwnerToken(userData?.username);
  if (username) {
    push(`${username}@okul.com`);
    push(`${username}@gmail.com`);
  }
  const email = normalizeOwnerToken(userData?.email || auth?.currentUser?.email);
  if (email.includes("@")) push(email.split("@")[0]);
  teacherOwnerAliasTokens.forEach((t) => push(t));
  return tokens;
}

async function refreshTeacherOwnerAliasTokens() {
  teacherOwnerAliasTokens = new Set();
  if (userRole !== "teacher") return;
  const seedTokens = getCurrentTeacherOwnerTokens();
  const username = normalizeOwnerToken(userData?.username || (auth?.currentUser?.email || "").split("@")[0]);
  const email = normalizeOwnerToken(userData?.email || auth?.currentUser?.email);
  const mergeTeacherRow = (row = {}) => {
    const push = (v) => {
      const t = normalizeOwnerToken(v);
      if (t) teacherOwnerAliasTokens.add(t);
    };
    push(row.id);
    push(row.email);
    push(row.username);
    if (String(row.email || "").includes("@")) push(String(row.email).split("@")[0]);
  };
  // kendi tokenlarını da alias setine ekle
  seedTokens.forEach((t) => teacherOwnerAliasTokens.add(normalizeOwnerToken(t)));
  try {
    const queries = [];
    if (username) queries.push(getDocs(query(collection(db, "users"), where("username", "==", username))));
    if (email) queries.push(getDocs(query(collection(db, "users"), where("email", "==", email))));
    if (!queries.length) return;
    const results = await Promise.allSettled(queries);
    results.forEach((res) => {
      if (res.status !== "fulfilled") return;
      res.value.forEach((d) => {
        const data = d.data() || {};
        const role = normalizeUserRole(data.role);
        if (role !== "teacher") return;
        mergeTeacherRow({ id: d.id, ...data });
      });
    });
  } catch (e) {
    console.warn("refreshTeacherOwnerAliasTokens", e);
  }
}

function valueMatchesCurrentTeacher(value) {
  const target = normalizeOwnerToken(value);
  if (!target) return false;
  const targetIdentity = normalizeIdentityToken(target);
  const tokens = getCurrentTeacherOwnerTokens();
  if (!tokens.size) return false;
  if (tokens.has(target)) return true;
  for (const t of tokens) {
    if (!t) continue;
    if (normalizeIdentityToken(t) === targetIdentity && targetIdentity) return true;
    if (target.includes(t) || t.includes(target)) return true;
  }
  // legacy: kayıt email ise, tokenlar arasında email-prefix eşleşmesi de kabul et
  if (target.includes("@")) {
    const prefix = target.split("@")[0];
    if (tokens.has(prefix)) return true;
  }
  return false;
}

function getCurrentTeacherManagedStudentTokens() {
  const tokens = new Set();
  if (userRole !== "teacher") return tokens;
  const push = (v) => {
    const t = normalizeOwnerToken(v);
    if (!t) return;
    tokens.add(t);
    const compact = normalizeIdentityToken(t);
    if (compact) tokens.add(compact);
    if (t.includes("@")) {
      const prefix = normalizeOwnerToken(t.split("@")[0]);
      if (prefix) {
        tokens.add(prefix);
        const compactPrefix = normalizeIdentityToken(prefix);
        if (compactPrefix) tokens.add(compactPrefix);
      }
    }
  };
  const seed = Array.isArray(allStudents) && allStudents.length ? allStudents : [];
  seed.forEach((s) => {
    push(s?.id);
    push(s?.username);
    push(s?.email);
  });
  return tokens;
}

function recordBelongsToCurrentTeacher(record = {}) {
  if (userRole !== "teacher") return true;
  const explicitOwners = [
    record?.userId,
    record?.ownerTeacherId,
    record?.createdBy,
    record?.teacherId,
    record?.ownerId,
    record?.teacherEmail,
    record?.ownerEmail
  ].map((v) => normalizeOwnerToken(v)).filter(Boolean);
  if (explicitOwners.length) return explicitOwners.some((v) => valueMatchesCurrentTeacher(v));
  // Legacy kayıtlar: öğretmen alanı yoksa öğrenci ilişkisinden doğrula.
  const studentRefs = [
    record?.userId,
    record?.studentId,
    record?.studentUid,
    record?.studentUserId,
    record?.studentUsername,
    record?.studentEmail
  ].map((v) => normalizeOwnerToken(v)).filter(Boolean);
  if (!studentRefs.length) return false;
  const managed = getCurrentTeacherManagedStudentTokens();
  if (!managed.size) return false;
  return studentRefs.some((ref) => {
    if (managed.has(ref)) return true;
    const compact = normalizeIdentityToken(ref);
    if (compact && managed.has(compact)) return true;
    return false;
  });
}

function getLoginCardPassword(student = {}) {
  const raw = String(student.loginCardPassword || "").trim();
  return raw || "Belirlenmedi";
}

function escapeHtmlBasic(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderLoginCardsModal() {
  const grid = document.getElementById("login-cards-grid");
  const summary = document.getElementById("login-cards-summary");
  if (!grid) return;
  const rows = getUniqueStudents(getTeacherManagedStudents(loginCardsStudentsCache)).sort((a, b) => {
    const classCmp = String(a.className || "").localeCompare(String(b.className || ""), "tr");
    if (classCmp !== 0) return classCmp;
    const secCmp = String(a.section || "").localeCompare(String(b.section || ""), "tr");
    if (secCmp !== 0) return secCmp;
    return getUserDisplayName(a).localeCompare(getUserDisplayName(b), "tr");
  });
  if (summary) summary.innerText = `${rows.length} öğrenci kartı hazır.`;
  if (!rows.length) {
    grid.innerHTML = `<div class="login-cards-empty">Öğrenci bulunamadı.</div>`;
    return;
  }
  grid.innerHTML = rows.map((s) => {
    const name = getUserDisplayName(s);
    const classText = `${s.className || "-"}${s.section ? "/" + s.section : ""}`;
    const username = s.username || "-";
    const pass = getLoginCardPassword(s);
      return `
        <article class="login-card-item">
          <span class="login-card-accent" aria-hidden="true"></span>
          <div class="login-card-head">
            <img src="logo.png" alt="Logo" class="login-card-logo">
            <div class="login-card-title-row" style="flex:1;">
              <div class="login-card-title">
                <span class="name">${escapeHtmlBasic(name)}</span>
                <span class="login-card-meta">${escapeHtmlBasic(classText)}</span>
              </div>
            </div>
          </div>
        <div class="login-card-fields">
          <div class="login-card-field">
            <span class="icon">👤</span>
            <span class="val">${escapeHtmlBasic(username)}</span>
          </div>
          <div class="login-card-field">
            <span class="icon">👤</span>
            <span class="val">${escapeHtmlBasic(pass)}</span>
          </div>
        </div>
        <div class="login-card-foot">Öğrenci Giriş Bilgilendirme Kartı</div>
      </article>
    `;
  }).join("");
}

async function loadLoginCardsModal() {
  const grid = document.getElementById("login-cards-grid");
  const summary = document.getElementById("login-cards-summary");
  if (grid) grid.innerHTML = `<div class="login-cards-empty">Yükleniyor...</div>`;
  if (summary) summary.innerText = "Öğrenciler yükleniyor...";
  const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
  const studentsSnap = await getDocs(studentsQuery);
  const students = [];
  studentsSnap.forEach((docSnap) => {
    students.push({ id: docSnap.id, ...docSnap.data() });
  });
  loginCardsStudentsCache = students;
  renderLoginCardsModal();
}

function openLoginCardsPrintPreview() {
  const students = getUniqueStudents(getTeacherManagedStudents(loginCardsStudentsCache)).sort((a, b) => {
    const classCmp = String(a.className || "").localeCompare(String(b.className || ""), "tr");
    if (classCmp !== 0) return classCmp;
    const secCmp = String(a.section || "").localeCompare(String(b.section || ""), "tr");
    if (secCmp !== 0) return secCmp;
    return getUserDisplayName(a).localeCompare(getUserDisplayName(b), "tr");
  });
  if (!students.length) {
    showNotice("Yazdırılacak öğrenci kartı bulunamadı.", "#f39c12");
    return;
  }
  const pageSize = 10;
  const pages = [];
  for (let i = 0; i < students.length; i += pageSize) pages.push(students.slice(i, i + pageSize));
  const pageHtml = pages.map((chunk) => {
    const cards = chunk.map((s) => {
      const name = escapeHtmlBasic(getUserDisplayName(s));
      const classText = escapeHtmlBasic(`${s.className || "-"}${s.section ? "/" + s.section : ""}`);
      const username = escapeHtmlBasic(s.username || "-");
      const pass = escapeHtmlBasic(getLoginCardPassword(s));
      return `
        <article class="print-login-card">
          <span class="print-accent" aria-hidden="true"></span>
          <div class="print-head">
            <img src="logo.png" alt="Logo" class="print-logo">
            <div class="print-title-row">
              <div class="print-title">
                <span class="print-name">${name}</span>
                <span class="print-class">${classText}</span>
              </div>
            </div>
          </div>
          <div class="print-row">
            <div class="print-icon">👤</div>
            <div class="print-val">${username}</div>
          </div>
          <div class="print-row">
            <div class="print-icon">👤</div>
            <div class="print-val">${pass}</div>
          </div>
          <div class="print-foot">Öğrenci Giriş Kartı</div>
        </article>
      `;
    }).join("");
    return `<section class="print-sheet">${cards}</section>`;
  }).join("");

  const w = window.open("", "_blank");
  if (!w) {
    showNotice("Yazdırma önizleme penceresi açılamadı.", "#e74c3c");
    return;
  }
  w.document.write(`<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><title>Giriş Kartları</title>
<style>
  @page { size: A4 portrait; margin: 8mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, sans-serif; background: #f3f4f6; }
  .actions { position: sticky; top: 0; z-index: 3; display:flex; gap:8px; justify-content:flex-end; padding:8px 10px; background:#fff; border-bottom:1px solid #d1d5db; }
  .actions button { border:1px solid #cbd5e1; background:#fff; padding:8px 12px; border-radius:8px; font-weight:700; cursor:pointer; }
  .actions .primary { background:#2563eb; color:#fff; border-color:#1d4ed8; }
  .print-sheet { width: 100%; height: 281mm; max-height: 281mm; display:grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(5, minmax(0, 1fr)); gap: 3mm; page-break-after: always; padding: 0; overflow: hidden; }
  .print-sheet:last-of-type { page-break-after: auto; }
  .print-login-card {
    position: relative;
    border: 0.35mm solid #a78bfa;
    border-radius: 3mm;
    background: linear-gradient(165deg, rgba(255,255,255,0.96) 0%, rgba(250,245,255,0.98) 44%, rgba(243,232,255,0.99) 100%);
    padding: 2.2mm 2.4mm 2.2mm 4.8mm;
    display:flex;
    flex-direction:column;
    gap:1.1mm;
    box-shadow: 0 1.2mm 2.4mm rgba(76,29,149,0.12);
    min-height: 0;
    overflow: hidden;
  }
  .print-login-card::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 20mm;
    background:
      linear-gradient(90deg, rgba(76,29,149,0.95), rgba(109,40,217,0.8));
    border-bottom: 0.3mm solid #ddd6fe;
  }
  .print-login-card::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4.8mm;
    background:
      linear-gradient(180deg, rgba(76,29,149,0.98), rgba(124,58,237,0.9));
    clip-path: polygon(0 0, 100% 0, 72% 100%, 0 100%);
  }
  .print-head { position: relative; z-index: 1; display:flex; justify-content:flex-start; align-items:flex-start; gap:1.6mm; min-height: 18.8mm; }
  .print-title-row { display:flex; flex-direction:row; align-items:center; justify-content:flex-start; gap:0.2mm; flex:1; min-width:0; min-height:16mm; }
  .print-logo { width: 20mm; height: 20mm; border-radius: 2.4mm; border: 0.3mm solid #ddd6fe; background:#fff; object-fit: contain; padding: 0.9mm; box-shadow: 0 0.8mm 1.8mm rgba(76,29,149,0.22); flex:0 0 auto; }
  .print-title { display:flex; align-items:baseline; gap: 1.2mm; font-weight:700; font-size: 4.5mm; line-height:1.08; letter-spacing:0.01em; color:#ffffff; text-shadow: 0 0.45mm 0.8mm rgba(49,46,129,0.4); width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .print-name { min-width: 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .print-class { font-weight:700; font-size: 3.3mm; color:#f5f3ff; text-shadow: 0 0.35mm 0.7mm rgba(49,46,129,0.36); max-width:45%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .print-row { position: relative; z-index: 1; display:grid; grid-template-columns: 6.6mm 1fr; border: 0.3mm solid #ddd6fe; border-radius: 1.8mm; overflow:hidden; min-height: 8.2mm; height: 8.2mm; background: rgba(255,255,255,0.92); }
  .print-icon { background:#ede9fe; color:#4c1d95; border-right: 0.3mm solid #ddd6fe; display:flex; align-items:center; justify-content:center; font-size:4mm; }
  .print-val { padding: 1mm 1.6mm; font-weight:700; font-size: 3.2mm; display:flex; align-items:center; color:#312e81; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .print-foot { position: relative; z-index: 1; margin-top:auto; text-align:right; font-size:2.5mm; font-weight:700; color:#6d28d9; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .print-login-card .print-accent {
    position:absolute;
    right:-8mm;
    bottom:-5mm;
    width:26mm;
    height:12mm;
    border-radius: 8mm;
    transform: rotate(-12deg);
    background: linear-gradient(90deg, rgba(147,51,234,0.18), rgba(167,139,250,0.1));
  }
  @media print {
    body { background:#fff; }
    .actions { display:none; }
    .print-sheet { padding: 0; }
  }
</style></head><body>
  <div class="actions">
    <button onclick="window.close()">Kapat</button>
    <button class="primary" onclick="window.print()">Yazdır</button>
  </div>
  ${pageHtml}
</body></html>`);
  w.document.close();
}

async function loadStudentsModal() {
  const list = document.getElementById("students-list");
  if (!list) return;
  list.innerHTML = "<div class='loading'>Yükleniyor...</div>";
  
  const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
  const studentsSnap = await getDocs(studentsQuery);
  const students = [];
  studentsSnap.forEach(docSnap => {
    students.push({ id: docSnap.id, ...docSnap.data() });
  });
  const scopedStudents = userRole === "teacher"
    ? getUniqueStudents(getTeacherManagedStudents(students))
    : students;
  
  populateStudentFilters(scopedStudents);
  renderStudentsList(scopedStudents);
  document.getElementById("students-filter-scope").value = "all";
  filterStudentsList();
  if (userRole === "teacher") {
    classSectionCatalog = buildClassSectionCatalogFromStudents([...(classSectionCatalog || []), ...buildClassSectionCatalogFromStudents(scopedStudents)]);
    applyClassSectionDropdownBindings();
  }
}

function populateStudentFilters(students) {
  const classSelect = document.getElementById("students-filter-class");
  const sectionSelect = document.getElementById("students-filter-section");
  if (!classSelect || !sectionSelect) return;
  
  const classes = new Set();
  const sections = new Set();
  
  students.forEach(s => {
    if (s.className) classes.add(s.className);
    if (s.section) sections.add(s.section);
  });
  
  classSelect.innerHTML = "<option value=\"\">Sınıf</option>";
  Array.from(classes).sort().forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    classSelect.appendChild(opt);
  });
  
  sectionSelect.innerHTML = "<option value=\"\">Şube</option>";
  Array.from(sections).sort().forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    sectionSelect.appendChild(opt);
  });
}

document.getElementById("students-filter-scope").onchange = filterStudentsList;
document.getElementById("students-filter-class").onchange = filterStudentsList;
document.getElementById("students-filter-section").onchange = filterStudentsList;

async function filterStudentsList() {
  const scope = document.getElementById("students-filter-scope").value;
  const classVal = document.getElementById("students-filter-class").value;
  const sectionVal = document.getElementById("students-filter-section").value;
  const classSelect = document.getElementById("students-filter-class");
  const sectionSelect = document.getElementById("students-filter-section");
  if (scope === "all") {
    classSelect.disabled = true;
    sectionSelect.disabled = true;
  } else {
    classSelect.disabled = false;
    sectionSelect.disabled = false;
  }

  const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
  const studentsSnap = await getDocs(studentsQuery);
  const students = [];
  studentsSnap.forEach(docSnap => {
    students.push({ id: docSnap.id, ...docSnap.data() });
  });
  const scopedStudents = userRole === "teacher"
    ? getUniqueStudents(getTeacherManagedStudents(students))
    : students;
  
  let filtered = scopedStudents;
  if (scope === "class") {
    filtered = scopedStudents.filter(s => {
      if (classVal && s.className !== classVal) return false;
      if (sectionVal && s.section !== sectionVal) return false;
      return true;
    });
  }
  
  renderStudentsList(filtered);
}

function getClassManagerInputValues() {
  const className = String(document.getElementById("class-manager-class")?.value || "").trim();
  const section = String(document.getElementById("class-manager-section")?.value || "").trim();
  return { className, section };
}

function resetClassManagerForm() {
  classManagerSelectedId = null;
  const classInput = document.getElementById("class-manager-class");
  const sectionInput = document.getElementById("class-manager-section");
  if (classInput) classInput.value = "";
  if (sectionInput) sectionInput.value = "";
  renderClassesList();
}

function renderClassesList() {
  const list = document.getElementById("classes-list");
  if (!list) return;
  list.innerHTML = "";
  if (!classManagerRows.length) {
    list.innerHTML = "<div class='empty-state'>Kayıtlı sınıf/şube bulunamadı.</div>";
    return;
  }
  const rows = classManagerRows.slice().sort((a, b) => {
    const cCmp = String(a.className || "").localeCompare(String(b.className || ""), "tr");
    if (cCmp !== 0) return cCmp;
    return String(a.section || "").localeCompare(String(b.section || ""), "tr");
  });
  rows.forEach((row) => {
    const div = document.createElement("div");
    const selected = classManagerSelectedId && classManagerSelectedId === row.id;
    div.className = "list-item";
    div.style.cursor = "pointer";
    if (selected) {
      div.style.border = "2px solid #2563eb";
      div.style.background = "#eff6ff";
    }
    div.innerHTML = `
      <div style="flex:1;">
        <div style="font-weight:700;">Sınıf ${escapeHtmlBasic(row.className || "-")} / ${escapeHtmlBasic(row.section || "-")}</div>
        <small style="color:#64748b;">Düzenlemek için seçin</small>
      </div>
    `;
    div.onclick = () => {
      classManagerSelectedId = row.id;
      const classInput = document.getElementById("class-manager-class");
      const sectionInput = document.getElementById("class-manager-section");
      if (classInput) classInput.value = row.className || "";
      if (sectionInput) sectionInput.value = row.section || "";
      renderClassesList();
    };
    list.appendChild(div);
  });
}

async function loadClassesModal() {
  if (userRole !== "teacher" || !currentUserId) return;
  const list = document.getElementById("classes-list");
  if (list) list.innerHTML = "<div class='loading'>Yükleniyor...</div>";
  classManagerSelectedId = null;
  try {
    const snap = await getDocs(query(collection(db, "classSections"), where("userId", "==", currentUserId)));
    const rows = [];
    snap.forEach((d) => {
      const data = d.data() || {};
      if (data?.isDeleted) return;
      rows.push({
        id: d.id,
        className: String(data.className || "").trim(),
        section: String(data.section || "").trim()
      });
    });
    classManagerRows = rows.filter((r) => r.className && r.section);
    renderClassesList();
    classSectionCatalog = buildClassSectionCatalogFromStudents([...(classSectionCatalog || []), ...classManagerRows]);
    applyClassSectionDropdownBindings();
  } catch (e) {
    if (list) {
      list.innerHTML = `<div class='empty-state'>Sınıf listesi yüklenemedi: ${escapeHtmlBasic(getCallableErrorMessage(e))}</div>`;
    }
  }
}

async function addClassFromForm() {
  if (userRole !== "teacher" || !currentUserId) return;
  const { className, section } = getClassManagerInputValues();
  if (!className || !section) {
    showNotice("Sınıf ve şube zorunludur.", "#e74c3c");
    return;
  }
  const exists = classManagerRows.some((r) => r.className === className && r.section === section);
  if (exists) {
    showNotice("Bu sınıf/şube zaten mevcut.", "#f39c12");
    return;
  }
  try {
    await addDoc(collection(db, "classSections"), {
      userId: currentUserId,
      className,
      section,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    showNotice("Sınıf/şube eklendi.", "#2ecc71");
    await loadClassesModal();
    resetClassManagerForm();
  } catch (e) {
    showNotice("Sınıf/şube eklenemedi: " + getCallableErrorMessage(e), "#e74c3c");
  }
}

async function updateSelectedClassFromForm() {
  if (userRole !== "teacher" || !currentUserId) return;
  if (!classManagerSelectedId) {
    showNotice("Güncellemek için listeden bir satır seçin.", "#f39c12");
    return;
  }
  const { className, section } = getClassManagerInputValues();
  if (!className || !section) {
    showNotice("Sınıf ve şube zorunludur.", "#e74c3c");
    return;
  }
  try {
    await updateDoc(doc(db, "classSections", classManagerSelectedId), {
      className,
      section,
      updatedAt: serverTimestamp()
    });
    showNotice("Sınıf/şube güncellendi.", "#2ecc71");
    await loadClassesModal();
    resetClassManagerForm();
  } catch (e) {
    showNotice("Güncelleme başarısız: " + getCallableErrorMessage(e), "#e74c3c");
  }
}

async function deleteSelectedClassFromForm() {
  if (userRole !== "teacher" || !currentUserId) return;
  if (!classManagerSelectedId) {
    showNotice("Silmek için listeden bir satır seçin.", "#f39c12");
    return;
  }
  const ok = await confirmDialog("Seçili sınıf/şube kaydı silinsin mi?");
  if (!ok) return;
  try {
    await deleteDoc(doc(db, "classSections", classManagerSelectedId));
    showNotice("Sınıf/şube silindi.", "#2ecc71");
    await loadClassesModal();
    resetClassManagerForm();
  } catch (e) {
    showNotice("Silme başarısız: " + getCallableErrorMessage(e), "#e74c3c");
  }
}

async function bulkAddClassesFromInput() {
  if (userRole !== "teacher" || !currentUserId) return;
  const raw = String(document.getElementById("class-manager-bulk")?.value || "");
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) {
    showNotice("Toplu ekleme için satır girin.", "#f39c12");
    return;
  }
  const parsed = [];
  lines.forEach((line) => {
    const normalized = line.replace(";", ",").replace("/", ",");
    const parts = normalized.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      parsed.push({ className: parts[0], section: parts[1] });
    }
  });
  if (!parsed.length) {
    showNotice("Satır formatı geçersiz. Örn: 5A,A veya 5A/A", "#e74c3c");
    return;
  }
  const existing = new Set(classManagerRows.map((r) => `${r.className}|${r.section}`));
  const uniqueNew = [];
  parsed.forEach((item) => {
    const key = `${item.className}|${item.section}`;
    if (!item.className || !item.section || existing.has(key)) return;
    existing.add(key);
    uniqueNew.push(item);
  });
  if (!uniqueNew.length) {
    showNotice("Eklenecek yeni sınıf/şube bulunamadı.", "#f39c12");
    return;
  }
  try {
    await Promise.all(uniqueNew.map((item) => addDoc(collection(db, "classSections"), {
      userId: currentUserId,
      className: item.className,
      section: item.section,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })));
    showNotice(`${uniqueNew.length} sınıf/şube eklendi.`, "#2ecc71");
    const bulkInput = document.getElementById("class-manager-bulk");
    if (bulkInput) bulkInput.value = "";
    await loadClassesModal();
  } catch (e) {
    showNotice("Toplu ekleme başarısız: " + getCallableErrorMessage(e), "#e74c3c");
  }
}

document.getElementById("btn-class-add")?.addEventListener("click", addClassFromForm);
document.getElementById("btn-class-update")?.addEventListener("click", updateSelectedClassFromForm);
document.getElementById("btn-class-delete")?.addEventListener("click", deleteSelectedClassFromForm);
document.getElementById("btn-class-bulk-add")?.addEventListener("click", bulkAddClassesFromInput);

function showBulkStudentsDeleteOverlay(message = "Tüm öğrenciler siliniyor lütfen bekleyin...") {
  const existing = document.getElementById("bulk-students-delete-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.id = "bulk-students-delete-overlay";
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background:rgba(15,23,42,0.38)",
    "backdrop-filter:blur(5px)",
    "z-index:26000"
  ].join(";");
  overlay.innerHTML = `
    <div style="background:#fff; color:#111827; border:1px solid #e5e7eb; border-radius:12px; padding:16px 20px; box-shadow:0 12px 28px rgba(0,0,0,0.2); font-weight:600;">
      ${escapeHtml(message)}
    </div>
  `;
  document.body.appendChild(overlay);
  return () => {
    const el = document.getElementById("bulk-students-delete-overlay");
    if (el) el.remove();
  };
}

async function deleteStudentAndLinkedData(student, options = {}) {
  const hints = Array.isArray(options.currentPasswordHints) ? options.currentPasswordHints : [];
  let authDeleteResult = { authDeleted: true };
  try {
    authDeleteResult = await deleteStudentAccountWithFallback(student, {
      currentPasswordHints: hints
    });
  } catch (e) {
    authDeleteResult = {
      authDeleted: false,
      warning: getCallableErrorMessage(e)
    };
  }

  const batchDeleteByUserId = async (collectionName, fieldName = "userId") => {
    const snap = await getDocs(query(collection(db, collectionName), where(fieldName, "==", student.id)));
    if (snap.empty) return;
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 450) {
      const part = docs.slice(i, i + 450);
      const batch = writeBatch(db);
      part.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  };

  await Promise.all([
    batchDeleteByUserId("completions"),
    batchDeleteByUserId("contentAssignmentProgress"),
    batchDeleteByUserId("blockAssignmentProgress"),
    batchDeleteByUserId("computeAssignmentProgress"),
    batchDeleteByUserId("lessonProgress"),
    batchDeleteByUserId("liveQuizAnswers"),
    batchDeleteByUserId("studentActivityProgress")
  ]);
  await deleteDoc(doc(db, "users", student.id));

  if (!authDeleteResult?.authDeleted) {
    await setDoc(doc(db, "deletedAuthUsers", student.id), {
      uid: student.id,
      username: String(student.username || ""),
      email: String(student.email || ""),
      deletedBy: currentUserId || "",
      deletedAt: serverTimestamp(),
      warning: String(authDeleteResult?.warning || "")
    }, { merge: true });
  }

  return authDeleteResult;
}

function renderStudentsList(students) {
  const list = document.getElementById("students-list");
  if (!list) return;
  list.innerHTML = "";
  
  if (students.length === 0) {
    list.innerHTML = "<div class='empty-state'>Öğrenci bulunamadı.</div>";
    return;
  }
  
  students.forEach(student => {
    const row = document.createElement("div");
    row.className = "card";
    row.style.padding = "12px";
    
    const username = student.username || "";
    const firstName = student.firstName || "";
    const lastName = student.lastName || "";
    const displayName = getUserDisplayName(student);
    const nameParts = displayName.split(" ");
    const fallbackFirst = firstName || nameParts[0] || "";
    const fallbackLast = lastName || nameParts.slice(1).join(" ") || "";
    const className = student.className || "";
    const section = student.section || "";
    const shownPassword = String(student.loginCardPassword || "").trim();
    
    row.innerHTML = `
      <div class="student-row">
        <input class="form-control student-input input-first" value="${fallbackFirst}" disabled>
        <input class="form-control student-input input-last" value="${fallbackLast}" disabled>
        <input class="form-control student-input input-username" value="${username}" disabled>
        <input type="text" class="form-control student-input input-pass" value="${shownPassword}" disabled>
        <input class="form-control student-input input-class" value="${className}" disabled>
        <input class="form-control student-input input-section" value="${section}" disabled>
        <div class="student-actions">
          <button class="btn btn-warning btn-edit">Düzenle</button>
          <button class="btn btn-success btn-save" style="display:none;">Kaydet</button>
          <button class="btn btn-cancel" style="display:none; background:#eee;">İptal</button>
          <button class="btn btn-primary btn-temp-pass">Şifre Sıfırla</button>
          <button class="btn btn-danger btn-delete">Sil</button>
        </div>
      </div>
    `;
    
    const inputs = row.querySelectorAll("input");
    const [firstInput, lastInput, userInput, passInput, classInput, sectionInput] = inputs;
    const editBtn = row.querySelector(".btn-edit");
    const saveBtn = row.querySelector(".btn-save");
    const cancelBtn = row.querySelector(".btn-cancel");
    const deleteBtn = row.querySelector(".btn-delete");
    const tempPassBtn = row.querySelector(".btn-temp-pass");
    
    editBtn.onclick = () => {
      firstInput.disabled = false;
      lastInput.disabled = false;
      userInput.disabled = true;
      passInput.disabled = false;
      passInput.value = "";
      passInput.placeholder = "Yeni Şifre (opsiyonel)";
      classInput.disabled = false;
      sectionInput.disabled = false;
      saveBtn.style.display = "inline-block";
      cancelBtn.style.display = "inline-block";
      editBtn.style.display = "none";
    };
    
    cancelBtn.onclick = () => {
      firstInput.value = fallbackFirst;
      lastInput.value = fallbackLast;
      userInput.value = username;
      passInput.value = String(student.loginCardPassword || "");
      passInput.placeholder = "Şifre";
      classInput.value = className;
      sectionInput.value = section;
      inputs.forEach(i => i.disabled = true);
      saveBtn.style.display = "none";
      cancelBtn.style.display = "none";
      editBtn.style.display = "inline-block";
    };
    
    saveBtn.onclick = async () => {
      try {
        const enteredPassword = String(passInput.value || "").trim();
        if (enteredPassword && enteredPassword.length < 6) {
          showNotice("Yeni şifre en az 6 karakter olmalı.", "#e74c3c");
          return;
        }
        const updateData = {
          firstName: firstInput.value.trim(),
          lastName: lastInput.value.trim(),
          className: classInput.value,
          section: sectionInput.value
        };
        await updateDoc(doc(db, "users", student.id), updateData);
        if (enteredPassword) {
          await applyStudentPasswordUpdate(student, enteredPassword, {
            currentPasswordHints: [shownPassword, passInput.defaultValue]
          });
        }
        showNotice("Öğrenci bilgileri güncellendi!", "#2ecc71");
        inputs.forEach(i => i.disabled = true);
        passInput.value = String(student.loginCardPassword || "");
        passInput.placeholder = "Şifre";
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";
        editBtn.style.display = "inline-block";
      } catch (e) {
        passInput.value = String(student.loginCardPassword || "");
        passInput.placeholder = "Şifre";
        showNotice("Güncelleme hatası: " + getCallableErrorMessage(e), "#e74c3c");
      }
    };

    if (tempPassBtn) {
      tempPassBtn.onclick = async () => {
        const ok = await confirmDialog("Şifre sıfırlansın mı? Yeni şifre: 123456");
        if (!ok) return;
        try {
          const resetPassword = "123456";
          await applyStudentPasswordUpdate(student, resetPassword, {
            currentPasswordHints: [shownPassword, passInput.value]
          });
          passInput.value = resetPassword;
          await infoDialog(`Şifre sıfırlandı.\nYeni şifre: ${resetPassword}`, {
            okText: "Tamam"
          });
        } catch (e) {
          showNotice("Şifre sıfırlanamadı: " + getCallableErrorMessage(e), "#e74c3c");
        }
      };
    }
    
    deleteBtn.onclick = async () => {
      const ok = await confirmDialog("Öğrenciyi silmek istediğinize emin misiniz?");
      if (!ok) return;
      try {
        const authDeleteResult = await deleteStudentAndLinkedData(student, {
          currentPasswordHints: [shownPassword, passInput.value]
        });
        if (!authDeleteResult?.authDeleted) {
          showNotice("Öğrenci sistemden kaldırıldı. Auth silme uyarısı: " + String(authDeleteResult?.warning || "Bilinmeyen hata"), "#f39c12");
        } else {
          showNotice("Öğrenci silindi!", "#2ecc71");
        }
        loadStudentsModal();
      } catch (e) {
        showNotice("Silme hatası: " + getCallableErrorMessage(e), "#e74c3c");
      }
    };
    
    list.appendChild(row);
  });
}

function getUniqueStudents(students) {
  const map = new Map();
  students.forEach((s) => {
    const normalizedUsername = normalizeOwnerToken(s.username || "");
    const normalizedEmail = normalizeOwnerToken(s.email || "");
    const compactUsername = normalizeIdentityToken(normalizedUsername);
    const compactEmail = normalizeIdentityToken(normalizedEmail);
    const emailPrefix = normalizedEmail.includes("@") ? normalizedEmail.split("@")[0] : "";
    const compactEmailPrefix = normalizeIdentityToken(emailPrefix);
    const identityKey = compactUsername || compactEmailPrefix || compactEmail || normalizedUsername || emailPrefix || normalizedEmail;
    const key = identityKey || `${normalizeIdentityToken(s.firstName || "")}|${normalizeIdentityToken(s.lastName || "")}|${normalizeIdentityToken(s.className || "")}|${normalizeIdentityToken(s.section || "")}`;
    if (!map.has(key)) {
      map.set(key, s);
      return;
    }
    const prev = map.get(key) || {};
    const prevXP = getStudentXPValue(prev);
    const nextXP = getStudentXPValue(s);
    map.set(key, nextXP >= prevXP ? { ...prev, ...s, xp: nextXP } : { ...s, ...prev, xp: prevXP });
  });
  return Array.from(map.values());
}

function buildStudentReportStats(detail) {
  const totalTasks = detail.totalTasks || 0;
  const completedCount = detail.completedCount || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const avgScore = detail.avgScore || 0;
  const totalXP = detail.totalXP || 0;
  const durations = detail.taskHistory.map(t => t.duration || 0).filter(d => d > 0);
  const totalTimeSec = durations.reduce((a, b) => a + b, 0);
  const avgTimeSec = durations.length ? Math.round(totalTimeSec / durations.length) : 0;
  const bestTimeSec = durations.length ? Math.min(...durations) : 0;
  const firstDate = detail.taskHistory.length ? detail.taskHistory[detail.taskHistory.length - 1].date : "-";
  const lastDate = detail.taskHistory.length ? detail.taskHistory[0].date : "-";
  
  let daysInSystem = "-";
  if (detail.student.createdAt && typeof detail.student.createdAt.toDate === "function") {
    const created = detail.student.createdAt.toDate();
    const now = new Date();
    daysInSystem = Math.max(1, Math.ceil((now - created) / (1000 * 60 * 60 * 24)));
  }
  const totalSystemTimeSec = detail.student?.id === currentUserId
    ? getLiveSystemSeconds()
    : (detail.student.totalTimeSeconds || 0);
  const totalSystemTimeMin = Math.round(totalSystemTimeSec / 60);
  
  return {
    totalTasks,
    completedCount,
    completionRate,
    avgScore,
    totalXP,
    totalTimeMin: Math.round(totalTimeSec / 60),
    avgTimeMin: Math.round(avgTimeSec / 60),
    bestTimeMin: Math.round(bestTimeSec / 60),
    firstDate,
    lastDate,
    daysInSystem,
    totalSystemTimeMin,
    totalSystemTimeSec
  };
}

async function openStudentReportWindow(detail) {
  const studentName = getUserDisplayName(detail.student);
  const classInfo = detail.student.className && detail.student.section
    ? `${detail.student.className}/${detail.student.section}`
    : "-";
    const stats = buildStudentReportStats(detail);
    const sysParts = formatDurationParts(stats.totalSystemTimeSec || 0);
    const systemTimeText = `${sysParts.days}g ${sysParts.hours}s ${sysParts.mins}dk ${sysParts.secs}sn`;

  let contentStats = { totalItems: 0, completedItems: 0, totalXP: 0, percent: 0, appSeconds: 0, appList: [] };
  try {
    const pq = query(collection(db, "contentProgress"), where("userId", "==", detail.student.id));
    const psnap = await getDocs(pq);
    psnap.forEach((docSnap) => {
      const data = docSnap.data();
      const totalItems = data.totalItems || 0;
      const completedItems = (data.completedItemIds || []).length;
      contentStats.totalItems += totalItems;
      contentStats.completedItems += completedItems;
      contentStats.totalXP += data.totalXP || 0;
      const appUsage = data.appUsage || {};
      Object.entries(appUsage).forEach(([appId, v]) => {
        const seconds = v?.seconds || 0;
        const percent = v?.percent || 0;
        const xp = v?.xp || 0;
        const title = v?.title || `Uygulama`;
        const link = v?.link || "";
        contentStats.appSeconds += seconds;
        contentStats.appList.push({ appId, seconds, percent, xp, title, link });
      });
    });
    contentStats.percent = contentStats.totalItems > 0
      ? Math.round((contentStats.completedItems / contentStats.totalItems) * 100)
      : 0;
  } catch (e) {
    contentStats = { totalItems: 0, completedItems: 0, totalXP: 0, percent: 0, appSeconds: 0, appList: [] };
  }
  if (!contentStats.appList.length && detail.student?.id === currentUserId) {
    contentProgressMap.forEach((data) => {
      const totalItems = data.totalItems || 0;
      const completedItems = (data.completedItemIds || []).length;
      contentStats.totalItems += totalItems;
      contentStats.completedItems += completedItems;
      contentStats.totalXP += data.totalXP || 0;
      const appUsage = data.appUsage || {};
      Object.entries(appUsage).forEach(([appId, v]) => {
        const seconds = v?.seconds || 0;
        const percent = v?.percent || 0;
        const xp = v?.xp || 0;
        const title = v?.title || `Uygulama`;
        const link = v?.link || "";
        contentStats.appSeconds += seconds;
        contentStats.appList.push({ appId, seconds, percent, xp, title, link });
      });
    });
    contentStats.percent = contentStats.totalItems > 0
      ? Math.round((contentStats.completedItems / contentStats.totalItems) * 100)
      : 0;
  }
  // fallback: pop-up istatistiklerinden rapora taşı
  if (!contentStats.appList.length && Array.isArray(detail?.activityItems) && detail.activityItems.length) {
    contentStats.appList = detail.activityItems.map(a => ({
      appId: a.appId || a.id || "",
      seconds: a.seconds || 0,
      percent: a.percent || 0,
      xp: a.xp || 0,
      title: a.title || "Etkinlik",
      link: a.link || ""
    }));
    contentStats.appSeconds = contentStats.appList.reduce((sum, a) => sum + (a.seconds || 0), 0);
  }

  const appCount = contentStats.appList.length;
  const activityCompleted = contentStats.appList.filter(a => (a.percent || 0) > 0).length;
  const totalActivities = appCount;
  const appAvgPercent = totalActivities > 0
    ? Math.round((activityCompleted / totalActivities) * 100)
    : 0;
  const blockStats = await fetchBlockRunStats(detail.student.id);
  const computeStats = await fetchComputeRunStats(detail.student.id);
  const quizStats = await fetchStudentQuizStats(detail.student.id);
  const quizRows = (quizStats.items || []).map((q, i) => `
      <tr>
        <td>${i + 1}. ${q.quizTitle || "Quiz"}</td>
        <td>${q.correct || 0}</td>
        <td>${q.wrong || 0}</td>
        <td>${q.answered || 0}</td>
        <td>%${q.successRate || 0}</td>
        <td>${q.xpEarned || 0} XP</td>
        <td>${formatQuizDurationText(q.durationMs, q.durationMinutes)}</td>
        <td>${q.finishedAtMs ? new Date(Number(q.finishedAtMs)).toLocaleDateString("tr-TR") : "-"}</td>
      </tr>
    `).join("");
  const blockCompletedCount = Math.min(Math.max(0, blockStats.completedLevels || 0), Math.max(0, blockStats.totalLevels || 0));
  const blockTotalCount = Math.max(0, blockStats.totalLevels || 0);
  const blockPendingCount = Math.max(0, blockTotalCount - blockCompletedCount);
  const computeCompletedCount = Math.min(Math.max(0, computeStats.completedLevels || 0), Math.max(0, computeStats.totalLevels || 0));
  const computeTotalCount = Math.max(0, computeStats.totalLevels || 0);
  const computePendingCount = Math.max(0, computeTotalCount - computeCompletedCount);
  const combinedTotal = (stats.totalTasks || 0) + totalActivities + blockTotalCount + computeTotalCount + (quizStats.totalQuizzes || 0);
  const combinedCompleted = (stats.completedCount || 0) + activityCompleted + blockCompletedCount + computeCompletedCount + (quizStats.totalQuizzes || 0);
  const combinedCompletionRate = combinedTotal > 0 ? Math.round((combinedCompleted / combinedTotal) * 100) : 0;
  const combinedAvgScore = combinedCompletionRate;
  const totalXPCombined = (stats.totalXP || 0)
    + contentStats.appList.reduce((sum, a) => sum + (a.xp || 0), 0)
    + (blockStats.totalXP || 0)
    + (computeStats.totalXP || 0)
    + (quizStats.totalXP || 0);
  
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    showNotice("Yeni pencere açılamadı.", "#e74c3c");
    return;
  }
  
    const taskOnlyHistory = (Array.isArray(detail.taskHistory) ? detail.taskHistory : [])
      .filter((t) => !String(t?.title || "").startsWith("Ders:"));
    const lessonHistoryRows = ((Array.isArray(detail.lessonHistory) && detail.lessonHistory.length)
      ? detail.lessonHistory
      : (Array.isArray(detail.taskHistory) ? detail.taskHistory.filter((t) => String(t?.title || "").startsWith("Ders:")) : [])
    ).map((l, i) => `
      <tr>
        <td>${i + 1}. ${String(l.title || "Ders").replace(/^Ders:\s*/i, "")}</td>
        <td>${l.date || "-"}</td>
        <td>%${Math.max(0, Math.min(100, Number(l.score || 0)))}</td>
        <td>${Math.floor((Number(l.duration || 0)) / 60)} dk</td>
        <td>+${Math.max(0, Number(l.xp || 0))} XP</td>
      </tr>
    `).join("");

    const historyRows = taskOnlyHistory.slice(0, 10).map((t, i) => {
      const safeScore = Math.max(0, Math.min(100, Number(t?.score || 0)));
      const safeDuration = Math.max(0, Number(t?.duration || 0));
      const safeXp = Math.max(0, Number(t?.xp || 0));
      return `
      <tr>
      <td>${i + 1}. ${t.title}</td>
      <td>${t.date}</td>
      <td>
        <div class="score-wrap">
          <span class="score-text">%${safeScore}</span>
          <div class="score-bar">
            <div class="score-fill" style="width:${safeScore}%;"></div>
          </div>
        </div>
      </td>
      <td>${Math.floor(safeDuration / 60)} dk</td>
      <td>+${safeXp} XP</td>
    </tr>
    `;
    }).join("");
    
    const appRows = contentStats.appList.map((a, i) => `
      <tr>
        <td>${i + 1}. ${a.title || "Etkinlik"}</td>
        <td>${Math.floor((a.seconds || 0) / 60)} dk ${(a.seconds || 0) % 60} sn</td>
        <td>%${a.percent || 0}</td>
        <td>${a.xp || 0} XP</td>
      </tr>
    `).join("");
    const blockRows = (blockStats.runs || []).map((run, i) => `
      <tr>
        <td>${i + 1}. ${run.title || "Blok Kodlama Ödevi"}</td>
        <td>Seviye ${run.rangeText || "-"}</td>
        <td>${Math.floor((run.durationSeconds || 0) / 60)} dk ${(run.durationSeconds || 0) % 60} sn</td>
        <td>${run.xp || 0} XP</td>
      </tr>
    `).join("");
    const computeRows = (computeStats.runs || []).map((run, i) => `
      <tr>
        <td>${i + 1}. ${run.title || "Compute It Ödevi"}</td>
        <td>Seviye ${run.rangeText || "-"}</td>
        <td>${Math.floor((run.durationSeconds || 0) / 60)} dk ${(run.durationSeconds || 0) % 60} sn</td>
        <td>${run.xp || 0} XP</td>
      </tr>
    `).join("");
  const taskCompletedCount = Math.min(Math.max(0, stats.completedCount || 0), stats.totalTasks || 0);
  const taskTotalCount = Math.max(0, stats.totalTasks || 0);
  const taskPendingCount = Math.max(0, taskTotalCount - taskCompletedCount);
  const activityTotalCount = Math.max(0, totalActivities || 0);
  const activityCompletedCount = Math.min(Math.max(0, activityCompleted || 0), activityTotalCount);
  const activityPendingCount = Math.max(0, activityTotalCount - activityCompletedCount);
  const taskPie = buildPieSvg(taskCompletedCount, taskTotalCount, "Ödev", "#3b82f6");
  const activityPie = buildPieSvg(activityCompletedCount, activityTotalCount, "Etkinlik", "#22c55e");
  const blockPie = buildPieSvg(blockCompletedCount, blockTotalCount, "Blok", "#f59e0b");
  const computePie = buildPieSvg(computeCompletedCount, computeTotalCount, "Compute", "#8b5cf6");
  
  reportWindow.document.write(`
    <html lang="tr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Öğrenci Raporu</title>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --brand: #3b145f;
          --brand-2: #5b2b8a;
          --accent: #2f6fed;
          --muted: #667085;
          --bg: #f4f5f9;
          --ink: #101828;
        }
          body { font-family: "Montserrat", "Segoe UI", Tahoma, Arial, sans-serif; margin: 0; padding: 16px; background: var(--bg); color: var(--ink); }
          .page { max-width: 190mm; margin: 0 auto; }
          .card { background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 8px; box-shadow: 0 6px 16px rgba(16, 24, 40, 0.08); border: 1px solid #eaecf0; }
          .header { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 5px solid var(--brand); background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%); }
          .logo { width: 84px; height: auto; display: block; margin: 0 auto; }
          .title { font-size: 18px; font-weight: 700; color: var(--brand); text-align: center; letter-spacing: 0.2px; }
          .subtitle { color: var(--muted); font-size: 11px; text-align: center; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
          .kpi { background: #f8f9ff; border: 1px solid #e4e7ec; border-radius: 8px; padding: 6px; text-align: center; }
          .kpi .value { font-size: 12.5px; font-weight: 700; color: var(--brand-2); }
          .kpi .label { font-size: 9.5px; color: var(--muted); }
          .badge { background: #f3f0ff; color: var(--brand-2); padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
          .progress { height: 8px; background: #e4e7ec; border-radius: 999px; overflow: hidden; }
          .progress > div { height: 100%; background: linear-gradient(90deg, var(--accent), #22c55e); }
          .mini-bar { height: 8px; background: #e4e7ec; border-radius: 999px; overflow: hidden; }
          .mini-bar > div { height: 100%; background: linear-gradient(90deg, var(--accent), #22c55e); }
          .info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; margin-top: 6px; }
          .info-pill { background: #f5f6fa; border: 1px solid #e5e7eb; border-radius: 10px; padding: 6px 8px; font-size: 11px; color: #111827; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #e4e7ec; padding: 5px; text-align: left; vertical-align: top; }
          th { background: #f2f4f7; color: #344054; font-size: 11px; }
        .score-wrap { display: grid; gap: 4px; }
        .score-text { font-weight: 600; color: var(--ink); }
        .score-bar { height: 6px; background: #e4e7ec; border-radius: 999px; overflow: hidden; }
        .score-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #22c55e); }
        .actions { display: flex; gap: 8px; margin-top: 12px; justify-content: center; }
        .btn { padding: 10px 14px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; }
        .btn-primary { background: var(--accent); color: #fff; }
        .btn-secondary { background: #e5e7eb; color: #111827; }
          .section-title { font-weight: 700; color: var(--ink); margin-bottom: 6px; font-size: 13px; }
        @media (max-width: 720px) {
          .grid { grid-template-columns: 1fr; }
          .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
          @page { size: A4; margin: 10mm; }
        @media print {
          body { background: #fff; padding: 0; }
          .card { box-shadow: none; border: 1px solid #e4e7ec; }
          .actions { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="card header">
          <div style="flex:1;">
            <img src="logo.png" alt="Logo" class="logo" />
            <div class="title">Öğrenci Performans Raporu</div>
            <div class="subtitle">${new Date().toLocaleDateString("tr-TR")} • Kurumsal Öğrenci Takip Sistemi</div>
          </div>
        </div>
        <div class="card actions" style="margin-top:8px;">
          <button id="downloadBtn" class="btn btn-primary">PDF İndir</button>
          <button id="closeBtn" class="btn btn-secondary">Kapat</button>
        </div>
          <div class="card grid">
            <div>
              <div class="section-title">Öğrenci Bilgileri</div>
              <div class="info-grid">
                <div class="info-pill"><strong>Ad:</strong> ${studentName}</div>
                <div class="info-pill"><strong>Sınıf/Şube:</strong> ${classInfo}</div>
                <div class="info-pill"><strong>Sıralama:</strong> #${detail.rank}</div>
                <div class="info-pill"><strong>Toplam Süre:</strong> ${systemTimeText}</div>
              </div>
              <div style="margin-top:10px;">
                <div class="section-title">Tamamlama Oranı</div>
              <div class="mini-bar"><div style="width:${Math.min(100, Math.max(0, combinedCompletionRate || 0))}%;"></div></div>
              <div style="font-size:11px;color:var(--muted);margin-top:4px;">%${combinedCompletionRate} tamamlandı</div>
            </div>
          </div>
          <div>
            <div class="section-title">Genel Performans</div>
        <div class="kpi-grid">
          <div class="kpi"><div class="value">${stats.totalTasks}</div><div class="label">Toplam Ödev</div></div>
          <div class="kpi"><div class="value">${stats.completedCount}</div><div class="label">Tamamlanan</div></div>
          <div class="kpi"><div class="value">%${combinedAvgScore}</div><div class="label">Ortalama Başarı</div></div>
          <div class="kpi"><div class="value">${totalXPCombined}</div><div class="label">Toplam XP</div></div>
        </div>
          <div class="kpi-grid" style="margin-top:6px;">
            <div class="kpi"><div class="value">${appCount}</div><div class="label">Etkinlik Sayısı</div></div>
            <div class="kpi"><div class="value">%${appAvgPercent}</div><div class="label">Etkinlik Ort.</div></div>
            <div class="kpi"><div class="value">${Math.floor(contentStats.appSeconds / 60)} dk</div><div class="label">Etkinlik Süre</div></div>
            <div class="kpi"><div class="value">${contentStats.appList.reduce((sum, a) => sum + (a.xp || 0), 0)}</div><div class="label">Etkinlik XP</div></div>
          </div>
          </div>
        </div>
          <div class="card">
            <div class="section-title">Ödev, Etkinlik, Quiz, Blok Kodlama ve Compute It Tamamlama</div>
            <div style="display:grid; grid-template-columns: repeat(4, minmax(88px, 1fr)); gap:8px; align-items:center;">
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                ${taskPie}
                <div style="font-size:11px; color:#475569;">${taskCompletedCount} / ${taskTotalCount} tamamlandı</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                ${activityPie}
                <div style="font-size:11px; color:#475569;">${activityCompletedCount} / ${activityTotalCount} tamamlandı</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                ${blockPie}
                <div style="font-size:11px; color:#475569;">${blockCompletedCount} / ${blockTotalCount} tamamlandı</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                ${computePie}
                <div style="font-size:11px; color:#475569;">${computeCompletedCount} / ${computeTotalCount} tamamlandı</div>
              </div>
            </div>
            <div style="display:grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap:6px; margin-top:10px;">
              <div class="info-pill"><strong>Ödev:</strong> ${taskCompletedCount} tamamlandı, ${taskPendingCount} bekliyor</div>
              <div class="info-pill"><strong>Etkinlik:</strong> ${activityCompletedCount} tamamlandı, ${activityPendingCount} bekliyor</div>
              <div class="info-pill"><strong>Quiz:</strong> ${quizStats.totalQuizzes || 0} tamamlandı, doğruluk %${quizStats.avgSuccess || 0}</div>
              <div class="info-pill"><strong>Blok Kodlama:</strong> ${blockCompletedCount} tamamlandı, ${blockPendingCount} bekliyor</div>
              <div class="info-pill"><strong>Compute It:</strong> ${computeCompletedCount} tamamlandı, ${computePendingCount} bekliyor</div>
            </div>
            <table style="margin-top:10px;">
            <thead>
              <tr>
                <th>Ödev</th><th>Tarih</th><th>Başarı</th><th>Süre</th><th>XP</th>
              </tr>
            </thead>
            <tbody>
              ${historyRows || "<tr><td colspan='5'>Veri yok.</td></tr>"}
            </tbody>
            </table>
            <div class="section-title" style="margin-top:10px;">Dersler</div>
            <table>
              <thead>
                <tr>
                  <th>Ders</th><th>Tarih</th><th>İlerleme</th><th>Süre</th><th>XP</th>
                </tr>
              </thead>
              <tbody>
                ${lessonHistoryRows || "<tr><td colspan='5'>Veri yok.</td></tr>"}
              </tbody>
            </table>
          </div>
          <div class="card">
            <div class="section-title">Etkinlikler</div>
            <table>
              <thead>
                <tr>
                  <th>Etkinlik</th><th>Süre</th><th>İlerleme</th><th>XP</th>
                </tr>
              </thead>
              <tbody>
                ${appRows || "<tr><td colspan='4'>Veri yok.</td></tr>"}
              </tbody>
            </table>
          </div>
          <div class="card">
            <div class="section-title">Canlı Quiz Sonuçları</div>
            <div class="kpi-grid" style="margin-bottom:8px;">
              <div class="kpi"><div class="value">${quizStats.totalQuizzes || 0}</div><div class="label">Quiz</div></div>
              <div class="kpi"><div class="value">${quizStats.totalCorrect || 0}</div><div class="label">Doğru</div></div>
              <div class="kpi"><div class="value">${quizStats.totalWrong || 0}</div><div class="label">Yanlış</div></div>
              <div class="kpi"><div class="value">${quizStats.totalXP || 0}</div><div class="label">Quiz XP</div></div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Quiz</th><th>Doğru</th><th>Yanlış</th><th>Cevap</th><th>Başarı</th><th>XP</th><th>Süre</th><th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                ${quizRows || "<tr><td colspan='8'>Veri yok.</td></tr>"}
              </tbody>
            </table>
          </div>
          <div class="card">
            <div class="section-title">Blok Kodlama</div>
            <div class="kpi-grid" style="margin-bottom:8px;">
              <div class="kpi"><div class="value">${blockStats.completedLevels}</div><div class="label">Tamamlanan Seviye</div></div>
              <div class="kpi"><div class="value">${blockStats.totalLevels}</div><div class="label">Toplam Seviye</div></div>
              <div class="kpi"><div class="value">%${blockStats.progressPercent}</div><div class="label">İlerleme</div></div>
              <div class="kpi"><div class="value">${Math.floor((blockStats.totalDurationMs || 0) / 60000)} dk</div><div class="label">Toplam Süre</div></div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Ödev</th><th>Level Aralığı</th><th>Süre</th><th>XP</th>
                </tr>
              </thead>
              <tbody>
                ${blockRows || "<tr><td colspan='4'>Veri yok.</td></tr>"}
              </tbody>
            </table>
          </div>
          <div class="card">
            <div class="section-title">Compute It</div>
            <div class="kpi-grid" style="margin-bottom:8px;">
              <div class="kpi"><div class="value">${computeStats.completedLevels}</div><div class="label">Tamamlanan Seviye</div></div>
              <div class="kpi"><div class="value">${computeStats.totalLevels}</div><div class="label">Toplam Seviye</div></div>
              <div class="kpi"><div class="value">%${computeStats.progressPercent}</div><div class="label">İlerleme</div></div>
              <div class="kpi"><div class="value">${Math.floor((computeStats.totalDurationMs || 0) / 60000)} dk</div><div class="label">Toplam Süre</div></div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Ödev</th><th>Level Aralığı</th><th>Süre</th><th>XP</th>
                </tr>
              </thead>
              <tbody>
                ${computeRows || "<tr><td colspan='4'>Veri yok.</td></tr>"}
              </tbody>
            </table>
          </div>
      </div>
      <script>
        window.reportData = ${JSON.stringify({ studentName, classInfo, stats, contentStats, history: detail.taskHistory.slice(0, 10) })};
      </script>
    </body>
    </html>
  `);
  reportWindow.document.close();
  
  reportWindow.onload = () => {
    const btn = reportWindow.document.getElementById("downloadBtn");
    const closeBtn = reportWindow.document.getElementById("closeBtn");
    if (btn) {
      btn.onclick = () => {
        reportWindow.focus();
        reportWindow.print();
      };
    }
    if (closeBtn) {
      closeBtn.onclick = () => {
        reportWindow.close();
      };
    }
  };
}

async function buildStudentReportHtml(detail) {
  const studentName = getUserDisplayName(detail.student);
  const classInfo = detail.student.className && detail.student.section
    ? `${detail.student.className}/${detail.student.section}`
    : "-";
  const stats = buildStudentReportStats(detail);
  const sysParts = formatDurationParts(stats.totalSystemTimeSec || 0);
  const systemTimeText = `${sysParts.days}g ${sysParts.hours}s ${sysParts.mins}dk ${sysParts.secs}sn`;

  let contentStats = { totalItems: 0, completedItems: 0, totalXP: 0, percent: 0, appSeconds: 0, appList: [] };
  try {
    const pq = query(collection(db, "contentProgress"), where("userId", "==", detail.student.id));
    const psnap = await getDocs(pq);
    psnap.forEach((docSnap) => {
      const data = docSnap.data();
      const totalItems = data.totalItems || 0;
      const completedItems = (data.completedItemIds || []).length;
      contentStats.totalItems += totalItems;
      contentStats.completedItems += completedItems;
      contentStats.totalXP += data.totalXP || 0;
      const appUsage = data.appUsage || {};
      Object.entries(appUsage).forEach(([appId, v]) => {
        const seconds = v?.seconds || 0;
        const percent = v?.percent || 0;
        const xp = v?.xp || 0;
        const title = v?.title || `Uygulama`;
        const link = v?.link || "";
        contentStats.appSeconds += seconds;
        contentStats.appList.push({ appId, seconds, percent, xp, title, link });
      });
    });
    contentStats.percent = contentStats.totalItems > 0
      ? Math.round((contentStats.completedItems / contentStats.totalItems) * 100)
      : 0;
  } catch (e) {
    contentStats = { totalItems: 0, completedItems: 0, totalXP: 0, percent: 0, appSeconds: 0, appList: [] };
  }
  if (!contentStats.appList.length && detail.student?.id === currentUserId) {
    contentProgressMap.forEach((data) => {
      const totalItems = data.totalItems || 0;
      const completedItems = (data.completedItemIds || []).length;
      contentStats.totalItems += totalItems;
      contentStats.completedItems += completedItems;
      contentStats.totalXP += data.totalXP || 0;
      const appUsage = data.appUsage || {};
      Object.entries(appUsage).forEach(([appId, v]) => {
        const seconds = v?.seconds || 0;
        const percent = v?.percent || 0;
        const xp = v?.xp || 0;
        const title = v?.title || `Uygulama`;
        const link = v?.link || "";
        contentStats.appSeconds += seconds;
        contentStats.appList.push({ appId, seconds, percent, xp, title, link });
      });
    });
    contentStats.percent = contentStats.totalItems > 0
      ? Math.round((contentStats.completedItems / contentStats.totalItems) * 100)
      : 0;
  }
  if (!contentStats.appList.length && Array.isArray(detail?.activityItems) && detail.activityItems.length) {
    contentStats.appList = detail.activityItems.map(a => ({
      appId: a.appId || a.id || "",
      seconds: a.seconds || 0,
      percent: a.percent || 0,
      xp: a.xp || 0,
      title: a.title || "Etkinlik",
      link: a.link || ""
    }));
    contentStats.appSeconds = contentStats.appList.reduce((sum, a) => sum + (a.seconds || 0), 0);
  }

  const appCount = contentStats.appList.length;
  const activityCompleted = contentStats.appList.filter(a => (a.percent || 0) > 0).length;
  const totalActivities = appCount;
  const appAvgPercent = totalActivities > 0
    ? Math.round((activityCompleted / totalActivities) * 100)
    : 0;
  const blockStats = await fetchBlockRunStats(detail.student.id);
  const computeStats = await fetchComputeRunStats(detail.student.id);
  const quizStats = await fetchStudentQuizStats(detail.student.id);
  const quizRows = (quizStats.items || []).map((q, i) => `
      <tr>
        <td>${i + 1}. ${q.quizTitle || "Quiz"}</td>
        <td>${q.correct || 0}</td>
        <td>${q.wrong || 0}</td>
        <td>${q.answered || 0}</td>
        <td>%${q.successRate || 0}</td>
        <td>${q.xpEarned || 0} XP</td>
        <td>${formatQuizDurationText(q.durationMs, q.durationMinutes)}</td>
        <td>${q.finishedAtMs ? new Date(Number(q.finishedAtMs)).toLocaleDateString("tr-TR") : "-"}</td>
      </tr>
    `).join("");
  const blockRows = (blockStats.runs || []).map((run, i) => `
      <tr>
        <td>${i + 1}. ${run.title || "Blok Kodlama Ödevi"}</td>
        <td>Seviye ${run.rangeText || "-"}</td>
        <td>${Math.floor((run.durationSeconds || 0) / 60)} dk ${(run.durationSeconds || 0) % 60} sn</td>
        <td>${run.xp || 0} XP</td>
      </tr>
    `).join("");
  const computeRows = (computeStats.runs || []).map((run, i) => `
      <tr>
        <td>${i + 1}. ${run.title || "Compute It Ödevi"}</td>
        <td>Seviye ${run.rangeText || "-"}</td>
        <td>${Math.floor((run.durationSeconds || 0) / 60)} dk ${(run.durationSeconds || 0) % 60} sn</td>
        <td>${run.xp || 0} XP</td>
      </tr>
    `).join("");

  const taskOnlyHistory = (Array.isArray(detail.taskHistory) ? detail.taskHistory : [])
    .filter((t) => !String(t?.title || "").startsWith("Ders:"));
  const lessonHistoryRows = ((Array.isArray(detail.lessonHistory) && detail.lessonHistory.length)
    ? detail.lessonHistory
    : (Array.isArray(detail.taskHistory) ? detail.taskHistory.filter((t) => String(t?.title || "").startsWith("Ders:")) : [])
  ).map((l, i) => `
      <tr>
        <td>${i + 1}. ${String(l.title || "Ders").replace(/^Ders:\s*/i, "")}</td>
        <td>${l.date || "-"}</td>
        <td>%${Math.max(0, Math.min(100, Number(l.score || 0)))}</td>
        <td>${Math.floor((Number(l.duration || 0)) / 60)} dk</td>
        <td>+${Math.max(0, Number(l.xp || 0))} XP</td>
      </tr>
    `).join("");

  const historyRows = taskOnlyHistory.slice(0, 10).map((t, i) => {
    const safeScore = Math.max(0, Math.min(100, Number(t?.score || 0)));
    const safeDuration = Math.max(0, Number(t?.duration || 0));
    const safeXp = Math.max(0, Number(t?.xp || 0));
    return `
      <tr>
      <td>${i + 1}. ${t.title}</td>
      <td>${t.date}</td>
      <td>
        <div class="score-wrap">
          <span class="score-text">%${safeScore}</span>
          <div class="score-bar">
            <div class="score-fill" style="width:${safeScore}%;"></div>
          </div>
        </div>
      </td>
      <td>${Math.floor(safeDuration / 60)} dk</td>
      <td>+${safeXp} XP</td>
    </tr>
    `;
  }).join("");

  const appRows = contentStats.appList.map((a, i) => `
      <tr>
        <td>${i + 1}. ${a.title || "Etkinlik"}</td>
        <td>${Math.floor((a.seconds || 0) / 60)} dk ${(a.seconds || 0) % 60} sn</td>
        <td>%${a.percent || 0}</td>
        <td>${a.xp || 0} XP</td>
      </tr>
    `).join("");

  const taskCompletedCount = Math.min(Math.max(0, stats.completedCount || 0), stats.totalTasks || 0);
  const taskTotalCount = Math.max(0, stats.totalTasks || 0);
  const taskPendingCount = Math.max(0, taskTotalCount - taskCompletedCount);
  const activityTotalCount = Math.max(0, totalActivities || 0);
  const activityCompletedCount = Math.min(Math.max(0, activityCompleted || 0), activityTotalCount);
  const activityPendingCount = Math.max(0, activityTotalCount - activityCompletedCount);
  const blockCompletedCount = Math.min(Math.max(0, blockStats.completedLevels || 0), Math.max(0, blockStats.totalLevels || 0));
  const blockTotalCount = Math.max(0, blockStats.totalLevels || 0);
  const blockPendingCount = Math.max(0, blockTotalCount - blockCompletedCount);
  const computeCompletedCount = Math.min(Math.max(0, computeStats.completedLevels || 0), Math.max(0, computeStats.totalLevels || 0));
  const computeTotalCount = Math.max(0, computeStats.totalLevels || 0);
  const computePendingCount = Math.max(0, computeTotalCount - computeCompletedCount);
  const combinedTotal = (stats.totalTasks || 0) + totalActivities + blockTotalCount + computeTotalCount + (quizStats.totalQuizzes || 0);
  const combinedCompleted = (stats.completedCount || 0) + activityCompleted + blockCompletedCount + computeCompletedCount + (quizStats.totalQuizzes || 0);
  const combinedCompletionRate = combinedTotal > 0 ? Math.round((combinedCompleted / combinedTotal) * 100) : 0;
  const combinedAvgScore = combinedCompletionRate;
  const totalXPCombined = (stats.totalXP || 0)
    + contentStats.appList.reduce((sum, a) => sum + (a.xp || 0), 0)
    + (blockStats.totalXP || 0)
    + (computeStats.totalXP || 0)
    + (quizStats.totalXP || 0);
  const taskPie = buildPieSvg(taskCompletedCount, taskTotalCount, "Ödev", "#3b82f6");
  const activityPie = buildPieSvg(activityCompletedCount, activityTotalCount, "Etkinlik", "#22c55e");
  const blockPie = buildPieSvg(blockCompletedCount, blockTotalCount, "Blok", "#f59e0b");
  const computePie = buildPieSvg(computeCompletedCount, computeTotalCount, "Compute", "#8b5cf6");

  return `
    <html lang="tr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Öğrenci Raporu</title>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --brand: #3b145f;
          --brand-2: #5b2b8a;
          --accent: #2f6fed;
          --muted: #667085;
          --bg: #f4f5f9;
          --ink: #101828;
        }
          body { font-family: "Montserrat", "Segoe UI", Tahoma, Arial, sans-serif; margin: 0; padding: 16px; background: var(--bg); color: var(--ink); }
          .page { max-width: 190mm; margin: 0 auto; }
          .card { background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 8px; box-shadow: 0 6px 16px rgba(16, 24, 40, 0.08); border: 1px solid #eaecf0; }
          .header { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 5px solid var(--brand); background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%); }
          .logo { width: 84px; height: auto; display: block; margin: 0 auto; }
          .title { font-size: 18px; font-weight: 700; color: var(--brand); text-align: center; letter-spacing: 0.2px; }
          .subtitle { color: var(--muted); font-size: 11px; text-align: center; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
          .kpi { background: #f8f9ff; border: 1px solid #e4e7ec; border-radius: 8px; padding: 6px; text-align: center; }
          .kpi .value { font-size: 12.5px; font-weight: 700; color: var(--brand-2); }
          .kpi .label { font-size: 9.5px; color: var(--muted); }
          .badge { background: #f3f0ff; color: var(--brand-2); padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
          .progress { height: 8px; background: #e4e7ec; border-radius: 999px; overflow: hidden; }
          .progress > div { height: 100%; background: linear-gradient(90deg, var(--accent), #22c55e); }
          .mini-bar { height: 8px; background: #e4e7ec; border-radius: 999px; overflow: hidden; }
          .mini-bar > div { height: 100%; background: linear-gradient(90deg, var(--accent), #22c55e); }
          .info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; margin-top: 6px; }
          .info-pill { background: #f5f6fa; border: 1px solid #e5e7eb; border-radius: 10px; padding: 6px 8px; font-size: 11px; color: #111827; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #e4e7ec; padding: 5px; text-align: left; vertical-align: top; }
          th { background: #f2f4f7; color: #344054; font-size: 11px; }
        .score-wrap { display: grid; gap: 4px; }
        .score-text { font-weight: 600; color: var(--ink); }
        .score-bar { height: 6px; background: #e4e7ec; border-radius: 999px; overflow: hidden; }
        .score-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #22c55e); }
        .actions { display: flex; gap: 8px; margin-top: 12px; justify-content: center; }
        .btn { padding: 10px 14px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; }
        .btn-primary { background: var(--accent); color: #fff; }
          .section-title { font-weight: 700; color: var(--ink); margin-bottom: 6px; font-size: 13px; }
        @media (max-width: 720px) {
          .grid { grid-template-columns: 1fr; }
          .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
          @page { size: A4; margin: 10mm; }
        @media print {
          body { background: #fff; padding: 0; }
          .card { box-shadow: none; border: 1px solid #e4e7ec; }
          .actions { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="card header">
          <div style="flex:1;">
            <img src="logo.png" alt="Logo" class="logo" />
            <div class="title">Öğrenci Performans Raporu</div>
            <div class="subtitle">${new Date().toLocaleDateString("tr-TR")} • Kurumsal Öğrenci Takip Sistemi</div>
          </div>
        </div>
          <div class="card grid">
            <div>
              <div class="section-title">Öğrenci Bilgileri</div>
              <div class="info-grid">
                <div class="info-pill"><strong>Ad:</strong> ${studentName}</div>
                <div class="info-pill"><strong>Sınıf/Şube:</strong> ${classInfo}</div>
                <div class="info-pill"><strong>Sıralama:</strong> #${detail.rank}</div>
                <div class="info-pill"><strong>Toplam Süre:</strong> ${systemTimeText}</div>
              </div>
              <div style="margin-top:10px;">
                <div class="section-title">Tamamlama Oranı</div>
              <div class="mini-bar"><div style="width:${Math.min(100, Math.max(0, combinedCompletionRate || 0))}%;"></div></div>
              <div style="font-size:11px;color:var(--muted);margin-top:4px;">%${combinedCompletionRate} tamamlandı</div>
            </div>
          </div>
          <div>
            <div class="section-title">Genel Performans</div>
        <div class="kpi-grid">
          <div class="kpi"><div class="value">${stats.totalTasks}</div><div class="label">Toplam Ödev</div></div>
          <div class="kpi"><div class="value">${stats.completedCount}</div><div class="label">Tamamlanan</div></div>
          <div class="kpi"><div class="value">%${combinedAvgScore}</div><div class="label">Ortalama Başarı</div></div>
          <div class="kpi"><div class="value">${totalXPCombined}</div><div class="label">Toplam XP</div></div>
        </div>
          <div class="kpi-grid" style="margin-top:6px;">
            <div class="kpi"><div class="value">${appCount}</div><div class="label">Etkinlik Sayısı</div></div>
            <div class="kpi"><div class="value">%${appAvgPercent}</div><div class="label">Etkinlik Ort.</div></div>
            <div class="kpi"><div class="value">${Math.floor(contentStats.appSeconds / 60)} dk</div><div class="label">Etkinlik Süre</div></div>
            <div class="kpi"><div class="value">${contentStats.appList.reduce((sum, a) => sum + (a.xp || 0), 0)}</div><div class="label">Etkinlik XP</div></div>
          </div>
          </div>
        </div>
          <div class="card">
            <div class="section-title">Ödev, Etkinlik, Quiz, Blok Kodlama ve Compute It Tamamlama</div>
            <div style="display:grid; grid-template-columns: repeat(4, minmax(88px, 1fr)); gap:8px; align-items:center;">
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                ${taskPie}
                <div style="font-size:11px; color:#475569;">${taskCompletedCount} / ${taskTotalCount} tamamlandı</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                ${activityPie}
                <div style="font-size:11px; color:#475569;">${activityCompletedCount} / ${activityTotalCount} tamamlandı</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                ${blockPie}
                <div style="font-size:11px; color:#475569;">${blockCompletedCount} / ${blockTotalCount} tamamlandı</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                ${computePie}
                <div style="font-size:11px; color:#475569;">${computeCompletedCount} / ${computeTotalCount} tamamlandı</div>
              </div>
            </div>
            <div style="display:grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap:6px; margin-top:10px;">
              <div class="info-pill"><strong>Ödev:</strong> ${taskCompletedCount} tamamlandı, ${taskPendingCount} bekliyor</div>
              <div class="info-pill"><strong>Etkinlik:</strong> ${activityCompletedCount} tamamlandı, ${activityPendingCount} bekliyor</div>
              <div class="info-pill"><strong>Quiz:</strong> ${quizStats.totalQuizzes || 0} tamamlandı, doğruluk %${quizStats.avgSuccess || 0}</div>
              <div class="info-pill"><strong>Blok Kodlama:</strong> ${blockCompletedCount} tamamlandı, ${blockPendingCount} bekliyor</div>
              <div class="info-pill"><strong>Compute It:</strong> ${computeCompletedCount} tamamlandı, ${computePendingCount} bekliyor</div>
            </div>
            <table style="margin-top:10px;">
            <thead>
              <tr>
                <th>Ödev</th><th>Tarih</th><th>Başarı</th><th>Süre</th><th>XP</th>
              </tr>
            </thead>
            <tbody>
              ${historyRows || "<tr><td colspan='5'>Veri yok.</td></tr>"}
            </tbody>
            </table>
            <div class="section-title" style="margin-top:10px;">Dersler</div>
            <table>
              <thead>
                <tr>
                  <th>Ders</th><th>Tarih</th><th>İlerleme</th><th>Süre</th><th>XP</th>
                </tr>
              </thead>
              <tbody>
                ${lessonHistoryRows || "<tr><td colspan='5'>Veri yok.</td></tr>"}
              </tbody>
            </table>
          </div>
          <div class="card">
            <div class="section-title">Etkinlikler</div>
            <table>
              <thead>
                <tr>
                  <th>Etkinlik</th><th>Süre</th><th>İlerleme</th><th>XP</th>
                </tr>
              </thead>
              <tbody>
                ${appRows || "<tr><td colspan='4'>Veri yok.</td></tr>"}
              </tbody>
            </table>
          </div>
          <div class="card">
            <div class="section-title">Canlı Quiz Sonuçları</div>
            <div class="kpi-grid" style="margin-bottom:8px;">
              <div class="kpi"><div class="value">${quizStats.totalQuizzes || 0}</div><div class="label">Quiz</div></div>
              <div class="kpi"><div class="value">${quizStats.totalCorrect || 0}</div><div class="label">Doğru</div></div>
              <div class="kpi"><div class="value">${quizStats.totalWrong || 0}</div><div class="label">Yanlış</div></div>
              <div class="kpi"><div class="value">${quizStats.totalXP || 0}</div><div class="label">Quiz XP</div></div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Quiz</th><th>Doğru</th><th>Yanlış</th><th>Cevap</th><th>Başarı</th><th>XP</th><th>Süre</th><th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                ${quizRows || "<tr><td colspan='8'>Veri yok.</td></tr>"}
              </tbody>
            </table>
          </div>
          <div class="card">
            <div class="section-title">Blok Kodlama</div>
            <div class="kpi-grid" style="margin-bottom:8px;">
              <div class="kpi"><div class="value">${blockStats.completedLevels}</div><div class="label">Tamamlanan Seviye</div></div>
              <div class="kpi"><div class="value">${blockStats.totalLevels}</div><div class="label">Toplam Seviye</div></div>
              <div class="kpi"><div class="value">%${blockStats.progressPercent}</div><div class="label">İlerleme</div></div>
              <div class="kpi"><div class="value">${Math.floor((blockStats.totalDurationMs || 0) / 60000)} dk</div><div class="label">Toplam Süre</div></div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Ödev</th><th>Level Aralığı</th><th>Süre</th><th>XP</th>
                </tr>
              </thead>
              <tbody>
                ${blockRows || "<tr><td colspan='4'>Veri yok.</td></tr>"}
              </tbody>
            </table>
          </div>
          <div class="card">
            <div class="section-title">Compute It</div>
            <div class="kpi-grid" style="margin-bottom:8px;">
              <div class="kpi"><div class="value">${computeStats.completedLevels}</div><div class="label">Tamamlanan Seviye</div></div>
              <div class="kpi"><div class="value">${computeStats.totalLevels}</div><div class="label">Toplam Seviye</div></div>
              <div class="kpi"><div class="value">%${computeStats.progressPercent}</div><div class="label">İlerleme</div></div>
              <div class="kpi"><div class="value">${Math.floor((computeStats.totalDurationMs || 0) / 60000)} dk</div><div class="label">Toplam Süre</div></div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Ödev</th><th>Level Aralığı</th><th>Süre</th><th>XP</th>
                </tr>
              </thead>
              <tbody>
                ${computeRows || "<tr><td colspan='4'>Veri yok.</td></tr>"}
              </tbody>
            </table>
          </div>
      </div>
    </body>
    </html>
  `;
}

function toDateOnly(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function getTaskDate(task) {
  if (task.createdAt && typeof task.createdAt.toDate === "function") {
    return task.createdAt.toDate();
  }
  if (task.createdAtDate) return task.createdAtDate;
  return new Date(0);
}

function chunkArray(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

function matchesContentForStudent(content) {
  if (!content) return false;
  const targetClass = content.targetClass || "";
  const targetSection = content.targetSection || "";
  if (!targetClass) return true;
  if (!userData) return true;
  const studentClass = userData.className || "";
  const studentSection = userData.section || "";
  if (!studentClass) return false;
  if (targetSection) {
    return targetClass === studentClass && targetSection === studentSection;
  }
  return targetClass === studentClass;
}

function buildContentProgressKey(contentId) {
  return `${contentId}_${currentUserId}`;
}

function buildBookTaskKey(taskId, userId) {
  return `${taskId}_${userId}`;
}

function isBookOnlyTask(task) {
  return (!task?.questions || task.questions.length === 0) && (task.bookId || task.bookName || task.bookTest);
}

function requiresTeacherApprovalTask(task) {
  return !task?.questions || task.questions.length === 0;
}

function getTaskRewardXP(task) {
  if (requiresTeacherApprovalTask(task)) return MANUAL_TASK_APPROVAL_XP;
  const questionCount = Array.isArray(task?.questions) ? task.questions.length : 0;
  return Math.max(0, questionCount * MAX_QUESTION_XP);
}

async function getBookTaskProgress(taskId, userId) {
  const ref = doc(db, "bookTaskProgress", buildBookTaskKey(taskId, userId));
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

async function saveBookTaskProgress(task, status) {
  if (!currentUserId || !task?.id) return;
  const ref = doc(db, "bookTaskProgress", buildBookTaskKey(task.id, currentUserId));
  const payload = {
    taskId: task.id,
    userId: currentUserId,
    status,
    approved: false,
    bookName: task.bookName || "",
    bookTest: task.bookTest || "",
    updatedAt: serverTimestamp()
  };
  await setDoc(ref, payload, { merge: true });
}

async function applyManualTaskApprovals(taskId, approvalRows = []) {
  const task = allTasks.find((t) => String(t.id) === String(taskId));
  if (!task) throw new Error("Ödev bulunamadı.");
  let approvedNowCount = 0;
  let xpGrantedCount = 0;
  let revokedCount = 0;

  for (const row of approvalRows) {
    const userId = String(row?.userId || "");
    const approved = !!row?.approved;
    if (!userId) continue;
    const ref = doc(db, "bookTaskProgress", buildBookTaskKey(taskId, userId));
    const snap = await getDoc(ref);
    const prev = snap.exists() ? (snap.data() || {}) : {};
    const prevApproved = !!prev.approved;
    const alreadyGranted = !!prev.manualApprovalXpGranted;

    const updatePayload = {
      taskId,
      userId,
      approved,
      approvedAt: approved ? serverTimestamp() : null
    };

    if (approved && !alreadyGranted) {
      updatePayload.manualApprovalXpGranted = true;
      updatePayload.manualApprovalXpGrantedAt = serverTimestamp();
    }

    await setDoc(ref, updatePayload, { merge: true });

    if (approved && !prevApproved) approvedNowCount++;
    if (!approved && prevApproved) revokedCount++;

    if (approved && !alreadyGranted) {
      try {
        await updateDoc(doc(db, "users", userId), {
          xp: increment(MANUAL_TASK_APPROVAL_XP),
          updatedAt: serverTimestamp()
        });
      } catch {
        await setDoc(doc(db, "users", userId), {
          xp: increment(MANUAL_TASK_APPROVAL_XP),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      xpGrantedCount++;
    }
  }

  return { approvedNowCount, revokedCount, xpGrantedCount };
}

function getContentProgress(content) {
  const total = (content.items || []).length;
  const progress = contentProgressMap.get(content.id);
  const completed = progress?.completedItemIds?.length || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalXP = progress?.totalXP || 0;
  return { total, completed, percent, totalXP };
}

function loadContents() {
  const list = document.getElementById("content-list");
  if (!list) return;
  list.innerHTML = "<div class='loading'>Yükleniyor...</div>";
  const newBtn = document.getElementById("btn-new-content");
  if (newBtn) newBtn.style.display = userRole === "teacher" ? "block" : "none";

  if (contentUnsub) contentUnsub();
  if (progressUnsub) progressUnsub();

  let q;
  if (userRole === "teacher") {
    q = query(collection(db, "contents"), where("userId", "==", currentUserId));
  } else {
    q = query(collection(db, "contents"));
  }

  contentUnsub = onSnapshot(q, (snap) => {
    allContents = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      allContents.push({
        id: docSnap.id,
        ...data,
        createdAtDate: data.createdAt && typeof data.createdAt.toDate === "function" ? data.createdAt.toDate() : new Date(0)
      });
    });
    allContents.sort((a, b) => b.createdAtDate - a.createdAtDate);
    renderContentList();
  });

  if (userRole === "student") {
    startContentProgressListener();
  }
}

function loadContentAssignments() {
  if (assignmentUnsub) assignmentUnsub();
  const q = query(collection(db, "contentAssignments"));
  assignmentUnsub = onSnapshot(q, (snap) => {
    contentAssignments = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (userRole === "teacher" && !recordBelongsToCurrentTeacher(data)) return;
      contentAssignments.push({
        id: docSnap.id,
        ...data,
        createdAtDate: data.createdAt && typeof data.createdAt.toDate === "function" ? data.createdAt.toDate() : new Date(0)
      });
    });
    contentAssignments.sort((a, b) => b.createdAtDate - a.createdAtDate);
    updateActivityLists();
    if (myStatsModal && myStatsModal.style.display === "flex") {
      loadMyStatsModal();
    }
  });
}

async function ensureStudentsCache() {
  if (Array.isArray(allStudents) && allStudents.length) return allStudents;
  try {
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    allStudents = userRole === "teacher"
      ? getUniqueStudents(getTeacherManagedStudents(rows))
      : rows;
  } catch (e) {
    console.warn("ensureStudentsCache", e);
  }
  return allStudents;
}

function loadBlockAssignments() {
  if (blockAssignmentsUnsub) blockAssignmentsUnsub();
  if (blockTeacherProgressUnsub) blockTeacherProgressUnsub();
  const mapRows = (snap) => snap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAtDate: data.createdAt && typeof data.createdAt.toDate === "function" ? data.createdAt.toDate() : new Date(0)
    };
  }).sort((a, b) => b.createdAtDate - a.createdAtDate);
  if (userRole === "teacher") {
    const qAll = query(collection(db, "blockAssignments"));
    blockAssignmentsUnsub = onSnapshot(qAll, async (snap) => {
      blockAssignments = mapRows(snap).filter((row) => recordBelongsToCurrentTeacher(row));
      await ensureStudentsCache();
      renderBlockHomeworkList();
    });
    blockTeacherProgressUnsub = onSnapshot(collection(db, "blockAssignmentProgress"), (snap) => {
      blockTeacherCompletedCountMap.clear();
      snap.forEach((d) => {
        const v = d.data() || {};
        if (!v.assignmentId) return;
        const assignment = blockAssignments.find((a) => String(a.id) === String(v.assignmentId));
        if (!assignment || !recordBelongsToCurrentTeacher(assignment)) return;
        const isDone = !!v.completed || Number(v.percent || 0) > 0 || Number(v.completedLevels || 0) > 0;
        if (!isDone) return;
        const key = String(v.assignmentId);
        blockTeacherCompletedCountMap.set(key, (blockTeacherCompletedCountMap.get(key) || 0) + 1);
      });
      renderBlockHomeworkList();
    });
  } else {
    const qAll = query(collection(db, "blockAssignments"));
    blockAssignmentsUnsub = onSnapshot(qAll, async (snap) => {
      blockAssignments = mapRows(snap);
      renderBlockHomeworkList();
    });
  }

  if (userRole === "student") {
    if (blockAssignmentProgressUnsub) blockAssignmentProgressUnsub();
    const pq = query(collection(db, "blockAssignmentProgress"), where("userId", "==", currentUserId));
    blockAssignmentProgressUnsub = onSnapshot(pq, (snap) => {
      blockAssignmentProgressMap.clear();
      snap.forEach((d) => {
        const v = d.data();
        if (v?.assignmentId) blockAssignmentProgressMap.set(String(v.assignmentId), v);
      });
      renderBlockHomeworkList();
      updateUserXPDisplay();
    });
  }
}

function blockAssignmentMatchesStudent(assignment) {
  const ownerTeacherId = userData?.ownerTeacherId || userData?.createdBy || "";
  if (ownerTeacherId && assignment?.userId && String(assignment.userId) !== String(ownerTeacherId)) return false;
  const targetClass = assignment?.targetClass || "";
  const targetSection = assignment?.targetSection || "";
  if (!targetClass) return true;
  const studentClass = userData?.className || "";
  const studentSection = userData?.section || "";
  if (!studentClass) return false;
  if (targetSection) return targetClass === studentClass && targetSection === studentSection;
  return targetClass === studentClass;
}

function renderBlockHomeworkList() {
  const pendingList = document.getElementById("list-block-homework-pending");
  const completedList = document.getElementById("list-block-homework-completed");
  const noPending = document.getElementById("no-block-homework-pending");
  const noCompleted = document.getElementById("no-block-homework-completed");
  if (!pendingList || !completedList) return;

  pendingList.innerHTML = "";
  completedList.innerHTML = "";
  let items = blockAssignments.slice();
  if (userRole === "student") {
    items = items.filter(blockAssignmentMatchesStudent);
  } else {
    items = items.filter(matchesBlockHomeworkFilter);
    items = items.filter(matchesTeacherBlockAssignType);
  }
  let pendingCount = 0;
  let completedCount = 0;
  const pendingRows = [];
  const completedRows = [];
  const now = new Date();

  items.forEach((a) => {
    const li = document.createElement("li");
    li.className = "list-item";
    const assignmentType = getBlockHomeworkType(a.assignmentType);
    const isBlock3D = assignmentType === "block3d";
    const isFlowchart = assignmentType === "flowchart";
    const appLabel = isFlowchart ? "Flowchart" : (isBlock3D ? "3D Blok Kodlama" : "Blok Kodlama");
    const appBadge = isFlowchart
      ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;background:#dcfce7;color:#166534;font-size:11px;font-weight:700;">Flowchart</span>`
      : isBlock3D
      ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;background:#ede9fe;color:#5b21b6;font-size:11px;font-weight:700;">3D</span>`
      : `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700;">2D</span>`;
    const deadlineDate = a.deadline ? new Date(`${a.deadline}T${a.deadlineTime || "23:59"}`) : null;
    const isExpired = deadlineDate && deadlineDate < now;
    if (isExpired) li.classList.add("expired");
    if (userRole === "teacher") {
      const assigned = allStudents.filter((s) => assignmentMatchesStudentFor(a, s)).length;
      const done = Number(blockTeacherCompletedCountMap.get(a.id) ?? a.completedCount ?? 0);
      const rangeText = isFlowchart ? "Soru" : `${Math.max(1, Number(a.levelStart || 1))}-${Math.max(1, Number(a.levelEnd || a.levelStart || 1))}`;
      li.innerHTML = `
        <div>
          <div style="font-weight:600;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">${a.title || `${appLabel} Ödevi`} ${appBadge}</div>
          <small style="color:#666;">📅 ${a.deadline || "-"} • ${isFlowchart ? "Flowchart" : `Seviye ${rangeText}`}</small>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="completion-badge">${Math.min(assigned, done)}/${assigned} tamamlama</span>
        </div>
      `;
      li.onclick = () => {
        if (isFlowchart) {
          editingFlowchartAssignmentId = String(a.id || "");
          editingFlowchartAssignmentData = { ...a };
          setFlowchartMode("teacher", null);
          setFlowAssignButtonLabel();
          const { modal } = getFlowchartEls();
          if (!modal) return;
          modal.style.display = "flex";
          loadFlowchartFromTemplate(a.flowTemplate || {});
          if (!flowNodes.length) {
            flowNodes = [
              { id: `f_${Date.now()}_${flowNodeSeq++}`, type: "start", text: "başla", x: 460, y: 120 },
              { id: `f_${Date.now()}_${flowNodeSeq++}`, type: "end", text: "dur", x: 460, y: 300 }
            ];
            flowEdges = [];
          }
          renderFlowchart();
          showNotice("Flowchart ödevi yüklendi. Şemayı düzenleyip 'Ödevi Güncelle' ile kaydedebilirsiniz.", "#4a90e2");
          return;
        }
        editingBlockHomeworkId = a.id;
        setBlockHomeworkModalType(assignmentType);
        const maxLevels = getAvailableBlockLevelCountByType(assignmentType);
        const startInput = document.getElementById("block-hw-level-start");
        const endInput = document.getElementById("block-hw-level-end");
        if (startInput) {
          startInput.max = String(maxLevels);
          startInput.value = String(Math.max(1, Math.min(maxLevels, Number(a.levelStart || 1))));
        }
        if (endInput) {
          endInput.max = String(maxLevels);
          endInput.value = String(Math.max(1, Math.min(maxLevels, Number(a.levelEnd || a.levelStart || 1))));
        }
        const titleInput = document.getElementById("block-hw-title");
        const classInput = document.getElementById("block-hw-class");
        const sectionInput = document.getElementById("block-hw-section");
        const deadlineInput = document.getElementById("block-hw-deadline");
        const deadlineTimeInput = document.getElementById("block-hw-deadline-time");
        const saveBtn = document.getElementById("btn-save-block-homework");
        const deleteBtn = document.getElementById("btn-delete-block-homework");
        if (titleInput) titleInput.value = a.title || "";
        if (classInput) classInput.value = a.targetClass || "";
        if (sectionInput) sectionInput.value = a.targetSection || "";
        if (deadlineInput) deadlineInput.value = a.deadline || "";
        if (deadlineTimeInput) deadlineTimeInput.value = a.deadlineTime || "23:59";
        if (saveBtn) saveBtn.innerText = "Güncelle";
        if (deleteBtn) deleteBtn.style.display = "inline-flex";
        const modal = document.getElementById("block-homework-modal");
        if (modal) modal.style.display = "flex";
      };
      pendingRows.push(li);
      pendingCount++;
    } else {
      const p = blockAssignmentProgressMap.get(a.id) || {};
      const percent = Number(p.percent || 0);
      const xp = Number(p.totalXP || 0);
      const isCompleted = !!p.completed;
      const rangeText = isFlowchart ? "Soru" : `${Math.max(1, Number(a.levelStart || 1))}-${Math.max(1, Number(a.levelEnd || a.levelStart || 1))}`;
      li.classList.toggle("completed", isCompleted);
      li.innerHTML = `
        <div>
          <div style="font-weight:600;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">${a.title || `${appLabel} Ödevi`} ${appBadge}</div>
          <small style="color:#666;">📅 ${a.deadline || "-"} • ${isFlowchart ? "Flowchart Soru" : `Seviye ${rangeText}`}</small>
          ${isFlowchart ? `<small style="color:#666;display:block;">🔀 ${a.flowQuestion || "Flowchart şemasını kur"}</small>` : ""}
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="completion-badge">%${percent}</span>
          <span class="completion-badge">${xp} XP</span>
        </div>
      `;
      li.onclick = () => {
        if (isCompleted) {
          showCompletionInfoPopup({
            category: appLabel,
            title: a.title || `${appLabel} Ödevi`,
            xp,
            seconds: Math.max(0, Number(p.lastSessionSeconds || 0)),
            percent,
            message: `Bu ${appLabel.toLowerCase()} ödevini tamamladınız.`
          });
          return;
        }
        if (isFlowchart) {
          openFlowchartAssignmentForStudent(a);
          return;
        }
        if (isBlock3D) {
          openBlock3DRunner({
            assignmentId: a.id,
            title: a.title || "3D Blok Kodlama Ödevi",
            levelStart: Math.max(1, Number(a.levelStart || 1)),
            levelEnd: Math.max(1, Number(a.levelEnd || a.levelStart || 1))
          });
        } else {
          openBlockRunner(currentUserId, {
            assignmentId: a.id,
            title: a.title || "Blok Kodlama Ödevi",
            levelStart: Math.max(1, Number(a.levelStart || 1)),
            levelEnd: Math.max(1, Number(a.levelEnd || a.levelStart || 1))
          });
        }
      };
      if (isCompleted) {
        completedRows.push(li);
        completedCount++;
      } else {
        pendingRows.push(li);
        pendingCount++;
      }
    }
  });

  renderLimitedRows(pendingList, pendingRows, 3);
  renderLimitedRows(completedList, completedRows, 3);
  if (noPending) noPending.style.display = pendingCount === 0 ? "block" : "none";
  if (noCompleted) noCompleted.style.display = completedCount === 0 ? "block" : "none";
  homeListCache.block = {
    title: userRole === "teacher" ? "Verilen Blok Kodlama Ödevleri" : "Blok Kodlama Ödevim",
    pending: pendingRows.slice(),
    completed: completedRows.slice()
  };
  updateBlockHomeworkShowMoreButton();
  const teacherCount = document.getElementById("teacher-block-homework-count");
  if (teacherCount && userRole === "teacher") teacherCount.innerText = items.length;
  if (userRole === "student") {
    const assignmentTypeById = new Map(
      items.map((a) => [String(a.id), getBlockHomeworkType(a.assignmentType)])
    );
    let block2DCompletedAssignmentTotal = 0;
    let block3DCompletedAssignmentTotal = 0;
    let flowchartCompletedTotal = 0;
    blockAssignmentProgressMap.forEach((p, assignmentId) => {
      const assignmentType = assignmentTypeById.get(String(assignmentId));
      if (!assignmentType) return;
      const completedLevels = Math.max(0, Number(p?.completedLevels || 0));
      const totalLevels = Math.max(0, Number(p?.totalLevels || 0));
      const percent = Math.max(0, Number(p?.percent || 0));
      const isCompleted = !!p?.completed || percent >= 100 || (totalLevels > 0 && completedLevels >= totalLevels);
      if (assignmentType === "flowchart") {
        if (isCompleted) flowchartCompletedTotal += 1;
        return;
      }
      if (assignmentType === "block3d") {
        if (isCompleted) block3DCompletedAssignmentTotal += 1;
        return;
      }
      if (isCompleted) block2DCompletedAssignmentTotal += 1;
    });
    const block2DEl = document.getElementById("stat-block-level-completed");
    if (block2DEl) block2DEl.innerText = String(block2DCompletedAssignmentTotal);
    const block3DEl = document.getElementById("stat-block3d-completed");
    if (block3DEl) block3DEl.innerText = String(block3DCompletedAssignmentTotal);
    const flowchartEl = document.getElementById("stat-flowchart-completed");
    if (flowchartEl) flowchartEl.innerText = String(flowchartCompletedTotal);
  }
  renderStudentCombinedSections();
  renderHomeOverviewStrip();
}

function computeAssignmentMatchesStudent(assignment) {
  const ownerTeacherId = userData?.ownerTeacherId || userData?.createdBy || "";
  if (ownerTeacherId && assignment?.userId && String(assignment.userId) !== String(ownerTeacherId)) return false;
  const targetClass = assignment?.targetClass || "";
  const targetSection = assignment?.targetSection || "";
  if (!targetClass) return true;
  const studentClass = userData?.className || "";
  const studentSection = userData?.section || "";
  if (!studentClass) return false;
  if (targetSection) return targetClass === studentClass && targetSection === studentSection;
  return targetClass === studentClass;
}

function isComputeProgressCompleted(progress, assignment = null) {
  const p = progress || {};
  const percent = Math.max(0, Number(p.percent || 0));
  const completedLevels = Math.max(0, Number(p.completedLevels || 0));
  const assignmentTotalLevels = assignment
    ? Math.max(1, Number(assignment.levelEnd || assignment.levelStart || 1) - Number(assignment.levelStart || 1) + 1)
    : 0;
  const totalLevels = Math.max(0, Number(p.totalLevels || 0), assignmentTotalLevels);
  const completedIds = Array.isArray(p.completedLevelIds)
    ? p.completedLevelIds.map((v) => Number(v)).filter((v) => Number.isFinite(v))
    : [];
  const completedByIds = Math.max(0, completedIds.length);
  const currentIndex = Math.max(0, Number(p.currentLevelIndex || 0));
  const completedCount = Math.max(completedLevels, completedByIds, currentIndex);
  return !!p.completed || percent >= 100 || (totalLevels > 0 && completedCount >= totalLevels);
}

function refreshStudentComputeCompletedStat() {
  let completedAppCount = 0;
  const studentAssignments = (computeAssignments || []).filter((a) => !a?.isDeleted && computeAssignmentMatchesStudent(a));
  studentAssignments.forEach((assignment) => {
    const p = computeAssignmentProgressMap.get(String(assignment.id)) || {};
    if (isComputeProgressCompleted(p, assignment)) completedAppCount += 1;
  });
  const el = document.getElementById("stat-compute-level-completed");
  if (el) el.innerText = String(completedAppCount);
}

function loadComputeAssignments() {
  if (computeAssignmentsUnsub) computeAssignmentsUnsub();
  if (computeTeacherProgressUnsub) computeTeacherProgressUnsub();
  if (computeStateUnsub) computeStateUnsub();
  computeStateUnsub = null;
  if (computeReportLevelsUnsub) computeReportLevelsUnsub();
  computeReportLevelsUnsub = null;
  if (userRole !== "student") {
    studentComputeStateCompletedLevels = 0;
    studentComputeReportCompletedLevels = 0;
  }
  const mapRows = (snap) => snap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAtDate: data.createdAt && typeof data.createdAt.toDate === "function" ? data.createdAt.toDate() : new Date(0)
    };
  }).sort((a, b) => b.createdAtDate - a.createdAtDate);
  if (userRole === "teacher") {
    const qAll = query(collection(db, "computeAssignments"));
    computeAssignmentsUnsub = onSnapshot(qAll, async (snap) => {
      computeAssignments = mapRows(snap).filter((row) => recordBelongsToCurrentTeacher(row));
      await ensureStudentsCache();
      renderComputeHomeworkList();
    });
    computeTeacherProgressUnsub = onSnapshot(collection(db, "computeAssignmentProgress"), (snap) => {
      computeTeacherCompletedCountMap.clear();
      snap.forEach((d) => {
        const v = d.data() || {};
        if (!v.assignmentId) return;
        const assignment = computeAssignments.find((a) => String(a.id) === String(v.assignmentId));
        if (!assignment || !recordBelongsToCurrentTeacher(assignment)) return;
        const isDone = !!v.completed || Number(v.percent || 0) > 0 || Number(v.completedLevels || 0) > 0;
        if (!isDone) return;
        const key = String(v.assignmentId);
        computeTeacherCompletedCountMap.set(key, (computeTeacherCompletedCountMap.get(key) || 0) + 1);
      });
      renderComputeHomeworkList();
    });
  } else {
    const qAll = query(collection(db, "computeAssignments"));
    computeAssignmentsUnsub = onSnapshot(qAll, async (snap) => {
      computeAssignments = mapRows(snap);
      renderComputeHomeworkList();
    });
  }

  if (userRole === "student") {
    if (computeAssignmentProgressUnsub) computeAssignmentProgressUnsub();
    const pq = query(collection(db, "computeAssignmentProgress"), where("userId", "==", currentUserId));
    computeAssignmentProgressUnsub = onSnapshot(pq, (snap) => {
      computeAssignmentProgressMap.clear();
      snap.forEach((d) => {
        const v = d.data();
        if (v?.assignmentId) computeAssignmentProgressMap.set(String(v.assignmentId), v);
      });
      renderComputeHomeworkList();
      updateUserXPDisplay();
    });
    computeStateUnsub = onSnapshot(doc(db, "computeStates", String(currentUserId || "")), (snap) => {
      let completedFromState = 0;
      const payload = snap.exists() ? (snap.data()?.payload || {}) : {};
      const levels = Array.isArray(payload?.levels) ? payload.levels : [];
      if (levels.length > 0) {
        completedFromState = levels.filter((l) => !!l?.completed).length;
      } else {
        completedFromState = Math.max(0, Number(payload?.currentLevelIndex || 0));
      }
      studentComputeStateCompletedLevels = Math.max(0, Number(completedFromState || 0));
      refreshStudentComputeCompletedStat();
    });
    computeReportLevelsUnsub = onSnapshot(
      collection(db, "computeReports", String(currentUserId || ""), "levelCompletions"),
      (snap) => {
        studentComputeReportCompletedLevels = Math.max(0, Number(snap?.size || 0));
        refreshStudentComputeCompletedStat();
      }
    );
  } else {
    if (computeAssignmentProgressUnsub) computeAssignmentProgressUnsub();
    computeAssignmentProgressUnsub = null;
  }
  syncRunnerSaveButtons();
}

function renderComputeHomeworkList() {
  const pendingList = document.getElementById("list-compute-homework-pending");
  const completedList = document.getElementById("list-compute-homework-completed");
  const noPending = document.getElementById("no-compute-homework-pending");
  const noCompleted = document.getElementById("no-compute-homework-completed");
  if (!pendingList || !completedList) return;

  pendingList.innerHTML = "";
  completedList.innerHTML = "";
  let items = computeAssignments.slice();
  if (userRole === "student") {
    items = items.filter(computeAssignmentMatchesStudent);
  } else {
    items = items.filter(matchesComputeHomeworkFilter);
  }
  let pendingCount = 0;
  let completedCount = 0;
  const pendingRows = [];
  const completedRows = [];
  const now = new Date();

  items.forEach((a) => {
    const li = document.createElement("li");
    li.className = "list-item";
    const deadlineDate = a.deadline ? new Date(`${a.deadline}T${a.deadlineTime || "23:59"}`) : null;
    const isExpired = deadlineDate && deadlineDate < now;
    if (isExpired) li.classList.add("expired");
    if (userRole === "teacher") {
      const assigned = allStudents.filter((s) => assignmentMatchesStudentFor(a, s)).length;
      const done = Number(computeTeacherCompletedCountMap.get(a.id) ?? a.completedCount ?? 0);
      const rangeText = `${Math.max(1, Number(a.levelStart || 1))}-${Math.max(1, Number(a.levelEnd || a.levelStart || 1))}`;
      li.innerHTML = `
        <div>
          <div style="font-weight:600;">${a.title || "Compute It Ödevi"}</div>
          <small style="color:#666;">📅 ${a.deadline || "-"} • Seviye ${rangeText}</small>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="completion-badge">${Math.min(assigned, done)}/${assigned} tamamlama</span>
        </div>
      `;
      li.onclick = () => openComputeHomeworkModalForEdit(a);
      pendingRows.push(li);
      pendingCount++;
    } else {
      const p = computeAssignmentProgressMap.get(a.id) || {};
      const percent = Number(p.percent || 0);
      const xp = Number(p.totalXP || 0);
      const isCompleted = isComputeProgressCompleted(p, a);
      const rangeText = `${Math.max(1, Number(a.levelStart || 1))}-${Math.max(1, Number(a.levelEnd || a.levelStart || 1))}`;
      li.classList.toggle("completed", isCompleted);
      li.innerHTML = `
        <div>
          <div style="font-weight:600;">${a.title || "Compute It Ödevi"}</div>
          <small style="color:#666;">📅 ${a.deadline || "-"} • Seviye ${rangeText}</small>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="completion-badge">%${percent}</span>
          <span class="completion-badge">${xp} XP</span>
        </div>
      `;
      li.onclick = () => {
        if (isCompleted) {
          showCompletionInfoPopup({
            category: "Compute It",
            title: a.title || "Compute It Ödevi",
            xp,
            seconds: Math.max(0, Number(p.lastSessionSeconds || 0)),
            percent,
            message: "Bu compute it ödevini tamamladınız."
          });
          return;
        }
        openComputeItRunner(currentUserId, {
          assignmentId: a.id,
          title: a.title || "Compute It Ödevi",
          levelStart: Math.max(1, Number(a.levelStart || 1)),
          levelEnd: Math.max(1, Number(a.levelEnd || a.levelStart || 1)),
          completedLevelIds: Array.isArray(p.completedLevelIds) ? p.completedLevelIds : []
        });
      };
      if (isCompleted) {
        completedRows.push(li);
        completedCount++;
      } else {
        pendingRows.push(li);
        pendingCount++;
      }
    }
  });

  renderLimitedRows(pendingList, pendingRows, 3);
  renderLimitedRows(completedList, completedRows, 3);
  if (noPending) noPending.style.display = pendingCount === 0 ? "block" : "none";
  if (noCompleted) noCompleted.style.display = completedCount === 0 ? "block" : "none";
  homeListCache.compute = {
    title: userRole === "teacher" ? "Verilen Compute It Ödevleri" : "Compute It Ödevim",
    pending: pendingRows.slice(),
    completed: completedRows.slice()
  };
  setShowMoreButton(
    "btn-show-all-compute-homework",
    pendingRows.length > 3 || completedRows.length > 3,
    () => openAllItemsModal(homeListCache.compute.title, homeListCache.compute.pending, homeListCache.compute.completed)
  );
  const teacherCount = document.getElementById("teacher-compute-homework-count");
  if (teacherCount && userRole === "teacher") teacherCount.innerText = items.length;
  if (userRole === "student") {
    refreshStudentComputeCompletedStat();
  }
  renderStudentCombinedSections();
  renderHomeOverviewStrip();
}

window.switchLessonTab = function(tabName) {
  document.querySelectorAll('#lessons-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase().includes(tabName === 'pending' ? 'bekleyen' : 'tamamlanan')) {
      btn.classList.add('active');
    }
  });
  const pending = document.getElementById('lessons-pending');
  const completed = document.getElementById('lessons-completed');
  if (pending) pending.classList.toggle('active', tabName === 'pending');
  if (completed) completed.classList.toggle('active', tabName === 'completed');
};

function lessonMatchesStudent(lesson) {
  if (lesson?.isPublished === false) return false;
  const ownerTeacherId = userData?.ownerTeacherId || userData?.createdBy || "";
  if (ownerTeacherId && lesson?.userId && String(lesson.userId) !== String(ownerTeacherId)) return false;
  const targetClass = lesson?.targetClass || "";
  const targetSection = lesson?.targetSection || "";
  if (!targetClass) return true;
  const studentClass = userData?.className || "";
  const studentSection = userData?.section || "";
  if (!studentClass) return false;
  if (targetSection) return targetClass === studentClass && targetSection === studentSection;
  return targetClass === studentClass;
}

async function publishLessonAssignment(lesson) {
  if (userRole !== "teacher" || !lesson?.id) return;
  const targetClass = String(lesson?.targetClass || "").trim();
  const targetSection = String(lesson?.targetSection || "").trim();
  const publishTargetClass = targetClass;
  const publishTargetSection = targetClass ? targetSection : "";
  try {
    await updateDoc(doc(db, "lessons", lesson.id), {
      isPublished: true,
      publishedAt: serverTimestamp(),
      targetClass: publishTargetClass,
      targetSection: publishTargetSection,
      userId: currentUserId,
      updatedAt: serverTimestamp()
    });
    const targetLabel = publishTargetClass
      ? `${publishTargetClass}${publishTargetSection ? "/" + publishTargetSection : ""}`
      : "Tüm Sınıflar";
    showNotice(`Ders ${targetLabel} için ödev olarak yayınlandı.`, "#2ecc71");
  } catch (e) {
    showNotice("Ders yayınlanamadı: " + e.message, "#e74c3c");
  }
}

function renderTeacherLessonsModalList() {
  const listEl = document.getElementById("teacher-lessons-modal-list");
  const emptyEl = document.getElementById("teacher-lessons-modal-empty");
  const metaEl = document.getElementById("teacher-lessons-modal-meta");
  if (!listEl) return;
  listEl.innerHTML = "";

  let items = (Array.isArray(lessons) ? lessons : []).filter((l) => !l?.isDeleted);
  if (currentTeacherLessonListFilter === "draft") {
    items = items.filter((l) => l?.isPublished === false);
  } else if (currentTeacherLessonListFilter === "published") {
    items = items.filter((l) => l?.isPublished !== false);
  }

  if (metaEl) {
    const draftCount = items.filter((l) => l?.isPublished === false).length;
    const publishedCount = items.filter((l) => l?.isPublished !== false).length;
    metaEl.innerText = `Toplam: ${items.length} • Taslak: ${draftCount} • Yayında: ${publishedCount}`;
  }

  if (!items.length) {
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }
  if (emptyEl) emptyEl.style.display = "none";

  items.forEach((lesson) => {
    const li = document.createElement("li");
    li.className = "list-item";
    const slides = Array.isArray(lesson.slides) ? lesson.slides : [];
    const isPublished = lesson.isPublished !== false;
    const assigned = allStudents.filter((s) => assignmentMatchesStudentFor(lesson, s)).length;
    let done = 0;
    lessonProgressMap.forEach((p) => {
      if (String(p.lessonId) !== String(lesson.id)) return;
      const isDone = !!p.completed || Number(p.percent || 0) >= 100;
      if (isDone) done++;
    });
    li.innerHTML = `
      <div>
        <div style="font-weight:700;">${lesson.title || "Ders"}</div>
        <small style="color:#64748b;">📄 ${slides.length} slide • Hedef: ${lesson.targetClass || "Seçilmedi"}${lesson.targetSection ? "/" + lesson.targetSection : ""}</small>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
        <span class="completion-badge" style="background:${isPublished ? "#dcfce7" : "#fff7ed"};color:${isPublished ? "#166534" : "#9a3412"};border-color:${isPublished ? "#86efac" : "#fdba74"};">${isPublished ? "Yayında" : "Taslak"}</span>
        <span class="completion-badge">${done}/${assigned} tamamlama</span>
        ${!isPublished ? `<button type="button" class="btn btn-primary btn-lesson-publish" style="padding:6px 10px;">Ödev Olarak Ver</button>` : ""}
        <button type="button" class="btn" style="padding:6px 10px;background:#e2e8f0;" data-edit="1">Düzenle</button>
      </div>
    `;
    li.querySelector('[data-edit="1"]')?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      openLessonBuilderModal(lesson);
    });
    li.querySelector(".btn-lesson-publish")?.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      await publishLessonAssignment(lesson);
    });
    li.addEventListener("click", () => openLessonBuilderModal(lesson));
    listEl.appendChild(li);
  });
}

function loadLessons() {
  if (lessonsUnsub) lessonsUnsub();
  if (lessonProgressUnsub) lessonProgressUnsub();
  lessonProgressMap.clear();
  const q = query(collection(db, "lessons"));
  lessonsUnsub = onSnapshot(q, async (snap) => {
    const lessonBelongsToCurrentTeacher = (row = {}) => {
      if (userRole !== "teacher") return true;
      const ownerCandidates = [
        row?.ownerTeacherId,
        row?.createdBy,
        row?.teacherId,
        row?.ownerId,
        row?.teacherEmail,
        row?.ownerEmail,
        row?.userId // lessons koleksiyonunda öğretmen sahibi çoğunlukla userId içinde tutuluyor
      ];
      return ownerCandidates.some((v) => valueMatchesCurrentTeacher(v));
    };
    lessons = snap.docs.map((d) => {
      const data = d.data() || {};
      return {
        id: d.id,
        ...data,
        createdAtDate: data.createdAt && typeof data.createdAt.toDate === "function" ? data.createdAt.toDate() : new Date(0)
      };
    }).filter((row) => userRole !== "teacher" || lessonBelongsToCurrentTeacher(row))
      .sort((a, b) => b.createdAtDate - a.createdAtDate);
    if (userRole === "teacher") await ensureStudentsCache();
    renderLessonsList();
  });

  const pq = userRole === "student"
    ? query(collection(db, "lessonProgress"), where("userId", "==", currentUserId))
    : collection(db, "lessonProgress");
  lessonProgressUnsub = onSnapshot(pq, (snap) => {
    lessonProgressMap.clear();
    snap.forEach((d) => {
      const v = d.data() || {};
      if (!v.lessonId) return;
      // öğrencide tek kayıt: lessonId -> progress
      if (userRole === "student") {
        lessonProgressMap.set(String(v.lessonId), v);
        return;
      }
      // öğretmende birden fazla öğrenci olacağı için benzersiz anahtar
      const key = `${String(v.lessonId)}__${String(v.userId || d.id)}`;
      lessonProgressMap.set(key, v);
    });
    renderLessonsList();
    if (userRole === "student") updateUserXPDisplay();
  });
}

function renderLessonsList() {
  const pendingList = document.getElementById("list-lessons-pending");
  const completedList = document.getElementById("list-lessons-completed");
  const noPending = document.getElementById("no-lessons-pending");
  const noCompleted = document.getElementById("no-lessons-completed");
  if (!pendingList || !completedList) return;
  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  let items = lessons.filter((l) => !l?.isDeleted);
  if (userRole === "student") items = items.filter(lessonMatchesStudent);
  const pendingRows = [];
  const completedRows = [];
  let pendingCount = 0;
  let completedCount = 0;

  items.forEach((lesson) => {
    const li = document.createElement("li");
    li.className = "list-item";
    const slides = Array.isArray(lesson.slides) ? lesson.slides : [];
    if (userRole === "teacher") {
      const isPublished = lesson.isPublished !== false;
      const assigned = allStudents.filter((s) => assignmentMatchesStudentFor(lesson, s)).length;
      let done = 0;
      lessonProgressMap.forEach((p) => {
        if (p.lessonId !== lesson.id) return;
        const isDone = !!p.completed || Number(p.percent || 0) >= 100;
        if (isDone) done++;
      });
      li.innerHTML = `
        <div>
          <div style="font-weight:600;">${lesson.title || "Ders"}</div>
          <small style="color:#666;">📄 ${slides.length} slide • Hedef: ${lesson.targetClass || "Seçilmedi"}${lesson.targetSection ? "/" + lesson.targetSection : ""}</small>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="completion-badge" style="background:${isPublished ? "#dcfce7" : "#fff7ed"};color:${isPublished ? "#166534" : "#9a3412"};border-color:${isPublished ? "#86efac" : "#fdba74"};">${isPublished ? "Yayında" : "Taslak"}</span>
          <span class="completion-badge">${done}/${assigned} tamamlama</span>
          ${!isPublished ? `<button type="button" class="btn btn-primary btn-lesson-publish" style="padding:6px 10px;">Ödev Olarak Ver</button>` : ""}
        </div>
      `;
      li.onclick = () => openLessonBuilderModal(lesson);
      const publishBtn = li.querySelector(".btn-lesson-publish");
      if (publishBtn) {
        publishBtn.onclick = async (ev) => {
          ev.stopPropagation();
          await publishLessonAssignment(lesson);
        };
      }
      const lessonCompleted = isPublished && assigned > 0 && done >= assigned;
      if (lessonCompleted) {
        completedRows.push(li);
        completedCount++;
      } else {
        pendingRows.push(li);
        pendingCount++;
      }
    } else {
      const prog = lessonProgressMap.get(lesson.id) || {};
      const percent = Number(prog.percent || 0);
      const xp = Number(prog.totalXP || 0);
      const isCompleted = !!prog.completed;
      li.classList.toggle("completed", isCompleted);
      li.innerHTML = `
        <div>
          <div style="font-weight:600;">${lesson.title || "Ders"}</div>
          <small style="color:#666;">📄 ${slides.length} slide</small>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="completion-badge">%${percent}</span>
          <span class="completion-badge">${xp} XP</span>
        </div>
      `;
      li.onclick = () => {
        if (isCompleted) {
          showCompletionInfoPopup({
            category: "Ders",
            title: lesson.title || "Ders",
            xp,
            seconds: 0,
            percent,
            message: "Bu dersi tamamladınız."
          });
          return;
        }
        openLessonPlayerModal(lesson);
      };
      if (isCompleted) {
        completedRows.push(li);
        completedCount++;
      } else {
        pendingRows.push(li);
        pendingCount++;
      }
    }
  });

  renderLimitedRows(pendingList, pendingRows, 3);
  renderLimitedRows(completedList, completedRows, 3);
  if (noPending) noPending.style.display = pendingCount === 0 ? "block" : "none";
  if (noCompleted) noCompleted.style.display = completedCount === 0 ? "block" : "none";
  homeListCache.lessons = {
    title: userRole === "teacher" ? "Dersler" : "Derslerim",
    pending: pendingRows.slice(),
    completed: completedRows.slice()
  };
  setShowMoreButton(
    "btn-show-all-lessons",
    pendingRows.length > 3 || completedRows.length > 3,
    () => openAllItemsModal(homeListCache.lessons.title, homeListCache.lessons.pending, homeListCache.lessons.completed)
  );
  const countEl = document.getElementById("teacher-lesson-count");
  if (countEl && userRole === "teacher") countEl.innerText = items.length;
  if (userRole === "student") {
    const lessonStatEl = document.getElementById("stat-lessons-completed");
    if (lessonStatEl) lessonStatEl.innerText = String(completedCount);
  }
  if (userRole === "teacher") {
    renderTeacherLessonsModalList();
    loadStatsPage();
  }
  renderStudentCombinedSections();
  renderHomeOverviewStrip();
}

function getLessonThemeById(themeId) {
  return LESSON_THEME_TEMPLATES.find((t) => t.id === themeId) || LESSON_THEME_TEMPLATES[0];
}

function getSlideThemeStyle(slide) {
  const fallback = LESSON_THEME_TEMPLATES[0];
  const t = getLessonThemeById(slide?.themeId || fallback.id);
  return { ...(t.style || {}), ...(slide?.theme || {}) };
}

function renderLessonThemePicker() {
  const grid = document.getElementById("lesson-theme-grid");
  if (!grid) return;
  const currentSlide = lessonDraft.slides[selectedLessonSlideIndex] || null;
  selectedLessonThemeId = currentSlide?.themeId || selectedLessonThemeId || LESSON_THEME_TEMPLATES[0].id;
  grid.innerHTML = LESSON_THEME_TEMPLATES.map((t) => `
    <button type="button" class="lesson-theme-item${t.id === selectedLessonThemeId ? " active" : ""}" data-theme-id="${t.id}">
      <div class="lesson-theme-name">${t.name}</div>
      <div class="lesson-theme-swatch">
        <span style="background:${t.colors[0]};"></span>
        <span style="background:${t.colors[1]};"></span>
        <span style="background:${t.colors[2]};"></span>
      </div>
    </button>
  `).join("");
  grid.querySelectorAll("[data-theme-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedLessonThemeId = btn.getAttribute("data-theme-id") || LESSON_THEME_TEMPLATES[0].id;
      if (selectedLessonSlideIndex >= 0 && lessonDraft.slides[selectedLessonSlideIndex]) {
        applyThemeToSlide(lessonDraft.slides[selectedLessonSlideIndex], selectedLessonThemeId);
        fillLessonSlideForm();
      } else {
        updateLessonSlidePreview();
      }
      renderLessonThemePicker();
    });
  });
}

function applyThemeToSlide(slide, themeId) {
  if (!slide) return slide;
  const theme = getLessonThemeById(themeId);
  slide.themeId = theme.id;
  slide.theme = { ...(theme.style || {}) };
  return slide;
}

function syncCurrentLessonSlideFromForm() {
  if (selectedLessonSlideIndex < 0) return;
  if (!Array.isArray(lessonDraft.slides) || !lessonDraft.slides[selectedLessonSlideIndex]) return;
  lessonDraft.slides[selectedLessonSlideIndex] = readLessonSlideForm();
}

function openLessonTextModal(options = {}) {
  const modal = document.getElementById("lesson-text-modal");
  const titleEl = document.getElementById("lesson-text-modal-title");
  const inputEl = document.getElementById("lesson-text-modal-input");
  if (!modal || !inputEl) return Promise.resolve(null);
  if (titleEl) titleEl.innerText = options.title || "Metin";
  inputEl.value = String(options.value || "");
  inputEl.placeholder = String(options.placeholder || "Metin girin");
  modal.style.display = "flex";
  setTimeout(() => inputEl.focus(), 30);
  return new Promise((resolve) => { lessonTextModalResolve = resolve; });
}

function closeLessonTextModal(result = null) {
  const modal = document.getElementById("lesson-text-modal");
  if (modal) modal.style.display = "none";
  if (lessonTextModalResolve) lessonTextModalResolve(result);
  lessonTextModalResolve = null;
}

function renderLessonSlideList() {
  const wrap = document.getElementById("lesson-slide-list");
  if (!wrap) return;
  wrap.innerHTML = "";
  lessonDraft.slides.forEach((s, i) => {
    const row = document.createElement("button");
    const typeLabel = s.type === "question" ? "Soru" : s.type === "mixed" ? "Karma" : "Konu";
    row.className = `lesson-frame-item${i === selectedLessonSlideIndex ? " active" : ""}`;
    row.innerHTML = `
      <div class="lesson-frame-title">${i + 1}. ${s.title || "Başlıksız Slide"}</div>
      <div class="lesson-frame-meta">${typeLabel} • ${s.layout || "text"}</div>
    `;
    row.onclick = () => {
      syncCurrentLessonSlideFromForm();
      selectedLessonSlideIndex = i;
      fillLessonSlideForm();
      renderLessonSlideList();
    };
    wrap.appendChild(row);
  });
}

function fillLessonSlideForm() {
  const s = lessonDraft.slides[selectedLessonSlideIndex];
  if (!s) {
    renderLessonThemePicker();
    return;
  }
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
  set("slide-title", s.title);
  set("slide-type", s.type || "content");
  const editor = document.getElementById("slide-content-editor");
  if (editor) editor.innerHTML = s.content || "";
  set("slide-image-url", s.imageUrl || "");
  set("slide-video-url", s.videoUrl || "");
  set("slide-layout", s.layout || "text");
  set("slide-question-type", s.questionType || "multiple");
  set("slide-question", s.question);
  set("slide-opt-1", s.options?.[0] || "");
  set("slide-opt-2", s.options?.[1] || "");
  set("slide-opt-3", s.options?.[2] || "");
  set("slide-opt-4", s.options?.[3] || "");
  set("slide-correct", s.correct || "");
  set("slide-fill-answers", Array.isArray(s.fillAnswers) ? s.fillAnswers.join(",") : "");
  lessonCanvasElements = Array.isArray(s.elements) ? JSON.parse(JSON.stringify(s.elements)) : [];
  selectedLessonCanvasElementId = null;
  selectedLessonThemeId = s.themeId || selectedLessonThemeId || LESSON_THEME_TEMPLATES[0].id;
  const qArea = document.getElementById("slide-question-area");
  if (qArea) qArea.style.display = (s.type === "question" || s.type === "mixed") ? "block" : "none";
  const cArea = document.getElementById("slide-content-area");
  if (cArea) cArea.style.display = "block";
  updateLessonQuestionTypeUI();
  renderLessonThemePicker();
  renderLessonCanvasEditor();
  updateLessonSlidePreview();
}

function readLessonSlideForm() {
  const get = (id) => (document.getElementById(id)?.value || "").trim();
  const type = get("slide-type") || "content";
  const editor = document.getElementById("slide-content-editor");
  return {
    id: lessonDraft.slides[selectedLessonSlideIndex]?.id || `s_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
    title: get("slide-title"),
    type,
    content: editor ? editor.innerHTML.trim() : "",
    imageUrl: get("slide-image-url"),
    videoUrl: get("slide-video-url"),
    layout: get("slide-layout") || "text",
    questionType: get("slide-question-type") || "multiple",
    question: get("slide-question"),
    options: [get("slide-opt-1"), get("slide-opt-2"), get("slide-opt-3"), get("slide-opt-4")].filter(Boolean),
    correct: get("slide-correct"),
    fillAnswers: get("slide-fill-answers").split(",").map((x) => x.trim()).filter(Boolean),
    elements: JSON.parse(JSON.stringify(lessonCanvasElements || [])),
    themeId: selectedLessonThemeId || LESSON_THEME_TEMPLATES[0].id,
    theme: { ...(getLessonThemeById(selectedLessonThemeId || LESSON_THEME_TEMPLATES[0].id).style || {}) }
  };
}

async function readFileAsDataURL(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("file-read-error"));
    reader.readAsDataURL(file);
  });
}

function renderLessonCanvasEditor() {
  const wrap = document.getElementById("slide-canvas-editor");
  const stage = document.getElementById("lesson-canvas-stage");
  const layout = document.getElementById("slide-layout")?.value || "text";
  if (!wrap || !stage) return;
  wrap.style.display = layout === "canvas" ? "block" : "none";
  stage.innerHTML = "";
  if (layout !== "canvas") return;
  stage.onclick = () => {
    selectedLessonCanvasElementId = null;
    renderLessonCanvasEditor();
  };
  lessonCanvasElements.forEach((el) => {
    const node = document.createElement("div");
    node.dataset.elid = el.id;
    node.style.cssText = `
      position:absolute;left:${Number(el.x || 10)}px;top:${Number(el.y || 10)}px;
      width:${Number(el.w || (el.type === "text" ? 220 : 180))}px;height:${Number(el.h || (el.type === "text" ? 90 : 120))}px;
      border:1px solid #cbd5e1;border-radius:8px;background:${el.type === "text" ? "rgba(255,255,255,.88)" : "#fff"};
      cursor:move;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);${selectedLessonCanvasElementId === el.id ? "outline:2px solid #2563eb;" : ""}`;
    if (el.type === "text") {
      node.innerHTML = `<div style="padding:8px;font-size:14px;">${el.text || "Metin"}</div>`;
    } else {
      node.innerHTML = `<img src="${el.src || ""}" alt="" style="width:100%;height:100%;object-fit:cover;">`;
    }
    node.addEventListener("mousedown", (ev) => {
      ev.stopPropagation();
      selectedLessonCanvasElementId = el.id;
      const rect = stage.getBoundingClientRect();
      lessonCanvasDrag = {
        id: el.id,
        offsetX: ev.clientX - rect.left - Number(el.x || 0),
        offsetY: ev.clientY - rect.top - Number(el.y || 0)
      };
    });
    node.addEventListener("click", (ev) => {
      ev.stopPropagation();
      selectedLessonCanvasElementId = el.id;
      renderLessonCanvasEditor();
    });
    node.addEventListener("dblclick", async (ev) => {
      ev.stopPropagation();
      if (el.type === "text") {
        const txt = await openLessonTextModal({ title: "Metni Düzenle", value: el.text || "", placeholder: "Metin girin" });
        if (txt !== null) el.text = txt;
      } else {
        const src = prompt("Görsel URL düzenle:", el.src || "");
        if (src !== null) el.src = src;
      }
      renderLessonCanvasEditor();
      updateLessonSlidePreview();
    });
    stage.appendChild(node);
  });
}

document.addEventListener("mousemove", (ev) => {
  if (!lessonCanvasDrag) return;
  const stage = document.getElementById("lesson-canvas-stage");
  if (!stage) return;
  const rect = stage.getBoundingClientRect();
  const item = lessonCanvasElements.find((x) => x.id === lessonCanvasDrag.id);
  if (!item) return;
  const maxX = rect.width - Number(item.w || 120);
  const maxY = rect.height - Number(item.h || 80);
  item.x = Math.max(0, Math.min(maxX, ev.clientX - rect.left - lessonCanvasDrag.offsetX));
  item.y = Math.max(0, Math.min(maxY, ev.clientY - rect.top - lessonCanvasDrag.offsetY));
  renderLessonCanvasEditor();
  updateLessonSlidePreview();
});

document.addEventListener("mouseup", () => {
  lessonCanvasDrag = null;
});

function updateLessonQuestionTypeUI() {
  const qType = (document.getElementById("slide-question-type")?.value || "multiple").trim();
  const opt3 = document.getElementById("slide-opt-3");
  const opt4 = document.getElementById("slide-opt-4");
  const opt1 = document.getElementById("slide-opt-1");
  const opt2 = document.getElementById("slide-opt-2");
  const correct = document.getElementById("slide-correct");
  const fillAnswers = document.getElementById("slide-fill-answers");
  if (fillAnswers) fillAnswers.style.display = "none";
  if (qType === "boolean") {
    if (opt1) opt1.value = "Doğru";
    if (opt2) opt2.value = "Yanlış";
    if (opt3) opt3.value = "";
    if (opt4) opt4.value = "";
    if (opt3) opt3.style.display = "none";
    if (opt4) opt4.style.display = "none";
    if (opt1) opt1.style.display = "block";
    if (opt2) opt2.style.display = "block";
    if (correct && !correct.value) correct.value = "doğru";
  } else if (qType === "short") {
    if (opt1) opt1.value = "";
    if (opt2) opt2.value = "";
    if (opt3) opt3.value = "";
    if (opt4) opt4.value = "";
    if (opt1) opt1.style.display = "none";
    if (opt2) opt2.style.display = "none";
    if (opt3) opt3.style.display = "none";
    if (opt4) opt4.style.display = "none";
    if (fillAnswers) fillAnswers.style.display = "none";
    if (correct) correct.style.display = "block";
  } else if (qType === "fill") {
    if (opt1) opt1.style.display = "none";
    if (opt2) opt2.style.display = "none";
    if (opt3) opt3.style.display = "none";
    if (opt4) opt4.style.display = "none";
    if (correct) correct.style.display = "none";
    if (fillAnswers) fillAnswers.style.display = "block";
  } else {
    if (opt1) opt1.style.display = "block";
    if (opt2) opt2.style.display = "block";
    if (opt3) opt3.style.display = "block";
    if (opt4) opt4.style.display = "block";
    if (correct) correct.style.display = "block";
  }
}

function updateLessonSlidePreview() {
  const box = document.getElementById("lesson-slide-preview");
  if (!box) return;
  const draft = readLessonSlideForm();
  const themeStyle = getSlideThemeStyle(draft);
  const cardBg = themeStyle.cardBg || "rgba(15,23,42,0.78)";
  const cardText = themeStyle.text || "#e2e8f0";
  const cardBorder = themeStyle.border || "rgba(148,163,184,0.4)";
  if ((draft.type || "content") === "question" || (draft.type || "content") === "mixed") {
    box.innerHTML = `
      <div style="font-weight:700;margin-bottom:6px;">Soru Önizleme</div>
      <div style="margin-bottom:6px;padding:8px;border-radius:8px;background:${cardBg};color:${cardText};border:1px solid ${cardBorder};">${draft.question || "-"}</div>
      <div style="font-size:12px;color:#475569;">Tür: ${draft.questionType || "multiple"}${draft.questionType === "fill" ? ` • Boşluk: ${(draft.fillAnswers || []).length}` : ` • Doğru: ${draft.correct || "-"}`}</div>
      ${(draft.type || "content") === "mixed" ? `<hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0;"><div>${draft.content || "<span style='color:#94a3b8;'>İçerik yok</span>"}</div>` : ""}
    `;
    return;
  }
  const html = draft.content || "<span style='color:#94a3b8;'>İçerik yok</span>";
  if (draft.layout === "canvas") {
    const blocks = Array.isArray(draft.elements) ? draft.elements : [];
    box.innerHTML = `
      <div style="font-weight:700;margin-bottom:6px;">Serbest Yerleşim</div>
      <div style="font-size:12px;color:#64748b;">Blok sayısı: ${blocks.length}</div>
      <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
        ${blocks.map((b, i) => `<span style="font-size:12px;background:#e2e8f0;border-radius:999px;padding:2px 8px;">${i+1}. ${b.type === "text" ? "Metin" : "Görsel"}</span>`).join("")}
      </div>
    `;
    return;
  }
  if (draft.layout === "cover" && draft.imageUrl) {
    box.innerHTML = `
      <div style="position:relative;min-height:140px;border-radius:8px;overflow:hidden;background:#111;">
        <img src="${draft.imageUrl}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.5;">
        <div style="position:relative;padding:12px;color:white;">${html}</div>
      </div>
    `;
    return;
  }
  if (draft.layout === "split" && draft.imageUrl) {
    box.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 180px;gap:10px;align-items:start;">
        <div>${html}</div>
        <img src="${draft.imageUrl}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:8px;">
      </div>
    `;
    return;
  }
  box.innerHTML = `<div style="padding:8px;border-radius:8px;background:${cardBg};color:${cardText};border:1px solid ${cardBorder};">${draft.videoUrl ? `<div style="font-size:12px;color:#93c5fd;margin-bottom:6px;">🎬 Video eklendi</div>` : ""}${html}</div>`;
}

function openLessonBuilderModal(lesson = null) {
  if (userRole !== "teacher") return;
  const teacherLessonsModal = document.getElementById("teacher-lessons-modal");
  if (teacherLessonsModal) teacherLessonsModal.style.display = "none";
  editingLessonId = lesson?.id || null;
  editingLessonIsPublished = lesson ? (lesson.isPublished !== false) : false;
  lessonDraft = {
    title: lesson?.title || "",
    description: lesson?.description || "",
    targetClass: lesson?.targetClass || "",
    targetSection: lesson?.targetSection || "",
    bgImage: lesson?.bgImage || "",
    slides: Array.isArray(lesson?.slides) ? JSON.parse(JSON.stringify(lesson.slides)) : []
  };
  selectedLessonSlideIndex = lessonDraft.slides.length ? 0 : -1;
  lessonCanvasElements = [];
  selectedLessonCanvasElementId = null;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
  set("lesson-title", lessonDraft.title);
  set("lesson-desc", lessonDraft.description);
  set("lesson-class", lessonDraft.targetClass);
  set("lesson-section", lessonDraft.targetSection);
  set("lesson-bg", lessonDraft.bgImage);
  if (Array.isArray(lessonDraft.slides) && lessonDraft.slides.length) {
    lessonDraft.slides = lessonDraft.slides.map((slide) => {
      if (slide?.themeId) return slide;
      return applyThemeToSlide(slide, LESSON_THEME_TEMPLATES[0].id);
    });
  }
  selectedLessonThemeId = lessonDraft.slides[selectedLessonSlideIndex]?.themeId || LESSON_THEME_TEMPLATES[0].id;
  renderLessonThemePicker();
  renderLessonSlideList();
  fillLessonSlideForm();
  updateLessonSlidePreview();
  const delLessonBtn = document.getElementById("btn-delete-lesson");
  if (delLessonBtn) delLessonBtn.style.display = editingLessonId ? "inline-block" : "none";
  const modal = document.getElementById("lesson-builder-modal");
  if (modal) modal.style.display = "flex";
}

function closeLessonBuilderModal() {
  const modal = document.getElementById("lesson-builder-modal");
  if (modal) modal.style.display = "none";
}

function openLessonPlayerModal(lesson) {
  lessonPlayerState = {
    lesson,
    index: 0,
    visited: new Set(),
    answered: {},
    correctCount: 0
  };
  const saved = lessonProgressMap.get(lesson.id);
  if (saved) {
    lessonPlayerState.index = Math.max(0, Number(saved.currentSlideIndex || 0));
    lessonPlayerState.visited = new Set(Array.isArray(saved.visitedSlides) ? saved.visitedSlides : []);
    lessonPlayerState.answered = saved.answers || {};
    lessonPlayerState.correctCount = Number(saved.correctCount || 0);
  }
  const modal = document.getElementById("lesson-player-modal");
  if (modal) modal.style.display = "flex";
  renderLessonPlayer();
}

function renderLessonPlayer() {
  const st = lessonPlayerState;
  if (!st) return;
  const lesson = st.lesson;
  const slides = Array.isArray(lesson.slides) ? lesson.slides : [];
  const nav = document.getElementById("lesson-player-nav");
  const stage = document.getElementById("lesson-player-stage");
  const titleEl = document.getElementById("lesson-player-title");
  if (titleEl) titleEl.innerText = lesson.title || "Ders";
  if (nav) {
    nav.innerHTML = "";
    slides.forEach((s, i) => {
      const b = document.createElement("button");
      b.className = "btn";
      b.style.cssText = `width:100%;text-align:left;margin-bottom:6px;background:${i === st.index ? "#dbeafe" : "#f8fafc"};border:1px solid #e5e7eb;`;
      const done = st.visited.has(i) ? "✅ " : "";
      b.innerText = `${done}${i + 1}. ${s.title || "Slide"}`;
      b.onclick = () => {
        st.index = i;
        renderLessonPlayer();
        persistLessonProgress(false);
      };
      nav.appendChild(b);
    });
  }
  const cur = slides[st.index];
  if (!cur || !stage) return;
  st.visited.add(st.index);
  const slideAnswerKey = cur.id || `slide_${st.index}`;
  stage.style.backgroundImage = lesson.bgImage ? `url('${lesson.bgImage}')` : "none";
  stage.style.backgroundSize = "cover";
  stage.style.backgroundPosition = "center";
  const hasQuestion = cur.type === "question" || cur.type === "mixed";
  const hasContent = cur.type !== "question";
  const themeStyle = getSlideThemeStyle(cur);
  const cardBg = themeStyle.cardBg || "rgba(15,23,42,0.78)";
  const cardText = themeStyle.text || "#e2e8f0";
  const cardBorder = themeStyle.border || "rgba(148,163,184,0.4)";
  const contentHtml = cur.content || "";
  const img = cur.imageUrl ? `<img src="${cur.imageUrl}" alt="" style="width:100%;max-height:340px;object-fit:cover;border-radius:10px;">` : "";
  const videoHtml = cur.videoUrl
    ? (/youtube\.com|youtu\.be/.test(String(cur.videoUrl).toLowerCase())
      ? `<iframe src="${String(cur.videoUrl).replace("watch?v=", "embed/")}" style="width:100%;height:280px;border:0;border-radius:10px;" allowfullscreen></iframe>`
      : `<video controls style="width:100%;max-height:280px;border-radius:10px;"><source src="${cur.videoUrl}"></video>`)
    : "";
  let contentBlock = "";
  if (hasContent) {
    let bodyHtml = "";
    if (cur.layout === "canvas") {
      const blocks = Array.isArray(cur.elements) ? cur.elements : [];
      bodyHtml = `
        <div style="position:relative;min-height:360px;border-radius:12px;overflow:hidden;background:rgba(255,255,255,.86);">
          ${blocks.map((b) => {
            const x = Number(b.x || 0);
            const y = Number(b.y || 0);
            const w = Number(b.w || (b.type === "text" ? 220 : 180));
            const h = Number(b.h || (b.type === "text" ? 90 : 120));
            if (b.type === "image") {
              return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:8px;overflow:hidden;"><img src="${b.src || ""}" style="width:100%;height:100%;object-fit:cover;"></div>`;
            }
            return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;min-height:${h}px;border-radius:8px;background:rgba(255,255,255,.9);padding:8px;">${b.text || ""}</div>`;
          }).join("")}
        </div>
      `;
    } else if (cur.layout === "cover" && cur.imageUrl) {
      bodyHtml = `
        <div style="position:relative;min-height:360px;border-radius:12px;overflow:hidden;background:#111;">
          <img src="${cur.imageUrl}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.45;">
          <div style="position:relative;padding:18px;color:#fff;background:linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.15));">${videoHtml}${contentHtml}</div>
        </div>
      `;
    } else if (cur.layout === "split" && cur.imageUrl) {
      bodyHtml = `
        <div style="display:grid;grid-template-columns:1fr minmax(240px,38%);gap:14px;align-items:start;">
          <div>${videoHtml}${contentHtml}</div>
          <div>${img}</div>
        </div>
      `;
    } else {
      bodyHtml = `<div>${videoHtml}${contentHtml}</div>`;
    }
    contentBlock = `
      <div style="background:${cardBg};color:${cardText};border:1px solid ${cardBorder};backdrop-filter: blur(3px);padding:14px;border-radius:10px;">
        <h3 style="margin-top:0;">${cur.title || "Konu"}</h3>
        ${bodyHtml}
      </div>
    `;
  }
  let questionBlock = "";
  if (hasQuestion) {
    const selected = st.answered[slideAnswerKey];
    const qType = cur.questionType || "multiple";
    const hasAnswered = (qType === "fill")
      ? (Array.isArray(selected) && selected.some((v) => String(v || "").trim().length > 0))
      : (typeof selected === "string"
        ? String(selected).trim().length > 0
        : !!selected);
    const answeredCorrect = hasAnswered ? isLessonAnswerCorrect(cur, selected) : null;
    const optSource = qType === "boolean" ? ["Doğru", "Yanlış"] : (cur.options || []);
    const fillCount = Array.isArray(cur.fillAnswers) ? cur.fillAnswers.length : 0;
    const isOptionCorrect = (key, optionText, idx) => {
      const normalizedCorrect = String(cur?.correct || "").trim().toLowerCase();
      if (qType === "boolean") return normalizedCorrect === String(key || "").trim().toLowerCase();
      if (qType !== "multiple") return false;
      const letter = (["a", "b", "c", "d"][idx] || String(idx + 1)).toLowerCase();
      if (normalizedCorrect === letter) return true;
      const optText = String(optionText || "").trim().toLowerCase();
      return !!optText && normalizedCorrect === optText;
    };
    const opts = qType === "short"
      ? `<input id="lesson-short-answer" class="form-control" value="${typeof selected === "string" ? selected : ""}" placeholder="Cevabınızı yazın">`
      : qType === "fill"
        ? Array.from({ length: Math.max(1, fillCount) }).map((_, i) => {
            const val = Array.isArray(selected) ? (selected[i] || "") : "";
            return `<input class="form-control lesson-fill-input" data-fill-index="${i}" value="${val}" placeholder="Boşluk ${i + 1}">`;
          }).join("")
        : optSource.map((o, idx) => {
            const letter = ["A", "B", "C", "D"][idx] || `${idx + 1}`;
            const key = qType === "boolean" ? String(o).toLowerCase() : letter;
            const chosen = selected === key;
            const optionIsCorrect = isOptionCorrect(key, o, idx);
            let style = "background:#fff;border:1px solid #e5e7eb;color:#0f172a;";
            if (chosen && hasAnswered) {
              style = answeredCorrect
                ? "background:#dcfce7;border:1px solid #22c55e;color:#166534;font-weight:700;"
                : "background:#fee2e2;border:1px solid #ef4444;color:#991b1b;font-weight:700;";
            } else if (hasAnswered && !answeredCorrect && optionIsCorrect) {
              style = "background:#ecfccb;border:1px solid #84cc16;color:#365314;";
            } else if (chosen) {
              style = "background:#dbeafe;border:1px solid #3b82f6;color:#1e3a8a;";
            }
            return `<button class="btn" data-opt="${key}" style="width:100%;text-align:left;margin-bottom:6px;${style}">${qType === "boolean" ? o : `${letter}) ${o}`}</button>`;
          }).join("");
    const saveBtn = (qType === "short" || qType === "fill")
      ? '<button id="btn-save-question-answer" class="btn btn-primary" style="margin-top:8px;">Cevabı Kaydet</button>'
      : "";
    const statusHtml = hasAnswered
      ? `<div style="margin-top:8px;font-size:12px;font-weight:700;color:${answeredCorrect ? "#22c55e" : "#ef4444"};">${answeredCorrect ? "✅ Doğru cevap" : "❌ Yanlış cevap"}</div>`
      : "";
    questionBlock = `
      <div style="background:${cardBg};color:${cardText};padding:14px;border-radius:10px;border:1px solid ${cardBorder};margin-top:${hasContent ? "10px" : "0"};">
        <h3 style="margin-top:0;">${hasContent ? "Soru" : (cur.title || "Soru")}</h3>
        <p>${cur.question || ""}</p>
        ${opts}
        ${saveBtn}
        ${statusHtml}
      </div>
    `;
  }
  stage.innerHTML = `${contentBlock}${questionBlock || ""}`;
  stage.querySelectorAll("[data-opt]").forEach((btn) => {
    btn.onclick = () => {
      const choice = btn.getAttribute("data-opt");
      st.answered[slideAnswerKey] = choice;
      const ok = isLessonAnswerCorrect(cur, choice);
      showNotice(ok ? "Doğru cevap kaydedildi." : "Cevap kaydedildi.", ok ? "#2ecc71" : "#4a90e2");
      renderLessonPlayer();
      persistLessonProgress(false);
    };
  });
  const saveQaBtn = document.getElementById("btn-save-question-answer");
  if (saveQaBtn) {
    saveQaBtn.onclick = () => {
      const qType = cur.questionType || "multiple";
      if (qType === "fill") {
        const arr = Array.from(stage.querySelectorAll(".lesson-fill-input")).map((el) => (el.value || "").trim());
        st.answered[slideAnswerKey] = arr;
        const ok = isLessonAnswerCorrect(cur, arr);
        showNotice(ok ? "Boşluk cevapları doğru." : "Boşluk cevapları kaydedildi.", ok ? "#2ecc71" : "#4a90e2");
      } else {
        const input = document.getElementById("lesson-short-answer");
        const txt = (input?.value || "").trim();
        st.answered[slideAnswerKey] = txt;
        const ok = isLessonAnswerCorrect(cur, txt);
        showNotice(ok ? "Doğru cevap kaydedildi." : "Cevap kaydedildi.", ok ? "#2ecc71" : "#4a90e2");
      }
      renderLessonPlayer();
      persistLessonProgress(false);
    };
  }
  const counterEl = document.getElementById("lesson-player-counter");
  if (counterEl) counterEl.innerText = `${Math.min(slides.length, st.index + 1)} / ${Math.max(1, slides.length)}`;
  const trackEl = document.getElementById("lesson-player-track");
  if (trackEl) {
    trackEl.innerHTML = slides.map((_, i) => {
      const done = st.visited.has(i);
      const active = i === st.index;
      return `<span style="display:inline-block;width:26px;height:6px;border-radius:999px;background:${active ? "#3b82f6" : done ? "#93c5fd" : "#d1d5db"};"></span>`;
    }).join("");
  }
  const nextBtn = document.getElementById("btn-lesson-next");
  if (nextBtn) nextBtn.innerText = st.index >= (slides.length - 1) ? "Bitir" : "Sonraki";
  updateLessonProgressBar();
}

function isLessonAnswerCorrect(slide, answer) {
  const qType = slide?.questionType || "multiple";
  if (qType === "multiple") {
    const normalizedAnswer = String(answer || "").trim().toLowerCase();
    const normalizedCorrect = String(slide?.correct || "").trim().toLowerCase();
    if (normalizedAnswer && normalizedAnswer === normalizedCorrect) return true;
    const options = Array.isArray(slide?.options) ? slide.options : [];
    const letters = ["a", "b", "c", "d"];
    const idx = letters.indexOf(normalizedCorrect);
    if (idx >= 0) {
      const optText = String(options[idx] || "").trim().toLowerCase();
      return normalizedAnswer === letters[idx] || (optText && normalizedAnswer === optText);
    }
    return false;
  }
  if (qType === "boolean") {
    return String(answer || "").trim().toLowerCase() === String(slide?.correct || "").trim().toLowerCase();
  }
  if (qType === "short") {
    const expectedRaw = String(slide?.correct || "").trim().toLowerCase();
    const given = String(answer || "").trim().toLowerCase();
    if (!expectedRaw) return false;
    if (expectedRaw.includes(",")) {
      return expectedRaw.split(",").map((x) => x.trim()).filter(Boolean).includes(given);
    }
    return given === expectedRaw;
  }
  if (qType === "fill") {
    const expected = Array.isArray(slide?.fillAnswers) ? slide.fillAnswers : [];
    const given = Array.isArray(answer) ? answer : [];
    if (expected.length === 0) return false;
    if (given.length < expected.length) return false;
    return expected.every((v, i) => String(v || "").trim().toLowerCase() === String(given[i] || "").trim().toLowerCase());
  }
  return String(answer || "").trim().toLowerCase() === String(slide?.correct || "").trim().toLowerCase();
}

function updateLessonProgressBar() {
  const st = lessonPlayerState;
  if (!st) return;
  const slides = Array.isArray(st.lesson.slides) ? st.lesson.slides : [];
  const total = slides.length || 1;
  const visitedCount = st.visited.size;
  let correctCount = 0;
  const questionSlides = slides.filter((s) => s.type === "question" || s.type === "mixed");
  slides.forEach((s, idx) => {
    if (!(s.type === "question" || s.type === "mixed")) return;
    const key = s.id || `slide_${idx}`;
    const answer = st.answered[key];
    if (!answer) return;
    if (isLessonAnswerCorrect(s, answer)) correctCount++;
  });
  st.correctCount = correctCount;
  const basePercent = Math.round((visitedCount / total) * 70);
  const qPercent = questionSlides.length > 0 ? Math.round((correctCount / questionSlides.length) * 30) : 30;
  const percent = Math.min(100, basePercent + qPercent);
  const xp = Math.round((visitedCount * 2) + (correctCount * MAX_QUESTION_XP));
  const label = document.getElementById("lesson-player-progress");
  if (label) label.innerText = `%${percent} tamamlandı • ${xp} XP`;
}

async function persistLessonProgress(closeAfter) {
  const st = lessonPlayerState;
  if (!st || !currentUserId || userRole !== "student") return;
  const slides = Array.isArray(st.lesson.slides) ? st.lesson.slides : [];
  const total = slides.length || 1;
  const visitedCount = st.visited.size;
  let correctCount = 0;
  const questionSlides = slides.filter((s) => s.type === "question" || s.type === "mixed");
  slides.forEach((s, idx) => {
    if (!(s.type === "question" || s.type === "mixed")) return;
    const key = s.id || `slide_${idx}`;
    const answer = st.answered[key];
    if (!answer) return;
    if (isLessonAnswerCorrect(s, answer)) correctCount++;
  });
  const basePercent = Math.round((visitedCount / total) * 70);
  const qPercent = questionSlides.length > 0 ? Math.round((correctCount / questionSlides.length) * 30) : 30;
  const percent = Math.min(100, basePercent + qPercent);
  const totalXP = Math.round((visitedCount * 2) + (correctCount * MAX_QUESTION_XP));
  const completed = visitedCount >= total;
  const ref = doc(db, "lessonProgress", `${st.lesson.id}_${currentUserId}`);
  const prevSnap = await getDoc(ref);
  const prev = prevSnap.exists() ? (prevSnap.data() || {}) : {};
  const prevXP = Math.max(0, Number(prev.totalXP || 0));
  const xpDelta = Math.max(0, totalXP - prevXP);
  await setDoc(ref, {
    lessonId: st.lesson.id,
    userId: currentUserId,
    visitedSlides: Array.from(st.visited),
    currentSlideIndex: st.index,
    answers: st.answered,
    correctCount,
    totalQuestions: questionSlides.length,
    percent,
    totalXP,
    completed,
    updatedAt: serverTimestamp()
  }, { merge: true });
  if (xpDelta > 0) {
    try {
      await updateDoc(doc(db, "users", currentUserId), { xp: increment(xpDelta) });
      if (userData) userData.xp = Math.max(0, Number(userData.xp || 0)) + xpDelta;
    } catch (e) {
      console.warn("lesson xp increment failed", e);
    }
  }
  updateUserXPDisplay();
  if (closeAfter) {
    const modal = document.getElementById("lesson-player-modal");
    if (modal) modal.style.display = "none";
    lessonPlayerState = null;
  }
}

function openComputeHomeworkModalForEdit(assignment) {
  editingComputeHomeworkId = assignment.id;
  const titleInput = document.getElementById("compute-hw-title");
  const classInput = document.getElementById("compute-hw-class");
  const sectionInput = document.getElementById("compute-hw-section");
  const deadlineInput = document.getElementById("compute-hw-deadline");
  const deadlineTimeInput = document.getElementById("compute-hw-deadline-time");
  const startInput = document.getElementById("compute-hw-level-start");
  const endInput = document.getElementById("compute-hw-level-end");
  const saveBtn = document.getElementById("btn-save-compute-homework");
  const deleteBtn = document.getElementById("btn-delete-compute-homework");
  if (titleInput) titleInput.value = assignment.title || "";
  if (classInput) classInput.value = assignment.targetClass || "";
  if (sectionInput) sectionInput.value = assignment.targetSection || "";
  if (deadlineInput) deadlineInput.value = assignment.deadline || "";
  if (deadlineTimeInput) deadlineTimeInput.value = assignment.deadlineTime || "23:59";
  if (startInput) startInput.value = String(Math.max(1, Number(assignment.levelStart || 1)));
  if (endInput) endInput.value = String(Math.max(1, Number(assignment.levelEnd || assignment.levelStart || 1)));
  if (saveBtn) saveBtn.innerText = "Güncelle";
  if (deleteBtn) deleteBtn.style.display = "inline-flex";
  const modal = document.getElementById("compute-homework-modal");
  if (modal) modal.style.display = "flex";
}

async function updateComputeAssignmentProgressFromLevelEvent({ uid, levelId, levels, durationMs, currentLevelIndex }) {
  if (!activeComputeAssignmentId || !uid) return;
  try {
    const assignmentRef = doc(db, "computeAssignments", activeComputeAssignmentId);
    const assignmentSnap = await getDoc(assignmentRef);
    if (!assignmentSnap.exists()) return;
    const assignment = assignmentSnap.data() || {};
    const levelStart = Math.max(1, Number(assignment.levelStart || 1));
    const levelEnd = Math.max(levelStart, Number(assignment.levelEnd || levelStart));
    const rangeLevels = Array.isArray(levels) ? levels.slice(levelStart - 1, levelEnd) : [];
    const totalLevels = rangeLevels.length;
    const progressRef = doc(db, "computeAssignmentProgress", `${activeComputeAssignmentId}_${uid}`);
    const progressSnap = await getDoc(progressRef);
    const prev = progressSnap.exists() ? progressSnap.data() : {};
    const prevIds = Array.isArray(prev.completedLevelIds)
      ? prev.completedLevelIds.map((v) => Number(v)).filter((v) => Number.isFinite(v))
      : [];
    const merged = new Set(prevIds);
    rangeLevels.forEach((lv) => {
      if (lv?.completed) {
        const lid = Number(lv?.id);
        if (Number.isFinite(lid)) merged.add(lid);
      }
    });
    const eventLevelId = Number(levelId);
    if (Number.isFinite(eventLevelId)) merged.add(eventLevelId);
    const mergedIds = Array.from(merged);
    const completedLevels = totalLevels > 0
      ? rangeLevels.filter((lv) => merged.has(Number(lv?.id))).length
      : 0;
    const percent = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
    const completed = totalLevels > 0 && completedLevels >= totalLevels;
    const wasCompleted = !!prev.completed;
    const elapsedSeconds = Math.max(0, Math.floor((Number(prev.lastSessionSeconds || 0)) + ((Number(durationMs || 0)) / 1000)));
    const totalXP = rangeLevels.reduce((sum, lv) => {
      const lid = Number(lv?.id);
      if (!Number.isFinite(lid) || !merged.has(lid)) return sum;
      return sum + clampAppLevelXP(lv?.xp ?? MAX_APP_LEVEL_XP);
    }, 0);
    const prevAwardedXP = Math.max(0, Number(prev.awardedXP || 0));
    await setDoc(progressRef, {
      assignmentId: activeComputeAssignmentId,
      assignmentTitle: String(assignment.title || "Compute It Ödevi"),
      levelStart,
      levelEnd,
      userId: uid,
      percent,
      completed,
      completedLevelIds: mergedIds,
      totalXP,
      awardedXP: prevAwardedXP,
      completedLevels,
      totalLevels,
      currentLevelIndex: Math.max(0, Number(currentLevelIndex || 0)),
      lastSessionSeconds: elapsedSeconds,
      lastSessionMinutes: Math.floor(elapsedSeconds / 60),
      updatedAt: serverTimestamp()
    }, { merge: true });
    const effectiveCompleted = completed;
    const xpDelta = effectiveCompleted ? Math.max(0, totalXP - prevAwardedXP) : 0;
    if (xpDelta > 0) {
      try {
        await updateDoc(doc(db, "users", uid), { xp: increment(xpDelta), updatedAt: serverTimestamp() });
      } catch (e) {
        await setDoc(doc(db, "users", uid), { xp: increment(xpDelta), updatedAt: serverTimestamp() }, { merge: true });
      }
      await setDoc(progressRef, {
        awardedXP: prevAwardedXP + xpDelta,
        updatedAt: serverTimestamp()
      }, { merge: true });
      if (uid === currentUserId && userData) userData.xp = Math.max(0, Number(userData.xp || 0)) + xpDelta;
      if (uid === currentUserId) updateUserXPDisplay();
    }
    if (!wasCompleted && completed) {
      await updateDoc(assignmentRef, {
        completedCount: increment(1),
        updatedAt: serverTimestamp()
      });
      if (userRole === "student" && computeRunnerSession && !computeRunnerSession.completionHandled) {
        computeRunnerSession.completionHandled = true;
        syncRunnerSaveButtons();
        try {
          const iframe = document.getElementById("activity-iframe");
          iframe?.contentWindow?.postMessage({ type: "FORCE_ASSIGNMENT_LOCK" }, "*");
        } catch (e) {}
      }
      showCompletionCelebration({
        title: "Compute It Tamamlandı!",
        message: "Muhteşem! Ödev bitti, veriler başarıyla kaydedildi.",
        accent: "#f59e0b",
        xp: Math.max(0, Number(totalXP || 0)),
        durationSeconds: Math.max(0, Number(elapsedSeconds || 0)),
        requireAction: true,
        actionText: "Kaydet ve Çık",
        onAction: async () => await saveAndExitCompletedRunner()
      });
    }
  } catch (e) {
    console.warn("computeAssignmentProgress save error", e);
  }
}

function assignmentMatchesStudent(assignment) {
  const ownerTeacherId = userData?.ownerTeacherId || userData?.createdBy || "";
  if (ownerTeacherId && assignment?.userId && String(assignment.userId) !== String(ownerTeacherId)) return false;
  const targetClass = assignment.targetClass || "";
  const targetSection = assignment.targetSection || "";
  if (!targetClass) return true;
  if (!userData) return true;
  const studentClass = userData.className || "";
  const studentSection = userData.section || "";
  if (!studentClass) return false;
  if (targetSection) {
    return targetClass === studentClass && targetSection === studentSection;
  }
  return targetClass === studentClass;
}

function assignmentMatchesStudentFor(assignment, student) {
  const ownerTeacherId = student?.ownerTeacherId || student?.createdBy || "";
  if (ownerTeacherId && assignment?.userId && String(assignment.userId) !== String(ownerTeacherId)) return false;
  const targetClass = assignment.targetClass || "";
  const targetSection = assignment.targetSection || "";
  if (!targetClass) return true;
  const studentClass = student?.className || "";
  const studentSection = student?.section || "";
  if (!studentClass) return false;
  if (targetSection) {
    return targetClass === studentClass && targetSection === studentSection;
  }
  return targetClass === studentClass;
}

function renderLimitedRows(listEl, rows, limit = 3) {
  if (!listEl) return;
  listEl.innerHTML = "";
  rows.slice(0, limit).forEach((row) => listEl.appendChild(row));
}

function setShowMoreButton(buttonId, show, onClick) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.style.display = show ? "block" : "none";
  btn.onclick = show ? onClick : null;
}

function setStudentCombinedTab(kind = "homework", tab = "pending") {
  const panelKey = kind === "apps" ? "apps" : "homework";
  const tabName = tab === "completed" ? "completed" : "pending";
  studentCombinedTabState[panelKey] = tabName;

  const tabsId = panelKey === "apps" ? "student-apps-tabs" : "student-homework-tabs";
  const pendingId = panelKey === "apps" ? "student-apps-pending" : "student-homework-pending";
  const completedId = panelKey === "apps" ? "student-apps-completed" : "student-homework-completed";
  const tabsEl = document.getElementById(tabsId);
  const pendingEl = document.getElementById(pendingId);
  const completedEl = document.getElementById(completedId);
  if (tabsEl) {
    tabsEl.querySelectorAll(".tab-btn").forEach((btn) => {
      const isPendingBtn = String(btn.textContent || "").toLowerCase().includes("bekleyen");
      btn.classList.toggle("active", (isPendingBtn && tabName === "pending") || (!isPendingBtn && tabName === "completed"));
    });
  }
  if (pendingEl) pendingEl.classList.toggle("active", tabName === "pending");
  if (completedEl) completedEl.classList.toggle("active", tabName === "completed");

  const cache = studentCombinedListCache[panelKey] || { pending: [], completed: [] };
  const show = tabName === "completed" ? (cache.completed || []).length > 3 : (cache.pending || []).length > 3;
  const buttonId = panelKey === "apps" ? "btn-show-all-student-apps" : "btn-show-all-student-homework";
  setShowMoreButton(buttonId, show, () => openAllItemsModal(cache.title || "İçerikler", cache.pending || [], cache.completed || []));
}

window.switchStudentCombinedTab = function(kind, tab) {
  setStudentCombinedTab(kind, tab);
};

function renderStudentCombinedSections() {
  if (userRole !== "student") return;
  const homePendingList = document.getElementById("list-student-homework-pending");
  const homeCompletedList = document.getElementById("list-student-homework-completed");
  const appsPendingList = document.getElementById("list-student-apps-pending");
  const appsCompletedList = document.getElementById("list-student-apps-completed");
  if (!homePendingList || !homeCompletedList || !appsPendingList || !appsCompletedList) return;

  const homeworkPendingRows = [
    ...(homeListCache.tasks?.pending || []),
    ...(homeListCache.activities?.pending || []),
    ...(homeListCache.lessons?.pending || [])
  ];
  const homeworkCompletedRows = [
    ...(homeListCache.tasks?.completed || []),
    ...(homeListCache.activities?.completed || []),
    ...(homeListCache.lessons?.completed || [])
  ];

  const appsPendingRows = [
    ...(homeListCache.block?.pending || []),
    ...(homeListCache.compute?.pending || [])
  ];
  const appsCompletedRows = [
    ...(homeListCache.block?.completed || []),
    ...(homeListCache.compute?.completed || [])
  ];

  renderLimitedRows(homePendingList, homeworkPendingRows, 3);
  renderLimitedRows(homeCompletedList, homeworkCompletedRows, 3);
  renderLimitedRows(appsPendingList, appsPendingRows, 3);
  renderLimitedRows(appsCompletedList, appsCompletedRows, 3);

  const noHomePending = document.getElementById("no-student-homework-pending");
  const noHomeCompleted = document.getElementById("no-student-homework-completed");
  const noAppsPending = document.getElementById("no-student-apps-pending");
  const noAppsCompleted = document.getElementById("no-student-apps-completed");
  if (noHomePending) noHomePending.style.display = homeworkPendingRows.length === 0 ? "block" : "none";
  if (noHomeCompleted) noHomeCompleted.style.display = homeworkCompletedRows.length === 0 ? "block" : "none";
  if (noAppsPending) noAppsPending.style.display = appsPendingRows.length === 0 ? "block" : "none";
  if (noAppsCompleted) noAppsCompleted.style.display = appsCompletedRows.length === 0 ? "block" : "none";

  studentCombinedListCache.homework = {
    title: "Ödevlerim",
    pending: homeworkPendingRows.slice(),
    completed: homeworkCompletedRows.slice()
  };
  studentCombinedListCache.apps = {
    title: "Uygulamalar",
    pending: appsPendingRows.slice(),
    completed: appsCompletedRows.slice()
  };

  setStudentCombinedTab("homework", studentCombinedTabState.homework || "pending");
  setStudentCombinedTab("apps", studentCombinedTabState.apps || "pending");
}

function updateBlockHomeworkShowMoreButton() {
  const cache = homeListCache?.block || {};
  const pendingLen = Array.isArray(cache.pending) ? cache.pending.length : 0;
  const completedLen = Array.isArray(cache.completed) ? cache.completed.length : 0;
  const completedTab = document.getElementById("block-homework-completed");
  const activeTab = completedTab?.classList.contains("active") ? "completed" : "pending";
  const show = activeTab === "completed" ? completedLen > 3 : pendingLen > 3;
  setShowMoreButton(
    "btn-show-all-block-homework",
    show,
    () => openAllItemsModal(cache.title || "Blok Kodlama Ödevim", cache.pending || [], cache.completed || [])
  );
}

function getHomeCacheCounts(key) {
  const bucket = homeListCache?.[key] || {};
  const pending = Array.isArray(bucket.pending) ? bucket.pending.length : 0;
  const completed = Array.isArray(bucket.completed) ? bucket.completed.length : 0;
  return { pending, completed, total: pending + completed };
}

function getStudentCertificateSummary() {
  const keys = ["tasks", "activities", "block", "compute", "lessons"];
  let pending = 0;
  let completed = 0;
  keys.forEach((key) => {
    const c = getHomeCacheCounts(key);
    pending += c.pending;
    completed += c.completed;
  });
  const total = pending + completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, completionRate };
}

function renderStudentCertificateCard() {
  if (userRole !== "student") return;
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = String(value);
  };
  const fullName = getUserDisplayName(userData || {});
  const cls = userData?.className || "-";
  const sec = userData?.section || "-";
  const xp = getStudentXPValue(userData || {});
  const summary = getStudentCertificateSummary();
  const issuedAt = new Date().toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  setText("certificate-student-name", fullName);
  setText("certificate-class", `${cls} / ${sec}`);
  setText("certificate-xp", `${xp} XP`);
  setText("certificate-completion", `%${summary.completionRate} (${summary.completed}/${summary.total})`);
  setText("certificate-date", issuedAt);
  const awardText = document.getElementById("certificate-award-text");
  if (awardText) {
    awardText.innerText = `${fullName}, bu platformda gösterdiğin öğrenme başarısı, sorumluluk bilinci ve gelişim performansı için tebrik edilerek bu eğitim sertifikası ile ödüllendirilmiştir.`;
  }
}

async function downloadStudentCertificatePdf() {
  try {
    const student = userData || {};
    const summary = getStudentCertificateSummary();
    const fullName = getUserDisplayName(student);
    const pages = [{
      fullName,
      className: student?.className || "-",
      section: student?.section || "-",
      xp: getStudentXPValue(student),
      completionRate: Number(summary.completionRate || 0),
      completed: Number(summary.completed || 0),
      total: Number(summary.total || 0),
      issuedAt: getTeacherCertificateIssuedDate()
    }];
    openCertificatePreviewWindow({
      title: `${fullName} Sertifikası`,
      pages
    });
  } catch (e) {
    console.error("certificate pdf", e);
    showNotice("Sertifika önizlemesi açılamadı.", "#e74c3c");
  }
}

function getTeacherCertificateIssuedDate() {
  return new Date().toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function setTeacherCertificateCard(student, summary) {
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = String(value);
  };
  const fullName = getUserDisplayName(student || {});
  const cls = student?.className || "-";
  const sec = student?.section || "-";
  const xp = getStudentXPValue(student || {});
  const completionRate = Number(summary?.completionRate || 0);
  const completed = Number(summary?.completed || 0);
  const total = Number(summary?.total || 0);
  setText("teacher-certificate-student-name", fullName);
  setText("teacher-certificate-class", `${cls} / ${sec}`);
  setText("teacher-certificate-xp", `${xp} XP`);
  setText("teacher-certificate-completion", `%${completionRate} (${completed}/${total})`);
  setText("teacher-certificate-date", getTeacherCertificateIssuedDate());
  const awardText = document.getElementById("teacher-certificate-award-text");
  if (awardText) {
    awardText.innerText = `${fullName}, bu platformda gösterdiğin öğrenme başarısı, sorumluluk bilinci ve gelişim performansı için tebrik edilerek bu eğitim sertifikası ile ödüllendirilmiştir.`;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildCertificatePageHtml(page) {
  const fullName = escapeHtml(page.fullName || "Öğrenci");
  const cls = escapeHtml(page.className || "-");
  const sec = escapeHtml(page.section || "-");
  const xp = Math.max(0, Number(page.xp || 0));
  const completionRate = Math.max(0, Math.min(100, Number(page.completionRate || 0)));
  const completed = Math.max(0, Number(page.completed || 0));
  const total = Math.max(0, Number(page.total || 0));
  const issuedAt = escapeHtml(page.issuedAt || getTeacherCertificateIssuedDate());
  const awardText = `${fullName}, bu platformda gösterdiğin öğrenme başarısı, sorumluluk bilinci ve gelişim performansı için tebrik edilerek bu eğitim sertifikası ile ödüllendirilmiştir.`;
  return `
    <section class="cert-page">
      <div class="cert-card">
        <div class="cert-frame">
          <img src="logo.png" alt="Logo" class="cert-logo" />
          <div class="cert-kicker">RESMİ EĞİTİM BELGESİ</div>
          <h1 class="cert-title">BAŞARI SERTİFİKASI</h1>
          <p class="cert-text">${awardText}</p>
          <div class="cert-name">${fullName}</div>
          <div class="cert-meta">
            <div class="cert-meta-item"><span class="k">Sınıf / Şube</span><span class="v">${cls} / ${sec}</span></div>
            <div class="cert-meta-item"><span class="k">Toplam XP</span><span class="v">${xp} XP</span></div>
            <div class="cert-meta-item"><span class="k">Tamamlama</span><span class="v">%${completionRate} (${completed}/${total})</span></div>
            <div class="cert-meta-item"><span class="k">Veriliş Tarihi</span><span class="v">${issuedAt}</span></div>
          </div>
          <div class="cert-signatures">
            <div class="sig-box"><div class="line"></div><div class="label">Öğretmen Onayı</div></div>
            <div class="sig-box"><div class="line"></div><div class="label">Kurum Onayı</div></div>
          </div>
          <div class="cert-footer">Bu belge öğrenci gelişim sistemi üzerinden dijital olarak üretilmiştir.</div>
        </div>
      </div>
    </section>
  `;
}

function getCertificatePreviewStyles() {
  return `
    :root { --ink:#1f2937; --muted:#6b7280; --violet:#7c3aed; --violet-soft:#faf5ff; --bg:#f5f7fb; }
    * { box-sizing: border-box; }
    body { margin:0; padding:16px; background:var(--bg); font-family:"Montserrat","Segoe UI",Tahoma,Arial,sans-serif; color:var(--ink); }
    .toolbar { position: sticky; top: 0; z-index: 20; display:flex; justify-content:flex-end; gap:8px; margin:0 auto 12px; max-width:1200px; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:10px; box-shadow:0 8px 20px rgba(2,6,23,0.08); }
    .btn { border:none; border-radius:10px; padding:10px 14px; font-weight:700; cursor:pointer; }
    .btn-primary { background:#6d28d9; color:#fff; }
    .btn-danger { background:#dc2626; color:#fff; }
    .cert-page { page-break-after: always; max-width:1200px; margin:0 auto 14px; }
    .cert-card { background:#ffffff; border-radius:16px; border:1px solid #e5e7eb; box-shadow:0 12px 30px rgba(15,23,42,0.1); padding:14px; }
    .cert-frame {
      min-height: 740px;
      border-radius: 14px;
      border: 8px double var(--violet);
      background:
        radial-gradient(circle at top right, rgba(168, 85, 247, 0.18), rgba(255,255,255,0) 44%),
        radial-gradient(circle at bottom left, rgba(196, 181, 253, 0.22), rgba(255,255,255,0) 40%),
        linear-gradient(165deg, #ffffff 0%, #ffffff 78%, #f3e8ff 100%);
      padding: 36px 34px;
      text-align: center;
      display:flex; flex-direction:column; justify-content:center; align-items:center;
      gap:10px;
    }
    .cert-logo { width: 138px; height: auto; margin-bottom: 4px; }
    .cert-kicker { font-size: 12px; letter-spacing: 0.24em; font-weight: 700; color: #6d28d9; text-transform: uppercase; }
    .cert-title { margin: 2px 0 6px; font-family: "Times New Roman", Georgia, serif; font-size: 46px; letter-spacing: 0.06em; color: #4c1d95; font-weight: 700; }
    .cert-text { margin: 0; max-width: 900px; font-size: 20px; line-height: 1.7; color: #4b5563; }
    .cert-name { margin: 10px 0 4px; font-family: "Times New Roman", Georgia, serif; font-size: 52px; line-height: 1.1; color:#581c87; text-transform: uppercase; font-weight: 700; }
    .cert-meta { margin-top: 10px; width: 100%; display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
    .cert-meta-item { border:1px solid #8b5cf6; background: var(--violet-soft); border-radius: 12px; padding: 10px 8px; display:flex; flex-direction:column; gap:4px; }
    .cert-meta-item .k { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color:#7c3aed; font-weight:700; }
    .cert-meta-item .v { font-size: 18px; font-weight: 800; color:#1f2937; }
    .cert-signatures { width: 100%; display:grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 22px; }
    .sig-box .line { border-bottom: 1.6px solid #6b7280; height: 24px; }
    .sig-box .label { margin-top: 6px; font-size: 13px; color:#6b7280; font-weight:600; text-transform: uppercase; letter-spacing:0.05em; }
    .cert-footer { margin-top: 16px; font-size: 13px; color: #6b7280; }
    @page { size: A4 landscape; margin: 10mm; }
    @media print {
      body { padding:0; background:#fff; }
      .toolbar { display:none; }
      .cert-page { margin:0; }
      .cert-card { border:none; box-shadow:none; padding:0; background:transparent; }
      .cert-frame { border-width: 6px; min-height: 185mm; }
    }
    @media (max-width: 900px) {
      .cert-title { font-size: 32px; }
      .cert-name { font-size: 34px; }
      .cert-text { font-size: 16px; }
      .cert-meta { grid-template-columns: 1fr 1fr; }
    }
  `;
}

function openCertificatePreviewWindow({ title, pages }) {
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    showNotice("Yeni sekme açılamadı.", "#e74c3c");
    return;
  }
  const safeTitle = escapeHtml(title || "Sertifika Önizleme");
  const bodyHtml = (pages || []).map((p) => buildCertificatePageHtml(p)).join("");
  reportWindow.document.write(`
    <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${safeTitle}</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>${getCertificatePreviewStyles()}</style>
      </head>
      <body>
        <div class="toolbar">
          <button id="certPrintBtn" class="btn btn-primary">PDF / Yazdır</button>
          <button id="certCloseBtn" class="btn btn-danger">Kapat</button>
        </div>
        ${bodyHtml || "<div style='padding:20px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;'>Sertifika verisi bulunamadı.</div>"}
      </body>
    </html>
  `);
  reportWindow.document.close();
  reportWindow.onload = () => {
    const printBtn = reportWindow.document.getElementById("certPrintBtn");
    if (printBtn) {
      printBtn.onclick = () => {
        reportWindow.focus();
        reportWindow.print();
      };
    }
    const closeBtn = reportWindow.document.getElementById("certCloseBtn");
    if (closeBtn) closeBtn.onclick = () => reportWindow.close();
  };
}

async function getTeacherStudentCertificateSummary(student, forceRefresh = false) {
  const studentId = String(student?.id || "");
  if (!studentId) return { completed: 0, total: 0, completionRate: 0 };
  if (!forceRefresh && teacherCertificateMetricsCache.has(studentId)) {
    return teacherCertificateMetricsCache.get(studentId);
  }

  const assignedTaskIds = new Set(
    allTasks
      .filter((t) => !t?.isDeleted && taskMatchesStudentFor(t, student))
      .map((t) => String(t.id || ""))
      .filter(Boolean)
  );
  const assignedActivityIds = new Set(
    contentAssignments
      .filter((a) => !a?.isDeleted && assignmentMatchesStudentFor(a, student))
      .map((a) => String(a.contentId || ""))
      .filter(Boolean)
  );
  const assignedBlockIds = new Set(
    blockAssignments
      .filter((a) => !a?.isDeleted && assignmentMatchesStudentFor(a, student))
      .map((a) => String(a.id || ""))
      .filter(Boolean)
  );
  const assignedComputeIds = new Set(
    computeAssignments
      .filter((a) => !a?.isDeleted && assignmentMatchesStudentFor(a, student))
      .map((a) => String(a.id || ""))
      .filter(Boolean)
  );
  const assignedLessonIds = new Set(
    lessons
      .filter((a) => !a?.isDeleted && assignmentMatchesStudentFor(a, student))
      .map((a) => String(a.id || ""))
      .filter(Boolean)
  );

  const [completionsSnap, activitySnap, blockSnap, computeSnap, lessonSnap] = await Promise.all([
    getDocs(query(collection(db, "completions"), where("userId", "==", studentId))),
    getDocs(query(collection(db, "contentProgress"), where("userId", "==", studentId))),
    getDocs(query(collection(db, "blockAssignmentProgress"), where("userId", "==", studentId))),
    getDocs(query(collection(db, "computeAssignmentProgress"), where("userId", "==", studentId))),
    getDocs(query(collection(db, "lessonProgress"), where("userId", "==", studentId)))
  ]);

  const completedTaskIds = new Set();
  completionsSnap.forEach((docSnap) => {
    const data = docSnap.data() || {};
    const tid = String(data.taskId || "");
    if (tid && assignedTaskIds.has(tid)) completedTaskIds.add(tid);
  });

  const completedActivityIds = new Set();
  activitySnap.forEach((docSnap) => {
    const p = docSnap.data() || {};
    const contentId = String(p.contentId || "");
    if (!contentId || !assignedActivityIds.has(contentId)) return;
    let best = 0;
    Object.values(p.appUsage || {}).forEach((u) => {
      const percent = Number(u?.percent || 0);
      if (percent > best) best = percent;
    });
    const done = best > 0 || (p.completedItemIds || []).length > 0;
    if (done) completedActivityIds.add(contentId);
  });

  const completedBlockIds = new Set();
  blockSnap.forEach((docSnap) => {
    const p = docSnap.data() || {};
    const aid = String(p.assignmentId || "");
    if (!aid || !assignedBlockIds.has(aid)) return;
    const done = !!p.completed || Number(p.percent || 0) > 0 || Number(p.completedLevels || 0) > 0;
    if (done) completedBlockIds.add(aid);
  });

  const completedComputeIds = new Set();
  computeSnap.forEach((docSnap) => {
    const p = docSnap.data() || {};
    const aid = String(p.assignmentId || "");
    if (!aid || !assignedComputeIds.has(aid)) return;
    const done = !!p.completed || Number(p.percent || 0) > 0 || Number(p.completedLevels || 0) > 0;
    if (done) completedComputeIds.add(aid);
  });

  const completedLessonIds = new Set();
  lessonSnap.forEach((docSnap) => {
    const p = docSnap.data() || {};
    const lid = String(p.lessonId || "");
    if (!lid || !assignedLessonIds.has(lid)) return;
    const done = !!p.completed || Number(p.percent || 0) > 0 || Number(p.completedSlides || 0) > 0 || Number(p.currentIndex || 0) > 0;
    if (done) completedLessonIds.add(lid);
  });

  const total = assignedTaskIds.size + assignedActivityIds.size + assignedBlockIds.size + assignedComputeIds.size + assignedLessonIds.size;
  const completed = completedTaskIds.size + completedActivityIds.size + completedBlockIds.size + completedComputeIds.size + completedLessonIds.size;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const summary = { completed, total, completionRate };
  teacherCertificateMetricsCache.set(studentId, summary);
  return summary;
}

function getTeacherCertificateFilteredStudents() {
  const classVal = document.getElementById("teacher-cert-class")?.value || "";
  const sectionVal = document.getElementById("teacher-cert-section")?.value || "";
  return teacherCertificateStudents.filter((s) => {
    if (classVal && String(s.className || "") !== classVal) return false;
    if (sectionVal && String(s.section || "") !== sectionVal) return false;
    return true;
  });
}

function updateTeacherCertificateSectionOptions() {
  const classVal = document.getElementById("teacher-cert-class")?.value || "";
  const sectionSel = document.getElementById("teacher-cert-section");
  if (!sectionSel) return;
  const sections = new Set();
  teacherCertificateStudents.forEach((s) => {
    if (classVal && String(s.className || "") !== classVal) return;
    if (s.section) sections.add(String(s.section));
  });
  const currentVal = sectionSel.value || "";
  sectionSel.innerHTML = `<option value="">Tümü</option>`;
  Array.from(sections).sort((a, b) => a.localeCompare(b, "tr")).forEach((sec) => {
    const opt = document.createElement("option");
    opt.value = sec;
    opt.textContent = sec;
    sectionSel.appendChild(opt);
  });
  if (currentVal && Array.from(sections).includes(currentVal)) {
    sectionSel.value = currentVal;
  }
}

async function updateTeacherCertificateStudentOptions() {
  const studentSel = document.getElementById("teacher-cert-student");
  if (!studentSel) return;
  const filtered = getTeacherCertificateFilteredStudents();
  const prev = studentSel.value || "";
  studentSel.innerHTML = `<option value="">Öğrenci seçin</option>`;
  filtered.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${getUserDisplayName(s)} (${s.className || "-"}${s.section ? "/" + s.section : ""})`;
    studentSel.appendChild(opt);
  });
  if (prev && filtered.some((s) => s.id === prev)) {
    studentSel.value = prev;
  } else if (filtered[0]) {
    studentSel.value = filtered[0].id;
  }
  await renderTeacherCertificateCardBySelection();
}

async function renderTeacherCertificateCardBySelection() {
  const studentId = document.getElementById("teacher-cert-student")?.value || "";
  const emptySummary = { completed: 0, total: 0, completionRate: 0 };
  if (!studentId) {
    setTeacherCertificateCard({ firstName: "Öğrenci", lastName: "Seçilmedi", className: "-", section: "-", xp: 0 }, emptySummary);
    return;
  }
  const student = teacherCertificateStudents.find((s) => String(s.id) === String(studentId));
  if (!student) {
    setTeacherCertificateCard({ firstName: "Öğrenci", lastName: "Bulunamadı", className: "-", section: "-", xp: 0 }, emptySummary);
    return;
  }
  const summary = await getTeacherStudentCertificateSummary(student);
  setTeacherCertificateCard(student, summary);
}

async function openTeacherCertificatesModal() {
  if (userRole !== "teacher") return;
  await ensureStudentsCache();
  teacherCertificateStudents = (allStudents || [])
    .filter((s) => (s.role || "student") === "student")
    .slice()
    .sort((a, b) => getUserDisplayName(a).localeCompare(getUserDisplayName(b), "tr"));
  const classSel = document.getElementById("teacher-cert-class");
  if (classSel) {
    const classes = new Set();
    teacherCertificateStudents.forEach((s) => { if (s.className) classes.add(String(s.className)); });
    const prev = classSel.value || "";
    classSel.innerHTML = `<option value="">Tümü</option>`;
    Array.from(classes).sort((a, b) => a.localeCompare(b, "tr")).forEach((cls) => {
      const opt = document.createElement("option");
      opt.value = cls;
      opt.textContent = cls;
      classSel.appendChild(opt);
    });
    if (prev && Array.from(classes).includes(prev)) classSel.value = prev;
  }
  updateTeacherCertificateSectionOptions();
  await updateTeacherCertificateStudentOptions();
  if (teacherCertificatesModal) teacherCertificatesModal.style.display = "flex";
}

async function downloadSelectedTeacherCertificatePdf() {
  try {
    const studentId = document.getElementById("teacher-cert-student")?.value || "";
    if (!studentId) {
      showNotice("Lütfen öğrenci seçin.", "#e74c3c");
      return;
    }
    const student = teacherCertificateStudents.find((s) => String(s.id) === String(studentId));
    if (!student) {
      showNotice("Öğrenci bulunamadı.", "#e74c3c");
      return;
    }
    const summary = await getTeacherStudentCertificateSummary(student, true);
    setTeacherCertificateCard(student, summary);
    const pages = [{
      fullName: getUserDisplayName(student),
      className: student?.className || "-",
      section: student?.section || "-",
      xp: getStudentXPValue(student),
      completionRate: Number(summary.completionRate || 0),
      completed: Number(summary.completed || 0),
      total: Number(summary.total || 0),
      issuedAt: getTeacherCertificateIssuedDate()
    }];
    openCertificatePreviewWindow({
      title: `${getUserDisplayName(student)} Sertifikası`,
      pages
    });
  } catch (e) {
    console.error("teacher certificate single", e);
    showNotice("Sertifika önizlemesi açılamadı.", "#e74c3c");
  }
}

async function downloadFilteredTeacherCertificatesPdf() {
  try {
    const students = getTeacherCertificateFilteredStudents();
    if (!students.length) {
      showNotice("Seçili filtrede öğrenci yok.", "#e74c3c");
      return;
    }
    showNotice(`Sertifikalar hazırlanıyor (${students.length} öğrenci)...`, "#4a90e2");
    const pages = [];
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const summary = await getTeacherStudentCertificateSummary(student, true);
      setTeacherCertificateCard(student, summary);
      pages.push({
        fullName: getUserDisplayName(student),
        className: student?.className || "-",
        section: student?.section || "-",
        xp: getStudentXPValue(student),
        completionRate: Number(summary.completionRate || 0),
        completed: Number(summary.completed || 0),
        total: Number(summary.total || 0),
        issuedAt: getTeacherCertificateIssuedDate()
      });
    }

    const classVal = document.getElementById("teacher-cert-class")?.value || "tum_siniflar";
    const sectionVal = document.getElementById("teacher-cert-section")?.value || "tum_subeler";
    openCertificatePreviewWindow({
      title: `Sınıf Sertifikaları ${classVal}/${sectionVal}`,
      pages
    });
    showNotice("Sertifika önizleme sekmesi açıldı.", "#2ecc71");
  } catch (e) {
    console.error("teacher certificate bulk", e);
    showNotice("Toplu sertifika önizlemesi açılamadı.", "#e74c3c");
  }
}

function renderHomeOverviewStrip() {
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = String(val);
  };
  const setMeta = (id, pending, completed, total) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (userRole === "teacher") {
      el.innerText = `${total} toplam`;
      return;
    }
    el.innerText = `${pending} bekleyen • ${completed} tamamlanan`;
  };

  const task = userRole === "teacher"
    ? { pending: 0, completed: 0, total: allTasks.filter((t) => !t?.isDeleted).length }
    : getHomeCacheCounts("tasks");
  const act = userRole === "teacher"
    ? { pending: 0, completed: 0, total: contentAssignments.filter((a) => !a?.isDeleted).length }
    : getHomeCacheCounts("activities");
  const block = userRole === "teacher"
    ? { pending: 0, completed: 0, total: blockAssignments.filter((a) => !a?.isDeleted).length }
    : getHomeCacheCounts("block");
  const compute = userRole === "teacher"
    ? { pending: 0, completed: 0, total: computeAssignments.filter((a) => !a?.isDeleted).length }
    : getHomeCacheCounts("compute");
  const lesson = userRole === "teacher"
    ? { pending: 0, completed: 0, total: lessons.filter((a) => !a?.isDeleted).length }
    : getHomeCacheCounts("lessons");

  setText("home-overview-tasks", task.total);
  setText("home-overview-activities", act.total);
  setText("home-overview-block", block.total);
  setText("home-overview-compute", compute.total);
  setText("home-overview-lessons", lesson.total);

  setMeta("home-overview-tasks-meta", task.pending, task.completed, task.total);
  setMeta("home-overview-activities-meta", act.pending, act.completed, act.total);
  setMeta("home-overview-block-meta", block.pending, block.completed, block.total);
  setMeta("home-overview-compute-meta", compute.pending, compute.completed, compute.total);
  setMeta("home-overview-lessons-meta", lesson.pending, lesson.completed, lesson.total);
}

function openAllItemsModal(title, pendingRows = [], completedRows = []) {
  const modal = document.getElementById("all-tasks-modal");
  const titleEl = document.getElementById("all-items-title");
  const list = document.getElementById("all-tasks-list");
  if (!modal || !titleEl || !list) return;
  titleEl.innerText = title || "Tüm İçerikler";
  list.innerHTML = "";

  const addHeading = (text, marginTop = "0") => {
    const h = document.createElement("h4");
    h.style.margin = `${marginTop} 0 8px`;
    h.innerText = text;
    list.appendChild(h);
  };
  const addRows = (rows = []) => {
    rows.forEach((r) => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = r?.innerHTML || "";
      if (typeof r?.onclick === "function") {
        item.style.cursor = "pointer";
        item.onclick = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          // Açılan düzenleme modalı arkada kalmasın diye önce "Daha Fazla Göster" modalını kapat.
          if (modal) modal.style.display = "none";
          setTimeout(() => {
            try {
              r.onclick.call(r, ev);
            } catch (e) {
              console.error("openAllItemsModal row click failed:", e);
            }
          }, 0);
        };
      } else {
        item.style.pointerEvents = "none";
      }
      list.appendChild(item);
    });
  };

  if (pendingRows.length > 0) {
    addHeading("Bekleyen");
    addRows(pendingRows);
  }
  if (completedRows.length > 0) {
    addHeading("Tamamlanan", pendingRows.length ? "14px" : "0");
    addRows(completedRows);
  }
  if (!pendingRows.length && !completedRows.length) {
    list.innerHTML = "<div class='empty-state'>Kayıt bulunamadı.</div>";
  }
  modal.style.display = "flex";
}

function taskMatchesStudentFor(task, student) {
  if (userRole === "teacher" && !recordBelongsToCurrentTeacher(student)) return false;
  const targetClass = task?.targetClass || "";
  const targetSection = task?.targetSection || "";
  if (!targetClass) return true;
  const studentClass = student?.className || "";
  const studentSection = student?.section || "";
  if (!studentClass) return false;
  if (targetSection) {
    return targetClass === studentClass && targetSection === studentSection;
  }
  return targetClass === studentClass;
}

function assignmentMatchesClass(assignment, className, section) {
  const targetClass = assignment.targetClass || "";
  const targetSection = assignment.targetSection || "";
  if (!targetClass) return true;
  if (!className) return false;
  if (targetSection) {
    return targetClass === className && targetSection === section;
  }
  return targetClass === className;
}

async function getStudentActivityCounts(student) {
  const assignmentsForStudent = contentAssignments.filter(a => assignmentMatchesStudentFor(a, student));
  const totalActivities = assignmentsForStudent.length;
  let completedActivities = 0;
  if (!totalActivities) return { totalActivities, completedActivities };
  const progSnap = await getDocs(query(collection(db, "contentProgress"), where("userId", "==", student.id)));
  progSnap.forEach((docSnap) => {
    const p = docSnap.data();
    if (!p?.contentId) return;
    const assigned = assignmentsForStudent.find(a => a.contentId === p.contentId);
    if (!assigned) return;
    let best = 0;
    Object.values(p.appUsage || {}).forEach((u) => {
      const percent = u?.percent || 0;
      if (percent > best) best = percent;
    });
    const done = best > 0 || (p.completedItemIds || []).length > 0;
    if (done) completedActivities++;
  });
  return { totalActivities, completedActivities };
}

function getAssignmentDeadlineDate(assignment) {
  if (!assignment?.deadline) return null;
  const dateStr = assignment.deadline;
  const timeStr = assignment.deadlineTime || "23:59";
  const d = new Date(`${dateStr}T${timeStr}`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

async function openAssignedContent(assignment) {
  if (!assignment?.contentId) return;
  const deadlineDate = getAssignmentDeadlineDate(assignment);
  const isExpired = deadlineDate ? deadlineDate < new Date() : false;
  if (isExpired) {
    showNotice("Bu etkinliğin süresi doldu. Tamamlanamaz.", "#e74c3c");
  }
  if (userRole === "student") {
    const prog = getAssignmentAppProgress(assignment);
    if (prog.percent > 0) {
      await showCompletionInfoPopup({
        category: "Etkinlik",
        title: assignment.title || "Etkinlik",
        xp: getAssignmentCompletionXP(assignment),
        seconds: Math.max(0, Number(prog.seconds || 0)),
        percent: Math.max(0, Number(prog.percent || 0)),
        message: "Bu etkinliği tamamladınız."
      });
      return;
    }
  }
  const contentDoc = await getDoc(doc(db, "contents", assignment.contentId));
  if (!contentDoc.exists()) {
    showNotice("İçerik bulunamadı!", "#e74c3c");
    return;
  }
  const content = { id: contentDoc.id, ...contentDoc.data() };
  if (userRole === "student") {
    openActivityModal(content, { readOnly: isExpired });
  } else {
    if (contentModal) contentModal.style.display = "flex";
    if (contentModal) contentModal.classList.add("fullscreen");
    const left = document.querySelector("#content-modal .content-left");
    if (left) left.style.display = "none";
    selectContentForView(content, { readOnly: isExpired });
  }
}

function getAssignmentAppProgress(assignment) {
  const progress = contentProgressMap.get(assignment.contentId);
  if (!progress?.appUsage) return { percent: 0, seconds: 0 };
  const content = allContents.find(c => c.id === assignment.contentId);
  const appItems = (content?.items || []).filter(it => it.type === "app");
  let best = 0;
  let bestSeconds = 0;
  if (appItems.length) {
    appItems.forEach((it) => {
      const u = progress.appUsage[it.id];
      const p = u?.percent || 0;
      if (p > best) {
        best = p;
        bestSeconds = u?.seconds || 0;
      }
    });
  } else {
    Object.values(progress.appUsage).forEach((u) => {
      const p = u?.percent || 0;
      if (p > best) {
        best = p;
        bestSeconds = u?.seconds || 0;
      }
    });
  }
  return { percent: best, seconds: bestSeconds };
}

function updateActivityLists() {
  const pendingList = document.getElementById("list-activity-pending");
  const completedList = document.getElementById("list-activity-completed");
  const noPending = document.getElementById("no-activity-pending");
  const noCompleted = document.getElementById("no-activity-completed");
  if (!pendingList || !completedList) return;

  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  let assignments = contentAssignments.slice();
  if (userRole === "student") {
    assignments = assignments
      .filter(assignmentMatchesStudent)
      .filter((assignment) => {
        if (!assignment?.isDeleted) return true;
        const progress = contentProgressMap.get(assignment.contentId);
        const appUsage = progress?.appUsage || {};
        const hasUsage = Object.values(appUsage).some((u) => Number(u?.seconds || 0) > 0 || Number(u?.percent || 0) > 0 || Number(u?.xp || 0) > 0);
        const hasItems = (progress?.completedItemIds?.length || 0) > 0;
        return !!progress && (hasUsage || hasItems);
      });
  } else {
    assignments = assignments.filter((a) => matchesActivityFilter(a));
  }

  let pendingCount = 0;
  let completedCount = 0;
  const pendingRows = [];
  const completedRows = [];

  const now = new Date();
    assignments.forEach((assignment) => {
      const progress = contentProgressMap.get(assignment.contentId);
      const totalItems = progress?.totalItems || assignment.totalItems || 0;
      const completedItems = progress?.completedItemIds?.length || 0;
  let partial = 0;
  if (progress?.appUsage) {
    Object.values(progress.appUsage).forEach((u) => {
      const p = Math.max(0, Math.min(100, u?.percent || 0));
      partial += p / 100;
    });
  }
      const effectiveCompleted = Math.min(totalItems, completedItems + partial);
      let percent = totalItems > 0 ? Math.round((effectiveCompleted / totalItems) * 100) : 0;
      let isCompleted = totalItems > 0 && percent >= 80;
      
      if (userRole === "student") {
        const prog = getAssignmentAppProgress(assignment);
        if (prog.percent > 0) {
          percent = prog.percent;
          isCompleted = true;
        }
      }
    const deadlineDate = getAssignmentDeadlineDate(assignment);
    const isExpired = deadlineDate ? deadlineDate < now : false;

    const li = document.createElement("li");
    li.className = "list-item" + (isCompleted ? " completed" : "");
      let rightBadges = `<span class="badge ${isCompleted ? "badge-success" : isExpired ? "badge-danger" : "badge-pending"}">
          ${isExpired && !isCompleted ? "Süresi Doldu" : `%${percent}`}
        </span>`;
      if (userRole === "student") {
        let label = "Başlanmadı";
        let cls = "badge-pending";
        if (isCompleted) {
          label = "Tamamlandı";
          cls = "badge-success";
        } else if (percent >= 100) {
          label = "Tamamlandı";
          cls = "badge-success";
        } else if (percent >= 60) {
          label = "İlerliyor";
          cls = "badge-mid";
        } else if (percent > 0) {
          label = "Başlandı";
          cls = "badge-progress";
        }
        rightBadges = `
          <span class="badge ${isExpired && !isCompleted ? "badge-danger" : "badge-info"}">%${percent}</span>
          <span class="badge ${isExpired && !isCompleted ? "badge-danger" : cls}">${isExpired && !isCompleted ? "Süresi Doldu" : label}</span>
        `;
      }
      if (userRole === "teacher") {
        const count = activityProgressMap.get(assignment.contentId) || 0;
        const totalStudents = allStudents?.length || 0;
        rightBadges = `
          <span class="badge ${isExpired ? "badge-danger" : "badge-info"}">
            ${count}${totalStudents ? "/" + totalStudents : ""} Tamamlama
          </span>
          ${isExpired ? `<span class="badge badge-danger">Süresi Doldu</span>` : ""}
        `;
      }
      li.innerHTML = `
        <div style="flex:1;">
          <div style="font-weight:600;">${assignment.title || "Etkinlik"}</div>
          <small style="color:#666;">📅 ${assignment.createdAtDate.toLocaleDateString("tr-TR")}${deadlineDate ? ` • Son: ${deadlineDate.toLocaleDateString("tr-TR")}` : ""}</small>
        </div>
        <div style="display:flex; gap:6px; align-items:center;">${rightBadges}</div>
      `;
      if (userRole === "student") {
        li.onclick = () => openAssignedContent(assignment);
      }

      if (userRole === "teacher") {
        pendingRows.push(li);
        pendingCount++;
      } else {
        if (isCompleted) {
          completedRows.push(li);
          completedCount++;
        } else {
          pendingRows.push(li);
          pendingCount++;
        }
      }
      if (userRole === "teacher") {
        li.onclick = () => openAssignmentEditor(assignment);
      }
  });

  if (noPending) noPending.style.display = pendingCount === 0 ? "block" : "none";
  if (noCompleted) noCompleted.style.display = completedCount === 0 ? "block" : "none";
    renderLimitedRows(pendingList, pendingRows, 3);
    renderLimitedRows(completedList, completedRows, 3);
    homeListCache.activities = {
      title: userRole === "teacher" ? "Verilen Etkinlikler" : "Etkinliklerim",
      pending: pendingRows.slice(),
      completed: completedRows.slice()
    };
    setShowMoreButton(
      "btn-show-all-activities",
      pendingRows.length > 3 || completedRows.length > 3,
      () => openAllItemsModal(homeListCache.activities.title, homeListCache.activities.pending, homeListCache.activities.completed)
    );
    if (userRole === "teacher") {
      const el = document.getElementById("teacher-activity-count");
      if (el) el.innerText = assignments.length;
    } else {
      const el = document.getElementById("stat-activity-completed");
      if (el) el.innerText = completedCount;
    }

    // öğretmen butonları kaldırıldı
    renderStudentCombinedSections();
    renderHomeOverviewStrip();
}

function formatMinutesSeconds(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds || 0));
  if (!safe) return "";
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${mins} dk ${secs} sn`;
}

function buildCompletionInfoHTML({ category = "İçerik", title = "", xp = 0, seconds = 0, percent = null, message = "" } = {}) {
  const safeCategory = String(category || "İçerik");
  const safeTitle = escapeHtml(String(title || safeCategory));
  const safeMessage = escapeHtml(String(message || `Bu ${safeCategory.toLowerCase()} tamamladınız.`));
  const safeXP = Math.max(0, Math.round(Number(xp || 0)));
  const safeSeconds = Math.max(0, Math.round(Number(seconds || 0)));
  const safePercent = Number.isFinite(Number(percent)) ? Math.max(0, Math.min(100, Math.round(Number(percent)))) : null;
  const timeText = safeSeconds > 0 ? formatMinutesSeconds(safeSeconds) : "Yok";
  const percentText = safePercent !== null ? `%${safePercent}` : "Yok";
  return `
    <div class="completion-info-card">
      <div class="completion-info-title">${safeTitle}</div>
      <div class="completion-info-subtitle">${safeMessage}</div>
      <div class="completion-info-grid">
        <div class="completion-info-item">
          <div class="k">Kazanılan XP</div>
          <div class="v">${safeXP} XP</div>
        </div>
        <div class="completion-info-item">
          <div class="k">Geçirilen Süre</div>
          <div class="v">${escapeHtml(timeText)}</div>
        </div>
        <div class="completion-info-item">
          <div class="k">İlerleme</div>
          <div class="v">${escapeHtml(percentText)}</div>
        </div>
      </div>
    </div>
  `;
}

async function showCompletionInfoPopup({ category = "İçerik", title = "", xp = 0, seconds = 0, percent = null, message = "" } = {}) {
  const html = buildCompletionInfoHTML({ category, title, xp, seconds, percent, message });
  await infoDialog(html, {
    allowHtml: true,
    title: "Tamamlandı Bilgisi",
    iconText: "✅",
    iconBg: "#dcfce7",
    iconColor: "#15803d",
    showContinue: false,
    okText: "Tamam"
  });
}

function getAssignmentCompletionXP(assignment) {
  const progress = contentProgressMap.get(assignment?.contentId) || {};
  const totalXP = Math.max(0, Number(progress?.totalXP || 0));
  const appXP = Object.values(progress?.appUsage || {}).reduce((maxVal, u) => {
    return Math.max(maxVal, Math.max(0, Number(u?.xp || 0)));
  }, 0);
  return Math.max(totalXP, appXP);
}

function confirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    confirmResolve = resolve;
    const msg = document.getElementById("confirm-message");
    if (msg) msg.innerText = message || "Emin misiniz?";
    const yesBtn = document.getElementById("btn-confirm-yes");
    const noBtn = document.getElementById("btn-confirm-no");
    if (yesBtn) {
      yesBtn.innerText = options.yesText || "Evet, Sil";
      yesBtn.className = options.yesClass || "btn btn-danger";
      yesBtn.style.flex = "1";
    }
    if (noBtn) {
      noBtn.innerText = options.noText || "Vazgeç";
      noBtn.className = "btn";
      noBtn.style.flex = "1";
      noBtn.style.background = "#eee";
    }
    const modal = document.getElementById("confirm-modal");
    if (modal) modal.style.display = "flex";
    pauseActivityTimer();
  });
}

function infoDialog(message, options = {}) {
  return new Promise((resolve) => {
    infoResolve = resolve;
    const msg = document.getElementById("info-message");
    if (msg) {
      if (options.allowHtml) msg.innerHTML = message || "Bilgi";
      else msg.innerText = message || "Bilgi";
    }
    const titleEl = document.getElementById("info-title");
    if (titleEl) titleEl.innerText = options.title || "Bilgi";
    const iconEl = document.getElementById("info-icon");
    if (iconEl) {
      iconEl.innerText = options.iconText || "i";
      iconEl.style.background = options.iconBg || "#e0f2fe";
      iconEl.style.color = options.iconColor || "#0284c7";
    }
    const shellEl = document.getElementById("info-modal-shell");
    if (shellEl) {
      shellEl.className = "modal-content info-shell";
      if (options.shellClass) shellEl.classList.add(String(options.shellClass));
    }
    const okBtn = document.getElementById("btn-info-ok");
    const contBtn = document.getElementById("btn-info-continue");
    if (okBtn) {
      okBtn.innerText = options.okText || "Tamam";
      okBtn.className = options.okClass || "btn btn-primary";
      okBtn.style.background = options.okBg || "";
      okBtn.style.color = options.okColor || "";
      okBtn.style.flex = "1";
    }
    if (contBtn) {
      const continueLabel = options.continueText || "Devam Et";
      contBtn.innerHTML = options.continueHtml || `<span class="play-ico">▶</span>`;
      contBtn.className = options.continueClass || "btn btn-continue-play";
      contBtn.style.background = options.continueBg || "";
      contBtn.style.color = options.continueColor || "";
      contBtn.style.flex = "1";
      contBtn.style.display = options.showContinue ? "inline-flex" : "none";
      contBtn.title = continueLabel;
      contBtn.setAttribute("aria-label", continueLabel);
    }
    const modal = document.getElementById("info-modal");
    if (modal) modal.style.display = "flex";
    pauseActivityTimer();
  });
}

async function saveSessionTime() {
  if (!currentUserId || !sessionStart) return;
  const elapsed = Math.max(0, Math.round((Date.now() - sessionStart) / 1000));
  sessionStart = null;
  if (elapsed <= 0) return;
  try {
    await updateDoc(doc(db, "users", currentUserId), { totalTimeSeconds: increment(elapsed) });
    baseSystemSeconds = (baseSystemSeconds || 0) + elapsed;
    updateSystemTimeUI();
    if (currentUserKey) {
      localStorage.setItem(currentUserKey, String(baseSystemSeconds));
    }
  } catch (e) {
    console.error("Süre kaydı hatası:", e);
  }
}

if (!window._sessionSaveBound) {
  window._sessionSaveBound = true;
  window.addEventListener("beforeunload", () => {
    flushSessionToLocal();
    saveSessionTime();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      flushSessionToLocal();
    }
  });
}

function openActivityModal(content, options = {}) {
  const modal = document.getElementById("activity-modal");
  if (!modal) return;
  modal.classList.remove("block-runner-mode");
  modal.classList.remove("teacher-block-runner");
  const appItem = (content.items || []).find(it => it.type === "app");
  const titleEl = document.getElementById("activity-title");
  const linkEl = document.getElementById("activity-link");
  if (titleEl) titleEl.innerText = appItem?.appTitle || "Uygulama";
  if (linkEl) linkEl.innerText = appItem?.appLink || "Link yok";
  const closeBtn = document.getElementById("btn-close-activity");
  if (closeBtn) closeBtn.innerText = "Kapat";
  const topTitle = document.querySelector("#activity-modal .modal-header h2");
  if (topTitle) topTitle.innerText = "Etkinlik";
  modal.style.display = "flex";
  const overlay = document.getElementById("external-app-overlay");
  if (overlay) overlay.style.display = "none";
  if (appItem) {
    activitySession = {
      content,
      item: appItem,
      options,
      elapsedBefore: 0,
      baseSeconds: 0,
      running: false
    };
  } else {
    activitySession = null;
  }
  setActivityStartButtons(false);
  updateActivityTimerUI();
}

document.getElementById("btn-activity-start").onclick = async function () {
  if (!activitySession) return;
  await startActivitySession();
};

async function loadBookTaskApprovals(task) {
  const list = document.getElementById("book-approval-list");
  if (!list) return;
  list.innerHTML = "<div class='loading'>Öğrenciler yükleniyor...</div>";
  const classFilter = document.getElementById("book-approve-class");
  const sectionFilter = document.getElementById("book-approve-section");
  const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
  const studentsRaw = [];
  studentsSnap.forEach((docSnap) => studentsRaw.push({ id: docSnap.id, ...docSnap.data() }));
  const students = scopeStudentsForCurrentRole(studentsRaw);
  const classVal = classFilter?.value || "";
  const sectionVal = sectionFilter?.value || "";
  const filtered = students.filter(s => {
    if (classVal && s.className !== classVal) return false;
    if (sectionVal && s.section !== sectionVal) return false;
    return assignmentMatchesStudentFor({
      targetClass: task.targetClass || "",
      targetSection: task.targetSection || ""
    }, s);
  });
  const progSnap = await getDocs(query(collection(db, "bookTaskProgress"), where("taskId", "==", task.id)));
  const progressMap = new Map();
  progSnap.forEach((docSnap) => progressMap.set(docSnap.data().userId, docSnap.data()));

  list.innerHTML = "";
  if (filtered.length === 0) {
    list.innerHTML = "<div class='empty-state'>Öğrenci bulunamadı.</div>";
    return;
  }
  filtered.forEach((s) => {
    const prog = progressMap.get(s.id);
    const status = prog?.status || "none";
    const approved = !!prog?.approved;
    const label = status === "finished" ? "Yaptı" : status === "started" ? "Başladı" : "Yapmadı";
    const badgeClass = status === "finished" ? "badge-success" : status === "started" ? "badge-info" : "badge-pending";
    const row = document.createElement("div");
    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px dashed #e5e7eb;";
    row.innerHTML = `
      <div>
        <strong>${getUserDisplayName(s)}</strong>
        <small style="display:block; color:#666;">
          <span class="badge ${badgeClass}">${label}</span>
        </small>
      </div>
      <label style="display:flex; align-items:center; gap:6px;">
        <input type="checkbox" class="book-approve-checkbox" data-user="${s.id}" ${approved ? "checked" : ""} ${status === "finished" ? "" : "disabled"}>
        Onay
      </label>
    `;
    list.appendChild(row);
  });
}

document.getElementById("btn-book-approve").onclick = async function () {
  if (!currentTaskId) return;
  const checks = Array.from(document.querySelectorAll(".book-approve-checkbox"));
  const rows = checks.map((chk) => ({
    userId: chk.getAttribute("data-user"),
    approved: chk.checked
  }));
  try {
    const stats = await applyManualTaskApprovals(currentTaskId, rows);
    showNotice(`Onaylar güncellendi. +${MANUAL_TASK_APPROVAL_XP} XP verilen öğrenci: ${stats.xpGrantedCount}`, "#2ecc71");
    const task = allTasks.find((t) => t.id === currentTaskId);
    if (task) await loadBookTaskApprovals(task);
    if (userRole === "teacher") loadStatsPage();
    renderHomeOverviewStrip();
  } catch (e) {
    showNotice("Onay güncelleme hatası: " + e.message, "#e74c3c");
  }
};

const btnBookStarted = document.getElementById("btn-book-started");
if (btnBookStarted) {
  btnBookStarted.onclick = async function () {
    if (!currentTaskId) return;
    const task = allTasks.find(t => t.id === currentTaskId);
    if (!task) return;
    await saveBookTaskProgress(task, "started");
    const bookStatus = document.getElementById("book-task-status");
    if (bookStatus) bookStatus.innerText = "Durum: Başlandı";
    showNotice("Başlandı olarak kaydedildi.", "#4a90e2");
  };
}
const btnBookFinished = document.getElementById("btn-book-finished");
if (btnBookFinished) {
  btnBookFinished.onclick = async function () {
    if (!currentTaskId) return;
    const task = allTasks.find(t => t.id === currentTaskId);
    if (!task) return;
    await saveBookTaskProgress(task, "finished");
    const bookStatus = document.getElementById("book-task-status");
    const doneText = isBookOnlyTask(task) ? "Bitirdi" : "Yaptı";
    if (bookStatus) bookStatus.innerText = `Durum: ${doneText} (Onay Bekliyor)`;
    showNotice(`${doneText} olarak kaydedildi. Öğretmen onayı bekleniyor.`, "#2ecc71");
  };
}

async function populateClassSectionFilters(classSelect, sectionSelect) {
  if (!classSelect || !sectionSelect) return;
  classSelect.innerHTML = `<option value="">Sınıf</option>`;
  sectionSelect.innerHTML = `<option value="">Şube</option>`;
  const classMap = new Map();
  let source = allStudents;
  if (!source || source.length === 0) {
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
    source = [];
    snap.forEach((d) => source.push({ id: d.id, ...d.data() }));
  }
  source = scopeStudentsForCurrentRole(source);
  source.forEach((s) => {
    if (!s.className) return;
    if (!classMap.has(s.className)) classMap.set(s.className, new Set());
    if (s.section) classMap.get(s.className).add(s.section);
  });
  Array.from(classMap.keys()).sort().forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    classSelect.appendChild(opt);
  });
  classSelect.onchange = function () {
    sectionSelect.innerHTML = `<option value="">Şube</option>`;
    const cls = classSelect.value;
    if (!cls) return;
    const sections = classMap.get(cls) || new Set();
    Array.from(sections).sort().forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      sectionSelect.appendChild(opt);
    });
  };
}

async function loadApprovalsModal() {
  const taskSelect = document.getElementById("approvals-task-select");
  const list = document.getElementById("approvals-list");
  if (!taskSelect || !list) return;
  taskSelect.innerHTML = `<option value="">Onaylı ödev seçiniz</option>`;
  const approvalTasks = allTasks.filter(t => requiresTeacherApprovalTask(t));
  approvalTasks.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.title || "Ödev";
    taskSelect.appendChild(opt);
  });
  const classSel = document.getElementById("approvals-class");
  const sectionSel = document.getElementById("approvals-section");
  await populateClassSectionFilters(classSel, sectionSel);
  list.innerHTML = "<div class='empty-state'>Ödev seçiniz.</div>";
}

async function renderApprovalsList(taskId) {
  const list = document.getElementById("approvals-list");
  if (!list) return;
  list.innerHTML = "<div class='loading'>Öğrenciler yükleniyor...</div>";
  const task = allTasks.find(t => t.id === taskId);
  if (!task) {
    list.innerHTML = "<div class='empty-state'>Ödev bulunamadı.</div>";
    return;
  }
  const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
  const studentsRaw = [];
  studentsSnap.forEach((docSnap) => studentsRaw.push({ id: docSnap.id, ...docSnap.data() }));
  const students = scopeStudentsForCurrentRole(studentsRaw);
  const classVal = document.getElementById("approvals-class")?.value || "";
  const sectionVal = document.getElementById("approvals-section")?.value || "";
  const filtered = students.filter(s => {
    if (classVal && s.className !== classVal) return false;
    if (sectionVal && s.section !== sectionVal) return false;
    return assignmentMatchesStudentFor({
      targetClass: task.targetClass || "",
      targetSection: task.targetSection || ""
    }, s);
  });
  const progSnap = await getDocs(query(collection(db, "bookTaskProgress"), where("taskId", "==", task.id)));
  const progressMap = new Map();
  progSnap.forEach((docSnap) => progressMap.set(docSnap.data().userId, docSnap.data()));
  list.innerHTML = "";
  if (filtered.length === 0) {
    list.innerHTML = "<div class='empty-state'>Öğrenci bulunamadı.</div>";
    return;
  }
  filtered.forEach((s) => {
    const prog = progressMap.get(s.id);
    const status = prog?.status || "none";
    const approved = !!prog?.approved;
    const label = status === "finished" ? "Yaptı" : status === "started" ? "Başladı" : "Yapmadı";
    const badgeClass = status === "finished" ? "badge-success" : status === "started" ? "badge-info" : "badge-pending";
    const row = document.createElement("div");
    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px dashed #e5e7eb;";
    row.innerHTML = `
      <div>
        <strong>${getUserDisplayName(s)}</strong>
        <small style="display:block; color:#666;">
          <span class="badge ${badgeClass}">${label}</span>
        </small>
      </div>
      <label style="display:flex; align-items:center; gap:6px;">
        <input type="checkbox" class="approval-checkbox" data-user="${s.id}" ${approved ? "checked" : ""} ${status === "finished" ? "" : "disabled"}>
        Onay
      </label>
    `;
    list.appendChild(row);
  });
}

const approvalsTaskSelect = document.getElementById("approvals-task-select");
if (approvalsTaskSelect) {
  approvalsTaskSelect.onchange = function () {
    const taskId = approvalsTaskSelect.value;
    if (taskId) renderApprovalsList(taskId);
  };
}
const approvalsClass = document.getElementById("approvals-class");
const approvalsSection = document.getElementById("approvals-section");
if (approvalsClass) approvalsClass.onchange = function () {
  const taskId = approvalsTaskSelect?.value;
  if (taskId) renderApprovalsList(taskId);
};
if (approvalsSection) approvalsSection.onchange = function () {
  const taskId = approvalsTaskSelect?.value;
  if (taskId) renderApprovalsList(taskId);
};

const bookApproveClass = document.getElementById("book-approve-class");
const bookApproveSection = document.getElementById("book-approve-section");
if (bookApproveClass) bookApproveClass.onchange = function () {
  const task = allTasks.find(t => t.id === currentTaskId);
  if (task) loadBookTaskApprovals(task);
};
if (bookApproveSection) bookApproveSection.onchange = function () {
  const task = allTasks.find(t => t.id === currentTaskId);
  if (task) loadBookTaskApprovals(task);
};

const assignmentFilterClass = document.getElementById("assignment-filter-class");
const assignmentFilterSection = document.getElementById("assignment-filter-section");
if (assignmentFilterClass) assignmentFilterClass.onchange = function () {
  const assignment = contentAssignments.find(a => a.id === currentAssignmentId);
  if (assignment) renderAssignmentStudentsList(assignment);
};
if (assignmentFilterSection) assignmentFilterSection.onchange = function () {
  const assignment = contentAssignments.find(a => a.id === currentAssignmentId);
  if (assignment) renderAssignmentStudentsList(assignment);
};

const taskStudentsFilterClass = document.getElementById("task-students-filter-class");
const taskStudentsFilterSection = document.getElementById("task-students-filter-section");
if (taskStudentsFilterClass) taskStudentsFilterClass.onchange = function () {
  const task = allTasks.find(t => t.id === currentTaskStudentsId);
  if (task) renderTaskStudentsList(task);
};
if (taskStudentsFilterSection) taskStudentsFilterSection.onchange = function () {
  const task = allTasks.find(t => t.id === currentTaskStudentsId);
  if (task) renderTaskStudentsList(task);
};

const approvalsApproveBtn = document.getElementById("btn-approvals-approve");
if (approvalsApproveBtn) {
  approvalsApproveBtn.onclick = async function () {
    const taskId = approvalsTaskSelect?.value;
    if (!taskId) {
      showNotice("Ödev seçin!", "#e74c3c");
      return;
    }
    const checks = Array.from(document.querySelectorAll(".approval-checkbox"));
    const rows = checks.map((chk) => ({
      userId: chk.getAttribute("data-user"),
      approved: chk.checked
    }));
    try {
      const stats = await applyManualTaskApprovals(taskId, rows);
      showNotice(`Onaylar güncellendi. +${MANUAL_TASK_APPROVAL_XP} XP verilen öğrenci: ${stats.xpGrantedCount}`, "#2ecc71");
      await renderApprovalsList(taskId);
      if (userRole === "teacher") loadStatsPage();
      renderHomeOverviewStrip();
    } catch (e) {
      showNotice("Onay güncelleme hatası: " + e.message, "#e74c3c");
    }
  };
}

const userMenuTriggerBtn = document.getElementById("user-menu-trigger");
if (userMenuTriggerBtn) {
  userMenuTriggerBtn.onclick = function (e) {
    e.stopPropagation();
    const dropdown = document.getElementById("user-dropdown");
    if (dropdown) {
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    }
  };
}
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("user-dropdown");
  const menu = document.getElementById("user-menu");
  if (dropdown && menu && !menu.contains(e.target)) {
    dropdown.style.display = "none";
  }
  const sideMenu = document.getElementById("side-menu");
  const openBtn = document.getElementById("open-menu");
  if (sideMenu && openBtn) {
    const isOpen = sideMenu.style.width && sideMenu.style.width !== "0px" && sideMenu.style.width !== "0";
    if (isOpen && !sideMenu.contains(e.target) && !openBtn.contains(e.target)) {
      closeSidebarMenu();
    }
  }
});
const logoutMenuBtn = document.getElementById("btn-logout-menu");
if (logoutMenuBtn) {
  logoutMenuBtn.onclick = async function () {
    await handleUserLogout({ closeSideMenu: true, closeDropdown: true });
  };
}
document.getElementById("btn-activity-save").onclick = async function () {
  if (currentRunnerType === "compute" || currentRunnerType === "block" || currentRunnerType === "block3d") {
    const shouldClose = isRunnerCompletionHandled();
    if (currentRunnerType === "compute") {
      if (!computeRunnerSession) return;
      pauseComputeRunnerTimer();
      await saveComputeRunnerSession({ closeAfter: shouldClose, askContinue: !shouldClose });
      return;
    }
    if (currentRunnerType === "block3d") {
      if (!block3DRunnerSession) return;
      await saveBlock3DRunnerSession({ closeAfter: shouldClose, askContinue: !shouldClose });
      return;
    }
    if (!blockRunnerSession) return;
    pauseBlockRunnerTimer();
    await saveBlockRunnerSession({ closeAfter: shouldClose, askContinue: !shouldClose });
    return;
  }
  await stopActivitySession({ action: "save", showMessage: true, allowContinue: true, askContinue: true });
};
document.getElementById("btn-activity-fullscreen").onclick = function () {
  const modal = document.getElementById("activity-modal");
  if (modal) modal.classList.add("fullscreen");
  const bar = document.getElementById("activity-fullbar");
  if (bar) bar.style.display = "flex";
};
document.getElementById("btn-activity-exit").onclick = function () {
  const modal = document.getElementById("activity-modal");
  if (modal) modal.classList.remove("fullscreen");
  const bar = document.getElementById("activity-fullbar");
  if (bar) bar.style.display = "none";
  stopActivitySession({ action: "exit", showMessage: true, allowContinue: true, askContinue: true });
};
document.getElementById("btn-activity-full-exit").onclick = function () {
  if (currentRunnerType === "line-trace") {
    closeBlockRunnerView();
    return;
  }
  exitActivityFullscreen();
};
document.getElementById("btn-activity-full-start").onclick = async function () {
  if (!activitySession) return;
  await startActivitySession();
};
document.getElementById("btn-activity-full-save").onclick = async function () {
  if (currentRunnerType === "compute" || currentRunnerType === "block" || currentRunnerType === "block3d") {
    const shouldClose = isRunnerCompletionHandled();
    if (currentRunnerType === "compute") {
      if (!computeRunnerSession) return;
      pauseComputeRunnerTimer();
      const ok = await saveComputeRunnerSession({ closeAfter: shouldClose, askContinue: !shouldClose });
      if (ok && shouldClose) exitActivityFullscreen();
      return;
    }
    if (currentRunnerType === "block3d") {
      if (!block3DRunnerSession) return;
      const ok = await saveBlock3DRunnerSession({ closeAfter: shouldClose, askContinue: !shouldClose });
      if (ok && shouldClose) exitActivityFullscreen();
      return;
    }
    if (!blockRunnerSession) return;
    pauseBlockRunnerTimer();
    const ok = await saveBlockRunnerSession({ closeAfter: shouldClose, askContinue: !shouldClose });
    if (ok && shouldClose) exitActivityFullscreen();
    return;
  }
  const ok = await stopActivitySession({ action: "save", showMessage: true, allowContinue: true, askContinue: true });
  if (ok) exitActivityFullscreen();
};
document.getElementById("btn-activity-resume").onclick = async function () {
  const modal = document.getElementById("activity-modal");
  if (modal?.classList.contains("block-runner-mode")) {
    if (currentRunnerType === "compute") {
      if (!computeRunnerSession) return;
      resumeComputeRunnerTimer();
      return;
    }
    if (!blockRunnerSession) return;
    resumeBlockRunnerTimer();
    if (!blockRunnerSession.hasTriggeredRun) {
      const iframe = document.getElementById("activity-iframe");
      try {
        iframe?.contentWindow?.postMessage({ type: "RUN" }, "*");
      } catch (e) {
        console.warn("block runner run signal failed", e);
      }
      blockRunnerSession.hasTriggeredRun = true;
    }
    return;
  }
  await startActivitySession();
};

const activityHeadStartBtn = document.getElementById("btn-activity-head-start");
if (activityHeadStartBtn) {
  activityHeadStartBtn.onclick = async function () {
    if (currentRunnerType === "compute") {
      if (!computeRunnerSession) return;
      if (computeRunnerSession.running) {
        pauseComputeRunnerTimer();
      } else {
        resumeComputeRunnerTimer();
      }
      return;
    }
    if (!blockRunnerSession) return;
    if (blockRunnerSession.running) {
      pauseBlockRunnerTimer();
      return;
    }
    resumeBlockRunnerTimer();
    if (!blockRunnerSession.hasTriggeredRun) {
      const iframe = document.getElementById("activity-iframe");
      try {
        iframe?.contentWindow?.postMessage({ type: "RUN" }, "*");
      } catch (e) {
        console.warn("block runner run signal failed", e);
      }
      blockRunnerSession.hasTriggeredRun = true;
    }
  };
}
const activityHeadFullBtn = document.getElementById("btn-activity-head-fullscreen");
if (activityHeadFullBtn) {
  activityHeadFullBtn.onclick = function () {
    const modal = document.getElementById("activity-modal");
    if (modal) modal.classList.add("fullscreen");
    const bar = document.getElementById("activity-fullbar");
    if (bar) bar.style.display = "flex";
  };
}
const activityHeadSaveBtn = document.getElementById("btn-activity-head-save");
if (activityHeadSaveBtn) {
  activityHeadSaveBtn.onclick = async function () {
    const shouldClose = isRunnerCompletionHandled();
    if (currentRunnerType === "compute") {
      if (!computeRunnerSession) return;
      pauseComputeRunnerTimer();
      await saveComputeRunnerSession({ closeAfter: shouldClose, askContinue: !shouldClose });
      return;
    }
    if (currentRunnerType === "block3d") {
      if (!block3DRunnerSession) return;
      await saveBlock3DRunnerSession({ closeAfter: shouldClose, askContinue: !shouldClose });
      return;
    }
    if (!blockRunnerSession) return;
    pauseBlockRunnerTimer();
    await saveBlockRunnerSession({ closeAfter: shouldClose, askContinue: !shouldClose });
  };
}
const activityHeadExitBtn = document.getElementById("btn-activity-head-exit");
if (activityHeadExitBtn) {
  activityHeadExitBtn.onclick = async function () {
    const shouldClose = isRunnerCompletionHandled();
    if (currentRunnerType === "compute") {
      if (!computeRunnerSession) {
        closeBlockRunnerView();
        return;
      }
      pauseComputeRunnerTimer();
      await saveComputeRunnerSession({ closeAfter: true, askContinue: !shouldClose });
      return;
    }
    if (currentRunnerType === "block3d") {
      if (!block3DRunnerSession) {
        closeBlockRunnerView();
        return;
      }
      await saveBlock3DRunnerSession({ closeAfter: true, askContinue: !shouldClose });
      return;
    }
    if (!blockRunnerSession) {
      closeBlockRunnerView();
      return;
    }
    pauseBlockRunnerTimer();
    await saveBlockRunnerSession({ closeAfter: true, askContinue: !shouldClose });
  };
}
const activityHeadAddLevelBtn = document.getElementById("btn-activity-head-add-level");
if (activityHeadAddLevelBtn) {
  activityHeadAddLevelBtn.onclick = function () {
    if (userRole !== "teacher") return;
    const iframe = document.getElementById("activity-iframe");
    try {
      iframe?.contentWindow?.postMessage({ type: "OPEN_DESIGNER" }, "*");
    } catch (e) {
      showNotice("Seviye ekleme penceresi açılamadı.", "#e74c3c");
    }
  };
}
const activityHeadEditLevelBtn = document.getElementById("btn-activity-head-edit-level");
if (activityHeadEditLevelBtn) {
  activityHeadEditLevelBtn.onclick = function () {
    if (userRole !== "teacher") return;
    const iframe = document.getElementById("activity-iframe");
    try {
      iframe?.contentWindow?.postMessage({ type: "OPEN_EDIT_LEVEL" }, "*");
    } catch (e) {
      showNotice("Seviye düzenleme penceresi açılamadı.", "#e74c3c");
    }
  };
}
const activityHeadDeleteLevelBtn = document.getElementById("btn-activity-head-delete-level");
if (activityHeadDeleteLevelBtn) {
  activityHeadDeleteLevelBtn.onclick = function () {
    if (userRole !== "teacher") return;
    const iframe = document.getElementById("activity-iframe");
    try {
      iframe?.contentWindow?.postMessage({ type: "OPEN_DELETE_LEVEL" }, "*");
    } catch (e) {
      showNotice("Seviye silme penceresi açılamadı.", "#e74c3c");
    }
  };
}
const activityHeadMoveUpBtn = document.getElementById("btn-activity-head-move-up");
if (activityHeadMoveUpBtn) {
  activityHeadMoveUpBtn.onclick = function () {
    if (userRole !== "teacher") return;
    const iframe = document.getElementById("activity-iframe");
    try {
      iframe?.contentWindow?.postMessage({ type: "MOVE_LEVEL_UP" }, "*");
    } catch (e) {
      showNotice("Seviye yukarı taşınamadı.", "#e74c3c");
    }
  };
}
const activityHeadMoveDownBtn = document.getElementById("btn-activity-head-move-down");
if (activityHeadMoveDownBtn) {
  activityHeadMoveDownBtn.onclick = function () {
    if (userRole !== "teacher") return;
    const iframe = document.getElementById("activity-iframe");
    try {
      iframe?.contentWindow?.postMessage({ type: "MOVE_LEVEL_DOWN" }, "*");
    } catch (e) {
      showNotice("Seviye aşağı taşınamadı.", "#e74c3c");
    }
  };
}

const externalSaveBtn = document.getElementById("btn-external-save");
if (externalSaveBtn) {
  externalSaveBtn.onclick = async function () {
    const ok = await stopActivitySession({ action: "save", showMessage: true, allowContinue: true, askContinue: true });
    if (ok) {
      const overlay = document.getElementById("external-app-overlay");
      if (overlay) overlay.style.display = "none";
    }
  };
}
const externalCloseBtn = document.getElementById("btn-external-close");
if (externalCloseBtn) {
  externalCloseBtn.onclick = function () {
    const overlay = document.getElementById("external-app-overlay");
    if (overlay) overlay.style.display = "none";
  };
}
const externalOpenBtn = document.getElementById("btn-external-open");
if (externalOpenBtn) {
  externalOpenBtn.onclick = function () {
    const link = activitySession?.item?.appLink || "";
    if (!link) {
      showNotice("Uygulama linki yok!", "#e74c3c");
      return;
    }
    const w = window.open(link, "_blank");
    if (!w) {
      showNotice("Tarayıcı yeni sekmeyi engelledi. Pop-up izni verin.", "#e74c3c");
    }
  };
}
const activityOpenTabBtn = document.getElementById("btn-activity-open-tab");
if (activityOpenTabBtn) {
  activityOpenTabBtn.onclick = function () {
    if (!activitySession?.item?.appLink) {
      showNotice("Uygulama linki yok!", "#e74c3c");
      return;
    }
    window.open(activitySession.item.appLink, "_blank");
    const overlay = document.getElementById("external-app-overlay");
    if (overlay) overlay.style.display = "flex";
  };
}
const activityFullOpenTabBtn = document.getElementById("btn-activity-full-open-tab");
if (activityFullOpenTabBtn) {
  activityFullOpenTabBtn.onclick = function () {
    if (!activitySession?.item?.appLink) {
      showNotice("Uygulama linki yok!", "#e74c3c");
      return;
    }
    window.open(activitySession.item.appLink, "_blank");
    const overlay = document.getElementById("external-app-overlay");
    if (overlay) overlay.style.display = "flex";
  };
}

function setActivityStartButtons(running) {
  const text = running ? "Duraklat" : "Başlat";
  const btn = document.getElementById("btn-activity-start");
  const btnFull = document.getElementById("btn-activity-full-start");
  const btnHead = document.getElementById("btn-activity-head-start");
  if (btn) {
    btn.innerText = text;
    btn.classList.toggle("paused", running);
  }
  if (btnFull) {
    btnFull.innerText = text;
    btnFull.classList.toggle("paused", running);
  }
  if (btnHead) {
    btnHead.innerText = text;
    btnHead.classList.toggle("paused", running);
  }
}

function setActivityPausedUI(paused) {
  const right = document.querySelector("#activity-modal .activity-right");
  if (right) right.classList.toggle("paused", paused);
}

function getActivityElapsedSeconds() {
  if (!activitySession) return 0;
  const base = activitySession.baseSeconds || 0;
  const local = activitySession.elapsedBefore || 0;
  if (!activitySession.start) return base + local;
  return base + local + Math.max(0, Math.round((Date.now() - activitySession.start) / 1000));
}

function updateActivityTimerUI() {
  const elapsed = getActivityElapsedSeconds();
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timerEl = document.getElementById("activity-timer");
  if (timerEl) timerEl.innerText = `⏱️ ${mins} dk ${secs} sn`;
  const fullTimer = document.getElementById("activity-full-timer");
  if (fullTimer) fullTimer.innerText = `⏱️ ${mins} dk ${secs} sn`;
  const fullTitle = document.getElementById("activity-full-title");
  if (fullTitle) fullTitle.innerText = document.getElementById("activity-title")?.innerText || "Uygulama";
}

async function startActivitySession() {
  if (!activitySession) return;
  const { content, item, options } = activitySession;
  const iframe = document.getElementById("activity-iframe");
  if (!iframe) return;
  
  if (!activitySession.completedSet) {
    const progressData = contentProgressMap.get(content.id) || {};
    activitySession.completedSet = new Set(progressData.completedItemIds || []);
    activitySession.answers = progressData.answers || {};
    activitySession.appUsage = progressData.appUsage || {};
    const savedSeconds = activitySession.appUsage[item.id]?.seconds || 0;
    activitySession.baseSeconds = savedSeconds;
    activitySession.elapsedBefore = 0;
  }
  
  if (!activitySession.start) {
    setActivityFrameStatus("");
    if (!iframe.src || iframe.src === "about:blank") {
      iframe.src = item.appLink || "about:blank";
      setupIframeFallback(iframe, item.appLink, {
        waitMs: 5000,
        showLoadingNotice: true,
        loadingText: "İçerik iframe penceresinde yükleniyor...",
        fallbackCountdownSeconds: 2,
        redirectText: "Iframe açılamadı. Yeni pencereye yönlendiriliyorsunuz"
      });
    }
    // original behavior: iframe already has src and fallback setup
    activitySession.start = Date.now();
    activitySession.running = true;
    setActivityStartButtons(true);
    setActivityPausedUI(false);
    updateActivityTimerUI();
    if (activityTimerInterval) clearInterval(activityTimerInterval);
    activityTimerInterval = setInterval(() => {
      if (!activitySession || !activitySession.running) return;
      updateActivityTimerUI();
    }, 1000);
    return;
  }
  
  if (activitySession.running) {
    const elapsedNow = getActivityElapsedSeconds();
    const base = activitySession.baseSeconds || 0;
    activitySession.elapsedBefore = Math.max(0, elapsedNow - base);
    activitySession.start = null;
    activitySession.running = false;
    if (activityTimerInterval) clearInterval(activityTimerInterval);
    activityTimerInterval = null;
    setActivityStartButtons(false);
    setActivityPausedUI(true);
    updateActivityTimerUI();
  } else {
    activitySession.start = Date.now();
    activitySession.running = true;
    setActivityStartButtons(true);
    setActivityPausedUI(false);
    if (activityTimerInterval) clearInterval(activityTimerInterval);
    activityTimerInterval = setInterval(() => {
      if (!activitySession || !activitySession.running) return;
      updateActivityTimerUI();
    }, 1000);
  }
}

function getActivityPercent(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  return Math.min(100, Math.max(0, minutes * 10));
}

function getActivityEarnedXP(totalSeconds) {
  const minutes = Math.max(0, Math.floor(Number(totalSeconds || 0) / 60));
  return minutes * 2;
}

async function stopActivitySession(opts = {}) {
  if (!activitySession) return;
  const { content, item } = activitySession;
  if (!activitySession.completedSet || !activitySession.appUsage) {
    const progressData = contentProgressMap.get(content.id) || {};
    activitySession.completedSet = new Set(progressData.completedItemIds || []);
    activitySession.answers = progressData.answers || {};
    activitySession.appUsage = progressData.appUsage || {};
    const savedSeconds = activitySession.appUsage[item.id]?.seconds || 0;
    if (typeof activitySession.baseSeconds !== "number") {
      activitySession.baseSeconds = savedSeconds;
    }
  }
  const { completedSet, answers, appUsage } = activitySession;
  const totalSeconds = getActivityElapsedSeconds();
  const percent = getActivityPercent(totalSeconds);
  const isActivityAssignment = !!activitySession?.options?.assignmentId;
  const shortSession = isActivityAssignment && totalSeconds < 60;
  
  if (opts.requireConfirm && shortSession) {
    const ok = await confirmDialog("Henüz uygulamayı tamamlamadın. Çıkarsan etkinlik bitmemiş sayılacak ve tekrar baştan yapacaksın. Devam edilsin mi?");
    if (!ok) return false;
  }
  
  if (shortSession && opts.showMessage) {
    if (opts.askContinue) {
      const wantsExit = await infoDialog(
        "Bu etkinlik ödevinde Kaydet ve Çık için en az 1 dk geçirmelisin.",
        {
          showContinue: true,
          okText: "Kaydet ve Çık",
          continueText: "Devam Et",
          okClass: "btn btn-warning",
          continueClass: "btn btn-primary"
        }
      );
      if (wantsExit) {
        await infoDialog("Henüz 1 dk dolmadı. Lütfen en az 1 dk etkinlikte kalıp tekrar kaydet.", { okText: "Tamam" });
      }
      return false;
    }
    const ok = await infoDialog(
      "Henüz 1 dk dolmadı. Bu etkinlik ödevi için en az 1 dk geçirmelisin.",
      { showContinue: false, okText: "Tamam" }
    );
    if (!ok && opts.allowContinue) return false;
    return false;
  }
  
  const earnedXP = getActivityEarnedXP(totalSeconds);
  if (!shortSession) {
    appUsage[item.id] = {
      seconds: totalSeconds,
      percent,
      xp: earnedXP,
      title: item.appTitle || "Uygulama",
      link: item.appLink || "",
      requiredMinutes: Number(item.requiredMinutes || 1)
    };
    if (percent >= 100) {
      completedSet.add(item.id);
    } else {
      completedSet.delete(item.id);
    }
    await updateContentProgress(content, Array.from(completedSet), answers, appUsage, (contentProgressMap.get(content.id)?.totalXP || 0));
    if (opts.showMessage) {
      if (opts.askContinue) {
        const wantsExit = await infoDialog(
          `%${percent} tamamladın. Ne yapmak istersin?`,
          {
            showContinue: true,
            okText: "Kaydet ve Çık",
            continueText: "Devam Et",
            okClass: "btn btn-success",
            continueClass: "btn btn-primary"
          }
        );
        if (!wantsExit) {
          activitySession.baseSeconds = totalSeconds;
          activitySession.elapsedBefore = 0;
          activitySession.start = Date.now();
          activitySession.running = true;
          setActivityStartButtons(true);
          setActivityPausedUI(false);
          if (activityTimerInterval) clearInterval(activityTimerInterval);
          activityTimerInterval = setInterval(() => {
            if (!activitySession || !activitySession.running) return;
            updateActivityTimerUI();
          }, 1000);
          return false;
        }
        await infoDialog(`Verileriniz kayıt oldu. +${earnedXP} XP kazandınız.`, { okText: "Tamam" });
      } else {
        await infoDialog(`%${percent} tamamladın. Tebrikler!`);
      }
    }
    if (percent > 0) {
      showNotice(`Etkinlik %${percent} olarak kaydedildi!`, percent >= 100 ? "#2ecc71" : "#4a90e2");
    }
  }
  const iframe = document.getElementById("activity-iframe");
  if (iframe) iframe.src = "about:blank";
  setActivityFrameStatus("");
    if (activityTimerInterval) clearInterval(activityTimerInterval);
    activityTimerInterval = null;
    const timerEl = document.getElementById("activity-timer");
    if (timerEl) timerEl.innerText = "⏱️ 0 dk 0 sn";
    const fullTimer = document.getElementById("activity-full-timer");
    if (fullTimer) fullTimer.innerText = "⏱️ 0 dk 0 sn";
    setActivityStartButtons(false);
    setActivityPausedUI(false);
    activitySession = null;
  updateActivityLists();
  const modal = document.getElementById("activity-modal");
  if (modal) modal.style.display = "none";
  return true;
}

async function deleteAssignmentCompletely(assignment) {
  if (!assignment?.id) return;
  try {
    // Geçmiş raporlar ve öğrenci puanları korunur: fiziksel silme yerine arşivleme.
    await updateDoc(doc(db, "contentAssignments", assignment.id), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: currentUserId || null,
      updatedAt: serverTimestamp()
    });
    showNotice("Etkinlik arşivlendi. Öğrenci geçmişinde kalacak.", "#e74c3c");
    contentAssignments = contentAssignments.map((a) =>
      a.id === assignment.id ? { ...a, isDeleted: true } : a
    );
    updateActivityLists();
  } catch (e) {
    showNotice("Silme hatası: " + e.message, "#e74c3c");
  }
}

async function renderAssignmentStudentsList(assignment) {
  const list = document.getElementById("assignment-students-list");
  if (!list || !assignment) return;
  list.innerHTML = "<div class='loading'>Öğrenciler yükleniyor...</div>";
  const classVal = document.getElementById("assignment-filter-class")?.value || "";
  const sectionVal = document.getElementById("assignment-filter-section")?.value || "";
  let students = allStudents;
  if (!students || students.length === 0) {
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
    students = [];
    snap.forEach((d) => students.push({ id: d.id, ...d.data() }));
  }
  students = scopeStudentsForCurrentRole(students);
  const filtered = students.filter(s => {
    if (classVal && s.className !== classVal) return false;
    if (sectionVal && s.section !== sectionVal) return false;
    return assignmentMatchesStudentFor({
      targetClass: assignment.targetClass || "",
      targetSection: assignment.targetSection || ""
    }, s);
  });
  const progSnap = await getDocs(query(collection(db, "contentProgress"), where("contentId", "==", assignment.contentId)));
  const progressMap = new Map();
  progSnap.forEach((docSnap) => {
    const data = docSnap.data();
    if (data?.userId) progressMap.set(data.userId, data);
  });
  list.innerHTML = "";
  if (filtered.length === 0) {
    list.innerHTML = "<div class='empty-state'>Öğrenci bulunamadı.</div>";
    return;
  }
  filtered.forEach((s) => {
    const prog = progressMap.get(s.id);
    let best = 0;
    if (prog?.appUsage) {
      Object.values(prog.appUsage).forEach((u) => {
        const p = Math.max(0, Math.min(100, u?.percent || 0));
        if (p > best) best = p;
      });
    }
    const done = best > 0 || (prog?.completedItemIds || []).length > 0;
    const label = done ? "Yaptı" : "Yapmadı";
    const badgeClass = done ? "badge-success" : "badge-pending";
    const row = document.createElement("div");
    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px dashed #e5e7eb;";
    row.innerHTML = `
      <div>
        <strong>${getUserDisplayName(s)}</strong>
        <small style="display:block; color:#666;">${s.className || ""}${s.section ? "/" + s.section : ""}</small>
      </div>
      <span class="badge ${badgeClass}">${label}</span>
    `;
    list.appendChild(row);
  });
}

async function renderTaskStudentsList(task) {
  const list = document.getElementById("task-students-list");
  if (!list || !task) return;
  list.innerHTML = "<div class='loading'>Yükleniyor...</div>";
  const classVal = document.getElementById("task-students-filter-class")?.value || "";
  const sectionVal = document.getElementById("task-students-filter-section")?.value || "";
  let students = allStudents;
  if (!students || students.length === 0) {
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
    students = [];
    snap.forEach((d) => students.push({ id: d.id, ...d.data() }));
  }
  students = scopeStudentsForCurrentRole(students);
  let displayStudents = students.filter(s => {
    if (classVal && s.className !== classVal) return false;
    if (sectionVal && s.section !== sectionVal) return false;
    return taskMatchesStudentFor(task, s);
  });
  displayStudents.sort((a, b) => {
    const aClass = a.className || "";
    const bClass = b.className || "";
    if (aClass !== bClass) return aClass.localeCompare(bClass, "tr");
    const aSection = a.section || "";
    const bSection = b.section || "";
    if (aSection !== bSection) return aSection.localeCompare(bSection, "tr");
    const aName = (getUserDisplayName(a) || "").toLowerCase();
    const bName = (getUserDisplayName(b) || "").toLowerCase();
    return aName.localeCompare(bName, "tr");
  });

  let completionMap = new Map();
  if (requiresTeacherApprovalTask(task)) {
    const progSnap = await getDocs(query(collection(db, "bookTaskProgress"), where("taskId", "==", task.id)));
    progSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (data?.userId) completionMap.set(data.userId, data);
    });
  } else {
    const completionsSnap = await getDocs(query(collection(db, "completions"), where("taskId", "==", task.id)));
    completionsSnap.forEach(docSnap => {
      const data = docSnap.data();
      completionMap.set(data.userId, data);
    });
  }

  list.innerHTML = "";
  if (displayStudents.length === 0) {
    list.innerHTML = "<div class='empty-state'>Öğrenci bulunamadı.</div>";
    return;
  }
  displayStudents.forEach((student) => {
    const comp = completionMap.get(student.id);
    const displayName = getUserDisplayName(student);
    const classInfo = student.className && student.section ? `${student.className}/${student.section}` : "-";
    let badge = `<span class="badge badge-pending">Yapmadı</span>`;
    if (requiresTeacherApprovalTask(task)) {
      const status = comp?.status || "none";
      const approved = !!comp?.approved;
      if (approved) {
        badge = `<span class="badge badge-success">Yaptı</span>`;
      } else if (status === "finished") {
        badge = `<span class="badge badge-info">Bitirdi</span>`;
      } else if (status === "started") {
        badge = `<span class="badge badge-progress">Başladı</span>`;
      }
    } else if (comp) {
      const percent = Math.round((comp.correctAnswers / comp.totalQuestions) * 100);
      const badgeClass = percent >= 80 ? "badge-success" : percent >= 60 ? "badge-info" : "badge-pending";
      badge = `<span class="badge ${badgeClass}">%${percent}</span>`;
    }
    const row = document.createElement("div");
    row.className = "student-list-item";
    row.style.cursor = "default";
    row.innerHTML = `
      <div>
        <strong>${displayName}</strong>
        <small style="display:block; color:#666;">${classInfo}</small>
      </div>
      ${badge}
    `;
    list.appendChild(row);
  });
}

function openAssignmentEditor(assignment, options = {}) {
  if (!assignmentModal) return;
  currentAssignmentId = assignment.id;
  document.getElementById("assignment-title").value = assignment.title || "";
  document.getElementById("assignment-desc").value = assignment.description || "";
  document.getElementById("assignment-class").value = assignment.targetClass || "";
  document.getElementById("assignment-section").value = assignment.targetSection || "";
  document.getElementById("assignment-deadline").value = assignment.deadline || "";
  document.getElementById("assignment-deadline-time").value = assignment.deadlineTime || "";
  const studentsSection = document.getElementById("assignment-students-section");
  if (studentsSection) studentsSection.style.display = userRole === "teacher" ? "block" : "none";
  if (userRole === "teacher") {
    const classSel = document.getElementById("assignment-filter-class");
    const sectionSel = document.getElementById("assignment-filter-section");
    populateClassSectionFilters(classSel, sectionSel).then(() => {
      renderAssignmentStudentsList(assignment);
    });
  }
  assignmentModal.style.display = "flex";
  if (options.focusDate) {
    const dateInput = document.getElementById("assignment-deadline");
    if (dateInput) setTimeout(() => dateInput.focus(), 0);
  }
}

function renderContentList() {
  const list = document.getElementById("content-list");
  const editor = document.getElementById("content-editor");
  const viewer = document.getElementById("content-viewer");
  const empty = document.getElementById("content-empty");
  if (!list) return;
  list.innerHTML = "";

  if (userRole !== "teacher") {
    list.innerHTML = "<div class='empty-state'>İçerikler öğrenci ekranında gösterilmez.</div>";
    if (empty) empty.style.display = "block";
    if (editor) editor.style.display = "none";
    if (viewer) viewer.style.display = "none";
    return;
  }

  let contents = allContents.slice();

  if (contents.length === 0) {
    list.innerHTML = "<div class='empty-state'>İçerik bulunamadı.</div>";
    if (empty) empty.style.display = "block";
    if (editor) editor.style.display = "none";
    if (viewer) viewer.style.display = "none";
    return;
  }

  contents.forEach((content) => {
    const div = document.createElement("div");
    div.className = "content-item" + (selectedContentId === content.id ? " active" : "");
    const progress = getContentProgress(content);
    const tag = content.targetClass ? `${content.targetClass}${content.targetSection ? "/" + content.targetSection : ""}` : "Tüm Sınıflar";
    div.innerHTML = `
      <div style="flex:1;">
        <div style="font-weight:600;">${content.title || "Başlıksız"}</div>
        <div style="font-size:12px;color:#666;">${content.description || ""}</div>
        <div class="content-tag">${tag}</div>
        ${userRole === "student" ? `<div class="progress-mini"><div style="width:${progress.percent}%"></div></div>
        <div style="font-size:11px;color:#666;margin-top:4px;">%${progress.percent} • ${progress.completed}/${progress.total} • ${progress.totalXP} XP</div>` : ""}
      </div>
      <div style="font-size:12px;color:#999;">${(content.items || []).length} öğe</div>
    `;
    div.onclick = () => {
      selectedContentId = content.id;
      if (userRole === "teacher") {
        selectContentForEdit(content);
      } else {
        selectContentForView(content);
      }
      renderContentList();
    };
    list.appendChild(div);
  });

  if (!selectedContentId) {
    if (empty) empty.style.display = "block";
    if (editor) editor.style.display = "none";
    if (viewer) viewer.style.display = "none";
  }
}

function selectContentForEdit(content) {
  const editor = document.getElementById("content-editor");
  const viewer = document.getElementById("content-viewer");
  const empty = document.getElementById("content-empty");
  if (editor) editor.style.display = "block";
  if (viewer) viewer.style.display = "none";
  if (empty) empty.style.display = "none";

  document.getElementById("content-title").value = content.title || "";
  document.getElementById("content-desc").value = content.description || "";
  document.getElementById("content-target-class").value = content.targetClass || "";
  document.getElementById("content-target-section").value = content.targetSection || "";
  contentItemsDraft = (content.items || []).map(item => ({ ...item }));
  renderContentItemsEditor();
}

function selectContentForView(content, options = {}) {
  stopActiveAppSession();
  const editor = document.getElementById("content-editor");
  const viewer = document.getElementById("content-viewer");
  const empty = document.getElementById("content-empty");
  if (editor) editor.style.display = "none";
  if (viewer) viewer.style.display = "block";
  if (empty) empty.style.display = "none";
  // Uygulama bilgilerini üst çubukta göster
  const firstApp = (content.items || []).find(it => it.type === "app");
  const titleEl = document.getElementById("app-title");
  const linkEl = document.getElementById("app-link");
  if (titleEl) titleEl.innerText = firstApp?.appTitle || "Uygulama";
  if (linkEl) linkEl.innerText = firstApp?.appLink || "Uygulama linki yok";
  if (firstApp) {
    const progressData = contentProgressMap.get(content.id) || {};
    const completedSet = new Set(progressData.completedItemIds || []);
    const answers = progressData.answers || {};
    const appUsage = progressData.appUsage || {};
    lastAppItem = { content, item: firstApp, appUsage, completedSet, answers, options };
  } else {
    lastAppItem = null;
  }
  const readOnly = options.readOnly === true;

  const header = document.getElementById("content-viewer-header");
  const body = document.getElementById("content-viewer-body");
  if (!header || !body) return;

  const progress = getContentProgress(content);
  header.innerHTML = `
    <div style="font-weight:700;font-size:18px;">${content.title || "Başlıksız"}</div>
    <div style="color:#666;font-size:12px;">${content.description || ""}</div>
    <div style="margin-top:8px;">
      <div class="progress-mini"><div style="width:${progress.percent}%"></div></div>
      <div style="font-size:12px;color:#666;margin-top:4px;">%${progress.percent} • ${progress.completed}/${progress.total} • ${progress.totalXP} XP</div>
    </div>
  `;

  const progressData = contentProgressMap.get(content.id) || {};
  const completedSet = new Set(progressData.completedItemIds || []);
  const answers = progressData.answers || {};
  const appUsage = progressData.appUsage || {};

  body.innerHTML = "";
  (content.items || []).forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.marginBottom = "10px";
    const checked = completedSet.has(item.id);
    const isQuestion = item.type === "quiz" || item.type === "truefalse" || item.type === "short";
    const checkbox = isQuestion ? "" : `<label style="display:flex; gap:8px; align-items:center; font-size:12px; color:#666;">
      <input type="checkbox" ${checked ? "checked" : ""} data-id="${item.id}" ${readOnly ? "disabled" : ""}>
      Tamamlandı
    </label>`;
    const answerData = answers[item.id] || {};

    let inner = "";
    if (item.type === "heading") {
      inner = `<div style="font-size:18px;font-weight:700;">${item.text || "Başlık"}</div>`;
    } else if (item.type === "paragraph") {
      inner = `<div style="line-height:1.5;">${item.text || ""}</div>`;
    } else if (item.type === "image") {
      inner = item.src ? `<img src="${item.src}" style="max-width:100%;border-radius:12px;">` : `<div>Görsel yok</div>`;
    } else if (item.type === "video") {
      inner = item.url ? `<div style="color:#2563eb;">${item.url}</div>` : `<div>Video URL yok</div>`;
    } else if (item.type === "quiz") {
      inner = `
        <div style="font-weight:600;">${item.question || "Soru"}</div>
        ${(item.options || []).map(opt => `<label style="display:flex;gap:8px;align-items:center;margin-top:6px;">
          <input type="radio" name="q_${item.id}" value="${opt}" ${answerData.answer === opt ? "checked" : ""} ${readOnly ? "disabled" : ""}>
          ${opt}
        </label>`).join("")}
        <button class="btn btn-primary btn-answer" data-id="${item.id}" style="margin-top:8px;" ${readOnly ? "disabled" : ""}>Cevapla</button>
        <div class="answer-status" style="margin-top:6px; font-size:12px; color:${answerData.correct ? "#16a34a" : answerData.answer ? "#dc2626" : "#6b7280"};">
          ${answerData.answer ? (answerData.correct ? "Doğru! +" + clampQuestionXP(item.xp || 0) + " XP" : "Yanlış, tekrar deneyebilirsin.") : "Henüz cevaplanmadı"}
        </div>
      `;
    } else if (item.type === "truefalse") {
      inner = `
        <div style="font-weight:600;">${item.question || "Soru"}</div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:6px;">
          <input type="radio" name="q_${item.id}" value="true" ${answerData.answer === "true" ? "checked" : ""} ${readOnly ? "disabled" : ""}>
          Doğru
        </label>
        <label style="display:flex;gap:8px;align-items:center;margin-top:6px;">
          <input type="radio" name="q_${item.id}" value="false" ${answerData.answer === "false" ? "checked" : ""} ${readOnly ? "disabled" : ""}>
          Yanlış
        </label>
        <button class="btn btn-primary btn-answer" data-id="${item.id}" style="margin-top:8px;" ${readOnly ? "disabled" : ""}>Cevapla</button>
        <div class="answer-status" style="margin-top:6px; font-size:12px; color:${answerData.correct ? "#16a34a" : answerData.answer ? "#dc2626" : "#6b7280"};">
          ${answerData.answer ? (answerData.correct ? "Doğru! +" + clampQuestionXP(item.xp || 0) + " XP" : "Yanlış, tekrar deneyebilirsin.") : "Henüz cevaplanmadı"}
        </div>
      `;
    } else if (item.type === "short") {
      inner = `
        <div style="font-weight:600;">${item.question || "Soru"}</div>
        <input class="form-control" data-short-id="${item.id}" placeholder="Cevabın" ${readOnly ? "disabled" : ""}>
        <button class="btn btn-primary btn-answer" data-id="${item.id}" style="margin-top:8px;" ${readOnly ? "disabled" : ""}>Cevapla</button>
        <div class="answer-status" style="margin-top:6px; font-size:12px; color:${answerData.correct ? "#16a34a" : answerData.answer ? "#dc2626" : "#6b7280"};">
          ${answerData.answer ? (answerData.correct ? "Doğru! +" + clampQuestionXP(item.xp || 0) + " XP" : "Yanlış, tekrar deneyebilirsin.") : "Henüz cevaplanmadı"}
        </div>
      `;
    } else if (item.type === "app") {
      const usage = appUsage[item.id] || { seconds: 0, percent: 0 };
      const mins = Math.floor((usage.seconds || 0) / 60);
      const secs = (usage.seconds || 0) % 60;
      const required = Math.max(1, Number(item.requiredMinutes || 1));
      inner = `
        <div style="font-weight:600;">${item.appTitle || "Uygulama"}</div>
        <div style="font-size:12px;color:#666;word-break:break-all;">${item.appLink || ""}</div>
        <button class="btn btn-primary btn-open-app" data-id="${item.id}" style="margin-top:8px;" ${readOnly ? "disabled" : ""}>Uygulamayı Aç</button>
        <div style="margin-top:6px;font-size:12px;color:#666;">Geçirilen süre: ${mins} dk ${secs} sn / Gerekli: ${required} dk</div>
        <div style="font-size:12px;color:#2563eb;">İlerleme: %${usage.percent || 0}</div>
        <div style="font-size:12px;color:${usage.seconds >= required * 60 ? "#16a34a" : "#6b7280"};">
          ${usage.seconds >= required * 60 ? "Tamamlandı" : "Tamamlanmadı"}
        </div>
      `;
    }

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div style="font-size:12px;color:#666;">${idx + 1}. ${item.type}</div>
        ${checkbox}
      </div>
      ${inner}
    `;
    body.appendChild(card);
  });

  body.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.onchange = async (e) => {
      if (readOnly) return;
      const id = e.target.getAttribute("data-id");
      if (e.target.checked) {
        completedSet.add(id);
      } else {
        completedSet.delete(id);
      }
      await updateContentProgress(content, Array.from(completedSet), answers, appUsage, progressData.totalXP || 0);
      renderContentList();
      selectContentForView(content, options);
    };
  });

  body.querySelectorAll(".btn-answer").forEach((btn) => {
    btn.onclick = async () => {
      if (readOnly) return;
      const id = btn.getAttribute("data-id");
      const item = (content.items || []).find(it => it.id === id);
      if (!item) return;
      let answer = "";
      if (item.type === "short") {
        const input = body.querySelector(`input[data-short-id="${id}"]`);
        answer = (input?.value || "").trim();
      } else {
        const checkedInput = body.querySelector(`input[name="q_${id}"]:checked`);
        answer = checkedInput?.value || "";
      }
      if (!answer) {
        showNotice("Cevap seçiniz!", "#e74c3c");
        return;
      }
      const correct = isAnswerCorrect(item, answer);
      answers[id] = { answer, correct, xp: correct ? clampQuestionXP(item.xp || 0) : 0 };
      completedSet.add(id);
      await updateContentProgress(content, Array.from(completedSet), answers, appUsage, progressData.totalXP || 0);
      renderContentList();
      selectContentForView(content, options);
    };
  });

  body.querySelectorAll(".btn-open-app").forEach((btn) => {
    btn.onclick = async () => {
      if (readOnly) return;
      const id = btn.getAttribute("data-id");
      const item = (content.items || []).find(it => it.id === id);
      if (!item?.appLink) {
        showNotice("Uygulama linki yok!", "#e74c3c");
        return;
      }
      await startAppSession(content, item, appUsage, completedSet, answers, options);
    };
  });
}

function isAnswerCorrect(item, answer) {
  if (!item) return false;
  const a = (answer || "").toString().trim().toLowerCase();
  const correct = (item.correct || "").toString().trim().toLowerCase();
  if (item.type === "truefalse") {
    return a === correct;
  }
  return a === correct;
}

async function updateContentProgress(content, completedItemIds, answers = {}, appUsage = {}, prevTotalXP = 0) {
  if (!currentUserId) return;
  const ref = doc(db, "contentProgress", buildContentProgressKey(content.id));
  const totalItems = (content.items || []).length;
  const answerXP = Object.values(answers).reduce((sum, a) => sum + clampQuestionXP(a?.xp || 0), 0);
  const appXP = Object.values(appUsage).reduce((sum, a) => sum + (a?.xp || 0), 0);
  const totalXP = answerXP + appXP;
  const payload = {
    userId: currentUserId,
    contentId: content.id,
    completedItemIds,
    answers,
    appUsage,
    totalItems,
    totalXP,
    updatedAt: serverTimestamp()
  };
  await setDoc(ref, payload, { merge: true });
  // local cache update for immediate UI
  const existing = contentProgressMap.get(content.id) || {};
  contentProgressMap.set(content.id, { ...existing, ...payload });

  const delta = totalXP - (prevTotalXP || 0);
  if (delta !== 0) {
    try {
      await updateDoc(doc(db, "users", currentUserId), { xp: increment(delta) });
    } catch (e) {
      console.error("XP güncelleme hatası:", e);
    }
  }
  updateActivityLists();
}

async function startAppSession(content, item, appUsage, completedSet, answers, options) {
  const iframe = document.getElementById("content-app-iframe");
  if (!iframe) return;
  await stopActiveAppSession();
  iframe.src = item.appLink || "about:blank";
  setupIframeFallback(iframe, item.appLink);
  const timerEl = document.getElementById("app-timer");
  if (timerEl) timerEl.innerText = "⏱️ 0 dk 0 sn";
  const titleEl = document.getElementById("app-title");
  if (titleEl) titleEl.innerText = item.appTitle || "Uygulama";
  const linkEl = document.getElementById("app-link");
  if (linkEl) linkEl.innerText = item.appLink || "Uygulama linki yok";
  activeAppSession = {
    content,
    item,
    appUsage,
    completedSet,
    answers,
    options,
    start: Date.now()
  };
  lastAppItem = { content, item, appUsage, completedSet, answers, options };
  if (appTimerInterval) clearInterval(appTimerInterval);
  appTimerInterval = setInterval(() => {
    if (!activeAppSession) return;
    const elapsed = Math.max(0, Math.round((Date.now() - activeAppSession.start) / 1000));
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    if (timerEl) timerEl.innerText = `⏱️ ${mins} dk ${secs} sn`;
  }, 1000);
}


async function stopActiveAppSession() {
  if (!activeAppSession) return;
  const { content, item, appUsage, completedSet, answers, options, start } = activeAppSession;
  const elapsed = Math.max(0, Math.round((Date.now() - start) / 1000));
  const prev = appUsage[item.id]?.seconds || 0;
  const totalSeconds = prev + elapsed;
  const requiredSeconds = Math.max(1, Number(item.requiredMinutes || 1)) * 60;
  const percent = Math.min(100, Math.round((totalSeconds / requiredSeconds) * 100));
  const earnedXP = getActivityEarnedXP(totalSeconds);
  appUsage[item.id] = {
    seconds: totalSeconds,
    percent,
    xp: earnedXP,
    title: item.appTitle || "Uygulama",
    link: item.appLink || "",
    requiredMinutes: Number(item.requiredMinutes || 1)
  };
  if (percent >= 100) {
    completedSet.add(item.id);
  } else {
    completedSet.delete(item.id);
  }
  await updateContentProgress(content, Array.from(completedSet), answers, appUsage, (contentProgressMap.get(content.id)?.totalXP || 0));
  selectContentForView(content, options);
  const iframe = document.getElementById("content-app-iframe");
  if (iframe) iframe.src = "about:blank";
  if (appTimerInterval) clearInterval(appTimerInterval);
  appTimerInterval = null;
  const timerEl = document.getElementById("app-timer");
  if (timerEl) timerEl.innerText = "⏱️ 0 dk 0 sn";
  const titleEl = document.getElementById("app-title");
  if (titleEl) titleEl.innerText = "Uygulama";
  const linkEl = document.getElementById("app-link");
  if (linkEl) linkEl.innerText = "Uygulama linki yok";
  activeAppSession = null;
}

function newContentItem(type) {
  return {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type,
    xp: type === "quiz" || type === "truefalse" || type === "short" ? MAX_QUESTION_XP : 0,
    text: "",
    question: "",
    options: ["", "", "", ""],
    correct: "",
    src: "",
    url: "",
    appTitle: "",
    appLink: "",
    requiredMinutes: 1
  };
}

function renderContentItemsEditor() {
  const container = document.getElementById("content-items");
  if (!container) return;
  container.innerHTML = "";

  contentItemsDraft.forEach((item, index) => {
    const wrap = document.createElement("div");
    wrap.className = "content-editor-item";
    wrap.draggable = true;
    wrap.dataset.index = index;
    wrap.ondragstart = (e) => {
      e.dataTransfer.setData("text/plain", String(index));
    };
    wrap.ondragover = (e) => e.preventDefault();
    wrap.ondrop = (e) => {
      e.preventDefault();
      const from = Number(e.dataTransfer.getData("text/plain"));
      const to = Number(wrap.dataset.index);
      if (Number.isNaN(from) || Number.isNaN(to) || from === to) return;
      const moved = contentItemsDraft.splice(from, 1)[0];
      contentItemsDraft.splice(to, 0, moved);
      renderContentItemsEditor();
    };

    let inner = "";
    if (item.type === "heading") {
      inner = `
        <input class="form-control" data-field="text" placeholder="Başlık" value="${item.text || ""}">
        <input class="form-control" data-field="xp" type="number" min="0" placeholder="XP" value="${item.xp ?? 0}">
      `;
    } else if (item.type === "paragraph") {
      inner = `
        <textarea class="form-control" data-field="text" placeholder="Metin">${item.text || ""}</textarea>
        <input class="form-control" data-field="xp" type="number" min="0" placeholder="XP" value="${item.xp ?? 0}">
      `;
    } else if (item.type === "image") {
      inner = `
        <input class="form-control" data-field="src" placeholder="Görsel URL" value="${item.src || ""}">
        <input class="form-control" type="file" accept="image/*" data-field="file">
        <div style="font-size:12px;color:#666;">Sürükle-bırak ile görsel ekleyebilirsiniz.</div>
        <input class="form-control" data-field="xp" type="number" min="0" placeholder="XP" value="${item.xp ?? 0}">
      `;
    } else if (item.type === "video") {
      inner = `
        <input class="form-control" data-field="url" placeholder="Video URL" value="${item.url || ""}">
        <input class="form-control" data-field="xp" type="number" min="0" placeholder="XP" value="${item.xp ?? 0}">
      `;
    } else if (item.type === "quiz") {
      inner = `
        <input class="form-control" data-field="question" placeholder="Soru" value="${item.question || ""}">
        ${item.options.map((opt, i) => `<input class="form-control" data-field="opt-${i}" placeholder="Seçenek ${i + 1}" value="${opt || ""}">`).join("")}
        <input class="form-control" data-field="correct" placeholder="Doğru Cevap" value="${item.correct || ""}">
        <input class="form-control" data-field="xp" type="number" min="0" max="${MAX_QUESTION_XP}" placeholder="XP" value="${clampQuestionXP(item.xp ?? MAX_QUESTION_XP)}">
      `;
    } else if (item.type === "truefalse") {
      inner = `
        <input class="form-control" data-field="question" placeholder="Soru" value="${item.question || ""}">
        <select class="form-control" data-field="correct">
          <option value="">Doğru/Yanlış Seç</option>
          <option value="true" ${item.correct === "true" ? "selected" : ""}>Doğru</option>
          <option value="false" ${item.correct === "false" ? "selected" : ""}>Yanlış</option>
        </select>
        <input class="form-control" data-field="xp" type="number" min="0" max="${MAX_QUESTION_XP}" placeholder="XP" value="${clampQuestionXP(item.xp ?? MAX_QUESTION_XP)}">
      `;
    } else if (item.type === "short") {
      inner = `
        <input class="form-control" data-field="question" placeholder="Soru" value="${item.question || ""}">
        <input class="form-control" data-field="correct" placeholder="Beklenen Cevap" value="${item.correct || ""}">
        <input class="form-control" data-field="xp" type="number" min="0" max="${MAX_QUESTION_XP}" placeholder="XP" value="${clampQuestionXP(item.xp ?? MAX_QUESTION_XP)}">
      `;
    } else if (item.type === "app") {
      inner = `
        <input class="form-control" data-field="appTitle" placeholder="Uygulama Başlığı" value="${item.appTitle || ""}">
        <input class="form-control" data-field="appLink" placeholder="Uygulama Linki (https://...)" value="${item.appLink || ""}">
        <input class="form-control" data-field="requiredMinutes" type="number" min="1" placeholder="Gerekli Süre (dk)" value="${item.requiredMinutes ?? 1}">
      `;
    }

    wrap.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div><span class="drag-handle">⋮⋮</span> <strong>${item.type}</strong></div>
        <button class="btn btn-danger btn-delete-item" data-index="${index}" style="padding:6px 10px;">Sil</button>
      </div>
      ${inner}
    `;
    container.appendChild(wrap);

    wrap.querySelectorAll("input, textarea, select").forEach((input) => {
      input.oninput = async (e) => {
        const field = e.target.getAttribute("data-field");
        if (!field) return;
        if (field === "file" && e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = function () {
            contentItemsDraft[index].src = reader.result;
            renderContentItemsEditor();
          };
          reader.readAsDataURL(file);
          return;
        }
        if (field.startsWith("opt-")) {
          const optIndex = Number(field.split("-")[1]);
          contentItemsDraft[index].options[optIndex] = e.target.value;
          return;
        }
        if (field === "xp") {
          const xpValue = Number(e.target.value || 0);
          if (item.type === "quiz" || item.type === "truefalse" || item.type === "short") {
            contentItemsDraft[index].xp = clampQuestionXP(xpValue);
            e.target.value = String(contentItemsDraft[index].xp);
          } else {
            contentItemsDraft[index].xp = Math.max(0, xpValue);
          }
          return;
        }
        if (field === "requiredMinutes") {
          contentItemsDraft[index].requiredMinutes = Number(e.target.value || 1);
          return;
        }
        contentItemsDraft[index][field] = e.target.value;
      };

      if (input.getAttribute("data-field") === "file") {
        input.onchange = input.oninput;
      }
    });

    if (item.type === "image") {
      wrap.ondragover = (e) => e.preventDefault();
      wrap.ondrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
          contentItemsDraft[index].src = reader.result;
          renderContentItemsEditor();
        };
        reader.readAsDataURL(file);
      };
    }
  });

  container.querySelectorAll(".btn-delete-item").forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.getAttribute("data-index"));
      if (Number.isNaN(idx)) return;
      contentItemsDraft.splice(idx, 1);
      renderContentItemsEditor();
    };
  });
}

function loadTasksModal() {
  const list = document.getElementById("tasks-list");
  if (!list) return;
  list.innerHTML = "";
  const nameInput = document.getElementById("tasks-filter-name");
  const fromInput = document.getElementById("tasks-filter-from");
  const toInput = document.getElementById("tasks-filter-to");
  const activeInput = document.getElementById("tasks-filter-active");
  const archivedInput = document.getElementById("tasks-filter-archived");
  
  if (nameInput) nameInput.oninput = renderTasksList;
  if (fromInput) fromInput.onchange = renderTasksList;
  if (toInput) toInput.onchange = renderTasksList;
  if (activeInput) activeInput.onchange = renderTasksList;
  if (archivedInput) archivedInput.onchange = renderTasksList;
  
  renderTasksList();
}

function renderTasksList() {
  const list = document.getElementById("tasks-list");
  if (!list) return;
  list.innerHTML = "";
  
  const nameVal = (document.getElementById("tasks-filter-name")?.value || "").toLowerCase().trim();
  const fromVal = toDateOnly(document.getElementById("tasks-filter-from")?.value);
  const toVal = toDateOnly(document.getElementById("tasks-filter-to")?.value);
  const showActive = !!document.getElementById("tasks-filter-active")?.checked;
  const showArchived = !!document.getElementById("tasks-filter-archived")?.checked;
  
  let tasks = allTasks.slice();
  if (nameVal) tasks = tasks.filter(t => (t.title || "").toLowerCase().includes(nameVal));
  if (fromVal) tasks = tasks.filter(t => getTaskDate(t) >= fromVal);
  if (toVal) tasks = tasks.filter(t => getTaskDate(t) <= toVal);
  if (!showActive || !showArchived) {
    tasks = tasks.filter((t) => {
      const archived = !!t?.isDeleted;
      if (archived && showArchived) return true;
      if (!archived && showActive) return true;
      return false;
    });
  }
  
  if (tasks.length === 0) {
    list.innerHTML = "<div class='empty-state'>Filtreye uygun ödev bulunamadı.</div>";
    return;
  }
  
  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = "list-item";
    const dateStr = getTaskDate(task).toLocaleDateString("tr-TR");
    const isArchived = !!task?.isDeleted;
    const actionsHtml = userRole === "teacher"
      ? `<button class="btn btn-danger btn-task-list-delete" data-task-id="${task.id}" style="padding:6px 10px;">Sil</button>`
      : `<span class="badge badge-info">Detay</span>`;
    const archiveBadge = isArchived
      ? `<small style="color:#ef4444;display:block;">Arşivlendi</small>`
      : "";
    div.innerHTML = `
      <div style="flex:1;">
        <div style="font-weight:600;">${task.title || "Başlıksız"}</div>
        <small style="color:#666;">📅 ${dateStr}</small>
        ${archiveBadge}
      </div>
      ${actionsHtml}
    `;
    div.onclick = () => openTaskStudentsModal(task);
    if (userRole === "teacher") {
      const deleteBtn = div.querySelector(".btn-task-list-delete");
      if (deleteBtn) {
        deleteBtn.onclick = async (ev) => {
          ev.stopPropagation();
          await archiveTaskById(task);
        };
        if (isArchived) {
          deleteBtn.disabled = true;
          deleteBtn.innerText = "Silindi";
        }
      }
    }
    list.appendChild(div);
  });
}

async function archiveTaskById(task) {
  if (!task?.id || userRole !== "teacher") return;
  if (task?.isDeleted) {
    showNotice("Bu ödev zaten arşivlenmiş.", "#f39c12");
    return;
  }
  const ok = await confirmDialog(`"${task.title || "Ödev"}" arşivlensin mi?`);
  if (!ok) return;
  try {
    await updateDoc(doc(db, "activities", task.id), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: currentUserId || null,
      updatedAt: serverTimestamp()
    });
    showNotice("Ödev arşivlendi. Öğrenci geçmişinde kalacak.", "#2ecc71");
  } catch (e) {
    showNotice("Silme hatası: " + e.message, "#e74c3c");
  }
}

function loadAllTasksModal() {
  const list = document.getElementById("all-tasks-list");
  if (!list) return;
  list.innerHTML = "";
  
  if (allTasks.length === 0) {
    list.innerHTML = "<div class='empty-state'>Ödev bulunamadı.</div>";
    return;
  }
  
  allTasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = "list-item";
    const dateStr = getTaskDate(task).toLocaleDateString("tr-TR");
    div.innerHTML = `
      <div style="flex:1;">
        <div style="font-weight:600;">${task.title || "Başlıksız"}</div>
        <small style="color:#666;">📅 ${dateStr}</small>
      </div>
      <span class="badge badge-info">Düzenle</span>
    `;
    div.onclick = async () => {
      if (allTasksModal) allTasksModal.style.display = "none";
      await openTaskModal(task.id, task, false);
      const editBtn = document.getElementById("btn-edit-task");
      if (editBtn) editBtn.click();
    };
    list.appendChild(div);
  });
}

async function openTaskStudentsModal(task) {
  if (!taskStudentsModal) return;
  currentTaskStudentsId = task.id;
  const title = document.getElementById("task-students-title");
  const list = document.getElementById("task-students-list");
  if (title) title.innerText = `Ödev Durumu: ${task.title || "Başlıksız"}`;
  if (!list) return;
  const classSel = document.getElementById("task-students-filter-class");
  const sectionSel = document.getElementById("task-students-filter-section");
  await populateClassSectionFilters(classSel, sectionSel);
  await renderTaskStudentsList(task);
  taskStudentsModal.style.display = "flex";
}

async function loadReportsModal() {
  const list = document.getElementById("reports-list");
  if (!list) return;
  list.innerHTML = "<div class='loading'>Yükleniyor...</div>";
  try {
    const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
    const studentsSnap = await getDocs(studentsQuery);
    const students = [];
    studentsSnap.forEach(docSnap => students.push({ id: docSnap.id, ...docSnap.data() }));
    const displayStudents = userRole === "teacher"
      ? getUniqueStudents(getTeacherManagedStudents(students))
      : getUniqueStudents(students);
    
    list.innerHTML = "";
    if (displayStudents.length === 0) {
      list.innerHTML = "<div class='empty-state'>Öğrenci bulunamadı.</div>";
      return;
    }
    
    const classGroups = new Map();
    displayStudents.forEach(s => {
      const key = `${s.className || "-"}|${s.section || "-"}`;
      if (!classGroups.has(key)) classGroups.set(key, []);
      classGroups.get(key).push(s);
    });
    
    for (const [key, group] of classGroups.entries()) {
      const [className, section] = key.split("|");
      const totalStudents = group.length;
      const totalTasks = allTasks.length || 1;
      let completedTotal = 0;
      
      const userIds = group.map(g => g.id);
      const chunks = chunkArray(userIds, 10);
      for (const ch of chunks) {
        const compSnap = await getDocs(query(collection(db, "completions"), where("userId", "in", ch)));
        completedTotal += compSnap.size;
      }
      
      const classAssignments = contentAssignments.filter(a => assignmentMatchesClass(a, className, section));
      const totalActivitiesForClass = classAssignments.length;
      let completedActivitiesTotal = 0;
      if (userIds.length && totalActivitiesForClass) {
        const assignedIds = new Set(classAssignments.map(a => a.contentId));
        const chunks2 = chunkArray(userIds, 10);
        for (const ch2 of chunks2) {
          const progSnap = await getDocs(query(collection(db, "contentProgress"), where("userId", "in", ch2)));
          progSnap.forEach((docSnap) => {
            const p = docSnap.data();
            if (!assignedIds.has(p.contentId)) return;
            let best = 0;
            Object.values(p.appUsage || {}).forEach((u) => {
              const percent = u?.percent || 0;
              if (percent > best) best = percent;
            });
            const done = best > 0 || (p.completedItemIds || []).length > 0;
            if (done) completedActivitiesTotal++;
          });
        }
      }
      const totalPossibleClass = (totalTasks + totalActivitiesForClass) * totalStudents;
      const completedAll = completedTotal + completedActivitiesTotal;
      const completionRate = totalPossibleClass > 0
        ? Math.round((completedAll / totalPossibleClass) * 100)
        : 0;
      const cappedRate = Math.min(100, Math.max(0, completionRate));
      
      const row = document.createElement("div");
      row.className = "list-item";
      row.style.cursor = "pointer";
      row.innerHTML = `
        <div style="flex:1;">
          <div style="font-weight:600;">Sınıf ${className}/${section}</div>
          <small style="color:#666;display:block;margin-top:4px;">
            Mevcut: ${totalStudents} | Tamamlama: %${cappedRate}
          </small>
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn btn-primary btn-class-pdf" style="padding:6px 10px;">Sınıf Raporu İndir</button>
          <button class="btn btn-primary btn-class-all" style="padding:6px 10px; background:#1d4ed8;">Tüm Öğrenciler PDF</button>
        </div>
      `;
      
      const pdfBtn = row.querySelector(".btn-class-pdf");
      pdfBtn.onclick = (e) => {
        e.stopPropagation();
        downloadClassPdf(className, section, group, cappedRate);
      };
      const allBtn = row.querySelector(".btn-class-all");
      allBtn.onclick = (e) => {
        e.stopPropagation();
        openAllStudentsReportPreview(className, section, group);
      };
      
      row.onclick = async () => {
        openClassStudentsModal(className, section, group, totalTasks);
      };
      
      list.appendChild(row);
    }
  } catch (e) {
    console.error("loadReportsModal error:", e);
    list.innerHTML = `<div class='empty-state'>Rapor listesi yüklenemedi: ${escapeHtml(e?.message || "Bilinmeyen hata")}</div>`;
  }
  syncRunnerSaveButtons();
}

async function openClassStudentsModal(className, section, group, totalTasks) {
  if (!taskStudentsModal) return;
  const title = document.getElementById("task-students-title");
  const list = document.getElementById("task-students-list");
  if (title) title.innerText = `Sınıf ${className}/${section} Öğrenciler`;
  if (!list) return;
  list.innerHTML = "<div class='loading'>Öğrenciler yükleniyor...</div>";
  
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "6px";
  
  list.innerHTML = "";
  const classAssignments = contentAssignments.filter(a => assignmentMatchesClass(a, className, section));
  const assignedIds = new Set(classAssignments.map(a => a.contentId));

  for (let i = 0; i < group.length; i++) {
    const student = group[i];
    const completionsQuery = query(collection(db, "completions"), where("userId", "==", student.id));
    const completionsSnap = await getDocs(completionsQuery);
    
    let completedCount = completionsSnap.size;
    let totalScore = 0;
    let scoreSampleCount = 0;
    let totalXP = getStudentXPValue(student);
    const completions = [];
    
    completionsSnap.forEach(docSnap => {
      const data = docSnap.data();
      const totalQ = Math.max(0, Number(data.totalQuestions || 0));
      const correctQ = Math.max(0, Number(data.correctAnswers || 0));
      if (totalQ > 0) {
        totalScore += Math.round((correctQ / totalQ) * 100);
        scoreSampleCount++;
      }
      completions.push(data);
    });

    let completedActivities = 0;
    const totalActivities = classAssignments.filter(a => assignmentMatchesStudentFor(a, student)).length;
    if (assignedIds.size) {
      const progSnap = await getDocs(query(collection(db, "contentProgress"), where("userId", "==", student.id)));
      progSnap.forEach((docSnap) => {
        const p = docSnap.data() || {};
        if (!assignedIds.has(p.contentId)) return;
        const totalItems = Math.max(0, Number(p.totalItems || 0));
        const completedItems = Array.isArray(p.completedItemIds) ? p.completedItemIds.length : 0;
        let partial = 0;
        Object.values(p.appUsage || {}).forEach((u) => {
          const val = Math.max(0, Math.min(100, Number(u?.percent || 0)));
          partial += val / 100;
        });
        const effectiveCompleted = Math.min(totalItems, completedItems + partial);
        const fromItems = totalItems > 0 ? Math.round((effectiveCompleted / totalItems) * 100) : 0;
        let fromApps = 0;
        Object.values(p.appUsage || {}).forEach((u) => {
          fromApps = Math.max(fromApps, Math.max(0, Math.min(100, Number(u?.percent || 0))));
        });
        const activityPercent = Math.max(fromItems, fromApps);
        if (activityPercent > 0) {
          completedActivities++;
          totalScore += activityPercent;
          scoreSampleCount++;
        }
      });
    }

    const totalPossible = totalTasks + totalActivities;
    const completedTotal = completedCount + completedActivities;
    const completionRateStudent = totalPossible > 0 ? Math.round((completedTotal / totalPossible) * 100) : 0;
    const cappedRateStudent = Math.min(100, Math.max(0, completionRateStudent));
    const avgScore = scoreSampleCount > 0 ? Math.round(totalScore / scoreSampleCount) : cappedRateStudent;
    const displayName = getUserDisplayName(student);
    
    const div = document.createElement("div");
    div.className = "student-list-item";
    div.innerHTML = `
      <div>
        <strong>${displayName}</strong>
        <small style="display: block; color: #666;">
          ${completedTotal}/${totalPossible} toplam | Ort: %${avgScore} | ⭐ ${totalXP} XP
        </small>
      </div>
      <div style="display:flex; gap:6px; align-items:center;">
        <span class="badge ${cappedRateStudent >= 80 ? 'badge-success' : cappedRateStudent >= 50 ? 'badge-info' : 'badge-pending'}">
          %${cappedRateStudent}
        </span>
        <button class="btn btn-primary" style="padding:4px 8px;">Rapor</button>
      </div>
    `;
    const reportBtn = div.querySelector("button");
    reportBtn.onclick = async (e) => {
      e.stopPropagation();
      await showStudentDetail(student, completions, i + 1);
      if (taskStudentsModal) taskStudentsModal.style.display = "none";
    };
    div.onclick = () => {
      if (reportsModal) reportsModal.style.display = "none";
      if (taskStudentsModal) taskStudentsModal.style.display = "none";
      showStudentDetail(student, completions, i + 1);
    };
    container.appendChild(div);
  }
  
  list.appendChild(container);
  taskStudentsModal.style.display = "flex";
}

function populateTaskTargets() {
  const targetSelect = document.getElementById("task-target");
  if (!targetSelect) return;
  targetSelect.innerHTML = "<option value=\"all\">Tüm Sınıflar</option>";
  
  const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
  getDocs(studentsQuery).then((snap) => {
    const classMap = new Map();
    const rows = [];
    snap.forEach(docSnap => {
      rows.push({ id: docSnap.id, ...docSnap.data() });
    });
    scopeStudentsForCurrentRole(rows).forEach((data) => {
      if (!data.className) return;
      if (!classMap.has(data.className)) classMap.set(data.className, new Set());
      if (data.section) classMap.get(data.className).add(data.section);
    });
    
    Array.from(classMap.keys()).sort().forEach(className => {
      const optClass = document.createElement("option");
      optClass.value = `class:${className}`;
      optClass.textContent = `Sınıf ${className} (Tümü)`;
      targetSelect.appendChild(optClass);
      
      Array.from(classMap.get(className)).sort().forEach(section => {
        const opt = document.createElement("option");
        opt.value = `class:${className}|section:${section}`;
        opt.textContent = `Sınıf ${className}/${section}`;
        targetSelect.appendChild(opt);
      });
    });
  });
}

async function downloadClassPdf(className, section, students, completionRate) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    showNotice("PDF kütüphanesi yüklenemedi!", "#e74c3c");
    return;
  }
  
  const totalTasks = allTasks.length || 0;
  const userIds = students.map(s => s.id);
  const chunks = chunkArray(userIds, 10);
  const completionMap = new Map();
  
  for (const ch of chunks) {
    const compSnap = await getDocs(query(collection(db, "completions"), where("userId", "in", ch)));
    compSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (!completionMap.has(data.userId)) completionMap.set(data.userId, []);
      completionMap.get(data.userId).push(data);
    });
  }
  
  const classAssignments = contentAssignments.filter(a => assignmentMatchesClass(a, className, section));
  const assignedIds = new Set(classAssignments.map(a => a.contentId));
  const rows = [];
  let completedActivitiesSum = 0;
  let totalActivitiesSum = 0;
  let completedTasksSum = 0;
  let totalTasksSum = (allTasks.length || 0) * (students.length || 0);
  for (const s of students) {
    const comps = completionMap.get(s.id) || [];
    const completedCount = comps.length;
    let totalScore = 0;
    let scoreSampleCount = 0;
    comps.forEach(c => {
      const totalQ = Math.max(0, Number(c.totalQuestions || 0));
      const correctQ = Math.max(0, Number(c.correctAnswers || 0));
      if (totalQ > 0) {
        totalScore += Math.round((correctQ / totalQ) * 100);
        scoreSampleCount++;
      }
    });
    let completedActivities = 0;
    if (assignedIds.size) {
      const progSnap = await getDocs(query(collection(db, "contentProgress"), where("userId", "==", s.id)));
      progSnap.forEach((docSnap) => {
        const p = docSnap.data() || {};
        if (!assignedIds.has(p.contentId)) return;
        const totalItems = Math.max(0, Number(p.totalItems || 0));
        const completedItems = Array.isArray(p.completedItemIds) ? p.completedItemIds.length : 0;
        let partial = 0;
        let best = 0;
        Object.values(p.appUsage || {}).forEach((u) => {
          const percent = Math.max(0, Math.min(100, Number(u?.percent || 0)));
          partial += percent / 100;
          if (percent > best) best = percent;
        });
        const effectiveCompleted = Math.min(totalItems, completedItems + partial);
        const fromItems = totalItems > 0 ? Math.round((effectiveCompleted / totalItems) * 100) : 0;
        const activityPercent = Math.max(best, fromItems);
        if (activityPercent > 0) {
          completedActivities++;
          totalScore += activityPercent;
          scoreSampleCount++;
        }
      });
    }
    const totalActivities = classAssignments.filter(a => assignmentMatchesStudentFor(a, s)).length;
    totalActivitiesSum += totalActivities;
    completedActivitiesSum += completedActivities;
    completedTasksSum += completedCount;
    const totalPossible = totalTasks + totalActivities;
    const completedTotal = completedCount + completedActivities;
    const completionRateStudent = totalPossible > 0 ? Math.round((completedTotal / totalPossible) * 100) : 0;
    const avgScore = scoreSampleCount > 0
      ? Math.round(totalScore / scoreSampleCount)
      : Math.min(100, Math.max(0, completionRateStudent));
    rows.push({
      name: getUserDisplayName(s),
      completedCount: completedTotal,
      completionRate: Math.min(100, Math.max(0, completionRateStudent)),
      avgScore,
      xp: getStudentXPValue(s),
      totalPossible
    });
  }
  
  const classAvgCompletion = rows.length ? Math.round(rows.reduce((a, b) => a + b.completionRate, 0) / rows.length) : 0;
  const classAvgScore = rows.length ? Math.round(rows.reduce((a, b) => a + b.avgScore, 0) / rows.length) : 0;
  const classAvgXP = rows.length ? Math.round(rows.reduce((a, b) => a + b.xp, 0) / rows.length) : 0;
  const taskCompletionRate = totalTasksSum > 0 ? Math.round((completedTasksSum / totalTasksSum) * 100) : 0;
  const activityCompletionRate = totalActivitiesSum > 0 ? Math.round((completedActivitiesSum / totalActivitiesSum) * 100) : 0;
  
  const container = document.createElement("div");
  container.style.cssText = `
    width: 760px;
    padding: 16px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #1f2937;
    background: #ffffff;
  `;
  
  const listItems = rows.map((r, idx) => {
    const color = r.completionRate >= 80 ? "#2ecc71" : r.completionRate >= 60 ? "#4a90e2" : "#f39c12";
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border:1px solid #e5e7eb;border-left:5px solid ${color};border-radius:8px;margin-bottom:5px;font-size:12px;">
        <div style="display:flex;gap:8px;align-items:center;">
          <strong>${idx + 1}. ${r.name}</strong>
          <span style="color:#6b7280;font-size:11px;">%${r.completionRate} | Ort: %${r.avgScore} | ⭐ ${r.xp} XP | ${r.completedCount}/${r.totalPossible}</span>
        </div>
        <span style="background:${color};color:white;border-radius:999px;padding:2px 8px;font-size:11px;">%${r.completionRate}</span>
      </div>
    `;
  }).join("");
  
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h2 style="margin:0;color:#2563eb;">Sınıf Raporu</h2>
      <span style="font-size:12px;color:#6b7280;">${new Date().toLocaleDateString("tr-TR")}</span>
    </div>
    <div style="margin-bottom:10px;">
      <strong>Sınıf/Şube:</strong> ${className}/${section} | <strong>Öğrenci:</strong> ${rows.length}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:10px;">
      <div style="padding:10px;background:#f0f7ff;border-radius:8px;">
        <div style="font-size:12px;color:#6b7280;">Ortalama Tamamlama</div>
        <div style="font-size:18px;font-weight:bold;color:#2563eb;">%${classAvgCompletion}</div>
      </div>
      <div style="padding:10px;background:#f0fff4;border-radius:8px;">
        <div style="font-size:12px;color:#6b7280;">Ortalama Başarı</div>
        <div style="font-size:18px;font-weight:bold;color:#16a34a;">%${classAvgScore}</div>
      </div>
      <div style="padding:10px;background:#fff7ed;border-radius:8px;">
        <div style="font-size:12px;color:#6b7280;">Ortalama XP</div>
        <div style="font-size:18px;font-weight:bold;color:#f59e0b;">${classAvgXP} XP</div>
      </div>
      <div style="padding:10px;background:#eef2ff;border-radius:8px;">
        <div style="font-size:12px;color:#6b7280;">Etkinlik Tamamlama</div>
        <div style="font-size:18px;font-weight:bold;color:#4338ca;">%${activityCompletionRate}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
      <div>
        <div style="font-size:12px;color:#6b7280;">Ödev Tamamlama</div>
        <div style="height:10px;background:#f3f4f6;border-radius:999px;overflow:hidden;margin-top:6px;">
          <div style="height:10px;background:#3b82f6;width:${Math.min(100, Math.max(0, taskCompletionRate))}%;"></div>
        </div>
      </div>
      <div>
        <div style="font-size:12px;color:#6b7280;">Etkinlik Tamamlama</div>
        <div style="height:10px;background:#f3f4f6;border-radius:999px;overflow:hidden;margin-top:6px;">
          <div style="height:10px;background:#22c55e;width:${Math.min(100, Math.max(0, activityCompletionRate))}%;"></div>
        </div>
      </div>
    </div>
    <h3 style="margin:0 0 8px 0;color:#111827;">Öğrenci Listesi</h3>
    ${listItems || "<div style='color:#6b7280;'>Veri yok.</div>"}
  `;
  
  document.body.appendChild(container);
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => requestAnimationFrame(r));
  
  const canvas = await html2canvas(container, { scale: 1.5, useCORS: true });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pageWidth;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  let position = 0;
  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
  while (pdfHeight - position > pageHeight) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
  }
  
  pdf.save(`sinif_raporu_${className}_${section}.pdf`);
  document.body.removeChild(container);
}

async function downloadClassStudentsPdf(className, section, students) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    showNotice("PDF kütüphanesi yüklenemedi!", "#e74c3c");
    return;
  }
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const completionsSnap = await getDocs(query(collection(db, "completions"), where("userId", "==", student.id)));
    const completions = [];
    completionsSnap.forEach((docSnap) => completions.push(docSnap.data()));
    await showStudentDetail(student, completions, i + 1);
    const detail = currentStudentDetail;
    if (!detail) continue;
    const html = await buildStudentReportHtml(detail);
    const reportWindow = document.createElement("div");
    reportWindow.style.cssText = "position:fixed; inset:-9999px; width:900px; background:#fff; padding:20px;";
    reportWindow.innerHTML = html;
    document.body.appendChild(reportWindow);
    await new Promise(r => requestAnimationFrame(r));
    const canvas = await html2canvas(reportWindow, { scale: 1.2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(pdfHeight, pageHeight));
    document.body.removeChild(reportWindow);
  }

  pdf.save(`sinif_ogrenci_raporlari_${className}_${section}.pdf`);
}

async function openAllStudentsReportPreview(className, section, students) {
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    showNotice("Yeni pencere açılamadı.", "#e74c3c");
    return;
  }
  if (reportsModal) reportsModal.style.display = "none";
  if (taskStudentsModal) taskStudentsModal.style.display = "none";
  reportWindow.document.write(`
    <html lang="tr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Sınıf Öğrenci Raporları</title>
      <style>
        body { margin: 0; padding: 16px; background:#f4f5f9; font-family: "Montserrat","Segoe UI",Tahoma,Arial,sans-serif; }
        .loading-overlay { position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.9); z-index: 50; }
        .loading-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:14px 18px; box-shadow: 0 10px 24px rgba(0,0,0,0.12); font-weight:600; color:#1f2937; }
      </style>
    </head>
    <body>
      <div class="loading-overlay" id="loading-overlay">
        <div class="loading-card">Raporlar hazırlanıyor...</div>
      </div>
      <div id="report-root"></div>
    </body>
    </html>
  `);
  reportWindow.document.close();
  const blocks = [];
  let sharedStyles = "";
  let failedCount = 0;
  suppressStudentDetailModal = true;
  try {
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      try {
        const completionsSnap = await getDocs(query(collection(db, "completions"), where("userId", "==", student.id)));
        const completions = [];
        completionsSnap.forEach((docSnap) => completions.push(docSnap.data()));
        await showStudentDetail(student, completions, i + 1);
        const detail = currentStudentDetail;
        if (!detail) {
          failedCount++;
          continue;
        }
        const html = await buildStudentReportHtml(detail);
        if (!sharedStyles) {
          const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
          sharedStyles = styleMatch ? styleMatch[1] : "";
        }
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const body = bodyMatch ? bodyMatch[1] : html;
        blocks.push(`<div class="report-page">${body}</div>`);
      } catch (err) {
        failedCount++;
        console.error("openAllStudentsReportPreview student error:", student?.id, err);
      }
    }

    const styleEl = reportWindow.document.createElement("style");
    styleEl.textContent = `
      ${sharedStyles}
      body { margin: 0; padding: 16px; background:#f4f5f9; font-family: "Montserrat","Segoe UI",Tahoma,Arial,sans-serif; }
      .toolbar { position: sticky; top: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; margin-bottom: 12px; display:flex; justify-content: flex-end; gap:8px; z-index: 10; }
      .btn { padding: 10px 14px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; }
      .btn-primary { background: #2f6fed; color: #fff; }
      .report-page { page-break-after: always; background:#fff; padding:10mm; margin-bottom:12px; border-radius: 12px; box-shadow: 0 6px 16px rgba(16, 24, 40, 0.08); }
      .preview-note { background:#fff7ed; border:1px solid #fdba74; color:#9a3412; padding:10px; border-radius:10px; margin-bottom:10px; }
      @page { size: A4; margin: 10mm; }
      @media print {
        body { background:#fff; padding:0; }
        .toolbar, .preview-note { display:none; }
        .report-page { box-shadow:none; margin:0; border-radius:0; }
      }
    `;
    reportWindow.document.head.appendChild(styleEl);
    const root = reportWindow.document.getElementById("report-root");
    if (root) {
      const note = failedCount > 0
        ? `<div class="preview-note">${failedCount} öğrenci raporu hazırlanamadı. Kalan raporlar gösteriliyor.</div>`
        : "";
      root.innerHTML = `
        <div class="toolbar">
          <button id="downloadAll" class="btn btn-primary">Raporu İndir</button>
          <button id="closeAll" class="btn btn-danger" style="background:#dc2626; color:#fff;">Kapat</button>
        </div>
        ${note}
        ${blocks.join("") || "<div class='preview-note'>Hiç rapor oluşturulamadı.</div>"}
      `;
      const btn = reportWindow.document.getElementById("downloadAll");
      if (btn) {
        btn.onclick = () => {
          reportWindow.focus();
          reportWindow.print();
        };
      }
      const closeBtn = reportWindow.document.getElementById("closeAll");
      if (closeBtn) {
        closeBtn.onclick = () => {
          reportWindow.close();
        };
      }
    }
  } catch (e) {
    console.error("openAllStudentsReportPreview error:", e);
    const root = reportWindow.document.getElementById("report-root");
    if (root) {
      root.innerHTML = `<div class="preview-note">Rapor hazırlanırken hata oluştu: ${escapeHtml(e?.message || "Bilinmeyen hata")}</div>`;
    }
  } finally {
    suppressStudentDetailModal = false;
    const overlay = reportWindow.document.getElementById("loading-overlay");
    if (overlay) overlay.style.display = "none";
  }
}

/* ================= İSTATİSTİK SAYFASI ================= */
async function loadStatsPage() {
  if (statsPageLoading) {
    statsPageQueued = true;
    return;
  }
  statsPageLoading = true;
  const loadingEl = document.getElementById("stats-loading");
  const contentEl = document.getElementById("stats-content");
  if (loadingEl) loadingEl.style.display = "block";
  if (contentEl) contentEl.style.display = "none";
  const emptySnap = { forEach: () => {}, size: 0, docs: [] };
  try {
    const safeGetDocs = async (q, timeoutMs = 8000) => {
      try {
        return await Promise.race([
          getDocs(q),
          new Promise((_, reject) => setTimeout(() => reject(new Error("stats-timeout")), timeoutMs))
        ]);
      } catch (e) {
        console.warn("stats query fallback:", e);
        return emptySnap;
      }
    };
    const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
    const [studentsSnap, completionsSnap, contentProgressSnap, blockProgSnap, blockAssignmentsSnap, computeProgSnap, computeStatesSnap, lessonProgSnap, bookTaskProgSnap] = await Promise.all([
      safeGetDocs(studentsQuery),
      safeGetDocs(collection(db, "completions")),
      safeGetDocs(collection(db, "contentProgress")),
      safeGetDocs(collection(db, "blockAssignmentProgress")),
      safeGetDocs(collection(db, "blockAssignments")),
      safeGetDocs(collection(db, "computeAssignmentProgress")),
      safeGetDocs(collection(db, "computeStates")),
      safeGetDocs(collection(db, "lessonProgress")),
      safeGetDocs(collection(db, "bookTaskProgress"))
    ]);
    
    const studentMap = new Map();
    studentsSnap.forEach(doc => {
      if (!studentMap.has(doc.id)) {
        studentMap.set(doc.id, { id: doc.id, ...doc.data() });
      }
    });
    allStudents = Array.from(studentMap.values());
    if (userRole === "teacher") {
      allStudents = getUniqueStudents(getTeacherManagedStudents(allStudents));
    }
    studentIdSet.clear();
    allStudents.forEach((s) => studentIdSet.add(s.id));
    
    let displayStudents = getUniqueStudents(allStudents);
    const studentIdLookup = new Set(displayStudents.map((s) => s.id));
    const teacherTaskIds = new Set((Array.isArray(allTasks) ? allTasks : [])
      .map((t) => String(t.id)));
    const manualTaskIds = new Set((Array.isArray(allTasks) ? allTasks : [])
      .filter((t) => requiresTeacherApprovalTask(t))
      .map((t) => String(t.id)));
    const completionsByUser = new Map();
    const xpByUser = new Map();
    completionsSnap.forEach((docSnap) => {
      const c = docSnap.data();
      if (!studentIdLookup.has(c.userId)) return;
      completionsByUser.set(c.userId, (completionsByUser.get(c.userId) || 0) + 1);
      xpByUser.set(c.userId, (xpByUser.get(c.userId) || 0) + parseXPValue(c.xpEarned));
    });
    const contentDoneByUser = new Map();
    contentProgressSnap.forEach((docSnap) => {
      const p = docSnap.data();
      if (!studentIdLookup.has(p.userId)) return;
      xpByUser.set(p.userId, (xpByUser.get(p.userId) || 0) + parseXPValue(p.totalXP));
      let done = (p.completedItemIds || []).length > 0;
      if (!done) {
        const appUsage = p.appUsage || {};
        done = Object.values(appUsage).some((u) => Number(u?.percent || 0) > 0 || Number(u?.seconds || 0) > 0);
      }
      if (done) contentDoneByUser.set(p.userId, (contentDoneByUser.get(p.userId) || 0) + 1);
    });
    const blockAssignmentTypeById = new Map();
    const blockAssignmentMetaById = new Map();
    blockAssignmentsSnap.forEach((docSnap) => {
      const assignment = docSnap.data() || {};
      const assignmentId = String(docSnap.id);
      blockAssignmentTypeById.set(assignmentId, getBlockHomeworkType(assignment.assignmentType));
      blockAssignmentMetaById.set(assignmentId, {
        id: assignmentId,
        title: String(assignment.title || "Basliksiz blok odevi"),
        userId: String(assignment.userId || ""),
        isDeleted: !!assignment.isDeleted
      });
    });
    const teacherVisibleBlockAssignmentIds = new Set(
      (Array.isArray(blockAssignments) ? blockAssignments : []).map((a) => String(a.id || ""))
    );
    const blockDoneByUser = new Map();
    const block3DDoneByUser = new Map();
    const hiddenBlockCompletionByAssignment = new Map();
    blockProgSnap.forEach((docSnap) => {
      const p = docSnap.data();
      if (!studentIdLookup.has(p.userId)) return;
      xpByUser.set(p.userId, (xpByUser.get(p.userId) || 0) + parseXPValue(p.totalXP));
      const total = Math.max(0, Number(p.totalLevels || 0));
      const completedLevels = Math.max(0, Number(p.completedLevels || 0));
      const done = !!p.completed || Number(p.percent || 0) >= 100 || (total > 0 && completedLevels >= total);
      if (!done) return;
      const assignmentType = blockAssignmentTypeById.get(String(p.assignmentId || ""));
      if (assignmentType === "block3d") {
        block3DDoneByUser.set(p.userId, (block3DDoneByUser.get(p.userId) || 0) + 1);
      } else {
        blockDoneByUser.set(p.userId, (blockDoneByUser.get(p.userId) || 0) + 1);
      }
      const assignmentId = String(p.assignmentId || "");
      if (!assignmentId || teacherVisibleBlockAssignmentIds.has(assignmentId)) return;
      if (!hiddenBlockCompletionByAssignment.has(assignmentId)) {
        hiddenBlockCompletionByAssignment.set(assignmentId, new Set());
      }
      hiddenBlockCompletionByAssignment.get(assignmentId).add(String(p.userId || ""));
    });
    const computeDoneByUser = new Map();
    const computeAssignmentById = new Map(
      (Array.isArray(computeAssignments) ? computeAssignments : []).map((a) => [String(a.id), a])
    );
    computeProgSnap.forEach((docSnap) => {
      const p = docSnap.data() || {};
      const userId = String(p.userId || "");
      if (!studentIdLookup.has(userId)) return;
      xpByUser.set(userId, (xpByUser.get(userId) || 0) + parseXPValue(p.totalXP));
      const assignment = computeAssignmentById.get(String(p.assignmentId || "")) || null;
      const done = isComputeProgressCompleted(p, assignment);
      if (!done) return;
      computeDoneByUser.set(userId, (computeDoneByUser.get(userId) || 0) + 1);
    });
    const computeStateDoneByUser = new Map();
    computeStatesSnap.forEach((docSnap) => {
      const userId = String(docSnap.id || "");
      if (!studentIdLookup.has(userId)) return;
      const state = docSnap.data() || {};
      const levels = Array.isArray(state?.payload?.levels) ? state.payload.levels : [];
      const completedLevels = levels.filter((l) => !!l?.completed).length;
      const hasProgress = completedLevels > 0 || Number(state?.payload?.currentLevelIndex || 0) > 0;
      if (!hasProgress) return;
      computeStateDoneByUser.set(userId, Math.max(1, completedLevels));
      const stateXP = levels.reduce((sum, l) => {
        if (!l?.completed) return sum;
        return sum + Math.max(0, Number(l?.xp || 0));
      }, 0);
      if (stateXP > 0) {
        xpByUser.set(userId, Math.max(xpByUser.get(userId) || 0, stateXP));
      }
    });
    const lessonDoneByUser = new Map();
    lessonProgSnap.forEach((docSnap) => {
      const p = docSnap.data() || {};
      if (!studentIdLookup.has(p.userId)) return;
      xpByUser.set(p.userId, (xpByUser.get(p.userId) || 0) + parseXPValue(p.totalXP));
      const done = !!p.completed || Number(p.percent || 0) >= 100;
      if (!done) return;
      lessonDoneByUser.set(p.userId, (lessonDoneByUser.get(p.userId) || 0) + 1);
    });
    const manualDoneByUser = new Map();
    const manualDoneTaskSetByUser = new Map();
    bookTaskProgSnap.forEach((docSnap) => {
      const p = docSnap.data() || {};
      const userId = String(p.userId || "");
      const taskId = String(p.taskId || "");
      if (!studentIdLookup.has(userId) || !taskId) return;
      if (userRole === "teacher" && teacherTaskIds.size && !teacherTaskIds.has(taskId)) return;
      // Bilinen onaylı ödevleri say; eski/silinmiş görevler için de approved kaydı varsa grafiğe yansıt.
      const approved = !!p.approved;
      if (!approved) return;
      if (manualTaskIds.size && !manualTaskIds.has(taskId)) return;
      if (!manualDoneTaskSetByUser.has(userId)) manualDoneTaskSetByUser.set(userId, new Set());
      const userSet = manualDoneTaskSetByUser.get(userId);
      if (!userSet.has(taskId)) {
        userSet.add(taskId);
        manualDoneByUser.set(userId, (manualDoneByUser.get(userId) || 0) + 1);
      }
      // Onaylı her ödev +5 XP
      xpByUser.set(userId, (xpByUser.get(userId) || 0) + MANUAL_TASK_APPROVAL_XP);
    });

    const studentsXPNeedsUpdate = [];
    allStudents = allStudents.map((student) => {
      const normalizedXP = getStudentXPValue(student, xpByUser);
      const storedXP = parseXPValue(student?.xp);
      if (student?.id && normalizedXP !== storedXP) {
        studentsXPNeedsUpdate.push({ id: student.id, xp: normalizedXP });
      }
      return { ...student, xp: normalizedXP };
    });
    if (studentsXPNeedsUpdate.length) {
      for (let i = 0; i < studentsXPNeedsUpdate.length; i += 400) {
        const chunk = studentsXPNeedsUpdate.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach((row) => {
          batch.set(doc(db, "users", row.id), { xp: row.xp, updatedAt: serverTimestamp() }, { merge: true });
        });
        await batch.commit();
      }
    }
    allStudents.sort((a, b) => getStudentXPValue(b) - getStudentXPValue(a));
    displayStudents = getUniqueStudents(allStudents);

    let totalCompletionRate = 0;
    let totalCompletionsAll = 0;
    let totalPossibleAll = 0;
    let totalXPAll = 0;
    let taskCompletionsTotal = 0;
    let activityCompletionsTotal = 0;
    let blockCompletionsTotal = 0;
    let block3DCompletionsTotal = 0;
    let computeCompletionsTotal = 0;
    let lessonCompletionsTotal = 0;
    let taskPossibleTotal = 0;
    let activityPossibleTotal = 0;
    let blockPossibleTotal = 0;
    let block3DPossibleTotal = 0;
    let computePossibleTotal = 0;
    let lessonPossibleTotal = 0;

    const topCandidates = [];
    for (let i = 0; i < displayStudents.length; i++) {
      const student = displayStudents[i];
      const quizTaskCompletedCount = Number(completionsByUser.get(student.id) || 0);
      const manualApprovedCount = Number(manualDoneByUser.get(student.id) || 0);
      const completedCount = quizTaskCompletedCount + manualApprovedCount;
      const tasksForStudent = allTasks.filter((t) => !t?.isDeleted && taskMatchesStudentFor(t, student));
      const assignmentsForStudent = contentAssignments.filter((a) => !a?.isDeleted && assignmentMatchesStudentFor(a, student));
      const blockAssignmentsForStudent = blockAssignments.filter((a) => !a?.isDeleted && assignmentMatchesStudentFor(a, student));
      const computeAssignmentsForStudent = computeAssignments.filter((a) => !a?.isDeleted && assignmentMatchesStudentFor(a, student));
      const lessonsForStudent = lessons.filter((l) => !l?.isDeleted && assignmentMatchesStudentFor(l, student));
      const completedActivities = Number(contentDoneByUser.get(student.id) || 0);
      const completedBlocks = Number(blockDoneByUser.get(student.id) || 0);
      const completedBlocks3D = Number(block3DDoneByUser.get(student.id) || 0);
      const completedComputes = Math.max(
        Number(computeDoneByUser.get(student.id) || 0),
        Number(computeStateDoneByUser.get(student.id) || 0)
      );
      const completedLessons = Number(lessonDoneByUser.get(student.id) || 0);
      // Atama silinse bile kaydedilmiş öğrenci ilerlemesi grafikte görünmeye devam etsin.
      const totalTasks = Math.max(tasksForStudent.length || 0, completedCount);
      const totalActivities = Math.max(assignmentsForStudent.length || 0, completedActivities);
      const totalBlocks = Math.max(
        blockAssignmentsForStudent.filter((a) => getBlockHomeworkType(a.assignmentType) !== "block3d").length || 0,
        completedBlocks
      );
      const totalBlocks3D = Math.max(
        blockAssignmentsForStudent.filter((a) => getBlockHomeworkType(a.assignmentType) === "block3d").length || 0,
        completedBlocks3D
      );
      const totalComputes = Math.max(computeAssignmentsForStudent.length || 0, completedComputes);
      const totalLessons = Math.max(lessonsForStudent.length || 0, completedLessons);

      const totalPossible = totalTasks + totalActivities + totalBlocks + totalBlocks3D + totalComputes + totalLessons;
      const completedTotal = completedCount + completedActivities + completedBlocks + completedBlocks3D + completedComputes + completedLessons;
      const completionRate = totalPossible > 0 ? Math.round((completedTotal / totalPossible) * 100) : 0;
      const cappedRate = Math.min(100, Math.max(0, completionRate));
      
      totalCompletionRate += cappedRate;
      totalCompletionsAll += completedTotal;
      totalPossibleAll += totalPossible;
      const studentXP = getStudentXPValue(student);
      totalXPAll += studentXP;
      taskCompletionsTotal += completedCount;
      activityCompletionsTotal += completedActivities;
      blockCompletionsTotal += completedBlocks;
      block3DCompletionsTotal += completedBlocks3D;
      computeCompletionsTotal += completedComputes;
      lessonCompletionsTotal += completedLessons;
      taskPossibleTotal += totalTasks;
      activityPossibleTotal += totalActivities;
      blockPossibleTotal += totalBlocks;
      block3DPossibleTotal += totalBlocks3D;
      computePossibleTotal += totalComputes;
      lessonPossibleTotal += totalLessons;
      
      const displayName = getUserDisplayName(student);
      topCandidates.push({
        name: displayName,
        xp: studentXP,
        completionRate: cappedRate,
        selectedAvatarId: String(student.selectedAvatarId || AVATAR_DEFAULT_ID)
      });
    }
    
    const topList = document.getElementById("top-students-list");
    const topCard = document.getElementById("top-students-card");
    if (topCard && userRole === "teacher") topCard.style.display = "block";
    if (topList) {
      topList.innerHTML = "";
      topCandidates.sort((a, b) => b.xp - a.xp);
      const topFive = topCandidates.slice(0, 5);
      if (topFive.length === 0) {
        topList.innerHTML = "<div class='empty-state'>Veri yok.</div>";
      } else {
        topFive.forEach((s, idx) => {
          const row = document.createElement("div");
          row.className = `top-student-row rank-${idx + 1}`;
          const rankNum = idx + 1;
          const medal = rankNum === 1 ? "🥇" : rankNum === 2 ? "🥈" : rankNum === 3 ? "🥉" : "";
          const avatar = getAvatarById(s.selectedAvatarId || AVATAR_DEFAULT_ID);
          const avatarImg = buildAvatarImageDataUri(avatar);
          row.innerHTML = `
            <div class="top-rank-badge">${rankNum}</div>
            <div class="top-student-avatar"><img src="${avatarImg}" alt="${s.name} avatar"></div>
            <div>
              <div class="top-student-name">${s.name}${medal ? `<span class="top-student-medal">${medal}</span>` : ""}</div>
              <div class="top-student-meta">Başarı: %${s.completionRate}</div>
            </div>
            <div class="top-student-xp">${s.xp} XP</div>
          `;
          topList.appendChild(row);
        });
      }
    }

    const classAvg = displayStudents.length > 0 ? Math.round(totalCompletionRate / displayStudents.length) : 0;
    const activeStudents = topCandidates.filter((s) => s.completionRate > 0 || s.xp > 0).length;
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = String(val);
    };
    setText("stats-total-students", displayStudents.length);
    setText("stats-active-students", activeStudents);
    setText("stats-avg-completion", `${classAvg}%`);
    setText("stats-total-completions", totalCompletionsAll);
    setText("stats-total-xp", totalXPAll);
    setText("stats-task-completions", taskCompletionsTotal);
    setText("stats-activity-completions", activityCompletionsTotal);
    setText("stats-block-completions", blockCompletionsTotal);
    setText("stats-compute-completions", computeCompletionsTotal);

    const ensureBlockAnomalyPanel = () => {
      const parent = document.getElementById("teacher-stats-content");
      if (!parent) return null;
      let panel = document.getElementById("stats-block-anomaly");
      if (!panel) {
        panel = document.createElement("div");
        panel.id = "stats-block-anomaly";
        panel.style.marginTop = "10px";
        panel.style.padding = "10px";
        panel.style.borderRadius = "10px";
        panel.style.border = "1px solid #f59e0b";
        panel.style.background = "#fff7ed";
        panel.style.color = "#7c2d12";
        panel.style.fontSize = "13px";
        panel.style.display = "none";
        parent.appendChild(panel);
      }
      return panel;
    };
    const anomalyPanel = ensureBlockAnomalyPanel();
    if (anomalyPanel) {
      if (hiddenBlockCompletionByAssignment.size === 0) {
        anomalyPanel.style.display = "none";
        anomalyPanel.innerHTML = "";
      } else {
        const lines = [];
        const debugRows = [];
        hiddenBlockCompletionByAssignment.forEach((userSet, assignmentId) => {
          const meta = blockAssignmentMetaById.get(assignmentId) || {};
          const studentNames = Array.from(userSet).map((uid) => {
            const s = studentMap.get(uid);
            return s ? getUserDisplayName(s) : uid;
          });
          debugRows.push({
            assignmentId,
            title: meta.title || assignmentId,
            isDeleted: !!meta.isDeleted,
            students: studentNames
          });
          const stateText = meta.isDeleted ? " (arsivli/silinmis)" : "";
          lines.push(`<li><strong>${meta.title || assignmentId}</strong>${stateText}<br><span>Ogrenciler: ${studentNames.join(", ")}</span></li>`);
        });
        console.info("Listede gorunmeyen tamamlanmis blok odevleri:", debugRows);
        anomalyPanel.style.display = "block";
        anomalyPanel.innerHTML = `<div style="font-weight:700; margin-bottom:6px;">Listede olmayan tamamlanmis blok odevi bulundu</div><ul style="margin:0; padding-left:16px;">${lines.join("")}</ul>`;
      }
    }
    
    renderClassChart(totalCompletionsAll, totalPossibleAll || 0);
    renderClassTypeChart({
      tasksDone: taskCompletionsTotal,
      tasksTotal: Math.max(taskPossibleTotal, taskCompletionsTotal),
      activitiesDone: activityCompletionsTotal,
      activitiesTotal: Math.max(activityPossibleTotal, activityCompletionsTotal),
      blockDone: blockCompletionsTotal,
      blockTotal: Math.max(blockPossibleTotal, blockCompletionsTotal),
      block3DDone: block3DCompletionsTotal,
      block3DTotal: Math.max(block3DPossibleTotal, block3DCompletionsTotal),
      computeDone: computeCompletionsTotal,
      computeTotal: Math.max(computePossibleTotal, computeCompletionsTotal),
      lessonsDone: lessonCompletionsTotal,
      lessonsTotal: Math.max(lessonPossibleTotal, lessonCompletionsTotal)
    });
    
    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) contentEl.style.display = "block";
    
  } catch (error) {
    console.error("İstatistik hatası:", error);
    if (loadingEl) loadingEl.innerHTML = "Hata: " + error.message;
  } finally {
    // Hata olsa bile panel "Yükleniyor" ekranında takılı kalmasın.
    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) contentEl.style.display = "block";
    statsPageLoading = false;
    if (statsPageQueued) {
      statsPageQueued = false;
      setTimeout(() => loadStatsPage(), 0);
    }
  }
}

function renderClassChart(completedCount, totalPossible) {
  const ctx = document.getElementById("classChart");
  if (!ctx) return;
  
  if (classChart) classChart.destroy();
  
  const total = Math.max(0, totalPossible || 0);
  const completed = Math.min(Math.max(0, completedCount || 0), total);
  const pending = Math.max(total - completed, 0);
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const summaryEl = document.getElementById("class-chart-summary");
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="pie-summary-item completed">
        <div class="pie-summary-val">${completed}</div>
        <div class="pie-summary-label">Tamamlanan • %${completedPct}</div>
      </div>
      <div class="pie-summary-item pending">
        <div class="pie-summary-val">${pending}</div>
        <div class="pie-summary-label">Bekleyen • %${pendingPct}</div>
      </div>
      <div class="pie-summary-item total">
        <div class="pie-summary-val">${total}</div>
        <div class="pie-summary-label">Toplam Görev</div>
      </div>
    `;
  }
  
  classChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Tamamlanan", "Bekleyen"],
      datasets: [{
        data: [completed, pending],
        backgroundColor: ["rgba(46, 204, 113, 0.85)", "rgba(231, 76, 60, 0.85)"],
        borderColor: ["rgba(46, 204, 113, 1)", "rgba(231, 76, 60, 1)"],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "48%",
      layout: {
        padding: { top: 2, bottom: 2, left: 2, right: 2 }
      },
      plugins: {
        legend: { display: false },
        title: { display: false }
      }
    }
  });
}

function showConfirm(message) {
  try {
    if (typeof confirmDialog === "function") {
      return confirmDialog(message || "Emin misiniz?");
    }
  } catch (e) {}
  return Promise.resolve(window.confirm(message || "Emin misiniz?"));
}

function renderClassTypeChart(data) {
  const ctx = document.getElementById("classTypeChart");
  if (!ctx) return;
  if (classTypeChart) classTypeChart.destroy();

  const pct = (done, total) => {
    const t = Math.max(0, Number(total || 0));
    if (t <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((Number(done || 0) / t) * 100)));
  };

  classTypeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Ödev", "Etkinlik", "Blok", "3D Blok", "Compute", "Derslerim"],
      datasets: [{
        label: "Tamamlama %",
        data: [
          pct(data.tasksDone, data.tasksTotal),
          pct(data.activitiesDone, data.activitiesTotal),
          pct(data.blockDone, data.blockTotal),
          pct(data.block3DDone, data.block3DTotal),
          pct(data.computeDone, data.computeTotal),
          pct(data.lessonsDone, data.lessonsTotal)
        ],
        backgroundColor: [
          "rgba(59,130,246,0.75)",
          "rgba(16,185,129,0.75)",
          "rgba(245,158,11,0.75)",
          "rgba(239,68,68,0.78)",
          "rgba(139,92,246,0.75)",
          "rgba(20,184,166,0.76)"
        ],
        borderColor: [
          "rgba(37,99,235,1)",
          "rgba(5,150,105,1)",
          "rgba(217,119,6,1)",
          "rgba(220,38,38,1)",
          "rgba(124,58,237,1)",
          "rgba(13,148,136,1)"
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: (v) => `${v}%` }
        }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: false
        }
      }
    }
  });
}

async function showStudentDetail(student, completions, rank) {
  if (taskStudentsModal) taskStudentsModal.style.display = "none";
  document.getElementById("student-detail-name").innerText = 
    getUserDisplayName(student) + " - Detaylı İstatistik";
  
  const totalTasks = allTasks.length;
  const completedCount = completions.length;
  
  let totalScore = 0;
  let totalTime = 0;
  let totalXP = 0;
  
  const taskHistory = [];
  
  for (const comp of completions) {
    const score = (comp.correctAnswers / comp.totalQuestions) * 100;
    totalScore += score;
    if (comp.duration) totalTime += comp.duration;
    totalXP += comp.xpEarned || 0;
    
    const task = allTasks.find(t => t.id === comp.taskId);
    taskHistory.push({
      title: task ? task.title : "Bilinmeyen Ödev",
      score: Math.round(score),
      duration: comp.duration || 0,
      date: comp.completedAt ? comp.completedAt.toDate().toLocaleDateString("tr-TR") : "-",
      xp: comp.xpEarned || 0
    });
  }
  try {
    const progSnap = await getDocs(query(collection(db, "bookTaskProgress"), where("userId", "==", student.id)));
    progSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data?.approved) return;
      const task = allTasks.find(t => t.id === data.taskId);
      taskHistory.push({
        title: task ? task.title : `${data.bookName || "Kitap"} ${data.bookTest || ""}`.trim() || "Kitap/Test Ödevi",
        score: 100,
        duration: 0,
        date: data.updatedAt && typeof data.updatedAt.toDate === "function"
          ? data.updatedAt.toDate().toLocaleDateString("tr-TR")
          : "-",
        xp: 0
      });
    });
  } catch (e) {
    console.error("Kitap/test ödevleri yüklenemedi:", e);
  }
  let lessonHistory = [];
  try {
    const lessonProgSnap = await getDocs(query(collection(db, "lessonProgress"), where("userId", "==", student.id)));
    lessonProgSnap.forEach((docSnap) => {
      const lp = docSnap.data() || {};
      const lesson = lessons.find((l) => l.id === lp.lessonId);
      const percent = Math.max(0, Math.min(100, Number(lp.percent || 0)));
      const xp = Math.max(0, Number(lp.totalXP || 0));
      totalXP += xp;
      lessonHistory.push({
        title: `Ders: ${lesson?.title || "Ders"}`,
        score: percent,
        duration: 0,
        date: lp.updatedAt && typeof lp.updatedAt.toDate === "function"
          ? lp.updatedAt.toDate().toLocaleDateString("tr-TR")
          : "-",
        xp
      });
    });
    taskHistory.push(...lessonHistory);
  } catch (e) {
    console.error("Ders geçmişi yüklenemedi:", e);
  }
  const quizStats = await fetchStudentQuizStats(student.id);
  totalXP += quizStats.totalXP;
  const computeStats = await fetchComputeRunStats(student.id);
  totalXP += Math.max(0, Number(computeStats?.totalXP || 0));
  const computeHistory = (Array.isArray(computeStats?.runs) ? computeStats.runs : []).map((run) => {
    const durationSec = Math.max(0, Number(run.durationSeconds || 0));
    const percent = Math.max(0, Math.min(100, Number(run.percent || 0)));
    const updatedMs = Math.max(0, Number(run.updatedAtMs || 0));
    return {
      title: run?.title || "Compute It Ödevi",
      score: Math.round(percent),
      duration: durationSec,
      date: updatedMs > 0 ? new Date(updatedMs).toLocaleDateString("tr-TR") : "-",
      xp: Math.max(0, Number(run.xp || 0))
    };
  });
  if (computeHistory.length) {
    taskHistory.push(...computeHistory);
  }
  const quizHistory = quizStats.items.map((q) => ({
    title: q.quizTitle || "Quiz",
    correct: Math.max(0, Number(q.correct || 0)),
    wrong: Math.max(0, Number(q.wrong || 0)),
    answered: Math.max(0, Number(q.answered || 0)),
    successRate: Math.max(0, Number(q.successRate || 0)),
    xp: Math.max(0, Number(q.xpEarned || 0)),
    durationText: formatQuizDurationText(q.durationMs, q.durationMinutes),
    date: q.finishedAtMs ? new Date(Number(q.finishedAtMs)).toLocaleDateString("tr-TR") : "-"
  }));
  
  const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
  const avgTime = completedCount > 0 ? Math.round(totalTime / completedCount / 60) : 0;
  const totalSystemSec = Number(student?.totalTimeSeconds || 0);
  const totalMinutes = Math.round(totalSystemSec / 60);
  const systemTimeText = `${totalMinutes} dk`;
  
  document.getElementById("detail-total-tasks").innerText = totalTasks;
  document.getElementById("detail-completed").innerText = completedCount;
  document.getElementById("detail-success-rate").innerText = avgScore + "%";
  document.getElementById("detail-avg-time").innerText = systemTimeText;
  document.getElementById("detail-total-xp").innerText = totalXP;
  document.getElementById("detail-rank").innerText = "#" + rank;
  
  renderStudentChart(taskHistory);
  
  const historyContainer = document.getElementById("student-activity-history");
  const contentHistoryContainer = document.getElementById("student-content-history");
  const quizHistoryContainer = document.getElementById("student-quiz-history");
  historyContainer.innerHTML = "";
  if (contentHistoryContainer) contentHistoryContainer.innerHTML = "";
  if (quizHistoryContainer) quizHistoryContainer.innerHTML = "";
  
  if (taskHistory.length === 0) {
    historyContainer.innerHTML = "<p style='text-align: center; color: #888; padding: 20px;'>Henüz tamamlanan ödev yok.</p>";
  } else {
    taskHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    taskHistory.forEach(task => {
      const div = document.createElement("div");
      div.className = "activity-history-item";
      
      const mins = Math.floor(task.duration / 60);
      const secs = task.duration % 60;
      
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>${task.title}</strong>
          <span class="badge ${task.score >= 80 ? 'badge-success' : task.score >= 60 ? 'badge-info' : 'badge-pending'}">
            %${task.score}
          </span>
        </div>
        <small style="color: #666; display: block; margin-top: 5px;">
          📅 ${task.date} | ⏱️ ${mins}dk ${secs}sn | ⭐ +${task.xp} XP
        </small>
      `;
      historyContainer.appendChild(div);
    });
  }
  
  let activityHistory = [];
  try {
    const progSnap = await getDocs(query(collection(db, "contentProgress"), where("userId", "==", student.id)));
    progSnap.forEach((docSnap) => {
      const p = docSnap.data();
      let bestPercent = 0;
      let bestSeconds = 0;
      if (p.appUsage) {
        Object.values(p.appUsage).forEach((u) => {
          const percent = Math.max(0, Math.min(100, u?.percent || 0));
          if (percent > bestPercent) {
            bestPercent = percent;
            bestSeconds = u?.seconds || 0;
          }
        });
      }
      const content = allContents.find(c => c.id === p.contentId);
      activityHistory.push({
        title: content?.title || "Etkinlik",
        percent: Math.round(bestPercent),
        seconds: bestSeconds || 0,
        updatedAt: p.updatedAt ? p.updatedAt.toDate().toLocaleDateString("tr-TR") : "-"
      });
    });
  } catch (e) {
    console.error("Etkinlik geçmişi yüklenemedi:", e);
  }

  if (contentHistoryContainer) {
    if (activityHistory.length === 0) {
      contentHistoryContainer.innerHTML = "<p style='text-align: center; color: #888; padding: 20px;'>Henüz tamamlanan etkinlik yok.</p>";
    } else {
      activityHistory.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      activityHistory.forEach((act) => {
        const div = document.createElement("div");
        div.className = "activity-history-item";
        const mins = Math.floor((act.seconds || 0) / 60);
        const secs = (act.seconds || 0) % 60;
        let cls = "badge-pending";
        if (act.percent >= 80) cls = "badge-success";
        else if (act.percent >= 60) cls = "badge-info";
        else if (act.percent > 0) cls = "badge-progress";
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>${act.title}</strong>
            <span class="badge ${cls}">%${act.percent}</span>
          </div>
          <small style="color: #666; display: block; margin-top: 5px;">
            📅 ${act.updatedAt} | ⏱️ ${mins}dk ${secs}sn
          </small>
        `;
        contentHistoryContainer.appendChild(div);
      });
    }
  }

  if (quizHistoryContainer) {
    if (!quizHistory.length) {
      quizHistoryContainer.innerHTML = "<p style='text-align: center; color: #888; padding: 20px;'>Henüz quiz sonucu yok.</p>";
    } else {
      quizHistory.forEach((qz) => {
        const div = document.createElement("div");
        div.className = "activity-history-item";
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>${qz.title}</strong>
            <span class="badge ${qz.successRate >= 80 ? 'badge-success' : qz.successRate >= 60 ? 'badge-info' : 'badge-pending'}">%${qz.successRate}</span>
          </div>
          <small style="color: #666; display: block; margin-top: 5px;">
            📅 ${qz.date} | ⏱️ ${qz.durationText} | ✅ ${qz.correct} • ❌ ${qz.wrong} | ⭐ +${qz.xp} XP
          </small>
        `;
        quizHistoryContainer.appendChild(div);
      });
    }
  }
  renderStudentQuizChart(quizHistory, quizStats);

  currentStudentDetail = {
    student,
    rank,
    totalTasks,
    completedCount,
    avgScore,
    avgTime,
    totalXP,
    taskHistory,
    activityHistory,
    lessonHistory,
    quizHistory,
    quizStats
  };
  
  if (!suppressStudentDetailModal) {
    document.getElementById("student-detail-modal").style.display = "flex";
  }
  // render block-run report section for this student
  try{ renderStudentBlockRunReport(student.id); }catch(e){}
}

async function fetchBlockRunStats(studentId) {
  const fallback = {
    completedLevels: 0,
    totalLevels: 0,
    progressPercent: 0,
    totalXP: 0,
    totalDurationMs: 0,
    levels: [],
    runs: []
  };
  try {
    const uid = String(studentId);
    const [rptSnap, gsSnap, completionsSnap, progressSnap, assignmentsSnap] = await Promise.all([
      getDoc(doc(db, "studentReports", uid)),
      getDoc(doc(db, "gameStates", uid)),
      getDocs(collection(db, "studentReports", uid, "levelCompletions")),
      getDocs(query(collection(db, "blockAssignmentProgress"), where("userId", "==", uid))),
      getDocs(collection(db, "blockAssignments"))
    ]);
    const rpt = rptSnap.exists() ? rptSnap.data() : {};
    const gs = gsSnap.exists() ? gsSnap.data().payload : null;
    const levels = [];
    completionsSnap.forEach((d) => levels.push(d.data()));
    levels.sort((a, b) => Number(a.levelId || 0) - Number(b.levelId || 0));
    const assignmentMap = new Map();
    assignmentsSnap.forEach((d) => {
      const val = d.data() || {};
      const assignmentType = getBlockHomeworkType(val.assignmentType);
      assignmentMap.set(String(d.id), {
        id: d.id,
        title: String(val.title || "Blok Kodlama Ödevi"),
        assignmentType,
        levelStart: Math.max(1, Number(val.levelStart || 1)),
        levelEnd: Math.max(1, Number(val.levelEnd || val.levelStart || 1))
      });
    });
    const toMs = (value) => {
      if (!value) return 0;
      if (typeof value?.toDate === "function") return Number(value.toDate().getTime() || 0);
      if (typeof value === "number") return Number(value);
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const runs = [];
    progressSnap.forEach((d) => {
      const p = d.data() || {};
      const assignmentId = String(p.assignmentId || "");
      const assignment = assignmentMap.get(assignmentId);
      const assignmentType = getBlockHomeworkType(p.assignmentType || assignment?.assignmentType);
      const levelStart = Math.max(1, Number(p.levelStart || assignment?.levelStart || 1));
      const levelEnd = Math.max(levelStart, Number(p.levelEnd || assignment?.levelEnd || levelStart));
      const durationSeconds = Math.max(0, Number(p.lastSessionSeconds || 0));
      const totalXPRow = Math.max(0, Number(p.totalXP || 0));
      const completedLevelsRow = Math.max(0, Number(p.completedLevels || 0));
      const totalLevelsRow = Math.max(0, Number(p.totalLevels || (levelEnd - levelStart + 1)));
      const percentRow = totalLevelsRow > 0
        ? Math.round((completedLevelsRow / totalLevelsRow) * 100)
        : Math.max(0, Number(p.percent || 0));
      runs.push({
        assignmentId,
        title: String(p.assignmentTitle || assignment?.title || "Blok Kodlama Ödevi"),
        rangeText: assignmentType === "flowchart" ? "Flowchart Soru" : `${levelStart}-${levelEnd}`,
        assignmentType,
        durationSeconds,
        xp: totalXPRow,
        completedLevels: completedLevelsRow,
        totalLevels: totalLevelsRow,
        percent: Math.max(0, Math.min(100, percentRow)),
        completed: !!p.completed,
        updatedAtMs: Math.max(toMs(p.updatedAt), toMs(p.createdAt))
      });
    });
    runs.sort((a, b) => Number(b.updatedAtMs || 0) - Number(a.updatedAtMs || 0));
    if (!runs.length && levels.length) {
      const levelIds = levels
        .map((l) => Number(l.levelId || 0))
        .filter((v) => Number.isFinite(v) && v > 0)
        .sort((a, b) => a - b);
      const minLevel = levelIds.length ? levelIds[0] : 1;
      const maxLevel = levelIds.length ? levelIds[levelIds.length - 1] : minLevel;
      const totalXPLevels = levels.reduce((sum, l) => sum + Math.max(0, Number(l.xp || 0)), 0);
      const totalDurationSeconds = Math.round(levels.reduce((sum, l) => sum + Math.max(0, Number(l.durationMs || 0)), 0) / 1000);
      runs.push({
        assignmentId: "",
        title: "Genel Blok Kodlama",
        rangeText: `${minLevel}-${maxLevel}`,
        assignmentType: "block2d",
        durationSeconds: totalDurationSeconds,
        xp: totalXPLevels,
        completedLevels: levels.length,
        totalLevels: Math.max(levels.length, maxLevel - minLevel + 1),
        percent: 100,
        completed: true,
        updatedAtMs: Date.now()
      });
    }

    const runCompletedLevels = runs.reduce((sum, r) => sum + Math.max(0, Number(r.completedLevels || 0)), 0);
    const runTotalLevels = runs.reduce((sum, r) => sum + Math.max(0, Number(r.totalLevels || 0)), 0);
    const computedCompleted = Array.isArray(gs?.levels)
      ? gs.levels.filter((l) => l?.completed).length
      : levels.length;
    const computedTotal = Array.isArray(gs?.levels) ? gs.levels.length : computedCompleted;
    const completedLevels = Math.max(0, runCompletedLevels || rpt.completedLevels || computedCompleted || 0);
    const totalLevels = Math.max(completedLevels, runTotalLevels || rpt.totalLevels || computedTotal || 0);
    const progressPercent = totalLevels > 0
      ? Math.round((completedLevels / totalLevels) * 100)
      : Math.max(0, Math.min(100, rpt.progressPercent || rpt.lastPercent || 0));
    const totalXP = typeof rpt.totalXP === "number"
      ? rpt.totalXP
      : levels.reduce((sum, l) => sum + (l.xp || 0), 0);
    const totalDurationMs = typeof rpt.totalDurationMs === "number"
      ? rpt.totalDurationMs
      : levels.reduce((sum, l) => sum + (l.durationMs || 0), 0);
    return {
      completedLevels,
      totalLevels,
      progressPercent: Math.max(0, Math.min(100, progressPercent)),
      totalXP: Math.max(0, totalXP),
      totalDurationMs: Math.max(0, totalDurationMs),
      levels,
      runs
    };
  } catch (e) {
    console.warn("fetchBlockRunStats", e);
    return fallback;
  }
}

async function fetchStudentQuizStats(studentId) {
  const fallback = {
    totalQuizzes: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalXP: 0,
    avgSuccess: 0,
    items: []
  };
  if (!studentId) return fallback;
  try {
    const uid = String(studentId);
    const [resultSnap, rptSnap, sessionSnap] = await Promise.all([
      getDocs(query(collection(db, "studentQuizResults"), where("userId", "==", uid))),
      getDoc(doc(db, "studentReports", uid)),
      getDocs(collection(db, "studentReports", uid, "quizSessions"))
    ]);
    const resultItems = [];
    resultSnap.forEach((d) => resultItems.push({ id: d.id, ...d.data() }));
    const sessionItems = [];
    sessionSnap.forEach((d) => sessionItems.push({ id: d.id, ...d.data() }));
    const itemMap = new Map();
    resultItems.forEach((item) => {
      const key = String(item.sessionId || item.id || `${item.quizTitle || "quiz"}_${item.finishedAtMs || 0}`);
      itemMap.set(key, item);
    });
    sessionItems.forEach((item) => {
      const key = String(item.sessionId || item.id || `${item.quizTitle || "quiz"}_${item.finishedAtMs || 0}`);
      if (!itemMap.has(key)) itemMap.set(key, item);
    });
    let items = Array.from(itemMap.values())
      .filter((r) => String(r.status || "finished") !== "live")
      .sort((a, b) => Number(b.finishedAtMs || 0) - Number(a.finishedAtMs || 0));
    const itemTotals = {
      totalQuizzes: items.length,
      totalAnswered: items.reduce((sum, r) => sum + Math.max(0, Number(r.answered || 0)), 0),
      totalCorrect: items.reduce((sum, r) => sum + Math.max(0, Number(r.correct || 0)), 0),
      totalWrong: items.reduce((sum, r) => sum + Math.max(0, Number(r.wrong || 0)), 0),
      totalXP: items.reduce((sum, r) => sum + Math.max(0, Number(r.xpEarned || 0)), 0)
    };
    const rpt = rptSnap.exists() ? (rptSnap.data() || {}) : {};
    const summaryTotals = {
      totalQuizzes: Math.max(0, Number(rpt.quizSessionsCompleted || 0)),
      totalAnswered: Math.max(0, Number(rpt.quizAnswered || 0)),
      totalCorrect: Math.max(0, Number(rpt.quizCorrect || 0)),
      totalWrong: Math.max(0, Number(rpt.quizWrong || 0)),
      totalXP: Math.max(0, Number(rpt.quizTotalXP || 0))
    };
    const totalQuizzes = Math.max(itemTotals.totalQuizzes, summaryTotals.totalQuizzes);
    const totalAnswered = Math.max(itemTotals.totalAnswered, summaryTotals.totalAnswered);
    const totalCorrect = Math.max(itemTotals.totalCorrect, summaryTotals.totalCorrect);
    const totalWrong = Math.max(itemTotals.totalWrong, summaryTotals.totalWrong);
    const totalXP = Math.max(itemTotals.totalXP, summaryTotals.totalXP);
    const needsRepair = itemTotals.totalQuizzes < summaryTotals.totalQuizzes || itemTotals.totalQuizzes === 0;
    if (needsRepair) {
      const repaired = await repairStudentQuizResultsFromLiveSessions(uid, itemMap);
      if (repaired > 0) {
        const [reResultSnap, reSessionSnap] = await Promise.all([
          getDocs(query(collection(db, "studentQuizResults"), where("userId", "==", uid))),
          getDocs(collection(db, "studentReports", uid, "quizSessions"))
        ]);
        const refreshedMap = new Map();
        reResultSnap.forEach((d) => {
          const row = { id: d.id, ...d.data() };
          const key = String(row.sessionId || row.id || `${row.quizTitle || "quiz"}_${row.finishedAtMs || 0}`);
          refreshedMap.set(key, row);
        });
        reSessionSnap.forEach((d) => {
          const row = { id: d.id, ...d.data() };
          const key = String(row.sessionId || row.id || `${row.quizTitle || "quiz"}_${row.finishedAtMs || 0}`);
          if (!refreshedMap.has(key)) refreshedMap.set(key, row);
        });
        items = Array.from(refreshedMap.values())
          .filter((r) => String(r.status || "finished") !== "live")
          .sort((a, b) => Number(b.finishedAtMs || 0) - Number(a.finishedAtMs || 0));
      }
    }
    const finalTotals = {
      totalQuizzes: items.length,
      totalAnswered: items.reduce((sum, r) => sum + Math.max(0, Number(r.answered || 0)), 0),
      totalCorrect: items.reduce((sum, r) => sum + Math.max(0, Number(r.correct || 0)), 0),
      totalWrong: items.reduce((sum, r) => sum + Math.max(0, Number(r.wrong || 0)), 0),
      totalXP: items.reduce((sum, r) => sum + Math.max(0, Number(r.xpEarned || 0)), 0)
    };
    if (
      finalTotals.totalQuizzes > summaryTotals.totalQuizzes ||
      finalTotals.totalAnswered > summaryTotals.totalAnswered ||
      finalTotals.totalCorrect > summaryTotals.totalCorrect ||
      finalTotals.totalWrong > summaryTotals.totalWrong ||
      finalTotals.totalXP > summaryTotals.totalXP
    ) {
      await setDoc(doc(db, "studentReports", uid), {
        quizSessionsCompleted: Math.max(summaryTotals.totalQuizzes, finalTotals.totalQuizzes),
        quizAnswered: Math.max(summaryTotals.totalAnswered, finalTotals.totalAnswered),
        quizCorrect: Math.max(summaryTotals.totalCorrect, finalTotals.totalCorrect),
        quizWrong: Math.max(summaryTotals.totalWrong, finalTotals.totalWrong),
        quizTotalXP: Math.max(summaryTotals.totalXP, finalTotals.totalXP),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    const mergedTotals = {
      totalQuizzes: Math.max(totalQuizzes, finalTotals.totalQuizzes),
      totalAnswered: Math.max(totalAnswered, finalTotals.totalAnswered),
      totalCorrect: Math.max(totalCorrect, finalTotals.totalCorrect),
      totalWrong: Math.max(totalWrong, finalTotals.totalWrong),
      totalXP: Math.max(totalXP, finalTotals.totalXP)
    };
    const avgSuccess = mergedTotals.totalAnswered > 0 ? Math.round((mergedTotals.totalCorrect / mergedTotals.totalAnswered) * 100) : 0;
    return {
      totalQuizzes: mergedTotals.totalQuizzes,
      totalAnswered: mergedTotals.totalAnswered,
      totalCorrect: mergedTotals.totalCorrect,
      totalWrong: mergedTotals.totalWrong,
      totalXP: mergedTotals.totalXP,
      avgSuccess,
      items
    };
  } catch (e) {
    console.warn("fetchStudentQuizStats", e);
    return fallback;
  }
}

async function repairStudentQuizResultsFromLiveSessions(uid, existingItemMap = new Map()) {
  if (!uid) return 0;
  try {
    const scoreSnap = await getDocs(query(collectionGroup(db, "scores"), where("userId", "==", String(uid))));
    if (scoreSnap.empty) return 0;
    const sessionScoreMap = new Map();
    scoreSnap.forEach((d) => {
      const path = String(d.ref.path || "");
      const parts = path.split("/");
      const liveIx = parts.indexOf("liveQuizSessions");
      if (liveIx < 0 || liveIx + 1 >= parts.length) return;
      const sessionId = String(parts[liveIx + 1] || "");
      if (!sessionId) return;
      const row = d.data() || {};
      const prev = sessionScoreMap.get(sessionId);
      const prevAt = Number(prev?.updatedAtMs || 0);
      const nowAt = Number(row?.updatedAtMs || 0);
      if (!prev || nowAt >= prevAt) sessionScoreMap.set(sessionId, row);
    });
    if (!sessionScoreMap.size) return 0;
    let repairedCount = 0;
    for (const [sessionId, score] of sessionScoreMap.entries()) {
      const hasInMap = Array.from(existingItemMap.values()).some((item) => String(item?.sessionId || item?.id || "") === sessionId);
      if (hasInMap) continue;
      const sessionRef = doc(db, "liveQuizSessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) continue;
      const sessionData = sessionSnap.data() || {};
      const answered = Math.max(0, Number(score.answered || 0));
      const correct = Math.max(0, Number(score.correct || 0));
      const wrong = Math.max(0, Number(score.wrong || (answered - correct)));
      const xpEarned = Math.max(0, Number(score.xp || score.xpEarned || 0));
      const startedAtMs = Math.max(0, Number(sessionData.startedAtMs || 0));
      const finishedAtMs = Math.max(
        0,
        Number(score.updatedAtMs || 0),
        Number(sessionData.finishedAtMs || 0),
        Date.now()
      );
      const durationMs = startedAtMs > 0 ? Math.max(0, finishedAtMs - startedAtMs) : 0;
      const durationMinutes = Math.round((durationMs / 60000) * 10) / 10;
      const totalQuestions = Math.max(0, Number(Array.isArray(sessionData.questions) ? sessionData.questions.length : 0));
      const successRate = answered > 0 ? Math.round((correct / answered) * 100) : 0;
      const payload = {
        sessionId,
        quizId: sessionData.quizId || "",
        quizTitle: sessionData.quizTitle || "Quiz",
        teacherId: sessionData.teacherId || "",
        userId: String(uid),
        studentName: score.name || String(uid),
        totalQuestions,
        answered,
        correct,
        wrong,
        xpEarned,
        successRate,
        startedAtMs,
        durationMs,
        durationMinutes,
        finishReason: sessionData.finishReason || (sessionData.status === "finished" ? "time" : ""),
        finishedAtMs,
        status: "finished",
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, "studentQuizResults", `${sessionId}_${uid}`), {
        ...payload,
        createdAt: serverTimestamp()
      }, { merge: true });
      await setDoc(doc(db, "studentReports", String(uid), "quizSessions", String(sessionId)), payload, { merge: true });
      repairedCount += 1;
    }
    return repairedCount;
  } catch (e) {
    console.warn("repairStudentQuizResultsFromLiveSessions", e);
    return 0;
  }
}

async function fetchComputeRunStats(studentId) {
  const fallback = {
    completedLevels: 0,
    totalLevels: 0,
    progressPercent: 0,
    totalXP: 0,
    totalDurationMs: 0,
    levels: [],
    runs: []
  };
  try {
    const uid = String(studentId);
    const [stateSnap, completionsSnap, progressSnap, assignmentsSnap] = await Promise.all([
      getDoc(doc(db, "computeStates", uid)),
      getDocs(collection(db, "computeReports", uid, "levelCompletions")),
      getDocs(query(collection(db, "computeAssignmentProgress"), where("userId", "==", uid))),
      getDocs(collection(db, "computeAssignments"))
    ]);
    const state = stateSnap.exists() ? stateSnap.data().payload : null;
    const levels = [];
    completionsSnap.forEach((d) => levels.push(d.data()));
    levels.sort((a, b) => Number(a.levelId || 0) - Number(b.levelId || 0));
    const assignmentMap = new Map();
    assignmentsSnap.forEach((d) => {
      const val = d.data() || {};
      assignmentMap.set(String(d.id), {
        id: d.id,
        title: String(val.title || "Compute It Ödevi"),
        levelStart: Math.max(1, Number(val.levelStart || 1)),
        levelEnd: Math.max(1, Number(val.levelEnd || val.levelStart || 1))
      });
    });
    const toMs = (value) => {
      if (!value) return 0;
      if (typeof value?.toDate === "function") return Number(value.toDate().getTime() || 0);
      if (typeof value === "number") return Number(value);
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const runs = [];
    progressSnap.forEach((d) => {
      const p = d.data() || {};
      const assignmentId = String(p.assignmentId || "");
      const assignment = assignmentMap.get(assignmentId);
      const levelStart = Math.max(1, Number(p.levelStart || assignment?.levelStart || 1));
      const levelEnd = Math.max(levelStart, Number(p.levelEnd || assignment?.levelEnd || levelStart));
      const durationSeconds = Math.max(0, Number(p.lastSessionSeconds || 0));
      const totalXPRow = Math.max(0, Number(p.totalXP || 0));
      const totalLevelsRow = Math.max(0, Number(p.totalLevels || (levelEnd - levelStart + 1)));
      const completedLevelsRow = Math.max(0, Number(p.completedLevels || 0));
      const completedIdsRaw = Array.isArray(p.completedLevelIds)
        ? p.completedLevelIds.map((v) => Number(v)).filter((v) => Number.isFinite(v))
        : [];
      const completedIdsInRange = completedIdsRaw.filter((v) => v >= levelStart && v <= levelEnd).length;
      const completedCountRow = Math.max(completedLevelsRow, completedIdsInRange);
      const percentField = Math.max(0, Number(p.percent || 0));
      const rowCompleted = !!p.completed || percentField >= 100 || (totalLevelsRow > 0 && completedCountRow >= totalLevelsRow);
      const effectiveCompletedLevels = rowCompleted
        ? Math.max(completedCountRow, totalLevelsRow)
        : completedCountRow;
      const percentRow = totalLevelsRow > 0
        ? Math.round((effectiveCompletedLevels / totalLevelsRow) * 100)
        : percentField;
      runs.push({
        assignmentId,
        title: String(p.assignmentTitle || assignment?.title || "Compute It Ödevi"),
        rangeText: `${levelStart}-${levelEnd}`,
        durationSeconds,
        xp: totalXPRow,
        completedLevels: effectiveCompletedLevels,
        totalLevels: totalLevelsRow,
        percent: Math.max(0, Math.min(100, percentRow)),
        completed: rowCompleted,
        updatedAtMs: Math.max(toMs(p.updatedAt), toMs(p.createdAt))
      });
    });
    runs.sort((a, b) => Number(b.updatedAtMs || 0) - Number(a.updatedAtMs || 0));
    if (!runs.length && levels.length) {
      const levelIds = levels
        .map((l) => Number(l.levelId || 0))
        .filter((v) => Number.isFinite(v) && v > 0)
        .sort((a, b) => a - b);
      const minLevel = levelIds.length ? levelIds[0] : 1;
      const maxLevel = levelIds.length ? levelIds[levelIds.length - 1] : minLevel;
      runs.push({
        assignmentId: "",
        title: "Genel Compute It",
        rangeText: `${minLevel}-${maxLevel}`,
        durationSeconds: Math.round(levels.reduce((sum, l) => sum + Math.max(0, Number(l.durationMs || 0)), 0) / 1000),
        xp: levels.reduce((sum, l) => sum + Math.max(0, Number(l.xp || 0)), 0),
        completedLevels: levels.length,
        totalLevels: Math.max(levels.length, maxLevel - minLevel + 1),
        percent: 100,
        completed: true,
        updatedAtMs: Date.now()
      });
    }
    const runCompletedLevels = runs.reduce((sum, r) => sum + Math.max(0, Number(r.completedLevels || 0)), 0);
    const runTotalLevels = runs.reduce((sum, r) => sum + Math.max(0, Number(r.totalLevels || 0)), 0);
    const completedLevels = Math.max(0, runCompletedLevels || levels.length);
    const totalLevels = Math.max(
      completedLevels,
      runTotalLevels || (Array.isArray(state?.levels) ? state.levels.length : completedLevels)
    );
    const progressPercent = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
    const totalXP = levels.reduce((sum, l) => sum + (Number(l.xp || 0)), 0);
    const totalDurationMs = levels.reduce((sum, l) => sum + (Number(l.durationMs || 0)), 0);
    return {
      completedLevels: Math.max(0, completedLevels),
      totalLevels: Math.max(completedLevels, totalLevels),
      progressPercent: Math.max(0, Math.min(100, progressPercent)),
      totalXP: Math.max(0, totalXP),
      totalDurationMs: Math.max(0, totalDurationMs),
      levels,
      runs
    };
  } catch (e) {
    console.warn("fetchComputeRunStats", e);
    return fallback;
  }
}

// Fetch and render block-runner stats into student detail modal
async function renderStudentBlockRunReport(studentId) {
  const container = document.getElementById("student-blockrun-report");
  if (!container) return;
  container.innerHTML = '<div id="blockrun-summary">Yükleniyor...</div>';
  try {
    const stats = await fetchBlockRunStats(studentId);
    const minutes = Math.floor((stats.totalDurationMs || 0) / 60000);
    const rows = (stats.runs || []).map((run, i) => `
      <tr>
        <td>${i + 1}. ${run.title || "Blok Kodlama Ödevi"}</td>
        <td>${run.assignmentType === "flowchart" ? (run.rangeText || "Flowchart Soru") : `Seviye ${run.rangeText || "-"}`}</td>
        <td>${Math.floor((run.durationSeconds || 0) / 60)} dk ${(run.durationSeconds || 0) % 60} sn</td>
        <td>${run.xp || 0} XP</td>
      </tr>
    `).join("");
    const listHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div><strong>Bölümler Tamamlandı</strong></div>
        <div>${stats.completedLevels} / ${stats.totalLevels}</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div><strong>Toplam XP</strong></div>
        <div>${stats.totalXP} XP</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div><strong>İlerleme</strong></div>
        <div>%${stats.progressPercent}</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div><strong>Toplam Süre</strong></div>
        <div>${minutes} dk</div>
      </div>
      <div style="margin-top:10px; border-top:1px solid #e5e7eb; padding-top:8px;">
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left; border-bottom:1px solid #e5e7eb; padding:6px;">Ödev</th>
              <th style="text-align:left; border-bottom:1px solid #e5e7eb; padding:6px;">Aralık</th>
              <th style="text-align:left; border-bottom:1px solid #e5e7eb; padding:6px;">Süre</th>
              <th style="text-align:left; border-bottom:1px solid #e5e7eb; padding:6px;">XP</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="4" style="padding:6px; color:#6b7280;">Veri yok.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
    container.innerHTML = listHtml;
  } catch (e) {
    console.warn("renderStudentBlockRunReport", e);
    container.innerHTML = '<div style="color:#b91c1c;">Veri yüklenemedi</div>';
  }
}

function renderStudentChart(taskHistory) {
  const ctx = document.getElementById("studentChart");
  if (!ctx) return;
  
  if (studentChart) studentChart.destroy();
  
  const sortedTasks = [...taskHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  const recentTasks = sortedTasks.slice(-10);
  const scores = recentTasks.map(t => t.score);
  const labels = recentTasks.map((t, i) => `${i + 1}`);
  
  studentChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Başarı %",
        data: scores,
        borderColor: "rgba(46, 204, 113, 1)",
        backgroundColor: "rgba(46, 204, 113, 0.2)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

function renderStudentQuizChart(quizHistory = [], quizStats = {}) {
  const ctx = document.getElementById("studentQuizChart");
  if (!ctx) return;
  if (studentQuizDetailChart) studentQuizDetailChart.destroy();
  const recent = Array.isArray(quizHistory) ? quizHistory.slice(0, 8).reverse() : [];
  const labels = recent.map((q, i) => `${i + 1}`);
  const successData = recent.map((q) => {
    const answered = Math.max(0, Number(q.answered || 0));
    const correct = Math.max(0, Number(q.correct || 0));
    if (answered > 0) return Math.max(0, Math.min(100, Math.round((correct / answered) * 100)));
    return Math.max(0, Math.min(100, Number(q.successRate || 0)));
  });
  const hasRows = recent.length > 0;
  studentQuizDetailChart = new Chart(ctx, {
    type: hasRows ? "bar" : "doughnut",
    data: hasRows ? {
      labels,
      datasets: [
        {
          label: "Başarı %",
          data: successData,
          backgroundColor: "rgba(34, 197, 94, 0.72)",
          borderColor: "rgba(22, 163, 74, 1)",
          borderWidth: 1
        }
      ]
    } : {
      labels: ["Doğru", "Yanlış"],
      datasets: [{
        data: [
          Math.max(0, Number(quizStats.totalCorrect || 0)),
          Math.max(0, Number(quizStats.totalWrong || 0))
        ],
        backgroundColor: ["rgba(34, 197, 94, 0.75)", "rgba(239, 68, 68, 0.75)"],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        title: {
          display: true,
          text: hasRows ? "Son Quizlerde Başarı Yüzdesi" : "Toplam Quiz Doğru/Yanlış"
        }
      },
      scales: hasRows ? { y: { beginAtZero: true, max: 100 } } : {}
    }
  });
}

async function loadMyStatsModal() {
  if (!currentUserId) return;
  try {
    const completionsQuery = query(collection(db, "completions"), where("userId", "==", currentUserId));
    const completionsSnap = await getDocs(completionsQuery);

    const completions = [];
    completionsSnap.forEach(docSnap => completions.push(docSnap.data()));

    const tasks = Array.isArray(allTasks) ? allTasks : [];
    const assignmentsAll = Array.isArray(contentAssignments) ? contentAssignments : [];
    const lessonsAll = Array.isArray(lessons) ? lessons : [];
    const toSafeNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const studentTasks = tasks.filter(t => taskMatchesStudent(t));
    const totalTasks = studentTasks.length || 0;
    const approvedManualCount = studentTasks.filter(t => requiresTeacherApprovalTask(t) && bookTaskProgressMap.get(t.id)?.approved).length;
    const completedCount = completions.length + approvedManualCount;
    let totalScore = 0;
    const completionsXP = completions.reduce((sum, c) => sum + Math.max(0, Number(c.xpEarned || 0)), 0);
    const quizStats = await fetchStudentQuizStats(currentUserId);
    const computedXP = completionsXP
      + getActivityXPFromProgressMap()
      + getBlockXPFromProgressMap()
      + getComputeXPFromProgressMap()
      + getLessonXPFromProgressMap()
      + Math.max(0, Number(quizStats.totalXP || 0));
    const headerXP = toSafeNum(String(document.getElementById("user-xp")?.innerText || "0").replace(/[^\d.-]/g, ""));
    let totalXP = Math.max(toSafeNum(userData?.xp), computedXP, headerXP);

    completions.forEach(c => {
      totalScore += (Number(c.correctAnswers || 0) / Math.max(1, Number(c.totalQuestions || 1))) * 100;
    });

    const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
    const taskRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = String(val);
    };
    setText("my-total-tasks", totalTasks);
    setText("my-completed-tasks", completedCount);
    setText("my-total-xp", totalXP);

    const assignments = assignmentsAll.filter(a => assignmentMatchesStudent(a));
    const totalActivities = assignments.length;
    let activityCompleted = 0;
    assignments.forEach(a => {
      const prog = getAssignmentAppProgress(a);
      if (prog.percent > 0) activityCompleted++;
    });
    const activityRate = totalActivities > 0 ? Math.round((activityCompleted / totalActivities) * 100) : 0;

    const blockStats = await fetchBlockRunStats(currentUserId);
    const computeStats = await fetchComputeRunStats(currentUserId);
    const blockRate = Number(blockStats.progressPercent || 0);
    const computeRate = Number(computeStats.progressPercent || 0);
    const codeTotalLevels = Math.max(0, Number(blockStats.totalLevels || 0)) + Math.max(0, Number(computeStats.totalLevels || 0));
    const codeCompletedLevels = Math.max(0, Number(blockStats.completedLevels || 0)) + Math.max(0, Number(computeStats.completedLevels || 0));
    const codeRate = codeTotalLevels > 0 ? Math.round((codeCompletedLevels / codeTotalLevels) * 100) : 0;

    setText("my-total-activities", totalActivities);
    setText("my-completed-activities", activityCompleted);
    setText("my-task-rate", `${taskRate}%`);
    setText("my-activity-rate", `${activityRate}%`);
    setText("my-block-rate", `${blockRate}%`);
    setText("my-compute-rate", `${computeRate}%`);
    setText("my-code-rate", `${codeRate}%`);

    const student = userData ? { ...userData, id: currentUserId } : { id: currentUserId };
    student.totalTimeSeconds = getLiveSystemSeconds();

    const bookEntries = Array.from(bookTaskProgressMap.values())
      .filter(p => p?.approved)
      .map(p => {
        const task = allTasks.find(t => t.id === p.taskId);
        return {
          title: task?.title || `${p.bookName || "Kitap"} ${p.bookTest || ""}`.trim() || "Kitap/Test Ödevi",
          score: 100,
          duration: 0,
          date: p.updatedAt && typeof p.updatedAt.toDate === "function"
            ? p.updatedAt.toDate().toLocaleDateString("tr-TR")
            : "-",
          xp: 0
        };
      });

    const taskHistory = completions.map(c => ({
      title: c.taskTitle || "Ödev",
      score: Math.round((Number(c.correctAnswers || 0) / Math.max(1, Number(c.totalQuestions || 1))) * 100),
      duration: Number(c.duration || 0),
      date: c.completedAt && typeof c.completedAt.toDate === "function" ? c.completedAt.toDate().toLocaleDateString("tr-TR") : "-",
      xp: Number(c.xpEarned || 0)
    }));

    const lessonItems = lessonsAll.filter((l) => lessonMatchesStudent(l));
    const lessonProgressItems = lessonItems.map((lesson) => {
      const p = lessonProgressMap.get(lesson.id) || {};
      return {
        title: `Ders: ${lesson.title || "Ders"}`,
        score: Math.max(0, Math.min(100, Number(p.percent || 0))),
        duration: 0,
        date: p.updatedAt && typeof p.updatedAt.toDate === "function"
          ? p.updatedAt.toDate().toLocaleDateString("tr-TR")
          : "-",
        xp: Math.max(0, Number(p.totalXP || 0))
      };
    });

    const activityItems = Array.from(contentProgressMap.values()).flatMap(p => {
      const appUsage = p.appUsage || {};
      return Object.entries(appUsage).map(([id, v]) => ({
        appId: id,
        title: v?.title || "Etkinlik",
        seconds: Number(v?.seconds || 0),
        percent: Number(v?.percent || 0),
        xp: Number(v?.xp || 0),
        link: v?.link || ""
      }));
    });

    const safeChart = (destroyRef, canvasId, config, assign) => {
      try {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === "undefined") return;
        if (destroyRef && typeof destroyRef.destroy === "function") destroyRef.destroy();
        assign(new Chart(canvas, config));
      } catch (chartErr) {
        console.warn(`chart render failed: ${canvasId}`, chartErr);
      }
    };

    safeChart(myStatsChart, "myTaskChart", {
      type: "bar",
      data: { labels: ["Yapılan", "Bekleyen"], datasets: [{ label: "Ödev", data: [completedCount, Math.max(0, totalTasks - completedCount)], backgroundColor: ["#22c55e", "#e5e7eb"], borderRadius: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    }, (c) => { myStatsChart = c; });

    safeChart(myActivityChart, "myActivityChart", {
      type: "bar",
      data: { labels: ["Yapılan", "Bekleyen"], datasets: [{ label: "Etkinlik", data: [activityCompleted, Math.max(0, totalActivities - activityCompleted)], backgroundColor: ["#3b82f6", "#e5e7eb"], borderRadius: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    }, (c) => { myActivityChart = c; });

    safeChart(myBlockChart, "myBlockChart", {
      type: "bar",
      data: { labels: ["Yapılan", "Bekleyen"], datasets: [{ label: "Blok Kodlama", data: [Math.max(0, Number(blockStats.completedLevels || 0)), Math.max(0, Number(blockStats.totalLevels || 0) - Number(blockStats.completedLevels || 0))], backgroundColor: ["#f59e0b", "#e5e7eb"], borderRadius: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    }, (c) => { myBlockChart = c; });

    safeChart(myComputeChart, "myComputeChart", {
      type: "bar",
      data: { labels: ["Yapılan", "Bekleyen"], datasets: [{ label: "Compute It", data: [Math.max(0, Number(computeStats.completedLevels || 0)), Math.max(0, Number(computeStats.totalLevels || 0) - Number(computeStats.completedLevels || 0))], backgroundColor: ["#8b5cf6", "#e5e7eb"], borderRadius: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    }, (c) => { myComputeChart = c; });

    currentStudentDetail = {
      student,
      rank: "-",
      totalTasks,
      completedCount,
      avgScore,
      avgTime: 0,
      totalXP,
      activityItems,
      taskHistory: taskHistory.concat(bookEntries).concat(lessonProgressItems).slice(0, 40),
      lessonHistory: lessonProgressItems
    };
  } catch (e) {
    console.error("loadMyStatsModal hatası:", e);
    showNotice("İstatistikler yüklenemedi. Lütfen tekrar deneyin.", "#e74c3c");
  }
}







