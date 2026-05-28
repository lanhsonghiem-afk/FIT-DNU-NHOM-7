// ============================================================
//  admin.js – Admin panel nâng cấp toàn diện
//  MedReminder – Đề tài 09
// ============================================================

let adminMeds = [];
let adminPatients = [];
let adminSchedules = [];
let editingMedId = null;
let editingPatId = null;
let editingSchedId = null;
let pendingDeleteFn = null;

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
    checkAuth();
    loadAdminData();
    // Set today as default date filter
    const today = getTodayString();
    const dInput = document.getElementById("filter-sched-date");
    if (dInput) dInput.value = today;
    $(".admin-main").hide().fadeIn(500);
});

function checkAuth() {
    const user = JSON.parse(sessionStorage.getItem("medreminder_user") || "null");
    if (!user || (user.role !== "admin" && user.role !== "doctor")) {
        window.location.href = "login.html"; return;
    }
    const el = document.getElementById("admin-username");
    if (el) el.textContent = user.name || user.username;
}

function logoutAdmin() {
    sessionStorage.removeItem("medreminder_user");
    window.location.href = "login.html";
}
window.logoutAdmin = logoutAdmin;

// ─── Sidebar ──────────────────────────────────────────────────
function toggleSidebar() {
    document.getElementById("admin-sidebar").classList.toggle("open");
    document.getElementById("sidebar-overlay").style.display = "block";
}
function closeSidebar() {
    document.getElementById("admin-sidebar").classList.remove("open");
    document.getElementById("sidebar-overlay").style.display = "none";
}
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;

// ─── Section navigation ────────────────────────────────────────
const SECTION_TITLES = { dashboard: "📊 Tổng quan", medications: "💊 Quản lý thuốc", patients: "👥 Bệnh nhân", schedules: "📅 Lịch uống thuốc", history: "📋 Lịch sử uống thuốc" };
function showSection(name, navEl) {
    document.querySelectorAll(".content-section").forEach(s => s.classList.remove("active"));
    const sec = document.getElementById("section-" + name);
    if (sec) { sec.classList.add("active"); $(sec).hide().fadeIn(300); }
    document.querySelectorAll(".nav-item[data-section]").forEach(n => n.classList.remove("active"));
    if (navEl) navEl.classList.add("active");
    const ttl = document.getElementById("topbar-title");
    if (ttl) ttl.textContent = SECTION_TITLES[name] || name;
    closeSidebar();
    // Lazy render
    if (name === "history") renderHistory();
    if (name === "patients") renderPatientCards();
}
window.showSection = showSection;

// ─── Load data ─────────────────────────────────────────────────
async function loadAdminData() {
    try {
        const [meds, patients, schedules] = await Promise.all([getMedications(), getPatients(), getSchedules()]);
        adminMeds = meds; adminPatients = patients; adminSchedules = schedules;
        renderDashboard();
        renderMedTable();
        renderPatientCards();
        renderScheduleTable();
        populateFilterSelects();
    } catch (err) {
        console.error("loadAdminData:", err);
        showToast("Không thể tải dữ liệu!", "error");
    }
}

// ─── Populate selects ──────────────────────────────────────────
function populateFilterSelects() {
    // Schedule modal
    const patSel = document.getElementById("sched-patientId");
    const medSel = document.getElementById("sched-medicationId");
    if (patSel) patSel.innerHTML = `<option value="">-- Chọn bệnh nhân --</option>` + adminPatients.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
    if (medSel) medSel.innerHTML = `<option value="">-- Chọn thuốc --</option>` + adminMeds.map(m => `<option value="${m.id}">${m.name}</option>`).join("");
    // Schedule filter
    const fPat = document.getElementById("filter-sched-patient");
    if (fPat) fPat.innerHTML = `<option value="">Tất cả bệnh nhân</option>` + adminPatients.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
    // History filters
    const hPat = document.getElementById("hist-patient");
    if (hPat) hPat.innerHTML = `<option value="">Tất cả bệnh nhân</option>` + adminPatients.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
}

// ─── DASHBOARD ─────────────────────────────────────────────────
function renderDashboard() {
    const today = getTodayString();
    const todayScheds = adminSchedules.filter(s => s.date && s.date.startsWith(today));
    const taken = todayScheds.filter(s => s.status === "taken").length;
    const missed = todayScheds.filter(s => s.status === "missed").length;
    const pending = todayScheds.filter(s => s.status === "pending").length;
    const total = todayScheds.length;
    const pct = total > 0 ? Math.round((taken / total) * 100) : 0;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("dash-meds", adminMeds.length); set("dash-patients", adminPatients.length);
    set("dash-schedules", total); set("dash-taken", taken); set("dash-missed", missed); set("dash-pending", pending);
    set("dash-pct", pct + "%");
    const bar = document.getElementById("dash-progress");
    if (bar) bar.style.width = pct + "%";
    // Today's schedule table
    const tbody = document.getElementById("dash-sched-body");
    if (!tbody) return;
    if (todayScheds.length === 0) { tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4" style="color:var(--text-muted)">Không có lịch hôm nay</td></tr>`; return; }
    tbody.innerHTML = todayScheds.sort((a, b) => (a.time || "").localeCompare(b.time || "")).map(s => {
        const p = adminPatients.find(p => String(p.id) === String(s.patientId));
        return `<tr>
            <td>${getMedIcon(s.type || "")} <strong>${s.medicationName || s.name || "—"}</strong></td>
            <td>${p ? p.name : (s.patientName || "—")}</td>
            <td>${formatTime(s.time)}</td>
            <td>${s.dosage || "—"}</td>
            <td style="max-width:150px;font-size:.78rem;color:var(--text-muted)">${s.note || "—"}</td>
            <td>${getStatusBadge(s.status)}</td>
        </tr>`;
    }).join("");
}

// ─── MEDICATIONS ───────────────────────────────────────────────
function renderMedTable(filter = "") {
    const tbody = document.getElementById("med-tbody");
    if (!tbody) return;
    let list = [...adminMeds];
    if (filter) list = list.filter(m => (m.name || "").toLowerCase().includes(filter.toLowerCase()) || (m.category || "").toLowerCase().includes(filter.toLowerCase()));
    if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="color:var(--text-muted);padding:32px">Không có dữ liệu</td></tr>`; return; }
    tbody.innerHTML = list.map(m => `<tr>
        <td>${getMedIcon(m.type)} <strong>${m.name}</strong></td>
        <td>${m.category || "—"}</td>
        <td>${m.dosage || "—"}</td>
        <td>${m.frequency || "—"}</td>
        <td style="max-width:160px;font-size:.78rem;color:var(--text-muted)">${m.note || "—"}</td>
        <td><span style="color:${(m.stock || 0) < 10 ? 'var(--accent)' : 'var(--primary)'}">
            ${m.stock ?? 0} ${m.unit || "viên"} ${(m.stock || 0) < 10 ? ' ⚠️' : ''}
        </span></td>
        <td>${getStatusBadge(m.status || "active")}</td>
        <td>
            <button class="btn-a-secondary" style="padding:5px 10px;font-size:.76rem;margin-right:4px" onclick="openEditMed('${m.id}')">✏️ Sửa</button>
            <button class="btn-a-danger" style="padding:5px 10px;font-size:.76rem" onclick="confirmDelete('Xóa thuốc','Xóa thuốc <b>${m.name}</b>? Hành động này không thể hoàn tác.',()=>deleteMedAction('${m.id}'))">🗑️</button>
        </td>
    </tr>`).join("");
}
window.renderMedTable = renderMedTable;

function openAddMed() {
    editingMedId = null;
    document.getElementById("med-form").reset();
    document.getElementById("med-id-hidden").value = "";
    document.getElementById("med-modal-title").textContent = "➕ Thêm thuốc mới";
    new bootstrap.Modal(document.getElementById("medModal")).show();
}
function openEditMed(id) {
    const med = adminMeds.find(m => String(m.id) === String(id));
    if (!med) return;
    editingMedId = id;
    document.getElementById("med-modal-title").textContent = "✏️ Chỉnh sửa thuốc";
    document.getElementById("med-id-hidden").value = id;
    const f = (fieldId, val) => { const el = document.getElementById(fieldId); if (el) el.value = Array.isArray(val) ? val.join(", ") : (val ?? ""); };
    f("med-name", med.name); f("med-category", med.category); f("med-type", med.type);
    f("med-dosage", med.dosage); f("med-frequency", med.frequency);
    f("med-times", med.times); f("med-stock", med.stock); f("med-unit", med.unit);
    f("med-note", med.note); f("med-status", med.status);
    new bootstrap.Modal(document.getElementById("medModal")).show();
}
async function submitMedForm() {
    const name = document.getElementById("med-name");
    if (!name.value.trim()) { name.classList.add("is-invalid"); return; }
    name.classList.remove("is-invalid");
    const payload = {
        name: document.getElementById("med-name").value.trim(),
        category: document.getElementById("med-category").value.trim(),
        type: document.getElementById("med-type").value,
        dosage: document.getElementById("med-dosage").value.trim(),
        frequency: document.getElementById("med-frequency").value.trim(),
        times: document.getElementById("med-times").value.split(",").map(t => t.trim()).filter(Boolean),
        stock: parseInt(document.getElementById("med-stock").value) || 0,
        unit: document.getElementById("med-unit").value.trim() || "viên",
        note: document.getElementById("med-note").value.trim(),
        status: document.getElementById("med-status").value,
    };
    try {
        if (editingMedId) { await updateMedication(editingMedId, payload); showToast("Đã cập nhật thuốc!", "success"); }
        else { await createMedication(payload); showToast("Đã thêm thuốc mới!", "success"); }
        bootstrap.Modal.getInstance(document.getElementById("medModal"))?.hide();
        await loadAdminData();
    } catch { showToast("Lỗi khi lưu thuốc!", "error"); }
}
async function deleteMedAction(id) {
    try { await deleteMedication(id); showToast("Đã xóa thuốc!", "success"); await loadAdminData(); }
    catch { showToast("Lỗi khi xóa thuốc!", "error"); }
}
window.openAddMed = openAddMed;
window.openEditMed = openEditMed;
window.submitMedForm = submitMedForm;

// ─── PATIENTS ──────────────────────────────────────────────────
function renderPatientCards(filter = "") {
    const grid = document.getElementById("patient-grid");
    if (!grid) return;
    let list = [...adminPatients];
    if (filter) list = list.filter(p => (p.name || "").toLowerCase().includes(filter.toLowerCase()));
    if (list.length === 0) { grid.innerHTML = `<div class="col-12 text-center" style="color:var(--text-muted);padding:40px">Không có bệnh nhân nào</div>`; return; }
    grid.innerHTML = list.map(p => {
        const schedCount = adminSchedules.filter(s => String(s.patientId) === String(p.id)).length;
        const takenCount = adminSchedules.filter(s => String(s.patientId) === String(p.id) && s.status === "taken").length;
        const pct = schedCount > 0 ? Math.round((takenCount / schedCount) * 100) : 0;
        return `<div class="col-md-6 col-lg-4">
            <div class="patient-card">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="patient-avatar">${p.gender === "female" ? "👩" : "👨"}</div>
                    <div class="flex-grow-1">
                        <div style="font-family:'Sora',sans-serif;font-weight:700;font-size:.95rem">${p.name}</div>
                        <div style="font-size:.78rem;color:var(--text-muted)">${p.phone || "Chưa có SĐT"}</div>
                        ${getStatusBadge(p.status || "active")}
                    </div>
                </div>
                <div style="font-size:.82rem;color:var(--text-secondary);line-height:1.8">
                    ${p.diagnosis ? `<div>🩺 <strong>Bệnh lý:</strong> ${p.diagnosis}</div>` : ""}
                    ${p.allergy ? `<div>⚠️ <strong>Dị ứng:</strong> ${p.allergy}</div>` : ""}
                    <div>💊 Tổng lịch: <strong>${schedCount}</strong> · Đã uống: <strong style="color:var(--primary)">${takenCount}</strong></div>
                    <div>📈 Tuân thủ: <strong style="color:${pct >= 80 ? 'var(--primary)' : 'var(--accent)'}">${pct}%</strong></div>
                </div>
                ${p.note ? `<div class="note-box">📝 ${p.note}</div>` : ""}
                <div class="d-flex gap-2 mt-3">
                    <button class="btn-a-secondary flex-grow-1" onclick="openEditPatient('${p.id}')">✏️ Sửa</button>
                    <button class="btn-a-primary flex-grow-1" onclick="viewPatientHistory('${p.id}','${p.name}')">📋 Lịch sử</button>
                    <button class="btn-a-danger" onclick="confirmDelete('Xóa bệnh nhân','Xóa <b>${p.name}</b>?',()=>deletePatientAction('${p.id}'))">🗑️</button>
                </div>
            </div>
        </div>`;
    }).join("");
}
window.renderPatientCards = renderPatientCards;

function openAddPatient() {
    editingPatId = null;
    document.getElementById("patient-form").reset();
    document.getElementById("pat-id-hidden").value = "";
    document.getElementById("pat-modal-title").textContent = "👤 Thêm bệnh nhân";
    new bootstrap.Modal(document.getElementById("patientModal")).show();
}
function openEditPatient(id) {
    const p = adminPatients.find(p => String(p.id) === String(id));
    if (!p) return;
    editingPatId = id;
    document.getElementById("pat-modal-title").textContent = "✏️ Chỉnh sửa bệnh nhân";
    document.getElementById("pat-id-hidden").value = id;
    const f = (fId, val) => { const el = document.getElementById(fId); if (el) el.value = val ?? ""; };
    f("pat-name", p.name); f("pat-phone", p.phone); f("pat-dob", p.dob);
    f("pat-gender", p.gender); f("pat-status", p.status);
    f("pat-diagnosis", p.diagnosis); f("pat-allergy", p.allergy); f("pat-note", p.note);
    new bootstrap.Modal(document.getElementById("patientModal")).show();
}
async function submitPatientForm() {
    const name = document.getElementById("pat-name");
    if (!name.value.trim()) { name.classList.add("is-invalid"); return; }
    name.classList.remove("is-invalid");
    const payload = {
        name: document.getElementById("pat-name").value.trim(),
        phone: document.getElementById("pat-phone").value.trim(),
        dob: document.getElementById("pat-dob").value,
        gender: document.getElementById("pat-gender").value,
        status: document.getElementById("pat-status").value,
        diagnosis: document.getElementById("pat-diagnosis").value.trim(),
        allergy: document.getElementById("pat-allergy").value.trim(),
        note: document.getElementById("pat-note").value.trim(),
    };
    try {
        if (editingPatId) { await updatePatient(editingPatId, payload); showToast("Đã cập nhật bệnh nhân!", "success"); }
        else { await createPatient(payload); showToast("Đã thêm bệnh nhân!", "success"); }
        bootstrap.Modal.getInstance(document.getElementById("patientModal"))?.hide();
        await loadAdminData();
    } catch { showToast("Lỗi khi lưu bệnh nhân!", "error"); }
}
async function deletePatientAction(id) {
    try { await deletePatient(id); showToast("Đã xóa bệnh nhân!", "success"); await loadAdminData(); }
    catch { showToast("Lỗi khi xóa!", "error"); }
}
function viewPatientHistory(patId, patName) {
    const scheds = adminSchedules.filter(s => String(s.patientId) === String(patId));
    const tbody = document.getElementById("pat-hist-tbody");
    document.getElementById("pat-hist-title").textContent = `📋 Lịch sử – ${patName}`;
    if (scheds.length === 0) { tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color:var(--text-muted)">Chưa có lịch sử nào</td></tr>`; }
    else {
        tbody.innerHTML = scheds.sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.time || "").localeCompare(b.time || "")).map(s => `<tr>
            <td>${formatDate(s.date)}</td>
            <td>${s.medicationName || s.name || "—"}</td>
            <td>${formatTime(s.time)}</td>
            <td>${s.dosage || "—"}</td>
            <td style="font-size:.78rem;color:var(--text-muted)">${s.note || "—"}</td>
            <td>${getStatusBadge(s.status)}</td>
            <td style="font-size:.78rem">${s.takenAt ? formatDateTime(s.takenAt) : "—"}</td>
        </tr>`).join("");
    }
    new bootstrap.Modal(document.getElementById("patHistModal")).show();
}
window.openAddPatient = openAddPatient;
window.openEditPatient = openEditPatient;
window.submitPatientForm = submitPatientForm;
window.viewPatientHistory = viewPatientHistory;

// ─── SCHEDULES ─────────────────────────────────────────────────
function renderScheduleTable() {
    const tbody = document.getElementById("sched-tbody");
    if (!tbody) return;
    const dateFilter = document.getElementById("filter-sched-date")?.value || "";
    const patFilter = document.getElementById("filter-sched-patient")?.value || "";
    let list = [...adminSchedules];
    if (dateFilter) list = list.filter(s => s.date && s.date.startsWith(dateFilter));
    if (patFilter) list = list.filter(s => String(s.patientId) === String(patFilter));
    list.sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.time || "").localeCompare(b.time || ""));
    if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4" style="color:var(--text-muted)">Không có dữ liệu</td></tr>`; return; }
    tbody.innerHTML = list.map(s => {
        const p = adminPatients.find(p => String(p.id) === String(s.patientId));
        return `<tr>
            <td>${getMedIcon(s.type || "")} ${s.medicationName || s.name || "—"}</td>
            <td>${p ? p.name : (s.patientName || "—")}</td>
            <td>${formatDate(s.date)}</td>
            <td>${formatTime(s.time)}</td>
            <td>${s.dosage || "—"}</td>
            <td style="max-width:140px;font-size:.78rem;color:var(--text-muted)">${s.note || "—"}</td>
            <td>${getStatusBadge(s.status)}</td>
            <td>
                <button class="btn-a-secondary" style="padding:5px 10px;font-size:.76rem;margin-right:4px" onclick="openEditSchedule('${s.id}')">✏️</button>
                <button class="btn-a-danger" style="padding:5px 10px;font-size:.76rem" onclick="confirmDelete('Xóa lịch','Xóa lịch uống thuốc này?',()=>deleteSchedAction('${s.id}'))">🗑️</button>
            </td>
        </tr>`;
    }).join("");
}
window.renderScheduleTable = renderScheduleTable;

function openAddSchedule() {
    editingSchedId = null;
    document.getElementById("schedule-form").reset();
    document.getElementById("sched-id-hidden").value = "";
    document.getElementById("sched-modal-title").textContent = "📅 Thêm lịch uống thuốc";
    document.getElementById("sched-date").value = getTodayString();
    new bootstrap.Modal(document.getElementById("scheduleModal")).show();
}
function openEditSchedule(id) {
    const s = adminSchedules.find(s => String(s.id) === String(id));
    if (!s) return;
    editingSchedId = id;
    document.getElementById("sched-modal-title").textContent = "✏️ Chỉnh sửa lịch";
    document.getElementById("sched-id-hidden").value = id;
    const f = (fId, val) => { const el = document.getElementById(fId); if (el) el.value = val ?? ""; };
    f("sched-patientId", s.patientId); f("sched-medicationId", s.medicationId);
    f("sched-date", s.date ? s.date.split("T")[0] : "");
    f("sched-time", s.time); f("sched-dosage", s.dosage);
    f("sched-status", s.status); f("sched-note", s.note);
    new bootstrap.Modal(document.getElementById("scheduleModal")).show();
}
function autoFillMed() {
    const medId = document.getElementById("sched-medicationId")?.value;
    if (!medId) return;
    const med = adminMeds.find(m => String(m.id) === String(medId));
    if (med) {
        const dosEl = document.getElementById("sched-dosage");
        if (dosEl && !dosEl.value) dosEl.value = med.dosage || "";
    }
}
async function submitScheduleForm() {
    const patId = document.getElementById("sched-patientId");
    const medId = document.getElementById("sched-medicationId");
    const date = document.getElementById("sched-date");
    const time = document.getElementById("sched-time");
    let valid = true;
    [patId, medId, date, time].forEach(el => {
        if (!el?.value) { el.classList.add("is-invalid"); valid = false; }
        else el.classList.remove("is-invalid");
    });
    if (!valid) return;
    const med = adminMeds.find(m => String(m.id) === String(medId.value));
    const pat = adminPatients.find(p => String(p.id) === String(patId.value));
    const payload = {
        patientId: patId.value, medicationId: medId.value,
        medicationName: med ? med.name : "",
        patientName: pat ? pat.name : "",
        date: date.value, time: time.value,
        dosage: document.getElementById("sched-dosage").value.trim() || (med ? med.dosage : ""),
        status: document.getElementById("sched-status").value,
        note: document.getElementById("sched-note").value.trim(),
    };
    try {
        if (editingSchedId) { await updateSchedule(editingSchedId, payload); showToast("Đã cập nhật lịch!", "success"); }
        else { await createSchedule(payload); showToast("Đã thêm lịch uống thuốc!", "success"); }
        bootstrap.Modal.getInstance(document.getElementById("scheduleModal"))?.hide();
        await loadAdminData();
    } catch { showToast("Lỗi khi lưu lịch!", "error"); }
}
async function deleteSchedAction(id) {
    try { await deleteSchedule(id); showToast("Đã xóa lịch!", "success"); await loadAdminData(); }
    catch { showToast("Lỗi khi xóa!", "error"); }
}
window.openAddSchedule = openAddSchedule;
window.openEditSchedule = openEditSchedule;
window.autoFillMed = autoFillMed;
window.submitScheduleForm = submitScheduleForm;

// ─── HISTORY ───────────────────────────────────────────────────
function renderHistory() {
    const tbody = document.getElementById("history-tbody");
    if (!tbody) return;
    const patFilter = document.getElementById("hist-patient")?.value || "";
    const statusFilter = document.getElementById("hist-status")?.value || "";
    const dateFrom = document.getElementById("hist-date-from")?.value || "";
    const dateTo = document.getElementById("hist-date-to")?.value || "";
    let list = [...adminSchedules];
    if (patFilter) list = list.filter(s => String(s.patientId) === String(patFilter));
    if (statusFilter) list = list.filter(s => s.status === statusFilter);
    if (dateFrom) list = list.filter(s => s.date && s.date >= dateFrom);
    if (dateTo) list = list.filter(s => s.date && s.date <= dateTo + "T23:59");
    list.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.time || "").localeCompare(a.time || ""));
    if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4" style="color:var(--text-muted)">Không có dữ liệu</td></tr>`; }
    else {
        tbody.innerHTML = list.map(s => {
            const p = adminPatients.find(p => String(p.id) === String(s.patientId));
            return `<tr>
                <td>${formatDate(s.date)}</td>
                <td>${getMedIcon(s.type || "")} ${s.medicationName || s.name || "—"}</td>
                <td>${p ? p.name : (s.patientName || "—")}</td>
                <td>${formatTime(s.time)}</td>
                <td>${s.takenAt ? formatDateTime(s.takenAt) : "—"}</td>
                <td>${s.dosage || "—"}</td>
                <td style="max-width:130px;font-size:.78rem;color:var(--text-muted)">${s.note || "—"}</td>
                <td>${getStatusBadge(s.status)}</td>
            </tr>`;
        }).join("");
    }
    // Summary
    const taken = list.filter(s => s.status === "taken").length;
    const missed = list.filter(s => s.status === "missed").length;
    const pct = list.length > 0 ? Math.round((taken / list.length) * 100) : 0;
    const summary = document.getElementById("history-summary");
    if (summary) summary.innerHTML = `Tổng: <strong>${list.length}</strong> · Đã uống: <strong style="color:var(--primary)">${taken}</strong> · Bỏ lỡ: <strong style="color:var(--accent)">${missed}</strong> · Tỉ lệ tuân thủ: <strong style="color:${pct >= 80 ? 'var(--primary)' : 'var(--accent)'}">${pct}%</strong>`;
}
function resetHistoryFilter() {
    ["hist-patient", "hist-status", "hist-date-from", "hist-date-to"].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    renderHistory();
}
window.renderHistory = renderHistory;
window.resetHistoryFilter = resetHistoryFilter;

// ─── Confirm delete modal ──────────────────────────────────────
function confirmDelete(title, msg, onConfirm) {
    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-msg").innerHTML = msg;
    pendingDeleteFn = onConfirm;
    const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
    modal.show();
    document.getElementById("confirm-ok-btn").onclick = () => { onConfirm(); modal.hide(); };
}
window.confirmDelete = confirmDelete;

// ─── showToast override for admin ─────────────────────────────
window.showToast = function (message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const id = "toast-" + Date.now();
    const colors = { success: "rgba(76,175,80,0.3)", error: "rgba(255,107,157,0.3)", info: "rgba(0,212,170,0.3)" };
    const div = document.createElement("div");
    div.id = id;
    div.style.cssText = `background:rgba(6,16,32,0.97);border:1px solid ${colors[type] || colors.info};border-radius:12px;padding:12px 18px;color:#f0f8ff;font-size:.87rem;font-weight:500;margin-bottom:8px;box-shadow:0 8px 24px rgba(0,0,0,0.4);animation:slideIn .3s ease;max-width:320px`;
    div.innerHTML = message;
    container.appendChild(div);
    setTimeout(() => { div.style.opacity = "0"; div.style.transition = "opacity .3s"; setTimeout(() => div.remove(), 300); }, 3000);
};
