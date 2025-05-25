document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.AdminApp === 'undefined' || typeof window.AdminApp.fetchData !== 'function') {
        console.error("AdminApp or essential functions are not available. Ensure admin-common.js is loaded first.");
        alert("Error: Admin core script not loaded.");
        return;
    }

    const { API_BASE_URL, fetchData, formatPrice, isLoggedIn } = window.AdminApp; // Sử dụng hàm từ admin-common.js

    const productsTable = $('#products-table'); // Sử dụng jQuery selector cho DataTables
    let dataTableInstance;

    async function loadProducts() {
        if (!isLoggedIn()) { // Kiểm tra đăng nhập của admin
            window.location.href = '../login.html'; // Chuyển về trang login (của user hoặc admin riêng)
            return;
        }

        try {
            // API này cần hỗ trợ phân trang phía server nếu dùng DataTables server-side processing
            // Hiện tại, chúng ta sẽ load tất cả và để DataTables xử lý client-side
            // Hoặc bạn có thể dùng API phân trang như trang shop-grid
            const productPage = await fetchData('/api/products?page=0&size=100&sort=id,desc'); // Lấy 100 sản phẩm mới nhất
            const products = productPage.content || [];

            if ($.fn.DataTable.isDataTable(productsTable)) {
                dataTableInstance.clear().destroy();
            }

            dataTableInstance = productsTable.DataTable({
                data: products,
                responsive: true,
                columns: [
                    { data: 'id', className: 'table-plus' },
                    { data: 'name' },
                    {
                        data: 'basePrice',
                        render: function (data, type, row) {
                            // Giá có thể từ basePrice hoặc variant đầu tiên nếu basePrice null
                            let priceToFormat = data;
                            if (priceToFormat === null && row.variants && row.variants.length > 0 && row.variants[0].price !== null) {
                                priceToFormat = row.variants[0].price;
                            }
                            return formatPrice(priceToFormat);
                        }
                    },
                    { data: 'category.name', defaultContent: "N/A" }, // category là object {id, name}
                    { data: 'brand.name', defaultContent: "N/A" },   // brand là object {id, name}
                    {
                        data: 'imageUrl',
                        render: function (data, type, row) {
                            const imgUrl = data || '../img/product/product-default.jpg'; // Placeholder nếu không có ảnh
                            return `<img src="${imgUrl}" alt="${row.name || 'Product'}" style="width: 60px; height: 60px; object-fit: cover;">`;
                        }
                    },
                    {
                        data: 'id', // Dùng ID cho các action
                        orderable: false,
                        className: 'datatable-nosort',
                        render: function (data, type, row) {
                            return `
                                <div class="dropdown">
                                    <a class="btn btn-link font-24 p-0 line-height-1 no-arrow dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                                        <i class="dw dw-more"></i>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-right dropdown-menu-icon-list">
                                        <a class="dropdown-item edit-product-btn" href="form_product.html?id=${data}"><i class="dw dw-edit2"></i> Edit</a>
                                        <a class="dropdown-item view-variants-btn" href="view_variants.html?productId=${data}&productName=${encodeURIComponent(row.name)}"><i class="dw dw-list3"></i> View Variants</a>
                                        <a class="dropdown-item delete-product-btn" href="#" data-id="${data}"><i class="dw dw-delete-3"></i> Delete</a>
                                    </div>
                                </div>`;
                        }
                    }
                ],
                // Các tùy chọn khác của DataTables nếu cần
                // "scrollCollapse": true,
                // "autoWidth": false,
                // "responsive": true,
            });

        } catch (error) {
            console.error("Failed to load products for admin:", error);
            productsTable.find('tbody').html('<tr><td colspan="7" class="text-center">Error loading products.</td></tr>');
        }
    }

    // Xử lý nút xóa sản phẩm
    productsTable.on('click', '.delete-product-btn', async function () {
        const productId = $(this).data('id');
        if (confirm(`Are you sure you want to delete product with ID: ${productId}? This action cannot be undone.`)) {
            try {
                await fetchData(`/api/products/${productId}`, { method: 'DELETE' });
                // alert('Product deleted successfully!'); // Hoặc dùng notification đẹp hơn
                // Reload DataTables
                loadProducts();
            } catch (error) {
                alert(`Error deleting product: ${error.message}`);
            }
        }
    });


    // --- Initialization ---
    function initManageProductsPage() {
        // Kiểm tra đăng nhập admin và vai trò (sẽ cần API /users/me để lấy role)
        // Tạm thời, chỉ kiểm tra đăng nhập chung
        if (!isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }
        // TODO: Gọi API /api/users/me để kiểm tra role === 'ADMIN'
        // Nếu không phải admin, chuyển hướng về trang user hoặc báo lỗi

        loadProducts();
    }

    initManageProductsPage();
});