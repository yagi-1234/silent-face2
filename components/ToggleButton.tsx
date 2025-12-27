'use client'

export const ToggleButton = ({ name, title, checked, onChange } : {
  name: string
  title: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only" />
    <div className={`w-11 h-6 rounded-full border transition ${checked ? "bg-blue-500" : "bg-gray-300"}`}>
      <div className={`w-5 h-5 bg-white rounded-full shdow transition translate-y-0 ${checked ? 'translate-x-5' : 'translate-0.5'}`} />
    </div>
    <span className="text-sm">{title}</span>
  </label>
)