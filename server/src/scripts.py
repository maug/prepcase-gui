import globals
import auth


def list_scripts(scripts_dir):
    """
    Scan scripts_dir and return a list
    :param scripts_dir:
    :return: Array of paths to scripts
    """

    if scripts_dir == '':
        return []

    res = globals.ssh.ssh_execute('find', [scripts_dir, '-maxdepth', '1', '-executable', '-type', 'f', '-printf', '%P\n'])
    lines = res['stdout'].strip().split('\n')
    return filter(len, lines)


def run(script):
    return globals.ssh.ssh_execute('cd', [auth.user['user_scripts_dir'], '&&', './' + script])
