import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Target,
  Trash2,
  Play,
  Eye,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { interviewAPI } from "../services/api";
import { useData } from "../contexts/DataContext.jsx";
import { useDebouncedCallback } from "../hooks/useDebounce.js";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";
import LoadingSpinner from "./LoadingSpinner";

const InterviewHistory = () => {
  const { fetchInterviewHistory, invalidateInterviewData } = useData();
  const [interviews, setInterviews] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Debounced data loading to prevent rapid API calls on filter changes
  const debouncedLoadData = useDebouncedCallback(
    () => loadData(),
    500, // 500ms debounce for filter changes
    [filter, sortBy, sortOrder]
  );

  useEffect(() => {
    debouncedLoadData();
  }, [filter, sortBy, sortOrder, debouncedLoadData]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[InterviewHistory] Loading data with filters:", {
        filter,
        sortBy,
        sortOrder,
      });

      const params = {
        sort: sortOrder === "desc" ? `-${sortBy}` : sortBy,
        limit: 50,
      };

      if (filter !== "all") {
        params.status = filter;
      }

      const result = await fetchInterviewHistory(params);

      if (result.interviews?.data?.success) {
        setInterviews(result.interviews.data.data.interviews || []);
      }

      if (result.results?.data?.success) {
        setResults(result.results.data.data.results || []);
      }

      if (result.errors.interviews || result.errors.results) {
        toast.error("Failed to load some interview history data");
      }
    } catch (error) {
      toast.error("Failed to load interview history");
      console.error("[InterviewHistory] Load data error:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchInterviewHistory, filter, sortBy, sortOrder]);

  const handleDeleteInterview = useCallback(
    async (interviewId) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this interview? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        await interviewAPI.delete(interviewId);
        setInterviews((prev) =>
          prev.filter((interview) => interview._id !== interviewId)
        );
        // Invalidate cache to ensure fresh data on next load
        invalidateInterviewData();
        toast.success("Interview deleted successfully");
      } catch (error) {
        toast.error("Failed to delete interview");
        console.error("[InterviewHistory] Delete error:", error);
      }
    },
    [invalidateInterviewData]
  );

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

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
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

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getResultForInterview = (interviewId) => {
    return results.find(
      (result) =>
        result.interviewId === interviewId ||
        result.interviewId?._id === interviewId
    );
  };

  // Memoize filtered interviews to prevent unnecessary re-renders
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      if (filter === "all") return true;
      return interview.status === filter;
    });
  }, [interviews, filter]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-300" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input py-1 text-sm"
              >
                <option value="all">All Interviews</option>
                <option value="generated">Generated</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="input py-1 text-sm"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="completedAt-desc">Recently Completed</option>
                <option value="numberOfQuestions-desc">Most Questions</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-300">
            {filteredInterviews.length} interview
            {filteredInterviews.length !== 1 ? "s" : ""}
          </div>
        </div>
      </Card>

      {/* Interview List */}
      {filteredInterviews.length === 0 ? (
        <Card className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {filter === "all"
              ? "No interviews yet"
              : `No ${filter.replace("_", " ")} interviews`}
          </h3>
          <p className="text-gray-300 mb-6">
            {filter === "all"
              ? "Start your first interview to see it here."
              : `You don't have any ${filter.replace("_", " ")} interviews.`}
          </p>
          <Link to="/interview/setup">
            <Button variant="primary">Create New Interview</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredInterviews.map((interview, index) => {
              const result = getResultForInterview(interview._id);

              return (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card hover className="transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {interview.techStack?.join(", ") ||
                              "General Interview"}
                          </h3>
                          {getStatusBadge(interview.status)}
                          {result && (
                            <Badge variant={getScoreColor(result.overallScore)}>
                              {result.overallScore}% ({result.grade})
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4" />
                            <span>
                              {interview.hardnessLevel} •{" "}
                              {interview.experienceLevel}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{interview.numberOfQuestions} questions</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {interview.duration
                                ? formatDuration(interview.duration)
                                : formatDate(interview.createdAt)}
                            </span>
                          </div>

                          {interview.completedAt && (
                            <div className="flex items-center space-x-1">
                              <span className="text-success-600">
                                Completed {formatDate(interview.completedAt)}
                              </span>
                            </div>
                          )}
                        </div>

                        {result && (
                          <div className="mt-3 p-3 bg--50 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white-600">
                                Performance Summary:
                              </span>
                              <span
                                className={`font-medium ${
                                  result.passed
                                    ? "text-success-600"
                                    : "text-danger-600"
                                }`}
                              >
                                {result.passed ? "Passed" : "Needs Improvement"}
                              </span>
                            </div>

                            {result.categoryScores && (
                              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                {Object.entries(result.categoryScores).map(
                                  ([category, score]) =>
                                    score !== null && (
                                      <div
                                        key={category}
                                        className="text-center"
                                      >
                                        <div className="text-gray-300 capitalize">
                                          {category
                                            .replace(/([A-Z])/g, " $1")
                                            .trim()}
                                        </div>
                                        <div
                                          className={`font-medium text-${getScoreColor(
                                            score
                                          )}-600`}
                                        >
                                          {score}%
                                        </div>
                                      </div>
                                    )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {interview.status === "completed" && result && (
                          <Link to={`/results/${interview._id}`}>
                            <Button variant="outline" size="sm" icon={Eye}>
                              Results
                            </Button>
                          </Link>
                        )}

                        {interview.status === "in_progress" && (
                          <Link to={`/interview/${interview._id}`}>
                            <Button variant="primary" size="sm" icon={Play}>
                              Continue
                            </Button>
                          </Link>
                        )}

                        {interview.status === "generated" && (
                          <Link to={`/interview/${interview._id}`}>
                            <Button variant="primary" size="sm" icon={Play}>
                              Start
                            </Button>
                          </Link>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteInterview(interview._id)}
                          className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;
