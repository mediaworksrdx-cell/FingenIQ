import sys
sys.path.insert(0, "/home/sathishbadri2015/aarkaai3b")
from modules.web_search import search_google_cse, get_web_context
import json

q = "latest 10-K filing of Apple AAPL revenue growth"
print("1. RAW CSE RESULTS FOR:", q)
raw = search_google_cse(q, max_results=5)
print(json.dumps(raw, indent=2))

print("\n2. GET_WEB_CONTEXT RESULT:")
ctx = get_web_context(q, max_results=5)
print(ctx)
