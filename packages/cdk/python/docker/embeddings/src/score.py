import math
import re
import numpy as np
import pandas as pd

NEW_LINE = "\n"
SPACE = " "
TOP_AMOUNT = 4

score_cols = [f"score_{i}" for i in range(1, TOP_AMOUNT + 1)]
query_cols = [f"query_{i}" for i in range(1, TOP_AMOUNT + 1)]

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

def parse_queries_and_scores(df: pd.DataFrame):
  cols = zip(query_cols, score_cols)
  return [{"query": df[q].item(), "score": df[s].item()} for q, s in cols]

def calculate_words_score(post_text: str, combinations: pd.DataFrame, keywords: pd.DataFrame):
  combinations['score'] = 0
  
  for i in range(1, TOP_AMOUNT + 1):
    combinations[f"score_{i}"] = -math.inf
  for _, row in keywords.iterrows():
    embeddings = row["embeddings"]
    query = row["text"]
    impressions = row["volume"]

    combinations["similarity"] = combinations.embeddings.apply(lambda x: cosine_similarity(x, embeddings))
    combinations["score"] += combinations["similarity"] * impressions

    filtered = combinations
    prev = True
    for i in range(1, TOP_AMOUNT + 1):
      query_col_name = f"query_{i}"
      score_col_name = f"score_{i}"

      row_idx = prev & (filtered["similarity"] > filtered[score_col_name])
      if filtered[row_idx].empty:
        break
      
      #FIXME: Bug dropping some values here (Overriding instead of sliding)
      filtered.loc[row_idx, query_col_name] = query
      filtered.loc[row_idx, score_col_name] = combinations["similarity"]

      prev = filtered["similarity"] < filtered[score_col_name]
  combinations = combinations.drop(columns=["similarity"])

  max_sim = combinations['score'].max()
  min_sim = combinations['score'].min()
  dif_sim = max_sim - min_sim
  combinations['score'] = (combinations['score'] - min_sim) / dif_sim

  combinations['n_words'] = combinations.text.apply(lambda x: len(x.split(" ")))

  words = list(map(lambda x: {"word": x, "combinations": []}, get_combinations(post_text, 1)))
  for n_words in combinations["n_words"].unique():
    word_combinations = get_combinations(post_text, n_words)
    for i, word in enumerate(words, 1):
      min_index = max(i-n_words, 0)
      word["combinations"] += word_combinations[min_index:i]

  for word in words:
    idxmax = combinations[combinations.text.isin(word['combinations'])]["score"].idxmax()
    best_match = combinations.loc[[idxmax]]
    word["score"] = best_match["score"].item()
    word["queries"] = parse_queries_and_scores(best_match)
    del word["combinations"]

  return words
