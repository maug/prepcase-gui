#!/usr/bin/env python
from __future__ import print_function
import json
import sys

from flask_jsonrpc.proxy import ServiceProxy

server = ServiceProxy('http://localhost:5000')

print ("App.list_cases:")
for case in server.App.list_cases()['result']:
    print (case)

print ("App.run_tool:")
params = ["--case", "/home/vagrant/case_test_name_mynior", "--compset", "X", "--res", "T42_T42_mg17", "--machine", "centos7-linux", "--ninst", "1"]

r = server.App.run_tool('create_newcase', params)
print(r)
print(r['result']['command'])
print(r['result']['stdout'])
print(r['result']['stderr'])
sys.exit(0)

print('App.get_config')
r = server.App.get_config(path_name="wrong_path_name.xml")
assert 'error' in r
r = server.App.get_config(path_name="cime_config/config_compsets.xml")
assert 'result' in r
assert 'XML' in str(r['result']['data']).upper()

r = server.App.tools_parameters()
print(json.dumps(r['result'], indent=4))

r = server.App.run_tool("query_config", ["--compsets", "cam"])
print (r)
