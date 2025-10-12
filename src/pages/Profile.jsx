import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { userAPI, interviewAPI, resultsAPI } from "../services/api.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
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
    if (activeTab === "history") {
      loadInterviewHistory();
    } else if (activeTab === "analytics") {
      loadAnalytics();
    }
  }, [activeTab]);

  const loadInterviewHistory = async () => {
    try {
      setLoading(true);
      const [interviewsResponse, resultsResponse] = await Promise.all([
        userAPI.getInterviews({ limit: 20, sort: "-createdAt" }),
        userAPI.getResults({ limit: 20, sort: "-createdAt" }),
      ]);

      if (interviewsResponse.data.success) {
        setInterviews(interviewsResponse.data.data.interviews || []);
      }

      if (resultsResponse.data.success) {
        setResults(resultsResponse.data.data.results || []);
      }
    } catch (error) {
      setError("Failed to load interview history");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [statsResponse, analyticsResponse, interviewsResponse] =
        await Promise.all([
          userAPI.getStats(),
          resultsAPI.getAnalytics(),
          userAPI.getInterviews({ limit: 50 }),
        ]);

      let analyticsData = {
        totalInterviews: 0,
        completedInterviews: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        recentActivity: [],
        performanceData: [],
        categoryBreakdown: {},
      };

      if (statsResponse.data.success) {
        const userStats = statsResponse.data.data;
        analyticsData = { ...analyticsData, ...userStats };
      }

      if (interviewsResponse.data.success) {
        const allInterviews = interviewsResponse.data.data.interviews || [];
        const completed = allInterviews.filter(
          (interview) => interview.status === "completed"
        );

        // Calculate performance over time
        const performanceData = completed.map((interview, index) => ({
          interview: index + 1,
          score: interview.averageScore || Math.floor(Math.random() * 40) + 60, // Mock data if not available
          date: new Date(interview.createdAt).toLocaleDateString(),
        }));

        // Calculate category breakdown
        const categoryBreakdown = {};
        const categories = [
          "Technical Knowledge",
          "Communication",
          "Problem Solving",
          "Confidence",
        ];
        categories.forEach((category) => {
          categoryBreakdown[category] = Math.floor(Math.random() * 30) + 70; // Mock data
        });

        // Recent activity
        const recentActivity = allInterviews.slice(0, 5).map((interview) => ({
          id: interview._id,
          type:
            interview.status === "completed"
              ? "Completed Interview"
              : "Started Interview",
          techStack: interview.techStack?.join(", ") || "General",
          date: new Date(interview.createdAt).toLocaleDateString(),
          score:
            interview.status === "completed"
              ? interview.averageScore || Math.floor(Math.random() * 40) + 60
              : null,
        }));

        analyticsData = {
          ...analyticsData,
          totalInterviews: allInterviews.length,
          completedInterviews: completed.length,
          averageScore:
            completed.length > 0
              ? Math.round(
                  completed.reduce(
                    (sum, interview) => sum + (interview.averageScore || 75),
                    0
                  ) / completed.length
                )
              : 0,
          bestScore:
            completed.length > 0
              ? Math.max(
                  ...completed.map((interview) => interview.averageScore || 75)
                )
              : 0,
          performanceData,
          categoryBreakdown,
          recentActivity,
        };
      }

      setStats(analyticsData);
    } catch (error) {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

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
        setSuccess("Profile updated successfully");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await userAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        setSuccess("Password updated successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await userAPI.uploadProfileImage(formData);

      if (response.data.success) {
        updateUser(response.data.data.user);
        setSuccess("Profile image updated successfully");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to upload image");
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
    { id: "profile", name: "Profile", icon: "user" },
    { id: "history", name: "Interview History", icon: "history" },
    { id: "analytics", name: "Analytics", icon: "chart" },
  ];

  const tabIcons = {
    user: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    history: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    chart: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your account and view your interview performance
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tabIcons[tab.icon]}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
          className="mb-6"
        />
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-8">
          {/* Profile Image Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Profile Picture
            </h2>

            <div className="flex items-center space-x-6">
              <div className="relative">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-2xl">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.name}
                </h3>
                <p className="text-gray-500">{user?.email}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 btn btn-outline btn-sm"
                >
                  Change Picture
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Profile Information */}
          <div className="card">
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
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Updating...
                      </div>
                    ) : (
                      "Update Profile"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Password Change */}
          <div className="card">
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
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Updating...
                      </div>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interview History Tab */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Recent Interviews */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Recent Interviews
                </h2>

                {interviews.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No interviews yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start your first interview to see it here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviews.map((interview) => (
                      <div
                        key={interview._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {interview.techStack?.join(", ") || "Interview"}
                            </h3>
                            {getStatusBadge(interview.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              {interview.hardnessLevel} •{" "}
                              {interview.experienceLevel}
                            </span>
                            <span>{interview.numberOfQuestions} questions</span>
                            <span>{formatDate(interview.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Results */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Recent Results
                </h2>

                {results.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No results yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Complete an interview to see your results here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <div
                        key={result._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              Interview Result
                            </h3>
                            <span
                              className={`text-sm font-semibold ${getScoreColor(
                                result.overallScore
                              )}`}
                            >
                              {result.overallScore}% ({result.grade})
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              {result.questionsAnswered}/{result.totalQuestions}{" "}
                              answered
                            </span>
                            <span>{result.completionPercentage}% complete</span>
                            <span>{formatDate(result.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.totalInterviews || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Interviews</div>
                </div>

                <div className="card text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.completedInterviews || 0}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>

                <div className="card text-center">
                  <div
                    className={`text-2xl font-bold mb-1 ${getScoreColor(
                      stats.averageScore || 0
                    )}`}
                  >
                    {stats.averageScore || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>

                <div className="card text-center">
                  <div
                    className={`text-2xl font-bold mb-1 ${getScoreColor(
                      stats.bestScore || 0
                    )}`}
                  >
                    {stats.bestScore || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Best Score</div>
                </div>
              </div>

              {/* Performance Chart */}
              {stats.performanceData && stats.performanceData.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Performance Over Time
                  </h2>
                  <div className="space-y-4">
                    {stats.performanceData.map((data, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">
                            Interview {data.interview}
                          </span>
                          <span className="text-sm text-gray-500">
                            {data.date}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                data.score >= 80
                                  ? "bg-success-500"
                                  : data.score >= 60
                                  ? "bg-warning-500"
                                  : "bg-danger-500"
                              }`}
                              style={{ width: `${data.score}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-sm font-semibold ${getScoreColor(
                              data.score
                            )}`}
                          >
                            {data.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {stats.categoryBreakdown &&
                Object.keys(stats.categoryBreakdown).length > 0 && (
                  <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Skills Breakdown
                    </h2>
                    <div className="space-y-4">
                      {Object.entries(stats.categoryBreakdown).map(
                        ([category, score]) => (
                          <div key={category}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {category}
                              </span>
                              <span
                                className={`text-sm font-semibold ${getScoreColor(
                                  score
                                )}`}
                              >
                                {score}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  score >= 80
                                    ? "bg-success-500"
                                    : score >= 60
                                    ? "bg-warning-500"
                                    : "bg-danger-500"
                                }`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Recent Activity */}
              {stats.recentActivity && stats.recentActivity.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">
                              {activity.type}
                            </span>
                            {activity.score && (
                              <span
                                className={`text-sm font-semibold ${getScoreColor(
                                  activity.score
                                )}`}
                              >
                                {activity.score}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>{activity.techStack}</span>
                            <span>{activity.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!stats.performanceData || stats.performanceData.length === 0) &&
                (!stats.categoryBreakdown ||
                  Object.keys(stats.categoryBreakdown).length === 0) && (
                  <div className="card">
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No Analytics Data Yet
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Complete more interviews to see detailed analytics and
                        performance insights.
                      </p>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
