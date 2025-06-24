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
            print(f"Received test_type: {test_type}, col1: {col1}, col2: {col2}, col3: {col3}")
            
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
                return process_mannwhitney_test(request, df, col1, col2)

            
            elif test_type == 'spearman':
                heatmap_size = request.POST.get('heatmapSize', '2x2')
                if heatmap_size == '4x4':
                    col3 = request.POST.get('column3')
                    col4 = request.POST.get('column4')
                    selected_columns = [col1, col2, col3, col4]
                else:
                    selected_columns = [col1, col2]
                return process_spearman_test(request, df, selected_columns)
            

            elif test_type == 'pearson':
                heatmap_size = request.POST.get('heatmapSize', '2x2')
                if heatmap_size == '4x4':
                    col3 = request.POST.get('column3')
                    col4 = request.POST.get('column4')
                    selected_columns = [col1, col2, col3, col4]
                else:
                    selected_columns = [col1, col2]
                return process_pearson_test(request, df, selected_columns)
            
            elif test_type == 'wilcoxon':
                return process_wilcoxon_test(request, df, col1, col2)
            
            elif test_type == 'shapiro':
                return process_shapiro_test(request, df, col1)
            
            elif test_type == 'linear_regression':
                return process_linear_regression_test(request, df, col1, col2)
            
            elif test_type == 'anova':
                return process_anova_test(request, df, col1, col2)
            
            elif test_type == 'ancova':
                col_group = request.POST.get('primary_col')
                col_covariate = request.POST.get('secondary_col')
                col_outcome = request.POST.get('dependent_col')
                return process_ancova_test(request, df, col_group, col_covariate, col_outcome)

            elif test_type == 'kolmogorov':
                column = request.POST.get('column')
                return process_ks_test(request, df, column)

            elif test_type == 'anderson':
                column = request.POST.get('column')
                return process_anderson_darling_test(request, df, column)  
##
            elif test_type == 'fzt':
                col_group = request.POST.get('column1')
                col_value = request.POST.get('column2')
                return process_fzt_test(request, df, col_group, col_value)

            elif test_type == 'cross_tabulation':                
                columns = []
                for key in request.POST:
                    if key.startswith("column") and request.POST[key] in df.columns:
                        columns.append(request.POST[key])
                if len(columns) < 2:
                    raise ValueError("Cross-tabulation requires at least 2 columns.")
                return process_cross_tabulation(request, df, columns)

            elif test_type == 'eda_distribution':
                column = request.POST.get('column1')
                return process_eda_distribution(request, df, column)

            elif test_type == 'eda_swarm':
                column1 = request.POST.get('column1')  
                column2 = request.POST.get('column2')  
                return process_eda_swarm_plot(request, df, column1, column2)

            elif test_type == 'eda_pie':
                return process_eda_pie_chart(request, df)
            
            elif test_type == 'eda_basics':
                return process_eda_basics(request, df)

            elif test_type == 'similarity':
                return process_similarity(request, df)
            
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
            label_font_size = 46
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



def process_wilcoxon_test(request, df, col1, col2):
    try:
        # --- Setup ---
        language = request.POST.get('language', 'en')
        fmt = request.POST.get('format', 'png').lower()
        fmt = 'png' if fmt not in ('png','jpg','jpeg','pdf','tiff') else fmt
        pil_fmt = {'png':'PNG','jpg':'JPEG','jpeg':'JPEG','pdf':'PDF','tiff':'TIFF'}[fmt]

        # Paths
        media_root = settings.MEDIA_ROOT
        plots_dir = os.path.join(media_root, 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')

        # Customization
        use_default = request.POST.get('use_default', 'true') == 'true'
        label_font_size = int(request.POST.get('label_font_size', 46 if use_default else request.POST.get('label_font_size', 46)))
        tick_font_size  = int(request.POST.get('tick_font_size', 16 if use_default else request.POST.get('tick_font_size', 16)))
        img_quality     = int(request.POST.get('image_quality', 90))
        image_size      = request.POST.get('image_size', '800x600')
        width, height   = map(int, image_size.lower().split('x'))
        palette         = request.POST.get('palette', 'deep')
        hist_bins       = int(request.POST.get('bins', 30))
        alpha_val       = float(request.POST.get('alpha', 0.7))

        # Register font
        if language == 'bn' and os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            font_name = fm.FontProperties(fname=font_path).get_name()
            plt.rcParams['font.family'] = font_name
            tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size)
        else:
            tick_prop = fm.FontProperties(size=tick_font_size)
        label_font = ImageFont.truetype(font_path, size=label_font_size)

        # Translator
        translator = Translator()
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')
        def translate(text):
            return translator.translate(text, dest='bn').text if language == 'bn' else text
        def map_digits(s):
            return s.translate(digit_map_bn) if language == 'bn' else s

        # --- Perform test ---
        clean_data = df[[col1, col2]].dropna()
        if clean_data.empty:
            return JsonResponse({'success': False, 'error': 'No valid paired data found'})

        sample1 = clean_data[col1]
        sample2 = clean_data[col2]
        differences = sample1 - sample2
        stat, p_value = stats.wilcoxon(sample1, sample2)

        test_label = f"{col1} vs {col2}"
        results = {
            'test': 'Wilcoxon Signed Rank Test',
            'statistic': float(stat),
            'p_value': float(p_value),
            'interpretation': translate(
                "Reject null hypothesis: significant difference." if p_value < 0.05
                else "Fail to reject null hypothesis: no significant difference."
            )
        }

        image_paths = []

        # Helper: Create labeled plot
        def create_plot(fig, ax, title, xlabel, ylabel, base_name, legend_items=None):
            base_path = os.path.join(plots_dir, base_name + "_base.png")
            final_path = os.path.join(plots_dir, base_name + f".{fmt}")
            full_url = os.path.join(settings.MEDIA_URL, 'plots', os.path.basename(final_path))

            ax.set_title('')
            ax.set_xlabel('')
            ax.set_ylabel('')
            plt.tight_layout(pad=0)
            fig.savefig(base_path, dpi=300)
            plt.close(fig)

            base_img = Image.open(base_path).convert("RGB")
            bw, bh = base_img.size
            pad = label_font_size // 2
            x_w, x_h = label_font.getbbox(xlabel)[2:]
            y_w, y_h = label_font.getbbox(ylabel)[2:]
            tx = translate(title)
            xx = translate(xlabel)
            yy = translate(ylabel)
            T = map_digits(tx)
            X = map_digits(xx)
            Y = map_digits(yy)

            lm = y_h + pad
            rm = pad
            tm = label_font_size + pad
            bm = x_h + pad
            W = bw + lm + rm
            H = bh + tm + bm

            canvas = Image.new("RGB", (W, H), "white")
            canvas.paste(base_img, (lm, tm))
            draw = ImageDraw.Draw(canvas)

            def center_h(txt, fnt, total_w):
                return (total_w - int(draw.textlength(txt, font=fnt))) // 2

            draw.text((center_h(T, label_font, W), (tm - label_font_size) // 2),
                      T, font=label_font, fill="black")
            draw.text((center_h(X, label_font, W), tm + bh + (bm - x_h) // 2),
                      X, font=label_font, fill="black")

            y_img = Image.new("RGBA", (y_w, y_h), (255, 255, 255, 0))
            ImageDraw.Draw(y_img).text((0, 0), Y, font=label_font, fill="black")
            y_rot = y_img.rotate(90, expand=True)
            canvas.paste(y_rot, ((lm - y_rot.width) // 2, tm + (bh - y_rot.height) // 2), y_rot)

            canvas.save(final_path, format=pil_fmt, quality=img_quality)
            image_paths.append(full_url)

        # Plot 1: Histogram of differences
        fig1, ax1 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        ax1.hist(differences, bins=hist_bins, alpha=alpha_val,
                 color=sns.color_palette(palette)[0], edgecolor='black')
        ax1.axvline(x=0, color='red', linestyle='--', linewidth=2)
        create_plot(fig1, ax1, f"Distribution of Differences ({test_label})", "Differences", "Frequency", "wilcoxon_diff_hist")

        # Plot 2: Before vs After Scatter
        fig2, ax2 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        ax2.scatter(sample1, sample2, alpha=alpha_val,
                    color=sns.color_palette(palette)[1], s=50)
        mn, mx = min(sample1.min(), sample2.min()), max(sample1.max(), sample2.max())
        ax2.plot([mn, mx], [mn, mx], 'r--', linewidth=2)
        create_plot(fig2, ax2, f"Before vs After Plot ({col1} vs {col2})", col1, col2, "wilcoxon_scatter")

        # Plot 3: Q-Q Plot
        fig3, ax3 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        stats.probplot(differences, dist="norm", plot=ax3)
        create_plot(fig3, ax3, "Q-Q Plot of Differences (Normality Check)",
                    "Theoretical Quantiles", "Sample Quantiles", "wilcoxon_qq")

        # Plot 4: Boxplot of differences
        fig4, ax4 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        bp = ax4.boxplot(differences, patch_artist=True, vert=True)
        bp['boxes'][0].set_facecolor(sns.color_palette(palette)[0])
        bp['boxes'][0].set_alpha(alpha_val)
        ax4.axhline(y=0, color='red', linestyle='--', linewidth=2)
        ax4.set_xticklabels([''], fontproperties=tick_prop)
        create_plot(fig4, ax4, f"Box Plot of Differences ({test_label})",
                    test_label, "Differences", "wilcoxon_box")

        results['image_paths'] = image_paths
        results['success'] = True
        return JsonResponse(results)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    

def process_mannwhitney_test(request, df, col1, col2):
    
    
    from scipy.stats import mannwhitneyu, rankdata
    
    try:
        # --- 1. Setup ---
        lang = request.POST.get('language', 'en')
        img_format = request.POST.get('format', 'png')
        use_def = request.POST.get('use_default', 'true') == 'true'
        pil_fmt = {'png': 'PNG', 'jpg': 'JPEG', 'jpeg': 'JPEG', 'pdf': 'PDF', 'tiff': 'TIFF'}[img_format]

        translator = Translator()
        def translate(text): return translator.translate(text, dest='bn').text if lang == 'bn' else text
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')
        def map_digits(s): return s.translate(digit_map_bn) if lang == 'bn' else s

        if use_def:
            label_font_size, tick_font_size, img_quality = 46, 16, 90
            fig_width, fig_height = 8, 6
            palette = 'deep'
            box_width = violin_width = rank_bar_width = 0.8
        else:
            label_font_size = int(request.POST.get('label_font_size', 36))
            tick_font_size = int(request.POST.get('tick_font_size', 16))
            img_quality = int(request.POST.get('image_quality', 90))
            size_str = request.POST.get('image_size', '8x6')
            fig_width, fig_height = map(float, size_str.split('x'))
            palette = request.POST.get('palette', 'deep')
            box_width = float(request.POST.get('box_width', 0.8))
            violin_width = float(request.POST.get('violin_width', 0.8))
            rank_bar_width = float(request.POST.get('rank_bar_width', 0.8))

        # --- 2. Font setup ---
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        fm.fontManager.addfont(font_path)
        bengali_font_name = fm.FontProperties(fname=font_path).get_name()
        plt.rcParams['font.family'] = bengali_font_name
        tick_bn = fm.FontProperties(fname=font_path, size=tick_font_size)
        tick_en = fm.FontProperties(size=tick_font_size)
        label_font = ImageFont.truetype(font_path, label_font_size)

        # --- 3. Create image output folder ---
        media_root = settings.MEDIA_ROOT
        media_url = settings.MEDIA_URL
        plots_dir = os.path.join(media_root, 'plots')
        os.makedirs(plots_dir, exist_ok=True)

        # --- 4. Mann–Whitney U test ---
        u_stat, p_value = mannwhitneyu(df[col1], df[col2], alternative='two-sided')
        result = {
            'test': 'Mann-Whitney U Test' if lang == 'en' else 'ম্যান-হুইটনি ইউ টেস্ট',
            'statistic': float(u_stat),
            'p_value': float(p_value),
            'conclusion': translate('Significant difference' if p_value < 0.05 else 'No significant difference'),
            'success': True,
        }

        # --- 5. PIL Bengali label drawing ---
        def create_labeled_plot(fig, ax, title, xlabel, ylabel, tmp, out):
            ax.set_title('')
            ax.set_xlabel('')
            ax.set_ylabel('')
            fig.savefig(tmp, dpi=300, format='PNG')
            plt.close(fig)

            T = map_digits(translate(title))
            X = map_digits(translate(xlabel))
            Y = map_digits(translate(ylabel))
            tx0, ty0, tx1, ty1 = label_font.getbbox(T); th = ty1 - ty0
            xx0, xy0, xx1, xy1 = label_font.getbbox(X); xh = xy1 - xy0
            yx0, yy0, yx1, yy1 = label_font.getbbox(Y); yw, yh = yx1 - yx0, yy1 - yy0
            pad = label_font_size // 2
            lm, rm, tm, bm = yh + pad, pad, th + pad, xh + pad

            bg = Image.open(tmp).convert('RGB'); bw, bh = bg.size
            W, H = bw + lm + rm, bh + tm + bm
            canvas = Image.new('RGB', (W, H), 'white'); canvas.paste(bg, (lm, tm))
            draw = ImageDraw.Draw(canvas)
            def ch(txt, fnt, w): return (w - int(draw.textlength(txt, font=fnt))) // 2

            draw.text((ch(T, label_font, W), (tm - th) // 2), T, font=label_font, fill='black')
            draw.text((ch(X, label_font, W), tm + bh + (bm - xh) // 2), X, font=label_font, fill='black')

            Yimg = Image.new('RGBA', (yw, yh), (255, 255, 255, 0))
            d2 = ImageDraw.Draw(Yimg)
            d2.text((0, 0), Y, font=label_font, fill='black')
            Yrot = Yimg.rotate(90, expand=True)
            canvas.paste(Yrot, ((lm - Yrot.width) // 2, tm + (bh - Yrot.height) // 2), Yrot)

            canvas.save(out, format=pil_fmt, quality=img_quality)

        # --- 6. Category labels ---
        cats = sorted(df[col1].unique())
        cat_labels = [map_digits(translate(str(c))) for c in cats] if lang == 'bn' else [str(c) for c in cats]

        image_paths = []

        # --- 7a. Boxplot ---
        fig, ax = plt.subplots(figsize=(fig_width, fig_height))
        sns.boxplot(x=col1, y=col2, data=df, palette=palette, width=box_width, ax=ax)
        ax.set_xticks(cats)
        ax.set_xticklabels(cat_labels, fontproperties=(tick_bn if lang == 'bn' else tick_en))
        ax.set_yticklabels([map_digits(f"{v:.2f}") for v in ax.get_yticks()], fontproperties=(tick_bn if lang == 'bn' else tick_en))
        tmp = os.path.join(plots_dir, 'mann_box_tmp.png')
        out = os.path.join(plots_dir, f'mannwhitney_boxplot.{img_format}')
        create_labeled_plot(fig, ax, f"Boxplot of {col2} by {col1}", col1, col2, tmp, out)
        image_paths.append(os.path.join(media_url, 'plots', f'mannwhitney_boxplot.{img_format}'))

        # --- 7b. Violinplot ---
        fig, ax = plt.subplots(figsize=(fig_width, fig_height))
        sns.violinplot(x=col1, y=col2, data=df, palette=palette, width=violin_width, ax=ax)
        ax.set_xticks(cats)
        ax.set_xticklabels(cat_labels, fontproperties=(tick_bn if lang == 'bn' else tick_en))
        ax.set_yticklabels([map_digits(f"{v:.2f}") for v in ax.get_yticks()], fontproperties=(tick_bn if lang == 'bn' else tick_en))
        tmp = os.path.join(plots_dir, 'mann_violin_tmp.png')
        out = os.path.join(plots_dir, f'mannwhitney_violinplot.{img_format}')
        create_labeled_plot(fig, ax, f"Violin plot of {col2} by {col1}", col1, col2, tmp, out)
        image_paths.append(os.path.join(media_url, 'plots', f'mannwhitney_violinplot.{img_format}'))

        # --- 7c. Rank plot ---
        ranks = rankdata(df[col2].values)
        rdf = df.copy(); rdf['__rank'] = ranks
        avg = rdf.groupby(col1)['__rank'].mean().reset_index()
        fig, ax = plt.subplots(figsize=(fig_width, fig_height))
        sns.barplot(x=col1, y='__rank', data=avg, palette=palette, width=rank_bar_width, ax=ax)
        ax.set_xticks(cats)
        ax.set_xticklabels(cat_labels, fontproperties=(tick_bn if lang == 'bn' else tick_en))
        ax.set_yticklabels([map_digits(f"{v:.2f}") for v in ax.get_yticks()], fontproperties=(tick_bn if lang == 'bn' else tick_en))
        tmp = os.path.join(plots_dir, 'mann_rank_tmp.png')
        out = os.path.join(plots_dir, f'mannwhitney_rankplot.{img_format}')
        create_labeled_plot(fig, ax, f"Average rank of {col2} by {col1}", col1, translate("Average Rank"), tmp, out)
        image_paths.append(os.path.join(media_url, 'plots', f'mannwhitney_rankplot.{img_format}'))

        result['image_paths'] = image_paths
        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def process_shapiro_test(request, df, col1):
    
    import re

    from scipy.stats import norm, shapiro
    try:
        # --- Request parameters ---
        language = request.POST.get('language', 'en')
        img_format = request.POST.get('format', 'png')
        use_default = request.POST.get('use_default', 'true') == 'true'

        # --- Translator & digit mapper ---
        translator = Translator()
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')
        def translate(text):
            return translator.translate(text, dest='bn').text if language == 'bn' else text
        def map_digits(s):
            return s.translate(digit_map_bn) if language == 'bn' else s

        # Check for numeric column
        if not pd.api.types.is_numeric_dtype(df[col1]):
            return JsonResponse({
                'success': False,
                'error': translate("Please select a numerical column for Shapiro-Wilk test.")
            })

        # --- Font and Paths ---
        media_root = settings.MEDIA_ROOT
        plots_dir = os.path.join(media_root, 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')

        # --- Plot customization ---
        if use_default:
            label_font_size, tick_font_size = 46, 16
            img_quality = 90
            width, height = 800, 600
            bins = 30
            bar_color = 'steelblue'
            line_color = 'red'
            line_style = '-'
        else:
            label_font_size = int(request.POST.get('label_font_size', 36))
            tick_font_size = int(request.POST.get('tick_font_size', 16))
            img_quality = int(request.POST.get('image_quality', 90))
            width, height = map(int, request.POST.get('image_size', '800x600').split('x'))
            bins = int(request.POST.get('bins', 30))
            bar_color = request.POST.get('bar_color', 'steelblue')
            line_color = request.POST.get('line_color', 'red')
            style_input = request.POST.get('line_style', 'solid')
            line_style = {'solid': '-', 'dashed': '--', 'dotted': ':'}.get(style_input, '-')

        if language == 'bn' and os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            font_name = fm.FontProperties(fname=font_path).get_name()
            plt.rcParams['font.family'] = font_name
            tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size)
        else:
            tick_prop = fm.FontProperties(size=tick_font_size)

        label_font = ImageFont.truetype(font_path, size=label_font_size)

        # --- Perform test ---
        data = df[col1].dropna()
        stat, p_value = shapiro(data)
        p_str = map_digits(f"{p_value:.4f}")
        interpretation = translate("Likely Normal (p > 0.05)") if p_value > 0.05 else translate("Likely Not Normal (p ≤ 0.05)")

        # --- Plot ---
        fig, ax = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        sns.histplot(data, kde=True, bins=bins, stat='density', color=bar_color, ax=ax)
        x_vals = np.linspace(data.mean() - 4 * data.std(), data.mean() + 4 * data.std(), 200)
        ax.plot(x_vals, norm.pdf(x_vals, data.mean(), data.std()), color=line_color, linestyle=line_style)

        ax.set_title('')
        ax.set_xlabel('')
        ax.set_ylabel('')
        ax.set_xticklabels([map_digits(f"{val:.0f}") for val in ax.get_xticks()], fontproperties=tick_prop)
        ax.set_yticklabels([map_digits(f"{val:.2f}") for val in ax.get_yticks()], fontproperties=tick_prop)
        plt.tight_layout(pad=0)

        # --- Save base plot ---
        safe_col_name = re.sub(r'[\\/*?:"<>|]', "_", col1)
        base_name = f"shapiro_{safe_col_name.replace(' ', '_')}"
        base_path = os.path.join(plots_dir, base_name + '.png')
        fig.savefig(base_path, dpi=300)
        plt.close(fig)

        # --- PIL overlay ---
        img = Image.open(base_path).convert("RGB")
        bw, bh = img.size
        pad = label_font_size // 2
        xlabel = translate(col1)
        ylabel = translate("Density")
        title = translate(f"Normality Check of {col1}")

        x_w, x_h = label_font.getbbox(xlabel)[2:]
        y_w, y_h = label_font.getbbox(ylabel)[2:]
        t_w, t_h = label_font.getbbox(title)[2:]

        canvas = Image.new('RGB', (bw + y_h + pad * 2, bh + x_h + pad * 2 + t_h + pad), 'white')
        canvas.paste(img, (y_h + pad, pad + t_h + pad))
        draw = ImageDraw.Draw(canvas)

        # Title
        draw.text(((canvas.width - t_w) // 2, pad), title, font=label_font, fill='black')
        # X-label
        draw.text(((canvas.width - x_w) // 2, pad + t_h + pad + bh), xlabel, font=label_font, fill='black')
        # Y-label rotated
        y_img = Image.new('RGBA', (y_w, y_h), (255, 255, 255, 0))
        ImageDraw.Draw(y_img).text((0, 0), ylabel, font=label_font, fill='black')
        y_rot = y_img.rotate(90, expand=True)
        canvas.paste(y_rot, ((y_h - y_rot.width) // 2, pad + t_h + pad + (bh - y_rot.height) // 2), y_rot)

        final_path = os.path.join(plots_dir, base_name + '.' + img_format)
        canvas.save(final_path, format=img_format.upper(), quality=img_quality)

        return JsonResponse({
            'success': True,
            'test': translate("Shapiro-Wilk Test"),
            'statistic': float(stat),
            'p_value': float(p_value),
            'interpretation': interpretation,
            'image_path': os.path.join(settings.MEDIA_URL, 'plots', base_name + '.' + img_format)
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    


def process_spearman_test(request, df, selected_columns):
    import os
    from itertools import combinations

    import matplotlib as mpl
    import matplotlib.font_manager as fm
    import matplotlib.pyplot as plt
    import seaborn as sns
    from django.conf import settings
    from django.http import JsonResponse
    from googletrans import Translator
    from PIL import Image, ImageDraw, ImageFont
    from scipy.stats import spearmanr

    try:
        language = request.POST.get('language', 'en')
        img_format = request.POST.get('format', 'png')
        use_default = request.POST.get('use_default', 'true') == 'true'

        translator = Translator()
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')
        def translate(text): return translator.translate(text, dest='bn').text if language == 'bn' else text
        def map_digits(s): return s.translate(digit_map_bn) if language == 'bn' else s

        if use_default:
            label_font_size = 36
            tick_font_size = 16
            img_quality = 90
            width, height = 800, 600
            plot_color = 'coolwarm'
            bar_width = 0.8
        else:
            label_font_size = int(request.POST.get('label_font_size', 36))
            tick_font_size = int(request.POST.get('tick_font_size', 16))
            img_quality = int(request.POST.get('image_quality', 90))
            width, height = map(int, request.POST.get('image_size', '800x600').split('x'))
            plot_color = request.POST.get('palette', 'coolwarm')
            bar_width = float(request.POST.get('bar_width', 0.8))

        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        if os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            mpl.rcParams['font.family'] = fm.FontProperties(fname=font_path).get_name()
        label_font = ImageFont.truetype(font_path, size=label_font_size)
        tick_font = ImageFont.truetype(font_path, size=tick_font_size)

        plots_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plots_dir, exist_ok=True)

        for col in selected_columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        corr_mat = pd.DataFrame(index=selected_columns, columns=selected_columns, dtype=float)
        pval_mat = pd.DataFrame(index=selected_columns, columns=selected_columns, dtype=float)
        for c in selected_columns:
            corr_mat.loc[c, c] = 1.0
            pval_mat.loc[c, c] = 0.0
        for c1, c2 in combinations(selected_columns, 2):
            rho, p = spearmanr(df[c1].dropna(), df[c2].dropna())
            corr_mat.loc[c1, c2] = corr_mat.loc[c2, c1] = rho
            pval_mat.loc[c1, c2] = pval_mat.loc[c2, c1] = p

        corr_str = corr_mat.round(4).astype(str).applymap(map_digits)

        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        sns.heatmap(
            corr_mat.astype(float), annot=corr_str.values, fmt='', cmap=plot_color,
            vmin=-1, vmax=1, square=True, linewidths=bar_width, linecolor='white',
            cbar_kws={'shrink': 0.7},
            annot_kws={'fontproperties': fm.FontProperties(fname=font_path, size=tick_font_size),
                       'fontsize': tick_font_size}, ax=ax
        )

        def create_labeled_plot(fig, ax, title, base_name):
            ax.set_title('')
            ax.set_xlabel('')
            ax.set_ylabel('')
            ax.set_xticks([])
            ax.set_yticks([])
            fig.tight_layout(pad=0)

            cbar = ax.collections[0].colorbar
            cbar.set_ticklabels([map_digits(f"{t:.2f}") for t in cbar.get_ticks()])
            cbar.set_label('')

            base_path = os.path.join(plots_dir, base_name + '.png')
            # fig.savefig(base_path, dpi=300, format='PNG')
            fig.savefig(base_path, dpi=fig.dpi, format='PNG')
            plt.close(fig)

            img = Image.open(base_path).convert('RGB')
            bw, bh = img.size

            tx = map_digits(translate(title))
            tx_w, tx_h = label_font.getbbox(tx)[2:]
            ticks = [map_digits(translate(c)) for c in selected_columns]
            wrapped, widths, heights = [], [], []
            for t in ticks:
                lines = [' '.join(t.split()[i:i+3]) for i in range(0, len(t.split()), 3)]
                txt = '\n'.join(lines)
                wrapped.append(txt)
                widths.append(max(tick_font.getbbox(l)[2] for l in lines))
                heights.append(len(lines) * tick_font.getbbox(lines[0])[3])
            max_tick_w, max_tick_h = max(widths), max(heights)

            pad = label_font_size // 2
            lm = max_tick_w + pad
            rm = pad
            tm = tx_h + pad
            bm = max_tick_h + pad
            W, H = bw + lm + rm, bh + tm + bm

            canvas = Image.new('RGB', (W, H), 'white')
            canvas.paste(img, (lm, tm))
            draw = ImageDraw.Draw(canvas)
            draw.text(((W - tx_w) / 2, (tm - tx_h) / 2), tx, font=label_font, fill='black')

            heat_pos = ax.get_position()
            fig_w_px = fig.get_size_inches()[0] * fig.dpi
            hm_x0 = heat_pos.x0 * fig_w_px + lm
            hm_w = heat_pos.width * fig_w_px
            n = len(wrapped)
            for i, txt in enumerate(wrapped):
                block_w = widths[i]
                x_center = hm_x0 + (hm_w / n) * (i + 0.5)
                x0 = x_center - block_w / 2
                y0 = tm + bh + pad
                draw.multiline_text((x0, y0), txt, font=tick_font, fill='black')

            ch = bh / n
            for i, txt in enumerate(wrapped):
                block_h = heights[i]
                x0 = lm - max_tick_w - pad
                y0 = tm + ch * (i + 0.5) - block_h / 2
                draw.multiline_text((x0, y0), txt, font=tick_font, fill='black')

            cb_label = map_digits(translate('Spearman Coefficient'))
            cb_w, cb_h = tick_font.getbbox(cb_label)[2:]
            Cimg = Image.new('RGBA', (cb_w, cb_h), (255, 255, 255, 0))
            ImageDraw.Draw(Cimg).text((0, 0), cb_label, font=tick_font, fill='black')
            Crot = Cimg.rotate(90, expand=True)
            # x_cb = lm + bw + pad // 4
            x_cb = lm + bw - tick_font_size // 2
            y_cb = tm + (bh - Crot.height) / 2
            canvas.paste(Crot, (int(x_cb), int(y_cb)), Crot)

            final_path = os.path.join(plots_dir, base_name + '.' + img_format)
            canvas.save(final_path, format=img_format.upper(), quality=img_quality)
            return os.path.join(settings.MEDIA_URL, 'plots', base_name + '.' + img_format)

        image_url = create_labeled_plot(fig, ax, translate("Spearman Rank Correlation Heatmap"), "spearman_heatmap")

        return JsonResponse({
            'success': True,
            'image_paths': [image_url],
            'columns': selected_columns,
            'message': translate("Spearman correlation matrix completed.")
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    


def process_pearson_test(request, df, selected_columns):
    import os
    from itertools import combinations

    import matplotlib as mpl
    import matplotlib.font_manager as fm
    import matplotlib.pyplot as plt
    import seaborn as sns
    from django.conf import settings
    from django.http import JsonResponse
    from googletrans import Translator
    from PIL import Image, ImageDraw, ImageFont
    from scipy.stats import pearsonr

    try:
        language = request.POST.get('language', 'en')
        img_format = request.POST.get('format', 'png')
        use_default = request.POST.get('use_default', 'true') == 'true'

        # Translate & digit helper
        translator = Translator()
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')

        def translate(text):
            return translator.translate(text, dest='bn').text if language == 'bn' else text

        def map_digits(s):
            return s.translate(digit_map_bn) if language == 'bn' else s

        # Settings
        if use_default:
            label_font_size = 36
            tick_font_size = 16
            img_quality = 90
            width, height = 800, 600
            plot_color = 'coolwarm'
            bar_width = 0.8
        else:
            label_font_size = int(request.POST.get('label_font_size', 36))
            tick_font_size = int(request.POST.get('tick_font_size', 16))
            img_quality = int(request.POST.get('image_quality', 90))
            size_input = request.POST.get('image_size', '800x600')
            width, height = map(int, size_input.split('x'))
            plot_color = request.POST.get('palette', 'coolwarm')
            bar_width = float(request.POST.get('bar_width', 0.8))

        # Font
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        if os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            mpl.rcParams['font.family'] = fm.FontProperties(fname=font_path).get_name()
        label_font = ImageFont.truetype(font_path, size=label_font_size)
        tick_font = ImageFont.truetype(font_path, size=tick_font_size)

        plots_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plots_dir, exist_ok=True)

        # Ensure numeric
        for col in selected_columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        # Compute correlation and p-value matrices
        corr_mat = pd.DataFrame(index=selected_columns, columns=selected_columns, dtype=float)
        pval_mat = pd.DataFrame(index=selected_columns, columns=selected_columns, dtype=float)

        for c in selected_columns:
            corr_mat.loc[c, c] = 1.0
            pval_mat.loc[c, c] = 0.0

        for c1, c2 in combinations(selected_columns, 2):
            r, p = pearsonr(df[c1].dropna(), df[c2].dropna())
            corr_mat.loc[c1, c2] = corr_mat.loc[c2, c1] = r
            pval_mat.loc[c1, c2] = pval_mat.loc[c2, c1] = p

        corr_str = corr_mat.round(4).astype(str).applymap(map_digits)
        pval_str = pval_mat.round(4).astype(str).applymap(map_digits)

        # Plot heatmap
        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        sns.heatmap(
            corr_mat.astype(float), annot=corr_str.values, fmt='', cmap=plot_color,
            vmin=-1, vmax=1, square=True, linewidths=bar_width, linecolor='white',
            cbar_kws={'shrink': 0.7},
            annot_kws={'fontproperties': fm.FontProperties(fname=font_path, size=tick_font_size),
                       'fontsize': tick_font_size}, ax=ax
        )



        # Helper to render labels and ticks with PIL
        def create_labeled_plot(fig, ax, title, base_name):
            ax.set_title('')
            ax.set_xlabel('')
            ax.set_ylabel('')
            ax.set_xticks([])
            ax.set_yticks([])
            fig.tight_layout(pad=0)

            cbar = ax.collections[0].colorbar
            cbar.set_ticklabels([map_digits(f"{t:.2f}") for t in cbar.get_ticks()])
            cbar.set_label('')

            base_path = os.path.join(plots_dir, base_name + '.png')
            # fig.savefig(base_path, dpi=300, format='PNG')
            fig.savefig(base_path, dpi=fig.dpi, format='PNG')
            plt.close(fig)

            img = Image.open(base_path).convert('RGB')
            bw, bh = img.size

            tx = map_digits(translate(title))
            tx_w, tx_h = label_font.getbbox(tx)[2:]

            ticks = [map_digits(translate(c)) for c in selected_columns]
            wrapped, widths, heights = [], [], []
            for t in ticks:
                lines = [' '.join(t.split()[i:i+3]) for i in range(0, len(t.split()), 3)]
                txt = '\n'.join(lines)
                wrapped.append(txt)
                widths.append(max(tick_font.getbbox(l)[2] for l in lines))
                heights.append(len(lines) * tick_font.getbbox(lines[0])[3])
            max_tick_w, max_tick_h = max(widths), max(heights)

            pad = label_font_size // 2
            lm = max_tick_w + pad
            rm = pad
            tm = tx_h + pad
            bm = max_tick_h + pad
            W, H = bw + lm + rm, bh + tm + bm

            canvas = Image.new('RGB', (W, H), 'white')
            canvas.paste(img, (lm, tm))
            draw = ImageDraw.Draw(canvas)

            draw.text(((W - tx_w) / 2, (tm - tx_h) / 2), tx, font=label_font, fill='black')

            heat_pos = ax.get_position()
            fig_w_px = fig.get_size_inches()[0] * fig.dpi
            hm_x0 = heat_pos.x0 * fig_w_px + lm
            hm_w = heat_pos.width * fig_w_px
            n = len(wrapped)
            for i, txt in enumerate(wrapped):
                block_w = widths[i]
                x_center = hm_x0 + (hm_w / n) * (i + 0.5)
                x0 = x_center - block_w / 2
                y0 = tm + bh + pad
                draw.multiline_text((x0, y0), txt, font=tick_font, fill='black')

            ch = bh / n
            for i, txt in enumerate(wrapped):
                block_h = heights[i]
                x0 = lm - max_tick_w - pad
                y0 = tm + ch * (i + 0.5) - block_h / 2
                draw.multiline_text((x0, y0), txt, font=tick_font, fill='black')

            cb_label = map_digits(translate('Correlation Coefficient'))
            cb_w, cb_h = tick_font.getbbox(cb_label)[2:]
            Cimg = Image.new('RGBA', (cb_w, cb_h), (255, 255, 255, 0))
            ImageDraw.Draw(Cimg).text((0, 0), cb_label, font=tick_font, fill='black')
            Crot = Cimg.rotate(90, expand=True)
            # x_cb = lm + bw + pad // 4
            x_cb = lm + bw - tick_font_size // 4 

            y_cb = tm + (bh - Crot.height) / 2
            canvas.paste(Crot, (int(x_cb), int(y_cb)), Crot)

            final_path = os.path.join(plots_dir, base_name + '.' + img_format)
            canvas.save(final_path, format=img_format.upper(), quality=img_quality)
            return os.path.join(settings.MEDIA_URL, 'plots', base_name + '.' + img_format)

        img_url = create_labeled_plot(fig, ax, title=translate("Pearson Correlation Heatmap"), base_name="pearson_heatmap")

        return JsonResponse({
            'success': True,
            'image_paths': [img_url],
            'columns': selected_columns,
            'message': translate("Pearson correlation matrix completed.")
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
def process_linear_regression_test(request, df, col1, col2):
    import os
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import r2_score, mean_squared_error
    import matplotlib.font_manager as fm
    from PIL import Image, ImageDraw, ImageFont
    from googletrans import Translator
    from django.conf import settings
    from django.http import JsonResponse

    try:
        # Handle options from request
        lang = request.POST.get('language', 'en')
        file_format = request.POST.get('format', 'png')
        use_default = request.POST.get('use_default', 'true') == 'true'

        # Plot settings
        if use_default:
            axis_label_size = 36
            tick_label_size = 16
            legend_font_size = 16
            line_color = 'red'
            line_style = '-'
            image_quality = 90
            dot_width = 5
            line_width = 2
            dot_color = 'blue'
        else:
            axis_label_size = int(request.POST.get('label_font_size', 36))
            tick_label_size = int(request.POST.get('tick_label_size', 16))
            legend_font_size = int(request.POST.get('legend_font_size', 16))
            line_color = request.POST.get('line_color', 'red')
            line_style = request.POST.get('line_style', '-')
            image_quality = int(request.POST.get('image_quality', 90))
            dot_width = int(request.POST.get('dot_width', 5))
            line_width = int(request.POST.get('line_width', 2))
            dot_color = request.POST.get('dot_color', 'blue')

        # Setup font and translator
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        translator = Translator()
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')

        def translate(text):
            return translator.translate(text, dest='bn').text if lang == 'bn' else text

        def map_digits(s):
            return s.translate(digit_map_bn) if lang == 'bn' else s

        # Font config
        if os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            tick_prop = fm.FontProperties(fname=font_path, size=tick_label_size) if lang == 'bn' else fm.FontProperties(size=tick_label_size)
            title_font = ImageFont.truetype(font_path, size=axis_label_size)
            xlabel_font = ImageFont.truetype(font_path, size=axis_label_size)
            ylabel_font = ImageFont.truetype(font_path, size=axis_label_size)
            legend_font = ImageFont.truetype(font_path, size=legend_font_size)
        else:
            tick_prop = fm.FontProperties(size=tick_label_size)
            title_font = xlabel_font = ylabel_font = legend_font = ImageFont.load_default()

        # Linear Regression
        X = df[[col1]]
        y = df[col2]
        model = LinearRegression().fit(X, y)
        y_pred = model.predict(X)

        # Metrics
        intercept = model.intercept_
        coef = model.coef_[0]
        r2 = r2_score(y, y_pred)
        mse = mean_squared_error(y, y_pred)

        # Round and localize
        def format_metric(value, decimals):
            return f"{value:.{decimals}f}" if lang == 'en' else map_digits(f"{value:.{decimals}f}")

        result = {
            'test': 'Linear Regression' if lang == 'en' else 'লিনিয়ার রিগ্রেশন',
            'intercept': format_metric(intercept, 2),
            'coefficient': format_metric(coef, 2),
            'r2_score': format_metric(r2, 3),
            'mse': format_metric(mse, 3),
            'success': True
        }

        # Plot
        fig, ax = plt.subplots(figsize=(8, 6), dpi=100)
        ax.scatter(X, y, s=dot_width, color=dot_color, alpha=0.7)
        ax.plot(X, y_pred, color=line_color, linestyle=line_style, linewidth=line_width)
        ax.set_xticks(ax.get_xticks())
        ax.set_xticklabels([map_digits(f"{t:.0f}") for t in ax.get_xticks()], fontproperties=tick_prop)
        ax.set_yticks(ax.get_yticks())
        ax.set_yticklabels([map_digits(f"{t:.2f}") for t in ax.get_yticks()], fontproperties=tick_prop)
        plt.tight_layout(pad=0)

        plots_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        base_path = os.path.join(plots_dir, f'regression_base.{file_format}')
        fig.savefig(base_path, format=file_format.upper())
        plt.close(fig)

        # PIL overlay
        canvas = Image.open(base_path).convert('RGB')
        bw, bh = canvas.size
        pad = 50
        title_txt = translate(f"Linear Regression: {col2} vs {col1}")
        xlabel_txt = translate(col1)
        ylabel_txt = translate(col2)
        legend_items = [
            (translate('Data Points'), 'dot', dot_color),
            (translate('Regression Line'), 'line', line_color)
        ]

        draw = ImageDraw.Draw(canvas)
        _, _, tw, th = draw.textbbox((0, 0), title_txt, font=title_font)
        _, _, xw, xh = draw.textbbox((0, 0), xlabel_txt, font=xlabel_font)
        _, _, yw, yh = draw.textbbox((0, 0), ylabel_txt, font=ylabel_font)

        left_margin = yw + pad
        legend_text_max = max(draw.textlength(item[0], font=legend_font) for item in legend_items)
        legend_height = (legend_font_size + 10) * len(legend_items)
        legend_width = 20 + 10 + legend_text_max
        right_margin = legend_width + pad
        top_margin = th + pad
        bottom_margin = xh + pad

        W = left_margin + bw + right_margin
        H = max(top_margin + bh + bottom_margin, top_margin + legend_height + pad)
        new_canvas = Image.new('RGB', (int(W), int(H)), 'white')
        new_canvas.paste(canvas, (left_margin, top_margin))

        draw = ImageDraw.Draw(new_canvas)
        draw.text(((W - tw) // 2, 0), title_txt, font=title_font, fill='black')
        draw.text((left_margin + (bw - xw) // 2, top_margin + bh + (bottom_margin - xh) // 2), xlabel_txt, font=xlabel_font, fill='black')

        Yimg = Image.new('RGBA', (yw, yh), (255, 255, 255, 0))
        Ydraw = ImageDraw.Draw(Yimg)
        Ydraw.text((0, 0), ylabel_txt, font=ylabel_font, fill='black')
        Yrot = Yimg.rotate(90, expand=True)
        y_x = (left_margin - Yrot.width) // 2
        y_y = top_margin + (bh - Yrot.height) // 2
        new_canvas.paste(Yrot, (y_x, y_y), Yrot)

        lx = left_margin + bw + pad
        ly = top_margin
        for label, style, color in legend_items:
            if style == 'dot':
                draw.ellipse((lx, ly + 5, lx + dot_width, ly + 5 + dot_width), fill=color)
            else:
                y_mid = ly + legend_font_size // 2
                draw.line((lx, y_mid, lx + 20, y_mid), fill=color, width=line_width)
            draw.text((lx + 30, ly), label, font=legend_font, fill='black')
            ly += legend_font_size + 10

        final_path = os.path.join(plots_dir, f'regression_plot.{file_format}')
        new_canvas.save(final_path, format=file_format.upper(), quality=image_quality)
        result['image_paths'] = [os.path.join(settings.MEDIA_URL, 'plots/', 'regression_plot.' + file_format)]

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def process_anova_test(request, df, col1, col2):
    import os
    import numpy as np
    import matplotlib.pyplot as plt
    import seaborn as sns
    import matplotlib.font_manager as fm
    from PIL import Image, ImageDraw, ImageFont
    from statsmodels.formula.api import ols
    import statsmodels.api as sm
    from googletrans import Translator
    from django.conf import settings
    from django.http import JsonResponse

    try:
        # Language & format
        language = request.POST.get('language', 'en')
        img_format = request.POST.get('format', 'png').lower()
        use_default = request.POST.get('use_default', 'true') == 'true'
        image_quality = int(request.POST.get('image_quality', 90))

        # Plot style settings
        if use_default:
            axis_label_size = 36
            tick_label_size = 16
            box_color = 'steelblue'
            median_color = 'red'
        else:
            axis_label_size = int(request.POST.get('label_font_size', 36))
            tick_label_size = int(request.POST.get('tick_font_size', 16))
            box_color = request.POST.get('box_color', 'steelblue')
            median_color = request.POST.get('median_color', 'red')

        # Font
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        if language == 'bn' and os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            font_name = fm.FontProperties(fname=font_path).get_name()
            plt.rcParams['font.family'] = font_name
        title_font = ImageFont.truetype(font_path, size=axis_label_size)
        xlabel_font = ImageFont.truetype(font_path, size=axis_label_size)
        ylabel_font = ImageFont.truetype(font_path, size=axis_label_size)
        tick_font = ImageFont.truetype(font_path, size=tick_label_size)

        # Translator
        translator = Translator()
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')
        def translate(text): return translator.translate(text, dest='bn').text if language == 'bn' else text
        def map_digits(s): return s.translate(digit_map_bn) if language == 'bn' else s
        print(f"Using language: {language}, image format: {img_format}, quality: {image_quality}")
        # Translate column names if in Bangla mode
        col1_display = translate(col1)
        col2_display = translate(col2)

        # ANOVA using typ=2
        formula = f"{col2} ~ C({col1})"
        model = ols(formula, data=df).fit()
        anova_table = sm.stats.anova_lm(model, typ=2)
        print(f"ANOVA table:\n{anova_table}")

        # Fix PR(>F) formatting
        anova_table['PR(>F)'] = anova_table['PR(>F)'].apply(lambda p: f"{p:.6e}" if not np.isnan(p) else 'NaN')
        anova_table['F'] = anova_table['F'].apply(lambda f: round(f, 6) if not np.isnan(f) else 'NaN')
        anova_table['sum_sq'] = anova_table['sum_sq'].apply(lambda s: round(s, 6))
        anova_table['df'] = anova_table['df'].apply(lambda d: round(d, 1))



        if language == 'bn':
            anova_table.index = [translate(str(idx)) for idx in anova_table.index]
            anova_table.columns = [translate(str(col)) for col in anova_table.columns]
            anova_table = anova_table.applymap(lambda x: map_digits(str(x)))
        print(anova_table)

        result = {
            'test': 'ANOVA' if language == 'en' else 'এনওভিএ',
            'anova_table': f"""
                <div style='display: flex; justify-content: center; margin-top: 10px;'>
                    {anova_table.to_html(classes='table table-striped', border=1)}
                </div>
            """,
            'success': True
        }

        # Plot
        fig, ax = plt.subplots(figsize=(8, 6), dpi=100)
        sns.boxplot(x=col1, y=col2, data=df, palette=[box_color], medianprops=dict(color=median_color), ax=ax)
        ax.grid(True)
        ax.set_xlabel("")
        ax.set_ylabel("")
        ax.set_title("")
        ax.set_xticklabels([])
        ax.set_yticklabels([])
        plt.tight_layout(pad=0.5)

        plots_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        base_path = os.path.join(plots_dir, f"anova_base.{img_format}")
        print(f"Saving base plot to {base_path}")
        fig.savefig(base_path, format=img_format.upper(), bbox_inches='tight')
        plt.close(fig)

        # Overlay with PIL
        canvas = Image.open(base_path).convert('RGB')
        bw, bh = canvas.size
        pad = 70  # increased pad
        title_txt = translate(f"ANOVA: {col2} by {col1}")
        xlabel_txt = col1_display
        ylabel_txt = col2_display
        xt_vals = [str(g) for g in df[col1].unique()]
        yt_vals = np.linspace(df[col2].min(), df[col2].max(), num=5)

        draw = ImageDraw.Draw(canvas)
        _, _, tw, th = draw.textbbox((0, 0), title_txt, font=title_font)
        _, _, xw, xh = draw.textbbox((0, 0), xlabel_txt, font=xlabel_font)
        _, _, yw, yh = draw.textbbox((0, 0), ylabel_txt, font=ylabel_font)

        left_margin = yw + pad
        right_margin = pad + 100
        top_margin = th + pad
        bottom_margin = xh + pad

        W = left_margin + bw + right_margin
        H = top_margin + bh + bottom_margin
        final_canvas = Image.new("RGB", (W, H), 'white')
        final_canvas.paste(canvas, (left_margin, top_margin))

        draw = ImageDraw.Draw(final_canvas)
        draw.text(((W - tw)//2, 0), title_txt, font=title_font, fill='black')
        draw.text((left_margin + (bw - xw)//2, top_margin + bh + pad//2), xlabel_txt, font=xlabel_font, fill='black')

        Yimg = Image.new('RGBA', (yw, yh), (255,255,255,0))
        Ydraw = ImageDraw.Draw(Yimg)
        Ydraw.text((0,0), ylabel_txt, font=ylabel_font, fill='black')
        Yrot = Yimg.rotate(90, expand=True)
        y_x = (left_margin - Yrot.width)//2
        y_y = top_margin + (bh - Yrot.height)//2
        final_canvas.paste(Yrot, (y_x, y_y), Yrot)

        for i, lab in enumerate(xt_vals):
            fx = left_margin + bw * (i + 0.5) / len(xt_vals)
            fy = top_margin + bh + pad / 3
            draw.text((fx - draw.textlength(lab, font=tick_font)/2, fy), map_digits(lab), font=tick_font, fill='black')

        for yt in yt_vals:
            frac = (yt - yt_vals.min()) / (yt_vals.max() - yt_vals.min())
            fy = top_margin + bh - frac * bh
            fx = left_margin - pad // 2 - draw.textlength(f"{yt:.2f}", font=tick_font)
            draw.text((fx, fy - tick_label_size/2), map_digits(f"{yt:.2f}"), font=tick_font, fill='black')

        final_path = os.path.join(plots_dir, f"anova_plot.{img_format}")
        final_canvas.save(final_path, format=img_format.upper(), quality=image_quality)
        result['image_paths'] = [os.path.join(settings.MEDIA_URL, 'plots', f"anova_plot.{img_format}")]

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_ancova_test(request, df, col_group, col_covariate, col_outcome):
    import os
    import numpy as np
    import matplotlib.pyplot as plt
    import seaborn as sns
    import matplotlib.font_manager as fm
    from PIL import Image, ImageDraw, ImageFont
    import statsmodels.api as sm
    import statsmodels.formula.api as smf
    from googletrans import Translator
    from django.conf import settings
    from django.http import JsonResponse

    try:
        language = request.POST.get('language', 'en')
        file_format = request.POST.get('format', 'png')
        image_quality = int(request.POST.get('image_quality', 90))
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')

        # print(f"Using language: {language}, file format: {file_format}, image quality: {image_quality}")

        translator = Translator()
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')

        def translate(text):
            try:
                return translator.translate(text, dest='bn').text if language == 'bn' else text
            except:
                return text

        def map_digits(s):
            return s.translate(digit_map_bn) if language == 'bn' else s

        if os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            font_name = fm.FontProperties(fname=font_path).get_name()
            plt.rcParams['font.family'] = font_name
            tick_prop = fm.FontProperties(fname=font_path, size=16)
            title_font = ImageFont.truetype(font_path, size=36)
            xlabel_font = ImageFont.truetype(font_path, size=36)
            ylabel_font = ImageFont.truetype(font_path, size=36)
            legend_font = ImageFont.truetype(font_path, size=16)
        else:
            tick_prop = fm.FontProperties(size=16)
            title_font = xlabel_font = ylabel_font = legend_font = ImageFont.load_default()

        df[col_group] = df[col_group].astype(str)

        # Corrected ANCOVA model: outcome ~ covariate + group
        formula = f"{col_outcome} ~ {col_covariate} + C({col_group})"
        # print(f"ANCOVA formula: {formula}")
        # print(df[[col_group, col_covariate, col_outcome]].dtypes)
        # print(df[[col_group, col_covariate, col_outcome]].isnull().sum())
        # print(df[[col_group, col_covariate, col_outcome]].head())

        ancova_model = smf.ols(formula, data=df).fit()
        # print(ancova_model.summary())
        # if ancova_model is None: 
        #     raise ValueError("ANCOVA model fitting failed. Please check your data and formula.")
        
        # print(f"ANCOVA model fitted successfully.")
        ancova_table = sm.stats.anova_lm(ancova_model, typ=2)
        # print(ancova_table)

        # print(f"ANCOVA model summary:\n{ancova_model.summary()}")


        ancova_table = ancova_table.copy()
        ancova_table['PR(>F)'] = ancova_table['PR(>F)'].apply(
            lambda p: f"{p:.6e}" if not np.isnan(p) else 'NaN')
        ancova_table['F'] = ancova_table['F'].apply(lambda f: round(f, 6) if not np.isnan(f) else 'NaN')
        ancova_table['sum_sq'] = ancova_table['sum_sq'].apply(lambda s: round(s, 6))
        ancova_table['df'] = ancova_table['df'].apply(lambda d: round(d, 1))

        if language == 'bn':
            ancova_table.index = [translate(str(idx)) for idx in ancova_table.index]
            ancova_table.columns = [translate(str(col)) for col in ancova_table.columns]
            ancova_table = ancova_table.applymap(lambda x: map_digits(str(x)))
        # print(f"ANCOVA table:\n{ancova_table}")

        table_html = f"""
            <div style='display: flex; justify-content: center; margin-top: 10px;'>
                {ancova_table.to_html(classes='table table-striped', border=1)}
            </div>
        """
        groups = list(df[col_group].unique())
        palette = sns.color_palette('Set2', n_colors=len(groups))
        dot_colors = [tuple(int(255 * c) for c in color) for color in palette]
        line_colors = dot_colors.copy()

        fig, ax = plt.subplots(figsize=(8, 6), dpi=100)
        for i, group in enumerate(groups):
            group_df = df[df[col_group] == group]
            ax.scatter(group_df[col_covariate], group_df[col_outcome], s=50, color=palette[i], alpha=0.7,
                       label=f"{group} points")
            sns.regplot(x=col_covariate, y=col_outcome, data=group_df, ax=ax, scatter=False, ci=None,
                        line_kws={'linewidth': 2, 'color': palette[i], 'linestyle': 'solid', 'label': f"{group} fit"})

        ax.grid(True)
        ax.set_xlabel('')
        ax.set_ylabel('')
        ax.set_title('')
        ax.set_xticklabels([map_digits(f"{t:.2f}") for t in ax.get_xticks()], fontproperties=tick_prop)
        ax.set_yticklabels([map_digits(f"{t:.2f}") for t in ax.get_yticks()], fontproperties=tick_prop)
        plt.tight_layout(pad=0)

        plots_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        base_path = os.path.join(plots_dir, f'ancova_base.{file_format}')
        final_path = os.path.join(plots_dir, f'ancova_plot.{file_format}')
        fig.savefig(base_path, format=file_format.upper())
        plt.close(fig)

        canvas = Image.open(base_path).convert('RGB')
        bw, bh = canvas.size
        pad = 50
        title_txt = translate(f"ANCOVA: {col_outcome} by {col_group} with {col_covariate} control")
        xlabel_txt = translate(f"Covariate ({col_covariate})")
        ylabel_txt = translate(f"Outcome ({col_outcome})")

        draw = ImageDraw.Draw(canvas)
        _, _, tw, th = draw.textbbox((0, 0), title_txt, font=title_font)
        _, _, xw, xh = draw.textbbox((0, 0), xlabel_txt, font=xlabel_font)
        _, _, yw, yh = draw.textbbox((0, 0), ylabel_txt, font=ylabel_font)

        left_margin = yw + pad
        right_margin = 250
        top_margin = th + pad
        bottom_margin = xh + pad
        W = left_margin + bw + right_margin
        H = top_margin + bh + bottom_margin
        final_img = Image.new("RGB", (W, H), "white")
        final_img.paste(canvas, (left_margin, top_margin))

        draw = ImageDraw.Draw(final_img)
        draw.text(((W - tw) // 2, 0), title_txt, font=title_font, fill='black')
        draw.text((left_margin + (bw - xw) // 2, top_margin + bh + pad // 2), xlabel_txt, font=xlabel_font, fill='black')

        Yimg = Image.new('RGBA', (yw, yh), (255, 255, 255, 0))
        Ydraw = ImageDraw.Draw(Yimg)
        Ydraw.text((0, 0), ylabel_txt, font=ylabel_font, fill='black')
        Yrot = Yimg.rotate(90, expand=True)
        y_x = (left_margin - Yrot.width) // 2
        y_y = top_margin + (bh - Yrot.height) // 2
        final_img.paste(Yrot, (y_x, y_y), Yrot)

        draw = ImageDraw.Draw(final_img)
        legend_x = left_margin + bw + 10
        legend_y = top_margin + 10
        symbol_size = 6
        line_len = 20

        for i, grp in enumerate(groups):
            col = dot_colors[i]
            draw.ellipse((legend_x, legend_y, legend_x + symbol_size, legend_y + symbol_size), fill=col)
            lbl = translate(f"{grp} points")
            draw.text((legend_x + symbol_size + 5, legend_y), lbl, font=legend_font, fill='black')
            legend_y += 20

        legend_y += 10
        for i, grp in enumerate(groups):
            col = line_colors[i]
            y_mid = legend_y + symbol_size // 2
            draw.line((legend_x, y_mid, legend_x + line_len, y_mid), fill=col, width=2)
            lbl = translate(f"{grp} fit")
            draw.text((legend_x + line_len + 5, legend_y), lbl, font=legend_font, fill='black')
            legend_y += 20

        final_img.save(final_path, format=file_format.upper(), quality=image_quality)

        return JsonResponse({
            'success': True,
            'test': translate('ANCOVA'),
            'table_html': table_html,
            'image_paths': [os.path.join(settings.MEDIA_URL, 'plots', f'ancova_plot.{file_format}')],
            'columns': [col_group, col_covariate, col_outcome]
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def process_ks_test(request, df, col):
    import os
    import numpy as np
    import matplotlib.pyplot as plt
    import seaborn as sns
    import matplotlib as mpl
    import matplotlib.font_manager as fm
    from scipy.stats import kstest, norm
    from PIL import Image, ImageDraw, ImageFont
    from googletrans import Translator
    from django.conf import settings
    from django.http import JsonResponse

    try:
        language = request.POST.get('language', 'en')
        file_format = request.POST.get('format', 'png')
        image_quality = int(request.POST.get('image_quality', 90))
        label_font_size = int(request.POST.get('label_font_size', 36))
        tick_font_size = int(request.POST.get('tick_font_size', 16))
        width = int(request.POST.get('image_width', 800))
        height = int(request.POST.get('image_height', 600))
        ecdf_color = request.POST.get('ecdf_color', 'steelblue')
        cdf_color = request.POST.get('cdf_color', 'red')
        line_style = request.POST.get('line_style', 'solid')
        style_map = {'solid': '-', 'dashed': '--', 'dotted': ':'}
        line_style = style_map.get(line_style, '-')

        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        if os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            mpl.rcParams['font.family'] = fm.FontProperties(fname=font_path).get_name()
            tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size)
            label_font = ImageFont.truetype(font_path, size=label_font_size)
        else:
            tick_prop = fm.FontProperties(size=tick_font_size)
            label_font = ImageFont.load_default()

        translator = Translator()
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')
        def translate(text):
            return translator.translate(text, dest='bn').text if language == 'bn' else text
        def map_digits(s):
            return s.translate(digit_map_bn) if language == 'bn' else s

        data = df[col].dropna()
        mean_, std_ = np.mean(data), np.std(data, ddof=0)
        stat, p_value = kstest(data, 'norm', args=(mean_, std_))
        p_str = map_digits(f"{p_value:.4f}")
        interpretation = translate("Consistent with Normal (p > 0.05)") if p_value > 0.05 else translate("Not Normal (p ≤ 0.05)")

        fig, ax = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        sns.ecdfplot(data=data, ax=ax, marker='.', linestyle=line_style, color=ecdf_color, linewidth=1.5)
        x_vals = np.linspace(data.min(), data.max(), 200)
        ax.plot(x_vals, norm.cdf(x_vals, mean_, std_), color=cdf_color, linestyle=line_style, linewidth=2)

        ax.set_title('')
        ax.set_xlabel('')
        ax.set_ylabel('')
        if ax.get_legend():
            ax.get_legend().remove()

        ax.set_xticklabels([
            map_digits(f"{val:.0f}") for val in ax.get_xticks()
        ] if language == 'bn' else [f"{val:.0f}" for val in ax.get_xticks()], fontproperties=tick_prop)

        ax.set_yticklabels([
            map_digits(f"{val:.2f}") for val in ax.get_yticks()
        ] if language == 'bn' else [f"{val:.2f}" for val in ax.get_yticks()], fontproperties=tick_prop)

        plt.tight_layout(pad=0)
        plots_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        base_path = os.path.join(plots_dir, f'ks_base.{file_format}')
        import re
        safe_col = re.sub(r'[^\w\-_.]', '_', col)  # replaces anything not A-Z, 0-9, -, _, . with _
        final_path = os.path.join(plots_dir, f'ks_{safe_col}.{file_format}')

        fig.savefig(base_path, dpi=fig.dpi, format=file_format.upper())
        plt.close(fig)

        canvas_img = Image.open(base_path).convert('RGB')
        bw, bh = canvas_img.size
        pad = label_font_size // 2
        xlabel = translate(col)
        ylabel = translate('Cumulative Probability')
        x_w, x_h = label_font.getbbox(xlabel)[2:4]
        y_w, y_h = label_font.getbbox(ylabel)[2:4]

        left = y_h + pad
        top = pad
        right = pad
        bottom = x_h + pad
        W = bw + left + right
        H = bh + top + bottom

        canvas = Image.new('RGB', (W, H), 'white')
        canvas.paste(canvas_img, (left, top))
        draw = ImageDraw.Draw(canvas)

        def center_h(text, font, width):
            return (width - int(draw.textlength(text, font=font))) // 2

        xx = center_h(xlabel, label_font, W)
        draw.text((xx, top + bh + (bottom - x_h) // 2), xlabel, font=label_font, fill='black')

        Yimg = Image.new('RGBA', (y_w, y_h), (255, 255, 255, 0))
        Ydraw = ImageDraw.Draw(Yimg)
        Ydraw.text((0, 0), ylabel, font=label_font, fill='black')
        Yrot = Yimg.rotate(90, expand=True)
        canvas.paste(Yrot, ((left - Yrot.width) // 2, top + (bh - Yrot.height) // 2), Yrot)
        print(f"Saving final plot to {final_path}")



        # canvas.save(final_path, format=file_format.upper(), quality=image_quality)
        try:
            canvas.save(final_path, format=file_format, quality=image_quality)

        except Exception as e:
            print("Error saving canvas:", e)
            return JsonResponse({'success': False, 'error': f"Failed to save image: {e}"})

        print(f"Final plot saved to {final_path}")

        return JsonResponse({
            'success': True,
            'test': translate('Kolmogorov–Smirnov Test'),
            'p_value': p_str,
            'interpretation': interpretation,
            'image_paths': [os.path.join(settings.MEDIA_URL, 'plots', os.path.basename(final_path))],
            'columns': [col]
        })

    except Exception as e:
        print("Error saving KS plot:", e)
        return JsonResponse({'success': False, 'error': str(e)})


def process_anderson_darling_test(request, df, col):
    import os
    import numpy as np
    import matplotlib.pyplot as plt
    import seaborn as sns
    import matplotlib as mpl
    import matplotlib.font_manager as fm
    from scipy.stats import anderson, norm
    from PIL import Image, ImageDraw, ImageFont
    from googletrans import Translator
    from django.conf import settings
    from django.http import JsonResponse

    try:
        # Get settings
        language = request.POST.get('language', 'en')
        file_format = request.POST.get('format', 'png')
        image_quality = int(request.POST.get('image_quality', 90))
        label_font_size = int(request.POST.get('label_font_size', 36))
        tick_font_size = int(request.POST.get('tick_font_size', 16))
        width = int(request.POST.get('image_width', 800))
        height = int(request.POST.get('image_height', 600))
        scatter_color = request.POST.get('scatter_color', 'steelblue')
        line_color = request.POST.get('line_color', 'red')
        style_input = request.POST.get('line_style', 'solid')
        line_style = {'solid': '-', 'dashed': '--', 'dotted': ':'}.get(style_input, '-')

        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        if os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            mpl.rcParams['font.family'] = fm.FontProperties(fname=font_path).get_name()
            tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size)
            label_font = ImageFont.truetype(font_path, size=label_font_size)
        else:
            tick_prop = fm.FontProperties(size=tick_font_size)
            label_font = ImageFont.load_default()

        translator = Translator()
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')
        def translate(text):
            return translator.translate(text, dest='bn').text if language == 'bn' else text
        def map_digits(s):
            return s.translate(digit_map_bn) if language == 'bn' else s

        # Anderson–Darling test
        data = df[col].dropna().to_numpy()
        result = anderson(data, dist='norm')
        stat = result.statistic
        try:
            crit_idx = list(result.significance_level).index(5.0)
            crit_value = result.critical_values[crit_idx]
            sig_level = result.significance_level[crit_idx]
        except ValueError:
            crit_value = result.critical_values[0]
            sig_level = result.significance_level[0]

        interpretation = (
            translate(f"Likely Normal (A² = {stat:.3f} < {crit_value:.3f} at {sig_level}% )")
            if stat < crit_value else
            translate(f"Not Normal (A² = {stat:.3f} ≥ {crit_value:.3f} at {sig_level}% )")
        )

        stat_str = map_digits(f"{stat:.3f}")

        # Q–Q plot
        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        n = len(data)
        prob = (np.arange(1, n+1) - 0.5) / n
        theor_q = norm.ppf(prob, loc=np.mean(data), scale=np.std(data, ddof=0))
        sample_q = np.sort(data)
        ax.scatter(theor_q, sample_q, color=scatter_color, s=30)
        lims = [min(theor_q.min(), sample_q.min()), max(theor_q.max(), sample_q.max())]
        ax.plot(lims, lims, color=line_color, linestyle=line_style, linewidth=2)

        ax.set_title('')
        ax.set_xlabel('')
        ax.set_ylabel('')
        if ax.get_legend():
            ax.get_legend().remove()

        ax.set_xticklabels([
            map_digits(f"{val:.0f}") for val in ax.get_xticks()
        ] if language == 'bn' else [f"{val:.0f}" for val in ax.get_xticks()], fontproperties=tick_prop)

        ax.set_yticklabels([
            map_digits(f"{val:.0f}") for val in ax.get_yticks()
        ] if language == 'bn' else [f"{val:.0f}" for val in ax.get_yticks()], fontproperties=tick_prop)

        plt.tight_layout(pad=0)
        plots_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        base_path = os.path.join(plots_dir, f'ad_base.{file_format}')
        import re
        safe_col = re.sub(r'[^\w\-_.]', '_', col)  # replaces anything not A-Z, 0-9, -, _, . with _
        final_path = os.path.join(plots_dir, f'ad_{safe_col}.{file_format}')
        fig.savefig(base_path, format=file_format.upper(), dpi=fig.dpi)
        plt.close(fig)

        # Add axis labels with PIL
        canvas_img = Image.open(base_path).convert('RGB')
        bw, bh = canvas_img.size
        pad = label_font_size // 2

        xlabel = translate(col)
        ylabel = translate('Sample Quantiles')
        x_w, x_h = label_font.getbbox(xlabel)[2:4]
        y_w, y_h = label_font.getbbox(ylabel)[2:4]

        left = y_h + pad
        top = pad
        right = pad
        bottom = x_h + pad
        W = bw + left + right
        H = bh + top + bottom

        canvas = Image.new('RGB', (W, H), 'white')
        canvas.paste(canvas_img, (left, top))
        draw = ImageDraw.Draw(canvas)

        def center_h(text, font, width):
            return (width - int(draw.textlength(text, font=font))) // 2

        xx = center_h(xlabel, label_font, W)
        draw.text((xx, top + bh + (bottom - x_h) // 2), xlabel, font=label_font, fill='black')

        Yimg = Image.new('RGBA', (y_w, y_h), (255, 255, 255, 0))
        Ydraw = ImageDraw.Draw(Yimg)
        Ydraw.text((0, 0), ylabel, font=label_font, fill='black')
        Yrot = Yimg.rotate(90, expand=True)
        canvas.paste(Yrot, ((left - Yrot.width) // 2, top + (bh - Yrot.height) // 2), Yrot)

        canvas.save(final_path, format=file_format.upper(), quality=image_quality)

        return JsonResponse({
            'success': True,
            'test': translate('Anderson–Darling Test'),
            'a_stat': stat_str,
            'interpretation': interpretation,
            'image_paths': [os.path.join(settings.MEDIA_URL, 'plots', os.path.basename(final_path))],
            'columns': [col]
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

##
def process_fzt_test(request, df, col_group, col_value):
    import os
    import numpy as np
    import matplotlib.pyplot as plt
    import seaborn as sns
    import matplotlib.font_manager as fm
    from PIL import Image, ImageDraw, ImageFont
    from scipy import stats
    from scipy.stats import f as f_dist, t as t_dist, norm as norm_dist
    from statsmodels.stats.weightstats import ztest
    from sklearn.preprocessing import OrdinalEncoder
    from django.conf import settings
    from django.http import JsonResponse
    from googletrans import Translator

    try:
        # === Language and Formatting ===
        language = request.POST.get('language', 'en')
        file_format = request.POST.get('format', 'png')
        file_format = 'png' if file_format not in ('png','jpg','jpeg','pdf') else file_format

        # === Font setup ===
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        digit_map_bn = str.maketrans('0123456789','০১২৩৪৫৬৭৮৯')
        translator = Translator()

        def translate(text):
            return translator.translate(text, dest='bn').text if language == 'bn' else text

        def map_digits(s):
            return s.translate(digit_map_bn) if language == 'bn' else s

        # === Custom Style Settings ===
        use_default = request.POST.get('use_default', 'true') == 'true'
        if not use_default:
            bins = int(request.POST.get('bins', 30))
            dist_lw = int(request.POST.get('line_width', 2))
            dist_ls = request.POST.get('line_style', 'solid')
            f_curve_color = request.POST.get('f_curve_color', 'blue')
            f_line_color = request.POST.get('f_line_color', 'red')
            z_curve_color = request.POST.get('z_curve_color', 'green')
            z_line_color = request.POST.get('z_line_color', 'orange')
            t_curve_color = request.POST.get('t_curve_color', 'purple')
            t_line_color = request.POST.get('t_line_color', 'brown')
            hist1_color = request.POST.get('hist1_color', 'red')
            hist2_color = request.POST.get('hist2_color', 'orange')
            image_dpi = int(request.POST.get('image_quality', 100))
            tick_font_size = int(request.POST.get('tick_font_size', 14))
            label_font_size = int(request.POST.get('label_font_size', 24))
            fig_w, fig_h = 6, 4
        else:
            bins, dist_lw, dist_ls = 30, 2, 'solid'
            f_curve_color, f_line_color = 'blue', 'red'
            z_curve_color, z_line_color = 'gray', 'green'
            t_curve_color, t_line_color = 'gray', 'purple'
            hist1_color, hist2_color = 'red', 'orange'
            image_dpi, tick_font_size, label_font_size = 100, 14, 24
            fig_w, fig_h = 6, 4

        # === Font configuration ===
        if os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            pil_font = ImageFont.truetype(font_path, label_font_size)
            tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size)
        else:
            pil_font = ImageFont.load_default()
            tick_prop = fm.FontProperties(size=tick_font_size)

        # === Preprocessing ===
        cats = df.select_dtypes(include=['object']).columns
        if len(cats) > 0:
            df[cats] = OrdinalEncoder().fit_transform(df[cats])

        groups = df[col_group].dropna().unique().tolist()
        data = {g: df[df[col_group] == g][col_value].dropna().values for g in groups}
        if len(groups) != 2:
            return JsonResponse({'success': False, 'error': translate("You must select exactly 2 groups.")})

        a1, a2 = data[groups[0]], data[groups[1]]
        n1, n2 = len(a1), len(a2)
        v1, v2 = a1.var(ddof=1), a2.var(ddof=1)

        # === Statistics ===
        F = v1/v2
        dfn, dfd = n1-1, n2-1
        pF = 2 * min(stats.f.cdf(F, dfn, dfd), 1 - stats.f.cdf(F, dfn, dfd))
        z_stat, pZ = ztest(a1, a2)
        t_stat, pT = stats.ttest_ind(a1, a2, equal_var=False)
        welch_df = (v1/n1 + v2/n2)**2 / ((v1/n1)**2/(n1-1) + (v2/n2)**2/(n2-1))

        stats_table = f"""
        <table class='table table-bordered'>
            <thead><tr><th>Test</th><th>Stat</th><th>p-value</th><th>df</th></tr></thead>
            <tbody>
                <tr><td>F-test</td><td>{F:.4f}</td><td>{pF:.4g}</td><td>{dfn}, {dfd}</td></tr>
                <tr><td>Z-test</td><td>{z_stat:.4f}</td><td>{pZ:.4g}</td><td>-</td></tr>
                <tr><td>Welch T-test</td><td>{t_stat:.4f}</td><td>{pT:.4g}</td><td>{welch_df:.1f}</td></tr>
            </tbody>
        </table>"""

        def prep_ax():
            ax = plt.gca()
            ax.set_xlabel(ax.get_xlabel(), fontsize=label_font_size)
            ax.set_ylabel(ax.get_ylabel(), fontsize=label_font_size)
            ax.set_xticklabels([map_digits(f"{x:.2f}") for x in ax.get_xticks()], fontproperties=tick_prop)
            ax.set_yticklabels([map_digits(f"{y:.2f}") for y in ax.get_yticks()], fontproperties=tick_prop)
            ax.grid(True)

        plots = []
        plot_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plot_dir, exist_ok=True)

        def save_plot(filename, title, xlabel, ylabel):
            plt.title(translate(title), fontsize=label_font_size)
            plt.xlabel(translate(xlabel), fontsize=label_font_size)
            plt.ylabel(translate(ylabel), fontsize=label_font_size)
            prep_ax()
            full = os.path.join(plot_dir, filename + '.' + file_format)
            plt.savefig(full, dpi=image_dpi, bbox_inches='tight')
            plt.close()
            plots.append(os.path.join(settings.MEDIA_URL, 'plots', filename + '.' + file_format))

        plt.figure(figsize=(fig_w, fig_h))
        x = np.linspace(0, max(f_dist.ppf(0.99, dfn, dfd), F*2), 300)
        plt.plot(x, f_dist.pdf(x, dfn, dfd), linewidth=dist_lw, linestyle=dist_ls, color=f_curve_color)
        plt.axvline(F, color=f_line_color, linestyle='--', linewidth=dist_lw)
        save_plot("f_dist", "F-Distribution vs Observed F", "F value", "Density")

        plt.figure(figsize=(fig_w, fig_h))
        x_z = np.linspace(norm_dist.ppf(0.001), norm_dist.ppf(0.999), 300)
        plt.plot(x_z, norm_dist.pdf(x_z), linewidth=dist_lw, linestyle=dist_ls, color=z_curve_color)
        plt.axvline(z_stat, color=z_line_color, linestyle='--', linewidth=dist_lw)
        save_plot("z_dist", "Standard Normal vs Observed Z", "Z value", "Density")

        plt.figure(figsize=(fig_w, fig_h))
        x_t = np.linspace(t_dist.ppf(0.001, welch_df), t_dist.ppf(0.999, welch_df), 300)
        plt.plot(x_t, t_dist.pdf(x_t, welch_df), linewidth=dist_lw, linestyle=dist_ls, color=t_curve_color)
        plt.axvline(t_stat, color=t_line_color, linestyle='--', linewidth=dist_lw)
        save_plot("t_dist", "T-Distribution vs Observed T", "T value", "Density")

        plt.figure(figsize=(fig_w, fig_h))
        lbl1 = map_digits(translate(str(groups[0])))
        lbl2 = map_digits(translate(str(groups[1])))
        sns.histplot(a1, bins=bins, kde=True, stat='density', label=lbl1, color=hist1_color, alpha=0.5)
        sns.histplot(a2, bins=bins, kde=True, stat='density', label=lbl2, color=hist2_color, alpha=0.5)
        plt.legend(prop=tick_prop)
        save_plot("hist_kde", "Histogram + KDE", col_value, "Density")

        return JsonResponse({
            'success': True,
            'test': translate("F/Z/T Tests"),
            'table_html': stats_table,
            'image_paths': plots,
            'columns': [col_group, col_value],
            'statistic': {
                'F': round(F, 6),
                'F_p': round(pF, 6),
                'Z': round(z_stat, 6),
                'Z_p': round(pZ, 6),
                'T': round(t_stat, 6),
                'T_p': round(pT, 6),
                'T_df': round(welch_df, 1),
            },
            'p_value': min(pF, pZ, pT),
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})



def process_cross_tabulation(request, df, selected_columns):

    import os
    import pandas as pd
    import seaborn as sns
    import matplotlib.pyplot as plt
    import matplotlib as mpl
    import matplotlib.font_manager as fm
    from PIL import Image, ImageDraw, ImageFont
    from googletrans import Translator
    from functools import lru_cache
    from django.conf import settings
    from django.http import JsonResponse

    try:
        if len(selected_columns) < 2:
            raise ValueError("At least two columns are required for cross tabulation.")

        lang = request.POST.get('language', 'en').lower()
        if lang not in ('bn', 'en'): lang = 'en'
        fmt = request.POST.get('format', 'png').lower()
        if fmt not in ('png','jpg','jpeg','pdf','tiff'): fmt = 'png'
        pil_fmt = {'png':'PNG','jpg':'JPEG','jpeg':'JPEG','pdf':'PDF','tiff':'TIFF'}[fmt]

        use_default = request.POST.get('use_default', 'true') == 'true'
        heatmap_color_theme = request.POST.get('heatmap_color_theme', 'Blues') if not use_default else 'Blues'
        bar_width = float(request.POST.get('bar_width', 0.8))
        label_font_size = int(request.POST.get('label_font_size', 36))
        tick_font_size = int(request.POST.get('tick_font_size', 16))
        image_quality = int(request.POST.get('image_quality', 90))
        width, height = map(int, request.POST.get('image_size', '800x600').split('x'))

        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        fm.fontManager.addfont(font_path)
        bengali_font = fm.FontProperties(fname=font_path).get_name()
        mpl.rcParams['font.family'] = bengali_font
        label_font = ImageFont.truetype(font_path, label_font_size)
        tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size) if lang == 'bn' else fm.FontProperties(size=tick_font_size)

        translator = Translator()
        digit_map = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')

        @lru_cache(None)
        def translate(txt):
            return translator.translate(txt, dest='bn').text if lang == 'bn' else txt

        def map_digits(txt):
            return txt.translate(digit_map) if lang == 'bn' else txt

        plots_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plots_dir, exist_ok=True)

        def create_labeled_plot(fig, ax, title, xlabel, ylabel, base, final):
            ax.set(title='', xlabel='', ylabel='')
            plt.tight_layout(pad=0)
            fig.savefig(base, dpi=300, format='PNG', bbox_inches='tight')
            plt.close(fig)
            T, X, Y = map_digits(translate(title)), map_digits(translate(xlabel)), map_digits(translate(ylabel))
            t0,t1,t2,t3 = label_font.getbbox(T); th = t3 - t1
            x0,x1,x2,x3 = label_font.getbbox(X); xh = x3 - x1
            y0,y1,y2,y3 = label_font.getbbox(Y); yw = y2 - y0; yh = y3 - y1
            pad = label_font_size // 2; lm, rm, tm, bm = yh + pad, pad, th + pad, xh + pad
            img = Image.open(base).convert('RGB'); bw, bh = img.size; W, H = bw + lm + rm, bh + tm + bm
            canvas = Image.new('RGB', (W, H), 'white'); canvas.paste(img, (lm, tm))
            d = ImageDraw.Draw(canvas)
            def cent(txt, fn, w): return (w - int(d.textlength(txt, font=fn))) // 2
            d.text((cent(T, label_font, W), (tm - th) // 2), T, font=label_font, fill='black')
            d.text((cent(X, label_font, W), tm + bh + (bm - xh) // 2), X, font=label_font, fill='black')
            Yimg = Image.new('RGBA', (yw, yh), (255, 255, 255, 0)); d2 = ImageDraw.Draw(Yimg); d2.text((0, 0), Y, font=label_font, fill='black')
            Yrot = Yimg.rotate(90, expand=True); canvas.paste(Yrot, ((lm - Yrot.width) // 2, tm + (bh - Yrot.height) // 2), Yrot)
            canvas.save(final, format=pil_fmt, quality=image_quality)

        pd.set_option('display.max_rows', None)
        colors = [mpl.colors.rgb2hex(c) for c in sns.color_palette(heatmap_color_theme, len(selected_columns))]
        cross_tab = pd.crosstab(index=[df[v] for v in selected_columns[:-1]], columns=df[selected_columns[-1]])

        dtab = cross_tab.copy().astype(str)
        dtab = dtab.applymap(lambda x: map_digits(translate(x)))
        dtab.index = [map_digits(translate("|".join(map(str, ix)) if isinstance(ix, tuple) else str(ix))) for ix in cross_tab.index]
        dtab.columns = [map_digits(translate(str(c))) for c in cross_tab.columns]

        annot = cross_tab.copy().astype(str)
        for r in annot.index:
            for c in annot.columns:
                annot.at[r, c] = map_digits(translate(annot.at[r, c]))
        fig1, ax1 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        sns.heatmap(cross_tab, annot=annot, fmt='', cmap=heatmap_color_theme, cbar=True, ax=ax1)
        ax1.set_xticklabels([map_digits(translate(str(c))) for c in cross_tab.columns], fontproperties=tick_prop, rotation=45)
        ax1.set_yticklabels([map_digits(translate("|".join(map(str, ix)) if isinstance(ix, tuple) else str(ix))) for ix in cross_tab.index], fontproperties=tick_prop, rotation=0)
        cb = ax1.collections[0].colorbar
        cb.set_ticklabels([map_digits(translate(str(int(t)))) for t in cb.get_ticks()])
        cb.ax.tick_params(labelsize=tick_font_size)
        for lbl in cb.ax.get_yticklabels():
            lbl.set_fontproperties(tick_prop)
        base_heat = os.path.join(plots_dir, 'heatmap_base.png')
        final_heatmap = os.path.join(plots_dir, f'crosstab_heatmap.{fmt}')
        create_labeled_plot(fig1, ax1, title=f"Heatmap of {' vs '.join(selected_columns)}", xlabel=selected_columns[-1], ylabel=" × ".join(selected_columns[:-1]), base=base_heat, final=final_heatmap)

        # Corrected Barplot rendering (no PIL post-processing)
        freq_list = []
        for v in selected_columns:
            f = df[v].value_counts().sort_index()
            freq_list.append(pd.DataFrame({'Value': f.index.astype(str), 'Frequency': f.values, 'Variable': v}))
        fdf = pd.concat(freq_list, ignore_index=True)
        if lang == 'bn':
            fdf['Value'] = fdf['Value'].apply(lambda x: map_digits(translate(x)))
            fdf['Variable'] = fdf['Variable'].apply(lambda x: map_digits(translate(x)))
        fig2, ax2 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        sns.barplot(data=fdf, x='Value', y='Frequency', hue='Variable', palette=colors, ax=ax2, width=bar_width, dodge=True)
        ax2.set_xlabel(map_digits(translate('Value')))
        ax2.set_ylabel(map_digits(translate('Frequency')))
        ax2.set_xticklabels(ax2.get_xticklabels(), fontproperties=tick_prop, rotation=45)
        ax2.set_yticklabels([map_digits(str(int(y))) for y in ax2.get_yticks()], fontproperties=tick_prop)
        final_bar = os.path.join(plots_dir, f'frequency_both.{fmt}')
        fig2.savefig(final_bar, dpi=300, format=pil_fmt, bbox_inches='tight')
        plt.close(fig2)

        total = int(cross_tab.values.sum())
        stk = cross_tab.stack()
        mi, ma = stk.idxmin(), stk.idxmax()
        cnt_min, cnt_max = stk.min(), stk.max()
        min_lbl = " vs ".join(map(str, mi)) if isinstance(mi, tuple) else str(mi)
        max_lbl = " vs ".join(map(str, ma)) if isinstance(ma, tuple) else str(ma)
        summary = {
            'total_observations': map_digits(translate(f"Total observations: {total}")),
            'most_frequent': map_digits(translate(f"Most frequent combination ({max_lbl}): {cnt_max} observations.")),
            'least_frequent': map_digits(translate(f"Least frequent combination ({min_lbl}): {cnt_min} observations."))
        }

        return JsonResponse({
            'success': True,
            'translated_table': dtab.to_dict(),
            'heatmap_path': os.path.join(settings.MEDIA_URL, 'plots', f'crosstab_heatmap.{fmt}'),
            'barplot_path': os.path.join(settings.MEDIA_URL, 'plots', f'frequency_both.{fmt}'),
            'summary': summary,
            'columns': selected_columns
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def process_eda_distribution(request, df, col):
    import os
    import numpy as np
    import seaborn as sns
    import matplotlib.pyplot as plt
    import matplotlib.font_manager as fm
    from googletrans import Translator
    from PIL import Image, ImageDraw, ImageFont
    from django.conf import settings
    from django.http import JsonResponse

    try:
        language = request.POST.get('language', 'en')
        file_format = request.POST.get('format', 'png')
        file_format = 'png' if file_format not in ('png','jpg','jpeg','pdf','tiff') else file_format
        pil_format = {'png':'PNG','jpg':'JPEG','jpeg':'JPEG','pdf':'PDF','tiff':'TIFF'}[file_format]

        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        digit_map = str.maketrans('0123456789','০১২৩৪৫৬৭৮৯')
        translator = Translator()

        def translate(text):
            return translator.translate(text, dest='bn').text if language == 'bn' else text

        def map_digits(txt):
            return txt.translate(digit_map) if language == 'bn' else txt

        def format_tick(x):
            s = f"{x:.4f}".rstrip('0').rstrip('.')
            return map_digits(translate(s))

        use_default = request.POST.get('use_default', 'true') == 'true'
        if not use_default:
            dpi = int(request.POST.get('image_quality', 300))
            width, height = map(int, request.POST.get('image_size', '800x600').split('x'))
            label_font_size = int(request.POST.get('label_font_size', 50))
            caption_font_size = int(request.POST.get('caption_font_size', 50))
            tick_font_size = int(request.POST.get('tick_font_size', 12))
            hist_color = request.POST.get('hist_color', 'blue')
            kde_color = request.POST.get('kde_color', 'green')
            dist_color = request.POST.get('dist_color', 'purple')
        else:
            dpi = 300
            width, height = 800, 600
            label_font_size = 50
            caption_font_size = 50
            tick_font_size = 12
            hist_color, kde_color, dist_color = 'blue', 'green', 'purple'

        if os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            label_font = ImageFont.truetype(font_path, size=label_font_size)
            caption_font = ImageFont.truetype(font_path, size=caption_font_size)
            tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size)
            if language == 'bn':
                plt.rcParams['font.family'] = fm.FontProperties(fname=font_path).get_name()
        else:
            label_font = caption_font = ImageFont.load_default()
            tick_prop = fm.FontProperties(size=tick_font_size)

        if col not in df.columns or not np.issubdtype(df[col].dtype, np.number):
            return JsonResponse({'success': False, 'error': translate('Selected column is not numeric.')})

        def create_plot(fig, ax, title, xlabel, ylabel, base, final):
            T = map_digits(translate(title))
            X = map_digits(translate(xlabel))
            Y = map_digits(translate(ylabel))

            xt = [format_tick(x) for x in ax.get_xticks()]
            yt = [format_tick(y) for y in ax.get_yticks()]
            ax.set_xticklabels(xt, fontproperties=tick_prop, rotation=45)
            ax.set_yticklabels(yt, fontproperties=tick_prop)
            ax.set_title(''); ax.set_xlabel(''); ax.set_ylabel('')
            plt.tight_layout()
            fig.savefig(base, dpi=dpi)
            plt.close(fig)

            img = Image.open(base).convert('RGB')
            bw, bh = img.size

            bbox_Y = label_font.getbbox(Y)
            text_w = bbox_Y[2] - bbox_Y[0]
            text_h = bbox_Y[3] - bbox_Y[1]
            pad = 20
            Yimg = Image.new('RGBA', (text_w+pad*2, text_h+pad*2), (255,255,255,0))
            d2 = ImageDraw.Draw(Yimg)
            d2.text((pad, pad), Y, font=label_font, fill='black')
            Yrot = Yimg.rotate(90, expand=True)

            extra_left = Yrot.width + 20
            extra_top = caption_font_size + 20
            extra_bottom = label_font_size + 50
            new_bw = bw + extra_left
            new_bh = bh + extra_top + extra_bottom
            canvas = Image.new('RGB', (new_bw, new_bh), 'white')
            canvas.paste(img, (extra_left, extra_top))
            draw = ImageDraw.Draw(canvas)

            bbox_T = caption_font.getbbox(T)
            wT = bbox_T[2] - bbox_T[0]
            draw.text((extra_left+(bw-wT)//2, 10), T, font=caption_font, fill='black')

            bbox_X = label_font.getbbox(X)
            wX = bbox_X[2] - bbox_X[0]
            draw.text((extra_left+(bw-wX)//2, extra_top+bh+(extra_bottom-20)//2), X, font=label_font, fill='black')

            y_x = (extra_left - Yrot.width)//2
            y_y = extra_top + (bh - Yrot.height)//2
            canvas.paste(Yrot, (y_x, y_y), Yrot)

            canvas.save(final, format=pil_format)
            return final

        plot_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plot_dir, exist_ok=True)
        image_paths = []

        # Histogram
        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        sns.histplot(df[col], ax=ax, color=hist_color)
        hist_path = os.path.join(plot_dir, f'histogram_{col}.{file_format}')
        create_plot(fig, ax, f'Histogram of {col}', col, 'Count', 'hist_base.png', hist_path)
        image_paths.append(os.path.join(settings.MEDIA_URL, 'plots', f'histogram_{col}.{file_format}'))

        # KDE
        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        sns.kdeplot(df[col], ax=ax, fill=True, color=kde_color)
        kde_path = os.path.join(plot_dir, f'kde_{col}.{file_format}')
        create_plot(fig, ax, f'KDE Plot of {col}', col, 'Density', 'kde_base.png', kde_path)
        image_paths.append(os.path.join(settings.MEDIA_URL, 'plots', f'kde_{col}.{file_format}'))

        # Distribution
        g = sns.displot(df[col], kde=True, color=dist_color)
        fig = g.fig; ax = fig.axes[0]
        dist_path = os.path.join(plot_dir, f'distribution_{col}.{file_format}')
        create_plot(fig, ax, f'Distribution of {col}', col, 'Frequency', 'dist_base.png', dist_path)
        image_paths.append(os.path.join(settings.MEDIA_URL, 'plots', f'distribution_{col}.{file_format}'))

        return JsonResponse({
            'success': True,
            'test': translate("EDA: Distribution Plots"),
            'columns': [col],
            'image_paths': image_paths
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def process_eda_swarm_plot(request, df, col_cat, col_num):
    import os
    import numpy as np
    import seaborn as sns
    import matplotlib.pyplot as plt
    import matplotlib.font_manager as fm
    from PIL import Image, ImageDraw, ImageFont
    from googletrans import Translator
    from django.conf import settings
    from django.http import JsonResponse

    try:
        language = request.POST.get('language', 'en')
        file_format = request.POST.get('format', 'png')
        file_format = 'png' if file_format not in ('png','jpg','jpeg','pdf','tiff') else file_format
        pil_fmt = file_format.upper() if file_format != 'jpg' else 'JPEG'

        # === Translator & Font Setup ===
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        translator = Translator()
        digit_map = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')

        def translate(txt):
            return translator.translate(txt, dest='bn').text if language == 'bn' else txt

        def map_digits(txt):
            return txt.translate(digit_map) if language == 'bn' else txt

        def format_tick(x):
            s = f"{x:.4f}".rstrip('0').rstrip('.')
            return map_digits(translate(s))

        # === Custom Settings ===
        use_default = request.POST.get('use_default', 'true') == 'true'
        if not use_default:
            dpi = int(request.POST.get('image_quality', 300))
            width, height = map(int, request.POST.get('image_size', '800x600').split('x'))
            default_label_size = int(request.POST.get('label_font_size', 50))
            default_caption_size = default_label_size
            default_tick_size = int(request.POST.get('tick_font_size', 12))
            swarm_color = request.POST.get('swarm_color', 'orange')
        else:
            dpi, width, height = 300, 800, 600
            default_label_size = default_caption_size = 50
            default_tick_size = 12
            swarm_color = 'orange'

        if os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            pil_font = ImageFont.truetype(font_path, default_label_size)
            caption_font = ImageFont.truetype(font_path, default_caption_size)
            tick_prop = fm.FontProperties(fname=font_path, size=default_tick_size)
            if language == 'bn':
                plt.rcParams['font.family'] = fm.FontProperties(fname=font_path).get_name()
        else:
            pil_font = caption_font = ImageFont.load_default()
            tick_prop = fm.FontProperties(size=default_tick_size)

        # === Plot ===
        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        sns.swarmplot(x=col_cat, y=col_num, data=df, color=swarm_color, ax=ax)

        xt = [format_tick(x) for x in ax.get_xticks()]
        yt = [format_tick(y) for y in ax.get_yticks()]
        ax.set_xticklabels(xt, fontproperties=tick_prop, rotation=45)
        ax.set_yticklabels(yt, fontproperties=tick_prop)
        ax.set_title(''); ax.set_xlabel(''); ax.set_ylabel('')

        title = f"Swarm Plot of {col_num} by {col_cat}"
        xlabel = col_cat
        ylabel = col_num

        # Save base image
        plots_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        base_path = os.path.join(plots_dir, 'swarm_base.' + file_format)
        final_path = os.path.join(plots_dir, 'swarm_final.' + file_format)

        plt.tight_layout()
        fig.savefig(base_path, dpi=dpi)
        plt.close(fig)

        # === Draw Labels ===
        T = map_digits(translate(title))
        X = map_digits(translate(xlabel))
        Y = map_digits(translate(ylabel))

        img = Image.open(base_path).convert('RGB')
        bw0, bh0 = img.size

        bbox_Y = pil_font.getbbox(Y)
        text_w = bbox_Y[2] - bbox_Y[0]
        text_h = bbox_Y[3] - bbox_Y[1]
        pad = 20
        Yimg = Image.new('RGBA', (text_w+pad*2, text_h+pad*2), (255,255,255,0))
        d2 = ImageDraw.Draw(Yimg)
        d2.text((pad, pad), Y, font=pil_font, fill='black')
        Yrot = Yimg.rotate(90, expand=True)

        extra_left = Yrot.width + 20
        extra_top = default_caption_size + 20
        extra_bottom = default_label_size + 20
        new_bw = bw0 + extra_left
        new_bh = bh0 + extra_top + extra_bottom

        canvas = Image.new('RGB', (new_bw, new_bh), 'white')
        canvas.paste(img, (extra_left, extra_top))
        draw = ImageDraw.Draw(canvas)

        # Title
        bbox_T = caption_font.getbbox(T)
        wT = bbox_T[2] - bbox_T[0]
        draw.text((extra_left+(bw0-wT)//2, 10), T, font=caption_font, fill='black')

        # X-label
        bbox_X = pil_font.getbbox(X)
        wX = bbox_X[2] - bbox_X[0]
        draw.text((extra_left+(bw0-wX)//2, extra_top+bh0+10), X, font=pil_font, fill='black')

        # Y-label
        y_x = (extra_left - Yrot.width)//2
        y_y = extra_top + (bh0 - Yrot.height)//2
        canvas.paste(Yrot, (y_x, y_y), Yrot)

        canvas.save(final_path, format=pil_fmt)

        return JsonResponse({
            'success': True,
            'test': translate("Swarm Plot"),
            'image_paths': [os.path.join(settings.MEDIA_URL, 'plots', 'swarm_final.' + file_format)],
            'columns': [col_cat, col_num],
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})




def process_eda_pie_chart(request, df):

    import os
    import math
    import pandas as pd
    import numpy as np
    import seaborn as sns
    import matplotlib.pyplot as plt
    import matplotlib as mpl
    import matplotlib.font_manager as fm
    from googletrans import Translator
    from PIL import Image, ImageDraw, ImageFont
    from django.conf import settings
    from django.http import JsonResponse
    from functools import lru_cache

    try:
        # --- 1. Input values ---
        col = request.POST.get("column")
        language = request.POST.get("language", "en")
        img_format = request.POST.get("format", "png").lower()
        if img_format not in ('png','jpg','jpeg','pdf','tiff'):
            img_format = 'png'
        pil_fmt = {'png':'PNG','jpg':'JPEG','jpeg':'JPEG','pdf':'PDF','tiff':'TIFF'}[img_format]

        if col not in df.columns:
            return JsonResponse({'success': False, 'error': f"Column '{col}' not found."})

        # --- 2. Fonts and theme ---
        width, height = 800, 600
        dpi = 300
        default_label_size = 50
        default_caption_size = 50
        default_tick_size = 12

        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        fm.fontManager.addfont(font_path)
        bengali_font = fm.FontProperties(fname=font_path).get_name()
        if language == 'bn':
            mpl.rcParams['font.family'] = bengali_font

        translator = Translator()
        digit_map = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')

        @lru_cache(None)
        def translate(txt): return translator.translate(txt, dest='bn').text if language == 'bn' else txt

        def map_digits(txt): return txt.translate(digit_map) if language == 'bn' else txt

        label_font = ImageFont.truetype(font_path, size=default_label_size)
        caption_font = ImageFont.truetype(font_path, size=default_caption_size)

        # --- 3. Plot directory ---
        plots_dir = os.path.join(settings.MEDIA_ROOT, 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        base_img_path = os.path.join(plots_dir, 'pie_base.png')
        final_img_path = os.path.join(plots_dir, f'pie_{col}.{img_format}')

        # --- 4. Create pie chart with PIL overlay ---
        counts = df[col].astype(str).value_counts()
        labels_data = counts.index.tolist()
        sizes = counts.values

        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        ax.pie(sizes, startangle=90)
        ax.axis('equal')
        plt.tight_layout()
        fig.savefig(base_img_path, dpi=dpi, bbox_inches='tight')
        plt.close(fig)

        img = Image.open(base_img_path).convert('RGB')
        bw0, bh0 = img.size
        draw = ImageDraw.Draw(img)

        cx, cy = bw0 / 2, bh0 / 2
        radius = min(cx, cy) * 0.8
        total = sizes.sum()
        cum_angle = 0
        for label, size in zip(labels_data, sizes):
            angle = (size / total) * 360
            mid_angle = cum_angle + angle / 2
            rad = math.radians(mid_angle + 90)
            x = cx + radius * 0.7 * math.cos(rad)
            y = cy - radius * 0.7 * math.sin(rad)
            translated_label = map_digits(translate(label))
            translated_percent = map_digits(f"{(size / total) * 100:.1f}%")
            txt = f"{translated_label} {translated_percent}"
            bbox_txt = draw.textbbox((0, 0), txt, font=label_font)
            w, h = bbox_txt[2] - bbox_txt[0], bbox_txt[3] - bbox_txt[1]
            draw.text((x - w / 2, y - h / 2), txt, font=label_font, fill='black')
            cum_angle += angle

        title = map_digits(translate(f'Pie Chart of {col}'))
        bbox_p = caption_font.getbbox(title)
        wT = bbox_p[2] - bbox_p[0]
        draw.text(((bw0 - wT) // 2, 10), title, font=caption_font, fill='black')

        img.save(final_img_path, format=pil_fmt)

        return JsonResponse({
            'success': True,
            'test': 'Pie Chart' if language == 'en' else 'পাই চার্ট',
            'image_paths': [os.path.join(settings.MEDIA_URL, 'plots', f'pie_{col}.{img_format}')],
            'columns': [col]
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def process_eda_basics(request, df):
    import numpy as np
    import pandas as pd
    from functools import lru_cache
    from googletrans import Translator
    from django.http import JsonResponse

    try:
        lang = request.POST.get('language', 'en')
        if lang not in ['en', 'bn']:
            lang = 'en'

        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')

        def to_bn_digits(s):
            return s.translate(digit_map_bn) if lang == 'bn' else s

        @lru_cache(None)
        def translate(text):
            return Translator().translate(text, dest='bn').text if lang == 'bn' else text

        def format_series(series):
            return {col: to_bn_digits(f"{val:.4f}") if isinstance(val, (int, float)) else to_bn_digits(str(val))
                    for col, val in series.items()}

        def format_df(df_obj):
            return {
                "columns": list(df_obj.columns),
                "index": list(df_obj.index),
                "data": [[to_bn_digits(f"{val:.4f}") if isinstance(val, (int, float)) else to_bn_digits(str(val)) for val in row]
                         for row in df_obj.values]
            }

        results = {}

        

        # Dataset structure
        results['missing'] = format_series(df.isnull().sum())
        results['info'] = {
            'rows': to_bn_digits(str(df.shape[0])),
            'columns': to_bn_digits(str(df.shape[1])),
            'duplicates': to_bn_digits(str(df.duplicated().sum())),
            'memory': to_bn_digits(f"{df.memory_usage(deep=True).sum() / 1024:.2f}")
        }

        # Select numerical and categorical
        numerical_df = df.select_dtypes(include=['int64', 'float64'])
        categorical_df = df.select_dtypes(include=['object', 'category'])

        # Descriptive statistics
        results['summary'] = format_df(numerical_df.describe().T)
        results['count'] = format_series(numerical_df.count())
        results['mean'] = format_series(numerical_df.mean())
        results['min'] = format_series(numerical_df.min())
        results['max'] = format_series(numerical_df.max())
        results['median'] = format_series(numerical_df.median())
        results['mode'] = format_series(numerical_df.mode().iloc[0])
        results['variance'] = format_series(numerical_df.var())
        results['std'] = format_series(numerical_df.std())

        # MAD
        mad = numerical_df.apply(lambda x: np.median(np.abs(x - np.median(x))))
        results['mad'] = format_series(mad)

        results['skew'] = format_series(numerical_df.skew())
        results['kurt'] = format_series(numerical_df.kurt())
        results['range'] = format_series(numerical_df.max() - numerical_df.min())
        iqr = numerical_df.quantile(0.75) - numerical_df.quantile(0.25)
        results['iqr'] = format_series(iqr)
        cv = numerical_df.std() / numerical_df.mean()
        results['cv'] = format_series(cv)

        outliers = ((numerical_df < (numerical_df.quantile(0.25) - 1.5 * iqr)) |
                    (numerical_df > (numerical_df.quantile(0.75) + 1.5 * iqr)))
        results['outliers'] = format_series(outliers.sum())

        # Entropy
        def compute_entropy(series):
            p = series.value_counts(normalize=True)
            return -np.sum(p * np.log2(p + 1e-9))

        entropy = {}
        for col in categorical_df.columns:
            e_val = compute_entropy(categorical_df[col])
            entropy[col] = to_bn_digits(f"{e_val:.4f}") if lang == 'bn' else f"{e_val:.4f}"
        results['entropy'] = entropy

        return JsonResponse({'success': True, **results})

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def process_similarity(request, df):
    import os
    import numpy as np
    import pandas as pd
    from numpy.linalg import norm
    from scipy.stats import spearmanr
    from googletrans import Translator
    from django.http import JsonResponse
    from functools import lru_cache
    from django.conf import settings

    try:
        # 1. Read parameters
        col1 = request.POST.get('column1')
        col2 = request.POST.get('column2')
        language = request.POST.get('language', 'en')
        if language not in ('en', 'bn'):
            language = 'en'

        # 2. Translator & digit mapping
        translator = Translator()
        digit_map = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')

        @lru_cache(None)
        def translate(txt): return translator.translate(txt, dest='bn').text if language == 'bn' else txt

        def map_digits(s): return s.translate(digit_map) if language == 'bn' else s

        def fmt(val, spec=".4f"):
            s = format(val, spec)
            return map_digits(s) if language == 'bn' else s

        # 3. Validate columns
        if not col1 or not col2:
            return JsonResponse({'success': False, 'error': 'Missing column names'})

        if col1 not in df.columns or col2 not in df.columns:
            return JsonResponse({'success': False, 'error': translate("One or both columns not found in the dataset.")})

        # 4. Filter numeric columns only
        numeric_df = df.select_dtypes(include=[np.number])
        if col1 not in numeric_df.columns or col2 not in numeric_df.columns:
            return JsonResponse({'success': False, 'error': translate("Please select numeric columns only.")})

        # 5. Prepare data vectors
        A = numeric_df[col1].dropna().to_numpy()
        B = numeric_df[col2].dropna().to_numpy()
        min_len = min(len(A), len(B))
        A, B = A[:min_len], B[:min_len]

        # 6. Compute metrics
        cos_sim         = float(np.dot(A, B) / (norm(A) * norm(B)))
        euclid_dist     = float(norm(A - B))
        manhattan_dist  = float(np.sum(np.abs(A - B)))
        chebyshev_dist  = float(np.max(np.abs(A - B)))
        p               = 3
        minkowski_dist  = float(np.sum(np.abs(A - B)**p)**(1/p))
        pearson_corr    = float(np.corrcoef(A, B)[0, 1])
        spearman_corr, _= spearmanr(A, B)

        result = {
            'cosine_similarity': fmt(cos_sim),
            'euclidean_distance': fmt(euclid_dist),
            'manhattan_distance': fmt(manhattan_dist),
            'chebyshev_distance': fmt(chebyshev_dist),
            'minkowski_distance': fmt(minkowski_dist),
            'pearson_correlation': fmt(pearson_corr),
            'spearman_correlation': fmt(spearman_corr),
            'p': map_digits(str(p)) if language == 'bn' else str(p),
        }

        heading = (
            f"Similarity / Distance between '{col1}' and '{col2}'"
            if language == 'en'
            else f"'{col1}' এবং '{col2}' এর মধ্যে সাদৃশ্য/দূরত্ব"
        )

        return JsonResponse({
            'success': True,
            'test': 'Similarity' if language == 'en' else 'সাদৃশ্য',
            'heading': heading,
            'results': result,
            'columns': [col1, col2]
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
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