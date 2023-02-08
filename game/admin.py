from django.contrib import admin

from .models import *

admin.site.register(Game)
admin.site.register(GameSettings)
admin.site.register(Player)
admin.site.register(Phase)
admin.site.register(Civ)
admin.site.register(PlayerAdvCard)
admin.site.register(AdvCardAffinity)
admin.site.register(AdvCard)
admin.site.register(Territory)
admin.site.register(PlayerTerritory)
admin.site.register(AdjacentTerritory)
admin.site.register(Board)
admin.site.register(PlayerCredit)
