import urllib.request, json

req = urllib.request.Request(
    "http://127.0.0.1:5000/prompt",
    data=json.dumps({
        "prompt": "Search online for the latest 10-K filing of Apple (AAPL) and summarize its revenue growth",
        "sessionId": "test-full-web"
    }).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

res = urllib.request.urlopen(req)
data = json.loads(res.read())
print("STATUS:", res.status)
print("SOURCES:", data.get("sources"))
print("RESPONSE PREVIEW:\n", data.get("response")[:600])
