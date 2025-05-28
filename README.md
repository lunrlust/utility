# 🌟 lunrlust

A comprehensive Windows setup and optimization CLI tool that automates post-installation workflow for gaming and development environments.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-brightgreen.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

lunrlust streamlines the process of setting up a fresh Windows installation by automating driver installations, development environment setup, gaming optimizations, and creating an organized file structure - all through an elegant command-line interface.

## ✨ Features

- 🔍 **System Validation**
  - Automatic hardware compatibility check
  - Admin privileges verification
  - System requirements validation

- 🎮 **Gaming Setup**
  - Installs Visual C++ Redistributables
  - DirectX Runtime installation
  - Steam, Epic Games, and Ubisoft Connect clients
  - GPU, audio, and network driver detection and installation

- 💻 **Development Environment**
  - Multiple Python versions (3.9, 3.10, 3.11)
  - Node.js LTS with global packages
  - Visual Studio Code with curated extensions
  - Docker Desktop
  - Ollama with basic models
  - Java Development Kit
  - Git with configuration

- ⚡ **Performance Optimization**
  - Background service optimization
  - Startup program management
  - Power settings configuration
  - Temporary file cleanup

- 💾 **Drive Management**
  - Safe formatting of non-system internal drives
  - Intelligent external drive detection
  - Automated folder structure creation
  - README files for all directories

## 🚀 Quick Start

```bash
npm install -g lunrlust
lunrlust
```

## 📋 Requirements

- Windows 10/11
- Administrator privileges
- Node.js 18.0.0 or higher
- Internet connection
- At least 8GB RAM
- 50GB free space

## 🛠️ Installation

### Option 1: NPM (Recommended)
```bash
npm install -g lunrlust
```

### Option 2: Manual Installation
```bash
winget install --id Git.Git -e --source winget
git clone https://github.com/lunrlust/utility.git
cd utility
npm install
npm link
```

## 📂 Directory Structure

lunrlust creates an organized folder structure on formatted drives:

```
Apps/
├── Games/
│   ├── Steam/Files/
│   ├── Epic/Files/
│   └── Ubisoft/Files/
├── Packages/
│   ├── Windows/
│   │   ├── Updates/
│   │   └── Drivers/
│   └── Libraries/
└── Drivers/
    ├── Graphics/
    └── Network/

Documents/
├── Personal/
├── Finance/
└── Education/

Developers/
├── Web/
├── GameDevelopment/
└── AI/

Share/
└── Media/
    ├── Videos/
    ├── Audio/
    └── Images/
```

Each directory includes a README file explaining its purpose and recommended usage.

## 🎯 Usage

1. Open an administrator command prompt
2. Run `lunrlust`
3. Select desired operations from the menu:
   - Check System Requirements
   - Format Drives & Create Folder Structure
   - Install Gaming Dependencies & Clients
   - Install Developer Tools & Environments
   - Optimize System Performance
   - Run Complete Setup

## 📝 Logging

All operations are logged to:
```
%USERPROFILE%\.lunrlust\logs\
```

## ⚠️ Safety Features

- Double confirmation for critical operations
- System drive (C:) protection
- External drive detection
- Operation logging
- Error recovery

## ❓ FAQ

**Q: Will this format my Windows (C:) drive?**  
A: No, lunrlust automatically detects and skips the system drive.

**Q: Can I select which tools to install?**  
A: Yes, each category (gaming, development, etc.) allows custom selection.

**Q: Is it safe to run on a production machine?**  
A: Yes, lunrlust includes safety checks and confirmations for all critical operations.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Node.js community
- All open-source contributors
- Gaming and development communities

## 📮 Support

For support, please open an issue on GitHub or contact the maintainers.
