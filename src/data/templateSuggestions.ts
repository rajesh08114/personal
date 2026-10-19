import type { TemplateId } from '@/types/birthday';

export interface TemplateSuggestionGroup {
  openings: string[];
  quotes: Array<{ text: string; author?: string }>;
  wishes: string[];
  surprises: string[];
  memoryCaptions: string[];
}

export const TEMPLATE_SUGGESTIONS: Record<string, TemplateSuggestionGroup> = {
  'birthday-edition': {
    openings: [
      'EXTRA! EXTRA! A Legend Is Born Today',
      'SPECIAL REPORT: Honoring an Extraordinary Life',
      'STOP THE PRESSES: The World Got Better on This Day',
      'FRONT PAGE CHRONICLE: Another Year of Excellence',
    ],
    quotes: [
      { text: 'The more you praise and celebrate your life, the more there is in life to celebrate.', author: 'Oprah Winfrey' },
      { text: 'Age is strictly a case of mind over matter. If you don’t mind, it doesn’t matter.', author: 'Mark Twain' },
      { text: 'We turn not older with years, but newer every day.', author: 'Emily Dickinson' },
      { text: 'Today you are you, that is truer than true. There is no one alive who is you-er than you.', author: 'Dr. Seuss' },
    ],
    wishes: [
      'May your headline always read: Happy, Healthy, and Unstoppable.',
      'Wishing you a front-page year packed with triumphs and good news.',
      'May the year ahead bring stories worth publishing forever.',
    ],
    surprises: [
      'Exclusive bulletin: you are cherished far more than any column could ever fit.',
      'Late edition scoop: every person in this room is endlessly proud of you.',
    ],
    memoryCaptions: [
      'The Archives: How it all started',
      'Breaking News: We laughed until we cried',
      'Front Page Material: Unforgettable milestone',
      'Exclusive Story: A day we will never forget',
    ],
  },
  'starry-night': {
    openings: [
      'Among billions of stars in the cosmos, you shine the brightest.',
      'Written in the celestial maps: Happy Birthday.',
      'Tonight, the universe aligns to celebrate you.',
      'A constellation drawn just for your journey.',
    ],
    quotes: [
      { text: 'Keep your eyes on the stars, and your feet on the ground.', author: 'Theodore Roosevelt' },
      { text: 'Dwell on the beauty of life. Watch the stars, and see yourself running with them.', author: 'Marcus Aurelius' },
      { text: 'Yours is the light by which my spirit’s born: you are my sun, my moon, and all my stars.', author: 'E.E. Cummings' },
      { text: 'We are all in the gutter, but some of us are looking at the stars.', author: 'Oscar Wilde' },
    ],
    wishes: [
      'May your year be as boundless, deep, and luminous as the galaxy.',
      'Wishing you a universe of wonder, peace, and dreams fulfilled.',
      'May every star in the sky tonight carry a wish straight to you.',
    ],
    surprises: [
      'In an infinite universe, meeting you was the greatest miracle of all.',
      'No telescope could ever measure the warmth you bring into our lives.',
    ],
    memoryCaptions: [
      'Under the Midnight Canopy',
      'Starlight, campfires, and deep talks',
      'A constellation of our favorite memories',
      'Dancing beneath the open night sky',
    ],
  },
  'polaroid-memories': {
    openings: [
      'Every snapshot tells a story, but you are my favorite chapter.',
      'Unboxing the memories: Happy Birthday to my favorite person!',
      'Frozen in time, cherished forever.',
      'A collection of spontaneous, golden moments with you.',
    ],
    quotes: [
      { text: 'We do not remember days, we remember moments.', author: 'Cesare Pavese' },
      { text: 'Photography takes an instant out of time, altering life by holding it still.', author: 'Dorothea Lange' },
      { text: 'A good friend knows all your best stories. A best friend has lived them with you.', author: 'Unknown' },
      { text: 'Life is like a camera. Focus on what’s important, capture the good times, and develop from the negatives.', author: 'Unknown' },
    ],
    wishes: [
      'Here is to another year of messy laughter, polaroid prints, and unforgettable road trips.',
      'May every day ahead give you something worth snapping and holding onto.',
      'Wishing you endless reasons to smile that real, candid smile.',
    ],
    surprises: [
      'The best pictures are the ones in our hearts that never fade.',
      'I wouldn’t trade a single second of our chaotic, wonderful memories.',
    ],
    memoryCaptions: [
      'The road trip where we got gloriously lost',
      'Midnight food run & uncontrollable giggles',
      'That candid photo that says everything',
      'Sunsets, salty hair, and endless freedom',
    ],
  },
  'cinematic-film': {
    openings: [
      'Roll camera, cue the music: Tonight’s feature is all about you.',
      'In the film of life, you are the leading star.',
      'A 35mm love letter to the most cinematic soul I know.',
      'Action! Celebrating another blockbuster year.',
    ],
    quotes: [
      { text: 'Cinema is a matter of what’s in the frame and what’s out.', author: 'Martin Scorsese' },
      { text: 'Life moves pretty fast. If you don’t stop and look around once in a while, you could miss it.', author: 'Ferris Bueller' },
      { text: 'Every story has a beginning, a middle, and an unexpected joy.', author: 'Unknown' },
      { text: 'To live would be an awfully big adventure.', author: 'J.M. Barrie' },
    ],
    wishes: [
      'May your next chapter be an Oscar-worthy masterpiece of love, laughter, and triumph.',
      'Wishing you widescreen adventures and Technicolor happiness all year.',
      'Here’s to the scenes yet unwritten and the grandest adventures ahead.',
    ],
    surprises: [
      'The credits will never roll on how deeply you are loved.',
      'You are the plot twist that made everything beautiful.',
    ],
    memoryCaptions: [
      'Scene 1: The Golden Hour Premier',
      'Behind the Scenes: Unfiltered joy',
      'The Montage: Adventures we never scripted',
      'Director’s Cut: Our wildest laughter',
    ],
  },
  'game-night': {
    openings: [
      'Player 01 has entered a brand new level!',
      'Achievement Unlocked: Legendary Birthday Celebration!',
      'Press Start: The greatest co-op adventure continues.',
      'High Score Alert: Celebrating an epic human today!',
    ],
    quotes: [
      { text: 'Life is more fun if you play games.', author: 'Roald Dahl' },
      { text: 'It’s dangerous to go alone! Take this birthday wish with you.', author: 'The Legend of Zelda' },
      { text: 'We don’t stop playing because we grow old; we grow old because we stop playing.', author: 'George Bernard Shaw' },
    ],
    wishes: [
      'Infinite health, maximum mana, and the greatest loot in the year ahead!',
      'May you conquer every boss battle with style, humor, and high scores.',
      'Wishing you critical hits on all your biggest dreams this year!',
    ],
    surprises: [
      'Bonus Round: You will always be my Player 2 for life.',
      'Easter Egg unlocked: You are simply the coolest friend in the game.',
    ],
    memoryCaptions: [
      'Level 01: The Tutorial Stage',
      'Co-op Mode: The Unstoppable Duo',
      'Side Quest: That chaotic spontaneous adventure',
      'Flawless Victory: The day we conquered the world',
    ],
  },
  'our-story': {
    openings: [
      'Every love story has a beginning, but ours is my absolute favorite.',
      'Happy birthday to the person who turned my world into poetry.',
      'From our very first conversation to forever: Happy Birthday.',
      'With you, every day feels like coming home.',
    ],
    quotes: [
      { text: 'I loved you yesterday, I love you still, I always have, I always will.', author: 'Elaine Davis' },
      { text: 'In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.', author: 'Maya Angelou' },
      { text: 'Whatever our souls are made of, his and mine are the same.', author: 'Emily Brontë' },
      { text: 'I would find you in any lifetime, in any universe, across every star.', author: 'Unknown' },
    ],
    wishes: [
      'Happy birthday to my partner, my best friend, and my whole heart.',
      'May this year bring you as much pure peace and laughter as you give me every day.',
      'Here is to a lifetime of kitchen dances, slow mornings, and growing old together.',
    ],
    surprises: [
      'I love you not only for who you are, but for who I am when I am with you.',
      'Choosing you every day is the easiest and happiest thing I will ever do.',
    ],
    memoryCaptions: [
      'The Day We Met: When the world shifted',
      'Our First Trip: Lost in translation, found in each other',
      'Dancing in the Kitchen: No music needed',
      'The Best Ordinary Day: Just you, me, and quiet joy',
    ],
  },
  'love-letter': {
    openings: [
      'I dipped my heart in ink to write this just for you.',
      'A quiet letter for the one who holds my heart.',
      'Unfolding these pages with all my love on your birthday.',
      'Some feelings are too deep for words, but I will try anyway.',
    ],
    quotes: [
      { text: 'You are my heart, my life, my one and only thought.', author: 'Arthur Conan Doyle' },
      { text: 'I wish you to know that you have been the last dream of my soul.', author: 'Charles Dickens' },
      { text: 'If I know what love is, it is because of you.', author: 'Hermann Hesse' },
    ],
    wishes: [
      'May your heart always feel the tenderness and depth of how much you are cherished.',
      'Wishing you a birthday wrapped in warmth, love, and sweet moments.',
      'May life be gentle with you, because you are so gentle with the world.',
    ],
    surprises: [
      'Every word here is true, but forever still won’t be long enough to say it all.',
      'You are my answered prayer and my sweetest reality.',
    ],
    memoryCaptions: [
      'A letter folded and kept close to the heart',
      'The afternoon we talked for six hours straight',
      'Walking hand-in-hand in the quiet rain',
      'A memory I will replay for the rest of my days',
    ],
  },
  'balloon-festival': {
    openings: [
      'The sky is not the limit—it’s where the celebration begins!',
      'Rising up into a joyful new year of life: Happy Birthday!',
      'Drifting on sunshine, happiness, and colorful dreams.',
    ],
    quotes: [
      { text: 'Live in the sunshine, swim in the sea, drink the wild air.', author: 'Ralph Waldo Emerson' },
      { text: 'The greatest adventure is what lies ahead.', author: 'J.R.R. Tolkien' },
    ],
    wishes: [
      'May your dreams soar as high and bright as festival balloons at sunrise.',
      'Wishing you uplifting lightness, warmth, and buoyant joy in every moment.',
    ],
    surprises: [
      'You lift up every single room you enter just by being your sunny self.',
    ],
    memoryCaptions: [
      'Chasing the sunrise across the hills',
      'Floating on pure happiness and laughter',
      'When the breeze took us on an adventure',
    ],
  },
  'coffee-memories': {
    openings: [
      'Your favorite table is waiting, and so is a warm birthday toast.',
      'To the slow mornings, deep chats, and the sweetest friendship.',
      'Brewed with love: Happy Birthday to my favorite soul!',
    ],
    quotes: [
      { text: 'Good coffee and good friends: the two greatest ingredients of a happy life.', author: 'Unknown' },
      { text: 'There are quiet moments in life that stay with us forever.', author: 'Unknown' },
    ],
    wishes: [
      'May your year ahead be as rich, comforting, and warm as your favorite roast.',
      'Wishing you peace of mind, delightful books, and quiet mornings of joy.',
    ],
    surprises: [
      'The warmest cup in the world can’t compare to having a friend like you.',
    ],
    memoryCaptions: [
      'Our corner table on a rainy autumn Sunday',
      'Five-hour conversations over cold lattes',
      'Where we solved all of life’s problems together',
    ],
  },
  'neon-party': {
    openings: [
      'The lights are up, the bass is dropping: Happy Birthday!',
      'Turning up the volume for an unforgettable milestone celebration!',
      'Electric vibes only: Happy Birthday, rockstar!',
    ],
    quotes: [
      { text: 'Never dim your light just because it’s too bright for others.', author: 'Unknown' },
      { text: 'Life should not only be lived, it should be celebrated.', author: 'Osho' },
    ],
    wishes: [
      'May your year ahead be illuminated with vibrant passion, energy, and wild success!',
      'Keep dancing, keep glowing, and never lose your spark.',
    ],
    surprises: [
      'Even in a city of neon, nobody lights up the night like you.',
    ],
    memoryCaptions: [
      'When the clock struck midnight',
      'Confetti, laser beams, and unstoppable dancing',
      'The party that none of us wanted to end',
    ],
  },
  'minimal-luxury': {
    openings: [
      'A refined tribute for an extraordinary milestone.',
      'Timeless elegance, effortless grace: Happy Birthday.',
      'An invitation to celebrate a truly remarkable journey.',
    ],
    quotes: [
      { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
      { text: 'Elegance is when the inside is as beautiful as the outside.', author: 'Coco Chanel' },
    ],
    wishes: [
      'Wishing you an illustrious year of health, distinction, and golden accomplishments.',
      'May the year ahead bring the peace, prosperity, and joy you so richly deserve.',
    ],
    surprises: [
      'Your kindness and quiet strength are your true luxury.',
    ],
    memoryCaptions: [
      'A toast to milestones and great company',
      'Elegance in every memory we share',
      'A celebration of timeless character',
    ],
  },
};

const DEFAULT_SUGGESTION: TemplateSuggestionGroup = {
  openings: [
    'Happy Birthday to someone who brings so much joy into the world!',
    'Celebrating you today and every day!',
    'Another year more wonderful, wiser, and brighter.',
  ],
  quotes: [
    { text: 'The secret of staying young is to live honestly, eat slowly, and lie about your age.', author: 'Lucille Ball' },
    { text: 'Count your age by friends, not years. Count your life by smiles, not tears.', author: 'John Lennon' },
    { text: 'Every year on your birthday, you get a chance to start new.', author: 'Sammy Hagar' },
  ],
  wishes: [
    'May this year bring you boundless happiness, health, and fulfillment.',
    'Wishing you all the joy your heart can hold, and then some!',
    'Here is to another fantastic revolution around the sun!',
  ],
  surprises: [
    'You are deeply loved, admired, and appreciated by everyone around you.',
    'No matter where life leads, I will always be cheering in your corner.',
  ],
  memoryCaptions: [
    'A memory that still makes me smile',
    'That spontaneous adventure we will never forget',
    'Proof that we make the greatest team',
    'Unfiltered laughter and pure joy',
  ],
};

export function getTemplateSuggestions(templateId?: TemplateId | string): TemplateSuggestionGroup {
  if (!templateId) return DEFAULT_SUGGESTION;
  return TEMPLATE_SUGGESTIONS[templateId] ?? DEFAULT_SUGGESTION;
}
