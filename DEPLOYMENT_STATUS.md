# Ancient Chinese Texts Project - 远程部署状态报告 (Deployment Status Report)

本页记录了目前已完成的远程部署工作、服务状态、面临的限制以及后续调试路径，以便您随时接手和查看。

---

## 📋 1. 目前已完成的工作 (Work Accomplished)

### 📂 代码及编译环境同步
*   **代码同步**：已将本地工作区所有代码完整同步至远程服务器 `ruanxh-bbd5` 的 `/mnt/ruanxh/Ancient Chinese Texts Project` 路径下。
*   **Vite Linux 原生依赖修复**：重新执行了纯净依赖安装，并强制补全了 Linux x86_64 平台所需的 `@rolldown/binding-linux-x64-gnu` 原生编译器二进制，使 Vite 前端能直接在 Linux 容器内编译启动。

### 🗄️ 数据库及运行环境依赖
*   **MongoDB 部署**：在远程环境中成功安装并运行了 `mongodb` 数据库服务（本地监听 127.0.0.1:27017）。
*   **Redis 部署**：在远程环境中成功安装并运行了 `redis-server` 缓存服务（监听 6379 端口）。

### 🚀 后端与前端进程启动 (运行于后台守护进程)
*   **后端 API 服务**：
    *   **运行命令**：`nohup /root/miniconda3/envs/python39/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &`
    *   **当前状态**：运行中 (LISTEN 8000 端口)。通过本地接口请求测试成功返回 `200 OK`。
*   **前端 Vite 服务**：
    *   **运行命令**：`nohup /mnt/ruanxh/node/bin/npm run dev -- --host 0.0.0.0 --port 5175 > /tmp/frontend.log 2>&1 &`
    *   **当前状态**：运行中 (LISTEN 5175 端口)。通过本地接口请求测试成功返回 `200 OK`。

---

## 🌐 2. cpolar 公网穿透及配置 (cpolar Tunnels Configuration)

为了避开中国注册账号在 `us` 地区产生的 `Authentication failed` 验证问题，我们已将穿透配置切回默认的 `cn` 地区。

*   **远程配置文件路径**：`/usr/local/etc/cpolar/cpolar.yml`
*   **远程 cpolar 启动命令**：
    ```bash
    nohup /usr/local/bin/cpolar start ssh website frontend backend -config=/usr/local/etc/cpolar/cpolar.yml > /tmp/cpolar.log 2>&1 &
    ```

### 🔗 当前分配的远程临时公网映射地址：

| 服务名称 | 容器内绑定地址 | 当前临时公网 URL (HTTP) | 当前临时公网 URL (HTTPS) |
| :--- | :--- | :--- | :--- |
| **前端服务 (frontend)** | `localhost:5175` | `http://165e323d.r23.cpolar.top` | `https://165e323d.r23.cpolar.top` |
| **后端 API (backend)** | `localhost:8000` | `http://70a078a0.r23.cpolar.top` | `https://70a078a0.r23.cpolar.top` |
| **SSH 映射 (ssh)** | `localhost:22` | `tcp://6.tcp.vip.cpolar.cn:12729` | — |

---

## ⚠️ 3. 为什么外部暂时返回 404 (Current Obstacles & Limits)

尽管远程端口 `5175` 和 `8000` 在容器内部访问全绿（`200 OK`），且 cpolar 客户端启动成功，但使用这些分配 of the 公网 URL 在浏览器打开时仍可能提示 **"404 Domain doesn't exist"**，原因如下：

1.  **子域名预留冲突**：
    您在 cpolar 官方控制台上已为本地 Windows 主机预留并平面化绑定了二级域名 `http://ancient-texts.cpolar.top`（绑定到了本地的 `5175` 端口，且当前本地 cpolar 仍在后台运行中）。
2.  **账号并发通道数超限**：
    当本地和远程同时运行 cpolar 并试图建立相同的端口或二级域名穿透时，cpolar 服务器会因 VIP 套餐的通道并发数限制或域名占用冲突，导致远程的临时通道虽然显示“启动成功”，但数据包无法被正确路由，从而返回 404 错误。

---

## 🛠️ 4. 后学建议方案 (Next Steps / How to fix)

如果您需要将服务完全迁移至远程服务器，请按以下步骤操作：

1.  **关闭本地 Windows 上的 cpolar 进程**（释放域名占用和连接数）：
    *   在本地 PowerShell 中运行：
        ```powershell
        Stop-Process -Name cpolar -Force
        ```
2.  **修改远程配置以复用保留域名**：
    编辑远程 `/usr/local/etc/cpolar/cpolar.yml` 文件，为您需要稳定映射的服务加上 `subdomain: ancient-texts` 等配置，然后重启远程 cpolar。
