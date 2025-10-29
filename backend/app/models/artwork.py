from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID
from ..extensions import db, ma


class Artwork(db.Model):
    __tablename__ = "artworks"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(50))
    image_url = db.Column(db.String(1024))
    artist_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ArtworkSchema(ma.SQLAlchemyAutoSchema):
    created_at = ma.DateTime(format='%Y-%m-%dT%H:%M:%S')

    class Meta:
        model = Artwork
        load_instance = True
        include_fk = True
