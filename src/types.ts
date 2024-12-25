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
    "ns0:XmlNode": XmlNode[];
}

export interface Root {
    "ns0:ArrayOfXmlNode": ArrayOfXmlNode
}