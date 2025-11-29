// src/components/Footer.tsx

import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { APP_VERSION } from '../version';

const Footer: React.FC = () => {
    return (
        <Box
            id="disclaimer"
            component="footer"
            sx={{
                backgroundColor: 'grey.200',
                padding: 2,
                textAlign: 'center',
            }}
        >
            <Typography variant="caption" color="text.secondary">
                Disclaimer: The information provided on this website is for informational purposes only. We are not affiliated with or endorsed by the City of Midland, nor are we attempting to impersonate them. While we strive to keep the information accurate and up to date, we make no representations or warranties of any kind, express or implied, about the accuracy, reliability, or completeness of the information. We are not liable for any inaccuracies, lost time, or other consequences arising from reliance on this information. For official and up-to-date details, please refer to the City of Midland's Animals Currently in the Shelter webpage:{' '}
                <Link
                    href="https://www.midlandtexas.gov/1030/Animals-currently-in-the-Shelter"
                    target="_blank"
                    rel="noopener"
                >
                    https://www.midlandtexas.gov/1030/Animals-currently-in-the-Shelter
                </Link>
                .
            </Typography>
            <Typography variant="caption" display="block" sx={{ marginTop: 1 }}>
                v{APP_VERSION}
            </Typography>
        </Box>
    );
};

export default Footer;