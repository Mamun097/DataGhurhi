import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart, ErrorBar, ScatterChart, Scatter } from 'recharts';
import CustomizationOverlay from './CustomizationOverlay/CustomizationOverlay';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const getDefaultSettings = (plotType, categoryCount, categoryNames) => {
    const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    const baseSettings = {
        dimensions: '800x600',
        fontFamily: 'Times New Roman',
        captionOn: false,
        captionText: '',
        captionSize: 22,
        captionBold: false,
        captionItalic: false,
        captionUnderline: false,
        captionTopMargin: 30,
        xAxisTitle: 'Groups',
        yAxisTitle: 'Values',
        xAxisTitleSize: 20,
        yAxisTitleSize: 20,
        xAxisTitleBold: false,
        xAxisTitleItalic: false,
        xAxisTitleUnderline: false,
        yAxisTitleBold: false,
        yAxisTitleItalic: false,
        yAxisTitleUnderline: false,
        xAxisTickSize: 18,
        yAxisTickSize: 18,
        xAxisBottomMargin: -25,
        yAxisLeftMargin: 0,
        yAxisMin: 'auto',
        yAxisMax: 'auto',
        gridOn: true,
        gridStyle: '3 3',
        gridColor: 'gray',
        gridOpacity: 1,
        borderOn: false,
        plotBorderOn: false,
        barBorderOn: false,
        dataLabelsOn: true,
        errorBarsOn: true,
        categoryLabels: categoryNames || Array(categoryCount).fill('').map((_, i) => `Category ${i + 1}`),
        categoryColors: Array(categoryCount).fill('').map((_, i) => defaultColors[i % defaultColors.length])
    };

    // Add Swarm Plot specific settings
    if (plotType === 'Swarm') {
        return {
            ...baseSettings,
            elementWidth: 0.4,
            swarmPointSize: 6,
            swarmOpacity: 0.7,
            showMeanLine: false,
            showMedianLine: false,
            showDataPoints: true,
            swarmColor: '#3b82f6'
        };
    }

    // Keep existing settings for other plot types
    return {
        ...baseSettings,
        elementWidth: plotType === 'Violin' ? 0.4 : 0.8
    };
};

const fontFamilyOptions = [
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Palatino', label: 'Palatino' },
    { value: 'Garamond', label: 'Garamond' },
];

const renderEDASwarmResults = (activeTab, setActiveTab, results, language, user_id, testType, filename, columns) => {
    const mapDigitIfBengali = (text) => {
        if (!text) return '';
        if (language !== 'বাংলা') return text;
        const digitMapBn = {
            '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
            '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
            '.': '.'
        };
        return text.toString().split('').map(char => digitMapBn[char] || char).join('');
    };

    const [overlayOpen, setOverlayOpen] = React.useState(false);
    const [currentPlotType, setCurrentPlotType] = React.useState('Swarm');
    const [downloadMenuOpen, setDownloadMenuOpen] = React.useState(false);
    const chartRef = React.useRef(null);

    const categoryNames = results.plot_data?.map(d => d.category) || [];
    const categoryCount = categoryNames.length;

    const [swarmSettings, setSwarmSettings] = React.useState(
        getDefaultSettings('Swarm', categoryCount, categoryNames)
    );

    React.useEffect(() => {
        if (results.plot_data && results.plot_data.length > 0) {
            const labels = results.plot_data.map(d => d.category);
            setSwarmSettings(prev => ({ ...prev, categoryLabels: labels }));
        }
    }, [results.plot_data]);

    const openCustomization = (plotType) => {
        setCurrentPlotType(plotType);
        setOverlayOpen(true);
    };

    const getCurrentSettings = () => {
        return swarmSettings;
    };

    const setCurrentSettings = (settings) => {
        setSwarmSettings(settings);
    };

    const handleDownload = async (format) => {
        setDownloadMenuOpen(false);

        if (!chartRef.current) {
            alert(language === 'বাংলা' ? 'চার্ট খুঁজে পাওয়া যায়নি' : 'Chart not found');
            return;
        }

        try {
            const canvas = await html2canvas(chartRef.current, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
            });

            if (format === 'pdf') {
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const pdf = new jsPDF({
                    orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [imgWidth, imgHeight]
                });

                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save(`${activeTab}_plot.pdf`);
            } else {
                const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
                const imgData = canvas.toDataURL(mimeType, 1.0);

                const link = document.createElement('a');
                link.download = `${activeTab}_plot.${format}`;
                link.href = imgData;
                link.click();
            }
        } catch (error) {
            console.error('Download error:', error);
            alert(language === 'বাংলা' ? 'ডাউনলোডে ত্রুটি' : 'Error downloading image');
        }
    };

    if (!results || !results.plot_data) {
        return (
            <div className="stats-loading">
                <div className="stats-spinner"></div>
                <p>{language === 'বাংলা' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>
            </div>
        );
    }

    const handleSaveResult = async () => {
        console.log('Saving result...');
        try {
            const response = await fetch('http://127.0.0.1:8000/api/save-results/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    results: results,
                    user_id: user_id,
                    test_name: testType,
                    filename: filename,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Result saved successfully:', data);
                alert(language === 'বাংলা' ? 'ফলাফল সংরক্ষিত হয়েছে' : 'Result saved successfully');
            } else {
                console.error('Error saving result:', response.statusText);
                alert(language === 'বাংলা' ? 'সংরক্ষণে ত্রুটি' : 'Error saving result');
            }
        } catch (error) {
            console.error('Error saving result:', error);
            alert(language === 'বাংলা' ? 'সংরক্ষণে ত্রুটি' : 'Error saving result');
        }
    };

    const t = {
        swarmPlot: language === 'বাংলা' ? 'সোয়ার্ম প্লট' : 'Swarm Plot',
        categoricalVariable: language === 'বাংলা' ? 'বিভাগভিত্তিক চলক' : 'Categorical Variable',
        numericVariable: language === 'বাংলা' ? 'সংখ্যাভিত্তিক চলক' : 'Numeric Variable',
        totalObservations: language === 'বাংলা' ? 'মোট পর্যবেক্ষণ' : 'Total Observations',
        numberOfCategories: language === 'বাংলা' ? 'বিভাগের সংখ্যা' : 'Number of Categories',
        categoryStatistics: language === 'বাংলা' ? 'বিভাগের পরিসংখ্যান' : 'Category Statistics',
        overallStatistics: language === 'বাংলा' ? 'সামগ্রিক পরিসংখ্যান' : 'Overall Statistics',
        mean: language === 'বাংলা' ? 'গড়' : 'Mean',
        median: language === 'বাংলা' ? 'মাধ্যমিক' : 'Median',
        standardDeviation: language === 'বাংলা' ? 'মানক বিচ্যুতি' : 'Standard Deviation',
        minimum: language === 'বাংলা' ? 'সর্বনিম্ন' : 'Minimum',
        maximum: language === 'বাংলা' ? 'সর্বোচ্চ' : 'Maximum',
        firstQuartile: language === 'বাংলা' ? 'প্রথম চতুর্থাংশ' : 'First Quartile (Q1)',
        thirdQuartile: language === 'বাংলা' ? 'তৃতীয় চতুর্থাংশ' : 'Third Quartile (Q3)',
        count: language === 'বাংলা' ? 'গণনা' : 'Count'
    };

    const plotData = results.plot_data || [];
    const categoricalColumn = results.column_names?.categorical || columns?.[0] || 'Category';
    const numericColumn = results.column_names?.numeric || columns?.[1] || 'Value';

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '4px' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ margin: 0, color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getDimensions = (dimensionString) => {
        const [width, height] = dimensionString.split('x').map(Number);
        let finalWidth = width;
        let finalHeight = height - 100;
        return { width: finalWidth, height: finalHeight, originalWidth: width, originalHeight: height };
    };

    const getTextStyle = (bold, italic, underline, fontFamily) => {
        return {
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            textDecoration: underline ? 'underline' : 'none',
            fontFamily: fontFamily
        };
    };

    const getCaptionStyle = (settings) => {
        return {
            fontSize: settings.captionSize,
            ...getTextStyle(settings.captionBold, settings.captionItalic, settings.captionUnderline, settings.fontFamily),
            fill: '#374151',
            textAnchor: 'middle'
        };
    };

    const getYAxisDomain = (settings, data, dataKey) => {
        if (settings.yAxisMin !== 'auto' && settings.yAxisMin !== '' && settings.yAxisMax !== 'auto' && settings.yAxisMax !== '') {
            const min = parseFloat(settings.yAxisMin);
            const max = parseFloat(settings.yAxisMax);
            if (!isNaN(min) && !isNaN(max)) {
                return [min, max];
            }
        }
        return ['auto', 'auto'];
    };

    const getGridStroke = (gridColor) => {
        return gridColor === 'black' ? '#000000' : '#e5e7eb';
    };

    const CustomSwarmPlot = ({ data, settings }) => {
        const { height } = getDimensions(settings.dimensions);
        
        // Prepare scatter data for swarm plot
        const scatterData = [];
        
        data.forEach((group, groupIndex) => {
            group.values.forEach((value, valueIndex) => {
                // Add jitter for swarm effect
                const jitter = (Math.random() - 0.5) * settings.elementWidth;
                scatterData.push({
                    x: groupIndex + jitter,
                    y: value,
                    category: group.category,
                    color: settings.categoryColors[groupIndex],
                    groupIndex: groupIndex
                });
            });
        });

        let yDomainMin, yDomainMax;

        if (settings.yAxisMin !== 'auto' && settings.yAxisMin !== '' && settings.yAxisMax !== 'auto' && settings.yAxisMax !== '') {
            const min = parseFloat(settings.yAxisMin);
            const max = parseFloat(settings.yAxisMax);
            if (!isNaN(min) && !isNaN(max)) {
                yDomainMin = min;
                yDomainMax = max;
            }
        }

        if (yDomainMin === undefined || yDomainMax === undefined) {
            const globalMin = Math.min(...data.map(d => d.min));
            const globalMax = Math.max(...data.map(d => d.max));
            const range = globalMax - globalMin;
            const padding = range * 0.1;

            const rawMin = globalMin - padding;
            const rawMax = globalMax + padding;
            const niceRange = rawMax - rawMin;
            const magnitude = Math.pow(10, Math.floor(Math.log10(niceRange)));
            const niceTick = magnitude * (niceRange / magnitude < 2 ? 0.5 : niceRange / magnitude < 5 ? 1 : 2);

            yDomainMin = Math.floor(rawMin / niceTick) * niceTick;
            yDomainMax = Math.ceil(rawMax / niceTick) * niceTick;
        }

        const yDomain = [yDomainMin, yDomainMax];

        const CustomSwarmShape = (props) => {
            const { cx, cy, payload } = props;
            if (!payload || !settings.showDataPoints) return null;

            return (
                <circle
                    cx={cx}
                    cy={cy}
                    r={settings.swarmPointSize}
                    fill={payload.color}
                    fillOpacity={settings.swarmOpacity}
                    stroke={settings.barBorderOn ? '#1f2937' : 'none'}
                    strokeWidth={settings.barBorderOn ? 1 : 0}
                />
            );
        };

        // Fixed MeanLine component
        const MeanLine = () => {
            if (!settings.showMeanLine) return null;
            
            return data.map((group, index) => {
                // Calculate position for mean line
                const meanY = group.mean;
                
                return (
                    <line
                        key={`mean-${index}`}
                        x1={index - 0.4}
                        x2={index + 0.4}
                        y1={meanY}
                        y2={meanY}
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="4 2"
                    />
                );
            });
        };

        // Fixed MedianLine component
        const MedianLine = () => {
            if (!settings.showMedianLine) return null;
            
            return data.map((group, index) => {
                // Calculate position for median line
                const medianY = group.median;
                
                return (
                    <line
                        key={`median-${index}`}
                        x1={index - 0.4}
                        x2={index + 0.4}
                        y1={medianY}
                        y2={medianY}
                        stroke="#10b981"
                        strokeWidth={2}
                    />
                );
            });
        };

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('Swarm')}>
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
                <div ref={chartRef} style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={height}>
                        <ScatterChart
                            margin={{ top: settings.captionOn ? 50 : 30, right: 20, left: 20, bottom: 40 }}
                            style={settings.borderOn ? { border: '2px solid black' } : {}}
                        >
                            {settings.captionOn && (
                                <text x="50%" y={settings.captionTopMargin} style={getCaptionStyle(settings)}>
                                    {settings.captionText}
                                </text>
                            )}
                            {settings.gridOn && (
                                <CartesianGrid
                                    strokeDasharray={settings.gridStyle}
                                    stroke={getGridStroke(settings.gridColor)}
                                    strokeOpacity={settings.gridOpacity}
                                />
                            )}
                            <XAxis
                                type="number"
                                dataKey="x"
                                domain={[-0.5, data.length - 0.5]}
                                ticks={data.map((_, idx) => idx)}
                                tickFormatter={(value) => data[value]?.category || ''}
                                angle={-45}
                                textAnchor="end"
                                height={40}
                                tick={{ fill: '#000000', fontSize: settings.xAxisTickSize, fontFamily: settings.fontFamily }}
                                label={{
                                    value: settings.xAxisTitle,
                                    position: 'insideBottom',
                                    offset: settings.xAxisBottomMargin,
                                    style: {
                                        fontSize: settings.xAxisTitleSize,
                                        fill: '#374151',
                                        ...getTextStyle(settings.xAxisTitleBold, settings.xAxisTitleItalic, settings.xAxisTitleUnderline, settings.fontFamily)
                                    }
                                }}
                                axisLine={{ strokeWidth: 2 }}
                                stroke={settings.plotBorderOn ? '#000000' : 'gray'}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                domain={yDomain}
                                tick={{ fill: '#000000', fontSize: settings.yAxisTickSize, fontFamily: settings.fontFamily }}
                                tickFormatter={(value) => Number.isInteger(value) ? value : value.toFixed(1)}
                                label={{
                                    value: settings.yAxisTitle,
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: settings.yAxisLeftMargin,
                                    style: {
                                        fontSize: settings.yAxisTitleSize,
                                        fill: '#374151',
                                        ...getTextStyle(settings.yAxisTitleBold, settings.yAxisTitleItalic, settings.yAxisTitleUnderline, settings.fontFamily)
                                    }
                                }}
                                axisLine={{ strokeWidth: 2 }}
                                stroke={settings.plotBorderOn ? '#000000' : 'gray'}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Scatter data={scatterData} shape={<CustomSwarmShape />} />
                            
                            {/* Render mean and median lines */}
                            <MeanLine />
                            <MedianLine />
                        </ScatterChart>
                    </ResponsiveContainer>

                    {/* PLOT BORDER OVERLAY */}
                    {settings.plotBorderOn && (
                        <div style={{
                            position: 'absolute',
                            top: settings.captionOn ? '50px' : '30px',
                            left: '80px',
                            right: '20px',
                            bottom: '80px',
                            borderTop: '2px solid #000000',
                            borderRight: '2px solid #000000',
                            pointerEvents: 'none',
                            zIndex: 0
                        }} />
                    )}
                </div>

                {/* Statistics Display */}
                {settings.dataLabelsOn && (
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                                {t.overallStatistics}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{t.totalObservations}</div>
                                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{mapDigitIfBengali(results.overall_stats?.total_count)}</div>
                                </div>
                                <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{t.mean}</div>
                                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{mapDigitIfBengali(results.overall_stats?.global_mean?.toFixed(2))}</div>
                                </div>
                                <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{t.median}</div>
                                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{mapDigitIfBengali(results.overall_stats?.global_median?.toFixed(2))}</div>
                                </div>
                                <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{t.standardDeviation}</div>
                                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{mapDigitIfBengali(results.overall_stats?.global_std?.toFixed(2))}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                                {t.categoryStatistics}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                                {data.map((group, idx) => (
                                    <div key={idx} style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: `4px solid ${settings.categoryColors[idx]}` }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>{group.category}</div>
                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                            <div>{t.count}: {mapDigitIfBengali(group.count)}</div>
                                            <div>{t.mean}: {mapDigitIfBengali(group.mean.toFixed(2))}</div>
                                            <div>{t.median}: {mapDigitIfBengali(group.median.toFixed(2))}</div>
                                            <div>{t.standardDeviation}: {mapDigitIfBengali(group.std.toFixed(2))}</div>
                                            <div>{t.minimum}: {mapDigitIfBengali(group.min.toFixed(2))}</div>
                                            <div>{t.maximum}: {mapDigitIfBengali(group.max.toFixed(2))}</div>
                                            <div>{t.firstQuartile}: {mapDigitIfBengali(group.q25.toFixed(2))}</div>
                                            <div>{t.thirdQuartile}: {mapDigitIfBengali(group.q75.toFixed(2))}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const swarmChartData = plotData.map((group, idx) => ({
        category: swarmSettings.categoryLabels[idx],
        values: group.values,
        count: group.count,
        mean: group.mean,
        median: group.median,
        std: group.std,
        min: group.min,
        max: group.max,
        q25: group.q25,
        q75: group.q75,
        fill: swarmSettings.categoryColors[idx]
    }));

    return (
        <div className="stats-results-container stats-fade-in">
            <div className="stats-header">
                <h2 className="stats-title">{t.swarmPlot}</h2>
                <button onClick={handleSaveResult} className="stats-save-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {language === 'বাংলা' ? 'ফলাফল সংরক্ষণ করুন' : 'Save Result'}
                </button>
            </div>

            <div className="stats-results-table-wrapper">
                <table className="stats-results-table">
                    <thead>
                        <tr>
                            <th>{language === 'বাংলা' ? 'বিবরণ' : 'Description'}</th>
                            <th>{language === 'বাংলা' ? 'মান' : 'Value'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="stats-table-label">{t.categoricalVariable}</td>
                            <td className="stats-table-value">{categoricalColumn}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.numericVariable}</td>
                            <td className="stats-table-value">{numericColumn}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.numberOfCategories}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.metadata?.n_categories)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.totalObservations}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.overall_stats?.total_count)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="stats-viz-section">
                <h3 className="stats-viz-header">{language === 'বাংলা' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualization'}</h3>

                <div className="stats-plot-container">
                    <div className="stats-plot-wrapper active">
                        <CustomSwarmPlot data={swarmChartData} settings={swarmSettings} />
                    </div>
                </div>
            </div>

            <CustomizationOverlay
                isOpen={overlayOpen}
                onClose={() => setOverlayOpen(false)}
                plotType={currentPlotType}
                settings={getCurrentSettings()}
                onSettingsChange={setCurrentSettings}
                language={language}
                fontFamilyOptions={fontFamilyOptions}
                getDefaultSettings={getDefaultSettings}
            />

            <style jsx="true">{`
                .customize-btn {
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 8px 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    color: #374151;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .customize-btn:hover {
                    background: #f9fafb;
                    border-color: #3b82f6;
                    color: #3b82f6;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                    transform: translateY(-1px);
                }

                .customize-btn svg {
                    flex-shrink: 0;
                }

                .download-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    overflow: hidden;
                    z-index: 100;
                    min-width: 120px;
                }

                .download-menu button {
                    width: 100%;
                    padding: 10px 16px;
                    border: none;
                    background: white;
                    color: #374151;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                }

                .download-menu button:hover {
                    background: #f3f4f6;
                    color: #3b82f6;
                }

                .download-menu button:not(:last-child) {
                    border-bottom: 1px solid #e5e7eb;
                }
            `}</style>
        </div>
    );
};

export default renderEDASwarmResults;