const API_URL = "https://script.google.com/macros/s/YOUR_APPS_SCRIPT_WEBAPP_URL/exec";

let QUESTIONS = [];
let ANSWERS = [];
let INDEX = 0;
let CURRENT_USER = null;

/* ---------------- LOGIN ---------------- */
async function login() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();

  if (!u || !p) {
    showMsg("Please enter username and password", true);
    return;
  }

  const res = await apiCall({
    action: "login",
    username: u,
    password: p
  });

  if (!res.ok) {
    showMsg(res.msg, true);
    return;
  }

  CURRENT_USER = {
    username: res.username,
    roll: res.roll
  };

  showMsg(`Welcome ${res.name} (Roll: ${res.roll})`, false);
  loadQuestions();
}

/* ---------------- LOAD QUESTIONS ---------------- */
async function loadQuestions() {
  const qs = await apiCall({ action: "questions" });

  QUESTIONS = qs;
  ANSWERS = [];
  INDEX = 0;

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("testBox").style.display = "block";

  showQuestion();
}

/* ---------------- SHOW QUESTION ---------------- */
function showQuestion() {
  if (INDEX >= QUESTIONS.length) {
    submitTest();
    return;
  }

  document.getElementById("questionText").innerText =
    `Q${INDEX + 1}. ${QUESTIONS[INDEX].question}`;

  document.getElementById("answerBox").value = "";
  document.getElementById("progress").innerText =
    `Question ${INDEX + 1} of ${QUESTIONS.length}`;

  document.getElementById("nextBtn").innerText =
    (INDEX === QUESTIONS.length - 1) ? "Submit" : "Next";
}

/* ---------------- NEXT ---------------- */
function nextQuestion() {
  ANSWERS.push({
    qid: QUESTIONS[INDEX].id,
    answer: document.getElementById("answerBox").value
  });

  INDEX++;
  showQuestion();
}

/* ---------------- SUBMIT ---------------- */
async function submitTest() {
  document.getElementById("testBox").innerHTML = "<p>Submitting...</p>";

  const res = await apiCall({
    action: "submit",
    profile: CURRENT_USER,
    answers: ANSWERS
  });

  document.getElementById("resultBox").style.display = "block";
  document.getElementById("resultBox").innerHTML = `
    <h2>Test Submitted</h2>
    <p><b>Score:</b> ${res.score} / ${res.max}</p>
    <p>Your report has been generated.</p>
    <p>Please contact your teacher for the score report.</p>
  `;
}

/* ---------------- API HELPER ---------------- */
async function apiCall(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

/* ---------------- UI MSG ---------------- */
function showMsg(msg, error) {
  const el = document.getElementById("loginMsg");
  el.innerText = msg;
  el.style.color = error ? "red" : "green";
}
