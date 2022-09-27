import subprocess
import logging

import env

import utils

class Ssh:

    def __init__(self):
        self.hostname = ''
        self.options = ''
        self.username = ''

    def set_host(self, host):
        entry = [entry for entry in env.SSH_HOSTS if entry['host'] == host][0]
        self.hostname = entry['host']
        self.options = entry['options']

    def set_hostname(self, hostname):
        self.hostname = hostname

    def set_user(self, username):
        self.username = username

    def ssh_execute(self, executable, parameters=[]):
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
        return utils.execute(ssh_command)

    def scp(self, source_file, target_file):
        """
        Copy file to remote host.
        """
        if not self.username:
            raise Exception('Username not set')
        scp_command = ["scp", self.options, source_file, self.username + "@" + self.hostname + ':' + target_file]
        logging.info("EXECUTE {}".format(scp_command))
        return utils.execute(scp_command)
