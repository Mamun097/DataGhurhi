import React from 'react';

const CrossTabulationOptions = ({
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
  colorPalette,
  setColorPalette,
  barWidth,
  setBarWidth,
  t
}) => {
  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-3">
        {language === 'bn' ? 'অতিরিক্ত বিকল্পসমূহ' : 'Additional Options'}
      </h3>

      {/* Language selection */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          {language === 'bn' ? 'ভাষা নির্বাচন করুন' : 'Language'}
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

      {/* Format selection */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          {language === 'bn' ? 'ফরম্যাট' : 'Image Format'}
        </label>
        <select
          value={imageFormat}
          onChange={(e) => setImageFormat(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="jpeg">JPEG</option>
          <option value="pdf">PDF</option>
          <option value="tiff">TIFF</option>
        </select>
      </div>

      {/* Use default toggle */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useDefaultSettings}
            onChange={(e) => setUseDefaultSettings(e.target.checked)}
          />
          <span>
            {language === 'bn' ? 'ডিফল্ট সেটিংস ব্যবহার করুন' : 'Use Default Plot Settings'}
          </span>
        </label>
      </div>

      {/* Custom options only if not using default */}
      {!useDefaultSettings && (
        <>
          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === 'bn' ? 'হিটম্যাপ থিম' : 'Heatmap Color Theme'}
            </label>
            <input
              type="text"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              placeholder="Blues, Reds, Greens, etc."
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === 'bn' ? 'বার প্রস্থ' : 'Bar Width'}
            </label>
            <input
              type="number"
              step="0.1"
              value={barWidth}
              onChange={(e) => setBarWidth(parseFloat(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === 'bn' ? 'লেবেল ফন্ট সাইজ' : 'Label Font Size'}
            </label>
            <input
              type="number"
              value={labelFontSize}
              onChange={(e) => setLabelFontSize(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === 'bn' ? 'টিক ফন্ট সাইজ' : 'Tick Font Size'}
            </label>
            <input
              type="number"
              value={tickFontSize}
              onChange={(e) => setTickFontSize(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === 'bn' ? 'ছবির আকার (px)' : 'Image Size (px)'}
            </label>
            <input
              type="text"
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              placeholder="e.g. 800x600"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">
              {language === 'bn' ? 'ছবির মান (1-100)' : 'Image Quality (1-100)'}
            </label>
            <input
              type="number"
              value={imageQuality}
              onChange={(e) => setImageQuality(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CrossTabulationOptions;
