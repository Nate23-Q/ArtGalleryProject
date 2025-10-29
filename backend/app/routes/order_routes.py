from flask import request
from flask_restful import Resource
from ..extensions import db
from ..models.order import Order, OrderSchema, OrderItem
from ..models.payment import Payment, PaymentSchema
from ..models.delivery import Delivery, DeliverySchema
from ..models.notification import Notification, NotificationSchema
from ..utils.decorators import jwt_required_and_get_user
from ..utils.helpers import paginate_query
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os

order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)
payment_schema = PaymentSchema()
delivery_schema = DeliverySchema()
notification_schema = NotificationSchema()


class OrdersResource(Resource):
    @jwt_required_and_get_user()
    def get(self, user):
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 10))

            if user.role == "artisan":
                # Artisans see orders for their artworks
                query = Order.query.join(Order.items).filter(OrderItem.artwork.has(artist_id=user.id))
            else:
                # Collectors see their own orders
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


class OrderDetailResource(Resource):
    @jwt_required_and_get_user()
    def get(self, user, order_id):

        try:
            order = Order.query.get(order_id)
            if not order:
                return {"message": "Order not found"}, 404

            # Check permissions
            if user.role == "collector" and order.customer_id != user.id:
                return {"message": "Access denied"}, 403
            elif user.role == "artisan":
                # Check if artisan has artworks in this order
                has_artwork = any(item.artwork.artist_id == user.id for item in order.items)
                if not has_artwork:
                    return {"message": "Access denied"}, 403

            return order_schema.dump(order), 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500

    @jwt_required_and_get_user()
    def put(self, user, order_id):
        try:
            order = Order.query.get(order_id)
            if not order:
                return {"message": "Order not found"}, 404

            # Only allow status updates
            data = request.get_json() or {}
            new_status = data.get("status")

            if new_status:
                order.status = new_status
                db.session.commit()

                # Create notification
                notification = Notification(
                    user_id=order.customer_id,
                    title="Order Status Update",
                    message=f"Your order status has been updated to {new_status}"
                )
                db.session.add(notification)
                db.session.commit()

            return order_schema.dump(order), 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


class PaymentsResource(Resource):
    @jwt_required_and_get_user()
    def get(self, user, order_id):

        try:
            order = Order.query.get(order_id)
            if not order:
                return {"message": "Order not found"}, 404

            if user.role == "collector" and order.customer_id != user.id:
                return {"message": "Access denied"}, 403

            payments = Payment.query.filter_by(order_id=order_id).all()
            return payment_schema.dump(payments, many=True), 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500

    @jwt_required_and_get_user()
    def post(self, user, order_id):
        try:
            order = Order.query.get(order_id)
            if not order:
                return {"message": "Order not found"}, 404

            if user.role == "collector" and order.customer_id != user.id:
                return {"message": "Access denied"}, 403

            data = request.get_json() or {}
            amount = data.get("amount", order.total_amount)
            provider = data.get("provider", "stripe")

            payment = Payment(
                order_id=order_id,
                amount=amount,
                provider=provider,
                status="completed"
            )

            db.session.add(payment)
            db.session.commit()

            return payment_schema.dump(payment), 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


class DeliveriesResource(Resource):
    @jwt_required_and_get_user()
    def get(self, user, order_id):

        try:
            order = Order.query.get(order_id)
            if not order:
                return {"message": "Order not found"}, 404

            if user.role == "collector" and order.customer_id != user.id:
                return {"message": "Access denied"}, 403

            deliveries = Delivery.query.filter_by(order_id=order_id).all()
            return delivery_schema.dump(deliveries, many=True), 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500

    @jwt_required_and_get_user()
    def post(self, user, order_id):
        try:
            order = Order.query.get(order_id)
            if not order:
                return {"message": "Order not found"}, 404

            if user.role == "collector" and order.customer_id != user.id:
                return {"message": "Access denied"}, 403

            data = request.get_json() or {}
            status = data.get("status", "shipped")
            tracking_number = data.get("tracking_number")

            delivery = Delivery(
                order_id=order_id,
                status=status,
                tracking_number=tracking_number
            )

            db.session.add(delivery)
            db.session.commit()

            return delivery_schema.dump(delivery), 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


class NotificationsResource(Resource):
    @jwt_required_and_get_user()
    def get(self, user):

        try:
            notifications = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).all()
            return notification_schema.dump(notifications, many=True), 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500

    @jwt_required_and_get_user()
    def put(self, user, notification_id):
        try:
            notification = Notification.query.filter_by(id=notification_id, user_id=user.id).first()
            if not notification:
                return {"message": "Notification not found"}, 404

            notification.read = True
            db.session.commit()

            return notification_schema.dump(notification), 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


def send_order_notification(email, order):
    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        message = Mail(
            from_email='noreply@artmarket.com',
            to_emails=email,
            subject='Order Confirmation',
            html_content=f'<p>Your order #{order.id} has been placed successfully!</p>'
        )
        sg.send(message)
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
