import urllib.request, re

html = urllib.request.urlopen("https://aarka-ai.com").read().decode("utf-8")
css_files = re.findall(r'href="(/_next/static/[^"]+\.css)"', html)
print("CSS Files found in HTML:", css_files)
for css in css_files:
    res = urllib.request.urlopen("https://aarka-ai.com" + css)
    print(css, "-> STATUS:", res.status, "BYTES:", len(res.read()))
