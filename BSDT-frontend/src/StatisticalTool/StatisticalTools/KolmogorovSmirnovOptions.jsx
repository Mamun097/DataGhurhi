const KolmogorovSmirnovOptions = ({ language, options, setOptions, t }) => {
  const handleChange = (key, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
  };
  return (
    <div className="mb-6 mt-2 bg-gray-50 p-4 rounded shadow-sm border">
      <h4 className="text-md font-semibold text-gray-800 mb-3">
        {language === "bn"
          ? "কলমোগোরভ–স্মিরনভ পরীক্ষার সেটিংস"
          : "Kolmogorov–Smirnov Test Settings"}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === "bn" ? "ফাইল ফরম্যাট" : "Image Format"}
          </label>
          <select
            className="w-full border border-gray-300 rounded p-2"
            value={options.imageFormat}
            onChange={(e) => handleChange("imageFormat", e.target.value)}
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="pdf">PDF</option>
            <option value="tiff">TIFF</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === "bn"
              ? "ডিফল্ট সেটিংস ব্যবহার করবেন?"
              : "Use Default Settings?"}
          </label>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={options.useDefaultSettings}
            onChange={(e) =>
              handleChange("useDefaultSettings", e.target.checked)
            }
          />
        </div>

        {!options.useDefaultSettings && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.labelFontSize}
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded p-2"
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
                className="w-full border border-gray-300 rounded p-2"
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
                className="w-full border border-gray-300 rounded p-2"
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
                className="w-full border border-gray-300 rounded p-2"
                value={options.imageSize}
                onChange={(e) => handleChange("imageSize", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "bn" ? "ECDF রঙ" : "ECDF Color"}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                value={options.ecdfColor}
                onChange={(e) => handleChange("ecdfColor", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "bn"
                  ? "থিওরেটিকাল CDF রঙ"
                  : "Theoretical CDF Color"}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                value={options.cdfColor}
                onChange={(e) => handleChange("cdfColor", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "bn" ? "লাইন স্টাইল" : "Line Style"}
              </label>
              <select
                className="w-full border border-gray-300 rounded p-2"
                value={options.lineStyle}
                onChange={(e) => handleChange("lineStyle", e.target.value)}
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
    </div>
  );
};

export default KolmogorovSmirnovOptions;
