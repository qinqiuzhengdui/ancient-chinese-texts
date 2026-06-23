# 中华古籍智慧化服务平台 (Ancient Chinese Texts Smart Platform)

## 简介
本项目是一个专注于中国古代典籍数字化与智能化研究的现代全栈（Full-stack）应用程序。它旨在为国学爱好者、历史研究人员及社会公众提供一个包含古籍检索、高清阅读、AI辅助研究等功能的综合性服务平台。项目由高保真的国风 React 前端与基于 FastAPI 构建的高性能 AI 后端协同驱动。

## 目的
我们致力于为社会公众提供开放共享、全面多元的古籍资源，并通过科技赋能（如人工智能大模型、OCR识别、知识图谱等），降低古籍阅读与研究的门槛，提供便捷高效的知识服务，推动中国传统文化的传承与普及。

## 功能
- **全文检索与数据大盘**：支持海量古籍的快速检索，展示平台收录的千万级字数、篇章统计。
- **古籍大模型 AI 助手**：内置类 ChatGPT 的智能对话界面，支持基于古籍内容的提问解答。
- **智能辅助工具**：集成自动 OCR 识别、自动句读（断句标点）、自动古文翻译等一站式古籍研究工具。
- **Notebook 随笔系统**：与 AI 助手深度绑定，支持边检索边记录研究灵感，自动云端同步。
- **个人中心与收藏体系**：完善的多模式登录注册（手机、邮箱、密码），支持个人信息管理、古籍收藏、图片库及笔记管理。
- **极致的视觉体验**：全局采用“青瓷/竹绿”国风主题配色，结合现代化的毛玻璃（Glassmorphism）与微动效设计。

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
- **数据库架构**: MySQL (持久化核心数据) + Redis (高速缓存与频控)
- **ORM & 迁移**: SQLAlchemy + Alembic
- **数据校验**: Pydantic
- **安全鉴权**: JWT (JSON Web Tokens) + passlib (bcrypt加密)
- **环境管理**: Conda

## 兼容性
本项目前端采用现代 Web 技术标准构建，兼容以下主流现代浏览器：Google Chrome, Microsoft Edge, Safari, Firefox。由于使用了较新的 CSS 属性，不建议在极低版本浏览器（如 IE）上运行。

---

## 快速开始 (Quick Start)

本项目采用前后端同仓（Monorepo）结构，请分别启动前端与后端服务。

### 1. 克隆项目到本地
```bash
git clone <repository-url>
cd "Ancient Chinese Texts Project"
```

### 2. 后端启动步骤 (Backend)
强烈推荐使用 **Conda** 和 **Python 3.11.x** 以避免 C++ 底层库编译报错。

```bash
# 1. 在项目根目录的 venv 文件夹中创建局部 conda 环境，并指定 Python 3.11.9
conda create -y --prefix "C:\Users\Asus\Desktop\Ancient Chinese Texts Project\venv" python=3.11.9

# 2. 安装后端依赖清单 (无需激活环境，直接使用 conda run 执行)
conda run --no-capture-output -p "C:\Users\Asus\Desktop\Ancient Chinese Texts Project\venv" pip install -r backend/requirements.txt

# 3. 配置数据库与启动 (环境需预装 MySQL 与 Redis)
# 请确保 backend/.env 文件中的 MYSQL_URL 和 REDIS_URL 配置正确，并执行过 alembic upgrade head
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
前端启动后，默认可通过 [http://localhost:5173](http://localhost:5173) 访问应用首页。

---

## 示例
您可以启动前后端后，导航至前端的 `/ai-assistant` 页面，测试左侧聊天框输入古文片段，并体验右侧 Notebook 笔记联动的操作流程。

## 贡献指南
我们欢迎并感谢任何形式的外部贡献！
1. 请先在 Issue 中描述您发现的 Bug 或希望添加的新功能。
2. Fork 本仓库，并在您的分支上进行开发。
3. 提交 Pull Request (PR)，并在描述中关联对应的 Issue。

## 维护者
- **Antigravity** (核心开发者 / 架构与全栈实现)
- *以及古籍研究团队的业务专家*

## 版本历史
- **v1.2.0**：重构后端存储架构，正式引入 MySQL 作为持久化核心与 Redis 高速缓存，全面打通 JWT 用户注册与登录鉴权全栈流程。
- **v1.1.0**：搭建 Python FastAPI 后端基础架构，配置 Conda 虚拟环境、SQLAlchemy 实体模型及 Pydantic 校验。
- **v1.0.0**：完成平台前端基础架构搭建，实现首页、多模式注册登录、AI古籍助手及个人中心界面，确立全局国风UI规范。

## 许可证
本项目目前未选择任何开源许可证（**None**）。即保留所有权利（All Rights Reserved）。未经作者明确书面允许，不得擅自复制、修改、分发或用于商业用途。

## 致谢
感谢《项目计划书》提供者及相关开源工具的作者。特别感谢为古籍数字化做出贡献的开源语料库及大模型团队。

## 联系方式
- 邮箱: support@ancient-texts.example.com
- Github: [Ancient-Texts-Project Issues](#)
