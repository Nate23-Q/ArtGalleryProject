from flask import request
from flask_restful import Resource
from ..extensions import db
from ..models.order import Order, OrderSchema, OrderItem
from ..models.artwork import Artwork, ArtworkSchema
from ..utils.decorators import role_required
from ..utils.helpers import paginate_query
from marshmallow import ValidationError

order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)
artwork_schema = ArtworkSchema()
artworks_schema = ArtworkSchema(many=True)


class CustomerOrdersResource(Resource):
    @role_required(["collector"])
    def get(self, user):
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 10))

            query = Order.query.filter_by(customer_id=user.id)
            pagination = paginate_query(query, page, per_page)

            data = orders_schema.dump(pagination.items)
            return {
                "items": data,
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
            }, 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500

    @role_required(["collector"])
    def post(self, user):
        try:
            data = request.get_json() or {}
            items = data.get("items", [])

            if not items:
                return {"message": "At least one item is required"}, 400

            total_amount = 0
            order_items = []

            for item in items:
                artwork_id = item.get("artwork_id")
                quantity = item.get("quantity", 1)

                artwork = Artwork.query.get(artwork_id)
                if not artwork:
                    return {"message": f"Artwork {artwork_id} not found"}, 404

                price = artwork.price * quantity
                total_amount += price

                order_item = OrderItem(
                    artwork_id=artwork_id,
                    quantity=quantity,
                    price=price
                )
                order_items.append(order_item)

            order = Order(
                customer_id=user.id,
                total_amount=total_amount,
                items=order_items
            )

            db.session.add(order)
            db.session.commit()

            # Send email notification (placeholder)
            # send_order_notification(user.email, order)

            return order_schema.dump(order), 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


class CustomerOrderDetailResource(Resource):
    @role_required(["collector"])
    def get(self, user, order_id):
        try:
            order = Order.query.filter_by(id=order_id, customer_id=user.id).first()
            if not order:
                return {"message": "Order not found"}, 404

            return order_schema.dump(order), 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500


class CustomerArtworksResource(Resource):
    @role_required(["collector"])
    def get(self, user):
        try:
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


class CustomerStatsResource(Resource):
    @role_required(["collector"])
    def get(self, user):
        try:
            total_orders = Order.query.filter_by(customer_id=user.id).count()
            total_spent = db.session.query(db.func.sum(Order.total_amount)).filter(
                Order.customer_id == user.id,
                Order.status == 'completed'
            ).scalar() or 0

            return {
                "total_orders": total_orders,
                "total_spent": float(total_spent)
            }, 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500
