import { safeFetch } from "../utils/safeFetch";

export const fetchMessageHistory = async (channelId) => {
  return await safeFetch(
    `/api/v1/messages/channel/${channelId}?size=30`
  );
};