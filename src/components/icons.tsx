export function CloverIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M24 24c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10c0-5.5 4.5-10 10-10Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M24 24c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c0-5.5-4.5-10-10-10Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M24 24c4 2.5 6 8 13 10-7 2-12 0-13-10Z" fill="currentColor" opacity="0.6" />
      <circle cx="24" cy="24" r="2.5" fill="currentColor" />
    </svg>
  )
}

export function MangoIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M10 26c0-9 7-17 18-17 3 0 5 2 5 4 0 1.5-1 2-1 3.5 0 7-7 21-17 21-6 0-9-5.5-5-11.5Z"
        fill="currentColor"
      />
      <path d="M28 9c1.5-2 3.5-3 5.5-2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function ButterflyIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M24 20c-2-6-9-10-14-8-4 1.6-4 8 0 11 3.4 2.6 10 1 14-3Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M24 20c2-6 9-10 14-8 4 1.6 4 8 0 11-3.4 2.6-10 1-14-3Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M24 22c-1.5 3-6 7-9 8-3 1-3.5 5 0 6 3 1 8-2.5 9-6"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M24 22c1.5 3 6 7 9 8 3 1 3.5 5 0 6-3 1-8-2.5-9-6"
        fill="currentColor"
        opacity="0.6"
      />
      <rect x="23" y="18" width="2" height="16" rx="1" fill="currentColor" />
    </svg>
  )
}

export function PlusIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0 1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function WalletIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1h1a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="16.5" cy="13" r="1.3" fill="currentColor" />
    </svg>
  )
}
