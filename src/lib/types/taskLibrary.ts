export interface Task {
  task: string;
  area: "Clarity" | "Engagement" | "Preparation" | "Support";
  stage: "Early" | "Mid" | "Late";
  zone: "Development" | "Balanced" | "Proficiency";
}

export const TASK_LIBRARY: Task[] = [
  {"task": "Explore 3 different career paths", "area": "Clarity", "stage": "Early", "zone": "Development"},
  {"task": "Attend a career exploration workshop", "area": "Clarity", "stage": "Early", "zone": "Balanced"},
  {"task": "Create a personal vision statement", "area": "Clarity", "stage": "Early", "zone": "Proficiency"},
  {"task": "Identify core interests and passions", "area": "Clarity", "stage": "Mid", "zone": "Development"},
  {"task": "Map skills to potential career paths", "area": "Clarity", "stage": "Mid", "zone": "Balanced"},
  {"task": "Draft a detailed career plan", "area": "Clarity", "stage": "Mid", "zone": "Proficiency"},
  {"task": "Review career goals and align with personal values", "area": "Clarity", "stage": "Late", "zone": "Development"},
  {"task": "Update professional roadmap with milestones", "area": "Clarity", "stage": "Late", "zone": "Balanced"},
  {"task": "Finalize long-term career strategy", "area": "Clarity", "stage": "Late", "zone": "Proficiency"},

  {"task": "Participate in an interest-based online forum", "area": "Engagement", "stage": "Early", "zone": "Development"},
  {"task": "Join a student club related to your interests", "area": "Engagement", "stage": "Early", "zone": "Balanced"},
  {"task": "Organize a small student event", "area": "Engagement", "stage": "Early", "zone": "Proficiency"},
  {"task": "Collaborate on a group project", "area": "Engagement", "stage": "Mid", "zone": "Development"},
  {"task": "Lead a small campus initiative", "area": "Engagement", "stage": "Mid", "zone": "Balanced"},
  {"task": "Host a workshop or seminar", "area": "Engagement", "stage": "Mid", "zone": "Proficiency"},
  {"task": "Volunteer for a community project", "area": "Engagement", "stage": "Late", "zone": "Development"},
  {"task": "Mentor younger students", "area": "Engagement", "stage": "Late", "zone": "Balanced"},
  {"task": "Coordinate a large-scale student event", "area": "Engagement", "stage": "Late", "zone": "Proficiency"},

  {"task": "Create a basic study plan", "area": "Preparation", "stage": "Early", "zone": "Development"},
  {"task": "Take a free online course on time management", "area": "Preparation", "stage": "Early", "zone": "Balanced"},
  {"task": "Build a basic LinkedIn profile", "area": "Preparation", "stage": "Early", "zone": "Proficiency"},
  {"task": "Develop a mid-term exam preparation schedule", "area": "Preparation", "stage": "Mid", "zone": "Development"},
  {"task": "Complete an online certification relevant to your career path", "area": "Preparation", "stage": "Mid", "zone": "Balanced"},
  {"task": "Build a professional portfolio", "area": "Preparation", "stage": "Mid", "zone": "Proficiency"},
  {"task": "Prepare for mock interviews", "area": "Preparation", "stage": "Late", "zone": "Development"},
  {"task": "Plan final-year projects strategically", "area": "Preparation", "stage": "Late", "zone": "Balanced"},
  {"task": "Refine professional portfolio and skills audit", "area": "Preparation", "stage": "Late", "zone": "Proficiency"},

  {"task": "Schedule a meeting with a mentor", "area": "Support", "stage": "Early", "zone": "Development"},
  {"task": "Participate in a peer study group", "area": "Support", "stage": "Early", "zone": "Balanced"},
  {"task": "Seek guidance from academic advisor", "area": "Support", "stage": "Early", "zone": "Proficiency"},
  {"task": "Request feedback on project work", "area": "Support", "stage": "Mid", "zone": "Development"},
  {"task": "Join a professional mentorship program", "area": "Support", "stage": "Mid", "zone": "Balanced"},
  {"task": "Engage with industry mentor for career advice", "area": "Support", "stage": "Mid", "zone": "Proficiency"},
  {"task": "Attend quarterly reflection with mentor", "area": "Support", "stage": "Late", "zone": "Development"},
  {"task": "Conduct peer feedback session", "area": "Support", "stage": "Late", "zone": "Balanced"},
  {"task": "Plan final career and skill reflections with advisor", "area": "Support", "stage": "Late", "zone": "Proficiency"}
];

