CREATE TABLE `Users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `Users_id` PRIMARY KEY(`id`),
	CONSTRAINT `Users_username_unique` UNIQUE(`username`),
	CONSTRAINT `Users_email_unique` UNIQUE(`email`)
);
