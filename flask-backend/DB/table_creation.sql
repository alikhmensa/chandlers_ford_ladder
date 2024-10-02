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

CREATE TABLE challenge_requests (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    challenger_id INT NOT NULL,
    challenged_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('accepted', 'rejected') DEFAULT NULL,
    response_reason VARCHAR(255),
    response_time DATETIME
);
ALTER TABLE challenge_requests
MODIFY status ENUM('accepted', 'rejected', 'cancelled') DEFAULT NULL;


CREATE TABLE matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    white_user_id INT NOT NULL,
    black_user_id INT NOT NULL,
    result ENUM('white_win', 'black_win', 'draw') NOT NULL,
    challenge_id INT,
    played_at DATE NOT NULL,
    FOREIGN KEY (white_user_id) REFERENCES users(user_id),
    FOREIGN KEY (black_user_id) REFERENCES users(user_id),
    FOREIGN KEY (challenge_id) REFERENCES challenge_requests(challenge_id)
);




INSERT INTO matches (white_user_id, black_user_id, result, challenge_id, played_at)
VALUES 
    (12, 13, 'white_win', 5, '2024-10-01'),
    (12, 14, 'draw', 6, '2024-10-02'),
    (12, 15, 'black_win', 7, '2024-10-03');
    (12, 16, 'black_win', 7, '2024-10-03');
