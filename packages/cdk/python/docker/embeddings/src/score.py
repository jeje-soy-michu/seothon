import re
import numpy as np
import pandas as pd


NEW_LINE = "\n"
SPACE = " "
TOP_AMOUNT = 4

def cosine_similarity(a, b):
  return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def get_combinations(post: str, combination_length: int = 7):
  """
  Gets all combinations of words in a post
  :param post: Post to get combinations from
  :param combination_length: Length of each combination
  :return: List of combinations
  """
  # Remove the \n characters from the post
  post = re.sub(NEW_LINE, SPACE, post)

  words = list(filter(lambda x: x, post.split(SPACE)))

  combination = words[:combination_length]

  combinations = [SPACE.join(combination)]
  for word in words[combination_length:]:
    combination = combination[1:] + [word]
    combinations.append(SPACE.join(combination))
  
  return combinations

def calculate_words_score(post_text: str, embeddings_df: pd.DataFrame):
  combinations = embeddings_df[embeddings_df['type'] == "combination"]
  keywords = embeddings_df[embeddings_df['type'] == "keyword"]
  
  combinations = combinations.drop_duplicates(["text"]).drop(columns=["type", "volume"])
  keywords = keywords.drop_duplicates(["text"]).rename(columns={"text": "query", "embeddings": "query_embeddings"}).drop(columns=["type"])
  
  # Merge the keywords and combinations dataframes by text
  keywords_and_combinations = combinations.merge(keywords, how="cross")

  # Get the similarity score the keywords and combinations
  keywords_and_combinations["similarity"] = keywords_and_combinations.apply(lambda x: cosine_similarity(x["embeddings"], x["query_embeddings"]), axis=1)

  # Drop the embeddings columns
  keywords_and_combinations = keywords_and_combinations.drop(columns=["embeddings", "query_embeddings"])

  # Get the combinations for the post
  keywords_and_combinations["score"] = keywords_and_combinations["similarity"] * keywords_and_combinations["volume"]

  # Drop the volume column
  keywords_and_combinations = keywords_and_combinations.drop(columns=["volume"])

  # Get the score for each combination
  scores = keywords_and_combinations.groupby(["text"]).agg({"score": "sum"})

  # Add the scores to the keywords and combinations dataframe
  keywords_and_combinations = keywords_and_combinations.drop(columns=["score"]).merge(scores, how="inner", on="text")

  # Sort the keywords and combinations by similarity
  keywords_and_combinations = keywords_and_combinations.sort_values(by="similarity", ascending=False)

  # Get the number of words for each combination
  keywords_and_combinations["n_words"] = keywords_and_combinations.text.apply(lambda x: len(x.split(" ")))

  # Get the words for the post
  words = list(map(lambda x: {"word": x, "combinations": []}, get_combinations(post_text, 1)))
  
  # Get the combinations for each word
  for n_words in keywords_and_combinations["n_words"].unique():
    word_combinations = get_combinations(post_text, n_words)
    for i, word in enumerate(words, 1):
      min_index = max(i-n_words, 0)
      word["combinations"] += word_combinations[min_index:i]
  
  # Get the best TOP_AMOUNT combinations for each word
  for word in words:
    word_combinations = keywords_and_combinations[keywords_and_combinations.text.isin(word['combinations'])]
    queries = word_combinations.groupby(["query"]).head(1)
    best_queries = queries.head(TOP_AMOUNT)
    word["score"] = word_combinations["score"].max()
    word["queries"] = best_queries[["query", "similarity"]].to_json(orient="records")
    del word["combinations"]
  
  # Normalize the scores between 0 and 1
  max_score = max(map(lambda x: x["score"], words))
  min_score = min(map(lambda x: x["score"], words))
  for word in words:
    word["score"] = (word["score"] - min_score) / (max_score - min_score)

  return words
