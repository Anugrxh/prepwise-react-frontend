# PrepWise Frontend Workflow Documentation

## Project Overview
PrepWise is an AI-powered interview preparation platform that combines voice interaction, facial analysis, and comprehensive performance analytics to help users practice technical interviews.

## Technology Stack
- **Frontend Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Context API (AuthContext, InterviewContext, DataContext)
- **HTTP Client**: Axios with interceptors
- **Voice AI**: Vapi AI integration
- **Video Capture**: React Webcam
- **Animations**: Framer Motion
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast

## Application Architecture

### Context Providers Hierarchy
```
App
├── AuthProvider (Authentication & User Management)
├── InterviewProvider (Interview State & Operations)
└── DataProvider (Centralized Data Fetching & Caching)
    └── Router (React Router)
        └── AppContent (Main Application)
```

## User Workflow

### 1. Authentication Flow
```
Landing → Login/Register → Dashboard
```

**Pages Involved:**
- `Login.jsx` - User authentication
- `Register.jsx` - New user registration
- `Dashboard.jsx` - Main user dashboard

**Key Features:**
- JWT token-based authentication
- Automatic token validation and refresh
- Protected routes with `ProtectedRoute` component
- User profile image support
- Persistent login state

### 2. Interview Preparation Flow
```
Dashboard → Interview Setup → Interview Session → Results
```

#### Step 2.1: Interview Setup
**Page:** `InterviewSetup.jsx`

**User Actions:**
- Select technology stack (JavaScript, React, Python, etc.)
- Choose difficulty level (Easy, Medium, Hard)
- Set experience level (Junior, Mid, Senior)
- Configure number of questions (3-10)
- Add custom technologies

**Data Flow:**
- Form validation
- API call to generate interview questions
- Navigation to interview session

#### Step 2.2: Interview Session
**Page:** `Interview.jsx`

**Features:**
- **Voice Interaction**: Vapi AI integration for natural conversation
- **Video Recording**: Webcam capture for facial analysis
- **Real-time Question Display**: Dynamic question progression
- **Answer Recording**: Text and voice input capture
- **Timer Tracking**: Question and total interview duration
- **Facial Analysis**: Real-time emotion and confidence detection

**Session Flow:**
1. Interview initialization and camera setup
2. Start interview and begin recording
3. Question-by-question progression with Vapi AI
4. Answer capture (voice + text)
5. Facial analysis processing
6. Session completion and data submission

#### Step 2.3: Results Analysis
**Page:** `Results.jsx`

**Analytics Provided:**
- Overall interview score
- Question-wise performance breakdown
- Facial analysis insights (confidence, emotions)
- Technical skill assessment
- Improvement recommendations
- Performance trends

### 3. Profile Management Flow
```
Dashboard → Profile → Settings/Analytics
```

**Page:** `Profile.jsx`

**Features:**
- User profile editing
- Profile image upload
- Password change
- Performance analytics dashboard
- Interview history
- Account management

## State Management Architecture

### AuthContext
**Purpose:** User authentication and session management

**State:**
- `user` - Current user object
- `loading` - Authentication loading state
- `error` - Authentication errors
- `isAuthenticated` - Boolean authentication status

**Methods:**
- `login(credentials)` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `updateUser(userData)` - Update user profile

### InterviewContext
**Purpose:** Interview session management and operations

**State:**
- `currentInterview` - Active interview object
- `interviews` - User's interview history
- `answers` - Current session answers
- `results` - Interview results data
- `loading` - Operation loading states
- `error` - Operation errors

**Methods:**
- `generateInterview(data)` - Create new interview
- `startInterview(id)` - Begin interview session
- `submitAllAnswers(data)` - Submit complete interview
- `completeInterview(id)` - Finalize interview
- `generateResults(id)` - Process interview results
- `getInterviewStats()` - Fetch user statistics

### DataContext
**Purpose:** Centralized data fetching and caching

**Features:**
- API response caching with TTL
- User-specific cache keys
- Cache invalidation strategies
- Optimized data fetching for dashboard
- Performance analytics caching

**Methods:**
- `fetchDashboardData()` - Load dashboard data
- `fetchProfileAnalytics()` - Load user analytics
- `invalidateInterviewData()` - Clear interview cache
- `invalidateAnalyticsData()` - Clear analytics cache

## API Integration

### Backend Services
- **Node.js/Express API** (Port 5000) - Main application backend
- **Django Facial Analysis** (Port 8000) - Computer vision processing
- **Vapi AI** - Voice interaction service

### API Endpoints Structure
```
/api/auth/* - Authentication endpoints
/api/interviews/* - Interview management
/api/answers/* - Answer submission and retrieval
/api/results/* - Results generation and analytics
/api/users/* - User profile management
/api/facial-analysis/* - Facial analysis processing
```

## Component Architecture

### Core Components
- `Navbar.jsx` - Navigation header
- `ProtectedRoute.jsx` - Route authentication guard
- `LoadingSpinner.jsx` - Loading states
- `Toast.jsx` - Notification system
- `Alert.jsx` - Alert messages
- `Card.jsx` - Reusable card component
- `Button.jsx` - Styled button component
- `Badge.jsx` - Status badges

### Specialized Components
- `WebcamCapture.jsx` - Video recording functionality
- `ApiDebugPanel.jsx` - Development debugging
- `CacheManager.jsx` - Cache management interface

## Performance Optimizations

### Code Splitting
- Lazy loading of all page components
- Suspense boundaries with loading fallbacks
- Route-based code splitting

### Caching Strategy
- API response caching with configurable TTL
- User-specific cache keys
- Intelligent cache invalidation
- Local storage for user session persistence

### Data Fetching
- Promise.allSettled for parallel API calls
- Error boundary handling
- Optimistic UI updates
- Background data refresh

## Security Features

### Authentication Security
- JWT token-based authentication
- Automatic token refresh
- Secure token storage
- Route protection
- Session timeout handling

### API Security
- Request/response interceptors
- Automatic logout on 401 errors
- CORS configuration
- Input validation and sanitization

## Development Features

### Debug Tools
- API debug panel for development
- Cache statistics and management
- Console logging for data flow tracking
- Error boundary components

### Environment Configuration
- Environment-based API URLs
- Development vs production builds
- Feature flags support

## Error Handling

### Global Error Management
- Context-level error states
- Toast notifications for user feedback
- Graceful degradation for failed API calls
- Retry mechanisms for critical operations

### User Experience
- Loading states for all async operations
- Optimistic UI updates
- Offline state handling
- Progressive enhancement

## Future Enhancements

### Planned Features
- Real-time collaboration
- Advanced analytics dashboard
- Mobile responsive improvements
- Offline interview practice
- Multi-language support
- Integration with job platforms

### Technical Improvements
- Service worker implementation
- Advanced caching strategies
- Performance monitoring
- A/B testing framework
- Automated testing suite
---


# Entity Relationship (ER) Diagram Data Structure

## Database Entities and Relationships

### 1. User Entity
**Table:** `users`

**Attributes:**
- `id` (Primary Key) - UUID/ObjectId
- `name` - String (required)
- `email` - String (unique, required)
- `password` - String (hashed, required)
- `profileImage` - String (URL/path, optional)
- `createdAt` - DateTime
- `updatedAt` - DateTime
- `lastLoginAt` - DateTime
- `isActive` - Boolean (default: true)
- `role` - Enum ['user', 'admin'] (default: 'user')

**Relationships:**
- One-to-Many with Interviews
- One-to-Many with Results
- One-to-Many with Answers

### 2. Interview Entity
**Table:** `interviews`

**Attributes:**
- `id` (Primary Key) - UUID/ObjectId
- `userId` (Foreign Key) - References users.id
- `title` - String (auto-generated)
- `techStack` - Array of Strings
- `hardnessLevel` - Enum ['Easy', 'Medium', 'Hard']
- `experienceLevel` - Enum ['Junior', 'Mid', 'Senior']
- `numberOfQuestions` - Integer (3-10)
- `questions` - Array of Question Objects
- `status` - Enum ['generated', 'in_progress', 'completed', 'abandoned']
- `startedAt` - DateTime (nullable)
- `completedAt` - DateTime (nullable)
- `totalDuration` - Integer (seconds, nullable)
- `averageScore` - Float (0-100, nullable)
- `createdAt` - DateTime
- `updatedAt` - DateTime

**Question Object Structure:**
```json
{
  "questionNumber": 1,
  "question": "Explain the difference between let and const in JavaScript",
  "category": "JavaScript Fundamentals",
  "difficulty": "Medium",
  "expectedAnswer": "Sample expected answer...",
  "timeLimit": 300
}
```

**Relationships:**
- Many-to-One with User
- One-to-Many with Answers
- One-to-One with Results
- One-to-One with FacialAnalysis

### 3. Answer Entity
**Table:** `answers`

**Attributes:**
- `id` (Primary Key) - UUID/ObjectId
- `interviewId` (Foreign Key) - References interviews.id
- `userId` (Foreign Key) - References users.id
- `questionNumber` - Integer
- `question` - String
- `answer` - Text (user's response)
- `audioTranscript` - Text (voice-to-text, optional)
- `duration` - Integer (seconds)
- `score` - Float (0-100, nullable)
- `feedback` - Text (AI-generated feedback, nullable)
- `keywords` - Array of Strings (extracted keywords)
- `confidence` - Float (0-1, from facial analysis)
- `submittedAt` - DateTime
- `createdAt` - DateTime
- `updatedAt` - DateTime

**Relationships:**
- Many-to-One with Interview
- Many-to-One with User

### 4. Results Entity
**Table:** `results`

**Attributes:**
- `id` (Primary Key) - UUID/ObjectId
- `interviewId` (Foreign Key) - References interviews.id
- `userId` (Foreign Key) - References users.id
- `overallScore` - Float (0-100)
- `technicalScore` - Float (0-100)
- `communicationScore` - Float (0-100)
- `confidenceScore` - Float (0-100)
- `strengths` - Array of Strings
- `weaknesses` - Array of Strings
- `recommendations` - Array of Strings
- `detailedFeedback` - Text
- `questionScores` - Array of Question Score Objects
- `performanceMetrics` - Object (detailed metrics)
- `generatedAt` - DateTime
- `createdAt` - DateTime
- `updatedAt` - DateTime

**Question Score Object Structure:**
```json
{
  "questionNumber": 1,
  "score": 85,
  "feedback": "Good understanding of concepts...",
  "timeSpent": 180,
  "keywords": ["closure", "scope", "hoisting"]
}
```

**Performance Metrics Object Structure:**
```json
{
  "averageResponseTime": 120,
  "totalInterviewTime": 1800,
  "questionsAnswered": 5,
  "averageConfidence": 0.75,
  "emotionalStability": 0.8,
  "speechClarity": 0.9
}
```

**Relationships:**
- One-to-One with Interview
- Many-to-One with User

### 5. FacialAnalysis Entity
**Table:** `facial_analysis`

**Attributes:**
- `id` (Primary Key) - UUID/ObjectId
- `interviewId` (Foreign Key) - References interviews.id
- `userId` (Foreign Key) - References users.id
- `videoPath` - String (file path/URL)
- `analysisData` - JSON Object (detailed analysis)
- `overallConfidence` - Float (0-1)
- `emotionDistribution` - Object (emotion percentages)
- `eyeContactScore` - Float (0-1)
- `facialExpressionScore` - Float (0-1)
- `postureScore` - Float (0-1)
- `processingStatus` - Enum ['pending', 'processing', 'completed', 'failed']
- `processedAt` - DateTime (nullable)
- `createdAt` - DateTime
- `updatedAt` - DateTime

**Analysis Data Object Structure:**
```json
{
  "frames_analyzed": 150,
  "emotions": {
    "happy": 0.3,
    "neutral": 0.5,
    "confident": 0.15,
    "nervous": 0.05
  },
  "eye_contact_percentage": 0.75,
  "head_pose_stability": 0.8,
  "facial_landmarks_quality": 0.9,
  "timeline": [
    {
      "timestamp": 30,
      "confidence": 0.8,
      "primary_emotion": "confident"
    }
  ]
}
```

**Relationships:**
- One-to-One with Interview
- Many-to-One with User

### 6. UserStats Entity (Derived/Computed)
**Table:** `user_stats` (Can be computed or cached)

**Attributes:**
- `id` (Primary Key) - UUID/ObjectId
- `userId` (Foreign Key) - References users.id
- `totalInterviews` - Integer
- `completedInterviews` - Integer
- `averageScore` - Float (0-100)
- `bestScore` - Float (0-100)
- `currentStreak` - Integer (consecutive interviews)
- `totalPracticeTime` - Integer (seconds)
- `improvementRate` - Float (score improvement over time)
- `strongTechnologies` - Array of Strings
- `weakTechnologies` - Array of Strings
- `lastUpdated` - DateTime

**Relationships:**
- One-to-One with User

## Entity Relationships Summary

### Primary Relationships:
1. **User → Interviews** (1:N) - One user can have multiple interviews
2. **Interview → Answers** (1:N) - One interview has multiple answers
3. **Interview → Results** (1:1) - One interview has one result
4. **Interview → FacialAnalysis** (1:1) - One interview has one facial analysis
5. **User → Results** (1:N) - One user can have multiple results
6. **User → Answers** (1:N) - One user can have multiple answers
7. **User → UserStats** (1:1) - One user has one stats record

### Database Indexes (Recommended):
- `users.email` (unique)
- `interviews.userId`
- `interviews.status`
- `interviews.createdAt`
- `answers.interviewId`
- `answers.userId`
- `results.interviewId`
- `results.userId`
- `facial_analysis.interviewId`

### Data Flow Sequence:
1. User registers/logs in → `users` table
2. User creates interview → `interviews` table
3. User answers questions → `answers` table
4. Video is recorded → `facial_analysis` table
5. Interview is completed → `results` table
6. Stats are updated → `user_stats` table

This ER structure supports the complete PrepWise workflow from user registration through interview completion and analytics generation.