// ===== Global Variables & Supabase Setup =====
const SUPABASE_URL = 'https://yvjoabpmyorsvofdajpv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_clE9pyURcbzjd2ryHuLGzg_eVVItVuc';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let workouts = [];

// ===== Section Navigation =====
function showSection(sectionId, btnContext = null) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");
  
  if (btnContext) {
    document.querySelectorAll("header nav button").forEach(btn => btn.classList.remove("active-btn"));
    btnContext.classList.add("active-btn");
  }

  if (sectionId === "history") displayHistory();
  if (sectionId === "analyse") updateChart();
}

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

// ===== Authentication & Init =====
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

document.addEventListener("DOMContentLoaded", async () => {
    // Check active session
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        handleLoginSuccess(session.user);
    } else {
        document.getElementById("loginScreen").style.display = "flex";
        document.getElementById("appContainer").style.display = "none";
    }

    // Listen for auth changes (e.g. Google OAuth redirect)
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            handleLoginSuccess(session.user);
        } else if (event === 'SIGNED_OUT') {
            handleLogoutSuccess();
        }
    });

    // Make sure date field defaults to today
    const dateInput = document.getElementById("date");
    if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }
});

async function handleLoginSuccess(user) {
    currentUser = user;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("appContainer").style.display = "flex";
    
    const homeBtn = document.querySelector("button[onclick*='home']");
    if (homeBtn) showSection("home", homeBtn);
    
    // Fetch user workouts from DB
    await fetchWorkouts();
}

function handleLogoutSuccess() {
    currentUser = null;
    workouts = [];
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("appContainer").style.display = "none";
    document.getElementById("loginForm").reset();
    toggleAuthMode('login');
}

// Signup with Email & Password
document.getElementById("signupForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const email = document.getElementById("regUsername").value.trim();
    const pass = document.getElementById("regPassword").value;
    const confirmPass = document.getElementById("regConfirmPassword").value;
    
    if (pass !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }
    
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: pass,
    });

    if (error) {
        alert("Error creating account: " + error.message);
    } else {
        alert("Account created successfully! Please log in (or check email for confirmation if enabled).");
        toggleAuthMode('login');
        this.reset();
    }
});

// Login with Email & Password
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const email = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value;
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: pass,
    });
    
    if (error) {
        alert("Login failed: " + error.message);
    } else {
        this.reset();
    }
});

// Login with Google
window.signInWithGoogle = async function() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) {
        alert("Google sign in failed: " + error.message);
    }
}

window.logout = async function() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error("Logout error", error);
    }
}

// ===== Database: Workouts =====

async function fetchWorkouts() {
    if (!currentUser) return;
    
    const { data, error } = await supabaseClient
        .from('workouts')
        .select('*')
        .order('date', { ascending: false });
        
    if (error) {
        console.error("Error fetching workouts:", error.message);
    } else {
        workouts = data || [];
        displayHistory();
    }
}

// Add Workout
document.getElementById("workoutForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!currentUser) return;

    const dayTypeElement = document.getElementById("dayType");
    const dayType = dayTypeElement.value;
    const exerciseName = document.getElementById("exerciseName").value.trim();
    const trackingType = document.getElementById("trackingType").value;
    const date = document.getElementById("date").value;

    const sets = parseInt(document.getElementById("sets").value);
    let workout = { 
        user_id: currentUser.id,
        day_type: dayType, 
        exercise_name: exerciseName, 
        tracking_type: trackingType, 
        sets, 
        date 
    };

    if (trackingType === "reps") {
        const reps = parseInt(document.getElementById("reps").value);
        if (!sets || !reps) return;
        workout.reps = reps;
        workout.duration = null;
    } else {
        const duration = parseInt(document.getElementById("duration").value);
        if (!sets || !duration) return;
        workout.duration = duration;
        workout.reps = null;
    }

    if (!dayType || !exerciseName || !date) return;

    // Add to DB
    const { data, error } = await supabaseClient
        .from('workouts')
        .insert([workout])
        .select();

    if (error) {
        alert("Failed to save workout: " + error.message);
        return;
    }

    if (data && data.length > 0) {
        workouts.push(data[0]); // update local state
    } else {
        await fetchWorkouts(); // fallback refetch
    }

    this.reset();
    document.getElementById("date").value = date; // lock the selected date
    
    dayTypeElement.value = dayType;
    dayTypeElement.disabled = true;
    document.getElementById("exitDayBtn").style.display = "block";

    const message = document.getElementById("successMessage");
    message.textContent = "Workout added successfully!";
    message.style.opacity = "1";
    setTimeout(() => (message.style.opacity = "0"), 2500);
});

// Add event listener to exit day button
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
  workouts.forEach((w) => {
    if (!grouped[w.date]) grouped[w.date] = [];
    grouped[w.date].push(w);
  });

  const sortedDates = Object.keys(grouped).sort((a,b) => new Date(b) - new Date(a));

  sortedDates.forEach(date => {
    const dayWorkouts = grouped[date];
    const dayType = dayWorkouts.find(w => w.day_type)?.day_type || "Workout Session";

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
      const details = w.tracking_type === 'time' || w.duration 
          ? `${w.sets || 1} sets × ${w.duration} duration` 
          : `${w.sets} sets × ${w.reps} reps`;
          
      tableHtml += `
        <tr>
          <td><strong>${w.exercise_name}</strong></td>
          <td>${details}</td>
          <td><button class="delete-btn" onclick="deleteWorkout('${w.id}')">Delete</button></td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table></div>`;
    dayCard.innerHTML = tableHtml;
    container.appendChild(dayCard);
  });
}

// ===== Delete Workout =====
window.deleteWorkout = async function(id) {
    const { error } = await supabaseClient
        .from('workouts')
        .delete()
        .eq('id', id);
        
    if (error) {
        alert("Failed to delete: " + error.message);
    } else {
        workouts = workouts.filter(w => w.id !== id);
        displayHistory();
    }
}

// ===== Chart.js Setup =====
let chart;
function updateChart() {
  const filter = document.getElementById("exerciseFilter");
  const exercises = [...new Set(workouts.map(w => w.exercise_name))];
  
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
    : workouts.filter(w => w.exercise_name === selectedExercise);

  // Aggregate data by date
  const totals = {};
  let usingTime = false;
  
  filteredWorkouts.forEach(w => {
    if (!totals[w.date]) totals[w.date] = 0;
    if (w.tracking_type === 'time' || w.duration) {
      totals[w.date] += (w.sets || 1) * (w.duration || 0);
      usingTime = true;
    } else {
      totals[w.date] += (w.sets * w.reps) || 0; 
    }
  });

  const labels = Object.keys(totals).sort((a,b) => new Date(a) - new Date(b));
  const data = labels.map(label => totals[label]);

  if (chart) chart.destroy();

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
