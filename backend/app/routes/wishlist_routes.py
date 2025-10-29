from flask import request
from flask_restful import Resource
from ..extensions import db
from ..models.wishlist import Wishlist, WishlistItem, WishlistSchema, WishlistItemSchema
from ..utils.decorators import jwt_required_and_get_user
from marshmallow import ValidationError

wishlist_schema = WishlistSchema()
wishlist_item_schema = WishlistItemSchema()


class WishlistResource(Resource):
    @jwt_required_and_get_user()
    def get(self, user):
        try:
            wishlist = Wishlist.query.filter_by(user_id=user.id).first()
            if not wishlist:
                # Create empty wishlist if none exists
                wishlist = Wishlist(user_id=user.id)
                db.session.add(wishlist)
                db.session.commit()

            return wishlist_schema.dump(wishlist), 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500

    @jwt_required_and_get_user()
    def post(self, user):
        try:
            data = request.get_json() or {}
            artwork_id = data.get("artworkId")

            if not artwork_id:
                return {"message": "artworkId is required"}, 400

            wishlist = Wishlist.query.filter_by(user_id=user.id).first()
            if not wishlist:
                wishlist = Wishlist(user_id=user.id)
                db.session.add(wishlist)
                db.session.commit()

            # Check if item already in wishlist
            wishlist_item = WishlistItem.query.filter_by(wishlist_id=wishlist.id, artwork_id=artwork_id).first()
            if wishlist_item:
                return {"message": "Item already in wishlist"}, 400

            wishlist_item = WishlistItem(
                wishlist_id=wishlist.id,
                artwork_id=artwork_id
            )
            db.session.add(wishlist_item)
            db.session.commit()

            return wishlist_schema.dump(wishlist), 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


class WishlistItemResource(Resource):
    @jwt_required_and_get_user()
    def delete(self, user, artwork_id):
        try:
            wishlist = Wishlist.query.filter_by(user_id=user.id).first()
            if not wishlist:
                return {"message": "Wishlist not found"}, 404

            wishlist_item = WishlistItem.query.filter_by(wishlist_id=wishlist.id, artwork_id=artwork_id).first()
            if not wishlist_item:
                return {"message": "Item not found in wishlist"}, 404

            db.session.delete(wishlist_item)
            db.session.commit()
            return wishlist_schema.dump(wishlist), 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500
