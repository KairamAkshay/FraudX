# FraudX — Real-Time Fraud Detection & Prevention

A full-stack fraud detection web application with ML-powered risk analysis, rule-based scoring, and explainable AI. This repository contains the complete FraudX project, including the application source code, architecture diagrams, documentation, and presentation materials.

---

## 📁 Repository Structure

```
FraudX/
├── Website/            # Main application directory
│   ├── backend/        # Node.js + Express backend (also serves EJS frontend)
│   └── ml-service/     # Python Flask ML service for risk prediction
├── Documentation/      # Project documentation logically organized
├── Slides/             # Presentation slides for the project
├── architecture/       # Architecture diagrams and system design files
└── README.md           # This top-level README file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.9
- MongoDB Atlas account (free tier works)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/fraudx.git
cd fraudx
```

### 2. Configure Environment (Backend)
```bash
cd Website/backend
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
cd Website/backend
npm install
npm run dev
```

The app runs at: **http://localhost:3000**

---

## 🧠 Running the ML Service (Python Flask)

```bash
cd Website/ml-service
pip install -r requirements.txt
python model/train.py       # Train model first (one-time)
python app.py               # Start Flask server
```

ML service runs at: **http://localhost:5001**

> *Note: If the ML service is unavailable, the backend will automatically fall back to heuristic predictions.*

---

## 🔒 Default Admin Setup

To access the admin dashboard, register your first user and then manually update their role in MongoDB:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

## 🛠️ Tech Stack

| Layer      | Technology                           |
|------------|--------------------------------------|
| **Backend**    | Node.js, Express.js                  |
| **Database**   | MongoDB Atlas + Mongoose             |
| **ML Service** | Python, Flask, scikit-learn         |
| **Frontend**   | EJS, Vanilla CSS, Chart.js           |
| **Auth**       | express-session, connect-mongo, bcryptjs |
| **HTTP**       | axios (Node → Flask communication)   |

---

## ⚡ Decision Engine

FraudX utilizes a multi-layered decision engine to evaluate transactions:

| Risk Score | Risk Level | Decision                        |
|------------|------------|---------------------------------|
| 0 – 25     | Low        | ✅ Allow                        |
| 26 – 50    | Medium     | 📱 OTP Verification Required    |
| 51 – 75    | High       | ⏳ Delay (7s) + Alert           |
| 76 – 100   | Very High  | 🚫 Block Transaction            |

---

## 📝 License
MIT
