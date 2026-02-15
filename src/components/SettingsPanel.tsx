import React from 'react';
import {
    Alert,
    Box,
    Button,
    Divider,
    FormControlLabel,
    Paper,
    Slider,
    Stack,
    AlertColor,
    Switch,
    Typography,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { PersonalFitPreferences, getAgePreferenceLabel, getSpecialNeedsPriorityLabel, getStagePriorityLabel } from '../utils/personalFitScoring';

interface SettingsTransferState {
    message: string;
    severity: AlertColor;
}

interface SettingsPanelProps {
    personalFitPreferences: PersonalFitPreferences;
    isPersonalFitEnabled: boolean;
    onPersonalFitPreferencesChange: (preferences: PersonalFitPreferences) => void;
    onResetPersonalFitPreferences: () => void;
    onTogglePersonalFitEnabled: () => void;
    isCompactCardView: boolean;
    onCompactCardViewChange: (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    newMatchCount: number;
    hasNewMatchHistory: boolean;
    onClearCurrentTabNewMatches: () => void;
    onClearAllNewMatches: () => void;
    onExportLocalAppState: () => void;
    onImportLocalAppState: (event: React.ChangeEvent<HTMLInputElement>) => void;
    transferState: SettingsTransferState | null;
    onClearTransferState: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    personalFitPreferences,
    isPersonalFitEnabled,
    onPersonalFitPreferencesChange,
    onResetPersonalFitPreferences,
    onTogglePersonalFitEnabled,
    isCompactCardView,
    onCompactCardViewChange,
    newMatchCount,
    hasNewMatchHistory,
    onClearCurrentTabNewMatches,
    onClearAllNewMatches,
    onExportLocalAppState,
    onImportLocalAppState,
    transferState,
    onClearTransferState,
}) => {
    return (
        <Paper sx={{ mb: 3, p: { xs: 2, md: 3 }, background: 'linear-gradient(120deg, rgba(230, 244, 227, 0.95) 0%, rgba(255, 247, 230, 0.9) 100%)' }}>
            <Stack direction="column" spacing={2.2}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={1}
                >
                    <Box>
                        <Typography variant="h6">Settings</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Personal settings are browser-local and do not affect server ranking.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={onClearAllNewMatches}
                            disabled={!hasNewMatchHistory}
                        >
                            Clear global new-match cache
                        </Button>
                    </Stack>
                </Stack>

                <Divider />

                <Stack spacing={1.2}>
                    <Box>
                        <Typography variant="h6">Local app state transfer</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Export favorites, seen history, saved presets, and checklist data to JSON, then import it on another browser.
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<CloudUploadIcon />}
                            onClick={onExportLocalAppState}
                        >
                            Export local app state
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            component="label"
                            startIcon={<CloudDownloadIcon />}
                        >
                            Import local app state
                            <input
                                type="file"
                                accept="application/json,.json"
                                onChange={onImportLocalAppState}
                                hidden
                                aria-label="Local app state import file"
                            />
                        </Button>
                    </Stack>

                    {transferState ? (
                        <Alert severity={transferState.severity} onClose={onClearTransferState}>
                            {transferState.message}
                        </Alert>
                    ) : null}
                </Stack>

                <Divider />

                <Stack spacing={1.2}>
                    <Box>
                        <Typography variant="h6">List density</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Compact mode compresses cards and increases desktop results per page.
                        </Typography>
                    </Box>

                    <FormControlLabel
                        control={(
                            <Switch
                                checked={isCompactCardView}
                                onChange={onCompactCardViewChange}
                                color="primary"
                            />
                        )}
                        label={isCompactCardView ? 'Compact card view enabled' : 'Compact card view'}
                    />
                    <Typography variant="body2" color="text.secondary">
                        This only changes UI density and does not affect filters, sorting, or favorites.
                    </Typography>
                </Stack>

                <Divider />

                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={1}
                    >
                        <Box>
                            <Typography variant="h6" component="h2">Personal fit scoring</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tune how your local ranking prefers older/younger, stage, and special-needs.
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                                This only reads listing fields from the shelter feed (Age, Stage, SpecialNeeds) and changes local ordering only.
                            </Typography>
                        </Box>
                        <FormControlLabel
                            control={(
                                <Switch
                                    checked={isPersonalFitEnabled}
                                    onChange={onTogglePersonalFitEnabled}
                                    color="primary"
                                />
                            )}
                            label={isPersonalFitEnabled ? 'Enabled' : 'Enable'}
                        />
                    </Stack>

                    {isPersonalFitEnabled ? (
                        <>
                            <Alert severity="info" variant="outlined">
                                Personal fit uses only listing fields already in the API payload (Age, Stage, SpecialNeeds)
                                and only changes local ordering.
                            </Alert>

                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'flex-start', md: 'center' }}
                                spacing={1}
                            >
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<RestartAltIcon />}
                                    onClick={onResetPersonalFitPreferences}
                                >
                                    Reset personal fit defaults
                                </Button>
                            </Stack>

                            <Box>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    spacing={0.5}
                                >
                                    <Typography variant="body2">
                                        Age profile: {getAgePreferenceLabel(personalFitPreferences.agePreference)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {personalFitPreferences.agePreference}
                                    </Typography>
                                </Stack>
                                <Slider
                                    value={personalFitPreferences.agePreference}
                                    onChange={(_, value) => onPersonalFitPreferencesChange({
                                        ...personalFitPreferences,
                                        agePreference: value as number,
                                    })}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={(value) => getAgePreferenceLabel(value as number)}
                                    getAriaValueText={(value) => getAgePreferenceLabel(value as number)}
                                    step={1}
                                    min={0}
                                    max={100}
                                    aria-label="Age profile"
                                />
                            </Box>

                            <Box>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    spacing={0.5}
                                >
                                    <Typography variant="body2">
                                        Stage preference: {getStagePriorityLabel(personalFitPreferences.stagePriority)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {personalFitPreferences.stagePriority}
                                    </Typography>
                                </Stack>
                                <Slider
                                    value={personalFitPreferences.stagePriority}
                                    onChange={(_, value) => onPersonalFitPreferencesChange({
                                        ...personalFitPreferences,
                                        stagePriority: value as number,
                                    })}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={100}
                                    step={1}
                                    aria-label="Stage preference"
                                />
                            </Box>

                            <Box>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    spacing={0.5}
                                >
                                    <Typography variant="body2">
                                        Special-needs preference: {getSpecialNeedsPriorityLabel(personalFitPreferences.specialNeedsPriority)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {personalFitPreferences.specialNeedsPriority}
                                    </Typography>
                                </Stack>
                                <Slider
                                    value={personalFitPreferences.specialNeedsPriority}
                                    onChange={(_, value) => onPersonalFitPreferencesChange({
                                        ...personalFitPreferences,
                                        specialNeedsPriority: value as number,
                                    })}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={100}
                                    step={1}
                                    aria-label="Special-needs preference"
                                />
                            </Box>
                        </>
                    ) : (
                        <Alert severity="warning" variant="outlined">
                            Personal fit scoring is currently off. Enable it here to apply these weights to score sorting.
                        </Alert>
                    )}
                </Stack>

                <Divider />

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                    flexWrap="wrap"
                >
                    <Typography variant="body2" color="text.secondary">
                        New-match data is tracked per tab for this device only.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={onClearCurrentTabNewMatches}
                        disabled={newMatchCount === 0}
                    >
                        Clear current tab new matches{newMatchCount > 0 ? ` (${newMatchCount})` : ''}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
};

export default SettingsPanel;
