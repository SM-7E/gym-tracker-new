// js/ui.js
// ===== Section Navigation & UI State =====

function showSection(sectionId, btnContext = null) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");
  
  if (btnContext) {
    document.querySelectorAll("header nav button").forEach(btn => btn.classList.remove("active-btn"));
    btnContext.classList.add("active-btn");
  }

  // Trigger data rendering where necessary
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

// Attach smaller UI listeners on load
document.addEventListener("DOMContentLoaded", () => {
  const exitDayBtn = document.getElementById("exitDayBtn");
  if (exitDayBtn) {
    exitDayBtn.addEventListener("click", () => {
      const dayTypeElement = document.getElementById("dayType");
      dayTypeElement.disabled = false;
      dayTypeElement.value = "";
      exitDayBtn.style.display = "none";
    });
  }

  // Default date to today
  const dateInput = document.getElementById("date");
  if (dateInput) {
      dateInput.value = new Date().toISOString().split("T")[0];
  }
});
