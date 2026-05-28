// ============================================================
//  api.js – Tập trung tất cả hàm gọi MockAPI
//  MedReminder – Đề tài 09
// ============================================================

const API_BASE = {
    patients: "https://69f9a6bcc509a40d3aa2ef52.mockapi.io/api/v1/patients",
    medications: "https://69f9a6bcc509a40d3aa2ef52.mockapi.io/api/v1/medications",
    schedules: "https://6a14718d6c7db8aac05489f6.mockapi.io/api/v1/schedules",
};

// ─── Helper ──────────────────────────────────────────────────
async function request(url, options = {}) {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    // DELETE trả về 200 với body rỗng ở một số mock
    const text = await res.text();
    return text ? JSON.parse(text) : {};
}

// ─── PATIENTS ────────────────────────────────────────────────
async function getPatients() {
    return request(API_BASE.patients);
}

async function getPatient(id) {
    return request(`${API_BASE.patients}/${id}`);
}

async function createPatient(data) {
    return request(API_BASE.patients, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

async function updatePatient(id, data) {
    return request(`${API_BASE.patients}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

async function deletePatient(id) {
    return request(`${API_BASE.patients}/${id}`, { method: "DELETE" });
}

// ─── MEDICATIONS ─────────────────────────────────────────────
async function getMedications() {
    return request(API_BASE.medications);
}

async function getMedication(id) {
    return request(`${API_BASE.medications}/${id}`);
}

async function createMedication(data) {
    return request(API_BASE.medications, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

async function updateMedication(id, data) {
    return request(`${API_BASE.medications}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

async function deleteMedication(id) {
    return request(`${API_BASE.medications}/${id}`, { method: "DELETE" });
}

// ─── SCHEDULES ───────────────────────────────────────────────
async function getSchedules() {
    return request(API_BASE.schedules);
}

async function getSchedule(id) {
    return request(`${API_BASE.schedules}/${id}`);
}

async function createSchedule(data) {
    return request(API_BASE.schedules, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

async function updateSchedule(id, data) {
    return request(`${API_BASE.schedules}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

async function deleteSchedule(id) {
    return request(`${API_BASE.schedules}/${id}`, { method: "DELETE" });
}

// ─── Toggle trạng thái đã uống (⭐ điểm kỹ thuật nổi bật) ───
async function toggleTakenStatus(scheduleId, currentStatus) {
    const newStatus = currentStatus === "taken" ? "pending" : "taken";
    const payload = {
        status: newStatus,
        takenAt: newStatus === "taken" ? new Date().toISOString() : null,
    };
    return updateSchedule(scheduleId, payload);
}

// ─── Export global ───────────────────────────────────────────
window.getPatients = getPatients;
window.getPatient = getPatient;
window.createPatient = createPatient;
window.updatePatient = updatePatient;
window.deletePatient = deletePatient;

window.getMedications = getMedications;
window.getMedication = getMedication;
window.createMedication = createMedication;
window.updateMedication = updateMedication;
window.deleteMedication = deleteMedication;

window.getSchedules = getSchedules;
window.getSchedule = getSchedule;
window.createSchedule = createSchedule;
window.updateSchedule = updateSchedule;
window.deleteSchedule = deleteSchedule;
window.toggleTakenStatus = toggleTakenStatus;
