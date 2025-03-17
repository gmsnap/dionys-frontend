import { useEffect, useRef, useState } from "react";
import theme from "@/theme";
import { Box, IconButton, Link, SxProps, Theme, Tooltip, Typography } from "@mui/material";
import { Clipboard, ClipboardCheck, SquareArrowOutUpRight } from "lucide-react";

interface Props {
    idCode: string;
    sx?: SxProps<Theme>;
}

const LocationEmbedCode = ({ idCode, sx }: Props) => {
    const [copied, setCopied] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [domain, setDomain] = useState<string | null>(null);

    const copyToClipboard = () => {
        if (contentRef.current) {
            const textToCopy = contentRef.current.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    useEffect(() => {
        setDomain(window.location.hostname);
    }, []);

    return (
        <Box
            sx={{
                mt: 5,
                mb: 4,
                ...sx,
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    color: 'primary.main',
                    mb: 1,
                }}>
                Einbettung dieser Location
            </Typography>

            <Link
                href={`${process.env.NEXT_PUBLIC_EMBED_PREVIEW_URL}/index.html?code=${idCode}`}
                target="_blank"
                variant="body2"
                sx={{
                    fontSize: '14px',
                    color: theme.palette.customColors.blue.main,
                }}
            > {'Vorschau der Einbettung '}
                <SquareArrowOutUpRight
                    size={16}
                    color={theme.palette.customColors.blue.main} />
            </Link>

            <Typography variant="body2"
                sx={{
                    color: 'primary.main',
                    mt: 2,
                }}>
                Um Ihren Kunden die Möglichkeit zu bieten,
                eine Angebotsanfrage für diese Location über Ihre Website zu stellen,
                kopieren und fügen Sie den folgenden Code in Ihre Website ein:
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                    <IconButton
                        onClick={copyToClipboard}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            color: '#555',
                        }}
                    >
                        {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                    </IconButton>
                </Tooltip>
                <Typography
                    ref={contentRef}
                    sx={{
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#555',
                        padding: 2,
                        border: '1px solid #ddd',
                        overflowX: 'auto',
                        overflowWrap: 'anywhere',
                        borderRadius: '4px',
                    }}
                >
                    &lt;div id=&quot;configurator-container&quot;&gt;&lt;/div&gt;
                    <br />
                    &lt;script src=&quot;https://{domain}/assets/embed.js?code={idCode}&quot;&gt;&lt;/script&gt;
                </Typography>
            </Box>
        </Box>
    );
}

export default LocationEmbedCode;