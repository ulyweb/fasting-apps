
let countdownInterval;
let endTime;

document.addEventListener("DOMContentLoaded", function () {
  const startInput = document.getElementById("start-time");
  flatpickr(startInput, { enableTime: true, dateFormat: "Y-m-d H:i" });

  fetch("/username").then(res => res.json()).then(data => {
    document.getElementById("username").textContent = data.username;
  });

  loadPersistentCountdown();

  document.getElementById("log-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const hours = parseInt(document.getElementById("fast-type").value);
    const note = document.getElementById("log-note").value;
    const startStr = document.getElementById("start-time").value;
    const start = new Date(startStr || new Date());
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    document.getElementById("fasting-start").textContent = start.toLocaleString();
    document.getElementById("fasting-end").textContent = end.toLocaleString();
    startCountdown(end);
    localStorage.setItem("fast_end", end.toISOString());

    fetch("/log", {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({type: hours, note, start, end})
    });
  });

  document.getElementById("pause-fast").onclick = () => {
    clearInterval(countdownInterval);
    document.getElementById("pause-fast").style.display = "none";
    document.getElementById("resume-fast").style.display = "inline";
  };

  document.getElementById("resume-fast").onclick = () => {
    if (endTime) startCountdown(endTime);
    document.getElementById("resume-fast").style.display = "none";
    document.getElementById("pause-fast").style.display = "inline";
  };

  document.getElementById("reset-fast").onclick = () => {
    clearInterval(countdownInterval);
    localStorage.removeItem("fast_end");
    document.getElementById("fasting-countdown").textContent = "--:--";
  };

  document.getElementById("toggleDark").onclick = () => {
    document.body.classList.toggle("dark-mode");
  };
});

function loadPersistentCountdown() {
  const savedEnd = localStorage.getItem("fast_end");
  if (savedEnd) {
    const end = new Date(savedEnd);
    startCountdown(end);
  }
}

function startCountdown(end) {
  endTime = end;
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const now = new Date();
  const remaining = endTime - now;
  if (remaining <= 0) {
    clearInterval(countdownInterval);
    document.getElementById("fasting-countdown").textContent = "00:00:00";
    alert("✅ Fasting complete!");
    localStorage.removeItem("fast_end");
    return;
  }
  const hours = String(Math.floor(remaining / 3600000)).padStart(2, '0');
  const minutes = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
  document.getElementById("fasting-countdown").textContent = `${hours}:${minutes}:${seconds}`;
}
