import React from 'react';
import { Hero } from './Hero';
import { Features } from './Features';
import { Briefing } from './Briefing';
import { Testimonials } from './Testimonials';
import { MeetTheTeam } from './MeetTheTeam';
import { NewsletterCTA } from './NewsletterCTA';

export const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Features />
      <Briefing />
      <Testimonials />
      <MeetTheTeam />
      <NewsletterCTA />
    </>
  );
};