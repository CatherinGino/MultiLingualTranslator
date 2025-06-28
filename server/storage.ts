import { users, translations, type User, type InsertUser, type Translation, type InsertTranslation } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  getRecentTranslations(limit?: number): Promise<Translation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private translations: Map<number, Translation>;
  private currentUserId: number;
  private currentTranslationId: number;

  constructor() {
    this.users = new Map();
    this.translations = new Map();
    this.currentUserId = 1;
    this.currentTranslationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const id = this.currentTranslationId++;
    const translation: Translation = { 
      ...insertTranslation, 
      id,
      createdAt: new Date()
    };
    this.translations.set(id, translation);
    return translation;
  }

  async getRecentTranslations(limit: number = 10): Promise<Translation[]> {
    const allTranslations = Array.from(this.translations.values());
    return allTranslations
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
