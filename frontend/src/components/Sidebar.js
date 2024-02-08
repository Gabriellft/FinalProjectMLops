import React from 'react';
import { Link } from 'react-router-dom';
import { IoStatsChart, IoTime, IoCalendar, IoAnalytics } from 'react-icons/io5';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li><Link to="/"><IoTime /> Client Input</Link></li>
        <li><Link to="/predictions"><IoStatsChart /> Prédictions</Link></li>
        <li><Link to="/comparison"><IoAnalytics /> Comparaison</Link></li>
        <li><Link to="/historical"><IoCalendar /> Historique</Link></li>
      </ul>
    </nav>
  );
};

export default Sidebar;