import sqlite3
import subprocess
import os

script_remote = """
import sqlite3

conn = sqlite3.connect('/home/sathishbadri2015/fingeniq/fingeniq.db')
cursor = conn.cursor()

cursor.execute("SELECT id, email, role, accountStatus, failedLoginAttempts, loginCategory FROM users")
rows = cursor.fetchall()
print("All users in DB:")
for r in rows:
    print(r)

# Make sure admin password hash is properly set to Admin@123456
import bcrypt
hashed = bcrypt.hashpw(b"Admin@123456", bcrypt.gensalt(12)).decode('utf-8')

cursor.execute("UPDATE users SET passwordHash = ?, accountStatus = 'active', failedLoginAttempts = 0 WHERE email = 'admin@fingeniq.com'", (hashed,))
conn.commit()
print("Admin password hash and status confirmed!")
"""

with open("temp_check_db.py", "w") as f:
    f.write(script_remote)

subprocess.run(["scp", "-o", "StrictHostKeyChecking=no", "-i", r"C:\Users\daarv\.ssh\id_ed25519", "temp_check_db.py", "sathishbadri2015@136.85.114.150:/home/sathishbadri2015/temp_check_db.py"], check=True)
subprocess.run(["ssh", "-o", "StrictHostKeyChecking=no", "-i", r"C:\Users\daarv\.ssh\id_ed25519", "sathishbadri2015@136.85.114.150", "python3 /home/sathishbadri2015/temp_check_db.py; rm -f /home/sathishbadri2015/temp_check_db.py"], check=True)

if os.path.exists("temp_check_db.py"):
    os.remove("temp_check_db.py")
