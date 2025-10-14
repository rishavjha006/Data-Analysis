import React from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  chartData: {
    type: string;
    title: string;
    data: {
      labels: string[];
      values: number[];
    };
  };
}

const Chart: React.FC<ChartProps> = ({ chartData }) => {
  const { isDark } = useTheme();
  const data = {
    labels: chartData.data.labels,
    datasets: [
      {
        label: chartData.title,
        data: chartData.data.values,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? 'white' : 'black',
        bodyColor: isDark ? 'white' : 'black',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
        }
      }
    },
    animation: {
      duration: 1500
    }
  };

  return (
    <motion.div 
      className={`glass rounded-2xl p-6 card-hover ${
        isDark ? 'glass-dark' : 'glass-light'
      }`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <h3 className={`text-lg font-semibold ${
          isDark ? 'text-primary-dark' : 'text-primary-light'
        }`}>{chartData.title}</h3>
      </div>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </motion.div>
  );
};

export default Chart;