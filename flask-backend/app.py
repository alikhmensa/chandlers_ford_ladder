from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)

def get_db_connection():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Qazxsw.2912",
        database="ladder_local"
    )
    return conn

@app.route('/')
def index():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT VERSION();')
    db_version = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify({'MySQL Version': db_version[0]})

if __name__ == "__main__":
    app.run(debug=True)
