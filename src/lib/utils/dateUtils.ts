export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  
  try {
    // Parse the date string directly without creating Date objects to avoid timezone issues
    const parts = dateString.split('-');
    if (parts.length !== 3) {
      console.warn(`Invalid date format: ${dateString}`);
      return 'N/A';
    }
    
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    // Validate the parsed values
    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      console.warn(`Invalid date values: ${dateString}`);
      return 'N/A';
    }
    
    // Format as MM/DD/YYYY (US format)
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}; 