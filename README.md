# GymTrack 🏋️‍♂️

GymTrack is a modern, lightweight, and performant web application dedicated to tracking and analyzing daily fitness workouts. Built specifically using **Vanilla Javascript**, it leverages **Supabase** for robust cloud database architecture and **Google OAuth** for seamless authentication—all wrapped within a gorgeous, state-of-the-art **Glassmorphism** UI design.

![UI Overview](https://img.shields.io/badge/UI-Glassmorphism-00d2ff?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Vanilla_JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)
![Database](https://img.shields.io/badge/Database-Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)

---

## ✨ Features
* **Secure Authentication**: Register and login effortlessly with Email/Password or 1-Click Google Sign-In, powered by Supabase Auth with strict Row Level Security (RLS).
* **Detailed Workout Logging**: Track split days (e.g., Push, Pull, Legs) with meticulous target details including Sets, Reps, and Time (Duration).
* **Cloud Database**: Real-time CRUD (Create, Read, Update, Delete) synchronization ensuring that your workouts are backed up in the cloud securely.
* **Graphical Analytics**: A built-in analysis dashboard powered by `Chart.js` to visualize your total volume and duration over time, filterable by specific exercises.

---

## 🛠 Tech Stack & Architecture

This project was intentionally built **without** heavy frameworks (like React or Angular) to demonstrate a deep understanding of Clean Code Architecture, DOM Manipulation, and Modular Programming directly in Vanilla JavaScript. 

### Modular File Structure
The logic has been strictly decoupled into targeted Javascript modules inside the `js/` directory:

1. **`config.js`**: Core setup initializing the Supabase client and maintaining global state.
2. **`auth.js`**: Completely encapsulates Session Management, Sign-Ups, Logins, and OAuth.
3. **`database.js`**: The network layer dealing exclusively with SQL database inserts and fetches.
4. **`history.js`**: Advanced DOM generation that loops through DB data and builds dynamic HTML tables.
5. **`chart.js`**: Isolates all third-party analytics and canvas rendering logic.
6. **`ui.js`**: Manages all user-interface display toggles and visual states.

### The View (`index.html` & `style.css`)
The application is a Single Page Application (SPA). `index.html` is heavily annotated with specialized section banners for extreme readability, while `style.css` provides a sleek and premium Dark Mode Glassmorphism aesthetic.

---

## 🚀 How to Run Locally

Because this application relies on standard OAuth flows and strict Supabase URL Redirect rules, it must be run on a local server, NOT directly from the filesystem (e.g., `file:///...`).

1. Open this project folder in **Visual Studio Code**.
2. Make sure you have the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension installed.
3. Right-click specifically on `Gym_Track/index.html` and select **"Open with Live Server"**.
4. The application will launch in your browser (usually at `http://127.0.0.1:5500`).
5. *Note: If you run it on another port, ensure you whitelist that port in the Supabase Redirect URI Settings.*

---

## 🔒 Security
All workouts are stored in a PostgreSQL database powered by Supabase. Due to explicitly configured **Row Level Security (RLS)**, a logged-in user can uniquely fetch and modify *only* the workout rows connected to their authenticated `user_id`. No user can view another user's workout data. 

> *Crafted for Greatness.*