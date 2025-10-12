# Prepwise Frontend

A modern React frontend built with Vite for the Prepwise AI-powered interview preparation platform.

## ✨ Features

- 🔐 **Authentication** - Secure login and registration
- 📝 **Interview Setup** - Customizable interview configuration
- 💬 **Interactive Interviews** - Real-time question answering with webcam support
- 📊 **Results & Analytics** - Detailed performance analysis with working charts
- 👤 **Enhanced Profile** - Profile image upload, password change, and analytics
- 🎥 **Webcam Integration** - Optional facial analysis during interviews
- 🎨 **Modern UI** - Built with Tailwind CSS and responsive design

## 🚀 Tech Stack

- **React 18** - Frontend framework with JSX
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Webcam** - Camera integration
- **Context API** - State management

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- Prepwise Backend running on port 5000

### Installation

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🔗 API Integration

The frontend integrates with the Prepwise backend API using:

- **Submit All Answers** - Bulk answer submission (not individual)
- **Webcam Capture** - Optional facial analysis integration
- **Profile Management** - Image upload and password change
- **Real-time Validation** - Form validation and error handling
- **Secure Authentication** - JWT token management
- **Working Analytics** - Performance charts and statistics

## 🎯 Key Features

### Enhanced Interview Flow

1. Setup interview with tech stack and preferences
2. Optional webcam activation for facial analysis
3. Answer questions with real-time progress tracking
4. Submit all answers at once using the submit-all API
5. View detailed results and recommendations

### Profile Management

- Profile image upload and management
- Password change functionality (email is read-only)
- Working analytics with performance charts
- Interview history and statistics

### User Experience

- Clean, intuitive interface with JSX components
- Webcam integration for facial analysis
- Progress tracking during interviews
- Responsive design for all devices
- Real-time feedback and validation

## 📜 Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

## 🎥 New Features

### Webcam Integration

- Optional camera access during interviews
- Real-time video preview
- Capture functionality for facial analysis
- Privacy-focused (user controlled)

### Enhanced Profile

- Profile image upload with preview
- Password change with validation
- Email field is read-only for security
- Working analytics dashboard

### Working Analytics

- Performance over time charts
- Skills breakdown visualization
- Recent activity tracking
- Statistical insights

## 🏗️ Project Structure

```
src/
├── components/          # Reusable JSX components
│   ├── WebcamCapture.jsx   # Webcam integration
│   ├── LoadingSpinner.jsx  # Loading states
│   └── ...
├── contexts/           # React Context providers
├── pages/              # Main page components (all JSX)
├── services/           # API service layer
└── main.jsx           # Vite entry point
```
