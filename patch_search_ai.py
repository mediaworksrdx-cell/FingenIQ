# Update modules/aarkaa_engine.py
ae_path = "/home/sathishbadri2015/aarkaai3b/modules/aarkaa_engine.py"
with open(ae_path, "r", encoding="utf-8") as f:
    ae_code = f.read()

target_block = """                    user_prompt += (
                        "Reference Information (use ONLY if directly relevant to the question above):\\n"
                        "---------------------\\n"
                        + ctx_to_inject + "\\n"
                        "---------------------\\n"
                    )
                    user_prompt += "Answer the question above in a detailed, technical, and comprehensive manner. If the reference information does not directly answer the question, IGNORE it and answer from your own knowledge. Do NOT output any notes, warnings, or disclaimers about context sufficiency.\""""

replacement_block = """                    has_web = "[Web Search]" in context or "[Web Search Results" in context
                    if has_web:
                        user_prompt += (
                            "LIVE WEB SEARCH EVIDENCE (Google Custom Search):\\n"
                            "---------------------\\n"
                            + ctx_to_inject + "\\n"
                            "---------------------\\n"
                            "CRITICAL SYNTHESIS INSTRUCTION:\\n"
                            "The data above was retrieved LIVE from Google Search. "
                            "You MUST extract and synthesize all financial metrics, revenue numbers, filing details, dates, "
                            "and SEC report summaries found in these search snippets into a comprehensive, professional answer. "
                            "Do NOT output boilerplate disclaimers such as 'I cannot access the document/link'. "
                            "Directly present the financial breakdown and key insights from the search results.\\n"
                        )
                    else:
                        user_prompt += (
                            "Reference Information:\\n"
                            "---------------------\\n"
                            + ctx_to_inject + "\\n"
                            "---------------------\\n"
                            "Answer the question above in a detailed, technical, and comprehensive manner.\\n"
                        )"""

if target_block in ae_code:
    ae_code = ae_code.replace(target_block, replacement_block)
    with open(ae_path, "w", encoding="utf-8") as f:
        f.write(ae_code)
    print("SUCCESS: Patched modules/aarkaa_engine.py with active web synthesis prompt!")
else:
    print("WARNING: target_block not found in aarkaa_engine.py")
