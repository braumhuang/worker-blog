import type { OptionMap } from "../../../../types";
import { Icon } from "./icons";
export function Topbar({ options }: { options: OptionMap }) {
  return <header class="topbar"><div class="topbar__left"><button class="icon-btn topbar__menu" id="sidebar-open" type="button" aria-label="打开侧边栏"><Icon name="sidebar" /></button><a class="topbar__title" href="/"><span>{options.site_title}</span><svg class="topbar__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6" /></svg></a></div><div class="topbar__right"><button class="icon-btn" id="theme-toggle" type="button" aria-label="切换深浅模式"><span class="icon-sun"><Icon name="sun" /></span><span class="icon-moon"><Icon name="moon" /></span></button></div></header>;
}
