import { useState, useEffect, useRef } from 'react';
import './EDADistributionsOptions.css';

const EDADistributionsOptions = ({
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
    histColor,
    setHistColor,
    kdeColor,
    setKdeColor,
    distColor,
    setDistColor,
    showGrid,
    setShowGrid,
    t
}) => {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showResetButton, setShowResetButton] = useState(true);
    const pendingRegenerateRef = useRef(false);

    // Predefined professional colors
    const predefinedColors = {
        histogram: [
            { name: 'Sky Blue', value: '#3b82f6' },
            { name: 'Indigo', value: '#6366f1' },
            { name: 'Violet', value: '#8b5cf6' },
            { name: 'Purple', value: '#a855f7' },
            { name: 'Teal', value: '#14b8a6' },
            { name: 'Emerald', value: '#10b981' },
        ],
        kde: [
            { name: 'Red', value: '#ef4444' },
            { name: 'Orange', value: '#f97316' },
            { name: 'Amber', value: '#f59e0b' },
            { name: 'Rose', value: '#f43f5e' },
            { name: 'Pink', value: '#ec4899' },
            { name: 'Fuchsia', value: '#d946ef' },
        ],
        distribution: [
            { name: 'Cyan', value: '#06b6d4' },
            { name: 'Blue', value: '#2563eb' },
            { name: 'Slate', value: '#64748b' },
            { name: 'Gray', value: '#6b7280' },
            { name: 'Lime', value: '#84cc16' },
            { name: 'Green', value: '#22c55e' },
        ]
    };

    // Store temporary values
    const [tempValues, setTempValues] = useState({
        imageFormat: imageFormat || 'png',
        labelFontSize: labelFontSize || 86,
        tickFontSize: tickFontSize || 20,
        imageQuality: imageQuality || 300,
        imageSize: imageSize || '1280x720',
        histColor: histColor || '#3b82f6',
        kdeColor: kdeColor || '#ef4444',
        distColor: distColor || '#06b6d4',
        showGrid: showGrid !== undefined ? showGrid : true
    });

    // Default values to compare against
    const defaultValues = {
        imageFormat: 'png',
        labelFontSize: 86,
        tickFontSize: 20,
        imageQuality: 300,
        imageSize: '1280x720',
        histColor: '#3b82f6',
        kdeColor: '#ef4444',
        distColor: '#06b6d4',
        showGrid: true
    };

    // Check if any values have changed from current props
    useEffect(() => {
        const changed =
            String(tempValues.imageFormat) !== String(imageFormat) ||
            String(tempValues.labelFontSize) !== String(labelFontSize) ||
            String(tempValues.tickFontSize) !== String(tickFontSize) ||
            String(tempValues.imageQuality) !== String(imageQuality) ||
            String(tempValues.imageSize) !== String(imageSize) ||
            String(tempValues.histColor) !== String(histColor) ||
            String(tempValues.kdeColor) !== String(kdeColor) ||
            String(tempValues.distColor) !== String(distColor) ||
            Boolean(tempValues.showGrid) !== Boolean(showGrid);

        setHasChanges(changed);
    }, [tempValues, imageFormat, labelFontSize, tickFontSize, imageQuality, imageSize, histColor, kdeColor, distColor, showGrid]);

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
                histColor === tempValues.histColor &&
                kdeColor === tempValues.kdeColor &&
                distColor === tempValues.distColor &&
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
    }, [imageFormat, labelFontSize, tickFontSize, imageQuality, imageSize, histColor, kdeColor, distColor, showGrid, tempValues, handleSubmit]);

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
            histColor: histColor || defaultValues.histColor,
            kdeColor: kdeColor || defaultValues.kdeColor,
            distColor: distColor || defaultValues.distColor,
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
        if (setHistColor) setHistColor(values.histColor);
        if (setKdeColor) setKdeColor(values.kdeColor);
        if (setDistColor) setDistColor(values.distColor);
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
            histColor: defaultValues.histColor,
            kdeColor: defaultValues.kdeColor,
            distColor: defaultValues.distColor,
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
            histColor === tempValues.histColor &&
            kdeColor === tempValues.kdeColor &&
            distColor === tempValues.distColor &&
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

    const ColorPicker = ({ label, value, onChange, colorType }) => {
        const colors = predefinedColors[colorType] || [];
        
        return (
            <div className="form-group">
                <label className="form-label">{label}</label>
                <div className="color-picker-container">
                    <div className="predefined-colors">
                        {colors.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                className={`color-swatch ${value === color.value ? 'selected' : ''}`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => onChange(color.value)}
                                title={color.name}
                            />
                        ))}
                    </div>
                    <div className="custom-color-wrapper">
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="custom-color-input"
                        />
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="color-text-input"
                            placeholder="#000000"
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="eda-options-container">
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
                                {t.customSettings || 'Distribution Plot Settings'}
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
                                    <label className="form-label">{t.imageQuality || 'Image Quality (DPI)'}</label>
                                    <input
                                        type="number"
                                        min={72}
                                        max={600}
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
                                        min={6}
                                        max={120}
                                        className="form-input"
                                        value={tempValues.labelFontSize}
                                        onChange={(e) => handleTempChange('labelFontSize', Number(e.target.value))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t.tickFontSize || 'Tick Font Size'}</label>
                                    <input
                                        type="number"
                                        min={6}
                                        max={120}
                                        className="form-input"
                                        value={tempValues.tickFontSize}
                                        onChange={(e) => handleTempChange('tickFontSize', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="settings-section">
                                <h4 className="section-title">{t.colorSection || 'Color Customization'}</h4>
                                
                                <ColorPicker
                                    label={t.histogramColor || 'Histogram Color'}
                                    value={tempValues.histColor}
                                    onChange={(value) => handleTempChange('histColor', value)}
                                    colorType="histogram"
                                />

                                <ColorPicker
                                    label={t.kdeColor || 'KDE Line Color'}
                                    value={tempValues.kdeColor}
                                    onChange={(value) => handleTempChange('kdeColor', value)}
                                    colorType="kde"
                                />

                                <ColorPicker
                                    label={t.distributionColor || 'Distribution Plot Color'}
                                    value={tempValues.distColor}
                                    onChange={(value) => handleTempChange('distColor', value)}
                                    colorType="distribution"
                                />
                            </div>

                            <div className="settings-section">
                                <h4 className="section-title">{t.gridSection || 'Grid Options'}</h4>
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
                                    <span>{isRegenerating ? (t.regenerating || 'Regenerating...') : (t.generateAgain || 'Generate Again')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default EDADistributionsOptions;