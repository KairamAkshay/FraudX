"""
FraudX ML Training Script
Trains a RandomForest classifier on mock transaction data and saves the model.
Run: python model/train.py
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

np.random.seed(42)
N = 5000

# Generate mock dataset
data = {
    'amount_deviation': np.concatenate([
        np.random.normal(0.2, 0.5, int(N * 0.8)),   # normal transactions
        np.random.normal(3.0, 1.0, int(N * 0.2))     # fraudulent transactions
    ]),
    'new_receiver': np.concatenate([
        np.random.binomial(1, 0.1, int(N * 0.8)),
        np.random.binomial(1, 0.8, int(N * 0.2))
    ]),
    'new_device': np.concatenate([
        np.random.binomial(1, 0.05, int(N * 0.8)),
        np.random.binomial(1, 0.7, int(N * 0.2))
    ]),
    'hour': np.concatenate([
        np.random.randint(7, 22, int(N * 0.8)),
        np.random.choice(list(range(0, 7)) + list(range(22, 24)), int(N * 0.2))
    ]),
    'frequency': np.concatenate([
        np.random.randint(1, 5, int(N * 0.8)),
        np.random.randint(5, 20, int(N * 0.2))
    ]),
    'label': np.concatenate([
        np.zeros(int(N * 0.8)),
        np.ones(int(N * 0.2))
    ])
}

df = pd.DataFrame(data)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

X = df[['amount_deviation', 'new_receiver', 'new_device', 'hour', 'frequency']]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train RandomForest
clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42, class_weight='balanced')
clf.fit(X_train, y_train)

# Evaluate
y_pred = clf.predict(X_test)
print("=== FraudX ML Model Training ===")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Normal', 'Fraud']))

# Save model
os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fraud_model.pkl')
joblib.dump(clf, model_path)
print(f"\nModel saved to: {model_path}")
