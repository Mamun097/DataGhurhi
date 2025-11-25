import React, { useState, useEffect, useRef } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, ComposedChart, ErrorBar, ScatterChart, Scatter, LineChart, Line, 
    AreaChart, Area, Legend  // ADD LEGEND HERE
} from 'recharts';
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
        // Wilcoxon specific settings
        histogramBins: 30,
        legendOn: true, 
        legendPosition: 'top'
    };

    // Add plot-specific settings
    if (plotType === 'Scatter') {
        return {
            ...baseSettings,
            showScatterPoints: true,
            showRegressionLines: true,
            showReferenceLine: true,
            showCriticalValues: true,
            scatterSize: 6,
            scatterOpacity: 0.7,
            scatterColor: '#3b82f6',
            qqLineColor: '#ef4444',
            referenceLineColor: '#3b82f6',
            referenceLineWidth: 2,
            referenceLineStyle: 'dashed',
            lineWidth: 2,
            legendOn: true,
            legendPosition: 'top'
        };
    } else if (plotType === 'QQ') {
        return {
            ...baseSettings,
            showScatterPoints: true,
            showReferenceLine: true,
            showCriticalValues: true,
            showConfidenceBand: true,
            scatterSize: 6,
            scatterOpacity: 0.7,
            scatterColor: '#3b82f6',
            referenceLineColor: '#ef4444',
            referenceLineWidth: 2,
            referenceLineStyle: 'solid',
            confidenceBandColor: '#d1d5db',
            confidenceBandOpacity: 0.3,
            showConfidenceBand: true,            
            legendOn: true,
            legendPosition: 'top'
        };
    }

    return baseSettings;
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

const renderWilcoxonResults = (wilcoxonActiveTab, setWilcoxonActiveTab, results, language, user_id, testType, filename, columns) => {
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

    const activeTab = wilcoxonActiveTab;
    const setActiveTab = setWilcoxonActiveTab;

    const [overlayOpen, setOverlayOpen] = React.useState(false);
    const [currentPlotType, setCurrentPlotType] = React.useState('Histogram');
    const [downloadMenuOpen, setDownloadMenuOpen] = React.useState(false);
    const chartRef = React.useRef(null);

    const [histogramSettings, setHistogramSettings] = React.useState(
        getDefaultSettings('Histogram', 1, ['Differences'])
    );
    const [scatterSettings, setScatterSettings] = React.useState(
        getDefaultSettings('Scatter', 2, [results?.plot_data?.sample1?.name || 'Sample1', results?.plot_data?.sample2?.name || 'Sample2'])
    );
    const [qqSettings, setQqSettings] = React.useState(
        getDefaultSettings('QQ', 1, ['Q-Q Plot'])
    );
    const [boxSettings, setBoxSettings] = React.useState(
        getDefaultSettings('Box', 1, ['Differences'])
    );

    React.useEffect(() => {
        if (results.plot_data) {
            const sample1Name = results.plot_data.sample1?.name || 'Sample 1';
            const sample2Name = results.plot_data.sample2?.name || 'Sample 2';
            setScatterSettings(prev => ({ 
                ...prev, 
                categoryLabels: [sample1Name, sample2Name],
                xAxisTitle: sample1Name,
                yAxisTitle: sample2Name
            }));
        }
    }, [results.plot_data]);

    const openCustomization = (plotType) => {
        setCurrentPlotType(plotType);
        setOverlayOpen(true);
    };

    const getCurrentSettings = () => {
        switch (currentPlotType) {
            case 'Histogram': return histogramSettings;
            case 'Scatter': return scatterSettings;
            case 'QQ': return qqSettings;
            case 'Box': return boxSettings;
            default: return histogramSettings;
        }
    };

    const setCurrentSettings = (settings) => {
        switch (currentPlotType) {
            case 'Histogram': setHistogramSettings(settings); break;
            case 'Scatter': setScatterSettings(settings); break;
            case 'QQ': setQqSettings(settings); break;
            case 'Box': setBoxSettings(settings); break;
        }
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
        testStatistic: language === 'বাংলা' ? 'পরীক্ষার পরিসংখ্যান (W)' : 'Test Statistic (W)',
        pValue: language === 'বাংলা' ? 'পি-মান' : 'P-Value',
        significant: language === 'বাংলা' ? 'উল্লেখযোগ্য পার্থক্য পাওয়া গেছে (p < 0.05)' : 'Significant difference found (p < 0.05)',
        notSignificant: language === 'বাংলা' ? 'কোনো উল্লেখযোগ্য পার্থক্য নেই (p ≥ 0.05)' : 'No significant difference (p ≥ 0.05)',
        wilcoxonTitle: language === 'বাংলা' ? 'উইলকক্সন সাইনড র‍্যাঙ্ক টেস্ট' : 'Wilcoxon Signed-Rank Test',
        totalPairs: language === 'বাংলা' ? 'মোট জোড়া' : 'Total Pairs',
        histogram: language === 'বাংলা' ? 'পার্থক্যের হিস্টোগ্রাম' : 'Histogram of Differences',
        scatterPlot: language === 'বাংলা' ? 'বনাম স্ক্যাটার প্লট' : 'Scatter Plot',
        qqPlot: language === 'বাংলা' ? 'কিউ-কিউ প্লট' : 'Q-Q Plot',
        boxPlot: language === 'বাংলা' ? 'পার্থক্যের বক্স প্লট' : 'Box Plot of Differences',
        differences: language === 'বাংলা' ? 'পার্থক্য' : 'Differences',
        frequency: language === 'বাংলা' ? 'ফ্রিকোয়েন্সি' : 'Frequency'
    };

    const plotData = results.plot_data || {};
    const qqData = plotData.qq_lines || {}; // NEW: Access QQ lines data
    const scatterLines = plotData.scatter_lines || {}; // NEW: Access scatter lines data

    // Update metadata access
    const normalityTest = results.metadata?.normality_test || qqData.normality_test || {};    
    const sample1Column = results.column_names?.sample1 || columns?.[0] || 'Sample 1';
    const sample2Column = results.column_names?.sample2 || columns?.[1] || 'Sample 2';

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

    const renderHistogramChart = () => {
        const settings = histogramSettings;
        const { height } = getDimensions(settings.dimensions);
        
        const differences = plotData.differences?.values || [];
        const binCount = settings.histogramBins || 30;
        
        // Create histogram data with rounded values
        const minVal = Math.min(...differences);
        const maxVal = Math.max(...differences);
        const binWidth = (maxVal - minVal) / binCount;
        
        const histogramData = [];
        for (let i = 0; i < binCount; i++) {
            const binStart = minVal + i * binWidth;
            const binEnd = binStart + binWidth;
            const count = differences.filter(val => val >= binStart && val < binEnd).length;
            histogramData.push({
                bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
                midPoint: parseFloat(((binStart + binEnd) / 2).toFixed(1)),
                count: count,
                frequency: count
            });
        }

        const yDomain = getYAxisDomain(settings, histogramData, 'frequency');

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('Histogram')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                        </svg>
                        Customize
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button className="customize-btn" onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}>
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
                        <BarChart
                            data={histogramData}
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
                                dataKey="midPoint"
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
                                axisLine={{ strokeWidth: 2 }}
                                stroke={settings.plotBorderOn ? '#000000' : 'gray'}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="frequency"
                                radius={[0, 0, 0, 0]}
                                barSize={settings.elementWidth * 100}
                                style={{ transform: 'translateY(-1px)' }}
                                label={settings.dataLabelsOn ? {
                                    position: 'top',
                                    fill: '#1f2937',
                                    fontFamily: settings.fontFamily,
                                    fontSize: settings.yAxisTickSize,
                                    formatter: (value) => value > 0 ? value : '' // Only show label if frequency > 0
                                } : false}
                            >
                                {histogramData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={settings.histogramColor || settings.categoryColors[0]}
                                        stroke={settings.barBorderOn ? '#1f2937' : 'none'}
                                        strokeWidth={settings.barBorderOn ? 1 : 0}
                                        fillOpacity={settings.histogramOpacity || 0.7}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
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
            </div>
        );
    };

    const renderScatterChart = () => {
        const settings = scatterSettings;
        const { height } = getDimensions(settings.dimensions);
        
        const sample1 = plotData.sample1?.values || [];
        const sample2 = plotData.sample2?.values || [];
        
        const scatterData = sample1.map((val, index) => ({
            x: val,
            y: sample2[index],
            pair: index + 1
        }));

        // Use backend regression data
        const regressionData = plotData.regression || {};
        const minX = Math.min(...scatterData.map(p => p.x));
        const maxX = Math.max(...scatterData.map(p => p.x));
        
        const regressionLine = [
            { 
                x: minX, 
                y: regressionData.slope * minX + regressionData.intercept 
            },
            { 
                x: maxX, 
                y: regressionData.slope * maxX + regressionData.intercept 
            }
        ];

        // Reference line (y = x)
        const minVal = Math.min(minX, Math.min(...scatterData.map(p => p.y)));
        const maxVal = Math.max(maxX, Math.max(...scatterData.map(p => p.y)));
        const referenceLine = [
            { x: minVal, y: minVal },
            { x: maxVal, y: maxVal }
        ];

        const yDomain = getYAxisDomain(settings, scatterData, 'y');

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('Scatter')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                        </svg>
                        Customize
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button className="customize-btn" onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}>
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
                        <ComposedChart                              
                            margin={{ 
                                top: settings.captionOn ? 50 : 30, 
                                right: 20, 
                                left: 20,                                 
                                bottom: 40 
                            }}                            
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
                                tick={{ fill: '#000000', fontSize: settings.xAxisTickSize, fontFamily: settings.fontFamily }}


                                label={{
                                    value: settings.xAxisTitle,
                                    position: 'insideBottom',
                                    offset: settings.legendPosition === 'bottom' ? settings.xAxisBottomMargin - 10 : settings.xAxisBottomMargin,
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

                            {settings.legendOn && (
                                <Legend 
                                    verticalAlign={settings.legendPosition === 'top' ? 'top' : 'bottom'}
                                    align="center"
                                    wrapperStyle={{
                                    paddingTop: settings.legendPosition === 'top' ? '10px' : '0',
                                    paddingBottom: settings.legendPosition === 'bottom' ? '10px' : '0',                                     
                                    }}
                                />
                            )}

                            {/* FIX: Scatter Points with CUSTOM SHAPE - Like Anderson-Darling */}
                            {settings.showScatterPoints && (
                                <Scatter
                                    name="Data Points"
                                    data={scatterData}
                                    fill={settings.scatterColor || settings.categoryColors[0]}
                                    fillOpacity={settings.scatterOpacity}
                                    shape={(props) => {
                                        const { cx, cy, payload } = props;
                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={settings.scatterSize / 2}  
                                                fill={settings.scatterColor || settings.categoryColors[0]}
                                                fillOpacity={settings.scatterOpacity}
                                            />
                                        );
                                    }}
                                />
                            )}
                            
                            {/* Regression Line */}
                            {settings.showRegressionLines && (
                                <Line
                                    name="Regression Line"
                                    type="linear"
                                    dataKey="y"
                                    data={regressionLine}
                                    stroke={settings.qqLineColor || '#ef4444'}
                                    strokeWidth={settings.lineWidth || 2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            )}
                            
                            {/* Reference Line (y = x) */}
                            {settings.showReferenceLine && (
                                <Line
                                    name="Reference Line (y=x)"
                                    type="linear"
                                    dataKey="y"
                                    data={referenceLine}
                                    stroke={settings.referenceLineColor || '#dc2626'}
                                    strokeWidth={settings.referenceLineWidth || 2}
                                    strokeDasharray={settings.referenceLineStyle === 'dashed' ? '5 5' : 
                                                settings.referenceLineStyle === 'dotted' ? '2 2' : '0'}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            )}
                        </ComposedChart>
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

                {/* Critical Values Display */}
                {settings.showCriticalValues && results.critical_values && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                            {language === 'বাংলা' ? 'ক্রিটিক্যাল মান' : 'Critical Values'}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {language === 'বাংলা' ? 'নিম্ন সীমা' : 'Lower Bound'}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {results.critical_values.lower?.toFixed(4)}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {language === 'বাংলা' ? 'গড় পার্থক্য' : 'Mean Difference'}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {results.critical_values.mean_difference?.toFixed(4)}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {language === 'বাংলা' ? 'উচ্চ সীমা' : 'Upper Bound'}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {results.critical_values.upper?.toFixed(4)}
                                </div>
                            </div>
                        </div>
                        {regressionData.r_squared && (
                            <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {language === 'বাংলা' ? 'রিগ্রেশন R²' : 'Regression R²'}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {regressionData.r_squared.toFixed(4)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderQQChart = () => {
        const settings = qqSettings;
        const { height } = getDimensions(settings.dimensions);
        
        const qqData = results.qq_data || {};
        const theoretical = qqData.theoretical_quantiles || [];
        const ordered = qqData.ordered_values || [];
        
        const qqPlotData = theoretical.map((th, idx) => ({
            theoretical: th,
            actual: ordered[idx],
            x: th,  // Add x and y for ComposedChart
            y: ordered[idx]
        }));

        // Create reference line data
        const minTheoretical = Math.min(...theoretical);
        const maxTheoretical = Math.max(...theoretical);
        
        const linePoints = [];
        const numPoints = Math.max(10, theoretical.length);
        for (let i = 0; i < numPoints; i++) {
            const th = minTheoretical + (maxTheoretical - minTheoretical) * (i / (numPoints - 1));
            const actual = th * qqData.slope + qqData.intercept;
            linePoints.push({
                theoretical: th,
                actual: actual,
                x: th,  // Add x and y for ComposedChart
                y: actual
            });
        }

        const yDomain = getYAxisDomain(settings, qqPlotData, 'actual');

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('QQ')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                        </svg>
                        Customize
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button className="customize-btn" onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}>
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
                        <ComposedChart                              
                            margin={{ 
                                top: settings.captionOn ? 50 : 30, 
                                right: 20, 
                                left: 20, 
                                bottom: 40 
                            }}                            
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
                                tick={{ fill: '#000000', fontSize: settings.xAxisTickSize, fontFamily: settings.fontFamily }}
                                label={{
                                    value: 'Theoretical Quantiles',
                                    position: 'insideBottom',
                                    offset: settings.legendPosition === 'bottom' ? settings.xAxisBottomMargin - 10 : settings.xAxisBottomMargin,
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
                                label={{
                                    value: 'Sample Quantiles',
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

                            {settings.legendOn && (
                                <Legend 
                                    verticalAlign={settings.legendPosition === 'top' ? 'top' : 'bottom'}
                                    align="center"
                                    wrapperStyle={{
                                    paddingTop: settings.legendPosition === 'top' ? '10px' : '0',
                                    paddingBottom: settings.legendPosition === 'bottom' ? '10px' : '0',
                                    }}
                                />
                            )}                            
                            
                            {/* FIX: Scatter Points with CUSTOM SHAPE */}
                            {settings.showScatterPoints && (
                                <Scatter
                                    name="Q-Q Points"
                                    data={qqPlotData}
                                    fill={settings.scatterColor || '#3b82f6'}
                                    fillOpacity={settings.scatterOpacity || 0.7}
                                    shape={(props) => {
                                        const { cx, cy, payload } = props;
                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={settings.scatterSize / 2}  
                                                fill={settings.scatterColor || '#3b82f6'}
                                                fillOpacity={settings.scatterOpacity || 0.7}
                                            />
                                        );
                                    }}
                                />
                            )}
                            
                            {/* FIX: Reference Line */}
                            {settings.showReferenceLine && linePoints.length > 0 && (
                                <Line
                                    name="Theoretical Line"
                                    dataKey="y"
                                    data={linePoints}
                                    stroke={settings.referenceLineColor || '#ef4444'}
                                    strokeWidth={settings.referenceLineWidth || 2}
                                    strokeDasharray={settings.referenceLineStyle === 'dashed' ? '5 5' : 
                                                settings.referenceLineStyle === 'dotted' ? '2 2' : '0'}
                                    dot={false}
                                    isAnimationActive={false}
                                    connectNulls={true}
                                />
                            )}
                        </ComposedChart>
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

                {/* Critical Values and Normality Test Display */}
                {settings.showCriticalValues && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                            {language === 'বাংলা' ? 'স্বাভাবিকতা পরীক্ষা এবং পরিসংখ্যান' : 'Normality Test and Statistics'}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {language === 'বাংলা' ? 'শাপিরো-উইল্ক পরীক্ষা' : 'Shapiro-Wilk Test'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                    <div>Statistic: {qqData.shapiro_stat?.toFixed(4)}</div>
                                    <div>p-value: {qqData.shapiro_p?.toFixed(6)}</div>
                                    <div style={{ fontWeight: 'bold', color: qqData.shapiro_p > 0.05 ? '#059669' : '#dc2626' }}>
                                        {qqData.shapiro_p > 0.05 ? 
                                            (language === 'বাংলা' ? 'স্বাভাবিক বন্টন' : 'Normal Distribution') : 
                                            (language === 'বাংলা' ? 'অস্বাভাবিক বন্টন' : 'Non-normal Distribution')}
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {language === 'বাংলা' ? 'কিউ-কিউ প্লট পরিসংখ্যান' : 'Q-Q Plot Statistics'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                    <div>R²: {qqData.r_squared?.toFixed(4)}</div>
                                    <div>Slope: {qqData.slope?.toFixed(4)}</div>
                                    <div>Intercept: {qqData.intercept?.toFixed(4)}</div>
                                </div>
                            </div>
                            {results.critical_values && (
                                <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                        {language === 'বাংলা' ? 'পার্থক্যের আস্থার ব্যবধান' : 'Difference Confidence Interval'}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                        <div>{language === 'বাংলা' ? 'নিম্ন:' : 'Lower:'} {results.critical_values.lower?.toFixed(4)}</div>
                                        <div>{language === 'বাংলা' ? 'গড়:' : 'Mean:'} {results.critical_values.mean_difference?.toFixed(4)}</div>
                                        <div>{language === 'বাংলা' ? 'উচ্চ:' : 'Upper:'} {results.critical_values.upper?.toFixed(4)}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderBoxChart = () => {
        const settings = boxSettings;
        const { height } = getDimensions(settings.dimensions);
        
        const differences = plotData.differences || {};
        const boxData = [{
            name: 'Differences',
            min: differences.min || 0,
            q25: differences.q25 || 0,
            median: differences.median || 0,
            q75: differences.q75 || 0,
            max: differences.max || 0,
            fill: settings.categoryColors[0]
        }];

        const CustomBoxShape = ({ cx, cy, payload, xAxis, yAxis }) => {
            if (!payload) return null;

            const groupData = boxData[0];
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

        const scatterData = [{
            x: 0,
            y: differences.median || 0,
            type: 'median',
            group: 'Differences',
            color: settings.categoryColors[0]
        }];

        // Calculate proper y-axis domain for box plot
        const padding = Math.abs((differences.max - differences.min) * 0.1);
        const yDomain = [
            (differences.min || 0) - padding,
            (differences.max || 0) + padding
        ];

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
                        <button className="customize-btn" onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}>
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
                                domain={[-0.5, 0.5]}
                                tick={false}
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
                            {boxData.map((group, idx) => (
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


    
    return (
        <div className="stats-results-container stats-fade-in">
            <div className="stats-header">
                <h2 className="stats-title">{t.wilcoxonTitle}</h2>
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
                            <td className="stats-table-label">{language === 'বাংলা' ? 'বিশ্লেষিত কলাম' : 'Analyzed Columns'}</td>
                            <td className="stats-table-value">{sample1Column} {language === 'বাংলা' ? 'এবং' : 'and'} {sample2Column}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.totalPairs}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.total_pairs)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.testStatistic}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.statistic.toFixed(4))}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.pValue}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.p_value.toFixed(6))}</td>
                        </tr>
                        <tr className="stats-conclusion-row">
                            <td className="stats-table-label">{language === 'বাংলা' ? 'সিদ্ধান্ত' : 'Conclusion'}</td>
                            <td className="stats-table-value">
                                <div className="stats-conclusion-inline">
                                    {results.p_value < 0.05 ? (
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
                    <button className={`stats-tab ${activeTab === 'histogram' ? 'active' : ''}`} onClick={() => setActiveTab('histogram')}>{t.histogram}</button>
                    <button className={`stats-tab ${activeTab === 'scatter' ? 'active' : ''}`} onClick={() => setActiveTab('scatter')}>{t.scatterPlot}</button>
                    <button className={`stats-tab ${activeTab === 'qq' ? 'active' : ''}`} onClick={() => setActiveTab('qq')}>{t.qqPlot}</button>
                    <button className={`stats-tab ${activeTab === 'box' ? 'active' : ''}`} onClick={() => setActiveTab('box')}>{t.boxPlot}</button>
                </div>

                <div className="stats-plot-container">
                    {activeTab === 'histogram' && (
                        <div className="stats-plot-wrapper active">
                            {renderHistogramChart()}
                        </div>
                    )}

                    {activeTab === 'scatter' && (
                        <div className="stats-plot-wrapper active">
                            {renderScatterChart()}
                        </div>
                    )}

                    {activeTab === 'qq' && (
                        <div className="stats-plot-wrapper active">
                            {renderQQChart()}
                        </div>
                    )}

                    {activeTab === 'box' && (
                        <div className="stats-plot-wrapper active">
                            {renderBoxChart()}
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

export default renderWilcoxonResults;