import { Autocomplete, TextField, FormControl, FormHelperText, Typography, CircularProgress, Grid2, AutocompleteRenderInputParams, InputAdornment } from "@mui/material";
import { Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { AvailableCities } from "@/models/City";

const fetchCitySuggestions = async (query: string): Promise<string[]> => {
    if (!query?.trim()) return [];

    try {
        const encodedQuery = encodeURIComponent(query)
            .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16));
        const response = await fetch(`https://openplzapi.org/de/Localities?name=${encodedQuery}`);

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        if (!data) {
            return [];
        }

        // Extract unique city names
        const uniqueCities = Array.from(new Set(data.map((item: { name: string }) => item.name)));
        return uniqueCities as string[];
    } catch (error: any) {
        console.error("Error fetching city suggestions:", error);
        return [];
    }
};

const CityField = ({ fieldName, errorObject }: { fieldName: string; errorObject: any }) => {
    const [cityOptions, setCityOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (inputValue.length < 2) {
            setCityOptions([]);
            return;
        }

        let active = true;
        setLoading(true);

        fetchCitySuggestions(inputValue).then((results) => {
            if (active) {
                setCityOptions(results);
                setLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, [inputValue]);

    return (
        <>
            <Grid2 size={{ xs: 12, sm: 4 }}>
                <Typography variant="label">Stadt</Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 8 }}>
                <Controller
                    name={fieldName}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errorObject}>
                            <Autocomplete
                                freeSolo
                                disableClearable
                                options={cityOptions}
                                loading={loading}
                                value={AvailableCities.find((city) => city.value === field.value) || field.value}
                                inputValue={inputValue}
                                onInputChange={(_, value) => setInputValue(value)}
                                onChange={(_, newValue) => field.onChange(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...field}
                                        {...params}
                                        variant="outlined"
                                        error={!!errorObject}
                                    />
                                )}
                            />
                            {errorObject && <FormHelperText>{errorObject.message as string}</FormHelperText>}
                        </FormControl>
                    )}
                />
            </Grid2>
        </>
    );
};

export default CityField;
