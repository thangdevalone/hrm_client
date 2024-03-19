/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'vietqr' {
    export class VietQR {
        constructor(config: { clientID: string, apiKey: string });

        checkKey(): boolean;
        sendMessage(check: boolean): void;

        getTemplate(): Promise<any>;
        getBanks(): Promise<any>;
        genQRCodeBase64(params: {
            bank: string,
            accountName: string,
            accountNumber: string,
            amount: string,
            memo: string,
            template: string
        }): Promise<any>;
        genQRCodeBase64V1(params: {
            bank: string,
            accountName: string,
            accountNumber: string,
            amount: string,
            memo: string,
            format: string
        }): Promise<any>;
        genQuickLink(params: {
            bank: string,
            accountName: string,
            accountNumber: string,
            amount: string,
            memo: string,
            template: string,
            media: string
        }): string;
        createPaymentGateway(params: {
            theme_slug: string,
            platform?: string,
            bankId?: string,
            accountName?: string,
            accountNumber?: string,
            addInfo?: string,
            amount?: string
        }): Promise<any>;
    }
}
