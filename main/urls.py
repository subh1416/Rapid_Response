from django.contrib import admin
from django.urls import path,include
from . import views


urlpatterns = [
    path('', views.home,name="home"),
    path('map', views.map,name="map"),
    path('datas',views.datas,name="datas")

]