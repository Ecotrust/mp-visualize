# Create your views here.
from django.contrib.auth.models import Group
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from django.template import RequestContext
from querystring_parser import parser
import json
from features.registry import user_sharing_groups
from functools import cmp_to_key
import locale

from django.conf import settings
from visualize.models import *
from data_manager.models import *
from django.views.decorators.csrf import csrf_exempt
from django.http.response import JsonResponse

def show_planner(request, template=settings.VISUALIZE_PLANNER_TEMPLATE, render_response=True):
    try:
        socket_url = settings.SOCKET_URL
    except AttributeError:
        socket_url = ''

    disclaimer_content = {
        'title': False,
        'body': False,
        'decline_url': False
    }

    if len(Content.objects.filter(name='disclaimer_body',live=True)) > 0:
        #There should be only one content named 'disclaimer_body' - assume the first
        disclaimer_content['body'] = Content.objects.filter(name='disclaimer_body',live=True)[0]

        # Shamelessly yanked from Eloff and Ooker at http://stackoverflow.com/a/925630
        from HTMLParser import HTMLParser

        class MLStripper(HTMLParser):
            def __init__(self):
                self.reset()
                self.fed = []
            def handle_data(self, d):
                self.fed.append(d)
            def get_data(self):
                return ''.join(self.fed)

        def strip_tags(html):
            s = MLStripper()
            s.feed(html)
            return s.get_data()

        if len(Content.objects.filter(name='disclaimer_title',live=True)) > 0:
            disclaimer_content['title'] = strip_tags(Content.objects.filter(name='disclaimer_title',live=True)[0].content)
        if len(Content.objects.filter(name='disclaimer_decline_url',live=True)) > 0:
            disclaimer_content['decline_url'] = strip_tags(Content.objects.filter(name='disclaimer_decline_url',live=True)[0].content)

    if hasattr(settings, 'INITIAL_X'):
        initial_x = settings.INITIAL_X
    else:
        initial_x = -73.24
    if hasattr(settings, 'INITIAL_Y'):
        initial_y = settings.INITIAL_Y
    else:
        initial_y = 38.93
    if hasattr(settings, 'INITIAL_Z'):
        initial_z = settings.INITIAL_Z
    else:
        initial_z = 7
    if hasattr(settings, 'INITIAL_BASEMAP'):
        initial_basemap = settings.INITIAL_BASEMAP
    else:
        initial_basemap = "Ocean"

    context = {
        'MEDIA_URL': settings.MEDIA_URL,
        'SOCKET_URL': socket_url,
        'login': 'true',
        'disclaimer': disclaimer_content,
        'initial_x': initial_x,
        'initial_y': initial_y,
        'initial_z': initial_z,
        'SEARCH_DISABLED': settings.SEARCH_DISABLED
    }

    if hasattr(settings, 'MAP_TECH'):
        context['MAP_TECH'] = settings.MAP_TECH
    else:
        context['MAP_TECH'] = 'ol2'


    if request.user.is_authenticated:
        context['session'] = request.session._session_key

    if render_response:
        return render(request, template, context)
    else:
        return {
            'request': request,
            'template': template,
            'context': context
        }

def show_embedded_map(request, template='visualize/map.html'):
    context = {'MEDIA_URL': settings.MEDIA_URL}
    return render(request, template, context)

def show_mafmc_map(request, template='mafmc.html'):
    context = {'MEDIA_URL': settings.MEDIA_URL}
    return render(request, template, context)

def show_mobile_map(request, template='mobile-map.html'):
    context = {'MEDIA_URL': settings.MEDIA_URL}
    return render(request, template, context)
