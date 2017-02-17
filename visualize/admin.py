from django.contrib import admin
from visualize.models import *

admin.site.register(Bookmark)

class ContentAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'name', 'description', 'live')

admin.site.register(Content, ContentAdmin)
