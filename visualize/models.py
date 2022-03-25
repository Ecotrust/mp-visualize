from django.contrib.gis.db import models
from django.conf import settings
from features.registry import register
from features.models import Feature
from data_manager.models import Layer
from drawing.models import AOI
from tinymce.models import HTMLField
from django.contrib.postgres.fields import JSONField
from django.urls import reverse
from django.contrib.contenttypes.models import ContentType
import json

@register
class Bookmark(Feature):
    url_hash = models.CharField(max_length=2050)
    description = models.TextField(null=True, blank=True, default=None)
    json = models.TextField(null=True, blank=True, default=None)

    class Options:
        verbose_name = 'Map View Bookmark'
        form = 'visualize.forms.BookmarkForm'

    @property
    def overview(self):

        layers = []
        try:
            details = json.loads(self.json)
            for layer in details['layers']:
                layer_dict = {
                'name': layer['name']
                }
                if type(layer['id']) == int:
                    layer_obj = Layer.all_objects.get(pk=layer['id'])
                    content_type = ContentType.objects.get_for_model(layer_obj.__class__)
                    layer_dict['url'] = reverse ("admin:{}_{}_change".format(content_type.app_label, content_type.model), args=(layer['id'],))
                    layer_dict['description'] = ''
                    layer_dict['owner'] = {'name': '', 'url': False}
                elif type(layer['id']) == str and 'drawing_aoi_' in layer['id']:
                    aoi_id = int(layer['id'].split('drawing_aoi_')[1])
                    drawing_obj = AOI.objects.get(pk=aoi_id)
                    content_type = ContentType.objects.get_for_model(drawing_obj.__class__)
                    layer_dict['url'] = reverse ("admin:{}_{}_change".format(content_type.app_label, content_type.model), args=(aoi_id,))
                    layer_dict['description'] = drawing_obj.description
                    user_ct = ContentType.objects.get_for_model(drawing_obj.user.__class__)
                    user_url = reverse ("admin:{}_{}_change".format(user_ct.app_label, user_ct.model), args=(drawing_obj.user.pk,))
                    layer_dict['owner'] = {'name': str(drawing_obj.user), 'url': user_url}
                elif type(layer['id']) == str and 'user_layer_' in layer['id']:
                    layer_dict['url'] = layer['url']
                    layer_dict['description'] = 'User added (id: {})'.format(layer['arcgislayers'])
                    user_ct = ContentType.objects.get_for_model(self.user.__class__)
                    user_url = reverse ("admin:{}_{}_change".format(user_ct.app_label, user_ct.model), args=(self.user.pk,))
                    layer_dict['owner'] = {'name': str(self.user), 'url': user_url}
                elif type(layer['id']) == str and 'mdat_layer_' in layer['id']:
                    layer_dict['url'] = layer['url']
                    layer_dict['description'] = 'MDAT Layer (id: {})'.format(layer['arcgislayers'])
                    layer_dict['owner'] = {'name': '', 'url': False}
                elif type(layer['id']) == str and 'vtr_layer_' in layer['id']:
                    layer_dict['url'] = layer['url']
                    layer_dict['description'] = 'VTR Layer (id: {})'.format(layer['arcgislayers'])
                    layer_dict['owner'] = {'name': '', 'url': False}
                else:
                    layer_dict['url'] =  False
                    layer_dict['description'] = ''
                    layer_dict['owner'] = {'name': '', 'url': False}

                layers.append(layer_dict)
        except TypeError as e:
            pass


        bookmark_ct = ContentType.objects.get_for_model(self.__class__)
        bookmark_url = reverse ("admin:{}_{}_change".format(bookmark_ct.app_label, bookmark_ct.model), args=(self.pk,))
        user_ct = ContentType.objects.get_for_model(self.user.__class__)
        user_url = reverse ("admin:{}_{}_change".format(user_ct.app_label, user_ct.model), args=(self.user.pk,))
        overview_dict = {
            'url': '/visualize/#{}'.format(self.url_hash),
            'name': self.name,
            'admin': bookmark_url,
            'description': self.description,
            'owner': {'name': str(self.user), 'url': user_url},
            'layers': layers
        }
        return overview_dict

class Content(models.Model):
    name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=255)
    description = models.TextField()
    content = HTMLField()
    live = models.BooleanField(default=False)

@register
class UserLayer(Feature):
    name = models.CharField(max_length=255)
    layer_type = models.CharField(max_length=50, choices=settings.LAYER_TYPE_CHOICES, help_text='use placeholder to temporarily remove layer from TOC')
    url = models.TextField(blank=True, null=True)
    arcgis_layers = models.CharField(max_length=255, blank=True, null=True, help_text='comma separated list of arcgis layer IDs')
    description = models.TextField(blank=True, null=True)

    class Options:
        verbose_name = 'User-Imported Layer'
        form = 'visualize.forms.UserLayerForm'

    def __unicode__(self):
        return self.name

    def __str__(self):
        return self.__unicode__()
