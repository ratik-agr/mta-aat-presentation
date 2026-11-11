/**
 * simulators.js - Interactive Microwave & RF Calculators and Wave Simulator
 * Coupler Wave Cancellation Canvas, Hammerstad Synthesis Slider, UWB Cut-off Calculator
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Coupler Wave Propagation & 180° Cancellation Canvas Simulator
  // =========================================================================
  let canvas, ctx;
  let animId = null;
  let isPlaying = true;
  let simSpeed = 1.0;
  let wavePhase = 0;

  function initWaveSimulator() {
    canvas = document.getElementById('coupler-wave-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Handle high DPI
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Controls
    const btnPlay = document.getElementById('wave-sim-play');
    const speedSlider = document.getElementById('wave-sim-speed');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        isPlaying = !isPlaying;
        btnPlay.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
        if (isPlaying) animateWave();
      });
    }

    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        simSpeed = parseFloat(e.target.value);
        const readout = document.getElementById('wave-speed-val');
        if (readout) readout.textContent = `${simSpeed.toFixed(1)}x`;
      });
    }

    // Start loop
    animateWave();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  function animateWave() {
    if (!canvas || !ctx) return;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;

    ctx.clearRect(0, 0, width, height);

    // Coupler Ring Dimensions
    const cx = width / 2;
    const cy = height / 2;
    const ringW = Math.min(width * 0.52, 260);
    const ringH = Math.min(height * 0.55, 170);

    const xL = cx - ringW / 2;
    const xR = cx + ringW / 2;
    const yB = cy + ringH / 2;
    const yT = cy - ringH / 2;

    const feedLen = Math.min(width * 0.16, 65);

    // Colors
    const colSeries = isDark ? '#E05A47' : '#DC2626'; // Red/Coral 35.4 ohm
    const colShunt = isDark ? '#38BDF8' : '#0284C7';  // Blue/Cyan 50 ohm
    const colFeed = isDark ? '#CADCE0' : '#475569';
    const colWave = isDark ? '#F59E0B' : '#D97706';
    const colCancel = isDark ? '#EF4444' : '#B91C1C';
    const colSuccess = isDark ? '#34D399' : '#059669';

    // 1. Draw Transmission Lines (Ring Arms)
    // Vertical Series Arms (5.3 mm, 35.4 ohm) - P1-P2 & P4-P3
    ctx.lineWidth = 14;
    ctx.strokeStyle = colSeries;
    ctx.beginPath();
    ctx.moveTo(xL, yB);
    ctx.lineTo(xL, yT);
    ctx.moveTo(xR, yB);
    ctx.lineTo(xR, yT);
    ctx.stroke();

    // Horizontal Shunt Arms (3.0 mm, 50 ohm) - P1-P4 & P2-P3
    ctx.lineWidth = 8;
    ctx.strokeStyle = colShunt;
    ctx.beginPath();
    ctx.moveTo(xL, yB);
    ctx.lineTo(xR, yB);
    ctx.moveTo(xL, yT);
    ctx.lineTo(xR, yT);
    ctx.stroke();

    // 2. Feed Lines to Ports
    ctx.lineWidth = 7;
    ctx.strokeStyle = colFeed;
    ctx.beginPath();
    // Port 1 (Bottom Left)
    ctx.moveTo(xL, yB);
    ctx.lineTo(xL - feedLen * 0.7, yB + feedLen * 0.7);
    // Port 2 (Top Left)
    ctx.moveTo(xL, yT);
    ctx.lineTo(xL - feedLen * 0.7, yT - feedLen * 0.7);
    // Port 3 (Top Right)
    ctx.moveTo(xR, yT);
    ctx.lineTo(xR + feedLen * 0.7, yT - feedLen * 0.7);
    // Port 4 (Bottom Right)
    ctx.moveTo(xR, yB);
    ctx.lineTo(xR + feedLen * 0.7, yB + feedLen * 0.7);
    ctx.stroke();

    // 3. Port Circles
    const portRadius = 6;
    drawPortDot(xL - feedLen * 0.7, yB + feedLen * 0.7, colWave, 'P1: In');
    drawPortDot(xL - feedLen * 0.7, yT - feedLen * 0.7, colSuccess, 'P2: Thru (-90°)');
    drawPortDot(xR + feedLen * 0.7, yT - feedLen * 0.7, colSuccess, 'P3: Cpl (-180°)');
    drawPortDot(xR + feedLen * 0.7, yB + feedLen * 0.7, colCancel, 'P4: Iso (Cancel)');

    // 4. Wave Packets Animation
    if (isPlaying) {
      wavePhase += 0.05 * simSpeed;
    }

    // Animated sine waves traveling through lines
    ctx.lineWidth = 2.5;

    // Wave 1: Entering Port 1 to Corner
    drawSineWave(
      xL - feedLen * 0.7, yB + feedLen * 0.7,
      xL, yB,
      wavePhase, 1.0, colWave
    );

    // Wave 2: P1 -> P2 along Series Arm (length lambda/4 = 90 deg)
    drawSineWave(xL, yB, xL, yT, wavePhase - 1.2, 0.707, colWave);

    // Wave 3: P2 -> Out Through Port 2
    drawSineWave(
      xL, yT,
      xL - feedLen * 0.7, yT - feedLen * 0.7,
      wavePhase - 2.8, 0.707, colSuccess
    );

    // Wave 4: P2 -> P3 along Top Shunt Arm (length lambda/4 = 90 deg)
    drawSineWave(xL, yT, xR, yT, wavePhase - 2.8, 0.707, colWave);

    // Wave 5: P3 -> Out Coupled Port 3
    drawSineWave(
      xR, yT,
      xR + feedLen * 0.7, yT - feedLen * 0.7,
      wavePhase - 4.4, 0.707, colSuccess
    );

    // Wave 6A: Direct bottom shunt arm P1 -> P4 (Path A: lambda/4 = 90 deg)
    drawSineWave(xL, yB, xR, yB, wavePhase - 1.2, 0.707, colShunt);

    // Wave 6B: P3 -> P4 along Right Series Arm (Path B: arriving at P4 at 270 deg)
    drawSineWave(xR, yT, xR, yB, wavePhase - 4.4, 0.707, colSeries);

    // Visualizing Cancellation at Port 4 Feed Line:
    // Wave A and Wave B arrive with Delta_Theta = 180 deg -> Flatline / minimal residual!
    const p4_x0 = xR;
    const p4_y0 = yB;
    const p4_x1 = xR + feedLen * 0.7;
    const p4_y1 = yB + feedLen * 0.7;

    ctx.strokeStyle = colCancel;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(p4_x0, p4_y0);
    ctx.lineTo(p4_x1, p4_y1);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zero amplitude marker
    ctx.fillStyle = colCancel;
    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillText('180° Cancellation: ZERO Wave (S41 ≈ 0)', xR + 10, yB + feedLen * 0.5);

    // Labels for Phase Delta
    ctx.fillStyle = isDark ? '#CADCE0' : '#1E293B';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Output Phase Diff: ΔΦ = 90° (Quadrature)', cx, cy - 8);
    ctx.fillStyle = colCancel;
    ctx.font = '9px monospace';
    ctx.fillText('Isolation Diff: Δθ = 270° - 90° = 180°', cx, cy + 10);

    if (isPlaying) {
      animId = requestAnimationFrame(animateWave);
    }
  }

  function drawPortDot(x, y, color, label) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 10px sans-serif';
    if (x < canvas.width / 2) {
      ctx.textAlign = 'right';
      ctx.fillText(label, x - 10, y + 4);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 10, y + 4);
    }
    ctx.restore();
  }

  function drawSineWave(x1, y1, x2, y2, phase, amplitude, color) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const numPoints = Math.max(20, Math.floor(dist / 3));

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(angle);

    ctx.strokeStyle = color;
    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const px = (i / numPoints) * dist;
      const k = (2 * Math.PI / 40); // spatial frequency
      const py = Math.sin(k * px - phase) * (amplitude * 5.5);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // 2. Microstrip Synthesis Hammerstad Calculator
  // =========================================================================
  function initMicrostripCalculator() {
    const widthSlider = document.getElementById('calc-w-slider');
    const widthVal = document.getElementById('calc-w-val');
    const outZ0 = document.getElementById('calc-out-z0');
    const outEpsEff = document.getElementById('calc-out-epseff');
    const outLambdaG = document.getElementById('calc-out-lambdag');
    const outQuarterLambda = document.getElementById('calc-out-quarter');
    const btnPreset50 = document.getElementById('preset-50ohm');
    const btnPreset35 = document.getElementById('preset-35ohm');

    if (!widthSlider) return;

    function computeHammerstad(w_mm, h_mm = 1.6, er = 4.4, f_ghz = 2.4) {
      const u = w_mm / h_mm;
      // Hammerstad Effective Permittivity
      const epsEff = (er + 1) / 2 + ((er - 1) / 2) * Math.pow(1 + 12 / u, -0.5);

      // Hammerstad Characteristic Impedance (for u >= 1)
      let z0;
      if (u >= 1) {
        z0 = (120 * Math.PI) / (Math.sqrt(epsEff) * (u + 1.393 + 0.667 * Math.log(u + 1.444)));
      } else {
        z0 = (60 / Math.sqrt(epsEff)) * Math.log(8 / u + u / 4);
      }

      // Guided wavelength lambda_g in mm (c = 300 mm/ns, f in GHz)
      const c = 300; // mm/ns
      const lambdaG = c / (f_ghz * Math.sqrt(epsEff));
      const quarterLambda = lambdaG / 4;

      return { epsEff, z0, lambdaG, quarterLambda };
    }

    function updateCalculator(w) {
      const res = computeHammerstad(w);
      if (widthVal) widthVal.textContent = `${w.toFixed(2)} mm`;
      if (outZ0) outZ0.textContent = `${res.z0.toFixed(1)} Ω`;
      if (outEpsEff) outEpsEff.textContent = res.epsEff.toFixed(2);
      if (outLambdaG) outLambdaG.textContent = `${res.lambdaG.toFixed(1)} mm`;
      if (outQuarterLambda) outQuarterLambda.textContent = `${res.quarterLambda.toFixed(1)} mm`;
    }

    widthSlider.addEventListener('input', (e) => {
      const w = parseFloat(e.target.value);
      updateCalculator(w);
    });

    if (btnPreset50) {
      btnPreset50.addEventListener('click', () => {
        widthSlider.value = 3.0;
        updateCalculator(3.0);
      });
    }

    if (btnPreset35) {
      btnPreset35.addEventListener('click', () => {
        widthSlider.value = 5.3;
        updateCalculator(5.3);
      });
    }

    // Initial run
    updateCalculator(parseFloat(widthSlider.value));
  }

  // =========================================================================
  // 3. UWB Monopole Lower Cut-Off Calculator
  // =========================================================================
  function initUWBCutoffCalculator() {
    const lSlider = document.getElementById('uwb-l-slider');
    const lVal = document.getElementById('uwb-l-val');
    const outFl = document.getElementById('uwb-out-fl');
    const outStatus = document.getElementById('uwb-out-status');

    if (!lSlider) return;

    function computeCutoff(L_mm, er = 4.4) {
      const c = 300; // mm * GHz (3e8 m/s = 300 mm / ns)
      const epsEff = (er + 1) / 2; // ~2.7
      const fL = c / (4 * L_mm * Math.sqrt(epsEff));
      return fL;
    }

    function updateCutoff(L) {
      const fL = computeCutoff(L);
      if (lVal) lVal.textContent = `${L.toFixed(1)} mm`;
      if (outFl) outFl.textContent = `${fL.toFixed(2)} GHz`;

      if (outStatus) {
        if (fL <= 3.10) {
          outStatus.innerHTML = '<span style="color:var(--accent-emerald);">✔ Fully Covers 3.1 GHz FCC Edge!</span>';
        } else {
          const diff = (fL - 3.10) * 1000;
          outStatus.innerHTML = `<span style="color:var(--accent-coral);">⚠ Misses 3.1 GHz by ${diff.toFixed(0)} MHz (HFSS actual: 3.52 GHz)</span>`;
        }
      }
    }

    lSlider.addEventListener('input', (e) => {
      const L = parseFloat(e.target.value);
      updateCutoff(L);
    });

    updateCutoff(parseFloat(lSlider.value));
  }

  // =========================================================================
  // 4. Interactive Marker Inspector
  // =========================================================================
  function initMarkerInspector() {
    const markerChips = document.querySelectorAll('.marker-chip');
    const markerRows = document.querySelectorAll('.marker-row');

    markerChips.forEach((chip) => {
      chip.addEventListener('mouseenter', () => {
        const markerId = chip.getAttribute('data-marker');
        markerRows.forEach((row) => {
          if (row.getAttribute('data-marker') === markerId) {
            row.style.backgroundColor = 'var(--accent-teal)';
            row.style.color = '#FFFFFF';
          } else {
            row.style.backgroundColor = '';
            row.style.color = '';
          }
        });
      });

      chip.addEventListener('mouseleave', () => {
        markerRows.forEach((row) => {
          row.style.backgroundColor = '';
          row.style.color = '';
        });
      });
    });
  }

  // =========================================================================
  // Initialize All Simulators
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initWaveSimulator();
    initMicrostripCalculator();
    initUWBCutoffCalculator();
    initMarkerInspector();
  });

  window.addEventListener('slidechange', (e) => {
    if (e.detail.slideIndex === 2) {
      resizeCanvas();
      if (!animId && isPlaying) animateWave();
    }
  });

  window.resizeWaveSimulator = resizeCanvas;

})();

