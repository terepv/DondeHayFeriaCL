import React from 'react';
import { ThemeSwitch } from './ThemeSwitch';

const LOGO_IMG_SIZE = { width: 52, height: 52 };

export const Header: React.FC = () => {
  return (
    <header className="bg-[#EDE7D6] dark:bg-slate-950">
      <div className="w-full px-4 md:px-6 pt-2 md:pt-3 pb-1.5 md:pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-5">
          <span
            className="inline-flex items-center flex-wrap gap-0 font-bold text-[1.75rem] leading-tight md:text-[2.5rem] lg:text-[3rem] xl:text-[65px] text-[#60867D] dark:text-[#60867D]"
            style={{ fontFamily: 'Chewy, cursive' }}
            aria-label="Dónde hay feria?"
          >
            DóNDE H
            <img
              src="/images/favicon.png"
              alt=""
              aria-hidden
              className="inline-block object-contain"
              width={LOGO_IMG_SIZE.width}
              height={LOGO_IMG_SIZE.height}
              style={{
                height: '0.82em',
                width: 'auto'
              }}
            />
            Y FERíA?
          </span>
          <div className="flex items-center justify-end md:flex-1">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </header>
  );
};

