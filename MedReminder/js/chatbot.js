// ============================================================
//  chatbot.js – MedBot Nâng cấp: AI + FAQ + Liên hệ + Ảnh thuốc
//  MedReminder – Đề tài 09
// ============================================================

let chatTab = "chat"; // "chat" | "faq" | "contact"

// ─── Knowledge base mở rộng ──────────────────────────────────
const MEDBOT_KB = {
    greet: ["xin chào", "chào", "hello", "hi", "ơi", "bạn ơi", "hey"],
    schedule: ["lịch", "hôm nay", "thuốc của tôi", "bao giờ", "giờ nào", "mấy giờ", "uống thuốc khi nào"],
    paracetamol: ["paracetamol", "panadol", "tylenol", "hạ sốt", "giảm đau", "đau đầu", "sốt"],
    amoxicillin: ["amoxicillin", "amox", "augmentin", "moxipen"],
    azithromycin: ["azithromycin", "zithromax", "azibiot"],
    metronidazole: ["metronidazole", "flagyl"],
    omeprazole: ["omeprazole", "dạ dày", "trào ngược", "đau dạ dày", "ợ chua", "losec", "prilosec"],
    domperidone: ["domperidone", "motilium", "buồn nôn", "nôn", "đầy bụng"],
    smecta: ["smecta", "tiêu chảy", "diosmectite", "giardia"],
    vitamin: ["vitamin c", "redoxon", "celin", "tăng đề kháng"],
    vitaminD: ["vitamin d", "vitamin d3", "vigantol", "d-drops", "xương"],
    omega: ["omega", "omega-3", "fish oil", "dầu cá", "tim mạch"],
    ibuprofen: ["ibuprofen", "advil", "nurofen", "kháng viêm"],
    aspirin: ["aspirin", "bayer", "ecotrin", "chống đông"],
    amlodipine: ["amlodipine", "norvasc", "huyết áp", "tăng huyết áp", "cao huyết áp"],
    metformin: ["metformin", "glucophage", "tiểu đường", "đường huyết", "glucose"],
    sideEffect: ["tác dụng phụ", "phản ứng", "dị ứng", "nổi mề đay", "chóng mặt", "tác dụng"],
    meal: ["sau ăn", "trước ăn", "bụng đói", "cùng thức ăn", "no", "trước bữa"],
    missed: ["bỏ lỡ", "quên", "không uống", "bỏ sót", "lỡ", "quên uống"],
    water: ["nước", "uống bao nhiêu", "bao nhiêu nước", "nước lọc"],
    store: ["bảo quản", "cất", "để thuốc", "nhiệt độ", "tủ lạnh"],
    urgent: ["cấp cứu", "nguy hiểm", "quá liều", "uống nhầm", "overdose", "ngộ độc"],
    thanks: ["cảm ơn", "thank", "ok", "được rồi", "hiểu rồi", "oke"],
    pressure: ["huyết áp", "tăng huyết áp", "cao huyết áp", "tim mạch", "amlodipine"],
    diabetes: ["tiểu đường", "đường huyết", "glucose", "insulin", "metformin"],
    antibiotic: ["kháng sinh", "nhiễm khuẩn", "nhiễm trùng", "liệu trình kháng sinh"],
    device: ["máy đo", "huyết áp kế", "máy đường huyết", "omron", "accu-chek", "one touch"],
    kháng_sinh_chung: ["kháng sinh", "nhiễm khuẩn", "liệu trình"],
};

function getScheduleReply() {
    const scheds = (typeof todayScheds !== "undefined") ? todayScheds : [];
    if (!scheds || scheds.length === 0) {
        return "Hiện không có lịch uống thuốc nào cho ngày hôm nay.\n\n💡 Lưu ý: Bạn cần đăng nhập và có lịch được bác sĩ tạo. Vui lòng liên hệ bác sĩ để được hỗ trợ.";
    }
    const taken = scheds.filter(s => s.status === "taken").length;
    const total = scheds.length;
    const pending = scheds.filter(s => s.status === "pending");
    let reply = `📅 Lịch hôm nay: ${taken}/${total} liều đã uống.\n\n`;
    if (pending.length > 0) {
        reply += "⏳ Còn cần uống:\n";
        pending.sort((a, b) => (a.time || "").localeCompare(b.time || ""))
            .forEach(s => { reply += `• ${s.time || "?"} – ${s.medicationName || s.name || "Thuốc"} ${s.dosage || ""}\n`; });
    } else {
        reply += "✅ Bạn đã uống hết thuốc cho hôm nay! Tuyệt vời!";
    }
    return reply.trim();
}

// ─── Danh sách thuốc trong catalog để trả lời AI ─────────────
function getMedFromCatalog(name) {
    if (typeof MED_CATALOG === "undefined") return null;
    const n = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return MED_CATALOG.find(m => {
        const mn = (m.name + " " + (m.brand || "")).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return mn.includes(n) || n.includes(m.name.split(" ")[0].toLowerCase());
    });
}

const MEDBOT_REPLIES = {
    greet: () => `Xin chào! 👋 Tôi là Bác sĩ ảo MedBot.\n\nTôi có thể giúp bạn:\n• Xem lịch uống thuốc hôm nay\n• Tư vấn cách dùng thuốc cụ thể\n• Giải đáp về tác dụng phụ\n• Hướng dẫn bảo quản thuốc\n\nBạn cần hỗ trợ gì?`,
    schedule: () => getScheduleReply(),
    paracetamol: () => `💊 **Paracetamol / Panadol / Tylenol**\n\n• Công dụng: Giảm đau, hạ sốt\n• Liều thường: 500mg – 1000mg/lần\n• Cách uống: Sau ăn hoặc khi đau/sốt\n• Tối đa: 4000mg/ngày\n• Khoảng cách: ≥ 4–6 giờ giữa các liều\n\n⚠️ Không dùng khi uống rượu hoặc bệnh gan. Kiểm tra thuốc kết hợp để tránh quá liều.`,
    amoxicillin: () => `💊 **Amoxicillin 500mg**\n\n• Công dụng: Kháng sinh điều trị nhiễm khuẩn\n• Cách uống: Cùng hoặc sau bữa ăn\n• Liều: 500mg × 3 lần/ngày\n• Liệu trình: 5–7 ngày (theo chỉ định BS)\n\n⚠️ Uống đủ liệu trình – không tự dừng dù đã hết triệu chứng\n⚠️ Báo BS ngay nếu nổi mẩn dị ứng\n⚠️ Không dùng nếu dị ứng Penicillin`,
    azithromycin: () => `💊 **Azithromycin 500mg (Zithromax)**\n\n• Công dụng: Nhiễm khuẩn hô hấp, viêm phổi\n• Liều: 500mg ngày đầu → 250mg/ngày × 4 ngày\n• Uống 1 lần/ngày, bất kể bữa ăn\n\n⚠️ Có thể ảnh hưởng nhịp tim – báo BS nếu dùng thuốc tim\n⚠️ Không uống cùng antacid (thuốc dạ dày)`,
    metronidazole: () => `💊 **Metronidazole (Flagyl)**\n\n• Công dụng: Nhiễm khuẩn kỵ khí, Giardia, viêm đại tràng\n• Liều: 400mg × 3 lần/ngày, 5–7 ngày\n• Có thể gây vị kim loại trong miệng\n\n🚫 TUYỆT ĐỐI không uống rượu khi dùng và 48 giờ sau kết thúc!`,
    omeprazole: () => `💊 **Omeprazole / Losec**\n\n• Công dụng: Giảm acid dạ dày, trào ngược GERD\n• Cách uống: Trước bữa sáng 30 phút\n• Nuốt nguyên viên – không nhai/nghiền\n\n⚠️ Dùng lâu dài cần bổ sung Magie & Vitamin B12\n⚠️ Không tự dừng đột ngột`,
    domperidone: () => `💊 **Domperidone (Motilium)**\n\n• Công dụng: Chống buồn nôn, đầy bụng, khó tiêu\n• Liều: 10mg × 3 lần/ngày, trước ăn 15–30 phút\n\n⚠️ Không dùng quá 7 ngày liên tục\n⚠️ Tránh dùng chung thuốc chống nấm azole`,
    smecta: () => `💊 **Smecta (Diosmectite)**\n\n• Công dụng: Tiêu chảy cấp và mãn tính\n• Cách dùng: 1 gói pha với 50ml nước, uống 3 lần/ngày\n\n💡 Uống cách các thuốc khác ≥ 2 giờ vì Smecta có thể giảm hấp thu thuốc khác`,
    vitamin: () => `🌿 **Vitamin C (Redoxon)**\n\n• Công dụng: Tăng đề kháng, chống oxy hóa, hấp thu sắt\n• Liều: 500–1000mg/ngày sau bữa ăn\n\n💡 Không cần dùng liều quá cao. Liều cao có thể gây sỏi thận ở người nhạy cảm.`,
    vitaminD: () => `🌿 **Vitamin D3**\n\n• Công dụng: Hấp thu canxi, xương khớp, miễn dịch\n• Liều: 1000–2000 IU/ngày cùng bữa ăn có chất béo\n• Dạng: Viên nén, giọt (D-Drops, Vigantol)\n\n💡 Xét nghiệm nồng độ D3 trước khi bổ sung liều cao`,
    omega: () => `🌿 **Omega-3 Fish Oil**\n\n• Công dụng: Tim mạch, giảm triglyceride, não bộ\n• Liều: 1000–2000mg/ngày cùng bữa ăn\n\n💡 Mua sản phẩm có chứng nhận kiểm định. Uống sau ăn để giảm mùi tanh.\n💡 Bảo quản tủ lạnh sau khi mở nắp`,
    ibuprofen: () => `💊 **Ibuprofen (Advil, Nurofen)**\n\n• Công dụng: Giảm đau, hạ sốt, kháng viêm\n• Liều: 200–400mg/lần, tối đa 1200mg/ngày\n• Uống sau bữa ăn\n\n⚠️ Không dùng khi đói\n⚠️ Tránh nếu bệnh thận, dạ dày\n⚠️ Không dùng chung Aspirin`,
    aspirin: () => `💊 **Aspirin (Bayer)**\n\n• Liều thấp (81mg): Phòng nhồi máu cơ tim, đột quỵ\n• Liều cao (325–650mg): Giảm đau, hạ sốt\n\n⚠️ Không dùng cho trẻ < 16 tuổi\n⚠️ Nguy cơ chảy máu – báo BS tất cả thuốc đang dùng`,
    amlodipine: () => `❤️ **Amlodipine (Norvasc)**\n\n• Công dụng: Huyết áp cao, đau thắt ngực\n• Liều: 5–10mg, 1 lần/ngày cùng giờ\n\n⚠️ Không tự dừng thuốc đột ngột\n📞 Tái khám định kỳ mỗi 3–6 tháng\n💡 Đo huyết áp hàng ngày và ghi lại`,
    metformin: () => `🩸 **Metformin (Glucophage)**\n\n• Công dụng: Tiểu đường type 2, kiểm soát đường huyết\n• Liều: 500–1000mg × 2–3 lần/ngày cùng bữa ăn\n\n⚠️ Tạm dừng trước phẫu thuật và chụp X-quang cản quang\n⚠️ Uống cùng bữa ăn để giảm buồn nôn, tiêu chảy`,
    sideEffect: () => `⚠️ **Tác dụng phụ thường gặp:**\n\n• Buồn nôn, chóng mặt → Thử uống sau ăn\n• Nổi mẩn, ngứa → Ngừng ngay & gặp BS\n• Tiêu chảy (kháng sinh) → Uống men vi sinh\n• Đau dạ dày → Uống sau bữa ăn\n• Khô miệng → Uống nhiều nước hơn\n\n🚨 Phản ứng nghiêm trọng: đến cơ sở y tế ngay!`,
    meal: () => `🍽️ **Hướng dẫn uống thuốc theo bữa ăn:**\n\n✅ Trước ăn 30 phút: Omeprazole, Domperidone\n✅ Cùng bữa ăn: Amoxicillin, Vitamin D, Ibuprofen, Metformin, Omega-3\n✅ Sau ăn 30 phút: Paracetamol, Aspirin, Vitamin C\n✅ Không phụ thuộc bữa ăn: Azithromycin\n\n📌 Luôn đọc hướng dẫn hoặc hỏi dược sĩ!`,
    missed: () => `❓ **Quên uống thuốc?**\n\n• Nếu nhớ sớm (< 2 giờ): Uống ngay\n• Nếu gần giờ liều tiếp theo: Bỏ qua liều đó\n\n⚠️ KHÔNG uống gấp đôi liều để bù\n💡 Bật thông báo nhắc nhở trên ứng dụng để tránh quên!`,
    water: () => `💧 **Uống nước khi dùng thuốc:**\n\n• Luôn uống thuốc với ≥ 200ml nước lọc\n• Uống đủ 1.5–2 lít nước mỗi ngày\n• Tránh uống thuốc với: sữa, nước trái cây, rượu\n• Uống khi đứng hoặc ngồi thẳng\n• Không nằm xuống ngay sau khi uống`,
    store: () => `📦 **Bảo quản thuốc đúng cách:**\n\n• Nhiệt độ phòng (15–30°C), tránh ẩm\n• Tránh ánh nắng trực tiếp\n• Để xa tầm tay trẻ em\n• Thuốc lỏng đã mở: thường để tủ lạnh\n• Không để trong phòng tắm (ẩm)\n• Kiểm tra hạn dùng thường xuyên\n• Omega-3: bảo quản tủ lạnh sau khi mở`,
    urgent: () => `🚨 **KHẨN CẤP – Quá liều hoặc uống nhầm:**\n\n1. GỌI NGAY 115 hoặc đến cấp cứu gần nhất\n2. Mang theo hộp thuốc hoặc ghi tên thuốc\n3. Không tự gây nôn trừ khi được hướng dẫn\n4. Giữ bình tĩnh và chờ hỗ trợ y tế\n\n📞 Cấp cứu: 115\n📞 Chống độc: 024 3869 3731`,
    pressure: () => `❤️ **Thông tin huyết áp:**\n\n• Bình thường: < 120/80 mmHg\n• Tăng huyết áp: ≥ 140/90 mmHg\n• Đo 2 lần sáng/tối sau nghỉ 5 phút\n\n💊 Thuốc thường dùng: Amlodipine, Lisinopril\n⚠️ Không tự dừng thuốc huyết áp đột ngột\n📞 Tái khám định kỳ mỗi 3–6 tháng`,
    diabetes: () => `🩸 **Thông tin đường huyết:**\n\n• Đường huyết đói bình thường: 3.9–6.1 mmol/L\n• Sau ăn 2 giờ: < 7.8 mmol/L\n\n💊 Metformin là lựa chọn đầu tay cho type 2\n🍽️ Chế độ ăn ít đường, ít tinh bột rất quan trọng\n🏃 Vận động 30 phút/ngày giúp kiểm soát đường huyết`,
    antibiotic: () => `🧫 **Kháng sinh – Lưu ý quan trọng:**\n\n• Luôn uống đủ liệu trình (không dừng sớm)\n• Không tự mua kháng sinh khi chưa có đơn BS\n• Các kháng sinh phổ biến: Amoxicillin, Azithromycin, Metronidazole\n• Uống men vi sinh để bổ sung lợi khuẩn\n\n⚠️ Lạm dụng kháng sinh gây kháng thuốc – nguy cơ toàn cầu!`,
    device: () => `🩺 **Thiết bị y tế tại nhà:**\n\n**Máy đo huyết áp (Omron, Beurer):**\n• Đo 1–2 lần/ngày (sáng + tối)\n• Ngồi nghỉ 5 phút trước khi đo\n• Đặt vòng tay ngang tim\n\n**Máy đo đường huyết (Accu-Chek, One Touch):**\n• Rửa tay trước khi đo\n• Ghi nhật ký kết quả để báo BS\n• Hiệu chuẩn máy định kỳ`,
    thanks: () => `Không có gì! 😊 Chúc bạn sức khỏe tốt và uống thuốc đúng giờ nhé!\n\nNếu có thắc mắc gì thêm, tôi luôn sẵn sàng hỗ trợ! 💊`,
    kháng_sinh_chung: () => `🧫 **Kháng sinh – Lưu ý quan trọng:**\n\n• Uống đủ liệu trình (không dừng sớm)\n• Không tự mua khi chưa có đơn BS\n• Các kháng sinh phổ biến: Amoxicillin, Azithromycin, Metronidazole\n• Uống men vi sinh để bổ sung lợi khuẩn`,
    default: () => `Cảm ơn bạn đã hỏi! Tôi có thể giúp về:\n\n• 📅 Lịch uống thuốc hôm nay\n• 💊 Paracetamol, Ibuprofen, Aspirin, Amoxicillin, Azithromycin, Omeprazole, Metformin, Amlodipine...\n• 🌿 Vitamin C, D3, Omega-3\n• 🍽️ Uống thuốc trước/sau ăn\n• ⚠️ Tác dụng phụ\n• ❓ Quên uống thuốc\n• 📦 Bảo quản thuốc\n\nHoặc liên hệ bác sĩ để được tư vấn chính xác! 🩺`,
};

function detectIntent(msg) {
    const normalize = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const lower = normalize(msg);
    for (const [intent, keywords] of Object.entries(MEDBOT_KB)) {
        if (keywords.some(kw => lower.includes(normalize(kw)))) return intent;
    }
    return "default";
}

// ─── FAQ Data ─────────────────────────────────────────────────
const FAQ_DATA = [
    {
        q: "Tôi có thể xem lịch uống thuốc mà không cần đăng nhập không?",
        a: "Không. Lịch uống thuốc là thông tin cá nhân cần xác thực. Bạn cần đăng nhập với tài khoản bệnh nhân để xem lịch của mình."
    },
    {
        q: "Làm thế nào để đăng ký tài khoản mới?",
        a: "Truy cập trang Đăng nhập → nhấn 'Đăng ký ngay'. Điền họ tên, tên đăng nhập và mật khẩu (tối thiểu 6 ký tự). Tài khoản mới mặc định là vai trò Bệnh nhân."
    },
    {
        q: "Quên uống thuốc, tôi có thể uống bù không?",
        a: "Nếu nhớ ra trong vòng 2 giờ → uống ngay. Nếu gần đến giờ liều tiếp theo → bỏ qua và uống bình thường. Tuyệt đối KHÔNG uống gấp đôi liều để bù."
    },
    {
        q: "Thông tin thuốc trên web có chính xác không?",
        a: "Thông tin tham khảo từ WHO, BYT Việt Nam và tài liệu dược lý chuẩn. Tuy nhiên đây chỉ là tham khảo – luôn tuân thủ chỉ định của bác sĩ điều trị."
    },
    {
        q: "Làm thế nào để bác sĩ thêm lịch uống thuốc cho tôi?",
        a: "Bác sĩ hoặc admin đăng nhập vào trang Quản trị → Lịch uống thuốc → Thêm lịch. Chọn bệnh nhân, thuốc, ngày giờ và liều dùng."
    },
    {
        q: "Tôi có thể đánh dấu đã uống thuốc ở đâu?",
        a: "Vào tab 'Lịch uống thuốc' → chọn ngày → nhấn nút '✓ Đã uống' cạnh mỗi lịch thuốc. Trạng thái sẽ cập nhật ngay lập tức."
    },
    {
        q: "Thuốc & Sản phẩm trên trang chủ có gì?",
        a: "Trang Thuốc & Sản phẩm cung cấp thông tin 16+ loại thuốc và thiết bị y tế: công dụng, liều dùng, tác dụng phụ, lưu ý và cách bảo quản. Có thể lọc theo danh mục và tìm kiếm."
    },
    {
        q: "Làm thế nào để liên hệ hỗ trợ kỹ thuật?",
        a: "Gửi email đến medreminder@fit.edu.vn hoặc gọi hotline 1800-9999. Thời gian hỗ trợ: T2–T6, 8:00–17:00. Ngoài giờ có thể chat với MedBot."
    },
];

// ─── Contact info ─────────────────────────────────────────────
const CONTACT_HTML = `
<div class="cb-contact-item">
    <div class="cb-contact-icon">📞</div>
    <div>
        <div class="cb-contact-label">Hotline hỗ trợ</div>
        <div class="cb-contact-val">1800-9999 (Miễn phí)</div>
        <div class="cb-contact-sub">T2–T6: 8:00 – 17:00</div>
    </div>
</div>
<div class="cb-contact-item">
    <div class="cb-contact-icon">📧</div>
    <div>
        <div class="cb-contact-label">Email</div>
        <div class="cb-contact-val">medreminder@fit.edu.vn</div>
        <div class="cb-contact-sub">Phản hồi trong 24 giờ</div>
    </div>
</div>
<div class="cb-contact-item">
    <div class="cb-contact-icon">📍</div>
    <div>
        <div class="cb-contact-label">Địa chỉ</div>
        <div class="cb-contact-val">Trường ĐH Bách khoa Hà Nội</div>
        <div class="cb-contact-sub">Số 1 Đại Cồ Việt, Hai Bà Trưng, HN</div>
    </div>
</div>
<div class="cb-contact-item">
    <div class="cb-contact-icon">🆘</div>
    <div>
        <div class="cb-contact-label">Cấp cứu y tế</div>
        <div class="cb-contact-val" style="color:#ff6b9d;font-weight:700;font-size:1.1rem">115</div>
        <div class="cb-contact-sub">Trung tâm chống độc: 024 3869 3731</div>
    </div>
</div>
<div style="margin-top:12px;padding:10px;background:rgba(0,212,170,0.06);border-radius:10px;font-size:0.78rem;color:var(--text-secondary,#aaa);text-align:center">
    💡 Nhóm 7 – FIT4015 | MedReminder v2.0
</div>`;

// ─── Chat bubble helpers ──────────────────────────────────────
function cbAddBubble(text, type) {
    if (chatTab !== "chat") return;
    const body = document.getElementById("chatbot-body");
    if (!body) return;
    const b = document.createElement("div");
    b.className = `cb-bubble cb-${type}`;
    b.style.whiteSpace = "pre-wrap";
    b.textContent = text;
    body.appendChild(b);
    setTimeout(() => { body.scrollTop = body.scrollHeight; }, 50);
}

function cbShowTyping() {
    const body = document.getElementById("chatbot-body");
    if (!body) return;
    cbRemoveTyping();
    const t = document.createElement("div");
    t.className = "cb-bubble cb-bot cb-typing-indicator";
    t.innerHTML = `<div class="cb-typing"><div class="cb-dot"></div><div class="cb-dot"></div><div class="cb-dot"></div></div>`;
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
}

function cbRemoveTyping() {
    const t = document.querySelector(".cb-typing-indicator");
    if (t) t.remove();
}

function cbReply(msg) {
    cbShowTyping();
    const delay = 700 + Math.random() * 400;
    setTimeout(() => {
        cbRemoveTyping();
        const intent = detectIntent(msg);
        const replyFn = MEDBOT_REPLIES[intent] || MEDBOT_REPLIES.default;
        try { cbAddBubble(replyFn(), "bot"); }
        catch (e) { cbAddBubble(MEDBOT_REPLIES.default(), "bot"); }
    }, delay);
}

function cbQuick(msg) {
    if (chatTab !== "chat") switchChatTab("chat");
    cbAddBubble(msg, "user");
    cbReply(msg);
}

function cbSend() {
    if (chatTab !== "chat") return;
    const input = document.getElementById("chatbot-input");
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    cbAddBubble(val, "user");
    input.value = "";
    cbReply(val);
}

// ─── Tab switching ────────────────────────────────────────────
function switchChatTab(tab) {
    chatTab = tab;
    ["chat", "faq", "contact"].forEach(t => {
        const btn = document.getElementById("cb-tab-" + t);
        const pane = document.getElementById("cb-pane-" + t);
        if (btn) btn.classList.toggle("active", t === tab);
        if (pane) pane.style.display = t === tab ? "flex" : "none";
    });
    if (tab === "faq") renderFAQ();
    if (tab === "contact") renderContact();
}
window.switchChatTab = switchChatTab;

function renderFAQ() {
    const pane = document.getElementById("cb-pane-faq");
    if (!pane || pane.dataset.rendered) return;
    pane.dataset.rendered = "1";
    pane.innerHTML = `<div class="cb-faq-list">${FAQ_DATA.map((f, i) => `
        <div class="cb-faq-item" onclick="toggleFAQ(${i})">
            <div class="cb-faq-q"><span class="cb-faq-icon">💬</span>${f.q}<span class="cb-faq-arrow" id="faq-arrow-${i}">▾</span></div>
            <div class="cb-faq-a" id="faq-a-${i}" style="display:none">${f.a}</div>
        </div>`).join("")}</div>`;
}

function toggleFAQ(i) {
    const el = document.getElementById("faq-a-" + i);
    const arrow = document.getElementById("faq-arrow-" + i);
    if (!el) return;
    const isOpen = el.style.display !== "none";
    el.style.display = isOpen ? "none" : "block";
    if (arrow) arrow.textContent = isOpen ? "▾" : "▴";
}
window.toggleFAQ = toggleFAQ;

function renderContact() {
    const pane = document.getElementById("cb-pane-contact");
    if (!pane || pane.dataset.rendered) return;
    pane.dataset.rendered = "1";
    pane.innerHTML = `<div class="cb-contact-list">${CONTACT_HTML}</div>`;
}

// ─── Toggle chatbot window ────────────────────────────────────
function toggleChatbot() {
    const win = document.getElementById("chatbot-window");
    const badge = document.getElementById("chat-badge");
    if (!win) return;
    const isOpen = win.classList.contains("open");
    win.classList.toggle("open");
    if (badge) badge.style.display = "none";
    if (!isOpen) {
        setTimeout(() => {
            const input = document.getElementById("chatbot-input");
            if (input && chatTab === "chat") input.focus();
        }, 300);
    }
}

window.cbQuick = cbQuick;
window.cbSend = cbSend;
window.toggleChatbot = toggleChatbot;
window.switchChatTab = switchChatTab;