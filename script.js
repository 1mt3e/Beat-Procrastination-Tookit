const store = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const autoExpand = el => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
const pm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lastDeletedSubject = null;
function showToast(msg, hasUndo) {
  const c = document.getElementById('toast-container'), t = document.createElement('div');
  t.className = 'toast' + (hasUndo ? ' has-undo' : '');
  t.innerHTML = `<i class="ti ti-circle-check"></i> ${msg} ${hasUndo ? `<button onclick="undoDeleteSubject()" style="background:none;border:none;color:var(--blue);font-weight:700;margin-left:0.5rem;cursor:pointer;text-decoration:underline;font-family:inherit;font-size:0.9rem;">Undo</button>` : ''}`;
  c.appendChild(t);
  const time = hasUndo ? 4500 : 2200;
  setTimeout(() => { t.classList.add('exiting'); setTimeout(() => t.remove(), 250); }, time);
}

function undoDeleteSubject() {
  if (lastDeletedSubject) {
    trackerState.subjects.splice(lastDeletedSubject.index, 0, lastDeletedSubject.data);
    lastDeletedSubject = null; renderTracker();
    const activeToast = document.querySelector('.toast.has-undo');
    if (activeToast) { activeToast.classList.add('exiting'); setTimeout(() => activeToast.remove(), 250); }
    showToast('Subject restored!');
    checkNotifications();
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next; store('bpt_theme', next);
}
(function initTheme() {
  const saved = load('bpt_theme');
  if (saved) document.documentElement.dataset.theme = saved;
})();

let currentTab = 0;
let tabTransitioning = false;
function switchTab(i) {
  if (tabTransitioning) return;
  const activePanel = document.querySelector('.panel.active');
  const targetPanel = document.getElementById(`panel-${i}`);
  if (activePanel === targetPanel) return;
  currentTab = i;
  
  const updateTabs = () => {
    document.querySelectorAll('.tab').forEach((t, idx) => t.classList.toggle('active', idx === i));
    if (activePanel) activePanel.classList.remove('active');
    targetPanel.classList.add('active');
    if (i === 0) renderPlanner();
    if (i === 1) renderTracker();
    if (i === 2) populateTimerTaskDropdown();
    if (i === 3) renderChallenge();
    if (i === 5) renderReflection();
    updateTimerDisplay();
    checkNotifications();
  };

  document.querySelectorAll('.tab').forEach((t, idx) => t.classList.toggle('active', idx === i));
  if (pm()) {
    if (activePanel) activePanel.classList.remove('active');
    showPanel(targetPanel, i, true); return;
  }
  tabTransitioning = true;
  if (activePanel) {
    activePanel.style.opacity = '0';
    activePanel.style.transform = 'translateY(-8px) scale(0.995)';
    activePanel.style.filter = 'blur(2px)';
    activePanel.style.transition = 'opacity 0.15s var(--ease-out-quart), transform 0.15s var(--ease-out-quart), filter 0.15s var(--ease-out-quart)';
    setTimeout(() => {
      activePanel.classList.remove('active'); activePanel.style.cssText = '';
      showPanel(targetPanel, i); tabTransitioning = false;
    }, 150);
  } else {
    showPanel(targetPanel, i); tabTransitioning = false;
  }
}
function showPanel(panel, i, instant) {
  panel.classList.add('active');
  if (i === 0) renderPlanner();
  if (i === 1) renderTracker();
  if (i === 2) populateTimerTaskDropdown();
  if (i === 3) renderChallenge();
  if (i === 5) renderReflection();
  if (instant) return;
  
  panel.style.opacity = '0'; 
  panel.style.transform = 'translateY(10px) scale(0.995)'; 
  panel.style.filter = 'blur(2px)'; 
  panel.style.transition = 'none';
  
  // Force reflow for reliable cross-browser transition
  void panel.offsetWidth;
  
  panel.style.transition = 'opacity 0.35s var(--ease-out), transform 0.35s var(--ease-out), filter 0.35s var(--ease-out)';
  panel.style.opacity = '1'; 
  panel.style.transform = 'translateY(0) scale(1)'; 
  panel.style.filter = 'blur(0)';
}

const days = ['Mon','Tue','Wed','Thu','Fri'], dayColors = ['#3B82F6','#16A34A','#D97706','#DC2626','#7C3AED'];
let plannerState = load('bpt_planner') || days.reduce((a,d) => ({...a,[d]:[]}), {});

function renderPlanner() {
  document.getElementById('planner-grid').innerHTML = days.map((day,i) => `
    <div class="day-column" style="animation-delay: ${i * 0.04}s">
      <div class="day-top-accent" style="background:${dayColors[i]}"></div>
      <div class="day-header" style="color:${dayColors[i]}">${day}</div>
      <div class="task-list">${plannerState[day].map((t,ti) => `
        <div class="task-row ${t.done?'done':''}" style="animation-delay: ${ti * 0.03}s">
          <input type="checkbox" class="task-checkbox" ${t.done?'checked':''} onchange="toggleTask('${day}',${ti},this.checked,this)">
          <textarea rows="1" oninput="updateTaskText('${day}',${ti},this.value)" placeholder="Add task...">${t.text}</textarea>
          <button class="btn-delete" onclick="deleteTask('${day}',${ti})" aria-label="Delete task"><i class="ti ti-x"></i></button>
        </div>`).join('')}
      </div>
      <button class="btn-add-task" onclick="addTask('${day}')">+ Add Task</button>
    </div>`).join('');
  document.querySelectorAll('.task-list textarea').forEach(ta => { autoExpand(ta); ta.addEventListener('input', () => autoExpand(ta)); });
}
function addTask(d) { plannerState[d].push({text:'',done:false}); renderPlanner(); }
function updateTaskText(d,i,v) { plannerState[d][i].text = v; }
function toggleTask(d,i,v,el) { plannerState[d][i].done = v; if (el) el.closest('.task-row')?.classList.toggle('done', v); checkNotifications(); }
function savePlanner() { store('bpt_planner', plannerState); showToast('Weekly Planner saved!'); }
function clearPlanner() { if(confirm('Reset all planner tasks?')){ plannerState=days.reduce((a,d)=>({...a,[d]:[]}),{}); store('bpt_planner',plannerState); renderPlanner(); showToast('Planner reset!'); }}

function deleteTask(day, i) {
  const colIndex = days.indexOf(day);
  const row = document.querySelectorAll('.day-column')[colIndex]?.querySelectorAll('.task-row')[i];
  if (row) {
    row.style.transform = 'translateX(16px)'; row.style.opacity = '0'; row.style.maxHeight = '0';
    row.style.padding = '0'; row.style.margin = '0'; row.style.transition = 'all 0.35s var(--ease-out-quart)';
    setTimeout(() => {
      plannerState[day].splice(i, 1); renderPlanner(); checkNotifications();
    }, 350);
  }
}

let trackerState = load('bpt_tracker') || {subjects:[], energy:3, mood:'🙂', streak:0, lastSavedDate:null};
if (!trackerState.subjects || trackerState.subjects.length === 0) trackerState.subjects = [{id: 'initial', sub:'', note:'', hrs:0}];
const energyLabels = ['Very low','Low','Moderate','High','Very high'], moods = ['😩','😐','🙂','😄','🔥'];

let historyState = load('bpt_history') || [];
let historyOpen = false;

function toggleHistoryCollapse() {
  historyOpen = !historyOpen;
  const content = document.getElementById('history-content');
  const chevron = document.getElementById('history-chevron');
  if (content) content.classList.toggle('open', historyOpen);
  if (chevron) chevron.classList.toggle('rotated', historyOpen);
  if (historyOpen) renderHistory();
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;
  
  // 1. Calculate & Render the Last 7 Days Visual Bar Chart
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toDateString();
    const shortLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
    const formattedDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    last7Days.push({ rawDate: dateKey, label: shortLabel, formattedDate: formattedDate, hrs: 0 });
  }
  
  last7Days.forEach(day => {
    const record = historyState.find(h => h.rawDate === day.rawDate);
    if (record) {
      day.hrs = record.subjects.reduce((sum, s) => sum + (parseFloat(s.hrs) || 0), 0);
    }
  });

  const maxHrs = Math.max(...last7Days.map(d => d.hrs), 4);
  const chartWrapper = document.getElementById('history-chart-wrapper');
  const chartBarContainer = document.getElementById('history-bar-chart');
  
  if (historyState.length > 0 && chartWrapper && chartBarContainer) {
    chartWrapper.style.display = 'block';
    chartBarContainer.innerHTML = last7Days.map(day => {
      const pct = (day.hrs / maxHrs) * 100;
      return `<div class="chart-bar-col">
        <div class="chart-bar-fill" style="height: ${pct}%">
          <div class="chart-bar-tooltip">${day.hrs.toFixed(1)} hrs (${day.formattedDate})</div>
        </div>
        <span class="chart-bar-label">${day.label}</span>
      </div>`;
    }).join('');
  } else if (chartWrapper) {
    chartWrapper.style.display = 'none';
  }

  // 2. Render List entries
  if (historyState.length === 0) {
    list.innerHTML = `<p style="text-align:center;color:var(--muted);font-size:0.9rem;padding:1rem 0;">No study history logged yet.</p>`;
    return;
  }
  list.innerHTML = [...historyState].reverse().map(h => {
    const hrs = h.subjects.reduce((s,r) => s+(parseFloat(r.hrs)||0),0);
    const subs = h.subjects.filter(s => s.sub.trim()).length;
    return `<div class="history-row">
      <div class="history-row-header">
        <span class="history-date">${h.date}</span>
        <div class="history-meta">
          <span>⏱️ ${hrs.toFixed(1)} hrs</span>
          <span>📚 ${subs} subjects</span>
          <span>🔥 ${h.streak} streak</span>
          <span>${h.mood} Mood</span>
          <span>⚡ ${h.energy}/5 Energy</span>
        </div>
      </div>
      <div class="history-subjects-list">
        ${h.subjects.filter(s => s.sub.trim()).map(s => `
          <div class="history-subject-item">
            <span><span class="history-subject-sub">${s.sub}</span><span class="history-subject-note">${s.note ? `(${s.note})` : ''}</span></span>
            <span class="history-subject-hrs">${s.hrs} hrs</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  }).join('');
}

function renderTracker() {
  trackerState.subjects = trackerState.subjects.map((s, idx) => s.id ? s : { ...s, id: 'sub-' + idx + '-' + Date.now() });
  document.getElementById('study-rows').innerHTML = trackerState.subjects.map((s,i) => `
    <div class="tracker-table-row" data-id="${s.id}" style="animation-delay: ${i * 0.04}s">
      <input type="text" placeholder="Subject" value="${s.sub}" oninput="updateTrackerSubById('${s.id}','sub',this.value)">
      <input type="text" placeholder="Notes" value="${s.note}" oninput="updateTrackerSubById('${s.id}','note',this.value)">
      <input type="number" step="0.5" min="0" placeholder="Hrs" value="${s.hrs||''}" oninput="updateTrackerSubById('${s.id}','hrs',parseFloat(this.value)||0)">
      <button class="btn-ghost" onclick="removeTrackerRowById('${s.id}')"><i class="ti ti-x"></i></button>
    </div>`).join('');
  document.getElementById('energy-dots').innerHTML = Array.from({length:5},(_,i) => `<div class="energy-dot ${i<trackerState.energy?'active':''}" onclick="setEnergy(${i+1})"></div>`).join('');
  document.getElementById('energy-label').textContent = energyLabels[trackerState.energy-1]||'Moderate';
  document.getElementById('mood-selectors').innerHTML = moods.map(m => `<button class="mood-btn ${trackerState.mood===m?'active':''}" onclick="setMood('${m}')">${m}</button>`).join('');
  updateTrackerStats();
}
function addStudyRow() {
  const newId = 'sub-' + Math.random().toString(36).substr(2, 9);
  trackerState.subjects.push({id: newId, sub:'', note:'', hrs:0}); renderTracker();
  setTimeout(() => {
    const lastRow = document.querySelector(`#study-rows .tracker-table-row[data-id="${newId}"]`);
    if (lastRow) { const inp = lastRow.querySelector('input'); if (inp) inp.focus(); }
  }, 50);
}
function removeTrackerRowById(id) {
  const row = document.querySelector(`#study-rows .tracker-table-row[data-id="${id}"]`);
  if (row) {
    row.style.transform = 'translateX(-16px)'; row.style.opacity = '0'; row.style.maxHeight = '0';
    row.style.padding = '0'; row.style.margin = '0'; row.style.transition = 'all 0.3s var(--ease-out)';
    setTimeout(() => {
      const idx = trackerState.subjects.findIndex(x => x.id === id);
      if (idx !== -1) {
        lastDeletedSubject = { index: idx, data: trackerState.subjects[idx] };
        trackerState.subjects.splice(idx, 1); renderTracker(); showToast('Subject deleted', true);
        checkNotifications();
      }
    }, 300);
  }
}
function updateTrackerSubById(id, k, v) {
  const s = trackerState.subjects.find(x => x.id === id); if (s) { s[k] = v; updateTrackerStats(); checkNotifications(); }
}
function animateCount(id, target) {
  const el = document.getElementById(id), start = parseFloat(el.textContent) || 0;
  if (start === target) return;
  if (pm()) { el.textContent = id === 'stat-hours' ? target.toFixed(1) : Math.round(target); return; }
  const duration = 350;
  let startTimestamp = null;
  requestAnimationFrame(function update(now) {
    if (!startTimestamp) startTimestamp = now;
    const elapsed = now - startTimestamp;
    const t = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    el.textContent = id === 'stat-hours' ? (start + ease * (target - start)).toFixed(1) : Math.round(start + ease * (target - start));
    if (t < 1) requestAnimationFrame(update);
  });
}
function setEnergy(v) { trackerState.energy=v; renderTracker(); }
function setMood(v) { trackerState.mood=v; renderTracker(); }
function updateTrackerStats() {
  const hrs = trackerState.subjects.reduce((s,r) => s+(parseFloat(r.hrs)||0),0);
  const subs = trackerState.subjects.filter(s => s.sub.trim()).length;
  animateCount('stat-hours', hrs); animateCount('stat-subjects', subs); animateCount('stat-streak', trackerState.streak);
}
function saveTracker() {
  const today = new Date().toDateString();
  if(trackerState.lastSavedDate !== today){ trackerState.streak++; trackerState.lastSavedDate=today; }
  
  const todayStr = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const existingIdx = historyState.findIndex(h => h.rawDate === today);
  const entry = {
    rawDate: today,
    date: todayStr,
    subjects: [...trackerState.subjects],
    energy: trackerState.energy,
    mood: trackerState.mood,
    streak: trackerState.streak
  };
  if (existingIdx !== -1) {
    historyState[existingIdx] = entry;
  } else {
    historyState.push(entry);
  }
  store('bpt_history', historyState);
  store('bpt_tracker', trackerState);
  
  renderTracker();
  if (historyOpen) renderHistory();
  showToast('Daily Tracker & History saved!');
  checkNotifications();
}

// ── Pomodoro Timer State ──
let isMuted = load('bpt_muted') || false;
let timerSettings = load('bpt_timer_settings') || { work: 25, break: 5 };
let WORK = timerSettings.work * 60;
let SHORT = timerSettings.break * 60;
const LONG = 900;

let timerInterval=null, timerRemaining=WORK, timerMode='work', isRunning=false, sessions=0;

function playChime() {
  if (isMuted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1); gain1.connect(ctx.destination);
    osc1.type = 'sine'; osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.3);
    
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
    gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc2.start(ctx.currentTime + 0.12); osc2.stop(ctx.currentTime + 0.45);
  } catch (e) {
    console.warn("AudioContext block by browser auto-play policy", e);
  }
}

function toggleMute() {
  isMuted = !isMuted;
  store('bpt_muted', isMuted);
  updateMuteButtonUI();
}

function updateMuteButtonUI() {
  const btn = document.getElementById('btn-timer-mute');
  if (btn) {
    btn.innerHTML = isMuted ? `<i class="ti ti-volume-3"></i>` : `<i class="ti ti-volume"></i>`;
    btn.className = `icon-btn ${isMuted ? 'muted' : ''}`;
    btn.setAttribute('aria-label', isMuted ? 'Unmute sound' : 'Mute sound');
  }
}

function applyCustomTimer() {
  const wInp = document.getElementById('custom-work-min');
  const bInp = document.getElementById('custom-break-min');
  if (wInp && bInp) {
    const wVal = Math.max(1, parseInt(wInp.value) || 25);
    const bVal = Math.max(1, parseInt(bInp.value) || 5);
    timerSettings.work = wVal;
    timerSettings.break = bVal;
    store('bpt_timer_settings', timerSettings);
    
    WORK = timerSettings.work * 60;
    SHORT = timerSettings.break * 60;
    
    if (!isRunning) {
      timerRemaining = timerMode === 'work' ? WORK : SHORT;
      updateTimerDisplay();
    }
  }
}

function populateTimerTaskDropdown() {
  const select = document.getElementById('timer-task-select');
  if (!select) return;
  
  // Collect unique non-completed tasks from Weekly Planner
  const plannerTasks = [];
  days.forEach(day => {
    if (plannerState[day]) {
      plannerState[day].forEach(t => {
        if (!t.done && t.text.trim()) {
          plannerTasks.push(t.text.trim());
        }
      });
    }
  });
  
  const uniqueTasks = Array.from(new Set(plannerTasks));
  
  let optionsHTML = `<option value="custom">[Custom Task...]</option>`;
  uniqueTasks.forEach(task => {
    optionsHTML += `<option value="${task}">${task}</option>`;
  });
  
  select.innerHTML = optionsHTML;
  handleTaskSelectChange();
}

function handleTaskSelectChange() {
  const select = document.getElementById('timer-task-select');
  const customInput = document.getElementById('timer-task');
  if (select && customInput) {
    const isCustom = select.value === 'custom';
    customInput.style.display = isCustom ? 'block' : 'none';
  }
}

function toggleTimer() {
  const btn = document.getElementById('btn-timer-toggle'), circle = document.getElementById('timer-circle');
  if(isRunning){
    clearInterval(timerInterval); isRunning=false; btn.innerHTML=`<i class="ti ti-player-play"></i> Start`; circle.classList.remove('running');
  } else {
    isRunning=true; btn.innerHTML=`<i class="ti ti-player-pause"></i> Pause`; circle.classList.add('running');
    timerInterval=setInterval(()=>{ if(timerRemaining>0){timerRemaining--;updateTimerDisplay();}else{handleTimerComplete();}},1000);
  }
  updateTimerDisplay();
}
function updateTimerDisplay() {
  const m=String(Math.floor(timerRemaining/60)).padStart(2,'0'), s=String(timerRemaining%60).padStart(2,'0'), timeStr = `${m}:${s}`;
  document.getElementById('timer-display').textContent=timeStr;
  const headerText = document.getElementById('header-timer-text');
  if (headerText) headerText.textContent = timeStr;
  document.getElementById('timer-circle').className=`pomodoro-circle ${timerMode!=='work'?'break-mode':''} ${isRunning?'running':''}`;
  document.getElementById('timer-label').textContent=timerMode==='work'?'Work Session':'Break Time';
  document.getElementById('session-dots').innerHTML=Array.from({length:4},(_,i)=>`<div class="session-dot ${i<sessions?'filled':''}"></div>`).join('');
  const total = timerMode === 'work' ? WORK : (timerMode === 'short' ? SHORT : LONG), pct = timerRemaining / total, progress = document.getElementById('timer-progress');
  if (progress) {
    progress.style.transition = isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s var(--ease-out)';
    progress.style.strokeDashoffset = 515.2 * (1 - pct);
  }
  const chip = document.getElementById('header-timer-chip');
  if (chip) {
    if (isRunning && currentTab !== 2) {
      chip.style.display = 'flex'; chip.className = `timer-chip ${timerMode !== 'work' ? 'break-mode' : ''}`;
    } else {
      chip.style.display = 'none';
    }
  }
  
  // Set custom inputs value if loaded
  const wInp = document.getElementById('custom-work-min');
  const bInp = document.getElementById('custom-break-min');
  if (wInp && bInp) {
    wInp.value = timerSettings.work;
    bInp.value = timerSettings.break;
  }
  updateMuteButtonUI();
}
function resetTimer() {
  clearInterval(timerInterval); isRunning=false; timerRemaining=timerMode==='work'?WORK:(timerMode==='short'?SHORT:LONG);
  document.getElementById('btn-timer-toggle').innerHTML=`<i class="ti ti-player-play"></i> Start`;
  document.getElementById('timer-circle').classList.remove('running'); updateTimerDisplay();
}
function setTimerPreset(mins,mode) {
  clearInterval(timerInterval); isRunning=false; timerMode=mode; timerRemaining=mins*60;
  document.getElementById('btn-timer-toggle').innerHTML=`<i class="ti ti-player-play"></i> Start`;
  document.getElementById('timer-circle').classList.remove('running'); updateTimerDisplay();
}
function handleTimerComplete() {
  clearInterval(timerInterval); isRunning=false;
  document.getElementById('btn-timer-toggle').innerHTML=`<i class="ti ti-player-play"></i> Start`;
  document.getElementById('timer-circle').classList.remove('running');
  
  playChime();
  
  if(timerMode==='work'){
    sessions++;
    
    // Read task name from dropdown selection (or custom text input)
    const select = document.getElementById('timer-task-select');
    const taskInput = document.getElementById('timer-task');
    let taskName = 'Focus Session';
    if (select) {
      if (select.value === 'custom') {
        if (taskInput && taskInput.value.trim()) taskName = taskInput.value.trim();
      } else {
        taskName = select.value;
      }
    }
    
    if (trackerState.subjects.length === 1 && trackerState.subjects[0].sub === '' && trackerState.subjects[0].hrs === 0) {
      trackerState.subjects[0] = { id: 'sub-' + Date.now(), sub: taskName, note: 'Pomodoro complete', hrs: 0.4 };
    } else {
      trackerState.subjects.push({ id: 'sub-' + Date.now(), sub: taskName, note: 'Pomodoro complete', hrs: 0.4 });
    }
    renderTracker();
    showToast(`Work session complete! Auto-logged 0.4 hrs to ${taskName} 🎉`);
    checkNotifications();
    
    if(sessions>=4){timerMode='long';timerRemaining=LONG;sessions=0;}else{timerMode='short';timerRemaining=SHORT;}
  }else{
    showToast('Break over! Ready to focus? 💪'); timerMode='work'; timerRemaining=WORK;
  }
  updateTimerDisplay();
}

const challengeData=[
  {id:1,emoji:'✍️',title:'Name your 3 habits',desc:"Write 3 procrastination habits you've been avoiding.",tip:"Awareness is the first step. You can't fix what you won't name."},
  {id:2,emoji:'⏱️',title:'Do one Pomodoro',desc:"Pick the task you've been avoiding. Set 25 min and go.",tip:"The hardest part is starting. After 5 minutes it's always easier."},
  {id:3,emoji:'📵',title:'Phone face-down',desc:"Turn off notifications. Phone down. Timer starts now.",tip:"Every notification breaks 20+ minutes of focus."},
  {id:4,emoji:'📅',title:'Plan your week',desc:"Fill in the Weekly Planner with all upcoming deadlines.",tip:"Unwritten plans are just wishes. Written plans are commitments."},
  {id:5,emoji:'🤖',title:'AI the right way',desc:"Use ChatGPT to brainstorm only — write the work yourself.",tip:"AI is a scaffold, not a crutch."},
  {id:6,emoji:'👥',title:'Study buddy 1hr',desc:"Invite a classmate to a session — online or in person.",tip:"Accountability multiplies output."},
  {id:7,emoji:'🪞',title:'Reflect on progress',desc:"Fill in the Reflection Journal tab. Be honest.",tip:"Growth without reflection is just repetition."}
];
let challengeState = load('bpt_challenge') || [];

function renderChallenge() {
  document.getElementById('challenge-grid').innerHTML = challengeData.map((d,i) => {
    const done=challengeState.includes(d.id), locked=i>0&&!challengeState.includes(challengeData[i-1].id);
    return `<div class="challenge-card ${done?'completed':''} ${locked?'locked':''}" style="animation-delay: ${i * 0.03}s" onclick="selectChallengeDay(${d.id})">
      <span class="challenge-day">Day ${d.id}</span><span class="challenge-emoji">${d.emoji}</span>
      <span class="challenge-status-icon">${done?'✓':(locked?'🔒':'')}</span></div>`;
  }).join('');
  const count=challengeState.length, pct=Math.round((count/7)*100);
  document.getElementById('challenge-progress-fill').style.width=pct+'%';
  document.getElementById('challenge-progress-desc').textContent=`${count} of 7 days completed`;
  document.getElementById('challenge-progress-percent').textContent=pct+'%';
}

let challengeTimeout = null;
function selectChallengeDay(id) {
  document.querySelectorAll('.challenge-card').forEach(c => c.classList.remove('selected'));
  const idx=challengeData.findIndex(d=>d.id===id); document.querySelectorAll('.challenge-card')[idx]?.classList.add('selected');
  const day=challengeData.find(d=>d.id===id), done=challengeState.includes(id), panel=document.getElementById('challenge-detail-panel');
  panel.classList.remove('open'); if (challengeTimeout) clearTimeout(challengeTimeout);
  challengeTimeout = setTimeout(() => {
    panel.innerHTML=`<h4>Day ${day.id}: ${day.title}</h4><p style="margin-bottom:0.75rem;color:var(--text-secondary)">${day.desc}</p>
      <div class="detail-tip"><span>💡</span><span>${day.tip}</span></div>
      ${!done?`<button class="btn btn-primary" onclick="completeChallengeDay(${day.id})" style="margin-top:1rem"><i class="ti ti-checkbox"></i> Mark as complete ✓</button>`:''}`;
    panel.classList.add('open');
  }, 150);
}
function completeChallengeDay(id) {
  if(!challengeState.includes(id)){ challengeState.push(id); store('bpt_challenge',challengeState); renderChallenge(); selectChallengeDay(id); showToast(`Day ${id} completed!`); checkNotifications(); }
}

const aiUse=["Brainstorm ideas and angles for your assignment","Explain concepts you don't understand yet","Break a big task into smaller steps","Create a study schedule and manage deadlines","Check grammar and paraphrase your own writing","Find keywords to search for real academic sources","Summarise long readings (then read it yourself)"];
const aiDont=["Write your full assignment and submit it as your own","Copy AI outputs word-for-word without understanding","Skip the thinking step because AI can do it","Use AI-generated citations (they are often fabricated)","Replace reading the actual source material","Bypass critical thinking and personal reflection","Use AI in exams or assessments that prohibit it"];

const tools = [
  { name: "ChatGPT", url: "https://chatgpt.com" },
  { name: "Gemini", url: "https://gemini.google.com" },
  { name: "Grammarly", url: "https://www.grammarly.com" },
  { name: "Explainpaper", url: "https://www.explainpaper.com" },
  { name: "Consensus", url: "https://consensus.app" },
  { name: "Elicit", url: "https://elicit.com" }
];

function initAI() {
  document.getElementById('ai-use-list').innerHTML=aiUse.map(t=>`<li><i class="ti ti-circle-check"></i>${t}</li>`).join('');
  document.getElementById('ai-dont-list').innerHTML=aiDont.map(t=>`<li><i class="ti ti-circle-x"></i>${t}</li>`).join('');
  document.getElementById('recommended-tools').innerHTML=tools.map(t=>`<a href="${t.url}" target="_blank" rel="noopener noreferrer" class="tool-chip">${t.name}</a>`).join('');
}

const questions=[{id:'q1',label:'⏳ What did I procrastinate on this week, and why?'},{id:'q2',label:'🤖 How did I use AI this week — was it helpful or a shortcut?'},{id:'q3',label:'🏆 What is one thing I\'m proud of this week?'},{id:'q4',label:'🎯 What will I do differently next week?'}];
let reflectState = load('bpt_reflect') || {q1:'',q2:'',q3:'',q4:''};

function renderReflection() {
  document.getElementById('reflection-blocks').innerHTML=questions.map((q,i)=>`
    <div class="reflection-block" style="animation-delay: ${i * 0.04}s"><label class="reflection-label">${q.label}</label>
    <textarea rows="2" oninput="updateReflection('${q.id}',this.value)" placeholder="Write your thoughts here...">${reflectState[q.id]}</textarea></div>`).join('');
  document.querySelectorAll('#reflection-blocks textarea').forEach(ta=>{autoExpand(ta);ta.addEventListener('input',()=>autoExpand(ta));});
}
function updateReflection(id,v) { reflectState[id]=v; }
function saveReflection() { store('bpt_reflect',reflectState); showToast('Reflection journal saved!'); }
function clearReflection() { if(confirm('Clear all reflection entries?')){ reflectState={q1:'',q2:'',q3:'',q4:''}; store('bpt_reflect',reflectState); renderReflection(); showToast('Reflection cleared!'); }}

document.addEventListener('pointerdown', e => {
  const btn = e.target.closest('.btn'); if (!btn) return;
  const rect = btn.getBoundingClientRect();
  btn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
  btn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
});

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) return;
    e.preventDefault(); toggleTimer();
  }
});

/* ── Header Actions Popovers ── */
let popoversState = { notifications: false, profile: false };
let profileState = load('bpt_profile') || { name: '', targetHours: 15 };

function toggleNotifications() {
  popoversState.notifications = !popoversState.notifications;
  popoversState.profile = false;
  updatePopoversUI();
  if (popoversState.notifications) {
    const badge = document.getElementById('notification-badge');
    if (badge) badge.style.display = 'none';
  }
}

function toggleProfile() {
  popoversState.profile = !popoversState.profile;
  popoversState.notifications = false;
  updatePopoversUI();
}

function updatePopoversUI() {
  document.getElementById('popover-notifications')?.classList.toggle('open', popoversState.notifications);
  document.getElementById('popover-profile')?.classList.toggle('open', popoversState.profile);
  if (popoversState.profile) renderProfile();
  if (popoversState.notifications) renderNotifications();
}

document.addEventListener('click', e => {
  if (!e.target.closest('.popover-wrapper')) {
    popoversState.notifications = false;
    popoversState.profile = false;
    updatePopoversUI();
  }
});

function renderProfile() {
  const nameInp = document.getElementById('profile-name-input');
  const targetInp = document.getElementById('profile-target-input');
  if (nameInp) nameInp.value = profileState.name;
  if (targetInp) targetInp.value = profileState.targetHours;

  const loggedHrs = trackerState.subjects.reduce((sum, s) => sum + (parseFloat(s.hrs) || 0), 0);
  const target = parseFloat(profileState.targetHours) || 15;
  const pct = Math.min(Math.round((loggedHrs / target) * 100), 100);

  const progressFill = document.getElementById('profile-progress-fill');
  const progressPct = document.getElementById('profile-progress-pct');
  const hoursDone = document.getElementById('profile-hours-done');

  if (progressFill) progressFill.style.width = pct + '%';
  if (progressPct) progressPct.textContent = pct + '%';
  if (hoursDone) hoursDone.textContent = `Logged: ${loggedHrs.toFixed(1)} hrs / ${target} hrs`;

  const badgesList = [];
  if (trackerState.streak >= 3) {
    badgesList.push({ emoji: '🔥', label: `${trackerState.streak}-Day Streak` });
  } else {
    badgesList.push({ emoji: '🔒', label: '3-Day Streak', locked: true });
  }
  if (loggedHrs >= target) {
    badgesList.push({ emoji: '👑', label: 'Goal Reached' });
  } else {
    badgesList.push({ emoji: '🔒', label: 'Goal Reached', locked: true });
  }
  const challengeCount = challengeState.length;
  if (challengeCount >= 7) {
    badgesList.push({ emoji: '🏆', label: '7-Day Champ' });
  } else {
    badgesList.push({ emoji: '🔒', label: `${challengeCount}/7 Days`, locked: true });
  }

  const badgesContainer = document.getElementById('profile-badges');
  if (badgesContainer) {
    badgesContainer.innerHTML = badgesList.map(b => `
      <span class="badge-item ${b.locked ? 'gray' : ''}" title="${b.locked ? 'Locked' : 'Unlocked'}">
        <span>${b.emoji}</span>
        <span>${b.label}</span>
      </span>
    `).join('');
  }
}

function saveProfileSettings() {
  const nameInp = document.getElementById('profile-name-input');
  const targetInp = document.getElementById('profile-target-input');
  if (nameInp && targetInp) {
    profileState.name = nameInp.value.trim();
    profileState.targetHours = Math.max(1, parseFloat(targetInp.value) || 15);
    store('bpt_profile', profileState);
    renderProfile();
    checkNotifications();
  }
}

let currentAlerts = [];
function checkNotifications() {
  const alerts = [];
  const hrs = trackerState.subjects.reduce((s,r) => s+(parseFloat(r.hrs)||0),0);
  if (hrs === 0) {
    alerts.push({ type: 'alert', icon: 'ti-book', text: 'Daily Tracker: You have not logged any study sessions today!' });
  } else {
    alerts.push({ type: 'success', icon: 'ti-circle-check', text: `Daily Tracker: Logged ${hrs.toFixed(1)} focus hours today.` });
  }

  const challengeCount = challengeState.length;
  if (challengeCount < 7) {
    alerts.push({ type: 'alert', icon: 'ti-trophy', text: `Challenge: Day ${challengeCount + 1} is unlocked. Check it out!` });
  } else {
    alerts.push({ type: 'success', icon: 'ti-award', text: '7-Day Challenge completed! You are a Procrastination Champ 🏆' });
  }

  const target = parseFloat(profileState.targetHours) || 15;
  if (hrs >= target) {
    alerts.push({ type: 'success', icon: 'ti-crown', text: 'Goal: Weekly target study hours completed!' });
  } else if (hrs > 0 && hrs < target * 0.5) {
    alerts.push({ type: 'warning', icon: 'ti-alert-triangle', text: `Goal: You are currently at ${Math.round((hrs/target)*100)}% of your weekly study goal.` });
  }

  currentAlerts = alerts;
  const badge = document.getElementById('notification-badge');
  if (badge && !popoversState.notifications) {
    const hasUnread = alerts.some(a => a.type === 'alert' || a.type === 'warning');
    badge.style.display = hasUnread ? 'block' : 'none';
  }
}

function renderNotifications() {
  const list = document.getElementById('notifications-list');
  if (!list) return;
  if (currentAlerts.length === 0) {
    list.innerHTML = `<div class="notification-empty">No active notifications.</div>`;
    return;
  }
  list.innerHTML = currentAlerts.map(a => `
    <div class="notification-item ${a.type}">
      <i class="ti ${a.icon}"></i>
      <span>${a.text}</span>
    </div>
  `).join('');
}

window.addEventListener('DOMContentLoaded', () => {
  renderPlanner();
  renderTracker();
  updateTimerDisplay();
  renderChallenge();
  initAI();
  renderReflection();
  renderHistory();
  checkNotifications();
});
