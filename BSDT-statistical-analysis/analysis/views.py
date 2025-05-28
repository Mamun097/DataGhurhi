import os

import matplotlib
import matplotlib.font_manager as fm
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import scipy.stats as stats
import seaborn as sns
from sklearn.preprocessing import OrdinalEncoder

matplotlib.use('Agg')
from itertools import combinations

import networkx as nx
import statsmodels.api as sm
import statsmodels.formula.api as smf
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from googletrans import Translator
from PIL import Image, ImageDraw, ImageFont
from scipy.stats import chi2_contingency
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import OrdinalEncoder
from .forms import AnalysisForm


def get_columns(request):
    if request.method == 'POST' and request.FILES.get('file'):
        try:
            excel_file = request.FILES['file']
            df = pd.read_excel(excel_file)
            return JsonResponse({
                'success': True,
                'columns': df.columns.tolist()
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    return JsonResponse({'success': False, 'error': 'No file uploaded'})

def analyze_data_api(request):
    if request.method == 'POST':
        try:
            if 'file' not in request.FILES:
                raise ValueError("Please upload an Excel file")
                
            excel_file = request.FILES['file']
            df = pd.read_excel(excel_file)

            test_type = request.POST.get('test_type', '')
            col1 = request.POST.get('column1', '')
            col2 = request.POST.get('column2', '')
            col3 = request.POST.get('column3', '')
            
            # Validate columns
            if not col1 or col1 not in df.columns:
                raise ValueError("Please select a valid first column")
            
            if test_type in ['kruskal', 'pearson', 'ttest_ind', 'mannwhitney'] and (not col2 or col2 not in df.columns):
                raise ValueError("Please select a valid second column")

             # Process categorical data BEFORE passing to test functions
            print("Converting categorical columns to numerical values...")
            categorical_cols = df.select_dtypes(include=['object']).columns
            if not categorical_cols.empty:
                df[categorical_cols] = OrdinalEncoder().fit_transform(df[categorical_cols])
                print(f"Converted categorical columns: {list(categorical_cols)}")
            
            print(f"DataFrame head after conversion:\n{df[[col1, col2]].head() if col2 in df.columns else df[[col1]].head()}")
            
            if test_type == 'kruskal':
                return process_kruskal_test(request, df, col1, col2)
            
            elif test_type == 'mannwhitney':
                stat, p_value = stats.mannwhitneyu(df[col1], df[col2], alternative='two-sided', nan_policy='omit')
                results = {
                    'test': 'Mann-Whitney U test',
                    'statistic': stat,
                    'p_value': p_value
                }

                plot_paths = []

                # Boxplot
                plt.figure(figsize=(8, 6))
                sns.boxplot(x=col1, y=col2, data=df)
                plt.title(f'{col2} by {col1} - Boxplot')
                plt.xlabel(f'{col1} (categorical)')
                plt.ylabel(f'{col2} (numeric)')
                box_path = save_plot(plt, 'mannwhitney_boxplot.png')
                plot_paths.append(box_path)

                # Violin plot
                plt.figure(figsize=(8, 6))
                sns.violinplot(x=col1, y=col2, data=df)
                plt.title(f'{col2} by {col1} - Violin Plot')
                plt.xlabel(f'{col1} (categorical)')
                plt.ylabel(f'{col2} (numeric)')
                violin_path = save_plot(plt, 'mannwhitney_violinplot.png')
                plot_paths.append(violin_path)

                results['plot_paths'] = plot_paths

            
            elif test_type == 'spearman':
                heatmap_size = request.POST.get('heatmap_size', '2x2')
    
                if heatmap_size == '4x4':
                    # Get 4 columns
                    col3 = form.cleaned_data.get('column4')  # 3rd input for Spearman 4x4
                    col4 = form.cleaned_data.get('column5')  # 4th input
                    selected_cols = [col for col in [col1, col2, col3, col4] if col]

                    if len(selected_cols) != 4:
                        raise ValueError("Please select four columns for a 4x4 heatmap.")

                    corr_matrix, _ = stats.spearmanr(df[selected_cols])
                    corr_df = pd.DataFrame(corr_matrix, columns=selected_cols, index=selected_cols)

                    plt.figure(figsize=(9, 7))
                    sns.heatmap(corr_df, annot=True, cmap='coolwarm', vmin=-1, vmax=1, fmt='.2f', cbar=True)
                    plt.title('Spearman Rank Correlation Heatmap (4x4)')
                    plt.xticks(rotation=45, ha='right')
                    plt.yticks(rotation=45)
                    plot_path = save_plot(plt, 'spearman_4x4_heatmap.png')

                    results = {
                        'test': 'Spearman Rank Correlation (4x4)',
                        'plot_paths': [plot_path]
                    }

                else:
                    # 2x2 logic (your existing block)
                    corr, p_value = stats.spearmanr(df[col1], df[col2], nan_policy='omit')
                    results = {
                        'test': 'Spearman Rank Correlation',
                        'statistic': corr,
                        'p_value': p_value
                    }

                    plt.figure(figsize=(12, 10))
                    sns.heatmap(
                        pd.DataFrame([[1, corr], [corr, 1]],
                            index=[col1, col2],
                            columns=[col1, col2]),
                        annot=True, cmap='coolwarm', vmin=-1, vmax=1, fmt='.2f'
                    )
                    plt.title('Spearman Rank Correlation Heatmap (2x2)')
                    plot_path = save_plot(plt, 'spearman_2x2_heatmap.png')
                    results['plot_paths'] = [plot_path]
            

            elif test_type == 'pearson':
                column_pairs = list(combinations(df.columns, 2))
                pearson_results = []
                significant_pairs = []
                
                for c1, c2 in column_pairs:
                    r, p = stats.pearsonr(df[c1], df[c2])
                    
                    if p < 0.01:
                        interpretation = "Very significant (p < 0.01)"
                    elif p < 0.05:
                        interpretation = "Significant (p < 0.05)"
                    else:
                        interpretation = "Not significant (p ≥ 0.05)"
                    
                    result = {
                        'Variable_1': c1,
                        'Variable_2': c2,
                        'Correlation': round(r, 3),
                        'p_value': round(p, 4),
                        'Interpretation': interpretation,
                        'Significant': p < 0.05
                    }
                    pearson_results.append(result)
                    if p < 0.05:
                        significant_pairs.append(result)
                
                results = {
                    'test': 'Pearson Correlation Analysis',
                    'results': pearson_results,
                    'significant': significant_pairs
                }
            
            elif test_type == 'wilcoxon':
                stat, p_value = stats.wilcoxon(df[col1], df[col2], zero_method='wilcox', nan_policy='omit')
                results = {
                    'test': 'Wilcoxon Signed-Rank Test',
                    'statistic': stat,
                    'p_value': p_value
                }
            
            elif test_type == 'shapiro':
                shapiro_results = []
                plot_paths = []

                for col in df.select_dtypes(include=['number']).columns:
                    data = df[col].dropna()
                    stat, p = stats.shapiro(data)

                    # Append result
                    shapiro_results.append({
                        'Column': col,
                        'Statistic': round(stat, 4),
                        'p_value': round(p, 4),
                        'Normal': p > 0.05
                    })

                    # --- Plot histogram with KDE & normal curve ---
                    plt.figure(figsize=(10, 5))

                    # Histogram with KDE
                    sns.histplot(data, kde=True, bins=30, color='blue', stat="density", label='Data Distribution')

                    # Normal distribution curve
                    mean, std = np.mean(data), np.std(data)
                    x = np.linspace(mean - 4*std, mean + 4*std, 100)
                    plt.plot(x, stats.norm.pdf(x, mean, std), 'r', label='Normal Distribution')

                    # Titles & labels
                    plt.title(f"Normality Test: {col} (p = {p:.4f})", fontsize=14)
                    plt.xlabel(col, fontsize=12)
                    plt.ylabel("Density", fontsize=12)
                    plt.legend()

                    # Interpretation as suptitle
                    if p > 0.05:
                        plt.suptitle("Likely Normal (p > 0.05)", color='green', fontsize=12)
                    else:
                        plt.suptitle("Likely Not Normal (p ≤ 0.05)", color='red', fontsize=12)

                    # Save the plot 
                    safe_col = "".join(c if c.isalnum() or c == '_' else '_' for c in col)
                    plot_filename = f'shapiro_{safe_col}_hist.png'
                    plot_paths.append(save_plot(plt, plot_filename))

                results = {
                    'test': 'Shapiro-Wilk Normality Test',
                    'results': shapiro_results,
                    'plot_paths': plot_paths
                }

            
            elif test_type == 'ttest_ind':
                stat, p_value = stats.ttest_ind(df[col1], df[col2], equal_var=False, nan_policy='omit')
                results = {
                    'test': 'Independent Samples t-test',
                    'statistic': stat,
                    'p_value': p_value
                }
            
                # --- Combined Visualization for Z/F/T Tests ---
                plt.figure(figsize=(15, 10))

                # Histogram + KDE
                plt.subplot(2, 2, 1)
                sns.histplot(data=df, x=col1, hue=col2, kde=True, palette='Set2', bins=15)
                plt.title(f"Histogram + KDE of {col1} by {col2}")

                # Boxplot
                plt.subplot(2, 2, 2)
                sns.boxplot(x=col2, y=col1, data=df, hue=col2, palette='Set2', legend=False)
                plt.title(f"Boxplot of {col1} by {col2}")

                # Violin Plot
                plt.subplot(2, 2, 3)
                sns.violinplot(x=col2, y=col1, data=df, hue=col2, palette='Set2', legend=False)
                plt.title(f"Violin Plot of {col1} by {col2}")

                # Stripplot + Boxplot
                plt.subplot(2, 2, 4)
                sns.boxplot(x=col2, y=col1, data=df, color='lightgray')
                sns.stripplot(x=col2, y=col1, data=df, hue=col2, palette='Set2', size=5, jitter=True, legend=False)
                plt.title(f"Stripplot + Box of {col1} by {col2}")

                plt.tight_layout()

                # Save and pass the plot path
                plot_path = save_plot(plt, f'{test_type}_combined_plot.png')
                results['plot_paths'] = [plot_path]
        

            elif test_type == 'ttest_paired':
                stat, p_value = stats.ttest_rel(df[col1], df[col2], nan_policy='omit')
                results = {
                    'test': 'Paired Samples t-test',
                    'statistic': stat,
                    'p_value': p_value
                }

                # Paired line plot per participant
                plt.figure(figsize=(8, 5))
                paired_df = df[[col1, col2]].dropna()
                for i in range(len(paired_df)):
                    plt.plot([1, 2], [paired_df.iloc[i][0], paired_df.iloc[i][1]], color='gray', alpha=0.6)

                plt.xticks([1, 2], [col1, col2])
                plt.title(f'Paired Comparison: {col1} vs {col2}')
                plt.ylabel('Values')
                plt.tight_layout()

                plot_path = save_plot(plt, 'ttest_paired_plot.png')
                results['plot_paths'] = [plot_path]
               
            
            elif test_type == 'ttest_onesample':
                stat, p_value = stats.ttest_1samp(df[col1].dropna(), ref_value, nan_policy='omit')
                results = {
                    'test': f'One-Sample t-test (vs {ref_value})',
                    'statistic': stat,
                    'p_value': p_value
                }

                # Histogram with reference line
                plt.figure(figsize=(8, 5))
                sns.histplot(df[col1], kde=True, bins=20, color='skyblue')
                plt.axvline(ref_value, color='red', linestyle='--', label=f'Reference = {ref_value}')
                plt.title(f'{col1} Distribution with Reference Line')
                plt.xlabel(col1)
                plt.ylabel('Frequency')
                plt.legend()
                plt.tight_layout()

                plot_path = save_plot(plt, 'ttest_onesample_plot.png')
                results['plot_paths'] = [plot_path]

            
            elif test_type == 'linear_regression':
                if not col2:
                    raise ValueError("Please select both X and Y columns for Linear Regression")
                
                try:
                    X = df[[col1]] 
                    y = df[col2]    
                    
                    # Fit model
                    lr_model = LinearRegression().fit(X, y)
                    y_pred = lr_model.predict(X)
                    
                    results = {
                        'test': 'Linear Regression',
                        'independent_var': col1,
                        'dependent_var': col2,
                        'intercept': lr_model.intercept_,
                        'coefficient': lr_model.coef_[0],
                        'r_squared': r2_score(y, y_pred),
                        'mse': mean_squared_error(y, y_pred),
                        'equation': f"{col2} = {lr_model.intercept_:.2f} + {lr_model.coef_[0]:.2f}*{col1}"
                    }
                    # --- Visualization: Scatter plot with regression line ---
                    plt.figure(figsize=(8, 5))
                    sns.regplot(x=col1, y=col2, data=df, ci=None, line_kws={"color": "red"})
                    plt.title(f'Linear Regression: {col2} ~ {col1}')
                    plt.xlabel(col1)
                    plt.ylabel(col2)
                    plt.grid(True)
                    plt.tight_layout()

                    plot_path = save_plot(plt, 'linear_regression_plot.png')
                    results['plot_paths'] = [plot_path]

                except Exception as e:
                    raise ValueError(f"Linear Regression error: {str(e)}")
            
            elif test_type == 'anova':
                if not col2:
                    raise ValueError("Please select both group and outcome columns for ANOVA")
                
                try:
                    # Create formula and fit model
                    formula = f"{col2} ~ C({col1})"
                    model = smf.ols(formula, data=df).fit()
                    anova_table = sm.stats.anova_lm(model, typ=2)
                    
                    results = {
                        'test': 'ANOVA',
                        'group_var': col1,
                        'outcome_var': col2,
                        'anova_table': anova_table.to_html(classes='table table-striped'),
                        'summary': model.summary().tables[0].as_html(),
                        'coefficients': model.summary().tables[1].as_html()
                    }
                    
                    # --- ANOVA Boxplot ---
                    plt.figure(figsize=(8, 5))
                    sns.boxplot(x=col1, y=col2, data=df)
                    plt.title(f'ANOVA: {col2} by {col1}')
                    plt.xlabel('Group')
                    plt.ylabel(col2)
                    plt.grid(True)
                    plt.tight_layout()

                    anova_plot_path = save_plot(plt, 'anova_boxplot.png')
                    results['plot_paths'] = [anova_plot_path]
                
                except Exception as e:
                    raise ValueError(f"ANOVA error: {str(e)}")
            
            elif test_type == 'ancova':
                if not col2 or not col3:
                    raise ValueError("Please select group, outcome, and covariate columns for ANCOVA")
                
                try:
                    # Create formula and fit model
                    formula = f"{col2} ~ C({col1}) + {col3}"
                    model = smf.ols(formula, data=df).fit()
                    ancova_table = sm.stats.anova_lm(model, typ=2)
                    
                    results = {
                        'test': 'ANCOVA',
                        'group_var': col1,
                        'outcome_var': col2,
                        'covariate_var': col3,
                        'ancova_table': ancova_table.to_html(classes='table table-striped'),
                        'summary': model.summary().tables[0].as_html(),
                        'coefficients': model.summary().tables[1].as_html()
                    }

                    # --- ANCOVA lmplot grouped by group_var ---
                    unique_groups = df[col1].nunique()
                    default_markers = ['o', 's', 'D', '^', 'v', 'P', 'X']
                    markers = default_markers[:unique_groups]

                    plot = sns.lmplot(
                        data=df,
                        x=col3,
                        y=col2,
                        hue=col1,
                        aspect=1.5,
                        ci=None,
                        markers=markers,
                        palette='Set2'
                    )

                    plt.title(f'ANCOVA: {col2} by {col1} with {col3} control')
                    plt.xlabel(f'Covariate ({col3})')
                    plt.ylabel(f'Outcome ({col2})')
                    plt.grid(True)
                    plt.tight_layout()

                    ancova_plot_path = save_plot(plt, 'ancova_grouped_regression.png')
                    results['plot_paths'] = [ancova_plot_path]


                except Exception as e:
                    raise ValueError(f"ANCOVA error: {str(e)}")
            
            elif test_type == 'ztest':
                if not col1 or not col2:
                    raise ValueError("Please select both columns for Z-Test")

                group_A = df[df[col2] == df[col2].unique()[0]][col1]
                group_B = df[df[col2] == df[col2].unique()[1]][col1]

                mean_diff = group_A.mean() - group_B.mean()
                std_error = np.sqrt(group_A.var(ddof=1)/len(group_A) + group_B.var(ddof=1)/len(group_B))
                z_score = mean_diff / std_error
                p_value = 2 * (1 - stats.norm.cdf(abs(z_score)))

                results = {
                    'test': 'Z-Test (Difference in Means)',
                    'z_score': z_score,
                    'p_value': p_value,
                    'column1': col1,
                    'group_column': col2
                }

                # --- Combined Visualization for Z/F/T Tests ---
                plt.figure(figsize=(15, 10))

                # Histogram + KDE
                plt.subplot(2, 2, 1)
                sns.histplot(data=df, x=col1, hue=col2, kde=True, palette='Set2', bins=15)
                plt.title(f"Histogram + KDE of {col1} by {col2}")

                # Boxplot
                plt.subplot(2, 2, 2)
                sns.boxplot(x=col2, y=col1, data=df, hue=col2, palette='Set2', legend=False)
                plt.title(f"Boxplot of {col1} by {col2}")

                # Violin Plot
                plt.subplot(2, 2, 3)
                sns.violinplot(x=col2, y=col1, data=df, hue=col2, palette='Set2', legend=False)
                plt.title(f"Violin Plot of {col1} by {col2}")

                # Stripplot + Boxplot
                plt.subplot(2, 2, 4)
                sns.boxplot(x=col2, y=col1, data=df, color='lightgray')
                sns.stripplot(x=col2, y=col1, data=df, hue=col2, palette='Set2', size=5, jitter=True, legend=False)
                plt.title(f"Stripplot + Box of {col1} by {col2}")

                plt.tight_layout()

                # Save and pass the plot path
                plot_path = save_plot(plt, f'{test_type}_combined_plot.png')
                results['plot_paths'] = [plot_path]



            elif test_type == 'ftest':
                if not col1 or not col2:
                    raise ValueError("Please select both columns for F-Test")

                group_A = df[df[col2] == df[col2].unique()[0]][col1]
                group_B = df[df[col2] == df[col2].unique()[1]][col1]

                f_stat = group_A.var(ddof=1) / group_B.var(ddof=1)
                df1 = len(group_A) - 1
                df2 = len(group_B) - 1
                p_value = 1 - stats.f.cdf(f_stat, df1, df2)

                results = {
                    'test': 'F-Test (Difference in Variance)',
                    'f_statistic': f_stat,
                    'df1': df1,
                    'df2': df2,
                    'p_value': p_value,
                    'column1': col1,
                    'group_column': col2
                }

                # --- Combined Visualization for Z/F/T Tests ---
                plt.figure(figsize=(15, 10))

                # Histogram + KDE
                plt.subplot(2, 2, 1)
                sns.histplot(data=df, x=col1, hue=col2, kde=True, palette='Set2', bins=15)
                plt.title(f"Histogram + KDE of {col1} by {col2}")

                # Boxplot
                plt.subplot(2, 2, 2)
                sns.boxplot(x=col2, y=col1, data=df, hue=col2, palette='Set2', legend=False)
                plt.title(f"Boxplot of {col1} by {col2}")

                # Violin Plot
                plt.subplot(2, 2, 3)
                sns.violinplot(x=col2, y=col1, data=df, hue=col2, palette='Set2', legend=False)
                plt.title(f"Violin Plot of {col1} by {col2}")

                # Stripplot + Boxplot
                plt.subplot(2, 2, 4)
                sns.boxplot(x=col2, y=col1, data=df, color='lightgray')
                sns.stripplot(x=col2, y=col1, data=df, hue=col2, palette='Set2', size=5, jitter=True, legend=False)
                plt.title(f"Stripplot + Box of {col1} by {col2}")

                plt.tight_layout()

                # Save and pass the plot path
                plot_path = save_plot(plt, f'{test_type}_combined_plot.png')
                results['plot_paths'] = [plot_path]

            elif test_type == 'chi_square':
                col1 = form.cleaned_data.get('column1')
                if not col1 or col1 not in df.columns:
                    raise ValueError("Please select a valid base column for Chi-Square Test.")

                results_list = []

                # Convert all object-type columns to category codes
                for col in df.select_dtypes(include='object').columns:
                    df[col] = df[col].astype('category').cat.codes

                # Drop rows where col1 is NaN
                df = df.dropna(subset=[col1])
                
                # Loop through all other columns
                for col2 in df.columns:
                    if col2 == col1 or col2.lower() in ['id', 'index']:
                        continue

                    # Create contingency table
                    try:
                        table = pd.crosstab(df[col1], df[col2])

                        # Must be at least 2x2
                        if table.shape[0] < 2 or table.shape[1] < 2:
                            continue

                        chi2, p, dof, expected = stats.chi2_contingency(table)
                        n = table.sum().sum()
                        v = (chi2 / n) ** 0.5 / min(table.shape[0]-1, table.shape[1]-1)

                        results_list.append({
                            'compared_with': col2,
                            'chi2': round(chi2, 4),
                            'p_value': round(p, 4),
                            'dof': dof,
                            'cramers_v': round(v, 4)
                        })

                    except Exception as e:
                        print(f"Skipped {col2}: {e}")
                        continue

                if not results_list:
                    raise ValueError("No valid categorical columns found for Chi-Square comparison.")

                results = {
                    'test': f"Chi-Square Test (Base: {col1})",
                    'results': results_list
                }

            elif test_type == 'cramers_heatmap':
                heatmap_path = os.path.join(settings.MEDIA_ROOT, 'cramers_heatmap.png')
                # Step 1: Convert object columns to category codes
                for col in df.select_dtypes(include='object').columns:
                    df[col] = df[col].astype('category').cat.codes

                # Step 2: Select categorical columns with reasonable unique values
                cat_cols = [
                    col for col in df.columns
                    if col.lower() not in ['id', 'index']
                    and df[col].nunique() > 1
                    and df[col].nunique() <= 25
                ]


                if len(cat_cols) < 2:
                    raise ValueError("Not enough categorical columns for heatmap.")

                # Step 3: Create empty matrix
                cramers_matrix = np.zeros((len(cat_cols), len(cat_cols)))

                # Step 4: Define Cramér's V function
                def cramers_v(confusion_matrix):
                    chi2 = chi2_contingency(confusion_matrix)[0]
                    n = confusion_matrix.sum().sum()
                    phi2 = chi2 / n
                    r, k = confusion_matrix.shape
                    phi2corr = max(0, phi2 - ((k - 1)*(r - 1)) / (n - 1))
                    rcorr = r - ((r - 1)**2) / (n - 1)
                    kcorr = k - ((k - 1)**2) / (n - 1)
                    return np.sqrt(phi2corr / min((kcorr - 1), (rcorr - 1)))

                # Step 5: Populate matrix
                for i in range(len(cat_cols)):
                    for j in range(len(cat_cols)):
                        table = pd.crosstab(df[cat_cols[i]], df[cat_cols[j]])
                        cramers_matrix[i, j] = cramers_v(table)

                # Step 6: Plot heatmap
                plt.figure(figsize=(28, 24))
                sns.set(font_scale=1.2)

                ax = sns.heatmap(
                    cramers_matrix,
                    annot=True,
                    fmt=".2f",
                    xticklabels=cat_cols,
                    yticklabels=cat_cols,
                    cmap="coolwarm",
                    cbar_kws={'shrink': 0.8},
                    square=True,
                    linewidths=0.5,
                    linecolor='gray'
                )

                plt.xticks(rotation=90, ha='center')  # Rotate x labels neatly
                plt.yticks(rotation=0)  # Keep y labels horizontal
                plt.tight_layout()  # Auto adjust spacing

                plt.savefig(heatmap_path, bbox_inches='tight', dpi=300)  # High-res output
                plt.close()


                # Step 7: Return heatmap to template
                results = {
                    'test': 'Cramér\'s V Heatmap',
                    'image_path': os.path.join(settings.MEDIA_URL, 'cramers_heatmap.png')
                }


            elif test_type == 'network_graph':
    

                # Step 1: Encode all object columns as categorical codes
                for col in df.select_dtypes(include='object').columns:
                    df[col] = df[col].astype('category').cat.codes

                # Step 2: Select categorical columns
                cat_cols = [
                    col for col in df.columns
                    if df[col].nunique() > 1 and df[col].nunique() <= 15
                    and col.lower() not in ['id', 'index']
                ]

                if len(cat_cols) < 2:
                    raise ValueError("Not enough categorical columns to generate a network graph.")

                # Step 3: Create an empty graph
                G = nx.Graph()
                for col in cat_cols:
                    G.add_node(col)

                # Step 4: Add edges based on Chi-square p-values
                for i in range(len(cat_cols)):
                    for j in range(i + 1, len(cat_cols)):
                        var1, var2 = cat_cols[i], cat_cols[j]
                        table = pd.crosstab(df[var1], df[var2])
                        if table.shape[0] < 2 or table.shape[1] < 2:
                            continue
                        try:
                            chi2, p, dof, expected = chi2_contingency(table)

                            if 0 < p < 0.05:
                                weight = 0.5 if p >= 0.01 else (1.5 if p >= 0.001 else 2.5)
                                G.add_edge(var1, var2, color='g', weight=weight)
                        except:
                            continue

                if len(G.edges) == 0:
                    raise ValueError("No significant relationships found (p < 0.05) to draw network.")

                # Step 5: Draw graph
                pos = nx.circular_layout(G)
                colors = [G[u][v]['color'] for u,v in G.edges()]
                weights = [G[u][v]['weight'] for u,v in G.edges()]

                plt.figure(figsize=(14, 12))
                nx.draw(
                    G, pos,
                    with_labels=True,
                    font_size=10,
                    node_size=1500,
                    node_color='white',
                    edgecolors='black',
                    edge_color=colors,
                    width=weights
                )

                # Save graph image
                network_path = os.path.join(settings.MEDIA_ROOT, 'network_graph.png')
                plt.savefig(network_path, bbox_inches='tight', dpi=300)
                plt.close()

                results = {
                    'test': 'Network Graph',
                    'image_path': os.path.join(settings.MEDIA_URL, 'network_graph.png')
                }

            return render(request, 'analysis/results.html', {
                'results': results,
                'columns': [col1, col2, col3] if col3 else [col1, col2],
                'media_url': settings.MEDIA_URL,
                'plot_path': plot_path,
                'test_type': test_type
            })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    else:
        form = AnalysisForm(columns=[])
    
    return render(request, 'analysis/upload.html', {'form': form})

def process_kruskal_test(request, df, col1, col2):
    print(f"Column {col1} type: {df[col1].dtype}, contains NaN: {df[col1].isna().any()}")
    print(f"Column {col2} type: {df[col2].dtype}, contains NaN: {df[col2].isna().any()}")
    print(f"First few values of {col1}: {df[col1].head()}")
    print(f"First few values of {col2}: {df[col2].head()}")

    try:
        print("Attempting Kruskal-Wallis test...")
        stat, p_value = stats.kruskal(df[col1], df[col2])
        print(f"Kruskal-Wallis test result: Statistic = {stat}, P-value = {p_value}")
    except Exception as e:
        print(f"Error in Kruskal-Wallis test: {e}")
        raise ValueError(f"Error in Kruskal-Wallis test: {e}")



    """Process Kruskal-Wallis test with Bengali language support"""
    try:
        print("Starting Kruskal-Wallis test processing")
        # Get language preference
        language = request.POST.get('language', 'en')
        img_format = request.POST.get('format', 'png')
        use_default = request.POST.get('use_default', 'true') == 'true'

        print(f"Request Params - Language: {language}, Format: {img_format}, Use Default: {use_default}")
        print(f"Analyzing Columns: {col1} and {col2}")
        print(f"DataFrame head:\n{df[[col1, col2]].head()}")

        
        # Set up file paths
        media_root = settings.MEDIA_ROOT
        media_url = settings.MEDIA_URL
        plots_dir = os.path.join(media_root, 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        
        # Initialize translator
        translator = Translator()
        
        # Define digit mapping for Bengali
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')
        
        # Helper functions for Bengali translation and digit mapping
        def translate(text):
            if language == 'bn':
                try:
                    return translator.translate(text, dest='bn').text
                except:
                    return text
            return text
        
        def map_digits(s):
            if language == 'bn':
                return s.translate(digit_map_bn)
            return s
        
        # Set plot parameters
        if use_default:
            label_font_size = 36
            tick_font_size = 16
            img_quality = 90
            try:
                width, height = map(int, '800x600'.split('x'))
            except:
                width, height = 800, 600
            palette = 'deep'
            bar_width = 0.8
            box_width = 0.8
            violin_width = 0.8
        else:
            label_font_size = int(request.POST.get('label_font_size', 36))
            tick_font_size = int(request.POST.get('tick_font_size', 16))
            img_quality = int(request.POST.get('image_quality', 90))
            size_input = request.POST.get('image_size', '800x600')
            try:
                width, height = map(int, size_input.split('x'))
            except:
                width, height = 800, 600
            palette = request.POST.get('palette', 'deep')
            bar_width = float(request.POST.get('bar_width', 0.8))
            box_width = float(request.POST.get('box_width', 0.8))
            violin_width = float(request.POST.get('violin_width', 0.8))
        

        if language == 'bn':
            font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
            if not os.path.exists(font_path):
                bengali_font_name = 'sans-serif'
            else:
                fm.fontManager.addfont(font_path)
                bengali_font_name = fm.FontProperties(fname=font_path).get_name()
                matplotlib.rcParams['font.family'] = bengali_font_name
        
        # Perform Kruskal-Wallis test
        stat, p_value = stats.kruskal(df[col1], df[col2])

        print(f"Kruskal-Wallis test result: Statistic = {stat}, P-value = {p_value}")
        
        # Create and save visualizations
        image_paths = []

        def create_labeled_plot(fig, ax, title, xlabel, ylabel, base_filename, final_filename):
            plt.tight_layout(pad=0)
            
            base_path = os.path.join(plots_dir, base_filename)
            final_path = os.path.join(plots_dir, final_filename)

            if language == 'bn' and os.path.exists(font_path):
                # For Bengali, not set labels in matplotlib
                ax.set_title('')
                ax.set_xlabel('')
                ax.set_ylabel('')
                
                # Save base image without labels
                fig.savefig(base_path, bbox_inches='tight', dpi=300, format='PNG')
                plt.close(fig)
                
                # Add Bengali labels with PIL
                T = map_digits(translate(title))
                X = map_digits(translate(xlabel))
                Y = map_digits(translate(ylabel))
                
                label_font = ImageFont.truetype(font_path, size=label_font_size)
                
                tx0, ty0, tx1, ty1 = label_font.getbbox(T)
                th = ty1 - ty0
                xx0, xy0, xx1, xy1 = label_font.getbbox(X)
                xh = xy1 - xy0
                yx0, yy0, yx1, yy1 = label_font.getbbox(Y)
                yw, yh = yx1 - yx0, yy1 - yy0
                
                pad = label_font_size // 2
                lm, rm, tm, bm = yh + pad, pad, th + pad, xh + pad
                
                base_img = Image.open(base_path).convert("RGB")
                bw, bh = base_img.size
                W, H = bw + lm + rm, bh + tm + bm
                canvas = Image.new("RGB", (W, H), "white")
                canvas.paste(base_img, (lm, tm))
                draw = ImageDraw.Draw(canvas)
                
                def center_h(txt, fnt, total_w):
                    return (total_w - int(draw.textlength(txt, font=fnt))) // 2
                
                # Title
                tx = center_h(T, label_font, W)
                draw.text((tx, (tm - th) // 2), T, font=label_font, fill="black")
                
                # X-axis label
                xx = center_h(X, label_font, W)
                draw.text((xx, tm + bh + (bm - xh) // 2), X, font=label_font, fill="black")
                
                # Y-axis label rotated
                Yimg = Image.new("RGBA", (yw, yh), (255, 255, 255, 0))
                d2 = ImageDraw.Draw(Yimg)
                d2.text((0, 0), Y, font=label_font, fill="black")
                Yrot = Yimg.rotate(90, expand=True)
                canvas.paste(Yrot, ((lm - Yrot.width) // 2, tm + (bh - Yrot.height) // 2), Yrot)
                
                # Save the final image
                canvas.save(final_path, format=img_format.upper(), quality=img_quality, dpi=(300, 300), optimize=True)
            
            else:
                # For English, set the labels in matplotlib
                ax.set_title(title)
                ax.set_xlabel(xlabel)
                ax.set_ylabel(ylabel)
                
                # Save directly to final path
                fig.savefig(final_path, bbox_inches='tight', dpi=300, format=img_format.upper())
                plt.close(fig)
            
            return f"{media_url}plots/{final_filename}"
        
        # Prepare category labels
        categories = sorted(df[col1].unique())
        if language == 'bn':
            tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size) if os.path.exists(font_path) else None
            cat_labels = [map_digits(translate(str(c))) for c in categories]
        else:
            tick_prop = fm.FontProperties(size=tick_font_size)
            cat_labels = [str(c) for c in categories]
        
        # 1. Count plot
        fig1, ax1 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        sns.countplot(
            data=df, x=col1, hue=col2,
            palette=palette, width=bar_width, ax=ax1
        )
        ax1.set_xticks(range(len(categories)))
        ax1.set_xticklabels(cat_labels, fontproperties=tick_prop)
        
        yt = ax1.get_yticks().astype(int)
        yt_labels = [map_digits(str(i)) for i in yt] if language == 'bn' else [str(i) for i in yt]
        ax1.set_yticks(yt)
        ax1.set_yticklabels(yt_labels, fontproperties=tick_prop)
        
        leg = ax1.legend(prop=tick_prop)
        for txt, lbl in zip(leg.texts, sorted(df[col2].unique())):
            txt.set_text(map_digits(translate(str(lbl))))
        
        count_path = create_labeled_plot(
            fig1, ax1,
            title=f"{col1} vs {col2}",
            xlabel=col1,
            ylabel="Count",
            base_filename="count_base.png",
            final_filename=f"countplot.{img_format}"
        )
        image_paths.append(count_path)
        
        # 2. Box plot
        fig2, ax2 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        sns.boxplot(x=col1, y=col2, data=df, palette=palette, width=box_width, ax=ax2)
        ax2.set_xticks(range(len(categories)))
        ax2.set_xticklabels(cat_labels, fontproperties=tick_prop)
        
        yt2 = ax2.get_yticks()
        yt2_labels = [map_digits(f"{v:.2f}") for v in yt2] if language == 'bn' else [f"{v:.2f}" for v in yt2]
        ax2.set_yticks(yt2)
        ax2.set_yticklabels(yt2_labels, fontproperties=tick_prop)
        
        box_path = create_labeled_plot(
            fig2, ax2,
            title=f"Boxplot of {col2} by {col1}",
            xlabel=col1,
            ylabel=col2,
            base_filename="box_base.png",
            final_filename=f"boxplot.{img_format}"
        )
        image_paths.append(box_path)
        
        # 3. Violin plot
        fig3, ax3 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        sns.violinplot(x=col1, y=col2, data=df, palette=palette, width=violin_width, ax=ax3)
        ax3.set_xticks(range(len(categories)))
        ax3.set_xticklabels(cat_labels, fontproperties=tick_prop)
        
        yt3 = ax3.get_yticks()
        yt3_labels = [map_digits(f"{v:.2f}") for v in yt3] if language == 'bn' else [f"{v:.2f}" for v in yt3]
        ax3.set_yticks(yt3)
        ax3.set_yticklabels(yt3_labels, fontproperties=tick_prop)
        
        violin_path = create_labeled_plot(
            fig3, ax3,
            title=f"Violin Plot of {col2} by {col1}",
            xlabel=col1,
            ylabel=col2,
            base_filename="violin_base.png",
            final_filename=f"violinplot.{img_format}"
        )
        image_paths.append(violin_path)
        
        # Return results
        return JsonResponse({
            'test': 'Kruskal-Wallis H-test' if language == 'en' else 'ক্রুসকাল-ওয়ালিস এইচ-টেস্ট',
            'statistic': stat,
            'p_value': p_value,
            'success': True,
            'image_paths': image_paths
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

def save_plot(plt, filename):
    import os

    from django.conf import settings
    plot_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
    os.makedirs(plot_dir, exist_ok=True)
    full_path = os.path.join(plot_dir, filename)
    plot_path = os.path.join('plots', filename)

    try:
        plt.savefig(full_path)
        plt.close()
        return plot_path
    except Exception as e:
        print(f"Failed to save plot: {filename}. Error: {e}")
        return None