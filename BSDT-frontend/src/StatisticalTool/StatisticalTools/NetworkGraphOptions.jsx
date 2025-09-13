const NetworkGraphOptions = ({
    language,
    setLanguage,
    useDefaultSettings,
    setUseDefaultSettings,
    nodeColor,
    setNodeColor,
    nodeSize,
    setNodeSize,
    textSize,
    setTextSize,
    textColor,
    setTextColor,
    edgeWidthFactor,
    setEdgeWidthFactor,
    showEdgeWeights,
    setShowEdgeWeights,
    weightFontSize,
    setWeightFontSize,
    weightColor,
    setWeightColor,
    useMatrix,
    setUseMatrix,
    t
}) => {
    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-lg mb-3">{t.network_graph}</h4>

            {/* Use Default Settings */}
            <label className="block mb-2">{t.useDefaultSettings}</label>
            <input
                type="checkbox"
                checked={useDefaultSettings}
                onChange={(e) => setUseDefaultSettings(e.target.checked)}
                className="mb-4"
            />

            {!useDefaultSettings && (
                <div className="bg-white shadow rounded-lg p-6 mt-4 border border-gray-200">
                    <h5 className="text-md font-semibold text-gray-800 mb-4">{t.customSettings}</h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Node Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.nodeColor}</label>
                            <input
                                type="text"
                                placeholder="#AED6F1 or red"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                                value={nodeColor}
                                onChange={(e) => setNodeColor(e.target.value)}
                            />
                        </div>

                        {/* Node Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.nodeSize}</label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                                value={nodeSize}
                                onChange={(e) => setNodeSize(Number(e.target.value))}
                            />
                        </div>

                        {/* Text Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.textSize}</label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                                value={textSize}
                                onChange={(e) => setTextSize(Number(e.target.value))}
                            />
                        </div>

                        {/* Text Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.textColor}</label>
                            <input
                                type="text"
                                placeholder="e.g. black"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                            />
                        </div>

                        {/* Edge Width Factor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.edgeWidthFactor}</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                                value={edgeWidthFactor}
                                onChange={(e) => setEdgeWidthFactor(Number(e.target.value))}
                            />
                        </div>

                        {/* Show Edge Weights */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.showEdgeWeights}</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                                value={showEdgeWeights ? 'y' : 'n'}
                                onChange={(e) => setShowEdgeWeights(e.target.value === 'y')}
                            >
                                <option value="n">{language === 'bn' ? 'না' : 'No'}</option>
                                <option value="y">{language === 'bn' ? 'হ্যাঁ' : 'Yes'}</option>
                            </select>
                        </div>

                        {/* Weight Font Size */}
                        {showEdgeWeights && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.weightFontSize}</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                                        value={weightFontSize}
                                        onChange={(e) => setWeightFontSize(Number(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.weightColor}</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                                        value={weightColor}
                                        onChange={(e) => setWeightColor(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Use Matrix */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.useMatrix}</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                                value={useMatrix ? 'y' : 'n'}
                                onChange={(e) => setUseMatrix(e.target.value === 'y')}
                            >
                                <option value="n">{language === 'bn' ? 'না' : 'No'}</option>
                                <option value="y">{language === 'bn' ? 'হ্যাঁ' : 'Yes'}</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NetworkGraphOptions;
