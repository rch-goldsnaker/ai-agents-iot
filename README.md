# AI IoT Chat

<img src="https://github.com/rch-goldsnaker/ai-agents-iot/blob/master/public/ai-iot.png" alt="Project Banner">

An intelligent chat system that integrates AI agents with IoT devices, enabling sensor control and monitoring through natural conversations.

## 🚀 Project Overview

This project combines the power of AI agents with the Internet of Things (IoT) to create a conversational interface that enables:

- **Real-time monitoring** of IoT sensors and devices
- **Intelligent control** of devices through natural language commands
- **Analysis and visualization** of sensor data
- **Automation** based on conditions and patterns

### Core Technologies

- **Frontend**: Next.js 15 with React and TypeScript
- **AI**: OpenAI GPT for natural language processing and intelligent agents
- **IoT Platform**: ThingsBoard for device and sensor management
- **Styling**: Tailwind CSS with Radix UI components

## 🤖 Specialized Agents

The system includes specialized AI agents for different functionalities:

### 1. **Sensor Status Agent** (`sensorAttributesTool`)
- Retrieves detailed information about device status
- Queries sensor attributes and metadata
- Provides diagnostics and connectivity status

### 2. **Temperature Agent** (`temperatureTool`)
- Monitors and analyzes real-time temperature data
- Historical measurements and trends
- Automatic alerts for temperature thresholds

### 3. **LED Control Agent** (`ledControlTool`)
- Remote control of LED devices
- Turn on/off via voice or text commands
- Current status and change confirmations

## 🛠️ Installation and Setup

### Prerequisites

- Node.js 18+ 
- OpenAI account with API Key
- ThingsBoard Cloud account or local instance

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-iot-chat
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# ThingsBoard Configuration
THINGSBOARD_URL=https://thingsboard.cloud
THINGSBOARD_USERNAME=your_email@domain.com
THINGSBOARD_PASSWORD=your_password

# Default Device Configuration
THINGSBOARD_DEFAULT_ENTITY_ID=your_device_id
THINGSBOARD_ENTITY_TYPE=DEVICE

# Access Token (optional - auto-generated)
THINGSBOARD_ACCESS_TOKEN=
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI agents | ✅ |
| `THINGSBOARD_URL` | Your ThingsBoard instance URL | ✅ |
| `THINGSBOARD_USERNAME` | ThingsBoard user email | ✅ |
| `THINGSBOARD_PASSWORD` | ThingsBoard password | ✅ |
| `THINGSBOARD_DEFAULT_ENTITY_ID` | Default device ID | ✅ |
| `THINGSBOARD_ENTITY_TYPE` | Entity type (DEVICE by default) | ✅ |

## 🏗️ Project Architecture

```
src/
├── app/                 # Next.js App Router
│   ├── api/chat/       # Chat API endpoint
│   └── page.tsx        # Main page
├── components/         # React components
│   ├── ai-elements/    # AI-specific components
│   └── ui/            # UI components
└── lib/               # Utilities and services
    ├── services/      # Services (ThingsBoard auth)
    └── tools/         # AI tools/agents
```

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Development server with Turbopack
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint linting
```

### Adding New Agents

1. Create a new file in `src/lib/tools/`
2. Implement the agent logic following existing patterns
3. Export the agent in `src/lib/tools/index.ts`
4. Register the agent in the `aiSDKTools` array

## 🤝 Contributing

This is an open source project and contributions are welcome!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Areas

- 🔌 New agents for different sensor types
- 🎨 User interface improvements
- 📊 Advanced data visualization
- 🔒 Security features
- 📖 Documentation and examples

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 📞 Support

For questions, issues, or suggestions:

- Create an [Issue](../../issues) on GitHub
- Check the [ThingsBoard documentation](https://thingsboard.io/docs/)
- Review the [OpenAI documentation](https://platform.openai.com/docs)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [OpenAI](https://openai.com/) - AI Services
- [ThingsBoard](https://thingsboard.io/) - IoT Platform
- [Radix UI](https://www.radix-ui.com/) - UI Components
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
