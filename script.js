/* ─────────────── TABS ─────────────── */
function switchTab(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  btn.classList.add('active');
}

/* ─────────────── AGE CALCULATOR ─────────────── */
(function () {
  document.getElementById('birthdate').max = new Date().toISOString().split('T')[0];
})();

function calcAge() {
  const val = document.getElementById('birthdate').value;
  if (!val) { alert('Please select a date of birth.'); return; }

  const birth = new Date(val);
  const now   = new Date();

  // Years
  let years = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) years--;

  // Total months
  let totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 +
                    (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) totalMonths--;

  // Total days & hours
  const diffMs     = now - birth;
  const totalDays  = Math.floor(diffMs / 86400000);
  const totalHours = Math.floor(diffMs / 3600000);

  // Next birthday countdown
  const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBday <= now) nextBday.setFullYear(now.getFullYear() + 1);
  const daysUntil = Math.ceil((nextBday - now) / 86400000);

  document.getElementById('age-years').innerHTML =
    years + ' <span>year' + (years !== 1 ? 's' : '') + '</span>';
  document.getElementById('age-months').textContent     = totalMonths.toLocaleString();
  document.getElementById('age-days-total').textContent = totalDays.toLocaleString();
  document.getElementById('age-hours').textContent      = totalHours.toLocaleString();
  document.getElementById('bday-countdown').innerHTML   =
    daysUntil === 1
      ? '🎂 Your birthday is tomorrow!'
      : `Next birthday in <span>${daysUntil}</span> day${daysUntil !== 1 ? 's' : ''}.`;

  document.getElementById('age-result').classList.add('show');
}

/* ─────────────── MATH CALCULATOR ─────────────── */
let current    = '0';
let operator   = null;
let previous   = null;
let justEvaled = false;
let exprStr    = '';

const $disp = () => document.getElementById('display');
const $expr = () => document.getElementById('expr');
const SYM   = { '+':'+', '-':'−', '*':'×', '/':'÷' };

function updateDisplay(val) {
  const el = $disp();
  let shown = val;
  if (!isNaN(parseFloat(val)) && String(val).replace(/[-.]/, '').length > 12) {
    shown = parseFloat(val).toExponential(4);
  }
  el.textContent = shown;
}

function inp(digit) {
  if (justEvaled) { current = digit; exprStr = ''; justEvaled = false; }
  else current = (current === '0') ? digit : current + digit;
  updateDisplay(current);
}

function inputDot() {
  if (justEvaled) { current = '0.'; justEvaled = false; }
  else if (!current.includes('.')) current += '.';
  updateDisplay(current);
}

function clearAll() {
  current = '0'; operator = null; previous = null;
  justEvaled = false; exprStr = '';
  updateDisplay('0');
  $expr().textContent = '';
}

function toggleSign() {
  if (current === '0') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
  updateDisplay(current);
}

function percent() {
  current = String(parseFloat(current) / 100);
  updateDisplay(current);
}

function setOp(op) {
  if (operator && !justEvaled) compute(false);
  previous   = parseFloat(current);
  operator   = op;
  justEvaled = false;
  exprStr    = previous + ' ' + SYM[op];
  $expr().textContent = exprStr;
  current = '0';
}

function compute(isFinal) {
  if (operator === null || previous === null) return;
  const a = previous, b = parseFloat(current);

  if (operator === '/' && b === 0) {
    const el = $disp();
    el.classList.add('error', 'shake');
    el.textContent = 'DIV BY ZERO';
    setTimeout(() => { el.classList.remove('error', 'shake'); updateDisplay(current); }, 1400);
    return;
  }

  let result;
  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = a / b; break;
  }
  result = parseFloat(result.toPrecision(12));

  if (isFinal) {
    $expr().textContent = exprStr + ' ' + b + ' =';
    operator = null; previous = null; justEvaled = true;
  }
  current = String(result);
  updateDisplay(current);
}

function evaluate() { compute(true); }

/* ── Keyboard support ── */
document.addEventListener('keydown', e => {
  if ('0123456789'.includes(e.key))       { inp(e.key); return; }
  if (e.key === '.')                      { inputDot(); return; }
  if (e.key === '+')                      { setOp('+'); return; }
  if (e.key === '-')                      { setOp('-'); return; }
  if (e.key === '*')                      { setOp('*'); return; }
  if (e.key === '/') { e.preventDefault(); setOp('/'); return; }
  if (e.key === 'Enter' || e.key === '=') { evaluate(); return; }
  if (e.key === 'Escape')                 { clearAll(); return; }
  if (e.key === 'Backspace') {
    current = current.length > 1 ? current.slice(0, -1) : '0';
    updateDisplay(current);
  }
});