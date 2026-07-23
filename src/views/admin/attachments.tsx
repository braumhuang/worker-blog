import type {
  AttachmentInfo,
  AttachmentTemplate,
  BlogContent,
} from "../../types";
import { AdminLayout, AdminPagination } from "./base";
import { AttachmentRows } from "./shared";

export function AttachmentsPage({
  rows,
  fileCdnUrl,
  templates,
  page,
  total,
  perPage,
}: {
  rows: Array<{ content: BlogContent; info: AttachmentInfo }>;
  fileCdnUrl: string;
  templates: AttachmentTemplate[];
  page: number;
  total: number;
  perPage: number;
}) {
  return (
    <AdminLayout
      title="附件管理"
      subtitle={`共 ${total} 个附件`}
      actions={
        <>
          <label class="button primary" for="global-upload">
            上传附件
          </label>
          <input
            id="global-upload"
            data-upload-input
            type="file"
            multiple
            hidden
          />
        </>
      }
    >
      <div class="progress" data-upload-status></div>
      <section class="panel">
        <div class="panel-body">
          <AttachmentRows
            rows={rows}
            fileCdnUrl={fileCdnUrl}
            templates={templates}
          />
        </div>
      </section>
      <AdminPagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / perPage))}
        path="/admin/attachments"
      />
    </AdminLayout>
  );
}
