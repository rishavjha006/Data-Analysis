import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Sun, Moon } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';

interface AnalysisData {
  stats: any;
  charts: any[];
}

function App() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen theme-transition ${
      isDark ? 'bg-dark' : 'bg-light'
    }`}>
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`glass ${isDark ? 'glass-dark' : 'glass-light'} border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className={`text-3xl font-bold flex items-center gap-2 ${
                  isDark ? 'text-primary-dark' : 'text-primary-light'
                }`}>
                  Data Analysis
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </h1>
                <p className={`mt-1 flex items-center gap-2 ${
                  isDark ? 'text-secondary-dark' : 'text-secondary-light'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  Upload CSV files for instant analysis and AI insights
                </p>
              </div>
            </div>
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isDark 
                  ? 'btn-secondary-dark' 
                  : 'btn-secondary-light'
              }`}
            >
              {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!analysisData ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <FileUpload onFileUpload={handleFileUpload} loading={loading} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Dashboard 
                data={analysisData} 
                onReset={() => setAnalysisData(null)}
                onDataUpdate={setAnalysisData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;