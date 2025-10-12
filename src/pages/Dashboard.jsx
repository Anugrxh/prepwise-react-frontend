import React, { useState, useEffect } from "react";
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
  ArrowRight
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useInterview } from "../contexts/InterviewContext.jsx";
import { userAPI } from "../services/api.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import ProgressBar from "../components/ProgressBar.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const { interviews, getAllInterviews, getInterviewStats, loading } = useInterview();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    passRate: 0,
    recentInterviews: [],
    weeklyProgress: 0,
    monthlyGoal: 10,
    currentStreak: 0,
  });
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [interviewsPerPage] = useState(5);
  const [totalInterviews, setTotalInterviews] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [currentPage]);

  const loadDashboardData = async () => {
    try {
      setLoadingStats(true);
      
      // Load interviews and user stats in parallel
      const [interviewsResult, userStatsResult, interviewStatsResult] = await Promise.all([
        getAllInterviews({ 
          limit: interviewsPerPage, 
          page: currentPage,
          sort: "-createdAt" 
        }),
        userAPI.getStats().catch(() => ({ data: { success: false } })),
        getInterviewStats().catch(() => ({ success: false }))
      ]);

      if (interviewsResult.success) {
        const interviewsData = interviewsResult.interviews;
        const pagination = interviewsResult.pagination || {};
        
        setTotalInterviews(pagination.total || interviewsData.length);
        
        const completed = interviewsData.filter(
          (interview) => interview.status === "completed"
        );

        // Calculate weekly progress (interviews this week)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyInterviews = interviewsData.filter(
          interview => new Date(interview.createdAt) >= oneWeekAgo
        );

        setStats(prev => ({
          ...prev,
          totalInterviews: pagination.total || interviewsData.length,
          completedInterviews: completed.length,
          averageScore: completed.length > 0
            ? Math.round(
                completed.reduce(
                  (sum, interview) => sum + (interview.averageScore || 75),
                  0
                ) / completed.length
              )
            : 0,
          bestScore: completed.length > 0
            ? Math.max(...completed.map(interview => interview.averageScore || 75))
            : 0,
          passRate: completed.length > 0
            ? Math.round((completed.filter(interview => (interview.averageScore || 75) >= 60).length / completed.length) * 100)
            : 0,
          recentInterviews: interviewsData,
          weeklyProgress: weeklyInterviews.length,
          currentStreak: calculateStreak(interviewsData),
        }));
      }

      if (userStatsResult.data?.success) {
        setUserStats(userStatsResult.data.data);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const calculateStreak = (interviews) => {
    // Simple streak calculation - consecutive days with interviews
    const sortedInterviews = interviews
      .filter(interview => interview.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
    
    if (sortedInterviews.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const interview of sortedInterviews) {
      const interviewDate = new Date(interview.completedAt || interview.createdAt);
      interviewDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate - interviewDate) / (1000 * 60 * 60 * 24));
      
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

    const config = statusConfig[status] || { variant: "secondary", text: status };
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
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const StatCard = ({ title, value, icon: Icon, color = 'primary', trend, delay = 0 }) => (
    <Card animate delay={delay} className="text-center">
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      {trend !== undefined && (
        <div className={`flex items-center justify-center text-xs ${
          trend >= 0 ? 'text-success-600' : 'text-danger-600'
        }`}>
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend > 0 ? '+' : ''}{trend}% this week
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-lg text-gray-600">
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
          trend={stats.weeklyProgress}
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
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          icon={TrendingUp}
          color="warning"
          delay={0.3}
        />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card animate delay={0.4} className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Interviews This Week
                </span>
                <span className="text-sm text-gray-500">
                  {stats.weeklyProgress} / {stats.monthlyGoal}
                </span>
              </div>
              <ProgressBar
                value={stats.weeklyProgress}
                max={stats.monthlyGoal}
                variant="primary"
                size="lg"
                animate
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Pass Rate
                </span>
                <span className="text-sm text-gray-500">{stats.passRate}%</span>
              </div>
              <ProgressBar
                value={stats.passRate}
                variant={getScoreColor(stats.passRate)}
                size="md"
                animate
              />
            </div>
          </div>
        </Card>

        <Card animate delay={0.5}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Best Score</span>
              <Badge variant={getScoreColor(stats.bestScore)}>
                {stats.bestScore}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pass Rate</span>
              <Badge variant={getScoreColor(stats.passRate)}>
                {stats.passRate}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Week</span>
              <Badge variant="info">
                {stats.weeklyProgress} interviews
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/interview/setup">
          <Button variant="primary" size="lg" icon={Plus} className="w-full sm:w-auto">
            Start New Interview
          </Button>
        </Link>
        <Link to="/profile?tab=analytics">
          <Button variant="outline" size="lg" icon={BarChart3} className="w-full sm:w-auto">
            View Analytics
          </Button>
        </Link>
      </div>

      {/* Recent Interviews */}
      <Card animate delay={0.6}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Interviews
          </h2>
          <Link to="/profile?tab=history">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              View all
            </Button>
          </Link>
        </div>

        {stats.recentInterviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No interviews yet
            </h3>
            <p className="text-gray-500 mb-6">
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
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {interview.techStack?.join(", ") || "General Interview"}
                      </h3>
                      {getStatusBadge(interview.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>{interview.hardnessLevel} • {interview.experienceLevel}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{interview.numberOfQuestions} questions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(interview.createdAt)}</span>
                      </div>
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
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * interviewsPerPage) + 1} to {Math.min(currentPage * interviewsPerPage, totalInterviews)} of {totalInterviews} interviews
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {Math.ceil(totalInterviews / interviewsPerPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil(totalInterviews / interviewsPerPage)}
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
              <h3 className="text-lg font-medium text-gray-900">
                Start New Interview
              </h3>
              <p className="text-sm text-gray-500">
                Create a customized interview session
              </p>
            </div>
            <Link to="/interview/setup">
              <Button variant="primary">
                Get Started
              </Button>
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
              <h3 className="text-lg font-medium text-gray-900">
                View Analytics
              </h3>
              <p className="text-sm text-gray-500">
                Check your progress and performance
              </p>
            </div>
            <Link to="/profile">
              <Button variant="outline">
                View Profile
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
