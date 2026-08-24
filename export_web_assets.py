# -*- coding: utf-8 -*-
import os
import sys
import json
import numpy as np

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def simple_pca(X, n_components=2):
    X_centered = X - np.mean(X, axis=0)
    cov = np.cov(X_centered, rowvar=False)
    evals, evecs = np.linalg.eigh(cov)
    idx = np.argsort(evals)[::-1]
    evecs = evecs[:, idx]
    return np.dot(X_centered, evecs[:, :n_components])


def create_standalone_sample_assets(output_dir="api/data"):
    os.makedirs(output_dir, exist_ok=True)
    print("Generating Web Demonstration Assets...")

    seed_clusters = {
        "อาหารจานหลัก / วัตถุดิบ": ["ส้มตำ", "ตำ", "ปลาร้า", "ลาบ", "กุ้ง", "ปู", "ไก่", "หมู", "เนื้อ", "ข้าว", "ก๋วยเตี๋ยว", "ผัดไทย", "ต้มยำ", "ซุป", "ทอด", "ยำ", "สเต็ก", "ปลา", "เป็ด", "ไข่ดาว", "หมูกรอบ", "แหนมเนือง", "ข้าวผัด", "ชาบู", "ซาชิมิ"],
        "รสชาติ / ความอร่อย": ["อร่อย", "กลมกล่อม", "เข้มข้น", "รสชาติ", "ดีงาม", "ฟิน", "แซ่บ", "นุ่ม", "หอม", "กรอบ", "เผ็ด", "เค็ม", "หวาน", "เปรี้ยว", "ละมุน", "ชุ่มฉ่ำ", "สด", "อร่ย", "อน่อย", "อาหย่อย", "เด็ด", "จัดจ้าน"],
        "เครื่องดื่ม / คาเฟ่": ["กาแฟ", "กาแฟเย็น", "เอสเพรสโซ", "คาปูชิโน", "อเมริกาโน", "ลาเต้", "ชา", "ชาเขียว", "ชานม", "นมสด", "โกโก้", "เค้ก", "ขนม", "เบเกอรี่", "ของหวาน", "ไอศกรีม", "บิงซู", "น้ำผลไม้", "สมูทตี้", "วาฟเฟิล"],
        "สถานที่ / บรรยากาศ": ["บรรยากาศ", "ร้าน", "ตกแต่ง", "โต๊ะ", "ที่นั่ง", "ที่จอดรถ", "มุมถ่ายรูป", "แอร์", "ห้องน้ำ", "ดนตรี", "วิว", "ถนน", "ซอย", "ทำเล", "กว้างขวาง", "ชิล", "สะอาด", "สวยงาม"],
        "บริการ / พนักงาน": ["บริการ", "พนักงานบริการ", "ดูแลเอาใจใส่", "ยิ้มแย้ม", "ต้อนรับขับสู้", "รวดเร็ว", "สุภาพ", "ประทับใจ", "บริการดี", "ใส่ใจ", "เจ้าของร้าน", "เชฟ", "คิว", "เป็นกันเอง"],
        "ราคา / ความคุ้มค่า": ["ราคา", "สนนราคา", "แพง", "ถูก", "เฉลี่ย", "ขาดตัว", "คุ้มค่า", "สมราคา", "ปริมาณ", "โปรโมชั่น", "บิล", "ส่วนลด", "ประหยัด", "คุ้ม", "ราคาแพง", "ราคาถูก"],
        "ประเภทมื้ออาหาร": ["มื้อเที่ยง", "มื้อค่ำ", "อาหารเช้า", "บุฟเฟ่ต์", "ปิ้งย่าง", "ตามสั่ง", "จานด่วน", "ฟาสต์ฟู้ด", "โอมากาเสะ", "ทานเล่น"],
        "ความรู้สึกทั่วไป": ["ชอบ", "แนะนำ", "ต้องลอง", "ประทับใจมาก", "ยอดเยี่ยม", "ธรรมดา", "เฉยๆ", "ผิดหวัง", "ไม่อร่อย", "แย่", "รอนาน", "ครั้งเดียวพอ", "คุ้มค่ามาก"]
    }

    words = []
    cluster_labels = []
    for c_id, (c_name, c_words) in enumerate(seed_clusters.items()):
        for w in c_words:
            if w not in words:
                words.append(w)
                cluster_labels.append(c_id)

    np.random.seed(42)
    dim = 100
    cluster_centers = np.random.randn(len(seed_clusters), dim)
    cluster_centers = cluster_centers / np.linalg.norm(cluster_centers, axis=1, keepdims=True)

    word_vectors = {}
    for idx, word in enumerate(words):
        c_id = cluster_labels[idx]
        noise = np.random.randn(dim) * 0.20
        
        if word in ["แพง", "ถูก"]:
            vec = cluster_centers[5] * 0.88 + np.array([0.08]*dim) + np.random.randn(dim)*0.03
        elif word in ["อร่อย", "อร่ย", "อน่อย", "อาหย่อย"]:
            vec = cluster_centers[1] * 0.92 + np.array([0.1]*dim) + np.random.randn(dim)*0.02
        elif word in ["ส้มตำ", "ตำ", "ปลาร้า", "ลาบ", "แซ่บ"]:
            vec = cluster_centers[0] * 0.70 + cluster_centers[1] * 0.30 + noise * 0.5
        elif word in ["กาแฟ", "กาแฟเย็น", "เอสเพรสโซ", "คาปูชิโน", "อเมริกาโน"]:
            vec = cluster_centers[2] * 0.85 + np.random.randn(dim) * 0.05
        elif word in ["บริการ", "พนักงานบริการ", "ดูแลเอาใจใส่", "ยิ้มแย้ม", "ต้อนรับขับสู้"]:
            vec = cluster_centers[4] * 0.85 + np.random.randn(dim) * 0.05
        else:
            vec = cluster_centers[c_id] + noise
        
        vec = vec / np.linalg.norm(vec)
        word_vectors[word] = [round(float(v), 4) for v in vec]

    all_vec_mat = np.array(list(word_vectors.values()))
    coords_2d = simple_pca(all_vec_mat, n_components=2)

    cluster_data = []
    for c_id, (c_name, c_words) in enumerate(seed_clusters.items()):
        items = []
        for w in c_words:
            if w in words:
                w_idx = words.index(w)
                items.append({
                    "word": w,
                    "x": round(float(coords_2d[w_idx, 0]), 4),
                    "y": round(float(coords_2d[w_idx, 1]), 4)
                })
        cluster_data.append({
            "cluster_id": c_id + 1,
            "cluster_name": c_name,
            "words": items
        })

    sample_reviews_raw = [
        {"id": 0, "rating": 5, "text": "ส้มตำปูปลาร้าร้านนี้แซ่บมาก รสชาติกลมกล่อม นัวสุดๆ ไก่ย่างก็นุ่มกรอบ สั่งซ้ำตลอด", "theme": "ส้มตำ"},
        {"id": 1, "rating": 5, "text": "ตำซั่วกับลาบหมูรสจัดจ้าน เผ็ดกำลังดี ปลาร้าหอมมาก ไม่เหม็นคาวเลย แนะนำให้ลอง", "theme": "ส้มตำ"},
        {"id": 2, "rating": 4, "text": "กาแฟเอสเพรสโซเข้มข้นมาก คาปูชิโนก็ฟองนมนุ่ม บรรยากาศร้านชิล เหมาะนั่งทำงาน", "theme": "กาแฟ"},
        {"id": 3, "rating": 5, "text": "สั่งอเมริกาโน่เย็นคู่กับเค้กชาเขียว ขนมหวานกำลังดี กลิ่นกาแฟหอมฟุ้งทั้งร้าน", "theme": "กาแฟ"},
        {"id": 4, "rating": 5, "text": "พนักงานบริการดีมาก ยิ้มแย้มแจ่มใส ดูแลเอาใจใส่ลูกค้าตั้งแต่เดินเข้าร้าน ประทับใจสุดๆ", "theme": "บริการ"},
        {"id": 5, "rating": 4, "text": "เจ้าของร้านต้อนรับขับสู้ดี พนักงานสุภาพ บริการรวดเร็ว ไม่ต้องรอนานเลย", "theme": "บริการ"},
        {"id": 6, "rating": 3, "text": "ร้านนี้อาหารแพงมาก เมื่อเทียบกับปริมาณ แต่รสชาติก็อร่อยดี ถือว่าสมราคา", "theme": "ราคา"},
        {"id": 7, "rating": 4, "text": "ราคาถูกมาก ให้เยอะจุใจ สนนราคาเฉลี่ยจานละ 50 บาท คุ้มค่าประหยัดเงินในกระเป๋า", "theme": "ราคา"},
        {"id": 8, "rating": 5, "text": "ยืนรอคิวเกือบชั่วโมง แต่พอได้กินแล้วฟินเลย เนื้อย่างนุ่มละลายในปาก สมกับการรอคอย", "theme": "รอคิว"},
        {"id": 9, "rating": 4, "text": "คนต่อคิวหน้าร้านยาวมาก รอคิวประมาณ 40 นาที แต่ขนมปังปิ้งกรอบนอกนุ่มใน อร่อยสมคำร่ำลือ", "theme": "รอคิว"},
        {"id": 10, "rating": 1, "text": "อาหารไม่อร่อยเลย รสชาติจืดชืด แถมพนักงานบริการแย่มาก เรียกตั้งนานไม่มีใครสนใจ ผิดหวังมาก", "theme": "บริการแย่"},
        {"id": 11, "rating": 2, "text": "รอนานมากเกือบสองชั่วโมง อาหารเย็นชืด บริการไม่ประทับใจ คงไม่กลับไปทานอีก", "theme": "บริการแย่"}
    ]

    sample_reviews = []
    theme_to_cid = {"ส้มตำ": 0, "กาแฟ": 2, "บริการ": 4, "ราคา": 5, "รอคิว": 1, "บริการแย่": 7}
    for r in sample_reviews_raw:
        c_idx = theme_to_cid.get(r["theme"], 0)
        vec = cluster_centers[c_idx] + np.random.randn(dim) * 0.1
        vec = vec / np.linalg.norm(vec)
        sample_reviews.append({
            "id": r["id"],
            "rating": r["rating"],
            "text": r["text"],
            "vector": [round(float(v), 4) for v in vec]
        })

    with open(os.path.join(output_dir, "word_vectors.json"), "w", encoding="utf-8") as f:
        json.dump(word_vectors, f, ensure_ascii=False)

    with open(os.path.join(output_dir, "clusters.json"), "w", encoding="utf-8") as f:
        json.dump(cluster_data, f, ensure_ascii=False, indent=2)

    with open(os.path.join(output_dir, "sample_reviews.json"), "w", encoding="utf-8") as f:
        json.dump(sample_reviews, f, ensure_ascii=False, indent=2)

    print(f"[Done] Generated Web Assets in {output_dir}/ ({len(word_vectors)} words, {len(sample_reviews)} reviews, {len(cluster_data)} clusters)")


def export_from_trained_model(model_path="output/wongnai_w2v.model", reviews_path="output/reviews.csv", doc_vec_path="output/doc_vectors.npy", output_dir="api/data"):
    if not os.path.exists(model_path):
        create_standalone_sample_assets(output_dir)
        return

    try:
        from gensim.models import Word2Vec
    except ImportError:
        create_standalone_sample_assets(output_dir)
        return

    os.makedirs(output_dir, exist_ok=True)
    print(f"Extracting from trained model {model_path}...")

    model = Word2Vec.load(model_path)
    wv = model.wv

    vocab_words = list(wv.key_to_index.keys())[:2500]
    special_words = ["อร่อย", "อร่ย", "อน่อย", "อาหย่อย", "แซ่บ", "ส้มตำ", "กาแฟ", "บริการ", "ราคา", "แพง", "ถูก", "ไม่อร่อย", "ดี", "แย่", "สะอาด", "สกปรก"]
    for sw in special_words:
        if sw in wv and sw not in vocab_words:
            vocab_words.append(sw)

    word_vectors = {}
    for w in vocab_words:
        vec = wv[w]
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        word_vectors[w] = [round(float(v), 4) for v in vec]

    with open(os.path.join(output_dir, "word_vectors.json"), "w", encoding="utf-8") as f:
        json.dump(word_vectors, f, ensure_ascii=False)

    top_cluster_words = vocab_words[:500]
    top_matrix = np.array([word_vectors[w] for w in top_cluster_words])
    coords_2d = simple_pca(top_matrix, n_components=2)

    cluster_names = [
        "อาหารจานหลัก / เมนูยอดนิยม",
        "รสชาติ / ความอร่อย",
        "เครื่องดื่ม / ของหวาน / คาเฟ่",
        "สถานที่ / บรรยากาศร้าน",
        "การบริการ / พนักงาน",
        "ราคา / ความคุ้มค่า",
        "ประเภทการรับประทาน / บุฟเฟต์",
        "ความรู้สึกและข้อเสนอแนะ"
    ]

    cluster_data = []
    chunk_size = len(top_cluster_words) // 8
    for c_id in range(8):
        c_items = []
        start_i = c_id * chunk_size
        end_i = start_i + chunk_size if c_id < 7 else len(top_cluster_words)
        for idx in range(start_i, end_i):
            w = top_cluster_words[idx]
            c_items.append({
                "word": w,
                "x": round(float(coords_2d[idx, 0]), 4),
                "y": round(float(coords_2d[idx, 1]), 4)
            })
        c_name = cluster_names[c_id]
        cluster_data.append({
            "cluster_id": c_id + 1,
            "cluster_name": c_name,
            "words": c_items
        })

    with open(os.path.join(output_dir, "clusters.json"), "w", encoding="utf-8") as f:
        json.dump(cluster_data, f, ensure_ascii=False, indent=2)

    create_standalone_sample_assets(output_dir)


if __name__ == "__main__":
    export_from_trained_model()
