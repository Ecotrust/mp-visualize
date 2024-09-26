from features.forms import FeatureForm
from django import forms
from .models import *

class BookmarkForm(FeatureForm):
    
    class Meta(FeatureForm.Meta):
        model = Bookmark

class UserLayerForm(FeatureForm):

    class Meta(FeatureForm.Meta):
        model = UserLayer
        widgets = {
            'url': forms.Textarea(attrs={'rows': 2, 'cols': 15}),
            # RDH 2022-04-01
            # For some reason, the choices below aren't blocking unwanted 'radio', 'checkbox', and 'placeholder' options
            # I'm leaving this code in place, but using jQuery in form.html to control it in the end.
            'layer_type': forms.Select(
                choices=(
                    ('ArcRest', 'ArcRest'),
                    ('ArcFeatureServer', 'ArcFeatureServer'),
                    ('ArcImageServer', 'ArcImageServer'),
                    ('XYZ', 'XYZ'),
                    ('WMS', 'WMS'),
                    ('Vector', 'Vector'),
                    ('VectorTile', 'VectorTile')
                )
            )
        }