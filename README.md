# SpendWise AI – Personal Finance & AI Budget Advisor

A full‑stack personal finance web app that helps users track income, expenses, set budgets and savings goals, and get AI‑driven financial advice in real time.

![SpendWise AI Dashboard Preview](./screenshots/dashboard.png)
<img width="1919" height="1017" alt="Screenshot 2026-01-04 202526" src="https://github.com/user-attachments/assets/d4f3b325-f544-4e30-8850-5ee6a9acc3fd" />
<img width="1194" height="1002" alt="Screenshot 2026-01-04 202743" src="https://github.com/user-attachments/assets/64238d07-4bb5-4265-ac9a-27a3f68777bb" />


---


## 📌 Overview

SpendWise AI is a web‑based budgeting and expense‑tracking application built with:
- **React** (frontend)
- **Node.js + Express** (backend API)
- **MongoDB** (data storage)
- **Vercel** (frontend hosting)
- **Render** (backend hosting)

The app allows users to:

- Sign up and log in securely.
- Add and categorize transactions (income & expenses).
- Set monthly budgets and savings goals.
- View analytics and get AI‑powered budget suggestions.

---

## 🖼️ Screenshots

![Login Page](https://github.com/user-attachments/assets/2e60860d-a15d-4c71-9a7b-867adbeceed0)

![Register Page](https://github.com/user-attachments/assets/96422b1a-f140-4047-b5e9-df603e365c58)

![Dashboard with AI Coach](https://github.com/user-attachments/assets/6e37f618-d622-4366-9c47-02fc21d33eff)

![Budget & Goals Overview](https://github.com/user-attachments/assets/9734659c-a5ea-41af-9001-8ccb57ed5eb4)

![Profile](https://github.com/user-attachments/assets/f918371d-19ec-4b8c-8fda-f6f53f8b4957)
---

## 🧩 Features

### 1. User Authentication
- Register with name, email, and password.
- Login with JWT token handling.
- Protected routes for authenticated users only.

### 2. Transaction Management
- Add income and expense transactions with amount, category, and date.
- Edit or delete existing transactions.
- View transaction list with filters (by date, category, type).

### 3. Budget & Goals
- Set monthly budget limits per category.
- Create savings goals (e.g., “Vacation”, “Emergency Fund”).
- Track progress toward each goal.

### 4. AI Financial Advisor
- On each dashboard load, the app calculates:
  - Current income vs expenses.
  - Savings percentage.
  - Budget utilization.
- AI‑driven suggestions (e.g., “Reduce dining‑out expenses”, “Increase savings by ₹X”).
- Non‑intrusive “Budget Coach” badge that users can open manually.

### 5. Responsive UI
- Mobile‑friendly layout using Tailwind CSS.
- Clean dashboard with charts and spend‑by‑category breakdown.
- Intuitive navigation for all key sections.

---

## 🛠️ Tech Stack

### Frontend
- React (with Vite)
- Tailwind CSS
- Axios for API calls
- React Router for navigation

### Backend
- Node.js
- Express.js
- MongoDB (Native Node driver or Mongoose)
- JWT for authentication
- CORS, Helmet, and mongo‑sanitize for security

### Hosting & Deployment
- Frontend: Vercel (`spend-wise-ai-front.vercel.app`)
- Backend: Render (`spendwise-ai-9fd1.onrender.com`)

---

## 🚀 Getting Started (Local Dev)

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/spendwise-ai.git
cd spendwise-ai
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env  # fill in your values
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:5000` by default.

---

## 🔧 Environment Variables

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/spendwise_ai
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
```

Adjust `MONGO_URI` if you’re using MongoDB Atlas.

---

## 🧪 API Endpoints (Quick Reference)

All endpoints are under `/api/...`:

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (protected)

- **Transactions**
  - `GET /api/transactions`
  - `POST /api/transactions`
  - `PUT /api/transactions/:id`
  - `DELETE /api/transactions/:id`

- **Budget & Goals**
  - `GET /api/budget`
  - `PUT /api/budget`
  - `GET /api/goals`
  - `POST /api/goals`
  - `PUT /api/goals/:id`
  - `DELETE /api/goals/:id`

- **AI Advisor**
  - `POST /api/ai/budget-suggestion` – returns AI‑driven suggestions based on current transactions, income, and goals.

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 📬 Contact / Feedback

If you have any questions, suggestions:

- **GitHub**: `https://github.com/Yadnyesh-More/SpendWise-AI`
- **LinkedIn Profile Link**:`https://www.linkedin.com/in/yadnyesh-more-7b049b27b`

---

## Author
Yadnyesh More  
Original repository owner
