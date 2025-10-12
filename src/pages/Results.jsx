import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useInterview } from "../contexts/InterviewContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";

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
    if (score >= 80) return "text-success-600";
    if (score >= 60) return "text-warning-600";
    return "text-danger-600";
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return "badge-success";
    if (score >= 60) return "badge-warning";
    return "badge-danger";
  };

  const getGradeColor = (grade) => {
    if (["A+", "A", "A-"].includes(grade)) return "text-success-600";
    if (["B+", "B", "B-"].includes(grade)) return "text-warning-600";
    return "text-danger-600";
  };

  if (loading || isGeneratingResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">
          {isGeneratingResults
            ? "Generating your results..."
            : "Loading results..."}
        </p>
      </div>
    );
  }

  if (!results && !currentInterview) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Results not found</h2>
        <p className="mt-2 text-gray-600">
          The results you're looking for don't exist.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={clearError}
              className="mb-6"
            />
          )}

          <div className="mb-6">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-warning-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Results Not Available
            </h1>
            <p className="text-gray-600">
              Results for this interview are not yet available. This might
              happen if the interview was not completed or there was an error
              generating the results.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-outline"
            >
              Back to Dashboard
            </button>
            <button onClick={loadResults} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {error && <Alert type="error" message={error} onClose={clearError} />}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Interview Results
        </h1>
        <p className="text-gray-600">
          Here's how you performed in your interview
        </p>
      </div>

      {/* Overall Score */}
      <div className="card text-center">
        <div className="mb-4">
          <div
            className={`text-6xl font-bold mb-2 ${getScoreColor(
              results.overallScore
            )}`}
          >
            {results.overallScore}%
          </div>
          <div
            className={`text-2xl font-semibold mb-2 ${getGradeColor(
              results.grade
            )}`}
          >
            Grade: {results.grade}
          </div>
          <span
            className={`badge ${getScoreBadge(
              results.overallScore
            )} text-lg px-4 py-2`}
          >
            {results.passed ? "Passed" : "Needs Improvement"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Questions Answered</p>
            <p className="font-semibold">
              {results.questionsAnswered}/{results.totalQuestions}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Completion</p>
            <p className="font-semibold">{results.completionPercentage}%</p>
          </div>
          <div>
            <p className="text-gray-500">Time Taken</p>
            <p className="font-semibold">
              {Math.floor(results.completionTime / 60)}m{" "}
              {results.completionTime % 60}s
            </p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-semibold">
              {results.passed ? "Passed" : "Failed"}
            </p>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Performance Breakdown
        </h2>
        <div className="space-y-4">
          {Object.entries(results.categoryScores).map(([category, score]) => {
            if (score === null) return null;

            const categoryNames = {
              technicalKnowledge: "Technical Knowledge",
              communication: "Communication",
              problemSolving: "Problem Solving",
              confidence: "Confidence",
              facialAnalysis: "Presentation",
            };

            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {categoryNames[category] || category}
                  </span>
                  <span
                    className={`text-sm font-semibold ${getScoreColor(score)}`}
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
            );
          })}
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 text-success-500 mr-2"
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
            Strengths
          </h3>
          {results.strengths && results.strengths.length > 0 ? (
            <ul className="space-y-2">
              {results.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-4 h-4 text-success-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No specific strengths identified.
            </p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 text-warning-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Areas for Improvement
          </h3>
          {results.weaknesses && results.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {results.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-4 h-4 text-warning-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No specific areas for improvement identified.
            </p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 text-primary-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Recommendations
          </h3>
          <ul className="space-y-3">
            {results.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-medium text-primary-600">
                    {index + 1}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Feedback */}
      {results.detailedFeedback && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detailed Feedback
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {results.detailedFeedback}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          Take Another Interview
        </Link>
        <Link to="/dashboard" className="btn btn-outline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Results;
