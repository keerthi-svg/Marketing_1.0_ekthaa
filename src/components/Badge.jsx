// Badge.jsx – elegant capsule badges for editorial design
import React from 'react';

const presets = {
  trending: {
    bg:     'rgba(170,132,114,0.08)',
    color:  'var(--color-primary)',
    border: 'rgba(170,132,114,0.22)',
    label:  '✦ Trending',
  },
  top: {
    bg:     'rgba(196,155,135,0.08)',
    color:  'var(--p-brown-2)',
    border: 'rgba(196,155,135,0.22)',
    label:  '✶ Top Post',
  },
  new: {
    bg:     'rgba(206,177,163,0.08)',
    color:  'var(--p-brown-3)',
    border: 'rgba(206,177,163,0.22)',
    label:  '✧ New',
  },
};

export default function Badge({ variant = 'trending', label, style = {} }) {
  const preset = presets[variant] || presets.trending;
  const text   = label || preset.label;

  return (
    <span
      className="badge"
      style={{
        background: preset.bg,
        color:      preset.color,
        border:     `1px solid ${preset.border}`,
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
    >
      {text}
    </span>
  );
}
