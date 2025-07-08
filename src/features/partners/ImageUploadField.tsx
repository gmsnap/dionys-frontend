import theme from "@/theme";
import { Box, Button, Typography } from "@mui/material";
import { ImageIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface ImageUploadFieldProps {
    name: string;
    maxImageHeight?: number;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ name, maxImageHeight }) => {
    const { control, watch, formState: { errors } } = useFormContext();
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const imageValue = watch(name);

    useEffect(() => {
        if (imageValue instanceof File) {
            const objectUrl = URL.createObjectURL(imageValue);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (typeof imageValue === 'string' && imageValue) {
            setPreview(imageValue);
        } else {
            setPreview(null);
        }
    }, [imageValue]);

    const renderImage = (src: string) =>
        maxImageHeight ? (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                    height: maxImageHeight,
                    maxWidth: "100%",
                    borderRadius: "16px",
                    pointerEvents: "none",
                }}
            >
                <Box
                    component="img"
                    src={src}
                    alt="Location Bild"
                    sx={{
                        objectFit: "cover",
                        maxWidth: "100%",
                        maxHeight: "100%",
                    }}
                />
            </Box>
        ) : (
            <Box
                component="img"
                src={src}
                alt="Location Bild"
                sx={{
                    objectFit: "cover",
                    borderRadius: "16px",
                    maxWidth: "100%",
                    pointerEvents: "none",
                }}
            />
        );

    const handleDrop = useCallback((
        e: React.DragEvent<HTMLDivElement>,
        onChange: (file: File | null) => void
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            onChange(file);
        }
    }, []);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => (
                <>
                    <Box
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "copy";
                        }}
                        onDragEnter={() => setIsDragging(true)}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => handleDrop(e, onChange)}
                        sx={{
                            width: '100%',
                            height: maxImageHeight,
                            borderRadius: '16px',
                            border: isDragging ? '2px dashed #aaa' : '2px dashed transparent',
                            backgroundColor: isDragging
                                ? theme.palette.customColors.textBackground.halfdark
                                : (
                                    !maxImageHeight && (preview || (value && typeof value === 'string'))
                                        ? "none"
                                        : theme.palette.customColors.textBackground.darker

                                ),
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 2,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s, border 0.2s',
                        }}
                    >
                        {preview ? (
                            renderImage(preview)
                        ) : value && typeof value === 'string' ? (
                            renderImage(value)
                        ) : (
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: maxImageHeight || 200,
                                pointerEvents: 'none',
                            }}>
                                <ImageIcon size={80} />
                            </Box>
                        )}
                    </Box>

                    <Box display="flex" justifyContent="flex-end">
                        <Button variant="contained" component="label">
                            {value ? 'Bild ersetzen' : 'Bild hochladen'}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    onChange(file);
                                }}
                            />
                        </Button>
                    </Box>

                    {errors[name] && (
                        <Typography color="error">
                            {errors[name]?.message as string}
                        </Typography>
                    )}
                </>
            )}
        />
    );
};

export default ImageUploadField;
