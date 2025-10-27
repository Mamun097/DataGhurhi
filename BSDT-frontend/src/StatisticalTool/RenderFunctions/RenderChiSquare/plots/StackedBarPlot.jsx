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
            labelType: 'percentage', // 'percentage', 'count', 'both'
            labelSize: 11,
            labelColor: 'white',
            labelBold: true,
            elementWidth: 0.7,
            legendOn: true,
            legendPosition: 'right', // 'right', 'bottom', 'top'
            legendTitle: 'Categories',
            colorScheme: 'categorical',
            categoryColors: defaultColors,
            orientation: 'vertical', // 'vertical', 'horizontal'
            stackMode: 'percentage', // 'percentage', 'count'
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

        // Use selected pair or first significant pair or first pair
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

        // Mock data structure - replace with actual contingency table from backend
        // In real implementation, get from selectedResult.contingency_table
        const var1Categories = selectedResult.var1_categories || ['Category A', 'Category B', 'Category C', 'Category D'];
        const var2Categories = selectedResult.var2_categories || ['Type 1', 'Type 2', 'Type 3'];
        
        // Mock contingency table - replace with actual data
        const contingencyTable = selectedResult.contingency_table || [
            [45, 30, 25],
            [35, 40, 25],
            [20, 30, 50],
            [40, 35, 25]
        ];

        // Calculate data for stacked bars
        const chartData = var1Categories.map((category, i) => {
            const row = contingencyTable[i];
            const rowTotal = row.reduce((a, b) => a + b, 0);
            
            const dataPoint = { name: category };
            
            if (settings.stackMode === 'percentage') {
                var2Categories.forEach((cat, j) => {
                    dataPoint[cat] = rowTotal > 0 ? ((row[j] / rowTotal) * 100) : 0;
                    dataPoint[`${cat}_count`] = row[j]; // Store count for tooltips
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

    // Color schemes
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

    // Enhanced Custom Tooltip
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
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    padding: '20px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    minWidth: '260px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                        paddingBottom: '12px',
                        borderBottom: '2px solid #e5e7eb'
                    }}>
                        <p style={{
                            margin: 0,
                            fontWeight: '700',
                            fontSize: '16px',
                            color: '#1f2937',
                            fontFamily: settings.fontFamily
                        }}>
                            {label}
                        </p>
                        <span style={{
                            backgroundColor: '#f3f4f6',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280'
                        }}>
                            Total: {total}
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {payload.reverse().map((entry, index) => {
                            const count = settings.stackMode === 'percentage' 
                                ? entry.payload[`${entry.name}_count`]
                                : entry.value;
                            const percentage = ((count / total) * 100).toFixed(1);
                            
                            return (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '16px',
                                    padding: '8px 12px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s',
                                    border: '1px solid transparent'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            backgroundColor: entry.color,
                                            borderRadius: '4px',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                            border: '2px solid white'
                                        }} />
                                        <span style={{ 
                                            fontSize: '14px', 
                                            color: '#374151',
                                            fontWeight: '500',
                                            fontFamily: settings.fontFamily
                                        }}>
                                            {entry.name}
                                        </span>
                                    </div>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'flex-end',
                                        gap: '2px'
                                    }}>
                                        <span style={{
                                            fontWeight: '700',
                                            color: entry.color,
                                            fontSize: '15px',
                                            fontFamily: settings.fontFamily
                                        }}>
                                            {count}
                                        </span>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#9ca3af',
                                            fontWeight: '600'
                                        }}>
                                            {percentage}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Enhanced Custom Legend
    const CustomLegend = ({ payload }) => {
        const positions = {
            right: { flexDirection: 'column', justifyContent: 'flex-start', padding: '16px 0' },
            bottom: { flexDirection: 'row', justifyContent: 'center', padding: '20px 0', flexWrap: 'wrap' },
            top: { flexDirection: 'row', justifyContent: 'center', padding: '0 0 20px 0', flexWrap: 'wrap' }
        };

        return (
            <div style={{
                display: 'flex',
                gap: settings.legendPosition === 'right' ? '12px' : '16px',
                ...positions[settings.legendPosition]
            }}>
                {settings.legendTitle && settings.legendPosition === 'right' && (
                    <div style={{
                        fontWeight: '700',
                        fontSize: '14px',
                        color: '#1f2937',
                        marginBottom: '8px',
                        fontFamily: settings.fontFamily
                    }}>
                        {settings.legendTitle}
                    </div>
                )}
                {payload.map((entry, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 14px',
                        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                        borderRadius: '10px',
                        border: '1.5px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        e.currentTarget.style.borderColor = entry.color;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                    }}>
                        <div style={{
                            width: '18px',
                            height: '18px',
                            backgroundColor: entry.color,
                            borderRadius: '6px',
                            boxShadow: `0 3px 8px ${entry.color}40`,
                            border: '2px solid white'
                        }} />
                        <span style={{
                            fontSize: '13px',
                            color: '#374151',
                            fontWeight: '600',
                            fontFamily: settings.fontFamily
                        }}>
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    // Custom Label for bars
    const renderCustomLabel = (props) => {
        const { x, y, width, height, value, index, name } = props;
        
        if (!settings.dataLabelsOn || height < 25 || width < 40) {
            return null;
        }

        const radius = settings.barRadius || 0;
        const isTop = index === chartData.categories.length - 1;
        
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
                color: 'white',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
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
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: '8px',
                zIndex: 10
            }}>
                <button
                    onClick={() => openCustomization('stacked')}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                    </svg>
                    {t('Customize', 'কাস্টমাইজ')}
                </button>
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                        style={{
                            background: 'white',
                            border: '2px solid #e5e7eb',
                            color: '#374151',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.color = '#3b82f6';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.color = '#374151';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
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
                            marginTop: '8px',
                            background: 'white',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            overflow: 'hidden',
                            zIndex: 100,
                            minWidth: '140px'
                        }}>
                            {['PNG', 'JPG', 'JPEG', 'PDF'].map((format, idx) => (
                                <button
                                    key={format}
                                    onClick={() => handleDownload(format.toLowerCase())}
                                    style={{
                                        width: '100%',
                                        padding: '12px 20px',
                                        border: 'none',
                                        background: 'white',
                                        color: '#374151',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        borderBottom: idx < 3 ? '1px solid #f3f4f6' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#f3f4f6';
                                        e.currentTarget.style.color = '#3b82f6';
                                        e.currentTarget.style.paddingLeft = '24px';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'white';
                                        e.currentTarget.style.color = '#374151';
                                        e.currentTarget.style.paddingLeft = '20px';
                                    }}
                                >
                                    {format}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Container */}
            <div
                ref={chartRef}
                style={{
                    position: 'relative',
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}
            >
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
                        margin={{
                            top: settings.captionOn ? 60 : 40,
                            right: settings.legendPosition === 'right' ? 140 : 30,
                            left: 30,
                            bottom: 60
                        }}
                        style={settings.borderOn ? { border: '3px solid #1f2937', borderRadius: '8px' } : {}}
                        barGap={8}
                        barCategoryGap="20%"
                    >
                        {settings.captionOn && (
                            <text
                                x="50%"
                                y={settings.captionTopMargin}
                                style={getCaptionStyle(settings)}
                            >
                                {settings.captionText}
                            </text>
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
                                    fontWeight: '600',
                                    ...getTextStyle(
                                        settings.xAxisTitleBold,
                                        settings.xAxisTitleItalic,
                                        settings.xAxisTitleUnderline,
                                        settings.fontFamily
                                    )
                                }
                            }}
                            axisLine={{
                                strokeWidth: settings.showBaseline ? settings.baselineWidth : 2,
                                stroke: settings.showBaseline ? settings.baselineColor : '#9ca3af'
                            }}
                            tickLine={{
                                stroke: '#9ca3af',
                                strokeWidth: 2
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
                                    fontWeight: '600',
                                    ...getTextStyle(
                                        settings.yAxisTitleBold,
                                        settings.yAxisTitleItalic,
                                        settings.yAxisTitleUnderline,
                                        settings.fontFamily
                                    )
                                }
                            }}
                            axisLine={{
                                strokeWidth: settings.showBaseline ? settings.baselineWidth : 2,
                                stroke: settings.showBaseline ? settings.baselineColor : '#9ca3af'
                            }}
                            tickLine={{
                                stroke: '#9ca3af',
                                strokeWidth: 2
                            }}
                            tickFormatter={(value) => settings.stackMode === 'percentage' ? `${value}%` : value}
                        />

                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                        />

                        {settings.legendOn && (
                            <Legend
                                content={<CustomLegend />}
                                wrapperStyle={{ 
                                    paddingTop: settings.legendPosition === 'top' ? '0' : '20px',
                                    paddingBottom: settings.legendPosition === 'bottom' ? '0' : '0'
                                }}
                                verticalAlign={
                                    settings.legendPosition === 'top' ? 'top' : 
                                    settings.legendPosition === 'bottom' ? 'bottom' : 'middle'
                                }
                                align={settings.legendPosition === 'right' ? 'right' : 'center'}
                            />
                        )}

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
                            >
                                {chartData.data.map((entry, idx) => (
                                    <Cell
                                        key={`cell-${idx}`}
                                        stroke={settings.barBorderOn ? '#1f2937' : 'none'}
                                        strokeWidth={settings.barBorderOn ? 2 : 0}
                                    />
                                ))}
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>

                {/* Plot Border Overlay */}
                {settings.plotBorderOn && (
                    <div style={{
                        position: 'absolute',
                        top: settings.captionOn ? '60px' : '40px',
                        left: '90px',
                        right: settings.legendPosition === 'right' ? '170px' : '30px',
                        bottom: '100px',
                        borderTop: '3px solid #1f2937',
                        borderRight: '3px solid #1f2937',
                        pointerEvents: 'none',
                        zIndex: 0
                    }} />
                )}
            </div>

            {/* Enhanced Info Panel */}
            <div style={{
                marginTop: '24px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
            }}>
                {/* Information Card */}
                <div style={{
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

                {/* Key Insights Card */}
                <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: '12px',
                    border: '2px solid #fbbf24'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <h4 style={{ margin: 0, color: '#92400e', fontSize: '16px', fontWeight: '600' }}>
                            {t('Key Insights', 'মূল অন্তর্দৃষ্টি')}
                        </h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: chartData.pValue < 0.05 ? '#16a34a' : '#dc2626',
                                borderRadius: '50%'
                            }} />
                            <span style={{ fontSize: '13px', color: '#78350f', fontWeight: '500' }}>
                                {chartData.pValue < 0.05 
                                    ? t('Significant association detected', 'উল্লেখযোগ্য সম্পর্ক সনাক্ত করা হয়েছে')
                                    : t('No significant association', 'কোন উল্লেখযোগ্য সম্পর্ক নেই')
                                }
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#3b82f6',
                                borderRadius: '50%'
                            }} />
                            <span style={{ fontSize: '13px', color: '#78350f', fontWeight: '500' }}>
                                {t(`${chartData.categories.length} categories analyzed`, `${chartData.categories.length}টি ক্যাটাগরি বিশ্লেষণ করা হয়েছে`)}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#8b5cf6',
                                borderRadius: '50%'
                            }} />
                            <span style={{ fontSize: '13px', color: '#78350f', fontWeight: '500' }}>
                                {settings.stackMode === 'percentage' 
                                    ? t('Showing proportional distribution', 'অনুপাতিক বিতরণ দেখানো হচ্ছে')
                                    : t('Showing absolute counts', 'পরম গণনা দেখানো হচ্ছে')
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StackedBarPlot;