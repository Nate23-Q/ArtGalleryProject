from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..models.user import User
from ..extensions import db


def jwt_required_and_get_user():
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = db.session.get(User, user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404
            return fn(user, *args, **kwargs)
        return wrapper
    return decorator


def role_required(roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = db.session.get(User, user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404
            if user.role not in roles:
                return jsonify({"message": "Access denied"}), 403
            return fn(user, *args, **kwargs)
        return wrapper
    return decorator
