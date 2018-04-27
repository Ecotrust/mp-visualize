from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from rpc4django import rpcmethod

@rpcmethod(login_required=True)
def add_bookmark(name, url_hash, **kwargs):
    from visualize.models import Bookmark
    request = kwargs['request']

    bookmark = Bookmark(user=request.user, name=name, url_hash=url_hash)
    bookmark.save()
    sharing_groups = [group.name for group in bookmark.sharing_groups.all()]
    content = [{
        'uid': bookmark.uid,
        'name': bookmark.name,
        'hash': bookmark.url_hash,
        'sharing_groups': sharing_groups,
    }]
    return content


@rpcmethod(login_required=True)
def get_bookmarks(**kwargs):
    """Return a list of bookmark object for the current user.
    """
    # There are no map groups outside of MidAtlanticPortal org repos
    # map group model and views are currently not included in a marine planner app
    # https://github.com/MidAtlanticPortal/marco-map_groups
    # TODO make decision about included map groups in planner apps
    # ---vvvvvvvvv----
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
            'hash': bookmark.url_hash,
            'sharing_groups': sharing_groups
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
                'hash': bookmark.url_hash,
                'shared': True,
                'shared_by_user': bookmark.user.id,
                'shared_to_groups': shared_groups,
                'shared_by_name': bookmark.user.get_short_name(),
            })
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
