import os
import cohere
import pandas as pd
import typer


API_KEY = os.environ['COHERE_API_KEY']
BUCKET_NAME = os.environ['BUCKET_NAME']
MODEL = 'small'

app = typer.Typer()

@app.command()
def fetch_embeddings(file_key: str):
  file_name = file_key.split("/")[-1]
  request_id = file_key.split("/")[-3]
  combinations_df = pd.read_parquet(f"s3://{BUCKET_NAME}/{file_key}")

  co = cohere.Client(API_KEY)

  response = co.embed(texts=combinations_df['combination'].values.tolist(), model=MODEL)

  combinations_df["embeddings"] = response.embeddings

  combinations_df.to_parquet(f"s3://{BUCKET_NAME}/requests/{request_id}/new-embeddings/{file_name}", index=False)
  combinations_df.to_parquet(f"s3://{BUCKET_NAME}/embeddings-cache/{request_id}.snappy.parquet", index=False)

if __name__ == '__main__':
  app()
