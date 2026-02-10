let scoreA = 0;
let scoreB = 0;

const STORAGE_KEY = "score-keeper:scores";

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

function incrementTeamA() {
  scoreA += 1;
  renderScores();
  saveScores();
  announceScore("Phoenix Suns", scoreA);
}

function decrementTeamA() {
  scoreA = Math.max(0, scoreA - 1);
  renderScores();
  saveScores();
  announceScore("Phoenix Suns", scoreA);
}

function incrementTeamB() {
  scoreB += 1;
  renderScores();
  saveScores();
  announceScore("Chicago Bulls", scoreB);
}

function decrementTeamB() {
  scoreB = Math.max(0, scoreB - 1);
  renderScores();
  saveScores();
  announceScore("Chicago Bulls", scoreB);
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

// Ensure the UI matches initial state on load
document.addEventListener("DOMContentLoaded", () => {
  loadScores();
  renderScores();
});

// Expose functions for inline onclick handlers
window.incrementTeamA = incrementTeamA;
window.decrementTeamA = decrementTeamA;
window.incrementTeamB = incrementTeamB;
window.decrementTeamB = decrementTeamB;
