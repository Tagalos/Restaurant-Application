const mariadb = require("mariadb");
require("dotenv").config();

const pool = mariadb.createPool({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
module.exports = pool;

// SQL Database Connection 

// CREATE TABLE `reservations` (
//  `reservation_id` INT NOT NULL AUTO_INCREMENT,
//  `user_id`        INT NOT NULL,
//  `restaurant_id`  INT NOT NULL,
//  `reservation_date` DATE NOT NULL,
//  `reservation_time` TIME NOT NULL,
//  `people_count`   INT NOT NULL,
//  PRIMARY KEY (`reservation_id`),
//  KEY `fk_user` (`user_id`),
//  KEY `fk_restaurant` (`restaurant_id`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

// CREATE TABLE `restaurants` (
//  `id`                     INT NOT NULL AUTO_INCREMENT,
//  `name`                   VARCHAR(255) NOT NULL,
//  `address`                VARCHAR(255) NOT NULL,
//  `restaurant_description` TEXT,
//  `daily_limit`            INT NOT NULL DEFAULT 0,
//  PRIMARY KEY (`id`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

// CREATE TABLE `users` (
//  `id` INT(11) NOT NULL AUTO_INCREMENT,
//  `name` VARCHAR(100) NOT NULL,
//  `email` VARCHAR(100) NOT NULL,
//  `password` VARCHAR(255) NOT NULL,
//  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//  PRIMARY KEY (`id`),
//  UNIQUE KEY `uq_users_email` (`email`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;