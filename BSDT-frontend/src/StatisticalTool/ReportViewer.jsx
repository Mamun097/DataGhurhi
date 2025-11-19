import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportViewer.css';

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
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Results:', margin, y);
            y += 10;

            const { image_paths, success, ...cleanedResult } = r.results || {};
            Object.entries(cleanedResult).forEach(([key, value]) => {
                const formattedKey = key.replace(/_/g, ' ').toUpperCase();
                let formattedValue = typeof value === 'number'
                    ? Number(value).toFixed(4)
                    : typeof value === 'object'
                        ? JSON.stringify(value, null, 2)
                        : value;

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
                    try {
                        const imageUrl = `${backendUrl}${r.results.image_paths[imgIndex]}`;
                        const base64 = await getBase64ImageFromURL(imageUrl);

                        if (y > pageHeight - 120) {
                            doc.addPage();
                            y = 20;
                        }
                        doc.setFontSize(10);
                        doc.setFont(undefined, 'italic');
                        doc.text(`Chart ${imgIndex + 1}`, margin, y);
                        y += 10;
                        doc.addImage(base64, 'PNG', margin, y, 170, 100);
                        y += 115;
                    } catch (err) {
                        doc.text(`Could not load chart`, margin, y);
                        y += 15;
                    }
                }
            }
            if (index < reports.length - 1) {
                y += 10;
                doc.addPage();
                y = 20;
            }
        }

        doc.save('statistical_analysis_report.pdf');
    };

    return (
        <div className="report-viewer-page main-container">
            <div className="header-card">
                <h1 className="title">Statistical Analysis Reports</h1>
                <p className="subtitle">View and manage your data analysis results</p>
            </div>

            {reports.length === 0 ? (
                <div className="empty-box">
                    <p className="empty-title">No reports available</p>
                    <p className="empty-text">Run some statistical analyses to generate reports.</p>
                </div>
            ) : (
                <div className="reports-container">
                    {reports.map((r, idx) => (
                        <div key={idx} className="report-card">
                            <div className="report-header">
                                <h3>Analysis {idx + 1}</h3>
                            </div>

                            <div className="report-body">
                                <div className="details-box">
                                    <h4>Analysis Details</h4>
                                    <p><strong>Test Type:</strong> {r.type}</p>
                                    <p><strong>Date:</strong> {new Date(r.timestamp).toLocaleString()}</p>
                                    <p><strong>Analyzed Columns:</strong> {r.columns?.join(', ') || 'N/A'}</p>
                                </div>

                                <div className="details-box">
                                    <h4>Statistical Results</h4>
                                    {Object.entries(r.results)
                                        .filter(([key]) => key !== 'success' && key !== 'image_paths')
                                        .map(([key, value]) => (
                                            <p key={key}>
                                                <strong>{key.replace(/_/g, ' ')}:</strong>{" "}
                                                {typeof value === 'number' ? value.toFixed(4) : JSON.stringify(value)}
                                            </p>
                                        ))}
                                </div>

                                {r.results?.image_paths && (
                                    <div className="details-box">
                                        <h4>Visualizations</h4>
                                        <div className="image-grid">
                                            {r.results.image_paths.map((path, imgIdx) => (
                                                <img
                                                    key={imgIdx}
                                                    src={`http://localhost:8000${path}`}
                                                    alt="chart"
                                                    className="chart-image"
                                                    onClick={() => setSelectedImage(`http://localhost:8000${path}`)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="button-container">
                <button className="btn btn-green" onClick={downloadReport} disabled={reports.length === 0}>
                    Download PDF Report
                </button>
                <button className="btn btn-red" onClick={clearReports} disabled={reports.length === 0}>
                    Clear Reports
                </button>
                <button className="btn btn-blue" onClick={() => window.location.href='http://localhost:5173/?tab=analysis'}>
                    Back to Analysis
                </button>
            </div>

            {selectedImage && (
                <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content">
                        <img src={selectedImage} alt="enlarged" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportViewer;
