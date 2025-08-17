# Philo AI - Philosophical Discussion Platform

A React-based web application that allows users to have philosophical discussions with AI-powered representations of famous philosophers.

## Prerequisites

- Node.js (v18 or higher)
- Python 3.8 or higher
- OpenAI API key
- AWS credentials (optional, for S3 storage)

## Setup

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd src/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the `src/backend` directory:

```bash
cd src/backend
touch .env
```

Add the following environment variables:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# AWS Configuration (optional, will use default credentials if not set)
AWS_DEFAULT_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here

# S3 Bucket name
S3_BUCKET=philo-ai
```

**Important**: You must set the `OPENAI_API_KEY` for the application to work.

## Running the Application

### Option 1: Run Frontend and Backend Separately

**Terminal 1 - Start the Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Start the Frontend:**
```bash
npm run dev
```

### Option 2: Run Both Simultaneously

```bash
npm run dev:full
```

This will start both the frontend (on port 8080) and backend (on port 5001) simultaneously.

## Accessing the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## Troubleshooting

### Common Issues

1. **500 Error when creating discussions**: 
   - Ensure the backend is running on port 5001
   - Check that `OPENAI_API_KEY` is set in your `.env` file
   - Verify AWS credentials if using S3 storage

2. **Backend won't start**:
   - Ensure Python dependencies are installed: `pip install -r requirements.txt`
   - Check that all required environment variables are set
   - Verify Python version compatibility

3. **Frontend can't connect to backend**:
   - Ensure the Vite proxy is working (check vite.config.ts)
   - Verify the backend is running on the correct port
   - Check CORS configuration

### Health Check

Visit `http://localhost:5001/api/health` to verify the backend status and identify any configuration issues.

## Project Structure

```
philo-ai/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── backend/            # Python Flask backend
│   │   ├── app.py          # Main Flask application
│   │   ├── requirements.txt # Python dependencies
│   │   └── .env            # Environment variables
│   └── ...
├── vite.config.ts          # Vite configuration with proxy
└── package.json            # Node.js dependencies and scripts
```

## API Endpoints

- `POST /api/discussions/` - Create a new philosophical discussion
- `GET /api/discussions/?id={userId}` - Get user discussions
- `GET /api/health` - Health check endpoint
- `GET /api/folder?prefix={prefix}` - Get folder contents from S3

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request 