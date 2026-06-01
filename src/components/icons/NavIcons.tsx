import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function IconHome(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
      />
    </svg>
  )
}

export function IconDiscover(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconHeart(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5s-7-4.35-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.65-7 10-7 10Z"
      />
    </svg>
  )
}

export function IconUser(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" />
    </svg>
  )
}

export function IconArrowLeft(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18 9 12l6-6" />
    </svg>
  )
}

export function IconLeaf(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 20c6-1 10-6 10-12a8 8 0 0 0-8 8c6 0 11-4 12-10-4 0-10 6-14 14Z"
      />
    </svg>
  )
}

export function IconBag(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h12l1 12H5L6 8Z" />
      <path strokeLinecap="round" d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

export function IconMessage(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      />
    </svg>
  )
}

export function IconBell(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      />
      <path strokeLinecap="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
