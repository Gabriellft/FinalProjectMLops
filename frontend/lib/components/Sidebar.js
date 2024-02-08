import React from 'react';
import { Link } from 'react-router-dom';
import { IoStatsChart, IoTime, IoCalendar, IoAnalytics } from 'react-icons/io5';
const Sidebar = () => {
  return /*#__PURE__*/React.createElement("nav", {
    className: "sidebar"
  }, "\xA0 \xA0 \xA0 ", /*#__PURE__*/React.createElement("ul", null, "\xA0 \xA0 \xA0 \xA0 ", /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/predictions"
  }, /*#__PURE__*/React.createElement(IoStatsChart, null), " Pr\xE9dictions")), "\xA0 \xA0 \xA0 \xA0 ", /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/predictions/chart"
  }, /*#__PURE__*/React.createElement(IoTime, null), " Graphique")), "\xA0 \xA0 \xA0 \xA0 ", /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/comparison"
  }, /*#__PURE__*/React.createElement(IoAnalytics, null), " Comparaison")), "\xA0 \xA0 \xA0 \xA0 ", /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/historical"
  }, /*#__PURE__*/React.createElement(IoCalendar, null), " Historique")), "\xA0 \xA0 \xA0 "), "\xA0 \xA0 ");
};
export default Sidebar;