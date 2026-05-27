// =======================
// API
// =======================
const API_patients_URL = "https://69f9a6bcc509a40d3aa2ef52.mockapi.io/api/v1/patients";
const API_medications_URL = "https://69f9a6bcc509a40d3aa2ef52.mockapi.io/api/v1/medications";
const API_schedules_URL = "https://6a14718d6c7db8aac05489f6.mockapi.io/api/v1/schedules";
const API_users_URL = "https://69f9a6bcc509a40d3aa2ef52.mockapi.io/api/v1/users";

// =======================
// STATE
// =======================
let patients = [];
let meds = [];
let schedules = [];

// =======================
// USER
// =======================
function getUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLogin");
    location.reload();
}

// =======================
// LẤY PATIENT CỦA USER HIỆN TẠI
// =======================
function getCurrentPatient() {
    const user = getUser();
    if (!user || !patients.length) return null;

    if (user.role === "admin") return null;

    return patients.find(p =>
        (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase()) ||
        (p.name && user.name && p.name.toLowerCase() === user.name.toLowerCase()) ||
        (p.name && user.username && p.name.toLowerCase() === user.username.toLowerCase()) ||
        (p.username && user.username && p.username.toLowerCase() === user.username.toLowerCase())
    ) || null;
}

// =======================
// LỌC SCHEDULES THEO USER
// =======================
function getFilteredSchedules() {
    const user = getUser();
    if (!user) return [];

    if (user.role === "admin") return schedules;

    const patient = getCurrentPatient();

    if (patient) {
        return schedules.filter(s => String(s.patientId) === String(patient.id));
    }

    return [];
}

// =======================
// INIT
// =======================
window.addEventListener("DOMContentLoaded", () => {
    updateLoginBtn();
});

// =======================
// CẬP NHẬT NÚT TOPBAR
// =======================
function updateLoginBtn() {
    const user = getUser();
    const btn = document.getElementById("loginBtn");
    if (!btn) return;

    if (user) {
        btn.style.display = "none";

        if (!document.getElementById("logoutBtn")) {
            const el = document.createElement("div");
            el.id = "logoutBtn";
            el.style.cssText = "display:flex;align-items:center;gap:10px;font-size:14px;";
            el.innerHTML = `
                <span style="font-weight:600;color:#374151;">
                    👤 ${user.name || user.username || user.email || "Tài khoản"}
                </span>
                <button onclick="logout()" style="
                    padding:6px 14px;border:none;border-radius:8px;
                    background:#fee2e2;color:#dc2626;
                    font-size:13px;font-weight:600;cursor:pointer;
                ">Đăng xuất</button>
            `;
            btn.parentNode.insertBefore(el, btn.nextSibling);
        }
    } else {
        btn.style.display = "";
        btn.onclick = () => goLogin();
    }
}

// =======================
// LOAD DATA
// =======================
async function loadData() {
    const [p, m, s] = await Promise.all([
        fetch(API_patients_URL).then(r => r.json()),
        fetch(API_medications_URL).then(r => r.json()),
        fetch(API_schedules_URL).then(r => r.json())
    ]);
    patients = p;
    meds = m;
    schedules = s;
}

// =======================
// ĐÁNH DẤU ĐÃ UỐNG
// =======================
async function markAsTaken(scheduleId) {
    const btn = document.querySelector(`[data-id="${scheduleId}"]`);
    if (btn) { btn.disabled = true; btn.textContent = "Đang lưu..."; }

    try {
        const res = await fetch(`${API_schedules_URL}/${scheduleId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: true })
        });
        if (!res.ok) throw new Error();

        const idx = schedules.findIndex(s => s.id == scheduleId);
        if (idx !== -1) schedules[idx].status = true;
        renderSchedules();
    } catch {
        alert("❌ Không thể lưu. Vui lòng thử lại!");
        if (btn) { btn.disabled = false; btn.textContent = "💊 Đã uống"; }
    }
}

// =======================
// RENDER LỊCH UỐNG THUỐC
// =======================
function renderSchedules() {
    const section = document.getElementById("scheduleSection");
    if (!section) return;

    const user = getUser();
    const patient = getCurrentPatient();
    const mySchedules = getFilteredSchedules();

    const total = mySchedules.length;
    const done = mySchedules.filter(s => s.status).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const barColor = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";

    const displayName = patient?.name || user?.name || user?.username || user?.email || "bạn";

    const noPatientWarning = (!patient && user?.role !== "admin")
        ? `<div style="
                padding:12px 16px;margin-bottom:16px;
                background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;
                color:#92400e;font-size:14px;
           ">
               ⚠️ Tài khoản <strong>${displayName}</strong> chưa được liên kết với bệnh nhân nào trong hệ thống.
               Vui lòng liên hệ quản trị viên.
           </div>`
        : "";

    // ✅ FIX: Group schedules theo ngày, sắp xếp ngày tăng dần
    const byDate = {};
    mySchedules.forEach(s => {
        (byDate[s.date] ??= []).push(s);
    });
    const sortedDates = Object.keys(byDate).sort();

    const daysHtml = sortedDates.length === 0
        ? `<p style="text-align:center;color:#888;padding:40px;">Không có lịch uống thuốc nào.</p>`
        : sortedDates.map(date => {
            const daySchedules = byDate[date];
            const dayDone = daySchedules.filter(s => s.status).length;
            const dayTotal = daySchedules.length;

            const cardsHtml = daySchedules.map(s => {
                const p = patients.find(x => x.id == s.patientId);
                const m = meds.find(x => x.id == s.medicationId);
                const isDone = s.status;
                return `
                    <div style="
                        display:flex;align-items:center;justify-content:space-between;gap:12px;
                        padding:16px 20px;
                        background:${isDone ? "#f0fdf4" : "#fff"};
                        border:1px solid ${isDone ? "#86efac" : "#e5e7eb"};
                        border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,0.05);
                    ">
                        <div style="flex:1;">
                            <div style="font-size:15px;font-weight:600;margin-bottom:6px;color:${isDone ? "#15803d" : "#111827"};">
                                💊 ${m?.name || "N/A"}
                                <span style="
                                    font-size:11px;font-weight:500;padding:2px 8px;
                                    border-radius:999px;margin-left:8px;
                                    background:${isDone ? "#dcfce7" : "#fef3c7"};
                                    color:${isDone ? "#16a34a" : "#d97706"};
                                ">${isDone ? "✅ Đã uống" : "⏳ Chưa uống"}</span>
                            </div>
                            <div style="display:flex;gap:16px;flex-wrap:wrap;">
                                <span style="font-size:13px;color:#6b7280;">👤 ${p?.name || "N/A"}</span>
                                <span style="font-size:13px;color:#6b7280;">🕐 ${s.time}</span>
                                ${m?.dosage ? `<span style="font-size:13px;color:#6b7280;">💉 ${m.dosage}</span>` : ""}
                                ${m?.description ? `<span style="font-size:13px;color:#6b7280;">📝 ${m.description}</span>` : ""}
                            </div>
                        </div>
                        ${isDone
                        ? `<div style="padding:8px 16px;border-radius:8px;background:#dcfce7;color:#16a34a;font-size:14px;font-weight:600;white-space:nowrap;">✅ Hoàn thành</div>`
                        : `<button data-id="${s.id}" onclick="markAsTaken('${s.id}')"
                                    style="padding:8px 16px;border:none;border-radius:8px;background:#2563eb;color:#fff;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;"
                                    onmouseover="this.style.background='#1d4ed8'"
                                    onmouseout="this.style.background='#2563eb'"
                               >💊 Đã uống</button>`
                    }
                    </div>
                `;
            }).join("");

            return `
                <div style="margin-bottom:24px;">
                    <div style="
                        display:flex;align-items:center;justify-content:space-between;
                        margin-bottom:12px;padding-bottom:8px;
                        border-bottom:2px solid #e5e7eb;
                    ">
                        <h3 style="margin:0;font-size:16px;color:#374151;">📅 ${date}</h3>
                        <span style="
                            font-size:12px;font-weight:600;padding:3px 10px;
                            border-radius:999px;
                            background:${dayDone === dayTotal ? "#dcfce7" : "#fef3c7"};
                            color:${dayDone === dayTotal ? "#16a34a" : "#d97706"};
                        ">${dayDone}/${dayTotal} đã uống</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;">
                        ${cardsHtml}
                    </div>
                </div>
            `;
        }).join("");

    section.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
                <h2 style="margin:0;font-size:20px;">📅 Lịch uống thuốc</h2>
                <p style="margin:4px 0 0;color:#666;font-size:14px;">
                    Xin chào, <strong>${displayName}</strong>
                    ${user?.role === "admin" ? "<span style='background:#ede9fe;color:#7c3aed;padding:2px 8px;border-radius:999px;font-size:11px;margin-left:6px;'>Admin</span>" : ""}
                    — còn <strong>${total - done}</strong> thuốc chưa uống hôm nay
                </p>
            </div>
            <div style="text-align:right;">
                <span style="font-size:28px;font-weight:700;color:${barColor};">${pct}%</span>
                <p style="margin:0;color:#888;font-size:12px;">hoàn thành</p>
            </div>
        </div>

        <div style="background:#e5e7eb;border-radius:999px;height:10px;margin-bottom:20px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:${barColor};border-radius:999px;transition:width 0.5s;"></div>
        </div>

        <div style="display:flex;gap:12px;margin-bottom:24px;">
            <div style="flex:1;padding:12px 16px;text-align:center;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;">
                <div style="font-size:22px;font-weight:700;color:#16a34a;">${done}</div>
                <div style="font-size:12px;color:#15803d;">✅ Đã uống</div>
            </div>
            <div style="flex:1;padding:12px 16px;text-align:center;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;">
                <div style="font-size:22px;font-weight:700;color:#d97706;">${total - done}</div>
                <div style="font-size:12px;color:#b45309;">⏳ Chưa uống</div>
            </div>
            <div style="flex:1;padding:12px 16px;text-align:center;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;">
                <div style="font-size:22px;font-weight:700;color:#2563eb;">${total}</div>
                <div style="font-size:12px;color:#1d4ed8;">💊 Tổng lịch</div>
            </div>
        </div>

        ${noPatientWarning}

        ${daysHtml}
    `;
}

// =======================
// RENDER BÁO CÁO
// =======================
function renderReport() {
    const section = document.getElementById("reportSection");
    if (!section) return;

    const mySchedules = getFilteredSchedules();
    const total = mySchedules.length;
    const done = mySchedules.filter(s => s.status).length;
    const pending = total - done;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;

    const user = getUser();
    const patient = getCurrentPatient();
    const patientCount = user?.role === "admin" ? patients.length : (patient ? 1 : 0);

    // ✅ FIX: Đếm số loại thuốc thực sự trong lịch của user, không dùng meds.length
    const uniqueMedCount = new Set(mySchedules.map(s => s.medicationId)).size;

    section.innerHTML = `
        <div class="section-header"><h2>📊 Báo cáo sức khỏe</h2></div>
        <div class="report-grid">
            <div class="report-card"><i class="fa-solid fa-users"></i><h3>${patientCount}</h3><p>Bệnh nhân</p></div>
            <div class="report-card"><i class="fa-solid fa-pills"></i><h3>${uniqueMedCount}</h3><p>Loại thuốc</p></div>
            <div class="report-card"><i class="fa-solid fa-calendar-check"></i><h3>${done} / ${total}</h3><p>Lịch đã uống</p></div>
            <div class="report-card"><i class="fa-solid fa-chart-pie"></i><h3>${rate}%</h3><p>Tỉ lệ tuân thủ</p></div>
        </div>
        <div class="report-detail">
            <p>⏳ Chưa uống: <strong>${pending} lịch</strong></p>
            <p>✅ Đã uống: <strong>${done} lịch</strong></p>
        </div>
    `;
}

// =======================
// OPEN SCHEDULE
// =======================
async function openSchedule() {
    if (!getUser()) {
        localStorage.setItem("returnTo", window.location.href);
        window.location.href = "login.html";
        return;
    }

    const section = document.getElementById("scheduleSection");
    if (!section) return;
    section.style.display = "block";
    section.innerHTML = `<div style="padding:40px;text-align:center;color:#888;">⏳ Đang tải dữ liệu...</div>`;

    try {
        await loadData();
        renderSchedules();
    } catch {
        section.innerHTML = `<div style="padding:40px;text-align:center;color:#dc2626;">❌ Không thể tải dữ liệu.</div>`;
    }
    section.scrollIntoView({ behavior: "smooth" });
}

// =======================
// OPEN REPORT
// =======================
async function openReport() {
    if (!getUser()) {
        localStorage.setItem("returnTo", window.location.href);
        window.location.href = "login.html";
        return;
    }

    const section = document.getElementById("reportSection");
    if (!section) return;
    section.style.display = "block";
    section.innerHTML = `<div style="padding:40px;text-align:center;color:#888;">⏳ Đang tải dữ liệu...</div>`;

    try {
        await loadData();
        renderReport();
    } catch {
        section.innerHTML = `<div style="padding:40px;text-align:center;color:#dc2626;">❌ Không thể tải dữ liệu.</div>`;
    }
    section.scrollIntoView({ behavior: "smooth" });
}

// =======================
// NAVIGATION
// =======================
function goLogin() {
    localStorage.setItem("returnTo", window.location.href);
    window.location.href = "login.html";
}

// =======================
// XÓA LỊCH
// =======================
async function deleteSchedule(id) {
    try {
        await fetch(`${API_schedules_URL}/${id}`, { method: "DELETE" });
        schedules = schedules.filter(s => s.id != id);
        const section = document.getElementById("scheduleSection");
        if (section && section.style.display !== "none") renderSchedules();
    } catch { alert("Xóa thất bại!"); }
}

// =======================
// RENDER SELECT
// =======================
function renderSelect(id, data) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = data.map(i => `<option value="${i.id}">${i.name}</option>`).join("");
}

// =======================
// GLOBAL EXPORT
// =======================
window.openSchedule = openSchedule;
window.openReport = openReport;
window.goLogin = goLogin;
window.logout = logout;
window.loadData = loadData;
window.renderSelect = renderSelect;
window.deleteSchedule = deleteSchedule;
window.markAsTaken = markAsTaken;
