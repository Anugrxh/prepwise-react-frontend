import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Mail, Send } from "lucide-react";
import { authAPI } from "../services/api.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || "";

  const [step, setStep] = useState(emailFromState ? 2 : 1); // Step 1: Enter email, Step 2: Enter OTP & Password
  const [formData, setFormData] = useState({
    email: emailFromState,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!emailFromState && step === 2) {
      navigate("/forgot-password");
    }
  }, [emailFromState, step, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const response = await authAPI.forgotPassword({ email: formData.email });
      
      if (response.data.success) {
        setAlert({
          type: "success",
          message: "OTP sent successfully! Check your email.",
        });
        setStep(2);
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to send OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setAlert(null);

    try {
      const response = await authAPI.forgotPassword({ email: formData.email });
      
      if (response.data.success) {
        setAlert({
          type: "success",
          message: "OTP resent successfully! Check your email.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to resend OTP.",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setAlert({
        type: "error",
        message: "Passwords do not match!",
      });
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      setAlert({
        type: "error",
        message: "Password must be at least 6 characters long!",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      
      if (response.data.success) {
        setAlert({
          type: "success",
          message: "Password reset successfully! Redirecting to login...",
        });
        
        // Navigate to login page after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 aurora-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="liquid-glass p-8 space-y-8 animate-float"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-glow border border-primary-500/30"
            >
              <Lock className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Reset Password
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-300"
            >
              {step === 1 
                ? "Enter your email to receive a verification code"
                : "Enter the OTP and your new password"}
            </motion.p>
          </div>

          {/* Alert */}
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
              onSubmit={handleSendOTP}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input pl-10 h-12 text-base"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 px-4 font-semibold text-base flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send OTP</span>
                  </>
                )}
              </motion.button>

              <div className="text-center pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to login</span>
                </Link>
              </div>
            </motion.form>
          )}

          {/* Step 2: Enter OTP and New Password */}
          {step === 2 && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="space-y-5">
                {/* Email Display */}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <p className="text-sm text-gray-400">Sending OTP to:</p>
                  <p className="text-white font-medium">{formData.email}</p>
                </div>

                {/* OTP Field */}
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-semibold text-white mb-2"
                  >
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength="6"
                    className="input h-12 text-base text-center tracking-widest text-2xl font-bold"
                    placeholder="000000"
                    value={formData.otp}
                    onChange={handleChange}
                  />
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendLoading}
                      className="text-sm text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50"
                    >
                      {resendLoading ? "Resending..." : "Resend OTP"}
                    </button>
                  </div>
                </div>

                {/* New Password Field */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-semibold text-white mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      className="input pl-10 pr-12 h-12 text-base"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-white mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="input pl-10 pr-12 h-12 text-base"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 px-4 font-semibold text-base flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    <span>Reset Password</span>
                  </>
                )}
              </motion.button>

              {/* Back to login link */}
              <div className="text-center pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to login</span>
                </Link>
              </div>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
