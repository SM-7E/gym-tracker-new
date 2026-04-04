// ===== Global Variables =====
let currentUser = localStorage.getItem("gymtrack_user") || null;
let workouts = currentUser ? JSON.parse(localStorage.getItem("workouts_" + currentUser)) || [] : [];

function toggleTrackingFields() {
    const trackingType = document.getElementById("trackingType").value;
    const repsContainer = document.getElementById("repsContainer");
    const timeContainer = document.getElementById("timeContainer");
    
    document.getElementById("sets").required = true;
    
    if (trackingType === "time") {
        repsContainer.style.display = "none";
        document.getElementById("reps").required = false;
        
        timeContainer.style.display = "flex";
        document.getElementById("duration").required = true;
    } else {
        repsContainer.style.display = "flex";
        document.getElementById("reps").required = true;
        
        timeContainer.style.display = "none";
        document.getElementById("duration").required = false;
    }
}

// ===== Section Navigation =====
function showSection(sectionId, btnContext = null) {
  document.querySelectorAll("section").forEach(sec => {
    sec.classList.remove("active");
  });
  document.getElementById(sectionId).classList.add("active");
  
  if (btnContext) {
    document.querySelectorAll("header nav button").forEach(btn => btn.classList.remove("active-btn"));
    btnContext.classList.add("active-btn");
  }

  if (sectionId === "history") displayHistory();
  if (sectionId === "analyse") updateChart();
}

// ===== Authentication & Init =====
let accounts = JSON.parse(localStorage.getItem("gymtrack_accounts")) || [];

function toggleAuthMode(mode) {
    const loginCard = document.getElementById("loginCard");
    const signupCard = document.getElementById("signupCard");
    if (mode === 'signup') {
        loginCard.style.display = "none";
        signupCard.style.display = "block";
    } else {
        signupCard.style.display = "none";
        loginCard.style.display = "block";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (currentUser) {
        // Data Migration logic for original standalone users
        if (!localStorage.getItem("workouts_" + currentUser)) {
             const legacy = localStorage.getItem("workouts");
             if (legacy) {
                 localStorage.setItem("workouts_" + currentUser, legacy);
                 workouts = JSON.parse(legacy);
                 localStorage.removeItem("workouts");
             }
        }
        
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("appContainer").style.display = "flex";
        const homeBtn = document.querySelector("button[onclick*='home']");
        if (homeBtn) homeBtn.classList.add("active-btn");
        if (workouts.length > 0) displayHistory();
    } else {
        document.getElementById("loginScreen").style.display = "flex";
        document.getElementById("appContainer").style.display = "none";
    }
});

document.getElementById("signupForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const user = document.getElementById("regUsername").value.trim();
    const pass = document.getElementById("regPassword").value;
    const confirmPass = document.getElementById("regConfirmPassword").value;
    
    if (pass !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }
    
    const exists = accounts.find(a => a.username === user);
    if (exists) {
        alert("Username already exists. Please choose another.");
        return;
    }
    
    accounts.push({ username: user, password: pass });
    localStorage.setItem("gymtrack_accounts", JSON.stringify(accounts));
    alert("Account created successfully! Please log in.");
    toggleAuthMode('login');
    this.reset();
});

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value;
    
    const account = accounts.find(a => a.username === user && a.password === pass);
    
    // Auto-allow first-time usage via migration mechanism OR normal checks
    if (account || (accounts.length === 0)) {
        if (accounts.length === 0) {
             accounts.push({ username: user, password: pass });
             localStorage.setItem("gymtrack_accounts", JSON.stringify(accounts));
        }

        localStorage.setItem("gymtrack_user", user);
        currentUser = user;
        workouts = JSON.parse(localStorage.getItem("workouts_" + currentUser)) || [];
        
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("appContainer").style.display = "flex";
        const homeBtn = document.querySelector("button[onclick*='home']");
        showSection("home", homeBtn);
        if (workouts.length > 0) displayHistory();
        this.reset();
    } else {
        alert("Invalid username or password.");
    }
});

function logout() {
    localStorage.removeItem("gymtrack_user");
    currentUser = null;
    workouts = [];
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("appContainer").style.display = "none";
    document.getElementById("loginForm").reset();
    toggleAuthMode('login');
}

// ===== Add Workout =====
document.getElementById("workoutForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const dayTypeElement = document.getElementById("dayType");
  const dayType = dayTypeElement.value;
  const exerciseName = document.getElementById("exerciseName").value.trim();
  const trackingType = document.getElementById("trackingType").value;
  const date = document.getElementById("date").value;

  const sets = parseInt(document.getElementById("sets").value);
  let workout = { dayType, exerciseName, trackingType, sets, date };

  if (trackingType === "reps") {
    const reps = parseInt(document.getElementById("reps").value);
    if (!sets || !reps) return;
    workout.reps = reps;
  } else {
    const duration = parseInt(document.getElementById("duration").value);
    if (!sets || !duration) return;
    workout.duration = duration;
  }

  if (!dayType || !exerciseName || !date) return;

  workouts.push(workout);
  localStorage.setItem("workouts_" + currentUser, JSON.stringify(workouts));

  this.reset();
  document.getElementById("date").value = date; // lock the selected date too
  
  dayTypeElement.value = dayType;
  dayTypeElement.disabled = true;
  document.getElementById("exitDayBtn").style.display = "block";

  const message = document.getElementById("successMessage");
  message.textContent = "Workout added successfully!";
  message.style.opacity = "1";
  setTimeout(() => (message.style.opacity = "0"), 2500);
});

// Add event listener to exist day button
const exitDayBtn = document.getElementById("exitDayBtn");
if (exitDayBtn) {
  exitDayBtn.addEventListener("click", () => {
    const dayTypeElement = document.getElementById("dayType");
    dayTypeElement.disabled = false;
    dayTypeElement.value = "";
    exitDayBtn.style.display = "none";
  });
}

// ===== Display Workout History =====
function displayHistory() {
  const container = document.getElementById("historyContainer");
  if (!container) return;
  container.innerHTML = "";

  if (workouts.length === 0) {
    container.innerHTML = `<div class="glass-card" style="text-align: center; color: var(--text-muted); font-style: italic; padding: 30px;">No workouts found. Start training!</div>`;
    return;
  }

  const grouped = {};
  workouts.forEach((w, index) => {
    if (!grouped[w.date]) grouped[w.date] = [];
    grouped[w.date].push({ ...w, index });
  });

  const sortedDates = Object.keys(grouped).sort((a,b) => new Date(b) - new Date(a));

  sortedDates.forEach(date => {
    const dayWorkouts = grouped[date];
    // Find the first valid dayType for this date group
    const dayType = dayWorkouts.find(w => w.dayType)?.dayType || "Workout Session";

    const dayCard = document.createElement("div");
    dayCard.className = "glass-card";
    dayCard.style.marginBottom = "20px";

    let tableHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px; margin-bottom: 15px;">
        <h3 style="margin: 0; color: var(--primary); font-size: 1.2rem;">${date}</h3>
        <span style="background: rgba(0, 210, 255, 0.2); color: var(--primary); padding: 5px 12px; border-radius: 8px; font-weight: 600; font-size: 0.9rem;">${dayType}</span>
      </div>
      <div class="table-container" style="padding: 0;">
        <table style="width: 100%;">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Details</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
    `;

    dayWorkouts.forEach(w => {
      const details = w.trackingType === 'time' || w.duration 
          ? `${w.sets || 1} sets × ${w.duration} duration` 
          : `${w.sets} sets × ${w.reps} reps`;
          
      tableHtml += `
        <tr>
          <td><strong>${w.exerciseName}</strong></td>
          <td>${details}</td>
          <td><button class="delete-btn" onclick="deleteWorkout(${w.index})">Delete</button></td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table></div>`;
    dayCard.innerHTML = tableHtml;
    container.appendChild(dayCard);
  });
}

// ===== Delete Workout =====
function deleteWorkout(index) {
  workouts.splice(index, 1);
  localStorage.setItem("workouts_" + currentUser, JSON.stringify(workouts));
  displayHistory();
}

// ===== Chart.js Setup =====
let chart;
function updateChart() {
  const filter = document.getElementById("exerciseFilter");
  const exercises = [...new Set(workouts.map(w => w.exerciseName))];
  
  const currentValue = filter.value;
  filter.innerHTML = `<option value="all">All Exercises</option>`;
  exercises.forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex;
    opt.textContent = ex;
    filter.appendChild(opt);
  });
  
  if (exercises.includes(currentValue)) {
      filter.value = currentValue;
  }

  filter.onchange = drawChart;
  drawChart();
}

function drawChart() {
  const ctx = document.getElementById("workoutChart").getContext("2d");
  const selectedExercise = document.getElementById("exerciseFilter").value;

  const filteredWorkouts = selectedExercise === "all"
    ? workouts
    : workouts.filter(w => w.exerciseName === selectedExercise);

  // Aggregate data by date
  const totals = {};
  let usingTime = false;
  
  filteredWorkouts.forEach(w => {
    if (!totals[w.date]) totals[w.date] = 0;
    if (w.trackingType === 'time' || w.duration) {
      totals[w.date] += (w.sets || 1) * (w.duration || 0);
      usingTime = true;
    } else {
      totals[w.date] += (w.sets * w.reps) || 0; 
    }
  });

  // Sort dates properly
  const labels = Object.keys(totals).sort((a,b) => new Date(a) - new Date(b));
  const data = labels.map(label => totals[label]);

  if (chart) chart.destroy();

  // Create gradient depending on ctx size
  let gradient;
  try {
      gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(0, 210, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 210, 255, 0.1)');
  } catch(e) {
      gradient = 'rgba(0, 210, 255, 0.8)';
  }

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: usingTime && selectedExercise !== "all" ? "Total Duration (Mins)" : "Volume (Reps / Mins)",
        data,
        backgroundColor: gradient,
        borderColor: "#00d2ff",
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: "#3a7bd5"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#ffffff", font: { family: "'Poppins', sans-serif", size: 14 } }
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.8)",
          titleColor: "#00d2ff",
          bodyFont: { family: "'Poppins', sans-serif" },
          titleFont: { family: "'Poppins', sans-serif", size: 14 },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        y: { 
          beginAtZero: true,
          ticks: { color: "#b3b3b3", font: { family: "'Poppins', sans-serif" } },
          grid: { color: "rgba(255, 255, 255, 0.1)" }
        },
        x: {
          ticks: { color: "#b3b3b3", font: { family: "'Poppins', sans-serif" } },
          grid: { display: false }
        }
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      }
    }
  });
}

// ===== Initialize Defaults =====
document.getElementById("date").value = new Date().toISOString().split("T")[0];
