import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TrendingProvider } from '@/lib/context/TrendingContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Agent & LLM Trending',
  description: '专注AI Agent和LLM领域的GitHub trending发现平台',
  keywords: ['AI', 'LLM', 'Agent', 'GitHub', 'Trending', 'LangChain', 'OpenAI'],
  authors: [{ name: 'AI Agent Trending Team' }],
  openGraph: {
    title: 'AI Agent & LLM Trending',
    description: '发现最新最热的AI Agent和LLM相关开源项目',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agent & LLM Trending',
    description: '发现最新最热的AI Agent和LLM相关开源项目',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-50 dark:bg-github-dark min-h-screen`}>
        <TrendingProvider>
          <nav className="border-b border-gray-200 dark:border-github-border bg-white dark:bg-github-dark sticky top-0 z-40 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-github-text">
                    🤖 AI Agent & LLM Trending
                  </h1>
                  <span className="hidden sm:block text-sm text-gray-500 dark:text-github-muted">
                    发现最新AI项目
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <a 
                    href="https://github.com" 
                    className="text-gray-500 hover:text-gray-700 dark:text-github-muted dark:hover:text-github-text text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </nav>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          
          <footer className="mt-auto border-t border-gray-200 dark:border-github-border bg-white dark:bg-github-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center text-sm text-gray-500 dark:text-github-muted">
                <p>
                  专注AI Agent和LLM领域的开源项目发现平台 • 
                  <a href="#" className="hover:text-gray-700 dark:hover:text-github-text ml-1">
                    关于我们
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </TrendingProvider>
      </body>
    </html>
  )
}