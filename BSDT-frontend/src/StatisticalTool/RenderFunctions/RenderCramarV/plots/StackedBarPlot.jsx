import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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
            xAxisBottomMargin: 0,
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
            elementWidth: 0.7,
            legendOn: true,
            legendPosition: 'top',
            legendTitle: 'Categories',
            colorScheme: 'categorical',
            categoryColors: defaultColors,
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

    // Generate stacked bar data from Cramer's V results
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
            // For Cramer's V, prioritize strong associations
            selectedResult = results.pairwise_results.find(r => r.cramers_v > 0.3) // Strong association
                || results.pairwise_results.find(r => r.p_value < 0.05)
                || results.pairwise_results[0];
        }

        // Use actual data from Cramer's V results
        const var1Categories = selectedResult.categories_var1 || selectedResult.categories_x || ['Category A', 'Category B', 'Category C', 'Category D'];
        const var2Categories = selectedResult.categories_var2 || selectedResult.categories_y || ['Type 1', 'Type 2', 'Type 3'];

        const contingencyTable = selectedResult.contingency_table || [
            [45, 30, 25],
            [35, 40, 25],
            [20, 30, 50],
            [40, 35, 25]
        ];

        const chartData = var1Categories.map((category, i) => {
            const row = contingencyTable[i] || [];
            const rowTotal = row.reduce((a, b) => a + b, 0);

            const dataPoint = { name: category };

            if (settings.stackMode === 'percentage') {
                var2Categories.forEach((cat, j) => {
                    dataPoint[cat] = rowTotal > 0 ? ((row[j] / rowTotal) * 100) : 0;
                    dataPoint[`${cat}_count`] = row[j] || 0;
                });
            } else {
                var2Categories.forEach((cat, j) => {
                    dataPoint[cat] = row[j] || 0;
                });
            }

            dataPoint.total = rowTotal;

            return dataPoint;
        });

        return {
            data: chartData,
            categories: var2Categories,
            variable1: selectedResult.variable1,
            variable2: selectedResult.variable2,
            pValue: selectedResult.p_value,
            chi2: selectedResult.chi2,
            cramersV: selectedResult.cramers_v,
            effectSize: selectedResult.effect_size
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
                    {payload.reverse().map((entry, index) => {
                        const count = settings.stackMode === 'percentage'
                            ? entry.payload[`${entry.name}_count`]
                            : entry.value;
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

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
                    <div style={{
                        marginTop: '12px',
                        paddingTop: '8px',
                        borderTop: '2px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: '#1f2937'
                    }}>
                        <span>{t('Total', 'মোট')}:</span>
                        <span>{total}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => {
        if (!payload || !Array.isArray(payload) || payload.length === 0) {
            return null;
        }

        const isVertical = settings.legendPosition === 'right' || settings.legendPosition === 'left';

        return (
            <div style={{
                display: 'flex',
                flexDirection: isVertical ? 'column' : 'row',
                justifyContent: isVertical ? 'flex-start' : 'center',
                alignItems: isVertical ? 'flex-start' : 'center',
                flexWrap: isVertical ? 'nowrap' : 'wrap',
                gap: '8px',
                padding: '8px 0',
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

        if (!settings.dataLabelsOn || height < 5 || width < 40) {
            return null;
        }

        const dataPoint = chartData.data?.[index];

        let labelText = '';

        if (settings.labelType === 'percentage') {
            labelText = `${value.toFixed(1)}%`;
        } else if (settings.labelType === 'count') {
            const countKey = `${name}_count`;
            const count = dataPoint?.[countKey];
            if (count !== undefined && count !== null) {
                labelText = `${Math.round(count)}`;
            } else {
                labelText = '0';
            }
        } else if (settings.labelType === 'both') {
            const countKey = `${name}_count`;
            const count = dataPoint?.[countKey];

            if (count !== undefined && count !== null) {
                const total = dataPoint?.total || chartData.data.reduce((sum, dp) => {
                    return sum + (dp[countKey] || 0);
                }, 0);
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : value.toFixed(1);
                labelText = `${Math.round(count)} (${percentage}%)`;
            } else {
                labelText = `0 (${value.toFixed(1)}%)`;
            }
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
                    {t('Please run Cramers V test first', 'প্রথমে ক্রেমারস ভি পরীক্ষা চালান')}
                </p>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Control Buttons */}
            <div style={{ position: 'absolute', top: '130px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                <button className="customize-btn" onClick={() => openCustomization('stacked')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                    </svg>
                    {t('Customize', 'কাস্টমাইজ')}
                </button>
                <div style={{ position: 'relative' }}>
                    <button
                        className="customize-btn"
                        onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        {t('Download', 'ডাউনলোড')}
                    </button>
                    {downloadMenuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            background: 'white',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
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
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                PNG
                            </button>
                            <button 
                                onClick={() => handleDownload('jpg')}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: 'none',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                JPG
                            </button>
                            <button 
                                onClick={() => handleDownload('pdf')}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: 'none',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                PDF
                            </button>
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
                        gap: '16px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            padding: '8px 12px',
                            background: 'white',
                            borderRadius: '8px',
                            border: '2px solid #0ea5e9',
                            minWidth: '80px'
                        }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#0369a1',
                                fontFamily: settings.fontFamily
                            }}>
                                {chartData.chi2 ? chartData.chi2.toFixed(2) : 'N/A'}
                            </div>
                            <div style={{
                                fontSize: '10px',
                                color: '#0c4a6e',
                                fontWeight: '600'
                            }}>
                                χ² {t('Statistic', 'পরিসংখ্যান')}
                            </div>
                        </div>
                        <div style={{
                            textAlign: 'center',
                            padding: '8px 12px',
                            background: chartData.pValue < 0.05 ? '#dcfce7' : '#fee2e2',
                            borderRadius: '8px',
                            border: `2px solid ${chartData.pValue < 0.05 ? '#16a34a' : '#dc2626'}`,
                            minWidth: '80px'
                        }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '700',
                                color: chartData.pValue < 0.05 ? '#15803d' : '#991b1b',
                                fontFamily: settings.fontFamily
                            }}>
                                {chartData.pValue ? chartData.pValue.toFixed(4) : 'N/A'}
                            </div>
                            <div style={{
                                fontSize: '10px',
                                color: chartData.pValue < 0.05 ? '#166534' : '#7f1d1d',
                                fontWeight: '600'
                            }}>
                                p-{t('value', 'মান')}
                            </div>
                        </div>
                        <div style={{
                            textAlign: 'center',
                            padding: '8px 12px',
                            background: '#fef3c7',
                            borderRadius: '8px',
                            border: '2px solid #f59e0b',
                            minWidth: '80px'
                        }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#92400e',
                                fontFamily: settings.fontFamily
                            }}>
                                {chartData.cramersV ? chartData.cramersV.toFixed(3) : 'N/A'}
                            </div>
                            <div style={{
                                fontSize: '10px',
                                color: '#92400e',
                                fontWeight: '600'
                            }}>
                                {t('Cramers V', 'ক্রেমারস ভি')}
                            </div>
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        data={chartData.data}
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
                                verticalAlign={settings.legendPosition === 'left' || settings.legendPosition === 'right' ? 'middle' : settings.legendPosition}
                                align={settings.legendPosition === 'left' || settings.legendPosition === 'right' ? settings.legendPosition : 'center'}
                                wrapperStyle={{
                                    paddingTop: settings.legendPosition === 'top' ? '0px' : undefined,
                                    paddingBottom: settings.legendPosition === 'bottom' ? '10px' : undefined,
                                    paddingLeft: settings.legendPosition === 'left' ? '10px' : undefined,
                                    paddingRight: settings.legendPosition === 'right' ? '10px' : undefined
                                }}
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
                                maxBarSize={80 * settings.elementWidth}
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
                        top: settings.captionOn && settings.legendOn ? '105px' :
                            settings.captionOn ? '50px' :
                                settings.legendOn ? '95px' : '30px',
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
                        'This stacked bar chart shows the distribution of categories within each variable. Each segment represents the proportion or count of a specific category, making it easy to compare distributions across variables.',
                        'এই স্ট্যাকড বার চার্ট প্রতিটি ভেরিয়েবলের মধ্যে ক্যাটাগরির বিতরণ দেখায়। প্রতিটি অংশ একটি নির্দিষ্ট ক্যাটাগরির অনুপাত বা গণনা প্রতিনিধিত্ব করে, যা ভেরিয়েবল জুড়ে বিতরণ তুলনা করা সহজ করে তোলে।'
                    )}
                </p>
            </div>
        </div>
    );
};

export default StackedBarPlot;