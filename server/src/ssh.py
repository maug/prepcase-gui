import subprocess
import logging

import env

class Ssh:

    def __init__(self):
        self.hostname = ''
        self.options = ''
        self.username = ''

    def set_host(self, host):
        entry = [entry for entry in env.SSH_HOSTS if entry['host'] == host][0]
        self.hostname = entry['host']
        self.options = entry['options']

    def set_user(self, username):
        self.username = username

    def ssh_execute(self, executable, parameters):
        """
        Execute command on remote host via ssh.

        :param command:  a list: executable name and parameters
        """
        if not self.username:
            raise Exception('Username not set')

        command = [executable] + [str(p).strip() for p in parameters]

        cmd = " ".join(command)
        ssh_command = ["ssh", self.options, self.username + "@" + self.hostname, cmd]
        print ssh_command

        logging.info("EXECUTE {}".format(ssh_command))
        return execute(ssh_command)


def execute(command):
    """
    Execute a command.

    :param command:  a list: executable name and parameters
    """

    # Popen doesn't work with empty parameters
    command = filter(len, command)
    p = subprocess.Popen(command, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    stdout, stderr = p.communicate()

    return dict(return_code=p.returncode,
                stdout=stdout,
                stderr=stderr,
                command=" ".join(command))
