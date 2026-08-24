import urllib.request
import xml.etree.ElementTree as ET
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

save_base = r"c:\Users\Asus\Desktop\Ancient Chinese Texts Project\public\dunhuang_caves"

face_names = {
    'f': '前壁_东壁',
    'b': '后壁_西壁佛龛',
    'l': '左壁_南壁',
    'r': '右壁_北壁',
    'u': '窟顶_藻井与四披',
    'd': '地面'
}

caves = ['0320', '0321', '0322']

for cave_id in caves:
    cave_dir = os.path.join(save_base, f"cave_{cave_id}")
    xml_path = os.path.join(cave_dir, "tour.xml")
    if not os.path.exists(xml_path):
        continue
        
    print(f"\n=================== 正在下载 莫高窟第{cave_id}窟 各壁面高清壁画 ===================")
    
    with open(xml_path, 'r', encoding='utf-8') as f:
        xml_text = f.read()
    
    root = ET.fromstring(xml_text)
    scenes = root.findall('.//scene')
    
    base_cdn = f"https://cdn.e-dunhuang.com/VR/zh_CN/10.0001/0001/0001/{cave_id}/06/1/"
    
    for scene in scenes:
        s_title = scene.attrib.get('title', '未知场景')
        # 获取 vr cube url
        cube_vr = scene.find('.//image[@if="webvr.isenabled"]/cube')
        if cube_vr is None:
            cube_vr = scene.find('.//image/cube')
            
        if cube_vr is not None and 'url' in cube_vr.attrib:
            vr_template = cube_vr.attrib['url']
            print(f"  场景 [{s_title}]: 模板 = {vr_template}")
            
            for face_key, face_desc in face_names.items():
                if face_key == 'd':  # 排除地面以节省空间，或者保留
                    pass
                face_rel_url = vr_template.replace('%s', face_key)
                face_full_url = base_cdn + face_rel_url
                
                out_filename = f"{s_title}_{face_desc}_{face_key}.jpg".replace('/', '_').replace('\\', '_')
                out_filepath = os.path.join(cave_dir, out_filename)
                
                try:
                    req = urllib.request.Request(face_full_url, headers=headers)
                    with urllib.request.urlopen(req, timeout=15) as resp:
                        data = resp.read()
                        with open(out_filepath, 'wb') as out_f:
                            out_f.write(data)
                        print(f"    ✓ 成功下载: {out_filename} ({len(data)} bytes)")
                except Exception as e:
                    print(f"    ✗ 下载失败 {face_full_url}: {e}")

print("\n🎉 全部莫高窟 320、321、322 窟各个壁面高清图像抓取下载完毕！")
