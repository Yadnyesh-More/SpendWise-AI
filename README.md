!) Clone repo:
git clone https://github.com/username/SpendWise-Ai.git

2) Install dependencies:
cd SpendWise-Ai/backend
npm install
cd ../frontend
npm install


3) Create .env manually (see your local .env).

4) Start project:
npm run dev

## Author
Yadnyesh More  
Original repository owner

# SpendWise AI – Personal Finance & AI Budget Advisor

A full‑stack personal finance web app that helps users track income, expenses, set budgets and savings goals, and get AI‑driven financial advice in real time.

![SpendWise AI Dashboard Preview](./screenshots/dashboard.png)

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

![Login Page](./screenshots/login.png)
![Register Page](./screenshots/register.png)
![Dashboard with AI Coach](./screenshots/dashboard_ai.png)
![Transaction List](./screenshots/transactions.png)
![Budget & Goals Overview](./screenshots/budget_goals.png)

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

## 📣 Contribution Guidelines

Contributions are welcome! If you want to improve SpendWise AI:
1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request with a clear description.

Please:
- Keep code clean and readable.
- Follow existing naming and folder conventions.
- Add comments where logic is not obvious.

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 📬 Contact / Feedback

If you have any questions, suggestions:

- **GitHub**: `https://github.com/YOUR_USERNAME/spendwise-ai`
- **LinkedIn / Portfolio Link**: (add your profile here)

---
