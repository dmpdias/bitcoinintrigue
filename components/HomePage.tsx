
import React, { useEffect, useState } from 'react';
import { Hero } from './Hero';
import { Features } from './Features';
import { Briefing } from './Briefing';
import { Testimonials } from './Testimonials';
import { MeetTheTeam } from './MeetTheTeam';
import { NewsletterCTA } from './NewsletterCTA';
import { storageService } from '../services/storageService';
import { BriefingData } from '../types';
import { BRIEFING_CONTENT } from '../constants';

export const HomePage: React.FC = () => {
  const [data, setData] = useState<BriefingData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const issue = await storageService.fetchPublishedIssue();
        // Fallback to static content if no issue is published yet (prevents empty section)
        setData(issue || BRIEFING_CONTENT);
      } catch (e) {
        console.error("Failed to load home page data", e);
        setData(BRIEFING_CONTENT);
      }
    };
    loadData();
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
