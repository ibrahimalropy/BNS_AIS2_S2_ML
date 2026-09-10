/**
 * Smart product-photo library.
 *
 * When a manager adds a product, its name is matched (English + Arabic,
 * singular/plural tolerant) against this library so the right photo gets
 * attached automatically. New photos dropped into /public/images only need
 * an entry here to become auto-matchable.
 */

export interface LibraryImage {
  id: string;
  src: string;
  label: string;
  tint: string;
  keywords: string[];
}

export const IMAGE_LIBRARY: LibraryImage[] = [
  {
    id: "milk",
    src: "/manus-storage/milk_4cb36e28.jpg",
    label: "Milk",
    tint: "#D6E6F8",
    keywords: ["milk", "لبن", "حليب"],
  },
  {
    id: "rice",
    src: "/manus-storage/rice_7d70daf5.jpg",
    label: "Rice",
    tint: "#FCEBB8",
    keywords: ["rice", "رز", "ارز", "أرز"],
  },
  {
    id: "chips",
    src: "/manus-storage/chips_47eafbae.jpg",
    label: "Chips",
    tint: "#FFE0CC",
    keywords: ["chips", "chip", "crisps", "chipsy", "شيبس", "شيبسي", "شبسي"],
  },
  {
    id: "icecream",
    src: "/manus-storage/icecream_025b36c7.jpg",
    label: "Ice Cream",
    tint: "#FBD3E6",
    keywords: ["ice cream", "icecream", "ايس كريم", "ايسكريم"],
  },
  {
    id: "pepsi",
    src: "/manus-storage/pepsi_f29c0c91.jpg",
    label: "Pepsi",
    tint: "#CFDBFA",
    keywords: ["pepsi", "cola", "soda", "بيبسي", "ببسي", "كولا", "صودا"],
  },
  {
    id: "chocolate",
    src: "/manus-storage/chocolate_d651869c.jpg",
    label: "Chocolate",
    tint: "#E4D9F7",
    keywords: ["chocolate", "choco", "شوكولاتة", "شوكولاته", "شوكو"],
  },
  {
    id: "juice",
    src: "/manus-storage/juice_92ff4510.jpg",
    label: "Juice",
    tint: "#FDE2C8",
    keywords: ["juice", "عصير"],
  },
  {
    id: "bread",
    src: "/manus-storage/bread_4e033e4e.jpg",
    label: "Bread",
    tint: "#F6E7C8",
    keywords: [
      "bread",
      "toast",
      "bun",
      "baguette",
      "bakery",
      "عيش",
      "خبز",
      "توست",
      "فينو",
    ],
  },
  {
    id: "eggs",
    src: "/manus-storage/eggs_3b9cc38c.jpg",
    label: "Eggs",
    tint: "#E9F2E2",
    keywords: ["egg", "بيض"],
  },
  {
    id: "fruits",
    src: "/manus-storage/fruits_ceb7424e.jpg",
    label: "Fresh Fruits",
    tint: "#FFE4D6",
    keywords: [
      "apple",
      "banana",
      "orange",
      "mango",
      "grape",
      "strawberry",
      "peach",
      "fruit",
      "تفاح",
      "موز",
      "برتقال",
      "مانجو",
      "عنب",
      "فراولة",
      "خوخ",
      "فاكهة",
    ],
  },
];

const singular = (word: string) =>
  word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word;

/** Find the best library photo for a product name, or null. */
export function matchLibraryImage(name: string): LibraryImage | null {
  const lower = name.trim().toLowerCase();
  if (!lower) return null;
  const words = lower
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .map(singular);

  for (const entry of IMAGE_LIBRARY) {
    for (const keyword of entry.keywords) {
      const key = keyword.toLowerCase();
      if (key.includes(" ")) {
        if (lower.includes(key)) return entry;
      } else if (words.includes(singular(key))) {
        return entry;
      }
    }
  }
  return null;
}

export function isLibraryImage(src: string): boolean {
  return IMAGE_LIBRARY.some((entry) => entry.src === src);
}
