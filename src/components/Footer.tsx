// src/components/Footer.tsx

import React from 'react';
import { Box, Typography, Link, Container, Stack, Divider } from '@mui/material';
import { APP_VERSION } from '../version';

type FooterProps = {
    showDataFreshness?: boolean;
    freshnessText?: string;
    isFreshnessStale?: boolean;
    isOfflineData?: boolean;
};

const Footer: React.FC<FooterProps> = ({
    showDataFreshness = false,
    freshnessText,
    isFreshnessStale = false,
    isOfflineData = false,
}) => (
    <Box
        id="disclaimer"
        component="footer"
        data-ga-section="footer"
        sx={{
            mt: 5,
            py: { xs: 3, md: 4 },
            background: 'linear-gradient(180deg, rgba(229, 241, 226, 0.95) 0%, rgba(238, 246, 235, 0.98) 100%)',
            borderTop: '1px solid rgba(47, 125, 50, 0.15)',
        }}
    >
        <Container maxWidth="lg">
            <Stack spacing={1.6} sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                {showDataFreshness && freshnessText ? (
                    <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.4 }}>
                            Data freshness
                        </Typography>
                        <Typography variant="caption" color={isFreshnessStale ? 'warning.main' : 'text.secondary'}>
                            {freshnessText}
                        </Typography>
                        {isFreshnessStale ? (
                            <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.4 }}>
                                Data may be stale due to delayed API responses.
                            </Typography>
                        ) : null}
                        {isOfflineData ? (
                            <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.4 }}>
                                Offline mode: browsing cached list data in read-only mode.
                            </Typography>
                        ) : null}
                    </Box>
                ) : null}

                <Divider sx={{ borderColor: 'rgba(47, 125, 50, 0.08)' }} />

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
                        data-ga-section="footer"
                        data-ga-kind="official_listing"
                        data-ga-item="city_midland_shelter_listing"
                        data-ga-label="Animals Currently in the Shelter"
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

export default Footer;
