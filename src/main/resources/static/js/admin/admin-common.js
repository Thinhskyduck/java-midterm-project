// src/main/resources/static/js/admin/admin-common.js
const ADMIN_API_BASE_URL = '../..'; // Đường dẫn tương đối để trỏ về /api từ /admin/somepage.html

function getAdminAuthToken() {
    // Giả sử admin cũng dùng JWT lưu trong localStorage giống user thường
    // Hoặc admin có cơ chế đăng nhập riêng
    return localStorage.getItem('accessToken');
}

async function fetchAdminAPI(endpoint, options = {}) {
    const token = getAdminAuthToken();
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    options.headers = { ...defaultHeaders, ...options.headers };

    try {
        const response = await fetch(`${ADMIN_API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Authentication error or insufficient permissions. Redirecting to login.');
                window.location.href = '../login.html'; // Điều hướng về trang login của user hoặc admin login riêng
            }
            const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status} ${response.statusText}` }));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        if (response.status === 204) return null; // No content
        return await response.json();
    } catch (error) {
        console.error(`Error fetching admin API ${endpoint}:`, error);
        // Hiển thị lỗi cho admin nếu cần
        // Ví dụ: displayGlobalAdminError(error.message);
        throw error;
    }
}

// Hàm format tiền tệ (có thể lấy từ app.js nếu dùng chung)
function formatAdminPriceVND(price) {
    if (price === null || price === undefined || isNaN(price)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Hàm kiểm tra đăng nhập cho admin (có thể khác với user thường)
function isAdminLoggedIn() {
    return !!getAdminAuthToken(); // Kiểm tra token admin
}

// Hàm đăng xuất cho admin
function adminLogout() {
    localStorage.removeItem('accessToken'); // Xóa token chung
    // localStorage.removeItem('adminToken'); // Nếu có token riêng cho admin
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = '../login.html'; // Hoặc trang login của admin
}


// Hàm để hiển thị thông báo chung (ví dụ dùng SweetAlert2 hoặc toastr)
// function showAdminNotification(message, type = 'success') {
//     // if (type === 'success') toastr.success(message);
//     // else if (type === 'error') toastr.error(message);
//     // else toastr.info(message);
//     alert(message); // Tạm thời dùng alert
// }

// Expose các hàm cần thiết (nếu các file admin khác cũng cần)
window.AdminApp = {
    API_BASE_URL: ADMIN_API_BASE_URL,
    fetchData: fetchAdminAPI,
    formatPrice: formatAdminPriceVND,
    isLoggedIn: isAdminLoggedIn,
    logoutUser: adminLogout
    // showNotification: showAdminNotification
};

// Cập nhật tên người dùng trên header admin (nếu có)
document.addEventListener('DOMContentLoaded', function() {
    const adminUserNameEl = document.querySelector('.user-info-dropdown .user-name');
    const storedUsername = localStorage.getItem('username'); // Lấy username của người dùng hiện tại
    if (adminUserNameEl && storedUsername) {
        adminUserNameEl.textContent = storedUsername;
    }
    // Gắn sự kiện cho nút logout trên header của admin template
    const adminLogoutButton = document.querySelector('.user-info-dropdown a[href="login.html"]');
    if (adminLogoutButton) {
        adminLogoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.AdminApp !== 'undefined' && typeof window.AdminApp.logoutUser === 'function') {
                window.AdminApp.logoutUser();
            } else { // Fallback nếu AdminApp chưa sẵn sàng
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                window.location.href = '../login.html';
            }
        });
    }
});