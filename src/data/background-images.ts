export type BackgroundOption = {
  id: string
  label: string
  /** "none" means no background image; otherwise a Pexels image URL. */
  url: string
}

/**
 * Beautiful Japanese-themed background photos from Pexels (free to use).
 * All URLs include size/crop params so they work well as full-bleed backgrounds.
 */
export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: "none", label: "None", url: "none" },
  {
    id: "kiyomizu-temple",
    label: "Kiyomizu-dera Temple",
    url: "https://images.pexels.com/photos/16226263/pexels-photo-16226263.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  {
    id: "pagoda-spring",
    label: "Pagoda in Spring",
    url: "https://images.pexels.com/photos/29176026/pexels-photo-29176026.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  {
    id: "bamboo-forest",
    label: "Bamboo Forest",
    url: "https://images.pexels.com/photos/35526447/pexels-photo-35526447.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  {
    id: "zen-garden",
    label: "Zen Garden",
    url: "https://images.pexels.com/photos/34222130/pexels-photo-34222130.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  {
    id: "autumn-torii",
    label: "Autumn Torii Gate",
    url: "https://images.pexels.com/photos/18848711/pexels-photo-18848711.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  {
    id: "ninenzaka",
    label: "Ninenzaka Kyoto",
    url: "https://images.pexels.com/photos/39241173/pexels-photo-39241173.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
]

export const DEFAULT_BACKGROUND_IMAGE: BackgroundOption["url"] =
  BACKGROUND_OPTIONS[1].url
