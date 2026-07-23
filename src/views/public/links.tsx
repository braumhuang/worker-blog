import type { BlogLink } from '../../types'
import { publicAttachmentUrl } from '../../lib/utils'
import { PageHeading } from './base'

export function Links({ links, fileCdnUrl }: { links: BlogLink[]; fileCdnUrl: string }) {
  return <><PageHeading title="导航" subtitle={`添加页面 ${links.length} 个链接`}/><div class="links-grid">{links.map((link) => {
    const description = link.info.trim()
    return <a class="link-card" href={link.url} target="_blank" rel="noopener noreferrer">
      <span class="link-card-avatar">{link.icon ? <img src={publicAttachmentUrl(link.icon, fileCdnUrl)} alt="" loading="lazy"/> : <span class="link-card-initial">{link.name.slice(0, 1).toUpperCase()}</span>}</span>
      <span class={`link-card-body${description ? '' : ' link-card-body-name-only'}`}><span class="link-card-name">{link.name}</span>{description ? <span class="link-card-desc">{description}</span> : null}</span>
    </a>
  })}</div></>
}
