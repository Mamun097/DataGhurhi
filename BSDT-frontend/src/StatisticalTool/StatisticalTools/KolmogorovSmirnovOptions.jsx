

const KolmogorovSmirnovOptions = ({
  selectedColumn,
  setSelectedColumn,
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
  ecdfColor,
  setEcdfColor,
  cdfColor,
  setCdfColor,
  lineStyle,
  setLineStyle,
  t
}) => {
  return (
    <div className="mb-6 mt-2 bg-gray-50 p-4 rounded shadow-sm border">
      <h4 className="text-md font-semibold text-gray-800 mb-3">
        {language === 'bn' ? 'কলমোগোরভ–স্মিরনভ পরীক্ষার সেটিংস' : 'Kolmogorov–Smirnov Test Settings'}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'bn' ? 'ফাইল ফরম্যাট' : 'Image Format'}
          </label>
          <select
            className="w-full border border-gray-300 rounded p-2"
            value={imageFormat}
            onChange={(e) => setImageFormat(e.target.value)}
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="pdf">PDF</option>
            <option value="tiff">TIFF</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'bn' ? 'ডিফল্ট সেটিংস ব্যবহার করবেন?' : 'Use Default Settings?'}
          </label>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={useDefaultSettings}
            onChange={(e) => setUseDefaultSettings(e.target.checked)}
          />
        </div>

        {!useDefaultSettings && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.labelFontSize}
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded p-2"
                value={labelFontSize}
                onChange={(e) => setLabelFontSize(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.tickFontSize}
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded p-2"
                value={tickFontSize}
                onChange={(e) => setTickFontSize(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.imageQuality}
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded p-2"
                value={imageQuality}
                onChange={(e) => setImageQuality(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.imageSize}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'ECDF রঙ' : 'ECDF Color'}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                value={ecdfColor}
                onChange={(e) => setEcdfColor(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'থিওরেটিকাল CDF রঙ' : 'Theoretical CDF Color'}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                value={cdfColor}
                onChange={(e) => setCdfColor(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'লাইন স্টাইল' : 'Line Style'}
              </label>
              <select
                className="w-full border border-gray-300 rounded p-2"
                value={lineStyle}
                onChange={(e) => setLineStyle(e.target.value)}
              >
                <option value="solid">{language === 'bn' ? 'সলিড' : 'Solid'}</option>
                <option value="dashed">{language === 'bn' ? 'ড্যাশড' : 'Dashed'}</option>
                <option value="dotted">{language === 'bn' ? 'ডটেড' : 'Dotted'}</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KolmogorovSmirnovOptions;
