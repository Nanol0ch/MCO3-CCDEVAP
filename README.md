AIRROUTE - FLIGHT BOOKING SYSTEM

AirRoute is a full-stack flight booking web application built with Node.js, Express, MongoDB, and Handlebars. Developed as MCO3 for CCDEVAP.

DEPLOYMENT

Live URL: http://10.2.14.10:60110
Administrator account: admin@airroute.com / Admin123!
Passenger account: passenger@airroute.com / Passenger123!

PREREQUISITES

Node.js v20 or higher
MongoDB running locally on port 27017

LOCAL SETUP

Clone the repository and navigate into the project folder.
Run npm install to install dependencies.
Run cp .env.example .env and fill in your MONGODB_URI and SESSION_SECRET.
Run npm run seed to populate the database with sample flights and test accounts.
Run npm start to start the server at http://localhost:3000.

RUNNING TESTS

Run npm test to execute all Jest unit tests. Tests cover user authentication (successful registration, successful login, failed login), flight management (create, update, delete), reservation management (create, cancel), and business rule validation (no available seats, occupied seat).

RBAC PERMISSION MATRIX

Administrators can manage flights, view all reservations, manage user accounts, and view audit trail logs. Passengers can view and update their profile, search flights, book flights, view their own reservations, and cancel their own reservations. Passengers cannot access any administrator pages.

PROTECTED ROUTES

The following routes require authentication: /profile, /flights/search, /bookings/:flightId, /reservations. The following routes require the Administrator role: /admin, /admin/flights, /admin/reservations, /admin/users, /admin/audit-logs.

AUDIT TRAIL

All major user activities are recorded in the auditlogs MongoDB collection. Each entry includes a timestamp, username, user role, and a description of the activity performed. Logged events include user registration, login, logout, flight creation, flight update, flight deletion, reservation creation, and reservation cancellation. Administrators can view the full audit log at /admin/audit-logs.

SAMPLE LOG ENTRIES:

2026-08-06 10:23:01 | Test Passenger | passenger | Logged into the system
2026-08-06 10:25:44 | Test Passenger | passenger | Created reservation SKY-482910 for flight PR 101
2026-08-06 10:30:12 | System Administrator | admin | Logged into the system

TECH STACK

Node.js, Express.js, MongoDB, Mongoose, Handlebars, express-session, bcrypt, Jest, Docker, CCSCloud
