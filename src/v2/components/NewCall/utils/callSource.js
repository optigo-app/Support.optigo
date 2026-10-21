const SOURCE_FIELDS = ['topicRaisedBy', 'TopicRaisedBy', 'sourceBy', 'SourceBy'];

export function getCallSource(record, fallbackRecord) {
  for (const source of [record, fallbackRecord]) {
    if (!source) continue;
    for (const field of SOURCE_FIELDS) {
      const value = source[field];
      if (value !== null && value !== undefined && String(value).trim()) {
        return String(value).trim();
      }
    }
  }
  return '';
}

export function getCallSourceDisplay(record, fallbackRecord) {
  const source = getCallSource(record, fallbackRecord);
  const normalized = source.toLowerCase();

  if (['optigocarely', 'optigocare'].includes(normalized)) {
    return { label: 'OptigoCarely', type: 'optigo', source };
  }
  if (['helpdesk', 'help.optigoapps.com'].includes(normalized)) {
    return { label: 'help.optigoapps.com', type: 'helpdesk', source };
  }
  if (!source || ['csystem', 'system', 'main system'].includes(normalized)) {
    return { label: 'Csystem', type: 'system', source };
  }
  return { label: source, type: 'custom', source };
}
