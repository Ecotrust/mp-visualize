# from django.conf.urls import patterns, url
from django.urls import re_path, include
from .views import (show_embedded_map,
                   show_mafmc_map, show_mobile_map, show_planner)
from django.views.generic.base import TemplateView
urlpatterns = [
    #'',
    re_path(r'^experiment$', TemplateView.as_view(template_name='visualize/experiment.html')),
    re_path(r'^map', show_embedded_map, name="embedded_map"),
    re_path(r'^mafmc', show_mafmc_map, name="mafmc_map"),
    re_path(r'^mobile', show_mobile_map, name="mobile_map"),
    re_path(r'^$', show_planner, name="planner"),
]
