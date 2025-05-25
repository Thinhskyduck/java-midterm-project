document.addEventListener('DOMContentLoaded', function () {
    console.log("profile.js: DOMContentLoaded fired. Checking for window.globalApp...");

    if (typeof window.globalApp === 'undefined') {
        console.error("profile.js: FATAL - window.globalApp is UNDEFINED. app.js might not have loaded or executed correctly before profile.js.");
        alert("Error: Application core (globalApp) not loaded. Please refresh.");
        return;
    }
    if (typeof window.globalApp.fetchData !== 'function') {
        console.error("profile.js: FATAL - window.globalApp.fetchData is NOT a function.");
        alert("Error: Core function (fetchData) not loaded. Please refresh.");
        return;
    }
    if (typeof window.globalApp.isLoggedIn !== 'function') {
        console.error("profile.js: FATAL - window.globalApp.isLoggedIn is NOT a function.");
        alert("Error: Core function (isLoggedIn) not loaded. Please refresh.");
        return;
    }
    // Thêm các kiểm tra khác nếu cần cho các hàm bạn sẽ dùng từ globalApp

    console.log("profile.js: window.globalApp seems available:", window.globalApp);

    // Sử dụng các hàm và biến từ window.globalApp
    const API_BASE_URL = window.globalApp.API_BASE_URL || '';
    const fetchData = window.globalApp.fetchData;
    const getAuthToken = window.globalApp.getAuthToken; // Lấy từ globalApp
    const isLoggedIn = window.globalApp.isLoggedIn;   // Lấy từ globalApp
    // Bạn không cần gọi updateHeaderAuthState và updateCartCountHeader từ đây
    // vì app.js đã gọi chúng trong DOMContentLoaded của nó.

    // DOM Elements
    const profileUsernameInput = document.getElementById('profile-username');
    const profileFullnameInput = document.getElementById('profile-fullname');
    const profileEmailInput = document.getElementById('profile-email');
    const profileAddressTextarea = document.getElementById('profile-address');
    const profileForm = document.getElementById('profile-form');
    const profileMessageEl = document.getElementById('profile-message');
    const profileDetailsContainer = document.getElementById('profile-details-container');
    // --- Load User Profile ---
    async function loadUserProfile() {
        if (!isLoggedIn()) { // Gọi hàm từ globalApp
            console.log("User not logged in, redirecting from profile page.");
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = './login.html';
            return null; // Trả về null để hàm gọi biết là có chuyển hướng
        }

        try {
            const userInfo = await fetchData(`${API_BASE_URL}/api/users/me`, { // Gọi fetchData từ globalApp
                headers: { 'Authorization': `Bearer ${getAuthToken()}` } // Gọi getAuthToken từ globalApp
            });

            if (userInfo) {
                if (profileUsernameInput) profileUsernameInput.value = userInfo.username || '';
                if (profileFullnameInput) profileFullnameInput.value = userInfo.fullName || '';
                if (profileEmailInput) profileEmailInput.value = userInfo.email || '';
                if (profileAddressTextarea) {
                    profileAddressTextarea.value = userInfo.address || '';
                    localStorage.setItem('userAddressOriginal', userInfo.address || '');
                }
                if(profileDetailsContainer) profileDetailsContainer.innerHTML = ''; // Xóa "Loading profile..."
                // và sau đó điền form (form đã có trong HTML)
                // Thay vì innerHTML = '', bạn chỉ cần đảm bảo các input được điền
                if (profileDetailsContainer && profileDetailsContainer.querySelector('p')) { // Nếu có thẻ <p> Loading...
                    profileDetailsContainer.querySelector('p').remove();
                }
                // Hiển thị form (nếu form được ẩn ban đầu)
                if (profileForm) profileForm.style.display = 'block';


                return userInfo;
            } else {
                displayProfileMessage('Could not load profile information.', 'danger');
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
            displayProfileMessage(`Error loading profile: ${error.message}`, 'danger');
            if(profileForm) profileForm.style.display = 'none'; // Ẩn form nếu lỗi
        }
        return null;
    }

    function displayProfileMessage(message, type = 'danger') {
        if (profileMessageEl) {
            profileMessageEl.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
                                            ${message}
                                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                <span aria-hidden="true">×</span>
                                            </button>
                                          </div>`;
            profileMessageEl.style.display = 'block';
            // Không tự ẩn nữa, để người dùng tự đóng hoặc ẩn khi submit thành công
            // setTimeout(() => { profileMessageEl.style.display = 'none'; profileMessageEl.innerHTML = '';}, 5000);
        }
    }

    // --- Handle Profile Update (Address Only) ---
    if (profileForm) {
        profileForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (!isLoggedIn()) { // Gọi hàm từ globalApp
                alert("Your session might have expired. Please log in again.");
                window.location.href = './login.html';
                return;
            }

            const newAddress = profileAddressTextarea.value.trim();
            const updateButton = this.querySelector('button[type="submit"]');
            const originalButtonText = updateButton.textContent;
            const originalAddress = localStorage.getItem('userAddressOriginal') || '';

            if (newAddress === originalAddress) {
                displayProfileMessage('Address has not changed.', 'info');
                return;
            }

            updateButton.disabled = true;
            updateButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Updating...';
            profileMessageEl.style.display = 'none'; // Ẩn thông báo cũ

            try {
                const responseData = await fetchData(`${API_BASE_URL}/api/users/me/address`, { // Gọi fetchData
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}` // Gọi getAuthToken
                    },
                    body: JSON.stringify({ newAddress: newAddress })
                });

                // API PUT /api/users/me/address của bạn trả về Map.of("message", ...) khi thành công
                if (responseData && responseData.message) {
                    displayProfileMessage(responseData.message, 'success');
                    localStorage.setItem('userAddressOriginal', newAddress); // Cập nhật địa chỉ gốc đã lưu
                } else if (responseData && responseData.error) { // Xử lý lỗi từ API nếu có
                    displayProfileMessage(`Update failed: ${responseData.error}`, 'danger');
                }
                else {
                    displayProfileMessage('Failed to update address. Unexpected response.', 'danger');
                }
            } catch (error) {
                displayProfileMessage(`Error updating address: ${error.message}`, 'danger');
            } finally {
                updateButton.disabled = false;
                updateButton.textContent = originalButtonText;
            }
        });
    }

    // --- Initialization ---
    async function initProfilePage() {
        // Các hàm cập nhật header đã được gọi bởi app.js trong DOMContentLoaded của nó rồi.
        // Nếu bạn muốn chắc chắn chúng được gọi lại (ví dụ sau một hành động đặc biệt trên trang này),
        // bạn có thể gọi window.AppCore.updateHeaderAuthState() và window.AppCore.updateCartCountHeader()
        // nhưng thường thì không cần thiết nếu chỉ là load trang.
        console.log("profile.js: initProfilePage called.");
        // Hiển thị "Loading profile..." cho đến khi dữ liệu được tải
        if (profileDetailsContainer) {
            profileDetailsContainer.innerHTML = "<p>Loading profile...</p>";
            profileDetailsContainer.style.display = 'block';
        }


        await loadUserProfile(); // Load thông tin và điền vào form

        // Khởi tạo các plugin JS của template nếu cần cho trang này
        // $('.set-bg').each(function () { // Cho breadcrumb
        //     var bg = $(this).data('setbg');
        //     if (bg && typeof window.AppCore.reinitializeSetBg === "undefined") { // Chỉ gọi nếu app.js chưa có
        //         $(this).css('background-image', 'url(' + bg + ')');
        //     } else if (bg && typeof window.AppCore.reinitializeSetBg === "function") {
        //         // Nếu app.js có hàm này, nó sẽ tự xử lý.
        //         // Hoặc bạn có thể gọi lại AppCore.reinitializeSetBg() nếu cần thiết cho element cụ thể.
        //     }
        // });
        // Sử dụng hàm reinitializeSetBg đã được destructure từ AppCore
        if (window.jQuery && typeof reinitializeSetBg === "function") { // Kiểm tra reinitializeSetBg cụ thể
            console.log("profile.js: Calling AppCore.reinitializeSetBg for .set-bg elements");
            $('.set-bg').each(function () { // breadcrumb section có class này
                var bg = $(this).data('setbg');
                if (bg) {
                    $(this).css('background-image', 'url(' + bg + ')');
                    // Hoặc tốt hơn là gọi hàm dùng chung nếu nó đã có sẵn và hoạt động đúng:
                    // reinitializeSetBg(); // Gọi trực tiếp nếu nó áp dụng cho tất cả .set-bg
                }
            });
            // Nếu hàm reinitializeSetBg trong AppCore đã đủ tốt để quét toàn bộ trang,
            // bạn có thể chỉ cần gọi nó một lần:
            // reinitializeSetBg();
        } else if (window.jQuery) {
            console.warn("profile.js: AppCore.reinitializeSetBg is not available or not a function, but jQuery is. Falling back to direct .set-bg handling for this page.");
            // Fallback nếu AppCore.reinitializeSetBg không có, nhưng chỉ là tạm thời, nên sửa app.js
            $('.set-bg').each(function () {
                var bg = $(this).data('setbg');
                if (bg) $(this).css('background-image', 'url(' + bg + ')');
            });
        } else {
            console.warn("profile.js: jQuery is not available, cannot initialize .set-bg elements.");
        }
    }

    // Gọi hàm khởi tạo chính của trang profile
    initProfilePage();
});