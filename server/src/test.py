#!/usr/bin/env python 
from __future__ import print_function
import json

from flask_jsonrpc.proxy import ServiceProxy

server = ServiceProxy('http://localhost:5000/api')

print ("App.list_cases:")
for case in server.App.list_cases()['result']:
    print (case)

print ("App.run_tool:")
params = {'--name':"case-D", '--compset':"B1850", '--grid':"T31_g37", '--n-inst':1, '--multi_driver':False}
r = server.App.run_tool('create_newcase', params)
print(r)

print('App.get_config')
r = server.App.get_config(path_name="wrong_path_name.xml")
assert 'error' in r
r = server.App.get_config(path_name="cime_config/config_compsets.xml")
assert 'result' in r
assert 'XML' in str(r['result']['data']).upper()

r = server.App.tools_parameters()
print(json.dumps(r['result'], indent=4))

r = server.App.run_tool("query_config", {"--compsets": "cam"})
print (r)
