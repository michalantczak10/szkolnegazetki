import type { CartItem } from "../types.js";
import { showToast } from "./utils.js";

const STORAGE_KEY = "cartStorage";

export class CartManager {
  private items: CartItem[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;

      this.items = parsed.filter(
        (item): item is CartItem =>
          item &&
          typeof item.name === "string" &&
          typeof item.price === "number" &&
          typeof item.qty === "number"
      );
    } catch {
      this.items = [];
    }
  }

  public saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  }

  public add(name: string, price: number, image: string): void {
    const existing = this.items.find((item) => item.name === name);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ name, price, qty: 1, image });
    }
    this.saveToStorage();
  }

  public remove(name: string): void {
    const before = this.items.length;
    this.items = this.items.filter((i) => i.name !== name);
    if (this.items.length < before) {
      showToast(`Usunięto produkt ${name} z zamówienia.`);
    }
    this.saveToStorage();
  }

  public increaseQty(name: string): void {
    const item = this.items.find((i) => i.name === name);
    if (item) {
      item.qty++;
      showToast(`Dodano 1 szt. produktu ${name}.`);
      this.saveToStorage();
    }
  }

  public decreaseQty(name: string): void {
    const item = this.items.find((i) => i.name === name);
    if (item && item.qty > 1) {
      item.qty--;
      showToast(`Usunięto 1 szt. produktu ${name}.`);
      this.saveToStorage();
    }
  }

  public clear(): void {
    this.items = [];
    this.saveToStorage();
  }

  public getTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  public getTotalItemsCount(): number {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }

  public getAll(): CartItem[] {
    return [...this.items];
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }
}
