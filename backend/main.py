from fastapi import FastAPI, File, UploadFile, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
import numpy as np
import json
from io import StringIO, BytesIO
import google.generativeai as genai
import os
from dotenv import load_dotenv
import chardet
from scipy import stats
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import IsolationForest
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import base64
import plotly.graph_objects as go
import plotly.express as px
from plotly.offline import plot
import plotly.io as pio
from scipy.interpolate import griddata

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Global variable to store current dataset
current_df = None

@app.get("/")
async def root():
    return {"message": "Data Analysis API is running"}

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    global current_df
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")
    
    content = await file.read()
    detected = chardet.detect(content)
    encoding = detected['encoding'] or 'utf-8'
    
    try:
        df = pd.read_csv(StringIO(content.decode(encoding)))
    except UnicodeDecodeError:
        df = pd.read_csv(StringIO(content.decode('latin-1')))
    
    current_df = df.copy()
    
    # Enhanced statistics with data quality assessment
    missing_count = int(df.isnull().sum().sum())
    total_cells = len(df) * len(df.columns)
    quality_score = ((total_cells - missing_count) / total_cells) * 100
    
    # Outlier detection for numeric columns
    outliers = {}
    numeric_cols = df.select_dtypes(include=['number']).columns
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        outlier_count = len(df[(df[col] < Q1 - 1.5*IQR) | (df[col] > Q3 + 1.5*IQR)])
        outliers[col] = int(outlier_count)
    
    # Convert numpy types to native Python types and handle NaN values
    missing_values = {k: int(v) for k, v in df.isnull().sum().to_dict().items()}
    
    # Handle NaN values in numeric summary
    numeric_summary = {}
    if len(numeric_cols) > 0:
        desc = df.describe().to_dict()
        for col, stats_dict in desc.items():
            numeric_summary[col] = {k: (None if pd.isna(v) else float(v)) for k, v in stats_dict.items()}
    
    stats = {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": df.columns.tolist(),
        "data_types": df.dtypes.astype(str).to_dict(),
        "missing_values": missing_values,
        "numeric_summary": numeric_summary,
        "quality_score": float(round(quality_score, 2)),
        "outliers": outliers,
        "memory_usage": int(df.memory_usage(deep=True).sum()),
        "duplicate_rows": int(df.duplicated().sum())
    }
    
    # Enhanced visualizations
    charts = []
    
    # Correlation heatmap for numeric data
    if len(numeric_cols) > 1:
        corr_matrix = df[numeric_cols].corr()
        charts.append({
            "type": "heatmap",
            "title": "Correlation Matrix",
            "data": {
                "labels": numeric_cols.tolist(),
                "values": corr_matrix.values.tolist()
            }
        })
    
    # Distribution charts
    for col in numeric_cols[:3]:
        hist_data = df[col].dropna()
        if len(hist_data) > 0:
            bins = np.histogram(hist_data, bins=10)
            charts.append({
                "type": "histogram",
                "title": f"Distribution of {col}",
                "data": {
                    "labels": [f"{float(bins[1][i]):.1f}-{float(bins[1][i+1]):.1f}" for i in range(len(bins[0]))],
                    "values": [int(x) for x in bins[0]]
                }
            })
    
    # Top categories
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols[:2]:
        value_counts = df[col].value_counts().head(10)
        charts.append({
            "type": "bar",
            "title": f"Top values in {col}",
            "data": {
                "labels": value_counts.index.tolist(),
                "values": value_counts.values.tolist()
            }
        })
    
    # Handle NaN values in sample data
    sample_data = df.head(10).to_dict('records')
    for record in sample_data:
        for key, value in record.items():
            if pd.isna(value):
                record[key] = None
    
    return {"stats": stats, "charts": charts, "sample_data": sample_data}

@app.post("/insights")
async def get_insights(data: dict):
    if not os.getenv("GEMINI_API_KEY"):
        return {"insight": "Gemini API key not configured. Add GEMINI_API_KEY to your environment variables."}
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        prompt = f"""
        Analyze this dataset and provide comprehensive insights:
        - Rows: {data['rows']}, Columns: {data['columns']}
        - Data Quality Score: {data.get('quality_score', 'N/A')}%
        - Column names: {', '.join(data['column_names'])}
        - Data types: {data['data_types']}
        - Missing values: {data['missing_values']}
        - Outliers detected: {data.get('outliers', {})}
        - Duplicate rows: {data.get('duplicate_rows', 0)}
        
        Provide insights on:
        1. Data quality assessment and recommendations
        2. Patterns and anomalies detected
        3. Suggested preprocessing steps
        4. Potential analysis opportunities
        5. Data cleaning priorities
        """
        
        response = model.generate_content(prompt)
        return {"insight": response.text}
    except Exception as e:
        return {"insight": f"Error generating insights: {str(e)}"}

@app.post("/natural-query")
async def natural_query(query: dict):
    global current_df
    if current_df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    if not os.getenv("GEMINI_API_KEY"):
        return {"result": "Gemini API key not configured"}
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Get dataset info
        dataset_info = f"""
        Dataset columns: {current_df.columns.tolist()}
        Data types: {current_df.dtypes.to_dict()}
        Sample data: {current_df.head(3).to_dict()}
        """
        
        prompt = f"""
        Based on this dataset: {dataset_info}
        
        User query: "{query['query']}"
        
        Provide a specific analysis result or insight that answers the user's question.
        If it's about trends, patterns, or specific data points, provide concrete findings.
        """
        
        response = model.generate_content(prompt)
        return {"result": response.text}
    except Exception as e:
        return {"result": f"Error processing query: {str(e)}"}

@app.get("/current-stats")
async def get_current_stats():
    global current_df
    if current_df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    df = current_df
    
    # Calculate comprehensive statistics
    missing_count = int(df.isnull().sum().sum())
    total_cells = len(df) * len(df.columns)
    quality_score = ((total_cells - missing_count) / total_cells) * 100
    
    # Outlier detection for numeric columns
    outliers = {}
    numeric_cols = df.select_dtypes(include=['number']).columns
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        outlier_count = len(df[(df[col] < Q1 - 1.5*IQR) | (df[col] > Q3 + 1.5*IQR)])
        outliers[col] = int(outlier_count)
    
    missing_values = {k: int(v) for k, v in df.isnull().sum().to_dict().items()}
    
    # Handle NaN values in numeric summary
    numeric_summary = {}
    if len(numeric_cols) > 0:
        desc = df.describe().to_dict()
        for col, stats_dict in desc.items():
            numeric_summary[col] = {k: (None if pd.isna(v) else float(v)) for k, v in stats_dict.items()}
    
    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": df.columns.tolist(),
        "data_types": df.dtypes.astype(str).to_dict(),
        "missing_values": missing_values,
        "numeric_summary": numeric_summary,
        "quality_score": float(round(quality_score, 2)),
        "outliers": outliers,
        "memory_usage": int(df.memory_usage(deep=True).sum()),
        "duplicate_rows": int(df.duplicated().sum())
    }

@app.post("/clean-data")
async def clean_data(options: dict):
    global current_df
    if current_df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    df = current_df.copy()
    operations = []
    
    # Handle missing values
    if options.get('handle_missing'):
        method = options.get('missing_method', 'drop')
        if method == 'drop':
            df = df.dropna()
            operations.append("Dropped rows with missing values")
        elif method == 'fill_mean':
            numeric_cols = df.select_dtypes(include=['number']).columns
            df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
            operations.append("Filled missing numeric values with mean")
        elif method == 'fill_median':
            numeric_cols = df.select_dtypes(include=['number']).columns
            df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
            operations.append("Filled missing numeric values with median")
    
    # Remove outliers
    if options.get('remove_outliers'):
        numeric_cols = df.select_dtypes(include=['number']).columns
        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            df = df[~((df[col] < Q1 - 1.5*IQR) | (df[col] > Q3 + 1.5*IQR))]
        operations.append("Removed outliers using IQR method")
    
    # Remove duplicates
    if options.get('remove_duplicates'):
        initial_rows = len(df)
        df = df.drop_duplicates()
        removed = initial_rows - len(df)
        operations.append(f"Removed {removed} duplicate rows")
    
    current_df = df
    
    return {
        "message": "Data cleaning completed",
        "operations": operations,
        "new_shape": {"rows": len(df), "columns": len(df.columns)}
    }

@app.post("/transform-data")
async def transform_data(options: dict):
    global current_df
    if current_df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    df = current_df.copy()
    operations = []
    
    # Standardization
    if options.get('standardize'):
        numeric_cols = df.select_dtypes(include=['number']).columns
        scaler = StandardScaler()
        df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
        operations.append("Applied standardization to numeric columns")
    
    # Normalization
    if options.get('normalize'):
        numeric_cols = df.select_dtypes(include=['number']).columns
        scaler = MinMaxScaler()
        df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
        operations.append("Applied min-max normalization")
    
    # Log transformation
    if options.get('log_transform'):
        columns = options.get('log_columns', [])
        for col in columns:
            if col in df.columns and df[col].dtype in ['int64', 'float64']:
                df[col] = np.log1p(df[col].clip(lower=0))
                operations.append(f"Applied log transformation to {col}")
    
    current_df = df
    
    return {
        "message": "Data transformation completed",
        "operations": operations,
        "new_shape": {"rows": len(df), "columns": len(df.columns)}
    }

@app.get("/export/pdf")
async def export_pdf():
    global current_df
    if current_df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    story.append(Paragraph("Data Analysis Report", styles['Title']))
    story.append(Spacer(1, 12))
    
    # Dataset summary
    summary = f"""
    Dataset Summary:
    - Rows: {len(current_df)}
    - Columns: {len(current_df.columns)}
    - Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    """
    story.append(Paragraph(summary, styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=data_analysis_report.pdf"}
    )

@app.get("/export/excel")
async def export_excel():
    global current_df
    if current_df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    buffer = BytesIO()
    
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        # Main data
        current_df.to_excel(writer, sheet_name='Data', index=False)
        
        # Summary statistics
        summary = current_df.describe()
        summary.to_excel(writer, sheet_name='Summary')
        
        # Missing values analysis
        missing_analysis = pd.DataFrame({
            'Column': current_df.columns,
            'Missing_Count': current_df.isnull().sum(),
            'Missing_Percentage': (current_df.isnull().sum() / len(current_df)) * 100
        })
        missing_analysis.to_excel(writer, sheet_name='Missing_Analysis', index=False)
    
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=data_analysis.xlsx"}
    )

@app.post("/filter-data")
async def filter_data(filters: dict):
    global current_df
    if current_df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    df = current_df.copy()
    
    for filter_item in filters.get('filters', []):
        column = filter_item['column']
        operator = filter_item['operator']
        value = filter_item['value']
        
        if column not in df.columns:
            continue
            
        if operator == 'equals':
            df = df[df[column] == value]
        elif operator == 'greater_than':
            df = df[df[column] > float(value)]
        elif operator == 'less_than':
            df = df[df[column] < float(value)]
        elif operator == 'contains':
            df = df[df[column].astype(str).str.contains(str(value), na=False)]
    
    # Update current dataset with filtered data
    current_df = df
    
    # Return filtered stats with NaN handling
    sample_data = df.head(10).to_dict('records')
    for record in sample_data:
        for key, value in record.items():
            if pd.isna(value):
                record[key] = None
    
    stats = {
        "rows": len(df),
        "columns": len(df.columns),
        "sample_data": sample_data
    }
    
    return {"stats": stats}

@app.get("/predictive-insights")
async def predictive_insights():
    global current_df
    if current_df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    insights = []
    numeric_cols = current_df.select_dtypes(include=['number']).columns
    
    if len(numeric_cols) >= 2:
        # Clustering analysis
        try:
            data_for_clustering = current_df[numeric_cols].dropna()
            if len(data_for_clustering) > 10:
                scaler = StandardScaler()
                scaled_data = scaler.fit_transform(data_for_clustering)
                
                kmeans = KMeans(n_clusters=3, random_state=42)
                clusters = kmeans.fit_predict(scaled_data)
                
                insights.append({
                    "type": "clustering",
                    "message": f"Identified 3 distinct clusters in your data",
                    "cluster_sizes": np.bincount(clusters).tolist()
                })
        except Exception as e:
            pass
    
    # Correlation insights
    if len(numeric_cols) > 1:
        corr_matrix = current_df[numeric_cols].corr()
        high_corr = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                corr_val = corr_matrix.iloc[i, j]
                if abs(corr_val) > 0.7:
                    high_corr.append({
                        "col1": corr_matrix.columns[i],
                        "col2": corr_matrix.columns[j],
                        "correlation": round(corr_val, 3)
                    })
        
        if high_corr:
            insights.append({
                "type": "correlation",
                "message": "Found strong correlations between variables",
                "correlations": high_corr
            })
    
    return {"insights": insights}

@app.get("/3d-visualizations")
async def get_3d_visualizations():
    global current_df
    if current_df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    numeric_cols = current_df.select_dtypes(include=['number']).columns
    visualizations = []
    
    if len(numeric_cols) >= 3:
        df_clean = current_df[numeric_cols[:3]].dropna()
        
        if len(df_clean) > 0:
            x_col, y_col, z_col = numeric_cols[:3]
            
            # 3D Scatter Plot
            fig_scatter = go.Figure()
            fig_scatter.add_trace(go.Scatter3d(
                x=df_clean[x_col],
                y=df_clean[y_col], 
                z=df_clean[z_col],
                mode='markers',
                marker=dict(
                    size=6,
                    color=df_clean[z_col],
                    colorscale='Plasma',
                    showscale=True
                ),
                name='Data Points'
            ))
            
            fig_scatter.update_layout(
                title=f"3D Scatter: {x_col} vs {y_col} vs {z_col}",
                scene=dict(
                    xaxis_title=x_col,
                    yaxis_title=y_col,
                    zaxis_title=z_col,
                    camera=dict(eye=dict(x=1.5, y=1.5, z=1.5))
                ),
                margin=dict(l=0, r=0, b=0, t=40)
            )
            
            visualizations.append({
                "type": "scatter_3d",
                "title": f"3D Scatter: {x_col} vs {y_col} vs {z_col}",
                "data": {
                    "x": df_clean[x_col].tolist(),
                    "y": df_clean[y_col].tolist(),
                    "z": df_clean[z_col].tolist(),
                    "x_label": x_col,
                    "y_label": y_col,
                    "z_label": z_col
                }
            })
            
            # Surface Plot
            if len(df_clean) >= 10:
                try:
                    x_vals = df_clean[x_col].values
                    y_vals = df_clean[y_col].values
                    z_vals = df_clean[z_col].values
                    
                    # Create grid
                    x_range = np.linspace(x_vals.min(), x_vals.max(), 15)
                    y_range = np.linspace(y_vals.min(), y_vals.max(), 15)
                    X, Y = np.meshgrid(x_range, y_range)
                    
                    # Interpolate Z values
                    Z = griddata((x_vals, y_vals), z_vals, (X, Y), method='linear')
                    Z = np.nan_to_num(Z, nan=np.nanmean(Z))
                    
                    visualizations.append({
                        "type": "surface_3d",
                        "title": f"Surface Plot: {x_col} vs {y_col} vs {z_col}",
                        "data": {
                            "x": X.tolist(),
                            "y": Y.tolist(),
                            "z": Z.tolist(),
                            "x_label": x_col,
                            "y_label": y_col,
                            "z_label": z_col
                        }
                    })
                except:
                    pass
    
    return {"visualizations": visualizations}

@app.get("/export/csv")
async def export_csv():
    global current_df
    if current_df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    csv_data = current_df.to_csv(index=False)
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=data_export.csv"}
    )

@app.get("/export/pdf-enhanced")
async def export_pdf_enhanced():
    global current_df
    if current_df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    story.append(Paragraph("Enhanced Data Analysis Report", styles['Title']))
    story.append(Spacer(1, 12))
    
    # Dataset summary
    numeric_cols = current_df.select_dtypes(include=['number']).columns
    categorical_cols = current_df.select_dtypes(include=['object']).columns
    
    summary = f"""
    <b>Dataset Overview:</b><br/>
    • Total Rows: {len(current_df):,}<br/>
    • Total Columns: {len(current_df.columns)}<br/>
    • Numeric Columns: {len(numeric_cols)}<br/>
    • Categorical Columns: {len(categorical_cols)}<br/>
    • Missing Values: {current_df.isnull().sum().sum()}<br/>
    • Duplicate Rows: {current_df.duplicated().sum()}<br/>
    • Memory Usage: {current_df.memory_usage(deep=True).sum() / 1024:.1f} KB<br/>
    • Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}<br/><br/>
    
    <b>Data Quality Assessment:</b><br/>
    • Completeness: {((len(current_df) * len(current_df.columns) - current_df.isnull().sum().sum()) / (len(current_df) * len(current_df.columns)) * 100):.1f}%<br/>
    • Uniqueness: {((len(current_df) - current_df.duplicated().sum()) / len(current_df) * 100):.1f}%<br/><br/>
    
    <b>Column Information:</b><br/>
    """
    
    for col in current_df.columns[:10]:  # Limit to first 10 columns
        dtype = str(current_df[col].dtype)
        missing = current_df[col].isnull().sum()
        unique = current_df[col].nunique()
        summary += f"• {col}: {dtype}, Missing: {missing}, Unique: {unique}<br/>"
    
    story.append(Paragraph(summary, styles['Normal']))
    story.append(Spacer(1, 12))
    
    # Statistical summary for numeric columns
    if len(numeric_cols) > 0:
        story.append(Paragraph("<b>Statistical Summary (Numeric Columns):</b>", styles['Heading2']))
        desc = current_df[numeric_cols].describe()
        
        for col in numeric_cols[:5]:  # Limit to first 5 numeric columns
            col_stats = f"""
            <b>{col}:</b><br/>
            • Mean: {desc.loc['mean', col]:.2f}<br/>
            • Std: {desc.loc['std', col]:.2f}<br/>
            • Min: {desc.loc['min', col]:.2f}<br/>
            • Max: {desc.loc['max', col]:.2f}<br/><br/>
            """
            story.append(Paragraph(col_stats, styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=enhanced_data_report.pdf"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)