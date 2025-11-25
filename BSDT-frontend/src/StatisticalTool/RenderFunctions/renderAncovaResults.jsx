import React, { useState, useEffect, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend } from 'recharts';
import CustomizationOverlay from './CustomizationOverlay for Ancova/CustomizationOverlay';
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
        xAxisTitle: 'Covariate',
        yAxisTitle: 'Outcome',
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
        elementWidth: 0.8,
        categoryLabels: categoryNames || Array(categoryCount).fill('').map((_, i) => `Category ${i + 1}`),
        categoryColors: Array(categoryCount).fill('').map((_, i) => defaultColors[i % defaultColors.length]),
        legendOn: true, 
        legendPosition: 'top'
    };

    // Add plot-specific settings
    if (plotType === 'Scatter') {
        return {
            ...baseSettings,
            showScatterPoints: true,
            showRegressionLines: true,
            showReferenceLine: false,
            showCriticalValues: true,
            scatterSize: 6,
            scatterOpacity: 0.7,
            scatterColor: '#3b82f6',
            qqLineColor: '#ef4444',
            referenceLineColor: '#dc2626',
            referenceLineWidth: 2,
            referenceLineStyle: 'dashed',
            lineWidth: 2,
            legendOn: true, 
            legendPosition: 'top'
        };
    } else if (plotType === 'Residual') {
        return {
            ...baseSettings,
            xAxisTitle: 'Covariate',
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

const renderAncovaResults = (ancovaActiveTab, setAncovaActiveTab, results, language, user_id, testType, filename, columns) => {
    const mapDigitIfBengali = (text) => {
        if (!text) return '';
        if (language !== 'বাংলা') return text;
        const digitMapBn = {
            '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
            '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
            '.': '.', '-': '-'
        };
        return text.toString().split('').map(char => digitMapBn[char] || char).join('');
    };

    const activeTab = ancovaActiveTab;
    const setActiveTab = setAncovaActiveTab;

    const [overlayOpen, setOverlayOpen] = React.useState(false);
    const [currentPlotType, setCurrentPlotType] = React.useState('Scatter');
    const [downloadMenuOpen, setDownloadMenuOpen] = React.useState(false);
    const chartRef = React.useRef(null);

    const categoryNames = results.plot_data?.map(d => d.category) || [];
    const categoryCount = categoryNames.length;

    const [scatterSettings, setScatterSettings] = React.useState(
        getDefaultSettings('Scatter', categoryCount, categoryNames)
    );
    const [residualSettings, setResidualSettings] = React.useState(
        getDefaultSettings('Residual', categoryCount, categoryNames)
    );

    React.useEffect(() => {
        if (results.plot_data && results.plot_data.length > 0) {
            const labels = results.plot_data.map(d => d.category);
            setScatterSettings(prev => ({ ...prev, categoryLabels: labels }));
            setResidualSettings(prev => ({ ...prev, categoryLabels: labels }));
        }
    }, [results.plot_data]);

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
        fStatistic: language === 'বাংলা' ? 'এফ-পরিসংখ্যান' : 'F-Statistic',
        pValue: language === 'বাংলা' ? 'পি-মান' : 'P-Value',
        significant: language === 'বাংলা' ? 'উল্লেখযোগ্য প্রভাব পাওয়া গেছে (p < 0.05)' : 'Significant effect found (p < 0.05)',
        notSignificant: language === 'বাংলা' ? 'কোনো উল্লেখযোগ্য প্রভাব নেই (p ≥ 0.05)' : 'No significant effect (p ≥ 0.05)',
        ancovaTitle: language === 'বাংলা' ? 'এনকোভা (ANCOVA)' : 'ANCOVA (Analysis of Covariance)',
        scatterPlot: language === 'বাংলা' ? 'স্ক্যাটার প্লট' : 'Scatter Plot',
        residualPlot: language === 'বাংলা' ? 'রেসিডুয়াল প্লট' : 'Residual Plot',
        groupEffect: language === 'বাংলা' ? 'গ্রুপ প্রভাব' : 'Group Effect',
        covariateEffect: language === 'বাংলা' ? 'কোভ্যারিয়েট প্রভাব' : 'Covariate Effect'
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
                        {payload[0]?.payload?.group ? `${language === 'বাংলা' ? 'গ্রুপ' : 'Group'}: ${payload[0].payload.group}` : ''}
                    </p>
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

    const getLineStyle = (style) => {
        switch (style) {
            case 'dashed': return '5 5';
            case 'dotted': return '2 2';
            default: return null;
        }
    };

    // Prepare scatter plot data with groups - USE NEW DATA STRUCTURE
    const scatterData = results.data_points || [];
    
    // Group data by category for coloring
    const groupedData = {};
    scatterData.forEach(point => {
        if (!groupedData[point.group]) {
            groupedData[point.group] = [];
        }
        groupedData[point.group].push(point);
    });

    // Prepare regression lines for each group - USE NEW DATA STRUCTURE
    const regressionLines = results.regression_lines || {};

    const renderScatterChart = () => {
        const settings = scatterSettings;
        const { height } = getDimensions(settings.dimensions);
        
        const yDomain = getYAxisDomain(settings, scatterData, 'y');

        // Group scatter data by group for tooltips
        const groupedScatterData = {};
        scatterData.forEach(point => {
            if (!groupedScatterData[point.group]) {
                groupedScatterData[point.group] = [];
            }
            groupedScatterData[point.group].push(point);
        });

        // Prepare regression line data in proper format for Recharts
        const regressionLineComponents = [];
        Object.keys(regressionLines).forEach((groupName, groupIndex) => {
            const lineData = regressionLines[groupName];
            if (!lineData) return;
            
            // Convert regression line data to proper format
            const regressionData = lineData.x_range.map((x, i) => ({
                x: x,
                y: lineData.y_range[i],
                group: groupName,
                type: 'regression'
            }));
            
            regressionLineComponents.push(
                <Line
                    key={`regression-${groupName}`}
                    name={`${groupName} Regression`}
                    data={regressionData}
                    dataKey="y"
                    stroke={settings.categoryColors[groupIndex % settings.categoryColors.length]}
                    strokeWidth={settings.lineWidth || 2}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls={true}
                />
            );
        });

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
                                        paddingBottom: settings.legendPosition === 'bottom' ? '10px' : '0'
                                    }}
                                />
                            )}                            
                            
                            {/* Regression Lines - Show before scatter points so they're behind */}
                            {settings.showRegressionLines && regressionLineComponents}
                            
                            {/* Scatter Points - Show last so they're on top */}
                            {settings.showScatterPoints && Object.keys(groupedScatterData).map((groupName, groupIndex) => (
                                <Scatter
                                    key={groupName}
                                    name={groupName}
                                    data={groupedScatterData[groupName]}
                                    fill={settings.categoryColors[groupIndex % settings.categoryColors.length]}
                                    fillOpacity={settings.scatterOpacity}
                                    shape={(props) => {
                                        const { cx, cy } = props;
                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={settings.scatterSize / 2}  
                                                fill={settings.categoryColors[groupIndex % settings.categoryColors.length]}
                                                fillOpacity={settings.scatterOpacity}
                                            />
                                        );
                                    }}
                                />
                            ))}
                            
                            
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

                {/* Regression Equations Display */}
                {settings.showCriticalValues && Object.keys(regressionLines).length > 0 && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                            {language === 'বাংলা' ? 'গ্রুপ রিগ্রেশন সমীকরণ' : 'Group Regression Equations'}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                            {Object.keys(regressionLines).map((groupName, groupIndex) => {
                                const lineData = regressionLines[groupName];
                                if (!lineData) return null;
                                
                                return (
                                    <div key={groupName} style={{ 
                                        padding: '12px', 
                                        background: 'white', 
                                        borderRadius: '8px', 
                                        borderLeft: `4px solid ${settings.categoryColors[groupIndex % settings.categoryColors.length]}` 
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                            {groupName}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>
                                            y = {lineData.slope.toFixed(4)}x {lineData.intercept >= 0 ? '+' : ''} {lineData.intercept.toFixed(4)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                            R² = {calculateRSquared(groupedScatterData[groupName], lineData).toFixed(4)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ANCOVA Statistics Display */}
                {settings.showCriticalValues && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                            {language === 'বাংলা' ? 'এনকোভা পরিসংখ্যান' : 'ANCOVA Statistics'}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {t.groupEffect}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                    F = {results.f_statistic_group?.toFixed(4)}, p = {results.p_value_group?.toFixed(6)}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {t.covariateEffect}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                    F = {results.f_statistic_covariate?.toFixed(4)}, p = {results.p_value_covariate?.toFixed(6)}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    R²
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                    {results.metadata?.r_squared?.toFixed(4)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Helper function to calculate R-squared for each group
    const calculateRSquared = (data, regressionLine) => {
        if (!data || data.length === 0) return 0;
        
        const yValues = data.map(point => point.y);
        const yMean = yValues.reduce((sum, val) => sum + val, 0) / yValues.length;
        
        const totalSumOfSquares = yValues.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
        const residualSumOfSquares = data.reduce((sum, point) => {
            const predicted = regressionLine.slope * point.x + regressionLine.intercept;
            return sum + Math.pow(point.y - predicted, 2);
        }, 0);
        
        return totalSumOfSquares === 0 ? 0 : 1 - (residualSumOfSquares / totalSumOfSquares);
    };

    const renderResidualPlot = () => {
        const settings = residualSettings;
        const { height } = getDimensions(settings.dimensions);

        // Use residual data from backend - USE NEW DATA STRUCTURE
        const residualData = results.residual_data ? 
            results.residual_data.independent.map((x, index) => ({
                x: x,
                y: results.residual_data.values[index],
                group: scatterData[index]?.group || 'Unknown'
            })) : 
            scatterData.map(point => ({
                x: point.x,
                y: point.residual,
                group: point.group
            })) || [];

        // Group residual data
        const groupedResidualData = {};
        residualData.forEach(point => {
            if (!groupedResidualData[point.group]) {
                groupedResidualData[point.group] = [];
            }
            groupedResidualData[point.group].push(point);
        });

        // Create zero reference line data
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
                                        paddingBottom: settings.legendPosition === 'bottom' ? '10px' : '0'
                                    }}
                                />
                            )}

                            {/* Zero Reference Line */}
                            {settings.showReferenceLine && (
                                <Line
                                    name="Zero Reference"
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
                            
                            {/* Residual Points by Group */}
                            {settings.showScatterPoints && Object.keys(groupedResidualData).map((groupName, groupIndex) => (
                                <Scatter
                                    key={groupName}
                                    name={`${groupName} Residuals`}
                                    data={groupedResidualData[groupName]}
                                    fill={settings.categoryColors[groupIndex % settings.categoryColors.length]}
                                    fillOpacity={settings.scatterOpacity || 0.7}
                                    shape={(props) => {
                                        const { cx, cy } = props;
                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={settings.scatterSize / 2}  
                                                fill={settings.categoryColors[groupIndex % settings.categoryColors.length]}
                                                fillOpacity={settings.scatterOpacity || 0.7}
                                            />
                                        );
                                    }}
                                />
                            ))}
                                                        
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

                {/* Residual Statistics Display */}
                {settings.showCriticalValues && results.residual_data && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
                            {language === 'বাংলা' ? 'অবশিষ্ট পরিসংখ্যান' : 'Residual Statistics'}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {language === 'বাংলা' ? 'গড় অবশিষ্ট' : 'Mean Residual'}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {results.residual_data.statistics?.mean?.toFixed(4) || '0.0000'}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {language === 'বাংলা' ? 'অবশিষ্ট এসডি' : 'Residual SD'}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {results.residual_data.statistics?.std?.toFixed(4)}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                                    {language === 'বাংলা' ? 'অবশিষ্ট পরিসীমা' : 'Residual Range'}
                                </div>
                                <div style={{ fontSize: '16px', color: '#6b7280' }}>
                                    {results.residual_data.statistics?.min?.toFixed(4)} to {results.residual_data.statistics?.max?.toFixed(4)}
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
                <h2 className="stats-title">{t.ancovaTitle}</h2>
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
                            <td className="stats-table-value">
                                {results.column_names?.group} ({language === 'বাংলা' ? 'গ্রুপ' : 'group'}), 
                                {results.column_names?.covariate} ({language === 'বাংলা' ? 'কোভ্যারিয়েট' : 'covariate'}), 
                                {results.column_names?.outcome} ({language === 'বাংলা' ? 'আউটকাম' : 'outcome'})
                            </td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{language === 'বাংলা' ? 'গ্রুপের সংখ্যা' : 'Number of Groups'}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.n_groups)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{language === 'বাংলা' ? 'মোট পর্যবেক্ষণ' : 'Total Observations'}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.total_observations)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.groupEffect}</td>
                            <td className="stats-table-value stats-numeric">
                                F = {mapDigitIfBengali(results.f_statistic_group?.toFixed(4))}, 
                                p = {mapDigitIfBengali(results.p_value_group?.toFixed(6))}
                            </td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.covariateEffect}</td>
                            <td className="stats-table-value stats-numeric">
                                F = {mapDigitIfBengali(results.f_statistic_covariate?.toFixed(4))}, 
                                p = {mapDigitIfBengali(results.p_value_covariate?.toFixed(6))}
                            </td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">R²</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.metadata?.r_squared?.toFixed(4))}</td>
                        </tr>
                        <tr className="stats-conclusion-row">
                            <td className="stats-table-label">{language === 'বাংলা' ? 'গ্রুপ প্রভাব সিদ্ধান্ত' : 'Group Effect Conclusion'}</td>
                            <td className="stats-table-value">
                                <div className="stats-conclusion-inline">
                                    {results.p_value_group < 0.05 ? (
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
                    <button className={`stats-tab ${activeTab === 'scatter' ? 'active' : ''}`} onClick={() => setActiveTab('scatter')}>{t.scatterPlot}</button>
                    <button className={`stats-tab ${activeTab === 'residuals' ? 'active' : ''}`} onClick={() => setActiveTab('residuals')}>{t.residualPlot}</button>
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

export default renderAncovaResults;