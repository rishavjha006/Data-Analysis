import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AIInsightsProps {
  stats: any;
}

const AIInsights: React.FC<AIInsightsProps> = ({ stats }) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stats),
        });
        const data = await response.json();
        setInsights(data.insight);
      } catch (error) {
        setInsights('Failed to generate insights. Please check your API configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [stats]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      {loading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center p-8"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 w-8 h-8 border-2 border-purple-300 rounded-full"
              />
            </div>
            <div className="text-center">
              <p className={`font-medium ${
                isDark ? 'text-primary-dark' : 'text-primary-light'
              }`}>Generating AI insights...</p>
              <p className={`text-sm mt-1 ${
                isDark ? 'text-muted-dark' : 'text-muted-light'
              }`}>Analyzing your data patterns</p>
            </div>
            <div className={`w-32 h-1 rounded-full overflow-hidden ${
              isDark ? 'bg-gray-700' : 'bg-gray-300'
            }`}>
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                animate={{ x: [-128, 128] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 ${
            isDark 
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-300/30' 
              : 'bg-gradient-to-r from-purple-100/50 to-pink-100/50 border-purple-200/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className={`font-semibold flex items-center gap-2 ${
                isDark ? 'text-primary-dark' : 'text-primary-light'
              }`}>
                AI Analysis
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </h4>

            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`backdrop-blur-sm rounded-xl p-4 border ${
              isDark 
                ? 'bg-gray-800/50 border-gray-600/50' 
                : 'bg-white/70 border-gray-200/50'
            }`}
          >
            <p className={`whitespace-pre-line leading-relaxed ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>{insights}</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AIInsights;