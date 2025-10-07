import { useState, useEffect, useRef } from "react";
import "./MannWhitneyOptions.css";

const MannWhitneyOptions = ({
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
    t
}) => {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showResetButton, setShowResetButton] = useState(true);
    const pendingRegenerateRef = useRef(false);

    const [tempValues, setTempValues] = useState({
        imageFormat: imageFormat || "png",
        labelFontSize: labelFontSize || 86,
        tickFontSize: tickFontSize || 18,
        imageQuality: imageQuality || 100,
        imageSize: imageSize || "1280x720",
        colorPalette: colorPalette || "bright",
        barWidth: barWidth || 0.4,
        boxWidth: boxWidth || 0.4,
        violinWidth: violinWidth || 0.4
    });

    const defaultValues = {
        imageFormat: "png",
        labelFontSize: 86,
        tickFontSize: 18,
        imageQuality: 100,
        imageSize: "1280x720",
        colorPalette: "bright",
        barWidth: 0.4,
        boxWidth: 0.4,
        violinWidth: 0.4
    };

    const paletteDescriptions = {
        deep: "Rich, saturated colors - ideal for presentations and reports",
        muted: "Softer, desaturated colors - easy on the eyes",
        pastel: "Light, gentle colors - perfect for a subtle look",
        bright: "Vivid, high saturation colors - makes plots stand out",
        dark: "Darker color variations - great for dark backgrounds",
        colorblind: "Optimized for colorblind accessibility",
        Set2: "Professional qualitative palette - widely used in publications",
        Set3: "Lighter qualitative palette - good for multiple categories",
        Paired: "Paired colors palette - excellent for comparative data",
        tab10: "Tableau 10 - industry standard for business analytics",
        tab20: "Tableau 20 - extended palette for many categories",
        husl: "Perceptually uniform colors - balanced brightness",
        hls: "Evenly spaced hues - good color distinction",
        viridis: "Sequential gradient - excellent for scientific plots",
        plasma: "Perceptually uniform - great for heatmaps",
        magma: "Sequential dark-to-light - professional scientific palette",
        cividis: "Colorblind-friendly sequential - optimized accessibility",
        rocket: "Warm sequential palette - dramatic and clear",
        mako: "Cool sequential palette - modern and clean",
        flare: "Warm diverging palette - emphasizes extremes"
    };

    const openOverlay = (e) => {
        e.preventDefault();
        const initialValues = {
            imageFormat: imageFormat || defaultValues.imageFormat,
            labelFontSize: labelFontSize || defaultValues.labelFontSize,
            tickFontSize: tickFontSize || defaultValues.tickFontSize,
            imageQuality: imageQuality || defaultValues.imageQuality,
            imageSize: imageSize || defaultValues.imageSize,
            colorPalette: colorPalette || defaultValues.colorPalette,
            barWidth: barWidth || defaultValues.barWidth,
            boxWidth: boxWidth || defaultValues.boxWidth,
            violinWidth: violinWidth || defaultValues.violinWidth
        };
        setTempValues(initialValues);
        setIsOverlayOpen(true);
    };

    const applySettings = (values) => {
        if (setUseDefaultSettings) setUseDefaultSettings(false);
        setImageFormat(values.imageFormat);
        setLabelFontSize(values.labelFontSize);
        setTickFontSize(values.tickFontSize);
        setImageQuality(values.imageQuality);
        setImageSize(values.imageSize);
        setColorPalette(values.colorPalette);
        setBarWidth(values.barWidth);
        setBoxWidth(values.boxWidth);
        setViolinWidth(values.violinWidth);
    };

    const handleSave = () => {
        applySettings(tempValues);
        setIsOverlayOpen(false);
    };

    const handleKeepDefault = () => {
        if (setUseDefaultSettings) setUseDefaultSettings(false);
        applySettings(defaultValues);
        setTempValues(defaultValues);
        if (isFirstTimeAnalysis) {
            setIsOverlayOpen(false);
        } else {
            setShowResetButton(true);
        }
    };

    const handleTempChange = (field, value) => {
        setTempValues((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRegenerate = (e) => {
        e.preventDefault();
        if (!handleSubmit) return;

        setIsRegenerating(true);
        pendingRegenerateRef.current = true;
        applySettings(tempValues);

        const syntheticEvent = {
            preventDefault: () => {},
            stopPropagation: () => {}
        };

        handleSubmit(syntheticEvent);
        setTimeout(() => {
            setIsRegenerating(false);
            setIsOverlayOpen(false);
        }, 500);
    };

    return (
        <div className="mannwhitney-options-container">
            <div className="customize-link-wrapper">
                <button
                    type="button"
                    onClick={openOverlay}
                    className="customize-link"
                >
                    {t.customizeSettings || "Customize Plot Settings"}
                </button>
            </div>

            {isOverlayOpen && (
                <>
                    <div
                        className="overlay-backdrop"
                        onClick={() => setIsOverlayOpen(false)}
                    />
                    <div className="overlay-panel">
                        <div className="overlay-header">
                            <h3 className="overlay-title">
                                {t.customSettings ||
                                    "Mann-Whitney Plot Customization"}
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
                            {/* Image Settings */}
                            <div className="settings-section">
                                <h4 className="section-title">
                                    {t.imageFormatSection || "Image Settings"}
                                </h4>
                                <div className="form-group">
                                    <label className="form-label">
                                        {t.downloadLabel || "Download Format"}
                                    </label>
                                    <select
                                        value={tempValues.imageFormat}
                                        onChange={(e) =>
                                            handleTempChange(
                                                "imageFormat",
                                                e.target.value
                                            )
                                        }
                                        className="form-select"
                                    >
                                        <option value="png">PNG</option>
                                        <option value="jpg">JPG</option>
                                        <option value="pdf">PDF</option>
                                        <option value="tiff">TIFF</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        {t.imageQuality || "Image Quality (1–100)"}
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        className="form-input"
                                        value={tempValues.imageQuality}
                                        onChange={(e) =>
                                            handleTempChange(
                                                "imageQuality",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        {t.imageSize || "Image Size"}
                                    </label>
                                    <select
                                        value={tempValues.imageSize}
                                        onChange={(e) =>
                                            handleTempChange(
                                                "imageSize",
                                                e.target.value
                                            )
                                        }
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

                            {/* Typography */}
                            <div className="settings-section">
                                <h4 className="section-title">
                                    {t.typographySection || "Typography"}
                                </h4>
                                <div className="form-group">
                                    <label className="form-label">
                                        {t.labelFontSize || "Label Font Size"}
                                    </label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={tempValues.labelFontSize}
                                        onChange={(e) =>
                                            handleTempChange(
                                                "labelFontSize",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        {t.tickFontSize || "Tick Font Size"}
                                    </label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={tempValues.tickFontSize}
                                        onChange={(e) =>
                                            handleTempChange(
                                                "tickFontSize",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Visuals */}
                            <div className="settings-section">
                                <h4 className="section-title">
                                    {t.visualStylingSection || "Visual Styling"}
                                </h4>

                                <div className="form-group">
                                    <label className="form-label">
                                        {t.palette || "Color Palette"}
                                    </label>
                                    <select
                                        value={tempValues.colorPalette}
                                        onChange={(e) =>
                                            handleTempChange(
                                                "colorPalette",
                                                e.target.value
                                            )
                                        }
                                        className="form-select"
                                    >
                                        {Object.keys(paletteDescriptions).map(
                                            (key) => (
                                                <option key={key} value={key}>
                                                    {key}
                                                </option>
                                            )
                                        )}
                                    </select>
                                    {tempValues.colorPalette && (
                                        <p className="palette-description">
                                            {
                                                paletteDescriptions[
                                                    tempValues.colorPalette
                                                ]
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        {t.barWidth || "Bar Width (0.1–1.0)"}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="1.0"
                                        className="form-input"
                                        value={tempValues.barWidth}
                                        onChange={(e) =>
                                            handleTempChange(
                                                "barWidth",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="overlay-footer">
                            {showResetButton && (
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleKeepDefault}
                                >
                                    {t.keepDefault || "Reset to Default"}
                                </button>
                            )}

                            {isFirstTimeAnalysis ? (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleSave}
                                >
                                    {t.save || "Apply Changes"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleRegenerate}
                                    disabled={isRegenerating}
                                >
                                    {isRegenerating ? "Regenerating..." : "Generate Again"}
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MannWhitneyOptions;
