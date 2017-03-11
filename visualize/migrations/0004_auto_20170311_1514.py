# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-11 23:14
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('visualize', '0003_auto_20170311_1450'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bookmark',
            name='sharing_groups',
            field=models.ManyToManyField(blank=True, editable=False, related_name='visualize_bookmark_related', to='auth.Group', verbose_name='Share with the following groups'),
        ),
    ]
