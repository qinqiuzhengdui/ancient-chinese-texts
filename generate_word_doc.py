import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document()

# 页面边距
sections = doc.sections
for section in sections:
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)

# 设置默认字体
style_normal = doc.styles['Normal']
font = style_normal.font
font.name = 'Microsoft YaHei'
font.size = Pt(10.5)
font.color.rgb = RGBColor(0x2B, 0x21, 0x1A)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_callout(text_list, title='【核心要义】', bg_color='F0F7F8', border_color='1A535C'):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
            <w:top w:val="none"/>
            <w:right w:val="none"/>
            <w:bottom w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_after = Pt(3)
    r_title = p.add_run(f'{title}\n')
    r_title.bold = True
    r_title.font.color.rgb = RGBColor(0x1A, 0x53, 0x5C)
    r_title.font.size = Pt(10.5)
    
    for t in text_list:
        p_t = cell.add_paragraph()
        p_t.paragraph_format.line_spacing = 1.25
        p_t.paragraph_format.space_after = Pt(2)
        r = p_t.add_run(t)
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0x3B, 0x2A, 0x1A)
    doc.add_paragraph()

def add_image_helper(img_path, caption, width_inch=5.5):
    if os.path.exists(img_path):
        try:
            # 居中插入图片
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(4)
            p.add_run().add_picture(img_path, width=Inches(width_inch))
            
            # 居中配图题
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(8)
            r = p_cap.add_run(caption)
            r.font.size = Pt(9.0)
            r.font.italic = True
            r.font.color.rgb = RGBColor(0x7A, 0x69, 0x5B)
        except Exception as e:
            p_err = doc.add_paragraph()
            p_err.add_run(f"[图片加载失败 {os.path.basename(img_path)}: {e}]")
    else:
        p_err = doc.add_paragraph()
        p_err.add_run(f"[未找到图片资源: {img_path}]")

# 主标题
p_title = doc.add_paragraph()
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_title.paragraph_format.space_before = Pt(12)
p_title.paragraph_format.space_after = Pt(4)
r_main = p_title.add_run('中华古籍与敦煌数字壁画智慧化服务平台')
r_main.font.size = Pt(20)
r_main.font.bold = True
r_main.font.color.rgb = RGBColor(0x8B, 0x26, 0x1E)

p_sub = doc.add_paragraph()
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_sub.paragraph_format.space_after = Pt(14)
r_sub = p_sub.add_run('《云游壁画修复师与多视角人机叙事共创》专项实施方案')
r_sub.font.size = Pt(14)
r_sub.font.bold = True
r_sub.font.color.rgb = RGBColor(0x5C, 0x43, 0x2D)

p_hr = doc.add_paragraph()
p_hr.paragraph_format.space_after = Pt(12)
p_hr_run = p_hr.add_run('━'*42)
p_hr_run.font.color.rgb = RGBColor(0xD4, 0xAF, 0x37)
p_hr.alignment = WD_ALIGN_PARAGRAPH.CENTER

# ==============================================================================
# 三、 实施步骤
# ==============================================================================
h1 = doc.add_paragraph()
h1.paragraph_format.space_before = Pt(16)
h1.paragraph_format.space_after = Pt(8)
r_h1 = h1.add_run('三、 实施步骤（Implementation Methodology）')
r_h1.font.size = Pt(15)
r_h1.font.bold = True
r_h1.font.color.rgb = RGBColor(0x8B, 0x26, 0x1E)

p_lead = doc.add_paragraph()
p_lead.paragraph_format.line_spacing = 1.35
p_lead.paragraph_format.space_after = Pt(8)
p_lead.add_run('本项目以莫高窟第 257 窟（北魏 · 鹿王本生图与须摩提女因缘故事画）为核心实体锚点，紧扣“云游壁画修复师”人机协同修复路径推演与“多视角人机叙事共创”两大创新机制，划分为四个递进阶段推进：')

add_callout([
    '• 第一阶段：多维数据底座构建与病害谱系建模（数据准备与知识图谱）',
    '• 第二阶段：多算法分支生成与人机协同推演闭环开发（模型研发与端侧实现）',
    '• 第三阶段：多视角人机叙事共创与短视频生成管线打通（叙事共创与社群赋能）',
    '• 第四阶段：候场区 AR 空间计算与全域部署推广（场景落地与资产沉淀）'
], title='【实施路线总览】', bg_color='F9F6F0', border_color='8B261E')

# 1.1 第一阶段
h2_1 = doc.add_paragraph()
h2_1.paragraph_format.space_before = Pt(10)
h2_1.paragraph_format.space_after = Pt(4)
r2_1 = h2_1.add_run('1. 第一阶段：多维数据底座构建与病害谱系建模')
r2_1.font.size = Pt(12)
r2_1.font.bold = True
r2_1.font.color.rgb = RGBColor(0x1A, 0x53, 0x5C)

items_p1 = [
    ('（1）超高清壁画数字化切片采集与多光谱数据对齐：', '整理提取莫高窟第257窟、320窟、321窟、322窟等核心洞窟的高精度数字化测绘数据；结合紫外荧光、红外反射、X射线荧光（XRF）及拉曼光谱，建立“视觉图像-微观颜料-底层线描”多模态对齐矩阵。'),
    ('（2）壁画物理病害多分类表征建模：', '系统梳理莫高窟典型病害谱系，构建“矿物颜料氧化黑化（铅丹变色）”、“地仗层空鼓与酥碱起甲”、“水渍盐析与结构性裂隙”三大高频病害特征库与语义分割掩模（Masks）。'),
    ('（3）敦煌学人文历史考据专家知识库搭建：', '结构化整合北魏至盛唐时期的天然矿物颜料成分（赤铁矿土红、铅丹、石绿、青金石）、绘制技法工序（北朝凹凸晕染法、铁线描、沥粉堆金）、图像志构图惯例（人大于山、连环故事画带、佛龛造像规制）以及国际文物保护伦理准则（《威尼斯宪章》最小干预、真实性、可逆性原则）。')
]
for title, desc in items_p1:
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_after = Pt(4)
    r_t = p.add_run(title)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(0x8B, 0x26, 0x1E)
    p.add_run(desc)

# 1.2 第二阶段
h2_2 = doc.add_paragraph()
h2_2.paragraph_format.space_before = Pt(10)
h2_2.paragraph_format.space_after = Pt(4)
r2_2 = h2_2.add_run('2. 第二阶段：多算法分支生成与人机协同推演闭环开发')
r2_2.font.size = Pt(12)
r2_2.font.bold = True
r2_2.font.color.rgb = RGBColor(0x1A, 0x53, 0x5C)

items_p2 = [
    ('（1）构建专用 4 步高清图像修复流水线（Pipeline）：', '打通“频域去网格（2D-FFT 陷波滤波）→ 图像去模糊（Restormer MDTA）→ 残差移位扩散超分（ResShift 4~15步快速采样）→ 色彩保真校正（Reinhard Lab 空间对齐）”完整管线，实现微观纹理与高频细节的真实感重建。'),
    ('（2）研发 U-Net 与扩散模型驱动的多假设修复分支推演引擎：', '针对特定病害区域实时生成 3 个不同技术假说的分支路径：① 分支 A（激进全彩复原）：全彩强行重绘覆盖黑斑，视觉冲击强但存在风格漂移与过度推测风险；② 分支 B（原真性保留与最小干预）：仅修复物理裂隙，完整保留氧化黑化历史痕迹，严守文保底线（推荐）；③ 分支 C（光谱虚拟回溯）：基于拉曼光谱测定在数字孪生层构建“北魏原始设色”可切换图层，实现与现状图无损双镜对照。'),
    ('（3）开发“云游壁画修复师”移动小程序与 Web 端交互中枢：', '打造沉浸式四步交互工坊（病害诊断视窗 → 3大算法分支比对 → 人文考据专家库提示 → 用户校验打标与证书生成），小程序端整包严格控制在 1.43 MB（低于微信 2.0MB 限制），确保极速秒开。')
]
for title, desc in items_p2:
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_after = Pt(4)
    r_t = p.add_run(title)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(0x8B, 0x26, 0x1E)
    p.add_run(desc)

# 1.3 第三阶段
h2_3 = doc.add_paragraph()
h2_3.paragraph_format.space_before = Pt(10)
h2_3.paragraph_format.space_after = Pt(4)
r2_3 = h2_3.add_run('3. 第三阶段：多视角人机叙事共创与短视频生成管线打通')
r2_3.font.size = Pt(12)
r2_3.font.bold = True
r2_3.font.color.rgb = RGBColor(0x1A, 0x53, 0x5C)

items_p3 = [
    ('（1）第 257 窟《须摩提女因缘》故事画多局部拆解：', '选取“须摩提女请佛”（北壁中段）与“五百力士移山”（北壁与西壁北段衔接处）两大经典局部作为共创实体切片；依托大语言模型与知识图谱自动生成佛教因果、女性命运社会史、图像学美术史 3 大视角的叙事草稿。'),
    ('（2）多模态叙事编辑与个性化语音合成（TTS）：', '提供轻量化脚本编辑器，支持用户自主微调叙事焦点，并选择“庄重大气（纪录片）”、“戏剧评书（故事流）”、“青年学者（学术科普）”、“慈悲梵音（沉浸式）”等多样化配音风格，一键自动化合成 1080P AI 叙事短视频。'),
    ('（3）“民间阐释数据库”沉淀与社群分发：', '共创成果自动上云归档，汇聚为持续动态更新 of 敦煌民间阐释数字资产，支持一键分享至社交平台。')
]
for title, desc in items_p3:
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_after = Pt(4)
    r_t = p.add_run(title)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(0x8B, 0x26, 0x1E)
    p.add_run(desc)

# 1.4 第四阶段
h2_4 = doc.add_paragraph()
h2_4.paragraph_format.space_before = Pt(10)
h2_4.paragraph_format.space_after = Pt(4)
r2_4 = h2_4.add_run('4. 第四阶段：候场区 AR 空间计算与全域部署推广')
r2_4.font.size = Pt(12)
r2_4.font.bold = True
r2_4.font.color.rgb = RGBColor(0x1A, 0x53, 0x5C)

items_p4 = [
    ('（1）景区候场区 AR 虚实对照系统部署：', '基于空间计算与轻量化 AR 追踪，游客在候场区扫描洞窟标识或导览图，即可在移动端触发壁画劣化现状与 AI 虚拟修复的虚实叠加视图；点击特定纹饰直接获取文化故事，有效消化候场时间，前置吸收背景知识，缩短实体洞窟停留时间。'),
    ('（2）结构化数字资产沉淀与版权确权：', '沉淀带有人文校验标签的高清复原图像，形成“原始残缺图 → 算法分支生成图 → 最终校验复原图”的可溯源结构化数据链条，生成标准化数字母版库。'),
    ('（3）跨场景通用迁移框架固化：', '固化“图像净化+分支推演+AR对照+故事嵌入”的标准展陈架构，向云冈、龙门、麦积山等石窟寺及各类古代墓葬壁画场景迁移推广。')
]
for title, desc in items_p4:
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_after = Pt(4)
    r_t = p.add_run(title)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(0x8B, 0x26, 0x1E)
    p.add_run(desc)

# ==============================================================================
# 四、 技术支撑
# ==============================================================================
h1_tech = doc.add_paragraph()
h1_tech.paragraph_format.space_before = Pt(18)
h1_tech.paragraph_format.space_after = Pt(8)
r_tech = h1_tech.add_run('四、 技术支撑（Technical Architecture & Support）')
r_tech.font.size = Pt(15)
r_tech.font.bold = True
r_tech.font.color.rgb = RGBColor(0x8B, 0x26, 0x1E)

p_tech_lead = doc.add_paragraph()
p_tech_lead.paragraph_format.line_spacing = 1.35
p_tech_lead.paragraph_format.space_after = Pt(8)
p_tech_lead.add_run('本项目深度融合前沿计算机视觉深度学习、多模态大语言模型、轻量化移动端全栈工程与空间计算技术，构筑了高内聚、低耦合的技术支撑体系：')

# 技术矩阵表格
tbl_tech = doc.add_table(rows=5, cols=3)
tbl_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
tbl_tech.autofit = False

headers = ['技术维度', '核心算法 / 技术选型', '关键能力与应用场景']
col_widths = [Inches(1.5), Inches(2.2), Inches(2.8)]

hdr_cells = tbl_tech.rows[0].cells
for idx, title in enumerate(headers):
    hdr_cells[idx].width = col_widths[idx]
    set_cell_background(hdr_cells[idx], '8B261E')
    set_cell_margins(hdr_cells[idx], top=80, bottom=80, left=100, right=100)
    p = hdr_cells[idx].paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(title)
    r.font.bold = True
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

data_tech = [
    ('图像超清修复与分支推演', 'Restormer (MDTA)\nResShift (Diffusion)\nVQ-VAE / Reinhard', '去网格、去模糊、4~15步快速扩散超分，Lab空间色彩保真校正，构建多假设修复分支'),
    ('大模型与多模态叙事', 'DeepSeek-V3 / Qwen-2.5-VL\nCosyVoice / ChatTTS', '解析壁画题记与图像志知识图谱，驱动佛教/社会史/图像学3重视角草稿生成与多语气TTS配音'),
    ('移动端与Web全栈工程', '微信小程序原生 (WXML/JS)\nReact 18 + TS + Vite 8\nFastAPI 异步微服务', '1.43MB 超轻量化移动端秒开，Web端100%~400%无级滚轮缩放与发光标点，GPU算力集群调度'),
    ('空间计算与文保风控', 'SLAM 空间几何对齐\nHITL 人机协同校验链条', '候场区AR虚实对照；严设文保伦理防线，沉淀“残缺图-算法分支图-校验复原图”可溯源数据链')
]

for row_idx, row_data in enumerate(data_tech):
    row_cells = tbl_tech.rows[row_idx + 1].cells
    bg = 'FAF7F0' if row_idx % 2 == 0 else 'FFFFFF'
    for c_idx, val in enumerate(row_data):
        row_cells[c_idx].width = col_widths[c_idx]
        set_cell_background(row_cells[c_idx], bg)
        set_cell_margins(row_cells[c_idx], top=70, bottom=70, left=100, right=100)
        p = row_cells[c_idx].paragraphs[0]
        p.paragraph_format.line_spacing = 1.2
        r = p.add_run(val)
        r.font.size = Pt(9.0)
        if c_idx == 0:
            r.font.bold = True
            r.font.color.rgb = RGBColor(0x8B, 0x26, 0x1E)

doc.add_paragraph().paragraph_format.space_after = Pt(6)

tech_details = [
    ('1. 核心深度学习视觉与超分辨率模型集群', [
        '• Restormer（图像去模糊/去噪）：基于高效 Transformer 架构（MDTA多深度卷积头变换注意力机制），在不损失高频边缘的前提下去除扫描运动与对焦模糊。',
        '• ResShift（残差移位扩散超分辨率模型）：结合 VQ-VAE 潜在特征空间表示，构建残差移位转移核，将传统扩散模型数百步采样缩减至 4~15 步快速生成，逼真重建矿物颗粒与微观纹理。',
        '• Frequency Descreening（频域去网格）：利用 2D 快速傅里叶变换（FFT）自适应滤除高频网点与纸纹噪声。',
        '• Reinhard 色彩保真算法：在符合人类视觉感知的 Lab 空间对齐均值与方差，消除扩散超分算法带来的色偏与过饱和。'
    ]),
    ('2. 大语言模型（LLM）与知识图谱协同中枢', [
        '• DeepSeek-V3 / Qwen-2.5-VL 多模态大模型：负责解析敦煌壁画题记、经文典籍与图像志元素。',
        '• 动态 Prompt 工程体系：内置佛教因果、女性命运社会史、图像学演变三套结构化模板，驱动多视角草稿与分镜编排。',
        '• 语音合成（TTS）引擎：集成 CosyVoice 与 ChatTTS，自适应切换纪录片庄重、戏剧评书、学术科普、慈悲梵音等多重语气。'
    ]),
    ('3. 移动端与全栈全流程工程架构', [
        '• 微信小程序原生轻量化开发：严格进行包体管控（总包仅 1.43 MB），完全在微信 2.0MB 限制内，实现横屏高清壁画画廊、微观发光标点与修复工坊秒开。',
        '• Web 现代化全屏交互端：基于 React 18 + TypeScript + Vite 8 构建，支持 16:9 全景沉浸画廊、100%~400% 鼠标滚轮无级缩放与拖拽漫游。',
        '• 高性能后端微服务：FastAPI 架构部署于 Linux GPU 服务器（Ubuntu 22.04 + CUDA 12.x），实现高并发推理调度。'
    ]),
    ('4. 人机协同（Human-in-the-Loop, HITL）与文保伦理风控机制', [
        '• 规则与算法双重约束：严设不可逾越的文保伦理“防线”，在算法生成界面明确标注分支属性（如“存在过度推测风险”、“坚守文保底线”）。',
        '• 完整结构化溯源链条：建立“原始残缺图 → 算法分支生成图 → 人文校验复原图”数据存储格式，确保每一次人机互动均具备可溯源 of 元数据标签。'
    ])
]

for section_title, bullets in tech_details:
    h3 = doc.add_paragraph()
    h3.paragraph_format.space_before = Pt(8)
    h3.paragraph_format.space_after = Pt(2)
    r_h3 = h3.add_run(section_title)
    r_h3.font.size = Pt(11)
    r_h3.font.bold = True
    r_h3.font.color.rgb = RGBColor(0x1A, 0x53, 0x5C)
    
    for b in bullets:
        p_b = doc.add_paragraph()
        p_b.paragraph_format.line_spacing = 1.25
        p_b.paragraph_format.space_after = Pt(2)
        r_b = p_b.add_run(b)
        r_b.font.size = Pt(9.5)

# ==============================================================================
# 五、 预期效果（图文并茂展示 1111 - 1117 真实产出成果）
# ==============================================================================
h1_eff = doc.add_paragraph()
h1_eff.paragraph_format.space_before = Pt(18)
h1_eff.paragraph_format.space_after = Pt(8)
r_eff = h1_eff.add_run('五、 预期效果（Expected Outcomes & Social Value）')
r_eff.font.size = Pt(15)
r_eff.font.bold = True
r_eff.font.color.rgb = RGBColor(0x8B, 0x26, 0x1E)

p_eff_intro = doc.add_paragraph()
p_eff_intro.paragraph_format.line_spacing = 1.35
p_eff_intro.paragraph_format.space_after = Pt(8)
p_eff_intro.add_run('本项目已打通完整的电脑端（Web）沉浸漫游大厅与移动端（微信小程序）人机协同推演环境，各项可视化成果已成功落地部署。以下结合系统实测截图展现系统的核心成果与预期成效：')

# 5.1 电脑端成果
h2_eff1 = doc.add_paragraph()
h2_eff1.paragraph_format.space_before = Pt(12)
h2_eff1.paragraph_format.space_after = Pt(4)
r_eff1 = h2_eff1.add_run('1. 电脑端（Web）高精数字化建设成果')
r_eff1.font.size = Pt(12)
r_eff1.font.bold = True
r_eff1.font.color.rgb = RGBColor(0x1A, 0x53, 0x5C)

p_eff1_desc = doc.add_paragraph()
p_eff1_desc.paragraph_format.line_spacing = 1.3
p_eff1_desc.paragraph_format.space_after = Pt(6)
p_eff1_desc.add_run('PC 端平台成功实现 16:9 全景“云游敦煌”交互大厅，以莫高窟九层楼断崖实景为基底，支持看壁画、看文物、看古建、看期刊等悬浮交互（图 5.1）；针对莫高窟第 257 窟的核心壁画《九色鹿本生图》（图 5.2）与《须摩提女因缘图》（图 5.3），系统实现了 100%~400% 无级缩放与拖拽漫游，去除画面文字遮挡，并将微观标点精简为 14px 半透明小巧发光点，点击即可展开矿物颜料、技法工序与图像志微观考据。')

# 插入 1111, 1112, 1113
add_image_helper(r'C:\Users\Asus\Desktop\新建文件夹\1111.png', '图 5.1 PC端“云游敦煌”悬浮交互大厅')
add_image_helper(r'C:\Users\Asus\Desktop\新建文件夹\1112.png', '图 5.2 莫高窟第257窟南壁《九色鹿本生经变》高清微观解析大厅')
add_image_helper(r'C:\Users\Asus\Desktop\新建文件夹\1113.png', '图 5.3 莫高窟第257窟北壁《须摩提女因缘》主室坐佛与五百力士移山解析大厅')

# 5.2 手机端成果
h2_eff2 = doc.add_paragraph()
h2_eff2.paragraph_format.space_before = Pt(12)
h2_eff2.paragraph_format.space_after = Pt(4)
r_eff2 = h2_eff2.add_run('2. 手机端（微信小程序）移动交互与人机协同成果')
r_eff2.font.size = Pt(12)
r_eff2.font.bold = True
r_eff2.font.color.rgb = RGBColor(0x1A, 0x53, 0x5C)

p_eff2_desc = doc.add_paragraph()
p_eff2_desc.paragraph_format.line_spacing = 1.3
p_eff2_desc.paragraph_format.space_after = Pt(6)
p_eff2_desc.add_run('移动端小程序（整包仅 1.43 MB，图 5.4）成功集成了“云游壁画修复师”人机协同修复路径推演弹窗（图 5.5），用户可参与矿物颜料氧化黑化等病害的诊断、3 大算法修复分支的推演决策，并基于专家证据库打标校验。此外，小程序支持横屏壁画浏览器模式（图 5.6、图 5.7），用户可点击前部人字披屋顶、须摩提女燃香请佛等发光小标点，无损查阅深度考据卡片。')

# 插入 1114, 1115, 1116, 1117
add_image_helper(r'C:\Users\Asus\Desktop\新建文件夹\1114.png', '图 5.4 微信小程序端“云游敦煌”功能大厅', width_inch=3.0)
add_image_helper(r'C:\Users\Asus\Desktop\新建文件夹\1115.png', '图 5.5 微信小程序端“云游壁画修复师 · 人机协同推演”病害诊断与算法分支比对', width_inch=3.0)
add_image_helper(r'C:\Users\Asus\Desktop\新建文件夹\1116.png', '图 5.6 微信小程序端第257窟“全貌”人字披屋顶橡木结构图像学解析', width_inch=3.0)
add_image_helper(r'C:\Users\Asus\Desktop\新建文件夹\1117.png', '图 5.7 微信小程序端第257窟“北壁”须摩提女燃香请佛图画解析', width_inch=3.0)

# 5.3 业务与社会价值
h2_eff3 = doc.add_paragraph()
h2_eff3.paragraph_format.space_before = Pt(12)
h2_eff3.paragraph_format.space_after = Pt(4)
r_eff3 = h2_eff3.add_run('3. 预期社会效益与行业价值')
r_eff3.font.size = Pt(12)
r_eff3.font.bold = True
r_eff3.font.color.rgb = RGBColor(0x1A, 0x53, 0x5C)

effects_bullets = [
    '• 突破性技术成效：首创文化遗产人机协同全流程可溯源数据链，打通“原始残缺图-算法分支图-人文校验图”闭环，明确算法复原的伦理边界，防止过度修复。',
    '• 创新性科普价值：通过游戏化推演普及“存真”、“最小干预”等高端文物保护伦理；让同一面壁画在佛教、社会史、美术史多视角共创中，沉淀为民间持续更新的阐释数据库。',
    '• 卓越的文旅提效与产业赋能：候场区 AR 空间叠加虚实对照，将壁画背景知识前置吸收，预计可将洞窟内平均停留时间优化 15%~20%，极大缓解脆弱石窟承载力；沉淀的高频视觉符号转化为标准数字母版库，大幅缩短文创二次开发周期。',
    '• 跨场景通用示范效应：标准化的“图像净化+分支推演+AR对照+故事嵌入”可解耦交互架构，可无缝向云冈、龙门、麦积山等石窟寺及墓葬壁画等文化遗产迁移复制。'
]
for b in effects_bullets:
    p_b = doc.add_paragraph()
    p_b.paragraph_format.line_spacing = 1.25
    p_b.paragraph_format.space_after = Pt(3)
    r_b = p_b.add_run(b)
    r_b.font.size = Pt(9.5)

# 保存
out_paths = [
    r'c:\Users\Asus\Desktop\项目实施方案_步骤_技术支撑_预期效果.docx',
    r'c:\Users\Asus\Desktop\Ancient Chinese Texts Project\项目实施方案_步骤_技术支撑_预期效果.docx'
]

for p in out_paths:
    doc.save(p)
    print(f'Successfully saved Word document with image assets to: {p}')
