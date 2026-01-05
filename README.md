# ETH Buy The Dip - Monitor 📉

这是一个基于 **Murphychen888 抄底策略** 的全自动以太坊监控看板。它旨在帮助投资者通过数据量化的方式，识别 ETH 的底部区间。

🔗 **Online Deployment**: [eth-buy-the-dip-128j.vercel.app](https://eth-buy-the-dip-128j.vercel.app/)

## 核心策略 (The Strategy)

该策略综合了 4 个维度的指标，当满足其中 **2 个或以上** 条件时，视为有效的“抄底”信号：

1.  **情绪 (Emotion)**
    *   **指标**: LTH-NUPL (长期持有者净盈亏)
    *   **目标**: `< 0` (长期持有者投降/亏损)
    *   **实现**: 本项目使用 **Fear & Greed Index (恐慌贪婪指数)** 作为免费的高频实时代理。当指数 `< 20` (极度恐慌) 时，通常对应底部。

2.  **结构 (Structure)**
    *   **指标**: PSIP (盈利供应百分比)
    *   **目标**: `< 50%` (一半以上的筹码处于亏损状态)
    *   **实现**: 由于该链上数据昂贵，本项目采用 **手动录入/静态配置** 的方式。您可以在页面上直接点击该卡片进行修正。

3.  **成本 (Cost) - 核心指标**
    *   **指标**: 鲸鱼群体的链上换手成本 (Realized Price)
    *   **目标**: 现价 < 鲸鱼成本
    *   **实现**: **全自动实时监控**。系统每分钟抓取最新的 ETH 价格，并与三大鲸鱼群体 (1k-10k, 10k-100k, >100k) 的成本线进行对比。一旦跌破，立即亮起绿灯。

4.  **动能 (Momentum)**
    *   **指标**: 综合动能评分 (0-6 分)
    *   **目标**: 评分 < 1 表示市场进入防御阶段 (结构性转弱)。

## 功能特性

*   **⚡️ 实时自动化**: 价格和情绪指标全自动刷新，无需人工干预。
*   **✏️ 快速修正**: 对于低频更新的“结构”指标，支持并在仪表盘直接点击修改 (Local Edit)。
*   **📱 响应式设计**: 完美适配手机和桌面端，采用高级暗黑玻璃拟态风格 (Glassmorphism)。
*   **🛡 数据透明**: 明确标注每一个数据是來自 Live API、代理估算还是静态录入，拒绝黑盒。

## 本地运行 (Local Development)

1.  安装依赖:
    ```bash
    npm install
    ```
2.  启动开发服务器:
    ```bash
    npm run dev
    ```
3.  打开浏览器访问 `http://localhost:3000`。

## 部署 (Deployment)

本项目针对 **Vercel** 进行了优化。

1.  将代码推送到 GitHub。
2.  在 Vercel 导入项目。
3.  获得永久免费的 HTTPS 域名。

详细部署说明请参考 [DEPLOY.md](./DEPLOY.md)。

## 技术栈

*   **Framework**: Next.js 16 (App Router)
*   **Styling**: Tailwind CSS v4
*   **Language**: TypeScript
*   **Data**: Local JSON / Server Actions (No external DB required for basic usage)
