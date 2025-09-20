'use client'

import { ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
  onClose: () => void
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={{ float: 'right' }}>x</button>
        {children}
      </div>
    </div>
  )
}

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
}

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '1rem',
  borderRadius: '8px',
  minWidth: '300px',
  position: 'relative',
}