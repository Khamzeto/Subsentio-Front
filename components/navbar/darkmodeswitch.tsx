import React from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { Switch } from '@nextui-org/react';

export const DarkModeSwitch = () => {
  const { setTheme, resolvedTheme } = useNextTheme();
  return (
    <Switch
      onClick={e => e.stopPropagation()}
      isSelected={resolvedTheme === 'dark' ? true : false}
      onValueChange={e => setTheme(e ? 'dark' : 'light')}
    />
  );
};
