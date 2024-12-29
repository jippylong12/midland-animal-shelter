// src/components/PaginationControls.tsx

import React from 'react';
import { Box, Pagination } from '@mui/material';

interface PaginationControlsProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ totalPages, currentPage, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <Pagination
                count={totalPages}
                page={currentPage}
                onChange={onPageChange}
                color="primary"
                shape="rounded"
                siblingCount={1}
                boundaryCount={1}
            />
        </Box>
    );
};

export default PaginationControls;