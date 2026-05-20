export interface IEmployee {
    Id: number;
    AdSoyad: string;
    BirimId: number;
    TakimId: number;
    Birim: string;
    Takim: string;
    DahiliNo: string;
    IsCepTelNo: string;
    Active?: boolean;
}