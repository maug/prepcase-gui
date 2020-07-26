import os
import os.path
import globals


def list_cases(case_dirs):
    """
    Scan case_dirs (and home dir) and return case dirs grouped by case_dirs
    :param case_dirs:
    :return:
    """

    case_dirs = case_dirs[:]
    # append home dir
    case_dirs.append('~')
    real_dirs = get_real_case_dirs(case_dirs)
    grouped_dirs = {}
    for directory in real_dirs:
        grouped_dirs[directory] = []
        # list subdirectories
        res = globals.ssh.ssh_execute('cd ' + directory + ' && ls -1d */', [])
        if (res['return_code']) == 0:
            subdirs = filter(len, res['stdout'].strip().split('\n'))
            for subdir in subdirs:
                full_path = os.path.join(directory, subdir)
                if is_case_directory(full_path):
                    grouped_dirs[directory].append(full_path)
    return grouped_dirs


def is_case_directory(directory):
    """
    Check if directory is a case
    :param directory:
    :return:
    """
    res = globals.ssh.ssh_execute('cd ' + directory + ' && test -f README.case && test -r README.case', [])
    return res['return_code'] == 0


def get_real_case_dirs(case_dirs):
    """
    Convert case_dirs to real path names, remove duplicates
    """

    # convert to real path names
    real_dirs = []
    for directory in case_dirs:
        res = globals.ssh.ssh_execute('readlink', ['-e', directory])
        if (res['return_code']) == 0:
            real_dirs.append(res['stdout'].strip())

    # remove duplicates & sort
    real_dirs = sorted(list(set(real_dirs)))

    return real_dirs


def copy_case(src, dst):
    """
    Copies case from src to dst
    """
    src = src.rstrip('/')
    dst = dst.rstrip('/')
    src_parent = os.path.dirname(src)
    src_dir = os.path.basename(src)
    res = globals.ssh.ssh_execute('cd ' + src_parent + ' && cp', ['-R', src_dir, dst])
    return res
