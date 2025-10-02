const NetworkGraphOptions = ({ language, options, setOptions, t }) => {
  const handleChange = (key, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
  };
  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-semibold text-lg mb-3">{t.network_graph}</h4>
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
                {t.nodeColor}
              </label>
              <input
                type="text"
                placeholder="#AED6F1 or red"
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                value={options.nodeColor}
                onChange={(e) => handleChange("nodeColor", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.nodeSize}
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                value={options.nodeSize}
                onChange={(e) =>
                  handleChange("nodeSize", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.textSize}
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                value={options.textSize}
                onChange={(e) =>
                  handleChange("textSize", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.textColor}
              </label>
              <input
                type="text"
                placeholder="e.g. black"
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                value={options.textColor}
                onChange={(e) => handleChange("textColor", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.edgeWidthFactor}
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                value={options.edgeWidthFactor}
                onChange={(e) =>
                  handleChange("edgeWidthFactor", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.showEdgeWeights}
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                value={options.showEdgeWeights ? "y" : "n"}
                onChange={(e) =>
                  handleChange("showEdgeWeights", e.target.value === "y")
                }
              >
                <option value="n">{language === "bn" ? "না" : "No"}</option>
                <option value="y">{language === "bn" ? "হ্যাঁ" : "Yes"}</option>
              </select>
            </div>
            {options.showEdgeWeights && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.weightFontSize}
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                    value={options.weightFontSize}
                    onChange={(e) =>
                      handleChange("weightFontSize", Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.weightColor}
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                    value={options.weightColor}
                    onChange={(e) =>
                      handleChange("weightColor", e.target.value)
                    }
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.useMatrix}
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                value={options.useMatrix ? "y" : "n"}
                onChange={(e) =>
                  handleChange("useMatrix", e.target.value === "y")
                }
              >
                <option value="n">{language === "bn" ? "না" : "No"}</option>
                <option value="y">{language === "bn" ? "হ্যাঁ" : "Yes"}</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraphOptions;
