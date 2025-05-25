// Đặt log này ngay dòng ĐẦU TIÊN của file, BÊN NGOÀI DOMContentLoaded
console.log("[MY-ORDERS.JS - GLOBAL SCOPE] File parsed. Checking window.globalApp immediately:", window.globalApp);
if (window.globalApp) {
    console.log("[MY-ORDERS.JS - GLOBAL SCOPE] globalApp.fetchData type:", typeof window.globalApp.fetchData);
    console.log("[MY-ORDERS.JS - GLOBAL SCOPE] globalApp.isLoggedIn type:", typeof window.globalApp.isLoggedIn);
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("my-orders.js: DOMContentLoaded fired.");
    console.log("my-orders.js: Checking window.globalApp:", window.globalApp);
    if (window.globalApp) {
        console.log("my-orders.js: window.globalApp.fetchData type:", typeof window.globalApp.fetchData);
        console.log("my-orders.js: window.globalApp.isLoggedIn type:", typeof window.globalApp.isLoggedIn);
    }
    if (typeof window.globalApp === 'undefined' || typeof window.globalApp.fetchData !== 'function') {
        console.error("my-orders.js: globalApp or essential functions are not available. Ensure app.js is loaded first and correctly exposes globalApp.");
        alert("Error: Core application script not loaded. Please refresh.");
        const ordersListContainer = document.getElementById('orders-list-container');
        if (ordersListContainer) ordersListContainer.innerHTML = "<p style='color:red;'>Application error. Please try again later.</p>";
        return;
    }

    const { API_BASE_URL, fetchData, formatPriceVND, isLoggedIn, getUserId, getAuthToken } = window.globalApp;

    // DOM Elements
    const ordersListContainer = document.getElementById('orders-list-container');
    const paginationContainer = document.getElementById('orders-pagination-container');

    // State cho phân trang
    let currentPage = 0;
    const pageSize = 5; // Số đơn hàng mỗi trang
    let totalPages = 0;

    // --- Load Orders ---
    async function loadOrders(page = 0) {
        if (!isLoggedIn()) {
            alert('Please log in to view your orders.');
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = './login.html';
            return;
        }

        const userId = getUserId();
        if (!userId) {
            console.error("User ID not found. Cannot load orders.");
            if (ordersListContainer) ordersListContainer.innerHTML = '<p class="text-center no-orders">Could not load orders. User information missing.</p>';
            return;
        }

        currentPage = page;
        if (ordersListContainer) ordersListContainer.innerHTML = '<p class="text-center">Loading your orders...</p>';

        try {
            const url = `${API_BASE_URL}/api/orders?userId=${userId}&page=${currentPage}&size=${pageSize}&sort=createdAt,desc`;
            const orderPage = await fetchData(url, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });

            if (orderPage && orderPage.content) {
                totalPages = orderPage.totalPages;
                if (orderPage.content.length === 0) {
                    ordersListContainer.innerHTML = '<div class="no-orders"><h3>No Orders Found</h3><p>You have not placed any orders yet.</p><a href="./shop-grid.html" class="primary-btn">Start Shopping</a></div>';
                    renderOrdersPagination();
                } else {
                    renderOrdersList(orderPage.content);
                    renderOrdersPagination();
                }
            } else {
                ordersListContainer.innerHTML = '<p class="text-center no-orders">Could not retrieve your orders at this time.</p>';
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
            if (ordersListContainer) ordersListContainer.innerHTML = `<p class="text-center no-orders">Error loading orders: ${error.message}</p>`;
        }
    }

    function renderOrdersList(orders) {
        if (!ordersListContainer) return;
        ordersListContainer.innerHTML = '';

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const statusClass = `order-status-${order.status ? order.status.toLowerCase() : 'unknown'}`;

            let itemsHtml = '<ul>';
            order.items.forEach(item => {
                itemsHtml += `<li>${item.productName} (x${item.quantity}) - ${formatPriceVND(item.subtotal)}</li>`;
            });
            itemsHtml += '</ul>';

            const orderDiv = document.createElement('div');
            orderDiv.classList.add('order-item');
            orderDiv.innerHTML = `
                <div class="order-item-header">
                    <h5>Order ID: #${order.id}</h5>
                    <span class="order-status ${statusClass}">${order.status || 'N/A'}</span>
                </div>
                <p><strong>Date Placed:</strong> ${orderDate}</p>
                <p><strong>Shipping Address:</strong> ${order.shippingAddress || 'N/A'}</p>
                <div class="order-item-products">
                    <strong>Products:</strong>
                    ${itemsHtml}
                </div>
                <div class="order-item-footer">
                    Total: ${formatPriceVND(order.totalAmount)}
                </div>
            `;
            ordersListContainer.appendChild(orderDiv);
        });
    }

    function renderOrdersPagination() {
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }
        paginationContainer.innerHTML = '';

        if (currentPage > 0) {
            const prevLink = createPaginationLink(currentPage - 1, '<i class="fa fa-long-arrow-left"></i>');
            paginationContainer.appendChild(prevLink);
        }

        for (let i = 0; i < totalPages; i++) {
            const pageLink = createPaginationLink(i, (i + 1).toString(), i === currentPage);
            paginationContainer.appendChild(pageLink);
        }

        if (currentPage < totalPages - 1) {
            const nextLink = createPaginationLink(currentPage + 1, '<i class="fa fa-long-arrow-right"></i>');
            paginationContainer.appendChild(nextLink);
        }
    }

    function createPaginationLink(pageNumber, text, isActive = false) {
        const link = document.createElement('a');
        link.href = "#";
        link.innerHTML = text;
        if (isActive) {
            link.classList.add('active');
        }
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadOrders(pageNumber);
        });
        return link;
    }

    // --- Initialization ---
    function initMyOrdersPage() {
        loadOrders();

        if (window.jQuery && typeof window.globalApp.reinitializeSetBg === "function") {
            $('.set-bg').each(function () {
                var bg = $(this).data('setbg');
                if (bg) $(this).css('background-image', 'url(' + bg + ')');
            });
        }
    }

    initMyOrdersPage();
});
