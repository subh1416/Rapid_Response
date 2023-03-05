from django.shortcuts import render
import json
from django.http import JsonResponse
# Create your views here.

def home(request):
    return render(request,'main/home.html')

def map(request):
    return render(request,'main/maps4.html')

def datas(request):
    data = open('main\static\js\geohospitals.geojson').read() #opens the json file and saves the raw contents
    jsonData = json.loads(data) #converts to a json structure
    return JsonResponse(jsonData, safe=False)