// src/main/resources/static/js/login.js
document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = '';
    const loginForm = document.getElementById('login-form');
    const loginMessageEl = document.getElementById('login-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            // ... (lấy username, password từ form) ...
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const loginButton = this.querySelector('button[type="submit"]');

            // ... (kiểm tra input, vô hiệu hóa nút) ...

            const loginRequest = { username: username, password: password };

            loginButton.disabled = true;
            loginButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Logging in...';


            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginRequest)
                });

                const responseData = await response.json();
                console.log("Login successful. Response data FROM API:", responseData);
                if (response.ok && responseData && responseData.accessToken) { // Kiểm tra cả responseData và accessToken
                    displayMessage('Login successful! Redirecting...', 'success');

                    // <<< PHẦN QUAN TRỌNG CẦN KIỂM TRA KỸ LƯỠNG >>>
                    console.log("Login successful. Response data:", responseData); // DEBUG: Xem responseData có gì

                    localStorage.setItem('accessToken', responseData.accessToken);
                    localStorage.setItem('username', responseData.username); // Đảm bảo responseData.username có giá trị
                    localStorage.setItem('userId', String(responseData.userId)); // Đảm bảo responseData.userId có giá trị và chuyển thành chuỗi
                    localStorage.setItem('userFullName', responseData.fullName || responseData.username);

                    console.log("Stored in localStorage - accessToken:", localStorage.getItem('accessToken')); // DEBUG
                    console.log("Stored in localStorage - username:", localStorage.getItem('username'));   // DEBUG
                    console.log("Stored in localStorage - userId:", localStorage.getItem('userId'));     // DEBUG
                    console.log("Stored in localStorage - userFullName:", localStorage.getItem('userFullName')); // DEBUG

                    setTimeout(() => {
                        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                        if (redirectUrl) {
                            sessionStorage.removeItem('redirectAfterLogin');
                            window.location.href = redirectUrl;
                        } else {
                            // window.location.href = './index.html';
                            // Kiểm tra nếu username là 'admin' thì chuyển sang trang admin
                            if (responseData.username === 'admin') {
                                window.location.href = './admin/manage_products.html';
                            } else {
                                window.location.href = './index.html';
                            }
                        }
                    }, 700); // Giảm thời gian chờ một chút

                } else {
                    displayMessage(responseData.message || 'Login failed. Please check credentials.', 'danger');
                    loginButton.disabled = false;
                    loginButton.textContent = 'LOGIN';
                }
            } catch (error) {
                console.error('Login error:', error);
                displayMessage('An error occurred. Please try again.', 'danger');
                loginButton.disabled = false;
                loginButton.textContent = 'LOGIN';
            }
        });
    }

    function displayMessage(message, type = 'danger') {
        if (loginMessageEl) {
            loginMessageEl.textContent = message;
            loginMessageEl.className = `alert-message alert-${type}`;
            loginMessageEl.style.display = 'block';
        }
    }
    // ... (xử lý ?registration=success) ...
    const urlParams = new URLSearchParams(window.location.search);
    const registrationStatus = urlParams.get('registration');
    if (registrationStatus === 'success') {
        displayMessage('Registration successful! Please log in.', 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});