CREATE TABLE `Submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`topic` varchar(50) NOT NULL,
	`problem_number` int NOT NULL,
	`submitted_at` timestamp DEFAULT (now()),
	CONSTRAINT `Submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `Submissions` ADD CONSTRAINT `Submissions_user_id_Users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE cascade ON UPDATE no action;