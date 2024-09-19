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
    

@users_bp.route('/challenges/<string:userEmail>', methods=['GET'])
@jwt_required()
def user_challenges(userEmail):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch challenges with opponent's email
        cursor.execute('''
            SELECT u_opponent.full_name, u_opponent.email AS opponent_email, 'CHALLENGER' AS role
            FROM challenge_requests cr 
            LEFT JOIN users ui ON cr.challenger_id = ui.user_id
            LEFT JOIN users u_opponent ON cr.challenged_id = u_opponent.user_id
            WHERE ui.email = %s AND cr.status IS NULL

            UNION

            SELECT u_opponent.full_name, u_opponent.email AS opponent_email, 'CHALLENGED' AS role
            FROM challenge_requests cr 
            LEFT JOIN users uo ON cr.challenged_id = uo.user_id
            LEFT JOIN users u_opponent ON cr.challenger_id = u_opponent.user_id
            WHERE uo.email = %s AND cr.status IS NULL
        ''', (userEmail, userEmail))
        userChallenges = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(userChallenges), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch user challenges', 'error': str(e)}), 500

    

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

@users_bp.route('/challenge/accept', methods=['POST'])
@jwt_required()
def accept_challenge():
    try:
        data = request.json
        challenger_email = data.get('challenger_email')
        challenged_email = data.get('challenged_email')

        if not challenger_email or not challenged_email:
            return jsonify({'message': 'Both challenger_email and challenged_email are required.'}), 400

        # Fetch user IDs
        challenger = get_user_by_email(challenger_email)
        challenged = get_user_by_email(challenged_email)

        if not challenger or not challenged:
            return jsonify({'message': 'Invalid emails provided.'}), 404

        # Update challenge status to 'accepted'
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE challenge_requests
            SET status = 'accepted', response_time = NOW()
            WHERE challenger_id = %s AND challenged_id = %s AND status IS NULL
        ''', (challenger['user_id'], challenged['user_id']))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Challenge accepted successfully.'}), 200

    except Exception as e:
        return jsonify({'message': 'Failed to accept challenge', 'error': str(e)}), 500

@users_bp.route('/challenge/decline', methods=['POST'])
@jwt_required()
def decline_challenge():
    try:
        data = request.json
        challenger_email = data.get('challenger_email')
        challenged_email = data.get('challenged_email')
        response_reason = data.get('response_reason')

        if not challenger_email or not challenged_email or not response_reason:
            return jsonify({'message': 'All fields are required.'}), 400

        # Fetch user IDs
        challenger = get_user_by_email(challenger_email)
        challenged = get_user_by_email(challenged_email)

        if not challenger or not challenged:
            return jsonify({'message': 'Invalid emails provided.'}), 404

        # Update challenge status to 'declined' and add reason
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE challenge_requests
            SET status = 'rejected', response_reason = %s, response_time = NOW()
            WHERE challenger_id = %s AND challenged_id = %s AND status IS NULL
        ''', (response_reason, challenger['user_id'], challenged['user_id']))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Challenge declined successfully.'}), 200

    except Exception as e:
        return jsonify({'message': 'Failed to decline challenge', 'error': str(e)}), 500

@users_bp.route('/scheduled-game/<string:userEmail>', methods=['GET'])
@jwt_required()
def get_scheduled_game(userEmail):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch the accepted challenge without a match associated
        cursor.execute('''
            SELECT 
                cr.*, 
                IF(ui.email = %s, u_opponent.full_name, ui.full_name) AS opponent_name,
                IF(ui.email = %s, 'challenger', 'challenged') AS user_role
            FROM challenge_requests cr
            LEFT JOIN users ui ON cr.challenger_id = ui.user_id
            LEFT JOIN users u_opponent ON cr.challenged_id = u_opponent.user_id
            WHERE 
                (ui.email = %s OR u_opponent.email = %s)
                AND cr.status = 'accepted'
                AND NOT EXISTS (
                    SELECT 1 FROM matches m WHERE m.challenge_id = cr.challenge_id
                )
        ''', (userEmail, userEmail, userEmail, userEmail))
        
        scheduled_game = cursor.fetchone()
        cursor.close()
        conn.close()

        if scheduled_game:
            # Calculate the next Tuesday date
            from datetime import datetime, timedelta
            today = datetime.today()
            days_until_tuesday = (1 - today.weekday() + 7) % 7  # 0=Monday, 1=Tuesday,...,6=Sunday
            if days_until_tuesday == 0:
                days_until_tuesday = 7
            next_tuesday = today + timedelta(days=days_until_tuesday)

            # Add the next Tuesday date to the result
            scheduled_game['scheduled_date'] = next_tuesday.strftime('%Y-%m-%d')
            return jsonify(scheduled_game), 200
        else:
            return jsonify({'message': 'No scheduled game found.'}), 404

    except Exception as e:
        return jsonify({'message': 'Failed to fetch scheduled game', 'error': str(e)}), 500

@users_bp.route('/scheduled-game/cancel', methods=['POST'])
@jwt_required()
def cancel_scheduled_game():
    try:
        data = request.json
        challenge_id = data.get('challenge_id')
        response_reason = data.get('response_reason')

        if not challenge_id or not response_reason:
            return jsonify({'message': 'challenge_id and response_reason are required.'}), 400

        # Update the challenge status to 'cancelled' and add the reason
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE challenge_requests
            SET status = 'cancelled', response_reason = %s, response_time = NOW()
            WHERE challenge_id = %s AND status = 'accepted'
        ''', (response_reason, challenge_id))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Scheduled game cancelled successfully.'}), 200

    except Exception as e:
        return jsonify({'message': 'Failed to cancel scheduled game', 'error': str(e)}), 500

