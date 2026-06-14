
# final-project-TutorConnect

## Project Overview

TutorConnect is a tutoring marketplace web app where students can find tutors, book sessions, message them, and leave reviews after completed sessions. Tutors can create a profile, list the subjects they teach, set availability, approve manual booking requests, message students, and rate students after sessions.

## Team Member Contribution

**Caleb Mak**: Nearly all of the backend code including exposing API endpoints and middleware.

**Anthony Vuong**: Nearly all of the frontend code including styling and cookie management.

**Rafael Moran**: Nearly all of the database code including setting up the cluster on the MongoDB website.

All members did some work on other layers but mostly worked on their own layer.

## Details on AI usage

AI was used to generate the logo, explain code, explain syntax, explain high level logic, and proofread the readme and code. No code was merely pasted in at face value but all code was deeply understood.

## Tools used

Frontend: React. Backend: NodeJS + Express. Database: MongoDB.

## How to run/deploy

1. To run the project, clone the repository using the github link.
2. Find the file backend/.env.dev and rename the file to .env.
3. Navigate through CD to the backend directory.
4. Run "npm install" and then "npm run dev" in terminal.
5. In another terminal, navigate to the frontend directory.
6. Run "npm install" then "npm run start" in terminal. The webpage should automatically open up in your web browser.

## Main Features

- Student and tutor account types
- Student profile details, including school or university
- Tutor profiles with bio, subjects, hourly cost, related work, rating, and availability
- Tutor search for students, with name search, subject filter, and price sorting
- Manual booking requests that tutors can confirm
- Quick booking from tutor availability slots, which books immediately because the tutor already offered the time
- My Sessions page for upcoming sessions, sorted chronologically
- Messages page with chat-style conversations
- Appointment notice in messages for the earliest upcoming confirmed appointment with that person
- Review system for both tutors and students after confirmed sessions have passed
- Ratings shown as star values, including decimal averages

## How Students Use TutorConnect

1. Create a student account from the signup page.
2. Add a school or university if desired.
3. Use the search bar or Search page to find tutors.
4. Filter by subject or sort tutors by price.
5. Open a tutor profile to view details, subjects, rating, and availability.
6. Book a tutor in one of two ways:
   - Use Quick Book on an available tutor time slot.
   - Use the manual Book a Session form, which sends a request for tutor approval.
7. View upcoming sessions from My Sessions.
8. Message tutors from tutor profiles, search results, or My Sessions.
9. After a confirmed session has passed, leave a review for the tutor.

## How Tutors Use TutorConnect

1. Create a tutor account or sign up as a tutor.
2. Complete the tutor profile with bio, subjects, hourly cost, and related work.
3. Add availability from the Profile page.
4. View incoming manual booking requests in My Sessions under Requests.
5. Confirm or cancel requests.
6. View confirmed sessions in My Sessions.
7. Message students from sessions or conversations.
8. After a confirmed session has passed, rate the student.

## Booking Behavior

- Manual bookings start as unconfirmed and appear in the tutor's Requests tab.
- Quick Book uses tutor-created availability and is automatically confirmed.
- Booked availability slots are hidden so another student cannot take the same slot.
- The backend also rejects duplicate bookings for the same tutor, date, start time, and end time.
- Past sessions and expired availability are hidden from active session/availability views.

## Reviews and Ratings

Tutor ratings and student ratings are averaged automatically. For example, if one user gives a tutor 5 stars and another gives 4 stars, the displayed average becomes 4.5.

Reviews are only allowed after a confirmed session has passed.