import os
import os.path
import globals


def list_cases(case_dirs):
    """
    Scan case_dirs and return case dirs grouped by case_dirs
    :param case_dirs:
    :return:
    """

    real_dirs = get_real_case_dirs(case_dirs)
    grouped_dirs = {}
    for directory in real_dirs:
        grouped_dirs[directory] = []
        res = globals.ssh.ssh_execute('find ' + directory + ' -maxdepth 2 -name README.case -exec dirname {} \\;', [])
        if (res['return_code']) == 0:
            if res['stdout'].strip() != '':
                grouped_dirs[directory].extend(sorted(res['stdout'].strip().split('\n')))
    return grouped_dirs


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
    if (res['return_code']) == 0:
        readlink_res = globals.ssh.ssh_execute('cd ' + src_parent + ' && readlink', ['-e', dst])
        if (readlink_res['return_code']) == 0:
            res['stdout'] = readlink_res['stdout'].strip()
    return res


def patch_env_batch_file(case_dir):
    """
    Patches env_batch.xml file, changing:
        <entry id="BATCH_SYSTEM" value="lsf">
    to:
        <entry id="BATCH_SYSTEM" value="none">
    Without this patch, CYLC suite doesn't submit correctly on LSF
    Also, saves original env_batch.xml to env_batch.xml_org if doesn't exist
    """
    file_path = os.path.join(case_dir, 'env_batch.xml')
    file_path_backup = os.path.join(case_dir, 'env_batch.xml_org')
    res = globals.ssh.ssh_execute('cp', ['-n', file_path, file_path_backup])
    if (res['return_code']) != 0:
        return res
    res = globals.ssh.ssh_execute(
        'perl -p -i -e \'s/id="BATCH_SYSTEM" value="lsf"/id="BATCH_SYSTEM" value="none"/\' ' + file_path
    , [])
    return res
