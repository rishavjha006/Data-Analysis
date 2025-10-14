import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Plus, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface FilterRule {
  column: string;
  operator: string;
  value: string;
}

interface DataFilterProps {
  columns: string[];
  onFilter: (filters: FilterRule[]) => void;
}

const DataFilter: React.FC<DataFilterProps> = ({ columns, onFilter }) => {
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [filteredData, setFilteredData] = useState<any>(null);
  const { isDark } = useTheme();

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' }
  ];

  const addFilter = () => {
    setFilters([...filters, { column: columns[0] || '', operator: 'equals', value: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof FilterRule, value: string) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  const applyFilters = async () => {
    try {
      const response = await fetch('http://localhost:8000/filter-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      const result = await response.json();
      setFilteredData(result.stats);
      onFilter(filters);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-6 ${isDark ? 'glass-dark' : 'glass-light'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
            <Filter className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${isDark ? 'text-primary-dark' : 'text-primary-light'}`}>
              Data Filtering
            </h3>
            <p className={`text-sm ${isDark ? 'text-muted-dark' : 'text-muted-light'}`}>
              Filter and slice your data
            </p>
          </div>
        </div>
        <button
          onClick={addFilter}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Filter
        </button>
      </div>

      {/* Filter Rules */}
      <div className="space-y-4">
        {filters.map((filter, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-4 rounded-lg border ${
              isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <select
              value={filter.column}
              onChange={(e) => updateFilter(index, 'column', e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>

            <select
              value={filter.operator}
              onChange={(e) => updateFilter(index, 'operator', e.target.value)}
              className={`px-3 py-2 rounded border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {operators.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>

            <input
              type="text"
              value={filter.value}
              onChange={(e) => updateFilter(index, 'value', e.target.value)}
              placeholder="Value"
              className={`flex-1 px-3 py-2 rounded border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />

            <button
              onClick={() => removeFilter(index)}
              className="p-2 text-red-500 hover:bg-red-500/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}

        {filters.length > 0 && (
          <button
            onClick={applyFilters}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Apply Filters
          </button>
        )}

        {filteredData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <h4 className="font-medium mb-2">Filtered Results:</h4>
            <p className="text-sm">Rows: {filteredData.rows} | Columns: {filteredData.columns}</p>
            
            {filteredData.sample_data && filteredData.sample_data.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                      {Object.keys(filteredData.sample_data[0]).map(key => (
                        <th key={key} className="px-3 py-2 text-left">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.sample_data.slice(0, 5).map((row: any, idx: number) => (
                      <tr key={idx} className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                        {Object.values(row).map((value: any, cellIdx: number) => (
                          <td key={cellIdx} className="px-3 py-2">{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DataFilter;