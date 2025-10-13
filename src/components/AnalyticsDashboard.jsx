import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Award, Clock, Users } from 'lucide-react';
import Card from './Card';
import ProgressBar from './ProgressBar';
import Badge from './Badge';

const AnalyticsDashboard = ({ analytics }) => {
  const {
    totalInterviews = 0,
    completedInterviews = 0,
    averageScore = 0,
    bestScore = 0,
    improvementTrend = 0,
    passRate = 0,
    categoryTrends = {},
    gradeDistribution = {},
    performanceData = [],
    insights = {}
  } = analytics || {};

  const StatCard = ({ title, value, icon: Icon, trend, color = 'primary', delay = 0 }) => (
    <Card animate delay={delay} className="text-center glass-card">
      <div className={`w-12 h-12 bg-${color}-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-${color}-500/30`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-300 mb-2">{title}</div>
      {trend !== undefined && (
        <div className={`flex items-center justify-center text-xs ${
          trend >= 0 ? 'text-success-400' : 'text-danger-400'
        }`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {Math.abs(trend)}% from last month
        </div>
      )}
    </Card>
  );

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Interviews"
          value={totalInterviews}
          icon={Users}
          color="primary"
          delay={0}
        />
        <StatCard
          title="Completed"
          value={completedInterviews}
          icon={Target}
          trend={improvementTrend}
          color="success"
          delay={0.1}
        />
        <StatCard
          title="Average Score"
          value={`${averageScore}%`}
          icon={Award}
          trend={improvementTrend}
          color={getScoreColor(averageScore)}
          delay={0.2}
        />
        <StatCard
          title="Best Score"
          value={`${bestScore}%`}
          icon={TrendingUp}
          color={getScoreColor(bestScore)}
          delay={0.3}
        />
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card animate delay={0.4}>
          <h3 className="text-lg font-semibold text-white mb-6">Category Performance</h3>
          {Object.keys(categoryTrends).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(categoryTrends).map(([category, data], index) => {
                // Handle both API format and fallback format
                const categoryData = typeof data === 'object' && data !== null ? data : { average: data || 0 };
                const average = categoryData.average || 0;
                const trend = categoryData.trend;
                
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-white">
                        {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getScoreColor(average)} size="sm">
                          {average}%
                        </Badge>
                        {trend !== undefined && (
                          <div className={`flex items-center text-xs ${
                            trend >= 0 ? 'text-success-600' : 'text-danger-600'
                          }`}>
                            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span className="ml-1">{Math.abs(trend)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ProgressBar
                      value={average}
                      variant={getScoreColor(average)}
                      size="md"
                      animate
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-300">No category data available yet.</p>
              <p className="text-xs text-gray-400 mt-1">Complete more interviews to see category performance.</p>
            </div>
          )}
        </Card>

        {/* Grade Distribution */}
        <Card animate delay={0.5}>
          <h3 className="text-lg font-semibold text-white-900 mb-6">Grade Distribution</h3>
          {Object.keys(gradeDistribution).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(gradeDistribution)
                .sort(([a], [b]) => {
                  // Sort grades in logical order
                  const gradeOrder = { 'A+': 0, 'A': 1, 'B+': 2, 'B': 3, 'C+': 4, 'C': 5, 'D': 6, 'F': 7 };
                  return (gradeOrder[a] || 99) - (gradeOrder[b] || 99);
                })
                .map(([grade, count]) => {
                  const total = Object.values(gradeDistribution).reduce((sum, c) => sum + c, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  // Determine grade score for color coding
                  const gradeScore = grade.startsWith('A') ? 90 : 
                                   grade.startsWith('B') ? 75 : 
                                   grade.startsWith('C') ? 60 : 40;
                  
                  return (
                    <div key={grade} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getScoreColor(gradeScore)}>
                          {grade}
                        </Badge>
                        <span className="text-sm text-gray-300">{count} interview{count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-white/20 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${
                              grade.startsWith('A') ? 'bg-success-500' :
                              grade.startsWith('B') ? 'bg-warning-500' : 
                              grade.startsWith('C') ? 'bg-orange-500' : 'bg-danger-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <span className="text-xs text-gray-300 w-8">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-300">No grade data available yet.</p>
              <p className="text-xs text-gray-400 mt-1">Complete more interviews to see grade distribution.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Performance Timeline */}
      {performanceData.length > 0 && (
        <Card animate delay={0.6}>
          <h3 className="text-lg font-semibold text-white mb-6">Performance Timeline</h3>
          <div className="space-y-4">
            {performanceData.slice(-10).map((data, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center border border-primary-500/30">
                    <span className="text-xs font-medium text-primary-300">
                      {data.interview}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      Interview #{data.interview}
                    </div>
                    <div className="text-xs text-gray-300">{data.date}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <ProgressBar
                    value={data.score}
                    variant={getScoreColor(data.score)}
                    size="sm"
                    className="w-24"
                    animate={false}
                  />
                  <Badge variant={getScoreColor(data.score)} size="sm">
                    {data.score}%
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights */}
      {insights && Object.keys(insights).length > 0 && (
        <Card animate delay={0.7}>
          <h3 className="text-lg font-semibold text-white mb-6">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.mostImprovedCategory && (
              <div className="text-center p-4 bg-success-500/20 rounded-lg backdrop-blur-sm border border-success-500/30">
                <TrendingUp className="w-8 h-8 text-success-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-success-300">Most Improved</div>
                <div className="text-xs text-success-400">{insights.mostImprovedCategory}</div>
              </div>
            )}
            
            {insights.strongestCategory && (
              <div className="text-center p-4 bg-primary-500/20 rounded-lg backdrop-blur-sm border border-primary-500/30">
                <Award className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-primary-300">Strongest Area</div>
                <div className="text-xs text-primary-400">{insights.strongestCategory}</div>
              </div>
            )}
            
            {insights.needsImprovement && insights.needsImprovement.length > 0 && (
              <div className="text-center p-4 bg-warning-500/20 rounded-lg backdrop-blur-sm border border-warning-500/30">
                <Target className="w-8 h-8 text-warning-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-warning-300">Focus Area</div>
                <div className="text-xs text-warning-400">{insights.needsImprovement[0]}</div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;