import React, { useState, useEffect, useRef } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, ComposedChart, ErrorBar, ScatterChart, Scatter, LineChart, Line, 
    AreaChart, Area, Legend 
} from 'recharts';
import CustomizationOverlay from './CustomizationOverlay/CustomizationOverlay';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (textArray, targetLang) => {
    try {
        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
            {
                q: textArray,
                target: targetLang,
                format: "text",
            }
        );
        return response.data.data.translations.map((t) => t.translatedText);
    } catch (error) {
        console.error("Translation error:", error);
        return textArray;
    }
};

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
        xAxisTitle: 'Values',
        yAxisTitle: 'Frequency',
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
        elementWidth: 0.8,
        categoryLabels: categoryNames || Array(categoryCount).fill('').map((_, i) => `Category ${i + 1}`),
        categoryColors: Array(categoryCount).fill('').map((_, i) => defaultColors[i % defaultColors.length]),
        // Shapiro specific settings
        histogramBins: 30,
        legendOn: true, 
        legendPosition: 'top'
    };

    // Add plot-specific settings
    if (plotType === 'Histogram') {
        return {
            ...baseSettings,
            showNormalCurve: true,
            normalCurveColor: '#ef4444',
            normalCurveWidth: 2,
            normalCurveStyle: 'solid',
            histogramColor: '#3b82f6',
            histogramOpacity: 0.7
        };
    } else if (plotType === 'QQ') {
        return {
            ...baseSettings,
            xAxisTitle: 'Theoretical Quantiles',
            yAxisTitle: 'Sample Quantiles',
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

const renderShapiroResults = (shapiroActiveTab, setShapiroActiveTab, results, language, user_id, testType, filename, columns) => {
    const activeTab = shapiroActiveTab;
    const setActiveTab = setShapiroActiveTab;

    const [overlayOpen, setOverlayOpen] = React.useState(false);
    const [currentPlotType, setCurrentPlotType] = React.useState('Histogram');
    const [downloadMenuOpen, setDownloadMenuOpen] = React.useState(false);
    const chartRef = React.useRef(null);
    const [translatedLabels, setTranslatedLabels] = React.useState({});
    const [translatedNumbers, setTranslatedNumbers] = React.useState({});

    const [histogramSettings, setHistogramSettings] = React.useState(
        getDefaultSettings('Histogram', 1, [results?.column_names?.sample || results?.column_name || 'Data'])
    );
    const [qqSettings, setQqSettings] = React.useState(
        getDefaultSettings('QQ', 1, [results?.column_names?.sample || results?.column_name || 'Data'])
    );

    // Collect all numbers that need translation
    const collectNumbersToTranslate = () => {
        const numbers = new Set();
        
        if (results.n_observations) numbers.add(String(results.n_observations));
        if (results.plot_data?.sample?.count) numbers.add(String(results.plot_data.sample.count));
        if (results.statistic !== null && results.statistic !== undefined) {
            numbers.add(results.statistic.toFixed(4));
        }
        if (results.p_value !== null && results.p_value !== undefined) {
            numbers.add(results.p_value.toFixed(6));
        }
        
        // Add descriptive stats
        if (results.descriptive_stats) {
            if (results.descriptive_stats.mean) numbers.add(results.descriptive_stats.mean.toFixed(4));
            if (results.descriptive_stats.std_dev) numbers.add(results.descriptive_stats.std_dev.toFixed(4));
            if (results.descriptive_stats.skewness) numbers.add(results.descriptive_stats.skewness.toFixed(4));
            if (results.descriptive_stats.kurtosis) numbers.add(results.descriptive_stats.kurtosis.toFixed(4));
        }
        
        // Add QQ data stats
        if (results.qq_data) {
            if (results.qq_data.shapiro_stat) numbers.add(results.qq_data.shapiro_stat.toFixed(4));
            if (results.qq_data.shapiro_p) numbers.add(results.qq_data.shapiro_p.toFixed(6));
            if (results.qq_data.r_squared) numbers.add(results.qq_data.r_squared.toFixed(4));
            if (results.qq_data.slope) numbers.add(results.qq_data.slope.toFixed(4));
            if (results.qq_data.intercept) numbers.add(results.qq_data.intercept.toFixed(4));
        }
        
        return Array.from(numbers);
    };

    // Load translations
    React.useEffect(() => {
        const loadTranslations = async () => {
            if (language === 'English' || language === 'en') {
                setTranslatedLabels({});
                setTranslatedNumbers({});
                return;
            }

            const labelsToTranslate = [
                'Shapiro-Wilk Normality Test',
                'Test Statistic (W)',
                'P-Value',
                'Data follows normal distribution (p ≥ 0.05)',
                'Data does not follow normal distribution (p < 0.05)',
                'Histogram',
                'Q-Q Plot',
                'Observations',
                'Mean',
                'Std. Deviation',
                'Skewness',
                'Kurtosis',
                'Save Result',
                'Analyzed Column',
                'Conclusion',
                'Visualizations',
                'Customize',
                'Download',
                'PNG',
                'JPG',
                'JPEG',
                'PDF',
                'Chart not found',
                'Error downloading image',
                'Loading results...',
                'Result saved successfully',
                'Error saving result',
                'Description',
                'Value',
                'Normality Test and Statistics',
                'Shapiro-Wilk Test',
                'Normal Distribution',
                'Non-normal Distribution',
                'Q-Q Plot Statistics',
                'Statistic',
                'p-value',
                'Slope',
                'Intercept',
                'Values',
                'Frequency',
                'Theoretical Quantiles',
                'Sample Quantiles',
                'Q-Q Points',
                'Theoretical Line'
            ];

            // Translate labels
            const translations = await translateText(labelsToTranslate, "bn");
            const translated = {};
            labelsToTranslate.forEach((key, idx) => {
                translated[key] = translations[idx];
            });
            setTranslatedLabels(translated);

            // Translate numbers
            const numbersToTranslate = collectNumbersToTranslate();
            if (numbersToTranslate.length > 0) {
                const numberTranslations = await translateText(numbersToTranslate, "bn");
                const translatedNums = {};
                numbersToTranslate.forEach((key, idx) => {
                    translatedNums[key] = numberTranslations[idx];
                });
                setTranslatedNumbers(translatedNums);
            }
        };

        loadTranslations();
    }, [language, results]);

    const getLabel = (text) => {
        if (language === 'English' || language === 'en') {
            return text;
        }
        return translatedLabels[text] || text;
    };

    const getNumber = (num) => {
        if (language === 'English' || language === 'en') {
            return String(num);
        }
        const key = String(num);
        return translatedNumbers[key] || key;
    };

    const mapDigit = (text) => {
        if (!text) return '';
        return getNumber(text);
    };

    React.useEffect(() => {
        if (results?.column_names?.sample || results?.column_name) {
            const label = results.column_names?.sample || results.column_name;
            setHistogramSettings(prev => ({ 
                ...prev, 
                categoryLabels: [label],
                xAxisTitle: label
            }));
            setQqSettings(prev => ({ 
                ...prev, 
                categoryLabels: [label]
            }));
        }
    }, [results?.column_names?.sample, results?.column_name]);

    const openCustomization = (plotType) => {
        setCurrentPlotType(plotType);
        setOverlayOpen(true);
    };

    const getCurrentSettings = () => {
        switch (currentPlotType) {
            case 'Histogram': return histogramSettings;
            case 'QQ': return qqSettings;
            default: return histogramSettings;
        }
    };

    const setCurrentSettings = (settings) => {
        switch (currentPlotType) {
            case 'Histogram': setHistogramSettings(settings); break;
            case 'QQ': setQqSettings(settings); break;
        }
    };

    const handleDownload = async (format) => {
        setDownloadMenuOpen(false);

        if (!chartRef.current) {
            alert(getLabel('Chart not found'));
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
            alert(getLabel('Error downloading image'));
        }
    };

    if (!results || !results.plot_data) {
        return (
            <div className="stats-loading">
                <div className="stats-spinner"></div>
                <p>{getLabel('Loading results...')}</p>
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
                alert(getLabel('Result saved successfully'));
            } else {
                console.error('Error saving result:', response.statusText);
                alert(getLabel('Error saving result'));
            }
        } catch (error) {
            console.error('Error saving result:', error);
            alert(getLabel('Error saving result'));
        }
    };

    const t = {
        testStatistic: getLabel('Test Statistic (W)'),
        pValue: getLabel('P-Value'),
        normal: getLabel('Data follows normal distribution (p ≥ 0.05)'),
        notNormal: getLabel('Data does not follow normal distribution (p < 0.05)'),
        shapiroTitle: getLabel('Shapiro-Wilk Normality Test'),
        histogram: getLabel('Histogram'),
        qqPlot: getLabel('Q-Q Plot'),
        observations: getLabel('Observations'),
        mean: getLabel('Mean'),
        stdDev: getLabel('Std. Deviation'),
        skewness: getLabel('Skewness'),
        kurtosis: getLabel('Kurtosis')
    };

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
                            {entry.name}: {typeof entry.value === 'number' ? mapDigit(entry.value.toFixed(4)) : entry.value}
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
        // If manual min/max are specified, use them
        if (settings.yAxisMin !== 'auto' && settings.yAxisMin !== '' && settings.yAxisMax !== 'auto' && settings.yAxisMax !== '') {
            const min = parseFloat(settings.yAxisMin);
            const max = parseFloat(settings.yAxisMax);
            if (!isNaN(min) && !isNaN(max)) {
                return [min, max];
            }
        }
        
        // For histogram, ensure we include all data with proper padding
        if (dataKey === 'frequency' && data && data.length > 0) {
            const maxValue = Math.max(...data.map(d => d[dataKey]));
            return [0, maxValue * 1.1]; // 10% padding at top
        }
        
        return ['auto', 'auto'];
    };

    const getGridStroke = (gridColor) => {
        return gridColor === 'black' ? '#000000' : '#e5e7eb';
    };

    const renderHistogramChart = () => {
        const settings = histogramSettings;
        const { height } = getDimensions(settings.dimensions);
        
        const plotData = results.plot_data || {};
        const sampleData = plotData.sample || {};
        const dataValues = sampleData.values || [];
        
        const binCount = settings.histogramBins || 30;
        
        // Create histogram data (same as Wilcoxon)
        const minVal = Math.min(...dataValues);
        const maxVal = Math.max(...dataValues);
        const binWidth = (maxVal - minVal) / binCount;
        
        const histogramData = [];
        for (let i = 0; i < binCount; i++) {
            const binStart = minVal + i * binWidth;
            const binEnd = binStart + binWidth;
            const count = dataValues.filter(val => val >= binStart && val < binEnd).length;
            histogramData.push({
                bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
                midPoint: parseFloat(((binStart + binEnd) / 2).toFixed(1)),
                count: count,
                frequency: count
            });
        }

        // Generate normal curve data
        const normalCurveData = [];
        if (settings.showNormalCurve) {
            const mean = sampleData.mean || 0;
            const std = sampleData.std || 1;
            const points = 100;
            
            for (let i = 0; i <= points; i++) {
                const x = minVal + (maxVal - minVal) * (i / points);
                const y = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
                // Scale to match histogram frequency
                const scaledY = y * dataValues.length * binWidth;
                normalCurveData.push({ 
                    x: x, 
                    y: scaledY,
                    theoretical: scaledY 
                });
            }
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
                        {getLabel('Customize')}
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button className="customize-btn" onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            {getLabel('Download')}
                        </button>
                        {downloadMenuOpen && (
                            <div className="download-menu">
                                <button onClick={() => handleDownload('png')}>{getLabel('PNG')}</button>
                                <button onClick={() => handleDownload('jpg')}>{getLabel('JPG')}</button>
                                <button onClick={() => handleDownload('jpeg')}>{getLabel('JPEG')}</button>
                                <button onClick={() => handleDownload('pdf')}>{getLabel('PDF')}</button>
                            </div>
                        )}
                    </div>
                </div>
                <div ref={chartRef} style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={height}>
                        <ComposedChart
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
                                    formatter: (value) => value > 0 ? mapDigit(value) : ''
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
            x: th,
            y: ordered[idx]
        }));

        // Create reference line data (same as Wilcoxon)
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
                x: th,
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
                        {getLabel('Customize')}
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button className="customize-btn" onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            {getLabel('Download')}
                        </button>
                        {downloadMenuOpen && (
                            <div className="download-menu">
                                <button onClick={() => handleDownload('png')}>{getLabel('PNG')}</button>
                                <button onClick={() => handleDownload('jpg')}>{getLabel('JPG')}</button>
                                <button onClick={() => handleDownload('jpeg')}>{getLabel('JPEG')}</button>
                                <button onClick={() => handleDownload('pdf')}>{getLabel('PDF')}</button>
                            </div>
                        )}
                    </div>
                </div>
                <div ref={chartRef} style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={height}>
                        <ComposedChart  
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
                                    paddingBottom: settings.legendPosition === 'bottom' ? '10px' : '0'
                                    }}
                                />
                            )}

                            {/* Scatter Points */}
                            {settings.showScatterPoints && (
                                <Scatter
                                    name={getLabel('Q-Q Points')}
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
                            
                            {/* Reference Line */}
                            {settings.showReferenceLine && linePoints.length > 0 && (
                                <Line
                                    name={getLabel('Theoretical Line')}
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

                {/* Normality Test Display (same as Wilcoxon) */}
                {settings.showCriticalValues && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                            {getLabel('Normality Test and Statistics')}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {getLabel('Shapiro-Wilk Test')}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                    <div>{getLabel('Statistic')}: {mapDigit(qqData.shapiro_stat?.toFixed(4))}</div>
                                    <div>{getLabel('p-value')}: {mapDigit(qqData.shapiro_p?.toFixed(6))}</div>
                                    <div style={{ fontWeight: 'bold', color: qqData.shapiro_p > 0.05 ? '#059669' : '#dc2626' }}>
                                        {qqData.shapiro_p > 0.05 ? 
                                            getLabel('Normal Distribution') : 
                                            getLabel('Non-normal Distribution')}
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {getLabel('Q-Q Plot Statistics')}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                    <div>R²: {mapDigit(qqData.r_squared?.toFixed(4))}</div>
                                    <div>{getLabel('Slope')}: {mapDigit(qqData.slope?.toFixed(4))}</div>
                                    <div>{getLabel('Intercept')}: {mapDigit(qqData.intercept?.toFixed(4))}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="stats-results-container stats-fade-in">
            <div className="stats-header">
                <h2 className="stats-title">{t.shapiroTitle}</h2>
                <button onClick={handleSaveResult} className="stats-save-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {getLabel('Save Result')}
                </button>
            </div>

            <div className="stats-results-table-wrapper">
                <table className="stats-results-table">
                    <thead>
                        <tr>
                            <th>{getLabel('Description')}</th>
                            <th>{getLabel('Value')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="stats-table-label">{getLabel('Analyzed Column')}</td>
                            <td className="stats-table-value">{results.column_names?.sample || results.column_name || columns?.[0] || 'Data'}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.observations}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.n_observations || results.plot_data?.sample?.count)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.testStatistic}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.statistic?.toFixed(4))}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.pValue}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.p_value?.toFixed(6))}</td>
                        </tr>
                        {results.descriptive_stats?.mean && (
                            <tr>
                                <td className="stats-table-label">{t.mean}</td>
                                <td className="stats-table-value stats-numeric">{mapDigit(results.descriptive_stats.mean.toFixed(4))}</td>
                            </tr>
                        )}
                        {results.descriptive_stats?.std_dev && (
                            <tr>
                                <td className="stats-table-label">{t.stdDev}</td>
                                <td className="stats-table-value stats-numeric">{mapDigit(results.descriptive_stats.std_dev.toFixed(4))}</td>
                            </tr>
                        )}
                        {results.descriptive_stats?.skewness && (
                            <tr>
                                <td className="stats-table-label">{t.skewness}</td>
                                <td className="stats-table-value stats-numeric">{mapDigit(results.descriptive_stats.skewness.toFixed(4))}</td>
                            </tr>
                        )}
                        {results.descriptive_stats?.kurtosis && (
                            <tr>
                                <td className="stats-table-label">{t.kurtosis}</td>
                                <td className="stats-table-value stats-numeric">{mapDigit(results.descriptive_stats.kurtosis.toFixed(4))}</td>
                            </tr>
                        )}
                        <tr className="stats-conclusion-row">
                            <td className="stats-table-label">{getLabel('Conclusion')}</td>
                            <td className="stats-table-value">
                                <div className="stats-conclusion-inline">
                                    {results.p_value >= 0.05 ? (
                                        <>
                                            <svg className="stats-conclusion-icon" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="stats-conclusion-text significant">{t.normal}</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="stats-conclusion-icon" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="stats-conclusion-text not-significant">{t.notNormal}</span>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="stats-viz-section">
                <h3 className="stats-viz-header">{getLabel('Visualizations')}</h3>

                <div className="stats-tab-container">
                    <button className={`stats-tab ${activeTab === 'histogram' ? 'active' : ''}`} onClick={() => setActiveTab('histogram')}>{t.histogram}</button>
                    <button className={`stats-tab ${activeTab === 'qq' ? 'active' : ''}`} onClick={() => setActiveTab('qq')}>{t.qqPlot}</button>
                </div>

                <div className="stats-plot-container">
                    {activeTab === 'histogram' && (
                        <div className="stats-plot-wrapper active">
                            {renderHistogramChart()}
                        </div>
                    )}

                    {activeTab === 'qq' && (
                        <div className="stats-plot-wrapper active">
                            {renderQQChart()}
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
                language={language === 'bn' || language === 'বাংলা' ? 'বাংলা' : 'English'}
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

export default renderShapiroResults;