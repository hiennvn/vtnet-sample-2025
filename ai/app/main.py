from chainlit.utils import mount_chainlit

from .api import app

mount_chainlit(app, 'app/chainlit.py', '/chainlit')
