import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://fingeniq.com"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
res = urllib.request.urlopen(req, context=ctx, timeout=10)
html = res.read().decode("utf-8")
print(f"[*] {url} -> Status: {res.status}")

css_files = re.findall(r'href="(/_next/static/[^"]+\.css)"', html)
print(f"[*] Found {len(css_files)} CSS file(s):", css_files)

for css in css_files:
    css_req = urllib.request.Request(url + css, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(css_req, context=ctx, timeout=10) as css_res:
        content = css_res.read().decode("utf-8", errors="ignore")
        print(f"[+] CSS File: {css}")
        print(f"    Status: {css_res.status}, Size: {len(content)} bytes")
        print(f"    Contains #FAF8F5 (Ivory Surface Base): {'#FAF8F5' in content or '#faf8f5' in content}")
        print(f"    Contains Space Grotesk: {'Space Grotesk' in content or 'Space+Grotesk' in content}")
        print(f"    Contains Plus Jakarta Sans: {'Plus Jakarta Sans' in content or 'Plus+Jakarta+Sans' in content}")
        print(f"    Contains Emerald / Green Palette (#16A34A): {'#16A34A' in content or '#16a34a' in content}")

print("\n=== FinGenIQ Route Health Check ===")
routes = [
    '/', '/about', '/curriculum', '/community', '/mentor',
    '/faq', '/contact', '/login', '/dashboard', '/lessons',
    '/assessments', '/capstone', '/certification'
]
for r in routes:
    req = urllib.request.Request(url + r, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r_res:
            print(f"  [PASS] {r:25s} -> HTTP {r_res.status}")
    except Exception as e:
        print(f"  [FAIL] {r:25s} -> ERROR: {e}")


