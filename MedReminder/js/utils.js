// ============================================================
//  utils.js – Hàm tiện ích dùng chung
//  MedReminder – Đề tài 09
// ============================================================

// ─── Ngày / giờ ──────────────────────────────────────────────
function getTodayString() {
    return new Date().toISOString().split("T")[0];
}

function formatTime(timeStr) {
    if (!timeStr) return "—";
    return timeStr.length === 5 ? timeStr : timeStr.substring(0, 5);
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
}

function formatDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN");
}

// ─── Icon theo loại thuốc ─────────────────────────────────────
function getMedIcon(type = "") {
    const t = type.toLowerCase();
    if (t.includes("viên nang")) return "💊";
    if (t.includes("viên nén")) return "⬛";
    if (t.includes("siro") || t.includes("dung dịch")) return "🧴";
    if (t.includes("ống tiêm") || t.includes("tiêm")) return "💉";
    if (t.includes("nhỏ mắt")) return "👁️";
    if (t.includes("kem") || t.includes("gel")) return "🧪";
    return "💊";
}

// ─── Badge trạng thái ─────────────────────────────────────────
function getStatusBadge(status) {
    const map = {
        taken: { cls: "badge-taken", label: "Đã uống" },
        pending: { cls: "badge-pending", label: "Chờ uống" },
        missed: { cls: "badge-missed", label: "Bỏ lỡ" },
        active: { cls: "badge-active", label: "Đang dùng" },
        inactive: { cls: "badge-missed", label: "Ngừng" },
    };
    const s = map[status] || { cls: "badge-pending", label: status };
    return `<span class="badge-status ${s.cls}">${s.label}</span>`;
}

// ─── Loading skeleton ─────────────────────────────────────────
function showLoading(containerId, rows = 3) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = Array(rows).fill(0).map(() => `
        <div class="skeleton-block mb-3" style="height:80px;border-radius:12px"></div>
    `).join("");
}

// ─── Toast thông báo ─────────────────────────────────────────
function showToast(message, type = "info") {
    const toastEl = document.getElementById("liveToast");
    const toastBody = document.getElementById("toast-body");
    if (!toastEl || !toastBody) return;

    toastEl.className = `toast toast-med toast-${type}`;
    toastBody.textContent = message;

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 });
    toast.show();
}

// ─── Debounce ─────────────────────────────────────────────────
function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ─── Validate form ────────────────────────────────────────────
/**
 * rules: [{ field: 'name', check: (v) => v.trim() !== '', msg: 'Không được để trống' }]
 * Trả về true nếu hợp lệ
 */
function validateForm(formId, rules) {
    let valid = true;
    // Reset
    document.querySelectorAll(`#${formId} .form-control-med`).forEach(el => {
        el.classList.remove("is-invalid");
    });
    document.querySelectorAll(`#${formId} .invalid-feedback-med`).forEach(el => {
        el.style.display = "none";
    });

    rules.forEach(({ fieldId, check, msg }) => {
        const el = document.getElementById(fieldId);
        if (!el) return;
        const val = el.value;
        if (!check(val)) {
            el.classList.add("is-invalid");
            const errEl = el.nextElementSibling;
            if (errEl && errEl.classList.contains("invalid-feedback-med")) {
                errEl.textContent = msg;
                errEl.style.display = "block";
            }
            valid = false;
        }
    });
    return valid;
}

// ─── Reset form ───────────────────────────────────────────────
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
    document.querySelectorAll(`#${formId} .form-control-med`).forEach(el => {
        el.classList.remove("is-invalid", "is-valid");
    });
    document.querySelectorAll(`#${formId} .invalid-feedback-med`).forEach(el => {
        el.style.display = "none";
    });
}

// ─── Export global ───────────────────────────────────────────
window.getTodayString = getTodayString;
window.formatTime = formatTime;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getMedIcon = getMedIcon;
window.getStatusBadge = getStatusBadge;
window.showLoading = showLoading;
window.showToast = showToast;
window.debounce = debounce;
window.validateForm = validateForm;
window.resetForm = resetForm;
