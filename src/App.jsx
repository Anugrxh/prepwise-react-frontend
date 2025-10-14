import React, { useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { InterviewProvider } from "./contexts/InterviewContext.jsx";
import { DataProvider } from "./contexts/DataContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Toast from "./components/Toast.jsx";
import ApiDebugPanel from "./components/ApiDebugPanel.jsx";
import CacheManager from "./components/CacheManager.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

// Lazy load pages for better performance
const Login = React.lazy(() => import("./pages/Login.jsx"));
const Register = React.lazy(() => import("./pages/Register.jsx"));
const Dashboard = React.lazy(() => import("./pages/Dashboard.jsx"));
const InterviewSetup = React.lazy(() => import("./pages/InterviewSetup.jsx"));
const Interview = React.lazy(() => import("./pages/Interview.jsx"));
const Results = React.lazy(() => import("./pages/Results.jsx"));
const Profile = React.lazy(() => import("./pages/Profile.jsx"));
const NotFound = React.lazy(() => import("./pages/NotFound.jsx"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-64">
    <LoadingSpinner size="lg" />
  </div>
);

function AppContent() {
  const location = useLocation();
  const isInterviewPage = location.pathname.includes('/interview/') && !location.pathname.includes('/setup');

  // Enable dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 aurora-bg">
      {!isInterviewPage && <Navbar />}
      <main className={`container mx-auto px-4 ${isInterviewPage ? 'py-4' : 'py-8'}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/setup"
              element={
                <ProtectedRoute>
                  <InterviewSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/:id"
              element={
                <ProtectedRoute>
                  <Interview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:id"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Toast />
      <ApiDebugPanel />
      <CacheManager />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <DataProvider>
          <Router>
            <AppContent />
          </Router>
        </DataProvider>
      </InterviewProvider>
    </AuthProvider>
  );
}

export default App;
