declare module 'clamscan' {
    interface ScanResult {
        isInfected: boolean;
        file: string;
    }

    interface ClamscanOptions {
        removeInfected?: boolean;
        quarantineInfected?: string;
        scanLog?: string;
        debugMode?: boolean;
        fileScanSizeLimit?: string;
    }

    class NodeClam {
        init(options?: ClamscanOptions): Promise<NodeClam>;
        scanFile(filePath: string): Promise<ScanResult>;
    }

    export = NodeClam;
}
