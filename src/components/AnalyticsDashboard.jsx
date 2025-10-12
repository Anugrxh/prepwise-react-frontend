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
    <Card animate delay={delay} className="text-center">
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      {trend !== undefined && (
        <div className={`flex items-center justify-center text-xs ${
          trend >= 0 ? 'text-success-600' : 'text-danger-600'
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance</h3>
          {Object.keys(categoryTrends).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(categoryTrends).map(([category, data], index) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getScoreColor(data.average)} size="sm">
                        {data.average}%
                      </Badge>
                      {data.trend !== undefined && (
                        <div className={`flex items-center text-xs ${
                          data.trend >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {data.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span className="ml-1">{Math.abs(data.trend)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ProgressBar
                    value={data.average}
                    variant={getScoreColor(data.average)}
                    size="md"
                    animate
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No category data available yet.</p>
              <p className="text-xs text-gray-400 mt-1">Complete more interviews to see category performance.</p>
            </div>
          )}
        </Card>

        {/* Grade Distribution */}
        <Card animate delay={0.5}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Grade Distribution</h3>
          {Object.keys(gradeDistribution).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(gradeDistribution).map(([grade, count]) => {
                const total = Object.values(gradeDistribution).reduce((sum, c) => sum + c, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={grade} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant={getScoreColor(grade === 'A' ? 90 : grade === 'B' ? 75 : 60)}>
                        {grade}
                      </Badge>
                      <span className="text-sm text-gray-600">{count} interviews</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${
                            grade.startsWith('A') ? 'bg-success-500' :
                            grade.startsWith('B') ? 'bg-warning-500' : 'bg-danger-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No grade data available yet.</p>
              <p className="text-xs text-gray-400 mt-1">Complete more interviews to see grade distribution.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Performance Timeline */}
      {performanceData.length > 0 && (
        <Card animate delay={0.6}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Timeline</h3>
          <div className="space-y-4">
            {performanceData.slice(-10).map((data, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-600">
                      {data.interview}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Interview #{data.interview}
                    </div>
                    <div className="text-xs text-gray-500">{data.date}</div>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.mostImprovedCategory && (
              <div className="text-center p-4 bg-success-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-success-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-success-800">Most Improved</div>
                <div className="text-xs text-success-600">{insights.mostImprovedCategory}</div>
              </div>
            )}
            
            {insights.strongestCategory && (
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <Award className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-primary-800">Strongest Area</div>
                <div className="text-xs text-primary-600">{insights.strongestCategory}</div>
              </div>
            )}
            
            {insights.needsImprovement && insights.needsImprovement.length > 0 && (
              <div className="text-center p-4 bg-warning-50 rounded-lg">
                <Target className="w-8 h-8 text-warning-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-warning-800">Focus Area</div>
                <div className="text-xs text-warning-600">{insights.needsImprovement[0]}</div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;