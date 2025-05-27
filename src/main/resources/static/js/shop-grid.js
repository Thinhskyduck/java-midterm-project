// src/main/resources/static/js/shop-grid.js
document.addEventListener('DOMContentLoaded', function () {
    // Kiểm tra xem các hàm global từ app.js có tồn tại không
    if (typeof window.globalApp === 'undefined' ||
        typeof window.globalApp.fetchData !== 'function' ||
        typeof window.globalApp.formatPriceVND !== 'function') {
        console.error("Critical functions from app.js (globalApp.fetchData, globalApp.formatPriceVND) are not available. Make sure app.js is loaded first and exposes these functions.");
        // Có thể hiển thị thông báo lỗi cho người dùng ở đây
        const productGridContainerError = document.getElementById('product-grid-container');
        if (productGridContainerError) productGridContainerError.innerHTML = '<p class="col-12 text-center" style="color:red;">Error: Core application script (app.js) failed to load. Please try refreshing the page.</p>';
        return; // Dừng thực thi nếu các hàm thiết yếu không có
    }

    // Sử dụng các hàm đã được expose từ app.js thông qua window.globalApp
    const API_BASE_URL = window.globalApp.API_BASE_URL || '';
    const fetchData = window.globalApp.fetchData;
    const formatPriceVND = window.globalApp.formatPriceVND;
    const reinitializeSetBg = window.globalApp.reinitializeSetBg;
    const updateCartCountHeader = window.globalApp.updateCartCountHeader;
    const isLoggedIn = window.globalApp.isLoggedIn;
    const getUserId = window.globalApp.getUserId;
    const getAuthToken = window.globalApp.getAuthToken;

    // DOM Elements của shop-grid.html
    const filterCategoriesList = document.getElementById('filter-categories-list');
    const filterColorsList = document.getElementById('filter-colors-list');
    const filterBrandsList = document.getElementById('filter-brands-list');
    const productGridContainer = document.getElementById('product-grid-container');
    const productsFoundCountEl = document.getElementById('products-found-count') ? document.getElementById('products-found-count').querySelector('span') : null;
    const paginationContainer = document.getElementById('pagination-container');
    const sortBySelect = document.getElementById('sort-by-select');
    console.log("sortBySelect element:", sortBySelect);

    const sortBySelectJQ = $('#sort-by-select'); // jQuery selector

    const minAmountInput = document.getElementById('minamount');
    const maxAmountInput = document.getElementById('maxamount');
    const filterPriceBtn = document.getElementById('filter-price-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    let currentFilters = {
        categoryId: null,
        brandName: null,
        color: null,
        minPrice: null,
        maxPrice: null,
        productName: null,
        page: 0,
        size: 9,
        sort: 'default'
    };
    let totalPages = 0;

    // --- Load Initial Filter Options ---
    async function loadInitialFilters() {
        try {
            // Load Categories
            const categories = await fetchData(`${API_BASE_URL}/api/categories`);
            // Trong js/shop-grid.js -> loadInitialFilters
            if (filterCategoriesList && categories) {
                filterCategoriesList.innerHTML = '<li><a href="#" class="filter-category active" data-category-id="">All Categories</a></li>';
                categories.forEach(cat => {
                    filterCategoriesList.innerHTML += `<li><a href="#" class="filter-category" data-category-id="${cat.id}">${cat.name}</a></li>`;
                });
                // Gắn event listener SAU KHI render HTML
                filterCategoriesList.querySelectorAll('.filter-category').forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        filterCategoriesList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                        this.classList.add('active');
                        currentFilters.categoryId = this.dataset.categoryId || null; // Lấy categoryId
                        applyFiltersAndFetchProducts(); // Gọi hàm fetch lại sản phẩm
                    });
                });
            }

            // Load Brands
            const brands = await fetchData(`${API_BASE_URL}/api/brands`);
            if (filterBrandsList && brands) {
                filterBrandsList.innerHTML = `
                    <label class="active">
                        <input type="radio" name="filter_brand_shop_grid" value="" checked> All Brands
                    </label>`; // Thêm name khác để tránh xung đột với các radio khác nếu có
                brands.forEach(brand => {
                    const brandIdSafe = `brand-filter-${brand.id}`;
                    filterBrandsList.innerHTML += `
                        <label for="${brandIdSafe}">
                            ${brand.name}
                            <input type="radio" id="${brandIdSafe}" name="filter_brand_shop_grid" value="${brand.name}">
                        </label>`;
                });
                filterBrandsList.querySelectorAll('input[name="filter_brand_shop_grid"]').forEach(radio => {
                    radio.addEventListener('change', function() {
                        filterBrandsList.querySelectorAll('label').forEach(lbl => lbl.classList.remove('active'));
                        this.parentElement.classList.add('active');
                        currentFilters.brandName = this.value || null;
                        applyFiltersAndFetchProducts();
                    });
                });
            }

            // Load Colors (Giữ nguyên HTML tĩnh cho màu và gắn event)
            if (filterColorsList) {
                filterColorsList.querySelectorAll('input[name="filter_color"]').forEach(radio => {
                    radio.addEventListener('change', function() {
                        // Bỏ class active khỏi tất cả
                        filterColorsList.querySelectorAll('.color-option').forEach(div => div.classList.remove('active'));
                        // Thêm active vào thằng được chọn
                        this.closest('.color-option').classList.add('active');

                        currentFilters.color = this.value || null;
                        applyFiltersAndFetchProducts();
                    });
                });
            }

        } catch (error) {
            console.error("Error loading initial filters for shop-grid:", error);
        }
    }

    // --- Fetch and Display Products ---
    async function fetchAndDisplayProducts() {
        let queryParams = `page=${currentFilters.page}&size=${currentFilters.size}`;
        if (currentFilters.sort && currentFilters.sort !== 'default') queryParams += `&sort=${currentFilters.sort}`;
        console.log("Fetching products with URL params:", queryParams); // DEBUG
        if (currentFilters.categoryId) queryParams += `&categoryId=${currentFilters.categoryId}`;
        if (currentFilters.brandName) queryParams += `&brandName=${encodeURIComponent(currentFilters.brandName)}`;
        if (currentFilters.color) queryParams += `&color=${encodeURIComponent(currentFilters.color)}`;
        if (currentFilters.minPrice !== null) queryParams += `&minPrice=${currentFilters.minPrice}`;
        if (currentFilters.maxPrice !== null) queryParams += `&maxPrice=${currentFilters.maxPrice}`;
        if (currentFilters.productName) queryParams += `&name=${encodeURIComponent(currentFilters.productName)}`;

        if (productGridContainer) productGridContainer.innerHTML = '<p class="col-12 text-center p-5">Loading products...</p>';

        try {
            const productPage = await fetchData(`${API_BASE_URL}/api/products?${queryParams}`);
            const products = productPage.content || [];
            totalPages = productPage.totalPages || 0;
            const totalElements = productPage.totalElements || 0;

            if (productsFoundCountEl) productsFoundCountEl.textContent = totalElements;
            if (productGridContainer) {
                productGridContainer.innerHTML = '';
                if (products.length === 0) {
                    productGridContainer.innerHTML = '<p class="col-12 text-center p-5">No products found matching your criteria.</p>';
                } else {
                    products.forEach(product => {
                        let price = product.basePrice != null ? product.basePrice : 0;
                        const formattedPrice = formatPriceVND(price);
                        const defaultVariantId = (product.variants && product.variants.length > 0) ? product.variants[0].id : null;
                        const imageUrl = product.imageUrl || 'img/product/product-default.jpg';

                        productGridContainer.innerHTML += `
                            <div class="col-lg-4 col-md-6 col-sm-6">
                                <div class="product__item">
                                    <div class="product__item__pic set-bg" data-setbg="${imageUrl}">
                                        <ul class="product__item__pic__hover">
                                            <li><a href="#"><i class="fa fa-heart"></i></a></li>
                                            <li><a href="./shop-details.html?productId=${product.id}"><i class="fa fa-eye"></i></a></li>
                                            <li><a href="#" class="add-to-cart-btn" data-product-id="${product.id}" data-variant-id="${defaultVariantId}"><i class="fa fa-shopping-cart"></i></a></li>
                                        </ul>
                                    </div>
                                    <div class="product__item__text">
                                        <h6><a href="./shop-details.html?productId=${product.id}">${product.name}</a></h6>
                                        <h5>${formattedPrice}</h5>
                                    </div>
                                </div>
                            </div>`;
                    });
                }
            }
            if (typeof reinitializeSetBg === "function") reinitializeSetBg();
            renderPagination();
        } catch (error) {
            if (productGridContainer) productGridContainer.innerHTML = '<p class="col-12 text-center p-5">Error loading products. Please try again.</p>';
            console.error("Error fetching products for shop-grid:", error);
        }
    }

    // --- Render Pagination ---
    function renderPagination() {
        // ... (Code renderPagination của bạn, sử dụng fetchAndDisplayProducts khi click)
        if (!paginationContainer || totalPages <= 1) {
            if(paginationContainer) paginationContainer.innerHTML = '';
            return;
        }
        paginationContainer.innerHTML = '';
        // Previous
        if (currentFilters.page > 0) {
            paginationContainer.innerHTML += `<a href="#" data-page="${currentFilters.page - 1}"><i class="fa fa-long-arrow-left"></i></a>`;
        }
        // Page numbers
        for (let i = 0; i < totalPages; i++) {
            paginationContainer.innerHTML += `<a href="#" data-page="${i}" class="${i === currentFilters.page ? 'active' : ''}">${i + 1}</a>`;
        }
        // Next
        if (currentFilters.page < totalPages - 1) {
            paginationContainer.innerHTML += `<a href="#" data-page="${currentFilters.page + 1}"><i class="fa fa-long-arrow-right"></i></a>`;
        }
        // Add event listeners for pagination links
        paginationContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                currentFilters.page = parseInt(this.dataset.page);
                fetchAndDisplayProducts();
            });
        });
    }

    // --- Event Handlers for Filters ---
    function applyFiltersAndFetchProducts() {
        currentFilters.page = 0; // Reset về trang đầu khi filter thay đổi
        fetchAndDisplayProducts();
    }
    // Xử lý Sort By với NiceSelect và jQuery
    if (sortBySelectJQ.length) { // Kiểm tra xem element có tồn tại không bằng jQuery
        console.log("sortBySelect element found by jQuery:", sortBySelectJQ[0]);

        // Khởi tạo NiceSelect TRƯỚC khi gắn event listener 'change' qua jQuery
        // nếu bạn muốn lắng nghe event mà NiceSelect trigger trên select gốc.
        if ($.fn.niceSelect) {
            sortBySelectJQ.niceSelect();
            console.log("NiceSelect initialized for #sort-by-select.");
        }

        // NiceSelect thường trigger sự kiện 'change' trên element <select> gốc
        // khi người dùng chọn một option từ UI tùy chỉnh của nó.
        sortBySelectJQ.on('change', function(e) {
            const selectedValue = $(this).val(); // Lấy giá trị bằng jQuery từ <select> gốc
            console.log("Sort select CHANGED (jQuery listener). New value:", selectedValue);

            if (selectedValue === "default" || selectedValue === "") {
                currentFilters.sort = null; // Hoặc giá trị mặc định của backend nếu null không được xử lý tốt
            } else {
                currentFilters.sort = selectedValue;
            }
            console.log("currentFilters.sort set to:", currentFilters.sort);
            applyFiltersAndFetchProducts();
        });

    } else {
        console.error("Element with ID 'sort-by-select' NOT FOUND by jQuery!");
    }
    // if (sortBySelect) {
    //     console.log("Attaching change listener to sortBySelect"); //DEBUG
    //     sortBySelect.addEventListener('change', function(e) {
    //         console.log("Sort select CHANGED. New value:", e.target.value); // DEBUG
    //         if (e.target.value === "default" || e.target.value === "") {
    //             currentFilters.sort = null; // Hoặc giá trị mặc định nếu backend không tự xử lý null
    //             // Ví dụ: currentFilters.sort = "id,desc"; (nếu muốn quay về mặc định)
    //         } else {
    //             currentFilters.sort = e.target.value; // Ví dụ: "name,asc", "basePrice,desc"
    //         }
    //         console.log("currentFilters.sort set to:", currentFilters.sort); // DEBUG
    //         applyFiltersAndFetchProducts();
    //     });
    //
    // }

    if (filterPriceBtn) {
        filterPriceBtn.addEventListener('click', function() {
            // Lấy giá trị số trực tiếp từ slider thay vì cố parse input đã format
            const $slider = $(".price-range");
            if ($slider.data("ui-slider")) { // Kiểm tra slider đã được khởi tạo chưa
                currentFilters.minPrice = $slider.slider("values", 0);
                currentFilters.maxPrice = $slider.slider("values", 1);
            } else {
                // Fallback nếu slider chưa init (ít khả năng), thử parse input
                const minText = minAmountInput.value.replace(/[^\d]/g, '');
                const maxText = maxAmountInput.value.replace(/[^\d]/g, '');
                currentFilters.minPrice = minText ? parseInt(minText) : null;
                currentFilters.maxPrice = maxText ? parseInt(maxText) : null;
            }
            applyFiltersAndFetchProducts();
        });
    }

    // Trong js/shop-grid.js
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            console.log("Clear All Filters button clicked!"); // DEBUG

            // Reset state
            const currentQuery = new URLSearchParams(window.location.search).get('query');
            currentFilters = { // TẠO OBJECT MỚI cho currentFilters
                categoryId: null,
                brandName: null,
                color: null,
                minPrice: null, // Sẽ được reset ở dưới
                maxPrice: null, // Sẽ được reset ở dưới
                productName: currentQuery, // Giữ lại query search nếu có từ URL
                page: 0,
                size: 9, // Hoặc giá trị size mặc định của bạn
                sort: 'default' // Hoặc null nếu API hiểu null là không sort
            };
            console.log("currentFilters after reset (before price):", JSON.parse(JSON.stringify(currentFilters))); // DEBUG

            // Reset UI (HTML elements)
            // Category
            if (filterCategoriesList) {
                filterCategoriesList.querySelectorAll('a.filter-category').forEach(a => a.classList.remove('active'));
                const allCategoriesLink = filterCategoriesList.querySelector('a[data-category-id=""]');
                if (allCategoriesLink) allCategoriesLink.classList.add('active');
                else console.warn("Could not find 'All Categories' link to set active.");
            }

            // Brand
            if (filterBrandsList) {
                filterBrandsList.querySelectorAll('input[type="radio"]').forEach(r => { r.checked = (r.value === ""); });
                filterBrandsList.querySelectorAll('label').forEach(lbl => lbl.classList.remove('active'));
                const allBrandsRadio = filterBrandsList.querySelector('input[value=""]');
                if (allBrandsRadio && allBrandsRadio.parentElement.tagName === 'LABEL') {
                    allBrandsRadio.parentElement.classList.add('active');
                } else if (allBrandsRadio) {
                    // Nếu cấu trúc khác, tìm label cha gần nhất
                    $(allBrandsRadio).closest('label').addClass('active');
                }
            }

            // Color
            if (filterColorsList) {
                filterColorsList.querySelectorAll('input[name="filter_color_shop_grid_static"]').forEach(r => { // Sử dụng đúng name
                    r.checked = (r.value === "");
                });
                filterColorsList.querySelectorAll('.sidebar__item__color').forEach(div => div.classList.remove('active'));
                const allColorsRadio = filterColorsList.querySelector('#color-all-filter'); // Giả sử ID của radio "All Colors"
                if (allColorsRadio) {
                    allColorsRadio.closest('.sidebar__item__color').classList.add('active');
                }
            }

            // Sort
            if (sortBySelectJQ.length) { // sortBySelectJQ đã được khai báo ở scope ngoài
                sortBySelectJQ.val('default');
                if ($.fn.niceSelect) {
                    sortBySelectJQ.niceSelect('update');
                    console.log("NiceSelect updated for sort."); // DEBUG
                }
            } else if (sortBySelect) { // Fallback nếu sortBySelectJQ không có (ít khả năng)
                sortBySelect.value = 'default';
            }


            // Reset price slider và input fields
            const $priceRange = $(".price-range");
            if ($priceRange.length && $priceRange.data("ui-slider")) { // Kiểm tra slider tồn tại và đã init
                const minSliderVal = $priceRange.slider("option", "min");
                const maxSliderVal = $priceRange.slider("option", "max");
                $priceRange.slider("values", 0, minSliderVal);
                $priceRange.slider("values", 1, maxSliderVal);
                if (minAmountInput) minAmountInput.value = formatPriceVND(minSliderVal);
                if (maxAmountInput) maxAmountInput.value = formatPriceVND(maxSliderVal);
                console.log("Price slider UI reset to:", minSliderVal, "-", maxSliderVal); // DEBUG
            } else if ($priceRange.length) { // Slider element tồn tại nhưng chưa init (ít khả năng nếu initShopGridPage chạy đúng)
                const minData = $priceRange.data('min') || 0;
                const maxData = $priceRange.data('max') || 100000000;
                if (minAmountInput) minAmountInput.value = formatPriceVND(minData);
                if (maxAmountInput) maxAmountInput.value = formatPriceVND(maxData);
                console.log("Price slider UI (fallback) reset to data attributes:", minData, "-", maxData); // DEBUG
            }

            // Quan trọng: Reset cả currentFilters.minPrice và currentFilters.maxPrice về null
            // Đã được thực hiện khi tạo lại object currentFilters ở trên
            console.log("Final currentFilters before applying:", JSON.parse(JSON.stringify(currentFilters))); // DEBUG

            applyFiltersAndFetchProducts();
        });
    }

    // --- Price Range Slider Initialization (jQuery UI) ---
    function initializePriceSlider() {
        const $priceRange = $(".price-range");
        if ($priceRange.length && $.fn.slider) {
            var minVal = parseInt($priceRange.data('min')) || 0; // Đảm bảo là số
            var maxVal = parseInt($priceRange.data('max')) || 100000000; // Đảm bảo là số
            // Lấy giá trị hiện tại từ currentFilters nếu có, nếu không thì dùng min/max của slider
            var currentMin = currentFilters.minPrice !== null ? currentFilters.minPrice : minVal;
            var currentMax = currentFilters.maxPrice !== null ? currentFilters.maxPrice : maxVal;

            $priceRange.slider({
                range: true,
                min: minVal,
                max: maxVal,
                values: [currentMin, currentMax], // Giá trị khởi tạo là số
                slide: function (event, ui) {
                    // Chỉ cập nhật hiển thị khi kéo
                    if (minAmountInput) $("#minamount").val(formatPriceVND(ui.values[0]));
                    if (maxAmountInput) $("#maxamount").val(formatPriceVND(ui.values[1]));
                },
                stop: function(event, ui) { // Gọi API khi người dùng dừng kéo
                    currentFilters.minPrice = ui.values[0]; // Lưu giá trị số
                    currentFilters.maxPrice = ui.values[1]; // Lưu giá trị số
                    applyFiltersAndFetchProducts();
                }
            });
            // Hiển thị giá trị ban đầu đã được format
            if (minAmountInput) $("#minamount").val(formatPriceVND($priceRange.slider("values", 0)));
            if (maxAmountInput) $("#maxamount").val(formatPriceVND($priceRange.slider("values", 1)));
        }
    }

    // --- Add to Cart (Sự kiện delegate từ document nếu nút được tạo động) ---
    // Đảm bảo rằng sự kiện này được gắn một lần, có thể trong app.js hoặc ở đây nếu app.js không xử lý
    // Nếu app.js đã có $(document).on('click', '.add-to-cart-btn', ...) thì không cần đoạn này nữa.
    // Nếu không, thêm vào đây:
    // $(document).on('click', '.add-to-cart-btn', async function(event) {
    //     event.preventDefault();
    //     if (!isLoggedIn()) {
    //         alert('Please log in to add items to your cart.');
    //         sessionStorage.setItem('redirectAfterLogin', window.location.href);
    //         window.location.href = './login.html';
    //         return;
    //     }
    //     const productId = $(this).data('product-id');
    //     let variantId = $(this).data('variant-id');
    //     const userId = getUserId();
    //     const token = getAuthToken();

    //     if (!variantId && productId) {
    //         try {
    //             const productDetails = await fetchData(`${API_BASE_URL}/api/products/${productId}`);
    //             if (productDetails && productDetails.variants && productDetails.variants.length > 0) {
    //                 variantId = productDetails.variants[0].id;
    //             } else {
    //                 alert('This product has no selectable variants.'); return;
    //             }
    //         } catch (error) { alert('Could not get product details.'); return; }
    //     }
    //     if (!variantId) { alert('Please select a product variant.'); return; }

    //     try {
    //         await fetchData(`${API_BASE_URL}/api/cart/add`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    //             body: JSON.stringify({ userId: parseInt(userId), productVariantId: variantId, quantity: 1 })
    //         });
    //         alert('Product added to cart!');
    //         if (typeof updateCartCountHeader === "function") updateCartCountHeader();
    //     } catch (error) { alert(`Failed to add to cart: ${error.message}`); }
    // });


    // --- Initialization for shop-grid.html ---
    async function initShopGridPage() {
        // Các hàm cập nhật header đã được gọi bởi app.js khi DOMContentLoaded
        // nên không cần gọi lại updateHeaderAuthState() hay updateCartCountHeader() ở đây nữa.

        // Lấy các filter từ URL params nếu có
        const urlParams = new URLSearchParams(window.location.search);
        currentFilters.categoryId = urlParams.get('categoryId') || currentFilters.categoryId; // Giữ lại giá trị cũ nếu không có param mới
        currentFilters.productName = urlParams.get('query') || currentFilters.productName;   // << LẤY TỪ KHÓA TÌM KIẾM TỪ URL
        // Lấy sort từ URL nếu có (ví dụ khi quay lại trang)
        const sortFromUrl = urlParams.get('sort');
        if (sortFromUrl) {
            currentFilters.sort = sortFromUrl;
            const sortBySelectElement = document.getElementById('sort-by-select');
            if(sortBySelectElement) sortBySelectElement.value = sortFromUrl;
        }
        // Có thể thêm các param khác như brandName, color từ URL nếu cần

        await loadInitialFilters(); // Chờ load xong các lựa chọn filter
        initializePriceSlider();    // Khởi tạo price slider với giá trị đúng
        fetchAndDisplayProducts();  // Fetch sản phẩm dựa trên filter ban đầu (từ URL hoặc mặc định)

        // Kích hoạt Nice Select cho select box (thường main.js của template đã làm)
        if (window.jQuery && $.fn.niceSelect) {
            const sortBySelectEl = document.getElementById('sort-by-select');
            if (sortBySelectEl) $(sortBySelectEl).niceSelect('update');
        }
    }

    initShopGridPage();
});