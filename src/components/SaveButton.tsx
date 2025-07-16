import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import { useEffect, useState } from "react";
import { Save as SaveIcon } from "lucide-react";

interface Props {
    title?: string;
    isSubmitting: boolean;
    isDirty?: boolean;
    successMessage: string;
    triggerSuccess: boolean;
    messagePosition?: "right" | "bottom";
    sx?: SxProps<Theme>;
    onFadeOut?: () => void;
}

const SaveButton = ({
    title,
    isSubmitting,
    isDirty,
    successMessage,
    triggerSuccess,
    messagePosition,
    sx,
    onFadeOut,
}: Props) => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));
    const isBottom = messagePosition === "bottom" || isXs;
    const [visible, setVisible] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (triggerSuccess) {
            setVisible(true);

            // Let visible=true render first, then trigger fadeOut
            requestAnimationFrame(() => {
                setFadeOut(true);
            });

            setTimeout(() => {
                setVisible(false);
            }, 2500);

            // Optional: trigger parent callback
            onFadeOut?.();
        }
    }, [triggerSuccess]);

    return (
        <Box
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: isBottom ? "column" : "row",
                alignItems: isXs ? "center" : isBottom ? "flex-start" : "flex-end",
                ...sx,
            }}
        >
            <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting || isDirty === false}
                sx={{
                    lineHeight: 0,
                    outline: "3px solid transparent",
                    "&:hover": {
                        outline: "3px solid #00000033",
                    },
                    ".icon": {
                        color: "#ffffff",
                    },
                    "&:hover .icon": {
                        color: "#ffffff",
                    },
                    width: { xs: "100%", sm: "fit-content" },
                    ...sx,
                }}
            >
                {title || "Speichern"}
                <Box component="span" sx={{ ml: 1 }}>
                    <SaveIcon className="icon" width={16} height={16} />
                </Box>
            </Button>

            {isBottom ? (
                <Box
                    sx={{
                        position: "absolute",
                        top: "100%",
                        left: "0",
                        opacity: visible ? 1 : 0,
                        transition: "opacity 1.5s ease",
                        whiteSpace: "nowrap",
                        ml: 0,
                        mt: 1,
                    }}
                    onTransitionEnd={() => {
                        if (!visible) {
                            setFadeOut(false);
                        }
                    }}
                >
                    <Typography color="secondary">{successMessage}</Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        opacity: visible ? 1 : 0,
                        transition: "opacity 1.5s ease",
                        ml: 1,
                    }}
                    onTransitionEnd={() => {
                        if (!visible) {
                            setFadeOut(false);
                        }
                    }}
                >
                    <Typography color="secondary">{successMessage}</Typography>
                </Box>
            )
            }
        </Box>
    );
};

export default SaveButton;
