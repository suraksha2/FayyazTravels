'use client'

import { useState } from 'react'

interface EnquiryModalData {
  packageName?: string
  packageType?: string
  destination?: string
}

export function useEnquiryModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalData, setModalData] = useState<EnquiryModalData>({})

  const openModal = (data: EnquiryModalData = {}) => {
    setModalData(data)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setModalData({})
  }

  return {
    isOpen,
    modalData,
    openModal,
    closeModal
  }
}
