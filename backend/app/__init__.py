import os

from app.blueprint import register_routing
from app.db import mongo
from app.extention import cors
from app.utils.logging import configure_logging
from flask import Flask


def create_app(settings_module):
    app = Flask(__name__)
    app.config.from_object(settings_module)
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Set max upload size to 16 MB

    # Initialize the extensions
    mongo.init_app(app)
    cors.init_app(app, supports_credentials="true", resources={r"*": {"origins": "http://localhost:3000"}})

    # Logging configuration
    configure_logging(app)

    # Register Blueprint
    register_routing(app)

    return app


settings_module = os.getenv("APP_SETTINGS_MODULE")
app = create_app(settings_module)
