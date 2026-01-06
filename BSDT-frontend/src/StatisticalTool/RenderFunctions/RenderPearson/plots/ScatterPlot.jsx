import React from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Legend, Line, ComposedChart
} from 'recharts';

const ScatterPlot = ({
    results,
    language,
    settings,
    onSettingsChange,
    openCustomization,
    handleDownload,
    downloadMenuOpen,
    setDownloadMenuOpen,
    chartRef,
    selectedPairIndex,
    onPairChange
}) => {
    const t = (en, bn) => (language === 'bn' ? bn : en);
    const fmt = (v, digits = 4) => {
        if (v === null || v === undefined) return 'N/A';
        return parseFloat(v).toFixed(digits);
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
                        {t('Data Point', 'ডেটা পয়েন্ট')}
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
        
        // Auto calculate based on data
        if (data && data.length > 0) {
            const values = data.map(d => d[dataKey]).filter(v => v !== null && v !== undefined);
            if (values.length > 0) {
                const dataMin = Math.min(...values);
                const dataMax = Math.max(...values);
                const padding = Math.abs((dataMax - dataMin) * 0.1);
                return [dataMin - padding, dataMax + padding];
            }
        }
        
        return ['auto', 'auto'];
    };

    const getGridStroke = (gridColor) => {
        return gridColor === 'black' ? '#000000' : '#e5e7eb';
    };

    const renderScatterChart = () => {
        const { height } = getDimensions(settings.dimensions);
        
        const pair = results.scatter_plot_data[selectedPairIndex];
        if (!pair) return null;

        const sample1 = pair.sample1?.values || [];
        const sample2 = pair.sample2?.values || [];
        
        const scatterData = sample1.map((val, index) => ({
            x: val,
            y: sample2[index],
            pair: index + 1
        }));

        // Get regression data
        const regressionData = pair.regression || {};
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

        // Find correlation result for this pair
        const correlationResult = results.pairwise_results.find(r => 
            (r.variable1 === pair.variable1 && r.variable2 === pair.variable2) ||
            (r.variable1 === pair.variable2 && r.variable2 === pair.variable1)
        );

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                {/* Pair Selection Dropdown */}
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontWeight: 'bold', color: '#374151' }}>
                            {t('Select Variable Pair:', 'ভেরিয়েবল জোড়া নির্বাচন করুন:')}
                        </label>
                        <select
                            value={selectedPairIndex}
                            onChange={(e) => onPairChange(parseInt(e.target.value))}
                            style={{
                                padding: '8px 12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                color: '#374151',
                                fontSize: '14px',
                                minWidth: '250px'
                            }}
                        >
                            {results.scatter_plot_data.map((pairData, index) => {
                                const corr = results.pairwise_results.find(r => 
                                    (r.variable1 === pairData.variable1 && r.variable2 === pairData.variable2) ||
                                    (r.variable1 === pairData.variable2 && r.variable2 === pairData.variable1)
                                );
                                const corrValue = corr ? fmt(corr.correlation, 3) : 'N/A';
                                return (
                                    <option key={index} value={index}>
                                        {pairData.variable1} vs {pairData.variable2} (r = {corrValue})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="customize-btn" onClick={() => openCustomization('scatter')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                            </svg>
                            {t('Customize', 'কাস্টমাইজ করুন')}
                        </button>
                        <div style={{ position: 'relative' }}>
                            <button className="customize-btn" onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                                {t('Download', 'ডাউনলোড করুন')}
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
                </div>

                {/* Correlation Stats Summary */}
                {correlationResult && (
                    <div style={{
                        marginBottom: '20px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: '12px',
                        borderLeft: '4px solid #3b82f6'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>
                                    {t('Pearson Correlation', 'পিয়ারসন সম্পর্ক')}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: correlationResult.correlation >= 0.7 ? '#059669' : 
                                    correlationResult.correlation >= 0.3 ? '#3b82f6' : '#dc2626' }}>
                                    {fmt(correlationResult.correlation, 4)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>
                                    {t('P-value', 'পি-মান')}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: correlationResult.p_value < 0.05 ? '#059669' : '#dc2626' }}>
                                    {fmt(correlationResult.p_value, 6)}
                                    <span style={{ fontSize: '14px', marginLeft: '8px', color: '#6b7280' }}>
                                        {correlationResult.p_value < 0.05 ? t('Significant', 'উল্লেখযোগ্য') : t('Not Significant', 'অ-উল্লেখযোগ্য')}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>
                                    {t('Sample Size (n)', 'নমুনা আকার')}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4b5563' }}>
                                    {correlationResult.n}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>
                                    {t('R²', 'আর-স্কোয়ার্ড')}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                                    {fmt(regressionData.r_squared, 4)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scatter Plot */}
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

                            {/* Scatter Points */}
                            {settings.showScatterPoints && (
                                <Scatter
                                    name={t('Data Points', 'ডেটা পয়েন্ট')}
                                    data={scatterData}
                                    fill={settings.scatterColor}
                                    fillOpacity={settings.scatterOpacity}
                                    shape={(props) => {
                                        const { cx, cy } = props;
                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={settings.scatterSize / 2}
                                                fill={settings.scatterColor}
                                                fillOpacity={settings.scatterOpacity}
                                            />
                                        );
                                    }}
                                />
                            )}

                            {/* Regression Line */}
                            {settings.showRegressionLines && regressionLine.length > 0 && (
                                <Line
                                    name={t('Regression Line', 'রিগ্রেশন লাইন')}
                                    type="linear"
                                    dataKey="y"
                                    data={regressionLine}
                                    stroke={settings.regressionLineColor}
                                    strokeWidth={settings.lineWidth}
                                    dot={false}
                                    isAnimationActive={false}
                                    connectNulls={true}
                                />
                            )}

                            {/* Reference Line (y = x) */}
                            {settings.showReferenceLine && referenceLine.length > 0 && (
                                <Line
                                    name={t('Reference Line (y=x)', 'রেফারেন্স লাইন (y=x)')}
                                    type="linear"
                                    dataKey="y"
                                    data={referenceLine}
                                    stroke={settings.referenceLineColor}
                                    strokeWidth={settings.referenceLineWidth}
                                    strokeDasharray={settings.referenceLineStyle === 'dashed' ? '5 5' : 
                                        settings.referenceLineStyle === 'dotted' ? '2 2' : '0'}
                                    dot={false}
                                    isAnimationActive={false}
                                    connectNulls={true}
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>

                    {/* Plot Border Overlay */}
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

                {/* Additional Statistics */}
                <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {/* Sample 1 Statistics */}
                    <div style={{
                        padding: '20px',
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h4 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #3b82f6', paddingBottom: '8px' }}>
                            {pair.sample1.name}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Mean', 'গড়')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(pair.sample1.mean)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Std Dev', 'মানক বিচ্যুতি')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(pair.sample1.std)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Min', 'ন্যূনতম')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(pair.sample1.min)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Max', 'সর্বোচ্চ')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(pair.sample1.max)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Median', 'মধ্যমা')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(pair.sample1.median)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Count', 'সংখ্যা')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{pair.sample1.count}</div>
                            </div>
                        </div>
                    </div>

                    {/* Sample 2 Statistics */}
                    <div style={{
                        padding: '20px',
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h4 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #10b981', paddingBottom: '8px' }}>
                            {pair.sample2.name}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Mean', 'গড়')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(pair.sample2.mean)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Std Dev', 'মানক বিচ্যুতি')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(pair.sample2.std)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Min', 'ন্যূনতম')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(pair.sample2.min)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Max', 'সর্বোচ্চ')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(pair.sample2.max)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Median', 'মধ্যমা')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(pair.sample2.median)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Count', 'সংখ্যা')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{pair.sample2.count}</div>
                            </div>
                        </div>
                    </div>

                    {/* Regression Statistics */}
                    <div style={{
                        padding: '20px',
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h4 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #ef4444', paddingBottom: '8px' }}>
                            {t('Regression Analysis', 'রিগ্রেশন বিশ্লেষণ')}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Slope', 'ঢাল')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(regressionData.slope)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Intercept', 'ইন্টারসেপ্ট')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(regressionData.intercept)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('R²', 'আর-স্কোয়ার্ড')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(regressionData.r_squared)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('Regression p-value', 'রিগ্রেশন পি-মান')}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: regressionData.p_value < 0.05 ? '#059669' : '#dc2626' }}>
                                    {fmt(regressionData.p_value, 6)}
                                </div>
                            </div>
                            {correlationResult && (
                                <>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('95% CI Lower', '৯৫% সিআই নিম্ন')}</div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(correlationResult.ci_lower)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{t('95% CI Upper', '৯৫% সিআই উচ্চ')}</div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>{fmt(correlationResult.ci_upper)}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!results.scatter_plot_data || results.scatter_plot_data.length === 0) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '2px dashed #d1d5db'
            }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ marginBottom: '16px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3 style={{ color: '#374151', marginBottom: '8px' }}>
                    {t('No Scatter Plot Data Available', 'স্ক্যাটার প্লট ডেটা উপলব্ধ নেই')}
                </h3>
                <p style={{ color: '#6b7280' }}>
                    {t('Scatter plots are generated for variable pairs with sufficient data. Try selecting different variables or check your data.', 
                        'পর্যাপ্ত ডেটা সহ ভেরিয়েবল জোড়ার জন্য স্ক্যাটার প্লট তৈরি করা হয়েছে। বিভিন্ন ভেরিয়েবল নির্বাচন করুন বা আপনার ডেটা পরীক্ষা করুন।')}
                </p>
            </div>
        );
    }

    return renderScatterChart();
};

export default ScatterPlot;