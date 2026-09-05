import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "processed" / "ddos_sample.csv"


def load_dataset():
    dataset = pd.read_csv(DATA_PATH)
    return dataset


def clean_dataset(dataset):
    dataset.columns = dataset.columns.str.strip()

    numeric_columns = dataset.select_dtypes(include=[np.number]).columns

    dataset[numeric_columns] = dataset[numeric_columns].replace(
        [np.inf, -np.inf], np.nan
    )

    dataset[numeric_columns] = dataset[numeric_columns].fillna(0)

    return dataset


def prepare_data(test_size=0.2, random_state=42):
    dataset = load_dataset()
    dataset = clean_dataset(dataset)

    X = dataset.drop(columns=["Label"])
    y = dataset["Label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )

    return X_train, X_test, y_train, y_test