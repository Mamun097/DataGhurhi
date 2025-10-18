import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart, ErrorBar, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import CustomizationOverlay from './CustomizationOverlay/CustomizationOverlay';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const getDefaultSettings = (plotType, categoryCount, categoryNames) => {
    const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    return {
        dimensions: '800x600',
        fontFamily: 'Times New Roman',
        captionOn: false,
        captionText: '',
        captionSize: 18,
        captionBold: false,
        captionItalic: false,
        captionUnderline: false,
        xAxisTitle: 'Covariate',
        yAxisTitle: 'Outcome',
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
        yAxisMin: 'auto',
        yAxisMax: 'auto',
        gridOn: true,
        gridStyle: '3 3',
        gridColor: 'gray',
        gridOpacity: 1,
        borderOn: false,
        barBorderOn: false,
        dataLabelsOn: true,
        errorBarsOn: true,
        elementWidth: plotType === 'Violin' ? 0.4 : 0.8,
        categoryLabels: categoryNames || Array(categoryCount).fill('').map((_, i) => `Category ${i + 1}`),
        categoryColors: Array(categoryCount).fill('').map((_, i) => defaultColors[i % defaultColors.length]),
        scatterSize: 6,
        lineWidth: 2,
        showRegressionLines: true,
        showScatterPoints: true,
        legendPosition: 'right'
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

const renderAncovaResults = (ancovaActiveTab, setAncovaActiveTab, results, language, user_id, testType, filename, columns) => {
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
        groupSizes: language === 'বাংলা' ? 'গ্রুপের আকার' : 'Group Sizes',
        scatterPlot: language === 'বাংলা' ? 'স্ক্যাটার প্লট' : 'Scatter Plot',
        residualPlot: language === 'বাংলা' ? 'রেসিডুয়াল প্লট' : 'Residual Plot',
        degreesOfFreedom: language === 'বাংলা' ? 'ডিগ্রী অফ ফ্রিডম' : 'Degrees of Freedom',
        sumOfSquares: language === 'বাংলা' ? 'সমষ্টি বর্গ' : 'Sum of Squares',
        meanSquare: language === 'বাংলা' ? 'গড় বর্গ' : 'Mean Square',
        groupEffect: language === 'বাংলা' ? 'গ্রুপ প্রভাব' : 'Group Effect',
        covariateEffect: language === 'বাংলা' ? 'কোভ্যারিয়েট প্রভাব' : 'Covariate Effect',
        interaction: language === 'বাংলা' ? 'ইন্টারঅ্যাকশন' : 'Interaction'
    };

    const plotData = results.plot_data || [];
    const groupColumn = results.column_names?.group || columns?.[0] || 'Group';
    const covariateColumn = results.column_names?.covariate || columns?.[1] || 'Covariate';
    const outcomeColumn = results.column_names?.outcome || columns?.[2] || 'Outcome';

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

    const renderScatterPlot = () => {
        const settings = scatterSettings;
        const { height } = getDimensions(settings.dimensions);

        // Prepare data for scatter plot with regression lines
        const scatterData = [];
        plotData.forEach((group, groupIdx) => {
            group.values.forEach((value, valueIdx) => {
                scatterData.push({
                    x: group.covariate_values[valueIdx],
                    y: value,
                    group: group.category,
                    groupIdx: groupIdx,
                    color: settings.categoryColors[groupIdx % settings.categoryColors.length]
                });
            });
        });

        // Calculate regression lines for each group
        const regressionLines = plotData.map((group, groupIdx) => {
            const xValues = group.covariate_values;
            const yValues = group.values;
            
            if (xValues.length < 2) return null;
            
            // Simple linear regression: y = mx + b
            const n = xValues.length;
            const sumX = xValues.reduce((a, b) => a + b, 0);
            const sumY = yValues.reduce((a, b) => a + b, 0);
            const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
            const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
            
            const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const b = (sumY - m * sumX) / n;
            
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            
            return {
                group: group.category,
                groupIdx: groupIdx,
                slope: m,
                intercept: b,
                lineData: [
                    { x: minX, y: m * minX + b },
                    { x: maxX, y: m * maxX + b }
                ],
                color: settings.categoryColors[groupIdx % settings.categoryColors.length]
            };
        }).filter(line => line !== null);

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
                <div ref={chartRef}>
                    <ResponsiveContainer width="100%" height={height}>
                        <ScatterChart
                            margin={{ top: settings.captionOn ? 50 : 30, right: 20, left: 20, bottom: 40 }}
                            style={settings.borderOn ? { border: '2px solid black' } : {}}
                        >
                            {settings.captionOn && (
                                <text x="50%" y="30" style={getCaptionStyle(settings)}>
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
                                domain={['auto', 'auto']}
                                tick={{ fill: '#6b7280', fontSize: settings.xAxisTickSize, fontFamily: settings.fontFamily }}
                                label={{
                                    value: settings.xAxisTitle,
                                    position: 'insideBottom',
                                    offset: -10,
                                    style: {
                                        fontSize: settings.xAxisTitleSize,
                                        fill: '#374151',
                                        ...getTextStyle(settings.xAxisTitleBold, settings.xAxisTitleItalic, settings.xAxisTitleUnderline, settings.fontFamily)
                                    }
                                }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                domain={yDomain}
                                tick={{ fill: '#6b7280', fontSize: settings.yAxisTickSize, fontFamily: settings.fontFamily }}
                                label={{
                                    value: settings.yAxisTitle,
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: {
                                        fontSize: settings.yAxisTitleSize,
                                        fill: '#374151',
                                        ...getTextStyle(settings.yAxisTitleBold, settings.yAxisTitleItalic, settings.yAxisTitleUnderline, settings.fontFamily)
                                    }
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            
                            {/* Scatter points */}
                            {settings.showScatterPoints && plotData.map((group, groupIdx) => (
                                <Scatter
                                    key={`scatter-${groupIdx}`}
                                    data={scatterData.filter(d => d.groupIdx === groupIdx)}
                                    fill={settings.categoryColors[groupIdx]}
                                    fillOpacity={0.7}
                                />
                            ))}
                            
                            {/* Regression lines */}
                            {settings.showRegressionLines && regressionLines.map((line, lineIdx) => (
                                <Line
                                    key={`line-${lineIdx}`}
                                    dataKey="y"
                                    data={line.lineData}
                                    stroke={line.color}
                                    strokeWidth={settings.lineWidth}
                                    dot={false}
                                    activeDot={false}
                                />
                            ))}
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div style={{ 
                    marginTop: '20px', 
                    padding: '16px', 
                    background: '#f9fafb', 
                    borderRadius: '8px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    justifyContent: 'center'
                }}>
                    {plotData.map((group, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: settings.categoryColors[idx],
                                borderRadius: '50%'
                            }}></div>
                            <span style={{ fontSize: '14px', color: '#374151' }}>
                                {group.category}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderResidualPlot = () => {
        const settings = residualSettings;
        const { height } = getDimensions(settings.dimensions);

        // Prepare residual data
        const residualData = [];
        plotData.forEach((group, groupIdx) => {
            if (group.residuals && group.fitted_values) {
                group.residuals.forEach((residual, idx) => {
                    residualData.push({
                        x: group.fitted_values[idx],
                        y: residual,
                        group: group.category,
                        groupIdx: groupIdx,
                        color: settings.categoryColors[groupIdx % settings.categoryColors.length]
                    });
                });
            }
        });

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
                <div ref={chartRef}>
                    <ResponsiveContainer width="100%" height={height}>
                        <ScatterChart
                            margin={{ top: settings.captionOn ? 50 : 30, right: 20, left: 20, bottom: 40 }}
                            style={settings.borderOn ? { border: '2px solid black' } : {}}
                        >
                            {settings.captionOn && (
                                <text x="50%" y="30" style={getCaptionStyle(settings)}>
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
                                domain={['auto', 'auto']}
                                tick={{ fill: '#6b7280', fontSize: settings.xAxisTickSize, fontFamily: settings.fontFamily }}
                                label={{
                                    value: 'Fitted Values',
                                    position: 'insideBottom',
                                    offset: -10,
                                    style: {
                                        fontSize: settings.xAxisTitleSize,
                                        fill: '#374151',
                                        ...getTextStyle(settings.xAxisTitleBold, settings.xAxisTitleItalic, settings.xAxisTitleUnderline, settings.fontFamily)
                                    }
                                }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                domain={yDomain}
                                tick={{ fill: '#6b7280', fontSize: settings.yAxisTickSize, fontFamily: settings.fontFamily }}
                                label={{
                                    value: 'Residuals',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: {
                                        fontSize: settings.yAxisTitleSize,
                                        fill: '#374151',
                                        ...getTextStyle(settings.yAxisTitleBold, settings.yAxisTitleItalic, settings.yAxisTitleUnderline, settings.fontFamily)
                                    }
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            
                            {/* Zero reference line */}
                            <Line
                                dataKey="y"
                                data={[{ x: Math.min(...residualData.map(d => d.x)), y: 0 }, { x: Math.max(...residualData.map(d => d.x)), y: 0 }]}
                                stroke="#6b7280"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={false}
                            />
                            
                            {/* Residual points */}
                            {plotData.map((group, groupIdx) => (
                                <Scatter
                                    key={`residual-${groupIdx}`}
                                    data={residualData.filter(d => d.groupIdx === groupIdx)}
                                    fill={settings.categoryColors[groupIdx]}
                                    fillOpacity={0.7}
                                />
                            ))}
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
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
                            <td className="stats-table-value">{groupColumn} (group), {covariateColumn} (covariate), {outcomeColumn} (outcome)</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{language === 'বাংলা' ? 'গ্রুপের সংখ্যা' : 'Number of Groups'}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.n_groups)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{language === 'বাংলা' ? 'মোট পর্যবেক্ষণ' : 'Total Observations'}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.total_observations)}</td>
                        </tr>
                        {results.f_statistic_group && (
                            <tr>
                                <td className="stats-table-label">{t.groupEffect} (F)</td>
                                <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.f_statistic_group?.toFixed(4))}</td>
                            </tr>
                        )}
                        {results.p_value_group && (
                            <tr>
                                <td className="stats-table-label">{t.groupEffect} ({t.pValue})</td>
                                <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.p_value_group?.toFixed(6))}</td>
                            </tr>
                        )}
                        {results.f_statistic_covariate && (
                            <tr>
                                <td className="stats-table-label">{t.covariateEffect} (F)</td>
                                <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.f_statistic_covariate?.toFixed(4))}</td>
                            </tr>
                        )}
                        {results.p_value_covariate && (
                            <tr>
                                <td className="stats-table-label">{t.covariateEffect} ({t.pValue})</td>
                                <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.p_value_covariate?.toFixed(6))}</td>
                            </tr>
                        )}
                        <tr className="stats-conclusion-row">
                            <td className="stats-table-label">{language === 'বাংলা' ? 'সিদ্ধান্ত' : 'Conclusion'}</td>
                            <td className="stats-table-value">
                                <div className="stats-conclusion-inline">
                                    {results.significant ? (
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
                    <button className={`stats-tab ${activeTab === 'residual' ? 'active' : ''}`} onClick={() => setActiveTab('residual')}>{t.residualPlot}</button>
                </div>

                <div className="stats-plot-container">
                    {activeTab === 'scatter' && (
                        <div className="stats-plot-wrapper active">
                            {renderScatterPlot()}
                        </div>
                    )}

                    {activeTab === 'residual' && (
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