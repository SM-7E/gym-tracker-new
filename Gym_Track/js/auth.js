// js/auth.js
// ===== Authentication & Session Lifecycle =====

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Check for existing active session
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        handleLoginSuccess(session.user);
    } else {
        document.getElementById("loginScreen").style.display = "flex";
        document.getElementById("appContainer").style.display = "none";
    }

    // 2. Listen for auth state changes (Google OAuth redirect, Session Expire, etc)
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            handleLoginSuccess(session.user);
        } else if (event === 'SIGNED_OUT') {
            handleLogoutSuccess();
        }
    });
});

async function handleLoginSuccess(user) {
    currentUser = user; // Set global state (from config.js)
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("appContainer").style.display = "flex";
    
    const homeBtn = document.querySelector("button[onclick*='home']");
    if (homeBtn) showSection("home", homeBtn); 
    
    await fetchWorkouts(); 
}

function handleLogoutSuccess() {
    currentUser = null;
    workouts = [];
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("appContainer").style.display = "none";
    document.getElementById("loginForm").reset();
    toggleAuthMode('login'); // From ui.js
}

// Signup with Email
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
        alert("Account created successfully! Please log in.");
        toggleAuthMode('login');
        this.reset();
    }
});

// Login with Email
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

// Login with Google OAuth
window.signInWithGoogle = async function() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Guarantee safe redirection locally vs production
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) {
        alert("Google sign in failed: " + error.message);
    }
}

// Logout globally
window.logout = async function() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error("Logout error", error);
    }
}
