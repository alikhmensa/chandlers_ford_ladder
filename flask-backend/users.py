from flask import Blueprint, jsonify, request
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
        players = get_all_users()
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
    
@users_bp.route('/challenge', methods=['POST'])
@jwt_required()
def create_challenge():
    try:
        # Get the emails of the challenger and challenged from the request
        challenger_email = request.json.get('challenger_email')
        challenged_email = request.json.get('challenged_email')

        if not challenger_email or not challenged_email:
            return jsonify({'message': 'Both challenger_email and challenged_email are required.'}), 400

        # Fetch the user IDs based on the provided emails
        challenger = get_user_by_email(challenger_email)
        challenged = get_user_by_email(challenged_email)

        if not challenger or not challenged:
            return jsonify({'message': 'Invalid challenger or challenged email.'}), 404

        challenger_id = challenger['user_id']
        challenged_id = challenged['user_id']

        # Insert the challenge into the database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO challenge_requests (challenger_id, challenged_id) VALUES (%s, %s)',
            (challenger_id, challenged_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Challenge created successfully.'}), 201

    except Exception as e:
        return jsonify({'message': 'Failed to create challenge', 'error': str(e)}), 500


@users_bp.route('/challenge/eligibility', methods=['POST'])
@jwt_required()
def check_eligibility():
    try:
        data = request.json
        challenger_email = data.get('challenger_email')
        challenged_email = data.get('challenged_email')

        if not challenger_email or not challenged_email:
            return jsonify({'message': 'Both challenger_email and challenged_email are required.'}), 400

        # Fetch the user IDs based on the provided emails
        challenger = get_user_by_email(challenger_email)
        challenged = get_user_by_email(challenged_email)

        if not challenger or not challenged:
            return jsonify({'message': 'Invalid challenger or challenged email.'}), 404

        challenger_id = challenger['user_id']
        challenged_id = challenged['user_id']

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if the challenged user has already accepted another challenge
        cursor.execute(
            '''
            SELECT * FROM challenge_requests 
            WHERE challenged_id = %s AND status = 'accepted'
            ''', (challenged_id,)
        )
        accepted_challenge_for_challenged = cursor.fetchone()

        if accepted_challenge_for_challenged:
            cursor.close()
            conn.close()
            return jsonify({'is_eligible': False, 'reason': 'This user has already accepted another challenge.'}), 200

        # Check if the challenger user has already accepted another challenge
        cursor.execute(
            '''
            SELECT * FROM challenge_requests cr
            WHERE (challenged_id = %s OR challenger_id = %s) 
            AND status = 'accepted'
            AND NOT EXISTS (
                SELECT 1 FROM matches m
                WHERE m.challenge_id = cr.challenge_id
            )
            ''', (challenger_id, challenger_id)
        )
        accepted_challenge_for_challenger = cursor.fetchone()

        if accepted_challenge_for_challenger:
            cursor.close()
            conn.close()
            return jsonify({'is_eligible': False, 'reason': 'You have already accepted another challenge.'}), 200

        # Check for a pending challenge
        cursor.execute(
            '''
            SELECT * FROM challenge_requests 
            WHERE challenger_id = %s AND challenged_id = %s AND status IS NULL
            ''', (challenger_id, challenged_id)
        )
        pending_challenge = cursor.fetchone()

        if pending_challenge:
            cursor.close()
            conn.close()
            return jsonify({'is_eligible': False, 'reason': 'There is already a pending challenge.'}), 200

        # Check if the last match of the challenger was against the challenged
        cursor.execute(
            '''
            SELECT * FROM matches
            WHERE (white_user_id = %s OR black_user_id = %s)
            ORDER BY played_at DESC LIMIT 1
            ''', (challenger_id, challenger_id)
        )
        last_game = cursor.fetchone()

        if last_game:
            # Check if the last opponent was the challenged player
            if (last_game['white_user_id'] == challenged_id or last_game['black_user_id'] == challenged_id):
                cursor.close()
                conn.close()
                return jsonify({'is_eligible': False, 'reason': 'You cannot challenge the same player consecutively.'}), 200

        cursor.close()
        conn.close()

        return jsonify({'is_eligible': True}), 200

    except Exception as e:
        return jsonify({'message': 'Failed to check eligibility', 'error': str(e)}), 500


@users_bp.route('/challenge/cancel', methods=['POST'])
@jwt_required()
def cancel_challenge():
    try:
        data = request.json
        challenger_email = data.get('challenger_email')
        challenged_email = data.get('challenged_email')

        if not challenger_email or not challenged_email:
            return jsonify({'message': 'Both challenger_email and challenged_email are required.'}), 400

        # Fetch the user IDs based on the provided emails
        challenger = get_user_by_email(challenger_email)
        challenged = get_user_by_email(challenged_email)

        if not challenger or not challenged:
            return jsonify({'message': 'Invalid challenger or challenged email.'}), 404

        challenger_id = challenger['user_id']
        challenged_id = challenged['user_id']

        # Update the status of the pending challenge to 'cancelled'
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''
            UPDATE challenge_requests
            SET status = 'cancelled'
            WHERE challenger_id = %s AND challenged_id = %s AND status IS NULL
            ''', (challenger_id, challenged_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Challenge cancelled successfully.'}), 200

    except Exception as e:
        return jsonify({'message': 'Failed to cancel challenge', 'error': str(e)}), 500
