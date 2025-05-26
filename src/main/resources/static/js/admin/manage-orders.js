document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.AdminApp === 'undefined' || typeof window.AdminApp.fetchData !== 'function') {
        console.error("manage-orders.js: AdminApp or essential functions are not available.");
        alert("Error: Admin core script not loaded.");
        // Có thể thêm logic để disable table hoặc hiển thị lỗi trên UI
        return;
    }

    const { API_BASE_URL, fetchData, formatPrice, isLoggedIn } = window.AdminApp;

    const ordersTableJQ = $('#orders-table'); // Giả sử bảng của bạn có id="orders-table"
    // Trong HTML bạn gửi, class là "data-table", không có ID cụ thể.
    // Hãy thêm id="orders-table" vào thẻ <table> trong manage_orders.html
    let dataTableInstanceAPI;

    // Danh sách các trạng thái đơn hàng hợp lệ (LẤY TỪ OrderServiceImpl)
    const VALID_ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];


    async function loadOrders() {
        if (!isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }
        // TODO: Kiểm tra vai trò ADMIN

        // Hiển thị loading message nếu cần (DataTables có option riêng cho việc này)
        // const tbody = ordersTableJQ.find('tbody');
        // if (tbody.length) tbody.html('<tr><td colspan="7" class="text-center">Loading orders...</td></tr>');

        try {
            const orderPage = await fetchData('/api/orders/all?page=0&size=100&sort=createdAt,desc');
            const orders = orderPage.content || [];

            if ($.fn.DataTable.isDataTable(ordersTableJQ)) {
                ordersTableJQ.DataTable().destroy();
                ordersTableJQ.find('thead').empty();
                ordersTableJQ.find('tbody').empty();
            }

            let thead = ordersTableJQ.find('thead');
            if (thead.length === 0) { thead = $('<thead>').appendTo(ordersTableJQ); }
            thead.html(`
                <tr>
                    <th class="table-plus datatable-nosort">Order ID</th>
                    <th>Full Name</th>   <!-- Sửa -->
                    <th>Email</th>       <!-- Thêm -->
                    <th>Total Amount</th>
                    <!-- <th>Shipping Address</th> Bỏ -->
                    <th>Status</th>
                    <th>Created At</th>
                    <th class="datatable-nosort">Action</th>
                </tr>
            `);
            if (ordersTableJQ.find('tbody').length === 0) { ordersTableJQ.append('<tbody id="orders-table-body"></tbody>');}


            dataTableInstanceAPI = ordersTableJQ.DataTable({
                destroy: true,
                data: orders,
                responsive: true,
                autoWidth: false,
                columns: [
                    { data: 'id', className: 'table-plus', width: '5%' },
                    { data: 'userFullName', defaultContent: 'N/A', width: '15%' }, // << SỬ DỤNG userFullName
                    { data: 'userEmail', defaultContent: 'N/A', width: '20%' },    // << THÊM userEmail
                    {
                        data: 'totalAmount', width: '15%',
                        render: function (data) { return formatPrice(data); }
                    },
                    // Cột Shipping Address đã bị bỏ
                    {
                        data: 'status', width: '15%',
                        render: function (data, type, row) {
                            let optionsHtml = '';
                            VALID_ORDER_STATUSES.forEach(status => {
                                optionsHtml += `<option value="${status}" ${data === status ? 'selected' : ''}>${status}</option>`;
                            });
                            return `<select class="form-control form-control-sm status-select" data-order-id="${row.id}">${optionsHtml}</select>`;
                        }
                    },
                    {
                        data: 'createdAt', width: '15%',
                        render: function (data) { return data ? new Date(data).toLocaleString('vi-VN') : 'N/A'; }
                    },
                    {
                        data: null,
                        orderable: false,
                        className: 'datatable-nosort text-center', width: '15%', // Giảm width của Action nếu cần
                        render: function (data, type, row) { // 'data' sẽ là null ở đây
                            // 'row' là toàn bộ object OrderResponse cho hàng hiện tại
                            const orderId = row.id; // Lấy orderId từ 'row' object
                            const modalTargetId = `orderModal-${orderId}`;
                            return `
            <div class="dropdown">
                <a class="btn btn-link font-24 p-0 line-height-1 no-arrow dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="dw dw-more"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right dropdown-menu-icon-list">
                    <a class="dropdown-item view-order-details-btn" href="#" data-toggle="modal" data-target="#${modalTargetId}" data-order-id="${orderId}"><i class="dw dw-eye"></i> View</a>
                </div>
            </div>`;
                        }
                    }
                ],
                language: { emptyTable: "No orders found." }
            });

        } catch (error) {
            console.error("Failed to load orders for admin:", error);
            const tbody = ordersTableJQ.find('tbody');
            // Đảm bảo colspan khớp với số lượng cột mới (7 cột)
            if (tbody.length) {
                tbody.html('<tr><td colspan="7" class="text-center text-danger">Error loading orders. See console.</td></tr>');
            }
        }
    }

    // --- Xử lý thay đổi Status ---
    ordersTableJQ.on('change', '.status-select', async function () {
        const orderId = $(this).data('order-id');
        const newStatus = $(this).val();

        if (!orderId || !newStatus) {
            alert("Error: Missing order ID or new status.");
            return;
        }

        if (confirm(`Are you sure you want to change status of order #${orderId} to ${newStatus}?`)) {
            try {
                await fetchData(`/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' /* Token được thêm bởi fetchData */ },
                    body: JSON.stringify({ newStatus: newStatus })
                });
                // alert(`Order #${orderId} status updated to ${newStatus}.`);
                // Không cần load lại toàn bộ, DataTables tự cập nhật select box.
                // Nếu cần cập nhật các thông tin khác của hàng, thì load lại:
                // loadOrders();
                // Hoặc chỉ cập nhật hàng đó trong DataTables nếu API trả về order đã update
                // (Hiện tại API updateStatus trả về OrderResponse)
                // Để đơn giản, có thể thông báo thành công và người dùng sẽ thấy thay đổi
                // trên select box. Nếu cần update các cột khác, load lại bảng là dễ nhất.
                console.log(`Order ${orderId} status changed to ${newStatus}`);
                // Nếu bạn muốn cập nhật lại hàng đó mà không load lại cả bảng:
                // const updatedOrderData = await fetchData(`/api/orders/${orderId}`);
                // dataTableInstanceAPI.row($(this).closest('tr')).data(updatedOrderData).draw(false);

            } catch (error) {
                alert(`Error updating order status: ${error.message}`);
                // Load lại để khôi phục select box về giá trị cũ nếu lỗi
                loadOrders();
            }
        } else {
            // Nếu người dùng cancel, khôi phục lại giá trị cũ của select box
            // Điều này hơi phức tạp vì cần lưu trạng thái trước đó.
            // Cách đơn giản là không làm gì, hoặc load lại hàng đó.
            // HoTạm thời chỉ để vậy, khi load lại bảng sẽ đúng.
        }
    });


    // --- Xử lý View Order Details (Modal) ---
    // --- Xử lý View Order Details (Modal) ---
    ordersTableJQ.on('click', '.view-order-details-btn', async function () {
        const orderId = $(this).data('order-id');
        const modalTargetId = $(this).data('target'); // Lấy ID của modal từ data-target

        // Tìm modal đã có trong HTML mẫu hoặc tạo modal mới
        let modal = $(modalTargetId); // Ví dụ: #orderModal-1001
        if (!modal.length) { // Nếu modal chưa tồn tại, tạo nó
            const newModalHtml = `
            <div class="modal fade" id="orderModal-${orderId}" tabindex="-1" role="dialog" aria-labelledby="orderModalLabel-${orderId}" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered" role="document"> <!-- Thêm modal-dialog-centered để căn giữa -->
                    <div class="modal-content order-modal-content">
                        <div class="modal-header bg-primary text-white"> <!-- Thêm màu nền header -->
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
            $('body').append(newModalHtml); // Thêm modal vào cuối body
            modal = $(`#orderModal-${orderId}`); // Chọn lại modal vừa tạo
        }

        const modalBody = modal.find('.modal-body');
        modalBody.html('<p>Loading order details...</p>'); // Reset nội dung modal

        try {
            const orderDetails = await fetchData(`/api/orders/${orderId}`); // API đã có
            if (orderDetails) {
                const orderDate = new Date(orderDetails.createdAt).toLocaleString('vi-VN');
                let itemsTableHtml = `
                <h6 class="font-weight-bold mb-3">Items in Order</h6>
                <div class="table-responsive"> <!-- Thêm table-responsive để bảng cuộn được trên mobile -->
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
                        <td>${item.productName}</td>
                        <td>${item.productVariantColor || 'N/A'}</td>
                        <td>${item.quantity}</td>
                        <td>${formatPrice(item.unitPrice)}</td>
                        <td class="font-weight-bold">${formatPrice(item.subtotal)}</td> <!-- Đậm subtotal -->
                    </tr>`;
                });
                itemsTableHtml += '</tbody></table></div>';

                modalBody.html(`
                <div class="order-details p-3">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <p><strong><i class="fas fa-user mr-2"></i>User:</strong> ${orderDetails.username || 'N/A'}</p>
                            <p><strong><i class="fas fa-map-marker-alt mr-2"></i>Shipping Address:</strong> ${orderDetails.shippingAddress || 'N/A'}</p>
                            <p><strong><i class="fas fa-calendar-alt mr-2"></i>Date Placed:</strong> ${orderDate}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <p><strong><i class="fas fa-dollar-sign mr-2"></i>Total Amount:</strong> <span class="text-success font-weight-bold">${formatPrice(orderDetails.totalAmount)}</span></p>
                            <p><strong><i class="fas fa-info-circle mr-2"></i>Status:</strong> <span class="badge badge-${orderDetails.status === 'DELIVERED' ? 'success' : orderDetails.status === 'PENDING' ? 'warning' : 'danger'}">${orderDetails.status || 'N/A'}</span></p>
                            
                        </div>
                    </div>
                    <hr class="my-4">
                    ${itemsTableHtml}
                </div>
            `);
            } else {
                modalBody.html('<p class="text-danger">Could not load order details.</p>');
            }
        } catch (error) {
            console.error(`Error fetching details for order ${orderId}:`, error);
            modalBody.html(`<p class="text-danger">Error loading details: ${error.message}</p>`);
        }
    });


    // --- Initialization ---
    function initManageOrdersPage() {
        if (!isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }
        // TODO: Kiểm tra vai trò ADMIN

        loadOrders();
    }

    initManageOrdersPage();
});