import os
from supabase import create_client

# Credenciais do projeto
url = os.getenv("SUPABASE_URL", "https://nvdnuwtnewnkoknmhkif.supabase.co")
key = os.getenv("SUPABASE_SERVICE_KEY") # Use a Service Role Key para admin tasks

if not key:
    print("Erro: SUPABASE_SERVICE_KEY não configurada.")
    exit(1)

supabase = create_client(url, key)

def setup_storage():
    try:
        # Tenta criar o bucket 'videos'
        supabase.storage.create_bucket("videos", {"public": True})
        print("Bucket 'videos' criado com sucesso.")
    except Exception as e:
        print(f"Nota: O bucket pode já existir. Detalhe: {e}")

if __name__ == "__main__":
    setup_storage()
