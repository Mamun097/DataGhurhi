import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportViewer = () => {
    const [reports, setReports] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('analysisReports') || '[]');
        setReports(saved);
    }, []);

    const clearReports = () => {
        if (window.confirm('Are you sure you want to clear all reports?')) {
            localStorage.removeItem('analysisReports');
            setReports([]);
        }
    };

    const getBase64ImageFromURL = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    };

    

    const downloadReport = async () => {
        const doc = new jsPDF();
        let y = 10;

        for (let index = 0; index < reports.length; index++) {
            const r = reports[index];
            doc.setFontSize(12);
            doc.text(`Test #${index + 1}`, 10, y); y += 8;
            doc.text(`Type: ${r.type}`, 10, y); y += 8;
            doc.text(`Date: ${new Date(r.timestamp).toLocaleString()}`, 10, y); y += 8;
            doc.text(`Columns: ${r.columns?.join(', ')}`, 10, y); y += 8;

            // Add results text
            const { image_paths, ...resultWithoutImages } = r.results || {};
            const resultString = JSON.stringify(resultWithoutImages, null, 2);
            const lines = doc.splitTextToSize(resultString, 180);
            doc.text(lines, 10, y);
            y += lines.length * 6;

            // Add images
            if (r.results?.image_paths && r.results.image_paths.length > 0) {
                const backendUrl = 'http://localhost:8000';
                for (const imagePath of r.results.image_paths) {
                    try {
                        const imageUrl = `${backendUrl}${imagePath}`;
                        const base64 = await getBase64ImageFromURL(imageUrl);
                        if (y > 250) { doc.addPage(); y = 10; }
                        doc.addImage(base64, 'PNG', 10, y, 180, 90);
                        y += 100;
                    } catch (err) {
                        console.error(`Failed to load image ${imagePath}:`, err);
                        doc.text(`(Could not load image: ${imagePath})`, 10, y);
                        y += 10;
                    }
                }

            }

            if (index < reports.length - 1) {
                doc.addPage();
                y = 10;
            }
        }

        doc.save('data_analysis_report.pdf');
    };


    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Report</h1>

            {reports.length === 0 ? (
                <p>No reports saved.</p>
            ) : (
                <div className="space-y-4">
                    {reports.map((r, idx) => (
                        <div key={idx} className="border p-4 rounded bg-gray-50">
                            <p><strong>Type:</strong> {r.type}</p>
                            <p><strong>Date:</strong> {new Date(r.timestamp).toLocaleString()}</p>
                            <p><strong>Columns:</strong> {r.columns?.join(', ')}</p>

                            {/* Show result JSON without image paths */}
                            <pre className="overflow-auto text-sm bg-white mt-2 p-2 rounded border max-h-64">
                                {JSON.stringify({ ...r.results, image_paths: undefined }, null, 2)}
                            </pre>

                            {/* Show images if available */}
                            {r.results?.image_paths?.length > 0 && (
                                <>
                                    <p className="font-semibold mt-4">Plots:</p>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {r.results.image_paths.map((path, imgIdx) => {
                                            const backendUrl = 'http://localhost:8000';
                                            return (
                                                <img
                                                key={imgIdx}
                                                src={`${backendUrl}${path}`}
                                                alt={`Plot ${imgIdx + 1}`}
                                                style={{
                                                    width: '250px',
                                                    height: 'auto',
                                                    borderRadius: '6px',
                                                    border: '1px solid #ccc',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                    marginBottom: '1rem'
                                                }}
                                                />
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex gap-4 flex-wrap">
                <button
                    onClick={downloadReport}
                    className="bg-green-600 text-black px-4 py-2 rounded shadow"
                >
                    Download Report
                </button>

                <button
                    onClick={clearReports}
                    className="bg-red-600 text-black px-4 py-2 rounded shadow"
                >
                    Clear Report
                </button>

                <button
                    onClick={() => navigate('/analysis')}
                    className="bg-blue-600 text-black px-4 py-2 rounded shadow"
                >
                    Back to Analysis
                </button>
            </div>
        </div>
    );
};

export default ReportViewer;