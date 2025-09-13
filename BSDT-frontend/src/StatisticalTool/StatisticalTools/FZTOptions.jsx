import React from 'react';

const FZTOptions = ({
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
    fCurveColor,
    setFCurveColor,
    fLineColor,
    setFLineColor,
    zCurveColor,
    setZCurveColor,
    zLineColor,
    setZLineColor,
    tCurveColor,
    setTCurveColor,
    tLineColor,
    setTLineColor,
    hist1Color,
    setHist1Color,
    hist2Color,
    setHist2Color,
    lineStyle,
    setLineStyle,
    t,
    language,
}) => {
    return (
        <div className="space-y-4 mt-6">
            <div className="flex items-center">
                <input
                    id="defaultFZT"
                    type="checkbox"
                    checked={useDefaultSettings}
                    onChange={(e) => setUseDefaultSettings(e.target.checked)}
                    className="mr-2"
                />
                <label htmlFor="defaultFZT" className="font-medium">
                    {language === 'bn'
                        ? 'ডিফল্ট সেটিংস ব্যবহার করুন'
                        : 'Use default settings'}
                </label>
            </div>

            {!useDefaultSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Font and Size Settings */}
                    <div>
                        <label className="block mb-1 font-medium">{t.labelFontSize}</label>
                        <input
                            type="number"
                            value={labelFontSize}
                            onChange={(e) => setLabelFontSize(Number(e.target.value))}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">{t.tickFontSize}</label>
                        <input
                            type="number"
                            value={tickFontSize}
                            onChange={(e) => setTickFontSize(Number(e.target.value))}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">{t.imageQuality}</label>
                        <input
                            type="number"
                            value={imageQuality}
                            onChange={(e) => setImageQuality(Number(e.target.value))}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">{t.imageSize}</label>
                        <input
                            type="text"
                            value={imageSize}
                            onChange={(e) => setImageSize(e.target.value)}
                            placeholder="e.g. 6x4"
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    {/* F-distribution Colors */}
                    <div>
                        <label className="block mb-1 font-medium">F-curve color</label>
                        <input
                            type="text"
                            value={fCurveColor}
                            onChange={(e) => setFCurveColor(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">F-observed line color</label>
                        <input
                            type="text"
                            value={fLineColor}
                            onChange={(e) => setFLineColor(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    {/* Z-distribution Colors */}
                    <div>
                        <label className="block mb-1 font-medium">Z-curve color</label>
                        <input
                            type="text"
                            value={zCurveColor}
                            onChange={(e) => setZCurveColor(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Z-observed line color</label>
                        <input
                            type="text"
                            value={zLineColor}
                            onChange={(e) => setZLineColor(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    {/* T-distribution Colors */}
                    <div>
                        <label className="block mb-1 font-medium">T-curve color</label>
                        <input
                            type="text"
                            value={tCurveColor}
                            onChange={(e) => setTCurveColor(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">T-observed line color</label>
                        <input
                            type="text"
                            value={tLineColor}
                            onChange={(e) => setTLineColor(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    {/* Histogram Colors */}
                    <div>
                        <label className="block mb-1 font-medium">Histogram color - Group 1</label>
                        <input
                            type="text"
                            value={hist1Color}
                            onChange={(e) => setHist1Color(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Histogram color - Group 2</label>
                        <input
                            type="text"
                            value={hist2Color}
                            onChange={(e) => setHist2Color(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    {/* Line Style */}
                    <div>
                        <label className="block mb-1 font-medium">Line style</label>
                        <select
                            value={lineStyle}
                            onChange={(e) => setLineStyle(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FZTOptions;
