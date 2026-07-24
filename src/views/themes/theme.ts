import { normalizeThemeName, type ThemeName } from "../../theme";
import { NotFound as KehuaNotFound } from "./kehua/404";
import { About as KehuaAbout } from "./kehua/about";
import { Archives as KehuaArchives } from "./kehua/archives";
import { Base as KehuaBase } from "./kehua/base";
import { Categories as KehuaCategories } from "./kehua/categories";
import { Category as KehuaCategory } from "./kehua/category";
import { Index as KehuaIndex } from "./kehua/index";
import { Links as KehuaLinks } from "./kehua/links";
import { Memos as KehuaMemos } from "./kehua/memos";
import { Page as KehuaPage } from "./kehua/page";
import { Post as KehuaPost } from "./kehua/post";
import { Tag as KehuaTag } from "./kehua/tag";
import { Tags as KehuaTags } from "./kehua/tags";
import { Comments as KehuaComments } from "./kehua/partials/comments";
import { NotFound as WritechoNotFound } from "./writecho/404";
import { About as WritechoAbout } from "./writecho/about";
import { Archives as WritechoArchives } from "./writecho/archives";
import { Base as WritechoBase } from "./writecho/base";
import { Categories as WritechoCategories } from "./writecho/categories";
import { Category as WritechoCategory } from "./writecho/category";
import { Index as WritechoIndex } from "./writecho/index";
import { Links as WritechoLinks } from "./writecho/links";
import { Memos as WritechoMemos } from "./writecho/memos";
import { Page as WritechoPage } from "./writecho/page";
import { Post as WritechoPost } from "./writecho/post";
import { Tag as WritechoTag } from "./writecho/tag";
import { Tags as WritechoTags } from "./writecho/tags";
import { Comments as WritechoComments } from "./writecho/partials/comments";
import { NotFound as PrinterNotFound } from "./printer/404";
import { About as PrinterAbout } from "./printer/about";
import { Archives as PrinterArchives } from "./printer/archives";
import { Base as PrinterBase } from "./printer/base";
import { Categories as PrinterCategories } from "./printer/categories";
import { Category as PrinterCategory } from "./printer/category";
import { Index as PrinterIndex } from "./printer/index";
import { Links as PrinterLinks } from "./printer/links";
import { Memos as PrinterMemos } from "./printer/memos";
import { Page as PrinterPage } from "./printer/page";
import { Post as PrinterPost } from "./printer/post";
import { Tag as PrinterTag } from "./printer/tag";
import { Tags as PrinterTags } from "./printer/tags";
import { Comments as PrinterComments } from "./printer/partials/comments";
import { NotFound as VermillionNotFound } from "./vermillion/404";
import { About as VermillionAbout } from "./vermillion/about";
import { Archives as VermillionArchives } from "./vermillion/archives";
import { Base as VermillionBase } from "./vermillion/base";
import { Categories as VermillionCategories } from "./vermillion/categories";
import { Category as VermillionCategory } from "./vermillion/category";
import { Index as VermillionIndex } from "./vermillion/index";
import { Links as VermillionLinks } from "./vermillion/links";
import { Memos as VermillionMemos } from "./vermillion/memos";
import { Page as VermillionPage } from "./vermillion/page";
import { Post as VermillionPost } from "./vermillion/post";
import { Tag as VermillionTag } from "./vermillion/tag";
import { Tags as VermillionTags } from "./vermillion/tags";
import { Comments as VermillionComments } from "./vermillion/partials/comments";
import { NotFound as SimplechoNotFound } from "./simplecho/404";
import { About as SimplechoAbout } from "./simplecho/about";
import { Archives as SimplechoArchives } from "./simplecho/archives";
import { Base as SimplechoBase } from "./simplecho/base";
import { Categories as SimplechoCategories } from "./simplecho/categories";
import { Category as SimplechoCategory } from "./simplecho/category";
import { Index as SimplechoIndex } from "./simplecho/index";
import { Links as SimplechoLinks } from "./simplecho/links";
import { Memos as SimplechoMemos } from "./simplecho/memos";
import { Page as SimplechoPage } from "./simplecho/page";
import { Post as SimplechoPost } from "./simplecho/post";
import { Tag as SimplechoTag } from "./simplecho/tag";
import { Tags as SimplechoTags } from "./simplecho/tags";
import { Comments as SimplechoComments } from "./simplecho/partials/comments";
import { NotFound as ChatGPTNotFound } from "./chatgpt/404";
import { About as ChatGPTAbout } from "./chatgpt/about";
import { Archives as ChatGPTArchives } from "./chatgpt/archives";
import { Base as ChatGPTBase } from "./chatgpt/base";
import { Categories as ChatGPTCategories } from "./chatgpt/categories";
import { Category as ChatGPTCategory } from "./chatgpt/category";
import { Index as ChatGPTIndex } from "./chatgpt/index";
import { Links as ChatGPTLinks } from "./chatgpt/links";
import { Memos as ChatGPTMemos } from "./chatgpt/memos";
import { Page as ChatGPTPage } from "./chatgpt/page";
import { Post as ChatGPTPost } from "./chatgpt/post";
import { Tag as ChatGPTTag } from "./chatgpt/tag";
import { Tags as ChatGPTTags } from "./chatgpt/tags";
import { Comments as ChatGPTComments } from "./chatgpt/partials/comments";
const themes = {
  kehua: {
    NotFound: KehuaNotFound,
    About: KehuaAbout,
    Archives: KehuaArchives,
    Base: KehuaBase,
    Categories: KehuaCategories,
    Category: KehuaCategory,
    Comments: KehuaComments,
    Index: KehuaIndex,
    Links: KehuaLinks,
    Memos: KehuaMemos,
    Page: KehuaPage,
    Post: KehuaPost,
    Tag: KehuaTag,
    Tags: KehuaTags,
  },
  writecho: {
    NotFound: WritechoNotFound,
    About: WritechoAbout,
    Archives: WritechoArchives,
    Base: WritechoBase,
    Categories: WritechoCategories,
    Category: WritechoCategory,
    Comments: WritechoComments,
    Index: WritechoIndex,
    Links: WritechoLinks,
    Memos: WritechoMemos,
    Page: WritechoPage,
    Post: WritechoPost,
    Tag: WritechoTag,
    Tags: WritechoTags,
  },
  printer: {
    NotFound: PrinterNotFound,
    About: PrinterAbout,
    Archives: PrinterArchives,
    Base: PrinterBase,
    Categories: PrinterCategories,
    Category: PrinterCategory,
    Comments: PrinterComments,
    Index: PrinterIndex,
    Links: PrinterLinks,
    Memos: PrinterMemos,
    Page: PrinterPage,
    Post: PrinterPost,
    Tag: PrinterTag,
    Tags: PrinterTags,
  },
  vermillion: {
    NotFound: VermillionNotFound,
    About: VermillionAbout,
    Archives: VermillionArchives,
    Base: VermillionBase,
    Categories: VermillionCategories,
    Category: VermillionCategory,
    Comments: VermillionComments,
    Index: VermillionIndex,
    Links: VermillionLinks,
    Memos: VermillionMemos,
    Page: VermillionPage,
    Post: VermillionPost,
    Tag: VermillionTag,
    Tags: VermillionTags,
  },
  simplecho: {
    NotFound: SimplechoNotFound,
    About: SimplechoAbout,
    Archives: SimplechoArchives,
    Base: SimplechoBase,
    Categories: SimplechoCategories,
    Category: SimplechoCategory,
    Comments: SimplechoComments,
    Index: SimplechoIndex,
    Links: SimplechoLinks,
    Memos: SimplechoMemos,
    Page: SimplechoPage,
    Post: SimplechoPost,
    Tag: SimplechoTag,
    Tags: SimplechoTags,
  },
  chatgpt: {
    NotFound: ChatGPTNotFound,
    About: ChatGPTAbout,
    Archives: ChatGPTArchives,
    Base: ChatGPTBase,
    Categories: ChatGPTCategories,
    Category: ChatGPTCategory,
    Comments: ChatGPTComments,
    Index: ChatGPTIndex,
    Links: ChatGPTLinks,
    Memos: ChatGPTMemos,
    Page: ChatGPTPage,
    Post: ChatGPTPost,
    Tag: ChatGPTTag,
    Tags: ChatGPTTags,
  },
} as const satisfies Record<ThemeName, object>;

export type ThemeComponents = (typeof themes)["kehua"];

export function getThemeComponents(
  theme: string | undefined | null,
): ThemeComponents {
  return themes[normalizeThemeName(theme)] as ThemeComponents;
}
