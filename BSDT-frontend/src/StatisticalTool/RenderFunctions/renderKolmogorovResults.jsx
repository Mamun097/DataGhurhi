import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart, ComposedChart, Legend } from 'recharts';
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
    const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

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
        xAxisTitle: 'Values',
        yAxisTitle: 'Cumulative Probability',
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
        dataLabelsOn: true,
        
        showECDF: true,
        showCDF: true,
        showDistributionParameters: true,
        ecdfColor: '#3b82f6',
        cdfColor: '#ef4444',
        lineStyle: 'solid',
        lineWidth: 2,
        pointSize: 4,
        
        elementWidth: 0.8,
        categoryLabels: categoryNames || Array(categoryCount).fill('').map((_, i) => `Category ${i + 1}`),
        categoryColors: Array(categoryCount).fill('').map((_, i) => defaultColors[i % defaultColors.length]),
        legendOn: true, 
        legendPosition: 'top',
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

const renderKolmogorovResults = (kolmogorovActiveTab, setKolmogorovActiveTab, results, language, user_id, testType, filename, columns) => {
    const activeTab = kolmogorovActiveTab;
    const setActiveTab = setKolmogorovActiveTab;

    const [overlayOpen, setOverlayOpen] = useState(false);
    const [currentPlotType, setCurrentPlotType] = useState('ECDF');
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const chartRef = useRef(null);
    const [translatedLabels, setTranslatedLabels] = useState({});
    const [translatedNumbers, setTranslatedNumbers] = useState({});

    const [ecdfSettings, setEcdfSettings] = useState(
        getDefaultSettings('ECDF', 1, [])
    );

    // Collect all numbers that need translation
    const collectNumbersToTranslate = () => {
        const numbers = new Set();
        
        if (results.statistic !== null && results.statistic !== undefined) {
            numbers.add(results.statistic.toFixed(4));
        }
        if (results.p_value !== null && results.p_value !== undefined) {
            numbers.add(results.p_value.toFixed(6));
        }
        
        const plotData = results.plot_data || {};
        if (plotData.statistics) {
            if (plotData.statistics.sample_size) numbers.add(String(plotData.statistics.sample_size));
            if (plotData.statistics.mean !== null && plotData.statistics.mean !== undefined) {
                numbers.add(plotData.statistics.mean.toFixed(4));
            }
            if (plotData.statistics.std !== null && plotData.statistics.std !== undefined) {
                numbers.add(plotData.statistics.std.toFixed(4));
            }
        }
        
        if (results.metadata?.sample_size) {
            numbers.add(String(results.metadata.sample_size));
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
                'Test Statistic (D)',
                'P-Value',
                'Not normal distribution (p < 0.05)',
                'Normal distribution (p ≥ 0.05)',
                'Kolmogorov-Smirnov Test',
                'ECDF Plot',
                'Distribution Parameters',
                'Sample Size',
                'Mean',
                'Standard Deviation',
                'Tested Distribution',
                'Normal Distribution',
                'Empirical CDF',
                'Theoretical CDF',
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
                'Analyzed Column',
                'Conclusion'
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
        if (results.plot_data) {
            // Update settings with actual data if needed
        }
    }, [results.plot_data]);

    const openCustomization = (plotType) => {
        setCurrentPlotType(plotType);
        setOverlayOpen(true);
    };

    const getCurrentSettings = () => {
        switch (currentPlotType) {
            case 'ECDF':
            case 'CDF':
                return ecdfSettings;
            default:
                return ecdfSettings;
        }
    };

    const setCurrentSettings = (settings) => {
        switch (currentPlotType) {
            case 'ECDF':
            case 'CDF':
                setEcdfSettings(settings);
                break;
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

    const plotData = results.plot_data || {};
    const variableColumn = results.column_names?.variable || columns?.[0] || 'Variable';

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
                        {getLabel('Value')}: {typeof label === 'number' ? mapDigit(label.toFixed(2)) : label}
                    </p>
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

    const getYAxisDomain = (settings) => {
        if (settings.yAxisMin !== 'auto' && settings.yAxisMin !== '' && settings.yAxisMax !== 'auto' && settings.yAxisMax !== '') {
            const min = parseFloat(settings.yAxisMin);
            const max = parseFloat(settings.yAxisMax);
            if (!isNaN(min) && !isNaN(max)) {
                return [min, max];
            }
        }
        return [0, 1];
    };

    const getGridStroke = (gridColor) => {
        return gridColor === 'black' ? '#000000' : '#e5e7eb';
    };

    const getLineStrokeDasharray = (lineStyle) => {
        switch (lineStyle) {
            case 'dashed': return '5 5';
            case 'dotted': return '2 2';
            default: return '0';
        }
    };

    const renderECDFChart = () => {
        const settings = ecdfSettings;
        const { height } = getDimensions(settings.dimensions);

        const ecdfData = plotData.ecdf?.x.map((x, i) => ({
            x: x,
            ecdf: plotData.ecdf.y[i],
            cdf: plotData.cdf?.y[i] || null
        })) || [];

        const cdfData = plotData.cdf?.x.map((x, i) => ({
            x: x,
            cdf: plotData.cdf.y[i]
        })) || [];

        const yDomain = getYAxisDomain(settings);

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('ECDF')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                        </svg>
                        {getLabel('Customize')}
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button
                            className="customize-btn"
                            onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                        >
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
                                dataKey="x"
                                type="number"
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

                            {settings.showECDF && (
                                <Line
                                    type="stepAfter"
                                    dataKey="ecdf"
                                    data={ecdfData}
                                    stroke={settings.ecdfColor}
                                    strokeWidth={settings.lineWidth}
                                    strokeDasharray={getLineStrokeDasharray(settings.lineStyle)}
                                    dot={{ fill: settings.ecdfColor, r: settings.pointSize }}
                                    name={getLabel('Empirical CDF')}
                                />
                            )}
                            
                            {settings.showCDF && (
                                <Line
                                    type="monotone"
                                    dataKey="cdf"
                                    data={cdfData}
                                    stroke={settings.cdfColor}
                                    strokeWidth={settings.lineWidth + 1}
                                    strokeDasharray={getLineStrokeDasharray(settings.lineStyle)}
                                    dot={false}
                                    name={getLabel('Theoretical CDF')}
                                    connectNulls={true}
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

                {settings.showDistributionParameters && plotData.statistics && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                            {getLabel('Distribution Parameters')}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>{getLabel('Tested Distribution')}</div>
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>{getLabel('Normal Distribution')}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>{getLabel('Mean')}</div>
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>{mapDigit(plotData.statistics.mean.toFixed(4))}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>{getLabel('Standard Deviation')}</div>
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>{mapDigit(plotData.statistics.std.toFixed(4))}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>{getLabel('Sample Size')}</div>
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>{mapDigit(plotData.statistics.sample_size)}</div>
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
                <h2 className="stats-title">{getLabel('Kolmogorov-Smirnov Test')}</h2>
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
                            <td className="stats-table-value">{variableColumn}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('Sample Size')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(plotData.statistics?.sample_size || results.metadata?.sample_size)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('Test Statistic (D)')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.statistic.toFixed(4))}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('P-Value')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.p_value.toFixed(6))}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('Mean')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(plotData.statistics?.mean.toFixed(4))}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('Standard Deviation')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(plotData.statistics?.std.toFixed(4))}</td>
                        </tr>
                        <tr className="stats-conclusion-row">
                            <td className="stats-table-label">{getLabel('Conclusion')}</td>
                            <td className="stats-table-value">
                                <div className="stats-conclusion-inline">
                                    {results.p_value < 0.05 ? (
                                        <>
                                            <svg className="stats-conclusion-icon" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="stats-conclusion-text significant">{getLabel('Not normal distribution (p < 0.05)')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="stats-conclusion-icon" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="stats-conclusion-text not-significant">{getLabel('Normal distribution (p ≥ 0.05)')}</span>
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
                    <button className={`stats-tab ${activeTab === 'ecdf' ? 'active' : ''}`} onClick={() => setActiveTab('ecdf')}>{getLabel('ECDF Plot')}</button>
                </div>

                <div className="stats-plot-container">
                    {activeTab === 'ecdf' && (
                        <div className="stats-plot-wrapper active">
                            {renderECDFChart()}
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

export default renderKolmogorovResults;