from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from rpc4django import rpcmethod
from django.conf import settings


@rpcmethod(login_required=True)
def add_bookmark(name, description, url_hash, json, **kwargs):
    from visualize.models import Bookmark
    request = kwargs['request']

    bookmark = Bookmark(user=request.user, name=name, description=description, url_hash=url_hash, json=json)
    bookmark.save()
    sharing_groups = [group.name for group in bookmark.sharing_groups.all()]
    content = [{
        'uid': bookmark.uid,
        'name': bookmark.name,
        'description': bookmark.description,
        'hash': bookmark.url_hash,
        'sharing_groups': sharing_groups,
        'json': bookmark.json,
    }]
    return content

@rpcmethod(login_required=True)
def get_bookmarks(**kwargs):
    """Return a list of bookmark object for the current user.
    """
    from mapgroups.models import MapGroup, MapGroupMember
    from visualize.models import Bookmark

    request = kwargs['request']

    #grab all bookmarks belonging to this user
    #serialize bookmarks into 'name', 'hash' objects and return json dump
    content = []
    bookmark_list = Bookmark.objects.filter(user=request.user)
    for bookmark in bookmark_list:
        sharing_groups = [group.mapgroup_set.get().name
                          for group in bookmark.sharing_groups.all()]
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
            username = bookmark.user.username
            groups = bookmark.sharing_groups.filter(user__in=[request.user])
            # Fetch the bookmark owner's preference on whether to share their
            # real name with the group. Since it is possible that the bookmark
            # sharer, and the bookmark sharee might be common members of
            # multiple groups, if the sharer has a "Show Real Name" preference
            # set on _any_ of the groups, then display their real name.
            # Otherwise show their preferred name.

            show_real_name = MapGroupMember.objects.filter(
                user=bookmark.user,
                map_group__permission_group__in=groups
            ).values_list('show_real_name')

            shared_groups = [g.mapgroup_set.get().name for g in groups]

            actual_name = bookmark.user.first_name + ' ' + bookmark.user.last_name
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
    return content

@rpcmethod(login_required=False)
def load_bookmark(bookmark_id, **kwargs):
    """Retrive a bookmark by ID - ownership is irrelevant.
    """
    from visualize.models import Bookmark
    request = kwargs['request']

    bookmark = Bookmark.objects.get(pk=bookmark_id)
    content = [{
        'uid': bookmark.uid,
        # 'name': bookmark.name,
        # 'description': bookmark.description,
        'hash': bookmark.url_hash,
        # 'sharing_groups': sharing_groups,
        'json': bookmark.json,
    }]
    return content

@rpcmethod(login_required=True)
def remove_bookmark(key, **kwargs):
    from visualize.models import Bookmark
    request = kwargs['request']
    # uid = appname_modelname_pk
    key = int(key.split('_')[-1])
    bookmark = get_object_or_404(Bookmark, id=key, user=request.user)
    bookmark.delete()

@rpcmethod(login_required=True)
def share_bookmark(bookmark_uid, group_names, **kwargs):
    from django.contrib.auth.models import Group
    from features.registry import get_feature_by_uid
    request = kwargs['request']
    # group_names = request.POST.getlist('groups[]')
    # bookmark_uid = request.POST['bookmark']
    bookmark = get_feature_by_uid(bookmark_uid)

    viewable, response = bookmark.is_viewable(request.user)
    if not viewable:
        return response

    #remove previously shared with groups, before sharing with new list
    bookmark.share_with(None)

    groups = []
    for group_name in group_names:
        g = Group.objects.get(mapgroup__name=group_name)
        groups.append(g)

    bookmark.share_with(groups, append=False)


######################################################
#   User Layers                                      #
######################################################


@rpcmethod(login_required=True)
def add_user_layer(name, description, url, layer_type, arcgis_layers, **kwargs):
    from visualize.models import UserLayer
    request = kwargs['request']

    userLayer = UserLayer(user=request.user, name=name, description=description, url=url, layer_type=layer_type, arcgis_layers=arcgis_layers)
    userLayer.save()
    sharing_groups = [group.name for group in userLayer.sharing_groups.all()]
    content = [{
        'uid': userLayer.uid,
        'name': userLayer.name,
        'description': userLayer.description,
        'url': userLayer.url,
        'layer_type': userLayer.layer_type,
        'arcgis_layers': userLayer.arcgis_layers,
        'sharing_groups': sharing_groups,
        'wms_slug': userLayer.wms_slug,
        'wms_srs': userLayer.wms_srs,
        'wms_params': userLayer.wms_params,
        'wms_version': userLayer.wms_version,
        'wms_format': userLayer.wms_format,
        'wms_styles': userLayer.wms_styles,
    }]
    return content

@rpcmethod(login_required=False)
def get_user_layers(**kwargs):
    """Return a list of user layer objects for the current user.
    """

    from django.contrib.auth.models import Group
    from mapgroups.models import MapGroup, MapGroupMember
    from visualize.models import UserLayer

    request = kwargs['request']

    #grab all user layers belonging to this user
    #serialize user layers into 'name', 'hash' objects and return json dump
    content = []
    try:
        user_layer_list = UserLayer.objects.filter(user=request.user)
    except TypeError as e:
        user_layer_list = []

    for userLayer in user_layer_list:
        sharing_groups = [
            group.mapgroup_set.get().name
            for group in userLayer.sharing_groups.all()
            if group.mapgroup_set.exists()    
        ]
        public_groups = [
            group.name
            for group in Group.objects.filter(name__in=settings.SHARING_TO_PUBLIC_GROUPS)
            if group in userLayer.sharing_groups.all()
        ]
        all_sharing_groups = sharing_groups + public_groups

        content.append({
            'id': userLayer.id,
            'uid': userLayer.uid,
            'name': userLayer.name,
            'description': userLayer.description,
            'url': userLayer.url,
            'layer_type': userLayer.layer_type,
            'arcgis_layers': userLayer.arcgis_layers,
            'sharing_groups': all_sharing_groups,
            'shared_to_groups': sharing_groups,
            'owned_by_user': True,
            'wms_slug': userLayer.wms_slug,
            'wms_srs': userLayer.wms_srs,
            'wms_params': userLayer.wms_params,
            'wms_version': userLayer.wms_version,
            'wms_format': userLayer.wms_format,
            'wms_styles': userLayer.wms_styles,
        })

    try:
        shared_user_layers = UserLayer.objects.shared_with_user(request.user)
    except TypeError as e:
        shared_user_layers = UserLayer.objects.filter(pk=-1)
        pass
    for userLayer in shared_user_layers:
        if userLayer not in user_layer_list:
            username = userLayer.user.username
            try:
                groups = userLayer.sharing_groups.filter(user__in=[request.user])

                shared_groups = [g.mapgroup_set.get().name for g in groups]
                permission_groups = [x.map_group.permission_group for x in request.user.mapgroupmember_set.all()]
            except TypeError as e:
                shared_groups = []
                permission_groups = []
            sharing_groups = [
                group.mapgroup_set.get().name
                for group in userLayer.sharing_groups.all()
                if group.mapgroup_set.exists() and group in permission_groups
            ]
            owned_by_user = True if len(sharing_groups) > 0 else False
            public_groups = [
                group.name
                for group in Group.objects.filter(name__in=settings.SHARING_TO_PUBLIC_GROUPS)
                if group in userLayer.sharing_groups.all()
            ]
            all_shared_groups = sharing_groups + public_groups

            actual_name = userLayer.user.first_name + ' ' + userLayer.user.last_name
            content.append({
                'id': userLayer.id,
                'uid': userLayer.uid,
                'name': userLayer.name,
                'description': userLayer.description,
                'url': userLayer.url,
                'layer_type': userLayer.layer_type,
                'arcgis_layers': userLayer.arcgis_layers,
                'shared': True,
                'shared_by_user': userLayer.user.id,
                'sharing_groups': all_shared_groups,
                'shared_to_groups': sharing_groups,
                'shared_by_name': userLayer.user.get_short_name(),
                'owned_by_user': owned_by_user,
                'wms_slug': userLayer.wms_slug,
                'wms_srs': userLayer.wms_srs,
                'wms_params': userLayer.wms_params,
                'wms_version': userLayer.wms_version,
                'wms_format': userLayer.wms_format,
                'wms_styles': userLayer.wms_styles,
            })
    return content

@rpcmethod(login_required=False)
def load_user_layer(user_layer_id, **kwargs):
    """Retrive a userLayer by ID - ownership is irrelevant.
    """
    from visualize.models import UserLayer
    request = kwargs['request']

    userLayer = UserLayer.objects.get(pk=user_layer_id)
    content = [{
        'uid': userLayer.uid,
        'name': userLayer.name,
        'description': userLayer.description,
        'url': userLayer.url,
        'layer_type': userLayer.layer_type,
        'arcgis_layers': userLayer.arcgis_layers,
        # 'sharing_groups': sharing_groups,
        'wms_slug': userLayer.wms_slug,
        'wms_srs': userLayer.wms_srs,
        'wms_params': userLayer.wms_params,
        'wms_version': userLayer.wms_version,
        'wms_format': userLayer.wms_format,
        'wms_styles': userLayer.wms_styles,
    }]
    return content

@rpcmethod(login_required=True)
def remove_user_layer(key, **kwargs):
    from visualize.models import UserLayer
    request = kwargs['request']
    # uid = appname_modelname_pk
    key = int(key.split('_')[-1])
    userLayer = get_object_or_404(UserLayer, id=key, user=request.user)
    userLayer.delete()

@rpcmethod(login_required=True)
def share_user_layer(user_layer_uid, group_names, **kwargs):
    from django.contrib.auth.models import Group
    from features.registry import get_feature_by_uid
    request = kwargs['request']
    # group_names = request.POST.getlist('groups[]')
    userLayer = get_feature_by_uid(user_layer_uid)

    viewable, response = userLayer.is_viewable(request.user)
    if not viewable:
        return response

    #remove previously shared with groups, before sharing with new list
    userLayer.share_with(None)

    groups = []
    for group_name in group_names:
        g = Group.objects.get(mapgroup__name=group_name)
        groups.append(g)

    userLayer.share_with(groups, append=False)
