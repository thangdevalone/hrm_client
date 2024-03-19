export interface Bank {
    id: number;
    name: string;
    code: string;
    bin: string;
    shortName: string;
    logo: string;
    isTransfer: number;
    lookupSupported: number;
    support: number;
    swift_code: string | null;
    transferSupported: number;
    // Add other fields as necessary based on the API response
}