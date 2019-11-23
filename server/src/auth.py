from flask import session

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


def login_user(username, config):
    global user
    user['username'] = username
    user['case_dirs'] = config.get('case_dirs', [])
    session['user'] = user


def logout_user():
    global user
    session.pop('user')
    user['username'] = ''
