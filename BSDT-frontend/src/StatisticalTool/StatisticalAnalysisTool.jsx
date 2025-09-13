import "katex/dist/katex.min.css";
import { useEffect, useRef, useState, useMemo, use } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAcholder from "../ProfileManagement/navbarAccountholder";
import AncovaOptions from "./StatisticalTools/AncovaOptions";
import AndersonDarlingOptions from "./StatisticalTools/AndersonDarlingOptions";
import AnovaOptions from "./StatisticalTools/AnovaOptions";
import ChiSquareOptions from "./StatisticalTools/ChiSquareOptions";
import CramerVOptions from "./StatisticalTools/CramerVOptions";
import CrossTabulationOptions from "./StatisticalTools/CrossTabulationOptions";
import EDABasicsOptions from "./StatisticalTools/EDABasicsOptions";
import EDADistributionsOptions from "./StatisticalTools/EDADistributionsOptions";
import EDAPieChartOptions from "./StatisticalTools/EDAPieChartOptions";
import BarChartOptions from "./StatisticalTools/BarChartOptions";
import EDASwarmOptions from "./StatisticalTools/EDASwarmOptions";
import FZTOptions from "./StatisticalTools/FZTOptions";
import KolmogorovSmirnovOptions from "./StatisticalTools/KolmogorovSmirnovOptions";
import KruskalOptions from "./StatisticalTools/KruskalOptions";
import LinearRegressionOptions from "./StatisticalTools/LinearRegressionOptions";
import MannWhitneyOptions from "./StatisticalTools/MannWhitneyOptions";
import NetworkGraphOptions from "./StatisticalTools/NetworkGraphOptions";
import PearsonOptions from "./StatisticalTools/PearsonOptions";
import ShapiroWilkOptions from "./StatisticalTools/ShapiroWilkOptions";
import SimilarityOptions from "./StatisticalTools/SimilarityOptions";
import SpearmanOptions from "./StatisticalTools/SpearmanOptions";
import statTestDetails from "./stat_tests_details";
import "./StatisticalAnalysisTool.css";
import WilcoxonOptions from "./StatisticalTools/WilcoxonOptions";
import PreviewTable from "./previewTable";
import TestSuggestionsModal from "./testSuggestionsModal";
import * as XLSX from "xlsx";
import AnalysisResults from "./StatisticalAnalysisToolUitility/AnalysisResult";

const django_base_url = import.meta.env.VITE_DJANGO_BASE_URL;

const translations = {
  English: {
    title: "Statistical Analysis Tool",
    subtitle:
      "Upload your Excel file and run various statistical tests on your data",
    formTitle: "Data Analysis Form",
    uploadLabel: "Upload Your Data",
    preprocessedLabel: "Preprocessed File",
    surveyLabel: "Survey Data File",
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
      other: "Other Tests",
    },
    tests: {
      eda_basics: "Basic EDA Summary – Descriptive Stats & Entropy",
      eda_distribution:
        "Distribution Plot –> Histogram + KDE – For Numeric Column",
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
      eda_basics:
        "Provides key statistics like mean, median, std, outliers, and entropy to understand dataset structure and spread.",
      eda_distribution:
        "Distribution Plot –> Histogram + KDE – For Numeric Column",
      eda_swarm: "Swarm Plot – Categorical Vs Numeric Columns",
      eda_pie: "Pie Chart – For Categorical Column",
      bar_chart:
        "Bar Chart – Visualize categorical data frequencies as horizontal or vertical bars.",
      similarity:
        "Measures how similar or different two numeric columns are using statistical and geometric metrics.",
      pearson:
        "Measures the strength and direction of the linear relationship between two continuous variables.",
      spearman:
        "A non-parametric test that assesses how well the relationship between two variables can be described using a monotonic function.",
      ttest_ind:
        "Compares the means of two independent groups to determine if they are statistically different.",
      ttest_paired:
        "Compares the means of two related groups to determine if there is a statistically significant difference.",
      ttest_onesample:
        "Tests whether the mean of a single group is different from a known or hypothesized population mean.",
      ztest:
        "Tests whether the means of two groups are different when the population variance is known.",
      ftest:
        "Compares the variances of two populations to test if they are significantly different.",
      mannwhitney:
        "A non-parametric test used to determine whether there is a difference between two independent groups.",
      kruskal:
        "A non-parametric test used to compare three or more independent groups to find significant differences.",
      wilcoxon:
        "A non-parametric test used to compare two related samples to assess whether their population mean ranks differ.",
      linear_regression:
        "Models the relationship between a dependent variable and one or more independent variables.",
      anova: "Analyzes the differences among group means in a sample.",
      ancova:
        "Combines ANOVA and regression to evaluate whether population means differ while controlling for covariates.",
      shapiro:
        "Tests whether a sample comes from a normally distributed population.",
      kolmogorov:
        "A non-parametric test used to compare a sample distribution to a reference normal distribution.",
      anderson:
        "A statistical test that evaluates whether a sample comes from a specific distribution, most commonly the normal distribution.",
      fzt: "Performs three statistical tests: F-test for variance comparison, Z-test for mean difference using normal distribution, and Welch’s t-test for unequal variances.",
      cross_tabulation:
        "Summarizes the relationship between two or more categorical variables using frequency tables and heatmaps.",
      chi_square:
        "Tests the association between categorical variables using observed and expected frequencies.",
      cramers_heatmap:
        "Visual representation of Cramér's V association strength between categorical variables.",
      network_graph:
        "Displays statistical relationships between variables using a graphical network.",
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
    aboutText:
      "This statistical analysis tool allows you to perform various statistical tests on your Excel data:",
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
    conclusion: "Conclusion",
  },
  বাংলা: {
    title: "পরিসংখ্যানগত বিশ্লেষণ টুল",
    subtitle:
      "আপনার এক্সেল ফাইল আপলোড করুন এবং আপনার ডেটাতে বিভিন্ন পরিসংখ্যান পরীক্ষা চালান",
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
      other: "অন্যান্য পরীক্ষা",
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
      network_graph: "নেটওয়ার্ক গ্রাফ",
    },
    descriptions: {
      eda_basics:
        "গড়, মধ্যক, মানক বিচ্যুতি, আউটলাইয়ার ও এনট্রপি দিয়ে ডেটাসেটের মূল বৈশিষ্ট্য উপস্থাপন করে।",
      eda_distribution: "বিতরণ প্লট – হিস্টোগ্রাম + KDE (সংখ্যাগত)",
      eda_swarm: "স্বর্ম প্লট – শ্রেণিবিন্যাস বনাম সংখ্যাগত কলাম",
      eda_pie: "পাই চার্ট – শ্রেণিবিন্যাস কলামের জন্য",
      bar_chart:
        "বার চার্ট – শ্রেণিবিন্যাস ডেটার ফ্রিকোয়েন্সি অনুভূমিক বা উল্লম্ব বারে প্রদর্শন করে।",
      similarity:
        "দুইটি সংখ্যাগত কলামের মধ্যে সাদৃশ্য বা পার্থক্য পরিমাপ করে পরিসংখ্যানিক ও জ্যামিতিক পদ্ধতিতে।",
      pearson:
        "দুইটি ধারাবাহিক ভেরিয়েবলের মধ্যে রৈখিক সম্পর্কের শক্তি ও দিক পরিমাপ করে।",
      spearman:
        "দুইটি ভেরিয়েবলের মধ্যে একঘাত সম্পর্ক আছে কিনা তা নির্ধারণে ব্যবহৃত একটি নন-প্যারামেট্রিক পরীক্ষা।",
      ttest_ind:
        "দুটি স্বাধীন গ্রুপের গড় মানে উল্লেখযোগ্য পার্থক্য আছে কিনা তা নির্ধারণ করে।",
      ttest_paired:
        "একই গ্রুপের দুটি সম্পর্কযুক্ত অবস্থার গড়ের মধ্যে পার্থক্য আছে কিনা তা যাচাই করে।",
      ttest_onesample:
        "একটি গ্রুপের গড় কোনো নির্দিষ্ট মানের সাথে পার্থক্যপূর্ণ কিনা তা নির্ধারণ করে।",
      ztest:
        "দুটি গোষ্ঠীর গড়ে পার্থক্য আছে কিনা তা যাচাই করে যখন জনসংখ্যার বৈচিত্র্য জানা থাকে।",
      ftest: "দুটি গোষ্ঠীর বৈচিত্র্যের মধ্যে পার্থক্য আছে কিনা তা পরীক্ষা করে।",
      mannwhitney:
        "দুটি স্বাধীন গোষ্ঠীর মধ্যে পার্থক্য আছে কিনা তা নির্ধারণে ব্যবহৃত একটি নন-প্যারামেট্রিক পরীক্ষা।",
      kruskal:
        "তিন বা ততোধিক স্বাধীন গোষ্ঠীর মধ্যে উল্লেখযোগ্য পার্থক্য আছে কিনা তা নির্ধারণে ব্যবহৃত একটি নন-প্যারামেট্রিক পরীক্ষা।",
      wilcoxon:
        "দুটি সম্পর্কযুক্ত নমুনার মধ্যকার পার্থক্য নির্ধারণে ব্যবহৃত একটি নন-প্যারামেট্রিক পরীক্ষা।",
      linear_regression:
        "একটি নির্ভরশীল ভেরিয়েবল এবং এক বা একাধিক স্বাধীন ভেরিয়েবলের মধ্যে সম্পর্ক নির্ধারণ করে।",
      anova: "একাধিক গোষ্ঠীর গড় মানে পার্থক্য আছে কিনা তা বিশ্লেষণ করে।",
      ancova:
        "ANOVA এবং রিগ্রেশনের সমন্বয়ে গঠিত, যেখানে কভেরিয়েট নিয়ন্ত্রণ করে গোষ্ঠীর গড় মানে পার্থক্য নির্ধারণ করা হয়।",
      shapiro: "একটি নমুনা সাধারণ বন্টন থেকে এসেছে কিনা তা নির্ধারণ করে।",
      kolmogorov:
        "একটি নন-প্যারামেট্রিক পরীক্ষা যা একটি নমুনার বন্টনকে একটি আদর্শ স্বাভাবিক বন্টনের সাথে তুলনা করে।",
      anderson:
        "একটি পরিসংখ্যানগত পরীক্ষা যা একটি নমুনা নির্দিষ্ট বণ্টন থেকে এসেছে কিনা তা যাচাই করে, সাধারণত স্বাভাবিক বণ্টনের জন্য ব্যবহৃত হয়।",
      fzt: "তিনটি পরিসংখ্যানিক পরীক্ষা পরিচালনা করে: ভ্যারিয়েন্স তুলনার জন্য F-টেস্ট, গড়ের পার্থক্যের জন্য Z-টেস্ট এবং অসম ভ্যারিয়েন্সের জন্য Welch’s t-টেস্ট।",
      cross_tabulation:
        "দুই বা ততোধিক শ্রেণিবিন্যাসকৃত ভেরিয়েবলের মধ্যে সম্পর্ক সারাংশ আকারে প্রদর্শন করে, ফ্রিকোয়েন্সি টেবিল ও হিটম্যাপ ব্যবহার করে।",
      chi_square:
        "বিভিন্ন শ্রেণিবিন্যাসকৃত ভেরিয়েবলের মধ্যে সম্পর্ক নির্ধারণ করে।",
      cramers_heatmap:
        "Cramér's V ব্যবহার করে শ্রেণিবিন্যাসকৃত ভেরিয়েবলের মধ্যকার সম্পর্কের দৃঢ়তা চিত্রায়িত করে।",
      network_graph:
        "ভেরিয়েবলের মধ্যকার পরিসংখ্যানগত সম্পর্ক একটি গ্রাফ নেটওয়ার্কের মাধ্যমে উপস্থাপন করে।",
    },
    selectPrompt:
      "আপনার বিশ্লেষণের জন্য সঠিক পরিসংখ্যান পরীক্ষাটি নির্বাচন করুন",
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
    aboutText:
      "এই পরিসংখ্যানগত বিশ্লেষণ টুল আপনাকে আপনার এক্সেল ডেটাতে বিভিন্ন পরিসংখ্যানগত পরীক্ষা করতে দেয়:",
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
    conclusion: "সিদ্ধান্ত",
  },
};
const StatisticalAnalysisTool = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "English";
  });
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = translations[language];
  const [isPreprocessed, setIsPreprocessed] = useState(
    sessionStorage.getItem("preprocessed") === "true"
  );
  const [isSurveyData, setIsSurveyData] = useState(
    sessionStorage.getItem("surveyfile") === "true"
  );
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("initial");
  const [columns, setColumns] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [referenceValue, setReferenceValue] = useState(0);
  const fileInputRef = useRef(null);
  const uploadContainerRef = useRef(null);
  const [fileURL, setFileURL] = useState("");
  const userId = localStorage.getItem("user_id");
  useEffect(() => {
    const stored = sessionStorage.getItem("fileURL") || "";
    if (stored) setFileURL(stored);
  }, []);

  const fetchcolumn = () => {
    const storedSheetName =
      sessionStorage.getItem("activesheetname") || "sheet1";
    if (fileName && userId && sessionStorage.getItem("fileURL")) {
      console.log("Active sheet name from sessionStorage:", storedSheetName);
      const formData = new FormData();

      formData.append("filename", fileName);
      formData.append("userID", userId);
      formData.append("activeSheet", storedSheetName || "");
      formData.append("Fileurl", sessionStorage.getItem("fileURL") || "");
      fetch(`${django_base_url}/api/get-columns/`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log(data.columns);
            setColumns(data.columns || []);
            setColumn1(data.columns[0]);
            console.log(columns);
          } else {
            console.error("Error fetching columns:", data.error);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  useEffect(() => {
    const filename = sessionStorage.getItem("file_name") || "";
    let fileUrl = "";
    if (isSurveyData) {
      sessionStorage.removeItem("surveyfile");
    } else if (isPreprocessed) {
      sessionStorage.removeItem("preprocessed");
    }
    fileUrl = `${django_base_url}${sessionStorage.getItem("fileURL")}`;
    console.log("File URL from sessionStorage:", fileUrl);
    if (sessionStorage.getItem("fileURL")) {
      fetch(fileUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch file from ${fileUrl}`);
          return res.blob();
        })
        .then((blob) => {
          const newFile = new File([blob], filename, { type: blob.type });
          setFile(newFile);
          setFileName(filename || newFile.name);
          setUploadStatus("success");
          console.log("File loaded successfully:", newFile.name);
          // Send file to backend to extract columns
          const formData = new FormData();
          formData.append("file", newFile);
          formData.append("userID", userId);
          fetchcolumn();
        })
        .catch((err) => {
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
  const [testType, setTestType] = useState(""); // Default to Kruskal-Wallis
  const [column1, setColumn1] = useState("");
  const [column2, setColumn2] = useState("");
  const [column3, setColumn3] = useState("");
  const [column4, setColumn4] = useState("");
  const [column5, setColumn5] = useState("");
  const [heatmapSize, setHeatmapSize] = useState("");
  const [imageFormat, setImageFormat] = useState("png");
  const [useDefaultSettings, setUseDefaultSettings] = useState(true);
  const [labelFontSize, setLabelFontSize] = useState(36);
  const [tickFontSize, setTickFontSize] = useState(16);
  const [imageQuality, setImageQuality] = useState(90);
  const [imageSize, setImageSize] = useState("800x600");
  const [colorPalette, setColorPalette] = useState("deep");
  const [barWidth, setBarWidth] = useState(0.8);
  const [boxWidth, setBoxWidth] = useState(0.8);
  const [violinWidth, setViolinWidth] = useState(0.8);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [histogramBins, setHistogramBins] = useState(30);
  const [barColor, setBarColor] = useState("steelblue");
  const [legendFontSize, setLegendFontSize] = useState(16);
  const [lineColor, setLineColor] = useState("red");
  const [lineStyle, setLineStyle] = useState("solid");
  const [lineWidth, setLineWidth] = useState(2);
  const [dotColor, setDotColor] = useState("blue");
  const [dotWidth, setDotWidth] = useState(5);
  const [boxColor, setBoxColor] = useState("steelblue");
  const [medianColor, setMedianColor] = useState("red");
  const [fCurveColor, setFCurveColor] = useState("blue");
  const [fLineColor, setFLineColor] = useState("red");
  const [zCurveColor, setZCurveColor] = useState("gray");
  const [zLineColor, setZLineColor] = useState("green");
  const [tCurveColor, setTCurveColor] = useState("gray");
  const [tLineColor, setTLineColor] = useState("purple");
  const [hist1Color, setHist1Color] = useState("red");
  const [hist2Color, setHist2Color] = useState("orange");
  const [heatmapColorTheme, setHeatmapColorTheme] = useState("Blues");
  const [barColors, setBarColors] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [extraColumns, setExtraColumns] = useState([]);
  const [swarmColor, setSwarmColor] = useState("orange");
  const [histColor, setHistColor] = useState("blue");
  const [kdeColor, setKdeColor] = useState("green");
  const [distColor, setDistColor] = useState("purple");
  const [nodeColor, setNodeColor] = useState("#AED6F1");
  const [nodeSize, setNodeSize] = useState(800);
  const [textSize, setTextSize] = useState(25);
  const [textColor, setTextColor] = useState("black");
  const [edgeWidthFactor, setEdgeWidthFactor] = useState(0.5);
  const [showEdgeWeights, setShowEdgeWeights] = useState(false);
  const [weightFontSize, setWeightFontSize] = useState(3);
  const [weightColor, setWeightColor] = useState("red");
  const [useMatrix, setUseMatrix] = useState(false);
  const [matrixFile, setMatrixFile] = useState(null);
  const [barChartType, setBarChartType] = useState("vertical");
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  const testsWithoutDetails = [
    "eda_basics",
    "eda_distribution",
    "eda_swarm",
    "eda_pie",
    "bar_chart",
    "similarity",
  ];

  // Handle file selection async
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      sessionStorage.setItem("file_name", selectedFile.name);
      setFileName(selectedFile.name);
      setUploadStatus("loading");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userID", userId);
      console.log("File selected:", selectedFile);

      fetch(`${django_base_url}/api/upload-file/`, {
        method: "POST",

        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setUploadStatus("success");
            const fixedUrl = data.fileURL.replace(/\\/g, "/");
            console.log("ee", fixedUrl);
            sessionStorage.setItem("fileURL", fixedUrl);
            console.log(
              "File uploaded successfully. URL:",
              sessionStorage.getItem("fileURL")
            );
            fetchcolumn();
          } else {
            setErrorMessage(data.error);
            setUploadStatus("error");
          }
        })
        .catch((error) => {
          setErrorMessage("Error processing file: " + error);
          setUploadStatus("error");
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file || !column1) {
      setErrorMessage(t.uploadError);
      return;
    }
    if (!column1 && testType !== "network_graph") {
      setErrorMessage(t.columnError || t.columnError);
      return;
    }

    if (testType === "linear_regression" && !column2) {
      setErrorMessage(
        t.column2Error || "Please select a second column for regression."
      );
      return;
    }

    if (testType === "ancova" && (!column1 || !column2 || !column3)) {
      setErrorMessage(
        t.column3Error ||
          "Please select group, covariate, and dependent columns for ANCOVA."
      );
      return;
    }

    setIsAnalyzing(true);
    const langCode = language === "বাংলা" ? "bn" : "en";
    const isHeatmap4x4 = heatmapSize === "4x4";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_name", fileName);
    formData.append("userID", userId);
    formData.append("Fileurl", sessionStorage.getItem("fileURL") || "");
    formData.append("test_type", testType);
    formData.append("column1", column1);
    formData.append("column2", column2);
    formData.append("language", langCode);
    formData.append("heatmapSize", heatmapSize);
    /////
    if (testType === "ancova") {
      formData.append("primary_col", column1);
      formData.append("secondary_col", column2);
      formData.append("dependent_col", column3);
    } else if (testType === "kolmogorov" || testType === "anderson") {
      formData.append("column", column1);
    } else if (testType === "fzt") {
      formData.append("primary_col", column1);
      formData.append("secondary_col", column2);
    } else if (testType === "eda_distribution" || testType === "eda_pie") {
      formData.append("column", column1);
    } else if (testType === "eda_swarm") {
      formData.append("cat_column", column1);
      formData.append("num_column", column2);
    } else if (testType === "similarity") {
      formData.append("column1", column1);
      formData.append("column2", column2);
    } else if (testType === "eda_basics") {
    } else if (testType === "network_graph") {
    } else if (testType === "bar_chart") {
      // New Code for Bar Chart
      formData.append("column1", column1); //  Only one column
      formData.append("orientation", barChartType); //  Vertical / Horizontal choice
    } else {
      formData.append("column1", column1);
      formData.append("column2", column2);
    }

    if ((testType === "pearson" || testType === "spearman") && isHeatmap4x4) {
      if (column3 && column4) {
        formData.append("column3", column3);
        formData.append("column4", column4);
      } else {
        setErrorMessage("Please select 4 columns for 4x4 heatmap.");
        setIsAnalyzing(false);
        return;
      }
    }
    //

    if (
      [
        "kruskal",
        "mannwhitney",
        "wilcoxon",
        "pearson",
        "spearman",
        "shapiro",
        "linear_regression",
        "anova",
        "ancova",
        "kolmogorov",
        "anderson",
        "fzt",
        "eda_distribution",
        "eda_swarm",
        "bar_chart",
        "eda_pie",
        "eda_basics",
        "chi_square",
        "cramers_heatmap",
        "cross_tabulation",
        "network_graph",
      ].includes(testType)
    ) {
      formData.append("format", imageFormat);
      formData.append("use_default", useDefaultSettings ? "true" : "false");

      if (!useDefaultSettings) {
        formData.append("label_font_size", labelFontSize.toString());
        formData.append("tick_font_size", tickFontSize.toString());
        formData.append("image_quality", imageQuality.toString());
        formData.append("image_size", imageSize);
        formData.append("palette", colorPalette);
        formData.append("bar_width", barWidth.toString());

        if (["kruskal", "mannwhitney"].includes(testType)) {
          formData.append("box_width", boxWidth.toString());
          formData.append("violin_width", violinWidth.toString());
        }

        if (testType === "shapiro") {
          formData.append("bins", histogramBins.toString());
          formData.append("bar_color", barColor);
          formData.append("line_color", lineColor);
          formData.append("line_style", lineStyle);
        }

        if (testType === "linear_regression") {
          formData.append("legend_font_size", legendFontSize.toString());
          formData.append("line_color", lineColor);
          formData.append("line_style", lineStyle);
          formData.append("dot_width", dotWidth.toString());
          formData.append("line_width", lineWidth.toString());
          formData.append("dot_color", dotColor);
        }

        if (testType === "anova") {
          formData.append("box_color", boxColor);
          formData.append("median_color", medianColor);
        }

        if (testType === "ancova") {
          formData.append("box_color", boxColor);
          formData.append("line_color", lineColor);
          formData.append("line_style", lineStyle);
          formData.append("dot_color", dotColor);
          formData.append("dot_width", dotWidth.toString());
          formData.append("line_width", lineWidth.toString());
        }

        if (testType === "kolmogorov") {
          formData.append("label_font_size", labelFontSize.toString());
          formData.append("tick_font_size", tickFontSize.toString());
          formData.append("image_quality", imageQuality.toString());
          formData.append("image_width", imageSize.split("x")[0]);
          formData.append("image_height", imageSize.split("x")[1]);
          formData.append("ecdf_color", dotColor);
          formData.append("cdf_color", lineColor);
          formData.append("line_style", lineStyle);
        }

        if (testType === "anderson") {
          formData.append("scatter_color", dotColor);
          formData.append("line_color", lineColor);
          formData.append("line_style", lineStyle);
        }

        if (testType === "fzt") {
          formData.append("line_width", lineWidth.toString());
          formData.append("line_style", lineStyle);
          formData.append("f_curve_color", fCurveColor);
          formData.append("f_line_color", fLineColor);
          formData.append("z_curve_color", zCurveColor);
          formData.append("z_line_color", zLineColor);
          formData.append("t_curve_color", tCurveColor);
          formData.append("t_line_color", tLineColor);
          formData.append("hist1_color", hist1Color);
          formData.append("hist2_color", hist2Color);
        }

        if (testType === "cross_tabulation") {
          formData.append("column1", column1);
          formData.append("column2", column2);
          extraColumns.forEach((col, idx) => {
            formData.append(`column${idx + 3}`, col);
          });
        }

        if (testType === "eda_distribution") {
          formData.append("hist_color", histColor);
          formData.append("kde_color", kdeColor);
          formData.append("dist_color", distColor);
        }

        if (testType === "eda_swarm") {
          formData.append("swarm_color", swarmColor);
        }
        if (testType === "bar_chart") {
          formData.append("orientation", barChartType); // "vertical" | "horizontal"
        }
      }

      if (
        [
          "pearson",
          "spearman",
          "cross_tabulation",
          "cramers_heatmap",
          "chi_square",
          "network_graph",
        ].includes(testType)
      ) {
        formData.append("heatmapSize", heatmapSize);

        selectedColumns.forEach((col, idx) => {
          formData.append(`column${idx + 1}`, col);
        });
      }
    }

    // Debug output
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    fetch(`${django_base_url}/api/analyze/`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        setIsAnalyzing(false);
      })
      .catch((err) => {
        setErrorMessage("Error analyzing: " + err);
        setIsAnalyzing(false);
      });
  };

  // Reset form to start a new analysis
  const resetForm = () => {
    setResults(null);
    setFile(null);
    setFileName(t.dropFile);
    setUploadStatus("initial");
    setColumns([]);
    setColumn1("");
    setColumn2("");
    setColumn3("");
    setColumn4("");
    setColumn5("");
    setTestType("");
    setReferenceValue(0);
    setHeatmapSize("");
    setSelectedColumns([]);
    setIsPreprocessed(false);
    setIsSurveyData(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    sessionStorage.removeItem("file_name");
    sessionStorage.removeItem("fileURL");
    sessionStorage.removeItem("activesheetname");
    setFileURL("");
  };

  // Get required fields based on test type
  const getRequiredFields = () => {
    switch (testType) {
      case "ttest_onesample":
        return { col2: false, col3: false, refValue: true, heatmapSize: false };
      case "ancova":
        return { col2: true, col3: true, refValue: false, heatmapSize: false };
      case "cross_tabulation":
      case "network_graph":
      case "cramers_heatmap":
      case "chi_square":
      case "spearman":
      case "pearson":
        return {
          col2: false,
          col3: false,
          col4: false,
          refValue: false,
          heatmapSize: true,
        };
      case "shapiro":
      case "kolmogorov":
      case "anderson":

      case "kruskal":
        return {
          col2: true,
          col3: false,
          refValue: false,
          heatmapSize: false,
          bengaliOptions: true,
        };
      case "fzt":
        return {
          col2: true,
          col3: false,
          refValue: false,
          heatmapSize: false,
          bengaliOptions: true,
        };
      case "eda_distribution":
        return {
          col2: false,
          col3: false,
          refValue: false,
          heatmapSize: false,
        };
      case "eda_swarm":
        return { col2: true, col3: false, refValue: false, heatmapSize: false };
      case "eda_pie":
        return {
          col2: false,
          col3: false,
          refValue: false,
          heatmapSize: false,
        };
      case "bar_chart": // New Code for Bar Chart
        return {
          col2: false,
          col3: false,
          refValue: false,
          heatmapSize: false,
        };
      case "eda_basics":
        return {
          col2: false,
          col3: false,
          refValue: false,
          heatmapSize: false,
        };
      case "similarity":
        return {
          col2: true,
          col3: false,
          refValue: false,
          heatmapSize: false,
          multiColumn: false,
        };
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
    let filetype = "";

    if (isPreprocessed) {
      filetype = "preprocessed";
    } else if (isSurveyData) {
      filetype = "survey";
    }
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <NavbarAcholder language={language} setLanguage={setLanguage} />

        <div className="container mx-auto py-10 px-4 relative">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-3">{t.title}</h1>
          </header>

          <div className="flex flex-col items-center">
            <div className="w-full max-w-4xl">
              {errorMessage && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                  <div className="flex">
                    <div className="py-1">
                      <svg
                        className="w-6 h-6 mr-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>{errorMessage}</div>
                  </div>
                </div>
              )}
              {!results ? (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                  <div className="bg-gray-700 text-white p-4 font-semibold">
                    <svg
                      className="inline-block w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span className="text-black">{t.formTitle}</span>

                    <button
                      onClick={() => navigate("/report")}
                      className="ml-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                    >
                      {language === "বাংলা" ? "রিপোর্ট দেখুন" : "Show Report"}
                    </button>
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
                          {isPreprocessed
                            ? t.preprocessedLabel
                            : isSurveyData
                            ? t.surveyLabel
                            : t.uploadLabel}
                        </h5>

                        {isPreprocessed || isSurveyData ? (
                          <div className="bg-green-100 text-green-700 p-4 rounded text-center shadow">
                            {isPreprocessed
                              ? "Preprocessed file"
                              : "Survey file"}{" "}
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
                                uploadStatus === "success"
                                  ? "text-green-500"
                                  : "text-gray-600"
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
                          <PreviewTable
                            workbookUrl={`${django_base_url}${sessionStorage.getItem(
                              "fileURL"
                            )}`}
                            columns={columns}
                            initialData={data}
                            data={data}
                            setData={setData}
                            setIsPreviewModalOpen={setIsPreviewModalOpen}
                            isPreviewModalOpen={isPreviewModalOpen}
                          />
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
                          {language === "bn" ? "ডেটা প্রিভিউ" : "Preview Data"}
                        </button>
                        <button
                          type="button"
                          className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                          onClick={() => {
                            console.log("User ID:", userId);
                            const path = "/preprocess";
                            navigate(path, {
                              state: { userId: userId, filename: fileName },
                            });
                          }}
                        >
                          {language === "bn"
                            ? "ডেটা প্রিপ্রসেস করুন"
                            : "Preprocess Data"}
                        </button>
                      </div>

                      <div className="flex justify-end gap-4 mb-6"></div>
                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                          {t.selectTest}
                        </h5>
                        <div className="mb-4">
                          <label className="block text-gray-700 font-medium mb-2">
                            <svg
                              className="inline-block w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            {t.testType}
                          </label>
                          <select
                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={testType}
                            onChange={(e) => setTestType(e.target.value)}
                          >
                            <option value="" disabled>
                              {t.selectPrompt}
                            </option>
                            <optgroup label={t.testGroups.eda}>
                              <option value="eda_basics">
                                {t.tests.eda_basics}
                              </option>
                              <option value="eda_distribution">
                                {t.tests.eda_distribution}
                              </option>
                              <option value="eda_swarm">
                                {t.tests.eda_swarm}
                              </option>
                              <option value="eda_pie">{t.tests.eda_pie}</option>
                              <option value="bar_chart">
                                {t.tests.bar_chart}
                              </option>
                              <option value="similarity">
                                {t.tests.similarity}
                              </option>
                            </optgroup>
                            <optgroup label={t.testGroups.nonParametric}>
                              <option value="kruskal">{t.tests.kruskal}</option>
                              <option value="mannwhitney">
                                {t.tests.mannwhitney}
                              </option>
                              <option value="wilcoxon">
                                {t.tests.wilcoxon}
                              </option>
                            </optgroup>
                            <optgroup label={t.testGroups.correlation}>
                              <option value="pearson">{t.tests.pearson}</option>
                              <option value="spearman">
                                {t.tests.spearman}
                              </option>
                            </optgroup>
                            <optgroup label={t.testGroups.parametric}>
                              <option value="fzt">{t.tests.fzt}</option>
                            </optgroup>
                            <optgroup label={t.testGroups.regression}>
                              <option value="linear_regression">
                                {t.tests.linear_regression}
                              </option>
                            </optgroup>
                            <optgroup label={t.testGroups.anova}>
                              <option value="anova">{t.tests.anova}</option>
                              <option value="ancova">{t.tests.ancova}</option>
                            </optgroup>
                            <optgroup label={t.testGroups.other}>
                              <option value="shapiro">{t.tests.shapiro}</option>
                              <option value="kolmogorov">
                                {t.tests.kolmogorov}
                              </option>
                              <option value="anderson">
                                {t.tests.anderson}
                              </option>
                              <option value="cross_tabulation">
                                {t.tests.cross_tabulation}
                              </option>
                              <option value="chi_square">
                                {t.tests.chi_square}
                              </option>
                              <option value="cramers_heatmap">
                                {t.tests.cramers_heatmap}
                              </option>
                              <option value="network_graph">
                                {t.tests.network_graph}
                              </option>
                            </optgroup>
                          </select>

                          <div className="text-sm text-gray-600 mt-2">
                            {t.selectPrompt}
                          </div>

                          {testType && t.descriptions[testType] && (
                            <div className="mt-2 p-3 bg-gray-100 text-gray-700 text-sm rounded shadow-sm text-left">
                              <strong className="block text-gray-800 mb-1">
                                {language === "bn"
                                  ? "পরীক্ষার বিবরণ:"
                                  : "Statistical Test Description:"}
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
                                    {language === "bn"
                                      ? "বিস্তারিত দেখুন"
                                      : "More Details"}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {testType === "bar_chart" && (
                        <div className="mb-4">
                          <label className="block mb-2 font-medium">
                            {language === "bn"
                              ? "বার চার্ট টাইপ নির্বাচন করুন:"
                              : "Select bar chart type:"}
                          </label>
                          <select
                            value={barChartType}
                            onChange={(e) => setBarChartType(e.target.value)}
                            className="border rounded-md p-2 w-full"
                          >
                            <option value="vertical">
                              {language === "bn"
                                ? "উল্লম্ব (Vertical)"
                                : "Vertical"}
                            </option>
                            <option value="horizontal">
                              {language === "bn"
                                ? "অনুভূমিক (Horizontal)"
                                : "Horizontal"}
                            </option>
                          </select>
                        </div>
                      )}

                      {(testType === "pearson" ||
                        testType === "network_graph" ||
                        testType === "spearman" ||
                        testType === "cross_tabulation" ||
                        testType === "chi_square" ||
                        testType === "cramers_heatmap") && (
                        <div className="mb-6">
                          <label className="block text-gray-700 font-medium mb-2">
                            Column(s)
                          </label>
                          <div className="border border-gray-300 rounded-lg p-3 bg-white min-h-[48px] flex flex-wrap gap-2">
                            {selectedColumns.length > 0 ? (
                              selectedColumns.map((col, idx) => (
                                <div key={idx} className="tag-chip">
                                  <span>{col}</span>
                                  <button
                                    type="button"
                                    className="remove-button"
                                    onClick={() =>
                                      setSelectedColumns((prev) =>
                                        prev.filter((c) => c !== col)
                                      )
                                    }
                                  >
                                    ×
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400">
                                No columns selected yet
                              </p>
                            )}
                          </div>
                          <select
                            className="border border-gray-300 rounded-lg p-3 mt-2 w-full"
                            onChange={(e) => {
                              const selected = e.target.value;
                              if (
                                selected &&
                                !selectedColumns.includes(selected)
                              ) {
                                setSelectedColumns((prev) => [
                                  ...prev,
                                  selected,
                                ]);
                              }
                              e.target.selectedIndex = 0;
                            }}
                            disabled={selectedColumns.length >= columns.length}
                          >
                            <option value="">Select column...</option>
                            {columns
                              .filter((col) => !selectedColumns.includes(col))
                              .map((col, idx) => (
                                <option key={idx} value={col}>
                                  {col}
                                </option>
                              ))}
                          </select>

                          <p className="text-sm text-gray-500 mt-2">
                            {selectedColumns.length} column(s) selected
                          </p>
                        </div>
                      )}

                      {testType !== "eda_basics" && (
                        <div className="mb-6">
                          {![
                            "spearman",
                            "pearson",
                            "cross_tabulation",
                            "network_graph",
                          ].includes(testType) && (
                            <h5 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                              {t.selectVariables}
                            </h5>
                          )}
                          {![
                            "spearman",
                            "pearson",
                            "cross_tabulation",
                            "network_graph",
                            "cramers_heatmap",
                            "chi_square",
                          ].includes(testType) && (
                            <div className="mb-4">
                              <label className="block text-gray-700 font-medium mb-2">
                                <svg
                                  className="inline-block w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16m-7 6h7"
                                  />
                                </svg>
                                {testType === "kolmogorov" ||
                                testType === "anderson" ||
                                testType === "shapiro" ||
                                testType === "eda_distribution"
                                  ? language === "bn"
                                    ? "একটি সংখ্যাগত কলাম নির্বাচন করুন"
                                    : "Pick a Numerical Column"
                                  : t.column1}
                              </label>
                              <select
                                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={column1}
                                onChange={(e) => setColumn1(e.target.value)}
                                disabled={columns.length === 0}
                              >
                                {columns.length === 0 ? (
                                  <option value="">
                                    -- Upload a file first --
                                  </option>
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
                            <div className="mb-4">
                              <label className="block text-gray-700 font-medium mb-2">
                                <svg
                                  className="inline-block w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16m-7 6h7"
                                  />
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
                                  <option key={idx} value={col}>
                                    {col}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {requiredFields.col3 && (
                            <div className="mb-4">
                              <label className="block text-gray-700 font-medium mb-2">
                                <svg
                                  className="inline-block w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16m-7 6h7"
                                  />
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
                                  <option key={idx} value={col}>
                                    {col}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {requiredFields.col4 && (
                            <div className="mb-4">
                              <label className="block text-gray-700 font-medium mb-2">
                                <svg
                                  className="inline-block w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16m-7 6h7"
                                  />
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
                                  <option key={idx} value={col}>
                                    {col}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {testType === "kruskal" && (
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

                          {testType === "mannwhitney" && (
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

                          {testType === "pearson" && (
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

                          {testType === "spearman" && (
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

                          {testType === "shapiro" && (
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

                          {testType === "wilcoxon" && (
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

                          {testType === "linear_regression" && (
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

                          {testType === "anova" && (
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

                          {testType === "ancova" && (
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

                          {testType === "kolmogorov" && (
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
                              ecdfColor={dotColor} // reuse dotColor for ECDF
                              setEcdfColor={setDotColor}
                              cdfColor={lineColor} // reuse lineColor for CDF
                              setCdfColor={setLineColor}
                              lineStyle={lineStyle}
                              setLineStyle={setLineStyle}
                              t={t}
                              selectedColumn={column1}
                              setSelectedColumn={setColumn1}
                            />
                          )}

                          {testType === "anderson" && (
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
                              scatterColor={dotColor} // reuse dotColor for scatter
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

                          {testType === "fzt" && (
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

                          {testType === "cross_tabulation" && (
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

                          {testType === "eda_distribution" && (
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

                          {testType === "eda_swarm" && (
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

                          {testType === "eda_pie" && (
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
                          {testType === "bar_chart" && (
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

                          {testType === "eda_basics" && (
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

                          {testType === "similarity" && (
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

                          {testType === "chi_square" && (
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

                          {testType === "cramers_heatmap" && (
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

                          {testType === "network_graph" && (
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
                                <svg
                                  className="inline-block w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16m-7 6h7"
                                  />
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
                        <div className="mb-6">
                          <label className="block text-gray-700 font-medium mb-2">
                            <svg
                              className="inline-block w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            {t.referenceValue}
                          </label>
                          <input
                            type="number"
                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={referenceValue}
                            onChange={(e) =>
                              setReferenceValue(parseFloat(e.target.value))
                            }
                            step="0.01"
                          />
                        </div>
                      )}

                      <div className="text-center mt-6">
                        <button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow transitiozn duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {t.analyzing}
                            </>
                          ) : (
                            <>
                              <svg
                                className="inline-block w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
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
                  user_id={userId}
                  results={results}
                  testType={testType}
                  columns={[column1, column2, column3]}
                  language={language}
                  t={t}
                  filename={fileName}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for rendering analysis results
export default StatisticalAnalysisTool;
