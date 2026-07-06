import React, { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronLeft, ChevronRight, Sliders, Info, ThumbsUp, AlertCircle, Save } from 'lucide-react';
import './HDVerification.css';

// 示例古籍数据列表
interface BookPage {
  id: string;
  name: string;
  original: string;
  enhanced: string;
  psnr: number;
  ssim: number;
  ocrBefore: string;
  ocrAfter: string;
  status: 'pending' | 'passed' | 'failed';
  notes?: string;
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
    status: 'pending'
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
    status: 'passed',
    notes: '字迹清晰，色彩还原精准'
  },
  {
    id: 'p3',
    name: 'Pelliot chinois 4642 - 第 03 页',
    original: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600&auto=format&fit=crop',
    enhanced: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop',
    psnr: 29.84,
    ssim: 0.912,
    ocrBefore: '妙法... 莲华...',
    ocrAfter: '妙法莲华经方便品第二 鸠摩罗什译',
    status: 'failed',
    notes: '左上角仍有轻微网格噪声残留'
  }
];

const HDVerification = () => {
  const [pages, setPages] = useState<BookPage[]>(DEMO_PAGES);
  const [selectedPage, setSelectedPage] = useState<BookPage>(DEMO_PAGES[0]);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100 percentage
  const [reviewStatus, setReviewStatus] = useState<'passed' | 'failed'>('passed');
  const [notes, setNotes] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    setReviewStatus(selectedPage.status === 'failed' ? 'failed' : 'passed');
    setNotes(selectedPage.notes || '');
  }, [selectedPage]);

  // 处理对比滑动条拖拽
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSaveReview = () => {
    const updatedPages = pages.map(p => {
      if (p.id === selectedPage.id) {
        return {
          ...p,
          status: reviewStatus,
          notes: notes
        };
      }
      return p;
    });
    setPages(updatedPages);
    setSelectedPage({
      ...selectedPage,
      status: reviewStatus,
      notes: notes
    });
    alert('核对结论已成功保存！');
  };

  return (
    <div className="hd-verify-container">
      {/* 左侧：页面选择列表 */}
      <div className="verify-sidebar glass-panel">
        <div className="sidebar-title">
          <Sliders className="icon-gold" size={18} />
          <h3>待核对古籍卷册</h3>
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

          <div 
            className="slider-image-container" 
            ref={containerRef}
            onMouseDown={handleMouseDown}
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

        {/* 性能指标与核对结果录入 */}
        <div className="info-and-form-grid">
          {/* 性能指标与 OCR 核对 */}
          <div className="metrics-box glass-panel">
            <div className="card-title">
              <Info className="icon-gold" size={18} />
              <h4>高清重建性能指标</h4>
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
            </div>

            <div className="ocr-comparison-section">
              <h5>OCR 识别核对提升对比</h5>
              <div className="ocr-comp-grid">
                <div className="ocr-box ocr-before">
                  <span className="box-badge before-badge">修复前 OCR</span>
                  <p>{selectedPage.ocrBefore}</p>
                </div>
                <div className="ocr-box ocr-after">
                  <span className="box-badge after-badge">修复后 OCR</span>
                  <p>{selectedPage.ocrAfter}</p>
                </div>
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
      </div>
    </div>
  );
};

export default HDVerification;
