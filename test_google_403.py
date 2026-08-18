import urllib.request, urllib.parse, json

api_key = "AIzaSyD7raXuVbNJNiMVKlyKpmGCck8sx6a6og4"
cx = "610c78d5c0ce14798"
query = "Apple AAPL 10-K revenue"

params = urllib.parse.urlencode({"key": api_key, "cx": cx, "q": query})
url = f"https://www.googleapis.com/customsearch/v1?{params}"

try:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    res = urllib.request.urlopen(req)
    print("SUCCESS:", res.read()[:300])
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print("BODY:", e.read().decode("utf-8"))
except Exception as e:
    print("ERROR:", e)
