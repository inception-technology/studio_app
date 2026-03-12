// lib/redis.ts
import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL;
const token = process.env.KV_REST_API_TOKEN;

export const redis =
  url && token
    ? new Redis({
        url,
        token,
      })
    : null;
