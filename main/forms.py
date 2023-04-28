from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django import forms
from phonenumber_field.formfields import PhoneNumberField


GENDER_CHOICES = [
    ('M', 'Male'),
    ('F', 'Female'),
    ('O', 'Other'),
]

BLOOD_GROUP_CHOICES = [
    ('A+', 'A+'),
    ('A-', 'A-'),
    ('B+', 'B+'),
    ('B-', 'B-'),
    ('AB+', 'AB+'),
    ('AB-', 'AB-'),
    ('O+', 'O+'),
    ('O-', 'O-'),
]

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField()
    phone = PhoneNumberField()
    gender = forms.ChoiceField(choices=GENDER_CHOICES)
    address = forms.CharField(widget=forms.Textarea)
    date_of_birth = forms.DateField()
    blood_group = forms.ChoiceField(choices=BLOOD_GROUP_CHOICES)
    class Meta:
        model = User
        fields = ['username','date_of_birth','blood_group','phone','email','gender','address','password1','password2']