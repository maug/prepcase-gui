from flask import Flask, session, request
from flask.helpers import safe_join
from flask_jsonrpc import JSONRPC
from flask_jsonrpc.helpers import make_response
from flask_cors import CORS, cross_origin
from flask_session import Session
import os
import json

from ssh import Ssh
import env
import auth

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(64)
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
# Server and client code are served on different ports, CORS is needed to allow setting cookies in browser
CORS(app, supports_credentials=True, origins=env.CORS_ORIGIN) # CORS on different ports
jsonrpc = JSONRPC(app, '/', enable_web_browsable_api=True)

# CESM directory on the server
CESM_DIRECTORY = "cesm"
CIME_DIRECTORY = "cesm/cime"
CESM_TOOLS = 'create_clone create_test query_testlists create_newcase query_config'.split()

ssh = Ssh(env.SSH_REMOTE_HOST, env.SSH_OPTIONS)

# def jsonrcp_headers(fn):
#     def wrapped(*args, **kwargs):
#         response = make_response(fn(*args, **kwargs))
#         response.headers['Access-Control-Allow-Origin'] = 'http://localhost:4200'
#         response.headers['Access-Control-Allow-Credentials'] = 'true'
#         # response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
#         # response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
#         # response.headers['Access-Control-Max-Age'] = '1728000'
#         # response.headers['Set-Cookie'] = 'dupa=kupa; Expires=Mon, 23-Dec-2019 20:26:02 GMT; Domain=zacheta; Path=/; SameSite=Lax'
#         return response
#     return wrapped

@app.before_request
def before_request():
    session.permanent = env.SESSION_PERMANENT
    global ssh
    if not auth.check_user_logged():
        data = json.loads(request.data)
        if data['method'] not in ['App.login', 'App.tools_parameters']:
            return make_response("__not_logged__")
    else:
        ssh.set_user(auth.user['username'])


@jsonrpc.method('App.login')
#@jsonrcp_headers
def login(username, password):
    """
    Tries to log in.
    """

    ssh.set_user(username)
    res_ssh = ssh.ssh_execute('cat ~/.prepcase.json', [])

    res = dict(error_code='', error='', config='')

    if res_ssh['return_code'] == 255:
        res['error_code'] = 'permission_denied'
        res['error'] = 'Wrong username or no public key logging set'
    elif res_ssh['return_code'] == 1:
        res['error_code'] = 'no_prepcase_file'
        res['error'] = 'No .prepcase.json file in home directory'
    elif res_ssh['return_code'] != 0:
        res['error_code'] = 'error'
        res['error'] = res_ssh['stderr']
    else:
        try:
            config = json.loads(res_ssh['stdout'])
            password_on_server = config.pop('password') # read & remove password form config
            print 'password', password_on_server
            if password_on_server is None:
                res['error_code'] = 'error'
                res['error'] = 'No password in file .prepcase.json'
            elif password != password_on_server:
                res['error_code'] = 'error'
                res['error'] = 'Wrong password'
            else:
                # password matches
                res['config'] = config # config for frontend (without password)
                auth.login_user(username, config)
        except ValueError:
            res['error_code'] = 'error'
            res['error'] = 'File .prepcase.json is malformed'

    return res


@jsonrpc.method('App.tools_parameters')
#@jsonrcp_headers
def tools_parameters():
    """
    Return definitions of arguments of CESM tools.
    """

    def read_config(tool):
        config_file = os.path.join(os.path.dirname(__file__), 'config/' + tool + '_parameters.json')
        with open(config_file) as f:
            return json.load(open(config_file))

    return dict([(tool, read_config(tool)) for tool in CESM_TOOLS])


@jsonrpc.method('App.run_tool')
def run_tool(tool, parameters):
    """
    Run one of the supported command line tools.
    Parameters are accepted as array of strings.
    """
    executable = safe_join(CIME_DIRECTORY, "scripts", tool)
    return ssh.ssh_execute(executable, parameters)


@jsonrpc.method('App.run_script_in_case')
def run_script_in_case(case_path, script, parameters):
    """
    Run script in case directory.
    Parameters are accepted as array of strings.
    """
    executable = safe_join(case_path, script)
    return ssh.ssh_execute("cd " + case_path + " && " + executable, parameters)


@jsonrpc.method('App.list_cases')
def list_cases():
    """
    TODO: List existing user's cases.
    """
    return ['case-A', 'case-B', 'case-C']


@jsonrpc.method('App.get_config')
def get_config(path_name):
    """
    Return content of XML file in CESM directory
    """
    absolute_path_name = safe_join(CESM_DIRECTORY, path_name)
    with open(absolute_path_name, "r") as f:
        return dict(path_name=path_name, data=f.read())


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
