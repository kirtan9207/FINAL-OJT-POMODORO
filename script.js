// --- THEME LOGIC ---
function initTheme() {
    // Check local storage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        updateThemeIcon('dark');
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeIcon('light');
    }
}

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
        updateThemeIcon('light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
        updateThemeIcon('dark');
    }
}

function updateThemeIcon(mode) {
    const icon = document.getElementById('theme-icon');
    if (mode === 'dark') {
        icon.classList.remove('ph-moon-stars');
        icon.classList.add('ph-sun');
    } else {
        icon.classList.remove('ph-sun');
        icon.classList.add('ph-moon-stars');
    }
}

// Initialize Theme immediately
initTheme();

// --- DATA MANAGEMENT (LocalStorage) ---
const DB_KEY = 'focusFlowData_v3'; 
const SESSION_KEY = 'focusFlowUser';

function getLocalISODate(dateObj) {
    const d = dateObj || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDB() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : { users: [], analytics: {} };
}

function saveDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function getCurrentUser() {
    return localStorage.getItem(SESSION_KEY);
}

// --- AUTH LOGIC ---
function toggleAuth(view) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const errorMsg = document.getElementById('auth-error');
    
    errorMsg.classList.add('hidden-section');
    if (view === 'signup') {
        loginForm.classList.add('hidden-section');
        signupForm.classList.remove('hidden-section');
    } else {
        signupForm.classList.add('hidden-section');
        loginForm.classList.remove('hidden-section');
    }
}

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-pass').value;
    const errorMsg = document.getElementById('auth-error');

    const db = getDB();
    if (db.users.find(u => u.email === email)) {
        errorMsg.textContent = "Email already registered.";
        errorMsg.classList.remove('hidden-section');
        return;
    }

    db.users.push({ name, email, pass });
    db.analytics[email] = {}; 
    saveDB(db);

    localStorage.setItem(SESSION_KEY, email);
    initApp();
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const errorMsg = document.getElementById('auth-error');

    const db = getDB();
    const user = db.users.find(u => u.email === email && u.pass === pass);

    if (user) {
        localStorage.setItem(SESSION_KEY, email);
        initApp();
    } else {
        errorMsg.textContent = "Invalid email or password.";
        errorMsg.classList.remove('hidden-section');
    }
});

function logout() {
    resetTimer(); 
    localStorage.removeItem(SESSION_KEY);
    location.reload();
}

// --- NAVIGATION LOGIC ---
function switchView(viewName) {
    const timerView = document.getElementById('timer-view');
    const analyticsView = document.getElementById('analytics-view');
    const browserView = document.getElementById('browser-view');
    const lockOverlay = document.getElementById('source-lock-overlay');
    const mainContainer = document.getElementById('main-container');
    
    const navTimer = document.getElementById('nav-timer');
    const navAnalytics = document.getElementById('nav-analytics');
    const navBrowser = document.getElementById('nav-browser');

    // Handle Source Locking
    if (viewName === 'browser' && appState === 'IDLE') {
        lockOverlay.classList.remove('hidden-section');
    } else {
        lockOverlay.classList.add('hidden-section');
    }

    // Reset all views
    [timerView, analyticsView, browserView].forEach(v => v.classList.add('hidden-section'));
    [navTimer, navAnalytics, navBrowser].forEach(n => {
        n.classList.remove('nav-active');
        n.classList.add('nav-inactive');
    });

    // Adjust container padding for fullscreen browser
    if (viewName === 'browser') {
        mainContainer.classList.remove('p-4', 'md:p-6');
        mainContainer.classList.add('p-0');
    } else {
        mainContainer.classList.remove('p-0');
        mainContainer.classList.add('p-4', 'md:p-6');
    }

    if (viewName === 'timer') {
        timerView.classList.remove('hidden-section');
        navTimer.classList.add('nav-active');
        navTimer.classList.remove('nav-inactive');
    } else if (viewName === 'analytics') {
        analyticsView.classList.remove('hidden-section');
        navAnalytics.classList.add('nav-active');
        navAnalytics.classList.remove('nav-inactive');
        loadAnalytics(); 
    } else if (viewName === 'browser') {
        browserView.classList.remove('hidden-section');
        navBrowser.classList.add('nav-active');
        navBrowser.classList.remove('nav-inactive');
    }
}

// --- SOURCE BROWSER LOGIC ---
let currentBrowserUrl = "";
let isAuthorizedExit = false;

function openQuickLink(url) {
    const iframe = document.getElementById('browser-frame');
    const placeholder = document.getElementById('browser-placeholder');
    const navBar = document.getElementById('browser-nav-bar');
    
    currentBrowserUrl = url;
    iframe.src = url;
    iframe.classList.remove('hidden-section');
    placeholder.classList.add('hidden-section');
    navBar.classList.remove('hidden-section');
}

function closeBrowser() {
    const iframe = document.getElementById('browser-frame');
    const placeholder = document.getElementById('browser-placeholder');
    const navBar = document.getElementById('browser-nav-bar');
    
    iframe.src = "";
    currentBrowserUrl = "";
    iframe.classList.add('hidden-section');
    placeholder.classList.remove('hidden-section');
    navBar.classList.add('hidden-section');
}

function forceOpenTab() {
    if(currentBrowserUrl) {
        isAuthorizedExit = true;
        showSafeModeToast();
        window.open(currentBrowserUrl, '_blank');
    }
}

function showSafeModeToast() {
    const toast = document.getElementById('safe-mode-toast');
    toast.classList.remove('hidden-section');
}

function hideSafeModeToast() {
    const toast = document.getElementById('safe-mode-toast');
    toast.classList.add('hidden-section');
}

// --- CORE TIMER LOGIC ---
let mainInterval;
let breakInterval;
let focusTotalSeconds;
let focusRemainingSeconds;
let breakStartTime = 0; 
let currentBreakSeconds = 0; 
let appState = 'IDLE'; 

function initApp() {
    const email = getCurrentUser();
    if (!email) {
        document.getElementById('auth-view').classList.remove('hidden-section');
        document.getElementById('app-view').classList.add('hidden-section');
        return;
    }

    const db = getDB();
    const user = db.users.find(u => u.email === email);
    document.getElementById('user-display-name').textContent = user ? user.name : 'Student';

    document.getElementById('auth-view').classList.add('hidden-section');
    document.getElementById('app-view').classList.remove('hidden-section');

    resetTimer();
    loadAnalytics();
    switchView('timer'); 
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateFocusDisplay() {
    const display = document.getElementById('timer-display');
    const ring = document.getElementById('timer-progress');
    
    display.textContent = formatTime(focusRemainingSeconds);
    const maxDash = 728; // Updated for r=116
    const offset = maxDash - ((focusRemainingSeconds / focusTotalSeconds) * maxDash);
    ring.style.strokeDashoffset = offset;
}

function startTimer() {
    if (appState === 'BREAK') {
        stopBreakTimer();
    }

    appState = 'FOCUSING';
    
    // Unlock source view logic check if on page
    const lockOverlay = document.getElementById('source-lock-overlay');
    lockOverlay.classList.add('hidden-section');

    // Lock UI
    document.getElementById('btn-start').classList.add('hidden-section');
    document.getElementById('btn-pause').classList.remove('hidden-section');
    document.getElementById('btn-start').innerHTML = `<i class="ph ph-play-circle text-xl"></i> RESUME FOCUS`; 
    
    document.getElementById('timer-status').textContent = "FOCUSING";
    document.getElementById('timer-status').className = "text-primary-600 dark:text-primary-400 mt-2 uppercase text-[10px] tracking-[0.2em] font-extrabold bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full animate-pulse";
    
    document.getElementById('timer-progress').classList.remove('text-accent-500');
    document.getElementById('timer-progress').classList.add('text-primary-500', 'dark:text-primary-600');
    
    // Disable Inputs
    document.getElementById('input-minutes').disabled = true;
    document.getElementById('input-seconds').disabled = true;

    const startTime = Date.now();
    const expectedEnd = startTime + (focusRemainingSeconds * 1000);

    clearInterval(mainInterval);
    mainInterval = setInterval(() => {
        const now = Date.now();
        const secondsLeft = Math.ceil((expectedEnd - now) / 1000);
        
        if (secondsLeft >= 0) {
            focusRemainingSeconds = secondsLeft;
            updateFocusDisplay();
        } else {
            completeSession();
        }
    }, 100); 
}

function pauseTimer() {
    if (appState !== 'FOCUSING') return;

    clearInterval(mainInterval);
    appState = 'BREAK';

    document.getElementById('btn-start').classList.remove('hidden-section');
    document.getElementById('btn-pause').classList.add('hidden-section');
    
    document.getElementById('timer-status').textContent = "ON BREAK";
    document.getElementById('timer-status').className = "text-accent-600 dark:text-accent-400 mt-2 uppercase text-[10px] tracking-[0.2em] font-extrabold bg-accent-100 dark:bg-accent-900/30 px-3 py-1 rounded-full";

    document.getElementById('timer-progress').classList.remove('text-primary-500', 'dark:text-primary-600');
    document.getElementById('timer-progress').classList.add('text-accent-500');
    document.getElementById('timer-progress').style.strokeDashoffset = 0; 

    breakStartTime = Date.now();
    currentBreakSeconds = 0;
    
    document.getElementById('timer-display').textContent = "00:00";

    breakInterval = setInterval(() => {
        const now = Date.now();
        currentBreakSeconds = Math.floor((now - breakStartTime) / 1000);
        document.getElementById('timer-display').textContent = formatTime(currentBreakSeconds);
    }, 1000);
}

function stopBreakTimer() {
    clearInterval(breakInterval);
    const breakMins = Math.floor(currentBreakSeconds / 60);
    if (breakMins > 0) {
        recordBreakData(breakMins);
    }
}

function resetTimer() {
    clearInterval(mainInterval);
    clearInterval(breakInterval);
    appState = 'IDLE';
    
    // Re-lock source view if active
    const lockOverlay = document.getElementById('source-lock-overlay');
    if (!document.getElementById('browser-view').classList.contains('hidden-section')) {
        lockOverlay.classList.remove('hidden-section');
    }

    // Get Minutes and Seconds inputs
    const mins = parseInt(document.getElementById('input-minutes').value) || 0;
    const secs = parseInt(document.getElementById('input-seconds').value) || 0;
    
    // Ensure at least 1 second
    focusTotalSeconds = (mins * 60) + secs;
    if (focusTotalSeconds === 0) {
        focusTotalSeconds = 25 * 60; // Default fallback
        document.getElementById('input-minutes').value = 25;
    }
    
    focusRemainingSeconds = focusTotalSeconds;

    document.getElementById('btn-start').classList.remove('hidden-section');
    document.getElementById('btn-pause').classList.add('hidden-section');
    document.getElementById('btn-start').innerHTML = `<i class="ph ph-play-circle text-2xl"></i> START FOCUS`;
    
    document.getElementById('timer-status').textContent = "READY";
    document.getElementById('timer-status').className = "text-slate-500 dark:text-slate-400 mt-2 uppercase text-[10px] tracking-[0.2em] font-extrabold bg-slate-100 dark:bg-slate-900/50 px-3 py-1 rounded-full";
    
    document.getElementById('timer-progress').classList.remove('text-accent-500');
    document.getElementById('timer-progress').classList.add('text-primary-500', 'dark:text-primary-600');
    
    // Enable Inputs
    document.getElementById('input-minutes').disabled = false;
    document.getElementById('input-seconds').disabled = false;
    
    updateFocusDisplay();
}

function completeSession() {
    clearInterval(mainInterval);
    appState = 'IDLE'; 
    
    // Re-lock source view
    const lockOverlay = document.getElementById('source-lock-overlay');
    if (!document.getElementById('browser-view').classList.contains('hidden-section')) {
        lockOverlay.classList.remove('hidden-section');
    }
    
    document.getElementById('timer-status').textContent = "COMPLETE";
    
    const email = getCurrentUser();
    const db = getDB();
    const today = getLocalISODate();
    const focusedMins = Math.floor(focusTotalSeconds / 60);

    if (!db.analytics[email]) db.analytics[email] = {};
    if (!db.analytics[email][today] || typeof db.analytics[email][today] === 'number') {
        db.analytics[email][today] = { focus: 0, breaks: [] };
    }

    db.analytics[email][today].focus += focusedMins;
    saveDB(db);

    alert("Focus Session Complete! Great work.");
    
    loadAnalytics();
    resetTimer();
}

function recordBreakData(minutes) {
    const email = getCurrentUser();
    const db = getDB();
    const today = getLocalISODate();
    
    if (!db.analytics[email]) db.analytics[email] = {};
    if (!db.analytics[email][today] || typeof db.analytics[email][today] === 'number') {
        db.analytics[email][today] = { focus: 0, breaks: [] };
    }
    
    db.analytics[email][today].breaks.push(minutes);
    saveDB(db);
    loadAnalytics(); 
}

// --- STRICT VISIBILITY HANDLER ---
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        isAuthorizedExit = false;
        hideSafeModeToast();
        return;
    }

    if (document.hidden) {
        if (isAuthorizedExit) {
            return;
        }

        if (appState === 'FOCUSING') {
            clearInterval(mainInterval);
            appState = 'IDLE';
            
            resetTimer(); 
            
            document.getElementById('timer-status').textContent = "FAILED";
            document.getElementById('tab-warning-modal').classList.remove('hidden-section');
        }
    }
});

function dismissWarning() {
    document.getElementById('tab-warning-modal').classList.add('hidden-section');
}

// --- ANALYTICS VISUALIZATION ---
function loadAnalytics() {
    const email = getCurrentUser();
    const db = getDB();
    const userAnalytics = db.analytics[email] || {};

    // 1. Today
    const today = getLocalISODate();
    let todayData = userAnalytics[today];
    let todayFocus = 0;
    if (todayData && todayData.focus) todayFocus = todayData.focus;
    else if (typeof todayData === 'number') todayFocus = todayData;
    
    document.getElementById('today-total').textContent = todayFocus;

    // 2. Chart
    const chartContainer = document.getElementById('chart-container');
    chartContainer.innerHTML = '';
    
    let maxVal = 1;
    const daysData = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = getLocalISODate(d);
        const rawVal = userAnalytics[dateStr];
        
        let val = 0;
        let breaksArr = [];
        
        if (rawVal) {
            val = rawVal.focus || (typeof rawVal === 'number' ? rawVal : 0);
            breaksArr = rawVal.breaks || [];
        }
        
        if (val > maxVal) maxVal = val;
        
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        daysData.push({ label: dayLabel, val: val, breaks: breaksArr });
    }

    daysData.forEach(item => {
        const heightPct = (item.val / maxVal) * 100;
        const barWrapper = document.createElement('div');
        barWrapper.className = "flex flex-col items-center flex-1 h-full justify-end group cursor-default";
        
        const breakAvg = item.breaks.length > 0 
            ? Math.round(item.breaks.reduce((a,b)=>a+b,0)/item.breaks.length) 
            : 0;

        const tooltip = `
            <div class="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-800 dark:bg-slate-900 text-white text-[10px] w-28 text-center p-2 rounded border border-slate-200 dark:border-slate-700 transition z-10 pointer-events-none shadow-xl -ml-10">
                <div class="text-slate-900 dark:text-white font-bold">${item.label}</div>
                <div class="text-primary-500 dark:text-primary-400 font-bold">${item.val} min focus</div>
                <div class="text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 mt-1 pt-1">
                     Avg Break: ${breakAvg}m
                </div>
            </div>
        `;

        const bar = document.createElement('div');
        const bgClass = item.val > 0 ? "bg-primary-600 hover:bg-primary-500" : "bg-slate-200 dark:bg-slate-700/30";
        
        bar.className = `w-full max-w-[32px] rounded-t-sm transition-all bar-fill relative ${bgClass}`;
        bar.style.height = `${Math.max(heightPct, 5)}%`; 
        bar.innerHTML = tooltip;

        const label = document.createElement('div');
        label.className = "text-slate-500 dark:text-slate-500 text-xs mt-2 text-center font-bold";
        label.textContent = item.label;

        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        chartContainer.appendChild(barWrapper);
    });
    
    // 3. Stats
    let totalBreaks = 0;
    let breakCount = 0;
    Object.values(userAnalytics).forEach(entry => {
        if (typeof entry !== 'number' && entry.breaks && entry.breaks.length > 0) {
            totalBreaks += entry.breaks.reduce((a, b) => a + b, 0);
            breakCount += entry.breaks.length;
        }
    });

    // Streak
    let currentStreak = 0;
    for(let i=0; i<365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const k = getLocalISODate(d);
        const hasData = userAnalytics[k] && (userAnalytics[k].focus > 0 || typeof userAnalytics[k] === 'number');
        
        if (i === 0 && !hasData) continue; 
        if (hasData) currentStreak++;
        else break;
    }
    
    document.getElementById('stat-streak').textContent = currentStreak + " Days";
    const avgBreak = breakCount > 0 ? Math.round(totalBreaks / breakCount) : 0;
    document.getElementById('stat-avg-break').textContent = avgBreak + "m";
}

if (getCurrentUser()) {
    initApp();
}
