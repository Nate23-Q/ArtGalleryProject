from flask import request
from flask_restful import Resource
from ..models.artwork import Artwork, ArtworkSchema
from ..extensions import db
from ..utils.helpers import paginate_query

artwork_schema = ArtworkSchema()
artworks_schema = ArtworkSchema(many=True)


class GalleryResource(Resource):
    def get(self):
        try:
            # simple pagination
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 12))

            query = Artwork.query.order_by(Artwork.created_at.desc())
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


class CategoriesResource(Resource):
    def get(self):
        try:
            # Get unique categories from artworks
            categories = db.session.query(Artwork.category).distinct().filter(Artwork.category.isnot(None)).all()
            category_list = [cat[0] for cat in categories]
            return {"categories": category_list}, 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500
