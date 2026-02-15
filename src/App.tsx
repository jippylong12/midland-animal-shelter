// src/App.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { XMLParser } from 'fast-xml-parser';
import {
    AdoptableDetails,
    AdoptableSearch,
    Root,
} from './types';
import {
    SelectChangeEvent,
    useMediaQuery,
    Box,
    Container,
    Paper,
    Stack,
    Typography,
    Chip,
} from '@mui/material';

// MUI Icons
import PetsIcon from '@mui/icons-material/Pets';
import DogIcon from '@mui/icons-material/EmojiNature'; // Replace with appropriate icons
import CatIcon from '@mui/icons-material/Pets'; // Replace with appropriate icons
import SmallAnimalIcon from '@mui/icons-material/Pets'; // Replace with appropriate icons
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';

// Custom Components
import Header from './components/Header';
import Filters from './components/Filters';
import SettingsPanel from './components/SettingsPanel';
import PetList from './components/PetList';
import PetModal from './components/PetModal';
import Footer from './components/Footer';
import PaginationControls from './components/PaginationControls';
import DisclaimerDialog from './components/DisclaimerDialog';
import CompareTray from './components/CompareTray';
import { useFavorites } from './hooks/useFavorites';
import { useSeenPets } from './hooks/useSeenPets';
import { useAdoptionChecklist } from './hooks/useAdoptionChecklist';
import {
    clearSpeciesNewMatchHistory,
    computeNewMatches,
    getPetMatchKey,
    getSpeciesMatchKey,
    NEW_MATCH_STORAGE_KEY,
    readNewMatchStorage,
    writeNewMatchStorage,
} from './utils/newMatchTracker';
import {
    formatSyncAge,
    formatSyncTime,
    getSyncTimestampForTab,
    isDataStale,
    readPetListSyncState,
    writePetListSyncState,
} from './utils/dataFreshness';
import {
    createSearchPreset,
    readSearchPresets,
    SearchPreset,
    SearchPresetFilters,
    normalizeSearchPresetFilters,
    writeSearchPresets,
} from './utils/searchPresets';
import {
    buildPersonalFitScore,
    DEFAULT_PERSONAL_FIT_PREFERENCES,
    normalizePersonalFitPreferences,
    PersonalFitPreferences,
    readPersonalFitPreferences,
    readPersonalFitEnabled,
    writePersonalFitPreferences,
    writePersonalFitEnabled,
} from './utils/personalFitScoring';
import { createEmptyAdoptionChecklist } from './utils/adoptionChecklist';
import { readCachedPetList, writeCachedPetList } from './utils/offlineCache';
import {
    buildLocalAppStateExport,
    parseLocalAppStateImport,
} from './utils/localAppState';

const parser = new XMLParser();
type AppTabKind = 'fetch' | 'favorites' | 'settings';
type TransferStateSeverity = 'success' | 'error' | 'info' | 'warning';

type StateTransferStatus = {
    severity: TransferStateSeverity;
    message: string;
};
type AppTabConfig = {
    label: string;
    icon: JSX.Element;
    kind: AppTabKind;
    speciesId?: number;
};

const APP_TAB_CONFIG: AppTabConfig[] = [
    { label: 'All Pets', icon: <PetsIcon />, kind: 'fetch', speciesId: 0 },
    { label: 'Dogs', icon: <DogIcon />, kind: 'fetch', speciesId: 1 },
    { label: 'Cats', icon: <CatIcon />, kind: 'fetch', speciesId: 2 },
    { label: 'Small Animals', icon: <SmallAnimalIcon />, kind: 'fetch', speciesId: 1003 },
    { label: 'Favorites', icon: <StarIcon />, kind: 'favorites' },
    { label: 'Settings', icon: <SettingsIcon />, kind: 'settings' },
];
const SPECIES_LABEL_BY_ID: Record<number, string> = {
    1: 'Dog',
    2: 'Cat',
    1003: 'Small Animal',
};
const FAVORITES_TAB_INDEX = APP_TAB_CONFIG.findIndex((tab) => tab.kind === 'favorites');
const MAX_COMPARE_PETS = 3;

const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

const getComparePetKey = (pet: Pick<AdoptableSearch, 'Species' | 'ID'>) =>
    `${pet.Species.toLowerCase()}|${pet.ID}`;

const getTabSpeciesId = (selectedTab: number): number | null => {
    const tab = APP_TAB_CONFIG[selectedTab];
    if (!tab || tab.kind !== 'fetch') {
        return null;
    }

    return tab.speciesId ?? null;
};

const getTabSpeciesLabel = (selectedTab: number): string | null => {
    const speciesId = getTabSpeciesId(selectedTab);

    if (speciesId === null) {
        return null;
    }

    if (speciesId === 0) {
        return 'All';
    }

    return SPECIES_LABEL_BY_ID[speciesId] ?? null;
};

const getTabKind = (selectedTab: number): AppTabKind | null => {
    return APP_TAB_CONFIG[selectedTab]?.kind ?? null;
};

const readUploadedFileText = async (file: Blob): Promise<string> => {
    if (typeof file.text === 'function') {
        return file.text();
    }

    if (typeof file.arrayBuffer === 'function') {
        const encoded = await file.arrayBuffer();
        const decoder = new TextDecoder();
        return decoder.decode(encoded);
    }

    if (typeof FileReader !== 'function') {
        throw new Error('Unable to read selected file.');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
                return;
            }

            if (reader.result instanceof ArrayBuffer) {
                const decoder = new TextDecoder();
                resolve(decoder.decode(reader.result));
                return;
            }

            reject(new Error('Unable to read selected file.'));
        };

        reader.onerror = () => {
            reject(new Error('Unable to read selected file.'));
        };

        reader.readAsText(file);
    });
};

type AppUrlState = {
    selectedTab: number;
    searchQuery: string;
    breed: string[];
    gender: string;
    age: { min: string; max: string };
    stage: string;
    sortBy: AppSortBy;
    hideSeen: boolean;
    currentPage: number;
};

type AppSortBy = '' | 'breed' | 'age' | 'score';

const parseAgeFilterValue = (value: string | null) => {
    const trimmed = value?.trim() ?? '';
    return /^\d+$/.test(trimmed) ? trimmed : '';
};

const getUrlState = (): AppUrlState => {
    const searchParams = new URLSearchParams(window.location.search);
    const rawTab = Number(searchParams.get('tab'));
    const selectedTab = Number.isInteger(rawTab) && rawTab >= 0 && rawTab < APP_TAB_CONFIG.length
        ? rawTab
        : 0;

    const rawPage = Number(searchParams.get('page'));
    const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

    const rawBreed = searchParams.get('breed') ?? '';
    const breed = rawBreed
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    const rawGender = searchParams.get('gender');
    const gender = rawGender === 'Male' || rawGender === 'Female' ? rawGender : '';

    const rawSortBy = searchParams.get('sort');
    const sortBy = rawSortBy === 'breed' || rawSortBy === 'age' || rawSortBy === 'score'
        ? rawSortBy
        : '';

    const rawHideSeen = searchParams.get('hideSeen');
    const hideSeen = rawHideSeen === 'true' || rawHideSeen === '1';

    return {
        selectedTab,
        searchQuery: searchParams.get('q')?.trim() ?? '',
        breed,
        gender,
        age: {
            min: parseAgeFilterValue(searchParams.get('ageMin')),
            max: parseAgeFilterValue(searchParams.get('ageMax')),
        },
        stage: searchParams.get('stage')?.trim() ?? '',
        sortBy,
        hideSeen,
        currentPage,
    };
};

const buildUrlSearchParams = (state: AppUrlState) => {
    const params = new URLSearchParams();

    if (state.selectedTab !== 0) {
        params.set('tab', String(state.selectedTab));
    }
    if (state.searchQuery) {
        params.set('q', state.searchQuery);
    }
    if (state.breed.length > 0) {
        params.set('breed', state.breed.join(','));
    }
    if (state.gender) {
        params.set('gender', state.gender);
    }
    if (state.age.min) {
        params.set('ageMin', state.age.min);
    }
    if (state.age.max) {
        params.set('ageMax', state.age.max);
    }
    if (state.stage) {
        params.set('stage', state.stage);
    }
    if (state.sortBy) {
        params.set('sort', state.sortBy);
    }
    if (state.hideSeen) {
        params.set('hideSeen', 'true');
    }
    if (state.currentPage > 1) {
        params.set('page', String(state.currentPage));
    }

    return params;
};

function App() {
    const initialUrlState = getUrlState();

    // State for search query
    const [searchQuery, setSearchQuery] = useState(initialUrlState.searchQuery);

    // State for selected tab
    const [selectedTab, setSelectedTab] = useState<number>(initialUrlState.selectedTab);
    const tabLabels = APP_TAB_CONFIG.map(({ icon, label }) => ({ icon, label }));

    // States for filters
    const [breed, setBreed] = useState<string[]>(initialUrlState.breed); // Changed to array for multi-select
    const [gender, setGender] = useState(initialUrlState.gender);
    const [age, setAge] = useState<{ min: string; max: string }>(initialUrlState.age); // Changed to object for min/max
    const [stage, setStage] = useState(initialUrlState.stage); // New state for stage
    const [hideSeen, setHideSeen] = useState<boolean>(initialUrlState.hideSeen);

    // State for sorting
    const [sortBy, setSortBy] = useState<AppSortBy>(initialUrlState.sortBy); // '' means no sorting
    const [personalFitPreferences, setPersonalFitPreferences] = useState<PersonalFitPreferences>(() => (
        readPersonalFitPreferences()
    ));
    const [isPersonalFitEnabled, setIsPersonalFitEnabled] = useState<boolean>(() => (
        readPersonalFitEnabled()
    ));

    // State for pets data
    const [pets, setPets] = useState<AdoptableSearch[]>([]);
    const [newMatchPetIds, setNewMatchPetIds] = useState<Set<string>>(new Set());
    const [hasNewMatchHistory, setHasNewMatchHistory] = useState<boolean>(false);

    // State for loading and error
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [syncState, setSyncState] = useState<Record<number, number>>({});
    const [isOfflineListMode, setIsOfflineListMode] = useState<boolean>(false);

    const [searchPresets, setSearchPresets] = useState<SearchPreset[]>(() => readSearchPresets());
    const [stateTransferStatus, setStateTransferStatus] = useState<StateTransferStatus | null>(null);

    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedAnimalID, setSelectedAnimalID] = useState<number | null>(null);
    const [modalData, setModalData] = useState<AdoptableDetails | null>(null);
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [comparePets, setComparePets] = useState<AdoptableSearch[]>([]);

    // Pagination States
    const [currentPage, setCurrentPage] = useState<number>(initialUrlState.currentPage);
    const isMobile = useMediaQuery('(max-width:600px)');
    const itemsPerPage = isMobile ? 10 : 20; // Dynamically set items per page
    const skipPageReset = useRef(true);
    const isRestoringFromUrl = useRef(false);
    const petsTabRef = useRef<number>(initialUrlState.selectedTab);
    const isFetchingPets = useRef(false);
    const lastModalTriggerRef = useRef<HTMLElement | null>(null);

    // Favorites Hook
    const {
        favorites,
        toggleFavorite,
        isFavorite,
        isDisclaimerOpen,
        acceptDisclaimer,
        closeDisclaimer,
        checkAvailability,
        isDisclaimerAccepted,
        replaceFavorites,
        setDisclaimerAcceptance,
    } = useFavorites();

    // Seen Pets Hook
    const {
        seenPets,
        isSeenEnabled,
        toggleSeenFeature,
        markAsSeen,
        markAllAsSeen,
        isSeen,
        replaceSeenState,
        setSeenEnabled,
    } = useSeenPets();
    const {
        getChecklistForPet,
        setChecklistItem,
        setChecklistNotes,
        replaceChecklistStore,
        checklists: adoptionChecklistStore,
    } = useAdoptionChecklist();

    const isCompareLimitReached = comparePets.length >= MAX_COMPARE_PETS;
    const isInCompare = useCallback((pet: AdoptableSearch) => {
        const targetKey = getComparePetKey(pet);
        return comparePets.some((comparePet) => getComparePetKey(comparePet) === targetKey);
    }, [comparePets]);

    const toggleComparePet = useCallback((pet: AdoptableSearch) => {
        setComparePets((prev) => {
            const targetKey = getComparePetKey(pet);
            const currentIndex = prev.findIndex((comparePet) => getComparePetKey(comparePet) === targetKey);

            if (currentIndex >= 0) {
                return prev.filter((_, index) => index !== currentIndex);
            }

            if (prev.length >= MAX_COMPARE_PETS) {
                return prev;
            }

            return [...prev, pet];
        });
    }, []);

    const removeComparePet = useCallback((pet: AdoptableSearch) => {
        const targetKey = getComparePetKey(pet);
        setComparePets((prev) => prev.filter((comparePet) => getComparePetKey(comparePet) !== targetKey));
    }, []);

    const clearComparePets = useCallback(() => setComparePets([]), []);

    const getPetFromModalData = useCallback((details: AdoptableDetails | null) => {
        if (!details) return null;
        return {
            ...(details as unknown as AdoptableSearch),
            Name: details.AnimalName,
            Photo: details.Photo1,
        };
    }, []);

    // Handler functions
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        const previousTabKind = getTabKind(selectedTab);
        const nextTabKind = getTabKind(newValue);

        setSelectedTab(newValue);
        setIsOfflineListMode(false);

        if (previousTabKind === 'settings' || nextTabKind === 'settings') {
            return;
        }

        // Reset filters when switching listing tabs (optional)
        setBreed([]);
        setGender('');
        setAge({ min: '', max: '' });
        setStage('');
        setSortBy(''); // Reset sorting
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleBreedChange = (_: React.SyntheticEvent<Element, Event>, value: string[]) => {
        setBreed(value);
    };

    const handleGenderChange = (event: SelectChangeEvent<string>) => {
        setGender(event.target.value);
    };


    const handleAgeChange = (type: 'min' | 'max', value: string) => {
        setAge((prev) => ({ ...prev, [type]: value }));
    };

    const handleStageChange = (event: SelectChangeEvent<string>) => {
        setStage(event.target.value);
    };

    const handleSortByChange = (event: SelectChangeEvent<string>) => {
        const selectedSort = event.target.value as AppSortBy;
        setSortBy(selectedSort === 'score' && !isPersonalFitEnabled ? '' : selectedSort);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setBreed([]);
        setGender('');
        setAge({ min: '', max: '' });
        setStage('');
        setSortBy('');
        setHideSeen(false);
    };

    const handlePersonalFitPreferencesChange = (next: PersonalFitPreferences) => {
        const normalized = normalizePersonalFitPreferences(next);
        setPersonalFitPreferences(normalized);
        writePersonalFitPreferences(normalized);
    };

    const handleResetPersonalFitPreferences = () => {
        handlePersonalFitPreferencesChange(DEFAULT_PERSONAL_FIT_PREFERENCES);
    };

    const handlePersonalFitEnabledChange = () => {
        const nextEnabled = !isPersonalFitEnabled;
        setIsPersonalFitEnabled(nextEnabled);
        writePersonalFitEnabled(nextEnabled);
        if (!nextEnabled) {
            setSortBy('');
        }
    };

    const getCurrentPresetFilters = (): SearchPresetFilters => ({
        ...normalizeSearchPresetFilters({
            searchQuery,
            breed,
            gender,
            age,
            stage,
            sortBy,
            hideSeen,
        }),
    });

    const handleSaveSearchPreset = (presetName: string) => {
        const preset = createSearchPreset(presetName, selectedTab, getCurrentPresetFilters());
        if (!preset.name) return;

        setSearchPresets((prev) => {
            const normalizedName = preset.name.toLowerCase();
            const duplicateIndex = prev.findIndex((item) => item.name.toLowerCase() === normalizedName);
            const next = [...prev];

            if (duplicateIndex >= 0) {
                next[duplicateIndex] = {
                    ...next[duplicateIndex],
                    selectedTab: preset.selectedTab,
                    filters: preset.filters,
                };
            } else {
                next.unshift(preset);
            }

            writeSearchPresets(next);
            return next;
        });
    };

    const handleApplySearchPreset = (presetId: string) => {
        const preset = searchPresets.find((item) => item.id === presetId);
        if (!preset) return;

        setSelectedTab(preset.selectedTab);
        setSearchQuery(preset.filters.searchQuery);
        setBreed(preset.filters.breed);
        setGender(preset.filters.gender);
        setAge(preset.filters.age);
        setStage(preset.filters.stage);
        setSortBy(preset.filters.sortBy);
        setHideSeen(preset.filters.hideSeen);
        setCurrentPage(1);
    };

    const handleDeleteSearchPreset = (presetId: string) => {
        setSearchPresets((prev) => {
            const next = prev.filter((item) => item.id !== presetId);
            writeSearchPresets(next);
            return next;
        });
    };

    const getSpeciesKeysForCurrentTab = useCallback(() => {
        const selectedTabKind = getTabKind(selectedTab);

        if (selectedTabKind === 'favorites' || selectedTabKind === 'settings') {
            return [];
        }

        const selectedSpeciesId = getTabSpeciesId(selectedTab);
        if (selectedSpeciesId === 0) {
            return Array.from(new Set(
                pets.map((pet) => getSpeciesMatchKey(pet.Species)).filter(Boolean)
            ));
        }

        if (selectedSpeciesId) {
            const label = SPECIES_LABEL_BY_ID[selectedSpeciesId];
            return label ? [getSpeciesMatchKey(label)] : [];
        }

        return [];
    }, [pets, selectedTab]);

    const clearCurrentTabNewMatches = useCallback(() => {
        const selectedTabKind = getTabKind(selectedTab);
        if (selectedTabKind === 'favorites' || selectedTabKind === 'settings') return;

        const currentStore = readNewMatchStorage();
        const speciesKeys = getSpeciesKeysForCurrentTab();
        const nextStore = clearSpeciesNewMatchHistory(currentStore, speciesKeys, pets);
        writeNewMatchStorage(nextStore);
        setHasNewMatchHistory(Object.keys(nextStore).length > 0);
        setNewMatchPetIds(new Set());
    }, [getSpeciesKeysForCurrentTab, pets, selectedTab]);

    const clearAllNewMatches = useCallback(() => {
        localStorage.removeItem(NEW_MATCH_STORAGE_KEY);
        setHasNewMatchHistory(false);
        setNewMatchPetIds(new Set());
    }, []);

    const resetStateTransferStatus = () => {
        setStateTransferStatus(null);
    };

    const handleExportLocalAppState = () => {
        try {
            const exportPayload = buildLocalAppStateExport({
                favorites,
                seenPets,
                seenEnabled: isSeenEnabled,
                favoritesDisclaimerAccepted: isDisclaimerAccepted,
                searchPresets,
                adoptionChecklists: adoptionChecklistStore,
            });
            const dateLabel = new Date().toISOString().slice(0, 10);
            const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `midland-animal-shelter-local-state-${dateLabel}.json`;
            link.setAttribute('rel', 'noopener');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setStateTransferStatus({
                severity: 'success',
                message: `Export complete: ${favorites.length} favorites, ${seenPets.length} seen pets, ${searchPresets.length} presets, and ${Object.keys(adoptionChecklistStore).length} checklist entries exported.`,
            });
        } catch {
            setStateTransferStatus({
                severity: 'error',
                message: 'Unable to export local app state. Please try again.',
            });
        }
    };

    const handleImportLocalAppState = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        try {
            if (!file) {
                return;
            }

            const rawText = await readUploadedFileText(file);
            const parsedState = parseLocalAppStateImport(rawText);

            replaceFavorites(parsedState.favorites);
            replaceSeenState(parsedState.seenPets);
            setSeenEnabled(parsedState.seenEnabled);
            setDisclaimerAcceptance(parsedState.favoritesDisclaimerAccepted);
            setSearchPresets(parsedState.searchPresets);
            writeSearchPresets(parsedState.searchPresets);
            replaceChecklistStore(parsedState.adoptionChecklists);

            setStateTransferStatus({
                severity: 'success',
                message: `Import complete: ${parsedState.favorites.length} favorites, ${parsedState.seenPets.length} seen pets, ${parsedState.searchPresets.length} presets, and ${Object.keys(parsedState.adoptionChecklists).length} checklist entries imported.`,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to import local app state file.';
            setStateTransferStatus({
                severity: 'error',
                message,
            });
        } finally {
            event.target.value = '';
        }
    };

    // Handle Page Change
    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const syncStateFromUrl = useCallback(() => {
        const urlState = getUrlState();

        isRestoringFromUrl.current = true;
        skipPageReset.current = true;
        setSelectedTab(urlState.selectedTab);
        setIsOfflineListMode(false);
        setSearchQuery(urlState.searchQuery);
        setBreed(urlState.breed);
        setGender(urlState.gender);
        setAge(urlState.age);
        setStage(urlState.stage);
        setSortBy(urlState.sortBy);
        setHideSeen(urlState.hideSeen);
        setCurrentPage(urlState.currentPage);
    }, []);

    const syncUrlFromState = useCallback(() => {
        const params = buildUrlSearchParams({
            selectedTab,
            searchQuery,
            breed,
            gender,
            age,
            stage,
            sortBy,
            hideSeen,
            currentPage,
        });
        const nextSearch = params.toString();
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`;
        window.history.replaceState(null, '', nextUrl);
    }, [age, breed, currentPage, gender, hideSeen, searchQuery, selectedTab, sortBy, stage]);

    // Effect to reset current page when filters, sorting, or tab changes
    useEffect(() => {
        if (skipPageReset.current) {
            skipPageReset.current = false;
            return;
        }
        if (isRestoringFromUrl.current) {
            isRestoringFromUrl.current = false;
            return;
        }

        setCurrentPage(1);
    }, [searchQuery, breed, gender, age, stage, sortBy, selectedTab, personalFitPreferences]);

    useEffect(() => {
        syncUrlFromState();
    }, [syncUrlFromState]);

    useEffect(() => {
        if (!isPersonalFitEnabled && sortBy === 'score') {
            setSortBy('');
        }
    }, [isPersonalFitEnabled, sortBy]);

    useEffect(() => {
        const onPopState = () => {
            syncStateFromUrl();
        };

        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [syncStateFromUrl]);

    useEffect(() => {
        const initialStore = readNewMatchStorage();
        setHasNewMatchHistory(Object.keys(initialStore).length > 0);
        setSyncState(readPetListSyncState());
    }, []);

    // Effect to make API request based on selectedTab
    useEffect(() => {
        const selectedTabKind = getTabKind(selectedTab);
        if (selectedTabKind === 'favorites' || selectedTabKind === 'settings') return;

        const fetchPets = async () => {
            isFetchingPets.current = true;
            petsTabRef.current = selectedTab;
            setLoading(true); // Start loading
            setError(null); // Reset previous errors
            setPets([]); // Clear pets
            setNewMatchPetIds(new Set());
            setIsOfflineListMode(false);
            try {
                const speciesID = getTabSpeciesId(selectedTab);
                if (speciesID === null) return;
                const response = await fetch(
                    `https://jztmocmwmf.execute-api.us-east-2.amazonaws.com/Production/COMAPI?speciesID=${speciesID}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const xmlData = await response.text();
                const jsonObj = parser.parse(xmlData) as Root;

                // Access the ArrayOfXmlNode.XmlNode property with type guards
                let xmlNodes = jsonObj['ArrayOfXmlNode']?.['XmlNode'];

                if (!xmlNodes) {
                    setPets([]);
                    return;
                }

                // Ensure xmlNodes is always an array
                if (!Array.isArray(xmlNodes)) {
                    xmlNodes = [xmlNodes];
                }

                // Initialize an empty array to hold AdoptableSearch items
                const adoptableSearchList: AdoptableSearch[] = [];

                // Use forEach to iterate over xmlNodes and populate adoptableSearchList
                xmlNodes.forEach((node) => {
                    if (node.adoptableSearch) {
                        adoptableSearchList.push(node.adoptableSearch);
                    }
                });

                const previousStore = readNewMatchStorage();
                const { newMatchIds, nextStore } = computeNewMatches(adoptableSearchList, previousStore);
                const now = Date.now();

                setNewMatchPetIds(newMatchIds);
                writeNewMatchStorage(nextStore);
                setHasNewMatchHistory(Object.keys(nextStore).length > 0);
                writeCachedPetList(selectedTab, speciesID, adoptableSearchList);
                setSyncState((prev) => {
                    const nextState = {
                        ...prev,
                        [selectedTab]: now,
                    };
                    writePetListSyncState(nextState);
                    return nextState;
                });
                setPets(adoptableSearchList);
            } catch (err: unknown) {
                console.error('Error fetching pets:', err);
                const cachedList = readCachedPetList(selectedTab);
                if (cachedList) {
                    const fallbackStore = readNewMatchStorage();
                    const { newMatchIds } = computeNewMatches(cachedList.pets, fallbackStore);
                    setIsOfflineListMode(true);
                    setNewMatchPetIds(newMatchIds);
                    setHasNewMatchHistory(Object.keys(fallbackStore).length > 0);
                    setSyncState((prev) => {
                        const nextState = {
                            ...prev,
                            [selectedTab]: cachedList.timestamp,
                        };
                        writePetListSyncState(nextState);
                        return nextState;
                    });
                    setPets(cachedList.pets);
                    return;
                }

                setError(getErrorMessage(err, 'Failed to fetch pets.'));
            } finally {
                isFetchingPets.current = false;
                setLoading(false); // End loading
            }
        };

        fetchPets();
    }, [selectedTab]);

    // Effect to update pets when on Favorites tab
    useEffect(() => {
        if (getTabKind(selectedTab) === 'favorites') {
            petsTabRef.current = FAVORITES_TAB_INDEX >= 0 ? FAVORITES_TAB_INDEX : 0;
            setPets(favorites);
            setNewMatchPetIds(new Set());
            setLoading(false);
        }
    }, [selectedTab, favorites]);

    // Check availability of favorites when pets list is updated
    useEffect(() => {
        // Don't check availability if not on a fetch-backed tab.
        const selectedTabKind = getTabKind(selectedTab);
        if (selectedTabKind !== 'fetch') return;

        if (!loading && !error && pets.length > 0) {
            const currentSpecies = getTabSpeciesLabel(selectedTab) ?? '';
            if (currentSpecies) {
                checkAvailability(pets, currentSpecies);
            }
        }
    }, [pets, loading, error, selectedTab, checkAvailability]);

    // Function to open modal
    const openModal = (animalID: number) => {
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLElement) {
            lastModalTriggerRef.current = activeElement;
        }

        setSelectedAnimalID(animalID);
        setIsModalOpen(true);
    };

    // Function to close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAnimalID(null);
        setModalData(null);
        setModalError(null);

        window.requestAnimationFrame(() => {
            const focusTarget = lastModalTriggerRef.current;
            if (focusTarget?.isConnected) {
                focusTarget.focus();
            }

            lastModalTriggerRef.current = null;
        });
    };

    // Filter pets based on search and filters
    const filteredPets = pets.filter((pet) => {
        const selectedSpeciesId = getTabSpeciesId(selectedTab);
        // Filter by tab
        if (selectedSpeciesId !== null && selectedSpeciesId !== 0) { // If not 'All Pets'
            if (selectedSpeciesId === 1 && pet.Species !== 'Dog') return false;
            if (selectedSpeciesId === 2 && pet.Species !== 'Cat') return false;
            if (selectedSpeciesId === 1003 && pet.Species !== 'Small Animal') return false;
        }

        // Filter by search query (Name or Breed)
        if (
            searchQuery &&
            !pet.PrimaryBreed.toLowerCase().includes(searchQuery.trim().toLowerCase()) &&
            pet.Name &&
            !pet.Name.toString().toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
            return false;

        // Filter by breed (multi-select)
        if (breed.length > 0 && !breed.includes(pet.PrimaryBreed)) return false;

        // Filter by gender
        if (gender && pet.Sex !== gender) return false;

        // Filter by age (min/max)
        if (age.min && pet.Age < parseInt(age.min) * 12) return false;
        if (age.max && pet.Age > parseInt(age.max) * 12) return false;

        // Filter by stage
        if (stage && pet.Stage !== stage) return false;

        // Filter by seen status
        if (isSeenEnabled && hideSeen && isSeen(pet)) return false;

        return true;
    });

    const scoredPets = useMemo(() => filteredPets.map((pet, index) => ({
        pet,
        matchScore: isPersonalFitEnabled ? buildPersonalFitScore(pet, personalFitPreferences).total : null,
        index,
    })), [filteredPets, isPersonalFitEnabled, personalFitPreferences]);

    const sortedScoredPets = useMemo(() => {
        const next = [...scoredPets];

        if (sortBy === 'breed') {
            next.sort((a, b) => {
                return a.pet.PrimaryBreed.localeCompare(b.pet.PrimaryBreed) || (a.index - b.index);
            });
        } else if (sortBy === 'age') {
            next.sort((a, b) => {
                return a.pet.Age - b.pet.Age || (a.index - b.index);
            });
        } else if (sortBy === 'score') {
            next.sort((a, b) => {
                return (b.matchScore ?? 0) - (a.matchScore ?? 0) || (a.index - b.index);
            });
        }

        return next;
    }, [scoredPets, sortBy]);

    const sortedPets = sortedScoredPets.map((item) => item.pet);

    const petFitScoreByKey = useMemo(() => {
        const scoreMap = new Map<string, number>();
        if (!isPersonalFitEnabled) {
            return scoreMap;
        }

        sortedScoredPets.forEach((item) => {
            if (item.matchScore === null) return;
            scoreMap.set(getComparePetKey(item.pet), item.matchScore);
        });
        return scoreMap;
    }, [isPersonalFitEnabled, sortedScoredPets]);

    const getPetFitScore = useCallback((pet: AdoptableSearch) => {
        return petFitScoreByKey.get(getComparePetKey(pet)) ?? null;
    }, [petFitScoreByKey]);

    const isNewMatchPet = useCallback((pet: AdoptableSearch) => {
        const petMatchKey = getPetMatchKey(pet);
        return petMatchKey ? newMatchPetIds.has(petMatchKey) : false;
    }, [newMatchPetIds]);
    const newMatchCount = sortedPets.filter(isNewMatchPet).length;

    // Paginate the sorted pets
    const totalPages = Math.ceil(sortedPets.length / itemsPerPage);
    const paginatedPets = sortedPets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        if (loading) {
            return;
        }
        if (isFetchingPets.current) {
            return;
        }
        if (isRestoringFromUrl.current) {
            return;
        }
        if (petsTabRef.current !== selectedTab) {
            return;
        }
        if (pets.length === 0) {
            return;
        }

        const maxPage = Math.max(totalPages, 1);
        if (currentPage > maxPage) {
            setCurrentPage(maxPage);
        }
    }, [currentPage, loading, totalPages, pets.length, selectedTab]);

    // Extract unique breeds for the breed filter dropdown
    const uniqueBreedsSet = new Set<string>();
    pets.forEach((pet) => {
        if (pet.PrimaryBreed) {
            uniqueBreedsSet.add(pet.PrimaryBreed);
        }
    });
    const uniqueBreeds = Array.from(uniqueBreedsSet).sort();


    // Extract unique stages for the stage filter dropdown
    const uniqueStagesSet = new Set<string>();
    pets.forEach((pet) => {
        if (pet.Stage) {
            uniqueStagesSet.add(pet.Stage);
        }
    });
    const uniqueStages = Array.from(uniqueStagesSet).sort();
    const stageSelectValue = uniqueStages.length === 0 || !uniqueStages.includes(stage) ? '' : stage;

    useEffect(() => {
        if (stage && uniqueStages.length > 0 && !uniqueStages.includes(stage)) {
            setStage('');
        }
    }, [stage, uniqueStages]);

    const hasActiveFilters =
        searchQuery.trim().length > 0 ||
        breed.length > 0 ||
        Boolean(gender) ||
        Boolean(stage) ||
        Boolean(age.min) ||
        Boolean(age.max) ||
        Boolean(sortBy) ||
        hideSeen;

    const lastSyncAt = getSyncTimestampForTab(syncState, selectedTab);
    const syncAgeLabel = formatSyncAge(lastSyncAt);
    const freshnessMessage = lastSyncAt
        ? isOfflineListMode
            ? `Showing cached ${tabLabels[selectedTab].label.toLowerCase()} data from ${formatSyncTime(lastSyncAt)} (${syncAgeLabel}).`
            : `Last successful sync for ${tabLabels[selectedTab].label} was ${formatSyncTime(lastSyncAt)} (${syncAgeLabel}).`
        : isOfflineListMode
            ? 'Showing cached data with no available sync timestamp yet.'
            : `No successful sync has been recorded yet for ${tabLabels[selectedTab].label}.`;
    const isSyncStale = Boolean(lastSyncAt) && isDataStale(lastSyncAt);
    const currentTabKind = getTabKind(selectedTab);
    const isDataFreshnessFooterVisible = currentTabKind === 'fetch';
    const visibleResultCount = currentTabKind === 'settings' ? 0 : sortedPets.length;
    const settingsNewMatchCount = currentTabKind === 'fetch' ? newMatchCount : 0;

    const modalComparePet = getPetFromModalData(modalData);
    const isCurrentPetInCompare = modalComparePet ? isInCompare(modalComparePet) : false;
    const canAddCurrentPetToCompare = !isCompareLimitReached || isCurrentPetInCompare;
    const modalChecklistPetId = modalData?.ID ?? selectedAnimalID;
    const modalChecklist = modalChecklistPetId === null ? createEmptyAdoptionChecklist() : getChecklistForPet(modalChecklistPetId);

    return (
        <Box className="App" sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header
                selectedTab={selectedTab}
                onTabChange={handleTabChange}
                tabLabels={tabLabels}
                filteredCount={sortedPets.length}
                favoritesCount={favorites.length}
            />

            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, flexGrow: 1 }}>
                <Paper
                    sx={{
                        mb: 2.5,
                        p: { xs: 2, md: 2.5 },
                        background: 'linear-gradient(120deg, rgba(230, 244, 227, 0.95) 0%, rgba(255, 247, 230, 0.9) 100%)',
                        animation: 'fadeUp 300ms ease-out',
                    }}
                >
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                        <Box>
                            <Typography variant="h6">
                                {tabLabels[selectedTab].label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {currentTabKind === 'settings'
                                    ? 'Tune local ranking behavior and app preferences without affecting source data.'
                                    : 'Tap a pet card to view full intake details and adoption links.'}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip color="primary" label={`${visibleResultCount} results`} />
                            <Chip variant="outlined" label={`${favorites.length} favorited`} />
                            <Chip variant="outlined" label={`${seenPets.length} seen`} />
                            <Chip variant="outlined" label={`${comparePets.length}/3 to compare`} />
                            {isOfflineListMode && currentTabKind !== 'settings' ? (
                                <Chip
                                    color="warning"
                                    variant="outlined"
                                    label="Offline: cached list"
                                />
                            ) : null}
                        </Stack>
                    </Stack>
                </Paper>

                {currentTabKind === 'settings' ? (
                    <SettingsPanel
                        personalFitPreferences={personalFitPreferences}
                        isPersonalFitEnabled={isPersonalFitEnabled}
                        onPersonalFitPreferencesChange={handlePersonalFitPreferencesChange}
                        onResetPersonalFitPreferences={handleResetPersonalFitPreferences}
                        onTogglePersonalFitEnabled={handlePersonalFitEnabledChange}
                        onClearCurrentTabNewMatches={clearCurrentTabNewMatches}
                        onClearAllNewMatches={clearAllNewMatches}
                        hasNewMatchHistory={hasNewMatchHistory}
                        newMatchCount={settingsNewMatchCount}
                        onExportLocalAppState={handleExportLocalAppState}
                        onImportLocalAppState={handleImportLocalAppState}
                        transferState={stateTransferStatus}
                        onClearTransferState={resetStateTransferStatus}
                    />
                ) : (
                    <Filters
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        breed={breed}
                        onBreedChange={handleBreedChange}
                        uniqueBreeds={uniqueBreeds}
                        gender={gender}
                        onGenderChange={handleGenderChange}
                        age={age}
                        onAgeChange={handleAgeChange}
                        stage={stageSelectValue}
                        onStageChange={handleStageChange}
                        uniqueStages={uniqueStages}
                        sortBy={sortBy}
                        onSortByChange={handleSortByChange}
                        isPersonalFitEnabled={isPersonalFitEnabled}
                        isSeenEnabled={isSeenEnabled}
                        onToggleSeenFeature={toggleSeenFeature}
                        hideSeen={hideSeen}
                        onHideSeenChange={setHideSeen}
                        savedSearchPresets={searchPresets}
                        onSaveSearchPreset={handleSaveSearchPreset}
                        onApplySearchPreset={handleApplySearchPreset}
                        onDeleteSearchPreset={handleDeleteSearchPreset}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={handleClearFilters}
                        newMatchCount={newMatchCount}
                        hasNewMatchHistory={hasNewMatchHistory}
                        onClearCurrentTabNewMatches={clearCurrentTabNewMatches}
                        onClearAllNewMatches={clearAllNewMatches}
                    />
                )}

                {currentTabKind !== 'settings' && comparePets.length > 0 && (
                    <CompareTray
                        comparePets={comparePets}
                        onOpenPet={openModal}
                        onRemovePet={removeComparePet}
                        onClearAll={clearComparePets}
                        isFavorite={isFavorite}
                        isSeen={isSeen}
                        isCompareLimitReached={isCompareLimitReached}
                    />
                )}

                {currentTabKind !== 'settings' ? (
                    <>
                        <PetList
                            pets={paginatedPets}
                            loading={loading}
                            error={error}
                            onPetClick={openModal}
                            isFavorite={isFavorite}
                            toggleFavorite={toggleFavorite}
                            isSeenEnabled={isSeenEnabled}
                            markAsSeen={markAsSeen}
                            markAllAsSeen={markAllAsSeen}
                            isSeen={isSeen}
                            isNewMatch={isNewMatchPet}
                            isInCompare={isInCompare}
                            isCompareLimitReached={isCompareLimitReached}
                            onToggleCompare={toggleComparePet}
                            getPetFitScore={getPetFitScore}
                        />

                        <PaginationControls totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange} />
                    </>
                ) : null}
            </Container>

            <Footer
                showDataFreshness={isDataFreshnessFooterVisible}
                freshnessText={freshnessMessage}
                isFreshnessStale={isSyncStale}
                isOfflineData={isOfflineListMode}
            />

            <PetModal
                isOpen={isModalOpen}
                animalID={selectedAnimalID}
                onClose={closeModal}
                setModalData={setModalData}
                setModalError={setModalError}
                setModalLoading={setModalLoading}
                modalData={modalData}
                modalError={modalError}
                modalLoading={modalLoading}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                isSeenEnabled={isSeenEnabled}
                markAsSeen={markAsSeen}
                isSeen={isSeen}
                isInCompare={isCurrentPetInCompare}
                canAddCompare={canAddCurrentPetToCompare}
                onToggleCompare={toggleComparePet}
                fitScore={modalComparePet ? getPetFitScore(modalComparePet) : null}
                checklist={modalChecklist}
                onChecklistItemChange={(itemId, checked) => {
                    if (modalChecklistPetId === null) return;
                    setChecklistItem(modalChecklistPetId, itemId, checked);
                }}
                onChecklistNotesChange={(notes) => {
                    if (modalChecklistPetId === null) return;
                    setChecklistNotes(modalChecklistPetId, notes);
                }}
            />

            <DisclaimerDialog open={isDisclaimerOpen} onAccept={acceptDisclaimer} onClose={closeDisclaimer} />
        </Box>
    );
}

export default App;
