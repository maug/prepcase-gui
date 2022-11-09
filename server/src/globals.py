import env
from ssh import Ssh

ssh = Ssh()
ssh_cylc = Ssh()

app = None  # Will be set by api.py
