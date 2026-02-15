// src/components/Footer.tsx

import React from 'react';
import { Box, Typography, Link, Container, Stack } from '@mui/material';
import { APP_VERSION } from '../version';

const Footer: React.FC = () => {
    return (
        <Box
            id="disclaimer"
            component="footer"
            sx={{
                mt: 5,
                py: { xs: 3, md: 4 },
                background: 'linear-gradient(180deg, rgba(229, 241, 226, 0.95) 0%, rgba(238, 246, 235, 0.98) 100%)',
                borderTop: '1px solid rgba(47, 125, 50, 0.15)',
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={1.2} sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                    <Typography variant="subtitle2" sx={{ letterSpacing: '0.03em' }}>
                        Disclaimer
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        This project is an independent convenience tool and is not affiliated with or endorsed by the City of Midland.
                        We do our best to keep listings accurate, but shelter data can change quickly.
                        Confirm final availability with the official city listing:
                        {' '}
                        <Link
                            href="https://www.midlandtexas.gov/1030/Animals-currently-in-the-Shelter"
                            target="_blank"
                            rel="noopener"
                        >
                            Animals Currently in the Shelter
                        </Link>
                        .
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        v{APP_VERSION}
                    </Typography>
                </Stack>
            </Container>
        </Box>
    );
};

export default Footer;
