document.addEventListener("DOMContentLoaded", function () {

    // =======================
    // TOGGLE LOGIN / REGISTER
    // =======================
    window.toggleRegister = function (showRegister) {
        document.getElementById("loginSection").style.display = showRegister ? "none" : "block";
        document.getElementById("registerSection").style.display = showRegister ? "block" : "none";
    };

    // =======================
    // ĐĂNG NHẬP
    // =======================
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = loginForm.querySelector("input[type='email']").value.trim();
        const password = loginForm.querySelector("input[type='password']").value.trim();

        if (!email || !password) {
            alert("Vui lòng nhập đầy đủ!");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const foundUser = users.find(u =>
            u.email === email && u.password === password
        );

        if (!foundUser) {
            alert("Sai tài khoản hoặc mật khẩu!");
            return;
        }

        // Lưu trạng thái đăng nhập
        localStorage.setItem("currentUser", JSON.stringify(foundUser));
        localStorage.setItem("isLogin", "true");

        alert("Đăng nhập thành công 😆");

        // Redirect theo role / returnTo
        const returnTo = localStorage.getItem("returnTo");
        localStorage.removeItem("returnTo");

        if (foundUser.role === "admin") {
            window.location.href = "admin.html";
        } else if (returnTo) {
            window.location.href = returnTo;
        } else {
            window.location.href = "index.html";
        }
    });

    // =======================
    // ĐĂNG KÝ
    // =======================
    window.register = function () {
        const username = document.getElementById("registerUsername").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value.trim();
        const confirm = document.getElementById("registerConfirm").value.trim();

        // Validation
        if (!username || !email || !password || !confirm) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (!isValidEmail(email)) {
            alert("Email không hợp lệ!");
            return;
        }

        if (password.length < 6) {
            alert("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        if (password !== confirm) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        // Kiểm tra email trùng
        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (users.some(u => u.email === email)) {
            alert("Email này đã được đăng ký!");
            return;
        }

        // Tạo user mới
        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: password,
            role: "user",
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        alert("Đăng ký thành công! Vui lòng đăng nhập 🎉");

        // Reset form và quay về đăng nhập
        document.getElementById("registerForm").reset();
        toggleRegister(false);
    };

    // =======================
    // HELPER
    // =======================
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

});// =======================
// TẠO ADMIN MẶC ĐỊNH (chạy 1 lần)
// =======================
(function createDefaultAdmin() {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const adminExists = users.some(u => u.role === "admin");
    if (adminExists) return; // đã có admin rồi thì thôi

    users.push({
        id: Date.now(),
        username: "admin",
        email: "admin@gmail.com",
        password: "123456",
        role: "admin",
        createdAt: new Date().toISOString()
    });

    localStorage.setItem("users", JSON.stringify(users));
    console.log("✅ Tài khoản admin đã được tạo: admin@medreminder.com / admin123");
})();
