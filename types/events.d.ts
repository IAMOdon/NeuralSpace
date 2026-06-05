declare global {
  interface WindowEventMap {
    "ns:word-lookup": CustomEvent<{ word: string }>;
    "ns:source-click": CustomEvent<{ href: string }>;
  }
}

export {};
