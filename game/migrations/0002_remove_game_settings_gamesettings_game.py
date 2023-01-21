# Generated by Django 4.1.5 on 2023-01-21 01:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(model_name="game", name="settings",),
        migrations.AddField(
            model_name="gamesettings",
            name="game",
            field=models.OneToOneField(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="settings",
                to="game.game",
            ),
            preserve_default=False,
        ),
    ]
