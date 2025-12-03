import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import CustomizationOverlay from './CustomizationOverlay/CustomizationOverlay';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

    const activeTab = pieActiveTab;
    const setActiveTab = setPieActiveTab;

    const [overlayOpen, setOverlayOpen] = React.useState(false);
    const [currentPlotType, setCurrentPlotType] = React.useState('Pie');
    const [downloadMenuOpen, setDownloadMenuOpen] = React.useState(false);
    const chartRef = React.useRef(null);

    const categoryNames = results.plot_data?.map(d => d.category) || [];
    const categoryCount = categoryNames.length;

    const [pieSettings, setPieSettings] = React.useState(
        getDefaultSettings('Pie', categoryCount, categoryNames)
    );

    React.useEffect(() => {
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

    // Add this check FIRST - handle error case from backend
    if (results && results.success === false) {
        return (
            <div className="stats-error">
                <h3 className="error-title">{language === 'বাংলা' ? 'ত্রুটি' : 'Error'}</h3>
                <p>{results.error}</p>
            </div>
        );
    }

    // Then check for loading/empty data
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
        pieChartTitle: language === 'বাংলা' ? 'পাই চার্ট বিশ্লেষণ' : 'Pie Chart Analysis',
        columnAnalyzed: language === 'বাংলা' ? 'বিশ্লেষিত কলাম' : 'Analyzed Column',
        totalObservations: language === 'বাংলা' ? 'মোট পর্যবেক্ষণ' : 'Total Observations',
        numberOfCategories: language === 'বাংলা' ? 'বিভাগের সংখ্যা' : 'Number of Categories',
        category: language === 'বাংলা' ? 'বিভাগ' : 'Category',
        count: language === 'বাংলা' ? 'গণনা' : 'Count',
        percentage: language === 'বাংলা' ? 'শতাংশ' : 'Percentage',
        mostCommonCategory: language === 'বাংলা' ? 'সবচেয়ে সাধারণ বিভাগ' : 'Most Common Category',
        pieChart: language === 'বাংলা' ? 'পাই চার্ট' : 'Pie Chart',
        statistics: language === 'বাংলา' ? 'পরিসংখ্যান' : 'Statistics',
        saveResult: language === 'বাংলা' ? 'ফলাফল সংরক্ষণ করুন' : 'Save Result',
        visualizations: language === 'বাংলা' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualizations'
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
                        {t.count}: {mapDigitIfBengali(data.count)}
                    </p>
                    <p style={{ margin: 0, color: '#374151' }}>
                        {t.percentage}: {mapDigitIfBengali(data.percentage.toFixed(1))}%
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
        
        return language === 'বাংলা' ? mapDigitIfBengali(label) : label;
    };

    // ADD THIS NEW FUNCTION for custom label rendering
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const settings = pieSettings;
        const RADIAN = Math.PI / 180;
        
        // If data labels are off, return null
        if (!settings.dataLabelsOn) return null;
        
        // Determine label text
        let labelText = '';
        const entry = plotData[index];
        
        if (settings.showCount && settings.showPercentage) {
            labelText = `${entry.count} (${entry.percentage.toFixed(1)}%)`;
        } else if (settings.showCount) {
            labelText = `${entry.count}`;
        } else if (settings.showPercentage) {
            labelText = `${entry.percentage.toFixed(1)}%`;
        }
        
        // Convert to Bengali if needed
        labelText = language === 'বাংলা' ? mapDigitIfBengali(labelText) : labelText;
        
        if (settings.dataLabelPosition === 'inside') {
            // For inside labels - position at the center of each slice
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
            // For outside labels - use default positioning
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

        // Fix data transformation - ensure we have valid data
        const data = plotData.map((item, idx) => ({
            name: settings.categoryLabels[idx] || item.category || `Category ${idx + 1}`,
            value: item.percentage || 0,
            count: item.count || 0,
            percentage: item.percentage || 0,
            fill: settings.categoryColors[idx] || item.color || '#cccccc'
        }));

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button className="customize-btn" onClick={() => openCustomization('Pie')}>
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
                        <PieChart
                            margin={{ top: settings.captionOn ? 50 : 30, right: 20, left: 20, bottom: 40 }}
                            style={settings.plotBorderOn ? { border: '2px solid black', borderRadius: '8px' } : {}} // ← CHANGE: settings.plotBorderOn
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
                                paddingAngle={2}
                                dataKey="value"
                                label={settings.dataLabelsOn ? renderCustomizedLabel : false} // ← CHANGE to renderCustomizedLabel
                                labelLine={settings.dataLabelsOn && settings.dataLabelPosition === 'outside'} // ← Only show label line for outside
                            >
                                {data.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.fill}
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
                                            return language === 'বাংলা' ? mapDigitIfBengali(legendText) : legendText;
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
                <h2 className="stats-title">{t.pieChartTitle}</h2>
                <button onClick={handleSaveResult} className="stats-save-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {t.saveResult}
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
                            <td className="stats-table-label">{t.columnAnalyzed}</td>
                            <td className="stats-table-value">{analyzedColumn}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.numberOfCategories}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.n_categories)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t.totalObservations}</td>
                            <td className="stats-table-value stats-numeric">{mapDigitIfBengali(results.total_observations)}</td>
                        </tr>
                        {results.metadata?.most_common_category && (
                            <tr>
                                <td className="stats-table-label">{t.mostCommonCategory}</td>
                                <td className="stats-table-value">
                                    {results.metadata.most_common_category} 
                                    ({mapDigitIfBengali(results.metadata.most_common_percentage.toFixed(1))}%)
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="stats-viz-section">
                <h3 className="stats-viz-header">{t.visualizations}</h3>

                <div className="stats-tab-container">
                    <button className={`stats-tab ${activeTab === 'pie' ? 'active' : ''}`} onClick={() => setActiveTab('pie')}>
                        {t.pieChart}
                    </button>
                    <button className={`stats-tab ${activeTab === 'statistics' ? 'active' : ''}`} onClick={() => setActiveTab('statistics')}>
                        {t.statistics}
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
                                    {language === 'বাংলা' ? 'বিভাগ অনুযায়ী পরিসংখ্যান' : 'Category Statistics'}
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
                                                <div>{t.count}: {mapDigitIfBengali(item.count)}</div>
                                                <div>{t.percentage}: {mapDigitIfBengali(item.percentage.toFixed(1))}%</div>
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

export default renderPieChartResults;