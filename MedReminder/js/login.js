// ============================================================
//  login.js – Đăng nhập / đăng ký (phiên bản nâng cấp)
//  MedReminder – Đề tài 09
// ============================================================

// Tài khoản demo – mỗi user có patientId riêng để lọc dữ liệu
const DEMO_ACCOUNTS = [
    { username: "admin", password: "admin123", role: "admin", name: "Quản trị viên", patientId: null },
    { username: "bsminh", password: "123456", role: "doctor", name: "BS. Nguyễn Văn Minh", patientId: null },
    { username: "patient", password: "patient123", role: "patient", name: "Nguyễn Văn An", patientId: "1" },
];

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get("register") === "true") switchToRegister();
    document.getElementById("login-form")?.addEventListener("submit", handleLogin);
    document.getElementById("register-form")?.addEventListener("submit", handleRegister);
});

function handleLogin(e) {
    e.preventDefault();
    const usernameEl = document.getElementById("username");
    const passwordEl = document.getElementById("password");
    const errUser = document.getElementById("err-username");
    const errPass = document.getElementById("err-password");
    let valid = true;

    if (!usernameEl.value.trim()) {
        usernameEl.classList.add("is-invalid");
        errUser.textContent = "Vui lòng nhập tên đăng nhập.";
        errUser.classList.add("show"); valid = false;
    } else { usernameEl.classList.remove("is-invalid"); errUser.classList.remove("show"); }

    if (!passwordEl.value.trim()) {
        passwordEl.classList.add("is-invalid");
        errPass.textContent = "Vui lòng nhập mật khẩu.";
        errPass.classList.add("show"); valid = false;
    } else { passwordEl.classList.remove("is-invalid"); errPass.classList.remove("show"); }

    if (!valid) return;

    const btn = e.target.querySelector('[type=submit]');
    btn.textContent = "Đang đăng nhập..."; btn.disabled = true;

    setTimeout(() => {
        const account = DEMO_ACCOUNTS.find(
            a => a.username === usernameEl.value.trim() && a.password === passwordEl.value
        );
        if (account) {
            sessionStorage.setItem("medreminder_user", JSON.stringify(account));
            if (account.role === "admin" || account.role === "doctor") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            passwordEl.classList.add("is-invalid");
            errPass.textContent = "Tên đăng nhập hoặc mật khẩu không đúng.";
            errPass.classList.add("show");
            btn.textContent = "Đăng nhập →"; btn.disabled = false;
        }
    }, 800);
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name");
    const user = document.getElementById("reg-username");
    const pass = document.getElementById("reg-password");
    const pass2 = document.getElementById("reg-password2");
    let valid = true;
    const check = (el, errId, condition, msg) => {
        const err = document.getElementById(errId);
        if (!condition) { el.classList.add("is-invalid"); err.textContent = msg; err.classList.add("show"); valid = false; }
        else { el.classList.remove("is-invalid"); err.classList.remove("show"); }
    };
    check(name, "err-reg-name", name.value.trim(), "Vui lòng nhập họ tên.");
    check(user, "err-reg-user", user.value.trim(), "Vui lòng nhập tên đăng nhập.");
    check(pass, "err-reg-pass", pass.value.length >= 6, "Mật khẩu ít nhất 6 ký tự.");
    check(pass2, "err-reg-pass2", pass.value === pass2.value, "Mật khẩu xác nhận không khớp.");
    if (!valid) return;
    const btn = e.target.querySelector('[type=submit]');
    btn.textContent = "Đang đăng ký..."; btn.disabled = true;
    setTimeout(() => {
        showSuccessMsg("Đăng ký thành công! Chuyển đến đăng nhập...");
        setTimeout(switchToLogin, 1500);
        btn.textContent = "Đăng ký →"; btn.disabled = false;
    }, 900);
}

function switchToRegister() {
    $("#login-section").slideUp(250, function () { $("#register-section").slideDown(250); });
}
function switchToLogin() {
    $("#register-section").slideUp(250, function () { $("#login-section").slideDown(250); });
}
function showSuccessMsg(msg) {
    const el = document.getElementById("success-msg");
    if (el) { el.textContent = msg; $(el).fadeIn(300); }
}
function fillDemo(username, password) {
    document.getElementById("username").value = username;
    document.getElementById("password").value = password;
}
