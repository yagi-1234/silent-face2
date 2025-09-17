import React from 'react'

type HiddenPanelProps = {
    isOpen: boolean,
    content: React.ReactNode
}

const HiddenPanel: React.FC<HiddenPanelProps> = ({
    isOpen,
    content
}) => {
    if (!isOpen) return null
    return (
        <div className='w-96'>
            <p>{content}</p>
        </div>
    )
}

export default HiddenPanel