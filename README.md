**UtilityDashboard** is a "Mission Control" style dashboard for your local network. It provides a centralized interface to monitor your server hardware, media services, network traffic, and game servers.

Built with **Next.js**, **Tailwind CSS**, and **Framer Motion**, it features a "Fluent Design" aesthetic with glassmorphism, fluid animations, and a mobile-responsive layout.

---

## 🚀 Features

* **Mission Control (Home):** A "Bento Grid" overview of your entire system status, including weather, CPU load graphs, and a quick-launch dock.
* **NAS Telemetry:** Deep hardware inspection showing real-time CPU core usage, RAM distribution, and physical drive health.
* **Arr Logistics:** A complete media management suite. View your download queue, upcoming TV calendar, and grab history.
* **Jellyfin Theater:** A "Netflix-style" view of who is watching what. Includes transcoding status and user activity logs.
* **Network Ops:** A sci-fi inspired "NOC" page showing real-time bandwidth usage, active interface details, and a live socket connection matrix.
* **Minecraft Ops:** A server management blade with a live RCON terminal, visual player roster (with skins), and one-click environment controls.
* **Settings System:** A robust configuration page with accent color customization, data polling rate controls, and a draft/save system.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on the machine that will run the dashboard:

* **Node.js** (Version 18 or higher recommended) - [Download Here](https://nodejs.org/)
* **Git** - [Download Here](https://git-scm.com/)

You will also need the API Keys and IP addresses for the services you want to track (Sonarr, Radarr, Jellyfin, etc.).

---

## 📦 Installation

### 1. Clone the Repository
Open your terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
git clone [https://github.com/YOUR_USERNAME/lan-dashboard.git](https://github.com/YOUR_USERNAME/lan-dashboard.git)
cd lan-dashboard
