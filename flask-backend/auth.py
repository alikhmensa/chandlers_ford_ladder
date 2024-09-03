from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import mysql.connector
import os
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables from .env file
load_dotenv()

auth_bp = Blueprint('auth', __name__)  # Define blueprint for auth routes
bcrypt = Bcrypt()

# Set up JWT manager
jwt = JWTManager()

# Database connection using environment variables
def get_db_connection():
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    return conn

# Helper function to get user by email
def get_user_by_email(email):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user

# User registration route
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    fullname = data['fullname']
    password = data['password']
    email = data['email']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        conn.close()
        return jsonify({'message': 'User already exists'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    cursor.execute('INSERT INTO users (full_name, password, email) VALUES (%s, %s, %s)', (fullname, hashed_password, email))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'User registered successfully'}), 201

# User login route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    user = get_user_by_email(email)

    if user and bcrypt.check_password_hash(user['password'], password):
        expires = timedelta(minutes=30)
        access_token = create_access_token(identity={'email': user['email']}, expires_delta=expires)
        return jsonify({'access_token': access_token, 'expires_in': expires.total_seconds()}), 200

    return jsonify({'message': 'Invalid credentials'}), 401