# 部署指南 (Deployment Guide) - Eth Buy The Dip

您的网站是基于 **Next.js** 构建的，部署到 **Vercel** 是最简单且免费的选择（Next.js 和 Vercel 是同一家公司）。

## ⚠️ 重要提示：关于数据持久化
目前项目使用 **本地 JSON 文件 (`src/data`)** 来存储数据。
*   **在本地运行**: 一切正常，Admin 面板可以修改并保存数据。
*   **部署到 Vercel**: 
    *   **读数据 (GET)**: 正常。页面会显示您上传时的默认数据和实时价格。
    *   **写数据 (Admin Update)**: **无法持久保存**。因为 Vercel 的运行环境（Serverless）是只读的。您在 Admin 面板的修改不会永久生效。
    *   **解决方案**: 在免费版通过 Vercel 部署时，建议通过 **修改代码并提交 (Git Push)** 来更新那些静态指标（PSIP/Momentum），Vercel 会自动重新部署。

---

## 方式一：使用 GitHub 自动部署 (推荐)

这是最标准、最稳定的方式。

1.  **推送到 GitHub**:
    *   在 GitHub 上创建一个新仓库 (如 `eth-buy-the-dip`)。
    *   在本地终端运行:
        ```bash
        git remote add origin https://github.com/您的用户名/eth-buy-the-dip.git
        git branch -M main
        git push -u origin main
        ```

2.  **在 Vercel 导入**:
    *   访问 [Vercel.com](https://vercel.com) 并注册/登录。
    *   点击 **"Add New..."** -> **"Project"**.
    *   选择 **"Import"** 您刚才创建的 GitHub 仓库。
    *   **Framework Preset** 保持默认为 `Next.js`。
    *   点击 **"Deploy"**。

3.  **完成**:
    *   Vercel 会自动构建并分配一个 `https://your-project.vercel.app` 的免费域名。
    *   以后每次您 `git push` 更新代码（或修改 `src/data/config.json`），网站都会自动更新。

---

## 方式二：使用 Vercel CLI 命令行部署

如果您不想用 GitHub，可以直接从命令行上传。

1.  **安装 Vercel CLI**:
    ```bash
    npm i -g vercel
    ```

2.  **登录**:
    ```bash
    vercel login
    ```

3.  **部署**:
    在项目根目录运行：
    ```bash
    vercel
    ```
    *   一路按回车确认默认设置即可。

4.  **生产环境部署**:
    ```bash
    vercel --prod
    ```

---

## 常见问题

**Q: 我真的很需要 Admin 面板在线上也能用，怎么办？**
A: 您需要接入一个真正的数据库（如 **Vercel KV (Redis)** 或 **Vercel Postgres**）。
*   这两者在 Vercel 都有一定的免费额度。
*   如果您需要，我可以帮您修改代码以适配 Vercel KV。
