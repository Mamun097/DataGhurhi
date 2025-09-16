const MannWhitneyOptions = ({ options, setOptions, t }) => {
  const handleChange = (key, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
  };
  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-semibold text-lg mb-3">{t.tests.mannwhitney}</h4>
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
                className="w-full border rounded-md px-3 py-2"
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
                className="w-full border rounded-md px-3 py-2"
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
                className="w-full border rounded-md px-3 py-2"
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
                className="w-full border rounded-md px-3 py-2"
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
                className="w-full border rounded-md px-3 py-2"
                value={options.colorPalette}
                onChange={(e) => handleChange("colorPalette", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.boxWidth}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1.0"
                className="w-full border rounded-md px-3 py-2"
                value={options.boxWidth}
                onChange={(e) =>
                  handleChange("boxWidth", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.violinWidth}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1.0"
                className="w-full border rounded-md px-3 py-2"
                value={options.violinWidth}
                onChange={(e) =>
                  handleChange("violinWidth", Number(e.target.value))
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MannWhitneyOptions;
