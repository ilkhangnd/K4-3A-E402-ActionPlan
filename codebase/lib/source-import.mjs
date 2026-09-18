// Accept the compact internal schema and the Vietnamese admin-export schema.
// The latter is normalized before validation; it does not bypass URL,
// audience, or required-field checks in the server.
export function normalizeSourceImport(payload) {
  const candidate = payload && typeof payload === "object" && "sources" in payload ? payload.sources : payload;
  const records = Array.isArray(candidate)
    ? candidate
    : Array.isArray(candidate?.sources)
      ? candidate.sources
      : Array.isArray(candidate?.nguon_du_lieu_chinh_thuc)
        ? candidate.nguon_du_lieu_chinh_thuc
        : null;

  if (!records?.length) {
    throw new Error("Tệp cần là một mảng nguồn, { sources: [...] }, hoặc { nguon_du_lieu_chinh_thuc: [...] } không rỗng.");
  }

  return records.map((record, index) => {
    const vietnameseSchema = record && typeof record === "object" && (
      "ma_tin_ma_nguon" in record
      || "tieu_de_thong_bao" in record
      || "nguyen_van_noi_dung_thong_bao_chinh_thuc" in record
    );
    if (!vietnameseSchema) return record;

    const id = record.ma_tin_ma_nguon;
    const audience = Array.isArray(record.pham_vi)
      ? record.pham_vi.join(", ")
      : record.pham_vi;
    return {
      id,
      title: record.tieu_de_thong_bao,
      body: record.nguyen_van_noi_dung_thong_bao_chinh_thuc,
      // Some admin exports do not carry a permalink. Keep those sources
      // traceable as local verified imports instead of inventing a public URL.
      url: record.link_https_thong_bao_chinh_thuc || `local://official-import/${encodeURIComponent(id || `row-${index + 1}`)}`,
      published_at: record.ngay_dang,
      audience: audience || "all",
      // The Vietnamese container explicitly declares official sources.
      // Upload remains an admin action and keeps the original HTTPS link.
      official: true,
      _import_index: index + 1
    };
  });
}
