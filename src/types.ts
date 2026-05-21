export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string; // YYYY-MM-DD
  dod: string | null; // YYYY-MM-DD or null if alive
  photoUrl: string;
  bio: string;
  contactInfo?: string;
  timeline?: TimelineEvent[]; // List of events for the biography page
  gallery?: GalleryItem[]; // Photo/video media gallery
}


export interface Relationship {
  id: string;
  parentId?: string;  // references members.id
  childId?: string;   // references members.id
  spouseId1?: string; // references members.id (one partner)
  spouseId2?: string; // references members.id (the other partner)
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface GenerationNode {
  member: Member;
  spouse: Member | null;
  children: string[]; // ids of children
  level: number;
}
