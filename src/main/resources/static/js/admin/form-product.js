document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.AdminApp === 'undefined' ||
        typeof window.AdminApp.fetchData !== 'function' ||
        typeof window.AdminApp.getAuthToken !== 'function') {
        console.error("form-product.js: AdminApp or essential functions are not available.");
        alert("Error: Core admin script not loaded.");
        return;
    }
    const { API_BASE_URL, fetchData, isLoggedIn, formatPrice, getAuthToken } = window.AdminApp;

    // DOM Elements
    const pageTitle = document.querySelector('.main-container .title h4');
    const breadcrumbActive = document.querySelector('.main-container .breadcrumb-item.active');
    const productForm = document.getElementById('product-management-form'); // Giả sử form có ID này

    const productNameInput = document.getElementById('product-name');
    const productDescriptionTextarea = document.getElementById('product-description');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image'); // Input file
    const productImageLabel = document.querySelector('.custom-file-label[for="product-image"]');
    const productCategorySelect = document.getElementById('product-category');
    const productBrandSelect = document.getElementById('product-brand');
    // (Thêm các input khác nếu có)

    let currentProductId = null; // Sẽ được set nếu ở chế độ edit

    // --- Helper ---
    function displayFormMessage(message, type = 'danger') {
        // Tạo một div cho message nếu chưa có, hoặc dùng một div cố định
        let messageDiv = document.getElementById('form-product-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'form-product-message';
            messageDiv.classList.add('alert', 'mt-3');
            productForm.parentNode.insertBefore(messageDiv, productForm.nextSibling); // Chèn sau form
        }
        messageDiv.className = `alert alert-${type} mt-3`;
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
    }


    // --- Load Categories and Brands for Selects ---
    async function loadDropdownData() {
        try {
            const [categories, brands] = await Promise.all([
                fetchData('/api/categories'),
                fetchData('/api/brands')
            ]);

            if (productCategorySelect && categories) {
                productCategorySelect.innerHTML = '<option value="">Select a category</option>';
                categories.forEach(cat => {
                    productCategorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
                });
            }

            if (productBrandSelect && brands) {
                productBrandSelect.innerHTML = '<option value="">Select a brand</option>';
                brands.forEach(brand => {
                    productBrandSelect.innerHTML += `<option value="${brand.id}">${brand.name}</option>`;
                });
            }
        } catch (error) {
            console.error("Error loading categories/brands:", error);
            displayFormMessage("Could not load categories or brands. Please try again.", "danger");
        }
    }

    // --- Load Product Data for Editing ---
    async function loadProductForEdit(productId) {
        try {
            const product = await fetchData(`/api/products/${productId}`);
            if (product) {
                if (productNameInput) productNameInput.value = product.name || '';
                if (productDescriptionTextarea) productDescriptionTextarea.value = product.description || '';
                if (productPriceInput) productPriceInput.value = product.basePrice !== null ? product.basePrice : '';
                // productImageInput không thể set value cho input file, người dùng phải chọn lại nếu muốn đổi
                if (productImageLabel && product.imageUrl) productImageLabel.textContent = product.imageUrl.split('/').pop(); // Hiển thị tên file ảnh hiện tại (nếu có)

                if (productCategorySelect && product.category) productCategorySelect.value = product.category.id;
                if (productBrandSelect && product.brand) productBrandSelect.value = product.brand.id;

                if (pageTitle) pageTitle.textContent = `Edit Product (ID: ${product.id})`;
                if (breadcrumbActive) breadcrumbActive.textContent = 'Edit Product';
                const submitButton = productForm.querySelector('button[type="submit"]');
                if (submitButton) submitButton.textContent = 'Update Product';
            } else {
                displayFormMessage(`Product with ID ${productId} not found.`, "warning");
            }
        } catch (error) {
            displayFormMessage(`Error loading product for editing: ${error.message}`, "danger");
        }
    }

    // --- Handle Form Submission (Create or Update) ---
    if (productForm) {
        productForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            // Thu thập dữ liệu từ form
            // Đối với input file, bạn cần xử lý upload file riêng (phức tạp hơn, tạm thời bỏ qua upload, chỉ lấy URL)
            // Nếu bạn muốn upload file, bạn sẽ cần dùng FormData và API backend phải hỗ trợ multipart/form-data
            const productData = {
                name: productNameInput.value.trim(),
                description: productDescriptionTextarea.value.trim(),
                basePrice: parseFloat(productPriceInput.value) || null,
                imageUrl: "", // Tạm thời để trống, hoặc lấy từ một input text cho URL ảnh
                categoryId: parseInt(productCategorySelect.value) || null,
                brandId: parseInt(productBrandSelect.value) || null
            };

            // Đơn giản hóa: Nếu có productImageInput và người dùng chọn file, bạn cần logic upload file
            // Hiện tại, giả sử API backend nhận imageUrl là string.
            const imageUrlInput = document.getElementById('product-image-url-input'); // Ví dụ
            if (imageUrlInput) {
                productData.imageUrl = imageUrlInput.value.trim();
            }

            if (!productData.name || productData.basePrice === null || !productData.categoryId || !productData.brandId) {
                displayFormMessage("Please fill in all required fields (Name, Base Price, Category, Brand).", "warning");
                return;
            }

            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
            displayFormMessage('', 'info'); // Xóa thông báo cũ

            let requestMethod = 'POST';
            let apiUrl = `${API_BASE_URL}/api/products`;
            if (currentProductId) { // Chế độ Edit
                requestMethod = 'PUT';
                apiUrl = `${API_BASE_URL}/api/products/${currentProductId}`;
            }
            const token = getAuthToken(); // <<< LẤY TOKEN Ở ĐÂY
            if (!token) {
                displayFormMessage("Authentication token not found. Please log in again.", "danger");
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                // Có thể chuyển hướng về login
                // window.location.href = '../login.html';
                return;
            }

            try {
                const result = await fetchData(apiUrl, {
                    method: requestMethod,
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(productData)
                });

                if (result) { // API POST/PUT của ProductController trả về ProductResponse
                    const successMessage = currentProductId ? 'Product updated successfully!' : 'Product created successfully!';
                    displayFormMessage(successMessage, 'success');
                    // Chuyển hướng về trang quản lý sản phẩm sau một chút
                    setTimeout(() => {
                        window.location.href = 'manage_products.html';
                    }, 1500);
                } else {
                    displayFormMessage('Operation failed. No response data.', 'danger');
                }
            } catch (error) {
                displayFormMessage(`Error saving product: ${error.message}`, 'danger');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // Xử lý khi tên file được chọn cho input file (Bootstrap custom file input)
    if (productImageInput) {
        $(productImageInput).on('change',function(){
            //lấy tên file
            var fileName = $(this).val().split('\\').pop();
            //thay thế label "Choose file..." bằng tên file
            $(this).next('.custom-file-label').html(fileName);
        })
    }


    // --- Initialization ---
    async function initFormProductPage() {
        if (!isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }
        const currentUser = await fetchData('/api/users/me', { headers: { 'Authorization': `Bearer ${getAuthToken()}` }});
        if (!currentUser || currentUser.role !== 'ADMIN') {
            window.location.href = '../login.html';
            return;
        }

        await loadDropdownData(); // Load category và brand cho select box

        const urlParams = new URLSearchParams(window.location.search);
        const productIdFromUrl = urlParams.get('id');

        if (productIdFromUrl) {
            currentProductId = parseInt(productIdFromUrl);
            if (!isNaN(currentProductId)) {
                await loadProductForEdit(currentProductId);
            } else {
                console.error("Invalid product ID in URL.");
                if (pageTitle) pageTitle.textContent = 'Add New Product'; // Fallback về add mode
                if (breadcrumbActive) breadcrumbActive.textContent = 'Add New Product';
            }
        } else {
            if (pageTitle) pageTitle.textContent = 'Add New Product';
            if (breadcrumbActive) breadcrumbActive.textContent = 'Add New Product';
        }
    }

    initFormProductPage();
});