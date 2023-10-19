# Create your views here.
from django.contrib.auth.models import Group
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from django.template import RequestContext
from querystring_parser import parser
import json
from json import dumps
from features.registry import user_sharing_groups
from functools import cmp_to_key
import locale
from django.views.decorators.clickjacking import xframe_options_exempt

from django.conf import settings
from .models import *
from data_manager.models import *
from django.views.decorators.csrf import csrf_exempt
from django.http.response import JsonResponse
from visualize import settings as viz_settings

import urllib

def proxy_request(request):
    content = ''
    mimetype = 'text/plain'
    status_code = 400
    try:
        url = request.GET['url']
        proxy = request.GET['proxy_params']
        layer_id = request.GET['layer_id']
        layer = Layer.objects.get(pk=layer_id)
        if proxy and layer_id and layer:
            params = request.build_absolute_uri().split('&proxy_params=true')[1]
            url_domain = urllib.parse.urlparse(url).netloc
            layer_domain = urllib.parse.urlparse(layer.url).netloc
            if len(params) > 0:
                if url_domain == layer_domain:
                    url = "{}?{}".format(url, params)
                else:
                    url = "{}?{}".format(layer.url, params)
            while '??' in url:
                url = '?'.join(url.split('??'))
    except Exception as e:
        # This handles proxy layers, not ogc wms proxied requets, so we'll pass and see if it can't sort itself out
        if len(content) > 0:
            content = '; '.join([content, str(e)])
        else:
            content = str(e)
        pass
    try:
        proxied_request = urllib.request.urlopen(url)
        status_code = proxied_request.code
        mimetype = proxied_request.info().get_content_type()
        content = proxied_request.read()
    except urllib.error.HTTPError as e:
        return HttpResponse(e.msg, status=e.code, content_type='text/plain')
    except TimeoutError as e:
        return HttpResponse(e, status=408, content_type='text/plain')
    except urllib.error.URLError as e:
        # This is most likely a timeout error. Not sure why the above doesn't apply.
        if hasattr(e, 'reason') and 'Connection timed out' in str(e.reason):
            return HttpResponse(e.reason, status=408, content_type='text/plain')
        return HttpResponse(e, status=500, content_type='text/plain')
    except UnboundLocalError as e:
        if len(content) > 0:
            content = '; '.join([content, str(e)])
        else:
            content = str(e)
        return HttpResponse(content, status=status_code, content_type=mimetype)
    except Exception as e:
        return HttpResponse(e, status=500, content_type='text/plain')
    else:
        return HttpResponse(content, status=status_code, content_type=mimetype)

def show_planner(request, template='visualize/planner.html'):
    try:
        socket_url = settings.SOCKET_URL
    except AttributeError:
        socket_url = ''

    disclaimer_content = {
        'title': False,
        'body': False,
        'decline_url': False
    }

    if len(Content.objects.filter(name='disclaimer_continue_button',live=True)) > 0:
        disclaimer_content['continueButtonText'] = Content.objects.filter(name='disclaimer_continue_button',live=True)[0].content
    elif settings.DISCLAIMER_BUTTON_DEFAULT:
        disclaimer_content['continueButtonText'] = settings.DISCLAIMER_BUTTON_DEFAULT

    if len(Content.objects.filter(name='disclaimer_body',live=True)) > 0:
        #There should be only one content named 'disclaimer_body' - assume the first
        disclaimer_content['body'] = Content.objects.filter(name='disclaimer_body',live=True)[0]

        # Shamelessly yanked from Eloff and Olivier Le Floch at http://stackoverflow.com/a/925630 on 5/12/2020
        try:
            from HTMLParser import HTMLParser   # Deprecated in py 3
            class MLStripper(HTMLParser):
                def __init__(self):
                    self.reset()
                    self.fed = []
                def handle_data(self, d):
                    self.fed.append(d)
                def get_data(self):
                    return ''.join(self.fed)
        except (ModuleNotFoundError, ImportError) as e:
            from io import StringIO
            from html.parser import HTMLParser

            class MLStripper(HTMLParser):
                def __init__(self):
                    super().__init__()
                    self.reset()
                    self.strict = False
                    self.convert_charrefs= True
                    self.text = StringIO()
                def handle_data(self, d):
                    self.text.write(d)
                def get_data(self):
                    return self.text.getvalue()

        def strip_tags(html):
            s = MLStripper()
            s.feed(html)
            return s.get_data()

        # End code copied from StackOverflow post

        if len(Content.objects.filter(name='disclaimer_title',live=True)) > 0:
            disclaimer_content['title'] = strip_tags(Content.objects.filter(name='disclaimer_title',live=True)[0].content)
        if len(Content.objects.filter(name='disclaimer_decline_url',live=True)) > 0:
            disclaimer_content['decline_url'] = strip_tags(Content.objects.filter(name='disclaimer_decline_url',live=True)[0].content)

    context = {
        'MEDIA_URL': settings.MEDIA_URL,
        'SOCKET_URL': socket_url,
        'REGION': settings.PROJECT_REGION,
        'ARCGIS_API_KEY': settings.ARCGIS_API_KEY,
        'login': 'true',
        'disclaimer': disclaimer_content,
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
        'USER_GEN_PREFIX': settings.USER_GEN_PREFIX,
        'USER_GEN_NOTICE': settings.USER_GEN_NOTICE,
    }

    if request.user.is_authenticated:
        context['session'] = request.session._session_key

    return render(request, template, context)

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

# RDH 2022-04-21: The below view is nice, but isn't used currently. Use get_user_layers in rpc.py instead!
def get_user_layers(request):
    json = []

    layers = UserLayer.objects.filter(user=request.user.id).order_by('date_created')
    for layer in layers:
        # Allow for "sharing groups" without an associated MapGroup, for "special" cases
        sharing_groups = [
            group.mapgroup_set.get().name
            for group in layer.sharing_groups.all()
            if group.mapgroup_set.exists()
        ]
        public_groups = [
            group.name
            for group in Group.objects.filter(name__in=settings.SHARING_TO_PUBLIC_GROUPS)
            if group in layer.sharing_groups.all()
        ]
        all_shared_groups = sharing_groups + public_groups

        json.append({
            'id': layer.id,
            'uid': layer.uid,
            'name': layer.name,
            'description': layer.description,
            # 'attributes': layer.serialize_attributes(),
            'sharing_groups': all_shared_groups,
            'shared_to_groups': sharing_groups,
            'owned_by_user': True
        })

    try:
        shared_layers = UserLayer.objects.shared_with_user(request.user)
    except Exception as e:
        shared_layers = UserLayer.objects.filter(pk=-1)
        pass
    for layer in shared_layers:
        if layer not in layers:
            username = layer.user.username
            actual_name = layer.user.first_name + ' ' + layer.user.last_name

            try:
                permission_groups = [x.map_group.permission_group for x in request.user.mapgroupmember_set.all()]
            except AttributeError as e:
                # likely anonymous user, who will not have 'mapgroupmember_set'
                permission_groups = []
                pass
            sharing_groups = [
                group.mapgroup_set.get().name
                for group in layer.sharing_groups.all()
                if group.mapgroup_set.exists() and group in permission_groups
            ]
            owned_by_user = True if len(sharing_groups) > 0 else False
            public_groups = [
                group.name
                for group in Group.objects.filter(name__in=settings.SHARING_TO_PUBLIC_GROUPS)
                if group in layer.sharing_groups.all()
            ]
            all_shared_groups = sharing_groups + public_groups

            json.append({
                'id': layer.id,
                'uid': layer.uid,
                'name': layer.name,
                'description': layer.description,
                # 'attributes': layer.serialize_attributes(),
                'shared': True,
                'shared_by_username': username,
                'shared_by_name': actual_name,
                'sharing_groups': all_shared_groups,
                'shared_to_groups': sharing_groups,
                'owned_by_user': owned_by_user
            })

    return HttpResponse(dumps(json))
