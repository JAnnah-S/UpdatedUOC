-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 10, 2026 at 08:32 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `uoc`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` varchar(11) NOT NULL,
  `user_id` varchar(11) NOT NULL,
  `adminName` varchar(150) NOT NULL,
  `position` varchar(100) NOT NULL,
  `department` varchar(150) NOT NULL,
  `office_phone` varchar(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `user_id`, `adminName`, `position`, `department`, `office_phone`, `created_at`) VALUES
('ADM001', 'SF001', 'Dr. Siti Aminah binti Ahmad', 'Head of Student Affairs', 'Faculty of Computing', '09-7362100', '2026-06-07 17:50:11'),
('ADM002', 'CB24068', 'MOHAMAD AKMAL', 'FK Staff', 'Faculty of Computing', '010-000000', '2026-06-10 22:58:48'),
('ADM003', 'CB24084', 'HASLIZA BINTI MAD SAID', 'FK Staff', 'Faculty of Computing', '010-3393392', '2026-06-10 23:01:36');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` varchar(10) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `event_id` int(11) NOT NULL,
  `checkin_time` datetime DEFAULT NULL,
  `attendance_status` enum('Present','Late','Absent') NOT NULL,
  `attendance_points` int(11) DEFAULT 0,
  `is_volunteer` tinyint(1) DEFAULT 0,
  `location_stamp` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `student_id`, `event_id`, `checkin_time`, `attendance_status`, `attendance_points`, `is_volunteer`, `location_stamp`) VALUES
('ATT1001', 'CB24001', 1, '2026-06-10 21:54:41', 'Present', 10, 0, 'Location permission denied. Venue stamp can be typed manually.'),
('ATT1002', 'CB24001', 2, '2026-06-10 00:09:44', 'Present', 10, 0, NULL),
('ATT1003', 'CB24001', 3, '2026-06-10 00:09:44', 'Late', 5, 0, NULL),
('ATT1004', 'CB24002', 1, '2026-06-10 00:09:44', 'Present', 15, 1, NULL),
('ATT1005', 'CB24002', 2, '2026-06-10 00:09:44', 'Present', 15, 1, NULL),
('ATT1006', 'CB24002', 3, '2026-06-10 00:09:44', 'Present', 10, 0, NULL),
('ATT1007', 'CB24002', 4, '2026-06-10 00:09:44', 'Present', 15, 1, NULL),
('ATT1008', 'CB24002', 5, '2026-06-10 00:09:44', 'Present', 10, 0, NULL),
('ATT1009', 'CB24003', 1, '2026-06-10 00:09:44', 'Present', 10, 0, NULL),
('ATT1010', 'CB24003', 2, '2026-06-10 00:09:44', 'Present', 10, 0, NULL),
('ATT1011', 'CB24003', 3, '2026-06-10 00:09:44', 'Late', 5, 0, NULL),
('ATT1012', 'CB24003', 4, '2026-06-10 00:09:44', 'Present', 10, 0, NULL),
('ATT1013', 'CB24004', 1, '2026-06-10 00:09:44', 'Present', 15, 1, NULL),
('ATT1014', 'CB24004', 2, '2026-06-10 00:09:44', 'Present', 10, 0, NULL),
('ATT1015', 'CB24004', 3, '2026-06-10 00:09:44', 'Present', 15, 1, NULL),
('ATT1016', 'CB24004', 4, '2026-06-10 00:09:44', 'Present', 15, 1, NULL),
('ATT1017', 'CB24005', 1, '2026-06-10 00:09:44', 'Present', 15, 1, NULL),
('ATT1018', 'CB24005', 2, '2026-06-10 00:09:44', 'Present', 15, 1, NULL),
('ATT1019', 'CB24005', 3, '2026-06-10 00:09:44', 'Present', 15, 1, NULL),
('ATT1020', 'CB24005', 4, '2026-06-10 00:09:44', 'Present', 15, 1, NULL),
('ATT1021', 'CB24005', 5, '2026-06-10 00:09:44', 'Present', 15, 1, NULL),
('ATT1022', 'CB24006', 1, '2026-06-10 21:55:04', 'Late', 5, 0, 'Location permission denied. Venue stamp can be typed manually.'),
('ATT1023', 'CB24006', 2, '2026-06-10 00:09:44', 'Absent', -10, 0, NULL),
('ATT1024', 'CB24015', 1, '2026-06-10 00:09:44', 'Late', 5, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `club`
--

CREATE TABLE `club` (
  `club_id` varchar(11) NOT NULL,
  `club_name` varchar(150) NOT NULL,
  `club_code` varchar(20) NOT NULL,
  `club_description` text DEFAULT NULL,
  `club_logo` varchar(255) DEFAULT NULL,
  `advisor_name` varchar(150) DEFAULT NULL,
  `advisor_email` varchar(150) DEFAULT NULL,
  `advisor_phone` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_by` varchar(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `club`
--

INSERT INTO `club` (`club_id`, `club_name`, `club_code`, `club_description`, `club_logo`, `advisor_name`, `advisor_email`, `advisor_phone`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
('CLB001', 'Software Engineering Club', 'SEC', 'Club for software engineering students to learn and collaborate', NULL, 'Dr. Ahmad Tarmizi', 'ahmad.tarmizi@umpsa.edu.my', '09-7362102', 'active', 'SF001', '2026-06-07 17:50:11', '2026-06-07 17:50:11'),
('CLB002', 'Cybersecurity Club', 'CC', 'Focus on cybersecurity awareness and CTF competitions', NULL, 'Ts. Nurul Huda', '', '09-7362103', 'active', 'SF001', '2026-06-07 17:50:11', '2026-06-11 02:21:26'),
('CLB003', 'UI/UX Design Club', 'UIDC', 'Design thinking and user experience workshops', NULL, 'Pn. Salina Abdul', 'salina@umpsa.edu.my', '09-7362104', 'active', 'SF001', '2026-06-07 17:50:11', '2026-06-07 17:50:11'),
('CLB004', 'Sports & Coding Club', 'SCC', 'Sports activities combined with coding challenges', NULL, 'En. Faizal Ismail', 'faizal.ismail@umpsa.edu.my', '09-7362105', 'active', 'SF001', '2026-06-07 17:50:11', '2026-06-07 17:50:11'),
('CLB005', 'Artificial Intelligence Club', 'AIC', 'Club focusing on AI, machine learning, and deep learning technologies. Organizes workshops, hackathons, and research talks.', NULL, 'Dr. Sarah Khalid', '', '09-7362106', 'active', 'SF001', '2026-06-09 23:42:32', '2026-06-11 02:21:22'),
('CLB006', 'Mobile Application Club', 'MAC', 'Club for mobile app development enthusiasts. Covers Android, iOS, Flutter, and React Native. Regular coding sessions and app competitions.', NULL, 'Ts. Azman Hafiz', 'azman.hafiz@umpsa.edu.my', '09-7362107', 'active', 'SF001', '2026-06-09 23:42:32', '2026-06-09 23:42:32'),
('CLB007', 'Data Science Club', 'DSC', 'Club dedicated to data analytics, visualization, big data, and statistics. Hands-on projects and industry talks.', NULL, 'Pn. Rohana Abdullah', 'rohana.abdullah@umpsa.edu.my', '09-7362108', 'active', 'SF001', '2026-06-09 23:42:32', '2026-06-09 23:42:32'),
('CLB009', 'HASLIZA FANS', 'HF', 'Fans', NULL, 'HASLIZA MOHAMAD', '', NULL, 'inactive', 'CB24068', '2026-06-10 23:12:57', '2026-06-10 23:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `club_committee`
--

CREATE TABLE `club_committee` (
  `committee_id` varchar(11) NOT NULL,
  `club_id` varchar(11) NOT NULL,
  `user_id` varchar(11) NOT NULL,
  `position` enum('President','Vice President','Secretary','Treasurer','Committee Member') NOT NULL,
  `joined_date` date NOT NULL,
  `academic_year` varchar(10) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `club_committee`
--

INSERT INTO `club_committee` (`committee_id`, `club_id`, `user_id`, `position`, `joined_date`, `academic_year`, `status`) VALUES
('COM001', 'CLB001', 'FK2008', 'President', '2026-01-15', '2025/2026', 'active'),
('COM002', 'CLB001', 'FK1002', 'Secretary', '2026-01-15', '2025/2026', 'active'),
('COM003', 'CLB002', 'FK2004', 'President', '2026-01-10', '2025/2026', 'active'),
('COM004', 'CLB002', 'FK1035', 'Committee Member', '2026-01-10', '2025/2026', 'active'),
('COM005', 'CLB003', 'FK1036', 'Vice President', '2026-02-01', '2025/2026', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE `event` (
  `event_id` int(11) NOT NULL,
  `event_title` varchar(150) NOT NULL,
  `event_description` text NOT NULL,
  `event_date` date NOT NULL,
  `event_time` time NOT NULL,
  `venue` varchar(200) NOT NULL,
  `max_participants` int(6) NOT NULL,
  `current_count` int(6) NOT NULL DEFAULT 0,
  `status` enum('active','cancelled','completed') NOT NULL DEFAULT 'active',
  `club_id` varchar(11) NOT NULL,
  `committee_id` int(11) NOT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `event_type` varchar(60) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event`
--

INSERT INTO `event` (`event_id`, `event_title`, `event_description`, `event_date`, `event_time`, `venue`, `max_participants`, `current_count`, `status`, `club_id`, `committee_id`, `semester`, `event_type`) VALUES
(1, 'Web Dev Hackathon 2025', 'Annual hackathon event', '2025-11-15', '09:00:00', 'DK5, FK Building', 50, 30, 'active', 'CLB001', 1, NULL, NULL),
(2, 'Cybersecurity Awareness Talk', 'Talk on cybersecurity trends', '2025-11-22', '14:00:00', 'Auditorium A, UMPSA', 80, 40, 'active', 'CLB002', 1, NULL, NULL),
(3, 'UI/UX Design Workshop', 'Hands-on UX design session', '2025-12-05', '10:00:00', 'Lab 3, FK Building', 30, 20, 'active', 'CLB001', 1, NULL, NULL),
(4, 'Annual Sports & Coding Day', 'Sports and coding combined event', '2025-12-10', '08:00:00', 'Sports Complex, UMPSA', 100, 50, 'active', 'CLB004', 1, NULL, NULL),
(5, 'Network Security CTF', 'Capture The Flag challenge', '2026-01-20', '09:30:00', 'DK2, FK Building', 40, 40, 'completed', 'CLB002', 1, NULL, NULL),
(6, 'AI Prompt Engineering Workshop', 'Introduction to Prompt Engineering', '2026-02-15', '09:00:00', 'Lab AI 1', 60, 45, 'active', 'CLB005', 1, NULL, NULL),
(7, 'Mobile App Development Bootcamp', 'Flutter Development Training', '2026-02-22', '08:30:00', 'Lab Mobile', 50, 38, 'active', 'CLB006', 1, NULL, NULL),
(8, 'Data Analytics Seminar', 'Data Science Career Talk', '2026-03-10', '10:00:00', 'Auditorium B', 120, 2, 'active', 'CLB007', 1, NULL, NULL),
(9, 'Software Machine', 'Software Student Only', '2026-06-18', '12:00:00', 'DK1-123', 100, 0, 'active', 'CLB001', 1, '2025/2026-2', 'Workshop'),
(10, 'Software', 'Software', '2026-06-27', '23:17:00', 'DK1-123', 111, 0, 'active', 'CLB001', 1, '2025/2026-2', 'Workshop'),
(11, 'SAJA', 'SAJA', '2026-06-19', '00:30:00', 'DK1-123', 1, 1, 'active', 'CLB001', 1, '2025/2026-2', 'Workshop');

-- --------------------------------------------------------

--
-- Table structure for table `event_qr`
--

CREATE TABLE `event_qr` (
  `qr_id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `qr_token` varchar(100) DEFAULT NULL,
  `qr_expiry` datetime DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `membership`
--

CREATE TABLE `membership` (
  `membership_id` varchar(20) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `club_id` varchar(11) NOT NULL,
  `student_card_path` varchar(255) NOT NULL,
  `status` enum('Active','Pending','Expired','Rejected') NOT NULL DEFAULT 'Pending',
  `application_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `approved_by` varchar(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership`
--

INSERT INTO `membership` (`membership_id`, `student_id`, `club_id`, `student_card_path`, `status`, `application_date`, `expiry_date`, `approved_by`, `approved_at`, `remarks`) VALUES
('MEM001', 'CB24001', 'CLB001', 'uploads/matric_CB24001.pdf', 'Active', '2026-01-15', '2027-01-15', 'SF001', '2026-06-07 17:50:11', NULL),
('MEM002', 'CB24002', 'CLB002', 'uploads/matric_CB24002.pdf', 'Active', '2026-01-15', '2027-01-15', 'SF001', '2026-06-07 17:50:11', NULL),
('MEM003', 'CB24003', 'CLB001', 'uploads/matric_CB24003.pdf', 'Pending', '2026-06-01', '2027-06-01', NULL, NULL, 'Waiting for approval'),
('MEM004', 'CB24004', 'CLB003', 'uploads/matric_CB24004.pdf', 'Active', '2026-01-10', '2027-01-10', 'SF001', '2026-06-07 17:50:11', NULL),
('MEM005', 'CB24005', 'CLB002', 'uploads/matric_CB24005.pdf', 'Active', '2026-01-10', '2027-01-10', 'SF001', '2026-06-07 17:50:11', NULL),
('MBR001', 'TK24029', 'CLB010', 'admin-created', 'Active', '2026-06-11', NULL, 'CB24068', '2026-06-11 01:44:58', 'Created by admin dashboard');

-- --------------------------------------------------------

--
-- Table structure for table `registrations`
--

CREATE TABLE `registrations` (
  `registration_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `status` enum('Confirmed','Waiting','Cancelled') DEFAULT 'Confirmed',
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registrations`
--

INSERT INTO `registrations` (`registration_id`, `event_id`, `student_name`, `student_id`, `status`, `registered_at`, `registration_date`) VALUES
(1, 1, 'Nurul Aina binti Zainal', 'CB24001', 'Confirmed', '2026-06-07 09:50:11', '2026-06-07 09:50:11'),
(2, 1, 'Muhammad Haziq bin Zulkifli', 'CB24002', 'Confirmed', '2026-06-07 09:50:11', '2026-06-07 09:50:11'),
(3, 2, 'Nurul Aina binti Zainal', 'CB24001', 'Confirmed', '2026-06-07 09:50:11', '2026-06-07 09:50:11'),
(4, 2, 'Siti Rahmah binti Othman', 'CB24003', 'Cancelled', '2026-06-07 09:50:11', '2026-06-07 09:50:11'),
(5, 3, 'Khairul Anwar bin Hassan', 'CB24004', 'Confirmed', '2026-06-07 09:50:11', '2026-06-07 09:50:11'),
(6, 5, 'Muhammad Haziq bin Zulkifli', 'CB24002', 'Confirmed', '2026-06-07 09:50:11', '2026-06-07 09:50:11'),
(7, 5, 'Siti Rahmah binti Othman', 'CB24003', 'Confirmed', '2026-06-07 09:50:11', '2026-06-07 09:50:11'),
(8, 5, 'Khairul Anwar bin Hassan', 'CB24004', 'Confirmed', '2026-06-07 09:50:11', '2026-06-07 09:50:11'),
(9, 5, 'Zulaikha Nadia binti Mahmud', 'CB24005', 'Confirmed', '2026-06-07 09:50:11', '2026-06-07 09:50:11'),
(10, 1, 'Aiman Hakimi bin Azlan', 'CB24006', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(11, 1, 'Nur Syafiqah binti Ahmad', 'CB24007', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(12, 2, 'Farhan Danish bin Razak', 'CB24008', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(13, 3, 'Nurul Izzati binti Roslan', 'CB24009', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(14, 4, 'Amirul Haziq bin Salleh', 'CB24010', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(15, 6, 'Nurul Aina binti Zainal', 'CB24001', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(16, 6, 'Muhammad Haziq bin Zulkifli', 'CB24002', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(17, 7, 'Siti Rahmah binti Othman', 'CB24003', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(18, 7, 'Khairul Anwar bin Hassan', 'CB24004', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(19, 8, 'Zulaikha Nadia binti Mahmud', 'CB24005', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(20, 6, 'Siti Hajar binti Ibrahim', 'CB24011', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(21, 7, 'Muhammad Irfan bin Yusof', 'CB24012', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(22, 8, 'Nur Athirah binti Kamaruddin', 'CB24013', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(23, 6, 'Hakim Danish bin Harun', 'CB24014', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(24, 7, 'Aisyah Sofea binti Rahman', 'CB24015', 'Confirmed', '2026-06-09 16:06:10', '2026-06-09 16:06:10'),
(25, 11, 'Nurul Aina binti Zainal', 'CB24001', 'Confirmed', '2026-06-10 16:30:04', '2026-06-10 16:30:04'),
(26, 11, 'Muhammad Haziq bin Zulkifli', 'CB24002', 'Cancelled', '2026-06-10 16:30:38', '2026-06-10 16:30:38'),
(27, 11, 'Siti Rahmah binti Othman', 'CB24003', 'Cancelled', '2026-06-10 16:33:29', '2026-06-10 16:33:29'),
(28, 8, 'Khairul Anwar bin Hassan', 'CB24004', 'Cancelled', '2026-06-10 16:36:07', '2026-06-10 16:36:07'),
(29, 11, 'Khairul Anwar bin Hassan', 'CB24004', 'Cancelled', '2026-06-10 17:10:47', '2026-06-10 17:10:47'),
(30, 11, 'Khairul Anwar bin Hassan', 'CB24004', 'Cancelled', '2026-06-10 17:23:32', '2026-06-10 17:23:32'),
(31, 11, 'Khairul Anwar bin Hassan', 'CB24004', 'Cancelled', '2026-06-10 17:27:29', '2026-06-10 17:27:29'),
(32, 11, 'Zulaikha Nadia binti Mahmud', 'CB24005', 'Cancelled', '2026-06-10 17:37:35', '2026-06-10 17:37:35'),
(33, 11, 'Zulaikha Nadia binti Mahmud', 'CB24005', 'Waiting', '2026-06-10 17:38:44', '2026-06-10 17:38:44');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `student_id` varchar(20) NOT NULL,
  `user_id` varchar(11) NOT NULL,
  `student_name` varchar(150) NOT NULL,
  `programme` varchar(100) NOT NULL,
  `year_of_study` int(2) NOT NULL,
  `semester` int(1) DEFAULT 1,
  `matric_no` varchar(20) DEFAULT NULL,
  `total_points` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`student_id`, `user_id`, `student_name`, `programme`, `year_of_study`, `semester`, `matric_no`, `total_points`, `created_at`) VALUES
('CB24001', 'FK1002', 'Nurul Aina binti Zainal', 'Software Engineering', 2, 1, 'CB24001', 25, '2026-06-07 17:50:11'),
('CB24002', 'FK1035', 'Muhammad Haziq bin Zulkifli', 'Software Engineering', 2, 1, 'CB24002', 78, '2026-06-07 17:50:11'),
('CB24003', 'FK1036', 'Siti Rahmah binti Othman', 'Cybersecurity', 2, 1, 'CB24003', 32, '2026-06-07 17:50:11'),
('CB24004', 'FK1039', 'Khairul Anwar bin Hassan', 'Multimedia Software', 2, 1, 'CB24004', 55, '2026-06-07 17:50:11'),
('CB24005', 'FK1045', 'Zulaikha Nadia binti Mahmud', 'Computer System & Networking', 2, 1, 'CB24005', 89, '2026-06-07 17:50:11'),
('CB24006', 'FK1046', 'Aiman Hakimi bin Azlan', 'Software Engineering', 2, 1, 'CB24006', -5, '2026-06-07 17:50:11'),
('CB24007', 'FK1047', 'Nur Syafiqah binti Ahmad', 'Cybersecurity', 2, 1, 'CB24007', 95, '2026-06-07 17:50:11'),
('CB24008', 'FK1048', 'Farhan Danish bin Razak', 'Software Engineering', 2, 1, 'CB24008', 67, '2026-06-07 17:50:11'),
('CB24009', 'FK1049', 'Nurul Izzati binti Roslan', 'Multimedia Software', 2, 1, 'CB24009', 52, '2026-06-07 17:50:11'),
('CB24010', 'FK1050', 'Amirul Haziq bin Salleh', 'Computer System & Networking', 2, 1, 'CB24010', 28, '2026-06-07 17:50:11'),
('CB24011', 'FK1051', 'Siti Hajar binti Ibrahim', 'Cybersecurity', 2, 1, 'CB24011', 81, '2026-06-07 17:50:11'),
('CB24012', 'FK1052', 'Muhammad Irfan bin Yusof', 'Software Engineering', 2, 1, 'CB24012', 44, '2026-06-07 17:50:11'),
('CB24013', 'FK1053', 'Nur Athirah binti Kamaruddin', 'Software Engineering', 2, 1, 'CB24013', 73, '2026-06-07 17:50:11'),
('CB24014', 'FK1054', 'Hakim Danish bin Harun', 'Cybersecurity', 2, 1, 'CB24014', 60, '2026-06-07 17:50:11'),
('CB24015', 'FK1055', 'Aisyah Sofea binti Rahman', 'Computer System & Networking', 2, 1, 'CB24015', 12, '2026-06-07 17:50:11'),
('TK24029', 'TK24029', 'ANJE GEBU', 'Software Engineering', 1, 1, 'TK24029', 0, '2026-06-11 01:44:58');

-- --------------------------------------------------------

--
-- Table structure for table `student_points`
--

CREATE TABLE `student_points` (
  `point_id` varchar(10) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `event_id` int(11) NOT NULL,
  `points_earned` int(11) NOT NULL,
  `date_awarded` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_points`
--

INSERT INTO `student_points` (`point_id`, `student_id`, `event_id`, `points_earned`, `date_awarded`) VALUES
('PT001', 'CB24001', 1, 10, '2026-06-10 21:54:41'),
('PT002', 'CB24001', 2, 10, '2026-06-10 00:10:07'),
('PT003', 'CB24001', 3, 5, '2026-06-10 00:10:07'),
('PT004', 'CB24002', 1, 15, '2026-06-10 00:10:07'),
('PT005', 'CB24002', 2, 15, '2026-06-10 00:10:07'),
('PT006', 'CB24002', 3, 10, '2026-06-10 00:10:07'),
('PT007', 'CB24002', 4, 15, '2026-06-10 00:10:07'),
('PT008', 'CB24002', 5, 10, '2026-06-10 00:10:07'),
('PT009', 'CB24003', 1, 10, '2026-06-10 00:10:07'),
('PT010', 'CB24003', 2, 10, '2026-06-10 00:10:07'),
('PT011', 'CB24003', 3, 5, '2026-06-10 00:10:07'),
('PT012', 'CB24003', 4, 10, '2026-06-10 00:10:07'),
('PT013', 'CB24004', 1, 15, '2026-06-10 00:10:07'),
('PT014', 'CB24004', 2, 10, '2026-06-10 00:10:07'),
('PT015', 'CB24004', 3, 15, '2026-06-10 00:10:07'),
('PT016', 'CB24004', 4, 15, '2026-06-10 00:10:07'),
('PT017', 'CB24005', 1, 15, '2026-06-10 00:10:07'),
('PT018', 'CB24005', 2, 15, '2026-06-10 00:10:07'),
('PT019', 'CB24005', 3, 15, '2026-06-10 00:10:07'),
('PT020', 'CB24005', 4, 15, '2026-06-10 00:10:07'),
('PT021', 'CB24005', 5, 15, '2026-06-10 00:10:07'),
('PT022', 'CB24006', 1, 5, '2026-06-10 21:55:04'),
('PT023', 'CB24006', 2, -10, '2026-06-10 00:10:07'),
('PT024', 'CB24015', 1, 5, '2026-06-10 00:10:07');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` varchar(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','committee','student') NOT NULL DEFAULT 'student',
  `profile_photo` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `username`, `password`, `full_name`, `email`, `phone`, `role`, `profile_photo`, `status`, `created_at`, `updated_at`) VALUES
('SF001', 'admin01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Siti Aminah binti Ahmad', 'admin@umpsa.edu.my', NULL, 'admin', NULL, 'active', '2026-06-07 16:20:49', '2026-06-07 16:20:49'),
('FK2008', 'committee01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ahmad Firdaus bin Razak', 'firdaus@student.umpsa.edu.my', NULL, 'committee', NULL, 'active', '2026-06-07 16:20:49', '2026-06-07 16:20:49'),
('FK2004', 'committee02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nurul Hazwani binti Ismail', 'hazwani@student.umpsa.edu.my', NULL, 'committee', NULL, 'active', '2026-06-07 16:20:49', '2026-06-07 16:20:49'),
('FK1002', 'student01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nurul Aina binti Zainal', 'aina@student.umpsa.edu.my', NULL, 'student', NULL, 'active', '2026-06-07 16:20:49', '2026-06-07 16:20:49'),
('FK1035', 'student02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Muhammad Haziq bin Zulkifli', 'haziq@student.umpsa.edu.my', NULL, 'student', NULL, 'active', '2026-06-07 16:20:49', '2026-06-07 16:20:49'),
('FK1036', 'student03', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Siti Rahmah binti Othman', 'rahmah@student.umpsa.edu.my', NULL, 'student', NULL, 'active', '2026-06-07 16:20:49', '2026-06-07 16:20:49'),
('FK1039', 'student04', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Khairul Anwar bin Hassan', 'khairul@student.umpsa.edu.my', NULL, 'student', NULL, 'active', '2026-06-07 16:20:49', '2026-06-07 16:20:49'),
('FK1045', 'student05', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Zulaikha Nadia binti Mahmud', 'zulaikha@student.umpsa.edu.my', NULL, 'student', NULL, 'active', '2026-06-07 16:20:49', '2026-06-07 16:20:49'),
('SF001', 'admin01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Siti Aminah binti Ahmad', 'admin@umpsa.edu.my', NULL, 'admin', NULL, 'active', '2026-06-07 17:43:35', '2026-06-07 17:43:35'),
('FK2008', 'committee01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ahmad Firdaus bin Razak', 'firdaus@student.umpsa.edu.my', NULL, 'committee', NULL, 'active', '2026-06-07 17:43:35', '2026-06-07 17:43:35'),
('FK2004', 'committee02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nurul Hazwani binti Ismail', 'hazwani@student.umpsa.edu.my', NULL, 'committee', NULL, 'active', '2026-06-07 17:43:35', '2026-06-07 17:43:35'),
('FK1002', 'student01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nurul Aina binti Zainal', 'aina@student.umpsa.edu.my', NULL, 'student', NULL, 'active', '2026-06-07 17:43:35', '2026-06-07 17:43:35'),
('FK1035', 'student02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Muhammad Haziq bin Zulkifli', 'haziq@student.umpsa.edu.my', NULL, 'student', NULL, 'active', '2026-06-07 17:43:35', '2026-06-07 17:43:35'),
('FK1036', 'student03', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Siti Rahmah binti Othman', 'rahmah@student.umpsa.edu.my', NULL, 'student', NULL, 'active', '2026-06-07 17:43:35', '2026-06-07 17:43:35'),
('FK1039', 'student04', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Khairul Anwar bin Hassan', 'khairul@student.umpsa.edu.my', NULL, 'student', NULL, 'active', '2026-06-07 17:43:35', '2026-06-07 17:43:35'),
('FK1045', 'student05', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Zulaikha Nadia binti Mahmud', 'zulaikha@student.umpsa.edu.my', NULL, 'student', NULL, 'active', '2026-06-07 17:43:35', '2026-06-07 17:43:35'),
('SF001', 'admin01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Siti Aminah binti Ahmad', 'admin@umpsa.edu.my', '0123456789', 'admin', NULL, 'active', '2026-06-07 17:50:11', '2026-06-07 17:50:11'),
('FK2008', 'committee01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ahmad Firdaus bin Razak', 'firdaus@student.umpsa.edu.my', '0123456780', 'committee', NULL, 'active', '2026-06-07 17:50:11', '2026-06-07 17:50:11'),
('FK2004', 'committee02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nurul Hazwani binti Ismail', 'hazwani@student.umpsa.edu.my', '0123456781', 'committee', NULL, 'active', '2026-06-07 17:50:11', '2026-06-07 17:50:11'),
('FK1002', 'student01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nurul Aina binti Zainal', 'aina@student.umpsa.edu.my', '0123456782', 'student', NULL, 'active', '2026-06-07 17:50:11', '2026-06-07 17:50:11'),
('FK1035', 'student02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Muhammad Haziq bin Zulkifli', 'haziq@student.umpsa.edu.my', '0123456783', 'student', NULL, 'active', '2026-06-07 17:50:11', '2026-06-07 17:50:11'),
('FK1036', 'student03', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Siti Rahmah binti Othman', 'rahmah@student.umpsa.edu.my', '0123456784', 'student', NULL, 'active', '2026-06-07 17:50:11', '2026-06-07 17:50:11'),
('FK1039', 'student04', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Khairul Anwar bin Hassan', 'khairul@student.umpsa.edu.my', '0123456785', 'student', NULL, 'active', '2026-06-07 17:50:11', '2026-06-07 17:50:11'),
('FK1045', 'student05', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Zulaikha Nadia binti Mahmud', 'zulaikha@student.umpsa.edu.my', '0123456786', 'student', NULL, 'active', '2026-06-07 17:50:11', '2026-06-07 17:50:11'),
('CB24068', 'CB24068', '$2y$10$l8.VYU5AvYgE.YyMnIDzC.KcOdVpwSxunUObHNE1l613DwNF5Fz9m', 'MOHAMAD AKMAL', 'cb24068@adab.umpsa.edu.my', '010-000000', 'admin', NULL, 'active', '2026-06-10 22:58:48', '2026-06-10 22:58:48'),
('CB24084', 'CB24084', '$2y$10$xNZQ87UkIKhFFzsidwPXsu1WTAg76AZr2nWBzEFBzGl8FVHPw.EBW', 'HASLIZA BINTI MAD SAID', 'cb24084@adab.umpsa.edu.my', '010-3393392', 'admin', NULL, 'active', '2026-06-10 23:01:36', '2026-06-10 23:01:36'),
('TK24029', 'TK24029', '$2y$10$Fn3CW9qflx.WGN/MZpnAi.19sfwXb2VqnfHHXrwBHLqeyuNVqF99C', 'ANJE GEBU', 'anje@adab.umpsa.edu.my', '010-00000023', 'committee', NULL, 'active', '2026-06-11 01:44:58', '2026-06-11 01:44:58');

-- --------------------------------------------------------

--
-- Table structure for table `waiting_list`
--

CREATE TABLE `waiting_list` (
  `waiting_id` int(11) NOT NULL,
  `queued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('Waiting','Promoted','Cancelled') DEFAULT 'Waiting',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `event_id` int(11) NOT NULL,
  `student_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `waiting_list`
--

INSERT INTO `waiting_list` (`waiting_id`, `queued_at`, `status`, `updated_at`, `event_id`, `student_id`) VALUES
(1, '2026-06-07 09:50:11', 'Waiting', '2026-06-07 09:50:11', 1, 'CB24003'),
(2, '2026-06-07 09:50:11', 'Waiting', '2026-06-07 09:50:11', 1, 'CB24004'),
(3, '2026-06-07 09:50:11', 'Promoted', '2026-06-07 09:50:11', 2, 'CB24005');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `clubID` (`club_id`),
  ADD KEY `committeeID` (`committee_id`);

--
-- Indexes for table `event_qr`
--
ALTER TABLE `event_qr`
  ADD PRIMARY KEY (`qr_id`);

--
-- Indexes for table `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`registration_id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`student_id`);

--
-- Indexes for table `student_points`
--
ALTER TABLE `student_points`
  ADD PRIMARY KEY (`point_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `event_id` (`event_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `event`
--
ALTER TABLE `event`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `event_qr`
--
ALTER TABLE `event_qr`
  MODIFY `qr_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`);

--
-- Constraints for table `student_points`
--
ALTER TABLE `student_points`
  ADD CONSTRAINT `student_points_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  ADD CONSTRAINT `student_points_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
