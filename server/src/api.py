from flask import Flask
from flask.helpers import safe_join
from flask_jsonrpc import JSONRPC
from flask_cors import CORS
import os
import json
import subprocess
from operator import add
import logging

app = Flask(__name__)
CORS(app) # allow CORS for all domains (FOR DEVELOPMENT SERVER)
jsonrpc = JSONRPC(app, '/api', enable_web_browsable_api=True)

# cesm directory on the server
CESM_DIRECTORY = "cesm" 
CIME_DIRECTORY = "cesm/cime"
CESM_TOOLS = 'create_clone create_test query_testlists create_newcase query_config'.split()

@jsonrpc.method('App.tools_parameters')
def tools_parameters():
    """
    Return definitions of arguments of CESM tools.
    """

    def read_config(tool):
        config_file = 'config/' + tool + '_parameters.json'
        with open(config_file) as f:
            return json.load(open(config_file))

    return dict([(tool, read_config(tool)) for tool in CESM_TOOLS])


def execute(command):
    """
    Execute a command.

    :param command:  a list: executable name and parameters
    """
    p = subprocess.Popen(command, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    stdout, stderr = p.communicate()

    return dict(return_code=p.returncode,
                stdout=stdout,
                stderr=stderr,
                command=" ".join(command))

@jsonrpc.method('App.run_tool')
def run_tool(tool, parameters):
    """
    Run one of the supported command line tools.
    Parameters are accepted as array of strings.
    """
    executable = safe_join(CIME_DIRECTORY, "scripts", tool)
    command = [executable] + [str(p).strip() for p in parameters]
    command = [txt for txt in command if txt] # Popen doesn't work with empty parameters

    cmd = " ".join(command)
    ssh_command = ["ssh", "vagrant@prepcase.test"] + [cmd]

    logging.info("EXECUTE {}".format(ssh_command))
    return execute(ssh_command)


@jsonrpc.method('App.list_cases')
def list_cases():
    """
    TODO: List existing user's cases.
    """
    return ['case-A', 'case-B', 'case-C']


@jsonrpc.method('App.get_config')
def get_config(path_name):
    """
    Return content of XML file in CESM directory
    """
    absolute_path_name = safe_join(CESM_DIRECTORY, path_name)
    with open(absolute_path_name, "r") as f:
        return dict(path_name=path_name, data=f.read())


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
