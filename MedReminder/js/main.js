// ============================================================
//  main.js – MedReminder (nâng cấp toàn diện)
//  FIX: bảo mật patient, tabs, thuốc catalog, tin tức, search
// ============================================================

let allMeds = [];
let allPatients = [];
let allSchedules = [];
let todayScheds = [];
let selectedDate = getTodayString();
let filterStatus = "all";
let currentUser = null;
let activeTab = "home";
let medCatFilter = "all";

// ─── Medicine catalog data ────────────────────────────────────
const MED_CATALOG = [
    // Giảm đau / hạ sốt
    { id: "c1", name: "Paracetamol 500mg", brand: "Panadol, Tylenol", cat: "painkiller", icon: "💊", type: "Viên nén", dosage: "500mg – 1000mg/lần", freq: "Mỗi 4–6 giờ khi cần", uses: "Giảm đau đầu, đau răng, đau cơ, hạ sốt. An toàn cho hầu hết người dùng kể cả phụ nữ mang thai.", side: "Hiếm gặp ở liều bình thường. Quá liều có thể gây tổn thương gan nghiêm trọng.", note: "⚠️ Tối đa 4000mg/ngày. Không dùng khi uống rượu hoặc bệnh gan. Kiểm tra các thuốc kết hợp tránh quá liều.", store: "Nhiệt độ phòng, tránh ẩm và ánh nắng" },
    { id: "c2", name: "Ibuprofen 400mg", brand: "Advil, Nurofen", cat: "painkiller", icon: "💊", type: "Viên nén bao phim", dosage: "200mg – 400mg/lần", freq: "Mỗi 6–8 giờ sau ăn", uses: "Giảm đau, hạ sốt, kháng viêm. Hiệu quả với đau cơ, đau khớp, đau kinh nguyệt.", side: "Đau dạ dày, buồn nôn, ợ chua. Có thể gây loét dạ dày khi dùng lâu dài.", note: "⚠️ Không dùng khi đói bụng. Tránh dùng nếu có bệnh thận, dạ dày hoặc đang dùng thuốc chống đông.", store: "Nhiệt độ phòng dưới 30°C" },
    { id: "c3", name: "Aspirin 81mg", brand: "Aspirin Bayer, Ecotrin", cat: "painkiller", icon: "💊", type: "Viên nén bao tan trong ruột", dosage: "81mg/ngày (tim mạch) hoặc 325–650mg (đau)", freq: "1 lần/ngày hoặc khi cần", uses: "Phòng ngừa nhồi máu cơ tim và đột quỵ (liều thấp). Giảm đau, hạ sốt, kháng viêm.", side: "Ợ chua, buồn nôn, có thể xuất huyết tiêu hóa. Nguy cơ chảy máu.", note: "⚠️ Không dùng cho trẻ em dưới 16 tuổi. Tránh nếu dị ứng NSAID hoặc đang dùng thuốc chống đông.", store: "Nhiệt độ phòng, tránh ẩm" },
    // Kháng sinh
    { id: "c4", name: "Amoxicillin 500mg", brand: "Augmentin (kết hợp), Moxipen", cat: "antibiotic", icon: "🧫", type: "Viên nang", dosage: "500mg/lần", freq: "3 lần/ngày, uống cùng bữa ăn", uses: "Điều trị nhiễm khuẩn đường hô hấp, tai mũi họng, tiết niệu, da và mô mềm.", side: "Tiêu chảy, buồn nôn, phát ban. Có thể gây dị ứng (nổi mề đay, sưng mặt).", note: "⚠️ Uống đủ liệu trình, không tự dừng thuốc dù triệu chứng hết. Báo BS ngay nếu nổi mẩn. Không dùng nếu dị ứng Penicillin.", store: "Nhiệt độ phòng, tránh ẩm" },
    { id: "c5", name: "Azithromycin 500mg", brand: "Zithromax, Azibiot", cat: "antibiotic", icon: "🧫", type: "Viên nén", dosage: "500mg ngày đầu, 250mg các ngày tiếp", freq: "1 lần/ngày, 3–5 ngày", uses: "Nhiễm khuẩn hô hấp, viêm phổi cộng đồng, nhiễm khuẩn da. Phổ kháng khuẩn rộng.", side: "Buồn nôn, tiêu chảy, đau bụng. Ít gặp: rối loạn nhịp tim.", note: "⚠️ Có thể ảnh hưởng nhịp tim - báo BS nếu dùng thuốc tim mạch. Không dùng chung với antacid.", store: "Nhiệt độ phòng, dưới 30°C" },
    { id: "c6", name: "Metronidazole 400mg", brand: "Flagyl, Metron", cat: "antibiotic", icon: "🧫", type: "Viên nén", dosage: "400mg/lần", freq: "3 lần/ngày, 5–7 ngày", uses: "Nhiễm khuẩn kỵ khí, nhiễm ký sinh trùng (Giardia, Trichomonas), viêm đại tràng.", side: "Buồn nôn, vị kim loại trong miệng, chóng mặt.", note: "⚠️ Tuyệt đối không uống rượu khi dùng và 48 giờ sau khi kết thúc liệu trình.", store: "Nhiệt độ phòng, tránh ánh sáng" },
    // Tiêu hóa
    { id: "c7", name: "Omeprazole 20mg", brand: "Losec, Prilosec, Omepro", cat: "stomach", icon: "🫁", type: "Viên nang phóng thích chậm", dosage: "20mg – 40mg/lần", freq: "1–2 lần/ngày, 30 phút trước bữa ăn", uses: "Giảm acid dạ dày, điều trị loét dạ dày tá tràng, trào ngược dạ dày – thực quản (GERD).", side: "Đau đầu, tiêu chảy, buồn nôn. Dùng lâu dài: thiếu Magie, vitamin B12.", note: "⚠️ Không nhai hoặc nghiền viên nang. Uống nguyên viên với nước. Dùng đủ liệu trình theo chỉ định.", store: "Nhiệt độ phòng, dưới 25°C, tránh ẩm" },
    { id: "c8", name: "Domperidone 10mg", brand: "Motilium, Domstal", cat: "stomach", icon: "🫁", type: "Viên nén", dosage: "10mg/lần", freq: "3 lần/ngày, trước bữa ăn 15–30 phút", uses: "Điều trị buồn nôn, nôn mửa, đầy bụng, chướng hơi, khó tiêu.", side: "Đau đầu, khô miệng, tiêu chảy nhẹ.", note: "⚠️ Không dùng quá 7 ngày liên tục mà không có chỉ định BS. Tránh dùng với thuốc chống nấm azole.", store: "Nhiệt độ phòng" },
    { id: "c9", name: "Smecta (Diosmectite)", brand: "Smecta, Diarsed", cat: "stomach", icon: "🫁", type: "Gói bột", dosage: "1 gói/lần", freq: "3 lần/ngày, pha với nước", uses: "Điều trị tiêu chảy cấp và mãn tính, đau bụng do viêm dạ dày ruột.", side: "Có thể gây táo bón nhẹ nếu dùng quá liều.", note: "Uống cách các thuốc khác ít nhất 2 giờ vì có thể giảm hấp thu thuốc.", store: "Nhiệt độ phòng, tránh ẩm" },
    // Vitamin
    { id: "c10", name: "Vitamin C 1000mg", brand: "Redoxon, Celin", cat: "vitamin", icon: "🌿", type: "Viên sủi / Viên nén", dosage: "500mg – 1000mg/ngày", freq: "1 lần/ngày sau bữa ăn", uses: "Tăng cường miễn dịch, chống oxy hóa, hỗ trợ hấp thu sắt, làm đẹp da.", side: "Liều cao có thể gây tiêu chảy, sỏi thận ở người nhạy cảm.", note: "Không cần thiết dùng liều quá cao. Uống sau bữa ăn để tránh kích ứng dạ dày.", store: "Nhiệt độ phòng, tránh ánh sáng và ẩm" },
    { id: "c11", name: "Vitamin D3 1000IU", brand: "D-Drops, Vigantol", cat: "vitamin", icon: "🌿", type: "Viên nén / Giọt", dosage: "1000 – 2000 IU/ngày", freq: "1 lần/ngày cùng bữa ăn có chất béo", uses: "Hỗ trợ hấp thu canxi, tăng cường xương khớp, miễn dịch và sức khỏe tâm thần.", side: "Độc tính khi quá liều: buồn nôn, yếu cơ, sỏi thận (hiếm).", note: "Xét nghiệm nồng độ D3 máu trước khi bổ sung liều cao. Uống cùng bữa ăn có chất béo để hấp thu tốt hơn.", store: "Tránh ánh sáng trực tiếp, nhiệt độ mát" },
    { id: "c12", name: "Omega-3 Fish Oil 1000mg", brand: "Nordic Naturals, Blackmores", cat: "vitamin", icon: "🌿", type: "Viên nang mềm", dosage: "1000mg – 2000mg/ngày", freq: "1–2 viên/ngày cùng bữa ăn", uses: "Hỗ trợ tim mạch, giảm triglyceride, chống viêm, tốt cho não bộ và mắt.", side: "Mùi tanh, ợ cá. Liều cao có thể tăng nguy cơ chảy máu.", note: "Mua sản phẩm có chứng nhận kiểm định kim loại nặng. Uống sau bữa ăn để giảm mùi tanh.", store: "Tủ lạnh sau khi mở nắp" },
    // Tim mạch
    { id: "c13", name: "Amlodipine 5mg", brand: "Norvasc, Amlopin", cat: "heart", icon: "❤️", type: "Viên nén", dosage: "5mg – 10mg/ngày", freq: "1 lần/ngày, cùng giờ mỗi ngày", uses: "Điều trị tăng huyết áp, đau thắt ngực ổn định.", side: "Phù chân, nóng bừng mặt, đau đầu, chóng mặt.", note: "⚠️ Không tự dừng thuốc đột ngột. Tái khám định kỳ để điều chỉnh liều.", store: "Nhiệt độ phòng, tránh ẩm" },
    { id: "c14", name: "Metformin 500mg", brand: "Glucophage, Siofor", cat: "heart", icon: "❤️", type: "Viên nén", dosage: "500mg – 1000mg/lần", freq: "2–3 lần/ngày cùng bữa ăn", uses: "Điều trị tiểu đường type 2, giảm đường huyết, hỗ trợ giảm cân.", side: "Buồn nôn, tiêu chảy, đau bụng (thường giảm dần). Hiếm: nhiễm toan lactic.", note: "⚠️ Tạm dừng trước phẫu thuật và chụp X-quang cản quang. Uống cùng bữa ăn để giảm tác dụng phụ tiêu hóa.", store: "Nhiệt độ phòng" },
    // Thiết bị y tế
    { id: "c15", name: "Máy đo huyết áp điện tử", brand: "Omron, Beurer", cat: "device", icon: "🩺", type: "Thiết bị y tế", dosage: "Đo 1–2 lần/ngày", freq: "Buổi sáng trước ăn & tối trước ngủ", uses: "Theo dõi huyết áp tại nhà, phát hiện sớm tăng/hạ huyết áp, hỗ trợ điều trị.", side: "Không áp dụng", note: "Ngồi nghỉ 5 phút trước khi đo. Đặt vòng tay ngang tim. Đo 2–3 lần lấy giá trị trung bình.", store: "Nơi khô ráo, tránh va đập" },
    { id: "c16", name: "Máy đo đường huyết", brand: "Accu-Chek, One Touch", cat: "device", icon: "🩺", type: "Thiết bị y tế", dosage: "Đo theo chỉ định BS", freq: "Trước/sau bữa ăn hoặc khi cần", uses: "Theo dõi đường huyết cho người tiểu đường, điều chỉnh chế độ ăn và thuốc.", side: "Không áp dụng", note: "Hiệu chuẩn máy định kỳ. Rửa tay trước khi đo. Ghi nhật ký kết quả để báo BS.", store: "Nhiệt độ phòng 10–40°C, tránh ẩm" },
];

// ─── News data ────────────────────────────────────────────────
const NEWS_DATA = [
    { id: "n1", cat: "drug", icon: "💊", title: "WHO công bố danh sách thuốc thiết yếu 2024 – Những thay đổi quan trọng", summary: "WHO cập nhật danh sách 500+ thuốc thiết yếu toàn cầu, bổ sung thêm thuốc kháng ung thư và insulin sinh tổng hợp.", date: "20/05/2026", source: "WHO", link: "https://www.who.int/publications/i/item/9789240093328", hot: true },
    { id: "n2", cat: "disease", icon: "🦠", title: "Cập nhật tình hình sốt xuất huyết tại Việt Nam – Cách phòng ngừa hiệu quả", summary: "Bộ Y tế cảnh báo gia tăng ca sốt xuất huyết tại các tỉnh miền Nam. Người dân cần diệt muỗi và bọ gậy quanh nhà.", date: "18/05/2026", source: "Bộ Y tế VN", link: "https://moh.gov.vn", hot: true },
    { id: "n3", cat: "health", icon: "🌿", title: "Nghiên cứu mới: Đi bộ 7.000 bước/ngày giảm 50% nguy cơ bệnh tim mạch", summary: "Tạp chí JAMA công bố nghiên cứu theo dõi 15.000 người trong 10 năm, khẳng định lợi ích rõ rệt của việc đi bộ đều đặn.", date: "15/05/2026", source: "JAMA", link: "https://jamanetwork.com", hot: false },
    { id: "n4", cat: "tech", icon: "🤖", title: "AI phát hiện ung thư phổi sớm chính xác hơn bác sĩ X-quang trong thử nghiệm lớn", summary: "Google DeepMind công bố mô hình AI mới đạt độ chính xác 94.4% trong phát hiện ung thư phổi giai đoạn đầu trên CT scan.", date: "12/05/2026", source: "Nature Medicine", link: "https://www.nature.com/nm", hot: true },
    { id: "n5", cat: "policy", icon: "📋", title: "Bảo hiểm y tế mới 2026: Người dân được thanh toán 100% thuốc điều trị ung thư", summary: "Chính sách BHYT mới có hiệu lực từ 01/07/2026, mở rộng danh mục thuốc ung thư được chi trả toàn phần.", date: "10/05/2026", source: "BHXH Việt Nam", link: "https://baohiemxahoi.gov.vn", hot: false },
    { id: "n6", cat: "drug", icon: "💊", title: "Thuốc GLP-1 (Ozempic, Wegovy) – Tiềm năng điều trị ngoài tiểu đường và béo phì", summary: "Các nghiên cứu mới chỉ ra nhóm thuốc GLP-1 có thể có lợi ích trong bảo vệ tim mạch, thận và thậm chí bệnh Alzheimer.", date: "08/05/2026", source: "NEJM", link: "https://www.nejm.org", hot: true },
    { id: "n7", cat: "health", icon: "🌿", title: "Chế độ ăn Địa Trung Hải giảm 30% nguy cơ sa sút trí tuệ theo nghiên cứu 20 năm", summary: "Dầu olive, rau củ, cá, hạt và trái cây là nền tảng của chế độ ăn được chứng minh bảo vệ não bộ tốt nhất.", date: "05/05/2026", source: "Lancet Neurology", link: "https://www.thelancet.com/journals/laneur/home", hot: false },
    { id: "n8", cat: "disease", icon: "🦠", title: "Biến thể mới COVID-19 JN.1.7 xuất hiện – WHO theo dõi sát sao", summary: "Biến thể mới lây lan nhanh ở một số quốc gia châu Á. Vaccine hiện tại vẫn có hiệu quả bảo vệ khỏi bệnh nặng.", date: "03/05/2026", source: "WHO", link: "https://www.who.int/news", hot: false },
    { id: "n9", cat: "tech", icon: "🤖", title: "Robot phẫu thuật thế hệ mới: Phẫu thuật tim không cần mở ngực tại BV Việt Đức", summary: "Bệnh viện Việt Đức triển khai thành công ca phẫu thuật van tim đầu tiên bằng robot Da Vinci thế hệ 5 tại Việt Nam.", date: "01/05/2026", source: "BV Việt Đức", link: "https://vietduc.com.vn", hot: true },
    { id: "n10", cat: "policy", icon: "📋", title: "Nghị định mới về bán thuốc kê đơn online: Siết chặt để bảo vệ người dùng", summary: "Bộ Y tế ban hành quy định mới yêu cầu các nền tảng bán thuốc trực tuyến phải có dược sĩ trực tư vấn 24/7.", date: "28/04/2026", source: "Bộ Y tế VN", link: "https://moh.gov.vn/news", hot: false },
    { id: "n11", cat: "health", icon: "🌿", title: "Ngủ đủ giấc và sức khỏe tim mạch: Nghiên cứu mới từ ĐH Harvard", summary: "Ngủ ít hơn 6 giờ/đêm liên tục trong 5 năm tăng 72% nguy cơ bệnh tim. Chất lượng giấc ngủ quan trọng hơn số giờ ngủ.", date: "25/04/2026", source: "Harvard Medical School", link: "https://www.health.harvard.edu", hot: false },
    { id: "n12", cat: "drug", icon: "💊", title: "Kháng sinh mới Cefiderocol – Vũ khí chống vi khuẩn siêu kháng thuốc", summary: "FDA phê duyệt kháng sinh mới có cơ chế hoạt động đột phá, hiệu quả với các chủng vi khuẩn kháng tất cả kháng sinh hiện có.", date: "22/04/2026", source: "FDA", link: "https://www.fda.gov/drugs", hot: true },
];

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
    currentUser = JSON.parse(sessionStorage.getItem("medreminder_user") || "null");
    setupNavAuth();
    initGlobalSearch();
    switchTab("home", null);
    renderMedCatalog();
    renderNews("all");
    loadAllData();
    $(".hero-section").hide().fadeIn(800);
});

// ─── Tab system ───────────────────────────────────────────────
function switchTab(tabName, event) {
    if (event) event.preventDefault();
    activeTab = tabName;

    // Update nav links
    document.querySelectorAll(".nav-link-med[data-tab]").forEach(link => {
        link.classList.toggle("active", link.dataset.tab === tabName);
    });

    // Show/hide tab content
    ["home", "schedule", "medicines", "news"].forEach(t => {
        const el = document.getElementById("tab-" + t);
        if (el) el.style.display = t === tabName ? "block" : "none";
    });

    // Schedule tab: auth gate
    if (tabName === "schedule") {
        const gate = document.getElementById("schedule-auth-gate");
        const content = document.getElementById("schedule-content");
        if (!currentUser) {
            gate && (gate.style.display = "flex");
            content && (content.style.display = "none");
        } else {
            gate && (gate.style.display = "none");
            content && (content.style.display = "block");
            buildDaySelector();
            filterAndRender();
            initFilterPills();
        }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}
window.switchTab = switchTab;

// ─── Nav auth state ────────────────────────────────────────────
function setupNavAuth() {
    const loginBtn = document.getElementById("nav-login-btn");
    const logoutBtn = document.getElementById("nav-logout-btn");
    const adminBtn = document.getElementById("nav-admin-btn");
    const banner = document.getElementById("user-banner");

    if (currentUser) {
        loginBtn && (loginBtn.style.display = "none");
        logoutBtn && (logoutBtn.style.display = "inline-flex");
        if (currentUser.role === "admin" || currentUser.role === "doctor") {
            adminBtn && (adminBtn.style.display = "inline-flex");
        }
        if (banner) {
            banner.style.display = "flex";
            document.getElementById("banner-name").textContent = currentUser.name;
            const roleMap = { admin: "👑 Quản trị viên", doctor: "🩺 Bác sĩ", patient: "👤 Bệnh nhân" };
            document.getElementById("banner-role").textContent = roleMap[currentUser.role] || currentUser.role;
            document.getElementById("banner-avatar").textContent = currentUser.role === "admin" ? "👑" : currentUser.role === "doctor" ? "🩺" : "👤";
        }
    }
}

function logoutUser() {
    sessionStorage.removeItem("medreminder_user");
    window.location.reload();
}
window.logoutUser = logoutUser;

// ─── Load all data ─────────────────────────────────────────────
async function loadAllData() {
    try {
        const [patients, meds, schedules] = await Promise.all([getPatients(), getMedications(), getSchedules()]);
        allPatients = patients;
        allMeds = meds;
        allSchedules = schedules;

        const heroMeds = document.getElementById("hero-stat-meds");
        const heroPats = document.getElementById("hero-stat-patients");
        if (heroMeds) heroMeds.textContent = meds.length || MED_CATALOG.length;
        if (heroPats) heroPats.textContent = patients.length;

        // Only filter schedule if user is logged in
        if (currentUser) filterAndRender();
        updateStats();
    } catch (err) {
        console.error("loadAllData error:", err);
        // Still update stats with empty data
        updateStats();
    }
}

// ─── FIX: Lọc lịch theo ngày + user (bảo mật chính xác) ────────
function filterAndRender() {
    if (!currentUser) return; // không xử lý nếu chưa đăng nhập

    let filtered = allSchedules.filter(s => s.date && s.date.startsWith(selectedDate));

    // SECURITY FIX: patient chỉ được xem lịch của chính mình theo patientId
    if (currentUser.role === "patient") {
        if (currentUser.patientId) {
            filtered = filtered.filter(s => String(s.patientId) === String(currentUser.patientId));
        } else {
            // patient không có patientId → không xem được lịch của ai
            filtered = [];
        }
        const patObj = allPatients.find(p => String(p.id) === String(currentUser.patientId));
        const bpEl = document.getElementById("banner-patient");
        if (bpEl) bpEl.textContent = patObj ? patObj.name : currentUser.name;
        const schedLabel = document.getElementById("schedule-patient-label");
        if (schedLabel && patObj) schedLabel.textContent = `Lịch uống thuốc của: ${patObj.name}`;
    } else {
        // admin / doctor xem tất cả
        const bpEl = document.getElementById("banner-patient");
        if (bpEl) bpEl.textContent = "Tất cả bệnh nhân";
    }

    todayScheds = filtered;
    renderSchedule();
    renderTimeline();
    updateStats();
}

// ─── Day selector ──────────────────────────────────────────────
function buildDaySelector() {
    const wrap = document.getElementById("day-selector");
    if (!wrap || wrap.dataset.built) return;
    wrap.dataset.built = "1";
    const today = new Date();
    const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    let html = "";
    for (let i = -3; i <= 3; i++) {
        const d = new Date(today); d.setDate(today.getDate() + i);
        const ds = d.toISOString().split("T")[0];
        html += `<button class="day-btn ${i === 0 ? "active" : ""}" data-date="${ds}">
            <span class="day-name">${DAY_NAMES[d.getDay()]}</span>
            <span class="day-num">${d.getDate()}</span>
        </button>`;
    }
    wrap.innerHTML = html;
    wrap.querySelectorAll(".day-btn").forEach(btn => {
        btn.addEventListener("click", async function () {
            wrap.querySelectorAll(".day-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            selectedDate = this.dataset.date;
            await reloadSchedule();
        });
    });
}

async function reloadSchedule() {
    const sl = document.getElementById("schedule-list");
    const tl = document.getElementById("timeline-list");
    if (sl) sl.innerHTML = '<div class="spinner-med"></div>';
    if (tl) tl.innerHTML = '<div class="spinner-med"></div>';
    try {
        allSchedules = await getSchedules();
        filterAndRender();
    } catch { showToast("Không thể tải lịch uống thuốc!", "error"); }
}

// ─── Render schedule list ───────────────────────────────────────
function renderSchedule() {
    const wrap = document.getElementById("schedule-list");
    if (!wrap) return;
    let list = [...todayScheds];
    if (filterStatus !== "all") list = list.filter(s => s.status === filterStatus);
    list.sort((a, b) => (a.time || "").localeCompare(b.time || ""));

    if (list.length === 0) {
        wrap.innerHTML = `<div class="empty-state"><span class="empty-icon">💊</span><p>Không có lịch uống thuốc cho ngày này.</p></div>`;
        return;
    }
    wrap.innerHTML = list.map(s => {
        const patObj = allPatients.find(p => String(p.id) === String(s.patientId));
        const patName = s.patientName || (patObj ? patObj.name : "Bệnh nhân");
        const showPatient = currentUser && (currentUser.role === "admin" || currentUser.role === "doctor");
        return `<div class="med-card ${s.status === "taken" ? "taken" : ""}" id="sched-${s.id}">
            <div class="d-flex align-items-center gap-3">
                <div class="med-icon-wrap">${getMedIcon(s.type || "Viên nén")}</div>
                <div class="flex-grow-1">
                    <div class="med-name">${s.medicationName || s.name || "Thuốc"}</div>
                    <div class="med-dosage">${s.dosage || ""} ${s.time ? "· " + formatTime(s.time) : ""}${showPatient ? " · <span style='color:var(--accent2)'>" + patName + "</span>" : ""}</div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    ${getStatusBadge(s.status || "pending")}
                    ${s.status !== "taken"
                ? `<button class="btn-take" onclick="handleToggleTaken('${s.id}','${s.status}')">✓ Đã uống</button>`
                : `<button class="btn-take taken-btn" disabled>✓ Đã uống</button>`}
                </div>
            </div>
        </div>`;
    }).join("");
}

// ─── Render timeline ───────────────────────────────────────────
function renderTimeline() {
    const wrap = document.getElementById("timeline-list");
    if (!wrap) return;
    let list = [...todayScheds].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    if (list.length === 0) {
        wrap.innerHTML = `<div style="font-size:.84rem;color:var(--text-muted);text-align:center;padding:16px">Chưa có lịch nào hôm nay</div>`;
        return;
    }
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    wrap.innerHTML = list.map(s => {
        const [h, m] = (s.time || "00:00").split(":").map(Number);
        const schedMin = h * 60 + (m || 0);
        let dotClass = "", subText = "";
        if (s.status === "taken") { dotClass = "taken"; subText = s.takenAt ? `Đã uống lúc ${formatDateTime(s.takenAt)}` : "Đã uống"; }
        else if (s.status === "missed") { dotClass = "missed"; subText = `<span style="color:var(--accent)">Đã bỏ lỡ</span>`; }
        else if (schedMin < nowMin) { dotClass = "missed"; subText = `<span style="color:var(--accent)">Quá giờ</span>`; }
        else if (schedMin - nowMin <= 30) { dotClass = "pending"; subText = `<span style="color:#ffc107">Sắp đến giờ</span>`; }
        else { subText = "Chưa đến giờ"; }
        return `<div class="timeline-item">
            <div class="timeline-dot ${dotClass}"></div>
            <div><div style="font-weight:600;font-size:.9rem">${formatTime(s.time)} · ${s.medicationName || s.name || "Thuốc"} ${s.dosage || ""}</div>
            <div style="font-size:.8rem;color:var(--text-muted)">${subText}</div></div>
        </div>`;
    }).join("");
}

// ─── Toggle đã uống ─────────────────────────────────────────────
async function handleToggleTaken(schedId, currentStatus) {
    const card = document.getElementById("sched-" + schedId);
    if (card) {
        card.classList.add("taken");
        const btnEl = card.querySelector(".btn-take");
        if (btnEl) btnEl.outerHTML = `<button class="btn-take taken-btn" disabled>✓ Đã uống</button>`;
        const badgeEl = card.querySelector(".badge-status");
        if (badgeEl) badgeEl.outerHTML = getStatusBadge("taken");
    }
    try {
        await toggleTakenStatus(schedId, currentStatus);
        const idx = todayScheds.findIndex(s => String(s.id) === String(schedId));
        if (idx !== -1) todayScheds[idx].status = "taken";
        updateStats();
        renderTimeline();
        showToast("Đã đánh dấu uống thuốc! 💊", "success");
    } catch {
        showToast("Cập nhật thất bại, vui lòng thử lại.", "error");
        await reloadSchedule();
    }
}
window.handleToggleTaken = handleToggleTaken;

function updateStats() {
    const total = todayScheds.length;
    const taken = todayScheds.filter(s => s.status === "taken").length;
    const missed = todayScheds.filter(s => s.status === "missed").length;
    const remain = todayScheds.filter(s => s.status === "pending").length;
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl("stat-total", total); setEl("stat-taken", taken); setEl("stat-missed", missed); setEl("stat-remain", remain);
    const floatTaken = document.getElementById("float-taken");
    if (floatTaken) floatTaken.textContent = taken;
    const pct = total > 0 ? Math.round((taken / total) * 100) : 0;
    const bar = document.getElementById("progress-bar");
    if (bar) { bar.style.width = pct + "%"; bar.textContent = pct > 10 ? pct + "%" : ""; }
}

function initFilterPills() {
    document.querySelectorAll("[data-filter]").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            filterStatus = this.dataset.filter;
            renderSchedule();
        });
    });
}

// ─── Medicine Catalog ──────────────────────────────────────────
function renderMedCatalog(cat = "all", query = "") {
    const grid = document.getElementById("med-catalog-grid");
    if (!grid) return;
    let list = MED_CATALOG;
    if (cat !== "all") list = list.filter(m => m.cat === cat);
    if (query) list = list.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.brand.toLowerCase().includes(query.toLowerCase()) ||
        m.uses.toLowerCase().includes(query.toLowerCase())
    );
    if (list.length === 0) {
        grid.innerHTML = `<div class="col-12"><div class="empty-state"><span class="empty-icon">🔍</span><p>Không tìm thấy sản phẩm nào.</p></div></div>`;
        return;
    }
    grid.innerHTML = list.map(m => `
    <div class="col-md-6 col-lg-4">
        <div class="med-product-card" onclick="openMedCatalogDetail('${m.id}')">
            <div class="mpc-header">
                <div class="mpc-icon">${m.icon}</div>
                <div class="flex-grow-1">
                    <div class="mpc-name">${m.name}</div>
                    <div class="mpc-brand">${m.brand}</div>
                </div>
                <span class="mpc-type-badge">${m.type}</span>
            </div>
            <div class="mpc-uses">${m.uses.substring(0, 100)}${m.uses.length > 100 ? "..." : ""}</div>
            <div class="mpc-footer">
                <span class="mpc-dosage">💊 ${m.dosage}</span>
                <span class="mpc-detail-link">Xem chi tiết →</span>
            </div>
        </div>
    </div>`).join("");
}

function openMedCatalogDetail(id) {
    const m = MED_CATALOG.find(x => x.id === id);
    if (!m) return;
    document.getElementById("detail-med-icon").textContent = m.icon;
    document.getElementById("detail-med-name").textContent = m.name;
    document.getElementById("detail-med-type").textContent = m.type;
    document.getElementById("detail-med-cat").textContent = m.brand;
    document.getElementById("detail-med-dosage").textContent = m.dosage;
    document.getElementById("detail-med-freq").textContent = m.freq;
    document.getElementById("detail-med-uses").textContent = m.uses;
    document.getElementById("detail-med-side").textContent = m.side;
    document.getElementById("detail-med-note").textContent = m.note;
    document.getElementById("detail-med-store").textContent = m.store;
    const statusEl = document.getElementById("detail-med-status");
    if (statusEl) statusEl.innerHTML = getStatusBadge("active");
    new bootstrap.Modal(document.getElementById("medDetailModal")).show();
}
window.openMedCatalogDetail = openMedCatalogDetail;

// Category filter buttons
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".med-cat-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".med-cat-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            medCatFilter = this.dataset.cat;
            const q = document.getElementById("med-search-input")?.value || "";
            renderMedCatalog(medCatFilter, q);
        });
    });
    const medSearch = document.getElementById("med-search-input");
    if (medSearch) {
        medSearch.addEventListener("input", debounce(function () {
            renderMedCatalog(medCatFilter, this.value.trim());
        }, 300));
    }
});

// ─── News ─────────────────────────────────────────────────────
function renderNews(cat = "all") {
    const grid = document.getElementById("news-grid");
    if (!grid) return;
    let list = cat === "all" ? NEWS_DATA : NEWS_DATA.filter(n => n.cat === cat);
    grid.innerHTML = list.map(n => `
    <div class="col-md-6 col-lg-4">
        <a href="${n.link}" target="_blank" rel="noopener" class="news-card-link">
            <div class="news-card">
                <div class="news-card-header">
                    <span class="news-icon">${n.icon}</span>
                    ${n.hot ? '<span class="news-hot-badge">🔥 Hot</span>' : ''}
                </div>
                <div class="news-title">${n.title}</div>
                <div class="news-summary">${n.summary}</div>
                <div class="news-footer">
                    <span class="news-source">📰 ${n.source}</span>
                    <span class="news-date">${n.date}</span>
                </div>
                <div class="news-read-more">Đọc thêm →</div>
            </div>
        </a>
    </div>`).join("");
}

function filterNews(cat, btn) {
    document.querySelectorAll("[data-news-cat]").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderNews(cat);
}
window.filterNews = filterNews;

// ─── Global Search ─────────────────────────────────────────────
function initGlobalSearch() {
    const input = document.getElementById("global-search");
    const dropdown = document.getElementById("search-dropdown");
    if (!input || !dropdown) return;

    input.addEventListener("input", debounce(function () {
        const q = this.value.trim().toLowerCase();
        if (!q || q.length < 2) { dropdown.style.display = "none"; return; }

        const medResults = MED_CATALOG.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.brand.toLowerCase().includes(q) ||
            m.uses.toLowerCase().includes(q)
        ).slice(0, 4);

        const newsResults = NEWS_DATA.filter(n =>
            n.title.toLowerCase().includes(q) ||
            n.summary.toLowerCase().includes(q)
        ).slice(0, 3);

        if (medResults.length === 0 && newsResults.length === 0) {
            dropdown.innerHTML = `<div class="sd-empty">Không tìm thấy kết quả cho "<strong>${q}</strong>"</div>`;
            dropdown.style.display = "block";
            return;
        }

        let html = "";
        if (medResults.length > 0) {
            html += `<div class="sd-section-title">💊 Thuốc & Sản phẩm</div>`;
            html += medResults.map(m => `
            <div class="sd-item" onclick="openMedCatalogDetail('${m.id}');document.getElementById('search-dropdown').style.display='none';document.getElementById('global-search').value='';switchTab('medicines',null)">
                <span class="sd-icon">${m.icon}</span>
                <div><div class="sd-item-name">${m.name}</div><div class="sd-item-sub">${m.brand}</div></div>
            </div>`).join("");
        }
        if (newsResults.length > 0) {
            html += `<div class="sd-section-title">📰 Tin tức y tế</div>`;
            html += newsResults.map(n => `
            <div class="sd-item" onclick="window.open('${n.link}','_blank');document.getElementById('search-dropdown').style.display='none';document.getElementById('global-search').value=''">
                <span class="sd-icon">${n.icon}</span>
                <div><div class="sd-item-name">${n.title.substring(0, 60)}...</div><div class="sd-item-sub">${n.source}</div></div>
            </div>`).join("");
        }
        dropdown.innerHTML = html;
        dropdown.style.display = "block";
    }, 250));

    // Close on outside click
    document.addEventListener("click", function (e) {
        if (!e.target.closest("#navbar-search-wrap")) {
            dropdown.style.display = "none";
        }
    });

    input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { dropdown.style.display = "none"; this.value = ""; }
    });
}
