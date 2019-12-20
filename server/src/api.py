from flask import Flask, session, request
from flask.helpers import safe_join
from flask_jsonrpc import JSONRPC
from flask_jsonrpc.helpers import make_response
from flask_cors import CORS, cross_origin
from flask_session import Session
import glob
import os
import json

import globals
import env
import auth
import cases

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(64)
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
# Server and client code are served on different ports, CORS is needed to allow setting cookies in browser
CORS(app, supports_credentials=True, origins=env.CORS_ORIGIN) # CORS on different ports
jsonrpc = JSONRPC(app, '/', enable_web_browsable_api=True)

@app.before_request
def before_request():
    session.permanent = env.SESSION_PERMANENT
    if not auth.check_user_logged():
        data = json.loads(request.data)
        if data['method'] not in ['App.login', 'App.tools_parameters']:
            return make_response("__not_logged__")
    else:
        globals.ssh.set_user(auth.user['username'])


@jsonrpc.method('App.login')
def login(username, password):
    """
    Tries to log in.
    """
    return auth.login_user(username, password)


@jsonrpc.method('App.logout')
def logout():
    """
    Logs out user (if logged in).
    """
    auth.logout_user()


@jsonrpc.method('App.tools_parameters')
def tools_parameters():
    """
    Return definitions of arguments of CESM tools.
    """

    def read_config(config_file):
        with open(config_file) as f:
            return json.load(open(config_file))

    files = [f for f in glob.glob(os.path.join(os.path.dirname(__file__), 'config/*.json'))]
    return dict([(os.path.basename(f).replace('.json', ''), read_config(f)) for f in files])


@jsonrpc.method('App.run_tool')
def run_tool(tool, parameters):
    """
    Run one of the supported command line tools.
    Parameters are accepted as array of strings.
    """
    executables = []
    if auth.user['cesm_env_script']:
        executables.append('source ' + auth.user['cesm_env_script'] + ' >/dev/null')
    executables.append(safe_join(auth.user['cesm_path'], 'cime', "scripts", tool))
    return globals.ssh.ssh_execute(' && '.join(executables), parameters)


@jsonrpc.method('App.run_script_in_case')
def run_script_in_case(case_path, script, parameters):
    """
    Run script in case directory.
    Parameters are accepted as array of strings.
    """
    executables = []
    if auth.user['cesm_env_script']:
        executables.append('source ' + auth.user['cesm_env_script'] + ' >/dev/null')
    executables.append('cd ' + case_path)
    executables.append(safe_join(case_path, script))
    return globals.ssh.ssh_execute(' && '.join(executables), parameters)


@jsonrpc.method('App.list_cases')
def list_cases(case_dirs):
    """
    Returns list of user cases grouped by directory
    """
    return cases.list_cases(case_dirs)


@jsonrpc.method('App.add_new_case_path')
def list_cases(new_path):
    """
    Adds new path to user case paths
    """
    return auth.add_new_case_path(new_path)


# DEPRECATED
# @jsonrpc.method('App.get_config')
# def get_config(path_name):
#     """
#     Return content of XML file in CESM directory
#     """
#     absolute_path_name = safe_join(CESM_DIRECTORY, path_name)
#     with open(absolute_path_name, "r") as f:
#         return dict(path_name=path_name, data=f.read())


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
