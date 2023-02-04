import boto3
import sys
from awsglue.utils import getResolvedOptions
from botocore.errorfactory import ClientError
from pyspark.sql import SparkSession


s3 = boto3.client('s3')

def cache_exists(bucket_name: str, file_key: str) -> bool:
  '''
  Checks if a file exists in S3
  :param bucket_name: Name of the bucket
  :param file_key: Key of the file
  :return: True if the file exists, False otherwise
  '''
  if not file_key.endswith('/'):
    file_key = file_key + '/' 
  resp = s3.list_objects(Bucket=bucket_name, Prefix=file_key, Delimiter='/', MaxKeys=1)
  return 'Contents' in resp

def glue_job():
  args = getResolvedOptions(sys.argv, ['JOB_NAME', 'bucket_name', 'file_key'])
  bucket_name = args['bucket_name']
  file_key = args['file_key']
  output_key = "/".join(file_key.split("/")[:-1])

  spark = SparkSession.builder.getOrCreate()

  combinations = spark.read.text(f"s3://{bucket_name}/{file_key}").withColumnRenamed("value", "combination").cache()
  if cache_exists(bucket_name, "embeddings-cache/"):
    cache = spark.read.parquet(f"s3://{bucket_name}/embeddings-cache").cache()
  
    cache_miss = combinations.join(cache, ["combination"], "left_anti")
    cache_miss.show()
    cache_miss.write.parquet(f"s3://{bucket_name}/{output_key}" + "/cache_miss")

    cache_hit = combinations.join(cache, ["combination"], "inner")
    cache_hit.write.parquet(f"s3://{bucket_name}/{output_key}" + "/cache_hit")
  else:
    combinations.write.parquet(f"s3://{bucket_name}/{output_key}" + "/cache_miss")

  spark.stop()


if __name__ == "__main__":
  glue_job()
