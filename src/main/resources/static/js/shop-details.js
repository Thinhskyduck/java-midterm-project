document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = ''; // Backend cùng origin

    // DOM Elements
    const productNameEl = document.getElementById('product-name');
    // const productRatingEl = document.getElementById('product-rating'); // Tạm thời bỏ qua rating
    const productPriceEl = document.getElementById('product-price');
    const productShortDescriptionEl = document.getElementById('product-short-description'); // Mô tả ngắn
    const productFullDescriptionEl = document.getElementById('product-full-description'); // Mô tả đầy đủ
    const productAvailabilityEl = document.getElementById('product-availability');
    const productCategoryEl = document.getElementById('product-category');
    const productBrandEl = document.getElementById('product-brand');
    const productInfoAdditionalEl = document.getElementById('product-info-additional');


    const productLargeImageEl = document.getElementById('product-large-image');
    const productThumbnailSliderEl = document.getElementById('product-thumbnail-slider');
    const variantColorOptionsContainer = document.getElementById('variant-color-options');
    const quantityInput = document.getElementById('quantity-input');
    const addToCartButton = document.getElementById('add-to-cart-button');
    const relatedProductsContainer = document.getElementById('related-products-container');

    let currentProduct = null; // Lưu trữ dữ liệu sản phẩm hiện tại
    let selectedVariant = null; // Lưu trữ variant đang được chọn

    // --- Helper Functions (nếu chưa có trong app.js hoặc bạn muốn file này độc lập) ---
    function getAuthToken() { return localStorage.getItem('accessToken'); }
    function getUserId() { return localStorage.getItem('userId'); }
    function isLoggedIn() { return !!getAuthToken(); }

    async function fetchData(url, options = {}) {
        try {
            const response = await fetch(url, options);

            // Kiểm tra response.ok trước
            if (!response.ok) {
                if ((response.status === 401 || response.status === 403) && options.headers && options.headers.Authorization) {
                    console.warn('Authentication error on protected route, logging out user.');
                    if (typeof logoutUser === "function") logoutUser();
                }
                // Cố gắng đọc lỗi JSON, nếu không được thì lấy statusText
                let errorResponseMessage = `HTTP error! Status: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json(); // Cố gắng parse lỗi JSON
                    errorResponseMessage = errorData.message || errorResponseMessage;
                } catch (e) {
                    // Không phải JSON error, giữ lại statusText hoặc response body nếu có
                    const textError = await response.text().catch(() => null);
                    if (textError && textError.length < 200) { // Giới hạn độ dài để tránh log HTML quá dài
                        errorResponseMessage = textError || errorResponseMessage;
                    }
                }
                throw new Error(errorResponseMessage);
            }

            // Xử lý các trường hợp không có content hoặc không phải JSON
            const contentType = response.headers.get("content-type");
            if (response.status === 204 || response.status === 201 && (!contentType || !contentType.includes("application/json"))) {
                // Nếu là 204 No Content, hoặc 201 Created mà không phải JSON (ví dụ /api/cart/add hiện tại)
                // thì không cần gọi response.json()
                console.log(`Response status ${response.status} with no JSON body from ${url}`);
                return { status: response.status, message: "Operation successful, no content returned." }; // Hoặc trả về null/object rỗng tùy logic
            }

            return await response.json(); // Chỉ gọi .json() nếu chắc chắn có JSON body

        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error.message);
            // Ném lại lỗi để hàm gọi bên ngoài có thể xử lý cụ thể hơn nếu cần
            // Hoặc bạn có thể xử lý lỗi chung ở đây (ví dụ: hiển thị thông báo lỗi chung)
            throw error;
        }
    }

    function reinitializeSetBg() {
        $('.set-bg').each(function () {
            var bg = $(this).data('setbg');
            if (bg) $(this).css('background-image', 'url(' + bg + ')');
        });
    }

    function reinitializeProductDetailsPicSlider() {
        if ($.fn.owlCarousel && $(productThumbnailSliderEl).length) {
            const $slider = $(productThumbnailSliderEl);
            if ($slider.hasClass('owl-loaded')) {
                $slider.trigger('destroy.owl.carousel').removeClass('owl-loaded');
            }
            $slider.owlCarousel({
                loop: false, // Hoặc true nếu muốn lặp
                margin: 20,
                items: 4, // Số thumbnail hiển thị
                dots: true, // Template có vẻ dùng dots cho slider này
                nav: false, // Template không có nav buttons cho slider này
                smartSpeed: 1200,
                autoHeight: false,
                autoplay: false, // Thường không autoplay thumbnail
                mouseDrag: true,
                touchDrag: true,
            });

            // Xử lý click vào thumbnail để đổi ảnh lớn
            $slider.find('img').on('click', function () {
                var imgBigUrl = $(this).data('imgbigurl');
                if (imgBigUrl && productLargeImageEl) {
                    $(productLargeImageEl).attr('src', imgBigUrl);
                }
            });
        }
    }
    // Hàm cập nhật số lượng trong giỏ hàng trên header (nếu bạn muốn nó ở đây hoặc app.js)
    async function updateCartCountHeader() { /* ... code từ app.js ... */ }


    // --- Load Product Details ---
    async function loadProductDetails(productId) {
        try {
            const product = await fetchData(`${API_BASE_URL}/api/products/${productId}`);
            currentProduct = product; // Lưu sản phẩm hiện tại

            if (!product) {
                displayProductNotFoundError();
                return;
            }

            // Hiển thị thông tin chung
            if (productNameEl) productNameEl.textContent = product.name;
            if (productShortDescriptionEl) {
                // Lấy một phần mô tả làm mô tả ngắn, hoặc API trả về mô tả ngắn riêng
                productShortDescriptionEl.textContent = product.description ? (product.description.substring(0, 150) + (product.description.length > 150 ? '...' : '')) : 'No description available.';
            }
            if (productFullDescriptionEl) productFullDescriptionEl.textContent = product.description || 'No detailed description available.';
            if (productCategoryEl) productCategoryEl.textContent = product.category ? product.category.name : 'N/A';
            if (productBrandEl) productBrandEl.textContent = product.brand ? product.brand.name : 'N/A';
            if (productInfoAdditionalEl) productInfoAdditionalEl.textContent = `More details about ${product.name}. Category: ${product.category ? product.category.name : 'N/A'}. Brand: ${product.brand ? product.brand.name : 'N/A'}.`;


            // Hiển thị hình ảnh
            if (productLargeImageEl) {
                productLargeImageEl.src = product.imageUrl || 'img/product/details/product-details-default.jpg'; // Ảnh chính
            }
            if (productThumbnailSliderEl) {
                productThumbnailSliderEl.innerHTML = ''; // Xóa thumbnail cũ
                // Thêm ảnh chính làm thumbnail đầu tiên (nếu muốn)
                // const mainThumbHtml = `<img data-imgbigurl="${product.imageUrl || 'img/product/details/product-details-default.jpg'}" src="${product.imageUrl || 'img/product/details/thumb-default.jpg'}" alt="Main Thumbnail">`;
                // productThumbnailSliderEl.insertAdjacentHTML('beforeend', mainThumbHtml);

                // Thêm ảnh của các variants (nếu có và khác ảnh chính)
                // Giả sử API ProductResponse trả về imageUrl là ảnh chính,
                // và mỗi variant trong product.variants cũng có imageUrl riêng
                let thumbnails = [product.imageUrl]; // Bắt đầu với ảnh chính
                if (product.variants && product.variants.length > 0) {
                    product.variants.forEach(variant => {
                        if (variant.imageUrl && !thumbnails.includes(variant.imageUrl)) { // Chỉ thêm nếu có và chưa tồn tại
                            thumbnails.push(variant.imageUrl);
                        }
                    });
                }
                // Nếu bạn muốn nhiều ảnh hơn cho sản phẩm (ví dụ product.galleryImages là mảng các URL)
                // thì thêm chúng vào mảng thumbnails ở đây

                thumbnails.forEach(thumbUrl => {
                    if (thumbUrl) { // Chỉ thêm nếu URL hợp lệ
                        // Template có vẻ dùng ảnh nhỏ hơn cho thumbnail, bạn cần chuẩn bị các ảnh đó
                        // Hoặc dùng cùng ảnh lớn cho cả data-imgbigurl và src
                        const thumbHtml = `<img data-imgbigurl="${thumbUrl}" src="${thumbUrl}" alt="Product Thumbnail">`;
                        productThumbnailSliderEl.insertAdjacentHTML('beforeend', thumbHtml);
                    }
                });
                reinitializeProductDetailsPicSlider();
            }

            // Xử lý và hiển thị Variants (ví dụ: màu sắc)
            if (product.variants && product.variants.length > 0) {
                displayVariantOptions(product.variants); // Gọi hàm mới
                // Tự động chọn variant đầu tiên và cập nhật UI
                if (product.variants[0]) {
                    selectVariant(product.variants[0]);
                }
            } else {
                // Không có variant, hiển thị thông tin từ sản phẩm chính
                if (productPriceEl) {
                    productPriceEl.textContent = `$${(product.basePrice || 0).toFixed(2)}`;
                    productPriceEl.textContent = formatPriceVND(product.basePrice || 0);
                }
                if (productAvailabilityEl) productAvailabilityEl.textContent = (product.baseStockQty && product.baseStockQty > 0) ? 'In Stock' : 'Out of Stock';
                selectedVariant = null; // Không có variant nào được chọn
                if (addToCartButton) addToCartButton.classList.add('disabled'); // Vô hiệu hóa nút nếu không có variant/stock
                const optionDiv = document.querySelector('.product__details__option');
                if(optionDiv) optionDiv.style.display = 'none'; // Ẩn phần chọn biến thể
            }

            // Load sản phẩm liên quan
            if (product.category && product.category.id) {
                loadRelatedProducts(product.category.id, product.id);
            }


        } catch (error) {
            displayProductNotFoundError();
            console.error('Error loading product details:', error);
        }
    }
    const variantOptionsContainer = document.getElementById('variant-options-container'); // Đã đổi tên

    function displayVariantOptions(variants) {
        // Đổi tên tiêu đề nếu cần (hoặc làm trong HTML)
        // const optionTitleEl = document.querySelector('.product__details__option__title span');
        // if (optionTitleEl) optionTitleEl.textContent = 'Biến thể:';


        if (!variantOptionsContainer || !variants || variants.length === 0) {
            const optionDiv = document.querySelector('.product__details__option');
            if(optionDiv) optionDiv.style.display = 'none';
            return;
        }
        const optionDiv = document.querySelector('.product__details__option');
        if(optionDiv) optionDiv.style.display = 'block';

        variantOptionsContainer.innerHTML = ''; // Xóa các option cũ

        variants.forEach((variant, index) => {
            // Giả sử mỗi variant có trường 'color' hoặc một trường khác như 'name' để hiển thị tên biến thể.
            // Và quan trọng nhất là 'imageUrl' cho thumbnail của biến thể.
            if (!variant.imageUrl) { // Bỏ qua nếu không có ảnh cho biến thể này
                console.warn(`Variant with ID ${variant.id} has no imageUrl. Skipping.`);
                return;
            }

            const variantIdSafe = `variant-opt-${variant.id}`;

            const label = document.createElement('label');
            label.classList.add('variant-option-label');
            label.setAttribute('for', variantIdSafe);
            label.title = variant.color || `Variant ${variant.id}`; // Tooltip (ví dụ: tên màu)

            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = 'product_variant_select';
            radioInput.id = variantIdSafe;
            radioInput.value = variant.id; // Lưu ID của variant

            const img = document.createElement('img');
            img.src = variant.imageUrl; // URL ảnh thumbnail của variant
            img.alt = variant.color || `Variant ${variant.id}`;

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('variant-option-name');
            nameSpan.textContent = variant.color; // Hoặc một trường tên khác của variant nếu có

            label.appendChild(radioInput); // Input vẫn cần để form hoạt động, nhưng sẽ ẩn bằng CSS
            label.appendChild(img);
            label.appendChild(nameSpan);

            variantOptionsContainer.appendChild(label);

            if (index === 0) { // Tự động chọn variant đầu tiên
                radioInput.checked = true;
                label.classList.add('active');
            }

            label.addEventListener('click', () => {
                variantOptionsContainer.querySelectorAll('.variant-option-label').forEach(lbl => lbl.classList.remove('active'));
                label.classList.add('active');
                // radioInput.checked = true; // Trình duyệt thường tự làm khi click label

                const selectedVariantData = currentProduct.variants.find(v => v.id === parseInt(radioInput.value));
                if (selectedVariantData) {
                    selectVariant(selectedVariantData);
                }
            });
        });
    }

    function selectVariant(variant) {
        selectedVariant = variant;
        if (productPriceEl) productPriceEl.textContent = formatPriceVND(variant.price || 0);
        if (productAvailabilityEl) productAvailabilityEl.textContent = (variant.stockQty > 0) ? `In Stock (${variant.stockQty} available)` : 'Out of Stock';

        // Cập nhật ảnh lớn chính của sản phẩm dựa trên variant được chọn
        // (Nếu ảnh lớn của sản phẩm cũng chính là ảnh của variant)
        if (variant.imageUrl && productLargeImageEl) {
            if (productLargeImageEl.src !== variant.imageUrl) { // Chỉ cập nhật nếu URL thực sự khác
                productLargeImageEl.src = variant.imageUrl;
            }
        }
        // Nếu bạn muốn ảnh lớn luôn là ảnh chính của product (product.imageUrl)
        // và chỉ thumbnail variant thay đổi, thì không cần cập nhật productLargeImageEl ở đây.
        // Hoặc, nếu sản phẩm có một tập hợp các ảnh gallery, và mỗi variant làm nổi bật một ảnh khác nhau.

        if (addToCartButton) {
            if (variant.stockQty > 0) {
                addToCartButton.classList.remove('disabled');
                addToCartButton.innerHTML = 'ADD TO CART';
                addToCartButton.disabled = false;
            } else {
                addToCartButton.classList.add('disabled');
                addToCartButton.innerHTML = 'OUT OF STOCK';
                addToCartButton.disabled = true;
            }
        }
        if (quantityInput) quantityInput.value = 1;
    }



    function displayProductNotFoundError() {
        const detailsSection = document.querySelector('.product-details .container');
        if (detailsSection) {
            detailsSection.innerHTML = '<div class="row"><div class="col-12 text-center"><h2>Product Not Found</h2><p>The product you are looking for does not exist or is unavailable.</p><a href="./index.html" class="primary-btn">Go to Homepage</a></div></div>';
        }
        const relatedSection = document.querySelector('.related-product');
        if (relatedSection) relatedSection.style.display = 'none';
    }

    // Load Related Products
    async function loadRelatedProducts(categoryId, currentProductId) {
        if (!relatedProductsContainer || !categoryId) return;
        try {
            // Lấy 4 sản phẩm cùng category, loại trừ sản phẩm hiện tại
            const productPage = await fetchData(`${API_BASE_URL}/api/products?categoryId=${categoryId}&size=5&sort=name,asc`);
            let related = (productPage.content || []).filter(p => p.id !== currentProductId);
            if (related.length > 4) related = related.slice(0, 4); // Giới hạn 4 sản phẩm

            relatedProductsContainer.innerHTML = ''; // Xóa placeholder
            if (related.length === 0) {
                relatedProductsContainer.innerHTML = '<div class="col-12"><p>No related products found.</p></div>';
                return;
            }

            related.forEach(product => {
                // const price = (product.variants && product.variants.length > 0 ? product.variants[0].price : product.basePrice || 0).toFixed(2);
                const price = formatPriceVND(product.variants && product.variants.length > 0 ? product.variants[0].price : product.basePrice || 0); // Code mới
                const defaultVariantId = (product.variants && product.variants.length > 0) ? product.variants[0].id : null;
                const productHtml = `
                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <div class="product__item">
                            <div class="product__item__pic set-bg" data-setbg="${product.imageUrl || 'img/product/product-default.jpg'}">
                                <ul class="product__item__pic__hover">
                                    <li><a href="#"><i class="fa fa-heart"></i></a></li>
                                    <li><a href="./shop-details.html?productId=${product.id}"><i class="fa fa-retweet"></i></a></li>
                                    <li><a href="#" class="add-to-cart-btn" data-product-id="${product.id}" data-variant-id="${defaultVariantId}"><i class="fa fa-shopping-cart"></i></a></li>
                                </ul>
                            </div>
                            <div class="product__item__text">
                                <h6><a href="./shop-details.html?productId=${product.id}">${product.name}</a></h6>
                                <h5>$${price}</h5>
                            </div>
                        </div>
                    </div>
                `;
                relatedProductsContainer.insertAdjacentHTML('beforeend', productHtml);
            });
            reinitializeSetBg();
        } catch (error) {
            relatedProductsContainer.innerHTML = '<p>Error loading related products.</p>';
        }
    }


    // --- Event Handlers ---
    // Xử lý nút tăng/giảm số lượng (pro-qty)
    // Code này thường có sẵn trong main.js của template Ogani
    // Nếu không, bạn có thể thêm vào đây:
    // $('.pro-qty').on('click', '.qtybtn', function () {
    //     var $button = $(this);
    //     var oldValue = $button.parent().find('input').val();
    //     var newVal;
    //     if ($button.hasClass('inc')) {
    //         newVal = parseFloat(oldValue) + 1;
    //     } else {
    //         // Don't allow decrementing below zero
    //         if (oldValue > 1) { // Hoặc > 0 nếu cho phép số lượng 0
    //             newVal = parseFloat(oldValue) - 1;
    //         } else {
    //             newVal = 1; // Hoặc 0
    //         }
    //     }
    //     $button.parent().find('input').val(newVal);
    // });
    // Thêm hàm này vào đầu file js/shop-details.js hoặc trong một file helper chung
    function formatPriceVND(price) {
        if (price === null || price === undefined || isNaN(price)) {
            return 'N/A'; // Hoặc một giá trị mặc định khác
        }
        // Sử dụng Intl.NumberFormat để định dạng tiền tệ
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    // Xử lý nút "ADD TO CART"
    if (addToCartButton) {
        addToCartButton.addEventListener('click', async function (event) {
            event.preventDefault();
            if ($(this).hasClass('disabled')) return; // Không làm gì nếu nút bị vô hiệu hóa

            if (!isLoggedIn()) {
                alert('Please log in to add items to your cart.');
                window.location.href = './login.html'; // Chuyển đến trang login
                return;
            }

            if (!selectedVariant) {
                alert('Please select a product variant (e.g., color).');
                return;
            }

            if (selectedVariant.stockQty <= 0) {
                alert('This variant is out of stock.');
                return;
            }

            const quantity = parseInt(quantityInput.value) || 1;
            if (quantity > selectedVariant.stockQty) {
                alert(`Cannot add ${quantity} items. Only ${selectedVariant.stockQty} available in stock.`);
                return;
            }


            const addToCartRequest = {
                userId: parseInt(getUserId()),
                productVariantId: selectedVariant ? selectedVariant.id : null,
                quantity: quantity
            };
            console.log("Add to cart request payload being sent:", addToCartRequest); // DEBUG PAYLOAD
            try {
                await fetchData(`${API_BASE_URL}/api/cart/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`
                    },
                    body: JSON.stringify(addToCartRequest)
                });
                alert(`${quantity} x ${currentProduct.name} (${selectedVariant.color}) added to cart!`);
                // Cập nhật số lượng giỏ hàng trên header (cần hàm này trong app.js hoặc ở đây)
                if (typeof updateCartCountHeader === "function") updateCartCountHeader();

            } catch (error) {
                alert(`Error adding to cart: ${error.message}`);
            }
        });
    }


    // --- Initialization ---
    function initShopDetailsPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('productId');

        if (productId) {
            loadProductDetails(productId);
        } else {
            displayProductNotFoundError();
            console.error('No productId found in URL.');
        }

        // Cập nhật header (auth state & cart count) - có thể gọi từ app.js nếu nó dùng chung
        if (typeof updateHeaderAuthState === "function") updateHeaderAuthState();
        if (typeof updateCartCountHeader === "function") updateCartCountHeader();
    }

    initShopDetailsPage();

});