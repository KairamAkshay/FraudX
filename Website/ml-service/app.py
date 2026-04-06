"""
FraudX Flask ML Service
Exposes POST /predict → returns fraud probability
"""
from flask import Flask, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'fraud_model.pkl')
model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded from {MODEL_PATH}")
    else:
        print(f"⚠️  Model not found at {MODEL_PATH}")
        print("   Run: python model/train.py to train the model first.")
        model = None

load_model()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Run python model/train.py first.'}), 503

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body provided'}), 400

    required = ['amount_deviation', 'new_receiver', 'new_device', 'hour', 'frequency']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        features = np.array([[
            float(data['amount_deviation']),
            int(data['new_receiver']),
            int(data['new_device']),
            int(data['hour']),
            int(data['frequency'])
        ]])

        proba = model.predict_proba(features)[0]
        fraud_probability = float(proba[1])  # probability of class 1 (fraud)

        return jsonify({
            'fraud_probability': round(fraud_probability, 4),
            'normal_probability': round(float(proba[0]), 4),
            'prediction': 'fraud' if fraud_probability > 0.5 else 'normal'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"\n🧠 FraudX ML Service running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
