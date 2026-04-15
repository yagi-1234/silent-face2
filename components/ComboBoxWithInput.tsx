'use client'

import { useEffect, useRef, useState } from 'react'

export type ComboBoxOption = {
  key: string,
  value: string
}

type ComboBoxWithInputProps = {
  options: ComboBoxOption[],
  value: string,
  onChange: (value: string) => void
  onCommit?: (value: string) => void
}

const ComboBoxWithInput: React.FC<ComboBoxWithInputProps> = ({ options, value, onChange, onCommit }) => {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // const filteredOptions = options.filter(opt => opt.value.toLowerCase().includes(inputValue.toLowerCase()))
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => { document.removeEventListener('mousedown', handleClickOutside)}
  }, [])

  useEffect(() => {
    setInputValue(value)
  }, [value])

  return (
    <div ref={wrapperRef} className="relative inline-block w-24">
      <input
          type="number"
          className="border p-2 w-full numeric-field"
          value={inputValue}
          onClick={() => setIsOpen(true)}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            const val = e.target.value
            setInputValue(val)
            onChange(val)
            setIsOpen(true)
          }} 
          onBlur={() => {
            setIsOpen(false)
            onCommit?.(inputValue)
          }} />
      {isOpen && options.length > 0 && (
        <ul className="absolute z-10 w-120 border bg-white max-h-40 overflow-auto">
          {options.map(option => (
            <li key={option.key}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onMouseDown={() => {
                  setInputValue(option.key)
                  onChange(option.key)
                  onCommit?.(option.key)
                  setIsOpen(false)
                }} >
              {option.key + ' : ' + option.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ComboBoxWithInput