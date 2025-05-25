document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = '';

    // DOM Elements
    const confirmedOrderIdEl = document.getElementById('confirmed-order-id');
    const orderSummaryDetailsEl = document.getElementById('order-summary-details');
    const confirmedOrderItemsUl = document.getElementById('confirmed-order-items');
    const confirmedOrderTotalEl = document.getElementById('confirmed-order-total');
    const confirmedShippingAddressEl = document.getElementById('confirmed-shipping-address');

    // --- Helper Functions (Lấy từ app.js hoặc định nghĩa lại) ---
    function getAuthToken() { return localStorage.getItem('accessToken'); }
    function isLoggedIn() { return !!getAuthToken(); }

    function formatPriceVND(price) {
        if (price === null || price === undefined || isNaN(price)) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    async function fetchData(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if ((response.status === 401 || response.status === 403) && options.headers && options.headers.Authorization) {
                    sessionStorage.setItem('redirectAfterLogin', window.location.href);
                    window.location.href = './login.html';
                    throw new Error('Redirecting to login...');
                }
                const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status} ${response.statusText} on ${url}` }));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status} on ${url}`);
            }
            return response.json(); // Trang này luôn kỳ vọng JSON response từ API order details
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error.message);
            throw error;
        }
    }
    // Các hàm updateHeaderAuthState và updateCartCountHeader sẽ được gọi từ app.js


    // --- Load Order Confirmation Details ---
    async function loadOrderConfirmation() {
        if (!isLoggedIn()) {
            // Nếu chưa đăng nhập mà vào trang này (không nên xảy ra)
            window.location.href = './login.html';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');

        if (!orderId) {
            console.error('Order ID not found in URL.');
            if (confirmedOrderIdEl) confirmedOrderIdEl.textContent = 'N/A - Invalid Order Link';
            if (orderSummaryDetailsEl) orderSummaryDetailsEl.style.display = 'none';
            return;
        }

        if (confirmedOrderIdEl) confirmedOrderIdEl.textContent = orderId;

        try {
            const orderDetails = await fetchData(`${API_BASE_URL}/api/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });

            if (orderDetails && orderSummaryDetailsEl) {
                orderSummaryDetailsEl.style.display = 'block'; // Hiển thị phần tóm tắt

                if (confirmedOrderItemsUl) {
                    confirmedOrderItemsUl.innerHTML = ''; // Xóa item cũ
                    orderDetails.items.forEach(item => {
                        const listItem = document.createElement('li');
                        listItem.innerHTML = `<strong>${item.productName}</strong> (Qty: ${item.quantity}, Color: ${item.productVariantColor || 'N/A'}) - ${formatPriceVND(item.subtotal)}`;
                        confirmedOrderItemsUl.appendChild(listItem);
                    });
                }

                if (confirmedOrderTotalEl) confirmedOrderTotalEl.textContent = formatPriceVND(orderDetails.totalAmount);
                if (confirmedShippingAddressEl) confirmedShippingAddressEl.textContent = orderDetails.shippingAddress;
            }

        } catch (error) {
            console.error('Failed to load order details:', error);
            if (orderSummaryDetailsEl) orderSummaryDetailsEl.innerHTML = '<p>Could not load order summary. Please check "My Orders".</p>';
        }

        // Cập nhật số lượng giỏ hàng trên header (vì giỏ hàng đã được checkout, số lượng sẽ về 0)
        if (typeof window.updateCartCountHeader === "function") {
            window.updateCartCountHeader();
        }
    }

    // --- Initialization ---
    function initPage() {
        // Gọi các hàm từ app.js để cập nhật header
        if (typeof window.updateHeaderAuthState === "function") window.updateHeaderAuthState();
        // updateCartCountHeader() sẽ được gọi bên trong loadOrderConfirmation sau khi có thể đã checkout

        loadOrderConfirmation();

        // Khởi tạo set-bg cho breadcrumb nếu có
        $('.set-bg').each(function () {
            var bg = $(this).data('setbg');
            if (bg) {
                $(this).css('background-image', 'url(' + bg + ')');
            }
        });
    }

    initPage();
});