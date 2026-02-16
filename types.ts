export interface Story {
  id: string;
  category: string;
  headline: string;
  content: string[];
  image?: string;
  highlight?: boolean;
  intrigueTake?: string;
}

export interface BriefingData {
  date: string;
  issueNumber: number;
  intro: {
    headline: string;
    content: string;
  };
  stories: Story[];
}