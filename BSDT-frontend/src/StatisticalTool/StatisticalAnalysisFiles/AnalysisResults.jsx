import React, { useState } from 'react';
import renderKruskalResults from '../RenderFunctions/RenderKruskal/renderKruskalResults';
import renderChiSquareResults from '../RenderFunctions/RenderChiSquare/renderChiSquareResults';
import renderMannWhitneyResults from '../RenderFunctions/renderMannWhitneyResults';
import renderWilcoxonResults from '../RenderFunctions/renderWilcoxonResults';
import renderAnovaResults from '../RenderFunctions/renderAnovaResults';
import renderAncovaResults from '../RenderFunctions/renderAncovaResults';
import renderLinearRegressionResults from '../RenderFunctions/renderLinearRegressionResults';
import renderShapiroResults from '../RenderFunctions/renderShapiroResults';
import renderEDADistributionResults from '../RenderFunctions/renderEDADistributionResults';
import renderEDASwarmResults from '../RenderFunctions/renderEDASwarmResults';
import renderBarChartResults from '../RenderFunctions/renderBarChartResults';
import renderPieChartResults from '../RenderFunctions/renderPieChartResults';
import renderKolmogorovResults from '../RenderFunctions/renderKolmogorovResults';
import renderAndersonDarlingResults from '../RenderFunctions/renderAndersonDarlingResults';
import {
    renderF_TestResults,
    renderZ_TestResults, 
    renderT_TestResults,
    renderFZT_TestResults
} from '../RenderFunctions/renderFZT_TestResults';
import renderPearsonResults from '../RenderFunctions/RenderPearson/renderPearsonResults';
import renderSpearmanResults from '../RenderFunctions/RenderSpearman/renderSpearmanResults';
import renderCramerVResults from '../RenderFunctions/RenderCramarV/renderCramerVResults';
import renderCrossTabulationResults from '../RenderFunctions/RenderCrossTabulation/renderCrossTabulationResults';


const digitMapBn = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '.': '.'
};

const AnalysisResults = ({ isFirstTimeAnalysis, setIsFirstTimeAnalysis, handleSubmit, user_id, results, testType, columns, language = 'English', setLanguage, imageFormat, setImageFormat, useDefaultSettings, setUseDefaultSettings, labelFontSize, setLabelFontSize, tickFontSize, setTickFontSize, imageQuality, setImageQuality, imageSize, setImageSize, colorPalette, setColorPalette, barWidth, setBarWidth, boxWidth, setBoxWidth, violinWidth, setViolinWidth, showGrid, setShowGrid, histColor, setHistColor, kdeColor, setKdeColor, distColor, setDistColor, t, filename }) => {
    const [kruskalActiveTab, setKruskalActiveTab] = useState('count');
    const [chiSquareActiveTab, setChiSquareActiveTab] = useState('detailed');
    const [mannWhitneyActiveTab, setMannWhitneyActiveTab] = useState('box');
    const [wilcoxonActiveTab, setWilcoxonActiveTab] = useState('histogram');
    const [anovaActiveTab, setAnovaActiveTab] = useState('count');   
    const [ancovaActiveTab, setAncovaActiveTab] = useState('scatter');    
    const [linearRegressionActiveTab, setLinearRegressionActiveTab] = useState('scatter');
    const [shapiroActiveTab, setShapiroActiveTab] = useState('histogram');    
    const [edaDistributionActiveTab, setEdaDistributionActiveTab] = useState('histogram');
    const [edaSwarmActiveTab, setEDASwarmActiveTab] = useState('swarm');
    const [barChartActiveTab, setBarChartActiveTab] = useState('vertical');
    const [pieActiveTab, setPieActiveTab] = useState('pie');
    const [kolmogorovActiveTab, setKolmogorovActiveTab] = useState('ecdf');   
    const [andersonActiveTab, setAndersonActiveTab] = useState('qq'); 
    const [fTestActiveTab, setFTestActiveTab] = useState('count');
    const [zTestActiveTab, setZTestActiveTab] = useState('count');
    const [tTestActiveTab, setTTestActiveTab] = useState('count');
    const [fztTestActiveTab, setFZTTestActiveTab] = useState('count');
    const [pearsonActiveTab, setPearsonActiveTab] = useState('detailed');
    const [spearmanActiveTab, setSpearmanActiveTab] = useState('detailed');    
    const [cramerVActiveTab, setCramerVActiveTab] = useState('detailed');
    const [crossTabActiveTab, setCrossTabActiveTab] = useState('detailed');

    
    // For rendering different results based on test type
    const renderResults = () => {
        if (testType === 'kruskal') {
            return renderKruskalResults(
                kruskalActiveTab,
                setKruskalActiveTab,
                results,
                language
            );
        } else if (testType === 'mannwhitney') {
            return renderMannWhitneyResults(
                mannWhitneyActiveTab,
                setMannWhitneyActiveTab,
                results,
                language
            );
        } else if (testType === 'wilcoxon') {
            return renderWilcoxonResults(
                wilcoxonActiveTab,
                setWilcoxonActiveTab,
                results,
                language
            );
        } else if (testType === 'anova') {
            return renderAnovaResults(
                anovaActiveTab,
                setAnovaActiveTab,
                results,
                language
            );
        } else if (testType === 'ancova') {
            return renderAncovaResults(
                ancovaActiveTab,
                setAncovaActiveTab,
                results,
                language,
            );
        } else if (testType === 'linear_regression') {
            return renderLinearRegressionResults(
                linearRegressionActiveTab,
                setLinearRegressionActiveTab,
                results,
                language
            );                
        } else if (testType === 'shapiro') {
            return renderShapiroResults(
                shapiroActiveTab,
                setShapiroActiveTab,
                results,
                language
            );   
        } else if (testType === 'eda_swarm') {
            return renderEDASwarmResults(
                edaSwarmActiveTab,
                setEDASwarmActiveTab,
                results,
                language
            );           
        } else if (testType === 'eda_distribution') { 
            return renderEDADistributionResults(
                edaDistributionActiveTab,
                setEdaDistributionActiveTab,
                results,
                language
            );
        } else if (testType === 'bar_chart') {
            return renderBarChartResults(
                barChartActiveTab,
                setBarChartActiveTab,
                results,
                language
            );         
        } else if (testType === 'eda_pie') {
            return renderPieChartResults(
                pieActiveTab,
                setPieActiveTab,
                results,
                language
            );
        } else if (testType === 'kolmogorov') {
            return renderKolmogorovResults(
                kolmogorovActiveTab,
                setKolmogorovActiveTab,
                results,
                language
            );
        } else if (testType === 'anderson') {
            return renderAndersonDarlingResults(
                andersonActiveTab,
                setAndersonActiveTab,
                results,
                language
            );        
    } else if (testType === 'f_test') {
        return renderF_TestResults(
            fTestActiveTab,
            setFTestActiveTab,
            results,
            language
        );
    } else if (testType === 'z_test') {
        return renderZ_TestResults(
            zTestActiveTab,
            setZTestActiveTab,
            results,
            language
        );
    } else if (testType === 't_test') {
        return renderT_TestResults(
            tTestActiveTab,
            setTTestActiveTab,
            results,
            language
        );
    } else if (testType === 'fzt_visualization') {
        return renderFZT_TestResults(
            fztTestActiveTab,
            setFZTTestActiveTab,
            results,
            language
        );                        
        } else if (testType === 'spearman') {
            return renderSpearmanResults(
                spearmanActiveTab,
                setSpearmanActiveTab,
                results,
                language
            );     
        } else if (testType === 'cross_tabulation') { 
            return renderCrossTabulationResults(
                crossTabActiveTab,
                setCrossTabActiveTab,
                results,
                language
            );                                 
        } else if (testType === 'cramers') {
            return renderCramerVResults(cramerVActiveTab, setCramerVActiveTab, results, language);            
        } else if (testType === 'pearson') {
            return renderPearsonResults(pearsonActiveTab, setPearsonActiveTab, results, language);

        } else if (testType === 'eda_basics') {
            return renderEDABasicsResults();
        } else if (testType === 'similarity') {
            return renderSimilarityResults();
        } else if (testType === 'chi_square') {
            return renderChiSquareResults(chiSquareActiveTab, setChiSquareActiveTab, results, language);
        } else if (testType === 'network_graph') {
            return renderNetworkGraphResults();
        }

        switch (testType) {
            case 'pearson':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Pearson Correlation Analysis</h2>

                        {/* ... will write Pearson results rendering ... */}
                    </>
                );

            // ... will write the other test type renderers ...

            default:
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{results.test}</h2>
                        <p className="mb-3">
                            <strong>Analysis complete.</strong> The test results are displayed below.
                        </p>
                        {/* ... default results rendering ... */}
                    </>
                );
        }
    };



    const renderEDABasicsResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== "বাংলা") return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return (
                <div className="stats-loading">
                    <p>{language === "বাংলা" ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>
                </div>
            );
        }

        const renderTitle = (key) => {
            const titles = {
                count: language === "বাংলা" ? 'গণনা' : 'Count',
                min: language === "বাংলা" ? 'সর্বনিম্ন' : 'Min',
                max: language === "বাংলা" ? 'সর্বোচ্চ' : 'Max',
                range: language === "বাংলা" ? 'পরিসর' : 'Range',
                iqr: language === "বাংলা" ? 'IQR' : 'IQR',
                outliers: language === "বাংলা" ? 'আউটলাইয়ার সংখ্যা' : 'Outliers',
                mean: language === "বাংলা" ? 'গড়' : 'Mean',
                median: language === "বাংলা" ? 'মিডিয়ান' : 'Median',
                mode: language === "বাংলা" ? 'মোড' : 'Mode',
                variance: language === "বাংলা" ? 'চর বৈচিত্র্য' : 'Variance',
                std: language === "বাংলা" ? 'স্ট্যান্ডার্ড ডেভিয়েশন' : 'Std Dev',
                mad: language === "বাংলা" ? 'ম্যাড' : 'MAD',
                skew: language === "বাংলা" ? 'স্কিউনেস' : 'Skewness',
                kurt: language === "বাংলা" ? 'কার্টোসিস' : 'Kurtosis',
                cv: language === "বাংলা" ? 'CV' : 'Coeff. of Variation',
            };
            return titles[key] || key;
        };

        const renderWideTable = (title, statKeys) => {
            const columns = Object.keys(results[statKeys[0]] || {});
            if (columns.length === 0) return null;

            return (
                <div className="eda-table-section">
                    <h3 className="eda-table-title">{title}</h3>
                    <div className="stats-results-table-wrapper">
                        <div className="eda-table-scroll">
                            <table className="stats-results-table eda-wide-table">
                                <thead>
                                    <tr>
                                        <th className="eda-column-header">
                                            {language === "বাংলা" ? 'কলাম' : 'Column'}
                                        </th>
                                        {statKeys.map((statKey, idx) => (
                                            <th key={idx} className="eda-stat-header">
                                                {renderTitle(statKey)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {columns.map((col, i) => (
                                        <tr key={i}>
                                            <td className="stats-table-label eda-column-cell">
                                                {col}
                                            </td>
                                            {statKeys.map((statKey, idx) => (
                                                <td key={idx} className="stats-table-value stats-numeric eda-value-cell">
                                                    {results[statKey]?.[col] !== undefined
                                                        ? mapDigitIfBengali(
                                                            typeof results[statKey][col] === 'number'
                                                                ? results[statKey][col].toFixed(4)
                                                                : results[statKey][col]
                                                        )
                                                        : "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="stats-results-container stats-fade-in">
                {/* Header Section */}
                <div className="stats-header">
                    <h2 className="stats-title">
                        {language === "বাংলা" ? 'মৌলিক EDA বিশ্লেষণ' : 'Basic EDA Summary'}
                    </h2>
                </div>

                {/* Dataset Info Card */}
                {results.info && (
                    <div className="eda-info-card">
                        <h3 className="eda-info-title">
                            {language === "বাংলা" ? 'ডেটাসেট তথ্য' : 'Dataset Info'}
                        </h3>
                        <div className="stats-results-table-wrapper">
                            <table className="stats-results-table">
                                <tbody>
                                    <tr>
                                        <td className="stats-table-label">
                                            {language === "বাংলা" ? 'মোট সারি' : 'Total Rows'}
                                        </td>
                                        <td className="stats-table-value stats-numeric">
                                            {mapDigitIfBengali(results.info.rows)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="stats-table-label">
                                            {language === "বাংলা" ? 'মোট কলাম' : 'Total Columns'}
                                        </td>
                                        <td className="stats-table-value stats-numeric">
                                            {mapDigitIfBengali(results.info.columns)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="stats-table-label">
                                            {language === "বাংলা" ? 'পুনরাবৃত্ত সারি' : 'Duplicate Rows'}
                                        </td>
                                        <td className="stats-table-value stats-numeric">
                                            {mapDigitIfBengali(results.info.duplicates)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="stats-table-label">
                                            {language === "বাংলা" ? 'মেমোরি ব্যবহার' : 'Memory Usage'}
                                        </td>
                                        <td className="stats-table-value stats-numeric">
                                            {mapDigitIfBengali(results.info.memory)} {language === "বাংলা" ? 'কিলোবাইট' : 'KB'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Table 1: Count, Min, Max, Range, IQR, Outliers */}
                {renderWideTable(
                    language === "বাংলা" ? 'টেবিল ১: পরিসংখ্যান এবং বিস্তার' : 'Table 1: Count, Min, Max, Range, IQR, Outliers',
                    ['count', 'min', 'max', 'range', 'iqr', 'outliers']
                )}

                {/* Table 2: Central Tendency & Dispersion */}
                {renderWideTable(
                    language === "বাংলা" ? 'টেবিল ২: কেন্দ্রীয় প্রবণতা এবং বিক্ষিপ্ততা' : 'Table 2: Central Tendency & Dispersion',
                    ['mean', 'median', 'mode', 'variance', 'std']
                )}

                {/* Table 3: MAD, Skewness, Kurtosis, CV */}
                {renderWideTable(
                    language === "বাংলা" ? 'টেবিল ৩: ম্যাড, স্কিউনেস, কার্টোসিস, সিভি' : 'Table 3: MAD, Skewness, Kurtosis, CV',
                    ['mad', 'skew', 'kurt', 'cv']
                )}
            </div>
        );
    };

    const renderSimilarityResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== "বাংলা") return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === "বাংলা" ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">
                    {language === "বাংলা" ? 'সাদৃশ্য এবং দূরত্ব বিশ্লেষণ' : 'Similarity and Distance Analysis'}
                </h2>

                {results.heading && (
                    <p className="mb-3 font-medium text-gray-700 dark:text-gray-300">
                        {results.heading}
                    </p>
                )}

                {results.columns && results.columns.length > 0 && (
                    <p className="mb-3">
                        <strong>{language === "বাংলা" ? 'বিশ্লেষিত কলাম:' : 'Columns analyzed:'}</strong>{" "}
                        {results.columns.map((col, i) => (
                            <span key={i}>
                                {col}{i < results.columns.length - 1 ? (language === "বাংলা" ? ' এবং ' : ' and ') : ''}
                            </span>
                        ))}
                    </p>
                )}

                {results.results && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <StatRow label={language === "বাংলা" ? 'কসাইন সাদৃশ্য' : 'Cosine Similarity'} value={results.results.cosine_similarity} />
                        <StatRow label={language === "বাংলা" ? 'ইউক্লিডীয় দূরত্ব' : 'Euclidean Distance'} value={results.results.euclidean_distance} />
                        <StatRow label={language === "বাংলা" ? 'ম্যানহাটন (L1) দূরত্ব' : 'Manhattan (L1) Distance'} value={results.results.manhattan_distance} />
                        <StatRow label={language === "বাংলা" ? 'চেবিশেভ (L∞) দূরত্ব' : 'Chebyshev (L∞) Distance'} value={results.results.chebyshev_distance} />
                        <StatRow label={
                            language === "বাংলা"
                                ? `মিনকোর্সকি (p=${results.results.p}) দূরত্ব`
                                : `Minkowski (p=${results.results.p}) Distance`
                        } value={results.results.minkowski_distance} />
                        <StatRow label={language === "বাংলা" ? 'পিয়ারসন সহগ' : 'Pearson Correlation'} value={results.results.pearson_correlation} />
                        <StatRow label={language === "বাংলা" ? 'স্পিয়ারম্যান সহগ' : 'Spearman Correlation'} value={results.results.spearman_correlation} />
                    </div>
                )}
            </>
        );
    };


    const renderNetworkGraphResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== "বাংলা") return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === "বাংলা" ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">
                    {language === "বাংলা" ? 'নেটওয়ার্ক গ্রাফ বিশ্লেষণ' : 'Network Graph Analysis'}
                </h2>

                <p className="mb-3">
                    <strong>{language === "বাংলা" ? 'ভিজ্যুয়ালাইজেশন:' : 'Visualization:'}</strong>
                </p>

                {results.image_path && (
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="relative">
                            <img
                                src={`http://127.0.0.1:8000/${results.image_path}`}
                                alt={language === "বাংলা" ? 'নেটওয়ার্ক গ্রাফ' : 'Network Graph'}
                                className="w-full h-auto object-contain"
                            />
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`http://127.0.0.1:8000/${results.image_path}`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = results.image_path.split('/').pop() || 'network_graph.png';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error('Download failed:', error);
                                        alert(language === "বাংলা" ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download failed');
                                    }
                                }}
                                className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 transform hover:scale-105 flex items-center text-sm"
                                title={language === "বাংলা" ? 'ছবি ডাউনলোড করুন' : 'Download Image'}
                            >
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                {language === "বাংলা" ? 'ডাউনলোড' : 'Download'}
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    };

    // Helper component for consistent layout
    const StatRow = ({ label, value }) => (
        <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
            <p className="font-medium text-gray-800 dark:text-gray-100">{label}</p>
            <p className="text-blue-700 dark:text-blue-300 text-xl mt-1">{value}</p>
        </div>
    );

    return (
        <div className=" rounded-lg  overflow-hidden"
            style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>


            {/* <div className="bg-gray-700 text-white p-4 font-semibold">
                <p className="text-black inline">
                    {language === "বাংলা" ? 'পরিসংখ্যানগত বিশ্লেষণ ফলাফল' : 'Statistical Analysis Results'}
                </p>
            </div> */}
            <div className="p-6">
                <div className="analysis-container">
                    {renderResults()}
                </div>

                <div style={{
                    padding: '1rem 0',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2rem'
                }}>
                    <button
                        onClick={() => {
                            if (!results || !columns || !testType) {
                                alert(language === 'বাংলা'
                                    ? 'রিপোর্ট যুক্ত করার জন্য সম্পূর্ণ বিশ্লেষণ প্রয়োজন'
                                    : 'Analysis must be completed before adding to report'
                                );
                                return;
                            }

                            try {
                                // Dynamically find image sources from the page
                                const imagePaths = Array.from(document.querySelectorAll('.analysis-container img'))
                                    .map(img => img.getAttribute('src'))
                                    .filter(src => src?.includes('/media/'))
                                    .map(fullSrc => {
                                        try {
                                            const url = new URL(fullSrc, window.location.origin);
                                            return url.pathname;
                                        } catch {
                                            return fullSrc;
                                        }
                                    });

                                const enrichedResults = {
                                    ...results,
                                    image_paths: imagePaths,
                                };

                                const existingReports = JSON.parse(localStorage.getItem('analysisReports') || '[]');
                                const updatedReports = [
                                    ...existingReports,
                                    {
                                        results: enrichedResults,
                                        columns,
                                        type: testType,
                                        timestamp: new Date().toISOString()
                                    }
                                ];

                                localStorage.setItem('analysisReports', JSON.stringify(updatedReports));
                                alert(language === 'বাংলা' ? 'রিপোর্টে যুক্ত হয়েছে' : 'Results and visulaizations are added to the report');
                            } catch (error) {
                                console.error("Add to Report Failed:", error);
                                alert(language === 'বাংলা' ? 'রিপোর্ট যুক্ত করা যায়নি' : 'Failed to add to report');
                            }
                        }}
                        className="stats-save-btn"
                    >
                        {language === 'বাংলা' ? 'রিপোর্টে যুক্ত করুন' : 'Add to Report'}
                    </button>

                    <button
                        onClick={() => {
                            window.location.reload();
                        }}
                        className="stats-save-btn"
                    >
                        {language === "বাংলা" ? 'আরেকটি বিশ্লেষণ করুন' : 'Perform Another Analysis'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResults;