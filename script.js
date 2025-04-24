// script.js

// ———————————————————————————————————————————————
// 1) CONFIG
const API_URL   = 'https://password-strength-checker-mvlg.onrender.com';
const DICT_FILE = 'common_passwords.txt';

// 2) STATE
let commonPasswords = new Set();

// 3) ELEMENT REFS (filled on DOMContentLoaded)
let pwdIn, meter, txt, entTxt, dictTxt, bdList, hashBtn, hashOut, breachTxt, darkTgl;

// 4) BOOTSTRAP once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  pwdIn     = document.getElementById('passwordInput');
  meter     = document.getElementById('strengthMeter');
  txt       = document.getElementById('strengthText');
  entTxt    = document.getElementById('entropyText');
  dictTxt   = document.getElementById('dictText');
  bdList    = document.getElementById('breakdownList');
  hashBtn   = document.getElementById('showHashBtn');
  hashOut   = document.getElementById('hashOutput');
  breachTxt = document.getElementById('breachText');
  darkTgl   = document.getElementById('darkModeToggle');

  // Load common-passwords dictionary
  fetch(DICT_FILE)
    .then(r => r.text())
    .then(text => {
      text.split('\n').forEach(pw => {
        const w = pw.trim();
        if (w) commonPasswords.add(w);
      });
    })
    .catch(err => console.error('Could not load dictionary:', err));

  // Wire up events
  pwdIn.addEventListener('input', () => updateStrength().catch(console.error));
  hashBtn.addEventListener('click', showHash);
  darkTgl.addEventListener('change', () => {
    document.body.classList.toggle('dark', darkTgl.checked);
  });
});
// ———————————————————————————————————————————————

// 5) CORE FUNCTIONS

// 5a) Strength + Entropy + Dictionary + Breakdown + Breach
async function updateStrength() {
  const pwd = pwdIn.value;
  let score = 0;

  // Rule checks
  const hasLower  = /[a-z]/.test(pwd);
  const hasUpper  = /[A-Z]/.test(pwd);
  const hasDigit  = /\d/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

  if (pwd.length >= 8)     score++;
  if (hasLower && hasUpper) score++;
  if (hasDigit)             score++;
  if (hasSymbol)            score++;

  // Meter & label
  meter.value = score;
  const labels = ['Too Short','Weak','Fair','Strong','Very Strong'];
  txt.textContent = labels[score];

  // Entropy
  if (pwd) {
    const freq = {};
    for (let c of pwd) freq[c] = (freq[c]||0) + 1;
    let ent = 0;
    Object.values(freq).forEach(cnt => {
      const p = cnt / pwd.length;
      ent -= p * Math.log2(p);
    });
    entTxt.textContent = `Entropy: ${ent.toFixed(2)} bits/char`;
  } else {
    entTxt.textContent = '';
  }

  // Dictionary warning
  dictTxt.textContent = commonPasswords.has(pwd)
    ? '⚠️ Very common password!'
    : '';

  // Dynamic requirements breakdown
  const requirements = [
    { test: pwd.length >= 8,      label: 'At least 8 characters' },
    { test: hasLower && hasUpper, label: 'Mixed lower + upper case' },
    { test: hasDigit,             label: 'At least one digit' },
    { test: hasSymbol,            label: 'At least one symbol' }
  ];

  bdList.innerHTML = requirements
    .map(r => `<li class="${r.test ? 'pass' : 'fail'}">${r.label}</li>`)
    .join('');

  // Override to "Very Strong" if all pass
  const passedCount = requirements.filter(r => r.test).length;
  if (passedCount === requirements.length) {
    txt.textContent = 'Very Strong';
    meter.value = requirements.length;
  }

  // Breach check
  breachTxt.textContent = '';
  breachTxt.classList.remove('safe','pwned');

  if (pwd) {
    try {
      const count = await checkBreach(pwd);
      if (count > 0) {
        breachTxt.textContent = `Pwned ${count.toLocaleString()} times!`;
        breachTxt.classList.add('pwned');
      } else {
        breachTxt.textContent = 'Never seen in breaches';
        breachTxt.classList.add('safe');
      }
    } catch {
      breachTxt.textContent = 'Error checking breaches';
    }
  }
}

// 5b) Breach‐check via HIBP
async function checkBreach(password) {
  const buf     = new TextEncoder().encode(password);
  const hashBuf = await crypto.subtle.digest('SHA-1', buf);
  const hex     = Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2,'0'))
    .join('').toUpperCase();

  const prefix = hex.slice(0,5), suffix = hex.slice(5);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({prefix,suffix})
  });
  if (!res.ok) throw new Error('HIBP error');
  return (await res.json()).count;
}

// 5c) Show SHA-256 Hash
async function showHash() {
  const pwd = pwdIn.value;
  if (!pwd) {
    hashOut.textContent = '';
    return;
  }
  const buf     = new TextEncoder().encode(pwd);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  const hex     = Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2,'0'))
    .join('');
  hashOut.textContent = hex;
}
