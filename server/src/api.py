from flask import Flask
from flask.helpers import safe_join
from flask_jsonrpc import JSONRPC
import os
import json

app = Flask(__name__)
jsonrpc = JSONRPC(app, '/api', enable_web_browsable_api=True)

THIS_DIRECTORY = os.path.dirname(os.path.realpath(__file__))

# cesm directory on the server
CESM_DIRECTORY = THIS_DIRECTORY + "/../../../cesm"
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
    Run one of the CESM tools
    """
    return_code = 0
    command = tool + "..." # TODO
    return dict(return_code=return_code, command=command)


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
