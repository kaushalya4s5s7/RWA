export const CATEGORY_ICONS = {
  'Real Estate': 'https://cdn-icons-png.flaticon.com/128/9202/9202660.png',
  'Invoices': 'https://cdn-icons-png.flaticon.com/128/4306/4306889.png',
  'Commodities': 'https://cdn-icons-png.flaticon.com/128/1420/1420998.png'
} as const;

export type CategoryType = keyof typeof CATEGORY_ICONS;
