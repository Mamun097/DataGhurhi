import { useState, useEffect } from 'react';
import './KruskalOptions.css';

const KruskalOptions = ({
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
    t
}) => {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Store temporary values
    const [tempValues, setTempValues] = useState({
        imageFormat: imageFormat || 'png',
        labelFontSize: labelFontSize || 12,
        tickFontSize: tickFontSize || 10,
        imageQuality: imageQuality || 95,
        imageSize: imageSize || '800x600',
        colorPalette: colorPalette || 'deep',
        barWidth: barWidth || 0.8,
        boxWidth: boxWidth || 0.8,
        violinWidth: violinWidth || 0.8
    });

    // Default values to compare against
    const defaultValues = {
        imageFormat: 'png',
        labelFontSize: 12,
        tickFontSize: 10,
        imageQuality: 95,
        imageSize: '800x600',
        colorPalette: 'deep',
        barWidth: 0.8,
        boxWidth: 0.8,
        violinWidth: 0.8
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
        husl: 'Perceptually uniform colors - balanced brightness',
        viridis: 'Sequential gradient palette - excellent for scientific plots'
    };

    // Check if any values have changed from defaults
    useEffect(() => {
        const changed = Object.keys(defaultValues).some(
            key => tempValues[key] !== defaultValues[key]
        );
        setHasChanges(changed);
    }, [tempValues]);

    // Initialize temp values when overlay opens
    const openOverlay = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setTempValues({
            imageFormat: imageFormat || defaultValues.imageFormat,
            labelFontSize: labelFontSize || defaultValues.labelFontSize,
            tickFontSize: tickFontSize || defaultValues.tickFontSize,
            imageQuality: imageQuality || defaultValues.imageQuality,
            imageSize: imageSize || defaultValues.imageSize,
            colorPalette: colorPalette || defaultValues.colorPalette,
            barWidth: barWidth || defaultValues.barWidth,
            boxWidth: boxWidth || defaultValues.boxWidth,
            violinWidth: violinWidth || defaultValues.violinWidth
        });
        setIsOverlayOpen(true);
    };

    const handleSave = () => {
        setImageFormat(tempValues.imageFormat);
        setLabelFontSize(tempValues.labelFontSize);
        setTickFontSize(tempValues.tickFontSize);
        setImageQuality(tempValues.imageQuality);
        setImageSize(tempValues.imageSize);
        setColorPalette(tempValues.colorPalette);
        setBarWidth(tempValues.barWidth);
        setBoxWidth(tempValues.boxWidth);
        setViolinWidth(tempValues.violinWidth);
        //handleSubmit(); // Call the submit handler to save changes
        setIsOverlayOpen(false);
    };

    const handleKeepDefault = () => {
        setImageFormat(defaultValues.imageFormat);
        setLabelFontSize(defaultValues.labelFontSize);
        setTickFontSize(defaultValues.tickFontSize);
        setImageQuality(defaultValues.imageQuality);
        setImageSize(defaultValues.imageSize);
        setColorPalette(defaultValues.colorPalette);
        setBarWidth(defaultValues.barWidth);
        setBoxWidth(defaultValues.boxWidth);
        setViolinWidth(defaultValues.violinWidth);
        setIsOverlayOpen(false);
    };

    const handleTempChange = (field, value) => {
        setTempValues(prev => ({
            ...prev,
            [field]: value
        }));
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

            {/* Overlay */}
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
                            {/* Image Format Section */}
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
                                    <input
                                        type="text"
                                        placeholder="e.g. 800x600"
                                        className="form-input"
                                        value={tempValues.imageSize}
                                        onChange={(e) => handleTempChange('imageSize', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Typography Section */}
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

                            {/* Visual Styling Section */}
                            <div className="settings-section">
                                <h4 className="section-title">{t.visualStylingSection || 'Visual Styling'}</h4>
                                <div className="form-group">
                                    <label className="form-label">{t.palette || 'Color Palette'}</label>
                                    <select
                                        value={tempValues.colorPalette}
                                        onChange={(e) => handleTempChange('colorPalette', e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="deep">Deep</option>
                                        <option value="muted">Muted</option>
                                        <option value="pastel">Pastel</option>
                                        <option value="bright">Bright</option>
                                        <option value="dark">Dark</option>
                                        <option value="colorblind">Colorblind</option>
                                        <option value="Set2">Set2</option>
                                        <option value="Set3">Set3</option>
                                        <option value="husl">HUSL</option>
                                        <option value="viridis">Viridis</option>
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
                            </div>
                        </div>

                        {/* Action Buttons - Only show if changes detected */}
                        {hasChanges && (
                            <div className="overlay-footer">
                                <button 
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleKeepDefault}
                                >
                                    {t.keepDefault || 'Keep Default'}
                                </button>
                                <button 
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleSave}
                                >
                                    {t.save || 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default KruskalOptions;