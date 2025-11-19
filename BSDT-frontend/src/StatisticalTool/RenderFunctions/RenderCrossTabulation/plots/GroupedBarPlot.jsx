import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const GroupedBarPlot = ({
    results,
    language = 'en',
    settings: propSettings,
    onSettingsChange,
    openCustomization,
    handleDownload,
    downloadMenuOpen,
    setDownloadMenuOpen,
    chartRef
}) => {
    const t = (en, bn) => (language === 'bn' ? bn : en);

    // Default settings if not provided
    const getDefaultSettings = () => {
        const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

        return {
            dimensions: '800x600',
            fontFamily: 'Times New Roman',
            captionOn: false,
            captionText: '',
            captionSize: 22,
            captionBold: false,
            captionItalic: false,
            captionUnderline: false,
            captionTopMargin: 30,
            xAxisTitle: 'Variables',
            yAxisTitle: 'Chi-Square Statistic',
            metricType: 'chi2', // 'chi2' or 'pvalue'
            xAxisTitleSize: 16,
            yAxisTitleSize: 16,
            xAxisTitleBold: false,
            xAxisTitleItalic: false,
            xAxisTitleUnderline: false,
            yAxisTitleBold: false,
            yAxisTitleItalic: false,
            yAxisTitleUnderline: false,
            xAxisTickSize: 14,
            yAxisTickSize: 14,
            xAxisBottomMargin: -50,
            yAxisLeftMargin: 0,
            yAxisMin: '',
            yAxisMax: '',
            gridOn: true,
            gridStyle: '3 3',
            gridColor: 'gray',
            gridOpacity: 0.3,
            borderOn: false,
            plotBorderOn: false,
            barBorderOn: false,
            dataLabelsOn: true,
            elementWidth: 0.8,
            legendOn: true,
            categoryColors: defaultColors
        };
    };

    const settings = propSettings || getDefaultSettings();

    // Update Y-axis title based on metric type
    let yAxisTitle = settings.yAxisTitle;
    if (settings.metricType === 'pvalue' || settings.metricType === 'p_value') {
        yAxisTitle = 'P-Value';
    } else if (settings.metricType === 'frequency') {
        yAxisTitle = 'Frequency';
    } else {
        yAxisTitle = 'Chi-Square Statistic';
    }

    // Update settings with the correct yAxisTitle
    const updatedSettings = {
        ...settings,
        yAxisTitle: yAxisTitle
    };

    // Generate chart data - RESTRUCTURED to create separate data points for each comparison
    const generateChartData = () => {
        // Validate results structure
        if (!results || !results.pairwise_results || !Array.isArray(results.pairwise_results) || results.pairwise_results.length === 0) {
            return { data: [], comparisonVars: [] };
        }

        // Get original variable names from the results
        const originalVars = [...new Set(results.pairwise_results.flatMap(pair => [
            String(pair.variable1),
            String(pair.variable2)
        ]))].filter(Boolean);

        // Create mapping from original names to custom labels (if they exist)
        const varToLabel = new Map();
        const labelToVar = new Map();

        if (settings.variableLabels && Array.isArray(settings.variableLabels)) {
            // If we have custom labels, map them
            originalVars.forEach((originalVar, index) => {
                const customLabel = settings.variableLabels[index] || originalVar;
                varToLabel.set(originalVar, customLabel);
                labelToVar.set(customLabel, originalVar);
            });
        } else {
            // No custom labels, use original names
            originalVars.forEach(originalVar => {
                varToLabel.set(originalVar, originalVar);
                labelToVar.set(originalVar, originalVar);
            });
        }

        const variableList = Array.from(varToLabel.values());

        // Determine which metric to use
        const metricType = settings.metricType || 'chi2';

        // Create a lookup map for metric values (chi2 or pvalue)
        const metricMap = new Map();
        results.pairwise_results.forEach(pair => {
            if (!pair || !pair.variable1 || !pair.variable2) {
                return;
            }

            const var1 = String(pair.variable1);
            const var2 = String(pair.variable2);

            // Get the appropriate metric value based on metricType
            // Support both 'pvalue' and 'p_value' for compatibility

            // In generateChartData function, add frequency support
            let metricValue;
            if (metricType === 'pvalue' || metricType === 'p_value') {
                metricValue = typeof pair.p_value === 'number' && !isNaN(pair.p_value) ? pair.p_value : 0;
            } else if (metricType === 'frequency') {
                // Use total observations for frequency
                metricValue = typeof pair.n === 'number' && !isNaN(pair.n) ? pair.n : 0;
            } else {
                metricValue = typeof pair.chi2 === 'number' && !isNaN(pair.chi2) ? pair.chi2 : 0;
            }

            const key1 = `${var1}|||${var2}`;
            const key2 = `${var2}|||${var1}`;
            metricMap.set(key1, metricValue);
            metricMap.set(key2, metricValue);
        });

        // NEW APPROACH: Build data where each row has only the comparisons that exist
        const chartData = variableList.map(primaryLabel => {
            const dataPoint = { name: primaryLabel };
            const primaryOriginal = labelToVar.get(primaryLabel);

            // Only add keys for OTHER variables (not self)
            variableList.forEach(comparisonLabel => {
                if (primaryLabel !== comparisonLabel) {
                    const comparisonOriginal = labelToVar.get(comparisonLabel);
                    // Use ORIGINAL variable names to lookup in metricMap
                    const key = `${primaryOriginal}|||${comparisonOriginal}`;
                    const value = metricMap.get(key) || 0;
                    // Use CUSTOM LABEL as the key for the chart
                    dataPoint[comparisonLabel] = value;
                }
            });

            return dataPoint;
        });

        // Get list of comparison variables (all except when comparing to self)
        const comparisonVars = variableList;

        return {
            data: chartData,
            comparisonVars: comparisonVars
        };
    };

    const { data: chartData, comparisonVars } = generateChartData();

    // Debug logging
    console.log('=== DEBUG INFO ===');
    console.log('Raw pairwise results:', results?.pairwise_results);
    console.log('Chart Data:', chartData);
    console.log('Comparison Vars:', comparisonVars);
    console.log('Metric Type:', settings.metricType);
    console.log('==================');

    const getDimensions = (dimensionString) => {
        const [width, height] = dimensionString.split('x').map(Number);
        return {
            width: !isNaN(width) ? width : 800,
            height: !isNaN(height) ? height - 100 : 500,
            originalWidth: !isNaN(width) ? width : 800,
            originalHeight: !isNaN(height) ? height : 600
        };
    };

    const getTextStyle = (bold, italic, underline, fontFamily) => ({
        fontWeight: bold ? 'bold' : 'normal',
        fontStyle: italic ? 'italic' : 'normal',
        textDecoration: underline ? 'underline' : 'none',
        fontFamily: fontFamily
    });

    const getCaptionStyle = (settings) => ({
        fontSize: settings.captionSize,
        ...getTextStyle(settings.captionBold, settings.captionItalic, settings.captionUnderline, settings.fontFamily),
        fill: '#374151',
        textAnchor: 'middle'
    });

    const getYAxisDomain = (settings) => {
        if (settings.yAxisMin !== '' && settings.yAxisMax !== '') {
            const min = parseFloat(settings.yAxisMin);
            const max = parseFloat(settings.yAxisMax);
            if (!isNaN(min) && !isNaN(max) && min < max) {
                return [min, max];
            }
        }
        return ['auto', 'auto'];
    };

    const getGridStroke = (gridColor) => gridColor === 'black' ? '#000000' : '#e5e7eb';

    const formatValue = (value) => {
        if (typeof value !== 'number' || isNaN(value)) return '0';

        const metricType = settings.metricType || 'chi2';

        if (metricType === 'frequency') {
            // For frequency values, use integer formatting
            return Math.round(value).toString();
        }

        // For p-values, use more decimal places
        // Support both 'pvalue' and 'p_value' for compatibility
        if (metricType === 'pvalue' || metricType === 'p_value') {
            // For very small p-values
            if (value < 0.0001 && value !== 0) {
                return value.toExponential(2);
            }
            // For normal p-values (0-1 range)
            return value.toFixed(2);
        }

        // For Chi-Square values
        // For very small values
        if (Math.abs(value) < 0.01 && value !== 0) {
            return value.toExponential(2);
        }
        // For normal values
        if (Math.abs(value) < 1000) {
            return value.toFixed(2);
        }
        // For large values
        return value.toFixed(1);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    minWidth: '200px'
                }}>
                    <p style={{
                        margin: '0 0 12px 0',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        color: '#1f2937',
                        borderBottom: '2px solid #e5e7eb',
                        paddingBottom: '8px'
                    }}>
                        {label}
                    </p>
                    {payload.map((entry, index) => {
                        // Skip undefined values
                        if (entry.value === undefined) return null;

                        return (
                            <div key={`tooltip-${index}`} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                margin: '8px 0',
                                gap: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: entry.color,
                                        borderRadius: '3px'
                                    }} />
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                        {entry.name}:
                                    </span>
                                </div>
                                <span style={{
                                    fontWeight: '600',
                                    color: entry.color,
                                    fontSize: '14px'
                                }}>
                                    {formatValue(entry.value)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => {
        if (!payload || !Array.isArray(payload) || payload.length === 0) {
            return null;
        }

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '8px 0',
                marginBottom: '12px'
            }}>
                {payload.map((entry, index) => (
                    <div key={`legend-${index}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        background: '#f9fafb',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: entry.color,
                            borderRadius: '2px'
                        }} />
                        <span style={{
                            fontSize: '11px',
                            color: '#374151',
                            fontWeight: '500',
                            fontFamily: settings.fontFamily
                        }}>
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const { height } = getDimensions(settings.dimensions);
    const yDomain = getYAxisDomain(settings);

    if (chartData.length === 0) {
        return (
            <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                color: 'white'
            }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>
                    {t('No Data Available', 'কোনো ডেটা উপলব্ধ নেই')}
                </h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                    {t('Please run the Chi-Square test first', 'প্রথমে কাই-স্কয়ার পরীক্ষা চালান')}
                </p>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Control Buttons */}
            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                <button className="customize-btn" onClick={() => openCustomization('grouped')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                    </svg>
                    Customize
                </button>
                <div style={{ position: 'relative' }}>
                    <button
                        className="customize-btn"
                        onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Download
                    </button>
                    {downloadMenuOpen && (
                        <div className="download-menu">
                            <button onClick={() => handleDownload('png')}>PNG</button>
                            <button onClick={() => handleDownload('jpg')}>JPG</button>
                            <button onClick={() => handleDownload('jpeg')}>JPEG</button>
                            <button onClick={() => handleDownload('pdf')}>PDF</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Container */}
            <div
                ref={chartRef}
                style={{position: 'relative'}}
            >
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        data={chartData}
                        margin={{
                            top: settings.captionOn ? 50 : (settings.legendOn ? 40 : 30),
                            right: 20,
                            left: 20,
                            bottom: 50
                        }}
                        style={settings.borderOn ? { border: '1px solid #1f2937' } : {}}
                        barGap={4}
                        barCategoryGap="20%"
                    >
                        {settings.captionOn && settings.captionText && (
                            <text
                                x="50%"
                                y={settings.captionTopMargin}
                                style={getCaptionStyle(settings)}
                            >
                                {settings.captionText}
                            </text>
                        )}

                        {settings.legendOn && (
                            <Legend
                                content={<CustomLegend />}
                                verticalAlign="top"
                                wrapperStyle={{ paddingTop: '0px' }}
                            />
                        )}

                        {settings.gridOn && (
                            <CartesianGrid
                                strokeDasharray={settings.gridStyle}
                                stroke={getGridStroke(settings.gridColor)}
                                strokeOpacity={settings.gridOpacity}
                                vertical={false}
                            />
                        )}

                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                            tick={{
                                fill: '#1f2937',
                                fontSize: settings.xAxisTickSize,
                                fontFamily: settings.fontFamily,
                                fontWeight: '500'
                            }}
                            label={{
                                value: settings.xAxisTitle,
                                position: 'insideBottom',
                                offset: settings.xAxisBottomMargin,
                                style: {
                                    fontSize: settings.xAxisTitleSize,
                                    fill: '#1f2937',
                                    ...getTextStyle(
                                        settings.xAxisTitleBold,
                                        settings.xAxisTitleItalic,
                                        settings.xAxisTitleUnderline,
                                        settings.fontFamily
                                    )
                                }
                            }}
                            axisLine={{
                                strokeWidth: (settings.plotBorderOn || settings.borderOn) ? 1 : 2,
                                stroke: (settings.plotBorderOn || settings.borderOn) ? '#000000' : '#9ca3af'
                            }}
                            tickLine={{
                                stroke: '#9ca3af',
                                strokeWidth: 1
                            }}
                        />


                        <YAxis
                            domain={yDomain}
                            tick={{
                                fill: '#1f2937',
                                fontSize: updatedSettings.yAxisTickSize,
                                fontFamily: updatedSettings.fontFamily,
                                fontWeight: '500'
                            }}
                            label={{
                                value: updatedSettings.yAxisTitle,  // Use updated yAxisTitle here
                                angle: -90,
                                position: 'insideLeft',
                                offset: updatedSettings.yAxisLeftMargin,
                                style: {
                                    fontSize: updatedSettings.yAxisTitleSize,
                                    fill: '#1f2937',
                                    ...getTextStyle(
                                        updatedSettings.yAxisTitleBold,
                                        updatedSettings.yAxisTitleItalic,
                                        updatedSettings.yAxisTitleUnderline,
                                        updatedSettings.fontFamily
                                    )
                                }
                            }}
                            axisLine={{
                                strokeWidth: (updatedSettings.plotBorderOn || updatedSettings.borderOn) ? 1 : 2,
                                stroke: (updatedSettings.plotBorderOn || updatedSettings.borderOn) ? '#000000' : '#9ca3af'
                            }}
                            tickLine={{
                                stroke: '#9ca3af',
                                strokeWidth: 1
                            }}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />

                        {comparisonVars.map((compVar, index) => (
                            <Bar
                                key={`bar-${compVar}-${index}`}
                                dataKey={compVar}
                                fill={settings.categoryColors[index % settings.categoryColors.length]}
                                maxBarSize={60 * settings.elementWidth}
                                stroke={settings.barBorderOn ? '#1f2937' : 'none'}
                                strokeWidth={settings.barBorderOn ? 2 : 0}
                                label={settings.dataLabelsOn ? {
                                    position: 'top',
                                    fill: '#1f2937',
                                    // angle: settings.variableLabels.length>5?-45:0,
                                    marginTop: 20,
                                    fontFamily: settings.fontFamily,
                                    fontSize: 12,
                                    fontWeight: '600',
                                    formatter: (value) => (value !== null && value !== undefined) ? formatValue(value) : ''
                                } : false}
                            >
                                {chartData.map((entry, idx) => {
                                    const value = entry[compVar];
                                    // Don't render bar for null values (self-comparisons)
                                    return (
                                        <Cell
                                            key={`cell-${idx}`}
                                            fill={value !== null ? settings.categoryColors[index % settings.categoryColors.length] : 'rgba(0,0,0,0)'}
                                            fillOpacity={value !== null ? 1 : 0}
                                            stroke="none"
                                        />
                                    );
                                })}
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>

                {/* PLOT BORDER OVERLAY */}
                {settings.plotBorderOn && (
                    <div style={{
                        position: 'absolute',
                        top: settings.captionOn && settings.legendOn ? '105px' :
                            settings.captionOn ? '50px' :
                                settings.legendOn ? '95px' : '30px',
                        // top: settings.captionOn ? '70px' : (settings.legendOn ? '115px' : '50px'),
                        left: '80px',
                        right: '20px',
                        bottom: '130px',
                        borderTop: '1px solid #000000',
                        borderRight: '1px solid #000000',
                        pointerEvents: 'none',
                        zIndex: 0
                    }} />
                )}
            </div>

            {/* Info Panel */}
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
                        {t('Chart Information', 'চার্ট তথ্য')}
                    </h4>
                </div>

                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                    {t(
                        `This grouped bar chart displays ${(settings.metricType === 'pvalue' || settings.metricType === 'p_value') ? 'p-values' : (settings.metricType === 'frequency' ? 'frequencies' : 'Chi-Square statistics')} across different variable comparisons. Each group of bars represents a primary variable, with individual bars showing its relationship strength with other variables. Self-comparisons are automatically excluded.`,
                        `এই গ্রুপড বার চার্টটি বিভিন্ন ভেরিয়েবল তুলনায় ${(settings.metricType === 'pvalue' || settings.metricType === 'p_value') ? 'পি-মান' : (settings.metricType === 'frequency' ? 'ফ্রিকোয়েন্সি' : 'কাই-স্কয়ার পরিসংখ্যান')} প্রদর্শন করে। প্রতিটি বার গ্রুপ একটি প্রাথমিক ভেরিয়েবল প্রতিনিধিত্ব করে, পৃথক বারগুলি অন্যান্য ভেরিয়েবলের সাথে এর সম্পর্কের শক্তি দেখায়। স্ব-তুলনা স্বয়ংক্রিয়ভাবে বাদ দেওয়া হয়।`
                    )}
                </p>                
            </div>
        </div>
    );
};

export default GroupedBarPlot;