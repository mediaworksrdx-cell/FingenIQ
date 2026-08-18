import sys
sys.path.insert(0, "/home/sathishbadri2015/aarkaai3b")
from modules.web_search import search_ddg, search_wikipedia
from duckduckgo_search import DDGS
import json

print("=== Testing Direct Entire-Web Search ===")
results = []
with DDGS() as ddgs:
    for r in ddgs.text("Apple AAPL latest 10-K SEC annual report revenue growth fiscal 2025 2026", max_results=5):
        results.append({
            "title": r.get("title"),
            "url": r.get("href"),
            "snippet": r.get("body"),
        })

print(f"Retrieved {len(results)} entire-web results:")
for idx, r in enumerate(results, 1):
    print(f"\n[{idx}] {r['title']}")
    print(f"URL: {r['url']}")
    print(f"Snippet: {r['snippet']}")
