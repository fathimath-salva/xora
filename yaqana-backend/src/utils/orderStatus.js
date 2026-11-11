const transitions = Object.freeze({
  Confirmed: ['Processing', 'Cancelled'],
  Pending: ['Confirmed', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered', 'RTO'],
  Delivered: [],
  Cancelled: [],
  RTO: []
});

export const getAllowedOrderTransitions = (status) => [...(transitions[status] || [])];

export const isKnownOrderStatus = (status) => Object.hasOwn(transitions, status);

export const canTransitionOrderStatus = (currentStatus, nextStatus) => (
  currentStatus === nextStatus || transitions[currentStatus]?.includes(nextStatus) === true
);
