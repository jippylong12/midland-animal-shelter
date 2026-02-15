export interface AdoptableSearch {
    ID: number;
    Name: string;
    Species: string;
    Sex: string;
    PrimaryBreed: string;
    SecondaryBreed: string;
    SN: string;
    Age: number;
    Photo: string;
    Location: string;
    OnHold: string;
    SpecialNeeds: string;
    NoDogs: string;
    NoCats: string;
    NoKids: string;
    MemoList: string;
    ARN: string;
    BehaviorTestList: string;
    Stage: string;
    AnimalType: number | string;
    AgeGroup: string;
    WildlifeIntakeInjury: string;
    WildlifeIntakeCause: string;
    BuddyID: number;
    Featured: string;
    Sublocation: string;
    ChipNumber: number | string;
}

export interface XmlNode {
    adoptableSearch: AdoptableSearch;
}

export interface ArrayOfXmlNode {
    "XmlNode": XmlNode[];
}

export interface Root {
    "ArrayOfXmlNode": ArrayOfXmlNode
}

export interface AdoptableDetailsXmlNode {
    adoptableDetails: AdoptableDetails;
}

export type AdoptableDetails = {
    CompanyID: number;
    ID: number;
    AnimalName: string;
    Species: string;
    Sex: string;
    Altered: string;
    PrimaryBreed: string;
    SecondaryBreed: string | null;
    PrimaryColor: string;
    SecondaryColor: string | null;
    Age: number;
    Size: string;
    Housetrained: string;
    Declawed: string;
    Price: string;
    LastIntakeDate: string;
    Location: string;
    Dsc: string | null;
    Photo1: string;
    Photo2: string | null;
    Photo3: string | null;
    OnHold: string;
    SpecialNeeds: string | null;
    NoDogs: string | null;
    NoCats: string | null;
    NoKids: string | null;
    BehaviorResult: string | null;
    MemoList: unknown;
    Site: string;
    DateOfSurrender: string;
    TimeInFormerHome: string;
    ReasonForSurrender: string;
    PrevEnvironment: string | null;
    LivedWithChildren: string;
    LivedWithAnimals: string;
    LivedWithAnimalTypes: string | null;
    BodyWeight: string;
    DateOfBirth: string;
    ARN: string | null;
    VideoID: string | null;
    BehaviorTestList: unknown;
    Stage: string;
    AnimalType: string;
    AgeGroup: string;
    WildlifeIntakeInjury: string | null;
    WildlifeIntakeCause: string | null;
    BuddyID: string;
    Featured: string;
    Sublocation: string;
    ChipNumber: string;
    ColorPattern: string | null;
    AdoptionApplicationUrl: string;
    BannerURL: string;
};
