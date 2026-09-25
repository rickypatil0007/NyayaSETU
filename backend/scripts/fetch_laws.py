import os
import requests
import fitz  # PyMuPDF
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# URLs from 000_Legalknowledgebase.md
laws = [
    {"name": "Indian_Contract_Act_1872", "url": "https://www.cag.gov.in/uploads/media/Indian-Contract-Act-1872-20200816140128.pdf"},
    {"name": "Digital_Personal_Data_Protection_Act_2023", "url": "https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf"},
    {"name": "Information_Technology_Act_2000", "url": "https://www.meity.gov.in/static/uploads/2024/03/ITbill_2000.pdf"},
    {"name": "IT_Act_Consolidated_WIPO", "url": "https://www.wipo.int/edocs/lexdocs/laws/en/in/in024en.pdf"},
    {"name": "Consumer_Protection_Act_2019", "url": "https://www.indiacode.nic.in/bitstream/123456789/12808/1/the_consumer_protection_act,_2019_no._35_of_2019_date_09.08.2019.pdf"},
    {"name": "Arbitration_and_Conciliation_Act_1996", "url": "https://www.indiacode.nic.in/bitstream/123456789/1978/1/a199626.pdf"},
    {"name": "CGST_Act_2017", "url": "https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf"},
    {"name": "Code_on_Wages_2019", "url": "https://www.labour.gov.in/static/uploads/2025/06/c328da14bbb15fc4ad571dc33e7a4ab3.pdf"},
    {"name": "MSME_Act_2006", "url": "https://www.indiacode.nic.in/bitstream/123456789/7769/1/micro7.pdf"}
]

WORKSPACE = r"c:\Users\RICKY PATIL\Desktop\AI_Orchestrate\NyayaSETU\NyayaSETU-Antigravity-Build-Pack"
OUTPUT_DIR = os.path.join(WORKSPACE, "data", "legal-sources")
TEMP_DIR = os.path.join(WORKSPACE, "scratch_pdfs")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

for law in laws:
    print(f"Fetching {law['name']}...")
    pdf_path = os.path.join(TEMP_DIR, f"{law['name']}.pdf")
    md_path = os.path.join(OUTPUT_DIR, f"{law['name']}.md")
    
    try:
        if not os.path.exists(pdf_path):
            # Download PDF
            response = requests.get(law['url'], headers=headers, verify=False, timeout=30)
            response.raise_for_status()
            with open(pdf_path, 'wb') as f:
                f.write(response.content)
            print(f"Downloaded {law['name']}.pdf")
            
        # Extract Text
        doc = fitz.open(pdf_path)
        text_blocks = []
        for page in doc:
            text_blocks.append(page.get_text("text"))
            
        full_text = "\n\n".join(text_blocks)
        
        with open(md_path, 'w', encoding='utf-8') as md_file:
            md_file.write(f"# {law['name'].replace('_', ' ')}\n\n")
            md_file.write(f"Source URL: {law['url']}\n\n")
            md_file.write("---\n\n")
            md_file.write(full_text)
            
        print(f"Saved {law['name']}.md successfully.")
    except Exception as e:
        print(f"Failed to process {law['name']}: {str(e)}")

print("All laws processed.")
