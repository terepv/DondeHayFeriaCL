import React from 'react';
import footerContent from '../content/footer-content.html?raw';

export const Footer: React.FC = () => (
  <footer className="site-footer" dangerouslySetInnerHTML={{ __html: footerContent }} />
);
