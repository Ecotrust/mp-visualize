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
from django.views.decorators.clickjacking import xframe_options_exempt

from django.conf import settings
from visualize.models import *
from data_manager.models import *
from django.views.decorators.csrf import csrf_exempt
from django.http.response import JsonResponse
from visualize import settings as viz_settings

import urllib

def proxy_request(request):
    url = request.GET['url']
    try:
        proxied_request = urllib.request.urlopen(url)
        status_code = proxied_request.code
        mimetype = proxied_request.info().get_content_type()
        content = proxied_request.read()
    except urllib.error.HTTPError as e:
        return HttpResponse(e.msg, status=e.code, content_type='text/plain')
    else:
        return HttpResponse(content, status=status_code, content_type=mimetype)

def show_planner(request, template=None, render_response=True):
    if not template:
        if hasattr(settings, 'VISUALIZE_PLANNER_TEMPLATE'):
            template = settings.VISUALIZE_PLANNER_TEMPLATE
        else:
            template = 'visualize/planner.html'
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

    context = {
        'MEDIA_URL': settings.MEDIA_URL,
        'SOCKET_URL': socket_url,
        'REGION': settings.PROJECT_REGION,
        'login': 'true',
        'disclaimer': disclaimer_content,
        'SEARCH_DISABLED': settings.SEARCH_DISABLED,
        # WMS Proxy support:
        'wms_proxy_url': settings.WMS_PROXY,
        'wms_proxy_mapfile_field': settings.WMS_PROXY_MAPFILE_FIELD,
        'wms_proxy_mapfile': settings.WMS_PROXY_MAPFILE,
        'layer_name_param_key': settings.WMS_PROXY_LAYERNAME,
        'conn_param_key': settings.WMS_PROXY_CONNECTION,
        'format_param_key': settings.WMS_PROXY_FORMAT,
        'version_param_key': settings.WMS_PROXY_VERSION,
        'source_srs_param_key': settings.WMS_PROXY_SOURCE_SRS,
        'style_param_key': settings.WMS_PROXY_SOURCE_STYLE,
        'time_param_key': settings.WMS_PROXY_TIME,
        'time_item_param_key': settings.WMS_PROXY_TIME_ITEM,
        'time_def_param_key': settings.WMS_PROXY_TIME_DEFAULT,
        'proxy_generic_layer': settings.WMS_PROXY_GENERIC_LAYER,
        'proxy_time_layer': settings.WMS_PROXY_TIME_LAYER,
        'show_watermark': viz_settings.SHOW_WATERMARK,
        'MAP_LIBRARY': settings.MAP_LIBRARY,
    }

    ### RDH 2020-02-11: This should be covered by MAP_LIBRARY now
    # if hasattr(settings, 'MAP_TECH'):
    #     context['MAP_TECH'] = settings.MAP_TECH
    # else:
    #     context['MAP_TECH'] = 'ol2'

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

@xframe_options_exempt
def show_embedded_map(request, template='visualize/embedded.html'):
    context = {'MEDIA_URL': settings.MEDIA_URL}
    return render(request, template, context)

def show_mafmc_map(request, template='mafmc.html'):
    context = {'MEDIA_URL': settings.MEDIA_URL}
    return render(request, template, context)

def show_mobile_map(request, template='mobile-map.html'):
    context = {'MEDIA_URL': settings.MEDIA_URL}
    return render(request, template, context)
