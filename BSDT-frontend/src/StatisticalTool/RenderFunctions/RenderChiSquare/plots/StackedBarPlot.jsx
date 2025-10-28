import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const StackedBarPlot = ({
    results,
    language,
    settings: propSettings,
    onSettingsChange,
    openCustomization,
    handleDownload,
    downloadMenuOpen,
    setDownloadMenuOpen,
    chartRef
}) => {
    const t = (en, bn) => (language === 'bn' ? bn : en);

    // Default settings
    const getDefaultSettings = () => {
        const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

        return {
            dimensions: '1000x700',
            fontFamily: 'Times New Roman',
            captionOn: false,
            captionText: '',
            captionSize: 22,
            captionBold: false,
            captionItalic: false,
            captionUnderline: false,
            captionTopMargin: 30,
            xAxisTitle: 'Variables',
            yAxisTitle: 'Proportion (%)',
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
            yAxisMin: '0',
            yAxisMax: '100',
            gridOn: true,
            gridStyle: '3 3',
            gridColor: 'gray',
            gridOpacity: 0.3,
            borderOn: false,
            plotBorderOn: false,
            barBorderOn: false,
            dataLabelsOn: true,
            labelType: 'percentage',
            labelSize: 11,
            labelColor: 'white',
            labelBold: true,
            barWidth: 0.7,
            elementWidth: 0.7,
            legendOn: true,
            legendPosition: 'right',
            legendTitle: 'Categories',
            colorScheme: 'categorical',
            categoryColors: defaultColors,
            variableLabels: [],
            orientation: 'vertical',
            stackMode: 'percentage',
            showBaseline: true,
            baselineColor: '#1f2937',
            baselineWidth: 2,
            selectedPair: null,
            animationDuration: 800,
            barRadius: 6,
            showGridHorizontal: true,
            showGridVertical: false,
            categoryLabels: []
        };
    };

    const settings = propSettings || getDefaultSettings();

    // Generate stacked bar data from Chi-Square results
    const generateStackedBarData = () => {
        if (!results?.pairwise_results || results.pairwise_results.length === 0) {
            return { data: [], categories: [] };
        }

        let selectedResult;
        if (settings.selectedPair) {
            selectedResult = results.pairwise_results.find(
                r => `${r.variable1}-${r.variable2}` === settings.selectedPair
            );
        }

        if (!selectedResult) {
            selectedResult = results.pairwise_results.find(r => r.p_value < 0.05)
                || results.pairwise_results[0];
        }

        const var1Categories = selectedResult.var1_categories || ['Category A', 'Category B', 'Category C', 'Category D'];
        const var2Categories = selectedResult.var2_categories || ['Type 1', 'Type 2', 'Type 3'];

        const contingencyTable = selectedResult.contingency_table || [
            [45, 30, 25],
            [35, 40, 25],
            [20, 30, 50],
            [40, 35, 25]
        ];

        // Use custom variable labels if available
        const displayVar1Categories = settings.variableLabels && settings.variableLabels.length >= var1Categories.length
            ? settings.variableLabels.slice(0, var1Categories.length)
            : var1Categories;

        const chartData = displayVar1Categories.map((category, i) => {
            const row = contingencyTable[i];
            const rowTotal = row.reduce((a, b) => a + b, 0);

            const dataPoint = { name: category };

            if (settings.stackMode === 'percentage') {
                var2Categories.forEach((cat, j) => {
                    dataPoint[cat] = rowTotal > 0 ? ((row[j] / rowTotal) * 100) : 0;
                    dataPoint[`${cat}_count`] = row[j];
                });
            } else {
                var2Categories.forEach((cat, j) => {
                    dataPoint[cat] = row[j];
                });
            }

            return dataPoint;
        });

        return {
            data: chartData,
            categories: var2Categories,
            variable1: selectedResult.variable1,
            variable2: selectedResult.variable2,
            pValue: selectedResult.p_value,
            chi2: selectedResult.chi2
        };
    };

    const chartData = generateStackedBarData();

    const getColorScheme = (scheme) => {
        const schemes = {
            categorical: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
            pastel: ['#93c5fd', '#86efac', '#fcd34d', '#fca5a5', '#c4b5fd', '#f9a8d4', '#5eead4', '#fdba74'],
            vibrant: ['#1e40af', '#047857', '#b45309', '#991b1b', '#6b21a8', '#9f1239', '#0f766e', '#c2410c'],
            professional: ['#0f172a', '#1e40af', '#0891b2', '#059669', '#7c3aed', '#c026d3', '#dc2626', '#ea580c'],
            ocean: ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#a3e635', '#bef264'],
            sunset: ['#dc2626', '#ea580c', '#f59e0b', '#fbbf24', '#fcd34d', '#fde047', '#fef08a', '#fef3c7'],
            earth: ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde047']
        };
        return schemes[scheme] || schemes.categorical;
    };

    const colors = settings.colorScheme === 'custom'
        ? settings.categoryColors
        : getColorScheme(settings.colorScheme);

    const getDimensions = (dimensionString) => {
        const [width, height] = dimensionString.split('x').map(Number);
        return { width, height: height - 100, originalWidth: width, originalHeight: height };
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
        if (settings.stackMode === 'percentage') {
            return [0, 100];
        }
        if (settings.yAxisMin !== '' && settings.yAxisMax !== '') {
            const min = parseFloat(settings.yAxisMin);
            const max = parseFloat(settings.yAxisMax);
            if (!isNaN(min) && !isNaN(max)) {
                return [min, max];
            }
        }
        return ['auto', 'auto'];
    };

    const getGridStroke = (gridColor) => gridColor === 'black' ? '#000000' : '#e5e7eb';

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const total = payload.reduce((sum, entry) => {
                if (settings.stackMode === 'percentage') {
                    return sum + (entry.payload[`${entry.name}_count`] || 0);
                }
                return sum + entry.value;
            }, 0);

            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    minWidth: '200px',
                    fontFamily: settings.fontFamily
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
                    {payload.reverse().map((entry, index) => {
                        const count = settings.stackMode === 'percentage'
                            ? entry.payload[`${entry.name}_count`]
                            : entry.value;
                        const percentage = ((count / total) * 100).toFixed(1);

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
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{
                                        fontWeight: '600',
                                        color: entry.color,
                                        fontSize: '14px'
                                    }}>
                                        {count}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                        ({percentage}%)
                                    </span>
                                </div>
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

        if (settings.legendPosition === 'right') {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    {settings.legendTitle && (
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#1f2937',
                            marginBottom: '4px',
                            fontFamily: settings.fontFamily,
                            borderBottom: '2px solid #e5e7eb',
                            paddingBottom: '8px'
                        }}>
                            {settings.legendTitle}
                        </div>
                    )}
                    {payload.map((entry, index) => (
                        <div key={`legend-${index}`} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 8px',
                            background: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{
                                width: '14px',
                                height: '14px',
                                backgroundColor: entry.color,
                                borderRadius: '3px'
                            }} />
                            <span style={{
                                fontSize: '13px',
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
        }

        // Bottom or Top position
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '8px 0'
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

    const renderCustomLabel = (props) => {
        const { x, y, width, height, value, index, name } = props;

        if (!settings.dataLabelsOn || height < 25 || width < 40) {
            return null;
        }

        let labelText = '';
        if (settings.labelType === 'percentage') {
            labelText = `${value.toFixed(1)}%`;
        } else if (settings.labelType === 'count') {
            const count = props.payload[`${name}_count`] || value;
            labelText = `${Math.round(count)}`;
        } else if (settings.labelType === 'both') {
            const count = props.payload[`${name}_count`] || value;
            labelText = `${Math.round(count)} (${value.toFixed(1)}%)`;
        }

        return (
            <text
                x={x + width / 2}
                y={y + height / 2}
                fill={settings.labelColor}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                    fontSize: settings.labelSize,
                    fontWeight: settings.labelBold ? '700' : '600',
                    fontFamily: settings.fontFamily,
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
            >
                {labelText}
            </text>
        );
    };

    const { height } = getDimensions(settings.dimensions);
    const yDomain = getYAxisDomain(settings);

    if (!chartData.data || chartData.data.length === 0) {
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

    // Calculate chart margins based on settings
    const getChartMargins = () => {
        const baseMargin = {
            top: 30,
            right: 20,
            left: 60,
            bottom: 80
        };

        if (settings.captionOn) {
            baseMargin.top += settings.captionTopMargin + settings.captionSize;
        }

        if (settings.legendOn && settings.legendPosition === 'top') {
            baseMargin.top += 40;
        }

        if (settings.legendOn && settings.legendPosition === 'bottom') {
            baseMargin.bottom += 40;
        }

        if (settings.legendOn && settings.legendPosition === 'right') {
            baseMargin.right = 180;
        }

        return baseMargin;
    };

    const chartMargins = getChartMargins();

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Control Buttons */}
            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                <button className="customize-btn" onClick={() => openCustomization('stacked')}>
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
            <div ref={chartRef} style={{ position: 'relative' }}>
                {/* Statistics Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    borderRadius: '12px',
                    border: '2px solid #bae6fd'
                }}>
                    <div>
                        <h4 style={{
                            margin: '0 0 4px 0',
                            fontSize: '14px',
                            color: '#0369a1',
                            fontWeight: '600',
                            fontFamily: settings.fontFamily
                        }}>
                            {t('Analyzing', 'বিশ্লেষণ করা হচ্ছে')}: {chartData.variable1} × {chartData.variable2}
                        </h4>
                        <p style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#0c4a6e',
                            fontFamily: settings.fontFamily
                        }}>
                            {t('Distribution of categories across variables', 'ভেরিয়েবল জুড়ে ক্যাটাগরির বিতরণ')}
                        </p>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            padding: '8px 16px',
                            background: 'white',
                            borderRadius: '10px',
                            border: '2px solid #0ea5e9'
                        }}>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#0369a1',
                                fontFamily: settings.fontFamily
                            }}>
                                {chartData.chi2.toFixed(2)}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: '#0c4a6e',
                                fontWeight: '600'
                            }}>
                                χ² {t('Statistic', 'পরিসংখ্যান')}
                            </div>
                        </div>
                        <div style={{
                            textAlign: 'center',
                            padding: '8px 16px',
                            background: chartData.pValue < 0.05 ? '#dcfce7' : '#fee2e2',
                            borderRadius: '10px',
                            border: `2px solid ${chartData.pValue < 0.05 ? '#16a34a' : '#dc2626'}`
                        }}>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: chartData.pValue < 0.05 ? '#15803d' : '#991b1b',
                                fontFamily: settings.fontFamily
                            }}>
                                {chartData.pValue.toFixed(4)}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: chartData.pValue < 0.05 ? '#166534' : '#7f1d1d',
                                fontWeight: '600'
                            }}>
                                p-{t('value', 'মান')}
                            </div>
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        data={chartData.data}
                        margin={chartMargins}
                        style={settings.borderOn ? { border: '2px solid #1f2937' } : {}}
                        barGap={4}
                        barCategoryGap={`${(1 - (settings.barWidth || settings.elementWidth)) * 100}%`}
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
                                verticalAlign={settings.legendPosition === 'bottom' ? 'bottom' : 'top'}
                                align={settings.legendPosition === 'right' ? 'right' : 'center'}
                                wrapperStyle={{
                                    paddingTop: settings.legendPosition === 'top' ? '0px' : undefined,
                                    paddingBottom: settings.legendPosition === 'bottom' ? '0px' : undefined
                                }}
                                layout={settings.legendPosition === 'right' ? 'vertical' : 'horizontal'}
                            />
                        )}

                        {settings.gridOn && (
                            <CartesianGrid
                                strokeDasharray={settings.gridStyle}
                                stroke={getGridStroke(settings.gridColor)}
                                strokeOpacity={settings.gridOpacity}
                                vertical={settings.showGridVertical}
                                horizontal={settings.showGridHorizontal}
                            />
                        )}

                        {settings.showBaseline && (
                            <ReferenceLine
                                y={0}
                                stroke={settings.baselineColor}
                                strokeWidth={settings.baselineWidth}
                                strokeDasharray="0"
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
                                fontSize: settings.yAxisTickSize,
                                fontFamily: settings.fontFamily,
                                fontWeight: '500'
                            }}
                            label={{
                                value: settings.yAxisTitle,
                                angle: -90,
                                position: 'insideLeft',
                                offset: settings.yAxisLeftMargin,
                                style: {
                                    fontSize: settings.yAxisTitleSize,
                                    fill: '#1f2937',
                                    ...getTextStyle(
                                        settings.yAxisTitleBold,
                                        settings.yAxisTitleItalic,
                                        settings.yAxisTitleUnderline,
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
                            tickFormatter={(value) => settings.stackMode === 'percentage' ? `${value}%` : value}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />

                        {chartData.categories.map((category, index) => (
                            <Bar
                                key={category}
                                dataKey={category}
                                stackId="stack"
                                fill={colors[index % colors.length]}
                                radius={index === chartData.categories.length - 1 ? [settings.barRadius, settings.barRadius, 0, 0] : [0, 0, 0, 0]}
                                maxBarSize={120}
                                label={renderCustomLabel}
                                animationDuration={settings.animationDuration}
                                stroke={settings.barBorderOn ? '#1f2937' : 'none'}
                                strokeWidth={settings.barBorderOn ? 2 : 0}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>

                {/* PLOT BORDER OVERLAY */}
                {settings.plotBorderOn && (
                    <div style={{
                        position: 'absolute',
                        top: `${chartMargins.top}px`,
                        left: `${chartMargins.left}px`,
                        right: `${chartMargins.right}px`,
                        bottom: `${chartMargins.bottom}px`,
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
                    <h4 style={{ margin: 0, color: '#1f2937', fontSize: '16px', fontWeight: '600', fontFamily: settings.fontFamily }}>
                        {t('Chart Information', 'চার্ট তথ্য')}
                    </h4>
                </div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.6', fontFamily: settings.fontFamily }}>
                    {t(
                        'This stacked bar chart shows the distribution of categories within each variable. Each segment represents the proportion or count of a specific category, making it easy to compare distributions across variables.',
                        'এই স্ট্যাকড বার চার্ট প্রতিটি ভেরিয়েবলের মধ্যে ক্যাটাগরির বিতরণ দেখায়। প্রতিটি অংশ একটি নির্দিষ্ট ক্যাটাগরির অনুপাত বা গণনা প্রতিনিধিত্ব করে, যা ভেরিয়েবল জুড়ে বিতরণ তুলনা করা সহজ করে তোলে।'
                    )}
                </p>
            </div>
        </div>
    );
};

export default StackedBarPlot;