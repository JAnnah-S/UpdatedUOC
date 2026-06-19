FK Club Hub - Database Connected Version

This version connects the HTML/CSS/JS prototype to MySQL using PHP API files inside the /api folder.

1) Copy folder to XAMPP
   Copy fk_student_club_system to:
   C:\xampp\htdocs\fk_student_club_system

2) Import database
   Open phpMyAdmin -> New database -> create database named UOC.
   Import this file:
   database/UOC.sql

   Then import this patch file:
   database/UOC_backend_patch.sql

3) Check database connection
   Open api/config.php. Default XAMPP setting is:
   DB_HOST = localhost
   DB_NAME = UOC
   DB_USER = root
   DB_PASS = empty

   If your MySQL uses password or port 3307, edit config.php.

4) Run system
   Start Apache and MySQL in XAMPP.
   Open:
   http://localhost/fk_student_club_system/login.html

5) Demo logins
   New database login from UOC.sql:
   Admin: admin01 / admin123
   Committee: committee01 / committee123
   Student: student01 / student123

   Old prototype aliases also work:
   STAFF001 / admin123
   CB23001 / committee123
   CB23002 / student123

Database-connected functions included:
- Login authenticates through api/login.php against table user.
- Dashboard/analytics load live data from MySQL through api/data.js.php.
- Admin Register User saves to user/student/admin/club_committee/membership.
- Committee Attendance saves to attendance/student_points/registrations.
- Create Event saves to event.
- Student Event Registration saves to registrations.

Notes:
- Student dashboard still only shows the logged-in student's own points/history and top 5 ranking.
- Committee attendance records are restricted by the committee's club.
- Admin dashboard calculates recognition status from accumulated points.
