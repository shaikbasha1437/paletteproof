(function () {
  'use strict';

  const THRESHOLDS = {
    'aa-normal': 4.5,
    'aa-large': 3,
    'aaa-normal': 7,
    'aaa-large': 4.5,
    ui: 3,
  };

  const PRESETS = [
    { name: 'Black / White', fg: '#000000', bg: '#FFFFFF' },
    { name: 'White / Indigo', fg: '#F8FAFC', bg: '#312E81' },
    { name: 'Slate / Sky', fg: '#0F172A', bg: '#E0F2FE' },
    { name: 'Amber / Near-black', fg: '#FBBF24', bg: '#0C0A09' },
    { name: 'Gray on gray', fg: '#9CA3AF', bg: '#E5E7EB' },
    { name: 'Red on white', fg: '#DC2626', bg: '#FFFFFF' },
  ];

  const fgPicker = document.getElementById('fgPicker');
  const bgPicker = document.getElementById('bgPicker');
  const fgHex = document.getElementById('fgHex');
  const bgHex = document.getElementById('bgHex');
  const swapBtn = document.getElementById('swapBtn');
  const ratioEl = document.getElementById('ratio');
  const lumaEl = document.getElementById('luma');
  const badgesEl = document.getElementById('badges');
  const preview = document.getElementById('preview');
  const presetsEl = document.getElementById('presets');

  function clamp01(n) {
    return Math.min(1, Math.max(0, n));
  }

  function srgbChannelToLinear(c) {
    const v = clamp01(c / 255);
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function relativeLuminance(rgb) {
    const r = srgbChannelToLinear(rgb.r);
    const g = srgbChannelToLinear(rgb.g);
    const b = srgbChannelToLinear(rgb.b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrastRatio(fg, bg) {
    const L1 = relativeLuminance(fg);
    const L2 = relativeLuminance(bg);
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function parseHex(raw) {
    if (!raw) return null;
    let s = String(raw).trim();
    if (s[0] === '#') s = s.slice(1);
    if (/^[0-9a-fA-F]{3}$/.test(s)) {
      s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    }
    if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
      hex: '#' + s.toUpperCase(),
    };
  }

  function formatRatio(n) {
    const rounded = Math.round(n * 100) / 100;
    return (Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2)) + ':1';
  }

  function setBadge(key, pass) {
    const el = badgesEl.querySelector('[data-key="' + key + '"]');
    if (!el) return;
    el.classList.toggle('pass', pass);
    el.classList.toggle('fail', !pass);
    const status = el.querySelector('.badge-status');
    status.textContent = pass ? 'PASS' : 'FAIL';
  }

  function update() {
    const fg = parseHex(fgHex.value);
    const bg = parseHex(bgHex.value);

    fgHex.classList.toggle('invalid', !fg);
    bgHex.classList.toggle('invalid', !bg);

    if (!fg || !bg) {
      ratioEl.textContent = '—';
      lumaEl.textContent = 'Enter valid hex colors (e.g. #312E81).';
      Object.keys(THRESHOLDS).forEach((k) => {
        const el = badgesEl.querySelector('[data-key="' + k + '"]');
        if (!el) return;
        el.classList.remove('pass', 'fail');
        el.querySelector('.badge-status').textContent = '—';
      });
      return;
    }

    // Keep pickers in sync without fighting mid-edit of 3-digit shorthand
    if (fg.hex.length === 7) {
      fgPicker.value = fg.hex.toLowerCase();
      if (fgHex.value.toUpperCase() !== fg.hex) fgHex.value = fg.hex;
    }
    if (bg.hex.length === 7) {
      bgPicker.value = bg.hex.toLowerCase();
      if (bgHex.value.toUpperCase() !== bg.hex) bgHex.value = bg.hex;
    }

    const ratio = contrastRatio(fg, bg);
    const Lf = relativeLuminance(fg);
    const Lb = relativeLuminance(bg);

    ratioEl.textContent = formatRatio(ratio);
    lumaEl.textContent =
      'Relative luminance — FG ' + Lf.toFixed(4) + ' · BG ' + Lb.toFixed(4);

    Object.keys(THRESHOLDS).forEach((k) => {
      setBadge(k, ratio >= THRESHOLDS[k]);
    });

    preview.style.backgroundColor = bg.hex;
    preview.style.color = fg.hex;
    preview.style.borderColor = fg.hex + '44';
  }

  function bindColorPair(picker, hexInput) {
    picker.addEventListener('input', () => {
      hexInput.value = picker.value.toUpperCase();
      update();
    });
    hexInput.addEventListener('input', () => {
      const parsed = parseHex(hexInput.value);
      if (parsed) picker.value = parsed.hex.toLowerCase();
      update();
    });
    hexInput.addEventListener('blur', () => {
      const parsed = parseHex(hexInput.value);
      if (parsed) hexInput.value = parsed.hex;
      update();
    });
  }

  bindColorPair(fgPicker, fgHex);
  bindColorPair(bgPicker, bgHex);

  swapBtn.addEventListener('click', () => {
    const a = fgHex.value;
    const b = bgHex.value;
    fgHex.value = b;
    bgHex.value = a;
    const pf = parseHex(fgHex.value);
    const pb = parseHex(bgHex.value);
    if (pf) fgPicker.value = pf.hex.toLowerCase();
    if (pb) bgPicker.value = pb.hex.toLowerCase();
    update();
  });

  PRESETS.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset';
    btn.setAttribute('role', 'listitem');
    btn.innerHTML =
      '<span class="swatch" style="background:linear-gradient(90deg,' +
      p.fg +
      ' 50%,' +
      p.bg +
      ' 50%)"></span>' +
      p.name;
    btn.addEventListener('click', () => {
      fgHex.value = p.fg;
      bgHex.value = p.bg;
      fgPicker.value = p.fg.toLowerCase();
      bgPicker.value = p.bg.toLowerCase();
      update();
    });
    presetsEl.appendChild(btn);
  });

  // Self-check known pairs in console for debugging
  (function selfCheck() {
    const bw = contrastRatio(parseHex('#000000'), parseHex('#FFFFFF'));
    const ok = Math.abs(bw - 21) < 0.001;
    if (!ok) console.warn('PaletteProof contrast self-check failed:', bw);
  })();

  update();
})();
