import './CustomizationOverlay.css';

const CustomizationOverlay = ({ isOpen, onClose, plotType, settings, onSettingsChange, language, fontFamilyOptions, getDefaultSettings }) => {
    if (!isOpen) return null;

    const t = {
        customization: language === 'বাংলা' ? 'কাস্টমাইজেশন' : 'Customization',
        general: language === 'বাংলা' ? 'সাধারণ সেটিংস' : 'General Settings',
        fontFamily: language === 'বাংলা' ? 'ফন্ট স্টাইল' : 'Font Style',
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
        borderOn: language === 'বাংলা' ? 'বর্ডার চালু' : 'Image Border On',
        plotBorderOn: language === 'বাংলা' ? 'প্লট বর্ডার চালু' : 'Plot Border On',
        barBorderOn: language === 'বাংলা' ? 'বার বর্ডার চালু' : 'Bar Border On',
        dataLabelsOn: language === 'বাংলা' ? 'ডেটা লেবেল চালু' : 'Data Labels On',
        errorBarsOn: language === 'বাংলা' ? 'এরর বার চালু' : 'Error Bars On',
        width: language === 'বাংলা' ? 'প্রস্থ' : 'Width',
        barWidth: language === 'বাংলা' ? 'বার প্রস্থ' : 'Bar Width',
        boxWidth: language === 'বাংলা' ? 'বক্স প্রস্থ' : 'Box Width',
        violinWidth: language === 'বাংলা' ? 'ভায়োলিন প্রস্থ' : 'Violin Width',
        categoryLabels: language === 'বাংলা' ? 'ক্যাটাগরি লেবেল' : 'Category Labels',
        categoryColors: language === 'বাংলা' ? 'ক্যাটাগরি রং' : 'Category Colors',
        close: language === 'বাংলা' ? 'বন্ধ করুন' : 'Close',
        reset: language === 'বাংলা' ? 'রিসেট' : 'Reset',
        auto: language === 'বাংলা' ? 'স্বয়ংক্রিয়' : 'Auto',
        captionTopMargin: language === 'বাংলা' ? 'ক্যাপশন উপরের মার্জিন' : 'Caption Top Margin',
        xAxisBottomMargin: language === 'বাংলা' ? 'X অক্ষ নিচের মার্জিন' : 'X-Axis Bottom Margin',
        yAxisLeftMargin: language === 'বাংলা' ? 'Y অক্ষ বামের মার্জিন' : 'Y-Axis Left Margin',
        xAxisTitleOffset: language === 'বাংলা' ? 'X অক্ষ শিরোনাম অনুভূমিক স্থানান্তর' : 'X-Axis Title Horizontal Offset',
        yAxisTitleOffset: language === 'বাংলা' ? 'Y অক্ষ শিরোনাম উল্লম্ব স্থানান্তর' : 'Y-Axis Title Vertical Offset'        
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
        { value: '1280x720', label: '1280 × 720' },
        { value: '1440x1080', label: '1440 × 1080' },
        { value: '1920x1080', label: '1920 × 1080' },
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
                            <label className="setting-label">{t.fontFamily}</label>
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
                                <span>{t.captionOn}</span>
                            </label>
                        </div>

                        {settings.captionOn && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-label">{t.captionText}</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            className="setting-input"
                                            value={settings.captionText}
                                            onChange={(e) => handleChange('captionText', e.target.value)}
                                            placeholder="Enter caption text..."
                                            style={{ flex: 1 }}
                                        />
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
                                <div className="setting-row">
                                    <div className="setting-group">
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
                                    <div className="setting-group">
                                        <label className="setting-label">{t.captionTopMargin}</label>
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
                                <label className="setting-label">{t.xAxisBottomMargin}</label>
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
                                <label className="setting-label">{t.yAxisLeftMargin}</label>
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
                                <label className="setting-label">{t.xAxisTitleOffset}</label>
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
                                <label className="setting-label">{t.yAxisTitleOffset}</label>
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
                                    checked={settings.plotBorderOn}
                                    onChange={(e) => handleChange('plotBorderOn', e.target.checked)}
                                />
                                <span>{t.plotBorderOn}</span>
                            </label>
                        </div>

                        {(plotType === 'Count' || plotType === 'Mean') && (
                            <div className="setting-group">
                                <label className="setting-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.barBorderOn}
                                        onChange={(e) => handleChange('barBorderOn', e.target.checked)}
                                    />
                                    <span>{t.barBorderOn}</span>
                                </label>
                            </div>
                        )}

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

                        {plotType === 'Mean' && (
                            <div className="setting-group">
                                <label className="setting-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.errorBarsOn}
                                        onChange={(e) => handleChange('errorBarsOn', e.target.checked)}
                                    />
                                    <span>{t.errorBarsOn}</span>
                                </label>
                            </div>
                        )}

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

export default CustomizationOverlay;