import React, { useRef, useState, useEffect } from 'react';
import CustomizationOverlay from './CustomizationOverlay/CustomizationOverlay';
import HeatmapPlot from './plots/HeatmapPlot';
import MosaicPlot from './plots/MosaicPlot';
import StackedBarPlot from './plots/StackedBarPlot';
import GroupedBarPlot from './plots/GroupedBarPlot';
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
import './CrossTabulationResults.css';

const renderCrossTabulationResults = (crossTabActiveTab, setCrossTabActiveTab, results, language) => {
    const blockRefs = useRef({});
    const activeTab = crossTabActiveTab;
    const setActiveTab = setCrossTabActiveTab;

    const [overlayOpen, setOverlayOpen] = useState(false);
    const [currentPlotType, setCurrentPlotType] = useState('detailed');
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const [blockDownloadMenus, setBlockDownloadMenus] = useState({});
    const chartRef = useRef(null);

    const categoryNames = results.variables || [];
    const categoryCount = categoryNames.length;

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

    const getHeatmapDefaultSettings = () => {
        const variablesLength = results?.variables?.length || 0;
        
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
            colorScheme: 'blues',
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
            legendTitle: 'Frequency',
            legendPosition: 'right',
            borderOn: false,
            metricType: 'frequency',
            gridOn: false,
            gridStyle: '3 3',
            gridColor: 'gray',
            gridOpacity: 1.0,
            plotBorderOn: false,
            barBorderOn: false,
            cellSize: variablesLength < 5 ? 240 / Math.max(variablesLength, 1) : variablesLength < 7 ? 50 : 40,
            errorBarsOn: false,
            elementWidth: 0.8,
            categoryLabels: categoryNames || Array(categoryCount).fill('').map((_, i) => `Category ${i + 1}`),
            categoryColors: [],
            variableLabels: results?.variables || [],
            yAxisMin: '',
            yAxisMax: '',
            xAxisBottomMargin: -50,
            yAxisLeftMargin: 0
        };
    };

    // Get all unique variables
    const allVariables = new Set();
    results.pairwise_results?.forEach(pair => {
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
            xAxisTitle: 'Variables',
            yAxisTitle: 'Frequency',
            metricType: 'frequency',
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
            yAxisMin: '',
            yAxisMax: '',
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
            variableLabels: allVariables.size > 0 ? Array.from(allVariables) : []
        };
    };

    const getMosaicDefaultSettings = () => {
        const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

        return {
            dimensions: '800x600',
            fontFamily: 'Times New Roman',
            captionOn: false,
            captionText: '',
            captionSize: 22,
            captionBold: false,
            captionItalic: false,
            captionUnderline: false,
            captionTopMargin: 30,
            colorScheme: 'categorical',
            showLabels: true,
            labelSize: 18,
            showPercentages: true,
            percentageSize: 11,
            showCounts: false,
            countSize: 10,
            cellBorderOn: true,
            cellBorderColor: '#ffffff',
            cellBorderWidth: 2,
            variableLabelSize: 14,
            variableLabelBold: true,
            categoryLabelSize: 18,
            highlightSignificant: true,
            significanceAlpha: 0.05,
            legendOn: true,
            legendPosition: 'right',
            legendTitle: 'Categories',
            borderOn: false,
            selectedPair: null,
            categoryColors: [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
                '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
                '#06b6d4', '#84cc16', '#f43f5e', '#a855f7'
            ],
            marginTop: 80,
            marginBottom: 60,
            marginLeft: 100,
            marginRight: 100,
            spacingBetweenVariables: 20,
            xAxisTickSize: 16,
        };
    };

    const getStackedBarDefaultSettings = () => {
        const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

        return {
            dimensions: '800x600',
            fontFamily: 'Times New Roman',
            captionOn: false,
            captionText: '',
            captionSize: 22,
            captionBold: false,
            captionItalic: false,
            captionUnderline: false,
            captionTopMargin: 30,
            xAxisTitle: 'Groups',
            yAxisTitle: 'Proportion (%)',
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
            xAxisBottomMargin: 0,
            yAxisLeftMargin: 0,
            yAxisMin: '0',
            yAxisMax: '100',
            gridOn: true,
            gridStyle: '3 3',
            gridColor: 'gray',
            gridOpacity: 1.0,
            borderOn: true,
            plotBorderOn: false,
            barBorderOn: false,
            dataLabelsOn: true,
            labelType: 'percentage',
            labelSize: 11,
            labelColor: 'white',
            labelBold: true,
            barWidth: 0.7,
            elementWidth: 0.7,
            legendOn: true,
            legendPosition: 'top',
            legendTitle: 'Categories',
            colorScheme: 'categorical',
            categoryColors: defaultColors,
            variableLabels: [],
            orientation: 'vertical',
            stackMode: 'percentage',
            showBaseline: true,
            baselineColor: '#1f2937',
            baselineWidth: 2,
            selectedPair: null,
            animationDuration: 500,
            barRadius: 0,
            showGridHorizontal: true,
            showGridVertical: false,
            categoryLabels: []
        };
    };

    const [heatmapSettings, setHeatmapSettings] = useState(getHeatmapDefaultSettings());
    const [groupedBarSettings, setGroupedBarSettings] = useState(getGroupedBarDefaultSettings());
    const [mosaicSettings, setMosaicSettings] = useState(getMosaicDefaultSettings());
    const [stackedBarSettings, setStackedBarSettings] = useState(getStackedBarDefaultSettings());

    const setCurrentSettings = (settings) => {
        switch (currentPlotType) {
            case 'heatmap':
                setHeatmapSettings(settings);
                break;
            case 'grouped':
                setGroupedBarSettings(settings);
                break;
            case 'mosaic':
                setMosaicSettings(settings);
                break;
            case 'stacked':
                setStackedBarSettings(settings);
                break;
            default:
                break;
        }
    };

    if (!results) {
        return <p>{language === 'bn' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
    }

    const t = (en, bn) => (language === 'bn' ? bn : en);
    const fmt = (v, digits = 6) => formatValue(v, digits, language);
    const mapDigit = (text) => mapDigitIfBengali(text, language);

    // Calculate summary statistics for cross-tabulation
    const totalComparisons = results.n_comparisons || 0;
    const totalObservations = results.metadata?.total_observations || 0;
    
    // Calculate total frequencies across all comparisons
    const totalFrequencies = results.pairwise_results?.reduce((sum, pair) => sum + (pair.n || 0), 0) || 0;

    // Generate insight message for cross-tabulation
    const getInsightMessage = () => {
        if (language === 'bn') {
            return `${totalComparisons}টি ভেরিয়েবল জোড়ার মধ্যে ক্রস-ট্যাবুলেশন বিশ্লেষণ সম্পন্ন হয়েছে। মোট ${mapDigit(totalObservations)}টি পর্যবেক্ষণ বিশ্লেষণে অন্তর্ভুক্ত।`;
        } else {
            return `Cross-tabulation analysis completed for ${totalComparisons} variable pairs. Total of ${totalObservations} observations analyzed.`;
        }
    };

    // Add this inside your component
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

    // Helper function to render contingency table for cross-tabulation
    const renderContingencyTable = (result, showPercentages = false) => {
        if (!result.contingency_table || !result.categories_var1 || !result.categories_var2) {
            return <div className="no-data-message">{t('No data available', 'কোন ডেটা পাওয়া যায়নি')}</div>;
        }

        const data = showPercentages ? result.row_percentages : result.contingency_table;
        const suffix = showPercentages ? '%' : '';

        return (
            <div className="contingency-table-container">
                <table className="contingency-table">
                    <thead>
                        <tr>
                            <th>{result.variable1} × {result.variable2}</th>
                            {result.categories_var2.map((category, idx) => (
                                <th key={idx}>{mapDigit(category)}</th>
                            ))}
                            {result.margins_row && <th>{t('Total', 'মোট')}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {result.categories_var1.map((rowCategory, rowIdx) => (
                            <tr key={rowIdx}>
                                <td className="row-header">{mapDigit(rowCategory)}</td>
                                {result.categories_var2.map((colCategory, colIdx) => (
                                    <td key={colIdx} className="numeric-cell">
                                        {showPercentages ? 
                                            fmt(data[rowIdx][colIdx], 1) + suffix : 
                                            mapDigit(data[rowIdx][colIdx])
                                        }
                                    </td>
                                ))}
                                {result.margins_row && (
                                    <td className="total-cell">
                                        {mapDigit(result.margins_row[rowIdx])}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {result.margins_col && (
                            <tr className="totals-row">
                                <td className="total-header">{t('Total', 'মোট')}</td>
                                {result.margins_col.map((total, idx) => (
                                    <td key={idx} className="total-cell">
                                        {mapDigit(total)}
                                    </td>
                                ))}
                                <td className="grand-total">
                                    {mapDigit(result.n)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="table-footer">
                    <span className="table-type">
                        {showPercentages ? t('Row Percentages', 'সারি শতকরা') : t('Frequency Counts', 'ফ্রিকোয়েন্সি গণনা')}
                    </span>
                </div>
            </div>
        );
    };

    // Render summary statistics for each pairwise result
    const renderPairwiseSummary = (result) => {
        if (!result.summary_stats) return null;

        const stats = result.summary_stats;
        
        return (
            <div className="pairwise-summary">
                <div className="summary-stats-grid">
                    <div className="summary-stat">
                        <span className="stat-label">{t('Total Observations', 'মোট পর্যবেক্ষণ')}:</span>
                        <span className="stat-value">{mapDigit(stats.total_observations)}</span>
                    </div>
                    <div className="summary-stat">
                        <span className="stat-label">{t('Categories', 'শ্রেণী')}:</span>
                        <span className="stat-value">{mapDigit(stats.n_categories_var1)} × {mapDigit(stats.n_categories_var2)}</span>
                    </div>
                    {stats.most_frequent && (
                        <div className="summary-stat">
                            <span className="stat-label">{t('Most Frequent', 'সবচেয়ে ঘন ঘন')}:</span>
                            <span className="stat-value">
                                {mapDigit(stats.most_frequent.category1)} × {mapDigit(stats.most_frequent.category2)} 
                                ({mapDigit(stats.most_frequent.count)})
                            </span>
                        </div>
                    )}
                    {stats.least_frequent && (
                        <div className="summary-stat">
                            <span className="stat-label">{t('Least Frequent', 'সবচেয়ে কম ঘন ঘন')}:</span>
                            <span className="stat-value">
                                {mapDigit(stats.least_frequent.category1)} × {mapDigit(stats.least_frequent.category2)} 
                                ({mapDigit(stats.least_frequent.count)})
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <h2 className="cross-tab-title">
                {t('Cross-Tabulation Analysis', 'ক্রস-ট্যাবুলেশন বিশ্লেষণ')}
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
                            <td className="stats-table-label">{t('Total Observations', 'মোট পর্যবেক্ষণ')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(totalObservations)}</td>
                        </tr>
                        <tr>
                            <td className="stats-table-label">{t('Total Frequencies', 'মোট ফ্রিকোয়েন্সি')}</td>
                            <td className="stats-table-value stats-numeric">{mapDigit(totalFrequencies)}</td>
                        </tr>
                        <tr className="stats-conclusion-row">
                            <td className="stats-table-label">{t('Insight', 'অন্তর্দৃষ্টি')}</td>
                            <td className="stats-table-value">
                                <div className="stats-conclusion-inline">
                                    <svg className="stats-conclusion-icon" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="stats-conclusion-text significant">{getInsightMessage()}</span>
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
                        className={`stats-tab ${activeTab === 'mosaic' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mosaic')}
                    >
                        {t('Mosaic Plot', 'মোজাইক প্লট')}
                    </button>
                    <button
                        className={`stats-tab ${activeTab === 'grouped' ? 'active' : ''}`}
                        onClick={() => setActiveTab('grouped')}
                    >
                        {t('Grouped Bar', 'গ্রুপড বার')}
                    </button>
                    <button
                        className={`stats-tab ${activeTab === 'stacked' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stacked')}
                    >
                        {t('Stacked Bar', 'স্ট্যাকড বার')}
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
                                        backgroundColor: '#046060',
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
                                                    <span>{t('Categories:', 'শ্রেণীর সংখ্যা:')}</span>
                                                    <span className="stat-value categories">
                                                        {mapDigit(varStat.n_categories)}
                                                    </span>
                                                </div>
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

                                                <div className="distribution-section">
                                                    <p className="distribution-title">
                                                        {t('Distribution:', 'বিতরণ:')}
                                                    </p>
                                                    <div className="distribution-list">
                                                        {varStat.categories.map((cat, catIdx) => (
                                                            <div key={catIdx} className="distribution-item">
                                                                <span className="category-name">
                                                                    {mapDigit(cat)}
                                                                </span>
                                                                <span className="category-value">
                                                                    {mapDigit(varStat.frequencies[catIdx])}
                                                                    ({mapDigit(varStat.percentages[catIdx].toFixed(1))}%)
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pairwise Cross-Tabulations Section */}
                        {results.blocks && results.blocks.length > 0 && (
                            <div>
                                <div style={{ marginBottom: '20px' }}>
                                    <div className="pairwise-header">
                                        <div>
                                            <h4 className="section-title" style={{
                                                marginBottom: '0',
                                                borderBottom: 'none'
                                            }}>
                                                {t('Pairwise Cross-Tabulations', 'জোড়াভিত্তিক ক্রস-ট্যাবুলেশন')}
                                            </h4>
                                            <p className="section-description">
                                                {t('Detailed frequency distributions for each variable pair',
                                                    'প্রতিটি ভেরিয়েবল জোড়ার জন্য বিস্তারিত ফ্রিকোয়েন্সি বিতরণ')}
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
                                        backgroundColor: '#046060',
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
                                                        <div className="block-icon">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                                <rect x="3" y="3" width="7" height="7"></rect>
                                                                <rect x="14" y="3" width="7" height="7"></rect>
                                                                <rect x="14" y="14" width="7" height="7"></rect>
                                                                <rect x="3" y="14" width="7" height="7"></rect>
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
                                                        {t('Frequency distributions with other variables • Includes row and column percentages',
                                                            'অন্যান্য ভেরিয়েবলের সাথে ফ্রিকোয়েন্সি বিতরণ • সারি এবং কলাম শতকরা অন্তর্ভুক্ত')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Cross-tabulation Content */}
                                            <div className="block-content">
                                                {block.results && block.results.map((result, rIdx) => (
                                                    <div key={rIdx} className="cross-tab-result">
                                                        <div className="cross-tab-header">
                                                            <h4 className="cross-tab-title">
                                                                {mapDigit(result.variable1)} × {mapDigit(result.variable2)}
                                                            </h4>
                                                            <div className="cross-tab-stats">
                                                                <span className="stat-badge">
                                                                    {t('Total:', 'মোট:')} {mapDigit(result.n)}
                                                                </span>
                                                                <span className="stat-badge">
                                                                    {result.categories_var1?.length || 0} × {result.categories_var2?.length || 0} {t('categories', 'শ্রেণী')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Summary Statistics */}
                                                        {renderPairwiseSummary(result)}

                                                        {/* Frequency Table */}
                                                        <div className="table-section">
                                                            <h5 className="table-section-title">
                                                                {t('Frequency Counts', 'ফ্রিকোয়েন্সি গণনা')}
                                                            </h5>
                                                            {renderContingencyTable(result, false)}
                                                        </div>

                                                        {/* Row Percentages Table */}
                                                        <div className="table-section">
                                                            <h5 className="table-section-title">
                                                                {t('Row Percentages', 'সারি শতকরা')}
                                                            </h5>
                                                            {renderContingencyTable(result, true)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            <div className="block-footer">
                                                <div className="block-stats">
                                                    <div className="block-stat-item">
                                                        <span>
                                                            {t('Total comparisons', 'মোট তুলনা')}: <strong>
                                                                {mapDigit(block.results.length)}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                    <div className="block-stat-item">
                                                        <span>
                                                            {t('Total observations', 'মোট পর্যবেক্ষণ')}: <strong>
                                                                {mapDigit(block.results.reduce((sum, r) => sum + (r.n || 0), 0))}
                                                            </strong>
                                                        </span>
                                                    </div>
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

                {/* Other Plot Tabs */}
                {activeTab === 'mosaic' && (
                    <div className="stats-plot-wrapper active">
                        <MosaicPlot
                            results={results}
                            language={language}
                            settings={mosaicSettings}
                            onSettingsChange={setMosaicSettings}
                            openCustomization={openCustomization}
                            handleDownload={handleDownload}
                            downloadMenuOpen={downloadMenuOpen}
                            setDownloadMenuOpen={setDownloadMenuOpen}
                            chartRef={chartRef}
                        />
                    </div>
                )}

                {activeTab === 'stacked' && (
                    <div className="stats-plot-wrapper active">
                        <StackedBarPlot
                            results={results}
                            language={language}
                            settings={stackedBarSettings}
                            onSettingsChange={setStackedBarSettings}
                            openCustomization={openCustomization}
                            handleDownload={handleDownload}
                            downloadMenuOpen={downloadMenuOpen}
                            setDownloadMenuOpen={setDownloadMenuOpen}
                            chartRef={chartRef}
                        />
                    </div>
                )}

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

                <CustomizationOverlay
                    isOpen={overlayOpen}
                    onClose={() => setOverlayOpen(false)}
                    plotType={
                        currentPlotType === 'heatmap' ? 'Heatmap' :
                            currentPlotType === 'grouped' ? 'Grouped Bar' :
                                currentPlotType === 'mosaic' ? 'Mosaic' :
                                    currentPlotType === 'stacked' ? 'Stacked Bar' :
                                        'Heatmap'
                    }
                    settings={
                        currentPlotType === 'heatmap' ? heatmapSettings :
                            currentPlotType === 'grouped' ? groupedBarSettings :
                                currentPlotType === 'mosaic' ? mosaicSettings :
                                    currentPlotType === 'stacked' ? stackedBarSettings :
                                        heatmapSettings
                    }
                    onSettingsChange={
                        currentPlotType === 'heatmap' ? setHeatmapSettings :
                            currentPlotType === 'grouped' ? setGroupedBarSettings :
                                currentPlotType === 'mosaic' ? setMosaicSettings :
                                    currentPlotType === 'stacked' ? setStackedBarSettings :
                                        setHeatmapSettings
                    }
                    language={language === 'bn' ? 'বাংলা' : 'English'}
                    fontFamilyOptions={fontFamilyOptions}
                    getDefaultSettings={() =>
                        currentPlotType === 'heatmap' ? getHeatmapDefaultSettings() :
                            currentPlotType === 'grouped' ? getGroupedBarDefaultSettings() :
                                currentPlotType === 'mosaic' ? getMosaicDefaultSettings() :
                                    currentPlotType === 'stacked' ? getStackedBarDefaultSettings() :
                                        getHeatmapDefaultSettings()
                    }
                    results={results}
                />
            </div>
        </>
    );
}

export default renderCrossTabulationResults;