# 中华古籍智慧化服务平台 (Ancient Chinese Texts Smart Platform)

## 简介
本项目是一个专注于中国古代典籍数字化与智能化研究的现代全栈（Full-stack）应用程序。它旨在为国学爱好者、历史研究人员及社会公众提供一个包含古籍检索、高清阅读、AI辅助研究等功能的综合性服务平台。项目由高保真的国风 React 前端与基于 FastAPI 构建的高性能 AI 后端协同驱动。

## 目的
我们致力于为社会公众提供开放共享、全面多元的古籍资源，并通过科技赋能（如人工智能大模型、OCR识别、知识图谱等），降低古籍阅读与研究的门槛，提供便捷高效的知识服务，推动中国传统文化的传承与普及。

## 技术栈

### 前端 (Frontend)
- **核心框架**: React 18
- **构建工具**: Vite
- **开发语言**: TypeScript
- **路由管理**: React Router v6
- **样式方案**: 纯 CSS3 (CSS Variables + CSS Modules/Global CSS)

### 后端 (Backend)
- **核心框架**: FastAPI
- **开发语言**: Python 3.11+
- **数据库架构**: MongoDB (持久化核心数据) + Redis (高速缓存与验证码频控)
- **ORM & 驱动**: Beanie + Motor (异步高并发支持)
- **数据校验**: Pydantic v2
- **安全鉴权**: JWT (JSON Web Tokens) + passlib (bcrypt加密)
- **环境管理**: Conda

## 兼容性
本项目前端采用现代 Web 技术标准构建，兼容以下主流现代浏览器：Google Chrome, Microsoft Edge, Safari, Firefox。由于使用了较新的 CSS 属性，不建议在极低版本浏览器（如 IE）上运行。

---

## 各模块使用说明 (Module Usage Guides)

### 首页 (Home)
提供系统的整体介绍与入口，展示平台的各项核心功能及数据统计概览。点击上方导航栏可快速跳转到对应功能区。

### 全文数据 (Full Text Data)
*(内容正在建设中)*

### 高清化模型 (HD Models)
*(内容正在建设中)*

### 古籍 OCR 识别 (OCR)
*(内容正在建设中)*

### 知识图谱 (Knowledge Graph)
- **功能概述**：将零散的随笔通过 AI 自动分析提取标签，并以 D3.js 物理力导向图呈现出动态星空般的知识网络。
- **使用方法**：
  1. 在“个人中心”或“AI 助手”模块中撰写并保存您的阅读“随笔（Note）”。
  2. 系统后端会静默调用 DeepSeek 大语言模型，自动为该段随笔提取 1~4 个相关的中文核心标签（如“唐代”、“文学”等）。
  3. 点击导航栏进入“知识图谱”页面，您可以俯瞰笔记与标签之间的连接全景。支持鼠标拖拽节点、滚轮无极缩放，以及点击任意节点触发“黑灯聚焦模式”（暗化无关节点，凸显知识脉络）。

### 社区 (Community)
*(内容正在建设中)*

### AI 助手 (AI Assistant)
- **功能概述**：基于古籍大模型的对话界面。
- **使用方法**：
  1. 在左侧聊天区域输入与古籍相关的提问（如“请帮我翻译某段文言文”）。
  2. 点击右上角的设置图标可唤出“自动翻译”等快捷操作。
  3. 右侧为联动的“随笔（Notebook）”功能。您在与 AI 对话时产生的灵感，可随时记录在右侧，系统将自动进行云端保存，支持 Markdown 格式。

### 法律条文 (Laws)
- **功能概述**：支持按中国法律特有的“编、章、节、条、款、项、目”七级标准进行全文解析、展示与导出的模块。
- **使用方法**：
  1. **导入**：点击左侧“导入 TXT 文件”按钮，上传带有标准中文序号（如“第一编”、“（一）”、“1.”等）的纯文本文档，系统会自动在后台正则切分，并渲染出高度结构化的阅读排版。
  2. **阅读与搜索**：左侧提供所有条文目录列表以及搜索框，右侧为主阅读区，不同层级的条款会有专门的缩进和加粗展示。
  3. **编辑**：点击右侧上方的“编辑”按钮，您可以对纯文本进行全量修改，保存时系统将实时重新切分层级结构。
  4. **导出**：点击“导出 PDF”，可直接将优美的排版打印为矢量化的、文字可选的高清 PDF 电子档。

### 使用帮助 (Help)
- **功能概述**：系统内置的图文并茂的使用指引与说明文档。
- **使用方法**：
  - 页面左侧提供现代化的可折叠多级竖版目录树。
  - 单击左侧对应的子菜单，右侧宽阔的阅读面板会瞬间无刷新加载出该模块的具体图文使用教程，帮助新手快速掌握平台操作。

### 个人中心与收藏 (Personal Center)
- **功能概述**：管理您的账户信息、阅读历史和自定义功能。
- **使用方法**：
  - 点击右上角的头像/用户名进入。若未登录，会引导进入多模式登录页面（支持密码/邮箱验证码登录）。
  - 在个人中心内，您可以查看自己绑定的个人信息、邮箱，并可以管理“我的词条库”、“我的技能库”和“我的随笔记录”。

---

## 快速开始 (Quick Start)

本项目采用前后端同仓（Monorepo）结构，请分别启动前端与后端服务。

### 1. 克隆项目到本地
```bash
git clone <repository-url>
cd "Ancient Chinese Texts Project"
```

### 2. 后端启动步骤 (Backend)
强烈推荐使用 **Conda** 和 **Python 3.11.x**。

```bash
# 1. 在项目根目录的 venv 文件夹中创建局部 conda 环境，并指定 Python 3.11.9
conda create -y --prefix "C:\Users\Asus\Desktop\Ancient Chinese Texts Project\venv" python=3.11.9

# 2. 安装后端依赖清单
conda run --no-capture-output -p "C:\Users\Asus\Desktop\Ancient Chinese Texts Project\venv" pip install -r backend/requirements.txt

# 3. 配置数据库与启动 (环境需预装 MongoDB 与 Redis)
# 请确保 backend/.env 文件中的 MONGODB_URL 和 REDIS_URL 配置正确
conda run --no-capture-output -p "C:\Users\Asus\Desktop\Ancient Chinese Texts Project\venv" --cwd backend uvicorn main:app --reload --port 8000
```
> [!TIP]
> 启动成功后，浏览器访问 [http://localhost:8000/docs](http://localhost:8000/docs) 即可查看和测试由 FastAPI 自动生成的交互式 API 接口文档。

### 3. 前端启动步骤 (Frontend)
请确保您的电脑已安装 Node.js (v18+)。打开一个**新的终端窗口**，确保位于项目根目录 `Ancient Chinese Texts Project` 下。

```bash
# 1. 安装前端依赖
npm install

# 2. 启动前端开发服务器
npm run dev
```
前端启动后，默认可通过 [http://localhost:5175](http://localhost:5175) 访问应用首页。

---

## 贡献指南
我们欢迎并感谢任何形式的外部贡献！
1. 请先在 Issue 中描述您发现的 Bug 或希望添加的新功能。
2. Fork 本仓库，并在您的分支上进行开发。
3. 提交 Pull Request (PR)，并在描述中关联对应的 Issue。

## 维护者
- **Antigravity** (核心开发者 / 架构与全栈实现)
- *以及古籍研究团队的业务专家*

## 版本历史
- **v1.4.0**：重磅推出“知识图谱”交互模块（集成 DeepSeek AI 自动提取笔记标签及 D3.js 力导向图动态渲染），并上线全新“使用帮助”竖版文档模块。
- **v1.3.0**：新增完整的“法律条文”智能解析、展示、PDF导出功能；彻底迁移底层数据库为 MongoDB (Beanie)。
- **v1.2.0**：全面打通 JWT 用户注册与登录鉴权全栈流程，修复若干并发问题。
- **v1.1.0**：搭建 Python FastAPI 后端基础架构，配置 Conda 虚拟环境、SQLAlchemy 实体模型及 Pydantic 校验。
- **v1.0.0**：完成平台前端基础架构搭建，实现首页、多模式注册登录、AI古籍助手及个人中心界面，确立全局国风UI规范。

## 许可证
本项目目前未选择任何开源许可证（**None**）。即保留所有权利（All Rights Reserved）。未经作者明确书面允许，不得擅自复制、修改、分发或用于商业用途。
