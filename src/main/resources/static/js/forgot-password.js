document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.globalApp === 'undefined' || typeof window.globalApp.fetchData !== 'function') {
        console.error("forgot-password.js: globalApp or fetchData is not available.");
        alert("Error: Core application script not loaded. Please refresh.");
        return;
    }
    const { API_BASE_URL, fetchData } = window.globalApp;

    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('fp-email');
    const messageEl = document.getElementById('forgot-password-message');
    const submitButton = forgotPasswordForm ? forgotPasswordForm.querySelector('button[type="submit"]') : null;

    function displayMessage(message, type = 'danger') {
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `alert-message alert alert-${type}`;
            messageEl.style.display = 'block';
        }
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const email = emailInput.value.trim();

            if (!email) {
                displayMessage('Please enter your email address.', 'warning');
                return;
            }

            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Sending OTP...';
            messageEl.style.display = 'none'; // Ẩn thông báo cũ

            try {
                // API POST /api/auth/request-password-otp
                const responseData = await fetchData(`${API_BASE_URL}/api/auth/request-password-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email })
                });

                // API trả về message trong object: {"message": "OTP has been sent..."}
                if (responseData && responseData.message) {
                    displayMessage(responseData.message, 'success');
                    // Không chuyển hướng ngay, để người dùng đọc thông báo và chuẩn bị nhập OTP
                    // Có thể chuyển sang trang nhập OTP sau một khoảng thời gian hoặc khi người dùng click nút khác
                    // Hiện tại, chúng ta sẽ giả định người dùng sẽ tự điều hướng hoặc trang reset-password.html là trang tiếp theo
                    // Để đơn giản, có thể thêm link vào thông báo:
                    messageEl.innerHTML += `<br><small>You will be redirected to enter OTP shortly, or <a href="./reset-password.html?email=${encodeURIComponent(email)}">click here</a>.</small>`;
                    setTimeout(() => {
                        window.location.href = `./reset-password.html?email=${encodeURIComponent(email)}`;
                    }, 4000); // Chuyển hướng sau 4 giây
                } else {
                    displayMessage(responseData.message || 'Failed to request OTP. Please try again.', 'danger');
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            } catch (error) {
                displayMessage(`Error: ${error.message}`, 'danger');
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // Gọi hàm khởi tạo chung từ app.js (nếu cần thiết cho header/footer trên trang này)
    if (typeof window.globalApp.updateHeaderAuthState === "function") window.globalApp.updateHeaderAuthState();
    if (typeof window.globalApp.updateCartCountHeader === "function") window.globalApp.updateCartCountHeader();

    // Khởi tạo các plugin JS của template nếu cần (preloader, etc.)
    if (window.jQuery) {
        $(window).on('load', function () {
            $(".loader").fadeOut();
            $("#preloder").delay(200).fadeOut("slow");
        });
        // ... các khởi tạo khác của Ogani nếu có ...
    }
});