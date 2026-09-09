import dns from 'node:dns';
import dotenv from 'dotenv';

dotenv.config();

// Prioritize IPv4 over unreachable IPv6 addresses to prevent proxy ETIMEDOUT errors
dns.setDefaultResultOrder('ipv4first');
