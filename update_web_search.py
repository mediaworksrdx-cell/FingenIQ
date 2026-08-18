# Update modules/web_search.py to ensure unconstrained entire-web search
ws_path = "/home/sathishbadri2015/aarkaai3b/modules/web_search.py"
with open(ws_path, "r", encoding="utf-8") as f:
    code = f.read()

# Update get_web_context so it always retrieves rich entire-web results
old_fn = """    # 1. Search Google Custom Search first; fallback to DuckDuckGo if CSE is not configured or fails
    search_results = search_google_cse(query, max_results=max_results)
    if not search_results:
        search_results = search_ddg(query, max_results=max_results)"""

new_fn = """    # 1. Search unrestricted entire web via high-capacity web search
    search_results = search_ddg(query, max_results=max_results)
    if not search_results:
        search_results = search_google_cse(query, max_results=max_results)"""

if old_fn in code:
    code = code.replace(old_fn, new_fn)
    with open(ws_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("SUCCESS: Updated modules/web_search.py to use unrestricted entire-web search!")
else:
    print("WARNING: old_fn not found in web_search.py")
