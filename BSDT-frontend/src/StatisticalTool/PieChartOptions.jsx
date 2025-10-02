const PieChartOptions = ({
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
    t
}) => {
    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-lg mb-3">
                {language === 'bn' ? 'পাই চার্ট সেটিংস' : 'Pie Chart Settings'}
            </h4>

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
                    <h5 className="text-md font-semibold text-gray-800 mb-4">
                        {t.customSettings}
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Label Font Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.labelFontSize}
                            </label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={labelFontSize}
                                onChange={(e) => setLabelFontSize(Number(e.target.value))}
                            />
                        </div>

                        {/* Tick Font Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.tickFontSize}
                            </label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={tickFontSize}
                                onChange={(e) => setTickFontSize(Number(e.target.value))}
                            />
                        </div>

                        {/* Image Quality */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.imageQuality}
                            </label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.imageSize}
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 900x650"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={imageSize}
                                onChange={(e) => setImageSize(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PieChartOptions;
