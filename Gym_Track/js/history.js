// js/history.js
// ===== Display Workout History UI =====

function displayHistory() {
  const container = document.getElementById("historyContainer");
  if (!container) return;
  container.innerHTML = "";

  if (workouts.length === 0) {
    container.innerHTML = `<div class="glass-card" style="text-align: center; color: var(--text-muted); font-style: italic; padding: 30px;">No workouts found. Start training!</div>`;
    return;
  }

  // Group workouts by date
  const grouped = {};
  workouts.forEach((w) => {
    if (!grouped[w.date]) grouped[w.date] = [];
    grouped[w.date].push(w);
  });

  // Sort dates descending
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
          ? `${w.sets || 1} sets × ${w.duration} mins` 
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
