from flask import Flask
from flask_jsonrpc import JSONRPC

app = Flask(__name__)
jsonrpc = JSONRPC(app, '/api', enable_web_browsable_api=True)

@jsonrpc.method('App.list_cases')
def list_cases():
    return ['case-A', 'case-B', 'case-C']

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
