// =================================================================================
// == KHAI BÁO HẰNG SỐ VÀ ĐỊNH NGHĨA HÀM Ở SCOPE TOÀN CỤC CỦA FILE APP.JS ==
// =================================================================================
const API_BASE_URL = ''; // Backend cùng origin

// --- DOM Elements (Khai báo ở scope file nếu nhiều hàm cần dùng) ---
// Các element này sẽ được lấy giá trị bên trong DOMContentLoaded,
// nhưng khai báo biến ở đây cho dễ tham chiếu nếu cần.
// Tuy nhiên, tốt nhất là lấy chúng bên trong các hàm sử dụng hoặc DOMContentLoaded
// để đảm bảo DOM đã sẵn sàng.
// Hiện tại, các hàm updateHeader và các hàm displayXXX đang tự getElementById.

// --- Configuration ---
const LATEST_PRODUCT_SECTIONS_CONFIG = [
    { titleId: 'latest-product-title-1', sliderId: 'latest-product-slider-1', brandName: "Celestron", defaultTitle: "Celestron Products" },
    { titleId: 'latest-product-title-2', sliderId: 'latest-product-slider-2', brandName: "Sky-Watcher", defaultTitle: "Sky-Watcher Products" },
    { titleId: 'latest-product-title-3', sliderId: 'latest-product-slider-3', brandName: "SVBONY", defaultTitle: "SVBONY Products" }
];

// --- Helper Functions (Định nghĩa ở scope toàn cục của file) ---
function getAuthToken() { return localStorage.getItem('accessToken'); }
function getUserId() { return localStorage.getItem('userId'); }
function getUsername() {
    const username = localStorage.getItem('username');
    // console.log("app.js: getUsername called, username from localStorage:", username);
    return username;
}
function isLoggedIn() {
    const token = !!getAuthToken(); // Chuyển thành boolean
    // console.log("app.js: isLoggedIn called, status:", token);
    return token;
}

function formatPriceVND(price) {
    if (price === null || price === undefined || isNaN(price)) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            let errorResponseMessage = `HTTP error! Status: ${response.status} ${response.statusText} on ${url}`;
            // Chỉ logout nếu request có gửi token và bị lỗi 401/403 khi gọi API cần xác thực
            if ((response.status === 401 || response.status === 403) && options.headers && options.headers.Authorization) {
                console.warn('Authentication error on protected route from fetchData. Token might be invalid/expired.');
                // Gọi hàm logout đã được expose qua window.globalApp (nếu nó đã được tạo)
                if (window.globalApp && typeof window.globalApp.logoutUser === "function") {
                    window.globalApp.logoutUser();
                } else if (typeof logoutUser === "function") { // Fallback gọi trực tiếp nếu globalApp chưa init
                    logoutUser();
                }
            }
            try {
                const errorData = await response.json();
                errorResponseMessage = errorData.message || errorResponseMessage;
            } catch (e) { /* Ignore if error body is not JSON */ }
            throw new Error(errorResponseMessage);
        }
        const contentType = response.headers.get("content-type");
        if (response.status === 204 || (response.status === 201 && (!contentType || !contentType.includes("application/json")))) {
            // console.log(`Response status ${response.status} with no JSON body from ${url}`);
            return { status: response.status, message: "Operation successful, no JSON content." };
        }
        return await response.json();
    } catch (error) {
        console.error(`Error in fetchData for ${url}:`, error.message);
        throw error;
    }
}

function logoutUser() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.reload(); // Reload để reset state và UI
}

function reinitializeSetBg() {
    if (window.jQuery) {
        $('.set-bg').each(function () {
            var bg = $(this).data('setbg');
            if (bg) { $(this).css('background-image', 'url(' + bg + ')'); }
        });
    } else { console.warn("jQuery not available for reinitializeSetBg"); }
}

function reinitializeOwlCarousel($element, options) {
    if (window.jQuery && $.fn.owlCarousel && $element && $element.length) {
        if ($element.hasClass('owl-loaded')) {
            $element.trigger('destroy.owl.carousel').removeClass('owl-loaded');
        }
        $element.owlCarousel(options);
        // Chỉ gọi reinitializeSetBg nếu slider đó là categoriesSliderContainer
        // Cần đảm bảo categoriesSliderContainer được định nghĩa ở scope này hoặc truyền vào
        const categoriesSliderContainerById = document.getElementById('categories-slider-container');
        if (categoriesSliderContainerById && $element.is($(categoriesSliderContainerById))) {
            setTimeout(reinitializeSetBg, 150);
        }
    } else { console.warn("jQuery or OwlCarousel not available or element not found for reinitializeOwlCarousel"); }
}

// --- UI Update Functions for Header ---
// Các hàm này sẽ được gọi từ DOMContentLoaded
function updateHeaderAuthState() {
    // console.log("app.js: updateHeaderAuthState called");
    const username = getUsername();
    const humbergerAuthSection = document.getElementById('humberger-auth-section');
    const headerAuthSection = document.getElementById('header-auth-section');
    let authHtml;

    if (isLoggedIn() && username) {
        // console.log("app.js: Rendering logged-in state for:", username);
        authHtml = `
            <div class="dropdown header_auth_dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="color: #1c1c1c; font-weight: 600;">
                    <i class="fa fa-user"></i> ${username}
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                    <a class="dropdown-item" href="./profile.html">My Profile</a>
                    <a class="dropdown-item" href="./my-orders.html">My Orders</a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item logout-trigger" href="#">Logout</a>
                </div>
            </div>`;
    } else {
        // console.log("app.js: Rendering logged-out state.");
        authHtml = '<a href="./login.html" style="color: #1c1c1c; font-weight: 600;"><i class="fa fa-user"></i> Login</a>';
    }

    if (humbergerAuthSection) humbergerAuthSection.innerHTML = authHtml;
    // else console.warn("'humberger-auth-section' not found.");
    if (headerAuthSection) headerAuthSection.innerHTML = authHtml;
    // else console.warn("'header-auth-section' not found.");

    if (window.jQuery) {
        $(document.body).off('click', '.logout-trigger').on('click', '.logout-trigger', function(event) {
            event.preventDefault();
            logoutUser();
        });
        $('.header_auth_dropdown .dropdown-toggle').dropdown();
    }
}

async function updateCartCountHeader() {
    const userId = getUserId();
    const humbergerCartCountEl = document.getElementById('humberger-cart-count');
    const headerCartCountEl = document.getElementById('header-cart-count');
    let cartItemCount = 0;

    if (isLoggedIn() && userId) {
        try {
            const cartItems = await fetchData(`${API_BASE_URL}/api/cart?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (cartItems && Array.isArray(cartItems)) {
                cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
            }
        } catch (error) { /* Lỗi đã được log trong fetchData */ }
    }
    if (humbergerCartCountEl) humbergerCartCountEl.textContent = cartItemCount;
    if (headerCartCountEl) headerCartCountEl.textContent = cartItemCount;
}

// --- Functions specific to index.html (if app.js is also for index.html) ---
// Các hàm displayXXX này sẽ sử dụng các hàm helper đã định nghĩa ở trên (ví dụ: fetchData)
async function displayHeroCategories() {
    const heroCategoriesList = document.getElementById('hero-categories-list');
    if (!heroCategoriesList) return;
    try {
        const categories = await fetchData(`${API_BASE_URL}/api/categories`);
        heroCategoriesList.innerHTML = '';
        categories.forEach(category => {
            heroCategoriesList.innerHTML += `<li><a href="./shop-grid.html?categoryId=${category.id}">${category.name}</a></li>`;
        });
    } catch (error) { heroCategoriesList.innerHTML = '<li>Failed to load categories.</li>'; }
}

async function displayCategoriesSlider() {
    const categoriesSliderContainer = document.getElementById('categories-slider-container');
    if (!categoriesSliderContainer) {
        console.warn('Categories slider container not found');
        return;
    }
    try {
        const categories = await fetchData(`${API_BASE_URL}/api/categories`);
        if (!categories || !Array.isArray(categories)) {
            throw new Error('Invalid categories data');
        }
        console.log('Categories data:', categories); // Debug dữ liệu API

        categoriesSliderContainer.innerHTML = '';
        categories.forEach(category => {
            const imageUrl = category.image_url || category.imageUrl || 'img/categories/cat-placeholder.jpg';
            categoriesSliderContainer.innerHTML += `
                <div class="col-lg-3">
                    <div class="categories__item set-bg" data-setbg="${imageUrl}" style="background-image: url(${imageUrl}); background-size: cover; background-position: center;">
                        <h5><a style="background-color: lightgoldenrodyellow" class="rounded rounded-2" href="./shop-grid.html?categoryId=${category.id}">${category.name}</a></h5>
                    </div>
                </div>`;
        });

        // Gọi reinitializeSetBg để đảm bảo ảnh nền được áp dụng
        if (typeof reinitializeSetBg === 'function') {
            reinitializeSetBg();
        } else {
            console.warn('reinitializeSetBg is not defined');
        }

        // Khởi tạo Owl Carousel
        if (window.jQuery && $.fn.owlCarousel) {
            reinitializeOwlCarousel($(categoriesSliderContainer), {
                loop: categories.length > 4,
                margin: 0,
                items: 4,
                dots: false,
                nav: true,
                navText: ["<span class='fa fa-angle-left'><span/>", "<span class='fa fa-angle-right'><span/>"],
                animateOut: 'fadeOut',
                animateIn: 'fadeIn',
                smartSpeed: 1200,
                autoHeight: false,
                autoplay: true,
                responsive: {
                    0: { items: 1 },
                    480: { items: 2 },
                    768: { items: 3 },
                    992: { items: 4 }
                }
            });
        } else {
            console.error('Owl Carousel or jQuery is not loaded');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        categoriesSliderContainer.innerHTML = '<p>Failed to load categories.</p>';
    }
}

async function displayFeaturedProducts(filterData = null) {
    const featuredProductsContainer = document.getElementById('featured-products-container');
    if (!featuredProductsContainer) return;
    try {
        let apiUrl = `${API_BASE_URL}/api/products?page=0&size=8&sort=name,asc`;
        if (filterData && filterData.categoryName && filterData.categoryName !== '*') {
            apiUrl += `&categoryName=${encodeURIComponent(filterData.categoryName)}`;
        }
        const productPage = await fetchData(apiUrl);
        const products = productPage.content || [];
        featuredProductsContainer.innerHTML = '';
        if (products.length === 0) {
            featuredProductsContainer.innerHTML = '<p class="col-12 text-center">No products found.</p>'; return;
        }
        products.forEach(product => {
            const categorySlug = product.category ? product.category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : 'general';
            let rawPrice = 0;
            if (product.variants && product.variants.length > 0 && product.variants[0].price != null) {
                rawPrice = product.variants[0].price;
            } else if (product.basePrice != null) { rawPrice = product.basePrice; }
            const formattedPrice = formatPriceVND(rawPrice);
            const defaultVariantId = (product.variants && product.variants.length > 0) ? product.variants[0].id : null;
            const productImageUrl = product.imageUrl || 'img/featured/feature-default.jpg';
            featuredProductsContainer.innerHTML += `
                <div class="col-lg-3 col-md-4 col-sm-6 mix ${categorySlug}">
                    <div class="featured__item">
                        <div class="featured__item__pic set-bg" data-setbg="${productImageUrl}">
                            <ul class="featured__item__pic__hover">
                                <li><a href="#"><i class="fa fa-heart"></i></a></li>
                                <li><a href="./shop-details.html?productId=${product.id}"><i class="fa fa-eye"></i></a></li>
                                <li><a href="#" class="add-to-cart-btn" data-product-id="${product.id}" data-variant-id="${defaultVariantId}"><i class="fa fa-shopping-cart"></i></a></li>
                            </ul>
                        </div>
                        <div class="featured__item__text">
                            <h6><a href="./shop-details.html?productId=${product.id}">${product.name}</a></h6>
                            <h5>${formattedPrice}</h5>
                        </div>
                    </div>
                </div>`;
        });
        if (typeof reinitializeSetBg === "function") reinitializeSetBg();
        const featuredControlsList = document.querySelector('.featured__controls ul'); // Lấy lại ở đây nếu cần
        if (window.jQuery && typeof mixitup === 'function' && featuredControlsList && featuredControlsList.children.length > 1) {
            const featuredProductsContainerEl = document.getElementById('featured-products-container'); // Lấy lại element nếu cần
            if (featuredProductsContainerEl) { // Chỉ khởi tạo nếu container tồn tại
                if (window.featuredMixer) { // Kiểm tra xem instance đã tồn tại chưa
                    window.featuredMixer.destroy(); // Hủy instance cũ
                    console.log("MixItUp instance destroyed before reinitialization."); // DEBUG
                }
                window.featuredMixer = mixitup(featuredProductsContainerEl); // Khởi tạo và lưu tham chiếu
                console.log("MixItUp instance (re)initialized."); // DEBUG
            }
        }
    } catch (error) { if(featuredProductsContainer) featuredProductsContainer.innerHTML = '<p>Failed to load products.</p>'; }
}

async function setupFeaturedProductFilters() {
    const featuredControlsList = document.querySelector('.featured__controls ul');
    if (!featuredControlsList) return;
    try {
        const categories = await fetchData(`${API_BASE_URL}/api/categories`);
        $(featuredControlsList).find('li:not([data-filter="*"])').remove();
        categories.forEach(category => {
            const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const filterItem = $('<li></li>')
                .attr('data-filter', `.${categorySlug}`)
                .text(category.name)
                .on('click', function() {
                    $(this).addClass('active').siblings().removeClass('active');
                    displayFeaturedProducts({ categoryName: category.name });
                });
            $(featuredControlsList).append(filterItem);
        });
        $(featuredControlsList).find('li[data-filter="*"]').on('click', function() {
            $(this).addClass('active').siblings().removeClass('active');
            displayFeaturedProducts({ categoryName: '*' });
        });
    } catch (error) { console.error("Error setting up product filters:", error); }
}

// --- Function to display Latest Products (by brand) ---
async function displayLatestProducts() {
    // Lấy các hàm cần thiết từ AppCore (hoặc globalApp)
    // Điều này đảm bảo chúng ta đang dùng các phiên bản đã được expose và hoạt động đúng
    const currentFetchData = (window.AppCore && typeof window.AppCore.fetchData === 'function') ? window.AppCore.fetchData : fetchData;
    const currentFormatPriceVND = (window.AppCore && typeof window.AppCore.formatPriceVND === 'function') ? window.AppCore.formatPriceVND : formatPriceVND;
    const currentReinitializeOwlCarousel = (window.AppCore && typeof window.AppCore.reinitializeOwlCarousel === 'function') ? window.AppCore.reinitializeOwlCarousel : reinitializeOwlCarousel;
    const currentApiBaseUrl = (window.AppCore && window.AppCore.API_BASE_URL !== undefined) ? window.AppCore.API_BASE_URL : API_BASE_URL;


    for (let i = 0; i < LATEST_PRODUCT_SECTIONS_CONFIG.length; i++) {
        const sectionConfig = LATEST_PRODUCT_SECTIONS_CONFIG[i];
        const brandName = sectionConfig.brandName;

        const titleElement = document.getElementById(sectionConfig.titleId);
        const sliderContainer = document.getElementById(sectionConfig.sliderId);

        if (titleElement) {
            titleElement.textContent = sectionConfig.defaultTitle; // Đặt tiêu đề mặc định
        }
        if (!sliderContainer) {
            console.warn(`Latest Product Slider container with ID '${sectionConfig.sliderId}' not found. Skipping brand: ${brandName}`);
            continue;
        }

        sliderContainer.innerHTML = '<div class="p-3 text-center"><small>Loading products...</small></div>'; // Thông báo đang tải

        try {
            // Gọi API để lấy sản phẩm theo brandName, giới hạn 6 sản phẩm, sắp xếp theo mới nhất
            const apiUrl = `${currentApiBaseUrl}/api/products?brandName=${encodeURIComponent(brandName)}&size=6&sort=createdAt,desc`;
            const productPage = await currentFetchData(apiUrl); // Sử dụng fetchData đã lấy từ AppCore
            const products = productPage.content || [];

            if (products.length === 0) {
                sliderContainer.innerHTML = `<div class="p-3 text-center"><small>No products found for ${brandName}.</small></div>`;
                if (titleElement) {
                    // titleElement.textContent = `No ${brandName} Products`; // Có thể cập nhật lại title
                }
                // Nếu không có sản phẩm, không cần khởi tạo Owl Carousel cho slider này
                // Nhưng nếu Owl Carousel đã được khởi tạo trước đó (ví dụ bởi main.js với item tĩnh),
                // bạn có thể cần $(sliderContainer).trigger('destroy.owl.carousel').removeClass('owl-loaded');
                if (window.jQuery && $(sliderContainer).hasClass('owl-loaded')) {
                    $(sliderContainer).trigger('destroy.owl.carousel').removeClass('owl-loaded');
                }
                continue; // Chuyển sang brand tiếp theo
            }

            // Cập nhật lại title với tên brand nếu có sản phẩm (để đảm bảo đúng tên từ config)
            if (titleElement && products.length > 0) { // Chỉ cập nhật nếu có sản phẩm
                titleElement.textContent = sectionConfig.defaultTitle;
            }

            let sliderItemGroupHtml = '';
            // Template này nhóm 3 sản phẩm vào một "latest-prdouct__slider__item"
            for (let j = 0; j < products.length; j += 3) {
                sliderItemGroupHtml += '<div class="latest-prdouct__slider__item">';
                for (let k = j; k < Math.min(j + 3, products.length); k++) {
                    const product = products[k];
                    let rawPrice = 0;
                    if (product.variants && product.variants.length > 0 && product.variants[0].price != null) {
                        rawPrice = product.variants[0].price;
                    } else if (product.basePrice != null) {
                        rawPrice = product.basePrice;
                    }
                    const formattedPrice = currentFormatPriceVND(rawPrice); // Sử dụng formatPriceVND đã lấy
                    const productImageUrl = product.imageUrl || 'img/latest-product/lp-default.jpg'; // Placeholder
                    const defaultVariantId = (product.variants && product.variants.length > 0) ? product.variants[0].id : null;

                    sliderItemGroupHtml += `
                        <a href="./shop-details.html?productId=${product.id}" class="latest-product__item">
                            <div class="latest-product__item__pic">
                                <img src="${productImageUrl}" alt="${product.name}">
                            </div>
                            <div class="latest-product__item__text">
                                <h6>${product.name}</h6>
                                <span>${formattedPrice}</span>
                            </div>
                        </a>
                    `;
                }
                sliderItemGroupHtml += '</div>'; // Đóng latest-prdouct__slider__item
            }
            sliderContainer.innerHTML = sliderItemGroupHtml;

            // Khởi tạo lại Owl Carousel cho slider này
            if (window.jQuery && $.fn.owlCarousel) {
                currentReinitializeOwlCarousel($(sliderContainer), { // Sử dụng reinitializeOwlCarousel đã lấy
                    loop: products.length > 3, // Chỉ loop nếu có nhiều hơn 1 slide (tổng > 3 sản phẩm)
                    margin: 0,
                    items: 1, // Vì mỗi "item" của Owl Carousel này chứa 1 div "latest-prdouct__slider__item" (bên trong có 3 sp con)
                    dots: false,
                    nav: true,
                    navText: ["<span class='fa fa-angle-left'><span/>", "<span class='fa fa-angle-right'><span/>"],
                    smartSpeed: 1200,
                    autoHeight: false,
                    autoplay: true
                });
            }

        } catch (error) {
            console.error(`Error fetching latest products for brand ${brandName}:`, error.message);
            sliderContainer.innerHTML = `<div class="p-3 text-center"><small>Error loading products for ${brandName}.</small></div>`;
        }
    }
    // Không cần gọi reinitializeSetBg ở đây vì Latest Products section dùng thẻ <img> trực tiếp
}


// =================================================================================
// == EXPOSE CÁC HÀM RA GLOBAL QUA window.globalApp (HOẶC window.AppCore) ==
// =================================================================================
// Đặt ở cuối file app.js, SAU KHI tất cả các hàm đã được định nghĩa ở trên.
window.globalApp = {
    API_BASE_URL: API_BASE_URL, // API_BASE_URL_APP_INTERNAL đã được đổi tên thành API_BASE_URL
    fetchData: fetchData,
    formatPriceVND: formatPriceVND,
    isLoggedIn: isLoggedIn,
    getUserId: getUserId,
    getAuthToken: getAuthToken,
    getUsername: getUsername,
    logoutUser: logoutUser,
    reinitializeSetBg: reinitializeSetBg,
    reinitializeOwlCarousel: reinitializeOwlCarousel, // Expose nếu cần
    // Các hàm updateHeader... sẽ được gọi từ DOMContentLoaded của app.js
    // Nếu các file JS khác cần trigger chúng, thì mới expose:
    // updateHeaderAuthState: updateHeaderAuthState,
    // updateCartCountHeader: updateCartCountHeader
};
console.log("app.js: window.globalApp has been defined with functions.");
console.log("app.js: window.AppCore (or globalApp) has been defined with functions including reinitializeSetBg.");

// =================================================================================
// == DOMContentLoaded Listener CHO APP.JS ==
// =================================================================================
document.addEventListener('DOMContentLoaded', function () {
    console.log("app.js: DOMContentLoaded event fired. globalApp should be available.");

    // Gọi các hàm khởi tạo chung cho header
    updateHeaderAuthState();
    updateCartCountHeader();

    // Khởi tạo các plugin chung của template Ogani
    if (window.jQuery) {
        $(window).on('load', function () {
            $(".loader").fadeOut();
            $("#preloder").delay(200).fadeOut("slow");
        });
        if ($.fn.slicknav) {
            $(".humberger__menu__nav.mobile-menu ul").slicknav({
                prependTo: '#mobile-menu-wrap',
                allowParentLinks: true
            });
        }
        $(".humberger__open").on('click', function () { /* ... */ });
        $(".humberger__menu__overlay").on('click', function () { /* ... */ });
        if ($.fn.niceSelect) {
            $('select').niceSelect();
        }
        $('.hero__categories__all').on('click', function () {
            $('.hero__categories ul').slideToggle(400);
        });
        reinitializeSetBg(); // Gọi lại sau khi các plugin có thể đã render
    } else {
        console.error("jQuery is not loaded. Some template functionalities might not work.");
    }

    // --- Xử lý Search Form trên Hero Section (chỉ chạy nếu có form này) ---
    const heroSearchForm = document.getElementById('hero-search-form');
    const heroSearchInput = document.getElementById('hero-search-input');

    if (heroSearchForm && heroSearchInput) {
        heroSearchForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Ngăn form submit theo cách truyền thống

            const searchQuery = heroSearchInput.value.trim();

            if (searchQuery) {
                // Chuyển hướng đến trang shop-grid.html với query parameter
                window.location.href = `./shop-grid.html?query=${encodeURIComponent(searchQuery)}`;
            } else {
                // Chuyển đến trang shop-grid.html không có query
                window.location.href = './shop-grid.html';
            }
        });
    }

    // Logic riêng cho trang index.html (nếu file này là JS chính của index.html)
    // Kiểm tra sự tồn tại của các element đặc trưng cho index.html
    const heroCategoriesList = document.getElementById('hero-categories-list');
    const categoriesSliderContainer = document.getElementById('categories-slider-container');
    const featuredProductsContainer = document.getElementById('featured-products-container');

    if (heroCategoriesList || categoriesSliderContainer || featuredProductsContainer) {
        console.log("app.js: Initializing index.html specific content...");
        if (typeof displayHeroCategories === "function") displayHeroCategories();
        if (typeof displayCategoriesSlider === "function") displayCategoriesSlider();
        if (typeof setupFeaturedProductFilters === "function" && typeof displayFeaturedProducts === "function") {
            setupFeaturedProductFilters().then(() => displayFeaturedProducts(null));
        }
        if (typeof displayLatestProducts === "function") displayLatestProducts();
    }

    // --- Event Listener chung cho "Add to Cart" (nếu class này dùng trên nhiều trang) ---
    if (window.jQuery) {
        $(document).on('click', '.add-to-cart-btn', async function (event) {
            event.preventDefault();
            if (!isLoggedIn()) { // Dùng hàm đã expose
                alert('Please log in to add items to your cart.');
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = './login.html';
                return;
            }
            const productId = $(this).data('product-id');
            let variantId = $(this).data('variant-id');
            const userId = getUserId(); // Dùng hàm đã expose
            const token = getAuthToken(); // Dùng hàm đã expose

            if (!variantId && productId) {
                try {
                    const productDetails = await fetchData(`${API_BASE_URL}/api/products/${productId}`); // Dùng fetchData đã expose
                    if (productDetails && productDetails.variants && productDetails.variants.length > 0) {
                        variantId = productDetails.variants[0].id;
                    } else {
                        alert('This product has no selectable variants.');
                        return;
                    }
                } catch (error) {
                    alert('Could not get product details to add to cart.');
                    return;
                }
            }
            if (!variantId) {
                alert('Please select/find a product variant.');
                return;
            }

            try {
                await fetchData(`${API_BASE_URL}/api/cart/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ userId: parseInt(userId), productVariantId: variantId, quantity: 1 })
                });
                alert('Product added to cart!');
                await updateCartCountHeader(); // Gọi hàm đã expose để cập nhật
            } catch (error) {
                alert(`Failed to add to cart: ${error.message}`);
            }
        });
    }
});