import urllib.request
import re
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

save_dir = r"c:\Users\Asus\Desktop\Ancient Chinese Texts Project\public\dunhuang_caves"
os.makedirs(save_dir, exist_ok=True)

caves = ['0320', '0321', '0322']

for cave_id in caves:
    url = f"https://www.e-dunhuang.com/cave/10.0001/0001.0001.{cave_id}"
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8')
    except Exception as e:
        print(f"Failed to fetch cave {cave_id}: {e}")
        continue
    
    print(f"\n=================== CAVE {cave_id} ===================")
    
    # 提取标题与信息
    title = re.search(r'<title>(.*?)</title>', html)
    if title:
        print("Title:", title.group(1))
    
    # 查找所有图片 URL
    img_urls = set()
    for m in re.finditer(r'(?:src|href|url|data-src)=["\']([^"\']+\.(?:jpg|png|jpeg|webp))["\']', html, re.I):
        u = m.group(1)
        if not u.startswith('http'):
            u = 'https://www.e-dunhuang.com' + ('/' if not u.startswith('/') else '') + u
        img_urls.add(u)
        
    # 查找关联的数据接口或者 pano xml / json / static images
    print(f"Found {len(img_urls)} direct image URLs:")
    for u in sorted(img_urls):
        print("  -", u)
        
    # 查找页面中内嵌的数据对象或 pano/krpano xml
    xml_matches = re.findall(r'[\'"]([^\'"]+\.xml[^\'"]*)[\'"]', html)
    if xml_matches:
        print(f"Found XML/Krpano files: {xml_matches}")
        
    js_matches = re.findall(r'var\s+([a-zA-Z0-9_]+)\s*=\s*(\{.*?\});', html, re.S)
    for var_name, var_val in js_matches:
        if any(k in var_val for k in ['photo', 'pic', 'image', 'path']):
            print(f"JS Variable {var_name}: {var_val[:200]}...")

