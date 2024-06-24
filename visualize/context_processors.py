from django.conf import settings

def viz_gloabal(request):
    return{
        'MAP_LIBRARY': settings.MAP_LIBRARY,
        'REGION': settings.PROJECT_REGION,
    }