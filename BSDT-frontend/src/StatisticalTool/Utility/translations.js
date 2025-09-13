export const translations = {
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