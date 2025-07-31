import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportViewer = () => {
    const [reports, setReports] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
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
        let y = 20;
        const pageHeight = 280;
        const margin = 15;
        const contentWidth = 180;

        
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Statistical Analysis Report', margin, 30);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 45);
        doc.text(`Total Analyses: ${reports.length}`, margin, 55);
        
       
        doc.setLineWidth(0.5);
        doc.line(margin, 65, margin + contentWidth, 65);
        
        y = 80;

        for (let index = 0; index < reports.length; index++) {
            const r = reports[index];
            
            
            if (y > pageHeight - 60) {
                doc.addPage();
                y = 20;
            }

            
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text(`Analysis ${index + 1}`, margin, y);
            y += 15;

            // Analysis details
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            
            const details = [
                `Test Type: ${r.type}`,
                `Date: ${new Date(r.timestamp).toLocaleString()}`,
                `Analyzed Columns: ${r.columns?.join(', ') || 'N/A'}`
            ];

            details.forEach(detail => {
                doc.text(detail, margin, y);
                y += 8;
            });

            y += 5;

            // Results section
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Results:', margin, y);
            y += 10;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            const { image_paths, success, ...cleanedResult } = r.results || {};

            
            Object.entries(cleanedResult).forEach(([key, value]) => {
                const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                let formattedValue = value;
                
                if (typeof value === 'number') {
                    formattedValue = Number(value).toFixed(4);
                } else if (typeof value === 'object') {
                    formattedValue = JSON.stringify(value, null, 2);
                }

                const line = `${formattedKey}: ${formattedValue}`;
                const wrappedLines = doc.splitTextToSize(line, contentWidth - 10);
                
                if (y + (wrappedLines.length * 5) > pageHeight - 20) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.text(wrappedLines, margin + 5, y);
                y += wrappedLines.length * 5 + 2;
            });

            
            if (r.results?.image_paths && r.results.image_paths.length > 0) {
                y += 10;
                
                if (y > pageHeight - 100) {
                    doc.addPage();
                    y = 20;
                }

                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text('Visualizations:', margin, y);
                y += 15;

                const backendUrl = 'http://localhost:8000';
                
                for (let imgIndex = 0; imgIndex < r.results.image_paths.length; imgIndex++) {
                    const imagePath = r.results.image_paths[imgIndex];
                    
                    try {
                        const imageUrl = `${backendUrl}${imagePath}`;
                        const base64 = await getBase64ImageFromURL(imageUrl);
                        
                        
                        if (y > pageHeight - 120) {
                            doc.addPage();
                            y = 20;
                        }

                       
                        doc.setFontSize(10);
                        doc.setFont(undefined, 'italic');
                        doc.text(`Chart ${imgIndex + 1}`, margin, y);
                        y += 10;

                        
                        const imgWidth = 170;
                        const imgHeight = 100;
                        
                        doc.addImage(base64, 'PNG', margin, y, imgWidth, imgHeight);
                        y += imgHeight + 15;
                        
                    } catch (err) {
                        console.error(`Failed to load image ${imagePath}:`, err);
                        doc.setFontSize(10);
                        doc.setTextColor(150, 150, 150);
                        doc.text(`Could not load chart: ${imagePath}`, margin, y);
                        doc.setTextColor(0, 0, 0);
                        y += 15;
                    }
                }
            }

            
            if (index < reports.length - 1) {
                y += 10;
                if (y > pageHeight - 30) {
                    doc.addPage();
                    y = 20;
                }
                doc.setLineWidth(0.3);
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, y, margin + contentWidth, y);
                y += 20;
            }
        }

        doc.save('statistical_analysis_report.pdf');
    };

    const openImageModal = (imagePath) => {
        setSelectedImage(imagePath);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6 max-w-6xl mx-auto">
                
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistical Analysis Reports</h1>
                    <p className="text-gray-600">View and manage your data analysis results</p>
                </div>

                {reports.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reports available</h3>
                        <p className="text-gray-500">Start by running some statistical analyses to generate reports.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reports.map((r, idx) => (
                            <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">Analysis {idx + 1}</h3>

                                        </div>
                                    </div>
                                </div>

                                {/* Report Content */}
                                <div className="p-6 space-y-6">
                                    {/* Analysis Details Box */}
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                                        <div className="px-4 py-3 bg-blue-50 border-b border-gray-200 rounded-t-lg">
                                            <h4 className="text-sm font-semibold text-blue-900">Analysis Details</h4>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Test Type</span>
                                                    <span className="text-sm text-gray-900 font-medium">{r.type}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date & Time</span>
                                                    <span className="text-sm text-gray-900">{new Date(r.timestamp).toLocaleString()}</span>
                                                </div>
                                                <div className="flex flex-col md:col-span-2">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Analyzed Columns</span>
                                                    <span className="text-sm text-gray-900">{r.columns?.join(', ') || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistical Results Box */}
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                                        <div className="px-4 py-3 bg-green-50 border-b border-gray-200 rounded-t-lg">
                                            <h4 className="text-sm font-semibold text-green-900">Statistical Results</h4>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                                {Object.entries(r.results)
                                                    .filter(([key]) => key !== 'success' && key !== 'image_paths')
                                                    .map(([key, value]) => (
                                                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                                            <span className="text-sm font-medium text-gray-700 capitalize">
                                                                {key.replace(/_/g, ' ')}:
                                                            </span>
                                                            <span className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                                                                {typeof value === 'number' ? 
                                                                    Number(value).toFixed(4) : 
                                                                    (typeof value === 'object' ? JSON.stringify(value) : value)
                                                                }
                                                            </span>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visualizations */}
                                    {r.results?.image_paths?.length > 0 && (
                                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <div className="px-4 py-3 bg-purple-50 border-b border-gray-200 rounded-t-lg">
                                                <h4 className="text-sm font-semibold text-purple-900">Visualizations</h4>
                                            </div>
                                            <div className="p-4">
                                                <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-16 gap-[1px]">

                                                    {r.results.image_paths.map((path, imgIdx) => {
                                                        const backendUrl = 'http://localhost:8000';
                                                        const imageUrl = `${backendUrl}${path}`;
                                                        return (
                                                            <div key={imgIdx} className="group relative">
                                                                <div className="mt-2 text-left">
                                                                    <p className="text-xs text-gray-600 font-medium">Visualization {imgIdx + 1}</p>
                                                                </div>
                                                                <div className="w-[160px] sm:w-[160px] md:w-[160px] lg:w-[160px] aspect-video bg-gray-100 rounded border border-gray-200 overflow-hidden shadow-sm group-hover:shadow-md transition duration-200">
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={`Chart ${imgIdx + 1}`}
                                                                    className="w-full h-full object-contain cursor-pointer"
                                                                    onClick={() => openImageModal(imageUrl)}
                                                                />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <div className="flex gap-4 flex-wrap justify-center md:justify-start">
                        <button
                            onClick={downloadReport}
                            disabled={reports.length === 0}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg shadow-sm font-medium transition-colors duration-200 flex items-center justify-center text-center gap-2"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF Report
                        </button>

                        <button
                            onClick={clearReports}
                            disabled={reports.length === 0}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg shadow-sm font-medium transition-colors duration-200 flex items-center justify-center text-center gap-2"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear All Reports
                        </button>

                        <button
                            onClick={() => navigate('/analysis')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                            Back to Analysis
                        </button>
                    </div>
                </div>
            </div>

            
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
                    <div className="relative max-w-4xl max-h-full">
                        <img
                            src={selectedImage}
                            alt="Enlarged chart"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={closeImageModal}
                            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportViewer;
















// Alternative
// import jsPDF from 'jspdf';
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const ReportViewer = () => {
//     const [reports, setReports] = useState([]);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const saved = JSON.parse(localStorage.getItem('analysisReports') || '[]');
//         setReports(saved);
//     }, []);

//     const clearReports = () => {
//         if (window.confirm('Are you sure you want to clear all reports?')) {
//             localStorage.removeItem('analysisReports');
//             setReports([]);
//         }
//     };

//     const getBase64ImageFromURL = async (url) => {
//         const response = await fetch(url);
//         const blob = await response.blob();
//         return new Promise((resolve) => {
//             const reader = new FileReader();
//             reader.onloadend = () => resolve(reader.result);
//             reader.readAsDataURL(blob);
//         });
//     };

    

//     const downloadReport = async () => {
//         const doc = new jsPDF();
//         let y = 10;

//         for (let index = 0; index < reports.length; index++) {
//             const r = reports[index];
//             doc.setFontSize(12);
//             doc.text(`Statitical Analysis: ${index + 1}`, 10, y); y += 8;
//             doc.text(`Test Type: ${r.type}`, 10, y); y += 8;
//             doc.text(`Test Added On: ${new Date(r.timestamp).toLocaleString()}`, 10, y); y += 8;
//             doc.text(`Analyzed Columns: ${r.columns?.join(', ')}`, 10, y); y += 8;

//             // Add results text
//             const { image_paths, success, ...cleanedResult } = r.results || {};

//             // Convert the object into lines manually
//             const resultLines = Object.entries(cleanedResult).map(
//             ([key, value]) => `${key}: ${value}`
//             );

//             // Optionally wrap long lines
//             const lines = doc.splitTextToSize(resultLines.join('\n'), 180);

//             // Add to PDF
//             doc.text(lines, 10, y);
//             y += lines.length * 6;

//             // Add images
//             if (r.results?.image_paths && r.results.image_paths.length > 0) {
//                 const backendUrl = 'http://localhost:8000';
//                 for (const imagePath of r.results.image_paths) {
//                     try {
//                         const imageUrl = `${backendUrl}${imagePath}`;
//                         const base64 = await getBase64ImageFromURL(imageUrl);
//                         if (y > 250) { doc.addPage(); y = 10; }
//                         doc.addImage(base64, 'PNG', 10, y, 180, 90);
//                         y += 100;
//                     } catch (err) {
//                         console.error(`Failed to load image ${imagePath}:`, err);
//                         doc.text(`(Could not load image: ${imagePath})`, 10, y);
//                         y += 10;
//                     }
//                 }

//             }

//             if (index < reports.length - 1) {
//                 doc.addPage();
//                 y = 10;
//             }
//         }

//         doc.save('data_analysis_report.pdf');
//     };


//     return (
//         <div className="p-6 max-w-4xl mx-auto">
//             <h1 className="text-2xl font-bold mb-4">Report</h1>

//             {reports.length === 0 ? (
//                 <p>No reports saved.</p>
//             ) : (
//                 <div className="space-y-4">
//                     {reports.map((r, idx) => (
//                         <div key={idx} className="border p-4 rounded bg-gray-50">
//                             <p><strong>Test Type:</strong> {r.type}</p>
//                             <p><strong>Test Added On: </strong> {new Date(r.timestamp).toLocaleString()}</p>
//                             <p><strong>Analyzed Columns:</strong> {r.columns?.join(', ')}</p>

//                             {/* Show result JSON without image paths */}
//                             <pre className="overflow-auto text-sm bg-white mt-2 p-2 rounded border max-h-64">
//                             {Object.entries(r.results)
//                                 .filter(([key]) => key !== 'success' && key !== 'image_paths')
//                                 .map(([key, value]) => `${key}: ${typeof value === 'number' ? value : JSON.stringify(value)}`)
//                                 .join('\n')}
//                             </pre>


//                             {/* Show images if available */}
//                             {r.results?.image_paths?.length > 0 && (
//                                 <>
//                                     <p className="font-semibold mt-4">Plots:</p>
//                                     <div className="flex flex-wrap gap-4 mt-2">
//                                         {r.results.image_paths.map((path, imgIdx) => {
//                                             const backendUrl = 'http://localhost:8000';
//                                             return (
//                                                 <img
//                                                 key={imgIdx}
//                                                 src={`${backendUrl}${path}`}
//                                                 alt={`Plot ${imgIdx + 1}`}
//                                                 style={{
//                                                     width: '250px',
//                                                     height: 'auto',
//                                                     borderRadius: '6px',
//                                                     border: '1px solid #ccc',
//                                                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//                                                     marginBottom: '1rem'
//                                                 }}
//                                                 />
//                                             );
//                                         })}
//                                     </div>
//                                 </>
//                             )}

//                         </div>
//                     ))}
//                 </div>
//             )}

//             <div className="mt-6 flex gap-4 flex-wrap">
//                 <button
//                     onClick={downloadReport}
//                     className="bg-green-600 text-black px-4 py-2 rounded shadow"
//                 >
//                     Download Report
//                 </button>

//                 <button
//                     onClick={clearReports}
//                     className="bg-red-600 text-black px-4 py-2 rounded shadow"
//                 >
//                     Clear Report
//                 </button>

//                 <button
//                     onClick={() => navigate('/analysis')}
//                     className="bg-blue-600 text-white px-4 py-2 rounded shadow"
//                 >
//                     Back to Analysis
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default ReportViewer;