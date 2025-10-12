import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useInterview } from "../contexts/InterviewContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const { interviews, getAllInterviews, loading, error, clearError } =
    useInterview();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    recentInterviews: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const result = await getAllInterviews({ limit: 10, sort: "-createdAt" });
    if (result.success) {
      const interviewsData = result.interviews;
      const completed = interviewsData.filter(
        (interview) => interview.status === "completed"
      );

      setStats({
        totalInterviews: interviewsData.length,
        completedInterviews: completed.length,
        averageScore:
          completed.length > 0
            ? Math.round(
                completed.reduce(
                  (sum, interview) => sum + (interview.averageScore || 0),
                  0
                ) / completed.length
              )
            : 0,
        recentInterviews: interviewsData.slice(0, 5),
      });
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !interviews.length) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="mt-2 text-gray-600">
            Ready to practice your interview skills?
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/interview/setup" className="btn btn-primary">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Interview
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={clearError} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Interviews
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalInterviews}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-success-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedInterviews}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-warning-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageScore}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary-600"
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
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalInterviews - stats.completedInterviews}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Interviews
          </h2>
          <Link
            to="/profile"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            View all
          </Link>
        </div>

        {stats.recentInterviews.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No interviews yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first interview.
            </p>
            <div className="mt-6">
              <Link to="/interview/setup" className="btn btn-primary">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Interview
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="space-y-4">
              {stats.recentInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {interview.techStack?.join(", ") || "Interview"}
                      </h3>
                      {getStatusBadge(interview.status)}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        {interview.hardnessLevel} • {interview.experienceLevel}
                      </span>
                      <span>{interview.numberOfQuestions} questions</span>
                      <span>{formatDate(interview.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {interview.status === "completed" && (
                      <Link
                        to={`/results/${interview._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        View Results
                      </Link>
                    )}
                    {interview.status === "in_progress" && (
                      <Link
                        to={`/interview/${interview._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Continue
                      </Link>
                    )}
                    {interview.status === "generated" && (
                      <Link
                        to={`/interview/${interview._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Start
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
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
            <Link to="/interview/setup" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-success-600"
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
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                View Profile
              </h3>
              <p className="text-sm text-gray-500">
                Check your progress and history
              </p>
            </div>
            <Link to="/profile" className="btn btn-outline">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
