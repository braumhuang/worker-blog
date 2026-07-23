import type { OptionMap } from '../../types'
import { publicAttachmentUrl } from '../../lib/utils'

function SocialIcon({ name }: { name: 'github' | 'x' | 'rss' | 'email' }) {
  if (name === 'github') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .8a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.3.1 2 1.3 2 1.3 1.1 2 3 1.4 3.7 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6A4.7 4.7 0 0 1 5.4 8c-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.5 1.3a12 12 0 0 1 6.3 0c2.4-1.6 3.5-1.3 3.5-1.3.6 1.7.2 3 .1 3.3a4.7 4.7 0 0 1 1.3 3.3c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3c0 .4.2.7.8.6A11.4 11.4 0 0 0 12 .8Z"/></svg>
  if (name === 'x') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-6.5L6.3 22H3.2l7.2-8.3L.8 2h6.5l4.5 6 7.1-6Zm-1.1 17.8h1.7L6.4 4.1H4.6l13.2 15.7Z"/></svg>
  if (name === 'rss') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="19" r="2"/><path d="M3 10a11 11 0 0 1 11 11h3A14 14 0 0 0 3 7v3Zm0-6a17 17 0 0 1 17 17h3A20 20 0 0 0 3 1v3Z"/></svg>
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>
}

function normalizedLink(value: string, kind: 'url' | 'email'): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (kind === 'email') return trimmed.startsWith('mailto:') ? trimmed : `mailto:${trimmed}`
  if (/^(https?:\/\/|\/)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function About({ options, html }: { options: OptionMap; html: string }) {
  const links = [
    ['github', 'GitHub', normalizedLink(options.about_github || '', 'url')],
    ['x', 'X', normalizedLink(options.about_x || '', 'url')],
    ['rss', 'RSS', normalizedLink(options.about_rss || '', 'url')],
    ['email', '邮箱', normalizedLink(options.about_email || '', 'email')],
  ] as const
  return <section class="about-page">
    <header class="about-header">
      {options.about_avatar ? <div class="about-avatar"><img src={publicAttachmentUrl(options.about_avatar, options.file_cdn_url)} alt={options.site_title} loading="eager"/></div> : null}
      <h1 class="about-name">{options.site_title}</h1>
      {options.site_description ? <p class="about-bio">{options.site_description}</p> : null}
      {links.some(([, , href]) => href) ? <div class="about-social">{links.map(([name, label, href]) => href ? <a class="social-link" href={href} aria-label={label} title={label} target={name === 'email' ? undefined : '_blank'} rel={name === 'email' ? undefined : 'noopener noreferrer'}><SocialIcon name={name}/></a> : null)}</div> : null}
    </header>
    <div class="article-content about-content" dangerouslySetInnerHTML={{ __html: html }}/>
  </section>
}
