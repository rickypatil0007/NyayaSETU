import time
from concurrent.futures import ThreadPoolExecutor

def load_st():
    print('Thread: Starting ST load...')
    start = time.time()
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('BAAI/bge-small-en-v1.5')
    print(f'Thread: Model loaded successfully in {time.time() - start:.2f}s!')

def diagnose_thread_pool():
    print('Starting thread pool diagnostic...')
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(load_st)
        try:
            future.result(timeout=60)
        except Exception as e:
            print(f'Exception: {e}')

if __name__ == '__main__':
    diagnose_thread_pool()
