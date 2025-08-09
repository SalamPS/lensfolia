# 🌿 LensFolia - Plant Disease Detection Platform

<div align="center">
  <img src="public/logo-asset-white.svg" alt="LensFolia Logo" width="200"/>
  
  <h3>✨ Deteksi Penyakit Tanaman Melalui Daun dalam Sekejap dengan AI</h3>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge)](https://web.dev/progressive-web-apps/)
  
  **🌐 AI-Powered Plant Health Analysis | 📱 Progressive Web App**
</div>

---

## 🎯 About

**LensFolia** is a cutting-edge Progressive Web Application (PWA) that leverages AI and computer vision to revolutionize plant disease detection and management. Built with Next.js 15 and powered by advanced machine learning models including YOLOv8 and MobileNetV2, LensFolia provides instant, accurate plant health analysis through smartphone photography.

The platform combines real-time plant disease detection with a comprehensive knowledge base, community forum, and personalized recommendations system, making plant care accessible to everyone from home gardeners to agricultural professionals.

### ✨ Key Features

- 🚀 **Next.js 15**: App Router with SSR optimization and React 19
- 🤖 **AI-Powered Detection**: YOLOv8 + MobileNetV2 for accurate disease identification
- ⚡ **Multi-Agent System**: LangGraph-based workflow for comprehensive analysis
- 🎨 **Modern UI**: shadcn/ui components with responsive design
- 📱 **PWA Ready**: Offline capabilities and mobile app experience
- 🔒 **Type Safe**: Full TypeScript coverage with strict mode
- 🌙 **Dark Mode**: Theme switching support
- 🔄 **Real-time Updates**: Push notifications and live data synchronization

---

## 🛠️ Tech Stack

### Frontend

| Technology        | Version | Purpose                         |
| ----------------- | ------- | ------------------------------- |
| **Next.js**       | 15.3.2  | React Framework with App Router |
| **React**         | 19.0.0  | UI Library                      |
| **TypeScript**    | 5.0+    | Type Safety                     |
| **Tailwind CSS**  | 4.0     | Utility-first CSS Framework     |
| **shadcn/ui**     | Latest  | Pre-built UI Components         |
| **Framer Motion** | 12+     | Animations and Transitions      |
| **Radix UI**      | Latest  | Accessible UI Primitives        |
| **Supabase**      | 2.53.0  | Backend as a Service            |

### AI & Backend Services

| Technology           | Purpose                                    |
| -------------------- | ------------------------------------------ |
| **Python**           | Backend Services                           |
| **YOLOv8**           | Object Detection (Plant Disease Detection) |
| **MobileNetV2**      | Image Classification                       |
| **LangGraph**        | Multi-Agent AI Workflow                    |
| **LangChain**        | LLM Integration                            |
| **OpenAI/Anthropic** | Language Models                            |
| **Tavily**           | Web Search Integration                     |

### DevOps & Tools

| Technology       | Purpose              |
| ---------------- | -------------------- |
| **Docker**       | Containerization     |
| **Google Cloud** | Cloud Deployment     |
| **Serwist**      | Service Worker & PWA |
| **ESLint**       | Code Linting         |
| **Prettier**     | Code Formatting      |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: 20+)
- pnpm (recommended) or npm
- Python 3.11+ (for AI services)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/SalamPS/lensfolia.git
cd lensfolia-secomp2025/next

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Setup

```bash
# .env.local
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key

# For AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
TAVILY_API_KEY=your_tavily_key
```

### Development

```bash
# Start Next.js development server
pnpm dev

# Start AI diagnosis service (in separate terminal)
cd ../services/diagnosis
python -m uvicorn main:app --reload --port 8000

# Start chatbot service (in separate terminal)
cd ../services/chatbot
python -m uvicorn main:app --reload --port 8001

# Build for production
pnpm build

# Run linting
pnpm lint
```

---

## 📁 Project Structure

```
lensfolia-secomp2025/
├── next/                      # Next.js Frontend Application
│   ├── app/                   # Next.js App Router
│   │   ├── detect/           # Plant disease detection interface
│   │   ├── forum/            # Community discussion platform
│   │   ├── encyclopedia/     # Plant knowledge base (Lensiklopedia)
│   │   ├── bookmarks/        # User bookmarks management
│   │   ├── result/           # Detection results display
│   │   ├── api/              # API routes and endpoints
│   │   ├── actions/          # Server actions
│   │   ├── test-push/        # Push notification testing
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout component
│   │   ├── page.tsx          # Landing page
│   │   └── manifest.ts       # PWA manifest
│   ├── components/           # Reusable React components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── auth/            # Authentication components
│   │   ├── detect/          # Disease detection components
│   │   ├── forum/           # Forum and discussion components
│   │   ├── encyclopedia/    # Knowledge base components
│   │   ├── bookmarks/       # Bookmark management components
│   │   ├── home/            # Landing page components
│   │   ├── pwa/             # PWA-related components
│   │   └── lang/            # Language and localization
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   │   ├── supabase.ts      # Database client
│   │   ├── utils.ts         # Helper functions
│   │   └── notifications.ts # Push notification utilities
│   ├── public/              # Static assets
│   │   ├── pwa/             # PWA icons and assets
│   │   └── examples/        # Example images
│   ├── middleware.ts        # Route protection middleware
│   └── next.config.ts       # Next.js configuration
├── services/                # Backend AI Services
│   ├── diagnosis/           # Plant disease detection service
│   │   ├── src/
│   │   │   └── agent/       # Multi-agent AI system
│   │   │       ├── graph.py        # LangGraph workflow
│   │   │       ├── pipeline.py     # Detection pipeline
│   │   │       ├── tools.py        # AI tools and utilities
│   │   │       └── models/         # AI model files
│   │   ├── Dockerfile       # Container configuration
│   │   └── pyproject.toml   # Python dependencies
│   └── chatbot/             # AI chatbot service
│       ├── main.py          # FastAPI application
│       ├── rag.py           # RAG implementation
│       └── Dockerfile       # Container configuration
└── README.md                # Project documentation
```

---

## 🎨 Features

### 🔐 Authentication & User Management

- Supabase-based authentication system
- User profiles and session management
- Protected routes and middleware

### � Core Plant Health Features

#### 📸 **AI-Powered Plant Disease Detection**

- **Real-time Analysis**: Upload or capture plant leaf images for instant disease identification
- **Multi-Stage Pipeline**: YOLOv8 object detection + MobileNetV2 classification
- **Confidence Scoring**: Accuracy metrics for AI predictions with detailed confidence levels
- **Annotated Results**: Visual highlighting of detected disease areas on plant images
- **Multi-class Support**: Detection of various plant diseases, pests, and health conditions

#### 🤖 **Advanced AI Workflow**

- **Multi-Agent System**: LangGraph-orchestrated workflow with specialized agents
  - Image Analysis Agent: Initial plant leaf validation and disease screening
  - Detection Agent: Computer vision-based disease identification
  - Overview Agent: Comprehensive disease analysis and explanation
  - Treatment Agent: Medical treatment recommendations
  - Recommendation Agent: Product and care suggestions
- **Retrieval-Augmented Generation**: Enhanced responses using plant disease knowledge base
- **Web Search Integration**: Real-time information retrieval for up-to-date plant care advice

#### 📚 **Lensiklopedia (Plant Encyclopedia)**

- Comprehensive plant knowledge database
- Disease information and care guides
- Searchable plant species directory
- Treatment protocols and preventive measures

#### 💬 **Community Forum**

- Interactive discussion platform
- Category-based organization (General, Diseases, Pests)
- User post creation and management
- Community-driven knowledge sharing
- Notification system for forum updates

#### � **Personal Bookmarks**

- Save detection results and plant information
- Organize favorite forum posts and encyclopedia entries
- Quick access to personal plant care history

### 📱 **Progressive Web App (PWA)**

- **Offline Capabilities**: Core functionality available without internet
- **Mobile App Experience**: Native app-like interface and interactions
- **Push Notifications**: Real-time updates and reminders
- **Install Prompts**: Add to home screen functionality
- **Service Worker**: Background sync and caching strategies

### 🎨 **User Experience**

- **Responsive Design**: Optimized for all device sizes
- **Dark/Light Mode**: Automatic and manual theme switching
- **Touch-Optimized**: Mobile-first interface design
- **Loading States**: Smooth animations and progress indicators
- **Error Handling**: Graceful degradation and user-friendly error messages

### � **Developer Features**

- **TypeScript**: Full type safety across the application
- **Component Library**: shadcn/ui + Radix UI primitives
- **Animation System**: Framer Motion for smooth interactions
- **Code Quality**: ESLint + Prettier configuration
- **Hot Reload**: Fast development with Next.js dev server

---

## 🚀 Deployment

### Docker Deployment (Recommended)

#### Frontend (Next.js)

```bash
cd lensfolia/next
docker build -t lensfolia-frontend .
docker run -p 3000:3000 lensfolia-frontend
```

#### AI Services

```bash
# Diagnosis Service
cd lensfolia/services/diagnosis
docker build -t lensfolia-diagnosis .
docker run -p 8000:8000 lensfolia-diagnosis

# Chatbot Service
cd lensfolia/services/chatbot
docker build -t lensfolia-chatbot .
docker run -p 8001:8001 lensfolia-chatbot
```

### Vercel Deployment (Frontend)

```bash
# Deploy Next.js app to Vercel
cd lensfolia/next
vercel

# Or connect GitHub repository for auto-deployment
```

### Google Cloud Platform

```bash
# Deploy using provided deployment scripts
cd lensfolia-secomp2025/services/diagnosis
./deploy.sh

cd ../chatbot
./deploy.sh
```

### Environment Variables

Configure the following environment variables in your deployment platform:

#### Frontend

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

#### AI Services

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `TAVILY_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m "feat: add amazing feature"`
5. Push and create Pull Request

### Code Standards

- **TypeScript**: Strict mode with comprehensive type coverage
- **ESLint + Prettier**: Consistent code formatting and linting
- **Component Structure**: Follow established patterns in `/components`
- **Mobile Responsiveness**: Test on multiple device sizes
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimize images and lazy load components
- **Testing**: Write unit tests for critical functionality

### Development Guidelines

- Use semantic commit messages (feat, fix, docs, style, refactor, test, chore)
- Follow the existing folder structure and naming conventions
- Document complex functions and components
- Ensure PWA functionality works offline
- Test AI detection pipeline thoroughly before merging

---

## 📊 Performance & Analytics

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for excellent user experience
- **Bundle Size**: Optimized with Next.js automatic code splitting
- **Image Optimization**: Automatic WebP conversion and responsive images
- **Caching Strategy**: Aggressive caching for AI models and static assets

---

## 🔧 AI Model Information

### Detection Models

- **YOLOv8**: Real-time object detection for plant disease localization
- **MobileNetV2**: Lightweight classification model for disease identification
- **Model Size**: Optimized for edge deployment and fast inference
- **Accuracy**: 90%+ accuracy on common plant diseases
- **Languages Supported**: Indonesian (Bahasa Indonesia)

### Training Data

- Curated dataset of plant disease images
- Augmented with various lighting and angle conditions
- Regularly updated with new disease patterns
- Community-contributed validation images

---

## 📞 Support & Contact

- **Repository**: [GitHub - lensfolia](https://github.com/SalamPS/lensfolia)
- **Issues**: [GitHub Issues](https://github.com/SalamPS/lensfolia/issues)
- **Documentation**: Available in repository Wiki

### Bug Reports

When reporting bugs, please include:

- Device and browser information
- Steps to reproduce the issue
- Screenshots or screen recordings
- Console error messages (if any)

### Feature Requests

- Use GitHub Issues with `enhancement` label
- Provide detailed use case and expected behavior
- Consider implementation complexity and user impact

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">
  
  ### 🌿 **Leaf it for us** ✨
  
  **LensFolia Team** | 2025
  
  [![Performance](https://img.shields.io/badge/Lighthouse-95+-green)](https://github.com/SalamPS/lensfolia)
  [![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue)](https://github.com/SalamPS/lensfolia)
  [![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://github.com/SalamPS/lensfolia)
  [![AI Powered](https://img.shields.io/badge/AI-Powered-purple)](https://github.com/SalamPS/lensfolia)

**Empowering farmers and plant enthusiasts with AI-driven plant health insights**

</div>
