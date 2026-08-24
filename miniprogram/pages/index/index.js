// pages/index/index.js
Page({
  data: {
    showCaveSelector: false,
    showLandscapeViewer: false,
    showFullScreenLightbox: false,
    showCoCreateModal: false,
    showRestorerModal: false, // 云游壁画修复师弹窗
    
    selectedCaveId: '0257',
    currentCave: null,
    activeWallIndex: 0,
    currentWallImage: '',

    // 热点标注状态
    showHotspots: true,
    activeHotspot: null,

    // =========================================================================
    // （一）“云游壁画修复师”：人机协同修复路径推演数据（以第257窟鹿王本生图为实体锚点）
    // =========================================================================
    activeDefectKey: 'lead_oxidation',
    activeBranchIndex: 1, // 默认推荐分支 B（原真性保留与最小干预）
    userTags: { 0: true, 1: true, 2: true },
    
    defectOptions: {
      lead_oxidation: {
        name: '🔬 矿物颜料氧化黑化（九色鹿颈部）',
        type: '铅丹与朱砂矿物化学变色',
        cause: '莫高窟北魏画工大量使用红丹（四氧化三铅 Pb3O4）勾绘肉色与高光，千年来受戈壁微量光热与湿度影响氧化为黑色二氧化铅（PbO2），导致原有红润面庞与神鹿白斑呈古雅黑褐色。',
        challenge: '过度复原会导致“修旧如新”破坏历史真迹；不予修复则公众难以直观感知北魏原作的设色辉煌。',
        box: { left: 18, top: 38, width: 28, height: 32 },
        branches: [
          {
            title: '分支 A：激进全彩复原（Diffusion 强推演）',
            stance: '过度复原风险',
            stanceClass: 'stance-risk',
            desc: '依据初唐鲜亮朱砂与铅白全彩强行重绘覆盖黑斑，画面光鲜夺目，但抹去了千年的历史沉淀，存在极高的主观臆测与风格漂移风险。',
            pro: '色彩艳丽，视觉冲击力极强',
            risk: '违背文物保护“存真”原则，抹杀文物真实历史信息'
          },
          {
            title: '分支 B：原真性保留与最小干预（推荐底线）',
            stance: '坚守文保底线',
            stanceClass: 'stance-safe',
            desc: '严格遵循国际古迹遗址理事会《威尼斯宪章》最小干预原则。仅在算法层面进行物理裂隙虚拟填补与去污，完整保留氧化黑化的历史真实面貌。',
            pro: '严守文物真实性与历史厚重感，符合专业文保伦理',
            risk: '色彩视觉上依然偏暗沉，需辅以图像志科普解读'
          },
          {
            title: '分支 C：光谱虚拟回溯（时空透镜对照）',
            stance: '科技虚拟推演',
            stanceClass: 'stance-tech',
            desc: '通过拉曼光谱与 X 射线荧光测得的元素分子式，在三维数字孪生层中建立“北魏原始设色”可切换图层，实现与现状图的双镜无损对照。',
            pro: '学术真实与科普体验兼顾，数据可逆、不触碰实体',
            risk: '需要多学科交叉实验室光谱测定数据支撑'
          }
        ],
        evidence: {
          pigment: '北魏矿物颜料以赤铁矿（土红）、铅丹、石绿、青金石为主，胶结材料多为动植物胶。',
          technique: '北朝特有的“凹凸晕染法”，以白粉染出鼻梁眼眶，周围以土红层层叠晕，并非单纯平涂。',
          iconography: '九色鹿角呈珊瑚状分叉，身姿矫健优美，是北魏吸收中亚萨珊波斯与中原汉代神鹿图式的结晶。',
          ethics: '文物修复最高准则：真实性、可逆性、最小干预，坚决反对“修旧如新”。'
        },
        verifyTags: ['#坚守最小干预原则', '#保留铅丹氧化历史痕迹', '#采用光谱图层双镜对照', '#符合北魏凹凸晕染法']
      },
      scaling: {
        name: '🧱 地仗层空鼓与表层起甲脱落',
        type: '地仗泥层物理酥碱剥落',
        cause: '莫高窟岩体盐分随毛细水运移，在干湿循环下结晶膨胀，导致草泥地仗层与壁画颜料层剥离起甲。',
        challenge: '如何区分缺失部位的“结构性支护补强”与“艺术性线条补全”。',
        box: { left: 62, top: 35, width: 30, height: 35 },
        branches: [
          {
            title: '分支 A：全画面平整补全',
            stance: '过度修饰',
            stanceClass: 'stance-risk',
            desc: '将脱落处以均质泥色抹平并用 AI 自动脑补断裂线条。',
            pro: '画面完整度高',
            risk: '混淆真实残缺与算法伪造痕迹'
          },
          {
            title: '分支 B：可识别性点色留白（修旧如旧）',
            stance: '标准文保范式',
            stanceClass: 'stance-safe',
            desc: '采用现代修复的“点彩/条纹”技法，补全色调略低于原壁画半度，远看似整体、近看可辨修补痕迹。',
            pro: '严格遵循“可识别性”国际文保准则',
            risk: '对大众审美需要一定科普引导'
          },
          {
            title: '分支 C：U-Net 边缘拓扑引导修复',
            stance: '人机协同算法',
            stanceClass: 'stance-tech',
            desc: '利用深度学习提取未受损铁线描的曲率流向，仅修复结构性轮廓断线。',
            pro: '最大化尊重北魏画工原有行笔动势',
            risk: '算法边缘须经专家人工逐点复核'
          }
        ],
        evidence: {
          pigment: '底层为澄板土加麦秸草泥，表层为细泥抹面，具有热胀冷缩的脆性特征。',
          technique: '壁画起甲处采用明胶或聚乙烯醇缩丁醛（PVB）进行渗透回贴加固。',
          iconography: '断线部位应结合同窟同组画面的对称构图进行逻辑推断。',
          ethics: '所有补全必须具备“可再处理性与可识别性”。'
        },
        verifyTags: ['#满足可识别性准则', '#微差补色留白', '#保留地仗断层肌理', '#U-Net边缘拓扑复核']
      }
    },
    currentDefect: null,

    // 案例三：须摩提女因缘——多视角人机叙事共创数据 (来自 1234.docx)
    activeSceneKey: 'qingfo',
    activePerspectiveIndex: 0,
    activeVoiceIndex: 0,
    voiceStyles: ['庄重大气（纪录片）', '戏剧评书（故事流）', '青年学者（学术科普）', '慈悲梵音（沉浸式）'],
    
    coCreateData: {
      qingfo: {
        title: '须摩提女请佛',
        location: '第257窟北壁中段 · 北魏连环故事画',
        content: '画面中须摩提女身着北魏世俗贵族服饰，双手持香炉，作礼拜姿态。面前常有香云或莲花化生的视觉符号，暗示信仰祈愿正在上达。背景可见简化处理的房宇建筑，标识故事发生的世俗空间。',
        aiDraft: '系统识别人物姿态、手持法器与服饰纹样，自动调取知识图谱关于须摩提女因缘的文献与考古成果。涵盖佛教因果脉络（过去世种植善根，生婆罗门家外嫁满富城仍铭记佛缘）、社会史（北魏婆罗门女性婚姻流动与信仰抉择）及图像学（香炉形制、衣褶贴泥条技法与同期世俗绘画互文）。',
        perspectives: [
          {
            name: '视角 A · 佛教因果',
            focus: '信仰召唤与因缘链条',
            desc: '侧重须摩提女从燃香请佛到佛与弟子显现神通的完整因缘链条。用户可补充对信仰召唤主题的理解，调整叙事节奏。',
            output: '生成侧重宗教体验与哲理的解说短视频'
          },
          {
            name: '视角 B · 女性命运',
            focus: '婚姻流动与身份认同',
            desc: '转向须摩提女作为婆罗门女外嫁满富城的社会身份，以及在夫家环境中坚持信仰面临的文化冲突，刻画身份转变。',
            output: '生成侧重人物命运与情感的故事型短视频'
          },
          {
            name: '视角 C · 图像学分析',
            focus: '北魏器物形制与服饰纹样',
            desc: '聚焦画面中香炉的北魏形制、贵族女性头饰裙裾纹样、房宇简化表现手法，对比同期墓葬壁画女性形象。',
            output: '生成侧重视觉艺术与美术史分析的科普短视频'
          }
        ]
      },
      yishan: {
        title: '五百力士移山',
        location: '第257窟北壁与西壁北段衔接处 · 北魏',
        content: '画面采用“人大于山”的传统表现手法，五百力士或推或拉，肌肉紧绷，动态强烈。山体以赭石与石绿分层渲染，呈现出人力与自然对抗的宏大视觉张力。',
        aiDraft: '系统识别群体性劳动场景与山石画法，调取知识图谱生成叙事素材。佛教维度叙述满富城长者心存疑虑派遣力士移山阻拦佛驾；社会史维度分析力士装束、发型与体态，探讨是否源于北魏兵役徭役制度下的底层劳动者；图像学维度解读人大于山构图与汉代画像石力士形象的源流。',
        perspectives: [
          {
            name: '视角 A · 佛教神通',
            focus: '人力移山 vs 佛力无碍',
            desc: '围绕人力移山与佛力无碍的对比展开，五百力士的集体劳作象征世俗权力对信仰的阻碍。',
            output: '生成侧重宗教哲理与神通显现的短视频'
          },
          {
            name: '视角 B · 社会史思考',
            focus: '北魏底层劳役与集体劳动',
            desc: '将五百力士视为北魏社会底层劳动者的图像记录，分析其集体劳作的组织形式与身体姿态，引入古代劳役思考。',
            output: '生成侧重历史社会深度剖析的短视频'
          },
          {
            name: '视角 C · 图像学/美术史',
            focus: '人物群像疏密与山石色块对比',
            desc: '详细解析画面中人物群像疏密布局、山石平面化处理、赭红底壁与石绿山体的色彩对比，追踪力士图像演变。',
            output: '生成侧重美术史技法演进的专业短视频'
          }
        ]
      }
    },
    currentSceneData: null,
    
    caveList: [
      {
        id: '0257',
        shortNum: '第257窟',
        eraTag: '北魏',
        fullName: '莫高窟 第257窟（北魏 · 九色鹿与须摩提女）',
        era: '北魏（公元439-534年）',
        type: '中心塔柱式石窟',
        highlight: '南壁鹿王本生（九色鹿）、北壁须摩提女请佛与五百力士移山、中心塔柱四面造像',
        walls: ['全貌立体', '南壁九色鹿', '北壁须摩提女', '中心塔柱', '人字披顶'],
        description: '莫高窟北魏时期的巅峰代表洞窟之一。以中心塔柱为核心，南壁绘制家喻户晓的《九色鹿本生》，北壁绘制《须摩提女因缘》与人大于山的五百力士移山图。',
        wallItems: [
          {
            orient: '全貌',
            name: '主室立体全景透视',
            image: '/images/caves/cave_0257/overview.jpg',
            desc: '莫高窟第257窟空间全貌，中心塔柱屹立，四周壁面铺展着北魏重彩因缘连环长卷。',
            tags: ['中心塔柱', '全景概览', '北魏形制'],
            hotspots: [
              {
                id: 'c257-mp-ov1',
                x: 50,
                y: 20,
                title: '前部人字披屋顶',
                subtitle: '仿汉晋中原木构',
                content: '斜坡人字披顶，绘有橡木与飞天乐伎，将汉式营造与佛国意境完美融汇。'
              }
            ]
          },
          {
            orient: '南壁',
            name: '鹿王本生故事画（九色鹿长卷）',
            image: '/images/caves/cave_0257/south_jiuselu.jpg',
            desc: '莫高窟最著名的北魏因缘故事连环画。九色神鹿舍身救人，调达忘恩负义告密生癞，国王省悟传令举国保护神鹿。',
            tags: ['九色鹿本生', '北魏重彩', '经典因缘'],
            hotspots: [
              {
                id: 'c257-mp-jsl1',
                x: 25,
                y: 48,
                title: '九色神鹿救溺水者',
                subtitle: '舍身救人与发誓不泄密',
                content: '九色鹿踏入波涛救起呼号的溺水人调达，调达长跪叩首发誓绝不泄露神鹿行踪。'
              },
              {
                id: 'c257-mp-jsl2',
                x: 75,
                y: 46,
                title: '九色鹿陈情与国王省悟',
                subtitle: '大慈大悲感化君王',
                content: '九色鹿昂首挺立直面军阵，从容陈说始末，国王深为省悟并重申庇护神鹿。'
              }
            ]
          },
          {
            orient: '北壁',
            name: '须摩提女因缘与五百力士移山',
            image: '/images/caves/cave_0257/north_xumoti.jpg',
            desc: '横贯北壁中段，记录须摩提女燃香请佛与五百力士移山的人机共创核心画面，人大于山，动态磅礴。',
            tags: ['须摩提女', '五百力士移山', '人机共创'],
            hotspots: [
              {
                id: 'c257-mp-xmt1',
                x: 28,
                y: 40,
                title: '须摩提女燃香请佛',
                subtitle: '第257窟北壁中段 · 虔诚祈愿',
                content: '须摩提女双手捧香炉，面前香云化生莲花，祈愿佛陀与弟子显现神通。'
              },
              {
                id: 'c257-mp-xmt2',
                x: 68,
                y: 52,
                title: '五百力士移山图',
                subtitle: '“人大于山”与自然对抗',
                content: '五百力士肌肉紧绷拉拽巨山，呈现出北魏底层劳动者与宏大世俗力量的强烈张力。'
              }
            ]
          },
          {
            orient: '中心柱',
            name: '中心塔柱：四面佛龛与影塑千佛',
            image: '/images/caves/cave_0257/center_pillar.jpg',
            desc: '早期支提窟与汉代楼阁结合的典型形式，四面开大龛塑佛，外壁布满影塑千佛。',
            tags: ['中心塔柱', '北魏彩塑', '影塑千佛'],
            hotspots: [
              {
                id: 'c257-mp-pl1',
                x: 50,
                y: 45,
                title: '东向面主尊坐佛',
                subtitle: '北魏早期造像风格',
                content: '面相方圆，双肩宽厚，袒右肩袈裟呈阶梯状贴体垂落，具犍陀罗与凉州模式遗风。'
              }
            ]
          },
          {
            orient: '窟顶',
            name: '前部人字披屋顶与天宫乐伎',
            image: '/images/caves/cave_0257/top_roof.jpg',
            desc: '模拟汉晋木构建筑人字披顶，椽间绘制飞天散花与天宫乐伎。',
            tags: ['人字披顶', '仿木结构', '北朝营造']
          }
        ]
      },
      {
        id: '0320',
        shortNum: '第320窟',
        eraTag: '盛唐',
        fullName: '莫高窟 第320窟（盛唐 · 最美飞天）',
        era: '盛唐（公元705-781年）',
        type: '方形覆斗顶殿堂窟',
        highlight: '南壁“四身最美飞天”、北壁观无量寿经变、云头牡丹藻井',
        walls: ['全貌立体', '南壁最美飞天', '北壁净土经变', '窟顶云头牡丹'],
        description: '开凿于盛唐，是莫高窟盛唐时期的代表洞窟之一。南壁绘有公认全敦煌最具代表性的四身飞天，身姿轻盈、构图豪放圆润；北壁绘有富丽堂皇的西方极乐净土经变。',
        wallItems: [
          {
            orient: '全貌',
            name: '主室立体全景透视',
            image: '/images/caves/cave_0320/overview.jpg',
            desc: '第320窟全景空间再现。方形殿堂式覆斗顶，四披千佛环绕，壁画色彩保存极为艳丽。',
            tags: ['全景概览', '盛唐形制'],
            hotspots: [
              {
                id: 'ov-1',
                x: 50,
                y: 20,
                title: '覆斗式殿堂顶',
                subtitle: '汉唐殿堂营造规制',
                content: '四披向内收敛成倒斗状，将空间视觉中心全部汇聚于窟顶藻井。'
              },
              {
                id: 'ov-2',
                x: 50,
                y: 65,
                title: '中央礼佛方坛',
                subtitle: '古代右旋礼拜动线',
                content: '宽敞方正的殿堂空间，四周通壁绘制宏伟经变画，供信众瞻仰右旋。'
              }
            ]
          },
          {
            orient: '南壁',
            name: '释迦说法图与四身最美飞天',
            image: '/images/caves/cave_0320/south_feitian.jpg',
            desc: '盛唐飞天的巅峰之作。虽因矿物颜料氧化而呈古雅沉穆的黑褐色，但线条如行云流水、身姿曼妙，宛若空中飘舞。',
            tags: ['最美飞天', '盛唐线条', '说法图'],
            hotspots: [
              {
                id: 'ft-1',
                x: 32,
                y: 26,
                title: '散花逆风飞天',
                subtitle: '大唐飞天最高艺术成就',
                content: '飞天身姿轻盈曼妙，逆风飞行，飘带与祥云随风翻卷，双臂舒展扬撒天花。'
              },
              {
                id: 'ft-2',
                x: 48,
                y: 52,
                title: '释迦说法相',
                subtitle: '主尊佛结跏趺坐',
                content: '身着红褐通肩袈裟，神态慈悲庄严，背光火焰忍冬纹层层环绕。'
              },
              {
                id: 'ft-3',
                x: 68,
                y: 25,
                title: '合十乘云飞天',
                subtitle: '双手合十俯冲飘逸姿态',
                content: '双手合十虔诚礼拜，长巾在空中划出优美抛物线，极富音乐节律感。'
              }
            ]
          },
          {
            orient: '北壁',
            name: '观无量寿经变（西方极乐净土）',
            image: '/images/caves/cave_0320/north_jingbian.jpg',
            desc: '大唐极乐净土世界的宏大再现。绘有七宝池、八功德水、重檐水榭楼阁与歌舞菩萨，极具盛唐恢弘气象。',
            tags: ['净土经变', '大唐建筑', '舞乐伎'],
            hotspots: [
              {
                id: 'jb-1',
                x: 50,
                y: 25,
                title: '水榭重檐楼阁',
                subtitle: '大唐宫殿建筑实景映照',
                content: '重层水榭楼阁耸立于七宝池之上，飞檐斗拱精密复杂，平坐勾栏雕刻精细。'
              },
              {
                id: 'jb-2',
                x: 50,
                y: 68,
                title: '七宝池乐舞',
                subtitle: '迦陵频伽与舞伎长巾旋舞',
                content: '舞伎在琉璃平台上挥动长巾急速旋舞，两旁乐伎分列排箫、横笛、琵琶。'
              }
            ]
          },
          {
            orient: '窟顶',
            name: '云头牡丹宝相花藻井与四披千佛',
            image: '/images/caves/cave_0320/top_zaojing.jpg',
            desc: '井心绘制盛放的云头宝相牡丹花，色彩斑斓绚丽，周围四披整齐绘制千佛像，结构庄严精密。',
            tags: ['牡丹藻井', '装饰纹样', '四披千佛'],
            hotspots: [
              {
                id: 'zj-1',
                x: 50,
                y: 50,
                title: '华盖式斗四莲花井心',
                subtitle: '窟顶中心方井画华盖式藻井',
                content: '窟顶中心方井画华盖式藻井，藻井画斗四莲花井心。井心画垂莲和火焰、忍冬、云气纹；井外四周饰垂幔、彩铃。'
              },
              {
                id: 'zj-2',
                x: 35,
                y: 35,
                title: '忍冬与云气火焰纹',
                subtitle: '丝路中西交融纹饰',
                content: '垂莲外围以连珠纹、忍冬卷草纹与腾跃火焰纹层层扩散，象征光明普照。'
              },
              {
                id: 'zj-3',
                x: 70,
                y: 30,
                title: '华美垂幔与摇曳彩铃',
                subtitle: '模拟真实织锦天帐',
                content: '井外四周精心绘制五彩织锦垂幔，悬挂飘动彩铃与流苏璎珞，微风拂动。'
              }
            ]
          }
        ]
      },
      {
        id: '0321',
        shortNum: '第321窟',
        eraTag: '初唐',
        fullName: '莫高窟 第321窟（初唐 · 湛蓝佛国）',
        era: '初唐 / 武周时期（公元690-704年）',
        type: '覆斗形殿堂式窟',
        highlight: '深邃湛蓝基调、北壁阿弥陀经变水榭建筑、南壁十轮经变地藏救苦',
        walls: ['全貌立体', '北壁水榭经变', '南壁十轮经变', '窟顶八层团花'],
        description: '被誉为莫高窟中最精美华丽的初唐洞窟之一。全窟以深邃湛蓝的青金石色为基调，营造出空灵神秘的佛国空间，建筑画与地藏十轮经变具有极高的图像学价值。',
        wallItems: [
          {
            orient: '全貌',
            name: '主室立体全景透视',
            image: '/images/caves/cave_0321/overview.jpg',
            desc: '第321窟全景空间，覆斗殿堂结构，壁面以青金石矿物湛蓝为主色调。',
            tags: ['全景概览', '初唐覆斗']
          },
          {
            orient: '北壁',
            name: '阿弥陀经变（水榭楼阁与舞乐）',
            image: '/images/caves/cave_0321/north_shuixie.jpg',
            desc: '整面北壁绘制阿弥陀净土。画面中歇山顶楼阁巍峨耸立，花砖地面铺陈，七宝池中白鹤孔雀翔集，舞伎翩翩起舞。',
            tags: ['水榭楼阁', '青金石蓝', '净土舞乐'],
            hotspots: [
              {
                id: 'c321-1',
                x: 50,
                y: 30,
                title: '青金石湛蓝天幕',
                subtitle: '丝路阿富汗矿物颜料',
                content: '全窟使用极其贵重的进口青金石矿物颜料，千年后依然呈现通透宝石蓝。'
              }
            ]
          },
          {
            orient: '南壁',
            name: '《十轮经变》（地藏救苦图）',
            image: '/images/caves/cave_0321/south_dizang.jpg',
            desc: '莫高窟保存最早、最完整的十轮经变。详细展示地藏菩萨分身救度地狱众生的宏大愿景与生动情节。',
            tags: ['地藏信仰', '十轮经变', '因缘故事']
          },
          {
            orient: '窟顶',
            name: '八层重叠团花井心藻井',
            image: '/images/caves/cave_0321/top_zaojing.jpg',
            desc: '藻井层级丰富达八层之多，四角以灵动的蝴蝶花角饰点缀，纹样精巧繁复，色彩对比鲜明。',
            tags: ['八层团花', '蝴蝶花纹', '初唐纹饰'],
            hotspots: [
              {
                id: 'c321-2',
                x: 50,
                y: 50,
                title: '八层重叠宝相团花',
                subtitle: '武周繁复装饰风格',
                content: '井心图案层层套叠达八重，几何菱格与卷草繁密而秩序井然。'
              }
            ]
          }
        ]
      },
      {
        id: '0322',
        shortNum: '第322窟',
        eraTag: '初唐',
        fullName: '莫高窟 第322窟（初唐 · 葡萄藻井）',
        era: '初唐（五代重修，公元618-704年）',
        type: '覆斗形小型殿堂窟',
        highlight: '窟顶缠枝葡萄纹藻井、十六身飞天环绕、西壁双层龛胡貌天王像',
        walls: ['全貌立体', '窟顶缠枝葡萄', '西壁双层佛龛', '南壁弥勒说法'],
        description: '覆斗形小型窟的典范之作。窟顶藻井融汇西域风情的缠枝葡萄与石榴纹，外围十六身飞天环绕飞翔；西壁双层龛内天王像具胡貌梵相，体现丝绸之路东西文明交融。',
        wallItems: [
          {
            orient: '全貌',
            name: '主室立体全景透视',
            image: '/images/caves/cave_0322/overview.jpg',
            desc: '第322窟主室殿堂实景，双层西壁佛龛与精美藻井融为一体。',
            tags: ['全景概览', '双层佛龛']
          },
          {
            orient: '窟顶',
            name: '缠枝葡萄纹藻井与十六身飞天',
            image: '/images/caves/cave_0322/top_putao.jpg',
            desc: '极具丝路异域风情的葡萄石榴缠枝纹样，周围环绕十六身飞行天人，或抱笙或抚琴，俯冲仰翔，动感十足。',
            tags: ['缠枝葡萄', '十六飞天', '丝路风情'],
            hotspots: [
              {
                id: 'c322-1',
                x: 50,
                y: 50,
                title: '缠枝葡萄与石榴纹',
                subtitle: '西域绿洲农业文化传入中原',
                content: '藤蔓间挂满饱满葡萄与石榴，见证丝绸之路中西物质与艺术交融。'
              },
              {
                id: 'c322-2',
                x: 30,
                y: 30,
                title: '十六身环绕飞天',
                subtitle: '顺时针凌空追逐飞舞',
                content: '十六身飞天手持排箫、阮咸、法螺，首尾相接，极具环形音乐律动感。'
              }
            ]
          },
          {
            orient: '西壁',
            name: '双层佛龛与胡貌梵相天王像',
            image: '/images/caves/cave_0322/west_fokan.jpg',
            desc: '西壁开精巧双层龛，塑一佛二弟子二菩萨二天王。其中天王鼻高翼宽、浓眉大眼，具鲜明的胡人容貌特征。',
            tags: ['双层佛龛', '胡貌天王', '初唐彩塑']
          },
          {
            orient: '南壁',
            name: '弥勒说法图与供养人群像',
            image: '/images/caves/cave_0322/south_shuofa.jpg',
            desc: '构图工整严谨，初唐重彩矿物矿色厚重沉着，下方绘有虔诚肃穆的丝路供养人群像。',
            tags: ['弥勒说法', '供养人像', '矿彩重绘']
          }
        ]
      }
    ]
  },

  onLoad() {
    this.setData({
      currentSceneData: this.data.coCreateData['qingfo'],
      currentDefect: this.data.defectOptions['lead_oxidation']
    })
  },

  // 打开“云游壁画修复师”
  onOpenRestorer() {
    this.setData({
      showRestorerModal: true,
      activeDefectKey: 'lead_oxidation',
      currentDefect: this.data.defectOptions['lead_oxidation'],
      activeBranchIndex: 1,
      userTags: { 0: true, 1: true, 2: true, 3: true }
    })
  },

  // 切换病害类型
  onSelectDefect(e) {
    const key = e.currentTarget.dataset.key
    this.setData({
      activeDefectKey: key,
      currentDefect: this.data.defectOptions[key],
      activeBranchIndex: 1,
      userTags: { 0: true, 1: true, 2: true, 3: true }
    })
  },

  // 选择算法修复分支
  onSelectBranch(e) {
    const bIdx = e.currentTarget.dataset.bindex
    this.setData({
      activeBranchIndex: bIdx
    })
  },

  // 切换校验标签
  onToggleTag(e) {
    const vIdx = e.currentTarget.dataset.vindex
    const newTags = { ...this.data.userTags }
    newTags[vIdx] = !newTags[vIdx]
    this.setData({ userTags: newTags })
  },

  // 提交修复数据链条
  onSubmitRepairChain() {
    const defectName = this.data.currentDefect.type
    const branch = this.data.currentDefect.branches[this.data.activeBranchIndex]
    
    wx.showLoading({ title: '沉淀数据链中...', mask: true })
    setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '📜 人机协同修复溯源证书',
        content: `【实体锚点】莫高窟 第257窟 · 鹿王本生\n【诊断病害】${defectName}\n【校验路径】${branch.title}（${branch.stance}）\n【文保底线】已锁定“最小干预”存真基线\n\n数据链条（原始残缺图 → U-Net/扩散算法分支 → 人文校验复原图）已成功归档至敦煌智慧数据库！`,
        showCancel: true,
        cancelText: '完成推演',
        confirmText: '查看数据链',
        confirmColor: '#8B261E'
      })
    }, 1200)
  },

  // 关闭修复师
  closeRestorer() {
    this.setData({
      showRestorerModal: false
    })
  },

  // 打开人机叙事共创工坊 (须摩提女因缘)
  onOpenCoCreate() {
    this.setData({
      showCoCreateModal: true,
      activeSceneKey: 'qingfo',
      currentSceneData: this.data.coCreateData['qingfo'],
      activePerspectiveIndex: 0,
      activeVoiceIndex: 0
    })
  },

  // 切换故事画局部 (请佛 vs 移山)
  onSwitchScene(e) {
    const sceneKey = e.currentTarget.dataset.scene
    this.setData({
      activeSceneKey: sceneKey,
      currentSceneData: this.data.coCreateData[sceneKey],
      activePerspectiveIndex: 0
    })
  },

  // 选择叙事视角 (视角A/B/C)
  onSelectPerspective(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({
      activePerspectiveIndex: idx
    })
  },

  // 选择配音风格
  onSelectVoice(e) {
    const vIdx = e.currentTarget.dataset.vindex
    this.setData({
      activeVoiceIndex: vIdx
    })
  },

  // 合成 AI 叙事短视频
  onGenerateStoryVideo() {
    const sceneName = this.data.currentSceneData.title
    const perspectiveName = this.data.currentSceneData.perspectives[this.data.activePerspectiveIndex].name
    const voice = this.data.voiceStyles[this.data.activeVoiceIndex]

    wx.showLoading({
      title: 'AI 合成视频中...',
      mask: true
    })

    setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '🎉 共创短视频合成成功',
        content: `【片段】第257窟 · ${sceneName}\n【视角】${perspectiveName}\n【配音】${voice}\n\n已成功收录至「敦煌民间阐释共创数据库」并同步生成数字专属证书！`,
        showCancel: true,
        cancelText: '稍后查看',
        confirmText: '去社区查看',
        confirmColor: '#8B261E'
      })
    }, 1200)
  },

  // 关闭共创工坊
  closeCoCreate() {
    this.setData({
      showCoCreateModal: false
    })
  },

  // 点击 6 大入口
  onOpenModule(e) {
    const mod = e.currentTarget.dataset.mod

    // 针对「看壁画」，弹出洞窟选择抽屉
    if (mod === 'murals') {
      this.setData({
        showCaveSelector: true,
        showLandscapeViewer: false,
        showFullScreenLightbox: false
      })
      return
    }

    // 针对「看漫画」，也可快速进入《须摩提女因缘》共创
    if (mod === 'comics') {
      this.onOpenCoCreate()
      return
    }

    const titles = {
      artifacts: '看文物',
      architecture: '看古建',
      journals: '看期刊',
      videos: '看视频'
    }
    const name = titles[mod] || '该模块'

    wx.showModal({
      title: name,
      content: `您已点击「${name}」，模块已就绪并加载对应数字资源。`,
      showCancel: false,
      confirmText: '进入品鉴',
      confirmColor: '#8B261E'
    })
  },

  // 选择洞窟 -> 打开横屏壁画大图品鉴器
  onSelectCave(e) {
    const caveId = e.currentTarget.dataset.id
    const targetCave = this.data.caveList.find(c => c.id === caveId)
    
    if (targetCave) {
      this.setData({
        selectedCaveId: caveId,
        currentCave: targetCave,
        activeWallIndex: 0,
        currentWallImage: targetCave.wallItems[0].image,
        showCaveSelector: false,
        showLandscapeViewer: true,
        showFullScreenLightbox: false,
        activeHotspot: null
      })
    }
  },

  // 切换壁面 (南壁/北壁/窟顶/全景)
  onSwitchWall(e) {
    const index = e.currentTarget.dataset.index
    if (this.data.currentCave && this.data.currentCave.wallItems[index]) {
      this.setData({
        activeWallIndex: index,
        currentWallImage: this.data.currentCave.wallItems[index].image,
        activeHotspot: null
      })
    }
  },

  // 点击热点标点
  onTapHotspot(e) {
    const spot = e.currentTarget.dataset.spot
    this.setData({
      activeHotspot: spot
    })
  },

  // 关闭热点解析弹层
  onCloseHotspot() {
    this.setData({
      activeHotspot: null
    })
  },

  // 点击横屏大图 -> 打开原生全屏内嵌灯箱
  onOpenLightbox() {
    this.setData({
      showFullScreenLightbox: true
    })
  },

  // 关闭全屏内嵌灯箱
  onCloseLightbox() {
    this.setData({
      showFullScreenLightbox: false
    })
  },

  // 关闭洞窟选择器
  closeCaveSelector() {
    this.setData({
      showCaveSelector: false
    })
  },

  // 关闭横屏品鉴器
  closeLandscapeViewer() {
    this.setData({
      showLandscapeViewer: false,
      activeHotspot: null
    })
  },

  // 从横屏品鉴器返回洞窟选择
  backToSelector() {
    this.setData({
      showLandscapeViewer: false,
      showCaveSelector: true,
      activeHotspot: null
    })
  },

  preventBubble() {}
})
