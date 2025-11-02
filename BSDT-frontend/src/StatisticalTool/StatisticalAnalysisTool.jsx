import 'katex/dist/katex.min.css';
import { useEffect, useRef, useState, useMemo, use, Fragment } from 'react';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate } from 'react-router-dom';
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
// import AncovaOptions from './AncovaOptions';
import AndersonDarlingOptions from './AndersonDarlingOptions';
// import AnovaOptions from './AnovaOptions';
import ChiSquareOptions from './ChiSquareOptions';
import CramerVOptions from './CramerVOptions';
import CrossTabulationOptions from './CrossTabulationOptions';
import EDABasicsOptions from './EDABasicsOptions';
import EDADistributionsOptions from './EDADistributionsOptions';
import PieChartOptions from './PieChartOptions';
import BarChartOptions from './BarChartOptions';
import EDASwarmOptions from './EDASwarmOptions';
import FZTOptions from './FZTOptions';
import KolmogorovSmirnovOptions from './KolmogorovSmirnovOptions';
// import KruskalOptions from './PlotCustomizers/KruskalOptions';
import LinearRegressionOptions from './LinearRegressionOptions';
// import MannWhitneyOptions from './MannWhitneyOptions';
import NetworkGraphOptions from './NetworkGraphOptions';
import PearsonOptions from './PearsonOptions';
import ShapiroWilkOptions from './ShapiroWilkOptions';
import SimilarityOptions from './SimilarityOptions';
import SpearmanOptions from './SpearmanOptions';
import statTestDetails from './stat_tests_details';
//import './StatisticalAnalysisTool.css';
import './StatisticalAnalysisResultPage.css';
// import WilcoxonOptions from './WilcoxonOptions';
import apiClient from '../api';
import PreviewTable from './previewTable';
import TestSuggestionsModal from './testSuggestionsModal';
import * as XLSX from "xlsx";

import renderKruskalResults from './RenderFunctions/RenderKruskal/renderKruskalResults';
import renderChiSquareResults from './RenderFunctions/RenderChiSquare/renderChiSquareResults';
import CustomizationOverlay from './RenderFunctions/CustomizationOverlay/CustomizationOverlay';
import renderMannWhitneyResults from './RenderFunctions/renderMannWhitneyResults';
import renderWilcoxonResults from './RenderFunctions/renderWilcoxonResults';
import renderAnovaResults from './RenderFunctions/renderAnovaResults';
import renderAncovaResults from './RenderFunctions/renderAncovaResults';


const translations = {
    English: {
        title: "Statistical Analysis Tool",
        subtitle: "Upload your Excel file and run various statistical tests on your data",
        formTitle: "Data Analysis Form",
        uploadLabel: "Upload Your Data or Use Previously Saved File",
        preprocessedLabel: "Preprocessed File",
        surveyLabel: "Survey Data File",
        dropFile: "Drag your Excel file or click to browse",
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
            ttest_ind: "Independent Samples t-test",
            ttest_paired: "Paired Samples t-test",
            ttest_onesample: "One-Sample t-test",
            ztest: "Z-test",
            ftest: "F-test",
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
            cramers_heatmap: "Cramér's V Heatmap",
            network_graph: "Network Graph",
            fzt: "F / Z / T Test",
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
            ttest_ind: "Compares the means of two independent groups to determine if they are statistically different.",
            ttest_paired: "Compares the means of two related groups to determine if there is a statistically significant difference.",
            ttest_onesample: "Tests whether the mean of a single group is different from a known or hypothesized population mean.",
            ztest: "Tests whether the means of two groups are different when the population variance is known.",
            ftest: "Compares the variances of two populations to test if they are significantly different.",
            mannwhitney: "A non-parametric test used to determine whether there is a difference between two independent groups.",
            kruskal: "A non-parametric test used to compare three or more independent groups to find significant differences.",
            wilcoxon: "A non-parametric test used to compare two related samples to assess whether their population mean ranks differ.",
            linear_regression: "Models the relationship between a dependent variable and one or more independent variables.",
            anova: "Analyzes the differences among group means in a sample.",
            ancova: "Combines ANOVA and regression to evaluate whether population means differ while controlling for covariates.",
            shapiro: "Tests whether a sample comes from a normally distributed population.",
            kolmogorov: "A non-parametric test used to compare a sample distribution to a reference normal distribution.",
            anderson: "A statistical test that evaluates whether a sample comes from a specific distribution, most commonly the normal distribution.",
            fzt: "Performs three statistical tests: F-test for variance comparison, Z-test for mean difference using normal distribution, and Welch’s t-test for unequal variances.",
            cross_tabulation: "Summarizes the relationship between two or more categorical variables using frequency tables and heatmaps.",
            chi_square: "Tests the association between categorical variables using observed and expected frequencies.",
            cramers_heatmap: "Visual representation of Cramér's V association strength between categorical variables.",
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
            ttest_ind: "ইনডিপেনডেন্ট স্যাম্পলস টি-টেস্ট",
            ttest_paired: "পেয়ার্ড স্যাম্পলস টি-টেস্ট",
            ttest_onesample: "ওয়ান-স্যাম্পল টি-টেস্ট",
            ztest: "z-টেস্ট",
            ftest: "f-টেস্ট",
            mannwhitney: "ম্যান-হুইটনি ইউ টেস্ট",
            kruskal: "ক্রুসকাল-ওয়ালিস এইচ-টেস্ট",
            wilcoxon: "উইলকক্সন সাইনড-র‍্যাঙ্ক টেস্ট",
            linear_regression: "রৈখিক রিগ্রেশন",
            anova: "ANOVA",
            ancova: "ANCOVA",
            shapiro: "শাপিরো-উইলক নর্মালিটি পরীক্ষা",
            kolmogorov: "কলমোগোরভ–স্মিরনভ পরীক্ষা",
            anderson: "আন্ডারসন–ডার্লিং টেস্ট",
            fzt: "F / Z / T পরীক্ষা",
            cross_tabulation: "ক্রস ট্যাবুলেশন",
            chi_square: "কাই-স্কয়ার টেস্ট",
            cramers_heatmap: "ক্র্যামের ভি হিটম্যাপ",
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
            ttest_ind: "দুটি স্বাধীন গ্রুপের গড় মানে উল্লেখযোগ্য পার্থক্য আছে কিনা তা নির্ধারণ করে।",
            ttest_paired: "একই গ্রুপের দুটি সম্পর্কযুক্ত অবস্থার গড়ের মধ্যে পার্থক্য আছে কিনা তা যাচাই করে।",
            ttest_onesample: "একটি গ্রুপের গড় কোনো নির্দিষ্ট মানের সাথে পার্থক্যপূর্ণ কিনা তা নির্ধারণ করে।",
            ztest: "দুটি গোষ্ঠীর গড়ে পার্থক্য আছে কিনা তা যাচাই করে যখন জনসংখ্যার বৈচিত্র্য জানা থাকে।",
            ftest: "দুটি গোষ্ঠীর বৈচিত্র্যের মধ্যে পার্থক্য আছে কিনা তা পরীক্ষা করে।",
            mannwhitney: "দুটি স্বাধীন গোষ্ঠীর মধ্যে পার্থক্য আছে কিনা তা নির্ধারণে ব্যবহৃত একটি নন-প্যারামেট্রিক পরীক্ষা।",
            kruskal: "তিন বা ততোধিক স্বাধীন গোষ্ঠীর মধ্যে উল্লেখযোগ্য পার্থক্য আছে কিনা তা নির্ধারণে ব্যবহৃত একটি নন-প্যারামেট্রিক পরীক্ষা।",
            wilcoxon: "দুটি সম্পর্কযুক্ত নমুনার মধ্যকার পার্থক্য নির্ধারণে ব্যবহৃত একটি নন-প্যারামেট্রিক পরীক্ষা।",
            linear_regression: "একটি নির্ভরশীল ভেরিয়েবল এবং এক বা একাধিক স্বাধীন ভেরিয়েবলের মধ্যে সম্পর্ক নির্ধারণ করে।",
            anova: "একাধিক গোষ্ঠীর গড় মানে পার্থক্য আছে কিনা তা বিশ্লেষণ করে।",
            ancova: "ANOVA এবং রিগ্রেশনের সমন্বয়ে গঠিত, যেখানে কভেরিয়েট নিয়ন্ত্রণ করে গোষ্ঠীর গড় মানে পার্থক্য নির্ধারণ করা হয়।",
            shapiro: "একটি নমুনা সাধারণ বন্টন থেকে এসেছে কিনা তা নির্ধারণ করে।",
            kolmogorov: "একটি নন-প্যারামেট্রিক পরীক্ষা যা একটি নমুনার বন্টনকে একটি আদর্শ স্বাভাবিক বন্টনের সাথে তুলনা করে।",
            anderson: "একটি পরিসংখ্যানগত পরীক্ষা যা একটি নমুনা নির্দিষ্ট বণ্টন থেকে এসেছে কিনা তা যাচাই করে, সাধারণত স্বাভাবিক বণ্টনের জন্য ব্যবহৃত হয়।",
            fzt: "তিনটি পরিসংখ্যানিক পরীক্ষা পরিচালনা করে: ভ্যারিয়েন্স তুলনার জন্য F-টেস্ট, গড়ের পার্থক্যের জন্য Z-টেস্ট এবং অসম ভ্যারিয়েন্সের জন্য Welch’s t-টেস্ট।",
            cross_tabulation: "দুই বা ততোধিক শ্রেণিবিন্যাসকৃত ভেরিয়েবলের মধ্যে সম্পর্ক সারাংশ আকারে প্রদর্শন করে, ফ্রিকোয়েন্সি টেবিল ও হিটম্যাপ ব্যবহার করে।",
            chi_square: "বিভিন্ন শ্রেণিবিন্যাসকৃত ভেরিয়েবলের মধ্যে সম্পর্ক নির্ধারণ করে।",
            cramers_heatmap: "Cramér's V ব্যবহার করে শ্রেণিবিন্যাসকৃত ভেরিয়েবলের মধ্যকার সম্পর্কের দৃঢ়তা চিত্রায়িত করে।",
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
            fetch('http://127.0.0.1:8000/api/get-columns/', {
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


    const testsWithoutDetails = [
        'eda_basics',
        'eda_distribution',
        'eda_swarm',
        'eda_pie',
        'bar_chart',
        'similarity',
    ];

    // Add this useEffect to sync tempSelectedColumns when menu opens
    useEffect(() => {
        if (showColumnMenu) {
            setTempSelectedColumns(selectedColumns);
        }
    }, [showColumnMenu, selectedColumns]);


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

            fetch('http://127.0.0.1:8000/api/upload-file/', {
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

        if (['kruskal', 'mannwhitney', 'wilcoxon', 'pearson', 'spearman', 'shapiro', 'linear_regression', 'anova', 'ancova', 'kolmogorov', 'anderson', 'fzt', 'eda_distribution', 'eda_swarm', 'bar_chart', 'eda_pie', 'eda_basics', 'chi_square', 'cramers_heatmap', 'cross_tabulation', 'network_graph'].includes(testType)) {
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
                if (testType === 'bar_chart') {
                    formData.append('orientation', barChartType); // "vertical" | "horizontal"
                }

            }

            if (['pearson', 'spearman', 'cross_tabulation', 'cramers_heatmap', 'chi_square', 'network_graph'].includes(testType)) {
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

        fetch('http://127.0.0.1:8000/api/analyze/', {
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
            case 'ancova':
                return { col2: true, col3: true, refValue: false, heatmapSize: false };
            case 'cross_tabulation':
            case 'network_graph':
            case 'cramers_heatmap':
            case 'chi_square':
            case 'spearman':
            case 'pearson':
                return { col2: false, col3: false, col4: false, refValue: false, heatmapSize: true };
            case 'shapiro':
            case 'kolmogorov':
            case 'anderson':
            case 'kruskal':
                return { col2: true, col3: false, refValue: false, heatmapSize: false, bengaliOptions: true };
            case 'fzt':
                return { col2: true, col3: false, refValue: false, heatmapSize: false, bengaliOptions: true };
            case 'eda_distribution':
                return { col2: false, col3: false, refValue: false, heatmapSize: false };
            case 'eda_swarm':
                return { col2: true, col3: false, refValue: false, heatmapSize: false };
            case 'eda_pie':
                return { col2: false, col3: false, refValue: false, heatmapSize: false };
            case 'bar_chart': // New Code for Bar Chart
                return { col2: false, col3: false, refValue: false, heatmapSize: false };
            case 'eda_basics':
                return { col2: false, col3: false, refValue: false, heatmapSize: false };
            case 'similarity':
                return { col2: true, col3: false, refValue: false, heatmapSize: false, multiColumn: false };
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


    return (


        <div className="an-wrapper">
            <header className="page-header">
                <h1 className="page-title">{t.title}</h1>
            </header>

            <div className="content-center">
                <div className="form-wrapper">
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
                        <div className="card">
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
                                <button onClick={() => navigate("/report")} className="an-btn an-btn-primary small">
                                    {language === "বাংলা" ? "রিপোর্ট দেখুন" : "Show Report"}
                                </button>
                            </div>

                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-section">
                                        <h5 className="section-title">
                                            {isPreprocessed
                                                ? t.preprocessedLabel
                                                : isSurveyData
                                                    ? t.surveyLabel
                                                    : t.uploadLabel}
                                        </h5>

                                        {(isPreprocessed || isSurveyData || file) ? (
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
                                                    <p className="action-text">Import file from Saved Folder</p>
                                                </div>
                                            </div>
                                        )}

                                        {uploadStatus === "loading" && (
                                            <div className="status-line">
                                                <div className="spinner" />
                                                {t.processing}
                                            </div>
                                        )}
                                    </div>

                                    <style jsx>{`
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


                                    {(isPreprocessed || isSurveyData || file) ?
                                            (<div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '10px',
                                                margin: '-70px 0',
                                                marginBottom: '50px',
                                            }}>
                                                <div className="action-buttons" style={{
                                                    display: 'flex',
                                                    gap: '12px',
                                                    justifyContent: 'right'
                                                }}>
                                                    <button
                                                        type="button"
                                                        className="customize-btn"
                                                        onClick={handlePreviewClick}
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                            <circle cx="12" cy="12" r="3"></circle>
                                                        </svg>
                                                        {language === "bn" ? "ডেটা প্রিভিউ" : "Preview Data"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="customize-btn"
                                                        onClick={() => {
                                                            const path = "/preprocess";
                                                            navigate(path, { state: { userId: userId, filename: fileName } });
                                                        }}
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M12 2v6m0 4v10M4 8l4 4-4 4m16-8l-4 4 4 4"></path>
                                                        </svg>
                                                        {language === "bn" ? "ডেটা প্রিপ্রসেস করুন" : "Preprocess Data"}
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
                                                        Reset File
                                                    </button>
                                                </div>

                                                {/* Dotted horizontal line */}
                                                <div style={{
                                                    width: '100%',
                                                    borderBottom: '2px dotted #ddd',
                                                    margin: '0 auto'
                                                }}></div>
                                            </div>) : null}
                                        <style jsx>{`
                                            .customize-btn:hover {
                                                background-color: rgba(34, 197, 94, 0.1); /* Light green background */
                                                border-color: #22c55e; /* Green border */
                                                color: #16a34a; /* Green text */
                                        `}</style>


                                    
                                        

                                        {(isPreprocessed || isSurveyData || file) ? (
                                            <div className="form-section">
                                                <h5 className="section-title">{t.selectTest}</h5>
                                                <label className="form-label">{t.testType}</label>
                                                <select className="form-select" onChange={(e) => setTestType(e.target.value)}>
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
                                                        <option value="fzt">{t.tests.fzt}</option>
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
                                                        <option value="cramers_heatmap">{t.tests.cramers_heatmap}</option>
                                                        <option value="network_graph">{t.tests.network_graph}</option>
                                                    </optgroup>
                                                </select>

                                                <div className="test-description-hint">{t.selectPrompt}</div>

                                                {testType && t.descriptions[testType] && (
                                                    <div className="test-description-box">
                                                        <strong className="test-description-title">
                                                            {language === "bn" ? "পরীক্ষার বিবরণ:" : "Statistical Test Description:"}
                                                        </strong>

                                                        <div className="test-description-text">{t.descriptions[testType]}</div>

                                                        {!testsWithoutDetails.includes(testType) && (
                                                            <div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDetailsModalVisible(true)}
                                                                    className="test-details-link"
                                                                >
                                                                    {language === "bn" ? "বিস্তারিত দেখুন" : "More Details"}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                            </div>) : null}

                                    
                                    {(isPreprocessed || isSurveyData || file) && (
                                        <div className="form-section">
                                        {testType === "bar_chart" ? (
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {language === "bn"
                                                        ? "বার চার্ট টাইপ নির্বাচন করুন:"
                                                        : "Select bar chart type:"}
                                                </label>
                                                <select
                                                    value={barChartType}
                                                    onChange={(e) => setBarChartType(e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="vertical">
                                                        {language === "bn" ? "উল্লম্ব (Vertical)" : "Vertical"}
                                                    </option>
                                                    <option value="horizontal">
                                                        {language === "bn" ? "অনুভূমিক (Horizontal)" : "Horizontal"}
                                                    </option>
                                                </select>
                                            </div>
                                        ) : null}

                                        {(testType === 'pearson' || testType === 'network_graph' || testType === 'spearman' || testType === 'cross_tabulation' || testType === 'chi_square' || testType === 'cramers_heatmap') && (
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

                                                {!["spearman", "pearson", "cross_tabulation", "network_graph", "cramers_heatmap", "chi_square"].includes(testType) && (
                                                    <div className="form-group">
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


                                                {testType === 'pearson' && (
                                                    <PearsonOptions
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
                                                        t={t}
                                                    />
                                                )}

                                                {testType === 'spearman' && (
                                                    <SpearmanOptions
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
                                                        t={t}
                                                    />
                                                )}

                                                {testType === 'shapiro' && (
                                                    <ShapiroWilkOptions
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
                                                        t={t}
                                                    />
                                                )}

                                                {testType === 'linear_regression' && (
                                                    <LinearRegressionOptions
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
                                                        legendFontSize={legendFontSize}
                                                        setLegendFontSize={setLegendFontSize}
                                                        lineColor={lineColor}
                                                        setLineColor={setLineColor}
                                                        lineStyle={lineStyle}
                                                        setLineStyle={setLineStyle}
                                                        lineWidth={lineWidth}
                                                        setLineWidth={setLineWidth}
                                                        dotColor={dotColor}
                                                        setDotColor={setDotColor}
                                                        dotWidth={dotWidth}
                                                        setDotWidth={setDotWidth}
                                                        t={t}
                                                    />
                                                )}

                                                {testType === 'kolmogorov' && (
                                                    <KolmogorovSmirnovOptions
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
                                                        ecdfColor={dotColor}            // reuse dotColor for ECDF
                                                        setEcdfColor={setDotColor}
                                                        cdfColor={lineColor}            // reuse lineColor for CDF
                                                        setCdfColor={setLineColor}
                                                        lineStyle={lineStyle}
                                                        setLineStyle={setLineStyle}
                                                        t={t}
                                                        selectedColumn={column1}
                                                        setSelectedColumn={setColumn1}
                                                    />
                                                )}

                                                {testType === 'anderson' && (
                                                    <AndersonDarlingOptions
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
                                                        scatterColor={dotColor}         // reuse dotColor for scatter
                                                        setScatterColor={setDotColor}
                                                        lineColor={lineColor}
                                                        setLineColor={setLineColor}
                                                        lineStyle={lineStyle}
                                                        setLineStyle={setLineStyle}
                                                        selectedColumn={column1}
                                                        setSelectedColumn={setColumn1}
                                                        t={t}
                                                    />
                                                )}

                                                {testType === 'fzt' && (
                                                    <FZTOptions
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
                                                        lineWidth={lineWidth}
                                                        setLineWidth={setLineWidth}
                                                        lineStyle={lineStyle}
                                                        setLineStyle={setLineStyle}
                                                        fCurveColor={fCurveColor}
                                                        setFCurveColor={setFCurveColor}
                                                        fLineColor={fLineColor}
                                                        setFLineColor={setFLineColor}
                                                        zCurveColor={zCurveColor}
                                                        setZCurveColor={setZCurveColor}
                                                        zLineColor={zLineColor}
                                                        setZLineColor={setZLineColor}
                                                        tCurveColor={tCurveColor}
                                                        setTCurveColor={setTCurveColor}
                                                        tLineColor={tLineColor}
                                                        setTLineColor={setTLineColor}
                                                        hist1Color={hist1Color}
                                                        setHist1Color={setHist1Color}
                                                        hist2Color={hist2Color}
                                                        setHist2Color={setHist2Color}
                                                        t={t}
                                                    />
                                                )}

                                                {testType === 'cross_tabulation' && (
                                                    <CrossTabulationOptions
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
                                                        t={t}
                                                    />
                                                )}

                                                {testType === 'eda_distribution' && (
                                                    <EDADistributionsOptions
                                                        isFirstTimeAnalysis={isFirstTimeAnalysis}
                                                        setIsFirstTimeAnalysis={setIsFirstTimeAnalysis}
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
                                                        histColor={histColor}
                                                        setHistColor={setHistColor}
                                                        kdeColor={kdeColor}
                                                        setKdeColor={setKdeColor}
                                                        distColor={distColor}
                                                        setDistColor={setDistColor}
                                                        showGrid={showGrid}
                                                        setShowGrid={setShowGrid}
                                                        t={t}
                                                    />
                                                )}

                                                {testType === 'eda_swarm' && (
                                                    <EDASwarmOptions
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
                                                        swarmColor={swarmColor}
                                                        setSwarmColor={setSwarmColor}
                                                        t={t}
                                                    />
                                                )}

                                                {testType === 'eda_pie' && (
                                                    <PieChartOptions
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

                                                {testType === 'bar_chart' && (
                                                    <BarChartOptions
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
                                                        barColor={barColor}
                                                        setBarColor={setBarColor}
                                                        barChartType={barChartType}
                                                        setBarChartType={setBarChartType}
                                                        t={t}
                                                    />
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

                                                {testType === 'cramers_heatmap' && (
                                                    <CramerVOptions
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
                                                )}

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
        } else if (testType === 'shapiro') {
            return renderShapiroResults();
        } else if (testType === 'spearman') {
            return renderSpearmanResults();
        } else if (testType === 'pearson') {
            return renderPearsonResults();
        } else if (testType === 'linear_regression') {
            return renderLinearRegressionResults();
        } else if (testType === 'kolmogorov') {
            return renderKolmogorovResults();
        } else if (testType === 'anderson') {
            return renderAndersonDarlingResults();
        } else if (testType === 'fzt') {
            return renderFZTResults();
        } else if (testType === 'cross_tabulation') {
            return renderCrossTabulationResults();
        } else if (testType === 'eda_distribution') {
            return renderEDADistributionResults();
        } else if (testType === 'eda_swarm') {
            return renderEDASwarmResults();
        } else if (testType === 'eda_pie') {  // New Code For Pie Chart
            return renderPieChartResults();
        } else if (testType === 'eda_basics') {
            return renderEDABasicsResults();
        } else if (testType === 'similarity') {
            return renderSimilarityResults();
        } else if (testType === 'chi_square') {
            return renderChiSquareResults(chiSquareActiveTab, setChiSquareActiveTab, results, language);
        } else if (testType === 'cramers_heatmap') {
            return renderCramerVResults();
        } else if (testType === 'network_graph') {
            return renderNetworkGraphResults();
        } else if (testType === 'bar_chart') {
            return renderBarChartResults();
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


    const renderShapiroResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== 'বাংলা') return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === 'বাংলা' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        //  NEW: Handle backend error (non-numeric column)
        if (results.success === false && results.error) {
            return (
                <p className="text-red-600 font-semibold">
                    {results.error}
                </p>
            );
        }

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">
                    {t.tests.shapiro || 'Shapiro-Wilk Normality Test'}
                </h2>

                {columns?.length > 0 && (
                    <p className="mb-3">
                        <strong>{language === 'বাংলা' ? 'বিশ্লেষণকৃত কলাম:' : 'Column analyzed:'}</strong>{' '}
                        {columns[0]}
                    </p>
                )}

                {results.interpretation && (
                    <p className="mb-3">
                        <strong>{language === 'বাংলা' ? 'মূল্যায়ন:' : 'Interpretation:'}</strong>{' '}
                        {results.interpretation}
                    </p>
                )}

                <p className="mb-3">
                    <strong>{language === 'বাংলা' ? 'p-মান:' : 'p-value:'}</strong>{' '}
                    {mapDigitIfBengali(results.p_value?.toFixed(4))}
                </p>

                <p className="mb-3">
                    <strong>{language === 'বাংলা' ? 'পরিসংখ্যান মান:' : 'Test statistic:'}</strong>{' '}
                    {mapDigitIfBengali(results.statistic?.toFixed(4))}
                </p>

                {results.image_path && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'বাংলা' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualization'}
                        </h3>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="relative">
                                <img
                                    src={`http://127.0.0.1:8000/${results.image_path}`}
                                    alt="Shapiro-Wilk visualization"
                                    className="w-full h-auto object-contain"
                                />
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(`http://127.0.0.1:8000/${results.image_path}`);
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            const filename = results.image_path.split('/').pop() || 'shapiro_visualization.png';
                                            link.href = url;
                                            link.download = filename;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(url);
                                        } catch (error) {
                                            console.error('Download failed:', error);
                                            alert(language === 'বাংলা' ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download failed');
                                        }
                                    }}
                                    className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 transform hover:scale-105 flex items-center text-sm"
                                    title={language === 'বাংলা' ? 'ছবি ডাউনলোড করুন' : 'Download Image'}
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
                                    {language === 'বাংলা' ? 'ডাউনলোড' : 'Download'}
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderSpearmanResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== 'বাংলা') return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === 'বাংলা' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">{t.tests.spearman || 'Spearman Correlation'}</h2>

                {/* {columns?.length > 0 && (
                    <p className="mb-3">
                        <strong>{language === 'বাংলা' ? 'বিশ্লেষণকৃত কলাম:' : 'Columns analyzed:'}</strong>{' '}
                        {columns.filter(Boolean).join(language === 'বাংলা' ? ' এবং ' : ' and ')}
                    </p>
                )} */}

                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'বাংলা' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualizations'}
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {results.image_paths.map((path, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                    <div className="relative">
                                        <img
                                            src={`http://127.0.0.1:8000/${path}`}
                                            alt={`Spearman visualization ${index + 1}`}
                                            className="w-full h-auto object-contain"
                                        />
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(`http://127.0.0.1:8000/${path}`);
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    const filename = path.split('/').pop() || `spearman_visual_${index + 1}.png`;
                                                    link.href = url;
                                                    link.download = filename;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    window.URL.revokeObjectURL(url);
                                                } catch (error) {
                                                    console.error('Download failed:', error);
                                                    alert(language === 'বাংলা' ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download failed');
                                                }
                                            }}
                                            className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 transform hover:scale-105 flex items-center text-sm"
                                            title={language === 'বাংলা' ? 'ছবি ডাউনলোড করুন' : 'Download Image'}
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
                                            {language === 'বাংলা' ? 'ডাউনলোড' : 'Download'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderPearsonResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== 'বাংলা') return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === 'বাংলা' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">{t.tests.pearson || 'Pearson Correlation'}</h2>

                {/* {columns?.length > 0 && (
                    <p className="mb-3">
                        <strong>{language === 'বাংলা' ? 'বিশ্লেষণকৃত কলাম:' : 'Columns analyzed:'}</strong>{' '}
                        {columns.filter(Boolean).join(language === 'বাংলা' ? ' এবং ' : ' and ')}
                    </p>
                )} */}

                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'বাংলা' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualizations'}
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {results.image_paths.map((path, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                    <div className="relative">
                                        <img
                                            src={`http://127.0.0.1:8000/${path}`}
                                            alt={`Pearson visualization ${index + 1}`}
                                            className="w-full h-auto object-contain"
                                        />
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(`http://127.0.0.1:8000/${path}`);
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    const filename = path.split('/').pop() || `pearson_visual_${index + 1}.png`;
                                                    link.href = url;
                                                    link.download = filename;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    window.URL.revokeObjectURL(url);
                                                } catch (error) {
                                                    console.error('Download failed:', error);
                                                    alert(language === 'বাংলা' ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download failed');
                                                }
                                            }}
                                            className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 transform hover:scale-105 flex items-center text-sm"
                                            title={language === 'বাংলা' ? 'ছবি ডাউনলোড করুন' : 'Download Image'}
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
                                            {language === 'বাংলা' ? 'ডাউনলোড' : 'Download'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderLinearRegressionResults = () => {
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
                    {t.tests.linear_regression || "Linear Regression"}
                </h2>

                {columns?.length > 0 && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষণকৃত কলাম:' : 'Columns analyzed:'}</strong>{' '}
                        {columns.filter(Boolean).join(language === 'bn' ? ' এবং ' : ' and ')}
                    </p>
                )}

                <p className="mb-3">
                    <strong>{language === 'bn' ? 'ইন্টারসেপ্ট:' : 'Intercept:'}</strong>{' '}
                    {results.intercept !== undefined ? mapDigitIfBengali(results.intercept) : '—'}
                </p>

                <p className="mb-3">
                    <strong>{language === 'bn' ? 'কোইফিশিয়েন্ট:' : 'Coefficient:'}</strong>{' '}
                    {results.coefficient !== undefined ? mapDigitIfBengali(results.coefficient) : '—'}
                </p>

                <p className="mb-3">
                    <strong>{language === 'bn' ? 'আর-স্কোয়ারড মান (R²):' : 'R-squared (R²):'}</strong>{' '}
                    {results.r2_score !== undefined ? mapDigitIfBengali(results.r2_score) : '—'}
                </p>

                <p className="mb-3">
                    <strong>{language === 'bn' ? 'গড় স্কোয়ার্ড ত্রুটি (MSE):' : 'Mean Squared Error (MSE):'}</strong>{' '}
                    {results.mse !== undefined ? mapDigitIfBengali(results.mse) : '—'}
                </p>

                {results.image_paths?.[0] && (

                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'bn' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualization'}
                        </h3>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <img
                                src={`http://127.0.0.1:8000/${results.image_paths[0]}`}
                                alt="Linear Regression Plot"
                                className="w-full h-auto object-contain"
                            />
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`http://127.0.0.1:8000/${results.image_paths[0]}`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        const filename = results.image_paths[0].split('/').pop() || 'linear_regression_plot.png';
                                        link.href = url;
                                        link.download = filename;
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

    const renderKolmogorovResults = () => {
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
                    {t.tests.kolmogorov || "Kolmogorov–Smirnov Test"}
                </h2>

                {columns?.length > 0 && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষণকৃত কলাম:' : 'Column analyzed:'}</strong>{' '}
                        {columns[0]}
                    </p>
                )}

                {results.p_value && (
                    <p className="mb-3">
                        <strong>p-value:</strong> {results.p_value}
                    </p>
                )}

                {results.interpretation && (
                    <p className="mb-4 text-blue-700 font-semibold">
                        {results.interpretation}
                    </p>
                )}

                {results.image_paths?.[0] && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'bn' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualization'}
                        </h3>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <img
                                src={`http://127.0.0.1:8000/${results.image_paths[0]}`}
                                alt="K–S Plot"
                                className="w-full h-auto object-contain"
                            />
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`http://127.0.0.1:8000/${results.image_paths[0]}`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        const filename = results.image_paths[0].split('/').pop() || 'ancova_plot.png';
                                        link.href = url;
                                        link.download = filename;
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

    const renderAndersonDarlingResults = () => {
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
                    {t.tests.anderson || "Anderson–Darling Test"}
                </h2>

                {columns?.length > 0 && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষণকৃত কলাম:' : 'Column analyzed:'}</strong>{' '}
                        {columns[0]}
                    </p>
                )}

                {results.a_stat && (
                    <p className="mb-3">
                        <strong>A²:</strong> {results.a_stat}
                    </p>
                )}

                {results.interpretation && (
                    <p className="mb-4 text-blue-700 font-semibold">
                        {results.interpretation}
                    </p>
                )}

                {results.image_paths?.[0] && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'bn' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualization'}
                        </h3>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <img
                                src={`http://127.0.0.1:8000/${results.image_paths[0]}`}
                                alt="Anderson–Darling Plot"
                                className="w-full h-auto object-contain"
                            />
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`http://127.0.0.1:8000/${results.image_paths[0]}`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        const filename = results.image_paths[0].split('/').pop() || 'anderson_darling_plot.png';
                                        link.href = url;
                                        link.download = filename;
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

    const renderFZTResults = () => {
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
                    {language === 'bn' ? 'F / Z / T পরীক্ষার ফলাফল' : 'F / Z / T Test Results'}
                </h2>

                {columns && columns.length === 2 && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষিত কলাম:' : 'Columns analyzed:'}</strong>{" "}
                        {columns[0]} {language === 'bn' ? 'এবং' : 'and'} {columns[1]}
                    </p>
                )}


                {results?.statistic && (
                    <>
                        {results.statistic.F !== undefined && (
                            <p className="mb-2">
                                <strong>F:</strong>{" "}
                                {mapDigitIfBengali(results.statistic.F.toFixed(4))}{" "}
                                &nbsp;&nbsp;&nbsp;
                                <strong>p(F):</strong>{" "}
                                {mapDigitIfBengali(results.statistic.F_p?.toFixed(6))}
                            </p>
                        )}

                        {results.statistic.Z !== undefined && (
                            <p className="mb-2">
                                <strong>Z:</strong>{" "}
                                {mapDigitIfBengali(results.statistic.Z.toFixed(4))}{" "}
                                &nbsp;&nbsp;&nbsp;
                                <strong>p(Z):</strong>{" "}
                                {mapDigitIfBengali(results.statistic.Z_p?.toFixed(6))}
                            </p>
                        )}

                        {results.statistic.T !== undefined && (
                            <p className="mb-2">
                                <strong>T:</strong>{" "}
                                {mapDigitIfBengali(results.statistic.T.toFixed(4))}{" "}
                                &nbsp;&nbsp;&nbsp;
                                <strong>p(T):</strong>{" "}
                                {mapDigitIfBengali(results.statistic.T_p?.toFixed(6))}
                                {results.statistic.T_df !== undefined && (
                                    <>
                                        {" "}
                                        &nbsp;&nbsp;&nbsp;
                                        <strong>df:</strong>{" "}
                                        {mapDigitIfBengali(results.statistic.T_df?.toFixed(1))}
                                    </>
                                )}
                            </p>
                        )}
                    </>
                )}


                {results?.p_value !== undefined && (
                    <p className="mb-4">
                        <strong>{language === 'bn' ? 'সিদ্ধান্ত:' : 'Conclusion'}:</strong>
                        {results.p_value < 0.05 ? (
                            <span className="text-green-600 font-medium ml-2">
                                {language === 'bn' ? 'গুরুত্বপূর্ণ পার্থক্য পাওয়া গেছে' : 'Significant difference found'}
                            </span>
                        ) : (
                            <span className="text-red-600 font-medium ml-2">
                                {language === 'bn' ? 'গুরুত্বপূর্ণ পার্থক্য পাওয়া যায়নি' : 'No significant difference found'}
                            </span>
                        )}
                    </p>
                )}

                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'bn' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualizations'}
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {results.image_paths.map((path, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                    <img
                                        src={`http://127.0.0.1:8000/${path}`}
                                        alt={`FZT visualization ${index + 1}`}
                                        className="w-full h-auto object-contain"
                                    />
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`http://127.0.0.1:8000/${path}`);
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                const filename = path.split('/').pop() || `fzt_visualization_${index + 1}.png`;
                                                link.href = url;
                                                link.download = filename;
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
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderCrossTabulationResults = () => {
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
                    {language === 'bn' ? 'ক্রস ট্যাবুলেশন বিশ্লেষণ' : 'Cross Tabulation Analysis'}
                </h2>

                {/* Columns Analyzed */}
                {columns && columns.length >= 2 && (
                    <p className="mb-4">
                        <strong>{language === 'bn' ? 'বিশ্লেষিত কলাম:' : 'Columns analyzed:'}</strong>{' '}
                        {columns.map((col, idx) => (
                            <span key={idx}>
                                {col}{idx < columns.length - 1 ? (language === 'bn' ? ' এবং ' : ' and ') : ''}
                            </span>
                        ))}
                    </p>
                )}


                {/* Translated Table */}
                {results.translated_table && (
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-3 text-center">
                            {language === 'bn' ? 'অনুবাদিত টেবিল' : 'Translated Table'}
                        </h3>
                        <div className="flex justify-center">
                            <div className="overflow-auto">
                                <table className="min-w-max border-collapse border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 px-3 py-2 bg-gray-100">
                                                {language === 'bn' ? 'ইন্ডেক্স' : 'Index'}
                                            </th>
                                            {Object.keys(results.translated_table[Object.keys(results.translated_table)[0]]).map((col, idx) => (
                                                <th key={idx} className="border border-gray-300 px-3 py-2 bg-gray-100">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(results.translated_table).map(([rowLabel, rowData], idx) => (
                                            <tr key={idx}>
                                                <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                                                    {rowLabel}
                                                </td>
                                                {Object.values(rowData).map((val, i) => (
                                                    <td key={i} className="border border-gray-300 px-3 py-2 text-center">
                                                        {val}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Visualizations */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {results.heatmap_path && (
                        <div className="text-center">
                            <h4 className="text-lg font-semibold mb-2">
                                {language === 'bn' ? 'হিটম্যাপ' : 'Heatmap'}
                            </h4>
                            <img
                                src={`http://127.0.0.1:8000/${results.heatmap_path}`}
                                alt="Heatmap"
                                className="w-full h-auto object-contain border rounded shadow"
                            />
                        </div>
                    )}

                    {results.barplot_path && (
                        <div className="text-center">
                            <h4 className="text-lg font-semibold mb-2">
                                {language === 'bn' ? 'বারপ্লট' : 'Bar Plot'}
                            </h4>
                            <img
                                src={`http://127.0.0.1:8000/${results.barplot_path}`}
                                alt="Bar Plot"
                                className="w-full h-auto object-contain border rounded shadow"
                            />
                        </div>
                    )}
                </div>

                {/* Summary */}
                {results.summary && (
                    <div className="mb-6 bg-gray-100 p-4 rounded shadow">
                        <h3 className="text-lg font-semibold mb-2">{language === 'bn' ? 'সারাংশ' : 'Summary'}</h3>
                        <ul className="list-disc list-inside text-gray-800">
                            <li>{results.summary.total_observations}</li>
                            <li>{results.summary.most_frequent}</li>
                            <li>{results.summary.least_frequent}</li>
                        </ul>
                    </div>
                )}

            </>
        );
    };

    const renderEDADistributionResults = () => {
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

        const cacheBuster = results._timestamp || Date.now();

        const handleSaveResult = async () => {
            console.log('Saving Distribution result...');
            try {
                const response = await fetch('http://127.0.0.1:8000/api/save-results/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image_paths: results.image_paths,
                        user_id: user_id,
                        test_name: testType,
                        filename: filename,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Result saved successfully:', data);
                } else {
                    console.error('Error saving result:', response.statusText);
                }
            } catch (error) {
                console.error('Error saving result:', error);
            }
        };

        return (
            <div className="stats-results-container stats-fade-in">
                {/* Header Section */}
                <div className="stats-header">
                    <h2 className="stats-title">
                        {language === 'bn'
                            ? 'ডিস্ট্রিবিউশন প্লট – হিস্টোগ্রাম + KDE'
                            : 'Distribution Plot – Histogram + KDE'}
                    </h2>
                    <button onClick={handleSaveResult} className="stats-save-btn">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                        {language === 'bn' ? 'ফলাফল সংরক্ষণ করুন' : 'Save Result'}
                    </button>
                </div>

                {/* Compact Results Table */}
                <div className="stats-results-table-wrapper">
                    <table className="stats-results-table">
                        <thead>
                            <tr>
                                <th>{language === 'bn' ? 'বিবরণ' : 'Description'}</th>
                                <th>{language === 'bn' ? 'মান' : 'Value'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Columns Row */}
                            {columns && columns[0] && (
                                <tr>
                                    <td className="stats-table-label">
                                        {language === 'bn' ? 'বিশ্লেষিত কলাম' : 'Analyzed Column'}
                                    </td>
                                    <td className="stats-table-value">
                                        {columns[0]}
                                    </td>
                                </tr>
                            )}

                            {/* Analysis Type Row */}
                            <tr>
                                <td className="stats-table-label">
                                    {language === 'bn' ? 'বিশ্লেষণের ধরন' : 'Analysis Type'}
                                </td>
                                <td className="stats-table-value">
                                    {language === 'bn' ? 'বিতরণ বিশ্লেষণ (হিস্টোগ্রাম ও KDE)' : 'Distribution Analysis (Histogram & KDE)'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Visualizations Section */}
                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="stats-viz-section">

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className="stats-viz-header" style={{ margin: 0 }}>
                                {language === 'bn' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualizations'}
                            </h3>

                            {!isFirstTimeAnalysis && (
                                <EDADistributionsOptions
                                    isFirstTimeAnalysis={isFirstTimeAnalysis}
                                    setIsFirstTimeAnalysis={setIsFirstTimeAnalysis}
                                    handleSubmit={handleSubmit}
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
                                    histColor={histColor}
                                    setHistColor={setHistColor}
                                    kdeColor={kdeColor}
                                    setKdeColor={setKdeColor}
                                    distColor={distColor}
                                    setDistColor={setDistColor}
                                    showGrid={showGrid}
                                    setShowGrid={setShowGrid}
                                    t={t}
                                />
                            )}
                        </div>

                        {isFirstTimeAnalysis && (
                            <EDADistributionsOptions
                                isFirstTimeAnalysis={isFirstTimeAnalysis}
                                setIsFirstTimeAnalysis={setIsFirstTimeAnalysis}
                                handleSubmit={handleSubmit}
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
                                histColor={histColor}
                                setHistColor={setHistColor}
                                kdeColor={kdeColor}
                                setKdeColor={setKdeColor}
                                distColor={distColor}
                                setDistColor={setDistColor}
                                showGrid={showGrid}
                                setShowGrid={setShowGrid}
                                t={t}
                            />
                        )}

                        <div className="stats-viz-grid">
                            {results.image_paths.map((path, index) => {
                                const imageUrl = `http://127.0.0.1:8000/${path}?t=${cacheBuster}`;

                                const handleDownload = async () => {
                                    try {
                                        const response = await fetch(imageUrl);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;

                                        const filename = path.split('/').pop() ||
                                            `distribution_visualization_${index + 1}.png`;
                                        link.download = filename;

                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error('Download failed:', error);
                                        alert(language === 'bn' ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download failed');
                                    }
                                };

                                return (
                                    <div key={`${index}-${cacheBuster}`} className="stats-image-card">
                                        <div className="stats-image-wrapper">
                                            <img
                                                src={imageUrl}
                                                alt={`Distribution visualization ${index + 1}`}
                                                className="stats-image"
                                            />
                                            <button
                                                onClick={handleDownload}
                                                className="stats-download-btn"
                                                title={language === 'bn'
                                                    ? `ছবি ${index + 1} ডাউনলোড করুন`
                                                    : `Download Image ${index + 1}`}
                                                aria-label={language === 'bn' ? 'ডাউনলোড' : 'Download'}
                                            >
                                                <svg
                                                    className="stats-download-icon"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderEDASwarmResults = () => {
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
                    {language === 'bn' ? 'স্বর্ম প্লট বিশ্লেষণ' : 'Swarm Plot Analysis'}
                </h2>

                {columns && columns.length >= 2 && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষিত কলাম:' : 'Columns analyzed:'}</strong>{" "}
                        {columns.map((col, i) =>
                            `${mapDigitIfBengali(col)}${i < columns.length - 1 ? ', ' : ''}`
                        )}
                    </p>
                )}

                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'bn' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualizations'}
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {results.image_paths.map((path, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                    <img
                                        src={`http://127.0.0.1:8000/${path}`}
                                        alt={`Swarm Plot ${index + 1}`}
                                        className="w-full h-auto object-contain"
                                    />
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`http://127.0.0.1:8000/${path}`);
                                                if (!response.ok) throw new Error('Network response was not ok');
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                const filename = path.split('/').pop() || `swarm_plot_${index + 1}.png`;
                                                link.href = url;
                                                link.download = filename;
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
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderPieChartResults = () => {
        if (!results) {
            return <p>{language === 'bn' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        // 🛠 Handle backend error
        if (results.success === false) {
            return (
                <p className="text-red-600">
                    {results.error}
                </p>
            );
        }

        const handleDownload = async (path, index) => {
            try {
                const response = await fetch(`http://127.0.0.1:8000${path}`);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;

                // filename → fallback if not in path
                const filename = path.split('/').pop() || `pie_chart_${index + 1}.png`;
                link.download = filename;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Download failed:', error);
                alert(language === 'bn' ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download failed');
            }
        };

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">
                    {language === 'bn' ? 'পাই চার্ট' : 'Pie Chart'}
                </h2>

                {results.columns && results.columns[0] && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষিত কলাম:' : 'Column analyzed:'}</strong> {results.columns[0]}
                    </p>
                )}

                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'bn' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualization'}
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {results.image_paths.map((path, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md p-4 relative">
                                    <img
                                        src={`http://127.0.0.1:8000${path}`}
                                        alt={`Pie chart visualization ${index + 1}`}
                                        className="w-full h-auto object-contain"
                                    />
                                    <button
                                        onClick={() => handleDownload(path, index)}
                                        className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 transform hover:scale-105 flex items-center text-sm"
                                        title={language === 'bn'
                                            ? `ছবি ${index + 1} ডাউনলোড করুন`
                                            : `Download Image ${index + 1}`}
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
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
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

    const renderCramerVResults = () => {
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
                    {language === 'bn' ? "ক্র্যামের ভি হিটম্যাপ" : "Cramér's V Heatmap"}
                </h2>


                <p>
                    {results.columns.length > 0 && (

                        // print first n-1 columns

                        <><strong>{language === 'bn' ? 'বিশ্লেষিত কলাম:' : 'Columns analyzed:'}</strong>{" "}
                            {results.columns.map((col, i) => (
                                <span key={i}>
                                    {col}{i < results.columns.length - 1 ? (language === 'bn' ? ' , ' : ' , ') : ''}
                                </span>
                            ))}</>

                    )}
                </p>

                {results.statistic !== undefined && (
                    <p className="mb-2">
                        <strong>{language === 'bn' ? 'Cramér\'s V মান:' : "Cramér's V value:"}</strong>{" "}
                        {mapDigitIfBengali(parseFloat(results.statistic).toFixed(4))}
                    </p>
                )}

                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'bn' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualizations'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.image_paths.map((path, index) => {
                                const handleDownload = async () => {
                                    try {
                                        const response = await fetch(`http://127.0.0.1:8000/${path}`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        const filename = path.split('/').pop() || `cramer_v_plot_${index + 1}.png`;
                                        link.href = url;
                                        link.download = filename;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error('Download failed:', error);
                                        alert(language === 'bn' ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download failed');
                                    }
                                };

                                return (
                                    <div key={index} className="bg-white rounded shadow p-2 relative">
                                        <img
                                            src={`http://127.0.0.1:8000/${path}`}
                                            alt={`cramer-v-plot-${index + 1}`}
                                            className="w-full h-auto object-contain"
                                        />
                                        <button
                                            onClick={handleDownload}
                                            className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 text-sm"
                                            title={language === 'bn' ? 'ডাউনলোড করুন' : 'Download'}
                                        >
                                            ⬇ {language === 'bn' ? 'ডাউনলোড' : 'Download'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
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

    const [barChartType, setBarChartType] = useState("vertical");
    const renderBarChartResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== "বাংলা") return text;
            return text.toString().split("").map(char => digitMapBn[char] || char).join("");
        };

        if (!results) {
            return <p>{language === "বাংলা" ? "ফলাফল লোড হচ্ছে..." : "Loading results..."}</p>;
        }

        const handleSaveResult = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/save-results/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        image_paths: results.image_paths,
                        user_id: user_id,
                        test_name: "Bar Chart",
                        filename: filename,
                    }),
                });
                if (!response.ok) throw new Error("Save failed");
            } catch (error) {
                console.error(error);
                alert(language === "বাংলা" ? "সংরক্ষণ ব্যর্থ হয়েছে" : "Save failed");
            }
        };

        return (
            <>
                <div className="relative mb-4">
                    <h2 className="text-2xl font-bold">
                        {language === "বাংলা" ? "বার চার্ট" : "Bar Chart"}
                    </h2>
                    <button
                        onClick={handleSaveResult}
                        className="absolute top-0 right-0 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md shadow-md"
                    >
                        {language === "বাংলা" ? "ফলাফল সংরক্ষণ করুন" : "Save Result"}
                    </button>
                </div>

                {columns && columns[0] && (
                    <p className="mb-3">
                        <strong>{language === "বাংলা" ? "বিশ্লেষিত কলাম:" : "Column analyzed:"}</strong> {columns[0]}
                    </p>
                )}

                <p className="mb-3">
                    <strong>{language === "বাংলা" ? "বার চার্ট টাইপ:" : "Chart type:"}</strong>{" "}
                    {results.orientation === "vertical"
                        ? (language === "বাংলা" ? "উল্লম্ব" : "Vertical")
                        : (language === "বাংলা" ? "অনুভূমিক" : "Horizontal")}
                </p>

                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === "বাংলা" ? "ভিজ্যুয়ালাইজেশন" : "Visualizations"}
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {results.image_paths.map((path, index) => {
                                const handleDownload = async () => {
                                    try {
                                        const response = await fetch(`http://127.0.0.1:8000/${path}`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement("a");
                                        link.href = url;
                                        link.download = path.split("/").pop() || `barchart_${index + 1}.png`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                    } catch (err) {
                                        alert(language === "বাংলা" ? "ডাউনলোড ব্যর্থ হয়েছে" : "Download failed");
                                    }
                                };

                                return (
                                    <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                        <div className="relative">
                                            <img
                                                src={`http://127.0.0.1:8000/${path}`}
                                                alt={`Bar chart visualization ${index + 1}`}
                                                className="w-full h-auto object-contain"
                                            />
                                            <button
                                                onClick={handleDownload}
                                                className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-md flex items-center text-sm"
                                            >
                                                {language === "বাংলা" ? "ডাউনলোড" : "Download"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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