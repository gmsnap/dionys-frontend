import React from "react";
import { Controller, Control } from "react-hook-form";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill (for Next.js compatibility)
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
                <div>
                    <ReactQuill
                        {...field}
                        theme="snow"
                        onChange={field.onChange}
                        value={field.value || ""}
                    />
                    {error && <p style={{ color: "red" }}>{error}</p>}
                </div>
            )}
        />
    );
};

export default RichTextField;
