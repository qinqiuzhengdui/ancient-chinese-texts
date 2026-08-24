import urllib.request
import re
import os
import xml.etree.ElementTree as ET
import sys

sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

save_base = r"c:\Users\Asus\Desktop\Ancient Chinese Texts Project\public\dunhuang_caves\cave_0257"
os.makedirs(save_base, exist_ok=True)

cave_id = '0257'
url = f"https://www.e-dunhuang.com/cave/10.0001/0001.0001.{cave_id}"
print(f"Fetching Cave {cave_id} metadata from: {url}")

try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8')
    title = re.search(r'<title>(.*?)</title>', html)
    if title:
        print("Page Title:", title.group(1))
except Exception as e:
    print(f"Failed to fetch {url}: {e}")

# Fetch tour.xml
tour_xml_url = f"https://cdn.e-dunhuang.com/VR/zh_CN/10.0001/0001/0001/{cave_id}/06/1/tour.xml"
print("Fetching tour.xml from:", tour_xml_url)

face_names = {
    'f': '前壁_东壁',
    'b': '后壁_西壁',
    'l': '左壁_南壁',
    'r': '右壁_北壁',
    'u': '窟顶_藻井与四披',
    'd': '地面'
}

try:
    req_xml = urllib.request.Request(tour_xml_url, headers=headers)
    xml_data = urllib.request.urlopen(req_xml, timeout=15).read()
    with open(os.path.join(save_base, "tour.xml"), "wb") as f:
        f.write(xml_data)
    print("Saved tour.xml successfully!")
    
    root = ET.fromstring(xml_data.decode('utf-8'))
    scenes = root.findall('.//scene')
    print(f"Found {len(scenes)} scenes in Cave 0257:")
    
    base_cdn = f"https://cdn.e-dunhuang.com/VR/zh_CN/10.0001/0001/0001/{cave_id}/06/1/"
    
    for scene in scenes:
        s_name = scene.attrib.get('name', 'scene')
        s_title = scene.attrib.get('title', s_name)
        print(f"\n[Scene: {s_title} ({s_name})]")
        
        cube_vr = scene.find('.//image[@if="webvr.isenabled"]/cube')
        if cube_vr is None:
            cube_vr = scene.find('.//image/cube')
            
        if cube_vr is not None and 'url' in cube_vr.attrib:
            vr_template = cube_vr.attrib['url']
            print(f"  vr_template: {vr_template}")
            
            for face_key, face_desc in face_names.items():
                face_rel_url = vr_template.replace('%s', face_key)
                face_full_url = base_cdn + face_rel_url
                
                clean_title = re.sub(r'[^\w\u4e00-\u9fff]', '_', s_title)
                out_filename = f"{clean_title}_{face_desc}_{face_key}.jpg"
                out_filepath = os.path.join(save_base, out_filename)
                
                try:
                    req_img = urllib.request.Request(face_full_url, headers=headers)
                    with urllib.request.urlopen(req_img, timeout=20) as resp:
                        data = resp.read()
                        with open(out_filepath, 'wb') as out_f:
                            out_f.write(data)
                        print(f"    ✓ 下载成功: {out_filename} ({len(data)} bytes)")
                except Exception as e:
                    print(f"    ✗ 下载失败 {face_full_url}: {e}")

    # Also fetch preview image if available
    preview_url = f"https://cdn.e-dunhuang.com/VR/zh_CN/10.0001/0001/0001/{cave_id}/06/1/panos/1.tiles/preview.jpg"
    try:
        req_p = urllib.request.Request(preview_url, headers=headers)
        p_data = urllib.request.urlopen(req_p, timeout=15).read()
        with open(os.path.join(save_base, "overview.jpg"), "wb") as f:
            f.write(p_data)
        print("    ✓ 成功下载 preview/overview.jpg")
    except Exception as e:
        print("    Overview preview failed:", e)

    print("\n🎉 莫高窟第 257 窟壁画数字化资源抓取完成！")

except Exception as e:
    print("Error parsing / fetching scenes:", e)
