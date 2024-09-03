from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Define blueprint for user routes
users_bp = Blueprint('users', __name__)  

# Database connection using environment variables
def get_db_connection():
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    return conn

# Helper function to fetch all players
def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users ORDER BY rank ASC')
    players = cursor.fetchall()
    cursor.close()
    conn.close()
    return players

# Helper function to get user by email
def get_user_by_email(email):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user

# Endpoint to fetch all players
@users_bp.route('/all', methods=['GET'])
@jwt_required()
def get_players():
    try:
        players = get_all_players()
        return jsonify(players), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch players', 'error': str(e)}), 500

# Endpoint to fetch current user information
@users_bp.route('/single', methods=['GET'])
@jwt_required()
def get_user():
    current_user = get_jwt_identity()
    user = get_user_by_email(current_user['email'])
    if user:
        return jsonify({'email': user['email'], 'fullname': user['full_name']}), 200
    else:
        return jsonify({'message': 'User not found'}), 404

# Helper function to fetch user stats for a specific tournament
def get_users_tournament_stats(tournament_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM user_tournament ut join users u on ut.user_id = u.user_id WHERE tournament_id = %s', (tournament_id,))
    stats = cursor.fetchall()
    cursor.close()
    conn.close()
    return stats

# Endpoint to get users' stats for a specific tournament
@users_bp.route('/stats/tournament/<int:tournament_id>', methods=['GET'])
@jwt_required()
def users_tournament_stats(tournament_id):
    try:
        stats = get_users_tournament_stats(tournament_id)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch tournament stats', 'error': str(e)}), 500