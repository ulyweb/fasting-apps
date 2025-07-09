
from flask import Flask, request, redirect, session, send_from_directory, jsonify
import os, json, bcrypt
from pathlib import Path
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET', 'fallbacksecret')
BASE = Path(__file__).parent
USERS_FILE = BASE / 'users.json'
LOG_DIR = BASE / 'logs'

def load_users():
    return json.loads(USERS_FILE.read_text()) if USERS_FILE.exists() else {}

def save_users(data):
    USERS_FILE.write_text(json.dumps(data, indent=2))

@app.route('/')
def home():
    if 'user' in session:
        return send_from_directory('static', 'index.html')
    return redirect('/login')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        users = load_users()
        u, p = request.form['username'], request.form['password'].encode()
        if u not in users: return 'User not found.'
        if not bcrypt.checkpw(p, users[u]['password'].encode()): return 'Incorrect password.'
        session['user'] = u
        return redirect('/')
    return send_from_directory('static', 'login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        users = load_users()
        u, p = request.form['username'], request.form['password'].encode()
        if u in users: return 'User exists.'
        users[u] = {'password': bcrypt.hashpw(p, bcrypt.gensalt()).decode()}
        save_users(users)
        return redirect('/login')
    return send_from_directory('static', 'signup.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

@app.route('/username')
def get_username():
    return jsonify(username=session.get('user'))

@app.route('/log', methods=['GET', 'POST'])
def log():
    if 'user' not in session: return redirect('/login')
    user_file = LOG_DIR / f"{session['user']}.json"
    if request.method == 'GET':
        return jsonify(json.loads(user_file.read_text()) if user_file.exists() else [])
    data = json.loads(user_file.read_text()) if user_file.exists() else []
    entry = request.get_json()
    entry['date'] = datetime.now().isoformat()
    data.append(entry)
    user_file.write_text(json.dumps(data, indent=2))
    return jsonify(success=True)

@app.route('/<path:p>')
def static_proxy(p): return send_from_directory('static', p)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv("PORT", 5000)))
