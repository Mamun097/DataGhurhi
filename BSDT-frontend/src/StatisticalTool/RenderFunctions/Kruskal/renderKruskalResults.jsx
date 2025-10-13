import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart, ErrorBar, ScatterChart, Scatter } from 'recharts';
import './CustomizationOverlay.css';

// Utility function to get default settings for each plot type
const getDefaultSettings = (plotType, categoryCount, categoryNames) => {
    const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    return {
        dimensions: '800x600',
        captionOn: false,
        captionText: '',
        captionSize: 16,
        captionBold: false,
        captionItalic: false,
        captionUnderline: false,
        xAxisTitle: 'Groups',
        yAxisTitle: 'Values',
        xAxisTitleSize: 14,
        yAxisTitleSize: 14,
        xAxisTitleBold: false,
        xAxisTitleItalic: false,
        xAxisTitleUnderline: false,
        yAxisTitleBold: false,
        yAxisTitleItalic: false,
        yAxisTitleUnderline: false,
        xAxisTickSize: 12,
        yAxisTickSize: 12,
        yAxisMin: 'auto',
        yAxisMax: 'auto',
        gridOn: true,
        gridStyle: '3 3',
        gridColor: 'gray',
        gridOpacity: 1,
        borderOn: false,
        dataLabelsOn: true,
        elementWidth: plotType === 'Violin' ? 0.3 : 0.6,
        categoryLabels: categoryNames || Array(categoryCount).fill('').map((_, i) => `Category ${i + 1}`),
        categoryColors: Array(categoryCount).fill('').map((_, i) => defaultColors[i % defaultColors.length])
    };
};

// Customization Overlay Component
const CustomizationOverlay = ({ isOpen, onClose, plotType, settings, onSettingsChange, language }) => {
    if (!isOpen) return null;

    const t = {
        customization: language === 'বাংলা' ? 'কাস্টমাইজেশন' : 'Customization',
        general: language === 'বাংলা' ? 'সাধারণ সেটিংস' : 'General Settings',
        axes: language === 'বাংলা' ? 'অক্ষ সেটিংস' : 'Axes Settings',
        grid: language === 'বাংলা' ? 'গ্রিড সেটিংস' : 'Grid Settings',
        appearance: language === 'বাংলা' ? 'চেহারা' : 'Appearance',
        labels: language === 'বাংলা' ? 'লেবেল' : 'Labels',
        colors: language === 'বাংলা' ? 'রং' : 'Colors',
        dimensions: language === 'বাংলা' ? 'মাত্রা' : 'Dimensions',
        caption: language === 'বাংলা' ? 'ক্যাপশন' : 'Caption',
        captionOn: language === 'বাংলা' ? 'ক্যাপশন চালু' : 'Caption On',
        captionText: language === 'বাংলা' ? 'ক্যাপশন টেক্সট' : 'Caption Text',
        captionSize: language === 'বাংলা' ? 'ক্যাপশন আকার' : 'Caption Size',
        xAxisTitle: language === 'বাংলা' ? 'X অক্ষের শিরোনাম' : 'X-Axis Title',
        yAxisTitle: language === 'বাংলা' ? 'Y অক্ষের শিরোনাম' : 'Y-Axis Title',
        xAxisTitleSize: language === 'বাংলা' ? 'X অক্ষ শিরোনাম আকার' : 'X-Axis Title Size',
        yAxisTitleSize: language === 'বাংলা' ? 'Y অক্ষ শিরোনাম আকার' : 'Y-Axis Title Size',
        xAxisTickSize: language === 'বাংলা' ? 'X অক্ষ টিক আকার' : 'X-Axis Tick Size',
        yAxisTickSize: language === 'বাংলা' ? 'Y অক্ষ টিক আকার' : 'Y-Axis Tick Size',
        yAxisMin: language === 'বাংলা' ? 'Y অক্ষ ন্যূনতম' : 'Y-Axis Min',
        yAxisMax: language === 'বাংলা' ? 'Y অক্ষ সর্বোচ্চ' : 'Y-Axis Max',
        gridOn: language === 'বাংলা' ? 'গ্রিড চালু' : 'Grid On',
        gridStyle: language === 'বাংলা' ? 'গ্রিড স্টাইল' : 'Grid Style',
        gridColor: language === 'বাংলা' ? 'গ্রিড রং' : 'Grid Color',
        gridOpacity: language === 'বাংলা' ? 'গ্রিড স্বচ্ছতা' : 'Grid Opacity',
        borderOn: language === 'বাংলা' ? 'বর্ডার চালু' : 'Border On',
        dataLabelsOn: language === 'বাংলা' ? 'ডেটা লেবেল চালু' : 'Data Labels On',
        width: language === 'বাংলা' ? 'প্রস্থ' : 'Width',
        barWidth: language === 'বাংলা' ? 'বার প্রস্থ' : 'Bar Width',
        boxWidth: language === 'বাংলা' ? 'বক্স প্রস্থ' : 'Box Width',
        violinWidth: language === 'বাংলা' ? 'ভায়োলিন প্রস্থ' : 'Violin Width',
        categoryLabels: language === 'বাংলা' ? 'ক্যাটাগরি লেবেল' : 'Category Labels',
        categoryColors: language === 'বাংলা' ? 'ক্যাটাগরি রং' : 'Category Colors',
        close: language === 'বাংলা' ? 'বন্ধ করুন' : 'Close',
        reset: language === 'বাংলা' ? 'রিসেট' : 'Reset',
        auto: language === 'বাংলা' ? 'স্বয়ংক্রিয়' : 'Auto',
    };

    const gridStyles = [
        { value: '3 3', label: 'Dotted' },
        { value: '10 5', label: 'Dashed' },
        { value: '1 0', label: 'Solid' },
        { value: '15 5 5 5', label: 'Dash-Dot' },
        { value: '20 10', label: 'Long Dash' },
    ];

    const dimensions = [
        { value: '800x600', label: '800 × 600' },
        { value: '1024x768', label: '1024 × 768' },
        { value: '1280x720', label: '1280 × 720 (HD)' },
        { value: '1440x1080', label: '1440 × 1080' },
        { value: '1920x1080', label: '1920 × 1080 (Full HD)' },
    ];

    const handleChange = (key, value) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const handleCategoryLabelChange = (index, value) => {
        const newLabels = [...settings.categoryLabels];
        newLabels[index] = value;
        handleChange('categoryLabels', newLabels);
    };

    const handleCategoryColorChange = (index, value) => {
        const newColors = [...settings.categoryColors];
        newColors[index] = value;
        handleChange('categoryColors', newColors);
    };

    const handleReset = () => {
        onSettingsChange(getDefaultSettings(plotType, settings.categoryLabels.length, null));
    };

    return (
        <div className="customization-overlay-backdrop" onClick={onClose}>
            <div className="customization-overlay" onClick={(e) => e.stopPropagation()}>
                <div className="customization-header">
                    <h3>{t.customization} - {plotType}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="customization-content">
                    {/* General Settings */}
                    <div className="customization-section">
                        <h4 className="section-title">{t.general}</h4>

                        <div className="setting-group">
                            <label className="setting-label">{t.dimensions}</label>
                            <select
                                className="setting-select"
                                value={settings.dimensions}
                                onChange={(e) => handleChange('dimensions', e.target.value)}
                            >
                                {dimensions.map(dim => (
                                    <option key={dim.value} value={dim.value}>{dim.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="setting-group">
                            <label className="setting-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.captionOn}
                                    onChange={(e) => handleChange('captionOn', e.target.checked)}
                                />
                                <span>{t.captionOn}</span>
                            </label>
                        </div>

                        {settings.captionOn && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-label">{t.captionText}</label>
                                    <input
                                        type="text"
                                        className="setting-input"
                                        value={settings.captionText}
                                        onChange={(e) => handleChange('captionText', e.target.value)}
                                        placeholder="Enter caption text..."
                                    />
                                </div>
                                <div className="setting-row">
                                    <div className="setting-group" style={{ flex: '0 0 75%' }}>
                                        <label className="setting-label">{t.captionSize}</label>
                                        <input
                                            type="number"
                                            className="setting-input"
                                            value={settings.captionSize}
                                            onChange={(e) => handleChange('captionSize', parseInt(e.target.value))}
                                            min="10"
                                            max="48"
                                        />
                                    </div>
                                    <div className="setting-group" style={{ flex: '0 0 25%', display: 'flex', flexDirection: 'column', marginTop: '30px', alignItems: 'flex-start' }}>
                                        <div className="text-style-buttons">
                                            <button
                                                className={`style-btn ${settings.captionBold ? 'active' : ''}`}
                                                onClick={() => handleChange('captionBold', !settings.captionBold)}
                                                title="Bold"
                                            >
                                                <strong>B</strong>
                                            </button>
                                            <button
                                                className={`style-btn ${settings.captionItalic ? 'active' : ''}`}
                                                onClick={() => handleChange('captionItalic', !settings.captionItalic)}
                                                title="Italic"
                                            >
                                                <em>I</em>
                                            </button>
                                            <button
                                                className={`style-btn ${settings.captionUnderline ? 'active' : ''}`}
                                                onClick={() => handleChange('captionUnderline', !settings.captionUnderline)}
                                                title="Underline"
                                            >
                                                <u>U</u>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Axes Settings */}
                    <div className="customization-section">
                        <h4 className="section-title">{t.axes}</h4>

                        <div className="setting-group">
                            <label className="setting-label">{t.xAxisTitle}</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="setting-input"
                                    value={settings.xAxisTitle}
                                    onChange={(e) => handleChange('xAxisTitle', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <div className="text-style-buttons">
                                    <button
                                        className={`style-btn ${settings.xAxisTitleBold ? 'active' : ''}`}
                                        onClick={() => handleChange('xAxisTitleBold', !settings.xAxisTitleBold)}
                                        title="Bold"
                                    >
                                        <strong>B</strong>
                                    </button>
                                    <button
                                        className={`style-btn ${settings.xAxisTitleItalic ? 'active' : ''}`}
                                        onClick={() => handleChange('xAxisTitleItalic', !settings.xAxisTitleItalic)}
                                        title="Italic"
                                    >
                                        <em>I</em>
                                    </button>
                                    <button
                                        className={`style-btn ${settings.xAxisTitleUnderline ? 'active' : ''}`}
                                        onClick={() => handleChange('xAxisTitleUnderline', !settings.xAxisTitleUnderline)}
                                        title="Underline"
                                    >
                                        <u>U</u>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="setting-group">
                            <label className="setting-label">{t.yAxisTitle}</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="setting-input"
                                    value={settings.yAxisTitle}
                                    onChange={(e) => handleChange('yAxisTitle', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <div className="text-style-buttons">
                                    <button
                                        className={`style-btn ${settings.yAxisTitleBold ? 'active' : ''}`}
                                        onClick={() => handleChange('yAxisTitleBold', !settings.yAxisTitleBold)}
                                        title="Bold"
                                    >
                                        <strong>B</strong>
                                    </button>
                                    <button
                                        className={`style-btn ${settings.yAxisTitleItalic ? 'active' : ''}`}
                                        onClick={() => handleChange('yAxisTitleItalic', !settings.yAxisTitleItalic)}
                                        title="Italic"
                                    >
                                        <em>I</em>
                                    </button>
                                    <button
                                        className={`style-btn ${settings.yAxisTitleUnderline ? 'active' : ''}`}
                                        onClick={() => handleChange('yAxisTitleUnderline', !settings.yAxisTitleUnderline)}
                                        title="Underline"
                                    >
                                        <u>U</u>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="setting-row">
                            <div className="setting-group">
                                <label className="setting-label">{t.xAxisTitleSize}</label>
                                <input
                                    type="number"
                                    className="setting-input"
                                    value={settings.xAxisTitleSize}
                                    onChange={(e) => handleChange('xAxisTitleSize', parseInt(e.target.value))}
                                    min="8"
                                    max="32"
                                />
                            </div>

                            <div className="setting-group">
                                <label className="setting-label">{t.yAxisTitleSize}</label>
                                <input
                                    type="number"
                                    className="setting-input"
                                    value={settings.yAxisTitleSize}
                                    onChange={(e) => handleChange('yAxisTitleSize', parseInt(e.target.value))}
                                    min="8"
                                    max="32"
                                />
                            </div>
                        </div>

                        <div className="setting-row">
                            <div className="setting-group">
                                <label className="setting-label">{t.xAxisTickSize}</label>
                                <input
                                    type="number"
                                    className="setting-input"
                                    value={settings.xAxisTickSize}
                                    onChange={(e) => handleChange('xAxisTickSize', parseInt(e.target.value))}
                                    min="8"
                                    max="24"
                                />
                            </div>

                            <div className="setting-group">
                                <label className="setting-label">{t.yAxisTickSize}</label>
                                <input
                                    type="number"
                                    className="setting-input"
                                    value={settings.yAxisTickSize}
                                    onChange={(e) => handleChange('yAxisTickSize', parseInt(e.target.value))}
                                    min="8"
                                    max="24"
                                />
                            </div>
                        </div>

                        <div className="setting-row">
                            <div className="setting-group">
                                <label className="setting-label">{t.yAxisMin}</label>
                                <input
                                    type="text"
                                    className="setting-input"
                                    value={settings.yAxisMin}
                                    onChange={(e) => handleChange('yAxisMin', e.target.value)}
                                    placeholder={t.auto}
                                />
                            </div>

                            <div className="setting-group">
                                <label className="setting-label">{t.yAxisMax}</label>
                                <input
                                    type="text"
                                    className="setting-input"
                                    value={settings.yAxisMax}
                                    onChange={(e) => handleChange('yAxisMax', e.target.value)}
                                    placeholder={t.auto}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Grid Settings */}
                    <div className="customization-section">
                        <h4 className="section-title">{t.grid}</h4>

                        <div className="setting-group">
                            <label className="setting-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.gridOn}
                                    onChange={(e) => handleChange('gridOn', e.target.checked)}
                                />
                                <span>{t.gridOn}</span>
                            </label>
                        </div>

                        {settings.gridOn && (
                            <>
                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{t.gridStyle}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.gridStyle}
                                            onChange={(e) => handleChange('gridStyle', e.target.value)}
                                        >
                                            {gridStyles.map(style => (
                                                <option key={style.value} value={style.value}>{style.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{t.gridColor}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.gridColor}
                                            onChange={(e) => handleChange('gridColor', e.target.value)}
                                        >
                                            <option value="gray">Gray</option>
                                            <option value="black">Black</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{t.gridOpacity}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.gridOpacity}
                                        onChange={(e) => handleChange('gridOpacity', parseFloat(e.target.value))}
                                        min="0"
                                        max="1"
                                        step="0.1"
                                    />
                                    <span className="range-value">{settings.gridOpacity}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Appearance Settings */}
                    <div className="customization-section">
                        <h4 className="section-title">{t.appearance}</h4>

                        <div className="setting-group">
                            <label className="setting-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.borderOn}
                                    onChange={(e) => handleChange('borderOn', e.target.checked)}
                                />
                                <span>{t.borderOn}</span>
                            </label>
                        </div>

                        <div className="setting-group">
                            <label className="setting-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.dataLabelsOn}
                                    onChange={(e) => handleChange('dataLabelsOn', e.target.checked)}
                                />
                                <span>{t.dataLabelsOn}</span>
                            </label>
                        </div>

                        <div className="setting-group">
                            <label className="setting-label">
                                {plotType === 'Count' ? t.barWidth :
                                    plotType === 'Mean' ? t.barWidth :
                                        plotType === 'Box' ? t.boxWidth : t.violinWidth}
                            </label>
                            <input
                                type="range"
                                className="setting-range"
                                value={settings.elementWidth}
                                onChange={(e) => handleChange('elementWidth', parseFloat(e.target.value))}
                                min="0.1"
                                max="1"
                                step="0.05"
                            />
                            <span className="range-value">{settings.elementWidth.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Category Labels */}
                    <div className="customization-section">
                        <h4 className="section-title">{t.categoryLabels}</h4>
                        {settings.categoryLabels.map((label, index) => (
                            <div key={index} className="setting-group category-label-row">
                                <label className="setting-label">Category {index + 1}</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        className="setting-input"
                                        value={label}
                                        onChange={(e) => handleCategoryLabelChange(index, e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        type="color"
                                        className="color-picker-compact"
                                        value={settings.categoryColors[index]}
                                        onChange={(e) => handleCategoryColorChange(index, e.target.value)}
                                        title="Choose color"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="customization-footer">
                    <button className="reset-btn" onClick={handleReset}>
                        {t.reset}
                    </button>
                    <button className="apply-btn" onClick={onClose}>
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

const renderKruskalResults = (kruskalActiveTab, setKruskalActiveTab, results, language, user_id, testType, filename, columns) => {
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

    const activeTab = kruskalActiveTab;
    const setActiveTab = setKruskalActiveTab;

    const [overlayOpen, setOverlayOpen] = React.useState(false);
    const [currentPlotType, setCurrentPlotType] = React.useState('Count');

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

    React.useEffect(() => {
        if (results.plot_data && results.plot_data.length > 0) {
            const labels = results.plot_data.map(d => d.category);
            setCountSettings(prev => ({ ...prev, categoryLabels: labels }));
            setMeanSettings(prev => ({ ...prev, categoryLabels: labels }));
            setBoxSettings(prev => ({ ...prev, categoryLabels: labels }));
            setViolinSettings(prev => ({ ...prev, categoryLabels: labels }));
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
            default: return countSettings;
        }
    };

    const setCurrentSettings = (settings) => {
        switch (currentPlotType) {
            case 'Count': setCountSettings(settings); break;
            case 'Mean': setMeanSettings(settings); break;
            case 'Box': setBoxSettings(settings); break;
            case 'Violin': setViolinSettings(settings); break;
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
        testStatistic: language === 'বাংলা' ? 'পরীক্ষার পরিসংখ্যান (H)' : 'Test Statistic (H)',
        pValue: language === 'বাংলা' ? 'পি-মান' : 'P-Value',
        significant: language === 'বাংলা' ? 'উল্লেখযোগ্য পার্থক্য পাওয়া গেছে (p < 0.05)' : 'Significant difference found (p < 0.05)',
        notSignificant: language === 'বাংলা' ? 'কোনো উল্লেখযোগ্য পার্থক্য নেই (p ≥ 0.05)' : 'No significant difference (p ≥ 0.05)',
        kruskalTitle: language === 'বাংলা' ? 'ক্রুসকাল-ওয়ালিস এইচ-টেস্ট' : 'Kruskal-Wallis H-Test',
        groupSizes: language === 'বাংলা' ? 'গ্রুপের আকার' : 'Group Sizes',
        boxPlot: language === 'বাংলা' ? 'বক্স প্লট' : 'Box Plot',
        violinPlot: language === 'বাংলা' ? 'ভায়োলিন প্লট' : 'Violin Plot',
        meanPlot: language === 'বাংলা' ? 'গড় মান' : 'Mean Values',
        count: language === 'বাংলা' ? 'গণনা' : 'Count',
        observations: language === 'বাংলা' ? 'পর্যবেক্ষণ' : 'Observations'
    };

    const plotData = results.plot_data || [];
    const groupColumn = results.column_names?.group || columns?.[0] || 'Group';
    const valueColumn = results.column_names?.value || columns?.[1] || 'Value';

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

        const maxWidth = window.innerWidth - 100;
        const maxHeight = window.innerHeight - 300;

        let finalWidth = width;
        let finalHeight = height;

        if (width > maxWidth || height > maxHeight) {
            const scaleX = maxWidth / width;
            const scaleY = maxHeight / height;
            const scale = Math.min(scaleX, scaleY);

            finalWidth = Math.floor(width * scale);
            finalHeight = Math.floor(height * scale);
        }

        return { width: finalWidth, height: finalHeight, originalWidth: width, originalHeight: height };
    };

    const getTextStyle = (bold, italic, underline) => {
        return {
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            textDecoration: underline ? 'underline' : 'none'
        };
    };

    const getCaptionStyle = (settings) => {
        return {
            fontSize: settings.captionSize,
            ...getTextStyle(settings.captionBold, settings.captionItalic, settings.captionUnderline),
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

    const getXAxisLabelOffset = (tickSize, angle = -45) => {
        // Base offset calculation
        // For 12px ticks at -45°, offset should be around -20
        // Formula: -(tickSize * 1.5 + 5)
        return -(tickSize * 1.5 + 5);
    };

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
                <button className="customize-btn" onClick={() => openCustomization('Count')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                    </svg>
                    Customize
                </button>
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        data={data}
                        margin={{ top: settings.captionOn ? 50 : 30, right: 20, left: 20, bottom: 40 }}
                        style={settings.borderOn ? { border: '2px solid black' } : {}}
                    >
                        {settings.captionOn && (
                            <text x="50%" y="25" style={getCaptionStyle(settings)}>
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
                            tick={{ fill: '#6b7280', fontSize: settings.xAxisTickSize }}
                            label={{
                                value: settings.xAxisTitle,
                                position: 'insideBottom',
                                offset: getXAxisLabelOffset(settings.xAxisTickSize),  // Dynamic offset,
                                style: {
                                    fontSize: settings.xAxisTitleSize,
                                    fill: '#374151',
                                    ...getTextStyle(settings.xAxisTitleBold, settings.xAxisTitleItalic, settings.xAxisTitleUnderline)
                                }
                            }}
                            axisLine={{ strokeWidth: 2 }}
                        />
                        <YAxis
                            domain={yDomain}
                            tick={{ fill: '#6b7280', fontSize: settings.yAxisTickSize }}
                            label={{
                                value: settings.yAxisTitle,
                                angle: -90,
                                position: 'insideLeft',
                                style: {
                                    fontSize: settings.yAxisTitleSize,
                                    fill: '#374151',
                                    ...getTextStyle(settings.yAxisTitleBold, settings.yAxisTitleItalic, settings.yAxisTitleUnderline)
                                }
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="count"
                            radius={[0, 0, 0, 0]}
                            barSize={settings.elementWidth * 100}
                            label={settings.dataLabelsOn ? { position: 'top', fill: '#1f2937', fontWeight: 'bold' } : false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
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
                <button className="customize-btn" onClick={() => openCustomization('Mean')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                    </svg>
                    Customize
                </button>
                <ResponsiveContainer width="100%" height={height}>
                    <ComposedChart
                        data={data}
                        margin={{ top: settings.captionOn ? 50 : 30, right: 20, left: 20, bottom: 40 }}
                        style={settings.borderOn ? { border: '2px solid black' } : {}}
                    >
                        {settings.captionOn && (
                            <text x="50%" y="25" style={getCaptionStyle(settings)}>
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
                            tick={{ fill: '#6b7280', fontSize: settings.xAxisTickSize }}
                            label={{
                                value: settings.xAxisTitle,
                                position: 'insideBottom',
                                offset: getXAxisLabelOffset(settings.xAxisTickSize),  // Dynamic offset
                                style: {
                                    fontSize: settings.xAxisTitleSize,
                                    fill: '#374151',
                                    ...getTextStyle(settings.xAxisTitleBold, settings.xAxisTitleItalic, settings.xAxisTitleUnderline)
                                }
                            }}
                            axisLine={{ strokeWidth: 2 }}
                        />
                        <YAxis
                            domain={yDomain}
                            tick={{ fill: '#6b7280', fontSize: settings.yAxisTickSize }}
                            label={{
                                value: settings.yAxisTitle,
                                angle: -90,
                                position: 'insideLeft',
                                style: {
                                    fontSize: settings.yAxisTitleSize,
                                    fill: '#374151',
                                    ...getTextStyle(settings.yAxisTitleBold, settings.yAxisTitleItalic, settings.yAxisTitleUnderline)
                                }
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="mean"
                            radius={[0, 0, 0, 0]}
                            barSize={settings.elementWidth * 100}
                            label={settings.dataLabelsOn ? { position: 'top', fill: '#1f2937', fontSize: 11 } : false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <ErrorBar dataKey="std" width={4} strokeWidth={2} stroke="#374151" />
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
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
                <button className="customize-btn" onClick={() => openCustomization('Box')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                    </svg>
                    Customize
                </button>
                <ResponsiveContainer width="100%" height={height}>
                    <ScatterChart
                        margin={{ top: settings.captionOn ? 50 : 30, right: 20, left: 20, bottom: 40 }}
                        style={settings.borderOn ? { border: '2px solid black' } : {}}
                    >
                        {settings.captionOn && (
                            <text x="50%" y="25" style={getCaptionStyle(settings)}>
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
                            tick={{ fill: '#6b7280', fontSize: settings.xAxisTickSize }}
                            label={{
                                value: settings.xAxisTitle,
                                position: 'insideBottom',
                                offset: getXAxisLabelOffset(settings.xAxisTickSize, -45),  // Dynamic offset
                                style: {
                                    fontSize: settings.xAxisTitleSize,
                                    fill: '#374151',
                                    ...getTextStyle(settings.xAxisTitleBold, settings.xAxisTitleItalic, settings.xAxisTitleUnderline)
                                }
                            }}
                            axisLine={{ strokeWidth: 2 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            domain={yDomain}
                            tick={{ fill: '#6b7280', fontSize: settings.yAxisTickSize }}
                            tickFormatter={(value) => Number.isInteger(value) ? value : value.toFixed(1)}
                            label={{
                                value: settings.yAxisTitle,
                                angle: -90,
                                position: 'insideLeft',
                                style: {
                                    fontSize: settings.yAxisTitleSize,
                                    fill: '#374151',
                                    ...getTextStyle(settings.yAxisTitleBold, settings.yAxisTitleItalic, settings.yAxisTitleUnderline)
                                }
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Scatter data={scatterData} shape={<CustomBoxShape />} />
                    </ScatterChart>
                </ResponsiveContainer>

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
                <button className="customize-btn" onClick={() => openCustomization('Violin')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                    </svg>
                    Customize
                </button>
                <ResponsiveContainer width="100%" height={height}>
                    <ScatterChart
                        margin={{ top: settings.captionOn ? 50 : 30, right: 20, left: 20, bottom: 40 }}
                        style={settings.borderOn ? { border: '2px solid black' } : {}}
                    >
                        {settings.captionOn && (
                            <text x="50%" y="25" style={getCaptionStyle(settings)}>
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
                            tick={{ fill: '#6b7280', fontSize: settings.xAxisTickSize }}
                            label={{
                                value: settings.xAxisTitle,
                                position: 'insideBottom',
                                offset: getXAxisLabelOffset(settings.xAxisTickSize, -45),  // Dynamic offset
                                style: {
                                    fontSize: settings.xAxisTitleSize,
                                    fill: '#374151',
                                    ...getTextStyle(settings.xAxisTitleBold, settings.xAxisTitleItalic, settings.xAxisTitleUnderline)
                                }
                            }}
                            axisLine={{ strokeWidth: 2 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            domain={[yMin, yMax]}
                            tick={{ fill: '#6b7280', fontSize: settings.yAxisTickSize }}
                            tickFormatter={(value) => Number.isInteger(value) ? value : value.toFixed(1)}
                            label={{
                                value: settings.yAxisTitle,
                                angle: -90,
                                position: 'insideLeft',
                                style: {
                                    fontSize: settings.yAxisTitleSize,
                                    fill: '#374151',
                                    ...getTextStyle(settings.yAxisTitleBold, settings.yAxisTitleItalic, settings.yAxisTitleUnderline)
                                }
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Scatter data={scatterData} shape={<CustomViolinShape />} />
                    </ScatterChart>
                </ResponsiveContainer>

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
                <h2 className="stats-title">{t.kruskalTitle}</h2>
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
                            <td className="stats-table-value">{groupColumn} {language === 'বাংলা' ? 'এবং' : 'and'} {valueColumn}</td>
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
                    <button className={`stats-tab ${activeTab === 'count' ? 'active' : ''}`} onClick={() => setActiveTab('count')}>{t.count}</button>
                    <button className={`stats-tab ${activeTab === 'mean' ? 'active' : ''}`} onClick={() => setActiveTab('mean')}>{t.meanPlot}</button>
                    <button className={`stats-tab ${activeTab === 'box' ? 'active' : ''}`} onClick={() => setActiveTab('box')}>{t.boxPlot}</button>
                    <button className={`stats-tab ${activeTab === 'violin' ? 'active' : ''}`} onClick={() => setActiveTab('violin')}>{t.violinPlot}</button>
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
                            <CustomBoxPlot data={boxChartData} settings={boxSettings} />
                        </div>
                    )}

                    {activeTab === 'violin' && (
                        <div className="stats-plot-wrapper active">
                            <CustomViolinPlot data={violinChartData} settings={violinSettings} />
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
            />

            <style jsx="true">{`
                .customize-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
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
                    z-index: 10;
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
            `}</style>
        </div>
    );
};

export default renderKruskalResults;