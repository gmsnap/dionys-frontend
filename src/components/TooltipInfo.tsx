import React from "react"
import { Tooltip, Box, Typography } from "@mui/material"
import { CircleHelp } from "lucide-react"
import theme from "@/theme"

interface TooltipInfoProps {
    content: string
    label?: string
    iconSize?: number
    enterTouchDelay?: number
    leaveTouchDelay?: number
}

const TooltipInfo: React.FC<TooltipInfoProps> = ({
    content,
    label,
    iconSize = 24,
    enterTouchDelay = 0,
    leaveTouchDelay = 12000,
}) => {
    return (
        <Tooltip
            title={
                <Typography
                    variant="body1"
                    sx={{ whiteSpace: 'pre-line', fontSize: '13px' }}
                >
                    {content}
                </Typography>
            }
            arrow
            enterTouchDelay={enterTouchDelay}
            leaveTouchDelay={leaveTouchDelay}
        >
            <Box sx={{ display: 'flex', flexDirection: 'row', backgroundColor: 'transparent' }}>
                {label && <Typography sx={{ mr: 1 }}>{label}</Typography>}
                <CircleHelp
                    size={iconSize}
                    stroke="white"
                    fill={theme.palette.customColors.blue.main}
                />
            </Box>
        </Tooltip>
    )
}

export default TooltipInfo

