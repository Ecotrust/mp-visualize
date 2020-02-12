# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('visualize', '0002_content'),
    ]

    operations = [
        migrations.AddField(
            model_name='bookmark',
            name='description',
            field=models.TextField(default=None, null=True, blank=True),
            preserve_default=True,
        ),
    ]
