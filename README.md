# SlotSwapper: A Full-Stack Time-Slot Swapping Application

SlotSwapper is a dynamic, peer-to-peer scheduling application built with a modern tech stack. The platform allows users to manage their calendar, mark busy time slots as "swappable," and browse a marketplace of other users' available slots. The core of the application is a real-time request and response system, enabling users to propose, accept, or reject trades instantly.

This project is a complete full-stack implementation, featuring a secure RESTful API backend built with Node.js and Express, a PostgreSQL database, and a responsive frontend built with React. It includes JWT-based authentication, real-time WebSocket notifications, and is fully containerized with Docker for consistent and easy local development.

**Live Deployed Application:** [Link to your Vercel URL will go here after you deploy]

---

## Features

- **Full User Authentication:** Secure user registration and login using JWT for session management.
- **Dynamic Event Management:** Users can perform full CRUD (Create, Read, Update, Delete) operations on their personal calendar events.
- **Swapping Marketplace:** A dedicated view where users can browse all "swappable" time slots from other users across the platform.
- **Request & Response System:** A transactional swap-handling system. Making a request temporarily reserves both slots, and an acceptance permanently swaps ownership in the database.
- **Real-Time WebSocket Notifications:** Instant alerts for users when they receive a new swap request or when their own request is accepted or rejected, eliminating the need to refresh the page.
- **Clean, Minimal UI:** A responsive and intuitive user interface built with React, focused on clarity and ease of use.

---

## Technical Stack

| Area | Technology |
| :--- | :--- |
| **Frontend** | React (with Vite), React Router, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JSON Web Tokens (JWT), bcrypt.js |
| **Real-Time** | Socket.IO (WebSockets) |
| **Testing** | Jest, Supertest |
| **Containerization** | Docker, Docker Compose |

---

## Challenges & Learning

Building SlotSwapper involved several interesting technical challenges. A primary hurdle was debugging a persistent database authentication failure within the Docker environment. The issue was traced to a subtle configuration mismatch between `docker-compose.yml` and the `.env` file, compounded by the PostgreSQL container's default `scram-sha-256` authentication method, which had compatibility issues with the Node.js `pg` driver. This was definitively resolved by enforcing the `trust` authentication method for the local Docker network, highlighting the importance of explicit and robust container configuration.

Another key learning experience was implementing the real-time notification system. Making the `RequestsPage` update instantly required creating a global custom event system in the browser. A `Navbar` component listens for incoming WebSocket messages and dispatches a `requestsUpdated` event, which the `RequestsPage` then listens for to trigger a data re-fetch, successfully decoupling the components while achieving a real-time feel.

---

## Local Development Setup (Docker - Recommended)

This is the easiest and most reliable way to run the project.

**Prerequisites:**
- Docker Desktop installed and running.
- Node.js and npm (for running the frontend locally).

### 1. Clone the Repository
```bash
git clone https://github.com/[Your-Username]/[Your-Repo-Name].git
cd SlotSwapper


2. Configure Environment Files
    Backend: In the /backend directory, copy .env.example to a new file named .env. The default values are configured to work with the Docker setup. You can change the JWT_SECRET to a new random string if you wish.
    Docker Compose: The docker-compose.yml file is pre-configured. The POSTGRES_PASSWORD is set to postgres.


3. Build and Run Containers
    From the project's root directory, run:
      
    docker-compose up --build

    This will start the backend server and the PostgreSQL database. The backend will be available at `http://localhost:5000`.

4. Initialize the Database (First Time Only)
    - Open a **new terminal window**.
    - Execute the following command to access the database container:

    docker exec -it slotswapper-db psql -U postgres -d slotswapper
    Copy the entire contents of /backend/database.sql and paste it into the psql prompt, then press Enter. Type \q to exit.

5. Run the Frontend
    In a new, separate terminal, navigate to the /frontend directory.
    Run npm install followed by npm run dev.
    The application will be available at http://localhost:5173.

API Endpoints
Method	  Endpoint	              Description	Protected
POST	    /api/auth/signup	          Register a new user.	No
POST	    /api/auth/login	            Log in a user and receive a JWT.	No
GET	      /api/events	                  Get events for the logged-in user 
POST	    /api/events	                Create a new event for the user.	Yes
PUT	      /api/events/:id	              Update an event's status.	Yes
GET	      /api/swaps/available	        Get all swappable slots from other users.	Yes
GET	      /api/swaps/requests	          Get all pending requests for the user.	Yes
POST	    /api/swaps/request	        Create a new swap request.	Yes
POST	    /api/swaps/response/:reqId	Respond (accept/reject) to a swap request.	Yes    
      