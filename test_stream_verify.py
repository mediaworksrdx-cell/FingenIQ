import urllib.request, json

req = urllib.request.Request(
    "http://127.0.0.1:5000/prompt/stream",
    data=json.dumps({
        "query": "hello",
        "session_id": "test-stream"
    }).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

res = urllib.request.urlopen(req)
print("STATUS:", res.status)
for i in range(5):
    line = res.readline()
    if not line: break
    print("LINE:", line.decode("utf-8").strip())
