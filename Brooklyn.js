'use strict';

const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const auth      = require('./auth');
const widgets   = require('./widgets');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/Media',   express.static(path.join(__dirname, 'Media')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/Game',    express.static(path.join(__dirname, 'Game')));

auth.setup(app);

// Register /api/weather and /calendar routes
// (called after getCalendarHTML is defined below)

const poemHTML = (title, content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;1,400&display=swap" rel="stylesheet"/>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#111214;color:#fff;font-family:'Crimson Text',Georgia,serif;font-size:14px;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:3rem 1.5rem}
    .wrap{max-width:680px;width:100%}
    .wrap p{line-height:1.9;white-space:pre-wrap}
    .back{display:inline-block;margin-bottom:2.5rem;color:rgba(255,255,255,0.4);font-size:13px;text-decoration:none;letter-spacing:0.06em;transition:color 0.2s}
    .back:hover{color:rgba(255,255,255,0.8)}
  </style>
</head>
<body>
  <div class="wrap">
    <a class="back" href="/">&#8592; Back</a>
    <p>${content}</p>
  </div>
</body>
</html>`;

const poem1 = `Brooklyn, the root of my infectious love,
Brooklyn, straining my heart under heavy love.
I long to hold you in close comforts, like roses in vases, and shoes with laces.
Beautiful Brooklyn, fan out the flames of my love;
Your benevolence drifts naturally with the seas; I love the way your calming laughter flutters upon the breeze.
You were unfairly detested and scorned upon,
but you seem to be defined not by despair, but by your great care.
Your masses of beauty bring out the best in me; ever still, you confuse me till I count my misfortune.
Your rapid choices and wild turns leave me lost in wonder; till when will I witness your first-hand love,
in all my commitments to reforming a stable life together?`;

app.get('/Poem/1.js', (req, res) => res.send(poemHTML('Poem 1', poem1)));
app.get('/Poem/2.js', (req, res) => res.send(poemHTML('Poem 2', 'Coming soon.')));
app.get('/Poem/3.js', (req, res) => res.send(poemHTML('Poem 3', 'Coming soon.')));

// Weather API proxy — forwards to Open-Meteo (no key needed)
app.get('/api/weather', async (req, res) => {
  try {
    // Reading, England coords
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=51.4543&longitude=-0.9781' +
      '&current=temperature_2m,weathercode,windspeed_10m,precipitation,uv_index,apparent_temperature' +
      '&hourly=precipitation_probability&timezone=Europe%2FLondon&forecast_days=1&temperature_unit=celsius';
    const r = await fetch(url);
    const d = await r.json();
    res.json(d);
  } catch (e) {
    res.status(500).json({ error: 'Weather fetch failed' });
  }
});

app.get('/', (req, res) => res.send(getIndexHTML()));

['uploads', 'Media', 'Game/DVD'].forEach(dir => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Register widget routes — must be after getCalendarHTML() and getIndexHTML() are defined
widgets.setup(app, getCalendarHTML());

app.listen(PORT, () => console.log(`Brooklyn running on :${PORT}`));

function getIndexHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Brooklyn</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #111214;
      --surface:   #1a1c1f;
      --surface2:  #22252a;
      --border:    #2e3138;
      --accent:    #1b3a6b;
      --accent-lit:#2a5299;
      --text:      #e8e4df;
      --muted:     #7a7a85;
      --btn-bg:    rgba(255,255,255,0.08);
      --btn-hover: rgba(255,255,255,0.14);
    }

    html, body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Crimson Text', Georgia, serif;
      min-height: 100vh;
    }

    /* ── LOCK OVERLAY ── */
    #lock-overlay {
      position: fixed; inset: 0; z-index: 999;
      background: var(--bg);
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 1.5rem;
    }
    #lock-overlay h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-style: italic;
      letter-spacing: 0.04em;
    }
    #lock-overlay p { color: var(--muted); font-size: 1.05rem; }
    #passcode-form { display: flex; gap: 0.6rem; }
    #passcode-input {
      background: var(--surface2);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.65rem 1rem;
      font-size: 1rem;
      font-family: inherit;
      border-radius: 4px;
      letter-spacing: 0.2em;
      outline: none;
      width: 160px;
      transition: border-color 0.2s;
    }
    #passcode-input:focus { border-color: var(--accent-lit); }
    #passcode-input.shake {
      animation: shake 0.35s ease;
      border-color: #a03030;
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
    #passcode-submit {
      background: var(--accent);
      border: none; color: #fff;
      padding: 0.65rem 1.4rem;
      font-family: 'Crimson Text', serif;
      font-size: 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    #passcode-submit:hover { background: var(--accent-lit); }
    #lock-error { color: #c0392b; font-size: 0.9rem; min-height: 1.2rem; }

    #main { display: none; }

    /* ── BANNER ── */
    #banner-wrap {
      position: relative;
      width: 100%;
      max-height: 340px;
      overflow: hidden;
    }
    #banner-wrap img {
      width: 100%;
      height: 340px;
      object-fit: cover;
      display: block;
    }
    #banner-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 60%, rgba(17,18,20,0.7) 100%);
      pointer-events: none;
    }
    #banner-title {
      position: absolute;
      top: 50%;
      left: 2rem;
      transform: translateY(-50%);
      z-index: 2;
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: clamp(2.8rem, 6vw, 5rem);
      color: #fff;
      text-shadow: 0 2px 18px rgba(0,0,0,0.7);
      letter-spacing: 0.02em;
      pointer-events: none;
    }
    #notes-btn {
      position: absolute;
      top: 1.2rem;
      right: 1.4rem;
      z-index: 3;
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 0.55rem 1.1rem;
      font-family: 'Crimson Text', serif;
      font-size: 1rem;
      border-radius: 5px;
      cursor: pointer;
      letter-spacing: 0.04em;
      transition: background 0.2s, transform 0.15s;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    }
    #notes-btn:hover { background: var(--accent-lit); transform: translateY(-1px); }

    /* ── CONTENT ROW: poems left, widgets right ── */
    #content-row {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      padding: 2.2rem 2rem 1rem;
    }

    #poem-buttons {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
      flex: 1;
    }
    .poem-btn {
      background: var(--btn-bg);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 0.6rem 1.8rem;
      font-family: 'Crimson Text', serif;
      font-size: 1.05rem;
      border-radius: 4px;
      cursor: pointer;
      letter-spacing: 0.06em;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
    }
    .poem-btn:hover {
      background: var(--btn-hover);
      border-color: #4a4f5a;
      transform: translateX(3px);
    }

    /* ── MEDIA GRID ── */
    #media-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.2rem;
      padding: 1.4rem 2rem 3rem;
    }
    .media-card {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--surface);
      cursor: pointer;
      transition: transform 0.2s ease, border-color 0.2s;
    }
    .media-card:hover {
      transform: scale(1.05);
      border-color: var(--accent-lit);
    }
    .media-card-thumb {
      width: 100%;
      aspect-ratio: 16/10;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
      position: relative;
      overflow: hidden;
    }
    .media-card-name {
      padding: 0.6rem 0.8rem;
      font-family: 'Crimson Text', serif;
      font-size: 1rem;
      color: var(--text);
      letter-spacing: 0.04em;
      background: var(--surface2);
      border-top: 1px solid var(--border);
    }
    .media-play-btn {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
      background: rgba(0,0,0,0.45);
      z-index: 2;
    }
    .media-card:hover .media-play-btn,
    .media-card:focus .media-play-btn {
      opacity: 1;
    }
    .media-play-btn svg {
      width: 48px;
      height: 48px;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.7));
    }
    .dvd-thumb-text {
      font-family: 'Courier New', monospace;
      font-size: clamp(1rem, 2.5vw, 1.6rem);
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.12em;
      text-shadow: 0 0 18px rgba(255,255,255,0.4), 0 0 4px rgba(255,255,255,0.9);
      user-select: none;
    }

    /* ── NOTES PANEL ── */
    #notes-panel {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      align-items: flex-start;
      justify-content: flex-end;
    }
    #notes-panel.open { display: flex; }
    #notes-drawer {
      background: var(--surface);
      border-left: 1px solid var(--border);
      width: min(480px, 100vw);
      height: 100vh;
      overflow-y: auto;
      padding: 2rem 1.6rem;
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
      animation: slideIn 0.25s ease;
    }
    @keyframes slideIn {
      from { transform: translateX(40px); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    #notes-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #notes-header h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      font-weight: 400;
    }
    #notes-close {
      background: none; border: none;
      color: var(--muted); font-size: 1.5rem;
      cursor: pointer; line-height: 1;
      transition: color 0.15s;
    }
    #notes-close:hover { color: var(--text); }
    #note-form {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    #note-form input[type="text"],
    #note-form textarea {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: 'Crimson Text', serif;
      font-size: 1rem;
      padding: 0.55rem 0.8rem;
      border-radius: 4px;
      outline: none;
      transition: border-color 0.2s;
      resize: vertical;
    }
    #note-form input[type="text"]:focus,
    #note-form textarea:focus { border-color: var(--accent-lit); }
    #note-title-wrap { position: relative; }
    #note-title { width: 100%; }
    #title-counter {
      position: absolute;
      right: 0.6rem; bottom: 0.45rem;
      font-size: 0.75rem;
      color: var(--muted);
      pointer-events: none;
    }
    #note-body { width: 100%; min-height: 100px; }
    .upload-placeholder {
      border: 2px dashed var(--border);
      border-radius: 6px;
      padding: 1.2rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.95rem;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;
      position: relative;
    }
    .upload-placeholder:hover { border-color: var(--accent-lit); color: var(--text); }
    .upload-placeholder input {
      position: absolute; inset: 0;
      opacity: 0; cursor: pointer; width: 100%; height: 100%;
    }
    .upload-placeholder span { pointer-events: none; }
    #upload-name { font-size: 0.82rem; color: var(--accent-lit); margin-top: 0.3rem; }
    #note-submit {
      background: var(--accent);
      border: none; color: #fff;
      padding: 0.65rem;
      font-family: 'Crimson Text', serif;
      font-size: 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    #note-submit:hover { background: var(--accent-lit); }
    #notes-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .note-card {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 1rem 1.1rem;
    }
    .note-card h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.05rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
    }
    .note-card p {
      font-size: 0.97rem;
      color: var(--muted);
      line-height: 1.55;
    }
    .note-card .note-date {
      font-size: 0.78rem;
      color: var(--border);
      margin-top: 0.5rem;
    }
    .note-card img {
      margin-top: 0.7rem;
      max-width: 100%;
      border-radius: 4px;
      border: 1px solid var(--border);
    }
    #notes-empty { color: var(--muted); font-size: 0.97rem; text-align: center; padding: 1rem 0; }
  </style>
</head>
<body>

<div id="lock-overlay">
  <h1>Brooklyn</h1>
  <p>Enter passcode to continue</p>
  <div id="passcode-form">
    <input id="passcode-input" type="password" placeholder="••••••" autocomplete="off" maxlength="10" />
    <button id="passcode-submit">Enter</button>
  </div>
  <div id="lock-error"></div>
</div>

<div id="main">
  <div id="banner-wrap">
    <img src="/Media/Banner.png" alt="Banner" />
    <div id="banner-title">Brooklyn</div>
    <button id="notes-btn" onclick="notesPanel.classList.add('open'); loadNotes();">Notes</button>
  </div>

  <!-- CONTENT ROW: poems left, widgets right -->
  <div id="content-row">
    <div id="poem-buttons">
      <button class="poem-btn" onclick="location.href='/Poem/1.js'">Poem 1</button>
      <button class="poem-btn" onclick="location.href='/Poem/2.js'">Poem 2</button>
      <button class="poem-btn" onclick="location.href='/Poem/3.js'">Poem 3</button>
    </div>
    \${widgets.html()}
  </div><!-- /content-row -->

  <div id="media-grid">
    <div class="media-card" onclick="location.href='/Game/DVD/index.html'">
      <div class="media-card-thumb">
        <span class="dvd-thumb-text">Brooklyn</span>
        <div class="media-play-btn">
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="28" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
            <polygon points="23,18 46,30 23,42" fill="white"/>
          </svg>
        </div>
      </div>
      <div class="media-card-name">DVD</div>
    </div>
  </div>
</div>

<!-- NOTES PANEL -->
<div id="notes-panel">
  <div id="notes-drawer">
    <div id="notes-header">
      <h2>Notes</h2>
      <button id="notes-close" onclick="notesPanel.classList.remove('open')">&times;</button>
    </div>
    <div id="note-form">
      <div id="note-title-wrap">
        <input id="note-title" type="text" placeholder="Title" maxlength="50" />
        <span id="title-counter">0 / 50</span>
      </div>
      <textarea id="note-body" placeholder="Write something…"></textarea>
      <div class="upload-placeholder">
        <span>Attach an image</span>
        <input id="note-image" type="file" accept="image/*" />
      </div>
      <div id="upload-name"></div>
      <button id="note-submit">Save note</button>
    </div>
    <div id="notes-list">
      <div id="notes-empty">No notes yet.</div>
    </div>
  </div>
</div>

<script>
  /* ── AUTH ── */
  const lockOverlay    = document.getElementById('lock-overlay');
  const main           = document.getElementById('main');
  const passcodeInput  = document.getElementById('passcode-input');
  const passcodeSubmit = document.getElementById('passcode-submit');
  const lockError      = document.getElementById('lock-error');
  const notesPanel     = document.getElementById('notes-panel');
  const noteTitle      = document.getElementById('note-title');
  const titleCounter   = document.getElementById('title-counter');
  const noteBody       = document.getElementById('note-body');
  const noteImage      = document.getElementById('note-image');
  const uploadName     = document.getElementById('upload-name');
  const noteSubmit     = document.getElementById('note-submit');
  const notesList      = document.getElementById('notes-list');
  const notesEmpty     = document.getElementById('notes-empty');

  (async function checkSession() {
    try {
      const res  = await fetch('/auth/check');
      const data = await res.json();
      if (data.authenticated) unlock();
    } catch {}
  })();

  function unlock() {
    lockOverlay.style.display = 'none';
    main.style.display = 'block';
    initWidgets();
  }

  async function tryLogin() {
    lockError.textContent = '';
    const res  = await fetch('/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ passcode: passcodeInput.value })
    });
    const data = await res.json();
    if (data.success) {
      unlock();
    } else {
      lockError.textContent = 'Incorrect passcode.';
      passcodeInput.classList.add('shake');
      passcodeInput.value = '';
      setTimeout(() => passcodeInput.classList.remove('shake'), 400);
    }
  }

  passcodeSubmit.addEventListener('click', tryLogin);
  passcodeInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });

  /* ── NOTES ── */
  noteTitle.addEventListener('input', () => {
    titleCounter.textContent = noteTitle.value.length + ' / 50';
  });
  noteImage.addEventListener('change', () => {
    uploadName.textContent = noteImage.files[0] ? noteImage.files[0].name : '';
  });
  notesPanel.addEventListener('click', e => {
    if (e.target === notesPanel) notesPanel.classList.remove('open');
  });

  async function loadNotes() {
    try {
      const res   = await fetch('/api/notes');
      const notes = await res.json();
      renderNotes(notes);
    } catch {}
  }

  function renderNotes(notes) {
    notesList.innerHTML = '';
    if (!notes.length) {
      notesList.appendChild(notesEmpty);
      return;
    }
    notes.forEach(n => {
      const card = document.createElement('div');
      card.className = 'note-card';
      const date = new Date(n.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      card.innerHTML = \`
        <h3>\${escHtml(n.title)}</h3>
        <p>\${escHtml(n.body)}</p>
        \${n.image ? \`<img src="/uploads/\${n.image}" alt="attachment" />\` : ''}
        <div class="note-date">\${date}</div>
      \`;
      notesList.appendChild(card);
    });
  }

  noteSubmit.addEventListener('click', async () => {
    const title = noteTitle.value.trim();
    const body  = noteBody.value.trim();
    if (!title || !body) return;
    const fd = new FormData();
    fd.append('title', title);
    fd.append('body',  body);
    if (noteImage.files[0]) fd.append('image', noteImage.files[0]);
    try {
      await fetch('/api/notes', { method: 'POST', body: fd });
      noteTitle.value          = '';
      titleCounter.textContent = '0 / 50';
      noteBody.value           = '';
      noteImage.value          = '';
      uploadName.textContent   = '';
      loadNotes();
    } catch {}
  });

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* widgets logic lives in widgets.js — initWidgets() is exposed via window.initWidgets */
</script>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// Calendar page — served at GET /calendar
// Wraps Calendar.js React component in a full
// HTML shell that also syncs events back to the
// Brooklyn widget via localStorage.
// ─────────────────────────────────────────────
function getCalendarHTML() {
  const fs   = require('fs');
  const path = require('path');
  const calPath = path.join(__dirname, 'Calendar.js');
  let calSource = '';
  try { calSource = fs.readFileSync(calPath, 'utf8'); } catch {}

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Calendar — Brooklyn</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Crimson+Text:ital,wght@0,400;1,400&display=swap" rel="stylesheet"/>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#000;color:#fff;font-family:'Crimson Text',Georgia,serif;min-height:100vh}
    #cal-nav{
      display:flex;align-items:center;gap:1rem;
      padding:1rem 2rem;background:#111214;
      border-bottom:1px solid #2e3138;
    }
    #cal-nav a{
      color:rgba(255,255,255,0.45);font-size:0.9rem;
      text-decoration:none;letter-spacing:0.06em;
      transition:color 0.2s;
    }
    #cal-nav a:hover{color:#fff}
    #cal-root{min-height:calc(100vh - 56px)}
  </style>
</head>
<body>
<div id="cal-nav">
  <a href="/">&#8592; Back to Brooklyn</a>
</div>
<div id="cal-root"></div>

<!-- React + Babel for Calendar.js JSX -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<!-- lucide-react shim -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script>
  // Shim window.storage to localStorage so Calendar.js persistence works
  window.storage = {
    get: async (k) => {
      try {
        const v = localStorage.getItem('cal:' + k);
        return v ? { key: k, value: v } : null;
      } catch { return null; }
    },
    set: async (k, v) => {
      try {
        localStorage.setItem('cal:' + k, typeof v === 'string' ? v : JSON.stringify(v));
        // Sync events to Brooklyn widget key
        if (k === 'events') {
          localStorage.setItem('brooklyn-calendar-events', typeof v === 'string' ? v : JSON.stringify(v));
        }
        return { key: k, value: v };
      } catch { return null; }
    },
    delete: async (k) => {
      try { localStorage.removeItem('cal:' + k); return { key: k, deleted: true }; }
      catch { return null; }
    },
    list: async (prefix) => {
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith('cal:' + (prefix||'')))
        .map(k => k.replace(/^cal:/, ''));
      return { keys };
    }
  };

  // lucide-react shim so Calendar.js imports work
  window['lucide-react'] = {
    ChevronLeft:  () => React.createElement('span', null, '‹'),
    ChevronRight: () => React.createElement('span', null, '›'),
    Plus:         () => React.createElement('span', null, '+'),
    X:            () => React.createElement('span', null, '×'),
    Link:         () => React.createElement('span', null, '🔗'),
    Image:        () => React.createElement('span', null, '🖼'),
    Repeat:       () => React.createElement('span', null, '↺'),
    Bell:         () => React.createElement('span', null, '🔔'),
  };
</script>
<script type="text/babel" data-presets="react">
${calSource}

// Mount
const root = ReactDOM.createRoot(document.getElementById('cal-root'));
root.render(React.createElement(Calendar));
</script>
</body>
</html>`;
}
