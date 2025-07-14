import { Box, Button, Typography } from "@mui/material";
import { Save } from "lucide-react";
import { SxProps, Theme } from "@mui/system";
import { useEffect, useState } from "react";
import { Save as SaveIcon } from "lucide-react";

interface Props {
    isSubmitting: boolean;
    isDirty?: boolean;
    successMessage: string;
    triggerSuccess: boolean;
    sx?: SxProps<Theme>;
    onFadeOut?: () => void;
}

const SaveButton = ({
    isSubmitting,
    isDirty,
    successMessage,
    triggerSuccess,
    sx,
    onFadeOut,
}: Props) => {
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
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", sm: "flex-end" },
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
                    mt: 4,
                    mb: 0,
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
                Speichern
                <Box component="span" sx={{ ml: 1 }}>
                    <SaveIcon className="icon" width={16} height={16} />
                </Box>
            </Button>

            {(visible || fadeOut) ? (
                <Box
                    sx={{
                        opacity: visible ? 1 : 0,
                        transition: "opacity 1.5s ease",
                        height: "auto",
                        mt: 0,
                        ml: { xs: 0, sm: 2 },
                    }}
                    onTransitionEnd={() => {
                        if (!visible) {
                            setFadeOut(false);
                        }
                    }}
                >
                    <Typography color="secondary">{successMessage}</Typography>
                </Box>
            ) : (<Box>&nbsp;</Box>)}
        </Box>
    );
};

export default SaveButton;
