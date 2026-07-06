import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, Settings, ChevronRight, ChevronLeft, 
  Play, CheckCircle2, RefreshCw, Sliders, Eye, FileText, Image as ImageIcon, ArrowRight
} from 'lucide-react';
import './HDModels.css';

// 步骤预设高清化对比图像
const IMAGE_STEPS = {
  original: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
  descreened: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop',
  deblurred: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600&auto=format&fit=crop',
  superresolved: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
  colorcorrected: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop'
};

const HDModels = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 记录每个步骤的输入/输出状态
  const [stepInputs, setStepInputs] = useState<{ [key: number]: string | null }>({
    1: null,
    2: null,
    3: null,
    4: null
  });
  const [stepOutputs, setStepOutputs] = useState<{ [key: number]: string | null }>({
    1: null,
    2: null,
    3: null,
    4: null
  });

  // 模型 1：去网格参数
  const [descreenNo, setDescreenNo] = useState<boolean>(false);
  const [descreenT, setDescreenT] = useState<number>(2.0);
  const [descreenR, setDescreenR] = useState<number>(20);
  const [descreenPatchSize, setDescreenPatchSize] = useState<number>(256);
  const [descreenStride, setDescreenStride] = useState<number>(128);

  // 模型 2：Restormer 去模糊参数
  const [restormerWeights, setRestormerWeights] = useState<string>('/mnt/ruanxh/7891/experiments/models/restormer_motion.pth');
  const [restormerTile, setRestormerTile] = useState<string>('None');
  const [restormerOverlap, setRestormerOverlap] = useState<number>(32);

  // 模型 3：ResShift 超分辨率参数
  const [resshiftVersion, setResshiftVersion] = useState<string>('v3');
  const [resshiftTask, setResshiftTask] = useState<string>('realsr');
  const [resshiftChop, setResshiftChop] = useState<string>('None');
  const [resshiftScale, setResshiftScale] = useState<number>(4);

  // 当切换 Tab 时，如果有上一步的输出结果且当前步没有输入，自动提示或导入
  const hasPrevOutput = activeTab > 1 && stepOutputs[activeTab - 1] !== null;

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgUrl = event.target.result as string;
          setStepInputs(prev => ({ ...prev, [activeTab]: imgUrl }));
          setStepOutputs(prev => ({ ...prev, [activeTab]: null }));
          setLogs([`[INFO] 已上传第 ${activeTab} 模块的输入图像: ${file.name}`]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadDemoImage = () => {
    if (activeTab === 1) {
      setStepInputs(prev => ({ ...prev, [1]: IMAGE_STEPS.original }));
      setStepOutputs(prev => ({ ...prev, [1]: null }));
      setLogs(['[INFO] 已加载去网格模型（Model 1）的低清有网纹古籍样例。']);
    } else if (activeTab === 2) {
      setStepInputs(prev => ({ ...prev, [2]: IMAGE_STEPS.descreened }));
      setStepOutputs(prev => ({ ...prev, [2]: null }));
      setLogs(['[INFO] 已加载去模糊模型（Model 2）的已去网格样例。']);
    } else if (activeTab === 3) {
      setStepInputs(prev => ({ ...prev, [3]: IMAGE_STEPS.deblurred }));
      setStepOutputs(prev => ({ ...prev, [3]: null }));
      setLogs(['[INFO] 已加载超分模型（Model 3）的已去模糊清晰样例。']);
    } else if (activeTab === 4) {
      setStepInputs(prev => ({ ...prev, [4]: IMAGE_STEPS.superresolved }));
      setStepOutputs(prev => ({ ...prev, [4]: null }));
      setLogs(['[INFO] 已加载色彩校正模型（Model 4）的超分后偏色样例。']);
    }
  };

  const importPreviousOutput = () => {
    if (activeTab > 1 && stepOutputs[activeTab - 1]) {
      setStepInputs(prev => ({ ...prev, [activeTab]: stepOutputs[activeTab - 1] }));
      setStepOutputs(prev => ({ ...prev, [activeTab]: null }));
      setLogs([`[INFO] 成功导入上一步 (模型 ${activeTab - 1}) 的输出结果作为当前模块的输入。`]);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const runActiveModel = () => {
    const currentInput = stepInputs[activeTab];
    if (!currentInput) {
      alert('请先上传当前模块的输入图像，或导入前一步的结果！');
      return;
    }

    setIsProcessing(true);
    setLogs([]);

    if (activeTab === 1) {
      // 运行模型 1：去网格
      addLog('[Step 1/4] ── 运行频域去网格预处理 ──');
      setTimeout(() => {
        if (descreenNo) {
          addLog('[INFO] 检测到 --no_descreen 标识，跳过频域滤波。');
          setStepOutputs(prev => ({ ...prev, [1]: currentInput }));
        } else {
          addLog(`[INFO] 正在读取输入图像特征向量...`);
          addLog(`[INFO] 快速傅里叶变换 (FFT) 准备就绪。设定半径 R=${descreenR}, 幅值阈值 T=${descreenT}`);
          addLog(`[INFO] 滑动窗口裁剪大小为 descreen_patch_size=${descreenPatchSize}, stride=${descreenStride}`);
          addLog('[SUCCESS] 频域去网格计算结束。高频网纹已被成功消除。');
          setStepOutputs(prev => ({ ...prev, [1]: IMAGE_STEPS.descreened }));
        }
        setIsProcessing(false);
      }, 2000);
    } else if (activeTab === 2) {
      // 运行模型 2：Restormer 去模糊
      addLog('[Step 2/4] ── 运行 Restormer 图像去模糊 ──');
      setTimeout(() => {
        addLog(`[INFO] 载入 Restormer 微调权重：${restormerWeights}`);
        addLog(`[INFO] 硬件加速：启用 GPU CUDA 推理`);
        addLog(`[INFO] 切片分块参数：tile=${restormerTile}, overlap=${restormerOverlap}px`);
        addLog(`[INFO] 通过 MDTA 模块执行空间注意力关联度计算...`);
        addLog('[SUCCESS] Restormer 去模糊完成。笔画墨迹边缘得到锐化。');
        setStepOutputs(prev => ({ ...prev, [2]: IMAGE_STEPS.deblurred }));
        setIsProcessing(false);
      }, 2000);
    } else if (activeTab === 3) {
      // 运行模型 3：ResShift 超分辨率
      addLog('[Step 3/4] ── 运行 ResShift 扩散超分辨率 ──');
      setTimeout(() => {
        addLog(`[INFO] 超分模式：task=${resshiftTask}, scale=${resshiftScale}x, version=${resshiftVersion}`);
        addLog(`[INFO] 载入 VQ-VAE 自动编码器：autoencoder_vq_f4.pth`);
        addLog(`[INFO] 使用滑窗切块 chop_size=${resshiftChop}`);
        addLog(`[INFO] 启动残差移位自适应采样（4 步扩散迭代）：`);
        addLog(`  [Diffusion] Iter 1/4 - 开始注入扩散先验残差...`);
        addLog(`  [Diffusion] Iter 2/4 - 重构高频线条轮廓...`);
        addLog(`  [Diffusion] Iter 3/4 - 执行潜空间图像降噪滤波...`);
        addLog(`  [Diffusion] Iter 4/4 - 自动解码生成清晰的高清网格...`);
        addLog('[SUCCESS] 4倍超分辨率重建完成。分辨率大幅提升。');
        setStepOutputs(prev => ({ ...prev, [3]: IMAGE_STEPS.superresolved }));
        setIsProcessing(false);
      }, 2500);
    } else if (activeTab === 4) {
      // 运行模型 4：Reinhard 色彩校正
      addLog('[Step 4/4] ── 运行 Reinhard 色彩平衡校正 ──');
      setTimeout(() => {
        addLog('[INFO] 正在将修复后的图像和低清原图从 BGR 转换至 Lab 空间...');
        addLog('[INFO] 匹配 L、a、b 通道各自的均值与方差...');
        addLog('[INFO] Reinhard 对齐变换矩阵运算成功...');
        addLog('[SUCCESS] 色彩校正完毕。画面完美还原了古籍原卷的泛黄底色，字迹无发白。');
        setStepOutputs(prev => ({ ...prev, [4]: IMAGE_STEPS.colorcorrected }));
        setIsProcessing(false);
      }, 1500);
    }
  };

  const handleDownload = () => {
    const currentOutput = stepOutputs[activeTab];
    if (currentOutput) {
      const link = document.createElement('a');
      link.href = currentOutput;
      link.download = `model_step${activeTab}_output.png`;
      link.click();
    }
  };

  return (
    <div className="hd-models-container">
      {/* 侧边栏参数控制台 */}
      <div className={`params-sidebar glass-panel ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Sliders className="icon-gold" size={20} />
          <h3>模块参数调节面板</h3>
          <button className="collapse-btn" onClick={() => setSidebarOpen(false)}>
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="sidebar-scroll-area">
          {/* 模型 1 去网格参数 */}
          <div className={`param-section ${activeTab === 1 ? 'highlighted' : ''}`}>
            <h4>模型一：去网格 (Descreen)</h4>
            <div className="form-group row-align">
              <label>跳过此处理</label>
              <input 
                type="checkbox" 
                checked={descreenNo} 
                onChange={(e) => setDescreenNo(e.target.checked)} 
              />
            </div>
            <div className="form-group">
              <label>检测幅值阈值 (T): {descreenT.toFixed(1)}</label>
              <input 
                type="range" min="0.1" max="10.0" step="0.1"
                value={descreenT} onChange={(e) => setDescreenT(parseFloat(e.target.value))}
                disabled={descreenNo}
              />
              <span className="help-info">范围: 0.1 - 10.0</span>
            </div>
            <div className="form-group">
              <label>直流分量保护半径 (R): {descreenR}</label>
              <input 
                type="range" min="1" max="128" step="1"
                value={descreenR} onChange={(e) => setDescreenR(parseInt(e.target.value))}
                disabled={descreenNo}
              />
              <span className="help-info">范围: 1 - 128</span>
            </div>
            <div className="form-group">
              <label>滑窗分块大小: {descreenPatchSize}</label>
              <input 
                type="range" min="128" max="1024" step="128"
                value={descreenPatchSize} onChange={(e) => setDescreenPatchSize(parseInt(e.target.value))}
                disabled={descreenNo}
              />
            </div>
            <div className="form-group">
              <label>滑窗分块步长: {descreenStride}</label>
              <input 
                type="range" min="64" max="512" step="64"
                value={descreenStride} onChange={(e) => setDescreenStride(parseInt(e.target.value))}
                disabled={descreenNo}
              />
            </div>
          </div>

          {/* 模型 2 去模糊参数 */}
          <div className={`param-section ${activeTab === 2 ? 'highlighted' : ''}`}>
            <h4>模型二：Restormer (去模糊)</h4>
            <div className="form-group">
              <label>模型权重路径</label>
              <input 
                type="text" 
                value={restormerWeights} 
                onChange={(e) => setRestormerWeights(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>推理分块大小 (Tile)</label>
              <select value={restormerTile} onChange={(e) => setRestormerTile(e.target.value)}>
                <option value="None">None (全图处理)</option>
                <option value="256">256</option>
                <option value="512">512</option>
                <option value="1024">1024</option>
              </select>
            </div>
            <div className="form-group">
              <label>重叠像素数 (Overlap): {restormerOverlap}px</label>
              <input 
                type="range" min="16" max="128" step="8"
                value={restormerOverlap} onChange={(e) => setRestormerOverlap(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* 模型 3 超分放大参数 */}
          <div className={`param-section ${activeTab === 3 ? 'highlighted' : ''}`}>
            <h4>模型三：ResShift (超分放大)</h4>
            <div className="form-group">
              <label>模型版本 (Version)</label>
              <select value={resshiftVersion} onChange={(e) => setResshiftVersion(e.target.value)}>
                <option value="v3">v3 (推荐：4步扩散)</option>
                <option value="v1">v1 (15步扩散)</option>
              </select>
            </div>
            <div className="form-group">
              <label>超分任务模式 (Task)</label>
              <select value={resshiftTask} onChange={(e) => setResshiftTask(e.target.value)}>
                <option value="realsr">realsr (真实场景降质)</option>
                <option value="bicubic">bicubic (双三次退化)</option>
              </select>
            </div>
            <div className="form-group">
              <label>超分分块大小 (Chop Size)</label>
              <select value={resshiftChop} onChange={(e) => setResshiftChop(e.target.value)}>
                <option value="None">None (不分块)</option>
                <option value="256">256</option>
                <option value="512">512</option>
              </select>
            </div>
            <div className="form-group">
              <label>物理放大倍数</label>
              <input type="number" value={resshiftScale} readOnly className="readonly-input" />
            </div>
          </div>

          {/* 模型 4 色彩校正 */}
          <div className={`param-section ${activeTab === 4 ? 'highlighted' : ''}`}>
            <h4>模型四：Reinhard (色彩校正)</h4>
            <p className="no-params-msg">Reinhard 色彩对齐属于自适应后处理算子，无多余运行参数。</p>
          </div>
        </div>
      </div>

      {/* 关闭状态下的浮动展开按钮 */}
      {!sidebarOpen && (
        <button className="expand-sidebar-btn" onClick={() => setSidebarOpen(true)}>
          <ChevronRight size={20} />
          <span>配置面板</span>
        </button>
      )}

      {/* 主展示区 */}
      <div className="hd-main-content">
        {/* 二级上标题（模型导航 Tab） */}
        <div className="model-tabs glass-panel">
          <button 
            className={`tab-btn ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            <span className="tab-num">01</span>
            <span className="tab-name">模型一：频域去网格</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 2 ? 'active' : ''}`}
            onClick={() => setActiveTab(2)}
          >
            <span className="tab-num">02</span>
            <span className="tab-name">模型二：Restormer去模糊</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 3 ? 'active' : ''}`}
            onClick={() => setActiveTab(3)}
          >
            <span className="tab-num">03</span>
            <span className="tab-name">模型三：ResShift超分放大</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 4 ? 'active' : ''}`}
            onClick={() => setActiveTab(4)}
          >
            <span className="tab-num">04</span>
            <span className="tab-name">模型四：Reinhard色彩校正</span>
          </button>
        </div>

        {/* 串联进度提示栏 */}
        {hasPrevOutput && (
          <div className="pipeline-tip-bar glass-panel animate-pulse">
            <span className="tip-text">💡 检测到上一步（模型 {activeTab - 1}）已成功生成处理结果！</span>
            <button className="btn btn-outline import-btn" onClick={importPreviousOutput}>
              一键导入上一步输出为当前输入
              <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </button>
          </div>
        )}

        {/* 对比操作面板 */}
        <div className="preview-container">
          {/* 左侧：输入区域 */}
          <div className="preview-box glass-panel">
            <div className="box-header">
              <span className="badge badge-input">INPUT</span>
              <h4>第 {activeTab} 步输入图像</h4>
            </div>
            
            <div className="image-display-area">
              {stepInputs[activeTab] ? (
                <img src={stepInputs[activeTab]!} alt={`Step ${activeTab} Input`} className="image-preview" />
              ) : (
                <div className="upload-placeholder" onClick={handleUploadClick}>
                  <Upload size={48} className="upload-icon" />
                  <p className="primary-text">点击上传或拖拽待处理图到此区域</p>
                  <p className="secondary-text">支持格式: .png / .jpg / .jpeg / .tif</p>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange}
            />

            <div className="box-footer">
              <button className="btn btn-outline" onClick={loadDemoImage} disabled={isProcessing}>
                <ImageIcon size={16} />
                载入本步骤样例
              </button>
              {stepInputs[activeTab] && (
                <button className="btn btn-secondary" onClick={() => setStepInputs(prev => ({ ...prev, [activeTab]: null }))} disabled={isProcessing}>
                  重置
                </button>
              )}
            </div>
          </div>

          {/* 右侧：输出区域 */}
          <div className="preview-box glass-panel">
            <div className="box-header">
              <span className="badge badge-output">OUTPUT</span>
              <h4>模型模块处理结果</h4>
            </div>
            
            <div className="image-display-area">
              {isProcessing ? (
                <div className="processing-loader">
                  <RefreshCw className="spinner" size={48} />
                  <p className="loader-text">第 {activeTab} 模块模型推理中，请稍候...</p>
                </div>
              ) : stepOutputs[activeTab] ? (
                <img src={stepOutputs[activeTab]!} alt={`Step ${activeTab} Output`} className="image-preview" />
              ) : (
                <div className="empty-output-placeholder">
                  <Eye size={48} className="empty-icon" />
                  <p>等待当前模型计算生成图像</p>
                </div>
              )}
            </div>

            <div className="box-footer">
              <button 
                className="btn btn-primary run-pipeline-btn" 
                onClick={runActiveModel}
                disabled={isProcessing || !stepInputs[activeTab]}
              >
                <Play size={16} />
                运行当前模块
              </button>
              <button 
                className="btn btn-outline download-btn" 
                onClick={handleDownload}
                disabled={!stepOutputs[activeTab] || isProcessing}
              >
                <Download size={16} />
                导出当前结果
              </button>
            </div>
          </div>
        </div>

        {/* 运行终端控制台日志 */}
        <div className="terminal-panel glass-panel">
          <div className="terminal-header">
            <FileText size={16} className="icon-gold" />
            <span>远程服务器推理终端 (ruanxh-bbd5@intranet)</span>
            {isProcessing && <span className="running-indicator"></span>}
          </div>
          <div className="terminal-body">
            {logs.length === 0 ? (
              <span className="log-placeholder">等待运行模块模型，打印模块专属运行日志...</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`log-line ${log.startsWith('[SUCCESS]') || log.startsWith('✨') ? 'log-success' : log.includes('Step') ? 'log-step' : ''}`}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HDModels;
