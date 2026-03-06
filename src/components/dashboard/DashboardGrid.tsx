'use client';

import React from 'react';
import { ChartCard } from './ChartCard';
import { ScoreCard } from './ScoreCard';
import { Sparkline } from './Sparkline';
import { BarChart } from './BarChart';
import { FillerWordsList } from './FillerWordsList';
import { NavigationStats } from './NavigationStats';
import { Tag } from '@/components/ui/Tag';

export const DashboardGrid: React.FC = () => {
  return (
    <section className="bg-bg-deep border-t border-border px-4 md:px-8 py-12 md:py-16">
      <div className="mb-8 md:mb-10">
        <div className="section-label">Analytics</div>
        <h2 className="section-title">
          Session <span className="text-cyan">Dashboard</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {/* Overall Score */}
        <ChartCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="chart-title">Session Score</div>
              <div className="chart-subtitle">Today · Interview Mode</div>
            </div>
            <Tag color="green">+12 pts</Tag>
          </div>
          <ScoreCard value={84} trend="+12%" />
        </ChartCard>

        {/* Speaking Pace Chart */}
        <ChartCard wide className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="chart-title">Speaking Pace Over Session</div>
              <div className="chart-subtitle">Words per minute · 4:32 session</div>
            </div>
            <Tag color="amber">Avg 148 WPM</Tag>
          </div>
          <Sparkline />
        </ChartCard>

        {/* Filler Words Breakdown */}
        <ChartCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="chart-title">Filler Words</div>
              <div className="chart-subtitle">12 total · Session</div>
            </div>
            <Tag color="amber">-30% vs avg</Tag>
          </div>
          <FillerWordsList />
        </ChartCard>

        {/* Performance History */}
        <ChartCard wide className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="chart-title">Performance History</div>
              <div className="chart-subtitle">Last 7 sessions</div>
            </div>
            <Tag color="green">Improving</Tag>
          </div>
          <BarChart />
        </ChartCard>

        {/* Navigation Stats */}
        <ChartCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="chart-title">Navigation Stats</div>
              <div className="chart-subtitle">Today&apos;s sessions</div>
            </div>
          </div>
          <NavigationStats />
        </ChartCard>
      </div>
    </section>
  );
}; 
