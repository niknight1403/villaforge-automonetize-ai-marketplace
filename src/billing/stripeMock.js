const stripe = {
  subscriptionItems: {
    createUsageRecord: async (id, data) => {
      if (!id) throw new Error('Invalid subscription item ID');
      return { id: 'usage_record_mock', ...data };
    }
  }
};

module.exports = { stripe };