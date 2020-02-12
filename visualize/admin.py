from django.contrib import admin
from visualize.models import *

class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'description')

admin.site.register(Bookmark, BookmarkAdmin)

class ContentAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'name', 'description', 'live')

admin.site.register(Content, ContentAdmin)
