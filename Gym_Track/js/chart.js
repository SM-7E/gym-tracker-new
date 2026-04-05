// js/chart.js
// ===== Chart.js Setup & Analysis =====

let chart; // Keep chart instance in this module's scope

function updateChart() {
  const filter = document.getElementById("exerciseFilter");
  
  // Extract all unique exercises from global workouts array
  const exercises = [...new Set(workouts.map(w => w.exercise_name))];
  
  const currentValue = filter.value;
  filter.innerHTML = `<option value="all">All Exercises</option>`;
  exercises.forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex;
    opt.textContent = ex;
    filter.appendChild(opt);
  });
  
  // Restore previously selected value if it still exists
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
