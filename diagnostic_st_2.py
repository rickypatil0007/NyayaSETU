import os
import sys
import time
import threading

os.environ['TOKENIZERS_PARALLELISM'] = 'false'
os.environ['OMP_NUM_THREADS'] = '1'

def diagnose_sentence_transformers():
    print('Starting diagnostics with ENV fixes...')
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        print('sentence-transformers not installed')
        return

    def load_model():
        print('Attempting to load model: BAAI/bge-small-en-v1.5')
        try:
            model = SentenceTransformer('BAAI/bge-small-en-v1.5')
            print('Model loaded successfully!')
            print(f'Dimension: {model.get_embedding_dimension()}')
        except Exception as e:
            print(f'Exception during load: {e}')
    
    t = threading.Thread(target=load_model)
    t.daemon = True
    start_time = time.time()
    t.start()
    
    t.join(timeout=10)
    if t.is_alive():
        print(f'BLOCKED: Model loading timed out after 10 seconds. Process hangs.')
    else:
        print(f'PASS: Model loading completed in {time.time() - start_time:.2f} seconds.')

if __name__ == '__main__':
    diagnose_sentence_transformers()
