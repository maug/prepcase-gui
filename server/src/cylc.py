import os
import os.path
import globals
import utils


def create_suite(path, contents):
    """
    Creates a suite with specified contents
    :param path:
    :param contents:
    :return:
    """
    res = globals.ssh.ssh_execute('mkdir -p ' + path, [])
    if (res['return_code']) != 0:
        return res

    res = globals.ssh.ssh_execute('mktemp', [])
    if (res['return_code']) != 0:
        return res

    tmp_filename = res['stdout']
    f = open(tmp_filename, 'w')
    f.write(contents)
    f.close()

    command = [
        'scp',
        tmp_filename,
        globals.ssh.username + '@' + globals.ssh.hostname + ':' + os.path.join(path, 'suite.rc')
    ]
    res = utils.execute(command)
    return res


def run_suite(path):
    """
    Runs CYLC suite
    :param path:
    :return:
    """
    res = globals.ssh_cylc.ssh_execute('cd ' + path + ' && cylc run', [])
    return res
