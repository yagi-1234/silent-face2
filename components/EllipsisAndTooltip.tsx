import React from 'react';

import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { ellipsis, isEllipsed } from '@/utils/viewUtils'

export const EllipsisAndTooltip = (value: string, maxLength: number) => {
  if (!value) return null
  return isEllipsed(value, maxLength) ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{ellipsis(value, maxLength)}</div>
        </TooltipTrigger>
        <TooltipContent>{value}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <div>{value}</div>
  )
}
