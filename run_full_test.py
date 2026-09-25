import requests
import json

def run():
    # 1. Upload
    with open('NyayaSETU_Strong_Compliance_Test_Contract_India(2).pdf', 'rb') as f:
        res = requests.post('http://localhost:8000/api/v1/documents/upload', files={'file': f})
    doc_id = res.json()['document_id']
    print(f"Uploaded: {doc_id}")
    
    # 2. Run
    url = f"http://localhost:8000/api/v1/audit/test-123/run?document_id={doc_id}"
    response = requests.get(url, stream=True)
    for line in response.iter_lines():
        if line:
            print(line.decode('utf-8'))

if __name__ == '__main__':
    run()
