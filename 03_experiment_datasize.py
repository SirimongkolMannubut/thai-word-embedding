# -*- coding: utf-8 -*-
"""
03_experiment_datasize.py
การทดลองเปรียบเทียบผลของคุณภาพ Word Embedding ตามขนาดของข้อมูล (500 / 2,000 / 10,000 / 40,000 รีวิว)
สำหรับใช้ประกอบการสอนช่วงที่ 5 เพื่อแสดงให้เห็นผลกระทบของปริมาณข้อมูล
"""

import os
import sys
import time
import importlib
import pandas as pd
import numpy as np
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

train_module = importlib.import_module("01_train_word2vec")
download_and_extract = train_module.download_and_extract
load_reviews = train_module.load_reviews
tokenize_corpus = train_module.tokenize_corpus

SAMPLE_SIZES = [500, 2000, 10000, 40000]
BENCHMARK_WORDS = ["อร่อย", "กาแฟ", "บริการ", "ราคา"]


def run_experiment(output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)
    print("=" * 70)
    print(" 🧪 การทดลอง: ผลกระทบของขนาดข้อมูลต่อคุณภาพของ Word Embedding")
    print("=" * 70)

    # 1. โหลดข้อมูลเต็ม
    csv_path = download_and_extract()
    df_all = load_reviews(csv_path)

    # 2. ตัดคำทั้งหมด
    print("\nกำลังเตรียมและตัดคำข้อมูลทั้งหมด...")
    all_tokenized, total_tokens = tokenize_corpus(df_all["review"])

    results = []

    for size in SAMPLE_SIZES:
        actual_size = min(size, len(all_tokenized))
        print("\n" + "-" * 70)
        print(f"🔄 กำลังทดสอบโมเดลที่ขนาดข้อมูล: {actual_size:,} รีวิว...")
        print("-" * 70)

        subset_docs = all_tokenized[:actual_size]
        subset_token_count = sum(len(d) for d in subset_docs)

        # สำหรับขนาด 500 หรือ 2000 ให้ min_count=3 เพื่อให้พอมี vocab เปรียบเทียบ
        # สำหรับ 10000 และ 40000 ใช้ min_count=10
        min_count = 3 if actual_size <= 2000 else 10

        t_start = time.time()
        model = Word2Vec(
            sentences=subset_docs,
            vector_size=100,
            window=5,
            min_count=min_count,
            sg=1,
            epochs=10,
            workers=4,
            seed=42,
        )
        t_train = time.time() - t_start

        vocab_size = len(model.wv.key_to_index)
        wv = model.wv

        bench_results = {}
        for word in BENCHMARK_WORDS:
            if word in wv:
                top_matches = wv.most_similar(word, topn=3)
                formatted = ", ".join([f"{w} ({s:.2f})" for w, s in top_matches])
                bench_results[word] = formatted
            else:
                bench_results[word] = "[ไม่อยู่ใน Vocab]"

        row_info = {
            "จำนวนรีวิว": f"{actual_size:,}",
            "จำนวนคำทั้งหมด": f"{subset_token_count:,}",
            "Min Count": min_count,
            "ขนาด Vocab": f"{vocab_size:,}",
            "เวลาเทรน (วินาที)": f"{t_train:.1f}s",
            "อร่อย (Top 3)": bench_results["อร่อย"],
            "กาแฟ (Top 3)": bench_results["กาแฟ"],
            "บริการ (Top 3)": bench_results["บริการ"],
            "ราคา (Top 3)": bench_results["ราคา"],
        }
        results.append(row_info)

    # สร้าง DataFrame สรุป
    df_results = pd.DataFrame(results)
    out_csv = os.path.join(output_dir, "datasize_experiment_results.csv")
    df_results.to_csv(out_csv, index=False, encoding="utf-8-sig")

    print("\n" + "=" * 75)
    print(" 📊 สรุปผลการทดลองขนาดข้อมูล (Data Size Comparison Table)")
    print("=" * 75)
    print(df_results.to_string(index=False))
    print("=" * 75)

    print("\n💡 ข้อสังเกตและบทสรุปสำหรับการสอน:")
    print("  1. ที่ 500 - 2,000 รีวิว: ข้อมูลน้อยเกินไป คำที่ปรากฏร่วมกันเป็นความบังเอิญ ผลลัพธ์จึงคลาดเคลื่อน")
    print("  2. ที่ 10,000 รีวิว: เริ่มเห็นหมวดหมู่คำชัดเจน (เช่น กาแฟ เริ่มมี ชา/เครื่องดื่ม)")
    print("  3. ที่ 40,000 รีวิว: ได้ผลลัพธ์ที่แม่นยำและเสถียร คำสะกดผิดในบริบทเดียวกันปรากฏครบถ้วน")
    print(f"\nบันทึกตารางผลลัพธ์ที่: {out_csv}\n")


if __name__ == "__main__":
    run_experiment()
