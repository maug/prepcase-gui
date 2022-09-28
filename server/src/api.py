from flask import Flask, session, request
from flask.helpers import safe_join
from flask_jsonrpc import JSONRPC
from flask_jsonrpc.helpers import make_response
from flask_cors import CORS, cross_origin
from flask_session import Session
import glob
import os
import json
import tempfile
import logging
logger = logging.getLogger(__name__)

import globals
import env
import auth
import cases
import cylc
import namelists
import scripts

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
        if data['method'] not in ['App.check_logged', 'App.login', 'App.tools_parameters', 'App.get_server_config']:
            return make_response("__not_logged__")
    else:
        # return  # TODO: cli testing
        globals.ssh.set_user(auth.user['username'])
        globals.ssh.set_host(auth.user['hostname'])
        globals.ssh_cylc.set_user(auth.user['username'])
        globals.ssh_cylc.set_hostname(env.CYLC_HOST)


@jsonrpc.method('App.check_logged')
def check_logged():
    """
    Returns false if user is not logged in, otherwise user object.
    """
    # return True  # TODO: cli testing
    if not auth.check_user_logged():
        return False
    else:
        return auth.user


@jsonrpc.method('App.get_server_config')
def get_server_config():
    """
    Gets server config.
    """
    return env.SSH_HOSTS


@jsonrpc.method('App.login')
def login(host, username, password):
    """
    Tries to log in.
    """
    return auth.login_user(host, username, password)


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

# TODO: Add API for reading output of running processes

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


def quote(s):
    # TODO: make sure 's are quoted, etc.
    return '"' + s + '"'

SCRIPT_TO_START_SCRIPT="""
PROCESS_INFO_DIR={suite_path}/.running_scripts/
mkdir -p $PROCESS_INFO_DIR

cd {suite_path}
PROCESS_DIR=$(mktemp -d)
OUTPUT_FILE=$PROCESS_DIR/output.txt

nohup {suite_path}/{script_path} > $OUTPUT_FILE 2>&1 &
PROCESS_PID=$!
echo PROCESS_PID=$PROCESS_PID

mv $PROCESS_DIR $PROCESS_INFO_DIR/$PROCESS_PID
"""

def script_to_start_script(suite_path, script_path, parameters):
    env = '\n'.join('export ' + e['name']  + '=' + quote(e['value']) for e in parameters['environment_parameters'])
    return '\n'.join((env, SCRIPT_TO_START_SCRIPT.format(suite_path=suite_path, script_path=script_path)))


def save_to_remote_file(s, remote_path):
    fd, temp_path = tempfile.mkstemp()
    with os.fdopen(fd, 'w') as f:
        f.write(s)
    result = globals.ssh.scp(temp_path, remote_path)
    if result['return_code']:
        raise Exception(result)
    os.remove(temp_path)


@jsonrpc.method('App.run_script_in_suite_with_environment_parameters')
def run_script_in_suite_with_environment_parameters(suite_path, script_path, parameters):
    """
    Run script in case directory.
    Parameters are accepted as array of strings.

    Returns PID
    """
    # Run with nohup
    # Save output to a file
    # Save PID of the process (parse output of nohup)
    # Save a file with info on
    # - script
    # - PID
    # - parameters
    # - output file
    starter_script = script_to_start_script(suite_path, script_path, parameters)
    target_starter_path = "/tmp/prepcase_starter.sh"
    save_to_remote_file(starter_script, target_starter_path)
    result = globals.ssh.ssh_execute('sh ' + target_starter_path)
    pid = int(result['stdout'].split('=')[1])
    process_info_path = '{suite_path}/.running_scripts/{pid}/process.json'.format(suite_path=suite_path, pid=pid)
    process_info = dict(script_path=script_path, pid=pid, parameters=parameters)
    save_to_remote_file(json.dumps(process_info), process_info_path)
    return pid



@jsonrpc.method('App.show_script_executions_for_suite')
def show_script_executions_for_suite(suite_path):
    """
    Returns, for each process, PID, script, start date, current date, status (running or not), exit code
    """
    pass


@jsonrpc.method('App.show_script_execution_details_for_suite')
def show_script_execution_details_for_suite(suite_path, pid, output_start_line, max_lines):
    """
    Returns, for each process:
        PID,
        script,
        start date,
        current date,
        status (running or not),
        exit code,
        output_lines
    """
    pass


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


@jsonrpc.method('App.copy_case')
def copy_case(src, dst):
    """
    Copies case from src to dst
    """
    return cases.copy_case(src, dst)


@jsonrpc.method('App.submit_with_cylc')
def submit_with_cylc(path, contents, case_dir):
    """
    Creates a CYLC suite with specified content.
    Recursively creates directories if they don't exist.
    Patches env_batch.xml file in case directory.
    Executes cylc run on cylc server.
    """
    res = cylc.create_suite(path, contents)
    if (res['return_code']) != 0:
        return res
    res = cases.patch_env_batch_file(case_dir)
    if (res['return_code']) != 0:
        return res
    res = cylc.run_suite(path)
    return res


@jsonrpc.method('App.get_namelists')
def get_namelists(path):
    res = namelists.remote_read_namelists(path)
    return res


@jsonrpc.method('App.update_namelists')
def update_namelists(caseroot, namelists_):
    res = namelists.remote_update_namelists(caseroot, namelists_)
    return res


@jsonrpc.method('App.run_user_script')
def run_user_script(script):
    res = scripts.run(script)
    return res


@jsonrpc.method('App.list_suites')
def list_suites():
    """
    Returns list of user suites grouped by directory

    TODO: return list of suites read from $HOME/.prepcase.json (user_suites_dir)
    """
    return {
        '~': [
            '/users/maug/suite1',
            '/users/maug/suite2',
        ],
        '/somewhere/else': []
    }


@jsonrpc.method('App.get_suite')
def get_suite(path):
    """
    TODO: This is just a prototype to get Marek going with GUI
    """
    import os
    import json

    file_path = os.path.realpath(__file__)

    p = os.path.join(os.path.dirname(file_path), 'suite_assimilation-atmo-CMCC-master', 'prepcase_suite.json')
    with open(p) as f:
        try:
            prepcase_suite_configuration = json.load(f)
        except BaseException as err:
            raise RuntimeError('Error parsing suite configuration JSON file\nFile: ' + p + '\n' + err.message)
        suite = {"path": path, "configuration": prepcase_suite_configuration}
        return suite


@jsonrpc.method('App.run_suite_script')
def run_suite_script(path, script_path, environment_params):
    # TODO: Run the script in the background
    return


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
