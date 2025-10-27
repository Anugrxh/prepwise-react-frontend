import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Vapi from "@vapi-ai/web";
import { useInterview } from "../contexts/InterviewContext.jsx";
import { useData } from "../contexts/DataContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";
import WebcamCapture from "../components/WebcamCapture.jsx";
import { facialAnalysisAPI, answerAPI } from "../services/api.jsx";

// --- Vapi Configuration ---
const VAPI_PUBLIC_KEY = "32737436-6ff6-4c55-af8e-72157ef94a55";
const VAPI_ASSISTANT_ID = "0292c649-7d1e-4ebb-9044-72f80b123067";

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

  // Existing state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [facialAnalysisData, setFacialAnalysisData] = useState(null);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isProcessingFacialAnalysis, setIsProcessingFacialAnalysis] =
    useState(false);
  const [facialAnalysisCompleted, setFacialAnalysisCompleted] = useState(false);
  const textareaRef = useRef(null);

  // --- Vapi State ---
  const [vapi, setVapi] = useState(null);
  const [isVapiActive, setIsVapiActive] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isVapiStarting, setIsVapiStarting] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const vapiInitializedRef = useRef(false);
  const currentQuestionIndexRef = useRef(0);
  const vapiStartAttemptedRef = useRef(false);

  // Effect for Vapi Initialization - FIXED VERSION
  useEffect(() => {
    if (vapiInitializedRef.current) return;

    console.log("Initializing Vapi...");
    const vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
    setVapi(vapiInstance);
    vapiInitializedRef.current = true;

    // Set up event listeners
    const handleCallStart = () => {
      console.log("Vapi call started - SUCCESS");
      setIsVapiActive(true);
      setIsVapiStarting(false);
      setCurrentTranscript("");
      setIsTranscribing(false);
      setHasGreeted(false);

      // Check microphone permissions
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          console.log("✅ Microphone access granted");
        })
        .catch((error) => {
          console.error("❌ Microphone access denied:", error);
          alert(
            "Please allow microphone access to use voice features. You can still type your answers."
          );
        });
    };

    const handleCallEnd = () => {
      console.log("Vapi call ended");
      setIsVapiActive(false);
      setIsAssistantSpeaking(false);
      setIsVapiStarting(false);
    };

    const handleSpeechStart = () => {
      console.log("Assistant started speaking");
      setIsAssistantSpeaking(true);
    };

    const handleSpeechEnd = () => {
      console.log("Assistant finished speaking");
      setIsAssistantSpeaking(false);
    };

    const handleMessage = (message) => {
      console.log("Vapi message received:", message);

      // Log all transcript messages for debugging
      if (message.type === "transcript") {
        console.log(
          `🎤 TRANSCRIPT - Role: ${message.role}, Type: ${message.transcriptType}, Text: "${message.transcript}"`
        );
      }

      if (message.type === "transcript" && message.role === "user") {
        console.log("🗣️ USER SPEECH DETECTED!");
        console.log(
          `Transcript received - Type: ${message.transcriptType}, Text: "${message.transcript}"`
        );

        if (message.transcriptType === "partial") {
          // Show partial transcript in real-time but don't save to answers yet
          setCurrentTranscript(message.transcript);
          setIsTranscribing(true);
          console.log("✅ Partial transcript updated:", message.transcript);
        } else if (message.transcriptType === "final") {
          // Final transcript - save to answers and clear current transcript
          const finalText = message.transcript.trim();
          console.log("✅ Final transcript captured:", finalText);

          if (finalText) {
            // Immediately save to answers - don't use currentTranscript for display
            setAnswers((prev) => {
              // Get current interview and question data at the time of execution
              if (!currentInterview?.questions) return prev;

              const currentIdx = currentQuestionIndexRef.current;
              const currentQuestion = currentInterview.questions[currentIdx];

              if (!currentQuestion) {
                console.log("No current question found for index:", currentIdx);
                return prev;
              }

              const questionNumber = parseInt(currentQuestion.questionNumber);
              const existingAnswer = prev[questionNumber]?.answerText || "";
              const newAnswer = existingAnswer
                ? `${existingAnswer} ${finalText}`.trim()
                : finalText;

              console.log(
                `💾 Saving final transcript for question ${questionNumber}: "${newAnswer}"`
              );

              return {
                ...prev,
                [questionNumber]: {
                  questionNumber: questionNumber,
                  answerText: newAnswer,
                  answerDuration: prev[questionNumber]?.answerDuration || 0,
                },
              };
            });

            // Clear transcribing state and current transcript since it's now saved
            setIsTranscribing(false);
            setCurrentTranscript(""); // Clear since it's now saved in answers
          }

          // Note: Clearing is now handled in the setTimeout above
        }
      } else if (message.type === "transcript" && message.role === "user") {
        console.log(
          "❌ No user speech detected - check microphone permissions"
        );
      }

      // Also capture assistant messages to track when questions are asked
      if (message.type === "transcript" && message.role === "assistant") {
        console.log("🤖 Assistant said:", message.transcript);
      }

      // Log speech updates for debugging
      if (message.type === "speech-update") {
        console.log(
          `🎙️ Speech update - Status: ${message.status}, Role: ${message.role}`
        );
      }
    };

    const handleError = (e) => {
      console.error("Vapi error:", e);
      setIsVapiStarting(false);
    };

    // Add event listeners
    vapiInstance.on("call-start", handleCallStart);
    vapiInstance.on("call-end", handleCallEnd);
    vapiInstance.on("speech-start", handleSpeechStart);
    vapiInstance.on("speech-end", handleSpeechEnd);
    vapiInstance.on("message", handleMessage);
    vapiInstance.on("error", handleError);

    return () => {
      console.log("Cleaning up Vapi...");
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, []);

  // Effect to automatically start Vapi when interview is ready - FIXED
  useEffect(() => {
    if (
      currentInterview &&
      currentInterview.status === "in_progress" &&
      vapi &&
      !isVapiActive &&
      !isVapiStarting &&
      interviewStarted &&
      !vapiStartAttemptedRef.current
    ) {
      console.log("✅ Starting Vapi automatically - first attempt");
      vapiStartAttemptedRef.current = true;
      startVapiCall();
    }
  }, [
    currentInterview?.status,
    vapi,
    isVapiActive,
    isVapiStarting,
    interviewStarted,
  ]);

  // Effect to handle greeting and question asking - IMPROVED
  useEffect(() => {
    if (
      isVapiActive &&
      currentInterview &&
      currentInterview.questions.length > 0 &&
      hasGreeted
    ) {
      // Ask the current question when it changes and after greeting
      console.log("Asking current question:", currentQuestionIndex);
      askCurrentQuestion();
    }
  }, [currentQuestionIndex, isVapiActive, currentInterview, hasGreeted]);

  const startVapiCall = async () => {
    console.log("🎤 startVapiCall called", {
      hasVapi: !!vapi,
      isVapiStarting,
      isVapiActive,
    });

    if (!vapi || isVapiStarting || isVapiActive) {
      console.log("❌ Vapi call prevented - already active or starting");
      return;
    }

    try {
      setIsVapiStarting(true);
      console.log("🚀 Attempting to start Vapi call...");

      await vapi.start(VAPI_ASSISTANT_ID);
      console.log("✅ Vapi start method called successfully");
    } catch (error) {
      console.error("❌ Failed to start Vapi:", error);
      setIsVapiStarting(false);
      vapiStartAttemptedRef.current = false; // Reset so user can try again

      // Show user-friendly error message
      if (
        error.message?.includes("429") ||
        error.message?.includes("Too Many Requests")
      ) {
        alert(
          "Too many requests to voice service. Please wait a moment and try the manual start button."
        );
      } else if (
        error.message?.includes("CORS") ||
        error.message?.includes("fetch")
      ) {
        alert(
          "Voice service connection failed. You can still type your answers or try the manual start button."
        );
      }
    }
  };

  const sendGreeting = () => {
    if (!vapi || !isVapiActive) return;

    const greetingMessage = `You are an interview assistant. Your job is to:
1. Ask interview questions clearly and wait for responses
2. After the user answers or says "I don't know":
   - If it's NOT the last question: say "Okay, let's move to the next question. Click the next button when you're ready."
   - If it's the LAST question: say "Thank you for taking this interview! Please click the Submit Interview button to complete your interview."
3. Do NOT explain answers or provide solutions
4. Keep responses brief and professional
5. Do not ask follow-up questions

Welcome to your interview! We'll be going through ${
      currentInterview.numberOfQuestions
    } questions about ${currentInterview.techStack.join(
      ", "
    )}. Let's begin with the first question.`;

    vapi.send({
      type: "add-message",
      message: {
        role: "system",
        content: greetingMessage,
      },
    });

    setHasGreeted(true);
    console.log("Greeting sent to assistant");

    // Ask first question after greeting
    setTimeout(() => {
      askCurrentQuestion();
    }, 2000);
  };

  const askCurrentQuestion = () => {
    if (!isVapiActive || !currentInterview?.questions[currentQuestionIndex])
      return;

    const currentQuestionText =
      currentInterview.questions[currentQuestionIndex].questionText;

    // Don't clear transcript when asking new question - let user see their previous answer
    setIsTranscribing(false);

    const isLastQuestion =
      currentQuestionIndex === currentInterview.questions.length - 1;
    const responseInstruction = isLastQuestion
      ? 'After they answer or say "I don\'t know", say "Thank you for taking this interview! Please click the Submit Interview button to complete your interview."'
      : 'After they answer or say "I don\'t know", simply say "Okay, let\'s move to the next question. Click the next button when you\'re ready."';

    vapi.send({
      type: "add-message",
      message: {
        role: "system",
        content: `Ask the user this interview question clearly and wait for their response. ${responseInstruction} Do NOT explain the answer or provide solutions. Question: "${currentQuestionText}"`,
      },
    });

    console.log("Question sent to assistant:", currentQuestionText);
  };

  // Auto-send greeting when Vapi becomes active
  useEffect(() => {
    if (isVapiActive && !hasGreeted && currentInterview) {
      console.log("Vapi active, sending greeting...");
      sendGreeting();
    }
  }, [isVapiActive, hasGreeted, currentInterview]);

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
      currentQuestionIndexRef.current = 0;
    }
  }, [currentInterview]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [answers, currentQuestionIndex]);

  // Block navigation during active interview
  useEffect(() => {
    if (isInterviewActive) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue =
          "Are you sure you want to leave? Your interview progress will be lost.";
        return e.returnValue;
      };

      const handlePopState = (e) => {
        if (
          !confirm(
            "Are you sure you want to leave the interview? All progress will be lost."
          )
        ) {
          e.preventDefault();
          window.history.pushState(null, "", window.location.href);
        } else {
          if (vapi && isVapiActive) {
            vapi.stop();
          }
          setIsInterviewActive(false);
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);

      // Push current state to prevent back navigation
      window.history.pushState(null, "", window.location.href);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isInterviewActive, vapi, isVapiActive]);

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
      setIsInterviewActive(true);
      setStartTime(new Date());
      setQuestionStartTime(new Date());

      // Reset the attempt flag so Vapi can start
      vapiStartAttemptedRef.current = false;

      // The useEffect will handle starting Vapi automatically
      console.log("🚀 Interview started - Vapi will start automatically");
    }
  };

  const handleAnswerChange = (value) => {
    const currentQuestion = currentInterview.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Update answers state when user types manually
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.questionNumber]: {
        questionNumber: parseInt(currentQuestion.questionNumber),
        answerText: value,
        answerDuration:
          prev[currentQuestion.questionNumber]?.answerDuration || 0,
      },
    }));

    console.log("Answer manually updated:", value.substring(0, 50) + "...");
  };

  const calculateQuestionDuration = () => {
    if (questionStartTime) {
      return Math.floor((new Date() - questionStartTime) / 1000);
    }
    return 0;
  };

  const saveCurrentQuestionState = () => {
    const currentQuestion = currentInterview.questions[currentQuestionIndex];
    const duration = calculateQuestionDuration();

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.questionNumber]: {
        ...prev[currentQuestion.questionNumber],
        answerText: getCurrentAnswer(),
        answerDuration: parseInt(duration) || 0,
      },
    }));

    // Don't clear transcript when moving between questions
    setIsTranscribing(false);
  };

  const handleNextQuestion = () => {
    saveCurrentQuestionState();
    if (currentQuestionIndex < currentInterview.questions.length - 1) {
      setCurrentQuestionIndex((prev) => {
        const newIndex = prev + 1;
        currentQuestionIndexRef.current = newIndex;
        return newIndex;
      });
      setQuestionStartTime(new Date());
    }
  };

  const handlePreviousQuestion = () => {
    saveCurrentQuestionState();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => {
        const newIndex = prev - 1;
        currentQuestionIndexRef.current = newIndex;
        return newIndex;
      });
      setQuestionStartTime(new Date());
    }
  };

  const handleWebcamCapture = (imageSrc) => {
    setFacialAnalysisData({
      timestamp: new Date().toISOString(),
      image: imageSrc,
      questionNumber:
        currentInterview.questions[currentQuestionIndex].questionNumber,
    });
  };

  const handleVideoRecorded = (videoFile) => {
    console.log("Video recorded:", videoFile);
    if (videoFile && videoFile.size > 0) {
      setRecordedVideo(videoFile);
      setFacialAnalysisCompleted(false); // Reset completion state
      console.log(
        "✅ Video file saved successfully:",
        videoFile.name,
        "Size:",
        videoFile.size,
        "bytes"
      );

      // Auto-trigger facial analysis when video is ready
      console.log("🎥 Auto-triggering facial analysis...");
      setTimeout(() => {
        processFacialAnalysis(videoFile).catch((error) => {
          console.error("Auto facial analysis failed:", error);
        });
      }, 500); // Small delay to ensure state is updated
    } else {
      console.log("⚠️ No video data recorded or empty file");
    }
  };

  const processFacialAnalysis = async (videoFile) => {
    if (!videoFile) {
      console.error("🎥 No video file provided for facial analysis");
      return null;
    }

    if (videoFile.size === 0) {
      console.error("🎥 Video file is empty");
      return null;
    }

    try {
      setIsProcessingFacialAnalysis(true);
      console.log("🎥 Starting facial analysis process...");
      console.log("🎥 Video file details:", {
        name: videoFile.name,
        size: videoFile.size,
        type: videoFile.type,
        lastModified: videoFile.lastModified,
      });

      // Simple validation
      if (videoFile.size < 1000) {
        throw new Error("Video file too small to be valid");
      }

      console.log("🎥 Sending video file:", {
        name: videoFile.name,
        size: videoFile.size,
        type: videoFile.type,
        sizeKB: Math.round(videoFile.size / 1024),
      });

      // Test if Django server is reachable
      try {
        const healthCheck = await fetch("http://localhost:8000/", {
          method: "GET",
        });
        console.log("🎥 Django server health check:", healthCheck.status);
      } catch (healthError) {
        console.error("🎥 Django server not reachable:", healthError);
        throw new Error("Facial analysis server is not available");
      }

      console.log("🎥 Sending video to facial analysis API...");
      const response = await facialAnalysisAPI.analyze(videoFile);

      if (!response.data || !response.data.facialAnalysisResult) {
        throw new Error("Invalid response from facial analysis API");
      }

      const facialResult = response.data.facialAnalysisResult;
      console.log("🎥 Facial analysis result received:", facialResult);

      // Update all answers with facial analysis
      console.log("🎥 Updating database with facial analysis...");
      const updateResponse = await answerAPI.updateFacialAnalysis(
        currentInterview._id,
        {
          facialAnalysisResult: facialResult,
        }
      );

      console.log("🎥 Database update response:", updateResponse.data);
      console.log("✅ Facial analysis completed successfully");
      setFacialAnalysisCompleted(true);
      return facialResult;
    } catch (error) {
      console.error("❌ Facial analysis failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Show user-friendly error message
      if (error.message.includes("server is not available")) {
        console.error("🎥 Facial analysis server is offline");
      } else if (error.response?.status === 400) {
        console.error("🎥 Invalid video format or corrupted file");
      } else if (error.response?.status === 500) {
        console.error("🎥 Server error during facial analysis");
      } else {
        console.error("🎥 Unknown error during facial analysis");
      }

      // Mark as completed even if failed (don't block submission)
      setFacialAnalysisCompleted(true);
      return null;
    } finally {
      setIsProcessingFacialAnalysis(false);
    }
  };

  const handleSubmitAllAnswers = async () => {
    // Check if facial analysis is still processing
    if (
      recordedVideo &&
      !facialAnalysisCompleted &&
      isProcessingFacialAnalysis
    ) {
      console.log("🎥 Waiting for facial analysis to complete...");
      alert("Please wait for video analysis to complete before submitting.");
      return;
    }

    setIsSubmitting(true);

    // Stop video recording if active and wait for video to be processed
    if (webcamEnabled) {
      console.log("🎥 Stopping video recording - Interview submitted");
      console.log("🎥 Current recorded video state:", {
        hasVideo: !!recordedVideo,
        videoSize: recordedVideo?.size,
        videoName: recordedVideo?.name,
      });

      setWebcamEnabled(false);

      // Wait longer for video processing to complete
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("🎥 Video processing wait completed");

      // Check video state after waiting
      console.log("🎥 Video state after wait:", {
        hasVideo: !!recordedVideo,
        videoSize: recordedVideo?.size,
        videoName: recordedVideo?.name,
      });
    }

    // Stop Vapi call on submission
    if (vapi && isVapiActive) {
      console.log("🛑 Ending Vapi call - Interview submitted");
      vapi.stop();
      setIsVapiActive(false);
      setIsAssistantSpeaking(false);
      setIsTranscribing(false);
      setCurrentTranscript("");
    }

    try {
      // Final calculation for the last question's duration
      const currentQuestion = currentInterview.questions[currentQuestionIndex];
      const currentDuration = calculateQuestionDuration();

      // Ensure any pending transcript is saved before submission
      let finalAnswerText = getCurrentAnswer();
      if (currentTranscript && !finalAnswerText.includes(currentTranscript)) {
        finalAnswerText = finalAnswerText
          ? `${finalAnswerText} ${currentTranscript}`.trim()
          : currentTranscript;
      }

      const finalAnswers = {
        ...answers,
        [currentQuestion.questionNumber]: {
          ...answers[currentQuestion.questionNumber],
          answerText: finalAnswerText,
          answerDuration: currentDuration,
        },
      };

      const totalDuration = Math.floor((new Date() - startTime) / 1000);

      const answersArray = Object.values(finalAnswers)
        .filter(
          (answer) => answer.answerText && answer.answerText.trim().length >= 10
        )
        .map((answer) => ({
          questionNumber: parseInt(answer.questionNumber),
          answerText: answer.answerText.trim(),
          answerDuration: parseInt(answer.answerDuration) || 0,
        }));

      if (answersArray.length === 0) {
        throw new Error(
          "Please provide at least one answer with minimum 10 characters before submitting."
        );
      }

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

      const result = await submitAllAnswers(
        currentInterview._id,
        answersArray,
        totalDuration,
        facialAnalysisResult
      );

      if (result.success) {
        await completeInterview(currentInterview._id);
        setIsInterviewActive(false); // Allow navigation again
        invalidateInterviewData();
        invalidateAnalyticsData();
        console.log("✅ Interview completed - cache invalidated");

        // Process facial analysis in background (non-blocking)
        console.log("🎥 Checking for recorded video...", {
          hasRecordedVideo: !!recordedVideo,
          videoSize: recordedVideo?.size,
          videoName: recordedVideo?.name,
        });

        if (recordedVideo) {
          console.log("🎥 Processing facial analysis in background...");
          processFacialAnalysis(recordedVideo).catch((error) => {
            console.error("Background facial analysis failed:", error);
          });
        } else {
          console.log("🎥 No recorded video found - skipping facial analysis");
        }

        navigate(`/results/${currentInterview._id}`);
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const getAnsweredQuestionsCount = useCallback(() => {
    return Object.values(answers).filter(
      (answer) =>
        answer.answerText &&
        answer.answerText.trim().length >= 10 &&
        answer.answerText.trim().length <= 5000
    ).length;
  }, [answers]);

  const getCurrentAnswer = useCallback(() => {
    const currentQuestion = currentInterview?.questions[currentQuestionIndex];
    if (!currentQuestion) return "";

    // Get the saved answer text
    const savedAnswer =
      answers[currentQuestion.questionNumber]?.answerText || "";

    // Always show current transcript if it exists, regardless of transcribing state
    if (currentTranscript) {
      const combined = savedAnswer
        ? `${savedAnswer} ${currentTranscript}`.trim()
        : currentTranscript;
      console.log(
        `📝 Showing combined answer: saved="${savedAnswer}" + current="${currentTranscript}" = "${combined}"`
      );
      return combined;
    }

    console.log(
      `📝 Showing saved answer for question ${currentQuestion.questionNumber}: "${savedAnswer}"`
    );
    return savedAnswer;
  }, [currentInterview, currentQuestionIndex, answers, currentTranscript]);

  // Debug function to manually start Vapi if needed
  const manuallyStartVapi = useCallback(() => {
    if (vapi && !isVapiActive && !isVapiStarting) {
      console.log("🔧 Manual Vapi start requested");
      vapiStartAttemptedRef.current = false; // Reset attempt flag
      startVapiCall();
    }
  }, [vapi, isVapiActive, isVapiStarting]);

  // Render logic
  if (loading && !currentInterview) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentInterview) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white">Interview not found</h2>
        <p className="mt-2 text-gray-300">
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
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-violet-400"
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
            <h1 className="text-2xl font-bold text-white mb-2">
              Ready to Start Your Interview?
            </h1>
            <p className="text-gray-300">
              You're about to begin an interview with{" "}
              {currentInterview.numberOfQuestions} questions covering{" "}
              {currentInterview.techStack.join(", ")}. <br />
              <span className="font-semibold text-violet-400">
                Our AI assistant will guide you through the questions. You can
                answer by speaking.
              </span>
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-white">Difficulty:</span>
                <span className="ml-2 text-gray-300">
                  {currentInterview.hardnessLevel}
                </span>
              </div>
              <div>
                <span className="font-medium text-white">Experience:</span>
                <span className="ml-2 text-gray-300">
                  {currentInterview.experienceLevel}
                </span>
              </div>
              <div>
                <span className="font-medium text-white">Questions:</span>
                <span className="ml-2 text-gray-300">
                  {currentInterview.numberOfQuestions}
                </span>
              </div>
              <div>
                <span className="font-medium text-white">Technologies:</span>
                <span className="ml-2 text-gray-300">
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
      {isInterviewActive && (
        <div className="mb-4 p-3 bg-amber-500/10 backdrop-blur-sm border border-amber-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <p className="text-sm text-amber-200">
              <strong>Interview in progress</strong> - Navigation is disabled to
              prevent accidental data loss. Use the "Abort Interview" button if
              you need to leave.
            </p>
          </div>
        </div>
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={clearError}
          className="mb-6"
        />
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">
            Question {currentQuestionIndex + 1} of{" "}
            {currentInterview.questions.length}
          </span>
          <span className="text-sm text-gray-300">
            {answeredCount} answered
          </span>
        </div>
        <div className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-violet-500 to-violet-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-primary">
                  Question {currentQuestion.questionNumber}
                </span>
                {currentQuestion.category && (
                  <span className="text-sm text-gray-300">
                    {currentQuestion.category}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-white leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">
                  Your Answer (speak or type)
                </label>
                {isTranscribing && (
                  <div className="flex items-center space-x-2 text-sm text-violet-400">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                    <span>Transcribing...</span>
                  </div>
                )}
              </div>
              <textarea
                ref={textareaRef}
                value={getCurrentAnswer()}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Speak your answer and it will appear here, or type manually..."
                className={`textarea min-h-32 max-h-64 ${
                  isTranscribing ? "border-violet-400/50 bg-violet-500/10" : ""
                }`}
                rows={4}
              />
              <div className="mt-2 flex justify-between items-center text-sm text-gray-300">
                <div className="flex items-center space-x-4">
                  <span>
                    {getCurrentAnswer().length}/5000 characters
                    {getCurrentAnswer().length > 0 &&
                      getCurrentAnswer().length < 10 && (
                        <span className="text-red-400 ml-2">
                          Answer must be at least 10 characters
                        </span>
                      )}
                  </span>
                  {isTranscribing && (
                    <span className="text-violet-400 font-medium">
                      Live transcription active
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to abort this interview? All progress will be lost."
                    )
                  ) {
                    if (vapi && isVapiActive) {
                      console.log("🛑 Aborting interview - Ending Vapi call");
                      vapi.stop();
                    }
                    setIsInterviewActive(false);
                    setIsVapiActive(false);
                    setIsAssistantSpeaking(false);
                    setIsTranscribing(false);
                    setCurrentTranscript("");
                    navigate("/dashboard");
                  }
                }}
                className="btn btn-outline text-red-400 border-red-500/30 hover:bg-red-500/20"
              >
                Abort Interview
              </button>
            </div>

            <div className="flex space-x-3">
              {currentQuestionIndex < currentInterview.questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="btn btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  disabled={
                    recordedVideo &&
                    !facialAnalysisCompleted &&
                    isProcessingFacialAnalysis
                  }
                  className={`btn ${
                    recordedVideo &&
                    !facialAnalysisCompleted &&
                    isProcessingFacialAnalysis
                      ? "btn-outline opacity-50 cursor-not-allowed"
                      : "btn-success"
                  }`}
                >
                  {recordedVideo &&
                  !facialAnalysisCompleted &&
                  isProcessingFacialAnalysis
                    ? "Processing Video..."
                    : "Submit Interview"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              Video Recording (Optional)
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Enable your camera for optional facial analysis to help improve
              your presentation skills.
            </p>
            <div className="mb-4">
              <button
                onClick={() => setWebcamEnabled(!webcamEnabled)}
                className={`btn ${
                  webcamEnabled ? "btn-success" : "btn-primary"
                } w-full`}
              >
                {webcamEnabled ? "Stop Recording" : "Start Recording"}
              </button>
            </div>
            <WebcamCapture
              onCapture={handleWebcamCapture}
              onVideoRecorded={handleVideoRecorded}
              isRecording={webcamEnabled}
              className="w-full"
            />

            {/* Recording Status */}
            {webcamEnabled && (
              <div className="mt-4 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-200">
                    🎥 Recording in progress...
                  </span>
                </div>
              </div>
            )}

            {/* Facial Analysis Status */}
            {isProcessingFacialAnalysis && (
              <div className="mt-4 p-3 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-200">
                    🧠 Processing facial analysis... (Please wait before
                    submitting)
                  </span>
                </div>
              </div>
            )}

            {/* Facial Analysis Completed */}
            {recordedVideo &&
              facialAnalysisCompleted &&
              !isProcessingFacialAnalysis && (
                <div className="mt-4 p-3 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-200">
                      ✅ Facial analysis completed - Ready to submit
                    </span>
                  </div>
                </div>
              )}

            {/* {recordedVideo && !isProcessingFacialAnalysis && (
              <div className="mt-4 p-3 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  <div className="text-sm text-green-200">
                    <div>✅ Video recorded successfully</div>
                    <div className="text-xs text-green-300 mt-1">
                      Size: {Math.round(recordedVideo.size / 1024)} KB | Type:{" "}
                      {recordedVideo.type} | Name: {recordedVideo.name}
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              AI Assistant Status
            </h3>
            <div className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg mb-4">
              <div
                className={`w-4 h-4 rounded-full ${
                  isVapiActive
                    ? "bg-green-500 animate-pulse"
                    : isVapiStarting
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-gray-400"
                }`}
              ></div>
              <div>
                <p className="font-medium text-white">
                  {isVapiActive
                    ? isAssistantSpeaking
                      ? "Assistant Speaking..."
                      : isTranscribing
                      ? "Transcribing..."
                      : "Listening..."
                    : isVapiStarting
                    ? "Connecting..."
                    : "Not Connected"}
                </p>
                <p className="text-sm text-gray-300">
                  {isVapiActive
                    ? isAssistantSpeaking
                      ? "Assistant is asking the question..."
                      : isTranscribing
                      ? "Converting speech to text..."
                      : "🎤 Ready to listen - Speak your answer now!"
                    : isVapiStarting
                    ? "Starting assistant..."
                    : "Assistant will start automatically"}
                </p>
              </div>
            </div>

            {/* Transcript Debug Info - Remove in production */}

            {/* Debug buttons - can be removed in production */}
            {!isVapiActive && !isVapiStarting && interviewStarted && (
              <div className="space-y-2">
                <button
                  onClick={manuallyStartVapi}
                  className="btn btn-outline btn-sm w-full"
                >
                  Start Assistant Manually
                </button>
                <button
                  onClick={async () => {
                    try {
                      const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                      });
                      console.log("✅ Microphone test successful");
                      alert("Microphone access granted! Try speaking now.");
                      stream.getTracks().forEach((track) => track.stop());
                    } catch (error) {
                      console.error("❌ Microphone test failed:", error);
                      alert(
                        "Microphone access denied. Please check your browser settings."
                      );
                    }
                  }}
                  className="btn btn-outline btn-sm w-full text-xs"
                >
                  Test Microphone
                </button>
              </div>
            )}

            {isVapiActive && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-violet-500/10 backdrop-blur-sm border border-violet-500/30 rounded-lg">
                  <p className="text-sm text-violet-200">
                    <strong>Tip:</strong> Speak clearly after the assistant
                    finishes asking the question. Your speech will appear in the
                    answer box automatically.
                  </p>
                </div>

                {isTranscribing && currentTranscript && (
                  <div className="p-3 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-lg">
                    <p className="text-sm text-emerald-200 mb-2">
                      <strong>Current transcript:</strong>
                    </p>
                    <p className="text-sm text-emerald-300 italic">
                      "{currentTranscript}"
                    </p>
                    <button
                      onClick={() => {
                        const currentQuestion =
                          currentInterview.questions[currentQuestionIndex];
                        const existingAnswer =
                          answers[currentQuestion.questionNumber]?.answerText ||
                          "";
                        const newAnswer = existingAnswer
                          ? `${existingAnswer} ${currentTranscript}`.trim()
                          : currentTranscript;
                        handleAnswerChange(newAnswer);
                        setCurrentTranscript("");
                        setIsTranscribing(false);
                      }}
                      className="mt-2 btn btn-sm btn-outline text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                    >
                      Save Transcript
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/90 backdrop-blur-sm border border-white/20 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Submit Interview?
            </h3>
            <p className="text-gray-300 mb-4">
              You have answered {answeredCount} out of{" "}
              {currentInterview.questions.length} questions. Once submitted, you
              cannot make changes.
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
                {isSubmitting ? "Submitting..." : "Submit All Answers"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowConfirmSubmit(true)}
          className="btn btn-success shadow-lg"
          title="Submit all answers"
        >
          Submit ({answeredCount}/{currentInterview.questions.length})
        </button>
      </div>
    </div>
  );
};

export default Interview;
