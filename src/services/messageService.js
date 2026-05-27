export const fetchMessageHistory = async (channelId) => {
  const response = await fetch(`/api/v1/messages/channel/${channelId}?size=30`);
  return response.ok ? await response.json() : [];
};