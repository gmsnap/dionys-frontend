import { Box, Grid2, SxProps, TextField, Theme, Typography } from "@mui/material";
import { useForm, Controller, FormProvider } from "react-hook-form";
import ImageUploadField from "./ImageUploadField";
import {
    BillingDetails,
    billingDetailsValidationSchema,
    createEmptyBillingDetails
} from "@/models/BillingDetails";
import { fetchCompanyById, updateBillingDetails } from "@/services/partnerService";
import { useAuthContext } from "@/auth/AuthContext";
import useStore from '@/stores/partnerStore';
import { useEffect, useState } from "react";
import { uploadFile } from "@/utils/fileUtil";
import SaveButton from "@/components/SaveButton";
import { yupResolver } from '@hookform/resolvers/yup';

interface Props {
    sx?: SxProps<Theme>;
}

const BillingDetailsForm = ({ sx, }: Props) => {
    const { authUser } = useAuthContext();
    const { partnerUser } = useStore();

    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm<BillingDetails>({
        defaultValues: createEmptyBillingDetails(),
        resolver: yupResolver(billingDetailsValidationSchema) as any,
    });

    const {
        handleSubmit,
        control,
        formState: { isDirty },
        reset,
    } = methods;

    const onSubmit = async (data: any) => {
        if (!authUser?.idToken || !partnerUser?.companyId) return;

        setErrorMsg(null);
        setIsSubmitting(true);

        const sendableData = {
            ...data,
            logo: data.logo?.name
                ? data.logo.name
                : data.logo ?? undefined
        } as BillingDetails;

        await updateBillingDetails(
            authUser.idToken,
            partnerUser.companyId,
            sendableData,
            async (responseData: any) => {
                if (responseData.logoUploadUrl && data.logo) {
                    await uploadFile(responseData.logoUploadUrl, data.logo);
                }

            },
            async (msg?: string) => {
                setErrorMsg(msg ?? "Fehler beim Speichern");
            },
        );

        //await new Promise(resolve => setTimeout(resolve, 5000));

        setIsSubmitting(false);
        setShowSuccess(true);
        reset(data);
        setTimeout(() => {
            setShowSuccess(false);
        }, 1500);
    };

    const fields: { name: keyof BillingDetails; label: string }[] = [
        { name: "invoiceHeader", label: "Kopftext" },
        { name: "invoiceFooter", label: "Fusstext" },
        { name: "bankName", label: "Bank" },
        { name: "accountNumber", label: "Kto-Nr." },
        { name: "bankCode", label: "BLZ" },
        { name: "iban", label: "IBAN" },
        { name: "bic", label: "BIC" },
        { name: "contactPerson", label: "Ansprechpartner" },
        { name: "legalLink", label: "Rechtl. Informationen (Link)" },
    ];

    useEffect(() => {
        const fetchBillingDetails = async (companyId: number) => {
            const response = await fetchCompanyById(companyId, null, null);
            if (response &&
                response.response.ok &&
                response.result.billingDetails
            ) {
                reset(response.result.billingDetails as BillingDetails);
            }
        }
        if (partnerUser?.companyId) {
            fetchBillingDetails(partnerUser.companyId);
        }
    }, [partnerUser]);

    return (
        <Box sx={{ mb: 5, ...sx }}>
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

                                {index === 7 &&
                                    <Typography variant="h5" sx={{ mt: 2 }}>Weitere Informationen (Footer)</Typography>}

                                <Grid2 container key={index} alignItems="top" rowSpacing={0} sx={{ width: "100%" }}>
                                    <Grid2 size={{ xs: 12, md: 4 }}>
                                        <Typography variant="label">{field.label}</Typography>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, md: 8 }}>
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

                        <SaveButton
                            isSubmitting={isSubmitting}
                            isDirty={isDirty}
                            successMessage={"PDF & Email Anpassungen gespeichert."}
                            triggerSuccess={showSuccess}
                            onFadeOut={() => setShowSuccess(false)} />
                    </Box>
                </form>
            </FormProvider>
        </Box >
    );
};

export default BillingDetailsForm;
