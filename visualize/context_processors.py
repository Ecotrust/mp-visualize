from django.conf import settings

def viz_gloabal(request):
    return{
        'MAP_LIBRARY': settings.MAP_LIBRARY,
        'REGION': settings.PROJECT_REGION,
        'ARCGIS_API_KEY': settings.ARCGIS_API_KEY,
    }