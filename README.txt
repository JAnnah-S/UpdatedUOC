FK Club Hub - HTML/CSS/JavaScript Prototype

How to run:
1. Extract the ZIP file.
2. Open login.html in a browser.
3. Use one of these demo accounts:
   - STAFF001 / admin123       (Admin)
   - CB23001 / committee123    (Club Committee)
   - CB23002 / student123      (Student)

Important notes:
- This is a static front-end prototype using localStorage as a temporary database.
- It can run by double-clicking login.html, or through XAMPP Apache using:
  http://localhost/fk_student_club_system/login.html
- If old data appears in the browser, login as admin > My Profile > Reset Demo Data.

Updated functions in this version:
1. Student Dashboard
   - Student can view only their own total points.
   - Student can view only their own participation / attendance history.
   - Student can view their own recognition status and overall rank.
   - Top student ranking is limited to the best 5 only.
   - Student cannot view other students' detailed participation records.

2. Club Committee Dashboard
   - Committee has Attendance / QR sidebar menu.
   - Committee can choose club event, open QR page, capture geolocation, and record attendance.
   - Attendance records include student ID, student name, time, status, points and geolocation stamp.
   - Committee can view engagement trends and top 5 students for their own club only.

3. Admin Dashboard
   - Admin can view graphical analytics for participation per event, attendance rate, points, top students and top clubs.
   - Admin can filter by club, semester and event type.
   - Top students and top clubs display best 5 only.
   - Recognition status is calculated automatically:
     * Below 20: Warning / Please participate more
     * 20-49: Eligible for Participation Certificate
     * 50-79: Eligible for Active Student Award / Bonus Points
     * 80+: Outstanding Participation; eligible for leadership / priority in event registration

4. Admin-only Registration
   - First-time user registration is removed from login page.
   - Only admin can add/register new users through:
     Admin Dashboard > Register New User
     or User Management > Register User
   - Students cannot register themselves.

Database:
- database/fk_club.sql has been updated with semester, event_type and geolocation_stamp fields for future PHP/MySQL backend integration.
