const utils = {
  /**
   * Calculate date N days ago in ISO format
   */
  getDateNDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  }
};

export { utils}