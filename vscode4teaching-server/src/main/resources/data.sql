SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


INSERT INTO `course` (`id`, `create_date_time`, `name`, `update_date_time`) VALUES
(7, CURRENT_TIMESTAMP(), 'Spring Boot Course', CURRENT_TIMESTAMP()),
(8, CURRENT_TIMESTAMP(), 'Angular Course', CURRENT_TIMESTAMP()),
(9, CURRENT_TIMESTAMP(), 'VSCode Extension API Course', CURRENT_TIMESTAMP());

INSERT INTO `course_users_in_course` (`courses_id`, `users_in_course_id`) VALUES
(7, 3),
(7, 4),
(7, 5),
(7, 6),
(8, 3),
(8, 4),
(8, 5),
(8, 6),
(9, 3),
(9, 4),
(9, 5),
(9, 6);

INSERT INTO `exercise` (`id`, `create_date_time`, `name`, `update_date_time`, `course_id`) VALUES
(10, CURRENT_TIMESTAMP(), 'Exercise 1', CURRENT_TIMESTAMP(), 7),
(11, CURRENT_TIMESTAMP(), 'Exercise 2', CURRENT_TIMESTAMP(), 7),
(12, CURRENT_TIMESTAMP(), 'Exercise 3', CURRENT_TIMESTAMP(), 7),
(13, CURRENT_TIMESTAMP(), 'Exercise 4', CURRENT_TIMESTAMP(), 7),
(14, CURRENT_TIMESTAMP(), 'Exercise 5', CURRENT_TIMESTAMP(), 7),
(15, CURRENT_TIMESTAMP(), 'Exercise 1', CURRENT_TIMESTAMP(), 8),
(16, CURRENT_TIMESTAMP(), 'Exercise 2', CURRENT_TIMESTAMP(), 8),
(17, CURRENT_TIMESTAMP(), 'Exercise 3', CURRENT_TIMESTAMP(), 8),
(18, CURRENT_TIMESTAMP(), 'Exercise 4', CURRENT_TIMESTAMP(), 8),
(19, CURRENT_TIMESTAMP(), 'Exercise 5', CURRENT_TIMESTAMP(), 8),
(20, CURRENT_TIMESTAMP(), 'Exercise 1', CURRENT_TIMESTAMP(), 9),
(21, CURRENT_TIMESTAMP(), 'Exercise 2', CURRENT_TIMESTAMP(), 9),
(22, CURRENT_TIMESTAMP(), 'Exercise 3', CURRENT_TIMESTAMP(), 9),
(23, CURRENT_TIMESTAMP(), 'Exercise 4', CURRENT_TIMESTAMP(), 9),
(24, CURRENT_TIMESTAMP(), 'Exercise 5', CURRENT_TIMESTAMP(), 9);

INSERT INTO `hibernate_sequence` (`next_val`) VALUES
(25),
(25),
(25),
(25),
(25);

INSERT INTO `role` (`id`, `role_name`) VALUES
(1, 'ROLE_STUDENT'),
(2, 'ROLE_TEACHER');

INSERT INTO `user` (`id`, `create_date_time`, `email`, `last_name`, `name`, `password`, `update_date_time`, `username`) VALUES
(3, CURRENT_TIMESTAMP(), 'johndoe@teacher.com', 'Doe', 'John', '$2a$10$j4YZ/DBIcBF6LhjhLdtQROUelV./eXesG22RdAuEqHUkZm6ry07V2', CURRENT_TIMESTAMP(), 'johndoe'),
(4, CURRENT_TIMESTAMP(), 'johndoejr@student.com', 'Doe Jr 1', 'John', '$2a$10$C7LX/6U9OqhZAIQAw6Un2.tee2GYhg4FvRtdoYh9JE9tetZd6ooJu', CURRENT_TIMESTAMP(), 'johndoejr'),
(5, CURRENT_TIMESTAMP(), 'johndoejr2@student.com', 'Doe Jr 2', 'John', '$2a$10$U.DYQQc1DzHRvkPz63VpT.nBzUsa5IwfhzInZIL3h.xqMe2rcbcfO', CURRENT_TIMESTAMP(), 'johndoejr2'),
(6, CURRENT_TIMESTAMP(), 'johndoejr3@student.com', 'Doe Jr 3', 'John', '$2a$10$rFa2iNP4FmeGcA4X.4XnbePvr1iX9mr6HoBrhBG0MmUy5UVlq8R6W', CURRENT_TIMESTAMP(), 'johndoejr3');

INSERT INTO `user_roles` (`user_id`, `roles_id`) VALUES
(3, 1),
(3, 2),
(4, 1),
(5, 1),
(6, 1);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
