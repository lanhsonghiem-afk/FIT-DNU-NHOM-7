// =======================
// DATA
// =======================

let allPatients = [];
let allSchedules = [];
let allMeds = [];

const modal = document.getElementById("modal");
const form = document.getElementById("scheduleForm");

// =======================
// API
// =======================

const API_patients_URL =
    "https://69f9a6bcc509a40d3aa2ef52.mockapi.io/api/v1/patients";

const API_medications_URL =
    "https://69f9a6bcc509a40d3aa2ef52.mockapi.io/api/v1/medications";

const API_schedules_URL =
    "https://6a14718d6c7db8aac05489f6.mockapi.io/api/v1/schedules";

// =======================
// MODAL
// =======================

function openModal() { modal.style.display = "flex"; }
function closeModal() { modal.style.display = "none"; }

// =======================
// LOAD DATA
// =======================

async function loadData() {
    try {
        const [patientsRes, medsRes, schedulesRes] = await Promise.all([
            fetch(API_patients_URL),
            fetch(API_medications_URL),
            fetch(API_schedules_URL)
        ]);
        allPatients = await patientsRes.json();
        allMeds = await medsRes.json();
        allSchedules = await schedulesRes.json();

        renderPatients(getUniquePatients());
        renderMeds(getUniqueMeds());
        renderSchedules(allSchedules);
        updateStats();
    } catch (err) {
        console.log(err);
        alert("Không tải được dữ liệu!");
    }
}

// =======================
// GỘP BỆNH NHÂN TRÙNG TÊN
// =======================

function getUniquePatients() {
    const seen = new Map();
    allPatients.forEach(p => {
        const key = p.name.trim().toLowerCase();
        if (!seen.has(key)) seen.set(key, { ...p, _ids: [p.id] });
        else seen.get(key)._ids.push(p.id);
    });
    return Array.from(seen.values());
}

function getSchedulesForPatientGroup(patientIds) {
    return allSchedules.filter(s =>
        patientIds.includes(String(s.patientId)) ||
        patientIds.includes(s.patientId)
    );
}

// =======================
// GỘP THUỐC TRÙNG TÊN
// =======================

function getUniqueMeds() {
    const seen = new Map();
    allMeds.forEach(m => {
        const key = m.name.trim().toLowerCase();
        if (!seen.has(key)) seen.set(key, { ...m, _ids: [m.id] });
        else seen.get(key)._ids.push(m.id);
    });
    return Array.from(seen.values());
}

function getSchedulesForMedGroup(medIds) {
    return allSchedules.filter(s =>
        medIds.includes(String(s.medicationId)) ||
        medIds.includes(s.medicationId)
    );
}

// =======================
// STATS
// =======================

function updateStats() {
    document.getElementById("patientCount").innerText = getUniquePatients().length;
    document.getElementById("medCount").innerText = getUniqueMeds().length;
    const done = allSchedules.filter(s => s.status === true).length;
    const percent = allSchedules.length ? Math.round((done / allSchedules.length) * 100) : 0;
    document.getElementById("successPercent").innerText = percent + "%";
}

// =======================
// TOGGLE DETAIL
// =======================

function toggleDetail(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById("icon-" + id);
    if (!el) return;
    const isOpen = el.style.display !== "none";
    el.style.display = isOpen ? "none" : "block";
    if (icon) icon.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
}

// =======================
// RENDER PATIENTS
// =======================

function renderPatients(data) {
    const container = document.getElementById("patientCards");
    if (!container) return;

    container.innerHTML = data.map(patient => {
        const schedules = getSchedulesForPatientGroup(patient._ids);
        const medNames = [...new Set(
            schedules.map(s => allMeds.find(m => m.id == s.medicationId)?.name).filter(Boolean)
        )];
        const done = schedules.filter(s => s.status === true).length;
        const total = schedules.length;
        const pct = total ? Math.round((done / total) * 100) : 0;
        const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";
        const cardId = "patient-detail-" + patient.id;

        return `
        <div class="patient-card">
            <div class="patient-top" onclick="toggleDetail('${cardId}')" style="cursor:pointer;">
                <div class="patient-avatar"><i class="fa-solid fa-user"></i></div>
                <div style="flex:1;">
                    <h3>${patient.name}</h3>
                    <p style="color:#6b7280;font-size:13px;">${total} lịch &nbsp;·&nbsp; ${medNames.length} loại thuốc</p>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:20px;font-weight:700;color:${color};">${pct}%</span>
                    <p style="color:#9ca3af;font-size:11px;margin:0;">tuân thủ</p>
                </div>
                <i class="fa-solid fa-chevron-down toggle-icon" id="icon-${cardId}"
                   style="margin-left:10px;color:#9ca3af;font-size:12px;transition:transform 0.25s;"></i>
            </div>

            <div class="patient-detail" id="${cardId}" style="display:none;margin-top:14px;border-top:1px solid #f3f4f6;padding-top:14px;">
                <div style="margin-bottom:12px;">
                    <h4 class="section-label">Thuốc đang dùng</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                        ${medNames.length
                ? medNames.map(n => `<span class="med-badge">${n}</span>`).join("")
                : `<span style="color:#9ca3af;font-size:13px;">Chưa có thuốc</span>`}
                    </div>
                </div>

                <h4 class="section-label">Lịch uống</h4>
                <table class="detail-table">
                    <thead><tr><th>Thuốc</th><th>Ngày</th><th>Giờ</th><th>Trạng thái</th><th></th></tr></thead>
                    <tbody>
                        ${schedules.length
                ? schedules.map(s => {
                    const med = allMeds.find(m => m.id == s.medicationId);
                    return `<tr>
                                    <td>${med?.name || "N/A"}</td>
                                    <td>${s.date}</td><td>${s.time}</td>
                                    <td><span class="${s.status ? 'done' : 'pending'}">${s.status ? "Đã uống" : "Chưa uống"}</span></td>
                                    <td><button class="delete-btn" onclick="deleteSchedule('${s.id}')">
                                        <i class="fa-solid fa-trash"></i></button></td>
                                </tr>`;
                }).join("")
                : `<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:16px;">Không có lịch</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>`;
    }).join("");
}

// =======================
// RENDER MEDS (gộp tên)
// =======================

function renderMeds(data) {
    const container = document.getElementById("medCards");
    if (!container) return;

    container.innerHTML = data.map(med => {
        const schedules = getSchedulesForMedGroup(med._ids);
        const patientNames = [...new Set(
            schedules.map(s => allPatients.find(p => p.id == s.patientId)?.name).filter(Boolean)
        )];
        const done = schedules.filter(s => s.status === true).length;
        const total = schedules.length;
        const pct = total ? Math.round((done / total) * 100) : 0;
        const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";
        const cardId = "med-detail-" + med.id;

        return `
        <div class="patient-card">
            <div class="patient-top" onclick="toggleDetail('${cardId}')" style="cursor:pointer;">
                <div class="patient-avatar" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);color:#16a34a;">
                    <i class="fa-solid fa-pills"></i>
                </div>
                <div style="flex:1;">
                    <h3>${med.name}</h3>
                    <p style="color:#6b7280;font-size:13px;">${total} lịch &nbsp;·&nbsp; ${patientNames.length} bệnh nhân</p>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:20px;font-weight:700;color:${color};">${pct}%</span>
                    <p style="color:#9ca3af;font-size:11px;margin:0;">tuân thủ</p>
                </div>
                <i class="fa-solid fa-chevron-down toggle-icon" id="icon-${cardId}"
                   style="margin-left:10px;color:#9ca3af;font-size:12px;transition:transform 0.25s;"></i>
            </div>

            <div class="patient-detail" id="${cardId}" style="display:none;margin-top:14px;border-top:1px solid #f3f4f6;padding-top:14px;">
                <div style="margin-bottom:12px;">
                    <h4 class="section-label">Bệnh nhân đang dùng</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                        ${patientNames.length
                ? patientNames.map(n => `<span class="patient-badge">${n}</span>`).join("")
                : `<span style="color:#9ca3af;font-size:13px;">Chưa có bệnh nhân</span>`}
                    </div>
                </div>

                <h4 class="section-label">Lịch uống</h4>
                <table class="detail-table">
                    <thead><tr><th>Bệnh nhân</th><th>Ngày</th><th>Giờ</th><th>Trạng thái</th><th></th></tr></thead>
                    <tbody>
                        ${schedules.length
                ? schedules.map(s => {
                    const patient = allPatients.find(p => p.id == s.patientId);
                    return `<tr>
                                    <td>${patient?.name || "N/A"}</td>
                                    <td>${s.date}</td><td>${s.time}</td>
                                    <td><span class="${s.status ? 'done' : 'pending'}">${s.status ? "Đã uống" : "Chưa uống"}</span></td>
                                    <td><button class="delete-btn" onclick="deleteSchedule('${s.id}')">
                                        <i class="fa-solid fa-trash"></i></button></td>
                                </tr>`;
                }).join("")
                : `<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:16px;">Không có lịch</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>`;
    }).join("");
}

// =======================
// SEARCH PATIENTS
// =======================

function searchPatients() {
    const kw = document.getElementById("searchInput").value.toLowerCase();
    renderPatients(getUniquePatients().filter(p => p.name.toLowerCase().includes(kw)));
}

// =======================
// SEARCH MEDS
// =======================

function searchMeds() {
    const kw = document.getElementById("medSearchInput").value.toLowerCase();
    renderMeds(getUniqueMeds().filter(m => m.name.toLowerCase().includes(kw)));
}

// =======================
// RENDER SCHEDULES
// =======================

function renderSchedules(schedules) {
    const tbody = document.getElementById("scheduleTableBody");
    if (!tbody) return;
    tbody.innerHTML = schedules.map(s => {
        const patient = allPatients.find(p => p.id == s.patientId);
        const med = allMeds.find(m => m.id == s.medicationId);
        return `<tr>
            <td>${patient?.name || "Không có"}</td>
            <td>${med?.name || "Không có"}</td>
            <td>${s.date}</td><td>${s.time}</td>
            <td><span class="${s.status ? 'done' : 'pending'}">${s.status ? "Đã uống" : "Chưa uống"}</span></td>
            <td><button class="delete-btn" onclick="deleteSchedule('${s.id}')">
                <i class="fa-solid fa-trash"></i></button></td>
        </tr>`;
    }).join("");
}

// =======================
// DELETE (chỉ xóa schedule)
// =======================

async function deleteSchedule(scheduleId) {
    if (!confirm("Xác nhận xóa lịch này?")) return;
    try {
        await fetch(`${API_schedules_URL}/${scheduleId}`, { method: "DELETE" });
        alert("Xóa thành công!");
        loadData();
    } catch (err) {
        console.log(err);
        alert("Xóa thất bại!");
    }
}

// =======================
// TABS
// =======================

const TABS = ["dashboard", "patients", "meds", "schedule", "statistics"];

function setActiveTab(name) {
    TABS.forEach(t => {
        document.getElementById(t + "Section").style.display = t === name ? "block" : "none";
    });
    document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active"));
}

function showDashboard() {
    setActiveTab("dashboard");
    document.querySelectorAll(".sidebar li")[0].classList.add("active");
}
function showPatients() {
    setActiveTab("patients");
    renderPatients(getUniquePatients());
    document.querySelectorAll(".sidebar li")[1].classList.add("active");
}
function showMeds() {
    setActiveTab("meds");
    renderMeds(getUniqueMeds());
    document.querySelectorAll(".sidebar li")[2].classList.add("active");
}
function showSchedules() {
    setActiveTab("schedule");
    document.querySelectorAll(".sidebar li")[3].classList.add("active");
}
function showStatistics() {
    setActiveTab("statistics");
    renderStatistics();
    document.querySelectorAll(".sidebar li")[4].classList.add("active");
}

// =======================
// STATISTICS
// =======================

function renderStatistics() {
    const container = document.getElementById("statisticsCards");
    if (!container) return;

    const uniqueP = getUniquePatients();
    const uniqueM = getUniqueMeds();

    // --- Bệnh nhân ---
    const patientHTML = uniqueP.map(patient => {
        const schedules = getSchedulesForPatientGroup(patient._ids);
        const done = schedules.filter(s => s.status === true).length;
        const total = schedules.length;
        const pct = total ? Math.round((done / total) * 100) : 0;
        const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";
        return `
        <div class="patient-card">
            <div class="patient-top">
                <div class="patient-avatar"><i class="fa-solid fa-user"></i></div>
                <div><h3>${patient.name}</h3><p style="color:#6b7280;font-size:13px;">Bệnh nhân</p></div>
            </div>
            <div style="margin-top:16px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:13px;color:#6b7280;">${done}/${total} lịch</span>
                    <span style="font-size:22px;font-weight:700;color:${color};">${pct}%</span>
                </div>
                <div style="background:#e5e7eb;border-radius:999px;height:8px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:${color};border-radius:999px;transition:width 0.6s;"></div>
                </div>
            </div>
        </div>`;
    }).join("");

    // --- Thuốc ---
    const medHTML = uniqueM.map(med => {
        const schedules = getSchedulesForMedGroup(med._ids);
        const done = schedules.filter(s => s.status === true).length;
        const total = schedules.length;
        const pct = total ? Math.round((done / total) * 100) : 0;
        const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";
        return `
        <div class="patient-card">
            <div class="patient-top">
                <div class="patient-avatar" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);color:#16a34a;">
                    <i class="fa-solid fa-pills"></i>
                </div>
                <div><h3>${med.name}</h3><p style="color:#6b7280;font-size:13px;">Loại thuốc</p></div>
            </div>
            <div style="margin-top:16px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:13px;color:#6b7280;">${done}/${total} lịch</span>
                    <span style="font-size:22px;font-weight:700;color:${color};">${pct}%</span>
                </div>
                <div style="background:#e5e7eb;border-radius:999px;height:8px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:${color};border-radius:999px;transition:width 0.6s;"></div>
                </div>
            </div>
        </div>`;
    }).join("");

    container.innerHTML = `
        <div style="margin-bottom:8px;">
            <h3 style="font-size:15px;font-weight:600;color:#374151;margin-bottom:12px;">
                <i class="fa-solid fa-user" style="color:#2563eb;margin-right:6px;"></i>Theo bệnh nhân
            </h3>
            <div class="patient-grid">${patientHTML}</div>
        </div>
        <div style="margin-top:28px;">
            <h3 style="font-size:15px;font-weight:600;color:#374151;margin-bottom:12px;">
                <i class="fa-solid fa-pills" style="color:#16a34a;margin-right:6px;"></i>Theo loại thuốc
            </h3>
            <div class="patient-grid">${medHTML}</div>
        </div>`;
}

// =======================
// ADD SCHEDULE
// =======================

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
        const patientName = document.getElementById("patientSelect").value.trim();
        const medName = document.getElementById("medSelect").value.trim();
        const date = document.getElementById("dateInput").value;
        const time = document.getElementById("timeInput").value;

        if (!patientName || !medName || !date || !time) {
            alert("Vui lòng nhập đầy đủ!"); return;
        }

        // Tái sử dụng patient nếu tên đã tồn tại
        let existingPatient = allPatients.find(p => p.name.trim().toLowerCase() === patientName.toLowerCase());
        let patientId;
        if (existingPatient) {
            patientId = existingPatient.id;
        } else {
            const res = await fetch(API_patients_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: patientName })
            });
            patientId = (await res.json()).id;
        }

        // Tái sử dụng med nếu tên đã tồn tại
        let existingMed = allMeds.find(m => m.name.trim().toLowerCase() === medName.toLowerCase());
        let medId;
        if (existingMed) {
            medId = existingMed.id;
        } else {
            const res = await fetch(API_medications_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: medName })
            });
            medId = (await res.json()).id;
        }

        const scheduleRes = await fetch(API_schedules_URL, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId, medicationId: medId, patientName, medicationName: medName, date, time, status: false })
        });

        if (scheduleRes.ok) {
            alert("Lưu thành công!");
            form.reset(); closeModal(); loadData();
        } else {
            alert("Không lưu được!");
        }
    } catch (err) {
        console.log(err); alert("Lưu thất bại!");
    }
});

// =======================
// LOGOUT
// =======================

function logoutAdmin() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLogin");
    window.location.href = "index.html";
}

window.onload = loadData;