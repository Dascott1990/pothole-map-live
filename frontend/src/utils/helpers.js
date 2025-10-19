export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

export const getSeverityBadge = (severity) => {
  const severityStyles = {
    low: 'bg-success',
    medium: 'bg-warning',
    high: 'bg-danger'
  };
  return severityStyles[severity] || 'bg-secondary';
};

export const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 16 * 1024 * 1024; // 16MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 16MB.' };
  }

  return { valid: true };
};