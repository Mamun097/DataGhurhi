import React, { useState, useEffect } from 'react';
import { mapDigitIfBengali, fetchScatterData } from '../utils';

const ScatterPlot = ({
    results,
    language,
    settings,
    openCustomization,
    handleDownload,
    downloadMenuOpen,
    setDownloadMenuOpen,
    chartRef,
    onSettingsChange,
    user_id,
    df_id,
    file_url
}) => {
    const mapDigit = (text) => mapDigitIfBengali(text, language);
    
    // State for selected variables
    const [selectedX, setSelectedX] = useState(settings.xVariable || results.scatter_plot?.default_x);
    const [selectedY, setSelectedY] = useState(settings.yVariable || results.scatter_plot?.default_y);
    const [scatterData, setScatterData] = useState(results.scatter_plot?.data || []);
    const [regressionLine, setRegressionLine] = useState(results.scatter_plot?.regression_line || []);
    const [isLoading, setIsLoading] = useState(false);
    const [axisValues, setAxisValues] = useState({
        x: { min: 0, max: 1 },
        y: { min: 0, max: 1 }
    });
    
    const numericColumns = results.scatter_plot?.numeric_columns || [];
    const isAvailable = results.scatter_plot?.available;

    // Fetch new scatter data when variables change
    useEffect(() => {
        const fetchNewData = async () => {
            if (selectedX && selectedY && selectedX !== selectedY) {
                setIsLoading(true);
                try {
                    const response = await fetchScatterData(selectedX, selectedY, user_id, df_id, file_url);
                    
                    if (response?.success) {
                        setScatterData(response.scatter_data);
                        setRegressionLine(response.regression_line);
                        
                        // Update axis values for ticks
                        if (response.axis_stats) {
                            setAxisValues({
                                x: response.axis_stats.x,
                                y: response.axis_stats.y
                            });
                        }
                        
                        // Update settings with new axis titles
                        onSettingsChange({
                            ...settings,
                            xVariable: selectedX,
                            yVariable: selectedY,
                            xAxisTitle: selectedX,
                            yAxisTitle: selectedY
                        });
                    } else {
                        console.error('Failed to fetch scatter data:', response?.error);
                    }
                } catch (error) {
                    console.error('Error fetching scatter data:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        // Only fetch if variables are different from current settings
        if (selectedX !== settings.xVariable || selectedY !== settings.yVariable) {
            fetchNewData();
        }
    }, [selectedX, selectedY, user_id, df_id, file_url]);

    // Initialize with default data if available
    useEffect(() => {
        if (results.scatter_plot?.data) {
            setScatterData(results.scatter_plot.data);
            setRegressionLine(results.scatter_plot.regression_line);
            
            // Calculate initial axis values
            if (results.scatter_plot.data.length > 0) {
                const xValues = results.scatter_plot.data.map(d => d.x);
                const yValues = results.scatter_plot.data.map(d => d.y);
                setAxisValues({
                    x: {
                        min: Math.min(...xValues),
                        max: Math.max(...xValues)
                    },
                    y: {
                        min: Math.min(...yValues),
                        max: Math.max(...yValues)
                    }
                });
            }
        }
    }, [results.scatter_plot]);

    if (!isAvailable) {
        return (
            <div className="plot-placeholder" style={{ 
                padding: '40px', 
                textAlign: 'center', 
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px dashed #d1d5db'
            }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>
                    {language === 'bn' ? 'স্ক্যাটার প্লট উপলব্ধ নয়' : 'Scatter Plot Not Available'}
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                    {language === 'bn' 
                        ? 'স্ক্যাটার প্লটের জন্য কমপক্ষে দুটি সংখ্যাসূচক ভেরিয়েবল প্রয়োজন।'
                        : 'Scatter plot requires at least two numeric variables.'}
                </p>
            </div>
        );
    }

    if (scatterData.length === 0) {
        return (
            <div className="plot-placeholder">
                <p>
                    {language === 'bn' 
                        ? 'নির্বাচিত ভেরিয়েবলগুলির জন্য পর্যাপ্ত ডেটা নেই'
                        : 'Insufficient data for selected variables'}
                </p>
            </div>
        );
    }

    // Calculate dimensions
    const [baseWidth, baseHeight] = settings.dimensions ? 
        settings.dimensions.split('x').map(Number) : [800, 600];
    
    const leftMargin = settings.yAxisLeftMargin || 80;
    const rightMargin = 40;
    const topMargin = 60;
    const bottomMargin = settings.xAxisBottomMargin || 80;
    
    const plotWidth = baseWidth - leftMargin - rightMargin;
    const plotHeight = baseHeight - topMargin - bottomMargin;

    // Calculate data bounds with padding
    const xMin = axisValues.x.min;
    const xMax = axisValues.x.max;
    const yMin = axisValues.y.min;
    const yMax = axisValues.y.max;
    
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    const paddingX = xRange * 0.05;
    const paddingY = yRange * 0.05;
    
    const plotXMin = xMin - paddingX;
    const plotXMax = xMax + paddingX;
    const plotYMin = yMin - paddingY;
    const plotYMax = yMax + paddingY;
    
    const plotXRange = plotXMax - plotXMin;
    const plotYRange = plotYMax - plotYMin;

    // Scale functions
    const scaleX = (value) => leftMargin + ((value - plotXMin) / plotXRange) * plotWidth;
    const scaleY = (value) => topMargin + plotHeight - ((value - plotYMin) / plotYRange) * plotHeight;

    // Generate tick values for X and Y axes
    const generateTicks = (min, max, count = 5) => {
        const ticks = [];
        for (let i = 0; i <= count; i++) {
            const value = min + ((max - min) * i) / count;
            ticks.push(value);
        }
        return ticks;
    };

    const xTicks = generateTicks(plotXMin, plotXMax, 5);
    const yTicks = generateTicks(plotYMin, plotYMax, 5);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Header with variable selection and buttons */}
            <div style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
            }}>
                {/* Variable Selection */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500',
                            color: '#475569',
                            marginBottom: '4px'
                        }}>
                            {language === 'bn' ? 'X ভেরিয়েবল' : 'X Variable'}
                        </label>
                        <select
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                            value={selectedX}
                            onChange={(e) => setSelectedX(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">{language === 'bn' ? 'একটি ভেরিয়েবল নির্বাচন করুন' : 'Select a variable'}</option>
                            {numericColumns.map(col => (
                                <option key={`x-${col}`} value={col}>{col}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500',
                            color: '#475569',
                            marginBottom: '4px'
                        }}>
                            {language === 'bn' ? 'Y ভেরিয়েবল' : 'Y Variable'}
                        </label>
                        <select
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                            value={selectedY}
                            onChange={(e) => setSelectedY(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">{language === 'bn' ? 'একটি ভেরিয়েবল নির্বাচন করুন' : 'Select a variable'}</option>
                            {numericColumns
                                .filter(col => col !== selectedX)
                                .map(col => (
                                    <option key={`y-${col}`} value={col}>{col}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                
                {/* Buttons - Right aligned */}
                <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    alignItems: 'center',
                    flexShrink: 0 
                }}>
                    {isLoading && (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            color: '#64748b',
                            fontSize: '14px'
                        }}>
                            <div className="spinner" style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid #e2e8f0',
                                borderTopColor: '#3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                        </div>
                    )}
                    
                    {/* Customize Button */}
                    <button 
                        className="customize-btn" 
                        onClick={() => openCustomization('scatter')}
                        disabled={isLoading}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                        </svg>
                        {language === 'bn' ? 'কাস্টমাইজ' : 'Customize'}
                    </button>
                    
                    {/* Download Button with Menu */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="customize-btn"
                            onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                            disabled={isLoading}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            {language === 'bn' ? 'ডাউনলোড' : 'Download'}
                        </button>
                        {downloadMenuOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '8px',
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 100,
                                minWidth: '100px'
                            }}>
                                <button 
                                    onClick={() => handleDownload('png')}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#374151'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.backgroundColor = 'white'}
                                >
                                    PNG
                                </button>
                                <button 
                                    onClick={() => handleDownload('jpg')}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#374151',
                                        borderTop: '1px solid #f1f5f9'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.backgroundColor = 'white'}
                                >
                                    JPG
                                </button>
                                <button 
                                    onClick={() => handleDownload('pdf')}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#374151',
                                        borderTop: '1px solid #f1f5f9'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.backgroundColor = 'white'}
                                >
                                    PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div
                ref={chartRef}
                style={{
                    width: baseWidth,
                    height: baseHeight,
                    position: 'relative',
                    ...(settings.borderOn ? {
                        border: '1px solid black',
                        padding: '20px'
                    } : { padding: '20px' }),
                    backgroundColor: settings.backgroundColor || 'white'
                }}
            >
                {/* Caption */}
                {settings.captionOn && (
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: `${settings.captionTopMargin}px`,
                            marginBottom: '10px',
                            fontSize: `${settings.captionSize}px`,
                            fontFamily: settings.fontFamily,
                            fontWeight: settings.captionBold ? 'bold' : 'normal',
                            fontStyle: settings.captionItalic ? 'italic' : 'normal',
                            textDecoration: settings.captionUnderline ? 'underline' : 'none',
                            color: '#1f2937'
                        }}
                    >
                        {settings.captionText || `${selectedX} vs ${selectedY}`}
                    </div>
                )}

                {/* SVG Container */}
                <svg
                    width={baseWidth}
                    height={baseHeight}
                    style={{ display: 'block' }}
                >
                    {/* Grid Lines */}
                    {settings.gridOn && (
                        <g>
                            {/* Horizontal grid lines */}
                            {yTicks.map((value, idx) => {
                                const y = scaleY(value);
                                return (
                                    <line
                                        key={`h-grid-${idx}`}
                                        x1={leftMargin}
                                        y1={y}
                                        x2={leftMargin + plotWidth}
                                        y2={y}
                                        stroke={settings.gridColor}
                                        strokeWidth="1"
                                        strokeDasharray={settings.gridStyle}
                                        opacity={settings.gridOpacity}
                                    />
                                );
                            })}
                            
                            {/* Vertical grid lines */}
                            {xTicks.map((value, idx) => {
                                const x = scaleX(value);
                                return (
                                    <line
                                        key={`v-grid-${idx}`}
                                        x1={x}
                                        y1={topMargin}
                                        x2={x}
                                        y2={topMargin + plotHeight}
                                        stroke={settings.gridColor}
                                        strokeWidth="1"
                                        strokeDasharray={settings.gridStyle}
                                        opacity={settings.gridOpacity}
                                    />
                                );
                            })}
                        </g>
                    )}

                    {/* Plot Border */}
                    {settings.plotBorderOn && (
                        <rect
                            x={leftMargin}
                            y={topMargin}
                            width={plotWidth}
                            height={plotHeight}
                            fill="none"
                            stroke="#374151"
                            strokeWidth="1"
                        />
                    )}

                    {/* X-axis */}
                    <line
                        x1={leftMargin}
                        y1={topMargin + plotHeight}
                        x2={leftMargin + plotWidth}
                        y2={topMargin + plotHeight}
                        stroke="#374151"
                        strokeWidth="2"
                    />
                    
                    {/* Y-axis */}
                    <line
                        x1={leftMargin}
                        y1={topMargin}
                        x2={leftMargin}
                        y2={topMargin + plotHeight}
                        stroke="#374151"
                        strokeWidth="2"
                    />

                    {/* X-axis Ticks and Labels */}
                    {xTicks.map((value, idx) => {
                        const x = scaleX(value);
                        return (
                            <g key={`x-tick-${idx}`}>
                                <line
                                    x1={x}
                                    y1={topMargin + plotHeight}
                                    x2={x}
                                    y2={topMargin + plotHeight + 5}
                                    stroke="#374151"
                                    strokeWidth="1"
                                />
                                <text
                                    x={x}
                                    y={topMargin + plotHeight + 20}
                                    textAnchor="middle"
                                    fontSize={settings.xAxisTickSize || 12}
                                    fontFamily={settings.fontFamily || 'Times New Roman'}
                                    fill="#374151"
                                >
                                    {mapDigit(value.toFixed(2))}
                                </text>
                            </g>
                        );
                    })}

                    {/* Y-axis Ticks and Labels */}
                    {yTicks.map((value, idx) => {
                        const y = scaleY(value);
                        return (
                            <g key={`y-tick-${idx}`}>
                                <line
                                    x1={leftMargin - 5}
                                    y1={y}
                                    x2={leftMargin}
                                    y2={y}
                                    stroke="#374151"
                                    strokeWidth="1"
                                />
                                <text
                                    x={leftMargin - 8}
                                    y={y + 4}
                                    textAnchor="end"
                                    fontSize={settings.yAxisTickSize || 12}
                                    fontFamily={settings.fontFamily || 'Times New Roman'}
                                    fill="#374151"
                                >
                                    {mapDigit(value.toFixed(2))}
                                </text>
                            </g>
                        );
                    })}


                    {settings.showRegressionLine && regressionLine.length > 0 && (
                        <polyline
                            points={regressionLine.map(point => 
                                `${scaleX(point.x)},${scaleY(point.y)}`
                            ).join(' ')}
                            fill="none"
                            stroke={settings.regressionLineColor || '#ef4444'}
                            strokeWidth={settings.regressionLineWidth || 2}
                            strokeDasharray={settings.regressionLineStyle || "5,5"}
                        />
                    )}

                    {scatterData.map((point, idx) => (
                        <circle
                            key={idx}
                            cx={scaleX(point.x)}
                            cy={scaleY(point.y)}
                            r={settings.pointSize || 6}
                            fill={settings.pointColor || '#3b82f6'}
                            stroke={settings.pointBorderColor || '#1d4ed8'}
                            strokeWidth={settings.pointBorderWidth || 1}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}

                    {/* X-axis title */}
                    <text
                        x={leftMargin + plotWidth / 2}
                        y={topMargin + plotHeight + 50}
                        textAnchor="middle"
                        fontSize={settings.xAxisTitleSize || 16}
                        fontFamily={settings.fontFamily || 'Times New Roman'}
                        fontWeight={settings.xAxisTitleBold ? 'bold' : 'normal'}
                        fontStyle={settings.xAxisTitleItalic ? 'italic' : 'normal'}
                        textDecoration={settings.xAxisTitleUnderline ? 'underline' : 'none'}
                        fill="#374151"
                    >
                        {settings.xAxisTitle || selectedX}
                    </text>

                    {/* Y-axis title */}
                    <text
                        x={leftMargin - 50}
                        y={topMargin + plotHeight / 2}
                        textAnchor="middle"
                        transform={`rotate(-90, ${leftMargin - 50}, ${topMargin + plotHeight / 2})`}
                        fontSize={settings.yAxisTitleSize || 16}
                        fontFamily={settings.fontFamily || 'Times New Roman'}
                        fontWeight={settings.yAxisTitleBold ? 'bold' : 'normal'}
                        fontStyle={settings.yAxisTitleItalic ? 'italic' : 'normal'}
                        textDecoration={settings.yAxisTitleUnderline ? 'underline' : 'none'}
                        fill="#374151"
                    >
                        {settings.yAxisTitle || selectedY}
                    </text>
                </svg>
            </div>

            {/* Statistics Panel */}
            <div style={{
                marginTop: '24px',
                padding: '20px',
                background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecf3 100%)',
                borderRadius: '12px',
                border: '2px solid #e5e7eb'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <h4 style={{ margin: 0, color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                        {language === 'bn' ? 'স্ক্যাটার প্লট তথ্য' : 'Scatter Plot Information'}
                    </h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
                            {language === 'bn' ? 'ভেরিয়েবল' : 'Variables'}
                        </p>
                        <p style={{ margin: 0, color: '#1f2937', fontSize: '14px' }}>
                            <strong>X:</strong> {selectedX}<br />
                            <strong>Y:</strong> {selectedY}
                        </p>
                    </div>
                    <div>
                        <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
                            {language === 'bn' ? 'ডেটা পয়েন্ট' : 'Data Points'}
                        </p>
                        <p style={{ margin: 0, color: '#1f2937', fontSize: '14px' }}>
                            {scatterData.length} {language === 'bn' ? 'পর্যবেক্ষণ' : 'observations'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScatterPlot;