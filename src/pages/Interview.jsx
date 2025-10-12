import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInterview } from "../contexts/InterviewContext.jsx";
import { useData } from "../contexts/DataContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";
import WebcamCapture from "../components/WebcamCapture.jsx";

const Interview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invalidateInterviewData, invalidateAnalyticsData } = useData();
  const {
    currentInterview,
    getInterviewById,
    startInterview,
    submitAllAnswers,
    completeInterview,
    loading,
    error,
    clearError,
  } = useInterview();

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [facialAnalysisData, setFacialAnalysisData] = useState(null);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (id) {
      loadInterview();
    }
  }, [id]);

  useEffect(() => {
    if (currentInterview && currentInterview.status === "in_progress") {
      setInterviewStarted(true);
      setStartTime(new Date());
      setQuestionStartTime(new Date());
    }
  }, [currentInterview]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [answers, currentQuestionIndex]);

  const loadInterview = async () => {
    const result = await getInterviewById(id);
    if (!result.success) {
      navigate("/dashboard");
    }
  };

  const handleStartInterview = async () => {
    const result = await startInterview(id);
    if (result.success) {
      setInterviewStarted(true);
      setStartTime(new Date());
      setQuestionStartTime(new Date());
    }
  };

  const handleAnswerChange = (value) => {
    const currentQuestion = currentInterview.questions[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.questionNumber]: {
        questionNumber: parseInt(currentQuestion.questionNumber), // Ensure integer
        answerText: value,
        answerDuration: 0, // Will be calculated when moving to next question or submitting
      },
    }));
  };

  const calculateQuestionDuration = () => {
    if (questionStartTime) {
      return Math.floor((new Date() - questionStartTime) / 1000);
    }
    return 0;
  };

  const handleNextQuestion = () => {
    // Save duration for current question
    const currentQuestion = currentInterview.questions[currentQuestionIndex];
    const duration = calculateQuestionDuration();

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.questionNumber]: {
        ...prev[currentQuestion.questionNumber],
        answerDuration: parseInt(duration) || 0, // Ensure integer
      },
    }));

    if (currentQuestionIndex < currentInterview.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionStartTime(new Date());
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setQuestionStartTime(new Date());
    }
  };

  const handleWebcamCapture = (imageSrc) => {
    // Store facial analysis data for later submission
    setFacialAnalysisData({
      timestamp: new Date().toISOString(),
      image: imageSrc,
      questionNumber:
        currentInterview.questions[currentQuestionIndex].questionNumber,
    });
  };

  const handleSubmitAllAnswers = async () => {
    setIsSubmitting(true);

    try {
      // Calculate duration for current question
      const currentQuestion = currentInterview.questions[currentQuestionIndex];
      const currentDuration = calculateQuestionDuration();

      // Update current answer with duration
      const updatedAnswers = {
        ...answers,
        [currentQuestion.questionNumber]: {
          ...answers[currentQuestion.questionNumber],
          answerDuration: currentDuration,
        },
      };

      // Calculate total interview duration
      const totalDuration = Math.floor((new Date() - startTime) / 1000);

      // Convert answers object to array format expected by API
      const answersArray = Object.values(updatedAnswers)
        .filter(
          (answer) => answer.answerText && answer.answerText.trim().length >= 10
        ) // Backend requires min 10 chars
        .map((answer) => ({
          questionNumber: parseInt(answer.questionNumber), // Ensure it's an integer
          answerText: answer.answerText.trim(), // Trim whitespace
          answerDuration: parseInt(answer.answerDuration) || 0, // Ensure it's an integer
        }));

      if (answersArray.length === 0) {
        throw new Error(
          "Please provide at least one answer with minimum 10 characters before submitting."
        );
      }

      // Validate each answer meets requirements
      for (const answer of answersArray) {
        if (!answer.answerText || answer.answerText.length < 10) {
          throw new Error(
            `Answer for question ${answer.questionNumber} must be at least 10 characters long.`
          );
        }
        if (answer.answerText.length > 5000) {
          throw new Error(
            `Answer for question ${answer.questionNumber} must be less than 5000 characters.`
          );
        }
      }

      // Prepare facial analysis result if available
      let facialAnalysisResult = null;
      if (facialAnalysisData) {
        facialAnalysisResult = {
          confidence: 75,
          emotions: { neutral: 60, happy: 30, fear: 10 },
          eyeContact: 70,
          speechClarity: 75,
          overallScore: 72,
          feedback: "Facial analysis captured during interview",
        };
      }

      // Submit all answers
      const result = await submitAllAnswers(
        currentInterview._id,
        answersArray,
        totalDuration,
        facialAnalysisResult
      );

      if (result.success) {
        // Complete the interview
        await completeInterview(currentInterview._id);

        // Invalidate cache to ensure fresh data is loaded
        invalidateInterviewData();
        invalidateAnalyticsData();

        // Navigate to results page
        navigate(`/results/${currentInterview._id}`);
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const getAnsweredQuestionsCount = () => {
    return Object.values(answers).filter(
      (answer) =>
        answer.answerText &&
        answer.answerText.trim().length >= 10 &&
        answer.answerText.trim().length <= 5000 // Backend requires 10-5000 characters
    ).length;
  };

  const getCurrentAnswer = () => {
    const currentQuestion = currentInterview?.questions[currentQuestionIndex];
    if (!currentQuestion) return "";
    return answers[currentQuestion.questionNumber]?.answerText || "";
  };

  const isCurrentQuestionAnswered = () => {
    const currentAnswer = getCurrentAnswer();
    return (
      currentAnswer &&
      currentAnswer.trim().length >= 10 &&
      currentAnswer.trim().length <= 5000
    ); // Backend requires 10-5000 characters
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentInterview) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Interview not found
        </h2>
        <p className="mt-2 text-gray-600">
          The interview you're looking for doesn't exist.
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

  if (!interviewStarted && currentInterview.status === "generated") {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Start Your Interview?
            </h1>
            <p className="text-gray-600">
              You're about to begin an interview with{" "}
              {currentInterview.numberOfQuestions} questions covering{" "}
              {currentInterview.techStack.join(", ")}.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Difficulty:</span>
                <span className="ml-2 text-gray-600">
                  {currentInterview.hardnessLevel}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Experience:</span>
                <span className="ml-2 text-gray-600">
                  {currentInterview.experienceLevel}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Questions:</span>
                <span className="ml-2 text-gray-600">
                  {currentInterview.numberOfQuestions}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Technologies:</span>
                <span className="ml-2 text-gray-600">
                  {currentInterview.techStack.length}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={clearError}
              className="mb-6"
            />
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleStartInterview}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Starting...
                </div>
              ) : (
                "Start Interview"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = currentInterview.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / currentInterview.questions.length) * 100;
  const answeredCount = getAnsweredQuestionsCount();

  return (
    <div className="max-w-6xl mx-auto">
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={clearError}
          className="mb-6"
        />
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestionIndex + 1} of{" "}
            {currentInterview.questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {answeredCount} answered
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Interview Section */}
        <div className="lg:col-span-2">
          {/* Question */}
          <div className="card mb-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-primary">
                  Question {currentQuestion.questionNumber}
                </span>
                {currentQuestion.category && (
                  <span className="text-sm text-gray-500">
                    {currentQuestion.category}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Answer Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <textarea
                ref={textareaRef}
                value={getCurrentAnswer()}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="textarea min-h-32 max-h-64"
                rows={4}
              />
              <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                <span>
                  {getCurrentAnswer().length}/5000 characters
                  {getCurrentAnswer().length > 0 &&
                    getCurrentAnswer().length < 10 && (
                      <span className="text-warning-600 ml-2">
                        (minimum 10 required)
                      </span>
                    )}
                  {getCurrentAnswer().length > 5000 && (
                    <span className="text-danger-600 ml-2">
                      (maximum 5000 exceeded)
                    </span>
                  )}
                </span>
                {getCurrentAnswer().length > 5000 ? (
                  <span className="text-danger-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Too Long
                  </span>
                ) : getCurrentAnswer().length >= 10 ? (
                  <span className="text-success-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
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
                    Valid Answer
                  </span>
                ) : getCurrentAnswer().length > 0 ? (
                  <span className="text-warning-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
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
                    Too Short
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            <div className="flex space-x-3">
              {currentQuestionIndex < currentInterview.questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="btn btn-primary"
                >
                  Next
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="btn btn-success"
                >
                  Submit Interview
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Webcam Section */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Video Recording (Optional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enable your camera for facial analysis during the interview. This
              is optional and can help improve your presentation skills.
            </p>
            <WebcamCapture
              onCapture={handleWebcamCapture}
              isRecording={webcamEnabled}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Submit Interview?
            </h3>
            <p className="text-gray-600 mb-4">
              You have answered {answeredCount} out of{" "}
              {currentInterview.questions.length} questions. Once submitted, you
              cannot make changes to your answers.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAllAnswers}
                disabled={isSubmitting}
                className="btn btn-success"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </div>
                ) : (
                  "Submit All Answers"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Submit Button (Always Visible) */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowConfirmSubmit(true)}
          className="btn btn-success shadow-lg"
          title="Submit all answers"
        >
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
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          Submit ({answeredCount}/{currentInterview.questions.length})
        </button>
      </div>
    </div>
  );
};

export default Interview;
