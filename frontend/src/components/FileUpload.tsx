import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  loading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, loading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { isDark } = useTheme();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type === 'text/csv') {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 1000);
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 1000);
      onFileUpload(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className={`inline-block p-4 rounded-full mb-4 ${
          isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'
        }`}>
          <FileText className={`w-12 h-12 ${
            isDark ? 'text-blue-300' : 'text-blue-600'
          }`} />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${
          isDark ? 'text-primary-dark' : 'text-primary-light'
        }`}>Upload Your Data</h2>
        <p className={isDark ? 'text-secondary-dark' : 'text-secondary-light'}>
          Transform your CSV data into beautiful insights
        </p>
      </motion.div>

      <motion.div
        className={`glass ${isDark ? 'glass-dark' : 'glass-light'} rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragOver ? 'border-blue-400 scale-105' : ''
        } ${uploadSuccess ? 'border-green-400' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse" />
            </div>
            <p className={`mt-4 font-medium ${
              isDark ? 'text-primary-dark' : 'text-primary-light'
            }`}>Processing your data...</p>
            <div className={`w-48 h-2 rounded-full mt-3 overflow-hidden ${
              isDark ? 'bg-gray-700' : 'bg-gray-300'
            }`}>
              <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shimmer" />
            </div>
          </motion.div>
        ) : uploadSuccess ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
            <p className={`font-medium ${
              isDark ? 'text-primary-dark' : 'text-primary-light'
            }`}>File uploaded successfully!</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className={`mx-auto mb-6 p-4 rounded-full ${
                isDragOver 
                  ? 'bg-blue-400/30' 
                  : isDark ? 'bg-gray-700/50' : 'bg-gray-200/50'
              }`}
              animate={isDragOver ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isDragOver ? Infinity : 0 }}
            >
              <Upload className={`w-12 h-12 ${
                isDragOver 
                  ? 'text-blue-500' 
                  : isDark ? 'text-gray-300' : 'text-gray-600'
              }`} />
            </motion.div>
            
            <div className="space-y-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-block px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isDark ? 'btn-primary-dark' : 'btn-primary-light'
                  }`}
                >
                  Choose CSV File
                </motion.div>
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  accept=".csv" 
                  className="sr-only" 
                  onChange={handleFileSelect} 
                />
              </label>
              
              <p className={`text-sm ${
                isDark ? 'text-muted-dark' : 'text-muted-light'
              }`}>
                or drag and drop your file here
              </p>
              
              <div className={`flex items-center justify-center gap-4 text-xs ${
                isDark ? 'text-muted-dark' : 'text-muted-light'
              }`}>
                <span>• CSV files only</span>
                <span>• Unlimited size</span>
                <span>• Instant analysis</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FileUpload;