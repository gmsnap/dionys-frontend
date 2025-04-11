import React from "react";
import { Controller, Control } from "react-hook-form";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { Box, Typography } from "@mui/material";

// Dynamically import ReactQuill for SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface RichTextFieldProps {
    name: string;
    control: Control<any>;
    error?: string;
}

const RichTextField: React.FC<RichTextFieldProps> = ({ name, control, error }) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <Box>
                    <Box
                        sx={{
                            height: 250,
                            overflowY: "auto",
                            resize: "vertical",
                            border: "1px solid",
                            borderColor: "grey.300",
                            borderRadius: 2,
                            "& .ql-container": {
                                minHeight: 150,
                                height: "auto !important",
                            },
                            "& .ql-toolbar": {
                                position: "sticky",
                                top: 0,
                                backgroundColor: "white",
                                zIndex: 1,
                            },
                        }}
                    >
                        <ReactQuill
                            {...field}
                            theme="snow"
                            onChange={field.onChange}
                            value={field.value || ""}
                        />
                    </Box>
                    {error && (
                        <Typography variant="body2" color="error" mt={1}>
                            {error}
                        </Typography>
                    )}
                </Box>
            )}
        />
    );
};

export default RichTextField;
