export const RECIPES: Record<string, string> = {
  'earth+water': 'clay',
  'air+earth': 'sand',
  'fire+water': 'steam',
  'air+fire': 'smoke',
  'fire+wood': 'ash',
  'earth+wood': 'seed',
  'air+water': 'cloud',
  'clay+fire': 'brick',
  'fire+sand': 'glass',
  'seed+water': 'plant',
  'smoke+water': 'fog',
  'cloud+fire': 'lightning',
  'air+clay': 'pottery',
  'ash+water': 'ink',
  'air+cloud': 'wind',
  'brick+wood': 'house',
  'air+glass': 'bubble',
  'fire+plant': 'charcoal',
  'lightning+sand': 'crystal',
  'lightning+wind': 'storm',
  'cloud+house': 'castle',
  'crystal+fire': 'gem',
  'cloud+gem': 'rainbow',
  'crystal+storm': 'mystic_crystal',
};

export function getRecipeKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}

export const RECIPE_INFO: Record<string, { ingredients: [string, string]; result: string }> =
  Object.entries(RECIPES).reduce((acc, [key, result]) => {
    const [a, b] = key.split('+');
    acc[key] = { ingredients: [a, b], result };
    return acc;
  }, {} as Record<string, { ingredients: [string, string]; result: string }>);
