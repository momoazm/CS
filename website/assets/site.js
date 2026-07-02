/* ============================================================
   MOMO — shared page script
   Toast, card stagger, and the Gumball mascot (the site's only
   character — placed deliberately via data-mascot attributes).
   ============================================================ */

(function(){
  'use strict';

  // ---------- toast ----------
  let toastT;
  window.toast = function(msg){
    let el = document.getElementById('toast');
    if (!el){ el = document.createElement('div'); el.id='toast'; el.className='toast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2800);
  };

  // ---------- card entrance stagger ----------
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('main .card').forEach((el,i) => { el.style.animationDelay = Math.min(i*60, 360)+'ms'; });
  });

  // ---------- Gumball — the only mascot ----------
  // Poses share one head; only eyes/mouth/arms change.
  function gumballHead(eyes, mouth, extra){
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18 20 L12 5 L27 15 Z" fill="#4FA3DC"/><path d="M46 20 L52 5 L37 15 Z" fill="#4FA3DC"/>
      <path d="M20 18 L14 9 L26 16 Z" fill="#7CC0E8"/><path d="M44 18 L50 9 L38 16 Z" fill="#7CC0E8"/>
      <ellipse cx="32" cy="34" rx="22" ry="20" fill="#4FA3DC"/><ellipse cx="32" cy="38" rx="17" ry="14" fill="#5FB0E0"/>
      ${eyes}${mouth}
      <path d="M8 33 H20 M8 39 H20" stroke="#3f86bb" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M56 33 H44 M56 39 H44" stroke="#3f86bb" stroke-width="1.8" stroke-linecap="round"/>${extra||''}</svg>`;
  }
  const EYES_OPEN = `<g class="gc-eyes"><ellipse cx="25" cy="30" rx="8" ry="10" fill="#fff"/><ellipse cx="39" cy="30" rx="8" ry="10" fill="#fff"/>
    <circle cx="27" cy="33" r="3" fill="#15202b"/><circle cx="37" cy="33" r="3" fill="#15202b"/>
    <circle cx="25.6" cy="31" r="1" fill="#fff"/><circle cx="35.6" cy="31" r="1" fill="#fff"/></g>`;
  const EYES_UP = `<g class="gc-eyes"><ellipse cx="25" cy="30" rx="8" ry="10" fill="#fff"/><ellipse cx="39" cy="30" rx="8" ry="10" fill="#fff"/>
    <circle cx="26" cy="26.5" r="3" fill="#15202b"/><circle cx="38" cy="26.5" r="3" fill="#15202b"/>
    <circle cx="24.8" cy="25" r="1" fill="#fff"/><circle cx="36.8" cy="25" r="1" fill="#fff"/></g>`;
  const EYES_WINK = `<g class="gc-eyes"><ellipse cx="25" cy="30" rx="8" ry="10" fill="#fff"/>
    <circle cx="27" cy="33" r="3" fill="#15202b"/><circle cx="25.6" cy="31" r="1" fill="#fff"/>
    <path d="M33 30 Q39 26 45 30" stroke="#15202b" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;
  const EYES_HAPPY = `<g class="gc-eyes"><path d="M19 30 Q25 24 31 30" stroke="#15202b" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M33 30 Q39 24 45 30" stroke="#15202b" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;
  const M_SMILE = `<path d="M26 42 Q32 48 38 42" stroke="#15202b" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  const M_GRIN  = `<path d="M24 41 Q32 51 40 41 Z" fill="#15202b"/><path d="M27 44 Q32 47.5 37 44" fill="#fff"/>`;
  const M_OH    = `<ellipse cx="32" cy="44" rx="3.6" ry="4.6" fill="#15202b"/>`;

  const POSES = {
    peek : () => gumballHead(EYES_OPEN, M_SMILE),
    wink : () => gumballHead(EYES_WINK, M_SMILE),
    think: () => gumballHead(EYES_UP, M_OH),
    cheer: () => gumballHead(EYES_HAPPY, M_GRIN,
      `<g class="gc-arms"><path d="M11 30 Q4 20 8 12" stroke="#4FA3DC" stroke-width="5" fill="none" stroke-linecap="round"/>
       <path d="M53 30 Q60 20 56 12" stroke="#4FA3DC" stroke-width="5" fill="none" stroke-linecap="round"/></g>`),
  };
  window.gumballSVG = pose => (POSES[pose] || POSES.peek)();

  // Attach Gumball to any element carrying data-mascot="pose corner" (e.g. "wink tr").
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-mascot]').forEach((el,i) => {
      const [pose, corner] = (el.getAttribute('data-mascot') || 'peek tr').split(/\s+/);
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      const wrap = document.createElement('div');
      wrap.className = 'gcomp ' + (corner || 'tr');
      wrap.setAttribute('aria-hidden','true');
      wrap.style.animationDelay = (i * 0.5).toFixed(1) + 's';
      wrap.innerHTML = window.gumballSVG(pose);
      el.appendChild(wrap);
    });
  });

  // Fixed-position cheering Gumball (used when a pomodoro / paper finishes).
  window.gumballCheer = function(){
    let el = document.getElementById('gcheer');
    if (!el){ el = document.createElement('div'); el.id='gcheer'; el.className='gcheer'; document.body.appendChild(el); }
    el.innerHTML = window.gumballSVG('cheer');
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  };

  // ---------- study snapshot (read by the home page) ----------
  window.momoStudySnapshot = function(){
    const get = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(_){ return null; } };
    const out = { syllabusPct:0, cardsDue:0, streak:0, papers:0 };
    const syl = get('momo.study.syllabus.v1');
    if (syl && syl.marks){
      const vals = Object.values(syl.marks); const total = syl.total || vals.length;
      if (total) out.syllabusPct = Math.round(vals.reduce((a,b)=>a+(b||0),0) / (total*3) * 100);
    }
    const decks = get('momo.study.decks.v1');
    if (decks && decks.decks){
      const now = Date.now();
      out.cardsDue = decks.decks.reduce((n,d)=> n + d.cards.filter(c => !c.due || c.due <= now).length, 0);
    }
    const pomo = get('momo.study.pomo.v1');
    if (pomo) out.streak = pomo.streak || 0;
    const papers = get('momo.study.papers.v1');
    if (papers && papers.log) out.papers = papers.log.length;
    return out;
  };
})();
