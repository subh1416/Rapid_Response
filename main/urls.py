from django.contrib import admin
from django.urls import path,include
from . import views


urlpatterns = [
    path('',views.ghar,name="ghar"),
    path('home', views.home,name="home"),
    path('map', views.map,name="map"),
    path('map_police', views.map_police,name="map_police"),
    path('map_ngo', views.map_ngo,name="map_ngo"),
    path('datas',views.datas,name="datas"),
    path('datasp',views.datasp,name="datasp"),
    path('datasn',views.datasn,name="datasn"),
    path('safety',views.safety,name="safety")

]