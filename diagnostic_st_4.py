import time

def diagnose_main_thread():
    print('Starting main thread diagnostic...')
    from sentence_transformers import SentenceTransformer
    start = time.time()
    try:
        model = SentenceTransformer('BAAI/bge-small-en-v1.5')
        print(f'Model loaded successfully in {time.time() - start:.2f}s!')
    except Exception as e:
        print(f'Exception: {e}')

if __name__ == '__main__':
    diagnose_main_thread()
