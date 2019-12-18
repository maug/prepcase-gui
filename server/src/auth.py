import json
from flask import session
import env
import globals
import cases

user = {
    'username': '',
    'hostname': '',
    'cesm_env_script': '',
    'cesm_path': '',
    'case_dirs': [],
}


def check_user_logged():
    """
    Checks if user object exists in session
    If so, saves session in global user object
    :return: True/False
    """
    global user
    if 'user' not in session:
        return False
    else:
        user = session.get('user')
    return user['username'] != ''


def login_user(username, password):
    """
    Tries to log in.
    Returns dict(
        error_code: '' | 'permission_denied' | 'no_prepcase_file' | 'invalid_prepcase_file' | 'error'
        error: Error description or empty string
        config: If success, user config from .prepcase.json, without password
    )
    """
    global user

    globals.ssh.set_user(username)
    res_ssh = globals.ssh.ssh_execute('cat ~/.prepcase.json', [])

    res = dict(error_code='', error='', config='', hostname='')

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
            if password_on_server is None:
                res['error_code'] = 'error'
                res['error'] = 'No password in file .prepcase.json'
            elif password != password_on_server:
                res['error_code'] = 'error'
                res['error'] = 'Wrong password'
            else:
                # config file ok and password matches
                user['username'] = username
                user['hostname'] = env.SSH_REMOTE_HOST
                user['cesm_path'] = config.get('cesm_path')
                if user['cesm_path'] is None:
                    raise ValueError
                user['cesm_env_script'] = config.get('cesm_env_script', '')
                user['case_dirs'] = cases.get_real_case_dirs(config.get('case_dirs', []))
                session['user'] = user
                # config for frontend
                res['config'] = user
        except ValueError:
            res['error_code'] = 'invalid_prepcase_file'
            res['error'] = 'File .prepcase.json is malformed'

    return res


def logout_user():
    global user
    session.clear()
    user['username'] = ''


def add_new_case_path(new_path):
    user['case_dirs'] = cases.get_real_case_dirs(user['case_dirs'] + [new_path])
    save_user_config()
    return user['case_dirs']


def save_user_config():
    res_ssh = globals.ssh.ssh_execute('cat ~/.prepcase.json', [])
    if res_ssh['return_code'] == 0:
        config = json.loads(res_ssh['stdout'])
        config['case_dirs'] = user['case_dirs']
        globals.ssh.ssh_execute(
            "echo >~/.prepcase.json '" + json.dumps(config, indent=2) + "' && chmod 600 ~/.prepcase.json", []
        )
