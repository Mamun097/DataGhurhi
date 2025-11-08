import './CustomizationOverlay.css';

const CustomizationOverlay = ({ isOpen, onClose, plotType, settings, onSettingsChange, language, fontFamilyOptions, getDefaultSettings, results }) => {
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
        cellSize: language === 'বাংলা' ? 'সেল আকার' : 'Cell Size',
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
        variableLabels: language === 'বাংলা' ? 'ভেরিয়েবল লেবেল' : 'Variable Labels',
        metricType: language === 'বাংলা' ? 'প্রদর্শনের জন্য মেট্রিক' : 'Metric to Display',
        legendTitle: language === 'বাংলা' ? 'লেজেন্ড শিরোনাম' : 'Legend Title',
        legendPosition: language === 'বাংলা' ? 'লেজেন্ড অবস্থান' : 'Legend Position',
        showValues: language === 'বাংলা' ? 'মান প্রদর্শন করুন' : 'Show Values',
        valueSize: language === 'বাংলা' ? 'মানের আকার' : 'Value Size',
        valueColor: language === 'বাংলা' ? 'মানের রঙ' : 'Value Color',
        cellBorderOn: language === 'বাংলা' ? 'সেল বর্ডার চালু' : 'Cell Border On',
        cellBorderWidth: language === 'বাংলা' ? 'বর্ডারের প্রস্থ' : 'Border Width',
        cellBorderColor: language === 'বাংলা' ? 'বর্ডারের রং' : 'Border Color',
        colorScheme: language === 'বাংলা' ? 'রঙের স্কিম' : 'Color Scheme',
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

    const colorSchemes = [
        { value: 'blues', label: 'Blues' },
        { value: 'redblue', label: 'Red-Blue' },
        { value: 'greens', label: 'Greens' },
        { value: 'reds', label: 'Reds' },
        { value: 'viridis', label: 'Viridis' },
        { value: 'plasma', label: 'Plasma' },
        { value: 'inferno', label: 'Inferno' },
    ];

    const metricTypes = [
        { value: 'cramers_v', label: "Cramer's V" },
        { value: 'p_value', label: 'P-Value' },
        { value: 'p_adjusted', label: 'Adjusted P-Value' },
        { value: 'chi2', label: 'Chi-Square Statistic' },
    ];

    const legendPositions = [
        { value: 'right', label: language === 'বাংলা' ? 'ডান' : 'Right' },
        { value: 'bottom', label: language === 'বাংলা' ? 'নিচে' : 'Bottom' },
        { value: 'top', label: language === 'বাংলা' ? 'উপরে' : 'Top' },
    ];

    const handleChange = (key, value) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const handleCategoryLabelChange = (index, value) => {
        const newLabels = [...settings.categoryLabels];
        newLabels[index] = value;
        handleChange('categoryLabels', newLabels);
    };

    const handleVariableLabelChange = (index, value) => {
        const newLabels = [...settings.variableLabels];
        newLabels[index] = value;
        handleChange('variableLabels', newLabels);
    };

    const handleCategoryColorChange = (index, value) => {
        const newColors = [...settings.categoryColors];
        newColors[index] = value;
        handleChange('categoryColors', newColors);
    };

    const handleReset = () => {
        onSettingsChange(getDefaultSettings());
    };

    // Check if current plot is for Cramer's V
    const isCramersV = results?.test?.includes("Cramer") || results?.test?.includes("ক্রেমার");

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

                        {/* Metric Type Selector - FIXED: Single selector for all plot types */}
                        {(plotType === 'Grouped Bar' || plotType === 'Heatmap') && (
                            <div className="setting-group">
                                <label className="setting-label">{t.metricType}</label>
                                <select
                                    className="setting-select"
                                    value={settings.metricType}
                                    onChange={(e) => {
                                        const newMetricType = e.target.value;
                                        let newYAxisTitle = settings.yAxisTitle;
                                        let newLegendTitle = settings.legendTitle;
                                        
                                        // Set appropriate titles based on metric type
                                        if (newMetricType === 'p_value') {
                                            newYAxisTitle = 'P-Value';
                                            newLegendTitle = 'P-Value';
                                        } else if (newMetricType === 'cramers_v') {
                                            newYAxisTitle = "Cramer's V";
                                            newLegendTitle = "Cramer's V";
                                        } else if (newMetricType === 'chi2') {
                                            newYAxisTitle = 'Chi-Square Statistic';
                                            newLegendTitle = 'Chi-Square';
                                        } else if (newMetricType === 'p_adjusted') {
                                            newYAxisTitle = 'Adjusted P-Value';
                                            newLegendTitle = 'Adj. P-Value';
                                        }

                                        onSettingsChange({
                                            ...settings,
                                            metricType: newMetricType,
                                            yAxisTitle: newYAxisTitle,
                                            legendTitle: newLegendTitle
                                        });
                                    }}
                                >
                                    {metricTypes.map(metric => (
                                        <option key={metric.value} value={metric.value}>
                                            {metric.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Variable Pair Selector - FIXED: Only show for appropriate plots */}
                        {(plotType === 'Mosaic' || plotType === 'Stacked Bar') && (
                            <div className="setting-group">
                                <label className="setting-label">
                                    {language === 'বাংলা' ? 'প্রদর্শনের জন্য জোড়া' : 'Variable Pair to Display'}
                                </label>
                                <select
                                    className="setting-select"
                                    value={settings.selectedPair || ''}
                                    onChange={(e) => handleChange('selectedPair', e.target.value || null)}
                                >
                                    <option value="">
                                        {language === 'বাংলা' ? 'স্বয়ংক্রিয় (প্রথম উল্লেখযোগ্য)' : 'Auto (First Significant)'}
                                    </option>
                                    {results?.pairwise_results?.map((pair, idx) => (
                                        <option key={idx} value={`${pair.variable1}-${pair.variable2}`}>
                                            {pair.variable1} × {pair.variable2}
                                            {pair.p_value < 0.05 ? ' ★' : ''}
                                        </option>
                                    ))}
                                </select>
                                <p style={{
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    marginTop: '8px',
                                    fontStyle: 'italic'
                                }}>
                                    {language === 'বাংলা'
                                        ? 'স্বয়ংক্রিয় মোড প্রথম উল্লেখযোগ্য জোড়া নির্বাচন করে'
                                        : '★ indicates significant pairs (p < 0.05). Auto mode selects the first significant pair.'}
                                </p>
                            </div>
                        )}

                        {/* Dimensions - FIXED: Show for all plot types including Heatmap */}
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
                                            min="0"
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

                        {/* Axis Titles - FIXED: Show for appropriate plots */}
                        {plotType !== 'Heatmap' && (
                            <>
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
                            </>
                        )}

                        {/* Tick Sizes - FIXED: Show for all plot types */}
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

                        {/* Variable Labels - FIXED: Proper conditional rendering */}
                        
                        {plotType === 'Heatmap' && (settings.variableLabels || results.variables || []).length > 0 && (
                            <div className="setting-group">
                                <label className="setting-label">{t.variableLabels}</label>
                                {(settings.variableLabels || results.variables || []).map((label, index) => (
                                    <div key={index} className="setting-group category-label-row">
                                        <label className="setting-label" style={{ fontSize: '12px' }}>
                                            {language === 'বাংলা' ? `ভেরিয়েবল ${index + 1}` : `Variable ${index + 1}`}
                                        </label>
                                        <input
                                            type="text"
                                            className="setting-input"
                                            value={label}
                                            onChange={(e) => handleVariableLabelChange(index, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Axis Margins - FIXED: Show for appropriate plots */}
                        {plotType !== 'Heatmap' && (
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
                        )}

                        {/* Y-Axis Range - FIXED: Show for appropriate plots */}
                        {plotType !== 'Heatmap' && (
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
                        )}
                    </div>

                    {/* Grid Settings */}
                    {(plotType === 'Grouped Bar' || plotType === 'Stacked Bar') && (
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
                                                <option value="lightgray">Light Gray</option>
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
                    )}

                    {/* Appearance Settings */}
                    <div className="customization-section">
                        <h4 className="section-title">{t.appearance}</h4>

                        {/* Color Scheme for Stacked Bar */}
                        {plotType === 'Stacked Bar' && (
                            <div className="setting-group">
                                <label className="setting-label">{t.colorScheme}</label>
                                <select
                                    className="setting-select"
                                    value={settings.colorScheme}
                                    onChange={(e) => handleChange('colorScheme', e.target.value)}
                                >
                                    <option value="categorical">Categorical</option>
                                    <option value="pastel">Pastel</option>
                                    <option value="vibrant">Vibrant</option>
                                    <option value="professional">Professional</option>
                                    <option value="ocean">Ocean</option>
                                    <option value="sunset">Sunset</option>
                                    <option value="earth">Earth</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                        )}

                        {/* Custom Colors for Stacked Bar */}
                        {plotType === 'Stacked Bar' && settings.colorScheme === 'custom' && (
                            <div className="setting-group">
                                <label className="setting-label">{t.categoryColors}</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {settings.categoryColors.slice(0, 8).map((color, index) => (
                                        <input
                                            key={index}
                                            type="color"
                                            className="color-picker-compact"
                                            value={color}
                                            onChange={(e) => handleCategoryColorChange(index, e.target.value)}
                                            title={`Color ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Border Settings */}
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

                        {/* Legend Settings */}
                        <div className="setting-group">
                            <label className="setting-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.legendOn}
                                    onChange={(e) => handleChange('legendOn', e.target.checked)}
                                />
                                <span>{language === 'বাংলা' ? 'লেজেন্ড চালু' : 'Legend On'}</span>
                            </label>
                        </div>

                        {settings.legendOn && (
                            <>
                                {/* Legend Position */}
                                <div className="setting-group">
                                    <label className="setting-label">{t.legendPosition}</label>
                                    <select
                                        className="setting-select"
                                        value={settings.legendPosition}
                                        onChange={(e) => handleChange('legendPosition', e.target.value)}
                                    >
                                        {legendPositions.map(position => (
                                            <option key={position.value} value={position.value}>
                                                {position.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Legend Title */}
                                <div className="setting-group">
                                    <label className="setting-label">{t.legendTitle}</label>
                                    <input
                                        type="text"
                                        className="setting-input"
                                        value={settings.legendTitle}
                                        onChange={(e) => handleChange('legendTitle', e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Plot Border for Grouped Bar */}
                        {plotType === 'Grouped Bar' && (
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
                        )}

                        {/* Data Labels for Bar Charts */}
                        {(plotType === 'Grouped Bar' || plotType === 'Stacked Bar') && (
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
                        )}

                        {/* Heatmap Specific Settings */}
                        {plotType === 'Heatmap' && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.cellBorderOn}
                                            onChange={(e) => handleChange('cellBorderOn', e.target.checked)}
                                        />
                                        <span>{t.cellBorderOn}</span>
                                    </label>
                                </div>

                                {settings.cellBorderOn && (
                                    <div className="setting-row">
                                        <div className="setting-group">
                                            <label className="setting-label">{t.cellBorderWidth}</label>
                                            <input
                                                type="number"
                                                className="setting-input"
                                                value={settings.cellBorderWidth}
                                                onChange={(e) => handleChange('cellBorderWidth', parseInt(e.target.value))}
                                                min="0"
                                                max="5"
                                            />
                                        </div>
                                        <div className="setting-group">
                                            <label className="setting-label">{t.cellBorderColor}</label>
                                            <input
                                                type="color"
                                                className="color-picker-compact"
                                                value={settings.cellBorderColor}
                                                onChange={(e) => handleChange('cellBorderColor', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="setting-group">
                                    <label className="setting-label">{t.cellSize}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.cellSize}
                                        onChange={(e) => handleChange('cellSize', parseFloat(e.target.value))}
                                        min="20"
                                        max="120"
                                        step="5"
                                    />
                                    <span className="range-value">{settings.cellSize}</span>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showValues}
                                            onChange={(e) => handleChange('showValues', e.target.checked)}
                                        />
                                        <span>{t.showValues}</span>
                                    </label>
                                </div>

                                {settings.showValues && (
                                    <div className="setting-row">
                                        <div className="setting-group">
                                            <label className="setting-label">{t.valueSize}</label>
                                            <input
                                                type="number"
                                                className="setting-input"
                                                value={settings.valueSize}
                                                onChange={(e) => handleChange('valueSize', parseInt(e.target.value))}
                                                min="8"
                                                max="20"
                                            />
                                        </div>
                                        <div className="setting-group">
                                            <label className="setting-label">{t.valueColor}</label>
                                            <select
                                                className="setting-select"
                                                value={settings.valueColor}
                                                onChange={(e) => handleChange('valueColor', e.target.value)}
                                            >
                                                <option value="white">White</option>
                                                <option value="black">Black</option>
                                                <option value="darkgray">Dark Gray</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Color Scheme for Heatmap */}
                    {plotType === 'Heatmap' && (
                        <div className="customization-section">
                            <h4 className="section-title">{t.colorScheme}</h4>
                            <div className="setting-group">
                                <label className="setting-label">{t.colorScheme}</label>
                                <select
                                    className="setting-select"
                                    value={settings.colorScheme}
                                    onChange={(e) => handleChange('colorScheme', e.target.value)}
                                >
                                    {colorSchemes.map(scheme => (
                                        <option key={scheme.value} value={scheme.value}>
                                            {scheme.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Variable Labels for Grouped Bar */}
                    {plotType === 'Grouped Bar' && settings.variableLabels?.length > 0 && (
                        <div className="customization-section">
                            <h4 className="section-title">{t.variableLabels}</h4>
                            {settings.variableLabels.map((label, index) => (
                                <div key={index} className="setting-group category-label-row">
                                    <label className="setting-label">
                                        {language === 'বাংলা' ? `ভেরিয়েবল ${index + 1}` : `Variable ${index + 1}`}
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            className="setting-input"
                                            value={label}
                                            onChange={(e) => handleVariableLabelChange(index, e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="color"
                                            className="color-picker-compact"
                                            value={settings.categoryColors?.[index] || '#3b82f6'}
                                            onChange={(e) => handleCategoryColorChange(index, e.target.value)}
                                            title="Choose color"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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