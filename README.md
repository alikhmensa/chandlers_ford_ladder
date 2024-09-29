
# Chess Ladder Competition Website

This repository hosts a web application for managing a chess ladder competition within our club. It uses a **Flask** backend, **Angular** frontend, and **MySQL** database to create a seamless experience for tracking and managing player rankings, match results, and other competition-related details.

## Features

- **User Registration & Authentication**: Secure user sign-up and login using Flask and JWT-based authentication.
- **Match Scheduling**: Players can schedule and log matches, with results automatically affecting ladder rankings.
- **Real-time Updates**: Rankings and match data update in real-time, providing the latest competition standings.
- **Responsive UI**: An Angular-based frontend ensures an intuitive and responsive user interface.
- **Admin Dashboard**: Admins can manage players, update match results, and monitor overall competition activity.

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: Angular
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Hosting**: Can be deployed on any server or cloud service (e.g., AWS, Azure, Heroku)

## Getting Started

### Prerequisites

- Python 3.x
- Node.js and npm
- MySQL
- Angular CLI

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/chess-ladder.git
   cd chess-ladder
   ```

2. **Backend Setup:**
   - Navigate to the `backend` directory:
     ```bash
     cd backend
     ```
   - Create a virtual environment and install dependencies:
     ```bash
     python3 -m venv venv
     source venv/bin/activate  # On Windows: venv\Scripts\activate
     pip install -r requirements.txt
     ```
   - Set up the MySQL database by creating a database named `chess_ladder` and updating the `config.py` file with your MySQL credentials.
   - Initialize the database:
     ```bash
     flask db init
     flask db migrate
     flask db upgrade
     ```
   - Start the Flask server:
     ```bash
     flask run
     ```

3. **Frontend Setup:**
   - Navigate to the `frontend` directory:
     ```bash
     cd ../frontend
     ```
   - Install Angular dependencies:
     ```bash
     npm install
     ```
   - Run the Angular application:
     ```bash
     ng serve
     ```

4. **Access the Application:**
   - Frontend: `http://localhost:4200`
   - Backend: `http://localhost:5000`

## Usage

- Register or log in to access the ladder competition features.
- Challenge other players, log match results, and view updated rankings.
- Admin users can manage competition details from the admin dashboard.

## Contribution

Contributions are welcome! Please fork the repository and submit a pull request with your changes. Ensure your code follows the style guidelines.


## Contact

For any queries or suggestions, feel free to reach out to me at alikhmensa@gmail.com
