# OLX India Classifieds Marketplace Full-Stack Project

A comprehensive, high-fidelity replica of OLX India (www.olx.in) featuring a complete React frontend and a standalone Node.js, Express, and MongoDB Compass backend.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Lucide Icons, Motion (Framer Motion)
- **Backend**: Node.js, Express.js, MongoDB (Local / MongoDB Compass via Mongoose ORM), JWT Authentication, BcryptJS

---

## 📁 Directory Structure

```
├── backend/                  # Standalone Express + MongoDB Compass Backend API
│   ├── config/               # Database connection (db.js)
│   ├── controllers/          # User, Category, Listing & Chat controllers
│   ├── models/               # Mongoose Schemas (User, Category, Listing, Chat)
│   ├── routes/               # Express API routes (/api/users, /api/listings, etc.)
│   ├── middleware/           # JWT Auth & Admin authorization middlewares
│   ├── seed.js               # Database seed script for local MongoDB / Compass
│   ├── server.js             # Express API entry point
│   ├── package.json          # Backend dependencies
│   └── README.md             # Detailed backend setup & MongoDB Compass instructions
├── src/                      # React Frontend Application
│   ├── components/           # Navbar, Footer, Modals, Cards, Filters
│   ├── context/              # App Context (User state, Auth, Listings state)
│   ├── pages/                # Home, Search, Detail, Sell, Chat, Admin, Settings
│   └── data/                 # Initial mock listings and categories
├── package.json              # Main project package configuration
├── .env.example              # Environment variables template
└── README.md                 # Main project README
```

---

## 🧭 How to Setup & Run the Backend with MongoDB Compass in VS Code

The backend is kept completely separate from the frontend as requested. Follow these steps to run it locally with **MongoDB Compass**:

### 1. Open MongoDB Compass
1. Launch **MongoDB Compass** on your PC.
2. Connect to `mongodb://127.0.0.1:27017` (or `mongodb://localhost:27017`).

### 2. Navigate to the backend folder in VS Code terminal
```bash
cd backend
```

### 3. Install backend dependencies
```bash
npm install
```

### 4. Create `.env` file
Inside the `backend` directory, create a `.env` file (or copy from `.env.example`):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/olx_marketplace
PORT=5000
JWT_SECRET=olx_marketplace_secret_jwt_key_2026
CLIENT_URL=http://localhost:3000
```

### 5. Seed MongoDB Compass database
Run the seed script to populate the local database with initial OLX sample data:
```bash
npm run seed
```
Now in **MongoDB Compass**, click **Refresh**. You will see the **`olx_marketplace`** database with all 5 collections (`users`, `categories`, `listings`, `conversations`, `messages`).

### 6. Start the Express backend server
```bash
npm run dev
```
Your backend API will run on `http://localhost:5000`. Test the health check endpoint at `http://localhost:5000/api/health`.

---

## 💻 Running the Frontend Locally in Visual Studio Code

To run the React frontend client:
```bash
npm install
npm run dev
```
The frontend web application will run on `http://localhost:3000`.
