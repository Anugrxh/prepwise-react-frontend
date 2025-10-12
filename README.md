# PrepWise Frontend - Enhanced Edition 🚀

A modern, feature-rich React frontend for the PrepWise AI-powered interview preparation platform. This enhanced version includes comprehensive API integration, beautiful animations, and a professional user experience.

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
src/
├── components/              # Enhanced UI Components
│   ├── Alert.jsx           # Alert notifications
│   ├── AnalyticsDashboard.jsx  # Comprehensive analytics
│   ├── Badge.jsx           # Status badges with variants
│   ├── Button.jsx          # Enhanced button component
│   ├── Card.jsx            # Animated card container
│   ├── InterviewHistory.jsx    # Advanced interview management
│   ├── LoadingSpinner.jsx  # Loading animations
│   ├── Navbar.jsx          # Navigation header
│   ├── ProgressBar.jsx     # Animated progress indicators
│   ├── ProtectedRoute.jsx  # Route protection
│   ├── Toast.jsx           # Toast notification system
│   └── WebcamCapture.jsx   # Webcam integration
├── contexts/               # State Management
│   ├── AuthContext.jsx     # Authentication state
│   └── InterviewContext.jsx    # Interview management
├── pages/                  # Page Components
│   ├── Dashboard.jsx       # Enhanced dashboard with analytics
│   ├── Interview.jsx       # Interview session interface
│   ├── InterviewSetup.jsx  # Interview configuration
│   ├── Login.jsx           # Authentication
│   ├── NotFound.jsx        # 404 page
│   ├── Profile.jsx         # User profile with tabs
│   ├── Register.jsx        # User registration
│   └── Results.jsx         # Enhanced results display
├── services/               # API Integration
│   └── api.jsx             # Complete API service layer
├── App.jsx                 # Main application component
├── main.jsx                # Application entry point
└── index.css               # Enhanced global styles
```

## 🔌 API Integration

### Authentication Endpoints
- ✅ User registration and login
- ✅ Password management
- ✅ Profile updates
- ✅ Image upload support

### Interview Management
- ✅ AI-powered interview generation
- ✅ Interview lifecycle management
- ✅ Real-time status tracking
- ✅ Interview deletion and cleanup

### Answer & Results System
- ✅ Single answer submission
- ✅ Bulk answer submission
- ✅ Facial analysis integration
- ✅ AI evaluation and scoring
- ✅ Comprehensive results generation

### Analytics & Insights
- ✅ Performance analytics
- ✅ User statistics
- ✅ Progress tracking
- ✅ Comparative analysis

## 🎨 UI/UX Features

### Animation System
- **Page Transitions**: Smooth enter/exit animations
- **Micro-interactions**: Button hovers, card lifts, loading states
- **Progress Animations**: Animated progress bars and counters
- **Staggered Animations**: Sequential element appearances

### Design System
- **Color Palette**: Professional blue, green, yellow, and red variants
- **Typography**: Consistent font hierarchy and spacing
- **Components**: Reusable, accessible UI components
- **Responsive**: Mobile-first design approach

### User Experience
- **Toast Notifications**: Real-time feedback for all actions
- **Loading States**: Beautiful loading animations
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful guidance when no data exists

## 📊 Analytics Dashboard

### Performance Metrics
- Total interviews and completion rates
- Average scores and best performance
- Weekly progress and goal tracking
- Current streak and consistency metrics

### Category Analysis
- Technical knowledge assessment
- Communication skills evaluation
- Problem-solving capabilities
- Confidence and presentation analysis

### Visual Insights
- Performance trends over time
- Grade distribution charts
- Category breakdown with progress bars
- Improvement recommendations

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
```

### Production
```env
VITE_API_URL=https://your-api-domain.com/api
```

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

2. **Build Errors**
   - Clear node_modules and reinstall
   - Check for TypeScript errors in console
   - Verify all imports are correct

3. **Animation Performance**
   - Reduce motion for users with motion sensitivity
   - Check for memory leaks in useEffect hooks
   - Optimize large component trees

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Framer Motion** for beautiful animations
- **Tailwind CSS** for rapid UI development
- **Lucide** for consistent iconography
- **React Hot Toast** for notification system

---

**Built with ❤️ for better interview preparation experiences**