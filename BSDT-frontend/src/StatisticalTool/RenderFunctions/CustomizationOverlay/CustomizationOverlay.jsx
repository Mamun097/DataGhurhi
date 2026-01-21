import './CustomizationOverlay.css';
import { useState, useEffect } from 'react';
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

const CustomizationOverlay = ({ isOpen, onClose, plotType, settings, onSettingsChange, language, fontFamilyOptions, getDefaultSettings }) => {
    const [translatedLabels, setTranslatedLabels] = useState({});

    useEffect(() => {
        const loadTranslations = async () => {
            if (language === 'English') {
                setTranslatedLabels({});
                return;
            }

            const labelsToTranslate = [
                'Customization',
                'General Settings',
                'Font Style',
                'Axes Settings',
                'Grid Settings',
                'Appearance',
                'Labels',
                'Colors',
                'Dimensions',
                'Caption',
                'Caption On',
                'Caption Text',
                'Caption Size',
                'X-Axis Title',
                'Y-Axis Title',
                'X-Axis Title Size',
                'Y-Axis Title Size',
                'X-Axis Tick Size',
                'Y-Axis Tick Size',
                'Y-Axis Min',
                'Y-Axis Max',
                'Grid On',
                'Grid Style',
                'Grid Color',
                'Grid Opacity',
                'Image Border On',
                'Plot Border On',
                'Bar Border On',
                'Data Labels On',
                'Error Bars On',
                'Width',
                'Bar Width',
                'Box Width',
                'Violin Width',
                'Category Labels',
                'Category Colors',
                'Close',
                'Reset',
                'Auto',
                'Caption Top Margin',
                'X-Axis Bottom Margin',
                'Y-Axis Left Margin',
                'Scatter Point Size',
                'Line Width',
                'Show Regression Lines',
                'Show Scatter Points',
                'Legend Position',
                'Show Mean Line',
                'Show Median Line',
                'Rank Bar Width',
                'Show Data Points',
                'Histogram Bins',
                'Scatter Opacity',
                'Q-Q Line Color',
                'Reference Line Color',
                'Histogram Color',
                'KDE Color',
                'Distribution Color',
                'KDE Line Width',
                'Histogram Opacity',
                'KDE Opacity',
                'Show KDE',
                'Show Histogram',
                'Bin Width',
                'Swarm Point Size',
                'Swarm Opacity',
                'Swarm Color',
                'Orientation',
                'Vertical',
                'Horizontal',
                'Show Percentage',
                'Bar Spacing',
                'Bar Radius',
                'Bar Height',
                'Show Count',
                'Inner Radius',
                'Outer Radius',
                'Pie Width',
                'Legend On',
                'Donut Chart',
                'Start Angle',
                'End Angle',
                'Minimum Angle',
                'Label Line',
                'ECDF Color',
                'CDF Color',
                'Line Style',
                'Show ECDF',
                'Show CDF',
                'Point Size',
                'Show Distribution Parameters',
                'X-Axis Title Horizontal Offset',
                'Y-Axis Title Vertical Offset',
                'Scatter Point Color',
                'Reference Line Width',
                'Reference Line Style',
                'Show Reference Line',
                'Show Critical Values',
                'Distribution Curve Color',
                'Observed Value Line Color',
                'Curve Width',
                'Fill Distribution',
                'Fill Color',
                'Show Legend',
                'Category',
                'Choose color',
                'Enter caption text...',
                'Bold',
                'Italic',
                'Underline',
                'Dotted',
                'Dashed',
                'Solid',
                'Dash-Dot',
                'Long Dash',
                'Right',
                'Bottom',
                'Top',
                'Left',
                'Pie Chart Horizontal Position',
                'Pie Chart Vertical Position',
                'Legend Horizontal Position',
                'Legend Vertical Position',
                'Data Label Position',
                'Outside',
                'Inside',
            ];

            const translations = await translateText(labelsToTranslate, "bn");
            const translated = {};
            labelsToTranslate.forEach((key, idx) => {
                translated[key] = translations[idx];
            });
            setTranslatedLabels(translated);
        };

        loadTranslations();
    }, [language]);

    const getLabel = (text) =>
        language === 'English' ? text : translatedLabels[text] || text;

    if (!isOpen) return null;

    const gridStyles = [
        { value: '3 3', label: getLabel('Dotted') },
        { value: '10 5', label: getLabel('Dashed') },
        { value: '1 0', label: getLabel('Solid') },
        { value: '15 5 5 5', label: getLabel('Dash-Dot') },
        { value: '20 10', label: getLabel('Long Dash') },
    ];

    const lineStyles = [
        { value: 'solid', label: getLabel('Solid') },
        { value: 'dashed', label: getLabel('Dashed') },
        { value: 'dotted', label: getLabel('Dotted') },
    ];

    const dimensions = [
        { value: '800x600', label: '800 × 600' },
        { value: '1024x768', label: '1024 × 768' },
        { value: '1280x720', label: '1280 × 720' },
        { value: '1440x1080', label: '1440 × 1080' },
        { value: '1920x1080', label: '1920 × 1080' },
    ];

    const legendPositions = [
        { value: 'right', label: getLabel('Right') },
        { value: 'bottom', label: getLabel('Bottom') },
        { value: 'top', label: getLabel('Top') },
        { value: 'left', label: getLabel('Left') },
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

    // Determine plot types
    const isAncovaPlot = plotType === 'Scatter' || plotType === 'Residual';
    const isMannWhitneyPlot = plotType === 'Box' || plotType === 'Violin' || plotType === 'Rank';
    const isWilcoxonPlot = plotType === 'Histogram' || plotType === 'Scatter' || plotType === 'QQ' || plotType === 'Box';
    const isEDADistributionPlot = plotType === 'Histogram' || plotType === 'KDE' || plotType === 'Distribution';
    const isKolmogorovPlot = plotType === 'ECDF' || plotType === 'CDF';

    return (
        <div className="customization-overlay-backdrop" onClick={onClose}>
            <div className="customization-overlay" onClick={(e) => e.stopPropagation()}>
                <div className="customization-header">
                    <h3>{getLabel('Customization')} - {plotType}</h3>
                </div>

                <div className="customization-content">
                    {/* General Settings */}
                    <div className="customization-section">
                        <h4 className="section-title">{getLabel('General Settings')}</h4>

                        <div className="setting-group">
                            <label className="setting-label">{getLabel('Dimensions')}</label>
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
                            <label className="setting-label">{getLabel('Font Style')}</label>
                            <select
                                className="setting-select"
                                value={settings.fontFamily}
                                onChange={(e) => handleChange('fontFamily', e.target.value)}
                            >
                                {fontFamilyOptions.map(font => (
                                    <option key={font.value} value={font.value}>{font.label}</option>
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
                                <span>{getLabel('Caption On')}</span>
                            </label>
                        </div>

                        {settings.captionOn && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Caption Text')}</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            className="setting-input"
                                            value={settings.captionText}
                                            onChange={(e) => handleChange('captionText', e.target.value)}
                                            placeholder={getLabel('Enter caption text...')}
                                            style={{ flex: 1 }}
                                        />
                                        <div className="text-style-buttons">
                                            <button
                                                className={`style-btn ${settings.captionBold ? 'active' : ''}`}
                                                onClick={() => handleChange('captionBold', !settings.captionBold)}
                                                title={getLabel('Bold')}
                                            >
                                                <strong>B</strong>
                                            </button>
                                            <button
                                                className={`style-btn ${settings.captionItalic ? 'active' : ''}`}
                                                onClick={() => handleChange('captionItalic', !settings.captionItalic)}
                                                title={getLabel('Italic')}
                                            >
                                                <em>I</em>
                                            </button>
                                            <button
                                                className={`style-btn ${settings.captionUnderline ? 'active' : ''}`}
                                                onClick={() => handleChange('captionUnderline', !settings.captionUnderline)}
                                                title={getLabel('Underline')}
                                            >
                                                <u>U</u>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Caption Size')}</label>
                                        <input
                                            type="number"
                                            className="setting-input"
                                            value={settings.captionSize}
                                            onChange={(e) => handleChange('captionSize', parseInt(e.target.value))}
                                            min="10"
                                            max="48"
                                        />
                                    </div>
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Caption Top Margin')}</label>
                                        <input
                                            type="number"
                                            className="setting-input"
                                            value={settings.captionTopMargin}
                                            onChange={(e) => handleChange('captionTopMargin', parseInt(e.target.value))}
                                            min="10"
                                            max="100"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Axes Settings */}
                    {plotType !== 'Pie' && (
                        <div className="customization-section">
                            <h4 className="section-title">{getLabel('Axes Settings')}</h4>

                            <div className="setting-group">
                                <label className="setting-label">{getLabel('X-Axis Title')}</label>
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
                                            title={getLabel('Bold')}
                                        >
                                            <strong>B</strong>
                                        </button>
                                        <button
                                            className={`style-btn ${settings.xAxisTitleItalic ? 'active' : ''}`}
                                            onClick={() => handleChange('xAxisTitleItalic', !settings.xAxisTitleItalic)}
                                            title={getLabel('Italic')}
                                        >
                                            <em>I</em>
                                        </button>
                                        <button
                                            className={`style-btn ${settings.xAxisTitleUnderline ? 'active' : ''}`}
                                            onClick={() => handleChange('xAxisTitleUnderline', !settings.xAxisTitleUnderline)}
                                            title={getLabel('Underline')}
                                        >
                                            <u>U</u>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="setting-group">
                                <label className="setting-label">{getLabel('Y-Axis Title')}</label>
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
                                            title={getLabel('Bold')}
                                        >
                                            <strong>B</strong>
                                        </button>
                                        <button
                                            className={`style-btn ${settings.yAxisTitleItalic ? 'active' : ''}`}
                                            onClick={() => handleChange('yAxisTitleItalic', !settings.yAxisTitleItalic)}
                                            title={getLabel('Italic')}
                                        >
                                            <em>I</em>
                                        </button>
                                        <button
                                            className={`style-btn ${settings.yAxisTitleUnderline ? 'active' : ''}`}
                                            onClick={() => handleChange('yAxisTitleUnderline', !settings.yAxisTitleUnderline)}
                                            title={getLabel('Underline')}
                                        >
                                            <u>U</u>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="setting-row">
                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('X-Axis Title Size')}</label>
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
                                    <label className="setting-label">{getLabel('Y-Axis Title Size')}</label>
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
                                    <label className="setting-label">{getLabel('X-Axis Tick Size')}</label>
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
                                    <label className="setting-label">{getLabel('Y-Axis Tick Size')}</label>
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
                                    <label className="setting-label">{getLabel('X-Axis Bottom Margin')}</label>
                                    <input
                                        type="number"
                                        className="setting-input"
                                        value={settings.xAxisBottomMargin}
                                        onChange={(e) => handleChange('xAxisBottomMargin', parseInt(e.target.value))}
                                        min="-100"
                                        max="0"
                                    />
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Y-Axis Left Margin')}</label>
                                    <input
                                        type="number"
                                        className="setting-input"
                                        value={settings.yAxisLeftMargin}
                                        onChange={(e) => handleChange('yAxisLeftMargin', parseInt(e.target.value))}
                                        min="-50"
                                        max="50"
                                    />
                                </div>
                            </div>

                            <div className="setting-row">
                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('X-Axis Title Horizontal Offset')}</label>
                                    <input
                                        type="number"
                                        className="setting-input"
                                        value={settings.xAxisTitleOffset}
                                        onChange={(e) => handleChange('xAxisTitleOffset', parseInt(e.target.value))}
                                        min="-200"
                                        max="200"
                                    />
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Y-Axis Title Vertical Offset')}</label>
                                    <input
                                        type="number"
                                        className="setting-input"
                                        value={settings.yAxisTitleOffset}
                                        onChange={(e) => handleChange('yAxisTitleOffset', parseInt(e.target.value))}
                                        min="-200"
                                        max="200"
                                    />
                                </div>
                            </div>                        

                            <div className="setting-row">
                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Y-Axis Min')}</label>
                                    <input
                                        type="text"
                                        className="setting-input"
                                        value={settings.yAxisMin}
                                        onChange={(e) => handleChange('yAxisMin', e.target.value)}
                                        placeholder={getLabel('Auto')}
                                    />
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Y-Axis Max')}</label>
                                    <input
                                        type="text"
                                        className="setting-input"
                                        value={settings.yAxisMax}
                                        onChange={(e) => handleChange('yAxisMax', e.target.value)}
                                        placeholder={getLabel('Auto')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grid Settings */}
                    {plotType !== 'Pie' && (
                        <div className="customization-section">
                            <h4 className="section-title">{getLabel('Grid Settings')}</h4>

                            <div className="setting-group">
                                <label className="setting-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.gridOn}
                                        onChange={(e) => handleChange('gridOn', e.target.checked)}
                                    />
                                    <span>{getLabel('Grid On')}</span>
                                </label>
                            </div>

                            {settings.gridOn && (
                                <>
                                    <div className="setting-row">
                                        <div className="setting-group">
                                            <label className="setting-label">{getLabel('Grid Style')}</label>
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
                                            <label className="setting-label">{getLabel('Grid Color')}</label>
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
                                        <label className="setting-label">{getLabel('Grid Opacity')}</label>
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
                    )}

                    {/* Appearance Settings */}
                    <div className="customization-section">
                        <h4 className="section-title">{getLabel('Appearance')}</h4>

                        <div className="setting-group">
                            <label className="setting-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.borderOn}
                                    onChange={(e) => handleChange('borderOn', e.target.checked)}
                                />
                                <span>{getLabel('Image Border On')}</span>
                            </label>
                        </div>

                        <div className="setting-group">
                            <label className="setting-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.plotBorderOn}
                                    onChange={(e) => handleChange('plotBorderOn', e.target.checked)}
                                />
                                <span>{getLabel('Plot Border On')}</span>
                            </label>
                        </div>

                        {(plotType === 'Count' || plotType === 'Mean' || plotType === 'Rank' || plotType === 'Histogram') && ( 
                            <div className="setting-group">
                                <label className="setting-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.barBorderOn}
                                        onChange={(e) => handleChange('barBorderOn', e.target.checked)}
                                    />
                                    <span>{getLabel('Bar Border On')}</span>
                                </label>
                            </div>
                        )}

                        {(plotType === 'Count' || plotType === 'Mean' || plotType === 'Histogram' || plotType === 'Box') && (
                            <div className="setting-group">
                                <label className="setting-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.dataLabelsOn}
                                        onChange={(e) => handleChange('dataLabelsOn', e.target.checked)}
                                    />
                                    <span>{getLabel('Data Labels On')}</span>
                                </label>
                            </div>
                        )}

                        {plotType === 'Mean' && (
                            <div className="setting-group">
                                <label className="setting-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.errorBarsOn}
                                        onChange={(e) => handleChange('errorBarsOn', e.target.checked)}
                                    />
                                    <span>{getLabel('Error Bars On')}</span>
                                </label>
                            </div>
                        )}

                        {!isKolmogorovPlot && !isAncovaPlot && plotType !== 'QQ' && plotType !== 'KDE' && plotType !== 'FDistribution' && plotType !== 'ZDistribution' && plotType !== 'TDistribution' && plotType !== 'Swarm' && plotType !== 'Pie' && (
                            <div className="setting-group">
                                <label className="setting-label">
                                    {plotType === 'Count' || plotType === 'Mean' || plotType === 'Histogram' || plotType === 'Vertical' || plotType === 'Horizontal' || plotType === 'HistogramKDE' ? getLabel('Bar Width') :
                                    plotType === 'Box' ? getLabel('Box Width') : 
                                    plotType === 'Rank' ? getLabel('Rank Bar Width') : getLabel('Violin Width')}
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
                        )}

                        {/* Kolmogorov-Smirnov Specific Settings */}
                        {isKolmogorovPlot && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showECDF}
                                            onChange={(e) => handleChange('showECDF', e.target.checked)}
                                        />
                                        <span>{getLabel('Show ECDF')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showCDF}
                                            onChange={(e) => handleChange('showCDF', e.target.checked)}
                                        />
                                        <span>{getLabel('Show CDF')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showDistributionParameters}
                                            onChange={(e) => handleChange('showDistributionParameters', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Distribution Parameters')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.legendOn}
                                            onChange={(e) => handleChange('legendOn', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Legend')}</span>
                                    </label>
                                </div>    

                                {settings.legendOn && (
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Legend Position')}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.legendPosition}
                                            onChange={(e) => handleChange('legendPosition', e.target.value)}
                                        >
                                            <option value="top">{getLabel('Top')}</option>
                                            <option value="bottom">{getLabel('Bottom')}</option>
                                        </select>
                                    </div>
                                )}

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('ECDF Color')}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.ecdfColor}
                                            onChange={(e) => handleChange('ecdfColor', e.target.value)}
                                        />
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('CDF Color')}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.cdfColor}
                                            onChange={(e) => handleChange('cdfColor', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Line Style')}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.lineStyle}
                                            onChange={(e) => handleChange('lineStyle', e.target.value)}
                                        >
                                            {lineStyles.map(style => (
                                                <option key={style.value} value={style.value}>{style.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Line Width')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.lineWidth}
                                            onChange={(e) => handleChange('lineWidth', parseInt(e.target.value))}
                                            min="1"
                                            max="5"
                                            step="1"
                                        />
                                        <span className="range-value">{settings.lineWidth}</span>
                                    </div>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Point Size')}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.pointSize}
                                        onChange={(e) => handleChange('pointSize', parseInt(e.target.value))}
                                        min="2"
                                        max="10"
                                        step="1"
                                    />
                                    <span className="range-value">{settings.pointSize}</span>
                                </div>
                            </>
                        )}                        

                        {/* Swarm Plot Specific Settings */}
                        {plotType === 'Swarm' && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showDataPoints}
                                            onChange={(e) => handleChange('showDataPoints', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Data Points')}</span>
                                    </label>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Swarm Point Size')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.swarmPointSize}
                                            onChange={(e) => handleChange('swarmPointSize', parseInt(e.target.value))}
                                            min="2"
                                            max="20"
                                            step="1"
                                        />
                                        <span className="range-value">{settings.swarmPointSize}</span>
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Swarm Opacity')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.swarmOpacity}
                                            onChange={(e) => handleChange('swarmOpacity', parseFloat(e.target.value))}
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                        />
                                        <span className="range-value">{settings.swarmOpacity.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Swarm Color')}</label>
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={settings.swarmColor}
                                        onChange={(e) => handleChange('swarmColor', e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {plotType === 'Pie' && (
                        <>
                            <div className="setting-row">
                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Pie Chart Horizontal Position')}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.pieXPosition || 50}
                                        onChange={(e) => handleChange('pieXPosition', parseInt(e.target.value))}
                                        min="0"
                                        max="100"
                                    />
                                    <span className="range-value">{settings.pieXPosition || 50}%</span>
                                </div>
                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Pie Chart Vertical Position')}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.pieYPosition || 50}
                                        onChange={(e) => handleChange('pieYPosition', parseInt(e.target.value))}
                                        min="0"
                                        max="100"
                                    />
                                    <span className="range-value">{settings.pieYPosition || 50}%</span>
                                </div>
                            </div>
                            
                            <div className="setting-row">
                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Legend Horizontal Position')}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.legendXPosition || 100}
                                        onChange={(e) => handleChange('legendXPosition', parseInt(e.target.value))}
                                        min="0"
                                        max="100"
                                    />
                                    <span className="range-value">{settings.legendXPosition || 100}%</span>
                                </div>
                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Legend Vertical Position')}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.legendYPosition || 50}
                                        onChange={(e) => handleChange('legendYPosition', parseInt(e.target.value))}
                                        min="0"
                                        max="100"
                                    />
                                    <span className="range-value">{settings.legendYPosition || 50}%</span>
                                </div>
                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.dataLabelsOn}
                                        onChange={(e) => handleChange('dataLabelsOn', e.target.checked)}
                                    />
                                    <span>{getLabel('Data Labels On')}</span>
                                    </label>
                                </div>                            
                            </div>

                            {settings.dataLabelsOn && (
                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Data Label Position')}</label>
                                    <select
                                        className="setting-select"
                                        value={settings.dataLabelPosition || 'outside'}
                                        onChange={(e) => handleChange('dataLabelPosition', e.target.value)}
                                    >
                                        <option value="outside">{getLabel('Outside')}</option>
                                        <option value="inside">{getLabel('Inside')}</option>
                                    </select>
                                </div>
                            )}

                        </>
                        )}                        
                    
                        {/* Anderson-Darling Specific Settings */}
                        {plotType === 'QQ' && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showScatterPoints}
                                            onChange={(e) => handleChange('showScatterPoints', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Scatter Points')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showReferenceLine}
                                            onChange={(e) => handleChange('showReferenceLine', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Reference Line')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showCriticalValues}
                                            onChange={(e) => handleChange('showCriticalValues', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Critical Values')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                        type="checkbox"
                                        checked={settings.legendOn}
                                        onChange={(e) => handleChange('legendOn', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Legend')}</span>
                                    </label>
                                </div>

                                {settings.legendOn && (
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Legend Position')}</label>
                                        <select
                                        className="setting-select"
                                        value={settings.legendPosition}
                                        onChange={(e) => handleChange('legendPosition', e.target.value)}
                                        >
                                        <option value="top">{getLabel('Top')}</option>
                                        <option value="bottom">{getLabel('Bottom')}</option>
                                        </select>
                                    </div>
                                )}
                                

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Scatter Point Size')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.scatterSize}
                                            onChange={(e) => handleChange('scatterSize', parseInt(e.target.value))}
                                            min="2"
                                            max="20"
                                            step="1"
                                        />
                                        <span className="range-value">{settings.scatterSize}</span>
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Scatter Opacity')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.scatterOpacity}
                                            onChange={(e) => handleChange('scatterOpacity', parseFloat(e.target.value))}
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                        />
                                        <span className="range-value">{settings.scatterOpacity.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Scatter Point Color')}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.scatterColor}
                                            onChange={(e) => handleChange('scatterColor', e.target.value)}
                                        />
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Reference Line Color')}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.referenceLineColor}
                                            onChange={(e) => handleChange('referenceLineColor', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Reference Line Width')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.referenceLineWidth}
                                            onChange={(e) => handleChange('referenceLineWidth', parseInt(e.target.value))}
                                            min="1"
                                            max="5"
                                            step="1"
                                        />
                                        <span className="range-value">{settings.referenceLineWidth}</span>
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Reference Line Style')}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.referenceLineStyle}
                                            onChange={(e) => handleChange('referenceLineStyle', e.target.value)}
                                        >
                                            <option value="solid">{getLabel('Solid')}</option>
                                            <option value="dashed">{getLabel('Dashed')}</option>
                                            <option value="dotted">{getLabel('Dotted')}</option>
                                        </select>
                                    </div>

                                </div>
                            </>
                        )}
                        
                        {/* F/Z/T Distribution Plot Specific Settings */}
                        {(plotType === 'FDistribution' || plotType === 'ZDistribution' || plotType === 'TDistribution') && (
                            <>
                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Curve Width')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.distributionCurveWidth}
                                            onChange={(e) => handleChange('distributionCurveWidth', parseInt(e.target.value))}
                                            min="1"
                                            max="5"
                                            step="1"
                                        />
                                        <span className="range-value">{settings.distributionCurveWidth}</span>
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Distribution Curve Color')}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.distributionCurveColor}
                                            onChange={(e) => handleChange('distributionCurveColor', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {plotType === 'FDistribution' && (
                                    <>
                                        <div className="setting-group">
                                            <label className="setting-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.distributionFill}
                                                    onChange={(e) => handleChange('distributionFill', e.target.checked)}
                                                />
                                                <span>{getLabel('Fill Distribution')}</span>
                                            </label>
                                        </div>

                                        {settings.distributionFill && (
                                            <div className="setting-group">
                                                <label className="setting-label">{getLabel('Fill Color')}</label>
                                                <input
                                                    type="color"
                                                    className="color-picker"
                                                    value={settings.distributionFillColor}
                                                    onChange={(e) => handleChange('distributionFillColor', e.target.value)}
                                                />
                                                
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {plotType === 'Scatter' && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showScatterPoints}
                                            onChange={(e) => handleChange('showScatterPoints', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Scatter Points')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showRegressionLines}
                                            onChange={(e) => handleChange('showRegressionLines', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Regression Lines')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showReferenceLine}
                                            onChange={(e) => handleChange('showReferenceLine', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Reference Line')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showCriticalValues}
                                            onChange={(e) => handleChange('showCriticalValues', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Critical Values')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.legendOn}
                                            onChange={(e) => handleChange('legendOn', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Legend')}</span>
                                    </label>
                                </div>    

                                {settings.legendOn && (
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Legend Position')}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.legendPosition}
                                            onChange={(e) => handleChange('legendPosition', e.target.value)}
                                        >
                                            <option value="top">{getLabel('Top')}</option>
                                            <option value="bottom">{getLabel('Bottom')}</option>
                                        </select>
                                    </div>
                                )}

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Scatter Point Size')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.scatterSize}
                                            onChange={(e) => handleChange('scatterSize', parseInt(e.target.value))}
                                            min="2"
                                            max="20"
                                            step="1"
                                        />
                                        <span className="range-value">{settings.scatterSize}</span>
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Scatter Opacity')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.scatterOpacity}
                                            onChange={(e) => handleChange('scatterOpacity', parseFloat(e.target.value))}
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                        />
                                        <span className="range-value">{settings.scatterOpacity.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Scatter Point Color')}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.scatterColor}
                                            onChange={(e) => handleChange('scatterColor', e.target.value)}
                                        />
                                    </div>

                                    {settings.showRegressionLines && (
                                        <div className="setting-group">
                                            <label className="setting-label">{getLabel('Q-Q Line Color')}</label>
                                            <input
                                                type="color"
                                                className="color-picker"
                                                value={settings.qqLineColor}
                                                onChange={(e) => handleChange('qqLineColor', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>

                                {settings.showReferenceLine && (
                                    <div className="setting-row">
                                        <div className="setting-group">
                                            <label className="setting-label">{getLabel('Reference Line Color')}</label>
                                            <input
                                                type="color"
                                                className="color-picker"
                                                value={settings.referenceLineColor}
                                                onChange={(e) => handleChange('referenceLineColor', e.target.value)}
                                            />
                                        </div>

                                        <div className="setting-group">
                                            <label className="setting-label">{getLabel('Reference Line Width')}</label>
                                            <input
                                                type="range"
                                                className="setting-range"
                                                value={settings.referenceLineWidth}
                                                onChange={(e) => handleChange('referenceLineWidth', parseInt(e.target.value))}
                                                min="1"
                                                max="5"
                                                step="1"
                                            />
                                            <span className="range-value">{settings.referenceLineWidth}</span>
                                        </div>
                                    </div>
                                )}

                                {settings.showReferenceLine && (
                                    <div className="setting-row">
                                        <div className="setting-group">
                                            <label className="setting-label">{getLabel('Reference Line Style')}</label>
                                            <select
                                                className="setting-select"
                                                value={settings.referenceLineStyle}
                                                onChange={(e) => handleChange('referenceLineStyle', e.target.value)}
                                            >
                                                <option value="solid">{getLabel('Solid')}</option>
                                                <option value="dashed">{getLabel('Dashed')}</option>
                                                <option value="dotted">{getLabel('Dotted')}</option>
                                            </select>
                                        </div>

                                        {settings.showRegressionLines && (
                                            <div className="setting-group">
                                                <label className="setting-label">{getLabel('Line Width')}</label>
                                                <input
                                                    type="range"
                                                    className="setting-range"
                                                    value={settings.lineWidth}
                                                    onChange={(e) => handleChange('lineWidth', parseInt(e.target.value))}
                                                    min="1"
                                                    max="10"
                                                    step="1"
                                                />
                                                <span className="range-value">{settings.lineWidth}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </>
                        )}            
                        
                        {/* Residual Plot Specific Settings */}
                        {plotType === 'Residual' && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showScatterPoints}
                                            onChange={(e) => handleChange('showScatterPoints', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Scatter Points')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showReferenceLine}
                                            onChange={(e) => handleChange('showReferenceLine', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Reference Line')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showCriticalValues}
                                            onChange={(e) => handleChange('showCriticalValues', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Critical Values')}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.legendOn}
                                            onChange={(e) => handleChange('legendOn', e.target.checked)}
                                        />
                                        <span>{getLabel('Show Legend')}</span>
                                    </label>
                                </div>    

                                {settings.legendOn && (
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Legend Position')}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.legendPosition}
                                            onChange={(e) => handleChange('legendPosition', e.target.value)}
                                        >
                                            <option value="top">{getLabel('Top')}</option>
                                            <option value="bottom">{getLabel('Bottom')}</option>
                                        </select>
                                    </div>
                                )}

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Scatter Point Size')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.scatterSize}
                                            onChange={(e) => handleChange('scatterSize', parseInt(e.target.value))}
                                            min="2"
                                            max="20"
                                            step="1"
                                        />
                                        <span className="range-value">{settings.scatterSize}</span>
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Scatter Opacity')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.scatterOpacity}
                                            onChange={(e) => handleChange('scatterOpacity', parseFloat(e.target.value))}
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                        />
                                        <span className="range-value">{settings.scatterOpacity.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Scatter Point Color')}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.scatterColor}
                                            onChange={(e) => handleChange('scatterColor', e.target.value)}
                                        />
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Reference Line Color')}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.referenceLineColor}
                                            onChange={(e) => handleChange('referenceLineColor', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Reference Line Width')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.referenceLineWidth}
                                            onChange={(e) => handleChange('referenceLineWidth', parseInt(e.target.value))}
                                            min="1"
                                            max="5"
                                            step="1"
                                        />
                                        <span className="range-value">{settings.referenceLineWidth}</span>
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Reference Line Style')}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.referenceLineStyle}
                                            onChange={(e) => handleChange('referenceLineStyle', e.target.value)}
                                        >
                                            <option value="solid">{getLabel('Solid')}</option>
                                            <option value="dashed">{getLabel('Dashed')}</option>
                                            <option value="dotted">{getLabel('Dotted')}</option>
                                        </select>
                                    </div>

                                </div>
                            </>
                        )}                                    

                        {plotType === 'Histogram' && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Histogram Color')}</label>
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={settings.histogramColor}
                                        onChange={(e) => handleChange('histogramColor', e.target.value)}
                                    />
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('Histogram Opacity')}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.histogramOpacity || 0.7}
                                        onChange={(e) => handleChange('histogramOpacity', parseFloat(e.target.value))}
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                    />
                                    <span className="range-value">{(settings.histogramOpacity || 0.7).toFixed(1)}</span>
                                </div>
                            </>
                        )}

                        {plotType === 'KDE' && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('KDE Color')}</label>
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={settings.kdeColor}
                                        onChange={(e) => handleChange('kdeColor', e.target.value)}
                                    />
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('KDE Opacity')}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.kdeOpacity || 0.7}
                                        onChange={(e) => handleChange('kdeOpacity', parseFloat(e.target.value))}
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                    />
                                    <span className="range-value">{(settings.kdeOpacity || 0.7).toFixed(1)}</span>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('KDE Line Width')}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.kdeLineWidth}
                                        onChange={(e) => handleChange('kdeLineWidth', parseInt(e.target.value))}
                                        min="1"
                                        max="5"
                                        step="1"
                                    />
                                    <span className="range-value">{settings.kdeLineWidth}</span>
                                </div>
                            </>
                        )}

                        {plotType === 'HistogramKDE' && (
                            <>
                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Histogram Bins')}</label>
                                        <input
                                            type="text"
                                            className="setting-input"
                                            value={settings.histogramBins}
                                            onChange={(e) => handleChange('histogramBins', e.target.value)}
                                            placeholder="auto"
                                        />
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Histogram Color')}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.histogramColor}
                                            onChange={(e) => handleChange('histogramColor', e.target.value)}
                                        />
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('KDE Color')}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.kdeColor}
                                            onChange={(e) => handleChange('kdeColor', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('Histogram Opacity')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.histogramOpacity || 0.7}
                                            onChange={(e) => handleChange('histogramOpacity', parseFloat(e.target.value))}
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                        />
                                        <span className="range-value">{(settings.histogramOpacity || 0.7).toFixed(1)}</span>
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{getLabel('KDE Opacity')}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.kdeOpacity || 0.7}
                                            onChange={(e) => handleChange('kdeOpacity', parseFloat(e.target.value))}
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                        />
                                        <span className="range-value">{(settings.kdeOpacity || 0.7).toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{getLabel('KDE Line Width')}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.kdeLineWidth}
                                        onChange={(e) => handleChange('kdeLineWidth', parseInt(e.target.value))}
                                        min="1"
                                        max="5"
                                        step="1"
                                    />
                                    <span className="range-value">{settings.kdeLineWidth}</span>
                                </div>
                            </>
                        )}

                    </div>

                    {/* Category Labels */}
                    {!isKolmogorovPlot && plotType !== 'QQ' && plotType !== 'Histogram' && plotType !== 'KDE' && plotType !== 'HistogramKDE' && (
                        <div className="customization-section">
                            <h4 className="section-title">{getLabel('Category Labels')}</h4>
                            {settings.categoryLabels.map((label, index) => (
                                <div key={index} className="setting-group category-label-row">
                                    <label className="setting-label">{getLabel('Category')} {index + 1}</label>
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
                                            title={getLabel('Choose color')}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}    
                
                                            
                </div>

                <div className="customization-footer">
                    <button className="reset-btn" onClick={handleReset}>
                        {getLabel('Reset')}
                    </button>
                    <button className="apply-btn" onClick={onClose}>
                        {getLabel('Close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizationOverlay;