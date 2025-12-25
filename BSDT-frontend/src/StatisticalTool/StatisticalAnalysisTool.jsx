import 'katex/dist/katex.min.css';
import { useEffect, useRef, useState, useMemo, use, Fragment } from 'react';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate } from 'react-router-dom';
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
// import ChiSquareOptions from './ChiSquareOptions';
import EDABasicsOptions from './EDABasicsOptions';
// import KruskalOptions from './PlotCustomizers/KruskalOptions';
import NetworkGraphOptions from './NetworkGraphOptions';
import SimilarityOptions from './SimilarityOptions';
import statTestDetails from './stat_tests_details';
//import './StatisticalAnalysisTool.css';
import './StatisticalAnalysisResultPage.css';
import apiClient from '../api';
import PreviewTable from './previewTable';
import TestSuggestionsModal from './testSuggestionsModal';
import * as XLSX from "xlsx";


import renderKruskalResults from './RenderFunctions/RenderKruskal/renderKruskalResults';
import renderChiSquareResults from './RenderFunctions/RenderChiSquare/renderChiSquareResults';
import renderMannWhitneyResults from './RenderFunctions/renderMannWhitneyResults';
import renderWilcoxonResults from './RenderFunctions/renderWilcoxonResults';
import renderAnovaResults from './RenderFunctions/renderAnovaResults';
import renderAncovaResults from './RenderFunctions/renderAncovaResults';
import renderLinearRegressionResults from './RenderFunctions/renderLinearRegressionResults';
import renderShapiroResults from './RenderFunctions/renderShapiroResults';
import renderEDADistributionResults from './RenderFunctions/renderEDADistributionResults';
import renderEDASwarmResults from './RenderFunctions/renderEDASwarmResults';
import renderBarChartResults from './RenderFunctions/renderBarChartResults';
import renderPieChartResults from './RenderFunctions/renderPieChartResults';
import renderKolmogorovResults from './RenderFunctions/renderKolmogorovResults';
import renderAndersonDarlingResults from './RenderFunctions/renderAndersonDarlingResults';
import {
    renderF_TestResults,
    renderZ_TestResults, 
    renderT_TestResults,
    renderFZT_TestResults
} from './RenderFunctions/renderFZT_TestResults';
import renderPearsonResults from './RenderFunctions/RenderPearson/renderPearsonResults';
import renderSpearmanResults from './RenderFunctions/RenderSpearman/renderSpearmanResults';
import renderCramerVResults from './RenderFunctions/RenderCramarV/renderCramerVResults';
import renderCrossTabulationResults from './RenderFunctions/RenderCrossTabulation/renderCrossTabulationResults';


const translations = {
    English: {
        title: "Statistical Analysis Tool",
        subtitle: "Upload your Excel file and run various statistical tests on your data",
        formTitle: "Data Analysis Form",
        uploadLabel: "Import File",
        preprocessedLabel: "Preprocessed File",
        surveyLabel: "Survey Data File",
        dropFile: "Drag your file or click to browse",
        processing: "Processing file, please wait...",
        testType: "Test Type",
        testGroups: {
            eda: "Exploratory Data Analysis",
            correlation: "Correlation Tests",
            parametric: "Parametric Tests",
            nonParametric: "Non-parametric Tests",
            regression: "Regression Analysis",
            anova: "ANOVA & ANCOVA",
            other: "Other Tests"
        },
        tests: {
            eda_basics: "Basic EDA Summary – Descriptive Stats & Entropy",
            eda_distribution: "Distribution Plot –> Histogram + KDE – For Numeric Column",
            eda_swarm: "Swarm Plot – Categorical Vs Numeric Columns",
            eda_pie: "Pie Chart – For Categorical Column",
            bar_chart: "Bar Chart – Horizontal or Vertical",
            similarity: "Similarity & Distance – Cosine, Euclidean, Pearson, etc.",
            pearson: "Pearson Correlation",
            spearman: "Spearman Rank Correlation",
            mannwhitney: "Mann-Whitney U Test",
            kruskal: "Kruskal-Wallis H-test",
            wilcoxon: "Wilcoxon Signed-Rank Test",
            linear_regression: "Linear Regression",
            anova: "ANOVA",
            ancova: "ANCOVA",
            shapiro: "Shapiro-Wilk Normality Test",
            kolmogorov: "Kolmogorov–Smirnov Test",
            anderson: "Anderson–Darling Test",
            chi_square: "Chi-Square Test",
            cramers: "Cramér's V",
            network_graph: "Network Graph",
            f_test: "F-Test (Variance Comparison)",
            z_test: "Z-Test (Mean Comparison)",
            t_test: "T-Test (Mean Comparison)", 
            fzt_visualization: "F/Z/T Combined Visualization",            
            cross_tabulation: "Cross Tabulation",

        },
        descriptions: {
            eda_basics: "Provides key statistics like mean, median, std, outliers, and entropy to understand dataset structure and spread.",
            eda_distribution: "Distribution Plot –> Histogram + KDE – For Numeric Column",
            eda_swarm: "Swarm Plot – Categorical Vs Numeric Columns",
            eda_pie: "Pie Chart – For Categorical Column",
            bar_chart: "Bar Chart – Visualize categorical data frequencies as horizontal or vertical bars.",
            similarity: "Measures how similar or different two numeric columns are using statistical and geometric metrics.",
            pearson: "Measures the strength and direction of the linear relationship between two continuous variables.",
            spearman: "A non-parametric test that assesses how well the relationship between two variables can be described using a monotonic function.",
            mannwhitney: "A non-parametric test used to determine whether there is a difference between two independent groups.",
            kruskal: "A non-parametric test used to compare three or more independent groups to find significant differences.",
            wilcoxon: "A non-parametric test used to compare two related samples to assess whether their population mean ranks differ.",
            linear_regression: "Models the relationship between a dependent variable and one or more independent variables.",
            anova: "Analyzes the differences among group means in a sample.",
            ancova: "Combines ANOVA and regression to evaluate whether population means differ while controlling for covariates.",
            shapiro: "Tests whether a sample comes from a normally distributed population.",
            kolmogorov: "A non-parametric test used to compare a sample distribution to a reference normal distribution.",
            anderson: "A statistical test that evaluates whether a sample comes from a specific distribution, most commonly the normal distribution.",
            f_test: "Compares variances between two groups using F-distribution.",
            z_test: "Tests difference between means using normal distribution.",
            t_test: "Tests difference between means using t-distribution (unequal variances).",
            fzt_visualization: "Combined data visualizations for all three tests with histogram+KDE comparison.",            
            cross_tabulation: "Summarizes the relationship between two or more categorical variables using frequency tables and heatmaps.",
            chi_square: "Tests the association between categorical variables using observed and expected frequencies.",
            cramers: "Visual representation of Cramér's V association strength between categorical variables.",
            network_graph: "Displays statistical relationships between variables using a graphical network."
        },
        selectPrompt: "Choose the appropriate statistical test for your analysis",
        selectColumn: "Select a column",
        column1: "Column 1",
        column2: "Column 2",
        column3: "Column 3",
        column4: "Column 4",
        column5: "Column 5",
        referenceValue: "Reference Value",
        heatmapSize: "Heatmap Size",
        analyzeButton: "Analyze Data",
        analyzing: "Analyzing Data...",
        aboutTitle: "About This Tool",
        aboutText: "This statistical analysis tool allows you to perform various statistical tests on your Excel data:",
        kruskalTitle: "Kruskal-Wallis H-test",
        mannwhitneyGroupError: 'Mann-Whitney test requires exactly 2 groups. Please select 2 groups from the dropdown.',        
        selectGroupsPrompt: 'Select 2 Groups',
        groupsAvailable: 'groups available',
        selectedGroups: 'Selected Groups',
        clearSelection: 'Clear Selection',
        youMustSelect: 'You must select exactly 2 groups',
        groupsLoading: 'Loading groups...',
        mannwhitneyHelp: 'Select exactly 2 groups for Mann-Whitney test. Applicable only for numerical data.',        
        languageToggle: "বাংলা",
        downloadLabel: "Format",
        useDefaultSettings: "Use default plot settings?",
        labelFontSize: "Label font size",
        tickFontSize: "Tick font size",
        imageQuality: "Image quality",
        imageSize: "Image size (WIDTHxHEIGHT)",
        palette: "Color palette",
        barWidth: "Bar width",
        boxWidth: "Box width",
        violinWidth: "Violin width",
        testStatistic: "Test Statistic",
        pValue: "p-value",
        significant: "Significant difference (p < 0.05)",
        notSignificant: "No significant difference (p ≥ 0.05)",
        uploadError: "Please upload an Excel file",
        columnError: "Please select at least one column",
        selectTest: "Select Statistical Test",
        selectColumns: "Select Columns",
        selectVariables: "Select Variables",
        anotherAnalysis: "Perform Another Analysis",
        visualizations: "Visualizations",
        columnsAnalyzed: "Columns analyzed:",
        and: "and",
        loadingResults: "Loading results...",
        conclusion: "Conclusion"
    },
    "বাংলা": {
        title: "পরিসংখ্যানগত বিশ্লেষণ টুল",
        subtitle: "আপনার এক্সেল ফাইল আপলোড করুন এবং আপনার ডেটাতে বিভিন্ন পরিসংখ্যান পরীক্ষা চালান",
        formTitle: "ডেটা বিশ্লেষণ ফর্ম",
        uploadLabel: "আপনার ডেটা আপলোড করুন",
        preprocessedLabel: "পূর্বপ্রক্রিয়াকৃত ফাইল",
        dropFile: "আপনার এক্সেল ফাইল টেনে আনুন অথবা ব্রাউজ করতে ক্লিক করুন",
        processing: "ফাইল প্রক্রিয়া করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...",
        testType: "পরীক্ষার ধরন",
        testGroups: {
            eda: "অন্বেষণাত্মক ডেটা বিশ্লেষণ",
            correlation: "করেলেশন পরীক্ষা",
            parametric: "প্যারামেট্রিক পরীক্ষা",
            nonParametric: "নন-প্যারামেট্রিক পরীক্ষা",
            regression: "রিগ্রেশন বিশ্লেষণ",
            anova: "ANOVA ও ANCOVA",
            other: "অন্যান্য পরীক্ষা"
        },
        tests: {
            eda_basics: "মৌলিক EDA – বর্ণনামূলক পরিসংখ্যান ও এনট্রপি",
            eda_distribution: "বিতরণ প্লট – হিস্টোগ্রাম + KDE (সংখ্যাগত)",
            eda_swarm: "স্বর্ম প্লট – শ্রেণিবিন্যাস বনাম সংখ্যাগত কলাম",
            eda_pie: "পাই চার্ট – শ্রেণিবিন্যাস কলামের জন্য",
            bar_chart: "বার চার্ট – অনুভূমিক বা উল্লম্ব",
            similarity: "সাদৃশ্য ও দূরত্ব – কসাইন, ইউক্লিডীয়, পিয়ার্সন ইত্যাদি",
            pearson: "পিয়ারসন করেলেশন",
            spearman: "স্পিয়ারম্যান র‍্যাঙ্ক করেলেশন",
            mannwhitney: "ম্যান-হুইটনি ইউ টেস্ট",
            kruskal: "ক্রুসকাল-ওয়ালিস এইচ-টেস্ট",
            wilcoxon: "উইলকক্সন সাইনড-র‍্যাঙ্ক টেস্ট",
            linear_regression: "রৈখিক রিগ্রেশন",
            anova: "ANOVA",
            ancova: "ANCOVA",
            shapiro: "শাপিরো-উইলক নর্মালিটি পরীক্ষা",
            kolmogorov: "কলমোগোরভ–স্মিরনভ পরীক্ষা",
            anderson: "আন্ডারসন–ডার্লিং টেস্ট",
            f_test: "এফ-টেস্ট (ভ্যারিয়েন্স তুলনা)",
            z_test: "জেড-টেস্ট (গড় তুলনা)",
            t_test: "টি-টেস্ট (গড় তুলনা)", 
            fzt_visualization: "এফ/জেড/টি সম্মিলিত ভিজ্যুয়ালাইজেশন",
            cross_tabulation: "ক্রস ট্যাবুলেশন",
            chi_square: "কাই-স্কয়ার টেস্ট",
            cramers: "ক্র্যামের ভি",
            network_graph: "নেটওয়ার্ক গ্রাফ"
        },
        descriptions: {
            eda_basics: "গড়, মধ্যক, মানক বিচ্যুতি, আউটলাইয়ার ও এনট্রপি দিয়ে ডেটাসেটের মূল বৈশিষ্ট্য উপস্থাপন করে।",
            eda_distribution: "বিতরণ প্লট – হিস্টোগ্রাম + KDE (সংখ্যাগত)",
            eda_swarm: "স্বর্ম প্লট – শ্রেণিবিন্যাস বনাম সংখ্যাগত কলাম",
            eda_pie: "পাই চার্ট – শ্রেণিবিন্যাস কলামের জন্য",
            bar_chart: "বার চার্ট – শ্রেণিবিন্যাস ডেটার ফ্রিকোয়েন্সি অনুভূমিক বা উল্লম্ব বারে প্রদর্শন করে।",
            similarity: "দুইটি সংখ্যাগত কলামের মধ্যে সাদৃশ্য বা পার্থক্য পরিমাপ করে পরিসংখ্যানিক ও জ্যামিতিক পদ্ধতিতে।",
            pearson: "দুইটি ধারাবাহিক ভেরিয়েবলের মধ্যে রৈখিক সম্পর্কের শক্তি ও দিক পরিমাপ করে।",
            spearman: "দুইটি ভেরিয়েবলের মধ্যে একঘাত সম্পর্ক আছে কিনা তা নির্ধারণে ব্যবহৃত একটি নন-প্যারামেট্রিক পরীক্ষা।",
            mannwhitney: "দুটি স্বাধীন গোষ্ঠীর মধ্যে পার্থক্য আছে কিনা তা নির্ধারণে ব্যবহৃত একটি নন-প্যারামেট্রিক পরীক্ষা।",
            kruskal: "তিন বা ততোধিক স্বাধীন গোষ্ঠীর মধ্যে উল্লেখযোগ্য পার্থক্য আছে কিনা তা নির্ধারণে ব্যবহৃত একটি নন-প্যারামেট্রিক পরীক্ষা।",
            wilcoxon: "দুটি সম্পর্কযুক্ত নমুনার মধ্যকার পার্থক্য নির্ধারণে ব্যবহৃত একটি নন-প্যারামেট্রিক পরীক্ষা।",
            linear_regression: "একটি নির্ভরশীল ভেরিয়েবল এবং এক বা একাধিক স্বাধীন ভেরিয়েবলের মধ্যে সম্পর্ক নির্ধারণ করে।",
            anova: "একাধিক গোষ্ঠীর গড় মানে পার্থক্য আছে কিনা তা বিশ্লেষণ করে।",
            ancova: "ANOVA এবং রিগ্রেশনের সমন্বয়ে গঠিত, যেখানে কভেরিয়েট নিয়ন্ত্রণ করে গোষ্ঠীর গড় মানে পার্থক্য নির্ধারণ করা হয়।",
            shapiro: "একটি নমুনা সাধারণ বন্টন থেকে এসেছে কিনা তা নির্ধারণ করে।",
            kolmogorov: "একটি নন-প্যারামেট্রিক পরীক্ষা যা একটি নমুনার বন্টনকে একটি আদর্শ স্বাভাবিক বন্টনের সাথে তুলনা করে।",
            anderson: "একটি পরিসংখ্যানগত পরীক্ষা যা একটি নমুনা নির্দিষ্ট বণ্টন থেকে এসেছে কিনা তা যাচাই করে, সাধারণত স্বাভাবিক বণ্টনের জন্য ব্যবহৃত হয়।",
            f_test: "দুইটি গ্রুপের ভ্যারিয়েন্স তুলনা করে এফ-বন্টন ব্যবহার করে।",
            z_test: "গড়ের পার্থক্য পরীক্ষা করে সাধারণ বন্টন ব্যবহার করে।",
            t_test: "গড়ের পার্থক্য পরীক্ষা করে টি-বন্টন ব্যবহার করে (অসম ভ্যারিয়েন্স)।",
            fzt_visualization: "তিনটি পরীক্ষার জন্য সম্মিলিত ডেটা ভিজ্যুয়ালাইজেশন সাথে হিস্টোগ্রাম+কেডিই তুলনা।",
            cross_tabulation: "দুই বা ততোধিক শ্রেণিবিন্যাসকৃত ভেরিয়েবলের মধ্যে সম্পর্ক সারাংশ আকারে প্রদর্শন করে, ফ্রিকোয়েন্সি টেবিল ও হিটম্যাপ ব্যবহার করে।",
            chi_square: "বিভিন্ন শ্রেণিবিন্যাসকৃত ভেরিয়েবলের মধ্যে সম্পর্ক নির্ধারণ করে।",
            cramers: "Cramér's V ব্যবহার করে শ্রেণিবিন্যাসকৃত ভেরিয়েবলের মধ্যকার সম্পর্কের দৃঢ়তা চিত্রায়িত করে।",
            network_graph: "ভেরিয়েবলের মধ্যকার পরিসংখ্যানগত সম্পর্ক একটি গ্রাফ নেটওয়ার্কের মাধ্যমে উপস্থাপন করে।"
        },
        selectPrompt: "আপনার বিশ্লেষণের জন্য সঠিক পরিসংখ্যান পরীক্ষাটি নির্বাচন করুন",
        selectColumn: "একটি কলাম নির্বাচন করুন",
        column1: "কলাম ১",
        column2: "কলাম ২",
        column3: "কলাম ৩",
        column4: "কলাম ৪",
        column5: "কলাম ৫",
        referenceValue: "রেফারেন্স মান",
        heatmapSize: "হিটম্যাপ আকার",
        analyzeButton: "ডেটা বিশ্লেষণ করুন",
        analyzing: "ডেটা বিশ্লেষণ করা হচ্ছে...",
        aboutTitle: "এই টুল সম্পর্কে",
        aboutText: "এই পরিসংখ্যানগত বিশ্লেষণ টুল আপনাকে আপনার এক্সেল ডেটাতে বিভিন্ন পরিসংখ্যানগত পরীক্ষা করতে দেয়:",
        kruskalTitle: "ক্রুসকাল-ওয়ালিস এইচ-টেস্ট",
        mannwhitneyGroupError: 'ম্যান-হুইটনি পরীক্ষার জন্য ঠিক ২টি গ্রুপ প্রয়োজন। দয়া করে ২টি গ্রুপ নির্বাচন করুন।',
        selectGroupsPrompt: '২টি গ্রুপ নির্বাচন করুন',
        groupsAvailable: 'টি গ্রুপ উপলব্ধ',
        selectedGroups: 'নির্বাচিত গ্রুপসমূহ',
        clearSelection: 'সিলেকশন ক্লিয়ার করুন',
        youMustSelect: 'আপনাকে ২টি গ্রুপ নির্বাচন করতে হবে',
        groupsLoading: 'গ্রুপ লোড হচ্ছে...',
        mannwhitneyHelp: 'ম্যান-হুইটনি পরীক্ষার জন্য ২টি গ্রুপ নির্বাচন করুন। শুধুমাত্র সংখ্যাসূচক ডেটার জন্য প্রযোজ্য।',        
        languageToggle: "English",
        downloadLabel: "ফরম্যাট",
        useDefaultSettings: "ডিফল্ট প্লট সেটিংস ব্যবহার করবেন?",
        labelFontSize: "লেবেল ফন্ট সাইজ",
        tickFontSize: "টিক ফন্ট সাইজ",
        imageQuality: "ছবির মান",
        imageSize: "ছবির আকার (প্রস্থ×উচ্চতা)",
        palette: "রঙের প্যালেট",
        barWidth: "বারের প্রস্থ",
        boxWidth: "বক্সের প্রস্থ",
        violinWidth: "ভায়োলিন প্লটের প্রস্থ",
        testStatistic: "পরীক্ষার পরিসংখ্যান",
        pValue: "পি-মান",
        significant: "উল্লেখযোগ্য পার্থক্য (p < ০.০৫)",
        notSignificant: "কোন উল্লেখযোগ্য পার্থক্য নেই (p ≥ ০.০৫)",
        uploadError: "অনুগ্রহ করে একটি এক্সেল ফাইল আপলোড করুন",
        columnError: "অনুগ্রহ করে অন্তত একটি কলাম নির্বাচন করুন",
        selectTest: "পরিসংখ্যানগত পরীক্ষা নির্বাচন করুন",
        selectColumns: "কলাম নির্বাচন করুন",
        selectVariables: "ভেরিয়েবল নির্বাচন করুন",
        anotherAnalysis: "আরেকটি বিশ্লেষণ করুন",
        visualizations: "ভিজ্যুয়ালাইজেশন",
        columnsAnalyzed: "বিশ্লেষিত কলাম:",
        and: "এবং",
        loadingResults: "ফলাফল লোড হচ্ছে...",
        conclusion: "সিদ্ধান্ত"
    }
};


// Digit mapping for Bengali
const digitMapBn = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '.': '.'
};

// Function to convert English digits to Bengali
const mapDigits = (text, lang) => {
    if (lang !== 'বাংলা') return text;
    return text.toString().split('').map(char => digitMapBn[char] || char).join('');
};

// Main App Component
const StatisticalAnalysisTool = () => {
     const API_BASE = 'http://127.0.0.1:8000/api';
     const API_WORKBOOK='http://127.0.0.1:8000'
    const navigate = useNavigate();
    // Language state - initialized from localStorage to sync with navbar
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("language") || "English";
    });

    // Sync with localStorage when language changes
    useEffect(() => {
        localStorage.setItem("language", language);
    }, [language]);

    const t = translations[language];
    const [isPreprocessed, setIsPreprocessed] = useState(sessionStorage.getItem("preprocessed") === "true");
    // survey data state
    const [isSurveyData, setIsSurveyData] = useState(sessionStorage.getItem("surveyfile") === "true");
    // State for file upload and form
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [uploadStatus, setUploadStatus] = useState('initial'); // 'initial', 'loading', 'success', 'error'
    const [columns, setColumns] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [testanalyze, setTestanalyze] = useState(false)
    const [columnanalyze, setColumnanalyze] = useState(false)
    const [referenceValue, setReferenceValue] = useState(0);
    // Refs
    const fileInputRef = useRef(null);
    const uploadContainerRef = useRef(null);
    const [fileURL, setFileURL] = useState('');
    const userId = localStorage.getItem("user_id");

    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [tempSelectedColumns, setTempSelectedColumns] = useState([]);

    // Generate Again Functionality
    const [isFirstTimeAnalysis, setIsFirstTimeAnalysis] = useState(true);
    useEffect(() => {
        const stored = sessionStorage.getItem("fileURL") || '';
        if (stored) setFileURL(stored);
    }, []);



    const fetchcolumn = () => {

        //fetch column
        const storedSheetName = sessionStorage.getItem("activesheetname") || 'sheet1';
        if (fileName && userId && sessionStorage.getItem("fileURL")) {
            console.log("Active sheet name from sessionStorage:", storedSheetName);
            const formData = new FormData();


            formData.append('filename', fileName);
            formData.append('userID', userId);
            formData.append('activeSheet', storedSheetName || '');
            formData.append('Fileurl', sessionStorage.getItem("fileURL") || '');


            // Call the API to get columns
            fetch(`${API_BASE}/get-columns/`, {
                method: 'POST',
                body: formData,

            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {

                        console.log(data.columns);
                        setColumns(data.columns || []);
                        setColumn1(data.columns[0])
                        console.log(columns);

                    } else {
                        console.error("Error fetching columns:", data.error);
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                });
        }
    }


    useEffect(() => {

        const filename = sessionStorage.getItem("file_name") || '';


        let fileUrl = "";

        if (isSurveyData) {


            sessionStorage.removeItem("surveyfile");
        }
        else if (isPreprocessed) {
            //fileUrl = `http://127.0.0.1:8000/media/ID_${userId}_uploads/temporary_uploads/preprocessed/${filename}`;

            sessionStorage.removeItem("preprocessed");
        }

        fileUrl = `http://127.0.0.1:8000${sessionStorage.getItem("fileURL")}`;
        console.log("File URL from sessionStorage:", fileUrl);




        if (sessionStorage.getItem("fileURL")) {
            fetch(fileUrl)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch file from ${fileUrl}`);
                    return res.blob();
                })
                .then(blob => {
                    const newFile = new File([blob], filename, { type: blob.type });
                    setFile(newFile);
                    setFileName(filename || newFile.name);
                    setUploadStatus("success");
                    console.log("File loaded successfully:", newFile.name);

                    // Send file to backend to extract columns
                    const formData = new FormData();
                    formData.append('file', newFile);
                    formData.append('userID', userId);


                    //                   const storedSheetName = sessionStorage.getItem("activesheetname");
                    //   if( fileName && userId && fileURL){
                    //   console.log("Active sheet name from sessionStorage:", storedSheetName);
                    //    const formData = new FormData();


                    //             formData.append('filename', fileName);
                    //             formData.append('userID', userId);
                    //             formData.append('activeSheet', storedSheetName || '');
                    //             formData.append('Fileurl', fileURL || '');


                    //               // Call the API to get columns
                    //             fetch('http://127.0.0.1:8000/api/get-columns/', {
                    //                 method: 'POST',
                    //                 body: formData,

                    //             })
                    //                 .then(response => response.json())
                    //                 .then(data => {
                    //                     if (data.success) {

                    //                         console.log(data.columns);
                    //                        setColumns(data.columns || []);
                    //                        setColumn1(data.columns[0])
                    //                        console.log(columns);

                    //                     } else {
                    //                         console.error("Error fetching columns:", data.error);
                    //                     }
                    //                 })
                    //                 .catch(error => {
                    //                     console.error("Error:", error);
                    //                 });
                    //             }
                    fetchcolumn();

                })
                .catch(err => {
                    console.error("Error loading file:", err);
                    setErrorMessage("Error loading file. Please re-upload.");
                    setUploadStatus("error");
                });

        }


    }, [isPreprocessed, isSurveyData, fileName]);




    console.log("File URL from sessionStorage:", file);

    console.log("File name from sessionStorage:", fileName);

    useEffect(() => {
        if (!file) setFileName(translations[language].dropFile);
    }, [language, file]);
    // preprocessed data state


    // Form state
    const [testType, setTestType] = useState(''); // Default to Kruskal-Wallis
    const [column1, setColumn1] = useState('');
    const [column2, setColumn2] = useState('');
    const [column3, setColumn3] = useState('');
    const [column4, setColumn4] = useState('');
    const [column5, setColumn5] = useState('');

    const [heatmapSize, setHeatmapSize] = useState('');

    const [imageFormat, setImageFormat] = useState('png');
    const [useDefaultSettings, setUseDefaultSettings] = useState(true);
    const [labelFontSize, setLabelFontSize] = useState(86);
    const [tickFontSize, setTickFontSize] = useState(18);
    const [imageQuality, setImageQuality] = useState(100);
    const [imageSize, setImageSize] = useState('1280x720');
    const [colorPalette, setColorPalette] = useState('bright');
    const [barWidth, setBarWidth] = useState(0.4);
    const [boxWidth, setBoxWidth] = useState(0.4);
    const [violinWidth, setViolinWidth] = useState(0.4);
    const [showGrid, setShowGrid] = useState(true);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    //
    const [histogramBins, setHistogramBins] = useState(30);
    const [barColor, setBarColor] = useState('steelblue');
    const [legendFontSize, setLegendFontSize] = useState(16);
    const [lineColor, setLineColor] = useState('red');
    const [lineStyle, setLineStyle] = useState('solid');
    const [lineWidth, setLineWidth] = useState(2);
    const [dotColor, setDotColor] = useState('blue');
    const [dotWidth, setDotWidth] = useState(5);
    const [boxColor, setBoxColor] = useState('steelblue');
    const [medianColor, setMedianColor] = useState('red');

    //

    const [fCurveColor, setFCurveColor] = useState('blue');
    const [fLineColor, setFLineColor] = useState('red');
    const [zCurveColor, setZCurveColor] = useState('gray');
    const [zLineColor, setZLineColor] = useState('green');
    const [tCurveColor, setTCurveColor] = useState('gray');
    const [tLineColor, setTLineColor] = useState('purple');
    const [hist1Color, setHist1Color] = useState('red');
    const [hist2Color, setHist2Color] = useState('orange');


    const [heatmapColorTheme, setHeatmapColorTheme] = useState('Blues');
    const [barColors, setBarColors] = useState('');
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [extraColumns, setExtraColumns] = useState([]);
    const [swarmColor, setSwarmColor] = useState('orange');
    const [histColor, setHistColor] = useState('#3b82f6');
    const [kdeColor, setKdeColor] = useState('#ef4444');
    const [distColor, setDistColor] = useState('#06b6d4');

    // Network graph options
    const [nodeColor, setNodeColor] = useState('#AED6F1');
    const [nodeSize, setNodeSize] = useState(800);
    const [textSize, setTextSize] = useState(25);
    const [textColor, setTextColor] = useState('black');
    const [edgeWidthFactor, setEdgeWidthFactor] = useState(0.5);
    const [showEdgeWeights, setShowEdgeWeights] = useState(false);
    const [weightFontSize, setWeightFontSize] = useState(3);
    const [weightColor, setWeightColor] = useState('red');
    const [useMatrix, setUseMatrix] = useState(false);
    const [matrixFile, setMatrixFile] = useState(null);

    const [barChartType, setBarChartType] = useState("vertical");

    // Results state
    const [results, setResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

    const [columnTypesCache, setColumnTypesCache] = useState({});
    const [isFetchingColumnTypes, setIsFetchingColumnTypes] = useState(false);
    const [lastFetchedFile, setLastFetchedFile] = useState('');

    const [numericColumns, setNumericColumns] = useState([]);
    const [categoricalColumns, setCategoricalColumns] = useState([]);
    const [columnTypesLoaded, setColumnTypesLoaded] = useState(false);
    const [columnTypesError, setColumnTypesError] = useState('');    

    const [availableGroups, setAvailableGroups] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);    
    const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);    

    // Add these near your other state declarations
    const [groupsCache, setGroupsCache] = useState({});
    const [isFetchingGroups, setIsFetchingGroups] = useState(false);

    const testsWithoutDetails = [
        'eda_basics',
        'eda_distribution',
        'eda_swarm',
        'eda_pie',
        'bar_chart',
        'similarity',
    ];

    const fetchColumnTypes = async () => {
        // If already fetching, don't start another request
        if (isFetchingColumnTypes) {
            console.log("[DEBUG] Already fetching column types, skipping...");
            return;
        }
        
        // Create a cache key based on the file URL
        const cacheKey = sessionStorage.getItem("fileURL") || "";
        
        // Check if we already have cached data for this file
        if (columnTypesCache[cacheKey] && columnTypesCache[cacheKey].timestamp > Date.now() - 30000) { // 30 second cache
            console.log("[DEBUG] Using cached column types");
            const cachedData = columnTypesCache[cacheKey];
            setNumericColumns(cachedData.numeric_columns || []);
            setCategoricalColumns(cachedData.categorical_columns || []);
            setColumnTypesLoaded(true);
            setColumnTypesError('');
            return;
        }
        
        // Check if we've already fetched for this file recently
        if (lastFetchedFile === cacheKey && columnTypesLoaded) {
            console.log("[DEBUG] Already loaded column types for this file");
            return;
        }
        
        if (!cacheKey) {
            console.log("[DEBUG] No file URL, cannot fetch column types");
            return;
        }
        
        try {
            setIsFetchingColumnTypes(true);
            setColumnTypesError('');
            
            const formData = new FormData();
            formData.append('filename', fileName);
            formData.append('userID', userId);
            formData.append('Fileurl', cacheKey);
            
            console.log("[DEBUG] Fetching column types...");
            const response = await fetch(`${API_BASE}/get-column-types/`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Cache the results
                const newCache = {
                    ...columnTypesCache,
                    [cacheKey]: {
                        numeric_columns: data.numeric_columns || [],
                        categorical_columns: data.categorical_columns || [],
                        timestamp: Date.now()
                    }
                };
                setColumnTypesCache(newCache);
                
                // Update state
                setNumericColumns(data.numeric_columns || []);
                setCategoricalColumns(data.categorical_columns || []);
                setColumnTypesLoaded(true);
                setLastFetchedFile(cacheKey);
                
                console.log("[DEBUG] Column types loaded successfully");
                
                // Auto-select first columns based on test type
                if (testType === 'kruskal' || testType === 'mannwhitney' || testType === 'eda_swarm' || testType === 'anova') {
                    if (data.categorical_columns.length > 0 && !column1) {
                        setColumn1(data.categorical_columns[0]);
                    }
                    if (data.numeric_columns.length > 0 && !column2) {
                        setColumn2(data.numeric_columns[0]);
                    }
                } else if (testType === 'wilcoxon' || testType === 'linear_regression' || testType === 'similarity') {
                    if (data.numeric_columns.length > 0 && !column1) {
                        setColumn1(data.numeric_columns[0]);
                    }
                    if (data.numeric_columns.length > 1 && !column2) {
                        // Don't auto-select the same column
                        const secondCol = data.numeric_columns[1] || data.numeric_columns[0];
                        setColumn2(secondCol);
                    }
                } else if (testType === 'bar_chart' || testType === 'eda_pie') {
                    if (data.categorical_columns.length > 0 && !column1) {
                        setColumn1(data.categorical_columns[0]);
                    }

                } else if (testType === 'shapiro' || testType === 'kolmogorov' || testType === 'anderson' || testType === 'eda_distribution') {
                    if (data.numeric_columns.length > 0 && !column1) {
                        setColumn1(data.numeric_columns[0]);
                    }

                } else if (testType === 'ancova') {
                    if (data.categorical_columns.length > 0 && !column1) {
                        setColumn1(data.categorical_columns[0]);
                    }
                    if (data.numeric_columns.length > 0 && !column2) {
                        setColumn2(data.numeric_columns[0]);
                    }
                    if (data.numeric_columns.length > 1 && !column3) {
                        // Use a different numeric column for col3
                        const thirdCol = data.numeric_columns[1] || data.numeric_columns[0];
                        setColumn3(thirdCol);
                    }

                }


            } else {
                setColumnTypesError(data.error || 'Failed to analyze column types');
                setColumnTypesLoaded(true);
            }
        } catch (error) {
            console.error("Error fetching column types:", error);
            setColumnTypesError('Error analyzing column types');
            setColumnTypesLoaded(true);
        } finally {
            setIsFetchingColumnTypes(false);
        }
    };

    // Function to fetch groups when column1 changes for Mann-Whitney    
    const fetchGroupsForColumn = async (columnName) => {
        console.log("[DEBUG] fetchGroupsForColumn called with:", {
            columnName,
            testType,
            sessionFileURL: sessionStorage.getItem("fileURL"),
            fileName
        });
        
        // Don't check fileURL state - use sessionStorage directly
        const fileUrlKey = sessionStorage.getItem("fileURL") || "";
        
        if (!columnName || !fileUrlKey) {
            console.log("[DEBUG] Missing column or file URL");
            setAvailableGroups([]);
            setSelectedGroups([]);
            return;
        }
        
        if (testType !== 'mannwhitney') {
            console.log("[DEBUG] Not Mann-Whitney test");
            return;
        }
        
        // Create a cache key
        const cacheKey = `${fileUrlKey}_${columnName}`;
        
        console.log("[DEBUG] Cache key:", cacheKey);
        
        // Check cache first
        if (groupsCache[cacheKey] && groupsCache[cacheKey].timestamp > Date.now() - 30000) {
            console.log("[DEBUG] Using cached groups");
            const cachedData = groupsCache[cacheKey];
            setAvailableGroups(cachedData.groups || []);
            
            // Auto-select first 2 groups if available
            if (cachedData.groups.length >= 2 && selectedGroups.length === 0) {
                setSelectedGroups(cachedData.groups.slice(0, 2));
            }
            return;
        }
        
        // Check if already fetching
        if (isFetchingGroups) {
            console.log("[DEBUG] Already fetching groups");
            return;
        }
        
        try {
            setIsFetchingGroups(true);
            console.log("[DEBUG] Starting API call for groups...");
            
            const formData = new FormData();
            formData.append('filename', fileName);
            formData.append('userID', userId);
            formData.append('Fileurl', fileUrlKey);
            formData.append('column', columnName);
            
            console.log("[DEBUG] API request data:", {
                filename: fileName,
                userId,
                fileUrl: fileUrlKey,
                column: columnName
            });
            
            const response = await fetch(`${API_BASE}/get-groups/`, {
                method: 'POST',
                body: formData
            });
            
            console.log("[DEBUG] API response status:", response.status);
            const data = await response.json();
            console.log("[DEBUG] API response data:", data);
            
            if (data.success) {
                // Cache the results
                const newCache = {
                    ...groupsCache,
                    [cacheKey]: {
                        groups: data.groups || [],
                        timestamp: Date.now(),
                        total_groups: data.total_groups
                    }
                };
                setGroupsCache(newCache);
                
                // Update state
                console.log("[DEBUG] Setting available groups:", data.groups);
                setAvailableGroups(data.groups || []);
                
                // Auto-select first 2 groups if available
                if (data.groups.length >= 2) {
                    console.log("[DEBUG] Auto-selecting groups:", data.groups.slice(0, 2));
                    setSelectedGroups(data.groups.slice(0, 2));
                } else {
                    setSelectedGroups([]);
                }
            } else {
                console.error("[DEBUG] API error:", data.error);
                setAvailableGroups([]);
                setSelectedGroups([]);
            }
        } catch (error) {
            console.error("[DEBUG] Fetch error:", error);
            setAvailableGroups([]);
            setSelectedGroups([]);
        } finally {
            console.log("[DEBUG] Fetch complete");
            setIsFetchingGroups(false);
        }
    };

    // Add this useEffect to sync tempSelectedColumns when menu opens
    useEffect(() => {
        if (showColumnMenu) {
            setTempSelectedColumns(selectedColumns);
        }
    }, [showColumnMenu, selectedColumns]);

    // Update this useEffect to be smarter about when to fetch
    useEffect(() => {
        const cacheKey = sessionStorage.getItem("fileURL") || "";        
        // Only fetch if:
        // 1. We have a file URL
        // 2. The test type requires column filtering
        // 3. We haven't already loaded column types for this file recently
        // 4. We're not currently fetching
        const needsColumnFiltering = [
            'kruskal', 'mannwhitney', 'wilcoxon', 'linear_regression', 
            'bar_chart', 'eda_pie', 'shapiro', 'kolmogorov', 
            'anderson', 'eda_distribution', 'eda_swarm', 'similarity',
            'anova', 'ancova'
        ].includes(testType);
        
        if (cacheKey && needsColumnFiltering && !isFetchingColumnTypes) {
            const hasCache = columnTypesCache[cacheKey] && 
                            columnTypesCache[cacheKey].timestamp > Date.now() - 30000;
            
            if (!hasCache && lastFetchedFile !== cacheKey) {
                console.log(`[DEBUG] Fetching column types for ${testType}`);
                fetchColumnTypes();
            } else if (hasCache && (!columnTypesLoaded || lastFetchedFile !== cacheKey)) {
                // Load from cache
                console.log(`[DEBUG] Loading column types from cache for ${testType}`);
                const cachedData = columnTypesCache[cacheKey];
                setNumericColumns(cachedData.numeric_columns || []);
                setCategoricalColumns(cachedData.categorical_columns || []);
                setColumnTypesLoaded(true);
                setLastFetchedFile(cacheKey);
            }
        } else if (!needsColumnFiltering) {
            // Reset column types when not needed (but keep them in cache)
            console.log(`[DEBUG] Test ${testType} doesn't need column filtering`);
        }
    }, [testType, fileURL]);


    useEffect(() => {
        const savedCache = localStorage.getItem('columnTypesCache');
        if (savedCache) {
            try {
                setColumnTypesCache(JSON.parse(savedCache));
            } catch (e) {
                console.error("Error loading column types cache:", e);
            }
        }
    }, []);

    // Save cache to localStorage when it changes
    useEffect(() => {
        if (Object.keys(columnTypesCache).length > 0) {
            localStorage.setItem('columnTypesCache', JSON.stringify(columnTypesCache));
        }
    }, [columnTypesCache]);

    // Add this debug useEffect
    useEffect(() => {
        console.log("[DEBUG] fileURL state:", fileURL);
        console.log("[DEBUG] sessionStorage fileURL:", sessionStorage.getItem("fileURL"));
        console.log("[DEBUG] Mann-Whitney conditions:", {
            testType,
            column1,
            hasFileURL: !!fileURL,
            hasSessionFileURL: !!sessionStorage.getItem("fileURL"),
            isFetchingGroups
        });
    }, [testType, column1, fileURL, isFetchingGroups]);    

    // Update the useEffect for groups
    useEffect(() => {
        console.log("[DEBUG] Groups useEffect triggered:", {
            testType,
            column1,
            sessionFileURL: sessionStorage.getItem("fileURL"),
            isFetchingGroups
        });
        
        const fileUrlKey = sessionStorage.getItem("fileURL") || "";
        
        if (testType === 'mannwhitney' && column1 && fileUrlKey) {
            console.log("[DEBUG] Conditions met for fetching groups");
            const cacheKey = `${fileUrlKey}_${column1}`;
            
            // Check cache first
            if (groupsCache[cacheKey] && groupsCache[cacheKey].timestamp > Date.now() - 30000) {
                console.log("[DEBUG] Loading groups from cache");
                const cachedData = groupsCache[cacheKey];
                setAvailableGroups(cachedData.groups || []);
                
                if (cachedData.groups.length >= 2 && selectedGroups.length === 0) {
                    setSelectedGroups(cachedData.groups.slice(0, 2));
                }
            } else {
                console.log("[DEBUG] Cache miss - fetching groups");
                if (!isFetchingGroups) {
                    // Small delay to ensure UI updates first
                    setTimeout(() => {
                        fetchGroupsForColumn(column1);
                    }, 100);
                }
            }
        } else {
            console.log("[DEBUG] Conditions NOT met - clearing groups");
            setAvailableGroups([]);
            setSelectedGroups([]);
            setGroupDropdownOpen(false);
        }
    }, [column1, testType, groupsCache, isFetchingGroups]);


    
    // Initialize groups cache from localStorage
    useEffect(() => {
        const savedGroupsCache = localStorage.getItem('groupsCache');
        if (savedGroupsCache) {
            try {
                setGroupsCache(JSON.parse(savedGroupsCache));
            } catch (e) {
                console.error("Error loading groups cache:", e);
            }
        }
    }, []);

    // Save groups cache to localStorage when it changes
    useEffect(() => {
        if (Object.keys(groupsCache).length > 0) {
            localStorage.setItem('groupsCache', JSON.stringify(groupsCache));
        }
    }, [groupsCache]);

    // Handle file selection async
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            sessionStorage.setItem("file_name", selectedFile.name);
            setFileName(selectedFile.name);
            setUploadStatus('loading');

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('userID', userId);
            console.log("File selected:", selectedFile);

            fetch(`${API_BASE}/upload-file/`, {
                method: 'POST',

                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        setUploadStatus('success');
                        const fixedUrl = data.fileURL.replace(/\\/g, '/');
                        console.log("ee", fixedUrl);
                        sessionStorage.setItem("fileURL", fixedUrl);
                        console.log("File uploaded successfully. URL:", sessionStorage.getItem("fileURL"));
                        fetchcolumn();

                    } else {
                        setErrorMessage(data.error);
                        setUploadStatus('error');
                    }
                })
                .catch(error => {
                    setErrorMessage('Error processing file: ' + error);
                    setUploadStatus('error');
                });
        }


    };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!file || !column1) {
            setErrorMessage(t.uploadError);
            return;
        }
        if (!column1 && testType !== 'network_graph') {
            setErrorMessage(t.columnError || t.columnError);
            return;
        }

        if (testType === 'linear_regression' && !column2) {
            setErrorMessage(t.column2Error || "Please select a second column for regression.");
            return;
        }

        if (testType === 'ancova' && (!column1 || !column2 || !column3)) {
            setErrorMessage(t.column3Error || "Please select group, covariate, and dependent columns for ANCOVA.");
            return;
        }

        // Add validation for Mann-Whitney
        // Update your handleSubmit validation for Mann-Whitney
        if (testType === 'mannwhitney') {
            if (!column1 || !column2) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে একটি শ্রেণীবদ্ধ এবং একটি সংখ্যাগত কলাম নির্বাচন করুন।' 
                        : 'Please select both a categorical and a numeric column.'
                );
                return;
            }
            
            if (categoricalColumns.length === 0 || numericColumns.length === 0) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'ম্যান-হুইটনি পরীক্ষার জন্য ফাইলে শ্রেণীবদ্ধ এবং সংখ্যাগত উভয় ধরনের কলাম প্রয়োজন।'
                        : 'Mann-Whitney test requires both categorical and numeric columns in the file.'
                );
                return;
            }
            
            if (!categoricalColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'প্রথম কলামটি একটি শ্রেণীবদ্ধ কলাম হতে হবে।'
                        : 'First column must be a categorical column.'
                );
                return;
            }
            
            if (!numericColumns.includes(column2)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'দ্বিতীয় কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Second column must be a numeric column.'
                );
                return;
            }
            
            if (selectedGroups.length !== 2) {
                setErrorMessage(t.mannwhitneyGroupError || 'Please select exactly 2 groups for Mann-Whitney test');
                return;
            }
        }

        // Add Kruskal-specific validation
        if (testType === 'kruskal') {
            if (!column1 || !column2) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে একটি শ্রেণীবদ্ধ এবং একটি সংখ্যাগত কলাম নির্বাচন করুন।' 
                        : 'Please select both a categorical and a numeric column.'
                );
                return;
            }
            
            if (categoricalColumns.length === 0 || numericColumns.length === 0) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'ক্রুসকাল-ওয়ালিস পরীক্ষার জন্য ফাইলে শ্রেণীবদ্ধ এবং সংখ্যাগত উভয় ধরনের কলাম প্রয়োজন।'
                        : 'Kruskal-Wallis test requires both categorical and numeric columns in the file.'
                );
                return;
            }
            
            if (!categoricalColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'প্রথম কলামটি একটি শ্রেণীবদ্ধ কলাম হতে হবে।'
                        : 'First column must be a categorical column.'
                );
                return;
            }
            
            if (!numericColumns.includes(column2)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'দ্বিতীয় কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Second column must be a numeric column.'
                );
                return;
            }
        }

        // Add validation for Wilcoxon
        if (testType === 'wilcoxon') {
            if (!column1 || !column2) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে ২টি সংখ্যাগত কলাম নির্বাচন করুন।' 
                        : 'Please select 2 numeric columns.'
                );
                return;
            }
            
            if (numericColumns.length < 2) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'উইলকক্সন পরীক্ষার জন্য ফাইলে কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন।'
                        : 'Wilcoxon test requires at least 2 numeric columns in the file.'
                );
                return;
            }
            
            if (!numericColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'প্রথম কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'First column must be a numeric column.'
                );
                return;
            }
            
            if (!numericColumns.includes(column2)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'দ্বিতীয় কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Second column must be a numeric column.'
                );
                return;
            }
        }

        // Add validation for Linear Regression
        if (testType === 'linear_regression') {
            if (!column1 || !column2) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে স্বাধীন এবং নির্ভরশীল চলক নির্বাচন করুন।' 
                        : 'Please select independent and dependent variables.'
                );
                return;
            }
            
            if (numericColumns.length < 2) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'রৈখিক রিগ্রেশনের জন্য ফাইলে কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন।'
                        : 'Linear regression requires at least 2 numeric columns in the file.'
                );
                return;
            }
            
            if (!numericColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'স্বাধীন চলকটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Independent variable must be a numeric column.'
                );
                return;
            }
            
            if (!numericColumns.includes(column2)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'নির্ভরশীল চলকটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Dependent variable must be a numeric column.'
                );
                return;
            }
        }        

        // Add validation for Bar Chart
        if (testType === 'bar_chart') {
            if (!column1) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে একটি শ্রেণীবদ্ধ কলাম নির্বাচন করুন।' 
                        : 'Please select a categorical column.'
                );
                return;
            }
            
            if (categoricalColumns.length === 0) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'বার চার্টের জন্য ফাইলে শ্রেণীবদ্ধ কলাম প্রয়োজন।'
                        : 'Bar chart requires categorical columns in the file.'
                );
                return;
            }
            
            if (!categoricalColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'নির্বাচিত কলামটি একটি শ্রেণীবদ্ধ কলাম হতে হবে।'
                        : 'Selected column must be a categorical column.'
                );
                return;
            }
        }

        // Add validation for Pie Chart
        if (testType === 'eda_pie') {
            if (!column1) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে একটি শ্রেণীবদ্ধ কলাম নির্বাচন করুন।' 
                        : 'Please select a categorical column.'
                );
                return;
            }
            
            if (categoricalColumns.length === 0) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'পাই চার্টের জন্য ফাইলে শ্রেণীবদ্ধ কলাম প্রয়োজন।'
                        : 'Pie chart requires categorical columns in the file.'
                );
                return;
            }
            
            if (!categoricalColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'নির্বাচিত কলামটি একটি শ্রেণীবদ্ধ কলাম হতে হবে।'
                        : 'Selected column must be a categorical column.'
                );
                return;
            }
        }

        // Add validation for Shapiro test
        if (testType === 'shapiro') {
            if (!column1) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে একটি সংখ্যাগত কলাম নির্বাচন করুন।' 
                        : 'Please select a numeric column.'
                );
                return;
            }
            
            if (numericColumns.length === 0) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'শাপিরো-উইল্ক পরীক্ষার জন্য ফাইলে সংখ্যাগত কলাম প্রয়োজন।'
                        : 'Shapiro-Wilk test requires numeric columns in the file.'
                );
                return;
            }
            
            if (!numericColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'নির্বাচিত কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Selected column must be a numeric column.'
                );
                return;
            }
        }

        // Add validation for Kolmogorov test
        if (testType === 'kolmogorov') {
            if (!column1) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে একটি সংখ্যাগত কলাম নির্বাচন করুন।' 
                        : 'Please select a numeric column.'
                );
                return;
            }
            
            if (numericColumns.length === 0) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'কোলমোগোরভ-স্মিরনভ পরীক্ষার জন্য ফাইলে সংখ্যাগত কলাম প্রয়োজন।'
                        : 'Kolmogorov-Smirnov test requires numeric columns in the file.'
                );
                return;
            }
            
            if (!numericColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'নির্বাচিত কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Selected column must be a numeric column.'
                );
                return;
            }
        }

        // Add validation for Anderson-Darling test
        if (testType === 'anderson') {
            if (!column1) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে একটি সংখ্যাগত কলাম নির্বাচন করুন।' 
                        : 'Please select a numeric column.'
                );
                return;
            }
            
            if (numericColumns.length === 0) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'অ্যান্ডারসন-ডার্লিং পরীক্ষার জন্য ফাইলে সংখ্যাগত কলাম প্রয়োজন।'
                        : 'Anderson-Darling test requires numeric columns in the file.'
                );
                return;
            }
            
            if (!numericColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'নির্বাচিত কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Selected column must be a numeric column.'
                );
                return;
            }
        }

        // Add validation for EDA Distribution plot
        if (testType === 'eda_distribution') {
            if (!column1) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে একটি সংখ্যাগত কলাম নির্বাচন করুন।' 
                        : 'Please select a numeric column.'
                );
                return;
            }
            
            if (numericColumns.length === 0) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'বন্টন প্লটের জন্য ফাইলে সংখ্যাগত কলাম প্রয়োজন।'
                        : 'Distribution plot requires numeric columns in the file.'
                );
                return;
            }
            
            if (!numericColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'নির্বাচিত কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Selected column must be a numeric column.'
                );
                return;
            }
        }

        // Add validation for Swarm Plot
        if (testType === 'eda_swarm') {
            if (!column1 || !column2) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে একটি শ্রেণীবদ্ধ এবং একটি সংখ্যাগত কলাম নির্বাচন করুন।' 
                        : 'Please select both a categorical and a numeric column.'
                );
                return;
            }
            
            if (categoricalColumns.length === 0 || numericColumns.length === 0) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'সোয়ার্ম প্লটের জন্য ফাইলে শ্রেণীবদ্ধ এবং সংখ্যাগত উভয় ধরনের কলাম প্রয়োজন।'
                        : 'Swarm plot requires both categorical and numeric columns in the file.'
                );
                return;
            }
            
            if (!categoricalColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'প্রথম কলামটি একটি শ্রেণীবদ্ধ কলাম হতে হবে।'
                        : 'First column must be a categorical column.'
                );
                return;
            }
            
            if (!numericColumns.includes(column2)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'দ্বিতীয় কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Second column must be a numeric column.'
                );
                return;
            }
        }

        // Add validation for Similarity test
        if (testType === 'similarity') {
            if (!column1 || !column2) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে ২টি সংখ্যাগত কলাম নির্বাচন করুন।' 
                        : 'Please select 2 numeric columns.'
                );
                return;
            }
            
            if (numericColumns.length < 2) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'সাদৃশ্য পরীক্ষার জন্য ফাইলে কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন।'
                        : 'Similarity test requires at least 2 numeric columns in the file.'
                );
                return;
            }
            
            if (!numericColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'প্রথম কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'First column must be a numeric column.'
                );
                return;
            }
            
            if (!numericColumns.includes(column2)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'দ্বিতীয় কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Second column must be a numeric column.'
                );
                return;
            }
        }        

        // Add validation for ANOVA test
        if (testType === 'anova') {
            if (!column1 || !column2) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে একটি শ্রেণীবদ্ধ এবং একটি সংখ্যাগত কলাম নির্বাচন করুন।' 
                        : 'Please select both a categorical and a numeric column.'
                );
                return;
            }
            
            if (categoricalColumns.length === 0 || numericColumns.length === 0) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'এনোভা পরীক্ষার জন্য ফাইলে শ্রেণীবদ্ধ এবং সংখ্যাগত উভয় ধরনের কলাম প্রয়োজন।'
                        : 'ANOVA test requires both categorical and numeric columns in the file.'
                );
                return;
            }
            
            if (!categoricalColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'প্রথম কলামটি একটি শ্রেণীবদ্ধ কলাম হতে হবে।'
                        : 'First column must be a categorical column.'
                );
                return;
            }
            
            if (!numericColumns.includes(column2)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'দ্বিতীয় কলামটি একটি সংখ্যাগত কলাম হতে হবে।'
                        : 'Second column must be a numeric column.'
                );
                return;
            }
        }

        // Add validation for ANCOVA test
        if (testType === 'ancova') {
            if (!column1 || !column2 || !column3) {
                setErrorMessage(
                    language === 'বাংলা' 
                        ? 'দয়া করে একটি শ্রেণীবদ্ধ এবং দুটি সংখ্যাগত কলাম নির্বাচন করুন।' 
                        : 'Please select one categorical and two numeric columns.'
                );
                return;
            }
            
            if (categoricalColumns.length === 0 || numericColumns.length < 2) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'এনকোভা পরীক্ষার জন্য ফাইলে ১টি শ্রেণীবদ্ধ এবং কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন।'
                        : 'ANCOVA test requires 1 categorical and at least 2 numeric columns in the file.'
                );
                return;
            }
            
            if (!categoricalColumns.includes(column1)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'প্রথম কলামটি একটি শ্রেণীবদ্ধ কলাম হতে হবে (গ্রুপ ভেরিয়েবল)।'
                        : 'First column must be a categorical column (group variable).'
                );
                return;
            }
            
            if (!numericColumns.includes(column2)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'দ্বিতীয় কলামটি একটি সংখ্যাগত কলাম হতে হবে (কোভেরিয়েট)।'
                        : 'Second column must be a numeric column (covariate).'
                );
                return;
            }
            
            if (!numericColumns.includes(column3)) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'তৃতীয় কলামটি একটি সংখ্যাগত কলাম হতে হবে (আউটকাম)।'
                        : 'Third column must be a numeric column (outcome).'
                );
                return;
            }
            
            // Make sure column2 and column3 are different
            if (column2 === column3) {
                setErrorMessage(
                    language === 'বাংলা'
                        ? 'কোভেরিয়েট এবং আউটকাম কলাম দুটি আলাদা হতে হবে।'
                        : 'Covariate and outcome columns must be different.'
                );
                return;
            }
        }

        setIsAnalyzing(true);
        setErrorMessage(''); // ← CLEAR ANY ERROR MESSAGES

        const langCode = language === 'বাংলা' ? 'bn' : 'en';
        const isHeatmap4x4 = heatmapSize === '4x4';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_name', fileName);
        formData.append('userID', userId);
        formData.append('Fileurl', sessionStorage.getItem("fileURL") || '');
        formData.append('test_type', testType);
        formData.append('column1', column1);
        formData.append('column2', column2);
        formData.append('language', langCode);
        formData.append('heatmapSize', heatmapSize);
        /////
        if (testType === 'ancova') {
            formData.append('primary_col', column1);
            formData.append('secondary_col', column2);
            formData.append('dependent_col', column3);
        } else if (testType === 'anova') {
            formData.append('column1', column1);
            formData.append('column2', column2);            
        } else if (testType === 'kolmogorov' || testType === 'anderson') {
            formData.append('column', column1);
        } else if (testType === 'fzt') {
            formData.append('primary_col', column1);
            formData.append('secondary_col', column2);
        } else if (testType === 'eda_distribution' || testType === 'eda_pie') {
            formData.append('column', column1);
        } else if (testType === 'eda_swarm') {
            formData.append('cat_column', column1);
            formData.append('num_column', column2);
        } else if (testType === 'similarity') {
            formData.append('column1', column1);
            formData.append('column2', column2);
    // In the formData preparation section, add:
        }else if (testType === 'mannwhitney') {
            formData.append('column1', column1);
            formData.append('column2', column2); 
            formData.append('selected_groups', JSON.stringify(selectedGroups));
                    
        } else if (testType === 'eda_basics') {
        } else if (testType === 'network_graph') {

        }
        else if (testType === 'bar_chart') {  // New Code for Bar Chart
            formData.append('column1', column1);       //  Only one column
            formData.append('orientation', barChartType); //  Vertical / Horizontal choice            
        }
        else {
            formData.append('column1', column1);
            formData.append('column2', column2);
        }

        if ((testType === 'pearson' || testType === 'spearman') && isHeatmap4x4) {
            if (column3 && column4) {
                formData.append('column3', column3);
                formData.append('column4', column4);
            } else {
                setErrorMessage('Please select 4 columns for 4x4 heatmap.');
                setIsAnalyzing(false);
                return;
            }
        }
        //

        if (['kruskal', 'mannwhitney', 'wilcoxon', 'pearson', 'spearman', 'shapiro', 'linear_regression', 'anova', 'ancova', 'kolmogorov', 'anderson', 'fzt', 'eda_distribution', 'eda_swarm', 'bar_chart', 'eda_pie', 'eda_basics', 'chi_square', 'cramers', 'cross_tabulation', 'network_graph'].includes(testType)) {
            formData.append('format', imageFormat);
            formData.append('use_default', useDefaultSettings ? 'true' : 'false');

            if (!useDefaultSettings) {
                formData.append('label_font_size', labelFontSize.toString());
                formData.append('tick_font_size', tickFontSize.toString());
                formData.append('image_quality', imageQuality.toString());
                formData.append('image_size', imageSize);
                formData.append('palette', colorPalette);
                formData.append('bar_width', barWidth.toString());
                formData.append('show_grid', showGrid ? 'true' : 'false');

                if (['kruskal', 'mannwhitney'].includes(testType)) {
                    formData.append('box_width', boxWidth.toString());
                    formData.append('violin_width', violinWidth.toString());
                }

                if (testType === 'shapiro') {
                    formData.append('bins', histogramBins.toString());
                    formData.append('bar_color', barColor);
                    formData.append('line_color', lineColor);
                    formData.append('line_style', lineStyle);
                }

                if (testType === 'linear_regression') {
                    formData.append('legend_font_size', legendFontSize.toString());
                    formData.append('line_color', lineColor);
                    formData.append('line_style', lineStyle);
                    formData.append('dot_width', dotWidth.toString());
                    formData.append('line_width', lineWidth.toString());
                    formData.append('dot_color', dotColor);
                }

                if (testType === 'anova') {
                    formData.append('box_color', boxColor);
                    formData.append('median_color', medianColor);
                }

                if (testType === 'ancova') {
                    formData.append('box_color', boxColor);
                    formData.append('line_color', lineColor);
                    formData.append('line_style', lineStyle);
                    formData.append('dot_color', dotColor);
                    formData.append('dot_width', dotWidth.toString());
                    formData.append('line_width', lineWidth.toString());
                }

                if (testType === 'kolmogorov') {
                    formData.append('label_font_size', labelFontSize.toString());
                    formData.append('tick_font_size', tickFontSize.toString());
                    formData.append('image_quality', imageQuality.toString());
                    formData.append('image_width', imageSize.split('x')[0]);
                    formData.append('image_height', imageSize.split('x')[1]);
                    formData.append('ecdf_color', dotColor);
                    formData.append('cdf_color', lineColor);
                    formData.append('line_style', lineStyle);
                }

                if (testType === 'anderson') {
                    formData.append('scatter_color', dotColor);
                    formData.append('line_color', lineColor);
                    formData.append('line_style', lineStyle);
                }

                if (testType === 'fzt') {
                    formData.append('line_width', lineWidth.toString());
                    formData.append('line_style', lineStyle);
                    formData.append('f_curve_color', fCurveColor);
                    formData.append('f_line_color', fLineColor);
                    formData.append('z_curve_color', zCurveColor);
                    formData.append('z_line_color', zLineColor);
                    formData.append('t_curve_color', tCurveColor);
                    formData.append('t_line_color', tLineColor);
                    formData.append('hist1_color', hist1Color);
                    formData.append('hist2_color', hist2Color);
                }

                if (testType === 'cross_tabulation') {
                    formData.append('column1', column1);
                    formData.append('column2', column2);
                    extraColumns.forEach((col, idx) => {
                        formData.append(`column${idx + 3}`, col);
                    });
                }

                if (testType === 'eda_distribution') {
                    formData.append('hist_color', histColor);
                    formData.append('kde_color', kdeColor);
                    formData.append('dist_color', distColor);
                }

                if (testType === 'eda_swarm') {
                    formData.append('swarm_color', swarmColor);
                }

            }

            if (['pearson', 'spearman', 'cross_tabulation', 'cramers', 'chi_square', 'network_graph'].includes(testType)) {
                formData.append('heatmapSize', heatmapSize);

                selectedColumns.forEach((col, idx) => {
                    formData.append(`column${idx + 1}`, col);
                });

            }
        }

        // Debug output
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        fetch(`${API_BASE}/analyze/`, {
            method: 'POST',
            body: formData

        })
            .then(res => res.json())
            .then(data => {
                console.log("Analysis response:", data);
                // Add timestamp to force image reload
                setResults({ ...data, _timestamp: Date.now() });
                setIsAnalyzing(false);
                setIsFirstTimeAnalysis(false);
            })
            .catch(err => {
                setErrorMessage('Error analyzing: ' + err);
                setIsAnalyzing(false);
            });
    };



    // Reset form to start a new analysis
    const resetForm = () => {
        setResults(null);
        setFile(null);
        setFileName(t.dropFile);
        setUploadStatus('initial');
        setColumns([]);
        setColumn1('');
        setColumn2('');
        setColumn3('');
        setColumn4('');
        setColumn5('');
        setTestType('');
        setReferenceValue(0);
        setHeatmapSize('');
        setSelectedColumns([]);
        setIsPreprocessed(false);
        setIsSurveyData(false);
        setIsFirstTimeAnalysis(true);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        sessionStorage.removeItem("file_name");
        sessionStorage.removeItem("fileURL");
        sessionStorage.removeItem("activesheetname");
        setFileURL("")

    };

    // Get required fields based on test type
    const getRequiredFields = () => {
        switch (testType) {
            case 'ttest_onesample':
                return { col2: false, col3: false, refValue: true, heatmapSize: false };
            case 'cross_tabulation':
            case 'network_graph':
            case 'cramers':
            case 'chi_square':
            case 'spearman':
            case 'pearson':
                return { col2: false, col3: false, col4: false, refValue: false, heatmapSize: true };
            case 'shapiro':
            case 'kolmogorov':
            case 'anderson':
            case 'mannwhitney':                
            case 'kruskal':
            case 'wilcoxon':
            case 'linear_regression':
            case 'eda_pie':
            case 'bar_chart':
            case 'eda_distribution':
            case 'eda_swarm':
            case 'similarity':
            case 'anova':
            case 'ancova':                    
                return { col2: false, col3: false, refValue: false, heatmapSize: false, bengaliOptions: true };
            case 'fzt':
                return { col2: true, col3: false, refValue: false, heatmapSize: false, bengaliOptions: true };
            case 'eda_basics':
                return { col2: false, col3: false, refValue: false, heatmapSize: false };        
            default:
                return { col2: true, col3: false, refValue: false, heatmapSize: false };
        }
    };

    // Required fields for current test type
    const requiredFields = getRequiredFields();

    const [data, setData] = useState([]);
    const [availableColumns, setAvailableColumns] = useState([]);

    const handlePreviewClick = async () => {
        setIsPreviewModalOpen(true);
        console.log("Preview button clicked");
        //send is preprocessed and isSurveyData to backend
        let filetype = '';

        if (isPreprocessed) {
            filetype = 'preprocessed';
        } else if (isSurveyData) {
            filetype = 'survey';
        }

    };


    const handleSuggestionClick = () => {


        setIsSuggestionModalOpen(true);
        console.log("Suggestion button clicked");

        // Optional: scroll to the suggestion panel or show modal
    };
const closePreview= async () =>{
    setIsPreviewModalOpen(false);
}

    return (


        <div className="an-wrapper">

            <header className="page-header">
                <h1 className="an-page-title">{t.title}</h1>
            </header>

            <div className="an-content-center">
                <div className="an-form-wrapper">
                                {isPreviewModalOpen && (
                                    <div className="prev-modal-overlay">
                                        
                                        <div className="prev-modal-container">
                                             <button className="prev-close-btn" onClick={closePreview}>X</button>
                                            <h3>Data Preview</h3>
                                            

                                                <PreviewTable workbookUrl={`http://127.0.0.1:8000${sessionStorage.getItem("fileURL")}`} columns={columns} initialData={data} data={data} setData={setData} setIsPreviewModalOpen={setIsPreviewModalOpen} isPreviewModalOpen={isPreviewModalOpen} />
                                        
                                        </div>
                                    </div>
                                    )}
                    {/* Error Message */}
                    {/* {errorMessage && (
                        <div className="error-box">
                            <div className="error-icon">
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="error-text">{errorMessage}</div>
                        </div>
                    )} */}

                    {!results ? (
                        <div className="an-card">
                            
                            <div className="card-header">
                                <div className="header-left">
                                    <svg className="header-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                    <span>{t.formTitle}</span>
                                </div>
                                <button 
                                // disabled={true}
                                // // muted
                                // style={{
                                    
                                //     cursor: "not-allowed"
                                // }}
                                onClick={() => navigate("/report")} className="an-btn an-btn-primary small">
                                    {language === "বাংলা" ? "রিপোর্ট দেখুন" : "Show Report"}
                                </button>
                            </div>

                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-section">
                                        {!(isPreprocessed || isSurveyData || file) && (
                                            <h5 className="section-title">
                                                {isPreprocessed
                                                    ? t.preprocessedLabel
                                                    : isSurveyData
                                                        ? t.surveyLabel
                                                        : t.uploadLabel}
                                            </h5>
                                        )}

                                        {(isPreprocessed || isSurveyData || file) ? (
                                            <div className="uploaded-container">
                                                <div className="left-partition">
                                                    <div className="file-info-box">
                                                        <svg className="file-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                        <div className="file-details">
                                                            <span className="file-label">
                                                                {isPreprocessed ? "Preprocessed file" : isSurveyData ? "Survey file" : "Uploaded file"}
                                                            </span>
                                                            <strong className="file-name">{fileName}</strong>
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-start',
                                                        gap: '10px',
                                                        margin: '0 0',
                                                        marginTop: '1rem',
                                                    }}>
                                                        <div className="action-buttons" style={{
                                                            display: 'flex',
                                                            gap: '12px',
                                                            justifyContent: 'flex-start'
                                                        }}>
                                                            <button
                                                                type="button"
                                                                className="customize-btn"
                                                                //    disabled={true}
                                                                // // muted
                                                                // style={{
                                                                //     opacity: 0.6,
                                                                //     cursor: "not-allowed"
                                                                // }}
                                                                onClick={handlePreviewClick}
                                                            >
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                                    <circle cx="12" cy="12" r="3"></circle>
                                                                </svg>
                                                                {language === "bn" ? "ডেটা প্রিভিউ" : "Preview"}
                                                            </button>
                                                            

                                                            <button
                                                                type="button"
                                                                className="customize-btn"
                                                                // disabled={true}
                                                                // // muted
                                                                // style={{
                                                                //     opacity: 0.6,
                                                                //     cursor: "not-allowed"
                                                                // }}
                                                                onClick={() => {
                                                                    const path = "/preprocess";
                                                                    navigate(path, { state: { userId: userId, filename: fileName } });
                                                                }}
                                                            >
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M12 2v6m0 4v10M4 8l4 4-4 4m16-8l-4 4 4 4"></path>
                                                                </svg>
                                                                {language === "bn" ? "ডেটা প্রিপ্রসেস করুন" : "Preprocess"}
                                                                
                                                            </button>

                                                            <button
                                                                onClick={resetForm}
                                                                className="customize-btn"
                                                            >
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                                                                    <path d="M21 3v5h-5"></path>
                                                                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                                                                    <path d="M3 21v-5h5"></path>
                                                                </svg>
                                                                Reset
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="right-partition">
                                                    <div className="insights-placeholder">
                                                        <h6 className="insights-title">File Insights</h6>
                                                        <p className="insights-text">Insights will appear here</p>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                            
                                            
                                        ) : (
                                            <div className="upload-folder-container">
                                                {/* File Upload Section */}
                                                <div
                                                    ref={uploadContainerRef}
                                                    className={`action-box upload-box ${uploadStatus === "loading"
                                                        ? "loading"
                                                        : uploadStatus === "success"
                                                            ? "success"
                                                            : ""
                                                        }`}
                                                    onClick={() => fileInputRef.current.click()}
                                                >
                                                    <svg className="action-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                        />
                                                    </svg>
                                                    <p className="action-text">{t.dropFile}</p>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        className="hidden-input"
                                                        accept=".xls,.xlsx"
                                                        onClick={(e) => (e.target.value = null)}
                                                        onChange={handleFileChange}
                                                    />
                                                </div>

                                                {/* Vertical Divider */}
                                                <div className="vertical-divider">
                                                    <span>Or</span>
                                                </div>

                                                {/* Saved Folder Section */}
                                                <div
                                                    className="action-box folder-box"
                                                    onClick={() => navigate("/saved-files")}
                                                >
                                                    <svg className="action-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                                        />
                                                    </svg>
                                                    <p className="action-text">Import file from DataGhurhi Saved Folder</p>
                                                </div>
                                            </div>
                                        )}

                                        {uploadStatus === "loading" && (
                                            <div className="status-line">
                                                <div className="spinner" />
                                                {t.processing}
                                            </div>
                                        )}

                                        <style jsx>{`
                                            .customize-btn {
                                                
                                                border-color: #22c55e;
                                            }

                                            .customize-btn:hover {
                                                background-color: rgba(34, 197, 94, 0.1); /* Light green background */
                                                border-color: #22c55e; /* Green border */
                                                color: #16a34a; /* Green text */
                                        `}</style>
                                    </div>

                                    <style jsx>{`
                                        .uploaded-container {
                                            display: flex;
                                            gap: 1.5rem;
                                            width: 100%;
                                        }

                                        .left-partition {
                                            flex: 1;
                                            display: flex;
                                            flex-direction: column;
                                            gap: 0;
                                        }

                                        .right-partition {
                                            flex: 1;
                                            display: flex;
                                            flex-direction: column;
                                        }

                                        .insights-placeholder {
                                            padding: 1.5rem;
                                            border: 2px dashed #e2e8f0;
                                            border-radius: 12px;
                                            background-color: #f7fafc;
                                            min-height: 200px;
                                            display: flex;
                                            flex-direction: column;
                                            align-items: center;
                                            justify-content: center;
                                        }

                                        .insights-title {
                                            font-size: 1.125rem;
                                            font-weight: 600;
                                            color: #4a5568;
                                            margin: 0 0 0.5rem 0;
                                        }

                                        .insights-text {
                                            font-size: 0.875rem;
                                            color: #a0aec0;
                                            margin: 0;
                                        }

                                        .upload-folder-container {
                                            display: flex;
                                            align-items: stretch;
                                            gap: 0;
                                            width: 100%;
                                        }

                                        .action-box {
                                            flex: 1;
                                            display: flex;
                                            flex-direction: column;
                                            align-items: center;
                                            justify-content: center;
                                            padding: 1.5rem;
                                            border: 2px solid #e2e8f0;
                                            border-radius: 12px;
                                            cursor: pointer;
                                            transition: all 0.3s ease;
                                            min-height: 120px;
                                            background-color: #ffffff;
                                        }

                                        .action-box:hover {
                                            border-color: #4bb77d;
                                            background-color: #f7fafc;
                                            transform: translateY(-2px);
                                            box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
                                        }

                                        .upload-box.loading {
                                            border-color: #4bb77d;
                                            background-color: #ebf8ff;
                                        }

                                        .upload-box.success {
                                            border-color: #48bb78;
                                            background-color: #f0fff4;
                                        }

                                        .upload-box.success .action-icon {
                                            color: #48bb78;
                                        }

                                        .action-icon {
                                            width: 48px;
                                            height: 48px;
                                            margin-bottom: 0.75rem;
                                            color: #4a5568;
                                            transition: all 0.3s ease;
                                        }

                                        .upload-box .action-icon {
                                            color: #4bb77d;
                                        }

                                        .folder-box .action-icon {
                                            color: #4bb77d;
                                        }

                                        .action-box:hover .action-icon {
                                            transform: scale(1.1);
                                        }

                                        .action-text {
                                            margin: 0;
                                            color: #2d3748;
                                            font-size: 1rem;
                                            font-weight: 500;
                                            text-align: center;
                                        }

                                        .vertical-divider {
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            padding: 0 1.5rem;
                                            position: relative;
                                        }

                                        .vertical-divider::before {
                                            content: '';
                                            position: absolute;
                                            left: 50%;
                                            top: 0;
                                            bottom: 0;
                                            width: 1px;
                                            background-color: #e2e8f0;
                                            transform: translateX(-50%);
                                        }

                                        .vertical-divider span {
                                            background-color: white;
                                            padding: 0.5rem;
                                            color: #a0aec0;
                                            font-size: 0.875rem;
                                            font-weight: 500;
                                            position: relative;
                                            z-index: 1;
                                        }

                                        .hidden-input {
                                            display: none;
                                        }

                                        .file-info-box {
                                            display: flex;
                                            align-items: center;
                                            padding: 1.5rem;
                                            border: 2px solid #48bb78;
                                            border-radius: 12px;
                                            background-color: #f0fff4;
                                            gap: 1rem;
                                        }

                                        .file-icon {
                                            width: 48px;
                                            height: 48px;
                                            color: #48bb78;
                                            flex-shrink: 0;
                                        }

                                        .file-details {
                                            display: flex;
                                            flex-direction: column;
                                            gap: 0.25rem;
                                        }

                                        .file-label {
                                            font-size: 0.875rem;
                                            color: #2d3748;
                                        }

                                        .file-name {
                                            font-size: 1rem;
                                            color: #1a202c;
                                            font-weight: 600;
                                        }

                                        /* Mobile View - Show only icons */
                                        @media (max-width: 768px) {
                                            .uploaded-container {
                                                flex-direction: column;
                                                gap: 1rem;
                                            }

                                            .upload-folder-container {
                                                gap: 1rem;
                                            }

                                            .action-box {
                                                padding: 1.5rem 1rem;
                                                min-height: 150px;
                                            }

                                            .action-icon {
                                                width: 48px;
                                                height: 48px;
                                                margin-bottom: 0;
                                            }

                                            .action-text {
                                                display: none;
                                            }

                                            .vertical-divider {
                                                padding: 0 0.75rem;
                                            }

                                            .vertical-divider span {
                                                font-size: 0.75rem;
                                                padding: 0.25rem 0.5rem;
                                            }
                                        }

                                        @media (max-width: 480px) {
                                            .action-box {
                                                padding: 1rem 0.5rem;
                                                min-height: 120px;
                                            }

                                            .action-icon {
                                                width: 40px;
                                                height: 40px;
                                            }

                                            .vertical-divider {
                                                padding: 0 0.5rem;
                                            }
                                        }
                                    `}</style>

                                        {(isPreprocessed || isSurveyData || file) ? (
                                            <div className="form-section">
                                                <h5 className="section-title">{t.selectTest}</h5>
                                                <label className="form-label">{t.testType}</label>
                                                <select className="form-select" value={testType} onChange={(e) => setTestType(e.target.value)}>
                                                    <option value="" disabled>
                                                        {t.selectPrompt}
                                                    </option>
                                                    <optgroup label={t.testGroups.eda}>
                                                        <option value="eda_basics">{t.tests.eda_basics}</option>
                                                        <option value="eda_distribution">{t.tests.eda_distribution}</option>
                                                        <option value="eda_swarm">{t.tests.eda_swarm}</option>
                                                        <option value="eda_pie">{t.tests.eda_pie}</option>
                                                        <option value="bar_chart">{t.tests.bar_chart}</option>
                                                        <option value="similarity">{t.tests.similarity}</option>
                                                    </optgroup>
                                                    <optgroup label={t.testGroups.nonParametric}>
                                                        <option value="kruskal">{t.tests.kruskal}</option>
                                                        <option value="mannwhitney">{t.tests.mannwhitney}</option>
                                                        <option value="wilcoxon">{t.tests.wilcoxon}</option>
                                                    </optgroup>
                                                    <optgroup label={t.testGroups.correlation}>
                                                        <option value="pearson">{t.tests.pearson}</option>
                                                        <option value="spearman">{t.tests.spearman}</option>
                                                    </optgroup>
                                                    <optgroup label={t.testGroups.parametric}>
                                                        <option value="f_test">{t.tests.f_test}</option>
                                                        <option value="z_test">{t.tests.z_test}</option>
                                                        <option value="t_test">{t.tests.t_test}</option>
                                                    <option value="fzt_visualization">{t.tests.fzt_visualization}</option>
                                                    </optgroup>
                                                    <optgroup label={t.testGroups.regression}>
                                                        <option value="linear_regression">{t.tests.linear_regression}</option>
                                                    </optgroup>
                                                    <optgroup label={t.testGroups.anova}>
                                                        <option value="anova">{t.tests.anova}</option>
                                                        <option value="ancova">{t.tests.ancova}</option>
                                                    </optgroup>
                                                    <optgroup label={t.testGroups.other}>
                                                        <option value="shapiro">{t.tests.shapiro}</option>
                                                        <option value="kolmogorov">{t.tests.kolmogorov}</option>
                                                        <option value="anderson">{t.tests.anderson}</option>
                                                        <option value="cross_tabulation">{t.tests.cross_tabulation}</option>
                                                        <option value="chi_square">{t.tests.chi_square}</option>
                                                        <option value="cramers">{t.tests.cramers}</option>
                                                        <option value="network_graph">{t.tests.network_graph}</option>
                                                    </optgroup>
                                                </select>

                                                <div className="test-description-hint">{t.selectPrompt}</div>

                                                    {testType && t.descriptions[testType] && (
                                                        <div className="mt-2 p-3 bg-gray-100 text-gray-700 text-sm rounded shadow-sm text-left">

                                                            <strong className="block text-gray-800 mb-1">
                                                                {language === 'bn' ? 'পরীক্ষার বিবরণ:' : 'Statistical Test Description:'}
                                                            </strong>
                                                            
                                                            {/* Description */}
                                                            <div className="text-xs text-gray-600 mb-2">
                                                                {t.descriptions[testType]}
                                                            </div>

                                                            {/* Button on new line */}
                                                            
                                                            {!testsWithoutDetails.includes(testType) && (
                                                                <div>
                                                                    <button
                                                                    type="button"
                                                                    onClick={() => setDetailsModalVisible(true)}
                                                                    className="text-blue-600 text-xs underline hover:text-blue-800"
                                                                    >
                                                                    {language === 'bn' ? 'বিস্তারিত দেখুন' : 'More Details'}
                                                                    </button>
                                                                </div>
                                                            )}                                                            
                                                            
                                                        </div>
                                                    )}

                                            </div>) : null}

                                    
                                    {(isPreprocessed || isSurveyData || file) && (
                                        <div className="form-section">

                                        {(testType === 'pearson' || testType === 'network_graph' || testType === 'spearman' || testType === 'cross_tabulation' || testType === 'chi_square' || testType === 'cramers') && (
                                            <div style={{ marginBottom: '2rem' }}>
                                                <h5 className="section-title">{t.selectColumns}</h5>

                                                {/* Selected Columns Display */}
                                                <div style={{
                                                    border: '2px solid #d1d5db',
                                                    borderRadius: '0.5rem',
                                                    padding: '1rem',
                                                    backgroundColor: '#f9fafb',
                                                    minHeight: '60px',
                                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                                }}>
                                                    {selectedColumns.length > 0 ? (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                            {selectedColumns.map((col, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.5rem',
                                                                        padding: '0.25rem 0.5rem',
                                                                        backgroundColor: '#3b82f6',
                                                                        borderRadius: '0.5rem',
                                                                        fontSize: '0.875rem',
                                                                        fontWeight: '600',
                                                                        color: 'white',
                                                                        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)'
                                                                    }}
                                                                >
                                                                    <span>{col}</span>
                                                                    <button
                                                                        type="button"
                                                                        style={{
                                                                            width: '1.5rem',
                                                                            height: '1.5rem',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: '#2563eb',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            cursor: 'pointer',
                                                                            fontSize: '1.25rem',
                                                                            fontWeight: 'bold',
                                                                            transition: 'background-color 0.2s'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                                                        onClick={() => setSelectedColumns(prev => prev.filter(c => c !== col))}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'left',
                                                            justifyContent: 'left',
                                                            height: '100%',
                                                            color: '#9ca3af',
                                                            fontStyle: 'italic',
                                                            fontSize: '0.875rem'
                                                        }}>
                                                            No columns selected yet
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Dropdown Menu Button */}
                                                <div style={{ marginTop: '1rem', position: 'relative' }}>
                                                    <button
                                                        type="button"
                                                        style={{
                                                            width: '100%',
                                                            border: '2px solid #d1d5db',
                                                            borderRadius: '0.5rem',
                                                            padding: '1rem',
                                                            backgroundColor: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            cursor: 'pointer',
                                                            fontSize: '1rem',
                                                            fontWeight: '500',
                                                            transition: 'all 0.2s',
                                                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#eff6ff';
                                                            e.currentTarget.style.borderColor = '#3b82f6';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'white';
                                                            e.currentTarget.style.borderColor = '#d1d5db';
                                                        }}
                                                        onClick={() => setShowColumnMenu(prev => !prev)}
                                                    >
                                                        <span style={{ color: '#374151' }}>Choose columns from list...</span>
                                                        <span style={{
                                                            color: '#6b7280',
                                                            transition: 'transform 0.2s',
                                                            transform: showColumnMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            display: 'inline-block'
                                                        }}>
                                                            ▼
                                                        </span>
                                                    </button>

                                                    {/* Dropdown Panel */}
                                                    {showColumnMenu && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            zIndex: 20,
                                                            bottom: '100%',
                                                            marginBottom: '0.5rem',
                                                            width: '100%',
                                                            border: '2px solid #d1d5db',
                                                            borderRadius: '0.5rem',
                                                            backgroundColor: 'white',
                                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {/* Column List */}
                                                            <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
                                                                {columns.map((col, idx) => {
                                                                    const isSelected = tempSelectedColumns.includes(col);
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            style={{
                                                                                padding: '0.75rem 1rem',
                                                                                cursor: 'pointer',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '0.75rem',
                                                                                backgroundColor: isSelected ? '#dbeafe' : 'white',
                                                                                borderBottom: idx !== columns.length - 1 ? '1px solid #e5e7eb' : 'none',
                                                                                transition: 'background-color 0.15s'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.currentTarget.style.backgroundColor = isSelected ? '#bfdbfe' : '#f3f4f6';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.currentTarget.style.backgroundColor = isSelected ? '#dbeafe' : 'white';
                                                                            }}
                                                                            onClick={() => {
                                                                                if (tempSelectedColumns.includes(col)) {
                                                                                    setTempSelectedColumns(prev => prev.filter(c => c !== col));
                                                                                } else {
                                                                                    setTempSelectedColumns(prev => [...prev, col]);
                                                                                }
                                                                            }}
                                                                        >
                                                                            {/* Checkbox */}
                                                                            <div style={{
                                                                                width: '1.0rem',
                                                                                height: '1.0rem',
                                                                                borderRadius: '0.25rem',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                flexShrink: 0,
                                                                                backgroundColor: isSelected ? '#3b82f6' : 'white',
                                                                                border: isSelected ? '2px solid #3b82f6' : '2px solid #9ca3af',
                                                                                transition: 'all 0.15s'
                                                                            }}>
                                                                                {isSelected && (
                                                                                    <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                    </svg>
                                                                                )}
                                                                            </div>
                                                                            {/* Column Name */}
                                                                            <span style={{
                                                                                fontWeight: '600',
                                                                                fontSize: '0.9375rem',
                                                                                color: isSelected ? '#1e40af' : '#1f2937'
                                                                            }}>
                                                                                {col}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div style={{
                                                                borderTop: '1px solid #e5e7eb',
                                                                padding: '0.5rem',
                                                                display: 'flex',
                                                                gap: '0.5rem',
                                                                backgroundColor: 'white'
                                                            }}>
                                                                <button
                                                                    type="button"
                                                                    style={{
                                                                        backgroundColor: '#10b981',
                                                                        color: 'white',
                                                                        borderRadius: '0.375rem',
                                                                        padding: '0.5rem 1rem',
                                                                        border: 'none',
                                                                        fontWeight: '600',
                                                                        fontSize: '0.875rem',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s',
                                                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#059669';
                                                                        e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.1)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#10b981';
                                                                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                                                                    }}
                                                                    onClick={() => {
                                                                        setSelectedColumns(tempSelectedColumns);
                                                                        setShowColumnMenu(false);
                                                                    }}
                                                                >
                                                                    ✓ Apply
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    style={{
                                                                        backgroundColor: '#e5e7eb',
                                                                        color: '#1f2937',
                                                                        borderRadius: '0.375rem',
                                                                        padding: '0.5rem 1rem',
                                                                        border: '1px solid #d1d5db',
                                                                        fontWeight: '600',
                                                                        fontSize: '0.875rem',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#d1d5db';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#e5e7eb';
                                                                    }}
                                                                    onClick={() => {
                                                                        setTempSelectedColumns(selectedColumns);
                                                                        setShowColumnMenu(false);
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Selection Counter */}
                                                <div style={{
                                                    marginTop: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0 0.25rem'
                                                }}>
                                                    <p style={{
                                                        fontSize: '0.875rem',
                                                        color: '#374151',
                                                        fontWeight: '600'
                                                    }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{
                                                                width: '0.5rem',
                                                                height: '0.5rem',
                                                                backgroundColor: '#3b82f6',
                                                                borderRadius: '50%'
                                                            }}></span>
                                                            {selectedColumns.length} column{selectedColumns.length !== 1 ? 's' : ''} selected
                                                        </span>
                                                    </p>
                                                    {selectedColumns.length > 0 && (
                                                        <button
                                                            type="button"
                                                            style={{
                                                                fontSize: '0.875rem',
                                                                color: '#dc2626',
                                                                fontWeight: '600',
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                transition: 'color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.color = '#991b1b';
                                                                e.currentTarget.style.textDecoration = 'underline';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.color = '#dc2626';
                                                                e.currentTarget.style.textDecoration = 'none';
                                                            }}
                                                            onClick={() => {
                                                                setSelectedColumns([]);
                                                                setTempSelectedColumns([]);
                                                            }}
                                                        >
                                                            Clear all
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {testType !== 'eda_basics' && (
                                            <div className="mb-6">
                                                {/* Only show the heading if the testType is NOT one of the ones you want to skip */}
                                                {/* {!['spearman', 'pearson', 'cross_tabulation', 'network_graph'].includes(testType) && (
                                                        <h5 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                                                            {t.selectVariables}
                                                        </h5>
                                                    )} */}


                                                {/* For other tests - keep existing code */}
                                                {testType !== 'kruskal' && testType !== 'mannwhitney' && testType !== 'wilcoxon' && testType !== 'linear_regression' && testType !== 'bar_chart' && testType !== 'eda_pie' && testType !== 'shapiro' && testType !== 'kolmogorov' && testType !== 'anderson' && testType !== 'eda_distribution' && testType !== 'eda_swarm' && testType !== 'similarity' && testType !== 'anova' && testType !== 'ancova' && !["spearman", "pearson", "cross_tabulation", "network_graph", "cramers", "chi_square"].includes(testType) && (
                                                    <div className="form-group">
                                                        <h5 className="section-title">{t.selectColumns}</h5>
                                                        <label className="form-label">
                                                            {(testType === "kolmogorov" ||
                                                                testType === "anderson" ||
                                                                testType === "shapiro" ||
                                                                testType === "eda_distribution")
                                                                ? language === "bn"
                                                                    ? "একটি সংখ্যাগত কলাম নির্বাচন করুন"
                                                                    : "Pick a Numerical Column"
                                                                : t.column1}
                                                        </label>
                                                        <select
                                                            className="form-select"
                                                            value={column1}
                                                            onChange={(e) => setColumn1(e.target.value)}
                                                            disabled={columns.length === 0}
                                                        >
                                                            {columns.length === 0 ? (
                                                                <option value="">-- Upload a file first --</option>
                                                            ) : (
                                                                columns.map((col, idx) => (
                                                                    <option key={idx} value={col}>
                                                                        {col}
                                                                    </option>
                                                                ))
                                                            )}
                                                        </select>
                                                    </div>
                                                )}                                              

                                                {/* Combined component for tests requiring 1 categorical + 1 numeric column (Kruskal, Swarm Plot, ANOVA) */}
                                                {(testType === 'kruskal' || testType === 'eda_swarm' || testType === 'anova') && (
                                                    <div className="form-section">
                                                        <h5 className="section-title">{t.selectColumns}</h5>
                                                        
                                                        {columnTypesError && (
                                                            <div className="error-box" style={{ marginBottom: '1rem' }}>
                                                                <div className="error-icon">
                                                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <div className="error-text">{columnTypesError}</div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Dynamic labels based on test type */}
                                                        {/* Column 1 - Categorical variable */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {testType === 'kruskal'
                                                                    ? (language === "বাংলা" ? "গ্রুপিং কলাম (শ্রেণীবদ্ধ)" : "Grouping Column (Categorical)")
                                                                    : testType === 'eda_swarm'
                                                                    ? (language === "বাংলা" ? "শ্রেণীবদ্ধ কলাম (X-অক্ষ)" : "Categorical Column (X-axis)")
                                                                    : (language === "বাংলা" ? "ফ্যাক্টর কলাম (শ্রেণীবদ্ধ)" : "Factor Column (Categorical)")
                                                                }
                                                                <span className="required-star">*</span>
                                                            </label>
                                                            
                                                            {!columnTypesLoaded ? (
                                                                <div className="loading-placeholder">
                                                                    <div className="spinner small"></div>
                                                                    {isFetchingColumnTypes 
                                                                        ? (language === "বাংলা" ? "কলাম বিশ্লেষণ করা হচ্ছে..." : "Analyzing column types...")
                                                                        : (language === "বাংলা" ? "কলাম লোড হচ্ছে..." : "Loading columns...")
                                                                    }
                                                                </div>
                                                            ) : categoricalColumns.length === 0 ? (
                                                                <div className="no-columns-warning">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                    </svg>
                                                                    <span>
                                                                        {testType === 'kruskal'
                                                                            ? (language === "বাংলা" 
                                                                                ? "ক্রুসকাল-ওয়ালিস পরীক্ষার জন্য শ্রেণীবদ্ধ কলাম প্রয়োজন। ফাইলে কোন শ্রেণীবদ্ধ কলাম পাওয়া যায়নি।" 
                                                                                : "Kruskal-Wallis test requires categorical columns. No categorical columns found in the file.")
                                                                            : testType === 'eda_swarm'
                                                                            ? (language === "বাংলা" 
                                                                                ? "সোয়ার্ম প্লটের জন্য শ্রেণীবদ্ধ কলাম প্রয়োজন। ফাইলে কোন শ্রেণীবদ্ধ কলাম পাওয়া যায়নি।" 
                                                                                : "Swarm plot requires categorical columns. No categorical columns found in the file.")
                                                                            : (language === "বাংলা" 
                                                                                ? "এনোভা পরীক্ষার জন্য শ্রেণীবদ্ধ কলাম প্রয়োজন। ফাইলে কোন শ্রেণীবদ্ধ কলাম পাওয়া যায়নি।" 
                                                                                : "ANOVA test requires categorical columns. No categorical columns found in the file.")
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        className="form-select"
                                                                        value={column1}
                                                                        onChange={(e) => setColumn1(e.target.value)}
                                                                    >
                                                                        <option value="">
                                                                            {language === "বাংলা" 
                                                                                ? "একটি শ্রেণীবদ্ধ কলাম নির্বাচন করুন" 
                                                                                : "Select a categorical column"}
                                                                        </option>
                                                                        {categoricalColumns.map((col, idx) => (
                                                                            <option key={idx} value={col}>
                                                                                {col} {language === "বাংলা" ? "(শ্রেণীবদ্ধ)" : "(categorical)"}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="column-count-hint">
                                                                        {language === "বাংলা" 
                                                                            ? `${categoricalColumns.length}টি শ্রেণীবদ্ধ কলাম পাওয়া গেছে` 
                                                                            : `${categoricalColumns.length} categorical columns found`}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Column 2 - Numerical variable */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {testType === 'kruskal'
                                                                    ? (language === "বাংলা" ? "মান কলাম (সংখ্যাগত)" : "Value Column (Numeric)")
                                                                    : testType === 'eda_swarm'
                                                                    ? (language === "বাংলা" ? "সংখ্যাগত কলাম (Y-অক্ষ)" : "Numeric Column (Y-axis)")
                                                                    : (language === "বাংলা" ? "নির্ভরশীল চলক (সংখ্যাগত)" : "Dependent Variable (Numeric)")
                                                                }
                                                                <span className="required-star">*</span>
                                                            </label>
                                                            
                                                            {!columnTypesLoaded ? (
                                                                <div className="loading-placeholder">
                                                                    <div className="spinner small"></div>
                                                                    {isFetchingColumnTypes 
                                                                        ? (language === "বাংলা" ? "কলাম বিশ্লেষণ করা হচ্ছে..." : "Analyzing column types...")
                                                                        : (language === "বাংলা" ? "কলাম লোড হচ্ছে..." : "Loading columns...")
                                                                    }
                                                                </div>
                                                            ) : numericColumns.length === 0 ? (
                                                                <div className="no-columns-warning">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                    </svg>
                                                                    <span>
                                                                        {testType === 'kruskal'
                                                                            ? (language === "বাংলা" 
                                                                                ? "ক্রুসকাল-ওয়ালিস পরীক্ষার জন্য সংখ্যাগত কলাম প্রয়োজন। ফাইলে কোন সংখ্যাগত কলাম পাওয়া যায়নি।" 
                                                                                : "Kruskal-Wallis test requires numeric columns. No numeric columns found in the file.")
                                                                            : testType === 'eda_swarm'
                                                                            ? (language === "বাংলা" 
                                                                                ? "সোয়ার্ম প্লটের জন্য সংখ্যাগত কলাম প্রয়োজন। ফাইলে কোন সংখ্যাগত কলাম পাওয়া যায়নি।" 
                                                                                : "Swarm plot requires numeric columns. No numeric columns found in the file.")
                                                                            : (language === "বাংলা" 
                                                                                ? "এনোভা পরীক্ষার জন্য সংখ্যাগত কলাম প্রয়োজন। ফাইলে কোন সংখ্যাগত কলাম পাওয়া যায়নি।" 
                                                                                : "ANOVA test requires numeric columns. No numeric columns found in the file.")
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        className="form-select"
                                                                        value={column2}
                                                                        onChange={(e) => setColumn2(e.target.value)}
                                                                    >
                                                                        <option value="">
                                                                            {language === "বাংলা" 
                                                                                ? "একটি সংখ্যাগত কলাম নির্বাচন করুন" 
                                                                                : "Select a numeric column"}
                                                                        </option>
                                                                        {numericColumns.map((col, idx) => (
                                                                            <option key={idx} value={col}>
                                                                                {col} {language === "বাংলা" ? "(সংখ্যাগত)" : "(numeric)"}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="column-count-hint">
                                                                        {language === "বাংলা" 
                                                                            ? `${numericColumns.length}টি সংখ্যাগত কলাম পাওয়া গেছে` 
                                                                            : `${numericColumns.length} numeric columns found`}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Test-specific Information */}
                                                        {testType === 'kruskal' && (
                                                            <div style={{ 
                                                                marginTop: '1rem', 
                                                                padding: '0.75rem', 
                                                                backgroundColor: '#f0f9ff', 
                                                                border: '1px solid #bae6fd',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.875rem'
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="8" x2="12" y2="8"></line>
                                                                    </svg>
                                                                    <div>
                                                                        <strong style={{ color: '#0369a1' }}>
                                                                            {language === "বাংলা" ? "ক্রুসকাল-ওয়ালিস পরীক্ষা নির্দেশনা" : "Kruskal-Wallis Test Guidelines"}
                                                                        </strong>
                                                                        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem', color: '#475569' }}>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "দুই বা ততোধিক স্বাধীন গোষ্ঠীর মধ্যকার পার্থক্য পরীক্ষা করে"
                                                                                    : "Tests for differences between two or more independent groups"}
                                                                            </li>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "নন-প্যারামেট্রিক (স্বাভাবিক বন্টনের প্রয়োজন নেই)"
                                                                                    : "Non-parametric (doesn't require normal distribution)"}
                                                                            </li>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "প্রতিটি গোষ্ঠীতে কমপক্ষে ৫টি পর্যবেক্ষণ সুপারিশকৃত"
                                                                                    : "At least 5 observations per group recommended"}
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {testType === 'eda_swarm' && (
                                                            <div style={{ 
                                                                marginTop: '1rem', 
                                                                padding: '0.75rem', 
                                                                backgroundColor: '#f0f9ff', 
                                                                border: '1px solid #bae6fd',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.875rem'
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="8" x2="12" y2="8"></line>
                                                                    </svg>
                                                                    <div>
                                                                        <strong style={{ color: '#0369a1' }}>
                                                                            {language === "বাংলা" ? "সোয়ার্ম প্লট নির্দেশনা" : "Swarm Plot Guidelines"}
                                                                        </strong>
                                                                        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem', color: '#475569' }}>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "প্রতিটি শ্রেণীর মধ্যে ডেটা পয়েন্টের বন্টন দেখায়"
                                                                                    : "Shows distribution of data points within each category"}
                                                                            </li>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "ওভারল্যাপিং পয়েন্টগুলি উপরে-নীচে সাজানো হয়"
                                                                                    : "Overlapping points are arranged vertically to avoid overlap"}
                                                                            </li>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "ছোট থেকে মাঝারি নমুনার জন্য আদর্শ (n < 100)"
                                                                                    : "Ideal for small to medium samples (n < 100)"}
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {testType === 'anova' && (
                                                            <div style={{ 
                                                                marginTop: '1rem', 
                                                                padding: '0.75rem', 
                                                                backgroundColor: '#f0f9ff', 
                                                                border: '1px solid #bae6fd',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.875rem'
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="8" x2="12" y2="8"></line>
                                                                    </svg>
                                                                    <div>
                                                                        <strong style={{ color: '#0369a1' }}>
                                                                            {language === "বাংলা" ? "এনোভা পরীক্ষা নির্দেশনা" : "ANOVA Test Guidelines"}
                                                                        </strong>
                                                                        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem', color: '#475569' }}>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "দুই বা ততোধিক গোষ্ঠীর গড় মানের পার্থক্য পরীক্ষা করে"
                                                                                    : "Tests for differences in means between two or more groups"}
                                                                            </li>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "প্যারামেট্রিক (স্বাভাবিক বন্টন ও সমান ভ্যারিয়েন্স প্রয়োজন)"
                                                                                    : "Parametric (requires normal distribution and equal variances)"}
                                                                            </li>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "প্রতিটি গোষ্ঠীতে কমপক্ষে ১০টি পর্যবেক্ষণ সুপারিশকৃত"
                                                                                    : "At least 10 observations per group recommended"}
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* For Mann-Whitney test - special column type handling with grouping */}
                                                {testType === 'mannwhitney' && (
                                                    <div className="form-section">
                                                        <h5 className="section-title">{t.selectColumns}</h5>
                                                        
                                                        {columnTypesError && (
                                                            <div className="error-box" style={{ marginBottom: '1rem' }}>
                                                                <div className="error-icon">
                                                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <div className="error-text">{columnTypesError}</div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Column 1 - Categorical (Grouping variable) */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {language === "বাংলা" ? "গ্রুপিং কলাম (শ্রেণীবদ্ধ)" : "Grouping Column (Categorical)"}
                                                                <span className="required-star">*</span>
                                                            </label>
                                                            

                                                            {!columnTypesLoaded ? (
                                                                <div className="loading-placeholder">
                                                                    <div className="spinner small"></div>
                                                                    {isFetchingColumnTypes 
                                                                        ? (language === "বাংলা" ? "কলাম বিশ্লেষণ করা হচ্ছে..." : "Analyzing column types...")
                                                                        : (language === "বাংলা" ? "কলাম লোড হচ্ছে..." : "Loading columns...")
                                                                    }
                                                                </div>
                                                            ) : categoricalColumns.length === 0 ? (

                                                                <div className="no-columns-warning">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                    </svg>
                                                                    <span>
                                                                        {language === "বাংলা" 
                                                                            ? "এই ফাইলে কোন শ্রেণীবদ্ধ কলাম পাওয়া যায়নি।" 
                                                                            : "No categorical columns found in this file."}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        className="form-select"
                                                                        value={column1}
                                                                        onChange={(e) => {
                                                                            setColumn1(e.target.value);
                                                                            // Clear selected groups when column changes
                                                                            setSelectedGroups([]);
                                                                            setGroupDropdownOpen(false);
                                                                        }}
                                                                    >
                                                                        <option value="">
                                                                            {language === "বাংলা" 
                                                                                ? "একটি শ্রেণীবদ্ধ কলাম নির্বাচন করুন" 
                                                                                : "Select a categorical column"}
                                                                        </option>
                                                                        {categoricalColumns.map((col, idx) => (
                                                                            <option key={idx} value={col}>
                                                                                {col} {language === "বাংলা" ? "(শ্রেণীবদ্ধ)" : "(categorical)"}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="column-count-hint">
                                                                        {language === "বাংলা" 
                                                                            ? `${categoricalColumns.length}টি শ্রেণীবদ্ধ কলাম পাওয়া গেছে` 
                                                                            : `${categoricalColumns.length} categorical columns found`}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Group Selection (only show when a categorical column is selected) */}
                                                        {column1 && (
                                                            <div className="form-group">
                                                                <label className="form-label">
                                                                    {language === "বাংলা" ? "গ্রুপ নির্বাচন (২টি প্রয়োজন)" : "Select Groups (2 required)"}
                                                                    <span className="required-star">*</span>
                                                                </label>
                                                                
                                                                {/* Selected Groups Display */}
                                                                {selectedGroups.length > 0 && (
                                                                    <div style={{
                                                                        marginBottom: '1rem',
                                                                        padding: '0.75rem',
                                                                        backgroundColor: '#f0f9ff',
                                                                        border: '1px solid #bae6fd',
                                                                        borderRadius: '0.5rem'
                                                                    }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <span style={{ fontWeight: '600', color: '#0369a1' }}>
                                                                                {t.selectedGroups || 'Selected Groups'}: {selectedGroups.join(', ')}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setSelectedGroups([])}
                                                                                style={{
                                                                                    background: 'none',
                                                                                    border: 'none',
                                                                                    color: '#dc2626',
                                                                                    cursor: 'pointer',
                                                                                    fontSize: '0.875rem',
                                                                                    padding: '0.25rem 0.5rem',
                                                                                    borderRadius: '0.25rem'
                                                                                }}
                                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                            >
                                                                                {t.clearSelection || 'Clear'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Group Selection Dropdown */}
                                                                <div style={{ position: 'relative' }}>
                                                                    <button
                                                                        type="button"
                                                                        className="form-select"
                                                                        onClick={() => {
                                                                            if (column1 && availableGroups.length > 0 && !isFetchingGroups) {
                                                                                setGroupDropdownOpen(!groupDropdownOpen);
                                                                            }
                                                                        }}
                                                                        style={{
                                                                            textAlign: 'left',
                                                                            cursor: (column1 && availableGroups.length > 0 && !isFetchingGroups) ? 'pointer' : 'not-allowed',
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                            opacity: (column1 && !isFetchingGroups) ? 1 : 0.7
                                                                        }}
                                                                    >
                                                                        <span>
                                                                            {isFetchingGroups ? (
                                                                                <>
                                                                                    <div className="spinner small" style={{ display: 'inline-block', marginRight: '0.5rem' }}></div>
                                                                                    {language === "বাংলা" ? "গ্রুপ লোড হচ্ছে..." : "Loading groups..."}
                                                                                </>
                                                                            ) : availableGroups.length === 0 ? (
                                                                                column1 
                                                                                    ? (language === "বাংলা" ? "গ্রুপ পাওয়া যায়নি" : "No groups found") 
                                                                                    : (language === "বাংলা" ? "প্রথমে একটি কলাম নির্বাচন করুন" : "Select a column first")
                                                                            ) : (
                                                                                `Select 2 groups (${availableGroups.length} ${language === "বাংলা" ? "টি উপলব্ধ" : "available"})`
                                                                            )}
                                                                        </span>
                                                                        {availableGroups.length > 0 && !isFetchingGroups && <span>▼</span>}
                                                                    </button>
                                                                    
                                                                    {groupDropdownOpen && availableGroups.length > 0 && !isFetchingGroups && (
                                                                        <div style={{
                                                                            position: 'absolute',
                                                                            top: '100%',
                                                                            left: 0,
                                                                            right: 0,
                                                                            backgroundColor: 'white',
                                                                            border: '1px solid #d1d5db',
                                                                            borderRadius: '0.5rem',
                                                                            maxHeight: '200px',
                                                                            overflowY: 'auto',
                                                                            zIndex: 1000,
                                                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                                                        }}>



                                                                            {availableGroups.map((group, index) => {
                                                                                const isSelected = selectedGroups.includes(group);
                                                                                return (
                                                                                    <div
                                                                                        key={index}
                                                                                        onClick={() => {
                                                                                            if (isSelected) {
                                                                                                setSelectedGroups(prev => prev.filter(g => g !== group));
                                                                                            } else {
                                                                                                if (selectedGroups.length < 2) {
                                                                                                    setSelectedGroups(prev => [...prev, group]);
                                                                                                } else {
                                                                                                    // Replace the first selected group
                                                                                                    setSelectedGroups(prev => [prev[1], group]);
                                                                                                }
                                                                                            }
                                                                                        }}
                                                                                        style={{
                                                                                            padding: '0.75rem',
                                                                                            cursor: 'pointer',
                                                                                            backgroundColor: isSelected ? '#dbeafe' : 'white',
                                                                                            borderBottom: index < availableGroups.length - 1 ? '1px solid #e5e7eb' : 'none',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '0.5rem'
                                                                                        }}
                                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#dbeafe' : '#f3f4f6'}
                                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#dbeafe' : 'white'}
                                                                                    >
                                                                                        <div style={{
                                                                                            width: '1rem',
                                                                                            height: '1rem',
                                                                                            borderRadius: '0.25rem',
                                                                                            border: '2px solid',
                                                                                            borderColor: isSelected ? '#3b82f6' : '#9ca3af',
                                                                                            backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center'
                                                                                        }}>
                                                                                            {isSelected && (
                                                                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                                </svg>
                                                                                            )}
                                                                                        </div>
                                                                                        <span>{group}</span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                


                                                                {/* Validation Message */}
                                                                {selectedGroups.length > 0 && selectedGroups.length !== 2 && (
                                                                    <div style={{
                                                                        marginTop: '0.5rem',
                                                                        padding: '0.75rem',
                                                                        backgroundColor: '#fef2f2',
                                                                        border: '1px solid #fecaca',
                                                                        borderRadius: '0.375rem',
                                                                        color: '#dc2626',
                                                                        fontSize: '0.875rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.5rem'
                                                                    }}>
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                            <circle cx="12" cy="12" r="10"></circle>
                                                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                            <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                        </svg>
                                                                        ⚠️ {t.mannwhitneyGroupError || 'Mann-Whitney test requires exactly 2 groups. Please select 2 groups.'}
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Help text */}
                                                                <div style={{
                                                                    marginTop: '0.5rem',
                                                                    padding: '0.5rem',
                                                                    backgroundColor: '#f8fafc',
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: '0.375rem',
                                                                    color: '#64748b',
                                                                    fontSize: '0.75rem'
                                                                }}>
                                                                    {t.mannwhitneyHelp || 'Select exactly 2 groups for Mann-Whitney test. The test will compare these two groups.'}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Column 2 - Numerical (Value variable) */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {language === "বাংলা" ? "মান কলাম (সংখ্যাগত)" : "Value Column (Numeric)"}
                                                                <span className="required-star">*</span>
                                                            </label>
                                                            


                                                            {!columnTypesLoaded ? (
                                                                <div className="loading-placeholder">
                                                                    <div className="spinner small"></div>
                                                                    {isFetchingColumnTypes 
                                                                        ? (language === "বাংলা" ? "কলাম বিশ্লেষণ করা হচ্ছে..." : "Analyzing column types...")
                                                                        : (language === "বাংলা" ? "কলাম লোড হচ্ছে..." : "Loading columns...")
                                                                    }
                                                                </div>
                                                            ) : numericColumns.length === 0 ? (

                                                                <div className="no-columns-warning">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                    </svg>
                                                                    <span>
                                                                        {language === "বাংলা" 
                                                                            ? "এই ফাইলে কোন সংখ্যাগত কলাম পাওয়া যায়নি।" 
                                                                            : "No numeric columns found in this file."}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        className="form-select"
                                                                        value={column2}
                                                                        onChange={(e) => setColumn2(e.target.value)}
                                                                    >
                                                                        <option value="">
                                                                            {language === "বাংলা" 
                                                                                ? "একটি সংখ্যাগত কলাম নির্বাচন করুন" 
                                                                                : "Select a numeric column"}
                                                                        </option>
                                                                        {numericColumns.map((col, idx) => (
                                                                            <option key={idx} value={col}>
                                                                                {col} {language === "বাংলা" ? "(সংখ্যাগত)" : "(numeric)"}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="column-count-hint">
                                                                        {language === "বাংলা" 
                                                                            ? `${numericColumns.length}টি সংখ্যাগত কলাম পাওয়া গেছে` 
                                                                            : `${numericColumns.length} numeric columns found`}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Combined component for tests requiring both numeric columns */}
                                                {(testType === 'wilcoxon' || testType === 'linear_regression' || testType === 'similarity') && (
                                                    <div className="form-section">
                                                        <h5 className="section-title">{t.selectColumns}</h5>
                                                        
                                                        {columnTypesError && (
                                                            <div className="error-box" style={{ marginBottom: '1rem' }}>
                                                                <div className="error-icon">
                                                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <div className="error-text">{columnTypesError}</div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Dynamic labels based on test type */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {testType === 'wilcoxon' 
                                                                    ? (language === "বাংলা" ? "প্রথম কলাম (সংখ্যাগত)" : "First Column (Numeric)")
                                                                    : testType === 'linear_regression'
                                                                    ? (language === "বাংলা" ? "স্বাধীন চলক (পূর্বাভাসক)" : "Independent Variable (Predictor)")
                                                                    : (language === "বাংলা" ? "প্রথম সংখ্যাগত কলাম" : "First Numeric Column")
                                                                }
                                                                <span className="required-star">*</span>
                                                            </label>
                                                            
                                                            {!columnTypesLoaded ? (
                                                                <div className="loading-placeholder">
                                                                    <div className="spinner small"></div>
                                                                    {isFetchingColumnTypes 
                                                                        ? (language === "বাংলা" ? "কলাম বিশ্লেষণ করা হচ্ছে..." : "Analyzing column types...")
                                                                        : (language === "বাংলা" ? "কলাম লোড হচ্ছে..." : "Loading columns...")
                                                                    }
                                                                </div>
                                                            ) : numericColumns.length === 0 ? (
                                                                <div className="no-columns-warning">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                    </svg>
                                                                    <span>
                                                                        {testType === 'wilcoxon' 
                                                                            ? (language === "বাংলা" 
                                                                                ? `উইলকক্সন পরীক্ষার জন্য কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন। পাওয়া গেছে: ${numericColumns.length}টি`
                                                                                : `Wilcoxon test requires at least 2 numeric columns. Found: ${numericColumns.length}`)
                                                                            : testType === 'linear_regression'
                                                                            ? (language === "বাংলা" 
                                                                                ? `রৈখিক রিগ্রেশনের জন্য কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন। পাওয়া গেছে: ${numericColumns.length}টি`
                                                                                : `Linear regression requires at least 2 numeric columns. Found: ${numericColumns.length}`)
                                                                            : (language === "বাংলা" 
                                                                                ? `সাদৃশ্য পরীক্ষার জন্য কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন। পাওয়া গেছে: ${numericColumns.length}টি`
                                                                                : `Similarity test requires at least 2 numeric columns. Found: ${numericColumns.length}`)
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        className="form-select"
                                                                        value={column1}
                                                                        onChange={(e) => setColumn1(e.target.value)}
                                                                    >
                                                                        <option value="">
                                                                            {testType === 'wilcoxon' 
                                                                                ? (language === "বাংলা" ? "প্রথম সংখ্যাগত কলাম নির্বাচন করুন" : "Select first numeric column")
                                                                                : testType === 'linear_regression'
                                                                                ? (language === "বাংলা" ? "স্বাধীন চলক নির্বাচন করুন" : "Select independent variable")
                                                                                : (language === "বাংলা" ? "প্রথম সংখ্যাগত কলাম নির্বাচন করুন" : "Select first numeric column")
                                                                            }
                                                                        </option>
                                                                        {numericColumns.map((col, idx) => (
                                                                            <option key={idx} value={col}>
                                                                                {col} {language === "বাংলা" ? "(সংখ্যাগত)" : "(numeric)"}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="column-count-hint">
                                                                        {language === "বাংলা" 
                                                                            ? `${numericColumns.length}টি সংখ্যাগত কলাম পাওয়া গেছে` 
                                                                            : `${numericColumns.length} numeric columns found`}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {testType === 'wilcoxon' 
                                                                    ? (language === "বাংলা" ? "দ্বিতীয় কলাম (সংখ্যাগত)" : "Second Column (Numeric)")
                                                                    : testType === 'linear_regression'
                                                                    ? (language === "বাংলা" ? "নির্ভরশীল চলক (প্রতিক্রিয়া)" : "Dependent Variable (Response)")
                                                                    : (language === "বাংলা" ? "দ্বিতীয় সংখ্যাগত কলাম" : "Second Numeric Column")
                                                                }
                                                                <span className="required-star">*</span>
                                                            </label>
                                                            
                                                            {!columnTypesLoaded ? (
                                                                <div className="loading-placeholder">
                                                                    <div className="spinner small"></div>
                                                                    {isFetchingColumnTypes 
                                                                        ? (language === "বাংলা" ? "কলাম বিশ্লেষণ করা হচ্ছে..." : "Analyzing column types...")
                                                                        : (language === "বাংলা" ? "কলাম লোড হচ্ছে..." : "Loading columns...")
                                                                    }
                                                                </div>
                                                            ) : numericColumns.length === 0 ? (
                                                                <div className="no-columns-warning">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                    </svg>
                                                                    <span>
                                                                        {testType === 'wilcoxon' 
                                                                            ? (language === "বাংলা" 
                                                                                ? `উইলকক্সন পরীক্ষার জন্য কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন। পাওয়া গেছে: ${numericColumns.length}টি`
                                                                                : `Wilcoxon test requires at least 2 numeric columns. Found: ${numericColumns.length}`)
                                                                            : testType === 'linear_regression'
                                                                            ? (language === "বাংলা" 
                                                                                ? `রৈখিক রিগ্রেশনের জন্য কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন। পাওয়া গেছে: ${numericColumns.length}টি`
                                                                                : `Linear regression requires at least 2 numeric columns. Found: ${numericColumns.length}`)
                                                                            : (language === "বাংলা" 
                                                                                ? `সাদৃশ্য পরীক্ষার জন্য কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন। পাওয়া গেছে: ${numericColumns.length}টি`
                                                                                : `Similarity test requires at least 2 numeric columns. Found: ${numericColumns.length}`)
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        className="form-select"
                                                                        value={column2}
                                                                        onChange={(e) => setColumn2(e.target.value)}
                                                                    >
                                                                        <option value="">
                                                                            {testType === 'wilcoxon' 
                                                                                ? (language === "বাংলা" ? "দ্বিতীয় সংখ্যাগত কলাম নির্বাচন করুন" : "Select second numeric column")
                                                                                : testType === 'linear_regression'
                                                                                ? (language === "বাংলা" ? "নির্ভরশীল চলক নির্বাচন করুন" : "Select dependent variable")
                                                                                : (language === "বাংলা" ? "দ্বিতীয় সংখ্যাগত কলাম নির্বাচন করুন" : "Select second numeric column")
                                                                            }
                                                                        </option>
                                                                        {numericColumns
                                                                            .filter(col => col !== column1)
                                                                            .map((col, idx) => (
                                                                                <option key={idx} value={col}>
                                                                                    {col} {language === "বাংলা" ? "(সংখ্যাগত)" : "(numeric)"}
                                                                                </option>
                                                                            ))}
                                                                    </select>
                                                                    <div className="column-count-hint">
                                                                        {testType === 'wilcoxon' 
                                                                            ? (language === "বাংলা" 
                                                                                ? "উইলকক্সন পরীক্ষা জোড়া ডেটার জন্য (যেমন: চিকিৎসার পূর্ব-পরবর্তী)"
                                                                                : "Wilcoxon test is for paired data (e.g., before-after treatment)")
                                                                            : testType === 'linear_regression'
                                                                            ? (language === "বাংলা" 
                                                                                ? "মডেল: Y = a + bX, যেখানে X স্বাধীন চলক এবং Y নির্ভরশীল চলক"
                                                                                : "Model: Y = a + bX, where X is independent and Y is dependent")
                                                                            : (language === "বাংলা" 
                                                                                ? "দুইটি সংখ্যাগত ভেক্টরের মধ্যে সাদৃশ্য ও দূরত্ব পরিমাপ করে"
                                                                                : "Measures similarity and distance between two numeric vectors")
                                                                        }
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Similarity test specific information */}
                                                        {testType === 'similarity' && (
                                                            <div style={{ 
                                                                marginTop: '1rem', 
                                                                padding: '0.75rem', 
                                                                backgroundColor: '#f0f9ff', 
                                                                border: '1px solid #bae6fd',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.875rem'
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="8" x2="12" y2="8"></line>
                                                                    </svg>
                                                                    <div>
                                                                        <strong style={{ color: '#0369a1' }}>
                                                                            {language === "বাংলা" ? "সাদৃশ্য পরীক্ষা নির্দেশনা" : "Similarity Test Guidelines"}
                                                                        </strong>
                                                                        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem', color: '#475569' }}>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "কসাইন সাদৃশ্য: ১ এর কাছাকাছি মান বেশি সাদৃশ্য নির্দেশ করে"
                                                                                    : "Cosine similarity: Values near 1 indicate high similarity"}
                                                                            </li>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "দূরত্ব মেট্রিক: ০ এর কাছাকাছি মান কম দূরত্ব নির্দেশ করে"
                                                                                    : "Distance metrics: Values near 0 indicate low distance"}
                                                                            </li>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "পিয়ারসন ও স্পিয়ারম্যান: -১ থেকে +১ পর্যন্ত, +১ সম্পূর্ণ সম্পর্ক"
                                                                                    : "Pearson & Spearman: -1 to +1, +1 indicates perfect correlation"}
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Combined component for tests requiring 1 categorical column (Bar Chart, Pie Chart) */}
                                                {(testType === 'bar_chart' || testType === 'eda_pie') && (
                                                    <div className="form-section">
                                                        <h5 className="section-title">{t.selectColumns}</h5>
                                                        
                                                        {columnTypesError && (
                                                            <div className="error-box" style={{ marginBottom: '1rem' }}>
                                                                <div className="error-icon">
                                                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <div className="error-text">{columnTypesError}</div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Column 1 - Categorical column */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {language === "বাংলা" ? "শ্রেণীবদ্ধ কলাম" : "Categorical Column"}
                                                                <span className="required-star">*</span>
                                                            </label>
                                                            
                                                            {!columnTypesLoaded ? (
                                                                <div className="loading-placeholder">
                                                                    <div className="spinner small"></div>
                                                                    {language === "বাংলা" ? "কলাম বিশ্লেষণ করা হচ্ছে..." : "Analyzing column types..."}
                                                                </div>
                                                            ) : categoricalColumns.length === 0 ? (
                                                                <div className="no-columns-warning">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                    </svg>
                                                                    <span>
                                                                        {testType === 'bar_chart' 
                                                                            ? (language === "বাংলা" 
                                                                                ? "বার চার্টের জন্য শ্রেণীবদ্ধ কলাম প্রয়োজন। ফাইলে কোন শ্রেণীবদ্ধ কলাম পাওয়া যায়নি।" 
                                                                                : "Bar chart requires categorical columns. No categorical columns found in the file.")
                                                                            : (language === "বাংলা" 
                                                                                ? "পাই চার্টের জন্য শ্রেণীবদ্ধ কলাম প্রয়োজন। ফাইলে কোন শ্রেণীবদ্ধ কলাম পাওয়া যায়নি।" 
                                                                                : "Pie chart requires categorical columns. No categorical columns found in the file.")}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        className="form-select"
                                                                        value={column1}
                                                                        onChange={(e) => setColumn1(e.target.value)}
                                                                    >
                                                                        <option value="">
                                                                            {language === "বাংলা" 
                                                                                ? "একটি শ্রেণীবদ্ধ কলাম নির্বাচন করুন" 
                                                                                : "Select a categorical column"}
                                                                        </option>
                                                                        {categoricalColumns.map((col, idx) => (
                                                                            <option key={idx} value={col}>
                                                                                {col}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="column-count-hint">
                                                                        {language === "বাংলা" 
                                                                            ? `${categoricalColumns.length}টি শ্রেণীবদ্ধ কলাম পাওয়া গেছে` 
                                                                            : `${categoricalColumns.length} categorical columns found`}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Pie Chart Specific Information */}
                                                        {testType === 'eda_pie' && (
                                                            <div style={{ 
                                                                marginTop: '1rem', 
                                                                padding: '0.75rem', 
                                                                backgroundColor: '#f0f9ff', 
                                                                border: '1px solid #bae6fd',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.875rem'
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="8" x2="12" y2="8"></line>
                                                                    </svg>
                                                                    <div>
                                                                        <strong style={{ color: '#0369a1' }}>
                                                                            {language === "বাংলা" ? "পাই চার্ট নির্দেশনা" : "Pie Chart Guidelines"}
                                                                        </strong>
                                                                        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem', color: '#475569' }}>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "পাই চার্ট ১০টি বা কম শ্রেণীর জন্য উপযুক্ত"
                                                                                    : "Pie charts work best with 10 or fewer categories"}
                                                                            </li>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "প্রতিটি অংশ মোটের শতাংশ দেখায়"
                                                                                    : "Each slice shows percentage of the total"}
                                                                            </li>
                                                                            <li>
                                                                                {language === "বাংলা" 
                                                                                    ? "১০+ শ্রেণীর জন্য বার চার্ট ভালো বিকল্প"
                                                                                    : "For 10+ categories, consider using a bar chart instead"}
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Combined component for tests requiring 1 numeric column (Shapiro, Kolmogorov, Anderson, EDA Distribution) */}
                                                {(testType === 'shapiro' || testType === 'kolmogorov' || testType === 'anderson' || testType === 'eda_distribution') && (
                                                    <div className="form-section">
                                                        <h5 className="section-title">{t.selectColumns}</h5>
                                                        
                                                        {columnTypesError && (
                                                            <div className="error-box" style={{ marginBottom: '1rem' }}>
                                                                <div className="error-icon">
                                                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <div className="error-text">{columnTypesError}</div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Column 1 - Numeric column */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {language === "বাংলা" ? "সংখ্যাগত কলাম" : "Numeric Column"}
                                                                <span className="required-star">*</span>
                                                            </label>
                                                            
                                                            {!columnTypesLoaded ? (
                                                                <div className="loading-placeholder">
                                                                    <div className="spinner small"></div>
                                                                    {language === "বাংলা" ? "কলাম বিশ্লেষণ করা হচ্ছে..." : "Analyzing column types..."}
                                                                </div>
                                                            ) : numericColumns.length === 0 ? (
                                                                <div className="no-columns-warning">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                    </svg>
                                                                    <span>
                                                                        {testType === 'shapiro' 
                                                                            ? (language === "বাংলা" 
                                                                                ? "শাপিরো-উইল্ক পরীক্ষার জন্য সংখ্যাগত কলাম প্রয়োজন। ফাইলে কোন সংখ্যাগত কলাম পাওয়া যায়নি।" 
                                                                                : "Shapiro-Wilk test requires numeric columns. No numeric columns found in the file.")
                                                                            : testType === 'kolmogorov'
                                                                            ? (language === "বাংলা" 
                                                                                ? "কোলমোগোরভ-স্মিরনভ পরীক্ষার জন্য সংখ্যাগত কলাম প্রয়োজন। ফাইলে কোন সংখ্যাগত কলাম পাওয়া যায়নি।" 
                                                                                : "Kolmogorov-Smirnov test requires numeric columns. No numeric columns found in the file.")
                                                                            : testType === 'anderson'
                                                                            ? (language === "বাংলা" 
                                                                                ? "অ্যান্ডারসন-ডার্লিং পরীক্ষার জন্য সংখ্যাগত কলাম প্রয়োজন। ফাইলে কোন সংখ্যাগত কলাম পাওয়া যায়নি।" 
                                                                                : "Anderson-Darling test requires numeric columns. No numeric columns found in the file.")
                                                                            : (language === "বাংলা" 
                                                                                ? "বন্টন প্লটের জন্য সংখ্যাগত কলাম প্রয়োজন। ফাইলে কোন সংখ্যাগত কলাম পাওয়া যায়নি।" 
                                                                                : "Distribution plot requires numeric columns. No numeric columns found in the file.")}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        className="form-select"
                                                                        value={column1}
                                                                        onChange={(e) => setColumn1(e.target.value)}
                                                                    >
                                                                        <option value="">
                                                                            {language === "বাংলা" 
                                                                                ? "একটি সংখ্যাগত কলাম নির্বাচন করুন" 
                                                                                : "Select a numeric column"}
                                                                        </option>
                                                                        {numericColumns.map((col, idx) => (
                                                                            <option key={idx} value={col}>
                                                                                {col}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="column-count-hint">
                                                                        {language === "বাংলা" 
                                                                            ? `${numericColumns.length}টি সংখ্যাগত কলাম পাওয়া গেছে` 
                                                                            : `${numericColumns.length} numeric columns found`}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Test-specific Information */}
                                                        <div style={{ 
                                                            marginTop: '1rem', 
                                                            padding: '0.75rem', 
                                                            backgroundColor: '#f0f9ff', 
                                                            border: '1px solid #bae6fd',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '0.875rem'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2">
                                                                    <circle cx="12" cy="12" r="10"></circle>
                                                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                                                    <line x1="12" y1="8" x2="12" y2="8"></line>
                                                                </svg>
                                                                <div>
                                                                    <strong style={{ color: '#0369a1' }}>
                                                                        {testType === 'shapiro'
                                                                            ? (language === "বাংলা" ? "শাপিরো-উইল্ক পরীক্ষা নির্দেশনা" : "Shapiro-Wilk Test Guidelines")
                                                                            : testType === 'kolmogorov'
                                                                            ? (language === "বাংলা" ? "কোলমোগোরভ-স্মিরনভ পরীক্ষা নির্দেশনা" : "Kolmogorov-Smirnov Test Guidelines")
                                                                            : testType === 'anderson'
                                                                            ? (language === "বাংলা" ? "অ্যান্ডারসন-ডার্লিং পরীক্ষা নির্দেশনা" : "Anderson-Darling Test Guidelines")
                                                                            : (language === "বাংলা" ? "বন্টন বিশ্লেষণ নির্দেশনা" : "Distribution Analysis Guidelines")}
                                                                    </strong>
                                                                    <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem', color: '#475569' }}>
                                                                        <li>
                                                                            {testType === 'shapiro'
                                                                                ? (language === "বাংলা" 
                                                                                    ? "ছোট নমুনার জন্য সবচেয়ে শক্তিশালী স্বাভাবিকতা পরীক্ষা (n < 50)"
                                                                                    : "Most powerful normality test for small samples (n < 50)")
                                                                                : testType === 'kolmogorov'
                                                                                ? (language === "বাংলা" 
                                                                                    ? "বড় নমুনার জন্য উপযুক্ত (n > 50)"
                                                                                    : "Suitable for large samples (n > 50)")
                                                                                : testType === 'anderson'
                                                                                ? (language === "বাংলা" 
                                                                                    ? "বিভিন্ন স্বাভাবিকতা স্তরের জন্য সমালোচনামূলক মান প্রদান করে"
                                                                                    : "Provides critical values for different normality levels")
                                                                                : (language === "বাংলা" 
                                                                                    ? "ডেটার বন্টন ও আকৃতি বিশ্লেষণ করে"
                                                                                    : "Analyzes the distribution and shape of data")}
                                                                        </li>
                                                                        <li>
                                                                            {testType === 'shapiro' || testType === 'kolmogorov' || testType === 'anderson'
                                                                                ? (language === "বাংলা" 
                                                                                    ? "স্বাভাবিক বন্টন যাচাই করে (p < 0.05 = স্বাভাবিক নয়)"
                                                                                    : "Tests for normal distribution (p < 0.05 = not normal)")
                                                                                : (language === "বাংলা" 
                                                                                    ? "হিস্টোগ্রাম, KDE এবং সারাংশ পরিসংখ্যান দেখায়"
                                                                                    : "Shows histogram, KDE and summary statistics")}
                                                                        </li>
                                                                        <li>
                                                                            {testType === 'shapiro' || testType === 'kolmogorov' || testType === 'anderson'
                                                                                ? (language === "বাংলা" 
                                                                                    ? "কমপক্ষে ৩টি পর্যবেক্ষণ প্রয়োজন"
                                                                                    : "Requires at least 3 observations")
                                                                                : (language === "বাংলা" 
                                                                                    ? "কমপক্ষে ১০টি পর্যবেক্ষণ সুপারিশকৃত"
                                                                                    : "At least 10 observations recommended")}
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Component for ANCOVA test - requires 1 categorical + 2 numeric columns */}
                                                {testType === 'ancova' && (
                                                    <div className="form-section">
                                                        <h5 className="section-title">{t.selectColumns}</h5>
                                                        
                                                        {columnTypesError && (
                                                            <div className="error-box" style={{ marginBottom: '1rem' }}>
                                                                <div className="error-icon">
                                                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <div className="error-text">{columnTypesError}</div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Column 1 - Categorical (Grouping variable) */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {language === "বাংলা" ? "গ্রুপিং কলাম (শ্রেণীবদ্ধ)" : "Grouping Column (Categorical)"}
                                                                <span className="required-star">*</span>
                                                            </label>
                                                            
                                                            {!columnTypesLoaded ? (
                                                                <div className="loading-placeholder">
                                                                    <div className="spinner small"></div>
                                                                    {isFetchingColumnTypes 
                                                                        ? (language === "বাংলা" ? "কলাম বিশ্লেষণ করা হচ্ছে..." : "Analyzing column types...")
                                                                        : (language === "বাংলা" ? "কলাম লোড হচ্ছে..." : "Loading columns...")
                                                                    }
                                                                </div>
                                                            ) : categoricalColumns.length === 0 ? (
                                                                <div className="no-columns-warning">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                    </svg>
                                                                    <span>
                                                                        {language === "বাংলা" 
                                                                            ? "এনকোভা পরীক্ষার জন্য শ্রেণীবদ্ধ কলাম প্রয়োজন। ফাইলে কোন শ্রেণীবদ্ধ কলাম পাওয়া যায়নি।" 
                                                                            : "ANCOVA test requires categorical columns. No categorical columns found in the file."}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        className="form-select"
                                                                        value={column1}
                                                                        onChange={(e) => setColumn1(e.target.value)}
                                                                    >
                                                                        <option value="">
                                                                            {language === "বাংলা" 
                                                                                ? "একটি শ্রেণীবদ্ধ কলাম নির্বাচন করুন" 
                                                                                : "Select a categorical column"}
                                                                        </option>
                                                                        {categoricalColumns.map((col, idx) => (
                                                                            <option key={idx} value={col}>
                                                                                {col} {language === "বাংলা" ? "(শ্রেণীবদ্ধ)" : "(categorical)"}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="column-count-hint">
                                                                        {language === "বাংলা" 
                                                                            ? `${categoricalColumns.length}টি শ্রেণীবদ্ধ কলাম পাওয়া গেছে` 
                                                                            : `${categoricalColumns.length} categorical columns found`}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Column 2 - Numeric (Covariate variable) */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {language === "বাংলা" ? "কোভেরিয়েট কলাম (সংখ্যাগত)" : "Covariate Column (Numeric)"}
                                                                <span className="required-star">*</span>
                                                            </label>
                                                            
                                                            {!columnTypesLoaded ? (
                                                                <div className="loading-placeholder">
                                                                    <div className="spinner small"></div>
                                                                    {isFetchingColumnTypes 
                                                                        ? (language === "বাংলা" ? "কলাম বিশ্লেষণ করা হচ্ছে..." : "Analyzing column types...")
                                                                        : (language === "বাংলা" ? "কলাম লোড হচ্ছে..." : "Loading columns...")
                                                                    }
                                                                </div>
                                                            ) : numericColumns.length === 0 ? (
                                                                <div className="no-columns-warning">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                    </svg>
                                                                    <span>
                                                                        {language === "বাংলা" 
                                                                            ? "এনকোভা পরীক্ষার জন্য কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন। ফাইলে কোন সংখ্যাগত কলাম পাওয়া যায়নি।" 
                                                                            : "ANCOVA test requires at least 2 numeric columns. No numeric columns found in the file."}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        className="form-select"
                                                                        value={column2}
                                                                        onChange={(e) => setColumn2(e.target.value)}
                                                                    >
                                                                        <option value="">
                                                                            {language === "বাংলা" 
                                                                                ? "কোভেরিয়েট কলাম নির্বাচন করুন" 
                                                                                : "Select covariate column"}
                                                                        </option>
                                                                        {numericColumns.map((col, idx) => (
                                                                            <option key={idx} value={col}>
                                                                                {col} {language === "বাংলা" ? "(সংখ্যাগত)" : "(numeric)"}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="column-count-hint">
                                                                        {language === "বাংলা" 
                                                                            ? `${numericColumns.length}টি সংখ্যাগত কলাম পাওয়া গেছে` 
                                                                            : `${numericColumns.length} numeric columns found`}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Column 3 - Numeric (Outcome variable) */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {language === "বাংলা" ? "আউটকাম কলাম (সংখ্যাগত)" : "Outcome Column (Numeric)"}
                                                                <span className="required-star">*</span>
                                                            </label>
                                                            
                                                            {!columnTypesLoaded ? (
                                                                <div className="loading-placeholder">
                                                                    <div className="spinner small"></div>
                                                                    {isFetchingColumnTypes 
                                                                        ? (language === "বাংলা" ? "কলাম বিশ্লেষণ করা হচ্ছে..." : "Analyzing column types...")
                                                                        : (language === "বাংলা" ? "কলাম লোড হচ্ছে..." : "Loading columns...")
                                                                    }
                                                                </div>
                                                            ) : numericColumns.length < 2 ? (
                                                                <div className="no-columns-warning">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                                        <line x1="12" y1="16" x2="12" y2="16"></line>
                                                                    </svg>
                                                                    <span>
                                                                        {language === "বাংলা" 
                                                                            ? `এনকোভা পরীক্ষার জন্য কমপক্ষে ২টি সংখ্যাগত কলাম প্রয়োজন। পাওয়া গেছে: ${numericColumns.length}টি` 
                                                                            : `ANCOVA test requires at least 2 numeric columns. Found: ${numericColumns.length}`}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        className="form-select"
                                                                        value={column3}
                                                                        onChange={(e) => setColumn3(e.target.value)}
                                                                    >
                                                                        <option value="">
                                                                            {language === "বাংলা" 
                                                                                ? "আউটকাম কলাম নির্বাচন করুন" 
                                                                                : "Select outcome column"}
                                                                        </option>
                                                                        {numericColumns
                                                                            .filter(col => col !== column2)  // Don't show the covariate column
                                                                            .map((col, idx) => (
                                                                                <option key={idx} value={col}>
                                                                                    {col} {language === "বাংলা" ? "(সংখ্যাগত)" : "(numeric)"}
                                                                                </option>
                                                                            ))}
                                                                    </select>
                                                                    <div className="column-count-hint">
                                                                        {language === "বাংলা" 
                                                                            ? "কোভেরিয়েটের প্রভাব নিয়ন্ত্রণ করে গ্রুপের পার্থক্য বিশ্লেষণ করে"
                                                                            : "Analyzes group differences while controlling for covariate effects"}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* ANCOVA Information */}
                                                        <div style={{ 
                                                            marginTop: '1rem', 
                                                            padding: '0.75rem', 
                                                            backgroundColor: '#f0f9ff', 
                                                            border: '1px solid #bae6fd',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '0.875rem'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2">
                                                                    <circle cx="12" cy="12" r="10"></circle>
                                                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                                                    <line x1="12" y1="8" x2="12" y2="8"></line>
                                                                </svg>
                                                                <div>
                                                                    <strong style={{ color: '#0369a1' }}>
                                                                        {language === "বাংলা" ? "এনকোভা পরীক্ষা নির্দেশনা" : "ANCOVA Test Guidelines"}
                                                                    </strong>
                                                                    <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem', color: '#475569' }}>
                                                                        <li>
                                                                            {language === "বাংলা" 
                                                                                ? "কোভেরিয়েটের প্রভাব নিয়ন্ত্রণ করে গ্রুপের পার্থক্য বিশ্লেষণ করে"
                                                                                : "Analyzes group differences while controlling for covariate effects"}
                                                                        </li>
                                                                        <li>
                                                                            {language === "বাংলা" 
                                                                                ? "এনোভা + রিগ্রেশনের সমন্বয় (ANOVA + Regression)"
                                                                                : "Combination of ANOVA and regression analysis"}
                                                                        </li>
                                                                        <li>
                                                                            {language === "বাংলা" 
                                                                                ? "স্বাভাবিক বন্টন, সমান ভ্যারিয়েন্স এবং রৈখিক সম্পর্ক প্রয়োজন"
                                                                                : "Requires normal distribution, equal variances, and linear relationships"}
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {requiredFields.col2 && (
                                                    <div className="form-group">
                                                        <label className="form-label">{t.column2}</label>
                                                        <select
                                                            className="form-select"
                                                            value={column2}
                                                            onChange={(e) => setColumn2(e.target.value)}
                                                            disabled={columns.length === 0}
                                                        >
                                                            <option value="">-- Select a column --</option>
                                                            {columns.map((col, idx) => (
                                                                <option key={idx} value={col}>
                                                                    {col}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {requiredFields.col3 && (
                                                    <div className="form-group">
                                                        <label className="form-label">{t.column3}</label>
                                                        <select
                                                            className="form-select"
                                                            value={column3}
                                                            onChange={(e) => setColumn3(e.target.value)}
                                                            disabled={columns.length === 0}
                                                        >
                                                            <option value="">-- Select a column --</option>
                                                            {columns.map((col, idx) => (
                                                                <option key={idx} value={col}>
                                                                    {col}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {requiredFields.col4 && (
                                                    <div className="form-group">
                                                        <label className="form-label">{t.column4}</label>
                                                        <select
                                                            className="form-select"
                                                            value={column4}
                                                            onChange={(e) => setColumn4(e.target.value)}
                                                            disabled={columns.length === 0}
                                                        >
                                                            <option value="">-- Select a column --</option>
                                                            {columns.map((col, idx) => (
                                                                <option key={idx} value={col}>
                                                                    {col}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}




                                                {testType === 'eda_basics' && (
                                                    <EDABasicsOptions
                                                        language={language}
                                                        setLanguage={setLanguage}
                                                        imageFormat={imageFormat}
                                                        setImageFormat={setImageFormat}
                                                        useDefaultSettings={useDefaultSettings}
                                                        setUseDefaultSettings={setUseDefaultSettings}
                                                        labelFontSize={labelFontSize}
                                                        setLabelFontSize={setLabelFontSize}
                                                        tickFontSize={tickFontSize}
                                                        setTickFontSize={setTickFontSize}
                                                        imageQuality={imageQuality}
                                                        setImageQuality={setImageQuality}
                                                        imageSize={imageSize}
                                                        setImageSize={setImageSize}
                                                        t={t}
                                                    />
                                                )}

                                                {testType === 'similarity' && (
                                                    <SimilarityOptions
                                                        language={language}
                                                        setLanguage={setLanguage}
                                                        imageFormat={imageFormat}
                                                        setImageFormat={setImageFormat}
                                                        useDefaultSettings={useDefaultSettings}
                                                        setUseDefaultSettings={setUseDefaultSettings}
                                                        labelFontSize={labelFontSize}
                                                        setLabelFontSize={setLabelFontSize}
                                                        tickFontSize={tickFontSize}
                                                        setTickFontSize={setTickFontSize}
                                                        imageQuality={imageQuality}
                                                        setImageQuality={setImageQuality}
                                                        imageSize={imageSize}
                                                        setImageSize={setImageSize}
                                                        t={t}
                                                    />
                                                )}

                                                {/* {testType === 'chi_square' && (
                                                        <ChiSquareOptions
                                                            language={language}
                                                            setLanguage={setLanguage}
                                                            imageFormat={imageFormat}
                                                            setImageFormat={setImageFormat}
                                                            useDefaultSettings={useDefaultSettings}
                                                            setUseDefaultSettings={setUseDefaultSettings}
                                                            labelFontSize={labelFontSize}
                                                            setLabelFontSize={setLabelFontSize}
                                                            tickFontSize={tickFontSize}
                                                            setTickFontSize={setTickFontSize}
                                                            imageQuality={imageQuality}
                                                            setImageQuality={setImageQuality}
                                                            imageSize={imageSize}
                                                            setImageSize={setImageSize}
                                                            colorPalette={colorPalette}
                                                            setColorPalette={setColorPalette}
                                                            t={t}
                                                        />
                                                    )} */}

                                                {testType === 'network_graph' && (
                                                    <NetworkGraphOptions
                                                        language={language}
                                                        setLanguage={setLanguage}
                                                        useDefaultSettings={useDefaultSettings}
                                                        setUseDefaultSettings={setUseDefaultSettings}
                                                        nodeColor={nodeColor}
                                                        setNodeColor={setNodeColor}
                                                        nodeSize={nodeSize}
                                                        setNodeSize={setNodeSize}
                                                        textSize={textSize}
                                                        setTextSize={setTextSize}
                                                        textColor={textColor}
                                                        setTextColor={setTextColor}
                                                        edgeWidthFactor={edgeWidthFactor}
                                                        setEdgeWidthFactor={setEdgeWidthFactor}
                                                        showEdgeWeights={showEdgeWeights}
                                                        setShowEdgeWeights={setShowEdgeWeights}
                                                        weightFontSize={weightFontSize}
                                                        setWeightFontSize={setWeightFontSize}
                                                        weightColor={weightColor}
                                                        setWeightColor={setWeightColor}
                                                        useMatrix={useMatrix}
                                                        setUseMatrix={setUseMatrix}
                                                        t={t}
                                                    />
                                                )}


                                                {requiredFields.col5 && (
                                                    <div className="form-group">
                                                        <label className="form-label">{t.column5}</label>
                                                        <select
                                                            className="form-select"
                                                            value={column5}
                                                            onChange={(e) => setColumn5(e.target.value)}
                                                            disabled={columns.length === 0}
                                                        >
                                                            <option value="">-- Select a column --</option>
                                                            {columns.map((col, idx) => (
                                                                <option key={idx} value={col}>
                                                                    {col}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        )}



                                        {requiredFields.refValue && (
                                            <div className="form-group">
                                                <label className="form-label">{t.referenceValue}</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={referenceValue}
                                                    onChange={(e) => setReferenceValue(parseFloat(e.target.value))}
                                                    step="0.01"
                                                />
                                            </div>
                                        )}
                                    </div>)}

                                    {(isPreprocessed || isSurveyData || file) && (
                                        <div className="submit-section" style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            margin: '20px 0'
                                        }}>
                                            <button
                                                type="submit"
                                                className="customize-btn"
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '16px',
                                                    fontWeight: '700'
                                                }}
                                                disabled={
                                                    isAnalyzing ||
                                                    !file ||
                                                    !column1 ||
                                                    (requiredFields.col2 && !column2) ||
                                                    (requiredFields.col3 && !column3)
                                                }
                                            >
                                                {isAnalyzing ? (
                                                    <>
                                                        <div className="spinner small"></div>
                                                        {t.analyzing}
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <line x1="18" y1="20" x2="18" y2="10"></line>
                                                            <line x1="12" y1="20" x2="12" y2="4"></line>
                                                            <line x1="6" y1="20" x2="6" y2="14"></line>
                                                        </svg>
                                                        {t.analyzeButton}
                                                    </>
                                                )}
                                            </button>
                                        </div>)}
                                </form>

                                {detailsModalVisible && (
                                    <div className="modal-overlay">
                                        <div className="modal-content">
                                            <button
                                                className="modal-close"
                                                onClick={() => setDetailsModalVisible(false)}
                                            >
                                                &times;
                                            </button>
                                            <h2>{t.tests[testType]}</h2>
                                            <pre className="modal-body">
                                                {statTestDetails[language]?.[testType] ||
                                                    (language === "bn"
                                                        ? "এই পরীক্ষার বিস্তারিত পাওয়া যায়নি।"
                                                        : "No details available.")}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <AnalysisResults
                            isFirstTimeAnalysis={isFirstTimeAnalysis}
                            setIsFirstTimeAnalysis={setIsFirstTimeAnalysis}
                            handleSubmit={handleSubmit}
                            user_id={userId}
                            results={results}
                            testType={testType}
                            columns={[column1, column2, column3]}
                            language={language}
                            setLanguage={setLanguage}
                            imageFormat={imageFormat}
                            setImageFormat={setImageFormat}
                            useDefaultSettings={useDefaultSettings}
                            setUseDefaultSettings={setUseDefaultSettings}
                            labelFontSize={labelFontSize}
                            setLabelFontSize={setLabelFontSize}
                            tickFontSize={tickFontSize}
                            setTickFontSize={setTickFontSize}
                            imageQuality={imageQuality}
                            setImageQuality={setImageQuality}
                            imageSize={imageSize}
                            setImageSize={setImageSize}
                            colorPalette={colorPalette}
                            setColorPalette={setColorPalette}
                            barWidth={barWidth}
                            setBarWidth={setBarWidth}
                            boxWidth={boxWidth}
                            setBoxWidth={setBoxWidth}
                            violinWidth={violinWidth}
                            setViolinWidth={setViolinWidth}
                            showGrid={showGrid}
                            setShowGrid={setShowGrid}
                            histColor={histColor}
                            setHistColor={setHistColor}
                            kdeColor={kdeColor}
                            setKdeColor={setKdeColor}
                            distColor={distColor}
                            setDistColor={setDistColor}

                            t={t}
                            filename={fileName}
                        />

                    )}

                </div>
            </div>
        </div>


    );
};

// Component for rendering analysis results
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
            if (language !== 'bn') return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return (
                <div className="stats-loading">
                    <p>{language === 'bn' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>
                </div>
            );
        }

        const renderTitle = (key) => {
            const titles = {
                count: language === 'bn' ? 'গণনা' : 'Count',
                min: language === 'bn' ? 'সর্বনিম্ন' : 'Min',
                max: language === 'bn' ? 'সর্বোচ্চ' : 'Max',
                range: language === 'bn' ? 'পরিসর' : 'Range',
                iqr: language === 'bn' ? 'IQR' : 'IQR',
                outliers: language === 'bn' ? 'আউটলাইয়ার সংখ্যা' : 'Outliers',
                mean: language === 'bn' ? 'গড়' : 'Mean',
                median: language === 'bn' ? 'মিডিয়ান' : 'Median',
                mode: language === 'bn' ? 'মোড' : 'Mode',
                variance: language === 'bn' ? 'চর বৈচিত্র্য' : 'Variance',
                std: language === 'bn' ? 'স্ট্যান্ডার্ড ডেভিয়েশন' : 'Std Dev',
                mad: language === 'bn' ? 'ম্যাড' : 'MAD',
                skew: language === 'bn' ? 'স্কিউনেস' : 'Skewness',
                kurt: language === 'bn' ? 'কার্টোসিস' : 'Kurtosis',
                cv: language === 'bn' ? 'CV' : 'Coeff. of Variation',
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
                                            {language === 'bn' ? 'কলাম' : 'Column'}
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
                        {language === 'bn' ? 'মৌলিক EDA বিশ্লেষণ' : 'Basic EDA Summary'}
                    </h2>
                </div>

                {/* Dataset Info Card */}
                {results.info && (
                    <div className="eda-info-card">
                        <h3 className="eda-info-title">
                            {language === 'bn' ? 'ডেটাসেট তথ্য' : 'Dataset Info'}
                        </h3>
                        <div className="stats-results-table-wrapper">
                            <table className="stats-results-table">
                                <tbody>
                                    <tr>
                                        <td className="stats-table-label">
                                            {language === 'bn' ? 'মোট সারি' : 'Total Rows'}
                                        </td>
                                        <td className="stats-table-value stats-numeric">
                                            {mapDigitIfBengali(results.info.rows)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="stats-table-label">
                                            {language === 'bn' ? 'মোট কলাম' : 'Total Columns'}
                                        </td>
                                        <td className="stats-table-value stats-numeric">
                                            {mapDigitIfBengali(results.info.columns)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="stats-table-label">
                                            {language === 'bn' ? 'পুনরাবৃত্ত সারি' : 'Duplicate Rows'}
                                        </td>
                                        <td className="stats-table-value stats-numeric">
                                            {mapDigitIfBengali(results.info.duplicates)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="stats-table-label">
                                            {language === 'bn' ? 'মেমোরি ব্যবহার' : 'Memory Usage'}
                                        </td>
                                        <td className="stats-table-value stats-numeric">
                                            {mapDigitIfBengali(results.info.memory)} {language === 'bn' ? 'কিলোবাইট' : 'KB'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Table 1: Count, Min, Max, Range, IQR, Outliers */}
                {renderWideTable(
                    language === 'bn' ? 'টেবিল ১: পরিসংখ্যান এবং বিস্তার' : 'Table 1: Count, Min, Max, Range, IQR, Outliers',
                    ['count', 'min', 'max', 'range', 'iqr', 'outliers']
                )}

                {/* Table 2: Central Tendency & Dispersion */}
                {renderWideTable(
                    language === 'bn' ? 'টেবিল ২: কেন্দ্রীয় প্রবণতা এবং বিক্ষিপ্ততা' : 'Table 2: Central Tendency & Dispersion',
                    ['mean', 'median', 'mode', 'variance', 'std']
                )}

                {/* Table 3: MAD, Skewness, Kurtosis, CV */}
                {renderWideTable(
                    language === 'bn' ? 'টেবিল ৩: ম্যাড, স্কিউনেস, কার্টোসিস, সিভি' : 'Table 3: MAD, Skewness, Kurtosis, CV',
                    ['mad', 'skew', 'kurt', 'cv']
                )}
            </div>
        );
    };

    const renderSimilarityResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== 'bn') return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === 'bn' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">
                    {language === 'bn' ? 'সাদৃশ্য এবং দূরত্ব বিশ্লেষণ' : 'Similarity and Distance Analysis'}
                </h2>

                {results.heading && (
                    <p className="mb-3 font-medium text-gray-700 dark:text-gray-300">
                        {results.heading}
                    </p>
                )}

                {results.columns && results.columns.length > 0 && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষিত কলাম:' : 'Columns analyzed:'}</strong>{" "}
                        {results.columns.map((col, i) => (
                            <span key={i}>
                                {col}{i < results.columns.length - 1 ? (language === 'bn' ? ' এবং ' : ' and ') : ''}
                            </span>
                        ))}
                    </p>
                )}

                {results.results && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <StatRow label={language === 'bn' ? 'কসাইন সাদৃশ্য' : 'Cosine Similarity'} value={results.results.cosine_similarity} />
                        <StatRow label={language === 'bn' ? 'ইউক্লিডীয় দূরত্ব' : 'Euclidean Distance'} value={results.results.euclidean_distance} />
                        <StatRow label={language === 'bn' ? 'ম্যানহাটন (L1) দূরত্ব' : 'Manhattan (L1) Distance'} value={results.results.manhattan_distance} />
                        <StatRow label={language === 'bn' ? 'চেবিশেভ (L∞) দূরত্ব' : 'Chebyshev (L∞) Distance'} value={results.results.chebyshev_distance} />
                        <StatRow label={
                            language === 'bn'
                                ? `মিনকোর্সকি (p=${results.results.p}) দূরত্ব`
                                : `Minkowski (p=${results.results.p}) Distance`
                        } value={results.results.minkowski_distance} />
                        <StatRow label={language === 'bn' ? 'পিয়ারসন সহগ' : 'Pearson Correlation'} value={results.results.pearson_correlation} />
                        <StatRow label={language === 'bn' ? 'স্পিয়ারম্যান সহগ' : 'Spearman Correlation'} value={results.results.spearman_correlation} />
                    </div>
                )}
            </>
        );
    };


    const renderNetworkGraphResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== 'bn') return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === 'bn' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">
                    {language === 'bn' ? 'নেটওয়ার্ক গ্রাফ বিশ্লেষণ' : 'Network Graph Analysis'}
                </h2>

                <p className="mb-3">
                    <strong>{language === 'bn' ? 'ভিজ্যুয়ালাইজেশন:' : 'Visualization:'}</strong>
                </p>

                {results.image_path && (
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="relative">
                            <img
                                src={`http://127.0.0.1:8000/${results.image_path}`}
                                alt={language === 'bn' ? 'নেটওয়ার্ক গ্রাফ' : 'Network Graph'}
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
                                        alert(language === 'bn' ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download failed');
                                    }
                                }}
                                className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 transform hover:scale-105 flex items-center text-sm"
                                title={language === 'bn' ? 'ছবি ডাউনলোড করুন' : 'Download Image'}
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
                                {language === 'bn' ? 'ডাউনলোড' : 'Download'}
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
                    {language === 'bn' ? 'পরিসংখ্যানগত বিশ্লেষণ ফলাফল' : 'Statistical Analysis Results'}
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
                        {language === 'bn' ? 'আরেকটি বিশ্লেষণ করুন' : 'Perform Another Analysis'}
                    </button>
                </div>
            </div>
        </div>
    );

    // Other visualization components
    // const CorrelationHeatmap = ({ data }) => {
    //     // Extracting unique variables
    //     const variables = [...new Set(data.flatMap(item => [item.Variable_1, item.Variable_2]))];

    //     // Creating correlation matrix
    //     const matrix = [];
    //     for (let i = 0; i < variables.length; i++) {
    //         const row = [];
    //         for (let j = 0; j < variables.length; j++) {
    //             if (i === j) {
    //                 row.push(1); // Diagonal is always 1
    //             } else {
    //                 const correlation = data.find(
    //                     item => (item.Variable_1 === variables[i] && item.Variable_2 === variables[j]) ||
    //                         (item.Variable_1 === variables[j] && item.Variable_2 === variables[i])
    //                 );
    //                 row.push(correlation ? correlation.Correlation : 0);
    //             }
    //         }
    //         matrix.push(row);
    //     }

    //     // Creating color scale
    //     const getColor = (value) => {
    //         if (value >= 0.7) return 'bg-red-700 text-white';
    //         if (value >= 0.5) return 'bg-red-500 text-white';
    //         if (value >= 0.3) return 'bg-red-300 text-gray-800';
    //         if (value >= 0.1) return 'bg-red-100 text-gray-800';
    //         if (value >= -0.1) return 'bg-gray-100 text-gray-800';
    //         if (value >= -0.3) return 'bg-blue-100 text-gray-800';
    //         if (value >= -0.5) return 'bg-blue-300 text-gray-800';
    //         if (value >= -0.7) return 'bg-blue-500 text-white';
    //         return 'bg-blue-700 text-white';
    //     };

    //     return (
    //         <div className="overflow-x-auto">
    //             <table className="w-full bg-white rounded-lg overflow-hidden border-collapse">
    //                 <thead>
    //                     <tr>
    //                         <th className="p-2 border"></th>
    //                         {variables.map((variable, idx) => (
    //                             <th key={idx} className="p-2 border bg-gray-100 text-sm font-medium transform -rotate-45 origin-bottom-left h-20">
    //                                 <div className="ml-2">{variable}</div>
    //                             </th>
    //                         ))}
    //                     </tr>
    //                 </thead>
    //                 <tbody>
    //                     {matrix.map((row, rowIdx) => (
    //                         <tr key={rowIdx}>
    //                             <th className="p-2 border bg-gray-100 font-medium text-left">
    //                                 {variables[rowIdx]}
    //                             </th>
    //                             {row.map((value, colIdx) => (
    //                                 <td
    //                                     key={colIdx}
    //                                     className={`p-2 border text-center ${getColor(value)}`}
    //                                     title={`${variables[rowIdx]} vs ${variables[colIdx]}: ${value.toFixed(2)}`}
    //                                 >
    //                                     {value.toFixed(2)}
    //                                 </td>
    //                             ))}
    //                         </tr>
    //                     ))}
    //                 </tbody>
    //             </table>
    //         </div>
    //     );
    // };
};
export default StatisticalAnalysisTool;