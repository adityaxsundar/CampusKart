# CampusKart 🛒🎓

A secure full-stack campus marketplace built with **React**, **Node.js**, **Express**, and **MongoDB**. CampusKart enables students to buy, sell, and auction products within their campus community while ensuring a safe and organized trading environment.

---

## 🚀 Features

### 🔐 User Authentication

* Secure user registration and login
* JWT-based authentication
* Protected routes and role-based access

### 📦 Product Listings

* Create product listings
* Edit and update products
* Delete listings
* Browse products posted by other students

### 📊 Product Status Management

Each product can have one of the following statuses:

| Status             | Description                          |
| ------------------ | ------------------------------------ |
| `available`        | Product is available for purchase    |
| `pending_approval` | Awaiting admin approval              |
| `active_auction`   | Product is currently in an auction   |
| `sold`             | Product has been sold                |
| `purchased`        | Product has been purchased by a user |
| `removed`          | Product removed by administrator     |

### 🔨 Auction System

* Create auctions for products
* Participate in live bidding
* Track auction status and results

### 👨‍💼 Admin Dashboard

* Manage users
* Approve or remove products
* Monitor marketplace activity

### 💬 Real-Time Chat *(Under Development)*

* Direct communication between buyers and sellers
* Real-time messaging support

### 📱 Responsive Design

* Mobile-friendly interface
* Modern UI built with Tailwind CSS
* Clean and intuitive user experience

---

## 🛠️ Tech Stack

### Frontend

* React
* Tailwind CSS
* Lucide React
* Vite

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Tokens (JWT)

---

## 📂 Project Structure

```bash
CampusKart/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── index.html
│
└── README.md
```

---

## ⚙️ Prerequisites

Before running the project, ensure you have:

* Node.js (v14 or later)
* npm
* MongoDB (Local or Atlas)

Verify installation:

```bash
node -v
npm -v
mongod --version
```

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CampusKart
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

### Start Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend

```env
PORT=
MONGO_URI=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

### Frontend

```env
VITE_API_URL=
```

---

## 📸 Screenshots

Add screenshots of:

* Home Page
* Product Listing Page
* Auction Dashboard
* Admin Dashboard
* User Profile

Example:

```md
![Home Page](./screenshots/home.png)
```

---

## 🔮 Future Enhancements

* Real-time chat using Socket.io
* Product reviews and ratings
* Wishlist functionality
* Campus verification system
* Payment gateway integration
* Push notifications
* Image upload optimization
* AI-powered product recommendations

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add feature"
```

4. Push to your branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

Feel free to contribute, report issues, or suggest improvements.
