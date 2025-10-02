const EDADistributionsOptions = ({
  language,
  setLanguage,
  options,
  setOptions,
  t,
}) => {
  const handleChange = (key, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
  };
  return (
    <div className="space-y-4">
      <div>
        <label className="font-medium block mb-1">
          {language === "bn" ? "ভাষা নির্বাচন করুন:" : "Select language:"}
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
        </select>
      </div>

      <div>
        <label className="font-medium block mb-1">
          {t.imageFormat || "Image Format"}
        </label>
        <select
          value={options.imageFormat}
          onChange={(e) => handleChange("imageFormat", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="pdf">PDF</option>
          <option value="tiff">TIFF</option>
        </select>
      </div>

      <div>
        <label className="font-medium block mb-1">
          {language === "bn"
            ? "ডিফল্ট সেটিংস ব্যবহার করুন?"
            : "Use default settings?"}
        </label>
        <input
          type="checkbox"
          checked={options.useDefaultSettings}
          onChange={(e) => handleChange("useDefaultSettings", e.target.checked)}
          className="mr-2"
        />
        {language === "bn" ? "হ্যাঁ" : "Yes"}
      </div>

      {!options.useDefaultSettings && (
        <>
          <div>
            <label className="font-medium block mb-1">
              {t.labelFontSize || "Label Font Size"}
            </label>
            <input
              type="number"
              value={options.labelFontSize}
              onChange={(e) => handleChange("labelFontSize", Number(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              {t.tickFontSize || "Tick Font Size"}
            </label>
            <input
              type="number"
              value={options.tickFontSize}
              onChange={(e) => handleChange("tickFontSize", Number(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              {t.imageQuality || "Image Quality (DPI)"}
            </label>
            <input
              type="number"
              value={options.imageQuality}
              onChange={(e) => handleChange("imageQuality", Number(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              {t.imageSize || "Image Size (Width x Height in px)"}
            </label>
            <input
              type="text"
              value={options.imageSize}
              onChange={(e) => handleChange("imageSize", e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="800x600"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              {t.histogramColor || "Histogram Color"}
            </label>
            <input
              type="text"
              value={options.histColor}
              onChange={(e) => handleChange("histColor", e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., blue"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              {t.kdeColor || "KDE Color"}
            </label>
            <input
              type="text"
              value={options.kdeColor}
              onChange={(e) => handleChange("kdeColor", e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., green"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              {t.distributionColor || "Distribution Plot Color"}
            </label>
            <input
              type="text"
              value={options.distColor}
              onChange={(e) => handleChange("distColor", e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., purple"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EDADistributionsOptions;