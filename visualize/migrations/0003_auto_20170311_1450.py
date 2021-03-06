# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-11 22:50
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('visualize', '0002_content'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bookmark',
            name='date_created',
            field=models.DateTimeField(auto_now_add=True, verbose_name='Date Created'),
        ),
        migrations.AlterField(
            model_name='bookmark',
            name='date_modified',
            field=models.DateTimeField(auto_now=True, verbose_name='Date Modified'),
        ),
        migrations.AlterField(
            model_name='bookmark',
            name='name',
            field=models.CharField(max_length=255, verbose_name='Name'),
        ),
        migrations.AlterField(
            model_name='bookmark',
            name='sharing_groups',
            field=models.ManyToManyField(blank=True, editable=False, null=True, related_name='visualize_bookmark_related', to='auth.Group', verbose_name='Share with the following groups'),
        ),
    ]
