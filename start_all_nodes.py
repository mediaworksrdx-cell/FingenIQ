import subprocess, os, time, sys

for port in [3000, 3001, 3002]:
    try:
        subprocess.run(f"fuser -k -9 {port}/tcp", shell=True, capture_output=True)
    except Exception:
        pass
time.sleep(2)

node_bin = '/home/sathishbadri2015/.nvm/versions/node/v20.20.2/bin/node'

def spawn(cmd, cwd, log_file, env=None):
    log = open(log_file, 'w')
    p_env = os.environ.copy()
    if env:
        p_env.update(env)
    p = subprocess.Popen(
        cmd,
        cwd=cwd,
        env=p_env,
        stdout=log,
        stderr=subprocess.STDOUT,
        stdin=subprocess.DEVNULL,
        start_new_session=True,
        close_fds=True
    )
    print(f"Spawned {cmd} on PID {p.pid}")
    return p

# 1. Aarka (3000)
spawn(
    [node_bin, '/home/sathishbadri2015/aarka-frontend/node_modules/next/dist/bin/next', 'start', '-p', '3000'],
    '/home/sathishbadri2015/aarka-frontend',
    '/home/sathishbadri2015/aarka-frontend/aarka-frontend.log'
)

# 2. FinGenIQ (3001) - Standalone Server
spawn(
    [node_bin, '/home/sathishbadri2015/fingeniq/server.js'],
    '/home/sathishbadri2015/fingeniq',
    '/home/sathishbadri2015/fingeniq/fingeniq.log',
    env={'PORT': '3001', 'NODE_ENV': 'production'}
)

# 3. Synthetix (3002)
spawn(
    [node_bin, '/home/sathishbadri2015/synthetix-site/node_modules/next/dist/bin/next', 'start', '-p', '3002'],
    '/home/sathishbadri2015/synthetix-site',
    '/home/sathishbadri2015/synthetix-site/synthetix-site.log'
)

time.sleep(3)
