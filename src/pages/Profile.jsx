import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, User, History, BarChart3, Settings, Upload } from "lucide-react";
import toast from 'react-hot-toast';
import { useAuth } from "../contexts/AuthContext.jsx";
import { useData } from "../contexts/DataContext.jsx";
import { useAuthCache } from "../hooks/useAuthCache.js";
import { userAPI } from "../services/api.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import InterviewHistory from "../components/InterviewHistory.jsx";
import AnalyticsDashboard from "../components/AnalyticsDashboard.jsx";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  useAuthCache(); // Clear cache on user changes
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // Profile form data
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Statistics data
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    recentActivity: [],
    performanceData: [],
    categoryBreakdown: {},
  });

  // Interview history
  const [interviews, setInterviews] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["profile", "history", "analytics"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const { fetchProfileAnalytics, fetchInterviewHistory, invalidateAllData } = useData();

  // Only load data when tab becomes active (not on every tab change)
  useEffect(() => {
    if (activeTab === "history") {
      loadInterviewHistory();
    } else if (activeTab === "analytics") {
      // Check if we're coming from an interview completion (force refresh)
      const fromInterview = searchParams.get('from') === 'interview';
      loadAnalytics(fromInterview);
      
      // Clear the 'from' parameter after loading
      if (fromInterview) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('from');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [activeTab, searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const loadInterviewHistory = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[Profile] Loading interview history...');
      
      const result = await fetchInterviewHistory({ limit: 20, sort: '-createdAt' });

      if (result.interviews?.data?.success) {
        setInterviews(result.interviews.data.data.interviews || []);
      }

      if (result.results?.data?.success) {
        setResults(result.results.data.data.results || []);
      }

      if (result.errors.interviews || result.errors.results) {
        setError("Failed to load some interview history data");
      }
    } catch (error) {
      setError("Failed to load interview history");
      console.error('[Profile] Interview history error:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchInterviewHistory]);

  const loadAnalytics = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      console.log('[Profile] Loading analytics...', forceRefresh ? '(force refresh)' : '');
      
      const result = await fetchProfileAnalytics(forceRefresh);

      let analyticsData = {
        totalInterviews: 0,
        completedInterviews: 0,
        averageScore: 0,
        bestScore: 0,
        improvementTrend: 0,
        passRate: 0,
        categoryTrends: {},
        gradeDistribution: {},
        performanceData: [],
        insights: {},
      };

      // Use real analytics data from API
      if (result.analytics?.data?.success && result.analytics.data?.data) {
        const apiData = result.analytics.data.data;
        console.log('[Profile] Analytics API data:', apiData);
        
        analyticsData = {
          totalInterviews: apiData.totalInterviews || 0,
          completedInterviews: apiData.totalInterviews || 0,
          averageScore: apiData.averageScore || 0,
          bestScore: apiData.bestScore || 0,
          improvementTrend: apiData.improvementTrend || 0,
          passRate: apiData.passRate || 0,
          categoryTrends: apiData.categoryTrends || {},
          gradeDistribution: apiData.gradeDistribution || {},
          insights: apiData.insights || {},
          performanceData: (apiData.recentResults || []).map((result, index) => ({
            interview: index + 1,
            score: result.overallScore || 0,
            date: new Date(result.createdAt).toLocaleDateString(),
          })),
        };
      } else {
        console.log('[Profile] Using fallback analytics calculation');
        
        // Fallback: calculate from interviews if analytics API is not available
        if (result.interviews?.data?.success) {
          const allInterviews = result.interviews.data.data.interviews || [];
          const completed = allInterviews.filter(
            (interview) => interview.status === "completed"
          );

          const completedWithScores = completed.filter(interview => 
            interview.averageScore !== undefined && interview.averageScore !== null
          );

          if (completedWithScores.length > 0) {
            const avgScore = Math.round(
              completedWithScores.reduce(
                (sum, interview) => sum + interview.averageScore,
                0
              ) / completedWithScores.length
            );

            const bestScore = Math.max(
              ...completedWithScores.map((interview) => interview.averageScore)
            );

            const passRate = Math.round(
              (completedWithScores.filter(interview => interview.averageScore >= 60).length / completedWithScores.length) * 100
            );

            analyticsData = {
              ...analyticsData,
              totalInterviews: allInterviews.length,
              completedInterviews: completed.length,
              averageScore: avgScore,
              bestScore: bestScore,
              passRate: passRate,
              performanceData: completedWithScores.map((interview, index) => ({
                interview: index + 1,
                score: interview.averageScore,
                date: new Date(interview.createdAt).toLocaleDateString(),
              })),
            };
          }
        }
      }

      setStats(analyticsData);
    } catch (error) {
      console.error('[Profile] Failed to load analytics:', error);
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [fetchProfileAnalytics]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await userAPI.updateProfile({
        name: profileData.name,
        // Don't send email - it's not editable
      });

      if (response.data.success) {
        updateUser(response.data.data.user);
        // Invalidate cache to ensure fresh data is loaded
        invalidateAllData();
        toast.success("Profile updated successfully");
        setSuccess("Profile updated successfully");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      const errorMessage = "New passwords do not match";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      const errorMessage = "New password must be at least 6 characters long";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      if (response.data.success) {
        toast.success("Password updated successfully");
        setSuccess("Password updated successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update password";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      const errorMessage = "Please select a valid image file";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMessage = "Image size must be less than 5MB";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await userAPI.updateProfileImage(formData);

      if (response.data.success) {
        updateUser(response.data.data.user);
        // Invalidate cache to ensure fresh data is loaded
        invalidateAllData();
        toast.success("Profile image updated successfully");
        setSuccess("Profile image updated successfully");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to upload image";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      generated: { class: "badge-primary", text: "Generated" },
      in_progress: { class: "badge-warning", text: "In Progress" },
      completed: { class: "badge-success", text: "Completed" },
    };

    const config = statusConfig[status] || {
      class: "badge-primary",
      text: status,
    };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success-600";
    if (score >= 60) return "text-warning-600";
    return "text-danger-600";
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "history", name: "Interview History", icon: History },
    { id: "analytics", name: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-lg text-gray-600">
          Manage your account and view your interview performance
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-8">
          {/* Profile Image Section */}
          <Card animate>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Profile Picture
            </h2>

            <div className="flex items-center space-x-6">
              <div className="relative">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-medium text-2xl">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.name}
                </h3>
                <p className="text-gray-500">{user?.email}</p>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3"
                >
                  Change Picture
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </Card>

          {/* Profile Information */}
          <Card animate delay={0.1}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Profile Information
            </h2>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    className="input bg-gray-50 cursor-not-allowed"
                    disabled
                    title="Email cannot be changed"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Email address cannot be changed for security reasons
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    icon={Settings}
                  >
                    Update Profile
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Password Change */}
          {/* <Card animate delay={0.2}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Change Password
            </h2>

            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="input"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            </form>
          </Card> */}
        </div>
      )}

      {/* Interview History Tab */}
      {activeTab === "history" && (
        <InterviewHistory />
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <AnalyticsDashboard analytics={stats} />
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
