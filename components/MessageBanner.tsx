import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { ValidationErrors } from '@/types/common/common-types'

type Props = {
    message: string
    type?: 'success' | 'error' | 'warn' | 'info'
    errors: ValidationErrors | ''
    onClose?: () => void
}

const getColorClassess = (type: string) => {
    switch (type) {
        case 'success': return 'bg-green-100 text-green-800 border-green-300'
        case 'error': return 'bg-red-100 text-red-800 border-red-300'
        case 'warn': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
        case 'info':
        default:
            return 'bg-blue-100 text-blue-800 border-blue-300'
    }
}

const MessageBanner: React.FC<Props> = ({
    message,
    type = 'Info',
    errors,
    onClose,
}) => {
    const pathname = usePathname()
    useEffect(() => {
        if (onClose) {
            onClose()
        }
    }, [pathname])
    if (!message) return null
    return (
        <div className={`border p-3 rounded-md mb-4 ${getColorClassess(type)} relative`}>
            {message}
            {Object.entries(errors).map(([field, message]) =>
                <li key={field}>{message}</li>
            )}
            {onClose && (
                <button
                        onClick={onClose}
                        className="absolute top-1 right-2 text-sm text-gray-500 hover:text-gray-800" >
                            ✕
                        </button>
            )}
        </div>
    )
}

export default MessageBanner