import { useRouter } from "next/navigation"

import { LucideIcon } from "lucide-react"

type Props = {
  icon: LucideIcon
  label: string
  path: string
}

const HomeIconButton: React.FC<Props> = ({ icon: Icon, label, path }) => {
  const router = useRouter()
  const handleSelectMenu = () => {
    router.push(path)
  }
  return (
    <div className="text-center">
      <button className="p-2 hover:bg-gray-100"
          onClick={() => handleSelectMenu()}>
          <Icon className="homeIcon" />
      </button>
      <p className="text-lg">{label}</p>
    </div>
  )
}

export default HomeIconButton