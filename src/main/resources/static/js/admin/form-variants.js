document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.AdminApp === 'undefined' || typeof window.AdminApp.fetchData !== 'function') {
        console.error("form-variants.js: AdminApp or essential functions are not available.");
        alert("Error: Core admin script not loaded.");
        return;
    }
    const { API_BASE_URL, fetchData, isLoggedIn, getAuthToken } = window.AdminApp;

    // DOM Elements (từ form_variants.html của bạn)
    const breadcrumbProductLink = document.querySelector('.breadcrumb-item a[href^="view_variants.html"]'); // Để cập nhật link back



    const variantForm = document.getElementById('variant-add-form'); // ID của form
    const productNameInput = document.getElementById('product-name'); // Input hiển thị tên sản phẩm (disabled)
    const variantColorInput = document.getElementById('variant-color');
    const variantPriceInput = document.getElementById('variant-price');
    const variantStockInput = document.getElementById('variant-stock');
    const variantImageInput = document.getElementById('variant-image'); // Input file
    // const variantImageLabel = document.querySelector('.custom-file-label[for="variant-image"]');
    // const submitButton = variantForm.querySelector('button[type="submit"]');
    // const backButton = variantForm.querySelector('a.btn-secondary');
    // Start Image
    const variantImageFileInput = document.getElementById('variant-image-file');
    const variantImageFileLabel = document.querySelector('.custom-file-label[for="variant-image-file"]');
    const pageTitleEl = document.querySelector('.main-container .title h4'); // Thêm nếu chưa có
    const breadcrumbActiveEl = document.querySelector('.breadcrumb-item.active'); // Thêm nếu chưa có
    const backButton = variantForm ? variantForm.querySelector('a.btn-secondary') : null; // Thêm nếu chưa có
    // End Image
    const submitButton = variantForm ? variantForm.querySelector('button[type="submit"]') : null;
    let currentProductId = null;
    let currentVariantId = null;
    let currentProductName = '';
    let initialImageUrl = ""; // Lưu URL ảnh ban đầu khi edit

    // Event listener cho input file
    if (variantImageFileInput && variantImageFileLabel) {
        variantImageFileInput.addEventListener('change', function() {
            const fileName = this.files[0] ? this.files[0].name : (initialImageUrl ? initialImageUrl.split('/').pop() : 'Choose image file...');
            variantImageFileLabel.textContent = fileName;
            // Không cần cập nhật input ẩn ở đây nữa, sẽ xử lý khi submit
        });
    }
    function getIdsFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        currentProductId = urlParams.get('productId');
        currentVariantId = urlParams.get('variantId'); // Sẽ null nếu là thêm mới
        currentProductName = urlParams.get('productName') || 'Product';
        return { productId: currentProductId, variantId: currentVariantId, productName: currentProductName };
    }

    function displayFormMessage(message, type = 'danger', formElement = variantForm) {
        let messageDiv = formElement.querySelector('.form-variant-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.classList.add('form-variant-message', 'alert', 'mt-3');
            formElement.insertBefore(messageDiv, submitButton.parentElement);
        }
        messageDiv.className = `form-variant-message alert alert-${type} mt-3`;
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
    }


    async function loadVariantForEdit(productId, variantId) {
        if (!variantId) return; // Chế độ thêm mới

        if (pageTitleEl) pageTitleEl.textContent = `Edit Variant for ${decodeURIComponent(currentProductName)}`;
        if (breadcrumbActiveEl) breadcrumbActiveEl.textContent = 'Edit Variant';
        if (submitButton) submitButton.textContent = 'Update Variant';
        if (backButton) backButton.href = `view_variants.html?productId=${productId}&productName=${encodeURIComponent(currentProductName)}`;


        try {
            // API GET /api/variants/{id} để lấy chi tiết variant
            const variant = await fetchData(`/api/variants/${variantId}`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (variant) {
                if (variantColorInput) variantColorInput.value = variant.color || '';
                if (variantPriceInput) variantPriceInput.value = variant.price !== null ? variant.price : '';
                if (variantStockInput) variantStockInput.value = variant.stockQty !== null ? variant.stockQty : '';

                initialImageUrl = variant.imageUrl || ""; // Lưu URL ảnh ban đầu

                if (variantImageFileLabel && variant.imageUrl) { // Hiển thị tên file từ URL đã lưu
                    variantImageFileLabel.textContent = variant.imageUrl.split('/').pop() || 'Choose image file...';
                } else if (variantImageFileLabel) {
                    variantImageFileLabel.textContent = 'Choose image file...';
                }
                // Không set value cho input type="file"
            } else {
                displayFormMessage(`Variant with ID ${variantId} not found.`, "warning");
            }
        } catch (error) {
            displayFormMessage(`Error loading variant for editing: ${error.message}`, "danger");
        }
    }


    if (variantForm) {
        variantForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const originalButtonText = submitButton.textContent;

            // Lấy URL ảnh từ input ẩn đã được JS cập nhật
            let imageUrlValue = initialImageUrl;

            // Nếu người dùng đã chọn một file mới
            if (variantImageFileInput && variantImageFileInput.files && variantImageFileInput.files.length > 0) {
                const newFileName = variantImageFileInput.files[0].name;
                imageUrlValue = `img/product/${newFileName}`; // Hoặc img/variants/ tùy quy ước
                console.log("New image file selected, generated URL:", imageUrlValue);
            } else if (currentVariantId) { // Chế độ edit và không chọn file mới
                // Giữ nguyên imageUrlValue là initialImageUrl đã load
                console.log("Edit mode, no new file selected, keeping initial URL:", initialImageUrl);
            } else { // Chế độ add new và không chọn file
                imageUrlValue = ""; // Hoặc một URL placeholder mặc định nếu muốn
                console.log("Add new mode, no file selected, imageUrl will be empty or placeholder.");
            }

            const variantData = {
                // productId không cần gửi trong body khi update, chỉ cần cho create
                color: variantColorInput.value.trim(),
                price: parseFloat(variantPriceInput.value) || null,
                stockQty: parseInt(variantStockInput.value) || 0,
                imageUrl: imageUrlValue.trim() // Sử dụng imageUrlValue đã được xác định
            };

            if (!currentVariantId) { // Nếu là tạo mới, thêm productId
                variantData.productId = parseInt(currentProductId);
                if (isNaN(variantData.productId)) {
                    displayFormMessage("Product ID is missing or invalid for new variant.", "danger");
                    return;
                }
            }

            if (!variantData.color || variantData.price === null || variantData.stockQty === null) {
                displayFormMessage("Please fill in all required fields (Color, Price, Stock).", "warning");
                return;
            }

            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
            displayFormMessage('', 'info'); // Xóa thông báo cũ



            let requestMethod = 'POST';
            let apiUrl = `${API_BASE_URL}/api/variants`;
            if (currentVariantId) {
                requestMethod = 'PUT';
                apiUrl = `${API_BASE_URL}/api/variants/${currentVariantId}`;
            }

            const token = getAuthToken();
            if (!token) { /* ... xử lý chưa đăng nhập ... */ return; }

            try {
                // TODO: Xử lý upload file cho variantImageInput nếu người dùng chọn file mới
                // Hiện tại, API backend của bạn nhận imageUrl là string.
                // Nếu bạn có một input text cho image URL, lấy giá trị từ đó.
                // Ví dụ:
                // const imageUrlFromInput = document.getElementById('variant-image-url-text-input');
                // if (imageUrlFromInput) variantData.imageUrl = imageUrlFromInput.value.trim();

                const result = await fetchData(apiUrl, {
                    method: requestMethod,
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(variantData)
                });

                if (result) {
                    const successMessage = currentVariantId ? 'Variant updated successfully!' : 'Variant created successfully!';
                    displayFormMessage(successMessage, 'success');
                    setTimeout(() => {
                        window.location.href = `view_variants.html?productId=${currentProductId}&productName=${encodeURIComponent(currentProductName)}`;
                    }, 1500);
                } else {
                    displayFormMessage('Operation failed. No specific response data.', 'danger');
                }
            } catch (error) {
                displayFormMessage(`Error saving variant: ${error.message}`, 'danger');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // Xử lý hiển thị tên file khi chọn (cho Bootstrap custom file input)
    if (variantImageInput) {
        $(variantImageInput).on('change', function() {
            var fileName = $(this).val().split('\\').pop();
            $(this).next('.custom-file-label').html(fileName || 'Choose image file');
        });
    }

    // --- Initialization ---
    async function initFormVariantPage() {
        // ... (kiểm tra login, lấy params từ URL)
        if (!isLoggedIn()) { window.location.href = '../login.html'; return; }

        const params = getIdsFromUrl(); // Hàm này bạn đã có
        if (!params.productId) {
            alert("Product ID is missing. Cannot add/edit variant.");
            window.location.href = 'manage_products.html';
            return;
        }
        currentProductId = params.productId; // Gán vào biến global của script này
        currentProductName = params.productName; // Gán vào biến global

        if (productNameInput) productNameInput.value = decodeURIComponent(params.productName);
        if (params.variantId) { // Chế độ Edit
            currentVariantId = params.variantId; // Gán vào biến global
            await loadVariantForEdit(params.productId, params.variantId);
        } else { // Chế độ Add new
            if (pageTitleEl) pageTitleEl.textContent = `Add New Variant for ${decodeURIComponent(params.productName)}`;
            if (breadcrumbActiveEl) breadcrumbActiveEl.textContent = 'Add New Variant';
            if (submitButton) submitButton.textContent = 'Save Variant';
            if (backButton) backButton.href = `view_variants.html?productId=${params.productId}&productName=${encodeURIComponent(params.productName)}`;
            initialImageUrl = ""; // Reset cho chế độ add new
            if (variantImageFileLabel) variantImageFileLabel.textContent = 'Choose image file...';
        }
    }

    initFormVariantPage();
});