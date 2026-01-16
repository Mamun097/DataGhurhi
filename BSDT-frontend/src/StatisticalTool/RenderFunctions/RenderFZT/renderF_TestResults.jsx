import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart, ErrorBar, ScatterChart, Scatter, LineChart, Line, AreaChart, Area, Legend } from 'recharts';
import CustomizationOverlay from '../CustomizationOverlay/CustomizationOverlay';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Shared default settings function for all test types
const getDefaultSettings = (plotType, categoryCount, categoryNames) => {
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
        xAxisTitleOffset: 0,
        yAxisTitleOffset: 0,
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
        elementWidth: plotType === 'Violin' ? 0.4 : 0.8,
        categoryLabels: categoryNames || Array(categoryCount).fill('').map((_, i) => `Category ${i + 1}`),
        categoryColors: Array(categoryCount).fill('').map((_, i) => defaultColors[i % defaultColors.length]),
        
        // Distribution plot specific settings
        distributionCurveColor: '#3b82f6',

        distributionCurveWidth: 2,
        distributionFill: false,
        distributionFillColor: '#3b82f680',
        
        // Histogram+KDE specific settings
        histogramBins: 30,
        histogramOpacity: 0.7,
        kdeLineWidth: 2,
        showHistogram: true,
        showKDE: true
    };
};

// Shared font family options for all test types
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

// Shared utility functions for all test types
const mapDigitIfBengali = (text, language) => {
    if (!text) return '';
    if (language !== 'বাংলা') return text;
    const digitMapBn = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
        '.': '.'
    };
    return text.toString().split('').map(char => digitMapBn[char] || char).join('');
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

const CustomTooltip = ({ active, payload, label, language }) => {
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

// Shared download handler
const handleDownload = async (chartRef, format, activeTab, setDownloadMenuOpen, language) => {
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

// Shared save result handler
const handleSaveResult = async (results, user_id, testType, filename, language) => {
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

const renderF_TestResults = (fTestActiveTab, setFTestActiveTab, results, language, user_id, testType, filename, columns) => {
    const activeTab = fTestActiveTab;
    const setActiveTab = setFTestActiveTab;

    const [overlayOpen, setOverlayOpen] = React.useState(false);
    const [currentPlotType, setCurrentPlotType] = React.useState('Count');
    const [downloadMenuOpen, setDownloadMenuOpen] = React.useState(false);
    const chartRef = React.useRef(null);

    const categoryNames = results.plot_data?.map(d => d.category) || [];
    const categoryCount = categoryNames.length;

    const [countSettings, setCountSettings] = React.useState(
        getDefaultSettings('Count', categoryCount, categoryNames)
    );
    const [meanSettings, setMeanSettings] = React.useState(
        getDefaultSettings('Mean', categoryCount, categoryNames)
    );
    const [boxSettings, setBoxSettings] = React.useState(
        getDefaultSettings('Box', categoryCount, categoryNames)
    );
    const [violinSettings, setViolinSettings] = React.useState(
        getDefaultSettings('Violin', categoryCount, categoryNames)
    );
    const [fDistributionSettings, setFDistributionSettings] = React.useState(
        getDefaultSettings('Distribution', categoryCount, categoryNames)
    );

    React.useEffect(() => {
        if (results.plot_data && results.plot_data.length > 0) {
            const labels = results.plot_data.map(d => d.category);
            setCountSettings(prev => ({ ...prev, categoryLabels: labels }));
            setMeanSettings(prev => ({ ...prev, categoryLabels: labels }));
            setBoxSettings(prev => ({ ...prev, categoryLabels: labels }));
            setViolinSettings(prev => ({ ...prev, categoryLabels: labels }));
            setFDistributionSettings(prev => ({ ...prev, categoryLabels: labels }));
        }
    }, [results.plot_data]);

    const openCustomization = (plotType) => {
        setCurrentPlotType(plotType);
        setOverlayOpen(true);
    };

    const getCurrentSettings = () => {
        switch (currentPlotType) {
            case 'Count': return countSettings;
            case 'Mean': return meanSettings;
            case 'Box': return boxSettings;
            case 'Violin': return violinSettings;
            case 'FDistribution': return fDistributionSettings;
            default: return countSettings;
        }
    };

    const setCurrentSettings = (settings) => {
        switch (currentPlotType) {
            case 'Count': setCountSettings(settings); break;
            case 'Mean': setMeanSettings(settings); break;
            case 'Box': setBoxSettings(settings); break;
            case 'Violin': setViolinSettings(settings); break;
            case 'FDistribution': setFDistributionSettings(settings); break;
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

    const t = {
        testStatistic: language === 'বাংলা' ? 'এফ-পরিসংখ্যান' : 'F-Statistic',
        pValue: language === 'বাংলা' ? 'পি-মান' : 'P-Value',
        significant: language === 'বাংলা' ? 'ভ্যারিয়েন্সে উল্লেখযোগ্য পার্থক্য পাওয়া গেছে (p < 0.05)' : 'Significant difference in variances found (p < 0.05)',
        notSignificant: language === 'বাংলা' ? 'ভ্যারিয়েন্সে কোনো উল্লেখযোগ্য পার্থক্য নেই (p ≥ 0.05)' : 'No significant difference in variances (p ≥ 0.05)',
        fTestTitle: language === 'বাংলা' ? 'এফ-টেস্ট (ভ্যারিয়েন্স সমতা)' : 'F-Test for Equality of Variances',
        groupSizes: language === 'বাংলা' ? 'গ্রুপের আকার' : 'Group Sizes',
        boxPlot: language === 'বাংলা' ? 'বক্স প্লট' : 'Box Plot',
        violinPlot: language === 'বাংলা' ? 'ভায়োলিন প্লট' : 'Violin Plot',
        meanPlot: language === 'বাংলা' ? 'গড় মান' : 'Mean Values',
        count: language === 'বাংলা' ? 'গণনা' : 'Count',
        observations: language === 'বাংলা' ? 'পর্যবেক্ষণ' : 'Observations',
        degreesOfFreedom: language === 'বাংলা' ? 'ডিগ্রী অফ ফ্রিডম' : 'Degrees of Freedom',
        variances: language === 'বাংলা' ? 'ভ্যারিয়েন্স' : 'Variances',
        fDistribution: language === 'বাংলা' ? 'এফ-বন্টন' : 'F-Distribution',
        criticalValue: language === 'বাংলা' ? 'ক্রিটিক্যাল মান' : 'Critical Value',
        observedF: language === 'বাংলা' ? 'পর্যবেক্ষিত এফ' : 'Observed F'
    };

    const plotData = results.plot_data || [];
    const groupColumn = results.column_names?.group || columns?.[0] || 'Group';
    const valueColumn = results.column_names?.value || columns?.[1] || 'Value';

    // Extract F-test specific statistics from results
    const fStatistic = results.statistic;
    const pValue = results.p_value;
    const degreesOfFreedom = results.degrees_of_freedom; // Should be "dfn, dfd" format
    const variances = results.variances || {};


    const generateFDistributionData = () => {
        const data = [];
        
        // Get degrees of freedom from the new format (metadata.dfn, metadata.dfd)
        const dfn = results.metadata?.dfn || 1;
        const dfd = results.metadata?.dfd || 1;
        
        // If degrees_of_freedom exists in the old format, use it as fallback
        let dfParts = [];
        if (results.degrees_of_freedom) {
            dfParts = results.degrees_of_freedom.split(', ').map(Number);
        }
        const dfnFinal = dfParts[0] || dfn;
        const dfdFinal = dfParts[1] || dfd;
        
        // Calculate critical F value for visualization
        const criticalF = 3.0; // Simplified - in real implementation, calculate properly
        
        // Generate F-distribution curve
        const maxF = Math.max(fStatistic * 2, criticalF * 1.5, 8);
        for (let x = 0.1; x <= maxF; x += 0.1) {
            // Simplified F-distribution PDF - in real implementation, use proper statistical library
            const pdf = Math.exp(-x/2) * Math.pow(x, dfnFinal/2 - 1) / Math.pow(1 + x * dfnFinal/dfdFinal, (dfnFinal + dfdFinal)/2);
            data.push({
                x: x,
                pdf: pdf * 1000, // Scale for better visualization
                isCritical: x > criticalF
            });
        }
        return data;
    };    


    const fDistributionData = generateFDistributionData();

    // Chart rendering functions
    const renderCountChart = () => {
        const settings = countSettings;
        const { height } = getDimensions(settings.dimensions);

        const data = plotData.map((group, idx) => ({
            name: settings.categoryLabels[idx],
            count: group.count,
            fill: settings.categoryColors[idx]
        }));

        const yDomain = getYAxisDomain(settings, data, 'count');

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('Count')}>
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
                                <button onClick={() => handleDownload(chartRef, 'png', activeTab, setDownloadMenuOpen, language)}>PNG</button>
                                <button onClick={() => handleDownload(chartRef, 'jpg', activeTab, setDownloadMenuOpen, language)}>JPG</button>
                                <button onClick={() => handleDownload(chartRef, 'jpeg', activeTab, setDownloadMenuOpen, language)}>JPEG</button>
                                <button onClick={() => handleDownload(chartRef, 'pdf', activeTab, setDownloadMenuOpen, language)}>PDF</button>
                            </div>
                        )}
                    </div>
                </div>
                <div ref={chartRef} style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={height}>
                        <BarChart
                            data={data}
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
                                dataKey="name"
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
                                    },
                                    dx: settings.xAxisTitleOffset
                                }}
                            />
                            <YAxis
                                domain={yDomain}
                                tick={{ fill: '#000000', fontSize: settings.xAxisTickSize, fontFamily: settings.fontFamily }}
                                label={{
                                    value: settings.yAxisTitle,
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: settings.yAxisLeftMargin,
                                    style: {
                                        fontSize: settings.yAxisTitleSize,
                                        fill: '#374151',
                                        ...getTextStyle(settings.yAxisTitleBold, settings.yAxisTitleItalic, settings.yAxisTitleUnderline, settings.fontFamily)
                                    },
                                    dy: settings.yAxisTitleOffset
                                }}
                            />
                            <Tooltip content={<CustomTooltip language={language} />} />
                            <Bar
                                dataKey="count"
                                radius={[0, 0, 0, 0]}
                                barSize={settings.elementWidth * 100}
                                label={settings.dataLabelsOn ? {
                                    position: 'top',
                                    fill: '#1f2937',
                                    fontFamily: settings.fontFamily,
                                    fontSize: settings.yAxisTickSize
                                } : false}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.fill}
                                        stroke={settings.barBorderOn ? '#1f2937' : 'none'}
                                        strokeWidth={settings.barBorderOn ? 1 : 0}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderMeanChart = () => {
        const settings = meanSettings;
        const { height } = getDimensions(settings.dimensions);

        const data = plotData.map((group, idx) => ({
            name: settings.categoryLabels[idx],
            mean: parseFloat(group.mean.toFixed(2)),
            std: parseFloat(group.std.toFixed(2)),
            fill: settings.categoryColors[idx]
        }));

        const yDomain = getYAxisDomain(settings, data, 'mean');

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('Mean')}>
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
                                <button onClick={() => handleDownload(chartRef, 'png', activeTab, setDownloadMenuOpen, language)}>PNG</button>
                                <button onClick={() => handleDownload(chartRef, 'jpg', activeTab, setDownloadMenuOpen, language)}>JPG</button>
                                <button onClick={() => handleDownload(chartRef, 'jpeg', activeTab, setDownloadMenuOpen, language)}>JPEG</button>
                                <button onClick={() => handleDownload(chartRef, 'pdf', activeTab, setDownloadMenuOpen, language)}>PDF</button>
                            </div>
                        )}
                    </div>
                </div>
                <div ref={chartRef} style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={height}>
                        <ComposedChart
                            data={data}
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
                                dataKey="name"
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
                                    },
                                    dx: settings.xAxisTitleOffset
                                }}
                            />
                            <YAxis
                                domain={yDomain}
                                tick={{ fill: '#000000', fontSize: settings.yAxisTickSize, fontFamily: settings.fontFamily }}
                                label={{
                                    value: settings.yAxisTitle,
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: settings.yAxisLeftMargin,
                                    style: {
                                        fontSize: settings.yAxisTitleSize,
                                        fill: '#374151',
                                        ...getTextStyle(settings.yAxisTitleBold, settings.yAxisTitleItalic, settings.yAxisTitleUnderline, settings.fontFamily)
                                    },
                                    dy: settings.yAxisTitleOffset
                                }}
                            />
                            <Tooltip content={<CustomTooltip language={language} />} />
                            <Bar
                                dataKey="mean"
                                radius={[0, 0, 0, 0]}
                                barSize={settings.elementWidth * 100}
                                label={settings.dataLabelsOn ? {
                                    position: 'top',
                                    fill: '#1f2937',
                                    fontFamily: settings.fontFamily,
                                    fontSize: settings.yAxisTickSize
                                } : false}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.fill}
                                        stroke={settings.barBorderOn ? '#1f2937' : 'none'}
                                        strokeWidth={settings.barBorderOn ? 1 : 0}
                                    />
                                ))}
                                {settings.errorBarsOn && (
                                    <ErrorBar dataKey="std" width={4} strokeWidth={2} stroke="#374151" />
                                )}
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderFDistributionChart = () => {
        const settings = fDistributionSettings;
        const { height } = getDimensions(settings.dimensions);

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('FDistribution')}>
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
                                <button onClick={() => handleDownload(chartRef, 'png', activeTab, setDownloadMenuOpen, language)}>PNG</button>
                                <button onClick={() => handleDownload(chartRef, 'jpg', activeTab, setDownloadMenuOpen, language)}>JPG</button>
                                <button onClick={() => handleDownload(chartRef, 'jpeg', activeTab, setDownloadMenuOpen, language)}>JPEG</button>
                                <button onClick={() => handleDownload(chartRef, 'pdf', activeTab, setDownloadMenuOpen, language)}>PDF</button>
                            </div>
                        )}
                    </div>
                </div>
                <div ref={chartRef} style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={height}>
                        <AreaChart
                            data={fDistributionData}
                            margin={{ top: settings.captionOn ? 50 : 30, right: 20, left: 20, bottom: 40 }}
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
                                dataKey="x"
                                tick={{ fill: '#000000', fontSize: settings.xAxisTickSize, fontFamily: settings.fontFamily }}
                                tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
                                label={{
                                    value: 'F Value',
                                    position: 'insideBottom',
                                    offset: settings.xAxisBottomMargin,
                                    style: {
                                        fontSize: settings.xAxisTitleSize,
                                        fill: '#374151',
                                        ...getTextStyle(settings.xAxisTitleBold, settings.xAxisTitleItalic, settings.xAxisTitleUnderline, settings.fontFamily)
                                    },
                                    dx: settings.xAxisTitleOffset
                                }}
                            />
                            <YAxis
                                tick={{ fill: '#000000', fontSize: settings.yAxisTickSize, fontFamily: settings.fontFamily }}
                                label={{
                                    value: 'Density',
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: -12,
                                    style: {
                                        fontSize: settings.yAxisTitleSize,
                                        fill: '#374151',
                                        ...getTextStyle(settings.yAxisTitleBold, settings.yAxisTitleItalic, settings.yAxisTitleUnderline, settings.fontFamily)
                                    },
                                    dy: settings.yAxisTitleOffset
                                }}
                            />
                            <Tooltip 
                                content={<CustomTooltip language={language} />}
                                formatter={(value, name) => [value.toFixed(4), name]}
                                labelFormatter={(label) => `F = ${label.toFixed(2)}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="pdf"
                                stroke={settings.distributionCurveColor}
                                strokeWidth={settings.distributionCurveWidth}
                                fill={settings.distributionFill ? settings.distributionFillColor : 'none'}
                                fillOpacity={0.6}
                            />

                        </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ 
                        position: 'absolute', 
                        top: '60px', 
                        left: '535px', 
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{t.observedF}: {fStatistic.toFixed(4)}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>p-value: {pValue.toFixed(6)}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>df: {degreesOfFreedom}</div>
                    </div>
                </div>
            </div>
        );
    };

    const CustomBoxPlot = ({ data, settings }) => {
        const { height } = getDimensions(settings.dimensions);
        const scatterData = [];

        data.forEach((group, idx) => {
            const xPos = idx;
            scatterData.push(
                { x: xPos, y: group.min, type: 'min', group: group.name, color: group.fill },
                { x: xPos, y: group.q25, type: 'q25', group: group.name, color: group.fill },
                { x: xPos, y: group.median, type: 'median', group: group.name, color: group.fill },
                { x: xPos, y: group.q75, type: 'q75', group: group.name, color: group.fill },
                { x: xPos, y: group.max, type: 'max', group: group.name, color: group.fill }
            );
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

        const CustomBoxShape = (props) => {
            const { cx, cy, payload, xAxis, yAxis } = props;
            if (!payload || payload.type !== 'median') return null;

            const groupData = data.find(g => g.name === payload.group);
            if (!groupData) return null;

            const yScale = yAxis.scale;

            const yMinPos = yScale(groupData.min);
            const yQ25Pos = yScale(groupData.q25);
            const yMedianPos = yScale(groupData.median);
            const yQ75Pos = yScale(groupData.q75);
            const yMaxPos = yScale(groupData.max);

            const boxWidth = 30 * settings.elementWidth;
            const whiskerWidth = 20 * settings.elementWidth;

            return (
                <g>
                    <line x1={cx} y1={yMinPos} x2={cx} y2={yQ25Pos} stroke={groupData.fill} strokeWidth="2" />
                    <line x1={cx} y1={yQ75Pos} x2={cx} y2={yMaxPos} stroke={groupData.fill} strokeWidth="2" />
                    <line x1={cx - whiskerWidth} y1={yMinPos} x2={cx + whiskerWidth} y2={yMinPos} stroke={groupData.fill} strokeWidth="2" />
                    <line x1={cx - whiskerWidth} y1={yMaxPos} x2={cx + whiskerWidth} y2={yMaxPos} stroke={groupData.fill} strokeWidth="2" />
                    <rect
                        x={cx - boxWidth}
                        y={yQ75Pos}
                        width={boxWidth * 2}
                        height={Math.abs(yQ25Pos - yQ75Pos)}
                        fill={groupData.fill}
                        fillOpacity="0.3"
                        stroke={groupData.fill}
                        strokeWidth="2"
                        rx="4"
                    />
                    <line
                        x1={cx - boxWidth}
                        y1={yMedianPos}
                        x2={cx + boxWidth}
                        y2={yMedianPos}
                        stroke="#1f2937"
                        strokeWidth="3"
                    />
                </g>
            );
        };

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('Box')}>
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
                                tickFormatter={(value) => data[value]?.name || ''}
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
                                    },
                                    dx: settings.xAxisTitleOffset
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
                                    },
                                    dy: settings.yAxisTitleOffset
                                }}
                                axisLine={{ strokeWidth: 2 }}
                                stroke={settings.plotBorderOn ? '#000000' : 'gray'}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Scatter data={scatterData} shape={<CustomBoxShape />} />
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

                {settings.dataLabelsOn && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                            {language === 'বাংলা' ? 'বক্স প্লট পরিসংখ্যান' : 'Box Plot Statistics'}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            {data.map((group, idx) => (
                                <div key={idx} style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: `4px solid ${group.fill}` }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>{group.name}</div>
                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                        <div>Max: {group.max}</div>
                                        <div>Q3 (75%): {group.q75}</div>
                                        <div>Median: {group.median}</div>
                                        <div>Q1 (25%): {group.q25}</div>
                                        <div>Min: {group.min}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const CustomViolinPlot = ({ data, settings }) => {
        const { height } = getDimensions(settings.dimensions);
        const numPoints = 100;
        const violinWidth = settings.elementWidth;

        let yMin, yMax;

        if (settings.yAxisMin !== 'auto' && settings.yAxisMin !== '' && settings.yAxisMax !== 'auto' && settings.yAxisMax !== '') {
            const min = parseFloat(settings.yAxisMin);
            const max = parseFloat(settings.yAxisMax);
            if (!isNaN(min) && !isNaN(max)) {
                yMin = min;
                yMax = max;
            }
        }

        if (yMin === undefined || yMax === undefined) {
            const globalMin = Math.min(...data.map(d => d.min));
            const globalMax = Math.max(...data.map(d => d.max));
            const range = globalMax - globalMin;
            const padding = range * 0.1;

            const rawMin = globalMin - padding;
            const rawMax = globalMax + padding;
            const niceRange = rawMax - rawMin;
            const magnitude = Math.pow(10, Math.floor(Math.log10(niceRange)));
            const niceTick = magnitude * (niceRange / magnitude < 2 ? 0.5 : niceRange / magnitude < 5 ? 1 : 2);

            yMin = Math.floor(rawMin / niceTick) * niceTick;
            yMax = Math.ceil(rawMax / niceTick) * niceTick;
        }

        const allViolinPoints = [];

        data.forEach((group, groupIdx) => {
            const points = [];
            const groupRange = group.max - group.min;

            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;
                const yValue = group.min + groupRange * t;

                const distFromMedian = Math.abs(yValue - group.median);
                const normalizedDist = distFromMedian / (groupRange / 2);
                const density = Math.exp(-normalizedDist * normalizedDist * 3);

                const distFromQ25 = Math.abs(yValue - group.q25);
                const distFromQ75 = Math.abs(yValue - group.q75);
                const quartileFactor = Math.exp(-Math.min(distFromQ25, distFromQ75) / (groupRange * 0.1));

                const finalDensity = (density * 1.0 + quartileFactor * 0);

                points.push({
                    y: yValue,
                    density: finalDensity,
                    groupIdx: groupIdx,
                    groupName: group.name,
                    color: group.fill
                });
            }

            allViolinPoints.push(...points);
        });

        const CustomViolinShape = (props) => {
            const { cx, cy, payload, xAxis, yAxis } = props;
            if (!payload || payload.groupIdx === undefined) return null;

            const groupPoints = allViolinPoints.filter(p => p.groupIdx === payload.groupIdx);
            const group = data[payload.groupIdx];

            const yScale = yAxis.scale;
            const xAxisWidth = xAxis.width || 710;
            const groupWidth = xAxisWidth / data.length;
            const maxWidth = groupWidth * violinWidth;

            const maxDensity = Math.max(...groupPoints.map(p => p.density));

            const leftPoints = groupPoints.map(p => {
                const scaledDensity = (p.density / maxDensity) * maxWidth;
                return {
                    x: cx - scaledDensity,
                    y: yScale(p.y)
                };
            });

            const rightPoints = groupPoints.slice().reverse().map(p => {
                const scaledDensity = (p.density / maxDensity) * maxWidth;
                return {
                    x: cx + scaledDensity,
                    y: yScale(p.y)
                };
            });

            const pathData = [
                `M ${leftPoints[0].x} ${leftPoints[0].y}`,
                ...leftPoints.slice(1).map(p => `L ${p.x} ${p.y}`),
                ...rightPoints.map(p => `L ${p.x} ${p.y}`),
                'Z'
            ].join(' ');

            const medianY = yScale(group.median);
            const medianPoint = groupPoints.find(p => Math.abs(p.y - group.median) === Math.min(...groupPoints.map(pt => Math.abs(pt.y - group.median))));
            const medianDensity = medianPoint ? (medianPoint.density / maxDensity) * maxWidth : maxWidth * 0.5;

            return (
                <g>
                    <path
                        d={pathData}
                        fill={payload.color}
                        fillOpacity={0.3}
                        stroke={payload.color}
                        strokeWidth={2}
                    />
                    <line
                        x1={cx - medianDensity}
                        y1={medianY}
                        x2={cx + medianDensity}
                        y2={medianY}
                        stroke="#1f2937"
                        strokeWidth={3}
                    />
                </g>
            );
        };

        const scatterData = data.map((group, idx) => ({
            x: idx,
            y: group.median,
            groupIdx: idx,
            groupName: group.name,
            color: group.fill
        }));

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('Violin')}>
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
                                tickFormatter={(value) => data[value]?.name || ''}
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
                                    },
                                    dx: settings.xAxisTitleOffset
                                }}
                                axisLine={{ strokeWidth: 2 }}
                                stroke={settings.plotBorderOn ? '#000000' : 'gray'}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                domain={[yMin, yMax]}
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
                                    },
                                    dy: settings.yAxisTitleOffset
                                }}
                                axisLine={{ strokeWidth: 2 }}
                                stroke={settings.plotBorderOn ? '#000000' : 'gray'}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Scatter data={scatterData} shape={<CustomViolinShape />} />
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
                            zIndex: 1
                        }} />
                    )}
                </div>

                {settings.dataLabelsOn && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                            {language === 'বাংলা' ? 'ভায়োলিন প্লট তথ্য' : 'Violin Plot Information'}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                            {language === 'বাংলা' ? 'ভায়োলিন প্লট ডেটা বিতরণের ঘনত্ব দেখায়। প্রশস্ত অংশ = আরও ডেটা পয়েন্ট' : 'Violin plot shows data distribution density. Wider sections = more data points'}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const boxChartData = plotData.map((group, idx) => ({
        name: boxSettings.categoryLabels[idx],
        min: parseFloat(group.min.toFixed(2)),
        q25: parseFloat(group.q25.toFixed(2)),
        median: parseFloat(group.median.toFixed(2)),
        q75: parseFloat(group.q75.toFixed(2)),
        max: parseFloat(group.max.toFixed(2)),
        fill: boxSettings.categoryColors[idx]
    }));

    const violinChartData = plotData.map((group, idx) => ({
        name: violinSettings.categoryLabels[idx],
        min: parseFloat(group.min.toFixed(2)),
        q25: parseFloat(group.q25.toFixed(2)),
        median: parseFloat(group.median.toFixed(2)),
        q75: parseFloat(group.q75.toFixed(2)),
        max: parseFloat(group.max.toFixed(2)),
        fill: violinSettings.categoryColors[idx]
    }));    

    return (
        <div className="stats-results-container stats-fade-in">
            <div className="stats-header">
                <h2 className="stats-title">{t.fTestTitle}</h2>
                <button onClick={() => handleSaveResult(results, user_id, testType, filename, language)} className="stats-save-btn">
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
                            <td className="stats-table-label">{language === 'বাংলা' ? 'বিশ্লেষিত কলাম' : 'Analyzed Columns'}</td>
                            <td className="stats-table-value">{groupColumn} {language === 'বাংলা' ? 'এবং' : 'and'} {valueColumn}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{language === 'বাংলা' ? 'গ্রুপের সংখ্যা' : 'Number of Groups'}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.n_groups, language)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{language === 'বাংলা' ? 'মোট পর্যবেক্ষণ' : 'Total Observations'}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.total_observations, language)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.testStatistic}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(fStatistic.toFixed(4), language)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.degreesOfFreedom}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(degreesOfFreedom, language)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.pValue}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(pValue.toFixed(6), language)}</td>
                        </tr>
                        {Object.entries(variances).map(([group, variance]) => (
                            <tr key={group}>
                                <td className="stats-table-label">{t.variances} ({group})</td>
                                <td className="stats-table-value stats-numeric">{mapDigitIfBengali(variance.toFixed(4), language)}</td>
                            </tr>
                        ))}
                        <tr className="stats-conclusion-row">
                            <td className="stats-table-label">{language === 'বাংলা' ? 'সিদ্ধান্ত' : 'Conclusion'}</td>
                            <td className="stats-table-value">
                                <div className="stats-conclusion-inline">
                                    {pValue < 0.05 ? (
                                        <>
                                            <svg className="stats-conclusion-icon" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="stats-conclusion-text significant">{t.significant}</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="stats-conclusion-icon" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="stats-conclusion-text not-significant">{t.notSignificant}</span>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="stats-viz-section">
                <h3 className="stats-viz-header">{language === 'বাংলা' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualizations'}</h3>

                <div className="stats-tab-container">
                    <button className={`stats-tab ${activeTab === 'count' ? 'active' : ''}`} onClick={() => setActiveTab('count')}>{t.count}</button>
                    <button className={`stats-tab ${activeTab === 'mean' ? 'active' : ''}`} onClick={() => setActiveTab('mean')}>{t.meanPlot}</button>
                    <button className={`stats-tab ${activeTab === 'box' ? 'active' : ''}`} onClick={() => setActiveTab('box')}>{t.boxPlot}</button>
                    <button className={`stats-tab ${activeTab === 'violin' ? 'active' : ''}`} onClick={() => setActiveTab('violin')}>{t.violinPlot}</button>
                    <button className={`stats-tab ${activeTab === 'fdistribution' ? 'active' : ''}`} onClick={() => setActiveTab('fdistribution')}>{t.fDistribution}</button>
                </div>

                <div className="stats-plot-container">
                    {activeTab === 'count' && (
                        <div className="stats-plot-wrapper active">
                            {renderCountChart()}
                        </div>
                    )}

                    {activeTab === 'mean' && (
                        <div className="stats-plot-wrapper active">
                            {renderMeanChart()}
                        </div>
                    )}

                    {activeTab === 'box' && (
                        <div className="stats-plot-wrapper active">
                            {/* Box plot implementation would go here */}
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <CustomBoxPlot data={boxChartData} settings={boxSettings} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'violin' && (
                        <div className="stats-plot-wrapper active">
                            {/* Violin plot implementation would go here */}
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <CustomViolinPlot data={violinChartData} settings={violinSettings} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'fdistribution' && (
                        <div className="stats-plot-wrapper active">
                            {renderFDistributionChart()}
                        </div>
                    )}
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
        </div>
    );
};

export default renderF_TestResults;
