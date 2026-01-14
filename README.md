🚀 UtilityDashboard

The Ultimate Homelab Command Center.

UtilityDashboard is a professional, high-performance dashboard designed to monitor your local network, media servers, and game servers. Built with Next.js, Tailwind CSS, and Framer Motion, it provides a cinematic and data-rich interface for your personal server.

✨ Features

🎛️ Mission Control: A "Glassmorphism" home screen featuring real-time CPU/RAM visualization, Smart Alerts, and a Quick Launch Dock.

📡 Network Operations Center (NOC): "Matrix-style" monitoring of active connections, bandwidth usage (Upload/Download), and interface discovery.

🎬 Jellyfin Theater: A cinematic "Now Playing" interface. See active streams, transcoding status, and user watch history in real-time.

📦 Arr Logistics: A logistics suite for Sonarr (TV) and Radarr (Movies). View queues, upcoming premiere calendars, and download history.

💾 NAS Telemetry: Deep hardware stats including physical disk health, specific core temperatures, and logical volume mapping.

⛏️ Minecraft Ops: A full RCON terminal, player roster with 3D skin previews, and environmental controls (Time/Weather/Difficulty).

⚙️ Transactional Settings: A safe configuration manager to adjust refresh rates, accent colors, and server identity without code changes.

🛠️ Prerequisites

Before installing, ensure your computer has the following:

Node.js (Version 18+): Download Here.

Check if installed: Open a terminal and type node -v.

Git: Download Here.

Your Server Details: IP addresses and API Keys for services you want to track (Jellyfin, Sonarr, etc.).

📥 Installation Guide

1. Download the Code

Open your terminal (Command Prompt, PowerShell, or Terminal) and run:

git clone [https://github.com/YOUR_USERNAME/utility-dashboard.git](https://github.com/YOUR_USERNAME/utility-dashboard.git)
cd utility-dashboard


2. Install Dependencies

This downloads the "engines" required to run the dashboard (like React, Next.js, and animation libraries).

npm install


🔑 Configuration (Important!)

The dashboard needs to know where your servers are. We use a secure environment file for this.

In the project folder, locate the file named .env.example.

Duplicate this file and rename the copy to .env.local.

Open .env.local in any text editor (Notepad, TextEdit, VS Code).

Fill in the values for your services.

Example .env.local file:

# --- MEDIA SERVICES ---
# URL: The full address (http://IP:PORT)
# KEY: Found in Settings > General > API Key inside the specific app

NEXT_PUBLIC_JELLYFIN_URL=[http://192.168.1.50:8096](http://192.168.1.50:8096)
JELLYFIN_KEY=
NEXT_PUBLIC_SONARR_URL=[http://192.168.1.50:8989](http://192.168.1.50:8989)
SONARR_KEY=

NEXT_PUBLIC_RADARR_URL=[http://192.168.1.50:7878](http://192.168.1.50:7878)
RADARR_KEY=

# --- MINECRAFT SERVER ---
# Ensure "enable-rcon=true" is set in your server.properties file on the MC server
MC_RCON_HOST=192.168.1.50
MC_RCON_PORT=25575
MC_RCON_PASSWORD=secret_password_here

# --- SYSTEM & WEATHER ---
# Get a free key from OpenWeatherMap (Optional, dashboard uses OpenMeteo by default)
NEXT_PUBLIC_WEATHER_ZIP=77384
NEXT_PUBLIC_WEATHER_COUNTRY=US


Note: If you do not use a specific service (e.g., you don't play Minecraft), you can leave those fields blank. The page will just show "Offline".

🚀 How to Run

Option A: Development Mode (Best for testing)

This mode lets you see changes instantly if you edit the code.

npm run dev


Open your browser to: http://localhost:3000

Option B: Production Mode (Best for 24/7 use)

This makes the app faster and optimized for daily use.

npm run build
npm start


Open your browser to: http://localhost:3000

❓ Troubleshooting

"The site won't load / Connection Refused"

Check the URL: Ensure you are using http:// and not https://.

Check the IP: If the dashboard is on the same computer as the services, you can use 127.0.0.1 or localhost. If they are on a different computer, you must use that computer's LAN IP (e.g., 192.168.1.XX).

"Minecraft page says Server Offline"

Go to your Minecraft Server folder.

Open server.properties.

Make sure these lines exist:

enable-rcon=true
rcon.password=your_password
rcon.port=25575


Restart your Minecraft server.

"API Error / Data not showing"

Double-check your API Keys in .env.local. Even one missing character will break the connection.

Ensure your services (Sonarr/Radarr) are actually running.

📱 Mobile Access

To view this on your phone:

Find your computer's local IP address (Windows: Type ipconfig in terminal).

On your phone's browser, type http://YOUR_COMPUTER_IP:3000.

Created with UtilityDashboard
