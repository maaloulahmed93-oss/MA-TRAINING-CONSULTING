// Types for Freelancer Offers and Meetings in Admin Panel

export type OfferStatus = 'draft' | 'published' | 'archived';
export type OfferVisibility = 'all' | 'assigned';
export type ContractType = 'full-time' | 'part-time' | 'internship' | 'contract';
export type LocationType = 'remote' | 'hybrid' | 'onsite';
export type Seniority = 'junior' | 'mid' | 'senior';
export type Currency = 'EUR' | 'TND' | 'USD';

export interface FreelancerOffer {
  id: string;
  title: string;
  company: string;
  locationType: LocationType;
  locationText?: string;
  contractType: ContractType;
  seniority?: Seniority;
  salaryMin?: number;
  salaryMax?: number;
  currency?: Currency;
  workHours?: string;
  skills?: string[];
  description: string;
  requirements?: string[];
  benefits?: string[];
  applicationLink?: string;
  contactEmail?: string;
  deadline?: string; // ISO date
  visibility: OfferVisibility;
  assignedFreelancerIds?: string[];
  status: OfferStatus;
  tags?: string[];
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export type MeetingType = 'visio' | 'presentiel';
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';
export type MeetingOutcome = 'accepted' | 'rejected' | 'pending' | 'hired';

export interface MeetingAttachment { id: string; name: string; url: string; }
export interface MeetingReminder { minutesBefore: number; channel: 'email' | 'in-app'; }

export interface FreelancerMeeting {
  id: string;
  _id?: string; // MongoDB ObjectId
  subject: string;
  type: MeetingType;
  date: string;     // ISO yyyy-mm-dd
  startTime: string; // HH:mm
  endTime?: string;  // HH:mm
  timezone?: string;
  locationText?: string;
  meetingLink?: string;
  withWhom?: string;
  agenda?: string[];
  notes?: string;
  attachments?: MeetingAttachment[];
  organizerId?: string;
  participantFreelancerIds: string[];
  reminders?: MeetingReminder[];
  status: MeetingStatus;
  outcome?: MeetingOutcome;
  recordingLink?: string;
  createdAt: string;
  updatedAt: string;
}
