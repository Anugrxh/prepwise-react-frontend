import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Plus,
  ArrowLeft,
  Award,
  BarChart3,
} from "lucide-react";
import { useInterview } from "../contexts/InterviewContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import ProgressBar from "../components/ProgressBar.jsx";

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    results,
    currentInterview,
    getResultsByInterview,
    getInterviewById,
    generateResults,
    loading,
    error,
    clearError,
  } = useInterview();

  const [isGeneratingResults, setIsGeneratingResults] = useState(false);

  useEffect(() => {
    if (id) {
      loadResults();
    }
  }, [id]);

  const loadResults = async () => {
    // First try to get existing results
    const resultResponse = await getResultsByInterview(id);

    if (!resultResponse.success) {
      // If no results exist, try to generate them
      setIsGeneratingResults(true);
      const generateResponse = await generateResults(id);
      setIsGeneratingResults(false);

      if (!generateResponse.success) {
        // If generation fails, load interview data for context
        await getInterviewById(id);
      }
    }

    // Also load interview data if not already loaded
    if (!currentInterview) {
      await getInterviewById(id);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  const getScoreTextColor = (score) => {
    if (score >= 80) return "text-success-400";
    if (score >= 60) return "text-warning-400";
    return "text-danger-400";
  };

  const getGradeColor = (grade) => {
    if (["A+", "A", "A-"].includes(grade)) return "text-success-400";
    if (["B+", "B", "B-"].includes(grade)) return "text-warning-400";
    return "text-danger-400";
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading || isGeneratingResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <LoadingSpinner size="lg" />
        </motion.div>
        <motion.p
          className="mt-4 text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isGeneratingResults
            ? "Generating your results..."
            : "Loading results..."}
        </motion.p>
      </div>
    );
  }

  if (!results && !currentInterview) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
          <XCircle className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Results not found
        </h2>
        <p className="text-gray-300 mb-6">
          The results you're looking for don't exist.
        </p>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="primary"
          icon={ArrowLeft}
        >
          Back to Dashboard
        </Button>
      </motion.div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card animate>
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-warning-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-warning-500/30">
              <AlertTriangle className="w-8 h-8 text-warning-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Results Not Available
            </h1>
            <p className="text-gray-300">
              Results for this interview are not yet available. This might
              happen if the interview was not completed or there was an error
              generating the results.
            </p>
          </motion.div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              icon={ArrowLeft}
            >
              Back to Dashboard
            </Button>
            <Button onClick={loadResults} variant="primary">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Interview Results
        </h1>
        <p className="text-lg text-gray-300">
          Here's how you performed in your interview
        </p>
      </motion.div>

      {/* Overall Score */}
      <Card animate className="text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-emerald-500/10 opacity-50"></div>

        <div className="relative z-10">
          <motion.div
            className="mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <div className="flex items-center justify-center mb-4">
              {results.passed ? (
                <Trophy className="w-16 h-16 text-yellow-500 mr-4" />
              ) : (
                <Target className="w-16 h-16 text-gray-400 mr-4" />
              )}
              <div
                className={`text-7xl font-bold ${getScoreTextColor(
                  results.overallScore
                )}`}
              >
                {results.overallScore}%
              </div>
            </div>

            <div
              className={`text-3xl font-semibold mb-4 ${getGradeColor(
                results.grade
              )}`}
            >
              Grade: {results.grade}
            </div>

            <Badge
              variant={getScoreColor(results.overallScore)}
              size="lg"
              className="text-lg px-6 py-2"
            >
              {results.passed ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" /> Passed
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 mr-2" /> Needs Improvement
                </>
              )}
            </Badge>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-sm text-gray-300 mb-1">Questions Answered</p>
              <p className="text-xl font-bold text-white">
                {results.questionsAnswered}/{results.totalQuestions}
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm text-gray-300 mb-1">Completion</p>
              <p className="text-xl font-bold text-white">
                {results.completionPercentage || 0}%
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-sm text-gray-300 mb-1">Time Taken</p>
              <p className="text-xl font-bold text-white">
                {formatDuration(results.completionTime)}
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div
                className={`w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center mx-auto mb-2`}
              >
                {results.passed ? (
                  <Award className="w-6 h-6 text-emerald-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <p className="text-sm text-gray-300 mb-1">Status</p>
              <p
                className={`text-xl font-bold ${
                  results.passed ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {results.passed ? "Passed" : "Failed"}
              </p>
            </motion.div>
          </div>
        </div>
      </Card>

      {/* Category Scores */}
      <Card animate delay={0.1}>
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-violet-400" />
          Performance Breakdown
        </h2>
        <div className="space-y-6">
          {Object.entries(results.categoryScores).map(
            ([category, score], index) => {
              if (score === null) return null;

              const categoryNames = {
                technicalKnowledge: "Technical Knowledge",
                communication: "Communication",
                problemSolving: "Problem Solving",
                confidence: "Confidence",
                facialAnalysis: "Presentation",
              };

              const categoryIcons = {
                technicalKnowledge: Target,
                communication: CheckCircle,
                problemSolving: Lightbulb,
                confidence: TrendingUp,
                facialAnalysis: Award,
              };

              const Icon = categoryIcons[category] || Target;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-violet-400" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {categoryNames[category] || category}
                      </span>
                    </div>
                    <Badge variant={getScoreColor(score)}>{score}%</Badge>
                  </div>
                  <ProgressBar
                    value={score}
                    variant={getScoreColor(score)}
                    size="lg"
                    animate
                  />
                </motion.div>
              );
            }
          )}
        </div>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card animate delay={0.2}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
            Strengths
          </h3>
          {results.strengths && results.strengths.length > 0 ? (
            <ul className="space-y-3">
              {results.strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-300 leading-relaxed">
                    {strength}
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No specific strengths identified.
            </p>
          )}
        </Card>

        {/* Weaknesses */}
        <Card animate delay={0.3}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-400 mr-2" />
            Areas for Improvement
          </h3>
          {results.weaknesses && results.weaknesses.length > 0 ? (
            <ul className="space-y-3">
              {results.weaknesses.map((weakness, index) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  </div>
                  <span className="text-sm text-gray-300 leading-relaxed">
                    {weakness}
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No specific areas for improvement identified.
            </p>
          )}
        </Card>
      </div>

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <Card animate delay={0.4}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 text-violet-400 mr-2" />
            Recommendations
          </h3>
          <ul className="space-y-4">
            {results.recommendations.map((recommendation, index) => (
              <motion.li
                key={index}
                className="flex items-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 backdrop-blur-sm border border-violet-500/30 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0 shadow-sm">
                  <span className="text-sm font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <span className="text-sm text-gray-300 leading-relaxed">
                  {recommendation}
                </span>
              </motion.li>
            ))}
          </ul>
        </Card>
      )}

      {/* Detailed Feedback */}
      {results.detailedFeedback && (
        <Card animate delay={0.5}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-violet-400 mr-2" />
            Detailed Feedback
          </h3>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <p className="text-gray-300 leading-relaxed text-base">
              {results.detailedFeedback}
            </p>
          </div>
        </Card>
      )}

      {/* Actions */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Link to="/interview/setup">
          <Button variant="primary" size="lg" icon={Plus}>
            Take Another Interview
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" size="lg" icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Results;
