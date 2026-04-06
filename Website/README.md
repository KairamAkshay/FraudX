# FraudX — Real-Time Fraud Detection & Prevention

A full-stack fraud detection web application with ML-powered risk analysis, rule-based scoring, and explainable AI.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.9
- MongoDB Atlas account (free tier works)

---

## 📦 Installation & Setup

### 1. Clone / Download
```bash
git clone https://github.com/YOUR_USERNAME/fraudx.git
cd fraudx
```

### 2. Configure Environment
```bash
cd backend
copy .env.example .env
```
Edit `.env` and fill in:
- `MONGODB_URI` — your MongoDB Atlas connection string
- `SESSION_SECRET` — any random strong string
- `ML_SERVICE_URL` — `http://localhost:5001` (default)

### 3. MongoDB Atlas Setup
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → Create a free cluster
2. Under **Database Access** → Add a database user (username + password)
3. Under **Network Access** → Add IP `0.0.0.0/0` (allow all)
4. Click **Connect** → **Drivers** → Copy the connection string
5. Replace `<username>` and `<password>` in the string and paste into `.env`

---

## 🖥️ Running the Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

The app runs at: **http://localhost:3000**

---

## 🧠 Running the ML Service (Python Flask)

```bash
cd ml-service
pip install -r requirements.txt
python model/train.py       # Train model first (one-time)
python app.py               # Start Flask server
```

ML service runs at: **http://localhost:5001**

> If the ML service is unavailable, the backend falls back to a heuristic prediction automatically.

---

## 📁 Project Structure

```
FraudX/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth middleware
│   ├── models/         # Mongoose schemas
│   ├── public/         # CSS, JS, images
│   ├── routes/         # Express routes
│   ├── services/       # Feature engineering, ML client, risk & decision engines
│   ├── views/          # EJS templates
│   ├── server.js       # Entry point
│   └── .env.example
├── ml-service/
│   ├── model/
│   │   ├── train.py    # Training script
│   │   └── fraud_model.pkl  # Generated after training
│   ├── app.py          # Flask API
│   └── requirements.txt
└── .gitignore
```

---

## 🔒 Default Admin Setup

Register first user → manually update their role in MongoDB:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

## 🌐 GitHub Upload

```bash
git init
git add .
git commit -m "Initial commit: FraudX fraud detection app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fraudx.git
git push -u origin main
```

---

## 🛠️ Tech Stack

| Layer      | Technology                           |
|------------|--------------------------------------|
| Backend    | Node.js, Express.js                  |
| Database   | MongoDB Atlas + Mongoose             |
| ML Service | Python, Flask, scikit-learn         |
| Frontend   | EJS, Vanilla CSS, Chart.js           |
| Auth       | express-session, connect-mongo, bcryptjs |
| HTTP       | axios (Node → Flask communication)   |

---

## ⚡ Decision Engine

| Risk Score | Risk Level | Decision                        |
|------------|------------|---------------------------------|
| 0 – 25     | Low        | ✅ Allow                        |
| 26 – 50    | Medium     | 📱 OTP Verification Required    |
| 51 – 75    | High       | ⏳ Delay (7s) + Alert           |
| 76 – 100   | Very High  | 🚫 Block Transaction            |

---

## 📝 License
MIT
