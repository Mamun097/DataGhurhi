const LinearRegressionOptions = ({
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
    legendFontSize,
    setLegendFontSize,
    lineColor,
    setLineColor,
    lineStyle,
    setLineStyle,
    lineWidth,
    setLineWidth,
    dotColor,
    setDotColor,
    dotWidth,
    setDotWidth,
    t
}) => {
    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-lg mb-3">{t.linearTitle || t.tests.linear_regression}</h4>

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
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={labelFontSize}
                                onChange={(e) => setLabelFontSize(Number(e.target.value))}
                            />
                        </div>

                        {/* Tick Font Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.tickFontSize}</label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={tickFontSize}
                                onChange={(e) => setTickFontSize(Number(e.target.value))}
                            />
                        </div>

                        {/* Image Quality */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.imageQuality}</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={imageQuality}
                                onChange={(e) => setImageQuality(Number(e.target.value))}
                            />
                        </div>

                        {/* Image Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.imageSize}</label>
                            <input
                                type="text"
                                placeholder="e.g. 800x600"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={imageSize}
                                onChange={(e) => setImageSize(e.target.value)}
                            />
                        </div>

                        {/* Color Palette */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.palette}</label>
                            <input
                                type="text"
                                placeholder="e.g. deep, Set2"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={colorPalette}
                                onChange={(e) => setColorPalette(e.target.value)}
                            />
                        </div>

                        {/* Line Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'bn' ? 'লাইন রঙ' : 'Line Color'}</label>
                            <input
                                type="text"
                                value={lineColor}
                                onChange={(e) => setLineColor(e.target.value)}
                                placeholder="e.g. red"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Line Style */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'bn' ? 'লাইন স্টাইল' : 'Line Style'}</label>
                            <select
                                value={lineStyle}
                                onChange={(e) => setLineStyle(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="solid">{language === 'bn' ? 'সলিড' : 'Solid'}</option>
                                <option value="dashed">{language === 'bn' ? 'ড্যাশড' : 'Dashed'}</option>
                                <option value="dotted">{language === 'bn' ? 'ডটেড' : 'Dotted'}</option>
                            </select>
                        </div>

                        {/* Line Width */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'bn' ? 'লাইন প্রস্থ' : 'Line Width'}</label>
                            <input
                                type="number"
                                value={lineWidth}
                                onChange={(e) => setLineWidth(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Dot Width */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'bn' ? 'ডট সাইজ' : 'Dot Size'}</label>
                            <input
                                type="number"
                                value={dotWidth}
                                onChange={(e) => setDotWidth(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Dot Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{language === 'bn' ? 'ডট রঙ' : 'Dot Color'}</label>
                            <input
                                type="text"
                                value={dotColor}
                                onChange={(e) => setDotColor(e.target.value)}
                                placeholder="e.g. blue"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinearRegressionOptions;
