import React from 'react';
import { LogOut } from 'lucide-react';

import { useLogoff } from '@/utils/navigationUtils'

export const LogoffButton = () => {
  const { handleLogoff } = useLogoff()

  return (
    <div className="justify-end">
      <button className="button-normal w-16 h-6"
          onClick={() => handleLogoff()}>
        <LogOut size={16} />
      </button>
    </div>
  );
};
