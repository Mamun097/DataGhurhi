

const AncovaOptions = ({
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
  dotColor,
  setDotColor,
  lineColor,
  setLineColor,
  lineStyle,
  setLineStyle,
  dotWidth,
  setDotWidth,
  lineWidth,
  setLineWidth,
  t
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 my-4">
      <h3 className="text-lg font-semibold mb-4">
        {language === 'bn' ? 'ANCOVA ভিজ্যুয়াল সেটিংস' : 'ANCOVA Visualization Settings'}
      </h3>


      <div className="mb-4">
        <label className="block mb-1 font-medium">
          {t.useDefaults || 'Use Default Settings'}:
        </label>
        <input
          type="checkbox"
          checked={useDefaultSettings}
          onChange={(e) => setUseDefaultSettings(e.target.checked)}
          className="mr-2"
        />
        {useDefaultSettings
          ? t.defaultsApplied || 'Defaults will be used'
          : t.customize || 'Customize below'}
      </div>

      {!useDefaultSettings && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">
                {t.labelFontSize || 'Axis Label Font Size'}
              </label>
              <input
                type="number"
                value={labelFontSize}
                onChange={(e) => setLabelFontSize(Number(e.target.value))}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.tickFontSize || 'Tick Label Font Size'}
              </label>
              <input
                type="number"
                value={tickFontSize}
                onChange={(e) => setTickFontSize(Number(e.target.value))}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.imageQuality || 'Image Quality (1–100)'}
              </label>
              <input
                type="number"
                value={imageQuality}
                onChange={(e) => setImageQuality(Number(e.target.value))}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.imageSize || 'Image Size (e.g., 800x600)'}
              </label>
              <input
                type="text"
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.dotColor || 'Dot Color'}
              </label>
              <input
                type="text"
                value={dotColor}
                onChange={(e) => setDotColor(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.dotWidth || 'Dot Size'}
              </label>
              <input
                type="number"
                value={dotWidth}
                onChange={(e) => setDotWidth(Number(e.target.value))}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.lineColor || 'Line Color'}
              </label>
              <input
                type="text"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.lineStyle || 'Line Style (solid, dashed, dotted)'}
              </label>
              <input
                type="text"
                value={lineStyle}
                onChange={(e) => setLineStyle(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.lineWidth || 'Line Width'}
              </label>
              <input
                type="number"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>
          </div>
        </>
      )}

      <div className="mt-4">
        <label className="block mb-1 font-medium">
          {t.imageFormat || 'Image Format'}:
        </label>
        <select
          value={imageFormat}
          onChange={(e) => setImageFormat(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full"
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
    </div>
  );
};

export default AncovaOptions;
