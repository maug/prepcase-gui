from flask import Flask
from flask.helpers import safe_join
from flask_jsonrpc import JSONRPC
import os

app = Flask(__name__)
jsonrpc = JSONRPC(app, '/api', enable_web_browsable_api=True)

THIS_DIRECTORY = os.path.dirname(os.path.realpath(__file__))

# cesm directory on the server
CESM_DIRECTORY = THIS_DIRECTORY + "/../../../cesm"


@jsonrpc.method('App.list_cases')
def list_cases():
    return ['case-A', 'case-B', 'case-C']


@jsonrpc.method('App.new_case')
def new_case(name, compset, grid, number_of_instances, multi_driver):
    # TODO: correct syntax of a call to new_case on command line
    command = "new_case.sh {} {} {} {} {}".format(name, compset, grid, number_of_instances, multi_driver)
    # TODO: call new_case.sh
    return_code = 0
    return dict(return_code=return_code, command=command)


@jsonrpc.method('App.get_config')
def get_config(path_name):
    absolute_path_name = safe_join(CESM_DIRECTORY, path_name)
    with open(absolute_path_name, "r") as f:
        return dict(path_name=path_name, data=f.read())


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
