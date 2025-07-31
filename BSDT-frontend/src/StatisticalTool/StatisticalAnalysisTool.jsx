import 'katex/dist/katex.min.css';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
import AncovaOptions from './AncovaOptions';
import AndersonDarlingOptions from './AndersonDarlingOptions';
import AnovaOptions from './AnovaOptions';
import ChiSquareOptions from './ChiSquareOptions';
import CramerVOptions from './CramerVOptions';
import CrossTabulationOptions from './CrossTabulationOptions';
import EDABasicsOptions from './EDABasicsOptions';
import EDADistributionsOptions from './EDADistributionsOptions';
import EDAPieChartOptions from './EDAPieChartOptions';
import EDASwarmOptions from './EDASwarmOptions';
import FZTOptions from './FZTOptions';
import KolmogorovSmirnovOptions from './KolmogorovSmirnovOptions';
import KruskalOptions from './KruskalOptions';
import LinearRegressionOptions from './LinearRegressionOptions';
import MannWhitneyOptions from './MannWhitneyOptions';
import NetworkGraphOptions from './NetworkGraphOptions';
import PearsonOptions from './PearsonOptions';
import ShapiroWilkOptions from './ShapiroWilkOptions';
import SimilarityOptions from './SimilarityOptions';
import SpearmanOptions from './SpearmanOptions';
import statTestDetails from './stat_tests_details';
import './StatisticalAnalysisTool.css';
import WilcoxonOptions from './WilcoxonOptions';

import PreviewTable from './previewTable';
import TestSuggestionsModal from './testSuggestionsModal';


const translations = {
    English: {
        title: "Statistical Analysis Tool",
        subtitle: "Upload your Excel file and run various statistical tests on your data",
        formTitle: "Data Analysis Form",
        uploadLabel: "Upload Your Data",
        preprocessedLabel : "Preprocessed File",
        dropFile: "Drag & drop your Excel file or click to browse",
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
        preprocessedLabel : "পূর্বপ্রক্রিয়াকৃত ফাইল",
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
    const [testanalyze, setTestanalyze]= useState(false)
    const [columnanalyze, setColumnanalyze]= useState(false)


    useEffect(() => {
  
    let filename =  '';
    if(isPreprocessed ) {
        filename = "preprocessed_"+sessionStorage.getItem("file_name") || '';
    } else {
        filename = sessionStorage.getItem("file_name") || '';
    }

    let fileUrl = "";


    if (isPreprocessed) {
        fileUrl = `http://127.0.0.1:8000/media/ID_${userId}_uploads/temporary_uploads/preprocessed/${filename}`;
       
        sessionStorage.removeItem("preprocessed");
    } else if (isSurveyData) {
        fileUrl = `http://127.0.0.1:8000/media/ID_${userId}_uploads/temporary_uploads/survey/${filename}`;

        sessionStorage.removeItem("surveyfile");
    }
    else {
        fileUrl = sessionStorage.getItem("fileURL");
    }


    if (fileUrl) {
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
                

                return fetch('http://localhost:2000/api/upload/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    },
                    body: formData,
                });
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setColumns(data.columns);
                    console.log("Columns extracted:", columns);
                    setColumn1(data.columns[0]);
                    setColumn2(data.columns.length > 1 ? data.columns[1] : '');
                    setUploadStatus('success');
                } else {
                    setErrorMessage(data.error || "Failed to process columns");
                    setUploadStatus('error');
                }
            })
            .catch(err => {
                console.error("Could not load and process file:", err);
                setErrorMessage("File loading failed.");
                setUploadStatus("error");
            });
    }
}, []);
useEffect(() => {
    //check columns state
    if (columns.length > 0) {
        console.log("Columns loaded:", columns);
    }
}, [columns]);

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
    const [referenceValue, setReferenceValue] = useState(0);
    const [heatmapSize, setHeatmapSize] = useState('');

    const [imageFormat, setImageFormat] = useState('png');
    const [useDefaultSettings, setUseDefaultSettings] = useState(true);
    const [labelFontSize, setLabelFontSize] = useState(36);
    const [tickFontSize, setTickFontSize] = useState(16);
    const [imageQuality, setImageQuality] = useState(90);
    const [imageSize, setImageSize] = useState('800x600');
    const [colorPalette, setColorPalette] = useState('deep');
    const [barWidth, setBarWidth] = useState(0.8);
    const [boxWidth, setBoxWidth] = useState(0.8);
    const [violinWidth, setViolinWidth] = useState(0.8);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    //
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
    const [histColor, setHistColor] = useState('blue');
    const [kdeColor, setKdeColor] = useState('green');
    const [distColor, setDistColor] = useState('purple');

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

    // Results state
    const [results, setResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const userId =localStorage.getItem("user_id");

    // Refs
    const fileInputRef = useRef(null);
    const uploadContainerRef = useRef(null);

    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);


    const testsWithoutDetails = [
    'eda_basics',
    'eda_distribution',
    'eda_swarm',
    'eda_pie',
    'similarity',
    ];
    

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
            console.log("File selected:", selectedFile);
            // formData.append('selected_tests', testType);

            // Call the API to get columns
            // attach token
            const token = localStorage.getItem("token");
            fetch('http://localhost:2000/api/upload/', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        setColumns(data.columns);
                        setColumn1(data.columns[0]);
                        setColumn2(data.columns.length > 1 ? data.columns[1] : '');                     
                        setUploadStatus('success');
                        const fixedUrl = data.fileURL.replace(/\\/g, '/');
                        sessionStorage.setItem("fileURL", 'http://127.0.0.1:8000' + fixedUrl);
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
    
useEffect(() => {
  if (userId) {
    console.log(" React state updated: userId =", userId);
  }
}, [userId]);

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
    const langCode = language === 'বাংলা' ? 'bn' : 'en';
    const isHeatmap4x4 = heatmapSize === '4x4';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_name', fileName);
    formData.append('userID', userId); // Attach user ID if available
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
        }else if (testType === 'network_graph') {
     
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

    if (['kruskal', 'mannwhitney', 'wilcoxon', 'pearson', 'spearman', 'shapiro', 'linear_regression', 'anova', 'ancova', 'kolmogorov', 'anderson', 'fzt', 'eda_distribution', 'eda_swarm', 'eda_pie', 'eda_basics', 'chi_square', 'cramers_heatmap', 'cross_tabulation','network_graph'].includes(testType)) {
            formData.append('format', imageFormat);
            formData.append('use_default', useDefaultSettings ? 'true' : 'false');

            if (!useDefaultSettings) {
                formData.append('label_font_size', labelFontSize.toString());
                formData.append('tick_font_size', tickFontSize.toString());
                formData.append('image_quality', imageQuality.toString());
                formData.append('image_size', imageSize);
                formData.append('palette', colorPalette);
                formData.append('bar_width', barWidth.toString());

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

            if (['pearson', 'spearman', 'cross_tabulation'].includes(testType)) {
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
            setResults(data);
            setIsAnalyzing(false);
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
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Get required fields based on test type
    const getRequiredFields = () => {
        switch (testType) {
            case 'ttest_onesample':
                return { col2: false, col3: false, refValue: true, heatmapSize: false };
            case 'ancova':
                return { col2: true, col3: true, refValue: false, heatmapSize: false };
            case 'cross_tabulation':    
            case 'spearman':
            case 'pearson':
                return { col2: false, col3: false, col4: false, refValue: false, heatmapSize: true };
            case 'shapiro':
            case 'kolmogorov':
            case 'anderson':
            case 'chi_square':
            case 'cramers_heatmap':

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
            case 'network_graph':
                return { col1: false, col2: false, col3: false, refValue: false, heatmapSize: false }; 
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

        if(isPreprocessed){
            filetype = 'preprocessed';
        } else if(isSurveyData){
            filetype = 'survey';
        }
        console.log(fileName)
            fetch('http://127.0.0.1:8000/api/preview-data/', {
                method: 'GET',
                headers: {
                    'userID': userId,
                   
                    'filename': fileName,

                },
                
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                console.log("Preview data loaded successfully:", result);
                setColumns(result.columns);
                setData(result.rows);
                setAvailableColumns(result.columns);
            })
            .catch(error => {
                console.error("Failed to load preview data:", error.message);
                // Optionally show user feedback here
            });
        }; 
    

const handleSuggestionClick = () => {

 
  setIsSuggestionModalOpen(true);
    console.log("Suggestion button clicked");

  // Optional: scroll to the suggestion panel or show modal
};


    return (
        <div className="bg-gray-100 font-sans min-h-screen">
            <div className="container mx-auto py-8 px-4">
                <NavbarAcholder language={language} setLanguage={setLanguage} />


                <div className="container mx-auto py-8 px-4 relative">
                    <header className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-blue-600 mb-3">{t.title}</h1>
                    </header>

                    <div className="flex flex-col items-center">
                        <div className="w-full max-w-4xl">
                            {errorMessage && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                                    <div className="flex">
                                        <div className="py-1">
                                            <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>{errorMessage}</div>
                                    </div>
                                </div>
                            )}
                    {!results ? (
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                                    <div className="bg-gray-700 text-white p-4 font-semibold">
                                        <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span className="text-black">{t.formTitle}</span>
                                        <div style={{ position: 'absolute', left: '57rem'}}>
                                        <button
                                            onClick={() => navigate('/report')}
                                            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                                        >
                                            {language === 'বাংলা' ? 'রিপোর্ট দেখুন' : 'Show Report'}
                                        </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end px-4 pt-4">
                                        <button
                                            onClick={resetForm}
                                            className="bg-green-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-200"
                                        >
                                            Reset File
                                        </button>
                                        </div>

                                     <div className="p-6">
                                        <form onSubmit={handleSubmit}>

                                            
                                            <div className="mb-6">
                                                <h5 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                                                    {(isPreprocessed || isSurveyData) ? t.preprocessedLabel : t.uploadLabel}
                                                </h5>

                                                {(isPreprocessed || isSurveyData) ? (
                                                    <div className="bg-green-100 text-green-700 p-4 rounded text-center shadow">
                                                    {(isPreprocessed ? "Preprocessed file" : "Survey file")}{" "}
                                                    <strong>{fileName}</strong> loaded automatically.
                                                    </div>
                                                ) : (
                                                    <div
                                                    ref={uploadContainerRef}
                                                    className={`bg-gray-200 rounded-lg p-6 text-center border-2 border-dashed ${
                                                        uploadStatus === "loading"
                                                        ? "border-blue-400"
                                                        : uploadStatus === "success"
                                                        ? "border-green-400"
                                                        : "border-gray-400"
                                                    } transition-all duration-300 cursor-pointer hover:bg-gray-300`}
                                                    onClick={() => fileInputRef.current.click()}
                                                    >
                                                    <svg
                                                        className={`mx-auto h-12 w-12 mb-3 ${
                                                        uploadStatus === "success" ? "text-green-500" : "text-gray-600"
                                                        }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        {uploadStatus === "success" ? (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                        ) : (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                        />
                                                        )}
                                                    </svg>
                                                    <p id="fileName" className="mb-2">
                                                        {file ? fileName : t.dropFile}
                                                    </p>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        className="hidden"
                                                        accept=".xls,.xlsx"
                                                        onClick={(e) => (e.target.value = null)}
                                                        onChange={handleFileChange}
                                                    />
                                                    </div>
                                                )}

                                                {uploadStatus === "loading" && (
                                                    <div className="text-center mt-4 text-blue-600">
                                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                                    {t.processing}
                                                    </div>
                                                )}

                                                </div>
                                                {/* Preview & Suggestion Buttons */}
                                                    <div className="flex justify-end gap-4 mt-6">

{/* 
                                                    <button
                                                        type="button"
                                                        className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                                                        onClick={handleSuggestionClick}
                                                    >
                                                        {language === 'bn' ? 'পরীক্ষার পরামর্শ' : 'Test Suggestion'}
                                                    </button> */}
                                                    </div>
                                            {isPreviewModalOpen && (
                                                <>
                                                  <PreviewTable columns={columns} initialData={data} data={data} setData={setData} setIsPreviewModalOpen={setIsPreviewModalOpen} isPreviewModalOpen={isPreviewModalOpen} />
                                                 </>

                                                                                        )}
                                            {/* {isSuggestionModalOpen && (
                                                <div >
                                                    <TestSuggestionsModal setIsSuggestionModalOpen={setIsSuggestionModalOpen} language={language} />
                                                </div>
                                            )} */}

                                                <div className="flex justify-end gap-4 mt-4 mb-4">
                                            <button
                                                        type="button"
                                                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                                                        onClick={handlePreviewClick}
                                                    >
                                                        {language === 'bn' ? 'ডেটা প্রিভিউ' : 'Preview Data'}
                                                    </button>
                                                <button
                                                    type="button"
                                                    className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                                                    onClick={() => {
                                                    console.log("User ID:", userId);
                                                    const path = "/preprocess";
                                                    navigate(path, { state: { userId: userId , filename: fileName} });
                                                    }}
                                                >
                                                    {language === 'bn' ? 'ডেটা প্রিপ্রসেস করুন' : 'Preprocess Data'}
                                                </button>
                                                </div>


                                        <div className="flex justify-end gap-4 mb-6">
                                        {/* <button
                                            type="button"
                                           onClick={() => {
                                                    console.log("analyze by test");
                                                    setTestanalyze(!testanalyze);
                                                    }}

                                            className="bg-blue-600 text-black px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            {language === 'bn' ? 'পরীক্ষা পছন্দ অনুযায়ী বিশ্লেষণ' : 'Analyze by Test Choice'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                    console.log("analyze by column");
                                                    setColumnanalyze(!columnanalyze);
                                                    }} 
                                            className="bg-green-600 text-black px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                        >
                                            {language === 'bn' ? 'কলাম অনুযায়ী বিশ্লেষণ' : 'Analyze by Column'}
                                        </button> */}
                                        </div>


                                        {/* {testanalyze && ( */}
                                            {/* <> */}
                                            <div className="mb-6">
                                                <h5 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">{t.selectTest}</h5>
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 font-medium mb-2">
                                                        <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        {t.testType}
                                                    </label>
                                                    <select
                                                        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        value={testType}
                                                        onChange={(e) => setTestType(e.target.value)}
                                                    >
                                                        <option value="" disabled>{t.selectPrompt}</option>
                                                           <optgroup label={t.testGroups.eda}>
                                                            <option value="eda_basics">{t.tests.eda_basics}</option>
                                                            <option value="eda_distribution">{t.tests.eda_distribution}</option>
                                                            <option value="eda_swarm">{t.tests.eda_swarm}</option>
                                                            <option value="eda_pie">{t.tests.eda_pie}</option>
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

                                                    <div className="text-sm text-gray-600 mt-2">{t.selectPrompt}</div>

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

                                                </div>
                                            </div>
                                
                                            {(testType === 'pearson' || testType === 'spearman' || testType === 'cross_tabulation') && (
                                                <div className="mb-6">
                                                    <label className="block text-gray-700 font-medium mb-2">
                                                        {testType === 'cross_tabulation' ? 'Pick number of Columns' : 'Heatmap Size'}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
                                                        value={heatmapSize}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setHeatmapSize(val);
                                                            setSelectedColumns([]); // Reset columns on size change
                                                            if (val === '' || /^\d+$/.test(val)) {
                                                                setErrorMessage('');
                                                            } else {
                                                                setErrorMessage('Please enter a valid integer for Heatmap Size');
                                                            }
                                                        }}
                                                        placeholder="Enter number of columns (e.g., 5)"
                                                    />

                                                    {/* Column(s) Big Box Display */}
                                                    <label className="block text-gray-700 font-medium mb-2">Column(s)</label>
                                                    <div className="border border-gray-300 rounded-lg p-3 bg-white min-h-[48px]">
                                                        {selectedColumns.length > 0 ? (
                                                            <p className="text-gray-800">{selectedColumns.join(', ')}</p>
                                                        ) : (
                                                            <p className="text-gray-400">No columns selected yet</p>
                                                        )}
                                                    </div>

                                                    {/* Dropdown Below Box */}
                                                    <select
                                                        className="border border-gray-300 rounded-lg p-3 mt-2 w-full"
                                                        onChange={(e) => {
                                                            const selected = e.target.value;
                                                            if (
                                                                selected &&
                                                                !selectedColumns.includes(selected) &&
                                                                selectedColumns.length < parseInt(heatmapSize || 0)
                                                            ) {
                                                                setSelectedColumns(prev => [...prev, selected]);
                                                            }
                                                            e.target.selectedIndex = 0;
                                                        }}
                                                        disabled={selectedColumns.length >= parseInt(heatmapSize || 0)}
                                                    >
                                                        <option value="">Select column...</option>
                                                        {columns
                                                            .filter(col => !selectedColumns.includes(col))
                                                            .map((col, idx) => (
                                                                <option key={idx} value={col}>{col}</option>
                                                            ))}
                                                    </select>

                                                    <p className="text-sm text-gray-500 mt-2">
                                                        {selectedColumns.length} of {heatmapSize || 0} column(s) selected
                                                    </p>
                                                </div>
                                            )}
                                        


                                        {testType !== 'eda_basics' && (
                                            <div className="mb-6">
                                                {/* Only show the heading if the testType is NOT one of the ones you want to skip */}
                                                {!['spearman', 'pearson', 'cross_tabulation', 'network_graph'].includes(testType) && (
                                                    <h5 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                                                        {t.selectVariables}
                                                    </h5>
                                                )}

                                                {/* Now the rest of the logic stays the same — dropdowns, requiredFields, etc. */}
                                                {!['spearman', 'pearson', 'cross_tabulation', 'network_graph'].includes(testType) && (
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 font-medium mb-2">
                                                            <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                                            </svg>
                                                            {(testType === 'kolmogorov' || testType === 'anderson' || testType === 'shapiro' || testType ===  'eda_distribution')
                                                                ? (language === 'bn' ? 'একটি সংখ্যাগত কলাম নির্বাচন করুন' : 'Pick a Numerical Column')
                                                                : t.column1}
                                                        </label>
                                                        <select
                                                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                            value={column1}
                                                            onChange={(e) => setColumn1(e.target.value)}
                                                            disabled={columns.length === 0}
                                                        >
                                                            {columns.length === 0 ? (
                                                                <option value="">-- Upload a file first --</option>
                                                            ) : (
                                                                columns.map((col, idx) => (
                                                                    <option key={idx} value={col}>{col}</option>
                                                                ))
                                                            )}
                                                        </select>
                                                    </div>
                                                )}
                                            
                                                                                
                                                {requiredFields.col2 && (
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 font-medium mb-2">
                                                            <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                                            </svg>
                                                            {t.column2}
                                                        </label>
                                                        <select
                                                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                            value={column2}
                                                            onChange={(e) => setColumn2(e.target.value)}
                                                            disabled={columns.length === 0}
                                                        >
                                                            <option value="">-- Select a column --</option>
                                                            {columns.map((col, idx) => (
                                                                <option key={idx} value={col}>{col}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {requiredFields.col3 && (
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 font-medium mb-2">
                                                            <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                                            </svg>
                                                            {t.column3}
                                                        </label>
                                                        <select
                                                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                            value={column3}
                                                            onChange={(e) => setColumn3(e.target.value)}
                                                            disabled={columns.length === 0}
                                                        >
                                                            <option value="">-- Select a column --</option>
                                                            {columns.map((col, idx) => (
                                                                <option key={idx} value={col}>{col}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {requiredFields.col4 && (
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 font-medium mb-2">
                                                            <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                                            </svg>
                                                            {t.column4}
                                                        </label>
                                                        <select
                                                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                            value={column4}
                                                            onChange={(e) => setColumn4(e.target.value)}
                                                            disabled={columns.length === 0}
                                                        >
                                                            <option value="">-- Select a column --</option>
                                                            {columns.map((col, idx) => (
                                                                <option key={idx} value={col}>{col}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                


                                                {testType === 'kruskal' && (
                                                    <KruskalOptions
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

                                                {testType === 'mannwhitney' && (
                                                    <MannWhitneyOptions
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

                                                {testType === 'wilcoxon' && (
                                                    <WilcoxonOptions
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

                                                {testType === 'anova' && (
                                                    <AnovaOptions
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
                                                        boxColor={boxColor}
                                                        setBoxColor={setBoxColor}
                                                        medianColor={medianColor}
                                                        setMedianColor={setMedianColor}
                                                        t={t}
                                                    />
                                                )}

                                                {testType === 'ancova' && (
                                                    <AncovaOptions
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
                                                        dotColor={dotColor}
                                                        setDotColor={setDotColor}
                                                        lineColor={lineColor}
                                                        setLineColor={setLineColor}
                                                        lineStyle={lineStyle}
                                                        setLineStyle={setLineStyle}
                                                        dotWidth={dotWidth}
                                                        setDotWidth={setDotWidth}
                                                        lineWidth={lineWidth}
                                                        setLineWidth={setLineWidth}
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
                                                    <EDAPieChartOptions
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

                                                {testType === 'chi_square' && (
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
                                                )}
                                                
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
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 font-medium mb-2">
                                                            <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                                            </svg>
                                                            {t.column5}
                                                        </label>
                                                        <select
                                                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                            value={column5}
                                                            onChange={(e) => setColumn5(e.target.value)}
                                                            disabled={columns.length === 0}
                                                        >
                                                            <option value="">-- Select a column --</option>
                                                            {columns.map((col, idx) => (
                                                                <option key={idx} value={col}>{col}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                         

                                            {requiredFields.refValue && (
                                                <div className="mb-6">
                                                    <label className="block text-gray-700 font-medium mb-2">
                                                        <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                        {t.referenceValue}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        value={referenceValue}
                                                        onChange={(e) => setReferenceValue(parseFloat(e.target.value))}
                                                        step="0.01"
                                                    />
                                                </div>
                                            )}
                                                                                  
                                            <div className="text-center mt-6">
                                                <button
                                                    type="submit"
                                                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={isAnalyzing || !file || !column1 || (requiredFields.col2 && !column2) || (requiredFields.col3 && !column3)}
                                                >
                                                    {isAnalyzing ? (
                                                        <>
                                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            {t.analyzing}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                            </svg>
                                                            {t.analyzeButton}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                             {/* </>
                                        )} */}
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
                                                    <pre className="modal-body text-left whitespace-pre-line leading-relaxed font-sans text-sm md:text-base">
                                                        {statTestDetails[language]?.[testType] || (
                                                            language === 'bn' ? 'এই পরীক্ষার বিস্তারিত পাওয়া যায়নি।' : 'No details available.'
                                                        )}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                        
                                                                                
                                    </div>
                                </div>
                    ):(
                     <AnalysisResults user_id={userId} results={results} testType={testType} columns={[column1, column2, column3]} language={language}
                                    t={t} filename={fileName}  />
                            )}
                            
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Component for rendering analysis results
const AnalysisResults = ({ user_id,results, testType, columns, language = 'English', t, filename }) => {

    // For rendering different results based on test type
    const renderResults = () => {
        if (testType === 'kruskal') {
            return renderKruskalResults();
        } else if (testType === 'wilcoxon') {
        return renderWilcoxonResults();
        }  else if (testType === 'mannwhitney') {
        return renderMannWhitneyResults();
        }  else if (testType === 'shapiro') {
        return renderShapiroResults();
        }  else if (testType === 'spearman') {
        return renderSpearmanResults();
        }  else if (testType === 'pearson') {
        return renderPearsonResults();
        }else if (testType === 'linear_regression') {
        return renderLinearRegressionResults();
        } else if (testType === 'anova') {
        return renderAnovaResults();
        } else if (testType === 'ancova') {
        return renderAncovaResults();
        } else if (testType === 'kolmogorov') {
        return renderKolmogorovResults();
        } else if (testType === 'anderson') {
        return renderAndersonDarlingResults();
        }else if (testType === 'fzt') {
        return renderFZTResults();
        } else if (testType === 'cross_tabulation') {
        return renderCrossTabulationResults();
        } else if (testType === 'eda_distribution') {
        return renderEDADistributionResults();
        } else if (testType === 'eda_swarm') {
        return renderEDASwarmResults();
        } else if (testType === 'eda_pie') {
        return renderEDAPieResults();
        } else if (testType === 'eda_basics') {
        return renderEDABasicsResults();
        } else if (testType === 'similarity') {
        return renderSimilarityResults();
        }else if (testType === 'chi_square') {
        return renderChiSquareResults();
        } else if (testType === 'cramers_heatmap') {
        return renderCramerVResults();
        }else if (testType === 'network_graph') {
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

    // Special renderer for Kruskal-Wallis results with language support
    const renderKruskalResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== 'বাংলা') return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === 'বাংলা' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }
        const handleSaveResult = async () => {
            console.log('Saving result...');
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
        }

        return (
            <>
                    <div className="relative mb-4">
                        <h2 className="text-2xl font-bold">{t.kruskalTitle}</h2>
                        <button
                            onClick={handleSaveResult}
                            className="absolute top-0 right-0 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md shadow-md transition duration-200"
                        >
                            {language === 'বাংলা' ? 'ফলাফল সংরক্ষণ করুন' : 'Save Result'}
                        </button>
                    </div>



                {columns && columns[0] && (
                    <p className="mb-3">
                        <strong>{language === 'বাংলা' ? 'বিশ্লেষিত কলাম:' : 'Columns analyzed:'}</strong> {columns[0]}
                        {columns[1] && ` ${language === 'বাংলা' ? 'এবং' : 'and'} ${columns[1]}`}
                    </p>
                )}

                {results?.statistic !== undefined && (
                    <p className="mb-2">
                        <strong>{t.testStatistic}:</strong> {mapDigitIfBengali(results.statistic.toFixed(4))}
                    </p>
                )}

                {results?.p_value !== undefined && (
                    <p className="mb-2">
                        <strong>{t.pValue}:</strong> {mapDigitIfBengali(results.p_value.toFixed(6))}
                    </p>
                )}

                {results?.p_value !== undefined && (
                    <p className="mb-4">
                        <strong>{language === 'বাংলা' ? 'সিদ্ধান্ত:' : 'Conclusion'}:</strong>
                        {results.p_value < 0.05 ? (
                            <span className="text-green-600 font-medium ml-2">{t.significant}</span>
                        ) : (
                            <span className="text-red-600 font-medium ml-2">{t.notSignificant}</span>
                        )}
                    </p>
                )}

                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'বাংলা' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualizations'}
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {results.image_paths.map((path, index) => {
                                const handleDownload = async () => {
                                    try {
                                        const response = await fetch(`http://127.0.0.1:8000${path}`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        
                                        // Extract filename from path or create a default name
                                        const filename = path.split('/').pop() || `${t.kruskalTitle}_visualization_${index + 1}.png`;
                                        link.download = filename;
                                        
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error('Download failed:', error);
                                        alert(language === 'বাংলা' ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download failed');
                                    }
                                };

                                return (
                                    <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                        <div className="relative">
                                            <img
                                                src={`http://127.0.0.1:8000${path}`}
                                                alt={`${t.kruskalTitle} visualization ${index + 1}`}
                                                className="w-full h-auto object-contain"
                                            />
                                            <button
                                                onClick={handleDownload}
                                                className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 transform hover:scale-105 flex items-center text-sm"
                                                title={language === 'বাংলা' ? `ছবি ${index + 1} ডাউনলোড করুন` : `Download Image ${index + 1}`}
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
                                );
                            })}
                        </div>
                    </div>
                )}
            </>
        );
    };


    const renderWilcoxonResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== 'বাংলা') return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === 'বাংলা' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">
                    {t.tests.wilcoxon || 'Wilcoxon Signed Rank Test'}
                </h2>

                {columns?.length > 0 && (
                    <p className="mb-3">
                        <strong>{language === 'বাংলা' ? 'বিশ্লেষণকৃত কলাম:' : 'Columns analyzed:'}</strong>{' '}
                        {columns.filter(Boolean).join(language === 'bn' ? ' এবং ' : ' and ')}
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
                                            src={`http://127.0.0.1:8000${path}`}
                                            alt={`Wilcoxon visualization ${index + 1}`}
                                            className="w-full h-auto object-contain"
                                        />
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(`http://127.0.0.1:8000${path}`);
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    const filename = path.split('/').pop() || `wilcoxon_visual_${index + 1}.png`;
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



    const renderMannWhitneyResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== 'বাংলা') return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === 'বাংলা' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">{t.tests.mannwhitney}</h2>

                {columns && columns[0] && (
                    <p className="mb-3">
                        <strong>{language === 'বাংলা' ? 'বিশ্লেষণকৃত কলাম:' : 'Columns analyzed:'}</strong> {columns[0]}
                        {columns[1] && ` ${language === 'বাংলা' ? 'এবং' : 'and'} ${columns[1]}`}
                    </p>
                )}

                {results?.statistic !== undefined && (
                    <p className="mb-2">
                        <strong>{t.testStatistic}:</strong> {mapDigitIfBengali(results.statistic.toFixed(4))}
                    </p>
                )}

                {results?.p_value !== undefined && (
                    <p className="mb-2">
                        <strong>{t.pValue}:</strong> {mapDigitIfBengali(results.p_value.toFixed(6))}
                    </p>
                )}

                {results?.p_value !== undefined && (
                    <p className="mb-4">
                        <strong>{language === 'বাংলা' ? 'সিদ্ধান্ত' : 'Conclusion'}:</strong>
                        {results.p_value < 0.05 ? (
                            <span className="text-green-600 font-medium ml-2">{t.significant}</span>
                        ) : (
                            <span className="text-red-600 font-medium ml-2">{t.notSignificant}</span>
                        )}
                    </p>
                )}

                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'বাংলা' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualizations'}
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {results.image_paths.map((path, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                    <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                        <div className="relative">
                                            <img
                                                src={`http://127.0.0.1:8000${path}`}
                                                alt={`${t.tests.mannwhitney} visualization ${index + 1}`}
                                                className="w-full h-auto object-contain"
                                            />
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch(`http://127.0.0.1:8000${path}`);
                                                        const blob = await response.blob();
                                                        const url = window.URL.createObjectURL(blob);
                                                        const link = document.createElement('a');
                                                        const filename = path.split('/').pop() || `${t.tests.mannwhitney}_visualization_${index + 1}.png`;
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
                                                title={language === 'বাংলা' ? `ছবি ${index + 1} ডাউনলোড করুন` : `Download Image ${index + 1}`}
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
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
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
                                    src={`http://127.0.0.1:8000${results.image_path}`}
                                    alt="Shapiro-Wilk visualization"
                                    className="w-full h-auto object-contain"
                                />
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(`http://127.0.0.1:8000${results.image_path}`);
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
                                            src={`http://127.0.0.1:8000${path}`}
                                            alt={`Spearman visualization ${index + 1}`}
                                            className="w-full h-auto object-contain"
                                        />
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(`http://127.0.0.1:8000${path}`);
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
                                            src={`http://127.0.0.1:8000${path}`}
                                            alt={`Pearson visualization ${index + 1}`}
                                            className="w-full h-auto object-contain"
                                        />
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(`http://127.0.0.1:8000${path}`);
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
                                src={`http://127.0.0.1:8000${results.image_paths[0]}`}
                                alt="Linear Regression Plot"
                                className="w-full h-auto object-contain"
                            />
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`http://127.0.1:8000${results.image_paths[0]}`);
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

    const renderAnovaResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== 'bn') return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === 'bn' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">{t.anovaTitle}</h2>

                {columns && columns[0] && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষিত কলাম:' : 'Columns analyzed:'}</strong> {columns[0]}
                        {columns[1] && ` ${language === 'bn' ? 'এবং' : 'and'} ${columns[1]}`}
                    </p>
                )}

                {results?.anova_table && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">{language === 'bn' ? 'ANOVA টেবিল' : 'ANOVA Table'}</h3>
                            <div
                            className="overflow-x-auto"
                            dangerouslySetInnerHTML={{ __html: results.anova_table }}
                            />

                    </div>
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
                                        src={`http://127.0.1:8000${path}`}
                                        alt={`${t.anovaTitle} visualization ${index + 1}`}
                                        className="w-full h-auto object-contain"
                                    />
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`http://127.0.1:8000${path}`);
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                const filename = path.split('/').pop() || `${t.anovaTitle}_visualization_${index + 1}.png`;
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


    const renderAncovaResults = () => {
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
                    {t.tests.ancova || "ANCOVA Test"}
                </h2>

                {columns?.length > 0 && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষণকৃত কলাম:' : 'Columns analyzed:'}</strong>{' '}
                        {columns.filter(Boolean).join(language === 'bn' ? ' এবং ' : ' and ')}
                    </p>
                )}

                {results.table_html && (
                    <div
                        className="bg-white rounded-lg shadow-md p-4 my-4 overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: results.table_html }}
                    />
                )}

                {results.image_paths?.[0] && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'bn' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualization'}
                        </h3>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <img
                                src={`http://127.0.1:8000${results.image_paths[0]}`}
                                alt="ANCOVA Plot"
                                className="w-full h-auto object-contain"
                            />
                            <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`http://127.0.1:8000${results.image_paths[0]}`);
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
                                src={`http://127.0.1:8000${results.image_paths[0]}`}
                                alt="K–S Plot"
                                className="w-full h-auto object-contain"
                            />
                            <button 
                             onClick={async () => {
                                            try {
                                                const response = await fetch(`http://127.0.1:8000${results.image_paths[0]}`);
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
                                src={`http://127.0.1:8000${results.image_paths[0]}`}
                                alt="Anderson–Darling Plot"
                                className="w-full h-auto object-contain"
                            />
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`http://127.0.1:8000${results.image_paths[0]}`);
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

    


////

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
                                        src={`http://127.0.1:8000${path}`}
                                        alt={`FZT visualization ${index + 1}`}
                                        className="w-full h-auto object-contain"
                                    />
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`http://127.0.1:8000${path}`);
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
                                src={`http://127.0.0.1:8000${results.heatmap_path}`}
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
                                src={`http://127.0.0.1:8000${results.barplot_path}`}
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
            return <p>{language === 'bn' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">
                    {language === 'bn'
                        ? 'ডিস্ট্রিবিউশন প্লট – হিস্টোগ্রাম + KDE'
                        : 'Distribution Plot – Histogram + KDE'}
                </h2>

                {columns && columns[0] && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষিত কলাম:' : 'Analyzed column:'}</strong>{' '}
                        {columns[0]}
                    </p>
                )}

                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'bn' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualizations'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.image_paths.map((path, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                    <img
                                        src={`http://127.0.1:8000${path}`}
                                        alt={`EDA Distribution plot ${index + 1}`}
                                        className="w-full h-auto object-contain"
                                    />
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`http://127.0.1:8000${path}`);
                                                if (!response.ok) throw new Error('Network response was not ok');
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                const filename = path.split('/').pop() || `eda_distribution_plot_${index + 1}.png`;
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
                                        src={`http://127.0.1:8000${path}`}
                                        alt={`Swarm Plot ${index + 1}`}
                                        className="w-full h-auto object-contain"
                                    />
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`http://127.0.1:8000${path}`);
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


    const renderEDAPieResults = () => {
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
                    {language === 'bn' ? 'পাই চার্ট ফলাফল' : 'Pie Chart Results'}
                </h2>

                {/* Selected column info */}
                {results.columns && results.columns.length > 0 && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষিত কলাম:' : 'Analyzed Column:'}</strong>{" "}
                        {results.columns.map((col, i) => (
                            <span key={i}>
                                {col}
                                {i < results.columns.length - 1 ? (language === 'bn' ? ' এবং ' : ' and ') : ''}
                            </span>
                        ))}
                    </p>
                )}

                {/* Image output */}
                {results.image_paths && results.image_paths.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">
                            {language === 'bn' ? 'ভিজ্যুয়ালাইজেশন' : 'Visualization'}
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                                {results.image_paths.map((path, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                        <img
                                            src={`http://127.0.1:8000${path}`}
                                            alt={`Pie Chart ${index + 1}`}
                                            className="w-full h-auto object-contain"
                                        />
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(`http://127.0.1:8000${path}`);
                                                    if (!response.ok) throw new Error('Network response was not ok');
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    const filename = path.split('/').pop() || `pie_chart_${index + 1}.png`;
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

    const renderEDABasicsResults = () => {
        const mapDigitIfBengali = (text) => {
            if (language !== 'bn') return text;
            return text.toString().split('').map(char => digitMapBn[char] || char).join('');
        };

        if (!results) {
            return <p>{language === 'bn' ? 'ফলাফল লোড হচ্ছে...' : 'Loading results...'}</p>;
        }

        const renderSimpleTable = (title, data) => (
            <div className="mb-6">
                <h4 className="text-xl font-semibold mb-2">{title}</h4>
                <table className="min-w-full table-auto border border-collapse border-gray-300 text-sm">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1 bg-gray-100">{language === 'bn' ? 'কলাম' : 'Column'}</th>
                            <th className="border px-2 py-1 bg-gray-100">{language === 'bn' ? 'মান (%)' : 'Value (%)'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(data).map(([key, value], i) => (
                            <tr key={i}>
                                <td className="border px-2 py-1">{key}</td>
                                <td className="border px-2 py-1">{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        const renderWideTable = (title, statKeys) => {
            const columns = Object.keys(results[statKeys[0]] || {});
            if (columns.length === 0) return null;

            return (
                <div className="mb-6 overflow-x-auto">
                    <h4 className="text-xl font-semibold mb-2">{title}</h4>
                    <table className="min-w-full table-auto border border-collapse border-gray-300 text-sm">
                        <thead>
                            <tr>
                                <th className="border px-2 py-1 bg-gray-100">
                                    {language === 'bn' ? 'কলাম' : 'Column'}
                                </th>
                                {statKeys.map((statKey, idx) => (
                                    <th key={idx} className="border px-2 py-1 bg-gray-100">
                                        {renderTitle(statKey)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {columns.map((col, i) => (
                                <tr key={i}>
                                    <td className="border px-2 py-1">{col}</td>
                                    {statKeys.map((statKey, idx) => (
                                        <td key={idx} className="border px-2 py-1">
                                            {results[statKey]?.[col] || "-"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        };

        const renderTitle = (key) => {
            const titles = {
                count: language === 'bn' ? 'গণনা' : 'Count',
                min: language === 'bn' ? 'সর্বনিম্ন' : 'Min',
                max: language === 'bn' ? 'সর্বোচ্চ' : 'Max',
                range: language === 'bn' ? 'পরিসর' : 'Range',
                iqr: language === 'bn' ? 'IQR' : 'IQR',
                outliers: language === 'bn' ? 'আউটলাইয়ার সংখ্যা' : 'Outliers',
                mean: language === 'bn' ? 'গড়' : 'Mean',
                median: language === 'bn' ? 'মিডিয়ান' : 'Median',
                mode: language === 'bn' ? 'মোড' : 'Mode',
                variance: language === 'bn' ? 'চর বৈচিত্র্য' : 'Variance',
                std: language === 'bn' ? 'স্ট্যান্ডার্ড ডেভিয়েশন' : 'Std Dev',
                mad: language === 'bn' ? 'ম্যাড' : 'MAD',
                skew: language === 'bn' ? 'স্কিউনেস' : 'Skewness',
                kurt: language === 'bn' ? 'কার্টোসিস' : 'Kurtosis',
                cv: language === 'bn' ? 'CV' : 'Coeff. of Variation',
            };
            return titles[key] || key;
        };

        return (
            <>
                <h2 className="text-2xl font-bold mb-4">
                    {language === 'bn' ? 'মৌলিক EDA বিশ্লেষণ' : 'Basic EDA Summary'}
                </h2>

                {/* Dataset Info */}
                {results.info && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">{language === 'bn' ? 'ডেটাসেট তথ্য' : 'Dataset Info'}</h3>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>{language === 'bn' ? `মোট সারি: ${mapDigitIfBengali(results.info.rows)}` : `Total Rows: ${results.info.rows}`}</li>
                            <li>{language === 'bn' ? `মোট কলাম: ${mapDigitIfBengali(results.info.columns)}` : `Total Columns: ${results.info.columns}`}</li>
                            <li>{language === 'bn' ? `পুনরাবৃত্ত সারি: ${mapDigitIfBengali(results.info.duplicates)}` : `Duplicate Rows: ${results.info.duplicates}`}</li>
                            <li>{language === 'bn' ? `মেমোরি ব্যবহার: ${mapDigitIfBengali(results.info.memory)} কিলোবাইট` : `Memory Usage: ${results.info.memory} KB`}</li>
                        </ul>
                    </div>
                )}

                {/* Table 1 */}
                {renderWideTable(language === 'bn' ? 'টেবিল ১: পরিসংখ্যান এবং বিস্তার' : 'Table 1: Count, Min, Max, Range, IQR, Outliers', [
                    'count', 'min', 'max', 'range', 'iqr', 'outliers'
                ])}

                {/* Table 2 */}
                {renderWideTable(language === 'bn' ? 'টেবিল ২: কেন্দ্রীয় প্রবণতা এবং বিক্ষিপ্ততা' : 'Table 2: Central Tendency & Dispersion', [
                    'mean', 'median', 'mode', 'variance', 'std'
                ])}

                {/* Table 3 */}
                {renderWideTable(language === 'bn' ? 'টেবিল ৩: ম্যাড, স্কিউনেস, কার্টোসিস, সিভি' : 'Table 3: MAD, Skewness, Kurtosis, CV', [
                    'mad', 'skew', 'kurt', 'cv'
                ])}

            </>
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

    const renderChiSquareResults = () => {
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
                    {language === 'bn' ? 'কাই-স্কয়ার টেস্টের ফলাফল' : 'Chi-Square Test Results'}
                </h2>

                {columns && columns.length >= 2 && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষিত কলাম:' : 'Columns analyzed:'}</strong> 
                        {columns[0]} {language === 'bn' ? 'এবং' : 'and'} {columns[1]}
                    </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white shadow p-4 rounded border">
                        <h4 className="text-lg font-semibold mb-2">{language === 'bn' ? 'Chi² পরিসংখ্যান' : 'Chi² Statistic'}</h4>
                        <p>{mapDigitIfBengali(results.statistic?.chi2 || '-')}</p>
                    </div>
                    <div className="bg-white shadow p-4 rounded border">
                        <h4 className="text-lg font-semibold mb-2">{language === 'bn' ? 'P-মান' : 'P-value'}</h4>
                        <p>{mapDigitIfBengali(results.statistic?.p_value || '-')}</p>
                    </div>
                    <div className="bg-white shadow p-4 rounded border">
                        <h4 className="text-lg font-semibold mb-2">{language === 'bn' ? 'স্বাধীনতার মাত্রা (df)' : 'Degrees of Freedom'}</h4>
                        <p>{mapDigitIfBengali(results.statistic?.dof || '-')}</p>
                    </div>
                </div>

                {results.interpretation && (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-900 p-4 mb-6 rounded">
                        <p className="font-medium">
                            {language === 'bn' ? 'ব্যাখ্যা:' : 'Interpretation:'}
                        </p>
                        <p>{results.interpretation}</p>
                    </div>
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
                                        const response = await fetch(`http://127.0.0.1:8000${path}`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        const filename = path.split('/').pop() || `chi_square_plot_${index + 1}.png`;
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
                                            src={`http://127.0.0.1:8000${path}`}
                                            alt={`chi-square-plot-${index + 1}`}
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

                {columns && columns.length >= 2 && (
                    <p className="mb-3">
                        <strong>{language === 'bn' ? 'বিশ্লেষিত কলাম:' : 'Columns analyzed:'}</strong>{" "}
                        {columns[0]} {language === 'bn' ? 'এবং' : 'and'} {columns[1]}
                    </p>
                )}

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
                                        const response = await fetch(`http://127.0.0.1:8000${path}`);
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
                                            src={`http://127.0.0.1:8000${path}`}
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
                                src={`http://127.0.0.1:8000${results.image_path}`}
                                alt={language === 'bn' ? 'নেটওয়ার্ক গ্রাফ' : 'Network Graph'}
                                className="w-full h-auto object-contain"
                            />
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`http://127.0.0.1:8000${results.image_path}`);
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="bg-gray-700 text-white p-4 font-semibold">
                <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {language === 'bn' ? 'পরিসংখ্যানগত বিশ্লেষণ ফলাফল' : 'Statistical Analysis Results'}
            </div>
            <div className="p-6">
                <div className="analysis-container">
                    {renderResults()}
                </div>

                <div className="text-center mt-8">
                    <button
                        onClick={() => {
                            if (!results || !columns || !testType) {
                                alert(language === 'বাংলা'
                                    ? 'রিপোর্ট যুক্ত করার জন্য সম্পূর্ণ বিশ্লেষণ প্রয়োজন'
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
                        className="bg-indigo-600 hover:bg-indigo-700 text-black font-medium py-2 px-4 rounded-lg shadow transition duration-200 transform hover:-translate-y-1 ml-4"
                    >
                        {language === 'বাংলা' ? 'রিপোর্টে যুক্ত করুন' : 'Add to Report'}
                    </button>

                </div>
                <div className="text-center mt-8">
                    <button
                        onClick={() => {
                            //reload analysis
                            window.location.reload();
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-black font-medium py-3 px-6 rounded-lg shadow transition duration-200 transform hover:-translate-y-1"
                    >
                        {language === 'bn' ? 'আরেকটি বিশ্লেষণ করুন' : 'Perform Another Analysis'}
                    </button>
                </div>
            </div>
        </div>
    );







// Other visualization components
const CorrelationHeatmap = ({ data }) => {
    // Extracting unique variables
    const variables = [...new Set(data.flatMap(item => [item.Variable_1, item.Variable_2]))];

    // Creating correlation matrix
    const matrix = [];
    for (let i = 0; i < variables.length; i++) {
        const row = [];
        for (let j = 0; j < variables.length; j++) {
            if (i === j) {
                row.push(1); // Diagonal is always 1
            } else {
                const correlation = data.find(
                    item => (item.Variable_1 === variables[i] && item.Variable_2 === variables[j]) ||
                        (item.Variable_1 === variables[j] && item.Variable_2 === variables[i])
                );
                row.push(correlation ? correlation.Correlation : 0);
            }
        }
        matrix.push(row);
    }

    // Creating color scale
    const getColor = (value) => {
        if (value >= 0.7) return 'bg-red-700 text-white';
        if (value >= 0.5) return 'bg-red-500 text-white';
        if (value >= 0.3) return 'bg-red-300 text-gray-800';
        if (value >= 0.1) return 'bg-red-100 text-gray-800';
        if (value >= -0.1) return 'bg-gray-100 text-gray-800';
        if (value >= -0.3) return 'bg-blue-100 text-gray-800';
        if (value >= -0.5) return 'bg-blue-300 text-gray-800';
        if (value >= -0.7) return 'bg-blue-500 text-white';
        return 'bg-blue-700 text-white';
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden border-collapse">
                <thead>
                    <tr>
                        <th className="p-2 border"></th>
                        {variables.map((variable, idx) => (
                            <th key={idx} className="p-2 border bg-gray-100 text-sm font-medium transform -rotate-45 origin-bottom-left h-20">
                                <div className="ml-2">{variable}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {matrix.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                            <th className="p-2 border bg-gray-100 font-medium text-left">
                                {variables[rowIdx]}
                            </th>
                            {row.map((value, colIdx) => (
                                <td
                                    key={colIdx}
                                    className={`p-2 border text-center ${getColor(value)}`}
                                    title={`${variables[rowIdx]} vs ${variables[colIdx]}: ${value.toFixed(2)}`}
                                >
                                    {value.toFixed(2)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
};
export default StatisticalAnalysisTool;