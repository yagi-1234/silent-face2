import React from 'react'

type SelectButtonProps = {
  selectedItem: string,
  selection: { [key: string]: string | '' },
  onChange: (value: string) => void
}

const SelectButton: React.FC<SelectButtonProps> = ({
  selectedItem,
  selection,
  onChange,
}) => {
  return (
    <div >
      {Object.entries(selection)
          .map(([key, label]) => (
        <>
          <button
              key={key}
              className={selectedItem === key ? "bg-blue-400 broder border-blue-400 rounded-sm px-4 py-0.5 mr-2 text-white" : "bg-blue-50 border border-blue-400 rounded-sm px-4 py-0.5 mr-2"}
              onClick={() => onChange(key)}>
            {label}
          </button>
        </>
      ))}
    </div>
  )
}

export default React.memo(SelectButton)