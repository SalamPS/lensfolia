# 🐾 [PROJECT NAME] Frontend

<div align="center">
  <img src="/logo-asset-white.svg" alt="Logo" width="200"/>
  
  <h3>✨ [Brief Project Description]</h3>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](YOUR_LIVE_URL)
  
  **🌐 [Live Demo](YOUR_LIVE_URL) | 📱 Mobile Ready**
</div>

---

## 🎯 About

**[Project Name]** is a modern web application built with Next.js 15, TypeScript, and Tailwind CSS. [Brief description of purpose and target audience].

### ✨ Key Features
- 🚀 **Next.js 15**: App Router with SSR optimization
- ⚡ **Performance**: 95+ Lighthouse score
- 🎨 **Modern UI**: shadcn/ui + responsive design
- 📱 **Mobile-First**: Optimized for all devices
- 🔒 **Type Safe**: Full TypeScript coverage
- 🌙 **Dark Mode**: Theme switching support

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.1.8 | React Framework |
| **TypeScript** | 5.0+ | Type Safety |
| **Tailwind CSS** | 3.4.1 | Styling |
| **shadcn/ui** | Latest | UI Components |
| **Framer Motion** | 12+ | Animations |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/pnpm
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/SalamPS/reaksijs-fit2025
cd next

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
```

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint
```

---

## 📁 Project Structure

```
next/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes group
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── (main)/            # Protected app routes group
│   │   ├── detection/     # Plant detection pages
│   │   ├── forum/         # Forum pages
│   │   ├── lensiklopedia/ # Plant encyclopedia
│   │   └── profile/       # User profile
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── detection/        # Detection feature components
│   ├── forum/            # Forum components
│   ├── lensiklopedia/    # Encyclopedia components
│   └── StaticBG.tsx     # Background component
├── lib/                  # Utilities
│   ├── utils.ts          # Helper functions
│   ├── supabase.ts       # Database client
│   └── contexts/         # React contexts
├── public/               # Static assets
│   ├── images/           # Image assets
│   └── icons/            # Icon files
├── middleware.ts         # Route protection
└── next.config.js        # Next.js configuration
```

---

## 🎨 Features

### 🔐 Authentication
- JWT token-based auth
- Protected routes

### 🏠 Main Application
- **Plant Disease Detection**: AI-powered image analysis for identifying plant diseases and pests
- **Community Forum**: Interactive discussion platform with categories for general, diseases, and pests topics
- **Lensiklopedia**: Comprehensive plant knowledge base with detailed information and care guides
- **Mobile-First Design**: Responsive interface optimized for smartphone plant photography

### 🤖 AI Integration
- **Real-time Plant Analysis**: Instant disease and pest identification from uploaded images
- **Smart Recommendations**: AI-generated treatment suggestions and care advice
- **Detection Confidence Scoring**: Accuracy metrics for AI predictions
- **Multi-class Classification**: Support for various plant conditions and pest types

### 📱 Mobile Optimization
- Touch-friendly interface
- Responsive design
- PWA ready

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel

# Or connect GitHub repository
# Auto-deployment on push to main
```

### Environment Variables
Set the following in your deployment platform:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test
4. Commit: `git commit -m "feat: add amazing feature"`
5. Push and create Pull Request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Mobile responsiveness
- Accessibility compliance

---

## 📞 Support

- **Issues**: [GitHub Issues](REPOSITORY_URL/issues)
- **Email**: your-email@domain.com
- **Documentation**: [Project Docs](DOCS_URL)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">
  
  ### 🚀 **Modern Web Experience** ✨
  
  **[Your Team Name]** | 2024
  
  [![Performance](https://img.shields.io/badge/Lighthouse-95+-green)](YOUR_LIVE_URL)
  [![Mobile Ready](https://img.shields.io/badge/Mobile-Ready-blue)](YOUR_LIVE_URL)
  [![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](REPOSITORY_URL)

</div>