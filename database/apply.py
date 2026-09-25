import psycopg2
import os
import glob

# Connection string using the provided password and Supabase project domain
conn_str = "postgresql://postgres:nyayaSetu123@db.htkughxcaxiluozxoewd.supabase.co:5432/postgres"

migrations_dir = os.path.join(os.path.dirname(__file__), "migrations")
sql_files = sorted(glob.glob(os.path.join(migrations_dir, "*.sql")))

print("Connecting to Supabase PostgreSQL database...")
try:
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    cursor = conn.cursor()
    
    for sql_file_path in sql_files:
        print(f"Applying migration: {os.path.basename(sql_file_path)}...")
        with open(sql_file_path, "r") as f:
            sql = f.read()
        try:
            cursor.execute(sql)
            print(f"Successfully applied {os.path.basename(sql_file_path)}")
        except Exception as file_e:
            print(f"Error executing {os.path.basename(sql_file_path)}: {file_e}")
            # Continuing with others is generally not safe in production, but okay for this script if it's idempotent
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error connecting or applying migrations: {e}")
