import os

if os.path.exists(os.path.join(os.path.dirname(__file__), '.development')):
    SSH_HOSTS = [
        {
            'host': 'prepcase.test',  # Host to execute ssh commands
            'options': ''  # Options for ssh
        },
    ]

    # URL of GUI in the browser (to allow requests to server on different port)
    CORS_ORIGIN = 'http://localhost:4200'

    # Should the user be logged out after closing browser window (True = no, False = yes)?
    SESSION_PERMANENT = True
else:
    SSH_HOSTS = [
        {
            'host': 'athena01.cmcc.scc',
            'options': ''
        },
        {
            'host': 'zeus01.cmcc.scc',
            'options': ''
        },
        {
            'host': 'zeus02.cmcc.scc',
            'options': ''
        },
        {
            'host': 'zeus.cmcc.scc',
            'options': ''
        },
    ]
    CORS_ORIGIN = 'http://prepcase.cmcc.scc'
    SESSION_PERMANENT = False
