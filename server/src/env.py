import os

if os.path.exists(os.path.join(os.path.dirname(__file__), '.development')):
    REMOTE_USER = "vagrant"
    REMOTE_HOST = "prepcase.test"
else:
    REMOTE_USER = "pk21219"
    REMOTE_HOST = "athena01"
