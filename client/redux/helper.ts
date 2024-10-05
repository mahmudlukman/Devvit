type EntityType = 'Answer' | 'Question' | 'Tags' | 'User';

export const getEntitiesFromResult = <T extends EntityType>(
  result: any,
  entityType: T
): Array<{ type: T, id: string | number }> => {
  if (Array.isArray(result)) {
    return result.map(({ id }) => ({ type: entityType, id }));
  }
  if (result && typeof result === 'object' && 'id' in result) {
    return [{ type: entityType, id: result.id }];
  }
  return [];
};

// Usage examples:
export const getAnswersFromResult = (result: any) => 
  getEntitiesFromResult(result, 'Answer');

export const getQuestionsFromResult = (result: any) => 
  getEntitiesFromResult(result, 'Question');

export const getTagsFromResult = (result: any) => 
  getEntitiesFromResult(result, 'Tags');

export const getUsersFromResult = (result: any) => 
  getEntitiesFromResult(result, 'User');