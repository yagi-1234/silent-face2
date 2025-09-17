'use client'

import React from 'react'

import { Check, X } from 'lucide-react'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'

const ConfirmModal = () => {
    const {
        isModalOpen,
        modalMessage,
        onModalConfirm,
        onModalCancel
    } = useConfirmModal()

    if (!isModalOpen) return null
    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <p className="text-lg text-gray-800 mb-6">{modalMessage}</p>
                <div className="flex justify-end gap-4">
                    <button className="button-back"
                            onClick={onModalCancel}>
                        <X size={16} />
                    </button>
                    <button className="button-save"
                            onClick={onModalConfirm}>
                        <Check size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal