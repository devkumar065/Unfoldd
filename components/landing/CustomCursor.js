'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const followerRef = useRef(null)

  useEffect(() => {
    // Only enable custom cursor on non-touch devices
    if (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches) {
      if (cursorRef.current) cursorRef.current.style.display = 'none'
      if (followerRef.current) followerRef.current.style.display = 'none'
      return
    }

    // Hide default cursor only when custom cursor is active
    document.documentElement.classList.add('custom-cursor-active')

    const cursor = cursorRef.current
    const follower = followerRef.current
    
    const setCursorX = gsap.quickSetter(cursor, "x", "px")
    const setCursorY = gsap.quickSetter(cursor, "y", "px")
    const setFollowerX = gsap.quickSetter(follower, "x", "px")
    const setFollowerY = gsap.quickSetter(follower, "y", "px")

    let mouseX = 0, mouseY = 0
    let followerX = 0, followerY = 0
    let cursorX = 0, cursorY = 0
    let rafId

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    document.addEventListener('mousemove', onMouseMove)

    function render() {
      // Faster tracking for main cursor
      cursorX += (mouseX - cursorX) * 0.5
      cursorY += (mouseY - cursorY) * 0.5
      setCursorX(cursorX)
      setCursorY(cursorY)

      // Smoother tracking for follower
      followerX += (mouseX - followerX) * 0.1
      followerY += (mouseY - followerY) * 0.1
      setFollowerX(followerX)
      setFollowerY(followerY)
      
      rafId = requestAnimationFrame(render)
    }
    rafId = requestAnimationFrame(render)

    const onMouseEnter = () => {
      gsap.to(cursor, { scale: 0, duration: 0.2 })
      gsap.to(follower, { 
        scale: 2.5, 
        backgroundColor: 'rgba(108,99,255,0.3)',
        border: '1px solid #6C63FF',
        duration: 0.3 
      })
    }

    const onMouseLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.2 })
      gsap.to(follower, { 
        scale: 1,
        backgroundColor: 'transparent',
        border: '1px solid rgba(108,99,255,0.5)',
        duration: 0.3 
      })
    }

    const updateHoverTargets = () => {
      const hoverTargets = document.querySelectorAll('a, button, input, select, [data-cursor="hover"]')
      hoverTargets.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnter)
        el.removeEventListener('mouseleave', onMouseLeave)
        el.addEventListener('mouseenter', onMouseEnter)
        el.addEventListener('mouseleave', onMouseLeave)
      })
    }

    updateHoverTargets()
    const interval = setInterval(updateHoverTargets, 1000)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      clearInterval(interval)
      cancelAnimationFrame(rafId)
      document.documentElement.classList.remove('custom-cursor-active')
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-purple-500 rounded-full z-[9999] pointer-events-none mix-blend-difference -ml-[5px] -mt-[5px]"
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full z-[9998] pointer-events-none -ml-5 -mt-5"
        style={{ border: '1px solid rgba(108,99,255,0.5)' }}
      />
    </>
  )
}
