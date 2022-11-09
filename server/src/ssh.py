import subprocess

import env
import utils
import globals


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

        globals.logger.info("EXECUTE {}".format(ssh_command))
        return utils.execute(ssh_command)

    def scp_to_remote(self, local_file, remote_file):
        """
        Copy file to remote host.
        """
        if not self.username:
            raise Exception('Username not set')
        scp_command = ["scp", self.options, local_file, self.username + "@" + self.hostname + ':' + remote_file]
        globals.logger.info("EXECUTE {}".format(scp_command))
        return utils.execute(scp_command)

    def scp_from_remote(self, remote_file, local_file):
        """
        Copy file from remote host.
        """
        if not self.username:
            raise Exception('Username not set')
        scp_command = ["scp", self.options, self.username + "@" + self.hostname + ':' + remote_file, local_file]
        globals.logger.info("EXECUTE {}".format(scp_command))
        return utils.execute(scp_command)

