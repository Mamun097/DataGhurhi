import React from 'react';

const AndersonDarlingOptions = ({
  language,
  setLanguage,
  imageFormat,
  setImageFormat,
  useDefaultSettings,
  setUseDefaultSettings,
  labelFontSize,
  setLabelFontSize,
  tickFontSize,
  setTickFontSize,
  imageQuality,
  setImageQuality,
  imageSize,
  setImageSize,
  dotColor,       // scatter plot color
  setDotColor,
  lineColor,      // reference line color
  setLineColor,
  lineStyle,
  setLineStyle,
  t,
  selectedColumn,
  setSelectedColumn
}) => {
  return (
    <div className="bg-white rounded-md shadow-md p-4 mt-4 space-y-4">
      <h3 className="text-lg font-semibold">{t.selectVariables}</h3>

      <div>
        <label className="block font-medium mb-1">{t.downloadLabel}</label>
        <select
          value={imageFormat}
          onChange={(e) => setImageFormat(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="pdf">PDF</option>
          <option value="tiff">TIFF</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">
          {t.useDefaultSettings}
        </label>
        <input
          type="checkbox"
          checked={useDefaultSettings}
          onChange={(e) => setUseDefaultSettings(e.target.checked)}
        />
      </div>

      {!useDefaultSettings && (
        <>
          <div>
            <label className="block font-medium mb-1">{t.labelFontSize}</label>
            <input
              type="number"
              value={labelFontSize}
              onChange={(e) => setLabelFontSize(parseInt(e.target.value))}
              className="w-full border rounded p-2"
              min={10}
              max={72}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">{t.tickFontSize}</label>
            <input
              type="number"
              value={tickFontSize}
              onChange={(e) => setTickFontSize(parseInt(e.target.value))}
              className="w-full border rounded p-2"
              min={8}
              max={48}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">{t.imageQuality}</label>
            <input
              type="number"
              value={imageQuality}
              onChange={(e) => setImageQuality(parseInt(e.target.value))}
              className="w-full border rounded p-2"
              min={10}
              max={100}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">{t.imageSize}</label>
            <input
              type="text"
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="800x600"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {language === 'bn' ? 'স্ক্যাটার রঙ (বিন্দু)' : 'Scatter Color (dots)'}
            </label>
            <input
              type="text"
              value={dotColor}
              onChange={(e) => setDotColor(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="steelblue"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {language === 'bn' ? 'রেফারেন্স লাইনের রঙ' : 'Reference Line Color'}
            </label>
            <input
              type="text"
              value={lineColor}
              onChange={(e) => setLineColor(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="red"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {language === 'bn' ? 'লাইনের স্টাইল' : 'Line Style'}
            </label>
            <select
              value={lineStyle}
              onChange={(e) => setLineStyle(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="solid">{language === 'bn' ? 'সলিড' : 'Solid'}</option>
              <option value="dashed">{language === 'bn' ? 'ড্যাশড' : 'Dashed'}</option>
              <option value="dotted">{language === 'bn' ? 'ডটেড' : 'Dotted'}</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default AndersonDarlingOptions;
