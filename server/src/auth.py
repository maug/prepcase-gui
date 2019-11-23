import json
from flask import session
import globals
import cases

user = {
    'username': '',
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
        error_code: '' | 'permission_denied' | 'no_prepcase_file' | 'error'
        error: Error description or empty string
        config: If success, user config from .prepcase.json without password
    )
    """
    global user

    globals.ssh.set_user(username)
    res_ssh = globals.ssh.ssh_execute('cat ~/.prepcase.json', [])

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
            if password_on_server is None:
                res['error_code'] = 'error'
                res['error'] = 'No password in file .prepcase.json'
            elif password != password_on_server:
                res['error_code'] = 'error'
                res['error'] = 'Wrong password'
            else:
                # config file ok and password matches
                user['username'] = username
                user['case_dirs'] = cases.get_real_case_dirs(config.get('case_dirs', []))
                session['user'] = user
                # config for frontend
                res['config'] = user
        except ValueError:
            res['error_code'] = 'error'
            res['error'] = 'File .prepcase.json is malformed'

    return res


def logout_user():
    global user
    session.pop('user')
    user['username'] = ''
