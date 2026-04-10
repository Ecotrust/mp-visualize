"""DRF API views replacing the rpc4django /rpc endpoint for the visualize app.

Replaces these former XML-RPC methods:
    get_bookmarks, add_bookmark, load_bookmark, remove_bookmark, share_bookmark
    get_user_layers, add_user_layer, load_user_layer, remove_user_layer, share_user_layer
"""
from __future__ import annotations

from typing import Any

from django.conf import settings
from django.contrib.auth.models import Group
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


# ---------------------------------------------------------------------------
# Bookmarks
# ---------------------------------------------------------------------------

class BookmarkListView(APIView):
    """GET /api/bookmarks/  — list user's own + shared bookmarks.
    POST /api/bookmarks/ — create a new bookmark.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        from mapgroups.models import MapGroupMember
        from visualize.models import Bookmark

        content: list[dict[str, Any]] = []
        bookmark_list = Bookmark.objects.filter(user=request.user)

        for bookmark in bookmark_list:
            sharing_groups = [
                g.mapgroup_set.get().name for g in bookmark.sharing_groups.all()
            ]
            content.append({
                'uid': bookmark.uid,
                'name': bookmark.name,
                'description': bookmark.description,
                'hash': bookmark.url_hash,
                'sharing_groups': sharing_groups,
                'json': bookmark.json,
            })

        shared_bookmarks = Bookmark.objects.shared_with_user(request.user)
        for bookmark in shared_bookmarks:
            if bookmark not in bookmark_list:
                groups = bookmark.sharing_groups.filter(user__in=[request.user])
                shared_groups = [g.mapgroup_set.get().name for g in groups]
                content.append({
                    'uid': bookmark.uid,
                    'name': bookmark.name,
                    'description': bookmark.description,
                    'hash': bookmark.url_hash,
                    'shared': True,
                    'shared_by_user': bookmark.user.id,
                    'shared_to_groups': shared_groups,
                    'shared_by_name': bookmark.user.get_short_name(),
                    'json': bookmark.json,
                })

        return Response(content)

    def post(self, request: Request) -> Response:
        from visualize.models import Bookmark

        data = request.data
        bookmark = Bookmark(
            user=request.user,
            name=data['name'],
            description=data.get('description', ''),
            url_hash=data['url_hash'],
            json=data.get('json', ''),
        )
        bookmark.save()
        sharing_groups = [g.name for g in bookmark.sharing_groups.all()]
        return Response([{
            'uid': bookmark.uid,
            'name': bookmark.name,
            'description': bookmark.description,
            'hash': bookmark.url_hash,
            'sharing_groups': sharing_groups,
            'json': bookmark.json,
        }], status=status.HTTP_201_CREATED)


class BookmarkDetailView(APIView):
    """GET /api/bookmarks/<pk>/  — load a bookmark by pk (auth not required).
    DELETE /api/bookmarks/<pk>/  — remove owner's bookmark.
    """

    def get_permissions(self) -> list:
        if self.request.method == 'DELETE':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request: Request, pk: int) -> Response:
        from visualize.models import Bookmark

        bookmark = get_object_or_404(Bookmark, pk=pk)
        return Response([{
            'uid': bookmark.uid,
            'hash': bookmark.url_hash,
            'json': bookmark.json,
        }])

    def delete(self, request: Request, pk: int) -> Response:
        from visualize.models import Bookmark

        bookmark = get_object_or_404(Bookmark, pk=pk, user=request.user)
        bookmark.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BookmarkShareView(APIView):
    """POST /api/bookmarks/<uid>/share/

    Body: {"group_names": ["Group A", "Group B"]}
    Replaces the previous sharing list wholesale (share_with append=False).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request: Request, uid: str) -> Response:
        from features.registry import get_feature_by_uid

        bookmark = get_feature_by_uid(uid)
        viewable, _response = bookmark.is_viewable(request.user)
        if not viewable:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        bookmark.share_with(None)
        group_names: list[str] = request.data.get('group_names', [])
        groups = [Group.objects.get(mapgroup__name=gname) for gname in group_names]
        bookmark.share_with(groups, append=False)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# User Layers
# ---------------------------------------------------------------------------

class UserLayerListView(APIView):
    """GET /api/user-layers/  — list user's own + shared layers (auth optional).
    POST /api/user-layers/ — create a new user layer.
    """

    def get_permissions(self) -> list:
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request: Request) -> Response:
        from visualize.models import UserLayer

        content: list[dict[str, Any]] = []

        try:
            user_layer_list = UserLayer.objects.filter(user=request.user)
        except TypeError:
            user_layer_list = []

        for ul in user_layer_list:
            sharing_groups = [
                g.mapgroup_set.get().name
                for g in ul.sharing_groups.all()
                if g.mapgroup_set.exists()
            ]
            public_groups = [
                g.name
                for g in Group.objects.filter(name__in=settings.SHARING_TO_PUBLIC_GROUPS)
                if g in ul.sharing_groups.all()
            ]
            content.append({
                'id': ul.id,
                'uid': ul.uid,
                'name': ul.name,
                'description': ul.description,
                'url': ul.url,
                'layer_type': ul.layer_type,
                'password_protected': ul.password_protected,
                'arcgis_layers': ul.arcgis_layers,
                'sharing_groups': sharing_groups + public_groups,
                'shared_to_groups': sharing_groups,
                'owned_by_user': True,
                'wms_slug': ul.wms_slug,
                'wms_srs': ul.wms_srs,
                'wms_params': ul.wms_params,
                'wms_version': ul.wms_version,
                'wms_format': ul.wms_format,
                'wms_styles': ul.wms_styles,
            })

        try:
            shared_layers = UserLayer.objects.shared_with_user(request.user)
        except TypeError:
            shared_layers = UserLayer.objects.filter(pk=-1)

        for ul in shared_layers:
            if ul not in user_layer_list:
                try:
                    groups = ul.sharing_groups.filter(user__in=[request.user])
                    permission_groups = [
                        x.map_group.permission_group
                        for x in request.user.mapgroupmember_set.all()
                    ]
                except TypeError:
                    groups = []
                    permission_groups = []

                sharing_groups = [
                    g.mapgroup_set.get().name
                    for g in ul.sharing_groups.all()
                    if g.mapgroup_set.exists() and g in permission_groups
                ]
                public_groups = [
                    g.name
                    for g in Group.objects.filter(name__in=settings.SHARING_TO_PUBLIC_GROUPS)
                    if g in ul.sharing_groups.all()
                ]
                owned_by_user = len(sharing_groups) > 0
                content.append({
                    'id': ul.id,
                    'uid': ul.uid,
                    'name': ul.name,
                    'description': ul.description,
                    'url': ul.url,
                    'layer_type': ul.layer_type,
                    'password_protected': ul.password_protected,
                    'arcgis_layers': ul.arcgis_layers,
                    'shared': True,
                    'shared_by_user': ul.user.id,
                    'sharing_groups': sharing_groups + public_groups,
                    'shared_to_groups': sharing_groups,
                    'shared_by_name': ul.user.get_short_name(),
                    'owned_by_user': owned_by_user,
                    'wms_slug': ul.wms_slug,
                    'wms_srs': ul.wms_srs,
                    'wms_params': ul.wms_params,
                    'wms_version': ul.wms_version,
                    'wms_format': ul.wms_format,
                    'wms_styles': ul.wms_styles,
                })

        return Response(content)

    def post(self, request: Request) -> Response:
        from visualize.models import UserLayer

        data = request.data
        ul = UserLayer(
            user=request.user,
            name=data['name'],
            description=data.get('description', ''),
            url=data['url'],
            layer_type=data['layer_type'],
            arcgis_layers=data.get('arcgis_layers', ''),
        )
        ul.save()
        sharing_groups = [g.name for g in ul.sharing_groups.all()]
        return Response([{
            'uid': ul.uid,
            'name': ul.name,
            'description': ul.description,
            'url': ul.url,
            'layer_type': ul.layer_type,
            'arcgis_layers': ul.arcgis_layers,
            'sharing_groups': sharing_groups,
            'wms_slug': ul.wms_slug,
            'wms_srs': ul.wms_srs,
            'wms_params': ul.wms_params,
            'wms_version': ul.wms_version,
            'wms_format': ul.wms_format,
            'wms_styles': ul.wms_styles,
        }], status=status.HTTP_201_CREATED)


class UserLayerDetailView(APIView):
    """GET /api/user-layers/<pk>/  — load a user layer (auth not required).
    DELETE /api/user-layers/<pk>/ — remove owner's user layer.
    """

    def get_permissions(self) -> list:
        if self.request.method == 'DELETE':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request: Request, pk: int) -> Response:
        from visualize.models import UserLayer

        ul = get_object_or_404(UserLayer, pk=pk)
        return Response([{
            'uid': ul.uid,
            'name': ul.name,
            'description': ul.description,
            'url': ul.url,
            'layer_type': ul.layer_type,
            'password_protected': ul.password_protected,
            'arcgis_layers': ul.arcgis_layers,
            'wms_slug': ul.wms_slug,
            'wms_srs': ul.wms_srs,
            'wms_params': ul.wms_params,
            'wms_version': ul.wms_version,
            'wms_format': ul.wms_format,
            'wms_styles': ul.wms_styles,
        }])

    def delete(self, request: Request, pk: int) -> Response:
        from visualize.models import UserLayer

        ul = get_object_or_404(UserLayer, pk=pk, user=request.user)
        ul.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserLayerShareView(APIView):
    """POST /api/user-layers/<uid>/share/

    Body: {"group_names": ["Group A", "Group B"]}
    Replaces the previous sharing list wholesale (share_with append=False).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request: Request, uid: str) -> Response:
        from features.registry import get_feature_by_uid

        ul = get_feature_by_uid(uid)
        viewable, _response = ul.is_viewable(request.user)
        if not viewable:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        ul.share_with(None)
        group_names: list[str] = request.data.get('group_names', [])
        groups = [Group.objects.get(mapgroup__name=gname) for gname in group_names]
        ul.share_with(groups, append=False)
        return Response(status=status.HTTP_204_NO_CONTENT)
