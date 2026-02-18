
import React, { useEffect, useState } from 'react';
import { Hero } from './Hero';
import { Features } from './Features';
import { Briefing } from './Briefing';
import { Testimonials } from './Testimonials';
import { MeetTheTeam } from './MeetTheTeam';
import { NewsletterCTA } from './NewsletterCTA';
import { storageService } from '../services/storageService';
import { BriefingData } from '../types';

export const HomePage: React.FC = () => {
  const [data, setData] = useState<BriefingData | null>(null);

  useEffect(() => {
    setData(storageService.getPublishedIssue());
  }, []);

  return (
    <>
      <Hero />
      <Features />
      <Briefing data={data} />
      <Testimonials />
      <MeetTheTeam />
      <NewsletterCTA />
    </>
  );
};
