import requests

def run():
    url = "http://localhost:8000/api/v1/audit/test-123/run?document_id=5fc5a24d-275d-4822-aa50-4f90f560a1de"
    response = requests.get(url, stream=True)
    for line in response.iter_lines():
        if line:
            print(line.decode('utf-8'))

if __name__ == '__main__':
    run()
