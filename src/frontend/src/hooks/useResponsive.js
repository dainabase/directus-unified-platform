import { useState, useEffect } from 'react'

const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
}

export function useResponsive() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)

  useEffect(() => {
    let timeout
    const handleResize = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => setWidth(window.innerWidth), 100)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return {
    width,
    isMobile: width < BREAKPOINTS.mobile,
    isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.laptop,
    isLaptop: width >= BREAKPOINTS.laptop && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
    isMobileOrTablet: width < BREAKPOINTS.laptop,
    breakpoint: width < BREAKPOINTS.mobile ? 'mobile'
      : width < BREAKPOINTS.tablet ? 'tablet'
      : width < BREAKPOINTS.laptop ? 'laptop'
      : 'desktop',
  }
}

export default useResponsive
