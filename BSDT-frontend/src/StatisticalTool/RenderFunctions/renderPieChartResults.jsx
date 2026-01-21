import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
    const defaultColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

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
        showPercentage: true,
        showCount: true,
        innerRadius: 0,
        outerRadius: '80%',
        pieWidth: 0.8,
        legendPosition: 'right',
        legendOn: true,
        dataLabelsOn: true,
        borderOn: false,
        plotBorderOn: false,
        categoryLabels: categoryNames || Array(categoryCount).fill('').map((_, i) => `Category ${i + 1}`),
        categoryColors: Array(categoryCount).fill('').map((_, i) => defaultColors[i % defaultColors.length]),
        pieXPosition: 50,
        pieYPosition: 50,
        legendXPosition: 100,
        legendYPosition: 50,
        dataLabelPosition: 'outside'
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

const renderPieChartResults = (pieActiveTab, setPieActiveTab, results, language, user_id, testType, filename, columns) => {
    const activeTab = pieActiveTab;
    const setActiveTab = setPieActiveTab;

    const [overlayOpen, setOverlayOpen] = useState(false);
    const [currentPlotType, setCurrentPlotType] = useState('Pie');
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const chartRef = useRef(null);
    const [translatedLabels, setTranslatedLabels] = useState({});
    const [translatedNumbers, setTranslatedNumbers] = useState({});

    const categoryNames = results.plot_data?.map(d => d.category) || [];
    const categoryCount = categoryNames.length;

    const [pieSettings, setPieSettings] = useState(
        getDefaultSettings('Pie', categoryCount, categoryNames)
    );

    // Collect all numbers that need translation
    const collectNumbersToTranslate = () => {
        const numbers = new Set();
        
        if (results.n_categories) numbers.add(String(results.n_categories));
        if (results.total_observations) numbers.add(String(results.total_observations));
        
        if (results.metadata?.most_common_percentage !== null && results.metadata?.most_common_percentage !== undefined) {
            numbers.add(results.metadata.most_common_percentage.toFixed(1));
        }
        
        if (results.plot_data) {
            results.plot_data.forEach(item => {
                if (item.count) numbers.add(String(item.count));
                if (item.percentage !== null && item.percentage !== undefined) {
                    numbers.add(item.percentage.toFixed(1));
                }
            });
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
                'Pie Chart Analysis',
                'Analyzed Column',
                'Total Observations',
                'Number of Categories',
                'Category',
                'Count',
                'Percentage',
                'Most Common Category',
                'Pie Chart',
                'Statistics',
                'Save Result',
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
                'Category Statistics',
                'Error'
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
        if (results.plot_data && results.plot_data.length > 0) {
            const labels = results.plot_data.map(d => d.category);
            setPieSettings(prev => ({ ...prev, categoryLabels: labels }));
        }
    }, [results.plot_data]);

    const openCustomization = (plotType) => {
        setCurrentPlotType(plotType);
        setOverlayOpen(true);
    };

    const getCurrentSettings = () => {
        return pieSettings;
    };

    const setCurrentSettings = (settings) => {
        setPieSettings(settings);
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

    if (results && results.success === false) {
        return (
            <div className="stats-error">
                <h3 className="error-title">{getLabel('Error')}</h3>
                <p>{results.error}</p>
            </div>
        );
    }

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

    const plotData = results.plot_data || [];
    const analyzedColumn = results.column_name || columns?.[0] || 'Category';

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '4px' }}>{data.name}</p>
                    <p style={{ margin: 0, color: '#374151' }}>
                        {getLabel('Count')}: {mapDigit(data.count)}
                    </p>
                    <p style={{ margin: 0, color: '#374151' }}>
                        {getLabel('Percentage')}: {mapDigit(data.percentage.toFixed(1))}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const getDimensions = (dimensionString) => {
        const [width, height] = dimensionString.split('x').map(Number);
        return { width: width, height: height - 100, originalWidth: width, originalHeight: height };
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

    const renderLabel = (entry) => {
        const settings = pieSettings;
        let label = '';
        
        if (settings.showCount && settings.showPercentage) {
            label = `${entry.count} (${entry.percentage.toFixed(1)}%)`;
        } else if (settings.showCount) {
            label = `${entry.count}`;
        } else if (settings.showPercentage) {
            label = `${entry.percentage.toFixed(1)}%`;
        }
        
        return mapDigit(label);
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const settings = pieSettings;
        const RADIAN = Math.PI / 180;
        
        if (!settings.dataLabelsOn) return null;
        
        let labelText = '';
        const entry = plotData[index];
        
        if (settings.showCount && settings.showPercentage) {
            labelText = `${entry.count} (${entry.percentage.toFixed(1)}%)`;
        } else if (settings.showCount) {
            labelText = `${entry.count}`;
        } else if (settings.showPercentage) {
            labelText = `${entry.percentage.toFixed(1)}%`;
        }
        
        labelText = mapDigit(labelText);
        
        if (settings.dataLabelPosition === 'inside') {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            
            return (
                <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight="bold"
                >
                    {labelText}
                </text>
            );
        } else {
            const radius = outerRadius * 1.1;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            
            return (
                <text
                    x={x}
                    y={y}
                    fill="#333"
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    fontSize={12}
                >
                    {labelText}
                </text>
            );
        }
    };

    const renderPieChart = () => {
        const settings = pieSettings;
        const { height } = getDimensions(settings.dimensions);

        const data = plotData.map((item, idx) => ({
            name: settings.categoryLabels[idx] || item.category || `Category ${idx + 1}`,
            value: item.percentage || 0,
            count: item.count || 0,
            percentage: item.percentage || 0,
            fill: settings.categoryColors[idx] || item.color || '#cccccc'
        }));

        return (
            <div style={{ 
                position: 'relative', 
                width: '100%',
                // Add image border here
                border: settings.borderOn ? '3px solid #333333' : 'none',
                borderRadius: settings.borderOn ? '8px' : '0',
                padding: settings.borderOn ? '10px' : '0',
                boxSizing: 'border-box',
                backgroundColor: 'white'
            }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('Pie')}>
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
                        <PieChart
                            margin={{ top: settings.captionOn ? 50 : 30, right: 20, left: 20, bottom: 40 }}
                        >
                            {settings.captionOn && (
                                <text x="50%" y={settings.captionTopMargin} style={getCaptionStyle(settings)}>
                                    {settings.captionText}
                                </text>
                            )}
                            <Pie
                                data={data}
                                cx={`${settings.pieXPosition || 50}%`}
                                cy={`${settings.pieYPosition || 50}%`}
                                innerRadius={settings.innerRadius + '%'}
                                outerRadius={settings.outerRadius}
                                paddingAngle={settings.plotBorderOn ? 0 : 2} // Remove padding angle when border is on
                                dataKey="value"
                                label={settings.dataLabelsOn ? renderCustomizedLabel : false}
                                labelLine={settings.dataLabelsOn && settings.dataLabelPosition === 'outside'}
                                // Add black bold stroke for plot border
                                stroke={settings.plotBorderOn ? '#000000' : 'none'}
                                strokeWidth={settings.plotBorderOn ? 3 : 0}
                            >
                                {data.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.fill}
                                        // Add individual cell border - black bold lines
                                        stroke={settings.plotBorderOn ? '#000000' : 'none'}
                                        strokeWidth={settings.plotBorderOn ? 3 : 0}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            {settings.legendOn && (
                                <Legend 
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align={settings.legendPosition}
                                    wrapperStyle={{
                                        position: 'absolute',
                                        left: `${settings.legendXPosition || 100}%`,
                                        top: `${settings.legendYPosition || 50}%`,
                                        transform: 'translate(-100%, -50%)',
                                        paddingLeft: settings.legendPosition === 'right' ? '20px' : '0',
                                        paddingTop: settings.legendPosition === 'top' ? '0' : '20px'
                                    }}
                                    formatter={(value, entry) => {
                                        const item = data.find(d => d.name === value);
                                        if (item && (settings.showCount || settings.showPercentage)) {
                                            let legendText = value;
                                            if (settings.showCount && settings.showPercentage) {
                                                legendText += ` - ${item.count} (${item.percentage.toFixed(1)}%)`;
                                            } else if (settings.showCount) {
                                                legendText += ` - ${item.count}`;
                                            } else if (settings.showPercentage) {
                                                legendText += ` - ${item.percentage.toFixed(1)}%`;
                                            }
                                            return mapDigit(legendText);
                                        }
                                        return value;
                                    }}
                                />
                            )}
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div className="stats-results-container stats-fade-in">
            <div className="stats-header">
                <h2 className="stats-title">{getLabel('Pie Chart Analysis')}</h2>
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
                            <td className="stats-table-value">{analyzedColumn}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('Number of Categories')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.n_categories)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{getLabel('Total Observations')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.total_observations)}</td>
                        </tr>
                        {results.metadata?.most_common_category && (
                            <tr>
                                <td className="stats-table-label">{getLabel('Most Common Category')}</td>
                                <td className="stats-table-value">
                                    {results.metadata.most_common_category} 
                                    ({mapDigit(results.metadata.most_common_percentage.toFixed(1))}%)
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="stats-viz-section">
                <h3 className="stats-viz-header">{getLabel('Visualizations')}</h3>

                <div className="stats-tab-container">
                    <button className={`stats-tab ${activeTab === 'pie' ? 'active' : ''}`} onClick={() => setActiveTab('pie')}>
                        {getLabel('Pie Chart')}
                    </button>
                    <button className={`stats-tab ${activeTab === 'statistics' ? 'active' : ''}`} onClick={() => setActiveTab('statistics')}>
                        {getLabel('Statistics')}
                    </button>
                </div>

                <div className="stats-plot-container">
                    {activeTab === 'pie' && (
                        <div className="stats-plot-wrapper active">
                            {renderPieChart()}
                        </div>
                    )}

                    {activeTab === 'statistics' && (
                        <div className="stats-plot-wrapper active">
                            <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 16px 0', color: '#374151' }}>
                                    {getLabel('Category Statistics')}
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                                    {plotData.map((item, idx) => (
                                        <div key={idx} style={{ 
                                            padding: '16px', 
                                            background: 'white', 
                                            borderRadius: '8px', 
                                            borderLeft: `4px solid ${pieSettings.categoryColors[idx]}`,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937', fontSize: '16px' }}>
                                                {pieSettings.categoryLabels[idx]}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                                <div>{getLabel('Count')}: {mapDigit(item.count)}</div>
                                                <div>{getLabel('Percentage')}: {mapDigit(item.percentage.toFixed(1))}%</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
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

export default renderPieChartResults;