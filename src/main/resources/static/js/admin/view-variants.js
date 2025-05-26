document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.AdminApp === 'undefined' || typeof window.AdminApp.fetchData !== 'function') {
        console.error("view-variants.js: AdminApp or essential functions are not available.");
        alert("Error: Admin core script not loaded.");
        return;
    }
    const { API_BASE_URL, fetchData, formatPrice, isLoggedIn } = window.AdminApp;

    const variantsPageTitleEl = document.getElementById('variants-page-title');
    const variantsTableTitleEl = document.getElementById('variants-table-title');
    const variantsTableBody = document.getElementById('variants-table-body');
    const variantsTableJQ = $('#variants-table'); // jQuery selector for DataTable
    const addVariantBtn = document.getElementById('add-variant-btn');



    let dataTableInstanceAPI;

    let currentProductId = null;
    let currentProductName = '';

    function getProductIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        currentProductId = urlParams.get('productId');
        currentProductName = urlParams.get('productName') || 'Product'; // Lấy tên sản phẩm từ URL
        return currentProductId;
    }

    async function loadVariants() {
        if (!isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }
        if (!currentProductId) {
            if(variantsTableBody) variantsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Product ID not found in URL.</td></tr>';
            if(variantsPageTitleEl) variantsPageTitleEl.textContent = "Error: No Product Selected";
            return;
        }

        if (variantsPageTitleEl) variantsPageTitleEl.textContent = `Product Variants for: ${decodeURIComponent(currentProductName)}`;
        if (variantsTableTitleEl) variantsTableTitleEl.textContent = `Variants of ${decodeURIComponent(currentProductName)}`;
        if (addVariantBtn) addVariantBtn.href = `form_variants.html?productId=${currentProductId}&productName=${encodeURIComponent(currentProductName)}`;


        if(variantsTableBody) variantsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading variants...</td></tr>';

        try {
            // API GET /api/variants/by-product/{productId} trả về List<ProductVariantResponse>
            const variants = await fetchData(`/api/variants/by-product/${currentProductId}`);

            if ($.fn.DataTable.isDataTable(variantsTableJQ)) {
                dataTableInstanceAPI = variantsTableJQ.DataTable();
                dataTableInstanceAPI.destroy();
                variantsTableJQ.find('thead').empty(); // Xóa để DataTable tự tạo lại đúng
                variantsTableJQ.find('tbody').empty();
            }
            // Đảm bảo thead
            let thead = variantsTableJQ.find('thead');
            if (thead.length === 0) {
                thead = $('<thead>').appendTo(variantsTableJQ);
            }
            thead.html(`
                <tr>
                    <th class="table-plus">ID</th>
                    <th>Color</th>
                    <th>Price</th>
                    <th>Stock Qty</th>
<!--                    <th>Image</th>-->
                    <th class="datatable-nosort">Action</th>
                </tr>
            `);
            // Đảm bảo tbody
            if (variantsTableJQ.find('tbody').length === 0) {
                variantsTableJQ.append('<tbody id="variants-table-body"></tbody>');
            }


            dataTableInstanceAPI = variantsTableJQ.DataTable({
                destroy: true, // Đảm bảo hủy instance cũ nếu có
                data: variants || [], // Nếu variants là null hoặc undefined, dùng mảng rỗng
                responsive: true,
                autoWidth: false,
                columns: [
                    { data: 'id', className: 'table-plus',  width: "10%"  },
                    { data: 'color', width: "30%" },
                    {
                        data: 'price',
                        width: "20%",
                        render: function (data, type, row) { return formatPrice(data); }
                    },
                    { data: 'stockQty', width: "15%" },
                    // {
                    //     data: 'imageUrl',
                    //     render: function (data, type, row) {
                    //         const imgUrl = data || '../img/product/product-default.jpg';
                    //         return `<img src="${imgUrl}" alt="${row.color || 'Variant'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 3px;">`;
                    //     }
                    // },
                    {
                        data: 'id', // variantId
                        orderable: false,
                        className: 'datatable-nosort text-center',
                        width: "25%",
                        render: function (data, type, row) {
                            return `
                                <div class="dropdown">
                                    <a class="btn btn-link font-24 p-0 line-height-1 no-arrow dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                                        <i class="dw dw-more"></i>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-right dropdown-menu-icon-list">
                                        <a class="dropdown-item edit-variant-btn" href="form_variants.html?productId=${currentProductId}&variantId=${data}&productName=${encodeURIComponent(currentProductName)}"><i class="dw dw-edit2"></i> Edit</a>
                                        <a class="dropdown-item delete-variant-btn" href="#" data-variant-id="${data}"><i class="dw dw-delete-3"></i> Delete</a>
                                    </div>
                                </div>`;
                        }
                    }
                ],
                // Nếu không có dữ liệu
                language: {
                    emptyTable: "No variants found for this product."
                }
            });

        } catch (error) {
            console.error("Failed to load variants:", error);
            if(variantsTableBody) variantsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading variants: ${error.message}</td></tr>`;
        }
    }

    // Xử lý nút xóa biến thể
    variantsTableJQ.on('click', '.delete-variant-btn', async function (e) {
        e.preventDefault();
        const variantId = $(this).data('variant-id');
        if (confirm(`Are you sure you want to delete variant with ID: ${variantId}?`)) {
            try {
                await fetchData(`/api/variants/${variantId}`, { method: 'DELETE' });
                // alert('Variant deleted successfully!');
                loadVariants(); // Load lại danh sách variants
            } catch (error) {
                alert(`Error deleting variant: ${error.message}`);
            }
        }
    });


    function initViewVariantsPage() {
        if (!isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }
        // TODO: Kiểm tra vai trò ADMIN

        if (!getProductIdFromUrl()) {
            alert("Product ID is missing. Cannot display variants.");
            // Có thể chuyển hướng về trang quản lý sản phẩm
            window.location.href = 'manage_products.html';
            return;
        }
        loadVariants();
    }

    initViewVariantsPage();
});