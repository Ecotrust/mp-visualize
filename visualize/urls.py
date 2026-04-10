from django.urls import re_path, include

from .views import (show_embedded_map,
                   show_mafmc_map, show_mobile_map, show_planner, proxy_request, get_user_layers)
from django.views.generic.base import TemplateView

from rest_framework import routers, serializers, viewsets, permissions
from .models import Bookmark

from .api import (
    BookmarkListView, BookmarkDetailView, BookmarkShareView,
    UserLayerListView, UserLayerDetailView, UserLayerShareView,
)

class BookmarkSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Bookmark
        fields = ['overview',]

class BookmarkViewSet(viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = (permissions.IsAdminUser,)

router = routers.DefaultRouter()
router.register(r'bookmarks', BookmarkViewSet)


urlpatterns = [
    #'',
    re_path(r'^experiment$', TemplateView.as_view(template_name='visualize/experiment.html')),
    re_path(r'^map', show_embedded_map, name="embedded_map"),
    re_path(r'^mafmc', show_mafmc_map, name="mafmc_map"),
    re_path(r'^mobile', show_mobile_map, name="mobile_map"),
    re_path(r'^proxy', proxy_request, name='proxy_request'),
    re_path('^rest/', include(router.urls)),
    re_path('^get_user_layers', get_user_layers),
    re_path(r'^$', show_planner, name="planner"),
]

# DRF API patterns — mounted at /api/ by the project urls.py
api_urlpatterns = [
    re_path(r'^bookmarks/$', BookmarkListView.as_view()),
    re_path(r'^bookmarks/(?P<pk>\d+)/$', BookmarkDetailView.as_view()),
    re_path(r'^bookmarks/(?P<uid>\w+)/share/$', BookmarkShareView.as_view()),
    re_path(r'^user-layers/$', UserLayerListView.as_view()),
    re_path(r'^user-layers/(?P<pk>\d+)/$', UserLayerDetailView.as_view()),
    re_path(r'^user-layers/(?P<uid>\w+)/share/$', UserLayerShareView.as_view()),
]
