export const CUSTOMER_STATUS_OPTIONS = ['active', 'blocked'];

export const getAdminOrderStatusOptions = (order) => {
  const statuses = [order?.orderStatus, ...(Array.isArray(order?.allowedNextStatuses) ? order.allowedNextStatuses : [])];
  return [...new Set(statuses.filter((status) => typeof status === 'string' && status))];
};
