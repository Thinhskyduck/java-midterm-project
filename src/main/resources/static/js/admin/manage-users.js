document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.AdminApp === 'undefined' || typeof window.AdminApp.fetchData !== 'function') {
        console.error("manage-users.js: AdminApp or essential functions are not available.");
        const userTableBodyError = document.getElementById('users-table-body');
        if (userTableBodyError) userTableBodyError.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Critical Error: Core admin scripts not loaded.</td></tr>';
        return;
    }

    const { API_BASE_URL, fetchData, isLoggedIn } = window.AdminApp;

    const usersTableJQ = $('#users-table');
    let dataTableInstanceAPI;

    async function loadUsers() {
        if (!isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }

        const usersTableBody = usersTableJQ.find('tbody');
        if (usersTableBody.length) {
            usersTableBody.html('<tr><td colspan="7" class="text-center">Loading users...</td></tr>');
        }

        try {
            const userPage = await fetchData('/api/admin/users?page=0&size=100&sort=id,asc');
            const users = userPage.content || [];

            if ($.fn.DataTable.isDataTable(usersTableJQ)) {
                usersTableJQ.DataTable().destroy();
                usersTableJQ.find('thead').empty();
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
                    { data: 'role', width: '10%' },
                    { data: 'address', defaultContent: 'N/A', width: '20%' },
                    {
                        data: 'id',
                        orderable: false,
                        className: 'datatable-nosort text-center',
                        width: '10%',
                        render: function (data, type, row) {
                            let deleteButtonHtml = '';
                            const currentUserId = window.AdminApp.getUserId ? parseInt(window.AdminApp.getUserId()) : null;
                            if (currentUserId !== data) {
                                deleteButtonHtml = `<a class="dropdown-item delete-user-btn" href="#" data-id="${data}"><i class="dw dw-delete-3"></i> Delete</a>`;
                            }
                                        return `
                        <div class="dropdown">
                            <a class="btn btn-link font-24 p-0 line-height-1 no-arrow dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                                <i class="dw dw-more"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right dropdown-menu-icon-list">
                                <a class="dropdown-item edit-user-btn" href="edit_user.html?userId=${data}"><i class="dw dw-edit2"></i> Edit</a>
                                <a class="dropdown-item view-orders-btn" href="#" data-id="${data}" data-target="#userOrdersModal-${data}" data-toggle="modal"><i class="fas fa-shopping-cart"></i> View Orders</a>
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
                loadUsers();
            } catch (error) {
                alert(`Error deleting user: ${error.message}`);
            }
        }
    });

    // Xử lý nút xem lịch sử đơn hàng
    usersTableJQ.on('click', '.view-orders-btn', async function (e) {
        e.preventDefault();
        const userId = $(this).data('id');
        const modalTargetId = `#userOrdersModal-${userId}`;

        let modal = $(modalTargetId);
        if (!modal.length) {
            const newModalHtml = `
        <div class="modal fade" id="userOrdersModal-${userId}" tabindex="-1" role="dialog" aria-labelledby="userOrdersModalLabel-${userId}" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 style="color: white" class="modal-title" id="userOrdersModalLabel-${userId}">
                            <i class="fas fa-shopping-cart mr-2"></i>Order History - User ID: #${userId}
                        </h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div class="modal-body" id="userOrdersModalBody-${userId}">
                        <p>Loading order history...</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-dismiss="modal">
                            <i class="fas fa-times mr-1"></i>Close
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
            $('body').append(newModalHtml);
            modal = $(`#userOrdersModal-${userId}`);
        }

        const modalBody = modal.find('.modal-body');
        modalBody.html('<p>Loading order history...</p>');

        try {
            const orderPage = await fetchData(`/api/orders?userId=${userId}&page=0&size=100&sort=createdAt,desc`);
            console.log('Order page response:', orderPage); // Debug API response
            const orders = orderPage.content || [];
            if (orders.length > 0) {
                let ordersTableHtml = `
            <h6 class="font-weight-bold mb-3">Order History</h6>
            <div class="table-responsive">
                <table class="table table-bordered table-hover orders-table">
                    <thead class="thead-light">
                        <tr>
                            <th>Order ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Date Placed</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>`;
                orders.forEach(order => {
                    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') + ' ' +
                        new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A';
                    ordersTableHtml += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.userFullName || 'N/A'}</td>
                    <td>${order.userEmail || 'N/A'}</td>
                    <td>${window.AdminApp.formatPrice(order.totalAmount)}</td>
                    <td><span class="badge badge-${order.status === 'DELIVERED' ? 'success' : order.status === 'PENDING' ? 'warning' : 'danger'}">${order.status || 'N/A'}</span></td>
                    <td>${orderDate}</td>
                    <td>
                        <a class="btn btn-link view-order-details-btn" href="#" data-order-id="${order.id}" data-target="#orderModal-${order.id}" data-toggle="modal">
                            <i class="fas fa-eye"></i> View Details
                        </a>
                    </td>
                </tr>`;
                });
                ordersTableHtml += '</tbody></table></div>';
                modalBody.html(ordersTableHtml);
                modal.modal('show');
            } else {
                modalBody.html('<p class="text-muted">No orders found for this user.</p>');
                modal.modal('show');
            }
        } catch (error) {
            console.error(`Error fetching orders for user ${userId}:`, error);
            modalBody.html(`<p class="text-danger">Error loading orders: ${error.message}</p>`);
            modal.modal('show');
        }
    });

    // Xử lý nút xem chi tiết đơn hàng
    $(document).on('click', '.view-order-details-btn', async function (e) {
        e.preventDefault();
        const orderId = $(this).data('order-id');
        const modalTargetId = `#orderModal-${orderId}`;

        // Tạo hoặc tìm modal chi tiết đơn hàng
        let modal = $(modalTargetId);
        if (!modal.length) {
            const newModalHtml = `
        <div class="modal fade" id="orderModal-${orderId}" tabindex="-1" role="dialog" aria-labelledby="orderModalLabel-${orderId}" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div class="modal-content order-modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 style="color: white" class="modal-title" id="orderModalLabel-${orderId}">
                            <i class="fas fa-shopping-cart mr-2"></i>Order Details - ID: #${orderId}
                        </h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" id="modalBody-${orderId}">
                        <p>Loading order details...</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-dismiss="modal">
                            <i class="fas fa-times mr-1"></i>Close
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
            $('body').append(newModalHtml);
            modal = $(`#orderModal-${orderId}`);
        }

        const modalBody = modal.find('.modal-body');
        modalBody.html('<p>Loading order details...</p>');

        try {
            console.log(`Fetching details for order ${orderId}`); // Debug log
            const orderDetails = await fetchData(`/api/orders/${orderId}`);
            console.log('Order details:', orderDetails); // Debug log
            if (orderDetails) {
                const orderDate = orderDetails.createdAt ?
                    new Date(orderDetails.createdAt).toLocaleDateString('vi-VN') + ' ' +
                    new Date(orderDetails.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) :
                    'N/A';
                let itemsTableHtml = `
            <h6 class="font-weight-bold mb-3">Items in Order</h6>
            <div class="table-responsive">
                <table class="table table-bordered table-hover order-details-table">
                    <thead class="thead-light">
                        <tr>
                            <th>Product</th>
                            <th>Color</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>`;
                orderDetails.items.forEach(item => {
                    itemsTableHtml += `
                <tr>
                    <td>${item.productName || 'N/A'}</td>
                    <td>${item.productVariantColor || 'N/A'}</td>
                    <td>${item.quantity || 0}</td>
                    <td>${window.AdminApp.formatPrice(item.unitPrice)}</td>
                    <td class="font-weight-bold">${window.AdminApp.formatPrice(item.subtotal)}</td>
                </tr>`;
                });
                itemsTableHtml += '</tbody></table></div>';

                modalBody.html(`
            <div class="order-details p-3">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <p><strong><i class="fas fa-user mr-2"></i>User:</strong> ${orderDetails.userFullName || 'N/A'}</p>
                        <p><strong><i class="fas fa-map-marker-alt mr-2"></i>Shipping Address:</strong> ${orderDetails.shippingAddress || 'N/A'}</p>
                        <p><strong><i class="fas fa-calendar-alt mr-2"></i>Date Placed:</strong> ${orderDate}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <p><strong><i class="fas fa-dollar-sign mr-2"></i>Total Amount:</strong> <span class="text-success font-weight-bold">${window.AdminApp.formatPrice(orderDetails.totalAmount)}</span></p>
                        <p><strong><i class="fas fa-info-circle mr-2"></i>Status:</strong> <span class="badge badge-${orderDetails.status === 'DELIVERED' ? 'success' : orderDetails.status === 'PENDING' ? 'warning' : 'danger'}">${orderDetails.status || 'N/A'}</span></p>
                    </div>
                </div>
                <hr class="my-4">
                ${itemsTableHtml}
            </div>
            `);
                modal.modal('show'); // Kích hoạt modal
            } else {
                modalBody.html('<p class="text-danger">Could not load order details.</p>');
                modal.modal('show');
            }
        } catch (error) {
            console.error(`Error fetching details for order ${orderId}:`, error);
            modalBody.html(`<p class="text-danger">Error loading details: ${error.message}</p>`);
            modal.modal('show');
        }
    });

    function initManageUsersPage() {
        if (!isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }
        loadUsers();
    }

    initManageUsersPage();
});