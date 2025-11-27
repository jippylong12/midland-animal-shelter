import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface DisclaimerDialogProps {
    open: boolean;
    onAccept: () => void;
    onClose: () => void;
}

const DisclaimerDialog: React.FC<DisclaimerDialogProps> = ({ open, onAccept, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Favorites Feature</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    By using the favorites feature, you agree to store data locally on your device.
                </DialogContentText>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                    <li>Favorites are stored in your browser's Local Storage.</li>
                    <li>Favorites will expire after 7 days of inactivity.</li>
                    <li>Visiting the site will renew your favorites for another 7 days.</li>
                    <li>If a pet is no longer available, it will be automatically removed from your favorites.</li>
                </ul>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={onAccept} color="primary" autoFocus variant="contained">
                    I Understand
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DisclaimerDialog;
