export interface StorageAdapter {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}

// Simple in-memory fallback for testing or SSR
class MemoryStorage implements StorageAdapter {
    private store: Record<string, string> = {};

    async getItem(key: string): Promise<string | null> {
        return this.store[key] || null;
    }

    async setItem(key: string, value: string): Promise<void> {
        this.store[key] = value;
    }

    async removeItem(key: string): Promise<void> {
        delete this.store[key];
    }
}

export const memoryStorage = new MemoryStorage();
