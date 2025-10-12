# Prepwise Backend - Node.js with AI Integration

A comprehensive Node.js backend for the Prepwise AI-powered job interview preparation platform, featuring Google Gemini AI for question generation and answer evaluation, MongoDB database, and Django facial analysis integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **User Profile Management**: Complete profile management with image upload support
- **AI-Powered Question Generation**: Google Gemini generates interview questions based on tech stack and experience level
- **Answer Evaluation**: AI evaluates answers with detailed feedback and scoring
- **Facial Analysis Integration**: Connects with Django facial analysis service for comprehensive evaluation
- **Interview Management**: Complete interview lifecycle from generation to final results
- **Performance Analytics**: Track user progress and improvement over time
- **File Upload Support**: Profile image upload with multiple format support
- **RESTful API**: Complete CRUD operations for all resources

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Generative AI API key
- Django Facial Analysis Service (running on port 8000)

## 🛠️ Installation

1. **Clone and setup**

```bash
git clone <repository-url>
cd prepwise-nodejs-backend
npm install
```

2. **Environment Configuration**

```bash
cp .env.example .env
```

3. **Configure Environment Variables**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/prepwise

# Google Generative AI
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Django Facial Analysis Service
FACIAL_ANALYSIS_API_URL=http://localhost:8000/facial-analysis
```

4. **Start the server**

```bash
# Development
npm run dev

# Production
npm start
```

## 🔄 New Interview Workflow

### 1. User Login

- User authenticates and receives JWT token

### 2. Interview Generation

- User provides: tech stack, hardness level, experience level, number of questions
- AI generates customized interview questions
- Interview saved with status 'generated'

### 3. Start Interview

- User starts the interview (status changes to 'in_progress')
- Questions are presented one by one

### 4. Submit Answers

- User submits answers with optional facial analysis data
- Each answer is evaluated by AI for relevance, completeness, technical accuracy, and communication
- Facial analysis provides confidence, eye contact, and speech clarity scores

### 5. Complete Interview

- When all questions are answered, interview status changes to 'completed'
- Final result is generated combining all answer evaluations and facial analysis

### 6. View Results

- Comprehensive feedback with scores, strengths, weaknesses, and recommendations
- Performance analytics and comparison with previous interviews

## 📚 API Endpoints

### Authentication Endpoints

| Method | Endpoint                    | Description          |
| ------ | --------------------------- | -------------------- |
| POST   | `/api/auth/register`        | Register new user    |
| POST   | `/api/auth/login`           | User login           |
| POST   | `/api/auth/logout`          | User logout          |
| POST   | `/api/auth/refresh`         | Refresh access token |
| GET    | `/api/auth/me`              | Get current user     |
| PUT    | `/api/auth/change-password` | Change password      |

### Interview Endpoints

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| POST   | `/api/interviews/generate`       | Generate new interview with AI |
| GET    | `/api/interviews`                | Get user's interviews          |
| GET    | `/api/interviews/:id`            | Get single interview           |
| POST   | `/api/interviews/:id/start`      | Start interview                |
| POST   | `/api/interviews/:id/complete`   | Complete interview             |
| DELETE | `/api/interviews/:id`            | Delete interview               |
| GET    | `/api/interviews/stats/overview` | Get interview statistics       |

### Answer Endpoints

| Method | Endpoint                              | Description                             |
| ------ | ------------------------------------- | --------------------------------------- |
| POST   | `/api/answers`                        | Submit answer with optional facial data |
| GET    | `/api/answers/interview/:interviewId` | Get answers for interview               |
| GET    | `/api/answers/:id`                    | Get single answer                       |
| PUT    | `/api/answers/:id`                    | Update answer                           |
| DELETE | `/api/answers/:id`                    | Delete answer                           |
| GET    | `/api/answers/stats/:interviewId`     | Get answer statistics                   |

### Results Endpoints

| Method | Endpoint                              | Description               |
| ------ | ------------------------------------- | ------------------------- |
| POST   | `/api/results/generate/:interviewId`  | Generate final result     |
| GET    | `/api/results/interview/:interviewId` | Get result for interview  |
| GET    | `/api/results`                        | Get user's all results    |
| GET    | `/api/results/:id`                    | Get single result         |
| DELETE | `/api/results/:id`                    | Delete result             |
| GET    | `/api/results/analytics/performance`  | Get performance analytics |
| GET    | `/api/results/compare/:id1/:id2`      | Compare two results       |

### User Endpoints

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| GET    | `/api/users/profile`       | Get user profile      |
| PUT    | `/api/users/profile`       | Update profile        |
| PUT    | `/api/users/profile-image` | Update profile image  |
| GET    | `/api/users/stats`         | Get user statistics   |
| GET    | `/api/users/interviews`    | Get user's interviews |
| GET    | `/api/users/results`       | Get user's results    |
| DELETE | `/api/users/account`       | Delete user account   |

## 🗄️ Database Schema

### Interview Model

```javascript
{
  userId: ObjectId,
  techStack: [String],
  hardnessLevel: String, // Easy, Medium, Hard
  experienceLevel: String, // Fresher, Junior, Mid, Senior, Lead
  numberOfQuestions: Number,
  questions: [{
    questionText: String,
    questionNumber: Number,
    expectedAnswer: String,
    category: String // Technical, Behavioral, Problem Solving
  }],
  status: String, // generated, in_progress, completed, abandoned
  startedAt: Date,
  completedAt: Date,
  duration: Number // in seconds
}
```

### Answer Model

```javascript
{
  interviewId: ObjectId,
  userId: ObjectId,
  questionNumber: Number,
  questionText: String,
  answerText: String,
  answerDuration: Number,
  facialAnalysis: {
    confidence: Number,
    emotions: Object,
    eyeContact: Number,
    speechClarity: Number,
    overallScore: Number,
    feedback: String
  },
  aiEvaluation: {
    relevance: Number,
    completeness: Number,
    technicalAccuracy: Number,
    communication: Number,
    overallScore: Number,
    feedback: String,
    suggestions: [String]
  }
}
```

### FinalResult Model

```javascript
{
  interviewId: ObjectId,
  userId: ObjectId,
  overallScore: Number,
  categoryScores: {
    technicalKnowledge: Number,
    communication: Number,
    problemSolving: Number,
    confidence: Number,
    facialAnalysis: Number
  },
  strengths: [String],
  weaknesses: [String],
  recommendations: [String],
  detailedFeedback: String,
  grade: String, // A+, A, B+, B, C+, C, D, F
  passed: Boolean,
  completionTime: Number,
  questionsAnswered: Number,
  totalQuestions: Number
}
```

## 🤖 AI Integration

### Question Generation

- Uses Google Gemini to generate relevant questions based on:
  - Technology stack
  - Experience level
  - Difficulty level
  - Number of questions requested

### Answer Evaluation

- AI evaluates each answer on:
  - **Relevance**: How well the answer addresses the question
  - **Completeness**: How thorough the answer is
  - **Technical Accuracy**: Correctness of technical information
  - **Communication**: Clarity and structure of the response

### Final Result Generation

- Combines all answer evaluations and facial analysis
- Provides comprehensive feedback with actionable recommendations
- Calculates overall score and grade

## 🖼️ Profile Image Management

### Storage Format

- **File Upload**: Images are converted to base64 data URLs and stored in MongoDB
- **URL Reference**: External image URLs are stored as-is
- **Supported Formats**: JPEG, PNG, JPG
- **Size Limit**: 5MB maximum for uploaded files
- **Encoding**: `data:image/jpeg;base64,<base64-string>`

### Storage Considerations

- **Base64 Storage**: Increases document size by ~33% but provides immediate availability
- **MongoDB Document Limit**: 16MB BSON document limit accommodates multiple 5MB images
- **Performance**: Consider using GridFS for larger files or high-volume applications
- **CDN Integration**: External URLs allow integration with CDN services for better performance

### Usage Examples

**JavaScript/Frontend Integration:**

```javascript
// Upload file
const formData = new FormData();
formData.append("profileImage", fileInput.files[0]);

fetch("/api/users/profile-image", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

// Set URL
fetch("/api/users/profile-image", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    profileImageUrl: "https://example.com/avatar.jpg",
  }),
});

// Remove image
fetch("/api/users/profile-image", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    profileImageUrl: null,
  }),
});
```

**Display Profile Image:**

```javascript
// The profileImage field contains either:
// 1. Base64 data URL: "data:image/jpeg;base64,/9j/4AAQ..."
// 2. External URL: "https://example.com/image.jpg"
// 3. null: No profile image set

const profileImage = user.profileImage;
if (profileImage) {
  // Can be used directly in img src
  imgElement.src = profileImage;
} else {
  // Show default avatar
  imgElement.src = "/default-avatar.png";
}
```

## 🎭 Facial Analysis Integration

### Django Service Integration

- Connects to Django REST API at `/facial-analysis`
- Processes video/image data for each answer
- Analyzes confidence, emotions, eye contact, and speech clarity

### Facial Analysis Metrics

- **Confidence Level**: Overall confidence during response
- **Emotions**: Happy, sad, angry, fear, surprise, disgust, neutral
- **Eye Contact**: Percentage of time maintaining eye contact
- **Speech Clarity**: Clarity and pace of speech
- **Overall Score**: Combined facial analysis score

## � Detailed API Documentation

### Authentication Endpoints

#### Register User

**POST** `/api/auth/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2023-09-06T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "lastLogin": "2023-09-06T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User

**GET** `/api/auth/me`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "profileImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      "resumeUrl": "https://example.com/resume.pdf",
      "lastLogin": "2023-09-06T10:30:00.000Z",
      "createdAt": "2023-09-06T09:00:00.000Z"
    }
  }
}
```

#### Change Password

**PUT** `/api/auth/change-password`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully. Please login again on all devices."
}
```

### User Profile Endpoints

#### Get User Profile

**GET** `/api/users/profile`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "profileImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      "resumeUrl": "https://example.com/resume.pdf",
      "lastLogin": "2023-09-06T10:30:00.000Z",
      "createdAt": "2023-09-06T09:00:00.000Z"
    },
    "stats": {
      "interviewsCreated": 15,
      "interviewsTaken": 12,
      "averageScore": 78
    }
  }
}
```

#### Update User Profile

**PUT** `/api/users/profile`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Smith",
      "email": "john.smith@example.com",
      "profileImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      "resumeUrl": "https://example.com/resume.pdf",
      "lastLogin": "2023-09-06T10:30:00.000Z",
      "createdAt": "2023-09-06T09:00:00.000Z"
    }
  }
}
```

#### Update Profile Image

**PUT** `/api/users/profile-image`

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data (for file upload)
```

**Request Options:**

**Option 1: Upload Image File**

```
profileImage: <image_file> (max 5MB, JPEG/PNG/JPG only)
```

**Option 2: Set Image URL (JSON)**

```json
{
  "profileImageUrl": "https://example.com/profile-image.jpg"
}
```

**Option 3: Remove Profile Image (JSON)**

```json
{
  "profileImageUrl": null
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "profileImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      "resumeUrl": "https://example.com/resume.pdf",
      "lastLogin": "2023-09-06T10:30:00.000Z",
      "createdAt": "2023-09-06T09:00:00.000Z"
    }
  }
}
```

**Error Responses:**

```json
// File too large
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}

// Invalid file type
{
  "success": false,
  "message": "Only image files are allowed for profile pictures"
}

// No data provided
{
  "success": false,
  "message": "Please provide either a profile image file or a valid image URL, or set profileImageUrl to null to remove the image"
}

// Invalid URL
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "profileImageUrl",
      "message": "Profile image URL must be a valid URL",
      "value": "invalid-url"
    }
  ]
}
```

#### Get User Statistics

**GET** `/api/users/stats`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "interviewsCreated": 15,
      "interviewsTaken": 12,
      "averageScore": 78,
      "passRate": 83
    },
    "interviews": {
      "total": 15,
      "statusDistribution": {
        "generated": 2,
        "inProgress": 1,
        "completed": 12,
        "abandoned": 0
      },
      "hardnessDistribution": {
        "Easy": 3,
        "Medium": 8,
        "Hard": 4
      },
      "experienceDistribution": {
        "Junior": 5,
        "Mid": 7,
        "Senior": 3
      }
    },
    "performance": {
      "totalResults": 12,
      "averageScore": 78,
      "bestScore": 92,
      "lowestScore": 65,
      "passRate": 83,
      "categoryAverages": {
        "technicalKnowledge": 80,
        "communication": 75,
        "problemSolving": 82,
        "confidence": 70,
        "facialAnalysis": 73
      }
    }
  }
}
```

### Interview Endpoints

#### Generate Interview

**POST** `/api/interviews/generate`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "techStack": ["React", "Node.js", "MongoDB"],
  "hardnessLevel": "Medium",
  "experienceLevel": "Mid",
  "numberOfQuestions": 5
}
```

**Response:**

```json
{
  "success": true,
  "message": "Interview generated successfully",
  "data": {
    "interview": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "techStack": ["React", "Node.js", "MongoDB"],
      "hardnessLevel": "Medium",
      "experienceLevel": "Mid",
      "numberOfQuestions": 5,
      "questions": [
        {
          "questionText": "Explain the virtual DOM in React and how it improves performance",
          "questionNumber": 1,
          "expectedAnswer": "Virtual DOM is a JavaScript representation of the real DOM...",
          "category": "Technical"
        },
        {
          "questionText": "How do you handle asynchronous operations in Node.js?",
          "questionNumber": 2,
          "expectedAnswer": "Node.js handles async operations using callbacks, promises, and async/await...",
          "category": "Technical"
        }
      ],
      "status": "generated",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

#### Get User Interviews

**GET** `/api/interviews?status=completed&page=1&limit=10`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "interviews": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "techStack": ["React", "Node.js"],
        "hardnessLevel": "Medium",
        "experienceLevel": "Mid",
        "numberOfQuestions": 5,
        "status": "completed",
        "startedAt": "2023-09-06T10:30:00.000Z",
        "completedAt": "2023-09-06T11:00:00.000Z",
        "duration": 1800,
        "createdAt": "2023-09-06T10:25:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Start Interview

**POST** `/api/interviews/64f8a1b2c3d4e5f6a7b8c9d1/start`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Interview started successfully",
  "data": {
    "interview": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "status": "in_progress",
      "startedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Answer Endpoints

#### Submit Answer

**POST** `/api/answers`

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data (if including facial data)
```

**Request Body:**

```json
{
  "interviewId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "questionNumber": 1,
  "answerText": "The virtual DOM is a programming concept where a virtual representation of the UI is kept in memory and synced with the real DOM through a process called reconciliation. This improves performance by minimizing direct DOM manipulations.",
  "answerDuration": 120
}
```

**Response:**

```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "data": {
    "answer": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "interviewId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "questionNumber": 1,
      "questionText": "Explain the virtual DOM in React and how it improves performance",
      "answerText": "The virtual DOM is a programming concept...",
      "answerDuration": 120,
      "aiEvaluation": {
        "relevance": 85,
        "completeness": 78,
        "technicalAccuracy": 82,
        "communication": 80,
        "overallScore": 81,
        "feedback": "Good explanation of virtual DOM concept with clear understanding of reconciliation process.",
        "suggestions": [
          "Include more details about the diffing algorithm",
          "Mention specific performance benefits with examples"
        ]
      },
      "facialAnalysis": {
        "confidence": 75,
        "overallScore": 73,
        "feedback": "Good eye contact and clear speech"
      },
      "submittedAt": "2023-09-06T10:35:00.000Z"
    }
  }
}
```

#### Submit All Answers (Bulk)

**POST** `/api/answers/bulk`

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data (if including facial data)
```

**Request Body:**

```json
{
  "interviewId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "totalInterviewDuration": 1800,
  "answers": [
    {
      "questionNumber": 1,
      "answerText": "The virtual DOM is a programming concept...",
      "answerDuration": 120
    },
    {
      "questionNumber": 2,
      "answerText": "Node.js handles async operations using...",
      "answerDuration": 150
    }
  ],
  "facialAnalysisData": {
    "confidence": 75,
    "emotions": {
      "neutral": 70,
      "happy": 20,
      "fear": 10
    },
    "eyeContact": 65,
    "speechClarity": 70,
    "overallScore": 68
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "All answers submitted successfully",
  "data": {
    "answers": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "questionNumber": 1,
        "aiEvaluation": {
          "overallScore": 81,
          "feedback": "Good explanation..."
        }
      }
    ],
    "overallFacialAnalysis": {
      "confidence": 75,
      "overallScore": 68
    },
    "totalAnswers": 2,
    "completionPercentage": 40
  }
}
```

#### Get Interview Answers

**GET** `/api/answers/interview/64f8a1b2c3d4e5f6a7b8c9d1`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "answers": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "questionNumber": 1,
        "questionText": "Explain the virtual DOM in React",
        "answerText": "The virtual DOM is a programming concept...",
        "aiEvaluation": {
          "overallScore": 81,
          "feedback": "Good explanation..."
        },
        "facialAnalysis": {
          "overallScore": 73,
          "confidence": 75
        }
      }
    ],
    "completionPercentage": 100,
    "totalQuestions": 5,
    "answeredQuestions": 5
  }
}
```

### Results Endpoints

#### Generate Final Result

**POST** `/api/results/generate/64f8a1b2c3d4e5f6a7b8c9d1`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Final result generated successfully",
  "data": {
    "result": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "interviewId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "overallScore": 78,
      "categoryScores": {
        "technicalKnowledge": 80,
        "communication": 75,
        "problemSolving": 82,
        "confidence": 70,
        "facialAnalysis": 73
      },
      "strengths": [
        "Strong technical knowledge of React concepts",
        "Clear communication and structured responses",
        "Good problem-solving approach"
      ],
      "weaknesses": [
        "Could improve confidence in delivery",
        "Need more detailed explanations for complex topics"
      ],
      "recommendations": [
        "Practice explaining complex concepts with real-world examples",
        "Work on building confidence through mock interviews",
        "Provide more specific implementation details"
      ],
      "detailedFeedback": "Overall good performance with solid technical knowledge. The candidate demonstrated a clear understanding of React concepts and Node.js fundamentals. Areas for improvement include building confidence and providing more comprehensive explanations.",
      "grade": "B+",
      "passed": true,
      "completionTime": 1800,
      "questionsAnswered": 5,
      "totalQuestions": 5,
      "completionPercentage": 100,
      "createdAt": "2023-09-06T11:05:00.000Z"
    },
    "facialAnalysisSummary": {
      "confidence": 75,
      "eyeContact": 65,
      "speechClarity": 70,
      "overallScore": 68
    }
  }
}
```

#### Get User Results

**GET** `/api/results?page=1&limit=10&sort=-createdAt`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "overallScore": 78,
        "grade": "B+",
        "passed": true,
        "interviewId": {
          "techStack": ["React", "Node.js"],
          "hardnessLevel": "Medium",
          "experienceLevel": "Mid"
        },
        "createdAt": "2023-09-06T11:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "pages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Performance Analytics

**GET** `/api/results/analytics/performance`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalInterviews": 12,
    "averageScore": 78,
    "bestScore": 92,
    "improvementTrend": 5,
    "passRate": 83,
    "categoryTrends": {
      "technicalKnowledge": {
        "average": 80,
        "best": 95,
        "latest": 82,
        "trend": 8
      },
      "communication": {
        "average": 75,
        "best": 88,
        "latest": 78,
        "trend": 3
      }
    },
    "gradeDistribution": {
      "A": 2,
      "B+": 4,
      "B": 3,
      "C+": 2,
      "C": 1
    },
    "insights": {
      "mostImprovedCategory": "technicalKnowledge",
      "strongestCategory": "problemSolving",
      "needsImprovement": ["confidence"]
    }
  }
}
```

## � Compklete API Endpoints Summary

### Authentication & Authorization

| Method | Endpoint                    | Description                   | Auth Required |
| ------ | --------------------------- | ----------------------------- | ------------- |
| POST   | `/api/auth/register`        | Register new user             | No            |
| POST   | `/api/auth/login`           | User login                    | No            |
| POST   | `/api/auth/logout`          | User logout                   | Yes           |
| POST   | `/api/auth/refresh`         | Refresh access token          | No            |
| GET    | `/api/auth/me`              | Get current user info         | Yes           |
| PUT    | `/api/auth/change-password` | Change user password          | Yes           |
| POST   | `/api/auth/forgot-password` | Forgot password (placeholder) | No            |

### User Profile Management

| Method | Endpoint                   | Description                       | Auth Required |
| ------ | -------------------------- | --------------------------------- | ------------- |
| GET    | `/api/users/profile`       | Get user profile with stats       | Yes           |
| PUT    | `/api/users/profile`       | Update user profile (name, email) | Yes           |
| PUT    | `/api/users/profile-image` | Update/remove profile image       | Yes           |
| GET    | `/api/users/stats`         | Get comprehensive user statistics | Yes           |
| GET    | `/api/users/interviews`    | Get user's interview history      | Yes           |
| GET    | `/api/users/results`       | Get user's results history        | Yes           |
| DELETE | `/api/users/account`       | Delete user account permanently   | Yes           |

### Interview Management

| Method | Endpoint                         | Description                          | Auth Required |
| ------ | -------------------------------- | ------------------------------------ | ------------- |
| POST   | `/api/interviews/generate`       | Generate AI-powered interview        | Yes           |
| GET    | `/api/interviews`                | Get user's interviews (with filters) | Yes           |
| GET    | `/api/interviews/:id`            | Get single interview details         | Yes           |
| POST   | `/api/interviews/:id/start`      | Start interview session              | Yes           |
| POST   | `/api/interviews/:id/complete`   | Complete interview session           | Yes           |
| DELETE | `/api/interviews/:id`            | Delete interview and related data    | Yes           |
| GET    | `/api/interviews/stats/overview` | Get interview statistics             | Yes           |

### Answer Submission & Management

| Method | Endpoint                              | Description                           | Auth Required |
| ------ | ------------------------------------- | ------------------------------------- | ------------- |
| POST   | `/api/answers`                        | Submit single answer with facial data | Yes           |
| POST   | `/api/answers/bulk`                   | Submit all answers at once            | Yes           |
| POST   | `/api/answers/submit-all`             | Submit all answers with facial result | Yes           |
| GET    | `/api/answers/interview/:interviewId` | Get all answers for interview         | Yes           |
| GET    | `/api/answers/:id`                    | Get single answer details             | Yes           |
| PUT    | `/api/answers/:id`                    | Update answer (if interview active)   | Yes           |
| DELETE | `/api/answers/:id`                    | Delete answer (if interview active)   | Yes           |
| GET    | `/api/answers/stats/:interviewId`     | Get answer statistics                 | Yes           |

### Results & Analytics

| Method | Endpoint                              | Description                       | Auth Required |
| ------ | ------------------------------------- | --------------------------------- | ------------- |
| POST   | `/api/results/generate/:interviewId`  | Generate final AI result          | Yes           |
| GET    | `/api/results/interview/:interviewId` | Get result for specific interview | Yes           |
| GET    | `/api/results`                        | Get all user results (paginated)  | Yes           |
| GET    | `/api/results/:id`                    | Get single result details         | Yes           |
| DELETE | `/api/results/:id`                    | Delete result                     | Yes           |
| GET    | `/api/results/analytics/performance`  | Get performance analytics         | Yes           |
| GET    | `/api/results/compare/:id1/:id2`      | Compare two results               | Yes           |

### System Health

| Method | Endpoint  | Description         | Auth Required |
| ------ | --------- | ------------------- | ------------- |
| GET    | `/health` | System health check | No            |

## 📊 Quick Start Examples

### Basic Workflow Example

1. **Register/Login**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

2. **Generate Interview**

```bash
curl -X POST http://localhost:5000/api/interviews/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"techStack":["React","Node.js"],"hardnessLevel":"Medium","experienceLevel":"Mid","numberOfQuestions":3}'
```

3. **Start Interview**

```bash
curl -X POST http://localhost:5000/api/interviews/<interview-id>/start \
  -H "Authorization: Bearer <token>"
```

4. **Submit Answer**

```bash
curl -X POST http://localhost:5000/api/answers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"interviewId":"<interview-id>","questionNumber":1,"answerText":"Your answer here","answerDuration":120}'
```

5. **Complete Interview & Generate Results**

```bash
curl -X POST http://localhost:5000/api/interviews/<interview-id>/complete \
  -H "Authorization: Bearer <token>"

curl -X POST http://localhost:5000/api/results/generate/<interview-id> \
  -H "Authorization: Bearer <token>"
```

### Profile Image Upload Example

```bash
# Upload image file
curl -X PUT http://localhost:5000/api/users/profile-image \
  -H "Authorization: Bearer <token>" \
  -F "profileImage=@/path/to/image.jpg"

# Set image URL
curl -X PUT http://localhost:5000/api/users/profile-image \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"profileImageUrl":"https://example.com/image.jpg"}'

# Remove profile image
curl -X PUT http://localhost:5000/api/users/profile-image \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"profileImageUrl":null}'
```

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- File upload security
- MongoDB injection prevention

## 🚀 Deployment

### Environment Setup

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prepwise
JWT_SECRET=your-secure-jwt-secret
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
FACIAL_ANALYSIS_API_URL=https://your-django-service.com/facial-analysis
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📝 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error",
      "value": "invalid-value"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔄 Version History

- **v2.1.0** - Enhanced user profile management

  - Added profile image upload endpoint (`PUT /api/users/profile-image`)
  - Support for file upload, URL reference, and image removal
  - Base64 encoding for uploaded images
  - Comprehensive API documentation with examples
  - Enhanced error handling and validation

- **v2.0.0** - Complete restructure with new interview workflow
  - Removed VAPI integration
  - Added facial analysis integration
  - New answer submission and evaluation system
  - Comprehensive final results with AI-powered feedback
