import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Loader } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const NaturalQuery: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/natural-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      setResult('Error processing your query. Please try again.');
    }
    setLoading(false);
  };

  const sampleQueries = [
    "Show me sales trends over time",
    "What are the top performing categories?",
    "Find patterns in customer behavior",
    "Identify outliers in the data",
    "What correlations exist between variables?"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-6 ${isDark ? 'glass-dark' : 'glass-light'}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-primary-dark' : 'text-primary-light'}`}>
            Natural Language Queries
          </h3>
          <p className={`text-sm ${isDark ? 'text-muted-dark' : 'text-muted-light'}`}>
            Ask questions about your data in plain English
          </p>
        </div>
      </div>

      {/* Query Input */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your data..."
            className={`flex-1 px-4 py-3 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
          />
          <button
            onClick={handleQuery}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* Sample Queries */}
        <div>
          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-muted-dark' : 'text-muted-light'}`}>
            Try these sample queries:
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(sample)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <h4 className={`font-medium mb-2 ${isDark ? 'text-primary-dark' : 'text-primary-light'}`}>
              Analysis Result:
            </h4>
            <p className={`text-sm ${isDark ? 'text-secondary-dark' : 'text-secondary-light'}`}>
              {result}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default NaturalQuery;