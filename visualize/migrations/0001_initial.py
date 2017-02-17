# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('contenttypes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bookmark',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name=b'Name')),
                ('date_created', models.DateTimeField(auto_now_add=True, verbose_name=b'Date Created')),
                ('date_modified', models.DateTimeField(auto_now=True, verbose_name=b'Date Modified')),
                ('object_id', models.PositiveIntegerField(null=True, blank=True)),
                ('url_hash', models.CharField(max_length=2050)),
                ('content_type', models.ForeignKey(related_name='visualize_bookmark_related', blank=True, to='contenttypes.ContentType', null=True)),
                ('sharing_groups', models.ManyToManyField(related_name='visualize_bookmark_related', editable=False, to='auth.Group', blank=True, null=True, verbose_name=b'Share with the following groups')),
                ('user', models.ForeignKey(related_name='visualize_bookmark_related', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
    ]
