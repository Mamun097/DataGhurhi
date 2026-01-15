import React, { useState, useEffect, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend, Cell } from 'recharts';
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
        xAxisTitle: 'Independent Variable',
        yAxisTitle: 'Dependent Variable',
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
        legendOn: true, 
        legendPosition: 'top'
    };

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
    } else if (plotType === 'Residual') {
        return {
            ...baseSettings,
            xAxisTitle: 'Independent Variable',
            yAxisTitle: 'Residuals',
            showScatterPoints: true,
            showReferenceLine: true,
            scatterSize: 6,
            scatterOpacity: 0.7,
            scatterColor: '#3b82f6',
            referenceLineColor: '#ef4444',
            referenceLineWidth: 2,
            referenceLineStyle: 'solid',
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

const renderLinearRegressionResults = (linearRegressionActiveTab, setLinearRegressionActiveTab, results, language, user_id, testType, filename, columns) => {
    const activeTab = linearRegressionActiveTab;
    const setActiveTab = setLinearRegressionActiveTab;

    const [overlayOpen, setOverlayOpen] = useState(false);
    const [currentPlotType, setCurrentPlotType] = useState('Scatter');
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const chartRef = useRef(null);
    const [translatedLabels, setTranslatedLabels] = useState({});
    const [translatedNumbers, setTranslatedNumbers] = useState({});

    const [scatterSettings, setScatterSettings] = useState(
        getDefaultSettings('Scatter', results.data_points?.length || 0)
    );
    const [residualSettings, setResidualSettings] = useState(
        getDefaultSettings('Residual', results.data_points?.length || 0)
    );

    // Collect all numbers that need translation
    const collectNumbersToTranslate = () => {
        const numbers = new Set();
        
        if (results.intercept !== null && results.intercept !== undefined) {
            numbers.add(results.intercept.toFixed(4));
        }
        if (results.coefficient !== null && results.coefficient !== undefined) {
            numbers.add(results.coefficient.toFixed(4));
        }
        if (results.r_squared !== null && results.r_squared !== undefined) {
            numbers.add(results.r_squared.toFixed(4));
        }
        if (results.adjusted_r_squared !== null && results.adjusted_r_squared !== undefined) {
            numbers.add(results.adjusted_r_squared.toFixed(4));
        }
        if (results.mean_squared_error !== null && results.mean_squared_error !== undefined) {
            numbers.add(results.mean_squared_error.toFixed(4));
        }
        if (results.root_mean_squared_error !== null && results.root_mean_squared_error !== undefined) {
            numbers.add(results.root_mean_squared_error.toFixed(4));
        }
        
        // Critical values
        if (results.critical_values) {
            if (results.critical_values.lower !== null && results.critical_values.lower !== undefined) {
                numbers.add(results.critical_values.lower.toFixed(4));
            }
            if (results.critical_values.upper !== null && results.critical_values.upper !== undefined) {
                numbers.add(results.critical_values.upper.toFixed(4));
            }
            if (results.critical_values.mean_difference !== null && results.critical_values.mean_difference !== undefined) {
                numbers.add(results.critical_values.mean_difference.toFixed(4));
            }
        }
        
        return Array.from(numbers);
    };

    // Load translations
    useEffect(() => {
        const loadTranslations = async () => {
            if (language === 'English' || language === 'en') {
                setTranslatedLabels({});
                setTranslatedNumbers({});
                return;
            }

            const labelsToTranslate = [
                'Linear Regression',
                'Independent Variable',
                'Dependent Variable',
                'Intercept',
                'Coefficient',
                'R-Squared',
                'Adjusted R-Squared',
                'Mean Squared Error',
                'Equation',
                'Scatter Plot',
                'Residual Plot',
                'Regression Line',
                'Confidence Interval',
                'Prediction Interval',
                'Significant relationship',
                'No significant relationship',
                'Customize',
                'Download',
                'PNG',
                'JPG',
                'JPEG',
                'PDF',
                'Chart not found',
                'Error downloading image',
                'Loading results...',
                'Save Result',
                'Result saved successfully',
                'Error saving result',
                'Description',
                'Value',
                'Visualizations',
                'Analyzed Columns',
                'and',
                'Conclusion',
                'Data Points',
                'Reference Line',
                'Residual Points',
                'Critical Values',
                'Lower Bound',
                'Mean Difference',
                'Upper Bound',
                'Regression R²',
                'Zero Reference Line',
                'Residual Statistics',
                'Mean Residual',
                'Residual SD',
                'Residual Range',
                'to'
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

    useEffect(() => {
        if (results.data_points && results.data_points.length > 0) {
            setScatterSettings(prev => ({ ...prev }));
            setResidualSettings(prev => ({ ...prev }));
        }
    }, [results.data_points]);

    const openCustomization = (plotType) => {
        setCurrentPlotType(plotType);
        setOverlayOpen(true);
    };

    const getCurrentSettings = () => {
        switch (currentPlotType) {
            case 'Scatter': return scatterSettings;
            case 'Residual': return residualSettings;
            default: return scatterSettings;
        }
    };

    const setCurrentSettings = (settings) => {
        switch (currentPlotType) {
            case 'Scatter': setScatterSettings(settings); break;
            case 'Residual': setResidualSettings(settings); break;
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

    if (!results || !results.data_points) {
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
                    <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '4px' }}>
                        {payload[0]?.payload?.x !== undefined ? `${getLabel('Independent Variable')}: ${mapDigit(payload[0].payload.x.toFixed(2))}` : ''}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ margin: 0, color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' ? mapDigit(entry.value.toFixed(2)) : entry.value}
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

    const getAxisDomain = (settings, data, dataKey, axisType) => {
        if (axisType === 'y' && settings.yAxisMin !== 'auto' && settings.yAxisMin !== '' && settings.yAxisMax !== 'auto' && settings.yAxisMax !== '') {
            const min = parseFloat(settings.yAxisMin);
            const max = parseFloat(settings.yAxisMax);
            if (!isNaN(min) && !isNaN(max)) {
                return [min, max];
            }
        }
        if (axisType === 'x' && settings.xAxisMin !== 'auto' && settings.xAxisMin !== '' && settings.xAxisMax !== 'auto' && settings.xAxisMax !== '') {
            const min = parseFloat(settings.xAxisMin);
            const max = parseFloat(settings.xAxisMax);
            if (!isNaN(min) && !isNaN(max)) {
                return [min, max];
            }
        }
        return ['auto', 'auto'];
    };

    const getGridStroke = (gridColor) => {
        return gridColor === 'black' ? '#000000' : '#e5e7eb';
    };

    const getLineStyle = (style) => {
        switch (style) {
            case 'dashed': return '5 5';
            case 'dotted': return '2 2';
            default: return null;
        }
    };

    const scatterData = results.data_points?.map(point => ({
        x: point.x,
        y: point.y,
        predicted: point.predicted,
        residual: point.residual
    })) || [];

    const regressionLineData = results.regression_line || [];

    const renderScatterChart = () => {
        const settings = scatterSettings;
        const { height } = getDimensions(settings.dimensions);
        
        const plotData = results.plot_data || {};
        const sample1 = plotData.sample1?.values || results.data_points?.map(p => p.x) || [];
        const sample2 = plotData.sample2?.values || results.data_points?.map(p => p.y) || [];
        
        const scatterData = sample1.map((val, index) => ({
            x: val,
            y: sample2[index],
            pair: index + 1
        }));

        const regressionData = plotData.regression || {
            slope: results.coefficient,
            intercept: results.intercept,
            r_squared: results.r_squared
        };
        
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
                            margin={{ top: settings.captionOn ? 50 : 30, right: settings.legendOn ? 100 : 20, left: 20, bottom: 40 }}
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
                            
                            {settings.showScatterPoints && (
                                <Scatter
                                    name={getLabel('Data Points')}
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
                            
                            {settings.showRegressionLines && (
                                <Line
                                    name={getLabel('Regression Line')}
                                    type="linear"
                                    dataKey="y"
                                    data={regressionLine}
                                    stroke={settings.qqLineColor || '#ef4444'}
                                    strokeWidth={settings.lineWidth || 2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            )}
                            
                            {settings.showReferenceLine && (
                                <Line
                                    name={getLabel('Reference Line')}
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

                {settings.showCriticalValues && results.critical_values && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                            {getLabel('Critical Values')}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {getLabel('Lower Bound')}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {mapDigit(results.critical_values.lower?.toFixed(4))}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {getLabel('Mean Difference')}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {mapDigit(results.critical_values.mean_difference?.toFixed(4))}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {getLabel('Upper Bound')}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {mapDigit(results.critical_values.upper?.toFixed(4))}
                                </div>
                            </div>
                        </div>
                        {regressionData.r_squared && (
                            <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {getLabel('Regression R²')}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {mapDigit(regressionData.r_squared.toFixed(4))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderResidualPlot = () => {
        const settings = residualSettings;
        const { height } = getDimensions(settings.dimensions);

        const residualData = results.residual_data ? 
            results.residual_data.independent.map((x, index) => ({
                x: x,
                y: results.residual_data.values[index],
                fitted: results.residual_data.fitted[index]
            })) : 
            results.data_points?.map(point => ({
                x: point.x,
                y: point.residual,
                fitted: point.predicted
            })) || [];

        const minX = Math.min(...residualData.map(d => d.x));
        const maxX = Math.max(...residualData.map(d => d.x));
        const zeroReferenceLine = [
            { x: minX, y: 0 },
            { x: maxX, y: 0 }
        ];

        const yDomain = getYAxisDomain(settings, residualData, 'y');

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('Residual')}>
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
                                    paddingBottom: settings.legendPosition === 'bottom' ? '10px' : '0',
                                    }}
                                />
                            )}                            
                            
                            {settings.showReferenceLine && (
                                <Line
                                    name={getLabel('Zero Reference Line')}
                                    type="linear"
                                    dataKey="y"
                                    data={zeroReferenceLine}
                                    stroke={settings.referenceLineColor || '#ef4444'}
                                    strokeWidth={settings.referenceLineWidth || 2}
                                    strokeDasharray={settings.referenceLineStyle === 'dashed' ? '5 5' : 
                                                settings.referenceLineStyle === 'dotted' ? '2 2' : '0'}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            )}
                            
                            {settings.showScatterPoints && (
                                <Scatter
                                    name={getLabel('Residual Points')}
                                    data={residualData}
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
                        </ComposedChart>
                    </ResponsiveContainer>

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

                {settings.showCriticalValues && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                            {getLabel('Residual Statistics')}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {getLabel('Mean Residual')}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {mapDigit(results.critical_values?.mean_difference?.toFixed(4) || '0.0000')}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {getLabel('Residual SD')}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {mapDigit(results.root_mean_squared_error?.toFixed(4))}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {getLabel('Residual Range')}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {mapDigit(results.critical_values?.lower?.toFixed(4))} {getLabel('to')} {mapDigit(results.critical_values?.upper?.toFixed(4))}
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
                <h2 className="stats-title">{getLabel('Linear Regression')}</h2>
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
                            <td className="stats-table-label">{getLabel('Analyzed Columns')}</td>
                            <td className="stats-table-value">{results.column_names?.independent || columns?.[0]} {getLabel('and')} {results.column_names?.dependent || columns?.[1]}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('Intercept')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.intercept?.toFixed(4))}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('Coefficient')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.coefficient?.toFixed(4))}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('R-Squared')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.r_squared?.toFixed(4))}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('Adjusted R-Squared')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.adjusted_r_squared?.toFixed(4))}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('Mean Squared Error')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.mean_squared_error?.toFixed(4))}</td>
                        </tr>
                        <tr className="stats-conclusion-row">
                            <td className="stats-table-label">{getLabel('Equation')}</td>
                            <td className="stats-table-value">
                                <div className="stats-conclusion-inline">
                                    y = {mapDigit(results.coefficient?.toFixed(4))}x {results.intercept >= 0 ? '+' : ''} {mapDigit(results.intercept?.toFixed(4))}
                                </div>
                            </td>
                        </tr>
                        <tr className="stats-conclusion-row">
                            <td className="stats-table-label">{getLabel('Conclusion')}</td>
                            <td className="stats-table-value">
                                <div className="stats-conclusion-inline">
                                    {results.significant ? (
                                        <>
                                            <svg className="stats-conclusion-icon" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="stats-conclusion-text significant">{getLabel('Significant relationship')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="stats-conclusion-icon" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="stats-conclusion-text not-significant">{getLabel('No significant relationship')}</span>
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
                    <button className={`stats-tab ${activeTab === 'scatter' ? 'active' : ''}`} onClick={() => setActiveTab('scatter')}>{getLabel('Scatter Plot')}</button>
                    <button className={`stats-tab ${activeTab === 'residuals' ? 'active' : ''}`} onClick={() => setActiveTab('residuals')}>{getLabel('Residual Plot')}</button>
                </div>

                <div className="stats-plot-container">
                    {activeTab === 'scatter' && (
                        <div className="stats-plot-wrapper active">
                            {renderScatterChart()}
                        </div>
                    )}

                    {activeTab === 'residuals' && (
                        <div className="stats-plot-wrapper active">
                            {renderResidualPlot()}
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

export default renderLinearRegressionResults;