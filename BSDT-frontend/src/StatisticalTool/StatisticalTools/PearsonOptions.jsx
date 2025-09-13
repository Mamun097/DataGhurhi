

const PearsonOptions = ({
    language,
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
    t
}) => {
    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-lg mb-3">{t.tests.pearson}</h4>

            {/* Image Format Dropdown */}
            <label className="block mb-2">{language === 'bn' ? 'ডাউনলোড ফরম্যাট নির্বাচন করুন' : 'Choose Download Format'}</label>
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

            {/* Use Default Toggle */}
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
                                className="w-full border rounded-md px-3 py-2"
                                value={labelFontSize}
                                onChange={(e) => setLabelFontSize(Number(e.target.value))}
                            />
                        </div>

                        {/* Tick Font Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.tickFontSize}</label>
                            <input
                                type="number"
                                className="w-full border rounded-md px-3 py-2"
                                value={tickFontSize}
                                onChange={(e) => setTickFontSize(Number(e.target.value))}
                            />
                        </div>

                        {/* Image Quality */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.imageQuality}</label>
                            <input
                                type="number"
                                className="w-full border rounded-md px-3 py-2"
                                value={imageQuality}
                                onChange={(e) => setImageQuality(Number(e.target.value))}
                            />
                        </div>

                        {/* Image Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.imageSize}</label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2"
                                value={imageSize}
                                onChange={(e) => setImageSize(e.target.value)}
                            />
                        </div>

                        {/* Color Palette */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.palette}</label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2"
                                value={colorPalette}
                                onChange={(e) => setColorPalette(e.target.value)}
                            />
                        </div>

                        {/* Heatmap Line Width (Bar Width) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.barWidth}</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="1.0"
                                className="w-full border rounded-md px-3 py-2"
                                value={barWidth}
                                onChange={(e) => setBarWidth(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PearsonOptions;
