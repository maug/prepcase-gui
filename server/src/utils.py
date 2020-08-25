import subprocess


def execute(command):
    """
    Execute a command.

    :param command:  a list: executable name and parameters
    """

    # Popen doesn't work with empty parameters
    command = filter(len, command)
    p = subprocess.Popen(command, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    stdout, stderr = p.communicate()

    result = dict(return_code=p.returncode,
                  stdout=stdout,
                  stderr=stderr,
                  command=" ".join(command))

    print result  # log into /var/log/httpd/prepcase-error.log
    return result
