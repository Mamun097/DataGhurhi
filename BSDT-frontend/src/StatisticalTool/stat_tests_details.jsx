import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
const statTestDetails = {

  English: {
kruskal: (
            <>
                <h3 className="text-lg font-semibold mb-2">What is the Kruskal-Wallis Test?</h3>
                <p className="mb-4">
                    The Kruskal-Wallis test is a non-parametric statistical test used to compare three or more independent groups to determine if there are statistically significant differences between them. It is an extension of the Mann-Whitney U test and is used when the assumptions of ANOVA (such as normality) are not met.
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">Assumptions:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Independence:</strong> The groups being compared should be independent of each other.</li>
                    <li><strong>Ordinal or Continuous Data:</strong> Data should be ordinal (e.g., Likert) or continuous but not normally distributed.</li>
                    <li><strong>Similar Distribution Shapes:</strong> All groups should have similarly shaped distributions.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Do's:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Use for more than two independent groups.</li>
                    <li>Ensure sample independence.</li>
                    <li>Use when data is non-normal.</li>
                    <li>Handle ties properly in ranks.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Don'ts:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Don't use for paired data.</li>
                    <li>Don't ignore assumptions like independence.</li>
                    <li>Don't use with very small sample sizes.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Best Practices:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Ensure group independence.</li>
                    <li>Use larger samples.</li>
                    <li>Correctly handle tied values.</li>
                    <li>Use when data is not normally distributed.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Formula:</h4>
                <p className="mb-2">
                    The Kruskal-Wallis test statistic <strong>H</strong> is calculated as:-
                </p>
                <p className="font-mono bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`H = \\frac{12}{N(N+1)} \\sum_{i=1}^{k} \\frac{R_i^2}{n_i} - 3(N+1)`} />
                </p>
                <p className="mb-4">
                    Where:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>N:</strong> Total number of observations:</li>
                    <li><strong>k:</strong> Number of groups</li>
                    <li><strong>Ri:</strong> Sum of ranks in group i</li>
                    <li><strong>ni:</strong> Observations in group i</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Data Type:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Ordinal:</strong> Ranked categories</li>
                    <li><strong>Continuous:</strong> Scores, measurements, etc.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Interpretation:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Large H:</strong> Indicates likely group differences.</li>
                    <li><strong>p-value:</strong>
                        <ul className="list-disc pl-6">
                            <li><strong>p &lt; 0.05</strong>: Significant difference</li>
                            <li><strong>p ≥ 0.05</strong>: No significant difference</li>
                        </ul>
                    </li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Use Cases:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Compare satisfaction across brands.</li>
                    <li>Evaluate teaching method effectiveness.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Visualization Options:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Box Plots</li>
                    <li>Violin Plots</li>
                    <li>Median Rank Charts</li>
                </ul>
            </>
        ),  

        mannwhitney: (
            <>
                <h3 className="text-lg font-semibold mb-2">What is the Mann-Whitney U Test?</h3>
                <p className="mb-4">
                    The Mann-Whitney U test is a non-parametric statistical test used to compare two independent groups.
                    It determines whether the distributions of the two groups differ. It serves as an alternative to the
                    independent t-test when normality or equal variance assumptions are not met. Also known as the Wilcoxon rank-sum test.
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">When to Use It:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Comparing two independent groups.</li>
                    <li>Ordinal or continuous data, but not normally distributed.</li>
                    <li>Unequal sample sizes.</li>
                    <li>When normality or equal variance cannot be assumed.</li>
                </ul>

                <p className="mb-4"><strong>Example:</strong> Comparing exam scores between two teaching methods.</p>

                <h4 className="text-md font-semibold mt-4 mb-2">Assumptions:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Independence:</strong> The two groups must be independent (e.g., online vs in-person students).</li>
                    <li><strong>Ordinal or Continuous Data:</strong> Data should be rankable.</li>
                    <li><strong>Similar Distribution Shape (for medians):</strong> Ideally, distributions should be similarly shaped.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">What It Does:</h4>
                <p className="mb-4">
                Ranks all values from both groups together and compares the sum of ranks. If distributions are the same,
                the rank sums will be similar. If not, one group tends to have higher/lower ranks.
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">Formula:</h4>
                <div className="font-mono bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`U_1 = n_1 n_2 + \\frac{n_1(n_1 + 1)}{2} - R_1`} />
                </div>

                <p className="mb-4">Similarly,</p>

                <div className="font-mono bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`U_2 = n_1 n_2 - U_1`} />
                </div>

                <p className="mb-2">Use the smaller of U₁ and U₂ as the test statistic.</p>
                <p className="mb-2">If both sample sizes &gt; 20, use normal approximation:</p>

                <div className="font-mono bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`Z = \\frac{U - \\, \\mu_U}{\\sigma_U}`} />
                </div>

                <p className="mb-4">Where:</p>

                <div className="font-mono bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`\\mu_U = \\frac{n_1 n_2}{2}, \\quad \\sigma_U = \\sqrt{\\frac{n_1 n_2 (n_1 + n_2 + 1)}{12}}`} />
                </div>

                <h4 className="text-md font-semibold mt-4 mb-2">Interpretation of Results:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>U-value:</strong> Rank-based test statistic.</li>
                    <li><strong>p-value:</strong>
                        <ul className="list-disc pl-6">
                            <li><strong>p &lt; 0.05:</strong> Significant difference (reject null hypothesis).</li>
                            <li><strong>p ≥ 0.05:</strong> No significant difference (fail to reject null hypothesis).</li>
                        </ul>
                    </li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Do's:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Use for two independent groups.</li>
                    <li>Suitable for ordinal or non-normal continuous data.</li>
                    <li>Use even when sample sizes differ.</li>
                    <li>Apply when normality cannot be assumed.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Don'ts:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Don't use for paired/repeated measurements (use Wilcoxon signed-rank).</li>
                    <li>Don't use for categorical data (use Chi-square).</li>
                    <li>Don't apply to dependent groups.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Best Practices:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Use plots to inspect distributions.</li>
                    <li>Handle ties properly when ranking.</li>
                    <li>Report effect size with U and p-values.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Use Cases:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Compare recovery time from two treatments.</li>
                    <li>Compare test scores between two schools.</li>
                    <li>Compare satisfaction across gender groups.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Visualization Methods:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Boxplots:</strong> Compare medians and spread.</li>
                    <li><strong>Violin Plots:</strong> Show distribution shape and density.</li>
                    <li><strong>Rank Plots:</strong> Show ranked values across groups.</li>
                </ul>
            </>
        ),

        wilcoxon: (
            <>
                <h3 className="text-lg font-semibold mb-2">What is the Wilcoxon Signed-Rank Test?</h3>
                <p className="mb-4">
                    The Wilcoxon Signed-Rank Test is a non-parametric test used to compare two related samples or repeated measurements on a single sample. It evaluates whether their population mean ranks differ. It is the non-parametric alternative to the paired t-test and is especially useful when the assumption of normality is violated.
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">Assumptions:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Paired Data:</strong> Observations must be in pairs, such as before-and-after measurements.</li>
                    <li><strong>Ordinal or Continuous Data:</strong> Differences between paired observations should be ordinal or continuous.</li>
                    <li><strong>Symmetry of Differences (Optional):</strong> Ideally, the distribution of differences should be symmetric.</li>
                    <li><strong>Independence Within Pairs:</strong> Each observation pair should be independent from others.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Do's:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Use for paired or matched samples.</li>
                    <li>Use when data is not normally distributed.</li>
                    <li>Rank absolute differences only (ignore signs initially).</li>
                    <li>Report both the W-statistic and the p-value.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Don'ts:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Don’t use for independent groups (use Mann–Whitney U instead).</li>
                    <li>Don’t use with nominal data.</li>
                    <li>Don’t ignore ties or zero differences — treat them correctly.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Best Practices:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Visualize paired differences (e.g., histogram or boxplot).</li>
                    <li>Check for symmetry in differences.</li>
                    <li>Use a sample size of at least 6–10 pairs.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Formula:</h4>
                <p className="mb-2">
                    Given <em>n</em> pairs of observations, compute the difference <em>d<sub>i</sub> = x<sub>i</sub> - y<sub>i</sub></em>, then:
                </p>
                <ol className="list-decimal pl-6 mb-4 space-y-1">
                    <li>Remove pairs with <em>d<sub>i</sub> = 0</em>.</li>
                    <li>Rank the absolute differences <em>|d<sub>i</sub>|</em> from smallest to largest, assigning average ranks for ties.</li>
                    <li>Assign the sign of <em>d<sub>i</sub></em> to its corresponding rank.</li>
                    <li>Let <em>W<sub>+</sub></em> be the sum of ranks for positive differences, <em>W<sub>-</sub></em> for negative differences.</li>
                </ol>
                <p className="mb-4">The test statistic <strong>W</strong> is the smaller of <em>W<sub>+</sub></em> and <em>W<sub>-</sub></em>.</p>

                <h4 className="text-md font-semibold mt-4 mb-2">Data Types:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Ordinal Data:</strong> Rankable data with meaningful order but unknown spacing.</li>
                    <li><strong>Continuous Data:</strong> Numerical measurements like test scores or blood pressure.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Interpretation of Results:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>W-Statistic:</strong> Calculated from the signed ranks.</li>
                    <li><strong>p-value:</strong>
                    <ul className="list-disc pl-6">
                        <li><strong>p &lt; 0.05:</strong> Significant difference — reject null hypothesis.</li>
                        <li><strong>p ≥ 0.05:</strong> No significant difference — fail to reject null hypothesis.</li>
                    </ul>
                    </li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Use Cases:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Comparing pre- and post-intervention outcomes.</li>
                    <li>Measuring effect of a treatment within the same group.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Example Scenarios:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Pre- and Post-Test Scores:</strong> If p = 0.02, it indicates significant improvement.</li>
                    <li><strong>Blood Pressure Before and After Treatment:</strong> If p = 0.001, it confirms a significant treatment impact.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Visualization Methods:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Histogram of Differences:</strong> Visualizes the distribution of paired differences.</li>
                    <li><strong>Boxplot of Differences:</strong> Shows median, spread, and potential outliers.</li>
                    <li><strong>Line Plot of Paired Observations:</strong> Helps visualize individual before-and-after changes.</li>
                    <li><strong>Dot Plot of Ranks:</strong> Useful for visualizing signed rank values.</li>
                </ul>
            </>
        ),

        pearson:(            
            <>
                <h3 className="text-lg font-semibold mb-2">What is Pearson Correlation?</h3>
                <p className="mb-4">
                    Pearson Correlation is a parametric statistical measure used to determine the strength and direction of a linear relationship between two continuous variables. It assumes that the data is normally distributed and the relationship between variables is linear.
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">Assumptions:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Continuous Data:</strong> Both variables should be continuous. (e.g., Heights and Weights)</li>
                    <li><strong>Linear Relationship:</strong> The relationship between variables should be linear. (e.g., Study time and exam scores)</li>
                    <li><strong>Normality:</strong> Both variables should be normally distributed.</li>
                    <li><strong>Independence:</strong> Each observation pair must be independent.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Do's:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Check data normality before applying Pearson.</li>
                    <li>Confirm linearity using scatter plots.</li>
                    <li>Report correlation coefficient (r) and p-value.</li>
                    <li>Use with sample sizes of 20–30 or more.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Don'ts:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Don't use for non-linear relationships.</li>
                    <li>Don't ignore outliers.</li>
                    <li>Don't infer causation from correlation.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Best Practices:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Verify independence of observations.</li>
                    <li>Detect and manage outliers carefully.</li>
                    <li>Use scatter plots to assess linearity visually.</li>
                    <li>Interpret results in context, not just by numbers.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Formula:</h4>
                <p className="mb-2">The Pearson correlation coefficient <strong>r</strong> is calculated as:</p>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`r = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}`} />
                </div>
                <p className="mb-2">Alternatively:</p>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`r = \\frac{\\text{cov}(X, Y)}{\\sigma_X \\sigma_Y}`} />
                </div>

                <h4 className="text-md font-semibold mt-4 mb-2">Data Type:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Continuous:</strong> Age, income, height, etc.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Interpretation:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>r = +1:</strong> Perfect positive linear relationship</li>
                    <li><strong>r = -1:</strong> Perfect negative linear relationship</li>
                    <li><strong>r = 0:</strong> No linear relationship</li>
                    <li><strong>p-value:</strong>
                        <ul className="list-disc pl-6">
                            <li><strong>p &lt; 0.05:</strong> Significant correlation</li>
                            <li><strong>p ≥ 0.05:</strong> No significant correlation</li>
                        </ul>
                    </li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Use Cases:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Relationship between height and weight</li>
                    <li>Temperature vs. Ice Cream Sales</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Visualization:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Heatmap of Pearson Correlation Coefficients</li>
                </ul>
            </>        
        ),

        spearman: (
            <>
                <h3 className="text-lg font-semibold mb-2">What is Spearman Rank Correlation?</h3>
                <p className="mb-4">
                    Spearman Rank Correlation is a non-parametric test that measures the strength and direction of association between two ranked variables. It is useful for monotonic relationships, even if the data isn’t normally distributed.
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">Assumptions:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Ordinal or Continuous Data:</strong> Variables should be rankable (e.g., exam scores, satisfaction levels).</li>
                    <li><strong>Monotonic Relationship:</strong> Values should increase or decrease consistently.</li>
                    <li><strong>Independence:</strong> Each observation pair should be independent.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Do's:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Use for monotonic but non-linear trends.</li>
                    <li>Rank data and handle ties properly.</li>
                    <li>Verify assumptions before applying the test.</li>
                    <li>Report both coefficient and p-value.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Don'ts:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Don’t use for non-monotonic data.</li>
                    <li>Don’t ignore ties.</li>
                    <li>Don’t assume correlation implies causation.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Best Practices:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Ensure data independence.</li>
                    <li>Use average ranks for ties.</li>
                    <li>Interpret correlation with context.</li>
                    <li>Use at least 10–15 data pairs.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Formula:</h4>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`\\rho = 1 - \\frac{6 \\sum d_i^2}{n(n^2 - 1)}`} />
                </div>
                <p className="mb-4">Where:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>d<sub>i</sub>:</strong> Difference between paired ranks</li>
                    <li><strong>n:</strong> Number of observations</li>
                </ul>
                <p className="mb-4">For tied ranks:</p>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`\\rho = \\frac{\\text{cov}(\\text{rank}(X), \\text{rank}(Y))}{\\sigma_{\\text{rank}(X)} \\sigma_{\\text{rank}(Y)}}`} />
                </div>

                <h4 className="text-md font-semibold mt-4 mb-2">Data Types:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Ordinal:</strong> Ranked categories (e.g., Likert scale).</li>
                    <li><strong>Continuous:</strong> Measurable quantities that can be ranked.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Interpretation:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>ρ = +1:</strong> Perfect positive monotonic relationship</li>
                    <li><strong>ρ = -1:</strong> Perfect negative monotonic relationship</li>
                    <li><strong>ρ = 0:</strong> No monotonic relationship</li>
                    <li><strong>p-value:</strong>
                        <ul className="list-disc pl-6">
                            <li><strong>p &lt; 0.05:</strong> Statistically significant</li>
                            <li><strong>p ≥ 0.05:</strong> Not significant</li>
                        </ul>
                    </li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Use Cases:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Ranked data comparisons</li>
                    <li>Study hours vs. exam ranks</li>
                    <li>Satisfaction vs. service quality</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Visualization:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Correlation heatmaps</li>
                </ul>

                <hr className="my-6" />
            </>        
        ),    

        shapiro: (
            <>
                <h3 className="text-lg font-semibold mb-2">What is the Shapiro-Wilk Test?</h3>
                <p className="mb-4">
                    The Shapiro-Wilk test checks if a sample comes from a normally distributed population. It works best for small sample sizes (less than 50), but is still valid for larger datasets.
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">Assumptions:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Continuous Data:</strong> The data must be continuous, not categorical.</li>
                    <li><strong>Single Group:</strong> The data should represent one group only.</li>
                    <li><strong>Testing Normality:</strong> The purpose must be to test for normality.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Do's:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Use for testing normality before parametric tests like t-test or ANOVA.</li>
                    <li>Best for sample sizes between 3 to 2000.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Don'ts:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Don’t use with categorical or ordinal data.</li>
                    <li>Don’t combine groups; test each group separately.</li>
                    <li>Don’t rely solely on this test — use visualizations too.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">How It Works:</h4>
                <p className="mb-4">
                    It calculates a W-statistic measuring how close your data is to a normal distribution. A W value near 1 suggests normality.
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">Formula:</h4>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`W = \\frac{\\left( \\sum_{i=1}^n a_i x_{(i)} \\right)^2}{\\sum_{i=1}^n (x_i - \\bar{x})^2}`} />
                </div>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>x<sub>(i)</sub>:</strong> i-th ordered value (sorted)</li>
                    <li><strong>ȳ:</strong> Sample mean</li>
                    <li><strong>a<sub>i</sub>:</strong> Constant from normal distribution expectations</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Interpretation:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>p ≥ 0.05:</strong> Data likely normal (fail to reject null)</li>
                    <li><strong>p &lt; 0.05:</strong> Data is not normal (reject null)</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Use Case:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Check if test scores follow normal distribution before applying t-test or ANOVA</li>
                    <li>If not normal: use Mann-Whitney U or Kruskal-Wallis instead</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Visualization Methods:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Histogram:</strong> To see if data looks bell-shaped</li>
                    <li><strong>Boxplot:</strong> Shows skewness and outliers</li>
                </ul>
            </>
        ),

        fzt: (
            <>
                <h3 className="text-lg font-semibold mb-2">What are the F, Z, and T Tests?</h3>
                <p className="mb-4">
                    These are classical parametric tests used to analyze differences in means and variances, often under the assumption of normality.
                </p>

                {/* F Test */}
                <h4 className="text-md font-semibold mt-4 mb-2">F Test:</h4>
                <p className="mb-4">Used to compare two population variances.</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Assumes normality and continuous data.</li>
                    <li>Used to assess equality of variances before t-tests.</li>
                    <li><strong>Formula:</strong> <BlockMath math={`F = \\frac{s_1^2}{s_2^2}`} /></li>
                </ul>

                {/* Z Test */}
                <h4 className="text-md font-semibold mt-4 mb-2">Z Test:</h4>
                <p className="mb-4">Compares a sample mean to a population mean when population variance is known.</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Assumes large sample size and known variance.</li>
                    <li><strong>Formula:</strong> <BlockMath math={`Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}}`} /></li>
                </ul>

                {/* T Test */}
                <h4 className="text-md font-semibold mt-4 mb-2">T Test:</h4>
                <p className="mb-4">Assesses if the means of two groups are statistically different when variance is unknown.</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Variants: one-sample, two-sample, and paired.</li>
                    <li><strong>One-sample:</strong> <BlockMath math={`t = \\frac{\\bar{X} - \\mu}{s / \\sqrt{n}}`} /></li>
                    <li><strong>Two-sample (pooled):</strong> <BlockMath math={`t = \\frac{\\bar{X}_1 - \\bar{X}_2}{\\sqrt{s_p^2 (1/n_1 + 1/n_2)}}, s_p^2 = \\frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1+n_2-2}`} /></li>
                    <li><strong>Paired:</strong> <BlockMath math={`t = \\frac{\\bar{D}}{s_D / \\sqrt{n}}`} /></li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Use Cases:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>F Test:</strong> Blood pressure variability by gender</li>
                    <li><strong>Z Test:</strong> SAT score vs national average</li>
                    <li><strong>T Test:</strong> Pre/post intervention test scores</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Visualization Options:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Boxplots</li>
                    <li>Density/Normal curves</li>
                    <li>Error bars</li>
                </ul>
            </>
        ),    
        
        linear_regression: (
            <>
                <h3 className="text-lg font-semibold mb-2">What is Linear Regression?</h3>
                <p className="mb-4">
                    Linear Regression is a statistical technique to model the relationship between a dependent variable and one or more independent variables by fitting a linear equation.
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">Use Cases:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Predict one variable using another (e.g., house price from size).</li>
                    <li>Forecast trends.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Data Types:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Dependent Variable:</strong> Continuous</li>
                    <li><strong>Independent Variables:</strong> Continuous or binary</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Data Processing:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Handle missing values and outliers.</li>
                    <li>Standardize variables if on different scales.</li>
                    <li>Optionally transform variables (e.g., log).</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Formula:</h4>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`Y = \\beta_0 + \\beta_1 X + \\varepsilon`} />
                </div>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Y:</strong> Dependent variable</li>
                    <li><strong>X:</strong> Independent variable</li>
                    <li><strong>&#946;<sub>0</sub>:</strong> Intercept</li>
                    <li><strong>&#946;<sub>1</sub>:</strong> Slope</li>
                    <li><strong>&#949;:</strong> Error term</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Assumptions:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Linearity:</strong> Relationship is linear.</li>
                    <li><strong>Independence:</strong> Residuals are independent.</li>
                    <li><strong>Homoscedasticity:</strong> Constant error variance.</li>
                    <li><strong>Normality of residuals:</strong> Residuals should follow a normal distribution.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Visualization Methods:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Scatterplot with regression line</li>
                    <li>Residual plot</li>
                    <li>Histogram of residuals</li>
                    <li>Q-Q plot of residuals</li>
                </ul>
            </>
        ),        

        anova: (
            <>
                <h3 className="text-lg font-semibold mb-2">What is ANOVA (Analysis of Variance)?</h3>
                <p className="mb-4">
                    ANOVA tests whether there are statistically significant differences between the means of three or more independent groups.
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">Use Cases:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Compare means across multiple categories.</li>
                    <li>Example: Test scores under different teaching methods.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Data Types:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Dependent Variable:</strong> Continuous</li>
                    <li><strong>Independent Variable:</strong> Categorical with 3+ levels</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Formula:</h4>
                <p className="font-mono bg-gray-100 p-2 rounded mb-2">
                    Total Sum of Squares (SST):<br />
                    <BlockMath math={`SST = \\sum (Y_{ij} - \\bar{Y})^2`} />
                </p>
                <p className="font-mono bg-gray-100 p-2 rounded mb-2">
                    Between-group Sum of Squares (SSB):<br />
                    <BlockMath math={`SSB = \\sum n_j (\\bar{Y}_j - \\bar{Y})^2`} />
                </p>
                <p className="font-mono bg-gray-100 p-2 rounded mb-4">
                    Within-group Sum of Squares (SSW):<br />
                    <BlockMath math={`SSW = \\sum (Y_{ij} - \\bar{Y}_j)^2`} />
                    <br />
                    F-statistic:<br />
                    <BlockMath math={`F = \\frac{MSB}{MSW} = \\frac{SSB/(k-1)}{SSW/(N-k)}`} />
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">Assumptions:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Normality in each group</li>
                    <li>Homogeneity of variance</li>
                    <li>Independence of observations</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Visualization Methods:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Boxplots or violin plots</li>
                    <li>Error bar plots (mean ± SE)</li>
                    <li>Residual plots</li>
                </ul>
            </>
        ),

        ancova: (
            <>
                <h3 className="text-lg font-semibold mb-2">What is ANCOVA (Analysis of Covariance)?</h3>
                <p className="mb-4">
                    ANCOVA combines regression and ANOVA to compare group means while adjusting for one or more continuous covariates.
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">Use Cases:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Compare group means adjusting for a covariate.</li>
                    <li>Example: Exam scores by teaching method controlling for GPA.</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Data Types:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Dependent Variable:</strong> Continuous</li>
                    <li><strong>Independent Variable:</strong> Categorical</li>
                    <li><strong>Covariate:</strong> Continuous</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Formula:</h4>
                <p className="mb-4">General model:</p>
                <p className="font-mono bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`Y_{ij} = \\mu + \\tau_i + \\beta (X_{ij} - \\bar{X}) + \\varepsilon_{ij}`}/>
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Y<sub>ij</sub>:</strong> Dependent variable for subject <em>j</em> in group <em>i</em></li>
                    <li><strong>μ:</strong> Overall mean</li>
                    <li><strong>τ<sub>i</sub>:</strong> Effect of group <em>i</em></li>
                    <li><strong>β:</strong> Regression coefficient for covariate <em>X</em></li>
                    <li><strong>ε<sub>ij</sub>:</strong> Error term</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Assumptions:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Linearity between covariate and dependent variable</li>
                    <li>Homogeneity of regression slopes</li>
                    <li>Normality and homoscedasticity</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">Visualization Methods:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Interaction plots</li>
                    <li>Adjusted means plots</li>
                    <li>Scatterplots with regression lines for each group</li>
                </ul>
            </>
        ),

  },

  বাংলা: {
    kruskal: (
            <>
                <h3 className="text-lg font-semibold mb-2">ক্রুসকাল-ওয়ালিস টেস্ট কী?</h3>
                <p className="mb-4">
                    ক্রুসকাল-ওয়ালিস টেস্ট একটি নন-প্যারামেট্রিক পরিসংখ্যানিক পরীক্ষা, যা তিন বা ততোধিক স্বতন্ত্র গ্রুপের মধ্যে গুরুত্বপূর্ণ পার্থক্য আছে কি না তা নির্ধারণ করতে ব্যবহৃত হয়। এটি Mann-Whitney U টেস্টের একটি বিস্তৃত রূপ এবং তখন ব্যবহৃত হয় যখন ANOVA-এর ধরণগত অনুমান (যেমন স্বাভাবিক বণ্টন) পূরণ না হয়।
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">ধারণাসমূহ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>স্বাধীনতা:</strong> প্রতিটি গ্রুপ পরস্পর থেকে স্বাধীন হওয়া উচিত।</li>
                    <li><strong>ক্রমবিন্যস্ত বা ধারা তথ্য:</strong> তথ্য ক্রমবিন্যস্ত (যেমন লাইকার্ট স্কেল) বা ধারাবাহিক কিন্তু স্বাভাবিকভাবে বণ্টিত নয়।</li>
                    <li><strong>একই রকম বণ্টনের আকার:</strong> সব গ্রুপের বণ্টনের আকৃতি প্রায় একই হওয়া উচিত।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">যা করবেন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>তিন বা ততোধিক স্বতন্ত্র গ্রুপের তুলনার জন্য ব্যবহার করুন।</li>
                    <li>নমুনার স্বাধীনতা নিশ্চিত করুন।</li>
                    <li>যখন তথ্য স্বাভাবিক নয়, তখন এটি ব্যবহার করুন।</li>
                    <li>র‍্যাঙ্ক সঠিকভাবে নির্ধারণ করুন এবং টাইগুলি যত্নসহকারে পরিচালনা করুন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">যা করবেন না:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>জোড়া তথ্য (paired data) বিশ্লেষণে ব্যবহার করবেন না।</li>
                    <li>স্বাধীনতা বা বণ্টনের আকৃতি সংক্রান্ত অনুমান উপেক্ষা করবেন না।</li>
                    <li>খুব ছোট স্যাম্পল সাইজ (যেমন প্রতি গ্রুপে ৫-এর কম) ব্যবহার করবেন না।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সেরা চর্চাসমূহ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>গ্রুপের স্বাধীনতা নিশ্চিত করুন।</li>
                    <li>বৃহৎ স্যাম্পল ব্যবহার করুন।</li>
                    <li>টাই মানগুলি যথাযথভাবে পরিচালনা করুন।</li>
                    <li>স্বাভাবিক নয় এমন তথ্যের ক্ষেত্রে এটি ব্যবহার করুন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সূত্র:</h4>
                <p className="mb-2">
                    ক্রুসকাল-ওয়ালিস পরিসংখ্যান <strong>H</strong> হিসাব করা হয় এই সূত্রে:
                </p>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`H = \\frac{12}{N(N+1)} \\sum_{i=1}^{k} \\frac{R_i^2}{n_i} - 3(N+1)`} />
                </div>
                <p className="mb-4">যেখানে:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>N:</strong> মোট পর্যবেক্ষণের সংখ্যা</li>
                    <li><strong>k:</strong> গ্রুপের সংখ্যা</li>
                    <li><strong>R<sub>i</sub>:</strong> i-তম গ্রুপের র‍্যাঙ্কের যোগফল</li>
                    <li><strong>n<sub>i</sub>:</strong> i-তম গ্রুপে পর্যবেক্ষণের সংখ্যা</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">তথ্যের ধরন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>ক্রমবিন্যস্ত (Ordinal):</strong> প্রাকৃতিক ক্রম রয়েছে এমন তথ্য</li>
                    <li><strong>ধারাবাহিক (Continuous):</strong> একটি নিরবচ্ছিন্ন মানের পরিসীমা</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ফলাফল বিশ্লেষণ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>H এর মান বেশি:</strong> গ্রুপগুলোর মধ্যে পার্থক্যের ইঙ্গিত দেয়।</li>
                    <li><strong>p-মূল্য:</strong>
                        <ul className="list-disc pl-6">
                            <li><strong>p &lt; 0.05:</strong> গুরুত্বপূর্ণ পার্থক্য রয়েছে</li>
                            <li><strong>p ≥ 0.05:</strong> গুরুত্বপূর্ণ পার্থক্য নেই</li>
                        </ul>
                    </li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ব্যবহারক্ষেত্র:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>বিভিন্ন ব্র্যান্ডের গ্রাহক সন্তুষ্টি তুলনা।</li>
                    <li>বিভিন্ন শিক্ষাদান পদ্ধতির কার্যকারিতা বিশ্লেষণ।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ভিজ্যুয়ালাইজেশন পদ্ধতি:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>বক্স প্লট</li>
                    <li>ভায়োলিন প্লট</li>
                    <li>মিডিয়ান র‍্যাঙ্ক বার চার্ট</li>
                </ul>
            </>
        ),

        mannwhitney: (
            <>
                <h3 className="text-lg font-semibold mb-2">ম্যান–হুইটনি ইউ টেস্ট কী?</h3>
                <p className="mb-4">
                    ম্যান–হুইটনি ইউ টেস্ট একটি নন-প্যারামেট্রিক পরিসংখ্যানিক পদ্ধতি, যা দুটি স্বাধীন দলের মধ্যে পার্থক্য নির্ধারণে ব্যবহৃত হয়। এটি সাধারণত টেস্ট স্কোর, র‍্যাংক বা পরিমাপযোগ্য তথ্য বিশ্লেষণে ব্যবহৃত হয় যখন t-test এর শর্তাবলী পূরণ হয় না।
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">ব্যবহারের উপযোগিতা:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>দুটি স্বাধীন দলের তুলনা করতে চাইলে।</li>
                    <li>ডেটা যদি র‍্যাংকযোগ্য হয় (অর্ডিনাল বা নন-নরমাল কনটিনিউয়াস)।</li>
                    <li>নমুনার আকার অসমান হলে।</li>
                    <li>নরমাল ডিস্ট্রিবিউশন বা সমান ভ্যারিয়েন্স ধরে নেয়া না গেলে।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">উদাহরণ:</h4>
                <p className="mb-4">দুটি শিক্ষাপদ্ধতির উপর পরীক্ষার স্কোর তুলনা।</p>

                <h4 className="text-md font-semibold mt-4 mb-2">ধারণাসমূহ (Assumptions):</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>স্বাধীনতা:</strong> দুটি দল স্বাধীন হতে হবে। যেমন: অনলাইন বনাম অফলাইন শিক্ষার্থী।</li>
                    <li><strong>অর্ডিনাল/নন-নরমাল কনটিনিউয়াস ডেটা:</strong> শ্রেণিবিন্যাসযোগ্য ডেটা হওয়া উচিত।</li>
                    <li><strong>একই রূপের বিতরণ (মেডিয়ান তুলনার জন্য):</strong> উভয় দলের ডিস্ট্রিবিউশন একই ধরনের হওয়া ভালো।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">এটি কীভাবে কাজ করে:</h4>
                <p className="mb-4">উভয় দলের সকল মানকে একত্রে র‍্যাংক করা হয় এবং তারপর প্রতিটি দলের র‍্যাংকের যোগফল গণনা করা হয়। দুটি দলের মধ্যে যদি পার্থক্য থাকে, তবে র‍্যাংকগুলির যোগফলে পার্থক্য পরিলক্ষিত হয়।</p>

                <div className="font-mono bg-gray-100 p-2 rounded mb-4">
                <BlockMath math={`U_1 = n_1 n_2 + \\frac{n_1(n_1 + 1)}{2} - R_1`} />
                </div>

                <p className="mb-4">অনুরূপভাবে,</p>

                <div className="font-mono bg-gray-100 p-2 rounded mb-4">
                <BlockMath math={`U_2 = n_1 n_2 - U_1`} />
                </div>

                <p className="mb-2">U₁ এবং U₂-এর মধ্যে যেটি ছোট, সেটিকে টেস্ট পরিসংখ্যান হিসেবে ব্যবহার করুন।</p>
                <p className="mb-2">যদি উভয় স্যাম্পলের সাইজ ২০-এর বেশি হয়, তাহলে স্বাভাবিক অনুমান (normal approximation) ব্যবহার করুন:</p>

                <div className="font-mono bg-gray-100 p-2 rounded mb-4">
                <BlockMath math={`Z = \\frac{U - \\, \\mu_U}{\\sigma_U}`} />
                </div>

                <p className="mb-4">যেখানে:</p>

                <div className="font-mono bg-gray-100 p-2 rounded mb-4">
                <BlockMath math={`\\mu_U = \\frac{n_1 n_2}{2}, \\quad \\sigma_U = \\sqrt{\\frac{n_1 n_2 (n_1 + n_2 + 1)}{12}}`} />
                </div>


                <h4 className="text-md font-semibold mt-4 mb-2">ফলাফলের ব্যাখ্যা:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>U-মান:</strong> র‍্যাংকের উপর ভিত্তি করে টেস্ট স্ট্যাটিস্টিক।</li>
                    <li><strong>p-মূল্য:</strong>
                        <ul className="list-disc pl-6">
                            <li><strong>p &lt; 0.05:</strong> তাৎপর্যপূর্ণ পার্থক্য — শূন্য অনুমান প্রত্যাখ্যান।</li>
                            <li><strong>p ≥ 0.05:</strong> পার্থক্য নেই — শূন্য অনুমান গ্রহণ।</li>
                        </ul>
                    </li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">করণীয়:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>দুটি স্বাধীন দলের জন্য ব্যবহার করুন।</li>
                    <li>অর্ডিনাল বা নন-নরমাল কনটিনিউয়াস ডেটার জন্য উপযোগী।</li>
                    <li>অসমান নমুনা সাইজেও কার্যকর।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">বর্জনীয়:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>যুগ্ম/রিপিটেড মেজারমেন্টের জন্য ব্যবহার করবেন না (Wilcoxon ব্যবহার করুন)।</li>
                    <li>ক্যাটেগোরিকাল ডেটার জন্য ব্যবহার করবেন না (Chi-square ব্যবহার করুন)।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সেরা চর্চা:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>ভিজ্যুয়ালাইজেশন ব্যবহার করে ডেটা বিশ্লেষণ করুন।</li>
                    <li>টাইড মানগুলোর যত্ন নিন।</li>
                    <li>U এবং p-মূল্যের সাথে এফেক্ট সাইজ রিপোর্ট করুন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ব্যবহারের উদাহরণ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>দুটি চিকিৎসা পদ্ধতির পুনরুদ্ধার সময় তুলনা।</li>
                    <li>দুটি স্কুলের পরীক্ষার ফলাফল তুলনা।</li>
                    <li>লিঙ্গভিত্তিক সন্তুষ্টি স্তর বিশ্লেষণ।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ভিজ্যুয়ালাইজেশন পদ্ধতি:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>বক্সপ্লট</li>
                    <li>ভায়োলিন প্লট</li>
                    <li>র‍্যাংক প্লট</li>
                </ul>
            </>
        ),

        wilcoxon: (

            <>
                <h3 className="text-lg font-semibold mb-2">উইলকক্সন সাইনড-র‍্যাঙ্ক টেস্ট কী?</h3>
                <p className="mb-4">
                    উইলকক্সন সাইনড-র‍্যাঙ্ক টেস্ট একটি নন-প্যারামেট্রিক টেস্ট যা দুটি সম্পর্কযুক্ত নমুনা বা একটি নমুনার পুনরাবৃত্তি পরিমাপের তুলনা করতে ব্যবহৃত হয়। এটি তাদের গড় র‍্যাঙ্কে পার্থক্য আছে কিনা তা মূল্যায়ন করে। এটি পেয়ার্ড টি-টেস্টের একটি বিকল্প এবং তখনই বেশি উপযুক্ত যখন ডেটার স্বাভাবিকতা অনুমান খাটে না।
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">ধারণাসমূহ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>পেয়ার্ড ডেটা:</strong> পর্যবেক্ষণগুলো জোড়ায় হতে হবে, যেমন আগে এবং পরে মাপা হয়েছে এমন ডেটা।</li>
                    <li><strong>ক্রমিক বা অবিচ্ছিন্ন ডেটা:</strong> জোড়া ডেটার মধ্যে পার্থক্য ক্রমিক বা অবিচ্ছিন্ন হতে হবে।</li>
                    <li><strong>পার্থক্যের সিমেট্রি (ঐচ্ছিক):</strong> পার্থক্যের বিতরণ আদর্শভাবে সিমেট্রিক হওয়া উচিত।</li>
                    <li><strong>জোড়ার ভিতরে স্বতন্ত্রতা:</strong> প্রতিটি পর্যবেক্ষণ জোড়া অন্যদের থেকে স্বতন্ত্র হওয়া উচিত।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">যা করবেন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>পেয়ার্ড বা ম্যাচড নমুনার জন্য ব্যবহার করুন।</li>
                    <li>যখন ডেটা স্বাভাবিকভাবে বিতরণ নয় তখন ব্যবহার করুন।</li>
                    <li>শুধুমাত্র পার্থক্যের মান র‍্যাঙ্ক করুন (শুরুর সাইন উপেক্ষা করুন)।</li>
                    <li>W-স্ট্যাটিস্টিক এবং p-ভ্যালু উভয়ই রিপোর্ট করুন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">যা করবেন না:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>স্বতন্ত্র গ্রুপের জন্য ব্যবহার করবেন না (এর পরিবর্তে Mann–Whitney U ব্যবহার করুন)।</li>
                    <li>নামমাত্র ডেটার জন্য ব্যবহার করবেন না।</li>
                    <li>টাই বা শূন্য পার্থক্য উপেক্ষা করবেন না — সঠিকভাবে পরিচালনা করুন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সেরা অনুশীলন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>পেয়ার্ড পার্থক্যের ভিজুয়ালাইজ করুন (যেমন: হিস্টোগ্রাম বা বক্সপ্লট)।</li>
                    <li>পার্থক্যে সিমেট্রি পরীক্ষা করুন।</li>
                    <li>কমপক্ষে ৬–১০ জোড়া নমুনা ব্যবহার করুন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সূত্র:</h4>
                <p className="mb-2">
                    <em>n</em> সংখ্যক জোড়া পর্যবেক্ষণ দেওয়া হলে, পার্থক্য নির্ণয় করুন <em>d<sub>i</sub> = x<sub>i</sub> - y<sub>i</sub></em>, এরপর:
                </p>
                <ol className="list-decimal pl-6 mb-4 space-y-1">
                    <li><em>d<sub>i</sub> = 0</em> এমন জোড়াগুলো বাদ দিন।</li>
                    <li>পূর্ণমান পার্থক্যগুলো <em>|d<sub>i</sub>|</em> ছোট থেকে বড় অনুযায়ী র‍্যাঙ্ক করুন, টাই থাকলে গড় র‍্যাঙ্ক দিন।</li>
                    <li><em>d<sub>i</sub></em> এর সাইন তার সংশ্লিষ্ট র‍্যাঙ্কে দিন।</li>
                    <li><em>W<sub>+</sub></em> হচ্ছে ধনাত্মক পার্থক্যের র‍্যাঙ্কের যোগফল, <em>W<sub>-</sub></em> ঋণাত্মক পার্থক্যের।</li>
                </ol>
                <p className="mb-4">পরীক্ষার পরিসংখ্যান <strong>W</strong> হল <em>W<sub>+</sub></em> এবং <em>W<sub>-</sub></em> এর মধ্যে ক্ষুদ্রতমটি।</p>

                <h4 className="text-md font-semibold mt-4 mb-2">ডেটার ধরন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>ক্রমিক ডেটা:</strong> যার অর্থপূর্ণ ক্রম আছে কিন্তু দূরত্ব অজানা।</li>
                    <li><strong>অবিচ্ছিন্ন ডেটা:</strong> যেমন পরীক্ষার স্কোর বা রক্তচাপের মাপ।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ফলাফল ব্যাখ্যা:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>W-স্ট্যাটিস্টিক:</strong> সাইনড র‍্যাঙ্ক থেকে হিসাব করা।</li>
                    <li><strong>p-ভ্যালু:</strong>
                    <ul className="list-disc pl-6">
                        <li><strong>p &lt; 0.05:</strong> গুরুত্বপূর্ণ পার্থক্য — শূন্য অনুমান বাতিল করুন।</li>
                        <li><strong>p ≥ 0.05:</strong> গুরুত্বপূর্ণ নয় — শূন্য অনুমান গ্রহণযোগ্য।</li>
                    </ul>
                    </li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ব্যবহারের ক্ষেত্র:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>হস্তক্ষেপের আগে-পরে ফলাফল তুলনা।</li>
                    <li>একই গ্রুপের ভিতরে চিকিৎসার প্রভাব নির্ণয়।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">উদাহরণ পরিস্থিতি:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>পরীক্ষার আগে-পরে স্কোর:</strong> যদি p = 0.02 হয়, তবে এটি গুরুত্বপূর্ণ উন্নয়ন নির্দেশ করে।</li>
                    <li><strong>চিকিৎসার আগে-পরে রক্তচাপ:</strong> যদি p = 0.001 হয়, তবে এটি গুরুত্বপূর্ণ প্রভাব নির্দেশ করে।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ভিজুয়ালাইজেশন পদ্ধতি:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>পার্থক্যের হিস্টোগ্রাম:</strong> জোড়া পার্থক্যের বিতরণ দেখায়।</li>
                    <li><strong>বক্সপ্লট:</strong> মধ্যমা, বিস্তার ও সম্ভাব্য আউটলাইয়ার দেখায়।</li>
                    <li><strong>লাইন প্লট:</strong> ব্যক্তি পর্যবেক্ষণের আগে-পরে পরিবর্তন দেখায়।</li>
                    <li><strong>ডট প্লট:</strong> সাইনড র‍্যাঙ্ক মান ভিজুয়ালাইজ করতে উপযোগী।</li>
                </ul>
            </>
         ),
            
        pearson:(            
            <>         
                <h3 className="text-lg font-semibold mb-2 mt-10">পিয়ারসন সম্পর্ক বিশ্লেষণ কী?</h3>
                <p className="mb-4">
                    পিয়ারসন সম্পর্ক একটি প্যারামেট্রিক পরিসংখ্যানিক পদ্ধতি যা দুটি ধারাবাহিক ভেরিয়েবলের মধ্যে সরলরেখার সম্পর্কের শক্তি এবং দিক নির্ধারণে ব্যবহৃত হয়। এটি ধরে নেয় যে তথ্য স্বাভাবিকভাবে বিতরণকৃত এবং সম্পর্কটি রৈখিক।
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">ধারণাসমূহ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>ধারাবাহিক তথ্য:</strong> উভয় ভেরিয়েবল ধারাবাহিক হতে হবে (যেমন: উচ্চতা ও ওজন)।</li>
                    <li><strong>রৈখিক সম্পর্ক:</strong> ভেরিয়েবলগুলোর মধ্যে সম্পর্ক সরলরৈখিক হতে হবে।</li>
                    <li><strong>স্বাভাবিকতা:</strong> উভয় ভেরিয়েবল স্বাভাবিকভাবে বিতরণকৃত হতে হবে।</li>
                    <li><strong>স্বাধীনতা:</strong> প্রতিটি পর্যবেক্ষণ জোড়া স্বাধীন হতে হবে।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">যা করবেন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Pearson প্রয়োগের আগে তথ্যের স্বাভাবিকতা যাচাই করুন।</li>
                    <li>স্ক্যাটার প্লট ব্যবহার করে রৈখিকতা নিশ্চিত করুন।</li>
                    <li>সম্পর্ক সহগ (r) এবং p-মূল্য রিপোর্ট করুন।</li>
                    <li>২০–৩০ বা তার বেশি স্যাম্পলের জন্য ব্যবহার করুন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">যা করবেন না:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>রৈখিক নয় এমন সম্পর্ক বিশ্লেষণে ব্যবহার করবেন না।</li>
                    <li>আউটলাইয়ার উপেক্ষা করবেন না।</li>
                    <li>সম্পর্ক থেকে কারণ নির্ধারণ করবেন না।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সেরা চর্চা:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>পর্যবেক্ষণের স্বাধীনতা যাচাই করুন।</li>
                    <li>আউটলাইয়ার চিহ্নিত ও নিয়ন্ত্রণ করুন।</li>
                    <li>রৈখিকতা যাচাইয়ের জন্য স্ক্যাটার প্লট ব্যবহার করুন।</li>
                    <li>ফলাফলের ব্যবহারিক ব্যাখ্যা দিন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সূত্র:</h4>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`r = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}`} />
                </div>
                <p className="mb-2">অথবা:</p>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`r = \\frac{\\text{cov}(X, Y)}{\\sigma_X \\sigma_Y}`} />
                </div>

                <h4 className="text-md font-semibold mt-4 mb-2">তথ্যের ধরন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>ধারাবাহিক:</strong> যেমন বয়স, উচ্চতা, আয়।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ফলাফল বিশ্লেষণ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>r = +1:</strong> নিখুঁত ইতিবাচক রৈখিক সম্পর্ক</li>
                    <li><strong>r = -1:</strong> নিখুঁত নেতিবাচক রৈখিক সম্পর্ক</li>
                    <li><strong>r = 0:</strong> কোনো রৈখিক সম্পর্ক নেই</li>
                    <li><strong>p-মূল্য:</strong>
                        <ul className="list-disc pl-6">
                        <li><strong>p &lt; 0.05:</strong> গুরুত্বপূর্ণ সম্পর্ক</li>
                        <li><strong>p ≥ 0.05:</strong> গুরুত্বপূর্ণ সম্পর্ক নেই</li>
                        </ul>
                    </li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ব্যবহারক্ষেত্র:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>উচ্চতা ও ওজনের সম্পর্ক নির্ধারণ।</li>
                    <li>তাপমাত্রা ও আইসক্রিম বিক্রির মধ্যে সম্পর্ক বিশ্লেষণ।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ভিজ্যুয়ালাইজেশন পদ্ধতি:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Pearson সম্পর্ক হিটম্যাপ</li>
                </ul>
            </>
        ),

        spearman: (
            <>
                <h3 className="text-lg font-semibold mb-2">স্পিয়ারম্যান র‍্যাঙ্ক সহসম্পর্ক কী?</h3>
                <p className="mb-4">
                    স্পিয়ারম্যান র‍্যাঙ্ক সহসম্পর্ক একটি নন-প্যারামেট্রিক পরীক্ষা যা দুটি র‍্যাঙ্ক করা ভেরিয়েবলের মধ্যে সম্পর্কের দিক ও শক্তি পরিমাপ করে। এটি মনোটোনিক সম্পর্ক বিশ্লেষণে উপযোগী, এমনকি যদি ডেটা স্বাভাবিকভাবে বিতরণ না হয়।
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">ধারণাসমূহ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>ক্রমবিন্যস্ত বা ধারাবাহিক ডেটা:</strong> ডেটা র‍্যাঙ্কযোগ্য হওয়া উচিত।</li>
                    <li><strong>মনোটোনিক সম্পর্ক:</strong> ভেরিয়েবলগুলো ক্রমান্বয়ে বাড়ে বা কমে।</li>
                    <li><strong>স্বাধীনতা:</strong> প্রতিটি জোড়া পর্যবেক্ষণ স্বাধীন হতে হবে।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">যা করবেন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>মনোটোনিক কিন্তু নন-লিনিয়ার ট্রেন্ডে ব্যবহার করুন।</li>
                    <li>র‍্যাঙ্কে রূপান্তর করুন এবং টাইগুলো গড় র‍্যাঙ্ক দিয়ে সমাধান করুন।</li>
                    <li>ব্যবহারের আগে অনুমান যাচাই করুন।</li>
                    <li>উভয় সহসম্পর্ক সহগ ও p-মূল্য রিপোর্ট করুন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">যা করবেন না:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>অমনতোনিক ডেটার ক্ষেত্রে ব্যবহার করবেন না।</li>
                    <li>টাই উপেক্ষা করবেন না।</li>
                    <li>সহসম্পর্ক মানেই কারণ নয়, এটি ধরে নেবেন না।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সেরা চর্চাসমূহ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>স্বাধীনতা নিশ্চিত করুন।</li>
                    <li>টাই মান সঠিকভাবে পরিচালনা করুন।</li>
                    <li>বাস্তব দৃষ্টিকোণ থেকে ব্যাখ্যা দিন।</li>
                    <li>কমপক্ষে ১০–১৫ জোড়া তথ্য ব্যবহার করুন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সূত্র:</h4>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`\\rho = 1 - \\frac{6 \\sum d_i^2}{n(n^2 - 1)}`} />
                </div>
                <p className="mb-4">যেখানে:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>d<sub>i</sub>:</strong> প্রতিটি জোড়া পর্যবেক্ষণের র‍্যাঙ্ক পার্থক্য</li>
                    <li><strong>n:</strong> মোট জোড়া সংখ্যা</li>
                </ul>
                <p className="mb-4">টাই থাকলে:</p>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`\\rho = \\frac{\\text{cov}(\\text{rank}(X), \\text{rank}(Y))}{\\sigma_{\\text{rank}(X)} \\sigma_{\\text{rank}(Y)}}`} />
                </div>

                <h4 className="text-md font-semibold mt-4 mb-2">তথ্যের ধরন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>ক্রমবিন্যস্ত:</strong> র‍্যাঙ্কযোগ্য বিভাগ</li>
                    <li><strong>ধারাবাহিক:</strong> পরিমাপযোগ্য এবং র‍্যাঙ্কযোগ্য মান</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ফলাফল ব্যাখ্যা:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>ρ = +1:</strong> নিখুঁত ধনাত্মক মনোটোনিক সম্পর্ক</li>
                    <li><strong>ρ = -1:</strong> নিখুঁত ঋণাত্মক মনোটোনিক সম্পর্ক</li>
                    <li><strong>ρ = 0:</strong> মনোটোনিক সম্পর্ক নেই</li>
                    <li><strong>p-মূল্য:</strong>
                        <ul className="list-disc pl-6">
                            <li><strong>p &lt; 0.05:</strong> গুরুত্বপূর্ণ সম্পর্ক</li>
                            <li><strong>p ≥ 0.05:</strong> গুরুত্বপূর্ণ নয়</li>
                        </ul>
                    </li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ব্যবহারক্ষেত্র:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>র‍্যাঙ্ক করা ডেটা বিশ্লেষণ</li>
                    <li>পড়াশোনার সময় বনাম পরীক্ষার ফল</li>
                    <li>সন্তুষ্টি বনাম সেবার মান</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ভিজ্যুয়ালাইজেশন পদ্ধতি:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>সহসম্পর্ক হিটম্যাপ</li>
                </ul>
            </>
        ),

        shapiro: (
            <>
                <h3 className="text-lg font-semibold mb-2">শ্যাপিরো-উইল্ক টেস্ট কী?</h3>
                <p className="mb-4">
                    শ্যাপিরো-উইল্ক টেস্ট ব্যবহার করে নির্ধারণ করা হয় কোনো স্যাম্পল স্বাভাবিক বণ্টন (normal distribution) থেকে এসেছে কি না। এটি ছোট স্যাম্পল সাইজ (৫০-এর কম) এর জন্য সবচেয়ে কার্যকর, তবে বড় স্যাম্পলের জন্যও প্রযোজ্য।
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">ধারণাসমূহ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>ধারাবাহিক তথ্য:</strong> তথ্য ধারাবাহিক হতে হবে, ক্যাটেগরিকাল নয়।</li>
                    <li><strong>একক গ্রুপ:</strong> ডেটা শুধুমাত্র একটি গ্রুপ থেকে আসা উচিত।</li>
                    <li><strong>স্বাভাবিকতা যাচাই:</strong> লক্ষ্য হওয়া উচিত স্বাভাবিকতা যাচাই করা।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">যা করবেন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>স্বাভাবিকতা যাচাইয়ের জন্য ব্যবহার করুন, বিশেষত t-test বা ANOVA করার আগে।</li>
                    <li>৩ থেকে ২০০০ স্যাম্পলের জন্য উপযুক্ত।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">যা করবেন না:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>ক্যাটেগরিকাল বা অর্ডিনাল ডেটার উপর প্রয়োগ করবেন না।</li>
                    <li>একাধিক গ্রুপ একসাথে বিশ্লেষণ করবেন না — প্রতিটি গ্রুপ আলাদাভাবে বিশ্লেষণ করুন।</li>
                    <li>শুধু এই টেস্টের উপর নির্ভর করবেন না — গ্রাফও ব্যবহার করুন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">কাজ করার প্রক্রিয়া:</h4>
                <p className="mb-4">
                    এটি W-স্ট্যাটিস্টিক নির্ণয় করে যা আপনার ডেটা কতটা স্বাভাবিক বণ্টনের কাছাকাছি তা পরিমাপ করে। W এর মান ১-এর কাছাকাছি হলে স্বাভাবিকতা বোঝায়।
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">সূত্র:</h4>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`W = \\frac{\\left( \\sum_{i=1}^n a_i x_{(i)} \\right)^2}{\\sum_{i=1}^n (x_i - \\bar{x})^2}`} />
                </div>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>x<sub>(i)</sub>:</strong> i-তম সাজানো মান</li>
                    <li><strong>ȳ:</strong> নমুনার গড়</li>
                    <li><strong>a<sub>i</sub>:</strong> আদর্শ স্বাভাবিক বণ্টন থেকে নির্ধারিত ধ্রুবক</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ফলাফল বিশ্লেষণ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>p ≥ 0.05:</strong> ডেটা সম্ভবত স্বাভাবিক — null hypothesis প্রত্যাখ্যান করা হবে না।</li>
                    <li><strong>p &lt; 0.05:</strong> ডেটা স্বাভাবিক নয় — null hypothesis প্রত্যাখ্যান করা হবে।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ব্যবহারক্ষেত্র:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>শিক্ষার্থীদের টেস্ট স্কোর স্বাভাবিক বণ্টনের অনুসরণ করে কি না যাচাই করা।</li>
                    <li>স্বাভাবিক না হলে Mann-Whitney U বা Kruskal-Wallis ব্যবহার করুন।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ভিজ্যুয়ালাইজেশন পদ্ধতি:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>হিস্টোগ্রাম:</strong> বেল-শেপ দেখা যায় কিনা যাচাই করুন।</li>
                    <li><strong>বক্সপ্লট:</strong> স্কিউনেস ও আউটলায়ার চিহ্নিত করে।</li>
                </ul>
            </>
        ),

        fzt: (
            <>
                <h3 className="text-lg font-semibold mb-2">F, Z, এবং T টেস্ট কী?</h3>
                <p className="mb-4">
                    F, Z, এবং T টেস্ট হলো ধ্রুপদী প্যারামেট্রিক পরীক্ষা, যা মূলত গড় এবং বৈচিত্র্যের পার্থক্য বিশ্লেষণে ব্যবহৃত হয়।
                </p>

                {/* F Test */}
                <h4 className="text-md font-semibold mt-4 mb-2">F টেস্ট:</h4>
                <p className="mb-4">দুটি গোষ্ঠীর বৈচিত্র্য তুলনা করতে ব্যবহৃত হয়।</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>ধারাবাহিক এবং স্বাভাবিক বণ্টিত ডেটা প্রয়োজন।</li>
                    <li>t-test করার আগে ভ্যারিয়েন্স সমতা নির্ণয়ে ব্যবহৃত হয়।</li>
                    <li><strong>সূত্র:</strong> <BlockMath math={`F = \\frac{s_1^2}{s_2^2}`} /></li>
                </ul>

                {/* Z Test */}
                <h4 className="text-md font-semibold mt-4 mb-2">Z টেস্ট:</h4>
                <p className="mb-4">নমুনার গড়ের সাথে জনসংখ্যার গড় তুলনা করতে ব্যবহৃত হয় যখন ভ্যারিয়েন্স জানা থাকে।</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>বড় স্যাম্পলে এবং জানা ভ্যারিয়েন্সে উপযোগী।</li>
                    <li><strong>সূত্র:</strong> <BlockMath math={`Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}}`} /></li>
                </ul>

                {/* T Test */}
                <h4 className="text-md font-semibold mt-4 mb-2">T টেস্ট:</h4>
                <p className="mb-4">যখন ভ্যারিয়েন্স অজানা, তখন দুটি গোষ্ঠীর গড়ের পার্থক্য পরিমাপ করতে ব্যবহৃত হয়।</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>একক, জোড়া, ও দুই-নমুনার সংস্করণ আছে।</li>
                    <li><strong>একক নমুনা:</strong> <BlockMath math={`t = \\frac{\\bar{X} - \\mu}{s / \\sqrt{n}}`} /></li>
                    <li><strong>দুই নমুনা (pooled):</strong> <BlockMath math={`t = \\frac{\\bar{X}_1 - \\bar{X}_2}{\\sqrt{s_p^2 (1/n_1 + 1/n_2)}}, s_p^2 = \\frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1+n_2-2}`} /></li>
                    <li><strong>জোড়া:</strong> <BlockMath math={`t = \\frac{\\bar{D}}{s_D / \\sqrt{n}}`} /></li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ব্যবহারক্ষেত্র:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>F টেস্ট:</strong> লিঙ্গভেদে রক্তচাপ ভ্যারিয়েবিলিটি</li>
                    <li><strong>Z টেস্ট:</strong> জাতীয় SAT গড়ের সঙ্গে বিদ্যালয়ের গড় তুলনা</li>
                    <li><strong>T টেস্ট:</strong> প্রশিক্ষণ-পূর্ব ও প্রশিক্ষণ-পরবর্তী ফলাফল তুলনা</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ভিজ্যুয়ালাইজেশন পদ্ধতি:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>বক্সপ্লট</li>
                    <li>ডেনসিটি ও নরমাল কার্ভ</li>
                    <li>এরর বার</li>
                </ul>
            </>
        ),        

        linear_regression: (
            <>
                <h3 className="text-lg font-semibold mb-2">লিনিয়ার রিগ্রেশন কী?</h3>
                <p className="mb-4">
                    লিনিয়ার রিগ্রেশন একটি পরিসংখ্যানিক কৌশল যা একটি নির্ভরশীল ভেরিয়েবল এবং এক বা একাধিক স্বাধীন ভেরিয়েবলের মধ্যে সম্পর্ক নির্ধারণ করে একটি সরলরেখা ব্যবহার করে।
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">ব্যবহারক্ষেত্র:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>একটি ভেরিয়েবল থেকে আরেকটি ভবিষ্যদ্বাণী করা (যেমন, আকার অনুযায়ী বাড়ির দাম)।</li>
                    <li>প্রবণতা পূর্বাভাস দেওয়া।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">তথ্যের ধরন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>নির্ভরশীল ভেরিয়েবল:</strong> ধারাবাহিক</li>
                    <li><strong>স্বাধীন ভেরিয়েবল:</strong> ধারাবাহিক বা বাইনারি</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ডেটা প্রসেসিং:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>নষ্ট বা অনুপস্থিত মান এবং ব্যতিক্রম মান যাচাই ও অপসারণ করুন।</li>
                    <li>ভিন্ন স্কেলে থাকলে মানগুলোকে স্ট্যান্ডার্ডাইজ করুন।</li>
                    <li>প্রয়োজনে ভেরিয়েবল রূপান্তর করুন (যেমন, লগ)।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সূত্র:</h4>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`Y = \\beta_0 + \\beta_1 X + \\varepsilon`} />
                </div>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Y:</strong> নির্ভরশীল ভেরিয়েবল</li>
                    <li><strong>X:</strong> স্বাধীন ভেরিয়েবল</li>
                    <li><strong>&#946;<sub>0</sub>:</strong> ইন্টারসেপ্ট (প্রারম্ভিক মান)</li>
                    <li><strong>&#946;<sub>1</sub>:</strong> স্লোপ (ধার)</li>
                    <li><strong>&#949;:</strong> ত্রুটি টার্ম</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ধারণাসমূহ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>সরলরেখার সম্পর্ক:</strong> ভেরিয়েবলের মধ্যে সম্পর্ক রৈখিক হতে হবে।</li>
                    <li><strong>স্বাধীনতা:</strong> রেসিডুয়াল বা অবশিষ্ট মান স্বাধীন হতে হবে।</li>
                    <li><strong>হোমোস্কেডাস্টিসিটি:</strong> ত্রুটির ভ্যারিয়েন্স ধ্রুবক হতে হবে।</li>
                    <li><strong>রেসিডুয়ালের স্বাভাবিকতা:</strong> রেসিডুয়াল স্বাভাবিক বণ্টনে থাকা উচিত।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ভিজ্যুয়ালাইজেশন পদ্ধতি:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>রিগ্রেশন লাইনের সাথে স্ক্যাটার প্লট</li>
                    <li>রেসিডুয়াল প্লট</li>
                    <li>রেসিডুয়াল এর হিস্টোগ্রাম</li>
                    <li>রেসিডুয়াল এর কিউ-কিউ প্লট</li>
                </ul>
            </>
        ),

        anova: (
            <>
                <h3 className="text-lg font-semibold mb-2">ANOVA (এনালাইসিস অব ভেরিয়েন্স) কী?</h3>
                <p className="mb-4">
                    ANOVA একটি পরিসংখ্যানিক পদ্ধতি যা তিন বা ততোধিক স্বতন্ত্র গ্রুপের মধ্যে গড়ের মধ্যে গুরুত্বপূর্ণ পার্থক্য আছে কিনা তা নির্ধারণ করে।
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">ব্যবহারক্ষেত্র:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>বিভিন্ন শ্রেণিতে গড় মানের তুলনা।</li>
                    <li>উদাহরণ: বিভিন্ন শিক্ষণ পদ্ধতিতে টেস্ট স্কোরের পার্থক্য।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">তথ্যের ধরন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>নির্ভরশীল ভেরিয়েবল:</strong> ধারাবাহিক (Continuous)</li>
                    <li><strong>স্বতন্ত্র ভেরিয়েবল:</strong> শ্রেণিভুক্ত (Categorical) যেগুলির ৩ বা ততোধিক স্তর আছে</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সূত্র:</h4>
                <div className="bg-gray-100 p-2 rounded mb-2">
                    মোট স্কোয়ারের যোগফল (SST):<br />
                    <BlockMath math={`SST = \\sum (Y_{ij} - \\bar{Y})^2`} />
                </div>
                <div className="bg-gray-100 p-2 rounded mb-2">
                    গ্রুপের মধ্যে স্কোয়ারের যোগফল (SSB):<br />
                    <BlockMath math={`SSB = \\sum n_j (\\bar{Y}_j - \\bar{Y})^2`} />
                </div>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    গ্রুপের ভেতরের স্কোয়ারের যোগফল (SSW) ও F-স্ট্যাটিস্টিক:<br />
                    <BlockMath math={`SSW = \\sum (Y_{ij} - \\bar{Y}_j)^2`} />
                    <BlockMath math={`F = \\frac{MSB}{MSW} = \\frac{SSB/(k-1)}{SSW/(N-k)}`} />
                </div>

                <h4 className="text-md font-semibold mt-4 mb-2">ধারণাসমূহ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>প্রতিটি গ্রুপে স্বাভাবিক বণ্টন থাকা উচিত</li>
                    <li>বিচ্যুতির অভিন্নতা (Homogeneity of variance)</li>
                    <li>পর্যবেক্ষণগুলোর মধ্যে স্বাধীনতা</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ভিজ্যুয়ালাইজেশন পদ্ধতি:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>বক্সপ্লট বা ভায়োলিন প্লট</li>
                    <li>গড় মান ± স্ট্যান্ডার্ড এরর সহ ত্রুটি বার প্লট</li>
                    <li>অবশিষ্টাংশের (residuals) প্লট</li>
                </ul>
            </>
        ),

        ancova: (
            <>
                <h3 className="text-lg font-semibold mb-2">ANCOVA (কোভেরিয়েন্স বিশ্লেষণ) কী?</h3>
                <p className="mb-4">
                    ANCOVA হল একটি পরিসংখ্যানিক পদ্ধতি যা রিগ্রেশন ও ANOVA কে একত্র করে বিভিন্ন গ্রুপের গড় তুলনা করে, পাশাপাশি একটি বা একাধিক ধারাবাহিক কোভেরিয়েটের প্রভাব নিয়ন্ত্রণ করে।
                </p>

                <h4 className="text-md font-semibold mt-4 mb-2">ব্যবহারক্ষেত্র:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>একটি কোভেরিয়েট নিয়ন্ত্রণ করে গ্রুপের গড় তুলনা।</li>
                    <li>উদাহরণ: GPA নিয়ন্ত্রণ করে বিভিন্ন শিক্ষণ পদ্ধতিতে পরীক্ষার ফলাফল তুলনা।</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">তথ্যের ধরন:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>নির্ভরশীল ভেরিয়েবল:</strong> ধারাবাহিক</li>
                    <li><strong>স্বাধীন ভেরিয়েবল:</strong> শ্রেণিভুক্ত</li>
                    <li><strong>কোভেরিয়েট:</strong> ধারাবাহিক</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">সূত্র:</h4>
                <p className="mb-4">সাধারণ মডেল:</p>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <BlockMath math={`Y_{ij} = \\mu + \\tau_i + \\beta (X_{ij} - \\bar{X}) + \\varepsilon_{ij}`}/>
                </div>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li><strong>Y<sub>ij</sub>:</strong> <em>i</em> গ্রুপের <em>j</em> সংখ্যক ব্যক্তির নির্ভরশীল ভেরিয়েবল</li>
                    <li><strong>μ:</strong> সামগ্রিক গড়</li>
                    <li><strong>τ<sub>i</sub>:</strong> <em>i</em> গ্রুপের প্রভাব</li>
                    <li><strong>β:</strong> কোভেরিয়েট <em>X</em>-এর রিগ্রেশন সহগ</li>
                    <li><strong>ε<sub>ij</sub>:</strong> ত্রুটির পরিমাণ</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ধারণাসমূহ:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>কোভেরিয়েট এবং নির্ভরশীল ভেরিয়েবলের মধ্যে সরলরৈখিক সম্পর্ক</li>
                    <li>রিগ্রেশন স্লোপের অভিন্নতা</li>
                    <li>স্বাভাবিকতা ও হোমোস্কেডাস্টিসিটি</li>
                </ul>

                <h4 className="text-md font-semibold mt-4 mb-2">ভিজ্যুয়ালাইজেশন পদ্ধতি:</h4>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>ইন্টারঅ্যাকশন প্লট</li>
                    <li>সমন্বিত গড় প্লট</li>
                    <li>প্রতিটি গ্রুপের জন্য রিগ্রেশন লাইনের সঙ্গে স্ক্যাটারপ্লট</li>
                </ul>
            </>
        ), 

  }
};

export default statTestDetails;
