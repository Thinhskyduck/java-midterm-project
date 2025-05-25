document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = ''; // Backend cùng origin
    const registerForm = document.getElementById('register-form');
    const registerMessageEl = document.getElementById('register-message');

    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const registerButton = this.querySelector('button[type="submit"]');

            const username = document.getElementById('reg-username').value.trim();
            const fullName = document.getElementById('reg-fullname').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            const address = document.getElementById('reg-address').value.trim();


            if (!username || !fullName || !email || !password) {
                displayMessage('Please fill in all required fields.', 'danger');
                return;
            }
            if (password.length < 6) {
                displayMessage('Password must be at least 6 characters long.', 'danger');
                return;
            }

            const registerRequest = {
                username: username,
                fullName: fullName,
                email: email,
                password: password,
                address: address || null, // Gửi null nếu trống
                role: 'CUSTOMER' // Mặc định là CUSTOMER
            };

            registerButton.disabled = true;
            registerButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(registerRequest)
                });

                // API register của chúng ta trả về text, không phải JSON cho trường hợp thành công
                if (response.status === 201 || response.ok) { // 201 Created
                    // const successMessage = await response.text(); // Không cần thiết nếu chỉ muốn chuyển hướng
                    // displayMessage(successMessage, 'success'); // Không cần hiển thị ở đây nữa
                    // Chuyển hướng đến trang đăng nhập với thông báo thành công
                    window.location.href = `./login.html?registration=success`;
                } else {
                    const errorData = await response.json(); // Lỗi thường là JSON
                    displayMessage(errorData.message || 'Registration failed. Please try again.', 'danger');
                    registerButton.disabled = false;
                    registerButton.textContent = 'REGISTER';
                }

            } catch (error) {
                console.error('Registration error:', error);
                displayMessage('An error occurred during registration. Please try again.', 'danger');
                registerButton.disabled = false;
                registerButton.textContent = 'REGISTER';
            }
        });
    }

    function displayMessage(message, type = 'danger') {
        if (registerMessageEl) {
            registerMessageEl.textContent = message;
            registerMessageEl.className = `alert-message alert-${type}`;
            registerMessageEl.style.display = 'block';
        }
    }
});