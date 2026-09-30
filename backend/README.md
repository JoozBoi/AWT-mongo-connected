# OLX Classifieds Marketplace - Node.js Express & MongoDB Compass Backend

This is the standalone backend REST API for the OLX Classifieds Marketplace application built with **Node.js**, **Express.js**, and **MongoDB Compass (Local MongoDB / Mongoose ORM)**.

---

## 📁 Directory Structure

```
backend/
├── config/
│   └── db.js                 # Local MongoDB Mongoose connection configuration
├── models/
│   ├── User.js               # User & Admin account schema
│   ├── Category.js           # Category & Subcategory schema
│   ├── Listing.js            # Ad Listing schema (with location & search index)
│   ├── Conversation.js       # Inbox Chat Conversation schema
│   └── Message.js            # Chat Message schema
├── controllers/
│   ├── userController.js     # Auth, Login, Registration & Admin user moderation
│   ├── categoryController.js # Categories retrieval & seeding
│   ├── listingController.js  # Ad listing CRUD, search, filter & boost
│   └── chatController.js    # Buyer-seller inbox messages
├── routes/
│   ├── userRoutes.js         # /api/users endpoints
│   ├── categoryRoutes.js      # /api/categories endpoints
│   ├── listingRoutes.js       # /api/listings endpoints
│   └── chatRoutes.js         # /api/chats endpoints
├── middleware/
│   └── authMiddleware.js     # JWT protection & Admin verification middleware
├── .env.example              # Environment variables template
├── package.json              # Backend dependencies & npm scripts
├── seed.js                   # Database seeding script
└── server.js                 # Main Express server entry point
```

---

## 🧭 How to Connect with MongoDB Compass & Run Locally

### Prerequisites
1. **Node.js** (v18 or higher) installed on your PC.
2. **MongoDB Community Server** installed and running on your local machine.
3. **MongoDB Compass** installed on your PC (Graphical GUI client for MongoDB).

---

### Step 1: Open MongoDB Compass & Verify Local Connection
1. Launch **MongoDB Compass** on your PC.
2. In the connection bar, enter the default local URI:
   ```
   mongodb://127.0.0.1:27017
   ```
   *(or `mongodb://localhost:27017`)*
3. Click **Connect**.
4. You will see your local MongoDB databases listed. (The `olx_marketplace` database will automatically appear once you run the seed script in Step 4 below).

---

### Step 2: Open the Project in VS Code
Unzip the exported folder from Google AI Studio and open the project directory in Visual Studio Code. Open a terminal in VS Code:
```bash
cd backend
```

---

### Step 3: Install Dependencies & Setup Environment
1. Install node dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file inside the `backend` folder by copying `.env.example`:
   ```env
   # Local MongoDB connection string for MongoDB Compass
   MONGODB_URI=mongodb://127.0.0.1:27017/olx_marketplace

   # Backend Server Port
   PORT=5000

   # JWT Secret for Authentication
   JWT_SECRET=olx_marketplace_secret_jwt_key_2026

   # Client Origin
   CLIENT_URL=http://localhost:3000
   ```

---

### Step 4: Verify Mongoose Database Connection
Run the automated Mongoose connection diagnostic test to ensure MongoDB Compass or your MongoDB instance is running:
```bash
npm run test:db
```
This tests:
- Mongoose connection status and `readyState`
- Admin database ping command
- Registered Mongoose schemas (`User`, `Category`, `Listing`, `Conversation`, `Message`)
- Collection status and document counts

---

### Step 5: Seed Sample Data into MongoDB Compass
Populate your local MongoDB database with default OLX categories, sample listings, users, and chats:
```bash
npm run seed
```

When this script finishes, refresh **MongoDB Compass**. You will see the **`olx_marketplace`** database with 5 collections:
- `users`
- `categories`
- `listings`
- `conversations`
- `messages`

You can click on any collection in MongoDB Compass to view, edit, or search documents visually!

---

### Step 6: Start the Backend Express Server
Run the dev server with hot-reloading (`nodemon`):
```bash
npm run dev
```

The Express server will launch on port **5000**. Verify it in your browser:
```
http://localhost:5000/api/health
http://localhost:5000/api/db-status
```

---

## 📡 REST API Endpoints Overview

### 1. User & Admin Authentication (`/api/users`)
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate user & get JWT token
- `GET /api/users/profile` - Get logged-in user profile (Requires JWT)
- `GET /api/users` - Admin: List all registered accounts (Requires Admin JWT)
- `PUT /api/users/:id/status` - Admin: Suspend or activate user login (Requires Admin JWT)

### 2. Categories (`/api/categories`)
- `GET /api/categories` - Fetch all OLX categories with subcategories
- `POST /api/categories/seed` - Re-seed default categories

### 3. Classified Ad Listings (`/api/listings`)
- `GET /api/listings` - Search and filter ads (supports `q`, `category`, `city`, `minPrice`, `maxPrice`, `sortBy`, `featured`)
- `GET /api/listings/:id` - Fetch single ad details (auto-increments view count)
- `POST /api/listings` - Publish a new ad listing
- `PUT /api/listings/:id` - Update listing details or mark as sold
- `DELETE /api/listings/:id` - Remove ad listing
- `POST /api/listings/:id/boost` - Boost/feature an ad listing

### 4. Buyer-Seller Chat (`/api/chats`)
- `GET /api/chats` - List inbox conversations
- `POST /api/chats` - Initiate new conversation for an ad
- `GET /api/chats/:id/messages` - Fetch messages for a conversation
- `POST /api/chats/:id/messages` - Send a message to seller/buyer
