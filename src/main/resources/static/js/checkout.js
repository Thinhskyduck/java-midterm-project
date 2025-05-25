document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = '';

    // DOM Elements
    const fullNameInput = document.getElementById('checkout-fullname');
    const emailInput = document.getElementById('checkout-email');
    const addressInput = document.getElementById('checkout-address');
    const notesInput = document.getElementById('checkout-notes');

    const orderItemsUl = document.getElementById('checkout-order-items');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');

    const checkoutForm = document.getElementById('checkout-form');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const checkoutMessageEl = document.getElementById('checkout-message');


    // --- Helper Functions (Lấy từ app.js hoặc định nghĩa lại) ---
    function getAuthToken() { return localStorage.getItem('accessToken'); }
    function getUserId() { return localStorage.getItem('userId'); }
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
            if (response.status === 204 || (response.status === 201 && (!response.headers.get("content-type") || !response.headers.get("content-type").includes("application/json")))) {
                return { status: response.status, message: "Operation successful, no JSON content." };
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error.message);
            throw error;
        }
    }
    // Các hàm updateHeaderAuthState và updateCartCountHeader sẽ được gọi từ app.js


    // --- Load Initial Data ---
    async function loadCheckoutData() {
        if (!isLoggedIn()) {
            alert('Please log in to proceed to checkout.');
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = './login.html';
            return;
        }

        const userId = getUserId();
        if (!userId) {
            console.error("User ID not found. Cannot proceed.");
            displayCheckoutMessage("Error: User information missing.", "danger");
            if(placeOrderBtn) placeOrderBtn.disabled = true;
            return;
        }

        try {
            // 1. Load User Info
            const userInfo = await fetchData(`${API_BASE_URL}/api/users/me`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (userInfo) {
                if (fullNameInput) fullNameInput.value = userInfo.fullName || '';
                if (emailInput) emailInput.value = userInfo.email || '';
                if (addressInput && userInfo.address) { // Chỉ điền nếu user có địa chỉ mặc định
                    addressInput.value = userInfo.address;
                }
            }

            // 2. Load Cart Items
            const cartItems = await fetchData(`${API_BASE_URL}/api/cart?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });

            if (!cartItems || cartItems.length === 0) {
                displayCheckoutMessage("Your cart is empty. Please add items to your cart before proceeding to checkout.", "warning");
                if (orderItemsUl) orderItemsUl.innerHTML = '<li>Your cart is empty.</li>';
                if (subtotalEl) subtotalEl.textContent = formatPriceVND(0);
                if (totalEl) totalEl.textContent = formatPriceVND(0);
                if (placeOrderBtn) {
                    placeOrderBtn.disabled = true;
                    placeOrderBtn.classList.add('disabled-btn'); // Thêm class để style
                }
                return;
            }

            renderOrderSummary(cartItems);

        } catch (error) {
            console.error('Failed to load checkout data:', error);
            displayCheckoutMessage(`Error loading checkout data: ${error.message}`, "danger");
            if(placeOrderBtn) placeOrderBtn.disabled = true;
        }
    }

    function renderOrderSummary(items) {
        if (!orderItemsUl) return;
        orderItemsUl.innerHTML = ''; // Xóa item cũ

        let currentSubtotal = 0;
        items.forEach(item => {
            const itemTotal = (item.unitPrice || 0) * (item.quantity || 0);
            currentSubtotal += itemTotal;

            // Tạo <li>
            const listItem = document.createElement('li');
            listItem.classList.add('checkout-item');

            // Tạo span tên sản phẩm
            const nameSpan = document.createElement('span');
            nameSpan.classList.add('item-name');
            nameSpan.textContent = `${item.productName} (x${item.quantity})`;

            // Tạo span giá
            const priceSpan = document.createElement('span');
            priceSpan.classList.add('item-price');
            priceSpan.textContent = formatPriceVND(itemTotal);

            // Thêm vào li
            listItem.appendChild(nameSpan);
            listItem.appendChild(priceSpan);

            // Thêm li vào ul
            orderItemsUl.appendChild(listItem);
        });

        if (subtotalEl) subtotalEl.textContent = formatPriceVND(currentSubtotal);
        if (totalEl) totalEl.textContent = formatPriceVND(currentSubtotal);
    }


    function displayCheckoutMessage(message, type = 'danger') {
        if (checkoutMessageEl) {
            checkoutMessageEl.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        }
    }

    // --- Handle Form Submission (Place Order) ---
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (placeOrderBtn && placeOrderBtn.disabled) return;

            const userId = getUserId();
            const shippingAddress = addressInput ? addressInput.value.trim() : '';
            // const orderNotes = notesInput ? notesInput.value.trim() : ''; // Nếu bạn muốn gửi notes

            if (!shippingAddress) {
                displayCheckoutMessage('Please enter a shipping address.', 'danger');
                addressInput.focus();
                return;
            }

            if (!userId) {
                displayCheckoutMessage('User session expired. Please log in again.', 'danger');
                // Có thể chuyển hướng về login
                return;
            }

            const checkoutRequest = {
                userId: parseInt(userId),
                shippingAddress: shippingAddress
                // notes: orderNotes // Thêm nếu backend OrderService.checkout xử lý
            };

            if(placeOrderBtn) {
                placeOrderBtn.disabled = true;
                placeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> PLACING ORDER...';
            }
            const token = getAuthToken();
            if (!isLoggedIn() || !token) { // Kiểm tra lại cả token
                displayCheckoutMessage('User session expired or not logged in. Please log in again.', 'danger');
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = './login.html';
                // Vô hiệu hóa nút và dừng
                if(placeOrderBtn) {
                    placeOrderBtn.disabled = false;
                    placeOrderBtn.textContent = 'PLACE ORDER';
                }
                return;
            }
            console.log("Token being sent for checkout:", token); // DEBUG TOKEN
            console.log("Checkout request payload:", checkoutRequest); // DEBUG PAYLOAD

            try {
                const orderResponse = await fetchData(`${API_BASE_URL}/api/orders/checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`
                    },
                    body: JSON.stringify(checkoutRequest)
                });

                if (orderResponse && (orderResponse.status === 201 || orderResponse.id )) { // Kiểm tra cả orderResponse.id nếu API trả về OrderResponse
                    displayCheckoutMessage('Order placed successfully! Thank you for your purchase.', 'success');
                    // Xóa giỏ hàng ở client side (hoặc backend tự làm sau khi checkout)
                    // Chuyển hướng đến trang xác nhận đơn hàng hoặc trang chủ
                    if (typeof window.updateCartCountHeader === "function") {
                        window.updateCartCountHeader(); // Cập nhật lại số lượng giỏ hàng trên header (sẽ về 0)
                    }
                    setTimeout(() => {
                        // Chuyển hướng đến trang cảm ơn / chi tiết đơn hàng mới
                        // Giả sử API checkout trả về orderId
                        const createdOrderId = orderResponse.id || (orderResponse.data ? orderResponse.data.id : null);
                        if (createdOrderId) {
                            window.location.href = `./order-confirmation.html?orderId=${createdOrderId}`;
                        } else {
                            window.location.href = './index.html';
                        }
                    }, 1000);
                } else {
                    const message = orderResponse ? orderResponse.message : "Failed to place order.";
                    displayCheckoutMessage(`Error placing order: ${message}`, 'danger');
                    if(placeOrderBtn) {
                        placeOrderBtn.disabled = false;
                        placeOrderBtn.textContent = 'PLACE ORDER';
                    }
                }

            } catch (error) {
                displayCheckoutMessage(`An error occurred: ${error.message}`, 'danger');
                if(placeOrderBtn) {
                    placeOrderBtn.disabled = false;
                    placeOrderBtn.textContent = 'PLACE ORDER';
                }
            }
        });
    }


    // --- Initialization ---
    function initCheckoutPage() {
        // Gọi các hàm từ app.js để cập nhật header
        if (typeof window.updateHeaderAuthState === "function") window.updateHeaderAuthState();
        if (typeof window.updateCartCountHeader === "function") window.updateCartCountHeader();

        loadCheckoutData();

        // Kích hoạt Nice Select cho các select box nếu có (template Ogani có thể dùng)
        if ($.fn.niceSelect) {
            $('select').niceSelect();
        }
    }

    initCheckoutPage();
});