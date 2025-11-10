import React from 'react';
import { useLocation } from 'react-router-dom';

const GroupPreviewPage = () => {
  const { state } = useLocation();
  const { previewData, downloadUrl, filename } = state || {};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Preview of Grouped Data</h2>

      {previewData && previewData.length > 0 ? (
        <div className="overflow-x-auto border rounded max-h-[60vh] overflow-y-auto">
          <table className="table-auto w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(previewData[0]).map((col, idx) => (
                  <th key={idx} className="border px-4 py-2 text-left font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, rIdx) => (
                <tr key={rIdx}>
                  {Object.values(row).map((val, cIdx) => (
                    <td key={cIdx} className="border px-4 py-1">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No preview data available.</p>
      )}

      <div className="mt-6">
        <a
          href={`http://127.0.0.1:8000${downloadUrl}`}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          download
        >
           Download Grouped Excel ({filename})
        </a>
      </div>
    </div>
  );
};

export default GroupPreviewPage;
