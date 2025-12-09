let timerDuration = 0;
let timeRemaining = 0;
let timerInterval = null;

const timerDisplay = document.getElementById("timer");

document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    timerDuration = parseInt(btn.dataset.minutes) * 60;
    timeRemaining = timerDuration;
    updateDisplay();
    updateFillLevel();
  });
});

document.getElementById("start-btn").addEventListener("click", startTimer);
document.getElementById("pause-btn").addEventListener("click", pauseTimer);
document.getElementById("reset-btn").addEventListener("click", resetTimer);
document.getElementById("complete-btn").addEventListener("click", completeTimer);

function startTimer() {
  if (!timerInterval && timeRemaining > 0) {
    timerInterval = setInterval(() => {
      timeRemaining--;
      updateDisplay();
      updateFillLevel();

      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        flashEndAnimation();
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timeRemaining = timerDuration;
  updateDisplay();
  updateFillLevel();
}

function completeTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timeRemaining = 0;
  updateDisplay();
  updateFillLevel();
  flashEndAnimation();
}

function updateDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function updateFillLevel() {
  if (timerDuration === 0) return;
  const progress = 100 - (timeRemaining / timerDuration) * 100;
  document.documentElement.style.setProperty("--fill-level", `${progress}%`);
}

function flashEndAnimation() {
  const cup = document.querySelector(".cup");
  cup.animate(
    [
      { transform: "scale(1)", backgroundColor: "#eaeaea" },
      { transform: "scale(1.1)", backgroundColor: "#fff176" },
      { transform: "scale(1)", backgroundColor: "#eaeaea" },
    ],
    {
      duration: 800,
      iterations: 2,
    }
  );
}


const completeBtn = document.getElementById("complete-btn");

completeBtn.addEventListener("click", async () => {
  
  const task = document.getElementById("task-input").value.trim();
  const duration = parseInt(document.getElementById("duration-input").value);

  // Validate
  if (!task) return alert("Please enter a task name.");
  if (isNaN(duration) || duration <= 0) return alert("Please enter a valid duration.");

  const sessionData = { task, duration };

  try {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData)
    });

    const result = await response.json();

    if (response.ok) {
      alert("✅ Session completed and saved!");
      console.log("Saved session:", result.session);

      // Optionally clear inputs
      document.getElementById("task-input").value = "";
      document.getElementById("duration-input").value = "";
    } else {
      alert("❌ Failed to save session: " + result.error);
    }
  } catch (err) {
    console.error("Error saving session:", err);
    alert("❌ Error saving session.");
  }
});
