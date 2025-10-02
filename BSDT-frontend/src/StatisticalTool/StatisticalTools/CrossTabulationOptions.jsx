const CrossTabulationOptions = ({
  language,
  setLanguage,
  options,
  setOptions,
}) => {
  const handleChange = (key, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
  };
  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-3">
        {language === "bn" ? "অতিরিক্ত বিকল্পসমূহ" : "Additional Options"}
      </h3>
      <div className="mb-4">
        <label className="block font-medium mb-1">
          {language === "bn" ? "ভাষা নির্বাচন করুন" : "Language"}
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        >
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">
          {language === "bn" ? "ফরম্যাট" : "Image Format"}
        </label>
        <select
          value={options.imageFormat}
          onChange={(e) => handleChange("imageFormat", e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="jpeg">JPEG</option>
          <option value="pdf">PDF</option>
          <option value="tiff">TIFF</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.useDefaultSettings}
            onChange={(e) =>
              handleChange("useDefaultSettings", e.target.checked)
            }
          />
          <span>
            {language === "bn"
              ? "ডিফল্ট সেটিংস ব্যবহার করুন"
              : "Use Default Plot Settings"}
          </span>
        </label>
      </div>
      {!options.useDefaultSettings && (
        <>
          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === "bn" ? "হিটম্যাপ থিম" : "Heatmap Color Theme"}
            </label>
            <input
              type="text"
              value={options.colorPalette}
              onChange={(e) => handleChange("colorPalette", e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              placeholder="Blues, Reds, Greens, etc."
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === "bn" ? "বার প্রস্থ" : "Bar Width"}
            </label>
            <input
              type="number"
              step="0.1"
              value={options.barWidth}
              onChange={(e) =>
                handleChange("barWidth", parseFloat(e.target.value))
              }
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === "bn" ? "লেবেল ফন্ট সাইজ" : "Label Font Size"}
            </label>
            <input
              type="number"
              value={options.labelFontSize}
              onChange={(e) =>
                handleChange("labelFontSize", parseInt(e.target.value))
              }
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === "bn" ? "টিক ফন্ট সাইজ" : "Tick Font Size"}
            </label>
            <input
              type="number"
              value={options.tickFontSize}
              onChange={(e) =>
                handleChange("tickFontSize", parseInt(e.target.value))
              }
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === "bn" ? "ছবির আকার (px)" : "Image Size (px)"}
            </label>
            <input
              type="text"
              value={options.imageSize}
              onChange={(e) => handleChange("imageSize", e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              placeholder="e.g. 800x600"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === "bn" ? "ছবির মান (1-100)" : "Image Quality (1-100)"}
            </label>
            <input
              type="number"
              value={options.imageQuality}
              onChange={(e) =>
                handleChange("imageQuality", parseInt(e.target.value))
              }
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CrossTabulationOptions;
