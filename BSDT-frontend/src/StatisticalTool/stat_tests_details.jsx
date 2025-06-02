const statTestDetails = {
  en: {
    kruskal: ` What is the Kruskal-Wallis Test?
The Kruskal-Wallis test is a non-parametric statistical test used to compare three or more independent groups to determine if there are statistically significant differences between them. It is an extension of the Mann-Whitney U test for more than two groups and is used when the assumptions of ANOVA (such as normality) are not met.

 Assumptions
- Independence: The groups being compared should be independent of each other.
- Ordinal or Continuous Data: Data should be ordinal (e.g., Likert scales) or continuous but not normally distributed.
- Similar Distribution Shapes: The distributions of all groups should have a similar shape.

 Do’s and Don’ts
Do’s:
- Use for comparing more than two independent groups.
- Ensure independence of samples.
- Use when data is non-normal.
- Rank data carefully and handle ties correctly.

Don’ts:
- Don’t use for paired data.
- Don’t ignore assumptions like independence or distribution shape.
- Don’t use with very small sample sizes.

 Best Practices
- Ensure group independence.
- Use larger sample sizes for better reliability.
- Correctly handle tied values in ranks.
- Use when data is non-normal.

 Formula
H = (12 / (N(N + 1))) * Σ(Ri² / ni) - 3(N + 1)
Where N is total observations, k is number of groups, Ri is rank sum of group i, and ni is number of observations in group i.

 Data Type
- Ordinal or Continuous

 Interpretation
- High H suggests group differences.
- p < 0.05 → significant; p ≥ 0.05 → not significant.

 Use Cases
- Comparing satisfaction scores across brands.
- Comparing teaching methods.

 Visualizations
- Boxplots
- Violin Plots
- Median Rank Bar Charts`,

    mannwhitney: ` What is the Mann-Whitney U Test?
The Mann-Whitney U test is a non-parametric statistical test used to compare two independent groups. It determines whether the distributions of two groups differ. This test is an alternative to the independent t-test when the assumptions of normality or equal variance are violated.

 When to Use It
- Comparing two independent groups.
- Data is ordinal or continuous, but not normally distributed.
- Groups have unequal sample sizes.

 Assumptions
- Independence: Groups must be independent.
- Ordinal or Continuous Data: Data should be rankable.
- Similar Distribution Shapes: Distributions should be similar for median comparison.

 What It Does
- Ranks all values together.
- Compares rank sums between groups.
- Uses U1 and U2 statistics, smallest value is test statistic.

 Formula
U1 = n1n2 + (n1(n1 + 1))/2 − R1
U2 = n1n2 − U1

Z = (U − μU) / σU
Where μU = n1n2 / 2 and σU = sqrt(n1n2(n1 + n2 + 1)/12)

 Interpretation
- p < 0.05 → Significant difference
- p ≥ 0.05 → Not significant

 Do’s and Don’ts
Do’s:
- Use for two independent groups.
- Use with ordinal or non-normal continuous data.

Don’ts:
- Don’t use for paired/matched data.
- Don’t apply to categorical data.

 Best Practices
- Use visualizations.
- Handle tied ranks.
- Report effect size with U and p.

 Use Cases
- Comparing recovery time from two treatments.
- Comparing satisfaction between groups.

 Visualization Methods
- Boxplots
- Violin Plots
- Rank Plots`,

    spearman: `Spearman Rank Correlation is a non-parametric test used to measure the strength and direction of the monotonic relationship between two ranked variables. Unlike Pearson correlation, it does not assume linearity or normal distribution.

Assumptions:
- Data must be ordinal or continuous, and rankable.
- Variables must show a monotonic trend (consistently increasing or decreasing).
- Observations must be independent.

Do’s:
- Use for monotonic but non-linear trends.
- Rank data and handle ties properly.
- Report both correlation coefficient and p-value.

Don’ts:
- Don’t use for non-monotonic or irregular trends.
- Don’t ignore ties or infer causality.

Best Practices:
- Use at least 10–15 data pairs.
- Visualize data to understand the relationship.
- Use heatmaps when comparing many variables.

Formula:
ρ = 1 - (6 * Σd²) / (n(n² - 1)), where d is the difference in ranks.

Interpretation:
- ρ close to +1: strong positive correlation
- ρ close to -1: strong negative correlation
- ρ ≈ 0: no correlation
- p < 0.05: statistically significant

Use Cases:
- Rank correlation between study hours and test scores.
- Correlation between customer satisfaction and service rating.`,

    pearson: `Pearson Correlation is a parametric test to measure the linear relationship between two continuous variables. It assumes normality and linearity.

Assumptions:
- Both variables must be continuous.
- Data should follow a normal distribution.
- The relationship should be linear.
- Observations must be independent.

Do’s:
- Use scatter plots to check linearity.
- Check for normality and outliers.
- Report both correlation coefficient and p-value.

Don’ts:
- Don’t use for non-linear data.
- Don’t assume causation from correlation.

Best Practices:
- Use sample sizes ≥ 20–30.
- Manage outliers and visualize data.

Formula:
r = cov(X, Y) / (σX * σY)

Interpretation:
- r = +1: perfect positive linear relationship
- r = -1: perfect negative linear relationship
- r = 0: no linear relationship
- p < 0.05: statistically significant

Use Cases:
- Height vs. weight
- Temperature vs. ice cream sales`,

    shapiro: `What is the Shapiro-Wilk Test?
The Shapiro-Wilk test assesses if a sample comes from a normally distributed population. It is particularly effective for small datasets.

Assumptions
- Continuous Data: The variable being tested should be numeric and continuous.
- Single Group: This test is not for group comparisons but for checking distribution of one group.

Do’s and Don’ts
Do’s:
- Use to verify normality before running parametric tests like t-test or ANOVA.
- Apply to small and medium-sized datasets (3–2000).

Don’ts:
- Don’t apply to categorical or ordinal data.
- Don’t use it for multiple groups simultaneously.

How It Works
- Calculates a W-statistic where a value close to 1 implies normality.

Interpretation
- p ≥ 0.05: Fail to reject null — data is likely normal.
- p < 0.05: Reject null — data is not normal.

Visualization
- Histogram, Boxplot.

Use Case
- Check if exam scores are normally distributed before applying t-test.`,

    wilcoxon: `What is the Wilcoxon Signed-Rank Test?
The Wilcoxon Signed-Rank Test is a non-parametric test for comparing two related samples, such as before-and-after measurements.

Assumptions
- Paired Data: Each subject must have two related observations.
- Ordinal or Continuous Data: Differences between pairs should be rankable.
- Independence within pairs.

Do’s and Don’ts
Do’s:
- Use for non-normal paired data.
- Report both W-statistic and p-value.

Don’ts:
- Don’t use for independent groups.
- Don’t ignore zero differences or ties.

Best Practices
- Visualize differences using histograms or boxplots.
- Use minimum 6–10 pairs for better reliability.

Formula
- Ranks absolute differences and compares sum of ranks.

Interpretation
- p < 0.05: Significant change.
- p ≥ 0.05: No significant change.

Use Cases
- Pre- and post-treatment comparisons (e.g., blood pressure).
- Skill assessment before and after training.

Visualizations
- Boxplot of differences
- Line plot of paired observations
- Dot plot of signed ranks`

  },

  bn: {
    kruskal: ` ক্রুসকাল-ওয়ালিস টেস্ট কী?
ক্রুসকাল-ওয়ালিস একটি নন-প্যারামেট্রিক পরিসংখ্যানগত টেস্ট যা তিন বা ততোধিক স্বাধীন গোষ্ঠীর মধ্যে উল্লেখযোগ্য পার্থক্য আছে কিনা তা নির্ধারণ করতে ব্যবহৃত হয়। এটি Mann-Whitney U টেস্টের একটি সম্প্রসারণ এবং তখন ব্যবহৃত হয় যখন ANOVA এর পূর্বধারণা (যেমন, normality) পূরণ না হয়।

 পূর্বধারণা
- স্বাধীনতা: গোষ্ঠীগুলি একে অপরের থেকে স্বাধীন হতে হবে।
- অর্ডিনাল বা ধারাবাহিক ডেটা: ডেটা অর্ডিনাল (যেমন, লিকার্ট স্কেল) বা ধারাবাহিক কিন্তু নরমাল নয় হতে হবে।
- অনুরূপ বন্টন: সব গোষ্ঠীর বন্টন প্রায় একরকম হওয়া উচিত।

 করণীয় ও বর্জনীয়
করণীয়:
- দুইয়ের অধিক স্বাধীন গোষ্ঠী তুলনায় ব্যবহার করুন।
- নমুনার স্বাধীনতা নিশ্চিত করুন।
- নন-নরমাল ডেটার জন্য ব্যবহার করুন।
- র‌্যাংকিং সঠিকভাবে করুন এবং টাই হ্যান্ডল করুন।

বর্জনীয়:
- পেয়ার্ড ডেটায় ব্যবহার করবেন না।
- স্বাধীনতা বা বন্টনের ধরণ উপেক্ষা করবেন না।
- খুব ছোট নমুনায় (প্রতি গোষ্ঠীতে ৫-এর কম) ব্যবহার করবেন না।

 সেরা অনুশীলন
- গোষ্ঠীর স্বাধীনতা নিশ্চিত করুন।
- বড় নমুনার আকার ব্যবহার করুন।
- টাইযুক্ত মান হ্যান্ডল করতে সতর্ক থাকুন।
- নন-নরমাল ডেটার ক্ষেত্রে প্রয়োগ করুন।

 সূত্র
H = (12 / (N(N + 1))) * Σ(Ri² / ni) - 3(N + 1)
যেখানে, N = মোট নমুনা সংখ্যা, Ri = ith গোষ্ঠীর র‌্যাংক যোগফল, ni = ith গোষ্ঠীর সদস্য সংখ্যা।

 ডেটার ধরন
- অর্ডিনাল বা ধারাবাহিক ডেটা

 ফলাফল ব্যাখ্যা
- উচ্চ H মান → গোষ্ঠীগুলোর মধ্যে পার্থক্য।
- p < 0.05 হলে পার্থক্য উল্লেখযোগ্য; p ≥ 0.05 হলে নয়।

 প্রয়োগ ক্ষেত্র
- তিনটি ব্র্যান্ডের সন্তুষ্টি স্কোর তুলনা।
- বিভিন্ন শিক্ষণ পদ্ধতি তুলনা।

 ভিজ্যুয়ালাইজেশন
- বক্সপ্লট
- ভায়োলিন প্লট
- মিডিয়ান র‌্যাংক বার চার্ট`,

    mannwhitney: ` ম্যান-হুইটনি ইউ টেস্ট কী?
ম্যান-হুইটনি ইউ টেস্ট একটি নন-প্যারামেট্রিক টেস্ট যা দুটি স্বাধীন গোষ্ঠীর মধ্যে পার্থক্য আছে কিনা নির্ধারণ করতে ব্যবহৃত হয়। এটি তখন ব্যবহার করা হয় যখন t-test এর জন্য প্রয়োজনীয় পূর্বধারণাগুলি পূরণ হয় না।

 কখন ব্যবহার করবেন
- দুটি স্বাধীন গোষ্ঠী তুলনা করতে।
- ডেটা অর্ডিনাল বা ধারাবাহিক কিন্তু নন-নরমাল হলে।
- গোষ্ঠীর সাইজ অসমান হলে।

 পূর্বধারণা
- স্বাধীনতা: গোষ্ঠীগুলি একে অপরের থেকে স্বাধীন হতে হবে।
- অর্ডিনাল বা ধারাবাহিক ডেটা: র‌্যাংকিং করা যায় এমন ডেটা।
- সমান বন্টনের ধরণ: মিডিয়ান তুলনার জন্য বন্টন প্রায় একরকম হওয়া উচিত।

 এটি কী করে
- দুটি গোষ্ঠীর মান একত্রে র‌্যাংক করে।
- র‌্যাংক যোগফল তুলনা করে।
- U1 ও U2 ব্যবহার করে, ছোটটিকে টেস্ট স্ট্যাট হিসেবে নেয়।

 সূত্র
U1 = n1n2 + (n1(n1 + 1))/2 − R1
U2 = n1n2 − U1

Z = (U − μU) / σU
যেখানে, μU = n1n2 / 2 এবং σU = sqrt(n1n2(n1 + n2 + 1)/12)

 ফলাফল ব্যাখ্যা
- p < 0.05 → উল্লেখযোগ্য পার্থক্য
- p ≥ 0.05 → উল্লেখযোগ্য নয়

 করণীয় ও বর্জনীয়
করণীয়:
- দুটি স্বাধীন গোষ্ঠীর জন্য ব্যবহার করুন।
- অর্ডিনাল বা নন-নরমাল ধারাবাহিক ডেটায় ব্যবহার করুন।

বর্জনীয়:
- পেয়ার্ড ডেটায় ব্যবহার করবেন না।
- শ্রেণিবিন্যাসকৃত ডেটায় ব্যবহার করবেন না।

 সেরা অনুশীলন
- বন্টন ভিজ্যুয়ালি তুলনা করুন।
- টাই হ্যান্ডল করুন।
- U ও p মানের সঙ্গে effect size রিপোর্ট করুন।

 প্রয়োগ ক্ষেত্র
- দুটি চিকিৎসা পদ্ধতির ফলাফল তুলনা।
- সন্তুষ্টির মাত্রা তুলনা।

 ভিজ্যুয়ালাইজেশন পদ্ধতি
- বক্সপ্লট
- ভায়োলিন প্লট
- র‌্যাংক প্লট`,

    spearman: `স্পিয়ারম্যান র‍্যাঙ্ক করেলেশন একটি নন-প্যারামেট্রিক টেস্ট, যা দুটি র‍্যাঙ্ককৃত ভেরিয়েবলের মধ্যে একমুখী সম্পর্কের শক্তি ও দিক নির্ধারণে ব্যবহৃত হয়। এটি পারসন করেলেশনের মতো সরলরেখা বা স্বাভাবিক বন্টনের প্রয়োজন পড়ে না।

ধারণাসমূহ:
• ডেটা হতে হবে অর্ডিনাল বা কন্টিনিউয়াস এবং র‍্যাঙ্কযোগ্য।
• ভেরিয়েবলগুলোর মধ্যে একমুখী (monotonic) সম্পর্ক থাকতে হবে।
• প্রত্যেক পর্যবেক্ষণ স্বতন্ত্র হতে হবে।

যা করা উচিত:
• একমুখী কিন্তু সরলরেখা নয় এমন ট্রেন্ড বিশ্লেষণে ব্যবহার করুন।
• র‍্যাঙ্কের জন্য টাই সঠিকভাবে হ্যান্ডল করুন।
• করেলেশন সহ p-value রিপোর্ট করুন।

যা করা উচিত নয়:
• অনিয়মিত বা একমুখী নয় এমন ডেটায় ব্যবহার করবেন না।
• টাই উপেক্ষা করবেন না অথবা কারণ নির্ধারণ করবেন না।

সেরা চর্চাসমূহ:
• অন্তত ১০–১৫ জোড়া ডেটা ব্যবহার করুন।
• সম্পর্ক অনুধাবনে ভিজ্যুয়ালাইজেশন ব্যবহার করুন।

সূত্র:
ρ = 1 - (6 * Σd²) / (n(n² - 1)), যেখানে d হলো র‍্যাঙ্কের পার্থক্য।

ফলাফল ব্যাখ্যা:
• ρ ≈ +1: শক্তিশালী ধনাত্মক সম্পর্ক
• ρ ≈ -1: শক্তিশালী ঋণাত্মক সম্পর্ক
• ρ ≈ 0: কোন সম্পর্ক নেই
• p < 0.05: পরিসংখ্যানগতভাবে গুরুত্বপূর্ণ

ব্যবহার:
• অধ্যয়নের সময় ও নম্বরের র‍্যাঙ্কের মধ্যে সম্পর্ক।
• সন্তুষ্টি ও পরিষেবার মানের মধ্যে সম্পর্ক।`,

    pearson: `পারসন করেলেশন একটি প্যারামেট্রিক টেস্ট, যা দুটি ধারাবাহিক ভেরিয়েবলের মধ্যে সরলরৈখিক সম্পর্ক নির্ধারণে ব্যবহৃত হয়। এটি স্বাভাবিক বন্টন ও সরলরেখার সম্পর্ক অনুমান করে।

ধারণাসমূহ:
• উভয় ভেরিয়েবল ধারাবাহিক হতে হবে।
• ডেটা স্বাভাবিকভাবে বণ্টিত হওয়া উচিত।
• ভেরিয়েবলগুলোর মধ্যে সম্পর্ক সরলরৈখিক হতে হবে।
• প্রত্যেক পর্যবেক্ষণ স্বতন্ত্র হওয়া উচিত।

যা করা উচিত:
• ডেটা স্বাভাবিক কিনা তা যাচাই করুন।
• সম্পর্ক সরলরৈখিক কিনা তা স্ক্যাটার প্লটে যাচাই করুন।
• করেলেশন সহ p-value রিপোর্ট করুন।

যা করা উচিত নয়:
• নন-লিনিয়ার ডেটায় ব্যবহার করবেন না।
• আউটলায়ার উপেক্ষা করবেন না বা কারণ নির্ধারণ করবেন না।

সেরা চর্চাসমূহ:
• ≥২০-৩০ নমুনার আকার ব্যবহার করুন।
• আউটলায়ার নিয়ন্ত্রণ করুন এবং স্ক্যাটার প্লটে ভিজ্যুয়ালাইজ করুন।

সূত্র:
r = cov(X, Y) / (σX * σY)

ফলাফল ব্যাখ্যা:
• r = +1: নিখুঁত ধনাত্মক সম্পর্ক
• r = -1: নিখুঁত ঋণাত্মক সম্পর্ক
• r = 0: কোনো সম্পর্ক নেই
• p < 0.05: পরিসংখ্যানগতভাবে গুরুত্বপূর্ণ

ব্যবহার:
• উচ্চতা বনাম ওজন
• তাপমাত্রা ও আইসক্রিম বিক্রির মধ্যে সম্পর্ক`,

    shapiro: `শাপিরো-উইল্ক টেস্ট কী?
শাপিরো-উইল্ক টেস্ট একটি পরিসংখ্যানগত টেস্ট যা নির্ধারণ করে যে একটি নমুনা সাধারণ বন্টন (normal distribution) থেকে এসেছে কিনা। এটি ছোট ডেটাসেটের জন্য বিশেষভাবে কার্যকর।

ধারণাসমূহ (Assumptions)
- ধারাবাহিক ডেটা: ডেটা সংখ্যাসূচক এবং ধারাবাহিক হতে হবে।
- একক গ্রুপ: এটি একাধিক গ্রুপ তুলনার জন্য নয়।

কি করবেন ও করবেন না (Do's and Don'ts)
✔️ করবেন:
- t-test বা ANOVA-এর আগে ডেটা সাধারণ কিনা যাচাই করতে ব্যবহার করুন।
- 3 থেকে 2000 অবজারভেশন বিশিষ্ট ডেটাসেটের জন্য উপযোগী।

❌ করবেন না:
- শ্রেণীবদ্ধ (categorical) বা ক্রমধারিত (ordinal) ডেটার জন্য ব্যবহার করবেন না।
- একসাথে একাধিক গ্রুপের উপর প্রয়োগ করবেন না।

কাজ করার প্রক্রিয়া:
- একটি W-স্ট্যাটিস্টিক গণনা করে, যা 1 এর কাছাকাছি হলে সাধারণ বন্টন বোঝায়।

ফলাফল বিশ্লেষণ:
- p ≥ 0.05: সাধারণ বন্টন ধরা যায় — null hypothesis প্রত্যাখ্যান করবেন না।
- p < 0.05: সাধারণ নয় — null hypothesis প্রত্যাখ্যান করুন।

ভিজ্যুয়ালাইজেশন:
- হিস্টোগ্রাম, বক্সপ্লট

ব্যবহারের ক্ষেত্র:
- পরীক্ষার স্কোর t-test প্রয়োগের আগে সাধারণ কিনা যাচাই করা।`,

    wilcoxon: `উইলকক্সন সাইনড র‍্যাঙ্ক টেস্ট কী?
উইলকক্সন সাইনড র‍্যাঙ্ক টেস্ট হল একটি নন-প্যারামেট্রিক টেস্ট, যা দুটি সম্পর্কযুক্ত নমুনার তুলনা করতে ব্যবহৃত হয়। এটি paired t-test এর বিকল্প, যখন ডেটা সাধারণ বন্টন অনুসরণ করে না।

ধারণাসমূহ (Assumptions)
- জোড়া ডেটা: প্রতিটি সাবজেক্টের দুটি সম্পর্কযুক্ত মান থাকা উচিত।
- ক্রমধারিত বা ধারাবাহিক ডেটা: পার্থক্যগুলো র‍্যাঙ্কযোগ্য হতে হবে।
- প্রতিটি জোড়া স্বাধীন হতে হবে।

কি করবেন ও করবেন না (Do's and Don'ts)
✔️ করবেন:
- সাধারণ নয় এমন paired ডেটার জন্য ব্যবহার করুন।
- W-স্ট্যাটিস্টিক এবং p-value উভয়ই রিপোর্ট করুন।

❌ করবেন না:
- স্বাধীন গ্রুপের উপর ব্যবহার করবেন না।
- শূন্য পার্থক্য বা tie উপেক্ষা করবেন না।

সেরা চর্চা (Best Practices)
- paired পার্থক্যের ভিজ্যুয়ালাইজেশন করুন (বক্সপ্লট, হিস্টোগ্রাম)।
- ন্যূনতম ৬–১০টি জোড়া ডেটা ব্যবহার করুন।

ফলাফল বিশ্লেষণ:
- p < 0.05: গুরুত্বপূর্ণ পার্থক্য আছে।
- p ≥ 0.05: গুরুত্বপূর্ণ পার্থক্য নেই।

ব্যবহার:
- চিকিৎসার পূর্ব ও পরবর্তী রক্তচাপ তুলনা।
- প্রশিক্ষণের আগে ও পরে পারফরম্যান্স পরিমাপ।

ভিজ্যুয়ালাইজেশন:
- বক্সপ্লট, লাইন প্লট, ডট প্লট (র‍্যাঙ্ক সহ)`

  }
};

export default statTestDetails;
