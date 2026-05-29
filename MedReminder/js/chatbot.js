// ============================================================
//  chatbot.js – MedBot v3.0 – FAQ + Liên hệ + AI nâng cao
//  Hỗ trợ tra cứu mọi thuốc trong catalog
// ============================================================

// ─── Tab state ────────────────────────────────────────────────
let chatbotTab = "chat";

// ─── FAQ Data ─────────────────────────────────────────────────
const FAQ_DATA = [
    {
        q: "MedReminder là gì?",
        a: "MedReminder là ứng dụng quản lý lịch uống thuốc thông minh, giúp bệnh nhân theo dõi và không bỏ lỡ liều thuốc quan trọng. Hỗ trợ nhắc nhở, tra cứu thuốc và tư vấn y tế cơ bản."
    },
    {
        q: "Làm thế nào để thêm lịch uống thuốc?",
        a: "Đăng nhập với tài khoản bác sĩ hoặc admin → Vào trang Quản trị → Chọn 'Lịch uống thuốc' → Nhấn '+ Thêm lịch'. Chọn bệnh nhân, thuốc, ngày giờ và liều dùng."
    },
    {
        q: "Tôi quên uống thuốc phải làm sao?",
        a: "Nếu nhớ ra sớm (trong vòng 2 giờ): Uống ngay khi nhớ. Nếu sắp đến giờ liều tiếp theo: Bỏ qua liều đó và tiếp tục lịch bình thường. Không bao giờ uống gấp đôi liều để bù."
    },
    {
        q: "Có thể tra cứu thông tin thuốc ở đâu?",
        a: "Trên trang chủ, chọn tab '💊 Thuốc & Sản phẩm' để xem toàn bộ danh mục thuốc. Bạn cũng có thể dùng ô tìm kiếm trên thanh điều hướng để tìm nhanh."
    },
    {
        q: "Thuốc nên uống trước hay sau ăn?",
        a: "Tùy loại thuốc: Uống TRƯỚC ăn 30 phút: Omeprazole, Metformin. Uống CÙNG bữa ăn: Amoxicillin, Vitamin D, Ibuprofen. Uống SAU ăn: Paracetamol, Aspirin. Luôn đọc hướng dẫn trên bao bì hoặc hỏi dược sĩ."
    },
    {
        q: "Làm thế nào để bảo quản thuốc đúng cách?",
        a: "Để ở nhiệt độ phòng (15–30°C), tránh ẩm và ánh nắng trực tiếp. Không để thuốc trong phòng tắm. Để xa tầm tay trẻ em. Kiểm tra hạn dùng thường xuyên. Một số thuốc dạng lỏng cần để tủ lạnh sau khi mở."
    },
    {
        q: "Tôi có thể đăng ký tài khoản mới không?",
        a: "Có! Vào trang Đăng nhập → Nhấn 'Đăng ký ngay'. Điền đầy đủ họ tên, tên đăng nhập và mật khẩu (ít nhất 6 ký tự). Tài khoản mới mặc định là vai trò bệnh nhân."
    },
    {
        q: "Bác sĩ ảo MedBot có thể làm gì?",
        a: "MedBot có thể: Xem lịch uống thuốc hôm nay, tra cứu thông tin về hàng trăm loại thuốc, tư vấn cách dùng thuốc và bữa ăn, giải đáp về tác dụng phụ, hướng dẫn xử lý khi quên uống thuốc và thông tin huyết áp, đường huyết."
    },
    {
        q: "Ứng dụng có miễn phí không?",
        a: "MedReminder hoàn toàn miễn phí cho bệnh nhân. Các tính năng quản lý nâng cao dành cho bác sĩ và bệnh viện có thể được cung cấp theo gói dịch vụ riêng."
    },
    {
        q: "Dữ liệu của tôi có được bảo mật không?",
        a: "Có. Dữ liệu bệnh nhân được mã hóa và chỉ bác sĩ phụ trách mới có quyền xem. Bệnh nhân chỉ thấy lịch uống thuốc của chính mình. Chúng tôi không chia sẻ thông tin cá nhân với bên thứ ba."
    }
];

// ─── Knowledge Base ──────────────────────────────────────────
const MEDBOT_KB = {
    greet: ["xin chào", "chào", "hello", "hi", "ơi", "bạn ơi", "hey"],
    schedule: ["lịch", "hôm nay", "thuốc của tôi", "bao giờ", "giờ nào", "mấy giờ", "uống thuốc khi nào", "lịch uống"],
    sideEffect: ["tác dụng phụ", "phản ứng", "dị ứng", "nổi mề đay", "chóng mặt", "tác dụng", "phản ứng phụ"],
    meal: ["sau ăn", "trước ăn", "bụng đói", "cùng thức ăn", "no", "trước bữa", "sau bữa", "cùng bữa"],
    missed: ["bỏ lỡ", "quên", "không uống", "bỏ sót", "lỡ", "quên uống", "bỏ quên"],
    water: ["nước", "uống bao nhiêu", "bao nhiêu nước", "nước lọc", "uống nước"],
    store: ["bảo quản", "cất", "để thuốc", "nhiệt độ", "tủ lạnh", "cất giữ"],
    urgent: ["cấp cứu", "nguy hiểm", "quá liều", "uống nhầm", "overdose", "ngộ độc", "khẩn cấp"],
    thanks: ["cảm ơn", "thank", "ok", "được rồi", "hiểu rồi", "oke", "tốt", "hay"],
    pressure: ["huyết áp", "tăng huyết áp", "cao huyết áp", "tim mạch", "đo huyết áp"],
    diabetes: ["tiểu đường", "đường huyết", "glucose", "insulin", "đo đường huyết"],
    dosage: ["liều", "liều dùng", "uống bao nhiêu", "bao nhiêu mg", "liều lượng"],
    interaction: ["tương tác", "kết hợp thuốc", "dùng chung", "uống chung", "phối hợp"],
    children: ["trẻ em", "em bé", "trẻ nhỏ", "con tôi", "trẻ con"],
    pregnancy: ["thai kỳ", "mang thai", "có thai", "phụ nữ mang thai", "bầu bí"],
    elderly: ["người già", "cao tuổi", "người lớn tuổi", "ông bà"],
};

// ─── Dynamic drug intent detection from catalog ───────────────
function detectDrugFromCatalog(msg) {
    const lower = msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const catalog = typeof getFullMedCatalog === "function" ? getFullMedCatalog() : (window.MED_CATALOG || []);
    for (const med of catalog) {
        const nameNorm = med.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const brands = med.brand.split(",").map(b => b.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        if (lower.includes(nameNorm.split(" ")[0]) || brands.some(b => lower.includes(b.split(" ")[0]))) {
            return med;
        }
    }
    return null;
}

function buildDrugReply(med) {
    return `💊 **${med.name}** (${med.brand})\n\n` +
        `📋 Dạng thuốc: ${med.type}\n` +
        `💉 Liều dùng: ${med.dosage}\n` +
        `🕐 Tần suất: ${med.freq}\n\n` +
        `✅ Công dụng:\n${med.uses}\n\n` +
        `⚠️ Tác dụng phụ:\n${med.side}\n\n` +
        `📌 Lưu ý:\n${med.note}\n\n` +
        `📦 Bảo quản: ${med.store}` +
        (med.price ? `\n💰 Giá tham khảo: ${med.price}` : "");
}

function getScheduleReply() {
    const scheds = (typeof todayScheds !== "undefined") ? todayScheds : [];
    if (!scheds || scheds.length === 0) {
        return "Hiện không có lịch uống thuốc nào cho ngày hôm nay.\n\n💡 Lưu ý: Bạn cần đăng nhập và có lịch được bác sĩ tạo để xem thông tin này. Vui lòng liên hệ bác sĩ để được hỗ trợ.";
    }
    const taken = scheds.filter(s => s.status === "taken").length;
    const total = scheds.length;
    const pending = scheds.filter(s => s.status === "pending");
    let reply = `📅 Lịch hôm nay: ${taken}/${total} liều đã uống.\n\n`;
    if (pending.length > 0) {
        reply += "⏳ Còn cần uống:\n";
        pending.sort((a, b) => (a.time || "").localeCompare(b.time || ""))
            .forEach(s => {
                reply += `• ${s.time || "?"} – ${s.medicationName || s.name || "Thuốc"} ${s.dosage || ""}\n`;
            });
    } else {
        reply += "✅ Bạn đã uống hết thuốc cho hôm nay! Tuyệt vời!";
    }
    return reply.trim();
}

const MEDBOT_REPLIES = {
    greet: () => `Xin chào! 👋 Tôi là Bác sĩ ảo MedBot.\n\nTôi có thể giúp bạn:\n• 📅 Xem lịch uống thuốc hôm nay\n• 💊 Tra cứu mọi loại thuốc trong hệ thống\n• 🍽️ Tư vấn cách dùng thuốc và bữa ăn\n• ⚠️ Giải đáp về tác dụng phụ\n• ❓ Xử lý khi quên uống thuốc\n\nBạn cần hỗ trợ gì?`,
    schedule: () => getScheduleReply(),
    sideEffect: () => `⚠️ Tác dụng phụ thường gặp và cách xử lý:\n\n• 🤢 Buồn nôn, chóng mặt → Thử uống sau ăn\n• 🔴 Nổi mẩn, ngứa → Ngừng thuốc ngay và gặp BS\n• 💩 Tiêu chảy (kháng sinh) → Uống men vi sinh song song\n• 😮 Đau dạ dày → Uống sau bữa ăn hoặc đổi thuốc\n• 👄 Khô miệng → Uống thêm nước\n\n🚨 Phản ứng nghiêm trọng: KHÓ THỞ, SƯng mặt, tụt huyết áp → Đến cơ sở y tế NGAY!`,
    meal: () => `🍽️ Hướng dẫn uống thuốc theo bữa ăn:\n\n✅ Trước ăn 30 phút: Omeprazole, Metformin, Domperidone\n✅ Cùng bữa ăn: Amoxicillin, Ibuprofen, Vitamin D3, Omega-3\n✅ Sau ăn 30 phút: Paracetamol, Aspirin, Vitamin C\n✅ Không phụ thuộc bữa ăn: Nhiều loại Vitamin C, Azithromycin\n\n📌 Luôn đọc hướng dẫn trên hộp thuốc hoặc hỏi dược sĩ!\n💧 Uống với ít nhất 200ml nước lọc.`,
    missed: () => `❓ Quên uống thuốc?\n\n⏰ Nếu nhớ ra SỚM (< 2 giờ sau giờ dự kiến):\n→ Uống ngay khi nhớ ra\n\n⏰ Nếu GẦN GIỜ liều tiếp theo:\n→ Bỏ qua liều đó, uống liều tiếp theo đúng giờ\n\n🚫 KHÔNG uống gấp đôi liều để bù\n📱 Bật thông báo nhắc nhở trong ứng dụng\n\n⚠️ Thuốc đặc biệt (kháng sinh, thuốc huyết áp, insulin): Hỏi BS hoặc dược sĩ khi quên liều.`,
    water: () => `💧 Uống nước khi dùng thuốc:\n\n• Luôn uống thuốc với ít nhất 200ml nước lọc\n• Uống đủ 1.5–2 lít nước mỗi ngày\n• ❌ Tránh uống thuốc với: sữa, nước cam, nước bưởi, rượu bia\n• Nước bưởi có thể tăng nồng độ nhiều loại thuốc tim mạch\n• Sữa cản trở hấp thu một số kháng sinh\n• Uống khi đứng hoặc ngồi thẳng, không nằm xuống ngay sau khi uống`,
    store: () => `📦 Bảo quản thuốc đúng cách:\n\n🌡️ Nhiệt độ phòng (15–30°C), tránh ẩm\n☀️ Tránh ánh nắng trực tiếp và nguồn nhiệt\n👶 Để xa tầm tay trẻ em\n❄️ Thuốc dạng lỏng đã mở nắp: thường để tủ lạnh\n🚿 Không để trong phòng tắm (quá ẩm)\n📅 Kiểm tra hạn dùng trước khi uống\n🗑️ Thuốc hết hạn: vứt vào thùng rác, không đổ xuống cống`,
    urgent: () => `🚨 KHẨN CẤP – Quá liều hoặc uống nhầm thuốc:\n\n1️⃣ GỌI NGAY 115 hoặc đến cấp cứu gần nhất\n2️⃣ Mang theo hộp thuốc hoặc ghi tên thuốc, liều đã uống\n3️⃣ Không tự gây nôn trừ khi được BS hướng dẫn\n4️⃣ Giữ bình tĩnh và chờ hỗ trợ y tế\n\n📞 Đường dây khẩn cấp:\n• Cấp cứu: 115\n• Chống độc BV Bạch Mai: 024 3869 3731\n• Chống độc BV Chợ Rẫy: 028 3855 4137`,
    pressure: () => `❤️ Thông tin về huyết áp:\n\n📊 Phân loại:\n• Bình thường: < 120/80 mmHg\n• Tiền tăng huyết áp: 120–139/80–89\n• Tăng huyết áp độ 1: 140–159/90–99\n• Tăng huyết áp độ 2: ≥ 160/100\n\n💊 Thuốc phổ biến: Amlodipine, Lisinopril, Losartan, Atenolol\n⏰ Đo 2 lần/ngày: sáng sau ngủ dậy & tối trước ngủ\n⚠️ Không tự dừng thuốc đột ngột\n🏃 Lối sống: giảm muối, bỏ thuốc lá, tập thể dục`,
    diabetes: () => `🩸 Thông tin về đường huyết:\n\n📊 Chỉ số tham chiếu:\n• Đường huyết đói bình thường: 3.9–6.1 mmol/L\n• Tiền tiểu đường (đói): 6.1–6.9 mmol/L\n• Tiểu đường (đói): ≥ 7.0 mmol/L\n• Sau ăn 2h bình thường: < 7.8 mmol/L\n\n💊 Metformin: lựa chọn đầu tay cho tiểu đường type 2\n🍽️ Ăn ít tinh bột, đường; tăng rau xanh và protein\n🏃 Vận động 30 phút/ngày giúp kiểm soát đường huyết\n📈 Kiểm tra HbA1c mỗi 3 tháng`,
    dosage: () => `💊 Hướng dẫn liều dùng an toàn:\n\n✅ Luôn uống đúng liều bác sĩ kê\n✅ Không tự tăng liều khi thấy chưa hiệu quả\n✅ Không giảm liều khi thấy đỡ\n✅ Đọc kỹ tờ hướng dẫn sử dụng\n\n⚠️ Nhóm cần điều chỉnh liều đặc biệt:\n• Người cao tuổi: thường cần liều thấp hơn\n• Trẻ em: tính theo cân nặng\n• Bệnh thận/gan: có thể cần giảm liều\n\n❓ Muốn biết liều cụ thể của một thuốc? Hỏi tôi tên thuốc đó!`,
    interaction: () => `🔗 Tương tác thuốc quan trọng cần biết:\n\n❌ Cặp tránh kết hợp:\n• Aspirin + Ibuprofen: tăng nguy cơ chảy máu\n• Warfarin + Aspirin: xuất huyết nghiêm trọng\n• Metronidazole + Rượu: phản ứng nặng\n• Nước bưởi + Statin/Amlodipine: tăng nồng độ thuốc\n• Ciprofloxacin + Antacid: giảm hấp thu kháng sinh\n\n📌 Luôn thông báo cho BS/dược sĩ tất cả thuốc đang dùng (kể cả thực phẩm bổ sung, thảo dược)`,
    children: () => `👶 Dùng thuốc cho trẻ em:\n\n⚖️ Liều tính theo cân nặng (mg/kg)\n✅ An toàn cho trẻ: Paracetamol siro, Ibuprofen (>3 tháng)\n❌ Không dùng cho trẻ <16 tuổi: Aspirin (nguy cơ Hội chứng Reye)\n❌ Không dùng cho trẻ <2 tuổi: nhiều thuốc ho, cảm lạnh\n\n📌 Luôn dùng ống đo liều, không dùng thìa ăn\n🏥 Trẻ < 3 tháng bệnh: đến BS ngay, không tự dùng thuốc`,
    pregnancy: () => `🤰 Dùng thuốc khi mang thai:\n\n✅ TƯƠNG ĐỐI AN TOÀN:\n• Paracetamol: giảm đau, hạ sốt (liều thấp, ngắn hạn)\n• Vitamin B6: buồn nôn thai kỳ\n• Sắt, Axit folic: bổ sung thiết yếu\n\n❌ TRÁNH HOÀN TOÀN:\n• Ibuprofen, Aspirin (đặc biệt tam cá nguyệt 3)\n• Tetracycline, Fluoroquinolone\n• Warfarin, Methotrexate\n\n⚠️ Không dùng bất kỳ thuốc nào khi mang thai mà chưa hỏi BS!`,
    elderly: () => `👴 Dùng thuốc cho người cao tuổi:\n\n⚠️ Đặc điểm cần lưu ý:\n• Chức năng gan/thận giảm → thuốc thải chậm hơn\n• Dễ bị tác dụng phụ hơn\n• Thường dùng nhiều thuốc → nguy cơ tương tác cao\n\n📌 Nguyên tắc:\n• Bắt đầu với liều thấp, tăng dần\n• Đơn giản hóa phác đồ điều trị\n• Dùng hộp thuốc phân ô theo ngày/giờ\n• Tái khám định kỳ để đánh giá lại thuốc\n• Không tự ý thay đổi thuốc hoặc liều`,
    thanks: () => `Không có gì! 😊 Chúc bạn sức khỏe tốt và uống thuốc đúng giờ!\n\nNếu có thắc mắc gì thêm về thuốc hoặc sức khỏe, tôi luôn sẵn sàng hỗ trợ! 💊`,
    default: () => `Cảm ơn bạn đã hỏi! Tôi chưa hiểu rõ câu hỏi của bạn.\n\nBạn có thể hỏi tôi về:\n• 📅 Lịch uống thuốc hôm nay\n• 💊 Thông tin bất kỳ loại thuốc nào (Paracetamol, Amoxicillin, Amlodipine...)\n• 🍽️ Uống thuốc trước hay sau ăn\n• ⚠️ Tác dụng phụ của thuốc\n• ❓ Xử lý khi quên uống thuốc\n• 🤰 Thuốc khi mang thai hoặc cho trẻ em\n• 📦 Bảo quản thuốc\n• ❤️ Huyết áp, đường huyết\n\nHoặc liên hệ bác sĩ để được tư vấn chính xác nhất! 🩺`,
};

// ─── Intent detection ─────────────────────────────────────────
function detectIntent(msg) {
    const normalize = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const lower = normalize(msg);
    // Check dynamic drug catalog first
    const drug = detectDrugFromCatalog(msg);
    if (drug) return { type: "drug", data: drug };
    for (const [intent, keywords] of Object.entries(MEDBOT_KB)) {
        if (keywords.some(kw => lower.includes(normalize(kw)))) return { type: "intent", name: intent };
    }
    return { type: "intent", name: "default" };
}

// ─── UI Helpers ───────────────────────────────────────────────
function cbAddBubble(text, type) {
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
    const delay = 700 + Math.random() * 500;
    setTimeout(() => {
        cbRemoveTyping();
        const result = detectIntent(msg);
        let replyText;
        if (result.type === "drug") {
            replyText = buildDrugReply(result.data);
        } else {
            const replyFn = MEDBOT_REPLIES[result.name] || MEDBOT_REPLIES.default;
            try { replyText = replyFn(); } catch (e) { replyText = MEDBOT_REPLIES.default(); }
        }
        cbAddBubble(replyText, "bot");
    }, delay);
}

function cbQuick(msg) {
    switchChatbotTab("chat");
    cbAddBubble(msg, "user");
    cbReply(msg);
}

function cbSend() {
    const input = document.getElementById("chatbot-input");
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    cbAddBubble(val, "user");
    input.value = "";
    cbReply(val);
}

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
            if (input) input.focus();
        }, 300);
    }
}

// ─── Tab switching ────────────────────────────────────────────
function switchChatbotTab(tab) {
    chatbotTab = tab;
    ["chat", "faq", "contact"].forEach(t => {
        const btn = document.getElementById("cb-tab-" + t);
        const pane = document.getElementById("cb-pane-" + t);
        if (btn) btn.classList.toggle("active", t === tab);
        if (pane) pane.style.display = t === tab ? "flex" : "none";
    });
    if (tab === "faq") renderFAQ();
}
window.switchChatbotTab = switchChatbotTab;

// ─── FAQ rendering ────────────────────────────────────────────
function renderFAQ() {
    const wrap = document.getElementById("faq-list");
    if (!wrap || wrap.dataset.built) return;
    wrap.dataset.built = "1";
    wrap.innerHTML = FAQ_DATA.map((item, i) => `
    <div class="faq-item" id="faq-${i}">
        <div class="faq-question" onclick="toggleFAQ(${i})">
            <span>${item.q}</span>
            <span class="faq-arrow" id="faq-arrow-${i}">▾</span>
        </div>
        <div class="faq-answer" id="faq-ans-${i}" style="display:none">${item.a}</div>
    </div>`).join("");
}

function toggleFAQ(i) {
    const ans = document.getElementById("faq-ans-" + i);
    const arrow = document.getElementById("faq-arrow-" + i);
    if (!ans) return;
    const open = ans.style.display !== "none";
    ans.style.display = open ? "none" : "block";
    if (arrow) arrow.textContent = open ? "▾" : "▴";
}
window.toggleFAQ = toggleFAQ;

// ─── Contact form submit ───────────────────────────────────────
function submitContact() {
    const name = document.getElementById("contact-name")?.value.trim();
    const email = document.getElementById("contact-email")?.value.trim();
    const msg = document.getElementById("contact-msg")?.value.trim();
    const result = document.getElementById("contact-result");
    if (!name || !msg) {
        if (result) { result.textContent = "⚠️ Vui lòng điền đầy đủ thông tin."; result.style.color = "#ff6b9d"; }
        return;
    }
    if (result) {
        result.textContent = "✅ Cảm ơn bạn! Chúng tôi sẽ phản hồi trong 24 giờ.";
        result.style.color = "#00d4aa";
    }
    document.getElementById("contact-name").value = "";
    document.getElementById("contact-email").value = "";
    document.getElementById("contact-msg").value = "";
}
window.submitContact = submitContact;

// Export to global
window.cbQuick = cbQuick;
window.cbSend = cbSend;
window.toggleChatbot = toggleChatbot;
