-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: java-midterm
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (1,'Celestron'),(3,'Meade'),(5,'Orion'),(2,'Sky-Watcher'),(4,'SVBONY');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `variant_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_cart_variant` (`cart_id`,`variant_id`),
  KEY `idx_cart_items_cart_id` (`cart_id`),
  KEY `idx_cart_items_variant_id` (`variant_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`),
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (12,5,78,2,'2025-05-24 20:06:01'),(13,5,2,1,'2025-05-25 00:18:07'),(14,6,69,1,'2025-05-25 00:23:45'),(16,7,76,1,'2025-05-25 00:38:40'),(17,7,31,1,'2025-05-25 00:41:45'),(18,8,57,1,'2025-05-25 00:57:57'),(19,9,76,1,'2025-05-25 01:03:37'),(20,10,76,2,'2025-05-25 02:25:13'),(21,11,19,1,'2025-05-26 03:19:25'),(22,11,3,1,'2025-05-26 03:45:00'),(23,11,50,1,'2025-05-26 03:47:08'),(25,12,92,1,'2025-05-27 03:13:06'),(28,13,91,1,'2025-05-27 03:33:41'),(29,13,86,2,'2025-05-27 03:33:51'),(30,13,76,3,'2025-05-27 03:33:56'),(33,16,91,1,'2025-05-27 23:26:49'),(34,16,8,1,'2025-05-27 23:26:55'),(35,17,82,1,'2025-05-27 23:28:16'),(36,15,1,1,'2025-05-28 00:34:04'),(37,19,2,2,'2025-05-28 00:52:08'),(38,19,69,2,'2025-05-28 00:52:15'),(39,19,91,1,'2025-05-28 00:52:22');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  KEY `idx_carts_user_id` (`user_id`),
  KEY `idx_carts_status` (`status`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (5,4,'2025-05-24 19:05:36','2025-05-25 00:22:34','CHECKED_OUT'),(6,4,'2025-05-25 00:23:19','2025-05-25 00:31:50','CHECKED_OUT'),(7,4,'2025-05-25 00:33:12','2025-05-25 00:48:35','CHECKED_OUT'),(8,4,'2025-05-25 00:57:43','2025-05-25 00:58:10','CHECKED_OUT'),(9,4,'2025-05-25 00:59:24','2025-05-25 01:03:53','CHECKED_OUT'),(10,4,'2025-05-25 01:03:54','2025-05-25 19:19:54','CHECKED_OUT'),(11,4,'2025-05-25 19:19:55','2025-05-26 03:47:38','CHECKED_OUT'),(12,5,'2025-05-26 00:51:58','2025-05-26 00:51:58','ACTIVE'),(13,4,'2025-05-26 03:47:39','2025-05-27 03:34:46','CHECKED_OUT'),(14,4,'2025-05-27 03:34:47','2025-05-27 03:34:47','ACTIVE'),(15,2,'2025-05-27 19:30:49','2025-05-28 00:34:30','CHECKED_OUT'),(16,6,'2025-05-27 23:25:39','2025-05-27 23:27:32','CHECKED_OUT'),(17,6,'2025-05-27 23:27:33','2025-05-27 23:28:26','CHECKED_OUT'),(18,6,'2025-05-27 23:28:27','2025-05-27 23:28:27','ACTIVE'),(19,2,'2025-05-28 00:34:32','2025-05-28 00:52:38','CHECKED_OUT'),(20,2,'2025-05-28 00:52:39','2025-05-28 00:52:39','ACTIVE');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Kính thiên văn khúc xạ','Loại kính sử dụng thấu kính để hội tụ ánh sáng, cho hình ảnh sắc nét, phù hợp quan sát hành tinh và Mặt Trăng.','img/categories/khucxa.jpg'),(2,'Kính thiên văn phản xạ','Loại kính sử dụng gương để hội tụ ánh sáng, thường có khẩu độ lớn, phù hợp quan sát các vật thể sâu trong không gian như tinh vân, thiên hà.','img/categories/phanxa.jpg'),(3,'Kính thiên văn tổ hợp','Kết hợp ưu điểm của cả kính khúc xạ và phản xạ, thiết kế gọn nhẹ, hiệu năng tốt.','img/categories/tohop.jpg'),(4,'Ống nhòm','Thiết bị quang học hai mắt, tiện lợi cho quan sát tổng thể bầu trời hoặc các mục tiêu trên mặt đất.','img/categories/ongnhom.jpg'),(5,'Linh kiện','Các phụ kiện, bộ phận thay thế và nâng cấp cho kính thiên văn.','img/categories/linhkien.jpg');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `variant_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  KEY `idx_order_items_variant_id` (`variant_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (7,5,2,1,4500000.00),(8,5,78,2,2100000.00),(9,6,69,1,350000.00),(10,7,31,1,15000000.00),(11,7,76,1,2000000.00),(12,8,57,1,3300000.00),(13,9,76,1,2000000.00),(14,10,76,2,210000.00),(15,11,3,1,4050000.00),(16,11,19,1,9450000.00),(17,11,50,1,14400000.00),(18,12,76,3,210000.00),(19,12,86,2,157500.00),(20,12,91,1,39000000.00),(21,13,8,1,2700000.00),(22,13,91,1,39000000.00),(23,14,82,1,4380000.00),(24,15,1,1,4280000.00),(25,16,2,2,4950000.00),(26,16,69,2,1995000.00),(27,16,91,1,39000000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `shipping_address` text,
  `status` varchar(50) DEFAULT 'PENDING',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `idx_orders_status` (`status`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (5,4,8700000.00,'Sài gòn','CANCELLED','2025-05-25 00:22:34','2025-05-27 01:45:16'),(6,4,350000.00,'Nhị Long Phú - Càng Long - Trà Vinh','CONFIRMED','2025-05-25 00:31:50','2025-05-27 01:45:34'),(7,4,17000000.00,'Nhị Long Phú - Càng Long - Trà Vinh','PENDING','2025-05-25 00:48:35','2025-05-25 00:48:35'),(8,4,3300000.00,'Nhị Long Phú - Càng Long - Trà Vinh','SHIPPED','2025-05-25 00:58:10','2025-05-27 01:45:57'),(9,4,2000000.00,'Nhị Long Phú - Càng Long - Trà Vinh','DELIVERED','2025-05-25 01:03:53','2025-05-27 01:46:02'),(10,4,420000.00,'Nhị Long - trà vinh-  Việt Nam','SHIPPED','2025-05-25 19:19:54','2025-05-25 19:23:42'),(11,4,27900000.00,'Nhị Long - Trà Vinh - Việt Nam','PENDING','2025-05-26 03:47:38','2025-05-26 03:47:38'),(12,4,39945000.00,'Quận 7 - Sài Gòn','PENDING','2025-05-27 03:34:45','2025-05-27 03:34:45'),(13,6,41700000.00,'Quận 1 - Tp.HCM','PENDING','2025-05-27 23:27:32','2025-05-27 23:27:32'),(14,6,4380000.00,'Quận 7 - Tp.HCM','CONFIRMED','2025-05-27 23:28:26','2025-05-27 23:35:28'),(15,2,4280000.00,'456 New Address, Barcelona City concat','PENDING','2025-05-28 00:34:30','2025-05-28 00:34:30'),(16,2,52890000.00,'Nhị Long - Càng Long - Trà Vinh','PENDING','2025-05-28 00:52:38','2025-05-28 00:52:38');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `color` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `stock_qty` int DEFAULT '0',
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_product_variants_product_id` (`product_id`),
  KEY `idx_product_variants_color` (`color`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'Đen',4280000.00,14,'img/product/1.jpg'),(2,1,'Trắng',4950000.00,4,'img/product/1.jpg'),(3,1,'Xám',4050000.00,3,'img/product/1.jpg'),(4,2,'Xanh dương',19800000.00,8,'img/product/2.jpg'),(5,2,'Đen',16200000.00,7,'img/product/2.jpg'),(6,2,'Trắng',18900000.00,6,'img/product/2.jpg'),(7,3,'Đen',3300000.00,18,'img/product/3.jpg'),(8,3,'Bạc',2700000.00,11,'img/product/3.jpg'),(9,3,'Đỏ',2700000.00,5,'img/product/3.jpg'),(10,4,'Đen',13125000.00,10,'img/product/4.jpg'),(11,4,'Xám',11250000.00,8,'img/product/4.jpg'),(12,4,'Xanh lá',13750000.00,4,'img/product/4.jpg'),(13,5,'Trắng',4680000.00,18,'img/product/5.jpg'),(14,5,'Đen',4680000.00,9,'img/product/5.jpg'),(15,5,'Xanh dương',5460000.00,6,'img/product/5.jpg'),(16,6,'Đen',9450000.00,10,'img/product/6.jpg'),(17,6,'Xám',9450000.00,7,'img/product/6.jpg'),(18,6,'Bạc',11550000.00,4,'img/product/6.jpg'),(19,7,'Xanh lá',9450000.00,14,'img/product/7.jpg'),(20,7,'Đen',9900000.00,12,'img/product/7.jpg'),(21,7,'Gỗ',8100000.00,5,'img/product/7.jpg'),(22,8,'Đen',4320000.00,18,'img/product/8.jpg'),(23,8,'Trắng',4320000.00,9,'img/product/8.jpg'),(24,8,'Đỏ',5280000.00,6,'img/product/8.jpg'),(25,9,'Đen',2250000.00,10,'img/product/9.jpg'),(26,9,'Trắng',2750000.00,8,'img/product/9.jpg'),(27,9,'Xanh dương',2750000.00,5,'img/product/9.jpg'),(28,10,'Đen',9900000.00,25,'img/product/10.jpg'),(29,10,'Xám',9900000.00,15,'img/product/10.jpg'),(30,10,'Bạc',9900000.00,8,'img/product/10.jpg'),(31,11,'Trắng',3150000.00,6,'img/product/11.jpg'),(32,11,'Đen',3150000.00,6,'img/product/11.jpg'),(33,11,'Xám',3150000.00,3,'img/product/11.jpg'),(34,12,'Cam',14250000.00,6,'img/product/12.jpg'),(35,12,'Đen',14250000.00,5,'img/product/12.jpg'),(36,12,'Xám',16500000.00,3,'img/product/12.jpg'),(37,13,'Trắng',22500000.00,4,'img/product/13.jpg'),(38,13,'Đen',22500000.00,3,'img/product/13.jpg'),(39,13,'Xám',22500000.00,2,'img/product/13.jpg'),(40,14,'Trắng',34200000.00,10,'img/product/14.jpg'),(41,14,'Đen',41800000.00,8,'img/product/14.jpg'),(42,14,'Xám',34200000.00,5,'img/product/14.jpg'),(43,15,'Trắng',9975000.00,5,'img/product/15.jpg'),(44,15,'Đen',10450000.00,4,'img/product/15.jpg'),(45,15,'Xám',9975000.00,2,'img/product/15.jpg'),(46,16,'Đen',49500000.00,8,'img/product/16.jpg'),(47,16,'Bạc',40500000.00,6,'img/product/16.jpg'),(48,16,'Xám',49500000.00,4,'img/product/16.jpg'),(49,17,'Đen',16800000.00,20,'img/product/17.jpg'),(50,17,'Xanh rêu',14400000.00,9,'img/product/17.jpg'),(51,17,'Xám',17600000.00,8,'img/product/17.jpg'),(52,18,'Đen',19800000.00,25,'img/product/18.jpg'),(53,18,'Xanh dương',16200000.00,15,'img/product/18.jpg'),(54,18,'Xám',18900000.00,10,'img/product/18.jpg'),(55,19,'Đen',2660000.00,12,'img/product/19.jpg'),(56,19,'Xanh lá',3080000.00,8,'img/product/19.jpg'),(57,19,'Nâu',2520000.00,4,'img/product/19.jpg'),(58,20,'Đen',1425000.00,30,'img/product/20.jpg'),(59,20,'Xanh dương',1575000.00,20,'img/product/20.jpg'),(60,20,'Đỏ',1575000.00,10,'img/product/20.jpg'),(61,21,'Đen',3520000.00,15,'img/product/21.jpg'),(62,21,'Xám',2880000.00,10,'img/product/21.jpg'),(63,21,'Bạc',3520000.00,5,'img/product/21.jpg'),(64,22,'Đen',1260000.00,50,'img/product/22.jpg'),(65,22,'Bạc',1140000.00,30,'img/product/22.jpg'),(66,22,'Xám',1080000.00,20,'img/product/22.jpg'),(67,23,'Xanh lá cây',1710000.00,80,'img/product/23.jpg'),(68,23,'Đỏ',1995000.00,40,'img/product/23.jpg'),(69,23,'Xám ND',1995000.00,27,'img/product/23.jpg'),(70,24,'Đen',450000.00,40,'img/product/24.jpg'),(71,24,'Bạc',450000.00,20,'img/product/24.jpg'),(72,24,'Xám',450000.00,15,'img/product/24.jpg'),(73,25,'Đen',270000.00,60,'img/product/25.jpg'),(74,25,'Trắng',270000.00,30,'img/product/25.jpg'),(75,25,'Xám',285000.00,20,'img/product/25.jpg'),(76,26,'Trắng',210000.00,3,'img/product/26.jpg'),(77,26,'Đen',190000.00,8,'img/product/26.jpg'),(78,26,'Xám',210000.00,5,'img/product/26.jpg'),(82,1,'Đỏ',4380000.00,9,'img/product/1.jpg'),(84,27,'Xanh lá',142500.00,15,'img/product/27.jpg'),(85,27,'Cam',150000.00,12,'img/product/27.jpg'),(86,27,'Nâu',157500.00,8,'img/product/27.jpg'),(87,28,'Xanh lá',950000.00,18,'img/product/28.jpg'),(88,28,'Cam',1000000.00,15,'img/product/28.jpg'),(89,28,'Nâu',1050000.00,12,'img/product/28.jpg'),(90,29,'Xanh lá',37050000.00,10,'img/product/29.jpg'),(91,29,'Cam',39000000.00,9,'img/product/29.jpg'),(92,29,'Nâu',40950000.00,15,'img/product/29.jpg'),(93,31,'Xanh lá',8550000.00,14,'img/product/31.jpg'),(94,31,'Cam',9000000.00,16,'img/product/31.jpg'),(95,31,'Nâu',9450000.00,13,'img/product/31.jpg');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `base_price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `brand_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category_id` (`category_id`),
  KEY `idx_products_brand_id` (`brand_id`),
  KEY `idx_products_name` (`name`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Celestron AstroMaster 90EQ','Kính thiên văn khúc xạ cho người mới bắt đầu với chân đế xích đạo. Nó rất phù hợp cho những người mới bắt đầu khám phá bầu trời đêm. Bạn sẽ dễ dàng tìm thấy các hành tinh và mặt trăng với chiếc kính này. Đây là điểm khởi đầu lý tưởng cho bất kỳ ai muốn bước chân vào thế giới thiên văn. Với nó, bạn có thể dễ dàng bắt đầu hành trình khám phá vũ trụ.',4500000.00,'img/product/1.jpg',1,1,'2025-05-07 21:17:11','2025-05-27 03:03:45'),(2,'Sky-Watcher Evostar 100ED','Kính thiên văn khúc xạ ED doublet chất lượng cao, lý tưởng cho chiêm tinh và chụp ảnh. Với độ sắc nét vượt trội, kính này mang lại trải nghiệm quan sát chi tiết và sống động. Đây là lựa chọn lý tưởng cho các nhà thiên văn nghiệp dư và người yêu thích nhiếp ảnh. Khả năng hiệu chỉnh màu sắc tuyệt vời giúp bạn có những bức ảnh thiên văn chân thực nhất. Đây là một công cụ mạnh mẽ, đáng giá cho những người yêu thích sự hoàn hảo.',18000000.00,'img/product/2.jpg',1,2,'2025-05-07 21:17:11','2025-05-27 03:03:45'),(3,'Meade Infinity 80AZ','Kính thiên văn khúc xạ nhỏ gọn với chân đế Alt-Az tiện lợi. Kính dễ dàng lắp đặt và di chuyển, thích hợp cho việc quan sát nhanh chóng. Thiết kế nhỏ gọn giúp bạn mang theo trong các chuyến dã ngoại. Rất phù hợp cho các buổi quan sát ngẫu hứng hoặc mang theo khi đi cắm trại. Sự tiện lợi của nó sẽ khiến bạn muốn ngắm sao thường xuyên hơn.',3000000.00,'img/product/3.jpg',1,3,'2025-05-07 21:17:11','2025-05-27 03:03:45'),(4,'SVBONY SV503 80ED','Kính khúc xạ ED APO chất lượng tốt với giá phải chăng. Kính mang lại hình ảnh rõ nét và không bị sắc sai, là lựa chọn tuyệt vời cho cả quan sát và chụp ảnh. Sản phẩm này được đánh giá cao về hiệu suất quang học trong tầm giá. Được cộng đồng thiên văn đánh giá cao về hiệu suất quang học, đặc biệt là khả năng kiểm soát sắc sai. Đây thực sự là một lựa chọn tuyệt vời cho cả những người mới bắt đầu và những người có kinh nghiệm.',14400000.00,'img/product/4.jpg',1,4,'2025-05-07 21:17:11','2025-05-27 03:03:45'),(5,'Orion AstroView 90mm','Kính khúc xạ 90mm với bộ phụ kiện đầy đủ. Bộ phụ kiện đi kèm giúp bạn bắt đầu quan sát ngay lập tức mà không cần mua thêm. Đây là một kính thiên văn đa năng, phù hợp cho nhiều mục đích sử dụng. Bạn sẽ có mọi thứ cần thiết để bắt đầu cuộc phiêu lưu thiên văn ngay lập tức. Đây là một gói sản phẩm hoàn chỉnh, mang lại giá trị sử dụng cao.',5200000.00,'img/product/5.jpg',1,5,'2025-05-07 21:17:11','2025-05-27 03:03:45'),(6,'Celestron NexStar 130SLT','Kính phản xạ GoTo nhỏ gọn với thư viện vật thể lớn. Hệ thống GoTo tự động giúp bạn dễ dàng định vị và theo dõi các vật thể thiên văn. Thư viện vật thể phong phú sẽ mở ra một thế giới khám phá mới. Công nghệ GoTo tiên tiến giúp bạn tiết kiệm thời gian tìm kiếm và tập trung vào việc quan sát. Hệ thống này mở ra cánh cửa đến hàng ngàn vật thể thiên văn chỉ bằng một nút bấm.',10500000.00,'img/product/6.jpg',2,1,'2025-05-07 21:17:11','2025-05-27 03:03:45'),(7,'Sky-Watcher Traditional Dobsonian 8\"','Kính phản xạ Dobsonian khẩu độ lớn, giá trị tốt cho quan sát sâu. Với khẩu độ lớn, kính này thu được nhiều ánh sáng, cho phép bạn quan sát các vật thể mờ sâu trong không gian. Chân đế Dobsonian mang lại sự ổn định tuyệt vời và dễ sử dụng. Bạn sẽ bị ấn tượng bởi khả năng thu sáng và độ tương phản mà chiếc kính này mang lại. Nó là một khoản đầu tư tuyệt vời cho việc quan sát các vật thể sâu trong không gian.',9000000.00,'img/product/7.jpg',2,2,'2025-05-07 21:17:11','2025-05-27 03:03:45'),(8,'Meade Polaris 130mm EQ','Kính phản xạ trên chân đế xích đạo. Kính phản xạ này mang lại hình ảnh sáng rõ, đặc biệt tốt cho việc quan sát các hành tinh và cụm sao. Chân đế xích đạo giúp theo dõi vật thể dễ dàng hơn khi chúng di chuyển trên bầu trời. Thiết kế chắc chắn và dễ sử dụng làm cho nó trở thành một lựa chọn phổ biến cho người mới bắt đầu. Bạn sẽ nhanh chóng làm quen với việc theo dõi các ngôi sao và hành tinh.',4800000.00,'img/product/8.jpg',2,3,'2025-05-07 21:17:11','2025-05-27 03:03:45'),(9,'SVBONY SV501P 70/400 Refractor','Mặc dù tên là Refractor, đây là ví dụ thêm sản phẩm Mặc dù kích thước nhỏ, kính này vẫn cung cấp hình ảnh tốt cho việc quan sát các vật thể sáng. Đây là một lựa chọn tuyệt vời cho người mới bắt đầu với ngân sách hạn chế. Với trọng lượng nhẹ và kích thước nhỏ gọn, nó rất dễ mang theo và lắp đặt. Kính này là một lựa chọn lý tưởng cho những người muốn một kính thiên văn cơ bản mà không quá cồng kềnh.',2500000.00,'img/product/9.jpg',1,4,'2025-05-07 21:17:11','2025-05-27 03:03:45'),(10,'Orion SkyQuest XT8 Classic Dobsonian','Kính Dobsonian 8 inch cổ điển, dễ sử dụng. Kính Dobsonian 8 inch này nổi tiếng về khả năng thu sáng và độ ổn định, phù hợp cho những buổi quan sát sâu. Thiết kế đơn giản giúp việc lắp đặt và sử dụng trở nên dễ dàng. Khả năng quan sát trực quan của nó rất ấn tượng, cho phép bạn nhìn thấy các chi tiết tinh tế của các thiên thể. Đây là một kính thiên văn lý tưởng cho những buổi tụ tập gia đình hoặc bạn bè dưới bầu trời đêm.',11000000.00,'img/product/10.jpg',2,5,'2025-05-07 21:17:11','2025-05-27 03:03:45'),(11,'Celestron PowerSeeker 127EQ','Kính phản xạ 127mm trên chân đế xích đạo. Kính này là lựa chọn phổ biến cho những người muốn khám phá vũ trụ với ngân sách vừa phải. Mặc dù là kính phản xạ cơ bản, nó vẫn mang lại trải nghiệm quan sát tốt cho các vật thể sáng. Dễ dàng thiết lập và sử dụng, kính này là sự lựa chọn tốt cho những ai muốn khám phá bầu trời đêm mà không cần quá nhiều phức tạp. Nó sẽ mở ra cho bạn thế giới của các hành tinh và cụm sao.',3500000.00,'img/product/11.jpg',2,1,'2025-05-07 21:17:12','2025-05-27 03:03:45'),(12,'Sky-Watcher Virtuoso 150P','Kính phản xạ tabletop GoTo. Kính tabletop này rất tiện lợi để mang theo và sử dụng ở bất cứ đâu. Hệ thống GoTo giúp bạn dễ dàng tìm kiếm các vật thể mà không cần dò tìm thủ công. Hệ thống GoTo tích hợp giúp bạn nhanh chóng định vị các vật thể thiên văn mà không cần kiến thức chuyên sâu. Thiết kế tabletop tiện lợi cho phép bạn quan sát từ bất cứ đâu.',15000000.00,'img/product/12.jpg',2,2,'2025-05-07 21:17:12','2025-05-27 03:03:45'),(13,'Celestron NexStar 6SE','Kính Schmidt-Cassegrain GoTo 6 inch. Đây là một kính thiên văn đa năng, xuất sắc cho cả quan sát trực quan và chụp ảnh thiên văn. Hệ thống GoTo chính xác giúp định vị hàng ngàn vật thể trên bầu trời. Với độ chính xác cao và thiết kế linh hoạt, đây là một trong những kính thiên văn được yêu thích nhất của Celestron. Nó là công cụ hoàn hảo để đưa niềm đam mê thiên văn của bạn lên một tầm cao mới.',25000000.00,'img/product/13.jpg',3,1,'2025-05-07 21:17:12','2025-05-27 03:03:45'),(14,'Meade LX65 8\" ACF','Kính ACF (Advanced Coma-Free) tổ hợp 8 inch. Công nghệ ACF độc quyền của Meade giúp loại bỏ hiện tượng coma, mang lại hình ảnh sắc nét trên toàn bộ trường nhìn. Đây là một công cụ mạnh mẽ cho những nhà thiên văn nghiêm túc và nhiếp ảnh gia. Quang học cao cấp đảm bảo hình ảnh rõ ràng và không bị biến dạng, ngay cả ở rìa trường nhìn. Đây là một chiếc kính mạnh mẽ cho việc chụp ảnh thiên văn và quan sát chuyên sâu.',38000000.00,'img/product/14.jpg',3,3,'2025-05-07 21:17:12','2025-05-27 03:03:45'),(15,'Sky-Watcher Skymax 127','Kính Maksutov-Cassegrain 127mm. Thiết kế Maksutov-Cassegrain nhỏ gọn nhưng mạnh mẽ, lý tưởng cho việc quan sát các hành tinh và mặt trăng. Kính này mang lại hình ảnh có độ tương phản cao và sắc nét. Kích thước nhỏ gọn nhưng mạnh mẽ làm cho nó trở thành một công cụ đa năng cho nhiều mục đích quan sát. Bạn sẽ ngạc nhiên với những gì chiếc kính này có thể mang lại khi quan sát các vật thể sáng.',9500000.00,'img/product/15.jpg',3,2,'2025-05-07 21:17:12','2025-05-27 03:03:45'),(16,'Celestron Evolution 8','Kính Schmidt-Cassegrain 8 inch với pin sạc tích hợp và Wifi. Với pin sạc tích hợp và khả năng điều khiển qua Wi-Fi, đây là một kính thiên văn hiện đại và tiện lợi. Bạn có thể dễ dàng lập kế hoạch quan sát và chụp ảnh từ thiết bị di động của mình. Khả năng kết nối không dây giúp việc điều khiển kính trở nên dễ dàng và linh hoạt hơn bao giờ hết. Đây là sự lựa chọn hoàn hảo cho những ai muốn sự tiện nghi và công nghệ tiên tiến.',45000000.00,'img/product/16.jpg',3,1,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(17,'SVBONY SV503 102 ED','Mặc dù là khúc xạ, thêm vào đây cho đủ số lượng và đa dạng ví dụ Kính khúc xạ ED này cung cấp hình ảnh sắc nét và độ tương phản cao, rất phù hợp cho việc quan sát các chi tiết tinh tế. Đây là một công cụ xuất sắc cho cả chiêm tinh và chụp ảnh thiên văn. Với lớp phủ quang học tiên tiến, nó đảm bảo truyền ánh sáng tối đa và hình ảnh rõ ràng. Đây là một khoản đầu tư tuyệt vời cho bất kỳ ai muốn nâng cao trải nghiệm quan sát của mình.',16000000.00,'img/product/17.jpg',1,4,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(18,'Meade ETX 125 Observer','Kính Maksutov-Cassegrain nhỏ gọn có GoTo. Mặc dù nhỏ gọn, kính Maksutov-Cassegrain này có khả năng GoTo, giúp việc tìm kiếm vật thể trở nên cực kỳ dễ dàng. Đây là lựa chọn lý tưởng cho những ai muốn một kính tiện lợi nhưng vẫn mạnh mẽ. Thiết kế nhỏ gọn giúp bạn có thể dễ dàng mang theo đến bất cứ đâu để ngắm sao. Đây là một công cụ mạnh mẽ gói gọn trong một kích thước tiện lợi.',18000000.00,'img/product/18.jpg',3,3,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(19,'Celestron SkyMaster 15x70','Ống nhòm thiên văn khẩu độ lớn 70mm. Ống nhòm này cung cấp trường nhìn rộng và khả năng thu sáng tốt, lý tưởng cho việc quan sát các cụm sao và thiên hà mờ. Kích thước 70mm giúp bạn trải nghiệm bầu trời đêm một cách sống động. Kích thước lớn của ống nhòm này giúp thu thập nhiều ánh sáng hơn, làm cho các vật thể mờ trở nên rõ ràng. Rất lý tưởng cho việc quan sát các cụm sao và dải ngân hà.',2800000.00,'img/product/19.jpg',4,1,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(20,'Orion 10x50 Binoculars','Ống nhòm đa dụng 10x50. Với độ phóng đại 10x và đường kính vật kính 50mm, ống nhòm này rất đa dụng cho cả quan sát thiên văn và các hoạt động ngoài trời khác. Nó mang lại hình ảnh sáng và rõ nét. Với trường nhìn rộng và độ phóng đại vừa phải, nó phù hợp cho cả quan sát chim, phong cảnh và thiên văn. Đây là một ống nhòm đa năng mà bạn có thể sử dụng hàng ngày.',1500000.00,'img/product/20.jpg',4,5,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(21,'SVBONY SV202 10x42 ED','Ống nhòm ED nhỏ gọn, chất lượng quang học tốt. Ống nhòm ED này giảm thiểu sắc sai, mang lại hình ảnh cực kỳ sắc nét và trung thực. Thiết kế nhỏ gọn giúp bạn dễ dàng mang theo trong mọi chuyến đi. Trọng lượng nhẹ và thiết kế công thái học giúp việc cầm nắm và sử dụng lâu dài trở nên thoải mái. Đây là một lựa chọn tuyệt vời cho những ai tìm kiếm chất lượng quang học cao trong một gói nhỏ gọn.',3200000.00,'img/product/21.jpg',4,4,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(22,'Meade TravelView 8x42','Ống nhòm du lịch 8x42. Ống nhòm này là người bạn đồng hành tuyệt vời cho những chuyến du lịch và quan sát cảnh vật. Với trọng lượng nhẹ và thiết kế tiện dụng, nó rất dễ sử dụng và mang theo. Kích thước nhỏ gọn và độ bền cao làm cho nó trở thành người bạn đồng hành lý tưởng cho mọi chuyến đi. Bạn sẽ không bỏ lỡ bất kỳ khoảnh khắc thú vị nào với ống nhòm này.',1200000.00,'img/product/22.jpg',4,3,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(23,'Celestron Cometron 7x50','Ống nhòm chuyên cho quan sát sao chổi và trường rộng. Được thiết kế đặc biệt để quan sát sao chổi và các vật thể trường rộng, ống nhòm này cung cấp một cái nhìn bao quát về bầu trời. Khẩu độ 7x50mm giúp thu sáng tốt trong điều kiện ánh sáng yếu. Được tối ưu hóa cho việc quan sát các vật thể sáng và trường rộng, nó là công cụ hoàn hảo để \"quét\" qua bầu trời đêm. Bạn sẽ ngạc nhiên với độ rộng của trường nhìn mà nó mang lại.',1900000.00,'img/product/23.jpg',4,1,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(24,'Thị kính Plossl 10mm','Thị kính Plossl đa dụng 10mm. Thị kính Plossl 10mm này là một phụ kiện cơ bản nhưng thiết yếu, mang lại hình ảnh rõ nét và độ phóng đại vừa phải. Đây là lựa chọn tốt cho việc quan sát chi tiết các hành tinh và mặt trăng. Được thiết kế để mang lại hình ảnh sắc nét và độ tương phản tốt, đây là một thị kính đa năng mà mọi nhà thiên văn đều nên có. Nó là một phụ kiện thiết yếu cho bất kỳ bộ kính thiên văn nào.',500000.00,'img/product/24.jpg',5,4,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(25,'Kính lọc Mặt Trăng','Kính lọc giảm độ sáng quan sát Mặt Trăng. Kính lọc này giúp giảm chói hiệu quả khi quan sát Mặt Trăng, cho phép bạn nhìn rõ hơn các chi tiết bề mặt. Đây là phụ kiện không thể thiếu cho những buổi quan sát Mặt Trăng kéo dài. Dễ dàng gắn vào hầu hết các thị kính tiêu chuẩn, nó là một phụ kiện nhỏ nhưng cực kỳ hữu ích. Nó sẽ giúp bạn quan sát mặt trăng một cách thoải mái hơn rất nhiều.',300000.00,'img/product/25.jpg',5,4,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(26,'Barlow Lens 2x','Ống kính Barlow tăng gấp đôi độ phóng đại. Ống kính Barlow 2x này là một cách tiết kiệm để tăng gấp đôi độ phóng đại của bất kỳ thị kính nào bạn có. Nó giúp bạn khám phá những chi tiết nhỏ hơn của các vật thể thiên văn. Đây là một cách tiết kiệm chi phí để mở rộng khả năng phóng đại của kính thiên văn của bạn mà không cần mua thêm thị kính. Nó là một phụ kiện đa năng và cần thiết cho mọi nhà thiên văn.',200000.00,'img/product/26.jpg',5,2,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(27,'Adapter chụp ảnh điện thoại','Thiết bị giúp gắn điện thoại lên thị kính để chụp ảnh. Adapter này giúp bạn dễ dàng chụp ảnh thiên văn bằng điện thoại thông minh qua kính thiên văn của mình. Đây là một công cụ tuyệt vời để chia sẻ những gì bạn quan sát được với bạn bè và gia đình. Với thiết kế phổ quát, nó tương thích với hầu hết các loại điện thoại thông minh và thị kính. Đây là một công cụ đơn giản nhưng hiệu quả để bắt đầu chụp ảnh thiên văn.',150000.00,'img/product/27.jpg',5,1,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(28,'Chân đế EQ1','Chân đế xích đạo cho kính thiên văn nhỏ. Chân đế EQ1 là một lựa chọn kinh tế cho các kính thiên văn nhỏ, giúp bạn theo dõi các vật thể khi chúng di chuyển trên bầu trời. Nó rất phù hợp cho người mới bắt đầu học cách điều khiển kính xích đạo. Chân đế này cho phép bạn theo dõi các vật thể thiên văn khi Trái Đất quay, giữ chúng trong trường nhìn. Nó là một bước tiến quan trọng cho những người muốn thực hiện quan sát lâu hơn và chính xác hơn.',1000000.00,'img/product/28.jpg',5,2,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(29,'Sky-Watcher Esprit 100ED','Kính thiên văn khúc xạ Triplet ED APO 100mm cao cấp, lý tưởng cho chụp ảnh chuyên nghiệp và quan sát. Kính thiên văn này cung cấp hình ảnh không tì vết, không sắc sai và độ tương phản tuyệt vời, rất lý tưởng cho chụp ảnh thiên văn sâu. Đây là một khoản đầu tư xứng đáng cho những người đam mê nghiêm túc. Với độ sắc nét vượt trội và khả năng kiểm soát sắc sai gần như hoàn hảo, đây là một kính thiên văn lý tưởng cho cả người đam mê và chuyên gia. Nó mang lại hiệu suất quang học đỉnh cao cho mọi ứng dụng.',39000000.00,'img/product/29.jpg',1,2,'2025-05-07 21:17:12','2025-05-27 03:03:56'),(31,'Sky-Watcher Heritage 130P FlexTube Dobsonian','Kính thiên văn Dobsonian này nổi tiếng với thiết kế nhỏ gọn, dễ di chuyển và khả năng thu sáng tốt nhờ khẩu độ 130mm. Ống kính có thể thu gọn giúp tiết kiệm không gian. Nó cung cấp hình ảnh sắc nét về Mặt Trăng, các hành tinh và các cụm sao. Chân đế Dobsonian rất ổn định và dễ dàng điều khiển bằng tay. Ống kính có thể thu gọn giúp tiết kiệm không gian và dễ dàng vận chuyển. Nó cung cấp hình ảnh sắc nét về Mặt Trăng, các hành tinh và các cụm sao, rất phù hợp cho việc quan sát nhanh chóng. Chân đế Dobsonian rất ổn định và dễ dàng điều khiển bằng tay, giúp bạn dễ dàng ngắm sao. Đây là một lựa chọn tuyệt vời cho những ai muốn một kính thiên văn mạnh mẽ và dễ sử dụng.',9000000.00,'img/product/31.jpg',2,2,'2025-05-26 19:17:28','2025-05-27 03:03:56');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','CUSTOMER') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `address` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'thinh','$2a$10$Jh2NXpWsfVZQpWy5RsT0duNmRRbhl9AeeJyQnSgPLDGE79uonhtdu','Thịnh Thân Quốc','thinhquoc6@gmail.com','CUSTOMER',NULL,'2025-05-28 00:36:40','Nhị Long - Càng Long - Trà Vinh'),(4,'customer','$2a$10$BTOLHb984ohBIuWHACY6aucwRn1OVLT/f8ihy2RroBb2YDGECeZzu','Quốc Thịnh','skyjohnthan@gmail.com','CUSTOMER',NULL,'2025-05-27 22:01:48','Nhị Long - Trà Vinh - Việt Nam - Châu á'),(5,'admin','$2a$10$WgkHI/rlA5bvTr8CLikLROBJ9tMcCh7A8zVO/sQseXzer0KKWqll6','Thịnh Quản lý','thinhskyduck@gmail.com','ADMIN',NULL,'2025-05-26 03:00:51','Nhị Long - Càng Long - Trà Vinh'),(6,'customer2','$2a$10$lsTkxaonVm7RSwcyTihkwOCPtSMVZI7FTNCHPSJ0fMH6EiDSwzdtK','Thân Quốc Thịnh','shopthinhtan@gmail.com','CUSTOMER','2025-05-27 23:25:29','2025-05-27 23:25:29','Quận 7 - Tp.HCM');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-01 12:22:42
