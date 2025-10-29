from flask import request
from flask_restful import Resource
from ..extensions import db
from ..models.cart import Cart, CartItem, CartSchema, CartItemSchema
from ..utils.decorators import jwt_required_and_get_user
from marshmallow import ValidationError

cart_schema = CartSchema()
cart_item_schema = CartItemSchema()


class CartResource(Resource):
    @jwt_required_and_get_user()
    def get(self, user):
        try:
            cart = Cart.query.filter_by(user_id=user.id).first()
            if not cart:
                # Create empty cart if none exists
                cart = Cart(user_id=user.id)
                db.session.add(cart)
                db.session.commit()

            return cart_schema.dump(cart), 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500

    @jwt_required_and_get_user()
    def post(self, user):
        try:
            data = request.get_json() or {}
            artwork_id = data.get("artworkId")
            quantity = data.get("quantity", 1)

            if not artwork_id:
                return {"message": "artworkId is required"}, 400

            cart = Cart.query.filter_by(user_id=user.id).first()
            if not cart:
                cart = Cart(user_id=user.id)
                db.session.add(cart)
                db.session.commit()

            # Check if item already in cart
            cart_item = CartItem.query.filter_by(cart_id=cart.id, artwork_id=artwork_id).first()
            if cart_item:
                cart_item.quantity += quantity
            else:
                cart_item = CartItem(
                    cart_id=cart.id,
                    artwork_id=artwork_id,
                    quantity=quantity
                )
                db.session.add(cart_item)

            db.session.commit()
            return cart_schema.dump(cart), 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


class CartItemResource(Resource):
    @jwt_required_and_get_user()
    def patch(self, user, artwork_id):
        try:
            data = request.get_json() or {}
            quantity = data.get("quantity")

            if quantity is None:
                return {"message": "quantity is required"}, 400

            cart = Cart.query.filter_by(user_id=user.id).first()
            if not cart:
                return {"message": "Cart not found"}, 404

            cart_item = CartItem.query.filter_by(cart_id=cart.id, artwork_id=artwork_id).first()
            if not cart_item:
                return {"message": "Item not found in cart"}, 404

            if quantity <= 0:
                db.session.delete(cart_item)
            else:
                cart_item.quantity = quantity

            db.session.commit()
            return cart_schema.dump(cart), 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500

    @jwt_required_and_get_user()
    def delete(self, user, artwork_id):
        try:
            cart = Cart.query.filter_by(user_id=user.id).first()
            if not cart:
                return {"message": "Cart not found"}, 404

            cart_item = CartItem.query.filter_by(cart_id=cart.id, artwork_id=artwork_id).first()
            if not cart_item:
                return {"message": "Item not found in cart"}, 404

            db.session.delete(cart_item)
            db.session.commit()
            return cart_schema.dump(cart), 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500
