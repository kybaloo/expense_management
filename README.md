# Personal Expense Management Web Application

A full-stack web application for managing personal finances with income/expense tracking, categorization, and visual analytics.

## Features

- 🔐 **Authentication**: Secure signup/login with JWT
- 💸 **Transaction Management**: Add, edit, delete income and expenses
- 📊 **Dashboard**: Visual analytics with charts and balance tracking
- 🗂️ **Categories**: Customizable expense categories
- 📱 **Responsive Design**: Modern UI with Tailwind CSS
- 📤 **Export**: CSV and PDF export capabilities

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Recharts
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Quick Setup

#### Option 1: Using PowerShell Setup Script (Windows)
```powershell
# Run the setup script
.\setup.ps1
```

#### Option 2: Manual Setup
1. Clone the repository
```bash
git clone <repository-url>
cd expense_management
```

2. Install dependencies for all parts
```bash
npm run install-deps
```

3. Set up environment variables

Create `.env` file in the backend directory (copy from `.env.example`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense_management
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_this_in_production
CLIENT_URL=http://localhost:3000
```

**Important**: Change the JWT secrets for production use!

4. Start the development servers
```bash
npm run dev
```

This will start both the frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

### MongoDB Setup

#### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. The application will automatically create the database

#### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env`

## Project Structure

```
expense_management/
├── frontend/          # React frontend
├── backend/           # Express backend
├── package.json       # Root package.json with scripts
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create custom category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts` - Get chart data

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/build`

### Backend (Render/Railway)
1. Deploy from the `backend` directory
2. Set environment variables
3. Use `npm start` as the start command

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Update `MONGODB_URI` in your environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
