from flask import Flask
from flask.helpers import safe_join
from flask_jsonrpc import JSONRPC
import os
import json
import subprocess
from operator import add

app = Flask(__name__)
jsonrpc = JSONRPC(app, '/api', enable_web_browsable_api=True)

THIS_DIRECTORY = os.path.dirname(os.path.realpath(__file__))

# cesm directory on the server
CESM_DIRECTORY = os.path.join(THIS_DIRECTORY, "../../../cesm")
CIME_DIRECTORY = os.path.join(CESM_DIRECTORY, "cime")
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


@jsonrpc.method('App.run_tool')
def run_tool(tool, parameters):
    """
    Run one of the supported command line tools.
    """
    executable = safe_join(CIME_DIRECTORY, "scripts", tool)
    args = reduce(add, [[k, str(v)] for k, v in parameters.items()])
    command = [executable] + args
    command = [txt for txt in command if txt.strip() != ""] # Popen doesn't work with empty parameters

    p = subprocess.Popen(command, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    stdout, stderr = p.communicate()

    return dict(return_code=p.returncode,
                stdout=stdout,
                stderr=stderr,
                command=" ".join(command))


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
