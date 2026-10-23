export const getCommentRecordId = (comment) =>
  comment?.CommentId ?? comment?.CommentID ?? comment?.commentId ?? comment?.id ?? comment?.Id ?? null;

export const parseCommentRecords = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
};

export const normalizeCommentRecord = (comment = {}, { optimistic = false } = {}) => {
  const text = comment.text ?? comment.comment ?? comment.Comments ?? comment.comments ?? '';
  const rawFilePath = comment.FilePath ?? comment.filePath ?? comment.img ?? comment.attachment?.imgUrl ?? '';
  const filePath = Array.isArray(rawFilePath) ? rawFilePath.filter(Boolean).join(',') : String(rawFilePath || '');
  const id = getCommentRecordId(comment);
  const rawTime = (comment.CreatedDate ?? comment.time ?? '').toString()
    .replace(/Z$/i, '')
    .replace(' ', 'T');

  return {
    ...comment,
    ...(id == null && optimistic ? { id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` } : {}),
    text,
    comment: text,
    Comments: comment.Comments ?? text,
    time: rawTime,
    CreatedBy: comment.CreatedBy ?? comment.createdBy,
    IsClient: comment.IsClient ?? comment.isClient,
    img: filePath,
    FilePath: filePath,
    _optimisticComment: optimistic || Boolean(comment._optimisticComment),
  };
};

const isMatchingPendingComment = (existing, incoming) => {
  if (!existing?._optimisticComment) return false;
  if (String(existing.text ?? '').trim() !== String(incoming.text ?? '').trim()) return false;
  if (String(existing.FilePath ?? '') !== String(incoming.FilePath ?? '')) return false;

  if (existing.CreatedBy != null && incoming.CreatedBy != null &&
      String(existing.CreatedBy) !== String(incoming.CreatedBy)) return false;

  const existingTime = new Date(existing.CreatedDate ?? existing.time ?? '').getTime();
  const incomingTime = new Date(incoming.CreatedDate ?? incoming.time ?? '').getTime();
  return Number.isFinite(existingTime) && Number.isFinite(incomingTime) &&
    Math.abs(existingTime - incomingTime) <= 120000;
};

export const upsertCommentRecord = (comments, comment, { optimistic = false } = {}) => {
  const current = Array.isArray(comments) ? comments : [];
  const normalized = normalizeCommentRecord(comment, { optimistic });
  const commentId = getCommentRecordId(normalized);
  let index = commentId == null
    ? -1
    : current.findIndex((item) => String(getCommentRecordId(item)) === String(commentId));

  if (index < 0 && !optimistic) {
    index = current.findIndex((item) => isMatchingPendingComment(item, normalized));
  }

  if (index < 0) return [...current, normalized];

  const hasAttachmentField = ['FilePath', 'filePath', 'img', 'attachment'].some((key) =>
    Object.prototype.hasOwnProperty.call(comment || {}, key)
  );
  const existing = current[index];
  const retainedFilePath = existing.FilePath ?? existing.filePath ?? existing.img ?? existing.attachment?.imgUrl ?? '';
  const updated = [...current];
  updated[index] = {
    ...existing,
    ...normalized,
    ...(!hasAttachmentField ? { FilePath: retainedFilePath, img: retainedFilePath } : {}),
    _clientKey: updated[index]._clientKey ?? normalized._clientKey,
    _optimisticComment: optimistic,
  };
  return updated;
};

export const removeCommentRecord = (comments, commentId) =>
  (Array.isArray(comments) ? comments : []).filter(
    (comment) => String(getCommentRecordId(comment)) !== String(commentId)
  );
