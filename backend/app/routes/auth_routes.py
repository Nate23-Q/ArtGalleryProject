from flask import request
from flask_restful import Resource
from ..extensions import db
from ..models.user import User, UserSchema
from flask_jwt_extended import create_access_token
from marshmallow import ValidationError


user_schema = UserSchema()


class RegisterResource(Resource):
    def post(self):
        try:
            data = request.get_json() or {}
            fullName = data.get("fullName")
            email = data.get("email")
            password = data.get("password")
            role = data.get("role", "collector")

            if not fullName or not email or not password:
                return {"message": "fullName, email and password are required"}, 400

            if role not in ["artisan", "collector"]:
                return {"message": "role must be 'artisan' or 'collector'"}, 400

            username = fullName.replace(" ", "").lower()  # Generate username from fullName

            if User.query.filter((User.username == username) | (User.email == email)).first():
                return {"message": "user with that username or email already exists"}, 400

            user = User(username=username, email=email, role=role)
            user.set_password(password)

            db.session.add(user)
            db.session.commit()

            return {"user": user_schema.dump(user), "access_token": create_access_token(identity=str(user.id))}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


class LoginResource(Resource):
    def post(self):
        try:
            data = request.get_json() or {}
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return {"message": "email and password required"}, 400

            user = User.query.filter(User.email == email).first()
            if not user or not user.check_password(password):
                return {"message": "invalid credentials"}, 401

            access_token = create_access_token(identity=str(user.id))
            return {"user": user_schema.dump(user), "access_token": access_token}, 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500
