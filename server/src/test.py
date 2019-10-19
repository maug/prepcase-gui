#!/usr/bin/env python 
from __future__ import print_function

from flask_jsonrpc.proxy import ServiceProxy

server = ServiceProxy('http://localhost:5000/api')

print ("App.list_cases:")
for case in server.App.list_cases()['result']:
    print (case)

print ("App.new_case:")
r = server.App.new_case(name="case-D", compset="B1850", grid="T31_g37", number_of_instances=1, multi_driver=False)['result']
print(r['command'], '=>', r['return_code'])


print ("App.new_case:")
r = server.App.new_case(name="case-D", compset="B1850", grid="T31_g37", number_of_instances=1, multi_driver=False)['result']

print('App.get_config')
r = server.App.get_config(path_name="wrong_path_name.xml")
assert 'error' in r
r = server.App.get_config(path_name="cime_config/config_compsets.xml")
assert 'result' in r
assert 'XML' in str(r['result']['data']).upper()

