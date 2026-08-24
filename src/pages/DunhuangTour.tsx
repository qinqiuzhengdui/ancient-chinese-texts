import React, { useState, useRef } from 'react';
import './DunhuangTour.css';
import { 
  Sparkles, 
  X, 
  Info, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Minimize2,
  MapPin,
  Sparkle
} from 'lucide-react';

interface IslandItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconType: string;
  className: string;
  description: string;
}

interface HotspotItem {
  id: string;
  x: number; // 百分比 0-100
  y: number; // 百分比 0-100
  title: string;
  subtitle: string;
  content: string;
  pigment?: string;
  technique?: string;
}

interface MuralItem {
  name: string;
  desc: string;
  img: string;
  orient?: string;
  tags?: string[];
  caveTitle?: string;
  hotspots?: HotspotItem[];
}

const DunhuangTour: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedCave, setSelectedCave] = useState<'0257' | '0320' | '0321' | '0322'>('0257');
  
  // 超高清放大检视器状态
  const [zoomedMural, setZoomedMural] = useState<MuralItem | null>(null);
  const [currentMuralIndex, setCurrentMuralIndex] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panPos, setPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullScreenViewer, setIsFullScreenViewer] = useState<boolean>(false);
  
  // 热点标注功能状态
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [activeHotspot, setActiveHotspot] = useState<HotspotItem | null>(null);

  // （一）“云游壁画修复师”人机协同推演状态
  const [restorerDefectKey, setRestorerDefectKey] = useState<'lead_oxidation' | 'scaling'>('lead_oxidation');
  const [restorerBranchIndex, setRestorerBranchIndex] = useState<number>(1);
  const [restorerUserTags, setRestorerUserTags] = useState<{ [key: number]: boolean }>({ 0: true, 1: true, 2: true, 3: true });
  const [repairCertModal, setRepairCertModal] = useState<boolean>(false);

  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  // 6大仙境入口数据
  const islands: IslandItem[] = [
    {
      id: 'murals',
      title: '看壁画',
      subtitle: '经变万象 · 丹青飞天',
      icon: '🎨',
      iconType: 'mural',
      className: 'island-1',
      description: '探索莫高窟第320、321、322窟高清数字壁画，领略盛唐净土与绝美飞天'
    },
    {
      id: 'artifacts',
      title: '看文物',
      subtitle: '千年彩塑 · 藏经秘宝',
      icon: '🏺',
      iconType: 'artifact',
      className: 'island-2',
      description: '品鉴藏经洞珍罕绢画、盛唐彩塑、丝路古乐器与古代供养人发愿文'
    },
    {
      id: 'architecture',
      title: '看古建',
      subtitle: '断崖营窟 · 飞檐木构',
      icon: '🏯',
      iconType: 'architecture',
      className: 'island-3',
      description: '解析莫高窟九层楼（第96窟）、唐代檐阁木结构与三危山道观建筑'
    },
    {
      id: 'journals',
      title: '看期刊',
      subtitle: '敦煌研究 · 学术文脉',
      icon: '📜',
      iconType: 'journal',
      className: 'island-4',
      description: '查阅《敦煌研究》核心学术期刊、石窟考古档案与壁画病害保护专著'
    },
    {
      id: 'videos',
      title: '看视频',
      subtitle: '数字影像 · 纪录光影',
      icon: '🎬',
      iconType: 'video',
      className: 'island-5',
      description: '沉浸式观看《数字敦煌》、《莫高窟探秘》、《我在敦煌修壁画》等高清影像'
    },
    {
      id: 'comics',
      title: '看漫画',
      subtitle: '佛经变相 · 绘卷传奇',
      icon: '📖',
      iconType: 'comic',
      className: 'island-6',
      description: '生动阅读《九色鹿本生》、《须摩提女因缘》、《玄奘西行》等互动画卷'
    }
  ];

  // 壁画数据（配有真实下载切片及微观热点数据）
  const caveMurals = {
    '0257': {
      title: '莫高窟第257窟（北魏 · 九色鹿本生与须摩提女因缘）',
      tag: '北魏 中心塔柱窟',
      items: [
        {
          name: '主室南壁：鹿王本生故事画（九色鹿长卷）',
          orient: '南壁（左壁）',
          desc: '莫高窟最著名的北魏因缘故事连环画。采用横卷式连环画构图，画面从两端向中间发展，色彩以土红、赭石、石绿为主。',
          tags: ['九色鹿本生', '北魏连环画', '经典因缘', '土红重彩'],
          img: '/dunhuang_caves/cave_0257/主室_左壁_南壁_l.jpg',
          hotspots: [
            {
              id: 'c257-jiuselu-save',
              x: 22,
              y: 48,
              title: '九色神鹿救溺水人',
              subtitle: '舍身救人与知恩誓言',
              content: '九色鹿踏入波涛汹涌的恒河将落水呼号的调达救上岸，调达长跪叩首，发誓绝不向任何人泄露神鹿行踪。',
              pigment: '天然土红、高岭土白、石绿',
              technique: '北魏凹凸晕染法与流畅铁线描'
            },
            {
              id: 'c257-queen-dream',
              x: 52,
              y: 45,
              title: '王后夜梦与贪婪告密',
              subtitle: '调达背信弃义生癞疮',
              content: '王后梦见九色美鹿欲得其皮角，国王悬赏万金。调达见利忘义入宫告密，言未毕而口吐恶疮。',
              pigment: '矿物土黄、炭黑',
              technique: '故事对称分段式构图'
            },
            {
              id: 'c257-king-repent',
              x: 78,
              y: 46,
              title: '九色鹿陈情与国王省悟',
              subtitle: '大慈大悲感化君王',
              content: '九色鹿面对国王军阵昂首挺立、从容陈述始末。国王深为羞愧，下令举国永远禁捕神鹿，惩处恶徒。',
              pigment: '赤铁矿赭石、石青',
              technique: '戏剧张力高潮渲染'
            }
          ]
        },
        {
          name: '主室北壁：须摩提女因缘与五百力士移山',
          orient: '北壁（右壁）',
          desc: '横贯西壁北段与北壁，记录须摩提女燃香请佛与五百力士移山的人机共创核心画面，人大于山，动态磅礴。',
          tags: ['须摩提女', '五百力士移山', '人大于山', '因缘经变'],
          img: '/dunhuang_caves/cave_0257/主室_右壁_北壁_r.jpg',
          hotspots: [
            {
              id: 'c257-xumoti-qingfo',
              x: 28,
              y: 40,
              title: '须摩提女燃香请佛',
              subtitle: '第257窟北壁中段 · 虔诚祈愿',
              content: '须摩提女身着北魏贵族服饰双手捧香炉，面前香云化生莲花。展现婆罗门女外嫁后对信仰的坚持与神圣召唤。',
              pigment: '石绿、朱砂、高岭土',
              technique: '衣褶贴泥条技法与世俗服饰刻画'
            },
            {
              id: 'c257-yishan-strength',
              x: 68,
              y: 52,
              title: '五百力士移山图',
              subtitle: '“人大于山”与自然对抗',
              content: '五百力士肌肉紧绷、拉拽巨山以阻拦佛驾，山体以赭石石绿分层渲染，呈现出北魏底层劳动者的强悍力量。',
              pigment: '赭石、石绿、土黄',
              technique: '夸张人物动态与汉代画像石源流'
            }
          ]
        },
        {
          name: '中心塔柱：四面佛龛与彩塑影塑',
          orient: '中心塔柱',
          desc: '莫高窟早期中心塔柱窟的经典代表。塔柱四面开大龛，内塑一佛二菩萨，龛外整齐布满影塑千佛。',
          tags: ['中心塔柱', '北魏彩塑', '影塑千佛', '支提窟形制'],
          img: '/dunhuang_caves/cave_0257/中心柱南_前壁_东壁_f.jpg',
          hotspots: [
            {
              id: 'c257-pillar-statue',
              x: 50,
              y: 45,
              title: '中心柱东向面主尊坐佛',
              subtitle: '北魏早期造像风格',
              content: '主尊面相方圆，双肩宽厚，身着袒右肩袈裟，衣纹呈阶梯状贴体垂落，具有鲜明的犍陀罗与凉州模式遗风。',
              pigment: '矿彩彩塑、泥胎彩绘',
              technique: '木骨泥塑与高浮雕'
            }
          ]
        },
        {
          name: '窟顶：前部人字披屋顶与平顶',
          orient: '窟顶天顶',
          desc: '前部为人字披顶，后部为平顶。人字披上画椽木与飞天、伎乐天人，模拟汉代传统中原木结构屋顶。',
          tags: ['人字披顶', '仿木结构', '北魏天宫'],
          img: '/dunhuang_caves/cave_0257/主室_窟顶_藻井与四披_u.jpg',
          hotspots: [
            {
              id: 'c257-renzi-roof',
              x: 50,
              y: 35,
              title: '人字披仿木屋顶与天宫乐伎',
              subtitle: '北朝中原建筑形制',
              content: '人字披斜坡上画有一根根檩条椽木，椽间画飞天散花，将建筑营造与神圣佛国完美结合。',
              pigment: '矿物土红、赭石',
              technique: '界画与白描'
            }
          ]
        },
        {
          name: '主室全貌立体概览',
          orient: '立体全景',
          desc: '莫高窟第257窟主室空间全景，中心塔柱巍然耸立，四周通壁为北魏重彩因缘长卷。',
          tags: ['全景空间', '中心塔柱', '北魏代表'],
          img: '/dunhuang_caves/cave_0257/overview.jpg'
        }
      ]
    },
    '0320': {
      title: '莫高窟第320窟（盛唐·最美飞天与极乐净土）',
      tag: '盛唐 代表窟',
      items: [
        {
          name: '主室南壁：释迦说法图与四身最美飞天',
          orient: '南壁（左壁）',
          desc: '盛唐飞天的巅峰之作。虽因矿物颜料氧化而呈古雅沉穆的黑褐色，但线条如行云流水、身姿曼妙，宛若空中飘舞。',
          tags: ['最美飞天', '盛唐线条', '说法图', '青金石'],
          img: '/dunhuang_caves/cave_0320/主室_左壁_南壁_l.jpg',
          hotspots: [
            {
              id: 'feitian-1',
              x: 30,
              y: 26,
              title: '四身最美飞天 · 散花逆风翱翔',
              subtitle: '盛唐飞天最高艺术成就',
              content: '飞天身姿轻盈曼妙，逆风飞行。飘带与祥云随风翻卷，双臂舒展扬撒天花，线条一气呵成，尽显大唐盛世的自信与灵动。',
              pigment: '青金石、朱砂、铅丹（已氧化呈赭褐）',
              technique: '铁线描、沥粉贴金、叠晕渲染'
            },
            {
              id: 'shoufa-main',
              x: 46,
              y: 49,
              title: '释迦牟尼佛 · 说法说法相',
              subtitle: '主尊佛结跏趺坐于须弥座',
              content: '主尊释迦牟尼佛身着通肩袈裟，神态慈悲庄严。背光与头光层层环绕火焰忍冬纹，烘托出佛国世界的肃穆神圣。',
              pigment: '石绿、石青、金箔',
              technique: '中原汉唐凹凸晕染法'
            },
            {
              id: 'feitian-2',
              x: 65,
              y: 24,
              title: '合十乘云飞天 · 梵音清幽',
              subtitle: '双手合十俯冲飘逸姿态',
              content: '飞天双手合十作虔诚礼拜状，头部微倾，双足向后翘起，长巾在空中划出优美抛物线，极富音乐节律感。',
              pigment: '矿物土红、石青',
              technique: '行云流水白描法'
            }
          ]
        },
        {
          name: '主室北壁：观无量寿经变（西方净土）',
          orient: '北壁（右壁）',
          desc: '大唐极乐净土世界的宏大再现。绘有七宝池、八功德水、重檐水榭楼阁与歌舞菩萨，极具盛唐恢弘气象。',
          tags: ['净土经变', '大唐建筑', '舞乐伎', '重彩金碧'],
          img: '/dunhuang_caves/cave_0320/主室_右壁_北壁_r.jpg',
          hotspots: [
            {
              id: 'arch-palace',
              x: 50,
              y: 25,
              title: '极乐水榭楼阁 · 重檐歇山殿堂',
              subtitle: '大唐宫殿营造规制再现',
              content: '重层水榭楼阁耸立于七宝池之上，飞檐斗拱精密复杂，平坐勾栏雕刻精细，真实再现了盛唐长安宫廷与大寺院建筑的原貌。',
              pigment: '赭石、铅白、石绿',
              technique: '界画规矩、焦点透视'
            },
            {
              id: 'dance-music',
              x: 50,
              y: 68,
              title: '七宝池乐舞 · 迦陵频伽与舞伎',
              subtitle: '极乐世界歌舞升平',
              content: '舞伎在花砖琉璃平台上挥动长巾急速旋舞，两旁乐伎分列排箫、横笛、琵琶、拍板，迦陵频伽妙音鸟振翅啼鸣。',
              pigment: '朱砂、石青、雌黄',
              technique: '游丝描、多层平涂'
            }
          ]
        },
        {
          name: '窟顶：云头牡丹宝相花藻井与四披千佛',
          orient: '窟顶藻井',
          desc: '井心绘制盛放的云头宝相牡丹花，色彩斑斓绚丽，周围四披整齐绘制千佛像，结构庄严精密。',
          tags: ['牡丹藻井', '装饰纹样', '四披千佛', '覆斗顶'],
          img: '/dunhuang_caves/cave_0320/主室_窟顶_藻井与四披_u.jpg',
          hotspots: [
            {
              id: 'zaojing-center',
              x: 50,
              y: 50,
              title: '井心：华盖式斗四莲花井心',
              subtitle: '窟顶中心方井画华盖式藻井',
              content: '窟顶中心方井画华盖式藻井，藻井画斗四莲花井心。井心画垂莲和火焰、忍冬、云气纹；井外四周饰垂幔、彩铃。',
              pigment: '青金石、石绿、朱砂、金泥',
              technique: '斗四木构图案化、晕染渐变'
            },
            {
              id: 'zaojing-pattern',
              x: 36,
              y: 36,
              title: '井心环纹：忍冬与云气火焰纹',
              subtitle: '丝绸之路中西交融纹饰',
              content: '中心垂莲外围以连珠纹、忍冬卷草纹与腾跃的火焰纹层层扩散，象征光明普照、生生不息。',
              pigment: '天然石绿、赤铁矿土红',
              technique: '叠晕退晕法'
            },
            {
              id: 'zaojing-drape',
              x: 68,
              y: 32,
              title: '井外四周：华美垂幔与摇曳彩铃',
              subtitle: '模拟真实织锦天帐',
              content: '井外四周精心绘制五彩织锦垂幔，悬挂飘动彩铃与流苏璎珞，微风拂动，极具织物垂坠感。',
              pigment: '铅白、银朱、石青',
              technique: '细密白描与图案填色'
            },
            {
              id: 'four-slopes-buddha',
              x: 78,
              y: 72,
              title: '四披坡面：千佛坐像序列',
              subtitle: '万佛朝宗之空间意境',
              content: '覆斗顶四披均匀排列整齐划一的千佛禅坐像，一佛一光，井然有序，形成令人震撼的信仰矩阵。',
              pigment: '矿物重彩',
              technique: '版印定位、手工勾绘'
            }
          ]
        },
        {
          name: '主室西壁：主佛龛与锁子甲天王浮塑',
          orient: '西壁佛龛',
          desc: '西壁佛龛内塑一佛二弟子二菩萨，龛外天王身着唐代锁子甲，为莫高窟说法图中罕见形制。',
          tags: ['西壁佛龛', '唐代铠甲', '彩塑浮雕'],
          img: '/dunhuang_caves/cave_0320/主室_后壁_西壁佛龛_b.jpg',
          hotspots: [
            {
              id: 'fokan-statue',
              x: 50,
              y: 48,
              title: '西壁主龛 · 一佛二弟子二菩萨',
              subtitle: '初唐至盛唐经典彩塑组合',
              content: '佛龛深敞，佛像面庞圆润丰满，阿难迦叶侍立两侧，菩萨婷婷玉立，衣褶随体态起伏自然垂落。',
              pigment: '矿彩敷泥、贴金',
              technique: '圆雕与浮雕结合'
            },
            {
              id: 'fokan-armor',
              x: 78,
              y: 52,
              title: '护法天王 · 唐代锁子连环甲',
              subtitle: '大唐军事武备实物印证',
              content: '天王身披典型的唐代山字甲与锁子甲，脚蹬乌皮靴，怒目圆睁脚踏夜叉，威武庄严。',
              pigment: '金粉、矿物黑',
              technique: '沥粉金线堆塑'
            }
          ]
        },
        {
          name: '主室全貌立体概览',
          orient: '立体全景',
          desc: '莫高窟第320窟主室全景视野，覆斗顶方形殿堂式结构，壁画色彩保存极为艳丽。',
          tags: ['全景空间', '方形殿堂', '盛唐营造'],
          img: '/dunhuang_caves/cave_0320/overview.jpg',
          hotspots: [
            {
              id: 'overview-roof',
              x: 50,
              y: 20,
              title: '覆斗顶窟形营造',
              subtitle: '仿中原汉式殿堂屋顶',
              content: '模拟中原木结构殿堂的四角攒尖屋顶，四披向内收拢，将视觉中心完全聚集于窟顶藻井。',
              pigment: '建筑营造力学',
              technique: '开凿岩体与泥胎抹面'
            },
            {
              id: 'overview-space',
              x: 50,
              y: 65,
              title: '主室中央礼佛空间',
              subtitle: '方砖铺地与礼忏动线',
              content: '窟室内宽敞方正，四周壁面铺满宏大经变画，供古代信徒绕窟右旋礼拜观想。',
              pigment: '莲花方砖',
              technique: '三维空间对称营造'
            }
          ]
        }
      ]
    },
    '0321': {
      title: '莫高窟第321窟（初唐/武周·湛蓝佛国与十轮经变）',
      tag: '初唐 武周时期',
      items: [
        {
          name: '主室北壁：阿弥陀经变（水榭楼阁与舞乐）',
          orient: '北壁（右壁）',
          desc: '整面北壁绘制阿弥陀净土。画面中歇山顶楼阁巍峨耸立，花砖地面铺陈，七宝池中白鹤孔雀翔集，舞伎翩翩起舞。',
          tags: ['水榭楼阁', '青金石蓝', '净土舞乐', '透视法'],
          img: '/dunhuang_caves/cave_0321/主室_右壁_北壁_r.jpg',
          hotspots: [
            {
              id: 'c321-lapis-bg',
              x: 50,
              y: 28,
              title: '青金石湛蓝天幕',
              subtitle: '丝绸之路阿富汗矿物颜料',
              content: '第321窟全窟大面积使用极其贵重的进口青金石矿物颜料，历经千年依然呈现出深邃通透的宝石蓝光芒。',
              pigment: '纯天然青金石（Lapis Lazuli）',
              technique: '纯矿物研磨胶结'
            },
            {
              id: 'c321-stage',
              x: 50,
              y: 72,
              title: '花砖平台与对舞乐伎',
              subtitle: '胡旋舞与大唐宫廷雅乐',
              content: '两名舞伎在绚丽的花砖平台上相向对舞，长巾飞旋如环，两侧乐队演奏筚篥、笙簧，极尽乐舞之妙。',
              pigment: '石绿、铅白、朱砂',
              technique: '高超动势捕捉'
            }
          ]
        },
        {
          name: '主室南壁：《十轮经变》（地藏救苦图）',
          orient: '南壁（左壁）',
          desc: '莫高窟保存最早、最完整的十轮经变。详细展示地藏菩萨分身救度地狱众生的宏大愿景与生动情节。',
          tags: ['地藏信仰', '十轮经变', '因缘故事'],
          img: '/dunhuang_caves/cave_0321/主室_左壁_南壁_l.jpg',
          hotspots: [
            {
              id: 'c321-dizang',
              x: 48,
              y: 42,
              title: '地藏菩萨分身像',
              subtitle: '戴披帛声闻比丘形相',
              content: '地藏菩萨作沙门僧侣装扮，头戴风帽披帛，右手持锡杖，左手托如意宝珠，大慈大悲救度六道受苦众生。',
              pigment: '矿物褐黄、石青',
              technique: '线刻与重彩'
            }
          ]
        },
        {
          name: '窟顶：八层重叠团花井心藻井',
          orient: '窟顶藻井',
          desc: '藻井层级丰富达八层之多，四角以灵动的蝴蝶花角饰点缀，纹样精巧繁复，色彩对比鲜明。',
          tags: ['八层团花', '蝴蝶花纹', '初唐纹饰'],
          img: '/dunhuang_caves/cave_0321/主室_窟顶_藻井与四披_u.jpg',
          hotspots: [
            {
              id: 'c321-zaojing-layer',
              x: 50,
              y: 50,
              title: '八层重叠宝相团花',
              subtitle: '武周时期繁复装饰风格',
              content: '井心图案层层套叠达八重，中心为重瓣莲花，外层环绕几何菱格、卷草与宝相花，繁密而秩序井然。',
              pigment: '青金石、石绿、铅白',
              technique: '规矩几何纹饰构图'
            }
          ]
        },
        {
          name: '主室西壁：重层雕栏佛龛与凭栏天人',
          orient: '西壁佛龛',
          desc: '西壁深龛穹窿顶绘有重层雕栏，凭栏俯视的天人神态各异，空间纵深感与透视构图极具创新。',
          tags: ['重层雕栏', '空间透视', '凭栏天人'],
          img: '/dunhuang_caves/cave_0321/主室_后壁_西壁佛龛_b.jpg'
        },
        {
          name: '主室全貌立体概览',
          orient: '立体全景',
          desc: '莫高窟第321窟主室整体数字化重现，全窟以深邃湛蓝的青金石色为基调。',
          tags: ['全景空间', '青金石基底', '初唐覆斗'],
          img: '/dunhuang_caves/cave_0321/overview.jpg'
        }
      ]
    },
    '0322': {
      title: '莫高窟第322窟（初唐·缠枝葡萄与胡貌天王）',
      tag: '初唐 覆斗小窟',
      items: [
        {
          name: '窟顶：缠枝葡萄纹藻井与十六身飞天',
          orient: '窟顶藻井',
          desc: '极具丝路异域风情的葡萄石榴缠枝纹样，周围环绕十六身飞行天人，或抱笙或抚琴，俯冲仰翔，动感十足。',
          tags: ['缠枝葡萄', '十六飞天', '丝路风情'],
          img: '/dunhuang_caves/cave_0322/主室_窟顶_藻井与四披_u.jpg',
          hotspots: [
            {
              id: 'c322-grape',
              x: 50,
              y: 50,
              title: '井心：缠枝葡萄与石榴纹',
              subtitle: '西域绿洲农业文化传入中原',
              content: '波浪起伏的藤蔓间挂满饱满的葡萄与成熟石榴，是丝绸之路中西物质与视觉艺术交融的经典见证。',
              pigment: '孔雀石绿、朱砂红',
              technique: '植物写生与装饰变形'
            },
            {
              id: 'c322-16feitian',
              x: 28,
              y: 28,
              title: '十六身环绕飞天',
              subtitle: '顺时针凌空追逐飞舞',
              content: '井外边框环绕排列十六身轻盈飞天，各自手持乐器（排箫、阮咸、法螺），动势首尾相接，极具环形律动感。',
              pigment: '矿彩土红、白粉',
              technique: '轻灵飞动画法'
            }
          ]
        },
        {
          name: '主室北壁：阿弥陀净土经变',
          orient: '北壁（右壁）',
          desc: '初唐早期经典构图，佛陀神态庄严慈祥，背光与华盖繁复精美，展现早期敦煌经变画的纯正古风。',
          tags: ['佛国经变', '华盖背光', '纯正古风'],
          img: '/dunhuang_caves/cave_0322/主室_右壁_北壁_r.jpg'
        },
        {
          name: '主室西壁：双层佛龛与胡貌梵相天王像',
          orient: '西壁佛龛',
          desc: '西壁开精巧双层龛，塑一佛二弟子二菩萨二天王。其中天王鼻高翼宽、浓眉大眼，具鲜明的胡人容貌特征。',
          tags: ['双层佛龛', '胡貌天王', '初唐彩塑'],
          img: '/dunhuang_caves/cave_0322/主室_后壁_西壁佛龛_b.jpg',
          hotspots: [
            {
              id: 'c322-hu-tianwang',
              x: 75,
              y: 52,
              title: '胡貌梵相天王彩塑',
              subtitle: '西域昭武九姓或粟特人容貌',
              content: '天王面庞高鼻深目、络腮浓密，目光炯炯，明显吸收了丝路西域各民族面相特征，体现敦煌作为丝路国际大都会的包容气象。',
              pigment: '彩绘泥塑',
              technique: '立体写实塑造'
            }
          ]
        },
        {
          name: '主室南壁：弥勒说法图与供养人群像',
          orient: '南壁（左壁）',
          desc: '构图工整严谨，初唐重彩矿物矿色厚重沉着，下方绘有虔诚肃穆的丝路供养人群像。',
          tags: ['弥勒说法', '供养人像', '矿彩重绘'],
          img: '/dunhuang_caves/cave_0322/主室_左壁_南壁_l.jpg'
        },
        {
          name: '主室全貌立体概览',
          orient: '立体全景',
          desc: '莫高窟第322窟主室殿堂实景，双层西壁佛龛与精美藻井融为一体。',
          tags: ['全景空间', '双层佛龛', '小型殿堂'],
          img: '/dunhuang_caves/cave_0322/overview.jpg'
        }
      ]
    }
  };

  // 打开壁画放大检视器
  const handleOpenZoom = (mural: MuralItem, index: number) => {
    setZoomedMural({
      ...mural,
      caveTitle: caveMurals[selectedCave].title
    });
    setCurrentMuralIndex(index);
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
    setActiveHotspot(null);
  };

  // 放大/缩小控制
  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPos({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
  };

  // 鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomScale(prev => Math.min(prev + 0.25, 4));
    } else {
      setZoomScale(prev => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPanPos({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // 拖拽平移
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomScale > 1) {
      setPanPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 切换上一张/下一张壁画
  const handlePrevMural = () => {
    const list = caveMurals[selectedCave].items;
    const nextIdx = (currentMuralIndex - 1 + list.length) % list.length;
    setCurrentMuralIndex(nextIdx);
    setZoomedMural({
      ...list[nextIdx],
      caveTitle: caveMurals[selectedCave].title
    });
    handleResetZoom();
    setActiveHotspot(null);
  };

  const handleNextMural = () => {
    const list = caveMurals[selectedCave].items;
    const nextIdx = (currentMuralIndex + 1) % list.length;
    setCurrentMuralIndex(nextIdx);
    setZoomedMural({
      ...list[nextIdx],
      caveTitle: caveMurals[selectedCave].title
    });
    handleResetZoom();
    setActiveHotspot(null);
  };

  // 文物数据
  const artifactsData = [
    {
      title: '《引路菩萨图》绢画',
      era: '唐代 · 藏经洞出土（现藏大英博物馆）',
      tag: '绢本设色',
      summary: '描绘引路菩萨手持宝幡引渡亡灵往生极乐净土，右上角绘有盛装贵妇供养人，线条刚劲细腻，色彩斑斓。'
    },
    {
      title: '莫高窟第45窟盛唐彩塑群像',
      era: '盛唐 · 莫高窟第45窟',
      tag: '泥质彩塑',
      summary: '被誉为“东方维纳斯”的盛唐彩塑代表作，菩萨身姿呈“S”型三折枝式，神态慈悲温婉，衣纹如出水之流畅。'
    },
    {
      title: '唐代螺钿紫檀五弦琵琶',
      era: '唐代 · 丝绸之路音乐重器',
      tag: '宫廷乐器',
      summary: '与莫高窟壁画中乐伎所弹奏乐器完美对照，背面以螺钿镶嵌骑驼胡人抚琴图，极具丝路文明互鉴色彩。'
    },
    {
      title: '藏经洞《金刚般若波罗蜜经》',
      era: '唐咸通九年（868年）刻本',
      tag: '世界最早雕版印刷品',
      summary: '世界现存最早标有明确纪年的雕版印刷书籍，首尾完整，刀法古拙雄健，墨色深沉。'
    }
  ];

  // 古建数据
  const archData = [
    {
      title: '莫高窟标志：第96窟九层大佛楼',
      era: '始建于初唐 · 民国改建为九层',
      tag: '断崖飞檐',
      summary: '依山崖而建的巨型依崖木结构建筑，高45米，内护莫高窟第一大佛（高35.5米初唐弥勒坐像）。'
    },
    {
      title: '第196窟唐代木构檐阁',
      era: '晚唐景福二年（893年）',
      tag: '现存唐代木构绝品',
      summary: '我国仅存的几处唐代木结构实物之一，单檐歇山顶，斗栱雄健古朴，展现了晚唐高超的营造技艺。'
    },
    {
      title: '敦煌覆斗顶石窟建筑形制',
      era: '北朝至隋唐时期',
      tag: '石窟建筑营造',
      summary: '模拟中原汉地传统殿堂建筑之“倒斗形”屋顶，兼顾通风采光与壁画绘制的力学结构平衡。'
    },
    {
      title: '汉代玉门关与阳关烽燧遗址',
      era: '西汉武帝时期',
      tag: '边塞防御建筑',
      summary: '黄胶泥土夯筑而成的关隘堡垒，历经两千年风沙侵蚀依然巍然屹立，见证丝绸之路要隘咽喉。'
    }
  ];

  // 期刊数据
  const journalData = [
    {
      title: '《敦煌研究》2025年第6期：莫高窟盛唐壁画颜料光谱分析与数字化保护',
      author: '敦煌研究院保护研究所 课题组',
      tag: '核心期刊 · 文物保护',
      summary: '利用便携式 X 射线荧光与显微拉曼光谱，解析 320 窟最美飞天矿物青金石与朱砂的劣化机制及人机协同修复策略。'
    },
    {
      title: '《敦煌学辑刊》：初唐第321窟十轮经变图式与唐代三阶教信仰考',
      author: '樊锦诗 顾春芳 等',
      tag: '考古与图像学',
      summary: '系统论述初唐武周时期莫高窟壁画中地藏菩萨与十轮经变图式的起源演变，揭示丝路宗教文明交融轨迹。'
    },
    {
      title: '《敦煌石窟全集》：石窟营造制度与画工题记分类研究',
      author: '段文杰 主编',
      tag: '学术专著',
      summary: '全面梳理莫高窟北魏至元代历代营造题记、窟主家族与民间社邑供养人档案，勾勒丝路敦煌社会生活图景。'
    }
  ];

  // 视频数据
  const videoData = [
    {
      title: '大型纪录片《莫高窟探秘：飞天神韵》',
      duration: '45 分钟 · 4K 超清',
      tag: '纪录特辑',
      summary: '跟随敦煌学者深入第320窟特窟，用微距镜头捕捉千年前画工绘制飞天飘带的笔触细节。'
    },
    {
      title: '《我在敦煌修壁画：数字再生纪实》',
      duration: '28 分钟 · 沉浸体验',
      tag: '文保纪实',
      summary: '真实记录现代敦煌文保修复师运用深度学习与传统古法矿彩修复起甲剥落壁画的日常。'
    },
    {
      title: '《数字敦煌：千年莫高窟三维时空全景》',
      duration: '15 分钟 · VR 漫游',
      tag: '数字展陈',
      summary: '通过空间计算与毫米级激光点云扫描，全方位还原莫高窟各朝代洞窟营造的时空演进。'
    }
  ];

  // 漫画数据
  const comicData = [
    {
      title: '《须摩提女因缘》（人机叙事共创）',
      source: '改编自莫高窟第257窟北魏连环画',
      tag: '重点共创画卷',
      summary: '多视角探索须摩提女请佛与五百力士移山，结合佛教因果、北魏社会女性命运与图像学深度推演。'
    },
    {
      title: '《九色鹿本生经》壁画交互绘卷',
      source: '改编自莫高窟第257窟北魏壁画',
      tag: '经变故事连环画',
      summary: '讲述善良九色鹿舍身救起溺水者，溺水者却贪图重赏向国王告密，最终失信自食恶果的经典寓言。'
    },
    {
      title: '《五百强盗成佛记》',
      source: '改编自莫高窟第285窟西魏壁画',
      tag: '因缘故事画',
      summary: '五百强盗作乱被官军俘获受刑，得佛陀点化放下屠刀、洗心革面，最终皈依正道成佛的传奇画卷。'
    },
    {
      title: '《萨埵太子舍身饲虎图》',
      source: '改编自莫高窟第428窟北周壁画',
      tag: '连环画长卷',
      summary: '三位王子同游山林，三太子萨埵见母虎饥渴濒死，毅然舍身跳崖以血肉饲虎的宏大慈悲叙事。'
    }
  ];

  return (
    <div className="dunhuang-tour-page">
      {/* 漂浮云层动画背景 */}
      <div className="cloud-layer">
        <div className="cloud-item cloud-1"></div>
        <div className="cloud-item cloud-2"></div>
        <div className="cloud-item cloud-3"></div>
      </div>

      {/* 主展示舞台 */}
      <div className="tour-stage">
        {/* 顶部 Logo 标识 */}
        <header className="tour-header">
          <div className="dh-logo-emblem">
            <div className="logo-badge">
              <Sparkles size={24} />
            </div>
            <div className="logo-title-cn">敦煌研究院 · 数字敦煌</div>
            <div className="logo-title-en">Dunhuang Academy · Digital Tour</div>
          </div>
        </header>

        {/* 居中大字书法标题：云游敦煌 */}
        <div className="tour-main-title">
          <span className="calligraphy-title">云游敦煌</span>
          <div className="title-sub-slogan">一窟一世界 · 梦回大唐盛景</div>
        </div>

        {/* 核心特色横幅区：云游壁画修复师 & 人机叙事共创 */}
        <div className="web-feature-banners-row">
          <div className="web-feature-banner banner-restorer" onClick={() => setActiveModal('restorer')}>
            <div className="banner-badge-row">
              <span className="banner-badge-hitl">HITL 人机协同修复</span>
              <span className="banner-cave-tag">第257窟 · 鹿王本生</span>
            </div>
            <div className="banner-title">🖌️ “云游壁画修复师”：修复路径推演与科普校验</div>
            <div className="banner-sub">U-Net 与扩散模型多分支生成 · 人文考据校验“存真”底线</div>
          </div>

          <div className="web-feature-banner banner-cocreate" onClick={() => setActiveModal('cocreate')}>
            <div className="banner-badge-row">
              <span className="banner-badge-ai">人机叙事共创</span>
              <span className="banner-cave-tag">第257窟 · 须摩提女</span>
            </div>
            <div className="banner-title">✨ 多视角人机叙事共创工坊</div>
            <div className="banner-sub">3大叙事视角 · 知识图谱赋能 · 生成专属敦煌短视频</div>
          </div>
        </div>

        {/* 6 大仙境悬浮入口（错落悬浮在祥云之上） */}
        <div className="tour-islands-wrapper">
          {islands.map((item) => (
            <div 
              key={item.id} 
              className={`island-cloud-card ${item.className}`}
              onClick={() => setActiveModal(item.id)}
              title={`点击进入「${item.title}」`}
            >
              {/* 竖排古典题签 */}
              <div className="island-tag">
                <span className="tag-text">{item.title}</span>
              </div>

              {/* 插画/徽标圆环 */}
              <div className="island-art">
                <span className="art-icon">{item.icon}</span>
              </div>

              {/* 托底祥云 */}
              <div className="island-cloud-base"></div>
            </div>
          ))}
        </div>

        {/* 底部宏伟九层楼与莫高窟崖壁全景 */}
        <div className="tour-palace-bottom">
          <svg className="mogao-cliff-svg" viewBox="0 0 1200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cliffGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d9b68c" />
                <stop offset="60%" stopColor="#bfa073" />
                <stop offset="100%" stopColor="#967952" />
              </linearGradient>
              <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9e2a22" />
                <stop offset="100%" stopColor="#6e1913" />
              </linearGradient>
              <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e2d4be" />
                <stop offset="100%" stopColor="#c5b293" />
              </linearGradient>
            </defs>
            {/* 远山背景轮廓 */}
            <path d="M0,180 Q250,110 500,160 Q750,90 1200,180 L1200,280 L0,280 Z" fill="url(#cliffGrad)" opacity="0.6" />
            
            {/* 近景断崖石窟孔洞 */}
            <path d="M0,210 Q200,170 450,200 Q600,160 850,205 Q1050,180 1200,220 L1200,280 L0,280 Z" fill="url(#cliffGrad)" />
            <ellipse cx="220" cy="235" rx="22" ry="16" fill="#4d3824" />
            <ellipse cx="320" cy="225" rx="18" ry="14" fill="#4d3824" />
            <ellipse cx="880" cy="230" rx="24" ry="18" fill="#4d3824" />
            <ellipse cx="1020" cy="240" rx="20" ry="15" fill="#4d3824" />

            {/* 莫高窟标志性 9 层楼主体建筑 */}
            <g transform="translate(490, 40)">
              <rect x="75" y="10" width="70" height="25" fill="url(#wallGrad)" stroke="#4d3824" strokeWidth="1.5" />
              <path d="M50,12 L170,12 L185,2 L35,2 Z" fill="url(#roofGrad)" />
              
              <rect x="68" y="32" width="84" height="24" fill="url(#wallGrad)" stroke="#4d3824" strokeWidth="1.5" />
              <path d="M42,34 L178,34 L195,22 L25,22 Z" fill="url(#roofGrad)" />
              
              <rect x="60" y="54" width="100" height="25" fill="url(#wallGrad)" stroke="#4d3824" strokeWidth="1.5" />
              <path d="M32,56 L188,56 L205,42 L15,42 Z" fill="url(#roofGrad)" />

              <rect x="52" y="77" width="116" height="25" fill="url(#wallGrad)" stroke="#4d3824" strokeWidth="1.5" />
              <path d="M22,79 L198,79 L215,65 L5,65 Z" fill="url(#roofGrad)" />

              <rect x="45" y="100" width="130" height="26" fill="url(#wallGrad)" stroke="#4d3824" strokeWidth="1.5" />
              <path d="M12,102 L208,102 L225,86 L-5,86 Z" fill="url(#roofGrad)" />

              <rect x="38" y="124" width="144" height="26" fill="url(#wallGrad)" stroke="#4d3824" strokeWidth="1.5" />
              <path d="M2,126 L218,126 L235,108 L-15,108 Z" fill="url(#roofGrad)" />

              <rect x="30" y="148" width="160" height="28" fill="url(#wallGrad)" stroke="#4d3824" strokeWidth="1.5" />
              <path d="M-8,150 L228,150 L245,130 L-25,130 Z" fill="url(#roofGrad)" />

              <rect x="22" y="174" width="176" height="28" fill="url(#wallGrad)" stroke="#4d3824" strokeWidth="1.5" />
              <path d="M-18,176 L238,176 L255,154 L-35,154 Z" fill="url(#roofGrad)" />

              <rect x="15" y="200" width="190" height="40" fill="url(#wallGrad)" stroke="#4d3824" strokeWidth="2" />
              <path d="M-28,202 L248,202 L268,178 L-48,178 Z" fill="url(#roofGrad)" />
              <rect x="90" y="212" width="40" height="28" rx="8" fill="#3b2014" />
              <line x1="45" y1="200" x2="45" y2="240" stroke="#8B261E" strokeWidth="4" />
              <line x1="175" y1="200" x2="175" y2="240" stroke="#8B261E" strokeWidth="4" />
            </g>
          </svg>
          <div className="foreground-clouds"></div>
        </div>
      </div>

      {/* ==========================================================================
          模块详情交互弹窗 (MODAL)
         ========================================================================== */}
      {activeModal && (
        <div className="tour-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="tour-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* 弹窗顶部栏 */}
            <div className="modal-top-bar">
              <div className="modal-header-info">
                <span className="modal-header-icon">
                  {islands.find(i => i.id === activeModal)?.icon}
                </span>
                <div>
                  <div className="modal-title-main">
                    {islands.find(i => i.id === activeModal)?.title}
                  </div>
                  <div className="modal-title-sub">
                    {islands.find(i => i.id === activeModal)?.subtitle}
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>

            {/* 弹窗主体内容 */}
            <div className="modal-body">
              {/* 1. 看壁画 */}
              {activeModal === 'murals' && (
                <div>
                  {/* 窟室选择 Tab */}
                  <div className="mural-cave-tabs">
                    <button 
                      className={`cave-tab-btn ${selectedCave === '0257' ? 'active' : ''}`}
                      onClick={() => setSelectedCave('0257')}
                    >
                      莫高窟 第257窟（北魏·九色鹿与须摩提女）
                    </button>
                    <button 
                      className={`cave-tab-btn ${selectedCave === '0320' ? 'active' : ''}`}
                      onClick={() => setSelectedCave('0320')}
                    >
                      莫高窟 第320窟（盛唐·最美飞天）
                    </button>
                    <button 
                      className={`cave-tab-btn ${selectedCave === '0321' ? 'active' : ''}`}
                      onClick={() => setSelectedCave('0321')}
                    >
                      莫高窟 第321窟（初唐·十轮经变）
                    </button>
                    <button 
                      className={`cave-tab-btn ${selectedCave === '0322' ? 'active' : ''}`}
                      onClick={() => setSelectedCave('0322')}
                    >
                      莫高窟 第322窟（初唐·葡萄藻井）
                    </button>
                  </div>

                  <div className="cave-banner-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={18} />
                      <span>{caveMurals[selectedCave].title}</span>
                    </div>
                    <span className="hint-zoom-tag">✨ 点击卡片可进入「标点解构 & 超清放大」品鉴模式</span>
                  </div>

                  <div className="mural-grid">
                    {caveMurals[selectedCave].items.map((m, idx) => (
                      <div 
                        key={idx} 
                        className="mural-card interactive-zoom-card"
                        onClick={() => handleOpenZoom(m, idx)}
                        title="点击进入微观热点解构与超高清品鉴"
                      >
                        <div className="mural-img-box">
                          <img src={m.img} alt={m.name} className="mural-img" />
                          <div className="card-zoom-overlay">
                            <Sparkle size={26} />
                            <span>点击开启热点品鉴</span>
                          </div>
                          {m.hotspots && m.hotspots.length > 0 && (
                            <span className="card-hotspots-count">
                              📍 包含 {m.hotspots.length} 处图像志热点
                            </span>
                          )}
                        </div>
                        <div className="mural-meta">
                          <div>
                            <div className="mural-name">{m.name}</div>
                            <div className="mural-desc">{m.desc}</div>
                          </div>
                          <div className="mural-card-footer">
                            <span className="mural-badge">🔍 热点交互解构</span>
                            <span className="mural-orient-label">{m.orient}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. 看文物 */}
              {activeModal === 'artifacts' && (
                <div className="feature-grid">
                  {artifactsData.map((item, idx) => (
                    <div key={idx} className="feature-item-card">
                      <span className="feature-tag-chip">{item.tag}</span>
                      <div className="feature-item-title">{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#b8860b', fontWeight: 600 }}>年代：{item.era}</div>
                      <div className="feature-item-summary">{item.summary}</div>
                      <button className="feature-btn-action" onClick={() => alert(`已开启「${item.title}」三维全景品鉴模式`)}>
                        三维品鉴
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. 看古建 */}
              {activeModal === 'architecture' && (
                <div className="feature-grid">
                  {archData.map((item, idx) => (
                    <div key={idx} className="feature-item-card">
                      <span className="feature-tag-chip">{item.tag}</span>
                      <div className="feature-item-title">{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#8B261E', fontWeight: 600 }}>形制：{item.era}</div>
                      <div className="feature-item-summary">{item.summary}</div>
                      <button className="feature-btn-action" onClick={() => alert(`已开启「${item.title}」数字解构模型`)}>
                        营造解构
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. 看期刊 */}
              {activeModal === 'journals' && (
                <div className="feature-grid">
                  {journalData.map((item, idx) => (
                    <div key={idx} className="feature-item-card">
                      <span className="feature-tag-chip">{item.tag}</span>
                      <div className="feature-item-title">{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#555' }}>作者/单位：{item.author}</div>
                      <div className="feature-item-summary">{item.summary}</div>
                      <button className="feature-btn-action" onClick={() => alert(`已检索学术论文：${item.title}`)}>
                        阅读全文
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. 看视频 */}
              {activeModal === 'videos' && (
                <div className="feature-grid">
                  {videoData.map((item, idx) => (
                    <div key={idx} className="feature-item-card">
                      <span className="feature-tag-chip">{item.tag}</span>
                      <div className="feature-item-title">{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#1a535c', fontWeight: 600 }}>时长：{item.duration}</div>
                      <div className="feature-item-summary">{item.summary}</div>
                      <button className="feature-btn-action" onClick={() => alert(`正在加载超清流媒体播放：${item.title}`)}>
                        播放影像
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 7. 【核心功能】云游壁画修复师（人机协同修复路径推演） */}
              {activeModal === 'restorer' && (
                <div className="web-restorer-container">
                  <div className="restorer-intro-bar">
                    <span className="restorer-entity-badge">📍 实体锚点：莫高窟 第257窟（北魏 · 鹿王本生图）</span>
                    <span className="restorer-core-aim">基于 U-Net 与扩散模型多分支推演 · 用户结合人文考据校验“存真”底线</span>
                  </div>

                  {/* 步骤 1：病害诊断视窗 */}
                  <div className="web-restorer-section">
                    <div className="web-step-title"><span className="step-num-circle">1</span> 壁画病害区域智能诊断（基于第257窟真实高清单张原画）</div>
                    <div className="web-inspect-stage">
                      <img src="/dunhuang_caves/cave_0257/主室_左壁_南壁_l.jpg" alt="第257窟鹿王本生图" className="web-inspect-img" />
                      <div 
                        className="web-defect-bbox"
                        style={
                          restorerDefectKey === 'lead_oxidation' 
                            ? { left: '18%', top: '38%', width: '28%', height: '32%' }
                            : { left: '62%', top: '35%', width: '30%', height: '35%' }
                        }
                      >
                        <span className="defect-bbox-label">⚠️ 算法定位病害区域</span>
                      </div>
                    </div>

                    <div className="web-defect-switch-tabs">
                      <button 
                        className={`defect-tab-btn ${restorerDefectKey === 'lead_oxidation' ? 'active' : ''}`}
                        onClick={() => { setRestorerDefectKey('lead_oxidation'); setRestorerBranchIndex(1); }}
                      >
                        🔬 矿物颜料氧化黑化（九色鹿颈部铅丹变色）
                      </button>
                      <button 
                        className={`defect-tab-btn ${restorerDefectKey === 'scaling' ? 'active' : ''}`}
                        onClick={() => { setRestorerDefectKey('scaling'); setRestorerBranchIndex(1); }}
                      >
                        🧱 地仗泥层空鼓与表层起甲脱落
                      </button>
                    </div>

                    <div className="web-defect-report-grid">
                      <div className="report-card-item">
                        <span className="r-tag">病害分类</span>
                        <div className="r-text">{restorerDefectKey === 'lead_oxidation' ? '四氧化三铅（铅丹）化学变色' : '草泥地仗层盐胀酥碱剥落'}</div>
                      </div>
                      <div className="report-card-item">
                        <span className="r-tag">物理机理</span>
                        <div className="r-text">{restorerDefectKey === 'lead_oxidation' ? '红丹在戈壁微量水热与光照下转化为黑褐色二氧化铅（PbO2）' : '毛细水盐分干湿循环结晶膨胀导致颜料层脆性脱落'}</div>
                      </div>
                      <div className="report-card-item">
                        <span className="r-tag">文保矛盾</span>
                        <div className="r-text">{restorerDefectKey === 'lead_oxidation' ? '过度修复将导致“修旧如新”抹杀历史痕迹；不修复则难以直观感知北魏原设色' : '如何区分结构性支护加固与艺术性线条臆测补全'}</div>
                      </div>
                    </div>
                  </div>

                  {/* 步骤 2：算法生成修复分支 */}
                  <div className="web-restorer-section">
                    <div className="web-step-title"><span className="step-num-circle">2</span> U-Net 与 ResShift 扩散模型生成的 3 个修复分支推演</div>
                    <div className="web-branches-grid">
                      {/* 分支 A */}
                      <div 
                        className={`web-branch-card ${restorerBranchIndex === 0 ? 'selected-branch' : ''}`}
                        onClick={() => setRestorerBranchIndex(0)}
                      >
                        <div className="b-header">
                          <span className="b-name">分支 A · 激进全彩复原（Diffusion 强推演）</span>
                          <span className="b-tag tag-risk">存在过度推测风险</span>
                        </div>
                        <p className="b-desc">依据唐初鲜亮朱砂与铅白全彩强行重绘覆盖黑斑，画面光鲜夺目，但抹去了千年的历史沉淀。</p>
                        <div className="b-pros-cons">
                          <div className="pro">✓ 色彩艳丽，视觉冲击力极强</div>
                          <div className="con">✗ 违背文物“存真”原则，抹杀历史真实信息</div>
                        </div>
                      </div>

                      {/* 分支 B */}
                      <div 
                        className={`web-branch-card ${restorerBranchIndex === 1 ? 'selected-branch' : ''}`}
                        onClick={() => setRestorerBranchIndex(1)}
                      >
                        <div className="b-header">
                          <span className="b-name">分支 B · 原真性保留与最小干预（推荐底线）</span>
                          <span className="b-tag tag-safe">坚守文保底线（推荐）</span>
                        </div>
                        <p className="b-desc">遵循《威尼斯宪章》最小干预原则。仅在算法层面进行物理裂隙虚拟填补，完整保留氧化黑化的历史面貌。</p>
                        <div className="b-pros-cons">
                          <div className="pro">✓ 严守文物真实性与历史厚重感，符合专业文保伦理</div>
                          <div className="con">✗ 色彩视觉偏暗沉，需辅以图像志科普解读</div>
                        </div>
                      </div>

                      {/* 分支 C */}
                      <div 
                        className={`web-branch-card ${restorerBranchIndex === 2 ? 'selected-branch' : ''}`}
                        onClick={() => setRestorerBranchIndex(2)}
                      >
                        <div className="b-header">
                          <span className="b-name">分支 C · 光谱虚拟回溯（时空透镜双镜对照）</span>
                          <span className="b-tag tag-tech">科技虚拟推演</span>
                        </div>
                        <p className="b-desc">通过拉曼光谱测得的元素分子式，在三维数字孪生层中建立“北魏原始设色”可切换图层，无损对照。</p>
                        <div className="b-pros-cons">
                          <div className="pro">✓ 学术真实与科普体验兼顾，数据可逆、不触碰实体</div>
                          <div className="con">✗ 需要多学科交叉光谱测定数据支撑</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 步骤 3：人文历史考据专家库 */}
                  <div className="web-restorer-section">
                    <div className="web-step-title"><span className="step-num-circle">3</span> 内置人文历史考据专家库（提示与校验依据）</div>
                    <div className="web-evidence-grid">
                      <div className="evidence-box">
                        <div className="ev-icon">🧪</div>
                        <div>
                          <div className="ev-title">颜料成分与理化机理</div>
                          <div className="ev-text">北魏矿物颜料以赤铁矿（土红）、铅丹、石绿、青金石为主，胶结材料多为动植物胶。</div>
                        </div>
                      </div>
                      <div className="evidence-box">
                        <div className="ev-icon">🖌️</div>
                        <div>
                          <div className="ev-title">北魏绘制技法与时代风格</div>
                          <div className="ev-text">北朝特有的“凹凸晕染法”，以白粉染出鼻梁眼眶，周围以土红层层叠晕，并非单纯平涂。</div>
                        </div>
                      </div>
                      <div className="evidence-box">
                        <div className="ev-icon">📜</div>
                        <div>
                          <div className="ev-title">图像志惯例与因缘经典</div>
                          <div className="ev-text">九色鹿角呈珊瑚状分叉，身姿矫健优美，是北魏吸收中亚波斯与中原神鹿图式的结晶。</div>
                        </div>
                      </div>
                      <div className="evidence-box">
                        <div className="ev-icon">⚖️</div>
                        <div>
                          <div className="ev-title">文物修复“存真”伦理底线</div>
                          <div className="ev-text">文物修复最高准则：真实性、可逆性、最小干预，坚决反对“修旧如新”。</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 步骤 4：校验打标与提交归档 */}
                  <div className="web-restorer-section">
                    <div className="web-step-title"><span className="step-num-circle">4</span> 人机协同校验标签打标（沉淀结构化数据链条）</div>
                    <div className="web-tags-row">
                      {['#坚守最小干预原则', '#保留铅丹氧化历史痕迹', '#采用光谱图层双镜对照', '#符合北魏凹凸晕染法'].map((tag, tIdx) => (
                        <button 
                          key={tIdx}
                          className={`web-tag-btn ${restorerUserTags[tIdx] ? 'active' : ''}`}
                          onClick={() => setRestorerUserTags(prev => ({ ...prev, [tIdx]: !prev[tIdx] }))}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <button 
                      className="submit-chain-btn"
                      onClick={() => setRepairCertModal(true)}
                    >
                      📜 确认人机校验方案 · 沉淀数字壁画数据链条证书
                    </button>
                  </div>
                </div>
              )}

              {/* 8. 多视角人机共创工坊 */}
              {activeModal === 'cocreate' && (
                <div className="web-restorer-container">
                  <div className="restorer-intro-bar">
                    <span className="restorer-entity-badge">✨ 莫高窟第257窟《须摩提女因缘》· 多视角人机叙事共创</span>
                    <span className="restorer-core-aim">基于 1234.docx 核心案例 · AI 赋能多视角叙事短视频生成</span>
                  </div>

                  <div className="web-branches-grid">
                    <div className="web-branch-card selected-branch">
                      <div className="b-header">
                        <span className="b-name">视角 A · 佛教因果（信仰召唤）</span>
                      </div>
                      <p className="b-desc">侧重须摩提女从燃香请佛到佛陀显现神通的完整因缘链条，体现信仰召唤与因果哲理。</p>
                    </div>

                    <div className="web-branch-card">
                      <div className="b-header">
                        <span className="b-name">视角 B · 女性命运（社会史维度）</span>
                      </div>
                      <p className="b-desc">聚焦婆罗门女外嫁满富城的婚姻流动，在异质文化环境中坚持信仰的女性自主抉择。</p>
                    </div>

                    <div className="web-branch-card">
                      <div className="b-header">
                        <span className="b-name">视角 C · 图像学/美术史考据</span>
                      </div>
                      <p className="b-desc">解析北魏香炉形制、衣褶贴泥条技法、“人大于山”五百力士移山与汉代画像石源流。</p>
                    </div>
                  </div>

                  <button className="submit-chain-btn" onClick={() => alert('已成功合成 AI 叙事短视频并同步至共创社区！')}>
                    🎬 合成 AI 叙事短视频 & 上传共创社区
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 修复溯源数据链证书弹窗 */}
      {repairCertModal && (
        <div className="tour-modal-overlay" onClick={() => setRepairCertModal(false)}>
          <div className="repair-cert-card" onClick={(e) => e.stopPropagation()}>
            <div className="cert-header">
              <span className="cert-icon">📜</span>
              <div className="cert-title">数字敦煌 · 壁画人机协同修复溯源证书</div>
              <button className="modal-close-btn" onClick={() => setRepairCertModal(false)}><X size={18} /></button>
            </div>
            <div className="cert-body">
              <div className="cert-row"><span className="c-lbl">【实体锚点】</span><span className="c-val">莫高窟 第257窟（北魏 · 鹿王本生经变）</span></div>
              <div className="cert-row"><span className="c-lbl">【病害诊断】</span><span className="c-val">{restorerDefectKey === 'lead_oxidation' ? '铅丹（Pb3O4）氧化为二氧化铅变黑' : '地仗泥层物理酥碱起甲'}</span></div>
              <div className="cert-row"><span className="c-lbl">【算法分支】</span><span className="c-val">{restorerBranchIndex === 1 ? '分支 B · 原真性保留与最小干预（坚守存真底线）' : '分支 C · 光谱时空透镜双镜对照'}</span></div>
              <div className="cert-row"><span className="c-lbl">【完整数据链】</span><span className="c-val">原始残缺扫描图 ➔ U-Net/扩散模型生成分支 ➔ 人文校验复原图</span></div>
              <div className="cert-tip">✨ 该数据链条已成功结构化归档至文物修复数据库，为人机协同文化遗产复原提供了可靠的研究素材！</div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          超高清壁画无级缩放 & 交互热点标注检视器 (Deep Zoom & Hotspot Viewer)
         ========================================================================== */}
      {zoomedMural && (
        <div className={`deep-zoom-lightbox ${isFullScreenViewer ? 'fullscreen-mode' : ''}`}>
          {/* 检视器顶部操作工具栏 */}
          <div className="zoom-top-toolbar">
            <div className="toolbar-left-info">
              <span className="toolbar-cave-tag">{zoomedMural.caveTitle}</span>
              <span className="toolbar-mural-title">{zoomedMural.name}</span>
            </div>

            {/* 缩放与视图控制按钮组 */}
            <div className="toolbar-controls-group">
              {/* 热点标点显示/隐藏开关 */}
              {zoomedMural.hotspots && zoomedMural.hotspots.length > 0 && (
                <button 
                  className={`ctrl-btn ${showHotspots ? 'active-highlight' : ''}`}
                  onClick={() => setShowHotspots(prev => !prev)}
                  title="切换热点标点显示"
                >
                  <MapPin size={17} />
                  <span>{showHotspots ? '隐藏标点' : '显示标点'}</span>
                </button>
              )}

              <button className="ctrl-btn" onClick={handleZoomIn} title="放大 (+)">
                <ZoomIn size={18} />
                <span>放大</span>
              </button>
              <span className="scale-indicator">{Math.round(zoomScale * 100)}%</span>
              <button className="ctrl-btn" onClick={handleZoomOut} title="缩小 (-)">
                <ZoomOut size={18} />
                <span>缩小</span>
              </button>
              <button className="ctrl-btn" onClick={handleResetZoom} title="还原 1:1 视图">
                <RotateCcw size={18} />
                <span>还原</span>
              </button>
              <button 
                className="ctrl-btn" 
                onClick={() => setIsFullScreenViewer(prev => !prev)}
                title={isFullScreenViewer ? "退出全屏" : "全屏检视"}
              >
                {isFullScreenViewer ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                <span>{isFullScreenViewer ? "退出全屏" : "全屏"}</span>
              </button>
              <button className="ctrl-close-btn" onClick={() => setZoomedMural(null)} title="关闭检视器">
                <X size={22} />
              </button>
            </div>
          </div>

          {/* 检视器主体：超高清可拖拽缩放视窗 */}
          <div 
            className="zoom-canvas-viewport"
            ref={imageContainerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            {/* 上一张 / 下一张壁画快捷切换按钮 */}
            <button className="nav-mural-arrow nav-prev" onClick={handlePrevMural} title="上一幅壁画">
              <ChevronLeft size={36} />
            </button>
            <button className="nav-mural-arrow nav-next" onClick={handleNextMural} title="下一幅壁画">
              <ChevronRight size={36} />
            </button>

            {/* 可缩放拖拽图片容器（包含小巧半透明的发光交互标点） */}
            <div 
              className="zoomable-image-wrapper"
              style={{
                transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomScale})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
            >
              <img 
                src={zoomedMural.img} 
                alt={zoomedMural.name} 
                className="zoomable-mural-img"
                draggable={false}
              />

              {/* 图像热点标点标注（小巧、半透明、无字遮挡） */}
              {showHotspots && zoomedMural.hotspots?.map((spot) => (
                <div 
                  key={spot.id}
                  className={`mural-hotspot-pin ${activeHotspot?.id === spot.id ? 'active-pin' : ''}`}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(spot);
                  }}
                  title={spot.title}
                >
                  <div className="hotspot-pulse-ring"></div>
                  <div className="hotspot-core-dot"></div>
                </div>
              ))}
            </div>

            {/* 缩放操作提示 */}
            <div className="zoom-floating-hint">
              <span>🖱️ 滚轮缩放 · ✋ 拖拽平移 · 📍 点击画面发光小标点即可展开图像志深度解析</span>
            </div>

            {/* 点击标点后弹出的国风解析卡片 (Hotspot Detail Popover) */}
            {activeHotspot && (
              <div className="hotspot-detail-card" onClick={(e) => e.stopPropagation()}>
                <div className="hotspot-card-header">
                  <div className="hotspot-card-title-box">
                    <span className="hotspot-badge">图像学微观解析</span>
                    <div className="hotspot-main-title">{activeHotspot.title}</div>
                    <div className="hotspot-sub-title">{activeHotspot.subtitle}</div>
                  </div>
                  <button className="hotspot-close-btn" onClick={() => setActiveHotspot(null)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="hotspot-card-body">
                  <div className="hotspot-content-text">
                    {activeHotspot.content}
                  </div>

                  {activeHotspot.pigment && (
                    <div className="hotspot-meta-row">
                      <span className="meta-label">🎨 矿物颜料：</span>
                      <span className="meta-val">{activeHotspot.pigment}</span>
                    </div>
                  )}

                  {activeHotspot.technique && (
                    <div className="hotspot-meta-row">
                      <span className="meta-label">🖌️ 技法工序：</span>
                      <span className="meta-val">{activeHotspot.technique}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 检视器底部悬浮解说卡片 */}
          <div className="zoom-bottom-details-bar">
            <div className="details-tags-row">
              <span className="details-orient-badge">{zoomedMural.orient}</span>
              {zoomedMural.tags?.map((t, i) => (
                <span key={i} className="details-art-tag"># {t}</span>
              ))}
            </div>
            <div className="details-desc-text">
              {zoomedMural.desc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DunhuangTour;
