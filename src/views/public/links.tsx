import type { BlogLink } from '../../types'
import { publicAttachmentUrl } from '../../lib/utils'
import { PageHeading } from './base'

export function Links({ links, fileCdnUrl }: { links: BlogLink[]; fileCdnUrl: string }) {
  return <><PageHeading title="导航" subtitle={`添加页面 ${links.length} 个链接`}/><div class="links-grid">{links.map((link) => <a class="link-card" href={link.url} target="_blank" rel="noopener noreferrer">
    <span class="link-card-avatar">{link.icon ? <img src={publicAttachmentUrl(link.icon, fileCdnUrl)} alt="" loading="lazy"/> : <span class="link-card-initial">{link.name.slice(0, 1).toUpperCase()}</span>}</span>
    <span class="link-card-body"><span class="link-card-name">{link.name}</span><span class="link-card-desc">{link.info || link.url}</span></span>
  </a>)}</div></>
}
