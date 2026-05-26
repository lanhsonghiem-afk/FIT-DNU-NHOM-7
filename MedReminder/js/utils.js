// ===== utils.js - Utilities =====

const Utils = (() => {
    // ── TOAST NOTIFICATIONS ──
    let toastContainer = null;

    function ensureToastContainer() {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        return toastContainer;
    }

    function showToast(message, type = 'primary', subtitle = '') {
        const container = ensureToastContainer();
        const icons = { primary: '💊', success: '✅', danger: '❌', warning: '⚠️' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
      <span class="toast-icon">${icons[type] || '💊'}</span>
      <div>
        <div class="toast-msg">${message}</div>
        ${subtitle ? `<div class="toast-sub">${subtitle}</div>` : ''}
      </div>
    `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 350);
        }, 3200);
    }

    // ── MODAL ──
    function openModal(id) {
        const overlay = document.getElementById(id);
        if (overlay) overlay.classList.add('open');
    }

    function closeModal(id) {
        const overlay = document.getElementById(id);
        if (overlay) overlay.classList.remove('open');
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }

    // Click outside modal to close
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('open');
        }
    });

    // ── FORMAT HELPERS ──
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN');
    }

    function formatDateTime() {
        return new Date().toLocaleString('vi-VN');
    }

    function getToday() {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        const now = new Date();
        return {
            dayName: days[now.getDay()],
            date: now.getDate(),
            month: months[now.getMonth()],
            year: now.getFullYear(),
            full: `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
            time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
    }

    function isExpiringSoon(dateStr, days = 30) {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = (d - now) / (1000 * 60 * 60 * 24);
        return diff <= days && diff >= 0;
    }

    function isExpired(dateStr) {
        return new Date(dateStr) < new Date();
    }

    // ── TABS ──
    function initTabs(containerSelector) {
        const containers = document.querySelectorAll(containerSelector);
        containers.forEach(container => {
            const buttons = container.querySelectorAll('.tab-btn');
            const contents = container.querySelectorAll('.tab-content');
            buttons.forEach((btn, i) => {
                btn.addEventListener('click', () => {
                    buttons.forEach(b => b.classList.remove('active'));
                    contents.forEach(c => c.classList.remove('active'));
                    btn.classList.add('active');
                    if (contents[i]) contents[i].classList.add('active');
                });
            });
        });
    }

    // ── TOGGLE ──
    function initToggles() {
        document.querySelectorAll('.toggle').forEach(toggle => {
            toggle.addEventListener('click', () => toggle.classList.toggle('on'));
        });
    }

    // ── SEARCH / FILTER TABLE ──
    function filterTable(inputEl, tableBodyEl) {
        const q = inputEl.value.toLowerCase();
        const rows = tableBodyEl.querySelectorAll('tr');
        rows.forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    }

    // ── CONFIRM DIALOG (simple) ──
    function confirm(message, onConfirm) {
        if (window.confirm(message)) onConfirm();
    }

    // ── DEBOUNCE ──
    function debounce(fn, ms = 300) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
    }

    // ── ANIMATE NUMBER ──
    function animateNumber(el, target, duration = 800) {
        const start = 0;
        const step = target / (duration / 16);
        let current = start;
        const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = Math.floor(current);
            if (current >= target) clearInterval(timer);
        }, 16);
    }

    // ── PROGRESS RING SVG ──
    function renderProgressRing(containerId, percent) {
        const el = document.getElementById(containerId);
        if (!el) return;
        const radius = 52;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percent / 100) * circumference;
        el.innerHTML = `
      <div class="progress-ring-container">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle class="progress-ring-bg" cx="65" cy="65" r="${radius}"/>
          <circle class="progress-ring-fill" cx="65" cy="65" r="${radius}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"/>
        </svg>
        <div class="progress-ring-text">
          <span class="progress-ring-percent">${percent}%</span>
          <span class="progress-ring-label">Tuân thủ</span>
        </div>
      </div>
    `;
    }

    return {
        showToast, openModal, closeModal, closeAllModals,
        formatDate, formatDateTime, getToday, isExpiringSoon, isExpired,
        initTabs, initToggles, filterTable, confirm, debounce,
        animateNumber, renderProgressRing,
    };
})();

window.Utils = Utils;