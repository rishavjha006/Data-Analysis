import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const PredictiveInsights: React.FC = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/predictive-insights');
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'clustering': return Target;
      case 'correlation': return TrendingUp;
      default: return Zap;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'clustering': return 'from-purple-500 to-pink-500';
      case 'correlation': return 'from-blue-500 to-cyan-500';
      default: return 'from-green-500 to-teal-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-6 ${isDark ? 'glass-dark' : 'glass-light'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${isDark ? 'text-primary-dark' : 'text-primary-light'}`}>
              Predictive Insights
            </h3>
            <p className={`text-sm ${isDark ? 'text-muted-dark' : 'text-muted-light'}`}>
              AI-powered pattern recognition and predictions
            </p>
          </div>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : insights.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-muted-dark' : 'text-muted-light'}`}>
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No predictive insights available yet.</p>
          <p className="text-sm">Upload data with numeric columns to see patterns.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            const colorClass = getInsightColor(insight.type);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 bg-gradient-to-r ${colorClass} rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-primary-dark' : 'text-primary-light'}`}>
                      {insight.message}
                    </h4>
                    
                    {insight.type === 'clustering' && insight.cluster_sizes && (
                      <div className="space-y-2">
                        <p className={`text-sm ${isDark ? 'text-secondary-dark' : 'text-secondary-light'}`}>
                          Cluster Distribution:
                        </p>
                        <div className="flex gap-2">
                          {insight.cluster_sizes.map((size: number, idx: number) => (
                            <div key={idx} className="flex items-center gap-1">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClass}`}></div>
                              <span className="text-sm">Cluster {idx + 1}: {size} items</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {insight.type === 'correlation' && insight.correlations && (
                      <div className="space-y-2">
                        <p className={`text-sm ${isDark ? 'text-secondary-dark' : 'text-secondary-light'}`}>
                          Strong Correlations Found:
                        </p>
                        <div className="space-y-1">
                          {insight.correlations.map((corr: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span>{corr.col1} ↔ {corr.col2}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                Math.abs(corr.correlation) > 0.8 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {corr.correlation > 0 ? '+' : ''}{corr.correlation}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default PredictiveInsights;