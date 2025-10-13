import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  TrendingUp,
  Target,
  Clock,
  Award,
  BookOpen,
  BarChart3,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useData } from "../contexts/DataContext.jsx";
import { useAuthCache } from "../hooks/useAuthCache.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const { fetchDashboardData, invalidateInterviewData } = useData();
  useAuthCache(); // Clear cache on user changes

  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    recentInterviews: [],
    currentStreak: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [interviewsPerPage] = useState(5);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadDashboardData = useCallback(
    async (page = 1, forceRefresh = false) => {
      // Prevent multiple simultaneous loads
      if (isLoadingData) {
        console.log("[Dashboard] Already loading, skipping...");
        return;
      }

      try {
        setIsLoadingData(true);
        setLoadingStats(true);
        console.log(
          `[Dashboard] Loading data for page ${page}, forceRefresh: ${forceRefresh}`
        );

        const result = await fetchDashboardData({
          page,
          limit: interviewsPerPage,
          forceRefresh,
        });

        // Process interviews data
        if (result.interviews?.data?.success) {
          const interviewsData = result.interviews.data.data.interviews || [];
          const pagination = result.interviews.data.data.pagination || {};

          setTotalInterviews(pagination.total || interviewsData.length);

          const completed = interviewsData.filter(
            (interview) => interview.status === "completed"
          );

          // Get scores from analytics API
          let avgScore = 0;
          let bestScore = 0;

          if (result.analytics?.data?.success && result.analytics.data?.data) {
            const analyticsData = result.analytics.data.data;
            avgScore = analyticsData.averageScore || 0;
            bestScore = analyticsData.bestScore || 0;
            console.log(
              `[Dashboard] Analytics scores - Avg: ${avgScore}, Best: ${bestScore}`
            );
          }

          // Use interview stats if available
          let statsToUse = {};

          if (
            result.interviewStats?.data?.success &&
            result.interviewStats.data?.data
          ) {
            const interviewStats = result.interviewStats.data.data;

            statsToUse = {
              totalInterviews:
                interviewStats.total ||
                pagination.total ||
                interviewsData.length,
              completedInterviews:
                interviewStats.statusDistribution?.completed ||
                completed.length,
              averageScore: avgScore,
              bestScore: bestScore,
              recentInterviews: interviewsData,
              currentStreak: calculateStreak(interviewsData),
              statusDistribution: interviewStats.statusDistribution || {},
              hardnessDistribution: interviewStats.hardnessDistribution || {},
              experienceDistribution:
                interviewStats.experienceDistribution || {},
              averageQuestions: interviewStats.averageQuestions || 0,
            };
          } else {
            // Fallback calculation
            statsToUse = {
              totalInterviews: pagination.total || interviewsData.length,
              completedInterviews: completed.length,
              averageScore: avgScore,
              bestScore: bestScore,
              recentInterviews: interviewsData,
              currentStreak: calculateStreak(interviewsData),
            };
          }

          setStats((prev) => ({ ...prev, ...statsToUse }));
          console.log("[Dashboard] Data loaded successfully");
        }

        // Log any errors
        if (result.errors) {
          Object.entries(result.errors).forEach(([key, error]) => {
            if (error) {
              console.warn(`[Dashboard] ${key} error:`, error);
            }
          });
        }
      } catch (error) {
        console.error("[Dashboard] Failed to load data:", error);
      } finally {
        setLoadingStats(false);
        setIsLoadingData(false);
      }
    },
    [fetchDashboardData, interviewsPerPage, isLoadingData]
  );

  // Load data only when page changes (with simple debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDashboardData(currentPage);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, loadDashboardData]);

  // Auto-refresh when page becomes visible (but throttled)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const timeSinceLastRefresh = Date.now() - lastRefresh;
        // Only refresh if it's been more than 2 minutes since last refresh
        if (timeSinceLastRefresh > 2 * 60 * 1000) {
          console.log("[Dashboard] Auto-refreshing due to visibility change");
          loadDashboardData(currentPage, true);
          setLastRefresh(Date.now());
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loadDashboardData, currentPage, lastRefresh]);

  const calculateStreak = (interviews) => {
    // Simple streak calculation - consecutive days with interviews
    const sortedInterviews = interviews
      .filter((interview) => interview.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.completedAt || b.createdAt) -
          new Date(a.completedAt || a.createdAt)
      );

    if (sortedInterviews.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const interview of sortedInterviews) {
      const interviewDate = new Date(
        interview.completedAt || interview.createdAt
      );
      interviewDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (currentDate - interviewDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      generated: { variant: "info", text: "Generated" },
      in_progress: { variant: "warning", text: "In Progress" },
      completed: { variant: "success", text: "Completed" },
      abandoned: { variant: "danger", text: "Abandoned" },
    };

    const config = statusConfig[status] || {
      variant: "secondary",
      text: status,
    };
    return <Badge variant={config.variant}>{config.text}</Badge>;
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

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "primary",
    trend,
    delay = 0,
  }) => (
    <Card animate delay={delay} className="text-center glass-card">
      <div
        className={`w-12 h-12 bg-${color}-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-${color}-500/30`}
      >
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-300 mb-2">{title}</div>
      {trend !== undefined && (
        <div
          className={`flex items-center justify-center text-xs ${
            trend >= 0 ? "text-success-400" : "text-danger-400"
          }`}
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend > 0 ? "+" : ""}
          {trend}% this week
        </div>
      )}
    </Card>
  );

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-lg text-gray-300">
            Ready to ace your next interview? Let's practice!
          </p>
        </div>
        <div className="mt-6 sm:mt-0">
          <Link to="/interview/setup">
            <Button variant="primary" size="lg" icon={Plus}>
              New Interview
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Interviews"
          value={stats.totalInterviews}
          icon={BookOpen}
          color="primary"
          delay={0}
        />
        <StatCard
          title="Completed"
          value={stats.completedInterviews}
          icon={Target}
          color="success"
          delay={0.1}
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={Award}
          color={getScoreColor(stats.averageScore)}
          delay={0.2}
        />
        <StatCard
          title={stats.averageQuestions ? "Avg Questions" : "Current Streak"}
          value={
            stats.averageQuestions
              ? `${stats.averageQuestions} questions`
              : `${stats.currentStreak} days`
          }
          icon={stats.averageQuestions ? Clock : TrendingUp}
          color="warning"
          delay={0.3}
        />
      </div>

      {/* Interview Overview Stats */}
      {!loadingStats &&
        (stats.statusDistribution ||
          stats.hardnessDistribution ||
          stats.experienceDistribution) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Distribution */}
            {stats.statusDistribution &&
              Object.keys(stats.statusDistribution).length > 0 && (
                <Card animate delay={0.35}>
                  <h3 className="text-lg font-semibold text-white-900 mb-4">
                    Interview Status
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.statusDistribution).map(
                      ([status, count]) => {
                        const total = Object.values(
                          stats.statusDistribution
                        ).reduce((sum, c) => sum + c, 0);
                        const percentage =
                          total > 0 ? (count / total) * 100 : 0;
                        const statusConfig = {
                          generated: { color: "info", label: "Generated" },
                          inProgress: {
                            color: "warning",
                            label: "In Progress",
                          },
                          completed: { color: "success", label: "Completed" },
                          abandoned: { color: "danger", label: "Abandoned" },
                        };
                        const config = statusConfig[status] || {
                          color: "secondary",
                          label: status,
                        };

                        return (
                          <div
                            key={status}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <Badge variant={config.color} size="sm">
                                {config.label}
                              </Badge>
                              <span className="text-sm text-white-300">
                                {count}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full bg-${config.color}-500`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-white-500 w-8">
                                {Math.round(percentage)}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </Card>
              )}

            {/* Difficulty Distribution */}
            {stats.hardnessDistribution &&
              Object.keys(stats.hardnessDistribution).length > 0 && (
                <Card animate delay={0.4}>
                  <h3 className="text-lg font-semibold text-white-900 mb-4">
                    Difficulty Levels
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.hardnessDistribution).map(
                      ([level, count]) => {
                        const total = Object.values(
                          stats.hardnessDistribution
                        ).reduce((sum, c) => sum + c, 0);
                        const percentage =
                          total > 0 ? (count / total) * 100 : 0;
                        const levelConfig = {
                          Easy: { color: "success", icon: "🟢" },
                          Medium: { color: "warning", icon: "🟡" },
                          Hard: { color: "danger", icon: "🔴" },
                        };
                        const config = levelConfig[level] || {
                          color: "secondary",
                          icon: "⚪",
                        };

                        return (
                          <div
                            key={level}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{config.icon}</span>
                              <span className="text-sm font-medium text-white-700">
                                {level}
                              </span>
                              <span className="text-sm text-white-600">
                                ({count})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full bg-${config.color}-500`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-white-500 w-8">
                                {Math.round(percentage)}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </Card>
              )}

            {/* Experience Distribution */}
            {stats.experienceDistribution &&
              Object.keys(stats.experienceDistribution).length > 0 && (
                <Card animate delay={0.45}>
                  <h3 className="text-lg font-semibold text-white-900 mb-4">
                    Experience Levels
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.experienceDistribution).map(
                      ([level, count]) => {
                        const total = Object.values(
                          stats.experienceDistribution
                        ).reduce((sum, c) => sum + c, 0);
                        const percentage =
                          total > 0 ? (count / total) * 100 : 0;
                        const levelConfig = {
                          Fresher: { color: "info", icon: "🌱" },
                          Junior: { color: "success", icon: "🌿" },
                          Mid: { color: "warning", icon: "🌳" },
                          Senior: { color: "primary", icon: "🏆" },
                          Lead: { color: "danger", icon: "👑" },
                        };
                        const config = levelConfig[level] || {
                          color: "secondary",
                          icon: "👤",
                        };

                        return (
                          <div
                            key={level}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{config.icon}</span>
                              <span className="text-sm font-medium text-white-700">
                                {level}
                              </span>
                              <span className="text-sm text-white-600">
                                ({count})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full bg-${config.color}-500`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-white-500 w-8">
                                {Math.round(percentage)}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </Card>
              )}
          </div>
        )}

      {/* Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/interview/setup">
          <Button
            variant="primary"
            size="lg"
            icon={Plus}
            className="w-full sm:w-auto"
          >
            Start New Interview
          </Button>
        </Link>
        <Link to="/profile?tab=analytics">
          <Button
            variant="outline"
            size="lg"
            icon={BarChart3}
            className="w-full sm:w-auto"
          >
            View Analytics
          </Button>
        </Link>
      </div>

      {/* Recent Interviews */}
      <Card animate delay={0.6}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Recent Interviews
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log("[Dashboard] Manual refresh triggered");
                invalidateInterviewData();
                loadDashboardData(currentPage, true);
                setLastRefresh(Date.now());
              }}
              disabled={loadingStats}
            >
              {loadingStats ? (
                <LoadingSpinner size="sm" />
              ) : (
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
            </Button>
            <Link to="/profile?tab=history">
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
              >
                View all
              </Button>
            </Link>
          </div>
        </div>

        {stats.recentInterviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No interviews yet
            </h3>
            <p className="text-gray-300 mb-6">
              Get started by creating your first interview.
            </p>
            <Link to="/interview/setup">
              <Button variant="primary" icon={Plus}>
                Create Interview
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {stats.recentInterviews.map((interview, index) => (
                <motion.div
                  key={interview._id}
                  className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-200 hover:shadow-xl backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-medium text-white truncate">
                        {interview.techStack?.join(", ") || "General Interview"}
                      </h3>
                      {getStatusBadge(interview.status)}
                      {interview.status === "completed" &&
                        interview.averageScore && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              interview.averageScore >= 80
                                ? "bg-success-100 text-success-800"
                                : interview.averageScore >= 60
                                ? "bg-warning-100 text-warning-800"
                                : "bg-danger-100 text-danger-800"
                            }`}
                          >
                            {interview.averageScore}%
                          </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>
                          {interview.hardnessLevel} •{" "}
                          {interview.experienceLevel}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{interview.numberOfQuestions} questions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(interview.createdAt)}</span>
                      </div>
                      {interview.status === "completed" &&
                        interview.completedAt && (
                          <div className="flex items-center space-x-1">
                            <Award className="w-3 h-3" />
                            <span>
                              Completed {formatDate(interview.completedAt)}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {interview.status === "completed" && (
                      <Link to={`/results/${interview._id}`}>
                        <Button variant="outline" size="sm">
                          Results
                        </Button>
                      </Link>
                    )}
                    {interview.status === "in_progress" && (
                      <Link to={`/interview/${interview._id}`}>
                        <Button variant="primary" size="sm">
                          Continue
                        </Button>
                      </Link>
                    )}
                    {interview.status === "generated" && (
                      <Link to={`/interview/${interview._id}`}>
                        <Button variant="primary" size="sm">
                          Start
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalInterviews > interviewsPerPage && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-white-500">
                  Showing {(currentPage - 1) * interviewsPerPage + 1} to{" "}
                  {Math.min(currentPage * interviewsPerPage, totalInterviews)}{" "}
                  of {totalInterviews} interviews
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-300">
                    Page {currentPage} of{" "}
                    {Math.ceil(totalInterviews / interviewsPerPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={
                      currentPage >=
                      Math.ceil(totalInterviews / interviewsPerPage)
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card animate delay={0.7} hover>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-white-900">
                Start New Interview
              </h3>
              <p className="text-sm text-gray-300">
                Create a customized interview session
              </p>
            </div>
            <Link to="/interview/setup">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </Card>

        <Card animate delay={0.8} hover>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-success-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-white-900">
                View Analytics
              </h3>
              <p className="text-sm text-gray-300">
                Check your progress and performance
              </p>
            </div>
            <Link to="/profile">
              <Button variant="outline">View Profile</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
