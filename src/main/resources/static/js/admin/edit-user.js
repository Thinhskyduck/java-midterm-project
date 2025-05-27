document.addEventListener('DOMContentLoaded', function () {

    if (typeof window.AdminApp === 'undefined' || typeof window.AdminApp.fetchData !== 'function') {
        console.error("edit-user.js: AdminApp or essential functions are not available.");
        alert("Error: Admin core script not loaded.");
        return;
    }
    const { API_BASE_URL, fetchData, isLoggedIn, getAuthToken } = window.AdminApp;

    // DOM Elements từ edit_user.html
    const userEditForm = document.getElementById('user-edit-form');
    const backButton = userEditForm ? userEditForm.querySelector('a.btn-secondary') : document.getElementById('back-button');
    const userIdInput = document.getElementById('user-id');
    const usernameInput = document.getElementById('user-username');
    const fullNameInput = document.getElementById('user-full-name');
    const emailInput = document.getElementById('user-email');
    const roleSelect = document.getElementById('user-role');
    const addressTextarea = document.getElementById('user-address');
    const createdAtInput = document.getElementById('user-created-at'); // Chỉ hiển thị
    const updatedAtInput = document.getElementById('user-updated-at'); // Chỉ hiển thị
    const saveChangesButton = userEditForm ? userEditForm.querySelector('button[type="submit"]') : null;
    // Thêm một div để hiển thị message
    const formMessageDiv = document.createElement('div');
    formMessageDiv.id = "edit-user-message";
    formMessageDiv.classList.add('alert', 'mt-3');
    formMessageDiv.style.display = 'none';
    if(userEditForm && saveChangesButton) userEditForm.insertBefore(formMessageDiv, saveChangesButton.parentElement);


    let currentEditingUserId = null;

    function getUserIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('userId');
    }

    function displayFormMessage(message, type = 'danger') {
        formMessageDiv.className = `alert alert-${type} mt-3`;
        formMessageDiv.textContent = message;
        formMessageDiv.style.display = 'block';
    }

    async function loadUserForEditing(userId) {
        if (!userId) {
            displayFormMessage("User ID is missing. Cannot load data.", "danger");
            if(saveChangesButton) saveChangesButton.disabled = true;
            return;
        }
        try {
            const user = await fetchData(`/api/admin/users/${userId}`); // API lấy chi tiết user
            if (user) {
                if (userIdInput) userIdInput.value = user.id || '';
                if (usernameInput) usernameInput.value = user.username || '';
                if (fullNameInput) fullNameInput.value = user.fullName || '';
                if (emailInput) emailInput.value = user.email || '';
                if (roleSelect) roleSelect.value = user.role || 'CUSTOMER'; // UserDto cần có 'role' là String
                if (addressTextarea) addressTextarea.value = user.address || '';
                // createdAt và updatedAt không có trong UserDto cơ bản, cần thêm nếu muốn hiển thị
                // if (createdAtInput && user.createdAt) createdAtInput.value = new Date(user.createdAt).toLocaleString('vi-VN');
                // if (updatedAtInput && user.updatedAt) updatedAtInput.value = new Date(user.updatedAt).toLocaleString('vi-VN');

                // Cập nhật tiêu đề và breadcrumb nếu cần
                const pageTitle = document.querySelector('.main-container .title h4');
                if (pageTitle) pageTitle.textContent = `Edit User: ${user.username || user.id}`;
            } else {
                displayFormMessage(`User with ID ${userId} not found.`, "warning");
                if(saveChangesButton) saveChangesButton.disabled = true;
            }
        } catch (error) {
            displayFormMessage(`Error loading user data: ${error.message}`, "danger");
            if(saveChangesButton) saveChangesButton.disabled = true;
        }
    }

    if (userEditForm) {
        userEditForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (!currentEditingUserId) {
                displayFormMessage("Cannot save. User ID is missing.", "danger");
                return;
            }

            const originalButtonText = saveChangesButton.textContent;
            saveChangesButton.disabled = true;
            saveChangesButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
            displayFormMessage('', 'info'); // Xóa thông báo cũ

            const updatedUserData = {
                fullName: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                address: addressTextarea.value.trim(),
                role: roleSelect.value // Gửi String "ADMIN" hoặc "CUSTOMER"
            };

            // Basic validation
            if (!updatedUserData.fullName || !updatedUserData.email || !updatedUserData.role) {
                displayFormMessage("Full Name, Email, and Role are required.", "warning");
                saveChangesButton.disabled = false;
                saveChangesButton.textContent = originalButtonText;
                return;
            }

            try {
                const result = await fetchData(`/api/admin/users/${currentEditingUserId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', /* Token được thêm bởi fetchData */ },
                    body: JSON.stringify(updatedUserData)
                });

                // if (result) { // API trả về UserDto đã cập nhật
                //     displayFormMessage('User updated successfully!', 'success');
                //     // loadUserForEditing(currentEditingUserId); // Load lại dữ liệu mới
                //     setTimeout(() => {
                //         window.location.href = 'manage_users.html'; // Quay về trang danh sách
                //     }, 1500);
                // } else {
                //     displayFormMessage('Update failed. No response data.', 'danger');
                // }
                if (result) { // API trả về UserDto đã cập nhật
                    displayFormMessage('User updated successfully!', 'success');
                    setTimeout(() => {
                        if (!isLoggedIn() || !getAuthToken()) {
                            displayFormMessage("Session expired. Redirecting to login.", "warning");
                            window.location.href = '../login.html';
                        } else {
                            console.log("Redirecting to manage_users.html after save"); // Debug log
                            window.location.href = 'manage_users.html';
                        }
                    }, 1500);
                } else {
                    displayFormMessage('Update failed. No response data.', 'danger');
                }
            } catch (error) {
                displayFormMessage(`Error updating user: ${error.message}`, 'danger');
            } finally {
                saveChangesButton.disabled = false;
                saveChangesButton.textContent = originalButtonText;
            }
        });
    }

    // Thêm vào cuối file edit-user.js, trước initEditUserPage()
    if (backButton && backButton.tagName === 'BUTTON') {
        backButton.addEventListener('click', function (e) {
            e.preventDefault();
            if (!isLoggedIn() || !getAuthToken()) {
                displayFormMessage("Session expired. Please log in again.", "danger");
                console.error("Not logged in or missing token. Redirecting to login.");
                setTimeout(() => {
                    window.location.href = '../login.html';
                }, 1500);
                return;
            }
            console.log("Navigating to manage_users.html"); // Debug log
            window.location.href = 'manage_users.html';
        });
    }
    // --- Initialization ---
    function initEditUserPage() {
        if (!isLoggedIn()) {
            console.error("Not logged in or missing token. Redirecting to login.");
            displayFormMessage("Session expired. Please log in again.", "danger");
            window.location.href = '../login.html';
            return;
        }
        // TODO: Kiểm tra vai trò ADMIN

        currentEditingUserId = getUserIdFromUrl();
        if (currentEditingUserId) {
            loadUserForEditing(currentEditingUserId);
            if (backButton) {
                backButton.href = 'manage_users.html';
            }
        } else {
            const pageTitle = document.querySelector('.main-container .title h4');
            if (pageTitle) pageTitle.textContent = 'Error: No User ID specified';
            displayFormMessage("No User ID provided in the URL.", "danger");
            if(userEditForm) userEditForm.style.display = 'none'; // Ẩn form nếu không có ID
            if (backButton) {
                backButton.href = 'manage_users.html';
            }
        }
    }

    initEditUserPage();
});