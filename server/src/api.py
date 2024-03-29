from flask import Flask, session, request
from flask.helpers import safe_join
from flask_jsonrpc import JSONRPC
from flask_jsonrpc.helpers import make_response
from flask_cors import CORS, cross_origin
from flask_session import Session
import logging
from logging import Formatter, FileHandler
import glob
import os
import json
import tempfile
import logging
import time

import globals
import env
import auth
import cases
import cylc
import namelists
import scripts



def launch_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.urandom(64)
    app.config['SESSION_TYPE'] = 'filesystem'


    file_handler = FileHandler('/tmp/prepcase.log')
    handler = logging.StreamHandler()
    file_handler.setLevel(logging.DEBUG)
    handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(Formatter(
    '%(asctime)s %(levelname)s: %(message)s '
    '[in %(pathname)s:%(lineno)d]'
    ))
    handler.setFormatter(Formatter(
    '%(asctime)s %(levelname)s: %(message)s '
    '[in %(pathname)s:%(lineno)d]'
    ))
    #app.logger.addHandler(handler)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Starting PrepCASE')

    Session(app)
    # Server and client code are served on different ports, CORS is needed to allow setting cookies in browser
    CORS(app, supports_credentials=True, origins=env.CORS_ORIGIN) # CORS on different ports
    jsonrpc = JSONRPC(app, '/', enable_web_browsable_api=True)
    return app, jsonrpc


app, jsonrpc = launch_app()
globals.app = app
globals.jsonrpc = jsonrpc
globals.logger = app.logger
logger = app.logger


class RemoteIOError(Exception):
    pass


@app.before_request
def before_request():
    session.permanent = env.SESSION_PERMANENT
    if not auth.check_user_logged():
        data = json.loads(request.data)
        if data['method'] not in ['App.check_logged', 'App.login', 'App.tools_parameters', 'App.get_server_config']:
            return make_response("__not_logged__")
    else:
        if os.getenv('USER') == 'piotr': return  # TODO: cli testing
        globals.ssh.set_user(auth.user['username'])
        globals.ssh.set_host(auth.user['hostname'])
        globals.ssh_cylc.set_user(auth.user['username'])
        globals.ssh_cylc.set_hostname(env.CYLC_HOST)


@jsonrpc.method('App.check_logged')
def check_logged():
    """
    Returns false if user is not logged in, otherwise user object.
    """
    if os.getenv('USER') == 'piotr': return True  # TODO: cli testing
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
PROCESS_PID=$$
echo $PROCESS_PID >{pid_path}

echo ===== PROCESS_PID=$PROCESS_PID

PROCESS_INFO_DIR={suite_path}/.running_scripts/$PROCESS_PID
mkdir -p $PROCESS_INFO_DIR

ln -s {output_path} $PROCESS_INFO_DIR/output.txt
date +%s >$PROCESS_INFO_DIR/start_time.txt

cd $(dirname "{suite_path}/{script_path}")
{suite_path}/{script_path}

echo $?          >$PROCESS_INFO_DIR/exit_code.txt
mv -f {output_path} $PROCESS_INFO_DIR/output.txt
"""


def script_to_start_script(suite_path, script_path, parameters, output_path, pid_path):
    env = '\n'.join('export ' + e['name']  + '=' + quote(e['value']) for e in parameters['environment_parameters'])
    script = SCRIPT_TO_START_SCRIPT.format(suite_path=suite_path, script_path=script_path, output_path=output_path, pid_path=pid_path)
    return '\n'.join((env, script))


def save_to_remote_file(s, remote_path):
    try:
        fd, temp_path = tempfile.mkstemp()
        with os.fdopen(fd, 'w') as f:
            f.write(s)
            f.close()
        result = globals.ssh.scp_to_remote(temp_path, remote_path)
        if result['return_code']:
            logger.error('save_to_remote_file: ' + str(esult['return_code']))
            raise RemoteIOError(result)
    finally:
        os.remove(temp_path)


def read_remote_file(remote_path):
    try:
        fd, temp_path = tempfile.mkstemp()
        result = globals.ssh.scp_from_remote(remote_path, temp_path)
        if result['return_code']:
            raise RemoteIOError(result)
        with open(temp_path) as f:
            return f.read()
    finally:
        os.remove(temp_path)


def remote_mktemp(template, tmpdir='/tmp'):
    result = globals.ssh.ssh_execute('mkdir -p ' + tmpdir + ' && mktemp -p ' + tmpdir + ' ' + template)
    temp_file_path = result['stdout'].strip()
    return temp_file_path



@jsonrpc.method('App.run_script_in_suite_with_environment_parameters')
def run_script_in_suite_with_environment_parameters(suite_path, script_path, parameters):
    """
    Run script in case directory.
    Parameters should have property environment_parameters which is an array of objects with props "name" and "value".

    Returns PID
    import pdb; pdb.set_trace()
    """
    app.logger.info('=== Executing script ' + script_path + ' in suite ' + suite_path)

    suite_temp_path = safe_join(suite_path, '.tmp')

    pid_path = remote_mktemp('pid_path.XXXX', suite_temp_path)
    app.logger.info('=== pid_path: ' + pid_path)

    output_path = remote_mktemp('process_output.XXXX', suite_temp_path)
    app.logger.info('=== output_path: ' + output_path)

    starter_script = script_to_start_script(suite_path, script_path, parameters, output_path, pid_path)
    app.logger.info('=== starter_script: ' + starter_script)

    target_starter_path = remote_mktemp("prepcase_starter.XXXX")
    save_to_remote_file(starter_script, target_starter_path)
    result = globals.ssh.ssh_execute('nohup sh ' + target_starter_path + ' >' + output_path + ' 2>&1 </dev/null &')

    try:
        """
        pid = None
        while not pid:
            try:
                pid = read_remote_file(pid_path).strip()
                if not pid:
                    time.sleep(1)
            except RemoteIOError as e:
                time.sleep(1)
        """
        pid = read_remote_file(pid_path).strip()
        process_info_path = process_path(suite_path, pid, "process.json")
        process_info = dict(script_path=script_path, pid=pid, parameters=parameters)
        save_to_remote_file(json.dumps(process_info), process_info_path)
        return pid
    except IndexError:
        raise Exception('Unexpected output of prepcase_starter.sh: ' + result['stdout'])


def is_int(s):
    try:
        int(s)
        return True
    except ValueError:
        return False


def process_status(pid):
    result = globals.ssh.ssh_execute('ps', [str(pid)])
    if result['return_code']:
        return 'COMPLETE'
    else:
        return result['stdout'].split('\n')[1].split()[2]


def running_scripts_path(suite_path):
    return os.path.join(suite_path, ".running_scripts")


def process_info_dir(suite_path, pid):
    return os.path.join(running_scripts_path(suite_path), str(pid))


def process_path(suite_path, pid, path_name):
    return os.path.join(process_info_dir(suite_path, pid), path_name)


def exit_code(suite_path, pid):
    return int(read_remote_file(process_path(suite_path, pid, 'exit_code.txt')))


def process_info(suite_path, pid):
    info = {'pid': pid}
    try:
        s = read_remote_file(process_path(suite_path, pid, 'process.json'))
        info = json.loads(s)
        info['pid'] = pid
        info['exit_code'] = 'unknown'
        info['status'] = process_status(pid)
        if info['status'] == 'COMPLETE':
            try:
                info['exit_code'] = exit_code(suite_path, pid)
            except RemoteIOError:
                pass

        start_time = read_remote_file(process_path(suite_path, pid, 'start_time.txt'))
        info['start_time'] = int(start_time)

        result = globals.ssh.ssh_execute("date +%s")

        current_time = int(result['stdout'])
        info['current_time'] = current_time
    except RemoteIOError as e:
        raise e
    return info


def suite_processes(suite_path):
    running_scripts = running_scripts_path(suite_path)
    result = globals.ssh.ssh_execute('mkdir -p ' + str(running_scripts) + ' && ls', [running_scripts])
    if result['return_code']:
        raise Exception(result)
    output = result['stdout']
    pids = [int(w) for w in output.split() if is_int(w)]
    return pids


@jsonrpc.method('App.show_script_executions_for_suite')
def show_script_executions_for_suite(suite_path):
    """
    Returns, for each process, PID, script, start date, current date, status (running or not), exit code
    """
    return [process_info(suite_path, d) for d in suite_processes(suite_path)]


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
    pi = process_info(suite_path, pid)
    output = read_remote_file(process_path(suite_path, pid, 'output.txt'))
    pi['output_lines'] = output.splitlines()[output_start_line: output_start_line + max_lines]
    return pi


@jsonrpc.method('App.list_cases')
def list_cases(case_dirs):
    """
    Returns list of user cases grouped by directory
    """
    return cases.list_cases(case_dirs)


@jsonrpc.method('App.add_new_case_path')
def add_new_case_path(new_path):
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
    Returns list of suites read from $HOME/.prepcase.json ("suites_roots"])
    """
    r = {}
    cfg = json.loads(read_remote_file('.prepcase.json'))
    for suites_root in cfg["suites_roots"]:
        result = globals.ssh.ssh_execute('find ' + suites_root + ' -maxdepth 2 -name .prepcase_suite.json')
        suites_paths = [p[:-len('/.prepcase_suite.json')] for p in result['stdout'].split()]
        r[suites_root] = suites_paths
    return r


@jsonrpc.method('App.get_suite')
def get_suite(path):
    """
    Get suite configuration read from .prepcase_suite.json
    """
    cfg = json.loads(read_remote_file(path + '/.prepcase_suite.json'))
    suite = {"path": path, "configuration": cfg}
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
