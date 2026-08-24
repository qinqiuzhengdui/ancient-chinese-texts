import React, { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronLeft, ChevronRight, Sliders, Info, ThumbsUp, AlertCircle, Save, ShieldAlert, AlertTriangle, Sparkles, Plus, Square, MessageSquare, Trash2, MousePointer, Maximize2, Minimize2, Edit } from 'lucide-react';
import './HDVerification.css';

// 示例古籍数据列表
interface OcrChunk {
  text: string;
  isLowConfidence: boolean;
  reason?: string;
}

interface ImageAnnotation {
  id: string;
  type: 'box' | 'pin';
  startX: number; // percentage (0-100)
  startY: number; // percentage (0-100)
  endX?: number; // percentage (0-100)
  endY?: number; // percentage (0-100)
  text: string;
}

interface TraceabilityMetadata {
  dataSource: string;
  modelName: string;
  processRecord: string;
  auditRecord: string[];
}

interface BookPage {
  id: string;
  name: string;
  original: string;
  enhanced: string;
  psnr: number;
  ssim: number;
  ocrBefore: string;
  ocrAfter: string;
  ocrConfidence: number; // Percentage: 0 to 100
  imageConfidence: 'high' | 'medium' | 'low';
  riskLevel: 'high' | 'medium' | 'low';
  warnings: string[];
  ocrHighlighted: OcrChunk[];
  status: 'pending' | 'passed' | 'failed';
  notes?: string;
  annotations?: ImageAnnotation[];
  metadata?: TraceabilityMetadata;
}

const DEMO_PAGES: BookPage[] = [
  {
    id: 'p1',
    name: 'Pelliot chinois 4642 - 第 01 页',
    original: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
    enhanced: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop',
    psnr: 34.25,
    ssim: 0.968,
    ocrBefore: '敦煌石... 岁在... 无量寿...',
    ocrAfter: '敦煌石室遗书 岁在庚戌 无量寿宗要经卷下',
    ocrConfidence: 89,
    imageConfidence: 'medium',
    riskLevel: 'medium',
    warnings: [
      "【过度纠错风险】‘岁在庚戌’(p1)中的‘戌’字，在低清原图里边缘极为模糊。OCR模型倾向于将其误识别/过度纠错为常见字‘戌’或‘戊’。请仔细核实原始笔画。",
      "【概率性生成风险】‘遗书’二字纸张有霉斑粘连，AI超分网络在此区域可能存在概率性生造细节，请以低清原件笔画走势为准。"
    ],
    ocrHighlighted: [
      { text: "敦煌石室", isLowConfidence: false },
      { text: "遗书", isLowConfidence: true, reason: "笔画霉斑粘连，防范概率性生造" },
      { text: " 岁在", isLowConfidence: false },
      { text: "庚戌", isLowConfidence: true, reason: "字形边缘模糊，防范过度纠错为相似字" },
      { text: " 无量寿宗要经卷下", isLowConfidence: false }
    ],
    annotations: [
      {
        id: 'ann1',
        type: 'box',
        startX: 45,
        startY: 32,
        endX: 58,
        endY: 58,
        text: '遗书二字霉斑粘连严重，注意防范扩散模型生造笔画！'
      }
    ],
    status: 'pending',
    metadata: {
      dataSource: "法国国家图书馆 (BNF) - Pelliot chinois 4642 卷号 01",
      modelName: "ESRGAN-AncientTexts-VL v2.4.1 (Gitee AI / Moark Serverless)",
      processRecord: "2026-07-09 14:23:10 - 灰度图通道转换；频域自适应去噪去网纹；4x 双向超分辨率字形重建。",
      auditRecord: [
        "2026-07-09 18:30:15 - [系统] 初始化待审核，置信度标记完成。",
        "2026-07-10 09:12:00 - [审核员-刘老师] 初次核对，发现‘遗书’霉斑粘连字形生成风险，添加局部方框批注。"
      ]
    }
  },
  {
    id: 'p2',
    name: 'Pelliot chinois 4642 - 第 02 页',
    original: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop',
    enhanced: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop',
    psnr: 32.18,
    ssim: 0.954,
    ocrBefore: '大乘... 入楞伽...',
    ocrAfter: '大乘入楞伽经卷第一 菩提留支译',
    ocrConfidence: 97,
    imageConfidence: 'high',
    riskLevel: 'low',
    warnings: [
      "【提示】当前页面整体修复质量优良，未检测到大面积概率性生成或严重过度纠错风险。请进行正常字词复核。"
    ],
    ocrHighlighted: [
      { text: "大乘入楞伽经卷第一 菩提留支译", isLowConfidence: false }
    ],
    annotations: [],
    status: 'passed',
    notes: '字迹清晰，色彩还原精准',
    metadata: {
      dataSource: "法国国家图书馆 (BNF) - Pelliot chinois 4642 卷号 02",
      modelName: "ESRGAN-AncientTexts-VL v2.4.1 (Gitee AI / Moark Serverless)",
      processRecord: "2026-07-09 14:24:45 - 图像平滑预处理；4x 双向超分辨率字形重建。",
      auditRecord: [
        "2026-07-09 18:30:16 - [系统] 初始化待审核，整体重构质量良好。",
        "2026-07-10 10:15:32 - [审核员-赵老师] 确认字符笔画完整，对比无过度修补，标记‘核对通过’。"
      ]
    }
  },
  {
    id: 'p3',
    name: 'Pelliot chinois 4642 - 第 03 页',
    original: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600&auto=format&fit=crop',
    enhanced: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop',
    psnr: 29.84,
    ssim: 0.912,
    ocrBefore: '妙法莲华经方便品第二 鸠摩罗什译',
    ocrAfter: '妙法莲华经方便品第二 鸠摩罗什译',
    ocrConfidence: 72,
    imageConfidence: 'low',
    riskLevel: 'high',
    warnings: [
      "【概率性生成风险】左上角网格印刷噪声及横线密集，模型极易将噪声点识别重构为多余的“笔画碎片”或生造字迹。",
      "【过度纠错风险】‘方便品’(p3)中的‘便’字磨损破裂严重。由于原始信息缺损，OCR大模型存在过度揣测字形，强行补齐为常用字‘便’的风险，需重点核查。"
    ],
    ocrHighlighted: [
      { text: "妙法莲华经", isLowConfidence: false },
      { text: "方便品", isLowConfidence: true, reason: "纸张破损严重，防范过度臆造与强行补齐" },
      { text: "第二 鸠摩罗什译", isLowConfidence: false }
    ],
    status: 'failed',
    notes: '左上角仍有轻微网格噪声残留',
    metadata: {
      dataSource: "法国国家图书馆 (BNF) - Pelliot chinois 4642 卷号 03",
      modelName: "ESRGAN-AncientTexts-VL v2.4.1 (Gitee AI / Moark Serverless)",
      processRecord: "2026-07-09 14:26:12 - 频域自适应去噪；局部网格噪声滤除；4x 双向超分辨率字形重建。",
      auditRecord: [
        "2026-07-09 18:30:18 - [系统] 初始化待审核，发现左上角网格印刷噪声及破损过度纠错风险。",
        "2026-07-10 10:45:10 - [审核员-王老师] 核对未通过。‘便’字存在强行修补导致的偏旁笔画变形，标记‘重新处理’。"
      ]
    }
  }
];

const HDVerification = () => {
  const [pages, setPages] = useState<BookPage[]>(DEMO_PAGES);
  const [selectedPage, setSelectedPage] = useState<BookPage>(DEMO_PAGES[0]);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100 percentage
  const [reviewStatus, setReviewStatus] = useState<'passed' | 'failed'>('passed');
  const [notes, setNotes] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 数字元数据手动修改状态
  const [isEditingMetadata, setIsEditingMetadata] = useState<boolean>(false);
  const [metaSource, setMetaSource] = useState<string>('');
  const [metaModel, setMetaModel] = useState<string>('');
  const [metaRecord, setMetaRecord] = useState<string>('');

  // 监听 ESC 键退出全屏
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 自定义双图上传相关的 state
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [customOriginal, setCustomOriginal] = useState<string | null>(null);
  const [customEnhanced, setCustomEnhanced] = useState<string | null>(null);
  const [customOriginalName, setCustomOriginalName] = useState<string>('');

  // 批注工具相关的 state
  const [activeTool, setActiveTool] = useState<'slider' | 'box' | 'pin'>('slider');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null);
  const [editingPin, setEditingPin] = useState<{ id: string; x: number; y: number; text: string; isBox?: boolean; w?: number; h?: number } | null>(null);
  const [inputText, setInputText] = useState<string>('');

  useEffect(() => {
    setReviewStatus(selectedPage.status === 'failed' ? 'failed' : 'passed');
    setNotes(selectedPage.notes || '');
    setMetaSource(selectedPage.metadata?.dataSource || '');
    setMetaModel(selectedPage.metadata?.modelName || '');
    setMetaRecord(selectedPage.metadata?.processRecord || '');
    setIsEditingMetadata(false);
  }, [selectedPage]);

  // 处理自定义图片文件的转化
  const handleCustomImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'original' | 'enhanced') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'original') {
          setCustomOriginal(reader.result as string);
          setCustomOriginalName(file.name);
        } else {
          setCustomEnhanced(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCustom = () => {
    if (!customOriginal || !customEnhanced) return;

    const newPage: BookPage = {
      id: 'custom_' + Date.now(),
      name: `自定义比对 - ${customOriginalName.substring(0, 12) || '卷册'}`,
      original: customOriginal,
      enhanced: customEnhanced,
      psnr: 31.42,
      ssim: 0.945,
      ocrBefore: '（未识别）',
      ocrAfter: '（双图已手动上传，可进行人工滑动对比核对）',
      ocrConfidence: 90,
      imageConfidence: 'medium',
      riskLevel: 'medium',
      warnings: [
        "【自定义比对风险提示】此项由您手动双图上传。请拉动滑块，对比高低清晰度下文字笔画细节，警惕概率性线条产生或过度字形修补。"
      ],
      ocrHighlighted: [
        { text: "您上传了自定义低清原图与高清修复图，请拉动对比滑块核对文字细节。", isLowConfidence: false }
      ],
      annotations: [],
      status: 'pending',
      metadata: {
        dataSource: `用户本地上传 - ${customOriginalName}`,
        modelName: "未绑定 (本地滑动对比)",
        processRecord: "手动双图导入，仅提供前端视图实时对比渲染通道。",
        auditRecord: [
          `2026-07-10 11:58:22 - [系统] 用户双图上传创建比对项。`
        ]
      }
    };

    setPages([newPage, ...pages]);
    setSelectedPage(newPage);
    // 重置状态
    setCustomOriginal(null);
    setCustomEnhanced(null);
    setCustomOriginalName('');
    setShowUploadForm(false);
  };

  // 处理对比滑动条拖拽 (重构为只在 activeTool 为 'slider' 时起效)
  const handleMove = (clientX: number) => {
    const currentContainer = isFullscreen ? fullscreenContainerRef.current : containerRef.current;
    if (!currentContainer) return;
    const rect = currentContainer.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (activeTool !== 'slider') return;
    if (!isDragging.current) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (activeTool !== 'slider') return;
    const currentContainer = isFullscreen ? fullscreenContainerRef.current : containerRef.current;
    if (!isDragging.current || !currentContainer) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // 过滤掉点击批注输入面板、删除按钮以及全屏按钮的情况
    if (
      (e.target as HTMLElement).closest('.annotation-pin-popup') || 
      (e.target as HTMLElement).closest('.ann-delete-btn') ||
      (e.target as HTMLElement).closest('.fullscreen-enter-btn')
    ) {
      return;
    }

    const currentContainer = isFullscreen ? fullscreenContainerRef.current : containerRef.current;
    if (!currentContainer) return;
    const rect = currentContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (activeTool === 'slider') {
      isDragging.current = true;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      handleMove(e.clientX);
    } else if (activeTool === 'box') {
      setIsDrawing(true);
      setDrawStart({ x, y });
      setDrawEnd({ x, y });
    } else if (activeTool === 'pin') {
      // 放置一个批注图标并弹出输入气泡
      const newPinId = 'pin_' + Date.now();
      setInputText('');
      setEditingPin({
        id: newPinId,
        x,
        y,
        text: ''
      });
    }
  };

  // 容器内部鼠标滑动（用于绘制方框的拉伸）
  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const currentContainer = isFullscreen ? fullscreenContainerRef.current : containerRef.current;
    if (activeTool === 'box' && isDrawing && drawStart && currentContainer) {
      const rect = currentContainer.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setDrawEnd({ x, y });
    }
  };

  // 容器内部抬起鼠标（用于结束方框绘制）
  const handleContainerMouseUp = () => {
    if (activeTool === 'box' && isDrawing && drawStart && drawEnd) {
      const w = Math.abs(drawStart.x - drawEnd.x);
      const h = Math.abs(drawStart.y - drawEnd.y);
      if (w > 1 && h > 1) {
        const newBoxId = 'box_' + Date.now();
        setInputText('');
        setEditingPin({
          id: newBoxId,
          x: Math.min(drawStart.x, drawEnd.x),
          y: Math.min(drawStart.y, drawEnd.y),
          w,
          h,
          isBox: true,
          text: ''
        });
      }
      setIsDrawing(false);
      setDrawStart(null);
      setDrawEnd(null);
    }
  };

  // 保存新增的批注
  const handleSaveAnnotation = () => {
    if (!editingPin) return;

    const newAnnotation: ImageAnnotation = {
      id: editingPin.id,
      type: editingPin.isBox ? 'box' : 'pin',
      startX: editingPin.x,
      startY: editingPin.y,
      endX: editingPin.isBox && editingPin.w ? editingPin.x + editingPin.w : undefined,
      endY: editingPin.isBox && editingPin.h ? editingPin.y + editingPin.h : undefined,
      text: inputText.trim() || '未命名批注'
    };

    const updatedAnnotations = [...(selectedPage.annotations || []), newAnnotation];
    
    // 更新 pages 状态列表
    const updatedPages = pages.map(p => {
      if (p.id === selectedPage.id) {
        return { ...p, annotations: updatedAnnotations };
      }
      return p;
    });

    setPages(updatedPages);
    setSelectedPage({
      ...selectedPage,
      annotations: updatedAnnotations
    });
    setEditingPin(null);
    setInputText('');
  };

  // 删除批注
  const handleDeleteAnnotation = (id: string) => {
    const updatedAnnotations = (selectedPage.annotations || []).filter(a => a.id !== id);
    const updatedPages = pages.map(p => {
      if (p.id === selectedPage.id) {
        return { ...p, annotations: updatedAnnotations };
      }
      return p;
    });
    setPages(updatedPages);
    setSelectedPage({
      ...selectedPage,
      annotations: updatedAnnotations
    });
  };

  // 清空所有批注
  const handleClearAnnotations = () => {
    if (window.confirm('确定要清空当前页面的所有批注吗？')) {
      const updatedPages = pages.map(p => {
        if (p.id === selectedPage.id) {
          return { ...p, annotations: [] };
        }
        return p;
      });
      setPages(updatedPages);
      setSelectedPage({
        ...selectedPage,
        annotations: []
      });
    }
  };

  const handleSaveReview = () => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog = `${timeStr} - [审核员] 更新核对状态为【${reviewStatus === 'passed' ? '核对通过' : '重新处理'}】${notes ? `，批注内容: ${notes}` : ''}`;

    const updatedPages = pages.map(p => {
      if (p.id === selectedPage.id) {
        const currentAudit = p.metadata?.auditRecord || [];
        return {
          ...p,
          status: reviewStatus,
          notes: notes,
          metadata: {
            ...p.metadata,
            dataSource: p.metadata?.dataSource || "系统绑定数据源",
            modelName: p.metadata?.modelName || "系统绑定模型",
            processRecord: p.metadata?.processRecord || "常规高清重构处理",
            auditRecord: [...currentAudit, newLog]
          }
        };
      }
      return p;
    });

    const updatedSelectedPage = updatedPages.find(p => p.id === selectedPage.id) || {
      ...selectedPage,
      status: reviewStatus,
      notes: notes
    };

    setPages(updatedPages);
    setSelectedPage(updatedSelectedPage);
    alert('核对结论已成功保存，流转日志已同步记录！');
  };

  const handleSaveMetadata = () => {
    const updatedPages = pages.map(p => {
      if (p.id === selectedPage.id) {
        return {
          ...p,
          metadata: {
            ...p.metadata,
            dataSource: metaSource,
            modelName: metaModel,
            processRecord: metaRecord,
            auditRecord: p.metadata?.auditRecord || []
          }
        };
      }
      return p;
    });

    const updatedSelectedPage = updatedPages.find(p => p.id === selectedPage.id) || {
      ...selectedPage,
      metadata: {
        dataSource: metaSource,
        modelName: metaModel,
        processRecord: metaRecord,
        auditRecord: selectedPage.metadata?.auditRecord || []
      }
    };

    setPages(updatedPages);
    setSelectedPage(updatedSelectedPage);
    setIsEditingMetadata(false);
    alert('元数据已成功更新！');
  };

  return (
    <div className="hd-verify-container">
      {/* 左侧：页面选择列表 */}
      <div className="verify-sidebar glass-panel">
        <div className="sidebar-title">
          <Sliders className="icon-gold" size={18} />
          <h3>待核对古籍卷册</h3>
        </div>

        {/* 自定义比对图手动上传区 */}
        <div className="custom-comparison-uploader">
          <button 
            className={`btn btn-outline uploader-toggle-btn ${showUploadForm ? 'active' : ''}`}
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <Plus size={14} />
            上传自定义比对图
          </button>

          {showUploadForm && (
            <div className="uploader-form">
              <div className="uploader-row">
                <label className="uploader-label">1. 低清原图</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleCustomImageChange(e, 'original')} 
                  className="uploader-input"
                />
              </div>
              <div className="uploader-row">
                <label className="uploader-label">2. 高清修复图</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleCustomImageChange(e, 'enhanced')} 
                  className="uploader-input"
                />
              </div>
              <button 
                className="btn btn-primary submit-uploader-btn"
                onClick={handleSubmitCustom}
                disabled={!customOriginal || !customEnhanced}
              >
                生成比对项
              </button>
            </div>
          )}
        </div>

        <div className="page-list">
          {pages.map((p) => (
            <button 
              key={p.id}
              className={`page-item-btn ${selectedPage.id === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPage(p)}
            >
              <div className="page-item-info">
                <span className="page-name">{p.name}</span>
                <span className={`status-badge ${p.status}`}>
                  {p.status === 'pending' && '待核对'}
                  {p.status === 'passed' && '核对通过'}
                  {p.status === 'failed' && '重新处理'}
                </span>
              </div>
              <ChevronRight size={16} className="arrow-icon" />
            </button>
          ))}
        </div>
      </div>

      {/* 右侧主工作区 */}
      <div className="verify-main">
        {/* 对比滑块视图 */}
        <div className="comparison-card glass-panel">
          <div className="card-header">
            <h4>拖拽滑块对比核对 (左：低清原图 ｜ 右：高清修复)</h4>
            <span className="page-indicator">{selectedPage.name}</span>
          </div>

          {/* WPS风格批注工具栏 */}
          <div className="wps-annotation-toolbar">
            <span className="toolbar-title-text">批注标注工具：</span>
            <button 
              className={`wps-tool-btn ${activeTool === 'slider' ? 'active' : ''}`}
              onClick={() => { setActiveTool('slider'); setEditingPin(null); }}
              title="双图对比滑动模式"
            >
              <MousePointer size={14} />
              双图滑动比对
            </button>
            <button 
              className={`wps-tool-btn ${activeTool === 'box' ? 'active' : ''}`}
              onClick={() => { setActiveTool('box'); setEditingPin(null); }}
              title="圈选方框标注"
            >
              <Square size={14} />
              圈选方框
            </button>
            <button 
              className={`wps-tool-btn ${activeTool === 'pin' ? 'active' : ''}`}
              onClick={() => { setActiveTool('pin'); setEditingPin(null); }}
              title="添加文本批注点"
            >
              <MessageSquare size={14} />
              放置批注图标
            </button>
            {(selectedPage.annotations && selectedPage.annotations.length > 0) && (
              <button 
                className="wps-tool-btn btn-clear-all"
                onClick={handleClearAnnotations}
                title="清空当前所有批注"
              >
                <Trash2 size={14} />
                清空本页批注
              </button>
            )}
          </div>

          <div 
            className={`slider-image-container cursor-${activeTool}`} 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleContainerMouseMove}
            onMouseUp={handleContainerMouseUp}
          >
            {/* 原始低清图 (底层/左侧) */}
            <img 
              src={selectedPage.original} 
              alt="Original" 
              className="slider-image original" 
              draggable="false"
            />

            {/* 高清超分图 (顶层/右侧剪裁) */}
            <div 
              className="enhanced-image-wrapper"
              style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
            >
              <img 
                src={selectedPage.enhanced} 
                alt="Enhanced" 
                className="slider-image enhanced"
                draggable="false"
              />
            </div>

            {/* 绘制渲染层：渲染已有的方框和批注针 */}
            {selectedPage.annotations && selectedPage.annotations.map((ann) => {
              if (ann.type === 'box' && ann.endX && ann.endY) {
                const x = Math.min(ann.startX, ann.endX);
                const y = Math.min(ann.startY, ann.endY);
                const w = Math.abs(ann.startX - ann.endX);
                const h = Math.abs(ann.startY - ann.endY);
                return (
                  <div 
                    key={ann.id} 
                    className="rendered-annotation-box"
                    style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
                  >
                    <button 
                      className="direct-delete-btn" 
                      onClick={(e) => { e.stopPropagation(); handleDeleteAnnotation(ann.id); }}
                      title="删除此框选"
                    >
                      <X size={10} />
                    </button>
                    <div className="box-hover-tooltip">
                      <p>{ann.text}</p>
                    </div>
                  </div>
                );
              } else if (ann.type === 'pin') {
                return (
                  <div 
                    key={ann.id} 
                    className="rendered-annotation-pin"
                    style={{ left: `${ann.startX}%`, top: `${ann.startY}%` }}
                  >
                    <MessageSquare size={16} className="pin-icon" />
                    <button 
                      className="direct-delete-btn pin-direct-delete" 
                      onClick={(e) => { e.stopPropagation(); handleDeleteAnnotation(ann.id); }}
                      title="删除此批注"
                    >
                      <X size={8} />
                    </button>
                    <div className="pin-hover-tooltip">
                      <p>{ann.text}</p>
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {/* 正在绘制中的虚线框预览 */}
            {activeTool === 'box' && isDrawing && drawStart && drawEnd && (
              <div 
                className="drawing-preview-box"
                style={{
                  left: `${Math.min(drawStart.x, drawEnd.x)}%`,
                  top: `${Math.min(drawStart.y, drawEnd.y)}%`,
                  width: `${Math.abs(drawStart.x - drawEnd.x)}%`,
                  height: `${Math.abs(drawStart.y - drawEnd.y)}%`
                }}
              />
            )}

            {/* 正在录入批注文本的弹窗浮层 */}
            {editingPin && (
              <div 
                className="annotation-pin-popup"
                style={{ 
                  left: `${editingPin.x}%`, 
                  top: `${editingPin.y}%`,
                  transform: editingPin.x > 70 ? 'translate(-105%, -50%)' : 'translate(10px, -50%)'
                }}
              >
                <div className="popup-arrow" />
                <h5 className="popup-title">
                  {editingPin.isBox ? '新建方框批注' : '新建图标批注'}
                </h5>
                <textarea
                  className="popup-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="请输入对该区域的批注说明（如：字迹模糊、接缝拼接偏差）..."
                  autoFocus
                />
                <div className="popup-actions">
                  <button className="popup-btn cancel" onClick={() => setEditingPin(null)}>取消</button>
                  <button className="popup-btn save" onClick={handleSaveAnnotation}>保存</button>
                </div>
              </div>
            )}

            {/* 滑动控制柄 */}
            <div 
              className="slider-handle"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="handle-line"></div>
              <div className="handle-circle">
                <ChevronLeft size={12} />
                <ChevronRight size={12} />
              </div>
            </div>

            {/* 滑动标签指示 */}
            <span className="slider-label left-label">低清原图</span>
            <span className="slider-label right-label">高清重构</span>

            {/* 全屏对比进入按钮 (右下角放一个全屏按钮) */}
            <button 
              className="fullscreen-enter-btn"
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
              title="进入全屏对比核对"
            >
              <Maximize2 size={13} />
              全屏比对
            </button>
          </div>
        </div>

        {/* 性能指标与核对结果录入 */}
        <div className="info-and-form-grid">
          {/* 性能指标与高清重建细节对比 */}
          <div className="metrics-box glass-panel">
            <div className="card-title">
              <Info className="icon-gold" size={18} />
              <h4>算法模型重构与置信度指标</h4>
            </div>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">峰值信噪比 (PSNR)</span>
                <span className="metric-value">{selectedPage.psnr.toFixed(2)} dB</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">结构相似性 (SSIM)</span>
                <span className="metric-value">{selectedPage.ssim.toFixed(3)}</span>
              </div>
              <div className={`metric-card conf-badge-${selectedPage.ocrConfidence >= 90 ? 'high' : selectedPage.ocrConfidence >= 80 ? 'medium' : 'low'}`}>
                <span className="metric-label">文字超分重建置信度</span>
                <span className="metric-value">{selectedPage.ocrConfidence}%</span>
              </div>
              <div className={`metric-card risk-badge-${selectedPage.riskLevel}`}>
                <span className="metric-label">生成风险评级</span>
                <span className="metric-value">
                  {selectedPage.riskLevel === 'low' && '低风险'}
                  {selectedPage.riskLevel === 'medium' && '中风险'}
                  {selectedPage.riskLevel === 'high' && '高风险'}
                </span>
              </div>
            </div>

            <div className="ocr-comparison-section">
              <h5>超分重建字形结构与去噪比对</h5>
              <div className="ocr-comp-grid">
                <div className="ocr-box ocr-before">
                  <span className="box-badge before-badge">原图退化细节</span>
                  <p>{selectedPage.ocrBefore === '（未识别）' ? '（双图比对项，请查看上方图片区域）' : '扫描网纹残留、字形边缘糊化粘连、伴有较重霉斑噪声'}</p>
                </div>
                <div className="ocr-box ocr-after">
                  <span className="box-badge after-badge">字形重建特征 (置信度标注)</span>
                  <p className="ocr-highlight-para">
                    {selectedPage.ocrHighlighted.map((chunk, idx) => (
                      chunk.isLowConfidence ? (
                        <span key={idx} className="ocr-chunk-low-conf" title={chunk.reason}>
                          {chunk.text}
                          <span className="ocr-tooltip">{chunk.reason}</span>
                        </span>
                      ) : (
                        <span key={idx}>{chunk.text}</span>
                      )
                    ))}
                  </p>
                </div>
              </div>
            </div>

            {/* AI 可信度与风险提示面板 */}
            <div className="ai-risk-panel">
              <div className="panel-header">
                <AlertTriangle size={15} className="warn-icon" />
                <span>AI置信度标签与生成风险提示</span>
              </div>
              <ul className="warn-list">
                {selectedPage.warnings.map((w, idx) => (
                  <li key={idx} className="warn-item">{w}</li>
                ))}
              </ul>
              <div className="general-warning">
                <strong>🚨 提示：</strong> 深度学习超分算法在大面积破损或霉斑区域包含一定的<strong>“概率性生成”</strong>，且重建时倾向于按照大模型先验<strong>“过度纠错”</strong>（如强行修补残字笔画）。请务必拉动滑块对照低清原图核验。
              </div>
            </div>
          </div>

          {/* 核对结论填写表单 */}
          <div className="review-form-box glass-panel">
            <div className="card-title">
              <ThumbsUp className="icon-gold" size={18} />
              <h4>核对结论评估录入</h4>
            </div>

            <div className="form-content">
              <div className="form-row">
                <label className="form-label">核对结论</label>
                <div className="status-selector-grid">
                  <button 
                    className={`status-select-btn pass ${reviewStatus === 'passed' ? 'active' : ''}`}
                    onClick={() => setReviewStatus('passed')}
                  >
                    <Check size={16} />
                    审核通过
                  </button>
                  <button 
                    className={`status-select-btn fail ${reviewStatus === 'failed' ? 'active' : ''}`}
                    onClick={() => setReviewStatus('failed')}
                  >
                    <X size={16} />
                    重新处理
                  </button>
                </div>
              </div>

              <div className="form-row">
                <label className="form-label">批注/改进意见 (可留空)</label>
                <textarea 
                  className="notes-textarea" 
                  placeholder="填写关于图像色彩还原、文字对比度、笔画轮廓或接缝的反馈意见..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button className="btn btn-primary save-btn" onClick={handleSaveReview}>
                <Save size={16} />
                保存并更新结论
              </button>
            </div>
          </div>
        </div>

        {/* 处理溯源与技术透明 (数字元数据绑定) */}
        <div className="traceability-card glass-panel">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert className="icon-gold" size={18} />
              <h4>处理溯源与技术透明 (数字元数据绑定)</h4>
            </div>
            {isEditingMetadata ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline btn-xs btn-cancel-meta" onClick={() => setIsEditingMetadata(false)}>取消</button>
                <button className="btn btn-primary btn-xs btn-save-meta" onClick={handleSaveMetadata}>保存修改</button>
              </div>
            ) : (
              <button className="btn btn-outline btn-xs btn-edit-meta" onClick={() => setIsEditingMetadata(true)}>
                <Edit size={12} style={{ marginRight: '4px' }} />
                手动修改元数据
              </button>
            )}
          </div>
          <div className="traceability-grid">
            <div className="trace-item">
              <span className="trace-label">源头数据来源</span>
              {isEditingMetadata ? (
                <input 
                  type="text" 
                  className="meta-edit-input" 
                  value={metaSource} 
                  onChange={(e) => setMetaSource(e.target.value)} 
                  placeholder="请输入源头数据来源..."
                />
              ) : (
                <span className="trace-value">{selectedPage.metadata?.dataSource || '未知来源'}</span>
              )}
            </div>
            <div className="trace-item">
              <span className="trace-label">高清化模型版本</span>
              {isEditingMetadata ? (
                <input 
                  type="text" 
                  className="meta-edit-input" 
                  value={metaModel} 
                  onChange={(e) => setMetaModel(e.target.value)} 
                  placeholder="请输入高清化模型版本..."
                />
              ) : (
                <span className="trace-value">{selectedPage.metadata?.modelName || '未绑定模型'}</span>
              )}
            </div>
            <div className="trace-item">
              <span className="trace-label">技术处理记录</span>
              {isEditingMetadata ? (
                <textarea 
                  className="meta-edit-textarea font-mono" 
                  value={metaRecord} 
                  onChange={(e) => setMetaRecord(e.target.value)} 
                  placeholder="请输入技术处理记录..."
                />
              ) : (
                <span className="trace-value font-mono">{selectedPage.metadata?.processRecord || '无处理记录'}</span>
              )}
            </div>
            <div className="trace-item audit-logs-item">
              <span className="trace-label">人工审核与流转日志 (最新排前)</span>
              <div className="audit-logs-list">
                {selectedPage.metadata?.auditRecord && [...selectedPage.metadata.auditRecord].reverse().map((log, idx) => (
                  <div key={idx} className="audit-log-row">
                    <span className="bullet">•</span>
                    <span className="log-text">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 退出全屏弹窗对比层 */}
      {isFullscreen && (
        <div className="fullscreen-comparison-modal">
          <div className="fullscreen-modal-header">
            <span className="fullscreen-modal-title">全屏对比核对模式 (可拖动中轴线，按 ESC 或点击右上角退出)</span>
            <button className="btn btn-outline btn-exit-fullscreen" onClick={() => setIsFullscreen(false)}>
              <Minimize2 size={14} />
              退出全屏
            </button>
          </div>
          
          <div className="fullscreen-modal-body">
            {/* WPS风格批注工具栏 */}
            <div className="wps-annotation-toolbar">
              <span className="toolbar-title-text">全屏批注标注工具：</span>
              <button 
                className={`wps-tool-btn ${activeTool === 'slider' ? 'active' : ''}`}
                onClick={() => { setActiveTool('slider'); setEditingPin(null); }}
                title="双图对比滑动模式"
              >
                <MousePointer size={14} />
                双图滑动比对
              </button>
              <button 
                className={`wps-tool-btn ${activeTool === 'box' ? 'active' : ''}`}
                onClick={() => { setActiveTool('box'); setEditingPin(null); }}
                title="圈选方框标注"
              >
                <Square size={14} />
                圈选方框
              </button>
              <button 
                className={`wps-tool-btn ${activeTool === 'pin' ? 'active' : ''}`}
                onClick={() => { setActiveTool('pin'); setEditingPin(null); }}
                title="添加文本批注点"
              >
                <MessageSquare size={14} />
                放置批注图标
              </button>
              {(selectedPage.annotations && selectedPage.annotations.length > 0) && (
                <button 
                  className="wps-tool-btn btn-clear-all"
                  onClick={handleClearAnnotations}
                  title="清空当前所有批注"
                >
                  <Trash2 size={14} />
                  清空本页批注
                </button>
              )}
            </div>

            <div 
              className={`slider-image-container fullscreen-active-container cursor-${activeTool}`} 
              ref={fullscreenContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleContainerMouseMove}
              onMouseUp={handleContainerMouseUp}
            >
              {/* 原始低清图 (底层/左侧) */}
              <img 
                src={selectedPage.original} 
                alt="Original" 
                className="slider-image original" 
                draggable="false"
              />

              {/* 高清超分图 (顶层/右侧剪裁) */}
              <div 
                className="enhanced-image-wrapper"
                style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
              >
                <img 
                  src={selectedPage.enhanced} 
                  alt="Enhanced" 
                  className="slider-image enhanced"
                  draggable="false"
                />
              </div>

              {/* 绘制渲染层：渲染已有的方框和批注针 */}
              {selectedPage.annotations && selectedPage.annotations.map((ann) => {
                if (ann.type === 'box' && ann.endX && ann.endY) {
                  const x = Math.min(ann.startX, ann.endX);
                  const y = Math.min(ann.startY, ann.endY);
                  const w = Math.abs(ann.startX - ann.endX);
                  const h = Math.abs(ann.startY - ann.endY);
                  return (
                    <div 
                      key={ann.id} 
                      className="rendered-annotation-box"
                      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
                    >
                      <button 
                        className="direct-delete-btn" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteAnnotation(ann.id); }}
                        title="删除此框选"
                      >
                        <X size={10} />
                      </button>
                      <div className="box-hover-tooltip">
                        <p>{ann.text}</p>
                      </div>
                    </div>
                  );
                } else if (ann.type === 'pin') {
                  return (
                    <div 
                      key={ann.id} 
                      className="rendered-annotation-pin"
                      style={{ left: `${ann.startX}%`, top: `${ann.startY}%` }}
                    >
                      <MessageSquare size={16} className="pin-icon" />
                      <button 
                        className="direct-delete-btn pin-direct-delete" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteAnnotation(ann.id); }}
                        title="删除此批注"
                      >
                        <X size={8} />
                      </button>
                      <div className="pin-hover-tooltip">
                        <p>{ann.text}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              {/* 正在绘制中的虚线框预览 */}
              {activeTool === 'box' && isDrawing && drawStart && drawEnd && (
                <div 
                  className="drawing-preview-box"
                  style={{
                    left: `${Math.min(drawStart.x, drawEnd.x)}%`,
                    top: `${Math.min(drawStart.y, drawEnd.y)}%`,
                    width: `${Math.abs(drawStart.x - drawEnd.x)}%`,
                    height: `${Math.abs(drawStart.y - drawEnd.y)}%`
                  }}
                />
              )}

              {/* 正在录入批注文本的弹窗浮层 */}
              {editingPin && (
                <div 
                  className="annotation-pin-popup"
                  style={{ 
                    left: `${editingPin.x}%`, 
                    top: `${editingPin.y}%`,
                    transform: editingPin.x > 70 ? 'translate(-105%, -50%)' : 'translate(10px, -50%)'
                  }}
                >
                  <div className="popup-arrow" />
                  <h5 className="popup-title">
                    {editingPin.isBox ? '新建方框批注' : '新建图标批注'}
                  </h5>
                  <textarea
                    className="popup-textarea"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="请输入对该区域的批注说明（如：字迹模糊、接缝拼接偏差）..."
                    autoFocus
                  />
                  <div className="popup-actions">
                    <button className="popup-btn cancel" onClick={() => setEditingPin(null)}>取消</button>
                    <button className="popup-btn save" onClick={handleSaveAnnotation}>保存</button>
                  </div>
                </div>
              )}

              {/* 滑动控制柄 */}
              <div 
                className="slider-handle"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="handle-line"></div>
                <div className="handle-circle">
                  <ChevronLeft size={12} />
                  <ChevronRight size={12} />
                </div>
              </div>

              {/* 滑动标签指示 */}
              <span className="slider-label left-label">低清原图</span>
              <span className="slider-label right-label">高清重构</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HDVerification;

