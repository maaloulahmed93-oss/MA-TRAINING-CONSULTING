export interface ProgramModule {
  id: string;
  title: string;
}

export interface ProgramSession {
  id: string;
  title: string;
  dateRange: string;
}

export interface Program {
  id: string;
  level: string;
  category: string;
  price: number;
  title: string;
  description: string;
  durationWeeks: number;
  maxStudents: number;
  sessionsPerYear: number;
  modules: ProgramModule[];
  sessions: ProgramSession[];
}
