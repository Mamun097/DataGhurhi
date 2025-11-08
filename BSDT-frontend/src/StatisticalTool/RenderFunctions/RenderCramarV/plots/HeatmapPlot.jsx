import React from 'react';
import { mapDigitIfBengali } from '../utils';

const HeatmapPlot = ({
    results,
    language,
    settings,
    openCustomization,
    handleDownload,
    downloadMenuOpen,
    setDownloadMenuOpen,
    chartRef,
    testType = 'cramers_v'
}) => {
    const mapDigit = (text) => mapDigitIfBengali(text, language);

    if (!results.pairwise_results || results.pairwise_results.length === 0) {
        return (
            <div className="plot-placeholder">
                <p>
                    {language === 'bn' ? 'হিটম্যাপের জন্য কোনো ডেটা নেই' : 'No data available for heatmap'}
                </p>
            </div>
        );
    }

    // Build matrix from pairwise results
    const variables = results.variables || [];
    const n = variables.length;

    const resultMap = {};
    results.pairwise_results.forEach(r => {
        const key1 = `${r.variable1}-${r.variable2}`;
        const key2 = `${r.variable2}-${r.variable1}`;
        resultMap[key1] = r;
        resultMap[key2] = r;
    });

    // Build matrix data
    const matrixData = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) {
                // Diagonal cells: each variable compared with itself
                let diagonalValue = 1.0;
                if (settings.metricType === 'chi2') {
                    diagonalValue = 0;
                } else if (settings.metricType === 'cramers_v') {
                    diagonalValue = 1.0; // Perfect association with self
                } else if (settings.metricType === 'p_value' || settings.metricType === 'p_adjusted') {
                    diagonalValue = 1.0; // Perfect association
                }

                matrixData.push({
                    x: j,
                    y: i,
                    xVar: variables[j],
                    yVar: variables[i],
                    value: diagonalValue,
                    isDiagonal: true
                });
            } else {
                const key = `${variables[i]}-${variables[j]}`;
                const result = resultMap[key];

                let value = null;
                if (result) {
                    if (settings.metricType === 'p_value') {
                        value = result.p_value;
                    } else if (settings.metricType === 'chi2') {
                        value = result.chi2;
                    } else if (settings.metricType === 'p_adjusted') {
                        value = result.p_adjusted;
                    } else if (settings.metricType === 'cramers_v') {
                        value = result.cramers_v;
                    }
                }

                matrixData.push({
                    x: j,
                    y: i,
                    xVar: variables[j],
                    yVar: variables[i],
                    value: value,
                    isDiagonal: false,
                    result: result
                });
            }
        }
    }

    const getColor = (value, metricType) => {
        if (value === null) return '#f3f4f6';

        let normalized;
        if (metricType === 'p_value' || metricType === 'p_adjusted') {
            // For p-values: lower values = stronger significance = more intense color
            normalized = 1 - Math.min(1, Math.max(0, value));
        } else if (metricType === 'cramers_v') {
            // Cramer's V: higher values = stronger association = more intense color
            normalized = Math.min(1, Math.max(0, value));
        } else {
            // Chi-square: higher values = stronger association = more intense color
            const allValues = matrixData
                .filter(d => !d.isDiagonal && d.value !== null)
                .map(d => d.value);
            const minVal = Math.min(...allValues);
            const maxVal = Math.max(...allValues);
            normalized = maxVal > minVal ? (value - minVal) / (maxVal - minVal) : 0;
        }

        // Apply color scheme
        if (settings.colorScheme === 'redblue') {
            const r = Math.round(255 * (1 - normalized));
            const g = Math.round(100 * (1 - normalized));
            const b = Math.round(255 * normalized);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (settings.colorScheme === 'blues') {
            const intensity = Math.round(255 * (1 - normalized));
            return `rgb(${Math.round(intensity * 0.3)}, ${Math.round(intensity * 0.5)}, ${intensity})`;
        } else if (settings.colorScheme === 'greens') {
            const intensity = Math.round(255 * (1 - normalized));
            return `rgb(${Math.round(intensity * 0.4)}, ${intensity}, ${Math.round(intensity * 0.4)})`;
        } else if (settings.colorScheme === 'reds') {
            const intensity = Math.round(255 * (1 - normalized));
            return `rgb(${intensity}, ${Math.round(intensity * 0.3)}, ${Math.round(intensity * 0.3)})`;
        } else if (settings.colorScheme === 'viridis') {
            const t = 1 - normalized;
            const r = Math.round(68 + 187 * t);
            const g = Math.round(1 + 204 * t);
            const b = Math.round(84 + 171 * (1 - t));
            return `rgb(${r}, ${g}, ${b})`;
        }

        // Default blue scheme
        const intensity = Math.round(255 * (1 - normalized));
        return `rgb(${Math.round(intensity * 0.3)}, ${Math.round(intensity * 0.5)}, ${intensity})`;
    };

    // Calculate dimensions
    const [baseWidth, baseHeight] = settings.dimensions.split('x').map(Number);

    // Calculate optimal cell size
    const minCellSize = 40;
    const maxCellSize = 120;
    let cellSize = Math.max(minCellSize, Math.min(maxCellSize, Math.floor(600 / n)));
    cellSize = settings.cellSize || cellSize;

    const leftMargin = 200;
    const topMargin = 50;
    const rightMargin = settings.legendOn ? 120 : 50;
    const bottomMargin = 120;

    const matrixWidth = n * cellSize;
    const matrixHeight = n * cellSize;

    const width = matrixWidth + leftMargin + rightMargin;
    const height = matrixHeight + topMargin + bottomMargin;

    // Format value for display
    const formatValue = (value, metricType) => {
        if (value === null) return 'N/A';
        
        if (metricType === 'p_value' || metricType === 'p_adjusted') {
            if (value < 0.001) return value.toExponential(2);
            return value.toFixed(3);
        } else if (metricType === 'cramers_v') {
            return value.toFixed(3);
        } else if (metricType === 'chi2') {
            return value.toFixed(1);
        }
        return value.toFixed(3);
    };

    // Get legend title based on metric type
    const getLegendTitle = () => {
        if (settings.metricType === 'p_value') {
            return language === 'bn' ? 'পি-মান' : 'P-value';
        } else if (settings.metricType === 'cramers_v') {
            return language === 'bn' ? 'ক্রেমারস ভি' : "Cramer's V";
        } else if (settings.metricType === 'chi2') {
            return language === 'bn' ? 'কাই-স্কয়ার' : 'Chi-Square';
        } else if (settings.metricType === 'p_adjusted') {
            return language === 'bn' ? 'সমন্বিত পি-মান' : 'Adjusted P-value';
        }
        return settings.legendTitle;
    };

    // Get min/max values for legend
    const getLegendRange = () => {
        let minVal = 0;
        let maxVal = 1;
        
        if (settings.metricType === 'cramers_v') {
            // Cramer's V already ranges from 0 to 1
            minVal = 0;
            maxVal = 1;
        } else if (settings.metricType === 'chi2') {
            const allValues = matrixData
                .filter(d => !d.isDiagonal && d.value !== null)
                .map(d => d.value);
            minVal = Math.min(...allValues);
            maxVal = Math.max(...allValues);
        }
        // For p-values, keep 0-1 range
        
        return { minVal, maxVal };
    };

    const legendRange = getLegendRange();

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Control Buttons */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: '8px',
                zIndex: 10
            }}>
                <button className="customize-btn" onClick={() => openCustomization('heatmap')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                    </svg>
                    {language === 'bn' ? 'কাস্টমাইজ' : 'Customize'}
                </button>
                <div style={{ position: 'relative' }}>
                    <button
                        className="customize-btn"
                        onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        {language === 'bn' ? 'ডাউনলোড' : 'Download'}
                    </button>
                    {downloadMenuOpen && (
                        <div className="download-menu">
                            <button onClick={() => handleDownload('png')}>PNG</button>
                            <button onClick={() => handleDownload('jpg')}>JPG</button>
                            <button onClick={() => handleDownload('pdf')}>PDF</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chart */}
            <div
                ref={chartRef}
                style={{
                    width: '100%',
                    minHeight: '600px',
                    ...(settings.borderOn ? {
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '20px'
                    } : { padding: '20px' }),
                    backgroundColor: 'white'
                }}
            >
                {/* Caption */}
                {settings.captionOn && settings.captionText && (
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: `${settings.captionTopMargin}px`,
                            marginBottom: '20px',
                            fontSize: `${settings.captionSize}px`,
                            fontFamily: settings.fontFamily,
                            fontWeight: settings.captionBold ? 'bold' : 'normal',
                            fontStyle: settings.captionItalic ? 'italic' : 'normal',
                            textDecoration: settings.captionUnderline ? 'underline' : 'none',
                            color: '#1f2937'
                        }}
                    >
                        {settings.captionText}
                    </div>
                )}

                {/* SVG Container */}
                <div style={{ width: '100%', overflow: 'auto' }}>
                    <svg
                        width={width}
                        height={height}
                        style={{ display: 'block', minWidth: `${Math.max(800, width)}px` }}
                    >
                        <defs>
                            {/* Gradient definitions */}
                            <linearGradient id="legend-gradient-right" x1="0%" y1="0%" x2="0%" y2="100%">
                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                                    <stop
                                        key={i}
                                        offset={`${(ratio * 100).toFixed(1)}%`}
                                        stopColor={getColor(legendRange.minVal + ratio * (legendRange.maxVal - legendRange.minVal), settings.metricType)}
                                    />
                                ))}
                            </linearGradient>
                            <linearGradient id="legend-gradient-bottom" x1="0%" y1="0%" x2="100%" y2="0%">
                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                                    <stop
                                        key={i}
                                        offset={`${(ratio * 100).toFixed(1)}%`}
                                        stopColor={getColor(legendRange.minVal + ratio * (legendRange.maxVal - legendRange.minVal), settings.metricType)}
                                    />
                                ))}
                            </linearGradient>
                        </defs>

                        <g transform={`translate(${leftMargin}, ${topMargin})`}>
                            {/* Heatmap cells */}
                            {matrixData.map((cell, idx) => {
                                const x = cell.x * cellSize;
                                const y = cell.y * cellSize;
                                const fillColor = getColor(cell.value, settings.metricType);

                                return (
                                    <g key={idx}>
                                        <rect
                                            x={x}
                                            y={y}
                                            width={cellSize}
                                            height={cellSize}
                                            fill={fillColor}
                                            stroke={settings.cellBorderOn ? settings.cellBorderColor : '#ffffff'}
                                            strokeWidth={settings.cellBorderOn ? settings.cellBorderWidth : 1}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {settings.showValues && cell.value !== null && (
                                            <text
                                                x={x + cellSize / 2}
                                                y={y + cellSize / 2}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fontSize={Math.min(settings.valueSize, cellSize / 3)}
                                                fill={settings.valueColor}
                                                fontFamily={settings.fontFamily}
                                                fontWeight="500"
                                            >
                                                {mapDigit(formatValue(cell.value, settings.metricType))}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}

                            {/* X-axis labels */}
                            {(settings.variableLabels || results.variables || []).map((varName, idx) => (
                                <text
                                    key={`x-${idx}`}
                                    x={idx * cellSize + cellSize / 2}
                                    y={n * cellSize + 35}
                                    textAnchor="end"
                                    transform={`rotate(-45, ${idx * cellSize + cellSize / 2}, ${n * cellSize + 35})`}
                                    fontSize={settings.xAxisTickSize}
                                    fontFamily={settings.fontFamily}
                                    fill="#374151"
                                >
                                    {mapDigit(varName)}
                                </text>
                            ))}

                            {/* Y-axis labels */}
                            {(settings.variableLabels || results.variables || []).map((varName, idx) => (
                                <text
                                    key={`y-${idx}`}
                                    x={-15}
                                    y={idx * cellSize + cellSize / 2}
                                    textAnchor="end"
                                    dominantBaseline="middle"
                                    fontSize={settings.yAxisTickSize}
                                    fontFamily={settings.fontFamily}
                                    fill="#374151"
                                >
                                    {mapDigit(varName)}
                                </text>
                            ))}

                            {/* Legend - Right Position */}
                            {settings.legendOn && settings.legendPosition === 'right' && (
                                <g transform={`translate(${n * cellSize + 30}, 0)`}>
                                    <text
                                        x={0}
                                        y={-15}
                                        fontSize={14}
                                        fontFamily={settings.fontFamily}
                                        fontWeight="bold"
                                        fill="#374151"
                                        textAnchor="start"
                                    >
                                        {getLegendTitle()}
                                    </text>
                                    <rect
                                        x={0}
                                        y={0}
                                        width={20}
                                        height={n * cellSize}
                                        fill="url(#legend-gradient-right)"
                                        stroke="#d1d5db"
                                        strokeWidth={1}
                                    />
                                    {/* Legend ticks */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                        const yPos = ratio * (n * cellSize);
                                        const value = legendRange.minVal + ratio * (legendRange.maxVal - legendRange.minVal);
                                        const displayVal = formatValue(value, settings.metricType);

                                        return (
                                            <g key={idx}>
                                                <line
                                                    x1={20}
                                                    y1={yPos}
                                                    x2={25}
                                                    y2={yPos}
                                                    stroke="#374151"
                                                    strokeWidth={1}
                                                />
                                                <text
                                                    x={28}
                                                    y={yPos + 4}
                                                    fontSize={11}
                                                    fontFamily={settings.fontFamily}
                                                    fill="#374151"
                                                    textAnchor="start"
                                                >
                                                    {mapDigit(displayVal)}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </g>
                            )}

                            {/* Legend - Bottom Position */}
                            {settings.legendOn && settings.legendPosition === 'bottom' && (
                                <g transform={`translate(0, ${n * cellSize + 60})`}>
                                    <text
                                        x={n * cellSize / 2}
                                        y={-10}
                                        textAnchor="middle"
                                        fontSize={14}
                                        fontFamily={settings.fontFamily}
                                        fontWeight="bold"
                                        fill="#374151"
                                    >
                                        {getLegendTitle()}
                                    </text>
                                    <rect
                                        x={0}
                                        y={0}
                                        width={n * cellSize}
                                        height={20}
                                        fill="url(#legend-gradient-bottom)"
                                        stroke="#d1d5db"
                                        strokeWidth={1}
                                    />
                                    {/* Legend ticks */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                        const xPos = ratio * (n * cellSize);
                                        const value = legendRange.minVal + ratio * (legendRange.maxVal - legendRange.minVal);
                                        const displayVal = formatValue(value, settings.metricType);

                                        return (
                                            <g key={idx}>
                                                <line
                                                    x1={xPos}
                                                    y1={20}
                                                    x2={xPos}
                                                    y2={25}
                                                    stroke="#374151"
                                                    strokeWidth={1}
                                                />
                                                <text
                                                    x={xPos}
                                                    y={40}
                                                    textAnchor="middle"
                                                    fontSize={11}
                                                    fontFamily={settings.fontFamily}
                                                    fill="#374151"
                                                >
                                                    {mapDigit(displayVal)}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </g>
                            )}
                        </g>
                    </svg>
                </div>
            </div>

            {/* Info Panel */}
            <div style={{
                marginTop: '24px',
                padding: '20px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '12px',
                border: '2px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <h4 style={{ margin: 0, color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                        {language === 'bn' ? 'চার্ট তথ্য' : 'Chart Information'}
                    </h4>
                </div>
                <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                    {language === 'bn' ? (
                        `এই হিটম্যাপ ভেরিয়েবল জোড়ার মধ্যে ${settings.metricType === 'cramers_v' ? 'ক্রেমারস ভি মান' : settings.metricType === 'p_value' ? 'পি-মান' : settings.metricType === 'p_adjusted' ? 'সমন্বিত পি-মান' : 'কাই-স্কয়ার পরিসংখ্যান'} প্রদর্শন করে। প্রতিটি সেল দুটি ভেরিয়েবলের মধ্যে সম্পর্কের শক্তি নির্দেশ করে, যেখানে রঙের তীব্রতা মানের মাত্রা দেখায়। কর্ণ সেলগুলি (নিজের সাথে তুলনা) পূর্ণ সম্পর্ক দেখায়।`
                    ) : (
                        `This heatmap displays ${settings.metricType === 'cramers_v' ? "Cramer's V values" : settings.metricType === 'p_value' ? 'p-values' : settings.metricType === 'p_adjusted' ? 'adjusted p-values' : 'Chi-Square statistics'} for variable pairs. Each cell represents the strength of association between two variables, with color intensity indicating the value magnitude. Diagonal cells (self-comparisons) show perfect association.`
                    )}
                </p>
                {settings.metricType === 'cramers_v' && (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#dbeafe', borderRadius: '8px' }}>
                        <p style={{ margin: 0, color: '#1e40af', fontSize: '13px', lineHeight: '1.5' }}>
                            <strong>{language === 'bn' ? 'ক্রেমারস ভি ব্যাখ্যা:' : 'Cramer\'s V Interpretation:'}</strong><br/>
                            {language === 'bn' ? 
                                '০-০.১: নগণ্য সম্পর্ক, ০.১-০.৩: দুর্বল সম্পর্ক, ০.৩-০.৫: মধ্যম সম্পর্ক, ০.৫-১: শক্তিশালী সম্পর্ক' :
                                '0-0.1: Negligible, 0.1-0.3: Weak, 0.3-0.5: Moderate, 0.5-1: Strong association'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeatmapPlot;