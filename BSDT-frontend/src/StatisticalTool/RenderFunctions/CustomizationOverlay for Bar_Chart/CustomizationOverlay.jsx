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



                            <div className="customization-section">
                                <h4 className="section-title">{language === 'বাংলা' ? 'টিক লেবেল স্থানান্তর' : 'Tick Label Offset'}</h4>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{language === 'বাংলা' ? 'X অক্ষ টিক উল্লম্ব স্থানান্তর' : 'X-Axis Tick Vertical Offset'}</label>
                                        <input
                                            type="number"
                                            className="setting-input"
                                            value={settings.xAxisTickOffset}
                                            onChange={(e) => handleChange('xAxisTickOffset', parseInt(e.target.value))}
                                            min="-50"
                                            max="50"
                                        />
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{language === 'বাংলা' ? 'Y অক্ষ টিক উল্লম্ব স্থানান্তর' : 'Y-Axis Tick Vertical Offset'}</label>
                                        <input
                                            type="number"
                                            className="setting-input"
                                            value={settings.yAxisTickOffset}
                                            onChange={(e) => handleChange('yAxisTickOffset', parseInt(e.target.value))}
                                            min="-50"
                                            max="50"
                                        />
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-group">
                                        <label className="setting-label">{language === 'বাংলা' ? 'X অক্ষ টিক অনুভূমিক স্থানান্তর' : 'X-Axis Tick Horizontal Offset'}</label>
                                        <input
                                            type="number"
                                            className="setting-input"
                                            value={settings.xAxisTickHorizontalOffset}
                                            onChange={(e) => handleChange('xAxisTickHorizontalOffset', parseInt(e.target.value))}
                                            min="-50"
                                            max="50"
                                        />
                                    </div>

                                    <div className="setting-group">
                                        <label className="setting-label">{language === 'বাংলা' ? 'Y অক্ষ টিক অনুভূমিক স্থানান্তর' : 'Y-Axis Tick Horizontal Offset'}</label>
                                        <input
                                            type="number"
                                            className="setting-input"
                                            value={settings.yAxisTickHorizontalOffset}
                                            onChange={(e) => handleChange('yAxisTickHorizontalOffset', parseInt(e.target.value))}
                                            min="-50"
                                            max="50"
                                        />
                                    </div>
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

                    {/* Category Label Orientation */}
                    <div className="customization-section">
                        <h4 className="section-title">{language === 'বাংলা' ? 'ক্যাটাগরি লেবেল অভিযোজন' : 'Category Label Orientation'}</h4>
                        
                        <div className="setting-group">
                            <label className="setting-label">{language === 'বাংলা' ? 'লেবেল অভিযোজন' : 'Label Orientation'}</label>
                            <select
                                className="setting-select"
                                value={settings.categoryLabelOrientation}
                                onChange={(e) => handleChange('categoryLabelOrientation', e.target.value)}
                            >
                                <option value="horizontal">Horizontal</option>
                                <option value="diagonal">Diagonal (45°)</option>
                                <option value="vertical">Vertical (90°)</option>
                            </select>
                        </div>

                        {/* Wrap Controls */}
                        <div className="setting-group">
                            <label className="setting-checkbox-label">
                                <input
                                type="checkbox"
                                checked={settings.categoryLabelWrap}
                                onChange={(e) => handleChange('categoryLabelWrap', e.target.checked)}
                                />
                                <span>{language === 'বাংলা' ? 'লেবেল মোড়ান' : 'Wrap Labels'}</span>
                            </label>
                        </div>

                        {settings.categoryLabelWrap && (
                        <div className="setting-row">
                            <div className="setting-group">
                                <label className="setting-label">{language === 'বাংলা' ? 'সর্বোচ্চ লাইন' : 'Max Lines'}</label>
                                <input
                                    type="number"
                                    className="setting-input"
                                    value={settings.categoryLabelMaxLines}
                                    onChange={(e) => handleChange('categoryLabelMaxLines', parseInt(e.target.value))}
                                    min="1"
                                    max="5"
                                />
                            </div>
                            <div className="setting-group">
                                <label className="setting-label">{language === 'বাংলা' ? 'লাইন উচ্চতা' : 'Line Height'}</label>
                                <input
                                    type="range"
                                    className="setting-range"
                                    value={settings.categoryLabelLineHeight}
                                    onChange={(e) => handleChange('categoryLabelLineHeight', parseFloat(e.target.value))}
                                    min="1"
                                    max="2"
                                    step="0.1"
                                />
                                <span className="range-value">{settings.categoryLabelLineHeight.toFixed(1)}</span>
                            </div>
                        </div>
                        )}

                    </div>

                    {/* Plot Margins */}
                    <div className="customization-section">
                        <h4 className="section-title">{language === 'বাংলা' ? 'প্লট মার্জিন' : 'Plot Margins'}</h4>
                        
                        <div className="setting-row">
                            <div className="setting-group">
                                <label className="setting-label">{language === 'বাংলা' ? 'উপরের মার্জিন' : 'Top Margin'}</label>
                                <input
                                    type="number"
                                    className="setting-input"
                                    value={settings.plotMarginTop}
                                    onChange={(e) => handleChange('plotMarginTop', parseInt(e.target.value))}
                                    min="0"
                                    max="200"
                                />
                            </div>
                            <div className="setting-group">
                                <label className="setting-label">{language === 'বাংলা' ? 'ডান মার্জিন' : 'Right Margin'}</label>
                                <input
                                    type="number"
                                    className="setting-input"
                                    value={settings.plotMarginRight}
                                    onChange={(e) => handleChange('plotMarginRight', parseInt(e.target.value))}
                                    min="0"
                                    max="200"
                                />
                            </div>
                        </div>
                        
                        <div className="setting-row">
                            <div className="setting-group">
                                <label className="setting-label">{language === 'বাংলা' ? 'নিচের মার্জিন' : 'Bottom Margin'}</label>
                                <input
                                    type="number"
                                    className="setting-input"
                                    value={settings.plotMarginBottom}
                                    onChange={(e) => handleChange('plotMarginBottom', parseInt(e.target.value))}
                                    min="0"
                                    max="200"
                                />
                            </div>
                            <div className="setting-group">
                                <label className="setting-label">{language === 'বাংলা' ? 'বাম মার্জিন' : 'Left Margin'}</label>
                                <input
                                    type="number"
                                    className="setting-input"
                                    value={settings.plotMarginLeft}
                                    onChange={(e) => handleChange('plotMarginLeft', parseInt(e.target.value))}
                                    min="0"
                                    max="200"
                                />
                            </div>
                        </div>
                    </div>                    


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
                        {(plotType === 'Count' || plotType === 'Mean' || plotType === 'Rank' || plotType === 'Histogram' || plotType === 'Vertical' || plotType === 'Horizontal') && ( 
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
                        {(plotType === 'Count' || plotType === 'Mean' || plotType === 'Histogram' || plotType === 'Box' || plotType === 'Vertical' || plotType === 'Horizontal') && (
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