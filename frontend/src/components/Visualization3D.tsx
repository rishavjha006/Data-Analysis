import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Visualization3DProps {}

interface Visualization {
  type: string;
  title: string;
  data: {
    x: number[];
    y: number[];
    z: number[];
    x_label: string;
    y_label: string;
    z_label: string;
  };
}

const Visualization3D: React.FC<Visualization3DProps> = () => {
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();

  const fetchVisualizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/3d-visualizations');
      if (!response.ok) {
        throw new Error('Failed to generate 3D visualizations');
      }
      const data = await response.json();
      setVisualizations(data.visualizations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisualizations();
  }, []);

  const exportVisualization = (viz: Visualization, filename: string) => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <div id="plot" style="width:100%;height:600px;"></div>
    <script>
        const data = [{
            x: ${JSON.stringify(viz.data.x)},
            y: ${JSON.stringify(viz.data.y)},
            z: ${JSON.stringify(viz.data.z)},
            ${viz.type === 'scatter_3d' ? 'mode: "markers", type: "scatter3d", marker: { size: 6, colorscale: "Plasma" }' : 'type: "surface", colorscale: "Viridis"'}
        }];
        const layout = {
            title: '${viz.title}',
            scene: {
                xaxis: { title: '${viz.data.x_label}' },
                yaxis: { title: '${viz.data.y_label}' },
                zaxis: { title: '${viz.data.z_label}' }
            }
        };
        Plotly.newPlot('plot', data, layout);
    </script>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${
              isDark ? 'text-primary-dark' : 'text-primary-light'
            }`}>3D Visualizations</h3>
            <p className={`text-sm ${
              isDark ? 'text-muted-dark' : 'text-muted-light'
            }`}>Interactive 3D plots and surface visualizations</p>
          </div>
        </div>
        <motion.button
          onClick={fetchVisualizations}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isDark ? 'btn-secondary-dark' : 'btn-secondary-light'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </div>

      {/* Error State */}
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
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`glass rounded-2xl p-8 text-center ${
            isDark ? 'glass-dark' : 'glass-light'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className={isDark ? 'text-secondary-dark' : 'text-secondary-light'}>
              Generating 3D visualizations...
            </p>
          </div>
        </motion.div>
      )}

      {/* Visualizations */}
      {!loading && !error && visualizations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`glass rounded-2xl p-8 text-center ${
            isDark ? 'glass-dark' : 'glass-light'
          }`}
        >
          <Box className={`w-12 h-12 mx-auto mb-4 ${
            isDark ? 'text-muted-dark' : 'text-muted-light'
          }`} />
          <p className={`text-lg font-medium mb-2 ${
            isDark ? 'text-primary-dark' : 'text-primary-light'
          }`}>No 3D Visualizations Available</p>
          <p className={isDark ? 'text-muted-dark' : 'text-muted-light'}>
            Your dataset needs at least 3 numeric columns to generate 3D visualizations.
          </p>
        </motion.div>
      )}

      {/* Visualization Grid */}
      {visualizations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visualizations.map((viz, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass rounded-2xl overflow-hidden ${
                isDark ? 'glass-dark' : 'glass-light'
              }`}
            >
              {/* Visualization Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h4 className={`font-semibold ${
                    isDark ? 'text-primary-dark' : 'text-primary-light'
                  }`}>{viz.title}</h4>
                  <motion.button
                    onClick={() => exportVisualization(viz, viz.title.replace(/\s+/g, '_'))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg transition-all ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    title="Export as HTML"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Visualization Content */}
              <div className="h-96">
                <div 
                  id={`plot-${index}`}
                  className="w-full h-full"
                  ref={(el) => {
                    if (el && viz.data && (window as any).Plotly) {
                      const Plotly = (window as any).Plotly;
                      const data = [{
                        x: viz.data.x,
                        y: viz.data.y,
                        z: viz.data.z,
                        ...(viz.type === 'scatter_3d' 
                          ? { mode: 'markers', type: 'scatter3d', marker: { size: 6, color: viz.data.z, colorscale: 'Plasma', showscale: true } }
                          : { type: 'surface', colorscale: 'Viridis' }
                        )
                      }];
                      
                      const layout = {
                        title: viz.title,
                        scene: {
                          xaxis: { title: viz.data.x_label },
                          yaxis: { title: viz.data.y_label },
                          zaxis: { title: viz.data.z_label },
                          camera: { eye: { x: 1.5, y: 1.5, z: 1.5 } }
                        },
                        margin: { l: 0, r: 0, b: 0, t: 40 }
                      };
                      
                      Plotly.newPlot(el, data, layout, { responsive: true });
                    }
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Visualization3D;