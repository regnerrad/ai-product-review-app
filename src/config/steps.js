export const STEPS = [
  'Category',
  'Product',
  'Question',
  'Review'
];

export const STEP_CONFIG = {
  1: {
    title: 'Select Category',
    description: 'Choose the type of product you\'re looking for',
    placeholder: 'e.g., Laptop, Smartphone, Headphones',
    field: 'category'
  },
  2: {
    title: 'Select Product',
    description: 'Choose the brand and model of the product',
    placeholder: '',
    field: 'product'
  },
  3: {
    title: 'Your Question',
    description: 'What would you like to know about this product?',
    placeholder: 'e.g., Is it good for gaming? Best for photography?',
    field: 'question'
  },
  4: {
    title: 'Review & Submit',
    description: 'Review your search criteria and submit',
    field: 'review'
  }
};