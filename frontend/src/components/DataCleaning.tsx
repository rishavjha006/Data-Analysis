import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Target, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DataCleaningProps {
  onDataCleaned: (result: any) => void;
  currentStats?: any;
}

const DataCleaning: React.FC<DataCleaningProps> = ({ onDataCleaned, currentStats }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [updatedStats, setUpdatedStats] = useState<any>(null);
  const { isDark } = useTheme();

  const cleaningOptions = [
    {
      id: 'missing',
      title: 'Remove Missing Values',
      description: 'Drop rows with null values',
      icon: Droplets,
      color: 'from-blue-500 to-blue-600',
      method: 'drop'
    },
    {
      id: 'fill_mean',
      title: 'Fill with Mean',
      description: 'Replace nulls with column mean',
      icon: Target,
      color: 'from-green-500 to-green-600',
      method: 'fill_mean'
    },
    {
      id: 'outliers',
      title: 'Remove Outliers',
      description: 'Remove statistical outliers',
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      method: 'outliers'
    },
    {
      id: 'duplicates',
      title: 'Remove Duplicates',
      description: 'Remove duplicate rows',
      icon: Copy,
      color: 'from-purple-500 to-purple-600',
      method: 'duplicates'
    }
  ];

  const handleCleanData = async (option: any) => {
    setLoading(true);
    setResults(null);
    setUpdatedStats(null);

    try {
      const cleanOptions: any = {};
      
      if (option.id === 'missing') {
        cleanOptions.handle_missing = true;
        cleanOptions.missing_method = 'drop';
      } else if (option.id === 'fill_mean') {
        cleanOptions.handle_missing = true;
        cleanOptions.missing_method = 'fill_mean';
      } else if (option.id === 'outliers') {
        cleanOptions.remove_outliers = true;
      } else if (option.id === 'duplicates') {
        cleanOptions.remove_duplicates = true;
      }

      const response = await fetch('http://localhost:8000/clean-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanOptions),
      });

      const result = await response.json();
      setResults(result);
      
      // Fetch updated dataset statistics
      const statsResponse = await fetch('http://localhost:8000/current-stats');
      const newStats = await statsResponse.json();
      setUpdatedStats(newStats);
      
      onDataCleaned(result);
    } catch (error) {
      console.error('Cleaning failed:', error);
      setResults({
        message: 'Data cleaning failed',
        operations: ['Error occurred during cleaning'],
        new_shape: { rows: 0, columns: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cleaningOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.id}
              onClick={() => handleCleanData(option)}
              disabled={loading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`glass rounded-xl p-4 text-left transition-all duration-200 ${
                isDark ? 'glass-dark hover:bg-gray-700/30' : 'glass-light hover:bg-gray-100/50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${option.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    isDark ? 'text-primary-dark' : 'text-primary-light'
                  }`}>{option.title}</h3>
                </div>
              </div>
              <p className={`text-sm ${
                isDark ? 'text-muted-dark' : 'text-muted-light'
              }`}>{option.description}</p>
            </motion.button>
          );
        })}
      </div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`glass rounded-xl p-6 text-center ${
            isDark ? 'glass-dark' : 'glass-light'
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className={`font-medium ${
              isDark ? 'text-primary-dark' : 'text-primary-light'
            }`}>Processing data cleaning...</p>
          </div>
        </motion.div>
      )}

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass rounded-xl p-6 ${
            isDark ? 'glass-dark' : 'glass-light'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-primary-dark' : 'text-primary-light'
            }`}>Processing Results</h3>
          </div>
          
          <div className="space-y-3">
            <p className={`font-medium ${
              isDark ? 'text-secondary-dark' : 'text-secondary-light'
            }`}>{results.message}</p>
            
            {results.operations && results.operations.length > 0 && (
              <div>
                <h4 className={`font-medium mb-2 ${
                  isDark ? 'text-primary-dark' : 'text-primary-light'
                }`}>Operations Performed:</h4>
                <ul className="space-y-1">
                  {results.operations.map((op: string, index: number) => (
                    <li key={index} className={`text-sm flex items-center gap-2 ${
                      isDark ? 'text-muted-dark' : 'text-muted-light'
                    }`}>
                      <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                      {op}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {results.new_shape && (
              <div className={`mt-4 p-4 rounded-lg ${
                isDark ? 'bg-gray-700/30' : 'bg-gray-100/50'
              }`}>
                <h4 className={`font-medium mb-3 ${
                  isDark ? 'text-primary-dark' : 'text-primary-light'
                }`}>Dataset Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>{results.new_shape.rows.toLocaleString()}</p>
                    <p className={`text-xs ${
                      isDark ? 'text-muted-dark' : 'text-muted-light'
                    }`}>Rows</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`}>{results.new_shape.columns}</p>
                    <p className={`text-xs ${
                      isDark ? 'text-muted-dark' : 'text-muted-light'
                    }`}>Columns</p>
                  </div>
                  {updatedStats && (
                    <>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${
                          (Object.values(updatedStats.missing_values) as number[]).reduce((a, b) => a + b, 0) === 0
                            ? (isDark ? 'text-green-400' : 'text-green-600')
                            : (isDark ? 'text-red-400' : 'text-red-600')
                        }`}>
                          {(Object.values(updatedStats.missing_values) as number[]).reduce((a, b) => a + b, 0)}
                        </p>
                        <p className={`text-xs ${
                          isDark ? 'text-muted-dark' : 'text-muted-light'
                        }`}>Missing</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${
                          isDark ? 'text-purple-400' : 'text-purple-600'
                        }`}>{updatedStats.quality_score.toFixed(1)}%</p>
                        <p className={`text-xs ${
                          isDark ? 'text-muted-dark' : 'text-muted-light'
                        }`}>Quality</p>
                      </div>
                    </>
                  )}
                </div>
                {updatedStats && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    isDark ? 'bg-gray-600/30' : 'bg-gray-200/50'
                  }`}>
                    <h5 className={`text-sm font-medium mb-2 ${
                      isDark ? 'text-primary-dark' : 'text-primary-light'
                    }`}>Column Status</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs max-h-64 overflow-y-auto">
                      {updatedStats.column_names.map((col: string) => (
                        <div key={col} className="flex justify-between items-center">
                          <span className={isDark ? 'text-secondary-dark' : 'text-secondary-light'}>
                            {col}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {updatedStats.data_types[col]}
                            </span>
                            {updatedStats.missing_values[col] > 0 ? (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                                {updatedStats.missing_values[col]} null
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DataCleaning;