/**
 * interactive_charts.js - Advanced Interactive Charts, Oscilloscope & HUD
 * Chart.js Vector Graphs for Coupler S-parameters & Antenna S11, Virtual Oscilloscope, Presentation Timer & Sound HUD
 */

(function () {
  'use strict';

  let couplerChart = null;
  let antennaChart = null;

  // =========================================================================
  // 1. Interactive Coupler S-Parameters Chart (Slide 6)
  // =========================================================================
  function initCouplerChart() {
    const ctx = document.getElementById('chart-coupler-canvas');
    if (!ctx || !window.COUPLER_CHART_DATA) return;
    if (couplerChart) {
      couplerChart.resize();
      couplerChart.update('none');
      return;
    }
    if (ctx.offsetParent === null) return;

    const data = window.COUPLER_CHART_DATA;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    couplerChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'dB(S(1,1)) Return Loss',
            data: data.s11,
            borderColor: '#38BDF8',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            borderWidth: 2.2,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.3
          },
          {
            label: 'dB(S(1,4)) Isolation',
            data: data.s41,
            borderColor: '#F87171',
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            borderWidth: 2.2,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.3
          },
          {
            label: 'dB(S(2,1)) Through (-3 dB)',
            data: data.s21,
            borderColor: '#34D399',
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.3
          },
          {
            label: 'dB(S(3,1)) Coupled (-3 dB)',
            data: data.s31,
            borderColor: '#F59E0B',
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: isDark ? '#CADCE0' : '#1E293B',
              font: { size: 10.5, family: 'sans-serif', weight: '600' },
              boxWidth: 12
            }
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(14, 44, 56, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: isDark ? '#38BDF8' : '#0284C7',
            bodyColor: isDark ? '#FFFFFF' : '#0F172A',
            borderColor: '#1B7F8C',
            borderWidth: 1,
            padding: 8,
            callbacks: {
              title: (items) => `Frequency: ${items[0].label} GHz`,
              label: (item) => ` ${item.dataset.label}: ${item.parsed.y} dB`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Frequency (GHz)', color: isDark ? '#7E9EA7' : '#64748B', font: { size: 10.5 } },
            ticks: { color: isDark ? '#CADCE0' : '#475569', maxTicksLimit: 12, font: { size: 9.5 } },
            grid: { color: isDark ? 'rgba(202, 220, 224, 0.08)' : 'rgba(15, 23, 42, 0.08)' }
          },
          y: {
            title: { display: true, text: 'Magnitude (dB)', color: isDark ? '#7E9EA7' : '#64748B', font: { size: 10.5 } },
            min: -50,
            max: 0,
            ticks: { color: isDark ? '#CADCE0' : '#475569', stepSize: 10, font: { size: 9.5 } },
            grid: { color: isDark ? 'rgba(202, 220, 224, 0.08)' : 'rgba(15, 23, 42, 0.08)' }
          }
        }
      }
    });

    // Trace Filter Buttons
    setupCouplerFilterButtons();
  }

  let couplerFiltersInitialized = false;
  function setupCouplerFilterButtons() {
    if (couplerFiltersInitialized) return;
    const btnAll = document.getElementById('filter-all');
    const btnDips = document.getElementById('filter-dips');
    const btnSplits = document.getElementById('filter-splits');

    if (!btnAll || !couplerChart) return;
    couplerFiltersInitialized = true;

    btnAll.addEventListener('click', () => {
      couplerChart.data.datasets.forEach(ds => ds.hidden = false);
      couplerChart.update();
      setActiveFilter(btnAll);
    });

    if (btnDips) {
      btnDips.addEventListener('click', () => {
        couplerChart.data.datasets[0].hidden = false; // S11
        couplerChart.data.datasets[1].hidden = false; // S41
        couplerChart.data.datasets[2].hidden = true;  // S21
        couplerChart.data.datasets[3].hidden = true;  // S31
        couplerChart.update();
        setActiveFilter(btnDips);
      });
    }

    if (btnSplits) {
      btnSplits.addEventListener('click', () => {
        couplerChart.data.datasets[0].hidden = true;  // S11
        couplerChart.data.datasets[1].hidden = true;  // S41
        couplerChart.data.datasets[2].hidden = false; // S21
        couplerChart.data.datasets[3].hidden = false; // S31
        couplerChart.update();
        setActiveFilter(btnSplits);
      });
    }

    function setActiveFilter(activeBtn) {
      [btnAll, btnDips, btnSplits].forEach(b => {
        if (b) b.classList.remove('active');
      });
      activeBtn.classList.add('active');
    }
  }

  // =========================================================================
  // 2. Interactive Antenna S11 Chart (Slide 10)
  // =========================================================================
  function initAntennaChart() {
    const ctx = document.getElementById('chart-antenna-canvas');
    if (!ctx || !window.ANTENNA_CHART_DATA) return;
    if (antennaChart) {
      antennaChart.resize();
      antennaChart.update('none');
      return;
    }
    if (ctx.offsetParent === null) return;

    const data = window.ANTENNA_CHART_DATA;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    // Horizontal -10 dB reference line array
    const threshData = data.labels.map(() => -10.0);

    antennaChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Simulated S11 (dB)',
            data: data.s11,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderWidth: 2.6,
            pointRadius: 0,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: false
          },
          {
            label: '-10 dB Impedance Limit (VSWR = 1.92)',
            data: threshData,
            borderColor: '#38BDF8',
            borderWidth: 1.8,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: isDark ? '#CADCE0' : '#1E293B',
              font: { size: 10.5, weight: '600' },
              boxWidth: 12
            }
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(14, 44, 56, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: isDark ? '#38BDF8' : '#0284C7',
            bodyColor: isDark ? '#FFFFFF' : '#0F172A',
            borderColor: '#1B7F8C',
            borderWidth: 1,
            padding: 8,
            callbacks: {
              title: (items) => `Frequency: ${items[0].label} GHz`,
              label: (item) => {
                if (item.datasetIndex === 0) {
                  const matchStatus = item.parsed.y <= -10 ? '✔ MATCHED' : '✖ MISMATCH';
                  return ` S11: ${item.parsed.y} dB (${matchStatus})`;
                }
                return ` ${item.dataset.label}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Frequency (GHz)', color: isDark ? '#7E9EA7' : '#64748B', font: { size: 10.5 } },
            ticks: { color: isDark ? '#CADCE0' : '#475569', maxTicksLimit: 15, font: { size: 9.5 } },
            grid: { color: isDark ? 'rgba(202, 220, 224, 0.08)' : 'rgba(15, 23, 42, 0.08)' }
          },
          y: {
            title: { display: true, text: 'Return Loss S11 (dB)', color: isDark ? '#7E9EA7' : '#64748B', font: { size: 10.5 } },
            min: -26,
            max: 2,
            ticks: { color: isDark ? '#CADCE0' : '#475569', stepSize: 5, font: { size: 9.5 } },
            grid: { color: isDark ? 'rgba(202, 220, 224, 0.08)' : 'rgba(15, 23, 42, 0.08)' }
          }
        }
      }
    });
  }

  // =========================================================================
  // 3. Virtual Oscilloscope Simulator (Slide 3)
  // =========================================================================
  let oscCanvas, oscCtx;
  let oscAnimId = null;
  let activeProbeMode = 'p1'; // 'p1', 'p2', 'p3', 'p4', 'compare'
  let oscPhase = 0;

  function initOscilloscope() {
    oscCanvas = document.getElementById('osc-canvas');
    if (!oscCanvas) return;
    oscCtx = oscCanvas.getContext('2d');

    const probeP1 = document.getElementById('probe-p1');
    const probeP2 = document.getElementById('probe-p2');
    const probeP3 = document.getElementById('probe-p3');
    const probeP4 = document.getElementById('probe-p4');
    const probeCompare = document.getElementById('probe-compare');

    function setProbe(mode, btn) {
      activeProbeMode = mode;
      [probeP1, probeP2, probeP3, probeP4, probeCompare].forEach(b => {
        if (b) b.classList.remove('active');
      });
      if (btn) btn.classList.add('active');

      // Update Readouts
      const readoutEl = document.getElementById('osc-readout-text');
      if (readoutEl) {
        if (mode === 'p1') {
          readoutEl.innerHTML = '<span style="color:#F59E0B;">PORT 1 (INPUT):</span> Vpp = 1.00 V | Phase = 0° Ref | Mag = 0.0 dB';
        } else if (mode === 'p2') {
          readoutEl.innerHTML = '<span style="color:#34D399;">PORT 2 (THROUGH):</span> Vpp = 0.707 V (−3 dB) | Phase = <strong>−90°</strong> (λg/4 delay)';
        } else if (mode === 'p3') {
          readoutEl.innerHTML = '<span style="color:#38BDF8;">PORT 3 (COUPLED):</span> Vpp = 0.707 V (−3 dB) | Phase = <strong>−180°</strong> (2λg/4 delay)';
        } else if (mode === 'p4') {
          readoutEl.innerHTML = '<span style="color:#EF4444;">PORT 4 (ISOLATED):</span> 90° vs 270° Anti-Phase | <strong>180° Cancellation</strong> ➔ V ≈ 0.00 V (S41 ≈ 0)';
        } else if (mode === 'compare') {
          readoutEl.innerHTML = '<span style="color:#34D399;">P2 (Through -90°)</span> vs <span style="color:#38BDF8;">P3 (Coupled -180°)</span> ➔ <strong>ΔΦ = 90° Quadrature Difference!</strong>';
        }
      }
    }

    if (probeP1) probeP1.addEventListener('click', () => setProbe('p1', probeP1));
    if (probeP2) probeP2.addEventListener('click', () => setProbe('p2', probeP2));
    if (probeP3) probeP3.addEventListener('click', () => setProbe('p3', probeP3));
    if (probeP4) probeP4.addEventListener('click', () => setProbe('p4', probeP4));
    if (probeCompare) probeCompare.addEventListener('click', () => setProbe('compare', probeCompare));

    animateOscilloscope();
  }

  function animateOscilloscope() {
    if (!oscCanvas || !oscCtx) return;
    const w = oscCanvas.clientWidth || 320;
    const h = oscCanvas.clientHeight || 130;
    oscCanvas.width = w;
    oscCanvas.height = h;

    oscCtx.clearRect(0, 0, w, h);

    // CRT Oscilloscope Background Grid (phosphor green grid)
    oscCtx.fillStyle = '#05140E';
    oscCtx.fillRect(0, 0, w, h);

    oscCtx.strokeStyle = 'rgba(52, 211, 153, 0.15)';
    oscCtx.lineWidth = 1;
    const gridSpacing = 20;
    for (let x = 0; x < w; x += gridSpacing) {
      oscCtx.beginPath();
      oscCtx.moveTo(x, 0);
      oscCtx.lineTo(x, h);
      oscCtx.stroke();
    }
    for (let y = 0; y < h; y += gridSpacing) {
      oscCtx.beginPath();
      oscCtx.moveTo(0, y);
      oscCtx.lineTo(w, y);
      oscCtx.stroke();
    }

    // Center Crosshair
    oscCtx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    oscCtx.beginPath();
    oscCtx.moveTo(w / 2, 0);
    oscCtx.lineTo(w / 2, h);
    oscCtx.moveTo(0, h / 2);
    oscCtx.lineTo(w, h / 2);
    oscCtx.stroke();

    oscPhase += 0.08;

    // Render Waveforms
    const cy = h / 2;
    const maxAmp = (h / 2) * 0.75;

    if (activeProbeMode === 'p1') {
      drawOscSine(0, 1.0, '#F59E0B', cy, maxAmp, w);
    } else if (activeProbeMode === 'p2') {
      drawOscSine(-Math.PI / 2, 0.707, '#34D399', cy, maxAmp, w);
    } else if (activeProbeMode === 'p3') {
      drawOscSine(-Math.PI, 0.707, '#38BDF8', cy, maxAmp, w);
    } else if (activeProbeMode === 'p4') {
      // Show two small canceling waves and the resulting flatline
      drawOscSine(-Math.PI / 2, 0.5, 'rgba(56, 189, 248, 0.35)', cy, maxAmp, w);
      drawOscSine(-Math.PI / 2 + Math.PI, 0.5, 'rgba(239, 68, 68, 0.35)', cy, maxAmp, w);
      // Flatline sum
      oscCtx.strokeStyle = '#EF4444';
      oscCtx.lineWidth = 2.5;
      oscCtx.beginPath();
      for (let x = 0; x < w; x++) {
        const noise = (Math.random() - 0.5) * 1.5;
        if (x === 0) oscCtx.moveTo(x, cy + noise);
        else oscCtx.lineTo(x, cy + noise);
      }
      oscCtx.stroke();
    } else if (activeProbeMode === 'compare') {
      // Draw P2 (Through, -90 deg) and P3 (Coupled, -180 deg) simultaneously
      drawOscSine(-Math.PI / 2, 0.707, '#34D399', cy, maxAmp, w);
      drawOscSine(-Math.PI, 0.707, '#38BDF8', cy, maxAmp, w);
    }

    oscAnimId = requestAnimationFrame(animateOscilloscope);
  }

  function drawOscSine(phaseOffset, amplitudeScale, color, cy, maxAmp, w) {
    oscCtx.save();
    oscCtx.strokeStyle = color;
    oscCtx.shadowColor = color;
    oscCtx.shadowBlur = 8;
    oscCtx.lineWidth = 2.2;
    oscCtx.beginPath();

    const spatialK = (Math.PI * 4) / w;
    for (let x = 0; x < w; x++) {
      const y = cy + Math.sin(spatialK * x - oscPhase + phaseOffset) * (maxAmp * amplitudeScale);
      if (x === 0) oscCtx.moveTo(x, y);
      else oscCtx.lineTo(x, y);
    }
    oscCtx.stroke();
    oscCtx.restore();
  }

  // =========================================================================
  // 4. Presentation Timer HUD
  // =========================================================================
  let timerSeconds = 0;
  let timerInterval = null;
  let isTimerRunning = false;

  function initPresentationTimer() {
    const timerDisplay = document.getElementById('presentation-timer-display');
    const timerToggle = document.getElementById('presentation-timer-toggle');

    if (!timerDisplay || !timerToggle) return;

    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    timerToggle.addEventListener('click', () => {
      isTimerRunning = !isTimerRunning;
      if (isTimerRunning) {
        timerInterval = setInterval(() => {
          timerSeconds++;
          timerDisplay.textContent = `${formatTime(timerSeconds)} / 10:00`;
          if (timerSeconds >= 480 && timerSeconds < 600) {
            timerDisplay.style.color = '#F59E0B'; // 8 mins alert
          } else if (timerSeconds >= 600) {
            timerDisplay.style.color = '#EF4444'; // 10 mins over
          }
        }, 1000);
        timerToggle.textContent = '⏸ Pause';
      } else {
        clearInterval(timerInterval);
        timerToggle.textContent = '▶ Start';
      }
    });
  }

  // =========================================================================
  // 5. High-Tech Sound FX (Web Audio API Synthesizer)
  // =========================================================================
  let audioCtx = null;
  let isSoundEnabled = false;

  function initSoundFX() {
    const btnSound = document.getElementById('btn-toggle-sound');
    if (!btnSound) return;

    btnSound.addEventListener('click', () => {
      isSoundEnabled = !isSoundEnabled;
      btnSound.textContent = isSoundEnabled ? '🔊 Sound: ON' : '🔇 Mute';
      if (isSoundEnabled && !audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (isSoundEnabled) playChime(640, 0.05);
    });

    window.addEventListener('slidechange', () => {
      if (isSoundEnabled && audioCtx) {
        playChime(520, 0.06);
      }
    });
  }

  function playChime(freq, duration) {
    try {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  // =========================================================================
  // Slide Change Handlers
  // =========================================================================
  window.addEventListener('slidechange', (e) => {
    const idx = e.detail.slideIndex;
    if (idx === 2) { // Slide 3 (Coupler Wave)
      setTimeout(initOscilloscope, 50);
    } else if (idx === 5) { // Slide 6 (Coupler S-parameters)
      setTimeout(initCouplerChart, 50);
    } else if (idx === 9) { // Slide 10 (Antenna S11)
      setTimeout(initAntennaChart, 50);
    }
  });

  // Boot on ready
  document.addEventListener('DOMContentLoaded', () => {
    initPresentationTimer();
    initSoundFX();
  });

  window.initCouplerChart = initCouplerChart;
  window.initAntennaChart = initAntennaChart;
  window.resizeCharts = function() {
    if (couplerChart) {
      couplerChart.resize();
      couplerChart.update('none');
    }
    if (antennaChart) {
      antennaChart.resize();
      antennaChart.update('none');
    }
  };

})();

