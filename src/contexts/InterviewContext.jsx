import React, { createContext, useContext, useState } from "react";
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
      return { success: true, interview };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to generate interview";
      setError(errorMessage);
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
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to start interview";
      setError(errorMessage);
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
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const completeInterview = async (interviewId) => {
    try {
      setError(null);
      setLoading(true);

      await interviewAPI.complete(interviewId);

      // Update current interview status
      if (currentInterview && currentInterview._id === interviewId) {
        setCurrentInterview((prev) => ({ ...prev, status: "completed" }));
      }

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
      return { success: true, result };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to generate results";
      setError(errorMessage);
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
      const interviewsData = response.data.data.interviews;

      setInterviews(interviewsData);
      return { success: true, interviews: interviewsData };
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

  const resetInterview = () => {
    setCurrentInterview(null);
    setAnswers([]);
    setResults(null);
    setError(null);
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
    completeInterview,
    generateResults,
    getInterviewById,
    getResultsByInterview,
    getAllInterviews,
    clearError,
    resetInterview,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
