import React, { useState, useRef } from 'react';
import { Upload, FileImage, FileText, Copy, Check, Play, RefreshCw, Download } from 'lucide-react';
import './OCR.css';

const OCR = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // 清空上一次的识别结果
      setOcrResult('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setOcrResult('');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 模拟 OCR 识别过程
  const handleStartOcr = () => {
    if (!imagePreview) {
      alert('请先上传古籍图片！');
      return;
    }
    setIsProcessing(true);
    setOcrResult('');

    setTimeout(() => {
      setIsProcessing(false);
      // 模拟一些高保真古籍识别结果
      const mockResults = [
        "妙法莲华经方便品第二\n\n尔时世尊。从三昧安详而起。告舍利弗。诸佛智慧。甚深无量。其智慧门。难解难入。一切声闻。辟支佛。所不能知。所以者何。佛曾亲近百千万亿无数诸佛。尽行诸佛无量道法。勇猛精进。名称普闻。成就甚深未曾有法。随宜所说。意趣难解。",
        "大乘入楞伽经卷第一\n\n如是我闻。一时薄伽梵。在南海滨楞伽山顶。与大比丘众及大菩萨摩诃萨俱。其山众宝所成。种种严饰。光明晃曜。如百千日。青莲华池。香气芬馥。妙花宝树。摇曳清风。",
        "敦煌秘笈遗书。岁在庚戌。\n\n维摩诘所说经卷上。方便品第二。尔时维摩诘。自念寝疾。在于床枕。世尊大慈。必当哀愍。念我今者。大众云集。佛当说法。"
      ];
      // 随机选一个作为识别结果
      const randomIdx = Math.floor(Math.random() * mockResults.length);
      setOcrResult(mockResults[randomIdx]);
    }, 2000);
  };

  const handleCopy = () => {
    if (!ocrResult) return;
    navigator.clipboard.writeText(ocrResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!ocrResult) return;
    const element = document.createElement("a");
    const file = new Blob([ocrResult], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "古籍OCR识别结果.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setOcrResult('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="ocr-container">
      {/* 1. 左边栏：上传与配置 */}
      <div className="ocr-sidebar glass-panel">
        <div className="panel-title">
          <Upload className="icon-gold" size={18} />
          <h3>古籍上传与模型配置</h3>
        </div>

        <div className="ocr-sidebar-content">
          {/* 上传控制按钮 */}
          <div className="form-group">
            <label className="form-label">上传古籍影印件</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*"
              style={{ display: 'none' }} 
            />
            <button className="btn btn-outline upload-trigger-btn" onClick={triggerFileInput}>
              <FileImage size={16} />
              选择本地图片
            </button>
            <span className="form-tip">支持 JPG、PNG、BMP 等格式影印图像</span>
          </div>

          {/* 模型选择 - 暂时不要填入具体选项 */}
          <div className="form-group">
            <label className="form-label">选择识别模型</label>
            <select className="model-select-dropdown" defaultValue="" disabled>
              <option value="" disabled>-- (暂无可用模型) --</option>
            </select>
            <span className="form-tip warning-tip">模型模块暂时处于未配置状态</span>
          </div>

          {/* 操作按钮区 */}
          <div className="action-buttons-group">
            <button 
              className="btn btn-primary start-ocr-btn" 
              onClick={handleStartOcr}
              disabled={isProcessing || !imagePreview}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  识别中...
                </>
              ) : (
                <>
                  <Play size={16} />
                  开始 OCR 识别
                </>
              )}
            </button>
            
            {imagePreview && (
              <button className="btn btn-outline reset-btn" onClick={handleReset} disabled={isProcessing}>
                <RefreshCw size={16} />
                重置上传
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. 中间栏：图片预览显示 */}
      <div className="ocr-preview-panel glass-panel">
        <div className="panel-title">
          <FileImage className="icon-gold" size={18} />
          <h3>古籍影印本原件</h3>
        </div>

        <div 
          className={`image-display-area ${!imagePreview ? 'drop-active' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {imagePreview ? (
            <div className="preview-wrapper">
              <img src={imagePreview} alt="Ancient text upload preview" className="preview-img" />
            </div>
          ) : (
            <div className="empty-upload-placeholder" onClick={triggerFileInput}>
              <Upload size={40} className="placeholder-upload-icon" />
              <p className="placeholder-text">点击选择或拖拽古籍图片至此处</p>
              <span className="placeholder-subtext">建议上传分辨率较高、字迹清晰的扫描件或照片</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. 右边栏：识别结果显示 */}
      <div className="ocr-result-panel glass-panel">
        <div className="panel-title">
          <FileText className="icon-gold" size={18} />
          <h3>OCR 文本识别结果</h3>
        </div>

        <div className="result-display-area">
          {isProcessing ? (
            <div className="processing-placeholder">
              <div className="loading-spinner"></div>
              <p>古籍大模型文本行定位与切分中...</p>
              <span>正在提取并对齐文字字符，请稍候</span>
            </div>
          ) : ocrResult ? (
            <div className="result-content-wrapper">
              <pre className="ocr-text-result">{ocrResult}</pre>
              <div className="result-actions-footer">
                <button className="btn btn-outline" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check size={14} className="icon-green" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      复制文本
                    </>
                  )}
                </button>
                <button className="btn btn-outline" onClick={handleDownload}>
                  <Download size={14} />
                  导出为 TXT
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-result-placeholder">
              <FileText size={40} className="placeholder-result-icon" />
              <p>暂无识别结果</p>
              <span>请在左侧点击“开始 OCR 识别”提取文字</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCR;
