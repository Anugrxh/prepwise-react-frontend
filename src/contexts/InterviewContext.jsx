import React, { createContext, useContext, useState } from "react";
import toast from 'react-hot-toast';
import { interviewAPI, answerAPI, resultsAPI } from "../services/api.jsx";

const InterviewContext = createContext();

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
};

export const InterviewProvider = ({ children }) => {
  const [currentInterview, setCurrentInterview] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateInterview = async (interviewData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await interviewAPI.generate(interviewData);
      const interview = response.data.data.interview;

      setCurrentInterview(interview);
      toast.success("Interview generated successfully!");
      return { success: true, interview };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to generate interview";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async (interviewId) => {
    try {
      setError(null);
      setLoading(true);

      const response = await interviewAPI.start(interviewId);
      const updatedInterview = response.data.data.interview;

      setCurrentInterview(updatedInterview);
      toast.success("Interview started! Good luck!");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to start interview";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const submitAllAnswers = async (
    interviewId,
    answersData,
    totalDuration = 0,
    facialAnalysisResult = null
  ) => {
    try {
      setError(null);
      setLoading(true);

      const payload = {
        interviewId,
        answers: answersData,
        totalInterviewDuration: totalDuration,
      };

      // Add facial analysis if provided
      if (facialAnalysisResult) {
        payload.facialAnalysisResult = facialAnalysisResult;
      }

      const response = await answerAPI.submitAll(payload);
      const submittedAnswers = response.data.data.answers;

      setAnswers(submittedAnswers);

      // Update interview status to indicate answers are submitted
      setInterviews(prev => prev.map(interview => 
        interview._id === interviewId 
          ? { ...interview, status: "answers_submitted" }
          : interview
      ));

      toast.success("All answers submitted successfully!");
      return {
        success: true,
        answers: submittedAnswers,
        summary: response.data.data.summary,
      };
    } catch (error) {
      console.error("Submit answers error:", error.response?.data);
      let errorMessage = "Failed to submit answers";

      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        // Handle validation errors
        errorMessage = error.response.data.errors
          .map((err) => err.msg)
          .join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const completeInterview = async (interviewId) => {
    try {
      setError(null);
      setLoading(true);

      const response = await interviewAPI.complete(interviewId);
      const updatedInterview = response.data?.data?.interview;

      // Update current interview status
      if (currentInterview && currentInterview._id === interviewId) {
        setCurrentInterview((prev) => ({ 
          ...prev, 
          status: "completed",
          completedAt: updatedInterview?.completedAt || new Date().toISOString()
        }));
      }

      // Update interviews list
      setInterviews(prev => prev.map(interview => 
        interview._id === interviewId 
          ? { 
              ...interview, 
              status: "completed",
              completedAt: updatedInterview?.completedAt || new Date().toISOString()
            }
          : interview
      ));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to complete interview";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const generateResults = async (interviewId) => {
    try {
      setError(null);
      setLoading(true);

      const response = await resultsAPI.generate(interviewId);
      const result = response.data.data.result;

      setResults(result);

      // Update interview with average score if available
      if (result.averageScore !== undefined) {
        setInterviews(prev => prev.map(interview => 
          interview._id === interviewId 
            ? { ...interview, averageScore: result.averageScore }
            : interview
        ));

        if (currentInterview && currentInterview._id === interviewId) {
          setCurrentInterview(prev => ({ 
            ...prev, 
            averageScore: result.averageScore 
          }));
        }
      }

      toast.success("Results generated successfully!");
      return { success: true, result };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to generate results";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getInterviewById = async (interviewId) => {
    try {
      setError(null);
      setLoading(true);

      const response = await interviewAPI.getById(interviewId);
      const interview = response.data.data.interview;

      setCurrentInterview(interview);
      return { success: true, interview };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch interview";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getResultsByInterview = async (interviewId) => {
    try {
      setError(null);
      setLoading(true);

      const response = await resultsAPI.getByInterview(interviewId);
      const result = response.data.data.result;

      setResults(result);
      return { success: true, result };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch results";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getAllInterviews = async (params = {}) => {
    try {
      setError(null);
      setLoading(true);

      const response = await interviewAPI.getAll(params);
      const responseData = response.data.data;
      const interviewsData = responseData.interviews || responseData;
      const pagination = responseData.pagination || null;

      setInterviews(interviewsData);
      return { 
        success: true, 
        interviews: interviewsData,
        pagination: pagination
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch interviews";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const deleteInterview = async (interviewId) => {
    try {
      setError(null);
      setLoading(true);

      await interviewAPI.delete(interviewId);
      
      // Remove from local state
      setInterviews(prev => prev.filter(interview => interview._id !== interviewId));
      
      // Clear current interview if it's the one being deleted
      if (currentInterview && currentInterview._id === interviewId) {
        setCurrentInterview(null);
      }

      toast.success("Interview deleted successfully");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete interview";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const submitSingleAnswer = async (answerData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await answerAPI.submit(answerData);
      const answer = response.data.data.answer;

      // Update answers array
      setAnswers(prev => {
        const existing = prev.findIndex(a => a.questionNumber === answer.questionNumber);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = answer;
          return updated;
        }
        return [...prev, answer];
      });

      toast.success("Answer submitted successfully!");
      return { success: true, answer };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to submit answer";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getAnswersByInterview = async (interviewId) => {
    try {
      setError(null);
      setLoading(true);

      const response = await answerAPI.getByInterview(interviewId);
      const answersData = response.data.data.answers;

      setAnswers(answersData);
      return { success: true, answers: answersData };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch answers";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getInterviewStats = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await interviewAPI.getStats();
      const stats = response.data.data;

      return { success: true, stats };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch interview stats";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setCurrentInterview(null);
    setAnswers([]);
    setResults(null);
    setError(null);
  };

  const refreshInterviews = async () => {
    try {
      const response = await interviewAPI.getAll({ sort: "-createdAt" });
      const responseData = response.data.data;
      const interviewsData = responseData.interviews || responseData;
      setInterviews(interviewsData);
      return { success: true, interviews: interviewsData };
    } catch (error) {
      console.error('Failed to refresh interviews:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentInterview,
    interviews,
    answers,
    results,
    loading,
    error,
    generateInterview,
    startInterview,
    submitAllAnswers,
    submitSingleAnswer,
    completeInterview,
    generateResults,
    getInterviewById,
    getResultsByInterview,
    getAllInterviews,
    getAnswersByInterview,
    getInterviewStats,
    deleteInterview,
    clearError,
    resetInterview,
    refreshInterviews,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
