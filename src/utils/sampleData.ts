import type { Member, Relationship } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  // Generation 1 (Roots)
  {
    id: 'm1',
    firstName: 'Arthur',
    lastName: 'Pendragon',
    gender: 'Male',
    dob: '1938-04-12',
    dod: '2016-11-05',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Arthur was the patriarch of the family. A dedicated architect and community leader, he designed several landmarks in the city. He loved classical music, chess, and teaching his grandchildren the values of hard work and integrity.',
    contactInfo: 'arthur.p@heritage.com',
    timeline: [
      { id: 't1_1', year: '1938', title: 'Born in London', description: 'Born to Thomas and Alice Pendragon.' },
      { id: 't1_2', year: '1960', title: 'Graduated from Oxford', description: 'Earned a degree in Architecture with honors.' },
      { id: 't1_3', year: '1963', title: 'Married Gwendolyn', description: 'Began their lifelong partnership in Edinburgh.' },
      { id: 't1_4', year: '1975', title: 'Founded Pendragon & Sons', description: 'Established a community architecture firm.' },
      { id: 't1_5', year: '2016', title: 'Peaceful Departure', description: 'Passed away surrounded by family at age 78.' },
    ],
  },
  {
    id: 'm2',
    firstName: 'Gwendolyn',
    lastName: 'Pendragon',
    gender: 'Female',
    dob: '1941-09-18',
    dod: null,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    bio: 'Gwendolyn is a retired professor of English Literature. She is the matriarch of the family, known for her sharp wit, extensive library, and famous apple pies. She continues to host the family gatherings every Sunday.',
    contactInfo: 'gwen.pendragon@email.com',
    timeline: [
      { id: 't2_1', year: '1941', title: 'Born in Edinburgh', description: 'Born to Donald and Margaret Macleod.' },
      { id: 't2_2', year: '1963', title: 'Married Arthur', description: 'A beautiful autumn wedding.' },
      { id: 't2_3', year: '1982', title: 'Published Novel', description: 'Wrote her first historical fiction book, "The Castle Gates".' },
      { id: 't2_4', year: '1990', title: 'Head of Department', description: 'Appointed Chair of English Literature at the local university.' },
    ],
  },
  // Generation 2
  {
    id: 'm3',
    firstName: 'Edward',
    lastName: 'Pendragon',
    gender: 'Male',
    dob: '1965-07-22',
    dod: null,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Edward followed in his father\'s footsteps as an architect. He is a passionate environmentalist and designs sustainable green buildings. He enjoys hiking and landscape photography.',
    contactInfo: 'edward@pendragon-arch.com',
    timeline: [
      { id: 't3_1', year: '1965', title: 'Firstborn Son', description: 'Born to Arthur and Gwendolyn.' },
      { id: 't3_2', year: '1990', title: 'Joined the Firm', description: 'Partnered with his father at Pendragon & Sons.' },
      { id: 't3_3', year: '1992', title: 'Married Eleanor', description: 'An outdoor garden ceremony.' },
      { id: 't3_4', year: '2005', title: 'Green Design Award', description: 'Received national recognition for the eco-library project.' },
    ],
  },
  {
    id: 'm4',
    firstName: 'Eleanor',
    lastName: 'Pendragon',
    gender: 'Female',
    dob: '1968-11-03',
    dod: null,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    bio: 'Eleanor is a pediatrician who has dedicated her life to children\'s healthcare. She coordinates medical outreach programs and is an avid gardener, filling their home with orchids.',
    contactInfo: 'eleanor.p@medicalcare.org',
    timeline: [
      { id: 't4_1', year: '1968', title: 'Born in Bristol', description: 'Born to Dr. Richard and Mary Vance.' },
      { id: 't4_2', year: '1992', title: 'Married Edward', description: 'A warm summer celebration.' },
      { id: 't4_3', year: '1994', title: 'Medical Residency', description: 'Completed residency at Children\'s Hospital.' },
      { id: 't4_4', year: '2012', title: 'Outreach Founder', description: 'Established a mobile clinic service for rural youth.' },
    ],
  },
  {
    id: 'm5',
    firstName: 'Victoria',
    lastName: 'Sterling',
    gender: 'Female',
    dob: '1969-02-14',
    dod: null,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    bio: 'Victoria is a talented violinist who performs in the City Symphony. She is also a passionate music teacher, sharing her love of string instruments with children in underprivileged communities.',
    contactInfo: 'victoria.violin@symphony.org',
    timeline: [
      { id: 't5_1', year: '1969', title: 'Born in London', description: 'Daughter of Arthur and Gwendolyn.' },
      { id: 't5_2', year: '1989', title: 'Royal College of Music', description: 'Graduated with distinction.' },
      { id: 't5_3', year: '1994', title: 'Married William', description: 'A musical wedding with orchestra performance.' },
      { id: 't5_4', year: '2001', title: 'First Chair', description: 'Promoted to First Chair Violinist in the Symphony.' },
    ],
  },
  {
    id: 'm6',
    firstName: 'William',
    lastName: 'Sterling',
    gender: 'Male',
    dob: '1967-08-30',
    dod: null,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    bio: 'William is a software engineer and high-frequency systems architect. He loves running marathons, tinkering with vintage watches, and setting up smart-home tech.',
    contactInfo: 'william@sterling-systems.io',
    timeline: [
      { id: 't6_1', year: '1967', title: 'Born in York', description: 'Born to Alfred and Helen Sterling.' },
      { id: 't6_2', year: '1994', title: 'Married Victoria', description: 'United in York Minster.' },
      { id: 't6_3', year: '2010', title: 'Tech Startup Exit', description: 'Successfully sold his cloud computing startup.' },
    ],
  },
  {
    id: 'm7',
    firstName: 'Albert',
    lastName: 'Pendragon',
    gender: 'Male',
    dob: '1973-10-05',
    dod: '2012-05-14',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    bio: 'Albert was the youngest child of Arthur and Gwendolyn. A daring photojournalist, he traveled the world capturing stories from remote regions. He was adventurous, warm, and highly loved by his nieces and nephews.',
    timeline: [
      { id: 't7_1', year: '1973', title: 'Born in London', description: 'Youngest son of Arthur and Gwendolyn.' },
      { id: 't7_2', year: '1995', title: 'World Travel Begins', description: 'Took a gap year to backpack through South America.' },
      { id: 't7_3', year: '2008', title: 'Exhibition in Paris', description: 'Showcased his award-winning collection "Silent Voices".' },
      { id: 't7_4', year: '2012', title: 'Tragic Accident', description: 'Passed away in a climbing accident in Switzerland.' },
    ],
  },
  // Generation 3
  {
    id: 'm8',
    firstName: 'Thomas',
    lastName: 'Pendragon',
    gender: 'Male',
    dob: '1995-03-24',
    dod: null,
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
    bio: 'Thomas is a marine biologist. He spends half his year on research vessels studying coral reefs. He is an avid scuba diver and underwater videographer.',
    contactInfo: 'thomas.p@oceanresearch.org',
    timeline: [
      { id: 't8_1', year: '1995', title: 'Born to Edward & Eleanor', description: 'First grandchild of Arthur and Gwendolyn.' },
      { id: 't8_2', year: '2017', title: 'BSc Marine Science', description: 'Graduated from University of Miami.' },
      { id: 't8_3', year: '2021', title: 'Deep Sea Expedition', description: 'Spent 3 months on a research vessel in the Pacific.' },
    ],
  },
  {
    id: 'm9',
    firstName: 'Alice',
    lastName: 'Pendragon',
    gender: 'Female',
    dob: '1998-09-12',
    dod: null,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    bio: 'Alice is a freelance graphic designer and illustrator. She creates visual identities for indie game developers. She loves retro gaming, watercolor painting, and her cat, Pixel.',
    contactInfo: 'alice@pixelart-studios.com',
    timeline: [
      { id: 't9_1', year: '1998', title: 'Born to Edward & Eleanor', description: 'A creative child from the beginning.' },
      { id: 't9_2', year: '2020', title: 'Art Exhibition', description: 'Exhibited her digital prints at the Young Artists Showcase.' },
    ],
  },
  {
    id: 'm10',
    firstName: 'Charlotte',
    lastName: 'Sterling',
    gender: 'Female',
    dob: '1996-01-20',
    dod: null,
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Charlotte is a mechanical engineer working in aerospace design. She plays soccer in a local league and loves building remote-controlled aircraft.',
    contactInfo: 'charlotte.s@aerospace-tech.com',
    timeline: [
      { id: 't10_1', year: '1996', title: 'Born to Victoria & William', description: 'Brought joy to the winter season.' },
      { id: 't10_2', year: '2018', title: 'Aerospace Engineering Degree', description: 'Graduated first in her class.' },
      { id: 't10_3', year: '2022', title: 'Satellite Team Lead', description: 'Promoted to lead the structural design of a micro-satellite.' },
    ],
  },
  {
    id: 'm11',
    firstName: 'George',
    lastName: 'Sterling',
    gender: 'Male',
    dob: '2001-08-15',
    dod: null,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    bio: 'George is currently studying culinary arts. He aspires to become a pastry chef and open his own bakery, frequently practicing new recipes on Gwendolyn, who serves as his chief taste-tester.',
    contactInfo: 'george.sterling@culinary-academy.edu',
    timeline: [
      { id: 't11_1', year: '2001', title: 'Born to Victoria & William', description: 'A cheerful summer baby.' },
      { id: 't11_2', year: '2020', title: 'Entered Culinary Institute', description: 'Began professional training in pastry arts.' },
    ],
  },
];

export const INITIAL_RELATIONSHIPS: Relationship[] = [
  // Generation 1 Marriage
  { id: 'r1', spouseId1: 'm1', spouseId2: 'm2' },

  // Generation 1 Children
  { id: 'r2', parentId: 'm1', childId: 'm3' },
  { id: 'r3', parentId: 'm2', childId: 'm3' },

  { id: 'r4', parentId: 'm1', childId: 'm5' },
  { id: 'r5', parentId: 'm2', childId: 'm5' },

  { id: 'r6', parentId: 'm1', childId: 'm7' },
  { id: 'r7', parentId: 'm2', childId: 'm7' },

  // Generation 2 Marriages
  { id: 'r8', spouseId1: 'm3', spouseId2: 'm4' }, // Edward & Eleanor
  { id: 'r9', spouseId1: 'm5', spouseId2: 'm6' }, // Victoria & William

  // Edward & Eleanor Children
  { id: 'r10', parentId: 'm3', childId: 'm8' },
  { id: 'r11', parentId: 'm4', childId: 'm8' },

  { id: 'r12', parentId: 'm3', childId: 'm9' },
  { id: 'r13', parentId: 'm4', childId: 'm9' },

  // Victoria & William Children
  { id: 'r14', parentId: 'm5', childId: 'm10' },
  { id: 'r15', parentId: 'm6', childId: 'm10' },

  { id: 'r16', parentId: 'm5', childId: 'm11' },
  { id: 'r17', parentId: 'm6', childId: 'm11' },
];
