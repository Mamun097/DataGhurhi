import { useState, useEffect, useRef } from 'react';
import './KruskalOptions.css';

const KruskalOptions = ({
    isFirstTimeAnalysis,
    setIsFirstTimeAnalysis,
    handleSubmit,
    language,
    setLanguage,
    imageFormat,
    setImageFormat,
    useDefaultSettings,
    setUseDefaultSettings,
    labelFontSize,
    setLabelFontSize,
    tickFontSize,
    setTickFontSize,
    imageQuality,
    setImageQuality,
    imageSize,
    setImageSize,
    colorPalette,
    setColorPalette,
    barWidth,
    setBarWidth,
    boxWidth,
    setBoxWidth,
    violinWidth,
    setViolinWidth,
    showGrid,
    setShowGrid,
    t
}) => {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showResetButton, setShowResetButton] = useState(true);
    const pendingRegenerateRef = useRef(false);

    // Store temporary values
    const [tempValues, setTempValues] = useState({
        imageFormat: imageFormat || 'png',
        labelFontSize: labelFontSize || 86,
        tickFontSize: tickFontSize || 18,
        imageQuality: imageQuality || 100,
        imageSize: imageSize || '1280x720',
        colorPalette: colorPalette || 'bright',
        barWidth: barWidth || 0.4,
        boxWidth: boxWidth || 0.4,
        violinWidth: violinWidth || 0.4,
        showGrid: showGrid !== undefined ? showGrid : true
    });

    // Default values to compare against
    const defaultValues = {
        imageFormat: 'png',
        labelFontSize: 86,
        tickFontSize: 18,
        imageQuality: 100,
        imageSize: '1280x720',
        colorPalette: 'bright',
        barWidth: 0.4,
        boxWidth: 0.4,
        violinWidth: 0.4,
        showGrid: true
    };

    // Color palette descriptions
    const paletteDescriptions = {
        deep: 'Rich, saturated colors - ideal for presentations and reports',
        muted: 'Softer, desaturated colors - easy on the eyes',
        pastel: 'Light, gentle colors - perfect for a subtle look',
        bright: 'Vivid, high saturation colors - makes plots stand out',
        dark: 'Darker color variations - great for dark backgrounds',
        colorblind: 'Optimized for colorblind accessibility',
        Set2: 'Professional qualitative palette - widely used in publications',
        Set3: 'Lighter qualitative palette - good for multiple categories',
        Paired: 'Paired colors palette - excellent for comparative data',
        tab10: 'Tableau 10 - industry standard for business analytics',
        tab20: 'Tableau 20 - extended palette for many categories',
        husl: 'Perceptually uniform colors - balanced brightness',
        hls: 'Evenly spaced hues - good color distinction',
        viridis: 'Sequential gradient - excellent for scientific plots',
        plasma: 'Perceptually uniform - great for heatmaps',
        magma: 'Sequential dark-to-light - professional scientific palette',
        cividis: 'Colorblind-friendly sequential - optimized accessibility',
        rocket: 'Warm sequential palette - dramatic and clear',
        mako: 'Cool sequential palette - modern and clean',
        flare: 'Warm diverging palette - emphasizes extremes'
    };

    // Check if any values have changed from current props
    useEffect(() => {
        const changed =
            String(tempValues.imageFormat) !== String(imageFormat) ||
            String(tempValues.labelFontSize) !== String(labelFontSize) ||
            String(tempValues.tickFontSize) !== String(tickFontSize) ||
            String(tempValues.imageQuality) !== String(imageQuality) ||
            String(tempValues.imageSize) !== String(imageSize) ||
            String(tempValues.colorPalette) !== String(colorPalette) ||
            String(tempValues.barWidth) !== String(barWidth) ||
            String(tempValues.boxWidth) !== String(boxWidth) ||
            String(tempValues.violinWidth) !== String(violinWidth) ||
            Boolean(tempValues.showGrid) !== Boolean(showGrid);

        setHasChanges(changed);
    }, [tempValues, imageFormat, labelFontSize, tickFontSize, imageQuality, imageSize, colorPalette, barWidth, boxWidth, violinWidth, showGrid]);

    // Effect to handle regeneration after props are updated
    useEffect(() => {
        if (pendingRegenerateRef.current && handleSubmit) {
            // Check if all values match what we wanted to set
            const allValuesMatch =
                imageFormat === tempValues.imageFormat &&
                labelFontSize === tempValues.labelFontSize &&
                tickFontSize === tempValues.tickFontSize &&
                imageQuality === tempValues.imageQuality &&
                imageSize === tempValues.imageSize &&
                colorPalette === tempValues.colorPalette &&
                barWidth === tempValues.barWidth &&
                boxWidth === tempValues.boxWidth &&
                violinWidth === tempValues.violinWidth &&
                showGrid === tempValues.showGrid;

            if (allValuesMatch) {
                pendingRegenerateRef.current = false;

                const syntheticEvent = {
                    preventDefault: () => { },
                    stopPropagation: () => { }
                };

                handleSubmit(syntheticEvent);

                setTimeout(() => {
                    setIsRegenerating(false);
                    setIsOverlayOpen(false);
                }, 3000);
            }
        }
    }, [imageFormat, labelFontSize, tickFontSize, imageQuality, imageSize, colorPalette, barWidth, boxWidth, violinWidth, showGrid, tempValues, handleSubmit]);

    // Initialize temp values when overlay opens
    const openOverlay = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const initialValues = {
            imageFormat: imageFormat || defaultValues.imageFormat,
            labelFontSize: labelFontSize || defaultValues.labelFontSize,
            tickFontSize: tickFontSize || defaultValues.tickFontSize,
            imageQuality: imageQuality || defaultValues.imageQuality,
            imageSize: imageSize || defaultValues.imageSize,
            colorPalette: colorPalette || defaultValues.colorPalette,
            barWidth: barWidth || defaultValues.barWidth,
            boxWidth: boxWidth || defaultValues.boxWidth,
            violinWidth: violinWidth || defaultValues.violinWidth,
            showGrid: showGrid !== undefined ? showGrid : defaultValues.showGrid
        };
        setTempValues(initialValues);
        setIsOverlayOpen(true);
        setShowResetButton(true);
    };

    const applySettings = (values) => {
        if (setUseDefaultSettings) setUseDefaultSettings(false);
        if (setImageFormat) setImageFormat(values.imageFormat);
        if (setLabelFontSize) setLabelFontSize(values.labelFontSize);
        if (setTickFontSize) setTickFontSize(values.tickFontSize);
        if (setImageQuality) setImageQuality(values.imageQuality);
        if (setImageSize) setImageSize(values.imageSize);
        if (setColorPalette) setColorPalette(values.colorPalette);
        if (setBarWidth) setBarWidth(values.barWidth);
        if (setBoxWidth) setBoxWidth(values.boxWidth);
        if (setViolinWidth) setViolinWidth(values.violinWidth);
        if (setShowGrid) setShowGrid(values.showGrid);
    };

    const handleSave = () => {
        applySettings(tempValues);
        setIsOverlayOpen(false);
    };

    const handleKeepDefault = () => {
        if (setUseDefaultSettings) setUseDefaultSettings(false);

        const resetValues = {
            imageFormat: defaultValues.imageFormat,
            labelFontSize: defaultValues.labelFontSize,
            tickFontSize: defaultValues.tickFontSize,
            imageQuality: defaultValues.imageQuality,
            imageSize: defaultValues.imageSize,
            colorPalette: defaultValues.colorPalette,
            barWidth: defaultValues.barWidth,
            boxWidth: defaultValues.boxWidth,
            violinWidth: defaultValues.violinWidth,
            showGrid: defaultValues.showGrid
        };

        setTempValues(resetValues);

        if (isFirstTimeAnalysis) {
            applySettings(resetValues);
            setIsOverlayOpen(false);
        } else {
            setShowResetButton(true);
        }
    };

    const handleTempChange = (field, value) => {
        setTempValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRegenerate = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!handleSubmit) {
            console.error('handleSubmit function not provided');
            return;
        }

        setIsRegenerating(true);
        pendingRegenerateRef.current = true;

        applySettings(tempValues);

        const allValuesMatch =
            imageFormat === tempValues.imageFormat &&
            labelFontSize === tempValues.labelFontSize &&
            tickFontSize === tempValues.tickFontSize &&
            imageQuality === tempValues.imageQuality &&
            imageSize === tempValues.imageSize &&
            colorPalette === tempValues.colorPalette &&
            barWidth === tempValues.barWidth &&
            boxWidth === tempValues.boxWidth &&
            violinWidth === tempValues.violinWidth &&
            showGrid === tempValues.showGrid;

        if (allValuesMatch) {
            pendingRegenerateRef.current = false;

            const syntheticEvent = {
                preventDefault: () => { },
                stopPropagation: () => { }
            };

            handleSubmit(syntheticEvent);

            setTimeout(() => {
                setIsRegenerating(false);
                setIsOverlayOpen(false);
            }, 500);
        }
    };

    return (
        <div className="kruskal-options-container">
            <div className="customize-link-wrapper">
                <button
                    type="button"
                    onClick={openOverlay}
                    className="customize-link"
                >
                    {t.customizeSettings || 'Customize Plot Settings'}
                </button>
            </div>

            {isOverlayOpen && (
                <>
                    <div className="overlay-backdrop" onClick={() => setIsOverlayOpen(false)} />
                    <div className="overlay-panel">
                        <div className="overlay-header">
                            <h3 className="overlay-title">
                                {t.customSettings || 'Plot Customization Settings'}
                            </h3>
                            <button
                                type="button"
                                className="overlay-close"
                                onClick={() => setIsOverlayOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="overlay-content">
                            <div className="settings-section">
                                <h4 className="section-title">{t.imageFormatSection || 'Image Format'}</h4>
                                <div className="form-group">
                                    <label className="form-label">{t.downloadLabel || 'Download Format'}</label>
                                    <select
                                        value={tempValues.imageFormat}
                                        onChange={(e) => handleTempChange('imageFormat', e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="png">PNG</option>
                                        <option value="jpg">JPG</option>
                                        <option value="pdf">PDF</option>
                                        <option value="tiff">TIFF</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t.imageQuality || 'Image Quality'} (1-100)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        className="form-input"
                                        value={tempValues.imageQuality}
                                        onChange={(e) => handleTempChange('imageQuality', Number(e.target.value))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t.imageSize || 'Image Size'}</label>
                                    <select
                                        value={tempValues.imageSize}
                                        onChange={(e) => handleTempChange('imageSize', e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="640x480">640x480</option>
                                        <option value="800x600">800x600</option>
                                        <option value="1024x768">1024x768</option>
                                        <option value="1280x720">1280x720</option>
                                        <option value="1920x1080">1920x1080</option>
                                    </select>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h4 className="section-title">{t.typographySection || 'Typography'}</h4>
                                <div className="form-group">
                                    <label className="form-label">{t.labelFontSize || 'Label Font Size'}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={tempValues.labelFontSize}
                                        onChange={(e) => handleTempChange('labelFontSize', Number(e.target.value))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t.tickFontSize || 'Tick Font Size'}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={tempValues.tickFontSize}
                                        onChange={(e) => handleTempChange('tickFontSize', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="settings-section">
                                <h4 className="section-title">{t.visualStylingSection || 'Visual Styling'}</h4>
                                <div className="form-group">
                                    <label className="form-label">{t.palette || 'Color Palette'}</label>
                                    <select
                                        value={tempValues.colorPalette}
                                        onChange={(e) => handleTempChange('colorPalette', e.target.value)}
                                        className="form-select"
                                    >
                                        <optgroup label="Qualitative">
                                            <option value="deep">Deep</option>
                                            <option value="muted">Muted</option>
                                            <option value="pastel">Pastel</option>
                                            <option value="bright">Bright</option>
                                            <option value="dark">Dark</option>
                                            <option value="Set2">Set2</option>
                                            <option value="Set3">Set3</option>
                                            <option value="Paired">Paired</option>
                                            <option value="tab10">Tableau 10</option>
                                            <option value="tab20">Tableau 20</option>
                                            <option value="husl">HUSL</option>
                                            <option value="hls">HLS</option>
                                        </optgroup>
                                        <optgroup label="Sequential">
                                            <option value="viridis">Viridis</option>
                                            <option value="plasma">Plasma</option>
                                            <option value="magma">Magma</option>
                                            <option value="rocket">Rocket</option>
                                            <option value="mako">Mako</option>
                                        </optgroup>
                                        <optgroup label="Diverging">
                                            <option value="flare">Flare</option>
                                        </optgroup>
                                        <optgroup label="Others">
                                            <option value="colorblind">Colorblind</option>
                                            <option value="cividis">Cividis</option>
                                        </optgroup>
                                    </select>
                                    {tempValues.colorPalette && (
                                        <p className="palette-description">
                                            {paletteDescriptions[tempValues.colorPalette]}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t.barWidth || 'Bar Width'} (0.1-1.0)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="1.0"
                                        className="form-input"
                                        value={tempValues.barWidth}
                                        onChange={(e) => handleTempChange('barWidth', Number(e.target.value))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t.boxWidth || 'Box Width'} (0.1-1.0)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="1.0"
                                        className="form-input"
                                        value={tempValues.boxWidth}
                                        onChange={(e) => handleTempChange('boxWidth', Number(e.target.value))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t.violinWidth || 'Violin Width'} (0.1-1.0)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="1.0"
                                        className="form-input"
                                        value={tempValues.violinWidth}
                                        onChange={(e) => handleTempChange('violinWidth', Number(e.target.value))}
                                    />
                                </div>

                                <div className="form-group">
                                    <div className="checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            id="showGrid"
                                            className="form-checkbox"
                                            checked={tempValues.showGrid}
                                            onChange={(e) => handleTempChange('showGrid', e.target.checked)}
                                        />
                                        <label htmlFor="showGrid" className="checkbox-label">
                                            {t.showGrid || 'Show Grid Lines'}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overlay-footer">
                            {showResetButton && (
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleKeepDefault}
                                >
                                    {t.keepDefault || 'Reset to Default'}
                                </button>
                            )}
                            {isFirstTimeAnalysis ? (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleSave}
                                >
                                    {t.save || 'Apply Changes'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleRegenerate}
                                    disabled={isRegenerating}
                                >
                                    <span style={{ position: 'relative', width: '16px', height: '16px', display: 'inline-block', flexShrink: 0 }}>
                                        <span className="spinner" style={{ position: 'absolute', top: 0, left: 0, visibility: isRegenerating ? 'visible' : 'hidden' }}></span>
                                        <svg className="inline-icon" style={{ position: 'absolute', top: 0, left: 0, visibility: isRegenerating ? 'hidden' : 'visible' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </span>
                                    <span>{isRegenerating ? (language === 'bn' ? 'পুনরায় তৈরি করা হচ্ছে...' : 'Regenerating...') : (t.generateAgain || (language === 'bn' ? 'পুনরায় তৈরি করুন' : 'Generate Again'))}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default KruskalOptions;