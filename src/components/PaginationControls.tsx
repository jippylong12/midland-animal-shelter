// src/components/PaginationControls.tsx

import React from 'react';
import { Box, Pagination, Paper, Typography } from '@mui/material';

interface PaginationControlsProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ totalPages, currentPage, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper sx={{ py: 1.5, px: 2, display: 'inline-flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Page {currentPage} of {totalPages}
                </Typography>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={onPageChange}
                    color="primary"
                    shape="rounded"
                    siblingCount={1}
                    boundaryCount={1}
                />
            </Paper>
        </Box>
    );
};

export default PaginationControls;
