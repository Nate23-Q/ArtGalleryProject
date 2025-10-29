from flask import request
from flask_restful import Resource
from ..extensions import db
from ..models.artwork import Artwork, ArtworkSchema
from ..models.user import User
from ..utils.decorators import role_required
from ..utils.helpers import paginate_query
import cloudinary.uploader
from marshmallow import ValidationError

artwork_schema = ArtworkSchema()
artworks_schema = ArtworkSchema(many=True)


class ArtistArtworkResource(Resource):
    @role_required(["artisan"])
    def get(self, user):
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 10))

            query = Artwork.query.filter_by(artist_id=user.id)
            pagination = paginate_query(query, page, per_page)

            data = artworks_schema.dump(pagination.items)
            return {
                "items": data,
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
            }, 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500

    @role_required(["artisan"])
    def post(self, user):
        try:
            data = request.get_json() or {}
            title = data.get("title")
            description = data.get("description")
            price = data.get("price")
            image_url = data.get("image_url")

            if not title or not price:
                return {"message": "title and price are required"}, 400

            artwork = Artwork(
                title=title,
                description=description,
                price=price,
                image_url=image_url,
                artist_id=user.id
            )

            db.session.add(artwork)
            db.session.commit()

            return artwork_schema.dump(artwork), 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


class ArtistArtworkDetailResource(Resource):
    @role_required(["artisan"])
    def get(self, user, artwork_id):
        try:
            artwork = Artwork.query.filter_by(id=artwork_id, artist_id=user.id).first()
            if not artwork:
                return {"message": "Artwork not found"}, 404

            return artwork_schema.dump(artwork), 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500

    @role_required(["artisan"])
    def put(self, user, artwork_id):
        try:
            artwork = Artwork.query.filter_by(id=artwork_id, artist_id=user.id).first()
            if not artwork:
                return {"message": "Artwork not found"}, 404

            data = request.get_json() or {}
            artwork.title = data.get("title", artwork.title)
            artwork.description = data.get("description", artwork.description)
            artwork.price = data.get("price", artwork.price)
            artwork.image_url = data.get("image_url", artwork.image_url)

            db.session.commit()

            return artwork_schema.dump(artwork), 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500

    @role_required(["artisan"])
    def delete(self, user, artwork_id):
        try:
            artwork = Artwork.query.filter_by(id=artwork_id, artist_id=user.id).first()
            if not artwork:
                return {"message": "Artwork not found"}, 404

            db.session.delete(artwork)
            db.session.commit()

            return {"message": "Artwork deleted"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


class UploadImageResource(Resource):
    @role_required(["artisan"])
    def post(self, user):
        try:
            if 'file' not in request.files:
                return {"message": "No file provided"}, 400

            file = request.files['file']
            if file.filename == '':
                return {"message": "No file selected"}, 400

            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(file)
            image_url = upload_result.get('secure_url')

            return {"image_url": image_url}, 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500


class ArtistStatsResource(Resource):
    @role_required(["artisan"])
    def get(self, user):
        try:
            total_artworks = Artwork.query.filter_by(artist_id=user.id).count()
            total_sales = db.session.query(db.func.sum(OrderItem.price)).join(Order).filter(
                OrderItem.artwork_id.in_(
                    db.session.query(Artwork.id).filter_by(artist_id=user.id)
                ),
                Order.status == 'completed'
            ).scalar() or 0

            return {
                "total_artworks": total_artworks,
                "total_sales": float(total_sales)
            }, 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500


# Import here to avoid circular imports
from ..models.order import OrderItem, Order
