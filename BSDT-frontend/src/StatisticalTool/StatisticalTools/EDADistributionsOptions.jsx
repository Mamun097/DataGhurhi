import React from 'react';

const EDADistributionsOptions = ({
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
    setKDEColor,
    distColor,
    setDistColor,
    t
}) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="font-medium block mb-1">
                    {language === 'bn' ? 'ভাষা নির্বাচন করুন:' : 'Select language:'}
                </label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                >
                    <option value="en">English</option>
                    <option value="bn">বাংলা</option>
                </select>
            </div>

            <div>
                <label className="font-medium block mb-1">
                    {t.imageFormat || 'Image Format'}
                </label>
                <select
                    value={imageFormat}
                    onChange={(e) => setImageFormat(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                >
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                    <option value="pdf">PDF</option>
                    <option value="tiff">TIFF</option>
                </select>
            </div>

            <div>
                <label className="font-medium block mb-1">
                    {language === 'bn' ? 'ডিফল্ট সেটিংস ব্যবহার করুন?' : 'Use default settings?'}
                </label>
                <input
                    type="checkbox"
                    checked={useDefaultSettings}
                    onChange={(e) => setUseDefaultSettings(e.target.checked)}
                    className="mr-2"
                />
                {language === 'bn' ? 'হ্যাঁ' : 'Yes'}
            </div>

            {!useDefaultSettings && (
                <>
                    <div>
                        <label className="font-medium block mb-1">
                            {t.labelFontSize || 'Label Font Size'}
                        </label>
                        <input
                            type="number"
                            value={labelFontSize}
                            onChange={(e) => setLabelFontSize(Number(e.target.value))}
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="font-medium block mb-1">
                            {t.tickFontSize || 'Tick Font Size'}
                        </label>
                        <input
                            type="number"
                            value={tickFontSize}
                            onChange={(e) => setTickFontSize(Number(e.target.value))}
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="font-medium block mb-1">
                            {t.imageQuality || 'Image Quality (DPI)'}
                        </label>
                        <input
                            type="number"
                            value={imageQuality}
                            onChange={(e) => setImageQuality(Number(e.target.value))}
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="font-medium block mb-1">
                            {t.imageSize || 'Image Size (Width x Height in px)'}
                        </label>
                        <input
                            type="text"
                            value={imageSize}
                            onChange={(e) => setImageSize(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                            placeholder="800x600"
                        />
                    </div>
                    <div>
                        <label className="font-medium block mb-1">{t.histogramColor || 'Histogram Color'}</label>
                        <input
                            type="text"
                            value={histColor}
                            onChange={(e) => setHistColor(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                            placeholder="e.g., blue"
                        />
                    </div>
                    <div>
                        <label className="font-medium block mb-1">{t.kdeColor || 'KDE Color'}</label>
                        <input
                            type="text"
                            value={kdeColor}
                            onChange={(e) => setKDEColor(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                            placeholder="e.g., green"
                        />
                    </div>
                    <div>
                        <label className="font-medium block mb-1">{t.distributionColor || 'Distribution Plot Color'}</label>
                        <input
                            type="text"
                            value={distColor}
                            onChange={(e) => setDistColor(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                            placeholder="e.g., purple"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default EDADistributionsOptions;
