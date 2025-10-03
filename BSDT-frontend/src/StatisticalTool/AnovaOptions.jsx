// AnovaOptions.js

import React from 'react';

const AnovaOptions = ({
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
    boxColor,
    setBoxColor,
    medianColor,
    setMedianColor,
    t
}) => {
    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-lg mb-3">{t.tests.anova || 'ANOVA Options'}</h4>

            {/* Image Format */}
            <label className="block mb-2">{t.downloadLabel}</label>
            <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value)}
                className="mb-4 border p-2 rounded w-full"
            >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="pdf">PDF</option>
                <option value="tiff">TIFF</option>
            </select>

            {/* Default Settings */}
            <label className="block mb-2">{t.useDefaultSettings}</label>
            <input
                type="checkbox"
                checked={useDefaultSettings}
                onChange={(e) => setUseDefaultSettings(e.target.checked)}
                className="mb-4"
            />

            {!useDefaultSettings && (
                <div className="bg-white shadow rounded-lg p-6 mt-4 border border-gray-200">
                    <h5 className="text-md font-semibold text-gray-800 mb-4">{t.customSettings}</h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Label Font Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelFontSize}</label>
                            <input
                                type="number"
                                value={labelFontSize}
                                onChange={(e) => setLabelFontSize(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Tick Font Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.tickFontSize}</label>
                            <input
                                type="number"
                                value={tickFontSize}
                                onChange={(e) => setTickFontSize(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Image Quality */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.imageQuality}</label>
                            <input
                                type="number"
                                value={imageQuality}
                                min={1}
                                max={100}
                                onChange={(e) => setImageQuality(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Image Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.imageSize}</label>
                            <input
                                type="text"
                                value={imageSize}
                                onChange={(e) => setImageSize(e.target.value)}
                                placeholder="e.g. 800x600"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Box Fill Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'bn' ? 'বক্সের রঙ' : 'Box Fill Color'}</label>
                            <input
                                type="text"
                                value={boxColor}
                                onChange={(e) => setBoxColor(e.target.value)}
                                placeholder="e.g. steelblue"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Median Line Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'bn' ? 'মিডিয়ান লাইনের রঙ' : 'Median Line Color'}</label>
                            <input
                                type="text"
                                value={medianColor}
                                onChange={(e) => setMedianColor(e.target.value)}
                                placeholder="e.g. red"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnovaOptions;
