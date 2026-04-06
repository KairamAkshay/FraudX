/* =====================================================
   FraudX — Main JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // ===== SIDEBAR TOGGLE (mobile) =====
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');

  if (sidebarToggle && sidebar) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('sidebar-overlay');
    document.body.appendChild(overlay);

    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    });

    overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }

  // ===== AUTO-DISMISS ALERTS =====
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      alert.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-8px)';
      setTimeout(function () { alert.remove(); }, 500);
    }, 5000);
  });

  // ===== RISK BAR ANIMATION =====
  const riskBars = document.querySelectorAll('.risk-bar');
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        setTimeout(function () {
          bar.style.transition = 'width 1s ease';
          bar.style.width = targetWidth;
        }, 100);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.1 });

  riskBars.forEach(function (bar) { observer.observe(bar); });

  // ===== METRIC COUNTER ANIMATION =====
  const metricValues = document.querySelectorAll('.metric-value');
  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.textContent, 10);
        if (!isNaN(target) && target > 0) {
          animateCounter(el, 0, target, 800);
        }
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  metricValues.forEach(function (el) { counterObserver.observe(el); });

  function animateCounter(el, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + range * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ===== SEARCH FILTER AUTO-SUBMIT =====
  const filterSelects = document.querySelectorAll('.search-bar select');
  filterSelects.forEach(function (select) {
    select.addEventListener('change', function () {
      const form = select.closest('form');
      if (form) form.submit();
    });
  });

  // ===== SIMULATE PAGE: radio card selection =====
  const radioCards = document.querySelectorAll('.radio-card input[type="radio"]');
  radioCards.forEach(function (radio) {
    radio.addEventListener('change', function () {
      radioCards.forEach(function (r) {
        r.closest('.radio-card').querySelector('.radio-body').style.transform = '';
      });
      if (this.checked) {
        this.closest('.radio-card').querySelector('.radio-body').style.transform = 'scale(1.02)';
      }
    });
  });

  // ===== HIGHLIGHT active nav on load =====
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(function (link) {
    if (link.getAttribute('href') === currentPath) {
      link.closest('.nav-item').classList.add('active');
    }
  });

  // ===== RESULT PANEL SCROLL INTO VIEW =====
  const resultPanel = document.getElementById('resultPanel');
  if (resultPanel) {
    setTimeout(function () {
      resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  // ===== TOOLTIP-like title enhancement =====
  const pulseDot = document.querySelector('.pulse-indicator');
  if (pulseDot) {
    pulseDot.title = 'FraudX System Active';
  }
});
