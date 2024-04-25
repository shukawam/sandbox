import os
from dotenv import load_dotenv
import time
import glob
import csv
from functools import wraps
from typing import Any, Callable, TypeVar

import pandas as pd
import numpy as np
import oracledb
from sqlalchemy import create_engine
import multiprocessing as mp
from oci.config import from_file
from oci.auth.signers import InstancePrincipalsSecurityTokenSigner
from oci.generative_ai_inference.generative_ai_inference_client import GenerativeAiInferenceClient
from oci.generative_ai_inference.models import (
    EmbedTextDetails,
    OnDemandServingMode,
)

F = TypeVar('F', bound=Callable[..., Any])
_ = load_dotenv()
UN=os.getenv("UN", "vector")
PW=os.getenv("PW", "vector")
DSN=os.getenv("DSN", "localhost:1521/orclpdb1")
COMPARTMENT_ID=os.getenv("COMPARTMENT_ID")
SOURCE_TABLE_NAME=os.getenv("SOURCE_TABLE_NAME")
SINK_TABLE_NAME=os.getenv("SINK_TABLE_NAME")
TARGET_COLUMN=os.getenv("TARGET_COLUMN")
VECTOR_COLUMN=os.getenv("VECTOR_COLUMN", "v")
INSERT_STATEMENT=os.getenv("INSERT_STATEMENT")
USE_IP=os.getenv("USE_IP", True)

cpu_count = mp.cpu_count()
batch_size = 96
pool = oracledb.create_pool(user=UN, password=PW, dsn=DSN, min=cpu_count, max=cpu_count)
if USE_IP == True:
    client = GenerativeAiInferenceClient(config={}, signer=InstancePrincipalsSecurityTokenSigner())
else:
    client = GenerativeAiInferenceClient(config=from_file())

def timer(func: F) -> None:
    """Any functions wrapper for calculate execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed_time = time.time() - start
        print(f"{func.__name__} took a {elapsed_time}s")
        return result
    return wrapper

@timer
def extract_all_data() -> np.ndarray:
    """Load all data from source table"""
    with pool.acquire() as connection:
        with connection.cursor():
            engine = create_engine("oracle+oracledb://", creator=lambda: connection)
            df = pd.read_sql(f"SELECT * FROM {SOURCE_TABLE_NAME}", engine)
            if df.size == 0:
                print(f"{SOURCE_TABLE_NAME} doesn't contain any data.")
                exit(1)
            batches = np.array_split(df, len(df)//batch_size + 1)
            print(f"Fetched all data: {len(df)}")
            return batches

@timer
def embed_texts(texts: list[str]) -> list[float]:
    """Embeddings texts using batch processing"""
    response = client.embed_text(
        embed_text_details=EmbedTextDetails(
            inputs=texts,
            serving_mode=OnDemandServingMode(
                model_id="cohere.embed-multilingual-v3.0"
            ),
            compartment_id=COMPARTMENT_ID,
            input_type="SEARCH_DOCUMENT"
        )
    )
    if (response.status != 200):
        print("Embeddings(using OCI Generative Service) is failed.")
        exit(1)
    return response.data.embeddings

@timer
def to_csv(batch: np.ndarray) -> None:
    """Dump data to CSV"""
    pd.DataFrame(batch).to_csv(f"./out/insert-data-{time.time()}.csv", header=False, index=False)

@timer
def transform_and_dump_to_csv(batch: np.ndarray) -> None:
    """Transform and load data to sink table"""
    response = embed_texts(batch[TARGET_COLUMN].tolist())
    batch[VECTOR_COLUMN] = response
    to_csv(batch=batch)

@timer
def flush(data: list) -> None:
    """Flush the on-memory data"""
    with pool.acquire() as connection:
        connection.autocommit = True
        with connection.cursor() as cursor:
            cursor.setinputsizes(None, oracledb.DB_TYPE_VECTOR)
            try:
                cursor.executemany(statement=INSERT_STATEMENT, parameters=data, batcherrors=True, arraydmlrowcounts=True)
                print(f"Insert rows: {len(cursor.getarraydmlrowcounts())}")
            except oracledb.DatabaseError as e:
                finalizer(exception=e, cursor=cursor, connection=connection)
            except KeyboardInterrupt as e:
                finalizer(exception=e, cursor=cursor, connection=connection)

@timer
def bulk_insert() -> None:
    """Bulk insert to sink table"""
    files = glob.glob("./out/*.csv")
    insert_data = []
    for file in files:
        with open(file, "r") as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=",")
            for line in csv_reader:
                insert_data.append(tuple(line))
                if (len(insert_data)) >= 10_000:
                    flush(data=insert_data)
                    insert_data = []
    if insert_data:
        flush(data=insert_data)

@timer
def checks() -> None:
    """Check"""
    with pool.acquire() as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT count(*) FROM {SINK_TABLE_NAME}")
            print(f"Inserted {cursor.fetchone()} rows.")

@timer
def finalizer(exception: Exception, cursor: oracledb.Cursor, connection: oracledb.Connection) -> None:
    """Close some resources(cursor, connection) and exit this task."""
    print(exception)
    print(f"Finalize these resources. cursor: {cursor}, connection: {connection}")
    cursor.close()
    connection.close()
    exit(1)

if __name__ == "__main__":
    batches = extract_all_data()
    with mp.Pool(cpu_count) as th_pool:
        th_pool.starmap(transform_and_dump_to_csv, zip(batches))
    bulk_insert()
    checks()
    pool.close()
