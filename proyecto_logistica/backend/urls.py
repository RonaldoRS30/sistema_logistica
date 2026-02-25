# proyecto_cotizaciones/backend/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from logistica_api.views_frontend import FrontendAppView

# proyecto_cotizaciones/urls.py
urlpatterns = [
    path('admin/', admin.site.urls),

    # ✅ Primero las rutas de API
    path('api/', include('logistica_api.urls')),

    # ✅ El catch-all del frontend SIEMPRE al final
    re_path(r'^.*', FrontendAppView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

