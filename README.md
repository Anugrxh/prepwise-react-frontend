# PrepWise Frontend - AI Interview Platform 🚀

A cutting-edge React frontend for the PrepWise AI-powered interview preparation platform. Features a stunning dark theme with glass morphism effects, comprehensive API integration, voice-powered interviews with Vapi AI, and advanced performance analytics.

## 🌟 Latest Features

### 🎨 Dark Theme with Glass Morphism

- **Liquid Glass Effects**: Beautiful backdrop blur and transparency effects
- **Aurora Backgrounds**: Dynamic gradient backgrounds with floating animations
- **Violet Color Palette**: Modern purple/violet accent colors throughout
- **Consistent Dark UI**: All components optimized for dark theme visibility

### 🎤 Voice-Powered Interviews

- **Vapi AI Integration**: Real-time speech-to-text during interviews
- **Live Transcription**: See your spoken answers appear in real-time
- **AI Assistant**: Voice-guided interview experience with question reading
- **Hybrid Input**: Speak or type your answers seamlessly

### 📱 Mobile-First Responsive Design

- **Adaptive Layouts**: Perfect experience on all screen sizes
- **Touch-Optimized**: Mobile-friendly interactions and navigation
- **Flexible Components**: Cards and layouts that adapt to screen width
- **Consistent Spacing**: Proper gaps and padding across devices

## ✨ Key Enhancements

### 🎨 Modern UI/UX

- **Framer Motion Animations**: Smooth page transitions, hover effects, and micro-interactions
- **Professional Design**: Clean, modern interface with consistent color palette
- **Enhanced Components**: Custom Card, Button, Badge, and ProgressBar components
- **Toast Notifications**: Real-time feedback using react-hot-toast
- **Responsive Layout**: Optimized for all screen sizes

### 🔗 Complete API Integration

- **All Backend Endpoints**: Integrated every API from the PrepWise backend documentation
- **User Management**: Profile updates, password changes, image uploads
- **Interview Lifecycle**: Generate, start, submit answers, complete, delete interviews
- **Results & Analytics**: Comprehensive performance tracking and insights
- **Answer Management**: Single and bulk answer submission with facial analysis

### 📊 Advanced Analytics Dashboard

- **Performance Metrics**: Detailed statistics and trends
- **Category Breakdown**: Technical knowledge, communication, problem-solving scores
- **Progress Tracking**: Weekly goals, streaks, and improvement trends
- **Visual Charts**: Interactive progress bars and performance indicators
- **Insights**: AI-powered recommendations and performance insights

### 🎯 Enhanced Features

- **Interview History**: Advanced filtering, sorting, and management
- **Real-time Updates**: Live progress tracking and status updates
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Loading States**: Beautiful loading animations and skeleton screens
- **Accessibility**: WCAG compliant components and interactions

## 🛠️ Tech Stack

### Core Technologies

- **React 18** - Latest React with hooks and concurrent features
- **React Router DOM 6** - Modern routing with data loading
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### Enhanced Libraries

- **Framer Motion** - Production-ready motion library for React
- **React Hot Toast** - Beautiful, customizable toast notifications
- **Lucide React** - Beautiful & consistent icon toolkit
- **Axios** - Promise-based HTTP client
- **Vapi AI** - Voice-powered interview assistant integration

### Development Tools

- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Automatic CSS vendor prefixing

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PrepWise Backend API running on port 5000

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd prepwise-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

4. **Configure Environment Variables**

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## 📁 Project Structure

```
prepwise-frontend/
├── public/                 # Static Assets
│   ├── vite.svg           # Vite logo
│   └── favicon.ico        # App favicon
├── src/
│   ├── components/        # Reusable UI Components
│   │   ├── Alert.jsx      # Toast notifications & alerts
│   │   ├── AnalyticsDashboard.jsx  # Performance analytics dashboard
│   │   ├── Badge.jsx      # Status badges with glass effects
│   │   ├── Button.jsx     # Enhanced buttons with gradients
│   │   ├── Card.jsx       # Glass morphism card containers
│   │   ├── InterviewHistory.jsx    # Interview management table
│   │   ├── LoadingSpinner.jsx      # Animated loading states
│   │   ├── Navbar.jsx     # Navigation with glass effects
│   │   ├── ProgressBar.jsx         # Animated progress indicators
│   │   ├── ProtectedRoute.jsx      # Authentication guard
│   │   └── WebcamCapture.jsx       # Facial analysis webcam
│   ├── contexts/          # React Context Providers
│   │   ├── AuthContext.jsx         # User authentication state
│   │   ├── DataContext.jsx         # Centralized data management
│   │   └── InterviewContext.jsx    # Interview session state
│   ├── hooks/             # Custom React Hooks
│   │   └── useAuthCache.js         # Authentication caching
│   ├── pages/             # Main Application Pages
│   │   ├── Dashboard.jsx  # Main dashboard with stats
│   │   ├── Interview.jsx  # Voice-powered interview session
│   │   ├── InterviewSetup.jsx      # Interview configuration
│   │   ├── Login.jsx      # Beautiful login with animations
│   │   ├── NotFound.jsx   # 404 error page
│   │   ├── Profile.jsx    # User profile with tabs
│   │   ├── Register.jsx   # Registration with validation
│   │   └── Results.jsx    # Comprehensive results display
│   ├── services/          # API Integration Layer
│   │   └── api.jsx        # Complete backend API integration
│   ├── App.jsx            # Main app component with routing
│   ├── main.jsx           # React 18 root with StrictMode
│   └── index.css          # Global styles with dark theme
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore patterns
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.js        # Vite build configuration
├── prepwise.md           # Backend API documentation
└── README.md             # This file
```

## � CPomplete Interview Workflow

### 1. User Authentication

```
Login/Register → JWT Token → Profile Setup → Dashboard Access
```

### 2. Interview Generation

```
Setup Page → AI Generation → Questions Created → Ready to Start
```

### 3. Voice-Powered Interview Session

```
Start Interview → Vapi AI Connects → Voice Questions → Speech-to-Text → Answer Capture
```

### 4. Results & Analytics

```
Submit Answers → AI Evaluation → Grade Calculation → Performance Analytics
```

## 🎯 Grading System

### Grade Scale (Backend API Aligned)

| Grade  | Score Range | Performance Level | Status  |
| ------ | ----------- | ----------------- | ------- |
| **A+** | 95-100%     | Excellent         | ✅ PASS |
| **A**  | 90-94%      | Excellent         | ✅ PASS |
| **B+** | 85-89%      | Very Good         | ✅ PASS |
| **B**  | 80-84%      | Very Good         | ✅ PASS |
| **C+** | 75-79%      | Good              | ✅ PASS |
| **C**  | 70-74%      | Good              | ✅ PASS |
| **D**  | 60-69%      | Average           | ❌ FAIL |
| **F**  | 0-59%       | Poor              | ❌ FAIL |

### Passing Criteria

- **Pass Threshold:** 70% or higher
- **Grade Colors:** Green (A), Blue (B), Yellow (C), Orange (D), Red (F)

## 🔌 API Integration

### Complete Backend Integration

- ✅ **Authentication:** Login, register, password management, profile updates
- ✅ **User Management:** Profile images, statistics, account management
- ✅ **Interview Lifecycle:** Generate, start, submit, complete, delete
- ✅ **Answer System:** Single/bulk submission, facial analysis, AI evaluation
- ✅ **Results & Analytics:** Performance tracking, grade calculation, insights
- ✅ **Data Caching:** Intelligent caching with invalidation strategies

## 🎨 Design System

### Glass Morphism Theme

- **Backdrop Blur**: `backdrop-blur-sm` effects on all containers
- **Transparency**: Semi-transparent backgrounds with `bg-white/10`
- **Borders**: Subtle borders with `border-white/20`
- **Shadows**: Enhanced shadows for depth and elevation

### Color Palette

- **Primary**: Violet/Purple gradients (`violet-500`, `violet-600`)
- **Success**: Emerald greens (`emerald-400`, `emerald-500`)
- **Warning**: Amber yellows (`amber-400`, `amber-500`)
- **Danger**: Red variants (`red-400`, `red-500`)
- **Text**: White and light gray for dark theme visibility

### Animation System

- **Framer Motion**: Smooth page transitions and micro-interactions
- **Staggered Animations**: Sequential element appearances with delays
- **Hover Effects**: Card lifts, button glows, and scale transforms
- **Loading States**: Spinning animations and skeleton screens

### Mobile Responsiveness

- **Breakpoints**: `sm:`, `md:`, `lg:` for different screen sizes
- **Flexible Layouts**: `flex-col sm:flex-row` for adaptive layouts
- **Touch Targets**: Proper button sizes for mobile interaction
- **Spacing**: Consistent gaps and padding across devices

## 🎤 Voice Interview Features

### Vapi AI Integration

- **Real-time Speech Recognition**: Convert speech to text instantly
- **AI Assistant**: Voice-guided interview experience
- **Question Reading**: AI reads questions aloud to candidates
- **Hybrid Input**: Seamlessly switch between voice and typing

### Interview Session Flow

1. **Connection**: Automatic Vapi connection on interview start
2. **Greeting**: AI assistant welcomes and explains the process
3. **Question Flow**: AI asks questions and waits for responses
4. **Transcription**: Live speech-to-text with visual feedback
5. **Navigation**: Voice or manual navigation between questions
6. **Completion**: AI confirms submission and provides next steps

### Technical Implementation

- **Vapi SDK**: `@vapi-ai/web` for voice functionality
- **State Management**: Robust state handling for voice sessions
- **Error Handling**: Graceful fallbacks when voice fails
- **Manual Controls**: Backup buttons for all voice actions

## 📊 Analytics & Performance

### Dashboard Metrics

- **Interview Statistics**: Total, completed, average scores
- **Performance Trends**: Score improvements over time
- **Category Breakdown**: Technical, communication, problem-solving
- **Status Distribution**: Generated, in-progress, completed interviews

### Results Analysis

- **Comprehensive Scoring**: 5-category evaluation system
- **AI Feedback**: Detailed strengths, weaknesses, recommendations
- **Grade Calculation**: Automatic letter grade assignment
- **Performance Insights**: Actionable improvement suggestions

### Data Management

- **Intelligent Caching**: Reduce API calls by 60-80%
- **Cache Invalidation**: Automatic updates on data changes
- **User-Specific Caching**: Prevent data leakage between users
- **Optimistic Updates**: Immediate UI feedback

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build optimized production bundle
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality

# Maintenance
npm audit            # Check for security vulnerabilities
npm update           # Update dependencies to latest versions
```

## 🌐 Environment Configuration

### Development

```env
VITE_API_URL=http://localhost:5000/api
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key
VITE_VAPI_ASSISTANT_ID=your-vapi-assistant-id
```

### Production

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_VAPI_PUBLIC_KEY=your-production-vapi-key
VITE_VAPI_ASSISTANT_ID=your-production-assistant-id
```

### Required Services

- **Backend API**: PrepWise Node.js backend on port 5000
- **Vapi AI**: Voice assistant service for interview sessions
- **MongoDB**: Database for user data and interview storage

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📝 Code Style

- **ESLint**: Enforced code quality and consistency
- **Prettier**: Automatic code formatting
- **Component Structure**: Functional components with hooks
- **File Naming**: PascalCase for components, camelCase for utilities

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**

   - Verify backend is running on port 5000
   - Check VITE_API_URL in .env file
   - Ensure CORS is configured on backend

2. **Voice/Vapi Issues**

   - Check microphone permissions in browser
   - Verify VAPI keys in .env file
   - Test microphone with browser's built-in tools
   - Use manual start button if auto-start fails

3. **Build Errors**

   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check for ESLint errors in console
   - Verify all imports are correct

4. **Performance Issues**
   - Check for memory leaks in useEffect hooks
   - Optimize large component trees
   - Monitor network requests in DevTools
   - Clear browser cache and localStorage

### Debug Tools

- **Console Logging**: Comprehensive debug logs for API calls and voice sessions
- **Network Tab**: Monitor API requests and responses
- **React DevTools**: Inspect component state and props
- **Performance Tab**: Analyze rendering performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Futnure Enhancements

### Planned Features

- **Video Recording**: Full interview recording with playback
- **AI Coaching**: Real-time feedback during interviews
- **Mock Interview Scheduling**: Calendar integration for practice sessions
- **Team Collaboration**: Share results with mentors or recruiters
- **Advanced Analytics**: Machine learning insights and predictions

### Technical Improvements

- **PWA Support**: Offline functionality and app installation
- **WebRTC Integration**: Peer-to-peer video interviews
- **Advanced Caching**: Service worker implementation
- **Performance Monitoring**: Real-time performance tracking

## 🙏 Acknowledgments

- **Vapi AI** for voice-powered interview capabilities
- **Framer Motion** for beautiful animations and transitions
- **Tailwind CSS** for rapid UI development and dark theme
- **Lucide React** for consistent iconography
- **React Hot Toast** for elegant notification system
- **PrepWise Backend** for comprehensive API integration

---

**Built with ❤️ for the future of AI-powered interview preparation**

_Empowering candidates with cutting-edge technology and beautiful user experiences_
