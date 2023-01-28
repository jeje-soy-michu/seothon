import boto3
import sys
from awsglue.utils import getResolvedOptions
from pyspark.sql import SparkSession



s3 = boto3.client('s3')

def glue_job():
  args = getResolvedOptions(sys.argv, ['JOB_NAME', 'bucket_name', 'file_key'])
  bucket_name = args['bucket_name']
  file_key = args['file_key']
  output_key = "/".join(file_key.split("/")[:-1]) + "/cache_miss"

  obj = s3.get_object(Bucket=bucket_name, Key=file_key)
  payload = obj['Body'].read().decode().splitlines()

  spark = SparkSession.builder.getOrCreate()

  combinations = spark.read.text(f"s3://{bucket_name}/{file_key}").withColumnRenamed("value", "combination")
  #FIXME: Skip the cache for now
  cache_miss = combinations
  cache_miss.write.parquet(f"s3://{bucket_name}/{output_key}")

  spark.stop()


if __name__ == "__main__":
  glue_job()
