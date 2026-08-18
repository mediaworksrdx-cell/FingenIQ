import sys
sys.path.insert(0, "/home/sathishbadri2015/aarkaai3b")
from modules import finance
import json

print("Extract tickers:", finance.extract_tickers("Search online for the latest 10-K filing of Apple (AAPL) and summarize its revenue growth"))
data = finance.get_market_data("Search online for the latest 10-K filing of Apple (AAPL) and summarize its revenue growth")
print("Finance summary:\n", data.get("summary"))
