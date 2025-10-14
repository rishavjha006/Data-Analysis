import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Table, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ExportDataProps {}

const ExportData: React.FC<ExportDataProps> = () => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [success, setSuccess] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();

  const handleExport = async (format: 'csv' | 'pdf' | 'excel' | 'pdf-enhanced') => {
    setLoading(prev => ({ ...prev, [format]: true }));
    setError(null);
    
    try {
      const endpoint = format === 'pdf-enhanced' ? 'pdf-enhanced' : format === 'excel' ? 'excel' : format;
      const response = await fetch(`http://localhost:8000/export/${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Failed to export ${format.toUpperCase()}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Set filename based on format
      
      const filenames = {
        csv: 'data_export.csv',
        pdf: 'data_analysis_report.pdf',
        excel: 'data_analysis.xlsx',
        'pdf-enhanced': 'enhanced_data_report.pdf'
      };
      
      a.download = filenames[format];
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Show success state
      setSuccess(prev => ({ ...prev, [format]: true }));
      setTimeout(() => {
        setSuccess(prev => ({ ...prev, [format]: false }));
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(prev => ({ ...prev, [format]: false }));
    }
  };

  const exportOptions = [
    {
      id: 'csv',
      title: 'Export as CSV',
      description: 'Download your data as a comma-separated values file',
      icon: Table,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      id: 'excel',
      title: 'Export as Excel',
      description: 'Download with multiple sheets including summary and analysis',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      id: 'pdf',
      title: 'Basic PDF Report',
      description: 'Simple PDF report with dataset summary',
      icon: FileText,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      id: 'pdf-enhanced',
      title: 'Enhanced PDF Report',
      description: 'Comprehensive PDF with detailed statistics and quality assessment',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className={`text-xl font-semibold ${
            isDark ? 'text-primary-dark' : 'text-primary-light'
          }`}>Export Data</h3>
          <p className={`text-sm ${
            isDark ? 'text-muted-dark' : 'text-muted-light'
          }`}>Download your data and analysis in various formats</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-lg border-l-4 border-red-500 ${
            isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Export Error</span>
          </div>
          <p className="mt-1 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((option, index) => {
          const Icon = option.icon;
          const isLoading = loading[option.id];
          const isSuccess = success[option.id];
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass rounded-2xl p-6 card-hover ${
                isDark ? 'glass-dark' : 'glass-light'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${option.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {isSuccess && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-1 bg-green-500 rounded-full"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
              
              <h4 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-primary-dark' : 'text-primary-light'
              }`}>{option.title}</h4>
              
              <p className={`text-sm mb-4 ${
                isDark ? 'text-muted-dark' : 'text-muted-light'
              }`}>{option.description}</p>
              
              <motion.button
                onClick={() => handleExport(option.id as any)}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isSuccess
                    ? 'bg-green-500 text-white'
                    : isDark 
                    ? 'btn-primary-dark' 
                    : 'btn-primary-light'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export {option.title.split(' ')[2] || 'File'}
                  </>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Export Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`glass rounded-2xl p-6 ${
          isDark ? 'glass-dark' : 'glass-light'
        }`}
      >
        <h4 className={`text-lg font-semibold mb-3 ${
          isDark ? 'text-primary-dark' : 'text-primary-light'
        }`}>Export Tips</h4>
        <ul className={`space-y-2 text-sm ${
          isDark ? 'text-muted-dark' : 'text-muted-light'
        }`}>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>CSV:</strong> Best for importing into other tools or spreadsheet applications</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>Excel:</strong> Includes multiple sheets with data, summary, and missing value analysis</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>Enhanced PDF:</strong> Comprehensive report with data quality metrics and statistical insights</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default ExportData;