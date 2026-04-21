export function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/v\/)([^&\n?#]+)/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getThumbnailUrl(videoId, quality='hq') {
  if (!videoId) return '';
  const qualities = {
    'default': 'default',
    'mq': 'mqdefault',
    'hq': 'hqdefault',
    'sd': 'sddefault',
    'maxres': 'maxresdefault'
  }
  return `https://img.youtube.com/vi/${videoId}/${qualities[quality] || 'hqdefault'}.jpg`
}

export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0 min"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) return `${mins} min`
  return `${mins} min ${secs} sec`
}

export function getTimeRemaining(watchedSeconds, totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds)) return ''
  const remaining = totalSeconds - watchedSeconds
  if (remaining <= 0) return 'Complete!'
  const mins = Math.floor(remaining / 60)
  if (mins === 0) return 'Less than 1 min left'
  return `${mins} min remaining`
}