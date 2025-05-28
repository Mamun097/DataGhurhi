from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    path('', views.analyze_data_api, name='analyze'),
    path('api/get-columns/', csrf_exempt(views.get_columns), name='api_get_columns'),
    path('api/analyze/', csrf_exempt(views.analyze_data_api), name='api_analyze'),
]