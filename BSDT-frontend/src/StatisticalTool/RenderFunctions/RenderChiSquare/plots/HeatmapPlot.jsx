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
    chartRef
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

    const maxLabelLength = Math.max(...variables.map(v => v.length));
    const estimatedLabelHeight = maxLabelLength * (settings.xAxisTickSize || 12) * 0.6 - 50;

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
                // For p-values: perfect match = 1.0
                // For chi2: perfect match = 0 (no difference)
                let diagonalValue = 1.0;
                if (settings.metricType === 'chi2') {
                    diagonalValue = 0;
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
            normalized = Math.min(1, Math.max(0, value));

            if (settings.colorScheme === 'redblue') {
                const r = Math.round(255 * (1 - normalized));
                const g = Math.round(100 * (1 - normalized));
                const b = Math.round(255 * normalized);
                return `rgb(${r}, ${g}, ${b})`;
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
        } else {
            const allChi2Values = matrixData
                .filter(d => !d.isDiagonal && d.value !== null)
                .map(d => d.value);
            const minVal = Math.min(...allChi2Values);
            const maxVal = Math.max(...allChi2Values);
            normalized = maxVal > minVal ? (value - minVal) / (maxVal - minVal) : 0;

            if (settings.colorScheme === 'redblue') {
                const r = Math.round(255 * normalized);
                const g = Math.round(100 * (1 - Math.abs(normalized - 0.5) * 2));
                const b = Math.round(255 * (1 - normalized));
                return `rgb(${r}, ${g}, ${b})`;
            } else if (settings.colorScheme === 'greens') {
                const intensity = Math.round(255 * normalized);
                return `rgb(${Math.round(intensity * 0.4)}, ${intensity}, ${Math.round(intensity * 0.4)})`;
            } else if (settings.colorScheme === 'reds') {
                const intensity = Math.round(255 * normalized);
                return `rgb(${intensity}, ${Math.round(intensity * 0.3)}, ${Math.round(intensity * 0.3)})`;
            } else if (settings.colorScheme === 'viridis') {
                const r = Math.round(68 + 187 * normalized);
                const g = Math.round(1 + 204 * normalized);
                const b = Math.round(84 + 171 * (1 - normalized));
                return `rgb(${r}, ${g}, ${b})`;
            }
        }

        return '#3b82f6';
    };

    // Calculate dimensions - use proper cell sizing
    const [baseWidth, baseHeight] = settings.dimensions.split('x').map(Number);

    // Calculate optimal cell size (larger for better visibility)
    const minCellSize = 60; // Minimum cell size
    const maxCellSize = 100; // Maximum cell size

    // Start with a good default cell size
    let cellSize = Math.max(minCellSize, Math.min(maxCellSize, 80));

    // Adjust based on number of variables
    cellSize = 200 / n;

    cellSize = settings.cellSize || cellSize;

    const leftMargin = 275;
    const topMargin = 50;
    const rightMargin = settings.legendOn ? 150 : 50;
    const bottomMargin = 100 + (settings.xAxisTitle ? 30 : 0) + (settings.legendOn && settings.legendPosition === 'bottom' ? 100 : 0);

    const matrixWidth = n * cellSize;
    const matrixHeight = n * cellSize;

    const width = matrixWidth + leftMargin + rightMargin;
    const height = matrixHeight + topMargin + bottomMargin;

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
                <button className="customize-btn" onClick={() => openCustomization('Heatmap')}>
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

            {/* Main Chart */}
            <div
                ref={chartRef}
                style={{
                    width: baseWidth,
                    height: baseHeight,
                    ...(settings.borderOn ? {
                        border: '1px solid black',
                        padding: '20px'
                    } : { padding: '20px' })
                }}
            >
                {/* Caption */}
                {settings.captionOn && (
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: `${settings.captionTopMargin}px`,
                            marginBottom: '0px',
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
                <div style={{ width: '100%', overflowX: 'auto', overflowY: 'auto' }}>
                    <svg
                        width={width}
                        height={height}
                        style={{ display: 'block', minWidth: '1080px', minHeight: '760px' }}
                    >
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
                                            stroke={settings.cellBorderOn ? settings.cellBorderColor : '#e5e7eb'}
                                            strokeWidth={settings.cellBorderOn ? settings.cellBorderWidth : 0.5}
                                            style={{ cursor: cell.isDiagonal ? 'default' : 'pointer' }}
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
                                            >
                                                {mapDigit(cell.value.toFixed(3))}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}

                            {/* X-axis labels */}
                            {settings.variableLabels.map((varName, idx) => (
                                <text
                                    key={`x-${idx}`}
                                    x={idx * cellSize + cellSize / 2}
                                    y={n * cellSize + 15}
                                    textAnchor="end"
                                    transform={`rotate(-90, ${idx * cellSize + cellSize / 2}, ${n * cellSize + 10})`}
                                    dominantBaseline="end"
                                    fontSize={settings.xAxisTickSize}
                                    fontFamily={settings.fontFamily}
                                    fill="#374151"
                                >
                                    {mapDigit(varName)}
                                </text>
                            ))}

                            {/* Y-axis labels */}
                            {settings.variableLabels.map((varName, idx) => (
                                <text
                                    key={`y-${idx}`}
                                    x={-10}
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
                            {settings.legendOn && settings.legendPosition === 'right' && (() => {
                                // Get legend title based on metric type
                                let legendTitle = settings.legendTitle;
                                if (settings.metricType === 'p_value') {
                                    legendTitle = language === 'bn' ? 'পি-মান' : 'P-value';
                                } else if (settings.metricType === 'chi2') {
                                    legendTitle = language === 'bn' ? 'কাই-স্কোয়ার পরিসংখ্যান' : 'Chi-Square Statistic';
                                } else if (settings.metricType === 'p_adjusted') {
                                    legendTitle = language === 'bn' ? 'সমন্বিত পি-মান' : 'Adjusted P-value';
                                }

                                // For chi2, get actual min/max values from data
                                let minLegendVal = 0;
                                let maxLegendVal = 1;
                                if (settings.metricType === 'chi2') {
                                    const allChi2Values = matrixData
                                        .filter(d => !d.isDiagonal && d.value !== null)
                                        .map(d => d.value);
                                    minLegendVal = Math.min(...allChi2Values);
                                    maxLegendVal = Math.max(...allChi2Values);
                                }

                                const legendHeight = n * cellSize;
                                const legendWidth = 20;
                                const gradientSteps = 100;

                                return (
                                    <g transform={`translate(${n * cellSize + 30}, 0)`}>
                                        <defs>
                                            <linearGradient id="legend-gradient-right" x1="0%" y1="0%" x2="0%" y2="100%">
                                                {Array.from({ length: gradientSteps + 1 }).map((_, i) => {
                                                    const ratio = i / gradientSteps;
                                                    const value = minLegendVal + ratio * (maxLegendVal - minLegendVal);
                                                    return (
                                                        <stop
                                                            key={i}
                                                            offset={`${(ratio * 100).toFixed(1)}%`}
                                                            stopColor={getColor(value, settings.metricType)}
                                                        />
                                                    );
                                                })}
                                            </linearGradient>
                                        </defs>
                                        <text
                                            x={0}
                                            y={-10}
                                            fontSize={14}
                                            fontFamily={settings.fontFamily}
                                            fontWeight="bold"
                                            fill="#374151"
                                        >
                                            {legendTitle}
                                        </text>
                                        <rect
                                            x={0}
                                            y={0}
                                            width={legendWidth}
                                            height={legendHeight}
                                            fill="url(#legend-gradient-right)"
                                            stroke="#d1d5db"
                                            strokeWidth={1}
                                        />
                                        {/* Legend ticks */}
                                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                            const yPos = ratio * legendHeight;
                                            const value = minLegendVal + ratio * (maxLegendVal - minLegendVal);
                                            const displayVal = value.toFixed(2);

                                            return (
                                                <g key={idx}>
                                                    <line
                                                        x1={legendWidth}
                                                        y1={yPos}
                                                        x2={legendWidth + 5}
                                                        y2={yPos}
                                                        stroke="#374151"
                                                        strokeWidth={1}
                                                    />
                                                    <text
                                                        x={legendWidth + 8}
                                                        y={yPos + 4}
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
                                );
                            })()}

                            {/* Legend - Bottom Position */}
                            {settings.legendOn && settings.legendPosition === 'bottom' && (() => {
                                // Get legend title based on metric type
                                let legendTitle = settings.legendTitle;
                                if (settings.metricType === 'p_value') {
                                    legendTitle = language === 'bn' ? 'পি-মান' : 'P-value';
                                } else if (settings.metricType === 'chi2') {
                                    legendTitle = language === 'bn' ? 'কাই-স্কোয়ার পরিসংখ্যান' : 'Chi-Square Statistic';
                                } else if (settings.metricType === 'p_adjusted') {
                                    legendTitle = language === 'bn' ? 'সমন্বিত পি-মান' : 'Adjusted P-value';
                                }

                                // For chi2, get actual min/max values from data
                                let minLegendVal = 0;
                                let maxLegendVal = 1;
                                if (settings.metricType === 'chi2') {
                                    const allChi2Values = matrixData
                                        .filter(d => !d.isDiagonal && d.value !== null)
                                        .map(d => d.value);
                                    minLegendVal = Math.min(...allChi2Values);
                                    maxLegendVal = Math.max(...allChi2Values);
                                }

                                const legendWidth = n * cellSize;  // ← Now matches heatmap width!
                                const legendHeight = 20;
                                const gradientSteps = 100;

                                return (
                                    <g transform={`translate(${(n * cellSize) / 2 - legendWidth / 2}, ${n * cellSize + Math.max(estimatedLabelHeight + 60, 100)})`}>
                                        <defs>
                                            <linearGradient id="legend-gradient-bottom" x1="0%" y1="0%" x2="100%" y2="0%">
                                                {Array.from({ length: gradientSteps + 1 }).map((_, i) => {
                                                    const ratio = i / gradientSteps;
                                                    const value = minLegendVal + ratio * (maxLegendVal - minLegendVal);
                                                    return (
                                                        <stop
                                                            key={i}
                                                            offset={`${(ratio * 100).toFixed(1)}%`}
                                                            stopColor={getColor(value, settings.metricType)}
                                                        />
                                                    );
                                                })}
                                            </linearGradient>
                                        </defs>
                                        <text
                                            x={legendWidth / 2}
                                            y={-10}
                                            textAnchor="middle"
                                            fontSize={14}
                                            fontFamily={settings.fontFamily}
                                            fontWeight="bold"
                                            fill="#374151"
                                        >
                                            {legendTitle}
                                        </text>
                                        <rect
                                            x={0}
                                            y={0}
                                            width={legendWidth}
                                            height={legendHeight}
                                            fill="url(#legend-gradient-bottom)"
                                            stroke="#d1d5db"
                                            strokeWidth={1}
                                        />
                                        {/* Legend ticks */}
                                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                            const xPos = ratio * legendWidth;
                                            const value = minLegendVal + ratio * (maxLegendVal - minLegendVal);
                                            const displayVal = value.toFixed(2);

                                            return (
                                                <g key={idx}>
                                                    <line
                                                        x1={xPos}
                                                        y1={legendHeight}
                                                        x2={xPos}
                                                        y2={legendHeight + 5}
                                                        stroke="#374151"
                                                        strokeWidth={1}
                                                    />
                                                    <text
                                                        x={xPos}
                                                        y={legendHeight + 18}
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
                                );
                            })()}
                        </g>
                    </svg>
                </div>
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
                        Chart Information
                    </h4>
                </div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                    {language != 'বাংলা' ? (
                        `This heatmap visualizes ${(settings.metricType === 'pvalue' || settings.metricType === 'p_value') ? 'p-values' : 'Chi-Square statistics'} for pairwise variable comparisons. Each cell represents the statistical relationship between two variables, with color intensity indicating the strength of association. Diagonal cells (self-comparisons) are excluded.`
                    ) : (
                        `এই হিটম্যাপ জোড়াওয়ারি ভেরিয়েবল তুলনার জন্য ${(settings.metricType === 'pvalue' || settings.metricType === 'p_value') ? 'পি-মান' : 'কাই-স্কয়ার পরিসংখ্যান'} চিত্রিত করে। প্রতিটি সেল দুটি ভেরিয়েবলের মধ্যে পরিসংখ্যানগত সম্পর্ক প্রতিনিধিত্ব করে, রঙের তীব্রতা সংযোগের শক্তি নির্দেশ করে। কর্ণ সেলগুলি (স্ব-তুলনা) বাদ দেওয়া হয়েছে।`
                    )}
                </p>
            </div>
        </div>
    );
};

export default HeatmapPlot;