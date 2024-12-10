import theme from "@/theme";
import { Box, Button, Typography } from "@mui/material";
import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface ImageUploadFieldProps {
    name: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ name }) => {
    const { control, watch, formState: { errors } } = useFormContext();
    const [preview, setPreview] = useState<string | null>(null);

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

    const renderImage = (src: string) => (
        <Box
            component="img"
            src={src}
            alt="Location Bild"
            sx={{
                objectFit: 'cover',
                borderRadius: '16px',
                maxWidth: '100%',
            }}
        />
    );

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => (
                <>
                    {preview ? (
                        renderImage(preview)
                    ) : value && typeof value === 'string' ? (
                        renderImage(value)
                    ) : (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            sx={{
                                width: '100%',
                                height: '250px',
                                borderRadius: '16px',
                                backgroundColor: theme.palette.customColors.textBackround.halfdark,
                                mb: 2,
                            }}
                        >
                            <ImageIcon size={80} />
                        </Box>
                    )}

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