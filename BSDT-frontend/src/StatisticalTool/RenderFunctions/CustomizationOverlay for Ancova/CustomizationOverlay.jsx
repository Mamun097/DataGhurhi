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
        // ANCOVA specific settings
        scatterSize: language === 'বাংলা' ? 'স্ক্যাটার বিন্দুর আকার' : 'Scatter Point Size',
        lineWidth: language === 'বাংলা' ? 'লাইনের প্রস্থ' : 'Line Width',
        showRegressionLines: language === 'বাংলা' ? 'রিগ্রেশন লাইন দেখান' : 'Show Regression Lines',
        showScatterPoints: language === 'বাংলা' ? 'স্ক্যাটার বিন্দু দেখান' : 'Show Scatter Points',
        legendPosition: language === 'বাংলা' ? 'লিজেন্ড অবস্থান' : 'Legend Position',
        // Mann-Whitney specific settings
        showMeanLine: language === 'বাংলা' ? 'গড় লাইন দেখান' : 'Show Mean Line',
        showMedianLine: language === 'বাংলা' ? 'মাধ্যমিক লাইন দেখান' : 'Show Median Line',
        rankBarWidth: language === 'বাংলা' ? 'র‍্যাঙ্ক বার প্রস্থ' : 'Rank Bar Width',
        showDataPoints: language === 'বাংলা' ? 'ডেটা পয়েন্ট দেখান' : 'Show Data Points',
        // Wilcoxon specific settings
        histogramBins: language === 'বাংলা' ? 'হিস্টোগ্রাম বিন সংখ্যা' : 'Histogram Bins',
        scatterOpacity: language === 'বাংলা' ? 'স্ক্যাটার স্বচ্ছতা' : 'Scatter Opacity',
        qqLineColor: language === 'বাংলা' ? 'কিউ-কিউ লাইন রং' : 'Q-Q Line Color',
        referenceLineColor: language === 'বাংলা' ? 'রেফারেন্স লাইন রং' : 'Reference Line Color',
        // EDA Distribution specific settings - REMOVED DUPLICATE histogramBins
        histogramColor: language === 'বাংলা' ? 'হিস্টোগ্রাম রং' : 'Histogram Color',
        kdeColor: language === 'বাংলা' ? 'কেডিই রং' : 'KDE Color',
        distributionColor: language === 'বাংলা' ? 'বন্টন রং' : 'Distribution Color',
        kdeLineWidth: language === 'বাংলা' ? 'কেডিই লাইন প্রস্থ' : 'KDE Line Width',
        histogramOpacity: language === 'বাংলা' ? 'হিস্টোগ্রাম স্বচ্ছতা' : 'Histogram Opacity',
        kdeOpacity: language === 'বাংলা' ? 'কেডিই স্বচ্ছতা' : 'KDE Opacity',
        showKDE: language === 'বাংলা' ? 'কেডিই দেখান' : 'Show KDE',
        showHistogram: language === 'বাংলা' ? 'হিস্টোগ্রাম দেখান' : 'Show Histogram',
        binWidth: language === 'বাংলা' ? 'বিন প্রস্থ' : 'Bin Width',     
        swarmPointSize: language === 'বাংলা' ? 'সোয়ার্ম বিন্দুর আকার' : 'Swarm Point Size',
        swarmOpacity: language === 'বাংলা' ? 'সোয়ার্ম স্বচ্ছতা' : 'Swarm Opacity',
        swarmColor: language === 'বাংলা' ? 'সোয়ার্ম রং' : 'Swarm Color',
        orientation: language === 'বাংলা' ? 'অভিযোজন' : 'Orientation',
        vertical: language === 'বাংলা' ? 'উল্লম্ব' : 'Vertical',
        horizontal: language === 'বাংলা' ? 'অনুভূমিক' : 'Horizontal',
        showPercentage: language === 'বাংলা' ? 'শতাংশ দেখান' : 'Show Percentage',
        barSpacing: language === 'বাংলা' ? 'বার ব্যবধান' : 'Bar Spacing',
        barRadius: language === 'বাংলা' ? 'বার বক্রতা' : 'Bar Radius',
        barHeight: language === 'বাংলা' ? 'বার উচ্চতা' : 'Bar Height',
        showCount: language === 'বাংলা' ? 'গণনা দেখান' : 'Show Count',
        innerRadius: language === 'বাংলা' ? 'ভিতরের ব্যাসার্ধ' : 'Inner Radius',
        outerRadius: language === 'বাংলা' ? 'বাইরের ব্যাসার্ধ' : 'Outer Radius',
        pieWidth: language === 'বাংলা' ? 'পাই প্রস্থ' : 'Pie Width',        
        legendOn: language === 'বাংলা' ? 'লিজেন্ড চালু' : 'Legend On',
        donutChart: language === 'বাংলা' ? 'ডোনাট চার্ট' : 'Donut Chart',
        startAngle: language === 'বাংলা' ? 'শুরু কোণ' : 'Start Angle',
        endAngle: language === 'বাংলা' ? 'শেষ কোণ' : 'End Angle',
        minAngle: language === 'বাংলা' ? 'ন্যূনতম কোণ' : 'Minimum Angle',
        labelLine: language === 'বাংলা' ? 'লেবেল লাইন' : 'Label Line',
        // Kolmogorov-Smirnov specific settings
        ecdfColor: language === 'বাংলা' ? 'ইসিডিএফ রং' : 'ECDF Color',
        cdfColor: language === 'বাংলা' ? 'সিডিএফ রং' : 'CDF Color',
        lineStyle: language === 'বাংলা' ? 'লাইন স্টাইল' : 'Line Style',
        lineWidth: language === 'বাংলা' ? 'লাইন প্রস্থ' : 'Line Width',
        showECDF: language === 'বাংলা' ? 'ইসিডিএফ দেখান' : 'Show ECDF',
        showCDF: language === 'বাংলা' ? 'সিডিএফ দেখান' : 'Show CDF',
        pointSize: language === 'বাংলা' ? 'বিন্দুর আকার' : 'Point Size',
        showDistributionParameters: language === 'বাংলা' ? 'বন্টন প্যারামিটার দেখান' : 'Show Distribution Parameters',
        xAxisTitleOffset: language === 'বাংলা' ? 'X অক্ষ শিরোনাম অনুভূমিক স্থানান্তর' : 'X-Axis Title Horizontal Offset',
        yAxisTitleOffset: language === 'বাংলা' ? 'Y অক্ষ শিরোনাম উল্লম্ব স্থানান্তর' : 'Y-Axis Title Vertical Offset',        
        scatterColor: language === 'বাংলা' ? 'স্ক্যাটার বিন্দুর রং' : 'Scatter Point Color',                
        referenceLineWidth: language === 'বাংলা' ? 'রেফারেন্স লাইন প্রস্থ' : 'Reference Line Width',
        referenceLineStyle: language === 'বাংলা' ? 'রেফারেন্স লাইন স্টাইল' : 'Reference Line Style',
        showReferenceLine: language === 'বাংলা' ? 'রেফারেন্স লাইন দেখান' : 'Show Reference Line',        
        showCriticalValues: language === 'বাংলা' ? 'ক্রিটিক্যাল মান দেখান' : 'Show Critical Values',
        // F/Z/T Distribution Plot specific settings
        distributionCurveColor: language === 'বাংলা' ? 'বন্টন বক্ররেখার রং' : 'Distribution Curve Color',
        distributionLineColor: language === 'বাংলা' ? 'পর্যবেক্ষিত মানের রং' : 'Observed Value Line Color',
        distributionLineWidth: language === 'বাংলা' ? 'লাইন প্রস্থ' : 'Line Width',
        distributionCurveWidth: language === 'বাংলা' ? 'বক্ররেখার প্রস্থ' : 'Curve Width',
        distributionFill: language === 'বাংলা' ? 'বক্ররেখা ভরাট' : 'Fill Distribution',
        distributionFillColor: language === 'বাংলা' ? 'ভরাট রং' : 'Fill Color'
    };

    const gridStyles = [
        { value: '3 3', label: 'Dotted' },
        { value: '10 5', label: 'Dashed' },
        { value: '1 0', label: 'Solid' },
        { value: '15 5 5 5', label: 'Dash-Dot' },
        { value: '20 10', label: 'Long Dash' },
    ];

    // ADDED: Missing lineStyles array
    const lineStyles = [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' },
    ];

    const dimensions = [
        { value: '800x600', label: '800 × 600' },
        { value: '1024x768', label: '1024 × 768' },
        { value: '1280x720', label: '1280 × 720' },
        { value: '1440x1080', label: '1440 × 1080' },
        { value: '1920x1080', label: '1920 × 1080' },
    ];

    const legendPositions = [
        { value: 'right', label: 'Right' },
        { value: 'bottom', label: 'Bottom' },
        { value: 'top', label: 'Top' },
        { value: 'left', label: 'Left' },
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
                    {plotType !== 'Pie' && (
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
                    )}

                    {/* Grid Settings */}
                    {plotType !== 'Pie' && (
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
                    )}

                    {/* Appearance Settings */}
                    <div className="customization-section">
                        <h4 className="section-title">{t.appearance}</h4>

                        <div className="setting-group"> {/* Border On */}
                            <label className="setting-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.borderOn}
                                    onChange={(e) => handleChange('borderOn', e.target.checked)}
                                />
                                <span>{t.borderOn}</span>
                            </label>
                        </div>

                        <div className="setting-group"> {/* Plot Border On */}
                            <label className="setting-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.plotBorderOn}
                                    onChange={(e) => handleChange('plotBorderOn', e.target.checked)}
                                />
                                <span>{t.plotBorderOn}</span>
                            </label>
                        </div>

                        {/* Bar Border On */}
                        {(plotType === 'Count' || plotType === 'Mean' || plotType === 'Rank' || plotType === 'Histogram') && ( 
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

                        {/* Data Labels On */}
                        {(plotType === 'Count' || plotType === 'Mean' || plotType === 'Histogram' || plotType === 'Box') && (
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

                        {/* Error Bars On */}
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

                        {/* Element Width Control */}                                              
                        {!isKolmogorovPlot && !isAncovaPlot && plotType !== 'QQ' && plotType !== 'KDE' && plotType !== 'FDistribution' && plotType !== 'ZDistribution' && plotType !== 'TDistribution' && plotType !== 'Swarm' && plotType !== 'Pie' && (
                            <div className="setting-group">
                                <label className="setting-label">
                                    {plotType === 'Count' || plotType === 'Mean' || plotType === 'Histogram' || plotType === 'Vertical' || plotType === 'Horizontal'  || plotType === 'HistogramKDE'? t.barWidth :
                                    plotType === 'Box' ? t.boxWidth : 
                                    plotType === 'Rank' ? t.rankBarWidth : t.violinWidth}
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
                                <span className="range-value">{settings.elementWidth.toFixed(2)}</span> {/* ERROR HERE */}
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
                                        <span>{t.showECDF}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showCDF}
                                            onChange={(e) => handleChange('showCDF', e.target.checked)}
                                        />
                                        <span>{t.showCDF}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showDistributionParameters}
                                            onChange={(e) => handleChange('showDistributionParameters', e.target.checked)}
                                        />
                                        <span>{t.showDistributionParameters}</span>
                                    </label>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{t.ecdfColor}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.ecdfColor}
                                            onChange={(e) => handleChange('ecdfColor', e.target.value)}
                                        />
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{t.cdfColor}</label>
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
                                        <label className="setting-label">{t.lineStyle}</label>
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
                                        <label className="setting-label">{t.lineWidth}</label>
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
                                    <label className="setting-label">{t.pointSize}</label>
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
                                        <span>{t.showDataPoints}</span>
                                    </label>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{t.swarmPointSize}</label>
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
                                        <label className="setting-label">{t.swarmOpacity}</label>
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
                                    <label className="setting-label">{t.swarmColor}</label>
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={settings.swarmColor}
                                        onChange={(e) => handleChange('swarmColor', e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Bar Chart Specific Settings */}
                        {(plotType === 'Vertical' || plotType === 'Horizontal') && (
                            <>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showPercentage}
                                            onChange={(e) => handleChange('showPercentage', e.target.checked)}
                                        />
                                        <span>{t.showPercentage}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{t.barRadius}</label>
                                    <input
                                        type="range"
                                        className="setting-range"
                                        value={settings.barRadius}
                                        onChange={(e) => handleChange('barRadius', parseInt(e.target.value))}
                                        min="0"
                                        max="20"
                                        step="1"
                                    />
                                        <span className="range-value">{settings.barRadius}</span>
                                </div>

                            </>
                        )}

                        {plotType === 'Pie' && (
                            <>
                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.legendOn}
                                            onChange={(e) => handleChange('legendOn', e.target.checked)}
                                        />
                                        <span>{t.legendOn}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showPercentage}
                                            onChange={(e) => handleChange('showPercentage', e.target.checked)}
                                        />
                                        <span>{t.showPercentage}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showCount}
                                            onChange={(e) => handleChange('showCount', e.target.checked)}
                                        />
                                        <span>{t.showCount}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.innerRadius > 0}
                                            onChange={(e) => handleChange('innerRadius', e.target.checked ? 40 : 0)}
                                        />
                                        <span>{t.donutChart}</span>
                                    </label>
                                </div>

                                {settings.legendOn && (
                                    <div className="setting-group">
                                        <label className="setting-label">{t.legendPosition}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.legendPosition}
                                            onChange={(e) => handleChange('legendPosition', e.target.value)}
                                        >
                                            {legendPositions.map(pos => (
                                                <option key={pos.value} value={pos.value}>{pos.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{t.innerRadius}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={settings.innerRadius}
                                            onChange={(e) => handleChange('innerRadius', parseInt(e.target.value))}
                                            min="0"
                                            max="80"
                                            step="5"
                                        />
                                        <span className="range-value">{settings.innerRadius}%</span>
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{t.outerRadius}</label>
                                        <input
                                            type="range"
                                            className="setting-range"
                                            value={parseInt(settings.outerRadius)}
                                            onChange={(e) => handleChange('outerRadius', `${e.target.value}%`)}
                                            min="50"
                                            max="100"
                                            step="5"
                                        />
                                        <span className="range-value">{settings.outerRadius}</span>
                                    </div>
                                </div>


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
                                        <span>{t.showScatterPoints}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showReferenceLine}
                                            onChange={(e) => handleChange('showReferenceLine', e.target.checked)}
                                        />
                                        <span>{t.showReferenceLine}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showCriticalValues}
                                            onChange={(e) => handleChange('showCriticalValues', e.target.checked)}
                                        />
                                        <span>{t.showCriticalValues}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                        type="checkbox"
                                        checked={settings.legendOn}
                                        onChange={(e) => handleChange('legendOn', e.target.checked)}
                                        />
                                        <span>{language === 'বাংলা' ? 'লেজেন্ড দেখান' : 'Show Legend'}</span>
                                    </label>
                                </div>

                                {settings.legendOn && (
                                    <div className="setting-group">
                                        <label className="setting-label">{language === 'বাংলা' ? 'লেজেন্ড অবস্থান' : 'Legend Position'}</label>
                                        <select
                                        className="setting-select"
                                        value={settings.legendPosition}
                                        onChange={(e) => handleChange('legendPosition', e.target.value)}
                                        >
                                        <option value="top">Top</option>
                                        <option value="bottom">Bottom</option>
                                        </select>
                                    </div>
                                )}
                                

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{t.scatterSize}</label>
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
                                        <label className="setting-label">{t.scatterOpacity}</label>
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
                                        <label className="setting-label">{t.scatterColor}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.scatterColor}
                                            onChange={(e) => handleChange('scatterColor', e.target.value)}
                                        />
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{t.referenceLineColor}</label>
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
                                        <label className="setting-label">{t.referenceLineWidth}</label>
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
                                        <label className="setting-label">{t.referenceLineStyle}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.referenceLineStyle}
                                            onChange={(e) => handleChange('referenceLineStyle', e.target.value)}
                                        >
                                            <option value="solid">Solid</option>
                                            <option value="dashed">Dashed</option>
                                            <option value="dotted">Dotted</option>
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
                                        <label className="setting-label">{t.distributionCurveWidth}</label>
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
                                        <label className="setting-label">{t.distributionCurveColor}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.distributionCurveColor}
                                            onChange={(e) => handleChange('distributionCurveColor', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Only show fill options for FDistribution */}
                                {plotType === 'FDistribution' && (
                                    <>
                                        <div className="setting-group">
                                            <label className="setting-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.distributionFill}
                                                    onChange={(e) => handleChange('distributionFill', e.target.checked)}
                                                />
                                                <span>{t.distributionFill}</span>
                                            </label>
                                        </div>

                                        {settings.distributionFill && (
                                            <div className="setting-group">
                                                <label className="setting-label">{t.distributionFillColor}</label>
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
                                {/* Common Scatter Settings */}
                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showScatterPoints}
                                            onChange={(e) => handleChange('showScatterPoints', e.target.checked)}
                                        />
                                        <span>{t.showScatterPoints}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showRegressionLines}
                                            onChange={(e) => handleChange('showRegressionLines', e.target.checked)}
                                        />
                                        <span>{t.showRegressionLines}</span>
                                    </label>
                                </div>



                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showCriticalValues}
                                            onChange={(e) => handleChange('showCriticalValues', e.target.checked)}
                                        />
                                        <span>{t.showCriticalValues}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.legendOn}
                                            onChange={(e) => handleChange('legendOn', e.target.checked)}
                                        />
                                        <span>{language === 'বাংলা' ? 'লেজেন্ড দেখান' : 'Show Legend'}</span>
                                    </label>
                                </div>    

                                {settings.legendOn && (
                                    <div className="setting-group">
                                        <label className="setting-label">{language === 'বাংলা' ? 'লেজেন্ড অবস্থান' : 'Legend Position'}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.legendPosition}
                                            onChange={(e) => handleChange('legendPosition', e.target.value)}
                                        >
                                            <option value="top">Top</option>
                                            <option value="bottom">Bottom</option>
                                        </select>
                                    </div>
                                )}

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{t.scatterSize}</label>
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
                                        <label className="setting-label">{t.scatterOpacity}</label>
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
                                        <span>{t.showScatterPoints}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showReferenceLine}
                                            onChange={(e) => handleChange('showReferenceLine', e.target.checked)}
                                        />
                                        <span>{t.showReferenceLine}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.showCriticalValues}
                                            onChange={(e) => handleChange('showCriticalValues', e.target.checked)}
                                        />
                                        <span>{t.showCriticalValues}</span>
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={settings.legendOn}
                                            onChange={(e) => handleChange('legendOn', e.target.checked)}
                                        />
                                        <span>{language === 'বাংলা' ? 'লেজেন্ড দেখান' : 'Show Legend'}</span>
                                    </label>
                                </div>    

                                {settings.legendOn && (
                                    <div className="setting-group">
                                        <label className="setting-label">{language === 'বাংলা' ? 'লেজেন্ড অবস্থান' : 'Legend Position'}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.legendPosition}
                                            onChange={(e) => handleChange('legendPosition', e.target.value)}
                                        >
                                            <option value="top">Top</option>
                                            <option value="bottom">Bottom</option>
                                        </select>
                                    </div>
                                )}

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{t.scatterSize}</label>
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
                                        <label className="setting-label">{t.scatterOpacity}</label>
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
                                        <label className="setting-label">{t.referenceLineColor}</label>
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
                                        <label className="setting-label">{t.referenceLineWidth}</label>
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
                                        <label className="setting-label">{t.referenceLineStyle}</label>
                                        <select
                                            className="setting-select"
                                            value={settings.referenceLineStyle}
                                            onChange={(e) => handleChange('referenceLineStyle', e.target.value)}
                                        >
                                            <option value="solid">Solid</option>
                                            <option value="dashed">Dashed</option>
                                            <option value="dotted">Dotted</option>
                                        </select>
                                    </div>

                                </div>
                            </>
                        )}                                    

                        {plotType === 'Histogram' && (
                            <>

                                <div className="setting-group">
                                    <label className="setting-label">{t.histogramColor}</label>
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={settings.histogramColor}
                                        onChange={(e) => handleChange('histogramColor', e.target.value)}
                                    />
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{t.histogramOpacity}</label>
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
                                    <label className="setting-label">{t.kdeColor}</label>
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={settings.kdeColor}
                                        onChange={(e) => handleChange('kdeColor', e.target.value)}
                                    />
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">{t.kdeOpacity}</label>
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
                                    <label className="setting-label">{t.kdeLineWidth}</label>
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
                                        <label className="setting-label">{t.histogramBins}</label>
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
                                        <label className="setting-label">{t.histogramColor}</label>
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={settings.histogramColor}
                                            onChange={(e) => handleChange('histogramColor', e.target.value)}
                                        />
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{t.kdeColor}</label>
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
                                        <label className="setting-label">{t.histogramOpacity}</label>
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
                                        <label className="setting-label">{t.kdeOpacity}</label>
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
                                    <label className="setting-label">{t.kdeLineWidth}</label>
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