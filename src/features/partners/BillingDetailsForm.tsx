import { Box, Button, Grid2, SxProps, TextField, Theme, Typography } from "@mui/material";
import { useForm, Controller, FormProvider } from "react-hook-form";
import ImageUploadField from "./ImageUploadField";
import { BillingDetails, createEmptyBillingDetails } from "@/models/BillingDetails";
import { fetchCompanyById, updateBillingDetails } from "@/services/partnerService";
import { useAuthContext } from "@/auth/AuthContext";
import useStore from '@/stores/partnerStore';
import { useEffect, useState } from "react";
import { uploadFile } from "@/utils/fileUtil";
import { Save } from "lucide-react";

interface Props {
    sx?: SxProps<Theme>;
}

const BillingDetailsForm = ({ sx, }: Props) => {
    const { authUser } = useAuthContext();
    const { partnerUser } = useStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm<BillingDetails>({
        defaultValues: createEmptyBillingDetails(),
    });

    const { handleSubmit, control } = methods;

    const onSubmit = async (data: any) => {
        if (!authUser?.idToken || !partnerUser?.companyId) return;
        const sendableData = {
            ...data,
            logo: data.logo?.name
                ? data.logo.name
                : data.logo ?? undefined
        } as BillingDetails;
        console.log("send data:", data);
        await updateBillingDetails(
            authUser.idToken,
            partnerUser.companyId,
            sendableData,
            async (responseData: any) => {
                console.log("responseData:", responseData);
                if (responseData.logoUploadUrl && data.logo) {
                    await uploadFile(responseData.logoUploadUrl, data.logo);
                }
            },
        );
    };

    const fields: { name: keyof BillingDetails; label: string }[] = [
        { name: "invoiceHeader", label: "Kopftext" },
        { name: "invoiceFooter", label: "Fusstext" },
        { name: "bankName", label: "Bank" },
        { name: "accountNumber", label: "Kto-Nr." },
        { name: "bankCode", label: "BLZ" },
        { name: "iban", label: "IBAN" },
        { name: "bic", label: "BIC" }
    ];

    useEffect(() => {
        const fetchBillingDetails = async (companyId: number) => {
            const response = await fetchCompanyById(companyId, null, null);
            if (response &&
                response.response.ok &&
                response.result.billingDetails
            ) {
                methods.reset(response.result.billingDetails as BillingDetails);
            }
        }
        if (partnerUser?.companyId) {
            fetchBillingDetails(partnerUser.companyId);
        }
    }, [partnerUser]);

    return (
        <Box sx={sx}>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: "100%", mb: 2 }}>
                            <Grid2 size={{ xs: 12, md: 2 }}>
                                <Typography variant="label">Logo</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 10 }}>
                                <ImageUploadField name="logo" maxImageHeight={150} />
                            </Grid2>
                        </Grid2>
                        {fields.map((field, index) => (
                            <>
                                {index === 2 &&
                                    <Typography variant="h5" sx={{ mt: 2 }}>Bankdaten (Footer)</Typography>}
                                <Grid2 container key={index} alignItems="top" rowSpacing={0} sx={{ width: "100%" }}>
                                    <Grid2 size={{ xs: 12, md: 2 }}>
                                        <Typography variant="label">{field.label}</Typography>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, md: 10 }}>
                                        <Controller
                                            key={field.name}
                                            name={field.name}
                                            control={control}
                                            defaultValue=""
                                            render={({ field: controllerField, fieldState }) => (
                                                <TextField
                                                    {...controllerField}
                                                    //label={field.label}
                                                    placeholder={field.label}
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                    fullWidth
                                                    multiline={field.name.includes("invoice")}
                                                    minRows={field.name.includes("invoice") ? 3 : undefined}
                                                />
                                            )}
                                        />
                                    </Grid2>
                                </Grid2>
                            </>
                        ))}

                        <Grid2 size={{ xs: 12 }} display={"flex"} gap={2} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={isSubmitting}
                                sx={{
                                    lineHeight: 0,
                                    outline: '3px solid transparent',
                                    mt: 4,
                                    mb: 1,
                                    '&:hover': {
                                        outline: '3px solid #00000033',
                                    },
                                    '.icon': {
                                        color: '#ffffff',
                                    },
                                    '&:hover .icon': {
                                        color: '#ffffff',
                                    },
                                }}
                            >
                                {"Speichern"}
                                <Box component="span" sx={{ ml: 1 }}>
                                    <Save className="icon" width={16} height={16} />
                                </Box>
                            </Button>
                        </Grid2>
                    </Box>
                </form>
            </FormProvider>
        </Box >
    );
};

export default BillingDetailsForm;
