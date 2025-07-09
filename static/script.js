
let countdownInterval;
let endTime = null;

function formatDuration(ms) {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function startCountdown(durationMs) {
  endTime = Date.now() + durationMs;
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const remaining = endTime - Date.now();
  if (remaining <= 0) {
    clearInterval(countdownInterval);
    document.getElementById("fasting-countdown").textContent = "00:00:00";
    alert("✅ Your fast has ended!");
  } else {
    document.getElementById("fasting-countdown").textContent = formatDuration(remaining);
  }
}

document.getElementById("log-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const type = document.getElementById("fast-type").value;
  const note = document.getElementById("log-note").value;
  const hours = type === "OMAD" ? 23 : type === "36-hour" ? 36 : parseInt(type);
  const ms = hours * 60 * 60 * 1000;
  const start = new Date();
  const end = new Date(start.getTime() + ms);
  document.getElementById("fasting-start").textContent = start.toLocaleString();
  document.getElementById("fasting-end").textContent = end.toLocaleString();
  startCountdown(ms);

  fetch("/log", {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({type, note, start, end})
  });
});

document.getElementById("pause-fast").addEventListener("click", () => {
  clearInterval(countdownInterval);
  document.getElementById("pause-fast").style.display = "none";
  document.getElementById("resume-fast").style.display = "inline";
});

document.getElementById("resume-fast").addEventListener("click", () => {
  endTime = Date.now() + (endTime - Date.now());
  countdownInterval = setInterval(updateCountdown, 1000);
  document.getElementById("pause-fast").style.display = "inline";
  document.getElementById("resume-fast").style.display = "none";
});

document.getElementById("reset-fast").addEventListener("click", () => {
  clearInterval(countdownInterval);
  document.getElementById("fasting-start").textContent = "--";
  document.getElementById("fasting-end").textContent = "--";
  document.getElementById("fasting-countdown").textContent = "--:--";
});
