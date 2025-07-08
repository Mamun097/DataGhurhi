import os
import matplotlib
import matplotlib.font_manager as fm
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import scipy.stats as stats
import seaborn as sns
from sklearn.preprocessing import OrdinalEncoder
from django.views.decorators.csrf import csrf_exempt
import json
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
            user_id = request.POST.get('userID') 
            print(f"Received user_id: {user_id}")

            if not user_id:
                return JsonResponse({'success': False, 'error': 'User ID not provided'})

            try:
                excel_file = request.FILES['file']
                df = pd.read_excel(excel_file)

                # Create the user's uploads folder: media/ID_<user_id>_uploads/uploads
                user_folder = os.path.join(settings.MEDIA_ROOT, f"ID_{user_id}_uploads", "temporary_uploads")
                os.makedirs(user_folder, exist_ok=True)

                # Save the file in that uploads folder
                save_path = os.path.join(user_folder, 'latest_uploaded.xlsx')
                df.to_excel(save_path, index=False)

                return JsonResponse({
                    'success': True,
                    'user_id': user_id,
                    'columns': df.columns.tolist()
                })

            except Exception as e:
                return JsonResponse({
                    'success': False,
                    'error': str(e),
                    'user_id': user_id
                })
        return JsonResponse({'success': False, 'error': 'Invalid request method or no file uploaded'})

from django.http import HttpResponse, JsonResponse
import os
import json
import pandas as pd
from django.http import JsonResponse, HttpResponse
from django.conf import settings



def analyze_data_api(request):
    if request.method == 'POST':
        try:
            user_id = request.POST.get('userID')
            # print(f"Received user_id: {user_id}")
            if not user_id:
                return JsonResponse({'success': False, 'error': 'User ID not provided'})

            # Load the latest uploaded DataFrame
            file_path = os.path.join(settings.MEDIA_ROOT, f"ID_{user_id}_uploads", "temporary_uploads", 'latest_uploaded.xlsx')
            if not os.path.exists(file_path):
                return JsonResponse({'success': False, 'error': 'No uploaded file found for this user'}, status=404)

            df = pd.read_excel(file_path)

            if request.content_type == 'application/json':
                body = json.loads(request.body)
                test_type = body.get('test_type', '')
                col1 = body.get('column1', '')
                col2 = body.get('column2', '')
                col3 = body.get('column3', '')
                col_group = body.get('primary_col')
                col_covariate = body.get('secondary_col')
                col_outcome = body.get('dependent_col')
                language = body.get('language', 'en')
                file_format = body.get('format', 'png')
                image_width = body.get('image_width')
                image_height = body.get('image_height')
            else:
                test_type = request.POST.get('test_type', '')
                col1 = request.POST.get('column1', '')
                col2 = request.POST.get('column2', '')
                col3 = request.POST.get('column3', '')
                col_group = request.POST.get('primary_col')
                col_covariate = request.POST.get('secondary_col')
                col_outcome = request.POST.get('dependent_col')
                language = request.POST.get('language', 'en')
                file_format = request.POST.get('format', 'png')
                image_width = request.POST.get('image_width')
                image_height = request.POST.get('image_height')

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
                return process_kruskal_test(request, df, col1, col2, user_id)
            
            elif test_type == 'mannwhitney':
                return process_mannwhitney_test(request, df, col1, col2,user_id)
 
            elif test_type == 'pearson':
                # Step 1: Get all dynamic column keys sent by frontend
                selected_columns = []
                for key in request.POST:
                    if key.startswith("column"):
                        value = request.POST[key]
                        if value in df.columns:
                            selected_columns.append(value)

                # Step 2: Validate count
                if len(selected_columns) < 2:
                    raise ValueError("Pearson correlation requires at least 2 columns")

                return process_pearson_test(request, df, selected_columns, user_id)

            elif test_type == 'spearman':
                # Step 1: Collect dynamic columns from form
                selected_columns = []
                for key in request.POST:
                    if key.startswith("column"):
                        value = request.POST[key]
                        if value in df.columns:
                            selected_columns.append(value)

                # Step 2: Validate
                if len(selected_columns) < 2:
                    raise ValueError("Spearman correlation requires at least 2 columns")

                return process_spearman_test(request, df, selected_columns, user_id)
          
            elif test_type == 'wilcoxon':
                return process_wilcoxon_test(request, df, col1, col2,user_id)
      
            elif test_type == 'shapiro':
                return process_shapiro_test(request, df, col1, user_id)
            
            elif test_type == 'linear_regression':
                return process_linear_regression_test(request, df, col1, col2,user_id)
            
            elif test_type == 'anova':
                return process_anova_test(request, df, col1, col2, user_id)
            
            elif test_type == 'ancova':
                col_group = request.POST.get('primary_col')
                col_covariate = request.POST.get('secondary_col')
                col_outcome = request.POST.get('dependent_col')
                return process_ancova_test(request, df, col_group, col_covariate, col_outcome, user_id)

            elif test_type == 'kolmogorov':
                column = request.POST.get('column')
                return process_ks_test(request, df, column, user_id)

            elif test_type == 'anderson':
                column = request.POST.get('column')
                return process_anderson_darling_test(request, df, column, user_id)            

            elif test_type == 'fzt':
                col_group = request.POST.get('column1')
                col_value = request.POST.get('column2')
                return process_fzt_test(request, df, col_group, col_value, user_id)

            elif test_type == 'cross_tabulation':
                selected_columns = []
                for key in request.POST:
                    if key.startswith("column") and request.POST[key] in df.columns:
                        selected_columns.append(request.POST[key])
                return process_cross_tabulation(request, df, selected_columns, user_id)

            elif test_type == 'eda_distribution':
                column = request.POST.get('column1')
                return process_eda_distribution(request, df, column, user_id)

            elif test_type == 'eda_swarm':
                column1 = request.POST.get('column1')  
                column2 = request.POST.get('column2')  
                return process_eda_swarm_plot(request, df, column1, column2, user_id)

            elif test_type == 'eda_pie':
                return process_eda_pie_chart(request, df, user_id)

            elif test_type == 'eda_basics':
                return process_eda_basics(request, df, user_id)

            elif test_type == 'similarity':
                return process_similarity(request, df, user_id)

            elif test_type == 'chi_square':
                return process_chi_square(request, df, user_id)

            elif test_type == 'cramers_heatmap':
                return process_cramers_heatmap(request, df, user_id)


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


def process_kruskal_test(request, df, col1, col2, user_id):
    print(f"Processing Kruskal-Wallis test for columns: {col1} and {col2}")
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
        #plots dir in user folder
        plots_dir = os.path.join(media_root, f"ID_{user_id}_uploads", 'temporary_uploads', 'plots')

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
            print(f"Saved plot to {final_path}")

            return f"{media_url}ID_{user_id}_uploads/temporary_uploads/plots/{final_filename}"

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

def process_mannwhitney_test(request, df, col1, col2, user_id):
    from django.http import JsonResponse
    import os
    import matplotlib.pyplot as plt
    import matplotlib.font_manager as fm
    from PIL import Image, ImageDraw, ImageFont
    from googletrans import Translator
    from scipy.stats import mannwhitneyu, rankdata
    import seaborn as sns
    import numpy as np
    from django.conf import settings


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
            label_font_size, tick_font_size, img_quality = 36, 16, 90
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
        plots_dir = os.path.join(media_root, f"ID_{user_id}_uploads", 'temporary_uploads', 'plots')
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
        image_paths.append(os.path.join(media_url, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', f'mannwhitney_boxplot.{img_format}'))

        # --- 7b. Violinplot ---
        fig, ax = plt.subplots(figsize=(fig_width, fig_height))
        sns.violinplot(x=col1, y=col2, data=df, palette=palette, width=violin_width, ax=ax)
        ax.set_xticks(cats)
        ax.set_xticklabels(cat_labels, fontproperties=(tick_bn if lang == 'bn' else tick_en))
        ax.set_yticklabels([map_digits(f"{v:.2f}") for v in ax.get_yticks()], fontproperties=(tick_bn if lang == 'bn' else tick_en))
        tmp = os.path.join(plots_dir, 'mann_violin_tmp.png')
        out = os.path.join(plots_dir, f'mannwhitney_violinplot.{img_format}')
        create_labeled_plot(fig, ax, f"Violin plot of {col2} by {col1}", col1, col2, tmp, out)
        image_paths.append(os.path.join(media_url, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', f'mannwhitney_violinplot.{img_format}'))

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
        image_paths.append(os.path.join(media_url, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', f'mannwhitney_rankplot.{img_format}'))

        result['image_paths'] = image_paths
        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_pearson_test(request, df, selected_columns, user_id):
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

        plots_dir = os.path.join(settings.MEDIA_ROOT, f"ID_{user_id}_uploads", 'temporary_uploads', 'plots')
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
            return os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', base_name + '.' + img_format)

        img_url = create_labeled_plot(fig, ax, title=translate("Pearson Correlation Heatmap"), base_name="pearson_heatmap")
        print(img_url)

        return JsonResponse({
            'success': True,
            'image_paths': [img_url],
            'columns': selected_columns,
            'message': translate("Pearson correlation matrix completed.")
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_spearman_test(request, df, selected_columns, user_id):
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

        plots_dir = os.path.join(settings.MEDIA_ROOT, f"ID_{user_id}_uploads", 'temporary_uploads', 'plots')
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
            return os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', base_name + '.' + img_format)

        image_url = create_labeled_plot(fig, ax, translate("Spearman Rank Correlation Heatmap"), "spearman_heatmap")
 
        return JsonResponse({
            'success': True,
            'image_paths': [image_url],
            'columns': selected_columns,
            'message': translate("Spearman correlation matrix completed.")
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_shapiro_test(request, df, col1, user_id):
    import os
    from scipy.stats import shapiro, norm
    from django.conf import settings
    from django.http import JsonResponse
    from googletrans import Translator
    import matplotlib.pyplot as plt
    import matplotlib.font_manager as fm
    import seaborn as sns
    from PIL import Image, ImageDraw, ImageFont
    import numpy as np
    import pandas as pd
    import re

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

        if not pd.api.types.is_numeric_dtype(df[col1]):
            return JsonResponse({
                'success': False,
                'error': translate("Please select a numerical column for Shapiro-Wilk test.")
            })

        # --- Font and Paths ---
        media_root = settings.MEDIA_ROOT
        plots_dir = os.path.join(media_root, f"ID_{user_id}_uploads", 'temporary_uploads', 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')

        # --- Plot customization ---
        if use_default:
            label_font_size, tick_font_size = 36, 16
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
            'image_path': os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', base_name + '.' + img_format)
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_wilcoxon_test(request, df, col1, col2, user_id):
    try:
        # --- Setup ---
        language = request.POST.get('language', 'en')
        fmt = request.POST.get('format', 'png').lower()
        fmt = 'png' if fmt not in ('png','jpg','jpeg','pdf','tiff') else fmt
        pil_fmt = {'png':'PNG','jpg':'JPEG','jpeg':'JPEG','pdf':'PDF','tiff':'TIFF'}[fmt]

        # Paths
        media_root = settings.MEDIA_ROOT
        plots_dir = os.path.join(media_root, f"ID_{user_id}_uploads", 'temporary_uploads', 'plots')
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
            full_url = os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', os.path.basename(final_path))

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

def process_linear_regression_test(request, df, col1, col2, user_id):
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

        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
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
        result['image_paths'] = [os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', f'regression_plot.{file_format}')]

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_anova_test(request, df, col1, col2, user_id):
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

        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        base_path = os.path.join(plots_dir, f"anova_base.{img_format}")
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
        result['image_paths'] = [os.path.join(settings.MEDIA_URL, f"ID_{user_id}_uploads", 'temporary_uploads', 'plots', f"anova_plot.{img_format}")]

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_ancova_test(request, df, col_group, col_covariate, col_outcome, user_id):
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
        ancova_model = smf.ols(formula, data=df).fit()
        ancova_table = sm.stats.anova_lm(ancova_model, typ=2)

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

        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
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
            'image_paths': [os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', f'ancova_plot.{file_format}')],
            'columns': [col_group, col_covariate, col_outcome]
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_ks_test(request, df, col, user_id):
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
    import re

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

        if not pd.api.types.is_numeric_dtype(df[col]):
            return JsonResponse({
                'success': False,
                'error': "Please pick a numerical column for Kolmogorov-Smirnov test."
            })

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
        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        base_path = os.path.join(plots_dir, f'ks_base.{file_format}')
        safe_col_name = re.sub(r'[\\/*?:"<>|]', "_", col)
        final_path = os.path.join(plots_dir, f'ks_{safe_col_name.replace(" ", "_")}.{file_format}')
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

        canvas.save(final_path, format=file_format.upper(), quality=image_quality)

        return JsonResponse({
            'success': True,
            'test': translate('Kolmogorov–Smirnov Test'),
            'p_value': p_str,
            'interpretation': interpretation,
            'image_paths': [os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', os.path.basename(final_path))],
            'columns': [col]
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_anderson_darling_test(request, df, col, user_id):
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
    import re

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
        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        os.makedirs(plots_dir, exist_ok=True)

        base_path = os.path.join(plots_dir, f'ad_base.{file_format}')
        col = re.sub(r'[\\/*?:"<>|]', "_", col)
        final_path = os.path.join(plots_dir, f'ad_{col.replace(" ", "_")}.{file_format}')
        fig.savefig(base_path, format=file_format.upper(), dpi=fig.dpi)
        plt.close(fig)

        # Add axis labels with PIL
        canvas_img = Image.open(base_path).convert('RGB')
        bw, bh = canvas_img.size
        pad = label_font_size // 2

        xlabel = translate('Theoretical Quantiles')
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
            'image_paths': [os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', os.path.basename(final_path))],
            'columns': [col]
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_fzt_test(request, df, col_group, col_value, user_id):
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
        plot_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        os.makedirs(plot_dir, exist_ok=True)

        def save_plot(filename, title, xlabel, ylabel):
            plt.title(translate(title), fontsize=label_font_size)
            plt.xlabel(translate(xlabel), fontsize=label_font_size)
            plt.ylabel(translate(ylabel), fontsize=label_font_size)
            prep_ax()
            full = os.path.join(plot_dir, filename + '.' + file_format)
            plt.savefig(full, dpi=image_dpi, bbox_inches='tight')
            plt.close()
            plots.append(os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', filename + '.' + file_format))

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

def process_cross_tabulation(request, df, selected_columns, user_id):
    from django.http import JsonResponse
    from django.conf import settings
    import pandas as pd
    import seaborn as sns
    import matplotlib.pyplot as plt
    import matplotlib as mpl
    import matplotlib.font_manager as fm
    from googletrans import Translator
    from PIL import Image, ImageDraw, ImageFont
    from functools import lru_cache
    import os
    import uuid


    try:
        if len(selected_columns) < 2:
            raise ValueError("At least two columns are required for cross-tabulation.")

        # --- 1. Input settings ---
        lang = request.POST.get('language', 'en').lower()
        if lang not in ('bn', 'en'):
            lang = 'en'
        fmt = request.POST.get('format', 'png').lower()
        if fmt not in ('png', 'jpg', 'jpeg', 'pdf', 'tiff'):
            fmt = 'png'
        pil_fmt = {'png': 'PNG', 'jpg': 'JPEG', 'jpeg': 'JPEG', 'pdf': 'PDF', 'tiff': 'TIFF'}[fmt]

        use_default = request.POST.get('use_default', 'true') == 'true'
        heatmap_color_theme = request.POST.get('palette', 'Blues') if not use_default else 'Blues'
        bar_width = float(request.POST.get('bar_width', 0.8))
        label_font_size = int(request.POST.get('label_font_size', 36))
        tick_font_size = int(request.POST.get('tick_font_size', 16))
        image_quality = int(request.POST.get('image_quality', 90))
        width, height = map(int, request.POST.get('image_size', '800x600').lower().split('x'))

        # --- 2. Fonts & translation ---
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        fm.fontManager.addfont(font_path)
        mpl.rcParams['font.family'] = fm.FontProperties(fname=font_path).get_name()
        label_font = ImageFont.truetype(font_path, label_font_size)
        tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size) if lang == 'bn' else fm.FontProperties(size=tick_font_size)

        translator = Translator()
        digit_map = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')

        @lru_cache(None)
        def translate(txt): return translator.translate(txt, dest='bn').text if lang == 'bn' else txt

        def map_digits(txt): return txt.translate(digit_map) if lang == 'bn' else txt

        # --- 3. File paths ---
        uid = str(uuid.uuid4())[:8]
        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        os.makedirs(plots_dir, exist_ok=True)

        def create_labeled_plot(fig, ax, title, xlabel, ylabel, base, final):
            ax.set(title='', xlabel='', ylabel='')
            plt.tight_layout(pad=0)
            fig.savefig(base, dpi=300, format='PNG', bbox_inches='tight')
            plt.close(fig)

            # Translate labels
            T = map_digits(translate(title))
            X = map_digits(translate(xlabel))
            Y = map_digits(translate(ylabel))
            t0, t1, t2, t3 = label_font.getbbox(T); th = t3 - t1
            x0, x1, x2, x3 = label_font.getbbox(X); xh = x3 - x1
            y0, y1, y2, y3 = label_font.getbbox(Y); yw = y2 - y0; yh = y3 - y1
            pad = label_font_size // 2
            lm, rm, tm, bm = yh + pad, pad, th + pad, xh + pad

            img = Image.open(base).convert("RGB")
            bw, bh = img.size
            W, H = bw + lm + rm, bh + tm + bm
            canvas = Image.new("RGB", (W, H), "white")
            canvas.paste(img, (lm, tm))
            draw = ImageDraw.Draw(canvas)

            def center_text(txt, font, total_width):
                return (total_width - int(draw.textlength(txt, font=font))) // 2

            draw.text((center_text(T, label_font, W), (tm - th) // 2), T, font=label_font, fill="black")
            draw.text((center_text(X, label_font, W), tm + bh + (bm - xh) // 2), X, font=label_font, fill="black")

            Yimg = Image.new("RGBA", (yw, yh), (255, 255, 255, 0))
            d2 = ImageDraw.Draw(Yimg)
            d2.text((0, 0), Y, font=label_font, fill="black")
            Yrot = Yimg.rotate(90, expand=True)
            canvas.paste(Yrot, ((lm - Yrot.width) // 2, tm + (bh - Yrot.height) // 2), Yrot)
            canvas.save(final, format=pil_fmt, quality=image_quality)

        # --- 4. Cross-tabulation heatmap ---
        pd.set_option('display.max_rows', None)
        colors = [mpl.colors.rgb2hex(c) for c in sns.color_palette(heatmap_color_theme, len(selected_columns))]
        cross_tab = pd.crosstab(index=[df[v] for v in selected_columns[:-1]], columns=df[selected_columns[-1]])

        # Translated DataFrame
        dtab = cross_tab.copy().astype(str).applymap(lambda x: map_digits(translate(x)))
        dtab.index = [
            map_digits(translate("|".join(map(str, ix))) if isinstance(ix, tuple) else translate(str(ix)))
            for ix in cross_tab.index
        ]
        dtab.columns = [map_digits(translate(str(c))) for c in cross_tab.columns]

        # Annotated heatmap
        annot = cross_tab.copy().astype(str)
        for r in annot.index:
            for c in annot.columns:
                annot.at[r, c] = map_digits(translate(annot.at[r, c]))

        fig1, ax1 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
        sns.heatmap(cross_tab, annot=annot, fmt='', cmap=heatmap_color_theme, cbar=True, ax=ax1)
        ax1.set_xticklabels([map_digits(translate(str(c))) for c in cross_tab.columns], fontproperties=tick_prop, rotation=45)
        ax1.set_yticklabels(
            [map_digits(translate("|".join(map(str, ix))) if isinstance(ix, tuple) else translate(str(ix))) for ix in cross_tab.index],
            fontproperties=tick_prop, rotation=0
        )
        cb = ax1.collections[0].colorbar
        cb.set_ticklabels([map_digits(translate(str(int(t)))) for t in cb.get_ticks()])
        cb.ax.tick_params(labelsize=tick_font_size)
        for lbl in cb.ax.get_yticklabels():
            lbl.set_fontproperties(tick_prop)

        base_heat = os.path.join(plots_dir, f"heatmap_base_{uid}.png")
        final_heatmap = os.path.join(plots_dir, f"crosstab_heatmap_{uid}.{fmt}")
        create_labeled_plot(fig1, ax1, f"Heatmap of {' vs '.join(selected_columns)}", selected_columns[-1], " × ".join(selected_columns[:-1]), base_heat, final_heatmap)

        # --- 5. Frequency Bar Plot ---
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
        final_bar = os.path.join(plots_dir, f'frequency_both_{uid}.{fmt}')
        fig2.savefig(final_bar, dpi=300, format=pil_fmt, bbox_inches='tight')
        plt.close(fig2)

        # --- 6. Summary Text ---
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
            'heatmap_path': os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', os.path.basename(final_heatmap)),
            'barplot_path': os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', os.path.basename(final_bar)),
            'summary': summary,
            'columns': selected_columns
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_eda_distribution(request, df, col, user_id):
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

        plot_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        os.makedirs(plot_dir, exist_ok=True)
        image_paths = []

        # Histogram
        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        sns.histplot(df[col], ax=ax, color=hist_color)
        hist_path = os.path.join(plot_dir, f'histogram_{col}.{file_format}')
        create_plot(fig, ax, f'Histogram of {col}', col, 'Count', 'hist_base.png', hist_path)
        image_paths.append(os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', f'histogram_{col}.{file_format}'))

        # KDE
        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        sns.kdeplot(df[col], ax=ax, fill=True, color=kde_color)
        kde_path = os.path.join(plot_dir, f'kde_{col}.{file_format}')
        create_plot(fig, ax, f'KDE Plot of {col}', col, 'Density', 'kde_base.png', kde_path)
        image_paths.append(os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', f'kde_{col}.{file_format}'))

        # Distribution
        g = sns.displot(df[col], kde=True, color=dist_color)
        fig = g.fig; ax = fig.axes[0]
        dist_path = os.path.join(plot_dir, f'distribution_{col}.{file_format}')
        create_plot(fig, ax, f'Distribution of {col}', col, 'Frequency', 'dist_base.png', dist_path)
        image_paths.append(os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', f'distribution_{col}.{file_format}'))

        return JsonResponse({ 
            'success': True,
            'test': translate("EDA: Distribution Plots"),
            'columns': [col],
            'image_paths': image_paths
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_eda_swarm_plot(request, df, col_cat, col_num, user_id):
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
        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
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
            'image_paths': [os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads',  'plots', 'swarm_final.' + file_format)],
            'columns': [col_cat, col_num],
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_eda_pie_chart(request, df, user_id):

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
        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
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
            'image_paths': [os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', f'pie_{col}.{img_format}')],
            'columns': [col]
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def process_eda_basics(request, df, user_id):
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

def process_similarity(request, df, user_id):
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

def process_chi_square(request, df, user_id):
    from django.http import JsonResponse
    from django.conf import settings
    import pandas as pd
    import numpy as np
    import seaborn as sns
    import matplotlib.pyplot as plt
    import matplotlib as mpl
    import matplotlib.font_manager as fm
    from scipy.stats import chi2_contingency
    from googletrans import Translator
    from PIL import Image, ImageDraw, ImageFont
    import os
    import uuid

    try:
        # --- 1) Get columns and settings ---
        x_col = request.POST.get("column1")
        y_col = request.POST.get("column2")
        lang = request.POST.get("language", "en")
        fmt = request.POST.get("format", "png").lower()
        pil_fmt = {"png": "PNG", "jpg": "JPEG", "jpeg": "JPEG", "pdf": "PDF", "tiff": "TIFF"}.get(fmt, "PNG")

        use_default = request.POST.get("use_default", "true") == "true"
        label_font_size = int(request.POST.get("label_font_size", 36))
        tick_font_size = int(request.POST.get("tick_font_size", 16))
        img_quality = int(request.POST.get("image_quality", 90))
        palette = request.POST.get("palette", "deep")
        image_size = request.POST.get("image_size", "800x600")
        try:
            width, height = map(int, image_size.lower().split("x"))
        except:
            width, height = 800, 600

        # --- 2) Setup font and paths ---
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        fm.fontManager.addfont(font_path)
        bengali_font = fm.FontProperties(fname=font_path).get_name()
        mpl.rcParams['font.family'] = bengali_font

        tick_font = fm.FontProperties(fname=font_path, size=tick_font_size) if lang == 'bn' else fm.FontProperties(size=tick_font_size)
        label_font = ImageFont.truetype(font_path, label_font_size)

        translator = Translator()
        def translate(txt): return translator.translate(txt, dest='bn').text if lang == 'bn' else txt
        def map_digits(txt): return txt.translate(str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')) if lang == 'bn' else txt

        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        uid = str(uuid.uuid4())[:8]

        # --- 3) Chi-square calculation ---
        observed = pd.crosstab(df[x_col], df[y_col])
        chi2, p_value, dof, expected = chi2_contingency(observed)
        exp_df = pd.DataFrame(expected, index=observed.index, columns=observed.columns)

        def interpret_p(p):
            if p < 0.001:
                return translate("P < 0.001: Highly significant association between variables.")
            elif p < 0.01:
                return translate("P < 0.01: Moderately significant association between variables.")
            elif p < 0.05:
                return translate("P < 0.05: Significant association between variables.")
            else:
                return translate("P ≥ 0.05: No statistically significant association between variables.")

        scenario_text = interpret_p(p_value)

        # --- 4) Countplot ---
        fig1, ax1 = plt.subplots(figsize=(width/100, height/100), dpi=100)
        sns.countplot(data=df, x=x_col, hue=y_col, palette=palette, ax=ax1)
        handles, labels = ax1.get_legend_handles_labels()
        if ax1.get_legend(): ax1.get_legend().remove()
        ax1.set_title(map_digits(translate("Count Plot")))
        ax1.set_xlabel(map_digits(translate(x_col)))
        ax1.set_ylabel(map_digits(translate("Frequency")))
        ax1.set_xticklabels([map_digits(translate(lbl.get_text())) for lbl in ax1.get_xticklabels()], fontproperties=tick_font)
        ax1.set_yticklabels([map_digits(str(int(lbl))) for lbl in ax1.get_yticks()], fontproperties=tick_font)
        count_path = os.path.join(plots_dir, f"chi_countplot_{uid}.{fmt}")
        fig1.savefig(count_path, dpi=300, bbox_inches='tight')
        plt.close(fig1)

        # --- 5) Observed heatmap ---
        fig2, ax2 = plt.subplots(figsize=(width/100, height/100), dpi=100)
        sns.heatmap(observed, annot=observed.applymap(lambda x: map_digits(str(int(x)))), cmap=sns.color_palette(palette, as_cmap=True), fmt="", ax=ax2)
        ax2.set_title(map_digits(translate("Observed Frequency Heatmap")))
        ax2.set_xlabel(map_digits(translate(x_col)))
        ax2.set_ylabel(map_digits(translate(y_col)))
        ax2.set_xticklabels([map_digits(translate(lbl.get_text())) for lbl in ax2.get_xticklabels()], fontproperties=tick_font)
        ax2.set_yticklabels([map_digits(translate(lbl.get_text())) for lbl in ax2.get_yticklabels()], fontproperties=tick_font)
        observed_path = os.path.join(plots_dir, f"chi_observed_heatmap_{uid}.{fmt}")
        fig2.savefig(observed_path, dpi=300, bbox_inches='tight')
        plt.close(fig2)

        # --- 6) Expected heatmap ---
        fig3, ax3 = plt.subplots(figsize=(width/100, height/100), dpi=100)
        sns.heatmap(exp_df, annot=exp_df.applymap(lambda x: map_digits(f"{x:.1f}")), cmap=sns.color_palette(palette, as_cmap=True), fmt="", ax=ax3)
        ax3.set_title(map_digits(translate("Expected Frequency Heatmap")))
        ax3.set_xlabel(map_digits(translate(x_col)))
        ax3.set_ylabel(map_digits(translate(y_col)))
        ax3.set_xticklabels([map_digits(translate(lbl.get_text())) for lbl in ax3.get_xticklabels()], fontproperties=tick_font)
        ax3.set_yticklabels([map_digits(translate(lbl.get_text())) for lbl in ax3.get_yticklabels()], fontproperties=tick_font)
        expected_path = os.path.join(plots_dir, f"chi_expected_heatmap_{uid}.{fmt}")
        fig3.savefig(expected_path, dpi=300, bbox_inches='tight')
        plt.close(fig3)

        return JsonResponse({
            'success': True,
            'test': 'Chi-Square Test' if lang == 'en' else 'কাই-স্কয়ার টেস্ট',
            'statistic': {
                'chi2': f"{chi2:.4f}",
                'p_value': f"{p_value:.4f}",
                'dof': str(dof),
            },
            'interpretation': scenario_text,
            'image_paths': [
                os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', os.path.basename(count_path)),
                os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', os.path.basename(observed_path)),
                os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', os.path.basename(expected_path))
            ],
            'columns': [x_col, y_col]
        })

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})

def process_cramers_heatmap(request, df, user_id):
    from django.http import JsonResponse
    from django.conf import settings
    import pandas as pd
    import seaborn as sns
    import matplotlib.pyplot as plt
    import matplotlib as mpl
    import matplotlib.font_manager as fm
    from googletrans import Translator
    from PIL import Image, ImageDraw, ImageFont
    import os
    import uuid

    try:
        # --- 1) Inputs ---
        x_col = request.POST.get("column1")
        y_col = request.POST.get("column2")
        lang = request.POST.get("language", "en")
        fmt = request.POST.get("format", "png").lower()
        pil_fmt = {"png": "PNG", "jpg": "JPEG", "jpeg": "JPEG", "pdf": "PDF", "tiff": "TIFF"}.get(fmt, "PNG")

        use_default = request.POST.get("use_default", "true") == "true"
        label_font_size = int(request.POST.get("label_font_size", 36))
        tick_font_size = int(request.POST.get("tick_font_size", 16))
        img_quality = int(request.POST.get("image_quality", 90))
        palette = request.POST.get("palette", "deep")
        image_size = request.POST.get("image_size", "800x600")
        try:
            width, height = map(int, image_size.lower().split("x"))
        except:
            width, height = 800, 600

        # --- 2) Font & Path setup ---
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        fm.fontManager.addfont(font_path)
        bengali_font = fm.FontProperties(fname=font_path).get_name()
        mpl.rcParams['font.family'] = bengali_font
        tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size) if lang == 'bn' else fm.FontProperties(size=tick_font_size)
        label_font = ImageFont.truetype(font_path, size=label_font_size)

        translator = Translator()
        def translate(txt): return translator.translate(txt, dest='bn').text if lang == 'bn' else txt
        def map_digits(txt): return txt.translate(str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')) if lang == 'bn' else txt

        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        uid = str(uuid.uuid4())[:8]

        # --- 3) Crosstab ---
        ct = pd.crosstab(df[x_col], df[y_col])
        annot_df = ct.applymap(lambda v: map_digits(translate(str(int(v)))))

        # --- 4) Heatmap ---
        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        cmap = sns.color_palette(palette, as_cmap=True)
        hm = sns.heatmap(ct, annot=annot_df, fmt="", cmap=cmap, ax=ax)

        ax.set_xlabel('')
        ax.set_ylabel('')
        ax.set_title('')

        # Translate axis labels
        ax.set_xticklabels([map_digits(translate(str(t))) for t in ct.columns], fontproperties=tick_prop)
        ax.set_yticklabels([map_digits(translate(str(t))) for t in ct.index], fontproperties=tick_prop)

        # Colorbar
        cbar = hm.collections[0].colorbar
        cb_vals = cbar.get_ticks()
        cbar.set_ticklabels([map_digits(translate(str(int(v)))) for v in cb_vals])
        cbar.ax.tick_params(labelsize=tick_font_size)

        # Save with PIL label wrapping
        base_path = os.path.join(plots_dir, f"cramers_heatmap_base_{uid}.png")
        final_path = os.path.join(plots_dir, f"cramers_heatmap_{uid}.{fmt}")
        fig.savefig(base_path, dpi=300, bbox_inches='tight')
        plt.close(fig)

        T = translate("Observed Counts Heatmap")
        X = translate(x_col)
        Y = translate(y_col)
        bw, bh = Image.open(base_path).convert("RGB").size
        tx = label_font.getbbox(T)[3]
        xx = label_font.getbbox(X)[3]
        yy = label_font.getbbox(Y)[2]
        pad = label_font_size // 2

        W = bw + yy + pad * 2
        H = bh + tx + xx + pad * 2
        canvas = Image.new("RGB", (W, H), "white")
        img = Image.open(base_path).convert("RGB")
        canvas.paste(img, (yy + pad, tx + pad))
        draw = ImageDraw.Draw(canvas)
        draw.text(((W - draw.textlength(T, font=label_font)) // 2, pad), T, font=label_font, fill='black')
        draw.text(((W - draw.textlength(X, font=label_font)) // 2, tx + bh + pad), X, font=label_font, fill='black')
        Yimg = Image.new("RGBA", label_font.getbbox(Y)[2:], (255,255,255,0))
        ImageDraw.Draw(Yimg).text((0, 0), Y, font=label_font, fill='black')
        Yrot = Yimg.rotate(90, expand=True)
        canvas.paste(Yrot, (pad, tx + (bh - Yrot.size[1]) // 2), Yrot)
        canvas.save(final_path, format=pil_fmt, quality=img_quality)

        return JsonResponse({
            'success': True,
            'image_paths': [os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', os.path.basename(final_path))],
            'columns': [x_col, y_col],
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def save_plot(plt, filename, user_id):
    import os

    from django.conf import settings
    plot_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
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

@csrf_exempt
def preview_data(request):
    from django.http import JsonResponse
    import pandas as pd
    import os
    from django.conf import settings
    import json

    if request.method == 'GET':
        user_id = request.headers.get('userID')
        print(f"Received User ID: {user_id}")

        if not user_id:
            return JsonResponse({'error': 'User ID not provided'}, status=400)

        # Build file path based on user-specific folder
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        print(f"Looking for folder: {folder_name}")

        file_path = os.path.join(settings.MEDIA_ROOT, folder_name, 'latest_uploaded.xlsx')

        if os.path.exists(file_path):
            df = pd.read_excel(file_path)

            # Replace NaN with None
            df_clean = df.where(pd.notnull(df), ' ')

            data = {
                'columns': df_clean.columns.tolist(),
                'rows': df_clean.to_dict(orient='records')
            }

            try:
                json_data = json.dumps(data, allow_nan=False)
                print("Rows with NaN:\n", df_clean[df_clean.isna().any(axis=1)])

                return HttpResponse(json_data, content_type='application/json')
            except ValueError as e:
                return JsonResponse({'error': f'Invalid data: {e}'}, status=500)
        else:
            return JsonResponse({'error': 'No uploaded file found for this user'}, status=404)



@csrf_exempt
def delete_columns_api(request):
    try:
        ##post_method
        ## extract user ID from request headers
        user_id = request.headers.get('userID')
        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        # Load file safely
        file_path = os.path.join(settings.MEDIA_ROOT, folder_name, 'latest_uploaded.xlsx')
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})

        try:
            df = pd.read_excel(file_path)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to read Excel: {str(e)}'})

        body = json.loads(request.body)
        columns = body.get('columns', [])

        if not columns:
            return JsonResponse({'success': False, 'error': 'No columns specified.'})

        df.drop(columns=columns, inplace=True, errors='ignore')

        # Save updated sheet
        df.to_excel(file_path, index=False)

        return JsonResponse({
            'success': True,
            'message': f'Deleted columns: {columns}',
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records')
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def remove_duplicates_api(request):
    try:
        # Extract user ID from request headers
        user_id = request.headers.get('userID')
        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, folder_name, 'latest_uploaded.xlsx')
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})

        df = pd.read_excel(file_path)
        before = len(df)
        df.drop_duplicates(inplace=True)
        removed = before - len(df)

        df.to_excel(file_path, index=False)

        return JsonResponse({
            'success': True,
            'message': f'Removed {removed} duplicate rows.',
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records')
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def handle_missing_api(request):
    try:
        # Extract user ID from request headers
        user_id = request.headers.get('userID')
        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, folder_name, 'latest_uploaded.xlsx')
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})

        df = pd.read_excel(file_path)
        body = json.loads(request.body)
        col = body.get('column')
        method = body.get('method', '')

        if method not in ['drop', 'fill_mean', 'fill_median']:
            return JsonResponse({'success': False, 'error': 'Invalid method.'})

        targets = df.columns.tolist() if col == 'all' else [col]

        if method == 'drop':
            df.dropna(subset=targets, inplace=True)
        elif method == 'fill_mean':
            for c in targets:
                if pd.api.types.is_numeric_dtype(df[c]):
                    df[c] = df[c].fillna(df[c].mean())
        elif method == 'fill_median':
            for c in targets:
                if pd.api.types.is_numeric_dtype(df[c]):
                    df[c] = df[c].fillna(df[c].median())

        df.to_excel(file_path, index=False)

        return JsonResponse({
            'success': True,
            'message': f'Missing values handled using method: {method}',
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records')
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def handle_outliers_api(request):
    try:
        # Extract user ID from request headers
        user_id = request.headers.get('userID')
        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, folder_name, 'latest_uploaded.xlsx')
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})

        df = pd.read_excel(file_path)
        body = json.loads(request.body)
        col = body.get('column', '')
        method = body.get('method', '')

        if col not in df.columns or not pd.api.types.is_numeric_dtype(df[col]):
            return JsonResponse({'success': False, 'error': 'Column is missing or not numeric.'})

        Q1, Q3 = df[col].quantile([0.25, 0.75])
        IQR = Q3 - Q1
        lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR

        if method == 'remove':
            before = len(df)
            df = df[(df[col] >= lower) & (df[col] <= upper)]
            removed = before - len(df)
            message = f"Removed {removed} outliers."
        elif method == 'cap':
            df[col] = np.where(df[col] < lower, lower, np.where(df[col] > upper, upper, df[col]))
            message = "Outliers capped to bounds."
        else:
            return JsonResponse({'success': False, 'error': 'Invalid method.'})

        df.to_excel(file_path, index=False)

        return JsonResponse({
            'success': True,
            'message': message,
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records')
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def rank_categorical_column_api(request):
    try:
        # Extract user ID from request headers
        user_id = request.headers.get('userID')
        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, folder_name, 'latest_uploaded.xlsx')
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})

        df = pd.read_excel(file_path)
        body = json.loads(request.body)

        col = body.get('column', '')
        mapping = body.get('mapping', {})  # {'Yes': 1, 'No': 2, ...}

        if col not in df.columns or not mapping:
            return JsonResponse({'success': False, 'error': 'Invalid column or mapping.'})

        new_col = col + '_ranked'
        df[new_col] = df[col].map(mapping)

        df.to_excel(file_path, index=False)

        return JsonResponse({
            'success': True,
            'message': f"Column '{col}' ranked into '{new_col}'",
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records')
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def split_column_api(request):
    try:
        # Extract user ID from request headers
        user_id = request.headers.get('userID')
        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, folder_name, 'latest_uploaded.xlsx')
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})

        df = pd.read_excel(file_path)
        body = json.loads(request.body)
        column = body.get('column')
        method = body.get('method')
        custom_phrases = body.get('phrases', [])

        if column not in df.columns:
            return JsonResponse({'success': False, 'error': 'Column not found.'})

        if method == 'comma':
            df_split = df[column].str.split(',', expand=True)
            df_split.columns = [f"{column}_part_{i+1}" for i in range(df_split.shape[1])]
        elif method == 'semicolon':
            df_split = df[column].str.split(';', expand=True)
            df_split.columns = [f"{column}_part_{i+1}" for i in range(df_split.shape[1])]
        elif method == 'tags':
            df_split = df[column].str.extractall(r'<(.*?)>').unstack().droplevel(0, axis=1)
            df_split.columns = [f"{column}_tag_{i+1}" for i in range(df_split.shape[1])]
        elif method == 'custom' and custom_phrases:
            from collections import Counter

            def count_phrases(text):
                tokens = str(text).split(", ")
                result = []
                i = 0
                while i < len(tokens):
                    if i + 1 < len(tokens):
                        combined = tokens[i] + ", " + tokens[i + 1]
                        if combined in custom_phrases:
                            result.append(combined)
                            i += 2
                            continue
                    result.append(tokens[i])
                    i += 1
                return Counter(result)

            for phrase in custom_phrases:
                df[phrase] = df[column].apply(lambda x: count_phrases(x).get(phrase, 0))
            df_split = df[custom_phrases]
        else:
            return JsonResponse({'success': False, 'error': 'Invalid method or input.'})

        df = pd.concat([df, df_split], axis=1)
        df.to_excel(file_path, index=False)

        return JsonResponse({
            'success': True,
            'message': 'Column split successful.',
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records')
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def group_data_api(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method.'})

    try:
        import os
        import json
        import pandas as pd
        from django.conf import settings



        # Extract user ID from request headers        
        user_id = request.headers.get('userID')
        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        

        body = json.loads(request.body)
        grouping_pairs = body.get('groupingPairs', [])

        if not grouping_pairs:
            return JsonResponse({'success': False, 'error': 'No grouping pairs provided.'})

        file_path = os.path.join(settings.MEDIA_ROOT, folder_name, 'latest_uploaded.xlsx')
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded Excel file found.'})

        try:
            df = pd.read_excel(file_path)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to read Excel file: {str(e)}'})

        grouped_dfs = []
        for pair in grouping_pairs:
            group_col = pair.get('group_col')
            value_col = pair.get('value_col')

            if group_col not in df.columns or value_col not in df.columns:
                return JsonResponse({'success': False, 'error': f"Invalid columns: {group_col}, {value_col}"})

            if not pd.api.types.is_numeric_dtype(df[value_col]):
                return JsonResponse({'success': False, 'error': f"'{value_col}' must be numeric."})

            # Safely handle null groups
            groups = df[group_col].dropna().unique().tolist()

            grouped_df = pd.concat([
                df.loc[df[group_col] == g, [group_col, value_col]].assign(Group=g)
                for g in groups
            ])

            grouped_dfs.append(grouped_df)

        # === Save grouped splits to separate Excel sheets ===
        output_path = os.path.join(settings.MEDIA_ROOT, 'grouped_splits.xlsx')
        try:
            with pd.ExcelWriter(output_path) as writer:
                for i, gdf in enumerate(grouped_dfs):
                    sheet_name = f"group_{i+1}"
                    gdf.to_excel(writer, sheet_name=sheet_name, index=False)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to save grouped file: {str(e)}'})

        return JsonResponse({
            'success': True,
            'message': 'Grouped splits saved to Excel file.',
            'download_url': f"media/ID_{user_id}_uploads/temporary_uploads/grouped_splits.xlsx"
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def generate_unique_id_column_api(request):
    try:
        # Extract user ID from request headers
        user_id = request.headers.get('userID')
        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, folder_name, 'latest_uploaded.xlsx')
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded Excel file found.'})

        df = pd.read_excel(file_path)

        col_name = 'row_id'
        df[col_name] = np.arange(1, len(df) + 1)

        df.to_excel(file_path, index=False)

        return JsonResponse({
            'success': True,
            'message': f"Column '{col_name}' added with unique IDs.",
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records')
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    
@csrf_exempt
def save_preprocessed_file_api(request):
    if request.method == 'POST':
        try:
            user_id = request.headers.get('userID')
            if not user_id:
                return JsonResponse({'success': False, 'error': 'User ID not provided.'})
            print(f"Received User ID: {user_id}")

            uploaded_file = request.FILES.get('file')
            file_type = request.POST.get('file_type')  # 'survey' or 'preprocessed'

            if not uploaded_file:
                return JsonResponse({'success': False, 'error': 'No file uploaded.'})
            if file_type not in ['survey', 'preprocessed']:
                return JsonResponse({'success': False, 'error': 'Invalid or missing file_type.'})

            # Define folder path
            folder_name = 'survey' if file_type == 'survey' else 'preprocessed'
            folder_path = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads/temporary_uploads/', folder_name)
            os.makedirs(folder_path, exist_ok=True)

            # Handle CSV for survey type
            original_ext = os.path.splitext(uploaded_file.name)[1].lower()
            if file_type == 'survey' and original_ext == '.csv':
                df = pd.read_csv(uploaded_file)
                file_name = os.path.splitext(uploaded_file.name)[0] + '.xlsx'
                file_path = os.path.join(folder_path, file_name)
                df.to_excel(file_path, index=False)
            else:
                # Save original file
                file_name = uploaded_file.name
                file_path = os.path.join(folder_path, file_name)
                with open(file_path, 'wb+') as destination:
                    for chunk in uploaded_file.chunks():
                        destination.write(chunk)

            return JsonResponse({
                'success': True,
                'message': f"File saved as {file_name}",
                'file_url': os.path.join(settings.MEDIA_URL,f'ID_{user_id}_uploads/temporary_uploads/', folder_name, file_name),
            })

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
