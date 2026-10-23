import { fileRemoveApi, filesUploadApi } from '../../../apis/UploadFille';

export const parseCommentAttachmentPaths = (value) => {
  const values = Array.isArray(value) ? value : String(value || '').split(',');
  return [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))];
};

export const getCommentAttachmentDisplayName = (path) => {
  const cleanPath = String(path || '').split(/[?#]/, 1)[0];
  const segment = cleanPath.split('/').pop() || 'Attachment';
  try {
    return decodeURIComponent(segment);
  } catch (_) {
    return segment;
  }
};

const extractUploadPaths = (response) => {
  const paths = [];
  const collections = [response?.files, response?.data?.files, response?.Data?.files, response?.data, response?.Data];

  collections.forEach((collection) => {
    if (!Array.isArray(collection)) return;
    collection.forEach((file) => {
      if (typeof file === 'string') {
        paths.push(file);
        return;
      }
      const path = file?.url ?? file?.fileUrl ?? file?.FilePath ?? file?.filePath ?? file?.imageUrl ?? file?.path;
      if (path) paths.push(path);
    });
  });

  const topLevelPath = response?.url ?? response?.fileUrl ?? response?.FilePath ?? response?.filePath ?? response?.imageUrl ?? response?.path ??
    response?.data?.url ?? response?.data?.fileUrl ?? response?.data?.FilePath ?? response?.data?.filePath ?? response?.data?.imageUrl ?? response?.data?.path ??
    response?.Data?.url ?? response?.Data?.fileUrl ?? response?.Data?.FilePath ?? response?.Data?.filePath ?? response?.Data?.imageUrl ?? response?.Data?.path;
  if (topLevelPath) paths.push(topLevelPath);

  return parseCommentAttachmentPaths(paths);
};

export const uploadCommentAttachments = async ({ files, callLogId, ukey }) => {
  const fileList = (Array.isArray(files) ? files : [files]).filter(Boolean);
  if (!fileList.length) return [];
  if (callLogId == null || callLogId === '') throw new Error('A call is required before uploading attachments.');

  const response = await filesUploadApi({
    ukey,
    folderName: 'CallLog',
    uniqueNo: callLogId,
    attachments: fileList,
  });
  const paths = extractUploadPaths(response);
  if (!paths.length) throw new Error('The attachment upload did not return file paths.');
  if (paths.length !== fileList.length) {
    try {
      await removeCommentAttachments(paths);
    } catch (cleanupError) {
      console.error('Could not clean up a partial comment attachment upload:', cleanupError);
    }
    throw new Error('Not all selected attachments were uploaded. Please try again.');
  }
  return paths;
};

export const removeCommentAttachments = async (paths) => {
  const uniquePaths = parseCommentAttachmentPaths(paths);
  if (!uniquePaths.length) return;

  const response = await fileRemoveApi({ attachments: uniquePaths });
  const status = response?.rd?.[0] || response?.Data?.rd?.[0];
  const httpStatus = response?.Status ?? response?.status;
  if (
    response === false ||
    response?.success === false ||
    response?.Success === false ||
    (httpStatus != null && String(httpStatus) !== '200') ||
    (status?.stat != null && Number(status.stat) !== 1)
  ) {
    throw new Error(response?.message || response?.Message || 'The attachment could not be removed.');
  }
};

export const getUnreferencedAttachmentPaths = (candidates, persistedPaths) => {
  const persisted = new Set(parseCommentAttachmentPaths(persistedPaths));
  return parseCommentAttachmentPaths(candidates).filter((path) => !persisted.has(path));
};
