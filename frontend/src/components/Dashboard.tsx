import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Database, Columns, AlertTriangle, Award, Brain, Table, Settings, MessageSquare, Filter, TrendingUp, Box, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Chart from './Chart';
import AIInsights from './AIInsights';
import DataCleaning from './DataCleaning';
import NaturalQuery from './NaturalQuery';
import DataFilter from './DataFilter';
import PredictiveInsights from './PredictiveInsights';
import Visualization3D from './Visualization3D';
import ExportData from './ExportData';

interface DashboardProps {
  data: {
    stats: {
      rows: number;
      columns: number;
      column_names: string[];
      data_types: Record<string, string>;
      missing_values: Record<string, number>;
      numeric_summary: any;
      quality_score?: number;
      outliers?: Record<string, number>;
      duplicate_rows?: number;
    };
    charts: any[];
  };
  onReset: () => void;
  onDataUpdate: (newData: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset, onDataUpdate }) => {
  const [showInsights, setShowInsights] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentData, setCurrentData] = useState(data);
  const { isDark } = useTheme();

  const handleProcessingComplete = async () => {
    setRefreshKey(prev => prev + 1);
    
    // Fetch updated statistics
    try {
      const response = await fetch('http://localhost:8000/current-stats');
      const newStats = await response.json();
      
      const updatedData = {
        stats: newStats,
        charts: currentData.charts // Keep existing charts for now
      };
      
      setCurrentData(updatedData);
      onDataUpdate(updatedData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const handleFilter = (filters: any[]) => {
    console.log('Filters applied:', filters);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'processing', label: 'Cleaning', icon: Settings },
    { id: 'query', label: 'AI Query', icon: MessageSquare },
    { id: 'filter', label: 'Filter', icon: Filter },
    { id: 'insights', label: 'Predictions', icon: TrendingUp },
    { id: '3d-viz', label: '3D Visuals', icon: Box },
    { id: 'export', label: 'Export', icon: Download }
  ];

  const stats = [
    {
      title: 'Rows',
      value: currentData.stats.rows.toLocaleString(),
      icon: Database,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Columns',
      value: currentData.stats.columns,
      icon: Columns,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Missing Values',
      value: (Object.values(currentData.stats.missing_values) as number[]).reduce((a, b) => a + b, 0),
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Data Quality',
      value: `${currentData.stats.quality_score ? currentData.stats.quality_score.toFixed(1) : Math.round((1 - Object.values(currentData.stats.missing_values).reduce((a: number, b: number) => a + b, 0) / (currentData.stats.rows * currentData.stats.columns)) * 100)}%`,
      icon: Award,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-primary-dark' : 'text-primary-light'
          }`}>Data Analysis Dashboard</h2>
          <p className={isDark ? 'text-secondary-dark' : 'text-secondary-light'}>
            Comprehensive insights and advanced analytics
          </p>
        </div>
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
            isDark ? 'btn-secondary-dark' : 'btn-secondary-light'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Upload New File
        </motion.button>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-1 mb-6"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Statistics Overview */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={`glass rounded-2xl p-6 card-hover ${
                      isDark ? 'glass-dark' : 'glass-light'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                    <h3 className={`text-sm font-medium mb-1 ${
                      isDark ? 'text-muted-dark' : 'text-muted-light'
                    }`}>{stat.title}</h3>
                    <motion.p 
                      className={`text-3xl font-bold ${
                        isDark ? 'text-primary-dark' : 'text-primary-light'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                    >
                      {stat.value}
                    </motion.p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Charts */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {currentData.charts.map((chart, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Chart chartData={chart} />
                </motion.div>
              ))}
            </motion.div>

            {/* AI Insights */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`glass rounded-2xl p-6 ${
                isDark ? 'glass-dark' : 'glass-light'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${
                      isDark ? 'text-primary-dark' : 'text-primary-light'
                    }`}>AI Insights</h3>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowInsights(!showInsights)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  {showInsights ? 'Hide' : 'Generate'} Insights
                </motion.button>
              </div>
              <AnimatePresence>
                {showInsights && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AIInsights stats={currentData.stats} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Column Details */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`glass rounded-2xl p-6 ${
                isDark ? 'glass-dark' : 'glass-light'
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl">
                  <Table className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${
                    isDark ? 'text-primary-dark' : 'text-primary-light'
                  }`}>Column Information</h3>
                  <p className={`text-sm ${
                    isDark ? 'text-muted-dark' : 'text-muted-light'
                  }`}>Detailed breakdown of your data structure</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={`border-b ${
                      isDark ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-muted-dark' : 'text-muted-light'
                      }`}>Column</th>
                      <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-muted-dark' : 'text-muted-light'
                      }`}>Type</th>
                      <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-muted-dark' : 'text-muted-light'
                      }`}>Missing</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDark ? 'divide-gray-600' : 'divide-gray-300'
                  }`}>
                    {currentData.stats.column_names.map((col: string, index: number) => (
                      <motion.tr 
                        key={col}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        className={`transition-colors duration-200 ${
                          isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100/50'
                        }`}
                      >
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          isDark ? 'text-primary-dark' : 'text-primary-light'
                        }`}>{col}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDark ? 'text-secondary-dark' : 'text-secondary-light'
                        }`}>
                          <span className={`px-2 py-1 rounded-lg text-xs ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {currentData.stats.data_types[col]}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDark ? 'text-secondary-dark' : 'text-secondary-light'
                        }`}>
                          {currentData.stats.missing_values[col] > 0 ? (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs">
                              {currentData.stats.missing_values[col]}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">
                              0
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DataCleaning onDataCleaned={handleProcessingComplete} currentStats={currentData.stats} />
          </motion.div>
        )}

        {activeTab === 'query' && (
          <motion.div
            key="query"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <NaturalQuery />
          </motion.div>
        )}

        {activeTab === 'filter' && (
          <motion.div
            key="filter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DataFilter 
              columns={currentData.stats.column_names} 
              onFilter={handleFilter} 
            />
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PredictiveInsights key={refreshKey} />
          </motion.div>
        )}

        {activeTab === '3d-viz' && (
          <motion.div
            key="3d-viz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Visualization3D />
          </motion.div>
        )}

        {activeTab === 'export' && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ExportData />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;