import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Download, Zap, Brain } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DataProcessingProps {
  onProcessingComplete: () => void;
}

const DataProcessing: React.FC<DataProcessingProps> = ({ onProcessingComplete }) => {
  const [activeTab, setActiveTab] = useState('clean');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { isDark } = useTheme();

  const cleanData = async (options: any) => {
    setProcessing(true);
    try {
      const response = await fetch('http://localhost:8000/clean-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      const result = await response.json();
      setResults(result);
      onProcessingComplete();
    } catch (error) {
      console.error('Error cleaning data:', error);
    }
    setProcessing(false);
  };



  const exportData = async (format: string) => {
    try {
      const response = await fetch(`http://localhost:8000/export/${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_export.${format}`;
      a.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const tabs = [
    { id: 'clean', label: 'Data Cleaning', icon: Settings },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'insights', label: 'AI Insights', icon: Brain }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-6 ${isDark ? 'glass-dark' : 'glass-light'}`}
    >
      <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-primary-dark' : 'text-primary-light'}`}>
        Data Processing & Analysis
      </h3>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'clean' && (
          <div className="space-y-4">
            <h4 className={`font-medium ${isDark ? 'text-primary-dark' : 'text-primary-light'}`}>
              Data Cleaning Options
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => cleanData({ handle_missing: true, missing_method: 'drop' })}
                disabled={processing}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h5 className="font-medium">Remove Missing Values</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Drop rows with null values</p>
              </button>
              <button
                onClick={() => cleanData({ handle_missing: true, missing_method: 'fill_mean' })}
                disabled={processing}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h5 className="font-medium">Fill with Mean</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Replace nulls with column mean</p>
              </button>
              <button
                onClick={() => cleanData({ remove_outliers: true })}
                disabled={processing}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h5 className="font-medium">Remove Outliers</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remove statistical outliers</p>
              </button>
              <button
                onClick={() => cleanData({ remove_duplicates: true })}
                disabled={processing}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h5 className="font-medium">Remove Duplicates</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remove duplicate rows</p>
              </button>
            </div>
          </div>
        )}



        {activeTab === 'export' && (
          <div className="space-y-4">
            <h4 className={`font-medium ${isDark ? 'text-primary-dark' : 'text-primary-light'}`}>
              Export Options
            </h4>
            <div className="flex gap-4">
              <button
                onClick={() => exportData('pdf')}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Export PDF Report
              </button>
              <button
                onClick={() => exportData('excel')}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Export Excel
              </button>
            </div>
          </div>
        )}

        {results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <h5 className="font-medium mb-2">Processing Results:</h5>
            <p className="text-sm">{results.message}</p>
            {results.operations && (
              <ul className="text-sm mt-2 space-y-1">
                {results.operations.map((op: string, idx: number) => (
                  <li key={idx} className="text-green-600">• {op}</li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DataProcessing;