from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    path('', views.preview_data, name='preview_data'), 
    path('api/upload-file/', csrf_exempt(views.upload_file), name='api_upload_file'),
    path('api/get-columns/', csrf_exempt(views.get_columns), name='api_get_columns'),
    path('api/get-groups/', csrf_exempt(views.get_groups), name='api_get_groups'),
    path('api/get-column-types/', csrf_exempt(views.get_column_types), name='api_get_column_types'),
    path('api/analyze/', csrf_exempt(views.analyze_data_api), name='api_analyze'),    
    path('api/preview-data/', views.preview_data, name='preview_data'), 
    path('api/delete-columns/', views.delete_columns_api, name='delete_columns_api'),
    path('api/find-duplicates/', views.find_duplicates_api, name='find_duplicates_api'),
    path('api/remove-duplicates/', views.remove_duplicates, name='remove_duplicates_api'),
    path('api/handle-missing/', views.handle_missing_api, name='handle_missing_api'),
    path('api/outliers-summary/', views.outliers_summary_api, name='outliers_summary_api'), 
    path('api/handle-outliers/', views.handle_outliers_api, name='handle_outliers_api'),
    path('api/rank-column/', views.rank_categorical_column_api, name='rank_categorical_column_api'),
    path('api/split-column/', views.split_column_api, name='split_column_api'),
    path('api/group-data/', views.group_data_api, name='group_data_api'),
    path('api/upload-preprocessed/', views.save_preprocessed_file_api, name='save_preprocessed_file_api'),
    path('api/generate-unique-id/', views.generate_unique_id_column_api, name='generate_unique_id_column_api'),
    path('api/save-results/', views.save_results_api, name='save_results_api'),
    path("api/save-edited-excel/", views.save_edited_excel, name="save_edited_excel"),
    path("files/", views.list_user_files, name="list_user_files"),
    path("files/<str:filename>/", views.serve_user_file, name="serve_user_file"),
    path('api/delete-temp-folder/', views.delete_temp_folder, name='delete_temp_folder'),


]