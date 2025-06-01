# 📦 Java Midterm Project - Quản Lý Cửa Hàng Bán Kính Thiên Văn

Dự án giữa kỳ môn Công nghệ Java. Ứng dụng Spring Boot để quản lý sản phẩm kính thiên văn, đơn hàng và người dùng.

---

## 🎮 Video Demo

👉 [Xem danh sách phát trên YouTube](https://www.youtube.com/playlist?list=PL_eUXoDAh6Z8uoaVtPvZDyor6OQZThC7N)

---

## ⚙️ Yêu cầu hệ thống

* Java 17
* Maven 3.8+
* MySQL Server 8.x

---

## 🛠 Cài đặt & Chạy ứng dụng

### 1. Clone repo

```bash
git clone https://github.com/Thinhskyduck/java-midterm-project.git
cd java-midterm-project
```

### 2. Import Cơ sở dữ liệu

* Mở MySQL Workbench (hoặc dùng dòng lệnh), tạo database:

```sql
CREATE DATABASE telescope_store;
```

* Import file `telescope_store.sql` (đã bao gồm dữ liệu mẫu):

```bash
mysql -u root -p telescope_store < telescope_store.sql
```

### 3. Cấu hình `application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/telescope_store
spring.datasource.username=root
spring.datasource.password=123456
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
server.port=8080
```

> ✅ Đảm bảo `ddl-auto=none` để không ghi đè dữ liệu.

### 4. Chạy ứng dụng

```bash
# Đã cài Maven:
mvn spring-boot:run

# Hoặc dùng Maven Wrapper:
./mvnw spring-boot:run
```

---

## 🌐 Truy cập API

* Trang chủ: [http://localhost:8080](http://localhost:8080)
* Swagger UI (nếu có): [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

---

## 📁 Cấu trúc thư mục

```text
java-midterm-project/
├── src/                 # Mã nguồn Spring Boot
├── pom.xml              # Cấu hình Maven
├── telescope_store.sql  # File SQL cơ sở dữ liệu
├── README.md
```

---

## 🧑‍💻 Tác giả

* Họ tên: **Thân Quốc Thịnh**

---

## 📌 Ghi chú

* Nếu không muốn dùng MySQL, có thể chuyển sang H2 (in-memory DB)
* Cài đặt Swagger sẽ giúc dễ test API nhanh hơn
