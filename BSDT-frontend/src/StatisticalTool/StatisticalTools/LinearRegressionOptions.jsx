const LinearRegressionOptions = ({ language, options, setOptions, t }) => {
  const handleChange = (key, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
  };
  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-semibold text-lg mb-3">
        {t.linearTitle || t.tests.linear_regression}
      </h4>
      <label className="block mb-2">{t.downloadLabel}</label>
      <select
        value={options.imageFormat}
        onChange={(e) => handleChange("imageFormat", e.target.value)}
        className="mb-4 border p-2 rounded w-full"
      >
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
        <option value="pdf">PDF</option>
        <option value="tiff">TIFF</option>
      </select>
      <label className="block mb-2">{t.useDefaultSettings}</label>
      <input
        type="checkbox"
        checked={options.useDefaultSettings}
        onChange={(e) => handleChange("useDefaultSettings", e.target.checked)}
        className="mb-4"
      />
      {!options.useDefaultSettings && (
        <div className="bg-white shadow rounded-lg p-6 mt-4 border border-gray-200">
          <h5 className="text-md font-semibold text-gray-800 mb-4">
            {t.customSettings}
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.labelFontSize}
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={options.labelFontSize}
                onChange={(e) =>
                  handleChange("labelFontSize", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.tickFontSize}
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={options.tickFontSize}
                onChange={(e) =>
                  handleChange("tickFontSize", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.imageQuality}
              </label>
              <input
                type="number"
                min={1}
                max={100}
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={options.imageQuality}
                onChange={(e) =>
                  handleChange("imageQuality", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.imageSize}
              </label>
              <input
                type="text"
                placeholder="e.g. 800x600"
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={options.imageSize}
                onChange={(e) => handleChange("imageSize", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.palette}
              </label>
              <input
                type="text"
                placeholder="e.g. deep, Set2"
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={options.colorPalette}
                onChange={(e) => handleChange("colorPalette", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "bn" ? "লাইন রঙ" : "Line Color"}
              </label>
              <input
                type="text"
                value={options.lineColor}
                onChange={(e) => handleChange("lineColor", e.target.value)}
                placeholder="e.g. red"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "bn" ? "লাইন স্টাইল" : "Line Style"}
              </label>
              <select
                value={options.lineStyle}
                onChange={(e) => handleChange("lineStyle", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="solid">
                  {language === "bn" ? "সলিড" : "Solid"}
                </option>
                <option value="dashed">
                  {language === "bn" ? "ড্যাশড" : "Dashed"}
                </option>
                <option value="dotted">
                  {language === "bn" ? "ডটেড" : "Dotted"}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "bn" ? "লাইন প্রস্থ" : "Line Width"}
              </label>
              <input
                type="number"
                value={options.lineWidth}
                onChange={(e) =>
                  handleChange("lineWidth", Number(e.target.value))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "bn" ? "ডট সাইজ" : "Dot Size"}
              </label>
              <input
                type="number"
                value={options.dotWidth}
                onChange={(e) =>
                  handleChange("dotWidth", Number(e.target.value))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "bn" ? "ডট রঙ" : "Dot Color"}
              </label>
              <input
                type="text"
                value={options.dotColor}
                onChange={(e) => handleChange("dotColor", e.target.value)}
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
