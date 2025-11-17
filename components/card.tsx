import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`border border-foreground/20 p-6 hover:border-foreground/40 transition-colors ${className}`}>
      {children}
    </div>
  )
}

interface ProjectCardProps {
  title: string
  description: string
  techStack?: string
  stars?: number
  url?: string
}

export function ProjectCard({ title, description, techStack, stars, url }: ProjectCardProps) {
  const content = (
    <Card>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold">{title}</h3>
        {stars && <span className="text-sm opacity-60">★ {stars}</span>}
      </div>
      <p className="mb-3 leading-relaxed">{description}</p>
      {techStack && (
        <p className="text-sm font-mono opacity-60">{techStack}</p>
      )}
    </Card>
  )

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}

interface ArticleCardProps {
  title: string
  description: string
  url: string
}

export function ArticleCard({ title, description, url }: ArticleCardProps) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <Card>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="leading-relaxed">{description}</p>
      </Card>
    </a>
  )
}
