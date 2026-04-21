import { useState, useEffect } from 'react'

export function useVideoLibrary(filters) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true)
      const params = new URLSearchParams(filters)
      const res = await fetch(`/api/admin/videos?${params}`)
      const data = await res.json()
      setVideos(data.videos || [])
      setTotal(data.count || 0)
      setLoading(false)
    }
    fetchVideos()
  }, [JSON.stringify(filters)])

  const addVideo = async (videoData) => {
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(videoData)
    })
    const data = await res.json()
    if (data.success) {
      setVideos(prev => [...prev, data.video])
      setTotal(prev => prev + 1)
    }
    return data
  }

  const updateVideo = async (videoId, updates) => {
    const res = await fetch('/api/admin/videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, updates })
    })
    const data = await res.json()
    if (data.success) {
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, ...updates } : v))
    }
    return data
  }

  const deleteVideo = async (videoId) => {
    const res = await fetch('/api/admin/videos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId })
    })
    const data = await res.json()
    if (data.success) {
      setVideos(prev => prev.filter(v => v.id !== videoId))
      setTotal(prev => prev - 1)
    }
    return data
  }

  return { videos, loading, total, addVideo, updateVideo, deleteVideo }
}

export function useQuestionBank(testId) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!testId) return
    async function fetchQuestions() {
      setLoading(true)
      const res = await fetch(`/api/admin/questions?testId=${testId}`)
      const data = await res.json()
      setQuestions(data.questions || [])
      setLoading(false)
    }
    fetchQuestions()
  }, [testId])

  const addQuestion = async (questionData) => {
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId, questionData })
    })
    const data = await res.json()
    if (data.success) {
      setQuestions(prev => [...prev, data.question])
    }
    return data
  }

  const updateQuestion = async (questionId, updates) => {
    const res = await fetch('/api/admin/questions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, updates })
    })
    const data = await res.json()
    if (data.success) {
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, ...updates } : q))
    }
    return data
  }

  const deleteQuestion = async (questionId) => {
    const res = await fetch('/api/admin/questions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId })
    })
    const data = await res.json()
    if (data.success) {
      setQuestions(prev => prev.filter(q => q.id !== questionId))
    }
    return data
  }

  const generateWithAI = async (topicTitle, difficulty, count) => {
    const res = await fetch('/api/admin/questions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId, topicTitle, difficulty, count })
    })
    return await res.json()
  }

  const questionsByDifficulty = {
    easy: questions.filter(q => q.difficulty === 'easy'),
    medium: questions.filter(q => q.difficulty === 'medium'),
    hard: questions.filter(q => q.difficulty === 'hard'),
  }

  return { questions, questionsByDifficulty, loading, addQuestion, updateQuestion, deleteQuestion, generateWithAI }
}
