# 🤰 PregCompanion | Modern Maternal Health

[![Website](https://img.shields.io/badge/Website-Live-brightgreen.svg)](https://antonyshaji1792.github.io/pregcompanion/)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-blue)](https://github.com/antonyshaji1792/pregcompanion)

**PregCompanion** is a comprehensive, open-source web application designed as a one-stop maternal health tracking companion. Carefully developed for expecting mothers, this modern tool offers a beautiful, mobile-friendly interface to track your journey from pre-conception or planning stages, passing through pregnancy, all the way to postpartum recovery. 

Experience smart tracking, medical insights, extensive calculators, and a private space for your most important milestones—all locally secured on your device!

🌐 **Live Demo:** [https://antonyshaji1792.github.io/pregcompanion/](https://antonyshaji1792.github.io/pregcompanion/)

---

## 🛠️ Tech Stack & Technologies Used

PregCompanion is built using modern front-end technologies with a focus on high performance, beautiful UI, and maintaining user privacy without relying on backend servers.

*   **HTML5 & CSS3** for structure and styling, utilizing custom CSS and a beautiful *glassmorphism* aesthetic.
*   **Vanilla JavaScript (ES6 Modules)** powers the core application logic.
*   **[Bootstrap 5.3.3](https://getbootstrap.com/) & Bootstrap Icons** for responsive layouts, cards, modals, and consistent iconography.
*   **[jQuery 3.6.0](https://jquery.com/)** to simplify DOM manipulations and UI events.
*   **[Day.js 1.11.7](https://day.js.org/)** with plugins for reliable and precise date/time calculations (essential for pregnancy tracking).
*   **[Chart.js](https://www.chartjs.org/)** for rendering beautiful data visualizations in user insights.
*   **Canvas Confetti** for delightful celebration animations on milestones.
*   **Local Storage** for fully local, secure, and private data persistence.

---

## ⚙️ How It Works

PregCompanion operates entirely in your web browser. It is a client-side **Single Page Application (SPA)** that uses vanilla JavaScript logic and DOM manipulation to simulate a modern App experience. 

Because pregnancy data is highly personal, **no data is ever sent to a database or external server.** Everything—your symptoms, timeline, logs, and profile info—is encrypted and securely saved directly on your browser's local storage. This ensures 100% privacy and lightning-fast performance. Navigation is handled seamlessly by dynamically hiding and showing dashboard modules based on the selected user stage (Planning, Pregnancy, or Postpartum).

---

## ✨ Features & Capabilities

PregCompanion hosts a highly extensive suite of tools and views, categorized intelligently to accompany users every step of the way. 

### 💡 Core Modules
*   **Personal Dashboard** - A dynamic hub providing a high-level overview of daily moments, weekly progress, and upcoming tasks based on your user-stage.
*   **Pregnancy Calendar** - Visual timeline and calendar to track appointments.
*   **Knowledge Hub** - Educational articles, definitions, and medical insights integrated natively.
*   **Dark Mode Support** - Seamlessly switch between light and dark themes with a completely premium UI experience.

### 📐 Clinical Calculators
*   **Due Date (EDD)** - Plan using LMP (Last Menstrual Period) or ultrasound data.
*   **Ovulation & Safe Period** - For users in the family planning/pre-conception stage.
*   **Conception & IVF Due Date** - Calculators accurately scaled for standard conceiving or IVF cycles.
*   **Biometry (Fetal Scans)** - To estimate and track fetal weight.
*   **hCG Growth Indicator** - Calculates the doubling time of your hormone levels.
*   **Bishop Score & VBAC Predictor** - Tools helping assess labor readiness.
*   **BMI, BMR, TDEE, & IBW** - Health calculators monitoring core metabolic metrics.

### 📊 Health Trackers
*   **Kick Counter** - Monitor fetal movement conveniently.
*   **Contraction Timer** - Smart timer accurately timing duration and frequency.
*   **Weight Gain & BP Checker** - Track metrics ensuring you stay in a healthy clinical range.
*   **Period Tracker** - Cycle and ovulation histories.
*   **Hydration Tracker & Sleep Apnea (STOP-Bang)** - Holistic wellness logging.
*   **Macros & Target Heart Rate Tools** - Nutrition and activity guidance.
*   **Bump Tracker** - Gallery feature to securely document bump photos weekly.
*   **Symptom & Journal Logs** - A secure personal diary throughout your maternal journey.

---

## 🚀 How to Use / Run Locally

Since this is an open-source, purely client-side application, getting it up and running on your local machine is incredibly simple. ANYBODY can download this public repository, use it, and also contribute to it.

### Using the App Online
You can use the completely free, hosted version via GitHub Pages right now: 
👉 [Open PregCompanion](https://antonyshaji1792.github.io/pregcompanion/)

### Running Locally
To test the application or use it on your computer:
1. Clone the repository:
   ```bash
   git clone https://github.com/antonyshaji1792/pregcompanion.git
   ```
2. Navigate to the project directory:
   ```bash
   cd pregcompanion
   ```
3. Open `index.html` directly in any modern web browser.
   *Alternatively, for the best development experience, you can open the project folder in VS Code and use an extension like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) to host it locally.*
4. Start exploring the app! No build steps (like `npm install` or `npm run build`) are required. Everything is pre-bundled and relies on standard modern web capabilities and CDNs.

---

## 🤝 Contributing

We highly encourage and welcome contributions! Whether it be structural improvements, new calculators, accessibility enhancements, bug fixes, UI polishes, or fundamentally new ideas, this is a public repository that anyone can contribute to.

### Steps to Contribute:
1. **Fork** the repository and clone your fork locally.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`
3. Make your changes to the codebase. *(Note: Ensure you uphold the pattern of entirely local data persistence—no calls to backend APIs with sensitive user data! Always use `storage-layer.js`/localStorage.)*
4. **Commit** your changes: `git commit -m "Add some awesome feature"`
5. **Push** to the branch: `git push origin feature/your-feature-name`
6. Open a **Pull Request** onto the `main` branch of this repository for review!

---
*Created with ❤️ for mothers everywhere. Open source and free forever.*
