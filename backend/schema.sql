-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: vinatrix_clothing
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_uuid` varchar(100) NOT NULL,
  `address_label` varchar(50) DEFAULT 'Home',
  `address_text` text NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `address_type` enum('home','office','guest','other') DEFAULT 'home',
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_uuid` (`user_uuid`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_uuid`) REFERENCES `users` (`user_uuid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (19,'USER_1780643683144_8orwv47b','Home','609, 2nd floor, ambattur',1,'home','CHENNAI','Tamilnadu','600037','2026-06-05 07:31:07','2026-06-05 07:31:07'),(20,'USER_1780643683144_8orwv47b','Secondary','608, room 2 office 2 nd floor, mugapaire west.',0,'office','Chennai','Tamilnadu','600037','2026-06-05 07:31:07','2026-06-05 07:31:07'),(21,'USER_1780645571710_7u6fb84s','Home','500, 1st block, mugappair',1,'home','chennai','taminadu','600037','2026-06-05 07:46:59','2026-06-05 07:46:59'),(22,'USER_1780157212646_eiidio3o','Home','608,1st block mugappaire',1,'home','chennai','tamilnadu','600037','2026-06-05 08:02:42','2026-06-05 08:02:42'),(23,'USER_1780157212646_eiidio3o','Secondary','kallakurichi 253',0,'office','kallakurichi','tamilnadu','606207','2026-06-05 08:02:42','2026-06-05 08:02:42');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `allproducts`
--

DROP TABLE IF EXISTS `allproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `allproducts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_category` varchar(100) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `size` enum('S','M','L','XL','XXL','XXXL') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `product_image` varchar(500) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`product_name`),
  KEY `idx_category` (`product_category`),
  KEY `idx_size` (`size`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allproducts`
--

LOCK TABLES `allproducts` WRITE;
/*!40000 ALTER TABLE `allproducts` DISABLE KEYS */;
INSERT INTO `allproducts` VALUES (20,'Tshirt','t-shirt','S',890.00,1,'/uploads/1779560330669-414443104.jpg','white beand new ','2026-05-23 18:18:50','2026-06-01 06:28:24'),(22,'Pant','test ','S',225.00,1,'/uploads/1779560792813-416940641.png','','2026-05-23 18:26:32','2026-06-01 06:28:24'),(24,'Tshirt','t-shirt','L',900.00,2,'/uploads/1779561816295-531118559.jpg','','2026-05-23 18:43:36','2026-06-01 06:28:24'),(25,'Shirt','test','L',250.00,2,'/uploads/1779561947595-784594981.jpg','','2026-05-23 18:45:47','2026-06-01 06:28:24'),(26,'Pant','ttttt','L',230.00,2,'/uploads/1779562452336-130322300.png','','2026-05-23 18:54:12','2026-06-01 06:28:24'),(27,'Tshirt','ttt','L',250.00,2,'/uploads/1779562930315-423238663.jpg','','2026-05-23 19:02:10','2026-06-01 06:28:24'),(28,'Pant','test ','M',350.00,2,'/uploads/1779562991445-531280957.png','','2026-05-23 19:03:11','2026-06-01 06:28:24'),(29,'Tshirt','ttt','M',2500.00,2,'/uploads/1779563493100-740146798.jpg','','2026-05-23 19:11:33','2026-06-01 06:28:24'),(30,'Shirt','tell','XXL',350.00,2,'/uploads/1779563945492-772296719.png','','2026-05-23 19:19:05','2026-06-01 06:22:09'),(31,'Shirt','pant','XXL',280.00,2,'/uploads/1779564015266-22889203.png','','2026-05-23 19:20:15','2026-06-01 06:22:09'),(32,'Pant','pant cotton','XXL',250.00,2,'/uploads/1779854531530-759850861.png','costly pant','2026-05-27 04:02:11','2026-06-01 06:22:09'),(33,'Party Wears','Party cotton polisher ','XXL',890.00,2,'/uploads/1779855020332-220503361.png','','2026-05-27 04:10:20','2026-06-01 06:22:09'),(34,'Tshirt','t-shirt ','XXL',350.00,2,'/uploads/1779855242247-461025783.png','','2026-05-27 04:14:02','2026-06-01 06:22:09'),(35,'Colorful Picks','colorful dress ','XXL',980.00,2,'/uploads/1779855538648-235638076.png','colourful','2026-05-27 04:18:58','2026-06-01 06:22:09'),(36,'Jeans Pant','jena\'s ','XXL',250.00,2,'/uploads/1779856465050-768317051.png','','2026-05-27 04:34:25','2026-06-01 06:22:09'),(37,'Jeans Pant','jeans','XXL',980.00,2,'/uploads/1779856508910-14682052.png','','2026-05-27 04:35:08','2026-06-01 06:22:09'),(38,'Pant','pants vina','XXL',980.00,2,'/uploads/1779860642833-777699232.png','','2026-05-27 05:44:02','2026-06-01 06:22:09'),(39,'Track','track ram ','XXL',550.00,1,'/uploads/1779948969512-701937881.png','','2026-05-28 06:16:09','2026-06-01 06:22:09'),(40,'Pant','pant runtime ','XXL',250.00,1,'/uploads/1779949014648-314172556.png','','2026-05-28 06:16:54','2026-06-01 06:22:09'),(41,'Shirt','auto ','XXL',280.00,1,'/uploads/1779949042936-937702307.png','','2026-05-28 06:17:23','2026-06-01 06:22:09'),(42,'Jeans Pant','jeans','XXL',960.00,1,'/uploads/1780293232230-251358800.png','','2026-06-01 05:53:52','2026-06-01 06:22:09'),(43,'Shirt','Vinatrix cotton material','XXL',890.00,2,'/uploads/1780293997211-791208416.png','deed','2026-06-01 06:06:37','2026-06-01 06:22:09'),(44,'Trending','ttteesfhh','L',258.00,1,'/uploads/1780513616508-493565808.jpg','','2026-06-03 19:06:56','2026-06-03 19:06:56'),(45,'Trending','next gen','XL',250.00,1,'/uploads/1780514218218-879289173.png','','2026-06-03 19:16:58','2026-06-03 19:16:58'),(46,'Tshirt','White t shirt','M',250.00,1,'/uploads/1780643911891-291017352.png','White tshirt very clean ','2026-06-05 07:18:31','2026-06-05 07:18:31');
/*!40000 ALTER TABLE `allproducts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cust_id` varchar(100) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `cust_deviceid` varchar(200) DEFAULT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_category` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `product_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_cust_id` (`cust_id`),
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `allproducts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (106,'USER_1780646652811_ut9ln1gn','localhost','web_browser',44,'ttteesfhh','Trending',258.00,1,'https://api.vinatrix-api.workers.dev/uploads/1780513616508-493565808.jpg','2026-06-05 08:05:03','2026-06-05 08:05:03'),(108,'USER_1780650372751_z3ai26co','255b882b.vinatrix.pages.dev','web_browser',45,'next gen','Trending',250.00,1,'http://localhost:5000/uploads/1780514218218-879289173.png','2026-06-05 09:06:30','2026-06-05 09:06:30'),(109,'USER_1780650391494_s5u5t4ar','255b882b.vinatrix.pages.dev','web_browser',45,'next gen','Trending',250.00,2,'http://localhost:5000/uploads/1780514218218-879289173.png','2026-06-05 09:06:31','2026-06-05 09:06:31'),(110,'USER_1780650393138_2da6aej3','255b882b.vinatrix.pages.dev','web_browser',45,'next gen','Trending',250.00,1,'http://localhost:5000/uploads/1780514218218-879289173.png','2026-06-05 09:06:43','2026-06-05 09:06:43');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
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
  `product_id` int NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `product_category` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,24,38,'pants vina','Pant',980.00,1,980.00,'2026-06-03 19:44:10'),(2,25,44,'ttteesfhh','Trending',258.00,1,258.00,'2026-06-03 19:44:47'),(3,26,38,'pants vina','Pant',980.00,1,980.00,'2026-06-05 07:17:00'),(4,26,40,'pant runtime ','Pant',250.00,1,250.00,'2026-06-05 07:17:00'),(5,27,38,'pants vina','Pant',980.00,1,980.00,'2026-06-05 07:31:23'),(6,27,40,'pant runtime ','Pant',250.00,1,250.00,'2026-06-05 07:31:23'),(7,28,45,'next gen','Trending',250.00,1,250.00,'2026-06-05 08:23:35'),(8,29,45,'next gen','Trending',250.00,1,250.00,'2026-06-05 08:23:40');
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
  `order_number` varchar(50) NOT NULL,
  `cust_id` varchar(100) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT 'Guest',
  `customer_phone` varchar(20) DEFAULT '',
  `address` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(10,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) NOT NULL,
  `item_count` int NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `order_status` enum('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `order_date` varchar(50) DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_cust_id` (`cust_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_order_date` (`order_date`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (20,'ORD1780515494188418','USER_1780157212646_eiidio3o','Ramachandiran123','9629939175','608,1st block mugappaire','chennai','tamilnadu','600037',980.00,0.00,0.00,980.00,1,'cash','pending','pending','2026-06-04 01:08:11','2026-06-05',NULL,'2026-06-03 19:38:14','2026-06-03 19:38:14'),(21,'ORD1780515502248842','USER_1780157212646_eiidio3o','Ramachandiran123','9629939175','608,1st block mugappaire','chennai','tamilnadu','600037',250.00,0.00,0.00,250.00,1,'cash','pending','pending','2026-06-04 01:08:19','2026-06-05',NULL,'2026-06-03 19:38:22','2026-06-03 19:38:22'),(22,'ORD1780515514852370','USER_1780157212646_eiidio3o','Ramachandiran123','9629939175','608,1st block mugappaire','chennai','tamilnadu','600037',250.00,0.00,0.00,250.00,1,'cash','pending','pending','2026-06-04 01:08:31','2026-06-05',NULL,'2026-06-03 19:38:34','2026-06-03 19:38:34'),(23,'ORD1780515700810557','USER_1780157212646_eiidio3o','Ramachandiran123','9629939175','608,1st block mugappaire','chennai','tamilnadu','600037',258.00,0.00,0.00,258.00,1,'cash','pending','pending','2026-06-04 01:11:37','2026-06-05',NULL,'2026-06-03 19:41:40','2026-06-03 19:41:40'),(24,'ORD1780515850213234','USER_1780157212646_eiidio3o','Ramachandiran123','9629939175','608,1st block mugappaire','chennai','tamilnadu','600037',980.00,0.00,0.00,980.00,1,'cash','pending','pending','2026-06-04 01:14:07','2026-06-05',NULL,'2026-06-03 19:44:10','2026-06-03 19:44:10'),(25,'ORD178051588726095','USER_1780157212646_eiidio3o','Ramachandiran123','9629939175','608,1st block mugappaire','chennai','tamilnadu','600037',258.00,0.00,0.00,258.00,1,'cash','pending','pending','2026-06-04 01:14:44','2026-06-05',NULL,'2026-06-03 19:44:47','2026-06-03 19:44:47'),(26,'ORD178064382054350','USER_1780643683144_8orwv47b','ROMANTIC','9977994649','Cheers','Cheers ai','Tamil','606904',1230.00,0.00,0.00,1230.00,2,'cash','pending','pending','2026-06-05 12:47:00','2026-06-06',NULL,'2026-06-05 07:17:00','2026-06-05 07:17:00'),(27,'ORD1780644683390881','USER_1780643683144_8orwv47b','Vina andriod','9789376035','609, 2nd floor, ambattur','CHENNAI','Tamilnadu','600037',1230.00,0.00,0.00,1230.00,2,'cash','pending','pending','2026-06-05 13:01:23','2026-06-06',NULL,'2026-06-05 07:31:23','2026-06-05 07:31:23'),(28,'ORD178064781516844','USER_1780157212646_eiidio3o','Ramachandiran123','9629939175','608,1st block mugappaire','chennai','tamilnadu','600037',250.00,0.00,0.00,250.00,1,'cash','pending','pending','2026-06-05 13:53:35','2026-06-06',NULL,'2026-06-05 08:23:35','2026-06-05 08:23:35'),(29,'ORD1780647820549948','USER_1780157212646_eiidio3o','Ramachandiran123','9629939175','608,1st block mugappaire','chennai','tamilnadu','600037',250.00,0.00,0.00,250.00,1,'cash','pending','pending','2026-06-05 13:53:40','2026-06-06',NULL,'2026-06-05 08:23:40','2026-06-05 08:23:40');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_uuid` varchar(100) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `user_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `device_id` varchar(200) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_type` enum('guest','registered') DEFAULT 'guest',
  `profile_completed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_uuid` (`user_uuid`),
  UNIQUE KEY `user_name` (`user_name`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_uuid` (`user_uuid`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'USER_1780157212646_eiidio3o','Ramachandiran123','ram@1234','mail2rams91@gmail.com','9629939175','iPhone_23B85','192.168.1.3','guest',1,'2026-05-30 16:06:52','2026-06-05 08:23:40','2026-06-05 08:23:40'),(3,'USER_1780161847121_3wme09e9',NULL,NULL,NULL,NULL,'unknown_1780161847115','122.164.82.34','guest',0,'2026-05-30 17:24:07','2026-05-30 17:24:07','2026-05-30 17:24:07'),(4,'USER_1780161868307_8x9qacli',NULL,NULL,NULL,NULL,'unknown_1780161868301','122.164.82.34','guest',0,'2026-05-30 17:24:28','2026-05-30 17:24:28','2026-05-30 17:24:28'),(5,'USER_1780161870186_ysz92w3b',NULL,NULL,NULL,NULL,'unknown_1780161870182','122.164.82.34','guest',0,'2026-05-30 17:24:30','2026-05-30 17:24:30','2026-05-30 17:24:30'),(6,'USER_1780161871047_0eab8o4u',NULL,NULL,NULL,NULL,'unknown_1780161871035','122.164.82.34','guest',0,'2026-05-30 17:24:31','2026-05-30 17:24:31','2026-05-30 17:24:31'),(7,'USER_1780161871247_qqqix2nb',NULL,NULL,NULL,NULL,'unknown_1780161871240','122.164.82.34','guest',0,'2026-05-30 17:24:31','2026-05-30 17:24:31','2026-05-30 17:24:31'),(8,'USER_1780161872042_8st7slhw',NULL,NULL,NULL,NULL,'unknown_1780161872039','122.164.82.34','guest',0,'2026-05-30 17:24:32','2026-05-30 17:24:32','2026-05-30 17:24:32'),(9,'USER_1780161879885_yqc1carz',NULL,NULL,NULL,NULL,'unknown_1780161879879','122.164.82.34','guest',0,'2026-05-30 17:24:39','2026-05-30 17:24:39','2026-05-30 17:24:39'),(10,'USER_1780161880131_cru62mif',NULL,NULL,NULL,NULL,'unknown_1780161880128','122.164.82.34','guest',0,'2026-05-30 17:24:40','2026-05-30 17:24:40','2026-05-30 17:24:40'),(11,'USER_1780161880997_4cob5mqn',NULL,NULL,NULL,NULL,'unknown_1780161880986','122.164.82.34','guest',0,'2026-05-30 17:24:41','2026-05-30 17:24:41','2026-05-30 17:24:41'),(12,'USER_1780161881231_3og5h6sk',NULL,NULL,NULL,NULL,'unknown_1780161881225','122.164.82.34','guest',0,'2026-05-30 17:24:41','2026-05-30 17:24:41','2026-05-30 17:24:41'),(13,'USER_1780161892800_r2yooo00',NULL,NULL,NULL,NULL,'unknown_1780161892771','122.164.82.34','guest',0,'2026-05-30 17:24:52','2026-05-30 17:24:52','2026-05-30 17:24:52'),(14,'USER_1780161893138_g9v0wi57',NULL,NULL,NULL,NULL,'unknown_1780161893134','122.164.82.34','guest',0,'2026-05-30 17:24:53','2026-05-30 17:24:53','2026-05-30 17:24:53'),(15,'USER_1780161912158_d0ngtugb',NULL,NULL,NULL,NULL,'unknown_1780161912143','122.164.82.34','guest',0,'2026-05-30 17:25:12','2026-05-30 17:25:12','2026-05-30 17:25:12'),(16,'USER_1780161912423_aifg1fz0',NULL,NULL,NULL,NULL,'unknown_1780161912403','122.164.82.34','guest',0,'2026-05-30 17:25:12','2026-05-30 17:25:12','2026-05-30 17:25:12'),(17,'USER_1780161917355_ipbciopi',NULL,NULL,NULL,NULL,'unknown_1780161917349','122.164.82.34','guest',0,'2026-05-30 17:25:17','2026-05-30 17:25:17','2026-05-30 17:25:17'),(18,'USER_1780161939020_1i7a6lkd',NULL,NULL,NULL,NULL,'unknown_1780161939012','122.164.82.34','guest',0,'2026-05-30 17:25:39','2026-05-30 17:25:39','2026-05-30 17:25:39'),(19,'USER_1780161957038_olswtv4o',NULL,NULL,NULL,NULL,'unknown_1780161957031','122.164.82.34','guest',0,'2026-05-30 17:25:57','2026-05-30 17:25:57','2026-05-30 17:25:57'),(20,'USER_1780643683144_8orwv47b','Vina andriod','vina Samsung','dhanamnimalan@gmail.com','9789376035','Galaxy A17 5G_BP2A.250605.031.A3.A176BXXS5BZBF','192.168.1.7','guest',1,'2026-06-05 07:14:43','2026-06-05 08:03:53','2026-06-05 08:03:53'),(21,'USER_1780645002189_eyhdcbdk',NULL,NULL,NULL,NULL,'unknown_1780645002184','122.164.83.98','guest',0,'2026-06-05 07:36:42','2026-06-05 07:36:42','2026-06-05 07:36:42'),(22,'USER_1780645003219_hmhg8ja3',NULL,NULL,NULL,NULL,'unknown_1780645003210','122.164.83.98','guest',0,'2026-06-05 07:36:43','2026-06-05 07:36:43','2026-06-05 07:36:43'),(23,'USER_1780645237800_sh5wvuom',NULL,NULL,NULL,NULL,'unknown_1780645237795','122.164.83.98','guest',0,'2026-06-05 07:40:37','2026-06-05 07:40:37','2026-06-05 07:40:37'),(24,'USER_1780645240845_bghix9ei',NULL,NULL,NULL,NULL,'unknown_1780645240842','122.164.83.98','guest',0,'2026-06-05 07:40:40','2026-06-05 07:40:40','2026-06-05 07:40:40'),(25,'USER_1780645245990_52s4xdar',NULL,NULL,NULL,NULL,'unknown_1780645245987','122.164.83.98','guest',0,'2026-06-05 07:40:45','2026-06-05 07:40:45','2026-06-05 07:40:45'),(26,'USER_1780645247089_97fsppnh',NULL,NULL,NULL,NULL,'unknown_1780645247086','122.164.83.98','guest',0,'2026-06-05 07:40:47','2026-06-05 07:40:47','2026-06-05 07:40:47'),(27,'USER_1780645248171_ih12vfjr',NULL,NULL,NULL,NULL,'unknown_1780645248167','122.164.83.98','guest',0,'2026-06-05 07:40:48','2026-06-05 07:40:48','2026-06-05 07:40:48'),(28,'USER_1780645248643_zhver1j9',NULL,NULL,NULL,NULL,'unknown_1780645248641','122.164.83.98','guest',0,'2026-06-05 07:40:48','2026-06-05 07:40:48','2026-06-05 07:40:48'),(29,'USER_1780645249788_vqtd0csd',NULL,NULL,NULL,NULL,'unknown_1780645249785','122.164.83.98','guest',0,'2026-06-05 07:40:49','2026-06-05 07:40:49','2026-06-05 07:40:49'),(30,'USER_1780645250242_y7up0qbx',NULL,NULL,NULL,NULL,'unknown_1780645250240','122.164.83.98','guest',0,'2026-06-05 07:40:50','2026-06-05 07:40:50','2026-06-05 07:40:50'),(31,'USER_1780645250711_b7tyysan',NULL,NULL,NULL,NULL,'unknown_1780645250709','122.164.83.98','guest',0,'2026-06-05 07:40:50','2026-06-05 07:40:50','2026-06-05 07:40:50'),(32,'USER_1780645251639_hf4688lf',NULL,NULL,NULL,NULL,'unknown_1780645251635','122.164.83.98','guest',0,'2026-06-05 07:40:51','2026-06-05 07:40:51','2026-06-05 07:40:51'),(33,'USER_1780645252093_h2w9vec2',NULL,NULL,NULL,NULL,'unknown_1780645252091','122.164.83.98','guest',0,'2026-06-05 07:40:52','2026-06-05 07:40:52','2026-06-05 07:40:52'),(34,'USER_1780645259464_49hk6heo',NULL,NULL,NULL,NULL,'unknown_1780645259461','122.164.83.98','guest',0,'2026-06-05 07:40:59','2026-06-05 07:40:59','2026-06-05 07:40:59'),(35,'USER_1780645521465_49jkxmzr',NULL,NULL,NULL,NULL,'unknown_1780645521461','122.164.83.98','guest',0,'2026-06-05 07:45:21','2026-06-05 07:45:21','2026-06-05 07:45:21'),(36,'USER_1780645571710_7u6fb84s','lenovo','len laptop check','lenovo@gmail.com','8329483274','unknown_1780645571705','122.164.83.98','guest',1,'2026-06-05 07:46:11','2026-06-05 07:46:59','2026-06-05 07:46:11'),(37,'USER_1780645622549_ykp3kxcl',NULL,NULL,NULL,NULL,'unknown_1780645622544','122.164.83.98','guest',0,'2026-06-05 07:47:02','2026-06-05 07:47:02','2026-06-05 07:47:02'),(38,'USER_1780645724014_s7ig7mt0',NULL,NULL,NULL,NULL,'unknown_1780645724011','122.164.83.98','guest',0,'2026-06-05 07:48:44','2026-06-05 07:48:44','2026-06-05 07:48:44'),(39,'USER_1780645737737_w1dtia68',NULL,NULL,NULL,NULL,'unknown_1780645737732','122.164.83.98','guest',0,'2026-06-05 07:48:57','2026-06-05 07:48:57','2026-06-05 07:48:57'),(40,'USER_1780645761597_xpbx447r',NULL,NULL,NULL,NULL,'unknown_1780645761593','122.164.83.98','guest',0,'2026-06-05 07:49:21','2026-06-05 07:49:21','2026-06-05 07:49:21'),(41,'USER_1780646638408_9wrecod9',NULL,NULL,NULL,NULL,'unknown_1780646638401','122.164.83.98','guest',0,'2026-06-05 08:03:58','2026-06-05 08:03:58','2026-06-05 08:03:58'),(42,'USER_1780646649997_f1ax6toh',NULL,NULL,NULL,NULL,'unknown_1780646649992','122.164.83.98','guest',0,'2026-06-05 08:04:09','2026-06-05 08:04:09','2026-06-05 08:04:09'),(43,'USER_1780646652811_ut9ln1gn',NULL,NULL,NULL,NULL,'unknown_1780646652808','122.164.83.98','guest',0,'2026-06-05 08:04:12','2026-06-05 08:04:12','2026-06-05 08:04:12'),(44,'USER_1780646703604_xpume5zc',NULL,NULL,NULL,NULL,'unknown_1780646703600','122.164.83.98','guest',0,'2026-06-05 08:05:03','2026-06-05 08:05:03','2026-06-05 08:05:03'),(45,'USER_1780647919916_u87daon1',NULL,NULL,NULL,NULL,'unknown_1780647919909','122.164.83.98','guest',0,'2026-06-05 08:25:19','2026-06-05 08:25:19','2026-06-05 08:25:19'),(46,'USER_1780650359474_giul67ij',NULL,NULL,NULL,NULL,'unknown_1780650353909','122.164.83.98','guest',0,'2026-06-05 09:05:59','2026-06-05 09:05:59','2026-06-05 09:05:59'),(47,'USER_1780650372751_z3ai26co',NULL,NULL,NULL,NULL,'unknown_1780650372746','122.164.83.98','guest',0,'2026-06-05 09:06:12','2026-06-05 09:06:12','2026-06-05 09:06:12'),(48,'USER_1780650391494_s5u5t4ar',NULL,NULL,NULL,NULL,'unknown_1780650391490','122.164.83.98','guest',0,'2026-06-05 09:06:31','2026-06-05 09:06:31','2026-06-05 09:06:31'),(49,'USER_1780650392515_znsdic3i',NULL,NULL,NULL,NULL,'unknown_1780650392513','122.164.83.98','guest',0,'2026-06-05 09:06:32','2026-06-05 09:06:32','2026-06-05 09:06:32'),(50,'USER_1780650393138_2da6aej3',NULL,NULL,NULL,NULL,'unknown_1780650393134','122.164.83.98','guest',0,'2026-06-05 09:06:33','2026-06-05 09:06:33','2026-06-05 09:06:33'),(51,'USER_1780650404153_2x2kzbsm',NULL,NULL,NULL,NULL,'unknown_1780650404147','122.164.83.98','guest',0,'2026-06-05 09:06:44','2026-06-05 09:06:44','2026-06-05 09:06:44'),(52,'USER_1780650468685_da0tlyvc',NULL,NULL,NULL,NULL,'unknown_1780650466959','122.164.83.98','guest',0,'2026-06-05 09:07:48','2026-06-05 09:07:48','2026-06-05 09:07:48'),(53,'USER_1780726184292_l798nrb3',NULL,NULL,NULL,NULL,'unknown_1780726183939','122.164.85.205','guest',0,'2026-06-06 06:09:44','2026-06-06 06:09:44','2026-06-06 06:09:44'),(54,'USER_1780726208317_kgy4xk4r',NULL,NULL,NULL,NULL,'unknown_1780726208312','122.164.85.205','guest',0,'2026-06-06 06:10:08','2026-06-06 06:10:08','2026-06-06 06:10:08');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cust_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `cust_deviceid` varchar(255) DEFAULT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_category` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `product_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`cust_id`,`product_id`),
  KEY `idx_cust_id` (`cust_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
INSERT INTO `wishlist` VALUES (26,'USER_1780157212646_eiidio3o','192.168.1.3','iPhone',45,'next gen','Trending',250.00,'https://api.vinatrix-api.workers.dev/uploads/1780514218218-879289173.png','2026-06-03 19:40:17'),(27,'USER_1780643683144_8orwv47b','192.168.1.7','Galaxy A17 5G',40,'pant runtime ','Pant',250.00,'https://api.vinatrix-api.workers.dev/uploads/1779949014648-314172556.png','2026-06-05 07:16:07'),(28,'USER_1780643683144_8orwv47b','192.168.1.7','Galaxy A17 5G',38,'pants vina','Pant',980.00,'https://api.vinatrix-api.workers.dev/uploads/1779860642833-777699232.png','2026-06-05 07:16:09'),(29,'USER_1780645521465_49jkxmzr','122.164.83.98','unknown',46,'White t shirt','Tshirt',250.00,'https://api.vinatrix-api.workers.dev/uploads/1780643911891-291017352.png','2026-06-05 07:45:48');
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `wishlist_count`
--

DROP TABLE IF EXISTS `wishlist_count`;
/*!50001 DROP VIEW IF EXISTS `wishlist_count`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wishlist_count` AS SELECT 
 1 AS `cust_id`,
 1 AS `count`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `wishlist_count`
--

/*!50001 DROP VIEW IF EXISTS `wishlist_count`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `wishlist_count` AS select `wishlist`.`cust_id` AS `cust_id`,count(0) AS `count` from `wishlist` group by `wishlist`.`cust_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-06 17:55:02
