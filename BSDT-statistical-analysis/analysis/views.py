import os
import matplotlib  as mpl
import uuid
import matplotlib.font_manager as fm
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import scipy.stats as stats
import seaborn as sns
from sklearn.preprocessing import OrdinalEncoder
from django.views.decorators.csrf import csrf_exempt
import json
mpl.use('Agg') 
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
from scipy.stats import shapiro, anderson
from matplotlib.patches import Patch

def infer_type(s, thresh=10):
    if pd.api.types.is_numeric_dtype(s):
        return 'categorical' if s.nunique() < thresh else 'numeric'
    else:
        return 'categorical'
    
try:
    from openpyxl import load_workbook
except ImportError:
    load_workbook = None



def save_uploaded_file(user_id: str, django_file) -> dict:
    filename = django_file.name
    user_folder = os.path.join(settings.MEDIA_ROOT, f"ID_{user_id}_uploads", "temporary_uploads")
    os.makedirs(user_folder, exist_ok=True)

    save_path = os.path.join(user_folder, filename)
    with open(save_path, 'wb+') as dest:
        for chunk in django_file.chunks():
            dest.write(chunk)

    file_url = os.path.join(
        settings.MEDIA_URL, f"ID_{user_id}_uploads", "temporary_uploads", filename
    ).replace('\\', '/')

    return {
        "save_path": save_path,
        "filename": filename,
        "file_url": file_url,
        "user_folder": user_folder,
    }


def _get_active_sheet_name_xlsx(path: str) -> str | None:
    if load_workbook is None:
        return None
    try:
        wb = load_workbook(path, read_only=True, data_only=True)
        return wb.active.title if wb and wb.active else None
    except Exception:
        return None


def infer_columns_from_file(save_path: str, filename: str, active_sheet_name: str | None = None):
    ext = os.path.splitext(filename)[1].lower()
    cols: list[str] = []
    sheet_names: list[str] = []
    used_sheet: str | None = None

    if ext == '.csv':
        df = pd.read_csv(save_path, nrows=200)
        cols = list(df.columns)
        return cols, sheet_names, used_sheet

    try:
        xls = pd.ExcelFile(save_path)
        sheet_names = xls.sheet_names or []
    except Exception as e:
        try:
            df = pd.read_excel(save_path, nrows=200)
            cols = list(df.columns)
            return cols, sheet_names, used_sheet
        except Exception as inner:
            raise RuntimeError(f"Failed to read Excel file: {inner}") from e

    target_sheet = None

    if active_sheet_name and active_sheet_name in sheet_names:
        target_sheet = active_sheet_name

    if target_sheet is None and ext in ('.xlsx', '.xlsm', '.xltx', '.xltm'):
        active_name = _get_active_sheet_name_xlsx(save_path)
        if active_name and active_name in sheet_names:
            target_sheet = active_name

    if target_sheet is None and sheet_names:
        target_sheet = sheet_names[0]

    used_sheet = target_sheet

    df = pd.read_excel(save_path, sheet_name=target_sheet, nrows=200)
    cols = list(df.columns)

    return cols, sheet_names, used_sheet

@csrf_exempt
def upload_file(request):
    
    if not request.FILES.get('file'):
        return JsonResponse({'success': False, 'error': 'No file uploaded'})

    user_id = request.POST.get('userID')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'User ID not provided'})

    try:
        save_info = save_uploaded_file(user_id, request.FILES['file'])
        return JsonResponse({
            'success': True,
            'user_id': user_id,
            **{
                'save_path': save_info['save_path'],
                'filename': save_info['filename'],
                'fileURL': save_info['file_url'],
                'user_folder': save_info['user_folder'],
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e), 'user_id': user_id})


@csrf_exempt
def get_columns(request):
    
    user_id = request.POST.get('userID')
    filename = request.POST.get('filename')
    active_sheet_name = request.POST.get('activeSheet')  
    file_url= request.POST.get('Fileurl')


    if not file_url:
        return JsonResponse({'success': False, 'error': 'File URL not provided'})

    user_folder = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))
    
    save_path = user_folder 

    if not user_id:
        return JsonResponse({'success': False, 'error': 'User ID not provided'})
    if not save_path or not filename:
        return JsonResponse({'success': False, 'error': 'savePath and filename are required', 'user_id': user_id})

    try:
        try:
            cols, sheet_names, used_sheet = infer_columns_from_file(
                save_path=save_path,
                filename=filename,
                active_sheet_name=active_sheet_name
            )
        except Exception as infer_err:
            try:
                df = pd.read_excel(save_path, nrows=200)
                cols = list(df.columns)
                sheet_names = []
                used_sheet = None
            except Exception:
                return JsonResponse({
                    'success': False,
                    'error': f'Failed to infer columns: {infer_err}',
                    'user_id': user_id
                })

        return JsonResponse({
            'success': True,
            'user_id': user_id,
            'columns': cols,
            'sheet_names': sheet_names,
            'active_sheet_used': used_sheet,
            'filename': filename,
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e), 'user_id': user_id})


# def get_columns(request):
#     if request.method == 'POST' and request.FILES.get('file'):
#         user_id = request.POST.get('userID')
#         print(f"Received user_id: {user_id}")

#         if not user_id:
#             return JsonResponse({'success': False, 'error': 'User ID not provided'})

#         try:
#             excel_file = request.FILES['file']
#             filename = request.FILES['file'].name
#             print(f"Received file: {filename}")

#             # Create the user's uploads folder: media/ID_<user_id>_uploads/temporary_uploads
#             user_folder = os.path.join(settings.MEDIA_ROOT, f"ID_{user_id}_uploads", "temporary_uploads")
#             os.makedirs(user_folder, exist_ok=True)

#             # Save the ORIGINAL upload unchanged
#             save_path = os.path.join(user_folder, filename)
#             with open(save_path, 'wb+') as dest:
#                 for chunk in excel_file.chunks():
#                     dest.write(chunk)

#             # Infer columns (supports CSV and Excel). We'll reassign df AFTER saving.
#             cols = []
#             sheet_names = []
#             try:
#                 ext = os.path.splitext(filename)[1].lower()
#                 if ext == '.csv':
#                     df = pd.read_csv(save_path, nrows=200)  # peek only
#                     cols = list(df.columns)
#                 else:
#                     xls = pd.ExcelFile(save_path)
#                     sheet_names = xls.sheet_names
#                     df = pd.read_excel(save_path, sheet_name=sheet_names[0], nrows=200)
#                     cols = list(df.columns)
#             except Exception as infer_err:
#                 # Fallback: try generic Excel read (keeps your original behavior path)
#                 df = pd.read_excel(save_path)
#                 cols = list(df.columns)
#                 print(f"Inference fallback due to: {infer_err}")

#             # Only process tests if selected (keeping your placeholders)
#             matched_results = {}
#             input_info = {}

#             return JsonResponse({
#                 'success': True,
#                 'user_id': user_id,
#                 'columns': cols,
#                 'input_info': input_info,
#                 # Clean, browser-usable URL (forward slashes)
#                 'fileURL': os.path.join(
#                     settings.MEDIA_URL, f"ID_{user_id}_uploads", "temporary_uploads", filename
#                 ).replace('\\', '/'),
#                 # Helpful for multi-tab preview in the client (Excel only; CSV -> [])
#                 'sheet_names': sheet_names,
#                 'filename': filename,
#             })

#         except Exception as e:
#             return JsonResponse({
#                 'success': False,
#                 'error': str(e),
#                 'user_id': user_id
#             })

#     return JsonResponse({'success': False, 'error': 'Invalid request method or no file uploaded'})


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
            filename = request.POST.get('file_name')
            sheet_name= request.POST.get('sheet_name')
            file_url= request.POST.get('Fileurl') 
            # print(f"Received filename: {filename}")

                      
            # print(f"Received user_id: {user_id}")
            if not user_id:
                return JsonResponse({'success': False, 'error': 'User ID not provided'})

            # Load the  DataFrame of file name


            file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", "")) 
            if not os.path.exists(file_path):
                return JsonResponse({'success': False, 'error': 'No uploaded file found for this user'}, status=404)

            lower = filename.lower()
            if lower.endswith(('.xls', '.xlsx', '.xlsm', '.xlsb', '.ods')):

                try:
                    xls = pd.ExcelFile(file_path)
                    sheet_names = xls.sheet_names
                except Exception as e:
                    return JsonResponse({'success': False, 'error': f'Failed to read workbook: {e}'}, status=400)

                if sheet_name:
                    # Validate requested sheet
                    if sheet_name not in sheet_names:
                        return JsonResponse({
                            'success': False,
                            'error': f"Requested sheet '{sheet_name}' not found. Available: {sheet_names}"
                        }, status=400)
                    df = pd.read_excel(xls, sheet_name=sheet_name)
                    active_sheet = sheet_name
                else:
                    # Fallback to the first sheet
                    df = pd.read_excel(xls, sheet_name=sheet_names[0] if sheet_names else 0)
                    active_sheet = sheet_names[0] if sheet_names else 'Sheet1'
            else:
                # Non-Excel (e.g., CSV) -> treat as a single sheet
                df = pd.read_csv(file_path)
                active_sheet = 'Sheet1'
            
            # if df.empty:
            #     return JsonResponse({'success': False, 'error': 'The uploaded file is empty'}, status=400)
            # print(f"DataFrame loaded with {len(df)} rows and {len(df.columns)} columns")

            

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
            ordinal_mappings = {}
            categorical_cols = df.select_dtypes(include=['object']).columns

            if not categorical_cols.empty:
                encoder = OrdinalEncoder()
                df[categorical_cols] = encoder.fit_transform(df[categorical_cols])
                print(f"Converted categorical columns: {list(categorical_cols)}")

                for i, col in enumerate(categorical_cols):
                    categories = encoder.categories_[i]  # Use the fitted encoder's categories_
                    ordinal_mappings[col] = {idx: cat for idx, cat in enumerate(categories)}

                print(ordinal_mappings)


            
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

            # New Code for Pie Chart
            elif test_type == 'eda_pie':
                col = request.POST.get('column1')
                return process_pie_chart(request, df, col, user_id,ordinal_mappings)


            elif test_type == 'eda_basics':
                return process_eda_basics(request, df, user_id)

            elif test_type == 'similarity':
                return process_similarity(request, df, user_id)

            elif test_type == 'chi_square':
                selected_columns = []
                for key in request.POST:
                    if key.startswith("column"):
                        value = request.POST[key]
                        if value in df.columns:
                            selected_columns.append(value)
                print("Selected columns for Chi-Square www :", selected_columns )
                return process_chi_square(request, df, selected_columns, user_id)

            elif test_type == 'cramers_heatmap':
                selected_columns = []
                for key in request.POST:
                    if key.startswith("column"):
                        value = request.POST[key]
                        if value in df.columns:
                            selected_columns.append(value)
                return process_cramers_heatmap(request,selected_columns, df, user_id)

            elif test_type == 'network_graph':
                selected_columns = []
                for key in request.POST:
                    if key.startswith("column") and request.POST[key] in df.columns:
                        selected_columns.append(request.POST[key])
                return process_network_graph(request, df, selected_columns, user_id)

            elif test_type == 'bar_chart':
                col = request.POST.get('column1')
                orientation = request.POST.get('orientation', 'vertical')
                return process_bar_chart_test(request, df, col, user_id, orientation, ordinal_mappings)
            

            return render(request, 'analysis/results.html', {
                'results': results,
                'columns': [col1, col2, col3] if col3 else [col1, col2],
                'active_sheet': active_sheet,
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


# views.py (or wherever your view lives)

import os
import io
import json
import math
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import seaborn as sns
import pandas as pd
from PIL import Image, ImageDraw, ImageFont
from scipy import stats

from django.conf import settings
from django.http import JsonResponse

# Optional: googletrans for auto-translation of labels to Bengali
try:
    from googletrans import Translator  # pip install googletrans==4.0.0-rc1
except Exception:  # pragma: no cover
    Translator = None


def process_kruskal_test(request, df: pd.DataFrame, col1: str, col2: str, user_id: str):
    

   
    print(f"[Kruskal] cols: {col1}(group) | {col2}(value)")
    if col1 not in df.columns or col2 not in df.columns:
        return JsonResponse({'success': False, 'error': 'Invalid column names.'})

    
    try:
        language   = request.POST.get('language', 'en').lower()
        img_format = request.POST.get('format', 'png').lower()
        use_default = request.POST.get('use_default', 'true') == 'true'
    except Exception:
        language, img_format, use_default = 'en', 'png', True

    if language not in ('en', 'bn'):
        language = 'en'
    if img_format not in ('png', 'jpg', 'jpeg', 'pdf', 'tiff'):
        img_format = 'png'

    
    pil_fmt = {
        'png': 'PNG',
        'jpg': 'JPEG',
        'jpeg': 'JPEG',
        'pdf': 'PDF',
        'tiff': 'TIFF'
    }.get(img_format, 'PNG')

    # Plot params
    if use_default:
        label_font_size = 86
        tick_font_size  = 18
        img_quality     = 100
        width, height   = 1280, 720
        palette         = 'bright'
        bar_width       = 0.4
        box_width       = 0.4
        violin_width    = 0.4
    else:
        def _int(name, default):
            try: return int(request.POST.get(name, default))
            except Exception: return default
        def _float(name, default):
            try: return float(request.POST.get(name, default))
            except Exception: return default

        label_font_size = _int('label_font_size', 86)
        tick_font_size  = _int('tick_font_size', 18)
        img_quality     = _int('image_quality', 100)

        size_input = request.POST.get('image_size', '1280x720')
        try:
            width, height = map(int, size_input.lower().split('x'))
        except Exception:
            width, height = 1280, 720

        palette      = request.POST.get('palette', 'bright') or 'bright'
        bar_width    = _float('bar_width', 0.4)
        box_width    = _float('box_width', 0.4)
        violin_width = _float('violin_width', 0.4)

    
    media_root = settings.MEDIA_ROOT
    plots_dir  = os.path.join(media_root, f"ID_{user_id}_uploads", "temporary_uploads", "plots")
    os.makedirs(plots_dir, exist_ok=True)

    
    translator = Translator() if (Translator is not None and language == 'bn') else None

    digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')

    def translate(text: str) -> str:
        if language == 'bn' and translator is not None:
            try:
                return translator.translate(text, dest='bn').text
            except Exception:
                return text
        return text

    def map_digits(s: str) -> str:
        return s.translate(digit_map_bn) if language == 'bn' else s


    font_path = os.path.join(getattr(settings, 'BASE_DIR', ''), 'NotoSansBengali-Regular.ttf')

    def get_pil_font(size: int) -> ImageFont.FreeTypeFont:
       
        try:
            if language == 'bn' and os.path.exists(font_path):
                return ImageFont.truetype(font_path, size=size)
            djv_path = fm.findfont('DejaVu Sans', fallback_to_default=True)
            if os.path.exists(djv_path):
                return ImageFont.truetype(djv_path, size=size)
        except Exception:
            pass
        return ImageFont.load_default()

    # For Matplotlib tick labels: prefer same font family if available
    try:
        if language == 'bn' and os.path.exists(font_path):
            fm.fontManager.addfont(font_path)
            bengali_font_name = fm.FontProperties(fname=font_path).get_name()
            matplotlib.rcParams['font.family'] = bengali_font_name
        else:
            # Use DejaVu Sans to maximize glyph coverage
            matplotlib.rcParams['font.family'] = 'DejaVu Sans'
    except Exception as e:
        print(f"[Kruskal] Matplotlib font setup warning: {e}")

    tick_prop = fm.FontProperties(size=tick_font_size)
    if language == 'bn' and os.path.exists(font_path):
        tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size)

    
    work = df[[col1, col2]].copy()
    work = work.dropna(subset=[col1, col2])
    print(f"[Kruskal] after dropna: {len(work)} rows")

    # Ensure grouping column is categorical
    if not pd.api.types.is_categorical_dtype(work[col1]):
        work[col1] = work[col1].astype('category')

    categories = list(work[col1].cat.categories)
    if len(categories) < 2:
        return JsonResponse({'success': False, 'error': 'Need at least 2 groups in the factor column for Kruskal–Wallis.'})

    # Ensure value column is numeric
    if not pd.api.types.is_numeric_dtype(work[col2]):
        work[col2] = pd.to_numeric(work[col2], errors='coerce')
        work = work.dropna(subset=[col2])
        if not pd.api.types.is_numeric_dtype(work[col2]):
            return JsonResponse({'success': False, 'error': f'"{col2}" must be numeric for Kruskal–Wallis.'})

    
    groups = [work.loc[work[col1] == g, col2].values for g in categories]
    if any(len(g) == 0 for g in groups):
        return JsonResponse({'success': False, 'error': 'Each group must contain at least one observation.'})

    try:
        stat, p_value = stats.kruskal(*groups)
        print(f"[Kruskal] result: H={stat}, p={p_value}")
    except Exception as e:
        return JsonResponse({'success': False, 'error': f'Error in Kruskal–Wallis test: {e}'})

    def create_labeled_plot(fig, ax, title, xlabel, ylabel, base_filename, final_filename):
        
        # Remove mpl labels (we draw them with PIL)
        ax.set_title('')
        ax.set_xlabel('')
        ax.set_ylabel('')

        # Save high-res base image (PNG) without labels
        base_path = os.path.join(plots_dir, base_filename)
        final_path = os.path.join(plots_dir, final_filename)

        plt.tight_layout(pad=1)
        fig.savefig(base_path, bbox_inches='tight', dpi=300, format='PNG')
        plt.close(fig)

        # Prepare strings
        T = map_digits(translate(title))
        X = map_digits(translate(xlabel))
        Y = map_digits(translate(ylabel))

        # Fonts
        label_font = get_pil_font(label_font_size)

        # Measure text
        tx0, ty0, tx1, ty1 = label_font.getbbox(T); th = ty1 - ty0
        xx0, xy0, xx1, xy1 = label_font.getbbox(X); xh = xy1 - xy0
        yx0, yy0, yx1, yy1 = label_font.getbbox(Y); yw, yh = yx1 - yx0, yy1 - yy0

        # Padding (left must fit rotated Y label height)
        pad = max(label_font_size // 2, 10)
        lm, rm, tm, bm = yh + pad, pad, th + pad, xh + pad

        # Compose canvas
        base_img = Image.open(base_path).convert("RGB")
        bw, bh = base_img.size
        W, H = bw + lm + rm, bh + tm + bm
        canvas = Image.new("RGB", (W, H), "white")
        canvas.paste(base_img, (lm, tm))
        draw = ImageDraw.Draw(canvas)

        # center helper
        def center_h(txt, fnt, total_w):
            return (total_w - int(draw.textlength(txt, font=fnt))) // 2

        # Title (top center)
        tx = center_h(T, label_font, W)
        draw.text((tx, (tm - th) // 2), T, font=label_font, fill="black")

        # X-axis (bottom center)
        xx = center_h(X, label_font, W)
        draw.text((xx, tm + bh + (bm - xh) // 2), X, font=label_font, fill="black")

        # Y-axis (rotated)
        Yimg = Image.new("RGBA", (yw, yh), (255, 255, 255, 0))
        d2 = ImageDraw.Draw(Yimg)
        d2.text((0, 0), Y, font=label_font, fill="black")
        Yrot = Yimg.rotate(90, expand=True)
        canvas.paste(Yrot, ((lm - Yrot.width) // 2, tm + (bh - Yrot.height) // 2), Yrot)

        # Save final in requested format
        canvas.save(final_path, format=pil_fmt, quality=img_quality, dpi=(300, 300), optimize=True)
        print(f"[Kruskal] saved: {final_path}")

        return f"{settings.MEDIA_URL}ID_{user_id}_uploads/temporary_uploads/plots/{final_filename}" 

   
    cat_labels = [map_digits(translate(str(c))) for c in categories]

   
    image_paths = []

    # 9a) Count plot (group sizes)
    fig1, ax1 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
    counts = work[col1].value_counts().reindex(categories).fillna(0).astype(int)    
    sns.barplot(x=[str(c) for c in categories], y=counts.values, ax=ax1, width=bar_width, palette=palette)
    ax1.set_xticklabels(cat_labels, fontproperties=tick_prop)
    # y ticks (map to digits if bn)
    yt = ax1.get_yticks()
    yt_labels = []
    for v in yt:
        if abs(v - int(round(v))) < 1e-6:
            s = f"{int(round(v))}"
        else:
            s = f"{v:.0f}"
        yt_labels.append(map_digits(s))
    ax1.set_yticklabels(yt_labels, fontproperties=tick_prop)
    #grid lines
    ax1.set_axisbelow(True)  # ensures grid is drawn behind bars
    ax1.grid(True, linestyle=':', linewidth=1.75, alpha=0.8)    

    count_path = create_labeled_plot(
        fig1, ax1,
        title=f"{col1} group sizes",
        xlabel=col1, ylabel=col2,
        base_filename="count_base.png",
        final_filename=f"countplot.{img_format}"
    )
    image_paths.append(count_path)

    # 9b) Box plot of col2 by col1
    fig2, ax2 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
    sns.boxplot(x=work[col1], y=work[col2], ax=ax2, width=box_width, palette=palette, order=categories)
    ax2.set_xticklabels(cat_labels, fontproperties=tick_prop)
    yt2 = ax2.get_yticks()
    ax2.set_yticklabels([map_digits(f"{v:.2f}") for v in yt2], fontproperties=tick_prop)
    ax2.set_axisbelow(True)
    ax2.grid(True, linestyle=':', linewidth=1.75, alpha=0.8)

    box_path = create_labeled_plot(
        fig2, ax2,
        title=f"Boxplot of {col2} by {col1}",
        xlabel=col1, ylabel=col2,
        base_filename="box_base.png",
        final_filename=f"boxplot.{img_format}"
    )
    image_paths.append(box_path)

    # 9c) Violin plot of col2 by col1
    fig3, ax3 = plt.subplots(figsize=(width / 100, height / 100), dpi=100)
    sns.violinplot(x=work[col1], y=work[col2], ax=ax3, width=violin_width, palette=palette, order=categories, cut=0)
    ax3.set_xticklabels(cat_labels, fontproperties=tick_prop)
    yt3 = ax3.get_yticks()
    ax3.set_yticklabels([map_digits(f"{v:.2f}") for v in yt3], fontproperties=tick_prop)
    ax3.set_axisbelow(True)
    ax3.grid(True, linestyle=':', linewidth=1.75, alpha=0.8)

    violin_path = create_labeled_plot(
        fig3, ax3,
        title=f"Violin plot of {col2} by {col1}",
        xlabel=col1, ylabel=col2,
        base_filename="violin_base.png",
        final_filename=f"violinplot.{img_format}"
    )
    image_paths.append(violin_path)

    
    stat_out = stat
    p_out    = p_value
    if language == 'bn':
        stat_out = map_digits(f"{stat:.6g}")
        p_out    = map_digits(f"{p_value:.6g}")

    return JsonResponse({
        'test': 'Kruskal-Wallis H-test' if language == 'en' else 'ক্রুসকাল-ওয়ালিস এইচ-টেস্ট',
        'statistic': stat_out,
        'p_value': p_out,
        'success': True,
        'image_paths': image_paths
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
    
    from itertools import combinations
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
    
    from scipy.stats import shapiro, norm
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
    
    
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import r2_score, mean_squared_error
    
   

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
    
    from scipy.stats import kstest, norm    
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

def process_pie_chart(request, df, col,user_id,ordinal_mappings):
    import re 
    try:
        # --- Params ---
        language = request.POST.get('language', 'en')
        fmt = request.POST.get('format', 'png').lower()
        fmt = fmt if fmt in ('png', 'jpg', 'jpeg', 'pdf', 'tiff') else 'png'

        use_default = request.POST.get('use_default', 'true') == 'true'
        if use_default:
            dpi, width, height = 300, 900, 650
        else:
            dpi = int(request.POST.get('dpi', 300))
            width, height = map(int, request.POST.get('image_size', '900x650').split('x'))

        # --- Fonts / translator ---
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        try:
            fm.fontManager.addfont(font_path)
        except Exception:
            pass
        if language == 'bn' and os.path.exists(font_path):
            plt.rcParams['font.family'] = fm.FontProperties(fname=font_path).get_name()

        translator = Translator()
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')
        def translate(text): 
            if language == 'bn':
                try:
                    return translator.translate(text, dest='bn').text
                except Exception:
                    return text
            return text
        def map_digits(s): return s.translate(digit_map_bn) if language == 'bn' else s

        # --- Validate col ---
        if col not in df.columns:
            return JsonResponse({'success': False, 'error': f"Column {col} not found"})

        # --- Treat column as categorical always ---
        series = df[col].astype(str).fillna('NaN')
        counts = df[col].value_counts() 
        # labels_data = counts.index.tolist()  
        labels_raw= [ordinal_mappings.get(col, {}).get(idx, str(idx)) for idx in counts.index]  
 
        print(labels_raw) 

        sizes = counts.values

        # --- Too many categories check ---
        if len(labels_raw) > 10:
            msg = ("শ্রেণি সংখ্যা ১০ এর বেশি। পাই চার্ট উপযুক্ত নয়। বার চার্ট ব্যবহার করুন।"
                   if language == 'bn'
                   else "Too many categories (>10). Pie charts are not suitable. Please try a bar chart instead.")
            return JsonResponse({'success': False, 'error': msg})

        # --- Colors & figure ---
        colors = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd",
                  "#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(width/100, height/100), dpi=dpi,
                                       gridspec_kw={'width_ratios': [2, 1]})
        total = sum(sizes)

        # autopct
        def make_autopct(values):
            def my_autopct(pct):
                text = f"{pct:.1f}%"
                return map_digits(text) if language == 'bn' else text
            return my_autopct

        wedges, texts, autotexts = ax1.pie(
            sizes, labels=None, autopct=make_autopct(sizes),
            startangle=90, colors=colors[:len(sizes)],
            wedgeprops=dict(edgecolor='black', linewidth=1.2), radius=1.0
        )
        ax1.axis('equal')

        # --- Improved small slice handling ---
        total = sum(sizes)
        small_slices = []
        for i, (wedge, autotext) in enumerate(zip(wedges, autotexts)):
            try:
                pct = float(autotext.get_text().replace('%', ''))
            except Exception:
                pct = 0.0

            if pct >= 5:
                autotext.set_color("white")
                autotext.set_weight("bold")
            else:
                ang = (wedge.theta2 + wedge.theta1) / 2.0
                small_slices.append((i, wedge, autotext, pct, ang))

        # sort by angle
        small_slices.sort(key=lambda x: x[4])
        distances = [1.3, 1.5, 1.8, 2.0]

        for idx, (i, wedge, autotext, pct, ang) in enumerate(small_slices):
            distance_idx = idx % len(distances)
            label_distance = distances[distance_idx]
            line_end_distance = label_distance - 0.1

            x = label_distance * math.cos(math.radians(ang))
            y = label_distance * math.sin(math.radians(ang))

            percentage_text = f"{pct:.1f}%"
            if language == 'bn':
                percentage_text = map_digits(percentage_text)

            autotext.set_text(percentage_text)
            autotext.set_color("black")
            autotext.set_weight("bold")
            autotext.set_position((x, y))
            autotext.set_ha('center')
            autotext.set_va('center')

            # draw leader line
            x1 = 1.0 * math.cos(math.radians(ang))
            y1 = 1.0 * math.sin(math.radians(ang))
            x2 = line_end_distance * math.cos(math.radians(ang))
            y2 = line_end_distance * math.sin(math.radians(ang))
            ax1.plot([x1, x2], [y1, y2], color="black", linewidth=1)

        # Title
        ax1.set_title(map_digits(translate(f"Pie Chart of {col}")), fontsize=16, pad=20)

        # FIXED: Legend - EXACTLY like the Python code
        # Create labels_display exactly like in Python code
        labels_display = [map_digits(translate(str(lab))) for lab in labels_raw]

        legend_elements = []
        for i, (label, size_val) in enumerate(zip(labels_display, sizes)):
            percentage = size_val/total*100
            percentage_text = f'{percentage:.1f}%'
            if language == 'bn':
                percentage_text = map_digits(percentage_text)

            legend_text = f"{label} - {percentage_text}"
            legend_elements.append(Patch(
                facecolor=colors[i % len(colors)],
                edgecolor='black', 
                label=legend_text
            ))

        ax2.legend(handles=legend_elements, loc='center', frameon=False,
                fontsize=12, handlelength=1, handleheight=1, handletextpad=0.5)
        ax2.axis('off')

        plt.tight_layout()

        # --- Safe filename ---
        def safe_filename(name):
            # Replace invalid characters with underscore and truncate long names
            cleaned = re.sub(r'[<>:"/\\|?*]', '_', name)
            return cleaned[:100]  # max 100 chars to avoid OS limits

        filename = f"pie_{safe_filename(col)}.{fmt}"
        plots_dir =  os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        out_path = os.path.join(plots_dir, filename)

        plt.savefig(out_path, dpi=dpi, bbox_inches="tight")
        plt.close(fig)

        return JsonResponse({
            'success': True,
            'image_paths': [os.path.join(settings.MEDIA_URL, 'plots', filename)],
            'message': "Pie chart generated successfully",
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

def process_chi_square(request, df, selected_columns, user_id):
    from scipy.stats import chi2_contingency
   

    try:
        # ── 1) Inputs ──────────────────────────────────────────────────────
        lang = (request.POST.get("language", "en") or "en").lower()
        is_bn = (lang == "bn")
        palette = request.POST.get("palette", "viridis")
        image_size = request.POST.get("image_size", "800x600")
        try:
            width, height = map(int, image_size.lower().split("x"))
        except Exception:
            width, height = 800, 600

        # Variables to analyze
        vars_list = selected_columns or []
        if len(vars_list) < 2:
            return JsonResponse({'success': False, 'error': 'Please select at least two categorical variables.'})
        # ── 2) Paths & fonts 
        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        uid = str(uuid.uuid4())[:8]

        # Try Bengali font (safe fallback if missing)
        font_path = os.path.join(getattr(settings, "BASE_DIR", ""), 'NotoSansBengali-Regular.ttf')
        try:
            fm.fontManager.addfont(font_path)
            bn_font_name = fm.FontProperties(fname=font_path).get_name()
            mpl.rcParams['font.family'] = bn_font_name if is_bn else mpl.rcParams.get('font.family', 'sans-serif')
        except Exception:
            pass
        # PIL font for title
        try:
            title_font = ImageFont.truetype(font_path, 50  if width >= 800 else 42)
        except Exception:
            title_font = ImageFont.load_default()

        # Bengali digit mapping for any overlay text
        digit_map_bn = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')
        def map_digits(s):
            if not is_bn: return s
            return str(s).translate(digit_map_bn)

        # ── 3) Core helpers ────────────────────────────────────────────────
        def fnum(x):
            if x is None or (isinstance(x, float) and np.isnan(x)): return None
            try: return float(x)
            except Exception: return None

        def inum(x):
            if x is None or (isinstance(x, float) and np.isnan(x)): return None
            try: return int(x)
            except Exception:
                try: return int(float(x))
                except Exception: return None

        def chi2_one(a, b, dropna=True, include_na_as_category=False, yates_for_2x2=True):
            s1, s2 = df[a], df[b]
            if include_na_as_category:
                s1, s2 = s1.fillna("__NA__"), s2.fillna("__NA__")
            elif dropna:
                m = s1.notna() & s2.notna()
                s1, s2 = s1[m], s2[m] 
            ct = pd.crosstab(s1, s2, dropna=False)
            if ct.shape[0] == 0 or ct.shape[1] == 0:
                return dict(n=0, chi2=np.nan, dof=np.nan, p=np.nan)
            yates = yates_for_2x2 and (ct.shape[0] == 2 and ct.shape[1] == 2)
            chi2, p, dof, _ = chi2_contingency(ct, correction=yates)
            return dict(n=int(ct.values.sum()), chi2=float(chi2), dof=int(dof), p=float(p))

        def fdr_bh(pvals):
            p = np.asarray(pvals, float)
            n = p.size
            order = np.argsort(p)
            ranked = p[order]
            adj = np.empty(n, float)
            cm = 1.0
            for i in range(n-1, -1, -1):
                cm = min(cm, ranked[i] * n / (i+1))
                adj[i] = cm
            out = np.empty(n, float)
            out[order] = np.minimum(adj, 1.0)
            return out

        
        def one_block(anchor, do_fdr=True):
            others = [c for c in vars_list if c != anchor]
            rows = []
            for o in others:
                r = chi2_one(anchor, o, dropna=True, include_na_as_category=False, yates_for_2x2=True)
                rows.append({
                    "variable1": anchor,
                    "variable2": o,
                    "chi2": fnum(r["chi2"]),
                    "p_value": fnum(r["p"]),
                    "dof": inum(r["dof"]),
                    "n": inum(r["n"]),
                })

            if do_fdr and any(row["p_value"] is not None for row in rows):
                ps = np.array([row["p_value"] if row["p_value"] is not None else np.nan for row in rows], float)
                mask = ~np.isnan(ps)
                padj = np.full(len(rows), np.nan, float)
                if mask.any():
                    padj[mask] = fdr_bh(ps[mask])
                for i, row in enumerate(rows):
                    row["_p_adj_tmp"] = float(padj[i]) if not np.isnan(padj[i]) else None
                rows.sort(key=lambda r: (r["_p_adj_tmp"] is None, r["_p_adj_tmp"] if r["_p_adj_tmp"] is not None else 1.0))
                for row in rows:
                    row.pop("_p_adj_tmp", None)
            else:
                rows.sort(key=lambda r: (r["p_value"] is None, r["p_value"] if r["p_value"] is not None else 1.0))
            return rows

        blocks, summary_rows = [], []
        for anchor in vars_list:
            block_rows = one_block(anchor, do_fdr=True)
            blocks.append({"anchor": anchor, "rows": block_rows})
            summary_rows.extend(block_rows)

        
        n = len(vars_list)
        P = np.ones((n, n), dtype=float)
        for i, a in enumerate(vars_list):
            for j in range(i+1, n):
                b = vars_list[j]
                res = chi2_one(a, b, dropna=True, include_na_as_category=False, yates_for_2x2=True)
                P[i, j] = P[j, i] = res["p"] if res["p"] is not None else 1.0
        np.fill_diagonal(P, 1.0)

        

        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        sns.heatmap(
            P,
            vmin=0, vmax=1,
            cmap="coolwarm",
            annot=np.round(P, 2),
            fmt=".2f",
            square=True,
            linewidths=0.75,
            linecolor="white",
            cbar_kws={"label": "p-value"}
        )
        ax.set_xticks(np.arange(n) + 0.5)
        ax.set_yticks(np.arange(n) + 0.5)
        ax.set_xticklabels(vars_list, rotation=45, ha="right", fontsize=10)
        ax.set_yticklabels(vars_list, rotation=0, fontsize=10)
        ax.set_xlabel("")
        ax.set_ylabel("")
        plt.tight_layout()

        base_name = f"chi2_pairwise_heatmap_base_{uid}.png"
        final_name = f"chi2_pairwise_heatmap_{uid}.png"
        base_path = os.path.join(plots_dir, base_name)
        final_path = os.path.join(plots_dir, final_name)
        plt.savefig(base_path, dpi=300, bbox_inches="tight")
        plt.close(fig)

        
        base_img = Image.open(base_path).convert("RGB")
        bw, bh = base_img.size
        pad = 16
        title_text = ("p-value pairwise chi-square heatmap"
                    if lang != "bn"
                    else "p-value জোড়াভিত্তিক কাই-স্কয়ার হিটম্যাপ")
        try:
            title_font = ImageFont.truetype(font_path, 50 if width >= 800 else 28)
        except Exception:
            title_font = ImageFont.load_default()

        
        # measure
        try:
            tx0, ty0, tx1, ty1 = title_font.getbbox(title_text)
            th = ty1 - ty0
            tw = tx1 - tx0
        except Exception:
            th, tw = 40, 400

        top_margin = th + 2*pad
        canvas = Image.new("RGB", (bw, bh + top_margin), "white")
        canvas.paste(base_img, (0, top_margin))
        draw2 = ImageDraw.Draw(canvas)
        tx = max(0, (bw - tw) // 2)
        ty = max(0, (top_margin - th) // 2)
        draw2.text((tx, ty), title_text, fill="black", font=title_font)
        canvas.save(final_path, format="PNG")
        try:
            os.remove(base_path)
        except Exception:
            pass

        # Public URL for React
        base_url = os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        heatmap_url = os.path.join(base_url, final_name)


        # ── 6) Table columns for React ─────────────────────────────────────
        if is_bn:
            table_columns = [
                {"key": "variable1", "label": "ভেরিয়েবল ১"},
                {"key": "variable2", "label": "ভেরিয়েবল ২"},
                {"key": "chi2",      "label": "কাই-স্কয়ার পরিসংখ্যান"},
                {"key": "p_value",   "label": "পি-মান"},
                {"key": "dof",       "label": "স্বাধীনতার মাত্রা"},
                {"key": "n",         "label": "নমুনা"},
            ]
        else:
            table_columns = [
                {"key": "variable1", "label": "Variable 1"},
                {"key": "variable2", "label": "Variable 2"},
                {"key": "chi2",      "label": "Chi-square statistic"},
                {"key": "p_value",   "label": "P-value"},
                {"key": "dof",       "label": "DoF"},
                {"key": "n",         "label": "N"},
            ]

        # ── 7) Response (no heatmap payload; image URL only) ───────────────
        return JsonResponse({
            "success": True, 
            "variables": vars_list,
            "table_columns": table_columns,
            "summary_rows": summary_rows,  
            "blocks": blocks,             
            "image_path": heatmap_url     
        })

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})

def process_cramers_heatmap(request, selected_columns, df, user_id):
    

    try:
        # --- 1) Inputs ---
        lang = request.POST.get("language", "en")
        fmt = request.POST.get("format", "png").lower()
        pil_fmt = {"png": "PNG", "jpg": "JPEG", "jpeg": "JPEG", "pdf": "PDF", "tiff": "TIFF"}.get(fmt, "PNG")

        label_font_size = 58
        tick_font_size =36
        img_quality = int(request.POST.get("image_quality", 90))
        palette = request.POST.get("palette", "coolwarm")
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


        if len(selected_columns) < 2:
            return JsonResponse({'success': False, 'error': "Select at least two columns"})
        print(selected_columns) 

        # --- 3) Compute Cramér’s V matrix ---
        def cramers_v(x, y):
            confusion_matrix = pd.crosstab(x, y)
            # print("Confusion Matrix:\n", confusion_matrix)

            chi2, _, _, _ = chi2_contingency(confusion_matrix)  # ✅ use scipy
            n = confusion_matrix.sum().sum()
            phi2 = chi2 / n
            r, k = confusion_matrix.shape
            #bias correction
            phi2corr = max(0,phi2-((k-1)*(r-1))/(n-1))
            rcorr = r - ((r - 1) ** 2) / ( n - 1 )
            kcorr = k - ((k - 1) ** 2) / ( n - 1 )
            return np.sqrt(phi2corr / min(kcorr - 1, rcorr - 1)) 


        n = len(selected_columns)
        mat = pd.DataFrame(np.zeros((n, n)), index=selected_columns, columns=selected_columns)
        for i in range(n):
            for j in range(n):
                if i == j:
                    mat.iloc[i, j] = 1.0
                else:
                    mat.iloc[i, j] = cramers_v(df[selected_columns[i]], df[selected_columns[j]])
        # print(mat) 
        # --- 4) Heatmap ---
        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        cmap = sns.color_palette(palette, as_cmap=True)
        hm = sns.heatmap(mat, annot=True, fmt=".2f", cmap=cmap, ax=ax, cbar=True)
        

        
        # Hide all Matplotlib text; PIL will draw it
        ax.set_xlabel(''); ax.set_ylabel(''); ax.set_title('')
        ax.set_xticklabels([]); ax.set_yticklabels([])
        ax.tick_params(axis='both', length=0)

        
        fig.canvas.draw()
        renderer = fig.canvas.get_renderer()

        n_rows, n_cols = mat.shape

        
        x_left_fig,  _          = ax.transData.transform((0,        0))
        x_right_fig, _          = ax.transData.transform((n_cols,   0))
        
        _, y_top_fig            = ax.transData.transform((0,        0))
        _, y_bottom_fig         = ax.transData.transform((0,   n_rows))

        # column centers (x only)
        col_centers_fig = [ax.transData.transform((j + 0.5, 0))[0] for j in range(n_cols)]
        # row centers (y only)
        row_centers_fig = [ax.transData.transform((0, i + 0.5))[1] for i in range(n_rows)]

    
        save_dpi = 300
        scale = save_dpi / fig.dpi

        x_left_px   = int(x_left_fig   * scale)
        x_right_px  = int(x_right_fig  * scale)
        y_top_px    = int(y_top_fig    * scale)
        y_bottom_px = int(y_bottom_fig * scale)
        col_centers_px = [int(x * scale) for x in col_centers_fig]
        row_centers_px = [int(y * scale) for y in row_centers_fig]

        
        base_png_path = os.path.join(plots_dir, f"cramers_heatmap_{uid}_base.png")
        fig.savefig(base_png_path, dpi=save_dpi)   
        plt.close(fig)


        # Prepare localized labels 
        title_txt  = map_digits(translate("Cramér's V Heatmap"))
        col_labels = [map_digits(translate(str(t))) for t in mat.columns]
        row_labels = [map_digits(translate(str(t))) for t in mat.index]

        
        tick_font  = ImageFont.truetype(font_path, size=tick_font_size)

        # Open base and make a canvas with margins
        base = Image.open(base_png_path).convert("RGB")
        bw, bh = base.size

        def _w(font, txt): 
            if not txt: return 0
            a,b,c,d = font.getbbox(txt); return c-a
        def _h(font, txt): 
            if not txt: return 0
            a,b,c,d = font.getbbox(txt); return d-b

        title_h = _h(label_font, title_txt) if title_txt else 0
        pad     = max(8, tick_font.size // 2)

        # estimate needed margins
        max_x_tick_h = max((_w(tick_font, s) for s in col_labels), default=0) // 2 + tick_font.size // 2
        max_y_tick_w = max((_w(tick_font, s) for s in row_labels), default=0)

        top_margin    = (title_h + pad) if title_txt else pad
        bottom_margin = (max_x_tick_h + pad) if col_labels else pad
        left_margin   = (max_y_tick_w + pad) if row_labels else pad
        right_margin  = pad

        W = bw + left_margin + right_margin
        H = bh + top_margin + bottom_margin
        canvas = Image.new("RGB", (W, H), "white")
        canvas.paste(base, (left_margin, top_margin))
        draw = ImageDraw.Draw(canvas)

        # Title (top, centered)
        if title_txt:
            tlen = draw.textlength(title_txt, font=label_font)
            tx = (W - int(tlen)) // 2
            ty = (top_margin - title_h) // 2
            draw.text((tx, ty), title_txt, font=label_font, fill="black")

        # Convert heatmap edge & center pixels into canvas coords
        x_left_c   = left_margin + x_left_px
        x_right_c  = left_margin + x_right_px
        y_top_c    = top_margin  + y_top_px
        y_bottom_c = top_margin  + y_bottom_px
        col_centers_c = [left_margin + x for x in col_centers_px]
        row_centers_c = [top_margin  + y for y in row_centers_px]

        # X labels (bottom, rotated 45°, centered under each column)
        base_y =  y_bottom_c + pad
        # X labels: bottom of the axis, horizontally centered under each column
        for cx, lab in zip(col_centers_c, col_labels):
            tw = int(draw.textlength(lab, font=tick_font))
            th = tick_font.size
            lx = cx - tw               # center text under the column
            ly = y_bottom_c + pad           # place just below the heatmap bottom edge
            
            lab_img = Image.new("RGBA", (tw + 8, th + 8), (255,255,255,0))
            d2 = ImageDraw.Draw(lab_img)
            d2.text((4, 0), lab, font=tick_font, fill="black")
            lab_rot = lab_img.rotate(30, expand=True)
            lx = cx - lab_rot.width
            ly = y_top_c + pad
            canvas.paste(lab_rot, (lx, ly), lab_rot)



        # Y labels (left, horizontal, centered on each row)
        for cy, lab in zip(row_centers_c, row_labels):
            tw = int(draw.textlength(lab, font=tick_font))
            lx = max(0, x_left_c - pad - tw)
            ly = cy - tick_font.size // 2
            draw.text((lx, ly), lab, font=tick_font, fill="black")

        # Final save
        final_path = os.path.join(plots_dir, f"cramers_heatmap_{uid}.{fmt}")
        if pil_fmt == "JPEG":
            canvas.save(final_path, format=pil_fmt, quality=img_quality, subsampling=0, progressive=True)
        elif pil_fmt == "PNG":
            canvas.save(final_path, format=pil_fmt, optimize=True)
        else:
            canvas.save(final_path, format=pil_fmt)



        print(final_path) 

        return JsonResponse({
            'success': True,
            'image_paths': [os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', os.path.basename(final_path))],
            'columns': selected_columns,
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

# def process_cramers_heatmap(request, df, user_id):
#     from django.http import JsonResponse
#     from django.conf import settings
#     import pandas as pd
#     import seaborn as sns
#     import matplotlib.pyplot as plt
#     import matplotlib as mpl
#     import matplotlib.font_manager as fm
#     from googletrans import Translator
#     from PIL import Image, ImageDraw, ImageFont
#     import os
#     import uuid

#     try:
#         # --- 1) Inputs ---
#         x_col = request.POST.get("column1")
#         y_col = request.POST.get("column2")
#         lang = request.POST.get("language", "en")
#         fmt = request.POST.get("format", "png").lower()
#         pil_fmt = {"png": "PNG", "jpg": "JPEG", "jpeg": "JPEG", "pdf": "PDF", "tiff": "TIFF"}.get(fmt, "PNG")

#         use_default = request.POST.get("use_default", "true") == "true"
#         label_font_size = int(request.POST.get("label_font_size", 36))
#         tick_font_size = int(request.POST.get("tick_font_size", 16))
#         img_quality = int(request.POST.get("image_quality", 90))
#         palette = request.POST.get("palette", "deep")
#         image_size = request.POST.get("image_size", "800x600")
#         try:
#             width, height = map(int, image_size.lower().split("x"))
#         except:
#             width, height = 800, 600

#         # --- 2) Font & Path setup ---
#         font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
#         fm.fontManager.addfont(font_path)
#         bengali_font = fm.FontProperties(fname=font_path).get_name()
#         mpl.rcParams['font.family'] = bengali_font
#         tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size) if lang == 'bn' else fm.FontProperties(size=tick_font_size)
#         label_font = ImageFont.truetype(font_path, size=label_font_size)

#         translator = Translator()
#         def translate(txt): return translator.translate(txt, dest='bn').text if lang == 'bn' else txt
#         def map_digits(txt): return txt.translate(str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')) if lang == 'bn' else txt

#         plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
#         os.makedirs(plots_dir, exist_ok=True)
#         uid = str(uuid.uuid4())[:8]

#         # --- 3) Crosstab ---
#         ct = pd.crosstab(df[x_col], df[y_col])
#         annot_df = ct.applymap(lambda v: map_digits(translate(str(int(v)))))

#         # --- 4) Heatmap ---
#         fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
#         cmap = sns.color_palette(palette, as_cmap=True)
#         hm = sns.heatmap(ct, annot=annot_df, fmt="", cmap=cmap, ax=ax)

#         ax.set_xlabel('')
#         ax.set_ylabel('')
#         ax.set_title('')

#         # Translate axis labels
#         ax.set_xticklabels([map_digits(translate(str(t))) for t in ct.columns], fontproperties=tick_prop)
#         ax.set_yticklabels([map_digits(translate(str(t))) for t in ct.index], fontproperties=tick_prop)

#         # Colorbar
#         cbar = hm.collections[0].colorbar
#         cb_vals = cbar.get_ticks()
#         cbar.set_ticklabels([map_digits(translate(str(int(v)))) for v in cb_vals])
#         cbar.ax.tick_params(labelsize=tick_font_size)

#         # Save with PIL label wrapping
#         base_path = os.path.join(plots_dir, f"cramers_heatmap_base_{uid}.png")
#         final_path = os.path.join(plots_dir, f"cramers_heatmap_{uid}.{fmt}")
#         fig.savefig(base_path, dpi=300, bbox_inches='tight')
#         plt.close(fig)

#         T = translate("Observed Counts Heatmap")
#         X = translate(x_col)
#         Y = translate(y_col)
#         bw, bh = Image.open(base_path).convert("RGB").size
#         tx = label_font.getbbox(T)[3]
#         xx = label_font.getbbox(X)[3]
#         yy = label_font.getbbox(Y)[2]
#         pad = label_font_size // 2

#         W = bw + yy + pad * 2
#         H = bh + tx + xx + pad * 2
#         canvas = Image.new("RGB", (W, H), "white")
#         img = Image.open(base_path).convert("RGB")
#         canvas.paste(img, (yy + pad, tx + pad))
#         draw = ImageDraw.Draw(canvas)
#         draw.text(((W - draw.textlength(T, font=label_font)) // 2, pad), T, font=label_font, fill='black')
#         draw.text(((W - draw.textlength(X, font=label_font)) // 2, tx + bh + pad), X, font=label_font, fill='black')
#         Yimg = Image.new("RGBA", label_font.getbbox(Y)[2:], (255,255,255,0))
#         ImageDraw.Draw(Yimg).text((0, 0), Y, font=label_font, fill='black')
#         Yrot = Yimg.rotate(90, expand=True)
#         canvas.paste(Yrot, (pad, tx + (bh - Yrot.size[1]) // 2), Yrot)
#         canvas.save(final_path, format=pil_fmt, quality=img_quality)

#         return JsonResponse({
#             'success': True,
#             'image_paths': [os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots', os.path.basename(final_path))],
#             'columns': [x_col, y_col],
#         })

#     except Exception as e:
#         return JsonResponse({'success': False, 'error': str(e)})

# def process_network_graph(request, df, selected_columns, user_id): 
#     import os
#     import random
#     from django.http import JsonResponse
#     from django.conf import settings
#     import matplotlib.pyplot as plt
#     import matplotlib.font_manager as fm
#     from PIL import Image, ImageDraw, ImageFont
#     import networkx as nx
#     import numpy as np
#     import re

#     try:
#         language = request.POST.get("language", "en").strip().lower()
#         node_color = request.POST.get("node_color", "#AED6F1")
#         node_size = int(request.POST.get("node_size", 800))
#         text_size = int(request.POST.get("text_size", 25))
#         text_color = request.POST.get("text_color", "black")
#         edge_width_factor = float(request.POST.get("edge_width_factor", 0.5))
#         show_edge_weights = request.POST.get("show_edge_weights", "n").lower() == "y"
#         weight_font_size = int(request.POST.get("weight_font_size", 3)) if show_edge_weights else 0
#         weight_color = request.POST.get("weight_color", "red") if show_edge_weights else "red"
#         use_matrix = request.POST.get("use_matrix", "n").lower() == "y"

#         digit_map = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")
#         root_bn = "নোড"

#         print("Selected columns for network graph:", selected_columns)



#         def to_bn(lbl):
#             # Extract number part at the end of the label (e.g. Node12 → 12 → ১২)
#             match = re.search(r'(\d+)$', lbl)
#             if match:
#                 number_part = match.group(1).translate(digit_map)
#                 return root_bn + number_part
#             return lbl  # fallback: no change if no digits found



#         def to_label(lbl): return to_bn(lbl) if language == 'bengali' else lbl

#         # Create graph
#         if use_matrix:
#             if 'matrix_file' not in request.FILES:
#                 raise ValueError("Matrix file not uploaded.")
#             matrix_file = request.FILES['matrix_file']
#             df_matrix = pd.read_csv(matrix_file, index_col=0)
#             if df_matrix.shape[0] != df_matrix.shape[1]:
#                 raise ValueError("Adjacency matrix must be square.")
#             mat = df_matrix.values
#             nodes = list(df_matrix.index)
#             G = nx.Graph()
#             G.add_nodes_from(nodes)
#             for i in range(len(nodes)):
#                 for j in range(i+1, len(nodes)):
#                     w = mat[i, j]
#                     if w != 0:
#                         G.add_edge(nodes[i], nodes[j], weight=w * edge_width_factor)
#         else:
#             num_nodes = 30
#             nbr_count = 3
#             nodes = [f"Node{i}" for i in range(1, num_nodes + 1)]
#             G = nx.Graph()
#             G.add_nodes_from(nodes)
#             for node in nodes:
#                 nbrs = random.sample([n for n in nodes if n != node], k=nbr_count)
#                 for nbr in nbrs:
#                     G.add_edge(node, nbr, weight=edge_width_factor)

#         edge_widths = [d['weight'] for _, _, d in G.edges(data=True)]
#         raw_edge_labels = {}
#         for u, v, d in G.edges(data=True):
#             raw = f"{d['weight']:.2f}"
#             if language == 'bengali':
#                 raw = raw.translate(digit_map)
#             raw_edge_labels[(u, v)] = raw

#         # Layout and draw
#         dpi = 300
#         fig, ax = plt.subplots(figsize=(8, 8), dpi=dpi)
#         pos = nx.spring_layout(G, seed=42, k=0.8, iterations=200)
#         nx.draw_networkx_nodes(G, pos, node_size=node_size, node_color=node_color, ax=ax)
#         nx.draw_networkx_edges(G, pos, width=edge_widths, alpha=0.6, edge_color="gray", ax=ax)
#         ax.margins(0.10)
#         ax.axis("off")
#         fig.canvas.draw()

#         renderer = fig.canvas.get_renderer()
#         bbox = fig.get_tightbbox(renderer)
#         crop_x0_px = int(bbox.x0 * dpi)
#         crop_y0_px = int(bbox.y0 * dpi)
#         final_W_px = int(bbox.width * dpi)
#         final_H_px = int(bbox.height * dpi)
#         data_to_px = ax.transData.transform
#         def data_to_image_px(xy):
#             px, py = data_to_px(xy)
#             return (int(px - crop_x0_px), int(final_H_px - (py - crop_y0_px)))

#         # Save base
#         plots_dir = os.path.join(settings.MEDIA_ROOT,f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
#         os.makedirs(plots_dir, exist_ok=True)
#         base_path = os.path.join(plots_dir, 'network_base.png')
#         fig.savefig(base_path, dpi=dpi, bbox_inches="tight", pad_inches=0.05)
#         plt.close(fig)

#         # Overlay labels
#         img = Image.open(base_path).convert("RGBA")
#         draw = ImageDraw.Draw(img)
#         font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
#         try:
#             font_label = ImageFont.truetype(font_path, size=text_size)
#         except:
#             font_label = ImageFont.load_default()

#         for node in G.nodes():
#             label = to_label(node)
#             px, py = data_to_image_px(pos[node])
#             w, h = draw.textbbox((0, 0), label, font=font_label)[2:]
#             draw.text((px - w/2, py - h/2), label, font=font_label, fill=text_color)

#         if show_edge_weights:
#             for (u, v), raw in raw_edge_labels.items():
#                 midx = (pos[u][0] + pos[v][0]) / 2
#                 midy = (pos[u][1] + pos[v][1]) / 2
#                 px, py = data_to_image_px((midx, midy))
#                 draw.text((px, py), raw, font=font_label, fill=weight_color, anchor="mm")

#         labeled_path = os.path.join(plots_dir, 'network_labeled.png')
#         img.save(labeled_path)

#         return JsonResponse({
#             'success': True,
#             'image_path': os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 'temporary_uploads','plots', 'network_labeled.png'),
#             'message': "Network graph generated successfully"
#         })
#     except Exception as e:
#         return JsonResponse({'success': False, 'error': str(e)})

def process_network_graph(request, df, selected_columns, user_id): 
    import os
    import random
    import pandas as pd
    from django.http import JsonResponse
    from django.conf import settings
    import matplotlib.pyplot as plt
    import matplotlib.font_manager as fm
    from PIL import Image, ImageDraw, ImageFont
    import networkx as nx
    import numpy as np
    import re
    from scipy.stats import pearsonr
    from sklearn.metrics.pairwise import cosine_similarity
    import warnings
    warnings.filterwarnings('ignore')

    try:
        # Get parameters from request
        language = request.POST.get("language", "en").strip().lower()
        node_color = request.POST.get("node_color", "#AED6F1")
        node_size = int(request.POST.get("node_size", 800))
        text_size = int(request.POST.get("text_size", 25))
        text_color = request.POST.get("text_color", "black")
        edge_width_factor = float(request.POST.get("edge_width_factor", 0.5))
        show_edge_weights = request.POST.get("show_edge_weights", "n").lower() == "y"
        weight_font_size = int(request.POST.get("weight_font_size", 10)) if show_edge_weights else 0
        weight_color = request.POST.get("weight_color", "red") if show_edge_weights else "red"
        use_matrix = request.POST.get("use_matrix", "n").lower() == "y"
        
        # Additional parameters for better visualization
        correlation_method = request.POST.get("correlation_method", "pearson")  # pearson, spearman, cosine
        correlation_threshold = float(request.POST.get("correlation_threshold", 0.3))  # Minimum correlation to show edge
        max_nodes = int(request.POST.get("max_nodes", 30))  # Limit number of nodes for performance

        print("Selected columns for network graph:", selected_columns)

        digit_map = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")
        root_bn = "নোড"

        def to_bn(lbl):
            # For actual column names, translate digits but keep the original text
            return str(lbl).translate(digit_map) if language == 'bengali' else str(lbl)

        def to_label(lbl): 
            return to_bn(lbl) if language == 'bengali' else str(lbl)

        def calculate_correlation(col1, col2, method='pearson'):
            """Calculate correlation between two columns"""
            # Remove NaN values and ensure numeric data
            try:
                col1_clean = pd.to_numeric(col1, errors='coerce')
                col2_clean = pd.to_numeric(col2, errors='coerce')
                
                mask = ~(pd.isna(col1_clean) | pd.isna(col2_clean))
                if mask.sum() < 3:  # Need at least 3 valid pairs
                    return 0
                
                clean_col1 = col1_clean[mask]
                clean_col2 = col2_clean[mask]
                
                if method == 'pearson':
                    corr, _ = pearsonr(clean_col1, clean_col2)
                elif method == 'spearman':
                    from scipy.stats import spearmanr
                    corr, _ = spearmanr(clean_col1, clean_col2)
                elif method == 'cosine':
                    # Reshape for cosine similarity
                    cos_sim = cosine_similarity([clean_col1], [clean_col2])[0, 0]
                    corr = cos_sim
                else:
                    corr, _ = pearsonr(clean_col1, clean_col2)
                
                return abs(corr) if not np.isnan(corr) else 0
            except:
                return 0

        def clean_column_name(col_name):
            """Clean and shorten column names for better display"""
            name = str(col_name)
            # Replace underscores with spaces
            name = name.replace('_', ' ')
            # Capitalize first letter of each word
            name = ' '.join(word.capitalize() for word in name.split())
            # Truncate if too long
            if len(name) > 20:
                name = name[:17] + "..."
            return name

        # Create graph
        if use_matrix:
            if 'matrix_file' not in request.FILES:
                raise ValueError("Matrix file not uploaded.")
            matrix_file = request.FILES['matrix_file']
            df_matrix = pd.read_csv(matrix_file, index_col=0)
            if df_matrix.shape[0] != df_matrix.shape[1]:
                raise ValueError("Adjacency matrix must be square.")
            mat = df_matrix.values
            nodes = list(df_matrix.index)[:max_nodes]
            G = nx.Graph()
            G.add_nodes_from(nodes)
            for i in range(len(nodes)):
                for j in range(i+1, len(nodes)):
                    w = mat[i, j]
                    if abs(w) >= correlation_threshold:
                        G.add_edge(nodes[i], nodes[j], weight=abs(w) * edge_width_factor)
        else:
            # Use actual data from DataFrame with selected columns
            if df is None or df.empty:
                raise ValueError("No data provided for network analysis.")
            
            # Determine which columns to analyze
            if selected_columns and len(selected_columns) > 0:
                # Use selected columns
                available_columns = [col for col in selected_columns if col in df.columns]
                if not available_columns:
                    raise ValueError("Selected columns not found in the data.")
                df_analysis = df[available_columns]
                print(f"Using selected columns: {available_columns}")
            else:
                # Use all numeric columns if no selection
                numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
                if not numeric_cols:
                    raise ValueError("No numeric columns found in the data for correlation analysis.")
                df_analysis = df[numeric_cols]
                print(f"No columns selected. Using all numeric columns: {numeric_cols}")
            
            # Limit number of columns for performance
            if len(df_analysis.columns) > max_nodes:
                df_analysis = df_analysis.iloc[:, :max_nodes]
                print(f"Limited to first {max_nodes} columns for performance.")
            
            nodes = list(df_analysis.columns)
            
            if len(nodes) < 2:
                raise ValueError("At least 2 columns are needed to create a network graph.")
            
            G = nx.Graph()
            # Add nodes with cleaned names for display
            node_labels = {}
            for node in nodes:
                clean_name = clean_column_name(node)
                G.add_node(node, label=clean_name)
                node_labels[node] = clean_name
            
            print(f"Creating network with {len(nodes)} nodes: {nodes}")
            
            # Calculate correlations between all pairs of columns
            correlations_found = 0
            for i, col1 in enumerate(nodes):
                for j, col2 in enumerate(nodes):
                    if i < j:  # Avoid duplicate edges
                        correlation = calculate_correlation(
                            df_analysis[col1], 
                            df_analysis[col2], 
                            correlation_method
                        )
                        
                        print(f"Correlation between {col1} and {col2}: {correlation:.3f}")
                        
                        # Only add edge if correlation is above threshold
                        if correlation >= correlation_threshold:
                            # Scale edge width (make it more visible)
                            edge_weight = max(correlation * edge_width_factor * 5, 0.5)
                            G.add_edge(col1, col2, weight=edge_weight, correlation=correlation)
                            correlations_found += 1
            
            print(f"Found {correlations_found} correlations above threshold {correlation_threshold}")

        # Check if graph has any edges
        if G.number_of_edges() == 0:
            # If still no correlations found, create edges for the strongest correlations anyway
            print("No correlations found above threshold. Creating network with strongest available correlations.")
            nodes_list = list(G.nodes())
            
            if 'correlation_details' in locals() and correlation_details:
                # Sort by correlation strength and take top connections
                sorted_correlations = sorted(correlation_details, key=lambda x: x['correlation'], reverse=True)
                
                # Add at least the top 3 correlations or number of possible edges, whichever is smaller
                max_edges = min(len(sorted_correlations), max(3, len(nodes_list) - 1))
                
                for i in range(max_edges):
                    detail = sorted_correlations[i]
                    if detail['correlation'] > 0:  # Only positive correlations
                        edge_weight = max(detail['correlation'] * edge_width_factor * 5, 0.5)
                        G.add_edge(detail['col1'], detail['col2'], 
                                 weight=edge_weight, correlation=detail['correlation'])
                        print(f"Added edge: {detail['col1']} - {detail['col2']} (corr: {detail['correlation']:.3f})")
            
            # If still no edges, create a simple connected graph for visualization
            if G.number_of_edges() == 0:
                for i in range(len(nodes_list) - 1):
                    G.add_edge(nodes_list[i], nodes_list[i+1], weight=0.1, correlation=0.1)

        # Get edge properties
        edge_widths = []
        raw_edge_labels = {}
        
        for u, v, d in G.edges(data=True):
            weight = d.get('weight', 0.5)
            edge_widths.append(max(weight, 0.3))  # Minimum edge width for visibility
            
            if show_edge_weights:
                # Show correlation value if available, otherwise weight
                display_value = d.get('correlation', weight)
                raw = f"{display_value:.2f}"
                if language == 'bengali':
                    raw = raw.translate(digit_map)
                raw_edge_labels[(u, v)] = raw

        # Determine figure size based on number of nodes
        num_nodes = G.number_of_nodes()
        if num_nodes <= 5:
            figsize = (10, 8)
            k_value = 3
        elif num_nodes <= 10:
            figsize = (12, 10)
            k_value = 2
        elif num_nodes <= 20:
            figsize = (14, 12)
            k_value = 1.5
        else:
            figsize = (16, 14)
            k_value = 1

        # Layout and draw
        dpi = 300
        fig, ax = plt.subplots(figsize=figsize, dpi=dpi)
        
        # Use better layout algorithm based on graph structure
        if G.number_of_nodes() <= 8:
            pos = nx.spring_layout(G, seed=42, k=k_value, iterations=500)
        else:
            pos = nx.spring_layout(G, seed=42, k=k_value, iterations=300)

        # Draw network with improved styling
        nx.draw_networkx_nodes(G, pos, 
                              node_size=node_size, 
                              node_color=node_color, 
                              ax=ax, 
                              alpha=0.8,
                              edgecolors='black',
                              linewidths=1)
        
        nx.draw_networkx_edges(G, pos, 
                              width=edge_widths, 
                              alpha=0.7, 
                              edge_color="gray", 
                              ax=ax)
        
        ax.margins(0.2)  # More margin for labels
        ax.axis("off")
        fig.canvas.draw()

        # Calculate crop boundaries
        renderer = fig.canvas.get_renderer()
        bbox = fig.get_tightbbox(renderer)
        crop_x0_px = int(bbox.x0 * dpi)
        crop_y0_px = int(bbox.y0 * dpi)
        final_W_px = int(bbox.width * dpi)
        final_H_px = int(bbox.height * dpi)
        data_to_px = ax.transData.transform
        
        def data_to_image_px(xy):
            px, py = data_to_px(xy)
            return (int(px - crop_x0_px), int(final_H_px - (py - crop_y0_px)))

        # Save base image
        plots_dir = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads', 'temporary_uploads', 'plots')
        os.makedirs(plots_dir, exist_ok=True)
        base_path = os.path.join(plots_dir, 'network_base.png')
        fig.savefig(base_path, dpi=dpi, bbox_inches="tight", pad_inches=0.15)
        plt.close(fig)

        # Overlay labels with improved styling
        img = Image.open(base_path).convert("RGBA")
        draw = ImageDraw.Draw(img)
        
        # Font setup
        font_path = os.path.join(settings.BASE_DIR, 'NotoSansBengali-Regular.ttf')
        try:
            font_label = ImageFont.truetype(font_path, size=text_size)
            if show_edge_weights:
                font_weight = ImageFont.truetype(font_path, size=max(weight_font_size, 8))
            else:
                font_weight = font_label
        except:
            font_label = ImageFont.load_default()
            font_weight = ImageFont.load_default()

        # Draw node labels (use clean column names)
        for node in G.nodes():
            # Use cleaned label if available, otherwise use original
            if hasattr(G.nodes[node], 'get') and G.nodes[node].get('label'):
                label = to_label(G.nodes[node]['label'])
            else:
                label = to_label(clean_column_name(node))
            
            px, py = data_to_image_px(pos[node])
            
            # Handle multi-line labels for very long names
            if len(label) > 12:
                # Split into multiple lines
                words = label.split(' ')
                if len(words) > 1:
                    mid = len(words) // 2
                    line1 = ' '.join(words[:mid])
                    line2 = ' '.join(words[mid:])
                    label = f"{line1}\n{line2}"
                elif len(label) > 20:
                    label = f"{label[:12]}\n{label[12:]}"
            
            # Calculate text dimensions
            bbox = draw.multiline_textbbox((0, 0), label, font=font_label)
            w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
            
            # Add semi-transparent background for better readability
            padding = 4
            bg_color = (255, 255, 255, 200)  # White with transparency
            draw.rectangle([px - w/2 - padding, py - h/2 - padding, 
                          px + w/2 + padding, py + h/2 + padding], 
                          fill=bg_color)
            
            # Add subtle border
            draw.rectangle([px - w/2 - padding, py - h/2 - padding, 
                          px + w/2 + padding, py + h/2 + padding], 
                          outline=(0, 0, 0, 100), width=1)
            
            # Draw text
            draw.multiline_text((px - w/2, py - h/2), label, 
                               font=font_label, fill=text_color, 
                               align='center')

        # Draw edge weight labels with improved styling
        if show_edge_weights and raw_edge_labels:
            for (u, v), raw in raw_edge_labels.items():
                midx = (pos[u][0] + pos[v][0]) / 2
                midy = (pos[u][1] + pos[v][1]) / 2
                px, py = data_to_image_px((midx, midy))
                
                # Background for weight labels
                bbox = draw.textbbox((0, 0), raw, font=font_weight)
                w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
                
                # Semi-transparent background
                bg_padding = 2
                draw.rectangle([px - w/2 - bg_padding, py - h/2 - bg_padding, 
                              px + w/2 + bg_padding, py + h/2 + bg_padding], 
                              fill=(255, 255, 255, 180))
                
                draw.text((px - w/2, py - h/2), raw, font=font_weight, 
                         fill=weight_color)

        # Save final image with maximum quality and metadata
        labeled_path = os.path.join(plots_dir, 'network_labeled.png')
        
        # Add a subtle watermark/signature (optional)
        watermark_text = f"Network Analysis • {len(G.nodes())} Variables • {len(G.edges())} Connections"
        try:
            watermark_font = ImageFont.truetype(font_path, size=12)
        except:
            watermark_font = font_weight
            
        if watermark_font:
            # Add watermark at bottom right
            img_width, img_height = img.size
            watermark_bbox = draw.textbbox((0, 0), watermark_text, font=watermark_font)
            watermark_w = watermark_bbox[2] - watermark_bbox[0]
            
            # Semi-transparent background for watermark
            draw.rectangle([img_width - watermark_w - 20, img_height - 30, 
                          img_width - 5, img_height - 5], 
                          fill=(255, 255, 255, 180))
            
            draw.text((img_width - watermark_w - 15, img_height - 25), watermark_text, 
                     font=watermark_font, fill=(108, 117, 125, 200))
        
        img.save(labeled_path, 
                quality=100, 
                optimize=False, 
                format='PNG',
                pnginfo=None)  # High quality PNG

        # Generate summary statistics
        analyzed_columns = list(df_analysis.columns) if 'df_analysis' in locals() else selected_columns
        stats = {
            'total_nodes': G.number_of_nodes(),
            'total_edges': G.number_of_edges(),
            'correlation_method': correlation_method,
            'correlation_threshold': correlation_threshold,
            'columns_analyzed': analyzed_columns,
            'selected_columns': selected_columns if selected_columns else "All numeric columns"
        }

        return JsonResponse({
            'success': True,
            'image_path': os.path.join(settings.MEDIA_URL, f'ID_{user_id}_uploads', 
                                     'temporary_uploads', 'plots', 'network_labeled.png'),
            'message': "Network graph generated successfully",
            'stats': stats
        })

    except Exception as e:
        print(f"Error in network graph generation: {str(e)}")
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


def process_bar_chart_test(request, df, col, user_id, orientation, ordinal_mappings):
    import os, re, math
    import numpy as np
    import pandas as pd
    import seaborn as sns
    import matplotlib.pyplot as plt
    import matplotlib.font_manager as fm
    from django.http import JsonResponse
    from django.conf import settings
    from PIL import Image, ImageDraw, ImageFont
    try:
        from googletrans import Translator
    except Exception:
        class Translator:
            def translate(self, txt, dest="bn"):
                class _R:
                    def __init__(self, t): self.text = t
                    text = t
                return _R(txt)

    try:
        # ---------------- Parameters ----------------
        language = request.POST.get("language", "en")
        fmt = request.POST.get("format", "png").lower()
        fmt = fmt if fmt in ("png", "jpg", "jpeg", "pdf", "tiff") else "png"
        pil_fmt = {"png": "PNG", "jpg": "JPEG", "jpeg": "JPEG", "pdf": "PDF", "tiff": "TIFF"}[fmt]
        orientation = orientation if orientation in ("horizontal", "vertical") else "vertical"

        use_default = request.POST.get("use_default", "true") == "true"
        if use_default:
            dpi, width, height = 300, 800, 600
            label_font_size, caption_font_size, tick_font_size = 15, 50, 16
            cat_font_size, val_font_size = 44, 10
            bar_color, theme = "steelblue", "darkgrid"
        else:
            dpi = int(request.POST.get("dpi", 300))
            width, height = map(int, request.POST.get("image_size", "800x600").split("x"))
            label_font_size = int(request.POST.get("label_font_size", 15))
            caption_font_size = int(request.POST.get("caption_font_size", 50))
            tick_font_size = int(request.POST.get("tick_font_size", 16))
            cat_font_size = int(request.POST.get("cat_font_size", 44))
            val_font_size = int(request.POST.get("val_font_size", 10))
            bar_color = request.POST.get("bar_color", "steelblue")
            theme = request.POST.get("theme", "darkgrid")

        sns.set_theme(style=theme)

        # ---------------- Fonts & Translator ----------------
        font_path = os.path.join(settings.BASE_DIR, "NotoSansBengali-Regular.ttf")
        fm.fontManager.addfont(font_path)
        bengali_font = fm.FontProperties(fname=font_path).get_name()
        if language == "bn":
            plt.rcParams["font.family"] = bengali_font

        translator = Translator()
        digit_map = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")

        def translate(txt):
            try:
                return translator.translate(txt, dest="bn").text if language == "bn" else txt
            except Exception:
                return txt

        def map_digits(txt):
            return txt.translate(digit_map) if language == "bn" else txt

        tick_prop = fm.FontProperties(fname=font_path, size=tick_font_size)
        caption_font = ImageFont.truetype(font_path, size=caption_font_size)
        label_font = ImageFont.truetype(font_path, size=label_font_size)
        cat_font = ImageFont.truetype(font_path, size=cat_font_size)
        val_font = ImageFont.truetype(font_path, size=val_font_size)

        # ---------------- Data Prep ----------------
        if col not in df.columns:
            return JsonResponse({"success": False, "error": f"Column {col} not found"})

        counts = df[col].fillna("NaN").value_counts(dropna=False).sort_index()
        labels_raw = [ordinal_mappings.get(col, {}).get(idx, str(idx)) for idx in counts.index]  
        values = counts.values
        labels_display = [map_digits(translate(str(x))) for x in labels_raw]

        # ---------------- Output Paths ----------------
        safe_col = re.sub(r"[^\w\-_\.]", "_", col)
        plots_dir = os.path.join(settings.MEDIA_ROOT, f"ID_{user_id}_uploads", "temporary_uploads", "plots")
        os.makedirs(plots_dir, exist_ok=True)
        final_path = os.path.join(plots_dir, f"barchart_{safe_col}.{fmt}")

        # ---------------- Plot ----------------
        fig, ax = plt.subplots(figsize=(width / 100, height / 100), dpi=dpi)

        if orientation == "vertical":
            x_idx = np.arange(len(values))
            bars = ax.bar(x_idx, values, color=bar_color, edgecolor="black", linewidth=1.0)
            ax.set_xticks(x_idx)
            ax.set_xticklabels(labels_display, fontproperties=tick_prop, rotation=40, ha="right")
            ax.set_ylabel(map_digits(translate("Count")), fontsize=label_font_size)
            ax.set_xlabel(map_digits(translate(col)), fontsize=label_font_size)

            max_val = max(values) if len(values) > 0 else 1
            ax.set_ylim(0, max_val + max_val * 0.25)  # add headroom for labels

            for bar, val in zip(bars, values):
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + (0.05 * max_val),
                    map_digits(str(val)),
                    ha="center", va="bottom", fontsize=val_font_size
                )

        else:
            y_idx = np.arange(len(values))
            bars = ax.barh(y_idx, values, color=bar_color, edgecolor="black", linewidth=1.0)
            ax.set_yticks(y_idx)
            ax.set_yticklabels(labels_display, fontproperties=tick_prop)
            ax.set_xlabel(map_digits(translate("Count")), fontsize=label_font_size)
            ax.set_ylabel(map_digits(translate(col)), fontsize=label_font_size)

            max_val = max(values) if len(values) > 0 else 1
            ax.set_xlim(0, max_val + max_val * 0.25)  # add headroom for labels

            for bar, val in zip(bars, values):
                ax.text(
                    bar.get_width() + (0.05 * max_val),
                    bar.get_y() + bar.get_height() / 2,
                    map_digits(str(val)),
                    va="center", ha="left", fontsize=val_font_size
                )

        
        title_txt = map_digits(translate(f"Bar Chart of {col}"))
        

        ax.grid(axis="y" if orientation == "vertical" else "x", linestyle="--", alpha=0.35)
        plt.tight_layout()
        fig.savefig(final_path, dpi=dpi, bbox_inches="tight")
        plt.close(fig)

        # ---------------- Title Overlay (PIL) ----------------
        img = Image.open(final_path).convert("RGB")
        bw, bh = img.size

        # Add extra space above for title (20% of image height, adjust as needed)
        extra_height = int(bh * 0.15)
        new_img = Image.new("RGB", (bw, bh + extra_height), "white")

        # Paste original chart lower (shift down)
        new_img.paste(img, (0, extra_height))

        # Draw title in the new top space
        draw = ImageDraw.Draw(new_img)
        title_txt = map_digits(translate(f"Bar Chart of {col}"))
        tw, th = draw.textbbox((0, 0), title_txt, font=caption_font)[2:]
        draw.text(((bw - tw) // 2, (extra_height - th) // 2), title_txt, font=caption_font, fill="black")

        # Save final
        new_img.save(final_path, format=pil_fmt)

        return JsonResponse({
            "success": True,
            "test": "Bar Chart",
            "orientation": orientation,
            "image_paths": [
                f"{settings.MEDIA_URL}ID_{user_id}_uploads/temporary_uploads/plots/{os.path.basename(final_path)}"
            ]
        })

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})


@csrf_exempt
def preview_data(request):
    from django.http import JsonResponse
    from django.conf import settings
    import pandas as pd
    import numpy as np
    import os

    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET is allowed'}, status=405)

    user_id = request.headers.get('userID')
    filename = request.headers.get('filename')
    requested_sheet = request.headers.get('sheet')  
    file_url = request.headers.get('Fileurl')

    if not user_id:
        return JsonResponse({'error': 'User ID not provided'}, status=400)
    if not filename:
        return JsonResponse({'error': 'Filename not provided'}, status=400)
    
    if not file_url:
        return JsonResponse({'error': 'File URL not provided'}, status=400)

    folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
    file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))

    try:
        # Read all sheets once; lets us list names and select the active one
        # If the file is CSV, fall back to a single-sheet behavior (optional)
        if filename.lower().endswith(('.xls', '.xlsx', '.xlsm', '.xlsb', '.ods')):
            book = pd.read_excel(file_path, sheet_name=None)  # dict: {sheet_name: df}
            if not book:
                return JsonResponse({'success': False, 'error': 'No sheets found in workbook.'}, status=400)

            sheet_names = list(book.keys())

            # Choose active sheet: requested name if exists, else first
            active_name = requested_sheet if requested_sheet in book else sheet_names[0]
            df = book[active_name]
        else:
            # Non-Excel fallback (CSV, etc.) – treat as single "Sheet1"
            df = pd.read_csv(file_path)
            sheet_names = ["Sheet1"]
            active_name = "Sheet1"

        # ---- build preview for the chosen sheet ----
        preview_limit = 1000
        df_for_stats = df  # keep original types for stats
        preview_df = df.head(preview_limit).copy()

        # Safe JSON: convert NaN/None to empty string
        preview_df = preview_df.where(pd.notnull(preview_df), "")

        # Stats based on the full selected sheet
        missing_values = df_for_stats.isnull().sum().to_dict()
        num_columns = df_for_stats.select_dtypes(include=[np.number]).columns.tolist()

        return JsonResponse({
            'success': True,
            'sheet_names': sheet_names,       # all available sheet names
            'active_sheet': active_name,      # which one was used
            'columns': preview_df.columns.tolist(),
            'rows': preview_df.to_dict(orient='records'),
            'total_rows': int(len(df_for_stats)),
            'preview_rows': int(min(preview_limit, len(df_for_stats))),
            'missing_values': missing_values,
            'num_columns': num_columns,
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': f'Preview failed: {str(e)}'}, status=500) 
 
@csrf_exempt
def delete_columns_api(request):
    try: 
        ##post_method
        ## extract user ID from request headers
        user_id = request.headers.get('userID')
        filename = request.headers.get('filename')
        sheet_name= request.headers.get('sheet')  
        file_url = request.headers.get('Fileurl')  

        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")

        if not file_url:
            return JsonResponse({'success': False, 'error': 'File URL not provided.'})
        
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        # Load file safely
        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})
        preprocess_folder_name= f"ID_{user_id}_uploads/temporary_uploads/preprocessed/" 
    
        # Create preprocess folder if not exists
        os.makedirs(os.path.join(settings.MEDIA_ROOT, folder_name, "preprocessed"), exist_ok=True)
         
        # Define preprocess file path
        preprocess_file_path = os.path.join(settings.MEDIA_ROOT, preprocess_folder_name, 'preprocess_'+ filename)

        # Load from preprocess if exists, otherwise from original
        source_path = preprocess_file_path if os.path.exists(preprocess_file_path) else file_path


        try:
            # Check file extension and load data accordingly
            file_extension = os.path.splitext(filename)[1].lower()
            
            if file_extension == '.xlsx':
                df = pd.read_excel(source_path, sheet_name=None)  # Load all sheets as a dictionary
                if sheet_name in df:
                    df = df[sheet_name]
                
                else:
                     df = list(df.values())[0]

                    
                
            elif file_extension == '.csv':
                df = pd.read_csv(source_path)
                
            else:
                return JsonResponse({'success': False, 'error': 'Unsupported file format. Please upload .csv or .xlsx files.'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to read file: {str(e)}'})


        body = json.loads(request.body)
        columns = body.get('columns', [])

        if not columns:
            return JsonResponse({'success': False, 'error': 'No columns specified.'})

        df.drop(columns=columns, inplace=True, errors='ignore')

        # Save updated sheet
        df.to_excel(preprocess_file_path, index=False) 
        file_url = os.path.join(settings.MEDIA_URL, preprocess_folder_name, 'preprocess_' + filename).replace("\\", "/")

        return JsonResponse({
            'success': True,
            'message': f'Deleted columns: {columns}',
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records'),
            'file_url': file_url
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
# def remove_duplicates_api(request):
#     try:
#         # Extract headers
#         user_id = request.headers.get('userID')
#         filename = request.headers.get('filename')
#         if not user_id:
#             return JsonResponse({'success': False, 'error': 'User ID not provided.'})

#         print(f"Received User ID: {user_id}")
#         folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
#         file_path = os.path.join(settings.MEDIA_ROOT, folder_name, filename)

#         if not os.path.exists(file_path):
#             return JsonResponse({'success': False, 'error': 'No uploaded file found.'})

#         # Load Excel
#         df = pd.read_excel(file_path)
#         original_len = len(df)

#         # Get column filter
#         body = json.loads(request.body)
#         columns = body.get('columns', [])
        
#         print(columns) 
#         removed_info = []

#         if columns:
#             # Column-specific duplicate removal
#             for col in columns:
#                 if col not in df.columns:
#                     removed_info.append({'column': col, 'error': 'Column not found'})
#                     continue

#                 dup_mask = df[col].duplicated(keep=False)
#                 dup_indices = df.index[dup_mask].tolist()
#                 # print(dup_indices)  

#                 if dup_indices:
#                     dup_values = df.loc[dup_indices, col].tolist()
#                     df.drop(df[df[col].duplicated(keep='first')].index, inplace=True)
#                     removed = original_len - len(df)
#                     removed_info.append({
#                         'column': col,
#                         'duplicates_found': len(dup_indices),
#                         'removed_rows': removed,
#                         'duplicate_values': list(set(dup_values))
#                     })
#                     original_len = len(df)  # Update
#                 else:
#                     removed_info.append({'column': col, 'message': 'No duplicates found'})
#                 summary_msg = "Column-wise duplicate removal complete."
#         print(removed_info) 
        

#         # Save the modified file
#         df.to_excel(file_path, index=False)

#         return JsonResponse({
#             'success': True,
#             'message': summary_msg,
#             'info': removed_info,
#             'columns': df.columns.tolist(),
#             'rows': df.head(100).fillna("").astype(str).to_dict(orient='records'),
#             'remaining_rows': len(df)
#         })

#     except Exception as e:
#         return JsonResponse({'success': False, 'error': str(e)})

def find_duplicates_api(request):
    try:
        # --- Extract headers ---
        user_id = request.headers.get('userID')
        filename = request.headers.get('filename')
        sheet_name= request.headers.get('sheet')
        file_url = request.headers.get('Fileurl') 
        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        if not file_url:
            return JsonResponse({'success': False, 'error': 'File URL not provided.'})
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"


        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))

        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})
        
        preprocess_folder_name= f"ID_{user_id}_uploads/temporary_uploads/preprocessed/" 
    
        # Create preprocess folder if not exists
        os.makedirs(os.path.join(settings.MEDIA_ROOT, folder_name, "preprocessed"), exist_ok=True)
         
        # Define preprocess file path
        preprocess_file_path = os.path.join(settings.MEDIA_ROOT, preprocess_folder_name, 'preprocess_'+ filename)

        # Load from preprocess if exists, otherwise from original
        source_path = preprocess_file_path if os.path.exists(preprocess_file_path) else file_path

        # --- Load Excel ---
        try:
            if filename.lower().endswith(('.xls', '.xlsx', '.xlsm', '.xlsb', '.ods')):
                df= pd.read_excel(source_path, sheet_name= None)
                if sheet_name in df:
                    df = df[sheet_name]
                else:
                    df = list(df.values())[0]
            else:
                df = pd.read_csv(source_path)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to read Excel: {str(e)}'})
        total_rows = len(df)

        # --- Get columns from request body ---
        body = json.loads(request.body)
        columns = body.get('columns', [])
        
        dup_info = []
        summary_msg = "No duplicates detected."
        duplicate_indices = []  

        if columns:
            existing_cols = [c for c in columns if c in df.columns]
            missing_cols = [c for c in columns if c not in df.columns]

            for col in missing_cols:
                dup_info.append({'column': col, 'error': 'Column not found'})

            if len(existing_cols) == 1:
                col = existing_cols[0]
                dup_mask = df[col].duplicated(keep=False)
                dupped_rows = df[dup_mask]

                if not dupped_rows.empty:
                    duplicate_indices = dupped_rows.index.tolist()
                    dup_info.append({
                        'column': col,
                        'duplicates_found': len(dupped_rows),
                        'duplicate_values': dupped_rows[col].tolist()
                    })
                    summary_msg = f"Duplicates detected in column '{col}'."
                else:
                    dup_info.append({'column': col, 'message': 'No duplicates found'})

            elif len(existing_cols) > 1:
                dup_mask = df.duplicated(subset=existing_cols, keep=False)
                dupped_rows = df[dup_mask]

                if not dupped_rows.empty:
                    duplicate_indices = dupped_rows.index.tolist()
                    dup_info.append({
                        'columns': existing_cols,
                        'duplicates_found': len(dupped_rows),
                        'duplicate_combinations': dupped_rows[existing_cols].drop_duplicates().to_dict(orient="records")
                    })
                    summary_msg = f"Duplicates detected based on combination of columns: {existing_cols}"
                else:
                    dup_info.append({'columns': existing_cols, 'message': 'No duplicates found'})
        print(dupped_rows)
        return JsonResponse({
            'success': True,
            'message': summary_msg,
            'info': dup_info,
            'columns': df.columns.tolist(),
            'rows': df.fillna("").astype(str).to_dict(orient='records'),  
            'duplicate_indices': duplicate_indices,  
            'total_rows': total_rows
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    
@csrf_exempt
def remove_duplicates(request):
    user_id = request.headers.get('userID') 
    filename = request.headers.get('filename')
    sheet_name= request.headers.get('sheet')
    file_url = request.headers.get('Fileurl')
    body = json.loads(request.body) 
    columns = body.get('columns', [])
    mode = body.get('mode')  # "all" or "selected"
    selected_indices = body.get('selected', [])

    try:
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))

        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})
        preprocess_folder_name= f"ID_{user_id}_uploads/temporary_uploads/preprocessed/" 
    
        # Create preprocess folder if not exists
        os.makedirs(os.path.join(settings.MEDIA_ROOT, folder_name, "preprocessed"), exist_ok=True)
         
        # Define preprocess file path
        preprocess_file_path = os.path.join(settings.MEDIA_ROOT, preprocess_folder_name, 'preprocess_'+ filename)

        # Load from preprocess if exists, otherwise from original
        source_path = preprocess_file_path if os.path.exists(preprocess_file_path) else file_path

        # --- Load Excel ---
        try:
            if filename.lower().endswith(('.xls', '.xlsx', '.xlsm', '.xlsb', '.ods')):
                df = pd.read_excel(source_path, sheet_name=None)
                if sheet_name in df:
                    df = df[sheet_name]
                else:
                    df = df[list(df.keys())[0]]
            else:
                df = pd.read_csv(source_path)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to read Excel: {str(e)}'})
        before = len(df)

        if mode == "all":
            # If columns not given, use all columns
            subset = columns if len(columns) > 0 else list(df.columns)

            # Validate subset exists
            missing = [c for c in subset if c not in df.columns]
            if missing:
                return JsonResponse({"success": False, "error": f"Columns not found: {missing}"}, status=400)

            # Keep first, drop other duplicates across the subset
            df = df.drop_duplicates(subset=subset, keep="first").reset_index(drop=True)

        elif mode == "selected":
            # Ensure ints and in range; drop by POSITION (not labels)
            try:
                positions = [int(i) for i in selected_indices]
            except (TypeError, ValueError):
                return JsonResponse({"success": False, "error": "'selected' must be an array of integers."}, status=400)

            bad = [p for p in positions if p < 0 or p >= len(df)]
            if bad:
                return JsonResponse({"success": False, "error": f"Selected positions out of range: {sorted(bad)}"}, status=400)
            df = df.drop(df.index[positions]).reset_index(drop=True)

        else:
            return JsonResponse({"success": False, "error": "mode must be 'all' or 'selected'."}, status=400)

        removed = before - len(df)
        df.to_excel(preprocess_file_path, index=False)
        print(removed)
        #print rows after deletion
        print(df) 
        file_url = os.path.join(settings.MEDIA_URL, preprocess_folder_name, 'preprocess_' + filename).replace("\\", "/")

        return JsonResponse({
            "success": True,
            "message": f"{'Kept first & dropped duplicates' if mode=='all' else 'Deleted selected'}; removed {removed} row(s).",
            "removed": removed,
            "rows": df.fillna("").astype(str).to_dict(orient="records"),
            "columns": df.columns.tolist(),
            "file_url": file_url
        })
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})

@csrf_exempt
def handle_missing_api(request):
    try:
        # Extract user ID from request headers
        user_id = request.headers.get('userID')
        filename = request.headers.get('filename')
        sheet_name= request.headers.get('sheet')
        file_url = request.headers.get('Fileurl')
        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")

        if not file_url:
            return JsonResponse({'success': False, 'error': 'File URL not provided.'})
        
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})
        preprocess_folder_name= f"ID_{user_id}_uploads/temporary_uploads/preprocessed/" 
    
        # Create preprocess folder if not exists
        os.makedirs(os.path.join(settings.MEDIA_ROOT, folder_name, "preprocessed"), exist_ok=True)
         
        # Define preprocess file path
        preprocess_file_path = os.path.join(settings.MEDIA_ROOT, preprocess_folder_name, 'preprocess_'+ filename)

        # Load from preprocess if exists, otherwise from original
        source_path = preprocess_file_path if os.path.exists(preprocess_file_path) else file_path
        try:
            if filename.lower().endswith(('.xls', '.xlsx', '.xlsm', '.xlsb', '.ods')):
                df = pd.read_excel(source_path, sheet_name=None)
                if sheet_name in df:
                    df = df[sheet_name]
                else:
                    df = df[list(df.keys())[0]]
            else:
                df = pd.read_csv(source_path)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to read Excel: {str(e)}'})

        body = json.loads(request.body)
        col = body.get('column')
        method = body.get('method', '')
        missing_spec = body.get('missing_spec', '').strip()

        if method not in ['drop', 'fill_mean', 'fill_median', 'fill_mode']:
            return JsonResponse({'success': False, 'error': 'Invalid method.'})
        
        if missing_spec:
            df.replace(missing_spec, np.nan, inplace=True)


        

        empty_columns = df.columns[df.isnull().all()].tolist()
        empty_rows = df.index[df.isnull().all(axis=1)].tolist()
        df.drop(columns=empty_columns, inplace=True)
        df.drop(index=empty_rows, inplace=True)

        targets = df.columns.tolist() if col == 'all' else [col]

        if method == 'drop':
            df.dropna(subset=targets, inplace=True)
        else:
            for c in targets:
                if method == 'fill_mean' and pd.api.types.is_numeric_dtype(df[c]):
                    df[c] = df[c].fillna(df[c].mean())
                elif method == 'fill_median' and pd.api.types.is_numeric_dtype(df[c]):
                    df[c] = df[c].fillna(df[c].median())
                elif method == 'fill_mode':
                    mode_val = df[c].mode(dropna=True) 
                    if not mode_val.empty:
                        df[c] = df[c].fillna(mode_val.iloc[0])

        df.to_excel(preprocess_file_path, index=False)
        file_url = os.path.join(settings.MEDIA_URL, preprocess_folder_name, 'preprocess_' + filename).replace("\\", "/")

        return JsonResponse({
            'success': True,
            'message': f'Missing values handled using method: {method}',
            'deleted_columns': empty_columns,
            'deleted_rows': empty_rows,
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records'),
            'file_url': file_url
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def outliers_summary_api(request): 
    try:
        print("Request method:", request.method)

        user_id = request.headers.get('userID')
        filename = request.headers.get('filename')
        sheet= request.headers.get('sheet')
        file_url = request.headers.get('Fileurl')

        if not user_id or not filename:
            return JsonResponse({'success': False, 'error': 'User ID or filename not provided.'})

        if not file_url:
            return JsonResponse({'success': False, 'error': 'File URL not provided.'})
        folder = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))

        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'File not found.'})

        preprocess_folder_name= f"ID_{user_id}_uploads/temporary_uploads/preprocessed/" 
    
        # Create preprocess folder if not exists
        os.makedirs(os.path.join(settings.MEDIA_ROOT, folder, "preprocessed"), exist_ok=True)
         
        # Define preprocess file path
        preprocess_file_path = os.path.join(settings.MEDIA_ROOT, preprocess_folder_name, 'preprocess_'+ filename)

        # Load from preprocess if exists, otherwise from original
        source_path = preprocess_file_path if os.path.exists(preprocess_file_path) else file_path

        try:
            if filename.lower().endswith(('.xls', '.xlsx', '.xlsm', '.xlsb', '.ods')):
                df = pd.read_excel(source_path, sheet_name=None)
                if sheet in df:
                    df = df[sheet]
                else:
                    df = df[list(df.keys())[0]]
            else:
                df = pd.read_csv(source_path)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to read file: {str(e)}'})
        
        # Identify numeric columns
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()

        if not num_cols:
            return JsonResponse({'success': False, 'error': 'No numeric columns found.'})

        # Compute IQR bounds
        Q1 = df[num_cols].quantile(0.25)
        Q3 = df[num_cols].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR

        # Detect outliers
        outlier_mask = (df[num_cols] < lower) | (df[num_cols] > upper)

        # Summary per column — convert to int
        outliers_summary = {col: int(count) for col, count in outlier_mask.sum().items()}

        # Cell-level details — convert index and value to JSON-safe types
        outlier_cells = []
        for col in num_cols:
            for idx in df.index[outlier_mask[col]]:
                value = df.at[idx, col]
                # Convert value to native Python type
                safe_value = float(value) if isinstance(value, (np.integer, np.floating)) else value
                outlier_cells.append({
                    'row': int(idx),
                    'column': col,
                    'value': safe_value
                })

        # print(num_cols)
        # print(outliers_summary)
        # print(outlier_cells) 

        return JsonResponse({
            'success': True,
            'numeric_columns': num_cols,
            'outliers_summary': outliers_summary,
            'outlier_cells': outlier_cells
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def handle_outliers_api(request):
    try:
        # Extract user ID from request headers
        user_id = request.headers.get('userID')
        filename = request.headers.get('filename')
        sheet= request.headers.get('sheet')
        file_url = request.headers.get('Fileurl')

        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")

        if not file_url:
            return JsonResponse({'success': False, 'error': 'File URL not provided.'})
        
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})


        preprocess_folder_name= f"ID_{user_id}_uploads/temporary_uploads/preprocessed/" 
    
        # Create preprocess folder if not exists
        os.makedirs(os.path.join(settings.MEDIA_ROOT, folder_name, "preprocessed"), exist_ok=True)
         
        # Define preprocess file path
        preprocess_file_path = os.path.join(settings.MEDIA_ROOT, preprocess_folder_name, 'preprocess_'+ filename)

        # Load from preprocess if exists, otherwise from original
        source_path = preprocess_file_path if os.path.exists(preprocess_file_path) else file_path

        try:
            if filename.lower().endswith(('.xls', '.xlsx', '.xlsm', '.xlsb', '.ods')):
                df = pd.read_excel(source_path, sheet_name=None)
                if sheet in df:
                    df = df[sheet]
                else:
                    df = df[list(df.keys())[0]]
            else:
                df = pd.read_csv(source_path)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to read Excel: {str(e)}'})
        
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

        df.to_excel(preprocess_file_path, index=False)
        file_url = os.path.join(settings.MEDIA_URL, preprocess_folder_name, 'preprocess_' + filename).replace("\\", "/")

        return JsonResponse({
            'success': True,
            'message': message,
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records'),
            'file_url': file_url
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def rank_categorical_column_api(request):
    try:
        # Extract user ID from request headers
        user_id = request.headers.get('userID')
        filename = request.headers.get('filename')
        sheet= request.headers.get('sheet')
        file_url = request.headers.get('Fileurl')

        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")

        if not file_url:
            return JsonResponse({'success': False, 'error': 'File URL not provided.'})
        
        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded file found.'})

        preprocess_folder_name= f"ID_{user_id}_uploads/temporary_uploads/preprocessed/" 
    
        # Create preprocess folder if not exists
        os.makedirs(os.path.join(settings.MEDIA_ROOT, folder_name, "preprocessed"), exist_ok=True)
         
        # Define preprocess file path
        preprocess_file_path = os.path.join(settings.MEDIA_ROOT, preprocess_folder_name, 'preprocess_'+ filename)

        # Load from preprocess if exists, otherwise from original
        source_path = preprocess_file_path if os.path.exists(preprocess_file_path) else file_path

        try:
            if filename.lower().endswith(('.xls', '.xlsx', '.xlsm', '.xlsb', '.ods')):
                df = pd.read_excel(source_path, sheet_name=None)
                if sheet in df:
                    df = df[sheet]
                else:
                    df = df[list(df.keys())[0]]
            else:
                df = pd.read_csv(source_path)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to read Excel: {str(e)}'})
        
        body = json.loads(request.body)

        col = body.get('column', '')
        mapping = body.get('mapping', {})  # {'Yes': 1, 'No': 2, ...}

        if col not in df.columns or not mapping:
            return JsonResponse({'success': False, 'error': 'Invalid column or mapping.'})

        new_col = col + '_ranked'
        df[new_col] = df[col].map(mapping)

        df.to_excel(preprocess_file_path, index=False)

        file_url = os.path.join(settings.MEDIA_URL, preprocess_folder_name, 'preprocess_' + filename).replace("\\", "/")

        return JsonResponse({
            'success': True,
            'message': f"Column '{col}' ranked into '{new_col}'",
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records'),
            'file_url': file_url
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

# @csrf_exempt
# def split_column_api(request):
#     from django.http import JsonResponse
#     from django.conf import settings
#     import pandas as pd
#     import os, json
#     from collections import Counter

#     try:
#         # --- Extract metadata ---
#         user_id = request.headers.get('userID')
#         filename = request.headers.get('filename') 
#         if not user_id or not filename:
#             return JsonResponse({'success': False, 'error': 'User ID or filename not provided.'})

#         folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
#         file_path = os.path.join(settings.MEDIA_ROOT, folder_name, filename)

#         if not os.path.exists(file_path):
#             return JsonResponse({'success': False, 'error': 'Uploaded file not found.'})

#         try:
#             df = pd.read_excel(file_path)
#         except Exception as e:
#             return JsonResponse({'success': False, 'error': f'Failed to read Excel file: {str(e)}'})

#         # --- Parse JSON body ---
#         body = json.loads(request.body)
#         column = body.get('column', '').strip()
#         method = body.get('method', '').strip().lower()
#         phrases = body.get('phrases', [])
#         delete_original = body.get('delete_original', False)

#         if column not in df.columns:
#             return JsonResponse({'success': False, 'error': f"Column '{column}' not found in dataset."})

#         new_cols = []
#         df_split = None
#         original_idx = df.columns.get_loc(column)

#         # --- Split Logic ---
#         if method == 'comma':
#             df_split = df[column].astype(str).str.split(',', expand=True)
#             df_split.columns = [f"{column}_part_{i+1}" for i in range(df_split.shape[1])]
#             new_cols = df_split.columns.tolist()

#         elif method == 'semicolon':
#             df_split = df[column].astype(str).str.split(';', expand=True)
#             df_split.columns = [f"{column}_part_{i+1}" for i in range(df_split.shape[1])]
#             new_cols = df_split.columns.tolist()

#         elif method == 'tags':
#             df_split = df[column].astype(str).str.extractall(r'<(.*?)>').unstack().droplevel(0, axis=1)
#             df_split.columns = [f"{column}_tag_{i+1}" for i in range(df_split.shape[1])]
#             new_cols = df_split.columns.tolist()

#         elif method == 'custom' and phrases:
#             def count_phrases(text, known_phrases):
#                 tokens = str(text).split(", ")
#                 result = []
#                 i = 0
#                 while i < len(tokens):
#                     if i + 1 < len(tokens):
#                         combined = tokens[i] + ", " + tokens[i + 1]
#                         if combined in known_phrases:
#                             result.append(combined)
#                             i += 2
#                             continue
#                     result.append(tokens[i])
#                     i += 1
#                 return Counter(result)

#             df_split = pd.DataFrame()
#             for phrase in phrases:
#                 df_split[phrase] = df[column].apply(lambda x: count_phrases(x, phrases).get(phrase, 0))
#             new_cols = df_split.columns.tolist()

#         else:
#             return JsonResponse({'success': False, 'error': 'Invalid method or missing required input (phrases).'})

#         # --- Remove new columns if already exist ---
#         for col in new_cols:
#             if col in df.columns:
#                 df.drop(columns=[col], inplace=True)

#         # --- Insert new columns after original ---
#         for i, col in enumerate(new_cols):
#             df.insert(original_idx + 1 + i, col, df_split[col])

#         # --- Delete original column if requested ---
#         if delete_original and column in df.columns:
#             df.drop(columns=[column], inplace=True)

#         # --- Save and Respond ---
#         df.to_excel(file_path, index=False)
#         df = df.fillna("").astype(str)

#         return JsonResponse({
#             'success': True,
#             'message': f"Column '{column}' split successfully using '{method}' method.",
#             'columns': df.columns.tolist(),
#             'rows': df.head(100).fillna("").astype(str).to_dict(orient='records'), 
#             'new_columns': new_cols,
#             'original_column_deleted': delete_original
#         })

#     except Exception as e:
#         return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def split_column_api(request):
    from django.http import JsonResponse
    from django.conf import settings
    import pandas as pd
    import os, json
    import re
    from collections import Counter

    try:
        # --- Extract metadata ---
        user_id = request.headers.get('userID')
        filename = request.headers.get('filename') 
        sheet_name = request.headers.get('sheet')
        file_url = request.headers.get('Fileurl')

        if not user_id or not filename:
            return JsonResponse({'success': False, 'error': 'User ID or filename not provided.'})
        
        if not file_url:
            return JsonResponse({'success': False, 'error': 'File URL not provided.'})

        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))

        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'Uploaded file not found.'})

        preprocess_folder_name= f"ID_{user_id}_uploads/temporary_uploads/preprocessed/" 
    
        # Create preprocess folder if not exists
        os.makedirs(os.path.join(settings.MEDIA_ROOT, folder_name, "preprocessed"), exist_ok=True)
         
        # Define preprocess file path
        preprocess_file_path = os.path.join(settings.MEDIA_ROOT, preprocess_folder_name, 'preprocess_'+ filename)

        # Load from preprocess if exists, otherwise from original
        source_path = preprocess_file_path if os.path.exists(preprocess_file_path) else file_path


        try:
            if filename.lower().endswith(('.xls', '.xlsx', '.xlsm', '.xlsb', '.ods')):
                df = pd.read_excel(source_path, sheet_name=None)
                if sheet_name in df:
                    df = df[sheet_name]
                else:
                    df = list(df.values())[0]
            else:
                df = pd.read_csv(source_path)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to read file: {str(e)}'})

        # --- Parse JSON body ---
        body = json.loads(request.body)
        column = body.get('column', '').strip()
        method = body.get('method', '').strip().lower()
        phrases = body.get('phrases', [])
        delete_original = body.get('delete_original', False),


        if column not in df.columns:
            return JsonResponse({'success': False, 'error': f"Column '{column}' not found in dataset."})

        new_cols = []
        df_split = None
        original_idx = df.columns.get_loc(column)

        # --- Helper: count user-defined phrases ---
        def count_phrases(input_str, known_phrases):
            tokens = str(input_str).split(", ")
            result = []
            i = 0
            while i < len(tokens):
                if i + 1 < len(tokens):
                    combined = tokens[i] + ", " + tokens[i + 1]
                    if combined in known_phrases:
                        result.append(combined)
                        i += 2
                        continue
                result.append(tokens[i])
                i += 1
            return Counter(result)

        # --- Helper: extract main label before parentheses ---
        def extract_main_label(text):
            if pd.isna(text):
                return []
            # Split by comma outside parentheses
            items = re.split(r',\s*(?![^()]*\))', text)
            main_labels = []
            for item in items:
                main = re.split(r'\(', item)[0].strip().lower()  # main part before '('
                if main:
                    main_labels.append(main)
            return main_labels

        # --- Split Logic ---
        if method == 'comma':
            # Step 1: split and normalize main labels
            split_data = df[column].apply(extract_main_label)
            all_labels = sorted({label for sublist in split_data for label in sublist})

            # Step 2: one-hot encode
            df_split = pd.DataFrame()
            for label in all_labels:
                df_split[f"{column}[{label}]"] = split_data.apply(lambda x: 1 if label in x else 0)

            new_cols = df_split.columns.tolist()

        elif method == 'semicolon':
            df_split = df[column].astype(str).str.split(';', expand=True)
            df_split.columns = [f"{column}[{col.strip()}]" for col in df_split.columns]
            new_cols = df_split.columns.tolist()

        elif method == 'tags':
            df_split = df[column].astype(str).str.extractall(r'<(.*?)>').unstack().droplevel(0, axis=1)
            df_split.columns = [f"{column}[{col.strip()}]" for col in df_split.columns]
            new_cols = df_split.columns.tolist()

        elif method == 'custom' and phrases:
            df_split = pd.DataFrame()
            for phrase in phrases:
                df_split[f"{column}[{phrase}]"] = df[column].apply(lambda x: count_phrases(x, phrases).get(phrase, 0))
            new_cols = df_split.columns.tolist()

        else:
            return JsonResponse({'success': False, 'error': 'Invalid method or missing required input (phrases).'})

        # --- Remove existing new columns ---
        for col in new_cols:
            if col in df.columns:
                df.drop(columns=[col], inplace=True)

        # --- Insert new columns after original ---
        for i, col in enumerate(new_cols):
            df.insert(original_idx + 1 + i, col, df_split[col])

        # --- Delete original column if requested ---
        if delete_original and column in df.columns:
            df.drop(columns=[column], inplace=True)

        # --- Save and respond ---
        df.to_excel(preprocess_file_path, index=False)
        df = df.fillna("").astype(str)

        file_url = os.path.join(settings.MEDIA_URL, preprocess_folder_name, 'preprocess_' + filename).replace("\\", "/")

        return JsonResponse({
            'success': True,
            'message': f"Column '{column}' split successfully using '{method}' method.",
            'columns': df.columns.tolist(),
            'rows': df.head(100).to_dict(orient='records'), 
            'new_columns': new_cols,
            'original_column_deleted': delete_original,
            'file_url': file_url
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def group_data_api(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method.'})

    try:
      

        user_id = request.headers.get('userID')
        filename = request.headers.get('filename')
        sheet= request.headers.get('sheet')
        file_url = request.headers.get('Fileurl')
        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        if not file_url:
            return JsonResponse({'success': False, 'error': 'File URL not provided.'})
        

        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))

        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'Uploaded Excel file not found.'})

        body = json.loads(request.body)
        grouping_pairs = body.get('groupingPairs', [])

        if not grouping_pairs:
            return JsonResponse({'success': False, 'error': 'No grouping pairs provided.'})

        preprocess_folder_name= f"ID_{user_id}_uploads/temporary_uploads/preprocessed/" 
    
        # Create preprocess folder if not exists
        os.makedirs(os.path.join(settings.MEDIA_ROOT, folder_name, "preprocessed"), exist_ok=True)
         
        # Define preprocess file path
        preprocess_file_path = os.path.join(settings.MEDIA_ROOT, preprocess_folder_name, 'preprocess_'+ filename)

        # Load from preprocess if exists, otherwise from original
        source_path = preprocess_file_path if os.path.exists(preprocess_file_path) else file_path

        try:
            if filename.lower().endswith(('.xls', '.xlsx', '.xlsm', '.xlsb', '.ods')):
                df= pd.read_excel(source_path,engine='openpyxl', sheet_name=None)
                if sheet in df:
                    df = df[sheet]
                else:
                    df = list(df.values())[0]
            else:
                df = pd.read_csv(source_path)
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

            groups = df[group_col].dropna().unique().tolist()

            grouped_df = pd.concat([
                df.loc[df[group_col] == g, [group_col, value_col]].assign(Group=g)
                for g in groups
            ])
            grouped_dfs.append(grouped_df)

        base_filename = os.path.splitext(filename)[0]
        grouped_filename = f"{base_filename}_grouped_splits.xlsx"
        output_path = os.path.join(settings.MEDIA_ROOT, preprocess_folder_name, grouped_filename)

        try:
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                for i, gdf in enumerate(grouped_dfs):
                    sheet_name = f"group_{i+1}"
                    gdf.to_excel(writer, sheet_name=sheet_name, index=False)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to save grouped file: {str(e)}'})
        preview_data = grouped_dfs[0].to_dict(orient='records') if grouped_dfs else []
        file_url = os.path.join(settings.MEDIA_URL, preprocess_folder_name, 'preprocess_' + filename).replace("\\", "/")
        

        return JsonResponse({
            'success': True,
            'message': 'Grouped splits saved to Excel file.',
            'download_url': f"/media/{folder_name}{grouped_filename}",
            'preview_data': preview_data,
            'file_url': file_url
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def generate_unique_id_column_api(request):
    try:
        # Extract user ID from request headers
        user_id = request.headers.get('userID')
        filename = request.headers.get('filename')
        sheet= request.headers.get('sheet')
        file_url = request.headers.get('Fileurl')

        if not user_id:
            return JsonResponse({'success': False, 'error': 'User ID not provided.'})
        print(f"Received User ID: {user_id}")
        if not file_url:
            return JsonResponse({'success': False, 'error': 'File URL not provided.'})
        

        folder_name = f"ID_{user_id}_uploads/temporary_uploads/"
        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace("/media/", ""))
        if not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': 'No uploaded Excel file found.'})

        preprocess_folder_name= f"ID_{user_id}_uploads/temporary_uploads/preprocessed/" 
    
        # Create preprocess folder if not exists
        os.makedirs(os.path.join(settings.MEDIA_ROOT, folder_name, "preprocessed"), exist_ok=True)
         
        # Define preprocess file path
        preprocess_file_path = os.path.join(settings.MEDIA_ROOT, preprocess_folder_name, 'preprocess_'+ filename)

        # Load from preprocess if exists, otherwise from original
        source_path = preprocess_file_path if os.path.exists(preprocess_file_path) else file_path


        try:
            if filename.lower().endswith(('.xls', '.xlsx', '.xlsm', '.xlsb', '.ods')):
                df = pd.read_excel(source_path, sheet_name=None)
                if sheet in df:
                    df = df[sheet]
                else:
                    df = list(df.values())[0]
            else:
                df = pd.read_csv(source_path)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to read Excel: {str(e)}'})

        col_name = 'row_id'
        df[col_name] = np.arange(1, len(df) + 1)

        df.to_excel(preprocess_file_path, index=False)
        file_url = os.path.join(settings.MEDIA_URL, preprocess_folder_name, 'preprocess_' + filename).replace("\\", "/")

        return JsonResponse({
            'success': True,
            'message': f"Column '{col_name}' added with unique IDs.",
            'columns': df.columns.tolist(),
            'rows': df.head(100).fillna("").astype(str).to_dict(orient='records'),
            'file_url': file_url,
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    
@csrf_exempt
def save_preprocessed_file_api(request):
    print("in") 
    if request.method == 'POST':
        try:
            user_id = request.headers.get('userID')
  
            if not user_id:
                return JsonResponse({'success': False, 'error': 'User ID not provided.'})
            print(f"Received User ID: {user_id}")

            uploaded_file = request.FILES.get('file')
            # file_type = request.POST.get('file_type')  # 'survey' or 'preprocessed'

            if not uploaded_file:
                return JsonResponse({'success': False, 'error': 'No file uploaded.'})
            # if file_type not in ['survey', 'preprocessed']:
            #     return JsonResponse({'success': False, 'error': 'Invalid or missing file_type.'})

            # Define folder path
            folder_name = 'survey/' 
            folder_path = os.path.join(settings.MEDIA_ROOT, f'ID_{user_id}_uploads/temporary_uploads/', folder_name)
            os.makedirs(folder_path, exist_ok=True)

            # Handle CSV for survey type
            original_ext = os.path.splitext(uploaded_file.name)[1].lower()
            if original_ext == '.csv':
                df = pd.read_csv(uploaded_file)
                # Sanitize filename and change extension to .xlsx
                base_name = os.path.splitext(uploaded_file.name)[0]
                safe_base_name = "".join(c for c in base_name if c.isalnum() or c in (' ', '_', '-')).rstrip()
                file_name = f"{safe_base_name}.xlsx" 

                file_path = os.path.join(folder_path, file_name)
                df.to_excel(file_path, index=False)
            else:
                # Save original file
                file_name = uploaded_file.name
                file_path = os.path.join(folder_path, file_name)
                with open(file_path, 'wb+') as destination:
                    for chunk in uploaded_file.chunks():
                        destination.write(chunk)
            print(f"File saved to: {file_path}")

            file_url = os.path.join('/media', f'ID_{user_id}_uploads/temporary_uploads/', folder_name, file_name).replace('\\', '/')

            return JsonResponse({
                'success': True,
                'message': f"File saved as {file_name}",
                'file_url': file_url,
            })

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
import os
import shutil
import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# @csrf_exempt
# def save_results_api(request):
#     from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def save_results_api(request): 
    if request.method == 'POST':
        print("✅ Save Results API hit")

        try:
            data = json.loads(request.body)
            image_paths = data.get('image_paths', [])
            test_name = data.get('test_name', 'general_test')
            user_id = data.get('user_id', 'anonymous')  # optional
            Excel_filename = os.path.splitext(os.path.basename(data.get('filename', '')))[0]


            # print(image_paths)
            # print(test_name)
            # print(user_id)
            # print(Excel_filename)  


            save_dir=os.path.join(settings.MEDIA_ROOT,f'ID_{user_id}_uploads/saved_files/', Excel_filename, test_name)
            os.makedirs(save_dir, exist_ok=True)
           

            saved_files = []
            for path in image_paths:
                print(path) 
                full_path = os.path.join(settings.BASE_DIR, path.lstrip('/'))  # Ensure path is absolute
                if os.path.exists(full_path):
                    filename = os.path.basename(full_path)
                    dest_path = os.path.join(save_dir, filename)
                    shutil.copy(full_path, dest_path)
                    saved_files.append(dest_path)
                else:
                    return JsonResponse({
                        'status': 'error',
                        'message': f'File not found: {path}'
                    }, status=404)

            return JsonResponse({
                'status': 'success',
                'saved_to': save_dir,
                'saved_files': saved_files
            })

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
