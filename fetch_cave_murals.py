import urllib.request
import re
import xml.etree.ElementTree as ET
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

save_base = r"c:\Users\Asus\Desktop\Ancient Chinese Texts Project\public\dunhuang_caves"
os.makedirs(save_base, exist_ok=True)

caves = {
    '0320': '莫高窟第320窟_盛唐',
    '0321': '莫高窟第321窟_初唐',
    '0322': '莫高窟第322窟_初唐'
}

for cave_id, cave_name in caves.items():
    cave_dir = os.path.join(save_base, f"cave_{cave_id}")
    os.makedirs(cave_dir, exist_ok=True)
    
    # 1. 概览大图
    overview_url = f"https://cdn.e-dunhuang.com/SOURCES/10.0001/0001/0001/{cave_id}/05/1/1.jpg"
    print(f"\n[{cave_name}] 正在获取数据...")
    
    try:
        req = urllib.request.Request(overview_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            with open(os.path.join(cave_dir, "overview.jpg"), "wb") as f:
                f.write(data)
        print(f"  ✓ 成功下载主室全貌图: overview.jpg ({len(data)} bytes)")
    except Exception as e:
        print(f"  ✗ 概览图下载失败: {e}")
        
    # 2. 解析 tour.xml 获取所有壁面/视角场景
    xml_url = f"https://cdn.e-dunhuang.com/VR/zh_CN/10.0001/0001/0001/{cave_id}/06/1/tour.xml"
    try:
        req = urllib.request.Request(xml_url, headers=headers)
        xml_text = urllib.request.urlopen(req, timeout=15).read().decode('utf-8')
        with open(os.path.join(cave_dir, "tour.xml"), "w", encoding="utf-8") as f:
            f.write(xml_text)
            
        # 查找 scene 标签
        root = ET.fromstring(xml_text)
        scenes = root.findall('.//scene')
        print(f"  ✓ 找到 {len(scenes)} 个壁画场景/视角:")
        
        for idx, scene in enumerate(scenes):
            s_name = scene.attrib.get('name', f'scene_{idx}')
            s_title = scene.attrib.get('title', s_name)
            thumb_url = scene.attrib.get('thumburl', '')
            print(f"    - [{idx+1}] {s_title} ({s_name}): thumb={thumb_url}")
            
            # 如果有 preview 或 thumb
            if thumb_url:
                if not thumb_url.startswith('http'):
                    full_thumb = f"https://cdn.e-dunhuang.com/VR/zh_CN/10.0001/0001/0001/{cave_id}/06/1/{thumb_url}"
                else:
                    full_thumb = thumb_url
                try:
                    req_t = urllib.request.Request(full_thumb, headers=headers)
                    with urllib.request.urlopen(req_t, timeout=10) as resp:
                        t_data = resp.read()
                        with open(os.path.join(cave_dir, f"thumb_{s_name}.jpg"), "wb") as f:
                            f.write(t_data)
                except Exception as ex:
                    pass

            # 查找 image / cube / preview 标签
            preview = scene.find('preview')
            if preview is not None and 'url' in preview.attrib:
                p_url = preview.attrib['url']
                if not p_url.startswith('http'):
                    full_p_url = f"https://cdn.e-dunhuang.com/VR/zh_CN/10.0001/0001/0001/{cave_id}/06/1/{p_url}"
                else:
                    full_p_url = p_url
                try:
                    req_p = urllib.request.Request(full_p_url, headers=headers)
                    with urllib.request.urlopen(req_p, timeout=10) as resp:
                        p_data = resp.read()
                        with open(os.path.join(cave_dir, f"preview_{s_name}.jpg"), "wb") as f:
                            f.write(p_data)
                except Exception as ex:
                    pass

    except Exception as e:
        print(f"  ✗ 解析 tour.xml 失败: {e}")

print("\n敦煌莫高窟 320、321、322 窟壁画资源抓取完成！")
