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

// Mock data function to generate projects - Using predictable data to avoid hydration errors
function generateMockProjects(): Project[] {
  const staticProjects: Project[] = [
    {
      id: `project-1`,
      name: `品川マンション`,
      details: '12階建て商業ビル・外壁足場工事',
      status: '完了',
      createdAt: new Date('2024-11-15'),
      updatedAt: new Date('2024-11-18'),
      memo: `2024/11/15～2024/11/18 工事`,
      size: 145,
      assignedTo: '田中 太郎',
      schematic: 'apartment',
    },
    {
      id: `project-2`,
      name: `豊島区オフィスビル`,
      details: '7階建て集合住宅・修繕足場工事',
      status: '進行中',
      createdAt: new Date('2024-11-10'),
      updatedAt: new Date('2024-11-12'),
      memo: `2024/11/10～2024/11/12 工事`,
      size: 89,
      assignedTo: '田中 太郎',
      schematic: 'commercial',
    },
    {
      id: `project-3`,
      name: `新宿戸建住宅`,
      details: '大型物流倉庫・新築足場工事',
      status: '設計中',
      createdAt: new Date('2024-11-08'),
      updatedAt: new Date('2024-11-10'),
      memo: `2024/11/08～2024/11/10 工事`,
      size: 167,
      assignedTo: '田中 太郎',
      schematic: 'residential',
      imageSrc: 'https://images.pexels.com/photos/11001000/pexels-photo-11001000.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: `project-4`,
      name: `渋谷倉庫`,
      details: '3階建て住宅・部分足場工事',
      status: '下書き',
      createdAt: new Date('2024-11-05'),
      updatedAt: new Date('2024-11-07'),
      memo: `2024/11/05～2024/11/07 工事`,
      size: 201,
      assignedTo: '田中 太郎',
      schematic: 'industrial',
    },
    {
      id: `project-5`,
      name: `港区店舗`,
      details: '4階建て集合建築・全面足場工事',
      status: '完了',
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-11-04'),
      memo: `2024/11/01～2024/11/04 工事`,
      size: 112,
      assignedTo: '田中 太郎',
      schematic: 'commercial',
    },
    {
      id: `project-6`,
      name: `中野区工場`,
      details: '円形建築・特殊足場工事',
      status: '進行中',
      createdAt: new Date('2024-10-28'),
      updatedAt: new Date('2024-11-01'),
      memo: `2024/10/28～2024/11/01 工事`,
      size: 78,
      assignedTo: '田中 太郎',
      schematic: 'industrial',
      imageSrc: 'https://images.pexels.com/photos/11002000/pexels-photo-11002000.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: `project-7`,
      name: `世田谷文化施設`,
      details: '12階建て商業ビル・外壁足場工事',
      status: '設計中',
      createdAt: new Date('2024-10-25'),
      updatedAt: new Date('2024-10-28'),
      memo: `2024/10/25～2024/10/28 工事`,
      size: 134,
      assignedTo: '田中 太郎',
      schematic: 'commercial',
    },
    {
      id: `project-8`,
      name: `港区マンション`,
      details: '7階建て集合住宅・修繕足場工事',
      status: '完了',
      createdAt: new Date('2024-10-20'),
      updatedAt: new Date('2024-10-23'),
      memo: `2024/10/20～2024/10/23 工事`,
      size: 98,
      assignedTo: '田中 太郎',
      schematic: 'apartment',
      imageSrc: 'https://images.pexels.com/photos/11003000/pexels-photo-11003000.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];
  
  return staticProjects;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: generateMockProjects(),
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