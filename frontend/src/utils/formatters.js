// Format utilities for CampusIQ

export function formatGpa(gpa) {
  if (gpa === null || gpa === undefined) return '--';
  return Number(gpa).toFixed(2);
}

export function formatPercentage(rate) {
  if (rate === null || rate === undefined) return '--%';
  return `${Number(rate).toFixed(1)}%`;
}

export function getBranchName(branchCode) {
  switch (branchCode) {
    case '04':
      return 'Computer Science (CSE)';
    case '18':
      return 'AI & Machine Learning (AIML)';
    case '19':
      return 'Cybersecurity';
    default:
      return `Branch ${branchCode}`;
  }
}
