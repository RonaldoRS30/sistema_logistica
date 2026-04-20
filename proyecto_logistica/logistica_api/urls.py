# proyecto_cotizaciones/logistica_api/urls.py

from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from logistica_api.views_frontend import FrontendAppView
# Registramos ViewSets en el router
router = DefaultRouter()
# router.register(r'cotizaciones', views.CotizacionViewSet, basename='cotizaciones')
# router.register(r'aprobaciones', views.AprobacionCotizacionViewSet, basename='aprobaciones')

urlpatterns = [
    # CSRF
    path('csrf/', views.get_csrf_token, name='get_csrf_token'),
    
    # LOGIN Y USUARIO
    path('login/', views.login_usuario, name='login_usuario'),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('usuario-actual/', views.usuario_actual, name='usuario_actual'),
    path('usuarios-activos/', views.usuarios_activos, name='usuarios_activos'),

    # DASHBOARD PRINCIPAL
    path('logistica/dashboard/', views.logistica_dashboard_view, name="logistica_dashboard_view"),
    path('logistica/dashboard/modal/<str:num_reg>/', views.logistica_modal_view, name="logistica_modal_view"),
        path('logistica/dashboard/modal/<str:num_reg>/', views.logistica_modal_view_sal, name="logistica_modal_view_sal"),

    path('cotizaciones/aprobacion_cotizacion', views.cotizaciones_dashboard_view, name="cotizaciones_dashboard_view"),
    path('logistica/dashboard/modal/<str:num_reg>/', views.logistica_modal_view_sal, name='logistica_modal_view_sal'),
    path("cotizacion/<int:num_reg>/suministros/", views.listar_suministros, name="listar_suministros"),
    path("cotizacion/<int:num_reg>/servicios/", views.listar_servicios, name="listar_servicios"),
    path('cotizacion/<int:num_reg>/mensajes/', views.listar_mensajes, name='listar_mensajes'),
    path("cotizacion/<int:num_reg>/seguimientos/", views.listar_seguimientos, name="listar_seguimiento"),
    path("cotizaciones/<int:num_reg>/totales-descuento/", views.totales_descuento_view, name="totales_descuento"),
    path("cotizaciones/<int:num_reg>/recalcular-totales/", views.recalcular_totales_cotizacion, name="recalcular_totales_cotizacion"),
   # path('logistica/dashboard/modal/<str:num_reg>/update/', views.logistica_update_view, name="logistica_update_view"),
    path('logistica/dashboard/productos/', views.logistica_productos_view, name="logistica_productos"),
    path('logistica/dashboard/umed/', views.logistica_umed_view, name="logistica_umed"),
    path('logistica/dashboard/areas/', views.logistica_areas_view, name="logistica_areas"),
    path('logistica/movimiento/',     views.logistica_movimiento, name='logistica_movimiento'),
     path(
        'logistica/dashboard/ordenes-oc/',
        views.buscar_ordenes_oc,
        name='buscar_ordenes_oc'
    ),
    path(
        'logistica/dashboard/ordenes-oc/<int:reg>/items/',
        views.detalle_orden_compra,
        name='detalle_orden_compra'
    ),
    path(
        'logistica/kardex_base/',
        views.logistica_kardex_base_view,
        name='logistica_kardex_base_view'
    ),

    path('logistica/kardex-base/', views.logistica_kardex_base_view, name='kardex_base_data'),
    path('cotizaciones/reportes/reporte_kardex_pdf/', views.reporte_kardex_pdf, name='reporte_kardex_pdf'),
    path('cotizaciones/reportes/reporte_almacen_dashboard_html/', views.reporte_almacen_dashboard_html, name='reporte_almacen_dashboard_html'),
    path('cotizaciones/reportes/reporte_almacen_salidas_dashboard_html/', views.reporte_almacen_salidas_dashboard_html, name='reporte_almacen_salidas_dashboard_html'),
    #path("logistica/salida-almacen/", views.salida_almacen, name='salida_almacen'),
    path('exportar_excel_entradas/', views.exportar_excel_entradas),
    path('exportar_excel_almacen/', views.exportar_excel_almacen),

    # BUSQUEDA
    path('clientes/<str:empresa>/encargados/', views.buscar_encargados_por_empresa, name='buscar_encargados_por_empresa'),

    # ADJUNTOS
    path('cotizaciones/adjuntos/', views.subir_archivo, name='subir_archivo'),
    path("cotizaciones/adjuntos/listar/<str:num_reg>/", views.listar_adjuntos, name="listar_adjuntos"),
    path("cotizaciones/adjuntos/eliminar/", views.eliminar_archivo, name="eliminar_archivo"),

    # GESTION
    path("cotizaciones/<str:numero>/generar-codigo/", views.generar_codigo_view, name="generar_codigo"),
    path("cotizaciones/<str:num_reg>/asignar-regus/", views.asignar_regus, name="asignar_regus"),

    # DB_VC
    path("cotizaciones/areas/", views.lista_areas, name="lista_areas"),
    path("cotizaciones/clientes/", views.lista_clientes, name="lista_clientes"),
    path("cotizaciones/clientes/crear/", views.crear_cliente, name="crear_cliente"),
    path("cotizaciones/clientes/<str:codigo>/actualizar/", views.actualizar_cliente, name="actualizar_cliente"),
    path("cotizaciones/clientes/<str:codigo>/eliminar/", views.eliminar_cliente, name="eliminar_cliente"),
    path("cotizaciones/clientes/reporte-excel/", views.exportar_excel_proveedores, name="exportar_excel_proveedores"),
    path("cotizaciones/estados/", views.lista_estados, name="lista_estados"),
    path("cotizaciones/proveedores/", views.lista_proveedores, name="lista_proveedores"),
    path("cotizaciones/categorias/", views.lista_categorias, name="lista_categorias"),
    path("cotizaciones/tgasto/", views.lista_tgasto, name="lista_tgasto"),
    path("cotizaciones/tgasto_d/", views.lista_tgasto_d, name="lista_tgasto_d"),
    path("cotizaciones/rittal/", views.lista_rittal, name="lista_rittal"),
    path("cotizaciones/rockwell/", views.lista_rockwell, name="lista_rockwell"),
    path("cotizaciones/ceyesa/", views.lista_ceyesa, name="lista_ceyesa"),
    path("cotizaciones/hoffman/", views.lista_hoffman, name="lista_hoffman"),
    path("cotizaciones/alm-articulos/", views.lista_alm_articulos, name="lista_alm_articulos"),

    # GUARDA COTIZACIÓN
    path("cotizaciones/guardar/", views.guardar_cotizacion, name="guardar_cotizacion"),

    # ALMACENES
    path("cotizaciones/almacenes/", views.lista_almacenes, name="lista_almacenes"),
    path("cotizaciones/almacenes/crear/", views.crear_almacen, name="crear_almacen"),
    path("cotizaciones/almacenes/<str:cod>/actualizar/", views.actualizar_almacen, name="actualizar_almacen"),
    path("cotizaciones/almacenes/reporte-excel/", views.exportar_excel_almacenes, name="exportar_excel_almacenes"),

    # GRUPO ANALITICO
    path("cotizaciones/grupos-analiticos/", views.lista_grupos_analiticos, name="lista_grupos_analiticos"),
    path("cotizaciones/grupos-analiticos/crear/", views.crear_grupo_analitico, name="crear_grupo_analitico"),
    path("cotizaciones/grupos-analiticos/<str:cod>/actualizar/", views.actualizar_grupo_analitico, name="actualizar_grupo_analitico"),
    path("cotizaciones/grupos-analiticos/reporte-excel/", views.exportar_excel_grupos_analiticos, name="exportar_excel_grupos_analiticos"),

    # PRODUCTOS
    path("cotizaciones/productos/", views.lista_articulos, name="lista_articulos"),
    path("cotizaciones/productos/crear/", views.crear_articulo, name="crear_articulo"),
    path("cotizaciones/productos/<int:reg>/actualizar/", views.actualizar_articulo, name="actualizar_articulo"),
    path("cotizaciones/productos/<int:reg>/eliminar/", views.eliminar_articulo, name="eliminar_articulo"),
    path("cotizaciones/productos/reporte-excel/", views.exportar_excel_articulos, name="exportar_excel_articulos"),
    path("cotizaciones/productos/reporte-barras-excel/", views.exportar_excel_barras, name="exportar_excel_barras"),
    
    # CENTROS DE COSTO
    path("cotizaciones/centros-costo/", views.lista_ccostos, name="lista_ccostos"),
    path("cotizaciones/centros-costo/crear/", views.crear_ccosto, name="crear_ccosto"),
    path("cotizaciones/centros-costo/<str:cod>/actualizar/", views.actualizar_ccosto, name="actualizar_ccosto"),
    path("cotizaciones/centros-costo/<str:cod>/eliminar/", views.eliminar_ccosto, name="eliminar_ccosto"),
    path("cotizaciones/centros-costo/reporte-excel/", views.exportar_excel_ccostos, name="exportar_excel_ccostos"),

    # UNIDADES DE MEDIDA
    path("cotizaciones/unidades-medida/", views.lista_unidades_medida, name="lista_unidades_medida"),
    path("cotizaciones/unidades-medida/crear/", views.crear_unidad_medida, name="crear_unidad_medida"),
    path("cotizaciones/unidades-medida/<str:cod>/actualizar/", views.actualizar_unidad_medida, name="actualizar_unidad_medida"),
    path("cotizaciones/unidades-medida/<str:cod>/eliminar/", views.eliminar_unidad_medida, name="eliminar_unidad_medida"),
    path("cotizaciones/unidades-medida/reporte-excel/", views.exportar_excel_unidades_medida, name="exportar_excel_unidades_medida"),


    # SEGUIMIENTO DE COTIZACIONES
    # path("dashboard/seguimiento-cotizaciones/", views.lista_seguimiento_cotizaciones, name="lista_seguimiento_cotizaciones"),

    # DOCUMENTOS ALMACÉN
    path("cotizaciones/doc-almacen/", views.lista_doc_almacen, name="lista_doc_almacen"),
    path("cotizaciones/doc-almacen/crear/", views.crear_doc_almacen, name="crear_doc_almacen"),
    path("cotizaciones/doc-almacen/<str:cod>/actualizar/", views.actualizar_doc_almacen, name="actualizar_doc_almacen"),
    path("cotizaciones/doc-almacen/<str:cod>/eliminar/", views.eliminar_doc_almacen, name="eliminar_doc_almacen"),
    path("cotizaciones/doc-almacen/reporte-excel/", views.exportar_excel_doc_almacen, name="exportar_excel_doc_almacen"),

    # Todas las rutas de ViewSets bajo /api/
    path('', include(router.urls)),

]

