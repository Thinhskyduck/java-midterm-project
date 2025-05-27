document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.globalApp === 'undefined' || typeof window.globalApp.fetchData !== 'function') {
        console.error("reset-password.js: globalApp or fetchData is not available.");
        alert("Error: Core application script not loaded. Please refresh.");
        return;
    }
    const { API_BASE_URL, fetchData } = window.globalApp;

    const resetPasswordForm = document.getElementById('reset-password-form');
    const emailDisplayEl = document.getElementById('reset-email-display');
    const emailInputHidden = document.getElementById('rp-email'); // Input ẩn để giữ email
    const otpInput = document.getElementById('rp-otp');
    const newPasswordInput = document.getElementById('rp-new-password');
    const confirmPasswordInput = document.getElementById('rp-confirm-password');
    const messageEl = document.getElementById('reset-password-message');
    const submitButton = resetPasswordForm ? resetPasswordForm.querySelector('button[type="submit"]') : null;
    const resendOtpLink = document.getElementById('resend-otp-link');

    let currentEmail = ''; // Lưu email

    function displayMessage(message, type = 'danger') {
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `alert-message alert alert-${type}`;
            messageEl.style.display = 'block';
        }
    }

    // Lấy email từ URL parameter và hiển thị
    const urlParams = new URLSearchParams(window.location.search);
    currentEmail = urlParams.get('email');
    if (currentEmail) {
        if (emailDisplayEl) emailDisplayEl.textContent = currentEmail;
        if (emailInputHidden) emailInputHidden.value = currentEmail;
    } else {
        displayMessage('Email not found. Please request a new OTP.', 'danger');
        if (submitButton) submitButton.disabled = true;
        if (resendOtpLink) resendOtpLink.style.display = 'none'; // Ẩn link resend nếu không có email
    }


    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const otp = otpInput.value.trim();
            const newPassword = newPasswordInput.value; // Không trim password
            const confirmPassword = confirmPasswordInput.value;

            if (!currentEmail) {
                displayMessage('Email is missing. Cannot reset password.', 'danger');
                return;
            }
            if (!otp || !newPassword || !confirmPassword) {
                displayMessage('Please fill in all fields.', 'warning');
                return;
            }
            if (newPassword.length < 6) {
                displayMessage('New password must be at least 6 characters long.', 'warning');
                return;
            }
            if (newPassword !== confirmPassword) {
                displayMessage('New passwords do not match.', 'danger');
                return;
            }

            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Resetting Password...';
            messageEl.style.display = 'none';

            try {
                const resetRequest = {
                    email: currentEmail,
                    otp: otp,
                    newPassword: newPassword
                };
                // fetchData sẽ trả về object JSON đã parse (SimpleMessageResponse)
                // hoặc ném lỗi nếu API trả về lỗi (ví dụ 400, 500)
                const responseData = await fetchData(`${API_BASE_URL}/api/auth/reset-password-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(resetRequest)
                });

                // API của bạn trả về ResponseEntity<SimpleMessageResponse> với status 200 OK
                // và body là { "message": "Password has been reset successfully." } khi thành công.
                // fetchData sẽ parse JSON này vào responseData.
                // Nếu có lỗi từ API (ví dụ: OTP sai -> 400 Bad Request với body lỗi JSON),
                // fetchData sẽ throw error và nhảy vào khối catch.

                if (responseData && responseData.message) { // Chỉ cần kiểm tra có message là đủ (vì lỗi đã vào catch)
                    displayMessage(responseData.message, 'success');
                    submitButton.disabled = true; // Vô hiệu hóa nút sau khi thành công
                    submitButton.textContent = 'PASSWORD RESET!';
                    setTimeout(() => {
                        window.location.href = './login.html?reset=success'; // Chuyển hướng về login
                    }, 3000);
                } else {
                    // Trường hợp này ít khi xảy ra nếu fetchData hoạt động đúng
                    // và API luôn trả về message hoặc lỗi được bắt bởi catch.
                    displayMessage(responseData ? responseData.message : 'Failed to reset password. Unexpected response from server.', 'danger');
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            } catch (error) { // Lỗi từ fetchData (network, hoặc API trả về status lỗi) sẽ vào đây
                displayMessage(`Error: ${error.message}`, 'danger');
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    if (resendOtpLink) {
        resendOtpLink.addEventListener('click', async function(e) {
            e.preventDefault();
            if (!currentEmail) {
                alert("Email is not available to resend OTP.");
                return;
            }
            this.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Sending...';
            this.style.pointerEvents = 'none'; // Vô hiệu hóa link tạm thời

            try {
                const responseData = await fetchData(`${API_BASE_URL}/api/auth/request-password-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentEmail })
                });
                displayMessage(responseData.message || "New OTP sent if email is registered.", 'info'); // info hoặc success
            } catch (error) {
                displayMessage(`Error resending OTP: ${error.message}`, 'danger');
            } finally {
                this.innerHTML = 'Resend OTP?';
                this.style.pointerEvents = 'auto';
            }
        });
    }

    // Gọi hàm khởi tạo chung từ app.js
    if (typeof window.globalApp.updateHeaderAuthState === "function") window.globalApp.updateHeaderAuthState();
    if (typeof window.globalApp.updateCartCountHeader === "function") window.globalApp.updateCartCountHeader();

    // Khởi tạo các plugin JS của template nếu cần
    if (window.jQuery) {
        $(window).on('load', function () { $(".loader").fadeOut(); $("#preloder").delay(200).fadeOut("slow"); });
    }
});