# Data Analysis Dashboard

A full-stack data science dashboard with Python backend and React frontend.

## Stack
- **Frontend**: React + Chart.js + Tailwind CSS
- **Backend**: FastAPI + Pandas + Uvicorn
- **AI**: Google Gemini 2.0 for data insights

## Features

### 1. Core Data Analysis
- CSV file upload and processing
- Automatic data visualization generation
- AI-powered data insights and trend analysis
- Interactive charts and statistics

### 2. Data Processing & Cleaning
- Missing value analysis and imputation
- Outlier detection and handling
- Data transformation tools (log, sqrt, standardization)
- Feature engineering capabilities
- Data quality assessment

### 3. Export & Reporting
- PDF report generation
- Excel export with multiple sheets
- Automated insights summary
- Custom dashboard templates
- Scheduled reports

### 4. Interactive Features
- Data filtering and slicing
- Drill-down capabilities
- Real-time data updates
- Custom query builder
- Data comparison tools

### 5. Advanced AI Features
- Natural language queries ("Show me sales trends")
- Automated pattern recognition
- Predictive insights
- Recommendation engine
- Smart data profiling

### 6. 3D Visualizations
- Interactive 3D scatter plots
- Surface plots for multi-dimensional data
- Exportable HTML visualizations
- Real-time 3D data exploration

### 7. Enhanced Export Options
- CSV data export
- Excel export with multiple sheets
- Basic PDF reports
- Enhanced PDF reports with detailed analytics
- HTML export for 3D visualizations

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt

# Copy environment file and add your API key
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Usage
1. Upload a CSV file
2. View automatic visualizations and statistics
3. Get AI insights about your data trends