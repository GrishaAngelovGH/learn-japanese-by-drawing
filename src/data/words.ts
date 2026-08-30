import { Word } from "@/types/dictionary"

const words: Word[] = [
  {
    id: "breakfast",
    text: "朝ご飯",
    kana: "あさごはん",
    romaji: "asagohan",
    meaning: "Breakfast",
    characters: ["朝", "ご", "飯"],
    characterMeanings: ["Morning", "Honorific prefix", "Rice / meal"]
  },
  {
    id: "rice",
    text: "ごはん",
    kana: "ごはん",
    romaji: "gohan",
    meaning: "Rice (cooked)",
    characters: ["ご", "は", "ん"],
    characterMeanings: ["Honorific prefix", "Grammatical particle", "Sound ending"]
  },
  {
    id: "water",
    text: "みず",
    kana: "みず",
    romaji: "mizu",
    meaning: "Water",
    characters: ["み", "ず"],
    characterMeanings: ["Phonetic", "Phonetic"]
  },
  {
    id: "tea",
    text: "ちゃ",
    kana: "ちゃ",
    romaji: "cha",
    meaning: "Tea",
    characters: ["ち", "ゃ"],
    characterMeanings: ["Phonetic", "Small kana modifier"]
  },
  {
    id: "coffee",
    text: "コーヒー",
    kana: "こーひー",
    romaji: "koohii",
    meaning: "Coffee",
    characters: ["コ", "ー", "ヒ", "ー"],
    characterMeanings: ["Phonetic", "Long vowel mark", "Phonetic", "Long vowel mark"]
  },
  {
    id: "bread",
    text: "パン",
    kana: "パン",
    romaji: "pan",
    meaning: "Bread",
    characters: ["パ", "ン"],
    characterMeanings: ["Phonetic", "Phonetic"]
  },
  {
    id: "egg",
    text: "たまご",
    kana: "たまご",
    romaji: "tamago",
    meaning: "Egg",
    characters: ["た", "ま", "ご"],
    characterMeanings: ["Phonetic", "Phonetic", "Phonetic"]
  },
  {
    id: "milk",
    text: "ぎゅうにゅう",
    kana: "ぎゅうにゅう",
    romaji: "gyuunyuu",
    meaning: "Milk",
    characters: ["ぎ", "ゅ", "う", "に", "ゅ", "う"],
    characterMeanings: ["Phonetic", "Small kana modifier", "Phonetic", "Phonetic", "Small kana modifier", "Phonetic"]
  },
  {
    id: "apple",
    text: "りんご",
    kana: "りんご",
    romaji: "ringo",
    meaning: "Apple",
    characters: ["り", "ん", "ご"],
    characterMeanings: ["Phonetic", "Phonetic", "Phonetic"]
  },
  {
    id: "banana",
    text: "バナナ",
    kana: "バナナ",
    romaji: "banana",
    meaning: "Banana",
    characters: ["バ", "ナ", "ナ"],
    characterMeanings: ["Phonetic", "Phonetic", "Phonetic"]
  },
  {
    id: "fish",
    text: "さかな",
    kana: "さかな",
    romaji: "sakana",
    meaning: "Fish",
    characters: ["さ", "か", "な"],
    characterMeanings: ["Phonetic", "Phonetic", "Phonetic"]
  },
  {
    id: "newspaper",
    text: "新聞",
    kana: "しんぶん",
    romaji: "shinbun",
    meaning: "Newspaper",
    characters: ["新", "聞"],
    characterMeanings: ["New", "Hear / listen"]
  },
  {
    id: "bank",
    text: "銀行",
    kana: "ぎんこう",
    romaji: "ginkoo",
    meaning: "Bank",
    characters: ["銀", "行"],
    characterMeanings: ["Silver", "Go / act"]
  },
  {
    id: "park",
    text: "公園",
    kana: "こうえん",
    romaji: "kooen",
    meaning: "Park",
    characters: ["公", "園"],
    characterMeanings: ["Public", "Garden / park"]
  },
  {
    id: "library",
    text: "図書館",
    kana: "としょかん",
    romaji: "toshokan",
    meaning: "Library",
    characters: ["図", "書", "館"],
    characterMeanings: ["Drawing / diagram", "Write / book", "Building / hall"]
  },
  {
    id: "airport",
    text: "空港",
    kana: "くうこう",
    romaji: "kuukoo",
    meaning: "Airport",
    characters: ["空", "港"],
    characterMeanings: ["Sky / air", "Port / harbor"]
  },
  {
    id: "clock",
    text: "時計",
    kana: "とけい",
    romaji: "tokei",
    meaning: "Clock / watch",
    characters: ["時", "計"],
    characterMeanings: ["Time / hour", "Measure / plan"]
  },
  {
    id: "telephone",
    text: "電話",
    kana: "でんわ",
    romaji: "denwa",
    meaning: "Telephone / phone",
    characters: ["電", "話"],
    characterMeanings: ["Electricity", "Talk / speech"]
  },
  {
    id: "letter",
    text: "手紙",
    kana: "てがみ",
    romaji: "tegami",
    meaning: "Letter",
    characters: ["手", "紙"],
    characterMeanings: ["Hand", "Paper"]
  },
  {
    id: "umbrella",
    text: "傘",
    kana: "かさ",
    romaji: "kasa",
    meaning: "Umbrella",
    characters: ["傘"],
    characterMeanings: ["Umbrella"]
  },
  {
    id: "photograph",
    text: "写真",
    kana: "しゃしん",
    romaji: "shashin",
    meaning: "Photograph / photo",
    characters: ["写", "真"],
    characterMeanings: ["Copy / photograph", "Truth / real"]
  },
  {
    id: "music",
    text: "音楽",
    kana: "おんがく",
    romaji: "ongaku",
    meaning: "Music",
    characters: ["音", "楽"],
    characterMeanings: ["Sound", "Comfort / music"]
  },
  {
    id: "movie",
    text: "映画",
    kana: "えいが",
    romaji: "eiga",
    meaning: "Movie / film",
    characters: ["映", "画"],
    characterMeanings: ["Reflect / project", "Picture / brush-stroke"]
  },
  {
    id: "japanese-language",
    text: "日本語",
    kana: "にほんご",
    romaji: "nihongo",
    meaning: "Japanese language",
    characters: ["日", "本", "語"],
    characterMeanings: ["Sun / day", "Book / origin", "Language / word"]
  },
  {
    id: "person",
    text: "人",
    kana: "ひと",
    romaji: "hito",
    meaning: "Person",
    characters: ["人"],
    characterMeanings: ["Person"]
  },
  {
    id: "child",
    text: "子供",
    kana: "こども",
    romaji: "kodomo",
    meaning: "Child",
    characters: ["子", "供"],
    characterMeanings: ["Child", "Accompany / offer"]
  },
  {
    id: "man",
    text: "男",
    kana: "おとこ",
    romaji: "otoko",
    meaning: "Man",
    characters: ["男"],
    characterMeanings: ["Man / male"]
  },
  {
    id: "woman",
    text: "女",
    kana: "おんな",
    romaji: "onna",
    meaning: "Woman",
    characters: ["女"],
    characterMeanings: ["Woman / female"]
  },
  {
    id: "father",
    text: "父",
    kana: "ちち",
    romaji: "chichi",
    meaning: "Father",
    characters: ["父"],
    characterMeanings: ["Father"]
  },
  {
    id: "mother",
    text: "母",
    kana: "はは",
    romaji: "haha",
    meaning: "Mother",
    characters: ["母"],
    characterMeanings: ["Mother"]
  },
  {
    id: "friend",
    text: "友だち",
    kana: "ともだち",
    romaji: "tomodachi",
    meaning: "Friend",
    characters: ["友", "だ", "ち"],
    characterMeanings: ["Friend", "Phonetic", "Phonetic"]
  },
  {
    id: "teacher",
    text: "先生",
    kana: "せんせい",
    romaji: "sensei",
    meaning: "Teacher",
    characters: ["先", "生"],
    characterMeanings: ["Before / ahead", "Life / birth"]
  },
  {
    id: "student",
    text: "学生",
    kana: "がくせい",
    romaji: "gakusei",
    meaning: "Student",
    characters: ["学", "生"],
    characterMeanings: ["Study / learn", "Life / birth"]
  },
  {
    id: "shoes",
    text: "靴",
    kana: "くつ",
    romaji: "kutsu",
    meaning: "Shoes",
    characters: ["靴"],
    characterMeanings: ["Shoes"]
  },
  {
    id: "clothes",
    text: "服",
    kana: "ふく",
    romaji: "fuku",
    meaning: "Clothes",
    characters: ["服"],
    characterMeanings: ["Clothing / dress"]
  },
  {
    id: "hat",
    text: "帽子",
    kana: "ぼうし",
    romaji: "booshi",
    meaning: "Hat",
    characters: ["帽", "子"],
    characterMeanings: ["Cap / hat", "Noun suffix"]
  },
  {
    id: "jacket",
    text: "上着",
    kana: "うわぎ",
    romaji: "uwagi",
    meaning: "Jacket",
    characters: ["上", "着"],
    characterMeanings: ["Upper / over", "Wear / arrive"]
  },
  {
    id: "socks",
    text: "靴下",
    kana: "くつした",
    romaji: "kutsushita",
    meaning: "Socks",
    characters: ["靴", "下"],
    characterMeanings: ["Shoes", "Under / below"]
  },
  {
    id: "wallet",
    text: "財布",
    kana: "さいふ",
    romaji: "saifu",
    meaning: "Wallet",
    characters: ["財", "布"],
    characterMeanings: ["Wealth", "Cloth"]
  },
  {
    id: "sun",
    text: "日",
    kana: "ひ",
    romaji: "hi",
    meaning: "Sun / day",
    characters: ["日"],
    characterMeanings: ["Sun / day"]
  },
  {
    id: "moon",
    text: "月",
    kana: "つき",
    romaji: "tsuki",
    meaning: "Moon / month",
    characters: ["月"],
    characterMeanings: ["Moon / month"]
  },
  {
    id: "tree",
    text: "木",
    kana: "き",
    romaji: "ki",
    meaning: "Tree / wood",
    characters: ["木"],
    characterMeanings: ["Tree / wood"]
  },
  {
    id: "mountain",
    text: "山",
    kana: "やま",
    romaji: "yama",
    meaning: "Mountain",
    characters: ["山"],
    characterMeanings: ["Mountain"]
  },
  {
    id: "river",
    text: "川",
    kana: "かわ",
    romaji: "kawa",
    meaning: "River",
    characters: ["川"],
    characterMeanings: ["River"]
  },
  {
    id: "flower",
    text: "花",
    kana: "はな",
    romaji: "hana",
    meaning: "Flower",
    characters: ["花"],
    characterMeanings: ["Flower"]
  },
  {
    id: "rain",
    text: "雨",
    kana: "あめ",
    romaji: "ame",
    meaning: "Rain",
    characters: ["雨"],
    characterMeanings: ["Rain"]
  },
  {
    id: "snow",
    text: "雪",
    kana: "ゆき",
    romaji: "yuki",
    meaning: "Snow",
    characters: ["雪"],
    characterMeanings: ["Snow"]
  },
  {
    id: "sky",
    text: "空",
    kana: "そら",
    romaji: "sora",
    meaning: "Sky",
    characters: ["空"],
    characterMeanings: ["Sky / empty"]
  },
  {
    id: "sea",
    text: "海",
    kana: "うみ",
    romaji: "umi",
    meaning: "Sea / ocean",
    characters: ["海"],
    characterMeanings: ["Sea / ocean"]
  },
  {
    id: "wind",
    text: "風",
    kana: "かぜ",
    romaji: "kaze",
    meaning: "Wind",
    characters: ["風"],
    characterMeanings: ["Wind / style"]
  },
  {
    id: "fire",
    text: "火",
    kana: "ひ",
    romaji: "hi",
    meaning: "Fire",
    characters: ["火"],
    characterMeanings: ["Fire"]
  },
  {
    id: "forest",
    text: "森",
    kana: "もり",
    romaji: "mori",
    meaning: "Forest",
    characters: ["森"],
    characterMeanings: ["Forest"]
  },
  {
    id: "cat",
    text: "猫",
    kana: "ねこ",
    romaji: "neko",
    meaning: "Cat",
    characters: ["猫"],
    characterMeanings: ["Cat"]
  },
  {
    id: "dog",
    text: "犬",
    kana: "いぬ",
    romaji: "inu",
    meaning: "Dog",
    characters: ["犬"],
    characterMeanings: ["Dog"]
  },
  {
    id: "bird",
    text: "鳥",
    kana: "とり",
    romaji: "tori",
    meaning: "Bird",
    characters: ["鳥"],
    characterMeanings: ["Bird"]
  },
  {
    id: "horse",
    text: "馬",
    kana: "うま",
    romaji: "uma",
    meaning: "Horse",
    characters: ["馬"],
    characterMeanings: ["Horse"]
  },
  {
    id: "cow",
    text: "牛",
    kana: "うし",
    romaji: "ushi",
    meaning: "Cow",
    characters: ["牛"],
    characterMeanings: ["Cow"]
  },
  {
    id: "lunch",
    text: "昼ご飯",
    kana: "ひるごはん",
    romaji: "hirugohan",
    meaning: "Lunch",
    characters: ["昼", "ご", "飯"],
    characterMeanings: ["Noon / day", "Honorific prefix", "Rice / meal"]
  },
  {
    id: "dinner",
    text: "晩ご飯",
    kana: "ばんごはん",
    romaji: "bangohan",
    meaning: "Dinner",
    characters: ["晩", "ご", "飯"],
    characterMeanings: ["Evening / night", "Honorific prefix", "Rice / meal"]
  },
  {
    id: "meat",
    text: "肉",
    kana: "にく",
    romaji: "niku",
    meaning: "Meat",
    characters: ["肉"],
    characterMeanings: ["Meat"]
  },
  {
    id: "vegetables",
    text: "野菜",
    kana: "やさい",
    romaji: "yasai",
    meaning: "Vegetables",
    characters: ["野", "菜"],
    characterMeanings: ["Field", "Vegetable / greens"]
  },
  {
    id: "fruit",
    text: "果物",
    kana: "くだもの",
    romaji: "kudamono",
    meaning: "Fruit",
    characters: ["果", "物"],
    characterMeanings: ["Fruit / result", "Thing"]
  },
  {
    id: "salt",
    text: "塩",
    kana: "しお",
    romaji: "shio",
    meaning: "Salt",
    characters: ["塩"],
    characterMeanings: ["Salt"]
  },
  {
    id: "alcohol",
    text: "お酒",
    kana: "おさけ",
    romaji: "osake",
    meaning: "Sake / alcohol",
    characters: ["お", "酒"],
    characterMeanings: ["Honorific prefix", "Alcohol / sake"]
  },
  {
    id: "sweets",
    text: "お菓子",
    kana: "おかし",
    romaji: "okashi",
    meaning: "Sweets / snack",
    characters: ["お", "菓", "子"],
    characterMeanings: ["Honorific prefix", "Confection / candy", "Child / item"]
  },
  {
    id: "japan",
    text: "日本",
    kana: "にほん",
    romaji: "nihon",
    meaning: "Japan",
    characters: ["日", "本"],
    characterMeanings: ["Sun / day", "Book / origin"]
  },
  {
    id: "book",
    text: "本",
    kana: "ほん",
    romaji: "hon",
    meaning: "Book",
    characters: ["本"],
    characterMeanings: ["Book / origin"]
  },
  {
    id: "car",
    text: "車",
    kana: "くるま",
    romaji: "kuruma",
    meaning: "Car",
    characters: ["車"],
    characterMeanings: ["Car / vehicle"]
  },
  {
    id: "train",
    text: "電車",
    kana: "でんしゃ",
    romaji: "densha",
    meaning: "Train",
    characters: ["電", "車"],
    characterMeanings: ["Electricity", "Car / vehicle"]
  },
  {
    id: "station",
    text: "駅",
    kana: "えき",
    romaji: "eki",
    meaning: "Station",
    characters: ["駅"],
    characterMeanings: ["Station"]
  },
  {
    id: "house",
    text: "家",
    kana: "いえ",
    romaji: "ie",
    meaning: "House / home",
    characters: ["家"],
    characterMeanings: ["House / home"]
  },
  {
    id: "school",
    text: "学校",
    kana: "がっこう",
    romaji: "gakkoo",
    meaning: "School",
    characters: ["学", "校"],
    characterMeanings: ["Study / learn", "School / exam"]
  },
  {
    id: "road",
    text: "道",
    kana: "みち",
    romaji: "michi",
    meaning: "Road / path",
    characters: ["道"],
    characterMeanings: ["Road / way"]
  },
  {
    id: "country",
    text: "国",
    kana: "くに",
    romaji: "kuni",
    meaning: "Country",
    characters: ["国"],
    characterMeanings: ["Country"]
  },
  {
    id: "shop",
    text: "店",
    kana: "みせ",
    romaji: "mise",
    meaning: "Shop / store",
    characters: ["店"],
    characterMeanings: ["Shop / store"]
  },
  {
    id: "room",
    text: "部屋",
    kana: "へや",
    romaji: "heya",
    meaning: "Room",
    characters: ["部", "屋"],
    characterMeanings: ["Section / part", "Room / roof"]
  },
  {
    id: "now",
    text: "今",
    kana: "いま",
    romaji: "ima",
    meaning: "Now",
    characters: ["今"],
    characterMeanings: ["Now / present"]
  },
  {
    id: "today",
    text: "今日",
    kana: "きょう",
    romaji: "kyoo",
    meaning: "Today",
    characters: ["今", "日"],
    characterMeanings: ["Now / present", "Day / sun"]
  },
  {
    id: "tomorrow",
    text: "明日",
    kana: "あした",
    romaji: "ashita",
    meaning: "Tomorrow",
    characters: ["明", "日"],
    characterMeanings: ["Bright / light", "Day / sun"]
  },
  {
    id: "yesterday",
    text: "昨日",
    kana: "きのう",
    romaji: "kinoo",
    meaning: "Yesterday",
    characters: ["昨", "日"],
    characterMeanings: ["Previous", "Day / sun"]
  },
  {
    id: "year",
    text: "年",
    kana: "とし",
    romaji: "toshi",
    meaning: "Year",
    characters: ["年"],
    characterMeanings: ["Year"]
  },
  {
    id: "spring",
    text: "春",
    kana: "はる",
    romaji: "haru",
    meaning: "Spring",
    characters: ["春"],
    characterMeanings: ["Spring"]
  },
  {
    id: "summer",
    text: "夏",
    kana: "なつ",
    romaji: "natsu",
    meaning: "Summer",
    characters: ["夏"],
    characterMeanings: ["Summer"]
  },
  {
    id: "autumn",
    text: "秋",
    kana: "あき",
    romaji: "aki",
    meaning: "Autumn",
    characters: ["秋"],
    characterMeanings: ["Autumn / fall"]
  },
  {
    id: "winter",
    text: "冬",
    kana: "ふゆ",
    romaji: "fuyu",
    meaning: "Winter",
    characters: ["冬"],
    characterMeanings: ["Winter"]
  },
  {
    id: "north",
    text: "北",
    kana: "きた",
    romaji: "kita",
    meaning: "North",
    characters: ["北"],
    characterMeanings: ["North"]
  },
  {
    id: "south",
    text: "南",
    kana: "みなみ",
    romaji: "minami",
    meaning: "South",
    characters: ["南"],
    characterMeanings: ["South"]
  },
  {
    id: "east",
    text: "東",
    kana: "ひがし",
    romaji: "higashi",
    meaning: "East",
    characters: ["東"],
    characterMeanings: ["East"]
  },
  {
    id: "west",
    text: "西",
    kana: "にし",
    romaji: "nishi",
    meaning: "West",
    characters: ["西"],
    characterMeanings: ["West"]
  },
  {
    id: "up",
    text: "上",
    kana: "うえ",
    romaji: "ue",
    meaning: "Up / above",
    characters: ["上"],
    characterMeanings: ["Up / above"]
  },
  {
    id: "down",
    text: "下",
    kana: "した",
    romaji: "shita",
    meaning: "Down / below",
    characters: ["下"],
    characterMeanings: ["Down / below"]
  },
  {
    id: "middle",
    text: "中",
    kana: "なか",
    romaji: "naka",
    meaning: "Inside / middle",
    characters: ["中"],
    characterMeanings: ["Inside / middle"]
  },
  {
    id: "red",
    text: "赤",
    kana: "あか",
    romaji: "aka",
    meaning: "Red",
    characters: ["赤"],
    characterMeanings: ["Red"]
  },
  {
    id: "blue",
    text: "青",
    kana: "あお",
    romaji: "ao",
    meaning: "Blue",
    characters: ["青"],
    characterMeanings: ["Blue"]
  },
  {
    id: "white",
    text: "白",
    kana: "しろ",
    romaji: "shiro",
    meaning: "White",
    characters: ["白"],
    characterMeanings: ["White"]
  },
  {
    id: "black",
    text: "黒",
    kana: "くろ",
    romaji: "kuro",
    meaning: "Black",
    characters: ["黒"],
    characterMeanings: ["Black"]
  },
  {
    id: "eat",
    text: "食べる",
    kana: "たべる",
    romaji: "taberu",
    meaning: "To eat",
    characters: ["食", "べ", "る"],
    characterMeanings: ["Eat / food", "Phonetic", "Phonetic"]
  },
  {
    id: "drink",
    text: "飲む",
    kana: "のむ",
    romaji: "nomu",
    meaning: "To drink",
    characters: ["飲", "む"],
    characterMeanings: ["Drink", "Phonetic"]
  },
  {
    id: "see",
    text: "見る",
    kana: "みる",
    romaji: "miru",
    meaning: "To see / watch",
    characters: ["見", "る"],
    characterMeanings: ["See / look", "Phonetic"]
  },
  {
    id: "write",
    text: "書く",
    kana: "かく",
    romaji: "kaku",
    meaning: "To write",
    characters: ["書", "く"],
    characterMeanings: ["Write", "Phonetic"]
  }
]

export default words
