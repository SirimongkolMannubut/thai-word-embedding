# -*- coding: utf-8 -*-
"""
02_demo_classroom.py
โปรแกรมสาธิตการสอนในห้องเรียน (Interactive Classroom Demo)
ประกอบแผนการสอน: Word Embedding กับภาษาไทย (Wongnai 40,000 Reviews + Gensim)
"""

import os
import sys
import random
import numpy as np
import pandas as pd

try:
    from gensim.models import Word2Vec
except ImportError:
    print("[Error] กรุณาติดตั้ง gensim: pip install gensim")
    sys.exit(1)

try:
    from sklearn.cluster import KMeans
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    print("[Error] กรุณาติดตั้ง scikit-learn: pip install scikit-learn")
    sys.exit(1)


MODEL_PATH = "output/wongnai_w2v.model"
DOC_VEC_PATH = "output/doc_vectors.npy"
REVIEWS_PATH = "output/reviews.csv"


def check_files():
    missing = []
    for path in [MODEL_PATH, DOC_VEC_PATH, REVIEWS_PATH]:
        if not os.path.exists(path):
            missing.append(path)
    if missing:
        print("\n[!] ไม่พบไฟล์ที่จำเป็นต่อไปนี้:")
        for m in missing:
            print(f"    - {m}")
        print("\nกรุณารันสคริปต์เทรนโมเดลก่อน:")
        print("    python 01_train_word2vec.py\n")
        sys.exit(1)


def load_resources():
    print("กำลังโหลดโมเดล Word2Vec และข้อมูลรีวิว...")
    model = Word2Vec.load(MODEL_PATH)
    doc_vectors = np.load(DOC_VEC_PATH)
    df_reviews = pd.read_csv(REVIEWS_PATH)
    print(f"โหลดเสร็จสมบูรณ์! (Vocabulary: {len(model.wv.key_to_index):,} คำ | รีวิว: {len(df_reviews):,} ใบ)\n")
    return model, doc_vectors, df_reviews


# ==========================================
# เมนู 1: ค้นหาคำใกล้เคียง (ช่วงที่ 2 & 3)
# ==========================================
def demo_similar_words(model):
    wv = model.wv
    print("\n" + "=" * 65)
    print(" [ช่วงที่ 2 & 3] เมนู 1: ค้นหาคำที่มีความหมาย/บริบทใกล้เคียง")
    print("=" * 65)
    print("คำแนะนำสำหรับการสอน:")
    print("  1. เริ่มต้นด้วยคำว่า 'อร่อย' เพื่อเทียบกับคำที่นักศึกษาเดาไว้หน้าห้อง")
    print("  2. สังเกตคำสะกดผิดที่ปนมา เช่น 'อร่ย', 'อน่อย', 'อาหย่อย'")
    print("  3. ให้นักศึกษาเสนอคำสด ๆ (คำสำรองที่ผลสวย: ส้มตำ, กาแฟ, บริการ, ราคา)")
    print("  (พิมพ์ 'back' เพื่อกลับสู่เมนูหลัก)\n")

    while True:
        try:
            word = input(">> ป้อนคำที่ต้องการค้นหา: ").strip()
        except (KeyboardInterrupt, EOFError):
            break

        if not word or word.lower() == "back":
            break

        if word not in wv:
            print(f" [!] คำว่า '{word}' ไม่มีใน Vocabulary (คำนี้อาจปรากฏน้อยกว่า min_count=10)")
            # แนะนำคำใกล้เคียงที่มีคำนี้เป็น substring
            candidates = [w for w in wv.key_to_index.keys() if word in w][:5]
            if candidates:
                print(f"     คำที่ใกล้เคียงที่มีในโมเดล: {', '.join(candidates)}")
            print("     ลองคำตัวอย่าง: อร่อย, ส้มตำ, กาแฟ, บริการ, ราคา, ก๋วยเตี๋ยว, หวาน\n")
            continue

        similar_items = wv.most_similar(word, topn=10)
        print(f"\nผลลัพธ์คำที่ใกล้เคียงที่สุดกับ '{word}':")
        print("-" * 55)
        for rank, (w, score) in enumerate(similar_items, 1):
            bar = "█" * int(score * 20)
            print(f"  {rank:2d}. {w:<16}  {score:.4f}  |{bar:<20}|")
        print("-" * 55)

        # ชวนคุยประเด็นคำสะกดผิดกรณีคำว่า 'อร่อย'
        if word == "อร่อย":
            misspellings = [w for w in ["อร่ย", "อน่อย", "อาหย่อย", "อร่อยย", "อร่อยยย"] if w in wv]
            if misspellings:
                print("\n  [จุดสังเกตชวนคิดสำหรับห้องเรียน]:")
                print(f"  พบคำสะกดผิดใน Vocabulary: {', '.join(misspellings)}")
                for m in misspellings:
                    sim = wv.similarity("อร่อย", m)
                    print(f"   -> sim('อร่อย', '{m}') = {sim:.4f}")
                print("  💡 ถามนักศึกษา: 'ทำไมคำสะกดผิดถึงโผล่มาใกล้คำที่สะกดถูก ทั้งที่ไม่มีพจนานุกรม?'")
                print("  💡 คำตอบ: โมเดลดูแค่บริบท! คนที่พิมพ์ผิดใช้คำในประโยคแบบเดียวกับคำถูก")
        print()


# ==========================================
# เมนู 2: ข้อจำกัดของ Word2Vec (ช่วงที่ 4)
# ==========================================
def demo_limitations(model):
    wv = model.wv
    print("\n" + "=" * 65)
    print(" [ช่วงที่ 4] เมนู 2: ข้อจำกัดของ Word2Vec (คำตรงข้ามแต่บริบทเดียวกัน)")
    print("=" * 65)

    pairs = [
        ("แพง", "ถูก"),
        ("อร่อย", "ไม่อร่อย"),
        ("ดี", "แย่"),
        ("สะอาด", "สกปรก"),
        ("เร็ว", "ช้า"),
    ]

    print(f"{'คู่คำ (ตรงข้ามกัน)':<25} {'Cosine Similarity':<20} {'การประเมิน':<20}")
    print("-" * 65)

    for w1, w2 in pairs:
        if w1 in wv and w2 in wv:
            sim = wv.similarity(w1, w2)
            eval_str = "⚠️ คล้ายกันสูงมาก!" if sim > 0.6 else "ปานกลาง"
            print(f" '{w1}' <-> '{w2}'{'':<10} {sim:.4f}{'':<12} {eval_str}")
        else:
            print(f" '{w1}' <-> '{w2}'{'':<10} (คำไม่อยู่ในโมเดล)")

    print("-" * 65)
    print("\n💡 ประเด็นอภิปรายในห้องเรียน:")
    print("  คำถาม: 'แพง' กับ 'ถูก' ความหมายตรงข้ามกัน ทำไมโมเดลบอกว่าคล้ายกันสูงถึง ~0.77?")
    print("  เฉลย  : ทั้งสองคำอยู่ในบริบทประโยคแบบเดียวกันเสมอ เช่น:")
    print("          'ร้านนี้อาหาร [แพง] มาก แต่รสชาติดี'")
    print("          'ร้านนี้อาหาร [ถูก] มาก แต่รสชาติดี'")
    print("          โมเดลวัดความคล้ายของ 'บริบทแวดล้อม (Context)' ไม่ใช่ 'ความหมายเชิงตรรกะ'")
    print("\n⚠️ ข้อควรระวังในการนำไปใช้จริง:")
    print("  ถ้าเอาเวกเตอร์นี้ไปจำแนกอารมณ์รีวิว (Sentiment Analysis: ชม vs ด่า) โดยตรง")
    print("  โมเดลจะแยก 'อร่อย' กับ 'ไม่อร่อย' หรือ 'แพง' กับ 'ถูก' ได้ยากมาก!\n")

    input("กด Enter เพื่อกลับสู่เมนูหลัก...")


# ==========================================
# เมนู 3: ค้นหารีวิวที่พูดเรื่องเดียวกัน (ช่วงที่ 5)
# ==========================================
def demo_doc_similarity(model, doc_vectors, df_reviews):
    print("\n" + "=" * 65)
    print(" [ช่วงที่ 5] เมนู 3: ค้นหารีวิวที่พูดเรื่องเดียวกัน (Document Similarity)")
    print("=" * 65)
    print("คำแนะนำสำหรับการสอน:")
    print("  - พิมพ์ 'r' เพื่อสุ่มรีวิวขึ้นมา 1 ใบ หรือระบุหมายเลขรีวิว (0 - {})".format(len(df_reviews)-1))
    print("  - ชี้ให้นักศึกษาเห็นว่าบางรีวิวไม่มีคำซ้ำกันเลย แต่พูดถึงประเด็นเดียวกัน")
    print("  - อธิบายการรวม Word Vectors -> Document Vector (Average Pooling)")
    print("  - เชื่อมโยงกับ Netflix, Shopee Search และ AI RAG\n")

    # Normalize doc vectors เพื่อให้คำนวณ cosine similarity ได้รวดเร็วผ่าน dot product
    norms = np.linalg.norm(doc_vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1e-10
    norm_doc_vectors = doc_vectors / norms

    while True:
        try:
            val = input(">> ป้อนเลขรีวิว (0-{}) หรือพิมพ์ 'r' เพื่อสุ่ม (พิมพ์ 'back' เพื่อออก): ".format(len(df_reviews)-1)).strip()
        except (KeyboardInterrupt, EOFError):
            break

        if not val or val.lower() == "back":
            break

        if val.lower() == "r":
            target_idx = random.randint(0, len(df_reviews) - 1)
        else:
            try:
                target_idx = int(val)
                if target_idx < 0 or target_idx >= len(df_reviews):
                    print(f" [!] ระบุตัวเลขระหว่าง 0 ถึง {len(df_reviews)-1}")
                    continue
            except ValueError:
                print(" [!] กรุณาป้อนตัวเลข หรือ 'r'")
                continue

        target_row = df_reviews.iloc[target_idx]
        target_text = str(target_row["review_text"])
        target_rating = target_row.get("rating", "N/A")

        print("\n" + "=" * 65)
        print(f"📌 รีวิวต้นแบบ [ID: {target_idx}] (Rating: {target_rating} ดาว):")
        print(f"\"{target_text}\"")
        print("=" * 65)

        # คำนวณ Cosine Similarity ระหว่างรีวิวต้นแบบกับรีวิวทั้งหมด 40,000 ใบ
        target_vec = norm_doc_vectors[target_idx]
        scores = np.dot(norm_doc_vectors, target_vec)

        # เรียงลำดับจากมากไปน้อย (ยกเว้นตัวเอง)
        top_indices = np.argsort(scores)[::-1]
        top_indices = [idx for idx in top_indices if idx != target_idx][:5]

        print("\n🔍 5 รีวิวที่มีเนื้อหา/บริบทใกล้เคียงที่สุด (จากทั้งหมด 40,000 ใบ):")
        print("-" * 65)
        for rank, match_idx in enumerate(top_indices, 1):
            m_row = df_reviews.iloc[match_idx]
            m_text = str(m_row["review_text"])
            m_rating = m_row.get("rating", "N/A")
            m_score = scores[match_idx]

            # ย่อข้อความถ้ายาวเกินไป
            display_text = m_text if len(m_text) <= 150 else m_text[:147] + "..."
            print(f" [{rank}] ID: {match_idx} | ความคล้าย: {m_score:.4f} | เรตติ้ง: {m_rating} ดาว")
            print(f"     \"{display_text}\"\n")
        print("-" * 65)


# ==========================================
# เมนู 4: จัดกลุ่มคำด้วย k-Means (ช่วงที่ 6)
# ==========================================
def demo_kmeans_clustering(model, n_clusters=8, top_n_words=800):
    print("\n" + "=" * 65)
    print(f" [ช่วงที่ 6] เมนู 4: จัดกลุ่มคำด้วย k-Means ({n_clusters} คลัสเตอร์)")
    print("=" * 65)
    print(f"กำลังนำคำที่พบบ่อย Top {top_n_words} คำ มาจัดกลุ่มตามพิกัด Vector 100 มิติ...\n")

    wv = model.wv
    # ดึง top_n_words ที่พบบ่อยที่สุด
    words = list(wv.key_to_index.keys())[:top_n_words]
    vectors = np.array([wv[w] for w in words])

    # รัน KMeans
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(vectors)

    cluster_words = {i: [] for i in range(n_clusters)}
    for word, label in zip(words, labels):
        cluster_words[label].append(word)

    print("ผลการจัดกลุ่มอัตโนมัติ (ให้แต่ละกลุ่มนักศึกษาช่วยกันตั้งชื่อ):")
    print("-" * 65)
    for c_id in range(n_clusters):
        c_list = cluster_words[c_id]
        sample_words = ", ".join(c_list[:12])
        print(f"กลุ่มที่ {c_id + 1} ({len(c_list)} คำ):")
        print(f"   -> ตัวอย่างคำ: {sample_words}")
        print(f"   -> [ให้นักศึกษาตั้งชื่อกลุ่ม]: __________________________\n")

    print("-" * 65)
    print("💡 คำถามปิดท้าย:")
    print("  'ใครเป็นคนบอกโปรแกรมว่าคำพวกนี้ควรอยู่กลุ่มเดียวกัน?'")
    print("  เฉลย: ไม่มีใครบอก! โปรแกรมจัดกลุ่มจากตัวเลขเวกเตอร์ 100 มิติที่เรียนรู้จากบริบทล้วน ๆ\n")

    input("กด Enter เพื่อกลับสู่เมนูหลัก...")


# ==========================================
# เมนู 5: ทำไมโลกจริงไม่เทรนเอง (ส่วนที่ 4)
# ==========================================
def demo_corpus_comparison():
    print("\n" + "=" * 65)
    print(" [ส่วนที่ 4] เมนู 5: ทำไมโลกจริงไม่เทรนเอง (ขนาดคลังข้อมูล & Transfer Learning)")
    print("=" * 65)

    table_data = [
        ("รีวิว Wongnai ของเรา", "~4.8 ล้านคำ", "1x (เกณฑ์เปรียบเทียบ)"),
        ("นิยายเล่มหนา 1 เล่ม", "~150,000 คำ", "0.03x"),
        ("วิกิพีเดียไทยทั้งหมด", "หลักสิบล้านคำ", "~5x - 10x"),
        ("Word2Vec ต้นฉบับ (Google)", "หลักแสนล้านคำ (100B+)", "~20,000x"),
    ]

    print(f"{'คลังข้อมูล':<28} {'ขนาดโดยประมาณ':<22} {'สัดส่วนเทียบกับ Wongnai'}")
    print("-" * 65)
    for name, size, ratio in table_data:
        print(f"{name:<28} {size:<22} {ratio}")
    print("-" * 65)

    print("\n💡 ข้อคิดสำคัญ:")
    print("  1. คลังข้อมูล Wongnai เล็กกว่าของ Google ราว 20,000 เท่า")
    print("     แต่ทำงานได้ดีเยี่ยมในโดเมนร้านอาหาร เพราะเป็นคลังเฉพาะทาง (Domain-specific)")
    print("  2. ข้อมูลเฉพาะทางจำนวนพอเหมาะ มักให้ผลลัพธ์ดีกว่าข้อมูลทั่วไปมหาศาลสำหรับงานเฉพาะด้าน")
    print("  3. ในโลกจริงสำหรับงานทั่วไป เราไม่เทรนเองจากศูนย์ (From Scratch)")
    print("     แต่นิยมใช้ Pre-trained Language Models เช่น Thai2Vec, RoBERTa/WangchanBERTa")
    print("     แล้วนำมา Fine-tune ต่อยอด (Transfer Learning) ซึ่งเป็นหัวข้อของบทถัดไป!\n")

    input("กด Enter เพื่อกลับสู่เมนูหลัก...")


# ==========================================
# Main Menu Loop
# ==========================================
def main():
    check_files()
    model, doc_vectors, df_reviews = load_resources()

    while True:
        print("\n" + "=" * 65)
        print("    🎓 โปรแกรมสาธิตการสอน: Word Embedding กับภาษาไทย (Wongnai 40k)")
        print("=" * 65)
        print("  [1] ค้นหาคำที่มีความหมาย/บริบทใกล้เคียง (Most Similar Words) - ช่วงที่ 2 & 3")
        print("  [2] สาธิตข้อจำกัดของโมเดล (Antonyms in Same Context: แพง vs ถูก) - ช่วงที่ 4")
        print("  [3] ค้นหารีวิวที่พูดเรื่องเดียวกัน (Document Similarity Search) - ช่วงที่ 5")
        print("  [4] จัดกลุ่มคำด้วย k-Means (Word Clustering) - ช่วงที่ 6")
        print("  [5] ทำไมโลกจริงไม่เทรนเอง (Corpus Size & Transfer Learning) - ส่วนที่ 4")
        print("  [0] ออกจากโปรแกรม")
        print("=" * 65)

        try:
            choice = input("กรุณาเลือกเมนู (0-5): ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nออกจากโปรแกรม")
            break

        if choice == "1":
            demo_similar_words(model)
        elif choice == "2":
            demo_limitations(model)
        elif choice == "3":
            demo_doc_similarity(model, doc_vectors, df_reviews)
        elif choice == "4":
            demo_kmeans_clustering(model)
        elif choice == "5":
            demo_corpus_comparison()
        elif choice == "0":
            print("\nขอบคุณที่ใช้งานโปรแกรมสาธิต! ขอให้การสอนราบรื่นครับ 🙏\n")
            break
        else:
            print(" [!] เมนูไม่ถูกต้อง กรุณาเลือก 0-5")


if __name__ == "__main__":
    main()
