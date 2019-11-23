import env
from ssh import Ssh

ssh = Ssh(env.SSH_REMOTE_HOST, env.SSH_OPTIONS)
