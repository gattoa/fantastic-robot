let scoreA = 0;
let scoreB = 0;
let consecutiveA = 0;
let consecutiveB = 0;

const STORAGE_KEY = "score-keeper:scores";
const HEATING_UP_THRESHOLD = 2;
const ON_FIRE_THRESHOLD = 3;

function saveScores() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ scoreA, scoreB, savedAt: Date.now() }),
    );
  } catch {
    // Ignore (storage may be unavailable, quota exceeded, etc.)
  }
}

function loadScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);

    const a = Number(parsed?.scoreA);
    const b = Number(parsed?.scoreB);
    if (Number.isFinite(a)) scoreA = Math.max(0, Math.trunc(a));
    if (Number.isFinite(b)) scoreB = Math.max(0, Math.trunc(b));
  } catch {
    // Ignore corrupted/invalid storage entries
  }
}

function applyHeatState() {
  const teamA = document.getElementById("team-a");
  const teamB = document.getElementById("team-b");
  const heatLabelA = document.getElementById("heat-label-a");
  const heatLabelB = document.getElementById("heat-label-b");
  if (!teamA || !teamB) return;

  // Team A
  teamA.classList.remove("team--heating-up", "team--on-fire");
  if (consecutiveA >= ON_FIRE_THRESHOLD) {
    teamA.classList.add("team--on-fire");
    teamA.setAttribute("data-heat", "fire");
    if (heatLabelA) {
      heatLabelA.textContent = "YOU'RE ON FIRE!";
      heatLabelA.removeAttribute("hidden");
    }
  } else if (consecutiveA >= HEATING_UP_THRESHOLD) {
    teamA.classList.add("team--heating-up");
    teamA.setAttribute("data-heat", "heating");
    if (heatLabelA) {
      heatLabelA.textContent = "HEATING UP!";
      heatLabelA.removeAttribute("hidden");
    }
  } else {
    teamA.setAttribute("data-heat", "none");
    heatLabelA?.setAttribute("hidden", "");
  }

  // Team B
  teamB.classList.remove("team--heating-up", "team--on-fire");
  if (consecutiveB >= ON_FIRE_THRESHOLD) {
    teamB.classList.add("team--on-fire");
    teamB.setAttribute("data-heat", "fire");
    if (heatLabelB) {
      heatLabelB.textContent = "YOU'RE ON FIRE!";
      heatLabelB.removeAttribute("hidden");
    }
  } else if (consecutiveB >= HEATING_UP_THRESHOLD) {
    teamB.classList.add("team--heating-up");
    teamB.setAttribute("data-heat", "heating");
    if (heatLabelB) {
      heatLabelB.textContent = "HEATING UP!";
      heatLabelB.removeAttribute("hidden");
    }
  } else {
    teamB.setAttribute("data-heat", "none");
    heatLabelB?.setAttribute("hidden", "");
  }
}

function updateHeatState(scoringTeam) {
  if (scoringTeam === "A") {
    consecutiveB = 0;
    consecutiveA += 1;
  } else {
    consecutiveA = 0;
    consecutiveB += 1;
  }
  applyHeatState();
}

function updateHeatStateUndo(teamThatLostPoint) {
  if (teamThatLostPoint === "A") {
    consecutiveA = Math.max(0, consecutiveA - 1);
  } else {
    consecutiveB = Math.max(0, consecutiveB - 1);
  }
  applyHeatState();
}

function renderScores() {
  const scoreADiv = document.getElementById("score-a");
  const scoreBDiv = document.getElementById("score-b");

  if (scoreADiv) {
    scoreADiv.textContent = String(scoreA);
    scoreADiv.setAttribute("aria-valuenow", String(scoreA));
  }
  if (scoreBDiv) {
    scoreBDiv.textContent = String(scoreB);
    scoreBDiv.setAttribute("aria-valuenow", String(scoreB));
  }
}

function incrementTeamA(amount = 1) {
  scoreA += amount;
  renderScores();
  updateHeatState("A");
  saveScores();
  announceScore("Phoenix Suns", scoreA);
}

function incrementTeamABy2() {
  incrementTeamA(2);
}

function incrementTeamABy3() {
  incrementTeamA(3);
}

function decrementTeamA() {
  scoreA = Math.max(0, scoreA - 1);
  renderScores();
  updateHeatStateUndo("A");
  saveScores();
  announceScore("Phoenix Suns", scoreA);
}

function incrementTeamB(amount = 1) {
  scoreB += amount;
  renderScores();
  updateHeatState("B");
  saveScores();
  announceScore("Chicago Bulls", scoreB);
}

function incrementTeamBBy2() {
  incrementTeamB(2);
}

function incrementTeamBBy3() {
  incrementTeamB(3);
}

function decrementTeamB() {
  scoreB = Math.max(0, scoreB - 1);
  renderScores();
  updateHeatStateUndo("B");
  saveScores();
  announceScore("Chicago Bulls", scoreB);
}

function resetScores() {
  scoreA = 0;
  scoreB = 0;
  consecutiveA = 0;
  consecutiveB = 0;
  renderScores();
  applyHeatState();
  saveScores();
  // Announce for screen readers
  const ann = document.createElement("div");
  ann.setAttribute("role", "status");
  ann.setAttribute("aria-live", "polite");
  ann.setAttribute("aria-atomic", "true");
  ann.className = "sr-only";
  ann.textContent = "Starting over. Scores reset to zero.";
  document.body.appendChild(ann);
  setTimeout(() => document.body.removeChild(ann), 1000);
}

function announceScore(teamName, score) {
  // Create a live region announcement for screen readers
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = `${teamName} score is now ${score}`;
  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Setup event listeners
const TEAMS = [
  {
    id: "a",
    name: "Phoenix Suns",
    class: "team--a",
    controls: [
      { id: "inc-1", label: "+", class: "btn--minor", aria: "Increase Phoenix Suns score by one" },
      { id: "inc-2", label: "+2", class: "btn--primary", aria: "Add 2 points to Phoenix Suns" },
      { id: "inc-3", label: "+3", class: "btn--primary", aria: "Add 3 points to Phoenix Suns" },
      { id: "dec-1", label: "−", class: "btn--minor", aria: "Decrease Phoenix Suns score by one" },
    ],
  },
  {
    id: "b",
    name: "Chicago Bulls",
    class: "team--b",
    controls: [
      { id: "inc-1", label: "+", class: "btn--minor", aria: "Increase Chicago Bulls score by one" },
      { id: "inc-2", label: "+2", class: "btn--primary", aria: "Add 2 points to Chicago Bulls" },
      { id: "inc-3", label: "+3", class: "btn--primary", aria: "Add 3 points to Chicago Bulls" },
      { id: "dec-1", label: "−", class: "btn--minor", aria: "Decrease Chicago Bulls score by one" },
    ],
  },
];

function generateTeamHTML(team, theme) {
  const controlsHTML = team.controls
    .map(
      (btn) =>
        `<button id="team-${team.id}-${btn.id}" class="btn ${btn.class}" type="button" aria-label="${btn.aria}">${btn.label}</button>`
    )
    .join("\n          ");

  return `
      <section class="team ${team.class}" id="team-${team.id}" aria-label="${team.name}" data-heat="none" data-theme="${theme}">
        <h2 class="team__name">${team.name}</h2>
        <div class="score" role="status" aria-live="polite" aria-atomic="true">
          <span class="score__value" id="score-${team.id}" aria-label="${team.name} score" aria-valuenow="0" aria-valuemin="0">0</span>
        </div>
        <span class="team__heat-label" id="heat-label-${team.id}" aria-live="polite" hidden>HEATING UP!</span>
        <div class="controls" aria-label="${team.name} score controls">
          ${controlsHTML}
        </div>
      </section>
  `;
}

function renderBoard() {
  const board = document.querySelector(".board");
  if (!board) return;

  const teamATheme = document.body.getAttribute("data-team-a") || "suns";
  const teamBTheme = document.body.getAttribute("data-team-b") || "bulls";

  const teamAHTML = generateTeamHTML(TEAMS[0], teamATheme);
  const teamBHTML = generateTeamHTML(TEAMS[1], teamBTheme);
  const vsHTML = `
      <div class="vs" aria-hidden="true">
        <div class="vs__ring"></div>
        <div class="vs__text">VS</div>
      </div>
  `;

  board.innerHTML = teamAHTML + vsHTML + teamBHTML;
}

// Setup event listeners
document.addEventListener("DOMContentLoaded", () => {
  renderBoard(); // Generate HTML first
  loadScores();
  renderScores();

  // Consecutive streaks don't persist across page loads
  consecutiveA = 0;
  consecutiveB = 0;
  applyHeatState();

  // Attach event listeners
  document.getElementById("team-a-inc-1")?.addEventListener("click", () => incrementTeamA());
  document.getElementById("team-a-inc-2")?.addEventListener("click", () => incrementTeamABy2());
  document.getElementById("team-a-inc-3")?.addEventListener("click", () => incrementTeamABy3());
  document.getElementById("team-a-dec-1")?.addEventListener("click", () => decrementTeamA());

  document.getElementById("team-b-inc-1")?.addEventListener("click", () => incrementTeamB());
  document.getElementById("team-b-inc-2")?.addEventListener("click", () => incrementTeamBBy2());
  document.getElementById("team-b-inc-3")?.addEventListener("click", () => incrementTeamBBy3());
  document.getElementById("team-b-dec-1")?.addEventListener("click", () => decrementTeamB());

  document.getElementById("reset-score")?.addEventListener("click", resetScores);
});
