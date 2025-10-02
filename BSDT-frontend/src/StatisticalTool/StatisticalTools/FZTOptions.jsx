const FZTOptions = ({ options, setOptions, t, language }) => {
  const handleChange = (key, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
  };
  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center">
        <input
          id="defaultFZT"
          type="checkbox"
          checked={options.useDefaultSettings}
          onChange={(e) => handleChange("useDefaultSettings", e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="defaultFZT" className="font-medium">
          {language === "bn"
            ? "ডিফল্ট সেটিংস ব্যবহার করুন"
            : "Use default settings"}
        </label>
      </div>

      {!options.useDefaultSettings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">{t.labelFontSize}</label>
            <input
              type="number"
              value={options.labelFontSize}
              onChange={(e) =>
                handleChange("labelFontSize", Number(e.target.value))
              }
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t.tickFontSize}</label>
            <input
              type="number"
              value={options.tickFontSize}
              onChange={(e) =>
                handleChange("tickFontSize", Number(e.target.value))
              }
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t.imageQuality}</label>
            <input
              type="number"
              value={options.imageQuality}
              onChange={(e) =>
                handleChange("imageQuality", Number(e.target.value))
              }
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">{t.imageSize}</label>
            <input
              type="text"
              value={options.imageSize}
              onChange={(e) => handleChange("imageSize", e.target.value)}
              placeholder="e.g. 6x4"
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">F-curve color</label>
            <input
              type="text"
              value={options.fCurveColor}
              onChange={(e) => handleChange("fCurveColor", e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              F-observed line color
            </label>
            <input
              type="text"
              value={options.fLineColor}
              onChange={(e) => handleChange("fLineColor", e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Z-curve color</label>
            <input
              type="text"
              value={options.zCurveColor}
              onChange={(e) => handleChange("zCurveColor", e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Z-observed line color
            </label>
            <input
              type="text"
              value={options.zLineColor}
              onChange={(e) => handleChange("zLineColor", e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">T-curve color</label>
            <input
              type="text"
              value={options.tCurveColor}
              onChange={(e) => handleChange("tCurveColor", e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              T-observed line color
            </label>
            <input
              type="text"
              value={options.tLineColor}
              onChange={(e) => handleChange("tLineColor", e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Histogram color - Group 1
            </label>
            <input
              type="text"
              value={options.hist1Color}
              onChange={(e) => handleChange("hist1Color", e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Histogram color - Group 2
            </label>
            <input
              type="text"
              value={options.hist2Color}
              onChange={(e) => handleChange("hist2Color", e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Line style</label>
            <select
              value={options.lineStyle}
              onChange={(e) => handleChange("lineStyle", e.target.value)}
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
