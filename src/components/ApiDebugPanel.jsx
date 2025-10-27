import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, X, BarChart3, RefreshCw } from "lucide-react";
import { useData } from "../contexts/DataContext.jsx";
import Card from "./Card";
import Button from "./Button";

const ApiDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({});
  const { getDebugInfo } = useData();

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setStats(getDebugInfo());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, getDebugInfo]);

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        className="fixed bottom-4 right-4 z-50 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bug className="w-5 h-5" />
      </motion.button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-4 z-40 w-80"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gray-900 text-white border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary-400" />
                  <h3 className="text-lg font-semibold">API Debug Panel</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Global Loading State */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Global Loading:</span>
                  <span
                    className={`text-sm font-medium ${
                      stats.globalLoading ? "text-yellow-400" : "text-green-400"
                    }`}
                  >
                    {stats.globalLoading ? "Loading..." : "Idle"}
                  </span>
                </div>

                {/* API Call Statistics */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">
                    API Call Count:
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {Object.entries(stats.apiStats || {}).map(
                      ([endpoint, count]) => (
                        <div
                          key={endpoint}
                          className="flex items-center justify-between text-xs"
                        >
                          <span
                            className="text-gray-400 truncate flex-1 mr-2"
                            title={endpoint}
                          >
                            {endpoint.length > 30
                              ? `...${endpoint.slice(-30)}`
                              : endpoint}
                          </span>
                          <span
                            className={`font-medium ${
                              count > 5
                                ? "text-red-400"
                                : count > 2
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {count}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Cache Status */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">
                    Cache Status:
                  </h4>
                  <div className="text-xs text-gray-400">
                    Check browser console for cache hit/miss logs
                  </div>
                </div>

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStats(getDebugInfo())}
                  className="w-full text-white border-gray-600 hover:bg-gray-800"
                  icon={RefreshCw}
                >
                  Refresh Stats
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ApiDebugPanel;
