document.addEventListener('DOMContentLoaded', function () {
    // Các hàm helper và API_BASE_URL có thể lấy từ app.js nếu app.js được load trước
    // Hoặc định nghĩa lại ở đây nếu shopping-cart.js là độc lập
    const API_BASE_URL = ''; // Backend cùng origin

    // DOM Elements specific to shopping-cart.html
    const cartItemsTbody = document.getElementById('cart-items-tbody');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartTotalEl = document.getElementById('cart-total');
    const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
    const cartContentWrapper = document.getElementById('cart-content-wrapper'); // Bao gồm bảng
    const cartActionsSummaryWrapper = document.getElementById('cart-actions-summary-wrapper'); // Bao gồm nút và tổng tiền
    const emptyCartMessageEl = document.getElementById('empty-cart-message');
    const couponForm = document.getElementById('coupon-form');


    // --- Helper Functions (Lấy từ app.js hoặc định nghĩa lại) ---
    function getAuthToken() { return localStorage.getItem('accessToken'); }
    function getUserId() { return localStorage.getItem('userId'); }
    function isLoggedIn() { return !!getAuthToken(); } // !! converts to boolean

    function formatPriceVND(price) {
        if (price === null || price === undefined || isNaN(price)) return '0 ₫'; // Trả về 0 VND nếu không hợp lệ
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    async function fetchData(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if ((response.status === 401 || response.status === 403) && options.headers && options.headers.Authorization) {
                    console.warn('Authentication error, redirecting to login.');
                    // Lưu lại trang hiện tại để quay lại sau khi login
                    sessionStorage.setItem('redirectAfterLogin', window.location.href);
                    window.location.href = './login.html';
                    throw new Error('Redirecting to login...'); // Ném lỗi để dừng thực thi tiếp
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
    // Các hàm updateHeaderAuthState và updateCartCountHeader sẽ được gọi từ app.js nếu nó được include
    // Nếu shopping-cart.js là độc lập và app.js không được include, bạn cần copy các hàm đó vào đây.
    // Giả sử app.js được include và các hàm đó đã có sẵn toàn cục hoặc trong một object dùng chung.


    // --- Core Cart Functions for this page ---
    async function loadCartItemsAndRender() {
        if (!isLoggedIn()) {
            // Thông báo này có thể không cần nếu app.js đã xử lý chuyển hướng
            // alert('Please log in to view your cart.');
            // sessionStorage.setItem('redirectAfterLogin', window.location.href);
            // window.location.href = './login.html';
            displayEmptyCart("Please log in to view your cart."); // Hiển thị thông báo khác
            return;
        }

        const userId = getUserId();
        if (!userId) {
            console.error("User ID not found. Cannot load cart.");
            displayEmptyCart("Could not load cart. User information missing.");
            return;
        }

        try {
            const cartItems = await fetchData(`${API_BASE_URL}/api/cart?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });

            if (!cartItems || cartItems.length === 0) {
                displayEmptyCart();
            } else {
                renderCartTable(cartItems);
                updateCartSummary(cartItems);
                showCartContent();
            }
        } catch (error) {
            console.error('Failed to load cart items:', error);
            displayEmptyCart(`Error loading cart: ${error.message}`);
        }
        // Cập nhật số lượng trên header (gọi từ app.js hoặc định nghĩa ở đây nếu độc lập)
        if (typeof window.updateCartCountHeader === "function") {
            window.updateCartCountHeader();
        }
    }

    function renderCartTable(items) {
        if (!cartItemsTbody) return;
        cartItemsTbody.innerHTML = ''; // Xóa các item cũ

        items.forEach(item => {
            const itemTotal = (item.unitPrice || 0) * (item.quantity || 0);
            const row = document.createElement('tr');
            row.setAttribute('data-cart-item-id', item.cartItemId);

            row.innerHTML = `
                <td class="shoping__cart__item">
                    <img src="${item.imageUrl || 'img/product/product-default.jpg'}" alt="${item.productName}" style="width: 90px; height: 90px; object-fit: cover; margin-right: 15px;">
                    <div>
                        <h5>${item.productName}</h5>             
                        <div style="
                            margin-top: 4px;
                            display: inline-block;
                            background-color: #f0f0f0;
                            padding: 4px 8px;
                            border-radius: 12px;
                            font-size: 12px;
                            color: #555;
                        ">
                            <span style="font-weight: 500;"></span> 
                            <span>${item.color || 'Không có'}</span>
                        </div>
                    </div>
                </td>
                <td class="shoping__cart__price">
                    ${formatPriceVND(item.unitPrice)}
                </td>
                <td class="shoping__cart__quantity">
                    <div class="quantity">
                        <div class="pro-qty">
                            <span class="dec qtybtn" data-item-id="${item.cartItemId}">-</span>
                            <input type="text" value="${item.quantity}" data-item-id="${item.cartItemId}" data-original-quantity="${item.quantity}">
                            <span class="inc qtybtn" data-item-id="${item.cartItemId}">+</span>
                        </div>
                    </div>
                </td>
                <td class="shoping__cart__total" id="item-total-${item.cartItemId}">
                    ${formatPriceVND(itemTotal)}
                </td>
                <td class="shoping__cart__item__close">
                    <span class="icon_close" data-item-id="${item.cartItemId}" title="Remove item"></span>
                </td>
            `;
            cartItemsTbody.appendChild(row);
        });
        attachCartItemEventListeners(); // Gắn event sau khi render
    }

    function updateCartSummary(items) {
        const subtotal = items.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0), 0);
        const total = subtotal; // Chưa có discount/shipping

        if (cartSubtotalEl) cartSubtotalEl.textContent = formatPriceVND(subtotal);
        if (cartTotalEl) cartTotalEl.textContent = formatPriceVND(total);

        if (proceedToCheckoutBtn) {
            if (items.length === 0) {
                proceedToCheckoutBtn.classList.add('disabled-btn'); // Dùng class CSS để style nút bị vô hiệu hóa
                proceedToCheckoutBtn.style.pointerEvents = 'none';
            } else {
                proceedToCheckoutBtn.classList.remove('disabled-btn');
                proceedToCheckoutBtn.style.pointerEvents = 'auto';
            }
        }
    }

    function displayEmptyCart(message = "Your cart is empty!") {
        if (cartContentWrapper) cartContentWrapper.style.display = 'none';
        if (cartActionsSummaryWrapper) cartActionsSummaryWrapper.style.display = 'none';
        if (emptyCartMessageEl) {
            emptyCartMessageEl.style.display = 'block';
            // Cập nhật nội dung thông báo nếu cần
            const pTag = emptyCartMessageEl.querySelector('p');
            if (pTag) pTag.textContent = message.includes("log in") ? message : "Looks like you haven't added anything to your cart yet.";
        }
        if (cartSubtotalEl) cartSubtotalEl.textContent = formatPriceVND(0);
        if (cartTotalEl) cartTotalEl.textContent = formatPriceVND(0);
    }

    function showCartContent() {
        if (cartContentWrapper) cartContentWrapper.style.display = 'block'; // Hoặc 'table' nếu shoping__cart__table là table
        if (cartActionsSummaryWrapper) cartActionsSummaryWrapper.style.display = 'flex'; // Hoặc 'block'
        if (emptyCartMessageEl) emptyCartMessageEl.style.display = 'none';
    }

    // --- Event Handlers for Cart Items ---
    function attachCartItemEventListeners() {
        // Xóa item
        cartItemsTbody.querySelectorAll('.icon_close').forEach(button => {
            button.addEventListener('click', function () {
                const cartItemId = this.dataset.itemId;
                if (confirm('Are you sure you want to remove this item?')) {
                    handleRemoveItem(cartItemId);
                }
            });
        });

        // Nút giảm số lượng
        cartItemsTbody.querySelectorAll('.pro-qty .dec.qtybtn').forEach(button => {
            button.addEventListener('click', function () {
                const input = this.parentElement.querySelector('input[type="text"]');
                let currentValue = parseInt(input.value);
                if (currentValue > 1) {
                    input.value = currentValue - 1;
                    // Gọi API cập nhật sau khi người dùng dừng thay đổi (ví dụ, khi blur hoặc có nút "Update Cart")
                    // Hoặc gọi ngay lập tức:
                    handleUpdateQuantity(this.dataset.itemId, currentValue - 1, input);
                }
            });
        });

        // Nút tăng số lượng
        cartItemsTbody.querySelectorAll('.pro-qty .inc.qtybtn').forEach(button => {
            button.addEventListener('click', function () {
                const input = this.parentElement.querySelector('input[type="text"]');
                let currentValue = parseInt(input.value);
                input.value = currentValue + 1;
                handleUpdateQuantity(this.dataset.itemId, currentValue + 1, input);
            });
        });

        // Xử lý thay đổi trực tiếp trên input (khi người dùng blur hoặc nhấn Enter)
        cartItemsTbody.querySelectorAll('.pro-qty input[type="text"]').forEach(input => {
            input.addEventListener('change', function() { // Hoặc 'blur'
                let newQuantity = parseInt(this.value);
                const cartItemId = this.dataset.itemId;
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1; // Hoặc lấy lại giá trị cũ từ data-original-quantity
                    this.value = newQuantity;
                }
                handleUpdateQuantity(cartItemId, newQuantity, this);
            });
        });
    }

    async function handleUpdateQuantity(cartItemId, newQuantity, inputElement) {
        if (!isLoggedIn() || !cartItemId) return;
        const originalQuantity = inputElement ? parseInt(inputElement.dataset.originalQuantity) : null;

        const updateRequest = {
            userId: parseInt(getUserId()),
            newQuantity: newQuantity
        };

        try {
            const updatedItemResponse = await fetchData(`${API_BASE_URL}/api/cart/items/${cartItemId}/quantity`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(updateRequest)
            });

            if (updatedItemResponse) { // API trả về CartItemResponse đã cập nhật
                // Cập nhật UI cho item đó và tổng tiền
                const row = cartItemsTbody.querySelector(`tr[data-cart-item-id="${cartItemId}"]`);
                if (row) {
                    row.querySelector('.shoping__cart__quantity input').value = updatedItemResponse.quantity;
                    row.querySelector('.shoping__cart__quantity input').dataset.originalQuantity = updatedItemResponse.quantity;
                    const itemTotalEl = row.querySelector('.shoping__cart__total');
                    if (itemTotalEl) {
                        itemTotalEl.textContent = formatPriceVND(updatedItemResponse.unitPrice * updatedItemResponse.quantity);
                    }
                }
                // Lấy lại toàn bộ cart items để tính lại tổng tiền một cách chính xác
                // hoặc bạn có thể tính toán lại dựa trên sự thay đổi.
                // Để đơn giản, load lại toàn bộ cart items (sẽ gọi lại updateCartSummary)
                loadCartItemsAndRender(); // Hoặc chỉ gọi updateCartSummary nếu bạn tính toán lại item total
            }
        } catch (error) {
            alert(`Error updating quantity: ${error.message}`);
            if (inputElement && originalQuantity !== null) { // Khôi phục giá trị cũ nếu lỗi
                inputElement.value = originalQuantity;
            }
            // Có thể load lại toàn bộ giỏ hàng để đảm bảo đồng bộ
            // loadCartItemsAndRender();
        }
    }


    async function handleRemoveItem(cartItemId) {
        if (!isLoggedIn() || !cartItemId) return;
        try {
            await fetchData(`${API_BASE_URL}/api/cart/remove/${cartItemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            loadCartItemsAndRender(); // Load lại giỏ hàng
        } catch (error) {
            alert(`Error removing item: ${error.message}`);
        }
    }


    // --- Page Initialization ---
    function initPage() {
        // Gọi các hàm từ app.js để cập nhật header, nếu app.js được load trước
        // và các hàm đó được expose globaly hoặc qua một object dùng chung.
        // Ví dụ: if (typeof window.AppGlobal !== 'undefined') {
        //     window.AppGlobal.updateHeaderAuthState();
        //     window.AppGlobal.updateCartCountHeader();
        // }
        // Hiện tại, giả sử app.js cũng sẽ chạy và gọi các hàm cập nhật header của nó.

        loadCartItemsAndRender();

        if (proceedToCheckoutBtn) {
            proceedToCheckoutBtn.addEventListener('click', function(e) {
                if (this.classList.contains('disabled-btn')) {
                    e.preventDefault();
                    alert("Your cart is empty. Please add items to proceed.");
                } else {
                    window.location.href = './checkout.html';
                }
            });
        }

        if (couponForm) {
            couponForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const couponCode = document.getElementById('coupon-code-input').value;
                if (couponCode) {
                    alert(`Applying coupon: ${couponCode} (Feature not yet implemented)`);
                } else {
                    alert('Please enter a coupon code.');
                }
            });
        }
    }

    initPage();
});