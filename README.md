# 🍽️ Restaurant Reservation Mobile Application

A full-stack mobile application that allows users to book tables at restaurants quickly and securely. The system combines a mobile frontend with a RESTful backend and a relational database.


# 🧰 Tech Stack
Mobile Interface: React Native (Expo)

Backend: Node.js with Express

Database: MariaDB

Authentication & Security: JWT (JSON Web Tokens), bcrypt for password hashing

Developer Tools: Postman (for API testing), NetBeans


# 📦 Getting Started
Follow these steps to run the project locally:

Clone the Repository

git clone https://github.com/Tagalos/Restaurant-Application.git

cd Restaurant-Application-app
Install Backend Dependencies

cd backend
npm install
npm run dev

Set Up the Mobile App

cd ../frontend
npm install
npx expo start --tunnel

Start MariaDB

Ensure your database service is running locally and that credentials match your environment settings.


# 🔐 Environment Variables
Create a .env file in the backend directory with the following content:

.env
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=restaurant_app
JWT_SECRET=your_jwt_secret

# 📚 API Documentation
The backend exposes RESTful endpoints for:

POST /auth/register – Register a new user

POST /auth/login – Authenticate and receive a token

GET /restaurants – Fetch available restaurants

POST /reservations – Create a reservation

PUT /reservations/:id – Edit an existing reservation

DELETE /reservations/:id – Cancel a reservation

Test these using Postman or any other API client.

# 🚀 Deployment
To deploy the backend:

Use services like Render, Railway, or Heroku (with custom port configuration)

Upload your .env variables securely

Connect to your hosted MariaDB (e.g., on PlanetScale or your server)

To deploy the frontend:

Use Expo Go for testing

For production, use EAS Build or export the app for iOS/Android stores


Author: Nikolaos Tagkalos

For production, use EAS Build or export the app for iOS/Android stores

Author Nikolaos Tagkalos
