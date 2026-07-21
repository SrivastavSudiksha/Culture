function showFatalError() {
  document.querySelectorAll('.tabs, .tab-panel').forEach(el => el.style.display = 'none');
  const fatal = document.getElementById('fatalError');
  if (fatal) fatal.style.display = 'block';
}

if (typeof TT_DATA === 'undefined' || !TT_DATA || !Array.isArray(TT_DATA.entries)) {
  showFatalError();
  throw new Error('Culture: TT_DATA is missing or malformed — check that data.js loaded correctly.');
}

const ICONS = { L: '🧬', P: '🔬', T: '📝' };
const TYPE_LABELS = { L: 'Lecture', P: 'Practical', T: 'Tutorial' };
const ELECTIVE_LABELS = {
  DE2: 'Department Elective 2',
  DE3: 'Department Elective 3',
  SE1: 'Open Elective 1',
  minor: 'Minor courses'
};
const BIOTECH_BATCHES = (TT_DATA.batches || []).filter(b => b.startsWith('C'));

if (BIOTECH_BATCHES.length === 0 || !TT_DATA.days || TT_DATA.days.length === 0) {
  showFatalError();
  throw new Error('Culture: timetable data has no batches or days.');
}

// Parses a slot string like "9-10AM" or "12-1PM" into 24-hour decimal
// start/end hours, so the app can tell which class is happening right now.
function parseTimeSlot(str) {
  const m = /^(\d+)-(\d+)(AM|PM)$/i.exec((str || '').trim());
  if (!m) return null;
  const [, leftStr, rightStr, rightMeridiem] = m;
  const to24 = (hourStr, meridiem) => {
    let h = parseInt(hourStr, 10) % 12;
    if (meridiem.toUpperCase() === 'PM') h += 12;
    return h;
  };
  const end = to24(rightStr, rightMeridiem);
  // 11-12PM crosses from AM to noon; every other slot in a daytime
  // timetable shares the same meridiem as its end time.
  const leftMeridiem = (rightStr === '12' && rightMeridiem.toUpperCase() === 'PM') ? 'AM' : rightMeridiem;
  const start = to24(leftStr, leftMeridiem);
  return { start, end };
}

function currentSlotInfo() {
  const now = new Date();
  return { day: todaysTTDay(), hour: now.getHours() + now.getMinutes() / 60 };
}

const tabBtns = document.querySelectorAll('.tab-btn');
const panels = { schedule: document.getElementById('panel-schedule'), free: document.getElementById('panel-free') };
tabBtns.forEach(btn => btn.addEventListener('click', () => {
  tabBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  Object.values(panels).forEach(p => p.style.display = 'none');
  panels[btn.dataset.tab].style.display = 'block';
  if (btn.dataset.tab === 'free') renderFreeTable();
}));

const daySel = document.getElementById('day');
const batchSel = document.getElementById('batch');
const typeSel = document.getElementById('type');
const electiveOnly = document.getElementById('electiveOnly');
const schedule = document.getElementById('schedule');
const empty = document.getElementById('empty');
const electiveInfo = document.getElementById('electiveInfo');

TT_DATA.days.forEach(d => {
  const o = document.createElement('option');
  o.value = d; o.textContent = d;
  daySel.appendChild(o);
});

const JS_DAY_TO_TT_DAY = { 1: 'MON', 2: 'TUES', 3: 'WED', 4: 'THUR', 5: 'FRI', 6: 'SAT' };
function todaysTTDay() {
  const jsDay = new Date().getDay();
  const mapped = JS_DAY_TO_TT_DAY[jsDay];
  return (mapped && TT_DATA.days.includes(mapped)) ? mapped : TT_DATA.days[0];
}
const TODAY_TT_DAY = todaysTTDay();
[...daySel.options].forEach(o => { if (o.value === TODAY_TT_DAY) o.textContent += ' (Today)'; });
daySel.value = TODAY_TT_DAY;

const batchGroup = document.createElement('optgroup');
batchGroup.label = 'Batches';
BIOTECH_BATCHES.forEach(b => {
  const o = document.createElement('option');
  o.value = b; o.textContent = `Batch ${b}`;
  batchGroup.appendChild(o);
});
batchSel.appendChild(batchGroup);

if (TT_DATA.electives && TT_DATA.electives.length) {
  const elGroup = document.createElement('optgroup');
  elGroup.label = 'Electives & Minor';
  TT_DATA.electives.forEach(key => {
    const o = document.createElement('option');
    o.value = key; o.textContent = ELECTIVE_LABELS[key] || key;
    elGroup.appendChild(o);
  });
  batchSel.appendChild(elGroup);
}
batchSel.value = BIOTECH_BATCHES[0];

function subjectName(code, type) {
  const clean = (code || '').trim();
  if (!clean) return clean;
  if (clean === 'BT311' && TT_DATA.bt311_by_type && TT_DATA.bt311_by_type[type]) {
    return TT_DATA.bt311_by_type[type];
  }
  return TT_DATA.subjects[clean] || clean;
}

function facultyName(codeStr) {
  if (!codeStr) return '';
  return codeStr.split(',').map(c => {
    c = c.trim();
    return TT_DATA.faculty[c] ? `${TT_DATA.faculty[c]}` : c;
  }).join(', ');
}

function renderElectiveInfo(selected) {
  const legendKey = selected === 'minor' ? 'MINOR' : selected;
  const options = TT_DATA.elective_legend && TT_DATA.elective_legend[legendKey];
  if (!options || !options.length) {
    electiveInfo.style.display = 'none';
    electiveInfo.innerHTML = '';
    return;
  }
  electiveInfo.style.display = 'block';
  electiveInfo.innerHTML = `
    <div class="elective-title">${ELECTIVE_LABELS[selected] || selected} — subject options</div>
    <ul class="elective-list">
      ${options.map(o => `<li><span class="elective-code">${o.code}</span> ${o.name}${o.compulsory === false ? ' <span class="elective-alt">(alt. choice)</span>' : ''}</li>`).join('')}
    </ul>
    <div class="elective-note">Actual room/faculty depends on which subject you're allotted — check with your section coordinator.</div>
  `;
}

function electiveSlotSubject(type, choice) {
  const options = TT_DATA.elective_legend && TT_DATA.elective_legend[type];
  if (!options) return null;
  const match = options.find(o => String(o.choice) === String(choice));
  return match || null;
}

function renderSchedule() {
  const day = daySel.value;
  const batch = batchSel.value;
  const type = typeSel.value;
  const onlyElectives = electiveOnly.checked;
  const isElectiveSlot = /^(DE|SE)\d+$/.test(batch);

  renderElectiveInfo(batch);

  let items = TT_DATA.entries.filter(e => {
    if (e.day !== day) return false;
    if (e.type === 'OTHER') return false;
    if (batch === 'minor') { if (!e.batches.includes('minor')) return false; }
    else if (isElectiveSlot) { if (e.type !== batch) return false; }
    else { if (!e.batches.includes(batch)) return false; }
    if (type && !isElectiveSlot && batch !== 'minor' && e.type !== type) return false;
    if (onlyElectives && !e.elective) return false;
    return true;
  }).sort((a, b) => TT_DATA.times.indexOf(a.time) - TT_DATA.times.indexOf(b.time));

  schedule.innerHTML = '';
  if (items.length === 0) {
    schedule.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  schedule.style.display = 'flex';
  empty.style.display = 'none';

  const live = currentSlotInfo();
  const isViewingToday = day === live.day;
  let nowCard = null;

  items.forEach((e, i) => {
    const slot = parseTimeSlot(e.time);
    const isNow = isViewingToday && slot && live.hour >= slot.start && live.hour < slot.end;

    const card = document.createElement('div');
    card.className = `card animate type-${e.type}${e.elective ? ' elective' : ''}${isNow ? ' now' : ''}`;
    card.style.animationDelay = `${i * 0.08}s`;

    const isSlotPlaceholder = /^(DE|SE)\d+$/.test(e.type);
    const slotSubject = isSlotPlaceholder ? electiveSlotSubject(e.type, e.elective_choice) : null;
    const typeLabel = isSlotPlaceholder ? (ELECTIVE_LABELS[e.type] || e.type) : (TYPE_LABELS[e.type] || e.type);

    const resolvedName = slotSubject
      ? slotSubject.name
      : (isSlotPlaceholder
          ? `${ELECTIVE_LABELS[e.type] || e.type} (choice ${e.elective_choice})`
          : subjectName(e.course, e.type));
    const codeLine = slotSubject ? slotSubject.code : (isSlotPlaceholder ? '' : (e.course || ''));
    const detailsLine = isSlotPlaceholder
      ? `${ELECTIVE_LABELS[e.type] || e.type} · choice ${e.elective_choice}${slotSubject && slotSubject.compulsory === false ? ' (alt. choice)' : ''}`
      : `Room ${e.room || '—'} · ${facultyName(e.faculty)}`;

    card.innerHTML = `
      <div>
        <div class="time">${e.time} · ${typeLabel}${e.elective ? '<span class="elective-tag">Elective</span>' : ''}${isNow ? '<span class="now-tag">NOW</span>' : ''}</div>
        <div class="subject">${resolvedName}</div>
        ${codeLine ? `<div class="subject-code">${codeLine}</div>` : ''}
        <div class="details">${detailsLine}</div>
      </div>
      <div class="icon">${ICONS[e.type] || '📌'}</div>
    `;
    schedule.appendChild(card);
    if (isNow) nowCard = card;
  });

  if (nowCard) {
    requestAnimationFrame(() => nowCard.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }
}

[daySel, batchSel, typeSel, electiveOnly].forEach(el => el.addEventListener('change', renderSchedule));
renderSchedule();

const freeDaySel = document.getElementById('freeDay');
const freeTable = document.getElementById('freeTable');
TT_DATA.days.forEach(d => {
  const o = document.createElement('option');
  o.value = d; o.textContent = d;
  freeDaySel.appendChild(o);
});
freeDaySel.value = TODAY_TT_DAY;
[...freeDaySel.options].forEach(o => { if (o.value === TODAY_TT_DAY) o.textContent += ' (Today)'; });
freeDaySel.addEventListener('change', renderFreeTable);

function renderFreeTable() {
  const day = freeDaySel.value;
  const cols = BIOTECH_BATCHES;

  let html = '<tr><th>Time</th>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr>';

  TT_DATA.times.forEach(time => {
    html += `<tr><td class="time-col">${time}</td>`;
    cols.forEach(batch => {
      const match = TT_DATA.entries.find(e =>
        e.day === day && e.time === time && e.type !== 'OTHER' && e.batches.includes(batch)
      );
      if (match) {
        const slotSubject = /^(DE|SE)\d+$/.test(match.type)
          ? electiveSlotSubject(match.type, match.elective_choice)
          : null;
        const label = slotSubject
          ? slotSubject.name
          : (/^(DE|SE)\d+$/.test(match.type)
              ? (ELECTIVE_LABELS[match.type] || match.type)
              : subjectName(match.course, match.type));
        html += `<td><div class="free-cell busy" title="${label}">Busy</div></td>`;
      } else {
        html += `<td><div class="free-cell free">Free</div></td>`;
      }
    });
    html += '</tr>';
  });

  freeTable.innerHTML = html;
}
renderFreeTable();

function stepDay(selectEl, onChange, direction) {
  const days = TT_DATA.days;
  const idx = days.indexOf(selectEl.value);
  const nextIdx = (idx + direction + days.length) % days.length;
  selectEl.value = days[nextIdx];
  onChange();
}

function attachSwipe(el, selectEl, onChange) {
  let startX = 0, startY = 0, tracking = false;

  el.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  el.addEventListener('touchend', e => {
    if (!tracking) return;
    tracking = false;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - startX;
    const dy = endY - startY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    stepDay(selectEl, onChange, dx < 0 ? 1 : -1);
  }, { passive: true });
}

attachSwipe(document.getElementById('panel-schedule'), daySel, renderSchedule);
attachSwipe(document.getElementById('panel-free'), freeDaySel, renderFreeTable);
