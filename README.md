# Task Manager API

A full-stack task management application with user authentication, built with Node.js, Express, SQLite, and vanilla JavaScript.

## 🚀 Features

- User registration and login with JWT authentication
- Create, read, update and delete tasks
- Due dates with overdue detection
- Search tasks by title
- Filter tasks by status (All, Pending, Done, Overdue)
- Code task integration — open files directly in VS Code
- Stats dashboard (Total, Pending, Done, Overdue)
- Each user can only access their own tasks

## 🛠 Technologies

**Backend**
- Node.js
- Express
- SQLite3
- JWT Authentication
- Bcrypt

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript

## 📁 Project Structure

    task-manager-api/
    ├── public/
    │   ├── index.html
    │   ├── style.css
    │   └── app.js
    ├── src/
    │   ├── config/
    │   │   └── database.js
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   └── taskController.js
    │   ├── middlewares/
    │   │   └── authMiddleware.js
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   └── taskRoutes.js
    │   └── services/
    │       ├── userService.js
    │       └── taskService.js
    ├── server.js
    └── package.json

## ⚙️ Getting Started

### Prerequisites
- Node.js installed

### Installation

    git clone https://github.com/FelipeBacelar154/task-manager-api.git
    cd task-manager-api
    npm install

### Environment Variables

Create a `.env` file in the root directory:

    PORT=3000
    JWT_SECRET=your_secret_key

### Running the server

    npm run dev

Open `http://localhost:3000` in your browser.

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login and get token |

### Tasks (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | List all tasks |
| GET | /tasks?search=keyword | Search tasks by title |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |

## 👨‍💻 Author

Felipe Bacelar - [GitHub](https://github.com/FelipeBacelar154)