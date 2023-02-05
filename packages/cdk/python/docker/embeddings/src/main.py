import os
import boto3
import cohere
import pandas as pd
import typer

from score import calculate_words_score


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

  response = co.embed(texts=combinations_df['text'].values.tolist(), model=MODEL)

  combinations_df["embeddings"] = response.embeddings

  combinations_df.to_parquet(f"s3://{BUCKET_NAME}/requests/{request_id}/new-embeddings/{file_name}", index=False)
  combinations_df[['text', 'embeddings']].to_parquet(f"s3://{BUCKET_NAME}/embeddings-cache/{request_id}.snappy.parquet", index=False)

  # Filter out combinations with more than 1 word to create a fast cache
  combinations_df = combinations_df[combinations_df['text'].str.split().str.len() > 1]
  combinations_df[['text', 'embeddings']].to_parquet(f"s3://{BUCKET_NAME}/embeddings-fast-cache/{request_id}.snappy.parquet", index=False)

@app.command()
def calculate_score(request_id: str, file_name: str, use_new_embeddings: bool = False):
  s3 = boto3.client('s3')
  s3_prefix = f"s3://{BUCKET_NAME}/requests/{request_id}"
  try:
    cache_hit_df = pd.read_parquet(f"{s3_prefix}/cache_hit/{file_name}")
    if use_new_embeddings:
      new_embeddings_df = pd.read_parquet(f"{s3_prefix}/new-embeddings/{file_name}")
      embeddings_df = pd.concat([cache_hit_df, new_embeddings_df])
    else:
      embeddings_df = cache_hit_df
  except OSError:
    embeddings_df = pd.read_parquet(f"{s3_prefix}/new-embeddings/{file_name}")

  combinations_df = embeddings_df[embeddings_df['type'] == "combination"]
  keywords_df = embeddings_df[embeddings_df['type'] == "keyword"]
  post_text = s3.get_object(Bucket=BUCKET_NAME, Key=f"requests/{request_id}/post.txt")['Body'].read().decode('utf-8')

  print(calculate_words_score(post_text, combinations_df, keywords_df))

if __name__ == '__main__':
  app()
