from flask import Flask
from flask_restful import Api
from .config import Config
from .extensions import db, migrate, jwt, ma


def create_app(config_object: str = None):
    app = Flask(__name__)
    app.config.from_object(config_object or Config)

    # init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)

    # Register API and resources
    api = Api(app)

    # import resources here to register with api
    from .routes.auth_routes import RegisterResource, LoginResource
    from .routes.gallery_routes import GalleryResource
    from .routes.artist_routes import ArtistArtworkResource, ArtistArtworkDetailResource, UploadImageResource
    from .routes.customer_routes import CustomerOrdersResource, CustomerOrderDetailResource, CustomerArtworksResource
    from .routes.order_routes import OrdersResource, OrderDetailResource, PaymentsResource, DeliveriesResource, NotificationsResource

    api.add_resource(RegisterResource, "/api/auth/signup")
    api.add_resource(LoginResource, "/api/auth/login")
    api.add_resource(GalleryResource, "/api/gallery")

    # Artist routes
    api.add_resource(ArtistArtworkResource, "/api/artist/artworks")
    api.add_resource(ArtistArtworkDetailResource, "/api/artist/artworks/<uuid:artwork_id>")
    api.add_resource(UploadImageResource, "/api/artist/upload")

    # Customer routes
    api.add_resource(CustomerOrdersResource, "/api/customer/orders")
    api.add_resource(CustomerOrderDetailResource, "/api/customer/orders/<uuid:order_id>")
    api.add_resource(CustomerArtworksResource, "/api/customer/artworks")

    # Order management routes
    api.add_resource(OrdersResource, "/api/orders")
    api.add_resource(OrderDetailResource, "/api/orders/<uuid:order_id>")
    api.add_resource(PaymentsResource, "/api/orders/<uuid:order_id>/payments")
    api.add_resource(DeliveriesResource, "/api/orders/<uuid:order_id>/deliveries")
    api.add_resource(NotificationsResource, "/api/notifications")
    api.add_resource(NotificationsResource, "/api/notifications/<uuid:notification_id>", endpoint="notification_detail")

    return app
