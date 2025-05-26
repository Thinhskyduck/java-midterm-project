// src/main/resources/static/js/admin/manage-products.js
document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.AdminApp === 'undefined' || typeof window.AdminApp.fetchData !== 'function') {
        console.error("AdminApp or essential functions are not available. Ensure admin-common.js is loaded first.");
        // alert("Error: Admin core script not loaded."); // Có thể bỏ alert nếu console log đủ
        const productTableBodyError = document.getElementById('products-table-body');
        if(productTableBodyError) productTableBodyError.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Critical Error: Core admin scripts not loaded.</td></tr>';
        return;
    }

    const { API_BASE_URL, fetchData, formatPrice, isLoggedIn } = window.AdminApp;
    const productsTableJQ = $('#products-table');
    let dataTableInstanceAPI; // Biến để lưu trữ instance của DataTable

    async function loadProducts() {
        if (!isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }
        if (!productsTableJQ.length) {
            console.error("Products table element #products-table not found!");
            return;
        }
        if (!productsTableJQ.length) {
            console.error("Products table element #products-table not found!");
            return;
        }

        // Hiển thị loading message trong tbody (nếu tbody tồn tại)
        let tbody = productsTableJQ.find('tbody');
        if (!tbody.length) {
            productsTableJQ.append('<tbody></tbody>'); // Tạo tbody nếu chưa có
            tbody = productsTableJQ.find('tbody');
        }
        tbody.html('<tr><td colspan="7" class="text-center">Loading products...</td></tr>');

        // Không cần hiển thị loading message thủ công vào tbody nữa nếu dùng DataTables,
        // DataTables có tùy chọn "language.loadingRecords" hoặc "language.processing"

        try {
            const productPage = await fetchData('/api/products?page=0&size=100&sort=id,desc');
            const products = productPage.content || [];

            // Hủy DataTable cũ nếu tồn tại
            if ($.fn.DataTable.isDataTable(productsTableJQ)) {
                console.log("DataTable is initialized. Destroying old instance.");
                productsTableJQ.DataTable().destroy();
                // Quan trọng: Sau khi destroy, DataTables có thể đã xóa thead và tbody nó tự tạo.
                // Chúng ta cần đảm bảo cấu trúc bảng gốc còn đó hoặc được tạo lại.
                productsTableJQ.find('tbody').empty(); // Xóa nội dung tbody cũ
                productsTableJQ.find('thead').empty(); // Xóa nội dung thead cũ (nếu có)
            }

            // --- ĐẢM BẢO THEAD TỒN TẠI VÀ ĐÚNG CẤU TRÚC ---
            let thead = productsTableJQ.find('thead');
            if (thead.length === 0) {
                console.log("Re-creating thead for DataTable");
                thead = $('<thead>').appendTo(productsTableJQ);
            }
            // Tạo lại các th nếu thead trống hoặc để đảm bảo đúng số lượng
            thead.html(`
            <tr>
                <th class="table-plus">ID</th>
                <th>Name</th>
                <th>Base Price</th>
                <th>Category</th>
                <th>Brand</th>
<!--                <th>Image</th>-->
                <th class="datatable-nosort">Action</th>
            </tr>
        `);
            // --- KẾT THÚC ĐẢM BẢO THEAD ---

            // Đảm bảo tbody tồn tại
            if (productsTableJQ.find('tbody').length === 0) {
                productsTableJQ.append('<tbody></tbody>');
            }


            console.log("Initializing DataTable instance with products:", products.length);
            dataTableInstanceAPI = productsTableJQ.DataTable({
                // destroy: true, // Có thể không cần nữa nếu chúng ta tự destroy và quản lý thead
                data: products,
                responsive: true,
                autoWidth: false,
                columns: [
                    { data: 'id', className: 'table-plus' ,width: "5%" },
                    { data: 'name', width: "30%" },
                    {
                        data: 'basePrice',
                        width: "15%",
                        render: function (data, type, row) {
                            let priceToFormat = data;
                            if (priceToFormat === null && row.variants && row.variants.length > 0 && row.variants[0].price !== null) {
                                priceToFormat = row.variants[0].price;
                            }
                            return window.AdminApp.formatPrice(priceToFormat);
                        }
                    },
                    { data: 'category.name', defaultContent: "N/A" ,width: "15%" },
                    { data: 'brand.name', defaultContent: "N/A", width: "15%"  },
                    // {
                    //     data: 'imageUrl',
                    //     render: function (data, type, row) {
                    //         const imgUrl = data || '../img/product/product-default.jpg';
                    //         return `<img src="${imgUrl}" alt="${row.name || 'Product'}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 3px;">`;
                    //     }
                    // },
                    {
                        data: 'id',
                        orderable: false,
                        className: 'datatable-nosort text-center',
                        render: function (data, type, row) {
                            return `
                            <div class="dropdown">
                                <a class="btn btn-link font-24 p-0 line-height-1 no-arrow dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="dw dw-more"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right dropdown-menu-icon-list">
                                    <a class="dropdown-item edit-product-btn" href="form_product.html?id=${data}"><i class="dw dw-edit2"></i> Edit</a>
                                    <a class="dropdown-item view-variants-btn" href="view_variants.html?productId=${data}&productName=${encodeURIComponent(row.name)}"><i class="dw dw-list3"></i> Variants</a>
                                    <a class="dropdown-item delete-product-btn" href="#" data-id="${data}"><i class="dw dw-delete-3"></i> Delete</a>
                                </div>
                            </div>`;
                        }
                    }
                ],
                // Các options khác
            });
            console.log("DataTable initialized.");

        } catch (error) {
            console.error("Failed to load products for admin (outer catch):", error.message);
            const tableBodyError = productsTableJQ.find('tbody');
            if (tableBodyError.length) {
                tableBodyError.html('<tr><td colspan="7" class="text-center text-danger">Error loading products.</td></tr>');
            }
        }
    }

    // Xử lý nút xóa sản phẩm (vẫn dùng jQuery event delegation)
    productsTableJQ.on('click', '.delete-product-btn', async function (e) {
        e.preventDefault();
        const productId = $(this).data('id');
        if (confirm(`Are you sure you want to delete product with ID: ${productId}?`)) {
            try {
                await fetchData(`/api/products/${productId}`, { method: 'DELETE' });
                // alert('Product deleted successfully!');
                loadProducts(); // Load lại bảng (DataTables sẽ được khởi tạo lại)
            } catch (error) {
                alert(`Error deleting product: ${error.message}`);
            }
        }
    });

    // --- Initialization ---
    async function initManageProductsPage() {
        if (!isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }

        loadProducts();
    }

    initManageProductsPage();
});