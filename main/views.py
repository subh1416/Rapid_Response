from django.shortcuts import render,redirect
import json
import os
from . forms import UserRegisterForm
from django.contrib import messages
from django.http import JsonResponse
# Create your views here.

def home(request):
    return render(request,'main/base.html')

def ghar(request):
    return render(request,'main/home.html')

def map(request):
    return render(request,'main/maps4.html')

def map_police(request):
    return render(request,'main/maps5.html')

def map_ngo(request):
    return render(request,'main/maps6.html')

def about(request):
    return render(request,'main/about.html')

def safety(request):
    return render(request,'main/safety.html')

def datas(request):
    data = open('main\static\js\geohospitals.geojson').read() #opens the json file and saves the raw contents
    jsonData = json.loads(data) #converts to a json structure
    return JsonResponse(jsonData, safe=False)

def datasp(request):
    data1 = open('main\static\geo\police.geojson').read() #opens the json file and saves the raw contents
    jsonData1 = json.loads(data1) #converts to a json structure
    # print(data1)
    return JsonResponse(jsonData1, safe=False)

# def datasn(request):
#     data2 = open('main\static\abc\ngoss.geojson').read() #opens the json file and saves the raw contents
#     jsonData2 = json.loads(data2) #converts to a json structure
#     print(data2)
#     return JsonResponse(jsonData2, safe=False)


def datasn(request):
    file_path = os.path.join('main', 'static', 'abc', 'ngoss.geojson')
    with open(file_path, 'r') as file:
        data2 = file.read()  # opens the JSON file and saves the raw contents
    jsonData2 = json.loads(data2)  # converts to a JSON structure
    
    return JsonResponse(jsonData2, safe=False)

def register(request):
    if request.method == "POST":    
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Hi {username}, your account has been created succesfully!')
            return redirect('ghar')
        
    else:
        form = UserRegisterForm()
        
    return render(request,'main/register.html',{'form': form})

