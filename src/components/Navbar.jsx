import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isInterviewPage = location.pathname.includes('/interview/') && !location.pathname.includes('/setup');

  const handleLogout = async () => {
    if (isInterviewPage) {
      if (!confirm("Are you sure you want to logout during an interview? All progress will be lost.")) {
        return;
      }
    } else {
      if (!confirm("Are you sure you want to log out?")) {
        return;
      }
    }
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="glass-effect border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg border border-primary-500/30">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-white">Prepwise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors ${
                isActive("/dashboard")
                  ? "text-primary-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/interview/setup"
              className={`text-sm font-medium transition-colors ${
                isActive("/interview/setup")
                  ? "text-primary-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              New Interview
            </Link>
            <Link
              to="/profile"
              className={`text-sm font-medium transition-colors ${
                isActive("/profile")
                  ? "text-primary-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Profile
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center border border-primary-500/30">
                  <span className="text-primary-300 font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="text-sm">
                <p className="font-medium text-white">{user?.name}</p>
                <p className="text-gray-300">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-outline text-sm">
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/dashboard"
                className={`text-sm font-medium ${
                  isActive("/dashboard") ? "text-primary-600" : "text-gray-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/interview/setup"
                className={`text-sm font-medium ${
                  isActive("/interview/setup")
                    ? "text-primary-600"
                    : "text-gray-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                New Interview
              </Link>
              <Link
                to="/profile"
                className={`text-sm font-medium ${
                  isActive("/profile") ? "text-primary-600" : "text-gray-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-gray-300">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline w-full text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
