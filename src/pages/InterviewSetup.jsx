import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInterview } from "../contexts/InterviewContext.jsx";
import { useData } from "../contexts/DataContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";

const InterviewSetup = () => {
  const [formData, setFormData] = useState({
    techStack: [],
    hardnessLevel: "Medium",
    experienceLevel: "Mid",
    numberOfQuestions: 5,
  });
  const [customTech, setCustomTech] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const { generateInterview, loading, error, clearError } = useInterview();
  const { invalidateInterviewData } = useData();
  const navigate = useNavigate();

  const techStackOptions = [
    "JavaScript",
    "TypeScript",
    "React",
    "Vue.js",
    "Angular",
    "Node.js",
    "Python",
    "Java",
    "C#",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "Swift",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Git",
    "GraphQL",
    "REST API",
    "Microservices",
  ];

  const hardnessLevels = ["Easy", "Medium", "Hard"];
  const experienceLevels = ["Junior", "Mid", "Senior", "Lead"];

  const validateForm = () => {
    const errors = {};

    if (formData.techStack.length === 0) {
      errors.techStack = "Please select at least one technology";
    }

    if (formData.numberOfQuestions < 3 || formData.numberOfQuestions > 10) {
      errors.numberOfQuestions = "Number of questions must be between 3 and 10";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTechStackChange = (tech) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech],
    }));

    if (validationErrors.techStack) {
      setValidationErrors((prev) => ({ ...prev, techStack: "" }));
    }
  };

  const handleAddCustomTech = () => {
    if (customTech.trim() && !formData.techStack.includes(customTech.trim())) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, customTech.trim()],
      }));
      setCustomTech("");
    }
  };

  const handleRemoveTech = (tech) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tech),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfQuestions" ? parseInt(value) : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await generateInterview(formData);
    if (result.success) {
      // Invalidate cache to ensure fresh data is loaded
      invalidateInterviewData();
      navigate(`/interview/${result.interview._id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Setup Your Interview</h1>
        <p className="mt-2 text-gray-300">
          Customize your interview experience by selecting technologies and
          difficulty level.
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={clearError}
          className="mb-6"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tech Stack Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">
            Technology Stack
          </h2>
          <p className="text-sm text-gray-300 mb-4">
            Select the technologies you want to be interviewed on:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
            {techStackOptions.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => handleTechStackChange(tech)}
                className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                  formData.techStack.includes(tech)
                    ? "bg-primary-500/20 border-primary-500/30 text-primary-300"
                    : "bg-white/5 border-white/20 text-white hover:bg-white/10"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>

          {/* Custom Tech Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add custom technology..."
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddCustomTech())
              }
              className="input flex-1"
            />
            <button
              type="button"
              onClick={handleAddCustomTech}
              className="btn btn-outline"
            >
              Add
            </button>
          </div>

          {/* Selected Technologies */}
          {formData.techStack.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-white mb-2">
                Selected Technologies:
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-500/20 text-primary-300 border border-primary-500/30"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="ml-2 text-primary-300 hover:text-primary-200"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {validationErrors.techStack && (
            <p className="mt-2 text-sm text-danger-600">
              {validationErrors.techStack}
            </p>
          )}
        </div>

        {/* Interview Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">
            Interview Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hardness Level */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Difficulty Level
              </label>
              <select
                name="hardnessLevel"
                value={formData.hardnessLevel}
                onChange={handleChange}
                className="input"
              >
                {hardnessLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="input"
              >
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Questions */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                name="numberOfQuestions"
                min="3"
                max="20"
                value={formData.numberOfQuestions}
                onChange={handleChange}
                className={`input ${
                  validationErrors.numberOfQuestions
                    ? "border-danger-300 focus:border-danger-500 focus:ring-danger-500"
                    : ""
                }`}
              />
              <p className="mt-1 text-sm text-gray-300">
                Choose between 3 and 20 questions for your interview.
              </p>
              {validationErrors.numberOfQuestions && (
                <p className="mt-1 text-sm text-danger-600">
                  {validationErrors.numberOfQuestions}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Generating Interview...
              </div>
            ) : (
              "Generate Interview"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InterviewSetup;
