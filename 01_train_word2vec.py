# -*- coding: utf-8 -*-
"""
01_train_word2vec.py
สคริปต์เตรียมข้อมูลและเทรนโมเดล Word2Vec จากคลังรีวิว Wongnai 40,000 ใบ
ตามแผนการสอน: Word Embedding กับภาษาไทย
"""

import os
import sys
import time
import zipfile
import argparse
import requests
import numpy as np
import pandas as pd
from tqdm import tqdm

try:
    from pythainlp.tokenize import word_tokenize
except ImportError:
    print("[Error] กรุณาติดตั้ง pythainlp: pip install pythainlp")
    sys.exit(1)

try:
    from gensim.models import Word2Vec
except ImportError:
    print("[Error] กรุณาติดตั้ง gensim: pip install gensim")
    sys.exit(1)


DATASET_URL = "https://github.com/wongnai/wongnai-corpus/raw/master/review/review_dataset.zip"


def download_and_extract(data_dir="data"):
    os.makedirs(data_dir, exist_ok=True)
    zip_path = os.path.join(data_dir, "review_dataset.zip")
    csv_train_path = os.path.join(data_dir, "w_review_train.csv")

    if os.path.exists(csv_train_path):
        print(f"[1/4] พบไฟล์ข้อมูลเดิมที่ {csv_train_path} แล้ว ข้ามการดาวน์โหลด")
        return csv_train_path

    # ตรวจสอบ zip ในโฟลเดอร์หลักหรือ data/
    if not os.path.exists(zip_path):
        if os.path.exists("review_dataset.zip"):
            zip_path = "review_dataset.zip"
        else:
            print(f"[1/4] กำลังดาวน์โหลดคลังข้อมูล Wongnai จาก GitHub (~14 MB)...")
            start_t = time.time()
            resp = requests.get(DATASET_URL, stream=True, timeout=60)
            resp.raise_for_status()
            total_size = int(resp.headers.get("content-length", 0))
            with open(zip_path, "wb") as f, tqdm(
                total=total_size, unit="B", unit_scale=True, desc="Downloading"
            ) as pbar:
                for chunk in resp.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        f.write(chunk)
                        pbar.update(len(chunk))
            print(f"ดาวน์โหลดสำเร็จ ใช้เวลา {time.time() - start_t:.1f} วินาที")

    print(f"กำลังแตกไฟล์ {zip_path}...")
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(data_dir)

    if not os.path.exists(csv_train_path):
        # ค้นหาไฟล์ csv ใน data_dir
        for root, _, files in os.walk(data_dir):
            for file in files:
                if file.endswith(".csv") and "train" in file:
                    return os.path.join(root, file)

    return csv_train_path


def load_reviews(csv_path, sample_size=None):
    print(f"กำลังโหลดข้อมูลรีวิวจาก {csv_path}...")
    # Wongnai review dataset ใช้ ';' หรือ '\t' เป็น separator และอาจไม่มี header
    try:
        df = pd.read_csv(
            csv_path,
            sep=";",
            header=None,
            names=["review", "rating"],
            on_bad_lines="skip",
            encoding="utf-8",
        )
    except Exception:
        df = pd.read_csv(
            csv_path,
            sep="\t",
            header=None,
            names=["review", "rating"],
            on_bad_lines="skip",
            encoding="utf-8",
        )

    # ลบแถวที่ไม่มีข้อความ
    df = df.dropna(subset=["review"]).reset_index(drop=True)
    df["review"] = df["review"].astype(str).str.strip()
    df = df[df["review"].str.len() > 0].reset_index(drop=True)

    if sample_size and sample_size < len(df):
        print(f"สุ่มเลือกตัวอย่าง {sample_size:,} รีวิว จากทั้งหมด {len(df):,} รีวิว...")
        df = df.sample(n=sample_size, random_state=42).reset_index(drop=True)

    print(f"โหลดรีวิวทั้งหมด {len(df):,} รายการ")
    return df


def tokenize_corpus(reviews):
    print(f"[2/4] กำลังตัดคำ {len(reviews):,} รีวิวด้วย PyThaiNLP (newmm)...")
    start_t = time.time()
    tokenized_docs = []
    total_tokens = 0

    for text in tqdm(reviews, desc="Tokenizing"):
        # ตัดคำภาษาไทย
        tokens = word_tokenize(text, engine="newmm", keep_whitespace=False)
        # กรอง whitespace และคำว่าง
        tokens = [t.strip() for t in tokens if t.strip()]
        tokenized_docs.append(tokens)
        total_tokens += len(tokens)

    elapsed = time.time() - start_t
    print(f"ตัดคำเสร็จสิ้นใน {elapsed:.1f} วินาที | จำนวนคำทั้งหมด: ~{total_tokens:,} คำ (เฉลี่ย {total_tokens/len(reviews):.1f} คำ/รีวิว)")
    return tokenized_docs, total_tokens


def train_word2vec(tokenized_docs, vector_size=100, window=5, min_count=10, sg=1, epochs=10, workers=4):
    print(f"[3/4] กำลังเทรน Word2Vec (sg={sg} [Skip-gram], dim={vector_size}, window={window}, min_count={min_count}, epochs={epochs})...")
    start_t = time.time()
    model = Word2Vec(
        sentences=tokenized_docs,
        vector_size=vector_size,
        window=window,
        min_count=min_count,
        sg=sg,
        epochs=epochs,
        workers=workers,
        seed=42,
    )
    elapsed = time.time() - start_t
    vocab_size = len(model.wv.key_to_index)
    print(f"เทรนโมเดลเสร็จสิ้นใน {elapsed:.1f} วินาที | ขนาด Vocabulary (min_count>={min_count}): {vocab_size:,} คำ")
    return model


def compute_doc_vectors(tokenized_docs, model, vector_size=100):
    print("[4/4] กำลังสร้าง Vector ระดับเอกสาร (Document Vectors) โดยเฉลี่ย Word Vectors...")
    start_t = time.time()
    doc_vectors = np.zeros((len(tokenized_docs), vector_size), dtype=np.float32)
    wv = model.wv

    for i, doc in enumerate(tqdm(tokenized_docs, desc="Doc Vectors")):
        valid_vecs = [wv[w] for w in doc if w in wv]
        if valid_vecs:
            doc_vectors[i] = np.mean(valid_vecs, axis=0)

    elapsed = time.time() - start_t
    print(f"สร้าง Document Vectors เสร็จสิ้นใน {elapsed:.1f} วินาที (ขนาด array: {doc_vectors.shape})")
    return doc_vectors


def export_results(df, tokenized_docs, model, doc_vectors, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)
    print(f"\nกำลังบันทึกผลลัพธ์ลงในโฟลเดอร์ {output_dir}/...")

    # 1. บันทึก Gensim model
    model_path = os.path.join(output_dir, "wongnai_w2v.model")
    model.save(model_path)
    print(f"  [✓] บันทึกโมเดล Word2Vec: {model_path}")

    # 2. บันทึก word_vectors.csv สำหรับ AI Studio / RapidMiner
    word_csv_path = os.path.join(output_dir, "word_vectors.csv")
    words = list(model.wv.key_to_index.keys())
    vectors = [model.wv[w] for w in words]

    dim_cols = [f"dim_{i}" for i in range(model.vector_size)]
    word_df = pd.DataFrame(vectors, columns=dim_cols)
    word_df.insert(0, "word", words)
    word_df.to_csv(word_csv_path, index=False, encoding="utf-8-sig")
    print(f"  [✓] บันทึก Word Vectors CSV ({len(word_df):,} คำ): {word_csv_path}")

    # 3. บันทึก doc_vectors.npy
    doc_npy_path = os.path.join(output_dir, "doc_vectors.npy")
    np.save(doc_npy_path, doc_vectors)
    print(f"  [✓] บันทึก Document Vectors (Numpy Array {doc_vectors.shape}): {doc_npy_path}")

    # 4. บันทึก reviews.csv
    reviews_csv_path = os.path.join(output_dir, "reviews.csv")
    out_df = pd.DataFrame({
        "review_id": range(len(df)),
        "review_text": df["review"],
        "rating": df["rating"] if "rating" in df.columns else np.nan,
        "token_count": [len(d) for d in tokenized_docs],
    })
    out_df.to_csv(reviews_csv_path, index=False, encoding="utf-8-sig")
    print(f"  [✓] บันทึก Reviews CSV ({len(out_df):,} รีวิว): {reviews_csv_path}")

    print("\n========================================================")
    print(" สรุปผลลัพธ์ไฟล์ที่สร้างเสร็จสมบูรณ์:")
    print(f" 1. {model_path}  -> โมเดลที่เทรนแล้ว โหลดซ้ำได้")
    print(f" 2. {word_csv_path}  -> ตารางคำ + vector 100 มิติ ({len(word_df):,} คำ)")
    print(f" 3. {doc_npy_path}   -> vector ของรีวิวทั้ง {len(df):,} ใบ")
    print(f" 4. {reviews_csv_path}    -> ข้อความรีวิวต้นฉบับ")
    print("========================================================")


def main():
    parser = argparse.ArgumentParser(description="เทรนโมเดล Word2Vec จากคลังรีวิว Wongnai 40,000 ใบ")
    parser.add_argument("--sample", type=int, default=None, help="จำนวนรีวิวที่ต้องการสุ่มใช้ เช่น 10000 เพื่อความรวดเร็ว")
    parser.add_argument("--epochs", type=int, default=10, help="จำนวนรอบในการเทรน (ค่าเริ่มต้น 10)")
    parser.add_argument("--min-count", type=int, default=10, help="จำนวนครั้งขั้นต่ำที่คำต้องปรากฏ (ค่าเริ่มต้น 10)")
    parser.add_argument("--vector-size", type=int, default=100, help="มิติของ word vector (ค่าเริ่มต้น 100)")
    parser.add_argument("--window", type=int, default=5, help="ขนาด context window (ค่าเริ่มต้น 5)")
    parser.add_argument("--data-path", type=str, default=None, help="ระบุ path ไฟล์ w_review_train.csv โดยตรงหากมีอยู่แล้ว")
    parser.add_argument("--output-dir", type=str, default="output", help="โฟลเดอร์สำหรับเก็บผลลัพธ์")
    parser.add_argument("--workers", type=int, default=4, help="จำนวน CPU workers")
    args = parser.parse_args()

    print("=" * 60)
    print(" โปรแกรมเตรียมข้อมูลและเทรน Word2Vec (ภาษาไทย - Wongnai Corpus)")
    print("=" * 60)

    # 1. จัดเตรียมไฟล์ข้อมูล
    if args.data_path and os.path.exists(args.data_path):
        csv_path = args.data_path
    else:
        csv_path = download_and_extract()

    # 2. โหลดรีวิว
    df = load_reviews(csv_path, sample_size=args.sample)

    # 3. ตัดคำภาษาไทย
    tokenized_docs, total_tokens = tokenize_corpus(df["review"])

    # 4. เทรน Word2Vec
    model = train_word2vec(
        tokenized_docs,
        vector_size=args.vector_size,
        window=args.window,
        min_count=args.min_count,
        sg=1,
        epochs=args.epochs,
        workers=args.workers,
    )

    # 5. สร้าง Document Vectors
    doc_vectors = compute_doc_vectors(tokenized_docs, model, vector_size=args.vector_size)

    # 6. บันทึกผลลัพธ์
    export_results(df, tokenized_docs, model, doc_vectors, output_dir=args.output_dir)
    print("\nพร้อมสำหรับการรันโปรแกรมสาธิต: python 02_demo_classroom.py\n")


if __name__ == "__main__":
    main()
