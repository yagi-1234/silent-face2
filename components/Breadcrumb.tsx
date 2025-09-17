import React from 'react';
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { useConfirmModal } from "@/contexts/ConfirmModalContext";
import { useHistory } from "@/contexts/HistoryContext";

export const Breadcrumb = () => {
  const router = useRouter();
  const { history, removeLastHistory } = useHistory()

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const handleClick = (index: number, path: string) => {
    // setModalMessage(
    //   "You have unsaved changes. Are you sure you want to leave this page?"
    // );
    removeLastHistory(index)
    router.push(path);
    // setConfirmHandler(() => {
    //   removeLastHistory(index)
    //   router.push(path);
    // });
    // setIsModalOpen(true);
  };

  return (
    <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center space-x-1">
        <li key="0" className="flex items-center">
          <button
              className="button-link"
              onClick={() => handleClick(0, "/home")}>
            Home
          </button>
        </li>
        <ChevronRight className="w-4 h-4 mx-1" />
        {history.map((item, index) => {
          const isLast = index === history.length - 1;
          return (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
              <button
                className="button-link"
                onClick={() => handleClick(index, item.path)}>
                {item.title}
              </button>
            </li>
          )
        })}

        {/* {items.map((item, index) => {
                    const isLast = index === items.length -1
                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
                            {item.href && !isLast ? (
                                <button className="button-link"
                                        onClick={handleClick}>
                                    {item.label}
                                </button>
                            ) : (
                                <span className="font-bold text-2xl">{item.label}</span>
                            )}
                        </li>
                    )
                })} */}
      </ol>
    </nav>
  );
};
