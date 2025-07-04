export interface IBillingFrequency {
    value: string;
    label: string;
    priceSuffix: string;
  }
  
  export const BillingFrequency: IBillingFrequency[] = [
    { value: 'month', label: 'Monthly', priceSuffix: '/month' },
    { value: 'year', label: 'Annual', priceSuffix: '/month' },
  ];  