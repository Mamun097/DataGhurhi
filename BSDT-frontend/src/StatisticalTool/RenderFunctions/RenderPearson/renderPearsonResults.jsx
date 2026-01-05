import React, { useRef, useState, useEffect } from 'react';
import CustomizationOverlay from './CustomizationOverlay/CustomizationOverlay';
import HeatmapPlot from './plots/HeatmapPlot';
import GroupedBarPlot from './plots/GroupedBarPlot';
import ScatterPlot from './plots/ScatterPlot'; // NEW: Import ScatterPlot component
import {
    mapDigitIfBengali,
    formatValue,
    downloadVariableStatsPDF,
    downloadPairwiseBlockPNG,
    downloadPairwiseBlockJPG,
    downloadPairwiseBlockPDF,
    downloadAllPairwiseBlocksPDF
} from './utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './PearsonResults.css';

const renderPearsonResults = (pearsonActiveTab, setPearsonActiveTab, results, language) => {
    const blockRefs = useRef({});
    const activeTab = pearsonActiveTab;
    const setActiveTab = setPearsonActiveTab;

    const [overlayOpen, setOverlayOpen] = useState(false);
    const [currentPlotType, setCurrentPlotType] = useState('detailed');
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const [blockDownloadMenus, setBlockDownloadMenus] = useState({});
    const chartRef = useRef(null);
    
    // NEW: State for scatter plot
    const [selectedPairIndex, setSelectedPairIndex] = useState(0);
    const [scatterSettings, setScatterSettings] = useState({});

    const categoryNames = results.plot_data?.map(d => d.category) || [];
    const categoryCount = categoryNames.length;

    // NEW: Initialize scatter plot settings
    useEffect(() => {
        if (results.scatter_plot_data && results.scatter_plot_data.length > 0) {
            const firstPair = results.scatter_plot_data[0];
            const defaultSettings = getScatterDefaultSettings(firstPair);
            setScatterSettings(defaultSettings);
        }
    }, [results.scatter_plot_data]);

    const openCustomization = (plotType) => {
        setCurrentPlotType(plotType);
        setOverlayOpen(true);
    };

    const handleDownload = async (format) => {
        setDownloadMenuOpen(false);

        if (!chartRef.current) {
            alert(language === 'bn' ? 'চার্ট খুঁজে পাওয়া যায়নি' : 'Chart not found');
            return;
        }

        try {
            const canvas = await html2canvas(chartRef.current, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
            });

            if (format === 'pdf') {
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const pdf = new jsPDF({
                    orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [imgWidth, imgHeight]
                });

                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save(`${activeTab}_plot.pdf`);
            } else {
                const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
                const imgData = canvas.toDataURL(mimeType, 1.0);

                const link = document.createElement('a');
                link.download = `${activeTab}_plot.${format}`;
                link.href = imgData;
                link.click();
            }
        } catch (error) {
            console.error('Download error:', error);
            alert(language === 'bn' ? 'ডাউনলোডে ত্রুটি' : 'Error downloading image');
        }
    };

    const fontFamilyOptions = [
        { value: 'Arial', label: 'Arial' },
        { value: 'Times New Roman', label: 'Times New Roman' },
        { value: 'Courier New', label: 'Courier New' },
        { value: 'Georgia', label: 'Georgia' },
        { value: 'Verdana', label: 'Verdana' },
        { value: 'Helvetica', label: 'Helvetica' },
        { value: 'Comic Sans MS', label: 'Comic Sans MS' },
        { value: 'Trebuchet MS', label: 'Trebuchet MS' },
        { value: 'Impact', label: 'Impact' }
    ];

    // NEW: Get default settings for scatter plot
    const getScatterDefaultSettings = (pair) => {
        if (!pair) {
            return {
                dimensions: '800x600',
                fontFamily: 'Times New Roman',
                captionOn: false,
                captionText: '',
                captionSize: 22,
                captionBold: false,
                captionItalic: false,
                captionUnderline: false,
                captionTopMargin: 0,
                xAxisTitle: pair?.sample1?.name || 'Variable 1',
                yAxisTitle: pair?.sample2?.name || 'Variable 2',
                xAxisTitleSize: 16,
                yAxisTitleSize: 16,
                xAxisTitleBold: false,
                xAxisTitleItalic: false,
                xAxisTitleUnderline: false,
                yAxisTitleBold: false,
                yAxisTitleItalic: false,
                yAxisTitleUnderline: false,
                xAxisTickSize: 16,
                yAxisTickSize: 16,
                xAxisBottomMargin: -40,
                yAxisLeftMargin: 0,
                yAxisMin: 'auto',
                yAxisMax: 'auto',
                gridOn: true,
                gridStyle: '3 3',
                gridColor: 'gray',
                gridOpacity: 1.0,
                borderOn: false,
                plotBorderOn: false,
                showScatterPoints: true,
                showRegressionLines: true,
                showReferenceLine: true,
                scatterSize: 6,
                scatterOpacity: 0.7,
                scatterColor: '#3b82f6',
                regressionLineColor: '#ef4444',
                referenceLineColor: '#dc2626',
                referenceLineWidth: 2,
                referenceLineStyle: 'dashed',
                lineWidth: 2,
                legendOn: true,
                legendPosition: 'top'
            };
        }
        
        return {
            dimensions: '800x600',
            fontFamily: 'Times New Roman',
            captionOn: false,
            captionText: '',
            captionSize: 22,
            captionBold: false,
            captionItalic: false,
            captionUnderline: false,
            captionTopMargin: 0,
            xAxisTitle: pair.sample1.name,
            yAxisTitle: pair.sample2.name,
            xAxisTitleSize: 16,
            yAxisTitleSize: 16,
            xAxisTitleBold: false,
            xAxisTitleItalic: false,
            xAxisTitleUnderline: false,
            yAxisTitleBold: false,
            yAxisTitleItalic: false,
            yAxisTitleUnderline: false,
            xAxisTickSize: 16,
            yAxisTickSize: 16,
            xAxisBottomMargin: -40,
            yAxisLeftMargin: 0,
            yAxisMin: 'auto',
            yAxisMax: 'auto',
            gridOn: true,
            gridStyle: '3 3',
            gridColor: 'gray',
            gridOpacity: 1.0,
            borderOn: false,
            plotBorderOn: false,
            showScatterPoints: true,
            showRegressionLines: true,
            showReferenceLine: true,
            scatterSize: 6,
            scatterOpacity: 0.7,
            scatterColor: '#3b82f6',
            regressionLineColor: '#ef4444',
            referenceLineColor: '#dc2626',
            referenceLineWidth: 2,
            referenceLineStyle: 'dashed',
            lineWidth: 2,
            legendOn: true,
            legendPosition: 'top'
        };
    };

    const getHeatmapDefaultSettings = () => {
        return {
            dimensions: '800x600',
            fontFamily: 'Times New Roman',
            captionOn: false,
            captionText: '',
            captionSize: 22,
            captionBold: false,
            captionItalic: false,
            captionUnderline: false,
            captionTopMargin: 0,
            colorScheme: 'coolwarm',
            showValues: true,
            valueSize: 16,
            valueColor: 'white',
            cellBorderOn: true,
            cellBorderColor: '#ffffff',
            cellBorderWidth: 2,
            xAxisTitle: '',
            yAxisTitle: '',
            xAxisTitleSize: 16,
            yAxisTitleSize: 16,
            xAxisTitleBold: false,
            xAxisTitleItalic: false,
            xAxisTitleUnderline: false,
            yAxisTitleBold: false,
            yAxisTitleItalic: false,
            yAxisTitleUnderline: false,
            xAxisTickSize: 16,
            yAxisTickSize: 16,
            legendOn: true,
            legendTitle: 'Correlation',
            legendPosition: 'right',
            borderOn: false,
            metricType: 'correlation',
            gridOn: false,
            gridStyle: '3 3',
            gridColor: 'gray',
            gridOpacity: 1.0,
            plotBorderOn: false,
            barBorderOn: false,
            cellSize: results.variables.length < 5 ? 240 / results.variables.length : results.variables.length < 7 ? 50 : 40,
            errorBarsOn: false,
            elementWidth: 0.8,
            categoryLabels: categoryNames || Array(categoryCount).fill('').map((_, i) => `Category ${i + 1}`),
            categoryColors: [],
            variableLabels: results.variables || [],
            yAxisMin: '-1',
            yAxisMax: '1',
            xAxisBottomMargin: -50,
            yAxisLeftMargin: 0
        };
    };

    // Get all unique variables
    const allVariables = new Set();
    results.pairwise_results.forEach(pair => {
        if (pair && pair.variable1 && pair.variable2) {
            allVariables.add(String(pair.variable1));
            allVariables.add(String(pair.variable2));
        }
    });

    const getGroupedBarDefaultSettings = () => {
        const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

        return {
            dimensions: '800x600',
            fontFamily: 'Times New Roman',
            captionOn: false,
            captionText: '',
            captionSize: 18,
            captionBold: false,
            captionItalic: false,
            captionUnderline: false,
            captionTopMargin: 30,
            xAxisTitle: 'Variable Pairs',
            yAxisTitle: 'Correlation Coefficient',
            metricType: 'correlation',
            xAxisTitleSize: 16,
            yAxisTitleSize: 16,
            xAxisTitleBold: false,
            xAxisTitleItalic: false,
            xAxisTitleUnderline: false,
            yAxisTitleBold: false,
            yAxisTitleItalic: false,
            yAxisTitleUnderline: false,
            xAxisTickSize: 14,
            yAxisTickSize: 14,
            xAxisBottomMargin: -40,
            yAxisLeftMargin: 0,
            yAxisMin: '-1',
            yAxisMax: '1',
            gridOn: true,
            gridStyle: '3 3',
            gridColor: 'gray',
            gridOpacity: 1.0,
            borderOn: false,
            plotBorderOn: false,
            barBorderOn: false,
            dataLabelsOn: true,
            elementWidth: 0.8,
            legendOn: true,
            categoryLabels: categoryNames || Array(categoryCount).fill('').map((_, i) => `Category ${i + 1}`),
            categoryColors: defaultColors,
            variableLabels: allVariables.size > 0 ? Array.from(allVariables) : [],
            showConfidenceIntervals: true,
            confidenceIntervalColor: '#6b7280'
        };
    };

    const [heatmapSettings, setHeatmapSettings] = useState(getHeatmapDefaultSettings());
    const [groupedBarSettings, setGroupedBarSettings] = useState(getGroupedBarDefaultSettings());

    const setCurrentSettings = (settings) => {
        switch (currentPlotType) {
            case 'heatmap':
                setHeatmapSettings(settings);
                break;
            case 'grouped':
                setGroupedBarSettings(settings);
                break;
            case 'scatter':
                setScatterSettings(settings);
                break;
            default:
                break;
        }
    };

    if (!results) {
        return <p>{language === 'bn' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
    }

    const t = (en, bn) => (language === 'bn' ? bn : en);
    const fmt = (v, digits = 4) => formatValue(v, digits, language);
    const mapDigit = (text) => mapDigitIfBengali(text, language);

    // Calculate significant correlations
    const significantCount = results.pairwise_results ? 
        results.pairwise_results.filter(r => r.p_value !== null && r.p_value < 0.05).length : 0;
    const totalComparisons = results.n_comparisons || 0;
    const strongCorrelations = results.pairwise_results ? 
        results.pairwise_results.filter(r => r.correlation !== null && Math.abs(r.correlation) >= 0.7).length : 0;
    const moderateCorrelations = results.pairwise_results ? 
        results.pairwise_results.filter(r => r.correlation !== null && Math.abs(r.correlation) >= 0.3 && Math.abs(r.correlation) < 0.7).length : 0;

    // Generate insight message
    const getInsightMessage = () => {
        const significanceRate = totalComparisons > 0 ? (significantCount / totalComparisons * 100).toFixed(1) : 0;

        if (language === 'bn') {
            if (significantCount === 0) {
                return 'কোনো ভেরিয়েবল জোড়ার মধ্যে উল্লেখযোগ্য রৈখিক সম্পর্ক পাওয়া যায়নি (p ≥ 0.05)।';
            } else {
                let strengthMsg = '';
                if (strongCorrelations > 0) {
                    strengthMsg = ` ${strongCorrelations}টি শক্তিশালী সম্পর্ক (|r| ≥ 0.7)`;
                }
                if (moderateCorrelations > 0) {
                    strengthMsg += strengthMsg ? `, ${moderateCorrelations}টি মধ্যম সম্পর্ক` : ` ${moderateCorrelations}টি মধ্যম সম্পর্ক`;
                }
                
                return `${significantCount}টি ভেরিয়েবল জোড়ায় (মোট ${totalComparisons}টির মধ্যে ${mapDigit(significanceRate)}%) উল্লেখযোগ্য রৈখিক সম্পর্ক পাওয়া গেছে (p < 0.05)।${strengthMsg}।`;
            }
        } else {
            if (significantCount === 0) {
                return 'No significant linear correlations found between any variable pairs (p ≥ 0.05).';
            } else {
                let strengthMsg = '';
                if (strongCorrelations > 0) {
                    strengthMsg = ` ${strongCorrelations} strong correlations (|r| ≥ 0.7)`;
                }
                if (moderateCorrelations > 0) {
                    strengthMsg += strengthMsg ? `, ${moderateCorrelations} moderate correlations` : ` ${moderateCorrelations} moderate correlations`;
                }
                
                return `${significantCount} out of ${totalComparisons} variable pairs (${significanceRate}%) show significant linear correlations (p < 0.05), including${strengthMsg}.`;
            }
        }
    };

    // Add sticky tab functionality
    const [isSticky, setIsSticky] = useState(false);
    const [containerWidth, setContainerWidth] = useState('auto');
    const tabContainerRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (tabContainerRef.current) {
                const tabPosition = tabContainerRef.current.offsetTop;
                const parentWidth = tabContainerRef.current.parentElement.offsetWidth;

                if (window.scrollY > (tabPosition - 60)) {
                    setIsSticky(true);
                    setContainerWidth(`${parentWidth}px`);
                } else {
                    setIsSticky(false);
                    setContainerWidth('auto');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.block-actions')) {
                setBlockDownloadMenus({});
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to interpret correlation strength
    const getCorrelationStrength = (corr) => {
        if (corr === null) return '';
        const absCorr = Math.abs(corr);
        if (absCorr >= 0.9) return t('Very Strong', 'অত্যন্ত শক্তিশালী');
        if (absCorr >= 0.7) return t('Strong', 'শক্তিশালী');
        if (absCorr >= 0.5) return t('Moderate', 'মধ্যম');
        if (absCorr >= 0.3) return t('Weak', 'দুর্বল');
        return t('Very Weak', 'অত্যন্ত দুর্বল');
    };

    // NEW: Handle scatter pair selection
    const handleScatterPairChange = (index) => {
        setSelectedPairIndex(index);
        const pair = results.scatter_plot_data[index];
        const newSettings = getScatterDefaultSettings(pair);
        setScatterSettings(newSettings);
    };

    return (
        <>
            <h2 className="pearson-title">
                {t('Pearson Correlation Results', 'পিয়ারসন সম্পর্ক পরীক্ষার ফলাফল')}
            </h2>

            {/* Summary Statistics Table */}
            <div className="stats-results-table-wrapper">
                <table className="stats-results-table">
                    <thead>
                        <tr>
                            <th>{t('Description', 'বিবরণ')}</th>
                            <th>{t('Value', 'মান')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="stats-table-label">{t('Variables', 'ভেরিয়েবলসমূহ')}</td>
                            <td className="stats-table-value">
                                {results.variables && results.variables.map((v, i) => (
                                    <span key={i}>
                                        {mapDigit(v)}
                                        {i < results.variables.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t('Number of Variables', 'ভেরিয়েবলের সংখ্যা')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.n_variables || 0)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t('Total Comparisons', 'মোট তুলনা')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(totalComparisons)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t('Significant Correlations', 'উল্লেখযোগ্য সম্পর্ক')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(significantCount)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t('Strong Correlations (|r| ≥ 0.7)', 'শক্তিশালী সম্পর্ক')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(strongCorrelations)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t('Total Observations', 'মোট পর্যবেক্ষণ')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(results.metadata?.total_observations || 0)}</td>
                        </tr>
                        <tr className="stats-conclusion-row">
                            <td className="stats-table-label">{t('Insight', 'অন্তর্দৃষ্টি')}</td>
                            <td className="stats-table-value">
                                <div className="stats-conclusion-inline">
                                    {significantCount > 0 ? (
                                        <>
                                            <svg className="stats-conclusion-icon" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="stats-conclusion-text significant">{getInsightMessage()}</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="stats-conclusion-icon" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="stats-conclusion-text not-significant">{getInsightMessage()}</span>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Tabbed Section */}
            <div className="stats-viz-section">
                <h3 className="stats-viz-header">
                    {t('Detailed Analysis & Visualizations', 'বিস্তারিত বিশ্লেষণ এবং ভিজ্যুয়ালাইজেশন')}
                </h3>

                {/* Tab Navigation */}
                <div
                    ref={tabContainerRef}
                    className="stats-tab-container"
                    style={{
                        position: isSticky ? 'fixed' : 'relative',
                        top: isSticky ? '105px' : 'auto',
                        left: isSticky ? 'auto' : 'auto',
                        right: isSticky ? 'auto' : 'auto',
                        width: isSticky ? containerWidth : 'auto',
                        zIndex: 100,
                        backgroundColor: 'white',
                        padding: '0',
                        boxShadow: isSticky ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                        transition: 'all 0.1s ease'
                    }}
                >
                    <button
                        className={`stats-tab ${activeTab === 'detailed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('detailed')}
                    >
                        {t('Detailed Result', 'বিস্তারিত বিশ্লেষণ')}
                    </button>
                    <button
                        className={`stats-tab ${activeTab === 'heatmap' ? 'active' : ''}`}
                        onClick={() => setActiveTab('heatmap')}
                    >
                        {t('Heatmap', 'হিটম্যাপ')}
                    </button>
                    <button
                        className={`stats-tab ${activeTab === 'grouped' ? 'active' : ''}`}
                        onClick={() => setActiveTab('grouped')}
                    >
                        {t('Grouped Bar', 'গ্রুপড বার')}
                    </button>
                    {/* NEW: Scatter Plot Tab */}
                    <button
                        className={`stats-tab ${activeTab === 'scatter' ? 'active' : ''}`}
                        onClick={() => setActiveTab('scatter')}
                        disabled={!results.scatter_plot_data || results.scatter_plot_data.length === 0}
                    >
                        {t('Scatter Plot', 'স্ক্যাটার প্লট')}
                    </button>
                </div>

                {/* Detailed Analysis Tab */}
                {activeTab === 'detailed' && (
                    <div className="stats-plot-wrapper active">
                        {/* Variable Statistics Section */}
                        {results.variable_stats && results.variable_stats.length > 0 && (
                            <div className="variable-stats-section">
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '10px'
                                    }}>
                                        <h4 className="section-title" style={{
                                            marginBottom: '0',
                                            borderBottom: 'none'
                                        }}>
                                            {t('Variable Statistics', 'ভেরিয়েবল পরিসংখ্যান')}
                                        </h4>
                                        <button
                                            className="customize-btn"
                                            onClick={() => downloadVariableStatsPDF(results, language)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                            </svg>
                                            {t('Download All', 'সব ডাউনলোড করুন')}
                                        </button>
                                    </div>
                                    <div style={{
                                        height: '2px',
                                        backgroundColor: '#1e40af',
                                        width: '100%'
                                    }}></div>
                                </div>

                                <div className="variable-stats-grid">
                                    {results.variable_stats.map((varStat, idx) => (
                                        <div key={idx} className="variable-stat-card">
                                            <h4 className="variable-stat-title">
                                                {mapDigit(varStat.variable)}
                                            </h4>

                                            <div className="variable-stat-content">
                                                <div className="stat-row">
                                                    <span>{t('Observations:', 'পর্যবেক্ষণ:')}</span>
                                                    <span className="stat-value observations">
                                                        {mapDigit(varStat.n_observations)}
                                                    </span>
                                                </div>
                                                <div className="stat-row">
                                                    <span>{t('Missing:', 'অনুপস্থিত:')}</span>
                                                    <span className="stat-value missing">
                                                        {mapDigit(varStat.n_missing)}
                                                    </span>
                                                </div>
                                                {varStat.mean !== null && (
                                                    <>
                                                        <div className="stat-row">
                                                            <span>{t('Mean:', 'গড়:')}</span>
                                                            <span className="stat-value mean">
                                                                {fmt(varStat.mean)}
                                                            </span>
                                                        </div>
                                                        <div className="stat-row">
                                                            <span>{t('Std Dev:', 'মানক বিচ্যুতি:')}</span>
                                                            <span className="stat-value std">
                                                                {fmt(varStat.std)}
                                                            </span>
                                                        </div>
                                                        <div className="stat-row">
                                                            <span>{t('Median:', 'মধ্যমা:')}</span>
                                                            <span className="stat-value median">
                                                                {fmt(varStat.median)}
                                                            </span>
                                                        </div>
                                                        <div className="stat-row">
                                                            <span>{t('Range:', 'পরিসর:')}</span>
                                                            <span className="stat-value range">
                                                                {fmt(varStat.min)} - {fmt(varStat.max)}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pairwise Comparisons Section */}
                        {results.blocks && results.blocks.length > 0 && (
                            <div>
                                <div style={{ marginBottom: '20px' }}>
                                    <div className="pairwise-header">
                                        <div>
                                            <h4 className="section-title" style={{
                                                marginBottom: '0',
                                                borderBottom: 'none'
                                            }}>
                                                {t('Pairwise Correlations', 'জোড়াভিত্তিক সম্পর্ক')}
                                            </h4>
                                            <p className="section-description">
                                                {t('Detailed Pearson correlation results for each variable pair',
                                                    'প্রতিটি ভেরিয়েবল জোড়ার জন্য বিস্তারিত পিয়ারসন সম্পর্ক ফলাফল')}
                                            </p>
                                        </div>
                                        <button
                                            className="customize-btn" 
                                            onClick={() => downloadAllPairwiseBlocksPDF(results, blockRefs)}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                            </svg>
                                            {t('Download All', 'সব ডাউনলোড করুন')}
                                        </button>
                                    </div>
                                    <div style={{
                                        height: '2px',
                                        backgroundColor: '#1e40af',
                                        width: '100%',
                                        marginTop: '10px'
                                    }}></div>
                                </div>

                                <div className="blocks-grid">
                                    {results.blocks.map((block, i) => (
                                        <div
                                            key={i}
                                            className="block-card"
                                            ref={(el) => { blockRefs.current[block.anchor] = el; }}
                                        >
                                            {/* Card Header */}
                                            <div className="block-header">
                                                <div className="block-header-content">
                                                    <div className="block-header-info">
                                                        <div className="block-icon" style={{ backgroundColor: '#1e40af' }}>
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                                <path d="M20 20L14 14M14 14L4 4M14 14L20 4M14 14L4 20"/>
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 className="block-title">
                                                                {mapDigit(block.anchor)}
                                                            </h3>
                                                            <p className="block-subtitle">
                                                                {t('Reference Variable', 'রেফারেন্স ভেরিয়েবল')}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="block-actions">
                                                        <div style={{ position: 'relative' }}>
                                                            <button className="customize-btn" onClick={() => setBlockDownloadMenus(prev => ({
                                                                ...prev,
                                                                [block.anchor]: !prev[block.anchor]
                                                            }))}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                                                </svg>
                                                            </button>

                                                            {blockDownloadMenus[block.anchor] && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '100%',
                                                                    right: 0,
                                                                    marginTop: '8px',
                                                                    background: 'white',
                                                                    border: '2px solid #e5e7eb',
                                                                    borderRadius: '12px',
                                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                                    overflow: 'hidden',
                                                                    zIndex: 100,
                                                                    minWidth: '120px'
                                                                }}>
                                                                    {[
                                                                        { label: 'PNG', handler: () => downloadPairwiseBlockPNG(block.anchor, blockRefs) },
                                                                        { label: 'JPG', handler: () => downloadPairwiseBlockJPG(block.anchor, blockRefs) },
                                                                        { label: 'PDF', handler: () => downloadPairwiseBlockPDF(block.anchor, blockRefs) }
                                                                    ].map((format, idx) => (
                                                                        <button
                                                                            key={format.label}
                                                                            onClick={() => {
                                                                                format.handler();
                                                                                setBlockDownloadMenus(prev => ({ ...prev, [block.anchor]: false }));
                                                                            }}
                                                                            style={{
                                                                                width: '100%',
                                                                                padding: '10px 16px',
                                                                                border: 'none',
                                                                                background: 'white',
                                                                                color: '#374151',
                                                                                fontSize: '13px',
                                                                                fontWeight: '500',
                                                                                cursor: 'pointer',
                                                                                textAlign: 'left',
                                                                                transition: 'all 0.2s',
                                                                                borderBottom: idx < 2 ? '1px solid #f3f4f6' : 'none'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.currentTarget.style.background = '#f9fafb';
                                                                                e.currentTarget.style.paddingLeft = '20px';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.currentTarget.style.background = 'white';
                                                                                e.currentTarget.style.paddingLeft = '16px';
                                                                            }}
                                                                        >
                                                                            {format.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="block-info-box">
                                                    <p>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <line x1="12" y1="16" x2="12" y2="12"></line>
                                                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                                        </svg>
                                                        {t('Testing linear correlations with other variables • Significance level α = 0.05',
                                                            'অন্যান্য ভেরিয়েবলের সাথে রৈখিক সম্পর্ক পরীক্ষা • তাৎপর্য স্তর α = 0.05')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Table Content */}
                                            <div className="block-table-container">
                                                <div className="block-table-scroll">
                                                    <table className="block-table">
                                                        <thead>
                                                            <tr>
                                                                {results.table_columns && results.table_columns.filter(c => c.key !== 'variable1').map((col, idx) => (
                                                                    <th key={col.key}>
                                                                        {mapDigit(col.label)}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {block.results && block.results.map((row, rIdx) => (
                                                                <tr key={rIdx}>
                                                                    <td className="variable-cell">
                                                                        <div className="variable-cell-content">
                                                                            <div className={`status-dot ${row.p_value !== null && row.p_value < 0.05 ? 'significant' : ''}`}></div>
                                                                            {mapDigit(row.variable2)}
                                                                        </div>
                                                                    </td>
                                                                    <td className="numeric-cell">
                                                                        <div className="correlation-cell">
                                                                            {fmt(row.correlation)}
                                                                            {row.correlation !== null && (
                                                                                <span className="correlation-strength">
                                                                                    ({getCorrelationStrength(row.correlation)})
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className={`badge ${row.p_value !== null && row.p_value < 0.05 ? 'significant' : 'not-significant'}`}>
                                                                            {fmt(row.p_value)}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className={`badge ${row.p_adjusted && row.p_adjusted < 0.05 ? 'adjusted-significant' : 'adjusted-not-significant'}`}>
                                                                            {fmt(row.p_adjusted)}
                                                                        </div>
                                                                    </td>
                                                                    <td className="numeric-cell confidence-interval">
                                                                        {row.ci_lower !== null && row.ci_upper !== null ? (
                                                                            `${fmt(row.ci_lower)} - ${fmt(row.ci_upper)}`
                                                                        ) : 'N/A'}
                                                                    </td>
                                                                    <td className="numeric-cell centered">
                                                                        {fmt(row.n, 0)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="block-footer">
                                                <div className="block-stats">
                                                    <div className="block-stat-item">
                                                        <div className="status-dot significant"></div>
                                                        <span>
                                                            {t('Significant', 'উল্লেখযোগ্য')}: <strong>
                                                                {mapDigit(block.results.filter(r => r.p_value !== null && r.p_value < 0.05).length)}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                    <div className="block-stat-item">
                                                        <div className="status-dot"></div>
                                                        <span>
                                                            {t('Not Significant', 'অ-উল্লেখযোগ্য')}: <strong>
                                                                {mapDigit(block.results.filter(r => r.p_value === null || r.p_value >= 0.05).length)}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="block-total">
                                                    {t('Total comparisons', 'মোট তুলনা')}: {mapDigit(block.results.length)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Heatmap Tab */}
                {activeTab === 'heatmap' && (
                    <div className="stats-plot-wrapper active">
                        <HeatmapPlot
                            results={results}
                            language={language}
                            settings={heatmapSettings}
                            onSettingsChange={setHeatmapSettings}
                            openCustomization={openCustomization}
                            handleDownload={handleDownload}
                            downloadMenuOpen={downloadMenuOpen}
                            setDownloadMenuOpen={setDownloadMenuOpen}
                            chartRef={chartRef}
                        />
                    </div>
                )}

                {/* Grouped Bar Tab */}
                {activeTab === 'grouped' && (
                    <div className="stats-plot-wrapper active">
                        <GroupedBarPlot
                            results={results}
                            language={language}
                            settings={groupedBarSettings}
                            onSettingsChange={setGroupedBarSettings}
                            openCustomization={openCustomization}
                            handleDownload={handleDownload}
                            downloadMenuOpen={downloadMenuOpen}
                            setDownloadMenuOpen={setDownloadMenuOpen}
                            chartRef={chartRef}
                        />
                    </div>
                )}

                {/* NEW: Scatter Plot Tab */}
                {activeTab === 'scatter' && results.scatter_plot_data && results.scatter_plot_data.length > 0 && (
                    <div className="stats-plot-wrapper active">
                        <ScatterPlot
                            results={results}
                            language={language}
                            settings={scatterSettings}
                            onSettingsChange={setScatterSettings}
                            openCustomization={openCustomization}
                            handleDownload={handleDownload}
                            downloadMenuOpen={downloadMenuOpen}
                            setDownloadMenuOpen={setDownloadMenuOpen}
                            chartRef={chartRef}
                            selectedPairIndex={selectedPairIndex}
                            onPairChange={handleScatterPairChange}
                            activeTab={activeTab}
                        />
                    </div>
                )}

                <CustomizationOverlay
                    isOpen={overlayOpen}
                    onClose={() => setOverlayOpen(false)}
                    plotType={
                        currentPlotType === 'heatmap' ? 'Heatmap' :
                        currentPlotType === 'grouped' ? 'Grouped Bar' :
                        currentPlotType === 'scatter' ? 'Scatter' : 'Heatmap'
                    }
                    settings={
                        currentPlotType === 'heatmap' ? heatmapSettings :
                        currentPlotType === 'grouped' ? groupedBarSettings :
                        currentPlotType === 'scatter' ? scatterSettings : heatmapSettings
                    }
                    onSettingsChange={
                        currentPlotType === 'heatmap' ? setHeatmapSettings :
                        currentPlotType === 'grouped' ? setGroupedBarSettings :
                        currentPlotType === 'scatter' ? setScatterSettings : setHeatmapSettings
                    }
                    language={language === 'bn' ? 'বাংলা' : 'English'}
                    fontFamilyOptions={fontFamilyOptions}
                    getDefaultSettings={() =>
                        currentPlotType === 'heatmap' ? getHeatmapDefaultSettings() :
                        currentPlotType === 'grouped' ? getGroupedBarDefaultSettings() :
                        currentPlotType === 'scatter' ? () => getScatterDefaultSettings(results.scatter_plot_data[selectedPairIndex]) : getHeatmapDefaultSettings()
                    }
                    results={results}
                />
            </div>
        </>
    );
}

export default renderPearsonResults;