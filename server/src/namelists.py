import os
import os.path
import cime_namelist
import json
import globals
import utils
import tempfile
import shutil
import traceback


# TODO: Need to check what's appropriate limit for a line length.
ONE_LINE_LENGTH_LIMIT_FOR_SERIALIZED_LIST=50

def parse_cime_namelist(file_name):
    with open(file_name) as f:
        text = f.read()
        nml = cime_namelist.parse(text=text, groupless=True)
        return nml


def components(namelists_directory):
    file_names = [fn for fn in list(os.listdir(namelists_directory)) if fn.startswith('user_nl_')]
    comps = set([file_name.split('_')[2] for file_name in file_names])
    return {comp: [{
                    'filename': file_name,
                    'parsed': parse_cime_namelist(os.path.join(namelists_directory, file_name))
                   }
                   for file_name in file_names
                   if comp in file_name
                  ]
            for comp in comps}


def read_namelists(namelists_directory):
    return {'namelists': components(namelists_directory)}


def serialize_proper_list(l):
    one_line = ' ' + ','.join(l)
    if len(one_line) < ONE_LINE_LENGTH_LIMIT_FOR_SERIALIZED_LIST:
        return one_line
    return '\n' + '\n'.join([' ' + str(e) for e in l])


def serialize_pair(key, value):
    # Value in json is always a list, this is the same as in the output of the CIME parser.
    return (key + ' =' + serialize_proper_list(value)
            if type(value) == type([]) and len(value) > 1
            else key + ' = ' + value[0])


def serialize_namelist(parsed):
    return "\n".join([serialize_pair(key, value) for (key, value) in parsed.items()]) + '\n'


def write_namelists(namelists_directory, namelists):
    for (component, files) in namelists.items():
        for file in files:
            filename, parsed = file['filename'], file['parsed']
            with open(os.path.join(namelists_directory, filename), 'w') as f:
                f.write(serialize_namelist(parsed))


def test_all():
    namelists = read_namelists("sample_namelists")
    json_string = json.dumps(namelists, indent=4, sort_keys=True)
    with open('namelists.json', 'w') as f:
        f.write(json_string)
    with open('namelists.json') as f:
        namelists = json.load(f)
        write_namelists('test', namelists['namelists'])


def remote_read_namelists(path):
    temp_nl_dir = str(tempfile.mkdtemp())
    res = globals.ssh.ssh_execute('cd ' + path + ' && tar cf namelists_archive.tar user_nl_*', [])
    res = utils.execute(['scp', globals.ssh.username + '@' + globals.ssh.hostname + ':' + path + '/namelists_archive.tar', temp_nl_dir + '/namelists_archive.tar'])
    res = utils.execute(['tar',  'xf', temp_nl_dir + '/namelists_archive.tar', '-C', temp_nl_dir])
    r = read_namelists(temp_nl_dir)
    shutil.rmtree(temp_nl_dir)
    return r


def remote_update_namelists(path, namelists_):
    temp_nl_dir = str(tempfile.mkdtemp())
    write_namelists(temp_nl_dir, namelists_)
    file_names = [fn for fn in list(os.listdir(temp_nl_dir)) if fn.startswith('user_nl_')]
    for file_name in file_names:
        res = utils.execute(['scp', temp_nl_dir + '/' + file_name, globals.ssh.username + '@' + globals.ssh.hostname + ':' + path + '/'])
    #shutil.rmtree(temp_nl_dir)
    res = { 'namelists': namelists_ }
    with open('/tmp/remote_update_namelists.json', 'w') as f:
        f.write(json.dumps(res, indent=4, sort_keys=True))
    return res


if __name__ == '__main__':
    test_all()
