document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.AdminApp === 'undefined' || typeof window.AdminApp.fetchData !== 'function') {
        console.error("manage-users.js: AdminApp or essential functions are not available.");
        // alert("Error: Admin core script not loaded.");
        const userTableBodyError = document.getElementById('users-table-body');
        if(userTableBodyError) userTableBodyError.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Critical Error: Core admin scripts not loaded.</td></tr>';
        return;
    }

    const { API_BASE_URL, fetchData, isLoggedIn } = window.AdminApp; // Lấy các hàm cần thiết

    const usersTableJQ = $('#users-table');
    let dataTableInstanceAPI;

    async function loadUsers() {
        if (!isLoggedIn()) { // Kiểm tra đăng nhập của admin
            window.location.href = '../login.html';
            return;
        }
        // TODO: Gọi API /api/users/me để kiểm tra vai trò là ADMIN
        // const currentUser = await fetchData('/api/users/me');
        // if (!currentUser || currentUser.role !== 'ADMIN') {
        //     alert("Access Denied: You do not have permission to manage users.");
        //     window.location.href = 'manage_products.html'; // Hoặc trang admin dashboard
        //     return;
        // }


        const usersTableBody = usersTableJQ.find('tbody');
        if (usersTableBody.length) {
            usersTableBody.html('<tr><td colspan="7" class="text-center">Loading users...</td></tr>');
        }


        try {
            // API GET /api/admin/users trả về Page<UserDto>
            const userPage = await fetchData('/api/admin/users?page=0&size=100&sort=id,asc'); // Lấy 100 user
            const users = userPage.content || [];

            if ($.fn.DataTable.isDataTable(usersTableJQ)) {
                usersTableJQ.DataTable().destroy();
                usersTableJQ.find('thead').empty(); // Quan trọng nếu cấu trúc thead có thể thay đổi
                usersTableJQ.find('tbody').empty();
            }

            let thead = usersTableJQ.find('thead');
            if (thead.length === 0) { thead = $('<thead>').appendTo(usersTableJQ); }
            thead.html(`
                <tr>
                    <th class="table-plus">ID</th>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Address</th>
                    <th class="datatable-nosort">Action</th>
                </tr>
            `);
            if (usersTableJQ.find('tbody').length === 0) { usersTableJQ.append('<tbody id="users-table-body"></tbody>');}


            dataTableInstanceAPI = usersTableJQ.DataTable({
                destroy: true,
                data: users,
                responsive: true,
                autoWidth: false,
                columns: [
                    { data: 'id', className: 'table-plus', width: '5%' },
                    { data: 'username', width: '15%' },
                    { data: 'fullName', defaultContent: 'N/A', width: '20%' },
                    { data: 'email', defaultContent: 'N/A', width: '20%' },
                    { data: 'role', width: '10%' }, // API UserDto cần trả về 'role' là String (tên của Enum)
                    { data: 'address', defaultContent: 'N/A', width: '20%'},
                    {
                        data: 'id', // User ID
                        orderable: false,
                        className: 'datatable-nosort text-center', width: '10%',
                        render: function (data, type, row) { // data ở đây là user.id
                            // Không cho admin tự xóa mình
                            let deleteButtonHtml = '';
                            const currentUserId = window.AdminApp.getUserId ? parseInt(window.AdminApp.getUserId()) : null;
                            if (currentUserId !== data) { // Chỉ hiện nút delete nếu không phải user đang đăng nhập
                                deleteButtonHtml = `<a class="dropdown-item delete-user-btn" href="#" data-id="${data}"><i class="dw dw-delete-3"></i> Delete</a>`;
                            }

                            return `
                                <div class="dropdown">
                                    <a class="btn btn-link font-24 p-0 line-height-1 no-arrow dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                                        <i class="dw dw-more"></i>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-right dropdown-menu-icon-list">
                                        <a class="dropdown-item edit-user-btn" href="edit_user.html?userId=${data}"><i class="dw dw-edit2"></i> Edit</a>
                                        ${deleteButtonHtml}
                                    </div>
                                </div>`;
                        }
                    }
                ],
                language: {
                    emptyTable: "No users found."
                }
            });

        } catch (error) {
            console.error("Failed to load users for admin:", error);
            const tbody = usersTableJQ.find('tbody');
            if (tbody.length) {
                tbody.html('<tr><td colspan="7" class="text-center text-danger">Error loading users. See console.</td></tr>');
            }
        }
    }

    // Xử lý nút xóa người dùng
    usersTableJQ.on('click', '.delete-user-btn', async function (e) {
        e.preventDefault();
        const userIdToDelete = $(this).data('id');
        const currentUserIdLoggedIn = window.AdminApp.getUserId ? parseInt(window.AdminApp.getUserId()) : null;

        if (userIdToDelete === currentUserIdLoggedIn) {
            alert("You cannot delete your own account.");
            return;
        }

        if (confirm(`Are you sure you want to delete user with ID: ${userIdToDelete}?`)) {
            try {
                await fetchData(`/api/admin/users/${userIdToDelete}`, { method: 'DELETE' });
                // alert('User deleted successfully!');
                loadUsers(); // Load lại bảng
            } catch (error) {
                alert(`Error deleting user: ${error.message}`);
            }
        }
    });

    // --- Initialization ---
    function initManageUsersPage() {
        if (!isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }
        // TODO: Thực hiện kiểm tra vai trò ADMIN ở đây bằng cách gọi API /api/users/me
        // và kiểm tra trường role. Nếu không phải ADMIN, chuyển hướng.
        loadUsers();
    }

    initManageUsersPage();
});