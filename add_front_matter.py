import os
import re

DATA_DIR = r"c:\Users\RICKY PATIL\Desktop\AI_Orchestrate\NyayaSETU\backend\data\legal-sources"

FILES_AND_FM = {
    "CGST_Act_2017.md": """---
source_id: "cgst_act_2017"
title: "Central Goods and Services Tax Act, 2017"
jurisdiction: "india"
status: "in_force"
in_force_from: "2017-07-01"
repealed_on: null
---

""",
    "Code_on_Wages_2019.md": """---
source_id: "code_on_wages_2019"
title: "Code on Wages, 2019"
jurisdiction: "india"
status: "in_force"
in_force_from: "2019-08-08"
repealed_on: null
---

""",
    "Digital_Personal_Data_Protection_Act_2023.md": """---
source_id: "dpdp_act_2023"
title: "Digital Personal Data Protection Act, 2023"
jurisdiction: "india"
status: "in_force"
in_force_from: "2023-08-11"
repealed_on: null
---

""",
    "Indian_Contract_Act_1872.md": """---
source_id: "indian_contract_act_1872"
title: "Indian Contract Act, 1872"
jurisdiction: "india"
status: "in_force"
in_force_from: "1872-09-01"
repealed_on: null
---

""",
    "Information_Technology_Act_2000.md": """---
source_id: "it_act_2000"
title: "Information Technology Act, 2000"
jurisdiction: "india"
status: "in_force"
in_force_from: "2000-10-17"
repealed_on: null
---

""",
    "IT_Act_Consolidated_WIPO.md": """---
source_id: "it_act_consolidated_wipo"
title: "IT Act Consolidated WIPO"
jurisdiction: "india"
status: "archived"
in_force_from: "2000-10-17"
repealed_on: null
---

"""
}

for filename, fm in FILES_AND_FM.items():
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Don't prepend if it already has front matter
        if not content.startswith('---'):
            with open(path, 'w', encoding='utf-8') as f:
                f.write(fm + content)
            print(f"Added front matter to {filename}")
        else:
            print(f"Skipped {filename} (already has front matter)")
