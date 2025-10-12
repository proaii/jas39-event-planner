export const unsplash_tool = async (query: string): Promise<string> => {
  // For demo purposes, we'll use a mock implementation
  // In a real app, this would make an API call to Unsplash
  const mockImages = [
    'https://images.unsplash.com/photo-1582192904915-d89c7250b235?w=1080',
    'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1080',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1080',
    'https://images.unsplash.com/photo-1486312338219-ce68e2c6b7d3?w=1080',
    'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1080'
  ];
  
  // Return a random image for demo
  const randomIndex = Math.floor(Math.random() * mockImages.length);
  return mockImages[randomIndex];
};