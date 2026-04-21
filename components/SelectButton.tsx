import React from 'react'

export type SelectButtonOption = {
  key: string,
  value: string
}

type SelectButtonProps = {
  options: SelectButtonOption[],
  value: string,
  onChange: (value: string) => void
}

const SelectButton: React.FC<SelectButtonProps> = ({ options, value, onChange }) => {
  return (
    <div>
      {options.map(option => (
        <>
          <button
              key={option.key}
              className={value === option.key ? "bg-blue-400 broder border-blue-400 rounded-sm px-4 py-0.5 mr-2 text-white" : "bg-blue-50 border border-blue-400 rounded-sm px-4 py-0.5 mr-2"}
              onClick={() => onChange(option.key)}>
            {option.value}
          </button>
        </>
      ))}
    </div>
  )
}

export default React.memo(SelectButton)