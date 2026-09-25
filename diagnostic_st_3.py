import time
import threading

def load_transformers():
    print('Starting transformers diagnostics...')
    try:
        from transformers import AutoConfig, AutoTokenizer, AutoModel
    except ImportError:
        print('transformers not installed')
        return

    def load_model():
        try:
            print('Loading Config...')
            config = AutoConfig.from_pretrained('BAAI/bge-small-en-v1.5')
            print('Config loaded successfully!')
            
            print('Loading Tokenizer...')
            tokenizer = AutoTokenizer.from_pretrained('BAAI/bge-small-en-v1.5')
            print('Tokenizer loaded successfully!')
            
            print('Loading Model Weights...')
            model = AutoModel.from_pretrained('BAAI/bge-small-en-v1.5')
            print('Model weights loaded successfully!')
        except Exception as e:
            print(f'Exception during load: {e}')
    
    t = threading.Thread(target=load_model)
    t.daemon = True
    t.start()
    
    t.join(timeout=15)
    if t.is_alive():
        print(f'BLOCKED: Transformers loading timed out after 15 seconds.')
    else:
        print(f'PASS: Transformers loading completed.')

if __name__ == '__main__':
    load_transformers()
