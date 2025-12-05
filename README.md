# FINAL-OJT-POMODORO
Here is a comprehensive, professional README.md file tailored specifically for your FocusFlow project.

I have analyzed your code to accurately document features like the "Strict Mode" (tab switching detection), the LocalStorage database structure, and the analytics logic.

🚀 FocusFlow - Student Focus & Study Timer
FocusFlow is a modern, distraction-free Pomodoro timer designed specifically for students. It combines strict focus enforcement, built-in study resources, and detailed analytics into a beautiful, theme-able interface.

Unlike standard timers, FocusFlow penalizes distraction: if you leave the tab while the timer is running, your session fails.

✨ Key Features
⏱️ Smart Timer: Customizable focus durations with a visual progress ring.

🚫 Strict Focus Mode: Uses the Page Visibility API to detect tab switching. If you leave the tab during a session, the timer aborts and records a "Failure."

🔒 Source Locking: The "Study" tab (embedded browser) is locked by default and only becomes accessible when the timer is actively running.

📊 Analytics Dashboard:

Weekly bar chart visualization (CSS-based).

Daily focus totals.

Current streak calculation.

Average break duration tracking.

🌗 Dynamic Theming: Toggle between a clean "Light Violet" mode and a deep "Midnight Purple" dark mode.

👤 Local Auth: Supports multiple user profiles on a single device using LocalStorage (no backend required).

🛠️ Tech Stack
Core: HTML5, CSS3, Vanilla JavaScript (ES6+).

Styling: Tailwind CSS (via CDN) with custom color configuration.

Icons: Phosphor Icons.

Data Persistence: Browser LocalStorage (simulating a JSON database).

Font: 'Outfit' from Google Fonts.

🧩 Logic Flow
FocusFlow operates on a strict state machine to ensure students stay on task.

Code snippet

graph TD
    A[IDLE State] -->|User clicks Start| B[FOCUSING State]
    B -->|Timer Ends| C[COMPLETE State]
    B -->|User switches Tab| D{Strict Check}
    D -->|Authorized Exit?| B
    D -->|Unauthorized| E[FAIL State]
    E -->|Reset| A
    C -->|Update Analytics| A
    B -->|User clicks Pause| F[BREAK State]
    F -->|Resume| B
📂 Project Structure
Plaintext

/focus-flow
│
├── index.html      # Main DOM structure, Tailwind config, and View Logic
├── style.css       # Custom animations, scrollbars, and specific overrides
├── script.js       # Core logic (Timer, Auth, Analytics, Tab Detection)
└── README.md       # Project documentation
🚀 Getting Started
Since FocusFlow uses client-side technologies and CDNs, no installation (npm/node) is required to run the app.

Clone or Download this repository.

Open index.html in any modern web browser (Chrome, Edge, Firefox, Safari).

Sign Up: Create a local account (data is stored in your browser).

Start Focusing: Set your time and hit Start.

Note: For the "Study" browser feature to work correctly with external websites, some sites may block being embedded in an iframe due to X-Frame-Options. The current code is set to load https://learn.polariscampus.com/.

⚙️ Configuration & Customization
Changing the Study Resource
By default, the embedded browser opens a specific URL. To change this to your preferred learning platform (e.g., Wikipedia, documentation):

Open index.html.

Locate the openQuickLink function call inside the #browser-view section:

HTML

<button onclick="openQuickLink('https://your-preferred-site.com')" ... >
Adjusting Timer Defaults
To change the default time from 25 minutes:

Open index.html.

Find the input field and change the value:

HTML

<input type="number" id="input-minutes" value="45" ... >
💾 Data Management
FocusFlow uses a key named focusFlowData_v3 in your browser's LocalStorage.

Data Structure Example:

JSON

{
  "users": [
    { "name": "User", "email": "user@test.com", "pass": "123" }
  ],
  "analytics": {
    "user@test.com": {
      "2023-10-27": {
        "focus": 50,      // Total minutes focused
        "breaks": [5, 10] // Array of break durations
      }
    }
  }
}
To clear your data, open your browser console (F12) and run:

JavaScript

localStorage.removeItem('focusFlowData_v3');
location.reload();
🤝 Contributing
Fork the project.

Create your feature branch (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'Add some AmazingFeature').

Push to the branch (git push origin feature/AmazingFeature).

Open a Pull Request.

📄 License
Distributed under the MIT License. See LICENSE for more information.
<img width="1512" height="824" alt="Screenshot 2025-12-04 at 12 36 37 PM" src="https://github.com/user-attachments/assets/f53d2b4f-d87e-4ce3-b560-bf559c24af84" />
