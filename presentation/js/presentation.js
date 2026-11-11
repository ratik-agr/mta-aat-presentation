/**
 * presentation.js - Core Slide Deck Engine
 * Keyboard navigation, fullscreen, presenter notes, slide overview, theme toggle, and lightbox
 */

(function () {
  'use strict';

  // State
  let currentSlideIndex = 0;
  let slides = [];
  let isNotesOpen = false;
  let isOverviewOpen = false;

  // DOM Elements
  const deckViewport = document.getElementById('deck-viewport');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const slideCounter = document.getElementById('slide-counter');
  const progressFill = document.getElementById('progress-fill');
  const notesDrawer = document.getElementById('notes-drawer');
  const notesContent = document.getElementById('notes-content');
  const btnToggleNotes = document.getElementById('btn-toggle-notes');
  const btnCloseNotes = document.getElementById('btn-close-notes');
  const btnToggleFullscreen = document.getElementById('btn-toggle-fullscreen');
  const btnToggleOverview = document.getElementById('btn-toggle-overview');
  const overviewModal = document.getElementById('overview-modal');
  const overviewGrid = document.getElementById('overview-grid');
  const btnCloseOverview = document.getElementById('btn-close-overview');
  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const imageModal = document.getElementById('image-modal');
  const imageModalImg = document.getElementById('image-modal-img');
  const imageModalCaption = document.getElementById('image-modal-caption');
  const btnCloseImageModal = document.getElementById('btn-close-image-modal');

  // Dynamic 16:9 Presentation Canvas Scaler Engine
  function fitSlidesToViewport() {
    if (!deckViewport) return;
    // Use clientWidth/Height; fall back to window size if layout hasn't occurred yet
    const vw = deckViewport.clientWidth || window.innerWidth;
    const vh = deckViewport.clientHeight || (window.innerHeight - 74); // subtract nav+footer
    if (vw <= 0 || vh <= 0) return;

    // Canonical 16:9 presentation canvas: 1440 x 810 px
    const targetW = 1440;
    const targetH = 810;

    // Scale uniformly, leaving 20px breathing room on each axis
    const scale = Math.min((vw - 20) / targetW, (vh - 20) / targetH);
    const clampedScale = Math.max(0.3, Math.min(scale, 3)); // safety clamp

    document.documentElement.style.setProperty('--deck-scale', clampedScale);

    slides.forEach(slide => {
      slide.style.transform = `translate(-50%, -50%) scale(${clampedScale})`;
    });
  }

  // Initialize Slides
  function init() {
    slides = Array.from(document.querySelectorAll('.slide'));
    if (slides.length === 0) return;

    // Check URL hash for slide index (e.g. #3)
    const hash = window.location.hash.replace('#', '');
    const initialIndex = parseInt(hash, 10) - 1;
    if (!isNaN(initialIndex) && initialIndex >= 0 && initialIndex < slides.length) {
      currentSlideIndex = initialIndex;
    } else {
      currentSlideIndex = 0;
    }

    // Initialize Theme
    const savedTheme = localStorage.getItem('mta_theme') || 'dark';
    setTheme(savedTheme);

    // Build Overview Grid
    buildOverviewGrid();

    // Fit canvas to viewport immediately
    fitSlidesToViewport();

    // Attach Event Listeners
    setupEventListeners();

    // Show initial slide
    goToSlide(currentSlideIndex, false);
  }

  // Go To Slide
  function goToSlide(index, updateHash = true) {
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;

    // Update slides visibility
    slides.forEach((slide, idx) => {
      if (idx === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    currentSlideIndex = index;

    // Update Progress & Controls
    const currentNum = index + 1;
    const totalNum = slides.length;
    slideCounter.textContent = `${String(currentNum).padStart(2, '0')} / ${String(totalNum).padStart(2, '0')}`;
    const progressPercent = (currentNum / totalNum) * 100;
    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    const progressFillBottom = document.getElementById('progress-fill-bottom');
    if (progressFillBottom) progressFillBottom.style.width = `${progressPercent}%`;

    btnPrev.disabled = (index === 0);
    btnNext.disabled = (index === slides.length - 1);

    // Update Presenter Notes
    updatePresenterNotes(index);

    // Update Overview Active Thumbnail
    updateOverviewActive(index);

    // Update URL hash
    if (updateHash) {
      window.location.hash = String(currentNum);
    }

    // Trigger any slide-specific resize or simulator updates
    fitSlidesToViewport();
    window.dispatchEvent(new CustomEvent('slidechange', { detail: { slideIndex: index } }));
  }

  function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  // Presenter Notes
  function updatePresenterNotes(index) {
    const activeSlide = slides[index];
    const notesEl = activeSlide.querySelector('.presenter-notes-data');
    if (notesEl && notesContent) {
      notesContent.innerHTML = notesEl.innerHTML;
    } else if (notesContent) {
      notesContent.innerHTML = '<em>No presenter notes for this slide.</em>';
    }
  }

  function toggleNotes(force) {
    isNotesOpen = force !== undefined ? force : !isNotesOpen;
    if (isNotesOpen) {
      notesDrawer.classList.add('open');
      btnToggleNotes.classList.add('active');
    } else {
      notesDrawer.classList.remove('open');
      btnToggleNotes.classList.remove('active');
    }
  }

  // Overview Modal
  function buildOverviewGrid() {
    overviewGrid.innerHTML = '';
    slides.forEach((slide, idx) => {
      const chipText = slide.querySelector('.chip-tag')?.textContent || `SLIDE ${idx+1}`;
      const titleText = slide.querySelector('.slide-title')?.textContent || 'Untitled Slide';

      const thumb = document.createElement('div');
      thumb.className = `overview-thumb ${idx === currentSlideIndex ? 'active' : ''}`;
      thumb.innerHTML = `
        <div class="thumb-chip">${chipText}</div>
        <div class="thumb-title">${titleText}</div>
        <div class="thumb-num">Slide ${String(idx + 1).padStart(2, '0')}</div>
      `;
      thumb.addEventListener('click', () => {
        goToSlide(idx);
        toggleOverview(false);
      });
      overviewGrid.appendChild(thumb);
    });
  }

  function updateOverviewActive(activeIndex) {
    const thumbs = overviewGrid.querySelectorAll('.overview-thumb');
    thumbs.forEach((th, idx) => {
      if (idx === activeIndex) {
        th.classList.add('active');
      } else {
        th.classList.remove('active');
      }
    });
  }

  function toggleOverview(force) {
    isOverviewOpen = force !== undefined ? force : !isOverviewOpen;
    if (isOverviewOpen) {
      overviewModal.classList.add('open');
      btnToggleOverview.classList.add('active');
    } else {
      overviewModal.classList.remove('open');
      btnToggleOverview.classList.remove('active');
    }
  }

  // Fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Theme Toggle
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mta_theme', theme);
    if (theme === 'light') {
      btnToggleTheme.textContent = '🌙 Dark';
    } else {
      btnToggleTheme.textContent = '☀️ Light';
    }
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }

  // Lightbox Modal
  function openLightbox(src, caption) {
    imageModalImg.src = src;
    imageModalCaption.textContent = caption || '';
    imageModal.classList.add('open');
  }

  function closeLightbox() {
    imageModal.classList.remove('open');
  }

  // Expose lightbox globally
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;

  // Event Listeners
  function setupEventListeners() {
    // Navigation buttons
    btnPrev.addEventListener('click', prevSlide);
    btnNext.addEventListener('click', nextSlide);

    // Toolbar buttons
    btnToggleNotes.addEventListener('click', () => toggleNotes());
    btnCloseNotes.addEventListener('click', () => toggleNotes(false));
    btnToggleFullscreen.addEventListener('click', toggleFullscreen);
    btnToggleOverview.addEventListener('click', () => toggleOverview());
    btnCloseOverview.addEventListener('click', () => toggleOverview(false));
    btnToggleTheme.addEventListener('click', toggleTheme);

    // Lightbox modal close
    btnCloseImageModal.addEventListener('click', closeLightbox);
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) closeLightbox();
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Prevent keyboard hijacking if focus is in an input or slider
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') document.activeElement.blur();
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(slides.length - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          toggleNotes();
          break;
        case 'o':
        case 'O':
          e.preventDefault();
          toggleOverview();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          toggleTheme();
          break;
        case 'Escape':
          if (isOverviewOpen) toggleOverview(false);
          if (imageModal.classList.contains('open')) closeLightbox();
          if (isNotesOpen) toggleNotes(false);
          break;
      }
    });

    // Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    deckViewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    deckViewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const threshold = 50;
      if (touchEndX < touchStartX - threshold) {
        nextSlide();
      } else if (touchEndX > touchStartX + threshold) {
        prevSlide();
      }
    }

    // Attach click-to-zoom on all media-boxes
    document.querySelectorAll('.media-box').forEach((box) => {
      box.addEventListener('click', () => {
        const img = box.querySelector('img');
        const caption = box.querySelector('.media-caption')?.innerText || img?.alt;
        if (img && img.src) {
          openLightbox(img.src, caption);
        }
      });
    });

    // Window resize & responsive 16:9 canvas scaling
    window.addEventListener('resize', fitSlidesToViewport);
    window.addEventListener('orientationchange', fitSlidesToViewport);
    document.addEventListener('fullscreenchange', () => {
      setTimeout(fitSlidesToViewport, 80);
    });

    // Hash change handler (browser back/forward)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      const idx = parseInt(hash, 10) - 1;
      if (!isNaN(idx) && idx !== currentSlideIndex && idx >= 0 && idx < slides.length) {
        goToSlide(idx, false);
      }
    });
  }

  // Boot on DOM ready — also re-fit after full page load (fonts/images loaded)
  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(fitSlidesToViewport);
    });
  });

  // Expose global API
  window.MTAPresentation = {
    goToSlide,
    nextSlide,
    prevSlide,
    toggleNotes,
    toggleOverview,
    toggleTheme,
    toggleFullscreen,
    fitSlidesToViewport
  };

  // Dual-mode view switcher for ANSYS Screenshots <-> Interactive Tools
  function switchDeckView(deckId, targetView) {
    const deck = document.getElementById(deckId);
    if (!deck) return;

    const tabs = deck.querySelectorAll('.switch-tab-btn');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-view') === targetView) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    const panes = deck.querySelectorAll('.switch-content-pane');
    panes.forEach(pane => {
      if (pane.getAttribute('data-view') === targetView) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    if (targetView === 'interactive') {
      setTimeout(() => {
        if (deckId === 'deck-wave') {
          if (window.resizeWaveSimulator) window.resizeWaveSimulator();
        } else if (deckId === 'deck-coupler') {
          if (window.initCouplerChart) window.initCouplerChart();
          if (window.resizeCharts) window.resizeCharts();
        } else if (deckId === 'deck-antenna') {
          if (window.initAntennaChart) window.initAntennaChart();
          if (window.resizeCharts) window.resizeCharts();
        } else if (deckId === 'deck-radiation') {
          if (window.init3DRadiation) window.init3DRadiation();
          if (window.resize3DRadiation) window.resize3DRadiation();
        }
        window.dispatchEvent(new Event('resize'));
      }, 30);
    }
  }
  window.switchDeckView = switchDeckView;
})();

