import { create } from 'zustand';
import { format } from 'date-fns';

export type Project = {
  id: string;
  name: string;
  details: string;
  status: '完了' | '進行中' | '設計中' | '下書き';
  createdAt: Date;
  updatedAt: Date;
  memo: string;
  size: number;
  assignedTo: string;
  schematic: 'residential' | 'commercial' | 'industrial' | 'apartment';
  imageSrc?: string;
};

type SortOption = 'name' | 'updatedAt' | 'createdAt';

interface ProjectState {
  projects: Project[];
  searchQuery: string;
  sortBy: SortOption;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteProject: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (option: SortOption) => void;
  getSortedFilteredProjects: () => Project[];
}

// Mock data function to generate projects
function generateMockProjects(count: number): Project[] {
  const projects: Project[] = [];
  const buildingTypes = ['オフィスビル', 'マンション', '戸建住宅', '倉庫', '店舗', '工場', '文化施設'];
  const locations = ['新宿', '渋谷', '品川', '港区', '中野区', '豊島区', '世田谷'];
  const statuses: ('完了' | '進行中' | '設計中' | '下書き')[] = ['完了', '進行中', '設計中', '下書き'];
  const schematics: ('residential' | 'commercial' | 'industrial' | 'apartment')[] = 
    ['residential', 'commercial', 'industrial', 'apartment'];
  const details = [
    '12階建て商業ビル・外壁足場工事',
    '7階建て集合住宅・修繕足場工事',
    '大型物流倉庫・新築足場工事',
    '3階建て住宅・部分足場工事',
    '4階建て集合建築・全面足場工事',
    '円形建築・特殊足場工事',
  ];
  
  for (let i = 0; i < count; i++) {
    const buildingType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const schematic = schematics[Math.floor(Math.random() * schematics.length)];
    const detail = details[Math.floor(Math.random() * details.length)];
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
    
    const updatedDate = new Date(createdDate);
    updatedDate.setDate(updatedDate.getDate() + Math.floor(Math.random() * 5));
    
    const size = Math.floor(Math.random() * 200) + 30;
    
    projects.push({
      id: `project-${i + 1}`,
      name: `${location}${buildingType}`,
      details: detail,
      status,
      createdAt: createdDate,
      updatedAt: updatedDate,
      memo: `${format(createdDate, 'yyyy/MM/dd')}～${format(updatedDate, 'yyyy/MM/dd')} 工事`,
      size: size,
      assignedTo: '田中 太郎',
      schematic,
      imageSrc: i % 3 === 0 ? 
        `https://images.pexels.com/photos/${11000000 + i * 1000}/pexels-photo-${11000000 + i * 1000}.jpeg?auto=compress&cs=tinysrgb&w=400` : 
        undefined
    });
  }
  
  return projects;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: generateMockProjects(24),
  searchQuery: '',
  sortBy: 'updatedAt',
  
  addProject: (project) => set((state) => ({
    projects: [
      ...state.projects,
      {
        ...project,
        id: `project-${state.projects.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((project) => project.id !== id),
  })),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSortBy: (option) => set({ sortBy: option }),
  
  getSortedFilteredProjects: () => {
    const { projects, searchQuery, sortBy } = get();
    
    return projects
      .filter((project) => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.memo.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'createdAt') {
          return b.createdAt.getTime() - a.createdAt.getTime();
        } else {
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        }
      });
  },
}));