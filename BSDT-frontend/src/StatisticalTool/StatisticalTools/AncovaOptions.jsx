const AncovaOptions = ({ language, options, setOptions, t }) => {
  const handleChange = (key, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-4 my-4">
      <h3 className="text-lg font-semibold mb-4">
        {language === "bn"
          ? "ANCOVA ভিজ্যুয়াল সেটিংস"
          : "ANCOVA Visualization Settings"}
      </h3>

      <div className="mb-4">
        <label className="block mb-1 font-medium">
          {t.useDefaults || "Use Default Settings"}:
        </label>
        <input
          type="checkbox"
          checked={options.useDefaultSettings}
          onChange={(e) => handleChange("useDefaultSettings", e.target.checked)}
          className="mr-2"
        />
        {options.useDefaultSettings
          ? t.defaultsApplied || "Defaults will be used"
          : t.customize || "Customize below"}
      </div>

      {!options.useDefaultSettings && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">
                {t.labelFontSize || "Axis Label Font Size"}
              </label>
              <input
                type="number"
                value={options.labelFontSize}
                onChange={(e) =>
                  handleChange("labelFontSize", Number(e.target.value))
                }
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.tickFontSize || "Tick Label Font Size"}
              </label>
              <input
                type="number"
                value={options.tickFontSize}
                onChange={(e) =>
                  handleChange("tickFontSize", Number(e.target.value))
                }
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.imageQuality || "Image Quality (1–100)"}
              </label>
              <input
                type="number"
                value={options.imageQuality}
                onChange={(e) =>
                  handleChange("imageQuality", Number(e.target.value))
                }
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.imageSize || "Image Size (e.g., 800x600)"}
              </label>
              <input
                type="text"
                value={options.imageSize}
                onChange={(e) => handleChange("imageSize", e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.dotColor || "Dot Color"}
              </label>
              <input
                type="text"
                value={options.dotColor}
                onChange={(e) => handleChange("dotColor", e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.dotWidth || "Dot Size"}
              </label>
              <input
                type="number"
                value={options.dotWidth}
                onChange={(e) =>
                  handleChange("dotWidth", Number(e.target.value))
                }
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.lineColor || "Line Color"}
              </label>
              <input
                type="text"
                value={options.lineColor}
                onChange={(e) => handleChange("lineColor", e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.lineStyle || "Line Style (solid, dashed, dotted)"}
              </label>
              <input
                type="text"
                value={options.lineStyle}
                onChange={(e) => handleChange("lineStyle", e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t.lineWidth || "Line Width"}
              </label>
              <input
                type="number"
                value={options.lineWidth}
                onChange={(e) =>
                  handleChange("lineWidth", Number(e.target.value))
                }
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>
          </div>
        </>
      )}

      <div className="mt-4">
        <label className="block mb-1 font-medium">
          {t.imageFormat || "Image Format"}:
        </label>
        <select
          value={options.imageFormat}
          onChange={(e) => handleChange("imageFormat", e.target.value)}
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
