# -*- coding: utf-8 -*-

from flask import Flask
from flask_bootstrap import Bootstrap
from flask_moment import Moment

app = Flask('application')

app.jinja_env.trim_blocks = True
app.jinja_env.lstrip_blocks = True
bootstrap = Bootstrap(app)
moment = Moment(app)
from application import views, errors
