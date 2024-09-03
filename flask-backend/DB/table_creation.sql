Drop table if exists users;

CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

Drop table if exists tournaments;
CREATE TABLE `tournaments` (
  `tournament_id` INT NOT NULL AUTO_INCREMENT,
  `tournament_name` VARCHAR(255) NOT NULL,
  `start_date` DATE,
  `end_date` DATE,
  PRIMARY KEY (`tournament_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

Drop table if exists user_tournament;
CREATE TABLE `user_tournament` (
  `user_tournament_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `tournament_id` INT NOT NULL,
  `rank` INT DEFAULT NULL,
  `points` INT DEFAULT 0,
  `games_played` INT DEFAULT 0,  
  `win` INT DEFAULT 0,
  `lose` INT DEFAULT 0,
  `draw` INT DEFAULT 0,
  PRIMARY KEY (`user_tournament_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
