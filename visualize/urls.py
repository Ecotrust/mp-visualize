from django.conf.urls import url
from visualize.views import (show_embedded_map,
                   show_mafmc_map, show_mobile_map, show_planner)
from django.views.generic.base import TemplateView
urlpatterns = [
    url(r'^experiment$', TemplateView.as_view(template_name='visualize/experiment.html')),
    url(r'^map', show_embedded_map, name="embedded_map"),
    url(r'^mafmc', show_mafmc_map, name="mafmc_map"),
    url(r'^mobile', show_mobile_map, name="mobile_map"),
    url(r'^$', show_planner, name="planner"),
]
