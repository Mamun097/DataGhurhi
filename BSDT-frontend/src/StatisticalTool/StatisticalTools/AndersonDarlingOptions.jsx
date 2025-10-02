const AndersonDarlingOptions = ({ language, options, setOptions, t }) => {
  const handleChange = (key, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
  };
  return (
    <div className="bg-white rounded-md shadow-md p-4 mt-4 space-y-4">
      <h3 className="text-lg font-semibold">{t.selectVariables}</h3>
      <div>
        <label className="block font-medium mb-1">{t.downloadLabel}</label>
        <select
          value={options.imageFormat}
          onChange={(e) => handleChange("imageFormat", e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="pdf">PDF</option>
          <option value="tiff">TIFF</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">{t.useDefaultSettings}</label>
        <input
          type="checkbox"
          checked={options.useDefaultSettings}
          onChange={(e) => handleChange("useDefaultSettings", e.target.checked)}
        />
      </div>

      {!options.useDefaultSettings && (
        <>
          <div>
            <label className="block font-medium mb-1">{t.labelFontSize}</label>
            <input
              type="number"
              value={options.labelFontSize}
              onChange={(e) =>
                handleChange("labelFontSize", parseInt(e.target.value))
              }
              className="w-full border rounded p-2"
              min={10}
              max={72}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">{t.tickFontSize}</label>
            <input
              type="number"
              value={options.tickFontSize}
              onChange={(e) =>
                handleChange("tickFontSize", parseInt(e.target.value))
              }
              className="w-full border rounded p-2"
              min={8}
              max={48}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">{t.imageQuality}</label>
            <input
              type="number"
              value={options.imageQuality}
              onChange={(e) =>
                handleChange("imageQuality", parseInt(e.target.value))
              }
              className="w-full border rounded p-2"
              min={10}
              max={100}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">{t.imageSize}</label>
            <input
              type="text"
              value={options.imageSize}
              onChange={(e) => handleChange("imageSize", e.target.value)}
              className="w-full border rounded p-2"
              placeholder="800x600"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {language === "bn"
                ? "স্ক্যাটার রঙ (বিন্দু)"
                : "Scatter Color (dots)"}
            </label>
            <input
              type="text"
              value={options.dotColor}
              onChange={(e) => handleChange("dotColor", e.target.value)}
              className="w-full border rounded p-2"
              placeholder="steelblue"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {language === "bn"
                ? "রেফারেন্স লাইনের রঙ"
                : "Reference Line Color"}
            </label>
            <input
              type="text"
              value={options.lineColor}
              onChange={(e) => handleChange("lineColor", e.target.value)}
              className="w-full border rounded p-2"
              placeholder="red"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {language === "bn" ? "লাইনের স্টাইল" : "Line Style"}
            </label>
            <select
              value={options.lineStyle}
              onChange={(e) => handleChange("lineStyle", e.target.value)}
              className="w-full border rounded p-2"
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
        </>
      )}
    </div>
  );
};

export default AndersonDarlingOptions;
