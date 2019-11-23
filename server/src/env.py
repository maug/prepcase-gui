import os

if os.path.exists(os.path.join(os.path.dirname(__file__), '.development')):
    # Host to execute ssh commands
    SSH_REMOTE_HOST = "prepcase.test"

    # Options for ssh
    SSH_OPTIONS = ""

    # URL of GUI in the browser (to allow requests to server on different port)
    CORS_ORIGIN = 'http://localhost:4200'

    # Should the user be logged out after closing browser window?
    SESSION_PERMANENT = True
else:
    # REMOTE_USER = "pk21219"
    SSH_REMOTE_HOST = "athena01"
    SSH_OPTIONS = ""
    CORS_ORIGIN = 'http://prepcase.cmcc.scc'
    SESSION_PERMANENT = False
