// js/database.js
// ===== Database: Workouts CRUD Operations =====

async function fetchWorkouts() {
    if (!currentUser) return;
    
    const { data, error } = await supabaseClient
        .from('workouts')
        .select('*')
        .order('date', { ascending: false });
        
    if (error) {
        console.error("Error fetching workouts:", error.message);
    } else {
        workouts = data || []; // Update global state
        displayHistory(); // Trigger UI rebuild from history.js
    }
}

// Add Workout Form Handler
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
        user_id: currentUser.id, // from config.js
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

    // Insert to DB
    const { data, error } = await supabaseClient
        .from('workouts')
        .insert([workout])
        .select();

    if (error) {
        alert("Failed to save workout: " + error.message);
        return;
    }

    // Update local state instantly
    if (data && data.length > 0) {
        workouts.push(data[0]); 
    } else {
        await fetchWorkouts();
    }

    this.reset();
    document.getElementById("date").value = date; 
    
    dayTypeElement.value = dayType;
    dayTypeElement.disabled = true;
    document.getElementById("exitDayBtn").style.display = "block";

    const message = document.getElementById("successMessage");
    message.textContent = "Workout added successfully!";
    message.style.opacity = "1";
    setTimeout(() => (message.style.opacity = "0"), 2500);
});

// Delete Workout (Exposed globally for HTML onclick)
window.deleteWorkout = async function(id) {
    const { error } = await supabaseClient
        .from('workouts')
        .delete()
        .eq('id', id);
        
    if (error) {
        alert("Failed to delete: " + error.message);
    } else {
        workouts = workouts.filter(w => w.id !== id);
        displayHistory(); // Re-render history UI
    }
}
