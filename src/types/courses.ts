export interface CourseModule {
  id: number;
  title: string;
  duration: string;
  url?: string; // Optional URL for the module content
}

export interface Course {
  id: string;
  title: string;
  description: string;
  url?: string;
  modules: CourseModule[];
}

export interface Domain {
  id: string;
  title: string;
  icon: string;
  description: string;
  courses: Course[];
}

export interface CoursesData {
  domains: Domain[];
  validAccessIds: string[];
}
