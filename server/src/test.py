#!/usr/bin/env python 
from __future__ import print_function

from flask_jsonrpc.proxy import ServiceProxy
server = ServiceProxy('http://localhost:5000/api')

print ("App.list_cases:")
for case in server.App.list_cases()['result']:
    print (case)
