import os
import time

search_paths = [
    r'C:\Users\daarv\Desktop',
    r'C:\Users\daarv\OneDrive\Desktop',
    r'C:\Users\daarv\Downloads',
    r'C:\Users\daarv\Documents',
    r'C:\Users\daarv',
    r'C:\Users\daarv\.gemini\antigravity\scratch',
    r'C:\projects',
    r'C:\src',
    r'D:\\' if os.path.exists('D:\\') else None,
    r'E:\\' if os.path.exists('E:\\') else None,
]

keywords = ['fingen', 'aarka', 'synthetix']

print('Searching for project folders across drives...')
for sp in search_paths:
    if sp and os.path.exists(sp):
        try:
            for item in os.listdir(sp):
                item_lower = item.lower()
                if any(k in item_lower for k in keywords):
                    full_p = os.path.join(sp, item)
                    mtime = time.ctime(os.path.getmtime(full_p))
                    is_dir = os.path.isdir(full_p)
                    type_str = 'DIR' if is_dir else 'FILE'
                    print(f'[{type_str}] {full_p} | Modified: {mtime}')
        except Exception as e:
            pass
