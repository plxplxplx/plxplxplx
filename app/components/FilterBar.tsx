'use client'
import React from 'react'

type Props = {
  onToggleUpcoming: (v: boolean) => void
  showUpcoming: boolean
}

export default function FilterBar({ onToggleUpcoming, showUpcoming }: Props) {
  return (
    <div className="mb-4 flex items-center space-x-2">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={showUpcoming}
          onChange={e => onToggleUpcoming(e.target.checked)}
          className="mr-2"
        />
        Visa bara kommande
      </label>
    </div>
  )
}
